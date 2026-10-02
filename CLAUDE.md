# Word Path (lab)

- Plain static site published by GitHub Pages from `main` (divyasusarla/word-path-lab). No build step.
- The class version lives in a separate repo (divyasusarla/word-path, local clone at ~/word-path). Never push to it unless the user explicitly asks.
- Progress is saved in localStorage under `wordpath-lab.*` keys. Keep these distinct from the class version's `wordpath.*` keys: both sites share the divyasusarla.github.io origin.
- Ported from the Claude Design project "Learning game for sight words" (file `Word Path v2.dc.html`). The repo is now the source of truth.
- Gameplay settings (rounds per level, think time, unlock all) are in `CONFIG` at the top of `app.js`.
- Preview locally with `python3 -m http.server 8765`. Before every push, run http://127.0.0.1:8765/tests/?run in the browser (all checks must pass; `window.testResult` holds the totals) and look at the change in test mode (`?test`). See TESTING.md.
- Test mode (`?test`) must never read or write localStorage. Keep `window.wp` and the test panel behind the TEST flag. When adding a level kind or screen, add checks for it in tests/index.html.
- After pushing, confirm GitHub Pages actually rebuilt (`gh api repos/divyasusarla/word-path-lab/pages/builds/latest`); if it didn't, request one with `gh api -X POST repos/divyasusarla/word-path-lab/pages/builds`.
- No outside servers at runtime: third-party files live in `vendor/` (see vendor/README.md). Don't add CDN links.
- Each pushed change gets a `CHANGELOG.md` entry; milestones get a git tag (`v2.0`, `v2.1`, …).
- Speech sounds: `snd(pair, clipId)` plays `audio/<clipId>.wav` when `audio/manifest.json` lists it, else the browser voice says the fallback text. Every clip id must exist in `sounds.js` (the checks enforce this). New sounds go in `sounds.js` first.
- Importing recordings: `python3 tools/import_audio.py <zip>` (see RECORDING.md). It rebuilds the manifest; don't hand-edit it. Recordings play through Web Audio, unlocked on the first tap for iOS Safari.
- `versions/` holds frozen playable copies. Never edit them except to give each its own `wordpath-archive-<ver>.*` storage keys. When cutting a milestone, copy the current site into `versions/<ver>/` and add a card to `versions/index.html`.
