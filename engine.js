// Word Path game rules, kept free of screen code so they can be unit-tested (tests/unit/).
// app.js draws the screens and plays the audio; everything it decides comes from here.
import { LEVELS, STAGES, GRAPHEMES, NAME_SAY, phonemes, decodableBy, soundSimilarity } from './content.js?v=dev';

// Every level from content.js, plus the screen kind (pop / match / sort) and mode the game uses
export const LV = LEVELS.map(l => ({ ...l,
  kind: { sounds:'pop', names:'pop', sight:'pop', sort:'sort', blend:'match', read:'match', rhyme:'match' }[l.type],
  mode: { sounds:'sound', names:'name', sight:'word', blend:'blend', read:'read', rhyme:'rhyme' }[l.type] }));

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

// The spoken question for a round. Parts: strings, {t, rate, clip}, or numbers (pause in ms)
export function prompt(L, r, first) {
  const pre = first ? [`Level ${L.n}. ${L.title}.`, 700] : [];
  if (L.kind === 'pop') {
    if (L.mode === 'sound') { const gr = GRAPHEMES[r.target]; return [...pre, r.target.length > 1 ? 'Find the letters that say' : 'Find the letter that says', 500, gsnd(r.target), 500, 'like in', { t: gr.ex, rate: 0.8 }]; }
    if (L.mode === 'name') return [...pre, 'Find the letter', 400, nsnd(r.target)];
    return [...pre, { t: `Pop the word: ${r.target}.`, rate: 0.85 }];
  }
  if (L.kind === 'match') {
    if (L.mode === 'blend') return [...pre, 'Listen.', 500, ...phonemes(r.target.w).flatMap(p => [gsnd(p), 450]), 400, 'What word is that?'];
    if (L.mode === 'rhyme') return [...pre, 'Which picture rhymes with', 400, { t: r.target.cue, rate: 0.7 }];
    return [...pre, 'Read the word. Then tap its picture.'];
  }
  const [A, B] = L.bins;
  return [...pre, { t: r.w, rate: 0.7 }, 700, L.ask === 'has' ? 'Does it have' : 'Does it start with', 300, gsnd(A), 400, 'or', 300, gsnd(B)];
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
// Blend it / Read it: the two wrong options that sound most like the answer (cat → cap, can), drawn from every
// word the child can decode by this stage, so the first sound alone isn't enough. A little randomness varies ties.
export function nearOptions(w, stage, rng = Math.random) {
  return decodableBy(stage).filter(x => x !== w)
    .map(x => [x, soundSimilarity(w, x) + rng() * 0.6]).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([x]) => x);
}
// The rounds for one play of a level
export function buildRounds(L, count, rng = Math.random) {
  if (L.kind === 'pop') {
    const tiles = Math.min(L.tiles || 4, L.pool.length);
    return cycle(L.pool, count, rng).map(t => ({
      target: t,
      options: shuffle([t, ...shuffle(L.pool.filter(x => x !== t), rng).slice(0, tiles - 1)], rng)
        .map(label => ({ label, bob: (rng() * 1.5).toFixed(2), dur: (2.6 + rng()).toFixed(2) }))
    }));
  }
  if (L.kind === 'match') {
    if (L.mode === 'rhyme') return cycle(L.pairs, count, rng).map(t => ({ target: t, options: shuffle([t, ...shuffle(L.pairs.filter(x => x.w !== t.w), rng).slice(0, 2)], rng) }));
    return cycle(L.words, count, rng).map(w => ({ target: { w }, options: shuffle([{ w }, ...nearOptions(w, L.stage, rng).map(x => ({ w: x }))], rng) }));
  }
  return shuffle(L.items, rng);  // sort: every picture once
}
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
