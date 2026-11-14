/**
 * DD-02 · Vixen folded chrome cuirass. One optical compositor, no source-body
 * interpretation. Work IDs seed rendering parameters only.
 *
 * Inheritance: RGI15's Aperture-derived wave-vector subtraction and finite
 * bloom allocator. The shell, analytic field derivatives, folded gores,
 * reflected studio bands and scheduler below are newly authored for Vixen.
 * No Living Geometry/Flow-Core source transplant or scientific equivalence.
 * OPERAHOUSE ≠ OPERA ≠ PERFORMER. Human closure RESERVED; empirical credit 0.
 */
import {measureCoutureBeats,allocateBloom,BEAT_POLICY} from './vixen-beat-radiometry-rgi15.mjs';
import {CARRIERS} from './observatory-foundry-kernel.mjs';
import {paintSalonField} from './vixen-salon-ambient-field.mjs';

// Developer rollback only; no extra visitor mode or second deliverable.
export const SALON_COMPOSITOR='FOLDED_CHROME';
export const CUIRASS_CONTRACT=Object.freeze({
 schema:'td613.vixen.folded-cuirass/v1',role:'OPERA_VISUAL_ONLY',
 source_capture:'TWO_EXISTING_WORK_IDS_AS_RENDER_PARAMETERS',
 geometry:'PREPAINT_D3_PHI_BEAT_AND_ANALYTIC_DERIVATIVES',
 empirical_credit:0,human_closure:'RESERVED',experiment_b_flight:'HELD'
});
export const CUIRASS_POLICY=Object.freeze({
 panels:12,angular_steps:72,vertical_steps:32,carriers:39,
 max_dpr:1.25,max_backing_pixels:1500000,desktop_fps:24,mobile_fps:12,
 // Every emissive draw shares these alpha allocations. Chrome is reflected
 // material in source-over; all screen emission obeys an aggregate 3.72 alpha ceiling.
 emission:Object.freeze({glints:1.20,seams:.42,filaments:.28,lattice:.12,waist:.85,beams:.85,haze:0,rails:0,fills:0}),
 total_emission_alpha:3.72,max_bloom_css_px:18,
 max_radial_strain:.14,max_angular_shear:.035,
 display_contrast_candidate:'Adjacent seam/trough byte-luma ratio >= 3, trough <= 45; browser measurement pending'
});
const TAU=2*Math.PI,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
const dot=(a,b)=>a.reduce((v,n,i)=>v+n*b[i],0);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l)};
const hash=s=>{let n=2166136261;for(const c of s){n^=c.codePointAt(0);n=Math.imul(n,16777619)>>>0}return n};
/** Separately sampleable carriers and their difference; derivatives are with
 * respect to the unrolled material coordinates, before any Canvas call. */
export function sampleCuirassFields(pairs,x,y,time=0){
 let d3=0,phi=0,beat=0,gx=0,gy=0,bound=0;
 for(const p of pairs){
  const a=p.d3.x*x+p.d3.y*y+p.phaseA-p.omegaA*time;
  const b=p.phi.x*x+p.phi.y*y+p.phaseB-p.omegaB*time;
  const d=p.delta.x*x+p.delta.y*y+p.phaseDelta-p.deltaOmega*time;
  d3+=Math.cos(a);phi+=Math.cos(b);beat+=Math.cos(d);
  gx-=Math.sin(d)*p.delta.x;gy-=Math.sin(d)*p.delta.y;
  bound+=Math.hypot(p.delta.x,p.delta.y);
 }
 const n=pairs.length||1;
 return {d3:d3/n,phi:phi/n,beat:beat/n,gradient:[gx/n,gy/n],
  direction:[gx/(bound||1),gy/(bound||1)],envelope:clamp(((1+beat/n)*.5-.57)/.43)};
}

export function coutureBackingSize(width,height,dpr=1){
 if(![width,height,dpr].every(Number.isFinite)||width<=0||height<=0||dpr<=0)
  throw new RangeError('CUIRASS_VIEWPORT_REQUIRED');
 const scale=Math.min(dpr,CUIRASS_POLICY.max_dpr,Math.sqrt(CUIRASS_POLICY.max_backing_pixels/(width*height)));
 return {width:Math.max(1,Math.floor(width*scale)),height:Math.max(1,Math.floor(height*scale)),dpr:scale};
}

/** Returned geometry is complete and paint-independent. The gain-zero probe
 * fixes Work pair, phase, base shell, camera AND the glint allocation/positions.
 * It changes only deformation; glints remain active for a clean intervention. */
export function buildFoldedCuirass({width,height,time=0,sourceIds=[],beatToGeometryGain=1}={}){
 if(![width,height,time,beatToGeometryGain].every(Number.isFinite)||width<=0||height<=0)
  throw new RangeError('CUIRASS_FINITE_INPUT_REQUIRED');
 const gain=clamp(beatToGeometryGain),ids=sourceIds.slice(0,2).map(String);
 const seed=hash(ids.join('|')||'VIXEN_NEUTRAL');
 // A fixed material chart keeps the cut invariant under viewport projection.
 const field=measureCoutureBeats({width:360,height:420,time,seed,devicePixelRatio:1});
 const integrated=width>800;
 const scale=Math.min(width*(integrated?.50:.94),height*.82);
 const cx=width*(integrated?.735:.5),cy=height*.49;
 const yaw=.23,cs=Math.cos(yaw),sn=Math.sin(yaw);
 function surface(u,t,g=gain){
  const angle=u*TAU;
  // Periodic material coordinates close the shell exactly at u=0/1.
  const f=sampleCuirassFields(field.pairs,48*Math.sin(angle),76*t+20*Math.cos(angle),time);
  const strain=g*clamp(.11*f.beat+.03*f.direction[1],-.14,.14);
  const shear=g*.035*f.direction[0]*Math.sin(Math.PI*t);
  const a=angle+shear;
  const base=t<.46?mix(.36,.174,smooth(t/.46)):mix(.174,.405,smooth((t-.46)/.54));
  // A creased ridge within each gore; fold depth responds before shading.
  const fold=Math.pow((1-Math.cos(angle*CUIRASS_POLICY.panels))*.5,1.5);
  const foldDepth=(.013+.010*g*f.beat)*Math.sin(Math.PI*(.08+.84*t));
  const r=base*(1+strain)+foldDepth*fold;
  const x=Math.sin(a)*r,z=Math.cos(a)*r*.58;
  // Raised wings, a dipped centre neckline and pointed busk/hem.
  const neckline=-.43-.072*Math.pow(Math.abs(Math.sin(a)),5)+.032*Math.cos(a);
  const hem=.39+.055*Math.pow(Math.max(0,Math.cos(a)),6);
  const y=mix(neckline,hem,t)+g*.008*f.direction[1]*Math.sin(Math.PI*t);
  return {p:[x*cs+z*sn,y,z*cs-x*sn],field:f,u,t,fold};
 }
 const project=p=>[cx+p[0]*scale,cy+(p[1]-.16*p[2])*scale,p[2]];
 const N=CUIRASS_POLICY.angular_steps,M=CUIRASS_POLICY.vertical_steps;
 const grid=Array.from({length:N+1},(_,i)=>Array.from({length:M+1},(_,j)=>{
  const v=surface(i/N,j/M);return {...v,screen:project(v.p)};
 }));
 // Geometry retains the original face normals for silhouette/culling.
 // Reflective material uses local smooth normals INSIDE each tailored gore.
 // This avoids the checkerboard response of independent per-quad highlights
 // while preserving discontinuous dark seam undercuts and real beat-fold geometry.
 const patchNormals=Array.from({length:N},(_,i)=>Array.from({length:M},(_,j)=>{
  const v=[grid[i][j],grid[i+1][j],grid[i+1][j+1],grid[i][j+1]];
  return unit(cross(sub(v[1].p,v[0].p),sub(v[3].p,v[0].p)));
 }));
 const faces=[],panelWidth=N/CUIRASS_POLICY.panels;
 const smoothMaterialNormal=(i,j,normal)=>{
  const acc=[0,0,0],start=Math.floor(i/panelWidth)*panelWidth;
  let weight=0;
  // Within-gore 3x3 smoothing preserves the independent geometric normal
  // while avoiding 25 source-point weighted calculations per painted facet.
  for(let du=-1;du<=1;du++)for(let dv=-1;dv<=1;dv++){
   const ii=i+du,jj=j+dv;
   if(ii<start||ii>=start+panelWidth||jj<0||jj>=M)continue;
   const neighbour=patchNormals[ii][jj];
   if(dot(normal,neighbour)<.55||neighbour[2]+.16*neighbour[1]<=0)continue;
   const w=(2-Math.abs(du))*(2-Math.abs(dv));
   for(let k=0;k<3;k++)acc[k]+=w*neighbour[k];
   weight+=w;
  }
  return weight?unit(acc):normal;
 };
 for(let i=0;i<N;i++)for(let j=0;j<M;j++){
  const v=[grid[i][j],grid[i+1][j],grid[i+1][j+1],grid[i][j+1]];
  const normal=patchNormals[i][j];
  if(normal[2]+.16*normal[1]<=0)continue;
  faces.push({points:v.map(p=>p.screen),normal:smoothMaterialNormal(i,j,normal),
   geometricNormal:normal,panel:Math.floor(i/panelWidth),
   depth:v.reduce((n,p)=>n+p.p[2],0)/4,
   t:(j+.5)/M,u:(i+.5)/N,fold:v.reduce((n,p)=>n+p.fold,0)/4});
 }
 faces.sort((a,b)=>a.depth-b.depth);
 const path=(u,t0=0,t1=1,g=gain,steps=48)=>Array.from({length:steps+1},(_,j)=>{
  const t=mix(t0,t1,j/steps);return project(surface(u,t,g).p);
 });
 const seams=Array.from({length:12},(_,i)=>({points:path(i/12),u:i/12}));
 const rims=[0,1].map(t=>Array.from({length:145},(_,i)=>project(surface(i/144,t).p)));
 const filaments=CARRIERS.map((carrier,i)=>{
  const points=[],u0=i/39;
  for(let j=0;j<=32;j++){
   const t=j/32,f=surface(u0,t).field;
   // Bent joints follow the derivative of the same beat as the shell.
   const u=u0+gain*.018*f.direction[0]*Math.sin(Math.PI*t);
   const p=surface(u,t).p;
   const lift=.012+.011*Math.sin(Math.PI*t)**2;
   points.push(project([p[0]*(1+lift),p[1],p[2]+lift]));
  }
  return {points,index:i,near:carrier.near,mid:carrier.mid};
 });
 // Peaks belong to fixed reference material stations, independently of the
 // intervention gain. Compare their identical data as a negative control.
 const stations=[];
 for(let i=0;i<24;i++)for(let j=0;j<=16;j++){
  const v=surface(i/24,j/16,0),p=project(v.p);
  if(v.p[2]>.015)stations.push({x:p[0],y:p[1],envelope:v.field.envelope});
 }
 const glints=allocateBloom(stations);
 // Ten transverse material tension lines derive from the same prepaint
 // beat-deformed material coordinates as the corset seam/hem geometry.
 const tensionRings=Array.from({length:10},(_,k)=>{
  const j=2+3*k,vertices=grid.map(column=>column[j]);
  const envelope=vertices.reduce((v,p)=>v+p.field.envelope,0)/vertices.length;
  return {row:j,points:vertices.map(v=>v.screen),envelope};
 });
 const lengths=points=>points.slice(1).reduce((n,p,i)=>n+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0);
 const bounds=grid.flat().reduce((b,v)=>({left:Math.min(b.left,v.screen[0]),right:Math.max(b.right,v.screen[0]),
  top:Math.min(b.top,v.screen[1]),bottom:Math.max(b.bottom,v.screen[1])}),{left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity});
 return {width,height,time,seed,sourceIds:ids,gain,scale,cx,cy,field,grid,faces,seams,rims,filaments,tensionRings,glints,bounds,
  metrics:{seamLength:seams.reduce((n,s)=>n+lengths(s.points),0),filamentLength:filaments.reduce((n,s)=>n+lengths(s.points),0),
   contourWidth:bounds.right-bounds.left,contourHeight:bounds.bottom-bounds.top},
  emissionAllocated:glints.reduce((n,p)=>n+p.energy,0)*(.5)+.42+.28+.12+.85+.85};
}

function trace(ctx,points,close=false){
 ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
 if(close)ctx.closePath();
}
function stroke(ctx,points,color,width=1,alpha=1){
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=alpha;trace(ctx,points);ctx.stroke();
}
function frontSegments(points,minDepth=0){
 const segments=[];let current=[];
 for(const p of points){
  if(p[2]>=minDepth)current.push(p);
  else if(current.length){if(current.length>1)segments.push(current);current=[];}
 }
 if(current.length>1)segments.push(current);
 return segments;
}
/**
 * One coherent studio illumination across the complete folded surface.
 * A per-quad flat color caused the old tiled/checkerboard chrome. Paint all
 * visible quads with the *same* gradient coordinate field, leaving geometry,
 * seam undercuts, carrier filaments and finite glow individually accountable.
 *
 * Work-pair phase shifts only the studio-light position; it is an artistic
 * parameter, never a claim about an author's content or physical energy.
 */
function studioChrome(ctx,m){
 const p=m.field.pairs[0],phase=(p?.phaseDelta||0)-(p?.deltaOmega||0)*m.time;
 const shift=Math.sin(phase)*m.scale*.033;
 const x0=m.cx-m.scale*.57+shift,x1=m.cx+m.scale*.57+shift;
 const light=ctx.createLinearGradient(x0,m.cy-m.scale*.08,x1,m.cy+m.scale*.08);
 const stops=[
  [0,'#11191f'],[.10,'#667982'],[.155,'#fff7ee'],[.205,'#b3c4c8'],
  [.26,'#293a42'],[.315,'#f9e3f0'],[.365,'#7c9096'],
  [.425,'#19252d'],[.49,'#fffaf2'],[.55,'#c2d3d5'],
  [.605,'#34454c'],[.67,'#fff2ce'],[.715,'#91a1a6'],
  [.765,'#253139'],[.84,'#fce4ed'],[.91,'#78888e'],[1,'#121a21']
 ];
 for(const [offset,color] of stops)light.addColorStop(offset,color);
 return light;
}

/** Refractive material is source-over. Finite additive-looking emission
 * is one bounded screen pass; its sum is an alpha policy, not energy physics. */
export function paintFoldedCuirass(ctx,m,{optics=true}={}){
 const {width:W,height:H,scale,cx,cy}=m;
 ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 ctx.clearRect(0,0,W,H);
 const bg=ctx.createLinearGradient(0,0,W,H);
 bg.addColorStop(0,'#28353b');bg.addColorStop(.34,'#1b252b');bg.addColorStop(.66,'#10181e');bg.addColorStop(1,'#070c10');
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 if(!optics){ctx.restore();return {rendered:true,optics:false};}
 // Field-continuous architecture inherits this frame and clock: no second animation.
 const scene=paintSalonField(ctx,m);
 // Small chrome pedestal uses material shading; no glow outside the garment.
 const py=cy+scale*.48,pr=scale*.43;
 const plinth=ctx.createLinearGradient(cx-pr,0,cx+pr,0);
 for(const [t,c] of [[0,'#171f25'],[.13,'#9ba9ad'],[.23,'#202b33'],[.45,'#e6e8df'],[.50,'#343c42'],[.83,'#a8b4b9'],[1,'#0b1218']])plinth.addColorStop(t,c);
 ctx.fillStyle=plinth;ctx.beginPath();ctx.ellipse(cx,py,pr,scale*.027,0,0,TAU);ctx.fill();
 ctx.fillStyle='#0a1015';ctx.beginPath();ctx.ellipse(cx,py-scale*.009,pr*.95,scale*.014,0,0,TAU);ctx.fill();
 // Back rim precedes faces, preserving a visible hollow neckline.
 stroke(ctx,m.rims[0],'#77888e',2.3,.65);
 // The material reflection has one screen-continuous coordinate field.
 // The mathematical gore contours still deform independently before paint.
 const metal=studioChrome(ctx,m);
 // Twelve grouped gores keep every analytically constructed front face while
 // batching hundreds of software-raster fill/stroke calls into <=12 fills.
 // One continuous reflective gradient preserves light/dark variation; the
 // undercut seams and refraction-driven tension lines remain separate passes.
 const materialBands=Array.from({length:CUIRASS_POLICY.panels},()=>[]);
 for(const face of m.faces)materialBands[face.panel].push(face);
 const visibleBands=materialBands.filter(group=>group.length>0)
  .sort((a,b)=>a.reduce((n,f)=>n+f.depth,0)/a.length-
   b.reduce((n,f)=>n+f.depth,0)/b.length);
 // A shared high-luminance chrome gradient restores reflective highlights
 // without abandoning the source-beat transparent optical field.
 ctx.fillStyle=metal;ctx.globalAlpha=.72;
 for(const group of visibleBands){
  ctx.beginPath();
  for(const face of group){
   ctx.moveTo(face.points[0][0],face.points[0][1]);
   for(let i=1;i<face.points.length;i++)ctx.lineTo(face.points[i][0],face.points[i][1]);
   ctx.closePath();
  }
  ctx.fill();
 }
 // Ten prepaint transverse conductors turn the metal silhouette into a
 // legible tailored cage; material highlights are source-over, never a new RAF.
 ctx.shadowColor='#ffc1e2';ctx.shadowBlur=Math.min(9,scale*.020);
 for(let i=0;i<m.tensionRings.length;i++){
  const ring=m.tensionRings[i];
  for(const segment of frontSegments(ring.points,.02)){
   stroke(ctx,segment,i%3===0?'#fff5d4':i%3===1?'#ffcae5':'#dff8ff',
    i%3===0?1.55:.95,.43+.28*ring.envelope);
  }
 }
 ctx.shadowBlur=0;
 // Glowing-but-material circuit junctions follow actual ring/seam crossings.
 for(let k=0;k<m.tensionRings.length;k+=2){
  const ring=m.tensionRings[k];
  for(let i=0;i<ring.points.length;i+=9){
   const p=ring.points[i];if(p[2]<=.03)continue;
   ctx.beginPath();ctx.ellipse(p[0],p[1],1.55,1.55,0,0,TAU);
   ctx.fillStyle=(k+i)%3===0?'#fff3b5':'#ff9bcf';
   ctx.globalAlpha=.50+.32*ring.envelope;ctx.fill();
  }
 }
 // Capped metal seams. The dark undercut establishes a trough before light.
 const front=m.seams.filter(s=>s.points[24][2]>0);
 for(const s of front){
  stroke(ctx,s.points,'#05090c',4.5,1);
  const r=ctx.createLinearGradient(cx-scale*.4,0,cx+scale*.4,0);
  for(const [t,c] of [[0,'#74848b'],[.18,'#fff9e6'],[.28,'#34444d'],[.55,'#e4eef0'],[.7,'#7c8689'],[1,'#fff0c5']])r.addColorStop(t,c);
  stroke(ctx,s.points,r,2.4,1);
  stroke(ctx,s.points,'#fff7e7',.65,.65);
 }
 for(const rim of m.rims){
  for(const segment of frontSegments(rim)){
   stroke(ctx,segment,'#070c10',5,1);
   stroke(ctx,segment,'#f2e4bf',2.0,.9);
  }
 }
 // Radiating material paths follow the same 39 carriers without masking chrome.
 // Chrome material filaments preserve the 6/13/20 carrier census and
 // follow the beat-deformed joints. Rear strands remain culled pointwise.
 for(const f of m.filaments){
  for(const segment of frontSegments(f.points,.03))
   stroke(ctx,segment,f.near?'#fff0bc':f.mid?'#f6c2e8':'#aebec8',f.near?1.15:.72,f.near?.82:f.mid?.60:.35);
 }
 ctx.globalCompositeOperation='screen';
 // Bounded visual discharge: the garment emits through its own calculated seams.
 for(const s of front)stroke(ctx,s.points,'#ffe8ae',1.7,.42/Math.max(1,front.length));
 const hot=m.filaments.filter(f=>f.near).flatMap(f=>frontSegments(f.points,.03));
 for(const f of hot){
  stroke(ctx,f,'#ff4e9b',1.8,.28/Math.max(1,hot.length));
 }
 // Reserve finite emission for the shared field and a distinct waist peak.
 for(let i=0;i<6;i++){
  const a=scene.trails[i*3].points;
  stroke(ctx,a,i%2?'#ffc0e2':'#fff2cb',1.4,.12/6);
 }
 // A finite champagne-pink waist flash makes field-to-garment conduction visible.
 const wRadius=Math.min(m.scale*.30,126);
 const waist=ctx.createRadialGradient(cx,cy,0,cx,cy,wRadius);
 waist.addColorStop(0,'rgba(255,255,252,1)');
 waist.addColorStop(.10,'rgba(255,246,192,.94)');
 waist.addColorStop(.27,'rgba(255,155,203,.58)');
 waist.addColorStop(.59,'rgba(255,75,158,.14)');
 waist.addColorStop(1,'rgba(255,75,158,0)');
 ctx.globalAlpha=.85;ctx.fillStyle=waist;
 ctx.fillRect(cx-wRadius,cy-wRadius,2*wRadius,2*wRadius);
 // Two bright spatial discharge paths concentrate light rather than
 // dispersing the entire finite beam budget across four faint lines.
 // Geometry and intensity remain phase-bound to the chosen Work pair.
 for(let i=0;i<2;i++){
  const source=scene.trails[i*8+2].points[19],seam=m.seams[i?9:3].points[18];
  const beam=ctx.createLinearGradient(source[0],source[1],seam[0],seam[1]);
  beam.addColorStop(0,'rgba(255,95,164,0)');
  beam.addColorStop(.55,i%2?'rgba(255,110,180,.85)':'rgba(255,232,166,.85)');
  beam.addColorStop(1,'rgba(255,253,237,1)');
  ctx.shadowColor=i%2?'#ff7abd':'#ffe3a0';
  ctx.shadowBlur=Math.min(18,m.scale*.055);
  const pulse=.65+.35*(.5+.5*Math.sin(m.time*1.9+i*1.6));
  stroke(ctx,[source,[(source[0]+seam[0])*.5,(source[1]+seam[1])*.5-m.scale*.016],seam],
   beam,2.6,(.85/2)*pulse);
 }
 ctx.shadowBlur=0;
 for(const p of m.glints){
  const r=Math.min(p.bloomRadius,BEAT_POLICY.max_bloom_css_px);
  const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
  glow.addColorStop(0,'rgba(255,253,230,1)');glow.addColorStop(.08,'rgba(255,233,184,.85)');
  glow.addColorStop(.26,'rgba(255,104,158,.22)');glow.addColorStop(.65,'rgba(255,104,158,.035)');
  glow.addColorStop(1,'rgba(255,104,158,0)');
  ctx.globalAlpha=p.energy*.5;ctx.fillStyle=glow;ctx.fillRect(p.x-r,p.y-r,2*r,2*r);
 }
 ctx.restore();
 return {rendered:true,faces:m.faces.length,materialBatchCount:visibleBands.length,carriers:39,sceneTracks:scene.trails.length,sceneNodes:scene.nodes.length,peaks:m.glints.length,
  emissionAlpha:m.emissionAllocated,physicalEnergyConserved:false,empirical_credit:0};
}

/** One Salon clock. Still freezes phase; reduced motion/Rest never schedules
 * recurring paints. Resize and resolution media-query events invalidate even
 * while paused. Work updates repaint once at the retained phase. */
export function mountFoldedCuirass(canvas,getState){
 const win=canvas?.ownerDocument?.defaultView,doc=canvas?.ownerDocument;
 if(!win||typeof getState!=='function')return {mounted:false,reason:'NO_VISUAL_HOST'};
 const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)return {mounted:false,reason:'CANVAS2D_UNAVAILABLE'};
 const motion=doc.getElementById('motionBtn');
 const reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
 const clock=getState().opticalClock||{time:0};
 let raf=0,disposed=false,visible=false,lastMs=null,lastPaint=-Infinity,dirty=true,frames=0,last=null;
 let resolution=null,paintCosts=[];
 const held=()=>reduced.matches||motion?.getAttribute('aria-pressed')==='true'||getState().resting;
 const active=()=>visible&&!doc.hidden&&doc.body.dataset.view==='collection'&&doc.body.dataset.activeResearchStage!=='OPERAHOUSE';
 const cancel=()=>{if(raf)win.cancelAnimationFrame(raf);raf=0;lastMs=null;};
 function paint(){
  const r=canvas.getBoundingClientRect();if(r.width<2||r.height<2)return;
  const start=win.performance.now(),back=coutureBackingSize(r.width,r.height,win.devicePixelRatio||1);
  if(canvas.width!==back.width||canvas.height!==back.height){canvas.width=back.width;canvas.height=back.height;}
  ctx.setTransform(back.width/r.width,0,0,back.height/r.height,0,0);
  const m=buildFoldedCuirass({width:r.width,height:r.height,time:clock.time,sourceIds:getState().works});
  const painted=paintFoldedCuirass(ctx,m);
  // The full-viewport ambient mesh inherits this one active Salon clock.
  const electrodes=[0,3,9].map(i=>{
   const point=m.seams[i].points[24];
   return {x:r.left+point[0],y:r.top+point[1]};
  });
  win.VixenLivingMesh?.renderHostFrame?.({time:clock.time,sourceIds:m.sourceIds,
   electrodes,view:'collection',force:dirty});
  paintCosts.push(win.performance.now()-start);if(paintCosts.length>120)paintCosts.shift();
  frames++;dirty=false;
  last={...painted,phase:clock.time,sourceIds:m.sourceIds,viewport:{width:r.width,height:r.height},backing:back,
   metrics:m.metrics,geometryBounds:m.bounds,beatWavelengths:m.field.pairs.map(p=>p.wavelengthPx),
   contrast:'UNMEASURED_BROWSER_PIXELS',frameClass:'LOCAL_RENDER_MODEL_ONLY'};
 }
 function tick(ms){
  raf=0;if(disposed||!active()){lastMs=null;return;}
  if(lastMs!==null&&!held())clock.time+=Math.min(.1,Math.max(0,(ms-lastMs)/1000));
  lastMs=ms;
  const interval=1000/(canvas.clientWidth<500?CUIRASS_POLICY.mobile_fps:CUIRASS_POLICY.desktop_fps);
  if(dirty||(!held()&&ms-lastPaint>=interval)){paint();lastPaint=ms;}
  if(!held())raf=win.requestAnimationFrame(tick);else lastMs=null;
 }
 function schedule(){
  cancel();dirty=true;if(!disposed&&active())raf=win.requestAnimationFrame(tick);
 }
 function trackDpr(){
  resolution?.removeEventListener('change',onDpr);
  resolution=win.matchMedia(`(resolution: ${win.devicePixelRatio||1}dppx)`);
  resolution.addEventListener('change',onDpr);
 }
 function onDpr(){trackDpr();schedule();}
 const io=new win.IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);schedule();},{threshold:0});
 io.observe(canvas);
 const ro=new win.ResizeObserver(schedule);ro.observe(canvas);
 const mo=new win.MutationObserver(schedule);
 if(motion)mo.observe(motion,{attributes:true,attributeFilter:['aria-pressed']});
 mo.observe(doc.body,{attributes:true,attributeFilter:['data-view','data-active-research-stage']});
 reduced.addEventListener('change',schedule);doc.addEventListener('visibilitychange',schedule);
 win.addEventListener('resize',schedule,{passive:true});trackDpr();
 return Object.freeze({mounted:true,contract:CUIRASS_CONTRACT,renderOnce:schedule,
  getStatus:()=>({frames,still:!!held(),visible,scheduled:!!raf,last,
   paintP95Ms:paintCosts.length?[...paintCosts].sort((a,b)=>a-b)[Math.ceil(paintCosts.length*.95)-1]:null}),
  dispose(){disposed=true;cancel();io.disconnect();ro.disconnect();mo.disconnect();
   reduced.removeEventListener('change',schedule);resolution?.removeEventListener('change',onDpr);
   doc.removeEventListener('visibilitychange',schedule);win.removeEventListener('resize',schedule);}
 });
}
