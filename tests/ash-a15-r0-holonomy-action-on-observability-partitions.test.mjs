import test from 'node:test';
import assert from 'node:assert/strict';
import { runHolonomyActionOnObservabilityPartitionsHoldout } from '../app/dome-world/previews/a15-r0/holonomy-action-on-observability-partitions.js';

test('holonomy acts on claim-relative observability partition with hostile controls intact', () => {
  const receipt=runHolonomyActionOnObservabilityPartitionsHoldout();

  assert.equal(receipt.spec_head,'387cd57a3a3633377c287a9faefa973b9d5ee818');
  assert.equal(receipt.development_pilot.status,'DEVELOPMENT_ONLY_OFF_REPO_PILOT_NOT_CONFIRMATORY');
  assert.deepEqual(receipt.earned_loop.H,[[3,5],[1,2]]);
  assert.deepEqual(receipt.earned_loop.inverse,[[2,26],[30,3]]);
  assert.equal(receipt.earned_loop.determinant,1);
  assert.deepEqual(receipt.local_readout.q,[1,0]);
  assert.deepEqual(receipt.local_readout.q_after_loop,[3,5]);

  assert.deepEqual(receipt.candidate_family.map(candidate=>candidate.vector),[
    [3,6],[3,22],[17,10],[17,26]
  ]);

  assert.equal(receipt.positive.matched_granularity,true);
  assert.deepEqual(receipt.positive.pre_partition.bucket_sizes,[2,2]);
  assert.deepEqual(receipt.positive.post_partition.bucket_sizes,[2,2]);
  assert.deepEqual(receipt.positive.pre_partition.buckets,[
    {value:3,members:['V_3_26','V_3_8']},
    {value:17,members:['V_17_26','V_17_8']}
  ]);
  assert.deepEqual(receipt.positive.post_partition.buckets,[
    {value:8,members:['V_17_8','V_3_8']},
    {value:26,members:['V_17_26','V_3_26']}
  ]);
  assert.equal(receipt.positive.partitions_incomparable,true);

  assert.equal(receipt.positive.pre_claim_profile.F_X.sufficient,true);
  assert.equal(receipt.positive.pre_claim_profile.F_Z.sufficient,false);
  assert.equal(receipt.positive.post_claim_profile.F_X.sufficient,false);
  assert.equal(receipt.positive.post_claim_profile.F_Z.sufficient,true);
  assert.equal(receipt.positive.claim_sufficiency_profile_rotated,true);
  assert.ok(receipt.positive.pre_claim_profile.F_Z.collision_witness);
  assert.ok(receipt.positive.post_claim_profile.F_X.collision_witness);

  assert.equal(receipt.flat_control.unchanged,true);
  assert.deepEqual(receipt.flat_control.post_partition,receipt.positive.pre_partition);
  assert.equal(receipt.reverse_control.restored_exactly,true);
  assert.deepEqual(receipt.reverse_control.restored_readout,[1,0]);
  assert.deepEqual(receipt.reverse_control.restored_partition,receipt.positive.pre_partition);

  assert.deepEqual(receipt.gauge_control.K,[[2,1],[1,1]]);
  assert.deepEqual(receipt.gauge_control.K_inverse,[[1,30],[30,2]]);
  assert.deepEqual(receipt.gauge_control.H_prime,[[26,17],[28,10]]);
  assert.deepEqual(receipt.gauge_control.q_prime,[1,30]);
  assert.deepEqual(receipt.gauge_control.qH_prime,[29,7]);
  assert.equal(receipt.gauge_control.values_preserved,true);
  assert.equal(receipt.gauge_control.claim_profiles_preserved,true);

  assert.equal(receipt.invariant_readout_control.nontrivial_loop,true);
  assert.deepEqual(receipt.invariant_readout_control.q_inv,[0,1]);
  assert.deepEqual(receipt.invariant_readout_control.q_inv_after_loop,[0,1]);
  assert.equal(receipt.invariant_readout_control.unchanged,true);

  assert.equal(receipt.findings.fixed_readout_partition_changes_under_earned_nontrivial_loop,true);
  assert.equal(receipt.findings.changed_partition_rotates_preregistered_claim_sufficiency_profile,true);
  assert.equal(receipt.findings.flat_loop_leaves_partition_unchanged,true);
  assert.equal(receipt.findings.reverse_loop_restores_original_partition,true);
  assert.equal(receipt.findings.coordinate_gauge_clone_preserves_observation_values_and_licenses,true);
  assert.equal(receipt.findings.nontrivial_loop_need_not_change_every_readout,true);
  assert.equal(receipt.findings.assay_mechanism_validated,true);

  assert.equal(receipt.research_label,'DISCRETE_HOLONOMY_ACTION_ON_CLAIM_RELATIVE_OBSERVABILITY');
  assert.equal(receipt.claim_ceiling.discrete_finite_holonomy_action_on_observability_partition,true);
  assert.equal(receipt.claim_ceiling.universal_td613_aia_holonomy_law,false);
  assert.equal(receipt.claim_ceiling.information_geometric_tensor,false);
  assert.equal(receipt.claim_ceiling.physical_holonomy,false);
  assert.equal(receipt.claim_ceiling.proto_loom,false);
  assert.equal(receipt.claim_ceiling.production_authority,false);
  assert.equal(receipt.claim_ceiling.vercel_authority,false);
});
