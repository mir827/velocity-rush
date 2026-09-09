# Velocity Rush · Illustrated Realms — v2.2.0

An original canvas exploration platformer. Restore nine lanterns across Sunlit Terraces, Tidal Observatory and Aurora Engine. Procedural original artwork and three original synthesized, layered musical themes; no franchise characters, samples or copied assets.

## Play

- **A / D or ← / →** move, **Space / W / ↑** jump (hold for height), **Shift** optional boost.
- Default cruise speed **400**, acceleration **760**, and optional boost **540**. Camera lead and deliberate hazard signage keep this momentum readable rather than treating speed as one isolated number.
- **P** pause/resume; **R / New run** restarts the entire campaign. Next Stage continues your score and timer.
- Touch supports simultaneous movement and jumping. Music starts on Start; mute and volume are in the header. Pause/backgrounding suspends the score.
- Restore all three lanterns to unlock each exit. Checkpoint flags save your recovery position; falls cost five prisms, not campaign progress.
- Find upper terraces and six hidden star relics per realm. Wind vents amplify held jumps. The observatory adds stepping islands; the engine adds timed pulse barriers (jump over them or wait for blue).
- The campaign targets several minutes at the default pace, with optional upper-route exploration. Boost is not required.

## Run & verify

Node.js 20+, Python 3, installed Google Chrome:

```sh
npm ci
npm run build
python3 -m http.server 4173 --directory dist
# another terminal
npm test
# same suite on the deployed release
BASE_URL=https://mir827.github.io/velocity-rush/ LABEL=live-v2 npm test
```

The real-time campaign test uses keyboard inputs only, reading state to time hazards, never teleporting or scaling time. Separate checkpoint fixtures are reset before traversal. It measures all stage durations and audio signal, tests mute/volume/pause, and uses native CDP multi-touch in portrait. Reports and screenshots are saved in ignored `test-results/`. Allow up to ten minutes per test invocation.

`?test=1` enables test state/fixtures; absent on the regular URL. Audio analyser proves a generated signal, not physical speaker output. Chrome mobile emulation is not a substitute for physical Safari/iOS testing. The main-route completion does not claim every optional relic has been collected.

## Design research / originality

Consulted SEGA's official [Sonic Superstars overview](https://asia.sega.com/SonicSuperStars/en/) and [Adventure / zones](https://asia.sega.com/SonicSuperStars/en/adventure/) on 2026-09-09. The latter describes greenery/seaside, jungle, neon park and digital zones with differing traversal gimmicks. Applied only general principles: distinct regions, alternating movement challenges and recovery space, rewarding upper routes, and musical identity. Our courier, realms, terrain, lantern objectives and note sequences are original. No SEGA images, character designs, music, level layouts or trademarks are distributed in the game. This is a small independent browser game, not commercial Sonic feature parity.

## Deployment & accessibility

GitHub Pages serves the root of `main`: `index.html`, `style.css`, `game.js`, `music.js`. `npm run build` copies these to `dist/`. Version is visible in the header and test state.

Keyboard menus, visible focus, labels, checkpoint announcements, reduced-motion trails, equal-axis canvas scaling and automatic blur pause. Gameplay remains visual and is not screen-reader playable. No tracking or runtime network dependencies.

## License

MIT. Original code, artwork and synthesized score.
