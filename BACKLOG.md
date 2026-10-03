# Backlog

One ranked list: work top to bottom. Move items to CHANGELOG.md when they ship.
Size: S = under an hour, M = a session, L = several sessions. "Parallel" items can happen alongside the main list (mostly your time, not code).

## Ranked

| # | Item | Size | Area | Why here |
|---|---|---|---|---|
| 1 | **iPhone works well**: reliable sound in Safari (unlocking, interruptions, switching apps); layout that fits a phone (map, play screens, header, buttons, text) | M | Product | Makes your phone a quick test device for everything below |
| 2 | **Run the checks automatically on every push**: headless Chrome in GitHub Actions runs `tests/`; the site only publishes if every check passes | M | Testing | Safety net before the bigger logic changes |
| 3 | **Wrong options that force full blending**: in Blend it and Read it, wrong pictures share sounds with the answer (cat / cap / can; cat / hat / bat), so the first sound alone isn't enough | S | Learning | Biggest learning gain for the least work |
| 4 | **Picture naming review**: check pictures a child could name differently (tap → "water", cup → "drink", pan → "egg", nap → "sleep", cash → "money", king → "prince"); swap or rename; say a picture's name when it's pressed and held | S | Learning | A misnamed picture makes a right answer look wrong |
| 5 | **"Sound it out" stops giving the answer away**: say the sounds only, not the whole word | S | Learning | Otherwise Read it can be done by listening |
| 6 | **Interim voice fix**: prefer on-device voices over the online Google voice; say the word in the same utterance as the prompt | S | Audio | Fixes level 2's clipped words until the voice decision (#21) |
| 7 | **Rumble filter on import**, plus **re-record s, th (thin), f** (and optionally sh, ng, th (this) held longer) | S | Audio · parallel | th (thin) is now used in stage 5 |
| 8 | **Move game logic into its own module, with unit tests**: building rounds, choosing wrong options, unlocking; tests that `coverage()` catches broken content | M | Testing | Groundwork for mastery tracking |
| 9 | **Store progress by level id, not position** | S | Engineering | Must happen before mastery data builds up |
| 10 | **Mastery tracking**: record each word and sound, first try right or not; mastered = 3 first-try correct of the last 4, across at least 2 days | M | Learning | Underpins #11–13, #16 and adaptivity |
| 11 | **Don't let guessing finish a level**: count first-try answers; after two misses, model the answer instead of letting elimination win | S | Learning | Needs #10 |
| 12 | **Sight words: full coverage**: rotate through every word in a level across plays, bringing missed words back | M | Learning | Today most words in a level are never seen |
| 13 | **Cumulative review**: mix earlier sounds and words into later levels, weighted to ones not yet mastered | M | Learning | Core phonics practice |
| 14 | **Letter confusions as wrong options**: b/d, p/q, m/n, short e/i, once both are taught | S | Learning | Targets the most common mix-ups |
| 15 | **Grown-up gate on Settings**: hold for 3 seconds, or a simple sum | S | Product | Needed before the teacher report |
| 16 | **Teacher report**: behind the gate; accuracy by level, mastered and struggling words, printable page | M | Product | Needs #10 and #15 |
| 17 | **Export / import progress**: a file or code to move a child between devices or collect a class's results | M | Product | Pairs with #16 |
| 18 | **Segmenting levels**: hear "cat", tap the sounds in order | M | Learning | Missing core skill (reverse of blending) |
| 19 | **Spelling levels**: build the word from letter tiles | M | Learning | Spelling strongly reinforces reading |
| 20 | **Heart words**: teach decodable high-frequency words as decoding once their sounds are taught; drill only the irregular parts | M | Learning | Better sight-word method |
| 21 | **One voice for everything**: pre-made audio for prompts and words, cloned voice (C) or standard AI voice (D) | M–L | Audio · decision | Consistent sound on every device; needs your choice |
| 22 | **Early phonological awareness**: syllable clapping, first/last sound matching in stage 1 | M | Learning | Fills the start of the sequence |
| 23 | **Child profiles**: name and avatar; several children per device | M | Product | Classroom sharing |
| 24 | **Drag to sort**, as well as tapping | S | Product | Nice to have |
| 25 | **Accessibility pass**: screen-reader labels, contrast, captions for spoken prompts | M | Product | Wider reach; captions help in noisy classrooms |
| 26 | **Tests for the audio tools**: recorder processing and `import_audio.py` with synthetic recordings | S | Testing | Low risk today; matters if recording grows |
| 27 | **Decodable sentences**: short sentences from taught sounds and heart words, then pick the picture | L | Learning | The step from words to reading text |
| 28 | **Adaptive difficulty**: adjust rounds, wrong options and review from mastery | L | Learning | Builds on everything above |

## Ongoing

- **Try it with children.** Watch a few children play; note where they get stuck or guess (TESTING.md, "With a child"). Results should re-rank this list.

## Done

See CHANGELOG.md.
