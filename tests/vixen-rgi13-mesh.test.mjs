import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {
 MESH_CONTRACT,ELECTRIC_COUTURE,buildLivingMesh,paintLivingMesh
} from '../app/encyclopedia/vixen-estate/vixen-live-mesh-rgi13.mjs';
const root=new URL('../app/encyclopedia/',import.meta.url);
const page=await readFile(new URL('./vix-cyb.html',root),'utf8');
const css=await readFile(new URL('./vixen-estate/vixen-electrical-breath-rgi13.css',root),'utf8');
function fakeCtx(){
 const events=[],gradient=()=>({addColorStop:(...a)=>events.push(['stop',...a])});
 const context={
  save(){},restore(){},beginPath(){},rect(){},clip(){},translate(){},moveTo(...a){events.push(['M',...a]);},
  lineTo(...a){events.push(['L',...a]);},stroke(){events.push(['S']);},
  fillRect(...a){events.push(['F',...a]);},clearRect(){},
  createRadialGradient:gradient,createLinearGradient:gradient
 };
 return {context,events};
}
test('The full-page Glinda mesh is a visual costume with no authority',()=>{
 assert.equal(MESH_CONTRACT.estate,'VIXEN_OPERA');
 assert.equal(MESH_CONTRACT.surface,'VISUAL_ONLY');
 assert.equal(MESH_CONTRACT.source_mutation,false);
 assert.equal(MESH_CONTRACT.cross_estate_promotion,false);
 assert.equal(MESH_CONTRACT.auto_deploy,false);
 assert.equal(MESH_CONTRACT.empirical_credit,0);
 assert.equal(MESH_CONTRACT.experiment_b_flight,'HELD');
 assert.deepEqual(MESH_CONTRACT.model_families,
  ['DOME_D3','DOME_PHI','LOOM_39','COUTURE_111']);
});
test('the room mesh has connected sheets and retains the carrier registry',()=>{
 const a=buildLivingMesh({width:1440,height:900,view:'collection',time:0,sourceIds:['W_01','W_02']});
 assert.deepEqual([a.fibers.filter(x=>x.near).length,
  a.fibers.filter(x=>x.mid).length,a.fibers.filter(x=>x.far).length],[6,13,20]);
 assert.equal(a.source_mode,'DECLARED_WORK_COORDINATES');
 assert.equal(a.empirical_credit,0);
 assert(a.scene.crossings.length>a.scene.trails.length);
 assert(a.scene.contacts.every(c=>c.junctionId===null));
});
test('No Work identities are manufactured when no human Work is selected',()=>{
 const a=buildLivingMesh({width:900,height:650});
 assert.equal(a.source_mode,'NEUTRAL_STAGE_NO_ASSIGNED_WORK');
 assert.equal(a.fibers.length,39);
});
test('Changing source, time, page or pointer changes the generated geometry',()=>{
 const props={width:1100,height:720,view:'collection',time:2.2,
  sourceIds:['W_01','W_02'],pointer:{x:.5,y:.5}};
 const a=buildLivingMesh(props),repeat=buildLivingMesh(props);
 const b=buildLivingMesh({...props,sourceIds:['W_01','W_03']});
 const t=buildLivingMesh({...props,time:2.6});
 const r=buildLivingMesh({...props,view:'overview'});
 const p=buildLivingMesh({...props,pointer:{x:.9,y:.3}});
 assert.deepEqual(a.scene.trails,repeat.scene.trails,'Deterministic reconstruction');
 assert.notDeepEqual(a.scene.trails,b.scene.trails,'Two Work coordinates affect light, not source metadata');
 assert.notDeepEqual(a.scene.trails,t.scene.trails,'Breath is real frame-to-frame geometry');
 assert.notEqual(a.scene.cx,r.scene.cx,'A new room relocates the light architecture');
 assert.notDeepEqual(a.scene.trails,p.scene.trails,'Pointer affects optic topology without claiming agency');
});
test('The renderer draws real luminous lines and spark branches, never CSS decoration alone',()=>{
 const model=buildLivingMesh({width:1280,height:840,time:2.1,sourceIds:['W_01','W_02']});
 const {context,events}=fakeCtx(),result=paintLivingMesh(context,model);
 assert.equal(result.painted,true);
 assert.equal(result.model_carriers,39);
 assert.equal(result.tracks,model.scene.trails.length);
 assert.equal(result.contacts,0);
 assert.equal(result.empirical_credit,0);
 assert(events.filter(x=>x[0]==='L').length>1100,
  'Proof requires many actual vector segments, not a gradient screenshot');
 assert(events.filter(x=>x[0]==='S').length>25,
  'The breathing optical membrane has distinct stroked carriers');
});
test('Reduced-motion, Still and portrait geometry have explicit contracts',()=>{
 assert.equal(MESH_CONTRACT.operator_motion_control,'motionBtn[aria-pressed]');
 assert.equal(MESH_CONTRACT.reduced_motion,'STATIC_ONE_FRAME');
 const mobile=buildLivingMesh({width:390,height:844,quality:'low'});
 assert(mobile.scene.trails.flatMap(t=>t.points).every(p=>p.every(Number.isFinite)));
 assert.equal(mobile.fibers.length,39);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/pointer-events:none!important/);
 assert.match(css,/forced-colors:active/);
 assert.match(css,/vixen-arc-champagne:#FFF2A9/);
 assert.equal(ELECTRIC_COUTURE.fuchsia,'#FF3F9E');
});
test('The actual page imports the live module and places RGI13 after RGI12',()=>{
 assert.match(page,/vixen-live-mesh-rgi13\.mjs/);
 assert.match(page,/vixen-electrical-breath-rgi13\.css/);
 assert(page.indexOf('glinda-luminous-proscenium-rgi12.css') <
  page.indexOf('vixen-electrical-breath-rgi13.css'));
 assert(!/Eclipse[–-]Omega/.test(page),'Foreign Opera remains excluded');
 assert.equal((page.match(/id="vixen-corpus-bundle"/g)||[]).length,1);
});
test('Non-finite or absent dimensional geometry is rejected',()=>{
 assert.throws(()=>buildLivingMesh({width:-2,height:500}),/POSITIVE_VIEWPORT/);
 assert.throws(()=>buildLivingMesh({width:500,height:NaN}),/POSITIVE_VIEWPORT/);
});
