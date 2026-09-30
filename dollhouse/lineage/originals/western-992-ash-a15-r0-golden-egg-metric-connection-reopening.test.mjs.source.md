import assert from 'node:assert/strict';
import {
  GOLDEN_EGG_METRIC_CONNECTION_REOPENING_CERTIFICATE as C,
  partitionTransferDistance,
  enumerateNamedSetPartitions,
  auditFinitePartitionMetric
} from '../app/dome-world/previews/a15-r0/golden-egg-metric-connection-reopening.js';

assert.equal(C.exact_earned_parent,'c0ef84c5c48af37a8f79d89c80d2e055da707836');
assert.equal(C.historical_rest_ledger.formal_combinations,320);
assert.equal(C.historical_rest_ledger.threshold_feasible,24);
assert.equal(C.historical_rest_ledger.pareto_minimal,18);
assert.equal(C.historical_rest_ledger.empirical_joint_realized,0);
assert.equal(C.historical_rest_ledger.golden_egg_earned,false);

const B=C.candidate_geometry.base_metric;
assert.equal(B.pair_checks,9);assert.equal(B.triple_checks,27);assert.equal(B.identity_failures,0);assert.equal(B.symmetry_failures,0);assert.equal(B.triangle_failures,0);assert.equal(B.passed,true);
const M=C.candidate_geometry.observability_partition_metric;
assert.equal(M.partition_count,15);assert.equal(M.pair_checks,225);assert.equal(M.triple_checks,3375);assert.equal(M.identity_failures,0);assert.equal(M.symmetry_failures,0);assert.equal(M.triangle_failures,0);assert.equal(M.passed,true);

const F=C.candidate_geometry.face_signature;
assert.deepEqual(F.loop,[[3,5],[1,2]]);assert.equal(F.determinant_mod31,1);assert.equal(F.trace_mod31,5);assert.equal(F.nonidentity,true);assert.equal(F.gauge_signature_preserved,true);
assert.equal(C.connection_action_binding.exact_same_loop,true);
assert.deepEqual(C.connection_action_binding.partition_displacements,{positive:2,flat:0,reverse_restored:0,gauge:2,invariant_readout:0});

assert.equal(C.hostiles.orientation_inconsistent_reverse_rejected,true);
assert.equal(C.hostiles.bucket_profile.profiles_equal,true);
assert.equal(C.hostiles.bucket_profile.metric_displacement,2);
assert.equal(C.hostiles.bucket_profile.bucket_profile_insufficient,true);
assert.equal(C.hostiles.cross_universe_partition_rejected,true);
assert.equal(C.hostiles.malformed_metric.malformed_metric_rejected,true);
assert.equal(C.hostiles.old_component_ci_witness_retroactively_promoted,false);

assert.equal(C.golden_egg.reopening_condition_met,true);
assert.equal(C.golden_egg.reopening_trigger,'NEWLY_DECLARED_CANDIDATE_GEOMETRY_WITH_METRIC_AND_CONNECTION');
assert.equal(C.golden_egg.information_curvature_frontier,'REOPENED_FOR_EXPERIMENT_NOT_SOLVED');
assert.equal(C.golden_egg.empirical_joint_realization,false);
assert.equal(C.golden_egg.empirical_joint_realized_count,0);
assert.equal(C.golden_egg.golden_egg_earned,false);
assert.equal(C.membranes.geometric_reopening_not_golden_egg_completion,true);
assert.equal(C.membranes.nontrivial_holonomy_not_universal_displacement,true);
assert.equal(C.passed,true);

const toy=[['a','b'],['c','d']];
assert.equal(partitionTransferDistance(toy,toy),0);
assert.equal(partitionTransferDistance([['a','b'],['c','d']],[['a','c'],['b','d']]),2);
const parts=enumerateNamedSetPartitions(['a','b','c','d']);assert.equal(parts.length,15);
assert.equal(auditFinitePartitionMetric(['a','b','c','d']).passed,true);

console.log('Ash A15-R0 Golden Egg metric-connection reopening canonical tests passed.');
