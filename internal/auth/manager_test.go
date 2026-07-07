package auth

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"
)

type stubHandler struct {
	mu       sync.Mutex
	device   func(w http.ResponseWriter, r *http.Request)
	token    func(w http.ResponseWriter, r *http.Request)
	validate func(w http.ResponseWriter, r *http.Request)
	revoke   func(w http.ResponseWriter, r *http.Request)
}

func (h *stubHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h.mu.Lock()
	defer h.mu.Unlock()

	switch r.URL.Path {
	case "/device":
		h.device(w, r)
	case "/token":
		h.token(w, r)
	case "/validate":
		h.validate(w, r)
	case "/revoke":
		h.revoke(w, r)
	default:
		http.Error(w, "not found", http.StatusNotFound)
	}
}

func newTestManager(t *testing.T, h *stubHandler) (*Manager, *httptest.Server) {
	t.Helper()

	server := httptest.NewServer(h)

	t.Cleanup(server.Close)

	mgr := NewManager(
		newMemoryStore(),
		WithBaseURL(server.URL),
		WithHTTPClient(server.Client()),
		WithClock(func() time.Time { return time.Unix(1000, 0) }),
		WithSleep(func(time.Duration) {}),
	)

	return mgr, server
}

type memoryStore struct {
	tokens TokenSet
	stored bool
}

func newMemoryStore() *memoryStore {
	return &memoryStore{}
}

func (m *memoryStore) Save(tokens TokenSet) error {
	m.tokens = tokens
	m.stored = true

	return nil
}

func (m *memoryStore) Load() (TokenSet, error) {
	if !m.stored {
		return TokenSet{}, ErrNoToken
	}

	return m.tokens, nil
}

func (m *memoryStore) Clear() error {
	m.tokens = TokenSet{}
	m.stored = false

	return nil
}

func TestRequestDeviceCode(t *testing.T) {
	h := &stubHandler{
		device: func(w http.ResponseWriter, r *http.Request) {
			if err := r.ParseForm(); err != nil {
				t.Errorf("parse form: %v", err)
			}

			if got := r.FormValue("client_id"); got != TwitchClientID {
				t.Errorf("client_id = %q, want %q", got, TwitchClientID)
			}

			if got := r.FormValue("scopes"); got != TwitchScope {
				t.Errorf("scopes = %q, want %q", got, TwitchScope)
			}

			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"device_code":"dev123","user_code":"ABCD-EFGH","verification_uri":"https://twitch.tv/activate","expires_in":1800,"interval":5}`))
		},
	}

	mgr, _ := newTestManager(t, h)

	dc, err := mgr.RequestDeviceCode(context.Background())

	if err != nil {
		t.Fatalf("RequestDeviceCode: %v", err)
	}

	if dc.DeviceCode != "dev123" {
		t.Errorf("DeviceCode = %q, want %q", dc.DeviceCode, "dev123")
	}

	if dc.UserCode != "ABCD-EFGH" {
		t.Errorf("UserCode = %q, want %q", dc.UserCode, "ABCD-EFGH")
	}

	if dc.VerificationURI != "https://twitch.tv/activate" {
		t.Errorf("VerificationURI = %q, want %q", dc.VerificationURI, "https://twitch.tv/activate")
	}

	if dc.ExpiresIn != 1800 {
		t.Errorf("ExpiresIn = %d, want %d", dc.ExpiresIn, 1800)
	}

	if dc.Interval != 5 {
		t.Errorf("Interval = %d, want %d", dc.Interval, 5)
	}
}

func TestPollForTokenPendingThenSuccess(t *testing.T) {
	calls := 0

	h := &stubHandler{
		token: func(w http.ResponseWriter, r *http.Request) {
			r.ParseForm()

			if got := r.FormValue("grant_type"); got != deviceGrantType {
				t.Errorf("grant_type = %q, want %q", got, deviceGrantType)
			}

			if got := r.FormValue("device_code"); got != "dev123" {
				t.Errorf("device_code = %q, want %q", got, "dev123")
			}

			calls++

			if calls < 3 {
				w.WriteHeader(http.StatusBadRequest)
				w.Write([]byte(`{"status":400,"message":"authorization_pending"}`))

				return
			}

			w.Write([]byte(`{"access_token":"at1","refresh_token":"rt1","expires_in":3600}`))
		},
	}

	mgr, _ := newTestManager(t, h)

	dc := DeviceCode{DeviceCode: "dev123", ExpiresIn: 1800, Interval: 1}

	tokens, err := mgr.PollForToken(context.Background(), dc)

	if err != nil {
		t.Fatalf("PollForToken: %v", err)
	}

	if tokens.AccessToken != "at1" {
		t.Errorf("AccessToken = %q, want %q", tokens.AccessToken, "at1")
	}

	if tokens.RefreshToken != "rt1" {
		t.Errorf("RefreshToken = %q, want %q", tokens.RefreshToken, "rt1")
	}

	wantExpiry := time.Unix(1000, 0).Add(3600 * time.Second)

	if !tokens.Expiry.Equal(wantExpiry) {
		t.Errorf("Expiry = %v, want %v", tokens.Expiry, wantExpiry)
	}

	if calls != 3 {
		t.Errorf("token endpoint called %d times, want 3", calls)
	}
}

func TestPollForTokenSlowDownThenSuccess(t *testing.T) {
	calls := 0

	h := &stubHandler{
		token: func(w http.ResponseWriter, r *http.Request) {
			calls++

			if calls == 1 {
				w.WriteHeader(http.StatusBadRequest)
				w.Write([]byte(`{"status":400,"message":"slow_down"}`))

				return
			}

			w.Write([]byte(`{"access_token":"at1","refresh_token":"rt1","expires_in":3600}`))
		},
	}

	mgr, _ := newTestManager(t, h)

	dc := DeviceCode{DeviceCode: "dev123", ExpiresIn: 1800, Interval: 1}

	tokens, err := mgr.PollForToken(context.Background(), dc)

	if err != nil {
		t.Fatalf("PollForToken: %v", err)
	}

	if tokens.AccessToken != "at1" {
		t.Errorf("AccessToken = %q, want %q", tokens.AccessToken, "at1")
	}
}

func TestPollForTokenExpiredReturnsError(t *testing.T) {
	h := &stubHandler{
		token: func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"status":400,"message":"expired_token"}`))
		},
	}

	mgr, _ := newTestManager(t, h)

	dc := DeviceCode{DeviceCode: "dev123", ExpiresIn: 1800, Interval: 1}

	_, err := mgr.PollForToken(context.Background(), dc)

	if err == nil {
		t.Fatal("expected error for expired token, got nil")
	}
}

func TestValidate(t *testing.T) {
	h := &stubHandler{
		validate: func(w http.ResponseWriter, r *http.Request) {
			if got := r.Header.Get("Authorization"); got != "OAuth at1" {
				t.Errorf("Authorization = %q, want %q", got, "OAuth at1")
			}

			w.Write([]byte(`{"login":"streamer","user_id":"42","expires_in":3600}`))
		},
	}

	mgr, _ := newTestManager(t, h)

	v, err := mgr.Validate(context.Background(), "at1")

	if err != nil {
		t.Fatalf("Validate: %v", err)
	}

	if v.Login != "streamer" {
		t.Errorf("Login = %q, want %q", v.Login, "streamer")
	}
}

func TestRefreshSuccessStoresTokens(t *testing.T) {
	h := &stubHandler{
		token: func(w http.ResponseWriter, r *http.Request) {
			r.ParseForm()

			if got := r.FormValue("grant_type"); got != refreshGrantType {
				t.Errorf("grant_type = %q, want %q", got, refreshGrantType)
			}

			if got := r.FormValue("refresh_token"); got != "rt-old" {
				t.Errorf("refresh_token = %q, want %q", got, "rt-old")
			}

			w.Write([]byte(`{"access_token":"at-new","refresh_token":"rt-new","expires_in":3600}`))
		},
	}

	store := newMemoryStore()

	store.Save(TokenSet{AccessToken: "at-old", RefreshToken: "rt-old", Expiry: time.Unix(500, 0)})

	server := httptest.NewServer(h)

	t.Cleanup(server.Close)

	mgr := NewManager(
		store,
		WithBaseURL(server.URL),
		WithHTTPClient(server.Client()),
		WithClock(func() time.Time { return time.Unix(1000, 0) }),
		WithSleep(func(time.Duration) {}),
	)

	tokens, err := mgr.Refresh(context.Background())

	if err != nil {
		t.Fatalf("Refresh: %v", err)
	}

	if tokens.AccessToken != "at-new" {
		t.Errorf("AccessToken = %q, want %q", tokens.AccessToken, "at-new")
	}

	if store.tokens.AccessToken != "at-new" {
		t.Errorf("stored AccessToken = %q, want %q", store.tokens.AccessToken, "at-new")
	}

	if store.tokens.RefreshToken != "rt-new" {
		t.Errorf("stored RefreshToken = %q, want %q", store.tokens.RefreshToken, "rt-new")
	}
}

func TestRefreshInvalidGrantClearsTokens(t *testing.T) {
	h := &stubHandler{
		token: func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"status":400,"message":"invalid_grant"}`))
		},
	}

	store := newMemoryStore()

	store.Save(TokenSet{AccessToken: "at-old", RefreshToken: "rt-old"})

	server := httptest.NewServer(h)

	t.Cleanup(server.Close)

	mgr := NewManager(
		store,
		WithBaseURL(server.URL),
		WithHTTPClient(server.Client()),
		WithClock(func() time.Time { return time.Unix(1000, 0) }),
		WithSleep(func(time.Duration) {}),
	)

	_, err := mgr.Refresh(context.Background())

	if !errors.Is(err, ErrInvalidGrant) {
		t.Fatalf("Refresh error = %v, want ErrInvalidGrant", err)
	}

	if _, loadErr := store.Load(); !errors.Is(loadErr, ErrNoToken) {
		t.Errorf("store not cleared: load error = %v, want ErrNoToken", loadErr)
	}
}

func TestRefreshBadRequestClearsTokens(t *testing.T) {
	h := &stubHandler{
		token: func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"error":"Bad Request","status":400,"message":"Invalid refresh token"}`))
		},
	}

	store := newMemoryStore()

	store.Save(TokenSet{AccessToken: "at-old", RefreshToken: "rt-old"})

	server := httptest.NewServer(h)

	t.Cleanup(server.Close)

	mgr := NewManager(
		store,
		WithBaseURL(server.URL),
		WithHTTPClient(server.Client()),
		WithClock(func() time.Time { return time.Unix(1000, 0) }),
		WithSleep(func(time.Duration) {}),
	)

	mgr.setLoggedIn(TokenSet{AccessToken: "at-old", RefreshToken: "rt-old"}, "streamer")

	_, err := mgr.Refresh(context.Background())

	if !errors.Is(err, ErrInvalidGrant) {
		t.Fatalf("Refresh error = %v, want ErrInvalidGrant", err)
	}

	if _, loadErr := store.Load(); !errors.Is(loadErr, ErrNoToken) {
		t.Errorf("store not cleared: load error = %v, want ErrNoToken", loadErr)
	}

	if mgr.LoggedIn() {
		t.Error("expected LoggedIn to be false after invalid refresh grant")
	}

	if mgr.CurrentLogin() != "" {
		t.Errorf("CurrentLogin = %q, want empty after invalid refresh grant", mgr.CurrentLogin())
	}
}

func TestCompleteDeviceLoginStoresTokensAndLogin(t *testing.T) {
	h := &stubHandler{
		token: func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`{"access_token":"at1","refresh_token":"rt1","expires_in":3600}`))
		},
		validate: func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`{"login":"streamer","user_id":"42","expires_in":3600}`))
		},
	}

	mgr, _ := newTestManager(t, h)

	dc := DeviceCode{DeviceCode: "dev123", ExpiresIn: 1800, Interval: 1}

	login, err := mgr.CompleteDeviceLogin(context.Background(), dc)

	if err != nil {
		t.Fatalf("CompleteDeviceLogin: %v", err)
	}

	if login != "streamer" {
		t.Errorf("login = %q, want %q", login, "streamer")
	}

	if !mgr.LoggedIn() {
		t.Error("expected LoggedIn to be true")
	}

	if mgr.CurrentLogin() != "streamer" {
		t.Errorf("CurrentLogin = %q, want %q", mgr.CurrentLogin(), "streamer")
	}
}

func TestAccessTokenRefreshesBeforeExpiry(t *testing.T) {
	refreshed := false

	h := &stubHandler{
		token: func(w http.ResponseWriter, r *http.Request) {
			refreshed = true

			w.Write([]byte(`{"access_token":"at-new","refresh_token":"rt-new","expires_in":3600}`))
		},
	}

	store := newMemoryStore()

	store.Save(TokenSet{AccessToken: "at-old", RefreshToken: "rt-old", Expiry: time.Unix(1000, 0).Add(time.Minute)})

	server := httptest.NewServer(h)

	t.Cleanup(server.Close)

	mgr := NewManager(
		store,
		WithBaseURL(server.URL),
		WithHTTPClient(server.Client()),
		WithClock(func() time.Time { return time.Unix(1000, 0) }),
		WithSleep(func(time.Duration) {}),
	)

	token, err := mgr.AccessToken(context.Background())

	if err != nil {
		t.Fatalf("AccessToken: %v", err)
	}

	if !refreshed {
		t.Error("expected proactive refresh, token endpoint not called")
	}

	if token != "at-new" {
		t.Errorf("token = %q, want %q", token, "at-new")
	}
}

func TestAccessTokenReturnsValidTokenWithoutRefresh(t *testing.T) {
	h := &stubHandler{
		token: func(w http.ResponseWriter, r *http.Request) {
			t.Error("token endpoint should not be called for a valid token")
		},
	}

	store := newMemoryStore()

	store.Save(TokenSet{AccessToken: "at-valid", RefreshToken: "rt", Expiry: time.Unix(1000, 0).Add(time.Hour)})

	server := httptest.NewServer(h)

	t.Cleanup(server.Close)

	mgr := NewManager(
		store,
		WithBaseURL(server.URL),
		WithHTTPClient(server.Client()),
		WithClock(func() time.Time { return time.Unix(1000, 0) }),
		WithSleep(func(time.Duration) {}),
	)

	token, err := mgr.AccessToken(context.Background())

	if err != nil {
		t.Fatalf("AccessToken: %v", err)
	}

	if token != "at-valid" {
		t.Errorf("token = %q, want %q", token, "at-valid")
	}
}

func TestLogoutRevokesAndClears(t *testing.T) {
	revoked := false

	h := &stubHandler{
		revoke: func(w http.ResponseWriter, r *http.Request) {
			r.ParseForm()

			if got := r.FormValue("token"); got != "at1" {
				t.Errorf("revoked token = %q, want %q", got, "at1")
			}

			revoked = true
		},
	}

	store := newMemoryStore()

	store.Save(TokenSet{AccessToken: "at1", RefreshToken: "rt1", Expiry: time.Unix(1000, 0).Add(time.Hour)})

	server := httptest.NewServer(h)

	t.Cleanup(server.Close)

	mgr := NewManager(
		store,
		WithBaseURL(server.URL),
		WithHTTPClient(server.Client()),
		WithClock(func() time.Time { return time.Unix(1000, 0) }),
		WithSleep(func(time.Duration) {}),
	)

	if err := mgr.Logout(context.Background()); err != nil {
		t.Fatalf("Logout: %v", err)
	}

	if !revoked {
		t.Error("expected token to be revoked")
	}

	if _, loadErr := store.Load(); !errors.Is(loadErr, ErrNoToken) {
		t.Errorf("store not cleared: load error = %v, want ErrNoToken", loadErr)
	}

	if mgr.LoggedIn() {
		t.Error("expected LoggedIn to be false after logout")
	}
}

func TestRestoreRefreshesAndValidates(t *testing.T) {
	h := &stubHandler{
		token: func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`{"access_token":"at-new","refresh_token":"rt-new","expires_in":3600}`))
		},
		validate: func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`{"login":"streamer","user_id":"42","expires_in":3600}`))
		},
	}

	store := newMemoryStore()

	store.Save(TokenSet{AccessToken: "at-old", RefreshToken: "rt-old", Expiry: time.Unix(1000, 0).Add(time.Minute)})

	server := httptest.NewServer(h)

	t.Cleanup(server.Close)

	mgr := NewManager(
		store,
		WithBaseURL(server.URL),
		WithHTTPClient(server.Client()),
		WithClock(func() time.Time { return time.Unix(1000, 0) }),
		WithSleep(func(time.Duration) {}),
	)

	login, err := mgr.Restore(context.Background())

	if err != nil {
		t.Fatalf("Restore: %v", err)
	}

	if login != "streamer" {
		t.Errorf("login = %q, want %q", login, "streamer")
	}

	if !mgr.LoggedIn() {
		t.Error("expected LoggedIn to be true after restore")
	}
}

func TestRestoreWithNoTokenReturnsErrNoToken(t *testing.T) {
	mgr, _ := newTestManager(t, &stubHandler{})

	_, err := mgr.Restore(context.Background())

	if !errors.Is(err, ErrNoToken) {
		t.Fatalf("Restore error = %v, want ErrNoToken", err)
	}
}
