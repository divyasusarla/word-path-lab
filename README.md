# Word Path (lab)

The tinkering copy of Word Path, an early-reading game (letter sounds, sight words, blending, rhymes) with spoken prompts.

- Live: https://divyasusarla.github.io/word-path-lab/
- Class version (kept separate, don't change): https://divyasusarla.github.io/word-path/

## Files

- `index.html` – page shell
- `app.js` – the whole game: level data, speech, gameplay and screens (Preact + htm from a CDN, no build step)
- `styles.css` – base styles, hover states and animations

## Run locally

```
python3 -m http.server 8765
```

then open http://127.0.0.1:8765/. Pushing to `main` publishes to GitHub Pages.
