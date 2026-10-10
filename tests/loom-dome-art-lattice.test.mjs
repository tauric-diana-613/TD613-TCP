import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import * as lattice from '../app/dome-world/holonomy-loom/dome-art-lattice.js';
import { FLOWCORE_CHOREOGRAPHIES, projectFlowcoreMotionFamily } from '../app/dome-world/holonomy-loom/flowcore-choreography.js';

// Evaluate only the four named pure source functions and their two numerical
// helpers. Never execute the surrounding application, DOM, clock or network.
const source=readFileSync(new URL('../app/dome-world/index.html',import.meta.url),'utf8');
const names=lattice.DOME_ART_LATTICE_SAMPLING_CONTRACT.source_functions;
const definitions=Object.fromEntries(names.map(name=>{
  const match=source.match(new RegExp(`function ${name}\\([^]*?\\n\\}`));
  assert.ok(match,`Authoritative live-lattice function ${name} remains available`);
  return [name,match[0]];
}));
const helpers=['clamp','round'].map(name=>{
  const match=source.match(new RegExp(`function ${name}\\([^\\n]+`));
  assert.ok(match);return match[0];
});
const reference=runInNewContext(`(()=>{
  const CLAIM_CEILINGS={pattern:'pattern-signal-not-identity-proof'};
  ${helpers.join('\n')}
  ${Object.values(definitions).join('\n')}
  return {${names.join(',')}};
})()`,{}, {timeout:1000});
const plain=value=>JSON.parse(JSON.stringify(value));

test('Loom carries exact live-lattice samplers with an enforced source-parity seam',()=>{
  assert.equal(lattice.DOME_ART_LATTICE_SAMPLING_CONTRACT.dimension,2);
  assert.equal(lattice.DOME_ART_LATTICE_SAMPLING_CONTRACT.tactile_simulator_transferred,false);
  assert.equal(lattice.DOME_ART_LATTICE_SAMPLING_CONTRACT.owns_animation_loop,false);
  for(const name of names){
    assert.equal(lattice[name].toString(),definitions[name],`${name} must stay source-identical to the actual Dome-World sampler`);
    for(const [x,y] of [[0,0],[17.5,-31],[280,160],[-630,470]])
      for(const options of [{},{theta:0,phase:0},{theta:.12,k:.049,kPhi:.021,phase:.7,eps:.4}])
        assert.deepEqual(plain(lattice[name](x,y,options)),plain(reference[name](x,y,options)));
  }
});

test('actual lattice phase changes the same fixed family carrier deformation',()=>{
  const coordinate={index:6,count:39,seconds:8,depth:'flight-near',x:650,y:300};
  const before=projectFlowcoreMotionFamily('moire-shear',{...coordinate,phase:0});
  const after=projectFlowcoreMotionFamily('moire-shear',{...coordinate,phase:.4});
  assert.ok(Math.hypot(before.dx-after.dx,before.dy-after.dy)>5,
    'changing only the sampled phi-counterlayer phase must change the family geometry');
  // Independent live-kernel expectation binds horizontal shear to its actual
  // sampled triangular / phi / gradient terms, rather than a decorative label.
  const options={phase:Math.PI*2*(.59+.4+8*.038*.37),theta:.055};
  const sample=reference.computeHeterostratigraphicPotential(150,40,options);
  const gradient=reference.computeGradientMisfit(150,40,options);
  const shear=Math.max(-1,Math.min(1,(gradient.g_triangular[0]-gradient.g_quasiperiodic[0])*32));
  const expectedDx=1.35*58*(sample.triangular+.35*sample.quasiperiodic+shear*.55);
  assert.ok(Math.abs(after.dx-expectedDx)<.015, 'analytic centered derivative may differ subpixel from rounded intermediate sampler');
});

test('all eight family projections remain finite across the complete carrier field',()=>{
  for(const choreography of FLOWCORE_CHOREOGRAPHIES)
    for(const depth of ['flight-near','flight-mid','flight-far'])
      for(const seconds of [0,4,12,1200])for(let index=0;index<39;index++){
        const sample=projectFlowcoreMotionFamily(choreography.family,{index,count:39,seconds,phase:.5,depth,x:500+index*17,y:260-index*9});
        assert.ok(Object.values(sample).every(Number.isFinite));
        assert.ok(sample.scale>0);
      }
  assert.throws(()=>projectFlowcoreMotionFamily('phi-gossamer',{index:0,x:Infinity}),/finite/);
});

test('米 repeats a bounded, reversible figure-eight rather than an orbital drift', () => {
  const opts={index:14,count:39,phase:.3,depth:'flight-mid',x:564,y:205};
  const sample=seconds=>projectFlowcoreMotionFamily('revisit-lemniscate',{...opts,seconds});
  const a=sample(.25),half=sample(.25+Math.PI/.78),returning=sample(.25+2*Math.PI/.78);
  for(const key of ['dx','dy','roll','scale','opacity']){
    assert.ok(Number.isFinite(a[key]));
    assert.ok(Math.abs(a[key]-returning[key])<1e-8,`米 must return at a full cycle: ${key}`);
  }
  assert.ok(Math.abs(a.dx-half.dx)>6,'half a cycle must meaningfully move the carrier');
  for(const index of [0,7,14,21,38]){
    const point=projectFlowcoreMotionFamily('revisit-lemniscate',{...opts,index,seconds:2.3});
    assert.ok(Math.abs(point.dx)<55&&Math.abs(point.dy)<35,'米 must stay bounded within its depth plane');
  }
});

test('fast motion derivative matches canonical centered finite differences throughout the Loom field',()=>{
  for(const [x,y] of [[0,0],[17.5,-31],[280,160],[-630,470],[517.25,-284.3]])
    for(const options of [{},{theta:0,phase:0},{theta:.12,k:.049,kPhi:.021,phase:.7,eps:.4}]){
      const fast=lattice.computeHeterostratigraphicMotionSample(x,y,options);
      const canonical=lattice.computeHeterostratigraphicPotential(x,y,options);
      const gradient=lattice.computeGradientMisfit(x,y,options);
      assert.equal(fast.triangular,canonical.triangular);
      assert.equal(fast.quasiperiodic,canonical.quasiperiodic);
      for(const [key,reference] of [['g_triangular',gradient.g_triangular],['g_quasiperiodic',gradient.g_quasiperiodic]])
        for(let dim=0;dim<2;dim++)
          assert.ok(Math.abs(fast[key][dim]-reference[dim])<.000003,
            `Fast analytic finite difference must preserve Dome-Art ${key} axis ${dim}`);
    }
});
