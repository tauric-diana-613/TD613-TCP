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
import {measureCoutureBeats,allocateBloom} from './vixen-beat-radiometry-rgi15.mjs';
import {CARRIERS} from './observatory-foundry-kernel.mjs';
import {buildSalonField,paintSalonField,paintFieldSpark,traceFieldPath} from './vixen-salon-ambient-field.mjs';

// Developer rollback only; no extra visitor mode or second deliverable.
export const SALON_COMPOSITOR='FOLDED_CHROME';
export const CUIRASS_CONTRACT=Object.freeze({
 schema:'td613.vixen.folded-cuirass/v1',role:'OPERA_VISUAL_ONLY',
 source_capture:'TWO_EXISTING_WORK_IDS_AS_RENDER_PARAMETERS',
 geometry:'PREPAINT_D3_PHI_OPEN_FOLDS_AND_CONNECTED_DIAMOND_LATTICE',
 empirical_credit:0,human_closure:'RESERVED',experiment_b_flight:'HELD'
});
export const CUIRASS_POLICY=Object.freeze({
 panels:12,angular_steps:72,vertical_steps:32,carriers:39,
 max_dpr:1.25,max_backing_pixels:1500000,desktop_fps:24,mobile_fps:12,
 // Only the fixed-reference glints use screen blending.
 total_emission_alpha:1.20,
 max_radial_strain:.14,max_angular_shear:.035,
 display_contrast_candidate:'Adjacent seam/trough byte-luma ratio >= 3, trough <= 45; browser measurement pending'
});
const TAU=2*Math.PI,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
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
export function buildFoldedCuirass({width,height,time=0,sourceIds=[],beatToGeometryGain=1,integrated=width>800}={}){
 if(![width,height,time,beatToGeometryGain].every(Number.isFinite)||width<=0||height<=0)
  throw new RangeError('CUIRASS_FINITE_INPUT_REQUIRED');
 const gain=clamp(beatToGeometryGain),ids=sourceIds.slice(0,2).map(String);
 const seed=hash(ids.join('|')||'VIXEN_NEUTRAL');
 // A fixed material chart keeps the cut invariant under viewport projection.
 const field=measureCoutureBeats({width:360,height:420,time,seed,devicePixelRatio:1});
 const scale=Math.min(width*(integrated?.50:.94),height*.82);
 const cx=width*(integrated?.735:.5),cy=height*.49;
 // Slow three-quarter articulation exposes rear stays through open cells.
 const yaw=.19+.13*Math.sin(time*.34),cs=Math.cos(yaw),sn=Math.sin(yaw);
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
  const neckline=-.43-.105*Math.pow(Math.abs(Math.sin(a)),5)+.055*Math.cos(a);
  const hem=.39+.055*Math.pow(Math.max(0,Math.cos(a)),6);
  const y=mix(neckline,hem,t)+g*.008*f.direction[1]*Math.sin(Math.PI*t);
  return {p:[x*cs+z*sn,y,z*cs-x*sn],field:f,u,t,fold};
 }
 const project=p=>[cx+p[0]*scale,cy+(p[1]-.16*p[2])*scale,p[2]];
 const N=CUIRASS_POLICY.angular_steps,M=CUIRASS_POLICY.vertical_steps;
 const stripHalfWidth=t=>.0095*(.78+.38*Math.sin(Math.PI*t));
 const grid=Array.from({length:N+1},(_,i)=>Array.from({length:M+1},(_,j)=>{
  const v=surface(i/N,j/M);return {...v,screen:project(v.p)};
 }));
 // The shell grid is a material chart, NOT a filled skin. Twelve folded
 // strips cover at most 27% of its angular extent; the rest is open.
 // Each strip has five continuous facets with a raised arris. All samples,
 // normals and ribbon boundaries exist before any material/paint operation.
 const metalStrips=[],faces=[];
 const stripCuts=[-1,-.52,-.12,.12,.52,1];
 for(let i=0;i<12;i++){
  const u=i/12,columns=stripCuts.map(q=>Array.from({length:M+1},(_,j)=>{
   const t=j/M;
   const halfWidth=stripHalfWidth(t);
   const v=surface(u+q*halfWidth,t);
   const arris=.009*(1-Math.abs(q))*(.7+.3*Math.sin(Math.PI*t));
   const a=(u+q*halfWidth)*TAU;
   const n=[Math.sin(a)*cs+Math.cos(a)*sn,0,Math.cos(a)*cs-Math.sin(a)*sn];
   const p=v.p.map((x,k)=>x+n[k]*arris);
   return {...v,p,screen:project(p)};
  }));
  const bands=[];
  for(let k=0;k<5;k++){
   const left=columns[k],right=columns[k+1];
   const normal=unit(cross(sub(right[16].p,left[16].p),sub(left[17].p,left[16].p)));
   const points=[...left.map(v=>v.screen),...right.map(v=>v.screen).reverse()];
   const band={points,normal,geometricNormal:normal,panel:i,facet:k,
    depth:(left[16].p[2]+right[16].p[2])/2};
   bands.push(band);faces.push(band);
  }
  metalStrips.push({index:i,bands,depth:bands[2].depth,
   edges:[columns[0],columns[5]].map(c=>c.map(v=>v.screen)),
   crest:columns[2].map(v=>v.screen)});
 }
 metalStrips.sort((a,b)=>a.depth-b.depth);
 // Staggered circumferential rows form triangular/diamond cells on the
 // deformed chart. Shared vertex objects make every connection exact.
 const latticeNodes=[],latticeEdges=[],rows=13,cols=24;
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const u=(i+(j%2)*.5)/cols,t=j/(rows-1),v=surface(u,t);
  latticeNodes.push({id:j*cols+i,row:j,col:i,u,t,point:project(v.p),field:v.field});
 }
 const link=(a,b,kind)=>{
  const steps=4,points=[a.point];
  let du=b.u-a.u;if(du>.5)du-=1;if(du<-.5)du+=1;
  for(let k=1;k<steps;k++)points.push(project(surface(a.u+du*k/steps,mix(a.t,b.t,k/steps)).p));
  points.push(b.point);
  latticeEdges.push({a:a.id,b:b.id,kind,points,depth:(a.point[2]+b.point[2])/2});
 };
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const a=latticeNodes[j*cols+i];
  if(j%3===0)link(a,latticeNodes[j*cols+(i+1)%cols],'weft');
  if(j<rows-1)for(const d of [0,j%2?1:-1])
   link(a,latticeNodes[(j+1)*cols+(i+d+cols)%cols],'bias');
 }
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
 const model={width,height,time,seed,sourceIds:ids,gain,scale,cx,cy,field,grid,faces,metalStrips,openAngularFraction:1-24*stripHalfWidth(.5),latticeNodes,latticeEdges,seams,rims,filaments,tensionRings,glints,bounds,
  metrics:{seamLength:seams.reduce((n,s)=>n+lengths(s.points),0),filamentLength:filaments.reduce((n,s)=>n+lengths(s.points),0),
   contourWidth:bounds.right-bounds.left,contourHeight:bounds.bottom-bounds.top},
  emissionAllocated:glints.reduce((n,p)=>n+p.energy,0)*.5};
 model.scene=buildSalonField(model);
 return model;
}

function trace(ctx,points,close=false){
 ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
 if(close)ctx.closePath();
}
function stroke(ctx,points,color,width=1,alpha=1){
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=alpha;trace(ctx,points);ctx.stroke();
}
function frontSegments(points,minDepth=0,front=true){
 const segments=[];let current=[];
 for(const p of points){
  if(front?p[2]>=minDepth:p[2]<minDepth)current.push(p);
  else if(current.length){if(current.length>1)segments.push(current);current=[];}
 }
 if(current.length>1)segments.push(current);
 return segments;
}
/** A reflected studio is evaluated separately on each folded metal facet.
 * Longitudinal gradients travel with material coordinates, while the moving
 * sheet/contact phase modulates the reflected rose/champagne light. Nothing
 * fills the open cells; back ribs remain visible through them. */
function stripChrome(ctx,band,m){
 const a=band.points[0],b=band.points[CUIRASS_POLICY.vertical_steps];
 const gradient=ctx.createLinearGradient(a[0],a[1],b[0],b[1]);
 const facing=Math.abs(band.normal[2]);
 const spec=clamp(.22+.66*facing+(band.facet===2?.15:0));
 const phase=m.time*.24+band.panel*.47+m.field.pairs[0].phaseDelta;
 const hot=.44+.19*Math.sin(phase);
 const tone=(base)=>{
  const v=Math.round(base*(.44+.56*spec));return `rgb(${v},${Math.min(255,v+5)},${Math.min(255,v+7)})`;
 };
 const stops=[[0,tone(120)],[.08,'#fff3d2'],[.17,tone(48)],
  [Math.max(.19,hot-.15),tone(180)],[hot-.035,'#fffaf0'],[hot,'#ffffff'],
  [hot+.045,band.panel%2?'#ffa4cb':'#fff0bc'],[Math.min(.85,hot+.16),tone(29)],
  [.89,tone(210)],[.97,'#fff3d9'],[1,tone(50)]];
 for(const [t,c] of stops.sort((a,b)=>a[0]-b[0]))gradient.addColorStop(t,c);
 return gradient;
}
function paintMetal(ctx,m,front){
 for(const strip of m.metalStrips){
  if((strip.depth>=0)!==front)continue;
  ctx.globalCompositeOperation='source-over';
  for(const band of strip.bands){
   ctx.globalAlpha=front?1:.55;
   ctx.fillStyle=stripChrome(ctx,band,m);trace(ctx,band.points,true);ctx.fill();
  }
  // Dark machined recess beside the raised arris makes reflected light
  // dimensional even in Still; edge glints do not substitute for volume.
  stroke(ctx,strip.crest,'#101a20',front?1.6:1,front?.82:.45);
  for(const edge of strip.edges)stroke(ctx,edge,'#fff2d1',front?.85:.55,front?.90:.36);
 }
}
function paintWeave(ctx,m,front){
 // Batch by color/depth; all edges meet the same prepaint node objects.
 for(const [kind,color] of [['bias','#ffc0df'],['weft','#fff0bd']]){
  ctx.beginPath();
  for(const e of m.latticeEdges)if((e.depth>=0)===front&&e.kind===kind)traceFieldPath(ctx,e.points);
  ctx.globalCompositeOperation='source-over';ctx.strokeStyle=color;
  ctx.lineWidth=front?.72:.5;ctx.globalAlpha=front?.56:.20;ctx.stroke();
 }
 const charge=(m.time*.09)%1;
 for(const n of m.latticeNodes){
  if((n.point[2]>=0)!==front)continue;
  const distance=Math.abs(((n.t-charge+n.col/24+1.5)%1)-.5);
  const power=Math.exp(-distance*distance/ .0018)*(.35+.65*(.5+.5*n.field.beat));
  if(power>.32&&n.col%2===0)paintFieldSpark(ctx,n.point,power*(front?1:.45),n.col%3===0?'champagne':'pink',m.scale);
 }
 // Articulated 39-carrier filaments carry a longitudinal pulse at material
 // speed. Rear carriers paint first; chrome stays then occlude them.
 for(const f of m.filaments){
  for(const points of frontSegments(f.points,0,front))stroke(ctx,points,f.near?'#fff0bc':f.mid?'#ff80bb':'#f5e8e7',f.near?.95:.45,front?.50:.16);
 }
}
export function paintFoldedCuirass(ctx,m,{optics=true}={}){
 const {width:W,height:H,scale,cx,cy}=m;
 ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 ctx.clearRect(0,0,W,H);
 const bg=ctx.createLinearGradient(0,0,W,H);
 bg.addColorStop(0,'#2b3034');bg.addColorStop(.5,'#222b31');bg.addColorStop(1,'#080e13');
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 if(!optics){ctx.restore();return {rendered:true,optics:false};}
 const scene=m.scene;
 paintSalonField(ctx,m,{layer:'back'});
 // The pedestal has a rim, wall and inset floor, with space above it.
 const py=cy+scale*.48,pr=scale*.44;
 const plinth=ctx.createLinearGradient(cx-pr,0,cx+pr,0);
 for(const [t,c] of [[0,'#1a252d'],[.14,'#fff4de'],[.23,'#35454e'],[.49,'#ebf5f5'],[.51,'#27333b'],[.82,'#ffcee1'],[1,'#151e24']])plinth.addColorStop(t,c);
 ctx.fillStyle=plinth;ctx.globalAlpha=1;ctx.beginPath();ctx.ellipse(cx,py,pr,scale*.049,0,0,TAU);ctx.fill();
 ctx.fillStyle='#10191f';ctx.beginPath();ctx.ellipse(cx,py-scale*.022,pr,scale*.035,0,0,TAU);ctx.fill();
 for(const r of [1,.89,.68]){
  ctx.beginPath();ctx.ellipse(cx,py-scale*.022,pr*r,scale*.035*r,0,0,TAU);
  ctx.strokeStyle=r===1?'#fff1c2':'#ff9ac9';ctx.lineWidth=r===1?1.7:.7;ctx.globalAlpha=r===1?.88:.38;ctx.stroke();
 }
 paintMetal(ctx,m,false);paintWeave(ctx,m,false);
 paintWeave(ctx,m,true);paintMetal(ctx,m,true);
 for(const rim of m.rims)for(const segment of frontSegments(rim)){
  stroke(ctx,segment,'#0a1219',3.8,1);stroke(ctx,segment,'#fff1c7',1.65,.96);
 }
 // Foreground field paths cross the open cells and attach to exact lattice
 // junctions, with traveling pulses continuous into the page-wide projection.
 paintSalonField(ctx,m,{layer:'front'});
 ctx.globalCompositeOperation='screen';
 for(const {x,y,bloomRadius:r,energy} of m.glints){
  const glint=ctx.createRadialGradient(x,y,0,x,y,r);
  glint.addColorStop(0,'#fff7de');glint.addColorStop(.27,'rgba(255,192,221,.35)');
  glint.addColorStop(1,'rgba(255,192,221,0)');
  ctx.fillStyle=glint;ctx.globalAlpha=energy*.5;ctx.fillRect(x-r,y-r,2*r,2*r);
 }
 ctx.restore();
 return {rendered:true,faces:m.faces.length,materialBatchCount:m.metalStrips.length,
  openAngularFraction:m.openAngularFraction,carriers:39,sceneTracks:scene.trails.length,
  sceneNodes:scene.nodes.length,junctions:m.latticeNodes.length,peaks:m.glints.length,
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
 let resolution=null,paintCosts=[],geometryFrames=0;
 const held=()=>reduced.matches||motion?.getAttribute('aria-pressed')==='true'||doc.body.dataset.vixenMotion==='still'||getState().resting;
 const active=()=>!doc.hidden&&doc.body.dataset.view==='collection'&&doc.body.dataset.activeResearchStage!=='OPERAHOUSE';
 const cancel=()=>{if(raf)win.cancelAnimationFrame(raf);raf=0;lastMs=null;};
 function paint(){
  const r=canvas.getBoundingClientRect();if(r.width<2||r.height<2)return;
  const start=win.performance.now();
  const sourceIds=getState().works;
  if(!visible){
   // The room remains alive below its hero, with the SAME clock and Work
   // phases. Skip hidden metal construction; only the visible room cloth draws.
   win.VixenLivingMesh?.renderHostFrame?.({time:clock.time,sourceIds,
    view:'collection',held:!!held(),force:dirty});
   frames++;dirty=false;last={phase:clock.time,sourceIds,garmentVisible:false,empirical_credit:0};return;
  }
  const back=coutureBackingSize(r.width,r.height,win.devicePixelRatio||1);
  if(canvas.width!==back.width||canvas.height!==back.height){canvas.width=back.width;canvas.height=back.height;}
  ctx.setTransform(back.width/r.width,0,0,back.height/r.height,0,0);
  const m=buildFoldedCuirass({width:r.width,height:r.height,time:clock.time,sourceIds,integrated:win.innerWidth?win.innerWidth>740:r.width>800});
  const painted=paintFoldedCuirass(ctx,m);geometryFrames++;
  win.VixenLivingMesh?.renderHostFrame?.({time:clock.time,sourceIds:m.sourceIds,
   scene:m.scene,stageRect:{left:r.left,top:r.top,width:r.width,height:r.height},
   view:'collection',held:!!held(),force:dirty});
  paintCosts.push(win.performance.now()-start);if(paintCosts.length>120)paintCosts.shift();
  frames++;dirty=false;
  last={...painted,garmentVisible:true,phase:clock.time,sourceIds:m.sourceIds,viewport:{width:r.width,height:r.height},backing:back,
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
 mo.observe(doc.body,{attributes:true,attributeFilter:['data-view','data-active-research-stage','data-vixen-motion']});
 reduced.addEventListener('change',schedule);doc.addEventListener('visibilitychange',schedule);
 win.addEventListener('resize',schedule,{passive:true});
 win.addEventListener('vixen:fieldlayout',schedule);trackDpr();
 return Object.freeze({mounted:true,contract:CUIRASS_CONTRACT,renderOnce:schedule,
  getStatus:()=>({frames,geometryFrames,still:!!held(),visible,scheduled:!!raf,last,
   paintP95Ms:paintCosts.length?[...paintCosts].sort((a,b)=>a-b)[Math.ceil(paintCosts.length*.95)-1]:null}),
  dispose(){disposed=true;cancel();io.disconnect();ro.disconnect();mo.disconnect();
   reduced.removeEventListener('change',schedule);resolution?.removeEventListener('change',onDpr);
   doc.removeEventListener('visibilitychange',schedule);win.removeEventListener('resize',schedule);win.removeEventListener('vixen:fieldlayout',schedule);}
 });
}
