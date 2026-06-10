package chat

import (
	"testing"
)

func TestFragmentize_PlainText(t *testing.T) {
	frags := Fragmentize("hello world", nil)

	if len(frags) != 1 {
		t.Fatalf("len = %d, want 1", len(frags))
	}

	if frags[0].Type != "text" {
		t.Errorf("Type = %q, want text", frags[0].Type)
	}

	if frags[0].Text != "hello world" {
		t.Errorf("Text = %q, want %q", frags[0].Text, "hello world")
	}

	if frags[0].URL != "" {
		t.Errorf("URL = %q, want empty", frags[0].URL)
	}
}

func TestFragmentize_SingleEmote(t *testing.T) {
	emotes := []Emote{
		{ID: "25", Start: 0, End: 4, URL: "https://cdn.example.com/emote.png"},
	}

	frags := Fragmentize("Kappa hello", emotes)

	if len(frags) != 2 {
		t.Fatalf("len = %d, want 2", len(frags))
	}

	if frags[0].Type != "emote" {
		t.Errorf("frags[0].Type = %q, want emote", frags[0].Type)
	}

	if frags[0].Text != "Kappa" {
		t.Errorf("frags[0].Text = %q, want Kappa", frags[0].Text)
	}

	if frags[0].URL != "https://cdn.example.com/emote.png" {
		t.Errorf("frags[0].URL = %q, want https://cdn.example.com/emote.png", frags[0].URL)
	}

	if frags[1].Type != "text" {
		t.Errorf("frags[1].Type = %q, want text", frags[1].Type)
	}

	if frags[1].Text != " hello" {
		t.Errorf("frags[1].Text = %q, want %q", frags[1].Text, " hello")
	}
}

func TestFragmentize_AdjacentEmotes(t *testing.T) {
	emotes := []Emote{
		{ID: "25", Start: 0, End: 4, URL: "https://cdn.example.com/kappa.png"},
		{ID: "1902", Start: 6, End: 10, URL: "https://cdn.example.com/keepo.png"},
	}

	frags := Fragmentize("Kappa Keepo", emotes)

	if len(frags) != 3 {
		t.Fatalf("len = %d, want 3", len(frags))
	}

	if frags[0].Type != "emote" || frags[0].Text != "Kappa" {
		t.Errorf("frags[0] = {%q, %q}, want {emote, Kappa}", frags[0].Type, frags[0].Text)
	}

	if frags[1].Type != "text" || frags[1].Text != " " {
		t.Errorf("frags[1] = {%q, %q}, want {text, \" \"}", frags[1].Type, frags[1].Text)
	}

	if frags[2].Type != "emote" || frags[2].Text != "Keepo" {
		t.Errorf("frags[2] = {%q, %q}, want {emote, Keepo}", frags[2].Type, frags[2].Text)
	}
}

func TestFragmentize_EmoteAtStart(t *testing.T) {
	emotes := []Emote{
		{ID: "25", Start: 0, End: 4, URL: "https://cdn.example.com/kappa.png"},
	}

	frags := Fragmentize("Kappa", emotes)

	if len(frags) != 1 {
		t.Fatalf("len = %d, want 1", len(frags))
	}

	if frags[0].Type != "emote" || frags[0].Text != "Kappa" {
		t.Errorf("frags[0] = {%q, %q}, want {emote, Kappa}", frags[0].Type, frags[0].Text)
	}
}

func TestFragmentize_EmoteAtEnd(t *testing.T) {
	emotes := []Emote{
		{ID: "25", Start: 6, End: 10, URL: "https://cdn.example.com/kappa.png"},
	}

	frags := Fragmentize("hello Kappa", emotes)

	if len(frags) != 2 {
		t.Fatalf("len = %d, want 2", len(frags))
	}

	if frags[0].Type != "text" || frags[0].Text != "hello " {
		t.Errorf("frags[0] = {%q, %q}, want {text, \"hello \"}", frags[0].Type, frags[0].Text)
	}

	if frags[1].Type != "emote" || frags[1].Text != "Kappa" {
		t.Errorf("frags[1] = {%q, %q}, want {emote, Kappa}", frags[1].Type, frags[1].Text)
	}
}

func TestFragmentize_ThirdPartyEmoteWithURL(t *testing.T) {
	emotes := []Emote{
		{ID: "BTTV123", Start: 0, End: 5, URL: "https://cdn.betterttv.net/emote/BTTV123/1x"},
	}

	frags := Fragmentize("peepoG hey", emotes)

	if len(frags) != 2 {
		t.Fatalf("len = %d, want 2", len(frags))
	}

	if frags[0].Type != "emote" {
		t.Errorf("frags[0].Type = %q, want emote", frags[0].Type)
	}

	if frags[0].URL != "https://cdn.betterttv.net/emote/BTTV123/1x" {
		t.Errorf("frags[0].URL = %q, want BTTV CDN URL", frags[0].URL)
	}
}

func TestFragmentize_EmojiBeforeEmote(t *testing.T) {
	emotes := []Emote{
		{ID: "25", Start: 2, End: 6, URL: "https://cdn.example.com/kappa.png"},
	}

	frags := Fragmentize("🎉 Kappa", emotes)

	if len(frags) != 2 {
		t.Fatalf("len = %d, want 2, got fragments: %+v", len(frags), frags)
	}

	if frags[0].Type != "text" || frags[0].Text != "🎉 " {
		t.Errorf("frags[0] = {%q, %q}, want {text, \"🎉 \"}", frags[0].Type, frags[0].Text)
	}

	if frags[1].Type != "emote" || frags[1].Text != "Kappa" {
		t.Errorf("frags[1] = {%q, %q}, want {emote, Kappa}", frags[1].Type, frags[1].Text)
	}
}

func TestFragmentize_OverlappingRangesDropped(t *testing.T) {
	emotes := []Emote{
		{ID: "25", Start: 0, End: 4, URL: "https://cdn.example.com/kappa.png"},
		{ID: "bad", Start: 2, End: 8, URL: "https://cdn.example.com/bad.png"},
	}

	frags := Fragmentize("Kappa hello", emotes)

	for _, f := range frags {
		if f.Type == "emote" && f.Text == "" {
			t.Errorf("emote fragment has empty text: %+v", f)
		}
	}

	emoteCount := 0

	for _, f := range frags {
		if f.Type == "emote" {
			emoteCount++
		}
	}

	if emoteCount != 1 {
		t.Errorf("emoteCount = %d, want 1 (overlapping emote should be dropped)", emoteCount)
	}
}

func TestFragmentize_OutOfBoundsRangeDropped(t *testing.T) {
	emotes := []Emote{
		{ID: "bad", Start: 0, End: 100, URL: "https://cdn.example.com/bad.png"},
		{ID: "25", Start: 0, End: 4, URL: "https://cdn.example.com/kappa.png"},
	}

	frags := Fragmentize("Kappa", emotes)

	emoteCount := 0

	for _, f := range frags {
		if f.Type == "emote" {
			emoteCount++
		}
	}

	if emoteCount != 1 {
		t.Errorf("emoteCount = %d, want 1 (out-of-bounds emote should be dropped)", emoteCount)
	}
}

func TestFragmentize_EmptyText(t *testing.T) {
	frags := Fragmentize("", nil)

	if len(frags) != 0 {
		t.Fatalf("len = %d, want 0 for empty text", len(frags))
	}
}

func TestFragmentize_NoEmotes(t *testing.T) {
	frags := Fragmentize("just some text", nil)

	if len(frags) != 1 {
		t.Fatalf("len = %d, want 1", len(frags))
	}

	if frags[0].Text != "just some text" {
		t.Errorf("Text = %q, want %q", frags[0].Text, "just some text")
	}
}
