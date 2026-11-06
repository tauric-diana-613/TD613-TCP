import base64
import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from packages.research_carrier_v1 import core as c,fixture_factory as f,native_runner as n,synthetic_receiver as receiver

def exporter():
    s=importlib.util.spec_from_file_location('clean_carrier_export',ROOT/'scripts/export-src-method-carrier-v1.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m

class CarrierControls(unittest.TestCase):
    def setUp(self):
        self.packet=f.tomography();self.raw=c.encode(self.packet)
    def ret(self,raw=None,runner=n.run):
        return c.make_return(raw or self.raw,return_id='RETURN-1',recipient_id='RECIPIENT-1',runner=runner)
    def compare(self,ret,raw=None,runner=n.run):
        return c.compare(raw or self.raw,ret,return_id='RETURN-1',recipient_id='RECIPIENT-1',origin_runner=runner)
    def changed_return(self,change):
        r=c.parse(self.ret());change(r);return c.canon(r)
    def test_positive_native_execution_and_independent_origin_comparison(self):
        result=self.compare(self.ret());self.assertEqual(result['native_operation'],'ORIGIN_REEXECUTION_MATCHED');self.assertEqual(result['scientific_interpretation'],'UNESTABLISHED');self.assertFalse(result['authority']['flight'])
    def test_serialization_only_earns_separate_classification(self):
        result=self.compare(self.ret(runner=None));self.assertEqual(result['serialization'],'PRESERVED');self.assertEqual(result['native_operation'],'UNESTABLISHED')
    def test_no_origin_runner_cannot_claim_native_semantic_comparison(self):
        self.assertEqual(self.compare(self.ret(),runner=None)['native_operation'],'UNESTABLISHED')
    def test_recipient_execution_claim_never_becomes_authenticated_execution(self):
        returned=c.parse(self.ret(runner=None));returned['execution']['mode']='NATIVE_REEXECUTION'
        result=self.compare(c.canon(returned));self.assertEqual(result['native_operation'],'ORIGIN_REEXECUTION_MATCHED');self.assertFalse(result['recipient_execution_authenticated'])
    def test_git_lfs_pointer_and_payload_binding_control(self):
        import hashlib
        raw=b'fictional-lfs-unit-control';digest=c.sha(raw);pointer=f'version https://git-lfs.github.com/spec/v1\noid sha256:{digest}\nsize {len(raw)}\n'.encode()
        ref={'repository':'unit-control','revision':'1'*40,'path':'unit-fixture.txt','blob':hashlib.sha1(b'blob '+str(len(pointer)).encode()+b'\0'+pointer).hexdigest(),'lfs':{'sha256':digest,'bytes':len(raw),'pointer_b64':base64.b64encode(pointer).decode()}}
        asset=f.make_asset('unit-fixture.txt',raw,git=ref);self.assertEqual(c.asset_bytes(asset,'PUBLIC_SOURCE_BOUND'),raw)
        asset['git']['blob']='0'*40
        with self.assertRaisesRegex(c.ContractError,'LFS_POINTER_GIT_BINDING_MISMATCH'):c.asset_bytes(asset,'PUBLIC_SOURCE_BOUND')
    def test_lfs_pointer_cannot_redeclare_another_payload(self):
        ref={'repository':'unit-control','revision':'1'*40,'path':'fixture','blob':'2'*40,'lfs':{'sha256':'0'*64,'bytes':1,'pointer_b64':base64.b64encode(b'not an LFS pointer').decode()}}
        with self.assertRaisesRegex(c.ContractError,'LFS_POINTER_GIT_BINDING_MISMATCH'):c.git_ref(ref)
    def test_exact_source_bytes_survive_serialization(self):
        decoded=c.decode(self.raw);self.assertEqual(c.asset_bytes(decoded['assets'][0],'SYNTHETIC'),c.asset_bytes(self.packet['assets'][0],'SYNTHETIC'))
    def test_unknown_null_absent_withheld_survive_distinctly(self):
        ret=c.parse(self.ret());states=ret['returned_carrier']['evidence_states'];self.assertEqual([x['state'] for x in states],['UNKNOWN','NULL','ABSENT','WITHHELD']);self.assertEqual(c.canon(states),c.canon(self.packet['evidence_states']))
    def test_contradictory_records_preserved_without_resolution(self):
        ret=c.parse(self.ret());self.assertEqual([x['status'] for x in ret['returned_carrier']['contradictions']],['SUPPORTED','REJECTED']);self.compare(c.canon(ret))
    def test_changed_capture_identity_rejected(self):
        raw=self.changed_return(lambda r:r['returned_carrier'].__setitem__('capture_id','ALTERED'))
        with self.assertRaises(c.ContractError):self.compare(raw)
    def test_changed_source_identity_and_all_nested_attribution_rejected(self):
        def mutate(r):
            x=r['returned_carrier'];x['source_id']='ALTERED'
            for a in x['assets']:a['source_id']='ALTERED'
        with self.assertRaises(c.ContractError):self.compare(self.changed_return(mutate))
    def test_source_content_tamper_rejected_even_if_hash_updated(self):
        def mutate(r):
            a=r['returned_carrier']['assets'][0];raw=c.asset_bytes(a,'SYNTHETIC')+b'\n';a['bytes_b64']=base64.b64encode(raw).decode();a['sha256']=c.sha(raw)
        with self.assertRaises(c.ContractError):self.compare(self.changed_return(mutate))
    def test_original_packet_digest_cannot_be_self_redeclared(self):
        with self.assertRaisesRegex(c.ContractError,'ORIGIN_PACKET_BINDING'):
            self.compare(self.changed_return(lambda r:r.__setitem__('origin_bytes_sha256','0'*64)))
    def test_return_identity_separate_from_origin_receipt(self):
        with self.assertRaises(c.ContractError):
            c.compare(self.raw,c.make_return(self.raw,return_id='SYN-ORIGIN-RECEIPT',recipient_id='RECIPIENT-1',runner=n.run),return_id='SYN-ORIGIN-RECEIPT',recipient_id='RECIPIENT-1',origin_runner=n.run)
    def test_wrong_recipient_and_return_ids_rejected(self):
        for key in ['recipient_id','return_id']:
            with self.subTest(key=key),self.assertRaises(c.ContractError):self.compare(self.changed_return(lambda r:r.__setitem__(key,'WRONG')))
    def test_semantic_contract_change_rejected_even_with_self_consistent_json(self):
        x=copy.deepcopy(self.packet);x['method']['semantic_contract']['evidence_delta']='INFER_CONFIDENCE'
        raw=c.encode(x);ret=c.make_return(raw,return_id='RETURN-1',recipient_id='RECIPIENT-1')
        r=c.parse(ret);r['execution']['mode']='NATIVE_REEXECUTION'
        with self.assertRaisesRegex(c.ContractError,'NATIVE_METHOD_SEMANTICS_CHANGED'):self.compare(c.canon(r),raw=raw)
    def test_changed_entrypoint_version_and_executable_ref_rejected(self):
        for key,value in [('entrypoint','eval'),('version','other-v2'),('executable_sha256','0'*64)]:
            x=copy.deepcopy(self.packet);x['method'][key]=value
            with self.subTest(key=key),self.assertRaises(c.ContractError):n.run(x)
    def test_origin_side_recomputation_detects_false_expected_results(self):
        x=copy.deepcopy(self.packet);x['method_result'][0]['delta_scope']='EXPANDED';x['origin_receipt']['result_sha256']=c.sha(c.canon(x['method_result']))
        raw=c.encode(x);ret=c.parse(c.make_return(raw,return_id='RETURN-1',recipient_id='RECIPIENT-1'));ret['execution']['mode']='NATIVE_REEXECUTION'
        with self.assertRaisesRegex(c.ContractError,'NATIVE_OPERATION_RESULT_DIVERGED'):self.compare(c.canon(ret),raw=raw)
    def test_unknown_cannot_become_null(self):
        x=copy.deepcopy(self.packet);x['method_result'][0]['delta_evidence']=None
        with self.assertRaisesRegex(c.ContractError,'UNKNOWN_COLLAPSED'):c.encode(x)
    def test_absent_cannot_become_explicit_null(self):
        x=copy.deepcopy(self.packet);x['method_result'][0]['absent_evidence']=None
        with self.assertRaisesRegex(c.ContractError,'ABSENCE_COLLAPSED'):c.encode(x)
    def test_withheld_content_cannot_silently_appear(self):
        x=copy.deepcopy(self.packet);x['method_result'][0]['withheld_evidence']='surprise'
        with self.assertRaisesRegex(c.ContractError,'WITHHELD_EVIDENCE'):c.encode(x)
    def test_declared_relation_requires_a_bound_witness(self):
        x=copy.deepcopy(self.packet);x['relations'][0]['witness_ids']=[]
        with self.assertRaisesRegex(c.ContractError,'DECLARED_RELATION_NEEDS_WITNESS'):c.encode(x)
    def test_unresolved_relation_cannot_be_promoted(self):
        def change(r):r['returned_carrier']['relations'][1].update(status='DECLARED',witness_ids=['SYN-E1'])
        with self.assertRaises(c.ContractError):self.compare(self.changed_return(change))
    def test_invalid_relation_status_and_missing_witness_ref(self):
        for changes in [{'status':'PROVEN'},{'witness_ids':['UNBOUND']}]:
            x=copy.deepcopy(self.packet);x['relations'][0].update(changes)
            with self.subTest(changes=changes),self.assertRaises(c.ContractError):c.encode(x)
    def test_cross_episode_chronology_assumption_rejected(self):
        x=copy.deepcopy(self.packet);x['chronology']['comparison_frame']='LATEST_STATE_OVERRIDES_HISTORY'
        with self.assertRaisesRegex(c.ContractError,'INCOMPATIBLE_CHRONOLOGY'):c.encode(x)
    def test_event_after_comparison_frame_refused(self):
        x=copy.deepcopy(self.packet);x['chronology']['events'][1]['recorded_at']='2026-01-04T00:00:00Z'
        with self.assertRaisesRegex(c.ContractError,'EVENT_AFTER_COMPARISON_FRAME'):c.encode(x)
    def test_temporal_inversion_and_missing_predecessor_rejected(self):
        for changes in [{'sequence':1},{'sequence':True},{'recorded_at':'2025-01-01T00:00:00Z'},{'predecessor':None}]:
            x=copy.deepcopy(self.packet);x['chronology']['events'][1].update(changes)
            with self.subTest(changes=changes),self.assertRaises(c.ContractError):c.encode(x)
    def test_withdrawn_classification_cannot_be_erased(self):
        with self.assertRaises(c.ContractError):self.compare(self.changed_return(lambda r:r['returned_carrier']['chronology'].__setitem__('withdrawn_ids',[])))
    def test_held_state_cannot_be_promoted_in_return(self):
        with self.assertRaises(c.ContractError):self.compare(self.changed_return(lambda r:r['returned_carrier']['chronology']['events'][1].__setitem__('state','RECORDED')))
    def test_seal_snapshot_replay_lineage_changes_rejected(self):
        for field in ['snapshot_id','seal_id','projection_seal_id']:
            with self.subTest(field=field),self.assertRaises(c.ContractError):self.compare(self.changed_return(lambda r:r['returned_carrier']['epoch'].__setitem__(field,'OTHER')))
    def test_duplicate_json_keys_and_nonfinite_exponents_rejected(self):
        for raw in [b'{"x":1,"x":2}',b'{"x":NaN}',b'{"x":1e999}',b'{"x":-1e999}']:
            with self.subTest(raw=raw),self.assertRaises(c.ContractError):c.parse(raw)
    def test_boolean_number_and_float_int_are_distinct(self):
        self.assertNotEqual(c.canon(True),c.canon(1));self.assertNotEqual(c.canon(1.0),c.canon(1));self.assertNotEqual(c.canon(False),c.canon(0))
    def test_duplicate_and_escaping_asset_paths_refused(self):
        for path in ['../outside','/absolute','a/./b','a/.git/config','a\\b']:
            x=copy.deepcopy(self.packet);x['assets'][0]['path']=path
            with self.subTest(path=path),self.assertRaises(c.ContractError):c.encode(x)
        x=copy.deepcopy(self.packet);x['assets'].append(copy.deepcopy(x['assets'][0]))
        with self.assertRaises(c.ContractError):c.encode(x)
    def test_native_input_exponent_overflow_cannot_escape_output_domain(self):
        packet=copy.deepcopy(self.packet);a=packet['assets'][0];raw=c.asset_bytes(a,'SYNTHETIC').replace(b'\"NARROWED\"',b'1e999');self.assertNotEqual(raw,c.asset_bytes(a,'SYNTHETIC'));a['bytes_b64']=base64.b64encode(raw).decode();a['sha256']=c.sha(raw)
        with self.assertRaisesRegex(c.ContractError,'NONFINITE'):n.run(packet)
    def test_unallowlisted_method_input_refused(self):
        x=copy.deepcopy(self.packet);x['assets'][0]['path']='unrelated.jsonl'
        with self.assertRaisesRegex(c.ContractError,'EXACT_METHOD_INPUT_CLOSURE'):n.run(x)
    def test_authority_cannot_widen(self):
        for flag in ['source_admission','flight','execute_on_restore','merge','deployment','release']:
            x=copy.deepcopy(self.packet);x['authority'][flag]=True
            with self.subTest(flag=flag),self.assertRaises(c.ContractError):c.encode(x)
    def test_genuine_admission_remains_closed(self):
        for source_class in ['PUBLIC_SOURCE_BOUND','PROTECTED']:
            # No real source is relabeled here: this is an invalid synthetic attribution probe.
            x=copy.deepcopy(self.packet);x['source_class']=source_class
            with self.subTest(source_class=source_class),self.assertRaises(c.ContractError):c.receiver_packet(c.canon(x))
    def test_modified_native_executable_refused(self):
        old=n.ROOT
        with tempfile.TemporaryDirectory() as temp:
            n.ROOT=Path(temp);p=n.ROOT/'native/phase2.py';p.parent.mkdir();p.write_bytes((old/'native/phase2.py').read_bytes()+b'\n')
            try:
                with self.assertRaisesRegex(c.ContractError,'NATIVE_EXECUTABLE_PIN'):n.run(self.packet)
            finally:n.ROOT=old
    def test_replay_seal_data_not_silently_forgotten(self):
        x=copy.deepcopy(self.packet);x['epoch']['replay_lineage']=[{'path':x['assets'][0]['path'],'retained_sha256':x['assets'][0]['sha256'],'replayed_sha256':'1'*64,'transform':'LF_TO_CRLF_EXACT_SEAL_MATCH'}]
        raw=c.encode(x);r=c.parse(self.ret(raw=raw));r['returned_carrier']['epoch']['replay_lineage']=[]
        with self.assertRaises(c.ContractError):self.compare(c.canon(r),raw=raw)

class IndependentReceiverProcess(unittest.TestCase):
    def test_sqlite_then_exported_recipient_process_then_origin_comparator(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);out=root/'carrier';m=exporter();manifest=m.export(out);pin=c.sha((out/'MANIFEST.json').read_bytes())
            self.assertTrue(m.verify(out,pin)['closure_verified'])
            raw=c.encode(f.tomography());db=root/'synthetic.sqlite';receiver.create(db);outer=c.receiver_packet(raw);receiver.admit(db,outer)
            readback=c.parse(receiver.return_packet(db,'SYN-PACKET'))['source_text'].encode();self.assertEqual(raw,readback)
            incoming=root/'incoming.json';incoming.write_bytes(readback);returned=root/'returned.json'
            subprocess.run([sys.executable,'-I','-B',str(out/'run.py'),str(incoming),str(returned),'--return-id','INDEPENDENT-RETURN','--recipient-id','SYNTHETIC-PROCESS'],cwd=temp,check=True,capture_output=True,timeout=30,env={'LANG':'C.UTF-8'})
            result=c.compare(raw,returned.read_bytes(),return_id='INDEPENDENT-RETURN',recipient_id='SYNTHETIC-PROCESS',origin_runner=n.run)
            self.assertEqual(result['native_operation'],'ORIGIN_REEXECUTION_MATCHED');self.assertEqual(receiver.state(db)['counts']['packets'],1)
            self.assertTrue(m.verify(out,pin)['closure_verified'])
            self.assertFalse(any(p.name=='.git' for p in out.rglob('*')))
    def test_export_tamper_and_forbidden_extra_file_fail_independent_pin(self):
        with tempfile.TemporaryDirectory() as temp:
            out=Path(temp)/'carrier';m=exporter();m.export(out);pin=c.sha((out/'MANIFEST.json').read_bytes())
            (out/'rankings.json').write_text('{}')
            with self.assertRaisesRegex(ValueError,'EXPORTED_CLOSURE_CHANGED'):m.verify(out,pin)
            (out/'rankings.json').unlink();(out/'research_carrier_v1/core.py').write_bytes(b'pass\n')
            with self.assertRaisesRegex(ValueError,'EXPORTED_FILE_DIGEST_CHANGED'):m.verify(out,pin)
    def test_changed_manifest_cannot_authorize_changed_package(self):
        with tempfile.TemporaryDirectory() as temp:
            out=Path(temp)/'carrier';m=exporter();m.export(out);pin=c.sha((out/'MANIFEST.json').read_bytes());(out/'MANIFEST.json').write_text('{}')
            with self.assertRaisesRegex(ValueError,'INDEPENDENT_MANIFEST_PIN'):m.verify(out,pin)
    def test_export_requires_new_directory(self):
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaisesRegex(ValueError,'EXPORT_MUST_BE_NEW'):exporter().export(temp)

class ContinuityControls(unittest.TestCase):
    def capsule(self):
        return {'schema':c.CAPSULE,'capsule_id':'CAPSULE-1','estate_id':'SRC','version':1,'predecessor_sha256':None,
          'snapshot_refs':[],'method_configs':[],'investigations':[{'investigation_id':'HELD-1','state':'HELD','source_reference':'PINNED-RECORD','recorded_at':'2026-01-01T00:00:00Z','limitations':['human decision pending']}],
          'hypotheses':[],'refusals':['UNSUPPORTED_RELATION'],'io_lineage':[],'pending_human_decisions':['ADMISSION'],'execution_receipts':[],
          'missing_state':[{'surface':'ephemeral_runtime','state':'UNRECORDED_OR_UNAVAILABLE'}],'authority':c.closed_authority()}
    def test_held_and_missing_state_remain_held_and_missing_without_execution(self):
        state=self.capsule();out=c.restore_capsule(c.canon(state),expected_sha256=c.sha(c.canon(state)));self.assertEqual(out['restored_state'],state);self.assertEqual(out['execution'],'NOT_REQUESTED_OR_AUTHORIZED');self.assertFalse(out['authority']['execute_on_restore'])
    def test_capsule_transfer_rejects_held_state_change_against_retained_pin(self):
        x=self.capsule();pin=c.sha(c.canon(x));x['investigations'][0]['state']='RECORDED'
        with self.assertRaisesRegex(c.ContractError,'INDEPENDENT_CAPSULE_PIN'):c.restore_capsule(c.canon(x),expected_sha256=pin)
    def test_capsules_keep_estates_distinct(self):
        for estate in ['SRC','EMSTD613','WENDBINE']:
            x=self.capsule();x['estate_id']=estate;self.assertEqual(c.restore_capsule(c.canon(x),expected_sha256=c.sha(c.canon(x)))['restored_state']['estate_id'],estate)
    def test_capsule_version_and_restore_authority_refused(self):
        for key,value in [('version',True),('version',2)]:
            x=self.capsule();x[key]=value
            with self.assertRaises(c.ContractError):c.restore_capsule(c.canon(x),expected_sha256=c.sha(c.canon(x)))
        x=self.capsule();x['authority']['execute_on_restore']=True
        with self.assertRaises(c.ContractError):c.restore_capsule(c.canon(x),expected_sha256=c.sha(c.canon(x)))
    def test_capsule_does_not_accept_promoted_investigation_state(self):
        x=self.capsule();x['investigations'][0]['state']='SCIENTIFICALLY_PROVEN'
        with self.assertRaises(c.ContractError):c.restore_capsule(c.canon(x),expected_sha256=c.sha(c.canon(x)))


class OtherNativeMethods(unittest.TestCase):
    def asset(self,path,value,index):
        raw=value if type(value) is bytes else c.canon(value)+b'\n'
        return f.make_asset(path,raw,asset_id='SYN-ASSET-'+str(index))
    def test_original_context_roles_keep_two_contexts_for_one_subject(self):
        rows=[{'edge_id':'SYN-EDGE-'+str(i),'from_id':'SYN-WORK','declared_by_id':'SYN-COMPILER-'+str(i),'relation':'FOUNDATION_IN','scope':{'slot':i},'source_time':'2026-01-0'+str(i),'evidence_ids':['SYN-E1'],'origin':'SYNTHETIC'} for i in [1,2]]
        assets=[self.asset('05-OPERATIONS/relations/recompilation-edges.jsonl',b'\n'.join(c.canon(x) for x in rows)+b'\n',1),self.asset('05-OPERATIONS/relations/compiler-input-candidates.jsonl',b'',2)]
        packet=f.finish(f.shell('SRC_PHASE2_CONTEXT_ROLES',assets));self.assertEqual(len(packet['method_result']['roles']),2);self.assertEqual(len(packet['method_result']['compilation_passes']),2)
        raw=c.encode(packet);returned=c.make_return(raw,return_id='ROLE-RETURN',recipient_id='ROLE-RECIPIENT',runner=n.run)
        self.assertEqual(c.compare(raw,returned,return_id='ROLE-RETURN',recipient_id='ROLE-RECIPIENT',origin_runner=n.run)['native_operation'],'ORIGIN_REEXECUTION_MATCHED')
    def routing(self):
        assets=[]
        for i,title,body,date in [(1,'Origin','SR - Keep the trace. Preface. Explore destination theory.','2026-01-01'),(2,'Destination Theory','SR - Keep the trace. Abstract.','2026-02-01')]:
            assets.append(self.asset(f'03-DERIVATIVES/text/zenodo/zenodo-{i}-file-0.md',body.encode(),len(assets)))
            assets.append(self.asset(f'03-DERIVATIVES/text/zenodo/zenodo-{i}-metadata.md',{'created':date+'T00:00:00Z','metadata':{'title':title,'publication_date':date}},len(assets)))
        packet=f.shell('SRC_PROJECTIVE_ROUTING',assets,parameters={'operation':'inventory'});packet['chronology']['as_of']='2026-03-01T00:00:00Z'
        return f.finish(packet)
    def test_original_projective_operation_preserves_native_cue_and_ceiling(self):
        packet=self.routing();result=packet['method_result'];self.assertEqual(result['explore'][0]['observation_status'],'LATER_EXACT_RESOLUTION_CANDIDATE');self.assertIn('HOLONOMY',result['summary']['automatic_promotions_forbidden'])
        raw=c.encode(packet);ret=c.make_return(raw,return_id='ROUTE-RETURN',recipient_id='ROUTE-RECIPIENT',runner=n.run);self.assertEqual(c.compare(raw,ret,return_id='ROUTE-RETURN',recipient_id='ROUTE-RECIPIENT',origin_runner=n.run)['native_operation'],'ORIGIN_REEXECUTION_MATCHED')
    def test_chronological_withdrawal_changes_native_result_but_cannot_rewrite_origin(self):
        original=self.routing();raw=c.encode(original);withdrawn=copy.deepcopy(original);withdrawn['assets']=[a for a in withdrawn['assets'] if 'zenodo-2-' not in a['path']];withdrawn['chronology']['withdrawn_ids'].append('zenodo:2');f.finish(withdrawn)
        self.assertEqual(withdrawn['method_result']['explore'][0]['observation_status'],'UNRESOLVED_MACHINE')
        ret=c.make_return(c.encode(withdrawn),return_id='RETURN-NEW',recipient_id='RECIPIENT',runner=n.run)
        with self.assertRaises(c.ContractError):c.compare(raw,ret,return_id='RETURN-NEW',recipient_id='RECIPIENT',origin_runner=n.run)
    def query_packet(self,operation):
        paths=n.QUERY_INPUTS[operation];assets=[self.asset(path,b'',i) for i,path in enumerate(paths)]
        assets.append(self.asset('04-RECEIPTS/phase2/current-seal.json',{'atelier_snapshot_id':'SYN-SNAPSHOT','seal_id':'SYN-SEAL','path':'04-RECEIPTS/phase2/projection-seal.json'},100))
        assets.append(self.asset('04-RECEIPTS/phase2/projection-seal.json',{'atelier_snapshot_id':'SYN-SNAPSHOT','seal_id':'SYN-SEAL'},101))
        return f.finish(f.shell('SRC_NATIVE_QUERY',assets,parameters={'operation':operation,'identifier':'SYN-ABSENT','scope':None,'absent_paths':[],'withheld_paths':[]}))
    def test_original_summary_query_and_missing_trace_controls(self):
        for operation in ['summary','trace','resolve','authority']:
            with self.subTest(operation=operation):
                packet=self.query_packet(operation);raw=c.encode(packet);ret=c.make_return(raw,return_id='QUERY-RETURN',recipient_id='QUERY-RECIPIENT',runner=n.run)
                self.assertEqual(c.compare(raw,ret,return_id='QUERY-RETURN',recipient_id='QUERY-RECIPIENT',origin_runner=n.run)['native_operation'],'ORIGIN_REEXECUTION_MATCHED')
                if operation=='trace':self.assertEqual(packet['method_result']['status'],'UNRESOLVED_TARGET');self.assertTrue(packet['method_result']['missing_hops'])
                if operation=='authority':self.assertIsNone(packet['method_result']['controlling_formulation'])
    def test_positive_resolve_requires_exact_path_context_closure(self):
        packet=self.query_packet('resolve');asset=next(a for a in packet['assets'] if a['path'].endswith('entity-resolver-v2.jsonl'))
        raw=c.canon({'entity_id':'SYN-ABSENT','path':'data/observed.json'})+b'\n';asset['bytes_b64']=base64.b64encode(raw).decode();asset['sha256']=c.sha(raw)
        with self.assertRaisesRegex(c.ContractError,'NATIVE_PATH_CONTEXT_CLOSURE_MISSING'):n.run(packet)
        packet['assets'].append(self.asset('data/observed.json',b'fictional exact body',55));f.finish(packet);self.assertTrue(packet['method_result']['matches'][0]['path_exists'])
        packet['assets'].pop();packet['parameters']['absent_paths']=['data/observed.json'];f.finish(packet);self.assertFalse(packet['method_result']['matches'][0]['path_exists'])
        packet['parameters']['absent_paths']=[];packet['parameters']['withheld_paths']=['data/observed.json']
        with self.assertRaisesRegex(c.ContractError,'NATIVE_PATH_CONTEXT_WITHHELD'):n.run(packet)
    def test_projective_future_document_cannot_enter_earlier_comparison_frame(self):
        packet=self.routing();packet['chronology']['as_of']='2026-01-03T00:00:00Z'
        with self.assertRaisesRegex(c.ContractError,'SOURCE_DOCUMENT_AFTER_COMPARISON_FRAME'):n.run(packet)
    def test_verified_epoch_cannot_be_claimed_without_manifest_evidence(self):
        packet=f.tomography();packet['epoch']['binding_class']='CONSUMED_BYTES_VERIFIED'
        with self.assertRaisesRegex(c.ContractError,'VERIFIED_EPOCH'):n.run(packet)

if __name__=='__main__':unittest.main()
