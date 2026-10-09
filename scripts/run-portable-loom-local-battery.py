#!/usr/bin/env python3
"""One local structural attempt. No model, browser, network or remote mutation calls."""
import argparse,datetime,hashlib,json,pathlib,re,subprocess,sys
p=argparse.ArgumentParser(); p.add_argument('--binding-commit',required=True); a=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]; directory=root/'research/portable-loom-local-battery-20261009'
sha=lambda b: hashlib.sha256(b).hexdigest()
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
if head!=a.binding_commit or not re.fullmatch('[a-f0-9]{40}',head): sys.exit('HOLD: exact binding commit required.')
if subprocess.run(['git','diff','--quiet'],cwd=root).returncode or subprocess.run(['git','diff','--cached','--quiet'],cwd=root).returncode: sys.exit('HOLD: tracked source differs from the frozen commit.')
binding=json.loads((directory/'EXECUTION_BINDING.local.json').read_bytes())
for member in binding['frozen_members']:
 b=(root/member['path']).read_bytes()
 if len(b)!=member['bytes'] or sha(b)!=member['sha256']: sys.exit('HOLD: frozen bytes changed: '+member['path'])
raw=directory/'raw/attempt-001'; raw.mkdir(parents=True,exist_ok=False)
map=json.loads((directory/'CASE_MAP.json').read_bytes()); targets=map['foundations']+[t for ts in map['local_cases'].values() for t in ts]+map['orchestrator_controls']
names=[t['test_name'] for t in targets]
if len(set(names))!=len(names): sys.exit('HOLD: repeated targets would inflate endpoints.')
files=sorted(set(t['file'] for t in targets)); pattern='^(?:'+'|'.join(re.escape(n) for n in names)+')$'
argv=['node','--test','--test-concurrency=1','--test-reporter=tap','--test-name-pattern='+pattern,*files]
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
request={'schema':'td613.loom.local-battery-execution-request/v0.1','binding_commit':head,'binding_sha256':sha((directory/'EXECUTION_BINDING.local.json').read_bytes()),'started_at':now(),'argv':argv,'node_version':subprocess.check_output(['node','--version'],text=True).strip(),'python_version':sys.version,'evidence_class':'LOCAL_STRUCTURAL_TEST','fixture_origin':'SOURCE_DEFINED_SYNTHETIC_INPUTS; no observed provider or browser capture','financial_spend_usd':0,'attempt':1,'primary_retries':0}
(raw/'request.json').write_text(json.dumps(request,indent=2)+'\n')
try:
 proc=subprocess.run(argv,cwd=root,capture_output=True,timeout=180)
 stdout,stderr,rc=proc.stdout,proc.stderr,proc.returncode
except subprocess.TimeoutExpired as e:
 stdout,stderr,rc=e.stdout or b'',e.stderr or b'',124
(raw/'stdout.tap').write_bytes(stdout); (raw/'stderr.txt').write_bytes(stderr)
records=[]
for line in stdout.decode('utf8',errors='replace').splitlines():
 m=re.match(r'^(not )?ok (\d+) - (.*?)(?: # (SKIP|TODO)(?: .*)?)?$',line)
 if m: records.append({'test_name':m.group(3),'status':'SKIP' if m.group(4) else 'FAIL' if m.group(1) else 'PASS'})
def score(ts):
 rows=[]
 for t in ts:
  found=[r for r in records if r['test_name']==t['test_name']]
  rows.append({**t,'captured_matches':len(found),'status':found[0]['status'] if len(found)==1 else 'MISSING_OR_DUPLICATE'})
 endpoint='CONTRADICTED' if any(r['status']=='FAIL' for r in rows) else 'SUPPORTED_BOUNDED' if all(r['status']=='PASS' for r in rows) else 'HELD_EVIDENCE_GAP'
 return {'endpoint':endpoint,'tests':rows}
raw_members=[{'path':str(f.relative_to(root)),'bytes':f.stat().st_size,'sha256':sha(f.read_bytes())} for f in sorted(raw.iterdir())]
results={'schema':'td613.loom.local-battery-results/v0.1','binding_commit':head,'completed_at':now(),'process_exit_code':rc,'evidence_class':'LOCAL_STRUCTURAL_TEST','foundation':score(map['foundations']),'cases':{c:score(ts) for c,ts in map['local_cases'].items()},'orchestrator_controls':score(map['orchestrator_controls']),'captured_tests':records,'raw_members':raw_members,'actual_receiver_trials':0,'simulated_receiver_trials':0,'browser_assay_trials':0,'provider_side_observation':False,'human_comprehension':'UNMEASURED','external_assay':'NOT_RUN_UNBOUND_RECEIVERS','golden_egg':'NOT_ESTABLISHED','closure':'HUMAN_REVIEW_REQUIRED'}
results['case_counts']={k:sum(v['endpoint']==k for v in results['cases'].values()) for k in ['SUPPORTED_BOUNDED','CONTRADICTED','HELD_EVIDENCE_GAP']}
results['local_track_status']='COMPLETED_BOUNDED' if rc==0 and results['case_counts']['SUPPORTED_BOUNDED']==12 and results['foundation']['endpoint']=='SUPPORTED_BOUNDED' and results['orchestrator_controls']['endpoint']=='SUPPORTED_BOUNDED' else 'STOPPED_PRESERVE_ATTEMPT'
(directory/'RESULTS.local.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps({k:results[k] for k in ['binding_commit','process_exit_code','case_counts','local_track_status','actual_receiver_trials']},indent=2))
sys.exit(0 if results['local_track_status']=='COMPLETED_BOUNDED' else 1)
