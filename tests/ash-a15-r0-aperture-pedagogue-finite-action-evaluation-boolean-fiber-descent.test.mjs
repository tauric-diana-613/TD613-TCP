import assert from 'node:assert/strict';
import {
  FINITE_ACTION_EVALUATION_BOOLEAN_FIBER_DESCENT_PARENT_RECEIPT,
  finiteActionEvaluationBooleanFiberDescentCertificate,
} from '../app/dome-world/previews/a15-r0/finite-action-evaluation-boolean-fiber-descent.js';

const cert=finiteActionEvaluationBooleanFiberDescentCertificate();

assert.equal(FINITE_ACTION_EVALUATION_BOOLEAN_FIBER_DESCENT_PARENT_RECEIPT,'ec837736399e2b5e65c281c1fc88f18cc99709ad');
assert.equal(cert.parent_exact,true);
assert.equal(cert.domain.task_points.length,5);
assert.equal(cert.domain.self_functions,3125);
assert.equal(cert.domain.continuous_endomorphisms,128);
assert.equal(cert.domain.calibration_subsets,32);

assert.equal(cert.evaluation_fibers.distinct_partition_count,32);
assert.equal(cert.evaluation_fibers.full_action_partition_classes,128);
assert.equal(cert.calibration_closure.identity_closure_count,32);
assert.equal(cert.calibration_closure.all_coordinates_irreducible,true);

assert.equal(cert.boolean_lattice.hasse_edges,80);
assert.equal(cert.boolean_lattice.strict_hasse_refinements,80);
assert.equal(cert.boolean_lattice.ordered_subset_pairs,1024);
assert.equal(cert.boolean_lattice.order_embedding_passes,1024);
assert.equal(cert.boolean_lattice.meet_identity_passes,1024);
assert.equal(cert.boolean_lattice.join_identity_passes,1024);
assert.equal(cert.boolean_lattice.order_reversing_boolean_sublattice,true);

assert.equal(cert.action_tomography.action_evaluation_rank,5);
assert.equal(cert.action_tomography.injective_subset_count,1);
assert.equal(cert.action_tomography.proper_injective_subset_count,0);
assert.equal(cert.action_tomography.unique_injective_subset,'ABTMR');
assert.deepEqual(cert.action_tomography.tri_rank_signature,[1,5,11]);
assert.equal(cert.action_tomography.strict_tri_rank_ladder,true);

assert.deepEqual(cert.four_coordinate_deletions.A,{observed:'BTMR',classes:98,max_fiber:4,fiber_spectrum:{1:76,2:18,4:4},ambiguous_classes:22,ambiguous_actions:52,colliding_pairs:42});
assert.deepEqual(cert.four_coordinate_deletions.B,{observed:'ATMR',classes:46,max_fiber:4,fiber_spectrum:{1:6,2:19,4:21},ambiguous_classes:40,ambiguous_actions:122,colliding_pairs:145});
assert.deepEqual(cert.four_coordinate_deletions.T,{observed:'ABMR',classes:64,max_fiber:3,fiber_spectrum:{1:16,2:32,3:16},ambiguous_classes:48,ambiguous_actions:112,colliding_pairs:80});
assert.deepEqual(cert.four_coordinate_deletions.M,{observed:'ABTR',classes:46,max_fiber:4,fiber_spectrum:{1:6,2:19,4:21},ambiguous_classes:40,ambiguous_actions:122,colliding_pairs:145});
assert.deepEqual(cert.four_coordinate_deletions.R,{observed:'ABTM',classes:98,max_fiber:4,fiber_spectrum:{1:76,2:18,4:4},ambiguous_classes:22,ambiguous_actions:52,colliding_pairs:42});

assert.equal(cert.execution_ledger.order_relation_checks,78125);
assert.equal(cert.execution_ledger.subset_action_signature_evaluations,4096);
assert.equal(cert.execution_ledger.closure_coordinate_targets,160);
assert.equal(cert.execution_ledger.ordered_subset_pair_checks,1024);
assert.equal(cert.passed,true);

console.log('Ash A15-R0 finite action-evaluation Boolean fiber descent canonical contract passed.');
