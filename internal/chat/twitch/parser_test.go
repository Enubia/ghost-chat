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

func TestParseIRC_USERNOTICE(t *testing.T) {
	line := `@badge-info=subscriber/12;badges=subscriber/12;color=#FF0000;display-name=TestUser;emotes=;id=evt-123;msg-id=resub;msg-param-cumulative-months=12;msg-param-sub-plan=1000;msg-param-sub-plan-name=Channel\sSubscription;system-msg=TestUser\shas\ssubscribed\sfor\s12\smonths!;tmi-sent-ts=1700000000000 :testuser!testuser@testuser.tmi.twitch.tv USERNOTICE #testchannel :Love this stream!`

	msg := ParseIRC(line)

	if msg.Command != "USERNOTICE" {
		t.Errorf("Command = %q, want USERNOTICE", msg.Command)
	}

	if msg.Tags["msg-id"] != "resub" {
		t.Errorf("Tags[msg-id] = %q, want resub", msg.Tags["msg-id"])
	}

	if msg.Params != "Love this stream!" {
		t.Errorf("Params = %q, want %q", msg.Params, "Love this stream!")
	}
}

func TestToEventMessage_Resub(t *testing.T) {
	line := `@badge-info=subscriber/12;badges=subscriber/12;color=#FF0000;display-name=TestUser;emotes=;id=evt-123;msg-id=resub;msg-param-cumulative-months=12;msg-param-sub-plan=1000;msg-param-sub-plan-name=Channel\sSubscription;system-msg=TestUser\shas\ssubscribed\sfor\s12\smonths!;tmi-sent-ts=1700000000000 :testuser!testuser@testuser.tmi.twitch.tv USERNOTICE #testchannel :Love this stream!`
	irc := ParseIRC(line)
	msg := ToEventMessage(irc)

	if msg.Platform != "twitch" {
		t.Errorf("Platform = %q, want twitch", msg.Platform)
	}

	if msg.EventType != "resub" {
		t.Errorf("EventType = %q, want resub", msg.EventType)
	}

	if msg.SystemMessage != "TestUser has subscribed for 12 months!" {
		t.Errorf("SystemMessage = %q, want %q", msg.SystemMessage, "TestUser has subscribed for 12 months!")
	}

	if msg.Text != "Love this stream!" {
		t.Errorf("Text = %q, want %q", msg.Text, "Love this stream!")
	}

	if msg.Username != "TestUser" {
		t.Errorf("Username = %q, want TestUser", msg.Username)
	}

	if msg.EventData["months"] != "12" {
		t.Errorf("EventData[months] = %q, want 12", msg.EventData["months"])
	}

	if msg.EventData["plan"] != "1000" {
		t.Errorf("EventData[plan] = %q, want 1000", msg.EventData["plan"])
	}
}

func TestToEventMessage_SubGift(t *testing.T) {
	line := `@badge-info=subscriber/1;badges=subscriber/0;color=#00FF00;display-name=Gifter;id=evt-456;msg-id=subgift;msg-param-gift-months=1;msg-param-recipient-display-name=Lucky;msg-param-sub-plan=1000;system-msg=Gifter\sgifted\sa\sTier\s1\ssub\sto\sLucky!;tmi-sent-ts=1700000000000 :gifter!gifter@gifter.tmi.twitch.tv USERNOTICE #testchannel`
	irc := ParseIRC(line)
	msg := ToEventMessage(irc)

	if msg.EventType != "subgift" {
		t.Errorf("EventType = %q, want subgift", msg.EventType)
	}

	if msg.EventData["recipient"] != "Lucky" {
		t.Errorf("EventData[recipient] = %q, want Lucky", msg.EventData["recipient"])
	}

	if msg.EventData["gift_months"] != "1" {
		t.Errorf("EventData[gift_months] = %q, want 1", msg.EventData["gift_months"])
	}

	if msg.Text != "" {
		t.Errorf("Text = %q, want empty (no user message)", msg.Text)
	}
}

func TestToEventMessage_MysteryGift(t *testing.T) {
	line := `@badge-info=subscriber/24;badges=subscriber/24;color=#0000FF;display-name=BigSpender;id=evt-789;msg-id=submysterygift;msg-param-mass-gift-count=5;msg-param-sub-plan=1000;system-msg=BigSpender\sis\sgifting\s5\sTier\s1\sSubs\sto\sthe\scommunity!;tmi-sent-ts=1700000000000 :bigspender!bigspender@bigspender.tmi.twitch.tv USERNOTICE #testchannel`
	irc := ParseIRC(line)
	msg := ToEventMessage(irc)

	if msg.EventType != "submysterygift" {
		t.Errorf("EventType = %q, want submysterygift", msg.EventType)
	}

	if msg.EventData["gift_count"] != "5" {
		t.Errorf("EventData[gift_count] = %q, want 5", msg.EventData["gift_count"])
	}
}

func TestToEventMessage_Raid(t *testing.T) {
	line := `@badge-info=;badges=;color=#FF00FF;display-name=Raider;id=evt-raid;msg-id=raid;msg-param-displayName=Raider;msg-param-viewerCount=150;system-msg=150\sraiders\sfrom\sRaider\shave\sjoined!;tmi-sent-ts=1700000000000 :raider!raider@raider.tmi.twitch.tv USERNOTICE #testchannel`
	irc := ParseIRC(line)
	msg := ToEventMessage(irc)

	if msg.EventType != "raid" {
		t.Errorf("EventType = %q, want raid", msg.EventType)
	}

	if msg.EventData["viewers"] != "150" {
		t.Errorf("EventData[viewers] = %q, want 150", msg.EventData["viewers"])
	}

	if msg.EventData["raider"] != "Raider" {
		t.Errorf("EventData[raider] = %q, want Raider", msg.EventData["raider"])
	}
}

func TestToEventMessage_Announcement(t *testing.T) {
	line := `@badge-info=;badges=moderator/1;color=#00FF00;display-name=ModUser;emotes=;id=evt-ann;msg-id=announcement;msg-param-color=PRIMARY;system-msg=;tmi-sent-ts=1700000000000 :moduser!moduser@moduser.tmi.twitch.tv USERNOTICE #testchannel :Check out the new schedule!`
	irc := ParseIRC(line)
	msg := ToEventMessage(irc)

	if msg.EventType != "announcement" {
		t.Errorf("EventType = %q, want announcement", msg.EventType)
	}

	if msg.Text != "Check out the new schedule!" {
		t.Errorf("Text = %q, want %q", msg.Text, "Check out the new schedule!")
	}

	if msg.EventData["color"] != "PRIMARY" {
		t.Errorf("EventData[color] = %q, want PRIMARY", msg.EventData["color"])
	}
}

func TestToEventMessage_Sub(t *testing.T) {
	line := `@badge-info=subscriber/0;badges=subscriber/0;color=#9ACD32;display-name=NewSub;id=evt-sub;msg-id=sub;msg-param-cumulative-months=1;msg-param-sub-plan=1000;msg-param-sub-plan-name=Channel\sSubscription;system-msg=NewSub\ssubscribed\sat\sTier\s1.;tmi-sent-ts=1700000000000 :newsub!newsub@newsub.tmi.twitch.tv USERNOTICE #testchannel`
	irc := ParseIRC(line)
	msg := ToEventMessage(irc)

	if msg.EventType != "sub" {
		t.Errorf("EventType = %q, want sub", msg.EventType)
	}

	if msg.EventData["months"] != "1" {
		t.Errorf("EventData[months] = %q, want 1", msg.EventData["months"])
	}

	if msg.SystemMessage != "NewSub subscribed at Tier 1." {
		t.Errorf("SystemMessage = %q, want %q", msg.SystemMessage, "NewSub subscribed at Tier 1.")
	}
}

func TestToEventMessage_UnknownType(t *testing.T) {
	line := `@badge-info=;badges=;display-name=SomeUser;id=evt-unk;msg-id=futureevent;system-msg=Something\shappened;tmi-sent-ts=1700000000000 :someuser!someuser@someuser.tmi.twitch.tv USERNOTICE #testchannel`
	irc := ParseIRC(line)
	msg := ToEventMessage(irc)

	if msg.EventType != "futureevent" {
		t.Errorf("EventType = %q, want futureevent", msg.EventType)
	}

	if msg.SystemMessage != "Something happened" {
		t.Errorf("SystemMessage = %q, want %q", msg.SystemMessage, "Something happened")
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
