# Linux Build

Ghost Chat does not ship a Linux build. This is **blocked on upstream Wails v3**, not a permanent "no" — it can be revisited once Wails grows Wayland support for the window behaviors the overlay depends on.

## Why this is out of scope (for now)

Ghost Chat is, at its core, a transparent, always-on-top, click-through overlay you toggle with a global hotkey. Those four behaviors are the product. On Linux with the pinned Wails (`v3.0.0-alpha.97`), they don't all work, and the ones that do only work on X11 — which the major distros are actively removing.

### The window features, on Linux

There are two Linux backends in alpha.97, selected by build tag:

- **Default (`!gtk3`, the GTK4/webkitgtk path)** — `setTransparent()` is a **no-op** (`linux_cgo.go:1310`, comment: "GTK4: Transparency via CSS - different from GTK3"). So the transparent overlay — the whole point — does not render transparent on the default build.
- **Legacy (`-tags gtk3`)** — transparency *does* work (rgba visual + `gdk_screen_is_composited` guard, `linux_cgo_gtk3.go:1680`), but this is now the **legacy** path after the upstream default-flip, and it carries 8 tracked, unfixed bugs (Wails #5465, P2).

Either way:

- **Always-on-top is X11-only.** `_NET_WM_STATE_ABOVE` / `gtk_window_set_keep_above`; the source itself says "No-op on Wayland (no standard protocol)" (`linux_cgo.go:1297`).
- **Global hotkeys don't exist in Wails at all** (Wails #5421, open). Ghost Chat uses `golang.design/x/hotkey`, which on Linux is `XGrabKey` — X11-only, dead under Wayland.
- Click-through (`SetIgnoreMouseEvents`) is implemented, and system tray exists but has Wayland quirks (e.g. context menu hides the app on KDE — Wails #4494).

### The X11 problem

The features that *do* work require a pure X11 session — and X11 is being removed from the mainstream:

- GNOME upstream: X11 session disabled at compile time in GNOME 49, removed in GNOME 50; GDM already disables it by default.
- Fedora 43: FESCO approved removing the GNOME-on-Xorg session.
- Ubuntu 25.10: drops X11 in its GNOME edition.

XWayland keeps X11 *apps* running on a Wayland session, but it does not restore global key grabs or reliable always-on-top — those require compositor cooperation Wayland deliberately withholds. So XWayland does not rescue Ghost Chat.

### Implementation gaps in this repo (separate from upstream)

Even if upstream were ready, the project still lacks: a `build/linux/` Taskfile + packaging, `internal/hotkey/keys_linux.go` + `modifiers_linux.go` (only darwin/windows exist), and Linux branches in the `runtime.GOOS` switches in `app.go` (lines 68, 247).

## When to revisit

Reconsider when Wails v3 ships **both**: a Wayland always-on-top mechanism (e.g. layer-shell) **and** a global-hotkey API (e.g. the XDG GlobalShortcuts portal). Track:

- Wails #5421 — global hotkey support
- Wails #5465 — legacy GTK3 path bug-bash
- Wails #4494 — Linux systray hides app on Wayland

## Prior requests

- #1275 — "Linux Build" (Pop!_OS 24.04 / COSMIC, which is Wayland)
