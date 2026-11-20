import test from 'node:test';
import assert from 'node:assert/strict';
import {ENGINE_LINEAGE,OPTICAL_OPERATOR_ORDER,measureObservatoryOpticalInstrument}
 from '../app/encyclopedia/vixen-estate/observatory-optical-instrument-contract.mjs';
test('all four original Aperture-derived optical requirements have distinct measured surfaces',()=>{
 const a=measureObservatoryOpticalInstrument({width:360,height:300,sourceIds:['WORK-A','WORK-B'],time:.8});
 const ops=Object.values(a.four_operators);
 assert.deepEqual(ops.map(x=>x.kind),OPTICAL_OPERATOR_ORDER);
 assert.equal(ops[0].periodic_equals_quasiperiodic,false);
 assert.equal(ops[1].pairs.length,3);
 assert.ok(ops[1].measured_samples>0);
 assert.ok(ops[2].computed_emission<=ops[2].emission_budget);
 assert.ok(ops[2].peaks<=ops[2].peak_budget);
 assert.equal(ops[3].child_raf_scheduled,false);
 assert.equal(a.metrics.mesh_carriers,39);
 assert.equal(a.classifications.external_empirical_credit,0);
});
test('observable response changes with true host phase; renderer time has no child loop',()=>{
 const x=measureObservatoryOpticalInstrument({width:360,height:300,time:0,sourceIds:['A','B']});
 const y=measureObservatoryOpticalInstrument({width:360,height:300,time:.9,sourceIds:['A','B']});
 assert.equal(y.four_operators.viewport_temporal.time_received_from_host,.9);
 assert.deepEqual(x.four_operators.measured_beat_geometry.pairs,
  y.four_operators.measured_beat_geometry.pairs,
  'wavelength and beat speed should remain invariant under time evolution');
 assert.notEqual(x.four_operators.measured_beat_geometry.envelope_mean,
  y.four_operators.measured_beat_geometry.envelope_mean,
  'the sampled envelope, rather than the fixed wave vectors, should evolve');
});
test('origin, design orchestration, and active renderers cannot masquerade as each other',()=>{
 const a=ENGINE_LINEAGE.find(x=>x.family==='APERTURE_V32');
 const d=ENGINE_LINEAGE.find(x=>x.family==='DOLLHOUSE_DESIGN');
 assert.equal(a.imported_runtime,false);
 assert.equal(d.is_renderer,false);
 assert.ok(ENGINE_LINEAGE.some(x=>x.family==='VIXEN_SALON'&&x.imported_runtime===true));
});
test('refuses dishonest viewport or arbitrary source input; no production authority',()=>{
 assert.throws(()=>measureObservatoryOpticalInstrument({width:3000}),/VIEWPORT/);
 assert.throws(()=>measureObservatoryOpticalInstrument({sourceIds:['A','B','C']}),/SOURCE/);
 assert.equal(measureObservatoryOpticalInstrument({width:360,height:300}).classifications.release_authority,false);
});
