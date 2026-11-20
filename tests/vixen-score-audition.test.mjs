import test from 'node:test';
import assert from 'node:assert/strict';
import {buildVisualScoreAuditions,buildVisualAuditionGallery,AUDITION_SCHEMA} from
 '../app/encyclopedia/vixen-estate/observatory-score-auditions.mjs';

function candidate(i,{title,scene,kind='CANDIDATE_READY_FOR_REVIEW'}={}){
 return {
  id:'NOVEL_GRAMMAR_'+i,title:title||'Unanticipated morphology '+i,
  kind:'OPEN_FORM_PROPOSAL',family:'UNBOUNDED_MATHEMATICAL_FORM_'+i,
  fitness:Number((.55+i*.027).toFixed(4)),status:kind,
  source_refs:['source:'+i],linked_lab_id:'LAB_RC-09',
  previous_form_id:'HOLONOMY',renderer_installed:false,
  requirements:kind==='CANDIDATE_READY_FOR_REVIEW'?[]:['SOURCE_LOCATOR_REQUIRED'],
  data_mapping:{channels:[{observable:'x'+i+'(t)',units:'dimensionless',
   visual_channel:'operator-specified geometry '+i}]},
  visual_grammar:{description:'A separately proposed form with independent coordinates',
   primitives:[i%3===0?'branching filaments':i%3===1?'phase field':'cell lattice'],
   composition_rules:['retain observational distinction'],
   ...(scene?{preview_scene:scene}:{})}
 };
}
test('One eligible proposal yields exactly one standalone HTML study and a gallery',()=>{
 const p=buildVisualScoreAuditions({proposed:[candidate(1)]});
 assert.equal(p.schema,AUDITION_SCHEMA);
 assert.equal(p.eligible_count,1);
 assert.equal(p.held_count,0);
 assert.equal(p.candidates.length,1);
 assert.match(p.candidates[0].standalone_html,/<!doctype html>/i);
 assert.match(p.candidates[0].standalone_html,/SOURCE/iu);
 assert.equal((p.gallery_html.match(/<iframe /g)||[]).length,1);
 assert.match(p.gallery_html,/STOP BEFORE COMPOSE/);
 assert.equal(p.release_authority,false);
 assert.equal(p.canonical_writes,0);
});
test('Seven distinct qualifying mathematical grammars each receive their own visual study',()=>{
 const proposals=Array.from({length:7},(_,i)=>candidate(i));
 const p=buildVisualScoreAuditions({proposed:proposals});
 assert.equal(p.eligible_count,7);
 assert.equal(p.candidates.length,7);
 assert.equal((p.gallery_html.match(/<iframe /g)||[]).length,7);
 assert.equal(new Set(p.candidates.map(c=>c.standalone_html)).size,7);
 for(let i=0;i<7;i++){
  assert.equal(p.candidates[i].id,'NOVEL_GRAMMAR_'+i);
  assert.match(p.candidates[i].standalone_html,/NOT A COMPUTED EMPIRICAL RESULT/);
  assert.match(p.candidates[i].standalone_html,/Actual renderer/);
  assert.equal(p.candidates[i].actual_renderer_installed,false);
 }
});
test('Every eligible proposal is shown; held, unverified proposals remain disclosed but unrendered',()=>{
 const proposals=[candidate(0),candidate(1,{kind:'HELD_MISSING_EVIDENCE_OR_CONTRACT'}),candidate(2)];
 const p=buildVisualScoreAuditions({proposed:proposals});
 assert.deepEqual(p.candidates.map(c=>c.id),['NOVEL_GRAMMAR_0','NOVEL_GRAMMAR_2']);
 assert.equal(p.held_count,1);
 assert.equal(p.held[0].id,'NOVEL_GRAMMAR_1');
 assert.match(p.gallery_html,/SOURCE_LOCATOR_REQUIRED/);
});
test('Declarative scene encodes different geometries without executing user script or fetching resources',()=>{
 const scene={layers:[
  {kind:'polygon',points:[[.12,.21],[.65,.16],[.87,.75]],fill:'none',stroke:'cyan'},
  {kind:'circle',cx:.5,cy:.5,r:.15,fill:'none',stroke:'champagne'},
  {kind:'text',x:.2,y:.7,text:'A <script>alert(1)</script>'}
 ]};
 const p=buildVisualScoreAuditions({proposed:[candidate(0,{
  title:'<img src=x onerror=alert(1)>',scene
 })]});
 const html=p.candidates[0].standalone_html;
 assert.match(html,/<polygon points=/);
 assert.match(html,/<circle cx=/);
 assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.match(html,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
 assert.doesNotMatch(html,/<script\b|<img\b/);
 assert.doesNotMatch(html,/<iframe\b|<link\b| src="https?:|fetch\(/);
 assert.match(html,/Content-Security-Policy/);
 assert.match(p.gallery_html,/sandbox=""/);
});
test('Invalid declarative scene never becomes executable SVG and receives a clearly schematic study',()=>{
 const scene={layers:[{kind:'path',d:'M 0 0 <script>alert(1)</script>',stroke:'rose'}]};
 const p=buildVisualScoreAuditions({proposed:[candidate(1,{scene})]});
 assert.match(p.candidates[0].standalone_html,/GENERATED_GRAMMAR_STORYBOARD/);
 assert.doesNotMatch(p.candidates[0].standalone_html,/<script\b/);
});
test('No universal seven-card cutoff or fixed list of accepted scientific rendering families',()=>{
 const proposals=Array.from({length:20},(_,i)=>candidate(i));
 const p=buildVisualScoreAuditions({proposed:proposals});
 assert.equal(p.eligible_count,20);
 assert.equal((p.gallery_html.match(/<iframe /g)||[]).length,20);
 assert.throws(()=>buildVisualAuditionGallery(Array.from({length:25},()=>({}))),/HELD_AUDITION_COUNT/);
});
