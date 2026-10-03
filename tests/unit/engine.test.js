// Unit tests for the game rules (engine.js) and the content check (content.js).
// Each test is [name, fn]; fn throws on failure. Run in the browser by tests/index.html and in Node by
// tests/unit/run.mjs (GitHub Actions).
import { LV, layoutFor, stagePos, buildRounds, isRight, nearOptions, cycle, shuffle, unlocked, nextLevel,
  stageComplete, mapStageFor, doneFromIds, idsFromDone, idsFromV2, prompt, soundOutParts,
  MASTERY_RULE, itemKey, recordAttempt, isMastered, levelItems, masteredIn, today,
  modelAfter, modelParts, praiseParts, shouldPractiseAgain } from '../../engine.js?v=dev';
import { LEVELS, STAGES, GRAPHEMES, PICS, WORDS, coverage, decodableBy, phonemes, soundSimilarity } from '../../content.js?v=dev';

const ok = (cond, msg) => { if (!cond) throw new Error(msg); };
const eq = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
// Repeatable "random" numbers, so shuffles are the same every run
const seeded = (seed = 1) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const level = type => LV.find(l => l.type === type);
const clone = x => JSON.parse(JSON.stringify(x));
const none = Array(LV.length).fill(false);

export const tests = [
  // ---- rounds
  ['shuffle keeps every item exactly once', () => {
    const a = [1, 2, 3, 4, 5, 6, 7, 8];
    eq(shuffle(a, seeded(3)).slice().sort(), a, 'shuffled items');
  }],
  ['cycle uses every item before repeating any', () => {
    const out = cycle(['a', 'b', 'c'], 7, seeded(5));
    eq(out.slice(0, 3).sort(), ['a', 'b', 'c'], 'first pass');
    eq(out.slice(3, 6).sort(), ['a', 'b', 'c'], 'second pass');
  }],
  ['pop rounds: right number of tiles, answer always among them, no duplicates', () => {
    for (const L of LV.filter(l => l.kind === 'pop')) {
      for (const r of buildRounds(L, 8, seeded(L.n))) {
        const labels = r.options.map(o => o.label);
        eq(labels.length, Math.min(L.tiles || 4, L.pool.length), `level ${L.n} tile count`);
        ok(labels.includes(r.target), `level ${L.n}: answer "${r.target}" missing`);
        eq(new Set(labels).size, labels.length, `level ${L.n} duplicate tiles`);
      }
    }
  }],
  ['blend and read rounds: answer plus two different wrong options', () => {
    for (const L of LV.filter(l => l.mode === 'blend' || l.mode === 'read')) {
      for (const r of buildRounds(L, 8, seeded(L.n))) {
        const ws = r.options.map(o => o.w);
        eq(ws.length, 3, `level ${L.n} option count`);
        ok(ws.includes(r.target.w), `level ${L.n}: answer missing`);
        eq(new Set(ws).size, 3, `level ${L.n} duplicate options`);
      }
    }
  }],
  ['sort rounds: every picture exactly once', () => {
    for (const L of LV.filter(l => l.kind === 'sort')) eq(buildRounds(L, 8, seeded(2)).length, L.items.length, `level ${L.n}`);
  }],
  ['isRight: true only for the answer', () => {
    const L = level('blend'), r = buildRounds(L, 1, seeded(9))[0];
    eq(r.options.filter(o => isRight(L, r, o)).length, 1, 'right options');
    const S = level('sort'), item = buildRounds(S, 1, seeded(9))[0];
    ok(isRight(S, item, item.bin) && !isRight(S, item, 1 - item.bin), 'sort bins');
  }],

  // ---- wrong options
  ['similarity: sharing first or last sounds scores higher', () => {
    ok(soundSimilarity('cat', 'cap') > soundSimilarity('cat', 'dog'), 'cat/cap vs cat/dog');
    ok(soundSimilarity('cat', 'hat') > soundSimilarity('cat', 'pig'), 'cat/hat vs cat/pig');
    ok(soundSimilarity('ship', 'shell') > soundSimilarity('ship', 'ring'), 'ship/shell vs ship/ring');
  }],
  ['nearOptions: only decodable words, never the answer, share a sound when possible', () => {
    for (const L of LV.filter(l => l.mode === 'blend' || l.mode === 'read')) {
      const pool = decodableBy(L.stage);
      for (const w of L.words) {
        const near = nearOptions(w, L.stage, seeded(4));
        ok(!near.includes(w), `"${w}" offered as its own wrong option`);
        for (const x of near) ok(pool.includes(x), `"${x}" isn't decodable by stage ${L.stage + 1}`);
        const shares = x => { const A = phonemes(w), B = phonemes(x); return A[0] === B[0] || A.at(-1) === B.at(-1); };
        if (pool.some(x => x !== w && shares(x))) ok(near.some(shares), `"${w}" got ${near.join(', ')}`);
      }
    }
  }],

  // ---- speech
  ['prompts: first round announces the level; sort asks start vs has', () => {
    const L = level('blend'), r = buildRounds(L, 1, seeded(1))[0];
    ok(prompt(L, r, true)[0].startsWith(`Level ${L.n}.`), 'announcement');
    ok(!String(prompt(L, r, false)[0]).startsWith('Level'), 'no announcement after the first round');
    const start = LV.find(l => l.type === 'sort' && l.ask === 'start'), has = LV.find(l => l.type === 'sort' && l.ask === 'has');
    ok(prompt(start, start.items[0], false).includes('Does it start with'), 'start question');
    ok(prompt(has, has.items[0], false).includes('Does it have'), 'has question');
  }],
  ['prompts: every speech sound uses a known recording', () => {
    for (const L of LV) for (const r of buildRounds(L, 4, seeded(L.n)))
      for (const p of prompt(L, r, true)) if (p && p.clip) ok(/^[a-z-]+$/.test(p.clip), `level ${L.n}: odd clip "${p.clip}"`);
  }],
  ['sound it out: one sound per letter group, never the whole word', () => {
    const parts = soundOutParts('ship').filter(p => typeof p === 'object');
    eq(parts.map(p => p.clip), ['sh', 'i-short', 'p'], 'ship sounds');
    ok(!soundOutParts('ship').some(p => p === 'ship' || p.t === 'ship'), 'said the word');
  }],

  // ---- progress
  ['unlocking: level 1 always open; the next opens when the one before is done', () => {
    ok(unlocked(0, none), 'level 1');
    ok(!unlocked(1, none), 'level 2 locked at start');
    const d = none.slice(); d[0] = true;
    ok(unlocked(1, d) && !unlocked(2, d), 'after level 1');
    ok(unlocked(20, none, true), 'unlock all');
  }],
  ['next level and stage completion', () => {
    eq(nextLevel(none), 0, 'fresh start');
    const d = LV.map(l => l.stage === 0);
    eq(nextLevel(d), STAGES[1].first, 'after stage 1');
    ok(stageComplete(0, d) && !stageComplete(1, d), 'stage complete');
    eq(nextLevel(LV.map(() => true)), -1, 'all done');
  }],
  ['map shows the next level\'s stage, or the stage picked', () => {
    eq(mapStageFor(none), 0, 'fresh');
    eq(mapStageFor(LV.map(l => l.stage <= 1)), 2, 'after two stages');
    eq(mapStageFor(none, 4), 4, 'picked');
    eq(mapStageFor(LV.map(() => true)), STAGES.length - 1, 'all done');
  }],
  ['saved progress: ids round-trip, and survive levels being reordered', () => {
    const d = LV.map((l, i) => i % 3 === 0);
    eq(doneFromIds(idsFromDone(d)), d, 'round trip');
    const ids = idsFromDone(d);
    eq(doneFromIds(ids.slice().reverse()), d, 'order of saved ids doesn\'t matter');
    eq(doneFromIds(['not-a-level', ...ids]), d, 'unknown ids are ignored');
  }],
  ['saved progress: old position-based saves (v2) migrate to ids', () => {
    const v2 = LV.map((l, i) => i < 7);
    eq(doneFromIds(idsFromV2(v2)), v2, 'migrated');
    eq(idsFromV2(null), [], 'nothing saved');
  }],
  ['every level has a unique id', () => {
    eq(new Set(LV.map(l => l.id)).size, LV.length, 'unique ids');
  }],

  // ---- mastery
  ['mastery: 3 first-try correct of the last 4, across 2 days', () => {
    eq(MASTERY_RULE, { correct: 3, of: 4, days: 2 }, 'rule');
    const a = (day, ok) => ({ day, ok });
    ok(!isMastered([a('d1', true), a('d1', true), a('d1', true)]), 'three right on one day is not enough');
    ok(isMastered([a('d1', true), a('d1', true), a('d2', true)]), 'three right over two days');
    ok(isMastered([a('d1', true), a('d1', false), a('d2', true), a('d2', true)]), 'one slip in the last four is fine');
    ok(!isMastered([a('d1', true), a('d1', false), a('d2', false), a('d2', true)]), 'two slips is not');
    ok(!isMastered([a('d1', true), a('d1', true), a('d2', true), a('d3', false), a('d3', false)]), 'only the last four count');
    ok(!isMastered([]), 'no attempts');
  }],
  ['mastery: recordAttempt keeps a short history and never changes the old store', () => {
    let st = {};
    for (let i = 0; i < 12; i++) st = recordAttempt(st, 'blend:cat', i % 2 === 0, `d${i}`);
    eq(st['blend:cat'].length, 8, 'keeps the last 8');
    const before = JSON.stringify(st), after = recordAttempt(st, 'blend:cat', true, 'd99');
    eq(JSON.stringify(st), before, 'old store untouched');
    ok(after['blend:cat'].at(-1).day === 'd99', 'new attempt added');
  }],
  ['mastery: every round has a key, and it is one of its level\'s items', () => {
    for (const L of LV) {
      const items = new Set(levelItems(L));
      for (const r of buildRounds(L, 6, seeded(L.n))) ok(items.has(itemKey(L, r)), `level ${L.n}: ${itemKey(L, r)} not in its items`);
    }
  }],
  ['mastery: keys say what was practised', () => {
    eq(itemKey(level('sounds'), { target: 'sh' }), 'sound:sh', 'sound');
    eq(itemKey(level('sight'), { target: 'said' }), 'word:said', 'sight word');
    eq(itemKey(level('blend'), { target: { w: 'cat' } }), 'blend:cat', 'blend');
    eq(itemKey(level('sort'), { w: 'sock', bin: 0 }), 'sort:sock', 'sort');
  }],
  ['mastery: masteredIn counts only that level\'s mastered items', () => {
    const L = level('blend'), [w1, w2] = L.words;
    let st = {};
    for (const day of ['d1', 'd1', 'd2']) st = recordAttempt(st, `blend:${w1}`, true, day);
    st = recordAttempt(st, `blend:${w2}`, true, 'd1');
    eq(masteredIn(L, st), [`blend:${w1}`], 'mastered');
  }],
  ['today() gives a calendar date', () => ok(/^\d{4}-\d{2}-\d{2}$/.test(today()), today())],

  // ---- feedback
  ['feedback: answer shown after 2 misses, or 1 in a sort', () => {
    eq(modelAfter(level('blend')), 2, 'blend'); eq(modelAfter(level('sight')), 2, 'sight'); eq(modelAfter(level('sort')), 1, 'sort');
  }],
  ['feedback: showing the answer names it', () => {
    const B = level('blend'); ok(modelParts(B, { target: { w: 'cat' } }).some(p => p.t && p.t.includes('cat')), 'blend names the word');
    const S = level('sounds'); ok(modelParts(S, { target: 'm' }).some(p => p.clip === 'm'), 'sound plays the sound');
    const T = level('sort'); ok(modelParts(T, T.items[0]).some(p => p.clip === GRAPHEMES[T.bins[T.items[0].bin]].clip), 'sort plays the right sound');
  }],
  ['feedback: praise says what was right; "You know that one now" only when newly mastered', () => {
    const S = level('sounds');
    ok(praiseParts(S, { target: 'sh' }).some(p => p.clip === 'sh'), 'sound praise plays the sound');
    ok(!praiseParts(S, { target: 'sh' }).includes('You know that one now!'), 'no mastery news by default');
    ok(praiseParts(S, { target: 'sh' }, { mastered: true }).includes('You know that one now!'), 'mastery news');
    eq(praiseParts(S, { target: 'sh' }, { modelled: true }), ["That's it."], 'after the answer was shown');
    ok(praiseParts(level('sight'), { target: 'said' })[0].t.includes('said'), 'sight word praise says the word');
  }],
  ['feedback: practise again below half right first time', () => {
    ok(shouldPractiseAgain([false, false, true]), '1 of 3');
    ok(!shouldPractiseAgain([true, false]), '1 of 2 is half, not under');
    ok(!shouldPractiseAgain([true, true, false]), '2 of 3');
    ok(!shouldPractiseAgain([]), 'nothing played');
  }],

  // ---- layout
  ['layoutFor picks the right layout for common screens', () => {
    eq(layoutFor(1180, 820), 'wide', 'iPad landscape');
    eq(layoutFor(1440, 900), 'wide', 'laptop');
    eq(layoutFor(820, 1180), 'tablet-portrait', 'iPad portrait');
    eq(layoutFor(390, 844), 'phone', 'iPhone portrait');
    eq(layoutFor(844, 390), 'phone-landscape', 'iPhone landscape');
  }],
  ['map stops stay inside the map in every layout', () => {
    for (const [down, phone] of [[false, false], [true, false], [true, true]])
      for (let n = 1; n <= 7; n++) for (const [x, y] of stagePos(n, down, phone)) ok(x >= 5 && x <= 95 && y >= 5 && y <= 95, `n=${n} down=${down}: ${x},${y}`);
  }],

  // ---- the content check catches mistakes (each test breaks one thing on a copy)
  ['content check: current content passes', () => eq(coverage(), [], 'problems')],
  ['content check catches a word using a sound not taught yet', () => {
    const levels = clone(LEVELS); levels.find(l => l.type === 'blend').words.push('ship');
    ok(coverage({ levels }).some(p => p.includes('"ship" uses "sh"')), 'not caught');
  }],
  ['content check catches a word with no picture', () => {
    const pics = { ...PICS }; delete pics.cat;
    ok(coverage({ pics }).some(p => p.includes('no picture for "cat"')), 'not caught');
  }],
  ['content check catches a letter that is never taught', () => {
    const levels = clone(LEVELS).map(l => l.type === 'sounds' ? { ...l, pool: l.pool.filter(g => g !== 'z') } : l);
    ok(coverage({ levels }).some(p => p.includes('teaches "z"')), 'not caught');
  }],
  ['content check catches a bin picture repeated as a picture to sort', () => {
    const levels = clone(LEVELS); levels.find(l => l.type === 'sort').items.push({ w: 'sun', bin: 0 });
    ok(coverage({ levels }).some(p => p.includes('"sun" is both')), 'not caught');
  }],
  ['content check catches duplicate level ids', () => {
    const levels = clone(LEVELS); levels[1].id = levels[0].id;
    ok(coverage({ levels }).some(p => p.includes('used more than once')), 'not caught');
  }],
  ['content check catches a word with an unknown sound', () => {
    const words = { ...WORDS, cat: 'c a tt' };
    ok(coverage({ words }).some(p => p.includes('unknown sound "tt"')), 'not caught');
  }],
  ['content check catches a sound pointing at a missing recording', () => {
    const graphemes = { ...GRAPHEMES, s: { ...GRAPHEMES.s, clip: 'no-such-clip' } };
    ok(coverage({ graphemes }).some(p => p.includes('"no-such-clip"')), 'not caught');
  }]
];
