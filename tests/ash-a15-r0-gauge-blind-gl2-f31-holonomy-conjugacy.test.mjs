import test from 'node:test';
import assert from 'node:assert/strict';
import { runGaugeBlindGL2HolonomyClassifierGauntlet } from '../app/dome-world/previews/a15-r0/gauge-blind-gl2-f31-holonomy-conjugacy.js';

test('unknown-gauge distinct-eigen clone is recognized without oracle conjugator', () => {
  const receipt=runGaugeBlindGL2HolonomyClassifierGauntlet();
  const c=receipt.cases.positive_distinct_eigen;
  assert.deepEqual(receipt.oracle_generation.H0_clone,[[19,23],[28,18]]);
  assert.equal(c.fingerprints_equal,true);
  assert.equal(c.invertible_conjugator_found,true);
  assert.equal(c.exact_conjugation_verified,true);
  assert.equal(c.oracle_conjugator_exposed_to_classifier,false);
  assert.equal(c.complete_solution_family_materialized,true);
  assert.equal(c.search_terminated_on_witness,true);
});

test('identity and nontrivial unipotent survive trace-det equality but fail conjugacy', () => {
  const c=runGaugeBlindGL2HolonomyClassifierGauntlet().cases.identity_unipotent_trap;
  assert.equal(c.trace_det_equal,true);
  assert.equal(c.left_fingerprint.discriminant_mod_31,0);
  assert.equal(c.right_fingerprint.discriminant_mod_31,0);
  assert.equal(c.left_fingerprint.rank_shifted_by_repeated_root,0);
  assert.equal(c.right_fingerprint.rank_shifted_by_repeated_root,1);
  assert.equal(c.fingerprints_equal,false);
  assert.equal(c.invertible_conjugator_found,false);
  assert.equal(c.search_exhausted_without_witness,true);
  assert.equal(c.coefficients_tested,961);
});

test('scalar-three and Jordan-three reproduce the repeated-root hostile class', () => {
  const c=runGaugeBlindGL2HolonomyClassifierGauntlet().cases.repeated_scale_trap;
  assert.equal(c.trace_det_equal,true);
  assert.equal(c.left_fingerprint.repeated_root_lambda,3);
  assert.equal(c.right_fingerprint.repeated_root_lambda,3);
  assert.equal(c.left_fingerprint.rank_shifted_by_repeated_root,0);
  assert.equal(c.right_fingerprint.rank_shifted_by_repeated_root,1);
  assert.equal(c.fingerprints_equal,false);
  assert.equal(c.search_exhausted_without_witness,true);
});

test('nontrivial Jordan clone is recognized by fingerprint plus independently solved conjugator', () => {
  const receipt=runGaugeBlindGL2HolonomyClassifierGauntlet();
  const c=receipt.cases.positive_jordan;
  assert.deepEqual(receipt.oracle_generation.J3_clone,[[1,4],[30,5]]);
  assert.equal(c.fingerprints_equal,true);
  assert.equal(c.left_fingerprint.rank_shifted_by_repeated_root,1);
  assert.equal(c.right_fingerprint.rank_shifted_by_repeated_root,1);
  assert.equal(c.invertible_conjugator_found,true);
  assert.equal(c.exact_conjugation_verified,true);
  assert.equal(c.oracle_conjugator_exposed_to_classifier,false);
});

test('different characteristic polynomials are rejected with complete absence search', () => {
  const c=runGaugeBlindGL2HolonomyClassifierGauntlet().cases.different_characteristic;
  assert.equal(c.fingerprints_equal,false);
  assert.equal(c.conjugacy_solution_dimension,0);
  assert.equal(c.full_nullspace_coefficients_materialized,1);
  assert.equal(c.coefficients_tested,1);
  assert.equal(c.search_exhausted_without_witness,true);
  assert.equal(c.invertible_conjugator_found,false);
});

test('gauntlet claim ceiling stays finite-field and gauge-blind only', () => {
  const receipt=runGaugeBlindGL2HolonomyClassifierGauntlet();
  assert.equal(receipt.findings.gauntlet_validated,true);
  assert.equal(receipt.claim_ceiling.exact_finite_field_matrix_conjugacy_instrument,true);
  assert.equal(receipt.claim_ceiling.universal_matrix_group_classifier,false);
  assert.equal(receipt.claim_ceiling.physical_gauge_symmetry,false);
  assert.equal(receipt.claim_ceiling.continuum_bundle,false);
  assert.equal(receipt.claim_ceiling.yang_mills_structure,false);
  assert.equal(receipt.claim_ceiling.berry_structure,false);
  assert.equal(receipt.claim_ceiling.quantum_behavior,false);
  assert.equal(receipt.claim_ceiling.proto_loom,false);
  assert.equal(receipt.claim_ceiling.production_authority,false);
  assert.equal(receipt.claim_ceiling.vercel_authority,false);
});
