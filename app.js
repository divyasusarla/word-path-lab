// Word Path (lab) — ported from the Claude Design "Word Path v2" file.
// Preact + htm from a CDN: no build step, edit and reload.
import { h, html, render, Component } from 'https://unpkg.com/htm@3.1.1/preact/standalone.module.js';

// Gameplay settings (were the editor props in Claude Design)
const CONFIG = {
  thinkTime: 2.5,   // seconds to wait after a right answer before the next round
  rounds: 8,        // rounds per level
  unlockAll: false  // teacher mode: every level open
};

const D = (() => {
  const FRY = "the of and a to in is you that it he was for on are as with his they I at be this have from or one had by words but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil now find long down day did get come made may part".split(' ');
  const FRY2 = "over new sound take only little work know place year live me back give most very after thing our just name good sentence man think say great where help through much before line right too mean old any same tell boy follow came want show also around form three small set put end does another well large must big even such because turn here why ask went men read need land different home us move try kind hand picture again change off play spell air away animal house point page letter mother answer found study still learn should America world".split(' ');
  // continuous sounds are stretched and slowed; stop sounds stay short
  const LET = { m:['mmmmmmm',0.45,'moon'], s:['sssssss',0.45,'sun'], n:['nnnnnnn',0.45,'nest'], t:['tuh',0.8,'top'], p:['puh',0.8,'pig'], a:['aah',0.6,'apple'], i:['ih',0.6,'itch'], o:['ahh',0.6,'octopus'] };
  const PH = { k:['kuh',.8], a:['aah',.6], t:['tuh',.8], d:['duh',.8], o:['ahh',.6], g:['guh',.8], s:['sssss',.45], u:['uh',.6], n:['nnnnn',.45], b:['buh',.8], e:['eh',.6], p:['puh',.8], m:['mmmmm',.45], ks:['ks',.8] };
  const CVC = [
    { w:'cat', ic:'cat', ph:['k','a','t'] }, { w:'dog', ic:'dog', ph:['d','o','g'] }, { w:'sun', ic:'sun', ph:['s','u','n'] },
    { w:'bus', ic:'bus', ph:['b','u','s'] }, { w:'bed', ic:'bed', ph:['b','e','d'] }, { w:'pen', ic:'pen', ph:['p','e','n'] },
    { w:'bug', ic:'bug', ph:['b','u','g'] }, { w:'box', ic:'box', ph:['b','o','ks'] }, { w:'map', ic:'map', ph:['m','a','p'] }
  ];
  const RHY = [['fun','sun','sun'],['hug','bug','bug'],['fox','box','box'],['red','bed','bed'],['ten','pen','pen'],['hat','cat','cat'],['log','dog','dog'],['far','car','car'],['make','cake','cake'],['dish','fish','fish']].map(([cue, w, ic]) => ({ cue, w, ic }));
  const it = (label, ic, bin) => ({ label, ic, bin });
  const LV = [
    { title:'Letter sounds', kind:'pop', mode:'letter', pool:['m','s','t','a','p','i','n','o'], tiles:4, sticker:'star', name:'Star' },
    { title:'Sight words 1', kind:'pop', mode:'word', pool:FRY.slice(0,25), tiles:4, sticker:'rocket', name:'Rocket' },
    { title:'First sounds', kind:'sort', bins:[{ label:'s', sound:['sssss',.45], anchor:'sun' }, { label:'m', sound:['mmmmm',.45], anchor:'moon' }],
      items:[it('snail','snail',0), it('star','star',0), it('scissors','scissors',0), it('sofa','sofa',0), it('milk','milk',1), it('mountain','mountain',1), it('mail','mail',1), it('map','map',1)], sticker:'fish', name:'Fish' },
    { title:'Blend it', kind:'match', mode:'blend', sticker:'bird', name:'Bird' },
    { title:'Sight words 2', kind:'pop', mode:'word', pool:FRY.slice(25,50), tiles:4, sticker:'crown', name:'Crown' },
    { title:'Rhyme time', kind:'match', mode:'rhyme', sticker:'rabbit', name:'Rabbit' },
    { title:'sh or ch', kind:'sort', bins:[{ label:'sh', sound:['shhhhh',.45], anchor:'ship' }, { label:'ch', sound:['chuh',.8], anchor:'cherry' }],
      items:[it('shell','shell',0), it('shirt','shirt',0), it('shield','shield',0), it('church','church',1), it('chair','armchair',1), it('chef','chef-hat',1)], sticker:'turtle', name:'Turtle' },
    { title:'Sight words 3', kind:'pop', mode:'word', pool:FRY.slice(50,100), tiles:5, sticker:'sailboat', name:'Boat' },
    { title:'Read it', kind:'match', mode:'read', sticker:'flower', name:'Flower' },
    { title:'Word boss', kind:'pop', mode:'word', pool:FRY2, tiles:5, sticker:'trophy', name:'Trophy' }
  ].map((l, i) => ({ ...l, n: i + 1 }));
  const POS = [[10,25],[28,31.7],[46,21.7],[64,31.7],[86,25],[86,71.7],[64,78.3],[46,68.3],[28,78.3],[10,71.7]];
  return { FRY, FRY2, LET, PH, CVC, RHY, LV, POS };
})();

const PAL = [
  { bg:'#F2544A', sh:'#C83A31', fg:'#fff' }, { bg:'#FFC23C', sh:'#DB9A0A', fg:'#2A2350' },
  { bg:'#2EC4A6', sh:'#17977F', fg:'#2A2350' }, { bg:'#7B61FF', sh:'#5940D6', fg:'#fff' }, { bg:'#4DB3FF', sh:'#2188D6', fg:'#2A2350' }
];
const PRAISE = ['Yes!', 'Great job!', 'You got it!', 'Nice work!', 'Super!'];
// Own storage keys so the lab never touches progress saved by the class version (same github.io origin)
const KEY = 'wordpath-lab.v1';
const AKEY = 'wordpath-lab.audio';

class App extends Component {
  sid = 0; run = 0; tms = []; voices = [];

  state = { screen:'map', lvl:0, round:0, rounds:[], wrong:[], solved:false, sorted:[[],[]], binWrong:null, done:this.load(), settings:false, audio:this.loadAudio(), vtick:0 };

  load() {
    try { const d = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(d) && d.length === 10) return d; } catch (e) {}
    return Array(10).fill(false);
  }
  loadAudio() {
    try { const a = JSON.parse(localStorage.getItem(AKEY)); if (a) return { voice: a.voice || '', vol: a.vol ?? 0.6, rate: a.rate ?? 0.85 }; } catch (e) {}
    return { voice:'', vol:0.6, rate:0.85 };
  }
  save(done) { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {} }
  setAudio(patch) {
    const audio = { ...this.state.audio, ...patch };
    try { localStorage.setItem(AKEY, JSON.stringify(audio)); } catch (e) {}
    this.setState({ audio });
  }

  componentDidMount() {
    const ss = window.speechSynthesis; if (!ss) return;
    const pick = () => { this.voices = ss.getVoices().filter(v => /^en/i.test(v.lang)); this.setState(s => ({ vtick: s.vtick + 1 })); };
    pick(); ss.onvoiceschanged = pick;
  }
  componentWillUnmount() { this.stop(); }

  bestVoice() {
    const vs = this.voices, chosen = vs.find(v => v.name === this.state.audio.voice);
    if (chosen) return chosen;
    const us = vs.filter(v => /en[-_]US/i.test(v.lang));
    const prefs = [/Ana.*Natural/i, /Jenny.*Natural/i, /Aria.*Natural/i, /Natural/i, /Google US English/i, /Samantha/i];
    for (const p of prefs) { const v = us.find(x => p.test(x.name)) || vs.find(x => p.test(x.name)); if (v) return v; }
    return us[0] || vs[0] || null;
  }

  wait(ms) { return new Promise(r => { this.tms.push(setTimeout(r, ms)); }); }
  stop() {
    this.run++; this.sid++;
    this.tms.forEach(clearTimeout); this.tms = [];
    if (window.speechSynthesis) window.speechSynthesis.cancel();
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
    const id = ++this.sid, ss = window.speechSynthesis;
    if (!ss) return false;
    ss.cancel();
    await this.wait(80);
    for (const p of parts) {
      if (id !== this.sid) return false;
      if (typeof p === 'number') { await this.wait(p); continue; }
      await this.utter(typeof p === 'string' ? { t: p } : p);
    }
    return id === this.sid;
  }
  snd(pair) { return { t: pair[0], rate: pair[1] }; }

  shuf(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  cycle(pool, n) { let o = []; while (o.length < n) o = o.concat(this.shuf(pool)); return o.slice(0, n); }
  unlocked(i) { return CONFIG.unlockAll || i === 0 || this.state.done[i - 1] || this.state.done[i]; }

  build(L) {
    const R = CONFIG.rounds;
    if (L.kind === 'pop') return this.cycle(L.pool, R).map(t => ({
      target: t,
      options: this.shuf([t, ...this.shuf(L.pool.filter(x => x !== t)).slice(0, L.tiles - 1)]).map(label => ({ label, bob: (Math.random() * 1.5).toFixed(2), dur: (2.6 + Math.random()).toFixed(2) }))
    }));
    if (L.kind === 'match') {
      const src = L.mode === 'rhyme' ? D.RHY : D.CVC;
      return this.cycle(src, R).map(t => ({ target: t, options: this.shuf([t, ...this.shuf(src.filter(x => x.w !== t.w)).slice(0, 2)]) }));
    }
    return this.shuf(L.items);
  }

  prompt(L, r, first) {
    const pre = first ? [`Level ${L.n}. ${L.title}.`, 700] : [];
    if (L.kind === 'pop') {
      if (L.mode === 'letter') { const s = D.LET[r.target]; return [...pre, 'Find the letter that says', 500, this.snd(s), 500, 'like in', { t: s[2], rate: 0.8 }]; }
      return [...pre, 'Pop the word', 400, { t: r.target, rate: 0.7 }];
    }
    if (L.kind === 'match') {
      if (L.mode === 'blend') return [...pre, 'Listen.', 500, ...r.target.ph.flatMap(p => [this.snd(D.PH[p]), 450]), 400, 'What word is that?'];
      if (L.mode === 'rhyme') return [...pre, 'Which picture rhymes with', 400, { t: r.target.cue, rate: 0.7 }];
      return [...pre, 'Read the word. Then tap its picture.'];
    }
    const [A, B] = L.bins;
    return [...pre, { t: r.label, rate: 0.7 }, 700, 'Does it start with', 300, this.snd(A.sound), 400, 'or', 300, this.snd(B.sound), '?'];
  }

  start(i) {
    if (!this.unlocked(i)) { this.speak(['That level is locked. Finish the one before it.']); return; }
    this.stop();
    const L = D.LV[i], rounds = this.build(L);
    this.setState({ screen:'play', lvl:i, round:0, rounds, wrong:[], solved:false, sorted:[[],[]], binWrong:null });
    this.speak(this.prompt(L, rounds[0], true));
  }

  next() {
    const { round, rounds, lvl } = this.state, L = D.LV[lvl];
    if (round + 1 >= rounds.length) {
      const done = this.state.done.slice(); done[lvl] = true; this.save(done);
      this.setState({ screen:'done', done });
      this.speak(['You did it!', 400, `You earned the ${L.name} sticker!`]);
      return;
    }
    this.setState({ round: round + 1, wrong:[], solved:false, binWrong:null });
    this.speak(this.prompt(L, rounds[round + 1], false));
  }

  praise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }

  async win(say) {
    const run = this.run;
    this.setState({ solved:true });
    await this.speak(say);
    await this.wait(CONFIG.thinkTime * 1000);
    if (run === this.run && this.state.solved) this.next();
  }

  pickPop(i) {
    const { rounds, round, solved, lvl, wrong } = this.state; if (solved || wrong.includes(i)) return;
    const L = D.LV[lvl], r = rounds[round], o = r.options[i];
    if (o.label === r.target) return this.win([this.praise()]);
    this.setState(s => ({ wrong: s.wrong.concat(i) }));
    const say = L.mode === 'letter' ? ['That letter says', 300, this.snd(D.LET[o.label])] : ['That word is', 300, { t: o.label, rate: 0.75 }];
    this.speak([...say, 600, 'Try again.', 700, ...this.prompt(L, r, false)]);
  }

  pickMatch(i) {
    const { rounds, round, solved, lvl, wrong } = this.state; if (solved || wrong.includes(i)) return;
    const L = D.LV[lvl], r = rounds[round], o = r.options[i];
    if (o.w === r.target.w) return this.win(L.mode === 'rhyme' ? ['Yes!', 300, `${r.target.cue}, ${o.w}.`] : [`${o.w}!`, 300, this.praise()]);
    this.setState(s => ({ wrong: s.wrong.concat(i) }));
    if (L.mode === 'rhyme') this.speak([`${o.w} does not rhyme with ${r.target.cue}.`, 500, 'Try again.']);
    else this.speak([`That is a ${o.w}.`, 500, 'Try again.', ...(L.mode === 'blend' ? [700, ...this.prompt(L, r, false)] : [])]);
  }

  pickBin(b) {
    const { rounds, round, solved, lvl } = this.state; if (solved) return;
    const L = D.LV[lvl], item = rounds[round];
    if (item.bin === b) {
      this.setState(s => { const sorted = [s.sorted[0].slice(), s.sorted[1].slice()]; sorted[b].push(item); return { sorted, binWrong:null }; });
      return this.win(['Yes!', 300, `${item.label} starts with`, 300, this.snd(L.bins[b].sound)]);
    }
    this.setState({ binWrong: b });
    this.speak(['Listen to the first sound.', 500, { t: item.label, rate: 0.6 }, 600, 'Try again.']);
  }

  soundOut() {
    const r = this.state.rounds[this.state.round]; if (!r || !r.target.ph) return;
    this.speak([...r.target.ph.flatMap(p => [this.snd(D.PH[p]), 450]), 300, { t: r.target.w, rate: 0.8 }]);
  }

  popField(L) {
    const { rounds, round, wrong, solved } = this.state, r = rounds[round]; if (!r) return null;
    const size = L.mode === 'letter' ? 160 : 176;
    return h('div', { style: { position:'relative', minHeight:440, display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-evenly', gap:24, padding:'32px 16px', overflow:'hidden', borderRadius:40, background:'#D9F0FF' } },
      r.options.map((o, i) => {
        const right = solved && o.label === r.target, bad = wrong.includes(i), c = PAL[(i + round) % PAL.length];
        const anim = right ? 'wpPop .6s cubic-bezier(.34,1.56,.64,1) forwards'
          : bad ? 'wpShake .5s ease-in-out'
          : `wpBob ${o.dur}s ease-in-out ${o.bob}s infinite alternate`;
        const sparks = right ? [0,1,2,3,4,5,6,7].map(k => {
          const a = k / 8 * Math.PI * 2;
          return h('span', { key:'s' + k, style: { position:'absolute', left:'50%', top:'50%', width:18, height:18, margin:-9, borderRadius:'50%', background: PAL[k % 5].bg, '--dx': `${Math.round(Math.cos(a) * 130)}px`, '--dy': `${Math.round(Math.sin(a) * 130)}px`, animation:'wpSpark .7s cubic-bezier(.22,1,.36,1) forwards' } });
        }) : [];
        return h('div', { key: `${round}-${i}`, style: { position:'relative', width:size, height:size, animation:`wpIn 1.1s cubic-bezier(.22,1,.36,1) ${(i * 0.14).toFixed(2)}s both` } },
          right && h('span', { style: { position:'absolute', inset:0, borderRadius:'50%', border:`8px solid ${c.bg}`, animation:'wpRing .6s ease-out forwards' } }),
          ...sparks,
          h('button', {
            key: bad ? 'bad' : 'ok',
            onClick: () => this.pickPop(i),
            'aria-label': o.label,
            style: {
              width:'100%', height:'100%', borderRadius:'50%', border:'7px solid #fff', cursor: bad ? 'default' : 'pointer',
              background: bad ? '#E6E1EE' : c.bg, color: bad ? '#9A93AE' : c.fg, boxShadow:`0 9px 0 ${bad ? '#CFC8DB' : c.sh}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:"'Fredoka',system-ui,sans-serif", fontWeight:700, fontSize: L.mode === 'letter' ? 84 : (o.label.length > 6 ? 30 : 40),
              animation: anim
            }
          }, o.label));
      }));
  }

  renderVals() {
    const { screen, lvl, round, rounds, wrong, solved, sorted, binWrong, done, audio } = this.state;
    const LV = D.LV, L = LV[lvl], r = rounds[round], P = PAL;
    const nextIdx = done.findIndex(d => !d);
    const goMap = () => { this.stop(); this.setState({ screen:'map' }); };
    const goStickers = () => { this.stop(); this.setState({ screen:'stickers' }); };
    const isPlay = screen === 'play';

    const nodes = LV.map((l, i) => {
      const isDone = done[i], open = this.unlocked(i), cur = i === nextIdx, c = P[i % 5], [x, y] = D.POS[i];
      return {
        num: l.n, title: l.title, aria: `Level ${l.n}: ${l.title}`, left: x + '%', top: y + '%',
        size: cur ? '124px' : '100px',
        icon: isDone ? 'icon-check' : open ? (cur ? 'icon-play' : `icon-${l.sticker}`) : 'icon-lock',
        iconColor: isDone ? '#17977F' : open ? '#5940D6' : '#9A93AE',
        bg: open ? c.bg : '#E6E1EE', sh: open ? c.sh : '#CFC8DB', fg: open ? c.fg : '#9A93AE',
        opacity: open ? 1 : 0.6, cursor: open ? 'pointer' : 'not-allowed',
        onClick: () => this.start(i)
      };
    });

    const matchOptions = isPlay && L.kind === 'match' && r ? r.options.map((o, i) => {
      const right = solved && o.w === r.target.w, bad = wrong.includes(i), c = P[(i * 2 + round) % 5];
      return { icon: `icon-${o.ic}`, bg: right ? '#2EC4A6' : '#fff', fg: right ? '#fff' : c.sh, sh: right ? '#17977F' : '#E8DCC8',
        opacity: bad ? 0.35 : 1, transform: right ? 'scale(1.08) rotate(-2deg)' : 'scale(1)', onClick: () => this.pickMatch(i) };
    }) : [];

    const binC = [P[0], P[3]];
    const bins = isPlay && L.kind === 'sort' ? L.bins.map((b, k) => ({
      label: b.label, anchor: `icon-${b.anchor}`, aria: `Starts with ${b.label}`, order: k === 0 ? 0 : 2,
      bg: binC[k].bg, sh: binC[k].sh, transform: binWrong === k ? 'scale(.96)' : 'scale(1)',
      items: sorted[k].map(x => ({ icon: `icon-${x.ic}` })), onClick: () => this.pickBin(k)
    })) : [];

    const dl = LV[lvl], dc = P[lvl % 5];
    const doneSticker = screen === 'done' ? h('div', { key: 'st' + lvl, style: { width:260, height:260, flexShrink:0, borderRadius:'50%', border:'10px solid #fff', background:dc.bg, color:dc.fg, boxShadow:`0 10px 0 ${dc.sh}`, display:'flex', alignItems:'center', justifyContent:'center', animation:'wpSticker .8s cubic-bezier(.34,1.56,.64,1) both' } },
      h('i', { className:`icon-${dl.sticker}`, style: { fontSize:130, lineHeight:1 } })) : null;

    const voiceOpts = [{ name:'', label:'Automatic (best available)' }].concat(this.voices.map(v => ({ name: v.name, label: `${v.name} (${v.lang})` })));

    return {
      goMap, goStickers,
      stickerCount: done.filter(Boolean).length,
      isMap: screen === 'map', isPlay, isDone: screen === 'done', isStickers: screen === 'stickers',
      heroTitle: nextIdx < 0 ? 'You finished every level!' : `Level ${nextIdx + 1}: ${LV[nextIdx].title}`,
      hasNext: nextIdx >= 0,
      heroPlay: () => this.start(nextIdx),
      heroHear: () => this.speak(nextIdx < 0 ? ['You finished every level! Look at your stickers.'] : [`Level ${nextIdx + 1}.`, 300, `${LV[nextIdx].title}.`, 500, 'Press play.']),
      nodes,
      levelNum: L.n, levelTitle: L.title,
      progress: rounds.map((_, k) => ({ color: k < round || (k === round && solved) ? '#FFC23C' : '#E6E1EE' })),
      replay: () => r && this.speak(this.prompt(L, r, false)),
      soundOut: () => this.soundOut(),
      isPop: isPlay && L.kind === 'pop', isMatch: isPlay && L.kind === 'match', isSort: isPlay && L.kind === 'sort',
      isRead: isPlay && L.mode === 'read',
      readWord: isPlay && L.mode === 'read' && r ? r.target.w : '',
      popField: isPlay && L.kind === 'pop' ? this.popField(L) : null,
      matchOptions, bins,
      sortIcon: isPlay && L.kind === 'sort' && r ? `icon-${r.ic}` : '',
      sortTransform: solved ? 'scale(1.1) rotate(-4deg)' : 'scale(1)',
      doneSticker, doneName: dl.name,
      hasNextAfter: lvl + 1 < LV.length,
      playNext: () => this.start(lvl + 1),
      stickers: LV.map((l, i) => {
        const c = P[i % 5];
        return { name: done[i] ? l.name : `Level ${l.n}`, icon: done[i] ? `icon-${l.sticker}` : 'icon-lock', rot: `${[-5, 4, -2, 6, -4][i % 5]}deg`,
          bg: done[i] ? c.bg : '#F1EDF6', fg: done[i] ? c.fg : '#B3ACC4', sh: done[i] ? c.sh : '#DCD5E6' };
      }),
      isSettings: this.state.settings,
      openSettings: () => this.setState({ settings: true }),
      closeSettings: () => this.setState({ settings: false }),
      voiceOpts, voiceName: audio.voice,
      vol: audio.vol, volPct: Math.round(audio.vol * 100) + '%',
      rate: audio.rate, rateLabel: audio.rate < 0.8 ? 'slow' : audio.rate > 0.95 ? 'quick' : 'gentle',
      onVoice: e => this.setAudio({ voice: e.target.value }),
      onVol: e => this.setAudio({ vol: parseFloat(e.target.value) }),
      onRate: e => this.setAudio({ rate: parseFloat(e.target.value) }),
      testVoice: () => this.speak(['Hi! Let\'s play with letters.', 500, 'This letter says', 400, this.snd(D.LET.s)]),
      resetAll: () => { if (window.confirm('Reset all progress and stickers?')) { const d = Array(10).fill(false); this.save(d); this.setState({ done: d, settings: false }); } }
    };
  }

  render() {
    const v = this.renderVals();
    const pill = 'display:flex;align-items:center;gap:8px;height:52px;padding:0 20px;border:0;border-radius:999px;background:#fff;color:#2A2350;font-size:19px;font-weight:600;cursor:pointer;box-shadow:0 4px 0 #E8DCC8';
    const roundBtn = 'display:flex;align-items:center;justify-content:center;width:52px;height:52px;border:0;border-radius:50%;background:#fff;color:#2A2350;cursor:pointer;box-shadow:0 4px 0 #E8DCC8';
    const softBtn = 'height:80px;padding:0 30px 0 24px;border:0;border-radius:999px;background:#F3EEFF;color:#2A2350;font-size:24px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:12px';
    const path = 'M100 150 C190 150 190 190 280 190 S370 130 460 130 S550 190 640 190 S770 150 860 150 C990 150 990 430 860 430 S730 470 640 470 S550 410 460 410 S370 470 280 470 S190 430 100 430';

    return html`
<div style="min-height:100vh;background:#FFF7EA;color:#2A2350;font-family:'Fredoka',system-ui,sans-serif">
  <header style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:16px 28px">
    <button onClick=${v.goMap} style="display:flex;align-items:center;gap:12px;background:none;border:0;padding:0;cursor:pointer;color:#2A2350">
      <span style="width:52px;height:52px;border-radius:50%;background:#FFC23C;display:flex;align-items:center;justify-content:center;box-shadow:0 5px 0 #DB9A0A"><i class="icon-sparkles" style="font-size:28px;line-height:1;color:#2A2350"></i></span>
      <span style="font-weight:700;font-size:30px">Word Path</span>
    </button>
    <div style="display:flex;gap:10px;align-items:center">
      <button class="hv-tint" onClick=${v.goMap} style=${pill}><i class="icon-map" style="font-size:22px;line-height:1"></i><span>Map</span></button>
      <button class="hv-tint" onClick=${v.goStickers} style=${pill}><i class="icon-sticker" style="font-size:22px;line-height:1;color:#F2544A"></i><span>${v.stickerCount}/10</span></button>
      <button class="hv-tint" onClick=${v.openSettings} aria-label="Grown-up settings" style=${roundBtn}><i class="icon-settings" style="font-size:22px;line-height:1"></i></button>
    </div>
  </header>

  <main style="max-width:1160px;margin:0 auto;padding:8px 28px 48px">

    ${v.isMap && html`
      <section style="display:flex;flex-direction:column;gap:24px">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px;padding:24px 28px;background:#7B61FF;border-radius:36px;color:#fff;box-shadow:0 8px 0 #5940D6">
          <div>
            <div style="font-size:18px;font-weight:500;opacity:.9">Next up</div>
            <div style="font-size:44px;font-weight:700;line-height:1.1;text-wrap:balance">${v.heroTitle}</div>
          </div>
          <div style="display:flex;gap:12px">
            <button class="hv-lift" onClick=${v.heroHear} aria-label="Hear it" style="width:84px;height:84px;border:0;border-radius:50%;background:#fff;color:#5940D6;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 0 #4A33B8"><i class="icon-volume-2" style="font-size:38px;line-height:1"></i></button>
            ${v.hasNext && html`
              <button class="hv-lift" onClick=${v.heroPlay} style="height:84px;padding:0 36px 0 28px;border:0;border-radius:999px;background:#FFC23C;color:#2A2350;font-size:32px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:0 6px 0 #DB9A0A"><i class="icon-play" style="font-size:34px;line-height:1"></i>Play</button>`}
          </div>
        </div>
        <div style="position:relative;width:100%;aspect-ratio:10/6;min-height:420px;background:#D9F0FF;border-radius:40px;overflow:hidden">
          <svg viewBox="0 0 1000 600" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">
            <path d=${path} fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
            <path d=${path} fill="none" stroke="#B7E1FF" stroke-width="5" stroke-dasharray="2 16" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
          </svg>
          ${v.nodes.map(n => html`
            <div key=${n.num} style=${`position:absolute;left:${n.left};top:${n.top};transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:8px`}>
              <button class="hv-grow" onClick=${n.onClick} aria-label=${n.aria} style=${`position:relative;width:${n.size};height:${n.size};border-radius:50%;border:6px solid #fff;background:${n.bg};color:${n.fg};box-shadow:0 7px 0 ${n.sh};cursor:${n.cursor};display:flex;align-items:center;justify-content:center;font-family:inherit;font-size:40px;font-weight:700;transition:transform .2s cubic-bezier(.34,1.56,.64,1)`}>
                <span>${n.num}</span>
                <span style="position:absolute;right:-10px;bottom:-6px;width:40px;height:40px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 0 #E0D6C4"><i class=${n.icon} style=${`font-size:22px;line-height:1;color:${n.iconColor}`}></i></span>
              </button>
              <span style=${`padding:4px 12px;border-radius:999px;background:#fff;font-size:15px;font-weight:600;white-space:nowrap;opacity:${n.opacity}`}>${n.title}</span>
            </div>`)}
        </div>
      </section>`}

    ${v.isPlay && html`
      <section style="display:flex;flex-direction:column;gap:20px">
        <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between">
          <div style="display:flex;gap:12px;align-items:center">
            <button onClick=${v.goMap} aria-label="Back to map" style="width:56px;height:56px;border:0;border-radius:50%;background:#fff;color:#2A2350;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 0 #E8DCC8"><i class="icon-arrow-left" style="font-size:26px;line-height:1"></i></button>
            <div style="font-weight:700;font-size:26px">Level ${v.levelNum} · ${v.levelTitle}</div>
          </div>
          <div style="display:flex;gap:8px;padding:10px 14px;background:#fff;border-radius:999px">
            ${v.progress.map(p => html`<i class="icon-star" style=${`font-size:24px;line-height:1;color:${p.color}`}></i>`)}
          </div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
          <button class="press-red" onClick=${v.replay} style="height:76px;padding:0 30px 0 24px;border:0;border-radius:999px;background:#F2544A;color:#fff;font-size:26px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:0 6px 0 #C83A31"><i class="icon-volume-2" style="font-size:34px;line-height:1"></i>Hear again</button>
          ${v.isRead && html`
            <button onClick=${v.soundOut} style="height:76px;padding:0 30px 0 24px;border:0;border-radius:999px;background:#fff;color:#2A2350;font-size:24px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:0 6px 0 #E8DCC8"><i class="icon-ear" style="font-size:30px;line-height:1"></i>Sound it out</button>`}
        </div>

        ${v.isPop && v.popField}

        ${v.isMatch && html`
          <div style="display:flex;flex-direction:column;gap:24px">
            ${v.isRead && html`
              <div style="align-self:flex-start;padding:12px 44px 20px;background:#fff;border-radius:36px;font-weight:700;font-size:130px;line-height:1;box-shadow:0 8px 0 #E8DCC8">${v.readWord}</div>`}
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px">
              ${v.matchOptions.map(o => html`
                <button class="hv-bright" onClick=${o.onClick} aria-label="Picture choice" style=${`height:290px;border:0;border-radius:40px;background:${o.bg};color:${o.fg};opacity:${o.opacity};transform:${o.transform};box-shadow:0 10px 0 ${o.sh};cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .45s cubic-bezier(.34,1.56,.64,1),background .2s,opacity .3s`}>
                  <i class=${o.icon} style="font-size:160px;line-height:1"></i>
                </button>`)}
            </div>
          </div>`}

        ${v.isSort && html`
          <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.9fr) minmax(0,1fr);gap:20px;align-items:stretch;min-height:440px">
            ${v.bins.map(b => html`
              <button class="hv-bright2" onClick=${b.onClick} aria-label=${b.aria} style=${`order:${b.order};display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px;border:0;border-radius:40px;background:${b.bg};color:#fff;box-shadow:0 10px 0 ${b.sh};cursor:pointer;transform:${b.transform};transition:transform .3s cubic-bezier(.34,1.56,.64,1)`}>
                <div style="display:flex;align-items:center;gap:16px">
                  <span style="font-weight:700;font-size:100px;line-height:1">${b.label}</span>
                  <span style="width:96px;height:96px;border-radius:50%;background:#fff;color:#2A2350;display:flex;align-items:center;justify-content:center"><i class=${b.anchor} style="font-size:56px;line-height:1"></i></span>
                </div>
                <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;width:100%">
                  ${b.items.map(it => html`
                    <span style="width:68px;height:68px;border-radius:50%;background:rgba(255,255,255,.92);color:#2A2350;display:flex;align-items:center;justify-content:center"><i class=${it.icon} style="font-size:38px;line-height:1"></i></span>`)}
                </div>
              </button>`)}
            <div style="order:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px">
              <div style=${`width:240px;height:240px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 0 #E8DCC8;transform:${v.sortTransform};transition:transform .4s cubic-bezier(.34,1.56,.64,1)`}>
                <i class=${v.sortIcon} style="font-size:140px;line-height:1;color:#2A2350"></i>
              </div>
              <div style="display:flex;gap:14px;align-items:center;font-size:22px;font-weight:600">
                <i class="icon-arrow-left" style="font-size:30px;line-height:1"></i><span>Which sound?</span><i class="icon-arrow-right" style="font-size:30px;line-height:1"></i>
              </div>
            </div>
          </div>`}
      </section>`}

    ${v.isDone && html`
      <section style="display:flex;flex-wrap:wrap;align-items:center;gap:48px;padding:48px;background:#fff;border-radius:48px;box-shadow:0 10px 0 #E8DCC8">
        ${v.doneSticker}
        <div style="display:flex;flex-direction:column;gap:28px;flex:1;min-width:280px">
          <div>
            <div style="font-size:22px;font-weight:600;color:#5940D6">Level ${v.levelNum} complete!</div>
            <div style="font-size:60px;font-weight:700;line-height:1.05">You got the ${v.doneName} sticker</div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:12px">
            ${v.hasNextAfter && html`
              <button onClick=${v.playNext} style="height:80px;padding:0 36px 0 28px;border:0;border-radius:999px;background:#FFC23C;color:#2A2350;font-size:28px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:0 6px 0 #DB9A0A"><i class="icon-play" style="font-size:30px;line-height:1"></i>Next level</button>`}
            <button onClick=${v.goStickers} style=${softBtn}><i class="icon-sticker" style="font-size:28px;line-height:1"></i>Stickers</button>
            <button onClick=${v.goMap} style=${softBtn}><i class="icon-map" style="font-size:28px;line-height:1"></i>Map</button>
          </div>
        </div>
      </section>`}

    ${v.isStickers && html`
      <section style="display:flex;flex-direction:column;gap:28px;padding:36px;background:#fff;border-radius:48px;box-shadow:0 10px 0 #E8DCC8">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:16px">
          <div style="font-size:48px;font-weight:700">My stickers</div>
          <div style="padding:8px 20px;border-radius:999px;background:#FFC23C;font-size:28px;font-weight:700">${v.stickerCount}/10</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:28px 36px;padding:12px 0">
          ${v.stickers.map(s => html`
            <div style=${`display:flex;flex-direction:column;align-items:center;gap:10px;transform:rotate(${s.rot})`}>
              <div style=${`width:150px;height:150px;border-radius:50%;border:7px solid #fff;background:${s.bg};color:${s.fg};box-shadow:0 6px 0 ${s.sh};display:flex;align-items:center;justify-content:center`}><i class=${s.icon} style="font-size:72px;line-height:1"></i></div>
              <span style="font-size:20px;font-weight:600">${s.name}</span>
            </div>`)}
        </div>
      </section>`}
  </main>

  ${v.isSettings && html`
    <div style="position:fixed;inset:0;background:rgba(42,35,80,.45);display:flex;align-items:flex-start;justify-content:center;padding:24px;z-index:10;overflow-y:auto">
      <div style="width:100%;max-width:520px;margin:auto 0;background:#fff;border-radius:36px;padding:32px;display:flex;flex-direction:column;gap:24px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:30px;font-weight:700">Grown-up settings</div>
          <button onClick=${v.closeSettings} aria-label="Close" style="width:48px;height:48px;border:0;border-radius:50%;background:#F3EEFF;color:#2A2350;cursor:pointer;display:flex;align-items:center;justify-content:center"><i class="icon-x" style="font-size:24px;line-height:1"></i></button>
        </div>
        <label style="display:flex;flex-direction:column;gap:8px;font-size:18px;font-weight:600">Voice
          <select value=${v.voiceName} onChange=${v.onVoice} style="height:52px;padding:0 14px;border:3px solid #E8DCC8;border-radius:16px;font-family:inherit;font-size:17px;color:#2A2350;background:#fff">
            ${v.voiceOpts.map(o => html`<option value=${o.name}>${o.label}</option>`)}
          </select>
          <span style="font-size:14px;font-weight:400;color:#5C5677">Best on Chromebook: "Google US English". In Edge, choose a "Natural" voice such as Ana or Jenny.</span>
        </label>
        <label style="display:flex;flex-direction:column;gap:8px;font-size:18px;font-weight:600"><span>Volume: ${v.volPct}</span>
          <input type="range" min="0.2" max="1" step="0.05" value=${v.vol} onInput=${v.onVol} style="accent-color:#7B61FF" />
        </label>
        <label style="display:flex;flex-direction:column;gap:8px;font-size:18px;font-weight:600"><span>Talking speed: ${v.rateLabel}</span>
          <input type="range" min="0.6" max="1.1" step="0.05" value=${v.rate} onInput=${v.onRate} style="accent-color:#7B61FF" />
        </label>
        <div style="display:flex;flex-wrap:wrap;gap:12px">
          <button onClick=${v.testVoice} style="height:56px;padding:0 24px 0 18px;border:0;border-radius:999px;background:#7B61FF;color:#fff;font-size:19px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:10px"><i class="icon-volume-2" style="font-size:22px;line-height:1"></i>Test voice</button>
          <button onClick=${v.resetAll} style="height:56px;padding:0 22px;border:0;border-radius:999px;background:#FFE9E7;color:#B0322A;font-size:17px;font-weight:600;cursor:pointer">Reset progress</button>
        </div>
      </div>
    </div>`}
</div>`;
  }
}

render(html`<${App} />`, document.getElementById('app'));
