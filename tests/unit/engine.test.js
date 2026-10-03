// Unit tests for the game rules (engine.js) and the content check (content.js).
// Each test is [name, fn]; fn throws on failure. Run in the browser by tests/index.html and in Node by
// tests/unit/run.mjs (GitHub Actions).
import { LV, layoutFor, stagePos, buildRounds, isRight, nearOptions, cycle, shuffle, unlocked, nextLevel,
  stageComplete, mapStageFor, doneFromIds, idsFromDone, idsFromV2, prompt, soundOutParts,
  MASTERY_RULE, itemKey, recordAttempt, isMastered, levelItems, masteredIn, today,
  modelAfter, modelParts, praiseParts, shouldPractiseAgain, pickTargets, reviewItems, reviewCount,
  bonusTarget, bonusRound, PICTURE_WORDS, FULL_ROUNDS, FULL_PRAISE_ROUNDS,
  sayId, wordId, slug, codecOffset, KEEP_LEAD, mixUpFor, OPTION_WORDS, gateQuestion, gateOk, progressReport, itemLabel, PRACTICE_RULE, missParts, finishParts, heroParts, TRY_AGAIN, BONUS, LOCKED,
  SESSION_CHOICES, sessionOver } from '../../engine.js?v=dev';
import { LEVELS, STAGES, GRAPHEMES, PICS, PICTURE_FLAGS, WORDS, FRY, CONFUSIONS, confusedWith, coverage, decodableBy, phonemes, soundSimilarity } from '../../content.js?v=dev';
import { SOUND_IDS } from '../../sounds.js?v=dev';
import { SCRIPT, SCRIPT_IDS, BATCHES } from '../../script.js?v=dev';

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
  ['nearOptions: picture words, never the answer, share a sound when possible', () => {
    for (const L of LV.filter(l => l.mode === 'blend' || l.mode === 'read')) {
      const pool = OPTION_WORDS;
      for (const w of L.words) {
        const near = nearOptions(w, L.stage, seeded(4));
        ok(!near.includes(w), `"${w}" offered as its own wrong option`);
        for (const x of near) ok(PICS[x], `"${x}" has no picture`);
        const shares = x => { const A = phonemes(w), B = phonemes(x); return A[0] === B[0] || A.at(-1) === B.at(-1); };
        if (pool.some(x => x !== w && shares(x))) ok(near.some(shares), `"${w}" got ${near.join(', ')}`);
      }
    }
  }],

  // ---- teacher report (#19)
  ['report: empty when nothing has been played', () => {
    const r = progressReport(none, {});
    eq([r.finished, r.known, r.practised, r.tries, r.levels.length, r.practice.length, r.last], [0, 0, 0, 0, 0, 0, ''], 'empty report');
  }],
  ['report: levels, known items, first-try rate and last day come from the mastery store', () => {
    const L = level('blend'), [w1, w2] = L.words, idx = LV.indexOf(L), done = none.map((_, i) => i === idx);
    let st = {};
    for (const day of ['2026-10-01', '2026-10-01', '2026-10-02']) st = recordAttempt(st, `blend:${w1}`, true, day);   // known
    st = recordAttempt(st, `blend:${w2}`, false, '2026-10-02'); st = recordAttempt(st, `blend:${w2}`, false, '2026-10-03');  // needs practice
    const r = progressReport(done, st), row = r.levels.find(l => l.n === L.n);
    eq([r.finished, r.known, r.practised, r.tries, r.right, r.last], [1, 1, 2, 5, 3, '2026-10-03'], 'totals');
    eq([row.done, row.known, row.total, row.tries, row.right, row.last], [true, 1, L.words.length, 5, 3, '2026-10-03'], 'level row');
    eq(r.levels.length, 1, 'only played levels are listed');
    eq(r.practice.map(p => p.text), [w2], 'needs practice');
  }],
  ['report: needs practice = under half right, at least 2 tries, not known; worst first, capped', () => {
    let st = {};
    const add = (key, oks) => oks.forEach((ok, i) => { st = recordAttempt(st, key, ok, `2026-10-0${i + 1}`); });
    add('sound:s', [false, false]);          // 0/2: in
    add('sound:a', [true, false, false]);    // 1/3: in, after s
    add('sound:t', [true, false]);           // 1/2: half, not under: out
    add('sound:p', [false]);                 // one try: out
    add('word:the', [true, true, true]);     // known: out
    eq(progressReport(none, st).practice.map(p => p.key), ['sound:s', 'sound:a'], 'practice list');
    for (let i = 0; i < PRACTICE_RULE.show + 3; i++) add(`word:w${i}`, [false, false]);
    const r = progressReport(none, st);
    eq([r.practice.length, r.morePractice], [PRACTICE_RULE.show, 5], 'capped with a count of the rest');
  }],
  ['report: item labels say what kind of item it is', () => {
    eq(itemLabel('name:b'), { kind: 'name', kindName: 'letter name', text: 'B' }, 'letter name');
    eq(itemLabel('sound:sh').kindName, 'letter sound', 'sound'); eq(itemLabel('word:said').text, 'said', 'sight word');
  }],

  // ---- compressed recordings (#27b)
  ['codec padding: silence at the start beyond 40 ms is skipped; a normal start is left alone', () => {
    const rate = 22050, clip = (lead, len = 0.3) => Float32Array.from({ length: Math.round((lead + len) * rate) }, (_, i) => i < lead * rate ? 0 : 0.3);
    ok(Math.abs(codecOffset(clip(0.135), rate) - (0.135 - KEEP_LEAD)) < 0.001, 'padded clip');
    eq(codecOffset(clip(0.02), rate), 0, 'clip that starts on time');
    eq(codecOffset(clip(0), rate), 0, 'clip with no lead-in');
  }],

  // ---- grown-up gate (#18)
  ['gate: a single digit times a teen, checked exactly', () => {
    const rng = seeded(11);
    for (let i = 0; i < 200; i++) {
      const q = gateQuestion(rng);
      ok(q.a >= 3 && q.a <= 9 && q.b >= 12 && q.b <= 19 && q.answer === q.a * q.b, `odd sum ${q.a} × ${q.b} = ${q.answer}`);
    }
    const q = { a: 6, b: 13, answer: 78 };
    ok(gateOk(q, '78'), 'right answer'); ok(!gateOk(q, '87'), 'wrong answer'); ok(!gateOk(q, ''), 'empty');
  }],

  // ---- wrong answers that would confuse (first group of testers' notes)
  ['wrong answers never make the same sound as the right one (c / k / ck)', () => {
    let checked = 0;
    for (const L of LV.filter(l => l.kind === 'pop' && l.mode === 'sound'))
      for (const r of buildRounds(L, 8, seeded(L.n))) for (const o of r.options) if (o.label !== r.target) {
        ok(GRAPHEMES[o.label].clip !== GRAPHEMES[r.target].clip, `level ${L.n}: "${o.label}" offered against "${r.target}" (same sound)`); checked++;
      }
    const L = LV.find(l => l.mode === 'sound' && l.pool.includes('ck'));
    for (let k = 1; k < 30; k++) { const labels = buildRounds(L, 8, seeded(k)).filter(r => r.target === 'c').flatMap(r => r.options.map(o => o.label));
      ok(!labels.includes('k') && !labels.includes('ck'), `c offered with k or ck: ${labels.join(' ')}`); }
    ok(checked > 100, 'too few options checked');
  }],
  ['pictures likely to be misnamed are never wrong answers', () => {
    const unclear = Object.keys(PICTURE_FLAGS).filter(w => PICTURE_FLAGS[w][0] === 'high');
    ok(unclear.includes('nap') && unclear.every(w => !OPTION_WORDS.includes(w)), 'unclear pictures in the option list');
    for (const L of LV.filter(l => l.mode === 'blend' || l.mode === 'read')) for (let k = 1; k < 6; k++)
      for (const r of buildRounds(L, 8, seeded(L.n * 10 + k))) for (const o of r.options) if (o.w !== r.target.w)
        ok(!unclear.includes(o.w), `level ${L.n}: "${o.w}" offered as a wrong answer for "${r.target.w}"`);
  }],

  // ---- letter mix-ups (#17)
  ['mix-ups: once both are taught, a letter\'s usual mix-up is always among its tiles', () => {
    let seen = 0;
    for (const L of LV.filter(l => l.kind === 'pop' && l.mode !== 'word')) {
      const taught = new Set(LV.filter(l => l.type === L.type && l.n <= L.n).flatMap(l => l.pool));
      for (const r of buildRounds(L, 8, seeded(L.n))) {
        const mix = confusedWith(r.target).find(x => taught.has(x)), labels = r.options.map(o => o.label);
        eq(mixUpFor(L, r.target), mix ?? null, `level ${L.n}: mix-up for ${r.target}`);
        if (mix) { ok(labels.includes(mix), `level ${L.n}: ${r.target} without ${mix}: ${labels.join(' ')}`); seen++; }
        eq(new Set(labels).size, labels.length, `level ${L.n} duplicate tiles`);
      }
      for (const t of L.pool) for (const x of confusedWith(t)) if (!taught.has(x)) eq(mixUpFor(L, t), null, `level ${L.n}: ${x} offered before it's taught`);
    }
    ok(seen > 0, 'no level ever offered a mix-up');
  }],
  ['mix-ups: words one confusable sound apart count as closer (pin / pen)', () => {
    ok(soundSimilarity('pin', 'pen') > soundSimilarity('pin', 'pan'), 'pin/pen vs pin/pan');
    for (const [a, b] of CONFUSIONS) { ok(confusedWith(a).includes(b) && confusedWith(b).includes(a), `${a}/${b} both ways`); }
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
  // ---- recordings for words and lines (script.js)
  ['recordings: every word and line the game can say has a slot in the recording list', () => {
    const known = id => SOUND_IDS.has(id) || SCRIPT_IDS.has(id);
    const check = (parts, where) => { for (const p of parts) if (typeof p !== 'number') {
      const id = typeof p === 'string' ? sayId(p) : p.clip;
      ok(id && known(id), `${where}: "${p.t ?? p}" (${id}) has no recording slot`);
    } };
    for (const L of LV) {
      const rounds = buildRounds(L, 8, seeded(L.n));
      rounds.forEach((r, n) => {
        check(prompt(L, r, n === 0, n), `level ${L.n} prompt`);
        check(praiseParts(L, r, { n }), `level ${L.n} praise`);
        check(modelParts(L, r), `level ${L.n} answer`);
        const wrong = L.kind === 'sort' ? [1 - r.bin] : r.options.filter(o => !isRight(L, r, o));
        for (const o of wrong) check(missParts(L, r, o), `level ${L.n} wrong tap`);
      });
      check(finishParts(L, { stageDone: true, rest: true }), `level ${L.n} finish`);
      check(finishParts(L, { again: true }), `level ${L.n} finish`);
    }
    check([TRY_AGAIN, BONUS, LOCKED], 'fixed lines');
    check(heroParts(0), 'map'); check(heroParts(-1), 'map');
  }],
  ['recordings: every sight word and picture word has a slot, and ids are unique and file-safe', () => {
    for (const w of [...FRY, ...PICTURE_WORDS]) ok(SCRIPT_IDS.has(wordId(w)), `"${w}" has no slot`);
    eq(SCRIPT_IDS.size, SCRIPT.length, 'unique ids');
    for (const c of SCRIPT) ok(/^(word|say)-[a-z0-9]+(-[a-z0-9]+)*$/.test(c.id), `odd id "${c.id}"`);
    const texts = new Map(); for (const c of SCRIPT) { ok(!texts.has(c.id) || texts.get(c.id) === c.text, `"${c.text}" and "${texts.get(c.id)}" share ${c.id}`); texts.set(c.id, c.text); }
    eq([slug("Let's practise this one again."), wordId('I'), wordId("don't")], ['lets-practise-this-one-again', 'word-i', 'word-dont'], 'slugs');
  }],
  ['recordings: lines are reusable (words are said separately), so the script stays small', () => {
    const lines = SCRIPT.filter(c => c.kind === 'line');
    ok(lines.length <= 45, `${lines.length} instruction lines: is a word baked into a sentence?`);
    for (const c of lines) for (const w of PICTURE_WORDS) ok(!new RegExp(`\\b${w}\\b`, 'i').test(c.text) || ['can', 'tap', 'it'].includes(w), `"${c.text}" contains the word "${w}"`);
    eq(BATCHES.length, STAGES.length, 'one batch per stage');
    ok(BATCHES.every(b => b.clips.length), 'no empty batch');
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
  ['mastery: every round has a key: one of its level\'s items, or (review rounds) an earlier level\'s', () => {
    for (const L of LV) {
      const items = new Set(levelItems(L)), review = new Set(reviewItems(L));
      for (const r of buildRounds(L, 8, seeded(L.n))) {
        if (r.review) ok(review.has(r.target.w ?? r.target), `level ${L.n}: review item ${itemKey(L, r)} isn't from an earlier level`);
        else ok(items.has(itemKey(L, r)), `level ${L.n}: ${itemKey(L, r)} not in its items`);
      }
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

  // ---- coverage and review
  ['coverage: never-seen items come first, so repeated plays work through the whole list', () => {
    const L = LV.find(l => l.type === 'sight' && l.pool.length >= 40);
    let st = {}, seen = new Set(), plays = 0;
    while (seen.size < L.pool.length && plays < 20) {
      for (const r of buildRounds(L, 8, seeded(100 + plays), st)) if (!r.review) { seen.add(r.target); st = recordAttempt(st, `word:${r.target}`, true, 'd1'); }
      plays++;
    }
    const own = 8 - reviewCount(L, 8);
    eq(plays, Math.ceil(L.pool.length / own), `plays to see all ${L.pool.length} words (${own} new per play)`);
  }],
  ['coverage: still-learning items come before mastered ones', () => {
    const items = ['a', 'b', 'c', 'd'], key = x => `word:${x}`;
    let st = {};
    for (const day of ['d1', 'd1', 'd2']) st = recordAttempt(st, 'word:a', true, day);   // a mastered
    st = recordAttempt(st, 'word:b', false, 'd1'); st = recordAttempt(st, 'word:c', false, 'd1'); st = recordAttempt(st, 'word:d', false, 'd1');
    ok(!pickTargets(items, key, 3, st, seeded(2)).includes('a'), 'mastered item picked while others still need practice');
  }],
  ['coverage: short lists still fill every round', () => {
    eq(pickTargets(['x', 'y'], x => x, 5, {}, seeded(1)).length, 5, 'rounds');
  }],
  ['review: later levels mix in 2 of 8 rounds from earlier levels; the first level of a kind has none', () => {
    eq(reviewCount(LV.find(l => l.type === 'sounds'), 8), 0, 'first letter-sounds level');
    const later = LV.filter(l => l.type === 'sounds')[2];
    eq(reviewCount(later, 8), 2, 'third letter-sounds level');
    eq(buildRounds(later, 8, seeded(3)).filter(r => r.review).length, 2, 'review rounds in a play');
    eq(reviewCount(LV.find(l => l.type === 'sort'), 8), 0, 'sorts don\'t review');
  }],
  ['review: picks words the child is still learning first', () => {
    const L = LV.filter(l => l.type === 'blend')[2], earlier = reviewItems(L);
    let st = {}; st = recordAttempt(st, `blend:${earlier[0]}`, false, 'd1');
    ok(buildRounds(L, 8, seeded(7), st).some(r => r.review && r.target.w === earlier[0]), `"${earlier[0]}" (still learning) wasn't reviewed`);
  }],
  ['review: review words are decodable at the current stage, with valid options', () => {
    for (const L of LV.filter(l => l.mode === 'blend' || l.mode === 'read')) {
      const pool = decodableBy(L.stage);
      for (const r of buildRounds(L, 8, seeded(L.n)).filter(r => r.review)) {
        ok(pool.includes(r.target.w), `level ${L.n}: review word "${r.target.w}" not decodable`);
        eq(new Set(r.options.map(o => o.w)).size, 3, `level ${L.n} options`);
      }
    }
  }],

  // ---- session length
  ['session: a break is suggested once the chosen minutes have passed; 0 turns it off', () => {
    ok(SESSION_CHOICES.includes(15), '15 minutes is a choice');
    ok(!sessionOver(0, 14 * 60000, 15), '14 of 15 minutes');
    ok(sessionOver(0, 15 * 60000, 15), '15 of 15 minutes');
    ok(!sessionOver(0, 60 * 60000, 0), 'off');
    ok(!sessionOver(null, 99 * 60000, 15), 'no session started');
  }],

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
    ok(praiseParts(level('sight'), { target: 'said' }).some(p => p.t === 'said'), 'sight word praise says the word');
  }],
  ['feedback: after the first few rounds, sort and letter-sound praise is just "Yes!"', () => {
    const S = level('sounds'), T = level('sort');
    ok(praiseParts(S, { target: 'sh' }, { n: FULL_PRAISE_ROUNDS - 1 }).some(p => p.clip === 'sh'), 'early rounds explain');
    eq(praiseParts(S, { target: 'sh' }, { n: FULL_PRAISE_ROUNDS }), ['Yes!'], 'later sound praise');
    eq(praiseParts(T, T.items[0], { n: FULL_PRAISE_ROUNDS }), ['Yes!'], 'later sort praise');
    ok(praiseParts(S, { target: 'sh' }, { n: 7, mastered: true }).includes('You know that one now!'), 'mastery news still said');
  }],
  ['prompts: sort questions shorten after the first rounds but still say both sounds', () => {
    const T = level('sort'), r = T.items[0];
    ok(prompt(T, r, false, FULL_ROUNDS - 1).includes('Does it start with'), 'early rounds ask in full');
    const later = prompt(T, r, false, FULL_ROUNDS);
    ok(!later.includes('Does it start with'), 'later rounds drop the question');
    eq(later.filter(p => p.clip && !p.clip.startsWith('word-')).length, 2, 'both sounds');
  }],
  ['prompts: sight words are said on their own, slowly, twice', () => {
    const words = prompt(level('sight'), { target: 'are' }, false).filter(p => p.t === 'are');
    eq(words.length, 2, 'times said');
    ok(words.every(p => p.rate <= 0.6), 'slow');
  }],
  ['sight levels are called Word pop 1, 2, 3…', () => {
    const sight = LV.filter(l => l.type === 'sight');
    sight.forEach((l, i) => ok(l.title === `Word pop ${i + 1}` || (i === sight.length - 1 && l.title === 'Word boss'), `level ${l.n}: "${l.title}"`));
  }],
  ['bonus rounds: a short level plays every item once before any bonus round', () => {
    for (const L of LV.filter(l => (l.kind === 'pop' || l.mode === 'blend' || l.mode === 'read'))) {
      const rounds = buildRounds(L, 8, seeded(L.n)), own = L.kind === 'pop' ? L.pool : L.words;
      const first = rounds.filter(r => !r.bonus && !r.review).map(r => r.target.w ?? r.target);
      const bonus = rounds.filter(r => r.bonus);
      eq(rounds.length, 8, `level ${L.n} rounds`);
      if (bonus.length) eq(new Set(first).size, own.length, `level ${L.n}: every item once first`);
      else eq(new Set(first).size, first.length, `level ${L.n}: no repeats`);
      ok(rounds.slice(rounds.length - bonus.length).every(r => r.bonus), `level ${L.n}: bonus rounds come last`);
    }
  }],
  ['bonus rounds: bring back a missed item, never the one just played', () => {
    const L = level('sounds');
    for (let k = 1; k < 20; k++) {
      eq(bonusTarget(L, [L.pool[0], L.pool[1]], L.pool[0], {}, seeded(k)), L.pool[1], 'missed, not just played');
      ok(bonusTarget(L, [L.pool[0]], L.pool[0], {}, seeded(k)) !== L.pool[0], 'only missed item was just played');
    }
    ok(bonusTarget(L, [], L.pool[2], {}, seeded(3)) !== L.pool[2], 'nothing missed');
    const r = bonusRound(L, [L.pool[3]], null, {}, seeded(2));
    ok(r.bonus && r.target === L.pool[3] && r.options.some(o => o.label === L.pool[3]), 'bonus round has the answer');
    let st = {}; st = recordAttempt(st, `sound:${L.pool[4]}`, false, 'd1');
    for (const p of L.pool) if (p !== L.pool[4]) for (const d of ['d1', 'd1', 'd2']) st = recordAttempt(st, `sound:${p}`, true, d);
    eq(bonusTarget(L, [], null, st, seeded(1)), L.pool[4], 'nothing missed: the item still being learned');
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
