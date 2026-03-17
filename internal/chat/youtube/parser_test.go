package youtube

import (
	"testing"
	"time"
)

func TestArgbToHex(t *testing.T) {
	tests := []struct {
		argb int64
		want string
	}{
		{0xFFFFD600, "#FFD600"},
		{0xFF0000FF, "#0000FF"},
		{0xFF000000, "#000000"},
		{4294956544, "#FFD600"}, // real YouTube super chat yellow header (0xFFFFD600)
	}
	for _, tt := range tests {
		if got := argbToHex(tt.argb); got != tt.want {
			t.Errorf("argbToHex(%d) = %q, want %q", tt.argb, got, tt.want)
		}
	}
}

func TestParseTimestampUsec(t *testing.T) {
	ts := parseTimestampUsec("1616164860553335")
	want := time.UnixMilli(1616164860553)
	if !ts.Equal(want) {
		t.Errorf("parseTimestampUsec: got %v, want %v", ts, want)
	}

	before := time.Now()
	fallback := parseTimestampUsec("not-a-number")
	after := time.Now()
	if fallback.Before(before) || fallback.After(after) {
		t.Errorf("parseTimestampUsec fallback should return ~time.Now()")
	}
}

func TestLargestThumbnail(t *testing.T) {
	if got := largestThumbnail(nil); got != "" {
		t.Errorf("largestThumbnail(nil) = %q, want \"\"", got)
	}

	thumbs := []Thumbnail{
		{URL: "small.jpg", Width: 32},
		{URL: "large.jpg", Width: 64},
		{URL: "medium.jpg", Width: 48},
	}
	if got := largestThumbnail(thumbs); got != "large.jpg" {
		t.Errorf("largestThumbnail: got %q, want %q", got, "large.jpg")
	}
}

func TestParseRuns(t *testing.T) {
	runs := []Run{
		{Text: "hello "},
		{
			Emoji: &Emoji{
				EmojiID:       "UC123/abc",
				IsCustomEmoji: true,
				Shortcuts:     []string{":pekoSmile:"},
				Image: ImageData{
					Thumbnails: []Thumbnail{
						{URL: "emote_small.png", Width: 24},
						{URL: "emote_large.png", Width: 48},
					},
				},
			},
		},
		{Text: " world"},
	}

	frags := parseRuns(runs)

	if len(frags) != 3 {
		t.Fatalf("expected 3 fragments, got %d", len(frags))
	}
	if frags[0].Type != "text" || frags[0].Text != "hello " {
		t.Errorf("frag[0]: %+v", frags[0])
	}
	if frags[1].Type != "emote" || frags[1].Text != ":pekoSmile:" || frags[1].URL != "emote_large.png" {
		t.Errorf("frag[1]: %+v", frags[1])
	}
	if frags[2].Type != "text" || frags[2].Text != " world" {
		t.Errorf("frag[2]: %+v", frags[2])
	}
}

func TestParseRunsNoImageFallsBackToText(t *testing.T) {
	runs := []Run{
		{
			Emoji: &Emoji{
				EmojiID:   "wave",
				Shortcuts: []string{":wave:"},
				Image:     ImageData{},
			},
		},
	}

	frags := parseRuns(runs)

	if len(frags) != 1 || frags[0].Type != "text" || frags[0].Text != ":wave:" {
		t.Errorf("expected text fallback for emoji with no image, got %+v", frags)
	}
}

func TestFlattenRuns(t *testing.T) {
	runs := []Run{
		{Text: "hello "},
		{Emoji: &Emoji{EmojiID: "wave", Shortcuts: []string{":wave:"}}},
		{Text: " world"},
	}
	if got := flattenRuns(runs); got != "hello :wave: world" {
		t.Errorf("flattenRuns: got %q, want %q", got, "hello :wave: world")
	}
}

func TestFlattenRunsFallsBackToEmojiID(t *testing.T) {
	runs := []Run{
		{Emoji: &Emoji{EmojiID: "yt-emoji-wave"}},
	}
	if got := flattenRuns(runs); got != "yt-emoji-wave" {
		t.Errorf("flattenRuns: got %q, want %q", got, "yt-emoji-wave")
	}
}

func TestParseBadges(t *testing.T) {
	badges := []AuthorBadge{
		{LiveChatAuthorBadgeRenderer: BadgeRenderer{
			Icon:    &BadgeIcon{IconType: "MODERATOR"},
			Tooltip: "Moderator",
		}},
		{LiveChatAuthorBadgeRenderer: BadgeRenderer{
			CustomThumbnail: &Thumbnails{Thumbnails: []Thumbnail{{URL: "member.png", Width: 32}}},
			Tooltip:         "Member (2 months)",
		}},
	}

	result := parseBadges(badges)

	if len(result) != 2 {
		t.Fatalf("expected 2 badges, got %d", len(result))
	}
	if result[0].Name != "moderator" {
		t.Errorf("badge[0].Name = %q, want %q", result[0].Name, "moderator")
	}
	if result[1].Name != "member" || result[1].URL != "member.png" || result[1].Version != "Member (2 months)" {
		t.Errorf("badge[1]: %+v", result[1])
	}
}

func TestParseBadgesEmpty(t *testing.T) {
	if got := parseBadges(nil); got != nil {
		t.Errorf("parseBadges(nil) should return nil, got %v", got)
	}
}

func TestParseTextMessage(t *testing.T) {
	r := LiveChatTextMessageRenderer{
		MessageRendererBase: MessageRendererBase{
			ID:            "msg-001",
			TimestampUsec: "1616164860553335",
			AuthorName:    SimpleText{SimpleText: "Tsuki"},
			AuthorPhoto:   Thumbnails{Thumbnails: []Thumbnail{{URL: "avatar.jpg", Width: 64}}},
		},
		Message: Runs{Runs: []Run{{Text: "hello"}}},
	}

	msg := parseTextMessage(r)

	if msg.Platform != "youtube" {
		t.Errorf("Platform = %q", msg.Platform)
	}
	if msg.ID != "msg-001" {
		t.Errorf("ID = %q", msg.ID)
	}
	if msg.Username != "Tsuki" {
		t.Errorf("Username = %q", msg.Username)
	}
	if msg.Avatar != "avatar.jpg" {
		t.Errorf("Avatar = %q", msg.Avatar)
	}
	if msg.Text != "hello" {
		t.Errorf("Text = %q", msg.Text)
	}
	if len(msg.Fragments) != 1 || msg.Fragments[0].Text != "hello" {
		t.Errorf("Fragments = %+v", msg.Fragments)
	}
	if msg.SuperChat != nil {
		t.Errorf("SuperChat should be nil for text messages")
	}
	if msg.MembershipEvent {
		t.Errorf("MembershipEvent should be false for text messages")
	}
}

func TestParsePaidMessage(t *testing.T) {
	msg := Runs{Runs: []Run{{Text: "thanks!"}}}
	r := LiveChatPaidMessageRenderer{
		MessageRendererBase: MessageRendererBase{
			ID:         "paid-001",
			AuthorName: SimpleText{SimpleText: "Supporter"},
		},
		Message:               &msg,
		PurchaseAmountText:    SimpleText{SimpleText: "€10.00"},
		HeaderBackgroundColor: 0xFFFFD600,
		BodyBackgroundColor:   0xFFFFED00,
	}

	result := parsePaidMessage(r)

	if result.SuperChat == nil {
		t.Fatal("SuperChat should not be nil for paid messages")
	}
	if result.SuperChat.Amount != "€10.00" {
		t.Errorf("Amount = %q", result.SuperChat.Amount)
	}
	if result.SuperChat.HeaderColor != "#FFD600" {
		t.Errorf("HeaderColor = %q", result.SuperChat.HeaderColor)
	}
	if result.Text != "thanks!" {
		t.Errorf("Text = %q", result.Text)
	}
}

func TestParsePaidMessageNoMessage(t *testing.T) {
	r := LiveChatPaidMessageRenderer{
		MessageRendererBase:   MessageRendererBase{ID: "paid-002"},
		Message:               nil,
		PurchaseAmountText:    SimpleText{SimpleText: "$2.00"},
		HeaderBackgroundColor: 0xFF1565C0,
		BodyBackgroundColor:   0xFF1565C0,
	}

	result := parsePaidMessage(r)

	if result.SuperChat == nil {
		t.Fatal("SuperChat should not be nil")
	}
	if result.Text != "" {
		t.Errorf("Text should be empty for no-message super chat, got %q", result.Text)
	}
	if len(result.Fragments) != 0 {
		t.Errorf("Fragments should be empty, got %v", result.Fragments)
	}
}

func TestParseMembership(t *testing.T) {
	r := LiveChatMembershipItemRenderer{
		MessageRendererBase: MessageRendererBase{
			ID:         "mem-001",
			AuthorName: SimpleText{SimpleText: "NewMember"},
		},
		HeaderSubtext: Runs{Runs: []Run{{Text: "New member"}}},
	}

	result := parseMembership(r)

	if !result.MembershipEvent {
		t.Errorf("MembershipEvent should be true")
	}
	if result.Text != "New member" {
		t.Errorf("Text = %q, want %q", result.Text, "New member")
	}
}

func TestParseActions(t *testing.T) {
	actions := []Action{
		{AddChatItemAction: &AddChatItemAction{
			Item: ChatItem{
				LiveChatTextMessageRenderer: &LiveChatTextMessageRenderer{
					MessageRendererBase: MessageRendererBase{
						ID:         "a1",
						AuthorName: SimpleText{SimpleText: "User1"},
					},
					Message: Runs{Runs: []Run{{Text: "hi"}}},
				},
			},
		}},
		{AddChatItemAction: nil},
		{AddChatItemAction: &AddChatItemAction{
			Item: ChatItem{
				LiveChatMembershipItemRenderer: &LiveChatMembershipItemRenderer{
					MessageRendererBase: MessageRendererBase{
						ID:         "a2",
						AuthorName: SimpleText{SimpleText: "NewMember"},
					},
					HeaderSubtext: Runs{Runs: []Run{{Text: "New member"}}},
				},
			},
		}},
	}

	msgs := parseActions(actions)

	if len(msgs) != 2 {
		t.Fatalf("expected 2 messages, got %d", len(msgs))
	}
	if msgs[0].Username != "User1" {
		t.Errorf("msgs[0].Username = %q", msgs[0].Username)
	}
	if !msgs[1].MembershipEvent {
		t.Errorf("msgs[1] should be a membership event")
	}
}
