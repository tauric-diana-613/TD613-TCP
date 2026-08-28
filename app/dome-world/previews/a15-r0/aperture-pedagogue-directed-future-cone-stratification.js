import {
  evaluatePathWord,
  generateBoundedPathWords,
  pathObjectProjection,
} from './aperture-pedagogue-first-bounded-path-grammar.js';
import { runInvertibilityAdmissibilityObstructionAssay } from './aperture-pedagogue-invertibility-admissibility-obstruction.js';
import { runDirectedReachabilityGeometryAssay } from './aperture-pedagogue-directed-reachability-geometry.js';
import { runDirectedBranchingConfluenceAssay } from './aperture-pedagogue-directed-branching-confluence.js';
import { runBoundedCommonFutureJoinObstructionAssay } from './aperture-pedagogue-bounded-common-future-join-obstruction.js';

export const DIRECTED_FUTURE_CONE_STRATIFICATION_SCHEMA = 'td613.a15-r0.aperture-pedagogue-directed-future-cone-stratification/v0.1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const keyOf = (value) => JSON.stringify(value);
const seasonIndex = { S0: 0, S1: 1, S2: 2, S3: 3 };
const seasonPlusTwo = { S0: 'S2', S1: 'S3', S2: 'S0', S3: 'S1' };
const oppositePhaseQuestionCoordinate = { P0: 0, P1: 3 };

function wordsThrough(h) {
  return freeze([freeze([]), ...generateBoundedPathWords(h)]);
}

function realize(history, word) {
  if (word.length === 0) {
    const targetState = pathObjectProjection(history);
    return freeze({
      status: 'IDENTITY_CONTINUATION_REALIZED',
      word: freeze([]),
      final_history: history,
      target_state: targetState,
      target_key: keyOf(targetState),
    });
  }
  return evaluatePathWord(history, word);
}

function acrossRepresentatives(histories, word) {
  const rows = histories.map((history) => realize(history, word));
  const valid = rows.every((row) => ['IDENTITY_CONTINUATION_REALIZED', 'BOUNDED_PATH_WORD_EVALUATED'].includes(row.status));
  const keys = new Set(rows.map((row) => row.target_key).filter(Boolean));
  return freeze({
    word: freeze([...word]),
    rows: freeze(rows),
    representative_independent: valid && rows.length === histories.length && keys.size === 1,
    target_key: valid && keys.size === 1 ? rows[0].target_key : null,
    target_state: valid && keys.size === 1 ? rows[0].target_state : null,
    final_history: valid && keys.size === 1 ? rows[0].final_history : null,
  });
}

function buildH7Common(fork) {
  const words = wordsThrough(7);
  const left = words.map((word) => acrossRepresentatives(fork.left_child.histories, word));
  const right = words.map((word) => acrossRepresentatives(fork.right_child.histories, word));
  if (left.some((row) => !row.representative_independent) || right.some((row) => !row.representative_independent)) {
    return freeze({ passed: false, status: 'H7_REPRESENTATIVE_INDEPENDENCE_FAILED' });
  }

  const group = (rows) => {
    const map = new Map();
    for (const row of rows) {
      if (!map.has(row.target_key)) map.set(row.target_key, []);
      map.get(row.target_key).push(row);
    }
    return map;
  };
  const lm = group(left);
  const rm = group(right);
  const keys = [...lm.keys()].filter((key) => rm.has(key));
  const objects = keys.map((targetKey, i) => {
    const L = lm.get(targetKey);
    const R = rm.get(targetKey);
    let minCost = Number.POSITIVE_INFINITY;
    for (const l of L) for (const r of R) minCost = Math.min(minCost, l.word.length + r.word.length);
    return freeze({
      object_id: `H7U_${String(i).padStart(2, '0')}`,
      target_key: targetKey,
      target_state: L[0].target_state,
      representative_history: L[0].final_history,
      left_words: freeze(L.map((row) => row.word)),
      right_words: freeze(R.map((row) => row.word)),
      minimum_total_continuation_cost: minCost,
    });
  });

  const reachWords = words;
  const reach = new Map();
  for (const x of objects) {
    const targetKeys = new Set(reachWords.map((word) => realize(x.representative_history, word).target_key));
    for (const y of objects) reach.set(`${x.target_key}=>${y.target_key}`, targetKeys.has(y.target_key));
  }
  const reaches = (x, y) => reach.get(`${x.target_key}=>${y.target_key}`) === true;
  const reflexive = objects.every((x) => reaches(x, x));
  const antisymmetric = objects.every((x) => objects.every((y) => x.target_key === y.target_key || !(reaches(x, y) && reaches(y, x))));
  const transitive = objects.every((x) => objects.every((y) => !reaches(x, y) || objects.every((z) => !(reaches(y, z) && !reaches(x, z)))));
  const minimal = objects.filter((x) => !objects.some((y) => y.target_key !== x.target_key && reaches(y, x)));
  const least = objects.filter((x) => objects.every((y) => reaches(x, y)));
  const minimumCost = Math.min(...objects.map((x) => x.minimum_total_continuation_cost));

  return freeze({
    passed: reflexive && antisymmetric && transitive,
    horizon: 7,
    continuation_word_count: words.length,
    object_count: objects.length,
    objects: freeze(objects),
    minimal_target_keys: freeze(minimal.map((x) => x.target_key)),
    minimal_common_future_count: minimal.length,
    least_common_future_count: least.length,
    minimum_join_cost: minimumCost,
    reachability_relation: reach,
    order_checks: freeze({ reflexive, antisymmetric, transitive }),
  });
}

function parseSource(fork) {
  return JSON.parse(fork.source_key);
}

function qCount(lineage) {
  return lineage.filter((x) => x === 'Q_PHASE_PULSE').length;
}

function endpointMass(state) {
  return state.endpoint.flat().reduce((sum, value) => sum + value, 0);
}

function endpointVector(state) {
  return state.endpoint.flat();
}

function shortestWordsForTarget(common, targetKey) {
  const object = common.objects.find((x) => x.target_key === targetKey);
  if (!object) return null;
  const minLen = (words) => Math.min(...words.map((w) => w.length));
  const lmin = minLen(object.left_words);
  const rmin = minLen(object.right_words);
  return freeze({
    left_min_length: lmin,
    right_min_length: rmin,
    left_min_words: freeze(object.left_words.filter((w) => w.length === lmin)),
    right_min_words: freeze(object.right_words.filter((w) => w.length === rmin)),
  });
}

function parentHorizonView(parentAudit, horizon) {
  const row = parentAudit.horizons.find((x) => x.horizon === horizon);
  if (!row?.passed) return null;
  return freeze({
    horizon,
    object_count: row.common.object_count,
    objects: row.common.objects,
    minimal_target_keys: freeze(row.profile.minimal_common_futures.map((x) => x.target_key)),
    minimal_common_future_count: row.profile.minimal_common_future_count,
    least_common_future_count: row.profile.least_common_future_count,
    minimum_join_cost: row.profile.minimum_join_cost,
    reachability_relation: row.order.relation_lookup,
    order_checks: freeze({
      reflexive: row.order.reflexivity_failures.length === 0,
      antisymmetric: row.order.antisymmetry_failures.length === 0,
      transitive: row.order.transitivity_failures.length === 0,
    }),
  });
}

function expectedRoute(k, side) {
  const qs = Array.from({ length: k }, () => 'Q');
  return side === 'left' ? freeze([...qs, 'T', 'Q']) : freeze(['T', ...qs, 'T']);
}

function analyzeFrontier(fork, common) {
  const source = parseSource(fork);
  const sourceQ = qCount(source.operational_lineage);
  const sourceMass = endpointMass(source);
  const sourcePhase = source.clock_phase;
  const sourceSeason = source.forcing_season;
  const minimalObjects = common.minimal_target_keys.map((key) => common.objects.find((x) => x.target_key === key));
  const strata = minimalObjects.map((object) => {
    const state = object.target_state;
    const qIncrement = qCount(state.operational_lineage) - sourceQ;
    const wordInfo = shortestWordsForTarget(common, object.target_key);
    return freeze({
      target_key: object.target_key,
      question_lineage_increment: qIncrement,
      lineage_length_increment: state.operational_lineage.length - source.operational_lineage.length,
      endpoint_mass_gain: endpointMass(state) - sourceMass,
      endpoint_vector: freeze(endpointVector(state)),
      clock_phase: state.clock_phase,
      forcing_season: state.forcing_season,
      minimum_total_continuation_cost: object.minimum_total_continuation_cost,
      route_info: wordInfo,
    });
  }).sort((a, b) => a.question_lineage_increment - b.question_lineage_increment);

  const qIncrements = strata.map((x) => x.question_lineage_increment);
  const consecutiveQ = qIncrements.every((value, i) => i === 0 || value === qIncrements[i - 1] + 1);
  const oneBased = qIncrements.every((value, i) => value === i + 1);
  const sharedPhase = new Set(strata.map((x) => x.clock_phase)).size === 1;
  const sharedSeason = new Set(strata.map((x) => x.forcing_season)).size === 1;
  const phasePreserved = sharedPhase && strata.every((x) => x.clock_phase === sourcePhase);
  const seasonPlus2 = sharedSeason && strata.every((x) => x.forcing_season === seasonPlusTwo[sourceSeason]);

  const adjacent = [];
  for (let i = 1; i < strata.length; i += 1) {
    const prev = strata[i - 1].endpoint_vector;
    const curr = strata[i].endpoint_vector;
    const diff = curr.map((value, j) => value - prev[j]);
    const nonzero = diff.map((value, j) => ({ value, j })).filter((x) => x.value !== 0);
    adjacent.push(freeze({ diff: freeze(diff), nonzero_count: nonzero.length, coordinate: nonzero.length === 1 ? nonzero[0].j : null, increment: nonzero.length === 1 ? nonzero[0].value : null }));
  }
  const coordinateSet = new Set(adjacent.map((x) => x.coordinate));
  const unitSingleCoordinate = adjacent.every((x) => x.nonzero_count === 1 && x.increment === 1) && coordinateSet.size <= 1;
  const varyingCoordinate = adjacent.length && unitSingleCoordinate ? adjacent[0].coordinate : null;
  const oppositeCoordinateMatched = varyingCoordinate !== null && varyingCoordinate === oppositePhaseQuestionCoordinate[sourcePhase];

  const routeRows = strata.map((stratum, k) => {
    const expectedLeft = expectedRoute(k, 'left');
    const expectedRight = expectedRoute(k, 'right');
    const leftMatch = stratum.route_info.left_min_words.some((w) => keyOf(w) === keyOf(expectedLeft));
    const rightMatch = stratum.route_info.right_min_words.some((w) => keyOf(w) === keyOf(expectedRight));
    return freeze({ k, expected_left: expectedLeft, expected_right: expectedRight, left_match: leftMatch, right_match: rightMatch, route_normal_form_matches: leftMatch && rightMatch });
  });
  const routeNormalForm = routeRows.every((x) => x.route_normal_form_matches);
  const affineCost = strata.every((x, k) => x.minimum_total_continuation_cost === 2 * k + 4);

  const reaches = (a, b) => common.reachability_relation.get(`${a.target_key}=>${b.target_key}`) === true;
  const antichain = minimalObjects.every((a) => minimalObjects.every((b) => a.target_key === b.target_key || (!reaches(a, b) && !reaches(b, a))));

  return freeze({
    horizon: common.horizon,
    source_phase: sourcePhase,
    source_season: sourceSeason,
    source_season_index: seasonIndex[sourceSeason],
    source_question_count: sourceQ,
    source_endpoint_mass: sourceMass,
    strata: freeze(strata),
    frontier_width: strata.length,
    question_lineage_increments: freeze(qIncrements),
    consecutive_question_lineage: consecutiveQ,
    one_based_question_lineage_interval: oneBased,
    shared_frontier_phase: sharedPhase,
    shared_frontier_season: sharedSeason,
    frontier_preserves_source_phase: phasePreserved,
    frontier_is_source_plus_two_seasons: seasonPlus2,
    adjacent_endpoint_differences: freeze(adjacent),
    unit_single_coordinate_stratification: unitSingleCoordinate,
    varying_endpoint_coordinate: varyingCoordinate,
    matches_opposite_phase_question_coordinate: oppositeCoordinateMatched,
    route_normal_form_rows: freeze(routeRows),
    route_normal_form_matches: routeNormalForm,
    affine_cost_matches_2k_plus_4: affineCost,
    pairwise_antichain: antichain,
  });
}

function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 1; i <= k; i += 1) result = result * (n - k + i) / i;
  return result;
}

export function runDirectedFutureConeStratificationAssay() {
  const parent = runBoundedCommonFutureJoinObstructionAssay();
  const branching = runDirectedBranchingConfluenceAssay();
  const geometry = runDirectedReachabilityGeometryAssay();
  const obstruction = runInvertibilityAdmissibilityObstructionAssay();
  if (!parent?.passed || !branching?.passed || !geometry?.passed || !obstruction?.passed) {
    return freeze({ schema: DIRECTED_FUTURE_CONE_STRATIFICATION_SCHEMA, passed: false, status: 'PARENT_FUTURE_CONE_STRUCTURE_NOT_WITNESSED', disposition: 'ABSTAIN_BEFORE_STRATIFICATION_AUDITION' });
  }

  const before = [JSON.stringify(parent), JSON.stringify(branching), JSON.stringify(geometry), JSON.stringify(obstruction)];
  const parentBySource = new Map(parent.fork_audits.map((x) => [x.source_node_id, x]));
  const reconvergentForks = branching.forks.filter((fork) => fork.strict_reconvergence_hit_count > 0);
  const forkAudits = reconvergentForks.map((fork) => {
    const p = parentBySource.get(fork.source_node_id);
    const h7 = buildH7Common(fork);
    const horizons = [4, 5, 6].map((h) => parentHorizonView(p, h)).concat([h7]);
    const valid = h7.passed && horizons.every(Boolean) && h7.order_checks.reflexive && h7.order_checks.antisymmetric && h7.order_checks.transitive;
    const analyses = valid ? horizons.map((common) => analyzeFrontier(fork, common)) : [];
    const countRows = horizons.map((common) => freeze({
      horizon: common.horizon,
      common_future_count: common.object_count,
      minimal_frontier_width: common.minimal_common_future_count,
      least_count: common.least_common_future_count,
      minimum_join_cost: common.minimum_join_cost,
      width_matches_H_minus_1: common.minimal_common_future_count === common.horizon - 1,
      common_count_matches_binomial: common.object_count === choose(common.horizon + 1, 3),
    }));
    return freeze({
      source_node_id: fork.source_node_id,
      passed: valid,
      h7,
      horizons: freeze(horizons),
      analyses: freeze(analyses),
      count_rows: freeze(countRows),
      all_width_matches: countRows.every((x) => x.width_matches_H_minus_1),
      all_common_count_matches: countRows.every((x) => x.common_count_matches_binomial),
      all_lineage_consecutive: analyses.every((x) => x.consecutive_question_lineage && x.one_based_question_lineage_interval),
      all_phase_preserved: analyses.every((x) => x.frontier_preserves_source_phase),
      all_season_plus_two: analyses.every((x) => x.frontier_is_source_plus_two_seasons),
      all_coordinate_stratified: analyses.every((x) => x.unit_single_coordinate_stratification && x.matches_opposite_phase_question_coordinate),
      all_route_normal_form: analyses.every((x) => x.route_normal_form_matches),
      all_affine_cost: analyses.every((x) => x.affine_cost_matches_2k_plus_4),
      all_antichain: analyses.every((x) => x.pairwise_antichain),
    });
  });

  const after = [
    JSON.stringify(runBoundedCommonFutureJoinObstructionAssay()),
    JSON.stringify(runDirectedBranchingConfluenceAssay()),
    JSON.stringify(runDirectedReachabilityGeometryAssay()),
    JSON.stringify(runInvertibilityAdmissibilityObstructionAssay()),
  ];
  const parentCustodyUnchanged = before.every((value, i) => value === after[i]);
  const allForksPass = forkAudits.length === 11 && forkAudits.every((x) => x.passed);
  const allWidth = allForksPass && forkAudits.every((x) => x.all_width_matches);
  const allCount = allForksPass && forkAudits.every((x) => x.all_common_count_matches);
  const allLineage = allForksPass && forkAudits.every((x) => x.all_lineage_consecutive);
  const allPhase = allForksPass && forkAudits.every((x) => x.all_phase_preserved);
  const allSeason = allForksPass && forkAudits.every((x) => x.all_season_plus_two);
  const allCoordinate = allForksPass && forkAudits.every((x) => x.all_coordinate_stratified);
  const allRoutes = allForksPass && forkAudits.every((x) => x.all_route_normal_form);
  const allCost = allForksPass && forkAudits.every((x) => x.all_affine_cost);
  const allAntichain = allForksPass && forkAudits.every((x) => x.all_antichain);

  const normalizedProfiles = forkAudits.map((fork) => keyOf(fork.analyses.map((a) => a.strata.map((s) => freeze({
    q: s.question_lineage_increment,
    mass_gain: s.endpoint_mass_gain,
    phase_same: s.clock_phase === a.source_phase,
    season_offset: (seasonIndex[s.forcing_season] - a.source_season_index + 4) % 4,
    cost: s.minimum_total_continuation_cost,
  })))));
  const relativeProfilesIdentical = new Set(normalizedProfiles).size === 1;

  const success = allForksPass && parentCustodyUnchanged;
  return freeze({
    schema: DIRECTED_FUTURE_CONE_STRATIFICATION_SCHEMA,
    passed: success,
    status: success ? 'DIRECTED_FUTURE_CONE_STRATIFICATION_ROUND_CLOSED' : 'DIRECTED_FUTURE_CONE_STRATIFICATION_AUDITION_FAILED',
    h7_preregistered_word_count_per_child: 255,
    reconvergent_fork_count: reconvergentForks.length,
    fork_audits: freeze(forkAudits),
    h4_h7_pattern_results: freeze({
      minimal_frontier_width_matches_H_minus_one: allWidth,
      common_future_count_matches_binomial: allCount,
      question_lineage_consecutive: allLineage,
      frontier_preserves_source_phase: allPhase,
      frontier_is_source_plus_two_seasons: allSeason,
      opposite_phase_coordinate_stratification: allCoordinate,
      route_normal_form: allRoutes,
      affine_cost: allCost,
      antichain_persistence: allAntichain,
      source_relative_profiles_identical: relativeProfilesIdentical,
    }),
    classifications: freeze([
      allWidth ? 'MINIMAL_FRONTIER_WIDTH_MATCHES_H_MINUS_ONE_THROUGH_H7' : 'MINIMAL_FRONTIER_WIDTH_PATTERN_BREAKS_BY_H7',
      allCount ? 'COMMON_FUTURE_COUNT_MATCHES_BINOMIAL_C_H_PLUS_1_CHOOSE_3_THROUGH_H7' : 'COMMON_FUTURE_COUNT_BINOMIAL_PATTERN_BREAKS_BY_H7',
      allLineage ? 'MINIMAL_COMMON_FUTURE_FRONTIER_IS_CONSECUTIVELY_STRATIFIED_BY_QUESTION_LINEAGE_DEPTH' : 'QUESTION_LINEAGE_STRATIFICATION_NOT_UNIFORM_THROUGH_H7',
      allPhase ? 'MINIMAL_FRONTIER_PRESERVES_SOURCE_PHASE' : 'MINIMAL_FRONTIER_PHASE_ANCHOR_BREAKS',
      allSeason ? 'MINIMAL_FRONTIER_OCCUPIES_SOURCE_PLUS_TWO_FORCING_SEASON' : 'MINIMAL_FRONTIER_SEASON_OFFSET_BREAKS',
      allCoordinate ? 'MINIMAL_FRONTIER_STRATA_ADVANCE_ALONG_OPPOSITE_PHASE_QUESTION_COORDINATE' : 'MINIMAL_FRONTIER_ENDPOINT_COORDINATE_PATTERN_BREAKS',
      allRoutes ? 'MINIMAL_FRONTIER_ROUTE_NORMAL_FORM_MATCHES_T_QK_TQ_VS_Q_T_QK_T_THROUGH_H7' : 'MINIMAL_FRONTIER_ROUTE_NORMAL_FORM_BREAKS_BY_H7',
      allCost ? 'MINIMUM_RECONVERGENCE_COST_MATCHES_AFFINE_STRATUM_INDEX_THROUGH_H7' : 'MINIMUM_RECONVERGENCE_COST_AFFINE_PATTERN_BREAKS_BY_H7',
      allAntichain ? 'MINIMAL_COMMON_FUTURE_FRONTIER_REMAINS_AN_ANTICHAIN_THROUGH_H7' : 'MINIMAL_FRONTIER_ANTICHAIN_PATTERN_BREAKS_BY_H7',
      relativeProfilesIdentical ? 'RECONVERGENT_MINIMAL_FRONTIERS_COLLAPSE_TO_COMMON_SOURCE_RELATIVE_STRATIFICATION_PROFILE_THROUGH_H7' : 'SOURCE_RELATIVE_MINIMAL_FRONTIER_PROFILES_RETAIN_SEASON_DEPENDENT_STRUCTURE',
    ]),
    parent_custody_unchanged: parentCustodyUnchanged,
    parent_custody_classification: parentCustodyUnchanged ? 'PARENT_718_719_720_722_CUSTODY_UNCHANGED' : 'PARENT_CUSTODY_MUTATION_DETECTED',
    canonical_classification: success
      ? 'FINITE_H4_H7_DIRECTED_MINIMAL_COMMON_FUTURE_FRONTIER_STRATIFICATION_WITH_PROSPECTIVE_H7_EXTENSION'
      : null,
    bounded_claim: success
      ? 'IN_THE_ELEVEN_AUTHORED_RECONVERGENT_FORKS_THE_H4_H6_MINIMAL_COMMON_FUTURE_FRONTIERS_ARE_REAUDITED_AND_ONE_PROSPECTIVELY_PREREGISTERED_H7_EXTENSION_IS_ADDED_WITH_FRONTIER_WIDTH_COMMON_FUTURE_COUNT_LINEAGE_PHASE_SEASON_ENDPOINT_COORDINATE_ROUTE_NORMAL_FORM_COST_AND_ANTICHAIN_STRUCTURE_REPORTED_WITHOUT_EXTRAPOLATION_BEYOND_H7'
      : null,
    claim_ceiling: freeze({
      all_H_recurrence_theorem: false,
      induction_conclusion: false,
      closed_form_beyond_H7: false,
      rewrite_system_theorem: false,
      church_rosser: false,
      global_confluence: false,
      ambient_join_or_lattice: false,
      domain_theory: false,
      causal_set: false,
      fiber_bundle_or_gauge: false,
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
    stop: success ? 'HUMAN_𝄐_QUALIFIED_FOR_SYMBOLIC_RECURRENCE_AND_INDUCTIVE_PROOF_AUDITION' : 'PRESERVE_FAILURE_AND_RETURN_TO_HUMAN_𝄐',
  });
}
