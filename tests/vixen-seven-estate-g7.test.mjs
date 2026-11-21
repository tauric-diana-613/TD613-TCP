/**
 * G7 source-only temporal custody test. No network/provider, issue gestures,
 * private vault, release, human policy or original historical replay.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {checkPost,compileSync,writeProjection,loadState}
 from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-src-autosync.mjs';
import {EPOCH_SCHEMA,assertG7Chronology,verifyG7EpochDirectory,
 normalizeG7Gesture,claimG7GestureLocal} from
 '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/vixen-g7-epoch-custody.mjs';
import {auditServiceJourneyChronology,runTemporalCustodianAudit,TEMPORAL_CUSTODIAN_SCHEMA}
 from '../app/engine/dollhouse-temporal-custodian.js';
const t1='2026-11-20T20:00:00Z',t2='2026-11-20T21:00:00Z';
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const sample=(body='G7 synthetic source')=>checkPost({
 id:'1zzzzzz',author:'Upset-Ratio502',subreddit:'Wendbine',
 title:'Synthetic title',selftext:body,is_self:true,created_utc:1795180000,
 edited:false,retrieved_on:1795180100
});
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'td613-g7-epoch-'));
 const first=compileSync({observed:[sample()],observedAt:t1});
 const a=writeProjection({compiled:first,outRoot:root,observedAt:t1});
 const second=compileSync({observed:[sample()],previous:loadState(root),observedAt:t2});
 return {root,first,a,second};
}
const dir=(root,id)=>path.join(root,'07-ARCHIVE-LEDGER','epochs',id);
const tidy=root=>fs.rmSync(root,{recursive:true,force:true});

test('G7-A full exact first and successor public epochs, matched predecessor seal and immutable values',()=>{
 const {root,a,second}=fixture();
 try{
  const beforeSeal=fs.readFileSync(path.join(root,'04-RECEIPTS/phase2/current-seal.json'));
  const pinned=fs.readFileSync(path.join(dir(root,a.snapshot),'04-RECEIPTS/phase2/current-seal.json'));
  assert.equal(sha(beforeSeal),sha(pinned),'First epoch must have complete local bytes before successor starts');
  const b=writeProjection({compiled:second,outRoot:root,observedAt:t2});
  assert.equal(b.seal.predecessor_snapshot_id,a.snapshot);
  assert.equal(b.seal.predecessor_seal_sha256,sha(beforeSeal));
  assert.equal(b.seal.human_equal_timestamp_policy,'UNADJUDICATED_HOLD');
  assert.equal(b.authority,'LOCAL_PUBLIC_PROJECTION_ONLY');
  const prev=verifyG7EpochDirectory(dir(root,a.snapshot),{expectedSnapshot:a.snapshot});
  const next=verifyG7EpochDirectory(dir(root,b.snapshot),{expectedSnapshot:b.snapshot});
  assert.equal(prev.state,'LOCAL_IMMUTABLE_EPOCH_BYTES_MATCH');
  assert.equal(next.state,'LOCAL_IMMUTABLE_EPOCH_BYTES_MATCH');
  assert.equal(next.predecessor_snapshot_id,a.snapshot);
  assert.equal(b.seal.retained_full_public_epoch,'07-ARCHIVE-LEDGER/epochs/'+b.snapshot);
  assert.deepEqual(fs.readFileSync(path.join(dir(root,a.snapshot),'01-MANIFESTS/phase2/manifestations.jsonl')),
   fs.readFileSync(path.join(dir(root,b.snapshot),'01-MANIFESTS/phase2/manifestations.jsonl')),
   'Repeat observation preserves same Work/manifestation while captures change');
  assert.notDeepEqual(fs.readFileSync(path.join(dir(root,a.snapshot),'01-MANIFESTS/phase2/capture-v2.jsonl')),
   fs.readFileSync(path.join(dir(root,b.snapshot),'01-MANIFESTS/phase2/capture-v2.jsonl')),
   'Epoch multiplicity must survive identical source bodies');
  const manifest=JSON.parse(fs.readFileSync(path.join(dir(root,a.snapshot),'EPOCH_MANIFEST.json')));
  assert.equal(manifest.schema,EPOCH_SCHEMA);
  assert.equal(manifest.provenance_class,'NEW_G7_LOCAL_PUBLIC_PROJECTION_NOT_RECOVERED_ORIGINAL');
  assert.equal(manifest.external_origin_authenticated,false);
  assert.equal(b.historical_first_epoch_reconstruction_claim,false);
 }finally{tidy(root)}
});
test('G7-B caller-supplied backward observation refused BEFORE existing state mutation',()=>{
 const {root,second}=fixture();
 try{
  const original=fs.readFileSync(path.join(root,'04-RECEIPTS/phase2/current-seal.json'));
  const earlier=compileSync({observed:[sample('different text')],previous:loadState(root),
   observedAt:'2026-11-19T19:00:00Z'});
  assert.throws(()=>writeProjection({compiled:earlier,outRoot:root,
   observedAt:'2026-11-19T19:00:00Z'}),/HELD_WRITER_BACKWARD_TIME_PREDECESSOR/);
  assert.equal(sha(fs.readFileSync(path.join(root,'04-RECEIPTS/phase2/current-seal.json'))),sha(original));
  assert.equal(fs.existsSync(dir(root,'wendbine-20261119190000-000000000000')),false);
 }finally{tidy(root)}
});
test('G7-C equal-time writer has explicit human-policy HOLD rather than implicit new seal',()=>{
 const {root}=fixture();
 try{
  const before=sha(fs.readFileSync(path.join(root,'04-RECEIPTS/phase2/current-seal.json')));
  const conflicting=compileSync({observed:[sample('new body same timestamp')],previous:loadState(root),observedAt:t1});
  assert.throws(()=>writeProjection({compiled:conflicting,outRoot:root,observedAt:t1}),
   /HELD_EQUAL_TIMESTAMP_HUMAN_POLICY_REQUIRED/);
  assert.equal(sha(fs.readFileSync(path.join(root,'04-RECEIPTS/phase2/current-seal.json'))),before);
  assert.equal(assertG7Chronology({observedAt:t2,predecessorSeal:JSON.parse(
   fs.readFileSync(path.join(root,'04-RECEIPTS/phase2/current-seal.json'),'utf8'))}).human_wall_clock_policy,'UNADJUDICATED');
 }finally{tidy(root)}
});
test('G7-D immutable epoch tamper vetoes own readback and successor attempt',()=>{
 const {root,a,second}=fixture();
 try{
  const target=path.join(dir(root,a.snapshot),'01-MANIFESTS/phase2/manifestations.jsonl');
  fs.appendFileSync(target,'{}\n');
  assert.throws(()=>verifyG7EpochDirectory(dir(root,a.snapshot)),/HELD_EPOCH_MEMBER_DIGEST_MISMATCH/);
  assert.throws(()=>writeProjection({compiled:second,outRoot:root,observedAt:t2}),
   /HELD_EPOCH_MEMBER_DIGEST_MISMATCH/);
 }finally{tidy(root)}
});
test('G7-E legacy current-state boundary copy is labeled recovered-at-boundary, never a lost original epoch',()=>{
 const {root,a,second}=fixture();
 try{
  fs.rmSync(dir(root,a.snapshot),{recursive:true,force:true});
  const b=writeProjection({compiled:second,outRoot:root,observedAt:t2});
  const recovered=JSON.parse(fs.readFileSync(path.join(dir(root,a.snapshot),'EPOCH_MANIFEST.json'),'utf8'));
  assert.equal(recovered.provenance_class,
   'BOUNDARY_COPY_OF_PREEXISTING_MUTABLE_STATE_NOT_ORIGINAL_FIRST_EPOCH');
  assert.equal(recovered.external_origin_authenticated,false);
  assert.notEqual(b.snapshot,a.snapshot);
  assert.equal(verifyG7EpochDirectory(dir(root,a.snapshot)).files_verified>0,true);
 }finally{tidy(root)}
});
test('G7-F one issue comment is one local claim across all run attempts',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'td613-g7-gesture-'));
 try{
  const input={source_revision:'a'.repeat(40),issue_number:1308,comment_id:7181,
   author:'operator',command:'/wendbine-sync ATELIER',
   workflow_run_id:97174,workflow_run_attempt:1,predecessor_snapshot_id:'GENESIS'};
  const lease=normalizeG7Gesture(input);
  const first=claimG7GestureLocal(root,lease);
  assert.equal(first.state,'LOCAL_EVENT_CLAIM_RETAINED');
  const rerun=normalizeG7Gesture({...input,workflow_run_attempt:2});
  assert.equal(rerun.event_key,lease.event_key);
  assert.throws(()=>claimG7GestureLocal(root,rerun),/HELD_GESTURE_ALREADY_CONSUMED/);
  assert.throws(()=>normalizeG7Gesture({...input,source_revision:'bad'}),
   /HELD_INCOMPLETE_GESTURE_LINEAGE/);
  assert.throws(()=>normalizeG7Gesture({...input,issue_number:758}),
   /HELD_GESTURE_ISSUE_COMMAND_MISMATCH/);
 }finally{tidy(root)}
});
test('G7-G phase-status PASS is only PHASE_STATUS_COMPLETENESS; missing ledger stays HELD',()=>{
 const phases={origin:{status:'PASS',entry_id:'e1'},
  receiver:{status:'PASS',entry_id:'e2'},return:{status:'PASS',entry_id:'e3'}};
 assert.equal(auditServiceJourneyChronology(phases,['origin','receiver','return']).verdict,'PASS');
 const result=runTemporalCustodianAudit({
  schema:TEMPORAL_CUSTODIAN_SCHEMA,case_id:'g7-synthetic',source_revision:'a'.repeat(40),
  coordinate:'TMP-04',episode_id:'synthetic-001',ledger_entries:[],baseline_entries:null,
  required_phases:['origin','receiver','return'],phases
 });
 assert.equal(result.verdict,'HELD');
 assert.equal(result.authority.execute,false);
 assert.equal(result.evidence_posture.provider_origin_authenticated,false);
});
