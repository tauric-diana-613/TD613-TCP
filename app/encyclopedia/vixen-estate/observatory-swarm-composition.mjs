/**
 * Vixen candidate swarm geometry. Mathematical model + independent painter.
 * Never purport source manuscripts to demonstrate flocking: this is a testable
 * computational VISUALIZATION CANDIDATE not an admitted scholarly finding.
 * Clock is injected; no RAF, no ambient engine, no mutation.
 */
import {CARRIERS,triangular,quasiperiodic,project111} from './observatory-foundry-kernel.mjs';
import {measureCoutureBeats,beatFieldAt,BEAT_POLICY} from './vixen-beat-radiometry-rgi15.mjs';
export const SWARM_SCHEMA='td613.vixen.swarm-candidate/v1';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(+v)?+v:a));
const seedFor=ids=>{let h=2166136261;for(const c of ids.join('|')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h;};
export function computeSwarmComposition({width=480,height=360,sourceIds=[],phase=0,iterations=28,alignment=.56,cohesion=.36,separation=.31}={}){
 if(![width,height,phase,iterations,alignment,cohesion,separation].every(Number.isFinite)||width<100||height<100||iterations<1||iterations>120)
  throw new RangeError('SWARM_BOUNDED_MODEL_REQUIRED');
 const ids=Array.isArray(sourceIds)?sourceIds.filter(x=>typeof x==='string').slice(0,2):[];
 const seed=seedFor(ids),tau=Math.PI*2,phi=(1+Math.sqrt(5))/2,n=CARRIERS.length;
 const rays=CARRIERS.map((carrier,i)=>{
  const theta=i*tau/phi+((seed%71)/71)*.11;
  const r=.31*Math.sqrt((i+.5)/n);
  return {id:i,plane:carrier.plane,x:.5+r*Math.cos(theta),y:.5+r*Math.sin(theta),
   vx:Math.cos(theta+Math.PI/2)*.006,vy:Math.sin(theta+Math.PI/2)*.006,tail:[]};
 });
 const count=Math.floor(iterations),stats=[];
 for(let step=0;step<count;step++){
  const copy=rays.map(x=>({...x}));
  let convergence=0;
  for(let i=0;i<n;i++){
   const a=copy[i];let nvx=0,nvy=0,cx=0,cy=0,rx=0,ry=0,seen=0;
   for(let j=0;j<n;j++){
    if(i===j)continue;
    const b=copy[j],dx=b.x-a.x,dy=b.y-a.y,r2=dx*dx+dy*dy;
    if(r2>.055)continue;
    nvx+=b.vx;nvy+=b.vy;cx+=b.x;cy+=b.y;seen++;
    if(r2<.0025){rx-=dx/(.004+r2);ry-=dy/(.004+r2);}
   }
   if(seen){nvx=nvx/seen-a.vx;nvy=nvy/seen-a.vy;
    cx=cx/seen-a.x;cy=cy/seen-a.y;}
   const bx=(a.x-.5)*90,by=(a.y-.5)*90;
   // Distinct triangulated D3 and tenfold phi field samplers bend the swarm.
   const fieldD=triangular(bx+step*.12,by,{theta:phase*.04});
   const fieldP=quasiperiodic(bx,by-step*.08,{phase});
   const f=.0022*(fieldD-fieldP);
   const vx=clamp(a.vx+alignment*nvx*.045+cohesion*cx*.009+separation*rx*.0003-f*(a.y-.5),-.026,.026);
   const vy=clamp(a.vy+alignment*nvy*.045+cohesion*cy*.009+separation*ry*.0003+f*(a.x-.5),-.026,.026);
   const out=rays[i];out.vx=vx;out.vy=vy;
   out.x=clamp(a.x+vx,.08,.92);out.y=clamp(a.y+vy,.08,.92);
   if(step%4===0)out.tail.push([out.x,out.y]);
   convergence+=Math.hypot(cx,cy);
  }
  stats.push(convergence/n);
 }
 const coordinates=rays.map(p=>({id:p.id,plane:p.plane,x:p.x*width,y:p.y*height,
  velocity:[p.vx,p.vy],tail:p.tail.map(([x,y])=>[x*width,y*height])}));
 const projection=project111([clamp(alignment),clamp(cohesion),clamp(separation)]);
 const field=measureCoutureBeats({width,height,time:phase,seed,devicePixelRatio:1,
  samplePoints:coordinates.map(p=>({x:p.x,y:p.y}))});
 const signal=coordinates.map(p=>beatFieldAt(field.pairs,p.x,p.y,phase));
 const neighborDispersion=signal.reduce((s,x)=>s+x,0)/n;
 return Object.freeze({schema:SWARM_SCHEMA,view:{width,height,phase},
  source_ids:ids,source_role:'VISUAL_SEED_NOT_AUTHORSHIP',
  agent_count:n,carriers:39,partition:{
   near:CARRIERS.filter(c=>c.near).length,mid:CARRIERS.filter(c=>c.mid).length,
   far:CARRIERS.filter(c=>!c.near&&!c.mid).length},
  model:'BOUNDED_D3_PHI_AGENT_INTERACTION_NO_EMPIRICAL_SWARM_DATA',
  coordinates,alignment,cohesion,separation,
  mean_neighbor_displacement:convergenceOrLast(stats),beat_wavelengths:field.pairs.map(p=>p.wavelengthPx),
  constructive_energy:field.totalEmission,finite_bloom_budget:BEAT_POLICY.peak_budget,
  projection_111:projection.projection,empirical_credit:0,
  render_status:'CANDIDATE_PAINTER_AVAILABLE_NOT_COMPOSER_APPROVED'});
}
function convergenceOrLast(a){return Math.round((a[a.length-1]||0)*1e6)/1e6;}
export function paintSwarmComposition(ctx,model,{intensity=1}={}){
 if(!ctx||typeof ctx.beginPath!=='function'||model?.schema!==SWARM_SCHEMA)throw new TypeError('SWARM_MODEL_AND_CANVAS_REQUIRED');
 const alpha=clamp(intensity),palette=['#fff7de','#ff91af','#b7d9e0'];
 ctx.save();ctx.clearRect(0,0,model.view.width,model.view.height);
 for(const p of model.coordinates){
  const color=p.plane==='NEAR'?'#fff7de':p.plane==='MID'?'#ff91af':'#b7d9e0';
  const stroke=palette[p.id%palette.length];
  ctx.beginPath();
  for(let i=0;i<p.tail.length;i++){
   const xy=p.tail[i];if(i===0)ctx.moveTo(xy[0],xy[1]);else ctx.lineTo(xy[0],xy[1]);
  }
  ctx.strokeStyle=stroke;ctx.globalAlpha=.22*alpha;ctx.lineWidth=.8;ctx.stroke();
  ctx.beginPath();ctx.arc(p.x,p.y,2.3,0,Math.PI*2);
  ctx.globalAlpha=.88*alpha;ctx.fillStyle=color;ctx.fill();
 }
 ctx.restore();return {drawn:true,agents:model.agent_count,model_only:true,
  no_animation_scheduler_created:true,empirical_credit:0};
}
