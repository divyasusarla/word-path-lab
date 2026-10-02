# Changelog

Each version is tagged in git, and the tags are listed under the repo's Tags on GitHub. Play any version at https://divyasusarla.github.io/word-path-lab/versions/

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
