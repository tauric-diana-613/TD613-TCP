/**
 * Vixen Electric Foundry · Computed Instrument Score / RGI09.
 *
 * Distinct from the optical shader: this is legible VECTOR GEOMETRY for the
 * actual Vixen formula staged. Its mathematical anchors come from the
 * Vixen-corpus analysis, never from the borrowed optics engines.
 *
 * Same host-owned clock as the optical renderer. No own RAF, randomness,
 * external data, source mutation or scientific promotion.
 */
import {fiveClockTicks,project111,singularValues2} from './observatory-foundry-kernel.mjs';
export const SCORE_CONTRACT=Object.freeze({
 schema:'emstd613.vixen.computational-score/v1',
 subject:'EMSTD613_CANONICAL_FORMULA',
 timebase:'HOST_FOUNDRY_FRAME',
 observed_physical_results:false,
 graphical_labels_are_not_evidence:true,
 separate_opera_source_promotion:false
});
const TAU=Math.PI*2;
const ink=Object.freeze({
 graphite:'#24282A',nickel:'#667078',porcelain:'#F6F4F0',
 pink:'#FF91AF',arc:'#FFF2A9',rose:'#FF639E',
 opal:'#9DBCC1'
});
const clip=(v,a=0,b=1)=>Math.min(b,Math.max(a,Number.isFinite(+v)?+v:a));
function stroke(ctx,color,width=1,blur=0){
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.shadowBlur=blur;
 ctx.shadowColor=color;ctx.lineJoin='round';ctx.lineCap='round';
}
function line(ctx,a,b,color,width=1,blur=0){
 ctx.save();stroke(ctx,color,width,blur);ctx.beginPath();ctx.moveTo(...a);
 ctx.lineTo(...b);ctx.stroke();ctx.restore();
}
function poly(ctx,points,color,width=1,blur=0){
 ctx.save();stroke(ctx,color,width,blur);ctx.beginPath();
 points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();ctx.restore();
}
function ring(ctx,cx,cy,r,color,w=1.2,alpha=1,start=0,end=TAU,blur=0){
 ctx.save();ctx.globalAlpha=alpha;stroke(ctx,color,w,blur);ctx.beginPath();
 ctx.arc(cx,cy,r,start,end);ctx.stroke();ctx.restore();
}
function bubble(ctx,cx,cy,r,col){
 ctx.save();ctx.shadowColor=col;ctx.shadowBlur=19;ctx.fillStyle=col;
 ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.fill();ctx.restore();
}
function serif(ctx,str,x,y,size=15,color=ink.porcelain,align='left'){
 ctx.save();ctx.font='italic '+size+'px Georgia,serif';ctx.textAlign=align;
 ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=3;
 ctx.fillText(str,x,y);ctx.restore();
}
function mono(ctx,str,x,y,size=10,color=ink.arc,align='left'){
 ctx.save();ctx.font='600 '+size+'px ui-monospace,monospace';
 ctx.letterSpacing='1px';ctx.textAlign=align;
 ctx.fillStyle=color;ctx.fillText(str,x,y);ctx.restore();
}
function graduated(ctx,cx,cy,r,t,amount=42){
 for(let i=0;i<amount;i++){
  const a=TAU*i/amount;
  const length=i%(amount/6)===0?14:6;
  const start=[cx+Math.cos(a)*(r-length),cy+Math.sin(a)*(r-length)];
  const end=[cx+Math.cos(a)*r,cy+Math.sin(a)*r];
  line(ctx,start,end,i%7===0?ink.arc:ink.porcelain,i%7===0?1.5:.55);
 }
}
function diamond(ctx,px,py,r,col){
 poly(ctx,[[px,py-r],[px+r,py],[px,py+r],[px-r,py],[px,py-r]],col,1.6,7);
 bubble(ctx,px,py,1.7,col);
}
function glassPlane(ctx,points,color,alpha=.11){
 ctx.save();ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));
 ctx.closePath();ctx.fillStyle=color;ctx.globalAlpha=alpha;ctx.fill();ctx.restore();
 poly(ctx,[...points,points[0]],color,1.6,8);
}

function smokeGlass(ctx,width,height,model,time){
 // One local compositor under the computed diagram. Its radial absorption
 // is stage-space optics, not a replacement of the original Vixen background.
 // Leaving a dark optical window around the instrument avoids the previous
 // overbright tiled field competing with source mathematics.
 const cx=width*.5,cy=height*.52,r=Math.min(width,height)*.62;
 ctx.save();
 ctx.fillStyle='rgba(8,11,14,.21)';
 ctx.fillRect(0,0,width,height);
 const glass=ctx.createRadialGradient(cx,cy,r*.04,cx,cy,r);
 glass.addColorStop(0,'rgba(8,11,14,.69)');
 glass.addColorStop(.48,'rgba(14,19,23,.58)');
 glass.addColorStop(.70,'rgba(18,22,26,.28)');
 glass.addColorStop(1,'rgba(8,11,14,.035)');
 ctx.fillStyle=glass;
 ctx.fillRect(0,0,width,height);
 // Light slits follow synthetic voltage and temporal phase. Grey-nickel
 // mirror edges stay subordinate to the pink/pearl research score.
 const sweep=(Math.sin(time*.23+model.twist*3)+1)*.5;
 const slit=ctx.createLinearGradient(width*sweep-width*.12,0,width*sweep+width*.12,height);
 slit.addColorStop(0,'rgba(246,244,240,0)');
 slit.addColorStop(.49,'rgba(246,244,240,.015)');
 slit.addColorStop(.5,'rgba(255,242,169,.047)');
 slit.addColorStop(.51,'rgba(255,145,175,.015)');
 slit.addColorStop(1,'rgba(246,244,240,0)');
 ctx.fillStyle=slit;ctx.fillRect(0,0,width,height);
 ctx.restore();
}
function computedArc(ctx,from,to,charge,time,phase=0){
 // Only explicit simulated charge drives a lightning path. Endpoints
 // are supplied by the current mathematical instrument geometry, rather
 // than a random visual particle generator.
 if(charge<.58)return;
 const q=clip((charge-.58)/.42),steps=34;
 const dx=to[0]-from[0],dy=to[1]-from[1];
 const d=Math.max(1,Math.hypot(dx,dy));
 const nx=-dy/d,ny=dx/d;
 const amplitude=Math.min(14,d*.085)*q;
 const points=[];
 for(let i=0;i<=steps;i++){
  const u=i/steps;
  const env=Math.sin(Math.PI*u);
  const jitter=(Math.sin(u*131+phase+time*2.9)*
   Math.cos(u*71+phase*.8-time*1.7)+
   .35*Math.sin(u*287+time*3.9))*.65*env*amplitude;
  points.push([from[0]+dx*u+nx*jitter,from[1]+dy*u+ny*jitter]);
 }
 poly(ctx,points,ink.pink,5.2*q,21);
 poly(ctx,points,ink.arc,2.7*q,15);
 poly(ctx,points,ink.porcelain,.8*q,8);
 for(const u of [.27,.63,.79]){
  const i=Math.floor(u*steps),start=points[i];
  const end=[start[0]+nx*d*.075*q+dx*.07,
   start[1]+ny*d*.075*q+dy*.07];
  poly(ctx,[start,
   [start[0]+(end[0]-start[0])*.45+ny*amplitude,
    start[1]+(end[1]-start[1])*.45-nx*amplitude],
   end],ink.arc,1.2*q,12);
 }
}
function sourceSeam(ctx,cx,cy,r,params){
 // Two archival loci never collapse into one frame. Their joint path
 // intersects a computed seam while preserving independent endpoints.
 const sep=r*.8,phi=params.twist*Math.PI;
 const A=[cx-sep,cy+Math.sin(phi)*r*.25];
 const B=[cx+sep,cy-Math.sin(phi)*r*.25];
 ring(ctx,A[0],A[1],r*.3,ink.pink,1.2,.7);
 ring(ctx,B[0],B[1],r*.3,ink.arc,1.2,.7);
 line(ctx,A,[cx,cy],ink.pink,1.6,12);
 line(ctx,B,[cx,cy],ink.arc,1.6,12);
 diamond(ctx,A[0],A[1],8,ink.pink);diamond(ctx,B[0],B[1],8,ink.arc);
 mono(ctx,'SOURCE A',A[0],A[1]-r*.35,10,ink.pink,'center');
 mono(ctx,'SOURCE B',B[0],B[1]-r*.35,10,ink.arc,'center');
}
function control(ctx,w,h,params,time){
 const cx=w*.5,cy=h*.54,r=Math.min(w,h)*.33;
 const pitch=.1+params.gain*.42,delta=.22+params.witness*.48;
 const family=[
  {n:'S',t:'SEMANTIC',col:ink.pink,x:-.78,y:.27,skew:pitch},
  {n:'W',t:'WITNESS',col:ink.arc,x:0,y:-.45,skew:-delta},
  {n:'A',t:'ACTUATOR',col:ink.opal,x:.78,y:.27,skew:pitch*.6}
 ];
 for(const d of family){
  const tx=cx+r*d.x,ty=cy+r*d.y,rx=r*.38,ry=r*.2;
  const points=[
   [tx-rx,ty-ry],[tx+rx,ty-ry+r*d.skew],
   [tx+rx*.82,ty+ry+r*d.skew],[tx-rx*.82,ty+ry]
  ];
  glassPlane(ctx,points,d.col,.10+.12*params.voltage);
  ring(ctx,tx,ty,r*.145,d.col,1.5,.9);
  mono(ctx,d.n,tx,ty+7,21,d.col,'center');
  mono(ctx,d.t,tx,ty+ry+26,10,d.col,'center');
  const to=[cx+r*d.x*.25,cy+r*d.y*.22];
  line(ctx,[tx,ty],to,d.col,1.3,9);
  if(d.n==='W')computedArc(ctx,[tx,ty],to,params.voltage,time,1.7);
 }
 ring(ctx,cx,cy,r*.27,ink.porcelain,1.4,.74,Math.PI*.2,Math.PI*1.85,11);
 const alive=params.witness>.5&&params.voltage>.3;
 bubble(ctx,cx,cy,alive?5:3,alive?ink.arc:ink.pink);
 mono(ctx,alive?'GUARDED IN MODEL':'ACTUATION HELD',
  cx,cy+r*.48,10,alive?ink.arc:ink.pink,'center');
 graduated(ctx,cx,cy,r*.91,time,48);
}
function clocks(ctx,w,h,params,time){
 const ticks=fiveClockTicks(Math.round(120*params.gain));
 const cx=w*.49,cy=h*.51,r=Math.min(w,h)*.41;
 const colors=[ink.pink,ink.arc,ink.porcelain,ink.opal,ink.rose];
 for(let i=0;i<ticks.length;i++){
  const rr=r-i*r*.135,phase=(ticks[i].tick%73)/73*TAU+time*(.06+i*.035);
  ring(ctx,cx,cy,rr,colors[i],1.4+i*.17,.73);
  graduated(ctx,cx,cy,rr,0,36);
  const end=[cx+Math.cos(phase)*rr,cy+Math.sin(phase)*rr];
  line(ctx,[cx,cy],end,colors[i],.8+(5-i)*.18,7);
  diamond(ctx,...end,4+i*.4,colors[i]);
  const label=[ctx,w,h,i];
  mono(ctx,['k','n','τ','W','48k'][i],cx+Math.cos(-.9)*rr,
   cy+Math.sin(-.9)*rr,11,colors[i],'center');
 }
 bubble(ctx,cx,cy,5,ink.porcelain);
 mono(ctx,'FIVE CLOCKS ≠ ONE TIMEBASE',cx,cy+r+25,10,ink.arc,'center');
}
function algedonic(ctx,w,h,params,time){
 const x0=w*.13,x1=w*.91,y0=h*.14,y1=h*.82;
 const ww=x1-x0,hh=y1-y0;
 const alpha=.05+.9*params.gain,trigger=.65;
 const arr=[];
 let ema=0;
 for(let i=0;i<14;i++){
  const raw=i===5?params.voltage:0;
  ema=alpha*raw+(1-alpha)*ema;
  arr.push({raw,ema});
 }
 const pt=(i,v)=>[x0+(i/13)*ww,y1-v*hh];
 for(const fraction of [0,.25,.5,.75,1]){
  const y=y1-fraction*hh;
  line(ctx,[x0,y],[x1,y],ink.nickel,.7);
  mono(ctx,String(fraction.toFixed(2)),x0-14,y+3,9,ink.porcelain,'right');
 }
 const thresholdY=y1-trigger*hh;
 line(ctx,[x0,thresholdY],[x1,thresholdY],ink.arc,1.75,8);
 mono(ctx,'THRESHOLD 0.65',x1,thresholdY-11,10,ink.arc,'right');
 poly(ctx,arr.map((a,i)=>pt(i,a.raw)),ink.pink,2.5,12);
 poly(ctx,arr.map((a,i)=>pt(i,a.ema)),ink.porcelain,2,9);
 const spike=pt(5,params.voltage);
 diamond(ctx,spike[0],spike[1],8,ink.pink);
 computedArc(ctx,spike,[spike[0]+ww*.26,thresholdY],
  params.voltage,time,params.gain*6.);
 if(params.voltage>=trigger){
  for(let i=0;i<9;i++){
   const t=i/9;
   const x=spike[0]+Math.cos(time*1.6+i*2.4)*ww*.08*t;
   const y=spike[1]-hh*(.15*t)+Math.sin(i*5+time)*hh*.027;
   if(i)line(ctx,[lastX,lastY],[x,y],i%2?ink.arc:ink.porcelain,1.3,10);
   var lastX=x,lastY=y;
  }
 }
 mono(ctx,'RAW IMPULSE',x0+4,y0-10,11,ink.pink);
 mono(ctx,'EMA RESPONSE',x1,y0-10,11,ink.porcelain,'right');
}
function couture(ctx,w,h,params,time){
 const cx=w*.5,cy=h*.54,r=Math.min(w,h)*.33;
 const skew=r*(.18+.26*params.twist);
 const plane=[
  [cx-r*.87,cy-r*.25],[cx+r*.63,cy-r*.25+skew],
  [cx+r*.82,cy+r*.45+skew],[cx-r*.68,cy+r*.45]
 ];
 glassPlane(ctx,plane,ink.pink,.17);
 const basis=[
  {x:r*.65,y:0,col:ink.pink,name:'e₁'},
  {x:r*.3,y:r*.42,col:ink.arc,name:'e₂'},
  {x:-r*.25,y:-r*.72,col:ink.porcelain,name:'e₃'}
 ];
 basis.forEach(v=>{
  line(ctx,[cx,cy],[cx+v.x,cy+v.y],v.col,1.9,7);
  diamond(ctx,cx+v.x,cy+v.y,5,v.col);
  serif(ctx,v.name,cx+v.x+8,cy+v.y-5,16,v.col);
 });
 const v=[params.gain,params.witness,params.voltage];
 const p=project111(v);
 const origin=[cx-r*.06,cy+r*.13];
 const projected=[origin[0]+p.projection[0]*r*.75,
  origin[1]-p.projection[1]*r*.72];
 const unresolved=[projected[0]+p.nullspace_component[0]*r*.35,
  projected[1]-p.nullspace_component[2]*r*.35];
 line(ctx,origin,projected,ink.arc,3,16);
 line(ctx,projected,unresolved,ink.porcelain,1.4,7);
 diamond(ctx,...projected,7,ink.arc);
 ring(ctx,...projected,15,ink.arc,1.4,.7);
 mono(ctx,'P⊥ v',projected[0]+14,projected[1]-16,11,ink.arc);
 mono(ctx,'ker P · UNOBSERVED',cx,cy+r*.83,10,ink.pink,'center');
}
function rank(ctx,w,h,params,time){
 const cx=w*.51,cy=h*.53,r=Math.min(w,h)*.31;
 const mat=[[1,.2+params.gain*.3],[.1+params.twist*.2,.3+params.voltage*.5]];
 const sv=singularValues2(mat);
 const a=r*Math.min(1.2,sv.sigma_max);
 const b=r*Math.min(1.0,sv.sigma_min);
 const ph=time*.13+params.twist*.28;
 ctx.save();ctx.translate(cx,cy);ctx.rotate(ph);
 ctx.beginPath();ctx.ellipse(0,0,a,b,0,0,TAU);
 ctx.fillStyle='rgba(255,145,175,.095)';ctx.fill();
 stroke(ctx,ink.arc,2.3,17);ctx.stroke();
 ctx.beginPath();ctx.ellipse(0,0,r*.94,r*.94,0,0,TAU);
 stroke(ctx,ink.porcelain,1.0,5);ctx.stroke();
 line(ctx,[-a,0],[a,0],ink.arc,1.3,7);
 line(ctx,[0,-b],[0,b],ink.pink,1.3,7);
 diamond(ctx,a,0,6,ink.arc);
 diamond(ctx,0,-b,6,ink.pink);
 ctx.restore();
 mono(ctx,'σMAX = '+String(sv.sigma_max),cx,cy-r-23,11,ink.arc,'center');
 mono(ctx,'σMIN = '+String(sv.sigma_min),cx,cy+r+26,11,ink.pink,'center');
 mono(ctx,'RANK '+String(sv.rank)+' · '+sv.classification,cx,cy+5,10,ink.porcelain,'center');
}
function xor(ctx,w,h,params,time){
 const x0=w*.14,y0=h*.19,ww=w*.73,hh=h*.59;
 const columns=4;
 const phases=[
  {label:'X',pattern:[0,0,1,1],col:ink.pink},
  {label:'Y',pattern:[0,1,0,1],col:ink.arc},
  {label:'Z = X⊕Y',pattern:[0,1,1,0],col:ink.porcelain}
 ];
 for(let k=0;k<phases.length;k++){
  const obj=phases[k],base=y0+k*hh*.34;
  mono(ctx,obj.label,x0-10,base+15,12,obj.col,'right');
  const points=[];
  for(let i=0;i<columns;i++){
   const px=x0+i*ww/(columns-1),val=obj.pattern[i];
   points.push([px,base+hh*.16-val*hh*.13]);
  }
  for(let i=0;i<points.length-1;i++){
   const [ax,ay]=points[i],[bx,by]=points[i+1];
   const mid=[bx,ay];
   line(ctx,[ax,ay],mid,obj.col,2.1,11);
   line(ctx,mid,[bx,by],obj.col,2.1,9);
  }
  points.forEach((p,i)=>diamond(ctx,...p,4.3+(Math.sin(time*1.8+i+params.twist*2)+1)*1.5,obj.col));
 }
 const xc=x0+ww*.5,yc=y0+hh*.6;
 ring(ctx,xc,yc,Math.min(ww,hh)*.26,ink.arc,1.6,.55);
 mono(ctx,'I(X;Z)=0  ·  I(X,Y;Z)=1 bit',
  xc,y0+hh+24,10,ink.arc,'center');
}
function holonomy(ctx,w,h,params,time,labId){
 const cx=w*.5,cy=h*.52,r=Math.min(w,h)*.33;
 const dTheta=(.15+params.twist*.72)*Math.PI;
 ring(ctx,cx,cy,r,ink.porcelain,1.3,.65);
 ring(ctx,cx,cy,r*.64,ink.pink,1.5,.8,0,TAU-dTheta,8);
 const a0=[cx+r*.64,cy],a1=[cx+Math.cos(TAU-dTheta)*r*.64,cy+Math.sin(TAU-dTheta)*r*.64];
 diamond(ctx,a0[0],a0[1],6,ink.arc);
 diamond(ctx,a1[0],a1[1],6,ink.pink);
 line(ctx,a0,a1,ink.arc,2.2,12);
 computedArc(ctx,a0,a1,params.voltage,time,1.1);
 graduated(ctx,cx,cy,r*.92,time,48);
 mono(ctx,`${labId} · HOLONOMY DEFICIT Δθ = ${(dTheta*180/Math.PI).toFixed(1)}°`,cx,cy+r+24,10,ink.arc,'center');
}
function quotient87(ctx,w,h,params,time,labId){
 const cx=w*.5,cy=h*.52,r=Math.min(w,h)*.33;
 const leftCx=cx-r*.52,rightCx=cx+r*.52;
 ring(ctx,leftCx,cy,r*.48,ink.pink,1.6,.85);
 ring(ctx,rightCx,cy,r*.36,ink.arc,1.6,.85);
 for(let i=0;i<9;i++){
  const a=TAU*i/9+time*.08;
  diamond(ctx,leftCx+Math.cos(a)*r*.32,cy+Math.sin(a)*r*.32,3.5,ink.pink);
 }
 for(let i=0;i<6;i++){
  const a=-TAU*i/6-time*.08;
  diamond(ctx,rightCx+Math.cos(a)*r*.22,cy+Math.sin(a)*r*.22,3.5,ink.arc);
 }
 line(ctx,[leftCx+r*.48,cy],[rightCx-r*.36,cy],ink.porcelain,1.8,9);
 mono(ctx,'54 ADMISSIBLE',leftCx,cy-r*.56,10,ink.pink,'center');
 mono(ctx,'33 RESIDUAL',rightCx,cy-r*.46,10,ink.arc,'center');
 mono(ctx,`${labId} · π_c4(87) = 54 ⊔ 33 QUOTIENT`,cx,cy+r*.78,10,ink.porcelain,'center');
}
function torusSe(ctx,w,h,params,time,labId){
 const cx=w*.5,cy=h*.52,r=Math.min(w,h)*.34;
 const pts=[];
 for(let i=0;i<=72;i++){
  const u=TAU*i/72;
  const rr=r*(.68+.24*Math.cos(3*u+time*.4+params.twist*TAU));
  pts.push([cx+Math.cos(u)*rr,cy+Math.sin(u)*rr*.68]);
 }
 poly(ctx,pts,ink.pink,2.1,11);
 ring(ctx,cx,cy,r*.42,ink.arc,1.4,.75);
 graduated(ctx,cx,cy,r*.95,time,36);
 mono(ctx,`${labId} · S_e ≡ ([x+y] = z + 1) CARRY SYMMETRY`,cx,cy+r*.88,10,ink.arc,'center');
}
function foldSeam(ctx,w,h,params,time,labId){
 const cx=w*.5,cy=h*.52,r=Math.min(w,h)*.33;
 const sep=r*(.26+.34*params.gain);
 const skew=(params.twist-.5)*r*.38;
 poly(ctx,[[cx-r*.78,cy-sep],[cx,cy-sep+skew],[cx+r*.78,cy-sep]],ink.pink,2.0,10);
 poly(ctx,[[cx-r*.78,cy+sep],[cx,cy+sep-skew],[cx+r*.78,cy+sep]],ink.arc,2.0,10);
 for(let i=-3;i<=3;i++){
  const x=cx+i*r*.22;
  line(ctx,[x,cy-sep+(i===0?skew:0)],[x,cy+sep-(i===0?skew:0)],ink.porcelain,1.1,6);
 }
 ring(ctx,cx,cy,r*.9,ink.nickel,.9,.55);
 diamond(ctx,cx,cy,7,ink.arc);
 mono(ctx,`${labId} · F(r)=|T(r)−Q(r)| SEAM GAP`,cx,cy+r+24,10,ink.arc,'center');
}
function fourierSpectrum(ctx,w,h,params,time,labId){
 const x0=w*.15,y0=h*.22,ww=w*.7,hh=h*.56;
 const N=9,wave=[];
 for(let i=0;i<=48;i++){
  const u=i/48,ang=u*TAU*2;
  let sum=0;
  for(let k=1;k<=4;k++){
   const amp=(1/k)*(.4+.6*params.gain);
   sum+=amp*Math.sin(k*ang+time*(.4+.2*k)+params.twist*k);
  }
  wave.push([x0+u*ww,y0+hh*.38-sum*hh*.22]);
 }
 poly(ctx,wave,ink.pink,2.2,11);
 for(let m=0;m<N;m++){
  const bx=x0+(m+.5)*(ww/N),mag=(.25+.75*Math.abs(Math.sin(m*1.1+params.twist*4+time*.5)))*params.voltage;
  const bh=mag*hh*.36;
  line(ctx,[bx,y0+hh],[bx,y0+hh-bh],m%2?ink.arc:ink.porcelain,3.2,8);
  diamond(ctx,bx,y0+hh-bh,3.5,m%2?ink.arc:ink.pink);
 }
 mono(ctx,`${labId} · f(r)=Σ aⱼ sin(kⱼ·r + ϕⱼ)`,w*.5,y0+hh+24,10,ink.arc,'center');
}
function d3Lattice(ctx,w,h,params,time,labId){
 const cx=w*.5,cy=h*.52,r=Math.min(w,h)*.34;
 const theta=.06+params.twist*.38;
 for(const [rot,col] of [[0,ink.pink],[theta,ink.arc]]){
  const pts=[];
  for(let i=0;i<6;i++){
   const a=rot+i*Math.PI/3+time*.05;
   pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);
  }
  poly(ctx,[pts[0],pts[2],pts[4],pts[0]],col,1.8,9);
  poly(ctx,[pts[1],pts[3],pts[5],pts[1]],col,1.4,7);
 }
 ring(ctx,cx,cy,r*.48,ink.porcelain,1.1,.7);
 mono(ctx,`${labId} · D₃ ROTATED LATTICE θ=${(theta*180/Math.PI).toFixed(1)}°`,cx,cy+r+24,10,ink.arc,'center');
}
function phiStar(ctx,w,h,params,time,labId){
 const cx=w*.5,cy=h*.52,r=Math.min(w,h)*.35;
 const phi=(1+Math.sqrt(5))/2;
 for(let m=0;m<10;m++){
  const a=m*Math.PI/5+time*.04,len=r*(m%2?1/phi:.96);
  const pt=[cx+Math.cos(a)*len,cy+Math.sin(a)*len];
  line(ctx,[cx,cy],pt,m%2?ink.arc:ink.pink,1.5,8);
  diamond(ctx,pt[0],pt[1],3.8,m%2?ink.arc:ink.pink);
 }
 ring(ctx,cx,cy,r/phi,ink.porcelain,1.3,.75);
 mono(ctx,`${labId} · QUASIPERIODIC 10-FOLD φ=${phi.toFixed(3)}`,cx,cy+r+24,10,ink.arc,'center');
}
function twinWorldFork(ctx,w,h,params,time,labId){
 const cx=w*.5,cy=h*.52,rx=Math.min(w,h)*.38,ry=Math.min(w,h)*.24;
 const s=[cx-rx,cy],e=[cx+rx,cy],midA=[cx,cy-ry*(.7+.4*params.gain)],midB=[cx,cy+ry*(.7+.4*params.twist)];
 poly(ctx,[s,midA,e],ink.pink,2.2,12);
 poly(ctx,[s,midB,e],ink.arc,2.2,12);
 diamond(ctx,s[0],s[1],7,ink.porcelain);
 diamond(ctx,e[0],e[1],7,ink.porcelain);
 diamond(ctx,midA[0],midA[1],5.5,ink.pink);
 diamond(ctx,midB[0],midB[1],5.5,ink.arc);
 mono(ctx,'γ_A',midA[0],midA[1]-12,10,ink.pink,'center');
 mono(ctx,'γ_B',midB[0],midB[1]+20,10,ink.arc,'center');
 mono(ctx,`${labId} · end(γA)=end(γB) ⇏ γA=γB`,cx,cy+ry*1.45,10,ink.arc,'center');
}
function causticField(ctx,w,h,params,time,labId){
 const cx=w*.5,cy=h*.52,r=Math.min(w,h)*.34;
 const cusp=labId==='LAB_RC-14'?.52:.34;
 const pts=[];
 for(let i=0;i<=60;i++){
  const u=TAU*i/60+time*.09;
  const rr=r*(.55+cusp*Math.cos(3*u+params.twist*TAU));
  pts.push([cx+Math.cos(u)*rr,cy+Math.sin(u)*rr]);
 }
 poly(ctx,pts,ink.pink,1.9,11);
 for(let i=0;i<12;i++){
  const a=TAU*i/12,inner=[cx+Math.cos(a)*r*.25,cy+Math.sin(a)*r*.25],outer=[cx+Math.cos(a+params.twist*.35)*r*.92,cy+Math.sin(a+params.twist*.35)*r*.92];
  line(ctx,inner,outer,i%2?ink.arc:ink.porcelain,1.2,7);
 }
 computedArc(ctx,[cx-r*.45,cy],[cx+r*.45,cy],params.voltage,time,2.1);
 mono(ctx,`${labId} · ||∇T−∇Q||₂ CAUSTIC DIVERGENCE`,cx,cy+r+24,10,ink.arc,'center');
}
function generic(ctx,w,h,params,time,labId='FOLIO'){
 const cx=w*.5,cy=h*.52,r=Math.min(w,h)*.32;
 sourceSeam(ctx,cx,cy,r,params);
 graduated(ctx,cx,cy,r,time,48);
 mono(ctx,`${labId} · SOURCE-REFERENCED VECTOR PROJECTION`,cx,cy+r+24,10,ink.porcelain,'center');
}
export function paintComputationalScore(canvas,{labId='LAB_TCC-01',
 model={},time=0,pointer={x:0,y:0}}={}){
 if(!canvas?.getContext)throw new TypeError('COMPUTATIONAL_SCORE_CANVAS_REQUIRED');
 const rect=canvas.getBoundingClientRect();
 const width=Math.max(300,rect.width||640),height=Math.max(220,rect.height||450);
 const dpr=clip(globalThis.devicePixelRatio||1,1,2);
 const pxWidth=Math.min(3000,Math.round(width*dpr)),pxHeight=Math.min(2200,Math.round(height*dpr));
 if(canvas.width!==pxWidth||canvas.height!==pxHeight){
  canvas.width=pxWidth;canvas.height=pxHeight;
 }
 const ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('COMPUTATIONAL_SCORE_CONTEXT_UNAVAILABLE');
 ctx.setTransform(pxWidth/width,0,0,pxHeight/height,0,0);
 ctx.clearRect(0,0,width,height);
 smokeGlass(ctx,width,height,{
  twist:clip(model.twist),voltage:clip(model.voltage)},time);
 const gain=clip(model.gain),witness=clip(model.witness),
  voltage=clip(model.voltage),twist=clip(model.twist);
 const params={gain,witness,voltage,twist};
 const mode={
  'LAB_TCC-01':control,'LAB_TCC-02':holonomy,'LAB_TCC-03':foldSeam,
  'LAB_TCC-04':clocks,'LAB_TCC-05':algedonic,'LAB_TCC-06':holonomy,
  'LAB_TCC-07':quotient87,'LAB_TCC-08':torusSe,
  'LAB_RC-01':fourierSpectrum,'LAB_RC-02':clocks,'LAB_RC-03':couture,
  'LAB_RC-04':d3Lattice,'LAB_RC-05':phiStar,'LAB_RC-06':quotient87,
  'LAB_RC-07':rank,'LAB_RC-08':foldSeam,'LAB_RC-09':holonomy,
  'LAB_RC-10':xor,'LAB_RC-11':torusSe,'LAB_RC-12':twinWorldFork,
  'LAB_RC-13':causticField,'LAB_RC-14':causticField
 }[labId]||generic;
 mode(ctx,width,height,params,time,labId);
 // Model-probe coordinate: a mechanically distinct mark, not an outside
 // witnessing event. Its chroma tracks local operator voltage and gain.
 const px=width*(clip(pointer.x,-1,1)+1)/2,
  py=height*(1-clip(pointer.y,-1,1))/2;
 ring(ctx,px,py,11,ink.arc,1.3,.75,0,TAU,8+voltage*14);
 line(ctx,[px-17,py],[px+17,py],ink.arc,.9);
 line(ctx,[px,py-17],[px,py+17],ink.arc,.9);
 return Object.freeze({schema:SCORE_CONTRACT.schema,
  lab_id:labId,host_time:time,width:Math.round(width),height:Math.round(height),
  drawing_backend:'CANVAS2D_TRANSPARENT_VECTOR_OVERLAY',
  mathematically_bound_simulation:true,
  empirical_replication_credit:0});
}
