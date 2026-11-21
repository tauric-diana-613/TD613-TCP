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
 normalizeG7Gesture,claimG7GestureLocal,recoverG7InterruptedPublication} from
 '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/vixen-g7-epoch-custody.mjs';
import {parseG7WorkflowGesture,claimG7WorkflowGesture} from '../scripts/vixen-g7-live-gesture-guard.mjs';
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


test('G7-H interrupted mutable publication is HELD until explicit predecessor-pinned rollback',()=>{
 const {root,a,second}=fixture();
 try{
  const predecessorSeal=fs.readFileSync(path.join(root,'04-RECEIPTS/phase2/current-seal.json'));
  const b=writeProjection({compiled:second,outRoot:root,observedAt:t2});
  // Fault injection models interruption after candidate member writes but
  // before final atomic seal: candidate bytes and run receipt may exist, while
  // the current seal still refers to its predecessor.
  fs.writeFileSync(path.join(root,'04-RECEIPTS/phase2/current-seal.json'),predecessorSeal);
  assert.throws(()=>loadState(root),/PREVIOUS_PROJECTION_HASH_MISMATCH/);
  const before=fs.readFileSync(path.join(root,'01-MANIFESTS/phase2/capture-v2.jsonl'));
  const preview=recoverG7InterruptedPublication({outRoot:root,candidateSnapshot:b.snapshot,
   predecessorSnapshot:a.snapshot});
  assert.equal(preview.state,'INTERRUPTED_CANDIDATE_PREDECESSOR_ROLLBACK_AVAILABLE');
  assert.equal(preview.candidate_promoted,false);
  assert.deepEqual(fs.readFileSync(path.join(root,'01-MANIFESTS/phase2/capture-v2.jsonl')),before,
   'Default is read-only, never silent recovery');
  const repaired=recoverG7InterruptedPublication({outRoot:root,candidateSnapshot:b.snapshot,
   predecessorSnapshot:a.snapshot,operatorApproved:true});
  assert.equal(repaired.state,'PUBLIC_PROJECTION_RESTORED_FROM_PINNED_PREDECESSOR');
  assert.equal(repaired.orphan_candidate_epoch_preserved,true);
  assert.deepEqual(fs.readFileSync(path.join(root,'01-MANIFESTS/phase2/capture-v2.jsonl')),
   fs.readFileSync(path.join(dir(root,a.snapshot),'01-MANIFESTS/phase2/capture-v2.jsonl')));
  assert.equal(loadState(root).captures.length>0,true);
  assert.equal(verifyG7EpochDirectory(dir(root,b.snapshot)).state,'LOCAL_IMMUTABLE_EPOCH_BYTES_MATCH');
  assert.throws(()=>recoverG7InterruptedPublication({outRoot:root,candidateSnapshot:b.snapshot,
   predecessorSnapshot:a.snapshot,operatorApproved:true}),/HELD_G7_RECOVERY_ALREADY_RECORDED/);
 }finally{tidy(root)}
});
test('G7-I rollback refuses predecessor mismatch and overwriting an already committed newer seal',()=>{
 const {root,a,second}=fixture();
 try{
  const b=writeProjection({compiled:second,outRoot:root,observedAt:t2});
  assert.throws(()=>recoverG7InterruptedPublication({outRoot:root,candidateSnapshot:b.snapshot,
   predecessorSnapshot:a.snapshot,operatorApproved:true}),
   /HELD_G7_RECOVERY_CURRENT_SEAL_IS_NOT_PREDECESSOR/);
  assert.throws(()=>recoverG7InterruptedPublication({outRoot:root,candidateSnapshot:a.snapshot,
   predecessorSnapshot:b.snapshot}),
   /HELD_G7_RECOVERY_PREDECESSOR_MISMATCH/);
  const candidateManifestPath=path.join(dir(root,b.snapshot),'EPOCH_MANIFEST.json');
  const saved=fs.readFileSync(candidateManifestPath,'utf8');
  const payload=JSON.parse(saved);
  payload.predecessor_seal_sha256='0'.repeat(64);
  fs.writeFileSync(candidateManifestPath,JSON.stringify(payload));
  assert.throws(()=>recoverG7InterruptedPublication({outRoot:root,candidateSnapshot:b.snapshot,
   predecessorSnapshot:a.snapshot}),/HELD_G7_RECOVERY_PREDECESSOR_DIGEST_MISMATCH/);
 }finally{tidy(root)}
});


test('G7-J source-pinned live comment claim is locally one-use across workflow attempts',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'td613-g7-workflow-'));
 try{
  const args={root,out:path.join(root,'temp/lease.json'),
   estate:'WENDBINE',sourceRevision:'a'.repeat(40),issue:1308,
   comment:98123,author:'tauric-diana-613',
   command:'/wendbine-sync ATELIER',run:75318,attempt:1,predecessor:'GENESIS'};
  const preflight=parseG7WorkflowGesture(args);
  assert.equal(preflight.comment_id,98123);
  const claimed=claimG7WorkflowGesture(args);
  assert.equal(claimed.persisted_remotely,false);
  assert.equal(claimed.requires_atomic_remote_fast_forward,true);
  assert.equal(fs.existsSync(path.join(root,'07-ARCHIVE-LEDGER','gestures',
   preflight.event_key+'.json')),true);
  assert.throws(()=>claimG7WorkflowGesture({...args,attempt:2,
   out:path.join(root,'temp/rerun-lease.json')}),/HELD_GESTURE_ALREADY_CONSUMED/);
  assert.throws(()=>parseG7WorkflowGesture({...args,issue:758}),
   /HELD_GESTURE_ISSUE_COMMAND_MISMATCH/);
  assert.throws(()=>parseG7WorkflowGesture({...args,estate:'SRC'}),
   /HELD_G7_GESTURE_ESTATE_ISSUE_MISMATCH/);
 }finally{tidy(root)}
});


test('G7-K both existing issue listeners stage durable claims before source acquisition',()=>{
 const workflow=fs.readFileSync(new URL('../.github/workflows/vercel-relock-safety.yml',import.meta.url),'utf8');
 assert.equal(workflow.match(/Persist one-use G7 comment claim before any source operation/g)?.length,2);
 assert.equal(workflow.match(/Pin G7 guard to the triggering workflow revision/g)?.length,2);
 const src=workflow.slice(workflow.indexOf('  src-zenodo-sync:'),workflow.indexOf('  wendbine-operator-sync:'));
 const wend=workflow.slice(workflow.indexOf('  wendbine-operator-sync:'));
 assert.ok(src.indexOf('Persist one-use G7 comment claim')<src.indexOf('Run exact-creator Zenodo delta sync'));
 assert.ok(wend.indexOf('Persist one-use G7 comment claim')<wend.indexOf('Acquire bounded archive'));
 assert.ok(wend.indexOf('Require G7-capable target writer')<wend.indexOf('Persist one-use G7 comment claim'));
 for(const section of [src,wend]){
  assert.match(section,/git push origin "HEAD:\$ATELIER_BRANCH"/);
  assert.match(section,/--comment "\$G7_COMMENT_ID"/);
  assert.match(section,/--attempt "\$G7_RUN_ATTEMPT"/);
  assert.match(section,/github\.workflow_sha/);
 }
 assert.match(wend,/--gesture-lease-file "\$RUNNER_TEMP\/g7-workflow\/lease\.json"/);
});


test('G7-L encrypted handoff authority fails before public mutation, then exact ciphertext readback succeeds',()=>{
 const {root,second}=fixture();
 const outside=root+'-ciphertext.sealed.json';
 try{
  const oldSeal=fs.readFileSync(path.join(root,'04-RECEIPTS/phase2/current-seal.json'));
  const arg={compiled:second,outRoot:root,observedAt:t2,
   encryptedPayload:{body:'synthetic secret only'},publicPem:'invalid',artifactPath:outside};
  assert.throws(()=>writeProjection({...arg,artifactPath:path.join(root,'leak.json')}),
   /HELD_ENCRYPTED_HANDOFF_MUST_REMAIN_OUTSIDE_PUBLIC_PROJECTION/);
  assert.throws(()=>writeProjection(arg));
  assert.deepEqual(fs.readFileSync(path.join(root,'04-RECEIPTS/phase2/current-seal.json')),oldSeal);
  assert.equal(fs.existsSync(outside),false);
  fs.writeFileSync(outside,'other data');
  assert.throws(()=>writeProjection(arg),/HELD_ENCRYPTED_HANDOFF_DESTINATION_ALREADY_EXISTS/);
  assert.equal(fs.readFileSync(outside,'utf8'),'other data');
  fs.unlinkSync(outside);
  const {publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048,
   publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});
  const result=writeProjection({...arg,publicPem:publicKey});
  assert.equal(result.receipt.encrypted_handoff_created,true);
  assert.equal(fs.existsSync(outside),true);
  const ciphertext=fs.readFileSync(outside,'utf8');
  assert.doesNotMatch(ciphertext,/synthetic secret only/);
  assert.equal(JSON.parse(ciphertext).schema,'wendbine-src-autosync/v0.1');
  assert.equal(result.seal.atelier_snapshot_id,result.snapshot);
  assert.ok(loadState(root).captures.length>0);
 }finally{tidy(root);fs.rmSync(outside,{force:true})}
});
