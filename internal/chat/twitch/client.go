package twitch

import (
	"context"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"ghost-chat/internal/chat"

	"github.com/gorilla/websocket"
)

const (
	twitchIRCURL = "wss://irc-ws.chat.twitch.tv:443"
	maxBackoff   = 30 * time.Second
)

type MessageHandler func(chat.ChatMessage)

type EventHandler func(event string, data any)

type Client struct {
	conn    *websocket.Conn
	channel string
	badges  *BadgeStore
	emotes  *EmoteStore

	mu     sync.Mutex
	cancel context.CancelFunc

	OnMessage MessageHandler
	OnEvent   EventHandler
}

func NewClient(onMessage MessageHandler, onEvent EventHandler) *Client {
	return &Client{
		OnMessage: onMessage,
		OnEvent:   onEvent,
		badges:    NewBadgeStore(),
		emotes:    NewEmoteStore(),
	}
}

func (c *Client) Connect(channel string) error {
	c.mu.Lock()

	if c.cancel != nil {
		c.cancel()
		c.cancel = nil
	}

	if c.conn != nil {
		c.conn.Close()
		c.conn = nil
	}

	conn, _, err := websocket.DefaultDialer.Dial(twitchIRCURL, nil)

	if err != nil {
		c.mu.Unlock()
		return err
	}

	c.channel = channel
	c.conn = conn

	ctx, cancel := context.WithCancel(context.Background())

	c.cancel = cancel

	c.mu.Unlock()

	err = c.sendHandshake(conn, channel)

	if err != nil {
		conn.Close()
		cancel()
		return err
	}

	c.OnEvent("chat:connected", map[string]string{"platform": string(chat.PlatformTwitch)})

	go c.readLoop(ctx, conn)

	return nil
}

func (c *Client) Disconnect() {
	c.mu.Lock()

	if c.cancel != nil {
		c.cancel() // signal readLoop to stop
		c.cancel = nil
	}

	if c.conn != nil {
		c.conn.Close()
		c.conn = nil
	}

	c.mu.Unlock()

	c.OnEvent("chat:disconnected", map[string]string{"platform": string(chat.PlatformTwitch)})
}

func (c *Client) sendHandshake(conn *websocket.Conn, channel string) error {
	if len(channel) == 0 {
		return fmt.Errorf("channel is empty")
	}

	if err := conn.WriteMessage(websocket.TextMessage, []byte("CAP REQ :twitch.tv/tags twitch.tv/commands")); err != nil {
		return err
	}

	if err := conn.WriteMessage(websocket.TextMessage, []byte("PASS SCHMOOPIIE")); err != nil {
		return err
	}

	if err := conn.WriteMessage(websocket.TextMessage, []byte("NICK justinfan12345")); err != nil {
		return err
	}

	joinLine := "JOIN "

	if channel[0] != '#' {
		joinLine += "#"
	}

	joinLine += channel

	if err := conn.WriteMessage(websocket.TextMessage, []byte(joinLine)); err != nil {
		return err
	}

	return nil
}

func (c *Client) readLoop(ctx context.Context, conn *websocket.Conn) {
	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		_, message, err := conn.ReadMessage()

		if err != nil {
			select {
			case <-ctx.Done():
				return
			default:
			}

			go c.reconnect(ctx)

			return
		}

		for _, line := range strings.Split(string(message), "\r\n") {
			if line != "" {
				c.handleMessage(line)
			}
		}
	}
}

func (c *Client) handleMessage(raw string) {
	message := ParseIRC(raw)

	switch message.Command {
	case "PING":
		c.conn.WriteMessage(websocket.TextMessage, []byte("PONG :tmi.twitch.tv"))
	case "ROOMSTATE":
		channel := strings.TrimPrefix(message.Channel, "#")
		roomID := message.Tags["room-id"]
		go func() {
			if err := c.badges.FetchGlobal(); err != nil {
				log.Printf("failed to fetch global badges: %v", err)
			}
		}()
		go func() {
			if err := c.badges.FetchChannel(channel); err != nil {
				log.Printf("failed to fetch channel badges for %s: %v", channel, err)
			}
		}()
		go func() {
			if err := c.emotes.FetchBTTVGlobal(); err != nil {
				log.Printf("failed to fetch bttv global emotes: %v", err)
			}
		}()
		go func() {
			if err := c.emotes.FetchBTTVChannel(roomID); err != nil {
				log.Printf("failed to fetch bttv channel emotes: %v", err)
			}
		}()
		go func() {
			if err := c.emotes.FetchFFZGlobal(); err != nil {
				log.Printf("failed to fetch ffz global emotes: %v", err)
			}
		}()
		go func() {
			if err := c.emotes.FetchFFZChannel(channel); err != nil {
				log.Printf("failed to fetch ffz channel emotes: %v", err)
			}
		}()
		go func() {
			if err := c.emotes.Fetch7TVGlobal(); err != nil {
				log.Printf("failed to fetch 7tv global emotes: %v", err)
			}
		}()
		go func() {
			if err := c.emotes.Fetch7TVChannel(roomID); err != nil {
				log.Printf("failed to fetch 7tv channel emotes: %v", err)
			}
		}()
	case "PRIVMSG":
		chatMsg := ToChatMessage(message)
		c.resolveBadgeURLs(chatMsg.Badges)
		chatMsg.Emotes = c.emotes.ResolveEmotes(chatMsg.Text, chatMsg.Emotes)
		c.OnMessage(chatMsg)
	case "USERNOTICE":
		chatMsg := ToEventMessage(message)
		c.resolveBadgeURLs(chatMsg.Badges)

		if chatMsg.Text != "" {
			chatMsg.Emotes = c.emotes.ResolveEmotes(chatMsg.Text, chatMsg.Emotes)
		}

		c.OnMessage(chatMsg)
	case "CLEARCHAT":
		c.OnEvent("chat:clear", message.Params)
	case "CLEARMSG":
		c.OnEvent("chat:delete-message", message.Tags["target-msg-id"])
	default:
	}
}

func (c *Client) resolveBadgeURLs(badges []chat.Badge) {
	for i := range badges {
		badges[i].URL = c.badges.GetURL(badges[i].Name, badges[i].Version)
	}
}

func (c *Client) reconnect(ctx context.Context) {
	c.mu.Lock()
	channel := c.channel
	c.mu.Unlock()

	backoff := 1 * time.Second

	for {
		select {
		case <-ctx.Done():
			return
		case <-time.After(backoff):
		}

		conn, _, err := websocket.DefaultDialer.Dial(twitchIRCURL, nil)

		if err != nil {
			backoff = min(backoff*2, maxBackoff)
			continue
		}

		c.mu.Lock()
		if ctx.Err() != nil {
			c.mu.Unlock()
			conn.Close()
			return
		}
		if c.conn != nil {
			c.conn.Close()
		}
		c.conn = conn
		c.mu.Unlock()

		if err := c.sendHandshake(conn, channel); err != nil {
			conn.Close()
			backoff = min(backoff*2, maxBackoff)
			continue
		}

		go c.readLoop(ctx, conn)

		return
	}
}
