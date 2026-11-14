/**
 * DD-02 ambient optical bridge · deterministic spatial lattice.
 * Work IDs remain phase seeds only; the selected Works' meanings are never inferred.
 * Inherits the one-clock phase and measured D3/phi carrier pairs from the
 * folded-cuirass/RGI15 model. No new scheduler, observer or authority surface.
 * Material rails are source-over; all screen emission is allocated by the
 * parent compositor. OPERAHOUSE != OPERA != PERFORMER. Closure RESERVED.
 */
export const SALON_FIELD_POLICY=Object.freeze({
  tracks:18,points_per_track:29,connectors:12,material_only:true,
  same_optical_clock:true,external_empirical_credit:0
});
const TAU=2*Math.PI;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const finite=(n)=>Number.isFinite(n)?n:0;
export function buildSalonField({width,height,time=0,field,cx,cy,scale,sourceIds=[]}={}){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)
    throw new RangeError('SALON_FIELD_VIEWPORT_REQUIRED');
  if(!field?.pairs?.length)throw new TypeError('SALON_FIELD_CARRIERS_REQUIRED');
  const pairs=field.pairs,anchors=[];
  // The field is a bounded encounter surface, not a copy of original Aperture,
  // Loom, Dome-Art or Refractive Couture implementation.
  function sample(x,y){
    let d3=0,phi=0,beat=0;
    for(let i=0;i<pairs.length;i+=3){
      const p=pairs[i],mx=finite(p.delta.x)*x+finite(p.delta.y)*y;
      const a=finite(p.d3.x)*x+finite(p.d3.y)*y+finite(p.phaseA)-finite(p.omegaA)*time;
      const b=finite(p.phi.x)*x+finite(p.phi.y)*y+finite(p.phaseB)-finite(p.omegaB)*time;
      d3+=Math.sin(a);phi+=Math.sin(b);
      beat+=Math.sin(mx+finite(p.phaseDelta)-finite(p.deltaOmega)*time);
    }
    const n=Math.ceil(pairs.length/3);
    return {d3:d3/n,phi:phi/n,beat:beat/n};
  }
  const goalX=Number.isFinite(cx)?cx:width*.72,goalY=Number.isFinite(cy)?cy:height*.5;
  const size=Number.isFinite(scale)?scale:height*.8;
  const trails=[];
  for(let side=0;side<2;side++)for(let k=0;k<9;k++){
    const pts=[],track=(k-4)/4;
    for(let i=0;i<=28;i++){
      const t=i/28;
      // Approach the chrome from opposite lateral bounds, without crossing
      // the manuscript's actual text foreground.
      const x=side?(width*1.07+(goalX+size*.17-width*1.07)*t):
        (-width*.10+(goalX-size*.14+width*.10)*t);
      const y=goalY+track*height*.49*(1-.44*t);
      const m=sample(x*.16,y*.19);
      const bend=height*(.041*m.d3+.034*m.phi+.060*m.beat)*(Math.sin(Math.PI*t)**2);
      pts.push([x,y+bend]);
    }
    trails.push({points:pts,side,index:k,color:k%3===0?'champagne':k%3===1?'pink':'pearl'});
  }
  // Nodes remain tied to the exact carrier paths; zero random particles.
  const nodes=[];
  for(let i=0;i<trails.length;i+=2){
    for(const j of [7,18,26]){
      const p=trails[i].points[j];if(p[0]>=0&&p[0]<=width&&p[1]>=0&&p[1]<=height)
        nodes.push({x:p[0],y:p[1],energy:.35+.45*Math.abs(sample(p[0]*.16,p[1]*.19).beat)});
    }
  }
  // Twelve sewn radial connections identify one chrome body, not a floating widget.
  for(let i=0;i<12;i++){
    const angle=i/12*TAU,rad=size*.27;
    anchors.push([goalX+Math.sin(angle)*rad,goalY+Math.cos(angle)*rad*.48]);
  }
  return {width,height,time,sourceIds:[...sourceIds],trails,nodes,anchors,
    metadata:{pairs:pairs.length,clock_source:'FOLDED_CUIRASS_SHARED',claim_class:'ARTISTIC_VISUAL_ONLY'}};
}
/** Source-conditioned D3/phi rail samples interpolated as continuous silk
 * ribbons, rather than a jagged telemetry plot. Half as many path segments
 * and no new clocks, sampling sources, or authority-bearing identities. */
function traceSilk(ctx,points){
 if(!points.length)return;
 ctx.moveTo(points[0][0],points[0][1]);
 for(let i=2;i<points.length;i+=2)
  ctx.quadraticCurveTo(points[i-1][0],points[i-1][1],points[i][0],points[i][1]);
 if((points.length-1)%2)ctx.lineTo(points.at(-1)[0],points.at(-1)[1]);
}
/** Spatially entangled couture optics. The same garment clock drives all
 * trails, nerves, crossings and bounded particle blooms; no independent RAF.
 * These are finite artistic signals, not observed electromagnetic measurements.
 */
export function paintSalonField(ctx,m){
 const layout=buildSalonField(m);
 const {width:W,height:H,cx,cy,scale,time}=m;
 const tones={pink:'#ff73b7',pearl:'#fffaf5',champagne:'#fff0bc'};
 const charge=n=>.5+.5*Math.sin(time*1.42+n*2.399);
 ctx.save();
 ctx.globalCompositeOperation='source-over';
 const haloR=Math.min(H*.48,scale*.60,280);
 const halo=ctx.createRadialGradient(cx,cy,3,cx,cy,haloR);
 halo.addColorStop(0,'rgba(255,253,224,.20)');
 halo.addColorStop(.23,'rgba(255,237,179,.12)');
 halo.addColorStop(.51,'rgba(255,92,170,.065)');
 halo.addColorStop(1,'rgba(255,92,170,0)');
 ctx.globalAlpha=.66;ctx.fillStyle=halo;
 ctx.fillRect(cx-haloR,cy-haloR,haloR*2,haloR*2);
 // Three finite halo batches replace 18 individually blurred strokes.
 // Crisp phase-conditioned lines remain independent so source-driven pulses
 // survive batching, with no new scheduler, new emission surface or GPU claim.
 for(const tone of ['champagne','pink','pearl']){
  ctx.beginPath();
  for(const lane of layout.trails){
   if(lane.color!==tone)continue;
   traceSilk(ctx,lane.points);
  }
  ctx.strokeStyle=tones[tone];
  ctx.shadowColor=tone==='champagne'?'#ffdda6':'#ff65ad';
  ctx.shadowBlur=Math.min(15,H*.025);
  ctx.lineWidth=2.7;ctx.globalAlpha=.36;
  ctx.stroke();
 }
 ctx.shadowBlur=0;
 for(const lane of layout.trails){
  const light=charge(lane.index+9*lane.side);
  ctx.beginPath();
  traceSilk(ctx,lane.points);
  ctx.strokeStyle=tones[lane.color];
  ctx.lineWidth=lane.index%3===0?2.1:1.25;
  ctx.globalAlpha=Math.min(.82,.31+.43*light);
  ctx.stroke();
 }
 // Sew crossing connections into the same D3/phi trajectories.
 for(let j=5;j<=26;j+=7)for(let k=0;k<8;k++){
  const left=layout.trails[k].points[j];
  const right=layout.trails[k+1].points[Math.min(28,j+2)];
  ctx.beginPath();ctx.moveTo(left[0],left[1]);
  ctx.lineTo((left[0]+right[0])*.5,(left[1]+right[1])*.5-H*.012);
  ctx.lineTo(right[0],right[1]);
  ctx.strokeStyle=k%3===0?tones.champagne:tones.pink;
  ctx.lineWidth=.82;ctx.globalAlpha=.19+.12*charge(j+k);ctx.stroke();
 }
 // Deterministic bounded particle blooms mark computed locations, never random noise.
 for(let i=0;i<layout.nodes.length;i++){
  const p=layout.nodes[i],power=p.energy*(.5+.5*charge(i));
  const r=Math.min(12,4+13*power);
  const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
  glow.addColorStop(0,'rgba(255,255,247,.94)');
  glow.addColorStop(.13,i%3===0?'rgba(255,239,179,.64)':'rgba(255,98,180,.60)');
  glow.addColorStop(.5,'rgba(255,120,196,.10)');
  glow.addColorStop(1,'rgba(255,120,196,0)');
  ctx.globalAlpha=Math.min(.75,.28+power*.55);
  ctx.fillStyle=glow;ctx.fillRect(p.x-r,p.y-r,r*2,r*2);
  ctx.beginPath();ctx.ellipse(p.x,p.y,i%5===0?1.65:.85,i%5===0?1.65:.85,0,0,TAU);
  ctx.globalAlpha=.76;ctx.fillStyle=i%3===0?tones.champagne:tones.pearl;ctx.fill();
 }
 // A three-axis refractive orbit around the computed waist, with dark channels.
 for(const [j,tilt] of [[0,-.24],[1,.20],[2,-.45]]){
  ctx.beginPath();ctx.ellipse(cx,cy,scale*(.48+j*.055),scale*(.21+j*.025),tilt,0,TAU);
  ctx.strokeStyle=j===0?tones.champagne:j===1?tones.pink:tones.pearl;
  ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=Math.min(18,H*.025);
  ctx.lineWidth=j===1?1.25:.90;
  ctx.globalAlpha=.43+.22*charge(j+40);ctx.stroke();
 }
 ctx.shadowBlur=0;
 // Active rays end at the garment's sewn anchors.
 for(let k=0;k<layout.anchors.length;k++){
  const a=layout.anchors[k],p=layout.trails[k%layout.trails.length].points[18];
  const ray=ctx.createLinearGradient(p[0],p[1],a[0],a[1]);
  ray.addColorStop(0,'rgba(255,108,186,0)');
  ray.addColorStop(.65,k%2?'rgba(255,98,166,.62)':'rgba(255,232,180,.56)');
  ray.addColorStop(1,'rgba(255,252,233,.93)');
  ctx.beginPath();ctx.moveTo(p[0],p[1]);
  ctx.lineTo((p[0]+a[0])*.55,(p[1]+a[1])*.55-H*.01);
  ctx.lineTo(a[0],a[1]);
  ctx.strokeStyle=ray;ctx.lineWidth=1.2;ctx.globalAlpha=.40+.22*charge(k+63);
  ctx.stroke();
 }
 ctx.restore();
 return layout;
}
