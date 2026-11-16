/**
 * TD613 · Compose custody ledger / RGI20.
 *
 * Node host-only. Never write within the repository or ephemeral Vercel /tmp.
 * Requires externally provisioned PERSISTENT storage, a durable filesystem
 * and independently exported head digests (the latter are not created here).
 * Hash chaining proves internal consistency, NOT external-origin provenance.
 */
import {mkdir,readFile,readdir,open,rename,unlink,rmdir,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash,randomBytes} from 'node:crypto';

export const COMPOSE_LEDGER_SCHEMA='td613.vixen.compose.custody-ledger/v1';
const SHA=/^[a-f0-9]{64}$/,REV=/^[a-f0-9]{40}$/;
const TYPES=new Set(['SOURCE_STAGED','SCORE_STAGED','COMPOSE_REQUESTED','HUMAN_ASSERTION_CONSUMED',
  'HUMAN_APPROVAL_VERIFIED','COMPOSE_PREVIEW_EMITTED','SCORE_INVALIDATED',
  'BASELINE_SNAPSHOT_REGISTERED','TRANSACTION_PROPOSED','TRANSACTION_HELD','ROLLBACK_PROPOSED']);
const stable=x=>Array.isArray(x)?x.map(stable):
 x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const hash=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(stable(x))).digest('hex');
const error=why=>{throw Object.assign(new Error(why),{code:why})};
const n=i=>String(i).padStart(10,'0')+'.json';
function recordValid(event){
 if(!event||typeof event!=='object'||Array.isArray(event)||!TYPES.has(event.type)||
 typeof event.source_revision!=='string'||!REV.test(event.source_revision)||
 typeof event.score_digest!=='string'||!SHA.test(event.score_digest)||
 typeof event.timestamp!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(event.timestamp)||
 !event.details||typeof event.details!=='object'||Array.isArray(event.details))
 error('HELD_INCOMPLETE_CUSTODY_EVENT');
 if(event.type==='BASELINE_SNAPSHOT_REGISTERED'){
  const b=event.details;
  if(!SHA.test(b.manifest_sha256||'')||!SHA.test(b.index_sha256||'')||
   !REV.test(b.source_revision||'')||!b.restore_ref)
   error('HELD_INCOMPLETE_RESTORABLE_BASELINE');
 }
}
// Lock acquisition intentionally never steals stale locks; operator recovery
// must verify custody before removing a crashed writer's lock.
export function createComposeCustodyLedger({directory=null,now=()=>new Date().toISOString()}={}){
 if(!directory||typeof directory!=='string'||!resolve(directory).startsWith('/'))
  error('HELD_EXTERNALLY_MOUNTED_PERSISTENT_CUSTODY_DIR_REQUIRED');
 const dir=resolve(directory),entries=join(dir,'entries'),lock=join(dir,'.writer.lock');
 async function readHead(){
  let names;
  try{names=(await readdir(entries)).filter(x=>x.endsWith('.json')).sort()}
  catch(e){if(e.code==='ENOENT')return {head:'0'.repeat(64),events:[]};throw e}
  let previous='0'.repeat(64),seq=0;
  const events=[];
  for(const name of names){
   seq++;
   if(name!==n(seq))error('HELD_CUSTODY_PREFIX_GAP');
   let obj;try{obj=JSON.parse(await readFile(join(entries,name),'utf8'))}
   catch{error('HELD_CUSTODY_RECORD_CORRUPT')}
   if(obj.schema!==COMPOSE_LEDGER_SCHEMA||obj.sequence!==seq||
    obj.previous_sha256!==previous||obj.sha256!==hash({
      schema:COMPOSE_LEDGER_SCHEMA,sequence:seq,previous_sha256:previous,event:obj.event
    }))error('HELD_CUSTODY_CHAIN_TAMPER_OR_DISCONTINUITY');
   recordValid(obj.event);events.push(obj);previous=obj.sha256;
  }
  return {head:previous,events};
 }
 async function inspect(){
  const {head,events}=await readHead();
  return {schema:COMPOSE_LEDGER_SCHEMA,status:'VERIFIED_INTERNAL_CHAIN_ONLY',
   head_sha256:head,entries:events.length,external_anchor_verified:false,
   release_authority:false};
 }
 async function appendIf(event,predicate=()=>true){
  recordValid(event);
  await mkdir(entries,{recursive:true});
  try{await mkdir(lock)}catch(e){if(e.code==='EEXIST')error('HELD_CONCURRENT_CUSTODY_WRITER_LOCK');throw e}
  try{
   const current=await readHead();
   if(await predicate(current.events)!==true)return {status:'HELD_PREDICATE_OR_REPLAY'};
   const seq=current.events.length+1;
   const rec={schema:COMPOSE_LEDGER_SCHEMA,sequence:seq,
     previous_sha256:current.head,event};
   rec.sha256=hash(rec);
   const temp=join(entries,'.uncommitted-'+randomBytes(12).toString('hex'));
   const fd=await open(temp,'wx',0o600);
   try{await fd.writeFile(JSON.stringify(rec)+'\n');await fd.sync()}finally{await fd.close()}
   await rename(temp,join(entries,n(seq)));
   // Where supported, flush directory entry, not merely the file.
   const folder=await open(entries,'r');
   try{await folder.sync()}finally{await folder.close()}
   return {status:'RECORDED_INTERNAL',record:rec,
     digest:rec.sha256,external_anchor_required:true,release_authority:false};
  }finally{await rmdir(lock)}
 }
 async function append(type,source_revision,score_digest,details){
  return appendIf({type,source_revision,score_digest,details,timestamp:now()});
 }
 async function consumeHumanAssertion(info){
  if(!info||typeof info.credential_id!=='string'||!Number.isSafeInteger(info.sign_count)||
  info.sign_count<=0||!/^[a-f0-9]{48}$/.test(info.nonce||'')||
  !SHA.test(info.score_digest||'')||!REV.test(info.source_revision||''))
   return false;
  const out=await appendIf({
   type:'HUMAN_ASSERTION_CONSUMED',source_revision:info.source_revision,
   score_digest:info.score_digest,timestamp:now(),
   details:{credential_id:info.credential_id,human_principal:info.human_principal,
    nonce:info.nonce,sign_count:info.sign_count,receipt_id:info.receipt_id}
  },events=>{
   const seen=events.map(x=>x.event).filter(x=>x.type==='HUMAN_ASSERTION_CONSUMED'&&
    x.details.credential_id===info.credential_id);
   return !seen.some(x=>x.details.nonce===info.nonce)&&
    info.sign_count>Math.max(0,...seen.map(x=>x.details.sign_count));
  });
  return out.status==='RECORDED_INTERNAL';
 }
 async function registerBaseline({source_revision,score_digest,manifest_sha256,index_sha256,restore_ref,
  source_count,index_units,notes=''}){
  return append('BASELINE_SNAPSHOT_REGISTERED',source_revision,score_digest,{
   source_revision,manifest_sha256,index_sha256,restore_ref,source_count,index_units,notes,
   actual_archive_bytes_attested:false,empirical_external_origin_verified:false
  });
 }
 async function proposeTransaction({source_revision,score_digest,before,after,consequences=[]}){
  if(!REV.test(source_revision||'')||!SHA.test(score_digest||'')||
   !before||!SHA.test(before.manifest_sha256||'')||!SHA.test(before.index_sha256||'')||
   !before.restore_ref||!after||!SHA.test(after.manifest_sha256||'')||
   !SHA.test(after.index_sha256||'')||!Array.isArray(consequences)||!consequences.length)
   error('HELD_TRANSACTION_RESTORATION_OR_BOTH_STATES_REQUIRED');
  return append('TRANSACTION_PROPOSED',source_revision,score_digest,{
   before,after,consequences,executable:false,
   atomic_corpus_writer_connected:false,requested_human_closure:'RESERVED'
  });
 }
 async function rollbackPlan({source_revision,score_digest,baseline_digest,reason}){
  const {events}=await readHead();
  const b=events.find(x=>x.event.type==='BASELINE_SNAPSHOT_REGISTERED'&&
   x.sha256===baseline_digest);
  if(!b)error('HELD_UNKNOWN_VERIFIED_BASELINE_RECEIPT');
  return append('ROLLBACK_PROPOSED',source_revision,score_digest,{
   reason,restore_from:b.event.details,baseline_receipt_sha256:baseline_digest,
   executable:false,actual_restore_requires_human_authorized_writer:true
  });
 }
 return Object.freeze({inspect,readHead,append,appendIf,consumeHumanAssertion,
  registerBaseline,proposeTransaction,rollbackPlan});
}
