/**
 * Vixen RGI15 | finite, measured D3 / phi optical interference.
 * Aperture v3.2-alpha: conceptual and algebraic source for wave-vector
 * subtraction and independently reported beat wavelength and phase.
 * NEW IN VIXEN: an explicitly capped emission allocator and finite sampling
 * of the garment before pixels are drawn. Neither claims physical energy
 * conservation, an empirical witness nor a complete Aperture shader port.
 *
 * The three D3-oriented phase families and distinct phi-detuned layer
 * stay separate: the rendered optical field is a model, not evidence.
 * OPERAHOUSE != OPERA != PERFORMER. Protected Flight HELD.
 */
export const BEAT_POLICY=Object.freeze({
 schema:'td613.vixen.rgi15.beat-radiometry/v1',estate:'VIXEN_OPERA',
 source:'Aperture-wavevector-principle/Vixen-new-bounded-emitter',
 sampling:'PREPAINT_FINITE_COUTURE_INTERSECTIONS',
 family_a:'D3_TRIANGULAR_ORIENTATIONS',
 family_b:'PHI_DETUNED_COUNTERLAYER',
 physical_energy_conservation_claim:false,
 peak_budget:2.4,max_peaks:11,max_bloom_css_px:18,
 empirical_credit:0,experiment_b_flight:'HELD'
});
const PHI=(1+Math.sqrt(5))/2,TAU=2*Math.PI;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,Number.isFinite(x)?x:a));
const wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
const finite=(n,def)=>Number.isFinite(n)?n:def;
export function waveVector(spacing,angle){
 if(!Number.isFinite(spacing)||spacing<=0||!Number.isFinite(angle))
  throw new RangeError('INVALID_WAVEVECTOR_COORDINATES');
 const mag=TAU/spacing;return Object.freeze({x:mag*Math.cos(angle),y:mag*Math.sin(angle)});
}
export function beatFieldAt(pairs,x,y,time=0){
 if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(time))
  throw new RangeError('INVALID_BEAT_SAMPLE');
 let sum=0;
 for(const pair of pairs){
  // The actual beat field is calculated before any Canvas draw calls.
  const difference=pair.delta.x*x+pair.delta.y*y+pair.phaseDelta-pair.deltaOmega*time;
  sum+=(1+Math.cos(difference))*.5;
 }
 // A thresholded constructive interference envelope retains truly dark
 // destructive channels. This is a designed optical transfer function.
 const mean=sum/Math.max(1,pairs.length);
 return clamp((mean-.57)/.43);
}
export function reinhardBounded(energy,exposure=1.15){
 const e=Math.max(0,finite(energy,0))*clamp(exposure,0,4);
 return e/(1+e);
}
/** Allocates finite visual alpha, not a physical radiometric quantity. */
export function allocateBloom(candidates,{budget=BEAT_POLICY.peak_budget,
 maxPeaks=BEAT_POLICY.max_peaks,maximumRadius=BEAT_POLICY.max_bloom_css_px}={}){
 const valid=candidates.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)
  &&p.envelope>.54).sort((a,b)=>b.envelope-a.envelope);
 const chosen=[],minSeparation=21;
 for(const p of valid){
  if(chosen.length>=Math.max(0,Math.floor(maxPeaks)))break;
  if(chosen.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<minSeparation))continue;
  chosen.push({...p});
 }
 const total=chosen.reduce((n,p)=>n+reinhardBounded(p.envelope),0);
 const factor=total>0?Math.min(1,Math.max(0,budget)/total):0;
 return Object.freeze(chosen.map(p=>Object.freeze({
  x:p.x,y:p.y,envelope:p.envelope,
  energy:reinhardBounded(p.envelope)*factor,
  bloomRadius:clamp(5+11*Math.sqrt(p.envelope),0,maximumRadius)
 })));
}
export function measureCoutureBeats({
 width,height,devicePixelRatio=1,time=0,seed=0,samplePoints=[]
}={}){
 if(!(Number.isFinite(width)&&width>0&&Number.isFinite(height)&&height>0))
  throw new RangeError('BEAT_VIEWPORT_REQUIRED');
 if(!Number.isFinite(time))throw new RangeError('BEAT_TIME_REQUIRED');
 const dpr=clamp(devicePixelRatio,.5,4);
 // Derive CSS-space lattice pitch from actual viewport and physical pixel
 // sampling. Nyquist guard k/(pi*dpr)<.45. No invented alias percentage.
 const physicalMin=2/(dpr*.45);
 const pitch=Math.max(physicalMin,Math.min(width,height)/31,9);
 const sourcePhase=((Math.abs(seed)>>>0)%4093)/4093*TAU;
 const pairs=[0,1,2].map(i=>{
  const angle=i*Math.PI/3+.15;
  const secondaryAngle=angle+.16+(i*.027);
  const kD3=waveVector(pitch,angle);
  const kPhi=waveVector(pitch*PHI,secondaryAngle);
  const delta={x:kPhi.x-kD3.x,y:kPhi.y-kD3.y};
  const magnitude=Math.max(1e-8,Math.hypot(delta.x,delta.y));
  const omegaA=.25+i*.035,omegaB=.42+i*.046;
  const phaseA=i*Math.PI/3+sourcePhase*.17;
  const phaseB=i*Math.PI/PHI+sourcePhase*.63;
  return Object.freeze({
   d3:kD3,phi:kPhi,delta,
   omegaA,omegaB,deltaOmega:omegaB-omegaA,
   phaseA,phaseB,phaseDelta:wrap(phaseB-phaseA),
   wavelengthPx:TAU/magnitude,
   beatSpeedCssPxPerSecond:Math.abs(omegaB-omegaA)/magnitude,
   aliasRatio:Math.max(Math.hypot(kD3.x,kD3.y),Math.hypot(kPhi.x,kPhi.y))/(Math.PI*dpr)
  });
 });
 const candidates=[];
 let min=1,max=0,sum=0,observations=0;
 for(const pt of samplePoints){
  if(!Number.isFinite(pt.x)||!Number.isFinite(pt.y))continue;
  const envelope=beatFieldAt(pairs,pt.x,pt.y,time);
  min=Math.min(min,envelope);max=Math.max(max,envelope);
  sum+=envelope;observations++;
  candidates.push({x:pt.x,y:pt.y,envelope});
 }
 const peaks=allocateBloom(candidates);
 const totalEmission=peaks.reduce((n,p)=>n+p.energy,0);
 return Object.freeze({
  schema:BEAT_POLICY.schema,
  samplingPitchCssPx:pitch,physicalDpr:dpr,
  aliasRatio:Math.max(...pairs.map(p=>p.aliasRatio)),
  nyquistGuarded:pairs.every(p=>p.aliasRatio<=.45+1e-8),
  pairs:Object.freeze(pairs),pointsMeasured:observations,
  envelopeMin:observations?min:0,envelopeMax:observations?max:0,
  envelopeMean:observations?sum/observations:0,
  peaks,peakCount:peaks.length,totalEmission,
  physicalEnergyConserved:false,empirical_credit:0
 });
}
