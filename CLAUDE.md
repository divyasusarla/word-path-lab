# Word Path (lab)

- Plain static site published by GitHub Pages from `main` (divyasusarla/word-path-lab). No build step.
- The class version lives in a separate repo (divyasusarla/word-path, local clone at ~/word-path). Never push to it unless the user explicitly asks.
- Progress is saved in localStorage under `wordpath-lab.*` keys. Keep these distinct from the class version's `wordpath.*` keys: both sites share the divyasusarla.github.io origin.
- Ported from the Claude Design project "Learning game for sight words" (file `Word Path v2.dc.html`). The repo is now the source of truth.
- Gameplay settings (rounds per level, think time, unlock all) are in `CONFIG` at the top of `app.js`.
- All content lives in `content.js`: GRAPHEMES (sound → recording), PICS (word → Noto emoji), WORDS (word → sounds to blend), FRY (300 sight words), STAGES (the teaching order) and STICKERS (one per level). `coverage()` must return no problems: every letter taught and named, words only use sounds already taught, every word has a picture. New pictures: add the emoji to PICS, then download `2D/svg/<emojiFile>` from googlefonts/noto-emoji into `vendor/noto/`.
- Progress is stored by level position under `wordpath-lab.v2`. Reordering or inserting levels shifts saved progress; bump the key if that matters.
- Preview locally with `python3 -m http.server 8765`. Before every push, run http://127.0.0.1:8765/tests/?run in the browser (all checks must pass; `window.testResult` holds the totals) and look at the change in test mode (`?test`). See TESTING.md.
- Test mode (`?test`) must never read or write localStorage. Keep `window.wp` and the test panel behind the TEST flag. When adding a level kind or screen, add checks for it in tests/index.html.
- Publishing runs through GitHub Actions (`.github/workflows/pages.yml`) on every push to main. After pushing, confirm the run succeeded: `gh run list --workflow pages.yml --limit 1`; rerun with `gh workflow run pages.yml` if needed.
- No outside servers at runtime: third-party files live in `vendor/` (see vendor/README.md). Don't add CDN links.
- Each pushed change gets a `CHANGELOG.md` entry; milestones get a git tag (`v2.0`, `v2.1`, …).
- Speech sounds: `snd(pair, clipId)` plays `audio/<clipId>.wav` when `audio/manifest.json` lists it, else the browser voice says the fallback text. Every clip id must exist in `sounds.js` (the checks enforce this). New sounds go in `sounds.js` first.
- Importing recordings: `python3 tools/import_audio.py <zip>` (see RECORDING.md). It rebuilds the manifest; don't hand-edit it. Recordings play through Web Audio, unlocked on the first tap for iOS Safari.
- `versions/` holds frozen playable copies. Never edit them except to give each its own `wordpath-archive-<ver>.*` storage keys. When cutting a milestone, copy the current site into `versions/<ver>/` and add a card to `versions/index.html`.
- Planned work lives in BACKLOG.md; tick items off there and record them in CHANGELOG.md when they ship.
