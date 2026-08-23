import test from 'node:test';
import assert from 'node:assert/strict';
import { runGaugeQuotientIdentifiabilityMatchedNullspaceAssay } from '../app/dome-world/previews/a15-r0/gauge-quotient-identifiability-matched-nullspace.js';

test('matched rank-three apertures leave 31 invertible raw matrices in both arms', () => {
  const receipt=runGaugeQuotientIdentifiabilityMatchedNullspaceAssay();
  assert.equal(receipt.projection_aperture.rank,3);
  assert.equal(receipt.projection_aperture.nullity,1);
  assert.equal(receipt.arms.positive.compatible_matrix_count,31);
  assert.equal(receipt.arms.hostile.compatible_matrix_count,31);
  assert.equal(receipt.arms.positive.all_compatible_matrices_invertible,true);
  assert.equal(receipt.arms.hostile.all_compatible_matrices_invertible,true);
  assert.equal(Object.values(receipt.matched_budget).every(Boolean),true);
});

test('positive family is raw-unidentified but quotient-identifiable', () => {
  const arm=runGaugeQuotientIdentifiabilityMatchedNullspaceAssay().arms.positive;
  assert.equal(arm.raw_operator_identifiable,false);
  assert.equal(arm.conjugacy_class_count,1);
  assert.equal(arm.quotient_conjugacy_class_identifiable,true);
  assert.equal(arm.every_member_witnessed_conjugate_to_reference,true);
  assert.equal(arm.conjugacy_witnesses.length,31);
  assert.equal(arm.classification,'RAW_OPERATOR_UNIDENTIFIED_BUT_CONJUGACY_CLASS_IDENTIFIED');
});

test('every non-reference positive member receives a solved conjugator without oracle help', () => {
  const witnesses=runGaugeQuotientIdentifiabilityMatchedNullspaceAssay().arms.positive.conjugacy_witnesses;
  for(const witness of witnesses.slice(1)) {
    assert.equal(witness.conjugate_to_reference,true);
    assert.equal(witness.complete_solution_family_materialized,true);
    assert.equal(witness.search_terminated_on_witness,true);
    assert.equal(witness.oracle_conjugator_exposed_to_classifier,false);
    assert.ok(witness.recovered_conjugator);
  }
});

test('hostile family spans scalar and Jordan classes under the same raw nullity', () => {
  const arm=runGaugeQuotientIdentifiabilityMatchedNullspaceAssay().arms.hostile;
  assert.equal(arm.raw_operator_identifiable,false);
  assert.equal(arm.conjugacy_class_count,2);
  assert.equal(arm.quotient_conjugacy_class_identifiable,false);
  assert.equal(arm.complete_nonconjugacy_search_exhausted,true);
  assert.equal(arm.hostile_representative_conjugacy.trace_det_equal,true);
  assert.equal(arm.hostile_representative_conjugacy.fingerprints_equal,false);
  assert.equal(arm.hostile_representative_conjugacy.coefficients_tested,961);
  assert.equal(arm.hostile_representative_conjugacy.invertible_conjugator_found,false);
  assert.equal(arm.classification,'RAW_OPERATOR_UNIDENTIFIED_AND_CONJUGACY_CLASS_UNIDENTIFIED');
});

test('equal raw nullity can support different quotient identifiability', () => {
  const receipt=runGaugeQuotientIdentifiabilityMatchedNullspaceAssay();
  assert.equal(receipt.findings.equal_raw_nullity_can_coexist_with_different_quotient_identifiability,true);
  assert.equal(receipt.findings.full_raw_reconstruction_not_necessary_for_declared_quotient_identifiability_in_authored_positive_family,true);
  assert.equal(receipt.candidate_research_rule,'WITHHOLD_EVERY_DOWNSTREAM_QUANTITY_NOT_CONSTANT_ACROSS_THE_FULL_COMPATIBLE_FAMILY');
});

test('claim ceiling stays synthetic and quotient-specific', () => {
  const receipt=runGaugeQuotientIdentifiabilityMatchedNullspaceAssay();
  assert.equal(receipt.findings.assay_validated,true);
  assert.equal(receipt.claim_ceiling.quotient_identifiability_candidate,true);
  assert.equal(receipt.claim_ceiling.universal_quotient_inverse_problem_theorem,false);
  assert.equal(receipt.claim_ceiling.physical_gauge_redundancy,false);
  assert.equal(receipt.claim_ceiling.continuum_geometry,false);
  assert.equal(receipt.claim_ceiling.berry_structure,false);
  assert.equal(receipt.claim_ceiling.quantum_behavior,false);
  assert.equal(receipt.claim_ceiling.proto_loom,false);
  assert.equal(receipt.claim_ceiling.production_authority,false);
  assert.equal(receipt.claim_ceiling.vercel_authority,false);
});
