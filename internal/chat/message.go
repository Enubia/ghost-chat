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
}
