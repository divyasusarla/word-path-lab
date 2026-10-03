#!/usr/bin/env python3
"""Import recordings from the recorder's zip into audio/ and rebuild audio/manifest.json.

Usage: python3 tools/import_audio.py ~/Downloads/word-path-audio-YYYY-MM-DD.zip [--drop-first SECONDS]

--drop-first cuts that much from the start of every clip before cleaning. Use 0.2 for recordings made
before the recorder ignored its first quarter-second (the 2026-10-02 batch), which start with key clicks.

Imported: files named after a sound in sounds.js, and words and lines from script.js (word-<word>.wav and
say-<line>.wav; script.js builds that list from the levels, and the checks make sure every one is valid).
Anything else is skipped and listed.
Clips already in audio/ that aren't in the zip are kept, so recordings can arrive in batches.
"""
import json, re, sys, wave, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / 'audio'

def sound_list():
    src = (ROOT / 'sounds.js').read_text()
    ids = re.findall(r"s\('([a-z-]+)',\s*'[^']*',\s*'([a-z-]+)',\s*'([a-z]+)'", src)
    kinds = {i: k for i, _, k in ids}
    for c in 'abcdefghijklmnopqrstuvwxyz':
        kinds[f'name-{c}'] = 'name'
    return kinds

SCRIPT_ID = re.compile(r'^(word|say)-[a-z0-9]+(-[a-z0-9]+)*$')
def kind_of(cid, kinds):
    if cid in kinds: return kinds[cid]
    if SCRIPT_ID.match(cid): return 'word' if cid.startswith('word-') else 'phrase'
    return None

RATE_OUT_RMS, PEAK_CAP = 0.15, 0.89
# Voiceless sounds have nothing below a few hundred Hz, so anything there is rumble (fans, hum, desk bumps)
VOICELESS = {'s', 'f', 'sh', 'th-thin', 'h', 'p', 't', 'k', 'ch', 'x'}

def high_pass(x, rate, cutoff, passes=1):
    """Remove sound below `cutoff` Hz (2nd-order Butterworth biquad; each pass adds 12 dB/octave)."""
    import math
    w0 = 2 * math.pi * cutoff / rate; alpha = math.sin(w0) / (2 * 0.7071); c = math.cos(w0)
    a0 = 1 + alpha
    b0, b1, b2 = (1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0
    a1, a2 = -2 * c / a0, (1 - alpha) / a0
    for _ in range(passes):
        y, x1, x2, y1, y2 = [], 0.0, 0.0, 0.0, 0.0
        for v in x:
            out = b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
            x2, x1, y2, y1 = x1, v, y1, out
            y.append(out)
        x = y
    return x

def clean(path, drop_first=0.0, voiceless=False, gap_ms=120):
    """Keep only the spoken sound: drop key clicks and gaps before/after it, then even out the volume.

    Splits the clip into bursts of sound, joins bursts less than gap_ms apart, and keeps the burst
    with the most energy (the voice). Clicks are short and far from the voice, so they fall away.
    Words and lines use a longer gap_ms, so pauses inside them (a stop in "cat", a breath in a line) are kept.
    """
    import math, struct
    with wave.open(str(path)) as w:
        r, n = w.getframerate(), w.getnframes()
        x = [v / 32768 for v in struct.unpack(f'<{n}h', w.readframes(n))]
    x = x[int(r * drop_first):]; n = len(x)
    # rumble filter: everything below 80 Hz always; below 300 Hz (steeper) for voiceless sounds
    x = high_pass(x, r, 300, passes=2) if voiceless else high_pass(x, r, 80)
    win = max(1, int(r * 0.01))
    env = [math.sqrt(sum(v * v for v in x[i:i + win]) / win) for i in range(0, n - win + 1, win)]
    if not env: return None
    thr = max(max(env) * 0.08, 0.003)
    segs, start = [], None
    for i, e in enumerate(env + [0]):
        if e > thr and start is None: start = i
        if e <= thr and start is not None: segs.append([start, i]); start = None
    merged = []
    for sg in segs:
        if merged and sg[0] - merged[-1][1] <= gap_ms // 10: merged[-1][1] = sg[1]
        else: merged.append(sg)
    a, b = max(merged, key=lambda sg: sum(e * e for e in env[sg[0]:sg[1]]))
    top = max(env[a:b])
    while a < b - 1 and env[a] < top * 0.2: a += 1        # quiet lead-in (room noise, breath)
    a = max(0, a - 4)                                     # keep 40 ms before it so soft starts (f, s) aren't clipped
    while b > a + 1 and env[b - 1] < top * 0.04: b -= 1   # long near-silent tail
    lo, hi = max(0, a * win - int(r * 0.04)), min(n, b * win + int(r * 0.1))
    y = x[lo:hi]
    voiced = [e for e in env[a:b] if e > thr] or env[a:b]
    rms = math.sqrt(sum(e * e for e in voiced) / len(voiced))
    peak = max(abs(v) for v in y) or 1
    g = min(RATE_OUT_RMS / rms, PEAK_CAP / peak)
    fade = int(r * 0.008)
    y = [v * g * min(1, i / fade, (len(y) - 1 - i) / fade) for i, v in enumerate(y)]
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(r)
        w.writeframes(struct.pack(f'<{len(y)}h', *(int(max(-1, min(1, v)) * 32767) for v in y)))
    return (hi - lo) / r

def check(path, kind):
    with wave.open(str(path)) as w:
        if w.getnchannels() != 1 or w.getsampwidth() != 2:
            return None, 'not mono 16-bit'
        dur = w.getnframes() / w.getframerate()
    note = ''
    if kind == 'hold' and dur < 0.9: note = 'short for a held sound'
    elif kind == 'short' and dur > 0.75: note = 'long for a quick sound'
    elif kind in ('vowel', 'name') and dur > 1.8: note = 'long'
    elif kind == 'word' and dur > 1.8: note = 'long for one word'
    elif kind == 'phrase' and dur > 6: note = 'long for a line'
    elif dur < 0.08: note = 'nearly empty'
    return dur, note

def main(zpath, drop_first=0.0):
    kinds = sound_list()
    AUDIO.mkdir(exist_ok=True)
    imported, skipped = [], []
    with zipfile.ZipFile(zpath) as z:
        for info in z.infolist():
            name = Path(info.filename).name
            cid = name[:-4] if name.endswith('.wav') else None
            kind = kind_of(cid, kinds) if cid else None
            if not kind or info.file_size > 2_000_000:
                skipped.append(info.filename); continue
            (AUDIO / name).write_bytes(z.read(info))
            clean(AUDIO / name, drop_first, voiceless=cid in VOICELESS, gap_ms=120 if cid in kinds else 600)
            imported.append(cid)
    present = sorted(p.stem for p in AUDIO.glob('*.wav') if kind_of(p.stem, kinds))
    (AUDIO / 'manifest.json').write_text(json.dumps({'clips': present}, indent=2) + '\n')

    sounds = [c for c in present if c in kinds]
    print(f'Imported {len(imported)} recordings; {len(sounds)} of {len(kinds)} letter sounds and {len(present) - len(sounds)} words and lines now recorded.')
    for cid in present:
        dur, note = check(AUDIO / f'{cid}.wav', kind_of(cid, kinds))
        if note: print(f'  check {cid}: {dur:.2f}s, {note}' if dur is not None else f'  check {cid}: {note}')
    missing = [k for k in kinds if k not in present]
    if missing: print('Letter sounds not recorded yet:', ', '.join(missing))
    if skipped: print('Skipped (not a known sound):', ', '.join(skipped))

if __name__ == '__main__':
    args = sys.argv[1:]
    drop = 0.0
    if '--drop-first' in args:
        i = args.index('--drop-first'); drop = float(args[i + 1]); del args[i:i + 2]
    if len(args) != 1: sys.exit(__doc__)
    main(args[0], drop)
