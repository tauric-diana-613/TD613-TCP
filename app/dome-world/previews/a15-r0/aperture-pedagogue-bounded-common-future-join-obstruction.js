import {
  evaluatePathWord,
  generateBoundedPathWords,
  pathObjectProjection,
} from './aperture-pedagogue-first-bounded-path-grammar.js';
import { endpointMass, runInvertibilityAdmissibilityObstructionAssay } from './aperture-pedagogue-invertibility-admissibility-obstruction.js';
import { runDirectedReachabilityGeometryAssay } from './aperture-pedagogue-directed-reachability-geometry.js';
import { runDirectedBranchingConfluenceAssay } from './aperture-pedagogue-directed-branching-confluence.js';

export const BOUNDED_COMMON_FUTURE_JOIN_OBSTRUCTION_SCHEMA = 'td613.a15-r0.aperture-pedagogue-bounded-common-future-join-obstruction/v0.1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const keyOf = (value) => JSON.stringify(value);

function wordsThroughHorizon(horizon) {
  return freeze([freeze([]), ...generateBoundedPathWords(horizon)]);
}

function realize(history, word) {
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

function evaluateAcrossRepresentatives(histories, word) {
  const rows = histories.map((history) => realize(history, word));
  const failures = rows.filter((row) => !['IDENTITY_CONTINUATION_REALIZED', 'BOUNDED_PATH_WORD_EVALUATED'].includes(row.status));
  const targetKeys = new Set(rows.map((row) => row.target_key).filter(Boolean));
  const representativeIndependent = failures.length === 0 && rows.length === histories.length && targetKeys.size === 1;
  const canonical = representativeIndependent ? rows[0] : null;
  return freeze({
    word: freeze([...word]),
    word_label: word.length ? word.join('') : 'ID',
    representative_independent: representativeIndependent,
    rows: freeze(rows),
    failures: freeze(failures),
    target_key: canonical?.target_key ?? null,
    target_state: canonical?.target_state ?? null,
    final_history: canonical?.final_history ?? null,
    endpoint_mass: canonical ? endpointMass(canonical.final_history) : null,
  });
}

function buildCone(histories, horizon) {
  const words = wordsThroughHorizon(horizon);
  const outcomes = words.map((word) => evaluateAcrossRepresentatives(histories, word));
  const failures = outcomes.filter((row) => !row.representative_independent);
  return freeze({ horizon, word_count: words.length, words, outcomes: freeze(outcomes), failures: freeze(failures), passed: failures.length === 0 });
}

function groupOutcomes(outcomes) {
  const map = new Map();
  for (const outcome of outcomes) {
    if (!outcome.representative_independent || !outcome.target_key) continue;
    if (!map.has(outcome.target_key)) {
      map.set(outcome.target_key, {
        target_key: outcome.target_key,
        target_state: outcome.target_state,
        outcomes: [],
      });
    }
    map.get(outcome.target_key).outcomes.push(outcome);
  }
  return map;
}

function buildCommonFutureSet(fork, horizon) {
  const leftCone = buildCone(fork.left_child.histories, horizon);
  const rightCone = buildCone(fork.right_child.histories, horizon);
  if (!leftCone.passed || !rightCone.passed) {
    return freeze({ horizon, passed: false, status: 'REPRESENTATIVE_INDEPENDENCE_FAILED_IN_WIDENED_CONE', left_cone: leftCone, right_cone: rightCone });
  }

  const leftMap = groupOutcomes(leftCone.outcomes);
  const rightMap = groupOutcomes(rightCone.outcomes);
  const commonKeys = [...leftMap.keys()].filter((key) => rightMap.has(key));
  const objects = commonKeys.map((targetKey, index) => {
    const left = leftMap.get(targetKey);
    const right = rightMap.get(targetKey);
    const leftMin = Math.min(...left.outcomes.map((row) => row.word.length));
    const rightMin = Math.min(...right.outcomes.map((row) => row.word.length));
    let minimumCost = Number.POSITIVE_INFINITY;
    for (const l of left.outcomes) {
      for (const r of right.outcomes) minimumCost = Math.min(minimumCost, l.word.length + r.word.length);
    }
    const representative = left.outcomes.find((row) => row.word.length === leftMin)?.final_history ?? left.outcomes[0].final_history;
    return freeze({
      object_id: `U${horizon}_${String(index).padStart(2, '0')}`,
      target_key: targetKey,
      target_state: left.target_state,
      representative_history: representative,
      left_words: freeze(left.outcomes.map((row) => row.word)),
      right_words: freeze(right.outcomes.map((row) => row.word)),
      minimum_left_length: leftMin,
      minimum_right_length: rightMin,
      minimum_total_continuation_cost: minimumCost,
      endpoint_mass: endpointMass(representative),
      operational_lineage_length: representative.operational_lineage.length,
      operational_lineage: freeze([...representative.operational_lineage]),
      clock_phase: representative.clock_phase,
      forcing_season: representative.forcing_season,
    });
  });

  return freeze({
    horizon,
    passed: true,
    left_cone: leftCone,
    right_cone: rightCone,
    object_count: objects.length,
    objects: freeze(objects),
  });
}

function boundedReachability(commonSet) {
  const { horizon, objects } = commonSet;
  const words = wordsThroughHorizon(horizon);
  const reachableKeysBySource = new Map();
  for (const source of objects) {
    const keys = new Set();
    for (const word of words) {
      const row = realize(source.representative_history, word);
      if (['IDENTITY_CONTINUATION_REALIZED', 'BOUNDED_PATH_WORD_EVALUATED'].includes(row.status)) keys.add(row.target_key);
    }
    reachableKeysBySource.set(source.target_key, keys);
  }

  const relation = [];
  const relationLookup = new Map();
  for (const a of objects) {
    for (const b of objects) {
      const reachable = reachableKeysBySource.get(a.target_key).has(b.target_key);
      const row = freeze({ a: a.object_id, b: b.object_id, a_key: a.target_key, b_key: b.target_key, reachable });
      relation.push(row);
      relationLookup.set(`${a.target_key}=>${b.target_key}`, reachable);
    }
  }
  const reaches = (a, b) => relationLookup.get(`${a.target_key}=>${b.target_key}`) === true;

  const reflexivityFailures = objects.filter((a) => !reaches(a, a)).map((a) => a.object_id);
  const antisymmetryFailures = [];
  for (const a of objects) {
    for (const b of objects) {
      if (a.target_key !== b.target_key && reaches(a, b) && reaches(b, a)) antisymmetryFailures.push(freeze({ a: a.object_id, b: b.object_id }));
    }
  }
  const transitivityFailures = [];
  for (const a of objects) {
    for (const b of objects) {
      if (!reaches(a, b)) continue;
      for (const c of objects) {
        if (reaches(b, c) && !reaches(a, c)) transitivityFailures.push(freeze({ a: a.object_id, b: b.object_id, c: c.object_id }));
      }
    }
  }

  const passed = reflexivityFailures.length === 0 && antisymmetryFailures.length === 0 && transitivityFailures.length === 0;
  return freeze({
    horizon,
    passed,
    relation: freeze(relation),
    reflexivity_failures: freeze(reflexivityFailures),
    antisymmetry_failures: freeze(antisymmetryFailures),
    transitivity_failures: freeze(transitivityFailures),
    relation_lookup: relationLookup,
    classification: passed ? `BOUNDED_COMMON_FUTURE_REACHABILITY_IS_PARTIAL_ORDER_WITHIN_H${horizon}` : `BOUNDED_COMMON_FUTURE_REACHABILITY_ORDER_AUDITION_FAILED_AT_H${horizon}`,
  });
}

function orderProfile(commonSet, order) {
  const objects = commonSet.objects;
  const reaches = (a, b) => order.relation_lookup.get(`${a.target_key}=>${b.target_key}`) === true;
  const minimal = objects.filter((x) => !objects.some((y) => y.target_key !== x.target_key && reaches(y, x)));
  const least = objects.filter((x) => objects.every((y) => reaches(x, y)));
  const minimumCost = objects.length ? Math.min(...objects.map((x) => x.minimum_total_continuation_cost)) : null;
  const minimumCostObjects = objects.filter((x) => x.minimum_total_continuation_cost === minimumCost);
  const uniqueCheapest = minimumCostObjects.length === 1 ? minimumCostObjects[0] : null;
  const uniqueCheapestIsLeast = uniqueCheapest ? least.some((x) => x.target_key === uniqueCheapest.target_key) : false;

  let leastClassification = `NO_BOUNDED_LEAST_COMMON_FUTURE_WITHIN_H${commonSet.horizon}`;
  if (least.length === 1) leastClassification = `UNIQUE_BOUNDED_LEAST_COMMON_FUTURE_WITHIN_H${commonSet.horizon}`;
  else if (least.length > 1) leastClassification = 'MULTIPLE_LEAST_CANDIDATES_INVALIDATE_ANTISYMMETRY_ASSUMPTION';

  return freeze({
    horizon: commonSet.horizon,
    common_future_object_count: objects.length,
    minimal_common_future_count: minimal.length,
    minimal_common_futures: freeze(minimal.map((x) => freeze({
      object_id: x.object_id,
      target_key: x.target_key,
      minimum_total_continuation_cost: x.minimum_total_continuation_cost,
      endpoint_mass: x.endpoint_mass,
      operational_lineage_length: x.operational_lineage_length,
    }))),
    least_common_future_count: least.length,
    least_common_futures: freeze(least.map((x) => freeze({ object_id: x.object_id, target_key: x.target_key }))),
    least_classification: leastClassification,
    minimum_join_cost: minimumCost,
    minimum_cost_common_future_count: minimumCostObjects.length,
    minimum_cost_common_futures: freeze(minimumCostObjects.map((x) => freeze({ object_id: x.object_id, target_key: x.target_key }))),
    unique_minimum_cost_target_key: uniqueCheapest?.target_key ?? null,
    unique_minimum_cost_is_least: uniqueCheapestIsLeast,
    cost_hostile_classification: uniqueCheapest && !uniqueCheapestIsLeast
      ? 'UNIQUE_MINIMUM_COST_COMMON_FUTURE_IS_NOT_ORDER_THEORETIC_LEAST_UPPER_BOUND'
      : uniqueCheapest && uniqueCheapestIsLeast
        ? 'UNIQUE_MINIMUM_COST_COMMON_FUTURE_ALSO_BOUNDED_LEAST'
        : 'MINIMUM_COST_TARGET_NOT_UNIQUE',
    minimality_classification: minimal.length > 1
      ? `MULTIPLE_INCOMPARABLE_MINIMAL_COMMON_FUTURES_WITHIN_H${commonSet.horizon}`
      : minimal.length === 1
        ? `SINGLE_MINIMAL_COMMON_FUTURE_WITHIN_H${commonSet.horizon}`
        : `NO_MINIMAL_COMMON_FUTURE_WITHIN_H${commonSet.horizon}`,
  });
}

function auditFork(fork) {
  const horizons = [4, 5, 6].map((horizon) => {
    const common = buildCommonFutureSet(fork, horizon);
    if (!common.passed || common.object_count === 0) return freeze({ horizon, passed: false, common });
    const order = boundedReachability(common);
    if (!order.passed) return freeze({ horizon, passed: false, common, order });
    const profile = orderProfile(common, order);
    return freeze({ horizon, passed: true, common, order, profile });
  });

  const passed = horizons.every((row) => row.passed);
  const profiles = horizons.map((row) => row.profile).filter(Boolean);
  const h4 = profiles.find((row) => row.horizon === 4);
  const h5 = profiles.find((row) => row.horizon === 5);
  const h6 = profiles.find((row) => row.horizon === 6);
  const cheapestStable = h4 && h5 && h6
    ? h4.unique_minimum_cost_target_key !== null
      && h4.unique_minimum_cost_target_key === h5.unique_minimum_cost_target_key
      && h5.unique_minimum_cost_target_key === h6.unique_minimum_cost_target_key
      && h4.minimum_join_cost === h5.minimum_join_cost
      && h5.minimum_join_cost === h6.minimum_join_cost
    : false;
  const noLeastThroughH6 = profiles.length === 3 && profiles.every((row) => row.least_common_future_count === 0);
  const frontierCounts = profiles.map((row) => row.minimal_common_future_count);
  const frontierChanges = new Set(frontierCounts).size > 1;

  return freeze({
    source_node_id: fork.source_node_id,
    passed,
    horizons: freeze(horizons),
    profile_tuple: freeze(profiles.flatMap((row) => [
      row.common_future_object_count,
      row.minimal_common_future_count,
      row.least_common_future_count,
    ]).concat(h4 ? [h4.minimum_join_cost] : [])),
    cheapest_target_stable_H4_H6: cheapestStable,
    no_least_through_H6: noLeastThroughH6,
    minimal_frontier_counts: freeze(frontierCounts),
    minimal_frontier_changes: frontierChanges,
    horizon_classification: noLeastThroughH6 && frontierChanges
      ? 'BOUNDED_LEAST_COMMON_FUTURE_NOT_STABILIZED_THROUGH_H6'
      : noLeastThroughH6
        ? 'NO_BOUNDED_LEAST_COMMON_FUTURE_THROUGH_H6_WITH_STABLE_MINIMAL_COUNT'
        : 'BOUNDED_LEAST_COMMON_FUTURE_APPEARS_WITHIN_TESTED_HORIZONS',
  });
}

export function runBoundedCommonFutureJoinObstructionAssay() {
  const parent = runDirectedBranchingConfluenceAssay();
  const geometry = runDirectedReachabilityGeometryAssay();
  const obstruction = runInvertibilityAdmissibilityObstructionAssay();
  if (!parent?.passed || !geometry?.passed || !obstruction?.passed) {
    return freeze({
      schema: BOUNDED_COMMON_FUTURE_JOIN_OBSTRUCTION_SCHEMA,
      passed: false,
      status: 'PARENT_DIRECTED_CONFLUENCE_NOT_WITNESSED_BY_EXECUTABLE',
      disposition: 'ABSTAIN_BEFORE_BOUNDED_JOIN_AUDITION',
    });
  }

  const parentBefore = JSON.stringify(parent);
  const geometryBefore = JSON.stringify(geometry);
  const obstructionBefore = JSON.stringify(obstruction);

  const reconvergentForks = parent.forks.filter((fork) => fork.strict_reconvergence_hit_count > 0);
  const silentForks = parent.forks.filter((fork) => fork.common_future_hit_count === 0);
  const audits = reconvergentForks.map(auditFork);
  const auditFailures = audits.filter((row) => !row.passed);

  const tupleKeys = new Set(audits.map((row) => keyOf(row.profile_tuple)));
  const sharedProfile = audits.length > 0 && tupleKeys.size === 1;
  const allNoLeastThroughH6 = audits.length > 0 && audits.every((row) => row.no_least_through_H6);
  const allCheapestStable = audits.length > 0 && audits.every((row) => row.cheapest_target_stable_H4_H6);
  const allCostHostilesFire = audits.every((row) => row.horizons.every((h) => h.profile?.cost_hostile_classification === 'UNIQUE_MINIMUM_COST_COMMON_FUTURE_IS_NOT_ORDER_THEORETIC_LEAST_UPPER_BOUND'));

  const parentAfter = JSON.stringify(runDirectedBranchingConfluenceAssay());
  const geometryAfter = JSON.stringify(runDirectedReachabilityGeometryAssay());
  const obstructionAfter = JSON.stringify(runInvertibilityAdmissibilityObstructionAssay());
  const parentCustodyUnchanged = parentBefore === parentAfter && geometryBefore === geometryAfter && obstructionBefore === obstructionAfter;

  const pureTControls = silentForks.map((fork) => freeze({
    source_node_id: fork.source_node_id,
    source_min_depth: fork.source_min_depth,
    parent_classification: fork.confluence_classification,
    retained_as_H4_bounded_control: fork.confluence_classification === 'NO_COMMON_FUTURE_FOUND_WITHIN_H4',
  }));

  const success = (
    reconvergentForks.length === 11
    && silentForks.length === 4
    && audits.length === 11
    && auditFailures.length === 0
    && pureTControls.every((row) => row.retained_as_H4_bounded_control)
    && parentCustodyUnchanged
  );

  return freeze({
    schema: BOUNDED_COMMON_FUTURE_JOIN_OBSTRUCTION_SCHEMA,
    passed: success,
    status: success ? 'BOUNDED_COMMON_FUTURE_JOIN_OBSTRUCTION_ROUND_CLOSED' : 'BOUNDED_COMMON_FUTURE_JOIN_OBSTRUCTION_AUDITION_FAILED',
    reconvergent_fork_count: reconvergentForks.length,
    silent_H4_control_count: silentForks.length,
    fork_audits: freeze(audits),
    cross_fork_profile_shared: sharedProfile,
    cross_fork_classification: sharedProfile
      ? 'RECONVERGENT_FORKS_SHARE_COMMON_BOUNDED_UPPER_BOUND_PROFILE_THROUGH_H6'
      : 'RECONVERGENT_FORK_BOUNDED_UPPER_BOUND_PROFILES_DIVERGE',
    all_no_least_through_H6: allNoLeastThroughH6,
    all_unique_cheapest_stable_H4_H6: allCheapestStable,
    all_minimum_cost_hostiles_fire: allCostHostilesFire,
    pure_T_spine_controls: freeze(pureTControls),
    parent_custody_unchanged: parentCustodyUnchanged,
    parent_custody_classification: parentCustodyUnchanged ? 'PARENT_718_719_720_CUSTODY_UNCHANGED' : 'PARENT_CUSTODY_MUTATION_DETECTED',
    canonical_classification: success
      ? 'FINITE_H4_H5_H6_COMMON_FUTURE_ORDER_AUDIT_WITH_MINIMUM_COST_LEASTNESS_SEPARATION_AND_BOUNDED_JOIN_OBSTRUCTION'
      : null,
    bounded_claim: success
      ? 'IN_THE_ELEVEN_AUTHORED_RECONVERGENT_FORKS_COMMON_FUTURE_OBJECTS_ARE_EXACTLY_RECONSTRUCTED_AT_H4_H5_H6_AND_ORDERED_BY_BOUNDED_FORWARD_REACHABILITY_MINIMAL_AND_LEAST_COMMON_FUTURES_ARE_COMPUTED_SEPARATELY_FROM_MINIMUM_CONTINUATION_COST_AND_THE_FOUR_PARENT_H4_SILENT_FORKS_REMAIN_UNWIDENED_BOUNDED_CONTROLS'
      : null,
    anti_equivalences: freeze([
      'MINIMUM_COST_IS_NOT_ORDER_THEORETIC_LEAST',
      'UNIQUE_CHEAPEST_TARGET_IS_NOT_LEAST_UPPER_BOUND',
      'MINIMAL_IS_NOT_LEAST',
      'COMMON_FUTURE_IS_NOT_JOIN',
      'BOUNDED_LEAST_IS_NOT_AMBIENT_LEAST',
      'NO_BOUNDED_LEAST_IS_NOT_NO_AMBIENT_LEAST',
      'HORIZON_STABILITY_IS_NOT_THEOREM_BEYOND_TESTED_HORIZONS',
    ]),
    claim_ceiling: freeze({
      ambient_join: false,
      join_semilattice: false,
      lattice: false,
      church_rosser: false,
      global_confluence: false,
      domain_theory: false,
      scott_order: false,
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
      ? 'HUMAN_𝄐_QUALIFIED_FOR_DIRECTED_FUTURE_CONE_STRATIFICATION_AUDITION'
      : 'PRESERVE_FAILURE_AND_RETURN_TO_HUMAN_𝄐',
  });
}
