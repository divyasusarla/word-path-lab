# Word Path (lab)

The tinkering copy of Word Path, an early-reading game (letter sounds, sight words, blending, rhymes) with spoken prompts.

- Live: https://divyasusarla.github.io/word-path-lab/
- All versions: https://divyasusarla.github.io/word-path-lab/versions/
- Class version (kept separate, don't change): https://divyasusarla.github.io/word-path/

## Files

- `index.html` – page shell
- `app.js` – the whole game: level data, speech, gameplay and screens (Preact + htm, no build step)
- `styles.css` – base styles, hover states and animations
- `vendor/` – Preact/htm, icon font and Fredoka font, kept locally so no outside servers are needed
- `CHANGELOG.md` – what changed in each version
- `versions/` – playable copy of every past version, with an index page

## Run locally

```
python3 -m http.server 8765
```

then open http://127.0.0.1:8765/. Pushing to `main` publishes to GitHub Pages.
