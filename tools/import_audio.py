#!/usr/bin/env python3
"""Import recordings from the recorder's zip into audio/ and rebuild audio/manifest.json.

Usage: python3 tools/import_audio.py ~/Downloads/word-path-audio-YYYY-MM-DD.zip

Only files named after a sound in sounds.js are imported; anything else is skipped and listed.
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

def check(path, kind):
    with wave.open(str(path)) as w:
        if w.getnchannels() != 1 or w.getsampwidth() != 2:
            return None, 'not mono 16-bit'
        dur = w.getnframes() / w.getframerate()
    note = ''
    if kind == 'hold' and dur < 0.9: note = 'short for a held sound'
    elif kind == 'short' and dur > 0.75: note = 'long for a quick sound'
    elif kind in ('vowel', 'name') and dur > 1.8: note = 'long'
    elif dur < 0.08: note = 'nearly empty'
    return dur, note

def main(zpath):
    kinds = sound_list()
    AUDIO.mkdir(exist_ok=True)
    imported, skipped = [], []
    with zipfile.ZipFile(zpath) as z:
        for info in z.infolist():
            name = Path(info.filename).name
            cid = name[:-4] if name.endswith('.wav') else None
            if not cid or cid not in kinds or info.file_size > 2_000_000:
                skipped.append(info.filename); continue
            (AUDIO / name).write_bytes(z.read(info))
            imported.append(cid)
    present = sorted(p.stem for p in AUDIO.glob('*.wav') if p.stem in kinds)
    (AUDIO / 'manifest.json').write_text(json.dumps({'clips': present}, indent=2) + '\n')

    print(f'Imported {len(imported)} recordings; {len(present)} of {len(kinds)} sounds now recorded.')
    for cid in present:
        dur, note = check(AUDIO / f'{cid}.wav', kinds[cid])
        if note: print(f'  check {cid}: {dur:.2f}s, {note}' if dur is not None else f'  check {cid}: {note}')
    missing = [k for k in kinds if k not in present]
    if missing: print('Not recorded yet:', ', '.join(missing))
    if skipped: print('Skipped (not a known sound):', ', '.join(skipped))

if __name__ == '__main__':
    if len(sys.argv) != 2: sys.exit(__doc__)
    main(sys.argv[1])
