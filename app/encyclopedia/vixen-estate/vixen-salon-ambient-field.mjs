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
function sample(pairs,x,y,time){
 let d3=0,phi=0,beat=0;
 for(const p of pairs){
  d3+=Math.sin(p.d3.x*x+p.d3.y*y+p.phaseA-p.omegaA*time);
  phi+=Math.sin(p.phi.x*x+p.phi.y*y+p.phaseB-p.omegaB*time);
  beat+=Math.cos(p.delta.x*x+p.delta.y*y+p.phaseDelta-p.deltaOmega*time);
 }
 const n=pairs.length;return {d3:d3/n,phi:phi/n,beat:beat/n};
}
export function pointOnFieldPath(points,u){
 const q=clamp(u)*(points.length-1),i=Math.min(points.length-2,Math.floor(q)),t=q-i;
 return points[i].map((v,k)=>mix(v,points[i+1][k],t));
}
/** Mesh coordinates are computed BEFORE paint, including the moving charge.
 * Every lane has a shared midpoint with one material junction. Staggered
 * cross-links make a cloth, not independent sinusoidal telemetry tracks.
 * Removing geometry gain leaves clock, source seed and charge speed fixed.
 */
export function buildSalonField({width,height,time=0,field,cx=width*.74,cy=height*.5,
 scale=Math.min(width,height)*.8,sourceIds=[],latticeNodes=[],gain=1}={}){
 if(![width,height,time,cx,cy,scale,gain].every(Number.isFinite)||width<=0||height<=0)
  throw new RangeError('SALON_FIELD_VIEWPORT_REQUIRED');
 if(!field?.pairs?.length)throw new TypeError('SALON_FIELD_CARRIERS_REQUIRED');
 const trails=[],crossings=[],nodes=[],contacts=[];
 const count=SALON_FIELD_POLICY.strands,steps=SALON_FIELD_POLICY.points_per_track-1;
 const sheetAngles=[-.46,.37,-.12];
 for(let band=0;band<3;band++)for(let lane=0;lane<count;lane++){
  const v=(lane-(count-1)/2)/((count-1)/2),angle=sheetAngles[band];
  const row=band===0?5:band===1?7:6;
  const col=(lane+band*8)%24;
  const junction=latticeNodes[row*24+col];
  const anchor=junction?.point||[cx+v*scale*.20,cy+v*scale*.075,(band===1?1:-1)*.1];
  const side=anchor[2]>=0?'front':'back';
  const points=[];
  for(let j=0;j<=steps;j++){
   const u=(j-steps/2)/(steps/2),spread=Math.abs(u);
   if(j===steps/2){points.push(anchor);continue;}
   const x=anchor[0]+u*width*1.22;
   const open=height*(.14+spread*.48)*v*spread;
   const y=anchor[1]+u*width*angle+open+
    Math.sin(u*Math.PI*1.35+band*.8+time*.32)*height*.14*spread;
   const f=sample(field.pairs,u*54+band*12,v*28+band*5,time);
   const warp=gain*(.045*f.d3+.055*f.phi+.10*f.beat)*scale*Math.sin(Math.PI*spread*.8);
   points.push([x+gain*f.phi*scale*.028*spread,y+warp,
    anchor[2]+.17*Math.sin(u*Math.PI+band)]);
  }
  const color=lane%5===0?'champagne':band===2?'pearl':'pink';
  const phase=((time*.085+lane*.061+band*.213)%1+1)%1;
  const trail={id:trails.length,band,lane,layer:side,color,points,contact:anchor,
   junctionId:junction?.id??null,phase,pulse:pointOnFieldPath(points,phase)};
  trails.push(trail);contacts.push({point:anchor,junctionId:trail.junctionId,trailId:trail.id});
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
  const f=sample(field.pairs,t.phase*54,t.lane,time);
  nodes.push({point:t.pulse,power:.48+.42*(.5+.5*f.beat),color:t.color,layer:t.layer,trailId:t.id});
 }
 return {width,height,time,sourceIds:[...sourceIds],cx,cy,scale,trails,crossings,nodes,contacts,
  metadata:{pairs:field.pairs.length,clock_source:'FOLDED_CUIRASS_SHARED',claim_class:'ARTISTIC_VISUAL_ONLY',
   junction_rule:'IDENTICAL_PREPAINT_VERTEX',triangular_edges:crossings.length}};
}
export function traceFieldPath(ctx,points){
 if(!points.length)return;
 ctx.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
}
export function paintFieldSpark(ctx,p,power,color='pink',scale=400){
 const r=Math.min(18,scale*.018+11*power),[x,y]=p;
 const glow=ctx.createRadialGradient(x,y,0,x,y,r);
 glow.addColorStop(0,'rgba(255,255,246,.96)');
 glow.addColorStop(.12,color==='champagne'?'rgba(255,237,172,.70)':'rgba(255,94,170,.70)');
 glow.addColorStop(.45,'rgba(255,122,179,.16)');glow.addColorStop(1,'rgba(255,122,179,0)');
 ctx.globalCompositeOperation='source-over';ctx.globalAlpha=clamp(power);ctx.fillStyle=glow;
 ctx.fillRect(x-r,y-r,2*r,2*r);
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
 const selected=t=>layer==='all'||t.layer===layer;
 ctx.save();ctx.globalCompositeOperation='source-over';ctx.lineCap='round';ctx.lineJoin='round';
 const {cx,cy,scale}=scene;
 if(layer==='all'||layer==='back'){
  const radius=scale*.51,halo=ctx.createRadialGradient(cx,cy,0,cx,cy,radius);
  halo.addColorStop(0,'rgba(255,235,197,.28)');
  halo.addColorStop(.3,'rgba(255,124,173,.13)');halo.addColorStop(1,'rgba(255,124,173,0)');
  ctx.globalAlpha=power;ctx.fillStyle=halo;ctx.fillRect(cx-radius,cy-radius,2*radius,2*radius);
 }
 for(const tone of ['pink','pearl','champagne']){
  ctx.beginPath();for(const t of scene.trails)if(selected(t)&&t.color===tone)traceFieldPath(ctx,t.points);
  ctx.strokeStyle=palette[tone];ctx.lineWidth=3.2;ctx.globalAlpha=.085*power;ctx.stroke();
  ctx.lineWidth=tone==='champagne'?1.05:.65;ctx.globalAlpha=(tone==='champagne'?.64:.46)*power;ctx.stroke();
 }
 // Leading threads travel through their sewn contacts into the page.
 for(const t of scene.trails){
  if(t.lane!==8||!selected(t))continue;
  ctx.beginPath();traceFieldPath(ctx,t.points);
  ctx.strokeStyle=t.band===0?'#ffd798':'#fa82b9';
  ctx.lineWidth=5.4;ctx.globalAlpha=.19*power;ctx.stroke();
  ctx.lineWidth=2.7;ctx.globalAlpha=.46*power;ctx.stroke();
  ctx.strokeStyle=t.band===0?'#fff9da':'#ffe7f3';
  ctx.lineWidth=1.1;ctx.globalAlpha=.84*power;ctx.stroke();
 }
 ctx.beginPath();for(const edge of scene.crossings)if(selected(edge))traceFieldPath(ctx,edge.points);
 ctx.strokeStyle='#ffbcda';ctx.lineWidth=.45;ctx.globalAlpha=.27*power;ctx.stroke();
 for(const t of scene.trails){
  if(!selected(t)||(t.lane%3!==0&&t.lane!==8))continue;
  const start=Math.max(0,t.phase-.065),end=t.phase;
  const pulse=[];for(let i=0;i<=6;i++)pulse.push(pointOnFieldPath(t.points,mix(start,end,i/6)));
  const g=ctx.createLinearGradient(pulse[0][0],pulse[0][1],t.pulse[0],t.pulse[1]);
  g.addColorStop(0,'rgba(255,139,188,0)');g.addColorStop(.8,palette[t.color]);g.addColorStop(1,'#fffef3');
  ctx.beginPath();traceFieldPath(ctx,pulse);ctx.strokeStyle=g;ctx.lineWidth=1.8;ctx.globalAlpha=.88*power;ctx.stroke();
 }
 for(const n of scene.nodes.slice(0,SALON_FIELD_POLICY.max_sparks))if(selected(n))
  paintFieldSpark(ctx,n.point,n.power*power,n.color,scale);
 for(const contact of scene.contacts.filter((_,i)=>i%17===8)){
  const t=scene.trails[contact.trailId];if(!selected(t))continue;
  const d=Math.abs(t.phase-.5),charge=Math.exp(-d*d/.0036);
  if(charge>.025)paintFieldSpark(ctx,contact.point,.25+.75*charge,'champagne',scale);
 }
 ctx.restore();return scene;
}
