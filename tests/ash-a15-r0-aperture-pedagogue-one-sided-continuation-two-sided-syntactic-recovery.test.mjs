import assert from 'node:assert/strict';
import {
  ONE_SIDED_CONTINUATION_TWO_SIDED_SYNTACTIC_RECOVERY_PARENT_RECEIPT,
  oneSidedContinuationTwoSidedSyntacticRecoveryCertificate,
} from '../app/dome-world/previews/a15-r0/one-sided-continuation-two-sided-syntactic-recovery.js';

const cert=oneSidedContinuationTwoSidedSyntacticRecoveryCertificate();

assert.equal(ONE_SIDED_CONTINUATION_TWO_SIDED_SYNTACTIC_RECOVERY_PARENT_RECEIPT,'fa1c369abe3e628a92405aef03aeb6f9e2f76087');
assert.equal(cert.parent_exact,true);
assert.equal(cert.domain.task_points.length,5);
assert.equal(cert.domain.self_functions,3125);
assert.equal(cert.domain.continuous_actions,128);
assert.equal(cert.domain.unordered_distinct_action_pairs,8128);

assert.equal(cert.action_monoid.size,128);
assert.equal(cert.action_monoid.composition_checks,16384);
assert.equal(cert.action_monoid.composition_failures,0);
assert.equal(cert.action_monoid.composition_closed,true);

assert.deepEqual(cert.right_context.endpoint_fibers.A,{A:84,B:18,T:20,M:2,R:4});
assert.deepEqual(cert.right_context.endpoint_fibers.B,{A:44,B:23,T:31,M:9,R:21});
assert.deepEqual(cert.right_context.endpoint_fibers.T,{A:36,B:10,T:36,M:10,R:36});
assert.deepEqual(cert.right_context.endpoint_fibers.M,{A:21,B:9,T:31,M:23,R:44});
assert.deepEqual(cert.right_context.endpoint_fibers.R,{A:4,B:2,T:20,M:18,R:84});

assert.deepEqual(cert.right_context.endpoint_alias_pairs,{A:3836,B:1910,T:1980,M:1910,R:3836,total:13472});
assert.deepEqual(cert.right_context.endpoint_separated_pairs,{A:4292,B:6218,T:6148,M:6218,R:4292,total:27168});
assert.equal(cert.right_context.state_indexed_pairs,40640);
assert.equal(cert.right_context.readout_comparisons,5201920);
assert.equal(cert.right_context.alias_readout_comparisons,1724416);
assert.equal(cert.right_context.alias_future_readout_mismatches,0);
assert.equal(cert.right_context.endpoint_kernel_mismatches,0);
assert.deepEqual(cert.right_context.quotient_classes,{A:5,B:5,T:5,M:5,R:5});
assert.equal(cert.right_context.right_context_equals_endpoint_kernel,true);

assert.deepEqual(cert.two_sided_context.access_actions,{A:'AAAAA',B:'BABBR',T:'TARRR',M:'MAMMM',R:'RARRR'});
assert.equal(cert.two_sided_context.baseline_right_alias_pairs,3836);
assert.equal(cert.two_sided_context.baseline_right_separated_pairs,4292);
assert.equal(cert.two_sided_context.right_context_classes_at_A,5);
assert.equal(cert.two_sided_context.syntactic_action_classes,128);
assert.equal(cert.two_sided_context.action_pair_coordinate_checks,40640);
assert.equal(cert.two_sided_context.witness_checks,8128);
assert.equal(cert.two_sided_context.witness_failures,0);
assert.equal(cert.two_sided_context.all_distinct_actions_context_separated,true);

assert.equal(cert.laws.right_context_endpoint_kernel,true);
assert.equal(cert.laws.fixed_calibration_collapses_128_to_5,true);
assert.equal(cert.laws.strict_one_sided_two_sided_gap,true);
assert.equal(cert.laws.two_sided_context_recovers_global_action_identity,true);
assert.equal(cert.laws.memoryless_same_endpoint_same_future_state_readouts,true);

assert.equal(cert.execution_ledger.self_functions,3125);
assert.equal(cert.execution_ledger.order_relation_checks,78125);
assert.equal(cert.execution_ledger.composition_checks,16384);
assert.equal(cert.execution_ledger.state_indexed_action_pairs,40640);
assert.equal(cert.execution_ledger.right_context_readout_comparisons,5201920);
assert.equal(cert.execution_ledger.alias_future_readout_comparisons,1724416);
assert.equal(cert.execution_ledger.access_endpoint_checks,640);
assert.equal(cert.execution_ledger.suffix_separator_checks,1280);
assert.equal(cert.execution_ledger.action_pair_coordinate_checks,40640);
assert.equal(cert.execution_ledger.two_sided_context_witness_checks,8128);
assert.equal(cert.passed,true);

console.log('Ash A15-R0 one-sided continuation / two-sided syntactic recovery canonical contract passed.');
