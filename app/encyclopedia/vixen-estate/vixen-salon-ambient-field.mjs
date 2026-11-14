/** DD-02 shared optical cloth. A connected triangular weave is strained by
 * the same measured D3/phi pairs as the folded metal. Its junctions are actual
 * garment nodes; a second viewport projects these SAME points outside the
 * Salon. Pure model + painter, never a scheduler or source interpretation.
 * Artistic geometry only. OPERAHOUSE != OPERA != PERFORMER; empirical credit 0.
 */
export const SALON_FIELD_POLICY=Object.freeze({
 sheets:3,strands:17,tracks:51,points_per_track:65,max_sparks:24,
 material_only:true,same_optical_clock:true,external_empirical_credit:0
});
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
const palette={pink:'#ff70b3',pearl:'#fffaf1',champagne:'#fff0bd'};
const U_STEPS=SALON_FIELD_POLICY.points_per_track-1;
const HALF_STEP=U_STEPS/2;
const U_LUT=Array.from({length:U_STEPS+1},(_,j)=>{
 const u=(j-HALF_STEP)/HALF_STEP,spread=Math.abs(u),w=u*Math.PI*1.35,z=u*Math.PI;
 return {u,spread,sinBeat:Math.sin(Math.PI*spread*.8),sinZ:Math.sin(z),cosZ:Math.cos(z),sinW:Math.sin(w),cosW:Math.cos(w),x54:u*54};
});
const SPARK_SPRITES=new Map();
function getSparkSprite(tone){
 if(typeof document==='undefined')return null;
 const key=tone==='champagne'?'champagne':'pink';
 let c=SPARK_SPRITES.get(key);
 if(!c){
  c=document.createElement('canvas');c.width=32;c.height=32;
  const g=c.getContext('2d');
  if(!g)return null;
  const grad=g.createRadialGradient(16,16,0,16,16,16);
  grad.addColorStop(0,'rgba(255,255,246,.96)');
  grad.addColorStop(.14,key==='champagne'?'rgba(255,237,172,.78)':'rgba(255,112,179,.76)');
  grad.addColorStop(.48,key==='champagne'?'rgba(245,221,177,.20)':'rgba(255,142,192,.18)');
  grad.addColorStop(1,'rgba(255,122,179,0)');
  g.fillStyle=grad;g.fillRect(0,0,32,32);
  SPARK_SPRITES.set(key,c);
 }
 return c;
}
function sampleBeatScalar(pairs,x,y,time){
 let beat=0;
 const n=pairs.length;
 for(let i=0;i<n;i++){
  const p=pairs[i];
  beat+=Math.cos(p.delta.x*x+p.delta.y*y+p.phaseDelta-p.deltaOmega*time);
 }
 return beat/n;
}
export function pointOnFieldPath(points,u){
 const q=clamp(u)*(points.length-1),i=Math.min(points.length-2,Math.floor(q)),t=q-i;
 const a=points[i],b=points[i+1];
 return [mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t)];
}
/** Mesh coordinates are computed BEFORE paint, including the moving charge.
 * Every lane has a shared midpoint with one material junction. Staggered
 * cross-links make a cloth, not independent sinusoidal telemetry tracks.
 * Removing geometry gain leaves clock, source seed and charge speed fixed.
 */
const uX=new Float64Array(U_STEPS+1),uY=new Float64Array(U_STEPS+1),uW=new Float64Array(U_STEPS+1);
const uS0A=new Float64Array(U_STEPS+1),uC0A=new Float64Array(U_STEPS+1),uS1A=new Float64Array(U_STEPS+1),uC1A=new Float64Array(U_STEPS+1),uS2A=new Float64Array(U_STEPS+1),uC2A=new Float64Array(U_STEPS+1);
const uS0B=new Float64Array(U_STEPS+1),uC0B=new Float64Array(U_STEPS+1),uS1B=new Float64Array(U_STEPS+1),uC1B=new Float64Array(U_STEPS+1),uS2B=new Float64Array(U_STEPS+1),uC2B=new Float64Array(U_STEPS+1);
const uS0D=new Float64Array(U_STEPS+1),uC0D=new Float64Array(U_STEPS+1),uS1D=new Float64Array(U_STEPS+1),uC1D=new Float64Array(U_STEPS+1),uS2D=new Float64Array(U_STEPS+1),uC2D=new Float64Array(U_STEPS+1);
const V_STRANDS=SALON_FIELD_POLICY.strands;
const vArr=Float64Array.from({length:V_STRANDS},(_,lane)=>(lane-(V_STRANDS-1)/2)/((V_STRANDS-1)/2));

export function buildSalonField({width,height,time=0,field,cx=width*.74,cy=height*.5,
 scale=Math.min(width,height)*.8,sourceIds=[],latticeNodes=[],gain=1}={}){
 if(![width,height,time,cx,cy,scale,gain].every(Number.isFinite)||width<=0||height<=0)
  throw new RangeError('SALON_FIELD_VIEWPORT_REQUIRED');
 if(!field?.pairs?.length)throw new TypeError('SALON_FIELD_CARRIERS_REQUIRED');
 const pairs=field.pairs,pLen=pairs.length,invLen=1/pLen;
 const is3=pLen===3;
 const q0=pairs[0],q1=pairs[1],q2=pairs[2];
 const t0A=is3?q0.phaseA-q0.omegaA*time:0,t0B=is3?q0.phaseB-q0.omegaB*time:0,t0D=is3?q0.phaseDelta-q0.deltaOmega*time:0;
 const t1A=is3?q1.phaseA-q1.omegaA*time:0,t1B=is3?q1.phaseB-q1.omegaB*time:0,t1D=is3?q1.phaseDelta-q1.deltaOmega*time:0;
 const t2A=is3?q2.phaseA-q2.omegaA*time:0,t2B=is3?q2.phaseB-q2.omegaB*time:0,t2D=is3?q2.phaseDelta-q2.deltaOmega*time:0;
 const trails=[],crossings=[],nodes=[],contacts=[];
 const count=SALON_FIELD_POLICY.strands,steps=U_STEPS;
 const sheetAngles=[-.46,.37,-.12];
 const widthSpread=width*1.22,timePhase=time*.32,gScale=gain*scale;
 for(let band=0;band<3;band++){
  const angle=sheetAngles[band],row=band===0?5:band===1?7:6,band12=band*12,band5=band*5;
  const bandSlope=width*angle,bandPhase=band*.8+timePhase,cosBP=Math.cos(bandPhase),sinBP=Math.sin(bandPhase);
  const cosB=Math.cos(band),sinB=Math.sin(band);
  for(let j=0;j<=steps;j++){
   const lu=U_LUT[j],sx=lu.x54+band12;
   uX[j]=lu.u*widthSpread;
   uY[j]=lu.u*bandSlope+(lu.sinW*cosBP+lu.cosW*sinBP)*height*.14*lu.spread;
   uW[j]=.17*(lu.sinZ*cosB+lu.cosZ*sinB);
   if(is3){
    const a0=q0.d3.x*sx+t0A,a1=q1.d3.x*sx+t1A,a2=q2.d3.x*sx+t2A;
    const b0=q0.phi.x*sx+t0B,b1=q1.phi.x*sx+t1B,b2=q2.phi.x*sx+t2B;
    const d0=q0.delta.x*sx+t0D,d1=q1.delta.x*sx+t1D,d2=q2.delta.x*sx+t2D;
    uS0A[j]=Math.sin(a0);uC0A[j]=Math.cos(a0);uS1A[j]=Math.sin(a1);uC1A[j]=Math.cos(a1);uS2A[j]=Math.sin(a2);uC2A[j]=Math.cos(a2);
    uS0B[j]=Math.sin(b0);uC0B[j]=Math.cos(b0);uS1B[j]=Math.sin(b1);uC1B[j]=Math.cos(b1);uS2B[j]=Math.sin(b2);uC2B[j]=Math.cos(b2);
    uS0D[j]=Math.sin(d0);uC0D[j]=Math.cos(d0);uS1D[j]=Math.sin(d1);uC1D[j]=Math.cos(d1);uS2D[j]=Math.sin(d2);uC2D[j]=Math.cos(d2);
   }
  }
  for(let lane=0;lane<count;lane++){
   const v=vArr[lane],ySample=v*28+band5;
   const col=(lane+band*8)%24;
   const junction=latticeNodes[row*24+col];
   const anchor=junction?.point||[cx+v*scale*.20,cy+v*scale*.075,(band===1?1:-1)*.1];
   const side=anchor[2]>=0?'front':'back';
   const ax=anchor[0],ay=anchor[1],az=anchor[2];
   const vS0A=is3?Math.sin(q0.d3.y*ySample):0,vC0A=is3?Math.cos(q0.d3.y*ySample):0;
   const vS1A=is3?Math.sin(q1.d3.y*ySample):0,vC1A=is3?Math.cos(q1.d3.y*ySample):0;
   const vS2A=is3?Math.sin(q2.d3.y*ySample):0,vC2A=is3?Math.cos(q2.d3.y*ySample):0;
   const vS0B=is3?Math.sin(q0.phi.y*ySample):0,vC0B=is3?Math.cos(q0.phi.y*ySample):0;
   const vS1B=is3?Math.sin(q1.phi.y*ySample):0,vC1B=is3?Math.cos(q1.phi.y*ySample):0;
   const vS2B=is3?Math.sin(q2.phi.y*ySample):0,vC2B=is3?Math.cos(q2.phi.y*ySample):0;
   const vS0D=is3?Math.sin(q0.delta.y*ySample):0,vC0D=is3?Math.cos(q0.delta.y*ySample):0;
   const vS1D=is3?Math.sin(q1.delta.y*ySample):0,vC1D=is3?Math.cos(q1.delta.y*ySample):0;
   const vS2D=is3?Math.sin(q2.delta.y*ySample):0,vC2D=is3?Math.cos(q2.delta.y*ySample):0;
   const points=new Array(steps+1);
   for(let j=0;j<=steps;j++){
    if(j===HALF_STEP){points[j]=anchor;continue;}
    const lu=U_LUT[j],spread=lu.spread;
    let d3,phi,beat;
    if(is3){
     d3=((uS0A[j]*vC0A+uC0A[j]*vS0A)+(uS1A[j]*vC1A+uC1A[j]*vS1A)+(uS2A[j]*vC2A+uC2A[j]*vS2A))*invLen;
     phi=((uS0B[j]*vC0B+uC0B[j]*vS0B)+(uS1B[j]*vC1B+uC1B[j]*vS1B)+(uS2B[j]*vC2B+uC2B[j]*vS2B))*invLen;
     beat=((uC0D[j]*vC0D-uS0D[j]*vS0D)+(uC1D[j]*vC1D-uS1D[j]*vS1D)+(uC2D[j]*vC2D-uS2D[j]*vS2D))*invLen;
    }else{
     const sx=lu.x54+band12;let sd=0,sp=0,sb=0;
     for(let i=0;i<pLen;i++){
      const p=pairs[i];
      sd+=Math.sin(p.d3.x*sx+p.d3.y*ySample+p.phaseA-p.omegaA*time);
      sp+=Math.sin(p.phi.x*sx+p.phi.y*ySample+p.phaseB-p.omegaB*time);
      sb+=Math.cos(p.delta.x*sx+p.delta.y*ySample+p.phaseDelta-p.deltaOmega*time);
     }
     d3=sd*invLen;phi=sp*invLen;beat=sb*invLen;
    }
    const open=height*(.14+spread*.48)*v*spread;
    const warp=gScale*(.045*d3+.055*phi+.10*beat)*lu.sinBeat;
    points[j]=[ax+uX[j]+gScale*phi*.028*spread,ay+uY[j]+open+warp,az+uW[j]];
   }
   const color=lane%5===0?'champagne':band===2?'pearl':'pink';
   const phase=((time*.085+lane*.061+band*.213)%1+1)%1;
   const trail={id:trails.length,band,lane,layer:side,color,points,contact:anchor,
    junctionId:junction?.id??null,phase,pulse:pointOnFieldPath(points,phase)};
   trails.push(trail);contacts.push({point:anchor,junctionId:trail.junctionId,trailId:trail.id});
  }
 }
 // Triangular counterwarp: vertices are re-used, never almost-coincident copies.
 for(let band=0;band<3;band++)for(let i=0;i<count-1;i++)for(let j=1;j<steps;j+=3){
  const a=trails[band*count+i],b=trails[band*count+i+1];
  const end=Math.min(steps,j+(i%2?1:2));
  crossings.push({points:[a.points[j],b.points[j]],layer:a.layer,band},
   {points:[a.points[j],b.points[end]],layer:a.layer,band});
 }
 for(const t of trails){
  if(t.lane%3!==0)continue;
  const beat=sampleBeatScalar(pairs,t.phase*54,t.lane,time);
  nodes.push({point:t.pulse,power:.48+.42*(.5+.5*beat),color:t.color,layer:t.layer,trailId:t.id});
 }
 return {width,height,time,sourceIds:[...sourceIds],cx,cy,scale,trails,crossings,nodes,contacts,
  metadata:{pairs:pLen,clock_source:'FOLDED_CUIRASS_SHARED',claim_class:'ARTISTIC_VISUAL_ONLY',
   junction_rule:'IDENTICAL_PREPAINT_VERTEX',triangular_edges:crossings.length}};
}
export function traceFieldPath(ctx,points){
 if(!points.length)return;
 ctx.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
}
export function paintFieldSpark(ctx,p,power,color='pink',scale=400){
 const r=Math.min(18,scale*.018+11*power),x=p[0],y=p[1],a=clamp(power);
 const sprite=typeof ctx.drawImage==='function'?getSparkSprite(color):null;
 ctx.globalCompositeOperation='source-over';
 if(sprite){
  ctx.globalAlpha=a;ctx.drawImage(sprite,x-r,y-r,2*r,2*r);
 }else{
  const glow=ctx.createRadialGradient(x,y,0,x,y,r);
  glow.addColorStop(0,'rgba(255,255,246,.96)');
  glow.addColorStop(.12,color==='champagne'?'rgba(255,237,172,.70)':'rgba(255,94,170,.70)');
  glow.addColorStop(.45,'rgba(255,122,179,.16)');glow.addColorStop(1,'rgba(255,122,179,0)');
  ctx.globalAlpha=a;ctx.fillStyle=glow;ctx.fillRect(x-r,y-r,2*r,2*r);
 }
 ctx.beginPath();ctx.moveTo(x-r*.55,y);ctx.lineTo(x+r*.55,y);
 ctx.moveTo(x,y-r*.85);ctx.lineTo(x,y+r*.85);
 ctx.strokeStyle=palette[color];ctx.lineWidth=.65;ctx.globalAlpha=clamp(power*.85);ctx.stroke();
}
/** Same commands for the garment viewport and its page continuation. All
 * light is finite source-over: no full-frame blur or cumulative screen wash.
 * The rear cloth, open chrome and foreground cloth are separate depth passes.
 */
export function paintSalonField(ctx,model,{layer='all',intensity=1}={}){
 const scene=model.scene||buildSalonField(model),power=clamp(intensity);
 const all=layer==='all';
 ctx.save();ctx.globalCompositeOperation='source-over';ctx.lineCap='round';ctx.lineJoin='round';
 const {cx,cy,scale}=scene;
 if(all||layer==='back'){
  const radius=scale*.51,halo=ctx.createRadialGradient(cx,cy,0,cx,cy,radius);
  halo.addColorStop(0,'rgba(255,235,197,.28)');
  halo.addColorStop(.3,'rgba(255,124,173,.13)');halo.addColorStop(1,'rgba(255,124,173,0)');
  ctx.globalAlpha=power;ctx.fillStyle=halo;ctx.fillRect(cx-radius,cy-radius,2*radius,2*radius);
 }
 for(const tone of ['pink','pearl','champagne']){
  ctx.beginPath();
  for(const t of scene.trails)if((all||t.layer===layer)&&t.color===tone)traceFieldPath(ctx,t.points);
  ctx.strokeStyle=palette[tone];ctx.lineWidth=3.2;ctx.globalAlpha=.085*power;ctx.stroke();
  ctx.lineWidth=tone==='champagne'?1.05:.65;ctx.globalAlpha=(tone==='champagne'?.64:.46)*power;ctx.stroke();
 }
 // Leading threads travel through their sewn contacts into the page.
 for(const t of scene.trails){
  if(t.lane!==8||(!all&&t.layer!==layer))continue;
  ctx.beginPath();traceFieldPath(ctx,t.points);
  ctx.strokeStyle=t.band===0?'#ffd798':'#fa82b9';
  ctx.lineWidth=5.4;ctx.globalAlpha=.19*power;ctx.stroke();
  ctx.lineWidth=2.7;ctx.globalAlpha=.46*power;ctx.stroke();
  ctx.strokeStyle=t.band===0?'#fff9da':'#ffe7f3';
  ctx.lineWidth=1.1;ctx.globalAlpha=.84*power;ctx.stroke();
 }
 ctx.beginPath();for(const edge of scene.crossings)if(all||edge.layer===layer)traceFieldPath(ctx,edge.points);
 ctx.strokeStyle='#ffbcda';ctx.lineWidth=.45;ctx.globalAlpha=.27*power;ctx.stroke();
 for(const t of scene.trails){
  if((!all&&t.layer!==layer)||(t.lane%3!==0&&t.lane!==8))continue;
  const start=Math.max(0,t.phase-.065),mid=mix(start,t.phase,.55);
  const p0=pointOnFieldPath(t.points,start),p1=pointOnFieldPath(t.points,mid),p2=t.pulse;
  ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);
  ctx.strokeStyle=palette[t.color];ctx.lineWidth=1.5;ctx.globalAlpha=.56*power;ctx.stroke();
  ctx.beginPath();ctx.moveTo(p1[0],p1[1]);ctx.lineTo(p2[0],p2[1]);
  ctx.strokeStyle='#fffef3';ctx.lineWidth=1.9;ctx.globalAlpha=.88*power;ctx.stroke();
 }
 for(let i=0,lim=Math.min(SALON_FIELD_POLICY.max_sparks,scene.nodes.length);i<lim;i++){
  const n=scene.nodes[i];if(all||n.layer===layer)paintFieldSpark(ctx,n.point,n.power*power,n.color,scale);
 }
 for(let i=8;i<scene.contacts.length;i+=17){
  const t=scene.trails[scene.contacts[i].trailId];if(!all&&t.layer!==layer)continue;
  const d=Math.abs(t.phase-.5),charge=Math.exp(-d*d/.0036);
  if(charge>.025)paintFieldSpark(ctx,scene.contacts[i].point,.25+.75*charge,'champagne',scale);
 }
 ctx.restore();return scene;
}
