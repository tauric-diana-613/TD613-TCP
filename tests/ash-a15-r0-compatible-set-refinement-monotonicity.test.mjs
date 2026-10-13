import test from 'node:test';
import assert from 'node:assert/strict';
import { runCompatibleSetRefinementMonotonicityAssay } from '../app/dome-world/previews/a15-r0/compatible-set-refinement-monotonicity.js';

test('symbolic theorem excludes empty refinement and finite sampling', () => {
  const theorem=runCompatibleSetRefinementMonotonicityAssay().theorem_certificate;
  assert.equal(theorem.theorem_id,'IDENTIFIED_CLAIM_PRESERVATION_UNDER_NONEMPTY_COMPATIBLE_SET_REFINEMENT');
  assert.equal(theorem.finite_sampling_required,false);
  assert.equal(theorem.converse_claimed,false);
  assert.equal(theorem.empty_set_excluded,true);
});

test('R1 preserves old licenses while identifying conjugacy before raw state', () => {
  const receipt=runCompatibleSetRefinementMonotonicityAssay();
  const r1=receipt.sequence.R1;
  assert.equal(r1.validation.admitted,true);
  assert.equal(r1.family_size,30);
  assert.equal(Object.values(r1.preserved_from_parent).every(item=>item.remained_identified&&item.same_value),true);
  assert.equal(r1.ledger.claims.RAW_MATRIX.identified,false);
  assert.equal(r1.ledger.claims.CONJUGACY_FINGERPRINT.identified,true);
  assert.equal(r1.ledger.claims.REPEATED_ROOT_TYPE.identified,true);
  assert.deepEqual(r1.ledger.claims.REPEATED_ROOT_TYPE.distinct_values,['NONTRIVIAL_JORDAN_REPEATED_ROOT']);
});

test('R2 singleton identifies raw matrix without changing previously identified values', () => {
  const receipt=runCompatibleSetRefinementMonotonicityAssay();
  const r2=receipt.sequence.R2;
  assert.equal(r2.validation.admitted,true);
  assert.equal(r2.family_size,1);
  assert.equal(Object.values(r2.preserved_from_parent).every(item=>item.remained_identified&&item.same_value),true);
  assert.equal(Object.values(r2.ledger.claims).every(claim=>claim.identified),true);
  assert.equal(r2.ledger.claims.RAW_MATRIX.identified,true);
});

test('empty compatible set is contradiction rather than vacuous omniscience', () => {
  const empty=runCompatibleSetRefinementMonotonicityAssay().sequence.R_empty;
  assert.equal(empty.validation.admitted,false);
  assert.equal(empty.validation.classification,'COMPATIBLE_SET_EMPTY_MODEL_OR_EVIDENCE_CONTRADICTION');
  assert.equal(empty.claim_licenses_emitted,0);
});

test('candidate-model replacement is rejected as outside pure evidence refinement', () => {
  const outside=runCompatibleSetRefinementMonotonicityAssay().sequence.R_outside;
  assert.equal(outside.validation.admitted,false);
  assert.equal(outside.validation.classification,'MODEL_OR_CLAIM_MUTATION_OUTSIDE_REFINEMENT_THEOREM');
});

test('claim ceiling separates set theorem from empirical knowledge monotonicity', () => {
  const receipt=runCompatibleSetRefinementMonotonicityAssay();
  assert.equal(receipt.parent_claim_semantics_match,true);
  assert.equal(receipt.findings.assay_validated,true);
  assert.equal(receipt.claim_ceiling.set_theoretic_refinement_preservation_theorem,true);
  assert.equal(receipt.claim_ceiling.empirical_knowledge_monotonicity,false);
  assert.equal(receipt.claim_ceiling.bayesian_convergence,false);
  assert.equal(receipt.claim_ceiling.causal_identification,false);
  assert.equal(receipt.claim_ceiling.sheaf_structure,false);
  assert.equal(receipt.claim_ceiling.production_governance,false);
  assert.equal(receipt.claim_ceiling.proto_loom,false);
  assert.equal(receipt.claim_ceiling.vercel_authority,false);
});
