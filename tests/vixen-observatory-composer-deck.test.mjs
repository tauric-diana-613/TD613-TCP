import test from 'node:test';
import assert from 'node:assert/strict';
import {createObservatoryComposerDeck} from '../app/encyclopedia/vixen-estate/observatory-composer-deck.mjs';
import {readFileSync} from 'node:fs';

const sha='a'.repeat(64),rev='b'.repeat(40);
const receipt=()=>({
 schema:'td613.vixen.podium.compose-gate/v1',state:'COMPOSED_PREVIEW_ONLY',
 status:'SUPPORTED',release_authority:false,
 approval:{authorization_kind:'HOST_VERIFIED_SEPARATE_HUMAN',
  score_digest:sha,source_revision:rev,independent_receipt_id:'host-witness'},
 approved_visual_candidates:[{form_id:'UNEXPECTED_GEOMETRY',
  data_contract:'source-linked model observables and transforms'}],
 composition:{score_digest:sha,source_revision:rev,
  computational_score:{visuals:{selected:{id:'UNEXPECTED_GEOMETRY',
   linked_lab_id:'LAB_RC-09',previous_form_id:'HOLONOMY',source_refs:['work:A','work:B']}}},
  changes:[{type:'VISUAL_FORM_CHANGE',source_ids:['work:A','work:B'],visual:{
   form_id:'UNEXPECTED_GEOMETRY',replaces_lab_id:'LAB_RC-09',
   previous_form_id:'HOLONOMY'}}]}
});
function canvas(){return {hidden:true,style:{},width:400,height:250,getContext:()=>({clearRect(){}})}}
test('No attached independent human verifier means HOLD, without painting or replacing the canonical scene',async()=>{
 const c=canvas(),deck=createObservatoryComposerDeck({canvas:c});
 const out=await deck.stage({composeReceipt:receipt(),lab_id:'LAB_RC-09',current_form_id:'HOLONOMY'});
 assert.equal(out.status,'HELD');
 assert.equal(c.hidden,true);
 assert.equal(deck.inspect().current_form_id,null);
});
test('Host-authorized wholly novel renderer changes a targeted preview on the original clock and reverts',async()=>{
 let painted=0,current=true,now=[];
 const c=canvas(),deck=createObservatoryComposerDeck({
  canvas:c,isScoreCurrent:async ({score_digest,source_revision})=>
   current&&score_digest===sha&&source_revision===rev,
  verifyHumanReceipt:async(_r,_a)=>true,
  reviewedRenderers:[{id:'UNEXPECTED_GEOMETRY',source_sha256:'c'.repeat(64),
   review_receipt_id:'independent-renderer-code-review',paintFrame:async(_canvas,o)=>{
    painted++;now.push(o.time);assert.equal(o.host_clock_only,true);
    assert.deepEqual(o.sourceIds,['work:A','work:B']);
    return {geometry:'ORIGINAL_VISUAL_GRAMMAR'};
   }}]
 });
 const staged=await deck.stage({composeReceipt:receipt(),lab_id:'LAB_RC-09',
  current_form_id:'HOLONOMY',frame:{time:0}});
 assert.equal(staged.status,'SUPPORTED_PREVIEW_ONLY');
 assert.equal(c.hidden,false);
 const next=await deck.paint({lab_id:'LAB_RC-09',frame:{time:0.25}});
 assert.equal(next.status,'SUPPORTED_PREVIEW_ONLY');
 assert.deepEqual(now,[0,.25]);assert.equal(painted,2);
 current=false;
 assert.equal((await deck.paint({lab_id:'LAB_RC-09',frame:{time:.5}})).status,'HELD');
 assert.equal(c.hidden,true);
 assert.equal(deck.inspect().current_form_id,null);
});
test('Incorrect target, original form, source identities, or computational Score do not stage',async()=>{
 const c=canvas(),deck=createObservatoryComposerDeck({canvas:c,
  isScoreCurrent:async()=>true,verifyHumanReceipt:async()=>true,
  reviewedRenderers:[{id:'UNEXPECTED_GEOMETRY',source_sha256:'c'.repeat(64),
   review_receipt_id:'review',paintFrame:()=>({})}]});
 const opts={composeReceipt:receipt(),lab_id:'LAB_TCC-01',current_form_id:'CONTROL_PLANES'};
 assert.equal((await deck.stage(opts)).status,'HELD');
 const amended=receipt();amended.composition.changes[0].source_ids=['work:OTHER'];
 assert.equal((await deck.stage({...opts,composeReceipt:amended,lab_id:'LAB_RC-09',current_form_id:'HOLONOMY'})).status,'HELD');
 assert.equal(c.hidden,true);
});
test('Foundry wires Composer preview to its existing host scheduler only',()=>{
 const s=readFileSync(new URL('../app/encyclopedia/vixen-estate/observatory-electric-foundry.mjs',import.meta.url),'utf8');
 const d=readFileSync(new URL('../app/encyclopedia/vixen-estate/observatory-composer-deck.mjs',import.meta.url),'utf8');
 assert.match(s,/createObservatoryComposerDeck/);
 assert.match(s,/stageComposerPreview/);
 assert.match(s,/composerDeck\.paint/);
 assert.doesNotMatch(d,/requestAnimationFrame\s*\(/);
 assert.doesNotMatch(d,/setInterval\s*\(/);
 assert.doesNotMatch(s,/window\.TD613_COMPOSE_OVERRIDE/);
});

test('Reviewed Compose gives only a bounded source-and-score-conditioned visual field, then revokes it on revert',async()=>{
 const c=canvas();const source=receipt();
 source.composition.computational_score.salon_optical_performance={
  score_to_optics_controls:{mesh_intensity:.83,fold_gain:.74}};
 const deck=createObservatoryComposerDeck({
  canvas:c,isScoreCurrent:async()=>true,verifyHumanReceipt:async()=>true,
  reviewedRenderers:[{id:'UNEXPECTED_GEOMETRY',source_sha256:'d'.repeat(64),
   review_receipt_id:'reviewed-module',paintFrame:()=>({mapped:true})}]
 });
 assert.equal(deck.visualField(),null);
 const a=await deck.stage({composeReceipt:source,lab_id:'LAB_RC-09',
  current_form_id:'HOLONOMY',frame:{time:0}});
 assert.equal(a.status,'SUPPORTED_PREVIEW_ONLY');
 const field=deck.visualField();
 assert.equal(field.mesh_strength,.83);
 assert.equal(field.fold_strength,.74);
 assert.deepEqual(field.source_ids,['work:A','work:B']);
 assert.equal(field.canonical_mutation,false);
 assert.equal(field.release_authority,false);
 deck.revert();
 assert.equal(deck.visualField(),null);
});
