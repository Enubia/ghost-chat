# Contributing to Ghost Chat

Thank you for your interest in contributing to Ghost Chat!

## Reporting Issues

Use [GitHub Issues](https://github.com/Enubia/ghost-chat/issues/new/choose) or our [Discord server](https://discord.gg/UVMX32dDcy) to report bugs.

Please include:
- Steps to reproduce
- Expected vs actual behavior
- OS and Ghost Chat version (shown in the tray menu)
- Screenshots if applicable

## Development Setup

### Prerequisites
- Go 1.25+
- Node.js 20+
- pnpm
- Wails v3 CLI: `go install github.com/wailsapp/wails/v3/cmd/wails3@latest`
- macOS: Xcode Command Line Tools
- Windows: WebView2 (included in Windows 10/11)

Verify: `wails3 doctor`

### Running locally

```bash
wails3 dev                # dev mode with hot-reload
go test ./internal/...    # Go tests
cd frontend && pnpm fix   # lint + format (oxlint + oxfmt)
cd frontend && pnpm build # typecheck + production build
```

### Building

```bash
wails3 task build         # production binary → bin/ghost-chat
wails3 task package       # .app bundle (macOS) or .exe (Windows)
```

## Contribution Workflow

1. Fork the repo
2. Create a branch for your feature or fix
3. Make changes, ensure tests pass and linting is clean
4. Push and open a Pull Request

Merge the latest from upstream before submitting.

## Code Conventions

- **Go**: `internal/` packages, lowercase error messages, `%w` wrapping
- **Frontend**: CSS Modules, no UI libraries, oxlint/oxfmt (not eslint/prettier)
- **No comments** unless logic is non-obvious
- **Pin dependencies** to exact versions (no `^` or `~`)
- Run `cd frontend && pnpm fix` before committing any frontend changes

See [CLAUDE.md](CLAUDE.md) for full conventions and project structure.

## Translations

1. Copy `frontend/public/locales/en-US/translation.json`
2. Create a folder with your locale code (e.g. `fr-FR`)
3. Translate all strings
4. Submit a PR

## Need Help?

- [Discord server](https://discord.gg/UVMX32dDcy)
- Comment on the relevant GitHub issue
- Ask in your work-in-progress PR
