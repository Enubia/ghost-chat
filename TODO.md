# Ghost Chat Rewrite — Go + Wails + React

## Overview

Rewrite Ghost Chat from Electron to **Wails v2** with a **Go** backend and **React + TypeScript** frontend.

### Learning approach
When introducing new Go syntax or concepts, always provide a **Node.js/TypeScript equivalent** for comparison. For example: `goroutine` ≈ `Promise`/`async`, `channel` ≈ `EventEmitter`, `interface` ≈ `interface` (but implicit), `defer` ≈ `finally`, etc.

### Key changes from the original app
- **Drop**: Kick support, JChat/KapChat third-party renderers, auto-updater (for now), custom CSS/JS injection
- **Keep**: Twitch, YouTube, External sources, system tray, i18n, global hotkeys, transparent overlay, dark/light theme
- **New**: Custom Twitch IRC chat renderer (Go backend), custom YouTube Live Chat renderer (Go backend), combined multi-platform chat view, user theming/template system

### Architecture shift
| Concern | Old (Electron) | New (Wails) |
|---|---|---|
| Chat data | Loaded via third-party webview URLs | Go backend connects to Twitch IRC + YouTube API, pushes messages to frontend via Wails events |
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
- [ ] Install dependencies: `react-router-dom`, `zustand`, `i18next`, `react-i18next`
- [ ] Set up CSS modules (Vite supports them out of the box — `*.module.css`)
- [ ] Set up path aliases in `vite.config.ts` and `tsconfig.json`
- [ ] Verify `wails dev` still works with hot reload

### 2.2 Routing
- [ ] Set up React Router with these routes:
  - `/` — Home (platform selection)
  - `/chat` — Chat overlay view (unified, replaces per-platform webview pages)
  - `/settings/general` — General settings
  - `/settings/twitch` — Twitch settings
  - `/settings/youtube` — YouTube settings
  - `/settings/external` — External source settings
  - `/settings/themes` — Theme editor (new)
  - `/changelog` — Changelog

### 2.3 i18n setup
- [ ] Configure `i18next` + `react-i18next` with lazy-loaded locale files
- [ ] Port `en-US.json` from the old app as the base (adjust keys for new features, remove Kick-related keys)
- [ ] Add locale switcher that saves selection to config via Go binding
- [ ] Other language files can be ported/updated later

### 2.4 App shell & layout
- [ ] Build the main app layout:
  - Custom title bar (frameless window needs drag region + window controls)
  - Header with: back button, vanish button (on chat view), minimize, close
  - Hamburger dropdown menu: Home, Settings, Theme, Changelog
- [ ] Build the settings layout with CSS modules:
  - Sidebar navigation (General, Twitch, YouTube, External, Themes)
  - Content area with scroll
- [ ] Define base color scheme (neutral, neither too dark nor too light) via CSS custom properties
- [ ] Wire up window control buttons to Wails runtime:
  - Minimize → `runtime.WindowMinimise()`
  - Close → `runtime.Quit()`
  - Back → `navigate('/')`
  - Vanish → call Go method to toggle vanish

### 2.5 Config store integration (frontend)
- [ ] Create a Zustand store that loads config from Go on app startup
- [ ] Implement reactive config access — when a setting changes in the UI, call Go binding to persist
- [ ] Optionally: listen for Go→Frontend config change events (for when config changes from tray menu, etc.)

---

## Phase 3 — Twitch Chat (Custom Renderer)

> **Goal**: Connect to Twitch IRC from Go, parse messages, render them in React.

### 3.1 Twitch IRC client (Go)
- [ ] Implement WebSocket connection to `wss://irc-ws.chat.twitch.tv:443`
- [ ] Send IRC handshake:
  ```
  CAP REQ :twitch.tv/tags twitch.tv/commands
  PASS SCHMOOPIIE
  NICK justinfan12345
  ```
  (Anonymous read-only connection — no auth needed)
- [ ] Send `JOIN #channelname` to join a channel
- [ ] Read incoming messages in a goroutine, parse IRC lines
- [ ] Respond to `PING` with `PONG` (keepalive)
- [ ] Handle reconnection on disconnect (exponential backoff)
- [ ] Implement `Connect(channel string)`, `Disconnect()`, `ChangeChannel(channel string)` methods
- [ ] **Learn**: `gorilla/websocket` or `nhooyr.io/websocket` package, goroutines for concurrent read loops, `context.Context` for cancellation/cleanup

### 3.2 IRC message parser (Go)
- [ ] Parse IRC tags (the `@key=value;key=value` prefix) into a map
- [ ] Extract from PRIVMSG:
  - `display-name` — username to show
  - `color` — user's chosen name color (hex)
  - `badges` — badge list (e.g., `broadcaster/1,subscriber/12`)
  - `emotes` — emote positions (e.g., `25:0-4,12-16` for Kappa)
  - `id` — message ID (for deduplication)
  - `first-msg` — first-time chatter flag
  - Message body (the text after the second `:`)
- [ ] Handle USERNOTICE (subs, raids, etc.) — extract `system-msg` and `msg-id` for event type
- [ ] Handle CLEARCHAT (bans/timeouts) and CLEARMSG (single message deletion)
- [ ] Define a unified `ChatMessage` struct:
  ```go
  type ChatMessage struct {
      ID        string            `json:"id"`
      Platform  string            `json:"platform"` // "twitch" | "youtube"
      Username  string            `json:"username"`
      Color     string            `json:"color"`
      Text      string            `json:"text"`
      Badges    []Badge           `json:"badges"`
      Emotes    []Emote           `json:"emotes"`
      Timestamp time.Time         `json:"timestamp"`
      IsAction  bool              `json:"isAction"`  // /me messages
      Tags      map[string]string `json:"tags"`
  }
  ```
- [ ] Write unit tests with real IRC message samples
- [ ] **Learn**: String parsing in Go, `strings.Split`, `regexp`, struct embedding

### 3.3 Emit messages to frontend
- [ ] On each parsed PRIVMSG, emit a Wails event: `runtime.EventsEmit(ctx, "chat:message", chatMessage)`
- [ ] Emit connection status events: `chat:connected`, `chat:disconnected`, `chat:error`
- [ ] Emit moderation events: `chat:clear`, `chat:delete-message`
- [ ] Bind control methods so frontend can call: `ConnectTwitch(channel)`, `DisconnectTwitch()`

### 3.4 Chat message component (React)
- [ ] Create `ChatMessage.tsx` component that renders a single message:
  - Badge icons (use Twitch badge CDN URLs based on badge set + version)
  - Username with color
  - Message text with emotes replaced by `<img>` tags (Twitch CDN: `https://static-cdn.jtvnbs.net/emoticons/v2/{id}/default/dark/1.0`)
  - Timestamp (optional, theme-dependent)
  - /me (action) styling
- [ ] Handle message moderation: remove messages by user on `chat:clear`, remove specific message on `chat:delete-message`

### 3.5 Chat view (React)
- [ ] Create the chat overlay page (`/chat`):
  - Scrollable message list (auto-scroll to bottom, pause on scroll-up)
  - Receive messages via `EventsOn("chat:message", ...)`
  - Message limit (keep last N messages in memory, remove oldest)
  - Connection status indicator
- [ ] Implement user blacklist filtering on the frontend (skip messages from blacklisted usernames)
- [ ] Implement message fade-out (CSS animation that removes messages after configurable timeout)
- [ ] Apply current theme template to messages

### 3.6 Twitch settings page (React)
- [ ] Build the Twitch settings form:
  - Default channel input
  - Fade toggle + timeout (seconds)
  - Show/hide bots toggle
  - Hide commands (messages starting with `!`) toggle
  - Show/hide badges toggle
  - User blacklist (comma-separated input)
- [ ] All settings save to config via Go binding
- [ ] Changing settings while connected should emit a re-render/reconnect event as needed

---

## Phase 4 — YouTube Live Chat (Custom Renderer)

> **Goal**: Fetch YouTube live chat messages from Go, render them alongside Twitch.

### 4.1 YouTube Live Chat client (Go)
- [ ] Research approach: YouTube Data API v3 `liveChatMessages.list` endpoint
  - Requires an API key (user provides in settings) or OAuth
  - Polling-based: fetch, get `nextPageToken` + `pollingIntervalMillis`, repeat
  - **Alternative**: Scrape the `youtube.com/live_chat` page (fragile but no API key needed) — decide which approach to take
- [ ] Implement live video ID detection from channel ID:
  - Fetch `https://www.youtube.com/channel/{channelId}/live` or `https://www.youtube.com/embed/live_stream?channel={channelId}`
  - Extract video ID from response (regex or HTML parsing)
  - Retry logic with configurable attempts and delay
- [ ] Implement chat message polling loop:
  - `GET https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId={id}&part=snippet,authorDetails`
  - Parse response into `ChatMessage` structs
  - Respect `pollingIntervalMillis` from API response
  - Handle quota errors gracefully
- [ ] Implement `ConnectYouTube(channelIdOrVideoId string)`, `DisconnectYouTube()`
- [ ] **Learn**: `net/http` package, JSON unmarshaling into nested structs, polling with `time.Ticker` + `context`

### 4.2 YouTube message parser (Go)
- [ ] Map YouTube API response fields to `ChatMessage`:
  - `authorDetails.displayName` → username
  - `snippet.displayMessage` → text
  - `authorDetails.profileImageUrl` → avatar (new field on ChatMessage)
  - `authorDetails.isChatOwner`, `isChatModerator` → badges
  - `snippet.publishedAt` → timestamp
- [ ] Handle Super Chat / Super Sticker messages (`snippet.superChatDetails`)
- [ ] Emit via same `chat:message` event with `platform: "youtube"`

### 4.3 YouTube settings page (React)
- [ ] Build YouTube settings form:
  - Channel ID / Video URL input
  - API key input (if using Data API approach)
  - Retry count + fetch delay settings
  - User blacklist
- [ ] Auto-detect video ID button (calls Go method that fetches and extracts)

---

## Phase 5 — Combined Multi-Chat View

> **Goal**: Merge Twitch and YouTube messages into a single unified chat stream.

### 5.1 Unified message stream
- [ ] Both Twitch and YouTube emit the same `chat:message` event with the shared `ChatMessage` struct
- [ ] The chat view already handles both — messages interleave chronologically
- [ ] Add a small platform indicator on each message (Twitch/YouTube icon)
- [ ] Add filtering: toggle to show/hide each platform in the combined view

### 5.2 Multi-channel connection management (Go)
- [ ] Support connecting to Twitch + YouTube simultaneously
- [ ] Add a `ConnectionManager` that tracks active connections:
  ```go
  type ConnectionManager struct {
      twitch  *twitch.Client
      youtube *youtube.Client
  }
  ```
- [ ] Expose methods: `GetActiveConnections() []string`, `DisconnectAll()`
- [ ] Handle errors per-platform without crashing the other

### 5.3 Home page — connection UI (React)
- [ ] Redesign the home page:
  - Twitch card: channel input + connect button
  - YouTube card: channel/video input + connect button
  - External card: URL input + open button
  - Show connection status per platform (connected/disconnected/error)
  - "Open Chat" button appears when at least one platform is connected → navigates to `/chat`
- [ ] Support connecting multiple platforms before opening the chat view

---

## Phase 6 — External Sources

> **Goal**: Support loading arbitrary URLs in the overlay.

### 6.1 Evaluate approach
- [ ] Wails uses a single webview — no nested `<webview>` like Electron
- [ ] Options:
  - **iframe**: Load external URL in an `<iframe>` — works for many chat overlays but may hit CORS/X-Frame-Options
  - **Proxy through Go**: Go fetches the page, serves it locally — complex but bypasses CORS
  - **Open in system browser**: Simplest, but defeats the overlay purpose
- [ ] Decide on approach and implement accordingly

### 6.2 External source management
- [ ] Saved sources list (add/remove URLs in settings)
- [ ] Default URL setting
- [ ] If using iframe approach: render the iframe in the chat view area

---

## Phase 7 — Theming / Template System

> **Goal**: Let users customize how chat messages look.

### 7.1 Design the theming model
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

### 7.2 Theme engine (React)
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

### 7.3 Theme editor page (React)
- [ ] Build a visual theme editor at `/settings/themes`:
  - Live preview panel showing sample chat messages
  - Controls for each themeable property (color pickers, sliders, font selectors, toggles)
  - Save/rename/delete themes
  - Import/export themes as JSON files
- [ ] Built-in themes are read-only but can be duplicated and customized

---

## Phase 8 — System Tray & Global Hotkeys

> **Goal**: System tray menu and global keyboard shortcuts.

### 8.1 System tray (Go)
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

### 8.2 Vanish toggle (deferred from Phase 1.5)
- [ ] Implement vanish toggle (transparent + click-through):
  - Use `runtime.WindowSetAlwaysOnTop`, `runtime.WindowSetBackgroundColour` for transparency
  - Research platform-specific click-through approaches
- [ ] Wire vanish to tray menu + hotkey

### 8.3 Global hotkeys (Go)
- [ ] Research global hotkey libraries for Go:
  - `golang.design/x/hotkey` — cross-platform global hotkey registration
  - Or platform-specific approaches
- [ ] Register vanish hotkey from config on startup
- [ ] Re-register when user changes the hotkey in settings
- [ ] On hotkey press, trigger vanish toggle
- [ ] **Learn**: CGo might be needed for some hotkey approaches — understand the basics of CGo if required

### 8.4 Hotkey settings (React)
- [ ] Port the `HotKeyInput` component from the old app
- [ ] Capture key combinations, format as string, save to config
- [ ] Show current keybind, allow clearing

---

## Phase 9 — Settings Pages (remaining)

### 9.1 General settings (React)
- [ ] Language selector (locale switcher)
- [ ] Vanish hotkey input
- [ ] macOS-specific options (quit on close, hide dock icon) — conditionally shown based on `runtime.Environment().Platform`
- [x] ~~Dark/light theme toggle~~ — removed, using single neutral color scheme

### 9.2 Polish settings UX
- [ ] Settings should apply immediately (no save button — write on change)
- [ ] Show success indicators on save
- [ ] Validate inputs (e.g., channel names, URLs, numeric ranges)

---

## Phase 10 — Build, Package & Ship

### 10.1 Build configuration
- [ ] Configure `wails.json` for production builds
- [ ] Set up build commands:
  - `wails build` — production build
  - `wails build -nsis` — Windows installer
  - `wails build -platform darwin/universal` — macOS universal binary
- [ ] Configure app icon, metadata, version info

### 10.2 Cross-platform testing
- [ ] Test on Windows (primary platform for streamers)
- [ ] Test on macOS (dock icon hiding, quit-on-close behavior)
- [ ] Test on Linux
- [ ] Verify transparent window + click-through works on each platform
- [ ] Verify system tray works on each platform

### 10.3 CI/CD
- [ ] Set up GitHub Actions for:
  - Build on PR (all platforms)
  - Release build on tag (create GitHub release with binaries)
- [ ] Wails has a [GitHub Actions template](https://wails.io/docs/guides/github-actions) — use it as a starting point

---

## Phase 11 — Migration & Cleanup

### 11.1 Migrate user configs
- [ ] Write a one-time migration that reads old Electron Store JSON and converts to new config format
- [ ] Detect old config location on startup, offer to migrate

### 11.2 Update CLAUDE.md
- [ ] Rewrite CLAUDE.md for the new Go + Wails + React architecture
- [ ] Document new commands, project structure, conventions

### 11.3 Update README and CONTRIBUTING
- [ ] Update prerequisites (Go, Wails CLI instead of Node + Electron)
- [ ] Update development workflow
- [ ] Update build/release instructions

---

## Go Learning Checkpoints

These concepts map to specific tasks above. Check them off as you encounter and understand them:

- [ ] **Basics**: Variables, types, functions, control flow (Phase 0.1)
- [ ] **Structs & interfaces**: Config types, ChatMessage (Phase 1.2, 3.2)
- [ ] **Error handling**: `if err != nil` pattern, wrapping errors (Phase 1.2)
- [ ] **JSON**: `encoding/json`, struct tags, Marshal/Unmarshal (Phase 1.2)
- [ ] **File I/O**: `os.ReadFile`, `os.WriteFile`, `os.UserConfigDir` (Phase 1.2)
- [ ] **Packages**: `internal/`, public vs private (capitalization), imports (Phase 1.1)
- [ ] **Goroutines**: Concurrent WebSocket read loop, polling loop (Phase 3.1, 4.1)
- [ ] **Channels**: Communicate between goroutines (Phase 3.1)
- [ ] **Context**: Cancellation, timeouts, passing request-scoped data (Phase 3.1, 4.1)
- [ ] **WebSockets**: `gorilla/websocket` or `nhooyr.io/websocket` (Phase 3.1)
- [ ] **HTTP client**: `net/http`, making requests, reading responses (Phase 4.1)
- [ ] **Testing**: `go test`, table-driven tests, `testify` (Phase 1.2, 3.2)
- [ ] **Slices & maps**: Core data structures used everywhere (Phase 3.2)
- [ ] **String manipulation**: `strings` package, parsing IRC messages (Phase 3.2)
- [ ] **Time**: `time.Ticker`, `time.After`, timestamps (Phase 4.1)
- [ ] **Modules**: `go.mod`, `go get`, dependency management (Phase 0.3)
