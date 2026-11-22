/** Vixen's room-wide optical cloth. Salon hands over the SAME prepaint scene
 * and its viewport origin; only the complement of its stage is drawn here.
 * Ordinary rooms use the same cloth grammar and a neutral/declared Work seed.
 * Observatory opts in and owns its phase. One active owner, no host-frame RAF.
 * Artistic display, never source interpretation or empirical evidence.
 * OPERAHOUSE ≠ OPERA ≠ PERFORMER. Human closure RESERVED; Flight HELD.
 */
import {measureCoutureBeats} from './vixen-beat-radiometry-rgi15.mjs';
import {buildSalonField,paintSalonField,pointOnFieldPath} from './vixen-salon-ambient-field.mjs';
import {CARRIERS} from './observatory-foundry-kernel.mjs';
export const MESH_CONTRACT=Object.freeze({
 schema:'td613.vixen.rgi13-electrical-breath/v2',estate:'VIXEN_OPERA',surface:'VISUAL_ONLY',
 model_families:Object.freeze(['DOME_D3','DOME_PHI','LOOM_39','COUTURE_111']),
 source_rule:'DECLARED_WORK_SELECTION_OR_NEUTRAL_VIXEN_SEED',
 source_mutation:false,cross_estate_promotion:false,empirical_credit:0,experiment_b_flight:'HELD',
 operator_motion_control:'motionBtn[aria-pressed]',reduced_motion:'STATIC_ONE_FRAME',auto_deploy:false,
 shared_scene:'IDENTICAL_GEOMETRY_DISJOINT_VIEWPORTS',
 authorized_preview_field:'RENDER_SEEDS_AND_OPTICS_ONLY_NOT_HUMAN_AUTHORITY'
});
export const ELECTRIC_COUTURE=Object.freeze({
 pearl:'#FFF8F3',blush:'#FFE3EB',rose:'#FF91AF',fuchsia:'#FF3F9E',
 champagne:'#FFF2A9',core:'#FFFBE2',chrome:'#D9E1E8',black:'#08090D'
});
const hash=s=>{let n=2166136261;for(const c of s){n^=c.codePointAt(0);n=Math.imul(n,16777619)>>>0}return n};
const smoothstep=(e0,e1,x)=>{const u=Math.max(0,Math.min(1,(x-e0)/Math.max(1e-6,e1-e0)));return u*u*(3-2*u);};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export function normalizeComposerVisualField(input){
 if(!input||input.schema!=='td613.vixen.observatory.visual-field/v1'||
  input.status!=='SUPPORTED_PREVIEW_ONLY'||input.release_authority!==false||
  input.canonical_mutation!==false||!Array.isArray(input.source_ids)||
  !input.source_ids.length||input.source_ids.length>2||
  input.source_ids.some(x=>typeof x!=='string'||x.length<1||x.length>200)||
  typeof input.form_id!=='string'||!input.form_id||input.form_id.length>120||
  !/^[0-9a-f]{64}$/.test(input.score_digest||'')||
  !Number.isFinite(input.mesh_strength)||input.mesh_strength<0||input.mesh_strength>1||
  !Number.isFinite(input.fold_strength)||input.fold_strength<0||input.fold_strength>1)return null;
 return Object.freeze({schema:input.schema,status:input.status,
  source_ids:Object.freeze(input.source_ids.slice()),form_id:input.form_id,
  score_digest:input.score_digest,mesh_strength:input.mesh_strength,
  fold_strength:input.fold_strength,preview_only:true,source_ids_as_seeds_only:true,
  empirical_credit:0,canonical_mutation:false,release_authority:false});
}
// iOS viewport scroll and fixed-canvas paints do not share a synchronous
// layout epoch. Small screens use the already-declared z-index:2 foreground
// instead of sampling animated rectangle cutouts at 125/250ms intervals.
// Prior 390px witness measured about 1ms per paint, while a fixed 30Hz cap
// visibly limited fluidity. Use the normal 60Hz display budget, with one clock.
export const MESH_ANIMATION_TARGET_FPS=60;
// Faster artistic optical phase; human/source/custody clocks stay unchanged.
export const MESH_VISUAL_TEMPO=2.75;
export function meshFrameIntervalMs(_viewportWidth){
 return 1000/MESH_ANIMATION_TARGET_FPS;
}
export const MOBILE_STACKING_ONLY_MAX_WIDTH=740;
/** iOS scrolls fixed wallpaper and document-attached canvases in different compositor epochs.
 * Mobile Salon therefore uses only its local, scroll-attached folded-cuirass field.
 * No new RAF, no phase resampling, no source or custody mutation. */
export function meshScrollCoherencePolicy({view,viewportWidth}={}){
 return view==='collection'&&Number.isFinite(viewportWidth)&&viewportWidth<=MOBILE_STACKING_ONLY_MAX_WIDTH
   ? 'LOCAL_STAGE_ONLY' : 'SHARED_VIEWPORT_FIELD';
}
// Foreground stacking now handles panel coverage on ALL viewport widths.
// Desktop DOM-rectangle mask recomputations previously forced layout while
// painting; avoiding that scroll-epoch race also reduces compositor stalls.
export function meshOcclusionMode(_viewportWidth){
 return 'STACKING_ONLY_NO_SCROLL_RECT_MASKS';
}
// Bounded, reversible raster-detail reduction only when measured frame
// presentation or paint cost exceeds the 60Hz budget. The model, carrier
// identities, joint vertices, temporal phase and source claim remain exact.
export function adaptMeshPaintQuality(state,{paintMs=0,frameMs=0}={}){
 const current=state||{stride:1,slow:0,fast:0};
 const stride=[1,2,4].includes(current.stride)?current.stride:1;
 const budget=1000/MESH_ANIMATION_TARGET_FPS;
 const stressed=paintMs>budget*.46||frameMs>budget*1.42;
 const severe=paintMs>budget*.75||frameMs>budget*2.25;
 if(!Number.isFinite(paintMs)||!Number.isFinite(frameMs)||frameMs<=0)return {...current,stride};
 if(stressed){
  const slow=(current.slow||0)+(severe?2:1);
  if(slow>=5)return {stride:Math.min(4,stride*2),slow:0,fast:0};
  return {stride,slow,fast:0};
 }
 const fast=(current.fast||0)+1;
 if(fast>=150&&stride>1)return {stride:stride/2,slow:0,fast:0};
 return {stride,slow:0,fast};
}
const OCCLUSION_SELECTORS=Object.freeze([
 '.site-header .brand','.site-header button','.site-header a','.vixen-room-rail',
 '#view-overview > #cover','.hero-art',
 '.view:not([hidden]) .vix-entrance-research-door',
 '.view:not([hidden]) .cover-title','.view:not([hidden]) .cover-marginalia',
 '.view:not([hidden]) .cover-bottom','.view:not([hidden]) .cover-spine',
 '.view:not([hidden]) .mobile-wayfinder','.view:not([hidden]) .vixen-foyer-afterword',
 '.view:not([hidden]) .vixen-inquiry-stage','.view:not([hidden]) .view-heading',
 '.view:not([hidden]) .toolbar','.view:not([hidden]) .aia-bar',
 '.view:not([hidden]) .instrument-stage','.view:not([hidden]) #vixenElectricFoundry',
 '.view:not([hidden]) .sensitivity-banner','.view:not([hidden]) #vixenSynthesisSalon',
 '.view:not([hidden]) .vs-head','.view:not([hidden]) .vs-hero-copy',
 '.view:not([hidden]) .vs-source-card','.view:not([hidden]) .vs-rail',
 '.view:not([hidden]) .vs-mix','.view:not([hidden]) .vs-program',
 '.view:not([hidden]) .vs-order','.view:not([hidden]) .vs-status',
 '.view:not([hidden]) .vs-details','.view:not([hidden]) .vs-compose',
 '.view:not([hidden]) .vs-result','.view:not([hidden]) .vs-holonomy-card',
 '.view:not([hidden]) .vs-vernier-card','.view:not([hidden]) .vs-trajectory-memory',
 '.view:not([hidden]) .lexicon-index','.view:not([hidden]) .lexicon-list',
 '.view:not([hidden]) .lexicon-reader','.view:not([hidden]) .gate-pair-card',
 '.view:not([hidden]) .vixen-foyer-copy','.view:not([hidden]) .vixen-foyer-intro',
 '.view:not([hidden]) .vixen-doorways','.view:not([hidden]) .vixen-foyer-frame',
 '.view:not([hidden]) .vixen-foyer-tail','.view:not([hidden]) .archive-directory',
 '.view:not([hidden]) .ci-head','.view:not([hidden]) .ci-cadence-bar','.view:not([hidden]) .ci-card',
 '.view:not([hidden]) .procession-section','.view:not([hidden]) .editorial-questions',
 '.view:not([hidden]) .research-path','.view:not([hidden]) .synthesis-bench',
 '.view:not([hidden]) .formula-card','.view:not([hidden]) .formula-gallery-identity',
 '.view:not([hidden]) .formula-gallery-footer','.view:not([hidden]) .folio-locus',
 '.view:not([hidden]) .hold-panel','.view:not([hidden]) .comp-table',
 '.view:not([hidden]) .comp-table-wrap','.view:not([hidden]) .vixen-rest-bar',
 '.view:not([hidden]) .vixen-overview-drawer','.view:not([hidden]) .protocol-pipeline',
 '.view:not([hidden]) .wf-repertoire-grid',
 '.view:not([hidden]) .vxe-heading','.view:not([hidden]) .vxe-steps',
 '.view:not([hidden]) .vxe-status','.view:not([hidden]) .vxe-work-selector',
 '.view:not([hidden]) .vxe-estate','.view:not([hidden]) .vxe-membrane',
 '.view:not([hidden]) .vxe-tail','.view:not([hidden]) .vxe-result',
 'footer.footer','.vixen-aperture-hud',
 'dialog','[role="dialog"]','.view:not([hidden]) button','.view:not([hidden]) select',
 '.view:not([hidden]) input','.view:not([hidden]) textarea','.view:not([hidden]) summary'
]);
export function buildLivingMesh({width=1440,height=900,time=0,view='overview',sourceIds=[],
 pointer={x:.5,y:.5},scroll=0,opticalField=null}={}){
 if(![width,height,time].every(Number.isFinite)||width<=0||height<=0)
  throw new RangeError('MESH_REQUIRES_POSITIVE_VIEWPORT');
 const preview=normalizeComposerVisualField(opticalField);
 const ids=(preview?.source_ids||sourceIds.slice(0,2)).map(String);
 const seed=hash((ids.join('|')||'VIXEN_NEUTRAL')+(preview?'|'+preview.form_id:''));
 // Magnify the autonomous display clock consistently across measured
 // radiometry and the connected geometry. Host prepaint scenes bypass this.
 const opticalTime=time*MESH_VISUAL_TEMPO;
 const field=measureCoutureBeats({width:360,height:420,time:opticalTime,seed});
 const cx=width*(view==='overview'?.82:.74)+(Math.max(0,Math.min(1,pointer.x))-.5)*16+
  (preview?(preview.mesh_strength-.5)*26:0);
 const cy=height*.52-Math.min(18,Math.max(0,scroll)*.008)+
  (preview?(preview.fold_strength-.5)*14:0);
 const scale=Math.min(width,height)*.82*(preview?.fold_strength!==undefined?
  .78+.44*preview.fold_strength:1);
 const scene=buildSalonField({width,height,time:opticalTime,field,cx,cy,scale,sourceIds:ids});
 const edge=Math.max(24,Math.min(width,height)*.065);
 // Keep every prepaint vertex a single identity through edge deflection.
 // Previous optical copies discarded depth and left pulse/cross-link geometry
 // in the old coordinates, visibly detaching particles and beams.
 const vertexMap=new Map();
 const deflected=scene.trails.map(t=>{
  const points=t.points.map(p=>{
   const known=vertexMap.get(p);if(known)return known;
   const [px,py,pz]=p;
   const dx=px<edge?(1-smoothstep(0,edge,px))*10:(px>width-edge?-(1-smoothstep(0,edge,width-px))*10:0);
   const dy=py<edge?(1-smoothstep(0,edge,py))*8:(py>height-edge?-(1-smoothstep(0,edge,height-py))*8:0);
   if(!dx&&!dy){vertexMap.set(p,p);return p;}
   const sign=t.id%2===0?1:-1;
   const next=[px+dx+dy*.45*sign,py+dy-dx*.45*sign,pz];
   vertexMap.set(p,next);return next;
  });
  return {...t,points,contact:vertexMap.get(t.contact)||t.contact,
   pulse:pointOnFieldPath(points,t.phase)};
 });
 const deflectedScene={...scene,trails:deflected,
  crossings:scene.crossings.map(link=>({...link,
   points:link.points.map(p=>vertexMap.get(p)||p)})),
  nodes:scene.nodes.map(n=>({...n,point:deflected[n.trailId].pulse})),
  contacts:scene.contacts.map(c=>({...c,point:vertexMap.get(c.point)||c.point}))
 };
 return {schema:MESH_CONTRACT.schema,width,height,phase:time,view,field,scene:deflectedScene,seed,
  source_mode:ids.length===2?'DECLARED_WORK_COORDINATES':'NEUTRAL_STAGE_NO_ASSIGNED_WORK',
  visual_form_id:preview?.form_id||null,preview_score_digest:preview?.score_digest||null,
  field_strength:preview?.mesh_strength??null,
  fibers:CARRIERS,empirical_credit:0};
}
/** Partition exclusions into minimal disjoint layers and clip via 'evenodd' viewport complement. */
export function clipMeshExclusions(ctx,width,height,rects){
 const buckets=[];
 const overlaps=(a,b)=>a.left<b.left+b.width&&a.left+a.width>b.left&&a.top<b.top+b.height&&a.top+a.height>b.top;
 for(const r of rects){
  if(!r||![r.left,r.top,r.width,r.height].every(Number.isFinite)||r.width<=0||r.height<=0)continue;
  let placed=false;
  for(const bucket of buckets){
   if(!bucket.some(other=>overlaps(r,other))){bucket.push(r);placed=true;break;}
  }
  if(!placed)buckets.push([r]);
 }
 for(const bucket of buckets){
  ctx.beginPath();
  ctx.rect(0,0,width,height);
  for(const r of bucket)ctx.rect(r.left,r.top,r.width,r.height);
  ctx.clip('evenodd');
 }
}
export function paintLivingMesh(ctx,model,{intensity=1,scene=model.scene,origin={x:0,y:0},
 exclusions=[],detailStride=1}={}){
 if(!ctx||!scene?.trails)throw new TypeError('MESH_PAINT_REQUIRES_MODEL_AND_CONTEXT');
 ctx.clearRect(0,0,model.width,model.height);ctx.save();
 clipMeshExclusions(ctx,model.width,model.height,exclusions);
 ctx.translate(origin.x,origin.y);
 // Same back/front order as the local stage, including the same pulse points.
 paintSalonField(ctx,{scene},{layer:'back',intensity,detailStride});
 paintSalonField(ctx,{scene},{layer:'front',intensity,detailStride});
 ctx.restore();
 return {schema:MESH_CONTRACT.schema,painted:true,source_mode:model.source_mode,
  model_carriers:39,tracks:scene.trails.length,contacts:scene.contacts.filter(c=>c.junctionId!==null).length,
  phase:scene.time,visual_form_id:model.visual_form_id||null,
  preview_score_digest:model.preview_score_digest||null,empirical_credit:0};
}
export function mountVixenLivingMesh({document:doc=globalThis.document,window:win=globalThis.window}={}){
 if(!doc?.body||!win?.requestAnimationFrame)return {mounted:false,reason:'NO_BROWSER_HOST'};
 if(doc.getElementById('vixenLivingMesh'))return {mounted:false,reason:'ALREADY_MOUNTED'};
 const canvas=doc.createElement('canvas');canvas.id='vixenLivingMesh';canvas.className='vixen-living-mesh';
 canvas.dataset.role='VIXEN_OPERA_VISUAL_ONLY';
 canvas.setAttribute('aria-hidden','true');doc.body.append(canvas);
 const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return {mounted:false,reason:'CANVAS2D_UNAVAILABLE'};}
 const mq=win.matchMedia('(prefers-reduced-motion: reduce)'),motion=doc.getElementById('motionBtn');
 let raf=0,layoutRaf=0,disposed=false,time=0,lastTick=null,lastPaint=-Infinity,frames=0,hostFrames=0;
  let lastPresentedMs=null,presentedIntervalMs=0,presentedFps=0;
 let last=null,hostFrame=null,layoutDirty=true,exclusions=[],dpr=0,paintCostMs=0;
 let rasterQuality={stride:1,slow:0,fast:0};
 let pointer={x:.5,y:.5},lastObservatoryPaint=-Infinity,lastBoxCacheMs=-Infinity;
 const width=()=>Math.max(1,win.innerWidth),height=()=>Math.max(1,win.innerHeight);
 const view=()=>doc.body.dataset.view||'overview';
 const stageOwned=()=>['collection','observatory'].includes(view());
 const outsideOpera=()=>doc.body.dataset.activeResearchStage==='OPERAHOUSE';
 const paused=()=>{
  const btn=doc.getElementById('motionBtn')||motion;
  return mq.matches||doc.body.dataset.vixenMotion==='still'||btn?.getAttribute('aria-pressed')==='true';
 };
 const enabled=()=>!outsideOpera()&&meshScrollCoherencePolicy({view:view(),viewportWidth:width()})!=='LOCAL_STAGE_ONLY'&&
   (view()!=='observatory'||doc.body.dataset.vixenOpticalMeshObservatory!=='off');
 const readSources=()=>[...doc.querySelectorAll('#vixenSynthesisSalon .vs-source-card')]
  .slice(0,2).map(card=>card.querySelector('select')?.value).filter(Boolean);
 function readExclusions(force=false){
  // On mobile, clip NO scroll-relative DOM rectangles. The canvas remains
  // animated, but panels use stable foreground stacking and opaque backgrounds.
  if(meshOcclusionMode(width())==='STACKING_ONLY_NO_SCROLL_RECT_MASKS'){
   exclusions=[];layoutDirty=false;lastBoxCacheMs=win.performance.now();
   return;
  }
  // Mask content and accepted art, leaving moving cloth along thresholds,
  // gutters and document edges. Uses active-view scoping + 250ms box cache.
  const now=win.performance.now();
  if(!force&&now-lastBoxCacheMs<250&&exclusions.length){layoutDirty=false;return;}
  lastBoxCacheMs=now;
  exclusions=[...doc.querySelectorAll(OCCLUSION_SELECTORS.join(','))].flatMap(el=>{
   if(!el.getClientRects().length)return [];
   const r=el.getBoundingClientRect();if(r.bottom<0||r.top>height()||r.right<0||r.left>width())return [];
   return [{left:r.left-3,top:r.top-3,width:r.width+6,height:r.height+6}];
  });layoutDirty=false;
 }
 function draw(frame=hostFrame){
  if(disposed||doc.hidden)return;
  const start=win.performance.now(),w=width(),h=height();
  // Reduce pixel fill-rate only if actual missed frames persist. Soft glow
  // survives 1x raster scaling; continuous 60Hz motion takes precedence over
  // sampling a 1.25x surface that the hardware cannot present on time.
  const scaleCap=rasterQuality.stride>=4?1:rasterQuality.stride===2?1.12:1.25;
  const ratio=Math.min(win.devicePixelRatio||1,scaleCap,Math.sqrt(1500000/(w*h)));
  if(canvas.width!==Math.floor(w*ratio)||canvas.height!==Math.floor(h*ratio)||dpr!==ratio){
   canvas.width=Math.floor(w*ratio);canvas.height=Math.floor(h*ratio);dpr=ratio;layoutDirty=true;
  }
  ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
  if(!enabled()){ctx.clearRect(0,0,w,h);canvas.dataset.animation='PARKED';return;}
  if(layoutDirty)readExclusions(true);
  const shared=stageOwned()&&frame?.view===view()?frame:null;
  // A parked optical room cannot synthesize a competing autonomous phase.
  if(stageOwned()&&!shared){canvas.dataset.animation='AWAITING_HOST_HELD_LAST_FRAME';return;}
  // A source-bound machine preview may condition the room-wide optical cloth.
  // The field is a visual projection, never a custody/authorization grant.
  const supplied=shared?.opticalField||
   (!stageOwned()?win.VIXEN_ELECTRIC_FOUNDRY?.approvedVisualField?.():null);
  const preview=normalizeComposerVisualField(supplied);
  const model=shared?.scene?{width:w,height:h,scene:shared.scene,
   source_mode:shared.sourceIds?.length===2?'DECLARED_WORK_COORDINATES':'NEUTRAL_STAGE_NO_ASSIGNED_WORK',
   visual_form_id:preview?.form_id||null,preview_score_digest:preview?.score_digest||null}:
   buildLivingMesh({width:w,height:h,time:shared?.time??time,view:view(),
    sourceIds:shared?.sourceIds??preview?.source_ids??readSources(),
    opticalField:preview,pointer,scroll:0});
  const rect=shared?.stageRect;
  const light=preview?(view()==='observatory'?.22+.40*preview.mesh_strength:
   .45+.5*preview.mesh_strength):(view()==='observatory'?.46:1);
  last=paintLivingMesh(ctx,model,{intensity:clamp(light,0,1),
   detailStride:rasterQuality.stride,
   scene:shared?.scene||model.scene,origin:rect?{x:rect.left,y:rect.top}:{x:0,y:0},
   exclusions:rect?[...exclusions,rect]:exclusions});
  canvas.dataset.route=view();canvas.dataset.animation=paused()||shared?.held?'STILL':shared?'HOST_FRAME':'LIVE';
  frames++;paintCostMs=win.performance.now()-start;
   // Measured presentation cadence (not the 60/120Hz scheduling callback rate).
   // Ignore the first frame and long background-tab interruptions.
   const now=win.performance.now();
   if(lastPresentedMs!==null){
    const dt=now-lastPresentedMs;
    if(dt>0&&dt<250){
     presentedIntervalMs=presentedIntervalMs?presentedIntervalMs*.75+dt*.25:dt;
     presentedFps=1000/presentedIntervalMs;
     rasterQuality=adaptMeshPaintQuality(rasterQuality,{paintMs:paintCostMs,frameMs:dt});
    }
   }
   lastPresentedMs=now;
 }
 function cancel(){if(raf)win.cancelAnimationFrame(raf);raf=0;lastTick=null;}
 function loop(ms){
  raf=0;if(disposed||doc.hidden||outsideOpera()||paused()||stageOwned()){lastTick=null;return;}
  if(lastTick!==null)time+=Math.min(.1,Math.max(0,(ms-lastTick)/1000));lastTick=ms;
  if(layoutDirty||ms-lastPaint>=meshFrameIntervalMs(width())-1){
    draw(null);lastPaint=ms;
   }
  raf=win.requestAnimationFrame(loop);
 }
 function schedule(){
  cancel();if(disposed||doc.hidden)return;
  draw();if(!paused()&&!stageOwned()&&!outsideOpera())raf=win.requestAnimationFrame(loop);
 }
 const changed=()=>{
  layoutDirty=true;lastBoxCacheMs=-Infinity;
  if(hostFrame?.view!==view())hostFrame=null;
  // The optical owner repaints on its own Still transition. Repainting
  // stale host geometry here would publish an intermediate Still frame.
  if(stageOwned()&&hostFrame&&enabled()){cancel();return;}
  schedule();
 };
 const mutation=new win.MutationObserver(changed);
 mutation.observe(doc.body,{attributes:true,attributeFilter:['data-view','data-vixen-motion',
  'data-active-research-stage','data-vixen-optical-mesh-observatory']});
 if(motion)mutation.observe(motion,{attributes:true,attributeFilter:['aria-pressed']});
 const onPointer=e=>{pointer={x:e.clientX/width(),y:e.clientY/height()};};
 const onLayout=()=>{layoutDirty=true;lastBoxCacheMs=-Infinity;
  if(layoutRaf||disposed||doc.hidden)return;
  layoutRaf=win.requestAnimationFrame(()=>{
   layoutRaf=0;
   if(disposed||doc.hidden)return;
   // Salon and Observatory recompute their stage rect without cancelling running animation loops.
   if(stageOwned()){win.dispatchEvent(new win.Event('vixen:fieldlayout'));return;}
   if(paused()||!raf)schedule();
   else{draw(null);lastPaint=win.performance.now();}
  });
 };
 // Window scrolling must not synchronously invalidate hundreds of exclusion
 // rectangles on each wheel tick. Nested manuscript/panel scrolling never
 // changes the outer visible cloth geometry. Keep single active mesh canvas.
 let lastOuterScrollPaint=-Infinity;
 const onOuterScroll=(event)=>{
  // No mobile mask invalidation: a repaint from the previous scroll epoch
  // causes the rectangular pop-in seen on iPhone during momentum scrolling.
  if(meshOcclusionMode(width())==='STACKING_ONLY_NO_SCROLL_RECT_MASKS')return;
  if(event.target&&event.target!==doc&&event.target!==doc.documentElement&&event.target!==win)return;
  const now=win.performance.now();
  if(now-lastOuterScrollPaint<125)return;
  lastOuterScrollPaint=now;
  onLayout();
 };
 win.addEventListener('pointermove',onPointer,{passive:true});
 win.addEventListener('resize',onLayout,{passive:true});
 win.addEventListener('scroll',onOuterScroll,{passive:true,capture:true});
 doc.addEventListener('visibilitychange',changed);doc.addEventListener('vixen:motionchange',changed);
 win.addEventListener('vixen:motionchange',changed);mq.addEventListener('change',changed);
 schedule();
 return Object.freeze({mounted:true,contract:MESH_CONTRACT,
  status:()=>({rendered_frames:frames,route:canvas.dataset.route,motion:canvas.dataset.animation,
   occlusion_mode:meshOcclusionMode(width()),scroll_coherence:meshScrollCoherencePolicy({view:view(),viewportWidth:width()}),exclusion_count:exclusions.length,
   raster_detail_stride:rasterQuality.stride,quality_slow_frames:rasterQuality.slow,
   raster_backing_scale:dpr,
   phase:last?.phase??time,source_mode:last?.source_mode,visual_form_id:last?.visual_form_id||null,
   model_carriers:last?.model_carriers,
   contacts:last?.contacts??0,host_driven_frames:hostFrames,scheduled:!!raf,paint_cost_ms:paintCostMs,
    target_fps:MESH_ANIMATION_TARGET_FPS,visual_tempo:MESH_VISUAL_TEMPO,presented_fps:presentedFps,
    presented_interval_ms:presentedIntervalMs,empirical_credit:0}),
  renderOnce:()=>{readExclusions(true);draw();return last;},
  renderHostFrame:({time:phase=0,sourceIds=[],scene=null,stageRect=null,held=false,
   opticalField=null,view:route=view(),force=false}={})=>{
   if(disposed||doc.hidden||!stageOwned()||route!==view()||!enabled()||!Number.isFinite(phase))return null;
   if(paused()&&!force)return last;
   // Host projections never start a second RAF.
   // The optional Observatory background yields to the primary instrument.
   // Salon always projects its identical scene in the very same frame.
   if(route==='observatory'){
    const now=win.performance.now();
    if(!force&&now-lastObservatoryPaint<meshFrameIntervalMs(width())-1)return last;
    lastObservatoryPaint=now;
   }
   if(force)readExclusions(true);
   hostFrame={time:phase,sourceIds,scene,stageRect,held,view:route,
    opticalField:normalizeComposerVisualField(opticalField)};
   hostFrames++;draw(hostFrame);return last;
  },
  dispose(){disposed=true;cancel();if(layoutRaf)win.cancelAnimationFrame(layoutRaf);layoutRaf=0;mutation.disconnect();canvas.remove();
   win.removeEventListener('pointermove',onPointer);win.removeEventListener('resize',onLayout);
   win.removeEventListener('scroll',onOuterScroll,true);doc.removeEventListener('visibilitychange',changed);
   doc.removeEventListener('vixen:motionchange',changed);win.removeEventListener('vixen:motionchange',changed);
   mq.removeEventListener('change',changed);}
 });
}
if(typeof document!=='undefined'&&typeof window!=='undefined'){
 const start=()=>window.requestAnimationFrame(()=>{
  try{Object.defineProperty(window,'VixenLivingMesh',{value:mountVixenLivingMesh({document,window}),configurable:true});
   window.dispatchEvent(new Event('vixen:fieldlayout'));}
  catch(error){console.error('VIXEN_LIVING_MESH_FAIL_OPEN_VISUAL_ONLY',error);}
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
}
