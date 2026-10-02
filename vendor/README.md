# vendor/

Third-party files kept in the repo so the game loads without outside servers (school networks can block CDNs).

| File | Source | Licence |
|---|---|---|
| `preact-htm.module.js` | htm@3.1.1 `preact/standalone.module.js` (Preact + htm bundled) | MIT (Preact), Apache-2.0 (htm, see `htm-LICENSE`) |
| `lucide/` | lucide-static@0.469.0 icon font; `lucide.css` trimmed to the woff2 source | ISC, see `lucide/LICENSE` |
| `noto/` | Noto Emoji SVGs from googlefonts/noto-emoji `2D/svg/` (only the pictures `content.js` uses) | Apache 2.0, see `noto/LICENSE` |
| `fredoka/` | Fredoka from Google Fonts (variable, latin subset) | SIL OFL 1.1, see `fredoka/OFL.txt` |

To update one, download the new version over the old file and test locally before pushing.
