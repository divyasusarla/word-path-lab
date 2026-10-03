# Recording the sounds, words and lines

The recorder has everything the game says, in batches:

| Batch | Clips | What's in it |
|---|---|---|
| Letter sounds and names | 69 | 43 speech sounds and the 26 letter names (done; re-records in backlog #9) |
| Stage 1 to Stage 7 | 60–100 each, 534 in all | Every word and line first needed in that stage: instructions and praise, level names and sticker lines, picture words, sight words |

Do one batch at a time, in any order (Stage 1 first is most useful). Each batch takes about 15–25 minutes. The game uses each recording as soon as it's imported and the device voice for anything missing, so a half-recorded game works fine.

**Words and lines are different from letter sounds:**

- **Words:** say each one once, clearly and a little slowly, as if naming a picture for a child. Flat and friendly, not like a question.
- **Lines with "…"** ("Find the letter that says …"): a word or sound follows. Leave it out; the game adds it after a short pause. Keep your voice up at the end, as if you're about to say it.
- **Lines without "…"** ("Try again.", "You did it!"): say the whole line, warmly.
- **Short sight words** ("a", "I", "the"): the way you'd say them in a sentence ("uh", not "ay"), unless you'd rather teach them differently.

If a line is reworded later, its old recording isn't used any more (the game uses the device voice until you re-record it), so you'll never hear a mismatched line. Claude will mention reworded lines in the pull request.

The rest of this guide was written for the letter sounds; the steps are the same for every batch.

## 1. Set up (5 minutes)

- **Where:** a quiet room with soft things around (curtains, a sofa, a rug) to cut echo. Close the windows and turn off fans.
- **Device:** your MacBook Air, in **Chrome**. The built-in microphone is fine; a headset microphone is better if you have one.
- **Position:** sit about a hand's width from the laptop. Speak at a normal volume, not quietly. Keep the same position for the whole session so every clip sounds alike.
- **Warm up:** say a few sounds out loud first. Optional: watch a short "pure phonics sounds" video so the sounds are fresh in your ear.

## 2. Open the recorder

**https://divyasusarla.github.io/word-path-lab/tools/record.html**

Press **Start recording** and choose **Allow** when Chrome asks to use the microphone. Pick a batch from the row of buttons at the top; each shows how many are done. Next and back stay inside the batch.

If the level bar doesn't move when you speak: open System Settings → Privacy & Security → Microphone, make sure **Google Chrome** is switched on, then reload the page.

## 3. Record (about 45 minutes)

For each sound:

1. Read the instruction on the card (for example, *"Like a snake: ssss. Not 'es'."*).
2. Press **Space** (or the Record button), say the sound, then press **Space** again to stop.
3. It plays back straight away. If it isn't right, just record it again; the new take replaces the old one.
4. Press **→** for the next sound.

The page trims the silence and evens out the volume for you. It shows a yellow note if a take looks off:

- *"Try holding the sound longer"*: held sounds (m, s, f…) should last about two seconds.
- *"Keep it short and crisp"*: quick sounds (b, d, t…) are usually too long because of an "uh" at the end. Clip it off.
- *"Too loud"*: move back from the laptop a little.

Done sounds turn green in the list on the left; sounds with a note turn yellow. Click any sound in the list to go back to it.

**Getting the sounds right** (the most common slips):

- **No "uh":** say *b*, not "buh"; *t*, not "tuh". Quick sounds should be almost silent at the end.
- **Hold the held ones:** *mmmm*, *ssss*, *ffff*, for about two seconds, steady.
- **No vowel in front:** *llll*, not "el"; *ssss*, not "es"; *rrrr*, not "er".
- ***t* and *p* have no voice:** they're almost a whisper, a puff of air.
- **Two *th*s:** *thin* has no voice (just air); *this* buzzes.

**Taking a break is fine.** Recordings are kept in Chrome as you go. Come back to the same page in the same browser and carry on. Don't clear Chrome's browsing data until you've downloaded.

## 4. Download (2 minutes)

At the end of each batch, press **Download all** (it includes every batch so far; re-importing ones already in the game is harmless). A file called `word-path-audio-<date>.zip` lands in your **Downloads** folder.

Then tell Claude: *"The recordings are in Downloads."*

## 5. What Claude does next

- Runs `python3 tools/import_audio.py ~/Downloads/word-path-audio-<date>.zip`, which unpacks the clips into `audio/` and updates `audio/manifest.json`
- Flags any clips that look too short, too long or empty
- Runs the automatic checks (`tests/`) and confirms every level now uses your recordings (🎙 in the test-mode captions)
- Pushes to the lab site after you've checked it

## 6. Listen in the game (15 minutes)

On the lab site in Chrome, then on your iPad and iPhone:

- Play levels 1 (letter sounds), 3 (first sounds), 4 (blend it) and 7 (sh or ch), which use the most sounds.
- In test mode (`?test`), the captions show 🎙 for a recording and 🤖 for the browser voice.
- If a sound seems off, re-record just that one in the recorder (it's still there), download again, and tell Claude.

## Sound list

| Group | Sounds |
|---|---|
| Short vowels | a (apple), e (egg), i (itch), o (octopus), u (up) |
| Held sounds | m, s, f, n, l, r, v, z |
| Quick sounds | b, c/k, d, g, h, j, p, t, w, y |
| Letter pairs | qu, x, sh, ch, th (thin), th (this), ng |
| Long vowels | a (cake), e (feet), i (bike), o (boat), u (cute) |
| Vowel patterns | oo (moon), oo (book), ow (cow), oi (coin), ar (car), or (fork), er (her), aw (saw) |
| Letter names | A to Z |

The full list, with the instruction for each, is in `sounds.js`.
