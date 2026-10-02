# Word Path (lab)

- Plain static site published by GitHub Pages from `main` (divyasusarla/word-path-lab). No build step.
- The class version lives in a separate repo (divyasusarla/word-path, local clone at ~/word-path). Never push to it unless the user explicitly asks.
- Progress is saved in localStorage under `wordpath-lab.*` keys. Keep these distinct from the class version's `wordpath.*` keys: both sites share the divyasusarla.github.io origin.
- Ported from the Claude Design project "Learning game for sight words" (file `Word Path v2.dc.html`). The repo is now the source of truth.
- Gameplay settings (rounds per level, think time, unlock all) are in `CONFIG` at the top of `app.js`.
- Preview locally with `python3 -m http.server 8765` and check in the browser before pushing.
