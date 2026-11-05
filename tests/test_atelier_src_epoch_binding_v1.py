"""Independent synthetic epoch controls; genuine SRC remains in its own lane."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('epoch_bridge',ROOT/'scripts/atelier-native-inheritance-bridge-v1.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

class EpochBinding(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)/'SRC';self.root.mkdir()
        self.inputs=['99-ADMIN/srcquery.py',*m.QUERY_INPUTS['authority']]
        original=(ROOT/'packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/srcquery.py').read_bytes()
        self.put(self.inputs[0],original);self.put(self.inputs[1],b'[]\n'.replace(b'[]',b''))
        self.method_sha=hashlib.sha256(original).hexdigest()
        self.manifest={'schema_version':'src-projection-seal/v1','atelier_snapshot_id':'SYNTHETIC-EPOCH','seal_id':'SYNTHETIC-SEAL','projection_profile':'public','entries':[]}
        for p in self.inputs:
            raw=(self.root/p).read_bytes();self.manifest['entries'].append({'path':p,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
        self.seal()
    def tearDown(self):self.tmp.cleanup()
    def put(self,p,raw):
        f=self.root/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(raw)
    def seal(self):
        basis=''.join(json.dumps(e,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n' for e in self.manifest['entries'])
        self.manifest['projection_seal_id']='src-projection-seal:'+hashlib.sha256(basis.encode()).hexdigest()
        self.put('04-RECEIPTS/phase2/projection-seal.json',json.dumps(self.manifest).encode())
        self.current={k:v for k,v in self.manifest.items() if k!='entries'}
        self.current['path']='04-RECEIPTS/phase2/projection-seal.json'
        self.put('04-RECEIPTS/phase2/current-seal.json',json.dumps(self.current).encode())
    def query(self):
        return m.native_src_query(self.root,'SYNTHETIC-EPOCH','SYNTHETIC-SEAL','authority','ABSENT',expected_source_sha=self.method_sha)
    def test_positive_bound_original_method_execution(self):
        result=self.query();self.assertEqual(result['result']['applicable_witnessed_formulations'],[])
        self.assertIsNone(result['result']['controlling_formulation'])
        self.assertEqual(len(result['source_binding']['verified_inputs']),2)
        self.assertFalse(result['source_binding']['external_custody_authenticated'])
    def test_consumed_registry_mutation_with_unchanged_labels_refused(self):
        self.put(self.inputs[1],b'{"subject":{"id":"ABSENT"},"scope":{}}\n')
        with self.assertRaisesRegex(ValueError,'QUERY_INPUT_SEAL_DRIFT'):self.query()
    def test_method_mutation_refused_even_with_updated_caller_hash(self):
        self.put(self.inputs[0],(self.root/self.inputs[0]).read_bytes()+b'\n')
        self.method_sha=hashlib.sha256((self.root/self.inputs[0]).read_bytes()).hexdigest()
        with self.assertRaisesRegex(ValueError,'QUERY_INPUT_SEAL_DRIFT'):self.query()
    def test_missing_entry_refused(self):
        self.manifest['entries'].pop();self.seal()
        with self.assertRaisesRegex(ValueError,'QUERY_INPUT_NOT_SEALED'):self.query()
    def test_manifest_digest_tamper_refused(self):
        self.manifest['entries'][0]['sha256']='0'*64
        self.put('04-RECEIPTS/phase2/projection-seal.json',json.dumps(self.manifest).encode())
        with self.assertRaisesRegex(ValueError,'PROJECTION_SEAL_DIGEST_MISMATCH'):self.query()
    def test_pointer_manifest_disagreement_refused(self):
        self.current['projection_seal_id']='src-projection-seal:'+'0'*64
        self.put('04-RECEIPTS/phase2/current-seal.json',json.dumps(self.current).encode())
        with self.assertRaisesRegex(ValueError,'SEAL_POINTER_MANIFEST_MISMATCH'):self.query()
    def test_cross_epoch_refused(self):
        with self.assertRaisesRegex(ValueError,'SEAL_EPOCH_MISMATCH'):
            m.verify_query_epoch(self.root,'OTHER','SYNTHETIC-SEAL','authority')
    def test_duplicate_and_escape_paths_refused(self):
        for path in (self.inputs[0],'../escape'):
            with self.subTest(path=path):
                self.manifest['entries'].append({'path':path,'bytes':0,'sha256':'0'*64});self.seal()
                with self.assertRaisesRegex(ValueError,'SEAL_ENTRY_PATH_INVALID_OR_DUPLICATE'):self.query()
                self.manifest['entries'].pop()
    def test_unsupported_relation_operation_refused(self):
        with self.assertRaisesRegex(ValueError,'SRC_NATIVE_READONLY_OPERATION_NOT_ALLOWED'):
            m.native_src_query(self.root,'SYNTHETIC-EPOCH','SYNTHETIC-SEAL','infer-holonomy',expected_source_sha=self.method_sha)
    def test_unconsumed_files_do_not_gain_seal_credit(self):
        self.put('unsealed.txt',b'ordinary working file')
        binding=self.query()['source_binding']
        self.assertFalse(binding['whole_projection_verified'])
        self.assertNotIn('unsealed.txt',[e['path'] for e in binding['verified_inputs']])

    def replay(self,**kwargs):
        return m.replay_native_src_query(self.root,'SYNTHETIC-EPOCH','SYNTHETIC-SEAL',
          'authority','ABSENT',expected_source_sha=self.method_sha,**kwargs)
    def newline_fixture(self):
        raw=b'{"subject":{"id":"ABSENT"},"scope":{}}\r\n'
        self.put(self.inputs[1],raw)
        self.manifest['entries'][1].update(bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest());self.seal()
        self.put(self.inputs[1],raw.replace(b'\r\n',b'\n'))
    def test_explicit_newline_replay_preserves_original_bytes(self):
        self.newline_fixture();before=(self.root/self.inputs[1]).read_bytes()
        with self.assertRaisesRegex(ValueError,'QUERY_INPUT_SEAL_DRIFT'):self.query()
        result=self.replay(allow_line_ending_replay=True)
        self.assertEqual(len(result['result']['applicable_witnessed_formulations']),1)
        self.assertEqual((self.root/self.inputs[1]).read_bytes(),before)
        self.assertEqual(len(result['replay']['transforms']),1)
        self.assertFalse(result['replay']['receiver_admission'])
        self.assertTrue(result['replay']['temporary_copy_destroyed'])
    def test_replay_requires_explicit_selection(self):
        with self.assertRaisesRegex(ValueError,'EXPLICIT_SEALED_NEWLINE_REPLAY_REQUIRED'):self.replay()
    def test_replay_content_edit_refused(self):
        self.newline_fixture();self.put(self.inputs[1],b'{"subject":{"id":"ALTERED"},"scope":{}}\n')
        with self.assertRaisesRegex(ValueError,'UNREPLAYABLE_QUERY_INPUT_DRIFT'):self.replay(allow_line_ending_replay=True)
    def test_replay_never_transforms_executable_source(self):
        raw=(self.root/self.inputs[0]).read_bytes();sealed=raw.replace(b'\n',b'\r\n')
        self.manifest['entries'][0].update(bytes=len(sealed),sha256=hashlib.sha256(sealed).hexdigest());self.seal()
        with self.assertRaisesRegex(ValueError,'QUERY_INPUT_SEAL_DRIFT'):self.replay(allow_line_ending_replay=True)
    def test_replay_refuses_symlinked_copy_members(self):
        (self.root/'link').symlink_to(self.root/self.inputs[1])
        with self.assertRaisesRegex(ValueError,'SYMLINK_IN_NATIVE_SOURCE_REFUSED'):self.replay(allow_line_ending_replay=True)
    def test_replay_refuses_nonpublic_projection(self):
        self.manifest['projection_profile']='private';self.seal()
        with self.assertRaisesRegex(ValueError,'PUBLIC_PROJECTION_REPLAY_ONLY'):self.replay(allow_line_ending_replay=True)

if __name__=='__main__':unittest.main()
