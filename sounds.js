// Every recorded clip the game can use: 43 speech sounds + 26 letter names.
// Used by the recorder (tools/record.html) and the game (app.js). Recordings live in audio/<id>.wav.
// kind sets the recorder's length guidance: hold (~2s), short (crisp, no "uh"), vowel, name.

export const GROUPS = [
  { key: 'short-vowels', title: 'Short vowels', note: 'Clear and about one second long.' },
  { key: 'hold', title: 'Hold-able sounds', note: 'Stretch each one for about two seconds. Don\'t add a vowel before or after.' },
  { key: 'short', title: 'Quick sounds', note: 'Short and crisp. The most common mistake is adding "uh" at the end ("buh"). Clip it off.' },
  { key: 'pairs', title: 'Letter pairs', note: 'Two letters, one sound (x and qu are two sounds said together).' },
  { key: 'long-vowels', title: 'Long vowels', note: 'Say the vowel\'s name, about one second long.' },
  { key: 'patterns', title: 'Vowel patterns', note: 'For the later vowel-team levels. About one second each.' },
  { key: 'names', title: 'Letter names', note: 'Say the letter\'s name, as in the alphabet song.' }
];

const s = (id, show, group, kind, example, how) => ({ id, show, group, kind, example, how });

export const SOUNDS = [
  s('a-short', 'a', 'short-vowels', 'vowel', 'apple', 'The start of apple or at: mouth wide, almost a smile. Not "ah" as in father.'),
  s('e-short', 'e', 'short-vowels', 'vowel', 'egg', '"e" as at the start of egg'),
  s('i-short', 'i', 'short-vowels', 'vowel', 'itch', '"i" as at the start of itch'),
  s('o-short', 'o', 'short-vowels', 'vowel', 'octopus', '"o" as at the start of octopus'),
  s('u-short', 'u', 'short-vowels', 'vowel', 'up', '"u" as at the start of up'),

  s('m', 'm', 'hold', 'hold', 'moon', 'Lips closed, hum: mmmm'),
  s('s', 's', 'hold', 'hold', 'sun', 'Like a snake: ssss. Not "es".'),
  s('f', 'f', 'hold', 'hold', 'fish', 'Top teeth on bottom lip, blow: ffff'),
  s('n', 'n', 'hold', 'hold', 'nest', 'Tongue up behind your teeth, hum: nnnn'),
  s('l', 'l', 'hold', 'hold', 'leg', 'Tongue up behind your teeth: llll. Not "el".'),
  s('r', 'r', 'hold', 'hold', 'rat', 'rrrr, with no "er" before it'),
  s('v', 'v', 'hold', 'hold', 'van', 'A buzzy f: vvvv'),
  s('z', 'z', 'hold', 'hold', 'zip', 'A buzzy s: zzzz'),

  s('b', 'b', 'short', 'short', 'bat', 'Lips pop: b. Not "buh".'),
  s('k', 'c / k', 'short', 'short', 'cat', 'A quick click at the back of the mouth: k. Also used for ck.'),
  s('d', 'd', 'short', 'short', 'dog', 'Tongue taps behind the teeth: d. Not "duh".'),
  s('g', 'g', 'short', 'short', 'goat', 'The g in goat: g. Not "guh".'),
  s('h', 'h', 'short', 'short', 'hat', 'Just a breath out: h. Not "huh".'),
  s('j', 'j', 'short', 'short', 'jam', 'The j in jam: j. Not "juh".'),
  s('p', 'p', 'short', 'short', 'pig', 'A puff of air with no voice: p'),
  s('t', 't', 'short', 'short', 'top', 'A tiny tap with no voice: t. Almost a whisper.'),
  s('w', 'w', 'short', 'short', 'web', 'Round lips, then let go: w. Also used for wh.'),
  s('y', 'y', 'short', 'short', 'yes', 'The start of yes, without the "es"'),

  s('qu', 'qu', 'pairs', 'short', 'queen', 'k and w together: kw'),
  s('x', 'x', 'pairs', 'short', 'box', 'The end of box: ks'),
  s('sh', 'sh', 'pairs', 'hold', 'ship', 'Quiet please: shhhh'),
  s('ch', 'ch', 'pairs', 'short', 'chin', 'A quick sneeze: ch. Not "chuh".'),
  s('th-thin', 'th', 'pairs', 'hold', 'thin', 'Tongue between teeth, no voice: thhhh (as in thin)'),
  s('th-this', 'th', 'pairs', 'hold', 'this', 'Tongue between teeth, with voice: thhhh (as in this)'),
  s('ng', 'ng', 'pairs', 'hold', 'ring', 'The end of ring, hummed: nggg'),

  s('a-long', 'a', 'long-vowels', 'vowel', 'cake', '"ay" as in cake'),
  s('e-long', 'e', 'long-vowels', 'vowel', 'feet', '"ee" as in feet'),
  s('i-long', 'i', 'long-vowels', 'vowel', 'bike', '"eye" as in bike'),
  s('o-long', 'o', 'long-vowels', 'vowel', 'boat', '"oh" as in boat'),
  s('u-long', 'u', 'long-vowels', 'vowel', 'cute', '"you" as in cute'),

  s('oo-moon', 'oo', 'patterns', 'vowel', 'moon', '"oo" as in moon'),
  s('oo-book', 'oo', 'patterns', 'vowel', 'book', '"oo" as in book'),
  s('ow', 'ow', 'patterns', 'vowel', 'cow', '"ow" as in cow'),
  s('oi', 'oi', 'patterns', 'vowel', 'coin', '"oy" as in coin'),
  s('ar', 'ar', 'patterns', 'vowel', 'car', '"ar" as in car'),
  s('or', 'or', 'patterns', 'vowel', 'fork', '"or" as in fork'),
  s('er', 'er', 'patterns', 'vowel', 'her', '"er" as in her'),
  s('aw', 'aw', 'patterns', 'vowel', 'saw', '"aw" as in saw'),

  ...'ay bee see dee ee eff jee aitch eye jay kay el em en oh pee cue ar ess tee you vee double-you ex why zee'.split(' ')
    .map((say, i) => { const L = String.fromCharCode(97 + i); return s(`name-${L}`, L.toUpperCase(), 'names', 'name', '', `Say "${say.replace('-', ' ')}"`); })
];

export const SOUND_IDS = new Set(SOUNDS.map(x => x.id));
