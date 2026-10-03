# Word Path (lab)

The tinkering copy of Word Path, an early-reading game with spoken prompts. 38 levels in 7 stages follow a standard phonics teaching order: letter sounds and names, first-sound sorting, blending, reading, rhyming and Fry's first 300 sight words.

- Live: https://divyasusarla.github.io/word-path-lab/
- All versions: https://divyasusarla.github.io/word-path-lab/versions/
- Automatic checks: https://divyasusarla.github.io/word-path-lab/tests/
- Recorder: https://divyasusarla.github.io/word-path-lab/tools/record.html
- Picture review: https://divyasusarla.github.io/word-path-lab/tools/pictures.html
- Play-through checklist: https://divyasusarla.github.io/word-path-lab/tools/checklist.html
- Class version (kept separate, don't change): https://divyasusarla.github.io/word-path/ (repo `divyasusarla/word-path`)

## How it fits together

A plain static site with no build step: the browser loads `index.html`, which runs `app.js`.

- `content.js` decides **what** children learn: stages, levels, sounds, words, pictures and stickers.
- `sounds.js` lists every **recorded** sound; `audio/` holds the recordings.
- `engine.js` holds the **game rules**: building rounds, choosing wrong options, unlocking, what's spoken, saved progress. Plain functions with no screen code, so they're unit-tested.
- `app.js` is the **game screens**: it uses the engine, plays recordings (falling back to the browser's voice) and draws everything.
- Progress and settings are saved in the browser (localStorage), per device.

## Files

| Path | What it is |
|---|---|
| `index.html` | Page shell that loads the game |
| `app.js` | The game screens: drawing, audio playback, test mode (Preact + htm) |
| `engine.js` | The game rules as plain, unit-tested functions |
| `content.js` | **What children learn**: the teaching order, words, pictures, sight words, stickers, and `coverage()`, which checks it. Edit this to change content |
| `sounds.js` | The 69 recorded sounds (43 speech sounds + 26 letter names) and how to say each |
| `styles.css` | Base styles, hover states and animations |
| `audio/` | The recordings: `<id>.wav` masters and small `<id>.m4a` copies the game plays, `manifest.json` (which exist) and `sources.json` (which takes were imported) |
| `script.js` | Every word and line the game can say, worked out from the levels and batched by stage for the recorder |
| `vendor/` | Third-party files kept locally so nothing loads from outside servers: Preact/htm, icon font, Fredoka font, Noto Emoji pictures (see `vendor/README.md`) |
| `tests/` | Browser checks that play every level (`index.html`; `run-checks.mjs` runs them headlessly on GitHub) and unit tests for the rules (`unit/`; `node tests/unit/run.mjs`) (see `TESTING.md`) |
| `package.json` | Only tells Node the `.js` files are modules, for the unit tests. There's no build step or dependencies |
| `tools/record.html` | The recorder: letter sounds, then every word and line in batches by stage |
| `tools/checklist.html` | Play-through checklist: ✓/✗ per item, notes, saved per device, copy notes to share |
| `tools/pictures.html` | Review page: every picture with its word, the levels using it, and flags for pictures a child might name differently |
| `tools/hearts.html` | Review page: every sight word in its Word pop level, with the tricky (heart) letters marked |
| `tools/serve.py` | Local development server that disables caching |
| `tools/import_audio.py` | Brings the recorder's zip into `audio/`, removing clicks and silence and evening out volume |
| `versions/` | A playable copy of every past version, with an index page |
| `.github/workflows/site.yml` | Runs the checks on every pull request and push; publishes to GitHub Pages from `main` only if they pass |
| `README.md` | This file |
| `CHANGELOG.md` | What changed in each version |
| `ARCHITECTURE.md` | How the game works inside: the pieces, a round step by step, state and storage |
| `DECISIONS.md` | Why it's built this way: each decision, alternatives and when to revisit |
| `LEARNING_DESIGN.md` | How the game teaches and why: principles, research references, developmental bands, content rules |
| `BACKLOG.md` | Planned work and ideas |
| `FUTURE.md` | Longer-term decisions: hosting, app stores, privacy, licensing |
| `TESTING.md` | Test mode, automatic checks and the hands-on checklist |
| `RECORDING.md` | Step-by-step recording guide |
| `CLAUDE.md` | Working notes for Claude Code sessions on this project |

## Common tasks

**Run it locally**

```
python3 tools/serve.py
```

then open http://127.0.0.1:8765/. Add `?test` to open every level without saving anything (see `TESTING.md`).

**Change content** (words, levels, pictures): edit `content.js`. In test mode, the panel shows whether the content check passes; `tests/` gives details. A new picture needs its emoji added to `PICS` and the matching file in `vendor/noto/`.

**Add or redo recordings**: follow `RECORDING.md`, then run `python3 tools/import_audio.py ~/Downloads/word-path-audio-<date>.zip`.

**Publish**: each change goes on its own branch and pull request. The checks run automatically and show on the pull request. After review, merging into `main` runs them again and publishes through GitHub Actions if they pass (about 3 minutes). Add a `CHANGELOG.md` entry; tag milestones (`git tag -a v3.1`) and copy them into `versions/`.
