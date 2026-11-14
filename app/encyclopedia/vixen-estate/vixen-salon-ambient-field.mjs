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
export function paintSalonField(ctx,m){
  const layout=buildSalonField(m);
  ctx.save();
  ctx.globalCompositeOperation='source-over';
  const colors={pink:'#ff73b7',pearl:'#f5fbfa',champagne:'#fff0bd'};
  for(const lane of layout.trails){
    ctx.beginPath();
    lane.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    ctx.strokeStyle=colors[lane.color];
    ctx.lineWidth=lane.index%3===0?1.4:.72;
    ctx.globalAlpha=lane.index%3===0?.54:.34;
    ctx.stroke();
  }
  for(let i=0;i<layout.nodes.length;i++){
    const p=layout.nodes[i];
    ctx.beginPath();ctx.ellipse(p.x,p.y,i%3===0?1.8:1.05,i%3===0?1.8:1.05,0,0,TAU);
    ctx.fillStyle=i%3===0?colors.champagne:colors.pink;ctx.globalAlpha=clamp(p.energy*.8,0,.75);ctx.fill();
  }
  ctx.globalAlpha=.43;ctx.lineWidth=.7;ctx.strokeStyle=colors.champagne;
  ctx.beginPath();
  ctx.ellipse(m.cx,m.cy,m.scale*.48,m.scale*.20,-.17,0,TAU);ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(m.cx,m.cy,m.scale*.55,m.scale*.25,.21,0,TAU);ctx.stroke();
  // Linked anchors lead into the central garment; those optical paths
  // inherit its active phase but cannot overwrite or interpret source data.
  for(let k=0;k<layout.anchors.length;k++){
    const a=layout.anchors[k],lane=layout.trails[k%layout.trails.length];
    const p=lane.points[18];
    ctx.globalAlpha=.28;ctx.lineWidth=.65;ctx.strokeStyle=k%2?colors.pink:colors.pearl;
    ctx.beginPath();ctx.moveTo(p[0],p[1]);
    ctx.lineTo((p[0]+a[0])*.5,(p[1]+a[1])*.5);
    ctx.lineTo(a[0],a[1]);ctx.stroke();
  }
  ctx.restore();
  return layout;
}
