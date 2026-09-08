# Velocity Rush · Afterglow Run

An original, dependency-free canvas momentum platformer: a mint-armored courier races across floating sunset gardens. All art is procedural and all sound is synthesized locally; no franchise characters, copied assets, tracking, or remote services.

## Play

- **A / D or ← / →**: accelerate; releasing preserves momentum.
- **Space / W / ↑**: jump; hold for height. **Shift**: higher top speed.
- **P**: pause/resume. **R** or **New run**: restart.
- Touch devices have direction, boost, and jump buttons.
- Gather gold prisms, stomp drones, light checkpoints, and reach the horizon. Falls and drone hits cost five prisms (never below zero). Falls return to the last checkpoint. Sound is opt-in.

## Run & verify

Node.js 20+ and Python 3. Production has no dependencies.

```sh
npm ci
npm run build
python3 -m http.server 4173 --directory dist
# in another terminal, with Google Chrome installed:
npm test
```

Browser tests use Playwright with installed Google Chrome, including a full keyboard-only course completion, collision fixtures, win/restart, desktop/mobile layouts, touch input and sound controls. Screenshots and the JSON report go to ignored `test-results/`. `BASE_URL=https://mir827.github.io/velocity-rush/ npm test` tests production. The `?test=1` URL exposes deterministic test fixtures only when explicitly requested.

## Deployment

GitHub Pages serves the root of `main`. `index.html`, `style.css`, and `game.js` are the complete production site. `npm run build` also creates a standalone `dist/` copy.

## Accessibility & scope

Keyboard-operable menus, visible focus, labeled controls, live checkpoint notices, reduced-motion trails, high-DPI canvas, responsive portrait/landscape layout, and automatic pause on focus loss. The gameplay itself is visual and is not screen-reader playable. One handcrafted rolling course, approximately 20–40 seconds with boost or cautious jumps.

## License

MIT. Original code, artwork, and synthesized audio.
