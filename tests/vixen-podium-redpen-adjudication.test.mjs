import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRedpenPacket,makeBlankRedpenReturn,adjudicateRedpenReturn,buildInChatRedpenControls}
 from '../app/encyclopedia/vixen-estate/podium-redpen-adjudication.mjs';
const score={schema:'td613.vixen.podium.composer-score/v1',score_sha256:'a'.repeat(64),
 source_revision_declared:'b'.repeat(40),source_census:{works:32},
 synthesis:{selected:{id:'S1',score:0.7},alternatives:[{id:'S2',score:.69}],weights:{visual:.3}},
 visuals:{selected:{kind:'OPEN_FORM_PROPOSAL',id:'N1'},
 alternatives:[{id:'N2',fitness:.6}],open_form_protocol:{proposed:[{id:'N1',fitness:.73}]}},
 proposed_changes:[{id:'SCORE-01',title:'New research claim',area:'SYNTHESIS',state:'PROPOSED',justification:'scored'},
 {id:'SCORE-02',title:'Replace the old laboratory',area:'OBSERVATORY',state:'PROPOSED',justification:'data'}]};
test('score yields accountable list, alternatives, opt-in visuals and interoperable annotations',()=>{
 const x=buildRedpenPacket(score);
 assert.equal(x.decisions.length,2);
 assert.equal(x.visual_review_required,true);
 assert.equal(x.scoring.visual_alternatives[0].id,'N2');
 assert.equal(x.standards_alignment.official_third_party_certification,false);
 const chat=buildInChatRedpenControls(x);
 assert.equal(chat.controls.length,2);
 assert.equal(chat.host_action,'NO_AUTOMATIC_USER_AUTHORIZATION');
});
test('blank / stale / incomplete review cannot authorize or imply Compose',()=>{
 const x=buildRedpenPacket(score),b=makeBlankRedpenReturn(x);
 assert.equal(adjudicateRedpenReturn(x,b).reason,'HELD_INVALID_DUPLICATE_OR_UNDECIDED_DISPOSITION');
 assert.equal(adjudicateRedpenReturn(x,{...b,score_sha256:'f'.repeat(64)}).reason,'HELD_STALE_SCORE_OR_SOURCE_REVISION');
 assert.equal(adjudicateRedpenReturn(x,{...b,dispositions:b.dispositions.slice(1)}).reason,'HELD_INCOMPLETE_REVIEW');
});
test('approved items remain unauthenticated review, alternatives demand rescore',()=>{
 const x=buildRedpenPacket(score),b=makeBlankRedpenReturn(x);
 b.dispositions.forEach(d=>{d.action='APPROVE'});
 const approved=adjudicateRedpenReturn(x,b);
 assert.equal(approved.status,'REVIEW_READY_FOR_INDEPENDENT_AUTHENTICATION');
 assert.equal(approved.human_authentication_completed,false);
 assert.equal(approved.compose_authority,false);
 assert.equal(approved.annotations[0].target.selector.value,'/decisions/0');
 b.dispositions[1].action='REQUEST_ALTERNATIVE';
 b.dispositions[1].comment='Please preserve the original exhibit and evaluate N2';
 b.dispositions[1].reselect_candidate_id='N2';
 assert.equal(adjudicateRedpenReturn(x,b).next_action,'REGENERATE_OR_HOLD_COMPUTATIONAL_SCORE');
});
test('visual HTML requirement only attaches for true proposed change',()=>{
 const neutral=structuredClone(score);neutral.visuals.selected.kind='CURRENT_INSTALLED_LAB';
 const pkt=buildRedpenPacket(neutral);assert.equal(pkt.visual_review_required,false);
 assert.equal(pkt.visual_review_attachment,'OMITTED_NO_VISUAL_SUBSTITUTION');
});

test('task JSON may not impersonate human authentication',()=>{
 const x=buildRedpenPacket(score),b=makeBlankRedpenReturn(x);
 b.dispositions.forEach(d=>d.action='APPROVE');
 assert.equal(adjudicateRedpenReturn(x,{...b,authenticated_human:true}).reason,
  'HELD_REVIEW_TRANSPORT_CANNOT_AUTHENTICATE_OPERATOR');
});
