import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sqlite3
import struct
import tempfile
import unittest
from unittest.mock import patch
from contextlib import closing

ROOT = Path(__file__).resolve().parents[1]
ADMIN = ROOT/'packages/dome_world_exact/fixtures/a15-r0/EMSTD613/99-ADMIN'


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


sensitivity = module('em_sensitivity_test', ROOT/'scripts/em-identity-sensitivity-v1.py')
route = module('em_route_test', ADMIN/'em-work-route-v1.py')
semantic = module('em_semantic_test', ADMIN/'native-semantic-search-v1.py')
text = module('em_text_test', ADMIN/'em-native-text-search-v1.py')


def works():
    return [{'work_id': 'emwork_fixed', 'manifestation_source_file_ids': ['fixed'],
             'identity_status': 'SINGLETON_WORK_SURFACE', 'human_gate_required': False},
            {'work_id': 'emwork_pair', 'manifestation_source_file_ids': ['a', 'b'],
             'identity_status': 'SAME_WORK_SUPPORTED', 'human_gate_required': True,
             'minimum_independent_work_contribution': 1, 'maximum_independent_work_contribution': 2}]


class IdentitySensitivity(unittest.TestCase):
    def test_independent_pair_split_changes_threshold_without_resolution(self):
        w = works(); before = copy.deepcopy(w)
        out = sensitivity.qualify(w, {'fixed': False, 'a': True, 'b': True}, minimum_support=2)
        self.assertEqual((out['partition_count'], out['support_lower'], out['support_upper']), (2, 1, 2))
        self.assertEqual(out['threshold_classification'], 'IDENTITY_SENSITIVE_OR_EVIDENCE_UNRESOLVED')
        self.assertEqual(w, before); self.assertFalse(out['human_gates_resolved'])

    def test_single_manifestation_support_never_copied(self):
        out = sensitivity.qualify(works(), {'fixed': False, 'a': True, 'b': False})
        self.assertEqual((out['support_lower'], out['support_upper']), (1, 1))
        self.assertFalse(out['claim_equivalence_inferred'])

    def test_missingness_preserved(self):
        out = sensitivity.qualify(works(), {'a': None, 'b': 'WITHHELD'})
        self.assertEqual(out['occurrence_states'], {'a': 'UNKNOWN', 'b': 'WITHHELD', 'fixed': 'ABSENT'})
        self.assertEqual(out['support_lower'], 0)

    def test_fixed_evidence_invariant(self):
        out = sensitivity.qualify(works(), {'fixed': True, 'a': False, 'b': False}, minimum_support=1)
        self.assertEqual(out['threshold_classification'], 'ROBUSTLY_AT_LEAST_THRESHOLD')

    def test_invalid_identity_and_types_refused(self):
        for mutation in ('duplicate', 'ungated', 'unresolved'):
            w = works()
            if mutation == 'duplicate': w[1]['manifestation_source_file_ids'] = ['a', 'a']
            elif mutation == 'ungated': w[1]['human_gate_required'] = False
            else: w[1]['identity_status'] = 'INVENTED'
            with self.subTest(mutation=mutation), self.assertRaises(ValueError): sensitivity.qualify(w)
        for value in (True, 1.5, 0):
            with self.assertRaises(ValueError): sensitivity.qualify(works(), minimum_support=value)
        with self.assertRaises(ValueError): sensitivity.qualify(works(), {'unrelated': True})
        with self.assertRaises(ValueError): sensitivity.qualify(works(), {'a': 1})

    def test_empty_estate_refused_without_invented_partition(self):
        with self.assertRaisesRegex(ValueError, 'WORKS_REQUIRED'): sensitivity.qualify([])


class DuplicateIdentityControls(unittest.TestCase):
    def fixture(self, root):
        data = {'work': [{'work_id': 'emwork_1', 'manifestation_source_file_ids': ['s1']}],
                'sources': [{'source_file_id': 's1', 'sha256': 'a'*64}],
                'links': [{'work_id': 'emwork_1', 'source_file_id': 's1', 'evidence': {'source_sha256': 'a'*64}}],
                'derivatives': [{'source_file_id': 's1', 'extraction_status': 'EXTRACTED_NATIVE_TEXT'}]}
        return data

    def test_duplicate_records_refused(self):
        for table in ('work', 'sources', 'links', 'derivatives'):
            with self.subTest(table=table), tempfile.TemporaryDirectory() as folder:
                root = Path(folder); data = self.fixture(root); data[table] *= 2
                for key, rel in route.TABLES.items():
                    p = root/rel; p.parent.mkdir(parents=True, exist_ok=True)
                    p.write_text(''.join(json.dumps(row)+'\n' for row in data[key]), encoding='utf8')
                with self.assertRaisesRegex(ValueError, 'DUPLICATE'): route.route(root, 'emwork_1')


class SemanticSpanControls(unittest.TestCase):
    def fixture(self, root, body='fictional source'):
        model = root/'model'; model.mkdir(); (model/'fixture.txt').write_text('fictional weights', encoding='utf8')
        source, vectors = root/'source.sqlite', root/'vectors.sqlite'
        digest = hashlib.sha256(body.encode()).hexdigest()
        with closing(sqlite3.connect(source)) as c, c:
            c.executescript('CREATE TABLE records(source_id TEXT,source_sha256 TEXT,text TEXT);CREATE TABLE meta(key TEXT,value TEXT);')
            c.execute('INSERT INTO records VALUES(?,?,?)', ('s1', digest, body)); c.execute('INSERT INTO meta VALUES(?,?)', ('estate', 'EMSTD613'))
        with closing(sqlite3.connect(vectors)) as c, c:
            c.executescript('CREATE TABLE metadata(key TEXT,value TEXT);CREATE TABLE vectors(source_id TEXT,source_sha256 TEXT,chunk_sha256 TEXT,byte_offset INTEGER,dims INTEGER,vector BLOB,estate TEXT);')
            c.executemany('INSERT INTO metadata VALUES(?,?)', [('model_sha256', semantic.encoder.fingerprint(model)), ('state', 'COMPLETE_INDEX_REQUIRES_FRESH_SOURCE_REVALIDATION')])
            c.execute('INSERT INTO vectors VALUES(?,?,?,?,?,?,?)', ('s1', digest, digest, 0, 2, struct.pack('<ff', 1, 0), 'EMSTD613'))
        return source, vectors, model

    def search(self, paths, **kwargs):
        class FictionalEncoder:
            def __init__(self, *args): pass
            def encode(self, *args): return [[1, 0]]
        with patch.object(semantic.encoder, 'LocalSentenceEncoder', FictionalEncoder):
            return semantic.search(*paths, 'fixture', 'EMSTD613', **kwargs)

    def test_positive_then_span_tamper_refused(self):
        for sql in ("UPDATE vectors SET chunk_sha256='altered'", 'UPDATE vectors SET byte_offset=1',
                    'INSERT INTO vectors SELECT * FROM vectors', 'DELETE FROM vectors'):
            with self.subTest(sql=sql), tempfile.TemporaryDirectory() as folder:
                paths = self.fixture(Path(folder)); self.assertEqual(len(self.search(paths)['results']), 1)
                with closing(sqlite3.connect(paths[1])) as c, c: c.execute(sql)
                with self.assertRaisesRegex(ValueError, 'SPAN|COVERAGE'): self.search(paths)

    def test_boolean_limits_refused(self):
        with tempfile.TemporaryDirectory() as folder:
            paths = self.fixture(Path(folder))
            with self.assertRaises(ValueError): self.search(paths, limit=True)
            # Validation must precede SQLite access.
            with self.assertRaises(ValueError): text.search(Path(folder)/'absent.sqlite', 'query', limit=True)

    def test_nonfinite_query_refused(self):
        with tempfile.TemporaryDirectory() as folder:
            paths = self.fixture(Path(folder))
            class BadEncoder:
                def __init__(self, *args): pass
                def encode(self, *args): return [[float('nan'), 0]]
            with patch.object(semantic.encoder, 'LocalSentenceEncoder', BadEncoder):
                with self.assertRaisesRegex(ValueError, 'QUERY_VECTOR'): semantic.search(*paths, 'fixture', 'EMSTD613')

    def test_encoder_array_protocol_does_not_require_boolean_coercion(self):
        class ArrayVector(list):
            def __bool__(self): raise ValueError('array truth value ambiguous')
        class ArrayEncoder:
            def __init__(self, *args): pass
            def encode(self, *args): return [ArrayVector([1.0, 0.0])]
        with tempfile.TemporaryDirectory() as folder:
            paths = self.fixture(Path(folder))
            with patch.object(semantic.encoder, 'LocalSentenceEncoder', ArrayEncoder):
                self.assertEqual(len(semantic.search(*paths, 'fixture', 'EMSTD613')['results']), 1)

    def test_multichunk_unicode_source_binds_exact_byte_offsets(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder); paths = self.fixture(root)
            body = 'é'*1101+'tail'*30; digest = hashlib.sha256(body.encode()).hexdigest()
            with closing(sqlite3.connect(paths[0])) as c, c:
                c.execute('UPDATE records SET text=?,source_sha256=?', (body, digest))
            class FictionalEncoder:
                def __init__(self, *args): pass
                def encode(self, *args): return [[1, 0]]
            target = root/'new.sqlite'
            with patch.object(semantic.encoder, 'LocalSentenceEncoder', FictionalEncoder):
                built = semantic.build(paths[0], target, paths[2], 'EMSTD613')
            self.assertEqual(built['vectors'], 2)
            out = self.search((paths[0], target, paths[2]))
            self.assertEqual({r['byte_offset'] for r in out['results']}, {0, 2200})


if __name__ == '__main__': unittest.main()
