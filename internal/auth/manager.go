package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

const (
	TwitchClientID = "0admd395pt3htwaqyk1ozziak7ci4b"
	TwitchScope    = "channel:read:redemptions"

	defaultBaseURL   = "https://id.twitch.tv/oauth2"
	deviceGrantType  = "urn:ietf:params:oauth:grant-type:device_code"
	refreshGrantType = "refresh_token"
	refreshThreshold = 5 * time.Minute
)

var ErrInvalidGrant = errors.New("invalid grant")

type httpDoer interface {
	Do(req *http.Request) (*http.Response, error)
}

type DeviceCode struct {
	DeviceCode      string `json:"device_code"`
	UserCode        string `json:"user_code"`
	VerificationURI string `json:"verification_uri"`
	ExpiresIn       int    `json:"expires_in"`
	Interval        int    `json:"interval"`
}

type Validation struct {
	Login     string `json:"login"`
	UserID    string `json:"user_id"`
	ExpiresIn int    `json:"expires_in"`
}

type Manager struct {
	store  TokenStore
	client httpDoer
	base   string
	now    func() time.Time
	sleep  func(time.Duration)

	mu       sync.Mutex
	tokens   TokenSet
	login    string
	loggedIn bool
}

type Option func(*Manager)

func WithHTTPClient(c httpDoer) Option {
	return func(m *Manager) {
		m.client = c
	}
}

func WithBaseURL(base string) Option {
	return func(m *Manager) {
		m.base = strings.TrimRight(base, "/")
	}
}

func WithClock(now func() time.Time) Option {
	return func(m *Manager) {
		m.now = now
	}
}

func WithSleep(sleep func(time.Duration)) Option {
	return func(m *Manager) {
		m.sleep = sleep
	}
}

func NewManager(store TokenStore, opts ...Option) *Manager {
	m := &Manager{
		store:  store,
		client: http.DefaultClient,
		base:   defaultBaseURL,
		now:    time.Now,
		sleep:  time.Sleep,
	}

	for _, opt := range opts {
		opt(m)
	}

	return m
}

func (m *Manager) RequestDeviceCode(ctx context.Context) (DeviceCode, error) {
	form := url.Values{}

	form.Set("client_id", TwitchClientID)
	form.Set("scopes", TwitchScope)

	resp, err := m.postForm(ctx, "/device", form)

	if err != nil {
		return DeviceCode{}, fmt.Errorf("request device code: %w", err)
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return DeviceCode{}, fmt.Errorf("read device code response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return DeviceCode{}, fmt.Errorf("request device code: unexpected status %d", resp.StatusCode)
	}

	var dc DeviceCode

	if err = json.Unmarshal(body, &dc); err != nil {
		return DeviceCode{}, fmt.Errorf("decode device code response: %w", err)
	}

	return dc, nil
}

type tokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	Status       int    `json:"status"`
	Message      string `json:"message"`
	Error        string `json:"error"`
}

func (m *Manager) PollForToken(ctx context.Context, dc DeviceCode) (TokenSet, error) {
	interval := dc.Interval

	if interval <= 0 {
		interval = 5
	}

	deadline := m.now().Add(time.Duration(dc.ExpiresIn) * time.Second)

	for {
		m.sleep(time.Duration(interval) * time.Second)

		form := url.Values{}

		form.Set("client_id", TwitchClientID)
		form.Set("scopes", TwitchScope)
		form.Set("device_code", dc.DeviceCode)
		form.Set("grant_type", deviceGrantType)

		resp, err := m.postForm(ctx, "/token", form)

		if err != nil {
			return TokenSet{}, fmt.Errorf("poll for token: %w", err)
		}

		tr, err := decodeTokenResponse(resp)

		if err != nil {
			return TokenSet{}, err
		}

		if tr.AccessToken != "" {
			return m.tokensFrom(tr), nil
		}

		reason := tr.reason()

		switch reason {
		case "authorization_pending":
		case "slow_down":
			interval += 5
		default:
			return TokenSet{}, fmt.Errorf("poll for token: %s", reason)
		}

		if !m.now().Before(deadline) {
			return TokenSet{}, fmt.Errorf("poll for token: device code expired")
		}
	}
}

func (m *Manager) Validate(ctx context.Context, accessToken string) (Validation, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, m.base+"/validate", nil)

	if err != nil {
		return Validation{}, err
	}

	req.Header.Set("Authorization", "OAuth "+accessToken)

	resp, err := m.client.Do(req)

	if err != nil {
		return Validation{}, fmt.Errorf("validate token: %w", err)
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return Validation{}, fmt.Errorf("read validate response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return Validation{}, fmt.Errorf("validate token: unexpected status %d", resp.StatusCode)
	}

	var v Validation

	if err = json.Unmarshal(body, &v); err != nil {
		return Validation{}, fmt.Errorf("decode validate response: %w", err)
	}

	return v, nil
}

func (m *Manager) Refresh(ctx context.Context) (TokenSet, error) {
	stored, err := m.store.Load()

	if err != nil {
		return TokenSet{}, err
	}

	form := url.Values{}

	form.Set("client_id", TwitchClientID)
	form.Set("grant_type", refreshGrantType)
	form.Set("refresh_token", stored.RefreshToken)

	resp, err := m.postForm(ctx, "/token", form)

	if err != nil {
		return TokenSet{}, fmt.Errorf("refresh token: %w", err)
	}

	status := resp.StatusCode

	tr, err := decodeTokenResponse(resp)

	if err != nil {
		return TokenSet{}, err
	}

	if status >= 400 && status < 500 {
		m.clearState()

		return TokenSet{}, ErrInvalidGrant
	}

	if tr.AccessToken == "" {
		return TokenSet{}, fmt.Errorf("refresh token: %s", tr.reason())
	}

	tokens := m.tokensFrom(tr)

	if err = m.store.Save(tokens); err != nil {
		return TokenSet{}, fmt.Errorf("save refreshed tokens: %w", err)
	}

	m.setTokens(tokens)

	return tokens, nil
}

func (m *Manager) CompleteDeviceLogin(ctx context.Context, dc DeviceCode) (string, error) {
	tokens, err := m.PollForToken(ctx, dc)

	if err != nil {
		return "", err
	}

	v, err := m.Validate(ctx, tokens.AccessToken)

	if err != nil {
		return "", err
	}

	if err = m.store.Save(tokens); err != nil {
		return "", fmt.Errorf("save tokens: %w", err)
	}

	m.setLoggedIn(tokens, v.Login)

	return v.Login, nil
}

func (m *Manager) AccessToken(ctx context.Context) (string, error) {
	stored, err := m.store.Load()

	if err != nil {
		return "", err
	}

	if m.now().Before(stored.Expiry.Add(-refreshThreshold)) {
		return stored.AccessToken, nil
	}

	refreshed, err := m.Refresh(ctx)

	if err != nil {
		return "", err
	}

	return refreshed.AccessToken, nil
}

func (m *Manager) Logout(ctx context.Context) error {
	stored, err := m.store.Load()

	if err == nil && stored.AccessToken != "" {
		m.revoke(ctx, stored.AccessToken)
	}

	m.clearState()

	return nil
}

func (m *Manager) Restore(ctx context.Context) (string, error) {
	if _, err := m.store.Load(); err != nil {
		return "", err
	}

	refreshed, err := m.Refresh(ctx)

	if err != nil {
		return "", err
	}

	v, err := m.Validate(ctx, refreshed.AccessToken)

	if err != nil {
		return "", err
	}

	m.setLoggedIn(refreshed, v.Login)

	return v.Login, nil
}

func (m *Manager) revoke(ctx context.Context, accessToken string) {
	form := url.Values{}

	form.Set("client_id", TwitchClientID)
	form.Set("token", accessToken)

	resp, err := m.postForm(ctx, "/revoke", form)

	if err != nil {
		return
	}

	resp.Body.Close()
}

func (m *Manager) LoggedIn() bool {
	m.mu.Lock()
	defer m.mu.Unlock()

	return m.loggedIn
}

func (m *Manager) CurrentLogin() string {
	m.mu.Lock()
	defer m.mu.Unlock()

	return m.login
}

func (m *Manager) setLoggedIn(tokens TokenSet, login string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.tokens = tokens
	m.login = login
	m.loggedIn = true
}

func (m *Manager) setTokens(tokens TokenSet) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.tokens = tokens
}

func (m *Manager) clearState() {
	_ = m.store.Clear()

	m.mu.Lock()
	defer m.mu.Unlock()

	m.tokens = TokenSet{}
	m.login = ""
	m.loggedIn = false
}

func (m *Manager) tokensFrom(tr tokenResponse) TokenSet {
	return TokenSet{
		AccessToken:  tr.AccessToken,
		RefreshToken: tr.RefreshToken,
		Expiry:       m.now().Add(time.Duration(tr.ExpiresIn) * time.Second),
	}
}

func decodeTokenResponse(resp *http.Response) (tokenResponse, error) {
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return tokenResponse{}, fmt.Errorf("read token response: %w", err)
	}

	var tr tokenResponse

	if err = json.Unmarshal(body, &tr); err != nil {
		return tokenResponse{}, fmt.Errorf("decode token response: %w", err)
	}

	return tr, nil
}

func (tr tokenResponse) reason() string {
	if tr.Message != "" {
		return tr.Message
	}

	if tr.Error != "" {
		return tr.Error
	}

	return "unknown error"
}

func (m *Manager) postForm(ctx context.Context, path string, form url.Values) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, m.base+path, strings.NewReader(form.Encode()))

	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	return m.client.Do(req)
}
