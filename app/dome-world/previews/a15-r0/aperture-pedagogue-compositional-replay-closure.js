import { runPartialEventCustodyProjectionGauntlet } from './aperture-pedagogue-partial-event-custody-projection.js';
import { runTranscriptCompressionCollisionGauntlet } from './aperture-pedagogue-transcript-compression-collision.js';

export const COMPOSITIONAL_REPLAY_CLOSURE_SCHEMA = 'td613.a15-r0.aperture-pedagogue-compositional-replay-closure/v0.1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const keyOf = (value) => JSON.stringify(value);
const sum = (values) => values.reduce((acc, value) => acc + value, 0);
const trace2 = (M) => M[0][0] + M[1][1];
const add2 = (A, B) => freeze([
  freeze([A[0][0] + B[0][0], A[0][1] + B[0][1]]),
  freeze([A[1][0] + B[1][0], A[1][1] + B[1][1]]),
]);

const DELTA_LAST_A = freeze([[1, 0], [0, 0]]);
const DELTA_LAST_B = freeze([[0, 0], [0, 1]]);
const DELTA_ZERO = freeze([[0, 0], [0, 0]]);
const DELTA_PARITY_ODD = freeze([[1, 0], [0, 0]]);
const DELTA_PARITY_EVEN = freeze([[0, 0], [0, 1]]);
const DELTA_RECEIPT_R1 = freeze([[1, 0], [0, 0]]);
const DELTA_RECEIPT_R1_DUP = freeze([[0, 0], [0, 2]]);

function appendSuccessor(history, continuationId, endpoint, observation, consumed) {
  return freeze({
    id: `${history.id}::${continuationId}`,
    parent_history_id: history.id,
    parent_record_id: history.parent_record_id,
    endpoint,
    cumulative: history.cumulative + observation,
    last_action: continuationId,
    operational_lineage: freeze([...history.operational_lineage, continuationId]),
    receipt_variant: history.receipt_variant,
    custody_events: freeze([
      ...history.custody_events,
      freeze({
        action_id: continuationId,
        scalar_response: observation,
        consumed: freeze(clone(consumed)),
      }),
    ]),
  });
}

export function deriveCompositionalHistoryUniverse(collisionParent = runTranscriptCompressionCollisionGauntlet()) {
  if (!collisionParent?.passed) {
    return freeze({
      status: 'PARENT_COMPRESSION_COLLISION_NOT_WITNESSED_BY_EXECUTABLE',
      disposition: 'ABSTAIN_BEFORE_COMPOSITIONAL_HISTORY_DERIVATION',
    });
  }

  const byId = new Map(collisionParent.universe.map((record) => [record.id, record]));
  const AB = byId.get('AB');
  const BA = byId.get('BA');

  if (!AB || !BA) {
    return freeze({
      status: 'REQUIRED_PARENT_ROUTE_PAIR_MISSING',
      disposition: 'ABSTAIN_BEFORE_COMPOSITIONAL_HISTORY_DERIVATION',
    });
  }

  const makeHistory = ({ id, parent, receiptVariant }) => freeze({
    id,
    parent_record_id: parent.id,
    endpoint: freeze(clone(parent.endpoint)),
    cumulative: sum(parent.transcript),
    last_action: parent.route_label.at(-1),
    operational_lineage: freeze([...parent.route_label]),
    receipt_variant: receiptVariant,
    custody_events: freeze(parent.route_label.split('').map((actionId, index) => freeze({
      action_id: actionId,
      scalar_response: parent.transcript[index],
      source: 'DERIVED_FROM_PARENT_CUSTODY',
    }))),
  });

  const histories = freeze([
    makeHistory({ id: 'H_AB', parent: AB, receiptVariant: 'R1' }),
    makeHistory({ id: 'H_BA', parent: BA, receiptVariant: 'R2' }),
    makeHistory({ id: 'H_AB_DUP', parent: AB, receiptVariant: 'R1_DUP' }),
  ]);

  return freeze({
    status: 'COMPOSITIONAL_HISTORY_UNIVERSE_DERIVED_FROM_PARENT_CUSTODY',
    histories,
  });
}

export const candidateReplayAbstractions = freeze({
  K_endpoint: (history) => freeze({ endpoint: freeze(clone(history.endpoint)) }),
  K_claim: (history) => freeze({
    endpoint: freeze(clone(history.endpoint)),
    cumulative: history.cumulative,
  }),
  K_declared: (history) => freeze({
    endpoint: freeze(clone(history.endpoint)),
    last_action: history.last_action,
    operational_lineage: freeze([...history.operational_lineage]),
  }),
});

export const declaredContinuationGrammarG0 = freeze({
  Q_ENDPOINT_READ: (history) => {
    const observation = trace2(history.endpoint);
    return appendSuccessor(
      history,
      'Q_ENDPOINT_READ',
      freeze(clone(history.endpoint)),
      observation,
      { endpoint: history.endpoint },
    );
  },

  Q_LAST_ACTION_KICK: (history) => {
    const delta = history.last_action === 'A'
      ? DELTA_LAST_A
      : history.last_action === 'B'
        ? DELTA_LAST_B
        : DELTA_ZERO;
    const endpoint = add2(history.endpoint, delta);
    const observation = trace2(endpoint);
    return appendSuccessor(
      history,
      'Q_LAST_ACTION_KICK',
      endpoint,
      observation,
      { endpoint: history.endpoint, previous_last_action: history.last_action },
    );
  },

  Q_LINEAGE_PARITY: (history) => {
    const parity = history.operational_lineage.length % 2 === 0 ? 'EVEN' : 'ODD';
    const delta = parity === 'ODD' ? DELTA_PARITY_ODD : DELTA_PARITY_EVEN;
    const endpoint = add2(history.endpoint, delta);
    const observation = trace2(endpoint);
    return appendSuccessor(
      history,
      'Q_LINEAGE_PARITY',
      endpoint,
      observation,
      { endpoint: history.endpoint, operational_lineage_length_parity: parity },
    );
  },
});

export function stepReceiptSensitiveHostile(history) {
  const delta = history.receipt_variant === 'R1'
    ? DELTA_RECEIPT_R1
    : history.receipt_variant === 'R1_DUP'
      ? DELTA_RECEIPT_R1_DUP
      : DELTA_ZERO;
  const endpoint = add2(history.endpoint, delta);
  const observation = trace2(endpoint);
  return appendSuccessor(
    history,
    'Q_RECEIPT_SENSITIVE',
    endpoint,
    observation,
    { endpoint: history.endpoint, receipt_variant: history.receipt_variant },
  );
}

function finiteFibers(histories, projection) {
  const map = new Map();
  for (const history of histories) {
    const state = projection(history);
    const key = keyOf(state);
    if (!map.has(key)) map.set(key, { state, members: [] });
    map.get(key).members.push(history);
  }
  return freeze([...map.values()].map(({ state, members }) => freeze({
    state,
    member_ids: freeze(members.map((member) => member.id)),
    members: freeze([...members]),
  })));
}

export function evaluateFiniteContinuationCongruence(
  histories,
  projection,
  grammar = declaredContinuationGrammarG0,
) {
  const fibers = finiteFibers(histories, projection);
  const violations = [];
  const transitionRows = [];

  for (const fiber of fibers) {
    for (const [continuationId, step] of Object.entries(grammar)) {
      const successors = fiber.members.map((history) => step(history));
      const successorProjections = successors.map((history) => projection(history));
      const uniqueSuccessors = new Map();
      successorProjections.forEach((state, index) => {
        const stateKey = keyOf(state);
        if (!uniqueSuccessors.has(stateKey)) uniqueSuccessors.set(stateKey, []);
        uniqueSuccessors.get(stateKey).push(fiber.members[index].id);
      });

      const representativeIndependent = uniqueSuccessors.size === 1;
      transitionRows.push(freeze({
        source_state: fiber.state,
        source_member_ids: fiber.member_ids,
        continuation_id: continuationId,
        representative_independent: representativeIndependent,
        successor_state: representativeIndependent ? successorProjections[0] : null,
        successor_variants: freeze([...uniqueSuccessors.entries()].map(([stateKey, memberIds]) => freeze({
          state_key: stateKey,
          member_ids: freeze([...memberIds]),
        }))),
      }));

      if (!representativeIndependent) {
        violations.push(freeze({
          source_state: fiber.state,
          source_member_ids: fiber.member_ids,
          continuation_id: continuationId,
          successor_variants: freeze([...uniqueSuccessors.entries()].map(([stateKey, memberIds]) => freeze({
            state_key: stateKey,
            member_ids: freeze([...memberIds]),
          }))),
        }));
      }
    }
  }

  return freeze({
    fibers,
    non_singleton_fibers: freeze(fibers.filter((fiber) => fiber.member_ids.length > 1)),
    transition_rows: freeze(transitionRows),
    violations: freeze(violations),
    continuation_congruent: violations.length === 0,
  });
}

export function runCompositionalReplayClosureGauntlet() {
  const partialParent = runPartialEventCustodyProjectionGauntlet();
  const collisionParent = runTranscriptCompressionCollisionGauntlet();

  if (!partialParent?.passed || !collisionParent?.passed) {
    return freeze({
      schema: COMPOSITIONAL_REPLAY_CLOSURE_SCHEMA,
      passed: false,
      status: !partialParent?.passed
        ? 'PARENT_PARTIAL_CUSTODY_NOT_WITNESSED_BY_EXECUTABLE'
        : 'PARENT_COMPRESSION_COLLISION_NOT_WITNESSED_BY_EXECUTABLE',
      disposition: 'ABSTAIN_BEFORE_COMPOSITIONAL_REPLAY_CLOSURE_CLAIMS',
    });
  }

  const partialSnapshotBefore = JSON.stringify(partialParent);
  const collisionSnapshotBefore = JSON.stringify(collisionParent.universe);

  const derived = deriveCompositionalHistoryUniverse(collisionParent);
  const histories = derived.histories;
  const byId = new Map(histories.map((history) => [history.id, history]));
  const H_AB = byId.get('H_AB');
  const H_BA = byId.get('H_BA');
  const H_AB_DUP = byId.get('H_AB_DUP');

  const endpointEval = evaluateFiniteContinuationCongruence(
    histories,
    candidateReplayAbstractions.K_endpoint,
  );
  const claimEval = evaluateFiniteContinuationCongruence(
    histories,
    candidateReplayAbstractions.K_claim,
  );
  const declaredEval = evaluateFiniteContinuationCongruence(
    histories,
    candidateReplayAbstractions.K_declared,
  );

  const endpointKickViolation = endpointEval.violations.find((entry) => (
    entry.continuation_id === 'Q_LAST_ACTION_KICK'
    && entry.source_member_ids.includes('H_AB')
    && entry.source_member_ids.includes('H_BA')
  ));
  const claimKickViolation = claimEval.violations.find((entry) => (
    entry.continuation_id === 'Q_LAST_ACTION_KICK'
    && entry.source_member_ids.includes('H_AB')
    && entry.source_member_ids.includes('H_BA')
  ));
  const declaredDuplicateFiber = declaredEval.non_singleton_fibers.find((fiber) => (
    fiber.member_ids.length === 2
    && fiber.member_ids.includes('H_AB')
    && fiber.member_ids.includes('H_AB_DUP')
  ));

  const receiptHostileInitialEqual = keyOf(candidateReplayAbstractions.K_declared(H_AB))
    === keyOf(candidateReplayAbstractions.K_declared(H_AB_DUP));
  const receiptHostileSuccessorAB = stepReceiptSensitiveHostile(H_AB);
  const receiptHostileSuccessorDup = stepReceiptSensitiveHostile(H_AB_DUP);
  const receiptHostileSuccessorEqual = keyOf(candidateReplayAbstractions.K_declared(receiptHostileSuccessorAB))
    === keyOf(candidateReplayAbstractions.K_declared(receiptHostileSuccessorDup));

  const partialSnapshotAfter = JSON.stringify(partialParent);
  const collisionSnapshotAfter = JSON.stringify(collisionParent.universe);

  const parentAB = collisionParent.universe.find((record) => record.id === 'AB');
  const parentBA = collisionParent.universe.find((record) => record.id === 'BA');
  const parentFactsDerived = (
    keyOf(parentAB.endpoint) === keyOf(parentBA.endpoint)
    && sum(parentAB.transcript) === 6
    && sum(parentBA.transcript) === 6
    && keyOf(parentAB.transcript) !== keyOf(parentBA.transcript)
    && keyOf(H_AB.endpoint) === keyOf(parentAB.endpoint)
    && keyOf(H_BA.endpoint) === keyOf(parentBA.endpoint)
    && H_AB.cumulative === sum(parentAB.transcript)
    && H_BA.cumulative === sum(parentBA.transcript)
  );

  const claimCeiling = freeze({
    generic_right_congruence_theorem_earned: false,
    myhill_nerode_identification_earned: false,
    minimal_automaton_theorem_earned: false,
    bisimulation_theorem_earned: false,
    predictive_state_representation_theorem_earned: false,
    markov_state_theorem_earned: false,
    minimal_sufficient_state_theorem_earned: false,
    optimal_state_abstraction_theorem_earned: false,
    causal_state_theorem_earned: false,
    state_minimization_theorem_earned: false,
    generic_history_compression_theorem_earned: false,
    general_controlled_sensing_theorem_earned: false,
    general_path_dependence_theorem_earned: false,
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
    C1_parent_partial_custody_passes: partialParent.passed === true,
    C2_parent_compression_collision_passes: collisionParent.passed === true,
    C3_parent_endpoint_and_cumulative_collisions_are_derived: parentFactsDerived,
    C4_duplicate_custody_objects_collide_under_declared_abstraction: Boolean(declaredDuplicateFiber)
      && H_AB.receipt_variant !== H_AB_DUP.receipt_variant
      && keyOf(candidateReplayAbstractions.K_declared(H_AB)) === keyOf(candidateReplayAbstractions.K_declared(H_AB_DUP)),
    C5_endpoint_only_fails_with_explicit_last_action_kick_counterexample: endpointEval.continuation_congruent === false && Boolean(endpointKickViolation),
    C6_claim_abstraction_fails_with_explicit_last_action_kick_counterexample: claimEval.continuation_congruent === false && Boolean(claimKickViolation),
    C7_declared_abstraction_passes_all_G0_continuations: declaredEval.continuation_congruent === true,
    C8_declared_abstraction_has_nontrivial_fiber: declaredEval.non_singleton_fibers.length > 0 && Boolean(declaredDuplicateFiber),
    C9_declared_abstract_update_table_is_representative_independent: declaredEval.transition_rows.every((row) => row.representative_independent === true),
    C10_receipt_sensitive_grammar_widening_defeats_declared_abstraction: receiptHostileInitialEqual === true && receiptHostileSuccessorEqual === false,
    C11_grammar_relative_classification_is_explicit: true,
    C12_parent_custody_unchanged_and_frozen: partialSnapshotBefore === partialSnapshotAfter
      && collisionSnapshotBefore === collisionSnapshotAfter
      && Object.isFrozen(partialParent)
      && Object.isFrozen(collisionParent.universe)
      && Object.isFrozen(collisionParent.universe[0]),
    C13_claim_ceiling_remains_closed: Object.values(claimCeiling).every((value) => value === false),
  });

  const passed = Object.values(criteria).every(Boolean);

  return freeze({
    schema: COMPOSITIONAL_REPLAY_CLOSURE_SCHEMA,
    parent: {
      partial_event_custody_classification: partialParent.classification,
      compression_collision_classification: collisionParent.classification,
    },
    history_universe: histories,
    declared_grammar_ids: freeze(Object.keys(declaredContinuationGrammarG0)),
    candidate_results: {
      K_endpoint: freeze({
        ...endpointEval,
        classification: endpointEval.continuation_congruent
          ? 'ENDPOINT_ONLY_ABSTRACTION_PASSES_DECLARED_CONTINUATION_CONGRUENCE'
          : 'ENDPOINT_ONLY_ABSTRACTION_FAILS_DECLARED_CONTINUATION_CONGRUENCE',
      }),
      K_claim: freeze({
        ...claimEval,
        classification: claimEval.continuation_congruent
          ? 'CLAIM_SUFFICIENT_ABSTRACTION_PASSES_DECLARED_CONTINUATION_CONGRUENCE'
          : 'CLAIM_SUFFICIENT_ABSTRACTION_FAILS_DECLARED_CONTINUATION_CONGRUENCE',
      }),
      K_declared: freeze({
        ...declaredEval,
        classification: declaredEval.continuation_congruent
          ? 'DECLARED_OPERATIONAL_ABSTRACTION_PASSES_FINITE_CONTINUATION_CONGRUENCE_OVER_G0'
          : 'DECLARED_OPERATIONAL_ABSTRACTION_FAILS_FINITE_CONTINUATION_CONGRUENCE_OVER_G0',
      }),
    },
    grammar_widening_hostile: freeze({
      continuation_id: 'Q_RECEIPT_SENSITIVE',
      member_ids: freeze(['H_AB', 'H_AB_DUP']),
      initial_declared_projection_equal: receiptHostileInitialEqual,
      successor_declared_projection_equal: receiptHostileSuccessorEqual,
      classification: receiptHostileInitialEqual && !receiptHostileSuccessorEqual
        ? 'COMPOSITIONAL_CLOSURE_IS_GRAMMAR_RELATIVE_IN_AUTHORED_FIXTURE'
        : 'GRAMMAR_RELATIVITY_HOSTILE_UNRESOLVED',
    }),
    criteria,
    passed,
    classification: passed
      ? 'FINITE_GRAMMAR_RELATIVE_COMPOSITIONAL_REPLAY_CLOSURE_WITH_PROJECTION_COUNTEREXAMPLES'
      : null,
    canonical_bounded_scientific_claim: passed
      ? 'IN_THE_AUTHORED_FINITE_CONTINUATION_GRAMMAR_A_COMMON_ENDPOINT_OR_CURRENT_CLAIM_SUFFICIENT_PROJECTION_CAN_COLLAPSE_HISTORIES_THAT_A_DECLARED_HISTORY_SENSITIVE_CONTINUATION_LATER_SEPARATES_WHILE_A_RICHER_OPERATIONAL_ABSTRACTION_WITH_A_NONTRIVIAL_RECEIPT_LEVEL_COLLISION_REMAINS_REPRESENTATIVE_INDEPENDENT_UNDER_EVERY_PREREGISTERED_G0_CONTINUATION_AND_FAILS_WHEN_THE_GRAMMAR_IS_EXPLICITLY_WIDENED_TO_A_RECEIPT_SENSITIVE_CONTINUATION'
      : null,
    next_learning_action: passed
      ? 'STOP_FOR_HUMAN_𝄐_BEFORE_PROMOTING_ANY_VALIDATED_QUOTIENT_CLASS_TO_A_PATH_OBJECT_OR_AUTHORING_PATH_CATEGORY_GRAMMAR'
      : null,
    ...claimCeiling,
  });
}
