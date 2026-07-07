package main

import (
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"ghost-chat/internal/auth"
	"ghost-chat/internal/config"

	"github.com/zalando/go-keyring"
)

type stubHandler struct {
	device   func(w http.ResponseWriter, r *http.Request)
	token    func(w http.ResponseWriter, r *http.Request)
	validate func(w http.ResponseWriter, r *http.Request)
	revoke   func(w http.ResponseWriter, r *http.Request)
}

func (h *stubHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
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

func TestUpdateConfigPreservesTwitchAccount(t *testing.T) {
	dir := t.TempDir()

	cfg := &config.Config{}
	cfg.Twitch.Account.Login = "streamer"

	a := NewApp(cfg, filepath.Join(dir, "config.json"), "test")

	incoming := &config.Config{}
	incoming.Twitch.Account.Login = ""

	if err := a.UpdateConfig(incoming); err != nil {
		t.Fatalf("UpdateConfig: %v", err)
	}

	if got := a.config.Twitch.Account.Login; got != "streamer" {
		t.Errorf("login = %q, want %q (client must not clobber server-owned login)", got, "streamer")
	}
}

func TestConfigWritesAreRaceFree(t *testing.T) {
	dir := t.TempDir()

	cfg := &config.Config{}
	cfg.Twitch.Account.Login = "streamer"

	a := NewApp(cfg, filepath.Join(dir, "config.json"), "test")

	var wg sync.WaitGroup

	wg.Add(3)

	go func() {
		defer wg.Done()

		for range 100 {
			if err := a.persistTwitchLogin("streamer"); err != nil {
				t.Errorf("persistTwitchLogin: %v", err)
			}
		}
	}()

	go func() {
		defer wg.Done()

		for range 100 {
			incoming := &config.Config{}

			if err := a.UpdateConfig(incoming); err != nil {
				t.Errorf("UpdateConfig: %v", err)
			}
		}
	}()

	go func() {
		defer wg.Done()

		for range 100 {
			a.GetConfig()
		}
	}()

	wg.Wait()

	if got := a.config.Twitch.Account.Login; got != "streamer" {
		t.Errorf("login clobbered: got %q, want %q", got, "streamer")
	}
}

func TestTwitchAuthStatusReflectsManager(t *testing.T) {
	dir := t.TempDir()

	cfg := &config.Config{}

	a := NewApp(cfg, filepath.Join(dir, "config.json"), "test")

	status, err := a.TwitchAuthStatus()

	if err != nil {
		t.Fatalf("TwitchAuthStatus: %v", err)
	}

	if status.LoggedIn {
		t.Error("expected LoggedIn to be false before login")
	}
}

func TestTwitchStartLoginEmitsPendingAndSuccess(t *testing.T) {
	h := &stubHandler{
		device: func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`{"device_code":"dev123","user_code":"ABCD-EFGH","verification_uri":"https://twitch.tv/activate","expires_in":1800,"interval":1}`))
		},
		token: func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`{"access_token":"at1","refresh_token":"rt1","expires_in":3600}`))
		},
		validate: func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`{"login":"streamer","user_id":"42","expires_in":3600}`))
		},
	}

	keyring.MockInit()

	server := httptest.NewServer(h)

	t.Cleanup(server.Close)

	dir := t.TempDir()

	cfg := &config.Config{}

	a := NewApp(cfg, filepath.Join(dir, "config.json"), "test")

	a.auth = auth.NewManager(
		auth.NewKeychainTokenStore(),
		auth.WithBaseURL(server.URL),
		auth.WithHTTPClient(server.Client()),
		auth.WithClock(func() time.Time { return time.Unix(1000, 0) }),
		auth.WithSleep(func(time.Duration) {}),
	)

	var mu sync.Mutex
	records := map[string]any{}

	a.emit = func(event string, data any) {
		mu.Lock()
		defer mu.Unlock()

		records[event] = data
	}

	if err := a.TwitchStartLogin(); err != nil {
		t.Fatalf("TwitchStartLogin: %v", err)
	}

	deadline := time.Now().Add(2 * time.Second)

	for time.Now().Before(deadline) {
		mu.Lock()
		_, ok := records["twitch:auth:success"]
		mu.Unlock()

		if ok {
			break
		}

		time.Sleep(10 * time.Millisecond)
	}

	mu.Lock()
	defer mu.Unlock()

	if _, ok := records["twitch:auth:pending"]; !ok {
		t.Error("expected twitch:auth:pending event")
	}

	success, ok := records["twitch:auth:success"]

	if !ok {
		t.Fatal("expected twitch:auth:success event")
	}

	data, ok := success.(authSuccessData)

	if !ok {
		t.Fatalf("success data is %T, want authSuccessData", success)
	}

	if data.Login != "streamer" {
		t.Errorf("success login = %q, want %q", data.Login, "streamer")
	}

	if a.config.Twitch.Account.Login != "streamer" {
		t.Errorf("persisted login = %q, want %q", a.config.Twitch.Account.Login, "streamer")
	}
}

func TestTwitchStartLoginIgnoresConcurrentStart(t *testing.T) {
	keyring.MockInit()

	release := make(chan struct{})

	var releaseOnce sync.Once

	closeRelease := func() {
		releaseOnce.Do(func() { close(release) })
	}

	var deviceCount int32

	h := &stubHandler{
		device: func(w http.ResponseWriter, r *http.Request) {
			atomic.AddInt32(&deviceCount, 1)

			w.Write([]byte(`{"device_code":"dev123","user_code":"ABCD-EFGH","verification_uri":"https://twitch.tv/activate","expires_in":1800,"interval":1}`))
		},
		token: func(w http.ResponseWriter, r *http.Request) {
			<-release

			w.Write([]byte(`{"access_token":"at1","refresh_token":"rt1","expires_in":3600}`))
		},
		validate: func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`{"login":"streamer","user_id":"42","expires_in":3600}`))
		},
	}

	server := httptest.NewServer(h)

	t.Cleanup(server.Close)
	t.Cleanup(closeRelease)

	dir := t.TempDir()

	cfg := &config.Config{}

	a := NewApp(cfg, filepath.Join(dir, "config.json"), "test")

	a.auth = auth.NewManager(
		auth.NewKeychainTokenStore(),
		auth.WithBaseURL(server.URL),
		auth.WithHTTPClient(server.Client()),
		auth.WithClock(func() time.Time { return time.Unix(1000, 0) }),
		auth.WithSleep(func(time.Duration) {}),
	)

	var successOnce sync.Once

	done := make(chan struct{})

	a.emit = func(event string, data any) {
		if event == "twitch:auth:success" {
			successOnce.Do(func() { close(done) })
		}
	}

	if err := a.TwitchStartLogin(); err != nil {
		t.Fatalf("first TwitchStartLogin: %v", err)
	}

	if err := a.TwitchStartLogin(); err != nil {
		t.Fatalf("second TwitchStartLogin: %v", err)
	}

	if got := atomic.LoadInt32(&deviceCount); got != 1 {
		t.Fatalf("device code requested %d times, want 1 (second concurrent login must be a no-op)", got)
	}

	closeRelease()

	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("login did not complete")
	}
}
