# Ghost Chat videos

Remotion project that renders the promo (`GhostChatPromo`, ~1 min) and the Windows setup tutorial (`GhostChatTutorial`, ~2 min) using the real frontend components from `../frontend/src` with mocked Wails bindings.

```bash
pnpm install
pnpm studio    # live preview + timeline in the browser
pnpm render    # → out/promo.mp4 + out/tutorial.mp4 (or render:promo / render:tutorial)
```

- Promo scenes live in `src/scenes/` (order in `src/Promo.tsx`), tutorial chapters in `src/tutorial/` (order in `src/tutorial/Tutorial.tsx`)
- The website serves copies from `website/assets/`; copy `out/*.mp4` there after re-rendering
- Chat messages are scripted in `src/data/messages.ts`
- Use real gameplay as the background: drop a clip in `public/` (create it) and render with `pnpm render --props='{"video":"gameplay.mp4"}'`
- Remote Twitch emote/badge images are fetched at render time, so rendering needs network access
