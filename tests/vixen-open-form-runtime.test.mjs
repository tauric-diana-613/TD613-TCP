import test from 'node:test';
import assert from 'node:assert/strict';
import {createReviewedVisualFormHost,extractApprovedVisual} from
 '../app/encyclopedia/vixen-estate/observatory-compose-preview.mjs';

const approval=()=>({
 schema:'td613.vixen.podium.compose-gate/v1',
 state:'COMPOSED_PREVIEW_ONLY',status:'SUPPORTED',release_authority:false,
 approval:{authorization_kind:'HOST_VERIFIED_SEPARATE_HUMAN',
  independent_receipt_id:'operator-witness-from-real-host'},
 approved_visual_candidates:[{form_id:'NOVEL_MATHEMATICAL_GRAMMAR',
  data_contract:'source-bound typed model'}],
 composition:{score_digest:'a'.repeat(64),
  changes:[{type:'VISUAL_FORM_CHANGE',source_ids:['work:alpha']}]}
});
test('unfamiliar forms can be nominated without being preinstalled or authorized',async()=>{
 const receipt=approval();
 assert.equal(extractApprovedVisual(receipt).form_id,'NOVEL_MATHEMATICAL_GRAMMAR');
 const pending=createReviewedVisualFormHost();
 assert.equal(pending.available().arbitrary_future_visual_families_allowed,true);
 assert.equal((await pending.paintAuthorized({}, {composeReceipt:receipt})).status,
  'HELD_INDEPENDENT_HOST_APPROVAL_UNAVAILABLE');
 const withoutRenderer=createReviewedVisualFormHost({verifyHumanReceipt:async()=>true});
 assert.equal((await withoutRenderer.paintAuthorized({}, {composeReceipt:receipt})).status,
  'HELD_NEW_RENDERER_NOT_INSTALLED');
});
test('approved new form can use a separately injected reviewed adapter, not a fixed chart',async()=>{
 let calls=0;
 const moduleDigest='1'.repeat(64);
 const host=createReviewedVisualFormHost({
  verifyHumanReceipt:async()=>true,
  reviewedRenderers:[{id:'NOVEL_MATHEMATICAL_GRAMMAR',source_sha256:moduleDigest,
   review_receipt_id:'code-review-exact-head',
   paintFrame:async(canvas,opts)=>{
    calls++;
    assert.equal(opts.host_clock_only,true);
    assert.equal(opts.sourceIds[0],'work:alpha');
    assert.equal(opts.time,0.35);
    return {novelGeometry:true,mathematicalMapping:'x -> transformed space'};
   }}]
 });
 const out=await host.paintAuthorized({getContext:()=>({})},
  {composeReceipt:approval(),formOptions:{time:0.35}});
 assert.equal(out.status,'SUPPORTED_PREVIEW_ONLY');
 assert.equal(out.preview.novelGeometry,true);
 assert.equal(out.active_exhibit_replaced,false);
 assert.equal(out.source_mutation,false);
 assert.equal(out.release_authority,false);
 assert.equal(calls,1);
});
test('task-level claims and unreviewed code are denied',async()=>{
 assert.throws(()=>createReviewedVisualFormHost({reviewedRenderers:[{
  id:'UNTRUSTED_RENDERER',source_sha256:'2'.repeat(64),
  paintFrame:()=>null
 }]}),/HELD_UNREVIEWED_OR_DUPLICATE_VISUAL_RENDERER/);
});
