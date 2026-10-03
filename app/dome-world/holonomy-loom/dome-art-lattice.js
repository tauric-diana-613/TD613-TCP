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
