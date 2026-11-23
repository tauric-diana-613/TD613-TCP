import pathlib,json,hashlib,subprocess,re
R=pathlib.Path(__file__).resolve().parents[1];base=R/'baseline';H=lambda b:hashlib.sha256(b).hexdigest()
html=(base/'app/encyclopedia/vix-cyb.html').read_text();raw=re.search(r'<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)</script>',html).group(1);c=json.loads(raw)
assert (len(c['works']),sum(len(w['linked_sources']) for w in c['works']),len(c['instruments']),len(c['human_gates']),len(c['batch_b_files']))==(32,53,21,8,0)
rows=[];sources={}
for part in [1,2]:
 p=base/f'app/encyclopedia/vixen-estate/corpus-experiment-a-part{part}.json';s=json.loads(p.read_text())['sources'];sources.update(s)
for w in c['works']:
 for linked in w['linked_sources']:
  d=sources[linked['source_file_id']];text=d['text_body'].encode();assert H(text)==d['derivative_sha256'] and len(text)==d['derivative_byte_length'];assert d['declared_source_sha256']==linked['sha256'];rows.append({'work':w['work_id'],'manifestation':linked['source_file_id'],'original_declared_sha256':linked['sha256'],'derivative_sha256':H(text),'bytes':len(text)})
assert len(rows)==53
inventory=json.loads((R/'evidence/baseline-byte-inventory.json').read_text());changed=[]
for e in inventory:
 if H((base/e['path']).read_bytes())!=e['sha256']:changed.append(e['path'])
assert not changed
roster=H(json.dumps(c['works'],sort_keys=True,separators=(',',':')).encode());tasks=json.loads((R/'protocol/02_LOCKED_PROMPTS.json').read_text())['tasks'];ids={w['work_id'] for w in c['works']}
result={'source_sha':subprocess.check_output(['git','-C',str(base),'rev-parse','HEAD'],text=True).strip(),'tree_sha':subprocess.check_output(['git','-C',str(base),'rev-parse','HEAD^{tree}'],text=True).strip(),'canonical_census':{'works':32,'manifestations':53,'documentary_methods':21,'human_identity_gates':8,'active_batch_b':0},'all_53_derivative_bindings_verified':rows,'roster_sha256':roster,'protected_file_count':len(inventory),'protected_files_changed':changed,'frozen_task_coordinate_contradictions':[{'task':t['id'],'source_id':t['source_id'],'status':'ID_NOT_IN_CANONICAL_ROSTER_DO_NOT_REPAIR_FROZEN_PROTOCOL','prompt_still_executable_census_question':t['id']=='EV-01'} for t in tasks if t['source_id'].startswith('emwork_') and '|' not in t['source_id'] and t['source_id'] not in ids],'independent_origin_claimed':False}
(R/'evidence/baseline-custody.json').write_text(json.dumps(result,indent=2));print('Verified32/53/21/8 and',len(inventory),'unchanged protected files; task-coordinate contradiction retained')
