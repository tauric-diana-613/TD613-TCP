import {
  applyPathGenerator,
  evaluatePathWord,
  generateBoundedPathWords,
  pathObjectProjection,
} from './aperture-pedagogue-first-bounded-path-grammar.js';
import { runFinitePathCategoryAudition } from './aperture-pedagogue-finite-path-category-audition.js';
import { deriveRecurrenceHistoryUniverse } from './aperture-pedagogue-temporal-recurrence-phase-aliasing.js';

export const INVERTIBILITY_ADMISSIBILITY_OBSTRUCTION_SCHEMA = 'td613.a15-r0.aperture-pedagogue-invertibility-admissibility-obstruction/v0.1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const keyOf = (value) => JSON.stringify(value);

export const endpointMass = (history) => history.endpoint.flat().reduce((sum, value) => sum + value, 0);

const controlKey = (history) => `${history.last_action}|${history.forcing_season}`;
const admittedLastActions = new Set(['B', 'Q_PHASE_PULSE']);
const admittedSeasons = new Set(['S0', 'S1', 'S2', 'S3']);

const expectedControlCases = freeze([
  freeze({ last_action: 'B', forcing_season: 'S0', word: freeze([]) }),
  freeze({ last_action: 'B', forcing_season: 'S1', word: freeze(['T']) }),
  freeze({ last_action: 'B', forcing_season: 'S2', word: freeze(['T', 'T']) }),
  freeze({ last_action: 'B', forcing_season: 'S3', word: freeze(['T', 'T', 'T']) }),
  freeze({ last_action: 'Q_PHASE_PULSE', forcing_season: 'S0', word: freeze(['Q']) }),
  freeze({ last_action: 'Q_PHASE_PULSE', forcing_season: 'S1', word: freeze(['T', 'Q']) }),
  freeze({ last_action: 'Q_PHASE_PULSE', forcing_season: 'S2', word: freeze(['T', 'T', 'Q']) }),
  freeze({ last_action: 'Q_PHASE_PULSE', forcing_season: 'S3', word: freeze(['T', 'T', 'T', 'Q']) }),
]);

function realizeWord(history, word) {
  if (word.length === 0) return history;
  const result = evaluatePathWord(history, word);
  return result.status === 'BOUNDED_PATH_WORD_EVALUATED' ? result.final_history : result;
}

function deriveControlRepresentatives(anchor) {
  const rows = [];
  const failures = [];

  for (const expected of expectedControlCases) {
    const history = realizeWord(anchor, expected.word);
    if (history?.status) {
      failures.push(freeze({ expected, abstention: history }));
      continue;
    }
    const phaseExpected = ['S0', 'S2'].includes(expected.forcing_season) ? 'P0' : 'P1';
    const typed = (
      history.last_action === expected.last_action
      && history.forcing_season === expected.forcing_season
      && history.clock_phase === phaseExpected
    );
    const row = freeze({
      expected,
      history,
      actual_last_action: history.last_action,
      actual_forcing_season: history.forcing_season,
      actual_clock_phase: history.clock_phase,
      expected_clock_phase: phaseExpected,
      typed,
      control_key: controlKey(history),
      endpoint_mass: endpointMass(history),
    });
    rows.push(row);
    if (!typed) failures.push(row);
  }

  return freeze({
    rows: freeze(rows),
    failures: freeze(failures),
    all_reachable_and_typed: rows.length === 8 && failures.length === 0,
  });
}

function auditLocalTransitions(controlRepresentatives) {
  const rows = [];
  const failures = [];

  for (const representative of controlRepresentatives.rows) {
    for (const generator of ['T', 'Q']) {
      const before = representative.history;
      const after = applyPathGenerator(before, generator);
      if (after?.status) {
        const failure = freeze({
          source_control_key: representative.control_key,
          generator,
          classification: 'DECLARED_GENERATOR_ABSTAINED_IN_CONTROL_DOMAIN',
          abstention: after,
        });
        failures.push(failure);
        continue;
      }
      const massBefore = endpointMass(before);
      const massAfter = endpointMass(after);
      const deltaMass = massAfter - massBefore;
      const domainClosed = admittedLastActions.has(after.last_action) && admittedSeasons.has(after.forcing_season);
      const strictlyIncreasing = deltaMass > 0;
      const row = freeze({
        source_control_key: representative.control_key,
        generator,
        source_last_action: before.last_action,
        source_forcing_season: before.forcing_season,
        target_last_action: after.last_action,
        target_forcing_season: after.forcing_season,
        target_clock_phase: after.clock_phase,
        mass_before: massBefore,
        mass_after: massAfter,
        delta_mass: deltaMass,
        domain_closed: domainClosed,
        strictly_increasing: strictlyIncreasing,
      });
      rows.push(row);
      if (!domainClosed || !strictlyIncreasing) failures.push(row);
    }
  }

  return freeze({
    rows: freeze(rows),
    failures: freeze(failures),
    exact_local_check_count: rows.length,
    domain_closed: rows.length === 16 && rows.every((row) => row.domain_closed),
    strict_monotonicity: rows.length === 16 && rows.every((row) => row.strictly_increasing),
    minimum_delta_mass: rows.length ? Math.min(...rows.map((row) => row.delta_mass)) : null,
    maximum_delta_mass: rows.length ? Math.max(...rows.map((row) => row.delta_mass)) : null,
  });
}

function boundedReverseSearch(parentCategory) {
  const reverseWords = generateBoundedPathWords(4);
  const nodeByKey = new Map(parentCategory.finite_slice.nodes.map((node) => [node.key, node]));
  const searches = [];
  const hits = [];

  for (const arrow of parentCategory.arrows.filter((candidate) => !candidate.is_identity)) {
    const targetNode = nodeByKey.get(arrow.target_key);
    for (const representative of targetNode.representatives) {
      for (const word of reverseWords) {
        const evaluation = evaluatePathWord(representative.history, word);
        const returned = evaluation.status === 'BOUNDED_PATH_WORD_EVALUATED' && evaluation.target_key === arrow.source_key;
        const row = freeze({
          arrow_id: arrow.arrow_id,
          target_representative_history_id: representative.history.id,
          word: freeze([...word]),
          word_label: word.join(''),
          returned_to_source: returned,
        });
        searches.push(row);
        if (returned) hits.push(row);
      }
    }
  }

  return freeze({
    search_depth: 4,
    search_rows: freeze(searches),
    reverse_hits: freeze(hits),
    no_reverse_word_found: hits.length === 0,
    role: 'CORROBORATION_ONLY_NOT_BASIS_OF_ALL_FINITE_WORD_OBSTRUCTION',
  });
}

function reversedStringHostile(anchor) {
  const forward = evaluatePathWord(anchor, ['T', 'Q']);
  if (forward.status !== 'BOUNDED_PATH_WORD_EVALUATED') {
    return freeze({ passed: false, classification: 'FORWARD_ROUTE_NOT_ADMITTED' });
  }
  const reversed = evaluatePathWord(forward.final_history, ['Q', 'T']);
  if (reversed.status !== 'BOUNDED_PATH_WORD_EVALUATED') {
    return freeze({ passed: false, classification: 'REVERSED_STRING_ROUTE_NOT_ADMITTED' });
  }
  const sourceKey = keyOf(pathObjectProjection(anchor));
  const returned = reversed.target_key === sourceKey;
  return freeze({
    passed: !returned,
    forward_word: freeze(['T', 'Q']),
    reversed_string_word: freeze(['Q', 'T']),
    source_state: pathObjectProjection(anchor),
    forward_target_state: forward.target_state,
    reversed_from_target_state: reversed.target_state,
    source_mass: endpointMass(anchor),
    forward_target_mass: endpointMass(forward.final_history),
    reversed_from_target_mass: endpointMass(reversed.final_history),
    returned_to_source: returned,
    classification: 'REVERSED_GENERATOR_STRING_IS_NOT_AN_INVERSE_PATH',
  });
}

function endpointErasureProjection(history) {
  return freeze({
    last_action: history.last_action,
    operational_lineage: history.operational_lineage,
    clock_phase: history.clock_phase,
    forcing_season: history.forcing_season,
  });
}

function endpointErasureHostile(anchor) {
  const t4 = evaluatePathWord(anchor, ['T', 'T', 'T', 'T']);
  if (t4.status !== 'BOUNDED_PATH_WORD_EVALUATED') {
    return freeze({ passed: false, classification: 'T4_CONTROL_NOT_ADMITTED' });
  }
  const hostileSource = endpointErasureProjection(anchor);
  const hostileTarget = endpointErasureProjection(t4.final_history);
  const hostileLooksClosed = keyOf(hostileSource) === keyOf(hostileTarget);
  const completeLooksClosed = keyOf(pathObjectProjection(anchor)) === keyOf(pathObjectProjection(t4.final_history));
  return freeze({
    passed: hostileLooksClosed && !completeLooksClosed && endpointMass(t4.final_history) > endpointMass(anchor),
    source_mass: endpointMass(anchor),
    target_mass: endpointMass(t4.final_history),
    delta_mass: endpointMass(t4.final_history) - endpointMass(anchor),
    hostile_source: hostileSource,
    hostile_target: hostileTarget,
    hostile_projection_looks_closed: hostileLooksClosed,
    complete_operational_object_closes: completeLooksClosed,
    source_complete_state: pathObjectProjection(anchor),
    target_complete_state: pathObjectProjection(t4.final_history),
    classification: 'ENDPOINT_ERASURE_MANUFACTURES_FALSE_PATH_CLOSURE',
  });
}

export function runInvertibilityAdmissibilityObstructionAssay() {
  const parent = runFinitePathCategoryAudition();
  if (!parent?.passed) {
    return freeze({
      schema: INVERTIBILITY_ADMISSIBILITY_OBSTRUCTION_SCHEMA,
      passed: false,
      status: 'PARENT_FINITE_PATH_CATEGORY_NOT_WITNESSED_BY_EXECUTABLE',
      disposition: 'ABSTAIN_BEFORE_INVERTIBILITY_AUDITION',
    });
  }

  const parentSnapshotBefore = JSON.stringify(parent);
  const recurrence = deriveRecurrenceHistoryUniverse();
  const anchor = recurrence.histories.find((history) => history.id === 'R_AB_S0');
  if (!anchor) {
    return freeze({
      schema: INVERTIBILITY_ADMISSIBILITY_OBSTRUCTION_SCHEMA,
      passed: false,
      status: 'ANCHOR_HISTORY_MISSING',
      disposition: 'ABSTAIN_BEFORE_INVERTIBILITY_AUDITION',
    });
  }

  const controlRepresentatives = deriveControlRepresentatives(anchor);
  const localTransitions = auditLocalTransitions(controlRepresentatives);
  const strictRankingCertificate = freeze({
    candidate: 'ENDPOINT_MASS',
    definition: 'M(h)=SUM_OF_ALL_FOUR_ENDPOINT_ENTRIES',
    reachable_control_case_count: controlRepresentatives.rows.length,
    local_transition_check_count: localTransitions.exact_local_check_count,
    control_domain_closed: localTransitions.domain_closed,
    every_nonidentity_generator_strictly_increases_mass: localTransitions.strict_monotonicity,
    minimum_local_increment: localTransitions.minimum_delta_mass,
    maximum_local_increment: localTransitions.maximum_delta_mass,
    finite_word_induction_earned: (
      controlRepresentatives.all_reachable_and_typed
      && localTransitions.domain_closed
      && localTransitions.strict_monotonicity
    ),
    consequence: (
      controlRepresentatives.all_reachable_and_typed
      && localTransitions.domain_closed
      && localTransitions.strict_monotonicity
    )
      ? 'EVERY_NONEMPTY_FINITE_TQ_WORD_STRICTLY_INCREASES_ENDPOINT_MASS_ON_THE_AUTHORED_ANCHOR_REACHABLE_CONTROL_DOMAIN'
      : null,
  });

  const reverseSearch = boundedReverseSearch(parent);
  const stringReverse = reversedStringHostile(anchor);
  const undeclaredTInverse = applyPathGenerator(anchor, 'T_INV');
  const undeclaredQInverse = applyPathGenerator(anchor, 'Q_INV');
  const custodyReplayCounterfeit = freeze({
    source_history_id: anchor.id,
    source_receipt_variant: anchor.receipt_variant,
    retained_in_custody: true,
    operational_inverse_admitted: false,
    mutation_performed: false,
    classification: 'CUSTODY_REPLAY_IS_NOT_OPERATIONAL_INVERSE',
  });
  const t4 = evaluatePathWord(anchor, ['T', 'T', 'T', 'T']);
  const temporalRecurrenceCounterfeit = freeze({
    word: freeze(['T', 'T', 'T', 'T']),
    source_forcing_season: anchor.forcing_season,
    target_forcing_season: t4.target_state.forcing_season,
    source_clock_phase: anchor.clock_phase,
    target_clock_phase: t4.target_state.clock_phase,
    labels_recur: (
      anchor.forcing_season === t4.target_state.forcing_season
      && anchor.clock_phase === t4.target_state.clock_phase
    ),
    source_mass: endpointMass(anchor),
    target_mass: endpointMass(t4.final_history),
    delta_mass: endpointMass(t4.final_history) - endpointMass(anchor),
    inverse_evolution: false,
    classification: 'TEMPORAL_LABEL_RECURRENCE_IS_NOT_INVERSE_EVOLUTION',
  });
  const endpointErasure = endpointErasureHostile(anchor);

  const inverseEquationAudit = freeze({
    nonidentity_parent_arrow_count: parent.arrows.filter((arrow) => !arrow.is_identity).length,
    operational_inverse_candidates_found: 0,
    both_sided_inverse_equations_testable: false,
    reason: 'STRICT_RANKING_CERTIFICATE_FORBIDS_ANY_NONEMPTY_TQ_RETURN_PATH_TO_THE_SOURCE_OBJECT',
    inverse_equations_required: freeze(['r∘f=id_source', 'f∘r=id_target']),
  });

  const parentSnapshotAfter = JSON.stringify(runFinitePathCategoryAudition());
  const parentCustodyUnchanged = parentSnapshotBefore === parentSnapshotAfter;

  const success = (
    controlRepresentatives.all_reachable_and_typed
    && localTransitions.exact_local_check_count === 16
    && localTransitions.failures.length === 0
    && strictRankingCertificate.finite_word_induction_earned
    && reverseSearch.no_reverse_word_found
    && stringReverse.passed
    && undeclaredTInverse.status === 'UNDECLARED_PATH_GENERATOR_ABSTAINS'
    && undeclaredQInverse.status === 'UNDECLARED_PATH_GENERATOR_ABSTAINS'
    && custodyReplayCounterfeit.operational_inverse_admitted === false
    && temporalRecurrenceCounterfeit.labels_recur
    && temporalRecurrenceCounterfeit.delta_mass > 0
    && endpointErasure.passed
    && parentCustodyUnchanged
  );

  return freeze({
    schema: INVERTIBILITY_ADMISSIBILITY_OBSTRUCTION_SCHEMA,
    passed: success,
    status: success ? 'INVERTIBILITY_ADMISSIBILITY_OBSTRUCTION_ROUND_CLOSED' : 'INVERTIBILITY_ADMISSIBILITY_OBSTRUCTION_ASSAY_FAILED',
    anchor_id: anchor.id,
    control_representatives: controlRepresentatives,
    local_transition_audit: localTransitions,
    strict_ranking_certificate: strictRankingCertificate,
    bounded_reverse_search: reverseSearch,
    counterfeit_reverse_controls: freeze({
      reversed_generator_string: stringReverse,
      undeclared_T_INV: undeclaredTInverse,
      undeclared_Q_INV: undeclaredQInverse,
      custody_replay: custodyReplayCounterfeit,
      temporal_label_recurrence: temporalRecurrenceCounterfeit,
      endpoint_erasure: endpointErasure,
    }),
    inverse_equation_audit: inverseEquationAudit,
    parent_custody_unchanged: parentCustodyUnchanged,
    canonical_classification: success
      ? 'STRICT_ENDPOINT_MASS_MONOTONICITY_OBSTRUCTS_NONIDENTITY_INVERSES_UNDER_DECLARED_TQ_GRAMMAR_ON_ANCHOR_REACHABLE_DOMAIN'
      : null,
    bounded_claim: success
      ? 'IN_THE_AUTHORED_ANCHOR_REACHABLE_TQ_DOMAIN_ALL_EIGHT_REACHABLE_CONTROL_STATES_ARE_CLOSED_UNDER_T_AND_Q_AND_ALL_SIXTEEN_LOCAL_GENERATOR_TRANSITIONS_STRICTLY_INCREASE_ENDPOINT_MASS_SO_BY_FINITE_TRANSITION_TABLE_INDUCTION_EVERY_NONEMPTY_FINITE_TQ_WORD_STRICTLY_INCREASES_ENDPOINT_MASS_AND_CANNOT_RETURN_THE_COMPLETE_K_PERIOD4_OPERATIONAL_OBJECT_BOUNDED_REVERSE_SEARCH_CORROBORATES_THE_OBSTRUCTION_WHILE_SYNTACTIC_REVERSAL_UNDECLARED_INVERSE_LABELS_CUSTODY_REPLAY_TEMPORAL_LABEL_RECURRENCE_AND_ENDPOINT_ERASURE_ALL_FAIL_AS_VALID_INVERSE_EVIDENCE'
      : null,
    claim_ceiling: freeze({
      generic_irreversibility_theorem: false,
      physical_entropy_interpretation: false,
      energy_interpretation: false,
      lyapunov_theorem_outside_authored_fixture: false,
      ambient_td613_category_theorem: false,
      ambient_td613_no_groupoid_theorem: false,
      new_reverse_generator: false,
      inverse_morphism: false,
      groupoid: false,
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
    stop: success
      ? 'HUMAN_𝄐_REQUIRED_BEFORE_INTRODUCING_ANY_NEW_REVERSIBLE_GENERATOR_OR_COARSENING_THE_OPERATIONAL_OBJECT'
      : 'PRESERVE_FAILURE_AND_RETURN_TO_HUMAN_𝄐',
  });
}
