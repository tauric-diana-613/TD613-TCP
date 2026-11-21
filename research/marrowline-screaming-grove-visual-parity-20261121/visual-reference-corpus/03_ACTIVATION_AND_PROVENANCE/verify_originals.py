#!/usr/bin/env python3
"""Verify original screenshot SHA-256 and count in this package, without network."""
import json, hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'03_ACTIVATION_AND_PROVENANCE'/'REFERENCE_MANIFEST.json').read_text(encoding='utf-8'))
for e in m['files']:
 p=root/e['archive_path'];assert p.is_file(),e['archive_path']
 assert hashlib.sha256(p.read_bytes()).hexdigest()==e['sha256'],e['archive_path']
assert len(m['files'])==22
assert sum(e['role'] in ('accepted_marrowline','operator_accepted_marrowline') for e in m['files'])==13
print('OK: 22 originals byte-verified; 13 accepted Marrowline, 9 other references')
