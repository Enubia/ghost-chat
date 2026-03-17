# Ghost Chat Rewrite — Go + Wails + React

## Overview

Rewrite Ghost Chat from Electron to **Wails v2** with a **Go** backend and **React + TypeScript** frontend.

### Learning approach
When introducing new Go syntax or concepts, always provide a **Node.js/TypeScript equivalent** for comparison. For example: `goroutine` ≈ `Promise`/`async`, `channel` ≈ `EventEmitter`, `interface` ≈ `interface` (but implicit), `defer` ≈ `finally`, etc.

### Collaboration approach
For Go code: Claude scaffolds files with type signatures, hints, and tests. I implement the logic. For frontend (React/TS) code: Claude writes it directly.

### Key changes from the original app
- **Drop**: JChat/KapChat third-party renderers, auto-updater (for now), custom CSS/JS injection, external sources, dark/light theme (single neutral scheme), Mac-specific options
- **Keep**: Twitch, YouTube, system tray, i18n, global hotkeys, transparent overlay
- **New**: Custom Twitch IRC chat renderer (Go backend), custom YouTube Live Chat renderer (Go backend), custom Kick chat renderer (Go backend via Pusher WebSocket), combined multi-platform chat view, user theming/template system, BTTV/FFZ/7TV emote support

### Architecture shift
| Concern | Old (Electron) | New (Wails) |
|---|---|---|
| Chat data | Loaded via third-party webview URLs | Go backend connects to Twitch IRC, YouTube innertube poller, and Kick Pusher WebSocket — pushes messages to frontend via Wails events |
| Rendering | Third-party HTML/CSS in nested `<webview>` | React components render chat messages natively |
| IPC | `ipcRenderer.invoke` / `ipcMain.handle` | Wails bindings (Go functions callable from JS) + Wails events (bidirectional) |
| Persistence | `electron-store` (JSON) | Go reads/writes JSON config file |
| Window mgmt | Electron `BrowserWindow` API | Wails window options + runtime API |

---

## Phase 0 — Environment & Go Fundamentals

> **Goal**: Get Go installed, learn the basics, and scaffold a Wails project.

### 0.1 Install Go toolchain
- [x] Install Go (1.22+) via your package manager or https://go.dev/dl
- [x] Verify: `go version` → go1.25.7 linux/amd64
- [x] Set up your editor (VS Code + Go extension, or GoLand)
- [x] **Learn**: Read [A Tour of Go](https://go.dev/tour/) — covers variables, types, functions, control flow, structs, interfaces, goroutines, channels

### 0.2 Go warm-up exercises
- [x] Write a "hello world" main package
- [x] Write a program that reads/writes a JSON file (this is the pattern you'll use for the config store)
- [x] Write a program that connects to a WebSocket and prints incoming messages (this is the pattern for Twitch IRC)
- [x] Write a program that makes HTTP requests and parses JSON responses (this is the pattern for YouTube API)
- [x] **Learn**: Understand `struct`, `interface`, `error` handling, `goroutine` + `channel`, `context.Context` for cancellation

### 0.3 Install Wails and scaffold project
- [x] Install Wails CLI: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
- [x] Run `wails doctor` to verify dependencies (WebView2 on Windows, WebKit on Linux, etc.)
- [x] Scaffold project: `wails init -n ghost-chat -t vue-ts`
- [x] Explore the generated project structure:
  - `main.go` — app entry point
  - `app.go` — Go struct with bound methods
  - `frontend/` — React + Vite app
  - `wails.json` — project config
- [x] Run `wails dev` and confirm the template app launches
- [x] **Learn**: Read [Wails v2 docs](https://wails.io/docs/introduction) — understand bindings, events, runtime API, window options

### 0.4 Understand Wails ↔ Frontend communication
- [x] Add a Go method to `app.go` that returns a string, call it from frontend
- [x] Emit an event from Go, receive it in frontend (`runtime.EventsEmit` / `runtime.EventsOn`)
- [x] Emit an event from frontend, receive it in Go (`runtime.EventsOn` on Go side)
- [x] **Learn**: This replaces Electron's `ipcMain`/`ipcRenderer`. All bound Go methods return promises on the JS side.

---

## Phase 1 — Project Foundation

> **Goal**: Set up the real project structure, config persistence, and window basics.

### 1.1 Project structure
- [x] Reorganize the scaffolded project into this layout:
  ```
  ghost-chat/
  ├── main.go                  # Entry point
  ├── app.go                   # Wails app struct, lifecycle hooks
  ├── internal/
  │   ├── config/
  │   │   ├── config.go        # Config struct + defaults
  │   │   ├── store.go         # Load/save/migrate JSON config
  │   │   └── migrations.go    # Version-based config migrations
  │   ├── chat/
  │   │   ├── message.go       # Unified ChatMessage struct
  │   │   ├── twitch/
  │   │   │   ├── client.go    # Twitch IRC WebSocket client
  │   │   │   └── parser.go    # IRC message parser (tags, badges, emotes)
  │   │   └── youtube/
  │   │       ├── client.go    # YouTube Live Chat API poller
  │   │       └── parser.go    # API response → ChatMessage
  │   ├── hotkey/
  │   │   └── hotkey.go        # Global hotkey registration
  │   └── tray/
  │       └── tray.go          # System tray setup
  ├── frontend/                # React + Vite app
  │   ├── src/
  │   │   ├── App.tsx
  │   │   ├── main.tsx
  │   │   ├── pages/
  │   │   ├── components/
  │   │   ├── hooks/
  │   │   ├── stores/          # Zustand stores
  │   │   ├── i18n/
  │   │   ├── themes/          # Theme templates
  │   │   └── types/
  │   ├── index.html
  │   ├── vite.config.ts
  │   ├── tsconfig.json
  │   └── package.json
  └── wails.json
  ```
- [x] **Learn**: The `internal/` directory is a Go convention — packages inside cannot be imported by external modules. It signals "private to this project."

### 1.2 Config store (Go)
- [x] Define the `Config` struct in `internal/config/config.go` mirroring your app's settings
- [x] Implement `Load(path string) (*Config, error)` — reads JSON file, returns config with defaults for missing fields
- [x] Implement `Save(config *Config, path string) error` — writes config to JSON file
- [x] Implement `GetConfigPath() (string, error)` — platform-specific config directory (`os.UserConfigDir()`)
- [x] Add default values (equivalent to `StoreDefaults` in the old app)
- [x] Write unit tests for Load/Save round-trip
- [x] **Learn**: Go error handling (`if err != nil`), `encoding/json` struct tags, `os` package for file I/O

### 1.3 Config migration system (Go)
- [x] Implement a migration runner that compares `config.Version` against app version
- [x] Implement migration as a slice of `{Version string, Migrate func(*Config)}` — runs all migrations newer than stored version, in order
- [x] Write a test that verifies migrations run correctly
- [x] **Learn**: Slices, function types, semantic version comparison (use `golang.org/x/mod/semver` or write a simple one)

### 1.4 Bind config to frontend
- [x] Add methods on the Wails app struct to expose config operations:
  - `GetConfig() *Config`
  - `UpdateConfig(cfg *Config) error` (replaces whole config + saves with rollback on failure)
- [x] Test from React: fetch config on mount, display a value, change it, save, restart, confirm persistence
- [x] **Learn**: Wails auto-generates TypeScript types for bound Go structs. Check `frontend/wailsjs/go/` after running `wails dev`.

### 1.5 Window configuration
- [x] Configure Wails window options in `main.go`:
  - Frameless, always on top, start hidden (to avoid position flash)
  - Initial size from saved config (or 400x600 default)
  - Start position from saved config (set in `startup`, then `WindowShow`)
- [x] Save window position/size on close using `OnBeforeClose` hook
- [ ] Implement vanish toggle (deferred to Phase 8 — needs platform-specific research)
- [x] **Learn**: Wails lifecycle hooks (`OnStartup`, `OnBeforeClose`, `OnShutdown`), runtime API

---

## Phase 2 — Frontend Foundation (React)

> **Goal**: Set up the React app shell, routing, i18n, and base UI with CSS modules.

### 2.1 React project setup
- [x] Swap Wails Vue template for React + TypeScript + Vite
- [x] Update `wails.json` to use pnpm
- [x] Install dependencies: `react-router-dom`, `zustand`
- [x] Set up CSS modules (Vite supports them out of the box — `*.module.css`)
- [x] Set up path aliases (`@/` → `src/`) in `vite.config.ts` and `tsconfig.json`
- [x] Verify `wails dev` still works with hot reload

### 2.2 Routing & settings panel
- [x] Set up React Router (HashRouter) with routes: `/` (Home), `/chat` (Chat overlay)
- [x] Settings as a toggleable panel (not a route):
  - Boolean state `settingsOpen` controls visibility
  - Settings panel with tab navigation: General, Twitch, YouTube, Themes
  - Settings forms with real fields matching Go config struct
- [x] Wire up Go window resize on settings toggle: `ExpandForSettings()`, `ShrinkToChat()`

### 2.3 i18n setup
- [x] Configure `i18next` + `react-i18next` with lazy-loaded locale files (`i18next-http-backend`)
- [x] Create `en-US` translation file with all UI strings
- [x] Create `de-DE` translation file
- [x] Add locale switcher that saves selection to config via Go binding + syncs i18n language on load
- [x] Other language files can be added later

### 2.4 App shell & layout
- [x] Build the main app layout:
  - Custom title bar with ghost logo, drag region, window controls (minimize, close), settings gear icon
  - Home page with platform cards (Twitch, YouTube) + brand icons
  - Chat overlay page (empty, ready for Phase 3)
- [x] Build the settings layout with CSS modules:
  - Left side: settings sidebar nav + settings content
  - Right side: main app content (chat preview area)
- [x] Define base color scheme (neutral) via CSS custom properties
- [x] Wire up window control buttons to Wails runtime (Minimize, Close)
- [x] Add Go methods for window resize: `ExpandForSettings()`, `ShrinkToChat()` using `runtime.WindowSetSize`

### 2.5 Config store integration (frontend)
- [x] Create a Zustand store that loads config from Go on app startup
- [x] Implement reactive config access — settings changes call Go `UpdateConfig()` to persist
- [x] Use proper Wails-generated types (`config.Config`, `DeepPartial<T>`) across stores and settings components
- [ ] Listen for Go→Frontend config change events (deferred to Phase 8 — needs tray menu first)

---

## Phase 3 — Twitch Chat (Custom Renderer)

> **Goal**: Connect to Twitch IRC from Go, parse messages, render them in React.

### 3.1 Twitch IRC client (Go)
- [x] Implement WebSocket connection to `wss://irc-ws.chat.twitch.tv:443`
- [x] Send IRC handshake (CAP REQ, PASS, NICK, JOIN)
- [x] Read incoming messages in a goroutine, parse IRC lines
- [x] Handle multiple messages per WebSocket frame (`\r\n` splitting)
- [x] Respond to `PING` with `PONG` (keepalive)
- [x] Handle reconnection on disconnect (exponential backoff)
- [x] Implement `Connect(channel)`, `Disconnect()`, `ChangeChannel(channel)` methods
- [x] **Learned**: `gorilla/websocket`, goroutines, `context.Context`, `sync.Mutex`

### 3.2 IRC message parser (Go)
- [x] Parse IRC tags, prefix, command, channel, params
- [x] Extract PRIVMSG fields (display-name, color, badges, emotes, id, timestamp)
- [x] Handle CLEARCHAT (bans/timeouts) and CLEARMSG (single message deletion)
- [x] Handle ROOMSTATE (triggers badge + emote fetching)
- [x] Define unified `ChatMessage`, `Badge`, `Emote` structs
- [x] Write unit tests with real IRC message samples
- [ ] Handle USERNOTICE (subs, raids) — deferred
- [x] **Learned**: `strings.Split`, `strings.Cut`, `strconv`, struct types, `make()`

### 3.3 Emit messages to frontend
- [x] Emit `chat:message` Wails event on each PRIVMSG
- [x] Emit `chat:connected`, `chat:disconnected` status events
- [x] Emit `chat:clear`, `chat:delete-message` moderation events
- [x] Bind `ConnectTwitch(channel)`, `DisconnectTwitch()` for frontend
- [x] Disconnect twitch client on app close (`onBeforeClose`)

### 3.4 Chat message component (React)
- [x] `ChatMessage.tsx` renders badges, colored username, emotes as images, /me styling
- [x] Badge images via Twitch GQL API (global + channel, fetched on ROOMSTATE)
- [x] Native Twitch emotes via CDN
- [x] Third-party emotes: BTTV, FFZ, 7TV (global + channel)
- [x] Text fallback for badges when image URL unavailable
- [x] Moderation: remove messages by user on `chat:clear`, by ID on `chat:delete-message`

### 3.5 Chat view (React)
- [x] Scrollable message list with auto-scroll (pause on scroll-up, resume button)
- [x] Receive messages via `EventsOn("chat:message", ...)`
- [x] Message limit (500 max, remove oldest)
- [x] Connection status indicator (disconnected label)
- [x] User blacklist filtering
- [x] Hide commands (`!` prefix) filtering
- [x] Fade-out animation (CSS, configurable timeout)
- [ ] Apply theme template to messages — deferred to Phase 7

### 3.6 Twitch settings page (React)
- [x] All settings save to config via Go binding (save on blur for text, immediate for toggles)
- [x] Settings apply reactively to chat view (hide badges, hide commands, blacklist, fade, timestamps)
- [x] "Saved" toast notification on config change
- [x] Removed unused channel + mac_options config fields
- [x] Known-bots filtering (Nightbot, StreamElements, etc.)
- [x] Added show_timestamps setting in General

---

## Phase 4 — YouTube Live Chat (Custom Renderer)

> **Goal**: Fetch YouTube live chat messages via the innertube internal API (no API key required), parse the rich message format, and render them in the overlay with emotes, badges, and Super Chat support.
>
> **Approach**: YouTube's internal innertube API (`/youtubei/v1/live_chat/get_live_chat`) — same API the YouTube web UI uses. No API key or OAuth needed. Polling-based with continuation tokens. Unofficial and subject to breaking changes.

### 4.1 Define YouTube innertube types (Go)

- [x] `internal/chat/youtube/types.go` — full innertube response structs: `LiveChatResponse`, `Action`, `ChatItem`, all renderer types, `Run`, `Emoji`, `AuthorBadge`, `BadgeIcon`, `Thumbnail`, `Continuation`, `TimedContinuationData`

### 4.2 Innertube HTTP client (Go)

- [x] `internal/chat/youtube/client.go` — `Client` struct, `Connect`, `Disconnect`, `pollLoop` with adaptive interval + exponential backoff, `fetchInitialData` (HTML scrape for continuation token + ytcfg field extraction), `pollChatOnce`, `buildPollRequestBody`, `extractContinuation`, `navigateJSON`, `extractJSONObject`, `extractStringField`

### 4.3 Video ID / channel resolution (Go)

- [x] `internal/chat/youtube/resolve.go` — `ResolveVideoURL` handles `@handle`, channel ID, `youtu.be/`, watch URL, channel URL; `resolveLiveURL` fetches `/live` page, checks redirect URL then scans HTML for video ID via regex
- [x] `ResolveYouTubeVideo` bound on `App` for frontend auto-detect button

### 4.4 YouTube message parser (Go)

- [x] `internal/chat/youtube/parser.go` — `parseActions`, `parseTextMessage`, `parsePaidMessage`, `parseMembership`, `parseRuns`, `flattenRuns`, `parseBadges`, `parseTimestampUsec`, `argbToHex`, `largestThumbnail`
- [x] Unit tests for all parser functions with inline fixture data (`parser_test.go`)

### 4.5 Emit messages to frontend (Go)

- [x] Emit `chat:message` Wails event for each parsed `ChatMessage` (same event as Twitch)
- [x] Emit `chat:connected` / `chat:disconnected` with `platform: "youtube"`
- [x] Bind `ConnectYouTube(input string)`, `DisconnectYouTube()` on the `App` struct
- [x] Disconnect YouTube client in `onBeforeClose`

### 4.6 Extend `ChatMessage` struct (Go)

- [x] Add to `internal/chat/message.go`: `Avatar`, `SuperChat`, `MembershipEvent`, `Fragments`
- [x] `SuperChatDetails struct{ Amount string; HeaderColor string; BodyColor string }`
- [x] Twitch parser leaves new fields as zero values

### 4.7 YouTube chat message rendering (React)

- [x] Avatar as circular profile image
- [x] Member badge image URLs rendered as `<img>`
- [x] Mod/owner/verified rendered as text badges
- [x] Custom emoji rendered as `<img>` via fragments
- [x] Super Chat: colored header band with amount + username, optional colored body
- [x] Membership event: green left-border banner
- [x] Platform indicator: small YouTube icon next to username

### 4.8 YouTube settings page (React)

- [x] Channel handle / video URL input with auto-detect button
- [x] Fade toggle + fade timeout (mirrors Twitch settings)
- [x] User blacklist
- [x] Wired to `ConnectYouTube` / `DisconnectYouTube` via Home page

---

## Phase 5 — Combined Multi-Chat View

> **Goal**: Merge Twitch and YouTube messages into a single unified chat stream.

### 5.1 Unified message stream
- [x] Both Twitch and YouTube emit the same `chat:message` event with the shared `ChatMessage` struct
- [x] The chat view handles both — messages interleave as they arrive
- [x] Platform indicator on each message (YouTube icon)
- [x] Add filtering: T / YT toggle pills in chat header, only shown when both platforms connected

### 5.2 Multi-channel connection management (Go)
- [x] Twitch + YouTube connect simultaneously — both clients live on `App` struct, errors are per-platform
- [ ] `DisconnectAll()` binding — deferred until there's a UI need (tray menu, Phase 7)

### 5.3 Home page — connection UI (React)
- [x] Home page with Twitch + YouTube cards (channel input + connect/disconnect)
- [x] Connection status indicators per platform — persisted in `connectionStore`, survive navigation
- [x] "Open Chat" button when at least one platform is connected
- [x] Loading state on connect button
- [x] Error display on connection failure
- [x] YouTube wired to Go backend

---

## Phase 5.5 — Kick Chat

> **Goal**: Connect to Kick.com live chat via the Pusher WebSocket (no API key required), parse messages, and render them in the overlay alongside Twitch and YouTube.
>
> **Approach**: Kick's web frontend uses Pusher (`wss://ws-us2.pusher.com`, app key `32cbd69e4b950bf97679`, cluster `us2`). Subscribe to `chatrooms.{chatroomID}.v2`, receive `App\\Events\\ChatMessageEvent` events. No authentication needed for read-only access. Chatroom ID resolved from `GET https://kick.com/api/v1/channels/{slug}`.
>
> **Note**: Unofficial — Kick could change their Pusher key or channel scheme at any time.

### 5.5.1 Define Kick types (Go)

- [ ] Create `internal/chat/kick/types.go` with Pusher protocol and message structs:
  - `PusherMessage struct{ Event string; Data string; Channel string }` — outer Pusher envelope (data is a JSON string, must be double-decoded)
  - `KickChatMessage` — inner payload of `App\\Events\\ChatMessageEvent`:
    - `ID string`, `ChatroomID int`, `Content string`, `Type string`, `CreatedAt string`
    - `Sender KickSender`
  - `KickSender`:
    - `ID int`, `Username string`, `Slug string`
    - `Identity *KickIdentity` (nil for users with no color/badges set)
  - `KickIdentity`:
    - `Color string` — hex string e.g. `"#FF5733"`
    - `Badges []KickBadge`
  - `KickBadge`:
    - `Type string` — `"moderator"`, `"subscriber"`, `"sub_gifter"`, `"verified"`, `"broadcaster"`, `"og"`
    - `Text string` — display label e.g. `"Moderator"`
    - `Count int` — for `sub_gifter` and `subscriber` (months)
  - `ChannelResponse struct{ Chatroom struct{ ID int } }` — for channel resolution API

### 5.5.2 Channel resolution (Go)

- [ ] Create `internal/chat/kick/resolve.go`:
- [ ] Implement `ResolveChannelSlug(input string) (slug string, err error)`:
  - Strip `https://kick.com/` prefix if present, lowercase, trim spaces
  - Return the bare slug (e.g. `"xqc"`)
- [ ] Implement `FetchChatroomID(slug string) (int, error)`:
  - `GET https://kick.com/api/v1/channels/{slug}`
  - Must send browser-like headers (`User-Agent`, `Accept`, `Referer: https://kick.com/`, `Origin: https://kick.com`) to pass Cloudflare
  - Unmarshal into `ChannelResponse`, return `chatroom.id`

### 5.5.3 Pusher WebSocket client (Go)

- [ ] Create `internal/chat/kick/client.go`:
- [ ] `Client` struct: `ctx`, `cancel`, `conn *websocket.Conn`, `mu sync.Mutex`, `OnMessage`, `OnEvent`
- [ ] Implement `Connect(input string) error`:
  1. Call `ResolveChannelSlug(input)` → slug
  2. Call `FetchChatroomID(slug)` → chatroom ID
  3. Dial `wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false` with browser User-Agent
  4. Wait for `pusher:connection_established` message
  5. Send subscribe: `{"event":"pusher:subscribe","data":{"auth":"","channel":"chatrooms.{id}.v2"}}`
  6. Emit `chat:connected` with `platform: "kick"`
  7. Start `go readLoop()` and `go heartbeatLoop()`
- [ ] Implement `Disconnect()` — cancel context, close conn, emit `chat:disconnected`
- [ ] Implement `readLoop()`:
  - Read Pusher messages, decode outer `PusherMessage`
  - On `pusher:ping` → reply `pusher:pong`
  - On `App\\Events\\ChatMessageEvent` → double-decode `data` field, parse, call `OnMessage`
  - On disconnect → reconnect with exponential backoff (same pattern as Twitch client)
- [ ] Implement `heartbeatLoop()`:
  - Every 30s send `{"event":"pusher:ping","data":{}}`
  - Stop on ctx cancel
- [ ] `NewClient(onMessage, onEvent)` constructor

### 5.5.4 Message parser (Go)

- [ ] Create `internal/chat/kick/parser.go`:
- [ ] Implement `parseMessage(km KickChatMessage) chat.ChatMessage`:
  - `Platform: "kick"`, `ID: km.ID`, `Username: km.Sender.Username`
  - `Color`: from `km.Sender.Identity.Color` (or `""` if Identity is nil)
  - `Timestamp`: parse `km.CreatedAt` ISO 8601 → `time.Time`
  - `Badges`: from `km.Sender.Identity.Badges` → `parseBadges()`
  - `Fragments` + `Text`: from `km.Content` → `parseContent()`
- [ ] Implement `parseContent(content string) ([]chat.MessageFragment, string)`:
  - Scan for `[emote:{id}:{name}]` tokens using a regex
  - Interleave text fragments and emote fragments
  - Emote image URL: `https://files.kick.com/emotes/{id}/fullsize`
  - Return both `[]MessageFragment` (for rich rendering) and plain-text string (for `Text` field)
- [ ] Implement `parseBadges(badges []KickBadge) []chat.Badge`:
  - Map badge types to `chat.Badge{Name: type, Version: text}`
  - No image URLs available in the payload — frontend renders these as text badges (same fallback path already exists in `ChatMessage.tsx`)
- [ ] Write unit tests with fixture payloads for `parseContent` (plain text, single emote, multiple emotes, emote at start/end)

### 5.5.5 Wire to app (Go)

- [ ] Add `kick *kick.Client` field to `App` struct in `app.go`
- [ ] Initialize in `NewApp` with same `onMessage`/`onEvent` callbacks
- [ ] Add bound methods: `ConnectKick(input string) error`, `DisconnectKick()`
- [ ] Disconnect in `onBeforeClose`

### 5.5.6 Wails bindings + connection store (Frontend)

- [ ] Add `ConnectKick`, `DisconnectKick` to `frontend/wailsjs/go/main/App.js` and `App.d.ts`
- [ ] Add `kick: boolean` and `kickInput: string` to `connectionStore.ts`
- [ ] Handle `platform: "kick"` in `App.tsx` event listener (`chat:connected` / `chat:disconnected`)

### 5.5.7 Home page — Kick card (React)

- [ ] Add a Kick card to `Home.tsx` (same layout as Twitch/YouTube cards):
  - Kick logo/icon
  - Channel slug input (placeholder: `channelname`)
  - Connect/Disconnect button wired to `ConnectKick`/`DisconnectKick`
  - Connection status indicator
- [ ] Add Kick to the `bothConnected` → filter pill logic in `Chat.tsx` (extend to three-way: T / YT / K)

### 5.5.8 Chat message rendering (React)

- [ ] Add `platform === 'kick'` color to `ChatMessage.module.css` (Kick green: `#53fc18`)
- [ ] Add `KickIcon` SVG and include it in `PlatformIcon`
- [ ] Kick messages use `fragments` for emotes — already handled by `renderFragments`
- [ ] Badges render as text fallback — already handled by `BadgeList`

### 5.5.9 Kick settings page (React)

- [ ] Build `KickSettings.tsx`:
  - Default channel slug input (save on blur)
  - User blacklist
- [ ] Add "Kick" tab to `Settings.tsx` tab nav
- [ ] Add `kick` config section to Go `Config` struct and `DefaultConfig()`
- [ ] Update Wails-generated `models.ts` (run `wails dev` to regenerate, or update manually)

---

## ~~Phase 6 — External Sources~~ (Removed)

> External source support has been dropped. All rendering is done natively.

---

## Phase 6 — Theming / Template System

> **Goal**: Let users customize how chat messages look.

### 6.1 Design the theming model
- [ ] Define what's themeable:
  - Message layout (badges → username → text, or variations)
  - Colors (background, text, username, badges)
  - Font family, size, weight
  - Badge size and visibility
  - Message spacing and padding
  - Fade animation style and timing
  - Shadow/stroke on text
  - Rounded corners, borders
  - Emote size
- [ ] Store themes as JSON objects in the config (or separate theme files)
- [ ] Ship 2-3 built-in themes:
  - **Default**: Clean, minimal (similar to current JChat look)
  - **Compact**: Smaller spacing, no avatars, dense
  - **Bubble**: Chat bubbles with rounded backgrounds per message

### 6.2 Theme engine (React)
- [ ] Themes map to CSS custom properties applied to the chat container
- [ ] `ChatMessage.tsx` uses these CSS variables for all visual properties
- [ ] Theme switching is instant (just swap the CSS variables)
- [ ] Example theme structure:
  ```json
  {
    "name": "Default",
    "font-family": "Inter, sans-serif",
    "font-size": "14px",
    "message-bg": "transparent",
    "username-weight": "bold",
    "badge-size": "18px",
    "message-gap": "4px",
    "fade-enabled": true,
    "fade-timeout": 30
  }
  ```

### 6.3 Theme editor page (React)
- [ ] Build a visual theme editor at `/settings/themes`:
  - Live preview panel showing sample chat messages
  - Controls for each themeable property (color pickers, sliders, font selectors, toggles)
  - Save/rename/delete themes
  - Import/export themes as JSON files
- [ ] Built-in themes are read-only but can be duplicated and customized

---

## Phase 7 — System Tray & Global Hotkeys

> **Goal**: System tray menu and global keyboard shortcuts.

### 7.1 System tray (Go)
- [ ] Set up system tray with Wails `Menu` and tray support:
  - App version (disabled label)
  - Toggle vanish
  - Open config folder
  - Open logs folder
  - Clear logs
  - Reset config
  - Copy debug info to clipboard
  - Quit
- [ ] Tray icon (reuse existing `trayicon.png` or create new one)
- [ ] **Learn**: Wails `menu` package, `runtime.Clipboard` API

### 7.2 Vanish toggle (deferred from Phase 1.5)
- [ ] Implement vanish toggle (transparent + click-through):
  - Use `runtime.WindowSetAlwaysOnTop`, `runtime.WindowSetBackgroundColour` for transparency
  - Research platform-specific click-through approaches
- [ ] Wire vanish to tray menu + hotkey

### 7.3 Global hotkeys (Go)
- [ ] Research global hotkey libraries for Go:
  - `golang.design/x/hotkey` — cross-platform global hotkey registration
  - Or platform-specific approaches
- [ ] Register vanish hotkey from config on startup
- [ ] Re-register when user changes the hotkey in settings
- [ ] On hotkey press, trigger vanish toggle
- [ ] **Learn**: CGo might be needed for some hotkey approaches — understand the basics of CGo if required

### 7.4 Hotkey settings (React)
- [ ] Port the `HotKeyInput` component from the old app
- [ ] Capture key combinations, format as string, save to config
- [ ] Show current keybind, allow clearing

---

## Phase 8 — Settings Polish

### 8.1 General settings (React)
- [x] Language selector (locale switcher)
- [x] Show timestamps toggle
- [ ] Vanish hotkey input (pending Phase 7)
- [x] ~~Dark/light theme toggle~~ — removed, single neutral color scheme
- [x] ~~macOS-specific options~~ — removed

### 8.2 Polish settings UX
- [x] Settings apply immediately (no save button — write on change, blur for text)
- [x] "Saved" toast notification on config save
- [ ] Validate inputs (e.g., channel names, numeric ranges)

---

## Phase 9 — Build, Package & Ship

### 9.1 Build configuration
- [ ] Configure `wails.json` for production builds
- [ ] Set up build commands:
  - `wails build` — production build
  - `wails build -nsis` — Windows installer
  - `wails build -platform darwin/universal` — macOS universal binary
- [ ] Configure app icon, metadata, version info

### 9.2 Cross-platform testing
- [ ] Test on Windows (primary platform for streamers)
- [ ] Test on macOS
- [ ] Test on Linux
- [ ] Verify transparent window + click-through works on each platform
- [ ] Verify system tray works on each platform

### 9.3 CI/CD
- [ ] Set up GitHub Actions for:
  - Build on PR (all platforms)
  - Release build on tag (create GitHub release with binaries)
- [ ] Wails has a [GitHub Actions template](https://wails.io/docs/guides/github-actions) — use it as a starting point

---

## Phase 10 — Migration & Cleanup

### 10.1 Migrate user configs
- [ ] Write a one-time migration that reads old Electron Store JSON and converts to new config format
- [ ] Detect old config location on startup, offer to migrate

### 10.2 Update CLAUDE.md
- [ ] Update project structure diagram (add `kick/`, remove placeholder `hotkey/` and `tray/` dirs)
- [ ] Document new commands, project structure, conventions

### 10.4 Config cleanup
- [x] Remove stale `YouTubeConfig` fields (`retries`, `fetch_delay`, `default_channel_id`) — migrated in v4.0.0

### 10.3 Update README and CONTRIBUTING
- [ ] Update prerequisites (Go, Wails CLI instead of Node + Electron)
- [ ] Update development workflow
- [ ] Update build/release instructions

---

## Go Learning Checkpoints

These concepts map to specific tasks above. Check them off as you encounter and understand them:

- [x] **Basics**: Variables, types, functions, control flow (Phase 0.1)
- [x] **Structs & interfaces**: Config types, ChatMessage (Phase 1.2, 3.2)
- [x] **Error handling**: `if err != nil` pattern, wrapping errors (Phase 1.2)
- [x] **JSON**: `encoding/json`, struct tags, Marshal/Unmarshal (Phase 1.2, 3.x badges/emotes)
- [x] **File I/O**: `os.ReadFile`, `os.WriteFile`, `os.UserConfigDir` (Phase 1.2)
- [x] **Packages**: `internal/`, public vs private (capitalization), imports (Phase 1.1)
- [x] **Goroutines**: Concurrent WebSocket read loop, badge/emote fetching (Phase 3.1)
- [x] **Context**: Cancellation, timeouts, passing request-scoped data (Phase 3.1)
- [x] **WebSockets**: `gorilla/websocket` (Phase 3.1)
- [x] **HTTP client**: `net/http`, making requests, reading responses (Phase 3.x badges/emotes)
- [x] **Testing**: `go test`, table-driven tests (Phase 1.2, 3.2)
- [x] **Slices & maps**: Core data structures used everywhere (Phase 3.2)
- [x] **String manipulation**: `strings` package, parsing IRC messages (Phase 3.2)
- [x] **Sync**: `sync.Mutex`, `sync.RWMutex` for thread-safe shared state (Phase 3.1)
- [x] **make()**: Initializing maps and slices with size hints (Phase 3.2)
- [x] **Channels**: Communicate between goroutines (Phase 4.2)
- [x] **Time**: `time.Sleep` with dynamic duration, `time.Time`, microsecond timestamps (Phase 4.2, 4.4)
- [x] **Modules**: `go.mod`, `go get`, dependency management (Phase 0.3)
