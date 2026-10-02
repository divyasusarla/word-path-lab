# Changelog

Each version is tagged in git, and the tags are listed under the repo's Tags on GitHub. Play any version at https://divyasusarla.github.io/word-path-lab/versions/

## v2.4 — 2026-10-02
- Publishing now runs through a GitHub Actions workflow, so every push reaches the site (the built-in publishing skipped some pushes).
- All 69 recordings added: every speech sound in levels 1–10 now plays from a real recording instead of the browser voice.
- Import cleans each clip: removes key clicks, quiet lead-ins and long silent tails, and evens out the volume.
- Recorder fix: ignores the first quarter-second of each take, so the click of the key or button that starts recording isn't kept.

## v2.3 — 2026-10-02
- Recorder at `tools/record.html` for all 69 clips (43 speech sounds + 26 letter names): record, listen back, redo, with automatic trimming, even volume and notes when a take looks too short, long or loud. Keeps takes in the browser between sessions; downloads them as one zip.
- The game plays recorded sounds when they exist and falls back to the browser voice otherwise. Works on iPad/iPhone Safari (audio unlocks on the first tap).
- Test-mode captions mark each sound 🎙 recording or 🤖 browser voice. New checks cover the recording list and the recorder page.
- `RECORDING.md` step-by-step guide; `tools/import_audio.py` to bring recordings in.

## v2.2 — 2026-10-02
- Test mode: add `?test` to the address to open every level without saving anything, with a test panel (jump to any level or screen, answer right/wrong, set stickers earned, see captions of what's spoken). Address options: `level`, `screen`, `done`, `rounds`, `think`, `mute`.
- Automatic checks at `tests/`: play every level and open every screen in about 30 seconds, including a check that every icon exists.
- `TESTING.md`: how to use both, plus a hands-on checklist for voice, screens, layout and trying it with a child.
- Rhyme time (level 6): each picture now shows its word underneath.
- Sort levels (3 and 7): the question no longer ends with a separately spoken "?", which some voices read as "question mark".

## v2.1 — 2026-10-02
- Playable archive of every version at `versions/` (v1 and v2 are the exact class-repo uploads, with their own save slots so they can't touch the class link's progress).
- The game no longer needs outside servers: Preact/htm, the Lucide icon font and the Fredoka font are now in `vendor/`. It works on networks that block CDNs.
- Added this changelog.

## v2.0 — 2026-10-02
- Word Path v2 from Claude Design, rebuilt as plain files (`index.html`, `app.js`, `styles.css`) with no build step.
- 10 levels across 3 mini-games (pop, picture match, sort), map, sticker book, grown-up settings.
- Saves progress under its own `wordpath-lab.*` keys, separate from the class version.

## v2 — Oct 1, 2026 (class version)
- Playful redesign for young children: winding path map, bouncing bubbles, Fredoka font.
- Adds grown-up settings: voice, volume, talking speed, test voice, reset progress.
- This is what the class link https://divyasusarla.github.io/word-path/ runs (repo `divyasusarla/word-path`, kept unchanged).

## v1 — Oct 1, 2026
- First version, in the Modernist design system: square grid map in red and black.
- 10 levels across pop, picture-match and sort games, sticker book.
