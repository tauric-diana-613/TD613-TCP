/**
 * 𝌋 VIXEN CYBERNETICS — ELECTRICAL BREATH / RGI13
 * A source-conditioned VISUAL costume around Vixen's existing research Opera.
 * No image/video texture, WebSocket, external dependency, source mutation,
 * automatic identity inference, or role/authority change.
 *
 * Sources: existing Dome D3 / φ reference samplers, 39 Loom carriers,
 *          and [111] Couture projection from the Vixen Foundry.
 * This is an optical simulation; not evidence, inference, a real-world
 * observation, an independent witness, or a successor to any estate.
 * OPERAHOUSE ≠ OPERA ≠ PERFORMER. Human closure RESERVED; Flight HELD.
 */
import {CARRIERS,PHI,triangular,quasiperiodic,project111}
  from './observatory-foundry-kernel.mjs';

export const MESH_CONTRACT=Object.freeze({
 schema:'td613.vixen.rgi13-electrical-breath/v1',
 estate:'VIXEN_OPERA',surface:'VISUAL_ONLY',
 model_families:Object.freeze(['DOME_D3','DOME_PHI','LOOM_39','COUTURE_111']),
 source_rule:'DECLARED_WORK_SELECTION_OR_NEUTRAL_VIXEN_SEED',
 source_mutation:false,cross_estate_promotion:false,
 empirical_credit:0,experiment_b_flight:'HELD',
 operator_motion_control:'motionBtn[aria-pressed]',
 reduced_motion:'STATIC_ONE_FRAME',auto_deploy:false
});
export const ELECTRIC_COUTURE=Object.freeze({
 pearl:'#FFF8FD',blush:'#FFE3F2',rose:'#FF91AF',
 fuchsia:'#FF3F9E',champagne:'#FFF2A9',core:'#FFFBE2',
 chrome:'#D9E1E8',black:'#08090D'
});
const TAU=Math.PI*2;
const clamp=(n,lo=0,hi=1)=>Math.max(lo,Math.min(hi,Number.isFinite(+n)?+n:lo));
const fract=x=>x-Math.floor(x);
const hash=x=>[...String(x)].reduce((a,c)=>(Math.imul(a,33)+c.codePointAt(0))>>>0,5381);
function visualSeed(ids){
 const clean=Array.isArray(ids)?ids.filter(x=>typeof x==='string'&&x.trim()).slice(0,2):[];
 return {
  hash:hash(clean.length?clean.join('|'):'VIXEN_NEUTRAL_STAGE_ONLY'),
  source_mode:clean.length===2?'DECLARED_WORK_COORDINATES':'NEUTRAL_STAGE_NO_ASSIGNED_WORK'
 };
}
const xy=(x,y)=>({x,y});
/**
 * Pure geometry, no DOM: deterministic for given model inputs.
 * 17 shell hoops × 28 angular stations, plus 39 depth-specific Loom carriers
 * and two transverse D3/φ drapes spanning the viewport.
 */
export function buildLivingMesh({width=1440,height=900,time=0,view='collection',
  sourceIds=[],scroll=0,pointer={x:.5,y:.5},quality='full'}={}){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)
  throw new RangeError('MESH_REQUIRES_POSITIVE_VIEWPORT');
 const w=Math.max(1,width),h=Math.max(1,height);
 const seed=visualSeed(sourceIds);
 const isMobile=w<690;
 const nlat=quality==='low'?11:quality==='medium'?13:17;
 const nlong=quality==='low'?18:quality==='medium'?24:28;
 const route=String(view||'collection');
 const centerX=w*(isMobile?.78:route==='collection'?.765:route==='observatory'?.79:.82);
 const centerY=h*(route==='overview'?.51:.49);
 const scale=Math.min(w*1.12,h*1.14);
 const theta=seed.hash%65521/65521*TAU;
 const projection=project111([
  (seed.hash%991)/991,
  (seed.hash%641)/641,
  clamp(scroll/2400)
 ]).projection;
 const drift=clamp(pointer?.x??.5)*.035*scale;
 const breath=1+.048*Math.sin(time*.72+theta);
 const ring=[];
 for(let i=0;i<nlat;i++){
  const v=-1+2*i/(nlat-1),latitude=[];
  const seamR=scale*(.105+.245*Math.pow(Math.abs(v),1.65))*breath;
  for(let j=0;j<nlong;j++){
   const a=j/nlong*TAU+time*.06+theta*.08;
   const d3=triangular(68*Math.cos(a)+v*102,70*Math.sin(a)+v*51,{theta:.05});
   const phi=quasiperiodic(56*Math.cos(a)+v*45,55*Math.sin(a)-v*42,{phase:theta});
   const radius=seamR*(1+.057*d3+.068*phi);
   const depth=.78+.22*Math.cos(a);
   latitude.push(xy(
    centerX+Math.cos(a)*radius*depth+drift+projection[0]*scale*.027,
    centerY+v*h*.45+Math.sin(a)*scale*.043+projection[1]*scale*.03
   ));
  }
  ring.push(latitude);
 }
 const ribbon=[];
 for(let band=0;band<2;band++){
  const strands=[],rows=quality==='low'?8:quality==='medium'?12:16;
  const steps=quality==='low'?16:quality==='medium'?23:30;
  for(let i=0;i<rows;i++){
   const points=[],q=i/Math.max(1,rows-1);
   for(let j=0;j<steps;j++){
    const u=j/(steps-1);
    const beat=quasiperiodic(u*195+seed.hash%37,q*120,{phase:theta})*.045;
    const leftToRight=u*w;
    let y=band===0 ? 8+q*h*.20 : h*(.77+q*.19);
    y+=Math.sin(u*TAU*(1.1+q*.5)+time*.36+q*PHI)*h*(.025+.04*q);
    y+=beat*h;
    points.push(xy(leftToRight,y));
   }
   strands.push(points);
  }
  ribbon.push(strands);
 }
 const fibers=CARRIERS.map(c=>{
  const s=c.index/39,angle=s*TAU+theta*.12+time*(c.near?.1:c.mid?.04:.018);
  return {
   plane:c.plane,near:c.near,mid:c.mid,
   from:xy(centerX+Math.cos(angle)*scale*.10,centerY+Math.sin(angle)*scale*.16),
   to:xy(centerX+Math.cos(angle)*scale*(.33+.16*s),
    centerY+Math.sin(angle)*scale*(.35+.15*s)),
   depth:c.depth_gain,index:c.index
  };
 });
 const hueSeed=hash(route)%127;
 return Object.freeze({
  schema:MESH_CONTRACT.schema,source_mode:seed.source_mode,
  seed:seed.hash,view:route,width:w,height:h,
  phase:time,brightness:Math.min(1,.62+.14*Math.sin(time*.8+theta)),
  charge:.59+.23*Math.sin(time*1.15+hueSeed*.045),
  ring,ribbon,fibers,center:xy(centerX,centerY),
  nlat,nlong,empirical_credit:0
 });
}
function stroke(ctx,points,color,width,alpha,glow=0){
 if(!points||points.length<2)return;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=alpha;
 // Full-viewport stroke blur is catastrophic in software Chromium; only
 // tiny segments get bounded glow. Brightness comes from alpha layering.
 ctx.shadowColor=color;ctx.shadowBlur=points.length<=3?Math.min(glow,5):0;
 ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
 for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
 ctx.stroke();ctx.restore();
}
function star(ctx,x,y,energy,tint){
 const r=2+9*energy;
 ctx.save();ctx.globalCompositeOperation='screen';
 ctx.lineWidth=.7+energy*.65;ctx.strokeStyle=tint;
 ctx.globalAlpha=.30+energy*.65;ctx.shadowColor=tint;
 ctx.shadowBlur=3+energy*4;ctx.beginPath();
 ctx.moveTo(x-r*1.45,y);ctx.lineTo(x+r*1.45,y);
 ctx.moveTo(x,y-r*1.65);ctx.lineTo(x,y+r*1.65);
 ctx.moveTo(x-r*.42,y-r*.42);ctx.lineTo(x+r*.42,y+r*.42);
 ctx.stroke();ctx.restore();
}
function discharge(ctx,start,end,time,seed,charge,color=ELECTRIC_COUTURE.champagne){
 const intensity=clamp((charge-.14)/.86);
 if(intensity<=.015)return;
 const n=49,dx=end.x-start.x,dy=end.y-start.y;
 const len=Math.max(1,Math.hypot(dx,dy)),px=-dy/len,py=dx/len;
 const points=[];
 const drift=(seed%4099)/4099*TAU;
 for(let i=0;i<=n;i++){
  const t=i/n,env=Math.sin(t*Math.PI);
  const kink=env*Math.min(19,len*.042)*intensity*
    (Math.sin(t*133+time*7+drift)+.37*Math.sin(t*337-time*5+drift));
  points.push(xy(start.x+dx*t+kink*px,start.y+dy*t+kink*py));
 }
 stroke(ctx,points,ELECTRIC_COUTURE.fuchsia,7*intensity,.23*intensity,23);
 stroke(ctx,points,color,3*intensity,.69*intensity,20);
 stroke(ctx,points,ELECTRIC_COUTURE.core,.95*intensity,.87*intensity,10);
 for(let i=9;i<points.length;i+=15){
  const t=i/n,side=i%2?1:-1;
  const root=points[i];
  const tip=xy(root.x+px*side*19*Math.sin(t*TAU),root.y+py*side*24*Math.cos(t*TAU));
  stroke(ctx,[root,tip],color,1.4*intensity,.45*intensity,11);
 }
}
export function paintLivingMesh(ctx,model,{intensity=1}={}){
 if(!ctx||!model?.ring)throw new TypeError('MESH_PAINT_REQUIRES_MODEL_AND_CONTEXT');
 const {width:w,height:h,ring,ribbon,fibers,center,phase:time,seed}=model;
 const power=clamp(intensity);
 ctx.clearRect(0,0,w,h);
 ctx.save();ctx.globalCompositeOperation='screen';
 // The skin is pierced by light rather than filled with an all-over color wash.
 const aureole=ctx.createRadialGradient(center.x,center.y,2,
  center.x,center.y,Math.min(w,h)*.64);
 aureole.addColorStop(0,'rgba(255,251,226,.18)');
 aureole.addColorStop(.28,'rgba(255,145,175,.11)');
 aureole.addColorStop(.69,'rgba(255,210,238,.045)');
 aureole.addColorStop(1,'rgba(255,255,255,0)');
 ctx.globalAlpha=power;ctx.fillStyle=aureole;ctx.fillRect(0,0,w,h);
 ctx.restore();
 // Iridescent mesh in the foyer, header, gallery and Salon; 2 membranes.
 for(let band=0;band<ribbon.length;band++){
  const strands=ribbon[band];
  for(let i=0;i<strands.length;i++){
   const c=i%4===0?ELECTRIC_COUTURE.champagne:
    i%3===0?ELECTRIC_COUTURE.pearl:ELECTRIC_COUTURE.rose;
   stroke(ctx,strands[i],c,.52+(i%4===0?.38:0),(.13+(i%5===0?.22:0))*power,7);
  }
  // Cross warp: the grid remains a connected cloth, not independent ribbons.
  for(let j=0;j<strands[0].length;j+=2){
   const line=strands.map(row=>row[j]);
   stroke(ctx,line,ELECTRIC_COUTURE.blush,.55,.12*power,5);
  }
 }
 // Superposed waist rings + vertical silk-steel ribs from D3/phi.
 for(let i=0;i<ring.length;i++){
  const pts=[...ring[i],ring[i][0]];
  stroke(ctx,pts,i%4===0?ELECTRIC_COUTURE.champagne:ELECTRIC_COUTURE.rose,
    i%4===0?1.4:.75,(.25+(i%4===0?.15:0))*power,i%4===0?14:8);
 }
 for(let j=0;j<ring[0].length;j++){
  const line=ring.map(row=>row[j]);
  stroke(ctx,line,j%5===0?ELECTRIC_COUTURE.core:ELECTRIC_COUTURE.blush,
   j%5===0?1.8:.8,(j%5===0?.5:.28)*power,j%5===0?21:9);
 }
 for(const c of fibers){
  const q=c.index%4;
  const color=c.near?ELECTRIC_COUTURE.champagne:
   c.mid?ELECTRIC_COUTURE.rose:ELECTRIC_COUTURE.chrome;
  stroke(ctx,[c.from,c.to],color,c.near?1.4:.7,
   (c.near?.27:c.mid?.16:.09)*power,c.near?16:7);
  if(c.near&&q===0)star(ctx,c.to.x,c.to.y,.34*power,color);
 }
 const t=time,period=(t*.34)%(Math.PI*2);
 const mainPulse=clamp((Math.sin(period+1.2)+.48)/1.48);
 const altPulse=clamp((Math.sin(period*1.7+3.3)+.35)/1.35);
 discharge(ctx,xy(w*.34,h*.025),xy(center.x,center.y),
  t,seed,.18+mainPulse*.78,ELECTRIC_COUTURE.champagne);
 discharge(ctx,xy(w*.02,h*.94),xy(center.x+w*.06,center.y+h*.035),
  t+.8,seed+67,.14+altPulse*.72,ELECTRIC_COUTURE.fuchsia);
 discharge(ctx,xy(center.x-w*.12,h*.91),xy(w*.99,h*.21),
  t+1.7,seed+301,.14+mainPulse*.65,ELECTRIC_COUTURE.core);
 const nlat=ring.length,nlong=ring[0].length;
 for(let i=0;i<26;i++){
  const a=(i*7+3)%nlat,b=(i*11+5)%nlong;
  const p=ring[a][b];
  const life=Math.pow(clamp((Math.sin(time*(1.4+i%5*.19)+i*PHI)+.32)/1.32),5);
  if(life>.02)star(ctx,p.x,p.y,life*power,
   i%4===0?ELECTRIC_COUTURE.champagne:ELECTRIC_COUTURE.rose);
 }
 // No provenance or authorization content appears in a pixel channel.
 return Object.freeze({
  schema:model.schema,painted:true,source_mode:model.source_mode,
  model_carriers:fibers.length,hoops:nlat,shell_stations:nlong,
  glint_candidates:26,empirical_credit:0
 });
}
export function mountVixenLivingMesh({
 document:doc=globalThis.document,window:win=globalThis.window
}={}){
 if(!doc?.body||!win?.requestAnimationFrame)
  return Object.freeze({mounted:false,reason:'NO_BROWSER_HOST'});
 if(doc.getElementById('vixenLivingMesh')){
  return Object.freeze({mounted:false,reason:'ALREADY_MOUNTED'});
 }
 const canvas=doc.createElement('canvas');
 canvas.id='vixenLivingMesh';canvas.className='vixen-living-mesh';
 canvas.setAttribute('aria-hidden','true');
 canvas.dataset.role='VIXEN_OPERA_VISUAL_ONLY';
 doc.body.appendChild(canvas);
 const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
 if(!ctx){canvas.remove();return Object.freeze({mounted:false,reason:'CANVAS2D_UNAVAILABLE'});}
 const mq=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 let reduced=!!mq?.matches,held=false,raf=0,disposed=false,lastMs=-Infinity;
 let frame=0,last=null,resizeNeeded=true,pausedAt=0,paintCostMs=0;
 let pointer=xy(.5,.5),scroll=win.scrollY||0;
 const width=()=>Math.max(1,win.innerWidth||1),height=()=>Math.max(1,win.innerHeight||1);
 // Work identity derives from one selected Work per source-bound card;
 // the second select in a card is a manifestation, never another Work.
 const readSources=()=>[...doc.querySelectorAll('#vixenSynthesisSalon .vs-source-card')]
  .slice(0,2).map(card=>card.querySelector('select')?.value).filter(Boolean);
 const paused=()=>reduced||held;
 function sample(ms){
  if(disposed||doc.hidden)return;
  const paintStart=win.performance?.now?.()||0;
  const w=width(),h=height();
  if(resizeNeeded||canvas.width===0||canvas.height===0){
   const dpr=Math.min(1.25,Math.max(1,win.devicePixelRatio||1));
   const effective=w<750?Math.min(dpr,1):dpr;
   canvas.width=Math.round(w*effective);
   canvas.height=Math.round(h*effective);
   canvas.style.width=w+'px';canvas.style.height=h+'px';
   ctx.setTransform(effective,0,0,effective,0,0);
   resizeNeeded=false;
  }
  const time=paused()?0:ms/1000;
  const mode=doc.body.dataset.view||'overview';
  const model=buildLivingMesh({
   width:w,height:h,time,scroll,pointer,view:mode,sourceIds:readSources(),
   quality:w<720?'low':'medium'
  });
  last=paintLivingMesh(ctx,model,{intensity:mode==='observatory'?.55:mode==='reference'?.52:.92});
  canvas.dataset.route=mode;canvas.dataset.animation=paused()?'STILL':'LIVE';
  frame++;
  paintCostMs=(win.performance?.now?.()||paintStart)-paintStart;
  // No visual signal grants truth, identity, authorship or release authority.
 }
 function loop(ms){
  raf=0;
  if(disposed||doc.hidden||paused())return;
  // Ambient theatre yields to the research UI: 12 fps mobile, 15 fps desktop.
  const cap=Math.max(width()<750?135:100,Math.min(500,paintCostMs*4));
  if(ms-lastMs>=cap){
   sample(ms);lastMs=ms;
  }
  raf=win.requestAnimationFrame(loop);
 }
 function schedule(){
  if(disposed)return;
  if(raf){win.cancelAnimationFrame(raf);raf=0;}
  if(doc.hidden)return;
  sample(paused()?0:(win.performance?.now?.()||0));
  if(!paused())raf=win.requestAnimationFrame(loop);
 }
 const motion=doc.getElementById('motionBtn');
 held=motion?.getAttribute('aria-pressed')==='true';
 function readMotion(){
  const next=motion?.getAttribute('aria-pressed')==='true';
  if(next!==held){held=next;if(next)pausedAt=frame;schedule();}
 }
 const mutation=typeof win.MutationObserver==='function'
  ?new win.MutationObserver(list=>{
   if(list.some(x=>x.type==='attributes'&&x.target===motion))readMotion();
   if(list.some(x=>x.type==='attributes'&&x.target===doc.body))schedule();
  }):null;
 if(mutation){
  mutation.observe(doc.body,{attributes:true,attributeFilter:['data-view']});
  if(motion)mutation.observe(motion,{attributes:true,attributeFilter:['aria-pressed']});
 }
 const updatePointer=e=>{pointer=xy(clamp(e.clientX/width()),clamp(e.clientY/height()));};
 const updateScroll=()=>{scroll=win.scrollY||0;};
 const updateSize=()=>{resizeNeeded=true;schedule();};
 const updateVisibility=()=>{if(doc.hidden){if(raf)win.cancelAnimationFrame(raf);raf=0;}else schedule();};
 const updateMQ=()=>{reduced=!!mq.matches;schedule();};
 win.addEventListener('pointermove',updatePointer,{passive:true});
 win.addEventListener('scroll',updateScroll,{passive:true});
 win.addEventListener('resize',updateSize,{passive:true});
 doc.addEventListener('visibilitychange',updateVisibility);
 mq?.addEventListener?.('change',updateMQ);
 canvas.addEventListener('contextlost',e=>e.preventDefault());
 schedule();
 const api={
  mounted:true,contract:MESH_CONTRACT,
  status:()=>Object.freeze({
   rendered_frames:frame,route:canvas.dataset.route,
   motion:canvas.dataset.animation,source_mode:last?.source_mode,
   model_carriers:last?.model_carriers,
   paused_at_frame:pausedAt,paint_cost_ms:Math.round(paintCostMs),empirical_credit:0
  }),
  renderOnce:()=>{if(!disposed)sample(0);return last;},
  dispose(){
   disposed=true;if(raf)win.cancelAnimationFrame(raf);
   mutation?.disconnect();
   win.removeEventListener('pointermove',updatePointer);
   win.removeEventListener('scroll',updateScroll);
   win.removeEventListener('resize',updateSize);
   doc.removeEventListener('visibilitychange',updateVisibility);
   mq?.removeEventListener?.('change',updateMQ);canvas.remove();
  }
 };
 return Object.freeze(api);
}
if(typeof document!=='undefined'&&typeof window!=='undefined'){
 const start=()=>{
  // Startup belongs to Vixen's native Opera before any ambient painting.
  // A deferred frame prevents a Canvas software fallback from delaying the
  // foyer's DOMContentLoaded event and all human source controls.
  window.requestAnimationFrame(()=>{
   try {
    const api=mountVixenLivingMesh({document,window});
    Object.defineProperty(window,'VixenLivingMesh',{
     value:api,configurable:true,writable:false,enumerable:false
    });
   } catch(error) {
    // A visual costume must never make the research Opera inoperable.
    console.error('VIXEN_LIVING_MESH_FAIL_OPEN_VISUAL_ONLY',error);
    Object.defineProperty(window,'VixenLivingMesh',{
     value:Object.freeze({mounted:false,reason:'VISUAL_ENGINE_FAILED'}),
     configurable:true,writable:false,enumerable:false
    });
   }
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else if(document.readyState==='interactive')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
}
