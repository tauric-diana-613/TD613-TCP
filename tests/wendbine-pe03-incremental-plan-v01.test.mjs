import test from 'node:test';
import assert from 'node:assert/strict';
import {planChronologicalDelta,reconcileChronologicalObservations,historicalBackfillScope} from '../scripts/wendbine-pe03-incremental-plan-v01.mjs';
const clock='2026-11-03T00:00:00.000Z',utc='2026-11-02T18:00:00.000Z',hash=x=>x.repeat(64);
const checkpoint={schema:'wendbine-checkpoint/synthetic-v1',source_epoch:'SYNTHETIC_ONLY',
 snapshot_id:'SYNTHETIC_NOV02',completed:true,sealed:true,errors:0,observed_count:2,high_water_utc:utc};
const p=()=>planChronologicalDelta({checkpoint,now:clock,overlapSeconds:86400});
const row=(id,hex,date=utc)=>({source_id:'reddit:t3_'+id,body_sha256:hash(hex),created_at:date});
const page=count=>[{complete:true,count,raw_sha256:hash('a')}];
test('PE03: high-water scan uses overlap and keeps original archive',()=>{
 const plan=p();assert.equal(plan.query_from_utc,'2026-11-01T18:00:00.000Z');
 assert.equal(plan.predecessor_snapshot_id,checkpoint.snapshot_id);
 assert.equal(plan.historical_pre_september_backfill,'SEPARATE_HUMAN_SCOPED_GESTURE_REQUIRED');
 assert.equal(plan.network_gesture,'NOT_AUTHORIZED_IN_PURE_PLANNER');
});
test('PE03: detects edits, new arrivals and unchanged with no deletion inference',()=>{
 const result=reconcileChronologicalObservations({plan:p(),previous:[row('abcde','b'),row('abcdf','b')],
  observed:[row('abcde','c'),row('abcdf','b'),row('abcdg','a','2026-11-02T20:00:00.000Z')],
  pageReceipts:page(3),complete:true});
 assert.deepEqual(result.changed,['reddit:t3_abcde']);
 assert.deepEqual(result.added,['reddit:t3_abcdg']);
 assert.deepEqual(result.unchanged,['reddit:t3_abcdf']);
 assert.equal(result.deleted_inferred,0);
 assert.equal(result.future_high_water_utc,'2026-11-02T20:00:00.000Z');
});
test('PE03: earlier missing sources are unobserved, never declared deleted',()=>{
 const result=reconcileChronologicalObservations({plan:p(),previous:[row('abcde','b')],observed:[],pageReceipts:page(0),complete:true});
 assert.deepEqual(result.not_seen_in_bounded_pass,['reddit:t3_abcde']);assert.equal(result.deleted_inferred,0);
});
test('PE03: 403, partial page, duplicate record and count mismatch HOLD',()=>{
 const arg={plan:p(),previous:[],observed:[row('abcde','a')],pageReceipts:page(1),complete:true};
 assert.throws(()=>reconcileChronologicalObservations({...arg,httpStatus:403}),/PE03_ARCHIVE_HTTP_HELD_403/);
 assert.throws(()=>reconcileChronologicalObservations({...arg,complete:false}),/PE03_INCOMPLETE_PAGE_EVIDENCE/);
 assert.throws(()=>reconcileChronologicalObservations({...arg,observed:[row('abcde','a'),row('abcde','b')],pageReceipts:page(2)}),/PE03_CONFLICTING_OR_DUPLICATE/);
 assert.throws(()=>reconcileChronologicalObservations({...arg,pageReceipts:page(2)}),/PE03_PAGE_COUNT_MISMATCH/);
});
test('PE03: historical inception backfill remains separate authority',()=>{
 const result=historicalBackfillScope({start:'2026-01-01T00:00:00.000Z',includeComments:true,includeMedia:true});
 assert.equal(result.gesture,'NEW_SEPARATELY_AUTHORIZED_GESTURE_REQUIRED');assert.equal(result.source_admitted,0);
 assert.match(result.linked_media,/OFFSITE_RIGHTS/);
 assert.throws(()=>historicalBackfillScope({start:'2026-09-09T00:00:00.000Z'}),/PE03_VALID_BACKFILL_INTERVAL/);
});
