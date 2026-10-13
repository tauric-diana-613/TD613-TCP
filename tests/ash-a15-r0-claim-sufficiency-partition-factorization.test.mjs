import test from 'node:test';
import assert from 'node:assert/strict';
import { runClaimSufficiencyPartitionFactorizationAssay } from '../app/dome-world/previews/a15-r0/claim-sufficiency-partition-factorization.js';

test('finite claim-sufficiency theorem certificate states bucket/refinement/factorization equivalence', () => {
  const theorem=runClaimSufficiencyPartitionFactorizationAssay().theorem_certificate;
  assert.equal(theorem.theorem_id,'FINITE_CLAIM_SUFFICIENCY_IFF_MEASUREMENT_PARTITION_REFINES_CLAIM_PARTITION_IFF_CLAIM_FACTORS_THROUGH_MEASUREMENT');
  assert.equal(theorem.finite_sampling_required,false);
  assert.equal(theorem.probabilistic_assumptions_required,false);
  assert.equal(theorem.category_theory_required,false);
});

test('fresh holdout target partition contains two conjugacy classes of size two', () => {
  const holdout=runClaimSufficiencyPartitionFactorizationAssay().holdout;
  assert.equal(holdout.candidate_count,4);
  assert.equal(holdout.target_claim_partition.length,2);
  assert.deepEqual(holdout.target_claim_partition.map(block=>block.member_count),[2,2]);
});

test('aligned measurement factors target claim through two pure buckets', () => {
  const aligned=runClaimSufficiencyPartitionFactorizationAssay().holdout.measurements.aligned;
  assert.equal(aligned.scalar_observation_count,1);
  assert.deepEqual(aligned.outcome_values,[5,7]);
  assert.deepEqual(aligned.bucket_size_multiset,[2,2]);
  assert.equal(aligned.all_buckets_claim_pure,true);
  assert.equal(aligned.partition_refines_claim_partition,true);
  assert.equal(aligned.factorization_exists,true);
  assert.equal(aligned.factorization_verified_on_every_candidate,true);
  assert.ok(aligned.factor_map_g['5']);
  assert.ok(aligned.factor_map_g['7']);
});

test('transverse measurement has identical bucket cardinalities but crosses claim partition', () => {
  const receipt=runClaimSufficiencyPartitionFactorizationAssay();
  const transverse=receipt.holdout.measurements.transverse;
  assert.deepEqual(transverse.outcome_values,[0,1]);
  assert.deepEqual(transverse.bucket_size_multiset,[2,2]);
  assert.equal(transverse.all_buckets_claim_pure,false);
  assert.equal(transverse.partition_refines_claim_partition,false);
  assert.equal(transverse.factorization_exists,false);
  assert.ok(transverse.collision_witness);
  assert.equal(transverse.collision_witness.shared_measurement_value,0);
  assert.notDeepEqual(transverse.collision_witness.left_claim_value,transverse.collision_witness.right_claim_value);
  assert.equal(receipt.holdout.matched_measurement_geometry.same_scalar_budget,true);
  assert.equal(receipt.holdout.matched_measurement_geometry.same_outcome_count,true);
  assert.equal(receipt.holdout.matched_measurement_geometry.same_bucket_size_multiset,true);
});

test('claim-relative anisotropy relation remains discrete and claim bounded', () => {
  const receipt=runClaimSufficiencyPartitionFactorizationAssay();
  assert.equal(receipt.findings.assay_validated,true);
  assert.equal(receipt.matched_holdout_relation,'IDENTICAL_MEASUREMENT_BUCKET_CARDINALITIES_CAN_HAVE_DIFFERENT_CLAIM_SUFFICIENCY_BECAUSE_PARTITION_ALIGNMENT_DIFFERS');
  assert.equal(receipt.discrete_aia_candidate_relation,'CLAIM_RELATIVE_ANISOTROPY_SAME_MEASUREMENT_GRANULARITY_DIFFERENT_PARTITION_ALIGNMENT_DIFFERENT_EPISTEMIC_ADEQUACY');
  assert.equal(receipt.claim_ceiling.probabilistic_sufficiency,false);
  assert.equal(receipt.claim_ceiling.fisher_information_geometry,false);
  assert.equal(receipt.claim_ceiling.physical_anisotropy,false);
  assert.equal(receipt.claim_ceiling.continuum_geometry,false);
  assert.equal(receipt.claim_ceiling.sheaf_structure,false);
  assert.equal(receipt.claim_ceiling.category_theory_structure,false);
  assert.equal(receipt.claim_ceiling.proto_loom,false);
  assert.equal(receipt.claim_ceiling.production_authority,false);
  assert.equal(receipt.claim_ceiling.vercel_authority,false);
});
