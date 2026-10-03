# Backlog

Next up is ranked: work top to bottom. Move items to Shipped (and CHANGELOG.md) when they ship.
Size: S = under an hour, M = a session, L = several sessions. "Parallel" items can happen alongside the main list (mostly your time, not code).
Each item ships as its own pull request, reviewed before merging. Longer-term decisions (hosting, app stores, privacy, licensing) live in FUTURE.md.

## Next up (ranked)

Work top to bottom. "Parallel" items are mostly your time and can happen alongside.

| # | Item | Size | Area | Why here |
|---|---|---|---|---|
| 34 | **Show the word after the answer**: after a right answer, show the written word and highlight how it links to the sounds. First sounds: "sock" under the picture with the **s** lit up, said aloud. Letter sounds: the keyword picture and word ("s… sun"). Blend it: the word appears and each letter lights up as its sound plays. Rhyme time: both words with the shared ending highlighted. No new recordings | S–M | Learning | Connects sounds, spellings and meanings (orthographic mapping, Ehri 2014); first child test |
| 9 | **Re-record 6 letter sounds** in the recorder's "Letter sounds and names" batch: s and f (background rumble), th (thin) and th (this) (0.3–0.4 s, mostly breath), sh and ng (0.6 s): hold each for about 2 seconds. Then Download all; only these re-imports | S | Audio · parallel | Yours |
| 3 | **Picture naming review** (part 1 shipped: `tools/pictures.html`; part 2, the decisions, happens during testing: see Research R2): check pictures a child could name differently (tap → "water", cup → "drink", pan → "egg", nap → "sleep", cash → "money", king → "prince"); swap or rename; say a picture's name when it's pressed and held | S | Learning | A misnamed picture makes a right answer look wrong |
| 35 | **Hint ladder**: a little help first, more if needed. First miss: replay the question more slowly and take away one wrong option. Then a hint per game: the keyword picture for a letter sound, a stretched first sound ("sssock") for sorting, the sounds closer together for Blend it. After two misses: show and say the answer (as now). Several misses in a row: easier next rounds, or suggest the level before | M | Learning | Supporting a child who's stuck (first child test); graded prompting and corrective feedback (LEARNING_DESIGN.md) |
| 36 | **Word pool breadth**: far more words per level, so plays don't repeat the same few. A "hear it, find the word" game (hear "map", pick from map / mop / nap) needs no picture, so any decodable word can be used; First sounds varies its letter pair each play across every letter taught; letter levels mix in more earlier letters. New words are recorded in batches like before | M–L | Learning | Repeats felt in the first child test; decoding practice needs many words with taught sounds (Foorman et al. 2016, rec. 3) |
| 14 | **Developmental bands**: regroup stages into K / grade 1 / grade 2 per `LEARNING_DESIGN.md`; add grade 2 content (endings -s -ed -ing, more vowel patterns, two-syllable words) | L | Learning | Fits the K–2 span properly; needs #5 and #11 |
| 14b | **Consonant blends as a teaching step**: st, sp, sn, fr, tr, cl, -nd, -mp… with sorting, blending and reading levels; today some words (snake, star, spoon, tree) use blends that were never taught | M | Learning | Gap found in LEARNING_DESIGN.md; part of band B |
| 26 | **Early phonological awareness**: syllable clapping, first/last sound matching for the K band | M | Learning | Fills the start of the sequence |
| 23 | **Segmenting levels**: hear "cat", tap the sounds in order | M | Learning | Missing core skill (reverse of blending) |
| 24 | **Spelling levels**: build the word from letter tiles | M | Learning | Spelling strongly reinforces reading |
| 25 | **Heart words**: teach decodable high-frequency words as decoding once their sounds are taught; drill only the irregular parts | M | Learning | Better sight-word method |
| 29 | **Drag to sort**, as well as tapping | S | Product | An extra way to answer: tapping stays, so the game still works for children who find dragging hard (dragging is harder for the youngest) |
| 30 | **Accessibility pass**: screen-reader labels, contrast, captions for spoken prompts | M | Product | Wider reach; captions help in noisy classrooms |
| 32 | **Decodable sentences**: short sentences from taught sounds and heart words, then pick the picture | L | Learning | The step from words to reading text |

## Later (depends on which use cases we build for)

For teachers, classrooms and several children per device. Revisit once the main use case is settled.

| # | Item | Size | Area | Why here |
|---|---|---|---|---|
| 20 | **Export / import progress**: a file or code to move a child between devices or collect a class's results | M | Product | Pairs with #19 |
| 21 | **Usage data**: decide which questions to answer (finishing levels? where children get stuck?), then pick the lightest approach (see FUTURE.md) | S + M | Product · decision | Needs #12 to have data worth looking at |
| 22 | **Teacher-led group mode**: big-screen layout, teacher picks the level, the group answers together, no stickers or progress saved | M | Product | Second use case alongside individual play |
| 22b | **Grown-up prompts**: optional off-screen activity ideas after a level ("Find three things at home that start with s") for families and teachers | S | Learning | Social and meaningful pillars (Hirsh-Pasek et al. 2015) |
| 28 | **Child profiles**: name and avatar; several children per device | M | Product | Classroom sharing |
| 33 | **Adaptive difficulty**: adjust rounds, wrong options and review from mastery | L | Learning | Builds on everything above |

## Shipped

Details in CHANGELOG.md.

| # | Item | Size | Area | Why here |
|---|---|---|---|---|
| 1 | ✅ ~~**Automatic checks on every pull request and push**: headless Chrome in GitHub Actions runs `tests/`; a pull request shows pass/fail before you merge, and the site only publishes if every check passes~~ | | | Shipped (CHANGELOG) |
| 2 | ✅ ~~**Wrong options that force full blending**: in Blend it and Read it, wrong pictures share sounds with the answer (cat / cap / can; cat / hat / bat)~~ | | | Shipped (CHANGELOG) |
| 4 | ✅ ~~**"Sound it out" stops giving the answer away**: say the sounds only, not the whole word~~ | | | Shipped (CHANGELOG) |
| 5 | ✅ ~~**Learning design document** (`LEARNING_DESIGN.md`): research basis (What Works Clearinghouse K–3 guide, National Reading Panel, Ehri's phases, Scarborough's rope), developmental bands for K / grade 1 / grade 2, rules for where content comes from~~ | | | Shipped (CHANGELOG) |
| 6 | ✅ ~~**About and credits page**: research sources and asset licences (Noto Emoji, Fredoka, Lucide, Preact) in the game~~ | | | Shipped (CHANGELOG) |
| 7 | ✅ ~~Layout for tablet, phone and desktop, landscape and portrait~~ | | | Shipped (CHANGELOG) |
| 7b | ✅ ~~Second layout pass: sticker book, settings, level complete and About~~ | | | Shipped (CHANGELOG) |
| 8 | ✅ ~~**Interim voice fix**: prefer on-device voices over the online Google voice; say the word in the same utterance as the prompt~~ | | | Shipped (CHANGELOG) |
| 10 | ✅ ~~**Move game logic into its own module, with unit tests**: building rounds, choosing wrong options, unlocking; tests that `coverage()` catches broken content~~ | | | Shipped (CHANGELOG) |
| 11 | ✅ ~~**Store progress by level id, not position**~~ | | | Shipped (CHANGELOG) |
| 12 | ✅ ~~**Mastery tracking**~~ | | | Shipped (CHANGELOG) |
| 13 | ✅ ~~Don't let guessing finish a level~~ | | | Shipped (CHANGELOG) |
| 13b | ✅ ~~Informational praise~~ | | | Shipped (CHANGELOG) |
| 13c | ✅ ~~Session stopping point~~ | | | Shipped (CHANGELOG) |
| 15 | ✅ ~~**Sight words: full coverage**: rotate through every word in a level across plays, bringing missed words back~~ | | | Shipped (CHANGELOG) |
| 16 | ✅ ~~**Cumulative review**: mix earlier sounds and words into later levels, weighted to ones not yet mastered~~ | | | Shipped (CHANGELOG) |
| 17 | ✅ ~~**Letter confusions as wrong options**: b/d, p/q, m/n, short e/i, once both are taught~~ | | | Shipped (CHANGELOG) |
| 18 | ✅ ~~**Grown-up gate on Settings**: hold for 3 seconds, or a simple sum~~ (a single digit times a teen, on a number pad) | | | Shipped (CHANGELOG) |
| 19 | ✅ ~~**Teacher report**: behind the gate; accuracy by level, mastered and struggling words~~ (one screen to screenshot, not a printable page) | | | Shipped (CHANGELOG) |
| 27 | ✅ ~~**One voice for everything**: record ourselves; recorder batches by stage~~ (all 535 words and lines recorded and imported 2026-10-03). Revisit a generated voice at #32 (sentences) | | | Shipped (CHANGELOG) |
| 31 | ✅ ~~**Tests for the audio tools**: recorder processing and `import_audio.py` with synthetic recordings~~ | | | Shipped (CHANGELOG) |
| 7c | ✅ ~~**iOS Safari sound reliability**~~ (confirmed on iPhone Safari 2026-10-03, with the new recordings) | | | Shipped (CHANGELOG) |
| 27b | ✅ ~~**Smaller audio files**~~ (AAC copies: 5.4 MB instead of 27 MB; WAV kept as the master) | | | Shipped (CHANGELOG) |

## Research

Questions to answer before or alongside the learning items. Findings go into LEARNING_DESIGN.md.

| # | Question | How | Informs |
|---|---|---|---|
| R1 | **Literature review**: first pass done (LEARNING_DESIGN.md, "Literature review"): apps and digital phonics, spacing, mastery criteria, session length, feedback, rewards, app design for young children. Follow-ups: smooth ("mmmaaap") vs separated blending for beginners (Gonzalez-Frey & Ehri 2021; affects Blend it and #35); the letter mix-up pairs in `CONFUSIONS`; saying "a" and "the" as "uh"/"thuh" in Word pop. Also: verify the flagged citations, then a deeper pass on decodable text and phonological awareness | Desk research | Everything |
| R2 | **Picture naming**: which pictures do children name as intended? Decide on the 10 flagged as likely misnamed and 11 worth a look (`tools/pictures.html`) | During testing: ask children to name pictures; note mismatches | #3 part 2 |
| R3 | **Programme alignment**: how much would matching a school's sequence (e.g. UFLI) help children, and what's allowed without using its materials? | Desk research; compare published sequences; check terms | #14 bands |
| R4 | **Mastery threshold** (first answer: keep the placeholder; per-item, about 3 correct, spaced over days fits the evidence; revisit with data): is "3 first-try correct of the last 4, over 2 days" right for ages 5–8? | Literature (R1) and published practice | #12, #13 |
| R5 | **Session length** (first answer: about 10–15 minutes, i.e. 2–3 levels): how many rounds hold attention for a 5-year-old vs an 8-year-old? | Literature (R1) and observation during testing | Rounds per level, #33 |
| R6 | **Group mode needs**: what does teacher-led use need that individual play doesn't (choral answers, pacing, pause)? | Talk to teachers; observe a group session | #22 |
| R7 | **Sight-word list**: Fry vs Dolch vs a list from public word-frequency data, for learning value and licensing | Desk research | #15, #25, FUTURE.md |
| R8 | **Evaluation plan**: how we'll know Word Path helps. A short pre/post check of letter sounds and decoding (ideally with a comparison group) before claiming impact; engagement alone isn't evidence | Design the measures; pilot with a small group | Claims, product decisions |
| R9 | **Reward design**: expected rewards for completion can undermine motivation; informational praise helps. Review stickers and praise wording | Literature (done in R1) plus observation | Praise lines, stickers |

## Ongoing

- **Try it with children.** Watch a few children play; note where they get stuck or guess (TESTING.md, "With a child"). Results should re-rank this list.
