import test from 'node:test';
import assert from 'node:assert/strict';
import { runValidationProjectionNullspaceAssay } from '../app/dome-world/previews/a15-r0/validation-projection-nullspace-assay.js';

test('legacy and guard validator sensitivities match preregistered exact geometry', () => {
  const result=runValidationProjectionNullspaceAssay();
  assert.deepEqual(result.primary_inverse.inverse,[[1,0,0,0],[0,1,0,0],[0,0,1,0],[30,30,30,1]]);
  assert.deepEqual(result.validators.legacy.sensitivity,[0,2,30,2]);
  assert.deepEqual(result.validators.guard.sensitivity,[30,30,30,1]);
});

test('legacy heldout misses every isolated P1 corruption and detects the other isolated coordinates', () => {
  const result=runValidationProjectionNullspaceAssay();
  const [p1,p2,p3,p4]=result.exhaustive_single_error_family.by_coordinate;
  assert.equal(p1.legacy_missed,30);
  assert.equal(p1.legacy_detected,0);
  for (const item of [p2,p3,p4]) {
    assert.equal(item.legacy_detected,30);
    assert.equal(item.legacy_missed,0);
  }
  assert.equal(result.exhaustive_single_error_family.legacy_detected_total,90);
  assert.equal(result.exhaustive_single_error_family.legacy_missed_total,30);
});

test('guard validator detects all 120 isolated nonzero primary errors', () => {
  const result=runValidationProjectionNullspaceAssay();
  assert.equal(result.exhaustive_single_error_family.case_count,120);
  assert.equal(result.exhaustive_single_error_family.guard_detected_total,120);
  assert.equal(result.exhaustive_single_error_family.guard_missed_total,0);
});

test('combined validators retain coordinated-error nullspace', () => {
  const result=runValidationProjectionNullspaceAssay();
  assert.equal(result.validators.combined.rank,2);
  assert.equal(result.validators.combined.nullity,2);
  assert.deepEqual(result.coordinated_error_nullspace.materialized_null_witnesses[0],{vector:[14,16,1,0],syndrome:[0,0]});
  assert.deepEqual(result.coordinated_error_nullspace.materialized_null_witnesses[1],{vector:[2,30,0,1],syndrome:[0,0]});
});

test('bounded result treats validation as projection design without universal robustness', () => {
  const result=runValidationProjectionNullspaceAssay();
  assert.equal(result.findings.assay_mechanism_validated,true);
  assert.equal(result.findings.heldout_does_not_imply_geometric_independence,true);
  assert.equal(result.findings.all_single_coordinate_errors_detected_does_not_imply_all_multi_coordinate_errors_detected,true);
  assert.equal(result.bounded_answer,'VALIDATION_IS_ITSELF_A_PROJECTION_DESIGN_PROBLEM_IN_AUTHORED_F31_INVERSE_FIXTURE');
  assert.equal(result.claims.exact_finite_validation_geometry,true);
  assert.equal(result.claims.stochastic_robustness,false);
  assert.equal(result.claims.deployed_adversarial_robustness,false);
  assert.equal(result.claims.statistical_generalization,false);
  assert.equal(result.claims.production_authority,false);
  assert.equal(result.claims.vercel_authority,false);
});
