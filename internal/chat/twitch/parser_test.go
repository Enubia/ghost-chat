package twitch

import (
	"testing"
	"time"

	"ghost-chat/internal/chat"
)

func TestParseTags(t *testing.T) {
	raw := "badge-info=;badges=broadcaster/1;color=#FF0000;display-name=TestUser;emotes=25:0-4"
	tags := ParseTags(raw)

	tests := []struct {
		key  string
		want string
	}{
		{"badge-info", ""},
		{"badges", "broadcaster/1"},
		{"color", "#FF0000"},
		{"display-name", "TestUser"},
		{"emotes", "25:0-4"},
	}

	for _, tt := range tests {
		if got := tags[tt.key]; got != tt.want {
			t.Errorf("ParseTags[%q] = %q, want %q", tt.key, got, tt.want)
		}
	}
}

func TestParseIRC_PRIVMSG(t *testing.T) {
	line := "@badge-info=;badges=broadcaster/1;color=#FF0000;display-name=TestUser;emotes=;id=abc-123;tmi-sent-ts=1700000000000 :testuser!testuser@testuser.tmi.twitch.tv PRIVMSG #testchannel :Hello world!"

	msg := ParseIRC(line)

	if msg.Command != "PRIVMSG" {
		t.Errorf("Command = %q, want PRIVMSG", msg.Command)
	}
	if msg.Channel != "#testchannel" {
		t.Errorf("Channel = %q, want #testchannel", msg.Channel)
	}
	if msg.Params != "Hello world!" {
		t.Errorf("Params = %q, want %q", msg.Params, "Hello world!")
	}
	if msg.Tags["display-name"] != "TestUser" {
		t.Errorf("Tags[display-name] = %q, want TestUser", msg.Tags["display-name"])
	}
	if msg.Tags["id"] != "abc-123" {
		t.Errorf("Tags[id] = %q, want abc-123", msg.Tags["id"])
	}
}

func TestParseIRC_PING(t *testing.T) {
	line := "PING :tmi.twitch.tv"
	msg := ParseIRC(line)

	if msg.Command != "PING" {
		t.Errorf("Command = %q, want PING", msg.Command)
	}
	if msg.Params != "tmi.twitch.tv" {
		t.Errorf("Params = %q, want tmi.twitch.tv", msg.Params)
	}
}

func TestParseIRC_NoTags(t *testing.T) {
	line := ":testuser!testuser@testuser.tmi.twitch.tv PRIVMSG #channel :no tags here"
	msg := ParseIRC(line)

	if msg.Command != "PRIVMSG" {
		t.Errorf("Command = %q, want PRIVMSG", msg.Command)
	}
	if msg.Params != "no tags here" {
		t.Errorf("Params = %q, want %q", msg.Params, "no tags here")
	}
	if len(msg.Tags) != 0 {
		t.Errorf("Tags should be empty, got %v", msg.Tags)
	}
}

func TestParseBadges(t *testing.T) {
	badges := ParseBadges("broadcaster/1,subscriber/12,premium/1")

	want := []chat.Badge{
		{Name: "broadcaster", Version: "1"},
		{Name: "subscriber", Version: "12"},
		{Name: "premium", Version: "1"},
	}

	if len(badges) != len(want) {
		t.Fatalf("len(badges) = %d, want %d", len(badges), len(want))
	}
	for i, b := range badges {
		if b != want[i] {
			t.Errorf("badges[%d] = %+v, want %+v", i, b, want[i])
		}
	}
}

func TestParseBadges_Empty(t *testing.T) {
	badges := ParseBadges("")
	if badges != nil {
		t.Errorf("expected nil for empty badges, got %v", badges)
	}
}

func TestParseEmotes(t *testing.T) {
	emotes := ParseEmotes("25:0-4,12-16/1902:6-10")

	want := []chat.Emote{
		{ID: "25", Start: 0, End: 4},
		{ID: "25", Start: 12, End: 16},
		{ID: "1902", Start: 6, End: 10},
	}

	if len(emotes) != len(want) {
		t.Fatalf("len(emotes) = %d, want %d", len(emotes), len(want))
	}
	for i, e := range emotes {
		if e != want[i] {
			t.Errorf("emotes[%d] = %+v, want %+v", i, e, want[i])
		}
	}
}

func TestParseEmotes_Empty(t *testing.T) {
	emotes := ParseEmotes("")
	if emotes != nil {
		t.Errorf("expected nil for empty emotes, got %v", emotes)
	}
}

func TestParseTimestamp(t *testing.T) {
	ts := ParseTimestamp("1700000000000")
	want := time.UnixMilli(1700000000000)

	if !ts.Equal(want) {
		t.Errorf("ParseTimestamp = %v, want %v", ts, want)
	}
}

func TestToChatMessage_Basic(t *testing.T) {
	line := "@badge-info=;badges=broadcaster/1;color=#FF0000;display-name=TestUser;emotes=25:0-4;id=msg-123;tmi-sent-ts=1700000000000 :testuser!testuser@testuser.tmi.twitch.tv PRIVMSG #testchannel :Kappa hello"
	irc := ParseIRC(line)
	msg := ToChatMessage(irc)

	if msg.Platform != "twitch" {
		t.Errorf("Platform = %q, want twitch", msg.Platform)
	}
	if msg.ID != "msg-123" {
		t.Errorf("ID = %q, want msg-123", msg.ID)
	}
	if msg.Username != "TestUser" {
		t.Errorf("Username = %q, want TestUser", msg.Username)
	}
	if msg.Color != "#FF0000" {
		t.Errorf("Color = %q, want #FF0000", msg.Color)
	}
	if msg.Text != "Kappa hello" {
		t.Errorf("Text = %q, want %q", msg.Text, "Kappa hello")
	}
	if len(msg.Badges) != 1 || msg.Badges[0].Name != "broadcaster" {
		t.Errorf("Badges = %+v, want [{broadcaster 1}]", msg.Badges)
	}
	if len(msg.Emotes) != 1 || msg.Emotes[0].ID != "25" {
		t.Errorf("Emotes = %+v, want [{25 0 4}]", msg.Emotes)
	}
	if msg.IsAction {
		t.Error("IsAction should be false")
	}
}

func TestToChatMessage_Action(t *testing.T) {
	line := "@display-name=TestUser;id=msg-456;tmi-sent-ts=1700000000000 :testuser!testuser@testuser.tmi.twitch.tv PRIVMSG #testchannel :\x01ACTION dances around\x01"
	irc := ParseIRC(line)
	msg := ToChatMessage(irc)

	if !msg.IsAction {
		t.Error("IsAction should be true for /me messages")
	}
	if msg.Text != "dances around" {
		t.Errorf("Text = %q, want %q", msg.Text, "dances around")
	}
}
