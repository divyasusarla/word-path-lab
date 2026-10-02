# Changelog

Each version is tagged in git (`git tag`), and the tags are listed under the repo's Tags on GitHub.

## v2.1 — 2026-10-02
- The game no longer needs outside servers: Preact/htm, the Lucide icon font and the Fredoka font are now in `vendor/`. It works on networks that block CDNs.
- Added this changelog.

## v2.0 — 2026-10-02
- Word Path v2 from Claude Design, rebuilt as plain files (`index.html`, `app.js`, `styles.css`) with no build step.
- 10 levels across 3 mini-games (pop, picture match, sort), map, sticker book, grown-up settings.
- Saves progress under its own `wordpath-lab.*` keys, separate from the class version.

## v1 — class version
- The original Claude Design export, live at https://divyasusarla.github.io/word-path/ (repo `divyasusarla/word-path`). Kept unchanged.
