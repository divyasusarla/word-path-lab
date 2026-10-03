// Word Path game rules, kept free of screen code so they can be unit-tested (tests/unit/).
// app.js draws the screens and plays the audio; everything it decides comes from here.
import { LEVELS, STAGES, GRAPHEMES, NAME_SAY, PICS, PICTURE_FLAGS, WORDS, FRY, phonemes, soundSimilarity, confusedWith, heartPartsAt, wordStage, soundStage } from './content.js?v=dev';

// Every level from content.js, plus the screen kind (pop / match / sort) and mode the game uses
export const LV = LEVELS.map(l => ({ ...l,
  kind: { sounds:'pop', names:'pop', sight:'pop', sort:'sort', blend:'match', read:'match', rhyme:'match' }[l.type],
  mode: { sounds:'sound', names:'name', sight:'word', blend:'blend', read:'read', rhyme:'rhyme' }[l.type] }));

// ---- Word pool breadth (#36) ---------------------------------------------------------------------
// Word pop also practises the stage's new decodable words (sat, tip, mop…): the child hears the word and pops it
// from near misses (pin / pen / pan), so it has to be read, not guessed. extra: the words first readable this stage.
for (const L of LV) if (L.type === 'sight') L.extra = Object.keys(WORDS).filter(w => wordStage(w) === L.stage && !FRY.includes(w));
// Everything a level practises: its pool (plus the extra words in Word pop), or its words
export const ownItems = L => L.kind === 'pop' ? [...L.pool, ...(L.extra || [])] : L.words;
// Words a child can read by a stage (all of WORDS, with or without pictures), for Word pop's near misses
const readableBy = stage => Object.keys(WORDS).filter(w => { const s = wordStage(w); return s >= 0 && s <= stage; });
// First sounds can change its letter pair after the first play (rotate): any two letters taught by the stage that
// make different sounds and have at least 4 clear pictures each. SORT_PICS: clear pictures by first sound.
const firstSoundOf = w => WORDS[w] ? phonemes(w)[0] : ['sh', 'ch', 'th', 'qu'].find(g => w.startsWith(g)) || w[0];
export const SORT_PICS = Object.keys(PICS).filter(w => PICTURE_FLAGS[w]?.[0] !== 'high')
  .reduce((m, w) => { (m[firstSoundOf(w)] ||= []).push(w); return m; }, {});
export const SORT_MIN = 4;
// The picture beside a bin's letter: the sound's keyword if it has a picture (s → sun), else the letter's first
// clear picture. It's never also one of the pictures to sort.
export const binPicture = (g, pile = []) => PICS[GRAPHEMES[g]?.ex] ? GRAPHEMES[g].ex : (SORT_PICS[g] || []).find(w => !pile.includes(w)) || null;
export const sortLetters = stage => Object.keys(SORT_PICS).filter(g => g.length === 1 && GRAPHEMES[g] && (soundStage(g) ?? 99) <= stage
  && SORT_PICS[g].filter(w => w !== binPicture(g)).length >= SORT_MIN);
// The pair for this play: the level's own pair until all its pictures have been tried, then a new pair each play
export function sortPair(L, mastery = {}, rng = Math.random) {
  if (!L.rotate || L.items.some(x => !(mastery[`sort:${x.w}`] || []).length)) return null;
  const letters = shuffle(sortLetters(L.stage), rng), a = letters[0];
  const b = letters.find(g => g !== a && GRAPHEMES[g].clip !== GRAPHEMES[a].clip);
  return a && b ? [a, b] : null;
}
// The two bins in play for a sorting round (rounds carry their own pair when it rotates)
export const binsOf = (L, r) => (r && r.bins) || L.bins;

// ---- Layout and map geometry ---------------------------------------------------------------------
// Which layout fits the screen (see styles.css and the "Word Path layouts" design canvas)
export const layoutFor = (w, h) => w < 600 && h >= w ? 'phone' : h < 500 && w > h ? 'phone-landscape' : h > w && w < 1000 ? 'tablet-portrait' : 'wide';
// Map stop positions for a stage with n levels (percent of the map's width and height).
// Across in landscape; down in portrait, where every label sits to the right of its stop.
export const stagePos = (n, down, phone) => Array.from({ length: n }, (_, i) => {
  const t = n === 1 ? 0.5 : i / (n - 1);
  return down ? [i % 2 ? (phone ? 42 : 40) : (phone ? 22 : 20), 9 + t * 82] : [12 + t * 76, i % 2 ? 66 : 34];
});
// Smooth path through the stops, in a 1000 x 1000 drawing space stretched to fit the map
export const stagePath = (pts, down) => {
  const P = pts.map(([x, y]) => [x * 10, y * 10]);
  if (P.length < 2) return '';
  let d = `M${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < P.length - 1; i++) {
    const [x0, y0] = P[i], [x1, y1] = P[i + 1], mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    d += down ? ` C${x0} ${my} ${x1} ${my} ${x1} ${y1}` : ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`;
  }
  return d;
};

// ---- Speech --------------------------------------------------------------------------------------
// What the recording / browser voice says for a letter sound or a sound in a word, and for a letter name
export const gsnd = gr => ({ t: GRAPHEMES[gr].say, rate: GRAPHEMES[gr].rate, clip: GRAPHEMES[gr].clip });
export const nsnd = l => ({ t: NAME_SAY[l], rate: 0.8, clip: `name-${l}` });
export const showG = gr => gr;  // how a sound is written on a tile (a_e stays a_e)
// Recordings for words and lines (see script.js and RECORDING.md). A word is its own clip (word-cat); a line's
// clip is named after its exact text (say-try-again), so rewording a line never plays an out-of-date recording:
// the browser voice says the new wording until it's re-recorded. Plain strings in a speech list are lines.
export const slug = t => t.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
export const sayId = t => `say-${slug(t)}`;
export const wordId = w => `word-${slug(w)}`;
export const word = (w, rate = 0.8) => ({ t: w, rate, clip: wordId(w) });
export const levelLine = L => `Level ${L.n}. ${L.title}.`;

// The spoken question for a round. Parts: strings, {t, rate, clip}, or numbers (pause in ms).
// n: the round number (0-based). Sorting questions shorten after the first two rounds, once the child knows the game.
export const FULL_ROUNDS = 2;
// Sight words are said slowly, on their own, twice: the device voice can be hard to make out on short words
const slowWord = w => word(w, 0.6);
export function prompt(L, r, first, n = 0) {
  const pre = first ? [levelLine(L), 700] : [];
  if (L.kind === 'pop') {
    if (L.mode === 'sound') { const gr = GRAPHEMES[r.target]; return [...pre, r.target.length > 1 ? 'Find the letters that say' : 'Find the letter that says', 500, gsnd(r.target), 500, 'like in', word(gr.ex)]; }
    if (L.mode === 'name') return [...pre, 'Find the letter', 400, nsnd(r.target)];
    return [...pre, 'Pop the word.', 400, slowWord(r.target), 700, slowWord(r.target)];
  }
  if (L.kind === 'match') {
    if (L.mode === 'blend') return [...pre, 'Listen.', 500, ...phonemes(r.target.w).flatMap(p => [gsnd(p), 450]), 400, 'What word is that?'];
    if (L.mode === 'rhyme') return [...pre, 'Which picture rhymes with', 400, word(r.target.cue, 0.7)];
    return [...pre, 'Read the word. Then tap its picture.'];
  }
  const [A, B] = binsOf(L, r);
  if (n >= FULL_ROUNDS && !first) return [word(r.w, 0.7), 600, gsnd(A), 300, 'or', 300, gsnd(B)];
  return [...pre, word(r.w, 0.7), 700, L.ask === 'has' ? 'Does it have' : 'Does it start with', 300, gsnd(A), 400, 'or', 300, gsnd(B)];
}

// ---- Showing the word after the answer (#34) ---------------------------------------------------
// How a word's letters line up with its sounds: cake → c (c) · a (a_e) · k (k) · e (a_e). k is the sound's index.
// WORDS lists sounds, not spellings, so a few sounds can be spelled another way (rose: z spelled s). null if it
// doesn't line up (the word is then shown without highlighting).
const SPELLED = { z: ['s'], k: ['c', 'ck'], c: ['k', 'ck'] };
export function spell(w) {
  const ph = phonemes(w); if (!ph.length) return null;
  const segs = []; let i = 0, split = null;
  for (let k = 0; k < ph.length; k++) {
    const g = ph[k];
    if (g.includes('_')) { if (w[i] !== g[0]) return null; segs.push({ t: g[0], g, k }); i++; split = { g, k }; continue; }
    const s = [g, ...(SPELLED[g] || [])].find(o => w.startsWith(o, i));
    if (!s) return null;
    segs.push({ t: s, g, k }); i += s.length;
  }
  if (split && w.slice(i) === 'e') { segs.push({ t: 'e', g: split.g, k: split.k }); i++; }
  return i === w.length ? segs : null;
}
// A word as letter groups, with the ones to light up. on(seg) decides; words without a spelling line-up fall back
// to matching the sound's letters in the text (first letters for "starts with", anywhere for "has")
function marked(w, g, where) {
  const sp = spell(w);
  if (sp) return sp.map(x => ({ t: x.t, k: x.k, on: g != null && x.g === g && (where === 'any' || x.k === 0) }));
  if (g && g.includes('_')) {  // magic e: the vowel, a consonant or two, and the final e (wh-a-l-e)
    const m = w.match(new RegExp(`^(.*)(${g[0]})([^aeiou]+)(e)$`));
    if (m) return [{ t: m[1], on: false }, { t: m[2], on: true }, { t: m[3], on: false }, { t: m[4], on: true }].filter(x => x.t).map(x => ({ ...x, k: null }));
  }
  const at = g && !g.includes('_') ? (where === 'any' ? w.indexOf(g) : w.startsWith(g) ? 0 : -1) : -1;
  return at < 0 ? [{ t: w, k: null, on: false }] : [{ t: w.slice(0, at), k: null, on: false }, { t: g, k: null, on: true }, { t: w.slice(at + g.length), k: null, on: false }].filter(x => x.t);
}
// What to show once a round is answered right: { pic, words: [[{t, on, k}]] }, or null for nothing extra
export function revealFor(L, r) {
  if (L.kind === 'sort') return { pic: null, words: [marked(r.w, binsOf(L, r)[r.bin], L.ask === 'has' ? 'any' : 'start')] };
  if (L.kind === 'pop') {
    // sight words: the tricky letters lit, with a heart (#25)
    if (L.mode === 'word') return { pic: null, words: [heartPartsAt(r.target, L.stage).map(p => ({ t: p.t, on: p.tricky, k: null, heart: p.tricky }))] };
    if (L.mode !== 'sound') return null;
    const ex = GRAPHEMES[r.target].ex;
    return { pic: PICS[ex] ? ex : null, words: [marked(ex, r.target, 'any')] };
  }
  if (L.mode === 'rhyme') {
    const a = r.target.cue, b = r.target.w;
    let n = 0; while (n < Math.min(a.length, b.length) && a[a.length - 1 - n] === b[b.length - 1 - n]) n++;
    const split = w => [{ t: w.slice(0, w.length - n), on: false, k: null }, { t: w.slice(w.length - n), on: true, k: null }].filter(x => x.t);
    return { pic: null, words: [split(a), split(b)] };
  }
  return { pic: null, words: [marked(r.target.w, null)] };  // blend / read: letters light up with the sounds (cue)
}

// "Sound it out": each sound in the word, slowly, without the word itself (the child does the blending)
export const soundOutParts = w => phonemes(w).flatMap(p => [gsnd(p), 600]).slice(0, -1);

// ---- Rounds --------------------------------------------------------------------------------------
// rng: a function returning [0, 1), so tests can make shuffles repeatable
export function shuffle(a, rng = Math.random) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
// n items from the pool, using every item before repeating any
export function cycle(pool, n, rng = Math.random) {
  let o = [];
  while (o.length < n) o = o.concat(shuffle(pool, rng));
  return o.slice(0, n);
}
// Every word that has a picture and its sounds listed
export const PICTURE_WORDS = Object.keys(WORDS).filter(w => PICS[w]);
// Pictures that can be wrong answers: not ones a child would likely call something else (nap → "sleep"), which
// would make a sound-alike pair (map / nap) confusing. They can still be right answers.
export const OPTION_WORDS = PICTURE_WORDS.filter(w => PICTURE_FLAGS[w]?.[0] !== 'high');
// Blend it / Read it: the two wrong options that sound most like the answer (cat → cap, can), so the first sound
// alone isn't enough. They come from every picture word, not just ones the child can read yet: the child only has
// to blend or read the answer, and a bigger pool keeps the pictures varied. A little randomness varies ties.
export function nearOptions(w, stage, rng = Math.random) {
  return OPTION_WORDS.filter(x => x !== w)
    .map(x => [x, soundSimilarity(w, x) + rng() * 0.6]).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([x]) => x);
}
// ---- Choosing what a play practises (coverage and cumulative review) ------------------------------
const lastDay = (atts = []) => atts.length ? atts[atts.length - 1].day : '';
// Order items so a level works through its whole list over a few plays: never-seen items first (shuffled), then
// ones still being learned (least recently practised first), then mastered ones. Keeps one mastered item when
// there are enough rounds, so known items still come back now and then.
export function pickTargets(items, keyOf, count, mastery = {}, rng = Math.random, rule = MASTERY_RULE) {
  if (!items.length || count <= 0) return [];
  const unseen = [], learning = [], known = [];
  for (const it of shuffle(items, rng)) {
    const atts = mastery[keyOf(it)];
    (!atts || !atts.length ? unseen : isMastered(atts, rule) ? known : learning).push(it);
  }
  learning.sort((a, b) => lastDay(mastery[keyOf(a)]).localeCompare(lastDay(mastery[keyOf(b)])));
  known.sort((a, b) => lastDay(mastery[keyOf(a)]).localeCompare(lastDay(mastery[keyOf(b)])));
  const keepKnown = known.length && count >= 6 && unseen.length + learning.length >= count ? 1 : 0;
  const order = [...unseen, ...learning].slice(0, count - keepKnown).concat(known.slice(0, keepKnown));
  const rest = [...unseen, ...learning, ...known].filter(x => !order.includes(x));
  const out = order.concat(rest).slice(0, count);
  while (out.length < count) out.push(...shuffle(items, rng).slice(0, count - out.length));  // short lists repeat
  return out;
}
// Items from earlier levels of the same kind that a later level can review (letter sounds, names, sight words,
// and decodable words for Blend it / Read it). Sorting and rhyme levels don't review.
export function reviewItems(L) {
  const earlier = LV.filter(l => l.n < L.n);
  if (L.kind === 'pop') return [...new Set(earlier.filter(l => l.type === L.type).flatMap(ownItems))].filter(x => !ownItems(L).includes(x));
  if (L.mode === 'blend' || L.mode === 'read') return [...new Set(earlier.filter(l => l.mode === 'blend' || l.mode === 'read').flatMap(l => l.words))].filter(w => !L.words.includes(w));
  return [];
}
// How many of a play's rounds review earlier items: 2 of 8 when there's anything earlier to review
export const reviewCount = (L, count) => reviewItems(L).length ? Math.min(2, Math.floor(count / 4)) : 0;
// Review picks: items still being learned first (they need it most), then mastered ones not seen for longest,
// then earlier items never practised
export function pickReview(L, n, mastery = {}, rng = Math.random, rule = MASTERY_RULE) {
  const keyOf = x => L.kind === 'pop' ? `${{ sound: 'sound', name: 'name', word: 'word' }[L.mode]}:${x}` : `${L.mode}:${x}`;
  const pool = shuffle(reviewItems(L), rng), learning = [], known = [], unseen = [];
  for (const it of pool) { const a = mastery[keyOf(it)]; (!a || !a.length ? unseen : isMastered(a, rule) ? known : learning).push(it); }
  known.sort((a, b) => lastDay(mastery[keyOf(a)]).localeCompare(lastDay(mastery[keyOf(b)])));
  return [...learning, ...known, ...unseen].slice(0, n);
}

const keyFor = (L, x) => L.kind === 'pop' ? `${{ sound: 'sound', name: 'name', word: 'word' }[L.mode]}:${x}` : `${L.mode}:${x}`;
// A letter's usual mix-up (b for d), if it's been taught by this level (here or in an earlier level of the same kind)
export const mixUpFor = (L, t) => L.kind === 'pop' && L.mode !== 'word'
  ? confusedWith(t).find(x => L.pool.includes(x) || reviewItems(L).includes(x)) ?? null : null;
// One round for a target: tiles for pop levels (always including the letter's usual mix-up once it's taught),
// a picture and two near misses for blend/read
export function makeRound(L, t, flags = {}, rng = Math.random) {
  if (L.kind === 'pop' && L.mode === 'word' && !L.pool.includes(t) && WORDS[t]) {
    // a decodable word in Word pop: the other bubbles are words that sound most like it, so it has to be read
    const tiles = L.tiles || 4;
    const near = readableBy(L.stage).filter(x => x !== t).map(x => [x, soundSimilarity(t, x) + rng() * 0.6])
      .sort((a, b) => b[1] - a[1]).slice(0, tiles - 1).map(([x]) => x);
    return { target: t, ...flags, options: shuffle([t, ...near], rng).map(label => ({ label, bob: (rng() * 1.5).toFixed(2), dur: (2.6 + rng()).toFixed(2) })) };
  }
  if (L.kind === 'pop') {
    const tiles = Math.min(L.tiles || 4, L.pool.length), mix = mixUpFor(L, t);
    // never a wrong answer that makes the same sound as the right one (c / k / ck, a_e / ai)
    const same = x => L.mode === 'sound' && GRAPHEMES[x]?.clip === GRAPHEMES[t]?.clip;
    const others = shuffle(L.pool.filter(x => x !== t && x !== mix && !same(x)), rng).slice(0, tiles - 1 - (mix ? 1 : 0));
    return { target: t, ...flags,
      options: shuffle([t, ...(mix ? [mix] : []), ...others], rng)
        .map(label => ({ label, bob: (rng() * 1.5).toFixed(2), dur: (2.6 + rng()).toFixed(2) })) };
  }
  return { target: { w: t }, ...flags, options: shuffle([{ w: t }, ...nearOptions(t, L.stage, rng).map(x => ({ w: x }))], rng) };
}
const targetOf = r => r.target?.w ?? r.target;

// The rounds for one play of a level. mastery (optional) steers which items come up; review rounds are marked.
// When a level has fewer items than rounds, every item comes up once, then the rest are bonus rounds at the end.
// The app fills each bonus round as it arrives with something missed in this play (bonusTarget).
export function buildRounds(L, count, rng = Math.random, mastery = {}) {
  if (L.kind === 'sort') {  // sort: every picture once; First sounds may use a new letter pair (sortPair)
    const pair = sortPair(L, mastery, rng);
    if (!pair) return shuffle(L.items.map(x => ({ ...x, bins: L.bins })), rng);
    return shuffle(pair.flatMap((g, bin) => shuffle(SORT_PICS[g].filter(w => w !== binPicture(g)), rng).slice(0, 5).map(w => ({ w, bin, bins: pair }))), rng);
  }
  if (L.mode === 'rhyme') return cycle(L.pairs, count, rng).map(t => ({ target: t, options: shuffle([t, ...shuffle(L.pairs.filter(x => x.w !== t.w), rng).slice(0, 2)], rng) }));
  const nReview = reviewCount(L, count);
  const own = ownItems(L);
  const nOwn = Math.min(own.length, count - nReview), nBonus = count - nReview - nOwn;
  const picks = [...pickTargets(own, x => keyFor(L, x), nOwn, mastery, rng).map(t => ({ t, review: false })),
    ...pickReview(L, nReview, mastery, rng).map(t => ({ t, review: true }))];
  const rounds = shuffle(picks, rng).map(({ t, review }) => makeRound(L, t, { review }, rng));
  for (let i = 0; i < nBonus; i++) rounds.push(bonusRound(L, [], targetOf(rounds[rounds.length - 1]), mastery, rng));
  return rounds;
}
// A bonus round: something missed in this play if there is one (never the item just played), else an item still
// being learned, else any item
export function bonusTarget(L, missed, prev, mastery = {}, rng = Math.random) {
  const own = ownItems(L);
  const fromMissed = shuffle([...new Set(missed)].filter(x => x !== prev && own.includes(x)), rng);
  if (fromMissed.length) return fromMissed[0];
  const ordered = pickTargets(own, x => keyFor(L, x), own.length, mastery, rng).filter(x => x !== prev);
  return ordered[0] ?? own[0];
}
export const bonusRound = (L, missed, prev, mastery = {}, rng = Math.random) => makeRound(L, bonusTarget(L, missed, prev, mastery, rng), { bonus: true }, rng);
// Is this option the right answer for the round?
export function isRight(L, r, option) {
  if (L.kind === 'sort') return option === r.bin;
  return L.kind === 'pop' ? option.label === r.target : option.w === r.target.w;
}

// ---- Progress ------------------------------------------------------------------------------------
// done: one true/false per level, in LV order
export const unlocked = (i, done, unlockAll = false) => unlockAll || i === 0 || !!done[i - 1] || !!done[i];
export const nextLevel = done => done.findIndex(d => !d);
export const stageComplete = (stage, done) => LV.every((l, i) => l.stage !== stage || done[i]);
// The stage the map shows: the one picked, else the stage of the next level to play
export const mapStageFor = (done, picked = null) => {
  if (picked !== null) return picked;
  const next = nextLevel(done);
  return next < 0 ? STAGES.length - 1 : LV[next].stage;
};
// Saved progress is the list of finished level ids, so adding or reordering levels keeps it right
export const doneFromIds = ids => { const s = new Set(ids); return LV.map(l => s.has(l.id)); };
export const idsFromDone = done => LV.filter((l, i) => done[i]).map(l => l.id);
// Before ids, progress was saved as true/false by position (v2, the same 38 levels in the same order)
export const idsFromV2 = arr => Array.isArray(arr) ? LV.filter((l, i) => arr[i] === true).map(l => l.id) : [];

// ---- Mastery ---------------------------------------------------------------------------------------
// A word or sound is mastered when the child gets it right on the first try in `correct` of their last `of`
// attempts, on at least `days` different days. Starting point from LEARNING_DESIGN.md (R4); change it here.
export const MASTERY_RULE = { correct: 3, of: 4, days: 2 };
const KEEP_ATTEMPTS = 8;

// What one round practises, as a stable key: "sound:sh", "name:a", "word:said" (sight words),
// "blend:cat", "read:cat", "rhyme:sun", "sort:sock"
export function itemKey(L, r) {
  if (L.kind === 'sort') return `sort:${r.w}`;
  if (L.kind === 'pop') return `${{ sound: 'sound', name: 'name', word: 'word' }[L.mode]}:${r.target}`;
  return `${L.mode}:${r.target.w}`;
}
// The local calendar day, e.g. "2026-10-03"
export const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// Record one first-try answer. Returns a new store (store: { key: [{ day, ok }, …] }); keeps the last few attempts
export function recordAttempt(store, key, ok, day = today()) {
  const list = [...(store[key] || []), { day, ok: !!ok }].slice(-KEEP_ATTEMPTS);
  return { ...store, [key]: list };
}
export function isMastered(attempts = [], rule = MASTERY_RULE) {
  const recent = attempts.slice(-rule.of), right = recent.filter(a => a.ok);
  return right.length >= rule.correct && new Set(right.map(a => a.day)).size >= rule.days;
}
// Every item a level can practise, so progress can be shown as "3 of 7 words"
export function levelItems(L) {
  if (L.kind === 'sort') return L.items.map(x => `sort:${x.w}`);
  if (L.kind === 'pop') return ownItems(L).map(t => `${{ sound: 'sound', name: 'name', word: 'word' }[L.mode]}:${t}`);
  if (L.mode === 'rhyme') return L.pairs.map(p => `rhyme:${p.w}`);
  return L.words.map(w => `${L.mode}:${w}`);
}
export const masteredIn = (L, store, rule = MASTERY_RULE) => levelItems(L).filter(k => isMastered(store[k], rule));

// ---- Progress report (#19) -----------------------------------------------------------------------
// How an item key reads in the report: "sh" (letter sound), "B" (letter name), "said" (sight word)…
export const KIND_NAMES = { sound: 'letter sound', name: 'letter name', word: 'sight word', blend: 'Blend it', read: 'Read it', sort: 'sorting', rhyme: 'rhyme' };
export function itemLabel(key) {
  const i = key.indexOf(':'), kind = key.slice(0, i), x = key.slice(i + 1);
  return { kind, kindName: KIND_NAMES[kind] || kind, text: kind === 'name' ? x.toUpperCase() : x };
}
// Needs practice: not yet mastered, at least 2 recent first tries, and under half of them right. Worst first.
export const PRACTICE_RULE = { minTries: 2, below: 0.5, show: 12 };
// Everything the teacher report shows, from finished levels and the mastery store. Only levels that have been
// finished or practised are listed. "First tries right" uses the attempts kept per item (the last 8).
export function progressReport(done, store, rule = MASTERY_RULE, prule = PRACTICE_RULE) {
  const lastOf = atts => atts.reduce((m, a) => a.day > m ? a.day : m, '');
  const levels = LV.map((L, i) => {
    const keys = levelItems(L), atts = keys.flatMap(k => store[k] || []);
    return { n: L.n, stage: L.stage + 1, title: L.title, done: !!done[i], known: keys.filter(k => isMastered(store[k], rule)).length,
      total: keys.length, tries: atts.length, right: atts.filter(a => a.ok).length, last: lastOf(atts) };
  }).filter(l => l.done || l.tries);
  const keys = Object.keys(store).filter(k => (store[k] || []).length), all = keys.flatMap(k => store[k]);
  const practice = keys.filter(k => !isMastered(store[k], rule)).map(k => {
    const recent = store[k].slice(-rule.of);
    return { key: k, ...itemLabel(k), tries: recent.length, right: recent.filter(a => a.ok).length };
  }).filter(p => p.tries >= prule.minTries && p.right / p.tries < prule.below)
    .sort((a, b) => a.right / a.tries - b.right / b.tries || b.tries - a.tries || a.key.localeCompare(b.key));
  return {
    finished: done.filter(Boolean).length, levelCount: LV.length,
    known: keys.filter(k => isMastered(store[k], rule)).length, practised: keys.length,
    tries: all.length, right: all.filter(a => a.ok).length, last: lastOf(all),
    levels, practice: practice.slice(0, prule.show), morePractice: Math.max(0, practice.length - prule.show)
  };
}

// ---- Feedback ------------------------------------------------------------------------------------
// After this many misses in a round, the game shows and says the answer (a sort has only two bins, so one miss)
export const modelAfter = L => L.kind === 'sort' ? 1 : 2;
// What's said when the answer is shown; the child then taps it
export function modelParts(L, r) {
  if (L.kind === 'sort') return ['Listen.', 300, word(r.w, 0.7), 300, L.ask === 'has' ? 'has' : 'starts with', 300, gsnd(binsOf(L, r)[r.bin]), 500, 'Tap that one.'];
  if (L.kind === 'pop') {
    if (L.mode === 'sound') return ['Here it is.', 300, gsnd(r.target), 500, 'Tap it.'];
    if (L.mode === 'name') return ['Here it is.', 300, nsnd(r.target), 500, 'Tap it.'];
    return ['Here it is.', 300, slowWord(r.target), 400, 'Tap it.'];
  }
  if (L.mode === 'rhyme') return [word(r.target.cue), 200, 'rhymes with', 200, word(r.target.w), 400, 'Tap it.'];
  return ['Here it is.', 300, word(r.target.w), 400, 'Tap it.'];
}
// Praise that says what was right (informational, per the rewards research), plus news of a newly mastered item
// After the first few rounds the explanation is dropped ("Yes!"), so the sound isn't repeated every time.
export const FULL_PRAISE_ROUNDS = 3;
export function praiseParts(L, r, { modelled = false, mastered = false, n = 0 } = {}) {
  if (modelled) return ['That\'s it.'];
  const extra = mastered ? [400, 'You know that one now!'] : [];
  const short = n >= FULL_PRAISE_ROUNDS;
  if (L.kind === 'sort') return short ? ['Yes!', ...extra] : ['Yes!', 300, word(r.w), 200, L.ask === 'has' ? 'has' : 'starts with', 300, gsnd(binsOf(L, r)[r.bin]), ...extra];
  if (L.kind === 'pop') {
    if (L.mode === 'sound') return short ? ['Yes!', ...extra] : ['Yes! That says', 300, gsnd(r.target), ...extra];
    if (L.mode === 'name') return ['Yes! That\'s', 300, nsnd(r.target), ...extra];
    return ['Yes!', 300, slowWord(r.target), ...extra];
  }
  if (L.mode === 'rhyme') return ['Yes!', 300, word(r.target.cue), 300, word(r.target.w), ...extra];
  // Blend it / Read it: in the first rounds, each sound again as its letters light up (cue), then the whole word
  const w = r.target.w, whole = { ...word(w), cue: 'all' };
  if (short) return ['Yes!', 300, whole, ...extra];
  return ['Yes!', 300, ...phonemes(w).flatMap((p, k) => [{ ...gsnd(p), cue: k }, 250]), 150, whole, ...extra];
}
// What's said after a wrong tap, before "Try again" or the answer. option: the tile, picture word, or bin tapped
export function missParts(L, r, option) {
  if (L.kind === 'sort') return [L.ask === 'has' ? 'Listen to the middle sound.' : 'Listen to the first sound.', 500, word(r.w, 0.6)];
  if (L.kind === 'pop') return L.mode === 'sound' ? ['That one says', 300, gsnd(option.label)]
    : L.mode === 'name' ? ['That letter is', 300, nsnd(option.label)] : ['That word is', 300, word(option.label)];
  if (L.mode === 'rhyme') return [word(option.w), 200, 'doesn\'t rhyme with', 200, word(r.target.cue)];
  return ['That one is', 300, word(option.w)];
}
export const TRY_AGAIN = 'Try again.', BONUS = 'Bonus round!', LOCKED = 'That level is locked. Finish the one before it.';

// ---- Hint ladder (#35) ---------------------------------------------------------------------------
// A little help first, more if needed: after the first miss (before the answer is shown at modelAfter), the game
// takes away one more wrong answer where enough are left, and gives a hint suited to the game:
//   letter sounds: the keyword picture ("like in" sun) without its word, so the letter isn't given away
//   Blend it: the sounds again, closer together (nearer to the word)
//   Read it: "Sound it out", each sound of the word on screen
//   others: the question again
// Returns { parts: what's said after "Try again", take: wrong answers to remove, pic: a picture word to show }.
export function hintFor(L, r, optionsLeft) {
  if (L.kind === 'pop') {
    const ex = L.mode === 'sound' ? GRAPHEMES[r.target].ex : null;
    return { parts: prompt(L, r, false), take: optionsLeft > 2 ? 1 : 0, pic: ex && PICS[ex] ? ex : null };
  }
  if (L.mode === 'blend') return { parts: ['Listen.', 400, ...phonemes(r.target.w).flatMap(p => [gsnd(p), 120]).slice(0, -1), 400, 'What word is that?'], take: 0, pic: null };
  if (L.mode === 'read') return { parts: soundOutParts(r.target.w), take: 0, pic: null };
  return { parts: prompt(L, r, false), take: 0, pic: null };
}
// After a run of rounds missed on the first try, the next rounds have fewer choices until one is right first time
export const EASE_AFTER = 3;
export const shouldEase = firstTries => firstTries.length >= EASE_AFTER && firstTries.slice(-EASE_AFTER).every(x => !x);
// The same round with fewer choices: 3 bubbles, or 2 pictures (the answer is always kept, and a letter's mix-up)
export function easeRound(L, r, rng = Math.random) {
  if (L.kind === 'sort' || !r.options) return r;
  const keep = L.kind === 'pop' ? 3 : 2;
  if (r.options.length <= keep) return r;
  const right = r.options.filter(o => isRight(L, r, o)), mix = L.kind === 'pop' ? mixUpFor(L, r.target) : null;
  const wrong = r.options.filter(o => !isRight(L, r, o));
  const must = wrong.filter(o => o.label === mix), rest = shuffle(wrong.filter(o => o.label !== mix), rng);
  const kept = new Set([...right, ...must, ...rest].slice(0, keep));
  return { ...r, eased: true, options: r.options.filter(o => kept.has(o)) };
}
// Level complete: what was earned, then a break or practise-again suggestion
export function finishParts(L, { stageDone = false, rest = false, again = false } = {}) {
  return ['You did it!', 400, `You earned the ${L.sticker.name} sticker!`, ...(stageDone ? [500, `You finished stage ${L.stage + 1}!`] : []),
    ...(rest ? [500, 'Great work today! Time for a break.'] : again ? [500, 'Let\'s practise this one again.'] : [])];
}
// The map's "Hear it" button: the next level to play, or the end of the game
export const heroParts = nextIdx => nextIdx < 0 ? ['You finished every level! Look at your stickers.'] : [levelLine(LV[nextIdx]), 500, 'Press play.'];
// Suggest practising a level again when fewer than half the first taps were right
export const shouldPractiseAgain = firstTries => firstTries.length > 0 && firstTries.filter(Boolean).length / firstTries.length < 0.5;

// ---- Grown-up gate ------------------------------------------------------------------------------
// Settings (and later the teacher report) sit behind a sum most 5–8-year-olds can't do yet but adults can in
// seconds: a single digit times a teen (3 × 12 to 9 × 19). See DECISIONS.md.
export function gateQuestion(rng = Math.random) {
  const a = 3 + Math.floor(rng() * 7), b = 12 + Math.floor(rng() * 8);
  return { a, b, answer: a * b };
}
export const gateOk = (q, typed) => typed !== '' && Number(typed) === q.answer;

// ---- Compressed recordings ----------------------------------------------------------------------
// AAC adds about 0.1 s of silence at the start of a clip, which some decoders keep (WebKit on Linux) and others
// remove (Safari, Chrome). Everything before the first audible sample is silence, so skip all but 10 ms of it:
// every browser then starts the sound on time, within a few milliseconds of the original WAV.
export const KEEP_LEAD = 0.01;
export function codecOffset(samples, rate, threshold = 0.01) {
  let i = 0; while (i < samples.length && Math.abs(samples[i]) < threshold) i++;
  return Math.max(0, i / rate - KEEP_LEAD);
}

// ---- Session length ------------------------------------------------------------------------------
// About 15 minutes a session suits ages 5–8 (LEARNING_DESIGN.md, R5). After that, the level complete screen
// suggests a break. 0 turns it off.
export const SESSION_CHOICES = [10, 15, 20, 0];
export const sessionOver = (startedAt, now, minutes) => minutes > 0 && startedAt != null && now - startedAt >= minutes * 60000;
