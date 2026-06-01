# Twitch Inline Event Notifications

> **Issue**: [#1268](https://github.com/Enubia/ghost-chat/issues/1268)
> **Scope**: Parse IRC `USERNOTICE` messages to display subs, gift subs, raids, and more inline in the chat overlay. No OAuth required.

## Background

Twitch IRC already delivers event notifications as `USERNOTICE` messages to anonymous connections. We currently ignore them in the parser. This covers a meaningful subset of the original request without adding OAuth or EventSub complexity.

### Available USERNOTICE msg-id types

#### Must have — common, high-value events
| msg-id | Description |
|---|---|
| `sub` | First-time subscription |
| `resub` | Resubscription (with optional user message) |
| `subgift` | Gifted sub to a specific user |
| `submysterygift` | Community gift batch (random recipients) |
| `raid` | Incoming raid with viewer count |
| `announcement` | Channel announcement (`/announce`) |

#### Nice to have — less common but still useful
| msg-id | Description |
|---|---|
| `giftpaidupgrade` | User continues a gifted sub by paying |
| `anongiftpaidupgrade` | Same, but original gift was anonymous |
| `primepaidupgrade` | Prime sub converted to paid |
| `standardpayforward` | Gift sub paid forward to a specific user |
| `communitypayforward` | Gift sub paid forward to community |
| `bitsbadgetier` | User earns a new bits badge tier |

#### Low priority — rare or experimental
| msg-id | Description |
|---|---|
| `unraid` | Raid cancelled |
| `rewardgift` | Twitch-funded reward (special events only) |
| `charitydonation` | Charity stream donation |
| `viewermilestone` | Watch streak milestone (experimental) |
| `sharedchatnotice` | Shared chat session notice |
| `ritual` | New chatter ritual (rarely seen) |

### What this does NOT cover (requires OAuth + EventSub)
- Follows
- Channel point redeems
- Chat power-ups (enlarged emotes)

---

## Phase 1 — Go: Parse USERNOTICE

> **Goal**: Parse USERNOTICE IRC messages and emit them to the frontend as a distinct event type.

### 1.1 Extend ChatMessage struct
- [x] Add `EventType string` field to `ChatMessage` (e.g. `"sub"`, `"resub"`, `"subgift"`, `"raid"`, `"announcement"`)
- [x] Add `SystemMessage string` field for the Twitch-generated system text (e.g. "X subscribed for 12 months")
- [x] Add `EventData map[string]string` field for extra metadata (gift count, raid viewer count, sub plan, etc.)

### 1.2 Parse USERNOTICE in parser.go
- [x] Add `USERNOTICE` case to `handleMessage` in `client.go`
- [x] Parse `msg-id` tag to determine event type — handle all "must have" types, pass through others with raw `msg-id` as event type
- [x] Extract system message from tags (`system-msg`, URL-decoded)
- [x] Extract relevant metadata per event type:
  - Sub/resub: `msg-param-cumulative-months`, `msg-param-sub-plan`, `msg-param-sub-plan-name`
  - Gift: `msg-param-recipient-display-name`, `msg-param-gift-months`
  - Mystery gift: `msg-param-mass-gift-count`
  - Raid: `msg-param-viewerCount`, `msg-param-displayName`
  - Gift paid upgrade: `msg-param-sender-login`, `msg-param-sender-name`
  - Prime paid upgrade: `msg-param-sub-plan`
  - Pay forward: `msg-param-recipient-display-name` (standard), `msg-param-prior-gifter-display-name`
  - Bits badge: `msg-param-threshold`
  - Announcement: `msg-param-color`
- [x] Parse optional user message (the trailing param after USERNOTICE) — resubs can include a personal message
- [x] Resolve badges and emotes on the user message (same as PRIVMSG)

### 1.3 Emit events to frontend
- [x] Emit USERNOTICE messages as `chat:message` events with `EventType` set (same pipeline as regular messages so they appear inline)
- [x] Unrecognized `msg-id` values still get emitted (future-proof) — frontend renders them with the generic system message

### 1.4 Unit tests
- [x] Add real USERNOTICE IRC samples for each "must have" `msg-id` type
- [x] Test system message URL decoding
- [x] Test metadata extraction per event type
- [x] Test that optional user message is parsed with emotes/badges
- [x] Test that unknown `msg-id` values pass through gracefully

---

## Phase 2 — Frontend: Render Event Messages

> **Goal**: Display event notifications inline in the chat overlay with distinct styling.

### 2.1 Update chat types
- [x] Add `eventType`, `systemMessage`, `eventData` fields to the frontend `ChatMessage` type

### 2.2 Event message component
- [x] Create `EventMessage` component for rendering inline notifications
- [x] System message as primary text (e.g. "UserX subscribed for 12 months")
- [x] Optional user message below (e.g. the resub message) — rendered with emotes/badges like a normal message
- [x] Distinct visual style: subtle background highlight, left border accent, no username row
- [x] Style variants per event type (sub = purple accent, raid = orange accent, announcement = blue accent)
- [x] Generic fallback style for unrecognized event types

### 2.3 Integrate into chat view
- [x] Branch on `eventType` in the message list renderer — use `EventMessage` when set, `ChatMessage` otherwise
- [x] Event messages respect existing settings: fade, message limit, auto-scroll

### 2.4 Theme support
- [x] Add theme properties for event messages (background opacity, border color, font size)
- [x] Built-in themes include sensible defaults for event styling
- [x] Event styles editable in theme editor

---

## Phase 3 — Settings & Filtering

> **Goal**: Let users control which events appear and how.

### 3.1 Twitch config
- [x] Add `Events` section to `TwitchConfig` with grouped toggles:
  - Subscriptions (covers `sub`, `resub`, `subgift`, `submysterygift`, `giftpaidupgrade`, `anongiftpaidupgrade`, `primepaidupgrade`, `standardpayforward`, `communitypayforward`)
  - Raids (covers `raid`, `unraid`)
  - Announcements (covers `announcement`)
  - Other (covers `bitsbadgetier`, `ritual`, `viewermilestone`, `charitydonation`, `rewardgift`, `sharedchatnotice`)
- [x] All enabled by default

### 3.2 Twitch settings UI
- [x] "Events" section in Twitch settings tab
- [x] Toggle per event group with descriptive labels
- [x] Brief explanation that these are IRC-based (no login required)

### 3.3 Frontend filtering
- [x] Filter event messages in the chat view based on config toggles
- [x] Filtered events never enter the message list (not just hidden)
