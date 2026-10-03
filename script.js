// Everything the game can say that isn't a letter sound or name (those are in sounds.js): words and lines,
// worked out from the levels so the list never falls behind the game. Used by the recorder (tools/record.html)
// and the checks. Each clip is first needed in one stage; the recorder offers them stage by stage (batches).
import { LV, mixUpFor, prompt, praiseParts, modelParts, missParts, finishParts, heroParts, levelLine, reviewItems,
  sayId, word, OPTION_WORDS, TRY_AGAIN, BONUS, LOCKED } from './engine.js?v=dev';
import { STAGES, FRY, WORDS, PICS, soundSimilarity, wordStage, soundStage } from './content.js?v=dev';
import { SOUND_IDS } from './sounds.js?v=dev';

const FRY_SET = new Set(FRY);
// Wrong pictures nearOptions could offer for w: the two closest, give or take its random 0.6
function possibleNear(w) {
  const scored = OPTION_WORDS.filter(x => x !== w).map(x => [x, soundSimilarity(w, x)]).sort((a, b) => b[1] - a[1]);
  const cut = (scored[1]?.[1] ?? 0) - 0.6;
  return scored.filter(([, v]) => v >= cut).map(([x]) => x);
}

// Every speech list a level can produce
export function levelSpeech(L) {
  const out = [[levelLine(L)], heroParts(LV.indexOf(L)), [TRY_AGAIN], [BONUS]];
  if (L === LV.at(-1)) out.push(heroParts(-1));
  const lastInStage = LV.filter(l => l.stage === L.stage).at(-1) === L;
  for (const f of [{}, { stageDone: lastInStage }, { rest: true }, { again: true }]) out.push(finishParts(L, f));
  const each = (r, n) => out.push(prompt(L, r, true, 0), prompt(L, r, false, n), praiseParts(L, r, { n: 0 }), praiseParts(L, r, { n: 9 }),
    praiseParts(L, r, { mastered: true }), praiseParts(L, r, { modelled: true }), modelParts(L, r));
  if (L.kind === 'sort') for (const r of L.items) { each(r, 9); out.push(missParts(L, r, 1 - r.bin)); }
  else if (L.kind === 'pop') for (const t of [...L.pool, ...reviewItems(L)]) {
    each({ target: t }, 0);
    for (const o of new Set([...L.pool, mixUpFor(L, t)])) if (o && o !== t) out.push(missParts(L, { target: t }, { label: o }));
  }
  else if (L.mode === 'rhyme') for (const t of L.pairs) {
    each({ target: t }, 0);
    for (const o of L.pairs) if (o !== t) out.push(missParts(L, { target: t }, o));
  }
  else for (const w of L.words) {
    each({ target: { w } }, 0);
    for (const x of possibleNear(w)) out.push(missParts(L, { target: { w } }, { w: x }));
  }
  return out;
}

const kindOf = (id, text) => id.startsWith('word-') ? (FRY_SET.has(text) ? 'sight' : 'word')
  : /^(Level \d|You earned|You finished stage)/.test(text) ? 'level' : 'line';
// The clips each speech list needs, beyond letter sounds. lead: a line said just before a word or sound
function clipsIn(parts) {
  const out = [];
  parts.forEach((p, i) => {
    if (typeof p === 'number') return;
    const id = typeof p === 'string' ? sayId(p) : p.clip, text = typeof p === 'string' ? p : p.t;
    if (!id || SOUND_IDS.has(id)) return;
    const next = parts.slice(i + 1).find(x => typeof x !== 'number');
    out.push({ id, text, kind: kindOf(id, text), lead: typeof p === 'string' && typeof next === 'object' });
  });
  return out;
}

export const SCRIPT_GROUPS = [
  { key: 'line', title: 'Instructions and praise', note: 'Warm and clear, like talking to a child next to you. A "…" means a word or sound follows: leave it out, the game adds it, and let your voice carry on rather than drop at the end.' },
  { key: 'level', title: 'Level names and stickers', note: 'Cheerful announcements. Pause briefly after the level number.' },
  { key: 'word', title: 'Picture words', note: 'Say each word once, clearly and a little slowly, as if naming a picture for a child. Not like a question.' },
  { key: 'sight', title: 'Sight words', note: 'Say each word once, clearly and a little slowly, on its own. Short words ("a", "I", "the") the way you\'d say them in a sentence: "uh", not "ay".' }
];

// Batches: one per stage, with every clip first needed in that stage
export const BATCHES = (() => {
  const seen = new Map(), batches = STAGES.map((st, i) => ({ key: `stage-${i + 1}`, title: `${st.title} (${st.sounds})`, clips: [] }));
  batches[0].clips.push(...clipsIn([LOCKED]).map(c => (seen.set(c.id, c), c)));
  for (const L of LV) for (const parts of levelSpeech(L)) for (const c of clipsIn(parts)) {
    const had = seen.get(c.id);
    if (had) { had.lead ||= c.lead; continue; }
    seen.set(c.id, c); batches[L.stage].clips.push(c);
  }
  // every word in WORDS keeps a slot, even one no level says yet (picture words kept for word games, and the words
  // for "find the word"), in the stage whose sounds make it readable; every picture too
  // Pictures not in WORDS (for First sounds) go in the stage that teaches their first sound
  const firstSound = w => ['sh', 'ch', 'th', 'qu'].find(g => w.startsWith(g)) || w[0];
  const stageOf = w => WORDS[w] ? wordStage(w) : soundStage(firstSound(w)) ?? -1;
  for (const w of [...Object.keys(WORDS), ...Object.keys(PICS)]) for (const c of clipsIn([word(w)])) if (!seen.has(c.id)) {
    const st = stageOf(w);
    seen.set(c.id, c); batches[st < 0 ? STAGES.length - 1 : st].clips.push(c);
  }
  const order = Object.fromEntries(SCRIPT_GROUPS.map((g, i) => [g.key, i]));
  for (const b of batches) b.clips.sort((a, c) => order[a.kind] - order[c.kind]);
  return batches;
})();
export const SCRIPT = BATCHES.flatMap(b => b.clips.map(c => ({ ...c, batch: b.key })));
export const SCRIPT_IDS = new Set(SCRIPT.map(c => c.id));
