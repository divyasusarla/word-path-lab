# Testing Word Path

There are three layers. Run the first two before every push. Run the third before using the game with children, and whenever the voice or layout changes.

## 1. Automatic checks (about 30 seconds)

Open **`tests/`** in a browser and press **Run all checks**:

- Local: http://127.0.0.1:8765/tests/ (start the local server first with `python3 -m http.server 8765`)
- Live: https://divyasusarla.github.io/word-path-lab/tests/

Add `?run` to the address to start the checks straight away. They cover:

- **Content:** every letter is taught (sound and name), every word has a picture, and every word in a blending or reading level only uses sounds already taught.
- **Map:** each stage's map, the arrows between stages, the right level open, moving to the next stage when one is finished, the "Next up" banner, the "Hear it" button, and the finished state.
- **Sticker book:** all locked, all earned, and every sticker's name and picture.
- **Settings:** every control is present, Test voice speaks, the speed label changes, and nothing is saved.
- **Every level, 1 to 38:** starts and announces itself, gives feedback on a wrong answer, accepts the right answer, moves through every round, and ends on the level complete screen with the right sticker.
- **Level complete:** Next level starts the following level.
- **Pictures:** every icon on every screen exists. A typo in an icon name fails the check.
- **Recordings:** every speech sound a level uses has a slot in the recording list, each one plays from its recording if there is one (otherwise the browser voice), and the recorder page loads with all 69 sounds.

The checks can't hear the voice. They check *what* the game says (the words and their order), not how it sounds.

## 2. Test mode (look and click around)

Add **`?test`** to the address. Every level is open, nothing is saved, and a **TEST MODE** panel appears in the bottom-left corner. Click the panel's label to fold it away. The panel lets you:

- jump to any level, or answer the current round right or wrong
- open any screen: Map, Stickers, Settings, Level complete
- set how many levels are finished, stage by stage, to see the map and sticker book at each point
- see the content check: green when every letter and sound is covered in order
- see what the game is saying, as captions. Speech sounds show 🎙 when they come from a recording and 🤖 when the browser voice is filling in.

You can also set things up straight from the address. Combine options with `&`:

| Add to the address | What it does |
|---|---|
| `?test` | Test mode, starting on the map |
| `?test&level=4` | Go straight into level 4 (any number from 1 to 38) |
| `?test&screen=stickers` | Open a screen: `map`, `play`, `done`, `stickers` or `settings` |
| `?test&screen=done&level=3` | The level complete screen for level 3 |
| `?test&done=5` | Pretend the first 5 levels are finished (5 = all of stage 1) |
| `?test&rounds=2` | 2 rounds per level, for quicker play-throughs |
| `?test&think=0` | No pause after a right answer |
| `?test&mute` | No voice; captions still show what would be said |

For example, `https://divyasusarla.github.io/word-path-lab/?test&level=7&rounds=2`

To leave test mode, click **Exit test mode** or remove `?test` from the address.

## 3. Hands-on checklist (on the device children will use)

Use the normal address, without `?test`, with sound on. Test on every device you plan to use:

| Device | Browser | Notes |
|---|---|---|
| MacBook Air | Chrome | Your main test device |
| Chromebook (classroom) | Chrome | What children will most likely use |
| iPad | Safari | Tap once anywhere before sound will play (a Safari rule); the game handles this on your first tap |
| iPhone | Safari | Turn the silent switch **off**: it mutes the game. The layout is built for bigger screens, so expect crowding on the map |

Each device keeps its own progress, and test mode works on all of them.

**Voice and sounds**
- [ ] In Settings, pick a voice. On a Chromebook, try "Google US English". Press Test voice.
- [ ] In test mode, captions show 🎙 (recording) for letter sounds once recordings are added, not 🤖.
- [ ] Letter sounds (level 1): m, s and n are held ("mmm"); t and p are short and voiceless; vowels are clear.
- [ ] Blend it (level 4): sounds are separate, with a clear gap, then "What word is that?"
- [ ] Sort levels (3 and 7): the question ends naturally, without the voice saying "question mark".
- [ ] Sight words are said slowly and clearly enough to pick out.
- [ ] Volume and Talking speed change the voice right away, and stay changed after reloading the page.
- [ ] Tapping quickly or pressing "Hear again" repeatedly never makes two voices talk at once.

**Screens**
- [ ] Map: locked levels can't be started; the current level is bigger with a play badge; finished levels show a tick.
- [ ] Finishing a level gives its sticker, which then appears in the sticker book, and the next level opens on the map.
- [ ] Reloading the page keeps progress. Reset progress (in Settings) clears it.
- [ ] Progress here doesn't change the class version at /word-path/, and the reverse.

**Pictures and layout**
- [ ] Every picture is easy for a child to recognise. Note any that aren't.
- [ ] It looks right full screen, in a half-width window, and on a tablet. Note anything that overlaps or gets cut off.
- [ ] Every button can be tapped easily with a finger.

**With a child**
- [ ] Can they start a level with no help?
- [ ] Do they understand what each level is asking?
- [ ] Where do they get stuck or lose interest?
