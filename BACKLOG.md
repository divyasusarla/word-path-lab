# Backlog

Ideas and planned work, roughly in priority order within each section. Move items to CHANGELOG.md when they ship.
Size: S = under an hour, M = a session, L = several sessions.

## Next up

- [ ] **iPhone works well** (M). Sound plays reliably (Safari audio unlocking, interruptions, switching apps); layout fits a phone: map, play screens, header, button and text sizes. Makes the iPhone a quick test device.

## Learning design

The biggest gaps between what the game does and how children learn to read.

- [ ] **Distractors that force full blending** (S). In Blend it and Read it, the wrong pictures usually start with a different sound (cat / dog / map), so a child can pick the right one from the first sound alone. Choose distractors that share the first sound or rhyme (cat / cap / can; cat / hat / bat), so every sound matters.
- [ ] **Mastery tracking** (M). Record each word and sound: first-try right or not, per attempt. Mastered = 3 first-try correct in the last 4, across at least 2 days. This underpins the items below.
- [ ] **Don't let guessing finish a level** (S, after mastery). Today a child can tap every option until the right one pops, and still earn the sticker. Count first-try answers; after two wrong tries, model the answer (highlight it and say it) rather than letting elimination win.
- [ ] **Cumulative review** (M). Each level only practises its own items. Mix earlier sounds and words back into later levels, weighted towards ones not yet mastered (spaced review).
- [ ] **Sight words: full coverage per level** (M). A level holds 25–50 words but plays 8 rounds, so most words are never seen. Rotate through the whole list across plays (or split into smaller levels), using mastery to bring back missed words.
- [ ] **Heart words** (M). Many high-frequency words are decodable ("and", "it", "can"); teach those as decoding once their sounds are taught, and only drill the truly irregular part ("said", "was", "the").
- [ ] **Segmenting levels** (M). The reverse of blending: hear "cat", tap the three sounds in order. A core phonological awareness skill the game doesn't cover yet.
- [ ] **Spelling (encoding) levels** (M). Build the word from letter tiles after hearing it. Spelling strongly reinforces reading.
- [ ] **More phonological awareness** (M). Syllable clapping and first/last sound matching, in the earliest stage, before or alongside letters.
- [ ] **Picture naming** (S). Some pictures could be named differently by a child (tap → "water", cup → "drink", pan → "egg", nap → "sleep", cash → "money", king → "prince"). Say the picture's name when it's tapped and held, review the ambiguous ones, and swap where needed.
- [ ] **"Sound it out" gives the answer away** (S). In Read it, the button reads the whole word aloud. Have it say the sounds only, or unlock it after a wrong try.
- [ ] **Letter confusions** (S). Pair commonly confused letters as distractors on purpose once both are taught (b/d, p/q, m/n, short e/i).
- [ ] **Decodable sentences** (L). After words, read short sentences built only from taught sounds and heart words, then pick the matching picture. The step from words to connected text.
- [ ] **Try it with children** (S, ongoing). Watch a few children play; note where they get stuck or guess. Use TESTING.md's "With a child" checklist.

## Product (from the retro)

- [ ] **Teacher report** (M, after mastery). Behind the grown-up gate: accuracy by level, mastered and struggling words, a printable page.
- [ ] **Export / import progress** (M). A file or code to move a child to another device, or collect a class's results.
- [ ] **Grown-up gate on Settings** (S). Hold a button for 3 seconds, or answer a simple sum.
- [ ] **Child profiles** (M). Name and avatar; more than one child per device.
- [ ] **Drag to sort** (S). Dragging pictures into bins as well as tapping.
- [ ] **Adaptive difficulty** (L). Adjust rounds, distractors and review based on mastery.

## Audio (parallel track)

- [ ] **Re-record s, th (thin), f** (S, you). s has background rumble; th (thin) is mostly breath and is now used in stage 5. Optional: sh, ng, th (this) held longer.
- [ ] **Rumble filter on import** (S). Remove very low-pitched noise from every clip; stronger for voiceless sounds.
- [ ] **One voice for everything** (M–L). Replace the browser voice with pre-made audio files for prompts and words: option C (cloned voice) or D (standard AI voice). Fixes level 2's clipped words and makes every device sound the same.
- [ ] **Interim: prefer on-device voices** (S). Avoid the online Google voice that clips short words, and say the word in the same utterance as the prompt.

## Testing and engineering

- [ ] **Run the checks automatically on every push** (M). Headless Chrome in GitHub Actions runs `tests/`; publishing only happens if every check passes.
- [ ] **Unit tests for game logic and content** (M). Move pure logic (building rounds, distractors, unlocking, mastery) out of `app.js` into a module and test it directly, including checks that `coverage()` catches broken content.
- [ ] **Tests for the audio tools** (S). The recorder's processing and `tools/import_audio.py` (clicks, trimming, volume) with synthetic recordings.
- [ ] **Progress survives content changes** (S). Store progress by level id rather than position, so inserting a level doesn't shift saved progress.
- [ ] **Accessibility pass** (M). Screen-reader labels, colour contrast, captions for spoken prompts (helps children with hearing loss and quiet classrooms).

## Done

See CHANGELOG.md.
