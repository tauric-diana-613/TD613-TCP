"""Exact export closure, without an OS-isolation claim."""
from pathlib import Path
from .common import canonical,digest,read_json
from .blind_task import METHOD,validate
PACKAGE=Path(__file__).resolve().parent
FILES=['__init__.py','common.py','blind_task.py','run-wendbine-task.mjs','native/PINS.json','native/wendbine-compile.mjs','native/wendbine-native-method-adapter-v1.mjs','native/wendbine-native-compiler-contract-v1.json']
def fictional_task():
 meta={'schema':'wendbine-public-corpus-snapshot/v0.1','snapshot_id':'FICTIONAL-CALIBRATION-ONLY','coverage':{'admitted_source_count':1},'rights':{'full_post_bodies_copied':False},'scope':{'private_google_group_admitted':False},'authority':{'human_closure_required':True,'td613_scientific_promotion':False,'merge':False,'deployment':False}}
 posts=[{'source_id':'reddit:t3_fake001','snapshot_id':meta['snapshot_id'],'community':'r/Wendbine','source_text_stored':False,'real_person_identity_adjudicated':False,'canonical_url':'https://www.reddit.com/r/Wendbine/comments/fake001/','declared_concepts':['fictional_a','fictional_b'],'source_flags':[],'technical_header':'Openly fictional calibration','public_date':'2026-09-10','time_precision':'DAY'}]
 reg={'schema':'wendbine-typed-relation-registry/v0.1','snapshot_id':meta['snapshot_id'],'fields':['source_id','graph','from','relation','to','evidence_class'],'relations':[['reddit:t3_fake001','G_D','fictional_a','DIFFERS_FROM','fictional_b','SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE']]}
 return validate({'schema':'td613.experiment-a.result-free-task/v1','episode_id':'TD613-EA-SUCCESSOR-WU-01-CALIBRATION','task_id':'fictional-compiler-01','source_class':'SYNTHETIC','source_id':'fictional-input-01','capture_id':'fictional-capture-01','method':METHOD.copy(),'inputs':{'meta':meta,'posts':posts,'registry':reg},'authority':{'admission':False,'flight':False,'scientific_promotion':False}})
def export(out):
 out=Path(out)
 if not out.is_absolute() or out.exists() or any(x.is_symlink() for x in (out,*out.parents)):raise ValueError('EXCLUSIVE_NONLINK_EXPORT')
 files={'experiment_a_preparation_v1/'+rel:(PACKAGE/rel).read_bytes() for rel in FILES}
 files['TASK.json']=canonical(fictional_task());files['run.py']=b"import sys\nfrom pathlib import Path\nsys.path.insert(0,str(Path(__file__).resolve().parent))\nfrom experiment_a_preparation_v1.blind_task import main\nmain()\n"
 manifest={'schema':'td613.experiment-a.clean-execution-export/v1','code_origin_base':'eb9bf1e8a837737bb50d0d0add11ca4de70f7be6','ancestral_clean_base':'50cc9d161f8f72c2d4b6ea33ece17ace88f35eff','purpose':'SYNTHETIC_RESULT_FREE_CALIBRATION_ONLY','files':[{'path':p,'sha256':digest(b),'bytes':len(b)} for p,b in sorted(files.items())],'runtime_dependencies':['Python 3.12 standard library','independently pinned Node 24 and system libraries'],'dynamic_method_registry':['WENDBINE_PUBLIC_COMPILER_V01'],'forbidden_context_classes':['supervisory_dossier','expected_results','gold','rankings','prior_returns','prior_unblinding','Work_context','Experiment_B','repository_history','credentials','evaluation_keys'],'os_isolation':'UNQUALIFIED_BY_PACKAGE','genuine_source_admission':False}
 out.mkdir()
 for rel,raw in files.items():p=out/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
 (out/'MANIFEST.json').write_bytes(canonical(manifest));return {'manifest':manifest,'manifest_sha256':commitment_manifest(manifest),'task_sha256':digest(files['TASK.json'])}
def commitment_manifest(m):return digest(canonical(m))
def verify(out,pin):
 out=Path(out)
 if not out.is_absolute() or any(x.is_symlink() for x in (out,*out.parents)):raise ValueError('EXPORT_ROOT_LINK')
 raw=(out/'MANIFEST.json').read_bytes()
 if digest(raw)!=pin:raise ValueError('INDEPENDENT_MANIFEST_PIN')
 m=read_json(raw);expected={f['path'] for f in m['files']}|{'MANIFEST.json'}
 if len(expected)!=len(m['files'])+1 or any(Path(f['path']).is_absolute() or '..' in Path(f['path']).parts for f in m['files']):raise ValueError('EXPORT_PATHS')
 actual=set()
 for p in out.rglob('*'):
  if p.is_symlink():raise ValueError('EXPORTED_LINK')
  if p.is_file():actual.add(p.relative_to(out).as_posix())
 if actual!=expected:raise ValueError('FORBIDDEN_OR_MISSING_MEMBER')
 for f in m['files']:
  b=(out/f['path']).read_bytes()
  if len(b)!=f['bytes'] or digest(b)!=f['sha256']:raise ValueError('EXPORTED_FILE_DRIFT')
 validate(read_json((out/'TASK.json').read_bytes()))
 return {'files':len(expected),'payload_closure':'QUALIFIED_SYNTHETIC_ONLY','expected_result_in_task':False,'runtime_isolation':'UNESTABLISHED'}
