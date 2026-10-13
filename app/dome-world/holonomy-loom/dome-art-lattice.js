/** Pure sampling seam from Dome-World's live heterostratigraphic lattice.
 * Source: app/dome-world/index.html, DomeCore functions under
 * HETEROSTRATIGRAPHIC_MATH (v0.4.3). CI compares these functions to that
 * authoritative inline implementation. This carries its mathematical sampler,
 * not the tactile node simulator, a physical lattice, or a six-dimensional
 * substrate claim. The caller owns its clock, coordinates and presentation.
 */
export const DOME_ART_LATTICE_SAMPLING_CONTRACT = Object.freeze({
  schema:'td613.loom.dome-art-lattice-sampling/v0.1',
  source:'app/dome-world/index.html',
  source_functions:Object.freeze(['computeTriangularMoireSample','computeQuasiperiodicPhiSample','computeHeterostratigraphicPotential','computeGradientMisfit']),
  model:'rotated-D3-triangular-moire-and-phi-quasiperiodic-gradient-misfit',
  dimension:2,
  owns_animation_loop:false,
  tactile_simulator_transferred:false,
  empirical_credit:0
});

const CLAIM_CEILINGS = Object.freeze({pattern:'pattern-signal-not-identity-proof'});
function clamp(n, lo=0, hi=1){ return Math.max(lo, Math.min(hi, Number.isFinite(+n) ? +n : 0)); }
function round(n, places=4){ const p = 10 ** places; return Math.round((Number(n) + Number.EPSILON) * p) / p; }

export function computeTriangularMoireSample(x=0, y=0, opts={}){
  const k = opts.k || 0.036;
  const theta = opts.theta ?? 0.055;
  const dirs = [0, Math.PI/3, 2*Math.PI/3];
  const sample = (ang) => Math.cos(k * (Math.cos(ang)*x + Math.sin(ang)*y));
  const a = dirs.reduce((s,d)=>s+sample(d),0) / dirs.length;
  const b = dirs.reduce((s,d)=>s+sample(d+theta),0) / dirs.length;
  return round((a + b) / 2, 6);
}

export function computeQuasiperiodicPhiSample(x=0, y=0, opts={}){
  const phi = (1 + Math.sqrt(5)) / 2;
  const k = opts.kPhi || 0.026;
  const phase = opts.phase || 0;
  let acc = 0;
  for(let m=0;m<10;m++){
    const ang = m * Math.PI / 5;
    const pm = Math.sin((m+1)*phi + phase) * Math.PI;
    acc += Math.cos(k * (Math.cos(ang)*x + Math.sin(ang)*y) * (m%2 ? 1 : phi/2) + pm);
  }
  return round(acc / 10, 6);
}

export function computeHeterostratigraphicPotential(x=0, y=0, opts={}){
  const T = computeTriangularMoireSample(x, y, opts);
  const Q = computeQuasiperiodicPhiSample(x, y, opts);
  const fold = Math.abs(T - Q);
  return { schema:'td613.heterostratigraphic.sample/v0.4.3', x:round(x,3), y:round(y,3), triangular:T, quasiperiodic:Q, fold_density:round(clamp(fold),6), claim_ceiling:CLAIM_CEILINGS.pattern };
}

export function computeGradientMisfit(x=0, y=0, opts={}){
  const eps = opts.eps || 2.5;
  const Tx1 = computeTriangularMoireSample(x+eps,y,opts), Tx0 = computeTriangularMoireSample(x-eps,y,opts);
  const Ty1 = computeTriangularMoireSample(x,y+eps,opts), Ty0 = computeTriangularMoireSample(x,y-eps,opts);
  const Qx1 = computeQuasiperiodicPhiSample(x+eps,y,opts), Qx0 = computeQuasiperiodicPhiSample(x-eps,y,opts);
  const Qy1 = computeQuasiperiodicPhiSample(x,y+eps,opts), Qy0 = computeQuasiperiodicPhiSample(x,y-eps,opts);
  const gT = [(Tx1-Tx0)/(2*eps), (Ty1-Ty0)/(2*eps)];
  const gQ = [(Qx1-Qx0)/(2*eps), (Qy1-Qy0)/(2*eps)];
  const misfit = Math.hypot(gT[0]-gQ[0], gT[1]-gQ[1]);
  return { schema:'td613.heterostratigraphic.gradient-misfit/v0.4.3', x:round(x,3), y:round(y,3), g_triangular:gT.map(v=>round(v,6)), g_quasiperiodic:gQ.map(v=>round(v,6)), gradient_misfit:round(clamp(misfit*16),6), claim_ceiling:'heterostratigraphic-visual-diagnostic-not-material-proof' };
}


/**
 * Analytic, single-pass derivative projection for the 39-carrier motion field.
 * The public canonical samplers above are unchanged. This uses the exact
 * centered-difference trigonometric identity:
 *   (cos(a+d)-cos(a-d))/(2*eps) = -sin(a)*sin(d)/eps
 * instead of recomputing 8 complete 10-term lattice samples per carrier/frame.
 * It is a presentation optimization, NOT a new empirical or geometric claim.
 */
function motionKernel(k,theta,kPhi,eps){
  const triangular=[],quasiperiodic=[],phi=(1+Math.sqrt(5))/2;
  for(let i=0;i<3;i++)for(const angle of [i*Math.PI/3,i*Math.PI/3+theta]){
    const ax=k*Math.cos(angle),ay=k*Math.sin(angle);
    triangular.push({ax,ay,gx:Math.sin(ax*eps)/eps,gy:Math.sin(ay*eps)/eps});
  }
  for(let m=0;m<10;m++){
    const angle=m*Math.PI/5,factor=m%2?1:phi/2;
    const ax=kPhi*Math.cos(angle)*factor,ay=kPhi*Math.sin(angle)*factor;
    quasiperiodic.push({ax,ay,gx:Math.sin(ax*eps)/eps,gy:Math.sin(ay*eps)/eps,phase:(m+1)*phi});
  }
  return {triangular,quasiperiodic};
}
// Fixed wave directions and difference coefficients are not time-dependent.
// Compile the installed default once, retaining the canonical sampler seam.
const DEFAULT_MOTION_KERNEL=motionKernel(.036,.055,.026,2.5);

export function computeHeterostratigraphicMotionSample(x=0,y=0,opts={}){
  const k=opts.k||.036,theta=opts.theta??.055,kPhi=opts.kPhi||.026,phase=opts.phase||0,eps=opts.eps||2.5;
  const kernel=k===.036&&theta===.055&&kPhi===.026&&eps===2.5
    ? DEFAULT_MOTION_KERNEL : motionKernel(k,theta,kPhi,eps);
  let tri=0,quasi=0,gTx=0,gTy=0,gQx=0,gQy=0;
  for(const wave of kernel.triangular){
    const arg=wave.ax*x+wave.ay*y,sin=Math.sin(arg);
    tri+=Math.cos(arg);gTx-=sin*wave.gx;gTy-=sin*wave.gy;
  }
  tri/=6;gTx/=6;gTy/=6;
  for(const wave of kernel.quasiperiodic){
    const arg=wave.ax*x+wave.ay*y+Math.sin(wave.phase+phase)*Math.PI;
    const sin=Math.sin(arg);
    quasi+=Math.cos(arg);gQx-=sin*wave.gx;gQy-=sin*wave.gy;
  }
  return {
    triangular:round(tri/1,6),quasiperiodic:round(quasi/10,6),
    g_triangular:[round(gTx,6),round(gTy,6)],
    g_quasiperiodic:[round(gQx/10,6),round(gQy/10,6)]
  };
}
