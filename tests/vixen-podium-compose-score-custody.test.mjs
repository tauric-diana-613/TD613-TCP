import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
import {createPodiumComposeGate} from '../app/encyclopedia/vixen-estate/podium-compose-gate.mjs';

if(!globalThis.crypto)globalThis.crypto=webcrypto;
const revision='a'.repeat(40);
function computed(){
 const record={
  schema:'td613.vixen.podium.composer-score/v1',
  score_scope:'USER_SUBMITTED_SYNTHESIS_NOT_DEVELOPER_EDIT',
  source_revision_declared:revision,
  source_census:{source_changes:[
   {action:'EXCLUDE',source_file_id:'SRC-01'}]},
  visuals:{selected:{kind:'OPEN_FORM_PROPOSAL',id:'NEW_VISUAL_GRAMMAR'}},
  proposed_changes:[],source_census_before:7
 };
 const hash=createHash('sha256').update(JSON.stringify(record)).digest('hex');
 return {...record,score_sha256:hash,human_readable_score:'Full score review required'};
}
function change(type,id,formId=null){
 const x={type,description:'Exact human-review consequence',
  source_ids:[id],before:{count:7},after:{count:6},
  effects:{corpus_census:{delta:-1},search_index:{requires_rebuild:true}},
  rollback:{method:'Restore prior immutable baseline',predecessor_ref:'prior-commit'},
  evidence:[{source_id:id,locator:'source:line:1',claim:'Provisional claim, requires verification'}]};
 if(formId)x.visual={form_id:formId,data_contract:'math-to-pixel map',previous_form_id:'OLD_FORM'};
 return x;
}
function materials(score,changes=[change('CORPUS_EXCLUDE','SRC-01'),
 change('VISUAL_FORM_CHANGE','SRC-01','NEW_VISUAL_GRAMMAR')]){
 return {question:'What has the synthesis proposed?',operator_boundary:'Human approval only',
  source_set_revision:'source-set-1',computed_score:score,
  computation_score_digest:score.score_sha256,changes};
}
test('Compose holds for a computationally unscored removal or hidden visual replacement',async()=>{
 const s=computed(),gate=createPodiumComposeGate({sourceRevision:revision});
 const missingRemoval=await gate.stage(materials(s,[change('VISUAL_FORM_CHANGE','SRC-01','NEW_VISUAL_GRAMMAR')]));
 assert.equal(missingRemoval.state,'HELD_SCORE_INCOMPLETE');
 assert.ok(missingRemoval.requirements.some(x=>x.startsWith('UNSTAGED_COMPUTED_CORPUS')));
 const hiddenVisual=await gate.stage(materials(s,[change('CORPUS_EXCLUDE','SRC-01')]));
 assert.ok(hiddenVisual.requirements.some(x=>x.startsWith('UNSTAGED_COMPUTED_VISUAL')));
 const invented=await gate.stage(materials(s,[change('CORPUS_EXCLUDE','SRC-01'),
  change('VISUAL_FORM_CHANGE','SRC-01','SOMETHING_ELSE')]));
 assert.ok(invented.requirements.some(x=>x.startsWith('UNSCORED_VISUAL_FORM')));
});
test('Compose requires the original hashed computational Score, not a mutable summary',async()=>{
 const s=computed(),gate=createPodiumComposeGate({sourceRevision:revision});
 const altered=structuredClone(s);altered.source_census.source_changes[0].source_file_id='OTHER-ID';
 const held=await gate.stage(materials(altered));
 assert.ok(held.requirements.includes('COMPUTATIONAL_SCORE_DIGEST_INVALID'));
 const mismatched=await gate.stage({...materials(s),computation_score_digest:'b'.repeat(64)});
 assert.ok(mismatched.requirements.includes('COMPUTATIONAL_SCORE_DIGEST_BINDING_REQUIRED'));
 const valid=await gate.stage(materials(s));
 assert.equal(valid.state,'STAGED_FOR_REVIEW');
 assert.equal(valid.score.computation_score_digest,s.score_sha256);
 assert.equal(valid.score.computational_score.score_sha256,s.score_sha256);
});
test('Changed Score invalidates the old human nonce and blocks compose',async()=>{
 const s=computed();
 const gate=createPodiumComposeGate({sourceRevision:revision,
  verifyHumanApproval:async({challenge})=>({
   authenticated_human:true,score_digest:challenge.score_digest,
   nonce:challenge.nonce,source_revision:revision,scope:challenge.approval_scope,
   human_principal:'test-human',independent_receipt_id:'test-receipt'
  })
 });
 const staged=await gate.stage(materials(s));
 const request=await gate.requestCompose({score_digest:staged.score.score_digest});
 assert.equal(request.state,'HOLD_HUMAN_AUTHORIZATION');
 const invalid=gate.invalidate('NEW_COMPUTATIONAL_SCORE');
 assert.equal(invalid.state,'HELD_PREVIOUS_COMPOSITION_INVALIDATED');
 assert.equal((await gate.acceptHumanApproval('old-host-proof')).state,'HELD_HUMAN_REQUEST_REQUIRED');
 assert.equal(gate.compose({score_digest:staged.score.score_digest}).status,'HELD');
});
