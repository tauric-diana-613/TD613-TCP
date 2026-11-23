import copy,json,subprocess,sys,tempfile,unittest,shutil,sqlite3,importlib.util
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
from packages.experiment_a_preparation_v1 import register,wendbine,ledger,kit,blind_task
from packages.experiment_a_preparation_v1.common import canonical,digest,commitment,read_json
DOC=ROOT/'docs/research/2026-11-04'
class RegisterTests(unittest.TestCase):
 def setUp(self):
  self.raw=(DOC/'THREE_ATELIER_NATIVE_QUALIFICATION_MATRICES.json').read_bytes();self.old=read_json(self.raw);self.v=read_json((DOC/'THREE_ATELIER_NATIVE_QUALIFICATION_REGISTER_V2.json').read_bytes())
 def check(self):return register.validate(self.v,self.old,self.raw)
 def test_46_separate_fields_and_unadjudicated(self):self.assertEqual(self.check()['ceiling_states']['UNADJUDICATED'],12)
 def test_original_byte_identity(self):self.assertEqual(digest(self.raw),'7b4e866f28ef70ed5c94987e7e03db5cc808c02e8907206e2bcbf704943a1bba')
 def test_all_source_excerpts_against_git(self):
  cache={}
  for row in self.v['records']:
   for r in row['sources'].values():
    key=r['revision']+':'+r['path']
    if key not in cache:cache[key]=subprocess.check_output(['git','-C',str(ROOT),'show',key])
    raw=cache[key];self.assertEqual(digest(raw),r['file_sha256']);self.assertEqual(''.join(raw.decode().splitlines(keepends=True)[r['line_start']-1:r['line_end']]),r['excerpt'])
 def test_support_control_substitution(self):
  for f in ('implemented_or_restored_capability','falsifiers_and_negative_controls'):
   v=copy.deepcopy(self.v);v['records'][0]['supported_claim_ceiling']['text']=v['records'][0][f]['text']
   with self.assertRaisesRegex(ValueError,'SUBSTITUTION'):register.validate(v,self.old,self.raw)
 def test_native_loss_remove_duplicate(self):
  for mode in ('native','remove','duplicate'):
   v=copy.deepcopy(self.v)
   if mode=='native':v['records'][0]['estate_native_record']={}
   elif mode=='remove':v['records'].pop()
   else:v['records'][1]=copy.deepcopy(v['records'][0])
   with self.assertRaises(ValueError):register.validate(v,self.old,self.raw)
 def test_unexecuted_promotion(self):
  r=next(r for r in self.v['records'] if r['estate']=='EMSTD613');r['supported_claim_ceiling'].update(state='SUPPORTED_BOUNDED_EXECUTION',text='Invented success')
  with self.assertRaisesRegex(ValueError,'PROMOTION'):self.check()
 def test_native_map_readback_cannot_be_promoted_to_execution(self):
  r=next(r for r in self.v['records'] if r['method_or_investigation_id']=='Cartography');r['observed_native_execution']['state']='ORIGINAL_PUBLIC_EXECUTED';r['supported_claim_ceiling']['state']='SUPPORTED_BOUNDED_EXECUTION'
  with self.assertRaisesRegex(ValueError,'PROMOTED'):self.check()
 def test_provenance_and_excerpt(self):
  self.v['records'][0]['supported_claim_ceiling']['evidence_refs']=[]
  with self.assertRaises(ValueError):self.check()
  self.setUp();next(iter(self.v['records'][0]['sources'].values()))['excerpt']='altered'
  with self.assertRaises(ValueError):self.check()
 def test_unknown_null_and_authority(self):
  r=next(r for r in self.v['records'] if r['supported_claim_ceiling']['state']=='UNADJUDICATED');r['supported_claim_ceiling']['text']='invented'
  with self.assertRaises(ValueError):self.check()
  self.setUp();self.v['automatic_authorization']=True
  with self.assertRaises(ValueError):self.check()
def populations():
 s='reddit:t3_fake001';m='reddit:manifestation:fake001';title='Fictional é'.encode();body='Fictional body 𝌋'.encode()
 a=[{'source_id':s,'public_date':'2026-09-10','time_precision':'DAY','source_text_stored':False}];bm=[{'source_id':s,'manifestation_id':m,'work_id':None}]
 b=[{'source_id':s,'manifestation_id':m,'capture_id':'old-capture','observed_at':'2026-09-11T00:00:00Z','title_sha256_utf8':digest(title),'body_sha256_utf8':digest(body)}]
 c=[{'source_id':s,'capture_id':'new-capture','captured_at_utc':'2026-09-12T00:00:00Z','published_at_utc':'2026-09-10T00:00:00Z','time_precision':'SECOND','canonical_url':'https://www.reddit.com/r/Wendbine/comments/fake001/','title':title,'selftext':body,'title_sha256':digest(title),'body_sha256':digest(body)}]
 u=[{'source_id':s,'capture_id':'new-capture','source_field':f,'source_sha256':digest(raw),'chunk_sha256':digest(raw),'byte_offset':0,'text':raw.decode()} for f,raw in [('title',title),('body',body)]]
 return a,bm,b,c,u
class CustodyTests(unittest.TestCase):
 def test_distinct_capture_same_bytes(self):
  a,bm,b,c,u=populations();r=wendbine.qualify(a,bm,b,c,universal_chunks=u);self.assertEqual(r['capture_relationships']['BYTE_COMPATIBLE_DISTINCT_CAPTURE'],1);self.assertEqual(r['capture_relationships']['EXACT_IDENTITY'],0);self.assertEqual(r['universal_readback'],'EXACT_SPANS_COMPLETE');self.assertEqual(r['scientific_state_migration'],'UNESTABLISHED')
 def test_exact_capture_requires_time_binding(self):
  a,bm,b,c,u=populations();c[0]['capture_id']='old-capture'
  with self.assertRaises(ValueError):wendbine.qualify(a,bm,b,c)
  c[0]['captured_at_utc']=b[0]['observed_at'];self.assertEqual(wendbine.qualify(a,bm,b,c)['capture_relationships']['EXACT_IDENTITY'],1)
 def test_bytes_identity_and_duplicate(self):
  for mode in ('bytes','url','duplicate'):
   a,bm,b,c,u=populations()
   if mode=='bytes':c[0]['selftext']+=b'changed'
   elif mode=='url':c[0]['canonical_url']='https://www.reddit.com/r/Wendbine/comments/other00/'
   else:c.append(copy.deepcopy(c[0]))
   with self.assertRaises(ValueError):wendbine.qualify(a,bm,b,c)
 def test_empty_null_absent_withheld(self):
  a,bm,b,c,u=populations();r=c[0];r['selftext']=b'';r['body_sha256']=digest(b'');self.assertEqual(wendbine.verify_capture(r)['selftext'],'EXPLICIT_EMPTY_BYTES');r['selftext']=None;self.assertEqual(wendbine.verify_capture(r)['selftext'],'EXPLICIT_NULL');del r['selftext'];r['withheld']=True;self.assertEqual(wendbine.verify_capture(r)['selftext'],'ABSENT');self.assertEqual(wendbine.verify_capture(r)['disclosure'],'WITHHELD')
  b[0]['body_sha256_utf8']=None;b[0]['title_sha256_utf8']=None;r['title']=None;self.assertEqual(wendbine.qualify(a,bm,b,c)['capture_relationships']['BYTE_COMPATIBLE_DISTINCT_CAPTURE'],0)
 def test_universal_span_hash_offset_duplicate(self):
  for mode in ('hash','offset','bytes','duplicate'):
   a,bm,b,c,u=populations()
   if mode=='hash':u[0]['source_sha256']='0'*64
   elif mode=='offset':u[0]['byte_offset']=1
   elif mode=='bytes':u[0]['text']='invented'
   else:u.append(copy.deepcopy(u[0]))
   with self.assertRaises(ValueError):wendbine.qualify(a,bm,b,c,universal_chunks=u)
  a,bm,b,c,u=populations();self.assertEqual(wendbine.qualify(a,bm,b,c,universal_chunks=u[:1])['universal_readback'],'HELD_INCOMPLETE_SPAN_COVERAGE')
 def test_missing_and_chronology(self):
  a,bm,b,c,u=populations();a[0]['public_date']='2026-09-11';self.assertTrue(wendbine.qualify(a,bm,b,c)['chronology_conflicts']);r=wendbine.qualify(a,bm,b,[]);self.assertEqual(r['origin_byte_readback'],'HELD_NO_LOCAL_CAPTURE_ROWS')
 def test_graph_and_correction_promotion(self):
  a,bm,b,c,u=populations()
  for e in ({'graph':'G_D','kind':'CAPTURE_OR_RETRIEVAL','source_witness':'fictional'},{'graph':'MANIFESTATION','kind':'SCIENTIFIC_LEGACY','source_witness':'fictional'}):
   with self.assertRaises(ValueError):wendbine.qualify(a,bm,b,c,relations=[e])
  with self.assertRaises(ValueError):wendbine.qualify(a,bm,b,c,correction_edges=[{'status':'PROMOTED'}])
 def test_actual_availability_stays_held(self):
  r=subprocess.check_output([sys.executable,'-B',str(ROOT/'scripts/qualify-wendbine-custody-local-v1.py'),'--availability-only']);self.assertFalse(read_json(r)['genuine_readback_executed'])
class LedgerTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup);self.p=Path(self.tmp.name)/'attempts';self.pin=ledger.create(self.p);self.e={'schema':'td613.experiment-attempt-event/v1','episode_id':'fictional','attempt_id':'attempt01','origin_receipt_id':'origin01','source_class':'SYNTHETIC','input_sha256':'a'*64}
 def add(self,s,**kw):self.pin=ledger.append(self.p,{**self.e,'event':s,**kw},self.pin)
 def test_complete_chain(self):
  self.add('PREPARED');self.add('STARTED');self.add('RETURNED',recipient_receipt_id='return01');self.add('COMPARED',recipient_receipt_id='return01');self.add('CLOSED',recipient_receipt_id='return01');self.assertEqual(ledger.read(self.p)[1],self.pin)
 def test_interrupt_and_retry(self):
  self.add('PREPARED');self.add('STARTED');self.add('INTERRUPTED')
  with self.assertRaises(ValueError):self.add('STARTED')
  with self.assertRaises(ValueError):ledger.append(self.p,{**self.e,'event':'PREPARED','attempt_id':'retry'},self.pin)
 def test_truncation_checkpoint(self):
  self.add('PREPARED');self.p.write_bytes(b'')
  with self.assertRaisesRegex(ValueError,'CHECKPOINT'):self.add('STARTED')
 def test_stale_cas_and_closed_fields(self):
  stale=self.pin;self.add('PREPARED')
  with self.assertRaises(ValueError):ledger.append(self.p,{**self.e,'event':'STARTED'},stale)
  with self.assertRaises(ValueError):self.add('STARTED',source_body='forbidden')
 def test_genuine_and_receipt_collapse(self):
  with self.assertRaises(ValueError):self.add('PREPARED',source_class='PUBLIC_SOURCE_BOUND')
  self.add('PREPARED');self.add('STARTED')
  with self.assertRaises(ValueError):self.add('RETURNED',recipient_receipt_id='origin01')
class CarrierTests(unittest.TestCase):
 def test_result_free_closure(self):
  with tempfile.TemporaryDirectory() as f:
   out=Path(f)/'execution';r=kit.export(out);self.assertEqual(kit.verify(out,r['manifest_sha256'])['files'],11);t=read_json((out/'TASK.json').read_bytes());self.assertFalse({'method_result','expected_result','origin_receipt'}&set(t));(out/'gold.json').write_text('{}')
   with self.assertRaises(ValueError):kit.verify(out,r['manifest_sha256'])
 def test_file_manifest_link_tamper(self):
  for mode in ('file','manifest','link'):
   with tempfile.TemporaryDirectory() as f:
    out=Path(f)/'execution';r=kit.export(out)
    if mode=='file':(out/'run.py').write_text('altered')
    elif mode=='manifest':(out/'MANIFEST.json').write_text('{}')
    else:(out/'unexpected').symlink_to(out/'run.py')
    with self.assertRaises(ValueError):kit.verify(out,r['manifest_sha256'])
 def test_genuine_or_expected_field_rejected(self):
  for k,v in [('source_class','PUBLIC_SOURCE_BOUND'),('method_result',[]),('expected_result',{})]:
   t=kit.fictional_task();t[k]=v
   with self.assertRaises(ValueError):blind_task.validate(t)
 def test_independent_comparator(self):
  t=kit.fictional_task();o={'receipt_id':'origin01','task':t,'expected_result':{'x':None}};r=blind_task.returned(t,{'x':None},return_id='r01',recipient_id='p01');self.assertTrue(blind_task.compare(o,r,return_id='r01',recipient_id='p01')['result_match']);r['result']={'x':False};self.assertFalse(blind_task.compare(o,r,return_id='r01',recipient_id='p01')['result_match'])
  with self.assertRaises(ValueError):blind_task.compare(o,r,return_id='wrong',recipient_id='p01')
 def test_original_native_pins(self):
  for p in read_json((kit.PACKAGE/'native/PINS.json').read_bytes()):self.assertEqual((kit.PACKAGE/p['export_path']).read_bytes(),subprocess.check_output(['git','-C',str(ROOT),'show',p['revision']+':'+p['path']]))
 def test_original_method_fictional_only(self):
  t=kit.fictional_task();result=blind_task.execute(t,str(Path(shutil.which('node')).resolve()));self.assertEqual(len(result['post_nodes']),1);o={'receipt_id':'origin','task':t,'expected_result':result};r=blind_task.returned(t,result,return_id='r',recipient_id='p');self.assertFalse(blind_task.compare(o,r,return_id='r',recipient_id='p')['recipient_execution_authenticated'])
 def test_strict_json(self):
  for raw in ('{"x":1,"x":2}','{"x":1e10000}','{"x":NaN}'):
   with self.assertRaises(ValueError):read_json(raw)
class LocalDatabaseContractTests(unittest.TestCase):
 def setUp(self):
  spec=importlib.util.spec_from_file_location('local_crosswalk_contract',ROOT/'scripts/qualify-wendbine-custody-local-v1.py');self.m=importlib.util.module_from_spec(spec);spec.loader.exec_module(self.m)
 def fixture(self,folder,orphan=False):
  a,bm,b,c,u=populations();db=Path(folder)/'origin.sqlite';r=c[0]
  with sqlite3.connect(db) as con:
   con.executescript('CREATE TABLE sources(source_id TEXT,canonical_url TEXT); CREATE TABLE capture_versions(capture_id TEXT,source_id TEXT,captured_at_utc TEXT,published_at_utc TEXT,title BLOB,selftext BLOB,title_sha256 TEXT,body_sha256 TEXT);')
   con.execute('INSERT INTO sources VALUES(?,?)',(r['source_id'],r['canonical_url']));con.execute('INSERT INTO capture_versions VALUES(?,?,?,?,?,?,?,?)',tuple(r[k] for k in ('capture_id','source_id','captured_at_utc','published_at_utc','title','selftext','title_sha256','body_sha256')))
   if orphan:con.execute("INSERT INTO capture_versions SELECT 'orphan','reddit:t3_missing',captured_at_utc,published_at_utc,title,selftext,title_sha256,body_sha256 FROM capture_versions")
  contract={'schema':'td613.wendbine.local-origin-crosswalk-contract/v1','action':'READ_ONLY_ORIGIN_CROSSWALK','receiver_admission_authorized':False,'status':'INDEPENDENTLY_APPROVED_FOR_LOCAL_READBACK','independent_custodian_receipt':'FICTIONAL_UNIT_CONTROL_ONLY','source_class':'SYNTHETIC','database_path':str(db),'database_sha256':digest(db.read_bytes())}
  def pinned(root,label,relative):return a if label=='A' else bm if 'manifestations' in relative else b
  return db,contract,pinned
 def test_readonly_synthetic_db_never_claims_genuine_execution(self):
  with tempfile.TemporaryDirectory() as f:
   db,c,pinned=self.fixture(f);before=db.read_bytes()
   with patch.object(self.m,'pinned',pinned):r=self.m.run(c,None,None,Path(f)/'result.json')
   self.assertEqual(db.read_bytes(),before);self.assertEqual(r['execution_class'],'SYNTHETIC_CALIBRATION');self.assertEqual(r['universal_readback'],'HELD_NOT_SUPPLIED')
 def test_wrong_pin_and_orphan_capture_refused(self):
  for orphan in (False,True):
   with tempfile.TemporaryDirectory() as f:
    db,c,pinned=self.fixture(f,orphan=orphan)
    if not orphan:c['database_sha256']='0'*64
    with patch.object(self.m,'pinned',pinned),self.assertRaises(ValueError):self.m.run(c,None,None,Path(f)/'result.json')
 def test_unapproved_origin_contract_refused(self):
  with self.assertRaises(ValueError):self.m.run({'schema':'td613.wendbine.local-origin-crosswalk-contract/v1'},None,None,'/unused')

class IdentityCrosswalkTests(unittest.TestCase):
 def test_withheld_unknown_survive_and_cannot_supply_spans(self):
  for marker in ('WITHHELD','UNKNOWN'):
   a,bm,b,c,u=populations();c[0]['declared_evidence_states']={'selftext':marker}
   r=wendbine.qualify(a,bm,b,c);self.assertEqual(r['capture_evidence_states']['new-capture']['declared_evidence']['selftext'],marker);self.assertEqual(r['crosswalk_disposition'],'HELD')
   with self.assertRaisesRegex(ValueError,'NOT_AVAILABLE'):wendbine.qualify(a,bm,b,c,universal_chunks=u)
  a,bm,b,c,u=populations();c[0]['withheld']=True
  self.assertEqual(wendbine.qualify(a,bm,b,c)['capture_evidence_states']['new-capture']['disclosure'],'WITHHELD')
  with self.assertRaises(ValueError):wendbine.qualify(a,bm,b,c,universal_chunks=u)
 def test_typed_receipt_and_return_ids(self):
  with self.assertRaises(ValueError):blind_task.returned(kit.fictional_task(),{},return_id=True,recipient_id='p')
  with tempfile.TemporaryDirectory() as f:
   p=Path(f)/'ledger';pin=ledger.create(p);e={'schema':'td613.experiment-attempt-event/v1','episode_id':'fictional','attempt_id':'attempt','origin_receipt_id':'origin','source_class':'SYNTHETIC','event':'PREPARED','input_sha256':'not-a-digest'}
   with self.assertRaisesRegex(ValueError,'HASH'):ledger.append(p,e,pin)
 def test_native_relation_vocabulary_and_manifestation_separation(self):
  a,bm,b,c,u=populations();e={'graph':'G_D','kind':'SCIENTIFIC_LEGACY','source_witness':'FICTIONAL_ONLY','from':'fictional_a','to':'fictional_b','relation':'DIFFERS_FROM','evidence_class':'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE'}
  self.assertEqual(wendbine.qualify(a,bm,b,c,relations=[e])['graph_counts']['G_D'],1)
  e['relation']='PROVES_PRIVATE_ORCHESTRATION'
  with self.assertRaises(ValueError):wendbine.qualify(a,bm,b,c,relations=[e])
 def test_registry_membership_missing_and_later_discovery(self):
  a,bm,b,c,u=populations();later=copy.deepcopy(c[0]);later.update(source_id='reddit:t3_later01',capture_id='later-capture',canonical_url='https://www.reddit.com/r/Wendbine/comments/later01/');c.append(later)
  r=wendbine.qualify(a,bm,b,c);x={x['source_id']:x for x in r['source_identity_crosswalk']}
  self.assertEqual(x['reddit:t3_fake001']['B_manifestation_id'],bm[0]['manifestation_id']);self.assertEqual(x['reddit:t3_later01']['state'],'LATER_DISCOVERY_OUTSIDE_A');self.assertFalse(x['reddit:t3_later01']['A_registry_member'])
  self.assertEqual(wendbine.qualify(a,bm,b,[])['source_identity_crosswalk'][0]['state'],'UNBOUND_NO_C_CAPTURE')

if __name__=='__main__':unittest.main()
