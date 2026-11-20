import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,realpathSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {startMaestroMethodJourney,verifyPriorStep,advanceMaestroObservation,invokeMaestroMethodLoop}
 from '../scripts/wendbine-maestro-research-loop.mjs';
import {loadOriginalPublicFixture} from '../scripts/wendbine-proscenium-assay.mjs';
import {createPodiumNativeReadAdapters} from '../scripts/vixen-podium-native-adapters.mjs';
import {createVixenPodium,PODIUM_SCHEMA,BOUNDED_ENGINE_OPERATIONS}
 from '../app/encyclopedia/reference/vixen-podium.mjs';
const repo=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
async function seed(){
 const native=await loadOriginalPublicFixture();
 const target=native.posts.find(x=>x.public_date==='2026-09-11')||native.posts.at(-1);
 return startMaestroMethodJourney({target_source_id:target.source_id});
}
test('native Maestro journey performs actual bounded public assay and preserves the observability shore',async()=>{
 const first=await seed();
 assert.equal(first.schema,'td613.wendbine.maestro-loop/v1');
 assert.equal(first.step_index,0);
 assert.equal(first.source_promotion,false);
 assert.equal(first.public_vixen_performers_added,0);
 assert.equal(first.scientific_credit,0);
 assert.equal(first.human_closure_required,true);
 assert.ok(first.next_action.human_action_required);
 assert.ok(verifyPriorStep(first));
 assert.match(first.baseline_assay_receipt_sha256,/^[0-9a-f]{64}$/);
});
test('a negative control changes the research hypothesis; observed human report stays unverified',async()=>{
 const first=await seed();
 const redirected=advanceMaestroObservation(first,{kind:'CONTROL_MATCHED_BASELINE',
  note:'Observed label-shuffle comparator tied the baseline'});
 assert.equal(redirected.hypothesis,'GENERIC_VOCABULARY_OR_RETROSPECTIVE_LABEL_LEAKAGE');
 assert.equal(redirected.next_action.kind,'DESIGN_BLINDED_DISCRIMINATOR');
 assert.equal(redirected.parent_receipt_sha256,first.receipt_sha256);
 assert.equal(redirected.external_source_verified,false);
 assert.equal(redirected.latest_observation_kind,'CONTROL_MATCHED_BASELINE');
 const reported=advanceMaestroObservation(redirected,{kind:'OPERATOR_REPORTED_SOURCE',
  source_id:'reddit:t3_abcde1',note:'I found another link'});
 assert.equal(reported.next_action.kind,'VERIFY_EXTERNAL_SOURCE_BEFORE_RERANKING');
 assert.equal(reported.report_evidence_class,'UNVERIFIED_OPERATOR_REPORT_NOT_ARCHIVED_SOURCE');
 assert.equal(reported.source_promotion,false);
 const stop=advanceMaestroObservation(reported,{kind:'NO_NEW_EVIDENCE'});
 assert.equal(stop.state,'STOPPED_EVIDENCE_BOUNDARY');
 assert.equal(stop.next_action.human_action_required,false);
 assert.throws(()=>advanceMaestroObservation(stop,{kind:'CONTROL_DISTINGUISHED_BASELINE'}),
  /HELD_MAESTRO_STOPPED_REQUIRES_NEW_SESSION/);
});
test('forks, tampering, attempts at scientific lift and fabricated report fields all fail closed',async()=>{
 const first=await seed();
 assert.throws(()=>verifyPriorStep({...first,hypothesis:'PROVED_SCIENCE'}),/HELD_MAESTRO_PRIOR_HASH_MISMATCH/);
 assert.throws(()=>advanceMaestroObservation(first,{kind:'DANGEROUS_AUTO_PUBLISH'}),
  /HELD_MAESTRO_UNKNOWN_OBSERVATION/);
 assert.throws(()=>advanceMaestroObservation(first,{kind:'OPERATOR_REPORTED_SOURCE',
  proof_sha256:'0'.repeat(64)}),/HELD_MAESTRO_UNKNOWN_REPORT_FIELDS/);
 assert.throws(()=>advanceMaestroObservation(first,{kind:'OPERATOR_REPORTED_SOURCE',
  source_id:'cross_opera_unverified',note:'irrelevant'}),/HELD_MAESTRO_SOURCE_ID_INVALID/);
 assert.throws(()=>verifyPriorStep({...first,scientific_credit:1}),
  /HELD_MAESTRO_PRIOR_HASH_MISMATCH/);
 const finished=await invokeMaestroMethodLoop({action:'finish',previous_receipt:first});
 assert.equal(finished.state,'FINISHED_HELD');
 assert.equal(finished.parent_receipt_sha256,first.receipt_sha256);
 assert.equal(finished.scientific_credit,0);
 assert.ok(verifyPriorStep(finished));
});
test('machine Podium refuses caller-supplied approval and accepts host-only unratified Maestro step',async()=>{
 assert.ok(BOUNDED_ENGINE_OPERATIONS.WENDBINE_ATELIER.includes('wendbine_maestro_research_step'));
 const fixture=await loadOriginalPublicFixture();
 const target=fixture.posts.find(x=>x.public_date==='2026-09-11');
 const html=readFileSync(resolve(repo,'app/encyclopedia/vix-cyb.html'),'utf8');
 const c=JSON.parse(html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
 const membrane={open:async()=>({state:'CENSUS_MATCHED'}),search:()=>[],getRecord:async()=>null,
  related:()=>[],status:()=>({state:'UNOPENED'})};
 const adapter=await createPodiumNativeReadAdapters({repoRoot:repo});
 const task={schema:PODIUM_SCHEMA,intent:'engine.invoke',params:{
  engine:'WENDBINE_ATELIER',operation:'wendbine_maestro_research_step',
  payload:{action:'start',target_source_id:target.source_id}
 }};
 const denial=await createVixenPodium({corpus:c,membrane,engineAdapters:adapter}).dispatch(task);
 assert.equal(denial.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 const receipt=await createVixenPodium({corpus:c,membrane,operatorAuthorized:true,
  engineAdapters:adapter}).dispatch(task);
 assert.equal(receipt.status,'HELD');
 assert.equal(receipt.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 assert.equal(receipt.result.output.state,'HUMAN_ACTION_REQUIRED');
 assert.equal(receipt.result.output.scientific_credit,0);
});
