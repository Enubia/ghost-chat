# Rumble Live Chat Integration

> **Scope**: Add Rumble as a fourth streaming platform alongside Twitch, YouTube, and Kick.

## Research Summary

Rumble uses Server-Sent Events (SSE) for live chat. No authentication is required to read chat messages, making it a good fit for Ghost Chat's anonymous read-only approach.

### How it works

- **Protocol**: SSE (Server-Sent Events) — persistent HTTP connection, server pushes events in real-time
- **Chat endpoint**: `https://web7.rumble.com/chat/api/chat/{stream_id_b10}/stream` with `Accept: text/event-stream`
- **Auth**: None required for reading chat
- **Stream IDs**: Base-36 in URLs, base-10 for the API (simple conversion)

### SSE event types

| Event | Description |
|---|---|
| `init` | Initial payload: users, channels, badges, recent messages, rant config |
| `messages` | New chat messages (user data, channel data, message content) |
| `delete_messages` | Message deletions |
| `delete_non_rant_messages` | Bulk non-rant message deletion |
| `pin_message` | Pinned message updates |

### Message data

Each message event contains:
- `data.users[]` — user info
- `data.channels[]` — channel info
- `data.messages[]` — message objects with `id`, `user_id`, `channel_id`, `text`, `time` (ISO 8601)
- Optional `rant` field (similar to super chats): `price_cents`, `duration`, `expires_on`
- Optional `raid_notification` and `gift_purchase_notification` fields

### Existing reference implementations

- **cocorum** (Python) — most complete library, covers both the official Live Stream API and the internal SSE chat API: https://github.com/thelabcat/rumble-api-wrapper-py
- No Go or TypeScript libraries exist yet

---

## Phase 1 — Go: Rumble Client

> **Goal**: Connect to Rumble SSE chat and emit messages to the frontend.

### 1.1 Channel/stream resolution (`resolve.go`)
- [ ] Accept Rumble URL or stream ID as input
- [ ] Extract stream ID from URL (base-36)
- [ ] Convert base-36 stream ID to base-10 for the SSE endpoint

### 1.2 SSE client (`client.go`)
- [ ] Open SSE connection to chat endpoint
- [ ] Parse `init` event — extract badges, users, initial messages
- [ ] Listen for `messages` events — parse new chat messages
- [ ] Handle `delete_messages` / `delete_non_rant_messages` events
- [ ] Reconnect logic on connection drop (similar to Kick/Twitch clients)
- [ ] Clean shutdown via context cancellation

### 1.3 Message parser (`parser.go`)
- [ ] Map Rumble message fields to unified `ChatMessage` struct
- [ ] Handle rants (map to a format similar to YouTube super chats)
- [ ] Handle raid notifications
- [ ] Handle gift purchase notifications
- [ ] Parse user badges from init data

### 1.4 Types (`types.go`)
- [ ] Define Go structs for SSE event payloads (init, messages, users, channels, rants)

### 1.5 Unit tests
- [ ] Test stream ID base-36 to base-10 conversion
- [ ] Test message parsing for regular messages, rants, raids, gifts
- [ ] Test reconnect behavior

---

## Phase 2 — Frontend: Rumble UI

> **Goal**: Add Rumble as a platform option in the UI.

### 2.1 Home screen
- [ ] Add Rumble platform card (similar to Twitch/YouTube/Kick cards)
- [ ] Input field for Rumble stream URL or ID

### 2.2 Chat rendering
- [ ] Rumble messages render through the existing chat overlay (unified ChatMessage)
- [ ] Rant messages styled distinctly (similar to YouTube super chat styling)

### 2.3 Connection state
- [ ] Add Rumble to the connection store
- [ ] Show connected/disconnected/error states

---

## Phase 3 — Config & Settings

> **Goal**: Add Rumble configuration options.

### 3.1 Go config
- [ ] Add `RumbleConfig` struct (channel/stream ID, enabled state)
- [ ] Add to main `Config` struct
- [ ] Config migration for existing users

### 3.2 Settings UI
- [ ] Add Rumble tab in settings panel
- [ ] Channel/stream input with validation

---

## Notes

- SSE is simpler than WebSocket — Go's `net/http` + `bufio.Scanner` or a library like `r3labs/sse` can handle it
- The protocol is undocumented but stable enough that community libraries have been working with it reliably
- Pop-out chat URL for reference: `https://rumble.com/chat/popup/{stream_id}`
