/**
 * VIXEN RGI14 · Opaline Electric Couture
 * Atmospheric visual geometry ONLY, performed by Vixen, with no Aperture
 * operational routing. Adapts mathematical principles of D3-periodic and
 * phi-quasiperiodic interference, moire beat geometry and bounded coherence
 * blooms from the operator-supplied Aperture v3.2-alpha study artifact.
 * No source bodies, no remote resources, no scientific validation claims.
 * OPERAHOUSE ≠ OPERA ≠ PERFORMER; protected Experiment B HELD.
 */
import {CARRIERS,PHI,triangular,quasiperiodic,project111} from './observatory-foundry-kernel.mjs';
export const OPAL_COUTURE_CONTRACT=Object.freeze({
 schema:'td613.vixen.opaline-couture/v1',role:'OPERA_VISUAL_ONLY',
 mathematical_kinship:'D3_PHI_MOIRE_LAYER_DIFFERENCE_NOT_EPISTEMIC_TRANSFER',
 source_capture:'EXISTING_SELECTED_WORK_ID_ONLY',empirical_credit:0,
 model_carriers:39,other_estates_mutated:0,experiment_b_flight:'HELD',
 authority:'NONE',operator_still:'motionBtn',reduced_motion:'STILL'
});
const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{const t=clamp(x);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
const P=Object.freeze({
 white:'#FFFEF7',pearl:'#FFF7FC',blonde:'#FFF0A8',
 pink:'#FF4F9F',rose:'#FF9CC9',chrome:'#E4EFF2',
 lilac:'#D7AFFF' /* electric lilac alone, never shadow-plum */
});
function seedFor(ids){
 const text=(Array.isArray(ids)?ids:[]).filter(x=>typeof x==='string').slice(0,2).join('|')||'VIXEN_VISUAL_NEUTRAL';
 let h=2166136261;for(const ch of text){h^=ch.codePointAt(0);h=Math.imul(h,16777619)>>>0;}
 return h;
}
function glint(ctx,x,y,r,color,opacity=1){
 ctx.save();ctx.globalCompositeOperation='screen';
 const glow=ctx.createRadialGradient(x,y,0,x,y,r*5);
 glow.addColorStop(0,'rgba(255,255,247,.92)');
 glow.addColorStop(.09,color==='gold'?'rgba(255,240,168,.60)':'rgba(255,79,159,.58)');
 glow.addColorStop(.55,color==='gold'?'rgba(255,240,168,.07)':'rgba(255,79,159,.06)');
 glow.addColorStop(1,'rgba(255,255,247,0)');
 ctx.globalAlpha=opacity;ctx.fillStyle=glow;
 ctx.fillRect(x-r*5,y-r*5,r*10,r*10);
 ctx.strokeStyle=color==='gold'?P.blonde:P.pearl;
 ctx.globalAlpha=opacity*.9;ctx.lineWidth=.7;ctx.beginPath();
 ctx.moveTo(x-r*2.2,y);ctx.lineTo(x+r*2.2,y);
 ctx.moveTo(x,y-r*2.7);ctx.lineTo(x,y+r*2.7);ctx.stroke();ctx.restore();
}
function beam(ctx,a,b,phase,charge,kind='gold'){
 const points=[],N=16,dx=b.x-a.x,dy=b.y-a.y,dist=Math.max(1,Math.hypot(dx,dy));
 const nx=-dy/dist,ny=dx/dist;
 for(let i=0;i<=N;i++){
  const t=i/N,amp=Math.sin(Math.PI*t)*Math.min(7,dist*.034)*charge;
  const noise=Math.sin(i*4.8+phase*5)+.3*Math.sin(i*11.6-phase);
  points.push([a.x+t*dx+nx*amp*noise,a.y+t*dy+ny*amp*noise]);
 }
 ctx.save();ctx.globalCompositeOperation='screen';
 for(const [width,alpha,color] of [
  [7,.13,kind==='gold'?P.blonde:P.pink],
  [2.4,.47,kind==='gold'?P.blonde:P.rose],
  [.8,.92,P.white]
 ]){
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=alpha*charge;
  ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
  points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
 }
 ctx.restore();
}
function shape(ctx,points,style,width,alpha){
 if(points.length<2)return;
 ctx.save();ctx.globalCompositeOperation='screen';ctx.strokeStyle=style;
 ctx.lineWidth=width;ctx.globalAlpha=alpha;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
 // Smooth catmull-rom cubic segments; avoid angular 1980s polyline meshes.
 for(let i=0;i<points.length-1;i++){
  const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
  ctx.bezierCurveTo(
   p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,
   p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,
   p2[0],p2[1]);
 }
 ctx.stroke();ctx.restore();
}
export function coutureGeometry({width,height,time=0,sourceIds=[]}){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)
  throw new RangeError('COUTURE_VIEWPORT_REQUIRED');
 const W=width,H=height,hash=seedFor(sourceIds),theta=(hash%3991)/3991*TAU;
 const left=W<700?.64:.61,center=W*(left+(1-left)*.45);
 const cy=H*.49,top=H*.10,heightDress=H*.83;
 const projection=project111([hash%199/199,hash%131/131,.4]).projection;
 const wobble=Math.sin(time*.43+theta)*W*.004;
 const waist=t=>t<.44?mix(W*.19,W*.065,smooth(t/.44)):
   mix(W*.065,W*.234,smooth((t-.44)/.56));
 const vertex=(u,t)=>{
  const a=u*TAU+theta*.07,arc=waist(t),beat=.016*
    triangular(36*u+7*t,61*t,{theta:theta*.07})+
    .013*quasiperiodic(27*u,35*t,{phase:theta});
  const radius=arc*(1+beat),depth=.69+.31*Math.cos(a);
  const shift=Math.sin(t*TAU+theta)*W*.006+wobble+projection[0]*W*.004;
  return [
   center+Math.cos(a)*radius*depth+shift,
   top+heightDress*t+Math.sin(a)*H*.019+projection[1]*H*.006
  ];
 };
 const ribs=CARRIERS.map((c,i)=>{
  const u=i/39,points=[];
  for(let j=0;j<=20;j++)points.push(vertex(u,j/20));
  return {index:i,plane:c.plane,near:c.near,mid:c.mid,points};
 });
 const hoops=[];
 for(let i=0;i<15;i++){
  const t=i/14,points=[];
  for(let j=0;j<=48;j++)points.push(vertex(j/48,t));
  hoops.push({t,points});
 }
 return {W,H,hash,theta,time,center,cy,top,heightDress,ribs,hoops,vertex,empirical_credit:0};
}
export function paintOpalineCouture(ctx,m){
 const {W,H,center,cy,time,theta,ribs,hoops,vertex}=m;
 ctx.clearRect(0,0,W,H);
 ctx.save();
 // Architectural placement: right-hand material stage only. Headline,
 // buttons and source selectors remain physically unobscured.
 ctx.beginPath();ctx.rect(W*(W<700?.47:.48),0,W,H);ctx.clip();
 const haze=ctx.createRadialGradient(center,cy,2,center,cy,H*.59);
 haze.addColorStop(0,'rgba(255,255,247,.17)');
 haze.addColorStop(.27,'rgba(255,240,168,.075)');
 haze.addColorStop(.64,'rgba(255,79,159,.045)');
 haze.addColorStop(1,'rgba(255,255,255,0)');
 ctx.globalAlpha=.8+.12*Math.sin(time*.7+theta);
 ctx.fillStyle=haze;ctx.fillRect(W*.45,0,W*.55,H);
 ctx.globalAlpha=1;
 // The dress is glass / porcelain tulle, not a central basket of gray wire.
 const glass=ctx.createLinearGradient(center-W*.18,0,center+W*.20,H);
 glass.addColorStop(0,'rgba(255,255,255,.09)');
 glass.addColorStop(.27,'rgba(255,156,201,.09)');
 glass.addColorStop(.53,'rgba(255,240,168,.035)');
 glass.addColorStop(1,'rgba(255,255,255,.05)');
 const left=[],right=[];
 for(let j=0;j<=20;j++){
  const t=j/20;left.push(vertex(.5,t));right.push(vertex(0,t));
 }
 ctx.save();ctx.globalCompositeOperation='screen';ctx.fillStyle=glass;
 ctx.beginPath();ctx.moveTo(...right[0]);
 for(const p of right.slice(1))ctx.lineTo(...p);
 for(const p of left.reverse())ctx.lineTo(...p);
 ctx.closePath();ctx.fill();ctx.restore();
 // Aperture-family stratigraphy adapted into independently spaced,
 // noncoincident D3 and phi optical folds; slower phase creates moire beats.
 for(let layer=0;layer<2;layer++){
  for(let i=0;i<18;i++){
   const points=[],u=i/17;
   for(let j=0;j<=22;j++){
    const t=j/22;
    const base=vertex((u*.76+(layer?.07:.02))%1,t);
    const d3=triangular(45*u+25*t,62*t,{theta:.1});
    const quasi=quasiperiodic(40*u+13*t,49*t,{phase:theta+time*.04});
    const beat=(layer===0?d3:quasi)*W*.008;
    points.push([base[0]+beat,base[1]]);
   }
   shape(ctx,points,layer?P.rose:P.pearl,.47,(i%5===0?.27:.10));
  }
 }
 // 39 unmerged Loom ribs, with a few high-energy gold seams.
 for(const c of ribs){
  const color=c.near?P.blonde:c.mid?P.pearl:P.rose;
  const emphasize=c.index%9===0;
  shape(ctx,c.points,color,emphasize?1.5:.54,
    c.near?.56:c.mid?.33:.21);
 }
 // Fine transverse chiffon hoops sit behind sparkling seam junctions.
 for(let i=0;i<hoops.length;i++){
  const r=hoops[i],gold=i===0||i===7||i===14;
  shape(ctx,r.points,gold?P.blonde:(i%2?P.rose:P.chrome),
   gold?1.3:.53,gold?.50:.23);
 }
 // The hem is a levitating reflective plinth, not the old giant X.
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let i=0;i<3;i++){
  ctx.beginPath();
  ctx.ellipse(center,topY(m)+H*.045+i*H*.010,
    W*(.18+i*.027),H*(.018+i*.008),0,0,TAU);
  ctx.lineWidth=i===0?2:1;ctx.globalAlpha=i===0?.78:.36;
  ctx.strokeStyle=i===0?P.blonde:P.pink;ctx.stroke();
 }
 ctx.restore();
 // Contracted electric paths terminate within the couture object. They
 // never tear diagonally across the text or the external frontispiece.
 const pulse=.55+.35*Math.sin(time*.8+theta);
 const leftWaist=vertex(.5,.46),rightWaist=vertex(0,.46),
  collar=vertex(.04,.02),hem=vertex(.09,.86);
 beam(ctx,{x:leftWaist[0]-W*.035,y:leftWaist[1]-H*.10},
  rightWaist,time+theta,pulse,'gold');
 beam(ctx,{x:collar[0]+W*.032,y:collar[1]-H*.05},
  {x:collar[0]+W*.055,y:collar[1]+H*.15},time+.6,pulse*.74,'pink');
 beam(ctx,{x:hem[0]+W*.08,y:hem[1]-H*.025},
  {x:hem[0]-W*.04,y:hem[1]+H*.08},time+1.3,pulse*.7,'gold');
 // Deliberate bounded bloom: peaks move with source-dependent moire phases.
 for(let i=0;i<28;i++){
  const u=(i*PHI*.34)%1,t=(i*.137)%1,point=vertex(u,t);
  const energy=Math.pow(clamp((Math.sin(time*(.42+i%4*.08)+i*PHI)+.55)/1.55),4);
  if(energy>.12)glint(ctx,point[0],point[1],.8+2.4*energy,
   i%3===0?'gold':'pink',.35+.57*energy);
 }
 glint(ctx,center,topY(m)-H*.39,3,'gold',.54);
 glint(ctx,center,cy+H*.02,4.6,'gold',.94);
 ctx.restore();
 return Object.freeze({rendered:true,carriers:ribs.length,moire_layers:2,
  source_identity_claim:false,empirical_credit:0});
}
function topY(m){return m.top+m.heightDress*.95;}
function mount(){
 if(typeof document==='undefined'||typeof window==='undefined')return;
 const host=document.getElementById('vixenSynthesisSalon');
 if(!host)return;
 let canvas=null,ctx=null,head=null,last=0,frame=0,raf=0,disposed=false;
 const mq=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const held=()=>mq?.matches||document.getElementById('motionBtn')?.getAttribute('aria-pressed')==='true';
 const status=()=>Object.freeze({
  mounted:!!canvas?.isConnected,frames:frame,still:!!held(),model_carriers:39,
  renderer:'VIXEN_RGI14_OPALINE_COUTURE',empirical_credit:0
 });
 function attach(){
  const next=host.querySelector('.vs-head');
  if(!next||!next.isConnected)return false;
  if(next===head&&canvas?.isConnected)return true;
  canvas?.remove();
  head=next;
  canvas=document.createElement('canvas');
  canvas.className='vixen-opaline-couture';
  canvas.setAttribute('aria-hidden','true');
  canvas.dataset.role='VIXEN_OPERA_VISUAL_ONLY';
  head.insertBefore(canvas,head.firstChild);
  ctx=canvas.getContext('2d',{alpha:true});
  return !!ctx;
 }
 const io=new IntersectionObserver(()=>{if(!disposed)window.requestAnimationFrame(()=>draw(0,true))},{threshold:0});
 const mut=new MutationObserver(()=>{if(head!==host.querySelector('.vs-head'))window.requestAnimationFrame(()=>draw(0,true))});
 mut.observe(host,{childList:true});
 io.observe(host);
 function draw(ms,force=false){
  if(disposed||document.hidden||!attach())return;
  // Source-first interaction wins over ambient frames: the dress changes
  // at a bounded 4.5fps, while CSS can interpolate luminous opacity.
  if(!force&&ms-last<220)return;
  if(!force&&host.getBoundingClientRect().bottom<0)return;
  if(!force&&host.getBoundingClientRect().top>window.innerHeight)return;
  const w=head.clientWidth,h=head.clientHeight;
  if(w<30||h<30)return;
  const dpr=Math.min(window.devicePixelRatio||1,1.25);
  const cw=Math.floor(w*dpr),ch=Math.floor(h*dpr);
  if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const ids=[...host.querySelectorAll('.vs-source-card')].slice(0,2)
   .map(card=>card.querySelector('select')?.value).filter(Boolean);
  const model=cotureModel(w,h,held()?0:ms/1000,ids);
  paintOpalineCouture(ctx,model);
  frame++;last=ms;
 }
 function cotureModel(w,h,t,ids){return coutureGeometry({width:w,height:h,time:t,sourceIds:ids});}
 function tick(ms){
  raf=0;if(disposed)return;
  draw(ms);if(!held()&&!document.hidden)raf=requestAnimationFrame(tick);
 }
 function restart(){
  if(raf)cancelAnimationFrame(raf);
  raf=0;draw(0,true);
  if(!held()&&!document.hidden)raf=requestAnimationFrame(tick);
 }
 const motion=document.getElementById('motionBtn');
 const motionObs=new MutationObserver(restart);
 if(motion)motionObs.observe(motion,{attributes:true,attributeFilter:['aria-pressed']});
 mq?.addEventListener?.('change',restart);
 document.addEventListener('visibilitychange',restart);
 window.addEventListener('resize',restart,{passive:true});
 // First paint follows the original source controls' DOM mount.
 restart();
 window.VIXEN_OPAL_COUTURE=Object.freeze({
  contract:OPAL_COUTURE_CONTRACT,status,
  renderOnce:()=>draw(0,true),
  dispose(){disposed=true;cancelAnimationFrame(raf);io.disconnect();mut.disconnect();
   motionObs.disconnect();mq?.removeEventListener?.('change',restart);
   document.removeEventListener('visibilitychange',restart);
   window.removeEventListener('resize',restart);canvas?.remove();}
 });
}
if(typeof document!=='undefined'){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
}
