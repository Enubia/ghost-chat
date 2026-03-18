# Ghost Chat v4

Desktop chat overlay for streamers. Go + Wails v3 + React + TypeScript.

## Prerequisites

### macOS
- Go 1.25+ — `brew install go` or https://go.dev/dl
- Node.js 20+ — `brew install node`
- pnpm — `npm install -g pnpm`
- Xcode Command Line Tools — `xcode-select --install`
- Wails v3 CLI — `go install github.com/wailsapp/wails/v3/cmd/wails3@latest`

### Windows
- Go 1.25+ — https://go.dev/dl (Windows installer)
- Node.js 20+ — https://nodejs.org
- pnpm — `npm install -g pnpm`
- WebView2 — included in Windows 10/11 by default
- Wails v3 CLI — `go install github.com/wailsapp/wails/v3/cmd/wails3@latest`

Verify setup: `wails3 doctor`

## Commands

```bash
wails3 dev                   # dev mode (hot-reload Go + Vite frontend)
wails3 task build            # production build → ./bin/ghost-chat
wails3 task package          # production .app bundle (macOS) or .exe (Windows)
open ./bin/ghost-chat.app    # run on macOS
go test ./internal/...       # run Go tests
cd frontend && pnpm lint     # oxlint
cd frontend && pnpm build    # tsc + vite build
```

## Project Structure

```
ghost-chat/
├── main.go                     # entry point, config loading, app/window/tray setup
├── app.go                      # App struct, bound methods, service lifecycle
├── Taskfile.yml                # Wails v3 build tasks (root)
├── internal/
│   ├── config/
│   │   ├── config.go           # Config struct + DefaultConfig()
│   │   ├── store.go            # Load/Save/GetConfigPath
│   │   ├── migrations.go       # semver comparison + RunMigrations
│   │   └── migrations_test.go
│   └── hotkey/
│       ├── hotkey.go           # Global hotkey registration + key parsing
│       ├── modifiers_darwin.go # macOS modifier mappings
│       ├── modifiers_linux.go  # Linux modifier mappings
│       └── modifiers_windows.go # Windows modifier mappings
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # root: HashRouter, settings toggle, vanish, config load
│   │   ├── App.module.css
│   │   ├── index.css           # CSS custom properties, global styles, utility classes
│   │   ├── main.tsx            # React entry
│   │   ├── stores/
│   │   │   └── config.ts       # Zustand store wrapping Go GetConfig/UpdateConfig
│   │   ├── components/
│   │   │   ├── TitleBar/       # frameless window title bar + controls
│   │   │   ├── Home/           # platform cards (Twitch/YouTube/Kick)
│   │   │   ├── Chat/           # chat overlay (messages, filtering, themes)
│   │   │   ├── Settings/       # toggleable panel with tabbed nav
│   │   │   └── Toggle.tsx      # reusable toggle switch
│   │   └── assets/
│   │       ├── ghost.svg       # app logo
│   │       └── trayicon.png    # system tray icon
│   ├── bindings/               # auto-generated Wails v3 bindings (DO NOT EDIT)
│   ├── .oxlintrc.json
│   ├── .oxfmtrc.json
│   └── package.json
├── build/                      # Taskfile, app icons, platform build configs
│   ├── Taskfile.yml            # shared build tasks (pnpm, bindings, icons)
│   ├── config.yml              # app metadata (name, version, identifier)
│   ├── appicon.png             # 512x512 app icon source
│   ├── darwin/                 # macOS build files (Info.plist, icons.icns)
│   └── windows/                # Windows build files (icon.ico)
└── TODO.md                     # phased development plan
```

## Conventions

### Go
- `internal/` for private packages
- Error messages: lowercase, no punctuation, use `%w` for wrapping
- Config: single `*config.Config` pointer shared via App struct
- Exported methods on App struct become JS-callable bindings (Wails v3 services)
- App implements `ServiceStartup`/`ServiceShutdown` interfaces for lifecycle

### Frontend
- Path aliases: `@/` → `src/`, `@bindings/` → `bindings/`
- CSS modules for component styles (`*.module.css`)
- Global styles/utilities in `index.css` using CSS custom properties
- Modern CSS: nesting, no preprocessors
- React Compiler enabled via babel plugin — avoid `useMemo`, `useCallback`, `React.memo` unless the compiler can't optimize a specific case
- Zustand for state, react-router-dom HashRouter for routing
- Settings panel is a toggle (not a route), expands window via Go binding
- No UI component libraries — custom CSS only
- Linting: oxlint (not eslint), formatting: oxfmt
- Dependencies: always pin exact versions (no `^` or `~` prefixes)

### Mandatory: Lint & Format
After ANY frontend changes, always run:
```bash
cd frontend && pnpm fix
```
This runs `oxlint --fix --type-aware && oxfmt --write`. Do not skip this step.

### Code Spacing (applies to all TS/TSX and Go files)
- Variable declarations can be grouped together
- One blank line before and after function calls, if statements, loops, and closures
- One blank line before and after assignments; multiple sequential assignments can be grouped

### Style
- No comments in code unless logic is non-obvious
- No emoji in code or UI
- Neutral color scheme (CSS custom properties in index.css)

## Wails v3 Bindings

Go methods on `App` struct auto-generate TypeScript in `frontend/bindings/ghost-chat/app.ts`.

Regenerate bindings after changing Go method signatures:
```bash
wails3 generate bindings
```

Frontend imports:
- Bound methods: `import { GetConfig, UpdateConfig } from '@bindings/ghost-chat/app.js'`
- Config types: `import { Config } from '@bindings/ghost-chat/internal/config/models.js'`
- Runtime: `import { Events, Window, Application } from '@wailsio/runtime'`

Events use `Events.On('name', (ev) => ev.data)` — callback receives `WailsEvent` with `.data` property.

## Known Issues

- `wails3 dev` watcher stays alive after app closes — press Ctrl+C to stop
- macOS dock quit goes through `ShouldQuit` → saves window state → clean exit
- `golang.design/x/hotkey` must register in a goroutine (not main thread) to avoid SIGTRAP on macOS
