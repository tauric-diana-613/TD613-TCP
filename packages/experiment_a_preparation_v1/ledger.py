"""Synthetic attempt journal with independent checkpoints; no WORM claim."""
from pathlib import Path
import os
from .common import canonical,read_json,commitment,digest
KEYS={'schema','episode_id','attempt_id','event','origin_receipt_id','recipient_receipt_id','input_sha256','output_sha256','comparison_sha256','runtime_receipt_sha256','reason_code','source_class'}
TERMINAL={'FAILED','INTERRUPTED','INCONCLUSIVE','CONTAMINATION','STOPPED','CLOSED'}
NEXT={'PREPARED':{'STARTED','STOPPED'},'STARTED':{'RETURNED'}|TERMINAL,'RETURNED':{'COMPARED','CONTAMINATION','INCONCLUSIVE','STOPPED'},'COMPARED':{'CLOSED','CONTAMINATION','INCONCLUSIVE','STOPPED'}}
def read(path):
 p=Path(path)
 if any(x.is_symlink() for x in (p,*p.parents)):raise ValueError('LEDGER_LINK')
 raw=p.read_bytes();rows=[];prev=None
 for n,line in enumerate(raw.splitlines(),1):
  row=read_json(line);h=row.pop('digest',None)
  if row.get('sequence')!=n or row.get('previous')!=prev or commitment(row)!=h:raise ValueError('LEDGER_CHAIN_CHANGED')
  row['digest']=h;rows.append(row);prev=h
 return rows,{'bytes':len(raw),'sha256':digest(raw),'last_digest':prev,'events':len(rows)}
def create(path):
 p=Path(path)
 if not p.is_absolute() or any(x.is_symlink() for x in (p,*p.parents)):raise ValueError('LEDGER_PATH')
 with p.open('xb') as f:f.flush();os.fsync(f.fileno())
 return read(p)[1]
def append(path,event,expected):
 p=Path(path)
 if set(event)-KEYS or event.get('schema')!='td613.experiment-attempt-event/v1':raise ValueError('CLOSED_EVENT_SCHEMA')
 if event.get('source_class')!='SYNTHETIC':raise ValueError('SYNTHETIC_ONLY')
 if any(not isinstance(event.get(k),str) or not event[k] for k in ('episode_id','attempt_id','origin_receipt_id','input_sha256')):raise ValueError('ATTEMPT_BINDING')
 if event.get('recipient_receipt_id')==event['origin_receipt_id']:raise ValueError('RECEIPT_IDENTITY_COLLAPSE')
 lock=p.with_name(p.name+'.lock');fd=os.open(lock,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 try:
  os.close(fd);rows,pin=read(p)
  if pin!=expected:raise ValueError('INDEPENDENT_CHECKPOINT_MISMATCH')
  same=[r['event'] for r in rows if r['event']['attempt_id']==event['attempt_id']]
  if event['event']=='PREPARED':
   if rows:raise ValueError('RETRY_OR_ATTEMPT_LIMIT')
  else:
   if not same:raise ValueError('ATTEMPT_NOT_PREPARED')
   last=same[-1]
   if last['event'] in TERMINAL or event['event'] not in NEXT.get(last['event'],set()):raise ValueError('TERMINAL_OR_EVENT_ORDER')
   if any(last[k]!=event[k] for k in ('episode_id','origin_receipt_id','input_sha256')):raise ValueError('ATTEMPT_BINDING_CHANGED')
  if event['event'] in {'RETURNED','COMPARED','CLOSED'} and not event.get('recipient_receipt_id'):raise ValueError('RETURN_ID_REQUIRED')
  if same and same[-1].get('recipient_receipt_id') and event.get('recipient_receipt_id')!=same[-1]['recipient_receipt_id']:raise ValueError('RETURN_ID_CHANGED')
  row={'sequence':len(rows)+1,'previous':pin['last_digest'],'event':event};row['digest']=commitment(row)
  with p.open('ab') as f:f.write(canonical(row)+b'\n');f.flush();os.fsync(f.fileno())
  return read(p)[1]
 finally:lock.unlink()
