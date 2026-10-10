"""Read-only byte and lineage audit. No provider, admission, or ledger writes."""
import base64, collections, hashlib, io, json, re, shutil, zipfile
from datetime import datetime, timezone
from pathlib import Path

OUT = Path(__file__).resolve().parent
REC = Path('/workspace/scratch/9d69e9b2a01d')
CUR = Path('/workspace/scratch/26d2ceda3f9e')
PRE = Path('/workspace/scratch/3a1fda34907f')
def sha(b): return hashlib.sha256(b if isinstance(b, bytes) else b.encode()).hexdigest()
def read(p): return json.loads(Path(p).read_bytes())
def save(n,x): (OUT/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
live = read(OUT/'inputs/NEON_ANALYSIS_SNAPSHOT.json')
previous = read(CUR/'continuation-a19/NEON_FINAL_STATE_RAW.json')
ledger = {(x['run_id'],x['call_key']):x for x in live['calls']}
all_capture_paths = set()
for root in (REC,CUR,PRE):
    all_capture_paths.update(root.rglob('capture.json'))
local = collections.defaultdict(list)
for p in sorted(all_capture_paths):
    try:
        c = read(p); req=read(p.parent/'request.body.json')
        k=(req.get('run_id'),f"{c['trial']['trial_id']}:{c['trial']['role']}:{c['trial']['turn_index']}")
        if k in ledger: local[k].append(p)
    except (OSError,ValueError,KeyError): pass
baseline = read(REC/'assay-review/CAPTURE_DATASET.json')
baseline_paths={Path(x['path']):x for x in baseline}
supp=read(REC/'assay-review/SUPPLEMENTARY_A11_CAPTURE.json')
supp_path=Path(supp['capture_path'])
target_specs={'a13':[1,2,3,4],'a15':[1,2,3,4,5,6,7],'a18':[1,2,3],'a19':[1,2]}
target_paths={}
for a,ns in target_specs.items():
    root=REC if a=='a13' else CUR
    for n in ns:
        p=root/f'continuation-{a}/raw/run-001/call-{n:02d}/capture.json'
        target_paths[p]=(a,n)
preferred=set(baseline_paths)|{supp_path}|set(target_paths)
rows=[]; gaps=[]
for key,l in sorted(ledger.items()):
    candidates=local.get(key,[])
    if not candidates:
        gaps.append({'run_id':key[0],'call_key':key[1],'ledger':l,'status':'LOCAL_RAW_PREIMAGE_UNLOCATED'})
        continue
    p=next((p for p in candidates if p in preferred),candidates[0])
    c=read(p); d=p.parent; reqbytes=(d/'request.body.json').read_bytes(); req=json.loads(reqbytes)
    outer=(d/'response.body.bin').read_bytes(); response=json.loads(outer)
    wire=(d/'provider-request.body.json').read_bytes(); w=json.loads(wire)
    provider=base64.b64decode(response['provider_response_base64'],validate=True)
    try: body=json.loads(provider)
    except (ValueError,UnicodeDecodeError): body={'unparsed_response_bytes':len(provider)}
    checks={
      'relay_request_sha256':sha(reqbytes)==c['request_sha256'],
      'outer_response_sha256':sha(outer)==c['response_sha256'],
      'outer_response_object':response==c['response'],
      'provider_request_sha256':sha(wire)==c['provider_request_sha256']==response['provider_request_sha256']==l['request_sha256'],
      'provider_response_sha256':sha(provider)==response['provider_response_sha256']==l['response_sha256'],
      'trial':req['trial']==c['trial']==response['trial'],
      'source':req['protocol_commit']==c['source_commit']==response['source_commit'],
      'artifact':req['artifact_sha256']==c['artifact_sha256']==response['artifact_sha256'],
      'zero_retries':c['retries']==response['retries']==0,
      'ledger_status':c['status']==l['status'],
    }
    answer=None
    if c['status']=='CAPTURED_NOT_ADMITTED':
      answer=''.join(x.get('text','') for x in body['candidates'][0]['content']['parts'] if not x.get('thought'))
      checks.update(answer_bytes=answer==c['returned']['text']==response['returned']['text'],
                    answer_sha256=sha(answer)==c['returned']['answer_sha256']==l['answer_sha256'],
                    finish_reason=body['candidates'][0]['finishReason']=='STOP',
                    model=body['modelVersion']=='gemini-3.8-flash')
      if (d/'answer.utf8.txt').exists(): checks['retained_answer_bytes']=(d/'answer.utf8.txt').read_bytes()==answer.encode()
    else: checks['no_answer']=l['answer_sha256'] is None and c.get('returned') is None
    if (d/'provider-response.body.bin').exists(): checks['retained_provider_bytes']=(d/'provider-response.body.bin').read_bytes()==provider
    if p in baseline_paths:
      checks['baseline_inventory_capture']=sha(p.read_bytes())==baseline_paths[p]['capture_sha256']
      checks['baseline_inventory_answer']=answer==baseline_paths[p]['text']
    phase='UNASSIGNED'
    if p in baseline_paths: phase='A9_REPLACEMENT' if key[0].endswith('-a9') else 'RETAINED_ORIGINAL_SLOT'
    elif p==supp_path: phase='A11_FRESH_SETUP_SUPPLEMENT'
    elif p in target_paths: phase='SELECTED_TARGETED_REGRESSION'
    elif answer is not None: phase='EARLIER_TARGETED_SETUP_SUPPLEMENT'
    else: phase='FAILED_PROVIDER_ATTEMPT'
    r={'run_id':key[0],'call_key':key[1],'trial':c['trial'],'status':c['status'],'phase':phase,
       'capture_path':str(p),'capture_sha256':sha(p.read_bytes()),'artifact_sha256':c['artifact_sha256'],
       'source_commit':c['source_commit'],'provider_request_sha256':sha(wire),'provider_response_sha256':sha(provider),
       'answer_sha256':sha(answer) if answer is not None else None,'started_at':c['started_at'],'ended_at':c['ended_at'],
       'provider_http_status':response['http_status'],'relay_http_status':c['http_status'],
       'provider_requests':response['provider_requests'],'reserved_cost_nanos':l['reserved_cost_nanos'],
       'generation_config':w.get('generationConfig'),'tools_absent':'tools' not in w and 'toolConfig' not in w,
       'checks':checks,'all_byte_checks_pass':all(checks.values()),'answer':answer,
       'provider_error':body.get('error'),'request_messages':req['messages']}
    rows.append(r)

bykey={(r['run_id'],r['call_key']):r for r in rows}
for r in rows:
  if r['phase']=='SELECTED_TARGETED_REGRESSION':
    messages=r['request_messages']; n=r['trial']['turn_index']
    if n:
      preds=[bykey.get((r['run_id'],f"{r['trial']['trial_id']}:RECEIVER:{i}")) for i in range(n)]
      assistant=[m['content'] for m in messages if m['role']=='assistant']
      r['same_run_predecessor_check']=all(p and p['status']=='CAPTURED_NOT_ADMITTED' for p in preds) and assistant==[p['answer'] for p in preds if p]
    else:r['same_run_predecessor_check']=not any(m['role']=='assistant' for m in messages)

archive_path=CUR/'Portable_Loom_A19_Acquisition_Evidence_20261010.zip'
archive_checks=[]
def audit_zip(data,label,depth=0):
  with zipfile.ZipFile(io.BytesIO(data)) as z:
    manifests=[]
    for name in z.namelist():
      if depth==0 and name!='INTEGRITY_MANIFEST.json': continue
      if depth and not ('MANIFEST' in name.upper() or 'INTEGRITY' in name.upper()): continue
      if not name.endswith('.json'):continue
      try: m=json.loads(z.read(name))
      except (ValueError,UnicodeDecodeError):continue
      if not isinstance(m,dict) or not isinstance(m.get('files'),list): continue
      checks=[]
      for item in m['files']:
        if not isinstance(item,dict) or 'path' not in item or 'sha256' not in item:continue
        path=item['path']
        if path not in z.namelist():
          prefix=str(Path(name).parent)
          alt=prefix+'/'+path if prefix!='.' else path
          if alt in z.namelist():path=alt
          else:continue # only complete archive manifests are credited
        raw=z.read(path);checks.append({'path':path,'sha256_matches':sha(raw)==item['sha256'],'size_matches':len(raw)==item.get('bytes',len(raw))})
      manifests.append({'path':name,'declared_members':len(m['files']),'available_members_checked':len(checks),'all_available_pass':all(x['sha256_matches'] and x['size_matches'] for x in checks),'complete':len(checks)==len(m['files'])})
    archive_checks.append({'archive':label,'sha256':sha(data),'bytes':len(data),'members':len(z.namelist()),'crc_bad_member':z.testzip(),'manifests':manifests})
    if depth<5:
      for n in z.namelist():
        if n.endswith('.zip') and 'budget' not in n.lower(): audit_zip(z.read(n),label+'!/'+n,depth+1)
audit_zip(archive_path.read_bytes(),archive_path.name)

old=REC/'recovered-source/research/portable-loom-kit-assay-20261009/corrected-artifact/portable-loom-standard.md'
new=REC/'loom-repair-candidate/research/portable-loom-receiver-repair-20261010/candidate-artifact/portable-loom-standard.md'
artifact_checks={'original_sha256':sha(old.read_bytes()),'revised_sha256':sha(new.read_bytes()),
 'expected_original_matches':sha(old.read_bytes())=='2d9c23bb6ad26430bcf4fd2a52e9aa5e876a1546265a00087cdb7e7e4f1c1872',
 'expected_revised_matches':sha(new.read_bytes())=='e6811ad6b15ab40be189b1882c588380fbafbede81fd0d14d3482f00b7e9f7ea'}
indexed=lambda rs,ks:{tuple(r[k] for k in ks):r for r in rs}
summary={'schema':'td613.loom.a19-analytical-byte-audit/v1','checked_at':datetime.now(timezone.utc).isoformat(),
 'live_ledger_observed_at':live['observed_at'],'ledger_unchanged_by_full_keys':
  indexed(live['runs'],['run_id'])==indexed(previous['runs'],['run_id']) and indexed(live['calls'],['run_id','call_key'])==indexed(previous['calls'],['run_id','call_key']) and live['totals']==previous['totals'],
 'totals':live['totals'],'ledger_answer_rows':sum(x['status']=='CAPTURED_NOT_ADMITTED' for x in live['calls']),
 'ledger_failed_rows':sum(x['status']!='CAPTURED_NOT_ADMITTED' for x in live['calls']),
 'locally_audited_capture_records':len(rows),'locally_audited_answers':sum(r['answer'] is not None for r in rows),
 'phase_counts':dict(collections.Counter(r['phase'] for r in rows)),'missing_local_preimages':gaps,
 'all_available_capture_byte_checks_pass':all(r['all_byte_checks_pass'] for r in rows),
 'failed_byte_checks':[{'run_id':r['run_id'],'call_key':r['call_key'],'checks':r['checks']} for r in rows if not r['all_byte_checks_pass']],
 'all_selected_targeted_predecessor_checks_pass':all(r['same_run_predecessor_check'] for r in rows if r['phase']=='SELECTED_TARGETED_REGRESSION'),
 'archive_sha256_matches':sha(archive_path.read_bytes())=='0b623d6e19a425fb8777fd9551263f1fe653f696738fc097cd10f819bc471688',
 'archive_checks':archive_checks,'artifact_checks':artifact_checks,'custody_admitted':False,'new_provider_calls':0}
save('BYTE_AUDIT.json',summary)
save('VERIFIED_CORPUS.json',[{k:v for k,v in r.items() if k!='request_messages'} for r in rows])
save('TARGETED_CORPUS.json',[{k:v for k,v in r.items() if k!='request_messages'} for r in rows if r['phase']=='SELECTED_TARGETED_REGRESSION'])
save('PROVIDER_FAILURE_INVENTORY.json',[{k:v for k,v in r.items() if k not in ('answer','request_messages')} for r in rows if r['answer'] is None])
save('COUNT_RECONCILIATION.json',{'original_planned_slots':54,'retained_original_slot_preimages':51,'a8_original_R12_3_preimage':'UNLOCATED','a9_separate_replacement_preimages':1,'original_program_review_dataset_entries_including_replacement':52,'a11_fresh_setup_supplement':1,'selected_revised_targeted_outputs':16,'earlier_revised_R06_setup_supplement':1,'all_locally_retained_answers':70,'ledger_answer_rows':71,'logical_case_turn_coverage_with_separate_replacement_trials':54,'qualification':'Logical label coverage across artifacts/runs is not recovery of the original experimental states. Saved earlier acquisition counts remain unchanged.'})
print(json.dumps({k:v for k,v in summary.items() if k not in ('archive_checks','missing_local_preimages')},indent=2))
print('MISSING',json.dumps(gaps,indent=2))
