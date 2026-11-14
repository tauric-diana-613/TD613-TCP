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
const hash=s=>{let n=2166136261;for(const c of s){n^=c.codePointAt(0);n=Math.imul(n,16777619)>>>0}return n};
const pairBoundCache=new WeakMap();
const CHROME_TROUGH_LUT=Array.from({length:256},(_,v)=>`rgb(${Math.max(8,Math.round(v*.12))},${Math.max(11,Math.round(v*.15))},${Math.max(15,Math.round(v*.18))})`);
const CHROME_ROSE_LUT=Array.from({length:256},(_,v)=>`rgb(${Math.min(255,Math.round(182+v*.28))},${Math.min(255,Math.round(124+v*.24))},${Math.min(255,Math.round(156+v*.22))})`);
const CHROME_MERCURY_LUT=Array.from({length:256},(_,v)=>`rgb(${Math.min(255,Math.round(145+v*.34))},${Math.min(255,Math.round(152+v*.34))},${Math.min(255,Math.round(160+v*.33))})`);
function getPairBound(pairs){
 let bound=pairBoundCache.get(pairs);
 if(bound===undefined){
  bound=0;
  for(let i=0;i<pairs.length;i++){
   const d=pairs[i].delta;
   bound+=Math.hypot(d.x,d.y);
  }
  pairBoundCache.set(pairs,bound);
 }
 return bound;
}
/** Separately sampleable carriers and their difference; derivatives are with
 * respect to the unrolled material coordinates, before any Canvas call. */
export function sampleCuirassFields(pairs,x,y,time=0){
 let d3=0,phi=0,beat=0,gx=0,gy=0;
 const len=pairs.length;
 for(let i=0;i<len;i++){
  const p=pairs[i];
  const a=p.d3.x*x+p.d3.y*y+p.phaseA-p.omegaA*time;
  const b=p.phi.x*x+p.phi.y*y+p.phaseB-p.omegaB*time;
  const d=p.delta.x*x+p.delta.y*y+p.phaseDelta-p.deltaOmega*time;
  d3+=Math.cos(a);phi+=Math.cos(b);beat+=Math.cos(d);
  const sd=Math.sin(d);
  gx-=sd*p.delta.x;gy-=sd*p.delta.y;
 }
 const bound=getPairBound(pairs)||1;
 const n=len||1,invN=1/n,beatAvg=beat*invN;
 return {d3:d3*invN,phi:phi*invN,beat:beatAvg,gradient:[gx*invN,gy*invN],
  direction:[gx/bound,gy/bound],envelope:clamp(((1+beatAvg)*.5-.57)/.43)};
}

export function coutureBackingSize(width,height,dpr=1){
 if(![width,height,dpr].every(Number.isFinite)||width<=0||height<=0||dpr<=0)
  throw new RangeError('CUIRASS_VIEWPORT_REQUIRED');
 const scale=Math.min(dpr,CUIRASS_POLICY.max_dpr,Math.sqrt(CUIRASS_POLICY.max_backing_pixels/(width*height)));
 return {width:Math.max(1,Math.floor(width*scale)),height:Math.max(1,Math.floor(height*scale)),dpr:scale};
}

const GRID_N=CUIRASS_POLICY.angular_steps,GRID_M=CUIRASS_POLICY.vertical_steps;
const stripHalfWidth=t=>.0095*(.78+.38*Math.sin(Math.PI*t));
const tFrac=new Float64Array(GRID_M+1),tY=new Float64Array(GRID_M+1),tBase=new Float64Array(GRID_M+1);
const tSinPi=new Float64Array(GRID_M+1),tFoldEnv=new Float64Array(GRID_M+1),tHalfW=new Float64Array(GRID_M+1),tArris=new Float64Array(GRID_M+1);
for(let j=0;j<=GRID_M;j++){
 const t=j/GRID_M,sPi=Math.sin(Math.PI*t);
 tFrac[j]=t;tY[j]=76*t;
 tBase[j]=t<.46?mix(.36,.174,smooth(t/.46)):mix(.174,.405,smooth((t-.46)/.54));
 tSinPi[j]=sPi;tFoldEnv[j]=Math.sin(Math.PI*(.08+.84*t));
 tHalfW[j]=stripHalfWidth(t);tArris[j]=.009*(.7+.3*sPi);
}
const uAng=new Float64Array(GRID_N+1),uSin=new Float64Array(GRID_N+1),uCos=new Float64Array(GRID_N+1),uFold=new Float64Array(GRID_N+1);
const uFx=new Float64Array(GRID_N+1),uCy0=new Float64Array(GRID_N+1),uNeckZ=new Float64Array(GRID_N+1),uHemZ=new Float64Array(GRID_N+1);
for(let i=0;i<=GRID_N;i++){
 const ang=(i/GRID_N)*TAU,sinA=Math.sin(ang),cosA=Math.cos(ang),fHalf=(1-Math.cos(ang*CUIRASS_POLICY.panels))*.5;
 uAng[i]=ang;uSin[i]=sinA;uCos[i]=cosA;uFx[i]=48*sinA;uCy0[i]=20*cosA;uFold[i]=fHalf*Math.sqrt(fHalf);
 const absS=sinA<0?-sinA:sinA,s2=absS*absS,posC=cosA>0?cosA:0,c2=posC*posC;
 uNeckZ[i]=-.43-.105*s2*s2*absS+.055*cosA;uHemZ[i]=.39+.055*c2*c2*c2;
}
const RIM_N=144,uSin144=new Float64Array(RIM_N+1),uCos144=new Float64Array(RIM_N+1),uFold144=new Float64Array(RIM_N+1);
const uFx144=new Float64Array(RIM_N+1),uCy144=new Float64Array(RIM_N+1),uNeck144=new Float64Array(RIM_N+1),uHem144=new Float64Array(RIM_N+1);
for(let i=0;i<=RIM_N;i++){
 const ang=(i/RIM_N)*TAU,sinA=Math.sin(ang),cosA=Math.cos(ang),fHalf=(1-Math.cos(ang*CUIRASS_POLICY.panels))*.5;
 uSin144[i]=sinA;uCos144[i]=cosA;uFx144[i]=48*sinA;uCy144[i]=20*cosA;uFold144[i]=fHalf*Math.sqrt(fHalf);
 const absS=sinA<0?-sinA:sinA,s2=absS*absS,posC=cosA>0?cosA:0,c2=posC*posC;
 uNeck144[i]=-.43-.105*s2*s2*absS+.055*cosA;uHem144[i]=.39+.055*c2*c2*c2;
}
const rS0D=new Float64Array(RIM_N+1),rC0D=new Float64Array(RIM_N+1),rS1D=new Float64Array(RIM_N+1),rC1D=new Float64Array(RIM_N+1),rS2D=new Float64Array(RIM_N+1),rC2D=new Float64Array(RIM_N+1);
const uS0A=new Float64Array(GRID_N+1),uC0A=new Float64Array(GRID_N+1),uS1A=new Float64Array(GRID_N+1),uC1A=new Float64Array(GRID_N+1),uS2A=new Float64Array(GRID_N+1),uC2A=new Float64Array(GRID_N+1);
const uS0B=new Float64Array(GRID_N+1),uC0B=new Float64Array(GRID_N+1),uS1B=new Float64Array(GRID_N+1),uC1B=new Float64Array(GRID_N+1),uS2B=new Float64Array(GRID_N+1),uC2B=new Float64Array(GRID_N+1);
const latOddS0A=new Float64Array(24),latOddC0A=new Float64Array(24),latOddS1A=new Float64Array(24),latOddC1A=new Float64Array(24),latOddS2A=new Float64Array(24),latOddC2A=new Float64Array(24);
const latOddS0B=new Float64Array(24),latOddC0B=new Float64Array(24),latOddS1B=new Float64Array(24),latOddC1B=new Float64Array(24),latOddS2B=new Float64Array(24),latOddC2B=new Float64Array(24);
const LAT_ROWS=13,latTFrac=new Float64Array(LAT_ROWS),latTY=new Float64Array(LAT_ROWS),latTBase=new Float64Array(LAT_ROWS);
const latTSinPi=new Float64Array(LAT_ROWS),latTFoldEnv=new Float64Array(LAT_ROWS);
for(let j=0;j<LAT_ROWS;j++){
 const t=j/(LAT_ROWS-1);
 latTFrac[j]=t;latTY[j]=76*t;
 latTBase[j]=t<.46?mix(.36,.174,smooth(t/.46)):mix(.174,.405,smooth((t-.46)/.54));
 latTSinPi[j]=Math.sin(Math.PI*t);latTFoldEnv[j]=Math.sin(Math.PI*(.08+.84*t));
}
const latS0D=new Float64Array(LAT_ROWS),latC0D=new Float64Array(LAT_ROWS),latS1D=new Float64Array(LAT_ROWS),latC1D=new Float64Array(LAT_ROWS),latS2D=new Float64Array(LAT_ROWS),latC2D=new Float64Array(LAT_ROWS);
const latS0A=new Float64Array(LAT_ROWS),latC0A=new Float64Array(LAT_ROWS),latS1A=new Float64Array(LAT_ROWS),latC1A=new Float64Array(LAT_ROWS),latS2A=new Float64Array(LAT_ROWS),latC2A=new Float64Array(LAT_ROWS);
const latS0B=new Float64Array(LAT_ROWS),latC0B=new Float64Array(LAT_ROWS),latS1B=new Float64Array(LAT_ROWS),latC1B=new Float64Array(LAT_ROWS),latS2B=new Float64Array(LAT_ROWS),latC2B=new Float64Array(LAT_ROWS);
const RIM_FOLD0=tFoldEnv[0],RIM_FOLD1=tFoldEnv[GRID_M];
const tS0D=new Float64Array(GRID_M+1),tC0D=new Float64Array(GRID_M+1),tS1D=new Float64Array(GRID_M+1),tC1D=new Float64Array(GRID_M+1),tS2D=new Float64Array(GRID_M+1),tC2D=new Float64Array(GRID_M+1);
const tS0A=new Float64Array(GRID_M+1),tC0A=new Float64Array(GRID_M+1),tS1A=new Float64Array(GRID_M+1),tC1A=new Float64Array(GRID_M+1),tS2A=new Float64Array(GRID_M+1),tC2A=new Float64Array(GRID_M+1);
const tS0B=new Float64Array(GRID_M+1),tC0B=new Float64Array(GRID_M+1),tS1B=new Float64Array(GRID_M+1),tC1B=new Float64Array(GRID_M+1),tS2B=new Float64Array(GRID_M+1),tC2B=new Float64Array(GRID_M+1);
const cutP=Array.from({length:6},()=>new Array(GRID_M+1)),cutS=Array.from({length:6},()=>new Array(GRID_M+1));
const STRIP_CUTS=[-1,-.52,-.12,.12,.52,1];
const STRIP_LEN=12*6*(GRID_M+1);
const stripI0=new Int16Array(STRIP_LEN),stripFu=new Float64Array(STRIP_LEN),stripAs=new Float64Array(STRIP_LEN),stripAc=new Float64Array(STRIP_LEN);
for(let i=0,idx=0;i<12;i++){
 const u=i/12;
 for(let k=0;k<6;k++){
  const q=STRIP_CUTS[k],abs1=1-Math.abs(q);
  for(let j=0;j<=GRID_M;j++,idx++){
   const uq=u+q*tHalfW[j],ug=(((uq%1)+1)%1)*GRID_N,i0=Math.min(GRID_N-1,Math.floor(ug));
   const arris=tArris[j]*abs1,a=uq*TAU;
   stripI0[idx]=i0;stripFu[idx]=ug-i0;
   stripAs[idx]=Math.sin(a)*arris;stripAc[idx]=Math.cos(a)*arris;
  }
 }
}

/** Returned geometry is complete and paint-independent. The gain-zero probe
 * fixes Work pair, phase, base shell, camera AND the glint allocation/positions.
 * It changes only deformation; glints remain active for a clean intervention. */
export function buildFoldedCuirass({width,height,time=0,sourceIds=[],beatToGeometryGain=1,integrated=width>800,
 route='A_B',lag=30,activeClock=null}={}){
 if(![width,height,time,beatToGeometryGain].every(Number.isFinite)||width<=0||height<=0)
  throw new RangeError('CUIRASS_FINITE_INPUT_REQUIRED');
 const gain=clamp(beatToGeometryGain),ids=sourceIds.slice(0,2).map(String);
 const routeOrder=route==='B_A'?'B_A':'A_B',parity=routeOrder==='B_A'?-1:1;
 const seed=hash(ids.join('|')||'VIXEN_NEUTRAL');
 const field=measureCoutureBeats({width:360,height:420,time,seed,devicePixelRatio:1});
 const pairs=field.pairs,pLen=pairs.length,invN=1/(pLen||1),invBound=1/(getPairBound(pairs)||1);
 const is3=pLen===3;
 const q0=pairs[0],q1=pairs[1],q2=pairs[2];
 const t0A=is3?q0.phaseA-q0.omegaA*time:0,t0B=is3?q0.phaseB-q0.omegaB*time:0,t0D=is3?q0.phaseDelta-q0.deltaOmega*time:0;
 const t1A=is3?q1.phaseA-q1.omegaA*time:0,t1B=is3?q1.phaseB-q1.omegaB*time:0,t1D=is3?q1.phaseDelta-q1.deltaOmega*time:0;
 const t2A=is3?q2.phaseA-q2.omegaA*time:0,t2B=is3?q2.phaseB-q2.omegaB*time:0,t2D=is3?q2.phaseDelta-q2.deltaOmega*time:0;
 const q0d3x=is3?q0.d3.x:0,q0d3y=is3?q0.d3.y:0,q0px=is3?q0.phi.x:0,q0py=is3?q0.phi.y:0,q0dx=is3?q0.delta.x:0,q0dy=is3?q0.delta.y:0;
 const q1d3x=is3?q1.d3.x:0,q1d3y=is3?q1.d3.y:0,q1px=is3?q1.phi.x:0,q1py=is3?q1.phi.y:0,q1dx=is3?q1.delta.x:0,q1dy=is3?q1.delta.y:0;
 const q2d3x=is3?q2.d3.x:0,q2d3y=is3?q2.d3.y:0,q2px=is3?q2.phi.x:0,q2py=is3?q2.phi.y:0,q2dx=is3?q2.delta.x:0,q2dy=is3?q2.delta.y:0;

 const scale=Math.min(width*(integrated?.50:.94),height*.82);
 const cx=width*(integrated?.735:.5),cy=height*.49;
 const yaw=.19+.13*Math.sin(time*.34),cs=Math.cos(yaw),sn=Math.sin(yaw);
 const project3=(x,y,z)=>[cx+x*scale,cy+(y-.16*z)*scale,z];

 function evalSurface(u,t,g=gain,needField=false){
  const angle=u*TAU,sinA=Math.sin(angle),cosA=Math.cos(angle);
  const fx=48*sinA,fy=76*t+20*cosA;
  let d3=0,phi=0,beat=0,gx=0,gy=0;
  if(is3){
   const d0=q0dx*fx+q0dy*fy+t0D,d1=q1dx*fx+q1dy*fy+t1D,d2=q2dx*fx+q2dy*fy+t2D;
   beat=(Math.cos(d0)+Math.cos(d1)+Math.cos(d2))*invN;
   const sd0=Math.sin(d0),sd1=Math.sin(d1),sd2=Math.sin(d2);
   gx=-(sd0*q0dx+sd1*q1dx+sd2*q2dx);gy=-(sd0*q0dy+sd1*q1dy+sd2*q2dy);
   if(needField){
    d3=(Math.cos(q0d3x*fx+q0d3y*fy+t0A)+Math.cos(q1d3x*fx+q1d3y*fy+t1A)+Math.cos(q2d3x*fx+q2d3y*fy+t2A))*invN;
    phi=(Math.cos(q0px*fx+q0py*fy+t0B)+Math.cos(q1px*fx+q1py*fy+t1B)+Math.cos(q2px*fx+q2py*fy+t2B))*invN;
   }
  }else{
   for(let i=0;i<pLen;i++){
    const p=pairs[i],d=p.delta.x*fx+p.delta.y*fy+p.phaseDelta-p.deltaOmega*time,sd=Math.sin(d);
    beat+=Math.cos(d);gx-=sd*p.delta.x;gy-=sd*p.delta.y;
    if(needField){d3+=Math.cos(p.d3.x*fx+p.d3.y*fy+p.phaseA-p.omegaA*time);phi+=Math.cos(p.phi.x*fx+p.phi.y*fy+p.phaseB-p.omegaB*time);}
   }
   d3*=invN;phi*=invN;beat*=invN;
  }
  const dirX=gx*invBound,dirY=gy*invBound,env=clamp(((1+beat)*.5-.57)/.43);
  const sinPiT=Math.sin(Math.PI*t);
  const strain=g*clamp(.11*beat+.03*dirY,-.14,.14);
  const shear=g*parity*.035*dirX*sinPiT;
  const a=angle+shear;
  const base=t<.46?mix(.36,.174,smooth(t/.46)):mix(.174,.405,smooth((t-.46)/.54));
  const fHalf=(1-Math.cos(angle*CUIRASS_POLICY.panels))*.5,fold=fHalf*Math.sqrt(fHalf);
  const foldDepth=(.013+.010*g*beat)*Math.sin(Math.PI*(.08+.84*t));
  const r=base*(1+strain)+foldDepth*fold;
  const sinS=Math.sin(a),cosS=Math.cos(a),x=sinS*r,z=cosS*r*.58;
  const absS=sinS<0?-sinS:sinS,s2=absS*absS,posC=cosS>0?cosS:0,c2=posC*posC;
  const neckline=-.43-.105*s2*s2*absS+.055*cosS;
  const hem=.39+.055*c2*c2*c2;
  const y=mix(neckline,hem,t)+g*.008*dirY*sinPiT;
  const p=[x*cs+z*sn,y,z*cs-x*sn];
  if(!needField)return p;
  return {p,screen:project3(p[0],p[1],p[2]),u,t,fold,
   field:{d3,phi,beat,gradient:[gx*invN,gy*invN],direction:[dirX,dirY],envelope:env}};
 }

 const N=GRID_N,M=GRID_M;
 if(is3){
  for(let k=0;k<=RIM_N;k++){
   const fx=uFx144[k],cy0=uCy144[k];
   const d0=q0dx*fx+q0dy*cy0,d1=q1dx*fx+q1dy*cy0,d2=q2dx*fx+q2dy*cy0;
   rS0D[k]=Math.sin(d0);rC0D[k]=Math.cos(d0);rS1D[k]=Math.sin(d1);rC1D[k]=Math.cos(d1);rS2D[k]=Math.sin(d2);rC2D[k]=Math.cos(d2);
  }
  for(let i=0;i<=N;i++){
   const fx=uFx[i],cy0=uCy0[i];
   const a0=q0d3x*fx+q0d3y*cy0,a1=q1d3x*fx+q1d3y*cy0,a2=q2d3x*fx+q2d3y*cy0;
   const b0=q0px*fx+q0py*cy0,b1=q1px*fx+q1py*cy0,b2=q2px*fx+q2py*cy0;
   uS0A[i]=Math.sin(a0);uC0A[i]=Math.cos(a0);uS1A[i]=Math.sin(a1);uC1A[i]=Math.cos(a1);uS2A[i]=Math.sin(a2);uC2A[i]=Math.cos(a2);
   uS0B[i]=Math.sin(b0);uC0B[i]=Math.cos(b0);uS1B[i]=Math.sin(b1);uC1B[i]=Math.cos(b1);uS2B[i]=Math.sin(b2);uC2B[i]=Math.cos(b2);
  }
  for(let i=0;i<24;i++){
   const k=6*i+3,fx=uFx144[k],cy0=uCy144[k];
   const a0=q0d3x*fx+q0d3y*cy0,a1=q1d3x*fx+q1d3y*cy0,a2=q2d3x*fx+q2d3y*cy0;
   const b0=q0px*fx+q0py*cy0,b1=q1px*fx+q1py*cy0,b2=q2px*fx+q2py*cy0;
   latOddS0A[i]=Math.sin(a0);latOddC0A[i]=Math.cos(a0);latOddS1A[i]=Math.sin(a1);latOddC1A[i]=Math.cos(a1);latOddS2A[i]=Math.sin(a2);latOddC2A[i]=Math.cos(a2);
   latOddS0B[i]=Math.sin(b0);latOddC0B[i]=Math.cos(b0);latOddS1B[i]=Math.sin(b1);latOddC1B[i]=Math.cos(b1);latOddS2B[i]=Math.sin(b2);latOddC2B[i]=Math.cos(b2);
  }
  for(let j=0;j<=M;j++){
   const fy=tY[j];
   const d0=q0dy*fy+t0D,d1=q1dy*fy+t1D,d2=q2dy*fy+t2D;
   const a0=q0d3y*fy+t0A,a1=q1d3y*fy+t1A,a2=q2d3y*fy+t2A;
   const b0=q0py*fy+t0B,b1=q1py*fy+t1B,b2=q2py*fy+t2B;
   tS0D[j]=Math.sin(d0);tC0D[j]=Math.cos(d0);tS1D[j]=Math.sin(d1);tC1D[j]=Math.cos(d1);tS2D[j]=Math.sin(d2);tC2D[j]=Math.cos(d2);
   tS0A[j]=Math.sin(a0);tC0A[j]=Math.cos(a0);tS1A[j]=Math.sin(a1);tC1A[j]=Math.cos(a1);tS2A[j]=Math.sin(a2);tC2A[j]=Math.cos(a2);
   tS0B[j]=Math.sin(b0);tC0B[j]=Math.cos(b0);tS1B[j]=Math.sin(b1);tC1B[j]=Math.cos(b1);tS2B[j]=Math.sin(b2);tC2B[j]=Math.cos(b2);
  }
  for(let j=0;j<LAT_ROWS;j++){
   const fy=latTY[j];
   const d0=q0dy*fy+t0D,d1=q1dy*fy+t1D,d2=q2dy*fy+t2D;
   const a0=q0d3y*fy+t0A,a1=q1d3y*fy+t1A,a2=q2d3y*fy+t2A;
   const b0=q0py*fy+t0B,b1=q1py*fy+t1B,b2=q2py*fy+t2B;
   latS0D[j]=Math.sin(d0);latC0D[j]=Math.cos(d0);latS1D[j]=Math.sin(d1);latC1D[j]=Math.cos(d1);latS2D[j]=Math.sin(d2);latC2D[j]=Math.cos(d2);
   latS0A[j]=Math.sin(a0);latC0A[j]=Math.cos(a0);latS1A[j]=Math.sin(a1);latC1A[j]=Math.cos(a1);latS2A[j]=Math.sin(a2);latC2A[j]=Math.cos(a2);
   latS0B[j]=Math.sin(b0);latC0B[j]=Math.cos(b0);latS1B[j]=Math.sin(b1);latC1B[j]=Math.cos(b1);latS2B[j]=Math.sin(b2);latC2B[j]=Math.cos(b2);
  }
 }

 const grid=new Array(N+1);
 let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
 for(let i=0;i<=N;i++){
  const u=i/N,baseSin=uSin[i],baseCos=uCos[i],fold=uFold[i],col=new Array(M+1);
  if(!is3){
   for(let j=0;j<=M;j++){
    const v=evalSurface(u,tFrac[j],gain,true),sc=v.screen;
    if(sc[0]<left)left=sc[0];if(sc[0]>right)right=sc[0];
    if(sc[1]<top)top=sc[1];if(sc[1]>bottom)bottom=sc[1];
    col[j]=v;
   }
  }else{
   const k2=i*2;
   const uS0d=rS0D[k2],uC0d=rC0D[k2],uS1d=rS1D[k2],uC1d=rC1D[k2],uS2d=rS2D[k2],uC2d=rC2D[k2];
   const uS0a=uS0A[i],uC0a=uC0A[i],uS1a=uS1A[i],uC1a=uC1A[i],uS2a=uS2A[i],uC2a=uC2A[i];
   const uS0b=uS0B[i],uC0b=uC0B[i],uS1b=uS1B[i],uC1b=uC1B[i],uS2b=uS2B[i],uC2b=uC2B[i];
   for(let j=0;j<=M;j++){
    const t=tFrac[j],sinPiT=tSinPi[j],base=tBase[j];
    const cd0=uC0d*tC0D[j]-uS0d*tS0D[j],sd0=uS0d*tC0D[j]+uC0d*tS0D[j];
    const cd1=uC1d*tC1D[j]-uS1d*tS1D[j],sd1=uS1d*tC1D[j]+uC1d*tS1D[j];
    const cd2=uC2d*tC2D[j]-uS2d*tS2D[j],sd2=uS2d*tC2D[j]+uC2d*tS2D[j];
    const beat=(cd0+cd1+cd2)*invN;
    const gx=-(sd0*q0dx+sd1*q1dx+sd2*q2dx),gy=-(sd0*q0dy+sd1*q1dy+sd2*q2dy);
    const d3=((uC0a*tC0A[j]-uS0a*tS0A[j])+(uC1a*tC1A[j]-uS1a*tS1A[j])+(uC2a*tC2A[j]-uS2a*tS2A[j]))*invN;
    const phi=((uC0b*tC0B[j]-uS0b*tS0B[j])+(uC1b*tC1B[j]-uS1b*tS1B[j])+(uC2b*tC2B[j]-uS2b*tS2B[j]))*invN;
    const dirX=gx*invBound,dirY=gy*invBound,env=clamp(((1+beat)*.5-.57)/.43);
    const strain=gain*clamp(.11*beat+.03*dirY,-.14,.14);
    const shear=gain*parity*.035*dirX*sinPiT,sh2=shear*shear;
    const cosSh=1-.5*sh2,sinSh=shear*(1-sh2*.16666666666666666);
    const sinS=baseSin*cosSh+baseCos*sinSh,cosS=baseCos*cosSh-baseSin*sinSh;
    const r=base*(1+strain)+(.013+.010*gain*beat)*tFoldEnv[j]*fold;
    const x=sinS*r,z=cosS*r*.58;
    const absS=sinS<0?-sinS:sinS,s2=absS*absS,posC=cosS>0?cosS:0,c2=posC*posC;
    const neckline=-.43-.105*s2*s2*absS+.055*cosS;
    const hem=.39+.055*c2*c2*c2;
    const y=neckline+(hem-neckline)*t+gain*.008*dirY*sinPiT;
    const px=x*cs+z*sn,pz=z*cs-x*sn,sx=cx+px*scale,sy=cy+(y-.16*pz)*scale;
    if(sx<left)left=sx;if(sx>right)right=sx;
    if(sy<top)top=sy;if(sy>bottom)bottom=sy;
    col[j]={p:[px,y,pz],screen:[sx,sy,pz],u,t,fold,
     field:{d3,phi,beat,gradient:[gx*invN,gy*invN],direction:[dirX,dirY],envelope:env}};
   }
  }
  grid[i]=col;
 }

 const sampleBilinearPoint=(u,t)=>{
  const uw=((u%1)+1)%1,ug=uw*N,tg=clamp(t)*M;
  const i0=Math.min(N-1,Math.floor(ug)),j0=Math.min(M-1,Math.floor(tg));
  const fu=ug-i0,ft=tg-j0,w00=(1-fu)*(1-ft),w10=fu*(1-ft),w01=(1-fu)*ft,w11=fu*ft;
  const a=grid[i0][j0].p,b=grid[i0+1][j0].p,c=grid[i0][j0+1].p,d=grid[i0+1][j0+1].p;
  return [a[0]*w00+b[0]*w10+c[0]*w01+d[0]*w11,a[1]*w00+b[1]*w10+c[1]*w01+d[1]*w11,a[2]*w00+b[2]*w10+c[2]*w01+d[2]*w11];
 };

 const metalStrips=[],faces=[];
 for(let i=0,idx=0;i<12;i++){
  for(let k=0;k<6;k++){
   const arrP=cutP[k],arrS=cutS[k];
   for(let j=0;j<=M;j++,idx++){
    const i0=stripI0[idx],fu=stripFu[idx],om=1-fu;
    const pa=grid[i0][j].p,pb=grid[i0+1][j].p;
    const as=stripAs[idx],ac=stripAc[idx];
    const n0=as*cs+ac*sn,n2=ac*cs-as*sn;
    const px=pa[0]*om+pb[0]*fu+n0,py=pa[1]*om+pb[1]*fu,pz=pa[2]*om+pb[2]*fu+n2;
    arrP[j]=[px,py,pz];
    arrS[j]=[cx+px*scale,cy+(py-.16*pz)*scale,pz];
   }
  }
  const bands=[];
  for(let k=0;k<5;k++){
   const lp=cutP[k],rp=cutP[k+1],ls=cutS[k],rs=cutS[k+1];
   const ux=rp[16][0]-lp[16][0],uy=rp[16][1]-lp[16][1],uz=rp[16][2]-lp[16][2];
   const vx=lp[17][0]-lp[16][0],vy=lp[17][1]-lp[16][1],vz=lp[17][2]-lp[16][2];
   const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,nl=Math.hypot(nx,ny,nz)||1;
   const normal=[nx/nl,ny/nl,nz/nl];
   const points=new Array((M+1)*2);
   for(let j=0;j<=M;j++){points[j]=ls[j];points[2*M+1-j]=rs[j];}
   const band={points,normal,geometricNormal:normal,panel:i,facet:k,depth:(lp[16][2]+rp[16][2])*.5};
   bands.push(band);faces.push(band);
  }
  metalStrips.push({index:i,bands,depth:bands[2].depth,edges:[cutS[0].slice(),cutS[5].slice()],crest:cutS[2].slice()});
 }
 metalStrips.sort((a,b)=>a.depth-b.depth);

 const latticeNodes=new Array(312),latticeEdges=[],rows=LAT_ROWS,cols=24;
 if(!is3){
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
   const u=(i+(j%2)*.5)/cols,t=j/(rows-1),v=evalSurface(u,t,gain,true);
   latticeNodes[j*cols+i]={id:j*cols+i,row:j,col:i,u,t,point:v.screen,field:v.field};
  }
 }else{
  for(let j=0;j<rows;j++){
   const odd=j&1,t=latTFrac[j],base=latTBase[j],sinPiT=latTSinPi[j],foldEnv=latTFoldEnv[j];
   const ts0d=latS0D[j],tc0d=latC0D[j],ts1d=latS1D[j],tc1d=latC1D[j],ts2d=latS2D[j],tc2d=latC2D[j];
   const ts0a=latS0A[j],tc0a=latC0A[j],ts1a=latS1A[j],tc1a=latC1A[j],ts2a=latS2A[j],tc2a=latC2A[j];
   const ts0b=latS0B[j],tc0b=latC0B[j],ts1b=latS1B[j],tc1b=latC1B[j],ts2b=latS2B[j],tc2b=latC2B[j];
   for(let i=0;i<cols;i++){
    const k144=6*i+odd*3,u=k144/RIM_N,baseSin=uSin144[k144],baseCos=uCos144[k144],fold=uFold144[k144];
    const us0d=rS0D[k144],uc0d=rC0D[k144],us1d=rS1D[k144],uc1d=rC1D[k144],us2d=rS2D[k144],uc2d=rC2D[k144];
    const us0a=odd?latOddS0A[i]:uS0A[3*i],uc0a=odd?latOddC0A[i]:uC0A[3*i];
    const us1a=odd?latOddS1A[i]:uS1A[3*i],uc1a=odd?latOddC1A[i]:uC1A[3*i];
    const us2a=odd?latOddS2A[i]:uS2A[3*i],uc2a=odd?latOddC2A[i]:uC2A[3*i];
    const us0b=odd?latOddS0B[i]:uS0B[3*i],uc0b=odd?latOddC0B[i]:uC0B[3*i];
    const us1b=odd?latOddS1B[i]:uS1B[3*i],uc1b=odd?latOddC1B[i]:uC1B[3*i];
    const us2b=odd?latOddS2B[i]:uS2B[3*i],uc2b=odd?latOddC2B[i]:uC2B[3*i];
    const cd0=uc0d*tc0d-us0d*ts0d,sd0=us0d*tc0d+uc0d*ts0d;
    const cd1=uc1d*tc1d-us1d*ts1d,sd1=us1d*tc1d+uc1d*ts1d;
    const cd2=uc2d*tc2d-us2d*ts2d,sd2=us2d*tc2d+uc2d*ts2d;
    const beat=(cd0+cd1+cd2)*invN;
    const gx=-(sd0*q0dx+sd1*q1dx+sd2*q2dx),gy=-(sd0*q0dy+sd1*q1dy+sd2*q2dy);
    const d3=((uc0a*tc0a-us0a*ts0a)+(uc1a*tc1a-us1a*ts1a)+(uc2a*tc2a-us2a*ts2a))*invN;
    const phi=((uc0b*tc0b-us0b*ts0b)+(uc1b*tc1b-us1b*ts1b)+(uc2b*tc2b-us2b*ts2b))*invN;
    const dirX=gx*invBound,dirY=gy*invBound,env=clamp(((1+beat)*.5-.57)/.43);
    const strain=gain*clamp(.11*beat+.03*dirY,-.14,.14);
    const shear=gain*parity*.035*dirX*sinPiT,sh2=shear*shear;
    const cosSh=1-.5*sh2,sinSh=shear*(1-sh2*.16666666666666666);
    const sinS=baseSin*cosSh+baseCos*sinSh,cosS=baseCos*cosSh-baseSin*sinSh;
    const r=base*(1+strain)+(.013+.010*gain*beat)*foldEnv*fold;
    const x=sinS*r,z=cosS*r*.58;
    const absS=sinS<0?-sinS:sinS,s2=absS*absS,posC=cosS>0?cosS:0,c2=posC*posC;
    const neckline=-.43-.105*s2*s2*absS+.055*cosS,hem=.39+.055*c2*c2*c2;
    const y=neckline+(hem-neckline)*t+gain*.008*dirY*sinPiT;
    const px=x*cs+z*sn,pz=z*cs-x*sn;
    const id=j*cols+i;
    latticeNodes[id]={id,row:j,col:i,u,t,point:[cx+px*scale,cy+(y-.16*pz)*scale,pz],
     field:{d3,phi,beat,gradient:[gx*invN,gy*invN],direction:[dirX,dirY],envelope:env}};
   }
  }
 }
 const link=(a,b,kind)=>{
  const steps=4,points=new Array(steps+1);
  points[0]=a.point;points[steps]=b.point;
  let du=b.u-a.u;if(du>.5)du-=1;if(du<-.5)du+=1;
  for(let k=1;k<steps;k++){
   const frac=k*.25,uw=(((a.u+du*frac)%1)+1)%1,ug=uw*N,tg=clamp(a.t+(b.t-a.t)*frac)*M;
   const i0=Math.min(N-1,Math.floor(ug)),j0=Math.min(M-1,Math.floor(tg));
   const fu=ug-i0,ft=tg-j0,omU=1-fu,omT=1-ft,w00=omU*omT,w10=fu*omT,w01=omU*ft,w11=fu*ft;
   const pa=grid[i0][j0].p,pb=grid[i0+1][j0].p,pc=grid[i0][j0+1].p,pd=grid[i0+1][j0+1].p;
   const px=pa[0]*w00+pb[0]*w10+pc[0]*w01+pd[0]*w11;
   const py=pa[1]*w00+pb[1]*w10+pc[1]*w01+pd[1]*w11;
   const pz=pa[2]*w00+pb[2]*w10+pc[2]*w01+pd[2]*w11;
   points[k]=[cx+px*scale,cy+(py-.16*pz)*scale,pz];
  }
  latticeEdges.push({a:a.id,b:b.id,kind,points,depth:(a.point[2]+b.point[2])*.5});
 };
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const a=latticeNodes[j*cols+i];
  if(j%3===0)link(a,latticeNodes[j*cols+(i+1)%cols],'weft');
  if(j<rows-1){
   link(a,latticeNodes[(j+1)*cols+i],'bias');
   link(a,latticeNodes[(j+1)*cols+(i+(j%2?1:-1)+cols)%cols],'bias');
  }
 }

 const seams=Array.from({length:12},(_,i)=>{
  const col=grid[i*6],steps=48,pts=new Array(steps+1);
  for(let j=0;j<=steps;j++){
   const tg=(j/steps)*M,j0=Math.min(M-1,Math.floor(tg)),f=tg-j0;
   const a=col[j0].screen,b=col[j0+1].screen;
   pts[j]=[mix(a[0],b[0],f),mix(a[1],b[1],f),mix(a[2],b[2],f)];
  }
  return {points:pts,u:i/12};
 });
 const rims=[0,1].map(t=>{
  if(!is3)return Array.from({length:145},(_,i)=>{
   const p=evalSurface(i/144,t,gain,false);
   return [cx+p[0]*scale,cy+(p[1]-.16*p[2])*scale,p[2]];
  });
  const pts=new Array(RIM_N+1),tj=t===0?0:M,base=t===0?.36:.405,foldEnv=t===0?RIM_FOLD0:RIM_FOLD1;
  const ts0=tS0D[tj],tc0=tC0D[tj],ts1=tS1D[tj],tc1=tC1D[tj],ts2=tS2D[tj],tc2=tC2D[tj];
  const yArr=t===0?uNeck144:uHem144;
  for(let i=0;i<=RIM_N;i++){
   const us0=rS0D[i],uc0=rC0D[i],us1=rS1D[i],uc1=rC1D[i],us2=rS2D[i],uc2=rC2D[i];
   const cd0=uc0*tc0-us0*ts0,sd0=us0*tc0+uc0*ts0;
   const cd1=uc1*tc1-us1*ts1,sd1=us1*tc1+uc1*ts1;
   const cd2=uc2*tc2-us2*ts2,sd2=us2*tc2+uc2*ts2;
   const beat=(cd0+cd1+cd2)*invN,gy=-(sd0*q0dy+sd1*q1dy+sd2*q2dy);
   const dirY=gy*invBound,strain=gain*clamp(.11*beat+.03*dirY,-.14,.14);
   const r=base*(1+strain)+(.013+.010*gain*beat)*foldEnv*uFold144[i];
   const x=uSin144[i]*r,z=uCos144[i]*r*.58,px=x*cs+z*sn,pz=z*cs-x*sn,py=yArr[i];
   pts[i]=[cx+px*scale,cy+(py-.16*pz)*scale,pz];
  }
  return pts;
 });
 const filaments=CARRIERS.map((carrier,i)=>{
  const points=new Array(M+1),u0=i/39,ug0=u0*N,c0=Math.min(N-1,Math.floor(ug0)),fc0=ug0-c0;
  for(let j=0;j<=M;j++){
   const dirX=grid[c0][j].field.direction[0]*(1-fc0)+grid[c0+1][j].field.direction[0]*fc0;
   const uw=(((u0+gain*.018*dirX*tSinPi[j])%1)+1)%1;
   const ug=uw*N,i0=Math.min(N-1,Math.floor(ug)),fu=ug-i0,om=1-fu;
   const pa=grid[i0][j].p,pb=grid[i0+1][j].p,lift=.012+.011*tSinPi[j]*tSinPi[j];
   const px=(pa[0]*om+pb[0]*fu)*(1+lift),py=pa[1]*om+pb[1]*fu,pz=(pa[2]*om+pb[2]*fu)+lift;
   points[j]=[cx+px*scale,cy+(py-.16*pz)*scale,pz];
  }
  return {points,index:i,near:carrier.near,mid:carrier.mid};
 });

 // Un-deformed stationary peaks reuse exact sub-grid indices (i*3, j*2) with gain=0 -> zero field trig calls.
 const stations=[];
 for(let i=0;i<24;i++){
  const gi=i*3,sinA=uSin[gi],cosA=uCos[gi],fold=uFold[gi],neck=uNeckZ[gi],hem=uHemZ[gi];
  for(let j=0;j<=16;j++){
   const gj=j*2,t=tFrac[gj],r=tBase[gj]+.013*tFoldEnv[gj]*fold;
   const x=sinA*r,z=cosA*r*.58,y=neck+(hem-neck)*t,px=x*cs+z*sn,pz=z*cs-x*sn;
   if(pz>.015)stations.push({x:cx+px*scale,y:cy+(y-.16*pz)*scale,envelope:grid[gi][gj].field.envelope});
  }
 }
 const glints=allocateBloom(stations);
 const tensionRings=Array.from({length:10},(_,k)=>{
  const j=2+3*k,ringPoints=new Array(grid.length);
  let envSum=0;
  for(let i=0;i<grid.length;i++){const v=grid[i][j];envSum+=v.field.envelope;ringPoints[i]=v.screen;}
  return {row:j,points:ringPoints,envelope:envSum/grid.length};
 });
 const lengths=points=>{let n=0;for(let i=1;i<points.length;i++)n+=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);return n;};
 const bounds={left,right,top,bottom};
 let emissionAllocated=0;for(let i=0;i<glints.length;i++)emissionAllocated+=glints[i].energy;
 emissionAllocated*=.5;
 let seamLength=0;for(let i=0;i<seams.length;i++)seamLength+=lengths(seams[i].points);
 let filamentLength=0;for(let i=0;i<filaments.length;i++)filamentLength+=lengths(filaments[i].points);
 const radiometry={
  beatWavelengthPx:pairs.map(p=>p.wavelengthPx),
  beatSpeedPxPerS:pairs.map(p=>p.beatSpeedCssPxPerSecond),
  aliasRatio:field.aliasRatio,nyquistGuarded:field.nyquistGuarded,
  carriers:39,emissionAllocated,peakBudget:2.4,routeOrder,lag,activeClock
 };
 const model={width,height,time,seed,sourceIds:ids,gain,scale,cx,cy,field,grid,faces,metalStrips,
  openAngularFraction:1-24*stripHalfWidth(.5),latticeNodes,latticeEdges,seams,rims,filaments,tensionRings,glints,bounds,
  routeOrder,lag,activeClock,radiometry,
  metrics:{seamLength,filamentLength,contourWidth:bounds.right-bounds.left,contourHeight:bounds.bottom-bounds.top},
  emissionAllocated};
 model.scene=buildSalonField(model);
 return model;
}

function trace(ctx,points,close=false){
 ctx.beginPath();
 if(points.length){
  ctx.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
 }
 if(close)ctx.closePath();
}
function stroke(ctx,points,color,width=1,alpha=1){
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=alpha;trace(ctx,points);ctx.stroke();
}
function frontSegments(points,minDepth=0,front=true){
 const segments=[];let current=[];
 for(let i=0;i<points.length;i++){
  const p=points[i];
  if(front?p[2]>=minDepth:p[2]<minDepth)current.push(p);
  else if(current.length){if(current.length>1)segments.push(current);current=[];}
 }
 if(current.length>1)segments.push(current);
 return segments;
}
/** A reflected studio is evaluated separately on each folded metal facet
 * with monotonic specular stops anchored in deep obsidian machined recesses
 * and warm couture mother-of-pearl / rose-pink / champagne gold crests. */
function stripChrome(ctx,band,m){
 const a=band.points[0],b=band.points[CUIRASS_POLICY.vertical_steps];
 const gradient=ctx.createLinearGradient(a[0],a[1],b[0],b[1]);
 const facing=Math.abs(band.normal[2]);
 const spec=clamp(.22+.66*facing+(band.facet===2?.15:0));
 const phase=m.time*.24+band.panel*.47+m.field.pairs[0].phaseDelta;
 const hot=clamp(.46+.16*Math.sin(phase),.30,.68);
 const lutIdx=Math.min(255,Math.max(0,Math.round((.35+.65*spec)*255)));
 gradient.addColorStop(0,'#090e13');
 gradient.addColorStop(.10,CHROME_TROUGH_LUT[lutIdx]);
 gradient.addColorStop(.24,CHROME_ROSE_LUT[lutIdx]);
 gradient.addColorStop(hot-.05,'#ffeab3');
 gradient.addColorStop(hot,'#fffef9');
 gradient.addColorStop(hot+.05,band.panel%2?'#ff8ec0':'#ffe2aa');
 gradient.addColorStop(.86,CHROME_MERCURY_LUT[lutIdx]);
 gradient.addColorStop(1,'#0b1016');
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
  // Machined obsidian recess flanked by luminous specular edge catches.
  stroke(ctx,strip.crest,'#080d12',front?3.2:1.4,front?.94:.50);
  stroke(ctx,strip.crest,'#fffdf7',front?1.15:.6,front?.82:.36);
  for(const edge of strip.edges)stroke(ctx,edge,'#fff2d1',front?.92:.55,front?.92:.36);
 }
}
function paintWeave(ctx,m,front){
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
  const power=Math.exp(-distance*distance/.0018)*(.35+.65*(.5+.5*n.field.beat));
  if(power>.32&&n.col%2===0)paintFieldSpark(ctx,n.point,power*(front?1:.45),n.col%3===0?'champagne':'pink',m.scale);
 }
 ctx.globalAlpha=front?.50:.16;
 for(const [tier,color,width] of [['near','#fff0bc',.95],['mid','#ff80bb',.45],['far','#f5e8e7',.45]]){
  ctx.beginPath();
  for(const f of m.filaments){
   const match=tier==='near'?f.near:tier==='mid'?!f.near&&f.mid:!f.near&&!f.mid;
   if(!match)continue;
   for(const points of frontSegments(f.points,0,front))traceFieldPath(ctx,points);
  }
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
 }
}
export function paintFoldedCuirass(ctx,m,{optics=true}={}){
 const {width:W,height:H,scale,cx,cy}=m;
 ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 ctx.clearRect(0,0,W,H);
 const bg=ctx.createLinearGradient(0,0,W,H);
 bg.addColorStop(0,'#242a2f');bg.addColorStop(.52,'#192026');bg.addColorStop(1,'#090e13');
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 if(!optics){ctx.restore();return {rendered:true,optics:false};}
 // Luminous mother-of-pearl / rose-pink / champagne-gold studio key around garment stage.
 const keyR=scale*.72,keyGrad=ctx.createRadialGradient(cx,cy-scale*.03,scale*.04,cx,cy-scale*.03,keyR);
 keyGrad.addColorStop(0,'rgba(255,248,240,.92)');
 keyGrad.addColorStop(.30,'rgba(255,214,232,.78)');
 keyGrad.addColorStop(.58,'rgba(245,221,177,.56)');
 keyGrad.addColorStop(.82,'rgba(54,62,68,.84)');
 keyGrad.addColorStop(1,'rgba(12,17,21,0)');
 ctx.fillStyle=keyGrad;ctx.fillRect(0,0,W,H);
 const scene=m.scene;
 paintSalonField(ctx,m,{layer:'back'});
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
  stroke(ctx,segment,'#080d12',3.8,1);stroke(ctx,segment,'#fff1c7',1.65,.96);
 }
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
  emissionAlpha:m.emissionAllocated,physicalEnergyConserved:false,empirical_credit:0,
  radiometry:m.radiometry};
}

/** One Salon clock. Still freezes phase; reduced motion/Rest never schedules
 * recurring paints. Resize and resolution media-query events invalidate even
 * while paused. Work updates repaint once at the retained phase. */
export function mountFoldedCuirass(canvas,getState,options={}){
 const win=canvas?.ownerDocument?.defaultView,doc=canvas?.ownerDocument;
 if(!win||typeof getState!=='function')return {mounted:false,reason:'NO_VISUAL_HOST'};
 const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)return {mounted:false,reason:'CANVAS2D_UNAVAILABLE'};
 const motion=doc.getElementById('motionBtn');
 const reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
 const clock=getState().opticalClock||{time:0};
 let raf=0,disposed=false,visible=false,lastMs=null,lastPaint=-Infinity,dirty=true,frames=0,last=null,latestRad=null;
 let resolution=null,paintCosts=[],geometryFrames=0;
 const held=()=>reduced.matches||motion?.getAttribute('aria-pressed')==='true'||doc.body.dataset.vixenMotion==='still'||getState().resting;
 const active=()=>!doc.hidden&&doc.body.dataset.view==='collection'&&doc.body.dataset.activeResearchStage!=='OPERAHOUSE';
 const cancel=()=>{if(raf)win.cancelAnimationFrame(raf);raf=0;lastMs=null;};
 function paint(){
  const r=canvas.getBoundingClientRect();if(r.width<2||r.height<2)return;
  const start=win.performance.now();
  const st=getState()||{};
  const sourceIds=st.works||[];
  const route=st.route||'A_B',lag=Number.isFinite(st.lag)?st.lag:30,activeClock=st.activeClock||null;
  const onRadiometry=typeof options?.onRadiometry==='function'?options.onRadiometry:(typeof st.onRadiometry==='function'?st.onRadiometry:null);
  if(!visible){
   win.VixenLivingMesh?.renderHostFrame?.({time:clock.time,sourceIds,
    view:'collection',held:!!held(),force:dirty});
   frames++;dirty=false;last={phase:clock.time,sourceIds,garmentVisible:false,empirical_credit:0};return;
  }
  const back=coutureBackingSize(r.width,r.height,win.devicePixelRatio||1);
  if(canvas.width!==back.width||canvas.height!==back.height){canvas.width=back.width;canvas.height=back.height;}
  ctx.setTransform(back.width/r.width,0,0,back.height/r.height,0,0);
  const m=buildFoldedCuirass({width:r.width,height:r.height,time:clock.time,sourceIds,
   integrated:win.innerWidth?win.innerWidth>740:r.width>800,route,lag,activeClock});
  const painted=paintFoldedCuirass(ctx,m);geometryFrames++;
  win.VixenLivingMesh?.renderHostFrame?.({time:clock.time,sourceIds:m.sourceIds,
   scene:m.scene,stageRect:{left:r.left,top:r.top,width:r.width,height:r.height},
   view:'collection',held:!!held(),force:dirty});
  paintCosts.push(win.performance.now()-start);if(paintCosts.length>120)paintCosts.shift();
  frames++;dirty=false;latestRad=m.radiometry;
  last={...painted,garmentVisible:true,phase:clock.time,sourceIds:m.sourceIds,viewport:{width:r.width,height:r.height},backing:back,
   metrics:m.metrics,geometryBounds:m.bounds,beatWavelengths:m.field.pairs.map(p=>p.wavelengthPx),
   contrast:'UNMEASURED_BROWSER_PIXELS',frameClass:'LOCAL_RENDER_MODEL_ONLY'};
  if(onRadiometry)onRadiometry(latestRad,last);
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
  renderStatic(){cancel();dirty=true;paint();return last;},
  latestRadiometry:()=>latestRad,
  getStatus:()=>({frames,geometryFrames,still:!!held(),visible,scheduled:!!raf,last,
   paintP95Ms:paintCosts.length?[...paintCosts].sort((a,b)=>a-b)[Math.ceil(paintCosts.length*.95)-1]:null}),
  dispose(){disposed=true;cancel();io.disconnect();ro.disconnect();mo.disconnect();
   reduced.removeEventListener('change',schedule);resolution?.removeEventListener('change',onDpr);
   doc.removeEventListener('visibilitychange',schedule);win.removeEventListener('resize',schedule);win.removeEventListener('vixen:fieldlayout',schedule);}
 });
}
