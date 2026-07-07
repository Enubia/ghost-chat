package twitch

import (
	"strconv"
	"time"

	"ghost-chat/internal/chat"
)

const EventTypeChannelPoints = "channel_points_redemption"

type RedemptionEvent struct {
	ID                   string `json:"id"`
	BroadcasterUserID    string `json:"broadcaster_user_id"`
	BroadcasterUserLogin string `json:"broadcaster_user_login"`
	BroadcasterUserName  string `json:"broadcaster_user_name"`
	UserID               string `json:"user_id"`
	UserLogin            string `json:"user_login"`
	UserName             string `json:"user_name"`
	UserInput            string `json:"user_input"`
	Status               string `json:"status"`
	RedeemedAt           string `json:"redeemed_at"`
	Reward               struct {
		ID     string `json:"id"`
		Title  string `json:"title"`
		Cost   int    `json:"cost"`
		Prompt string `json:"prompt"`
	} `json:"reward"`
}

func RedemptionToMessage(e RedemptionEvent) chat.ChatMessage {
	username := e.UserName

	if username == "" {
		username = e.UserLogin
	}

	var timestamp time.Time

	if parsed, err := time.Parse(time.RFC3339, e.RedeemedAt); err == nil {
		timestamp = parsed
	}

	eventData := map[string]string{
		"reward": e.Reward.Title,
		"cost":   strconv.Itoa(e.Reward.Cost),
	}

	return chat.ChatMessage{
		Platform:      chat.PlatformTwitch,
		ID:            e.ID,
		Username:      username,
		Text:          e.UserInput,
		Timestamp:     timestamp,
		EventType:     EventTypeChannelPoints,
		SystemMessage: e.UserName + " redeemed " + e.Reward.Title,
		EventData:     eventData,
	}
}
