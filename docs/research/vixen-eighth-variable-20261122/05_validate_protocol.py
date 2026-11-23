#!/usr/bin/env python3
"""Deterministic, read-only preregistration format and integrity validation."""
import hashlib, json, pathlib, collections, sys
D=pathlib.Path(__file__).resolve().parent
p=json.loads((D/'02_LOCKED_PROMPTS.json').read_text(encoding='utf-8'))
r=json.loads((D/'04_SCORING_AND_HOLDS.json').read_text(encoding='utf-8'))
ids=[x['id'] for x in p['tasks']]
assert ids==[f'EV-{i:02}' for i in range(1,25)], 'Prompt IDs not complete and ordered'
assert len(set(ids))==24
assert collections.Counter(x['category'] for x in p['tasks'])=={'ORIGINAL_CONTROL':6,'BATCH_B_RETRIEVAL':6,'CROSS_SOURCE_COMPARISON':4,'AUTHORITY_NEGATIVE':4,'ABSTENTION_CONTROL':4}
assert all(x['all_arms']==['C0','C7','C1','C71'] for x in p['tasks'])
assert all(x['source_answers_preexposure']=='UNKNOWN' for x in p['tasks'])
assert all(x['prompt'] for x in p['tasks'])
assert len(p['prospective_batch_b'])==7
assert len(set(x['source_id'] for x in p['prospective_batch_b']))==7
assert p['original_source_sha']== 'b90ae99559b21e1561229cdc8e1d873cfaf6f43a'
assert p['eighth_variable_original_bytes'] is None and p['eighth_variable_status']=='UNSEEN_BLINDED'
assert len(r['hard_stops'])>=8 and len(r['outcome_states'])==4
m=D/'SHA256_MANIFEST.json'
if m.exists():
    j=json.loads(m.read_text(encoding='utf-8'))
    assert set(j['entries'])=={f.name for f in D.iterdir() if f.is_file() and f.name not in ('SHA256_MANIFEST.json',)},'Manifest must cover every packet file except itself'
    for name,e in j['entries'].items():
        data=(D/name).read_bytes()
        assert e['sha256']==hashlib.sha256(data).hexdigest() and e['bytes']==len(data),f'Integrity mismatch: {name}'
    print('PASS: 24 exact task IDs, 7 original input identities, safety holds and complete SHA manifest.')
else: print('PASS: prompt/source/rubric checks. Manifest not yet generated.')
sys.exit(0)