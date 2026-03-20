package chat

import "time"

type Badge struct {
	Name    string `json:"name"`
	Version string `json:"version"`
	URL     string `json:"url"`
}

type Emote struct {
	ID    string `json:"id"`
	Start int    `json:"start"`
	End   int    `json:"end"`
	URL   string `json:"url"`
}

// MessageFragment is a single segment of a chat message — either plain text or an emote/emoji image.
// Used by YouTube (runs-based) messages. Twitch messages use Text + Emotes instead.
type MessageFragment struct {
	Type string `json:"type"` // "text" or "emote"
	Text string `json:"text"` // display text (plain text content, or emote shortcode like ":_pekoName:")
	URL  string `json:"url"`  // image URL (only set when Type == "emote")
}

// SuperChatDetails holds YouTube Super Chat metadata.
type SuperChatDetails struct {
	Amount      string `json:"amount"`      // pre-formatted amount string, e.g. "€10.00"
	HeaderColor string `json:"headerColor"` // ARGB int converted to "#RRGGBB" hex
	BodyColor   string `json:"bodyColor"`   // ARGB int converted to "#RRGGBB" hex
}

type ChatMessage struct {
	ID        string            `json:"id"`
	Platform  string            `json:"platform"`
	Username  string            `json:"username"`
	Color     string            `json:"color"`
	Text      string            `json:"text"`
	Badges    []Badge           `json:"badges"`
	Emotes    []Emote           `json:"emotes"`
	Timestamp time.Time         `json:"timestamp"`
	IsAction  bool              `json:"isAction"`
	Tags      map[string]string `json:"tags"`

	// Twitch USERNOTICE event fields (zero values for regular messages)
	EventType     string            `json:"eventType"`     // e.g. "sub", "resub", "subgift", "raid", "announcement"
	SystemMessage string            `json:"systemMessage"` // Twitch-generated text (e.g. "X subscribed for 12 months")
	EventData     map[string]string `json:"eventData"`     // extra metadata (gift count, viewer count, sub plan, etc.)

	// YouTube-specific fields (zero values for Twitch messages)
	Avatar          string            `json:"avatar"`          // profile image URL
	Fragments       []MessageFragment `json:"fragments"`       // structured message segments (text + emotes interleaved)
	SuperChat       *SuperChatDetails `json:"superChat"`       // non-nil for Super Chat messages
	MembershipEvent bool              `json:"membershipEvent"` // true for membership join/gift events
}
