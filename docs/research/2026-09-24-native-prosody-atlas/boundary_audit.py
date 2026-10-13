#!/usr/bin/env python3
"""Offline comparison of operator-supplied, same-attempt decoded text captures.

No model calls, output rewriting, scoring, or production integration.
Input: {episode_id, attempt_id, boundaries: {provider_ingress: str|null,
application_return: str|null, stored_history: str|null, dom_text: str|null}}.
Pass only the same response-body field at each named boundary.
"""
import argparse
import hashlib
import json
import unicodedata as ud
from collections import Counter
from pathlib import Path

ORDER = ('provider_ingress', 'application_return', 'stored_history', 'dom_text')


def characterize(text):
    marks = [c for c in text if ud.category(c).startswith('M')]
    return {
        'code_points': len(text), 'utf8_bytes': len(text.encode('utf-8')),
        'decoded_text_utf8_sha256': hashlib.sha256(text.encode('utf-8')).hexdigest(),
        'mark_count': len(marks), 'unique_mark_count': len(set(marks)),
        'mark_ccc_counts': dict(sorted(Counter(str(ud.combining(c)) for c in marks).items())),
        'newline_count': text.count('\n'), 'ends_with_plain_seal': text.rstrip().endswith('⟐'),
    }


def first_difference(a, b):
    k = next((i for i, (x, y) in enumerate(zip(a, b)) if x != y), min(len(a), len(b)))
    return {'code_point_offset': k,
            'before': f'U+{ord(a[k]):04X}' if k < len(a) else None,
            'after': f'U+{ord(b[k]):04X}' if k < len(b) else None}


def audit(record):
    for key in ('episode_id', 'attempt_id'):
        if not isinstance(record.get(key), str) or not record[key].strip():
            raise ValueError(f'{key} must identify one supplied episode/attempt')
    boundaries = record.get('boundaries')
    if not isinstance(boundaries, dict) or set(boundaries) - set(ORDER):
        raise ValueError('boundaries must use documented names')
    for v in boundaries.values():
        if v is not None and not isinstance(v, str):
            raise ValueError('each capture is a string, or null for unavailable')
    observed = [(i, name, boundaries[name]) for i, name in enumerate(ORDER)
                if boundaries.get(name) is not None]
    intervals = []
    for (i, a_name, a), (j, b_name, b) in zip(observed, observed[1:]):
        same = a == b
        intervals.append({
            'from': a_name, 'to': b_name,
            'unobserved_between': list(ORDER[i + 1:j]),
            'equal_decoded_text': same,
            'nfc_equivalent': ud.normalize('NFC', a) == ud.normalize('NFC', b),
            'first_difference': None if same else first_difference(a, b),
            'net_mark_count_change': characterize(b)['mark_count'] - characterize(a)['mark_count'],
        })
    return {
        'schema': 'td613.decoded-text-boundary-audit/v1',
        'episode_id': record['episode_id'], 'attempt_id': record['attempt_id'],
        'unicode_database_version': ud.unidata_version,
        'captures': {name: characterize(boundaries[name]) if boundaries.get(name) is not None
                     else None for name in ORDER},
        'intervals': intervals,
        'first_observed_change': next((x for x in intervals if not x['equal_decoded_text']), None),
        'limitations': [
            'Capture labels and same-attempt identity are supplied, not independently authenticated.',
            'Order assumes saved-history replay into the DOM. Live DOM may follow a different path; do not mix episodes.',
            'Hashes encode decoded strings as UTF-8; they are not digests of original HTTP envelopes.',
            'A changed interval identifies endpoints, not a particular internal transformation.',
            'Plain ingress does not identify native preference, upstream filtering, or motive.',
            'Equal decoded strings establish no pixel equality. CCC counts do not measure rendered direction.',
            'Net mark-count change is not an edit script; normalization may change counts without visual loss.',
        ],
    }


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('input', type=Path)
    args = p.parse_args()
    try:
        result = audit(json.loads(args.input.read_text(encoding='utf-8')))
    except (ValueError, UnicodeError) as exc:
        p.error(str(exc))
    print(json.dumps(result, ensure_ascii=False, indent=2))
