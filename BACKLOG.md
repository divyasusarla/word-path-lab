# Backlog

One ranked list: work top to bottom. Move items to CHANGELOG.md when they ship.
Size: S = under an hour, M = a session, L = several sessions. "Parallel" items can happen alongside the main list (mostly your time, not code).
Each item ships as its own pull request, reviewed before merging. Longer-term decisions (hosting, app stores, privacy, licensing) live in FUTURE.md.

## Ranked

| # | Item | Size | Area | Why here |
|---|---|---|---|---|
| 1 | **Automatic checks on every pull request and push**: headless Chrome in GitHub Actions runs `tests/`; a pull request shows pass/fail before you merge, and the site only publishes if every check passes | M | Testing | Every later change runs through it; makes reviewing pull requests meaningful |
| 2 | **Wrong options that force full blending**: in Blend it and Read it, wrong pictures share sounds with the answer (cat / cap / can; cat / hat / bat) | S | Learning | Biggest learning gain for the least work |
| 3 | **Picture naming review**: check pictures a child could name differently (tap → "water", cup → "drink", pan → "egg", nap → "sleep", cash → "money", king → "prince"); swap or rename; say a picture's name when it's pressed and held | S | Learning | A misnamed picture makes a right answer look wrong |
| 4 | **"Sound it out" stops giving the answer away**: say the sounds only, not the whole word | S | Learning | Otherwise Read it can be done by listening |
| 5 | **Learning design document** (`LEARNING_DESIGN.md`): research basis (What Works Clearinghouse K–3 guide, National Reading Panel, Ehri's phases, Scarborough's rope), developmental bands for K / grade 1 / grade 2, rules for where content comes from | S–M | Learning · parallel | Grounds every learning decision below; shapes the band restructure |
| 6 | **About and credits page**: research sources and asset licences (Noto Emoji, Fredoka, Lucide, Preact) in the game | S | Product | Clean attribution from the start |
| 7 | **Layout for tablet, phone and desktop, landscape and portrait**: design pass first (map and play screens, both orientations) for your approval, then build; includes the iOS Safari sound reliability fix | M | Product | Works on every device children might use |
| 8 | **Interim voice fix**: prefer on-device voices over the online Google voice; say the word in the same utterance as the prompt | S | Audio | Fixes level 2's clipped words until #27 |
| 9 | **Rumble filter on import**, plus **re-record s, th (thin), f** (optionally sh, ng, th (this) held longer) | S | Audio · parallel | th (thin) is used in stage 5 |
| 10 | **Move game logic into its own module, with unit tests**: building rounds, choosing wrong options, unlocking; tests that `coverage()` catches broken content | M | Testing | Groundwork for mastery tracking |
| 11 | **Store progress by level id, not position** | S | Engineering | Before mastery data builds up, and before the band restructure moves levels |
| 12 | **Mastery tracking**: record each word and sound, first try right or not; mastered = 3 first-try correct of the last 4, across at least 2 days | M | Learning | Underpins #13, #15–16, #19 and adaptivity |
| 13 | **Don't let guessing finish a level**: count first-try answers; after two misses, model the answer instead of letting elimination win | S | Learning | Needs #12 |
| 14 | **Developmental bands**: regroup stages into K / grade 1 / grade 2 per `LEARNING_DESIGN.md`; add grade 2 content (endings -s -ed -ing, more vowel patterns, two-syllable words) | L | Learning | Fits the K–2 span properly; needs #5 and #11 |
| 15 | **Sight words: full coverage**: rotate through every word in a level across plays, bringing missed words back | M | Learning | Today most words in a level are never seen |
| 16 | **Cumulative review**: mix earlier sounds and words into later levels, weighted to ones not yet mastered | M | Learning | Core phonics practice |
| 17 | **Letter confusions as wrong options**: b/d, p/q, m/n, short e/i, once both are taught | S | Learning | Targets the most common mix-ups |
| 18 | **Grown-up gate on Settings**: hold for 3 seconds, or a simple sum | S | Product | Needed before the teacher report |
| 19 | **Teacher report**: behind the gate; accuracy by level, mastered and struggling words, printable page | M | Product | Needs #12 and #18 |
| 20 | **Export / import progress**: a file or code to move a child between devices or collect a class's results | M | Product | Pairs with #19 |
| 21 | **Usage data**: decide which questions to answer (finishing levels? where children get stuck?), then pick the lightest approach (see FUTURE.md) | S + M | Product · decision | Needs #12 to have data worth looking at |
| 22 | **Teacher-led group mode**: big-screen layout, teacher picks the level, the group answers together, no stickers or progress saved | M | Product | Second use case alongside individual play |
| 23 | **Segmenting levels**: hear "cat", tap the sounds in order | M | Learning | Missing core skill (reverse of blending) |
| 24 | **Spelling levels**: build the word from letter tiles | M | Learning | Spelling strongly reinforces reading |
| 25 | **Heart words**: teach decodable high-frequency words as decoding once their sounds are taught; drill only the irregular parts | M | Learning | Better sight-word method |
| 26 | **Early phonological awareness**: syllable clapping, first/last sound matching for the K band | M | Learning | Fills the start of the sequence |
| 27 | **One voice for everything** (on hold): pre-made audio for prompts and words, cloned voice (C) or standard AI voice (D) | M–L | Audio · decision | Biggest aesthetic win, later |
| 28 | **Child profiles**: name and avatar; several children per device | M | Product | Classroom sharing |
| 29 | **Drag to sort**, as well as tapping | S | Product | Nice to have |
| 30 | **Accessibility pass**: screen-reader labels, contrast, captions for spoken prompts | M | Product | Wider reach; captions help in noisy classrooms |
| 31 | **Tests for the audio tools**: recorder processing and `import_audio.py` with synthetic recordings | S | Testing | Low risk today |
| 32 | **Decodable sentences**: short sentences from taught sounds and heart words, then pick the picture | L | Learning | The step from words to reading text |
| 33 | **Adaptive difficulty**: adjust rounds, wrong options and review from mastery | L | Learning | Builds on everything above |

## Ongoing

- **Try it with children.** Watch a few children play; note where they get stuck or guess (TESTING.md, "With a child"). Results should re-rank this list.

## Done

See CHANGELOG.md.
