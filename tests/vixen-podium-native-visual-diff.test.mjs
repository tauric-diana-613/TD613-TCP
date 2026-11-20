import test from 'node:test';
import assert from 'node:assert/strict';
import {buildNativeVisualDiff} from '../app/encyclopedia/vixen-estate/podium-native-visual-diff.mjs';
const packet={schema:'td613.vixen.podium.redpen-review/v1',score_sha256:'a'.repeat(64),
 source_revision:'b'.repeat(40),visual_review_required:true,
 decisions:[{decision_id:'SCORE-02',area:'OBSERVATORY'}],
 scoring:{visual_selected:{id:'NEW_FORM'}}};
const asset=(href)=>({capture_kind:'NATIVE_SAME_BUILD_INTERACTIVE_SCENE',
 source_revision:packet.source_revision,renderer_sha256:'c'.repeat(64),
 styles_sha256:'d'.repeat(64),capture_receipt_sha256:'e'.repeat(64),
 runtime_interactive:true,displayed_pixels_verified:true,href});
const pair={change_id:'SCORE-02',target_lab_id:'LAB_A',
 previous_form_id:'OLD_FORM',proposed_form_id:'NEW_FORM',
 before:asset('./review-renders/a/old.html'),after:asset('./review-renders/a/new.html')};
test('visual review remains conditional and fails closed without REAL paired native scenes',()=>{
 assert.equal(buildNativeVisualDiff({...packet,visual_review_required:false}).status,'NOT_REQUIRED');
 assert.equal(buildNativeVisualDiff(packet,[]).status,'HELD');
 assert.equal(buildNativeVisualDiff(packet,[{...pair,after:{...pair.after,runtime_interactive:false}}]).status,'HELD');
 assert.equal(buildNativeVisualDiff(packet,[{...pair,after:{...pair.after,href:'https://evil.example/scene.html'}}]).status,'HELD');
});
test('compact HTML includes displaced and candidate native interactive scenes and operator notes',()=>{
 const r=buildNativeVisualDiff(packet,[pair]);
 assert.equal(r.status,'READY_FOR_OPERATOR_VISUAL_REVIEW');
 assert.match(r.html,/Outgoing · demoted \/ displaced/);
 assert.match(r.html,/Incoming · proposed replacement/);
 assert.match(r.html,/OLD_FORM/);
 assert.match(r.html,/NEW_FORM/);
 assert.match(r.html,/textarea data-change-id="SCORE-02"/);
 assert.match(r.html,/allow-scripts allow-same-origin/);
 assert.equal(r.exact_native_captures,1);
 assert(r.bytes<16000);
 assert.equal(r.release_authority,false);
});
test('multiple proposed changes must all be represented without hidden removals',()=>{
 const p={...packet,decisions:[...packet.decisions,{decision_id:'SCORE-03',area:'VISUAL_ARTIFACT_CHANGE'}]};
 assert.equal(buildNativeVisualDiff(p,[pair]).reason,'HELD_UNDISPLAYED_VISUAL_CHANGE');
});
