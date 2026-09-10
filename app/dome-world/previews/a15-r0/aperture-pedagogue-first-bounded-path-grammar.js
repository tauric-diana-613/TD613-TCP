import {
  deriveRecurrenceHistoryUniverse,
  recurrenceCandidateAbstractions,
  runTemporalRecurrencePhaseAliasingGauntlet,
  stepPsiFourTicks,
  stepPsiThreeTicks,
  stepPsiTick,
  stepPsiTwoTicks,
} from './aperture-pedagogue-temporal-recurrence-phase-aliasing.js';
import { stepQuestionPhasePulse } from './aperture-pedagogue-exogenous-evolution-congruence.js';

export const FIRST_BOUNDED_PATH_GRAMMAR_SCHEMA = 'td613.a15-r0.aperture-pedagogue-first-bounded-path-grammar/v0.1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const keyOf = (value) => JSON.stringify(value);

export const PATH_GENERATORS = freeze({
  T: freeze({ id: 'T', operation_id: 'PSI_TICK', kind: 'EXOGENOUS_EVOLUTION' }),
  Q: freeze({ id: 'Q', operation_id: 'Q_PHASE_PULSE', kind: 'QUESTION_CONTINUATION' }),
});

export const pathObjectProjection = (history) => recurrenceCandidateAbstractions.K_period4(history);

const undeclaredGeneratorAbstain = (history, generator) => freeze({
  status: 'UNDECLARED_PATH_GENERATOR_ABSTAINS',
  disposition: 'ABSTAIN_BEFORE_PATH_EVALUATION',
  history_id: history?.id ?? null,
  generator: generator ?? null,
});

export function applyPathGenerator(history, generator) {
  if (generator === 'T') return stepPsiTick(history);
  if (generator === 'Q') return stepQuestionPhasePulse(history);
  return undeclaredGeneratorAbstain(history, generator);
}

export function generateBoundedPathWords(maxDepth = 4) {
  if (!Number.isInteger(maxDepth) || maxDepth < 1) return freeze([]);
  const words = [];
  const extend = (prefix, remaining) => {
    if (remaining === 0) return;
    for (const generator of ['T', 'Q']) {
      const word = freeze([...prefix, generator]);
      words.push(word);
      extend(word, remaining - 1);
    }
  };
  extend([], maxDepth);
  return freeze(words);
}

export function evaluatePathWord(history, word) {
  if (!Array.isArray(word) || word.length === 0) {
    return freeze({
      status: 'EMPTY_PATH_WORD_NOT_ADMITTED_IN_THIS_CHAMBER',
      disposition: 'ABSTAIN_BEFORE_PATH_EVALUATION',
      history_id: history?.id ?? null,
    });
  }

  const sourceState = pathObjectProjection(history);
  const sourceKey = keyOf(sourceState);
  let current = history;
  const arrows = [];

  for (let index = 0; index < word.length; index += 1) {
    const generator = word[index];
    const before = current;
    const stepSourceState = pathObjectProjection(before);
    const stepSourceKey = keyOf(stepSourceState);
    const after = applyPathGenerator(before, generator);

    if (after?.status) {
      return freeze({
        status: after.status,
        disposition: after.disposition ?? 'ABSTAIN_BEFORE_PATH_EVALUATION',
        history_id: history?.id ?? null,
        word: freeze([...word]),
        failed_index: index,
        generator,
        parent_abstention: after,
      });
    }

    const stepTargetState = pathObjectProjection(after);
    const stepTargetKey = keyOf(stepTargetState);
    arrows.push(freeze({
      index,
      generator,
      operation_id: PATH_GENERATORS[generator].operation_id,
      source_state: stepSourceState,
      source_key: stepSourceKey,
      target_state: stepTargetState,
      target_key: stepTargetKey,
      source_history_id: before.id,
      target_history_id: after.id,
      typed: true,
    }));
    current = after;
  }

  const targetState = pathObjectProjection(current);
  const targetKey = keyOf(targetState);
  const typed = arrows.every((arrow, index) => (
    index === 0 || arrows[index - 1].target_key === arrow.source_key
  ));

  return freeze({
    status: 'BOUNDED_PATH_WORD_EVALUATED',
    source_history_id: history.id,
    source_receipt_variant: history.receipt_variant ?? null,
    word: freeze([...word]),
    word_label: word.join(''),
    source_state: sourceState,
    source_key: sourceKey,
    target_state: targetState,
    target_key: targetKey,
    final_history: current,
    final_receipt_variant: current.receipt_variant ?? null,
    arrows: freeze(arrows),
    typed,
    closed: sourceKey === targetKey,
  });
}

export function composeTypedArrows(firstArrow, secondArrow) {
  if (!firstArrow || !secondArrow || firstArrow.target_key !== secondArrow.source_key) {
    return freeze({
      status: 'PATH_TYPE_MISMATCH_ABSTAINS',
      disposition: 'ABSTAIN_BEFORE_TYPED_PATH_COMPOSITION',
      first_target_key: firstArrow?.target_key ?? null,
      second_source_key: secondArrow?.source_key ?? null,
    });
  }

  return freeze({
    status: 'TYPED_PATH_COMPOSITION_ADMITTED',
    generators: freeze([firstArrow.generator, secondArrow.generator]),
    source_state: firstArrow.source_state,
    source_key: firstArrow.source_key,
    middle_state: firstArrow.target_state,
    middle_key: firstArrow.target_key,
    target_state: secondArrow.target_state,
    target_key: secondArrow.target_key,
  });
}

function evaluateWordAcrossAnchorRepresentatives(anchorHistories, word) {
  const evaluations = anchorHistories.map((history) => evaluatePathWord(history, word));
  const abstentions = evaluations.filter((evaluation) => evaluation.status !== 'BOUNDED_PATH_WORD_EVALUATED');
  const targetKeys = new Set(evaluations.filter((row) => row.target_key).map((row) => row.target_key));
  const arrowStateSequences = evaluations.map((row) => row.arrows?.map((arrow) => freeze({
    source_key: arrow.source_key,
    target_key: arrow.target_key,
    generator: arrow.generator,
  })) ?? []);
  const sequenceKeys = new Set(arrowStateSequences.map(keyOf));
  const receiptVariants = evaluations.map((row) => row.final_receipt_variant);

  return freeze({
    word: freeze([...word]),
    word_label: word.join(''),
    evaluations: freeze(evaluations),
    abstentions: freeze(abstentions),
    representative_independent: abstentions.length === 0 && targetKeys.size === 1 && sequenceKeys.size === 1,
    state_sequence_independent: sequenceKeys.size === 1,
    final_receipt_variants: freeze(receiptVariants),
    receipt_distinction_preserved: new Set(receiptVariants).size === anchorHistories.length,
    all_arrows_typed: evaluations.every((row) => row.typed === true),
    closed: evaluations.length > 0 && evaluations.every((row) => row.closed === true),
  });
}

function directBridge(history, ticks, directOperation) {
  const word = Array.from({ length: ticks }, () => 'T');
  const path = evaluatePathWord(history, word);
  const direct = directOperation(history);
  const pathState = path.target_state;
  const directState = pathObjectProjection(direct);
  return freeze({
    history_id: history.id,
    ticks,
    word: freeze(word),
    path_state: pathState,
    direct_state: directState,
    equal: keyOf(pathState) === keyOf(directState),
  });
}

export function runFirstBoundedPathGrammarGauntlet() {
  const parent = runTemporalRecurrencePhaseAliasingGauntlet();
  if (!parent?.passed) {
    return freeze({
      schema: FIRST_BOUNDED_PATH_GRAMMAR_SCHEMA,
      passed: false,
      status: 'PARENT_TEMPORAL_RECURRENCE_NOT_WITNESSED_BY_EXECUTABLE',
      disposition: 'ABSTAIN_BEFORE_PATH_OBJECT_PROMOTION',
    });
  }

  const parentSnapshotBefore = JSON.stringify(parent);
  const recurrence = deriveRecurrenceHistoryUniverse();
  if (recurrence.status !== 'RECURRENCE_HISTORY_UNIVERSE_DERIVED_FROM_PARENT_TEMPORAL_CUSTODY') {
    return freeze({
      schema: FIRST_BOUNDED_PATH_GRAMMAR_SCHEMA,
      passed: false,
      status: 'PARENT_RECURRENCE_HISTORY_UNIVERSE_NOT_DERIVABLE',
      disposition: 'ABSTAIN_BEFORE_PATH_OBJECT_PROMOTION',
    });
  }

  const byId = new Map(recurrence.histories.map((history) => [history.id, history]));
  const R_AB_S0 = byId.get('R_AB_S0');
  const R_AB_DUP_S0 = byId.get('R_AB_DUP_S0');
  if (!R_AB_S0 || !R_AB_DUP_S0) {
    return freeze({
      schema: FIRST_BOUNDED_PATH_GRAMMAR_SCHEMA,
      passed: false,
      status: 'NONVACUOUS_ANCHOR_FIBER_MISSING',
      disposition: 'ABSTAIN_BEFORE_PATH_OBJECT_PROMOTION',
    });
  }

  const anchorHistories = freeze([R_AB_S0, R_AB_DUP_S0]);
  const anchorStateA = pathObjectProjection(R_AB_S0);
  const anchorStateB = pathObjectProjection(R_AB_DUP_S0);
  const anchorStateEqual = keyOf(anchorStateA) === keyOf(anchorStateB);
  const anchorReceiptDistinct = R_AB_S0.receipt_variant !== R_AB_DUP_S0.receipt_variant;

  const words = generateBoundedPathWords(4);
  const wordEvaluations = freeze(words.map((word) => evaluateWordAcrossAnchorRepresentatives(anchorHistories, word)));
  const allWordsRepresentativeIndependent = wordEvaluations.every((row) => row.representative_independent);
  const allReceiptDistinctionsPreserved = wordEvaluations.every((row) => row.receipt_distinction_preserved);
  const allArrowsTyped = wordEvaluations.every((row) => row.all_arrows_typed);

  const tFromAnchor = evaluatePathWord(R_AB_S0, ['T']);
  const qFromAnchor = evaluatePathWord(R_AB_S0, ['Q']);
  const mistypedComposition = composeTypedArrows(tFromAnchor.arrows[0], qFromAnchor.arrows[0]);
  const tqPath = evaluatePathWord(R_AB_S0, ['T', 'Q']);
  const lawfulTqComposition = composeTypedArrows(tqPath.arrows[0], tqPath.arrows[1]);

  const directBridgeControls = freeze(anchorHistories.flatMap((history) => [
    directBridge(history, 2, stepPsiTwoTicks),
    directBridge(history, 3, stepPsiThreeTicks),
    directBridge(history, 4, stepPsiFourTicks),
  ]));
  const directBridgesAgree = directBridgeControls.every((control) => control.equal);

  const tqAcross = evaluateWordAcrossAnchorRepresentatives(anchorHistories, ['T', 'Q']);
  const qtAcross = evaluateWordAcrossAnchorRepresentatives(anchorHistories, ['Q', 'T']);
  const routeOrderControl = freeze({
    tq_representative_independent: tqAcross.representative_independent,
    qt_representative_independent: qtAcross.representative_independent,
    tq_target_state: tqAcross.evaluations[0].target_state,
    qt_target_state: qtAcross.evaluations[0].target_state,
    tq_target_key: tqAcross.evaluations[0].target_key,
    qt_target_key: qtAcross.evaluations[0].target_key,
    target_objects_equal: tqAcross.evaluations[0].target_key === qtAcross.evaluations[0].target_key,
    classification: 'DIRECTED_PATH_WORD_ORDER_IS_OPERATIONALLY_OBSERVABLE',
  });

  const t4Across = evaluateWordAcrossAnchorRepresentatives(anchorHistories, ['T', 'T', 'T', 'T']);
  const t4Source = t4Across.evaluations[0].source_state;
  const t4Target = t4Across.evaluations[0].target_state;
  const recurrenceClosureControl = freeze({
    word: freeze(['T', 'T', 'T', 'T']),
    source_clock_phase: t4Source.clock_phase,
    target_clock_phase: t4Target.clock_phase,
    source_forcing_season: t4Source.forcing_season,
    target_forcing_season: t4Target.forcing_season,
    clock_phase_recurs: t4Source.clock_phase === t4Target.clock_phase,
    forcing_season_recurs: t4Source.forcing_season === t4Target.forcing_season,
    endpoint_recurs: keyOf(t4Source.endpoint) === keyOf(t4Target.endpoint),
    path_object_closes: t4Across.closed,
    classification: 'PARAMETER_RECURRENCE_WITHOUT_PATH_OBJECT_CLOSURE',
  });

  const closedNonemptyAnchorPaths = freeze(wordEvaluations
    .filter((row) => row.closed)
    .map((row) => freeze({ word: row.word, word_label: row.word_label })));

  const unknownGenerator = evaluatePathWord(R_AB_S0, ['X']);
  const parentSnapshotAfter = JSON.stringify(runTemporalRecurrencePhaseAliasingGauntlet());
  const parentCustodyUnchanged = parentSnapshotBefore === parentSnapshotAfter;

  const success = (
    words.length === 30
    && anchorStateEqual
    && anchorReceiptDistinct
    && allWordsRepresentativeIndependent
    && allReceiptDistinctionsPreserved
    && allArrowsTyped
    && mistypedComposition.status === 'PATH_TYPE_MISMATCH_ABSTAINS'
    && lawfulTqComposition.status === 'TYPED_PATH_COMPOSITION_ADMITTED'
    && directBridgesAgree
    && routeOrderControl.tq_representative_independent
    && routeOrderControl.qt_representative_independent
    && !routeOrderControl.target_objects_equal
    && recurrenceClosureControl.clock_phase_recurs
    && recurrenceClosureControl.forcing_season_recurs
    && !recurrenceClosureControl.endpoint_recurs
    && !recurrenceClosureControl.path_object_closes
    && closedNonemptyAnchorPaths.length === 0
    && unknownGenerator.status === 'UNDECLARED_PATH_GENERATOR_ABSTAINS'
    && parentCustodyUnchanged
  );

  return freeze({
    schema: FIRST_BOUNDED_PATH_GRAMMAR_SCHEMA,
    passed: success,
    status: success ? 'FIRST_BOUNDED_PATH_OBJECT_GRAMMAR_ROUND_CLOSED' : 'FIRST_BOUNDED_PATH_OBJECT_GRAMMAR_GAUNTLET_FAILED',
    anchor_object: freeze({
      state: anchorStateA,
      state_key: keyOf(anchorStateA),
      member_ids: freeze(anchorHistories.map((history) => history.id)),
      receipt_variants: freeze(anchorHistories.map((history) => history.receipt_variant)),
    }),
    anchor_receipt_distinct: anchorReceiptDistinct,
    anchor_state_equal: anchorStateEqual,
    object_projection: 'O(h):=K_period4(h)',
    path_grammar: freeze({
      grammar_id: 'GAMMA_PATH0',
      generators: PATH_GENERATORS,
      word_convention: 'LEFT_TO_RIGHT_EXECUTION',
      max_depth: 4,
      nonempty_words_only: true,
    }),
    bounded_words: words,
    word_evaluations: wordEvaluations,
    representative_independence: freeze({
      all_words_representative_independent: allWordsRepresentativeIndependent,
      all_state_sequences_representative_independent: wordEvaluations.every((row) => row.state_sequence_independent),
      all_receipt_distinctions_preserved: allReceiptDistinctionsPreserved,
      all_arrows_typed: allArrowsTyped,
    }),
    all_words_representative_independent: allWordsRepresentativeIndependent,
    typed_composition_control: freeze({
      mistyped: mistypedComposition,
      lawful_t_then_q: lawfulTqComposition,
    }),
    direct_bridge_controls: directBridgeControls,
    direct_bridges_agree: directBridgesAgree,
    route_order_control: routeOrderControl,
    recurrence_closure_control: recurrenceClosureControl,
    closed_nonempty_anchor_paths: closedNonemptyAnchorPaths,
    abstention_controls: freeze({ unknown_generator: unknownGenerator }),
    parent_custody_unchanged: parentCustodyUnchanged,
    canonical_classification: success
      ? 'FINITE_NONVACUOUS_DIRECTED_PATH_OBJECT_GRAMMAR_OVER_K_PERIOD4_WITH_TYPED_COMPOSITION_ROUTE_SENSITIVITY_AND_NO_NONEMPTY_DEPTH_FOUR_CLOSURE'
      : null,
    bounded_claim: success
      ? 'IN_THE_AUTHORED_FINITE_FIXTURE_THE_WITNESSED_K_PERIOD4_OPERATIONAL_EQUIVALENCE_CLASS_SUPPORTS_A_NONVACUOUS_DIRECTED_TYPED_PATH_GRAMMAR_FOR_DECLARED_PSI_TICK_AND_Q_PHASE_PULSE_GENERATORS_THROUGH_DEPTH_FOUR_EVERY_BOUNDED_WORD_IS_REPRESENTATIVE_INDEPENDENT_ACROSS_RECEIPT_DISTINCT_CUSTODY_REPRESENTATIVES_TYPED_COMPOSITION_REJECTS_SOURCE_TARGET_MISMATCH_DIRECT_MULTI_TICK_PARENT_OPERATORS_AGREE_WITH_THE_CORRESPONDING_T_WORDS_TQ_AND_QT_ARE_BOTH_LAWFUL_YET_REACH_DIFFERENT_OPERATIONAL_OBJECTS_AND_RECURRENCE_OF_CLOCK_AND_FORCING_LABELS_DOES_NOT_CLOSE_THE_PATH_OBJECT'
      : null,
    claim_ceiling: freeze({
      generic_quotient_theorem: false,
      generic_congruence_theorem: false,
      minimal_or_optimal_abstraction: false,
      markov_state_theorem: false,
      stationarity_or_ergodicity: false,
      semigroup_or_flow: false,
      formal_category: false,
      free_category: false,
      groupoid: false,
      inverse_morphisms: false,
      transport_or_connection: false,
      loop_endomorphism_or_holonomy: false,
      curvature: false,
      berry_or_quantum: false,
      operator_tomography_promotion: false,
      proto_loom: false,
      td613_general_theorem: false,
      a16: false,
      live_ash: false,
      merge: false,
      production: false,
      vercel: false,
    }),
    stop: success
      ? 'HUMAN_𝄐_QUALIFIED_FOR_FINITE_PATH_CATEGORY_AUDITION_BUT_CATEGORY_PROMOTION_NOT_YET_GRANTED_BY_THIS_CHAMBER'
      : 'PRESERVE_FAILURE_AND_RETURN_TO_HUMAN_𝄐',
  });
}
