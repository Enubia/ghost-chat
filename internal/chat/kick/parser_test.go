package kick

import (
	"testing"
	"time"
)

func TestResolveChannelSlug(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"xqc", "xqc"},
		{"XQC", "xqc"},
		{"https://kick.com/xqc", "xqc"},
		{"kick.com/xqc", "xqc"},
		{"https://www.kick.com/xqc", "xqc"},
		{"  xqc  ", "xqc"},
	}
	for _, tt := range tests {
		got, err := ResolveChannelSlug(tt.input)
		if err != nil {
			t.Errorf("ResolveChannelSlug(%q) error: %v", tt.input, err)
			continue
		}
		if got != tt.want {
			t.Errorf("ResolveChannelSlug(%q) = %q, want %q", tt.input, got, tt.want)
		}
	}
}

func TestResolveChannelSlugEmpty(t *testing.T) {
	if _, err := ResolveChannelSlug(""); err == nil {
		t.Error("expected error for empty input")
	}
	if _, err := ResolveChannelSlug("https://kick.com/"); err == nil {
		t.Error("expected error for bare domain")
	}
}

func TestParseContent_PlainText(t *testing.T) {
	frags, text := parseContent("hello world")
	if len(frags) != 1 || frags[0].Type != "text" || frags[0].Text != "hello world" {
		t.Errorf("unexpected fragments: %+v", frags)
	}
	if text != "hello world" {
		t.Errorf("text = %q", text)
	}
}

func TestParseContent_SingleEmote(t *testing.T) {
	frags, text := parseContent("[emote:12345:KEKW]")
	if len(frags) != 1 {
		t.Fatalf("expected 1 fragment, got %d: %+v", len(frags), frags)
	}
	if frags[0].Type != "emote" || frags[0].Text != "KEKW" {
		t.Errorf("frag[0]: %+v", frags[0])
	}
	if frags[0].URL != "https://files.kick.com/emotes/12345/fullsize" {
		t.Errorf("URL = %q", frags[0].URL)
	}
	if text != "KEKW" {
		t.Errorf("text = %q", text)
	}
}

func TestParseContent_Mixed(t *testing.T) {
	frags, text := parseContent("hello [emote:111:PogChamp] world [emote:222:KEKW]!")
	if len(frags) != 5 {
		t.Fatalf("expected 5 fragments, got %d: %+v", len(frags), frags)
	}
	if frags[0].Type != "text" || frags[0].Text != "hello " {
		t.Errorf("frag[0]: %+v", frags[0])
	}
	if frags[1].Type != "emote" || frags[1].Text != "PogChamp" {
		t.Errorf("frag[1]: %+v", frags[1])
	}
	if frags[2].Type != "text" || frags[2].Text != " world " {
		t.Errorf("frag[2]: %+v", frags[2])
	}
	if frags[3].Type != "emote" || frags[3].Text != "KEKW" {
		t.Errorf("frag[3]: %+v", frags[3])
	}
	if frags[4].Type != "text" || frags[4].Text != "!" {
		t.Errorf("frag[4]: %+v", frags[4])
	}
	if text != "hello PogChamp world KEKW!" {
		t.Errorf("text = %q", text)
	}
}

func TestParseContent_EmoteAtStart(t *testing.T) {
	frags, _ := parseContent("[emote:1:Pog] hello")
	if frags[0].Type != "emote" {
		t.Errorf("first fragment should be emote, got %+v", frags[0])
	}
	if frags[1].Type != "text" || frags[1].Text != " hello" {
		t.Errorf("frag[1]: %+v", frags[1])
	}
}


func TestParseTimestamp(t *testing.T) {
	ts := parseTimestamp("2025-01-14T16:08:06Z")
	want := time.Date(2025, 1, 14, 16, 8, 6, 0, time.UTC)
	if !ts.Equal(want) {
		t.Errorf("got %v, want %v", ts, want)
	}

	before := time.Now()
	fallback := parseTimestamp("not-a-date")
	after := time.Now()
	if fallback.Before(before) || fallback.After(after) {
		t.Error("bad timestamp should return ~time.Now()")
	}
}

func TestParseMessage(t *testing.T) {
	km := KickChatMessage{
		ID:        "msg-001",
		Content:   "hello [emote:42:KEKW]",
		CreatedAt: "2025-01-14T16:08:06Z",
		Sender: KickSender{
			Username: "testuser",
			Identity: &KickIdentity{
				Color:  "#FF5733",
				Badges: []KickBadge{{Type: "moderator", Text: "Moderator"}},
			},
		},
	}
	msg := parseMessage(km)
	if msg.Platform != "kick" {
		t.Errorf("Platform = %q", msg.Platform)
	}
	if msg.Username != "testuser" {
		t.Errorf("Username = %q", msg.Username)
	}
	if msg.Color != "#FF5733" {
		t.Errorf("Color = %q", msg.Color)
	}
	if msg.Badges != nil {
		t.Errorf("Kick messages should have no badges, got %+v", msg.Badges)
	}
	if len(msg.Fragments) != 2 {
		t.Errorf("Fragments = %+v", msg.Fragments)
	}
}

func TestParseMessageNoIdentity(t *testing.T) {
	km := KickChatMessage{
		ID:        "msg-002",
		Content:   "hello",
		CreatedAt: "2025-01-14T16:08:06Z",
		Sender:    KickSender{Username: "nocolor"},
	}
	msg := parseMessage(km)
	if msg.Color != "" {
		t.Errorf("Color should be empty, got %q", msg.Color)
	}
	if msg.Badges != nil {
		t.Errorf("Badges should be nil, got %+v", msg.Badges)
	}
}
