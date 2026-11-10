/**
 * 𝌋 VIXEN · THE GLINDA ELECTRIC VEIL · RGI11
 * A native, deterministic visual instrument, not an ambient stock texture.
 *
 * Source: two EXISTING Vixen Work identifiers, route order, and synthetic lag.
 * Optics: Dome-Art D3 / φ samplers; Loom 39 carriers (6/13/20);
 *         Aperture/Couture [111] projection as a spatial contraint.
 * Model only: never an independent empirical witness or manuscript likeness.
 * One host RAF while visible; reduced motion is a single stable frame.
 * OPERAHOUSE ≠ OPERA ≠ PERFORMER; rendering has no custody authority.
 */
import {CARRIERS,triangular,quasiperiodic,project111}
 from './observatory-foundry-kernel.mjs';

export const VEIL_CONTRACT=Object.freeze({
 schema:'emstd613.vixen.glinda-electric-veil/v1',
 subject:'TWO_DECLARED_VIXEN_WORK_COORDINATES_ONLY',
 optical_sources:Object.freeze(['DOME_ART_D3','DOME_ART_PHI','LOOM_39','COUTURE_111']),
 shader_family:'CANVAS2D_MODEL_DERIVED_CONTOURS',
 schedule:'ONE_VISIBILITY_BOUNDED_HOST_RAF',
 observed_physical_light:false,cross_estate_performer_promotion:false,
 experiment_b_flight:'HELD',empirical_credit:0
});
export const GLINDA_LIGHT=Object.freeze({
 rose:'#FF91AF',pearl:'#FFE4F1',orchid:'#F6A5DD',
 chrome:'#F5F0FA',arcFlash:'#FFF2A9',arcCore:'#FFFBE2',
 blackChrome:'#100D16'
});
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(+v)?+v:a));
const hash=s=>Array.from(String(s||'')).reduce((a,c)=>(Math.imul(a,33)+c.codePointAt(0))>>>0,5381);
const TAU=Math.PI*2;
function ellipse(ctx,x,y,rx,ry,tilt,color,width=1,alpha=1){
 ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;
 ctx.beginPath();ctx.ellipse(x,y,Math.max(1,rx),Math.max(1,ry),tilt,0,TAU);ctx.stroke();ctx.restore();
}
function filament(ctx,from,to,charge,time,phase){
 const strength=clamp((charge-.48)/.50);
 if(strength<=0)return;
 const [ax,ay]=from,[bx,by]=to,dx=bx-ax,dy=by-ay;
 const len=Math.max(1,Math.hypot(dx,dy)),perp=[-dy/len,dx/len];
 const knots=26,amp=Math.min(14,len*.075)*strength;
 ctx.save();ctx.globalCompositeOperation='screen';ctx.lineJoin='round';
 for(const [width,color,blur] of [[7,GLINDA_LIGHT.rose,20],[3.5,GLINDA_LIGHT.arcFlash,15],[1,GLINDA_LIGHT.arcCore,7]]){
  ctx.beginPath();
  for(let i=0;i<=knots;i++){
   const u=i/knots,env=Math.sin(Math.PI*u);
   const f=(Math.sin(u*139+time*1.9+phase)*Math.cos(u*67-phase*.7)+
     .35*Math.sin(u*311+phase))*env*amp;
   const x=ax+dx*u+perp[0]*f,y=ay+dy*u+perp[1]*f;
   if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.strokeStyle=color;ctx.lineWidth=width*strength;ctx.shadowBlur=blur;
  ctx.shadowColor=color;ctx.stroke();
 }
 ctx.restore();
}
export function makeVeilFrame({canvas,works=[],route='A_B',lag=30,time=0}={}){
 if(!canvas?.getContext)throw new TypeError('VIXEN_VEIL_NEEDS_CANVAS');
 if(!Array.isArray(works)||works.length!==2||works.some(x=>typeof x!=='string'))
  throw new TypeError('VIXEN_VEIL_REQUIRES_TWO_WORK_IDS');
 const rect=canvas.getBoundingClientRect();
 const w=Math.max(1,Math.round(rect.width||canvas.width||960));
 const h=Math.max(1,Math.round(rect.height||canvas.height||520));
 const dpr=Math.min(2,Math.max(1,canvas.ownerDocument?.defaultView?.devicePixelRatio||1));
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
 }
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return null;
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const order=route==='B_A'?-1:1,lagNorm=clamp(Number(lag)/120);
 const a=hash(works[0]),b=hash(works[1]);
 const residues=project111([(a%101)/100,(b%101)/100,lagNorm]).projection;
 const phase=(a%577)/577*TAU + (b%191)/191;
 const cx=w*(w<560?.56:.70),cy=h*.52,scale=Math.min(w,h);
 // The luminous shell: mathematical spectral relief, not CSS rings or
 // borrowed character imagery. Dome D3 and irrational phi deform every arc.
 const halo=ctx.createRadialGradient(cx,cy,scale*.04,cx,cy,scale*.75);
 halo.addColorStop(0,'rgba(255,228,241,.23)');
 halo.addColorStop(.22,'rgba(255,155,208,.12)');
 halo.addColorStop(.52,'rgba(255,242,169,.06)');
 halo.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let k=0;k<8;k++){
  const r=scale*(.27+k*.043),tw=phase*.12+k*.18+time*.02*order;
  const count=180;
  ctx.beginPath();
  for(let i=0;i<=count;i++){
   const t=i/count*TAU;
   const px=Math.cos(t)*r/scale,py=Math.sin(t)*r/scale;
   const dome=triangular(px*120+residues[0]*45,py*120,{theta:.08});
   const phi=quasiperiodic(px*120,py*120,{phase:tw});
   const energy=.05*dome+.045*phi;
   const rr=r*(1+energy);
   const x=cx+Math.cos(t+tw*.14)*rr*.78;
   const y=cy+Math.sin(t+tw*.14)*rr*1.12;
   if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.strokeStyle=[GLINDA_LIGHT.pearl,GLINDA_LIGHT.rose,GLINDA_LIGHT.arcFlash,GLINDA_LIGHT.orchid][k%4];
  ctx.lineWidth=k%3===0?1.65:.8;ctx.globalAlpha=.10+.30*(1-k/8);
  ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=k%3===0?18:4;
  ctx.stroke();
 }
 // The Loom: all 39 source-independent optical carriers retain their
 // structural near/mid/far 6/13/20 census; no carrier becomes a Work.
 for(const c of CARRIERS){
  const t=c.index/39*TAU+phase,rr=scale*(.26+.39*c.index/39);
  const radiusX=scale*.54,radiusY=scale*.72;
  const x1=cx+Math.cos(t)*radiusX*.9;
  const y1=cy+Math.sin(t)*radiusY*.8;
  const x2=cx+Math.cos(t+Math.PI*.78*order)*rr;
  const y2=cy+Math.sin(t+Math.PI*.78*order)*rr*.95;
  ctx.beginPath();ctx.moveTo(x1,y1);
  ctx.bezierCurveTo(cx+Math.cos(t+time*.08)*rr*.22,cy+Math.sin(t)*rr*.52,
   cx+Math.cos(t*.6)*radiusX*.17,cy+Math.sin(t*.8-time*.06)*radiusY*.20,x2,y2);
  ctx.strokeStyle=c.near?GLINDA_LIGHT.arcFlash:c.mid?GLINDA_LIGHT.pearl:GLINDA_LIGHT.orchid;
  ctx.globalAlpha=c.near?.34:c.mid?.18:.10;
  ctx.shadowBlur=c.near?11:0;ctx.shadowColor=ctx.strokeStyle;
  ctx.lineWidth=c.near?1.3:.65;ctx.stroke();
 }
 ctx.restore();
 // Cut-glass structural seam between separately recorded works.
 const left=[cx-scale*.39,cy+residues[0]*scale*.15];
 const right=[cx+scale*.37,cy-residues[1]*scale*.14];
 ctx.save();ctx.strokeStyle='rgba(255,243,251,.76)';ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(...left);ctx.lineTo(cx,cy-scale*.19);
 ctx.lineTo(...right);ctx.stroke();ctx.restore();
 for(const [x,y] of [left,right]){
  ellipse(ctx,x,y,scale*.020,scale*.020,0,GLINDA_LIGHT.pearl,1.4,.8);
  ellipse(ctx,x,y,scale*.034,scale*.034,0,GLINDA_LIGHT.rose,.75,.4);
 }
 const crossing=(Math.sin(time*1.3+phase)+1)*.5;
 const charge=.49+.30*lagNorm+.18*crossing;
 filament(ctx,[cx-scale*.09,cy-scale*.17],[cx+scale*.12,cy+scale*.13],
  charge,time,phase);
 // Eight bounded glints: six near-Loom carriers plus the TWO distinct
 // source endpoints. They inherit position and intensity from the model,
 // never from procedural randomness or a decorative emoji catalogue.
 const near=CARRIERS.filter(c=>c.near);
 const glints=near.map(c=>{
  const angle=(c.index/39)*TAU+phase+time*.065*order;
  const radius=scale*(.20+.16*((c.index%7)/7));
  return [cx+Math.cos(angle)*radius*.88,cy+Math.sin(angle)*radius];
 }).concat([left,right]);
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let i=0;i<glints.length;i++){
  const [gx,gy]=glints[i],energy=clamp(charge+.17*Math.sin(phase+i*1.7+time*1.5));
  const alpha=clamp((energy-.57)*1.75);
  if(alpha<.04)continue;
  const ray=(i%3===0?13:8)*alpha+2;
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=GLINDA_LIGHT.arcFlash;
  ctx.lineWidth=i<6?1.3:1.7;ctx.shadowColor=GLINDA_LIGHT.arcFlash;
  ctx.shadowBlur=17;ctx.beginPath();
  ctx.moveTo(gx-ray,gy);ctx.lineTo(gx+ray,gy);
  ctx.moveTo(gx,gy-ray*1.4);ctx.lineTo(gx,gy+ray*1.4);
  ctx.moveTo(gx-ray*.4,gy-ray*.4);ctx.lineTo(gx+ray*.4,gy+ray*.4);
  ctx.stroke();ctx.restore();
 }
 ctx.restore();
 ctx.save();ctx.globalCompositeOperation='screen';
 const spark=ctx.createRadialGradient(cx,cy,0,cx,cy,scale*.16);
 spark.addColorStop(0,'rgba(255,251,226,.50)');
 spark.addColorStop(.08,'rgba(255,242,169,.30)');
 spark.addColorStop(.35,'rgba(255,145,175,.13)');
 spark.addColorStop(1,'rgba(255,145,175,0)');
 ctx.fillStyle=spark;ctx.fillRect(0,0,w,h);ctx.restore();
 return Object.freeze({
  frame_class:'SIMULATED_OPTICAL_COMPOSITION',
  carriers:CARRIERS.length,work_ids:[...works],route,lag:clamp(Number(lag),0,120),
  arc_charge:Math.round(charge*10000)/10000,arc_glints:glints.length,empirical_credit:0
 });
}
export function mountSalonVeil(canvas,getState){
 const win=canvas?.ownerDocument?.defaultView;
 if(!win||typeof getState!=='function')
  return Object.freeze({mounted:false,reason:'NO_VISUAL_HOST'});
 let raf=0,disposed=false,visible=true,frame=0,last=null,lastFrameMs=-Infinity;
 const reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches||false;
 // A calibrated optical stage, not a 60-FPS CPU tax: 20 FPS maximum while
 // visible, one static draw when reduced motion is requested.
 const frameBudgetMs=50;
 const show=(ms)=>{
  raf=0;
  if(disposed||!visible||win.document.hidden)return;
  if(!reduced&&Number.isFinite(ms)&&ms-lastFrameMs<frameBudgetMs){
   raf=win.requestAnimationFrame(show);return;
  }
  if(Number.isFinite(ms))lastFrameMs=ms;
  frame+=1;
  const data=getState();
  if(data?.works?.length===2)last=makeVeilFrame({canvas,...data,time:reduced?0:Number.isFinite(ms)?ms/1000:0});
  if(!reduced)raf=win.requestAnimationFrame(show);
 };
 const schedule=()=>{
  if(disposed)return;
  if(raf)win.cancelAnimationFrame(raf);
  raf=0;show();
 };
 const intersection=typeof win.IntersectionObserver==='function'
  ?new win.IntersectionObserver(entries=>{
   visible=entries.some(e=>e.isIntersecting);
   if(visible)schedule();
   else if(raf){win.cancelAnimationFrame(raf);raf=0;}
  },{threshold:.02}):null;
 intersection?.observe(canvas);
 const ro=typeof win.ResizeObserver==='function'
  ?new win.ResizeObserver(()=>{if(reduced)schedule()}):null;
 ro?.observe(canvas);
 win.document.addEventListener('visibilitychange',schedule);
 schedule();
 return Object.freeze({
  mounted:true,contract:VEIL_CONTRACT,
  getStatus:()=>Object.freeze({frames:frame,last,visible}),
  renderOnce:()=>{if(disposed)return null;last=makeVeilFrame({canvas,...getState(),time:0});return last},
  dispose(){disposed=true;if(raf)win.cancelAnimationFrame(raf);
   intersection?.disconnect();ro?.disconnect();
   win.document.removeEventListener('visibilitychange',schedule);}
 });
}
