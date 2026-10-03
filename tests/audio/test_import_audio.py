"""Tests for tools/import_audio.py, using made-up recordings (tones, clicks, rumble) instead of a voice.

Run: python3 -m unittest discover -s tests/audio   (GitHub Actions runs this in the Checks job)
"""
import io, json, math, struct, sys, tempfile, unittest, wave, zipfile
from contextlib import redirect_stdout
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools'))
import import_audio as ia

RATE = 22050

def tone(sec, amp=0.3, freq=220):
    return [amp * math.sin(2 * math.pi * freq * i / RATE) for i in range(int(sec * RATE))]

def silence(sec):
    return [0.0] * int(sec * RATE)

def click(amp=0.7):
    return tone(0.015, amp, 3000)

def wav_bytes(samples):
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE)
        w.writeframes(struct.pack(f'<{len(samples)}h', *(int(max(-1, min(1, v)) * 32767) for v in samples)))
    return buf.getvalue()

def read(path):
    with wave.open(str(path)) as w:
        n = w.getnframes()
        return [v / 32768 for v in struct.unpack(f'<{n}h', w.readframes(n))]

def rms(x):
    return math.sqrt(sum(v * v for v in x) / max(1, len(x)))

def low_energy(x, cutoff=100):
    """Share of the signal's energy below `cutoff` Hz (a simple one-pole low-pass, enough to compare)."""
    a, y, out = math.exp(-2 * math.pi * cutoff / RATE), 0.0, []
    for v in x:
        y = (1 - a) * v + a * y; out.append(y)
    return sum(v * v for v in out) / max(1e-12, sum(v * v for v in x))


class ImportAudio(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.audio = Path(self.tmp.name) / 'audio'
        self.old = ia.AUDIO
        ia.AUDIO = self.audio

    def tearDown(self):
        ia.AUDIO = self.old
        self.tmp.cleanup()

    def run_import(self, files, drop_first=0.0):
        z = Path(self.tmp.name) / 'batch.zip'
        with zipfile.ZipFile(z, 'w') as zf:
            for name, data in files.items():
                zf.writestr(name, data)
        out = io.StringIO()
        with redirect_stdout(out):
            ia.main(str(z), drop_first)
        return out.getvalue()

    def duration(self, cid):
        return len(read(self.audio / f'{cid}.wav')) / RATE

    def manifest(self):
        return json.loads((self.audio / 'manifest.json').read_text())['clips']

    def test_letter_sound_drops_a_key_click_before_it(self):
        self.run_import({'m.wav': wav_bytes(silence(0.2) + click() + silence(0.5) + tone(1.5) + silence(0.3))})
        self.assertAlmostEqual(self.duration('m'), 1.5, delta=0.2)

    def test_line_keeps_its_pause_and_drops_a_late_click(self):
        line = tone(0.4) + silence(0.3) + tone(0.5)
        self.run_import({'say-try-again.wav': wav_bytes(silence(0.3) + line + silence(1.0) + click() + silence(0.2))})
        self.assertAlmostEqual(self.duration('say-try-again'), 1.2, delta=0.2)

    def test_letter_sound_still_keeps_only_the_loudest_burst(self):
        # letter sounds keep the 120 ms join, so a separate burst 300 ms away is dropped (it would be an "uh")
        self.run_import({'b.wav': wav_bytes(silence(0.2) + tone(0.3) + silence(0.3) + tone(0.1, 0.1) + silence(0.2))})
        self.assertLess(self.duration('b'), 0.5)

    def test_word_keeps_the_gap_inside_it(self):
        self.run_import({'word-cat.wav': wav_bytes(silence(0.3) + tone(0.2) + silence(0.08) + tone(0.3) + silence(0.4))})
        self.assertAlmostEqual(self.duration('word-cat'), 0.58 + 0.14, delta=0.1)  # plus the 40 ms lead-in and 100 ms tail kept

    def test_unknown_and_oversized_files_are_skipped(self):
        out = self.run_import({'bogus.wav': wav_bytes(tone(0.3)), 'Word-Cat.wav': wav_bytes(tone(0.3)),
                               'word-.wav': wav_bytes(tone(0.3)), 'notes.txt': b'hi',
                               'say-huge.wav': b'0' * 2_000_001, 'p.wav': wav_bytes(tone(0.2))})
        self.assertEqual(self.manifest(), ['p'])
        for name in ('bogus.wav', 'Word-Cat.wav', 'word-.wav', 'notes.txt', 'say-huge.wav'):
            self.assertIn(name, out)

    def test_batches_add_to_what_is_already_there(self):
        self.run_import({'word-cat.wav': wav_bytes(tone(0.5)), 's.wav': wav_bytes(tone(1.2))})
        self.run_import({'say-yes.wav': wav_bytes(tone(0.4))})
        self.assertEqual(self.manifest(), ['s', 'say-yes', 'word-cat'])

    def test_volume_is_evened_out(self):
        self.run_import({'word-quiet.wav': wav_bytes(tone(0.6, 0.02)), 'word-loud.wav': wav_bytes(tone(0.6, 0.6))})
        q, l = rms(read(self.audio / 'word-quiet.wav')), rms(read(self.audio / 'word-loud.wav'))
        self.assertAlmostEqual(q, l, delta=0.03)
        self.assertLessEqual(max(abs(v) for v in read(self.audio / 'word-loud.wav')), 0.9)

    def test_rumble_is_filtered_hardest_from_voiceless_sounds(self):
        hum = [0.2 * math.sin(2 * math.pi * 50 * i / RATE) for i in range(int(1.5 * RATE))]
        hiss = [h + v for h, v in zip(hum, tone(1.5, 0.3, 4000))]
        self.run_import({'s.wav': wav_bytes(hiss), 'word-sun.wav': wav_bytes(hiss)})
        before, s, word = low_energy(hiss), low_energy(read(self.audio / 's.wav')), low_energy(read(self.audio / 'word-sun.wav'))
        self.assertLess(s, before * 0.05)
        self.assertLess(word, before * 0.5)
        self.assertLess(s, word)

    def test_drop_first_cuts_the_start(self):
        self.run_import({'n.wav': wav_bytes(click(0.9) + silence(0.05) + tone(1.2))}, drop_first=0.05)
        self.assertAlmostEqual(self.duration('n'), 1.2, delta=0.2)

    def test_checks_flag_clips_that_look_wrong(self):
        out = self.run_import({'word-long.wav': wav_bytes(tone(2.5)), 'm.wav': wav_bytes(tone(0.4)), 'say-long.wav': wav_bytes(tone(7))})
        self.assertIn('word-long', out); self.assertIn('long for one word', out)
        self.assertIn('short for a held sound', out)
        self.assertIn('long for a line', out)

    def test_every_letter_sound_in_sounds_js_is_known(self):
        kinds = ia.sound_list()
        self.assertEqual(len(kinds), 69)
        self.assertEqual(ia.kind_of('word-cat', kinds), 'word')
        self.assertEqual(ia.kind_of('say-try-again', kinds), 'phrase')
        self.assertIsNone(ia.kind_of('cat', kinds))


if __name__ == '__main__':
    unittest.main()
