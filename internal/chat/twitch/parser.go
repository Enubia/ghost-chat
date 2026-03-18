package twitch

import (
	"log"
	"strconv"
	"strings"
	"time"

	"ghost-chat/internal/chat"
)

// IRC message structure (raw line from Twitch):
//
//   @tags :user!user@user.tmi.twitch.tv COMMAND #channel :message body
//   ^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^ ^^^^^^^^ ^^^^^^^^^^^^^
//   tags   prefix                       command  channel  params/body
//
// Example PRIVMSG:
//   @badge-info=;badges=broadcaster/1;color=#FF0000;display-name=TestUser;emotes=25:0-4;id=abc-123;tmi-sent-ts=1234567890 :testuser!testuser@testuser.tmi.twitch.tv PRIVMSG #testchannel :Kappa hello world

type IRCMessage struct {
	Tags    map[string]string
	Prefix  string
	Command string
	Channel string
	Params  string
}

// ParseIRC parses a raw IRC line into an IRCMessage.
//
// Steps:
//  1. If line starts with '@', split off everything before the first space → that's the tags string
//     Parse tags: split by ';', each part is 'key=value' (split by first '=')
//  2. If next part starts with ':', it's the prefix (strip the ':'), advance past it
//  3. Next word is the command (PRIVMSG, PING, etc.)
//  4. If next word starts with '#', it's the channel
//  5. If there's a ':' remaining, everything after it is the params (message body)
func ParseIRC(line string) IRCMessage {
	if line == "" {
		return IRCMessage{}
	}

	rest := line

	var tags map[string]string
	var prefix string
	var command string
	var channel string
	var params string

	if strings.HasPrefix(rest, "@") {
		var tagsRaw string

		tagsRaw, rest, _ = strings.Cut(rest, " ")
		tags = ParseTags(tagsRaw[1:]) // strip '@'
	}

	if strings.HasPrefix(rest, ":") {
		var prefixRaw string

		prefixRaw, rest, _ = strings.Cut(rest, " ")
		prefix = prefixRaw[1:] // strip ':'
	}

	command, rest, _ = strings.Cut(rest, " ")

	if strings.HasPrefix(rest, "#") {
		channel, rest, _ = strings.Cut(rest, " ")
	}

	if strings.HasPrefix(rest, ":") {
		params = rest[1:] // strip ':'
	}

	return IRCMessage{
		Tags:    tags,
		Prefix:  prefix,
		Command: command,
		Channel: channel,
		Params:  params,
	}
}

func ParseTags(raw string) map[string]string {
	parts := strings.Split(raw, ";")

	tags := make(map[string]string, len(parts))

	for _, pair := range parts {
		key, value, _ := strings.Cut(pair, "=")

		tags[key] = value
	}

	return tags
}

// ToChatMessage converts a PRIVMSG IRCMessage into a unified ChatMessage.
//
// Extract from tags:
//   - "display-name" → Username
//   - "color" → Color
//   - "id" → ID
//   - "badges" → parse with ParseBadges
//   - "emotes" → parse with ParseEmotes
//   - "tmi-sent-ts" → parse unix millis to time.Time
//
// Check if the message body starts with "\x01ACTION " and ends with "\x01"
// → if so, it's a /me message: strip those markers, set IsAction = true
func ToChatMessage(msg IRCMessage) chat.ChatMessage {
	var username string
	var color string
	var id string
	var badges []chat.Badge
	var emotes []chat.Emote
	var timestamp time.Time
	var isAction bool

	if msg.Command != "PRIVMSG" {
		log.Printf("unsupported command '%s', only PRIVMSG is supported", msg.Command)
		return chat.ChatMessage{}
	}

	color = msg.Tags["color"]
	id = msg.Tags["id"]
	badges = ParseBadges(msg.Tags["badges"])
	emotes = ParseEmotes(msg.Tags["emotes"])
	timestamp = ParseTimestamp(msg.Tags["tmi-sent-ts"])

	if strings.HasPrefix(msg.Params, "\x01ACTION ") && strings.HasSuffix(msg.Params, "\x01") {
		isAction = true
		msg.Params = strings.TrimSuffix(strings.TrimPrefix(msg.Params, "\x01ACTION "), "\x01")
	}

	if displayName, ok := msg.Tags["display-name"]; ok && displayName != "" {
		username = displayName
	} else {
		prefix, _, _ := strings.Cut(msg.Prefix, "!")
		username = prefix
	}

	return chat.ChatMessage{
		Platform:  "twitch",
		ID:        id,
		Username:  username,
		Color:     color,
		Text:      msg.Params,
		Badges:    badges,
		Emotes:    emotes,
		Timestamp: timestamp,
		IsAction:  isAction,
		Tags:      msg.Tags,
	}
}

func ParseBadges(raw string) []chat.Badge {
	if raw == "" {
		return nil
	}

	parts := strings.Split(raw, ",")
	badges := make([]chat.Badge, 0, len(parts))

	for _, part := range parts {
		name, version, _ := strings.Cut(part, "/")

		badges = append(badges, chat.Badge{
			Name:    name,
			Version: version,
		})
	}

	return badges
}

func ParseEmotes(raw string) []chat.Emote {
	if raw == "" {
		return nil
	}

	parts := strings.Split(raw, "/")
	emotes := make([]chat.Emote, 0)

	for _, part := range parts {
		id, positions, _ := strings.Cut(part, ":")
		startEndPositions := strings.Split(positions, ",")

		for _, pos := range startEndPositions {
			startStr, endStr, _ := strings.Cut(pos, "-")
			start, err := strconv.Atoi(startStr)

			if err != nil {
				log.Printf("error parsing emote position start '%s': %v", startStr, err)
				continue
			}

			end, err := strconv.Atoi(endStr)

			if err != nil {
				log.Printf("error parsing emote position end '%s': %v", endStr, err)
				continue
			}

			emotes = append(emotes, chat.Emote{
				ID:    id,
				Start: start,
				End:   end,
			})
		}
	}

	return emotes
}

func ParseTimestamp(raw string) time.Time {
	parsedTimestamp := time.Now()

	if raw == "" {
		return parsedTimestamp
	}

	converted, err := strconv.ParseInt(raw, 10, 64)

	if err != nil {
		log.Printf("error parsing timestamp '%s': %v", raw, err)
		return parsedTimestamp
	}

	return time.UnixMilli(converted)
}
