package twitch

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"ghost-chat/internal/auth"
	"ghost-chat/internal/chat"

	"github.com/gorilla/websocket"
)

const (
	msgWelcome      = "session_welcome"
	msgKeepalive    = "session_keepalive"
	msgNotification = "notification"
	msgReconnect    = "session_reconnect"
	msgRevocation   = "revocation"

	eventSubWSURL          = "wss://eventsub.wss.twitch.tv/ws"
	helixBaseURL           = "https://api.twitch.tv/helix"
	subscriptionType       = "channel.channel_points_custom_reward_redemption.add"
	keepaliveGrace         = 3 * time.Second
	welcomeTimeout         = 10 * time.Second
	subscriptionRetryLimit = 3
)

var (
	ErrAuthPermanent = errors.New("auth permanently lost")

	errStop         = errors.New("eventsub stop")
	errUnauthorized = errors.New("eventsub unauthorized")
)

func ShouldRunRedemptions(loggedIn bool, authLogin, connectedChannel string) bool {
	return loggedIn && authLogin != "" && strings.EqualFold(authLogin, connectedChannel)
}

type frameKind int

const (
	frameUnknown frameKind = iota
	frameWelcome
	frameKeepalive
	frameNotification
	frameReconnect
	frameRevocation
)

type parsedFrame struct {
	kind         frameKind
	sessionID    string
	keepalive    int
	reconnectURL string
	message      chat.ChatMessage
	hasMessage   bool
}

type eventSubEnvelope struct {
	Metadata struct {
		MessageType string `json:"message_type"`
	} `json:"metadata"`
	Payload struct {
		Session *struct {
			ID                      string `json:"id"`
			KeepaliveTimeoutSeconds int    `json:"keepalive_timeout_seconds"`
			ReconnectURL            string `json:"reconnect_url"`
		} `json:"session"`
		Event json.RawMessage `json:"event"`
	} `json:"payload"`
}

func parseFrame(raw []byte) (parsedFrame, error) {
	var env eventSubEnvelope

	if err := json.Unmarshal(raw, &env); err != nil {
		return parsedFrame{}, fmt.Errorf("decode eventsub frame: %w", err)
	}

	f := parsedFrame{}

	switch env.Metadata.MessageType {
	case msgWelcome:
		f.kind = frameWelcome

		if env.Payload.Session != nil {
			f.sessionID = env.Payload.Session.ID
			f.keepalive = env.Payload.Session.KeepaliveTimeoutSeconds
		}
	case msgKeepalive:
		f.kind = frameKeepalive
	case msgNotification:
		var e RedemptionEvent

		if err := json.Unmarshal(env.Payload.Event, &e); err != nil {
			return parsedFrame{}, fmt.Errorf("decode redemption event: %w", err)
		}

		f.kind = frameNotification
		f.message = RedemptionToMessage(e)
		f.hasMessage = true
	case msgReconnect:
		f.kind = frameReconnect

		if env.Payload.Session != nil {
			f.reconnectURL = env.Payload.Session.ReconnectURL
		}
	case msgRevocation:
		f.kind = frameRevocation
	default:
		f.kind = frameUnknown
	}

	return f, nil
}

type AuthProvider interface {
	AccessToken(ctx context.Context) (string, error)
	UserID(ctx context.Context, token string) (string, error)
	Refresh(ctx context.Context) error
}

type EventSub struct {
	onMessage  MessageHandler
	auth       AuthProvider
	onAuthLost func()

	wsURL      string
	helixURL   string
	httpClient *http.Client

	mu      sync.Mutex
	conn    *websocket.Conn
	cancel  context.CancelFunc
	running bool
}

type EventSubOption func(*EventSub)

func WithWSURL(u string) EventSubOption {
	return func(e *EventSub) {
		e.wsURL = u
	}
}

func WithHelixURL(u string) EventSubOption {
	return func(e *EventSub) {
		e.helixURL = strings.TrimRight(u, "/")
	}
}

func WithEventSubHTTPClient(c *http.Client) EventSubOption {
	return func(e *EventSub) {
		e.httpClient = c
	}
}

func NewEventSub(onMessage MessageHandler, provider AuthProvider, onAuthLost func(), opts ...EventSubOption) *EventSub {
	e := &EventSub{
		onMessage:  onMessage,
		auth:       provider,
		onAuthLost: onAuthLost,
		wsURL:      eventSubWSURL,
		helixURL:   helixBaseURL,
		httpClient: http.DefaultClient,
	}

	for _, opt := range opts {
		opt(e)
	}

	return e
}

func (e *EventSub) Start() {
	e.mu.Lock()
	defer e.mu.Unlock()

	if e.running {
		return
	}

	ctx, cancel := context.WithCancel(context.Background())

	e.cancel = cancel
	e.running = true

	go e.run(ctx)
}

func (e *EventSub) Stop() {
	e.mu.Lock()
	defer e.mu.Unlock()

	if !e.running {
		return
	}

	if e.cancel != nil {
		e.cancel()
		e.cancel = nil
	}

	if e.conn != nil {
		e.conn.Close()
		e.conn = nil
	}

	e.running = false
}

func (e *EventSub) run(ctx context.Context) {
	url := e.wsURL
	backoff := 1 * time.Second

	for {
		if ctx.Err() != nil {
			return
		}

		err, welcomed := e.serve(ctx, url)

		if welcomed {
			backoff = time.Second
		}

		if ctx.Err() != nil {
			return
		}

		if errors.Is(err, errStop) {
			return
		}

		url = e.wsURL

		select {
		case <-ctx.Done():
			return
		case <-time.After(backoff):
		}

		backoff = min(backoff*2, maxBackoff)
	}
}

func (e *EventSub) serve(ctx context.Context, url string) (error, bool) {
	conn, err := e.dial(ctx, url)

	if err != nil {
		return err, false
	}

	if !e.adoptConn(ctx, conn) {
		conn.Close()

		return errStop, false
	}

	defer func() {
		conn.Close()
	}()

	welcomed := false
	var keepalive time.Duration

	setWelcomeDeadline := func(c *websocket.Conn) {
		c.SetReadDeadline(time.Now().Add(welcomeTimeout))
	}

	resetDeadline := func(c *websocket.Conn) {
		if keepalive > 0 {
			c.SetReadDeadline(time.Now().Add(keepalive + keepaliveGrace))
		}
	}

	setWelcomeDeadline(conn)

	for {
		select {
		case <-ctx.Done():
			return errStop, welcomed
		default:
		}

		_, raw, rerr := conn.ReadMessage()

		if rerr != nil {
			if ctx.Err() != nil {
				return errStop, welcomed
			}

			return rerr, welcomed
		}

		f, perr := parseFrame(raw)

		if perr != nil {
			continue
		}

		switch f.kind {
		case frameWelcome:
			welcomed = true
			keepalive = time.Duration(f.keepalive) * time.Second

			resetDeadline(conn)

			go e.subscribe(ctx, f.sessionID)
		case frameKeepalive:
			resetDeadline(conn)
		case frameNotification:
			resetDeadline(conn)

			if f.hasMessage {
				e.onMessage(f.message)
			}
		case frameReconnect:
			newConn, derr := e.dial(ctx, f.reconnectURL)

			if derr != nil {
				continue
			}

			if !e.adoptConn(ctx, newConn) {
				newConn.Close()

				return errStop, welcomed
			}

			old := conn
			conn = newConn

			setWelcomeDeadline(conn)

			old.Close()
		case frameRevocation:
			e.onAuthLost()

			return errStop, welcomed
		}
	}
}

func (e *EventSub) dial(ctx context.Context, url string) (*websocket.Conn, error) {
	conn, _, err := websocket.DefaultDialer.DialContext(ctx, url, nil)

	if err != nil {
		return nil, fmt.Errorf("dial eventsub: %w", err)
	}

	return conn, nil
}

func (e *EventSub) adoptConn(ctx context.Context, conn *websocket.Conn) bool {
	e.mu.Lock()
	defer e.mu.Unlock()

	if ctx.Err() != nil || !e.running {
		return false
	}

	e.conn = conn

	return true
}

// subscribe accepts a rare spurious logout when a real 401 races a user disconnect because the token is genuinely dead.
func (e *EventSub) subscribe(ctx context.Context, sessionID string) {
	err := e.trySubscribeWithRetry(ctx, sessionID)

	switch {
	case err == nil:
		return
	case errors.Is(err, ErrAuthPermanent):
		e.onAuthLost()
	case errors.Is(err, errUnauthorized):
		if rerr := e.auth.Refresh(ctx); rerr != nil {
			if errors.Is(rerr, ErrAuthPermanent) {
				e.onAuthLost()
			}

			return
		}

		if err2 := e.trySubscribeWithRetry(ctx, sessionID); err2 != nil {
			if errors.Is(err2, errUnauthorized) || errors.Is(err2, ErrAuthPermanent) {
				e.onAuthLost()
			}
		}
	default:
	}
}

func (e *EventSub) trySubscribeWithRetry(ctx context.Context, sessionID string) error {
	var err error

	for attempt := 0; attempt < subscriptionRetryLimit; attempt++ {
		err = e.trySubscribe(ctx, sessionID)

		if err == nil || !isTransientSubscriptionError(err) {
			return err
		}

		if ctx.Err() != nil {
			return ctx.Err()
		}
	}

	return err
}

func isTransientSubscriptionError(err error) bool {
	var statusErr *subscriptionHTTPStatusError

	if errors.As(err, &statusErr) {
		return statusErr.status >= http.StatusInternalServerError && statusErr.status < 600
	}

	var transportErr *subscriptionTransportError

	return errors.As(err, &transportErr)
}

type subscriptionTransportError struct {
	err error
}

func (e *subscriptionTransportError) Error() string {
	return fmt.Sprintf("create eventsub subscription: %v", e.err)
}

func (e *subscriptionTransportError) Unwrap() error {
	return e.err
}

type subscriptionHTTPStatusError struct {
	status int
}

func (e *subscriptionHTTPStatusError) Error() string {
	return fmt.Sprintf("create eventsub subscription: unexpected status %d", e.status)
}

type subscriptionRequest struct {
	Type      string `json:"type"`
	Version   string `json:"version"`
	Condition struct {
		BroadcasterUserID string `json:"broadcaster_user_id"`
	} `json:"condition"`
	Transport struct {
		Method    string `json:"method"`
		SessionID string `json:"session_id"`
	} `json:"transport"`
}

func (e *EventSub) trySubscribe(ctx context.Context, sessionID string) error {
	token, err := e.auth.AccessToken(ctx)

	if err != nil {
		return err
	}

	userID, err := e.auth.UserID(ctx, token)

	if err != nil {
		return err
	}

	body := subscriptionRequest{
		Type:    subscriptionType,
		Version: "1",
	}

	body.Condition.BroadcasterUserID = userID
	body.Transport.Method = "websocket"
	body.Transport.SessionID = sessionID

	payload, err := json.Marshal(body)

	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, e.helixURL+"/eventsub/subscriptions", bytes.NewReader(payload))

	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Client-Id", auth.TwitchClientID)
	req.Header.Set("Content-Type", "application/json")

	resp, err := e.httpClient.Do(req)

	if err != nil {
		return &subscriptionTransportError{err: err}
	}

	defer resp.Body.Close()

	io.Copy(io.Discard, resp.Body)

	switch resp.StatusCode {
	case http.StatusAccepted:
		return nil
	case http.StatusUnauthorized:
		return errUnauthorized
	default:
		return &subscriptionHTTPStatusError{status: resp.StatusCode}
	}
}
