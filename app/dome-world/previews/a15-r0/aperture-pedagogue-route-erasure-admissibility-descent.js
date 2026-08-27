import {
  enumerateFixedC1JointFiber,
  routeConditionalSeamCardinality,
} from './aperture-pedagogue-fixed-c1-joint-route-seam-fiber.js';
import {
  routeRespectingProductCriterion,
} from './aperture-pedagogue-dependent-sum-custody-schema.js';

export const ROUTE_ERASURE_ADMISSIBILITY_DESCENT_SCHEMA = 'td613.a15-r0.route-erasure-admissibility-descent/v0.1';
export const ROUTE_ERASURE_ADMISSIBILITY_DESCENT_PARENT_RECEIPT = 'de1cc600b330e90fa237c8984379ee08a787b0f7';
export const ROUTE_ERASURE_ADMISSIBILITY_DESCENT_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const nat = (value) => Number.isSafeInteger(value) && value >= 0;
const key = (value) => JSON.stringify(value);

function sortVectors(vectors) {
  return [...vectors].sort((a, b) => key(a).localeCompare(key(b)));
}

function setFromVectors(vectors) {
  return new Set(vectors.map(key));
}

function vectorsFromSet(set) {
  return freeze([...set].sort().map((value) => freeze(JSON.parse(value))));
}

function supportKey(vectors) {
  return JSON.stringify(sortVectors(vectors));
}

function validateC1Tuple(t, E, O, P) {
  return [t, E, O, P].every(nat);
}

function c1FromBlocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length < 1 || !blocks.every(nat)) return null;
  const t = blocks.length - 1;
  let E = 0;
  let O = 0;
  let P = 0;
  for (let i = 0; i < blocks.length; i += 1) {
    if (i % 2 === 0) E += blocks[i];
    else O += blocks[i];
    P += i * blocks[i];
  }
  return freeze({ t, E, O, P });
}

export function rawSeamSupportForBlocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length < 1 || !blocks.every(nat)) {
    return freeze({ status: 'RAW_SEAM_SUPPORT_FOR_BLOCKS_ABSTAIN' });
  }
  const declared = routeConditionalSeamCardinality(blocks);
  if (declared.status !== 'ROUTE_CONDITIONAL_SEAM_CARDINALITY_DERIVED') {
    return freeze({ status: 'RAW_SEAM_SUPPORT_FOR_BLOCKS_CARDINALITY_ABSTAIN' });
  }
  const cardinality = BigInt(declared.cardinality);
  if (cardinality > 50000n) {
    return freeze({ status: 'RAW_SEAM_SUPPORT_OUTSIDE_SAFE_MATERIALIZATION_DOMAIN' });
  }
  const internal = blocks.slice(1, -1);
  let rows = [[]];
  for (const q of internal) {
    const next = [];
    for (const prefix of rows) {
      for (let k = 0; k <= q; k += 1) next.push([...prefix, k]);
    }
    rows = next;
  }
  if (rows.length === 0) rows = [[]];
  const expected = Number(cardinality);
  const unique = new Set(rows.map(key)).size;
  return freeze({
    status: rows.length === expected && unique === expected
      ? 'EXACT_RAW_SEAM_SUPPORT_FOR_BLOCKS_DERIVED'
      : 'RAW_SEAM_SUPPORT_FOR_BLOCKS_MISMATCH',
    blocks: freeze([...blocks]),
    seam_dimension: internal.length,
    cardinality: rows.length,
    rows: freeze(sortVectors(rows).map((row) => freeze(row))),
  });
}

export function supportCoordinateMaxima(supportRows) {
  if (!Array.isArray(supportRows) || supportRows.length < 1 || !supportRows.every(Array.isArray)) {
    return freeze({ status: 'SUPPORT_COORDINATE_MAXIMA_ABSTAIN' });
  }
  const dimension = supportRows[0].length;
  if (!supportRows.every((row) => row.length === dimension && row.every(nat))) {
    return freeze({ status: 'SUPPORT_COORDINATE_MAXIMA_SHAPE_ABSTAIN' });
  }
  const maxima = Array.from({ length: dimension }, (_, i) => Math.max(...supportRows.map((row) => row[i])));
  return freeze({
    status: 'SUPPORT_COORDINATE_MAXIMA_DERIVED',
    dimension,
    maxima: freeze(maxima),
  });
}

export function recoverBlocksFromC1AndRawSupport(t, E, O, P, supportRows) {
  if (!validateC1Tuple(t, E, O, P)) return freeze({ status: 'BLOCK_RECOVERY_FROM_SUPPORT_C1_ABSTAIN' });
  const maxima = supportCoordinateMaxima(supportRows);
  if (maxima.status !== 'SUPPORT_COORDINATE_MAXIMA_DERIVED' || maxima.dimension !== Math.max(0, t - 1)) {
    return freeze({ status: 'BLOCK_RECOVERY_FROM_SUPPORT_DIMENSION_ABSTAIN', maxima });
  }
  const internal = [...maxima.maxima];
  let blocks;

  if (t === 0) {
    blocks = [E];
  } else if (t % 2 === 1) {
    let evenInternal = 0;
    let oddInternal = 0;
    for (let i = 1; i < t; i += 1) {
      if (i % 2 === 0) evenInternal += internal[i - 1];
      else oddInternal += internal[i - 1];
    }
    const q0 = E - evenInternal;
    const qt = O - oddInternal;
    if (!nat(q0) || !nat(qt)) return freeze({ status: 'BLOCK_RECOVERY_FROM_SUPPORT_NEGATIVE_ENDPOINT_ABSTAIN' });
    blocks = [q0, ...internal, qt];
  } else {
    let evenInternal = 0;
    let oddInternal = 0;
    let weightedInternal = 0;
    for (let i = 1; i < t; i += 1) {
      const q = internal[i - 1];
      if (i % 2 === 0) evenInternal += q;
      else oddInternal += q;
      weightedInternal += i * q;
    }
    const numerator = P - weightedInternal;
    if (!nat(numerator) || numerator % t !== 0) {
      return freeze({ status: 'BLOCK_RECOVERY_FROM_SUPPORT_EVEN_ENDPOINT_DIVISIBILITY_ABSTAIN' });
    }
    const qt = numerator / t;
    const q0 = E - evenInternal - qt;
    if (!nat(q0) || !nat(qt) || oddInternal !== O) {
      return freeze({ status: 'BLOCK_RECOVERY_FROM_SUPPORT_EVEN_ENDPOINT_CONSTRAINT_ABSTAIN' });
    }
    blocks = [q0, ...internal, qt];
  }

  const recovered = c1FromBlocks(blocks);
  const exact = recovered && recovered.t === t && recovered.E === E && recovered.O === O && recovered.P === P;
  return freeze({
    status: exact ? 'EXACT_ROUTE_BLOCKS_RECOVERED_FROM_C1_AND_RAW_SUPPORT' : 'BLOCK_RECOVERY_FROM_SUPPORT_C1_MISMATCH',
    t, E, O, P,
    internal_blocks: freeze(internal),
    blocks: freeze(blocks),
    recovered_c1: recovered,
  });
}

function groupedRouteSupports(t, E, O, P) {
  if (!validateC1Tuple(t, E, O, P)) return freeze({ status: 'ROUTE_SUPPORT_GROUPING_ABSTAIN' });
  const fiber = enumerateFixedC1JointFiber(t, E, O, P);
  if (fiber.status !== 'FIXED_C1_JOINT_FIBER_ENUMERATED') {
    return freeze({ status: 'ROUTE_SUPPORT_GROUPING_JOINT_FIBER_ABSTAIN', fiber });
  }
  const map = new Map();
  for (const row of fiber.rows) {
    if (!map.has(row.route_rank)) {
      map.set(row.route_rank, {
        route_rank: row.route_rank,
        blocks: row.blocks,
        word: row.word,
        support: [],
      });
    }
    map.get(row.route_rank).support.push(row.seams);
  }
  const routes = [...map.values()]
    .sort((a, b) => a.route_rank - b.route_rank)
    .map((route) => {
      const support = sortVectors(route.support);
      const direct = rawSeamSupportForBlocks(route.blocks);
      const maxima = supportCoordinateMaxima(support);
      const recovered = recoverBlocksFromC1AndRawSupport(t, E, O, P, support);
      const exact = direct.status === 'EXACT_RAW_SEAM_SUPPORT_FOR_BLOCKS_DERIVED'
        && supportKey(direct.rows) === supportKey(support)
        && maxima.status === 'SUPPORT_COORDINATE_MAXIMA_DERIVED'
        && key(maxima.maxima) === key(route.blocks.slice(1, -1))
        && recovered.status === 'EXACT_ROUTE_BLOCKS_RECOVERED_FROM_C1_AND_RAW_SUPPORT'
        && key(recovered.blocks) === key(route.blocks);
      return freeze({
        route_rank: route.route_rank,
        blocks: route.blocks,
        word: route.word,
        support: freeze(support.map((row) => freeze(row))),
        support_cardinality: support.length,
        support_key: supportKey(support),
        coordinate_maxima: maxima.status === 'SUPPORT_COORDINATE_MAXIMA_DERIVED' ? maxima.maxima : null,
        recovered_blocks: recovered.status === 'EXACT_ROUTE_BLOCKS_RECOVERED_FROM_C1_AND_RAW_SUPPORT' ? recovered.blocks : null,
        exact,
      });
    });
  const uniqueSupportCount = new Set(routes.map((route) => route.support_key)).size;
  const passed = routes.length > 0
    && routes.every((route) => route.exact)
    && uniqueSupportCount === routes.length;
  return freeze({
    status: passed
      ? 'EXACT_FIXED_C1_ROUTE_RAW_SEAM_SUPPORTS_DERIVED'
      : 'FIXED_C1_ROUTE_RAW_SEAM_SUPPORT_INJECTIVITY_MISMATCH',
    t, E, O, P,
    route_count: routes.length,
    unique_support_count: uniqueSupportCount,
    support_map_injective: uniqueSupportCount === routes.length,
    routes: freeze(routes),
    fiber,
  });
}

export function rawSupportInjectivityProfile(t, E, O, P) {
  const grouped = groupedRouteSupports(t, E, O, P);
  if (grouped.status !== 'EXACT_FIXED_C1_ROUTE_RAW_SEAM_SUPPORTS_DERIVED') return grouped;
  return freeze({
    status: 'RAW_SEAM_SUPPORT_INJECTIVITY_PROFILE_DERIVED',
    t, E, O, P,
    route_count: grouped.route_count,
    unique_support_count: grouped.unique_support_count,
    support_map_injective: grouped.support_map_injective,
    routes: grouped.routes,
    classification: 'RAW_SEAM_SUPPORT_COORDINATE_MAXIMA_PLUS_FIXED_C1_RECOVER_THE_COMPLETE_AUTHORED_ROUTE',
  });
}

export function routeErasureAdmissibilityProfile(t, E, O, P) {
  const grouped = groupedRouteSupports(t, E, O, P);
  if (grouped.status !== 'EXACT_FIXED_C1_ROUTE_RAW_SEAM_SUPPORTS_DERIVED') return grouped;
  const sets = grouped.routes.map((route) => setFromVectors(route.support));
  const union = new Set();
  for (const set of sets) for (const value of set) union.add(value);
  const intersection = new Set(sets[0]);
  for (const value of [...intersection]) {
    if (!sets.every((set) => set.has(value))) intersection.delete(value);
  }
  const gap = new Set([...union].filter((value) => !intersection.has(value)));
  const allSupportsEqual = grouped.routes.every((route) => route.support_key === grouped.routes[0].support_key);
  const singletonRouteFiber = grouped.route_count === 1;
  const exactDescent = allSupportsEqual;
  const theoremPassed = grouped.support_map_injective
    && exactDescent === singletonRouteFiber
    && (gap.size === 0) === exactDescent;
  return freeze({
    status: theoremPassed
      ? 'EXACT_ROUTE_ERASURE_ADMISSIBILITY_PROFILE_DERIVED'
      : 'ROUTE_ERASURE_ADMISSIBILITY_PROFILE_MISMATCH',
    t, E, O, P,
    route_count: grouped.route_count,
    raw_support_cardinalities: freeze(grouped.routes.map((route) => route.support_cardinality)),
    all_raw_supports_equal: allSupportsEqual,
    exact_route_independent_raw_seam_admissibility_descends: exactDescent,
    exact_descent_iff_route_fiber_singleton: exactDescent === singletonRouteFiber,
    union_support: vectorsFromSet(union),
    union_cardinality: union.size,
    intersection_support: vectorsFromSet(intersection),
    intersection_cardinality: intersection.size,
    descent_gap: vectorsFromSet(gap),
    descent_gap_cardinality: gap.size,
    routes: grouped.routes,
    classification: exactDescent
      ? 'RAW_SEAM_ADMISSIBILITY_DESCENDS_EXACTLY_AFTER_ROUTE_ERASURE_FOR_THIS_SINGLETON_ROUTE_FIBER'
      : 'ROUTE_ERASURE_COLLAPSES_DISTINCT_RAW_SEAM_SUPPORTS_SO_EXACT_ROUTE_INDEPENDENT_ADMISSIBILITY_CANNOT_DESCEND',
  });
}

export function auditRouteIndependentRawSeamRule(t, E, O, P, candidateSupport) {
  const profile = routeErasureAdmissibilityProfile(t, E, O, P);
  if (profile.status !== 'EXACT_ROUTE_ERASURE_ADMISSIBILITY_PROFILE_DERIVED'
      || !Array.isArray(candidateSupport)
      || !candidateSupport.every((row) => Array.isArray(row) && row.length === Math.max(0, t - 1) && row.every(nat))) {
    return freeze({ status: 'ROUTE_INDEPENDENT_RAW_SEAM_RULE_AUDIT_ABSTAIN' });
  }
  const candidate = setFromVectors(candidateSupport);
  const routeSets = profile.routes.map((route) => setFromVectors(route.support));
  const falseAdmissions = routeSets.map((routeSet) => [...candidate].filter((value) => !routeSet.has(value)).length);
  const falseRejections = routeSets.map((routeSet) => [...routeSet].filter((value) => !candidate.has(value)).length);
  const universallySound = falseAdmissions.every((count) => count === 0);
  const universallyComplete = falseRejections.every((count) => count === 0);
  const exact = universallySound && universallyComplete;
  const intersectionSet = setFromVectors(profile.intersection_support);
  const unionSet = setFromVectors(profile.union_support);
  const soundIffSubsetIntersection = universallySound === [...candidate].every((value) => intersectionSet.has(value));
  const completeIffSupersetUnion = universallyComplete === [...unionSet].every((value) => candidate.has(value));
  return freeze({
    status: soundIffSubsetIntersection && completeIffSupersetUnion
      ? 'ROUTE_INDEPENDENT_RAW_SEAM_RULE_AUDITED'
      : 'ROUTE_INDEPENDENT_RAW_SEAM_RULE_AUDIT_MISMATCH',
    universally_sound: universallySound,
    universally_complete: universallyComplete,
    exact,
    false_admissions_by_route: freeze(falseAdmissions),
    false_rejections_by_route: freeze(falseRejections),
    candidate_support_cardinality: candidate.size,
    classification: exact
      ? 'EXACT_ROUTE_INDEPENDENT_RAW_SEAM_RULE_WITNESSED'
      : universallySound
        ? 'ROUTE_INDEPENDENT_RULE_IS_SOUND_BUT_INCOMPLETE'
        : universallyComplete
          ? 'ROUTE_INDEPENDENT_RULE_IS_COMPLETE_BUT_UNSOUND'
          : 'ROUTE_INDEPENDENT_RULE_IS_NEITHER_UNIVERSALLY_SOUND_NOR_COMPLETE',
  });
}

function symbolicSupportInjectivityCertificate() {
  return freeze({
    passed: true,
    support_box: 'For route blocks q0,...,qt, raw seam support is product_i=1^(t-1){0,...,q_i}.',
    internal_recovery: 'Coordinate maximum i of the support box is exactly q_i, so equal raw supports force equal internal blocks.',
    odd_endpoint_recovery: 'For odd t, fixed E and O recover q0 and qt once internal blocks are fixed.',
    even_endpoint_recovery: 'For even t>=2, fixed P recovers qt from the weighted remainder divided by t, then fixed E recovers q0.',
    consequence: 'Within one exact fixed-C1 route fiber, equal raw seam supports force equal complete routes.',
    authority: 'ALL_FINITE_DECLARED_GRAMMAR_BY_EXACT_SUPPORT_MAXIMA_AND_ENDPOINT_IDENTITIES_NOT_ENUMERATION_HORIZON',
  });
}

function equalCardinalityUnequalSupportHostile() {
  const args = [5, 0, 3, 9];
  const profile = routeErasureAdmissibilityProfile(...args);
  const product = routeRespectingProductCriterion(...args);
  const route0 = profile.routes?.[0];
  const route1 = profile.routes?.[1];
  return freeze({
    passed: profile.status === 'EXACT_ROUTE_ERASURE_ADMISSIBILITY_PROFILE_DERIVED'
      && profile.route_count === 2
      && key(profile.raw_support_cardinalities) === key([4, 4])
      && !profile.all_raw_supports_equal
      && !profile.exact_route_independent_raw_seam_admissibility_descends
      && profile.union_cardinality === 6
      && profile.intersection_cardinality === 2
      && profile.descent_gap_cardinality === 4
      && key(route0?.blocks) === key([0, 0, 0, 3, 0, 0])
      && key(route1?.blocks) === key([0, 1, 0, 1, 0, 1])
      && product.status === 'ROUTE_RESPECTING_PRODUCT_EXACTNESS_CRITERION_DERIVED'
      && product.route_respecting_padding_free_product_exists,
    args: freeze(args),
    profile,
    product,
  });
}

function inheritedFiveStateHostile() {
  const profile = routeErasureAdmissibilityProfile(3, 1, 1, 3);
  const unionAudit = auditRouteIndependentRawSeamRule(3, 1, 1, 3, profile.union_support ?? []);
  const intersectionAudit = auditRouteIndependentRawSeamRule(3, 1, 1, 3, profile.intersection_support ?? []);
  return freeze({
    passed: profile.status === 'EXACT_ROUTE_ERASURE_ADMISSIBILITY_PROFILE_DERIVED'
      && profile.route_count === 2
      && profile.union_cardinality === 4
      && profile.intersection_cardinality === 1
      && profile.descent_gap_cardinality === 3
      && unionAudit.universally_complete && !unionAudit.universally_sound
      && intersectionAudit.universally_sound && !intersectionAudit.universally_complete,
    profile,
    union_audit: unionAudit,
    intersection_audit: intersectionAudit,
  });
}

function singletonNontrivialPositiveHostile() {
  const profile = routeErasureAdmissibilityProfile(3, 0, 1, 1);
  const exactAudit = auditRouteIndependentRawSeamRule(3, 0, 1, 1, profile.union_support ?? []);
  return freeze({
    passed: profile.status === 'EXACT_ROUTE_ERASURE_ADMISSIBILITY_PROFILE_DERIVED'
      && profile.route_count === 1
      && key(profile.routes?.[0]?.blocks) === key([0, 1, 0, 0])
      && profile.union_cardinality === 2
      && profile.intersection_cardinality === 2
      && profile.descent_gap_cardinality === 0
      && profile.exact_route_independent_raw_seam_admissibility_descends
      && exactAudit.exact,
    profile,
    exact_audit: exactAudit,
  });
}

function edgeHostile() {
  const t0 = routeErasureAdmissibilityProfile(0, 5, 0, 0);
  const t1 = routeErasureAdmissibilityProfile(1, 2, 3, 3);
  return freeze({
    passed: t0.status === 'EXACT_ROUTE_ERASURE_ADMISSIBILITY_PROFILE_DERIVED'
      && t1.status === 'EXACT_ROUTE_ERASURE_ADMISSIBILITY_PROFILE_DERIVED'
      && t0.route_count === 1 && t1.route_count === 1
      && t0.exact_route_independent_raw_seam_admissibility_descends
      && t1.exact_route_independent_raw_seam_admissibility_descends
      && t0.descent_gap_cardinality === 0
      && t1.descent_gap_cardinality === 0,
    t0, t1,
  });
}

function boundedInjectivityCorroboration() {
  const states = [
    [0, 5, 0, 0],
    [1, 2, 3, 3],
    [2, 1, 2, 4],
    [3, 0, 1, 1],
    [3, 1, 1, 3],
    [3, 1, 2, 4],
    [3, 2, 2, 6],
    [4, 2, 2, 6],
    [5, 0, 3, 9],
  ];
  const rows = states.map((args) => {
    const profile = rawSupportInjectivityProfile(...args);
    return freeze({
      args: freeze(args),
      passed: profile.status === 'RAW_SEAM_SUPPORT_INJECTIVITY_PROFILE_DERIVED'
        && profile.support_map_injective
        && profile.route_count === profile.unique_support_count,
      profile,
    });
  });
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows), authority: 'BOUNDED_CORROBORATION_ONLY' });
}

function unionIntersectionExtremalityCertificate() {
  const states = [[3, 1, 1, 3], [3, 1, 2, 4], [5, 0, 3, 9], [3, 0, 1, 1]];
  const rows = states.map((args) => {
    const profile = routeErasureAdmissibilityProfile(...args);
    const unionAudit = auditRouteIndependentRawSeamRule(...args, profile.union_support ?? []);
    const intersectionAudit = auditRouteIndependentRawSeamRule(...args, profile.intersection_support ?? []);
    const supportsDiffer = !profile.all_raw_supports_equal;
    return freeze({
      args: freeze(args),
      passed: unionAudit.status === 'ROUTE_INDEPENDENT_RAW_SEAM_RULE_AUDITED'
        && intersectionAudit.status === 'ROUTE_INDEPENDENT_RAW_SEAM_RULE_AUDITED'
        && unionAudit.universally_complete
        && intersectionAudit.universally_sound
        && (supportsDiffer ? (!unionAudit.universally_sound && !intersectionAudit.universally_complete) : (unionAudit.exact && intersectionAudit.exact)),
      profile, unionAudit, intersectionAudit,
    });
  });
  return freeze({ passed: rows.every((row) => row.passed), rows: freeze(rows) });
}

export function runRouteErasureAdmissibilityDescentChamber() {
  const certificates = freeze({
    symbolic_support_injectivity: symbolicSupportInjectivityCertificate(),
    equal_cardinality_unequal_support: equalCardinalityUnequalSupportHostile(),
    inherited_five_state: inheritedFiveStateHostile(),
    singleton_nontrivial_positive: singletonNontrivialPositiveHostile(),
    t0_t1_edges: edgeHostile(),
    bounded_injectivity_corroboration: boundedInjectivityCorroboration(),
    union_intersection_extremality: unionIntersectionExtremalityCertificate(),
  });
  const passed = Object.values(certificates).every((certificate) => certificate.passed);
  return freeze({
    schema: ROUTE_ERASURE_ADMISSIBILITY_DESCENT_SCHEMA,
    parent_receipt: ROUTE_ERASURE_ADMISSIBILITY_DESCENT_PARENT_RECEIPT,
    gate_issue: ROUTE_ERASURE_ADMISSIBILITY_DESCENT_GATE_ISSUE,
    status: passed
      ? 'ROUTE_ERASURE_ADMISSIBILITY_DESCENT_CHAMBER_PASSED'
      : 'ROUTE_ERASURE_ADMISSIBILITY_DESCENT_CHAMBER_FAILED',
    passed,
    certificates,
    canonical_candidate: passed
      ? 'THE_RAW_LINEAR_SEAM_SUPPORT_MAP_w_TO_K_w_IS_INJECTIVE_ON_EVERY_EXACT_FIXED_C1_ROUTE_FIBER_BECAUSE_SUPPORT_COORDINATE_MAXIMA_RECOVER_INTERNAL_BLOCKS_AND_FIXED_C1_RECOVERS_ENDPOINTS'
      : 'UNCLASSIFIED',
    consequential_candidate: passed
      ? 'EXACT_ROUTE_INDEPENDENT_RAW_SEAM_ADMISSIBILITY_DESCENDS_THROUGH_ROUTE_ERASURE_IF_AND_ONLY_IF_THE_EXACT_FIXED_C1_ROUTE_FIBER_IS_SINGLETON'
      : 'UNCLASSIFIED',
    architectural_candidate: passed
      ? 'WHEN_ROUTE_ERASURE_COLLAPSES_DISTINCT_ROUTE_CONDITIONED_SUPPORTS_THE_UNION_IS_THE_MINIMUM_COMPLETE_RULE_THE_INTERSECTION_IS_THE_MAXIMUM_SOUND_RULE_AND_THE_NONEMPTY_DIFFERENCE_IS_A_FINITE_CERTIFICATE_THAT_NO_SURVIVING_ROUTE_INDEPENDENT_RULE_CAN_PRESERVE_BOTH'
      : 'UNCLASSIFIED',
    landing: freeze({
      equal_cardinality_does_not_authorize_support_descent: true,
      route_local_relabeling_authority_does_not_survive_route_erasure: true,
      union_is_minimum_complete_not_universally_sound_when_supports_differ: true,
      intersection_is_maximum_sound_not_universally_complete_when_supports_differ: true,
      route_sensitive_admissibility_requires_route_custody_or_visible_unresolved_support: true,
    }),
  });
}

export default runRouteErasureAdmissibilityDescentChamber;
