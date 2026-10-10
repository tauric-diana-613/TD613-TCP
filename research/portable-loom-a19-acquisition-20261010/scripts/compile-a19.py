import pathlib,json,base64,hashlib,datetime,zipfile,subprocess
ROOT=pathlib.Path('/workspace/scratch/26d2ceda3f9e');RUN=ROOT/'continuation-a19';CALLER=ROOT/'caller-a19';OLD=pathlib.Path('/workspace/scratch/9d69e9b2a01d');PREV=pathlib.Path('/workspace/scratch/3a1fda34907f')
def read(p):return json.loads(p.read_bytes())
def h(b):return hashlib.sha256(b).hexdigest()
def canon(v):return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def save(n,v):
 with (RUN/n).open('x') as f:json.dump(v,f,indent=2,ensure_ascii=False);f.write('\n')
checks=[]
def check(label,ok):
 checks.append({'check':label,'pass':bool(ok)})
 if not ok:raise RuntimeError(label)
policy=read(RUN/'POLICY.json');plan=read(RUN/'PLAN.json');freeze=read(RUN/'FREEZE_COMMIT.json');execution=read(RUN/'raw/run-001/execution.json');ledger=read(RUN/'NEON_FINAL_STATE_RAW.json');cred=read(RUN/'CREDENTIAL_BINDING.json')
check('policy canonical',h(canon(policy))==freeze['policy_sha256']);check('plan canonical',h(canon(plan))==freeze['plan_sha256']);check('runner frozen',h((RUN/'run-targeted-a19.mjs').read_bytes())==freeze['runner_sha256']);check('freeze actual preimage',h((RUN/'FREEZE_BUNDLE.json').read_bytes())==freeze['bundle_sha256'])
for f in read(RUN/'FREEZE_BUNDLE.json')['files']:
 b=(RUN/f['path']).read_bytes();check('freeze member '+f['path'],h(b)==f['sha256'] and len(b)==f['bytes'] and b==base64.b64decode(f['content_base64'],validate=True))
check('caller head',subprocess.check_output(['git','rev-parse','HEAD'],cwd=CALLER,text=True).strip()==freeze['local_caller_commit']);check('caller clean',subprocess.check_output(['git','status','--porcelain'],cwd=CALLER,text=True).strip()=='');check('caller source lock',h((CALLER/'RESTORED_SOURCE_LOCK.json').read_bytes())==freeze['source_lock_sha256'])
for f in read(CALLER/'RESTORED_SOURCE_LOCK.json')['files']:check('source bytes '+f['path'],h((CALLER/f['path']).read_bytes())==f['local_sha256'])
check('exact a18 final two calls',plan['calls']==read(ROOT/'continuation-a18/PLAN.json')['calls'][-2:])
for a,count,cost in [('a12',0,0),('a13',5,551226000),('a14',1,110168250),('a15',9,996168000),('a16',1,110195250),('a17',1,110195250),('a18',4,443186250)]:
 r=next(x for x in ledger['runs'] if x['run_id'].endswith('-'+a));check(a+' unchanged HELD',r['status']=='HELD' and int(r['calls_reserved'])==count and int(r['reserved_cost_nanos'])==cost)
rows={r['call_key']:r for r in ledger['calls'] if r['run_id']==policy['run_id']};prior={};inventory=[];providers=0;answers=0
for index,item in enumerate(plan['calls'],1):
 folder=RUN/'raw/run-001'/f'call-{index:02d}';key=f"{item['trial_id']}:{item['role']}:{item['turn_index']}"
 if not (folder/'capture.json').exists():
  check('unattempted no Neon '+key,key not in rows);inventory.append({'call_number':index,**item,'status':'UNATTEMPTED','provider_requests':0});continue
 c=read(folder/'capture.json');r=read(RUN/'raw/run-001'/f'call-{index:02d}-receipt.json');req=(folder/'request.body.json').read_bytes();wire=(folder/'provider-request.body.json').read_bytes();outer=(folder/'response.body.bin').read_bytes();e=json.loads(outer) if outer else None
 check('capture identity '+key,h((folder/'capture.json').read_bytes())==r['capture_sha256']);check('request identity '+key,h(req)==c['request_sha256']);check('wire identity '+key,h(wire)==c['provider_request_sha256']==r['provider_request_sha256']);check('response identity '+key,h(outer)==c['response_sha256']);check('envelope identity '+key,e==c['response']);check('trial identity '+key,c['trial']==item)
 predecessors=prior.get(item['trial_id'],[]);messages=json.loads(req)['messages'];check('same-run predecessor bytes '+key,len(predecessors)==item['turn_index'] and [m['content'] for m in messages if m['role']=='assistant']==predecessors)
 if item['turn_index']==0:check('frozen first wire '+key,h(wire)==next(t['first_provider_request_sha256'] for t in plan['trial_order'] if t['trial_id']==item['trial_id']))
 actual=int((e or {}).get('provider_requests',0));providers+=actual;provider=None;answer=None;ah=None;ph=None;error=None
 if e and e.get('provider_response_base64') is not None:
  provider=base64.b64decode(e['provider_response_base64'],validate=True);ph=h(provider);check('provider identity '+key,ph==e['provider_response_sha256']);(folder/'provider-response.body.bin').write_bytes(provider)
  body=json.loads(provider) if provider else {};error=body.get('error')
  if c['status']=='CAPTURED_NOT_ADMITTED':
   candidate=body['candidates'][0];answer=''.join(p['text'] for p in candidate['content']['parts'] if not p.get('thought'));ah=h(answer.encode());check('answer identity '+key,answer==c['returned']['text']==e['returned']['text'] and ah==c['returned']['answer_sha256']==e['returned']['answer_sha256']);check('provider completion '+key,candidate['finishReason']=='STOP' and body['modelVersion']=='gemini-3.8-flash');(folder/'answer.utf8.txt').write_bytes(answer.encode())
 if actual:
  check('actual fingerprint '+key,e['provider_credential_sha256']==cred['expected_provider_credential_sha256']);check('actual source '+key,e['source_commit']==policy['protocol_commit'] and e['artifact_sha256']==policy['artifact_sha256']);row=rows[key];check('Neon provider hashes '+key,row['request_sha256']==h(wire) and row['response_sha256']==ph and row['answer_sha256']==ah);check('Neon status '+key,row['status']==c['status']);check('Neon reservation '+key,int(row['reserved_cost_nanos'])==int(e['reservation']['reserved_cost_nanos']));check('zero retries '+key,e['retries']==c['retries']==0)
 else:check('no provider no reservation '+key,key not in rows)
 if answer is not None:answers+=1;predecessors.append(answer);prior[item['trial_id']]=predecessors
 inventory.append({'call_number':index,**item,'call_key':key,'status':c['status'],'provider_requests':actual,'provider_http_status':(e or {}).get('http_status'),'relay_http_status':c['http_status'],'provider_error':error,'local_error':c['error'],'request_sha256':h(req),'provider_request_sha256':h(wire),'response_sha256':h(outer),'provider_response_sha256':ph,'answer_sha256':ah,'provider_credential_sha256':(e or {}).get('provider_credential_sha256'),'reserved_cost_nanos':int(rows[key]['reserved_cost_nanos']) if key in rows else 0,'started_at':c['started_at'],'ended_at':c['ended_at'],'custody_admitted':False})
run=next(r for r in ledger['runs'] if r['run_id']==policy['run_id']);tot=ledger['totals'];check('run closed',run['status']=='HELD');check('run row count',int(run['calls_reserved'])==len(rows));check('run reservation sum',int(run['reserved_cost_nanos'])==sum(int(r['reserved_cost_nanos']) for r in rows.values()));check('program cap',tot['reserved_calls']<=88 and tot['reserved_cost_nanos']<=10000000000 and tot['active_runs']==0);check('stop first HOLD',execution['calls_held']<=1 and (execution['calls_held']==0 or execution['stop']['held_call_number']==execution['calls_attempted']));check('answer count',answers==execution['calls_captured_not_admitted'])
before=read(RUN/'LIVE_LEDGER_PRE_FREEZE.json')
for old in before['runs']:
 check('historical full run preserved '+old['run_id'],next(x for x in ledger['runs'] if x['run_id']==old['run_id'])==old)
for old in before['calls']:
 check('historical call preserved '+old['run_id']+':'+old['call_key'],next(x for x in ledger['calls'] if x['run_id']==old['run_id'] and x['call_key']==old['call_key'])==old)
summary={'schema':'td613.loom.a19-capture-inventory/v1','run_id':policy['run_id'],'execution_status':execution['status'],'actual_gemini_calls':providers,'answers_captured':answers,'provider_holds':sum(x['provider_requests']>0 and x['status']!='CAPTURED_NOT_ADMITTED' for x in inventory),'unattempted_calls':sum(x['status']=='UNATTEMPTED' for x in inventory),'new_reserved_calls':int(run['calls_reserved']),'run_reserved_cost_nanos':int(run['reserved_cost_nanos']),'program_totals':tot,'remaining_calls':88-tot['reserved_calls'],'remaining_reserved_cost_nanos':10000000000-tot['reserved_cost_nanos'],'billing_status':'OPERATOR_ATTESTED_PAID','credential_binding':'RUNTIME_FINGERPRINT_MATCHED; PAID_ASSOCIATION_OPERATOR_ATTESTED','custody_admitted':False,'analysis_performed':False,'historical_original_program_outputs_preserved':52,'original_output_coverage_with_separate_replacement':54,'original_program_outputs_planned':54,'prior_a13_successful_targeted_outputs':4,'prior_a15_successful_targeted_outputs':8,'prior_a18_targeted_outputs_preserved':14,'current_targeted_outputs_preserved':14+answers,'targeted_outputs_planned':16,'trials':inventory}
save('A19_CAPTURE_INVENTORY.json',summary)
subprocess.run(['git','bundle','create',str(RUN/'CALLER_A19.bundle'),'--all'],cwd=CALLER,check=True,capture_output=True)
check('local run reservation ceiling',int(run['reserved_cost_nanos'])<=300000000 and int(run['calls_reserved'])<=2)
check('a19 source fingerprint check zero provider calls',read(RUN/'credential.body.bin')['provider_requests']==read(RUN/'credential.body.bin')['ledger_operations']==0)
prior_archives={ROOT/'Portable_Loom_A18_Acquisition_Evidence_20261010.zip':'ad293cb3c1f9373a1afa71ecbdc8090ec49444b2257c54506ee0d15fc83fb1a6',ROOT/'Portable_Loom_A19_Preexecution_Hold_20261010.zip':'83eed91c1587712e58b514a01f45b7e276ea4c5c6c8085a68f9f5ea2c0d9f813',PREV/'Portable_Loom_A14_Acquisition_Evidence_20261010.zip':'bff4aeff4a03caf4b2d4f51d53ae99199d99548a1eb8c9682ac6875de6ab7122',PREV/'Portable_Loom_Credential_Evidence_Addendum_20261010.zip':'c1bfbfb05fcf85861bf3bd4e0fa16b868e9f7ec0ab5f75a2f2dc7661819ef8bc'}
for p,d in prior_archives.items():check('prior archive anchor '+p.name,h(p.read_bytes())==d)
save('CUSTODY_VERIFICATION.json',{'schema':'td613.loom.a19-custody-verification/v1','status':'PASS','checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'custody_admitted':False,'semantic_adjudication_performed':False,'billing_status':'OPERATOR_ATTESTED_PAID','inherited_a13_bundle_preimage':'UNLOCATED; retained as unresolved; individual files remain preserved','historical_original_output_bytes':52,'original_output_slot_coverage_with_separate_replacement':54})
lines=['𝌋 TD613 · PORTABLE LOOM A19 · Raw acquisition receipt','',f"Run: {policy['run_id']}",f"Actual Gemini calls: {providers}",f"Answers captured: {answers}",f"Provider HOLDs: {summary['provider_holds']}",f"Unattempted turns: {summary['unattempted_calls']}",f"New reservations: {run['calls_reserved']}; ${int(run['reserved_cost_nanos'])/1e9:.8f}",f"Shared reservations: {tot['reserved_calls']}/88; ${tot['reserved_cost_nanos']/1e9:.8f}/$10",f"Remaining: {summary['remaining_calls']} reservations; ${summary['remaining_reserved_cost_nanos']/1e9:.8f}",'','Reservations remain separate from billed charges. Paid association: OPERATOR_ATTESTED_PAID. Production fingerprint independently observed; independent comparison to the Google-displayed key fingerprint remains unperformed.','',f"Release: {policy['protocol_commit']}",f"Freeze bundle: {freeze['bundle_sha256']}",f"Caller commit: {freeze['local_caller_commit']}",'','A19 uses the exact last two planned a18 calls. Turn 0 separately replaces the a18 provider failure. Turn 1 uses only this run’s successful turn-0 answer. Zero retries. All returned outputs remain CAPTURED_NOT_ADMITTED. Run parked HELD using established protocol; parking is separate from execution result.','', '| Call | Trial | Turn | Capture status | Provider HTTP |','|---:|---|---:|---|---:|']
for x in inventory:lines.append(f"| {x['call_number']} | {x['trial_id']} | {x['turn_index']} | {x['status']} | {x.get('provider_http_status','—')} |")
lines+=['',f"Targeted capture coverage: {summary['current_targeted_outputs_preserved']}/16. Historical original bytes: 52/54; original output-slot coverage with separately recorded replacements: 54/54. These counts describe custody coverage only.",'','Every historical run row and call row compared exactly against the preexecution snapshot. Local provider/answer hashes compared against Neon. The inherited a13 ancillary freeze-bundle preimage remains UNLOCATED. Raw prior archives and their integrity anchors are carried without reconstruction.','', 'Fresh source/fingerprint HTTP reads succeeded. Vercel deployment read returned 404 and deployment list returned 403; those connector observations remain recorded. No additional source change, merge or deployment occurred. The local budget entrypoint has one extra trailing blank line relative to GitHub; the ledger module matches exactly.','', 'No semantic adjudication, statistics, admission, comparison, Dollhouse battery, or readiness judgment performed.','', '𝄐 ACQUISITION REST · AWAITING HIGHER-MODEL ANALYTICAL ASSAY ⟐']
(RUN/'A19_ACQUISITION_RECEIPT.md').write_text('\n'.join(lines)+'\n')
files={'a19/'+str(p.relative_to(RUN)):p.read_bytes() for p in sorted(RUN.rglob('*')) if p.is_file()}
for p in prior_archives:files['prior/'+p.name]=p.read_bytes()
for p in sorted(CALLER.rglob('*')):
 if p.is_file() and '.git' not in p.parts:files['caller/'+str(p.relative_to(CALLER))]=p.read_bytes()
for name in ['prepare-a19.py','freeze-a19.mjs','build-enrollment-a19.py','compile-a19.py']:files['scripts/'+name]=(ROOT/name).read_bytes()
for name in ['BUILD_RECEIPT.json','BUDGET_FUNCTION.zip']:files['budget-bundle/'+name]=(ROOT/'a19-candidate/neon-a19-bundle'/name).read_bytes()
token=(OLD/'recovery-private/assay-relay-access.token').read_bytes().strip()
for name,b in files.items():
 if token in b:raise RuntimeError('Protected relay capability found; archive refused')
manifest={'schema':'td613.loom.archive-integrity/v1','manifest_excludes_itself':True,'files':[{'path':name,'bytes':len(b),'sha256':h(b)} for name,b in sorted(files.items())]};files['INTEGRITY_MANIFEST.json']=(json.dumps(manifest,indent=2)+'\n').encode()
archive=ROOT/'Portable_Loom_A19_Acquisition_Evidence_20261010.zip'
with zipfile.ZipFile(archive,'x',zipfile.ZIP_DEFLATED) as z:
 for name,b in sorted(files.items()):z.writestr(name,b)
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 for m in manifest['files']:assert h(z.read(m['path']))==m['sha256'] and len(z.read(m['path']))==m['bytes']
print(json.dumps({'archive':str(archive),'sha256':h(archive.read_bytes()),'bytes':archive.stat().st_size,'payload_members':len(manifest['files']),'integrity':'PASS_ALL_PAYLOAD_HASHES_AND_CRC','acquisition':{k:v for k,v in summary.items() if k!='trials'}}))
