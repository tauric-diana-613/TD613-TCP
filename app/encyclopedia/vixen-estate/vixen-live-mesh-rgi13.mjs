/** Vixen's room-wide optical cloth. Salon hands over the SAME prepaint scene
 * and its viewport origin; only the complement of its stage is drawn here.
 * Ordinary rooms use the same cloth grammar and a neutral/declared Work seed.
 * Observatory opts in and owns its phase. One active owner, no host-frame RAF.
 * Artistic display, never source interpretation or empirical evidence.
 * OPERAHOUSE ≠ OPERA ≠ PERFORMER. Human closure RESERVED; Flight HELD.
 */
import {measureCoutureBeats} from './vixen-beat-radiometry-rgi15.mjs';
import {buildSalonField,paintSalonField} from './vixen-salon-ambient-field.mjs';
import {CARRIERS} from './observatory-foundry-kernel.mjs';
export const MESH_CONTRACT=Object.freeze({
 schema:'td613.vixen.rgi13-electrical-breath/v2',estate:'VIXEN_OPERA',surface:'VISUAL_ONLY',
 model_families:Object.freeze(['DOME_D3','DOME_PHI','LOOM_39','COUTURE_111']),
 source_rule:'DECLARED_WORK_SELECTION_OR_NEUTRAL_VIXEN_SEED',
 source_mutation:false,cross_estate_promotion:false,empirical_credit:0,experiment_b_flight:'HELD',
 operator_motion_control:'motionBtn[aria-pressed]',reduced_motion:'STATIC_ONE_FRAME',auto_deploy:false,
 shared_scene:'IDENTICAL_GEOMETRY_DISJOINT_VIEWPORTS'
});
export const ELECTRIC_COUTURE=Object.freeze({
 pearl:'#FFF8F3',blush:'#FFE3EB',rose:'#FF91AF',fuchsia:'#FF3F9E',
 champagne:'#FFF2A9',core:'#FFFBE2',chrome:'#D9E1E8',black:'#08090D'
});
const hash=s=>{let n=2166136261;for(const c of s){n^=c.codePointAt(0);n=Math.imul(n,16777619)>>>0}return n};
const smoothstep=(e0,e1,x)=>{const u=Math.max(0,Math.min(1,(x-e0)/Math.max(1e-6,e1-e0)));return u*u*(3-2*u);};
const OCCLUSION_SELECTORS=Object.freeze([
 '.site-header .brand','.site-header button','.site-header a','.vixen-room-rail',
 '.hero-art',
 '.view:not([hidden]) .vs-hero-copy','.view:not([hidden]) .vs-source-card',
 '.view:not([hidden]) .vs-rail','.view:not([hidden]) .vs-compose',
 '.view:not([hidden]) .vs-result','.view:not([hidden]) .vs-holonomy-card',
 '.view:not([hidden]) .vs-vernier-card','.view:not([hidden]) .vs-trajectory-memory',
 '.view:not([hidden]) .view-heading','.view:not([hidden]) .lexicon-reader',
 '.view:not([hidden]) .lexicon-index','.view:not([hidden]) .gate-pair-card',
 '.view:not([hidden]) .vixen-foyer-copy','.view:not([hidden]) .vixen-foyer-intro',
 '.view:not([hidden]) .vixen-doorways','.view:not([hidden]) .vixen-foyer-frame',
 '.view:not([hidden]) .vixen-foyer-tail','.view:not([hidden]) .archive-directory',
 '.view:not([hidden]) .procession-section','.view:not([hidden]) .editorial-questions',
 '.view:not([hidden]) .research-path','#vixenElectricFoundry',
 '.view:not([hidden]) .synthesis-bench','.view:not([hidden]) .formula-card',
 '.view:not([hidden]) .folio-locus','.view:not([hidden]) .hold-panel',
 '.view:not([hidden]) .comp-table','.view:not([hidden]) .vxe-heading',
 '.view:not([hidden]) .vxe-steps','.view:not([hidden]) .vxe-status',
 '.view:not([hidden]) .vxe-work-selector','.view:not([hidden]) .vxe-estate',
 '.view:not([hidden]) .vxe-membrane','.view:not([hidden]) .vxe-tail',
 '.view:not([hidden]) .vxe-result','.vixen-aperture-hud',
 'dialog','[role="dialog"]','.view:not([hidden]) button','.view:not([hidden]) select',
 '.view:not([hidden]) input','.view:not([hidden]) textarea','.view:not([hidden]) summary'
]);
export function buildLivingMesh({width=1440,height=900,time=0,view='overview',sourceIds=[],
 pointer={x:.5,y:.5},scroll=0}={}){
 if(![width,height,time].every(Number.isFinite)||width<=0||height<=0)
  throw new RangeError('MESH_REQUIRES_POSITIVE_VIEWPORT');
 const ids=sourceIds.slice(0,2).map(String),seed=hash(ids.join('|')||'VIXEN_NEUTRAL');
 const field=measureCoutureBeats({width:360,height:420,time,seed});
 const cx=width*(view==='overview'?.82:.74)+(Math.max(0,Math.min(1,pointer.x))-.5)*16;
 const cy=height*.52-Math.min(18,Math.max(0,scroll)*.008);
 const scene=buildSalonField({width,height,time,field,cx,cy,scale:Math.min(width,height)*.82,sourceIds:ids});
 const edge=Math.max(24,Math.min(width,height)*.065);
 const deflected=scene.trails.map(t=>({
  ...t,
  points:t.points.map(([px,py])=>{
   const dx=px<edge?(1-smoothstep(0,edge,px))*10:(px>width-edge?-(1-smoothstep(0,edge,width-px))*10:0);
   const dy=py<edge?(1-smoothstep(0,edge,py))*8:(py>height-edge?-(1-smoothstep(0,edge,height-py))*8:0);
   if(!dx&&!dy)return [px,py];
   const sign=t.id%2===0?1:-1;
   return [px+dx+dy*.45*sign,py+dy-dx*.45*sign];
  })
 }));
 const deflectedScene={...scene,trails:deflected};
 return {schema:MESH_CONTRACT.schema,width,height,phase:time,view,field,scene:deflectedScene,seed,
  source_mode:ids.length===2?'DECLARED_WORK_COORDINATES':'NEUTRAL_STAGE_NO_ASSIGNED_WORK',
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
 exclusions=[]}={}){
 if(!ctx||!scene?.trails)throw new TypeError('MESH_PAINT_REQUIRES_MODEL_AND_CONTEXT');
 ctx.clearRect(0,0,model.width,model.height);ctx.save();
 clipMeshExclusions(ctx,model.width,model.height,exclusions);
 ctx.translate(origin.x,origin.y);
 // Same back/front order as the local stage, including the same pulse points.
 paintSalonField(ctx,{scene},{layer:'back',intensity});
 paintSalonField(ctx,{scene},{layer:'front',intensity});
 ctx.restore();
 return {schema:MESH_CONTRACT.schema,painted:true,source_mode:model.source_mode,
  model_carriers:39,tracks:scene.trails.length,contacts:scene.contacts.filter(c=>c.junctionId!==null).length,
  phase:scene.time,empirical_credit:0};
}
export function mountVixenLivingMesh({document:doc=globalThis.document,window:win=globalThis.window}={}){
 if(!doc?.body||!win?.requestAnimationFrame)return {mounted:false,reason:'NO_BROWSER_HOST'};
 if(doc.getElementById('vixenLivingMesh'))return {mounted:false,reason:'ALREADY_MOUNTED'};
 const canvas=doc.createElement('canvas');canvas.id='vixenLivingMesh';canvas.className='vixen-living-mesh';
 canvas.dataset.role='VIXEN_OPERA_VISUAL_ONLY';
 canvas.setAttribute('aria-hidden','true');doc.body.append(canvas);
 const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return {mounted:false,reason:'CANVAS2D_UNAVAILABLE'};}
 const mq=win.matchMedia('(prefers-reduced-motion: reduce)'),motion=doc.getElementById('motionBtn');
 let raf=0,disposed=false,time=0,lastTick=null,lastPaint=-Infinity,frames=0,hostFrames=0;
 let last=null,hostFrame=null,layoutDirty=true,exclusions=[],dpr=0,paintCostMs=0;
 let pointer={x:.5,y:.5},lastObservatoryPaint=-Infinity,lastBoxCacheMs=-Infinity;
 const width=()=>Math.max(1,win.innerWidth),height=()=>Math.max(1,win.innerHeight);
 const view=()=>doc.body.dataset.view||'overview';
 const stageOwned=()=>['collection','observatory'].includes(view());
 const outsideOpera=()=>doc.body.dataset.activeResearchStage==='OPERAHOUSE';
 const paused=()=>{
  const btn=doc.getElementById('motionBtn')||motion;
  return mq.matches||doc.body.dataset.vixenMotion==='still'||btn?.getAttribute('aria-pressed')==='true';
 };
 const enabled=()=>!outsideOpera()&&(view()!=='observatory'||doc.body.dataset.vixenOpticalMeshObservatory!=='off');
 const readSources=()=>[...doc.querySelectorAll('#vixenSynthesisSalon .vs-source-card')]
  .slice(0,2).map(card=>card.querySelector('select')?.value).filter(Boolean);
 function readExclusions(force=false){
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
  const ratio=Math.min(win.devicePixelRatio||1,1.25,Math.sqrt(1500000/(w*h)));
  if(canvas.width!==Math.floor(w*ratio)||canvas.height!==Math.floor(h*ratio)||dpr!==ratio){
   canvas.width=Math.floor(w*ratio);canvas.height=Math.floor(h*ratio);dpr=ratio;layoutDirty=true;
  }
  ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
  if(!enabled()){ctx.clearRect(0,0,w,h);canvas.dataset.animation='PARKED';return;}
  if(layoutDirty)readExclusions();
  const shared=stageOwned()&&frame?.view===view()?frame:null;
  // A parked optical room cannot synthesize a competing autonomous phase.
  if(stageOwned()&&!shared){ctx.clearRect(0,0,w,h);canvas.dataset.animation='WAITING_FOR_HOST';return;}
  const model=shared?.scene?{width:w,height:h,scene:shared.scene,
   source_mode:shared.sourceIds?.length===2?'DECLARED_WORK_COORDINATES':'NEUTRAL_STAGE_NO_ASSIGNED_WORK'}:
   buildLivingMesh({width:w,height:h,time:shared?.time??time,view:view(),sourceIds:shared?.sourceIds??readSources(),pointer});
  const rect=shared?.stageRect;
  last=paintLivingMesh(ctx,model,{intensity:view()==='observatory'?.46:1,
   scene:shared?.scene||model.scene,origin:rect?{x:rect.left,y:rect.top}:{x:0,y:0},
   exclusions:rect?[...exclusions,rect]:exclusions});
  canvas.dataset.route=view();canvas.dataset.animation=paused()||shared?.held?'STILL':shared?'HOST_FRAME':'LIVE';
  frames++;paintCostMs=win.performance.now()-start;
 }
 function cancel(){if(raf)win.cancelAnimationFrame(raf);raf=0;lastTick=null;}
 function loop(ms){
  raf=0;if(disposed||doc.hidden||outsideOpera()||paused()||stageOwned()){lastTick=null;return;}
  if(lastTick!==null)time+=Math.min(.1,Math.max(0,(ms-lastTick)/1000));lastTick=ms;
  if(ms-lastPaint>=1000/(width()<750?12:24)){draw(null);lastPaint=ms;}
  raf=win.requestAnimationFrame(loop);
 }
 function schedule(){
  cancel();if(disposed||doc.hidden)return;
  draw();if(!paused()&&!stageOwned()&&!outsideOpera())raf=win.requestAnimationFrame(loop);
 }
 const changed=()=>{
  layoutDirty=true;
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
 const onLayout=()=>{layoutDirty=true;
  // Salon must recompute its stage rect; a retained host projection cannot
  // be translated using a stale rectangle while scrolling in Still.
  if(stageOwned()){win.dispatchEvent(new win.Event('vixen:fieldlayout'));return;}
  schedule();
 };
 win.addEventListener('pointermove',onPointer,{passive:true});
 win.addEventListener('resize',onLayout,{passive:true});win.addEventListener('scroll',onLayout,{passive:true,capture:true});
 doc.addEventListener('visibilitychange',changed);doc.addEventListener('vixen:motionchange',changed);
 win.addEventListener('vixen:motionchange',changed);mq.addEventListener('change',changed);
 schedule();
 return Object.freeze({mounted:true,contract:MESH_CONTRACT,
  status:()=>({rendered_frames:frames,route:canvas.dataset.route,motion:canvas.dataset.animation,
   phase:last?.phase??time,source_mode:last?.source_mode,model_carriers:last?.model_carriers,
   contacts:last?.contacts??0,host_driven_frames:hostFrames,scheduled:!!raf,paint_cost_ms:paintCostMs,empirical_credit:0}),
  renderOnce:()=>{readExclusions(true);draw();return last;},
  renderHostFrame:({time:phase=0,sourceIds=[],scene=null,stageRect=null,held=false,view:route=view(),force=false}={})=>{
   if(disposed||doc.hidden||!stageOwned()||route!==view()||!enabled()||!Number.isFinite(phase))return null;
   if(paused()&&!force)return last;
   // Host projections never start a second RAF.
   // The optional Observatory background yields to the primary instrument.
   // Salon always projects its identical scene in the very same frame.
   if(route==='observatory'){
    const now=win.performance.now();
    if(!force&&now-lastObservatoryPaint<100)return last;
    lastObservatoryPaint=now;
   }
   if(force)readExclusions(true);
   hostFrame={time:phase,sourceIds,scene,stageRect,held,view:route};hostFrames++;draw(hostFrame);return last;
  },
  dispose(){disposed=true;cancel();mutation.disconnect();canvas.remove();
   win.removeEventListener('pointermove',onPointer);win.removeEventListener('resize',onLayout);
   win.removeEventListener('scroll',onLayout,true);doc.removeEventListener('visibilitychange',changed);
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
