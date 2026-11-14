import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BEAT_POLICY,waveVector,beatFieldAt,reinhardBounded,
 allocateBloom,measureCoutureBeats} from '../app/encyclopedia/vixen-estate/vixen-beat-radiometry-rgi15.mjs';
import {coutureGeometry,paintOpalineCouture}
 from '../app/encyclopedia/vixen-estate/vixen-opaline-couture-rgi14.mjs';
const approx=(a,b,tol=1e-8)=>assert(Math.abs(a-b)<=tol,String(a)+' != '+String(b));
const sample=(w,h)=>{
 const out=[];for(let y=12;y<h;y+=24)for(let x=w*.51;x<w*.98;x+=24)out.push({x,y});
 return out;
};
test('Aperture-derived reciprocal wavevectors have independently measured, finite beat geometry',()=>{
 const k=waveVector(12,Math.PI/3);
 approx(Math.hypot(k.x,k.y),2*Math.PI/12);
 assert.throws(()=>waveVector(0,0),/WAVEVECTOR/);
 const a=measureCoutureBeats({width:1200,height:690,time:1.25,seed:613,
  samplePoints:sample(1200,690)});
 assert.equal(a.schema,BEAT_POLICY.schema);
 assert.equal(a.pairs.length,3);
 assert(a.pairs.every(p=>p.wavelengthPx>0 && Number.isFinite(p.beatSpeedCssPxPerSecond)));
 assert(a.pairs.every(p=>Math.abs(p.phaseDelta)<=Math.PI));
 assert(a.pairs.every(p=>Math.abs(p.delta.x)+Math.abs(p.delta.y)>0));
 assert.equal(a.nyquistGuarded,true);
 assert(a.pointsMeasured>300);
});
test('Constructive maxima and destructive channels are analytically distinct before paint',()=>{
 const pair=[{delta:{x:1,y:0},phaseDelta:0,deltaOmega:0}];
 approx(beatFieldAt(pair,0,0,0),1);
 approx(beatFieldAt(pair,Math.PI,0,0),0);
 assert.throws(()=>beatFieldAt(pair,Infinity,0),/INVALID_BEAT/);
});
test('Reinhard transfer cannot exceed one and finite allocated bloom cannot exceed declared visual budget',()=>{
 assert.equal(reinhardBounded(0),0);
 assert(reinhardBounded(1e10)<1);
 const points=Array.from({length:90},(_,i)=>({x:i*30,y:30*i,envelope:.99}));
 const peaks=allocateBloom(points);
 assert(peaks.length<=BEAT_POLICY.max_peaks);
 assert(peaks.every(p=>p.energy>=0&&p.energy<=1));
 assert(peaks.every(p=>p.bloomRadius<=BEAT_POLICY.max_bloom_css_px));
 assert(peaks.reduce((n,p)=>n+p.energy,0)<=BEAT_POLICY.peak_budget+1e-8);
 assert.deepEqual(allocateBloom([{x:0,y:0,envelope:0}]),[]);
});
test('Screen-space Nyquist guard follows viewport and device pixel ratio instead of a fixed step',()=>{
 for(const [w,h,dpr] of [[390,844,1],[1440,900,2],[92,110,.5],[1024,768,1.25]]){
  const m=measureCoutureBeats({width:w,height:h,devicePixelRatio:dpr,
   samplePoints:sample(w,h)});
  assert(m.aliasRatio<=.450000001,'alias ratio '+m.aliasRatio);
  assert(m.samplingPitchCssPx>=2/(m.physicalDpr*.45)-1e-8);
 }
});
test('Beat telemetry is prepaint, repeatable, source-dependent and temporally variable',()=>{
 const props={width:1200,height:690,time:2.1,seed:10,samplePoints:sample(1200,690)};
 const a=measureCoutureBeats(props);
 const repeat=measureCoutureBeats(props);
 const different=measureCoutureBeats({...props,seed:999});
 const later=measureCoutureBeats({...props,time:6.2});
 assert.deepEqual(a,repeat);
 assert.notDeepEqual(a.peaks,different.peaks);
 assert.notDeepEqual(a.peaks,later.peaks);
 assert(a.envelopeMin<a.envelopeMax);
 assert(a.totalEmission<=BEAT_POLICY.peak_budget+1e-8);
 assert.equal(a.empirical_credit,0);
 assert.equal(BEAT_POLICY.physical_energy_conservation_claim,false);
});
test('Vixen couture consumes measured peaks with bounded kernel and holds other estates unchanged',()=>{
 const m=coutureGeometry({width:1180,height:660,time:3.2,
  sourceIds:['W_01','W_02'],devicePixelRatio:1});
 assert.equal(m.optics.pointsMeasured,160);
 assert.equal(m.optics.nyquistGuarded,true);
 assert.equal(m.ribs.length,39);
 const grad=()=>({addColorStop(){}});
 const ctx={save(){},restore(){},beginPath(){},rect(){},clip(){},
  fillRect(){},moveTo(){},lineTo(){},closePath(){},
  bezierCurveTo(){},ellipse(){},stroke(){},fill(){},
  clearRect(){},createRadialGradient:grad,createLinearGradient:grad};
 const r=paintOpalineCouture(ctx,m);
 assert.equal(r.beat_measured_samples,160);
 assert.equal(r.beat_nyquist_guard,true);
 assert.equal(r.beat_peaks,m.optics.peaks.length);
 assert.equal(r.beat_emission,m.optics.totalEmission);
 assert(r.beat_emission<=BEAT_POLICY.peak_budget+1e-8);
 assert(r.beat_peaks>0,'Emitter must be coupled to measured constructive nodes');
 assert.equal(r.bloom_max_css_px,BEAT_POLICY.max_bloom_css_px);
 const glintRadii=m.optics.peaks.map(p=>p.bloomRadius);
 assert(glintRadii.every(x=>x<=BEAT_POLICY.max_bloom_css_px));
 assert.equal(r.empirical_credit,0);
 assert.equal(BEAT_POLICY.experiment_b_flight,'HELD');
});
