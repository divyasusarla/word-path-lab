// Word Path content: the teaching order, words, pictures and stickers.
// This is the file to edit to change what children learn. The game (app.js) reads it; tests/ checks it.
//
// Stages follow a standard phonics teaching order. Each stage only uses sounds taught in it or before it,
// and coverage() (bottom of the file) reports anything missing or out of order.

import { SOUND_IDS } from './sounds.js?v=dev';

// ---- Sounds a letter or letter group makes -------------------------------------------------------
// clip: the recording in audio/ (see sounds.js). say/rate: what the browser voice says if there's no recording.
// ex: example word ("like in ..."). helper: spelling taught alongside another sound, not on its own.
const g = (clip, say, rate, ex, extra = {}) => ({ clip, say, rate, ex, ...extra });
export const GRAPHEMES = {
  s: g('s', 'sssss', .45, 'sun'),       a: g('a-short', 'aah', .6, 'apple'), t: g('t', 'tuh', .8, 'top'),
  p: g('p', 'puh', .8, 'pig'),          i: g('i-short', 'ih', .6, 'itch'),   n: g('n', 'nnnnn', .45, 'nest'),
  m: g('m', 'mmmmm', .45, 'moon'),      d: g('d', 'duh', .8, 'dog'),         g: g('g', 'guh', .8, 'goat'),
  o: g('o-short', 'ahh', .6, 'octopus'), c: g('k', 'kuh', .8, 'cat'),        k: g('k', 'kuh', .8, 'kite'),
  ck: g('k', 'kuh', .8, 'duck'),
  e: g('e-short', 'eh', .6, 'egg'),     u: g('u-short', 'uh', .6, 'up'),     r: g('r', 'rrrrr', .45, 'rat'),
  h: g('h', 'huh', .8, 'hat'),          b: g('b', 'buh', .8, 'bat'),         f: g('f', 'fffff', .45, 'fish'),
  l: g('l', 'lllll', .45, 'leg'),       ll: g('l', 'lllll', .45, 'bell', { helper: true }),
  j: g('j', 'juh', .8, 'jet'),          v: g('v', 'vvvvv', .45, 'van'),      w: g('w', 'wuh', .8, 'web'),
  x: g('x', 'ks', .8, 'box'),           y: g('y', 'yuh', .8, 'yes'),         z: g('z', 'zzzzz', .45, 'zip'),
  qu: g('qu', 'kwuh', .8, 'queen'),
  sh: g('sh', 'shhhhh', .45, 'ship'),   ch: g('ch', 'chuh', .8, 'chick'),    th: g('th-thin', 'thhhh', .45, 'bath'),
  ng: g('ng', 'ng', .6, 'ring'),
  a_e: g('a-long', 'ay', .7, 'cake'),   i_e: g('i-long', 'eye', .7, 'kite'), o_e: g('o-long', 'oh', .7, 'bone'),
  u_e: g('u-long', 'you', .7, 'cube'),
  ee: g('e-long', 'ee', .7, 'bee'),     oa: g('o-long', 'oh', .7, 'boat'),   ai: g('a-long', 'ay', .7, 'rain'),
  oo: g('oo-moon', 'oo', .7, 'moon'),   ow: g('ow', 'ow', .7, 'cow'),        oi: g('oi', 'oy', .7, 'coin'),
  ar: g('ar', 'ar', .7, 'car'),         or: g('or', 'or', .7, 'fork'),       er: g('er', 'er', .7, 'her')
};
export const NAME_SAY = { a:'ay', b:'bee', c:'see', d:'dee', e:'ee', f:'eff', g:'jee', h:'aitch', i:'eye', j:'jay', k:'kay', l:'el', m:'em',
  n:'en', o:'oh', p:'pee', q:'cue', r:'ar', s:'ess', t:'tee', u:'you', v:'vee', w:'double you', x:'ex', y:'why', z:'zee' };

// ---- Pictures (Noto Emoji, stored in vendor/noto/) ------------------------------------------------
export const PICS = {
  ant:'🐜', apple:'🍎', balloon:'🎈', banana:'🍌', bat:'🦇', bath:'🛁', bear:'🐻', bed:'🛏️', bee:'🐝', bell:'🔔', bike:'🚲',
  boat:'⛵', bone:'🦴', box:'📦', bug:'🐛', bus:'🚌', cake:'🎂', can:'🥫', cap:'🧢', car:'🚗', cash:'💵', cat:'🐱',
  chair:'🪑', cheese:'🧀', cherries:'🍒', chick:'🐤', chocolate:'🍫', coat:'🧥', coin:'🪙', corn:'🌽', cow:'🐄', cube:'🧊',
  cup:'🥤', dish:'🍽️', dog:'🐶', dolphin:'🐬', door:'🚪', drum:'🥁', duck:'🦆', feet:'🦶', fire:'🔥', fish:'🐟', five:'5️⃣',
  fork:'🍴', fox:'🦊', frog:'🐸', game:'🎮', goat:'🐐', hat:'🎩', hen:'🐔', jar:'🫙', jeans:'👖', jellyfish:'🪼', jet:'✈️',
  juice:'🧃', king:'🤴', kite:'🪁', leg:'🦵', log:'🪵', map:'🗺️', milk:'🥛', monkey:'🐒', moon:'🌙', mouse:'🐭',
  mushroom:'🍄', nap:'😴', net:'🥅', nose:'👃', nut:'🥜', owl:'🦉', pan:'🍳', pear:'🍐', pen:'🖊️', penguin:'🐧', pig:'🐷',
  pin:'📌', pizza:'🍕', popcorn:'🍿', rain:'🌧️', rat:'🐀', ring:'💍', rose:'🌹', sandwich:'🥪', shark:'🦈', sheep:'🐑',
  shell:'🐚', ship:'🚢', shirt:'👕', shoe:'👟', six:'6️⃣', snail:'🐌', snake:'🐍', soap:'🧼', sock:'🧦', spoon:'🥄',
  star:'⭐', sun:'☀️', tap:'🚰', ten:'🔟', tree:'🌳', van:'🚐', vase:'🏺', vest:'🦺', violin:'🎻', volcano:'🌋', web:'🕸️',
  whale:'🐳', wing:'🪽'
};
// File name of a Noto Emoji picture: code points in hex, without the variation selector FE0F
export const emojiFile = e => 'emoji_u' + [...e].map(c => c.codePointAt(0)).filter(cp => cp !== 0xfe0f).map(cp => cp.toString(16).padStart(4, '0')).join('_') + '.svg';
export const picSrc = word => PICS[word] ? `vendor/noto/${emojiFile(PICS[word])}` : null;

// ---- Decodable words: the sounds to blend, in order ----------------------------------------------
export const WORDS = {
  pan:'p a n', pin:'p i n', ant:'a n t', tap:'t a p', nap:'n a p',
  cat:'c a t', dog:'d o g', map:'m a p', pig:'p i g', cap:'c a p', can:'c a n', sock:'s o ck',
  bed:'b e d', sun:'s u n', bug:'b u g', hen:'h e n', rat:'r a t', bus:'b u s', nut:'n u t', hat:'h a t', bat:'b a t',
  leg:'l e g', net:'n e t', log:'l o g', ten:'t e n', cup:'c u p', pen:'p e n',
  jet:'j e t', van:'v a n', web:'w e b', fox:'f o x', box:'b o x', six:'s i x',
  ship:'sh i p', fish:'f i sh', dish:'d i sh', shell:'sh e ll', chick:'ch i ck', bath:'b a th', ring:'r i ng',
  king:'k i ng', wing:'w i ng', cash:'c a sh',
  cake:'c a_e k', kite:'k i_e t', bone:'b o_e n', cube:'c u_e b', rose:'r o_e z', nose:'n o_e z', bike:'b i_e k',
  five:'f i_e v', game:'g a_e m', snake:'s n a_e k',
  bee:'b ee', tree:'t r ee', feet:'f ee t', sheep:'sh ee p', boat:'b oa t', goat:'g oa t', coat:'c oa t', rain:'r ai n',
  snail:'s n ai l', moon:'m oo n', spoon:'s p oo n', cow:'c ow', owl:'ow l', coin:'c oi n', car:'c ar', star:'s t ar',
  fork:'f or k', corn:'c or n'
};
export const phonemes = word => (WORDS[word] || '').split(' ').filter(Boolean);

// ---- Rhymes: the child hears the first word and picks the picture that rhymes ------------------------
export const RHYMES = [['fun','sun'],['hug','bug'],['box','fox'],['red','bed'],['ten','pen'],['hat','cat'],['log','dog'],['far','car'],['make','cake'],['dish','fish']]
  .map(([cue, w]) => ({ cue, w }));

// ---- Sight words: Fry's first 300, in order ------------------------------------------------------
export const FRY = (
  'the of and a to in is you that it he was for on are as with his they I at be this have from or one had by words but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part ' +
  'over new sound take only little work know place year live me back give most very after thing our just name good sentence man think say great where help through much before line right too mean old any same tell boy follow came want show also around form three small set put end does another well large must big even such because turn here why ask went men read need land different home us move try kind hand picture again change off play spell air away animal house point page letter mother answer found study still learn should America world ' +
  'high every near add food between own below country plant last school father keep tree never start city earth eye light thought head under story saw left don\'t few while along might close something seem next hard open example begin life always those both paper together got group often run important until children side feet car mile night walk white sea began grow took river four carry state once book hear stop without second late miss idea enough eat face watch far Indian real almost let above girl sometimes mountain cut young talk soon list song being leave family it\'s'
).split(' ');

// ---- Stickers, one per level in order (Noto Emoji) ----------------------------------------------
export const STICKERS = [
  ['Star','⭐'], ['Rocket','🚀'], ['Fish','🐠'], ['Bird','🐦'], ['Crown','👑'], ['Rabbit','🐰'], ['Turtle','🐢'], ['Boat','⛵'],
  ['Flower','🌸'], ['Trophy','🏆'], ['Unicorn','🦄'], ['Dinosaur','🦕'], ['Rainbow','🌈'], ['Octopus','🐙'], ['Butterfly','🦋'],
  ['Lion','🦁'], ['Panda','🐼'], ['Frog','🐸'], ['Owl','🦉'], ['Penguin','🐧'], ['Dolphin','🐬'], ['Koala','🐨'], ['Fox','🦊'],
  ['Tiger','🐯'], ['Whale','🐳'], ['Ladybug','🐞'], ['Hedgehog','🦔'], ['Sloth','🦥'], ['Parrot','🦜'], ['Peacock','🦚'],
  ['Balloon','🎈'], ['Kite','🪁'], ['Guitar','🎸'], ['Robot','🤖'], ['Planet','🪐'], ['Cupcake','🧁'], ['Ice cream','🍦'], ['Sunflower','🌻']
].map(([name, emoji]) => ({ name, emoji, src: `vendor/noto/${emojiFile(emoji)}` }));

// ---- The teaching order -----------------------------------------------------------------------
// Level types: sounds (pop the letter that makes a sound), names (pop the letter with a name),
// sort (sort pictures by a sound), blend (hear sounds, pick the picture), read (read a word, pick the picture),
// rhyme (pick the picture that rhymes), sight (pop the sight word).
const sounds = (pool, title = 'Letter sounds') => ({ type: 'sounds', title, pool: pool.split(' ') });
const names = pool => ({ type: 'names', title: 'Letter names', pool: pool.split(' ') });
const sort = (ask, a, b, items, title) => ({ type: 'sort', ask, bins: [a, b], items: [...items[0].split(' ').map(w => ({ w, bin: 0 })), ...items[1].split(' ').map(w => ({ w, bin: 1 }))], title });
const blend = words => ({ type: 'blend', title: 'Blend it', words: words.split(' ') });
const read = words => ({ type: 'read', title: 'Read it', words: words.split(' ') });
const sight = (from, to, title) => ({ type: 'sight', title: title || `Sight words ${from}–${to}`, pool: FRY.slice(from - 1, to), tiles: to - from >= 40 ? 5 : 4 });
const rhyme = () => ({ type: 'rhyme', title: 'Rhyme time', pairs: RHYMES });

export const STAGES = [
  { title: 'Stage 1', sounds: 's a t p i n', levels: [
    sounds('s a t p i n'), names('s a t p i n'),
    sort('start', 's', 'p', ['sock snake sandwich star six', 'pen pizza pear penguin popcorn'], 'First sounds: s or p'),
    blend('pan pin ant tap nap'), sight(1, 25, 'Word pop 1') ] },
  { title: 'Stage 2', sounds: 'm d g o c k ck', levels: [
    sounds('m d g o c k ck'), names('m d g o c k'),
    sort('start', 'm', 'd', ['mouse monkey milk mushroom map', 'duck door dolphin drum'], 'First sounds: m or d'),
    blend('cat dog map pig cap can sock'), read('cat dog map pig cap pan pin ant'), sight(26, 50, 'Word pop 2') ] },
  { title: 'Stage 3', sounds: 'e u r h b f l', levels: [
    sounds('e u r h b f l'), names('e u r h b f l'),
    sort('start', 'b', 'f', ['banana bear balloon bell bus', 'fox frog fire fork'], 'First sounds: b or f'),
    blend('bed sun bug hen rat bus nut hat bat leg net log ten cup pen'), rhyme(), sight(51, 100, 'Word pop 3') ] },
  { title: 'Stage 4', sounds: 'j v w x y z qu', levels: [
    sounds('j v w x y z qu'), names('j v w x y z q'),
    sort('start', 'j', 'v', ['jellyfish juice jeans jar', 'violin volcano vase vest'], 'First sounds: j or v'),
    blend('jet van web fox box six'), read('jet van web fox box six bed bug hat'), sight(101, 150, 'Word pop 4') ] },
  { title: 'Stage 5', sounds: 'sh ch th ng', levels: [
    sounds('sh ch th ng'),
    sort('start', 'sh', 'ch', ['sheep shoe shirt shark shell', 'cheese cherries chair chocolate'], 'sh or ch'),
    blend('ship fish dish shell chick bath ring king wing cash'), read('ship fish chick bath ring king'), sight(151, 200, 'Word pop 5') ] },
  { title: 'Stage 6', sounds: 'a_e i_e o_e u_e', levels: [
    sounds('a_e i_e o_e u_e', 'Magic e'),
    sort('has', 'a', 'a_e', ['cat map hat bat cap', 'game snake whale'], 'Short a or long a'),
    blend('cake kite bone cube rose nose bike five game snake'), read('cake kite bone cube nose bike five'), sight(201, 250, 'Word pop 6') ] },
  { title: 'Stage 7', sounds: 'ee oa ai oo ow oi ar or er', levels: [
    sounds('ee oa ai oo ow oi ar or er', 'Vowel teams'),
    sort('has', 'ee', 'oa', ['tree feet sheep cheese', 'goat coat soap'], 'ee or oa'),
    blend('bee tree feet sheep boat goat rain snail moon spoon cow owl coin car star fork corn'),
    read('bee tree boat goat rain moon cow coin car star'), sight(251, 300, 'Word boss') ] }
];

// Every level in play order, numbered from 1, with its stage and sticker
// id: stable name for saved progress (stage + level type, e.g. "s2-blend"), so adding or reordering levels keeps progress right
export const LEVELS = STAGES.flatMap((st, si) => st.levels.map(l => ({ ...l, stage: si, id: `s${si + 1}-${l.type}` }))).map((l, i) => ({ ...l, n: i + 1, sticker: STICKERS[i] }));
STAGES.forEach((st, si) => { st.first = LEVELS.findIndex(l => l.stage === si); st.count = st.levels.length; });

// ---- When each sound is taught, and which words a child can decode by then -----------------------
// Stage (0-based) where each sound is first taught in a letter-sounds level
export const TAUGHT_BY = {};
LEVELS.forEach(l => { if (l.type === 'sounds') l.pool.forEach(gr => { if (!(gr in TAUGHT_BY)) TAUGHT_BY[gr] = l.stage; }); });
// A helper spelling (ll) counts as taught once the sound it shares a recording with is taught
export const soundStage = gr => {
  if (!GRAPHEMES[gr]) return undefined;
  if (!GRAPHEMES[gr].helper) return TAUGHT_BY[gr];
  const base = Object.entries(GRAPHEMES).find(([k, v]) => !v.helper && v.clip === GRAPHEMES[gr].clip);
  return base ? TAUGHT_BY[base[0]] : undefined;
};
// Words with a picture whose sounds are all taught by the given stage
export const decodableBy = stage => Object.keys(WORDS).filter(w => PICS[w] && phonemes(w).every(gr => soundStage(gr) !== undefined && soundStage(gr) <= stage));

// How alike two words sound, for choosing wrong options in Blend it and Read it. Higher = more alike.
// Sharing the first or last sound means a child can't pick the answer from that sound alone.
export function soundSimilarity(a, b) {
  const A = phonemes(a), B = phonemes(b);
  let s = 0;
  if (A[0] === B[0]) s += 3;
  if (A[A.length - 1] === B[B.length - 1]) s += 2;
  if (A.length === B.length) s += 1;
  s += A.filter(x => B.includes(x)).length * 0.5;
  return s;
}

// ---- Coverage check: run by tests/ and shown in test mode ----------------------------------------
// Returns a list of problems (empty when everything is covered and in order). The unit tests pass in
// deliberately broken content to prove each rule catches its mistake.
export function coverage({ levels = LEVELS, graphemes = GRAPHEMES, pics = PICS, words = WORDS, stickers = STICKERS, fry = FRY } = {}) {
  const problems = [];
  const phon = w => (words[w] || '').split(' ').filter(Boolean);
  const taughtBy = {};
  levels.forEach(l => { if (l.type === 'sounds') l.pool.forEach(gr => { if (!(gr in taughtBy)) taughtBy[gr] = l.stage; }); });
  const stageOfSound = gr => {
    if (!graphemes[gr]) return undefined;
    if (!graphemes[gr].helper) return taughtBy[gr];
    const base = Object.entries(graphemes).find(([k, v]) => !v.helper && v.clip === graphemes[gr].clip);
    return base ? taughtBy[base[0]] : undefined;
  };
  const named = new Set(levels.filter(l => l.type === 'names').flatMap(l => l.pool));

  for (const ch of 'abcdefghijklmnopqrstuvwxyz') {
    if (!Object.keys(taughtBy).some(gr => gr.replace('_', '').includes(ch))) problems.push(`No letter-sounds level teaches "${ch}"`);
    if (!named.has(ch)) problems.push(`No letter-names level covers "${ch}"`);
  }
  for (const [gr, info] of Object.entries(graphemes)) {
    if (!SOUND_IDS.has(info.clip)) problems.push(`Sound "${gr}" uses recording "${info.clip}", which isn't in sounds.js`);
    if (!info.helper && !(gr in taughtBy)) problems.push(`Sound "${gr}" is never taught in a letter-sounds level`);
  }
  if (levels.length !== stickers.length) problems.push(`${levels.length} levels but ${stickers.length} stickers`);
  const ids = levels.map(l => l.id);
  for (const id of new Set(ids)) if (ids.filter(x => x === id).length > 1) problems.push(`Level id "${id}" is used more than once (saved progress would mix them up)`);

  for (const l of levels) {
    const where = `Level ${l.n} (${l.title})`;
    const ws = l.type === 'blend' || l.type === 'read' ? l.words : l.type === 'sort' ? l.items.map(x => x.w) : l.type === 'rhyme' ? l.pairs.map(p => p.w) : [];
    for (const w of ws) if (!pics[w]) problems.push(`${where}: no picture for "${w}"`);
    if (l.type === 'blend' || l.type === 'read') {
      if (l.words.length < 3) problems.push(`${where}: needs at least 3 words`);
      for (const w of l.words) {
        const ph = phon(w);
        if (!ph.length) { problems.push(`${where}: "${w}" has no sounds listed in WORDS`); continue; }
        for (const gr of ph) {
          if (!graphemes[gr]) { problems.push(`${where}: "${w}" uses unknown sound "${gr}"`); continue; }
          const st = stageOfSound(gr);
          if (st === undefined || st > l.stage) problems.push(`${where}: "${w}" uses "${gr}", which isn't taught until ${st === undefined ? 'never' : 'stage ' + (st + 1)}`);
        }
      }
    }
    if (l.type === 'sort') for (const b of l.bins) {
      if (!graphemes[b]) { problems.push(`${where}: unknown sound "${b}"`); continue; }
      // the bin shows its example word's picture, so that word can't also be one of the pictures to sort
      if (l.items.some(x => x.w === graphemes[b].ex)) problems.push(`${where}: "${graphemes[b].ex}" is both the "${b}" bin picture and a picture to sort`);
    }
    if (l.type === 'sounds') for (const gr of l.pool) if (!graphemes[gr]) problems.push(`${where}: unknown sound "${gr}"`);
    if (l.type === 'sight' && l.pool.length < l.tiles) problems.push(`${where}: fewer words than tiles`);
  }
  if (fry.length !== 300) problems.push(`Fry list has ${fry.length} words, expected 300`);
  return problems;
}

// Every picture file the game needs (for downloading and for the checks)
export const allPictureFiles = () => [...new Set([...Object.values(PICS), ...STICKERS.map(s => s.emoji)].map(emojiFile))];
