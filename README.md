# Word Path (lab)

The tinkering copy of Word Path, an early-reading game with spoken prompts. 38 levels in 7 stages follow a standard phonics teaching order: letter sounds and names, first-sound sorting, blending, reading, rhyming and Fry's first 300 sight words.

- Live: https://divyasusarla.github.io/word-path-lab/
- All versions: https://divyasusarla.github.io/word-path-lab/versions/
- Class version (kept separate, don't change): https://divyasusarla.github.io/word-path/

## Files

- `index.html` – page shell
- `content.js` – **what children learn**: the stages and levels, sounds, words, pictures, sight words and stickers, plus a coverage check. Edit this to change content.
- `app.js` – the game: speech, gameplay and screens (Preact + htm, no build step)
- `styles.css` – base styles, hover states and animations
- `vendor/` – Preact/htm, icon font, Fredoka font and Noto Emoji pictures, kept locally so no outside servers are needed
- `CHANGELOG.md` – what changed in each version
- `versions/` – playable copy of every past version, with an index page
- `tests/` – automatic checks that play every level (see `TESTING.md`)
- `TESTING.md` – test mode, automatic checks and the hands-on checklist
- `sounds.js` – the 69 recorded sounds (43 speech sounds + letter names) and how to say each
- `audio/` – the recordings (`<id>.wav`) and `manifest.json` listing which exist
- `tools/record.html` – the recorder; `tools/import_audio.py` – imports its zip into `audio/`
- `RECORDING.md` – step-by-step recording guide

## Run locally

```
python3 -m http.server 8765
```

then open http://127.0.0.1:8765/. Add `?test` to unlock every level without saving (see `TESTING.md`). Pushing to `main` publishes to GitHub Pages.
