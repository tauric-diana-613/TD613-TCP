import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pointOnFieldPath} from '../app/encyclopedia/vixen-estate/vixen-salon-ambient-field.mjs';
import {
 MESH_CONTRACT,ELECTRIC_COUTURE,buildLivingMesh,paintLivingMesh,
 meshOcclusionMode,MOBILE_STACKING_ONLY_MAX_WIDTH,
 MESH_ANIMATION_TARGET_FPS,MESH_VISUAL_TEMPO,meshFrameIntervalMs,adaptMeshPaintQuality
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

test('desktop and mobile particles stay attached to edge-deflected beam geometry',()=>{
 for(const [width,height] of [[390,844],[428,926],[1440,900]]){
  const mesh=buildLivingMesh({width,height,time:4.5,sourceIds:['W_01','W_02']});
  assert.equal(mesh.scene.trails.length,51);
  assert.equal(mesh.fibers.length,39);
  assert(mesh.scene.trails.flatMap(t=>t.points).every(p=>p.length===3&&p.every(Number.isFinite)),
   'Edge deflection must preserve three-dimensional sample vertices');
  const vertices=new Set(mesh.scene.trails.flatMap(t=>t.points));
  for(const trail of mesh.scene.trails){
   assert.strictEqual(trail.points[32],trail.contact,
    'Sewn midpoint must remain an identical shared material vertex');
   assert(trail.pulse.every(Number.isFinite));
   const p=pointOnFieldPath(trail.points,trail.phase);
   for(let k=0;k<3;k++)assert(Math.abs(trail.pulse[k]-p[k])<1e-8,
    'Moving charge must remain attached to the visible beam on '+width+'px');
  }
  for(const edge of mesh.scene.crossings)assert(edge.points.every(p=>vertices.has(p)),
   'The cross-link must attach to the same rendered beam coordinates');
  for(const n of mesh.scene.nodes)assert.strictEqual(n.point,mesh.scene.trails[n.trailId].pulse);
  for(const c of mesh.scene.contacts)assert(vertices.has(c.point));
 }
});
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

test('Observatory first visible host frame paints even in global Still mode',async()=>{
 const foundry=await readFile(new URL('./vixen-estate/observatory-electric-foundry.mjs',root),'utf8');
 assert.match(foundry,/if\(!section\?\.hidden\)\{paint\(true\);indicate\('BOOT'\);start\(\);\}/);
 assert.match(foundry,/else \{state\.renderer\.resize\(\);paint\(true\);if\(state\.phase==='PREWARMED'\)indicate\('ACTIVATED'\);start\(\);\}/);
 const mesh=await readFile(new URL('./vixen-estate/vixen-live-mesh-rgi13.mjs',root),'utf8');
 assert.match(mesh,/if\(paused\(\)&&!force\)return last/);
 assert.match(foundry,/window\.VixenLivingMesh\?\.renderHostFrame\?\.\(\{time:state\.time,view:'observatory'/);
});

test('iPhone scroll uses permanent foreground compositing, never time-lagged rectangle clipping',async()=>{
 assert.equal(MOBILE_STACKING_ONLY_MAX_WIDTH,740);
 for(const width of [320,375,390,428,680,740]){
  assert.equal(meshOcclusionMode(width),'STACKING_ONLY_NO_SCROLL_RECT_MASKS');
 }
 assert.equal(meshOcclusionMode(741),'STACKING_ONLY_NO_SCROLL_RECT_MASKS');
 assert.equal(meshOcclusionMode(1024),'STACKING_ONLY_NO_SCROLL_RECT_MASKS');
 assert.equal(meshOcclusionMode(2560),'STACKING_ONLY_NO_SCROLL_RECT_MASKS');
 const meshSource=await readFile(new URL('./vixen-estate/vixen-live-mesh-rgi13.mjs',root),'utf8');
 const section=meshSource.slice(meshSource.indexOf('function readExclusions('),
  meshSource.indexOf('function draw('));
 assert.match(section,/if\(meshOcclusionMode\(width\(\)\)===\x27STACKING_ONLY_NO_SCROLL_RECT_MASKS\x27\)\{/);
 assert.match(section,/exclusions=\[\];layoutDirty=false/);
 const scrollHandler=meshSource.slice(meshSource.indexOf('const onOuterScroll='),meshSource.indexOf('win.addEventListener(\x27pointermove\x27'));
 assert.match(scrollHandler,/if\(meshOcclusionMode\(width\(\)\)===\x27STACKING_ONLY_NO_SCROLL_RECT_MASKS\x27\)return/);
 assert.match(meshSource,/occlusion_mode:meshOcclusionMode\(width\(\)\),exclusion_count:exclusions.length/);
 const seam=await readFile(new URL('./vixen-estate/vixen-proscenium-seam.css',root),'utf8');
 assert.match(seam,/#view-overview \.vix-entrance-research-door\s*\{\s*position:relative;z-index:2;isolation:isolate;/);
 const light=await readFile(new URL('./vixen-estate/vixen-opaline-couture-rgi14.css',root),'utf8');
 assert.match(light,/#vixenLivingMesh\s*\{\s*z-index:1!important/);
});

test('Vixen optical breath uses 60Hz presentation and visible motion without mobile 12/30Hz caps',async()=>{
 assert.equal(MESH_ANIMATION_TARGET_FPS,60);
 assert.equal(MESH_VISUAL_TEMPO,2.75);
 for(const w of [320,390,428,680,740,1024]){
  assert(Math.abs(meshFrameIntervalMs(w)-1000/60)<1e-10);
 }
 const source=await readFile(new URL('./vixen-estate/vixen-live-mesh-rgi13.mjs',root),'utf8');
 assert.match(source,/ms-lastPaint>=meshFrameIntervalMs\(width\(\)\)-1/);
 assert.match(source,/now-lastObservatoryPaint<meshFrameIntervalMs\(width\(\)\)-1/);
 assert.doesNotMatch(source,/1000\/\(width\(\)<750\?12:24\)/);
 assert.doesNotMatch(source,/MESH_ANIMATION_TARGET_FPS=30/);
 assert.match(source,/target_fps:MESH_ANIMATION_TARGET_FPS,visual_tempo:MESH_VISUAL_TEMPO,presented_fps:presentedFps/);
 const model=buildLivingMesh({width:390,height:844,time:1.25});
 assert.equal(model.scene.trails.length,51);
 assert.equal(model.fibers.length,39);
 assert(model.scene.crossings.length>model.scene.trails.length);
 assert.equal(meshOcclusionMode(390),'STACKING_ONLY_NO_SCROLL_RECT_MASKS');
 const frame0=buildLivingMesh({width:390,height:844,time:0});
 const frame1=buildLivingMesh({width:390,height:844,time:1});
 // Optical time is boosted only within the presentation, not the caller clock.
 assert.equal(frame1.phase,1);
 assert.equal(frame1.scene.time,2.75);
 const p0=frame0.scene.trails[0].phase,p1=frame1.scene.trails[0].phase;
 const chargeDistance=(p1-p0+1)%1;
 assert(Math.abs(chargeDistance-MESH_VISUAL_TEMPO*.085)<1e-8,
  'A charge must visibly traverse about 23% of its strand each second');
 assert.equal(frame1.field.pairs.length,frame0.field.pairs.length,
  'Visual tempo cannot silently remove radiometric source pairs');
});

test('all-width compositor uses stable z1/z2 foreground while retaining exact stage-rect clipping',async()=>{
 for(const width of [390,428,740,741,1024,1440,2560])
  assert.equal(meshOcclusionMode(width),'STACKING_ONLY_NO_SCROLL_RECT_MASKS');
 const source=await readFile(new URL('./vixen-estate/vixen-live-mesh-rgi13.mjs',root),'utf8');
 assert.match(source,/exclusions:rect\?\[\.\.\.exclusions,rect\]:exclusions/);
 assert.match(source,/opticalField:preview,pointer,scroll:0/);
 const light=await readFile(new URL('./vixen-estate/vixen-opaline-couture-rgi14.css',root),'utf8');
 assert.match(light,/#vixenLivingMesh\s*\{\s*z-index:1!important/);
});

test('frame-budget adaptation reduces only raster commands and recovers with hysteresis',()=>{
 let q={stride:1,slow:0,fast:0};
 for(let i=0;i<3;i++)q=adaptMeshPaintQuality(q,{paintMs:14,frameMs:34});
 assert.equal(q.stride,2,'Missed frame deadlines should engage cheaper raster strokes');
 for(let i=0;i<3;i++)q=adaptMeshPaintQuality(q,{paintMs:14,frameMs:34});
 assert.equal(q.stride,4,'Persistent contention should choose quarter-detail raster');
 for(let i=0;i<149;i++)q=adaptMeshPaintQuality(q,{paintMs:1.3,frameMs:16.67});
 assert.equal(q.stride,4,'Do not oscillate quality after a few good frames');
 q=adaptMeshPaintQuality(q,{paintMs:1.3,frameMs:16.67});
 assert.equal(q.stride,2,'Gradually recover on sustained good frame budgets');
 for(let i=0;i<150;i++)q=adaptMeshPaintQuality(q,{paintMs:1.3,frameMs:16.67});
 assert.equal(q.stride,1,'Restore full raster detail when stable');
 for(const width of [390,1440]){
  const model=buildLivingMesh({width,height:width===390?844:900,time:4.25});
  const counts=[];
  for(const stride of [1,2,4]){
   const {context,events}=fakeCtx();
   paintLivingMesh(context,model,{detailStride:stride});
   counts.push(events.filter(x=>x[0]==='L').length);
  }
  assert(counts[0]>counts[1]&&counts[1]>counts[2],
   'Optical raster overload should reduce path commands at '+width+'px');
  assert(counts[2]<counts[0]*.55,'Quarter-detail should materially lower Canvas2D work');
  assert.equal(model.scene.trails.length,51);
  assert.equal(model.fibers.length,39);
  assert(model.scene.crossings.every(x=>x.points.every(p=>p.length===3)));
 }
});
