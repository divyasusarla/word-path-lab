# Changelog

Each version is tagged in git, and the tags are listed under the repo's Tags on GitHub. Play any version at https://divyasusarla.github.io/word-path-lab/versions/

## Unreleased
- iPhone/iPad sound fix: the first letter sound in a level could be silent on Safari, because the recording started before sound had finished starting up. Before every recording the game now makes sure sound is running (waiting briefly if needed), and if it still isn't, the browser voice says that sound instead, so there's never silence. Sound also restarts after the voice speaks (iOS "interrupted") and when returning to the app, and more kinds of taps unlock it.
- Session stopping point: after about 15 minutes of play, the level complete screen says "Great work today! Time for a break." (on screen and spoken). Nothing is blocked. Grown-ups can choose 10, 15 or 20 minutes, or off, in Settings (backlog 13c, from the literature review).
- Coverage: each play picks never-seen words and sounds first, then ones still being learned (least recently practised first), then mastered ones, so playing a level a few times works through its whole list (for example, all 50 sight words in a 50-word level in 9 plays) instead of random picks.
- Cumulative review: from the second level of each kind onwards, 2 of every 8 rounds review items from earlier levels of the same kind (letter sounds, letter names, sight words, decodable words), choosing words the child is still learning first, then mastered ones not seen for longest. Sort and rhyme levels don't review.
- Guessing no longer wins a round: after two misses (one in a sort, which has only two bins), the game shows the answer with a glowing outline, says it ("Here it is: said. Tap it."), and the child taps it. That round counts as not right first time.
- "Practise again": if fewer than half the first taps in a level were right, the level complete screen offers Practise again first (Next level is still there, and the sticker is still given).
- Praise says what was right ("Yes! That says sh.", "Yes! said.", "cat!") instead of generic "Great job!", and announces newly mastered items ("You know that one now!").
- Mastery tracking: every word and sound records its first-try answers (right or not, and the day). Mastered = right first time in 3 of the last 4 attempts, across at least 2 days (`MASTERY_RULE` in engine.js, from the literature review). Only the first tap of a round counts; guesses after a miss don't. The level complete screen says how many of the level's words or sounds the child now knows. Saved on the device; Reset progress clears it; test mode never saves it.
- Literature review, first pass (LEARNING_DESIGN.md): evidence on educational apps and digital phonics (modest gains on taught skills; one large trial found no benefit over good small-group support), spacing, mastery criteria, session length, feedback, rewards, and app design for young children, with what each means for Word Path. Keeps the mastery placeholder; adds research items R8 (evaluation plan) and R9 (reward design) and backlog items 13b, 13c and 22b.
- Play-through checklist page (`tools/checklist.html`): 13 sections and about 80 items covering sound, every kind of level, progress, layout, pictures and playing with a child. Mark ✓/✗, add notes, saved per device; **Copy my notes** makes a summary to share. Level numbers come from the content, so the list stays accurate.
- Rumble filter on recordings: removes sound below 80 Hz from every clip, and below 300 Hz (steeper) from voiceless sounds (s, f, sh, th, h, p, t, k, ch, x). Low rumble in s dropped from 12% of the clip's energy to under 1%, in f from 18% to 2%. All 69 clips re-imported with it.
- Game rules moved into `engine.js` (rounds, wrong options, unlocking, speech, saved progress) as plain functions; `app.js` now only draws the screens and plays audio.
- 27 unit tests for the rules and the content check (`tests/unit/`), run in Node on every pull request and shown on the checks page. Several deliberately break a copy of the content to prove the content check catches each kind of mistake.
- Saved progress is now the list of finished level ids, not positions, so adding or reordering levels keeps a child's progress. Existing saves migrate automatically. The content check rejects duplicate ids.
- Layout for every device, following the approved designs ("Word Path layouts" canvas): four layouts chosen from the screen size: wide (tablet landscape, desktop, Chromebook), tablet portrait, phone portrait and phone landscape.
  - Map: the path runs across in landscape and down in portrait; on phones "Next up" moves to a bar at the bottom and the header shrinks.
  - Play screens: top bar (back, level, progress), answers sized to the screen, and Hear again always in the same place (bottom-left; a full-width bar on phones).
  - Pictures stack on phones; sort levels put the picture on top with the two bins below; bubbles size themselves to the screen.
- Browsers always get the newest files after a publish (file versions are stamped at publish time).
- `tools/serve.py`: local server that disables caching, so reloads always show the latest edits.
- New checks: at four screen sizes, the map and every kind of level fit without scrolling, stops stay inside the map, Hear again stays on screen and never covers an answer, buttons are at least 40px and answers at least 64px.
- Sort levels: the picture on each sound's bin (sun for s, pig for p…) also appeared as a picture to sort, so it showed up twice. Removed from the sorting pile in every sort level, with a content check to stop it recurring (found in testing).
- About screen: "Castles, Rastle & Nation" showed as "&amp;amp;"; fixed, with a check that no HTML codes show as text.
- Backlog: research questions R1–R7 (including a literature review); picture decisions moved to testing.
- Checks run automatically on every pull request and push (GitHub Actions, headless Chrome); the site only publishes from `main` when every check passes. Replaces the publish-only workflow.
- Voice: prefers voices built into the device over online ones (which can clip short words), and says sight words in the same sentence as the prompt ("Pop the word: said.") instead of on their own. A voice chosen in settings still wins.
- About and credits screen (from Grown-up settings): what the game covers, the research behind it, a no-affiliation note, asset licences, and a privacy note.
- `LEARNING_DESIGN.md`: the research basis (12 principles with sources), proposed K / grade 1 / grade 2 bands, content rules and open research questions.
- Picture review page at `tools/pictures.html`: every picture with its word and levels, flagging ones a child might name differently.
- Read it: "Sound it out" now says each sound slowly without saying the whole word, so the child does the blending.
- Blend it and Read it: wrong pictures now sound like the answer (cat → cap, can, hat), chosen from every word the child can decode by that stage, so the first sound alone isn't enough. New checks enforce it.

## v3.0 — 2026-10-02
- Full teaching order: 38 levels in 7 stages (s a t p i n → m d g o c k ck → e u r h b f l → j v w x y z qu → sh ch th ng → magic e → vowel teams). Every stage has letter sounds, sorting, blending, and sight words; stages 1–4 add letter names; reading and rhyming levels are mixed in.
- All content in `content.js`, with a coverage check: every letter taught and named, every word has a picture, and blending/reading words only use sounds already taught.
- Pictures are now Noto Emoji (136 pictures, Apache 2.0), covering words the old icons couldn't.
- One map per stage, with arrows between stages. The sticker book has 38 stickers, grouped by stage.
- New sound sorts ask "Does it have…?" (short vs long a; ee vs oa) as well as "Does it start with…?".
- Sight words now cover Fry 1–300, and the missing word "its" is back in the first hundred (it was missing in v1 and v2 too).
- Progress starts fresh (new levels); the previous 10-level lab version is in the archive as v2.4.
- Checks: 55 automatic checks, including the content check, every picture, every stage map and all 38 levels.

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
