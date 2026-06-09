# TikTok Live Chat

Ghost Chat does not support TikTok Live chat. This is **blocked by TikTok's connection model**, not a lack of interest — it can be revisited if our stance on third-party signing dependencies changes (see below).

## Why this is out of scope

Ghost Chat's platform clients (Twitch, YouTube, Kick) are **self-contained pure-Go connectors** — each talks directly to the platform's own WebSocket/HTTP endpoints with no intermediary (e.g. Kick connects to Pusher WS and resolves the chatroom over HTTP). There is no third-party service in the path, no per-user credentials, and nothing outside the maintainer's control that can break the feature.

TikTok Live **cannot be connected this way.** Its chat WebSocket URL requires a **signature** that TikTok generates through heavily obfuscated client-side JavaScript. That signing cannot be reproduced locally, and as of 2026 it has not been cracked. Every working library — Node [`TikTok-Live-Connector`](https://github.com/zerodytrash/TikTok-Live-Connector), Python [`TikTokLive`](https://github.com/isaackogan/TikTokLive), and the Go port [`gotiktoklive`](https://github.com/steampoweredtaco/gotiktoklive) — delegates signing to the third-party **Euler Stream** service (`wss://ws.eulerstream.com` / `tiktok.eulerstream.com`) by default. None can sign locally.

### Why Euler Stream doesn't fit a shipped desktop app

- **Anonymous signing is rate-limited** (HTTP 429 on exceed). Thousands of Ghost Chat installs hitting Euler Stream from identical code would be throttled quickly.
- **Higher limits require an API key** — so either every user registers their own Euler Stream account, or the app embeds a shared key, which blows through fair-use limits and can be revoked or abused.
- It introduces a **hard third-party runtime dependency outside the maintainer's control.** If Euler Stream goes down, changes its terms, or starts charging, TikTok chat breaks for every user — categorically unlike the other three self-hosted-connection platforms.
- The Go port (`gotiktoklive`) is explicitly **alpha**, with several features in "Unknown state," and still requires Euler Stream. Not production-ready.

This makes TikTok fundamentally different from every other supported platform: it can't be a first-class, self-contained connector.

## When to revisit

This is a **product/policy decision**, not a technical one. Reconsider if either:

1. We become willing to ship TikTok as a **second-class, optional platform** gated behind a third-party signer — e.g. the user pastes their own Euler Stream API key, with clear messaging that it depends on an external service. (At that point this becomes a real, caveated enhancement worth scoping.)
2. A library appears that can **sign TikTok Live WebSocket URLs locally**, with no third-party service — which would make a self-contained Go client possible.

## Prior requests

- #1286 — "[Request]: Add TikTok Chat support"
- (Also evaluated and rejected for the same reason in an earlier review, several months prior — not committed at the time.)
