# Ghost Chat v4

Desktop chat overlay for streamers. Go + Wails v2 + React + TypeScript.

## Commands

```bash
wails dev                    # dev mode (Go 1.23 in go.mod required)
wails build                  # production build → ./build/bin/ghost-chat.app
open ./build/bin/ghost-chat.app  # run on macOS
go test ./internal/...       # run Go tests
cd frontend && pnpm lint     # oxlint
cd frontend && pnpm build    # tsc + vite build
```

## Project Structure

```
ghost-chat/
├── main.go                     # entry point, config loading, wails.Run
├── app.go                      # App struct, bound methods, lifecycle hooks
├── internal/
│   └── config/
│       ├── config.go           # Config struct + DefaultConfig()
│       ├── store.go            # Load/Save/GetConfigPath
│       ├── migrations.go       # semver comparison + RunMigrations
│       └── migrations_test.go
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # root: HashRouter, settings toggle, config load
│   │   ├── App.module.css
│   │   ├── index.css           # CSS custom properties, global styles, utility classes
│   │   ├── main.tsx            # React entry
│   │   ├── stores/
│   │   │   └── config.ts       # Zustand store wrapping Go GetConfig/UpdateConfig
│   │   ├── components/
│   │   │   ├── TitleBar/       # frameless window title bar + controls
│   │   │   ├── Home/           # platform cards (Twitch/YouTube/External)
│   │   │   ├── Chat/           # chat overlay (messages area, empty for now)
│   │   │   ├── Settings/       # toggleable panel with tabbed nav
│   │   │   │   ├── Settings.tsx
│   │   │   │   ├── GeneralSettings.tsx
│   │   │   │   ├── TwitchSettings.tsx
│   │   │   │   ├── YouTubeSettings.tsx
│   │   │   │   └── ExternalSettings.tsx
│   │   │   └── Toggle.tsx      # reusable toggle switch
│   │   └── assets/
│   │       ├── ghost.svg       # app logo
│   │       ├── trayicon.png    # system tray icon
│   │       └── brands/         # platform icons
│   ├── wailsjs/                # auto-generated Wails bindings (DO NOT EDIT)
│   │   ├── go/main/App.{js,d.ts}
│   │   ├── go/models.ts
│   │   └── runtime/
│   ├── .oxlintrc.json
│   ├── .oxfmtrc.json
│   └── package.json
├── build/                      # app icons, platform build configs
├── wails.json                  # Wails project config (pnpm)
└── TODO.md                     # phased development plan
```

## Conventions

### Go
- `internal/` for private packages
- Error messages: lowercase, no punctuation, use `%w` for wrapping
- Config: single `*config.Config` pointer shared via App struct
- Exported methods on App struct become JS-callable bindings
- `go.mod` must stay at `go 1.23` (Wails v2 compat with Go 1.26 runtime)

### Frontend
- Path aliases: `@/` → `src/`, `~/` → `frontend/` root (for wailsjs imports)
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

### Style
- No comments in code unless logic is non-obvious
- No emoji in code or UI
- Neutral color scheme (CSS custom properties in index.css)

## Wails Bindings

Go methods on `App` struct auto-generate TypeScript in `frontend/wailsjs/go/main/App.d.ts`:
- `GetConfig() → Promise<config.Config>`
- `UpdateConfig(cfg) → Promise<void>`
- `ExpandForSettings() → Promise<void>`
- `ShrinkToChat() → Promise<void>`

Wails runtime: `frontend/wailsjs/runtime/runtime` — WindowMinimise, Quit, EventsOn, EventsEmit, etc.

## Known Issues

- `wails dev` window doesn't open if `go.mod` has `go 1.25+` — keep at `go 1.23`
- `wails dev` may not show window on macOS 15+ (known Wails issue) — use `wails build && open` as fallback
