import {
  deriveTemporalHistoryUniverse,
  evaluateRepresentativeIndependence,
  runExogenousEvolutionCongruenceGauntlet,
  temporalCandidateAbstractions,
} from './aperture-pedagogue-exogenous-evolution-congruence.js';

export const TEMPORAL_RECURRENCE_PHASE_ALIASING_SCHEMA = 'td613.a15-r0.aperture-pedagogue-temporal-recurrence-phase-aliasing/v0.1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const keyOf = (value) => JSON.stringify(value);
const trace2 = (M) => M[0][0] + M[1][1];
const add2 = (A, B) => freeze([
  freeze([A[0][0] + B[0][0], A[0][1] + B[0][1]]),
  freeze([A[1][0] + B[1][0], A[1][1] + B[1][1]]),
]);

const FORCING_SEASONS = freeze(['S0', 'S1', 'S2', 'S3']);
const NEXT_SEASON = freeze({ S0: 'S1', S1: 'S2', S2: 'S3', S3: 'S0' });
const CLOCK_BY_SEASON = freeze({ S0: 'P0', S1: 'P1', S2: 'P0', S3: 'P1' });

const FORCING_DELTAS = freeze({
  S0: freeze({
    A: freeze([[1, 0], [0, 0]]),
    B: freeze([[0, 1], [0, 0]]),
    Q_PHASE_PULSE: freeze([[1, 1], [0, 0]]),
  }),
  S1: freeze({
    A: freeze([[0, 0], [1, 0]]),
    B: freeze([[0, 0], [0, 1]]),
    Q_PHASE_PULSE: freeze([[0, 0], [1, 1]]),
  }),
  S2: freeze({
    A: freeze([[2, 0], [0, 0]]),
    B: freeze([[0, 2], [0, 0]]),
    Q_PHASE_PULSE: freeze([[2, 2], [0, 0]]),
  }),
  S3: freeze({
    A: freeze([[0, 0], [2, 0]]),
    B: freeze([[0, 0], [0, 2]]),
    Q_PHASE_PULSE: freeze([[0, 0], [2, 2]]),
  }),
});

const lastActionAbstain = (history, operationId) => freeze({
  status: 'UNDECLARED_LAST_ACTION_ABSTAINS',
  disposition: 'ABSTAIN_BEFORE_PERIOD_FOUR_EVOLUTION',
  history_id: history?.id ?? null,
  operation_id: operationId,
  last_action: history?.last_action ?? null,
  forcing_season: history?.forcing_season ?? null,
});

const forcingSeasonAbstain = (history, operationId) => freeze({
  status: 'UNDECLARED_FORCING_SEASON_ABSTAINS',
  disposition: 'ABSTAIN_BEFORE_PERIOD_FOUR_EVOLUTION',
  history_id: history?.id ?? null,
  operation_id: operationId,
  last_action: history?.last_action ?? null,
  forcing_season: history?.forcing_season ?? null,
});

function forcingDelta(history) {
  const table = FORCING_DELTAS[history.forcing_season];
  if (!table) return { kind: 'season', delta: null };
  const delta = table[history.last_action] ?? null;
  if (!delta) return { kind: 'last_action', delta: null };
  return { kind: 'ok', delta };
}

function appendForcingEvolution(history, {
  operationId,
  endpoint,
  forcingSeason,
  ticks,
  consumed,
}) {
  return freeze({
    ...history,
    id: `${history.id}::${operationId}`,
    recurrence_parent_history_id: history.id,
    endpoint,
    forcing_season: forcingSeason,
    clock_phase: CLOCK_BY_SEASON[forcingSeason],
    forcing_evolution_events: freeze([
      ...(history.forcing_evolution_events ?? []),
      freeze({
        evolution_id: operationId,
        ticks,
        scalar_response: trace2(endpoint),
        consumed: freeze(clone(consumed)),
      }),
    ]),
  });
}

export function deriveRecurrenceHistoryUniverse(parentResult = runExogenousEvolutionCongruenceGauntlet()) {
  if (!parentResult?.passed) {
    return freeze({
      status: 'PARENT_EXOGENOUS_EVOLUTION_CONGRUENCE_NOT_WITNESSED_BY_EXECUTABLE',
      disposition: 'ABSTAIN_BEFORE_RECURRENCE_HISTORY_LIFT',
    });
  }

  const temporal = deriveTemporalHistoryUniverse();
  if (temporal.status !== 'TEMPORAL_HISTORY_UNIVERSE_DERIVED_FROM_PARENT_CUSTODY') {
    return freeze({
      status: 'PARENT_TEMPORAL_HISTORY_UNIVERSE_NOT_DERIVABLE',
      disposition: 'ABSTAIN_BEFORE_RECURRENCE_HISTORY_LIFT',
    });
  }

  const byId = new Map(temporal.histories.map((history) => [history.id, history]));
  const T_AB_P0 = byId.get('T_AB_P0');
  const T_AB_DUP_P0 = byId.get('T_AB_DUP_P0');
  const T_AB_P1 = byId.get('T_AB_P1');
  const T_BA_P0 = byId.get('T_BA_P0');

  if (!T_AB_P0 || !T_AB_DUP_P0 || !T_AB_P1 || !T_BA_P0) {
    return freeze({
      status: 'REQUIRED_PARENT_TEMPORAL_HISTORIES_MISSING',
      disposition: 'ABSTAIN_BEFORE_RECURRENCE_HISTORY_LIFT',
    });
  }

  const lift = (id, history, forcingSeason) => freeze({
    ...history,
    id,
    recurrence_source_history_id: history.id,
    forcing_season: forcingSeason,
    clock_phase: CLOCK_BY_SEASON[forcingSeason],
    forcing_evolution_events: freeze([]),
  });

  return freeze({
    status: 'RECURRENCE_HISTORY_UNIVERSE_DERIVED_FROM_PARENT_TEMPORAL_CUSTODY',
    forcing_seasons: FORCING_SEASONS,
    clock_by_season: CLOCK_BY_SEASON,
    histories: freeze([
      lift('R_AB_S0', T_AB_P0, 'S0'),
      lift('R_AB_DUP_S0', T_AB_DUP_P0, 'S0'),
      lift('R_AB_S1', T_AB_P1, 'S1'),
      lift('R_AB_S2', T_AB_P0, 'S2'),
      lift('R_AB_S3', T_AB_P1, 'S3'),
      lift('R_BA_S0', T_BA_P0, 'S0'),
    ]),
  });
}

export const recurrenceCandidateAbstractions = freeze({
  K_temporal: (history) => temporalCandidateAbstractions.K_temporal(history),
  K_period4: (history) => freeze({
    ...temporalCandidateAbstractions.K_temporal(history),
    forcing_season: history.forcing_season,
  }),
});

export function stepPsiTick(history) {
  const resolved = forcingDelta(history);
  if (resolved.kind === 'season') return forcingSeasonAbstain(history, 'PSI_TICK');
  if (resolved.kind === 'last_action') return lastActionAbstain(history, 'PSI_TICK');

  const nextSeason = NEXT_SEASON[history.forcing_season];
  if (!nextSeason) return forcingSeasonAbstain(history, 'PSI_TICK');

  const endpoint = add2(history.endpoint, resolved.delta);
  return appendForcingEvolution(history, {
    operationId: 'PSI_TICK',
    endpoint,
    forcingSeason: nextSeason,
    ticks: 1,
    consumed: {
      forcing_season: history.forcing_season,
      clock_phase_projection: history.clock_phase,
      last_action: history.last_action,
      delta: resolved.delta,
    },
  });
}

function stepPsiDirect(history, ticks, operationId) {
  let endpoint = history.endpoint;
  let forcingSeason = history.forcing_season;
  const consumedSteps = [];

  for (let index = 0; index < ticks; index += 1) {
    const table = FORCING_DELTAS[forcingSeason];
    if (!table) return forcingSeasonAbstain(history, operationId);
    const delta = table[history.last_action] ?? null;
    if (!delta) return lastActionAbstain(history, operationId);
    const nextSeason = NEXT_SEASON[forcingSeason];
    if (!nextSeason) return forcingSeasonAbstain(history, operationId);

    consumedSteps.push(freeze({
      step: index + 1,
      forcing_season: forcingSeason,
      clock_phase_projection: CLOCK_BY_SEASON[forcingSeason],
      last_action: history.last_action,
      delta: clone(delta),
    }));
    endpoint = add2(endpoint, delta);
    forcingSeason = nextSeason;
  }

  return appendForcingEvolution(history, {
    operationId,
    endpoint,
    forcingSeason,
    ticks,
    consumed: { steps: freeze(consumedSteps) },
  });
}

export const stepPsiTwoTicks = (history) => stepPsiDirect(history, 2, 'PSI_TWO_TICKS');
export const stepPsiThreeTicks = (history) => stepPsiDirect(history, 3, 'PSI_THREE_TICKS');
export const stepPsiFourTicks = (history) => stepPsiDirect(history, 4, 'PSI_FOUR_TICKS');

function iteratePsiTick(history, ticks) {
  let current = history;
  for (let index = 0; index < ticks; index += 1) {
    current = stepPsiTick(current);
    if (current?.status) return current;
  }
  return current;
}

function sameMatrix(A, B) {
  return keyOf(A) === keyOf(B);
}

export function runTemporalRecurrencePhaseAliasingGauntlet() {
  const parent = runExogenousEvolutionCongruenceGauntlet();
  if (!parent?.passed) {
    return freeze({
      schema: TEMPORAL_RECURRENCE_PHASE_ALIASING_SCHEMA,
      passed: false,
      status: 'PARENT_EXOGENOUS_EVOLUTION_CONGRUENCE_NOT_WITNESSED_BY_EXECUTABLE',
      disposition: 'ABSTAIN_BEFORE_TEMPORAL_RECURRENCE_CLAIMS',
    });
  }

  const parentSnapshotBefore = JSON.stringify(parent);
  const recurrence = deriveRecurrenceHistoryUniverse(parent);
  const histories = recurrence.histories;
  const byId = new Map(histories.map((history) => [history.id, history]));
  const R_AB_S0 = byId.get('R_AB_S0');
  const R_AB_DUP_S0 = byId.get('R_AB_DUP_S0');
  const R_AB_S2 = byId.get('R_AB_S2');

  const operations = freeze([
    freeze({ id: 'PSI_TICK', ticks: 1, fn: stepPsiTick }),
    freeze({ id: 'PSI_TWO_TICKS', ticks: 2, fn: stepPsiTwoTicks }),
    freeze({ id: 'PSI_THREE_TICKS', ticks: 3, fn: stepPsiThreeTicks }),
    freeze({ id: 'PSI_FOUR_TICKS', ticks: 4, fn: stepPsiFourTicks }),
  ]);

  const temporalEvaluations = freeze(operations.map((operation) => evaluateRepresentativeIndependence(
    histories,
    recurrenceCandidateAbstractions.K_temporal,
    operation.fn,
    operation.id,
  )));

  const period4Evaluations = freeze(operations.map((operation) => evaluateRepresentativeIndependence(
    histories,
    recurrenceCandidateAbstractions.K_period4,
    operation.fn,
    operation.id,
  )));

  const hostileInitialEqual = keyOf(recurrenceCandidateAbstractions.K_temporal(R_AB_S0))
    === keyOf(recurrenceCandidateAbstractions.K_temporal(R_AB_S2));
  const hostileSuccessorEqual = keyOf(recurrenceCandidateAbstractions.K_temporal(stepPsiTick(R_AB_S0)))
    === keyOf(recurrenceCandidateAbstractions.K_temporal(stepPsiTick(R_AB_S2)));

  const period4OneTick = period4Evaluations.find((row) => row.operation_id === 'PSI_TICK');
  const duplicatePeriod4Fiber = period4OneTick.non_singleton_fibers.find((fiber) => (
    fiber.member_ids.length === 2
    && fiber.member_ids.includes('R_AB_S0')
    && fiber.member_ids.includes('R_AB_DUP_S0')
  ));

  const directByTicks = new Map(operations.filter((operation) => operation.ticks > 1).map((operation) => [operation.ticks, operation]));
  const compositionChecks = freeze(histories.flatMap((history) => [2, 3, 4].map((ticks) => {
    const directOperation = directByTicks.get(ticks);
    const direct = directOperation.fn(history);
    const iterated = iteratePsiTick(history, ticks);
    const directState = recurrenceCandidateAbstractions.K_period4(direct);
    const iteratedState = recurrenceCandidateAbstractions.K_period4(iterated);
    return freeze({
      history_id: history.id,
      ticks,
      direct_operation_id: directOperation.id,
      direct_state: directState,
      iterated_state: iteratedState,
      equal: keyOf(directState) === keyOf(iteratedState),
    });
  })));

  const afterTwo = stepPsiTwoTicks(R_AB_S0);
  const afterFour = stepPsiFourTicks(R_AB_S0);
  const twoTickRecurrenceControl = freeze({
    source_history_id: R_AB_S0.id,
    source_clock_phase: R_AB_S0.clock_phase,
    successor_clock_phase: afterTwo.clock_phase,
    source_forcing_season: R_AB_S0.forcing_season,
    successor_forcing_season: afterTwo.forcing_season,
    clock_phase_recurs: R_AB_S0.clock_phase === afterTwo.clock_phase,
    forcing_season_recurs: R_AB_S0.forcing_season === afterTwo.forcing_season,
    endpoint_recurs: sameMatrix(R_AB_S0.endpoint, afterTwo.endpoint),
    full_period4_state_recurs: keyOf(recurrenceCandidateAbstractions.K_period4(R_AB_S0))
      === keyOf(recurrenceCandidateAbstractions.K_period4(afterTwo)),
    classification: 'CLOCK_RECURRENCE_WITHOUT_FORCING_RECURRENCE',
  });

  const fourTickRecurrenceControl = freeze({
    source_history_id: R_AB_S0.id,
    source_clock_phase: R_AB_S0.clock_phase,
    successor_clock_phase: afterFour.clock_phase,
    source_forcing_season: R_AB_S0.forcing_season,
    successor_forcing_season: afterFour.forcing_season,
    clock_phase_recurs: R_AB_S0.clock_phase === afterFour.clock_phase,
    forcing_season_recurs: R_AB_S0.forcing_season === afterFour.forcing_season,
    endpoint_recurs: sameMatrix(R_AB_S0.endpoint, afterFour.endpoint),
    full_period4_state_recurs: keyOf(recurrenceCandidateAbstractions.K_period4(R_AB_S0))
      === keyOf(recurrenceCandidateAbstractions.K_period4(afterFour)),
    classification: 'FORCING_RECURRENCE_WITHOUT_ENDPOINT_RECURRENCE',
  });

  const unsupportedLastAction = stepPsiTick(freeze({
    ...R_AB_S0,
    id: 'R_AB_UNDECLARED_LAST_ACTION',
    last_action: 'UNDECLARED_ACTION',
  }));

  const unsupportedForcingSeason = stepPsiTick(freeze({
    ...R_AB_S0,
    id: 'R_AB_UNDECLARED_FORCING_SEASON',
    forcing_season: 'SX',
    clock_phase: 'PX',
  }));

  const parentSnapshotAfter = JSON.stringify(runExogenousEvolutionCongruenceGauntlet());
  const parentCustodyUnchanged = parentSnapshotBefore === parentSnapshotAfter;

  const period4RepresentativeIndependent = period4Evaluations.every((row) => row.representative_independent);
  const temporalOneTick = temporalEvaluations.find((row) => row.operation_id === 'PSI_TICK');
  const directAndIteratedAgree = compositionChecks.every((row) => row.equal);
  const twoTickControlPasses = (
    twoTickRecurrenceControl.clock_phase_recurs
    && !twoTickRecurrenceControl.forcing_season_recurs
    && !twoTickRecurrenceControl.endpoint_recurs
    && !twoTickRecurrenceControl.full_period4_state_recurs
  );
  const fourTickControlPasses = (
    fourTickRecurrenceControl.clock_phase_recurs
    && fourTickRecurrenceControl.forcing_season_recurs
    && !fourTickRecurrenceControl.endpoint_recurs
    && !fourTickRecurrenceControl.full_period4_state_recurs
  );

  const passed = Boolean(
    hostileInitialEqual
    && !hostileSuccessorEqual
    && temporalOneTick
    && !temporalOneTick.representative_independent
    && period4RepresentativeIndependent
    && duplicatePeriod4Fiber
    && directAndIteratedAgree
    && twoTickControlPasses
    && fourTickControlPasses
    && unsupportedLastAction.status === 'UNDECLARED_LAST_ACTION_ABSTAINS'
    && unsupportedLastAction.disposition === 'ABSTAIN_BEFORE_PERIOD_FOUR_EVOLUTION'
    && unsupportedForcingSeason.status === 'UNDECLARED_FORCING_SEASON_ABSTAINS'
    && unsupportedForcingSeason.disposition === 'ABSTAIN_BEFORE_PERIOD_FOUR_EVOLUTION'
    && parentCustodyUnchanged
  );

  return freeze({
    schema: TEMPORAL_RECURRENCE_PHASE_ALIASING_SCHEMA,
    passed,
    status: passed
      ? 'TEMPORAL_RECURRENCE_PHASE_ALIASING_ROUND_CLOSED'
      : 'TEMPORAL_RECURRENCE_PHASE_ALIASING_GAUNTLET_FAILED',
    canonical_classification: passed
      ? 'FINITE_PERIOD_TWO_PHASE_ALIASES_PERIOD_FOUR_FORCING_AND_PERIOD_FOUR_AUGMENTATION_RESTORES_DECLARED_EXOGENOUS_CONGRUENCE'
      : null,
    recurrence_history_universe: recurrence,
    hostile: freeze({
      source_member_ids: freeze(['R_AB_S0', 'R_AB_S2']),
      initial_K_temporal_equal: hostileInitialEqual,
      successor_K_temporal_equal: hostileSuccessorEqual,
      classification: hostileInitialEqual && !hostileSuccessorEqual
        ? 'PERIOD_TWO_CONTROL_PHASE_ALIASES_PERIOD_FOUR_EXOGENOUS_SCHEDULE'
        : 'PHASE_ALIAS_HOSTILE_NOT_WITNESSED',
      source_S0: recurrenceCandidateAbstractions.K_temporal(R_AB_S0),
      source_S2: recurrenceCandidateAbstractions.K_temporal(R_AB_S2),
      successor_S0: recurrenceCandidateAbstractions.K_temporal(stepPsiTick(R_AB_S0)),
      successor_S2: recurrenceCandidateAbstractions.K_temporal(stepPsiTick(R_AB_S2)),
    }),
    temporal_candidate_evaluations: temporalEvaluations,
    period4_candidate_evaluations: period4Evaluations,
    non_vacuous_period4_fiber: duplicatePeriod4Fiber ?? null,
    composition_checks: compositionChecks,
    direct_and_iterated_agree: directAndIteratedAgree,
    recurrence_controls: freeze({
      two_tick: twoTickRecurrenceControl,
      four_tick: fourTickRecurrenceControl,
    }),
    abstention_controls: freeze({
      undeclared_last_action: unsupportedLastAction,
      undeclared_forcing_season: unsupportedForcingSeason,
    }),
    parent_custody_unchanged: parentCustodyUnchanged,
    bounded_claim: passed
      ? 'IN_THE_AUTHORED_FINITE_PERIOD_MISMATCH_FIXTURE_THE_PREVIOUS_PERIOD_TWO_CLOCK_PHASE_CAN_COLLAPSE_EQUAL_VISIBLE_TEMPORAL_STATES_WHOSE_DECLARED_PERIOD_FOUR_FORCING_POSITIONS_REQUIRE_DIFFERENT_NO_QUESTION_SUCCESSORS_WHILE_A_FORCING_SEASON_AUGMENTED_NONTRIVIAL_QUOTIENT_REMAINS_REPRESENTATIVE_INDEPENDENT_UNDER_ONE_THROUGH_FOUR_TICK_EVOLUTION_DIRECT_MULTI_TICK_EVOLUTION_MATCHES_ITERATED_ONE_TICK_EVOLUTION_AND_RECURRENCE_OF_CLOCK_OR_FORCING_LABELS_DOES_NOT_IMPLY_ENDPOINT_OR_FULL_STATE_RECURRENCE'
      : null,
    claim_ceiling: freeze({
      generic_minimality_or_optimality: false,
      generic_time_augmentation_theorem: false,
      hidden_state_identification_general: false,
      markov_state_theorem: false,
      stationarity_or_ergodicity: false,
      periodic_process_theorem: false,
      semigroup_flow_generator: false,
      lie_bracket_or_bch: false,
      path_object_or_category: false,
      groupoid_or_invertibility: false,
      transport_or_connection: false,
      loop_endomorphism_or_holonomy: false,
      curvature: false,
      berry_or_quantum: false,
      proto_loom: false,
      a16: false,
      live_ash: false,
      merge: false,
      production: false,
      vercel: false,
    }),
    stop: passed
      ? 'HUMAN_𝄐_REQUIRED_BEFORE_PROMOTING_ANY_TEMPORALLY_AUGMENTED_QUOTIENT_TO_A_FIRST_BOUNDED_PATH_OBJECT_OR_PATH_GRAMMAR'
      : 'REPAIR_WITHIN_PREREGISTERED_TEMPORAL_RECURRENCE_SCOPE_ONLY',
  });
}

export const TEMPORAL_RECURRENCE_PHASE_ALIASING_EXPERIMENT = freeze({
  schema: TEMPORAL_RECURRENCE_PHASE_ALIASING_SCHEMA,
  run: runTemporalRecurrencePhaseAliasingGauntlet,
});
