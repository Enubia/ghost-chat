# Contributing to Ghost Chat

Thank you for your interest in contributing to Ghost Chat!

## Reporting Issues

Use [GitHub Issues](https://github.com/Enubia/ghost-chat/issues/new/choose) to report bugs.

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
- Wails v3 CLI: `go install github.com/wailsapp/wails/v3/cmd/wails3@v3.0.0-beta.27`
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

### Wails versions and macOS troubleshooting

Keep the Wails Go module, CLI and `@wailsio/runtime` compatible; this project pins beta.27 for all three. After changing Go versions, rebuild the pinned CLI with the current Go toolchain before regenerating bindings:

```bash
go install github.com/wailsapp/wails/v3/cmd/wails3@v3.0.0-beta.27
wails3 generate bindings -ts -clean
```

macOS build tasks enable Wails' `private_mac_apis` tag to preserve the transparent overlay. Direct Go builds also need it (`go build -tags production,private_mac_apis .`). Wails beta.19+ otherwise leaves the webview opaque; see [upstream guidance](https://v3.wails.io/guides/build/private-macos-apis).

If the selected Xcode linker and SDK are mismatched (for example, `ld: unsupported tapi file type '!tapi-tbd'` or an unsupported `arm64e.x1` target), verify `xcode-select -p` and `xcrun --show-sdk-path`. If the Command Line Tools provide a matching toolchain, select them for the affected command only:

```bash
DEVELOPER_DIR=/Library/Developer/CommandLineTools wails3 dev
DEVELOPER_DIR=/Library/Developer/CommandLineTools wails3 task package
```

Do not edit SDK files or change the global Xcode selection to work around this.

## Contribution Workflow

1. Fork the repo
2. Create a branch for your feature or fix
3. Make changes, ensure tests pass and linting is clean
4. Push and open a Pull Request with a [conventional commit](https://www.conventionalcommits.org/) title, e.g. `fix(windows): ...` or `feat: ...` — PRs are squash-merged, and the title becomes the commit that determines the next release version

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

- Comment on the relevant GitHub issue
- Ask in your work-in-progress PR
