"""Synthetic software checks only; no corpus, private gold, or rankings loaded."""
import copy
import hashlib
import importlib.util
import json
import pathlib
import sys
import tempfile
from contextlib import closing

root = pathlib.Path(__file__).resolve().parents[1]
def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, root / 'scripts' / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

bench = load('scoring_probe_bench', 'atelier-semantic-parity-benchmark-v1.py')
sem = load('scoring_probe_sem', 'atelier-semantic-sqlite-v1.py')
cases = []
rankings = {}
for estate in bench.ESTATES:
    for i, difficulty in enumerate(('VAGUE', 'INTERMEDIATE', 'SPECIFIC')):
        cid = estate + str(i)
        cases.append(dict(query_id=cid, target_estate=estate, difficulty=difficulty,
                          query='fictional calibration', relevant_source_ids=['positive'],
                          decoy_source_ids=['decoy']))
        rankings[cid] = [dict(estate=estate, source_id='positive',
            retrieval_class='LOCAL_SEMANTIC_CANDIDATE_NO_RELATION_PROMOTION')]
def measure(rows, gold=None, k=20):
    r = copy.deepcopy(rankings)
    r['SRC0'] = rows
    c = copy.deepcopy(cases)
    if gold is not None:
        c[0]['relevant_source_ids'] = gold
    return bench.benchmark(c, r, k=k)['individual_queries'][0]
def row(sid, estate='SRC', **kwargs):
    return dict(estate=estate, source_id=sid,
        retrieval_class='LOCAL_SEMANTIC_CANDIDATE_NO_RELATION_PROMOTION', **kwargs)

results = {}
results['duplicate_chunks'] = measure([row('other')] * 30 + [row('positive')], k=2)
assert results['duplicate_chunks']['reciprocal_rank'] == 0.5
results['duplicate_positive_labels'] = measure([row('positive')], ['positive', 'positive', 'second'])
assert results['duplicate_positive_labels']['recall_at_k'] == 0.5
results['wrong_estate'] = measure([row('positive', estate='EMSTD613')])
assert results['wrong_estate']['recall_at_k'] == 0
results['source_id_prefix_difference'] = measure([row('SRC::positive')])
assert results['source_id_prefix_difference']['recall_at_k'] == 0
results['version_and_hash_fields_not_scored'] = measure([row('positive', capture_id='fictional-wrong-version',
    source_field='title', source_sha256='0' * 64, chunk_sha256='1' * 64)])
assert results['version_and_hash_fields_not_scored']['recall_at_k'] == 1
results['unlabelled_source_not_automatically_relevant'] = measure([row('unlabelled')])
assert results['unlabelled_source_not_automatically_relevant']['recall_at_k'] == 0

def chunk(estate, sid, cid):
    return dict(estate=estate, source_id=sid, chunk_id=cid, capture_id='fictional-capture',
        source_kind='SYNTHETIC', source_field='body', source_sha256='2' * 64,
        chunk_sha256='3' * 64, byte_offset=0, chunk='fictional calibration text')
chunks = [chunk('SRC', 'duplicate', f'c{i:03}') for i in range(25)]
chunks += [chunk('SRC', 'positive', 'z'), chunk('EMSTD613', 'e', 'e'), chunk('WENDBINE', 'w', 'w')]
import argparse
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--scratch-dir', type=pathlib.Path, required=True)
args = parser.parse_args()
scratch = args.scratch_dir
if not scratch.is_absolute() or not scratch.is_dir() or scratch.is_symlink():
    raise ValueError('EXISTING_ABSOLUTE_SCRATCH_DIRECTORY_REQUIRED')
with tempfile.TemporaryDirectory(prefix='td613-sourcefree-', dir=scratch) as tmp:
    db = pathlib.Path(tmp) / 'synthetic.sqlite'
    sem.build(db, chunks, lambda text: [1, 0], 'a' * 64)
    # Give the desired source a lower similarity, preserving the 25 duplicate chunks first.
    import sqlite3
    with closing(sqlite3.connect(db)) as con:
        con.execute('UPDATE vectors SET vector=? WHERE source_id=?', (sem.pack([0.8, 0.6]), 'positive'))
        con.commit()
    default = sem.search(db, [1, 0], model_hash='a' * 64, limit=20, estate='SRC')
    unique = sem.search(db, [1, 0], model_hash='a' * 64, limit=20, estate='SRC', unique_sources=True)
    results['prelimited_chunk_rankings'] = measure(default)
    results['source_unique_rankings'] = measure(unique)
    assert results['prelimited_chunk_rankings']['recall_at_k'] == 0
    assert results['source_unique_rankings']['recall_at_k'] == 1

payload = dict(schema='td613.source-free-scoring-inspection/v1', pinned_head='b3136226f2b3e4c3ebe176c56d2c19c83ca5b730',
               private_inputs_loaded=False, sourcefree_checks_passed=8, results=results)
print(json.dumps(payload, indent=2))
