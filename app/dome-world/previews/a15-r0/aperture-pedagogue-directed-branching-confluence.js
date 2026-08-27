import {
  applyPathGenerator,
  evaluatePathWord,
  generateBoundedPathWords,
  pathObjectProjection,
} from './aperture-pedagogue-first-bounded-path-grammar.js';
import { runFinitePathCategoryAudition } from './aperture-pedagogue-finite-path-category-audition.js';
import {
  endpointMass,
  runInvertibilityAdmissibilityObstructionAssay,
} from './aperture-pedagogue-invertibility-admissibility-obstruction.js';
import { runDirectedReachabilityGeometryAssay } from './aperture-pedagogue-directed-reachability-geometry.js';

export const DIRECTED_BRANCHING_CONFLUENCE_SCHEMA = 'td613.a15-r0.aperture-pedagogue-directed-branching-confluence/v0.1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const keyOf = (value) => JSON.stringify(value);

function wordsThroughHorizon(maxDepth = 4) {
  return freeze([freeze([]), ...generateBoundedPathWords(maxDepth)]);
}

function realizeWord(history, word) {
  if (word.length === 0) {
    const state = pathObjectProjection(history);
    return freeze({
      status: 'IDENTITY_CONTINUATION_REALIZED',
      word: freeze([]),
      word_label: 'ID',
      final_history: history,
      target_state: state,
      target_key: keyOf(state),
      final_receipt_variant: history.receipt_variant ?? null,
    });
  }
  return evaluatePathWord(history, word);
}

function deriveChild(node, generator) {
  const rows = [];
  const failures = [];
  const targetKeys = new Set();
  const targetStates = new Map();
  const histories = [];

  for (const representative of node.representatives) {
    const child = applyPathGenerator(representative.history, generator);
    if (child?.status) {
      failures.push(freeze({
        source_node_id: node.node_id,
        source_history_id: representative.history.id,
        generator,
        abstention: child,
      }));
      continue;
    }
    const state = pathObjectProjection(child);
    const targetKey = keyOf(state);
    targetKeys.add(targetKey);
    targetStates.set(targetKey, state);
    histories.push(child);
    rows.push(freeze({
      source_history_id: representative.history.id,
      source_receipt_variant: representative.receipt_variant,
      child_history_id: child.id,
      child_receipt_variant: child.receipt_variant ?? null,
      target_key: targetKey,
      target_state: state,
      endpoint_mass: endpointMass(child),
    }));
  }

  const representativeIndependent = failures.length === 0
    && histories.length === node.representatives.length
    && targetKeys.size === 1;

  return freeze({
    generator,
    source_node_id: node.node_id,
    representative_independent: representativeIndependent,
    rows: freeze(rows),
    failures: freeze(failures),
    histories: freeze(histories),
    target_key: representativeIndependent ? [...targetKeys][0] : null,
    target_state: representativeIndependent ? targetStates.get([...targetKeys][0]) : null,
    endpoint_mass: representativeIndependent ? endpointMass(histories[0]) : null,
    receipt_variants: freeze(histories.map((history) => history.receipt_variant ?? null)),
  });
}

function evaluateContinuationAcrossRepresentatives(child, word) {
  const evaluations = [];
  const targetKeys = new Set();
  const targetStates = new Map();
  const failures = [];

  for (const history of child.histories) {
    const result = realizeWord(history, word);
    if (!['IDENTITY_CONTINUATION_REALIZED', 'BOUNDED_PATH_WORD_EVALUATED'].includes(result.status)) {
      failures.push(freeze({ history_id: history.id, word: freeze([...word]), abstention: result }));
      continue;
    }
    targetKeys.add(result.target_key);
    targetStates.set(result.target_key, result.target_state);
    evaluations.push(result);
  }

  const representativeIndependent = failures.length === 0
    && evaluations.length === child.histories.length
    && targetKeys.size === 1;
  const canonical = representativeIndependent ? evaluations[0] : null;

  return freeze({
    word: freeze([...word]),
    word_label: word.length ? word.join('') : 'ID',
    representative_independent: representativeIndependent,
    evaluations: freeze(evaluations),
    failures: freeze(failures),
    target_key: canonical?.target_key ?? null,
    target_state: canonical?.target_state ?? null,
    final_history: canonical?.final_history ?? null,
    endpoint_mass: canonical ? endpointMass(canonical.final_history) : null,
    final_receipt_variants: freeze(evaluations.map((row) => row.final_receipt_variant)),
  });
}

function buildContinuationCone(child, words) {
  const outcomes = words.map((word) => evaluateContinuationAcrossRepresentatives(child, word));
  const failures = outcomes.filter((row) => !row.representative_independent);
  return freeze({
    generator: child.generator,
    word_count: words.length,
    outcomes: freeze(outcomes),
    failures: freeze(failures),
    passed: failures.length === 0,
  });
}

function compareFork(node, words) {
  const left = deriveChild(node, 'T');
  const right = deriveChild(node, 'Q');
  const derivationPassed = left.representative_independent && right.representative_independent;
  if (!derivationPassed) {
    return freeze({
      source_node_id: node.node_id,
      passed: false,
      status: 'FORK_CHILD_REPRESENTATIVE_INDEPENDENCE_FAILED',
      left,
      right,
    });
  }

  const childrenEqual = left.target_key === right.target_key;
  const leftCone = buildContinuationCone(left, words);
  const rightCone = buildContinuationCone(right, words);
  const conesPassed = leftCone.passed && rightCone.passed;

  const localTQ = leftCone.outcomes.find((row) => row.word_label === 'Q');
  const localQT = rightCone.outcomes.find((row) => row.word_label === 'T');
  const localSquareCommutes = localTQ?.target_key === localQT?.target_key;

  const leftReachesRight = leftCone.outcomes.some((row) => row.target_key === right.target_key);
  const rightReachesLeft = rightCone.outcomes.some((row) => row.target_key === left.target_key);
  const childComparable = leftReachesRight || rightReachesLeft;

  const hits = [];
  let comparisonCount = 0;
  for (const l of leftCone.outcomes) {
    for (const r of rightCone.outcomes) {
      comparisonCount += 1;
      if (!l.representative_independent || !r.representative_independent) continue;
      if (l.target_key !== r.target_key) continue;
      const leftTotal = freeze(['T', ...l.word]);
      const rightTotal = freeze(['Q', ...r.word]);
      const routesDistinct = keyOf(leftTotal) !== keyOf(rightTotal);
      const leftMass = l.endpoint_mass;
      const rightMass = r.endpoint_mass;
      hits.push(freeze({
        source_node_id: node.node_id,
        left_continuation: l.word,
        right_continuation: r.word,
        left_total_route: leftTotal,
        right_total_route: rightTotal,
        left_continuation_length: l.word.length,
        right_continuation_length: r.word.length,
        left_total_route_length: leftTotal.length,
        right_total_route_length: rightTotal.length,
        both_continuations_nonempty: l.word.length > 0 && r.word.length > 0,
        target_key: l.target_key,
        target_state: l.target_state,
        left_endpoint_mass: leftMass,
        right_endpoint_mass: rightMass,
        endpoint_mass_equal: leftMass === rightMass,
        routes_distinct: routesDistinct,
        left_receipt_variants: l.final_receipt_variants,
        right_receipt_variants: r.final_receipt_variants,
        join_cost: l.word.length + r.word.length,
      }));
    }
  }

  const strictHits = hits.filter((hit) => hit.both_continuations_nonempty);
  const minimumCost = hits.length ? Math.min(...hits.map((hit) => hit.join_cost)) : null;
  const minimumCostHits = hits.filter((hit) => hit.join_cost === minimumCost);
  const unequalRouteLengthHits = hits.filter((hit) => hit.left_total_route_length !== hit.right_total_route_length);
  const allHitsRespectEquality = hits.every((hit) => hit.endpoint_mass_equal && hit.routes_distinct);

  let confluenceClassification = 'NO_COMMON_FUTURE_FOUND_WITHIN_H4';
  if (strictHits.length > 0) confluenceClassification = 'STRICT_FORWARD_RECONVERGENCE_WITNESSED_WITHIN_H4';
  else if (hits.length > 0) confluenceClassification = 'ONE_SIDED_COMPARABILITY_JOIN_WITNESSED_WITHIN_H4';

  return freeze({
    source_node_id: node.node_id,
    source_key: node.key,
    source_min_depth: node.min_depth,
    passed: derivationPassed && conesPassed && comparisonCount === words.length ** 2 && allHitsRespectEquality,
    status: 'DIRECTED_FORK_AUDITED',
    left_child: left,
    right_child: right,
    children_equal: childrenEqual,
    nontrivial_fork: !childrenEqual,
    local_square: freeze({
      T_then_Q_target_key: localTQ?.target_key ?? null,
      Q_then_T_target_key: localQT?.target_key ?? null,
      commutes: localSquareCommutes,
      classification: localSquareCommutes ? 'LOCAL_TQ_QT_SQUARE_COMMUTES' : 'LOCAL_TQ_QT_ORDER_SENSITIVE',
    }),
    child_comparability: freeze({
      left_reaches_right_within_H4: leftReachesRight,
      right_reaches_left_within_H4: rightReachesLeft,
      comparable_within_H4: childComparable,
      classification: childComparable ? 'CHILDREN_COMPARABLE_WITHIN_H4' : 'CHILDREN_INCOMPARABLE_WITHIN_H4',
    }),
    continuation_horizon: 4,
    continuation_words_per_child: words.length,
    continuation_pair_comparison_count: comparisonCount,
    left_cone: leftCone,
    right_cone: rightCone,
    common_future_hits: freeze(hits),
    common_future_hit_count: hits.length,
    strict_reconvergence_hits: freeze(strictHits),
    strict_reconvergence_hit_count: strictHits.length,
    minimum_join_cost: minimumCost,
    minimum_cost_hits: freeze(minimumCostHits),
    unequal_total_route_length_hits: freeze(unequalRouteLengthHits),
    confluence_classification: confluenceClassification,
    provenance_classification: hits.length > 0
      ? 'COMMON_OPERATIONAL_FUTURE_DOES_NOT_ERASE_ROUTE_PROVENANCE'
      : 'NO_COMMON_FUTURE_PROVENANCE_COLLISION_TO_AUDIT',
    height_route_classification: unequalRouteLengthHits.length > 0
      ? 'EQUAL_TARGET_HEIGHT_WITH_UNEQUAL_ROUTE_LENGTHS'
      : 'NO_EQUAL_TARGET_UNEQUAL_ROUTE_LENGTH_WITNESS_WITHIN_H4',
  });
}

function classifyRootFork(rootFork) {
  if (rootFork.strict_reconvergence_hit_count > 0) return 'ROOT_STRICT_FORWARD_RECONVERGENCE_WITHIN_H4';
  if (rootFork.common_future_hit_count > 0) return 'ROOT_ONE_SIDED_JOIN_WITHIN_H4';
  return 'ROOT_NO_COMMON_FUTURE_WITHIN_H4';
}

export function runDirectedBranchingConfluenceAssay() {
  const geometry = runDirectedReachabilityGeometryAssay();
  const obstruction = runInvertibilityAdmissibilityObstructionAssay();
  const category = runFinitePathCategoryAudition();
  if (!geometry?.passed || !obstruction?.passed || !category?.passed) {
    return freeze({
      schema: DIRECTED_BRANCHING_CONFLUENCE_SCHEMA,
      passed: false,
      status: 'PARENT_DIRECTED_GEOMETRY_NOT_WITNESSED_BY_EXECUTABLE',
      disposition: 'ABSTAIN_BEFORE_DIRECTED_BRANCHING_CONFLUENCE',
    });
  }

  const geometryBefore = JSON.stringify(geometry);
  const obstructionBefore = JSON.stringify(obstruction);
  const words = wordsThroughHorizon(4);
  const forks = category.finite_slice.nodes.map((node) => compareFork(node, words));
  const rootFork = forks.find((fork) => fork.source_min_depth === 0) ?? null;

  const forkFailures = forks.filter((fork) => !fork.passed);
  const allPairCountsExact = forks.every((fork) => fork.continuation_pair_comparison_count === 961);
  const rootNontrivial = rootFork?.nontrivial_fork === true;
  const allHitsPreserveRouteDistinction = forks.every((fork) => fork.common_future_hits.every((hit) => hit.routes_distinct));
  const allHitsPreserveEndpointEquality = forks.every((fork) => fork.common_future_hits.every((hit) => hit.endpoint_mass_equal));

  const rootClassification = rootFork ? classifyRootFork(rootFork) : null;
  const census = freeze({
    fork_source_count: forks.length,
    nontrivial_fork_count: forks.filter((fork) => fork.nontrivial_fork).length,
    local_commuting_square_count: forks.filter((fork) => fork.local_square.commutes).length,
    local_noncommuting_square_count: forks.filter((fork) => !fork.local_square.commutes).length,
    bounded_child_comparable_count: forks.filter((fork) => fork.child_comparability.comparable_within_H4).length,
    bounded_child_incomparable_count: forks.filter((fork) => !fork.child_comparability.comparable_within_H4).length,
    bounded_common_future_fork_count: forks.filter((fork) => fork.common_future_hit_count > 0).length,
    strict_reconvergence_fork_count: forks.filter((fork) => fork.strict_reconvergence_hit_count > 0).length,
    no_common_future_within_H4_count: forks.filter((fork) => fork.common_future_hit_count === 0).length,
    unequal_route_length_confluence_fork_count: forks.filter((fork) => fork.unequal_total_route_length_hits.length > 0).length,
  });

  const geometryAfter = JSON.stringify(runDirectedReachabilityGeometryAssay());
  const obstructionAfter = JSON.stringify(runInvertibilityAdmissibilityObstructionAssay());
  const parentCustodyUnchanged = geometryBefore === geometryAfter && obstructionBefore === obstructionAfter;

  const success = (
    words.length === 31
    && forks.length === category.finite_slice.nodes.length
    && forkFailures.length === 0
    && allPairCountsExact
    && rootNontrivial
    && allHitsPreserveRouteDistinction
    && allHitsPreserveEndpointEquality
    && rootClassification !== null
    && parentCustodyUnchanged
  );

  return freeze({
    schema: DIRECTED_BRANCHING_CONFLUENCE_SCHEMA,
    passed: success,
    status: success ? 'DIRECTED_BRANCHING_CONFLUENCE_ROUND_CLOSED' : 'DIRECTED_BRANCHING_CONFLUENCE_AUDITION_FAILED',
    continuation_horizon: 4,
    continuation_words: words,
    continuation_word_count: words.length,
    expected_pair_comparisons_per_fork: 961,
    forks: freeze(forks),
    root_fork: rootFork,
    root_classification: rootClassification,
    census,
    parent_custody_unchanged: parentCustodyUnchanged,
    parent_custody_classification: parentCustodyUnchanged ? 'PARENT_718_719_CUSTODY_UNCHANGED' : 'PARENT_CUSTODY_MUTATION_DETECTED',
    canonical_classification: success
      ? `FINITE_H4_DIRECTED_BRANCHING_CONFLUENCE_CENSUS_WITH_${rootClassification}`
      : null,
    bounded_claim: success
      ? 'IN_THE_AUTHORED_S3_SOURCE_SET_EVERY_SOURCE_ADMITS_REPRESENTATIVE_INDEPENDENT_T_AND_Q_FUTURES_ALL_THIRTY_ONE_CONTINUATIONS_PER_CHILD_AND_NINE_HUNDRED_SIXTY_ONE_CONTINUATION_PAIRS_PER_FORK_ARE_EXHAUSTIVELY_COMPARED_AT_COMPLETE_K_PERIOD4_EQUALITY_AND_ANY_COMMON_FUTURE_IS_RECORDED_WITH_DISTINCT_ROUTE_PROVENANCE_WHILE_ABSENCE_OF_A_COMMON_FUTURE_IS_CLASSIFIED_ONLY_THROUGH_THE_DECLARED_H4_HORIZON'
      : null,
    anti_equivalences: freeze([
      'BRANCHING_IS_NOT_PERMANENT_DIVERGENCE',
      'NO_BOUNDED_JOIN_IS_NOT_NO_FUTURE_JOIN',
      'COMMON_FUTURE_IS_NOT_INVERSE',
      'COMMON_FUTURE_IS_NOT_LOOP',
      'COMMON_FUTURE_IS_NOT_SAME_ROUTE',
      'SAME_ENDPOINT_IS_NOT_SAME_CUSTODY_HISTORY',
      'LOCAL_NONCOMMUTATION_IS_NOT_GLOBAL_NONCONFLUENCE',
    ]),
    claim_ceiling: freeze({
      church_rosser: false,
      global_confluence: false,
      permanent_irrecoverable_fork: false,
      lattice_or_semilattice: false,
      least_upper_bound: false,
      domain_theory: false,
      causal_set_theorem: false,
      inverse_morphisms: false,
      groupoid: false,
      transport_or_connection: false,
      loop_endomorphism: false,
      holonomy: false,
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
      ? 'HUMAN_𝄐_QUALIFIED_FOR_BOUNDED_FUTURE_CONE_AND_JOIN_STRUCTURE_AUDITION'
      : 'PRESERVE_FAILURE_AND_RETURN_TO_HUMAN_𝄐',
  });
}
