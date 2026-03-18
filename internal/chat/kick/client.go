package kick

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"ghost-chat/internal/chat"

	"github.com/gorilla/websocket"
)

const (
	kickUA            = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
	pusherURL         = "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"
	heartbeatInterval = 30 * time.Second
	maxBackoff        = 60 * time.Second
)

type MessageHandler func(chat.ChatMessage)
type EventHandler func(event string, data any)

type Client struct {
	mu         sync.Mutex
	ctx        context.Context
	cancel     context.CancelFunc
	conn       *websocket.Conn
	chatroomID int

	OnMessage MessageHandler
	OnEvent   EventHandler
}

func NewClient(onMessage MessageHandler, onEvent EventHandler) *Client {
	return &Client{
		OnMessage: onMessage,
		OnEvent:   onEvent,
	}
}

func (c *Client) Connect(input string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.cancel != nil {
		c.cancel()
		c.cancel = nil
	}

	slug, err := ResolveChannelSlug(input)
	if err != nil {
		return fmt.Errorf("failed to resolve channel: %w", err)
	}

	chatroomID, err := FetchChatroomID(slug)
	if err != nil {
		return fmt.Errorf("failed to fetch chatroom ID: %w", err)
	}

	conn, err := dialPusher()
	if err != nil {
		return fmt.Errorf("failed to connect to Pusher: %w", err)
	}

	if err := subscribe(conn, chatroomID); err != nil {
		conn.Close()
		return fmt.Errorf("failed to subscribe: %w", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	c.ctx = ctx
	c.cancel = cancel
	c.conn = conn
	c.chatroomID = chatroomID

	c.OnEvent("chat:connected", map[string]string{"platform": "kick"})

	go c.readLoop(conn)
	go c.heartbeatLoop()

	return nil
}

func (c *Client) Disconnect() {
	c.mu.Lock()

	if c.cancel != nil {
		c.cancel()
		c.cancel = nil
	}

	if c.conn != nil {
		c.conn.Close()
		c.conn = nil
	}

	c.mu.Unlock()

	c.OnEvent("chat:disconnected", map[string]string{"platform": "kick"})
}

// readLoop reads messages from conn until it errors or ctx is cancelled.
// On error it attempts to reconnect with exponential backoff.
// conn is passed as a parameter so the goroutine always reads from the connection
// it was started with, avoiding races when c.conn is replaced during reconnect.
func (c *Client) readLoop(conn *websocket.Conn) {
	for {
		select {
		case <-c.ctx.Done():
			return
		default:
		}

		_, raw, err := conn.ReadMessage()
		if err != nil {
			select {
			case <-c.ctx.Done():
				return
			default:
			}
			go c.reconnect()
			return
		}

		c.handleMessage(raw)
	}
}

func (c *Client) reconnect() {
	backoff := time.Second

	for {
		select {
		case <-c.ctx.Done():
			return
		case <-time.After(backoff):
		}

		logf("reconnecting...")

		conn, err := dialPusher()
		if err != nil {
			logf("reconnect dial failed: %v", err)
			backoff = min(backoff*2, maxBackoff)
			continue
		}

		if err := subscribe(conn, c.chatroomID); err != nil {
			conn.Close()
			logf("reconnect subscribe failed: %v", err)
			backoff = min(backoff*2, maxBackoff)
			continue
		}

		c.mu.Lock()
		if c.conn != nil {
			c.conn.Close()
		}
		c.conn = conn
		c.mu.Unlock()

		go c.readLoop(conn)
		return
	}
}

func (c *Client) heartbeatLoop() {
	ticker := time.NewTicker(heartbeatInterval)
	defer ticker.Stop()

	for {
		select {
		case <-c.ctx.Done():
			return
		case <-ticker.C:
			ping, _ := json.Marshal(map[string]any{"event": "pusher:ping", "data": map[string]any{}})
			c.mu.Lock()
			if c.conn != nil {
				c.conn.WriteMessage(websocket.TextMessage, ping) //nolint:errcheck
			}
			c.mu.Unlock()
		}
	}
}

func (c *Client) handleMessage(raw []byte) {
	var pm PusherMessage
	if err := json.Unmarshal(raw, &pm); err != nil {
		return
	}

	switch pm.Event {
	case "pusher:ping":
		pong, _ := json.Marshal(map[string]any{"event": "pusher:pong", "data": map[string]any{}})
		c.mu.Lock()
		if c.conn != nil {
			c.conn.WriteMessage(websocket.TextMessage, pong) //nolint:errcheck
		}
		c.mu.Unlock()

	case `App\Events\ChatMessageEvent`:
		// pm.Data is a JSON-encoded string; decode it to get the inner JSON string,
		// then decode that string into KickChatMessage.
		var inner string
		if err := json.Unmarshal(pm.Data, &inner); err != nil {
			logf("failed to decode chat event data: %v", err)
			return
		}
		var km KickChatMessage
		if err := json.Unmarshal([]byte(inner), &km); err != nil {
			logf("failed to parse chat message: %v", err)
			return
		}
		c.OnMessage(parseMessage(km))
	}
}

// dialPusher opens a WebSocket connection to Pusher and waits for connection_established.
func dialPusher() (*websocket.Conn, error) {
	conn, _, err := websocket.DefaultDialer.Dial(pusherURL, nil)
	if err != nil {
		return nil, err
	}

	conn.SetReadDeadline(time.Now().Add(10 * time.Second))
	_, raw, err := conn.ReadMessage()
	conn.SetReadDeadline(time.Time{})

	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("waiting for connection_established: %w", err)
	}

	var pm PusherMessage
	if err := json.Unmarshal(raw, &pm); err != nil || pm.Event != "pusher:connection_established" {
		conn.Close()
		return nil, fmt.Errorf("unexpected event during handshake: %s", pm.Event)
	}

	return conn, nil
}

// subscribe sends the Pusher channel subscription message.
func subscribe(conn *websocket.Conn, chatroomID int) error {
	msg, err := json.Marshal(map[string]any{
		"event": "pusher:subscribe",
		"data": map[string]any{
			"auth":    "",
			"channel": fmt.Sprintf("chatrooms.%d.v2", chatroomID),
		},
	})
	if err != nil {
		return err
	}
	return conn.WriteMessage(websocket.TextMessage, msg)
}

func logf(format string, args ...any) {
	fmt.Printf("[kick] "+format+"\n", args...)
}
