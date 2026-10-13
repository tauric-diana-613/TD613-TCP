import test from 'node:test';
import assert from 'node:assert/strict';
import { runHolonomyObservabilityProjectiveOrbitAssay } from '../app/dome-world/previews/a15-r0/holonomy-observability-projective-orbit.js';

test('earned loop induces controlled projective observability orbit', () => {
  const receipt=runHolonomyObservabilityProjectiveOrbitAssay();

  assert.equal(receipt.spec_head,'4fee38e59b2966c6bd1c8fa840fc8e2295e05a51');
  assert.equal(receipt.projective_orbit.length,8);
  assert.equal(receipt.projective_orbit.first_repeat_index,8);
  assert.equal(receipt.projective_orbit.repeats_index,0);
  assert.deepEqual(receipt.projective_orbit.repeated_direction,[1,0]);

  assert.deepEqual(receipt.projective_orbit.records.map(record=>record.raw_readout),[
    [1,0],[3,5],[14,25],[5,27],[11,17],[19,27],[22,25],[29,5]
  ]);
  assert.deepEqual(receipt.projective_orbit.records.map(record=>record.projective_direction),[
    [1,0],[1,12],[1,4],[1,24],[1,10],[1,21],[1,11],[1,13]
  ]);
  assert.deepEqual(receipt.projective_orbit.records.map(record=>record.partition.bucket_sizes),[
    [2,2],[2,2],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,2],[1,1,1,1],[1,1,1,1]
  ]);
  assert.deepEqual(receipt.projective_orbit.records.map(record=>record.claim_profile),[
    {F_X:true,F_Z:false},
    {F_X:false,F_Z:true},
    {F_X:true,F_Z:true},
    {F_X:true,F_Z:true},
    {F_X:true,F_Z:true},
    {F_X:false,F_Z:false},
    {F_X:true,F_Z:true},
    {F_X:true,F_Z:true}
  ]);

  assert.equal(receipt.finite_candidate_partitions.unique_partition_count,4);
  assert.equal(receipt.finite_candidate_partitions.projective_direction_count_exceeds_partition_count,true);
  assert.equal(receipt.claim_sufficiency_orbit.unique_claim_profile_count,4);
  assert.equal(receipt.claim_sufficiency_orbit.all_four_boolean_FX_FZ_profiles_visited,true);

  assert.equal(receipt.reverse_control.all_pass,true);
  assert.equal(receipt.flat_control.orbit_length,1);
  assert.equal(receipt.flat_control.passes,true);
  assert.equal(receipt.invariant_readout_control.orbit_length,1);
  assert.equal(receipt.invariant_readout_control.passes,true);
  assert.equal(receipt.gauge_control.observation_partition_and_claim_sequences_preserved,true);

  assert.equal(receipt.findings.earned_loop_induces_nontrivial_projective_readout_orbit,true);
  assert.equal(receipt.findings.projectively_distinct_readouts_can_alias_to_same_finite_candidate_partition,true);
  assert.equal(receipt.findings.multiple_claim_sufficiency_regimes_occur_along_orbit,true);
  assert.equal(receipt.findings.all_four_boolean_two_claim_profiles_occur_in_this_frozen_candidate_family,true);
  assert.equal(receipt.findings.reverse_action_traverses_orbit_backward,true);
  assert.equal(receipt.findings.flat_and_invariant_readout_nulls_have_trivial_orbits,true);
  assert.equal(receipt.findings.gauge_clone_preserves_observation_partition_and_claim_sequences,true);
  assert.equal(receipt.findings.assay_mechanism_validated,true);

  assert.equal(receipt.claim_ceiling.discrete_projective_readout_orbit,true);
  assert.equal(receipt.claim_ceiling.holonomy_group_order,false);
  assert.equal(receipt.claim_ceiling.gl2_element_order,false);
  assert.equal(receipt.claim_ceiling.physical_holonomy,false);
  assert.equal(receipt.claim_ceiling.continuum_parallel_transport,false);
  assert.equal(receipt.claim_ceiling.proto_loom,false);
  assert.equal(receipt.claim_ceiling.production_authority,false);
  assert.equal(receipt.claim_ceiling.vercel_authority,false);
});
