import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AMENDMENT_HEAD,
  P_BLIND_HARD,
  HARD_NULL_VECTOR,
  HARD_COMPATIBLE_AB,
  runHardenedDiscreteTransportTomographyAssay
} from '../app/dome-world/previews/a15-r0/discrete-transport-tomography-closed-loop-hardened.js';
import {
  P_HOLD,
  probeRow,
  rankMod,
  determinant2,
  observeOperator
} from '../app/dome-world/previews/a15-r0/discrete-transport-tomography-closed-loop.js';

const mod = value => ((value % 31) + 31) % 31;
const dot = (left,right) => mod(left.reduce((sum,value,index) => sum + value * right[index],0));

test('amendment binds the hardened control to its preregistered head', () => {
  assert.equal(AMENDMENT_HEAD, 'b301ac9147b68a9ba8883bfec40391a0f5ac086b');
});

test('hardened blind schedule has rank three and annihilates frozen null direction', () => {
  const rows = P_BLIND_HARD.map(probeRow);
  assert.equal(rankMod(rows), 3);
  assert.deepEqual(rows.map(row => dot(row,HARD_NULL_VECTOR)), [0,0,0,0]);
});

test('common heldout probe also annihilates the hardened null direction', () => {
  assert.equal(dot(probeRow(P_HOLD),HARD_NULL_VECTOR), 0);
});

test('compatible AB operators are invertible and observationally identical under blind plus heldout evidence', () => {
  const [left,right] = HARD_COMPATIBLE_AB;
  assert.notEqual(determinant2(left), 0);
  assert.notEqual(determinant2(right), 0);
  assert.deepEqual(P_BLIND_HARD.map(probe => observeOperator(left,probe)), P_BLIND_HARD.map(probe => observeOperator(right,probe)));
  assert.equal(observeOperator(left,P_HOLD), observeOperator(right,P_HOLD));
});

test('hardened assay preserves distinct loops under identical available scalar evidence', () => {
  const result = runHardenedDiscreteTransportTomographyAssay();
  const hard = result.hardened_blind_control;
  assert.equal(result.legacy_blind_control.counted_in_final_scientific_verdict, false);
  assert.equal(hard.rank, 3);
  assert.equal(hard.nullity, 1);
  assert.deepEqual(hard.row_null_dot_products,[0,0,0,0]);
  assert.equal(hard.heldout_null_dot_product,0);
  assert.equal(hard.compatible_primary_observations_equal,true);
  assert.equal(hard.compatible_heldout_observations_equal,true);
  assert.equal(hard.compatible_loop_operators_distinct,true);
  assert.deepEqual(hard.compatible_candidates[0].loop_operator,[[3,5],[1,2]]);
  assert.deepEqual(hard.compatible_candidates[1].loop_operator,[[19,5],[17,2]]);
  assert.equal(hard.classification,'CLOSED_LOOP_TRANSPORT_UNIDENTIFIED_AFTER_HELDOUT_BLIND_NULLSPACE_CONTROL');
  assert.equal(result.findings.hardened_assay_mechanism_validated,true);
});

test('hardened verdict remains finite synthetic research only', () => {
  const result = runHardenedDiscreteTransportTomographyAssay();
  assert.equal(result.bounded_answer,'DISCRETE_HOLONOMY_TOMOGRAPHY_IS_IMPLEMENTABLE_AND_FALSIFIABLE_WITH_HELDOUT_PERSISTENT_NULLSPACE_CONTROL_IN_AUTHORED_FINITE_FIXTURE');
  assert.equal(result.claims.td613_general_holonomy_observed,false);
  assert.equal(result.claims.physical_tomography,false);
  assert.equal(result.claims.physical_connection,false);
  assert.equal(result.claims.physical_curvature,false);
  assert.equal(result.claims.physical_holonomy,false);
  assert.equal(result.claims.proto_loom,false);
  assert.equal(result.claims.holonomy_loom_runtime,false);
  assert.equal(result.claims.production_authority,false);
  assert.equal(result.claims.vercel_authority,false);
});
