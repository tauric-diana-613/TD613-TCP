import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {
  MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_PARENT_RECEIPT,
  MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_SCHEMA,
  mossLanternProceduralMemoryOrderDefectCertificate,
} from '../app/dome-world/previews/a15-r0/moss-lantern-procedural-memory-order-defect.js';

const cert=mossLanternProceduralMemoryOrderDefectCertificate();
const fixture=JSON.parse(await fs.readFile(new URL('./fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json',import.meta.url),'utf8'));

assert.equal(MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_SCHEMA,'td613.dome-world.moss-lantern-procedural-memory-order-defect/v0.1');
assert.equal(MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_PARENT_RECEIPT,'c0bdb1b0f19d94f987837a6cb2465e5933b623c2');
assert.equal(cert.parent_exact,true);

assert.equal(fixture.schema,'td613.pedagogue-practice-fixture/v0.1');
assert.equal(fixture.fixture_id,'ash-loom.moss-lantern-calibration/v0.1');
assert.equal(fixture.operator_label,'Moss Lantern practice capsule');
assert.equal(fixture.manifestly_fictional,true);
assert.equal(fixture.runtime_binding,false);
assert.deepEqual(fixture.expected_route_steps,['open-practice-case','custody-hold','projection-observe','rest','return']);
assert.equal(fixture.expected_endpoint,'returned-practice-capsule');

assert.equal(cert.fixture.fixture_id,fixture.fixture_id);
assert.equal(cert.fixture.operator_label,fixture.operator_label);
assert.equal(cert.fixture.expected_endpoint,fixture.expected_endpoint);
assert.deepEqual(cert.fixture.canonical_route,fixture.expected_route_steps);
assert.deepEqual(cert.fixture.swapped_route,['open-practice-case','projection-observe','custody-hold','rest','return']);
assert.equal(cert.fixture.manifestly_fictional,true);
assert.equal(cert.fixture.runtime_binding,false);

assert.equal(cert.experimental_state.carrier,'Omega=(q,Xi)');
assert.equal(cert.experimental_state.apparatus_coordinate,'Xi in F2^2');
assert.deepEqual(cert.experimental_state.initial_states,[[0,0],[0,1],[1,0],[1,1]]);

assert.equal(cert.target.executions,8);
assert.equal(cert.target.comparisons,4);
assert.equal(cert.target.visible_endpoint_matches,4);
assert.equal(cert.target.visible_endpoint_mismatches,0);
assert.equal(cert.target.apparatus_endpoint_divergences,4);
assert.equal(cert.target.apparatus_endpoint_matches,0);
assert.equal(cert.target.unit_hamming_apparatus_defects,4);
assert.equal(cert.target.delayed_marker_divergences,4);
assert.equal(cert.target.delayed_marker_matches,0);
assert.deepEqual(cert.target.rows.map(row=>[row.start,row.AB,row.BA,row.hamming_Xi,row.marker_AB,row.marker_BA]),[
  ['00',[1,1],[1,0],1,1,0],
  ['01',[1,0],[1,1],1,0,1],
  ['10',[0,0],[0,1],1,0,1],
  ['11',[0,1],[0,0],1,1,0],
]);

assert.deepEqual(cert.defect_profile,{H_q:0,H_Xi_all_starts:[1,1,1,1],future_marker_split_all_starts:true});
assert.deepEqual(cert.controls.memoryless_projection,{divergences:0,matches:4,projects_to:'q only'});
assert.deepEqual(cert.controls.apparatus_reset,{divergences:0,matches:4,resets_to:[0,0]});
assert.equal(cert.controls.commutative_pair.executions,8);
assert.equal(cert.controls.commutative_pair.comparisons,4);
assert.equal(cert.controls.commutative_pair.apparatus_divergences,0);
assert.equal(cert.controls.commutative_pair.apparatus_matches,4);
assert.equal(cert.controls.commutative_pair.marker_divergences,0);
assert.equal(cert.controls.commutative_pair.marker_matches,4);

assert.equal(cert.laws.same_visible_endpoint_all_target_starts,true);
assert.equal(cert.laws.order_dependent_declared_apparatus_endpoint_all_target_starts,true);
assert.equal(cert.laws.future_apparatus_probe_separates_all_target_orders,true);
assert.equal(cert.laws.memoryless_projection_remains_collapsed,true);
assert.equal(cert.laws.reset_extinguishes_delayed_difference,true);
assert.equal(cert.laws.commutative_control_has_zero_order_defect,true);
assert.equal(cert.laws.procedural_memory_witness_bounded_fixture,true);

assert.equal(cert.execution_ledger.apparatus_states,4);
assert.equal(cert.execution_ledger.target_state_order_executions,8);
assert.equal(cert.execution_ledger.target_order_pair_comparisons,4);
assert.equal(cert.execution_ledger.delayed_probe_comparisons,4);
assert.equal(cert.execution_ledger.memoryless_projection_comparisons,4);
assert.equal(cert.execution_ledger.reset_control_comparisons,4);
assert.equal(cert.execution_ledger.commutative_state_order_executions,8);
assert.equal(cert.passed,true);

console.log('Ash A15-R0 Moss Lantern procedural-memory order-defect canonical contract passed.');
