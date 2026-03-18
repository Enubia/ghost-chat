package youtube

// YtCfg holds the innertube client configuration extracted from a YouTube page's ytcfg.set(...) call.
// These values are required to authenticate polling requests.
type YtCfg struct {
	InnertubeAPIKey        string
	InnertubeClientName    string
	InnertubeClientVersion string
}

// --- Innertube response types ---
// These map directly to the JSON returned by /youtubei/v1/live_chat/get_live_chat.
// Only fields we actually use are declared; unknown fields are silently ignored by encoding/json.

type LiveChatResponse struct {
	ContinuationContents struct {
		LiveChatContinuation struct {
			Actions       []Action       `json:"actions"`
			Continuations []Continuation `json:"continuations"`
		} `json:"liveChatContinuation"`
	} `json:"continuationContents"`
}

type Action struct {
	AddChatItemAction *AddChatItemAction `json:"addChatItemAction"`
}

type AddChatItemAction struct {
	Item ChatItem `json:"item"`
}

// ChatItem is polymorphic — only one renderer field will be non-nil per message.
type ChatItem struct {
	LiveChatTextMessageRenderer                          *LiveChatTextMessageRenderer                          `json:"liveChatTextMessageRenderer"`
	LiveChatPaidMessageRenderer                          *LiveChatPaidMessageRenderer                          `json:"liveChatPaidMessageRenderer"`
	LiveChatMembershipItemRenderer                       *LiveChatMembershipItemRenderer                       `json:"liveChatMembershipItemRenderer"`
	LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer *LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer `json:"liveChatSponsorshipsGiftPurchaseAnnouncementRenderer"`
}

// MessageRendererBase contains the fields shared by all chat renderer types.
type MessageRendererBase struct {
	ID                      string        `json:"id"`
	TimestampUsec           string        `json:"timestampUsec"`
	AuthorName              SimpleText    `json:"authorName"`
	AuthorExternalChannelID string        `json:"authorExternalChannelId"`
	AuthorPhoto             Thumbnails    `json:"authorPhoto"`
	AuthorBadges            []AuthorBadge `json:"authorBadges"`
}

type LiveChatTextMessageRenderer struct {
	MessageRendererBase
	Message Runs `json:"message"`
}

type LiveChatPaidMessageRenderer struct {
	MessageRendererBase
	Message               *Runs      `json:"message"` // pointer — absent on low-tier super chats
	PurchaseAmountText    SimpleText `json:"purchaseAmountText"`
	HeaderBackgroundColor int64      `json:"headerBackgroundColor"`
	BodyBackgroundColor   int64      `json:"bodyBackgroundColor"`
	HeaderTextColor       int64      `json:"headerTextColor"`
	BodyTextColor         int64      `json:"bodyTextColor"`
}

type LiveChatMembershipItemRenderer struct {
	MessageRendererBase
	HeaderSubtext Runs `json:"headerSubtext"` // membership tier/milestone text; no message field
}

type LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer struct {
	MessageRendererBase
	Header struct {
		LiveChatSponsorshipsHeaderRenderer struct {
			PrimaryText Runs `json:"primaryText"`
		} `json:"liveChatSponsorshipsHeaderRenderer"`
	} `json:"header"`
}

// --- Message content types ---

type Runs struct {
	Runs []Run `json:"runs"`
}

// Run is a single segment in a message — either a text segment or an emoji segment.
type Run struct {
	Text  string `json:"text"`
	Emoji *Emoji `json:"emoji"` // nil for plain text runs
}

type Emoji struct {
	EmojiID       string    `json:"emojiId"`
	IsCustomEmoji bool      `json:"isCustomEmoji"`
	Shortcuts     []string  `json:"shortcuts"` // shortcodes, e.g. [":_pekoName:", ":pekoName:"]
	Image         ImageData `json:"image"`
}

// --- Badge types ---

type AuthorBadge struct {
	LiveChatAuthorBadgeRenderer BadgeRenderer `json:"liveChatAuthorBadgeRenderer"`
}

type BadgeRenderer struct {
	// Icon is set for moderator, owner, and verified badges (no image URL — icon type string only).
	Icon *BadgeIcon `json:"icon"`
	// CustomThumbnail is set for channel member badges (has image URLs).
	CustomThumbnail *Thumbnails `json:"customThumbnail"`
	Tooltip         string      `json:"tooltip"` // e.g. "Moderator", "Member (2 months)"
}

type BadgeIcon struct {
	IconType string `json:"iconType"` // "MODERATOR", "OWNER", "VERIFIED"
}

// --- Shared utility types ---

type SimpleText struct {
	SimpleText string `json:"simpleText"`
}

type Thumbnails struct {
	Thumbnails []Thumbnail `json:"thumbnails"`
}

type Thumbnail struct {
	URL    string `json:"url"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

type ImageData struct {
	Thumbnails    []Thumbnail   `json:"thumbnails"`
	Accessibility Accessibility `json:"accessibility"`
}

type Accessibility struct {
	AccessibilityData struct {
		Label string `json:"label"`
	} `json:"accessibilityData"`
}

// --- Continuation types ---

type Continuation struct {
	TimedContinuationData        *TimedContinuationData `json:"timedContinuationData"`
	InvalidationContinuationData *TimedContinuationData `json:"invalidationContinuationData"`
}

type TimedContinuationData struct {
	Continuation string `json:"continuation"`
	TimeoutMs    int    `json:"timeoutMs"`
}
