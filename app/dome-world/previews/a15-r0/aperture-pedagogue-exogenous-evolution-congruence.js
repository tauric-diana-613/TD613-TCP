import {
  deriveCompositionalHistoryUniverse,
  runCompositionalReplayClosureGauntlet,
} from './aperture-pedagogue-compositional-replay-closure.js';

export const EXOGENOUS_EVOLUTION_CONGRUENCE_SCHEMA = 'td613.a15-r0.aperture-pedagogue-exogenous-evolution-congruence/v0.1';

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

const PHASES = freeze(['P0', 'P1']);
const flipPhase = (phase) => phase === 'P0' ? 'P1' : phase === 'P1' ? 'P0' : null;

const TIME_DELTAS = freeze({
  P0: freeze({
    A: freeze([[1, 0], [0, 0]]),
    B: freeze([[0, 1], [0, 0]]),
    Q_PHASE_PULSE: freeze([[1, 1], [0, 0]]),
  }),
  P1: freeze({
    A: freeze([[0, 0], [1, 0]]),
    B: freeze([[0, 0], [0, 1]]),
    Q_PHASE_PULSE: freeze([[0, 0], [1, 1]]),
  }),
});

const QUESTION_DELTAS = freeze({
  P0: freeze([[0, 0], [0, 1]]),
  P1: freeze([[1, 0], [0, 0]]),
});

const abstain = (history, operationId) => freeze({
  status: 'UNDECLARED_LAST_ACTION_ABSTAINS',
  disposition: 'ABSTAIN_BEFORE_EXOGENOUS_EVOLUTION',
  history_id: history?.id ?? null,
  operation_id: operationId,
  last_action: history?.last_action ?? null,
});

function timeDelta(history) {
  const table = TIME_DELTAS[history.clock_phase];
  if (!table) return null;
  return table[history.last_action] ?? null;
}

function appendEvolution(history, {
  id,
  endpoint,
  clockPhase,
  ticks,
  consumed,
}) {
  return freeze({
    ...history,
    id: `${history.id}::${id}`,
    temporal_parent_history_id: history.id,
    endpoint,
    clock_phase: clockPhase,
    evolution_events: freeze([
      ...(history.evolution_events ?? []),
      freeze({
        evolution_id: id,
        ticks,
        scalar_response: trace2(endpoint),
        consumed: freeze(clone(consumed)),
      }),
    ]),
  });
}

export function deriveTemporalHistoryUniverse(parentResult = runCompositionalReplayClosureGauntlet()) {
  if (!parentResult?.passed) {
    return freeze({
      status: 'PARENT_COMPOSITIONAL_REPLAY_CLOSURE_NOT_WITNESSED_BY_EXECUTABLE',
      disposition: 'ABSTAIN_BEFORE_TEMPORAL_HISTORY_LIFT',
    });
  }

  const derived = deriveCompositionalHistoryUniverse();
  if (derived.status !== 'COMPOSITIONAL_HISTORY_UNIVERSE_DERIVED_FROM_PARENT_CUSTODY') {
    return freeze({
      status: 'PARENT_HISTORY_UNIVERSE_NOT_DERIVABLE',
      disposition: 'ABSTAIN_BEFORE_TEMPORAL_HISTORY_LIFT',
    });
  }

  const byId = new Map(derived.histories.map((history) => [history.id, history]));
  const H_AB = byId.get('H_AB');
  const H_AB_DUP = byId.get('H_AB_DUP');
  const H_BA = byId.get('H_BA');

  if (!H_AB || !H_AB_DUP || !H_BA) {
    return freeze({
      status: 'REQUIRED_PARENT_HISTORIES_MISSING',
      disposition: 'ABSTAIN_BEFORE_TEMPORAL_HISTORY_LIFT',
    });
  }

  const lift = (id, history, clockPhase) => freeze({
    ...history,
    id,
    temporal_source_history_id: history.id,
    clock_phase: clockPhase,
    evolution_events: freeze([]),
  });

  return freeze({
    status: 'TEMPORAL_HISTORY_UNIVERSE_DERIVED_FROM_PARENT_CUSTODY',
    phases: PHASES,
    histories: freeze([
      lift('T_AB_P0', H_AB, 'P0'),
      lift('T_AB_DUP_P0', H_AB_DUP, 'P0'),
      lift('T_AB_P1', H_AB, 'P1'),
      lift('T_BA_P0', H_BA, 'P0'),
    ]),
  });
}

export const temporalCandidateAbstractions = freeze({
  K_operational: (history) => freeze({
    endpoint: freeze(clone(history.endpoint)),
    last_action: history.last_action,
    operational_lineage: freeze([...history.operational_lineage]),
  }),
  K_temporal: (history) => freeze({
    endpoint: freeze(clone(history.endpoint)),
    last_action: history.last_action,
    operational_lineage: freeze([...history.operational_lineage]),
    clock_phase: history.clock_phase,
  }),
});

export function stepPhiTick(history) {
  const delta = timeDelta(history);
  const nextPhase = flipPhase(history.clock_phase);
  if (!delta || !nextPhase) return abstain(history, 'PHI_TICK');

  const endpoint = add2(history.endpoint, delta);
  return appendEvolution(history, {
    id: 'PHI_TICK',
    endpoint,
    clockPhase: nextPhase,
    ticks: 1,
    consumed: {
      clock_phase: history.clock_phase,
      last_action: history.last_action,
      delta,
    },
  });
}

export function stepPhiTwoTicks(history) {
  const firstDelta = timeDelta(history);
  const middlePhase = flipPhase(history.clock_phase);
  if (!firstDelta || !middlePhase) return abstain(history, 'PHI_TWO_TICKS');

  const secondDelta = TIME_DELTAS[middlePhase]?.[history.last_action] ?? null;
  const finalPhase = flipPhase(middlePhase);
  if (!secondDelta || !finalPhase) return abstain(history, 'PHI_TWO_TICKS');

  const endpoint = add2(add2(history.endpoint, firstDelta), secondDelta);
  return appendEvolution(history, {
    id: 'PHI_TWO_TICKS',
    endpoint,
    clockPhase: finalPhase,
    ticks: 2,
    consumed: {
      initial_clock_phase: history.clock_phase,
      middle_clock_phase: middlePhase,
      last_action: history.last_action,
      first_delta: firstDelta,
      second_delta: secondDelta,
    },
  });
}

export function stepQuestionPhasePulse(history) {
  const delta = QUESTION_DELTAS[history.clock_phase] ?? null;
  if (!delta) {
    return freeze({
      status: 'UNDECLARED_CLOCK_PHASE_ABSTAINS',
      disposition: 'ABSTAIN_BEFORE_QUESTION_PHASE_PULSE',
      history_id: history?.id ?? null,
      clock_phase: history?.clock_phase ?? null,
    });
  }

  const endpoint = add2(history.endpoint, delta);
  return freeze({
    ...history,
    id: `${history.id}::Q_PHASE_PULSE`,
    temporal_parent_history_id: history.id,
    endpoint,
    last_action: 'Q_PHASE_PULSE',
    operational_lineage: freeze([...history.operational_lineage, 'Q_PHASE_PULSE']),
    custody_events: freeze([
      ...history.custody_events,
      freeze({
        action_id: 'Q_PHASE_PULSE',
        scalar_response: trace2(endpoint),
        consumed: freeze({ clock_phase: history.clock_phase, delta: clone(delta) }),
      }),
    ]),
  });
}

const qAfterPhi = (history) => {
  const evolved = stepPhiTick(history);
  if (evolved?.status) return evolved;
  return stepQuestionPhasePulse(evolved);
};

const phiAfterQ = (history) => {
  const questioned = stepQuestionPhasePulse(history);
  if (questioned?.status) return questioned;
  return stepPhiTick(questioned);
};

const phiTickTwice = (history) => {
  const first = stepPhiTick(history);
  if (first?.status) return first;
  return stepPhiTick(first);
};

function finiteFibers(histories, projection) {
  const map = new Map();
  for (const history of histories) {
    const state = projection(history);
    const stateKey = keyOf(state);
    if (!map.has(stateKey)) map.set(stateKey, { state, members: [] });
    map.get(stateKey).members.push(history);
  }
  return freeze([...map.values()].map(({ state, members }) => freeze({
    state,
    member_ids: freeze(members.map((member) => member.id)),
    members: freeze([...members]),
  })));
}

export function evaluateRepresentativeIndependence(histories, projection, operation, operationId) {
  const fibers = finiteFibers(histories, projection);
  const rows = [];
  const violations = [];

  for (const fiber of fibers) {
    const successors = fiber.members.map((history) => operation(history));
    const abstentions = successors.filter((successor) => successor?.status);
    if (abstentions.length > 0) {
      violations.push(freeze({
        source_state: fiber.state,
        source_member_ids: fiber.member_ids,
        operation_id: operationId,
        classification: 'DECLARED_OPERATION_ABSTAINED',
        abstentions: freeze(abstentions),
      }));
      rows.push(freeze({
        source_state: fiber.state,
        source_member_ids: fiber.member_ids,
        operation_id: operationId,
        representative_independent: false,
        successor_state: null,
      }));
      continue;
    }

    const successorStates = successors.map((successor) => projection(successor));
    const variants = new Map();
    successorStates.forEach((state, index) => {
      const stateKey = keyOf(state);
      if (!variants.has(stateKey)) variants.set(stateKey, []);
      variants.get(stateKey).push(fiber.members[index].id);
    });

    const representativeIndependent = variants.size === 1;
    rows.push(freeze({
      source_state: fiber.state,
      source_member_ids: fiber.member_ids,
      operation_id: operationId,
      representative_independent: representativeIndependent,
      successor_state: representativeIndependent ? successorStates[0] : null,
      successor_variants: freeze([...variants.entries()].map(([stateKey, memberIds]) => freeze({
        state_key: stateKey,
        member_ids: freeze([...memberIds]),
      }))),
    }));

    if (!representativeIndependent) {
      violations.push(freeze({
        source_state: fiber.state,
        source_member_ids: fiber.member_ids,
        operation_id: operationId,
        classification: 'REPRESENTATIVE_INDEPENDENCE_VIOLATION',
        successor_variants: freeze([...variants.entries()].map(([stateKey, memberIds]) => freeze({
          state_key: stateKey,
          member_ids: freeze([...memberIds]),
        }))),
      }));
    }
  }

  return freeze({
    operation_id: operationId,
    fibers,
    non_singleton_fibers: freeze(fibers.filter((fiber) => fiber.member_ids.length > 1)),
    rows: freeze(rows),
    violations: freeze(violations),
    representative_independent: violations.length === 0,
  });
}

export function runExogenousEvolutionCongruenceGauntlet() {
  const parent = runCompositionalReplayClosureGauntlet();
  if (!parent?.passed) {
    return freeze({
      schema: EXOGENOUS_EVOLUTION_CONGRUENCE_SCHEMA,
      passed: false,
      status: 'PARENT_COMPOSITIONAL_REPLAY_CLOSURE_NOT_WITNESSED_BY_EXECUTABLE',
      disposition: 'ABSTAIN_BEFORE_EXOGENOUS_EVOLUTION_CLAIMS',
    });
  }

  const parentSnapshotBefore = JSON.stringify(parent);
  const temporal = deriveTemporalHistoryUniverse(parent);
  const histories = temporal.histories;
  const byId = new Map(histories.map((history) => [history.id, history]));
  const T_AB_P0 = byId.get('T_AB_P0');
  const T_AB_DUP_P0 = byId.get('T_AB_DUP_P0');
  const T_AB_P1 = byId.get('T_AB_P1');

  const operationalPhi = evaluateRepresentativeIndependence(
    histories,
    temporalCandidateAbstractions.K_operational,
    stepPhiTick,
    'PHI_TICK',
  );
  const temporalPhi = evaluateRepresentativeIndependence(
    histories,
    temporalCandidateAbstractions.K_temporal,
    stepPhiTick,
    'PHI_TICK',
  );
  const temporalPhi2 = evaluateRepresentativeIndependence(
    histories,
    temporalCandidateAbstractions.K_temporal,
    stepPhiTwoTicks,
    'PHI_TWO_TICKS',
  );
  const temporalQ = evaluateRepresentativeIndependence(
    histories,
    temporalCandidateAbstractions.K_temporal,
    stepQuestionPhasePulse,
    'Q_PHASE_PULSE',
  );
  const temporalQAfterPhi = evaluateRepresentativeIndependence(
    histories,
    temporalCandidateAbstractions.K_temporal,
    qAfterPhi,
    'Q_AFTER_PHI',
  );
  const temporalPhiAfterQ = evaluateRepresentativeIndependence(
    histories,
    temporalCandidateAbstractions.K_temporal,
    phiAfterQ,
    'PHI_AFTER_Q',
  );

  const phaseErasureInitialEqual = keyOf(temporalCandidateAbstractions.K_operational(T_AB_P0))
    === keyOf(temporalCandidateAbstractions.K_operational(T_AB_P1));
  const phaseErasureSuccessorEqual = keyOf(temporalCandidateAbstractions.K_operational(stepPhiTick(T_AB_P0)))
    === keyOf(temporalCandidateAbstractions.K_operational(stepPhiTick(T_AB_P1)));

  const duplicateTemporalFiber = temporalPhi.non_singleton_fibers.find((fiber) => (
    fiber.member_ids.length === 2
    && fiber.member_ids.includes('T_AB_P0')
    && fiber.member_ids.includes('T_AB_DUP_P0')
  ));

  const twoTickChecks = histories.map((history) => {
    const direct = stepPhiTwoTicks(history);
    const iterated = phiTickTwice(history);
    return freeze({
      history_id: history.id,
      direct_state: temporalCandidateAbstractions.K_temporal(direct),
      iterated_state: temporalCandidateAbstractions.K_temporal(iterated),
      equal: keyOf(temporalCandidateAbstractions.K_temporal(direct))
        === keyOf(temporalCandidateAbstractions.K_temporal(iterated)),
    });
  });

  const orderChecks = histories.map((history) => {
    const qPhi = qAfterPhi(history);
    const phiQ = phiAfterQ(history);
    return freeze({
      history_id: history.id,
      q_after_phi_state: temporalCandidateAbstractions.K_temporal(qPhi),
      phi_after_q_state: temporalCandidateAbstractions.K_temporal(phiQ),
      equal: keyOf(temporalCandidateAbstractions.K_temporal(qPhi))
        === keyOf(temporalCandidateAbstractions.K_temporal(phiQ)),
    });
  });

  const unsupported = stepPhiTick(freeze({
    ...T_AB_P0,
    id: 'T_AB_UNDECLARED_LAST_ACTION',
    last_action: 'UNDECLARED_ACTION',
  }));

  const parentSnapshotAfter = JSON.stringify(parent);

  const claimCeiling = freeze({
    generic_time_augmentation_theorem_earned: false,
    time_homogeneous_markov_theorem_earned: false,
    markov_state_theorem_earned: false,
    nonautonomous_dynamical_system_identification_earned: false,
    skew_product_theorem_earned: false,
    semigroup_theorem_earned: false,
    flow_theorem_earned: false,
    generator_theorem_earned: false,
    lie_bracket_identification_earned: false,
    baker_campbell_hausdorff_structure_earned: false,
    control_system_theorem_earned: false,
    stationarity_theorem_earned: false,
    ergodicity_theorem_earned: false,
    causal_state_theorem_earned: false,
    minimal_state_theorem_earned: false,
    optimal_state_theorem_earned: false,
    generic_right_congruence_theorem_earned: false,
    myhill_nerode_theorem_earned: false,
    bisimulation_theorem_earned: false,
    predictive_state_theorem_earned: false,
    path_object_promotion_authority: false,
    path_category_earned: false,
    path_groupoid_earned: false,
    transport_functor_earned: false,
    connection_earned: false,
    loop_endomorphism_earned: false,
    holonomy_earned: false,
    curvature_earned: false,
    berry_structure_earned: false,
    quantum_behavior_earned: false,
    canonical_operator_tomography_promotion_authority: false,
    proto_loom_earned: false,
    td613_general_theorem_earned: false,
    a16_reopened: false,
    live_ash_mutation: false,
    merge_authority: false,
    production_authority: false,
    vercel_authority: false,
  });

  const criteria = freeze({
    C1_parent_compositional_replay_closure_passes: parent.passed === true,
    C2_temporal_universe_is_derived: temporal.status === 'TEMPORAL_HISTORY_UNIVERSE_DERIVED_FROM_PARENT_CUSTODY',
    C3_phase_erasure_pair_collides_before_time: phaseErasureInitialEqual === true,
    C4_phase_erasure_breaks_exogenous_evolution_congruence: operationalPhi.representative_independent === false && phaseErasureSuccessorEqual === false,
    C5_temporal_candidate_has_nontrivial_receipt_distinct_fiber: Boolean(duplicateTemporalFiber)
      && T_AB_P0.receipt_variant !== T_AB_DUP_P0.receipt_variant,
    C6_phi_tick_is_representative_independent_under_temporal_candidate: temporalPhi.representative_independent === true,
    C7_phi_two_ticks_is_representative_independent_under_temporal_candidate: temporalPhi2.representative_independent === true,
    C8_question_is_representative_independent_under_temporal_candidate: temporalQ.representative_independent === true,
    C9_q_after_phi_is_representative_independent_under_temporal_candidate: temporalQAfterPhi.representative_independent === true,
    C10_phi_after_q_is_representative_independent_under_temporal_candidate: temporalPhiAfterQ.representative_independent === true,
    C11_direct_two_tick_matches_iterated_one_tick: twoTickChecks.every((entry) => entry.equal === true),
    C12_question_time_order_has_explicit_noncommutation_witness: orderChecks.some((entry) => entry.equal === false),
    C13_undeclared_last_action_abstains: unsupported.status === 'UNDECLARED_LAST_ACTION_ABSTAINS'
      && unsupported.disposition === 'ABSTAIN_BEFORE_EXOGENOUS_EVOLUTION',
    C14_parent_custody_is_unchanged: parentSnapshotBefore === parentSnapshotAfter,
    C15_claim_ceiling_remains_closed: Object.values(claimCeiling).every((value) => value === false),
  });

  const passed = Object.values(criteria).every(Boolean);

  return freeze({
    schema: EXOGENOUS_EVOLUTION_CONGRUENCE_SCHEMA,
    temporal_history_universe: temporal,
    operational_without_phase: operationalPhi,
    temporal_candidate: freeze({
      phi_tick: temporalPhi,
      phi_two_ticks: temporalPhi2,
      question: temporalQ,
      q_after_phi: temporalQAfterPhi,
      phi_after_q: temporalPhiAfterQ,
    }),
    phase_erasure_hostile: freeze({
      pair: freeze(['T_AB_P0', 'T_AB_P1']),
      initial_operational_projection_equal: phaseErasureInitialEqual,
      one_tick_operational_projection_equal: phaseErasureSuccessorEqual,
      classification: phaseErasureInitialEqual && !phaseErasureSuccessorEqual
        ? 'TEMPORAL_PHASE_ERASURE_BREAKS_EXOGENOUS_EVOLUTION_CONGRUENCE'
        : null,
    }),
    two_tick_composition_consistency: freeze(twoTickChecks),
    question_time_order: freeze({
      checks: freeze(orderChecks),
      order_sensitive: orderChecks.some((entry) => entry.equal === false),
      classification: orderChecks.some((entry) => entry.equal === false)
        ? 'QUESTION_TIME_ORDER_IS_SENSITIVE_WHILE_EACH_ORDER_REMAINS_REPRESENTATIVE_INDEPENDENT'
        : 'QUESTION_TIME_ORDER_COMMUTES_IN_AUTHORED_FIXTURE',
    }),
    undeclared_last_action_control: unsupported,
    criteria,
    passed,
    classification: passed
      ? 'FINITE_TEMPORAL_PHASE_AUGMENTATION_RESTORES_DECLARED_EXOGENOUS_EVOLUTION_CONGRUENCE_WITH_ORDER_SENSITIVE_QUESTION_TIME_INTERACTION'
      : null,
    canonical_bounded_scientific_claim: passed
      ? 'IN_THE_AUTHORED_FINITE_TEMPORAL_FIXTURE_THE_PREVIOUS_OPERATIONAL_ABSTRACTION_CAN_COLLAPSE_EQUAL_OPERATIONAL_HISTORIES_WHOSE_DECLARED_CLOCK_PHASES_PRODUCE_DIFFERENT_NO_QUESTION_SUCCESSORS_WHILE_A_PHASE_AUGMENTED_NONTRIVIAL_QUOTIENT_REMAINS_REPRESENTATIVE_INDEPENDENT_UNDER_ONE_TICK_TWO_TICK_QUESTION_AND_BOTH_QUESTION_TIME_ORDERINGS_DIRECT_TWO_TICK_EVOLUTION_MATCHES_TWO_ITERATED_ONE_TICK_EVOLUTIONS_AND_QUESTION_INDUCED_AND_TIME_INDUCED_MAPS_CAN_REMAIN_LAWFUL_WHILE_FAILING_TO_COMMUTE'
      : null,
    next_learning_action: passed
      ? 'HUMAN_𝄐_REQUIRED_BEFORE_DECIDING_WHETHER_THE_TEMPORALLY_AUGMENTED_QUOTIENT_MAY_BECOME_THE_FIRST_BOUNDED_PATH_OBJECT_OR_REQUIRES_A_LONGER_HORIZON_TIME_ASSAY'
      : null,
    ...claimCeiling,
  });
}
