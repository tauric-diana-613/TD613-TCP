import pathlib,json,hashlib,datetime,subprocess,shutil
R=pathlib.Path(__file__).resolve().parents[1];E=R/'evidence';H=lambda b:hashlib.sha256(b).hexdigest()
gold=json.loads((E/'independent-gold-candidates.json').read_text());reg=json.loads((E/'intake-register.json').read_text());byid={r['source_id']:r for r in reg['records']}
for c in gold['candidates']:
 source=byid[c['source_id']];assert H((R/source['original_path']).read_bytes())==c['pdf_sha256']
 page=next(p for p in json.loads((R/'derived'/c['source_id']/'pages.json').read_text()) if p['page']==c['page'])
 assert H(page['text'].encode())==c['page_text_sha256'];assert page['text'][c['page_relative_character_start']:c['page_relative_character_end_exclusive']]==c['quote'];assert H(c['quote'].encode())==c['quote_sha256_utf8']
(E/'gold-parent-verification.json').write_text(json.dumps({'candidate_count':len(gold['candidates']),'sources':len({x['source_id'] for x in gold['candidates']}),'all_pdf_digests_rehashed':True,'all_page_hashes_offsets_quotes_verified':True,'human_acceptance':False,'independent_empirical_replication_credit':0},indent=2))
# Capture instrumentation version honestly after development; do not backdate a freeze.
files={f.name:{'bytes':f.stat().st_size,'sha256':H(f.read_bytes())} for f in (R/'scripts').glob('*') if f.is_file()}
(E/'instrumentation-current-manifest.json').write_text(json.dumps({'captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'classification':'DEVELOPMENT_AND_EXECUTION_BYTE_CUSTODY_NOT_RETROACTIVE_PREREGISTRATION','files':files,'original_protocol_modified':False,'native_runtime_source_modified':False,'primary_C0_failure_preserved':True,'exploratory_flag_change':'--jitless'},indent=2))
rows=json.loads((E/'trial-matrix-after-execution.json').read_text())
for arm in rows['arms'].values():
 for t in arm['tasks']:
  candidates=[c['candidate_id'] for c in gold['candidates'] if c['task_id']==t['id']]
  t['gold_candidate_ids']=candidates
  t['gold_status']='PROVISIONAL_INDEPENDENT_SOURCE_ANNOTATIONS_HUMAN_ADJUDICATION_RESERVED' if candidates else 'HELD_GOLD_NOT_ESTABLISHED'
(E/'trial-matrix-with-gold-candidates.json').write_text(json.dumps(rows,indent=2))
# Append new checkpoint facts without revising earlier event records.
j=E/'chronology.jsonl'
for kind,f in [('INDEPENDENT_SOURCE_GOLD_CANDIDATES_SAVED','independent-gold-candidates.json'),('GOLD_QUOTE_AND_RAW_SOURCE_DIGEST_VALIDATION','gold-parent-verification.json')]:
 old=j.read_text().splitlines();d={'seq':len(old)+1,'recorded_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'kind':kind,'predecessor_sha256':json.loads(old[-1])['event_sha256'],'data':{'receipt':f,'sha256':H((E/f).read_bytes()),'no_tested_primary_model_output_exists':True}};d['event_sha256']=H(json.dumps(d,sort_keys=True,separators=(',',':')).encode());j.open('a').write(json.dumps(d)+'\n')
prev=None
for line in j.read_text().splitlines():
 d=json.loads(line);h=d.pop('event_sha256');assert d['predecessor_sha256']==prev and H(json.dumps(d,sort_keys=True,separators=(',',':')).encode())==h;prev=h
(E/'chronology-verification-final.json').write_text(json.dumps({'events':len(j.read_text().splitlines()),'head_sha256':prev,'chain_valid':True,'independent_timestamp_proof':False},indent=2))
print('18 gold annotations verified against original PDF hashes and exact page substrings; custody chain intact')
