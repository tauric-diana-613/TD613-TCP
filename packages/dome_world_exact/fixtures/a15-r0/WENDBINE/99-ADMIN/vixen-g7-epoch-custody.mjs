/**
 * G7 · Wendbine public projection epoch custody and local gesture identity.
 * Research-only source implementation. No provider IO, private original bytes,
 * owner impersonation, release, native source promotion or external attestation.
 *
 * IMPORTANT: A new immutable epoch can preserve the current writer state
 * prospectively. It cannot reconstruct Temporal's historical first epoch
 * after its bytes were already replaced.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const EPOCH_SCHEMA='td613.vixen.g7.public-epoch-snapshot/v1';
export const GESTURE_SCHEMA='td613.vixen.g7.issue-gesture-lease/v1';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const json=x=>JSON.stringify(x,null,2)+'\n';
const ISO=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const SNAP=/^wendbine-\d{14}-[a-f0-9]{12}$/;
const hex40=/^[a-f0-9]{40}$/;
const limited=(s,max=200)=>typeof s==='string'&&s.length>0&&s.length<=max;
const iso=s=>limited(s,35)&&ISO.test(s)&&Number.isFinite(Date.parse(s))&&
 new Date(s).toISOString().slice(0,19)===s.slice(0,19);

export function assertG7Chronology({observedAt,predecessorSeal=null}={}){
 if(!iso(observedAt))throw Error('HELD_WRITER_OBSERVED_AT_NOT_CANONICAL_UTC');
 if(!predecessorSeal)return Object.freeze({
  predecessor:null,observedAt,policy:'NO_PREDECESSOR_LOCAL_FIRST_EPOCH',
  human_wall_clock_policy:'UNADJUDICATED'
 });
 if(predecessorSeal.schema!=='wendbine-src-seal/v1'||
  !SNAP.test(predecessorSeal.atelier_snapshot_id)||!iso(predecessorSeal.created_at))
  throw Error('HELD_PREDECESSOR_SEAL_MALFORMED');
 const current=Date.parse(observedAt),prev=Date.parse(predecessorSeal.created_at);
 if(current<prev)throw Error('HELD_WRITER_BACKWARD_TIME_PREDECESSOR');
 if(current===prev)throw Error('HELD_EQUAL_TIMESTAMP_HUMAN_POLICY_REQUIRED');
 return Object.freeze({
  predecessor:predecessorSeal.atelier_snapshot_id,
  observedAt,policy:'STRICTLY_LATER_THAN_PREDECESSOR_FOR_NEW_WRITES_ONLY',
  human_wall_clock_policy:'UNADJUDICATED'
 });
}
export function normalizeG7Gesture({
 source_revision,issue_number,comment_id,author,command,
 workflow_run_id,workflow_run_attempt,predecessor_snapshot_id
}={}){
 if(!hex40.test(source_revision||'')||!Number.isSafeInteger(issue_number)||issue_number<1||
  !Number.isSafeInteger(comment_id)||comment_id<1||
  !limited(author,100)||!limited(command,150)||
  !Number.isSafeInteger(workflow_run_id)||workflow_run_id<1||
  !Number.isSafeInteger(workflow_run_attempt)||workflow_run_attempt<1||
  !limited(predecessor_snapshot_id||'',150))
  throw Error('HELD_INCOMPLETE_GESTURE_LINEAGE');
 if(!['/wendbine-sync ATELIER','/src-zenodo-sync ATELIER'].includes(command))
  throw Error('HELD_UNAUTHORIZED_GESTURE_COMMAND');
 if(command==='/wendbine-sync ATELIER'&&issue_number!==1308||
    command==='/src-zenodo-sync ATELIER'&&issue_number!==758)
  throw Error('HELD_GESTURE_ISSUE_COMMAND_MISMATCH');
 const value={schema:GESTURE_SCHEMA,source_revision,issue_number,comment_id,author,command,
  workflow_run_id,workflow_run_attempt,predecessor_snapshot_id,
  event_key:sha(Buffer.from([String(issue_number),String(comment_id),author,command].join('\x1f')))};
 return Object.freeze({...value,capability:'ONE_BOUNDED_OPERATOR_GESTURE',
  source_role:'CALLER_DECLARED_NOT_GITHUB_ATTESTED',
  human_closure_required:true,provider_authorized:false});
}
/** The local exclusive write tests the *event* identity, not run attempt.
 *  A rerun of the same issue comment cannot mint a fresh authority token.
 *  This helper is not called by the live issue workflow until independently
 *  reviewed/admitted; the workflow's live replay exposure remains HELD.
 */
export function claimG7GestureLocal(root,lease){
 if(lease?.schema!==GESTURE_SCHEMA||!lease.event_key||
    lease.provider_authorized!==false)
  throw Error('HELD_GESTURE_LEASE_INVALID');
 const dir=path.join(root,'07-ARCHIVE-LEDGER','gestures');
 fs.mkdirSync(dir,{recursive:true});
 const target=path.join(dir,lease.event_key+'.json');
 try{fs.writeFileSync(target,json(lease),{flag:'wx',mode:0o644})}
 catch(e){if(e.code==='EEXIST')throw Error('HELD_GESTURE_ALREADY_CONSUMED');throw e}
 return Object.freeze({state:'LOCAL_EVENT_CLAIM_RETAINED',path:target,
  event_key:lease.event_key,external_authority:false});
}
function safePublicEntry(e){
 const p=e?.path;
 if(!limited(p,300)||path.isAbsolute(p)||p.includes('\\')||
  p.split('/').some(part=>part==='.'||part==='..'||part==='')||
  p.startsWith('07-ARCHIVE-LEDGER/epochs/'))
  throw Error('HELD_EPOCH_ENTRY_PATH_INVALID');
 const data=e?.data;
 if(!Buffer.isBuffer(data)&&typeof data!=='string')
  throw Error('HELD_EPOCH_ENTRY_BYTES_REQUIRED');
 const bytes=Buffer.isBuffer(data)?data:Buffer.from(data,'utf8');
 if(bytes.length>16_000_000)throw Error('HELD_EPOCH_FILE_BUDGET');
 return {path:p,bytes};
}
export function verifyG7EpochDirectory(dir,{expectedSnapshot=null}={}){
 const file=path.join(dir,'EPOCH_MANIFEST.json');
 const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
 if(manifest.schema!==EPOCH_SCHEMA||
  !SNAP.test(manifest.snapshot_id)||expectedSnapshot&&manifest.snapshot_id!==expectedSnapshot||
  !Array.isArray(manifest.files)||manifest.files.length===0||
  !iso(manifest.observed_at))
  throw Error('HELD_EPOCH_MANIFEST_INVALID');
 const ids=new Set();
 for(const item of manifest.files){
  const clean=safePublicEntry({path:item.path,data:''});
  if(ids.has(clean.path)||!Number.isSafeInteger(item.bytes)||item.bytes<0||
    !/^[a-f0-9]{64}$/.test(item.sha256))
    throw Error('HELD_EPOCH_MEMBER_MANIFEST_INVALID');
  ids.add(clean.path);
  const local=path.resolve(dir,clean.path);
  if(!local.startsWith(path.resolve(dir)+path.sep)||
    !fs.existsSync(local)||fs.lstatSync(local).isSymbolicLink()||
    !fs.lstatSync(local).isFile())
    throw Error('HELD_EPOCH_MEMBER_MISSING_OR_LINK');
  const body=fs.readFileSync(local);
  if(body.length!==item.bytes||sha(body)!==item.sha256)
    throw Error('HELD_EPOCH_MEMBER_DIGEST_MISMATCH');
 }
 const seal=path.join(dir,'04-RECEIPTS/phase2/current-seal.json');
 if(!ids.has('04-RECEIPTS/phase2/current-seal.json')||!fs.existsSync(seal))
  throw Error('HELD_EPOCH_SEAL_MISSING');
 const parsed=JSON.parse(fs.readFileSync(seal,'utf8'));
 if(parsed.atelier_snapshot_id!==manifest.snapshot_id)
  throw Error('HELD_EPOCH_SEAL_SNAPSHOT_MISMATCH');
 return Object.freeze({state:'LOCAL_IMMUTABLE_EPOCH_BYTES_MATCH',
  snapshot_id:manifest.snapshot_id,files_verified:ids.size,
  predecessor_snapshot_id:manifest.predecessor_snapshot_id,
  external_origin_proven:false,human_closure_required:true});
}
export function retainG7PublicEpoch({
 outRoot,snapshot,observedAt,predecessorSnapshot=null,predecessorSealSha256=null,
 files=[],sourceRevision=null,runIdentity=null,
 provenanceClass='NEW_G7_LOCAL_PUBLIC_PROJECTION_NOT_RECOVERED_ORIGINAL'
}={}){
 if(!SNAP.test(snapshot||'')||!iso(observedAt)||!Array.isArray(files)||files.length<1||
    files.length>64)throw Error('HELD_EPOCH_STAGE_INPUT_INVALID');
 if(!['NEW_G7_LOCAL_PUBLIC_PROJECTION_NOT_RECOVERED_ORIGINAL',
   'BOUNDARY_COPY_OF_PREEXISTING_MUTABLE_STATE_NOT_ORIGINAL_FIRST_EPOCH'].includes(provenanceClass))
  throw Error('HELD_EPOCH_PROVENANCE_CLASS_UNKNOWN');
 if(sourceRevision!==null&&!hex40.test(sourceRevision))
  throw Error('HELD_EPOCH_SOURCE_REVISION_MALFORMED');
 if(runIdentity!==null&&runIdentity?.schema!==GESTURE_SCHEMA)
  throw Error('HELD_EPOCH_RUN_IDENTITY_INVALID');
 const normalized=files.map(safePublicEntry);
 if(new Set(normalized.map(e=>e.path)).size!==normalized.length)
  throw Error('HELD_EPOCH_DUPLICATE_MEMBER');
 const parent=path.resolve(outRoot,'07-ARCHIVE-LEDGER/epochs');
 fs.mkdirSync(parent,{recursive:true});
 const final=path.join(parent,snapshot);
 if(fs.existsSync(final))throw Error('HELD_EPOCH_ALREADY_RETAINED');
 const manifest={schema:EPOCH_SCHEMA,snapshot_id:snapshot,observed_at:observedAt,
  predecessor_snapshot_id:predecessorSnapshot,
  predecessor_seal_sha256:predecessorSealSha256,
  source_revision:sourceRevision,run_identity:runIdentity,
  provenance_class:provenanceClass,
  human_closure_required:true,external_origin_authenticated:false,private_bodies_included:false,
  files:normalized.map(e=>({path:e.path,bytes:e.bytes.length,sha256:sha(e.bytes)}))};
 const stage=fs.mkdtempSync(path.join(parent,'.candidate-'));
 try{
  for(const e of normalized){
   const dst=path.resolve(stage,e.path);
   if(!dst.startsWith(stage+path.sep))throw Error('HELD_EPOCH_OUTSIDE_ROOT');
   fs.mkdirSync(path.dirname(dst),{recursive:true});
   fs.writeFileSync(dst,e.bytes,{flag:'wx',mode:0o644});
  }
  fs.writeFileSync(path.join(stage,'EPOCH_MANIFEST.json'),json(manifest),{flag:'wx',mode:0o644});
  verifyG7EpochDirectory(stage,{expectedSnapshot:snapshot});
  if(fs.existsSync(final))throw Error('HELD_EPOCH_ALREADY_RETAINED');
  fs.renameSync(stage,final);
  const receipt=verifyG7EpochDirectory(final,{expectedSnapshot:snapshot});
  return Object.freeze({...receipt,path:final});
 }catch(e){fs.rmSync(stage,{recursive:true,force:true});throw e}
}
