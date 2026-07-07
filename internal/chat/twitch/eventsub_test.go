package twitch

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"ghost-chat/internal/chat"

	"github.com/gorilla/websocket"
)

type stubAuthProvider struct {
	token   string
	userID  string
	refresh func() error
}

func (s stubAuthProvider) AccessToken(ctx context.Context) (string, error) {
	return s.token, nil
}

func (s stubAuthProvider) UserID(ctx context.Context, token string) (string, error) {
	return s.userID, nil
}

func (s stubAuthProvider) Refresh(ctx context.Context) error {
	if s.refresh != nil {
		return s.refresh()
	}

	return nil
}

type mockEventSubServer struct {
	server     *httptest.Server
	wsURL      string
	subscribed chan string
	frames     chan any
}

type mockFrame struct {
	raw    string
	action string
}

func newMockEventSubServer(t *testing.T) *mockEventSubServer {
	t.Helper()

	m := &mockEventSubServer{
		subscribed: make(chan string, 4),
		frames:     make(chan any, 16),
	}

	upgrader := websocket.Upgrader{}

	mux := http.NewServeMux()

	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)

		if err != nil {
			return
		}

		defer conn.Close()

		welcome := `{"metadata":{"message_type":"session_welcome","message_id":"w1","message_timestamp":"2024-01-01T00:00:00Z"},"payload":{"session":{"id":"sess-abc","status":"connected","keepalive_timeout_seconds":10,"reconnect_url":null}}}`

		conn.WriteMessage(websocket.TextMessage, []byte(welcome))

		go func() {
			for {
				if _, _, err := conn.ReadMessage(); err != nil {
					return
				}
			}
		}()

		for f := range m.frames {
			frame, ok := f.(mockFrame)

			if !ok {
				return
			}

			if frame.action == "close" {
				return
			}

			conn.WriteMessage(websocket.TextMessage, []byte(frame.raw))
		}
	})

	mux.HandleFunc("/eventsub/subscriptions", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Transport struct {
				SessionID string `json:"session_id"`
			} `json:"transport"`
		}

		json.NewDecoder(r.Body).Decode(&body)

		m.subscribed <- body.Transport.SessionID

		w.WriteHeader(http.StatusAccepted)
		w.Write([]byte(`{"data":[{"id":"sub1","status":"enabled"}]}`))
	})

	m.server = httptest.NewServer(mux)

	m.wsURL = "ws" + strings.TrimPrefix(m.server.URL, "http") + "/ws"

	t.Cleanup(func() {
		close(m.frames)
		m.server.Close()
	})

	return m
}

func TestEventSubWelcomeTriggersSubscribeAndNotification(t *testing.T) {
	m := newMockEventSubServer(t)

	var mu sync.Mutex
	var got []chat.ChatMessage

	onMessage := func(msg chat.ChatMessage) {
		mu.Lock()
		got = append(got, msg)
		mu.Unlock()
	}

	provider := stubAuthProvider{token: "tok", userID: "42"}

	es := NewEventSub(onMessage, provider, func() {},
		WithWSURL(m.wsURL),
		WithHelixURL(m.server.URL),
		WithEventSubHTTPClient(m.server.Client()),
	)

	es.Start()

	t.Cleanup(es.Stop)

	select {
	case sid := <-m.subscribed:
		if sid != "sess-abc" {
			t.Fatalf("subscribe used session id %q, want %q", sid, "sess-abc")
		}
	case <-time.After(3 * time.Second):
		t.Fatal("subscription was not created after welcome")
	}

	notification := `{"metadata":{"message_type":"notification","message_id":"n1","message_timestamp":"2024-01-01T00:00:00Z"},"payload":{"subscription":{"id":"sub1"},"event":{"id":"redeem1","broadcaster_user_id":"42","broadcaster_user_login":"streamer","broadcaster_user_name":"Streamer","user_id":"2","user_login":"viewer","user_name":"Viewer","user_input":"hi","status":"unfulfilled","redeemed_at":"2024-01-01T00:00:00Z","reward":{"id":"r1","title":"Hydrate","cost":100,"prompt":"drink"}}}}`

	m.frames <- mockFrame{raw: notification}

	deadline := time.Now().Add(3 * time.Second)

	for time.Now().Before(deadline) {
		mu.Lock()
		n := len(got)
		mu.Unlock()

		if n > 0 {
			break
		}

		time.Sleep(10 * time.Millisecond)
	}

	mu.Lock()
	defer mu.Unlock()

	if len(got) != 1 {
		t.Fatalf("got %d messages, want 1", len(got))
	}

	if got[0].ID != "redeem1" {
		t.Errorf("message.ID = %q, want %q", got[0].ID, "redeem1")
	}

	if got[0].EventType != EventTypeChannelPoints {
		t.Errorf("message.EventType = %q, want %q", got[0].EventType, EventTypeChannelPoints)
	}
}

func TestEventSubRevocationTriggersAuthLostAndStops(t *testing.T) {
	m := newMockEventSubServer(t)

	authLost := make(chan struct{}, 1)

	provider := stubAuthProvider{token: "tok", userID: "42"}

	es := NewEventSub(func(chat.ChatMessage) {}, provider, func() {
		select {
		case authLost <- struct{}{}:
		default:
		}
	},
		WithWSURL(m.wsURL),
		WithHelixURL(m.server.URL),
		WithEventSubHTTPClient(m.server.Client()),
	)

	es.Start()

	t.Cleanup(es.Stop)

	select {
	case <-m.subscribed:
	case <-time.After(3 * time.Second):
		t.Fatal("subscription was not created after welcome")
	}

	revocation := `{"metadata":{"message_type":"revocation","message_id":"r1","message_timestamp":"2024-01-01T00:00:00Z"},"payload":{"subscription":{"id":"sub1","status":"authorization_revoked","type":"channel.channel_points_custom_reward_redemption.add"}}}`

	m.frames <- mockFrame{raw: revocation}

	select {
	case <-authLost:
	case <-time.After(3 * time.Second):
		t.Fatal("onAuthLost was not called after revocation")
	}
}

func TestEventSubSubscribeUnauthorizedRefreshInvalidGrantSignalsAuthLost(t *testing.T) {
	provider := stubAuthProvider{
		token:  "tok",
		userID: "42",
		refresh: func() error {
			return ErrAuthPermanent
		},
	}

	authLost := make(chan struct{}, 1)

	upgrader := websocket.Upgrader{}

	mux := http.NewServeMux()

	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)

		if err != nil {
			return
		}

		defer conn.Close()

		welcome := `{"metadata":{"message_type":"session_welcome","message_id":"w1","message_timestamp":"2024-01-01T00:00:00Z"},"payload":{"session":{"id":"sess-abc","status":"connected","keepalive_timeout_seconds":10,"reconnect_url":null}}}`

		conn.WriteMessage(websocket.TextMessage, []byte(welcome))

		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				return
			}
		}
	})

	mux.HandleFunc("/eventsub/subscriptions", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
	})

	server := httptest.NewServer(mux)

	t.Cleanup(server.Close)

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http") + "/ws"

	es := NewEventSub(func(chat.ChatMessage) {}, provider, func() {
		select {
		case authLost <- struct{}{}:
		default:
		}
	},
		WithWSURL(wsURL),
		WithHelixURL(server.URL),
		WithEventSubHTTPClient(server.Client()),
	)

	es.Start()

	t.Cleanup(es.Stop)

	select {
	case <-authLost:
	case <-time.After(3 * time.Second):
		t.Fatal("onAuthLost was not called after 401 then invalid grant")
	}
}

func TestEventSubStartStopIdempotent(t *testing.T) {
	provider := stubAuthProvider{token: "tok", userID: "42"}

	es := NewEventSub(func(chat.ChatMessage) {}, provider, func() {},
		WithWSURL("ws://127.0.0.1:0/nope"),
	)

	es.Stop()
	es.Start()
	es.Start()
	es.Stop()
	es.Stop()
}

func TestParseFrameNotificationMapsRedemption(t *testing.T) {
	raw := []byte(`{"metadata":{"message_type":"notification","message_id":"m3","message_timestamp":"2024-01-01T00:00:00Z"},"payload":{"subscription":{"id":"sub1","type":"channel.channel_points_custom_reward_redemption.add"},"event":{"id":"redeem1","broadcaster_user_id":"1","broadcaster_user_login":"streamer","broadcaster_user_name":"Streamer","user_id":"2","user_login":"viewer","user_name":"Viewer","user_input":"hello there","status":"unfulfilled","redeemed_at":"2024-01-01T00:00:00Z","reward":{"id":"r1","title":"Hydrate","cost":100,"prompt":"drink"}}}}`)

	f, err := parseFrame(raw)

	if err != nil {
		t.Fatalf("parseFrame: %v", err)
	}

	if f.kind != frameNotification {
		t.Errorf("kind = %v, want frameNotification", f.kind)
	}

	if !f.hasMessage {
		t.Fatal("expected hasMessage to be true")
	}

	if f.message.ID != "redeem1" {
		t.Errorf("message.ID = %q, want %q", f.message.ID, "redeem1")
	}

	if f.message.Username != "Viewer" {
		t.Errorf("message.Username = %q, want %q", f.message.Username, "Viewer")
	}

	if f.message.Text != "hello there" {
		t.Errorf("message.Text = %q, want %q", f.message.Text, "hello there")
	}

	if f.message.EventType != EventTypeChannelPoints {
		t.Errorf("message.EventType = %q, want %q", f.message.EventType, EventTypeChannelPoints)
	}

	if f.message.EventData["reward"] != "Hydrate" {
		t.Errorf("message.EventData[reward] = %q, want %q", f.message.EventData["reward"], "Hydrate")
	}
}

func TestParseFrameKeepalive(t *testing.T) {
	raw := []byte(`{"metadata":{"message_type":"session_keepalive","message_id":"m2","message_timestamp":"2024-01-01T00:00:00Z"},"payload":{}}`)

	f, err := parseFrame(raw)

	if err != nil {
		t.Fatalf("parseFrame: %v", err)
	}

	if f.kind != frameKeepalive {
		t.Errorf("kind = %v, want frameKeepalive", f.kind)
	}

	if f.hasMessage {
		t.Error("keepalive must not produce a message")
	}
}

func TestParseFrameReconnect(t *testing.T) {
	raw := []byte(`{"metadata":{"message_type":"session_reconnect","message_id":"m4","message_timestamp":"2024-01-01T00:00:00Z"},"payload":{"session":{"id":"sess123","status":"reconnecting","keepalive_timeout_seconds":null,"reconnect_url":"wss://new.example/ws","connected_at":"2024-01-01T00:00:00Z"}}}`)

	f, err := parseFrame(raw)

	if err != nil {
		t.Fatalf("parseFrame: %v", err)
	}

	if f.kind != frameReconnect {
		t.Errorf("kind = %v, want frameReconnect", f.kind)
	}

	if f.reconnectURL != "wss://new.example/ws" {
		t.Errorf("reconnectURL = %q, want %q", f.reconnectURL, "wss://new.example/ws")
	}
}

func TestParseFrameRevocation(t *testing.T) {
	raw := []byte(`{"metadata":{"message_type":"revocation","message_id":"m5","message_timestamp":"2024-01-01T00:00:00Z"},"payload":{"subscription":{"id":"sub1","status":"authorization_revoked","type":"channel.channel_points_custom_reward_redemption.add"}}}`)

	f, err := parseFrame(raw)

	if err != nil {
		t.Fatalf("parseFrame: %v", err)
	}

	if f.kind != frameRevocation {
		t.Errorf("kind = %v, want frameRevocation", f.kind)
	}
}

func TestParseFrameWelcome(t *testing.T) {
	raw := []byte(`{"metadata":{"message_type":"session_welcome","message_id":"m1","message_timestamp":"2024-01-01T00:00:00Z"},"payload":{"session":{"id":"sess123","status":"connected","keepalive_timeout_seconds":10,"reconnect_url":null,"connected_at":"2024-01-01T00:00:00Z"}}}`)

	f, err := parseFrame(raw)

	if err != nil {
		t.Fatalf("parseFrame: %v", err)
	}

	if f.kind != frameWelcome {
		t.Errorf("kind = %v, want frameWelcome", f.kind)
	}

	if f.sessionID != "sess123" {
		t.Errorf("sessionID = %q, want %q", f.sessionID, "sess123")
	}

	if f.keepalive != 10 {
		t.Errorf("keepalive = %d, want 10", f.keepalive)
	}
}

func TestShouldRunRedemptions(t *testing.T) {
	cases := []struct {
		name             string
		loggedIn         bool
		authLogin        string
		connectedChannel string
		want             bool
	}{
		{"matching", true, "streamer", "streamer", true},
		{"case insensitive", true, "Streamer", "streamer", true},
		{"case insensitive reverse", true, "streamer", "STREAMER", true},
		{"non matching channel", true, "streamer", "otherchannel", false},
		{"logged out", false, "streamer", "streamer", false},
		{"empty auth login", true, "", "streamer", false},
		{"empty channel", true, "streamer", "", false},
		{"both empty logged in", true, "", "", false},
		{"channel with hash prefix differs", true, "streamer", "#streamer", false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := ShouldRunRedemptions(tc.loggedIn, tc.authLogin, tc.connectedChannel)

			if got != tc.want {
				t.Errorf("ShouldRunRedemptions(%v, %q, %q) = %v, want %v", tc.loggedIn, tc.authLogin, tc.connectedChannel, got, tc.want)
			}
		})
	}
}
