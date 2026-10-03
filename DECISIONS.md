# Decisions

Why Word Path is built the way it is. Each entry: the decision, why, what else was considered, and when to revisit it. Newest at the bottom; add to it whenever a choice would otherwise have to be reconstructed later.

### 1. A separate lab repo, leaving the class version untouched (2026-10-02)
- **Decision:** develop in `divyasusarla/word-path-lab` (its own site); never change `divyasusarla/word-path`, which a class uses.
- **Why:** the class link must stay stable; a separate repo makes accidental changes impossible.
- **Considered:** a branch or folder in the same repo (one wrong push away from the class link).
- **Revisit:** when the lab version is ready to replace the class version.

### 2. A static site on GitHub Pages, with no server (2026-10-02)
- **Decision:** the game is plain files that run entirely in the browser; progress is stored on the device.
- **Why:** free, no maintenance, nothing to secure, and no children's data leaves the device (see FUTURE.md on COPPA/FERPA).
- **Considered:** a backend (Firebase, Supabase, AWS) for accounts and dashboards.
- **Revisit:** if accounts, syncing between devices or class dashboards become necessary.

### 3. Preact + htm without a build step (2026-10-02)
- **Decision:** the screens use Preact (a 4 KB React-compatible library) with htm templates, loaded directly by the browser.
- **Why:** nothing to install or compile; edit and reload; ported cleanly from the Claude Design file, which used the same model.
- **Considered:** React + Vite + TypeScript (type checking, larger ecosystem, but a toolchain to maintain); plain JavaScript (more code for the same screens).
- **Revisit:** before the teacher report or any app-store step, or when `app.js` becomes hard to work in (see FUTURE.md, "Build step and TypeScript").

### 4. Every third-party file kept in the repo (2026-10-02)
- **Decision:** Preact, fonts, icons and pictures live in `vendor/`; nothing loads from outside servers.
- **Why:** school networks often block CDNs; it also keeps the game working offline-ish and avoids third-party tracking.
- **Revisit:** only if the repo size becomes a problem.

### 5. All content in `content.js`, guarded by a coverage check (2026-10-02)
- **Decision:** the teaching order, words, pictures and stickers are data in one file; `coverage()` rejects untaught sounds, missing pictures, letters never taught, duplicate ids and more.
- **Why:** content can change without touching game code, and mistakes are caught automatically (unit tests prove each rule fires).

### 6. Noto Emoji for pictures (2026-10-02)
- **Decision:** pictures are Google's Noto Emoji (Apache 2.0), vendored.
- **Why:** about 3,700 friendly, consistent pictures covering almost every early-reading word; free to use.
- **Considered:** OpenMoji (needs on-screen credit), commissioned art (cost), line icons (too few words).
- **Revisit:** if picture-naming research (R2) finds too many ambiguous pictures.

### 7. Human recordings for speech sounds; browser voice for everything else, for now (2026-10-02)
- **Decision:** the 43 speech sounds and 26 letter names are human recordings; prompts and words use the device's voice.
- **Why:** browser voices can't produce isolated sounds ("sss" became "s, s, s"); words and sentences they handle acceptably.
- **Considered:** AI voices for everything (poor at isolated sounds); recording every word (doesn't scale).
- **Revisit:** backlog #27, one voice for everything (cloned or standard AI voice), when the aesthetic upgrade is prioritised.

### 8. Teaching order modelled on public sources; no commercial programme materials (2026-10-02)
- **Decision:** the sequence follows the UK *Letters and Sounds* (2007) phases and published research; word lists and activities are our own.
- **Why:** research-grounded and free of copyright risk.
- **Revisit:** R3 (alignment with programmes schools use, e.g. UFLI).

### 9. Pull requests, automatic checks and branch protection (2026-10-03)
- **Decision:** every change goes through a pull request; GitHub Actions runs unit tests and browser checks; the site publishes only if they pass; `main` is protected (pull requests required, checks must pass, no force-push or deletion, admins included).
- **Why:** nothing broken reaches the live site, and work on `main` can't be lost. (It already caught a flaky check on 2026-10-03 and held back publishing.)

### 10. Game rules in `engine.js`, separate from screens (2026-10-03)
- **Decision:** rounds, wrong options, unlocking, speech, mastery, review and progress are plain functions in `engine.js`; `app.js` only draws and plays audio.
- **Why:** the rules can be unit-tested directly and reasoned about on their own.

### 11. Progress saved by level id, mastery by item (2026-10-03)
- **Decision:** finished levels are saved as ids (`s2-blend`); first-try attempts are saved per word or sound (`blend:cat`).
- **Why:** adding or reordering levels (for example the K / grade 1 / grade 2 bands) keeps a child's progress; mastery is per item, which the research supports.

### 12. Mastery = 3 first-try correct of the last 4, across 2 days (2026-10-03)
- **Decision:** a placeholder rule in `MASTERY_RULE`, one setting.
- **Why:** per-item criteria with about 3 correct responses are efficient and retained (Kim et al. 2023); requiring two days adds the spacing benefit.
- **Revisit:** with real usage data (R4, R8).

### 13. Never play a recording into stopped sound (2026-10-03)
- **Decision:** before each recording, check the audio engine is running; otherwise the browser voice says that sound.
- **Why:** iOS Safari starts and interrupts audio unpredictably; silence is worse than the browser voice for a child.

### 14. File versions stamped at publish time (2026-10-03)
- **Decision:** first-party files are referenced with `?v=dev`, replaced by the commit id when publishing.
- **Why:** GitHub Pages lets browsers cache files for up to 10 minutes; without stamping, new code could run with old styles.

### 15. Catherine (Australian English) as the default voice (2026-10-03)
- **Decision:** when no voice is chosen in Settings, use Catherine (en-AU, built into Apple devices) if the device has it, then built-in US English voices.
- **Why:** in testing with a child she was the clearest of the voices tried. The letter-sound recordings are US English, so the accent differs between recorded sounds and spoken words; that was judged acceptable.
- **Limits:** a website can't install a voice, so Chromebooks and Windows fall back to their own voices. The same voice on every device needs pre-made audio (#27).
- **Revisit:** when #27 ships, or when the game moves to a US-English-only voice.

### 16. Short levels: every item once, then bonus rounds from this play's misses (2026-10-03)
- **Decision:** levels keep 8 rounds. When a level has fewer items, each comes up once, then the rest are labelled bonus rounds and bring back what was missed in this play (else still being learned), never the item just played.
- **Why:** random repeats made children think a letter had been skipped. Fewer rounds would feel too short. Bringing back a missed item soon is the cheapest form of the spaced, corrective practice in LEARNING_DESIGN.md.
- **Revisit:** with #14 (bands), which may change level sizes.

### 17. Record words and lines ourselves, keyed by their text (2026-10-03)
- **Decision:** record every word (word-cat) and instruction line (say-try-again) in the same voice as the letter sounds. Lines never contain a word; words are separate clips said after a short pause. A line's clip is named after its exact text.
- **Why:** the first child test showed device voices are hard to understand on short words. Keeping words out of lines keeps the script to about 37 lines plus one clip per word (534 in all). Naming a clip after its text means a reworded line can never play a stale recording; the device voice covers it until it's re-recorded.
- **Limits:** splicing a line and a word sounds slightly less natural than one recording. Decodable sentences (#32) can't be spliced that way, which would push past 1,000 clips.
- **Revisit:** at #32, or when designing the bands (#14): count new words per band and consider a generated voice.

### 18. Grown-up gate: a sum, not a long press (2026-10-03)
- **Decision:** Settings opens after answering a single digit times a teen (3 × 12 to 9 × 19) on an on-screen number pad. A wrong answer gives a new sum. Passing it lasts until the page reloads.
- **Why:** children find long-press gates by accident or by copying grown-ups. Ages 5–8 rarely know two-digit products, while adults answer in seconds. A number pad avoids the device keyboard covering the screen. Not reading-based, since 7–8-year-olds can read.
- **Revisit:** if testers find it too hard or children get past it (checklist item), or if the game goes into an app store with its own gate rules.

### 19. The teacher report is a screen to screenshot, built only from first tries (2026-10-03)
- **Decision:** Settings → Progress report shows totals, "needs practice" items and played levels on one screen, laid out for a screenshot rather than printing. Needs practice = not yet known, at least 2 recent first tries, under half of them right (`PRACTICE_RULE`).
- **Why:** teachers share screenshots, not printouts. First tries are the honest measure (later taps are guided by "Try again" and shown answers). Requiring 2 tries avoids flagging a word from one slip.
- **Revisit:** with child profiles (#28) and export (#20), when a class view makes sense; and the thresholds once there's real usage (R4, R8).

### 20. Hint ladder: narrow, hint, then show (2026-10-03)
- **Decision:** after a first miss, take one wrong answer away (only if two or more choices would remain) and give a game-specific hint; after the second miss, show the answer. Three first-try misses in a row make the next rounds easier (fewer choices) until one is right first time. Hints never give the answer away: Letter sounds shows the keyword *picture*, not its word.
- **Why:** support that starts small and grows is standard practice in early-reading help, and it keeps the child doing the thinking. Easier rounds stop a struggling child from a long run of failures without moving them off the level.
- **Revisit:** after testing (are hints noticed? does easing feel like a reward for missing?), and with adaptive difficulty (#33).

### 21. Heart words: our own markings, Word pop by sounds taught (2026-10-03)
- **Decision:** every sight word is written with its tricky letters in brackets (`HEART_MARKS` in content.js): irregular parts (s[ai]d) and patterns the game doesn't teach yet (h[igh]). A word goes in the Word pop level of the stage that teaches its regular sounds, most common first, and no more than one level before its frequency band. Tricky letters are underlined with a ♥ badge.
- **Why:** high-frequency words are learned by connecting their letters to their sounds (Ehri 2014), so the regular parts should be readable when the word is taught and only the tricky part needs remembering. The markings are our own analysis, not a programme's lists.
- **Early words:** strict alignment would put very common words late ("the" in Word pop 5, because of "th"). So the 14 most common (`EARLY_SIGHT`: the, you, was, said, he, we, my in Word pop 1; she, they, are, for, have, what, be in Word pop 2) come early, and any letter whose sound isn't taught yet shows as tricky until it is ("the" is all tricky in Word pop 1, th[e] from stage 5).
- **Revisit:** after review of `tools/hearts.html` and testing.
