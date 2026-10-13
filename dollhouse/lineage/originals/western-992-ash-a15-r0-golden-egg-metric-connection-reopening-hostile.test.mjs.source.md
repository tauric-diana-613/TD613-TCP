import assert from 'node:assert/strict';
import {
  GOLDEN_EGG_METRIC_CONNECTION_REOPENING_CERTIFICATE as C,
  partitionTransferDistance,
  auditFinitePartitionMetric
} from '../app/dome-world/previews/a15-r0/golden-egg-metric-connection-reopening.js';

// Equal bucket-size profiles may hide a real change of named partition membership.
const crossA={buckets:[{value:1,members:['a','b']},{value:2,members:['c','d']}]};
const crossB={buckets:[{value:99,members:['a','c']},{value:-7,members:['b','d']}]};
assert.deepEqual(crossA.buckets.map(b=>b.members.length).sort(),crossB.buckets.map(b=>b.members.length).sort());
assert.equal(partitionTransferDistance(crossA,crossB),2);

// Raw bucket labels are observational decoration and cannot change the metric.
const relabeled={buckets:[{value:800,members:['a','b']},{value:900,members:['c','d']}]};
assert.equal(partitionTransferDistance(crossA,relabeled),0);

// Different named universes fail closed.
assert.throws(()=>partitionTransferDistance([['a'],['b']],[['a'],['c']]),/universes differ/);

// Duplicate named membership fails closed.
assert.throws(()=>partitionTransferDistance([['a'],['a','b']],[['a'],['b']]),/repeats a named member/);

// The real metric survives exhaustive finite axioms; a deliberately nonmetric control is detected by the assay.
assert.equal(auditFinitePartitionMetric(['a','b','c','d']).passed,true);
assert.equal(C.hostiles.malformed_metric.malformed_metric_rejected,true);
assert.ok(C.hostiles.malformed_metric.triangle_failures_detected>0);

// Reconstructibility alone cannot sneak an orientation-inconsistent edge into the connection.
assert.equal(C.hostiles.orientation_inconsistent_reverse_rejected,true);

// Nontrivial face holonomy has readout-relative action, not compulsory scalar displacement.
assert.equal(C.connection_action_binding.partition_displacements.positive,2);
assert.equal(C.connection_action_binding.partition_displacements.invariant_readout,0);
assert.equal(C.membranes.nontrivial_holonomy_not_universal_displacement,true);

// Flat and reverse controls must return zero displacement.
assert.equal(C.connection_action_binding.partition_displacements.flat,0);
assert.equal(C.connection_action_binding.partition_displacements.reverse_restored,0);

// Geometric reopening cannot counterfeit an empirical Golden Egg realization.
assert.equal(C.historical_rest_ledger.empirical_joint_realized,0);
assert.equal(C.golden_egg.empirical_joint_realized_count,0);
assert.equal(C.golden_egg.empirical_joint_realization,false);
assert.equal(C.golden_egg.golden_egg_earned,false);
assert.equal(C.claim_ceiling.production_authority,false);
assert.equal(C.claim_ceiling.vercel_authority,false);
assert.equal(C.claim_ceiling.merge_authority,false);

console.log('Ash A15-R0 Golden Egg metric-connection reopening hostile tests passed.');
