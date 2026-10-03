// Word Path (lab) — ported from the Claude Design "Word Path v2" file.
// Preact + htm, vendored (see vendor/README.md): no build step, edit and reload.
import { h, html, render, Component } from './vendor/preact-htm.module.js';
import { LEVELS, STAGES, GRAPHEMES, picSrc, coverage, heartParts } from './content.js?v=dev';
import { LV, layoutFor, stagePos, stagePath, gsnd, nsnd, showG, prompt as speechFor, soundOutParts, buildRounds, isRight,
  unlocked, nextLevel, stageComplete, mapStageFor, doneFromIds, idsFromDone, idsFromV2,
  itemKey, recordAttempt, today, masteredIn, levelItems, isMastered, modelAfter, modelParts, praiseParts, shouldPractiseAgain, bonusRound,
  sayId, missParts, finishParts, heroParts, TRY_AGAIN, BONUS, LOCKED, gateQuestion, gateOk,
  SESSION_CHOICES, sessionOver, progressReport, revealFor, codecOffset } from './engine.js?v=dev';
import { SCRIPT, levelSpeech } from './script.js?v=dev';

// Gameplay settings (were the editor props in Claude Design)
const CONFIG = {
  thinkTime: 2.5,   // seconds to wait after a right answer before the next round
  rounds: 8,        // rounds per level
  unlockAll: false  // teacher mode: every level open
};

// Test mode: add ?test to the address. Nothing is saved, every level is open, and a test panel shows.
// Options (combine with &): level=1-38, screen=map|play|done|stickers|settings|gate|report|about, done=N (first N
// levels finished), rounds=N, think=seconds, mute (no voice; spoken lines still show as captions), demo (sample
// progress for the report: 9 levels finished, some items known, some missed). See TESTING.md.
const Q = new URLSearchParams(location.search);
const TEST = Q.has('test');
const num = (k, lo, hi) => { const n = parseInt(Q.get(k), 10); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : null; };
const T = TEST ? {
  level: num('level', 1, LEVELS.length), screen: Q.get('screen'), done: num('done', 0, LEVELS.length),
  session: Q.has('session') ? Math.max(0, parseFloat(Q.get('session')) || 0) : null,
  rounds: num('rounds', 1, 20), think: Q.has('think') ? Math.max(0, parseFloat(Q.get('think')) || 0) : null, mute: Q.has('mute'),
  demo: Q.has('demo')
} : null;
// Sample progress for ?test&demo: levels 1–9 finished; items alternate between known, still learning and often missed
function demoMastery() {
  let st = {};
  LV.slice(0, 10).forEach((L, li) => levelItems(L).forEach((k, i) => {
    const pattern = [[1, 1, 1], [1, 0, 1], [0, 0, 1], [1, 1, 0, 1]][(i + li) % 4];
    pattern.forEach((ok, j) => { st = recordAttempt(st, k, ok, today(new Date(2026, 8, 20 + li + j))); });
  }));
  return st;
}
if (TEST) {
  CONFIG.unlockAll = true;
  if (T.rounds) CONFIG.rounds = T.rounds;
  if (T.think !== null) CONFIG.thinkTime = T.think;
}

const PAL = [
  { bg:'#F2544A', sh:'#C83A31', fg:'#fff' }, { bg:'#FFC23C', sh:'#DB9A0A', fg:'#2A2350' },
  { bg:'#2EC4A6', sh:'#17977F', fg:'#2A2350' }, { bg:'#7B61FF', sh:'#5940D6', fg:'#fff' }, { bg:'#4DB3FF', sh:'#2188D6', fg:'#2A2350' }
];
// Own storage keys so the lab never touches progress saved by the class version (same github.io origin)
const KEY = 'wordpath-lab.v3';  // v3: finished level ids. v2 (true/false by position) is migrated once
const KEY_V2 = 'wordpath-lab.v2';
const AKEY = 'wordpath-lab.audio';
const MKEY = 'wordpath-lab.mastery.v1';  // first-try attempts per word and sound (see MASTERY_RULE in engine.js)

class App extends Component {
  sid = 0; run = 0; tms = []; voices = []; spoken = [];
  recorded = new Set(); compressed = new Set(); clipSources = {}; buffers = {}; actx = null; curSrc = null; playedClips = [];  // recorded clips (audio/manifest.json)

  state = { screen:'map', mapStage:null, lvl:0, round:0, rounds:[], wrong:[], solved:false, sorted:[[],[]], binWrong:null, done:this.load(), mastery:this.loadMastery(), answered:false, misses:0, modelled:false, firstTries:[], missed:[], cue:null, settings:false, audio:this.loadAudio(), vtick:0, ctick:0, panel:true, vw: window.innerWidth, vh: window.innerHeight };

  // In test mode nothing is read from or written to storage
  load() {
    if (TEST) return Array.from({ length: LV.length }, (_, i) => i < (T.demo ? 9 : T.done || 0));
    try {
      const ids = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(ids)) return doneFromIds(ids);
      const v2 = idsFromV2(JSON.parse(localStorage.getItem(KEY_V2)));
      if (v2.length) { localStorage.setItem(KEY, JSON.stringify(v2)); return doneFromIds(v2); }
    } catch (e) {}
    return Array(LV.length).fill(false);
  }
  loadAudio() {
    if (!TEST) try { const a = JSON.parse(localStorage.getItem(AKEY)); if (a) return { voice: a.voice || '', vol: a.vol ?? 0.6, rate: a.rate ?? 0.85, session: a.session ?? 15 }; } catch (e) {}
    return { voice:'', vol:0.6, rate:0.85, session: TEST && T.session !== null ? T.session : 15 };
  }
  loadMastery() {
    if (TEST && T.demo) return demoMastery();
    if (!TEST) try { const m = JSON.parse(localStorage.getItem(MKEY)); if (m && typeof m === 'object') return m; } catch (e) {}
    return {};
  }
  // Only the first tap of each round counts towards mastery; guesses after a miss don't
  record(L, r, ok) {
    this.justMastered = false;
    if (this.state.answered) return;
    const key = itemKey(L, r), before = isMastered(this.state.mastery[key]);
    const mastery = recordAttempt(this.state.mastery, key, ok, TEST && Q.get('day') ? Q.get('day') : today());
    this.justMastered = ok && !before && isMastered(mastery[key]);
    if (!TEST) try { localStorage.setItem(MKEY, JSON.stringify(mastery)); } catch (e) {}
    const target = r.target?.w ?? r.target ?? r.w;  // missed items come back in bonus rounds
    this.setState(s => ({ mastery, answered: true, firstTries: s.firstTries.concat(!!ok), missed: ok ? s.missed : s.missed.concat(target) }));
  }
  save(done) { if (!TEST) try { localStorage.setItem(KEY, JSON.stringify(idsFromDone(done))); } catch (e) {} }
  setAudio(patch) {
    const audio = { ...this.state.audio, ...patch };
    if (!TEST) try { localStorage.setItem(AKEY, JSON.stringify(audio)); } catch (e) {}
    this.setState({ audio });
  }

  componentDidMount() {
    this.onResize = () => this.setState({ vw: window.innerWidth, vh: window.innerHeight });
    window.addEventListener('resize', this.onResize);
    if (TEST) this.initTest();
    this.loadManifest();
    // Safari (iPad/iPhone) only allows sound after a tap, so start the audio engine on taps and keys. Safari counts
    // some events (touchend, click) but not always others, so listen to all of them. Keep listening: iOS can pause
    // the engine again later (after the voice speaks, or when the app is in the background), and a tap restarts it.
    const unlock = () => { const c = this.audioCtx(); if (c && c.state === 'running' && !this.preloaded) { this.preloaded = true; this.preload(); } };
    ['pointerdown', 'touchend', 'click', 'keydown'].forEach(e => document.addEventListener(e, unlock, true));
    this.onVisible = () => { if (document.visibilityState === 'visible' && this.actx) this.audioCtx(); };
    document.addEventListener('visibilitychange', this.onVisible);
    const ss = window.speechSynthesis; if (!ss) return;
    const pick = () => { this.voices = ss.getVoices().filter(v => /^en/i.test(v.lang)); this.setState(s => ({ vtick: s.vtick + 1 })); };
    pick(); ss.onvoiceschanged = pick;
  }

  initTest() {
    const lv = T.level ? T.level - 1 : 0, sc = T.screen || (T.level ? 'play' : 'map');
    if (sc === 'play') this.start(lv);
    else if (sc === 'done') this.setState({ screen:'done', lvl: lv });
    else if (sc === 'stickers') this.setState({ screen:'stickers' });
    else if (sc === 'settings') this.setState({ settings:true });
    else if (sc === 'gate') this.openSettings();
    else if (sc === 'about') this.setState({ screen:'about' });
    else if (sc === 'report') this.setState({ screen:'report' });
    // Hook for the automated checks in tests/ and for poking around in the browser console
    window.wp = {
      state: () => {
        const s = this.state, L = LV[s.lvl], r = s.rounds[s.round];
        return { screen: s.screen, level: L.n, stage: L.stage + 1, type: L.type, kind: L.kind, mode: L.mode, ask: L.ask, round: s.round, rounds: s.rounds.length, solved: s.solved,
          target: r ? (r.target?.w ?? r.target ?? r.w) : null, review: !!(r && r.review), bonus: !!(r && r.bonus), missed: s.missed.slice(), modelled: s.modelled, misses: s.misses, firstTries: s.firstTries.slice(), options: r && r.options ? r.options.map(o => o.w ?? o.label) : null, mapStage: this.mapStage(), settings: s.settings, done: s.done.slice() };
      },
      right: () => this.answer(true),
      wrong: () => this.answer(false),
      start: n => this.start(n - 1),
      go: screen => { this.stop(); this.setState({ screen, settings:false }); },
      setDone: n => this.setState({ done: Array.from({ length: LV.length }, (_, i) => i < n), mapStage: null }),
      levels: () => LV.map(l => ({ n: l.n, stage: l.stage + 1, type: l.type, title: l.title, sticker: l.sticker.name })),
      spoken: () => this.spoken.map(x => x.t),
      spokenDetail: () => this.spoken.map(({ t, clip, src }) => ({ t, clip, src })),
      recorded: () => [...this.recorded],
      audioState: () => this.actx ? this.actx.state : 'not started',
      layout: () => layoutFor(this.state.vw, this.state.vh),
      mastery: () => JSON.parse(JSON.stringify(this.state.mastery)),
      masteredIn: n => masteredIn(LV[n - 1], this.state.mastery),
      played: () => this.playedClips.slice(),
      loadedClips: () => Object.keys(this.buffers),
      clipSources: () => ({ ...this.clipSources }),  // id -> 'm4a' or 'wav', for clips decoded so far
      // Starts loading recordings as a first tap would (a scripted tap doesn't count as one in Safari)
      preloadNow: () => { this.preloaded = true; this.preload(); },
      // Simulates iOS refusing to start sound (no tap yet, or interrupted), to check the voice fallback
      blockAudio: () => { this.audioBlocked = true; return 'blocked'; },
      report: () => progressReport(this.state.done, this.state.mastery),
      reveal: () => { const el = document.querySelector('.reveal'); return el && { text: el.innerText.replace(/\s+/g, ' ').trim(), on: [...el.querySelectorAll('.on')].map(x => x.textContent) }; },
      gate: () => this.state.gate && { answer: this.state.gate.q.answer, typed: this.state.gate.typed, wrong: this.state.gate.wrong },
      replay: () => { const L = LV[this.state.lvl], r = this.state.rounds[this.state.round]; if (r) this.speak(this.prompt(L, r, false)); },
      clearSpoken: () => { this.spoken = []; }
    };
  }

  // Test helper: answer the current round right or wrong, the same way a tap would
  answer(correct) {
    const { screen, lvl, rounds, round, wrong } = this.state; if (screen !== 'play') return false;
    const L = LV[lvl], r = rounds[round]; if (!r) return false;
    if (L.kind === 'sort') return this.pickBin(correct ? r.bin : 1 - r.bin), true;
    const i = r.options.findIndex((o, k) => isRight(L, r, o) === correct && !wrong.includes(k));
    if (i < 0) return false;
    L.kind === 'pop' ? this.pickPop(i) : this.pickMatch(i);
    return true;
  }
  componentWillUnmount() { this.stop(); window.removeEventListener('resize', this.onResize); document.removeEventListener('visibilitychange', this.onVisible); }

  // Catherine (Australian English, on Apple devices) first: in testing she was the clearest on short words (see
  // DECISIONS.md). Then other built-in voices: online voices (e.g. Chrome's "Google US English" on a Mac) can clip
  // the start of short words. A voice picked in Grown-up settings always wins.
  bestVoice() {
    const vs = this.voices, chosen = vs.find(v => v.name === this.state.audio.voice);
    if (chosen) return chosen;
    const preferred = vs.find(v => /^Catherine/i.test(v.name) && /en[-_]AU/i.test(v.lang)) || vs.find(v => /^Catherine/i.test(v.name));
    if (preferred) return preferred;
    const us = vs.filter(v => /en[-_]US/i.test(v.lang));
    const local = us.filter(v => v.localService), online = us.filter(v => !v.localService);
    const prefs = [/Samantha/i, /Ava/i, /Allison/i, /Zoe/i, /Natural/i, /Google US English/i];
    for (const group of [local, online, vs]) for (const p of prefs) { const v = group.find(x => p.test(x.name)); if (v) return v; }
    return local[0] || us[0] || vs[0] || null;
  }

  // ---- recorded clips ----
  async loadManifest() {
    try {
      const m = await (await fetch('audio/manifest.json', { cache: 'no-cache' })).json();
      this.recorded = new Set(m.clips || []);
      this.compressed = new Set(m.m4a || []);  // clips with a small .m4a copy (tools/import_audio.py)
    } catch (e) { this.recorded = new Set(); }
    this.setState(s => ({ vtick: s.vtick + 1 }));
  }
  audioCtx() {
    if (!this.actx) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      this.actx = new C();
      const b = this.actx.createBuffer(1, 1, 22050), src = this.actx.createBufferSource();  // a silent blip unlocks iOS
      src.buffer = b; src.connect(this.actx.destination); src.start(0);
    }
    // 'suspended' (not started yet, or backgrounded) and 'interrupted' (iOS, e.g. after the voice spoke) both need a resume
    if (this.actx.state !== 'running' && this.actx.state !== 'closed') this.actx.resume().catch(() => {});
    return this.actx;
  }
  // Make sure sound is actually running before playing a recording; wait briefly if it's starting up.
  // Returns false if it still isn't, so the caller can use the browser voice instead of playing into silence.
  async audioReady() {
    const c = this.audioCtx(); if (!c) return false;
    if (TEST && this.audioBlocked) return false;  // test hook: behave as if iOS refused to start sound
    for (let i = 0; i < 8 && c.state !== 'running'; i++) { c.resume().catch(() => {}); await new Promise(r => setTimeout(r, 75)); }
    return c.state === 'running';
  }
  // Recordings load in two steps so a phone never downloads all 27 MB: letter sounds and the instruction lines
  // when sound first starts, then each level's words and lines when it starts (and the level already open, if any)
  preload() {
    const lines = new Set(SCRIPT.filter(c => c.kind === 'line').map(c => c.id));
    this.recorded.forEach(id => { if (!/^(word|say)-/.test(id) || lines.has(id)) this.clipBuffer(id); });
    if (this.state.screen === 'play') this.preloadLevel(LV[this.state.lvl]);
  }
  preloadLevel(L) {
    if (!this.preloaded) return;
    for (const parts of levelSpeech(L)) for (const p of parts) {
      const id = typeof p === 'string' ? sayId(p) : p && p.clip;
      if (id && this.recorded.has(id)) this.clipBuffer(id);
    }
  }
  clipBuffer(id) {
    if (!id || !this.recorded.has(id)) return null;
    const c = this.audioCtx(); if (!c) return null;
    // The small .m4a copy first; the .wav master if there isn't one or this browser can't decode it
    const load = ext => fetch(`audio/${id}.${ext}`).then(r => r.ok ? r.arrayBuffer() : Promise.reject())
      .then(b => new Promise((ok, no) => c.decodeAudioData(b, ok, no))).then(buf => {
        this.clipSources[id] = ext;
        buf.skip = ext === 'm4a' ? codecOffset(buf.getChannelData(0), buf.sampleRate) : 0;  // codec padding, if this browser keeps it
        return buf;
      });
    if (!this.buffers[id]) this.buffers[id] = (this.compressed.has(id) ? load('m4a').catch(() => load('wav')) : load('wav')).catch(() => null);
    return this.buffers[id];
  }
  playClip(buf) {
    return new Promise(res => {
      const c = this.actx, src = c.createBufferSource(), g = c.createGain();
      g.gain.value = this.state.audio.vol;  // same volume setting as the browser voice
      src.buffer = buf; src.connect(g); g.connect(c.destination);
      const done = () => { clearTimeout(fb); if (this.curSrc === src) this.curSrc = null; res(); };
      const fb = setTimeout(done, (buf.duration - (buf.skip || 0)) * 1000 + 500);
      src.onended = done; this.curSrc = src; src.start(0, buf.skip || 0);
      if (TEST) this.playedClips.push({ dur: +buf.duration.toFixed(2), state: c.state });
    });
  }

  wait(ms) { return new Promise(r => { this.tms.push(setTimeout(r, ms)); }); }
  stop() {
    this.run++; this.sid++;
    this.tms.forEach(clearTimeout); this.tms = [];
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (this.curSrc) try { this.curSrc.stop(); } catch (e) {}
  }
  utter(o) {
    return new Promise(res => {
      const { vol, rate } = this.state.audio, v = this.bestVoice();
      const u = new SpeechSynthesisUtterance(o.t);
      u.lang = 'en-US'; if (v) u.voice = v;
      u.rate = Math.max(0.3, (o.rate ?? 1) * rate); u.pitch = 1.1; u.volume = vol;
      const fb = setTimeout(res, 3000 + o.t.length * 300);
      u.onend = u.onerror = () => { clearTimeout(fb); res(); };
      window.speechSynthesis.speak(u);
    });
  }
  // parts: strings, {t, rate}, or numbers (pause in ms)
  async speak(parts) {
    const id = ++this.sid, ss = window.speechSynthesis, mute = TEST && T.mute;
    if (!ss && !mute) return false;
    if (ss) ss.cancel();
    await this.wait(mute ? 0 : 80);
    for (const p of parts) {
      if (id !== this.sid) return false;
      if (typeof p === 'number') { if (!mute) await this.wait(p); continue; }
      const o = typeof p === 'string' ? { t: p, clip: sayId(p) } : p;  // a plain line has a recording slot named after its text
      const rec = o.clip && this.recorded.has(o.clip);
      if (mute) { if (TEST) this.caption(o.t, o.clip, o.clip ? (rec ? 'recording' : 'voice') : null); if (o.cue !== undefined) this.setState({ cue: o.cue }); await this.wait(0); continue; }
      // A recording only plays if sound is running; otherwise the browser voice says it, so there's never silence
      const buf = rec && await this.audioReady() ? await this.clipBuffer(o.clip) : null;
      if (id !== this.sid) return false;
      if (TEST) this.caption(o.t, o.clip, o.clip ? (buf ? 'recording' : rec ? 'fallback' : 'voice') : null);
      if (o.cue !== undefined) this.setState({ cue: o.cue });  // lights up the letters for this sound (revealFor)
      if (buf) await this.playClip(buf); else if (ss) await this.utter(o);
    }
    return id === this.sid;
  }
  caption(t, clip, src) {
    this.spoken.push({ t, clip, src, at: Date.now() });
    if (this.spoken.length > 200) this.spoken.shift();
    this.setState(s => ({ ctick: s.ctick + 1 }));
  }
  // a speech sound: plays the recording if there is one, otherwise the browser voice says the fallback text
  snd(pair, clip) { return { t: pair[0], rate: pair[1], clip }; }

  // Grown-up gate: a sum before Settings opens; once answered it stays open until the page reloads
  openSettings() {
    if (this.grownUp) return this.setState({ settings: true });
    this.setState({ gate: { q: gateQuestion(), typed: '', wrong: false } });
  }
  // Each key builds on the latest state, so quick taps never drop a digit
  gateKey(k) {
    this.setState(({ gate: g }) => {
      if (!g) return null;
      if (k === 'del') return { gate: { ...g, typed: g.typed.slice(0, -1) } };
      if (k !== 'ok') return g.typed.length < 3 ? { gate: { ...g, typed: g.typed + k, wrong: false } } : null;
      if (gateOk(g.q, g.typed)) { this.grownUp = true; return { gate: null, settings: true }; }
      return { gate: { q: gateQuestion(), typed: '', wrong: true } };  // a new sum, so guessing doesn't pay
    });
  }

  // The teacher report: one screen, laid out to screenshot (see progressReport in engine.js)
  reportView() {
    const r = progressReport(this.state.done, this.state.mastery);
    const day = d => { if (!d) return ''; const [y, m, dd] = d.split('-').map(Number); return new Date(y, m - 1, dd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
    const pct = (a, b) => b ? `${Math.round(100 * a / b)}%` : '–';
    let stage = 0;
    return {
      date: day(today()), last: day(r.last),
      stats: [
        { big: `${r.finished}/${r.levelCount}`, label: 'levels finished' },
        { big: `${r.known}`, label: r.practised ? `known, of ${r.practised} practised` : 'words and sounds known' },
        { big: pct(r.right, r.tries), label: 'right first time (recent)' },
        { big: r.last ? day(r.last) : '–', label: 'last played' }
      ],
      practice: r.practice.map(p => ({ text: p.text, kind: p.kindName, score: `${p.right}/${p.tries}` })), morePractice: r.morePractice,
      levels: r.levels.map(l => ({ ...l, stageHead: l.stage !== stage && (stage = l.stage), knownPct: `${Math.round(100 * l.known / l.total)}%`,
        firstTry: pct(l.right, l.tries), lastDay: day(l.last) })),
      empty: !r.levels.length
    };
  }

  unlocked(i) { return unlocked(i, this.state.done, CONFIG.unlockAll); }
  build(L) { return buildRounds(L, CONFIG.rounds, Math.random, this.state.mastery); }
  prompt(L, r, first, n = this.state.round) { return speechFor(L, r, first, n); }
  mapStage() { return mapStageFor(this.state.done, this.state.mapStage); }

  start(i) {
    if (i < 0 || i >= LV.length) return;
    if (this.sessionStart == null) this.sessionStart = Date.now();  // the session starts with the first level played
    if (!this.unlocked(i)) { this.speak([LOCKED]); return; }
    this.stop();
    const L = LV[i], rounds = this.build(L);
    this.preloadLevel(L);
    this.setState({ screen:'play', lvl:i, mapStage:null, round:0, rounds, wrong:[], solved:false, sorted:[[],[]], binWrong:null, answered:false, misses:0, modelled:false, firstTries:[], missed:[], cue:null });
    this.speak(this.prompt(L, rounds[0], true));
  }

  next() {
    const { round, rounds, lvl } = this.state, L = LV[lvl];
    if (round + 1 >= rounds.length) {
      const done = this.state.done.slice(); done[lvl] = true; this.save(done);
      const stageDone = stageComplete(L.stage, done);
      this.setState({ screen:'done', done });
      const again = shouldPractiseAgain(this.state.firstTries);
      const rest = sessionOver(this.sessionStart, Date.now(), this.state.audio.session);
      this.setState({ restTime: rest });
      this.speak(finishParts(L, { stageDone, rest, again }));
      return;
    }
    // A bonus round is filled now, from what was missed in this play
    let upcoming = rounds[round + 1], list = rounds;
    if (upcoming.bonus) {
      const prev = rounds[round].target?.w ?? rounds[round].target;
      upcoming = bonusRound(L, this.state.missed, prev, this.state.mastery);
      list = rounds.slice(); list[round + 1] = upcoming;
    }
    this.setState({ round: round + 1, rounds: list, wrong:[], solved:false, binWrong:null, answered:false, misses:0, modelled:false, cue:null });
    this.speak([...(upcoming.bonus && !rounds[round].bonus ? [BONUS, 500] : []), ...this.prompt(L, upcoming, false, round + 1)]);
  }

  // Count a miss; after enough misses, show and say the answer instead of letting guessing win
  miss(L, r, said) {
    const misses = this.state.misses + 1, model = misses >= modelAfter(L);
    this.setState({ misses, modelled: this.state.modelled || model });
    this.speak(model ? [...said, 600, ...modelParts(L, r)] : [...said, 600, TRY_AGAIN, 700, ...this.prompt(L, r, false)]);
  }
  praise(L, r) { return praiseParts(L, r, { modelled: this.state.modelled, mastered: this.justMastered, n: this.state.round }); }

  async win(say) {
    const run = this.run;
    this.setState({ solved:true });
    await this.speak(say);
    await this.wait(CONFIG.thinkTime * 1000);
    if (run === this.run && this.state.solved) this.next();
  }

  pickPop(i) {
    const { rounds, round, solved, lvl, wrong } = this.state; if (solved || wrong.includes(i)) return;
    const L = LV[lvl], r = rounds[round], o = r.options[i];
    this.record(L, r, isRight(L, r, o));
    if (isRight(L, r, o)) return this.win(this.praise(L, r));
    this.setState(s => ({ wrong: s.wrong.concat(i) }));
    this.miss(L, r, missParts(L, r, o));
  }

  pickMatch(i) {
    const { rounds, round, solved, lvl, wrong } = this.state; if (solved || wrong.includes(i)) return;
    const L = LV[lvl], r = rounds[round], o = r.options[i];
    this.record(L, r, isRight(L, r, o));
    if (isRight(L, r, o)) return this.win(this.praise(L, r));
    this.setState(s => ({ wrong: s.wrong.concat(i) }));
    this.miss(L, r, missParts(L, r, o));
  }

  pickBin(b) {
    const { rounds, round, solved, lvl } = this.state; if (solved) return;
    const L = LV[lvl], item = rounds[round];
    this.record(L, item, isRight(L, item, b));
    if (isRight(L, item, b)) {
      this.setState(s => { const sorted = [s.sorted[0].slice(), s.sorted[1].slice()]; sorted[b].push(item); return { sorted, binWrong:null }; });
      return this.win(this.praise(L, item));
    }
    this.setState({ binWrong: b });
    this.miss(L, item, missParts(L, item, b));
  }

  // Says each sound in the word, slowly, but not the word itself: the child does the blending
  soundOut() {
    const r = this.state.rounds[this.state.round]; if (!r || !r.target?.w) return;
    this.speak(soundOutParts(r.target.w));
  }

  popField(L) {
    const { rounds, round, wrong, solved } = this.state, r = rounds[round]; if (!r) return null;
    const { vw, vh } = this.state, layout = layoutFor(vw, vh), n = r.options.length;
    const cols = layout === 'phone' || layout === 'tablet-portrait' ? 2 : n;
    const rows = Math.ceil(n / cols), avail = Math.min(vw, 1160) - (layout === 'phone' ? 32 : layout === 'phone-landscape' ? 32 + 108 : 56);
    const size = Math.round(Math.max(96, Math.min(L.mode === 'word' ? 230 : 200, avail / cols - 28, (vh - (layout === 'phone' ? 260 : layout === 'phone-landscape' ? 110 : 300)) / rows - 28)));
    const field = { position:'relative', flex:1, minHeight: layout === 'phone-landscape' ? 0 : 320, display:'grid', gridTemplateColumns:`repeat(${cols}, ${size}px)`, alignContent:'center', justifyContent:'space-evenly', justifyItems:'center', gap:24, padding:'24px 16px', overflow:'hidden', borderRadius: layout === 'phone' ? 32 : 40, background:'#D9F0FF' };
    return h('div', { style: field },
      r.options.map((o, i) => {
        const right = solved && o.label === r.target, bad = wrong.includes(i), c = PAL[(i + round) % PAL.length];
        const shown = this.state.modelled && !solved && o.label === r.target;
        const anim = right ? 'wpPop .6s cubic-bezier(.34,1.56,.64,1) forwards'
          : bad ? 'wpShake .5s ease-in-out'
          : shown ? 'wpGlow 1s ease-in-out infinite alternate'
          : `wpBob ${o.dur}s ease-in-out ${o.bob}s infinite alternate`;
        const sparks = right ? [0,1,2,3,4,5,6,7].map(k => {
          const a = k / 8 * Math.PI * 2;
          return h('span', { key:'s' + k, style: { position:'absolute', left:'50%', top:'50%', width:18, height:18, margin:-9, borderRadius:'50%', background: PAL[k % 5].bg, '--dx': `${Math.round(Math.cos(a) * 130)}px`, '--dy': `${Math.round(Math.sin(a) * 130)}px`, animation:'wpSpark .7s cubic-bezier(.22,1,.36,1) forwards' } });
        }) : [];
        return h('div', { key: `${round}-${i}`, style: { position:'relative', width:size, height:size, animation:`wpIn 1.1s cubic-bezier(.22,1,.36,1) ${(i * 0.14).toFixed(2)}s both` } },
          right && h('span', { style: { position:'absolute', inset:0, borderRadius:'50%', border:`8px solid ${c.bg}`, animation:'wpRing .6s ease-out forwards' } }),
          L.mode === 'word' && !right && heartParts(o.label).some(p => p.tricky) && h('span', { className: 'heart-badge', 'aria-hidden': 'true', style: { opacity: bad ? 0.3 : 1 } }, '♥'),
          ...sparks,
          h('button', {
            key: bad ? 'bad' : 'ok',
            onClick: () => this.pickPop(i),
            'aria-label': o.label,
            style: {
              width:'100%', height:'100%', borderRadius:'50%', border:'7px solid #fff', cursor: bad ? 'default' : 'pointer',
              background: bad ? '#E6E1EE' : c.bg, color: bad ? '#9A93AE' : c.fg, boxShadow:`0 9px 0 ${bad ? '#CFC8DB' : c.sh}${shown ? ', 0 0 0 10px #FFC23C' : ''}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:"'Fredoka',system-ui,sans-serif", fontWeight:700, fontSize: Math.round(size * (L.mode === 'word' ? (o.label.length > 6 ? 0.17 : 0.23) : (o.label.length > 2 || L.mode === 'name' ? 0.38 : 0.5))),
              animation: anim
            }
          }, L.mode === 'name' ? o.label.toUpperCase() + o.label
            : L.mode === 'word' ? h('span', null, heartParts(o.label).map((p, k) => p.tricky ? h('span', { key: k, className: 'tricky' }, p.t) : p.t))  // tricky letters underlined
            : showG(o.label)));
      }));
  }

  renderVals() {
    const { screen, lvl, round, rounds, wrong, solved, sorted, binWrong, done, audio } = this.state;
    const L = LV[lvl], r = rounds[round], P = PAL;
    const nextIdx = nextLevel(done);
    const goMap = () => { this.stop(); this.setState({ screen:'map', mapStage:null }); };
    const goStickers = () => { this.stop(); this.setState({ screen:'stickers' }); };
    const isPlay = screen === 'play';

    // Map: one stage at a time
    const ms = this.mapStage(), st = STAGES[ms];
    const layout = layoutFor(this.state.vw, this.state.vh), down = layout === 'phone' || layout === 'tablet-portrait', phone = layout === 'phone';
    const idxs = LV.map((l, i) => i).filter(i => LV[i].stage === ms), pos = stagePos(idxs.length, down, phone);
    const nodes = idxs.map((i, k) => {
      const l = LV[i], isDone = done[i], open = this.unlocked(i), cur = i === nextIdx, c = P[i % 5], [x, y] = pos[k];
      return {
        num: l.n, title: l.title, aria: `Level ${l.n}: ${l.title}`, left: x + '%', top: y + '%',
        size: phone ? (cur ? 92 : 76) : layout === 'phone-landscape' ? (cur ? 84 : 70) : (cur ? 112 : 92),
        icon: isDone ? 'icon-check' : !open ? 'icon-lock' : cur ? 'icon-play' : '',
        img: open && !isDone && !cur ? l.sticker.src : '',
        iconColor: isDone ? '#17977F' : open ? '#5940D6' : '#9A93AE',
        bg: open ? c.bg : '#E6E1EE', sh: open ? c.sh : '#CFC8DB', fg: open ? c.fg : '#9A93AE',
        opacity: open ? 1 : 0.6, cursor: open ? 'pointer' : 'not-allowed',
        onClick: () => this.start(i)
      };
    });

    const matchOptions = isPlay && L.kind === 'match' && r ? r.options.map((o, i) => {
      const right = solved && o.w === r.target.w, bad = wrong.includes(i), c = P[(i * 2 + round) % 5];
      const shown = this.state.modelled && !solved && o.w === r.target.w;
      // Rhyme time shows the word under each picture; blend and read levels don't, since the word is the answer
      return { pic: picSrc(o.w), word: L.mode === 'rhyme' ? o.w : '', bg: right ? '#2EC4A6' : '#fff', fg: right ? '#fff' : c.sh, sh: right ? '#17977F' : '#E8DCC8',
        opacity: bad ? 0.35 : 1, transform: right ? 'scale(1.08) rotate(-2deg)' : 'scale(1)', shown, onClick: () => this.pickMatch(i) };
    }) : [];

    const binC = [P[0], P[3]];
    const bins = isPlay && L.kind === 'sort' ? L.bins.map((b, k) => ({
      label: showG(b), anchor: picSrc(GRAPHEMES[b].ex), aria: L.ask === 'has' ? `Has ${b}` : `Starts with ${b}`, order: k === 0 ? 0 : 2,
      bg: binC[k].bg, sh: binC[k].sh, transform: binWrong === k ? 'scale(.96)' : 'scale(1)', shown: this.state.modelled && !solved && r && r.bin === k,
      items: sorted[k].map(x => ({ pic: picSrc(x.w) })), onClick: () => this.pickBin(k)
    })) : [];

    const dl = LV[lvl], dc = P[lvl % 5];
    const doneSticker = screen === 'done' ? h('div', { key: 'st' + lvl, className: 'done-sticker', style: { flexShrink:0, borderRadius:'50%', border:'10px solid #fff', background:dc.bg, boxShadow:`0 10px 0 ${dc.sh}`, display:'flex', alignItems:'center', justifyContent:'center', animation:'wpSticker .8s cubic-bezier(.34,1.56,.64,1) both' } },
      h('img', { src: dl.sticker.src, alt: '', style: { width:'56%', height:'56%' } })) : null;
    const stageDone = stageComplete(dl.stage, done);

    const voiceOpts = [{ name:'', label:'Automatic (best available)' }].concat(this.voices.map(v => ({ name: v.name, label: `${v.name} (${v.lang})` })));

    return {
      goMap, goStickers,
      stickerCount: done.filter(Boolean).length, stickerTotal: LV.length,
      isMap: screen === 'map', isPlay, isDone: screen === 'done', isStickers: screen === 'stickers', isAbout: screen === 'about', isReport: screen === 'report', report: screen === 'report' ? this.reportView() : null,
      openAbout: () => { this.stop(); this.setState({ screen:'about', settings:false }); },
      openReport: () => { this.stop(); this.setState({ screen:'report', settings:false }); },
      backToSettings: () => this.setState({ screen:'map', settings:true }),
      heroTitle: nextIdx < 0 ? 'You finished every level!' : `Level ${nextIdx + 1}: ${LV[nextIdx].title}`,
      hasNext: nextIdx >= 0,
      heroPlay: () => this.start(nextIdx),
      heroHear: () => this.speak(heroParts(nextIdx)),
      nodes, mapPath: stagePath(pos, down), layout, mapDown: down,
      stageTitle: st.title, stageSounds: st.sounds.split(' ').map(showG).join(' '), stageNum: ms + 1, stageCount: STAGES.length,
      stageDoneCount: idxs.filter(i => done[i]).length, stageLevelCount: idxs.length,
      canPrev: ms > 0, canNext: ms < STAGES.length - 1,
      prevStage: () => this.setState({ mapStage: ms - 1 }), nextStage: () => this.setState({ mapStage: ms + 1 }),
      levelNum: L.n, levelTitle: L.title, roundNum: Math.min(round + 1, rounds.length), roundCount: rounds.length, isBonus: !!(r && r.bonus),
      reveal: isPlay && solved && r ? (rv => rv && { pic: rv.pic ? picSrc(rv.pic) : '', words: rv.words.map(segs => segs.map(x =>
        ({ t: x.t, heart: !!x.heart, on: x.on || this.state.cue === 'all' || (x.k !== null && x.k === this.state.cue) })) ) })(revealFor(L, r)) : null,
      progress: rounds.map((_, k) => ({ color: k < round || (k === round && solved) ? '#FFC23C' : '#E6E1EE' })),
      replay: () => r && this.speak(this.prompt(L, r, false)),
      soundOut: () => this.soundOut(),
      isPop: isPlay && L.kind === 'pop', isMatch: isPlay && L.kind === 'match', isSort: isPlay && L.kind === 'sort',
      isRead: isPlay && L.mode === 'read',
      readWord: isPlay && L.mode === 'read' && r ? r.target.w : '',
      popField: isPlay && L.kind === 'pop' ? this.popField(L) : null,
      matchOptions, bins,
      sortPic: isPlay && L.kind === 'sort' && r ? picSrc(r.w) : '',
      sortAsk: L.ask === 'has' ? 'Does it have…' : 'Does it start with…',  // the same words as the spoken question
      sortTransform: solved ? 'scale(1.1) rotate(-4deg)' : 'scale(1)',
      doneSticker, doneName: dl.sticker.name,
      doneKnown: (() => {
        const n = masteredIn(dl, this.state.mastery).length, of = levelItems(dl).length;
        const what = dl.kind === 'pop' ? (dl.mode === 'word' ? 'words' : dl.mode === 'name' ? 'letter names' : 'sounds') : dl.kind === 'sort' ? 'pictures' : 'words';
        return n ? `You know ${n} of the ${of} ${what} in this level` : '';
      })(),
      doneStage: stageDone ? `You finished stage ${dl.stage + 1}!` : '',
      hasNextAfter: lvl + 1 < LV.length,
      playNext: () => this.start(lvl + 1),
      practiseAgain: screen === 'done' && !this.state.restTime && shouldPractiseAgain(this.state.firstTries),
      restTime: screen === 'done' && !!this.state.restTime,
      sessionMins: audio.session, sessionOpts: SESSION_CHOICES.map(m => ({ value: String(m), label: m ? `${m} minutes` : 'Off' })),
      onSession: e => this.setAudio({ session: parseFloat(e.target.value) }),
      playAgain: () => this.start(lvl),
      stickerGroups: STAGES.map((stg, k) => ({
        title: `${stg.title}: ${stg.sounds.split(' ').map(showG).join(' ')}`,
        doneCount: LV.filter((l, i) => l.stage === k && done[i]).length,
        items: LV.map((l, i) => [l, i]).filter(([l]) => l.stage === k).map(([l, i]) => {
          const c = P[i % 5];
          return { name: done[i] ? l.sticker.name : `Level ${l.n}`, src: done[i] ? l.sticker.src : '', rot: `${[-5, 4, -2, 6, -4][i % 5]}deg`,
            bg: done[i] ? c.bg : '#F1EDF6', fg: done[i] ? c.fg : '#B3ACC4', sh: done[i] ? c.sh : '#DCD5E6' };
        })
      })),
      isSettings: this.state.settings,
      openSettings: () => this.openSettings(),
      gate: this.state.gate,
      gateKey: k => this.gateKey(k),
      closeGate: () => this.setState({ gate: null }),
      closeSettings: () => this.setState({ settings: false }),
      voiceOpts, voiceName: audio.voice,
      vol: audio.vol, volPct: Math.round(audio.vol * 100) + '%',
      rate: audio.rate, rateLabel: audio.rate < 0.8 ? 'slow' : audio.rate > 0.95 ? 'quick' : 'gentle',
      onVoice: e => this.setAudio({ voice: e.target.value }),
      onVol: e => this.setAudio({ vol: parseFloat(e.target.value) }),
      onRate: e => this.setAudio({ rate: parseFloat(e.target.value) }),
      testVoice: () => this.speak([{ t: 'Hi! Let\'s play with letters.' }, 500, { t: 'This letter says' }, 400, gsnd('s')]),  // tests the device voice, so no recordings for the lines
      resetAll: () => { if (window.confirm('Reset all progress and stickers?')) { const d = Array(LV.length).fill(false); this.save(d); if (!TEST) try { localStorage.removeItem(MKEY); } catch (e) {} this.setState({ done: d, mastery: {}, settings: false, mapStage: null }); } }
    };
  }

  coverageNote() {
    const problems = coverage();
    return problems.length
      ? html`<div style="font-size:12px;color:#B0322A;font-weight:600">Content check: ${problems.length} problem${problems.length > 1 ? 's' : ''} (see tests/)</div>`
      : html`<div style="font-size:12px;color:#17977F;font-weight:600">Content check: every letter and sound covered, in order</div>`;
  }

  testPanel() {
    const s = this.state;
    const b = 'height:32px;min-width:32px;padding:0 10px;border:0;border-radius:999px;background:#F3EEFF;color:#2A2350;font-size:14px;font-weight:600;cursor:pointer';
    const on = 'background:#7B61FF;color:#fff';
    const row = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center';
    const label = 'font-size:12px;font-weight:600;color:#5C5677;width:100%;margin-top:4px';
    const goScreen = screen => { this.stop(); this.setState({ screen, settings:false }); };
    const toggle = html`<button onClick=${() => this.setState({ panel: !s.panel })} style="height:32px;padding:0 14px;border:0;border-radius:999px;background:#2A2350;color:#FFC23C;font-size:13px;font-weight:700;letter-spacing:.04em;cursor:pointer">TEST MODE ${s.panel ? '▾' : '▸'}</button>`;
    if (!s.panel) return html`<div style="position:fixed;right:12px;bottom:12px;z-index:20">${toggle}</div>`;
    const doneCount = s.done.filter(Boolean).length;
    return html`
      <div style="position:fixed;right:12px;bottom:12px;z-index:20;width:min(340px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow-y:auto;background:#fff;border-radius:20px;padding:12px;box-shadow:0 6px 24px rgba(42,35,80,.25);display:flex;flex-direction:column;gap:6px;color:#2A2350;font-size:14px">
        <div style="display:flex;justify-content:space-between;align-items:center">${toggle}<a href=${location.pathname} style="font-size:13px">Exit test mode</a></div>
        <div style=${label}>Play a level</div>
        ${STAGES.map((stg, k) => html`<div style=${row}><span style="font-size:12px;font-weight:600;color:#5C5677;width:24px">S${k + 1}</span>${LV.map((l, i) => [l, i]).filter(([l]) => l.stage === k).map(([l, i]) => html`<button title=${l.title} onClick=${() => this.start(i)} style=${b + (s.screen === 'play' && s.lvl === i ? ';' + on : '')}>${l.n}</button>`)}</div>`)}
        ${s.screen === 'play' && html`<div style=${row}>
          <button onClick=${() => this.answer(true)} style=${b}>✓ Answer right</button>
          <button onClick=${() => this.answer(false)} style=${b}>✗ Answer wrong</button>
          <span style="font-size:12px;color:#5C5677">Round ${s.round + 1}/${s.rounds.length} · mastered here ${masteredIn(LV[s.lvl], s.mastery).length}/${levelItems(LV[s.lvl]).length}</span></div>`}
        <div style=${label}>Screens</div>
        <div style=${row}>
          <button onClick=${() => goScreen('map')} style=${b + (s.screen === 'map' ? ';' + on : '')}>Map</button>
          <button onClick=${() => goScreen('stickers')} style=${b + (s.screen === 'stickers' ? ';' + on : '')}>Stickers</button>
          <button onClick=${() => goScreen('about')} style=${b + (s.screen === 'about' ? ';' + on : '')}>About</button>
          <button onClick=${() => this.setState({ settings: true })} style=${b + (s.settings ? ';' + on : '')}>Settings</button>
          <button onClick=${() => goScreen('done')} style=${b + (s.screen === 'done' ? ';' + on : '')}>Level complete</button>
        </div>
        <div style=${label}>Levels finished (changes the map and sticker book)</div>
        <div style=${row}>${[0, ...STAGES.map(stg => stg.first + stg.count)].map(n => html`<button title=${n ? `Stages 1–${LV[n - 1].stage + 1} done` : 'Nothing done'} onClick=${() => this.setState({ done: Array.from({ length: LV.length }, (_, i) => i < n), mapStage: null })} style=${b + (doneCount === n ? ';' + on : '')}>${n}</button>`)}</div>
        ${this.coverageNote()}
        <div style=${label}>Spoken${T.mute ? ' (muted)' : ''} · 🎙 recording, 🤖 browser voice, ⚠️ recording skipped (sound not running) · ${this.recorded.size} recordings · sound: ${this.actx ? this.actx.state : 'not started'}</div>
        <div style="display:flex;flex-direction:column;gap:2px;font-size:13px;line-height:1.35;min-height:20px">
          ${this.spoken.slice(-6).map((x, k, a) => html`<div style=${k === a.length - 1 ? 'font-weight:600' : 'color:#5C5677'}>${x.src ? html`<span title=${x.src === 'recording' ? `Recording: audio/${x.clip}.wav` : x.src === 'fallback' ? `Recording exists but sound wasn't running; browser voice used` : `No recording yet for "${x.clip}"; browser voice`}>${x.src === 'recording' ? '🎙' : x.src === 'fallback' ? '⚠️' : '🤖'} </span>` : ''}“${x.t}”</div>`)}
        </div>
        <div style="font-size:12px;color:#5C5677">Nothing is saved in test mode.</div>
      </div>`;
  }

  render() {
    const v = this.renderVals();
    const pill = 'display:flex;align-items:center;gap:8px;height:52px;padding:0 20px;border:0;border-radius:999px;background:#fff;color:#2A2350;font-size:19px;font-weight:600;cursor:pointer;box-shadow:0 4px 0 #E8DCC8';
    const roundBtn = 'display:flex;align-items:center;justify-content:center;width:52px;height:52px;border:0;border-radius:50%;background:#fff;color:#2A2350;cursor:pointer;box-shadow:0 4px 0 #E8DCC8';
    const softBtn = 'height:80px;padding:0 30px 0 24px;border:0;border-radius:999px;background:#F3EEFF;color:#2A2350;font-size:24px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:12px';

    return html`
<div class=${`app layout-${v.layout}`} style="background:#FFF7EA;color:#2A2350;font-family:'Fredoka',system-ui,sans-serif">
  ${!v.isPlay && html`<header style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 28px">
    <button onClick=${v.goMap} style="display:flex;align-items:center;gap:12px;background:none;border:0;padding:0;cursor:pointer;color:#2A2350">
      <span class="hdr-logo" style="width:52px;height:52px;border-radius:50%;background:#FFC23C;display:flex;align-items:center;justify-content:center;box-shadow:0 5px 0 #DB9A0A"><i class="icon-sparkles" style="font-size:28px;line-height:1;color:#2A2350"></i></span>
      <span class="hdr-text" style="font-weight:700;font-size:30px">Word Path</span>
    </button>
    <div style="display:flex;gap:10px;align-items:center">
      <button class="hv-tint hdr-btn" onClick=${v.goMap} style=${pill}><i class="icon-map" style="font-size:22px;line-height:1"></i><span class="map-label">Map</span></button>
      <button class="hv-tint hdr-btn" onClick=${v.goStickers} style=${pill}><i class="icon-sticker" style="font-size:22px;line-height:1;color:#F2544A"></i><span>${v.stickerCount}/${v.stickerTotal}</span></button>
      <button class="hv-tint hdr-btn hdr-round" onClick=${v.openSettings} aria-label="Grown-up settings" style=${roundBtn}><i class="icon-settings" style="font-size:22px;line-height:1"></i></button>
    </div>
  </header>`}

  <main>

    ${v.isMap && html`
      <section class="map-screen">
        <div class="hero" style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 16px 20px 32px;background:#7B61FF;border-radius:32px;color:#fff;box-shadow:0 7px 0 #5940D6">
          <div style="min-width:0">
            <div style="font-size:17px;font-weight:500;opacity:.9">Next up</div>
            <div class="hero-title" style="font-size:36px;font-weight:700;line-height:1.1;text-wrap:balance">${v.heroTitle}</div>
          </div>
          <div style="display:flex;gap:12px;flex-shrink:0">
            <button class="hv-lift hero-hear" onClick=${v.heroHear} aria-label="Hear it" style="width:76px;height:76px;border:0;border-radius:50%;background:#fff;color:#5940D6;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 5px 0 #4A33B8"><i class="icon-volume-2" style="font-size:34px;line-height:1"></i></button>
            ${v.hasNext && html`
              <button class="hv-lift hero-play" onClick=${v.heroPlay} style="height:76px;padding:0 34px 0 26px;border:0;border-radius:999px;background:#FFC23C;color:#2A2350;font-size:30px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:10px;box-shadow:0 5px 0 #DB9A0A"><i class="icon-play" style="font-size:30px;line-height:1"></i>Play</button>`}
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
          <button class="stage-btn" onClick=${v.prevStage} disabled=${!v.canPrev} aria-label="Previous stage" style=${`width:52px;height:52px;flex-shrink:0;border:0;border-radius:50%;background:#fff;color:#2A2350;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 0 #E8DCC8;opacity:${v.canPrev ? 1 : 0.3}`}><i class="icon-chevron-left" style="font-size:26px;line-height:1"></i></button>
          <div style="text-align:center">
            <div class="stage-name" style="font-size:26px;font-weight:700">${v.stageTitle} <span style="font-weight:500;color:#5C5677;font-size:18px">of ${v.stageCount}</span></div>
            <div class="stage-sub" style="font-size:20px;font-weight:600;color:#5940D6;letter-spacing:.06em">${v.stageSounds}<span class="stage-done" style="font-weight:500;color:#5C5677;font-size:16px;letter-spacing:0"> · ${v.stageDoneCount}/${v.stageLevelCount} done</span></div>
          </div>
          <button class="stage-btn" onClick=${v.nextStage} disabled=${!v.canNext} aria-label="Next stage" style=${`width:52px;height:52px;flex-shrink:0;border:0;border-radius:50%;background:#fff;color:#2A2350;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 0 #E8DCC8;opacity:${v.canNext ? 1 : 0.3}`}><i class="icon-chevron-right" style="font-size:26px;line-height:1"></i></button>
        </div>
        <div class="map-box">
          <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">
            <path d=${v.mapPath} fill="none" stroke="#fff" stroke-width=${v.layout === 'phone' ? 18 : 22} stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
            <path d=${v.mapPath} fill="none" stroke="#B7E1FF" stroke-width="5" stroke-dasharray="2 16" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
          </svg>
          ${v.nodes.map(n => html`
            <div key=${n.num} class="map-stop" style=${v.mapDown
              ? `position:absolute;left:${n.left};top:${n.top};transform:translate(-${n.size / 2}px,-50%);display:flex;flex-direction:row;align-items:center;gap:10px`
              : `position:absolute;left:${n.left};top:${n.top};transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:8px`}>
              <button class="hv-grow" onClick=${n.onClick} aria-label=${n.aria} style=${`position:relative;flex-shrink:0;width:${n.size}px;height:${n.size}px;border-radius:50%;border:${n.size > 80 ? 6 : 5}px solid #fff;background:${n.bg};color:${n.fg};box-shadow:0 7px 0 ${n.sh};cursor:${n.cursor};display:flex;align-items:center;justify-content:center;font-family:inherit;font-size:${Math.round(n.size * 0.4)}px;font-weight:700;transition:transform .2s cubic-bezier(.34,1.56,.64,1)`}>
                <span>${n.num}</span>
                <span style=${`position:absolute;right:-10px;bottom:-6px;width:${n.size > 80 ? 40 : 34}px;height:${n.size > 80 ? 40 : 34}px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 0 #E0D6C4`}>${n.img ? html`<img src=${n.img} alt="" style="width:62%;height:62%" />` : html`<i class=${n.icon} style=${`font-size:${n.size > 80 ? 22 : 18}px;line-height:1;color:${n.iconColor}`}></i>`}</span>
              </button>
              <span style=${`padding:3px 12px;border-radius:999px;background:#fff;font-size:${v.layout === 'phone' ? 14 : 15}px;font-weight:600;white-space:nowrap;opacity:${n.opacity}`}>${n.title}</span>
            </div>`)}
        </div>
      </section>`}

    ${v.isPlay && html`
      <section class="play">
        <div style="display:flex;gap:12px;align-items:center;justify-content:space-between;padding-top:8px">
          <div style="display:flex;gap:12px;align-items:center;min-width:0">
            <button onClick=${v.goMap} aria-label="Back to map" style="width:56px;height:56px;flex-shrink:0;border:0;border-radius:50%;background:#fff;color:#2A2350;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 0 #E8DCC8"><i class="icon-arrow-left" style="font-size:26px;line-height:1"></i></button>
            <div class="play-title" style="font-weight:700;font-size:26px;line-height:1.15">Level ${v.levelNum} · ${v.levelTitle}</div>
          </div>
          <div class="progress-stars" style="display:flex;gap:6px;padding:10px 14px;background:#fff;border-radius:999px;flex-shrink:0">
            ${v.progress.map(p => html`<i class="icon-star" style=${`font-size:24px;line-height:1;color:${p.color}`}></i>`)}
          </div>
          <div class=${v.isBonus ? 'progress-count bonus' : 'progress-count'}>${v.isBonus ? '⭐ Bonus round' : `${v.roundNum} of ${v.roundCount}`}</div>
        </div>

        <div class="play-main">
        ${v.isPop && v.popField}

        ${v.isMatch && html`
          <div class=${v.isRead ? 'is-read' : ''} style="display:flex;flex-direction:column;gap:20px;flex:1;justify-content:center">
            ${v.isRead && html`
              <div class="read-word" style="align-self:center;padding:8px 40px 16px;background:#fff;border-radius:36px;font-weight:700;line-height:1;box-shadow:0 8px 0 #E8DCC8">${v.readWord}</div>`}
            <div class="match-grid">
              ${v.matchOptions.map(o => html`
                <button class=${`hv-bright match-card${o.shown ? ' shown' : ''}`} onClick=${o.onClick} aria-label="Picture choice" style=${`border:0;border-radius:40px;background:${o.bg};color:${o.fg};opacity:${o.opacity};transform:${o.transform};box-shadow:0 10px 0 ${o.sh};cursor:pointer;display:flex;flex-direction:column;gap:14px;align-items:center;justify-content:center;transition:transform .45s cubic-bezier(.34,1.56,.64,1),background .2s,opacity .3s`}>
                  <img src=${o.pic} alt="" />
                  ${o.word && html`<span style="font-size:clamp(28px,5vh,48px);font-weight:700;line-height:1;color:#2A2350">${o.word}</span>`}
                </button>`)}
            </div>
          </div>`}

        ${v.isSort && html`
          <div class="sort-grid">
            ${v.bins.map(b => html`
              <button class=${`hv-bright2 bin${b.shown ? ' shown' : ''}`} onClick=${b.onClick} aria-label=${b.aria} style=${`order:${b.order};display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px;border:0;border-radius:40px;background:${b.bg};color:#fff;box-shadow:0 10px 0 ${b.sh};cursor:pointer;transform:${b.transform};transition:transform .3s cubic-bezier(.34,1.56,.64,1)`}>
                <div class="bin-head" style="display:flex;align-items:center;gap:16px">
                  <span class="bin-label" style="font-weight:700;font-size:100px;line-height:1">${b.label}</span>
                  <span class="bin-anchor" style="width:96px;height:96px;flex-shrink:0;border-radius:50%;background:#fff;color:#2A2350;display:flex;align-items:center;justify-content:center">${b.anchor && html`<img src=${b.anchor} alt="" style="width:60px;height:60px" />`}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;width:100%">
                  ${b.items.map(it => html`
                    <span style="width:68px;height:68px;border-radius:50%;background:rgba(255,255,255,.92);color:#2A2350;display:flex;align-items:center;justify-content:center"><img src=${it.pic} alt="" style="width:44px;height:44px" /></span>`)}
                </div>
              </button>`)}
            <div class="sort-center" style="order:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px">
              <div class="sort-pic" style=${`width:240px;height:240px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 0 #E8DCC8;transform:${v.sortTransform};transition:transform .4s cubic-bezier(.34,1.56,.64,1)`}>
                <img src=${v.sortPic} alt="" style="width:150px;height:150px" />
              </div>
              <div class="sort-ask" style="display:flex;gap:14px;align-items:center;font-size:22px;font-weight:600">
                <i class="icon-arrow-left" style="font-size:30px;line-height:1"></i><span>${v.sortAsk}</span><i class="icon-arrow-right" style="font-size:30px;line-height:1"></i>
              </div>
            </div>
          </div>`}
        ${v.reveal && html`
          <div class="reveal" aria-live="polite">
            ${v.reveal.pic && html`<img src=${v.reveal.pic} alt="" />`}
            ${v.reveal.words.map((segs, i) => html`${i > 0 && html`<span class="reveal-dot">·</span>`}<span class="reveal-word">${segs.map(x => html`<span class=${(x.on ? 'on' : '') + (x.heart ? ' tricky' : '')}>${x.t}</span>`)}</span>${segs.some(x => x.heart) && html`<span class="reveal-heart" aria-label="heart word">♥</span>`}`)}
          </div>`}
        </div>

        <div class="play-bottom">
          <button class="hear press-red" onClick=${v.replay} aria-label="Hear again"><i class="icon-volume-2"></i><span class="hear-label">Hear again</span></button>
          ${v.isRead && html`
            <button class="sound-out" onClick=${v.soundOut} style="height:64px;padding:0 26px 0 20px;border:0;border-radius:999px;background:#fff;color:#2A2350;font-size:22px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:10px;box-shadow:0 5px 0 #E8DCC8;margin-bottom:24px"><i class="icon-ear" style="font-size:28px;line-height:1"></i>Sound it out</button>`}
        </div>
      </section>`}

    ${v.isDone && html`
      <section class="done-card">
        ${v.doneSticker}
        <div class="done-body">
          <div>
            <div style="font-size:22px;font-weight:600;color:#5940D6">You did it!</div>
            <div class="done-title" style="font-size:58px;font-weight:700;line-height:1.05">You earned the ${v.doneName} sticker!</div>
            ${v.doneStage && html`<div style="font-size:26px;font-weight:700;color:#17977F;margin-top:8px">${v.doneStage}</div>`}
            ${v.restTime && html`<div class="rest-time" style="font-size:24px;font-weight:700;color:#5940D6;margin-top:10px">Great work today! Time for a break.</div>`}
            ${v.doneKnown && html`<div class="done-known" style="font-size:20px;font-weight:600;color:#5C5677;margin-top:8px">${v.doneKnown}</div>`}
          </div>
          <div class="done-actions">
            ${v.practiseAgain
              ? html`<button class="done-primary" onClick=${v.playAgain}><i class="icon-rotate-ccw"></i>Practise again</button>`
              : v.hasNextAfter && html`<button class="done-primary" onClick=${v.playNext}><i class="icon-play"></i>Next level</button>`}
            <div class="done-secondary">
              ${v.practiseAgain && v.hasNextAfter && html`<button onClick=${v.playNext}><i class="icon-play"></i>Next level</button>`}
              <button onClick=${v.goStickers}><i class="icon-sticker"></i>Stickers</button>
              <button onClick=${v.goMap}><i class="icon-map"></i>Map</button>
            </div>
          </div>
        </div>
      </section>`}

    ${v.isReport && html`
      <section class="report-card">
        <div class="report-head">
          <div>
            <div class="report-title">Progress report</div>
            <div class="report-sub">Word Path · ${v.report.date}</div>
          </div>
          <button class="report-back" onClick=${v.backToSettings}><i class="icon-arrow-left"></i>Settings</button>
        </div>
        ${v.report.empty ? html`<p class="report-empty">Nothing played yet on this device. The report fills in as levels are played.</p>` : html`
          <div class="report-stats">
            ${v.report.stats.map(st => html`<div class="report-stat"><div class="report-big">${st.big}</div><div>${st.label}</div></div>`)}
          </div>
          <div class="report-section">
            <div class="report-heading">Needs practice</div>
            ${v.report.practice.length ? html`<div class="report-chips">
              ${v.report.practice.map(p => html`<span class="report-chip"><b>${p.text}</b> ${p.kind} · ${p.score}</span>`)}
              ${v.report.morePractice > 0 && html`<span class="report-chip more">+${v.report.morePractice} more</span>`}
            </div>` : html`<div class="report-none">Nothing stands out: no word or sound has been missed more often than not.</div>`}
          </div>
          <div class="report-section">
            <div class="report-heading">Levels</div>
            <div class="report-rows">
              ${v.report.levels.map(l => html`
                ${l.stageHead && html`<div class="report-stage">Stage ${l.stage}</div>`}
                <div class="report-row">
                  <span class="report-n">${l.n}</span>
                  <span class="report-name">${l.title}${l.done && html` <i class="icon-check" aria-label="finished"></i>`}</span>
                  <span class="report-bar" title=${`${l.known} of ${l.total} known`}><span style=${`width:${l.knownPct}`}></span></span>
                  <span class="report-known">${l.known}/${l.total} known</span>
                  <span class="report-first">${l.firstTry} first try</span>
                  <span class="report-last">${l.lastDay}</span>
                </div>`)}
            </div>
          </div>`}
        <p class="report-note">Known: right first time in 3 of the last 4 tries, on at least 2 different days. Needs practice: under half right in recent first tries. Saved on this device only.</p>
      </section>`}

    ${v.isAbout && html`
      <section class="about-card">
        <div style="font-size:clamp(30px,6vw,44px);font-weight:700;line-height:1.1">About Word Path</div>
        <p style="margin:0">Word Path is a free early-reading game for children learning to read words, roughly from kindergarten to grade 2. It practises <b>word recognition</b>: letter sounds and names, hearing sounds in words, blending sounds into words, and common sight words, in a planned order. It doesn't teach vocabulary or comprehension, which come from books, conversation and teaching.</p>
        <div>
          <div style="font-size:24px;font-weight:700;margin-bottom:6px">Research behind it</div>
          <ul style="margin:0;padding-left:22px">
            <li>National Reading Panel (2000), <i>Teaching Children to Read</i></li>
            <li>Foorman et al. (2016), <i>Foundational Skills to Support Reading for Understanding in Kindergarten Through 3rd Grade</i>, What Works Clearinghouse, U.S. Department of Education</li>
            <li>Ehri (2005, 2014): phases of word reading and orthographic mapping</li>
            <li>Castles, Rastle & Nation (2018), "Ending the Reading Wars"</li>
            <li>Teaching order modelled on <i>Letters and Sounds</i> (Department for Education and Skills, 2007)</li>
            <li>Sight words from Fry's Instant Word List (1980)</li>
          </ul>
          <p style="margin:8px 0 0;font-size:16px;color:#5C5677">Word Path isn't affiliated with or endorsed by any reading programme. All word lists and activities are its own.</p>
        </div>
        <div>
          <div style="font-size:24px;font-weight:700;margin-bottom:6px">Credits</div>
          <ul style="margin:0;padding-left:22px">
            <li>Speech sounds recorded by the Word Path author</li>
            <li>Pictures and stickers: Noto Emoji by Google (Apache License 2.0)</li>
            <li>Font: Fredoka (SIL Open Font License 1.1)</li>
            <li>Icons: Lucide (ISC License)</li>
            <li>Built with Preact (MIT) and htm (Apache License 2.0)</li>
          </ul>
        </div>
        <p style="margin:0;font-size:16px;color:#5C5677">Progress and settings are saved only on this device. Nothing is sent anywhere.</p>
        <div><button onClick=${v.goMap} style="height:64px;padding:0 28px 0 22px;border:0;border-radius:999px;background:#FFC23C;color:#2A2350;font-size:22px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:10px;box-shadow:0 5px 0 #DB9A0A"><i class="icon-map" style="font-size:24px;line-height:1"></i>Back to the map</button></div>
      </section>`}

    ${v.isStickers && html`
      <section class="sticker-book">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:16px">
          <div class="sticker-title" style="font-size:44px;font-weight:700">My stickers</div>
          <div style="padding:8px 20px;border-radius:999px;background:#FFC23C;font-size:clamp(18px,4vw,26px);font-weight:700;white-space:nowrap">${v.stickerCount}/${v.stickerTotal}</div>
        </div>
        ${v.stickerGroups.map(g => html`
          <div style="display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
              <div style="font-size:20px;font-weight:700;color:#5940D6">${g.title}</div>
              <div style="font-size:15px;font-weight:600;color:#5C5677;white-space:nowrap">${g.doneCount} of ${g.items.length}</div>
            </div>
            <div class="sticker-grid">
              ${g.items.map(s => html`
                <div class="sticker" style=${`display:flex;flex-direction:column;align-items:center;gap:6px;transform:rotate(${s.rot})`}>
                  <div class="sticker-disc" style=${`border-radius:50%;border:6px solid #fff;background:${s.bg};color:${s.fg};box-shadow:0 5px 0 ${s.sh};display:flex;align-items:center;justify-content:center`}>${s.src ? html`<img src=${s.src} alt="" />` : html`<i class="icon-lock"></i>`}</div>
                  <span style="font-size:15px;font-weight:600;text-align:center">${s.name}</span>
                </div>`)}
            </div>
          </div>`)}
      </section>`}
  </main>

  ${v.gate && html`
    <div class="settings-backdrop gate-backdrop">
      <div class="settings-card gate-card" role="dialog" aria-label="Grown-ups only">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
          <div style="font-size:clamp(24px,5vw,30px);font-weight:700">Grown-ups only</div>
          <button onClick=${v.closeGate} aria-label="Close" style="width:48px;height:48px;flex-shrink:0;border:0;border-radius:50%;background:#F3EEFF;color:#2A2350;cursor:pointer;display:flex;align-items:center;justify-content:center"><i class="icon-x" style="font-size:24px;line-height:1"></i></button>
        </div>
        <div class="gate-question">What is ${v.gate.q.a} × ${v.gate.q.b}?</div>
        <div class="gate-answer" aria-live="polite">${v.gate.typed || '\u00a0'}</div>
        <div class="gate-note">${v.gate.wrong ? 'Not quite. Try this one.' : 'Type the answer to open settings.'}</div>
        <div class="gate-pad">
          ${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map(k => html`
            <button class=${k === 'ok' ? 'gate-ok' : ''} onClick=${() => v.gateKey(k)} aria-label=${k === 'del' ? 'Delete' : k === 'ok' ? 'Enter' : k}>
              ${k === 'del' ? html`<i class="icon-delete"></i>` : k === 'ok' ? html`<i class="icon-check"></i>` : k}</button>`)}
        </div>
      </div>
    </div>`}

  ${v.isSettings && html`
    <div class="settings-backdrop">
      <div class="settings-card" role="dialog" aria-label="Grown-up settings">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
          <div style="font-size:clamp(24px,5vw,30px);font-weight:700">Grown-up settings</div>
          <button onClick=${v.closeSettings} aria-label="Close" style="width:48px;height:48px;flex-shrink:0;border:0;border-radius:50%;background:#F3EEFF;color:#2A2350;cursor:pointer;display:flex;align-items:center;justify-content:center"><i class="icon-x" style="font-size:24px;line-height:1"></i></button>
        </div>
        <div class="settings-groups">
          <div class="settings-group">
            <div class="settings-heading">Sound</div>
            <label class="settings-field">Voice
              <select value=${v.voiceName} onChange=${v.onVoice}>
                ${v.voiceOpts.map(o => html`<option value=${o.name}>${o.label}</option>`)}
              </select>
              <span class="settings-hint">Letter sounds use your recordings; the voice reads everything else. On a Chromebook try "Google US English"; in Edge, a "Natural" voice.</span>
            </label>
            <label class="settings-field"><span>Volume: ${v.volPct}</span>
              <input type="range" min="0.2" max="1" step="0.05" value=${v.vol} onInput=${v.onVol} />
            </label>
            <label class="settings-field"><span>Talking speed: ${v.rateLabel}</span>
              <input type="range" min="0.6" max="1.1" step="0.05" value=${v.rate} onInput=${v.onRate} />
            </label>
            <button class="settings-test" onClick=${v.testVoice}><i class="icon-volume-2"></i>Test voice</button>
          </div>
          <div class="settings-group">
            <div class="settings-heading">Play</div>
            <label class="settings-field">Suggest a break after
              <select value=${String(v.sessionMins)} onChange=${v.onSession}>
                ${v.sessionOpts.map(o => html`<option value=${o.value}>${o.label}</option>`)}
              </select>
              <span class="settings-hint">About 15 minutes suits most 5–8 year olds. The game never stops a child; it suggests a break at the end of a level.</span>
            </label>
            <button class="settings-link" onClick=${v.openReport}>Progress report<i class="icon-chevron-right"></i></button>
            <button class="settings-link" onClick=${v.openAbout}>About and credits<i class="icon-chevron-right"></i></button>
          </div>
        </div>
        <div class="settings-danger">
          <button onClick=${v.resetAll}>Reset all progress…</button>
          <span class="settings-hint">Clears stickers, finished levels and known words on this device. Asks to confirm first.</span>
        </div>
      </div>
    </div>`}
  ${TEST && this.testPanel()}
</div>`;
  }
}

render(html`<${App} />`, document.getElementById('app'));
