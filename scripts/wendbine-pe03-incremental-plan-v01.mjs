/**
 * PE03: source-free Wendbine discovery checkpoint plan and reconciliation.
 * Pure / no network. Does not issue #1308 operator gesture or write archive.
 * Public observations are archived snapshots, not verified first-publication.
 */
import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const fail=s=>{throw Error(s)};
const need=(x,s)=>{if(!x)fail(s)};
const unix=s=>{const t=Date.parse(s);need(Number.isFinite(t)&&new Date(t).toISOString()===s,'PE03_EXACT_UTC_TIMESTAMP');return t};
const ident=s=>typeof s==='string'&&/^reddit:t3_[a-z0-9]{5,12}$/.test(s);
function previousCheck(p){
 need(p&&p.schema==='wendbine-checkpoint/synthetic-v1'&&p.source_epoch==='SYNTHETIC_ONLY'&&
   typeof p.snapshot_id==='string'&&p.snapshot_id.startsWith('SYNTHETIC_')&&
   p.completed===true&&p.sealed===true&&p.errors===0&&
   Number.isInteger(p.observed_count)&&p.observed_count>=0,'PE03_COMPLETE_SEALED_PREDECESSOR_REQUIRED');
 unix(p.high_water_utc);
}
export function planChronologicalDelta({checkpoint,overlapSeconds=86400,rangeStart='2026-09-09T00:00:00.000Z',
  now='2026-11-03T00:00:00.000Z'}={}){
 previousCheck(checkpoint);
 need(Number.isSafeInteger(overlapSeconds)&&overlapSeconds>=1&&overlapSeconds<=30*86400,'PE03_FINITE_OVERLAP_REQUIRED');
 const last=unix(checkpoint.high_water_utc),floor=unix(rangeStart),current=unix(now);
 need(floor<=last&&last<=current,'PE03_CHECKPOINT_TIME_ORDER');
 const from=new Date(Math.max(floor,last-overlapSeconds*1000)).toISOString();
 return Object.freeze({schema:'wendbine-pe03-readonly-delta-plan/v1',source_epoch:checkpoint.source_epoch,
   predecessor_snapshot_id:checkpoint.snapshot_id,predecessor_high_water_utc:checkpoint.high_water_utc,
   query_from_utc:from,query_until_utc:new Date(current).toISOString(),
   overlap_seconds:overlapSeconds,full_history_covered:false,
   historical_pre_september_backfill:'SEPARATE_HUMAN_SCOPED_GESTURE_REQUIRED',
   comments_and_media:'NOT_ACQUIRED_BY_POST_DELTA',network_gesture:'NOT_AUTHORIZED_IN_PURE_PLANNER',
   coverage_ceiling:'ARCHIVE_PROVIDER_OBSERVATION_NOT_LIVE_REDDIT_CENSUS'});
}
/** A hostile counterexample to timestamp-only syncing: edits inside an overlap and
 * late-arriving old records must not be called a clean zero. */
export function reconcileChronologicalObservations({plan,previous,observed,pageReceipts=[],complete=false,httpStatus=200}={}){
 need(plan?.schema==='wendbine-pe03-readonly-delta-plan/v1'&&plan.source_epoch==='SYNTHETIC_ONLY' &&
   Array.isArray(previous)&&Array.isArray(observed)&&Array.isArray(pageReceipts),'PE03_INPUTS_REQUIRED');
 need(httpStatus===200,'PE03_ARCHIVE_HTTP_HELD_'+httpStatus);
 need(complete===true && pageReceipts.length>0 && pageReceipts.every(p=>p.complete===true&&
   Number.isSafeInteger(p.count)&&p.count>=0&&typeof p.raw_sha256==='string'&&/^[a-f0-9]{64}$/.test(p.raw_sha256)),
   'PE03_INCOMPLETE_PAGE_EVIDENCE');
 const old=new Map(),newIds=new Set(),changes=[],same=[],added=[],notSeen=[],errors=[];
 for(const row of previous){need(ident(row.source_id)&&typeof row.body_sha256==='string'&&/^[a-f0-9]{64}$/.test(row.body_sha256)&&!old.has(row.source_id),
    'PE03_PREDECESSOR_IDENTITY');old.set(row.source_id,row)}
 for(const row of observed){
  need(ident(row.source_id)&&typeof row.body_sha256==='string'&&/^[a-f0-9]{64}$/.test(row.body_sha256)&&
    typeof row.created_at==='string','PE03_OBSERVED_SCHEMA');
  unix(row.created_at);
  need(!newIds.has(row.source_id),'PE03_CONFLICTING_OR_DUPLICATE_SAME_PASS');
  newIds.add(row.source_id);
  const prior=old.get(row.source_id);
  if(!prior)added.push(row.source_id);
  else if(prior.body_sha256!==row.body_sha256)changes.push(row.source_id);
  else same.push(row.source_id);
 }
 const seenPages=pageReceipts.reduce((s,p)=>s+p.count,0);
 need(seenPages===observed.length,'PE03_PAGE_COUNT_MISMATCH');
 for(const id of old.keys())if(!newIds.has(id))notSeen.push(id);
 // Non-observation does NOT imply deletion. No edits outside the bounded overlap verified.
 const observedHigh=Math.max(Date.parse(plan.predecessor_high_water_utc),...observed.map(r=>Date.parse(r.created_at)));
 const highWater=new Date(observedHigh).toISOString();
 return Object.freeze({status:'SYNTHETIC_RECONCILIATION_EXECUTED',added,changed:changes,unchanged:same,
  not_seen_in_bounded_pass:notSeen,deleted_inferred:0,
  future_high_water_utc:highWater,predecessor_snapshot_id:plan.predecessor_snapshot_id,
  source_claim_ceiling:'CHECKPOINTED_ARCHIVE_DELTA_NOT_HISTORICAL_COMPLETENESS',
  receipt_sha256:sha(JSON.stringify([plan.predecessor_snapshot_id,plan.query_from_utc,plan.query_until_utc,
    pageReceipts.map(p=>p.raw_sha256),added,changes,same,notSeen,highWater]))});
}
export function historicalBackfillScope({start,end='2026-09-09T00:00:00.000Z',includeComments=false,includeMedia=false}={}){
 const a=unix(start),b=unix(end);need(a<b&&b<=Date.parse('2026-09-09T00:00:00.000Z'),'PE03_VALID_BACKFILL_INTERVAL');
 return {schema:'wendbine-pe03-backfill-candidate/v1',from:start,to:end,
   posts:'PUBLIC_DISCOVERY_PROPOSED_NOT_ACQUIRED',
   comments:includeComments?'RIGHTS_AND_PROVIDER_SCOPE_REQUIRED':'NOT_IN_SCOPE',
   linked_media:includeMedia?'OFFSITE_RIGHTS_AND_ACTUAL_MEDIA_ACQUISITION_REQUIRED':'NOT_IN_SCOPE',
   gesture:'NEW_SEPARATELY_AUTHORIZED_GESTURE_REQUIRED',source_admitted:0};
}
