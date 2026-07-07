package twitch

import (
	"encoding/json"
	"testing"
	"time"

	"ghost-chat/internal/chat"
)

func TestRedemptionToMessage_FromFixture(t *testing.T) {
	fixture := `{
		"id": "redeem-123",
		"broadcaster_user_id": "1971641",
		"broadcaster_user_login": "streamer",
		"broadcaster_user_name": "Streamer",
		"user_id": "9001",
		"user_login": "coolviewer",
		"user_name": "CoolViewer",
		"user_input": "pineapple please",
		"status": "unfulfilled",
		"redeemed_at": "2020-07-15T17:16:03.17106713Z",
		"reward": {
			"id": "reward-abc",
			"title": "Hydrate!",
			"cost": 500,
			"prompt": "Make the streamer drink water"
		}
	}`

	var event RedemptionEvent

	if err := json.Unmarshal([]byte(fixture), &event); err != nil {
		t.Fatalf("unmarshal fixture: %v", err)
	}

	msg := RedemptionToMessage(event)

	if msg.Platform != chat.PlatformTwitch {
		t.Errorf("Platform = %q, want twitch", msg.Platform)
	}

	if msg.ID != "redeem-123" {
		t.Errorf("ID = %q, want redeem-123", msg.ID)
	}

	if msg.EventType != EventTypeChannelPoints {
		t.Errorf("EventType = %q, want %q", msg.EventType, EventTypeChannelPoints)
	}

	if EventTypeChannelPoints != "channel_points_redemption" {
		t.Errorf("EventTypeChannelPoints = %q, want channel_points_redemption", EventTypeChannelPoints)
	}

	if msg.Username != "CoolViewer" {
		t.Errorf("Username = %q, want CoolViewer", msg.Username)
	}

	if msg.Text != "pineapple please" {
		t.Errorf("Text = %q, want %q", msg.Text, "pineapple please")
	}

	if msg.EventData["reward"] != "Hydrate!" {
		t.Errorf("EventData[reward] = %q, want Hydrate!", msg.EventData["reward"])
	}

	if msg.EventData["cost"] != "500" {
		t.Errorf("EventData[cost] = %q, want 500", msg.EventData["cost"])
	}

	if msg.SystemMessage != "CoolViewer redeemed Hydrate!" {
		t.Errorf("SystemMessage = %q, want %q", msg.SystemMessage, "CoolViewer redeemed Hydrate!")
	}

	want := time.Date(2020, 7, 15, 17, 16, 3, 171067130, time.UTC)

	if !msg.Timestamp.Equal(want) {
		t.Errorf("Timestamp = %v, want %v", msg.Timestamp, want)
	}
}

func TestRedemptionToMessage_NoUserInput(t *testing.T) {
	event := RedemptionEvent{
		ID:        "redeem-456",
		UserName:  "Quietviewer",
		UserLogin: "quietviewer",
		Status:    "fulfilled",
	}

	event.Reward.Title = "Highlight"
	event.Reward.Cost = 100

	msg := RedemptionToMessage(event)

	if msg.Text != "" {
		t.Errorf("Text = %q, want empty (reward without input)", msg.Text)
	}

	if msg.EventData["cost"] != "100" {
		t.Errorf("EventData[cost] = %q, want 100", msg.EventData["cost"])
	}
}

func TestRedemptionToMessage_FallsBackToUserLogin(t *testing.T) {
	event := RedemptionEvent{
		ID:        "redeem-789",
		UserLogin: "loginonly",
	}

	msg := RedemptionToMessage(event)

	if msg.Username != "loginonly" {
		t.Errorf("Username = %q, want loginonly (fallback to login)", msg.Username)
	}
}

func TestRedemptionToMessage_UnparseableTimestamp(t *testing.T) {
	event := RedemptionEvent{
		ID:         "redeem-000",
		UserName:   "Someone",
		RedeemedAt: "not-a-timestamp",
	}

	msg := RedemptionToMessage(event)

	if !msg.Timestamp.IsZero() {
		t.Errorf("Timestamp = %v, want zero time for unparseable input", msg.Timestamp)
	}
}
