"""Verify retained evidence bytes and reproduce prose-volume measurements.

Run with Python 3. No provider/network calls and no normalization of originals.
The text export is unsuitable for aggregate native combining-mark measurement.
"""
from pathlib import Path
import hashlib
import json
import unicodedata

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'evidence-manifest.json').read_text())
for item in manifest['files']:
    data = (root / item['path']).read_bytes()
    assert len(data) == item['bytes'], item['path']
    assert hashlib.sha256(data).hexdigest() == item['sha256'], item['path']
for name in ('MARROWLINE', 'GEMINI'):
    raw = (root / (name.lower() + '-example-as-exported.txt')).read_text()
    plain = ''.join(c for c in raw if not unicodedata.category(c).startswith('M'))
    if name == 'MARROWLINE':
        first, second = plain.split('\nKʰonapolit\n', 1)[1].split('\nTauric Diana bots\n', 1)
    else:
        first, second = plain.split('[Kʰonapolit]', 1)[1].split('[Tauric Diana Bots : Closing Transmission]', 1)
    actual = {'khonapolit_whitespace_words': len(first.split()),
              'bots_whitespace_words': len(second.split()),
              'combined_whitespace_words': len(first.split()) + len(second.split())}
    assert actual == manifest['word_counts'][name], name
    print(name, actual)
print('PASS: retained-file hashes and word measurements; literary recovery untested.')
