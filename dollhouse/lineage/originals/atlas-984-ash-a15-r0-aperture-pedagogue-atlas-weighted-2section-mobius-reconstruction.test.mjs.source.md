import assert from 'node:assert/strict';
import {
  ATLAS_WEIGHTED_2SECTION_MOBIUS_RECONSTRUCTION_SCHEMA,
  ATLAS_WEIGHTED_2SECTION_MOBIUS_RECONSTRUCTION_PARENT_RECEIPT,
  atlasWeighted2SectionMobiusReconstructionCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-weighted-2section-mobius-reconstruction.js';

assert.equal(ATLAS_WEIGHTED_2SECTION_MOBIUS_RECONSTRUCTION_SCHEMA,'td613.dome-world.atlas-weighted-2section-mobius-reconstruction/v0.1');
assert.equal(ATLAS_WEIGHTED_2SECTION_MOBIUS_RECONSTRUCTION_PARENT_RECEIPT,'578be6f432cffa67dbaf6da0a47cb9d36c0fb68f');
const c=atlasWeighted2SectionMobiusReconstructionCertificate();
assert.equal(c.parent_exact,true);
assert.equal(c.passed,true);
assert.deepEqual(c.census.family_count_by_blocks,{1:50,2:1225,3:19600});
assert.equal(c.census.families,20875);
assert.equal(c.census.total_blocks,61300);
assert.equal(c.census.pair_checks,60025);
assert.equal(c.census.membership_evaluations,367800);
assert.equal(c.census.support_entries,109500);
assert.equal(c.census.nonuniform_families,18375);
assert.equal(c.census.nonlinear_families,16490);
assert.equal(c.census.nonlinear_nonuniform_families,14820);
assert.equal(c.census.marked_families,11405);
assert.equal(c.census.nonlinear_marked_families,11015);
assert.equal(c.census.high_support_distinct_entries,11405);
assert.equal(c.census.high_support_element_multiplicity,13800);
assert.deepEqual(c.census.high_support_multiplicity_histogram,{1:9090,2:2235,3:80});
assert.equal(c.census.positive_pair_entries,53655);
assert.equal(c.census.pair_weight_sum,88200);
assert.equal(c.census.positive_residual_pair_entries,37500);
assert.equal(c.census.residual_pair_multiplicity_sum,46800);
assert.equal(c.census.residual_pair_entries_multiplicity_gt1,8700);
assert.equal(c.census.weighted_successes,20875);
assert.equal(c.census.weighted_failures,0);
assert.equal(c.census.unweighted_successes,4385);
assert.equal(c.census.unweighted_failures,16490);
assert.equal(c.census.unweighted_failure_set_equals_nonlinear_set,true);
assert.equal(c.census.max_pair_weight,3);
assert.equal(c.census.max_high_support_multiplicity,3);
assert.equal(c.census.max_residual_pair_multiplicity,3);
assert.deepEqual(c.census.weighted_failure_codes,[]);
assert.deepEqual(c.necessity_controls,{capacity_removed_receiver_equal:true,capacity_removed_raw_equal:false,high_support_removed_receiver_equal:true,high_support_removed_raw_equal:false,isolated_degree_zero_recoverable:false});
assert.equal(c.proof_ledger.linearity_used,false);
assert.equal(c.proof_ledger.uniformity_used,false);
assert.equal(c.proof_ledger.degree_zero_fixed_by_union_groundedness,true);
assert.equal(c.laws.weighted_reconstruction_exact_on_declared_exhaustive_assay,true);
assert.equal(c.laws.unweighted_failure_set_equals_nonlinear_set_in_declared_assay,true);
assert.equal(c.laws.general_theorem_authority_is_algebraic_not_sampling,true);
assert.equal(c.laws.receiver_minimality_claimed,false);
assert.equal(c.laws.historical_source_identity_claimed,false);
assert.equal(c.laws.physical_network_claimed,false);
assert.ok(c.membranes.includes('ZETA_MOBIUS_RECONSTRUCTION != CAUSAL_INVERSION'));
assert.ok(c.membranes.includes('PAIR_INTERSECTION_WEIGHT != PHYSICAL_EDGE_WEIGHT'));
console.log('Ash A15-R0 Atlas weighted 2-section Möbius reconstruction canonical tests passed.');
