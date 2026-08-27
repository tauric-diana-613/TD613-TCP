import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

import {
  DIRECTED_FIBER_TRANSPORT_PARENT_RECEIPT,
  DIRECTED_FIBER_TRANSPORT_QUOTIENT_DESCENT_SCHEMA,
  composeTransportSegments,
  enterCurrentQLastActionDomain,
  rehydrateReceiptPinnedRecurrenceSource,
  routeFreeTransportDelta,
  runDirectedFiberTransportQuotientDescentAssay,
  transportHistory,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-directed-fiber-transport-quotient-descent.js';
import { pathObjectProjection } from '../app/dome-world/previews/a15-r0/aperture-pedagogue-first-bounded-path-grammar.js';
import { quotientCoordinate } from '../app/dome-world/previews/a15-r0/aperture-pedagogue-target-equivalence-quotient-congruence.js';

assert.equal(DIRECTED_FIBER_TRANSPORT_PARENT_RECEIPT, 'bd33fc4010604dc9a0a84ba10ba4d721632ac4ef');
execFileSync('git', ['cat-file', '-e', `${DIRECTED_FIBER_TRANSPORT_PARENT_RECEIPT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', DIRECTED_FIBER_TRANSPORT_PARENT_RECEIPT, 'HEAD'], { stdio: 'pipe' });

const result = runDirectedFiberTransportQuotientDescentAssay();
assert.equal(result.schema, DIRECTED_FIBER_TRANSPORT_QUOTIENT_DESCENT_SCHEMA);
assert.equal(result.passed, true, 'The preregistered directed history-fiber transport / quotient-descent obligations must pass or fail loudly.');
assert.equal(result.status, 'DIRECTED_HISTORY_FIBER_TRANSPORT_QUOTIENT_DESCENT_ROUND_CLOSED');
assert.equal(
  result.canonical_classification,
  'DIRECTED_HISTORY_LIFT_COMPOSES_EXACTLY_AND_TARGET_EQUIVALENT_ROUTES_CAN_TRANSPORT_DISTINCT_CUSTODY_PAYLOADS',
);

const anchor = rehydrateReceiptPinnedRecurrenceSource('S0', 'R1');
const duplicate = rehydrateReceiptPinnedRecurrenceSource('S0', 'R1_DUP');
assert.equal(anchor.id, 'R_AB_S0');
assert.equal(duplicate.id, 'R_AB_DUP_S0');
assert.deepEqual(anchor.endpoint, [[3, 1], [1, 4]]);
assert.deepEqual(anchor.operational_lineage, ['A', 'B']);
assert.deepEqual(anchor.custody_events.map((event) => event.scalar_response), [2, 4]);
assert.equal(anchor.receipt_variant, 'R1');
assert.equal(duplicate.receipt_variant, 'R1_DUP');
assert.deepEqual(pathObjectProjection(anchor), pathObjectProjection(duplicate));

const qSource = enterCurrentQLastActionDomain(anchor);
assert.equal(qSource.last_action, 'Q_PHASE_PULSE');
assert.equal(qSource.forcing_season, 'S0');
assert.equal(qSource.clock_phase, 'P0');
assert.deepEqual(qSource.operational_lineage, ['A', 'B', 'Q_PHASE_PULSE']);

const identity = transportHistory(qSource, []);
assert.equal(identity.status, 'DIRECTED_HISTORY_TRANSPORT_DERIVED');
assert.deepEqual(identity.final_history, qSource);
assert.deepEqual(identity.route_free_delta, {
  custody_events: [],
  evolution_events: [],
  forcing_evolution_events: [],
});
assert.equal(identity.quotient_compatibility.target_matches_parent_quotient, true);

assert.equal(result.transport_composition.passed, true);
assert.equal(result.transport_composition.controls.length, 7);
for (const row of result.transport_composition.controls) {
  assert.equal(row.exact_final_history_equal, true, 'Direct and sequential transport must produce the identical full history.');
  assert.equal(row.route_free_delta_equal, true, 'Direct and sequential transport must compose the same route-free ledger delta.');
  assert.equal(row.target_base_equal, true, 'Direct and sequential transport must terminate at the same K_period4 base object.');
  assert.equal(row.composed.status, 'DIRECTED_TRANSPORT_COMPOSITION_DERIVED');
}

const tq = transportHistory(qSource, ['T', 'Q']);
const qThenT = transportHistory(qSource, ['Q', 'T']);
assert.equal(tq.status, 'DIRECTED_HISTORY_TRANSPORT_DERIVED');
assert.equal(qThenT.status, 'DIRECTED_HISTORY_TRANSPORT_DERIVED');
assert.equal(tq.quotient_compatibility.target_matches_parent_quotient, true);
assert.equal(qThenT.quotient_compatibility.target_matches_parent_quotient, true);

assert.equal(result.receipt_distinct_source_fiber.passed, true);
assert.equal(result.receipt_distinct_source_fiber.source_base_equal, true);
assert.equal(result.receipt_distinct_source_fiber.target_base_equal, true);
assert.equal(result.receipt_distinct_source_fiber.appended_payloads_equal, true);
assert.equal(result.receipt_distinct_source_fiber.receipt_distinction_preserved, true);
assert.deepEqual(result.receipt_distinct_source_fiber.receipt_variants, ['R1', 'R1_DUP']);

const u = ['T', 'T', 'T', 'T', 'Q'];
const v = ['Q', 'T', 'T', 'T', 'T'];
const cu = quotientCoordinate(u);
const cv = quotientCoordinate(v);
assert.deepEqual({ t: cu.t, E: cu.E, O: cu.O }, { t: 4, E: 1, O: 0 });
assert.deepEqual({ t: cv.t, E: cv.E, O: cv.O }, { t: 4, E: 1, O: 0 });

const obstruction = result.quotient_descent_obstruction;
assert.equal(obstruction.passed, true);
assert.equal(obstruction.descent_status, 'TARGET_EQUIVALENCE_QUOTIENT_DESCENT_OBSTRUCTED_BY_ROUTE_FREE_CUSTODY_TRANSPORT');
assert.equal(obstruction.rows.length, 4);
assert.ok(obstruction.obstruction_count >= 1, 'At least one forcing-season source must exhibit the preregistered descent obstruction.');
for (const row of obstruction.rows) {
  assert.equal(row.same_coordinate, true, `${row.season}: hostile routes must remain in the same #729 quotient class.`);
  assert.equal(row.same_target_base, true, `${row.season}: equal quotient routes must terminate at the same base target.`);
  assert.equal(row.both_match_parent_quotient, true, `${row.season}: both actual route targets must independently match #729 source-conditioned evaluation.`);
  assert.equal(row.receipt_variant_same, true, `${row.season}: path dependence may not be manufactured by changing receipt variants.`);
}

const obstructingRow = obstruction.rows.find((row) => row.route_free_transport_distinct);
assert.ok(obstructingRow, 'The preregistered equal-quotient pair must expose a route-free transported-custody distinction or the assay must fail.');
assert.notDeepEqual(
  obstructingRow.u_transport.route_free_delta,
  obstructingRow.v_transport.route_free_delta,
  'Equal quotient coordinates and equal base targets may still transport different custody/evolution payloads.',
);

const deltaKeys = Object.keys(obstructingRow.u_transport.route_free_delta).sort();
assert.deepEqual(deltaKeys, ['custody_events', 'evolution_events', 'forcing_evolution_events']);
for (const forbidden of ['word', 'word_label', 'history_id', 'parent_history_id', 'source_key', 'target_key']) {
  assert.equal(Object.hasOwn(obstructingRow.u_transport.route_free_delta, forbidden), false, `${forbidden} must not leak into the route-free comparator.`);
}
assert.equal(result.hostile.route_label_leakage_excluded, true);
assert.equal(result.hostile.base_only_collapse_rejected, true);
assert.equal(result.hostile.receipt_only_distinction_rejected, true);
assert.equal(result.hostile.quotient_coordinate_only_transport_rejected, true);

const first = transportHistory(qSource, ['T']);
const wrongSource = enterCurrentQLastActionDomain(rehydrateReceiptPinnedRecurrenceSource('S1', 'R1'));
const wrongSecond = transportHistory(wrongSource, ['Q']);
const mistyped = composeTransportSegments(first, wrongSecond);
assert.equal(mistyped.status, 'DIRECTED_TRANSPORT_TYPE_MISMATCH_ABSTAINS');
assert.equal(mistyped.disposition, 'ABSTAIN_BEFORE_DIRECTED_TRANSPORT_COMPOSITION');
assert.equal(result.hostile.mistyped_continuation_abstains.status, 'DIRECTED_TRANSPORT_TYPE_MISMATCH_ABSTAINS');

const direct = transportHistory(qSource, u);
assert.deepEqual(
  routeFreeTransportDelta(qSource, direct.final_history),
  direct.route_free_delta,
  'The exported delta operator must reconstruct the exact route-free transport payload from source/final histories.',
);

assert.equal(result.no_h8_farming, true);
for (const forbidden of [
  'universal_quotient_descent',
  'minimal_route_sensitive_transport_state',
  'cocycle',
  'cohomology',
  'connection',
  'inverse_transport',
  'inverse_morphisms',
  'groupoid',
  'closed_nonidentity_loop',
  'loop_endomorphism',
  'holonomy',
  'curvature',
  'berry_or_quantum',
  'manifold_fiber_bundle',
  'proto_loom',
  'a16',
  'live_ash_mutation',
  'merge',
  'production',
  'vercel',
]) {
  assert.equal(result.claim_ceiling[forbidden], false, `${forbidden} must remain outside #730 authority.`);
}
assert.equal(
  result.human_stop,
  'HUMAN_𝄐_REQUIRED_BEFORE_ANY_MINIMAL_ROUTE_SENSITIVE_TRANSPORT_STATE_OR_COCYCLE_AUDITION',
);

console.log('A15-R0 directed history-fiber transport / quotient-descent summary:', JSON.stringify({
  classification: result.canonical_classification,
  obstruction_count: obstruction.obstruction_count,
  all_four_seasons_obstruct: obstruction.all_four_seasons_obstruct,
  transport_composition_controls: result.transport_composition.controls.length,
}));
console.log('Ash A15-R0 directed history-fiber transport and quotient-descent tests passed.');
