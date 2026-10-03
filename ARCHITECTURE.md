# Architecture

How the game works inside. For what each file is, see the README; for why it's built this way, see DECISIONS.md.

## The pieces

```
index.html ──loads──▶ app.js (screens, audio, test mode)
                        │ uses
                        ▼
                      engine.js (game rules: pure functions)
                        │ uses
                        ▼
                      content.js (what children learn) ──▶ sounds.js (the 69 recordable sounds)
                      script.js (every word and line to record, batched by stage; for the recorder and checks)
                                                            audio/ (the recordings)
                                                            vendor/noto/ (pictures)
```

- **content.js** is data: stages and levels, sounds (`GRAPHEMES`), words and their sounds (`WORDS`), pictures (`PICS`), sight words (`FRY`), stickers. `coverage()` checks it.
- **engine.js** turns content into play: which items a round practises, the wrong options, what's said, whether an answer is right, unlocking, mastery, review, the session timer, layouts. No screen code, no browser APIs, so it's unit-tested in Node.
- **app.js** is one Preact component (`App`) that holds the state, draws the current screen, plays sound and saves progress.

## A round, step by step

1. **Starting a level** (`start(i)`): the engine builds the rounds (`buildRounds`), choosing never-seen and still-learning items first, plus review items from earlier levels. The app shows the play screen and speaks the first question (`prompt` → `speak`).
2. **Speaking** (`speak(parts)`): each part is a line, a pause, a word or a speech sound, and each can have a recording: speech sounds and letter names (`sounds.js`), words (`word-cat`, from `word()`), and lines (a plain string; its clip is named after its text, `say-try-again`, via `sayId`). Words are separate parts, never baked into a line, so a few dozen lines cover every round. For a part with a recording, the app checks the audio engine is running (`audioReady`), fetches and decodes the clip once (`clipBuffer`; letter sounds and instruction lines are fetched when sound first starts, each level's words and lines when it starts: `preload`, `preloadLevel`), and plays it (`playClip`); otherwise the browser voice says it (`utter`). A newer `speak` call cancels an older one.
3. **A tap** (`pickPop` / `pickMatch` / `pickBin`): the first tap of the round is recorded for mastery (`record` → `recordAttempt`). A right answer plays praise (`praiseParts`), waits the think time, then moves on (`next`). A wrong answer explains it; after enough misses the answer is shown and said (`miss` → `modelParts`).
4. **Progress report** (`progressReport` in engine.js, `reportView` in app.js): built on demand from finished levels and the mastery store; nothing extra is saved.
5. **Finishing a level** (`next` on the last round): the level is marked done and saved by id; the level complete screen shows the sticker, how many items are known, and Practise again or Time for a break when they apply.

## State and storage

| What | Where (localStorage key) | Notes |
|---|---|---|
| Finished levels | `wordpath-lab.v3` | List of level ids; old `v2` saves migrate automatically |
| Mastery | `wordpath-lab.mastery.v1` | `{ "blend:cat": [{ day, ok }, …] }`, last 8 attempts per item |
| Settings | `wordpath-lab.audio` | Voice, volume, talking speed, session length |
| Checklist marks | `wordpath-checklist.v1` | Used only by `tools/checklist.html` |

Test mode (`?test`) never reads or writes any of these.

## Layout

`layoutFor(width, height)` picks one of four layouts (wide, tablet-portrait, phone, phone-landscape) and the app puts `layout-<name>` on the root element; the matching CSS is at the bottom of `styles.css`. The map's path and stops are computed for across or down (`stagePos`, `stagePath`).

## Testing hooks

In test mode the app exposes `window.wp` (state, answer right/wrong, start a level, captions of everything spoken, mastery, audio state, a simulated audio block). `tests/index.html` drives the game through it; `tests/unit/engine.test.js` tests `engine.js` and `content.js` directly. See TESTING.md.
