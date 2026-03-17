package kick

import (
	"regexp"
	"strings"
	"time"

	"ghost-chat/internal/chat"
)

// reEmote matches inline emote tokens in Kick message content: [emote:{id}:{name}]
var reEmote = regexp.MustCompile(`\[emote:(\d+):([^\]]+)\]`)

func parseMessage(km KickChatMessage) chat.ChatMessage {
	frags, text := parseContent(km.Content)

	var color string
	if km.Sender.Identity != nil {
		color = km.Sender.Identity.Color
	}

	return chat.ChatMessage{
		Platform:  "kick",
		ID:        km.ID,
		Username:  km.Sender.Username,
		Color:     color,
		Text:      text,
		Fragments: frags,
		Timestamp: parseTimestamp(km.CreatedAt),
	}
}

// parseContent splits a Kick message content string into MessageFragments,
// resolving [emote:{id}:{name}] tokens into emote fragments with image URLs.
// Also returns the plain-text representation for the Text field.
func parseContent(content string) ([]chat.MessageFragment, string) {
	fragments := make([]chat.MessageFragment, 0)
	var plainText strings.Builder

	lastIdx := 0
	for _, match := range reEmote.FindAllStringSubmatchIndex(content, -1) {
		if match[0] > lastIdx {
			segment := content[lastIdx:match[0]]
			fragments = append(fragments, chat.MessageFragment{Type: "text", Text: segment})
			plainText.WriteString(segment)
		}

		emoteID := content[match[2]:match[3]]
		emoteName := content[match[4]:match[5]]
		fragments = append(fragments, chat.MessageFragment{
			Type: "emote",
			Text: emoteName,
			URL:  "https://files.kick.com/emotes/" + emoteID + "/fullsize",
		})
		plainText.WriteString(emoteName)
		lastIdx = match[1]
	}

	if lastIdx < len(content) {
		segment := content[lastIdx:]
		fragments = append(fragments, chat.MessageFragment{Type: "text", Text: segment})
		plainText.WriteString(segment)
	}

	return fragments, plainText.String()
}

func parseTimestamp(raw string) time.Time {
	t, err := time.Parse(time.RFC3339, raw)
	if err != nil {
		return time.Now()
	}
	return t
}
