package kick

import "encoding/json"

// PusherMessage is the outer Pusher WebSocket envelope.
// Data is json.RawMessage because some events carry a JSON object (e.g. pusher:pong {}),
// others carry a JSON-encoded string (e.g. App\Events\ChatMessageEvent "...").
type PusherMessage struct {
	Event   string          `json:"event"`
	Data    json.RawMessage `json:"data"`
	Channel string          `json:"channel"`
}

// KickChatMessage is the inner payload of App\Events\ChatMessageEvent,
// obtained by JSON-decoding the string value of PusherMessage.Data.
type KickChatMessage struct {
	ID         string     `json:"id"`
	ChatroomID int        `json:"chatroom_id"`
	Content    string     `json:"content"`
	Type       string     `json:"type"` // "message", "reply", etc.
	CreatedAt  string     `json:"created_at"`
	Sender     KickSender `json:"sender"`
}

type KickSender struct {
	ID       int           `json:"id"`
	Username string        `json:"username"`
	Slug     string        `json:"slug"`
	Identity *KickIdentity `json:"identity"` // nil for users without colour/badges set
}

type KickIdentity struct {
	Color  string      `json:"color"`
	Badges []KickBadge `json:"badges"`
}

type KickBadge struct {
	Type  string `json:"type"`  // "moderator", "subscriber", "sub_gifter", "verified", "broadcaster", "og"
	Text  string `json:"text"`  // display label, e.g. "Moderator"
	Count int    `json:"count"` // months for subscriber / sub_gifter
}

// ChannelResponse is used when resolving a slug → chatroom ID.
type ChannelResponse struct {
	Chatroom struct {
		ID int `json:"id"`
	} `json:"chatroom"`
}
