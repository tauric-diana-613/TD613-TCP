import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

import {
  MINIMAL_ROUTE_SENSITIVE_TRANSPORT_PARENT_RECEIPT,
  MINIMAL_ROUTE_SENSITIVE_TRANSPORT_STATE_SCHEMA,
  leanTransportObservable,
  reconstructRouteScheduleFromLean,
  routeSchedule,
  runMinimalRouteSensitiveTransportStateAssay,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-minimal-route-sensitive-transport-state.js';
import {
  enterCurrentQLastActionDomain,
  rehydrateReceiptPinnedRecurrenceSource,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-directed-fiber-transport-quotient-descent.js';

assert.equal(MINIMAL_ROUTE_SENSITIVE_TRANSPORT_PARENT_RECEIPT, 'e14a4a9a7a35cac8b5c806d1f2fed4317f0effc7');
execFileSync('git', ['cat-file', '-e', `${MINIMAL_ROUTE_SENSITIVE_TRANSPORT_PARENT_RECEIPT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', MINIMAL_ROUTE_SENSITIVE_TRANSPORT_PARENT_RECEIPT, 'HEAD'], { stdio: 'pipe' });

const result = runMinimalRouteSensitiveTransportStateAssay();
assert.equal(result.schema, MINIMAL_ROUTE_SENSITIVE_TRANSPORT_STATE_SCHEMA);
assert.equal(result.passed, true, 'The preregistered minimal route-sensitive transport-state obligations must pass or fail loudly.');
assert.equal(result.status, 'MINIMAL_ROUTE_SENSITIVE_TRANSPORT_STATE_ROUND_CLOSED');
assert.equal(
  result.canonical_classification,
  'EXACT_ROUTE_FREE_TRANSPORT_HAS_TRIVIAL_ROUTE_KERNEL_AND_REQUIRES_ROUTE_FAITHFUL_TQ_BLOCK_SCHEDULE',
);

assert.equal(result.symbolic_reconstruction.passed, true);
assert.equal(result.symbolic_reconstruction.source_rows.length, 4);
for (const row of result.symbolic_reconstruction.source_rows) {
  assert.equal(row.q_trace_is_unit, true, `${row.season}: each Q pulse must add exactly one trace unit.`);
  assert.equal(row.t_last_action_stable, true, `${row.season}: T must preserve Q_PHASE_PULSE last_action in this authored domain.`);
  assert.equal(row.four_tick_season_returns, true, `${row.season}: four T ticks must return the forcing-season label.`);
}
assert.match(result.symbolic_reconstruction.universal_identity, /p_j = observed_j - baseline_j/);
assert.match(result.symbolic_reconstruction.proof_scope, /not a finite-horizon proof/);

const source = enterCurrentQLastActionDomain(rehydrateReceiptPinnedRecurrenceSource('S0', 'R1'));
const mixedWord = ['Q', 'Q', 'T', 'Q', 'T', 'T', 'Q', 'Q'];
const mixedSchedule = routeSchedule(mixedWord);
assert.equal(mixedSchedule.status, 'ROUTE_FAITHFUL_TQ_BLOCK_SCHEDULE_DERIVED');
assert.deepEqual(mixedSchedule.blocks, [2, 1, 0, 2]);
assert.deepEqual(mixedSchedule.prefix_q_before_ticks, [2, 3, 3]);
assert.equal(mixedSchedule.q_total, 5);

const mixedLean = leanTransportObservable(source, mixedWord);
assert.equal(mixedLean.status, 'LEAN_ROUTE_FREE_TRANSPORT_OBSERVABLE_DERIVED');
assert.deepEqual(Object.keys(mixedLean).sort(), ['q_event_count', 'status', 'tick_scalar_responses']);
for (const forbidden of [
  'word', 'word_label', 'history_id', 'parent_history_id', 'source_key', 'target_key',
  'receipt_variant', 'consumed', 'forcing_season', 'q_scalar_responses',
]) {
  assert.equal(Object.hasOwn(mixedLean, forbidden), false, `${forbidden} must not leak into the lean comparator.`);
}
const mixedReconstructed = reconstructRouteScheduleFromLean(source, mixedLean);
assert.equal(mixedReconstructed.status, 'ROUTE_FAITHFUL_TQ_BLOCK_SCHEDULE_RECONSTRUCTED_FROM_LEAN_TRANSPORT');
assert.deepEqual(mixedReconstructed.blocks, mixedSchedule.blocks);
assert.deepEqual(mixedReconstructed.prefix_q_before_ticks, mixedSchedule.prefix_q_before_ticks);
assert.deepEqual(mixedReconstructed.reconstructed_word, mixedWord);

const qOnly = ['Q', 'Q', 'Q'];
const qOnlyLean = leanTransportObservable(source, qOnly);
const qOnlyReconstructed = reconstructRouteScheduleFromLean(source, qOnlyLean);
assert.deepEqual(qOnlyReconstructed.blocks, [3]);
assert.deepEqual(qOnlyReconstructed.reconstructed_word, qOnly);

assert.equal(result.concrete_controls.passed, true);
assert.equal(result.concrete_controls.rows.length, 40);
assert.equal(result.concrete_controls.authority, 'HOSTILE_SANITY_ONLY_NOT_UNIVERSAL_PROOF');
for (const row of result.concrete_controls.rows) assert.equal(row.passed, true);

assert.equal(result.parent_obstruction_hostile.passed, true);
assert.deepEqual(result.parent_obstruction_hostile.coordinate, { t: 4, E: 1, O: 0 });
assert.equal(result.parent_obstruction_hostile.rows.length, 4);
for (const row of result.parent_obstruction_hostile.rows) {
  assert.equal(row.same_parent_coordinate, true);
  assert.equal(row.schedule_distinct, true);
  assert.equal(row.lean_distinct, true);
  assert.equal(row.u_reconstructs, true);
  assert.equal(row.v_reconstructs, true);
}

assert.equal(result.first_moment_hostile.passed, true);
assert.deepEqual(result.first_moment_hostile.u_blocks, [0, 1, 1, 0]);
assert.deepEqual(result.first_moment_hostile.v_blocks, [1, 0, 0, 1]);
assert.deepEqual(result.first_moment_hostile.shared, { t: 3, E: 1, O: 1, q_total: 2, potential: 3 });
assert.equal(
  result.first_moment_hostile.classification,
  'PARITY_QUOTIENT_PLUS_FIRST_BLOCK_MOMENT_REMAINS_TRANSPORT_INSUFFICIENT',
);
for (const row of result.first_moment_hostile.rows) assert.equal(row.lean_distinct, true);

assert.equal(result.receipt_externality.passed, true);
assert.equal(result.receipt_externality.receipt_distinction_preserved, true);
assert.equal(result.receipt_externality.route_free_payload_equal, true);
assert.equal(result.receipt_externality.lean_observable_equal, true);
assert.equal(result.receipt_externality.reconstructed_schedule_equal, true);

assert.equal(result.minimality.passed, true);
assert.equal(result.minimality.exact_transport_kernel, 'TRIVIAL_ROUTE_IDENTITY_KERNEL');
assert.match(result.minimality.quotient_order_consequence, /genuine many-to-one route quotient is not/);
assert.equal(result.minimality.fixed_dimension_claim, false);
assert.equal(result.no_h8_farming, true);

for (const forbidden of [
  'cocycle',
  'cohomology',
  'connection',
  'differential_geometric_parallel_transport',
  'inverse_transport',
  'inverse_morphisms',
  'groupoid',
  'closed_nonidentity_loop',
  'loop_endomorphism',
  'holonomy',
  'curvature',
  'berry_or_quantum',
  'manifold_fiber_bundle',
  'fixed_finite_dimensional_transport_state',
  'proto_loom',
  'a16',
  'live_ash_mutation',
  'merge',
  'production',
  'vercel',
]) {
  assert.equal(result.claim_ceiling[forbidden], false, `${forbidden} must remain outside #732 authority.`);
}

assert.equal(
  result.human_stop,
  'HUMAN_𝄐_REQUIRED_BEFORE_ANY_TRANSPORT_INCREMENT_COCYCLE_OR_WEAKER_OBSERVABLE_QUOTIENT_AUDITION',
);

console.log('A15-R0 minimal route-sensitive transport state summary:', JSON.stringify({
  classification: result.canonical_classification,
  exact_transport_kernel: result.minimality.exact_transport_kernel,
  symbolic_source_controls: result.symbolic_reconstruction.source_rows.length,
  concrete_hostile_controls: result.concrete_controls.rows.length,
}));
console.log('Ash A15-R0 minimal route-sensitive transport state tests passed.');
