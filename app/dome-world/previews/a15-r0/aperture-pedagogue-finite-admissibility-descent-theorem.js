import {
  routeErasureAdmissibilityProfile,
} from './aperture-pedagogue-route-erasure-admissibility-descent.js';

export const FINITE_ADMISSIBILITY_DESCENT_THEOREM_SCHEMA = 'td613.a15-r0.finite-admissibility-descent-theorem/v0.1';
export const FINITE_ADMISSIBILITY_DESCENT_THEOREM_PARENT_RECEIPT = 'b9a0d13e43d80f59769788da31d87951ec8ea8ee';
export const FINITE_ADMISSIBILITY_DESCENT_THEOREM_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

function canonicalFiniteValue(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return `s:${JSON.stringify(value)}`;
  if (typeof value === 'boolean') return value ? 'b:1' : 'b:0';
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (Object.is(value, -0)) return 'n:0';
    return `n:${String(value)}`;
  }
  if (Array.isArray(value)) {
    const parts = value.map(canonicalFiniteValue);
    if (parts.some((part) => part === null)) return null;
    return `a:[${parts.join(',')}]`;
  }
  return null;
}

function sortValues(values) {
  return [...values].sort((left, right) => {
    const lk = canonicalFiniteValue(left);
    const rk = canonicalFiniteValue(right);
    return lk.localeCompare(rk);
  });
}

function normalizeSupport(values) {
  if (!Array.isArray(values)) return null;
  const map = new Map();
  for (const value of values) {
    const key = canonicalFiniteValue(value);
    if (key === null) return null;
    if (!map.has(key)) map.set(key, value);
  }
  return freeze(sortValues([...map.values()]));
}

function supportKey(values) {
  const normalized = normalizeSupport(values);
  if (!normalized) return null;
  return JSON.stringify(normalized.map(canonicalFiniteValue));
}

function supportMap(values) {
  const normalized = normalizeSupport(values);
  if (!normalized) return null;
  return new Map(normalized.map((value) => [canonicalFiniteValue(value), value]));
}

function valuesFromKeySet(keys, sourceMaps) {
  const resolved = [];
  for (const key of [...keys].sort()) {
    let value;
    for (const map of sourceMaps) {
      if (map.has(key)) {
        value = map.get(key);
        break;
      }
    }
    if (value !== undefined || key === 'null') resolved.push(value ?? null);
  }
  return freeze(resolved);
}

function normalizeRows(rows) {
  if (!Array.isArray(rows) || rows.length < 1) {
    return freeze({ status: 'FINITE_ADMISSIBILITY_INPUT_ABSTAIN_EMPTY_OR_NONARRAY' });
  }

  const antecedentKeys = new Set();
  const normalized = [];
  for (const row of rows) {
    const antecedentKey = canonicalFiniteValue(row?.antecedent);
    const quotientKey = canonicalFiniteValue(row?.quotient);
    const support = normalizeSupport(row?.support);
    if (antecedentKey === null || quotientKey === null || support === null) {
      return freeze({ status: 'FINITE_ADMISSIBILITY_INPUT_ABSTAIN_INVALID_ROW' });
    }
    if (antecedentKeys.has(antecedentKey)) {
      return freeze({ status: 'FINITE_ADMISSIBILITY_INPUT_ABSTAIN_DUPLICATE_ANTECEDENT' });
    }
    antecedentKeys.add(antecedentKey);
    normalized.push(freeze({
      antecedent: row.antecedent,
      antecedent_key: antecedentKey,
      quotient: row.quotient,
      quotient_key: quotientKey,
      support,
      support_key: supportKey(support),
    }));
  }

  normalized.sort((a, b) => a.antecedent_key.localeCompare(b.antecedent_key));
  return freeze({ status: 'FINITE_ADMISSIBILITY_INPUT_NORMALIZED', rows: freeze(normalized) });
}

function groupedFibers(rows) {
  const normalized = normalizeRows(rows);
  if (normalized.status !== 'FINITE_ADMISSIBILITY_INPUT_NORMALIZED') return normalized;

  const groups = new Map();
  for (const row of normalized.rows) {
    if (!groups.has(row.quotient_key)) {
      groups.set(row.quotient_key, {
        quotient: row.quotient,
        quotient_key: row.quotient_key,
        rows: [],
      });
    }
    groups.get(row.quotient_key).rows.push(row);
  }

  const fibers = [...groups.values()]
    .sort((a, b) => a.quotient_key.localeCompare(b.quotient_key))
    .map((group) => {
      const maps = group.rows.map((row) => supportMap(row.support));
      const unionKeys = new Set();
      for (const map of maps) for (const key of map.keys()) unionKeys.add(key);
      const intersectionKeys = new Set(maps[0].keys());
      for (const key of [...intersectionKeys]) {
        if (!maps.every((map) => map.has(key))) intersectionKeys.delete(key);
      }
      const gapKeys = new Set([...unionKeys].filter((key) => !intersectionKeys.has(key)));
      const supportsConstant = group.rows.every((row) => row.support_key === group.rows[0].support_key);
      return freeze({
        quotient: group.quotient,
        quotient_key: group.quotient_key,
        antecedent_count: group.rows.length,
        antecedents: freeze(group.rows.map((row) => row.antecedent)),
        antecedent_supports: freeze(group.rows.map((row) => freeze({
          antecedent: row.antecedent,
          support: row.support,
          support_cardinality: row.support.length,
        }))),
        supports_constant_on_fiber: supportsConstant,
        union_support: valuesFromKeySet(unionKeys, maps),
        union_cardinality: unionKeys.size,
        intersection_support: valuesFromKeySet(intersectionKeys, maps),
        intersection_cardinality: intersectionKeys.size,
        irreducible_gap: valuesFromKeySet(gapKeys, maps),
        irreducible_gap_cardinality: gapKeys.size,
      });
    });

  return freeze({
    status: 'FINITE_ADMISSIBILITY_OCCUPIED_FIBERS_DERIVED',
    antecedent_count: normalized.rows.length,
    occupied_quotient_count: fibers.length,
    fibers: freeze(fibers),
    normalized_rows: normalized.rows,
  });
}

export function finiteAdmissibilityDescentProfile(rows) {
  const grouped = groupedFibers(rows);
  if (grouped.status !== 'FINITE_ADMISSIBILITY_OCCUPIED_FIBERS_DERIVED') return grouped;
  const exact = grouped.fibers.every((fiber) => fiber.supports_constant_on_fiber);
  const gapEmptyEverywhere = grouped.fibers.every((fiber) => fiber.irreducible_gap_cardinality === 0);
  const iffPassed = exact === gapEmptyEverywhere;
  return freeze({
    status: iffPassed
      ? 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED'
      : 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_MISMATCH',
    antecedent_count: grouped.antecedent_count,
    occupied_quotient_count: grouped.occupied_quotient_count,
    occupied_fibers: grouped.fibers,
    exact_descended_rule_exists: exact,
    support_constant_on_every_occupied_fiber: exact,
    all_irreducible_gaps_empty: gapEmptyEverywhere,
    theorem_equivalence_witnessed: iffPassed,
    classification: exact
      ? 'EXACT_FINITE_ADMISSIBILITY_DESCENT_EXISTS'
      : 'INCOMPATIBLE_ANTECEDENT_SUPPORTS_OBSTRUCT_EXACT_FINITE_ADMISSIBILITY_DESCENT',
  });
}

export function materializeExactDescendedRule(rows) {
  const profile = finiteAdmissibilityDescentProfile(rows);
  if (profile.status !== 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED') return profile;
  if (!profile.exact_descended_rule_exists) {
    return freeze({
      status: 'EXACT_DESCENDED_RULE_FORBIDDEN_BY_NONCONSTANT_FIBER_SUPPORTS',
      occupied_fibers: profile.occupied_fibers,
    });
  }
  return freeze({
    status: 'EXACT_FINITE_DESCENDED_ADMISSIBILITY_RULE_MATERIALIZED',
    rule: freeze(profile.occupied_fibers.map((fiber) => freeze({
      quotient: fiber.quotient,
      support: fiber.intersection_support,
    }))),
    occupied_quotient_count: profile.occupied_quotient_count,
    unoccupied_quotient_states_receive_no_rule: true,
  });
}

function findOccupiedFiber(rows, quotient) {
  const grouped = groupedFibers(rows);
  if (grouped.status !== 'FINITE_ADMISSIBILITY_OCCUPIED_FIBERS_DERIVED') return { grouped, fiber: null };
  const quotientKey = canonicalFiniteValue(quotient);
  if (quotientKey === null) return { grouped, fiber: null };
  return { grouped, fiber: grouped.fibers.find((candidate) => candidate.quotient_key === quotientKey) ?? null };
}

export function auditFiniteSurvivingSupport(rows, quotient, candidateSupport) {
  const { grouped, fiber } = findOccupiedFiber(rows, quotient);
  const candidate = normalizeSupport(candidateSupport);
  if (grouped.status !== 'FINITE_ADMISSIBILITY_OCCUPIED_FIBERS_DERIVED' || candidate === null) {
    return freeze({ status: 'FINITE_SURVIVING_SUPPORT_AUDIT_ABSTAIN' });
  }
  if (!fiber) {
    return freeze({
      status: 'UNOCCUPIED_QUOTIENT_STATE_HAS_NO_DESCENT_AUTHORITY',
      quotient,
    });
  }

  const union = supportMap(fiber.union_support);
  const intersection = supportMap(fiber.intersection_support);
  const gap = supportMap(fiber.irreducible_gap);
  const candidateMap = supportMap(candidate);
  const sourceMaps = [candidateMap, union, intersection, gap];

  const falseKeys = new Set([...candidateMap.keys()].filter((key) => !intersection.has(key)));
  const omitKeys = new Set([...union.keys()].filter((key) => !candidateMap.has(key)));
  const outsideUnionKeys = new Set([...candidateMap.keys()].filter((key) => !union.has(key)));
  const omittedIntersectionKeys = new Set([...intersection.keys()].filter((key) => !candidateMap.has(key)));

  const score = falseKeys.size + omitKeys.size;
  const rhs = gap.size + outsideUnionKeys.size + omittedIntersectionKeys.size;
  const identityPassed = score === rhs;
  const universallySound = falseKeys.size === 0;
  const universallyComplete = omitKeys.size === 0;
  const insideEnvelope = outsideUnionKeys.size === 0 && omittedIntersectionKeys.size === 0;
  const minimal = score === gap.size;

  return freeze({
    status: identityPassed
      ? 'FINITE_SURVIVING_SUPPORT_AUDITED'
      : 'FINITE_SURVIVING_SUPPORT_GAP_IDENTITY_MISMATCH',
    quotient: fiber.quotient,
    candidate_support: candidate,
    union_support: fiber.union_support,
    intersection_support: fiber.intersection_support,
    irreducible_gap: fiber.irreducible_gap,
    false_admission_surface: valuesFromKeySet(falseKeys, sourceMaps),
    false_admission_cardinality: falseKeys.size,
    omission_surface: valuesFromKeySet(omitKeys, sourceMaps),
    omission_cardinality: omitKeys.size,
    outside_union_surface: valuesFromKeySet(outsideUnionKeys, sourceMaps),
    outside_union_cardinality: outsideUnionKeys.size,
    omitted_intersection_surface: valuesFromKeySet(omittedIntersectionKeys, sourceMaps),
    omitted_intersection_cardinality: omittedIntersectionKeys.size,
    discrepancy_score: score,
    gap_lower_bound: gap.size,
    exact_gap_identity_rhs: rhs,
    exact_gap_identity_witnessed: identityPassed,
    universally_sound: universallySound,
    universally_complete: universallyComplete,
    exact_sound_and_complete: universallySound && universallyComplete,
    inside_minimal_envelope: insideEnvelope,
    achieves_gap_lower_bound: minimal,
    equality_iff_between_intersection_and_union: minimal === insideEnvelope,
  });
}

export function finiteMinimalDistortionChoice(rows, quotient, admittedGapValues) {
  const { grouped, fiber } = findOccupiedFiber(rows, quotient);
  const selected = normalizeSupport(admittedGapValues);
  if (grouped.status !== 'FINITE_ADMISSIBILITY_OCCUPIED_FIBERS_DERIVED' || selected === null) {
    return freeze({ status: 'FINITE_MINIMAL_DISTORTION_CHOICE_ABSTAIN' });
  }
  if (!fiber) return freeze({ status: 'UNOCCUPIED_QUOTIENT_STATE_HAS_NO_DESCENT_AUTHORITY', quotient });

  const gap = supportMap(fiber.irreducible_gap);
  const selectedMap = supportMap(selected);
  if ([...selectedMap.keys()].some((key) => !gap.has(key))) {
    return freeze({ status: 'FINITE_MINIMAL_DISTORTION_CHOICE_OUTSIDE_IRREDUCIBLE_GAP' });
  }
  const intersection = supportMap(fiber.intersection_support);
  const candidateMap = new Map(intersection);
  for (const [key, value] of selectedMap) candidateMap.set(key, value);
  const candidate = freeze(sortValues([...candidateMap.values()]));
  const audit = auditFiniteSurvivingSupport(rows, quotient, candidate);
  if (audit.status !== 'FINITE_SURVIVING_SUPPORT_AUDITED'
      || !audit.achieves_gap_lower_bound
      || !audit.inside_minimal_envelope) {
    return freeze({ status: 'FINITE_MINIMAL_DISTORTION_CHOICE_INTERNAL_MISMATCH', audit });
  }
  const omittedGapKeys = new Set([...gap.keys()].filter((key) => !selectedMap.has(key)));
  return freeze({
    status: 'FINITE_MINIMAL_DISTORTION_CHOICE_DERIVED',
    quotient: fiber.quotient,
    candidate_support: candidate,
    admitted_gap_partition: selected,
    omitted_gap_partition: valuesFromKeySet(omittedGapKeys, [gap]),
    irreducible_gap_cardinality: gap.size,
    false_admission_cardinality: audit.false_admission_cardinality,
    omission_cardinality: audit.omission_cardinality,
    discrepancy_score: audit.discrepancy_score,
    audit,
  });
}

export function bridgeRouteErasureToFiniteAdmissibility(t, E, O, P) {
  const routeProfile = routeErasureAdmissibilityProfile(t, E, O, P);
  if (routeProfile.status !== 'EXACT_ROUTE_ERASURE_ADMISSIBILITY_PROFILE_DERIVED') {
    return freeze({ status: 'ROUTE_ERASURE_TO_FINITE_ADMISSIBILITY_BRIDGE_ABSTAIN', routeProfile });
  }
  const quotient = freeze([t, E, O, P]);
  const rows = routeProfile.routes.map((route) => freeze({
    antecedent: freeze(['route', route.route_rank]),
    quotient,
    support: route.support,
  }));
  const general = finiteAdmissibilityDescentProfile(rows);
  if (general.status !== 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED' || general.occupied_fibers.length !== 1) {
    return freeze({ status: 'ROUTE_ERASURE_TO_FINITE_ADMISSIBILITY_BRIDGE_GENERAL_ABSTAIN', routeProfile, general });
  }
  const fiber = general.occupied_fibers[0];
  const exact = general.exact_descended_rule_exists === routeProfile.exact_route_independent_raw_seam_admissibility_descends
    && fiber.union_cardinality === routeProfile.union_cardinality
    && fiber.intersection_cardinality === routeProfile.intersection_cardinality
    && fiber.irreducible_gap_cardinality === routeProfile.descent_gap_cardinality;
  return freeze({
    status: exact
      ? 'ROUTE_ERASURE_IS_EXACT_INSTANCE_OF_FINITE_ADMISSIBILITY_DESCENT'
      : 'ROUTE_ERASURE_FINITE_ADMISSIBILITY_BRIDGE_MISMATCH',
    t, E, O, P,
    exact,
    route_profile: routeProfile,
    general_profile: general,
  });
}

function symbolicTheoremCertificate() {
  return freeze({
    passed: true,
    descent_necessity: 'If one descended support Kbar(y) equals K_x for every x in q^-1(y), all K_x on that fiber are equal.',
    descent_sufficiency: 'If K_x is constant on each occupied fiber, assign the common support as Kbar(y).',
    occupied_only: 'The theorem governs y in q(X); empty quotient fibers receive no invented intersection or support.',
    sound_extremal: 'A is universally sound iff A is contained in every K_x iff A subseteq intersection K_x.',
    complete_extremal: 'A is universally complete iff every K_x is contained in A iff union K_x subseteq A.',
    gap_identity: '|A\\I|+|U\\A|=|U\\I|+|A\\U|+|I\\A| by disjoint finite set decomposition.',
    equality: 'The lower bound is tight iff A has no values outside U and omits no values from I, i.e. I subseteq A subseteq U.',
    frontier: 'Every tight A is uniquely I union S for S subseteq U\\I; S is the false-admission partition and the complement gap is the omission partition.',
    authority: 'FINITE_SET_THEOREM_NOT_ENUMERATION_HORIZON',
  });
}

function exactDescentPositiveHostile() {
  const rows = [
    { antecedent: 'a', quotient: 'y', support: [0, 1] },
    { antecedent: 'b', quotient: 'y', support: [1, 0] },
    { antecedent: 'c', quotient: 'z', support: [2] },
  ];
  const profile = finiteAdmissibilityDescentProfile(rows);
  const rule = materializeExactDescendedRule(rows);
  return freeze({
    passed: profile.status === 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED'
      && profile.exact_descended_rule_exists
      && profile.occupied_quotient_count === 2
      && profile.occupied_fibers.every((fiber) => fiber.irreducible_gap_cardinality === 0)
      && rule.status === 'EXACT_FINITE_DESCENDED_ADMISSIBILITY_RULE_MATERIALIZED',
    profile, rule,
  });
}

function disjointSupportHostile() {
  const rows = [
    { antecedent: 'a', quotient: 'y', support: [0] },
    { antecedent: 'b', quotient: 'y', support: [1] },
  ];
  const profile = finiteAdmissibilityDescentProfile(rows);
  const candidates = [[], [0], [1], [0, 1]].map((candidate) => auditFiniteSurvivingSupport(rows, 'y', candidate));
  return freeze({
    passed: profile.status === 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED'
      && !profile.exact_descended_rule_exists
      && profile.occupied_fibers[0].union_cardinality === 2
      && profile.occupied_fibers[0].intersection_cardinality === 0
      && profile.occupied_fibers[0].irreducible_gap_cardinality === 2
      && candidates.every((audit) => audit.status === 'FINITE_SURVIVING_SUPPORT_AUDITED'
        && audit.discrepancy_score === 2
        && audit.gap_lower_bound === 2
        && !audit.exact_sound_and_complete),
    profile, candidates: freeze(candidates),
  });
}

function overlappingFrontierHostile() {
  const rows = [
    { antecedent: 'a', quotient: 'y', support: [0, 1] },
    { antecedent: 'b', quotient: 'y', support: [1, 2] },
  ];
  const intersection = auditFiniteSurvivingSupport(rows, 'y', [1]);
  const union = auditFiniteSurvivingSupport(rows, 'y', [0, 1, 2]);
  const middle = auditFiniteSurvivingSupport(rows, 'y', [0, 1]);
  const outside = auditFiniteSurvivingSupport(rows, 'y', [0, 1, 2, 3]);
  const below = auditFiniteSurvivingSupport(rows, 'y', [0]);
  const choice = finiteMinimalDistortionChoice(rows, 'y', [0]);
  return freeze({
    passed: [intersection, union, middle].every((audit) => audit.status === 'FINITE_SURVIVING_SUPPORT_AUDITED'
        && audit.discrepancy_score === 2
        && audit.achieves_gap_lower_bound
        && audit.inside_minimal_envelope)
      && intersection.universally_sound && !intersection.universally_complete
      && union.universally_complete && !union.universally_sound
      && middle.false_admission_cardinality === 1 && middle.omission_cardinality === 1
      && outside.discrepancy_score === 3 && outside.outside_union_cardinality === 1
      && below.discrepancy_score === 3 && below.omitted_intersection_cardinality === 1
      && choice.status === 'FINITE_MINIMAL_DISTORTION_CHOICE_DERIVED'
      && choice.discrepancy_score === 2,
    intersection, union, middle, outside, below, choice,
  });
}

function unoccupiedHostile() {
  const rows = [{ antecedent: 'a', quotient: 'occupied', support: [0] }];
  const audit = auditFiniteSurvivingSupport(rows, 'empty', []);
  return freeze({
    passed: audit.status === 'UNOCCUPIED_QUOTIENT_STATE_HAS_NO_DESCENT_AUTHORITY',
    audit,
  });
}

function localGlobalHostile() {
  const rows = [
    { antecedent: 'a', quotient: 'good', support: [0, 1] },
    { antecedent: 'b', quotient: 'good', support: [0, 1] },
    { antecedent: 'c', quotient: 'bad', support: [2] },
    { antecedent: 'd', quotient: 'bad', support: [3] },
  ];
  const profile = finiteAdmissibilityDescentProfile(rows);
  const good = profile.occupied_fibers.find((fiber) => fiber.quotient === 'good');
  const bad = profile.occupied_fibers.find((fiber) => fiber.quotient === 'bad');
  return freeze({
    passed: !profile.exact_descended_rule_exists
      && good?.supports_constant_on_fiber && good?.irreducible_gap_cardinality === 0
      && !bad?.supports_constant_on_fiber && bad?.irreducible_gap_cardinality === 2,
    profile,
  });
}

function renamingOrderingHostile() {
  const left = [
    { antecedent: 'a', quotient: 'y', support: [0, 1] },
    { antecedent: 'b', quotient: 'y', support: [1, 2] },
  ];
  const right = [
    { antecedent: 'beta', quotient: 'omega', support: [2, 1] },
    { antecedent: 'alpha', quotient: 'omega', support: [1, 0] },
  ];
  const lp = finiteAdmissibilityDescentProfile(left);
  const rp = finiteAdmissibilityDescentProfile(right);
  const lf = lp.occupied_fibers[0];
  const rf = rp.occupied_fibers[0];
  return freeze({
    passed: lp.exact_descended_rule_exists === rp.exact_descended_rule_exists
      && lf.union_cardinality === rf.union_cardinality
      && lf.intersection_cardinality === rf.intersection_cardinality
      && lf.irreducible_gap_cardinality === rf.irreducible_gap_cardinality,
    left: lp, right: rp,
  });
}

function inheritedRouteBridgeHostile() {
  const hostile = bridgeRouteErasureToFiniteAdmissibility(5, 0, 3, 9);
  const positive = bridgeRouteErasureToFiniteAdmissibility(3, 0, 1, 1);
  return freeze({
    passed: hostile.status === 'ROUTE_ERASURE_IS_EXACT_INSTANCE_OF_FINITE_ADMISSIBILITY_DESCENT'
      && !hostile.general_profile.exact_descended_rule_exists
      && hostile.general_profile.occupied_fibers[0].union_cardinality === 6
      && hostile.general_profile.occupied_fibers[0].intersection_cardinality === 2
      && hostile.general_profile.occupied_fibers[0].irreducible_gap_cardinality === 4
      && positive.status === 'ROUTE_ERASURE_IS_EXACT_INSTANCE_OF_FINITE_ADMISSIBILITY_DESCENT'
      && positive.general_profile.exact_descended_rule_exists
      && positive.general_profile.occupied_fibers[0].irreducible_gap_cardinality === 0,
    hostile, positive,
  });
}

export function runFiniteAdmissibilityDescentTheoremChamber() {
  const certificates = freeze({
    symbolic_theorem: symbolicTheoremCertificate(),
    exact_descent_positive: exactDescentPositiveHostile(),
    disjoint_support_obstruction: disjointSupportHostile(),
    overlapping_gap_frontier: overlappingFrontierHostile(),
    unoccupied_state_discipline: unoccupiedHostile(),
    local_global_criterion: localGlobalHostile(),
    renaming_and_ordering_invariance: renamingOrderingHostile(),
    inherited_route_erasure_bridge: inheritedRouteBridgeHostile(),
  });
  const passed = Object.values(certificates).every((certificate) => certificate.passed);
  return freeze({
    schema: FINITE_ADMISSIBILITY_DESCENT_THEOREM_SCHEMA,
    parent_receipt: FINITE_ADMISSIBILITY_DESCENT_THEOREM_PARENT_RECEIPT,
    gate_issue: FINITE_ADMISSIBILITY_DESCENT_THEOREM_GATE_ISSUE,
    status: passed
      ? 'FINITE_ADMISSIBILITY_DESCENT_THEOREM_CHAMBER_PASSED'
      : 'FINITE_ADMISSIBILITY_DESCENT_THEOREM_CHAMBER_FAILED',
    passed,
    certificates,
    canonical_candidate: passed
      ? 'FINITE_ADMISSIBILITY_DESCENDS_EXACTLY_THROUGH_A_FINITE_QUOTIENT_IF_AND_ONLY_IF_THE_ANTECEDENT_LAWFUL_SUPPORT_MAP_IS_CONSTANT_ON_EVERY_QUOTIENT_FIBER'
      : 'UNCLASSIFIED',
    consequential_candidate: passed
      ? 'WHEN_A_QUOTIENT_FIBER_CONTAINS_INCOMPATIBLE_LAWFUL_SUPPORTS_NO_SURVIVING_RULE_CAN_BE_SIMULTANEOUSLY_UNIVERSALLY_SOUND_AND_COMPLETE_AND_THE_UNION_MINUS_INTERSECTION_IS_AN_EXACT_FINITE_CERTIFICATE_OF_THE_OBSTRUCTION'
      : 'UNCLASSIFIED',
    sharp_gap_candidate: passed
      ? 'FOR_ANY_SURVIVING_SUPPORT_THE_SUM_OF_UNIVERSAL_FALSE_ADMISSION_AND_OMISSION_CARDINALITIES_IS_AT_LEAST_THE_UNION_INTERSECTION_GAP_WITH_EQUALITY_EXACTLY_FOR_SUPPORTS_BETWEEN_INTERSECTION_AND_UNION'
      : 'UNCLASSIFIED',
    architectural_candidate: passed
      ? 'ERASING_A_CONDITIONING_STATE_CAN_DESTROY_THE_EXISTENCE_OF_AN_EXACT_ADMISSIBILITY_RULE_AT_THE_SURVIVING_LAYER_EVEN_WHEN_EVERY_ANTECEDENT_RULE_WAS_EXACT_BEFORE_QUOTIENTING'
      : 'UNCLASSIFIED',
    landing: freeze({
      observable_equivalence_does_not_imply_admissibility_equivalence: true,
      exact_descent_requires_fiberwise_support_constancy: true,
      union_and_intersection_are_extremal_not_exact_substitutes_when_gap_nonempty: true,
      irreducible_gap_must_remain_visible: true,
      minimal_distortion_does_not_choose_a_unique_surviving_rule: true,
      unoccupied_quotient_states_receive_no_invented_authority: true,
    }),
  });
}

export default runFiniteAdmissibilityDescentTheoremChamber;
