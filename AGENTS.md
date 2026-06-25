# Ghost Chat v4

Desktop chat overlay for streamers. Go + Wails v3 (alpha) + React + TypeScript. Go chat clients live in `internal/chat/{twitch,youtube,kick}`, the UI in `frontend/`, the landing page in `website/`.

## Commands

```bash
wails3 dev                   # hot-reload dev (Go + Vite)
wails3 task build            # production build → ./bin/ghost-chat
wails3 task package          # .app bundle (macOS) / .exe (Windows)
go test ./...                # Go tests
cd frontend && pnpm fix      # MANDATORY after any frontend change — oxlint --fix --type-aware && oxfmt --write
cd frontend && pnpm build    # tsc + vite build
```

## Conventions

### Go
- `internal/` for private packages; error messages lowercase, no punctuation, wrap with `%w`
- Single `*config.Config` pointer shared via the App struct
- Exported methods on `App` become JS-callable Wails bindings; App implements `ServiceStartup`/`ServiceShutdown`

### Frontend
- React Compiler is enabled — avoid `useMemo`/`useCallback`/`React.memo` unless it genuinely can't optimize a case
- Zustand for state, react-router-dom HashRouter; Settings is a toggle (not a route) that expands the window via a Go binding
- No UI component libraries, no preprocessors — CSS modules + custom properties in `index.css`, modern nested CSS, neutral color scheme
- oxlint/oxfmt (not eslint/prettier); pin exact dependency versions (no `^`/`~`)
- Path aliases: `@/` → `src/`, `@bindings/` → `bindings/`

### Style (Go + TS)
- No comments unless the logic is non-obvious; no emoji
- Blank line before/after function calls, if/loops/closures, and assignments; sequential declarations or assignments may be grouped

## Wails v3 bindings
- Go methods on `App` generate TS in `frontend/bindings/`. Regenerate with `wails3 generate bindings -ts -clean` — the project commits `.ts`; a bare `generate` emits `.js` on alpha.97+.
- Imports: methods `from '@bindings/ghost-chat/app.js'`, types `from '@bindings/ghost-chat/internal/config/models.js'`, runtime `from '@wailsio/runtime'`
- Events: `Events.On('name', (ev) => ev.data)` — the callback gets a `WailsEvent` with `.data`

## Gotchas
- `golang.design/x/hotkey` must register in a goroutine, not the main thread, or it SIGTRAPs on macOS
- Window state is saved in `ShouldQuit`/`ServiceShutdown`; the macOS dock-quit routes through `ShouldQuit`
- Adding or updating a platform also means updating `website/index.html` (hero, features, FAQ) and refreshing the screenshots in `website/assets/`

## Agent skills

### Issue tracker

Issues are tracked as GitHub issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical role names map 1:1 to repo labels (existing `wontfix` reused; the other four are created on first triage). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Executing work

Once tasks are ready, execute them in-session with the
`subagent-driven-development` skill: one fresh implementer subagent per task
(building test-first via `tdd`), a spec+quality review after each, then a
whole-branch review before merge. Task source: either a plan file with
`## Task N` headings (SDD extracts each with its `task-brief` script) or an
agent-ready brief handed over verbatim (e.g. a GitHub issue body — see
`docs/agents/issue-tracker.md`). SDD's transient run artifacts live in
self-ignored `.scratch/sdd/` — never committed. See `docs/agents/execution.md`.
