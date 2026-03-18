package youtube

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"ghost-chat/internal/chat"
)

func parseActions(actions []Action) []chat.ChatMessage {
	messages := make([]chat.ChatMessage, 0, len(actions))

	for _, action := range actions {
		if action.AddChatItemAction == nil {
			continue
		}

		item := action.AddChatItemAction.Item

		switch {
		case item.LiveChatTextMessageRenderer != nil:
			messages = append(messages, parseTextMessage(*item.LiveChatTextMessageRenderer))
		case item.LiveChatPaidMessageRenderer != nil:
			messages = append(messages, parsePaidMessage(*item.LiveChatPaidMessageRenderer))
		case item.LiveChatMembershipItemRenderer != nil:
			messages = append(messages, parseMembership(*item.LiveChatMembershipItemRenderer))
		}
	}

	return messages
}

func parseTextMessage(r LiveChatTextMessageRenderer) chat.ChatMessage {
	runs := r.Message.Runs
	return chat.ChatMessage{
		Platform:  "youtube",
		ID:        r.ID,
		Username:  r.AuthorName.SimpleText,
		Avatar:    largestThumbnail(r.AuthorPhoto.Thumbnails),
		Badges:    parseBadges(r.AuthorBadges),
		Timestamp: parseTimestampUsec(r.TimestampUsec),
		Fragments: parseRuns(runs),
		Text:      flattenRuns(runs),
	}
}

func parsePaidMessage(r LiveChatPaidMessageRenderer) chat.ChatMessage {
	base := parseTextMessage(LiveChatTextMessageRenderer{
		MessageRendererBase: r.MessageRendererBase,
	})

	if r.Message != nil {
		base.Fragments = parseRuns(r.Message.Runs)
		base.Text = flattenRuns(r.Message.Runs)
	}

	base.SuperChat = &chat.SuperChatDetails{
		Amount:      r.PurchaseAmountText.SimpleText,
		HeaderColor: argbToHex(r.HeaderBackgroundColor),
		BodyColor:   argbToHex(r.BodyBackgroundColor),
	}

	return base
}

func parseMembership(r LiveChatMembershipItemRenderer) chat.ChatMessage {
	base := parseTextMessage(LiveChatTextMessageRenderer{
		MessageRendererBase: r.MessageRendererBase,
	})
	base.MembershipEvent = true
	base.Fragments = parseRuns(r.HeaderSubtext.Runs)
	base.Text = flattenRuns(r.HeaderSubtext.Runs)
	return base
}

func parseRuns(runs []Run) []chat.MessageFragment {
	fragments := make([]chat.MessageFragment, 0, len(runs))

	for _, run := range runs {
		if run.Emoji == nil {
			if run.Text != "" {
				fragments = append(fragments, chat.MessageFragment{Type: "text", Text: run.Text})
			}
			continue
		}

		shortcode := run.Emoji.EmojiID
		if len(run.Emoji.Shortcuts) > 0 {
			shortcode = run.Emoji.Shortcuts[0]
		}

		url := largestThumbnail(run.Emoji.Image.Thumbnails)
		if url != "" {
			fragments = append(fragments, chat.MessageFragment{Type: "emote", Text: shortcode, URL: url})
		} else {
			fragments = append(fragments, chat.MessageFragment{Type: "text", Text: shortcode})
		}
	}

	return fragments
}

func flattenRuns(runs []Run) string {
	var sb strings.Builder

	for _, run := range runs {
		if run.Emoji == nil {
			sb.WriteString(run.Text)
		} else if len(run.Emoji.Shortcuts) > 0 {
			sb.WriteString(run.Emoji.Shortcuts[0])
		} else {
			sb.WriteString(run.Emoji.EmojiID)
		}
	}

	return sb.String()
}

func parseBadges(badges []AuthorBadge) []chat.Badge {
	if len(badges) == 0 {
		return nil
	}

	result := make([]chat.Badge, 0, len(badges))

	for _, b := range badges {
		r := b.LiveChatAuthorBadgeRenderer
		if r.Icon != nil {
			result = append(result, chat.Badge{Name: strings.ToLower(r.Icon.IconType)})
		} else if r.CustomThumbnail != nil {
			result = append(result, chat.Badge{
				Name:    "member",
				Version: r.Tooltip,
				URL:     largestThumbnail(r.CustomThumbnail.Thumbnails),
			})
		}
	}

	return result
}

func parseTimestampUsec(usec string) time.Time {
	n, err := strconv.ParseInt(usec, 10, 64)
	if err != nil {
		return time.Now()
	}
	return time.UnixMilli(n / 1000)
}

func argbToHex(argb int64) string {
	return fmt.Sprintf("#%06X", argb&0xFFFFFF)
}

func largestThumbnail(thumbnails []Thumbnail) string {
	if len(thumbnails) == 0 {
		return ""
	}
	best := thumbnails[0]
	for _, t := range thumbnails[1:] {
		if t.Width > best.Width {
			best = t
		}
	}
	return best.URL
}
