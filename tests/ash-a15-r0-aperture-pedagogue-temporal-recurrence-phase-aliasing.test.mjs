import assert from 'node:assert/strict';

import {
  deriveRecurrenceHistoryUniverse,
  recurrenceCandidateAbstractions,
  runTemporalRecurrencePhaseAliasingGauntlet,
  stepPsiFourTicks,
  stepPsiTick,
  stepPsiTwoTicks,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-temporal-recurrence-phase-aliasing.js';

const result = runTemporalRecurrencePhaseAliasingGauntlet();

assert.equal(result.passed, true, 'The preregistered temporal recurrence / phase-aliasing gauntlet must pass before any bounded classification is emitted.');
assert.equal(result.status, 'TEMPORAL_RECURRENCE_PHASE_ALIASING_ROUND_CLOSED');
assert.equal(
  result.canonical_classification,
  'FINITE_PERIOD_TWO_PHASE_ALIASES_PERIOD_FOUR_FORCING_AND_PERIOD_FOUR_AUGMENTATION_RESTORES_DECLARED_EXOGENOUS_CONGRUENCE',
);

const recurrence = deriveRecurrenceHistoryUniverse();
assert.equal(recurrence.status, 'RECURRENCE_HISTORY_UNIVERSE_DERIVED_FROM_PARENT_TEMPORAL_CUSTODY');
assert.deepEqual(recurrence.forcing_seasons, ['S0', 'S1', 'S2', 'S3']);
assert.deepEqual(recurrence.clock_by_season, { S0: 'P0', S1: 'P1', S2: 'P0', S3: 'P1' });

const byId = new Map(recurrence.histories.map((history) => [history.id, history]));
const R_AB_S0 = byId.get('R_AB_S0');
const R_AB_DUP_S0 = byId.get('R_AB_DUP_S0');
const R_AB_S2 = byId.get('R_AB_S2');

assert.ok(R_AB_S0 && R_AB_DUP_S0 && R_AB_S2, 'Required recurrence hostile histories must be derived from #714 custody.');
assert.deepEqual(R_AB_S0.endpoint, [[3, 1], [1, 4]]);
assert.deepEqual(R_AB_S2.endpoint, [[3, 1], [1, 4]]);
assert.equal(R_AB_S0.last_action, 'B');
assert.equal(R_AB_S2.last_action, 'B');
assert.deepEqual(R_AB_S0.operational_lineage, ['A', 'B']);
assert.deepEqual(R_AB_S2.operational_lineage, ['A', 'B']);
assert.equal(R_AB_S0.clock_phase, 'P0');
assert.equal(R_AB_S2.clock_phase, 'P0');
assert.equal(R_AB_S0.forcing_season, 'S0');
assert.equal(R_AB_S2.forcing_season, 'S2');

assert.deepEqual(
  recurrenceCandidateAbstractions.K_temporal(R_AB_S0),
  recurrenceCandidateAbstractions.K_temporal(R_AB_S2),
  'The hostile pair must collide under the #714 temporal abstraction before evolution.',
);
assert.notDeepEqual(
  recurrenceCandidateAbstractions.K_period4(R_AB_S0),
  recurrenceCandidateAbstractions.K_period4(R_AB_S2),
  'The period-four repair must preserve the declared forcing distinction.',
);

const S0Successor = stepPsiTick(R_AB_S0);
const S2Successor = stepPsiTick(R_AB_S2);
assert.deepEqual(S0Successor.endpoint, [[3, 2], [1, 4]]);
assert.equal(S0Successor.forcing_season, 'S1');
assert.equal(S0Successor.clock_phase, 'P1');
assert.deepEqual(S2Successor.endpoint, [[3, 3], [1, 4]]);
assert.equal(S2Successor.forcing_season, 'S3');
assert.equal(S2Successor.clock_phase, 'P1');
assert.notDeepEqual(
  recurrenceCandidateAbstractions.K_temporal(S0Successor),
  recurrenceCandidateAbstractions.K_temporal(S2Successor),
  'Equal visible P0 states at S0/S2 must separate when the declared period-four law consumes forcing position.',
);

assert.equal(result.hostile.initial_K_temporal_equal, true);
assert.equal(result.hostile.successor_K_temporal_equal, false);
assert.equal(result.hostile.classification, 'PERIOD_TWO_CONTROL_PHASE_ALIASES_PERIOD_FOUR_EXOGENOUS_SCHEDULE');

const temporalOneTick = result.temporal_candidate_evaluations.find((row) => row.operation_id === 'PSI_TICK');
assert.ok(temporalOneTick);
assert.equal(temporalOneTick.representative_independent, false, 'The #714 temporal abstraction must fail under the widened period-four schedule.');
assert.ok(
  temporalOneTick.violations.some((violation) => violation.source_member_ids.includes('R_AB_S0') && violation.source_member_ids.includes('R_AB_S2')),
  'The witnessed temporal failure must include the preregistered S0/S2 alias pair.',
);

for (const evaluation of result.period4_candidate_evaluations) {
  assert.equal(
    evaluation.representative_independent,
    true,
    `${evaluation.operation_id} must be representative-independent under K_period4.`,
  );
}

assert.ok(result.non_vacuous_period4_fiber, 'The period-four candidate must retain a non-singleton receipt-distinct fiber.');
assert.deepEqual(
  [...result.non_vacuous_period4_fiber.member_ids].sort(),
  ['R_AB_DUP_S0', 'R_AB_S0'],
);
assert.deepEqual(
  recurrenceCandidateAbstractions.K_period4(R_AB_S0),
  recurrenceCandidateAbstractions.K_period4(R_AB_DUP_S0),
  'Receipt-distinct duplicate histories must remain operationally equivalent under K_period4.',
);
assert.notEqual(
  R_AB_S0.receipt_variant,
  R_AB_DUP_S0.receipt_variant,
  'The non-singleton period-four fiber must remain receipt-distinct rather than vacuously singleton.',
);

assert.equal(result.direct_and_iterated_agree, true);
assert.equal(result.composition_checks.length, recurrence.histories.length * 3);
for (const check of result.composition_checks) {
  assert.equal(check.equal, true, `${check.direct_operation_id} must agree with ${check.ticks} iterated PSI_TICK operations for ${check.history_id}.`);
}

const afterTwo = stepPsiTwoTicks(R_AB_S0);
assert.deepEqual(afterTwo.endpoint, [[3, 2], [1, 5]]);
assert.equal(afterTwo.clock_phase, 'P0');
assert.equal(afterTwo.forcing_season, 'S2');
assert.equal(result.recurrence_controls.two_tick.clock_phase_recurs, true);
assert.equal(result.recurrence_controls.two_tick.forcing_season_recurs, false);
assert.equal(result.recurrence_controls.two_tick.endpoint_recurs, false);
assert.equal(result.recurrence_controls.two_tick.full_period4_state_recurs, false);
assert.equal(result.recurrence_controls.two_tick.classification, 'CLOCK_RECURRENCE_WITHOUT_FORCING_RECURRENCE');

const afterFour = stepPsiFourTicks(R_AB_S0);
assert.deepEqual(afterFour.endpoint, [[3, 4], [1, 7]]);
assert.equal(afterFour.clock_phase, 'P0');
assert.equal(afterFour.forcing_season, 'S0');
assert.equal(result.recurrence_controls.four_tick.clock_phase_recurs, true);
assert.equal(result.recurrence_controls.four_tick.forcing_season_recurs, true);
assert.equal(result.recurrence_controls.four_tick.endpoint_recurs, false);
assert.equal(result.recurrence_controls.four_tick.full_period4_state_recurs, false);
assert.equal(result.recurrence_controls.four_tick.classification, 'FORCING_RECURRENCE_WITHOUT_ENDPOINT_RECURRENCE');

assert.equal(result.abstention_controls.undeclared_last_action.status, 'UNDECLARED_LAST_ACTION_ABSTAINS');
assert.equal(result.abstention_controls.undeclared_last_action.disposition, 'ABSTAIN_BEFORE_PERIOD_FOUR_EVOLUTION');
assert.equal(result.abstention_controls.undeclared_forcing_season.status, 'UNDECLARED_FORCING_SEASON_ABSTAINS');
assert.equal(result.abstention_controls.undeclared_forcing_season.disposition, 'ABSTAIN_BEFORE_PERIOD_FOUR_EVOLUTION');

assert.equal(result.parent_custody_unchanged, true, 'Derived recurrence experiments may not mutate the #714 parent witness.');
assert.match(result.bounded_claim, /^IN_THE_AUTHORED_FINITE_PERIOD_MISMATCH_FIXTURE_/);
assert.equal(result.claim_ceiling.path_object_or_category, false);
assert.equal(result.claim_ceiling.transport_or_connection, false);
assert.equal(result.claim_ceiling.loop_endomorphism_or_holonomy, false);
assert.equal(result.claim_ceiling.curvature, false);
assert.equal(result.claim_ceiling.proto_loom, false);
assert.equal(result.claim_ceiling.production, false);
assert.equal(result.claim_ceiling.vercel, false);
assert.equal(
  result.stop,
  'HUMAN_𝄐_REQUIRED_BEFORE_PROMOTING_ANY_TEMPORALLY_AUGMENTED_QUOTIENT_TO_A_FIRST_BOUNDED_PATH_OBJECT_OR_PATH_GRAMMAR',
);

console.log('Ash A15-R0 Aperture × Pedagogue temporal recurrence / phase-aliasing tests passed.');
