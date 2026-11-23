#!/usr/bin/env python3
"""Read-only origin crosswalk. No importer, provider request or receiver admission."""
import argparse,json,sqlite3,subprocess,sys
from contextlib import closing
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from packages.experiment_a_preparation_v1.common import read_json,digest,commitment,local_file
from packages.experiment_a_preparation_v1.wendbine import qualify
ROOT=Path(__file__).resolve().parents[1];BASE='packages/dome_world_exact/fixtures/a15-r0/WENDBINE/'
PINS={'A':'520e3db76af8f1c76618bd678456c543ec37b3e5','B':'4dcb3ac45d5a14f1db2c2f9e0733ed2d1a7121c1'}
def outside(path):
 p=Path(path)
 if not p.is_absolute() or ROOT==p or ROOT in p.parents or any(x.is_symlink() for x in (p,*p.parents)):raise ValueError('PRIVATE_OUTSIDE_REPOSITORY_PATH')
 return p
def pinned(root,label,relative):
 root=Path(root);rev=PINS[label]
 if subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip()!=rev:raise ValueError('EXACT_NATIVE_CHECKOUT')
 p=local_file(root/(BASE+relative));b=p.read_bytes()
 if b!=subprocess.check_output(['git','-C',str(root),'show',rev+':'+BASE+relative]):raise ValueError('NATIVE_METADATA_DRIFT')
 return [read_json(x) for x in b.splitlines() if x.strip()]
def frozen_db(path,pin):
 p=local_file(outside(path))
 if digest(p.read_bytes())!=pin:raise ValueError('INDEPENDENT_DB_PIN')
 if any(Path(str(p)+s).exists() for s in ('-wal','-journal')):raise ValueError('QUIESCENT_COPY_REQUIRED')
 c=sqlite3.connect(p.as_uri()+'?mode=ro',uri=True);c.execute('PRAGMA query_only=ON');c.execute('PRAGMA trusted_schema=OFF')
 if c.execute('PRAGMA integrity_check').fetchone()[0]!='ok':c.close();raise ValueError('SQLITE_INTEGRITY')
 c.execute('BEGIN');return c
def run(contract,a,b,output):
 if contract.get('schema')!='td613.wendbine.local-origin-crosswalk-contract/v1' or contract.get('action')!='READ_ONLY_ORIGIN_CROSSWALK' or contract.get('receiver_admission_authorized') is not False:raise ValueError('ORIGIN_ONLY_CONTRACT')
 if contract.get('status')!='INDEPENDENTLY_APPROVED_FOR_LOCAL_READBACK' or not contract.get('independent_custodian_receipt'):raise ValueError('INDEPENDENT_LOCAL_CUSTODY_REQUIRED')
 if contract.get('source_class') not in ('SYNTHETIC','OPERATOR_LOCAL_CAPTURE'):raise ValueError('EXPLICIT_EXECUTION_CLASS')
 db=outside(contract['database_path']);before=digest(local_file(db).read_bytes());rows=[]
 with closing(frozen_db(db,contract['database_sha256'])) as c:
  count=c.execute('SELECT COUNT(*) FROM capture_versions').fetchone()[0];total_sources=c.execute('SELECT COUNT(*) FROM sources').fetchone()[0]
  for cid,sid,at,pub,title,body,th,bh,url in c.execute('SELECT c.capture_id,c.source_id,c.captured_at_utc,c.published_at_utc,c.title,c.selftext,c.title_sha256,c.body_sha256,s.canonical_url FROM capture_versions c JOIN sources s USING(source_id) ORDER BY c.capture_id'):
   rows.append({'capture_id':cid,'source_id':sid,'captured_at_utc':at,'published_at_utc':pub,'time_precision':'SECOND','title':title,'selftext':body,'title_sha256':th,'body_sha256':bh,'canonical_url':url})
  if count!=len(rows):raise ValueError('ORPHAN_CAPTURES_NOT_SILENTLY_DROPPED')
 chunks=None;u=contract.get('universal_database_path')
 if u:
  chunks=[]
  with closing(frozen_db(u,contract['universal_database_sha256'])) as c:
   for sid,cid,f,sh,ch,at,text in c.execute("SELECT source_id,capture_id,source_field,source_sha256,chunk_sha256,byte_offset,text FROM records WHERE estate='WENDBINE' ORDER BY doc_id"):
    chunks.append({'source_id':sid,'capture_id':cid,'source_field':f,'source_sha256':sh,'chunk_sha256':ch,'byte_offset':at,'text':text})
  if digest(local_file(u).read_bytes())!=contract['universal_database_sha256']:raise ValueError('UNIVERSAL_DB_CHANGED')
 r=qualify(pinned(a,'A','01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl'),pinned(b,'B','01-MANIFESTS/phase2/manifestations.jsonl'),pinned(b,'B','01-MANIFESTS/phase2/capture-v2.jsonl'),rows,universal_chunks=chunks)
 if before!=digest(db.read_bytes()):raise ValueError('ORIGIN_DB_CHANGED')
 r.update(execution_class='SYNTHETIC_CALIBRATION' if contract['source_class']=='SYNTHETIC' else 'GENUINE_LOCAL_ORIGIN_READBACK',database_sha256=before,contract_sha256=commitment(contract),C_source_table_count=total_sources)
 if total_sources!=r['populations']['C_sources']:r['crosswalk_disposition']='HELD_SOURCE_ROWS_WITHOUT_CAPTURE'
 with outside(output).open('x',encoding='utf8') as f:json.dump(r,f,ensure_ascii=False,indent=2);f.write('\n')
 return {k:r[k] for k in ('execution_class','populations','crosswalk_disposition','universal_readback','scientific_state_migration','receiver_admission')}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--availability-only',action='store_true');p.add_argument('--contract',type=Path);p.add_argument('--a-checkout',type=Path);p.add_argument('--b-checkout',type=Path);p.add_argument('--output',type=Path);x=p.parse_args()
 if x.availability_only:print(json.dumps({'status':'HELD','reason':'NO_INDEPENDENTLY_PINNED_GENUINE_DB_DESIGNATED_IN_WORK','genuine_readback_executed':False,'receiver_admission':False}));sys.exit(0)
 if any(v is None for v in (x.contract,x.a_checkout,x.b_checkout,x.output)):p.error('local contract, original A/B checkouts and private output required')
 print(json.dumps(run(read_json(local_file(x.contract).read_bytes()),x.a_checkout,x.b_checkout,x.output),indent=2))
