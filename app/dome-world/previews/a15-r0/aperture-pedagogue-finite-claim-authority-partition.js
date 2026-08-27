import {
  finiteAdmissibilityDescentProfile,
  bridgeRouteErasureToFiniteAdmissibility,
} from './aperture-pedagogue-finite-admissibility-descent-theorem.js';

export const FINITE_CLAIM_AUTHORITY_PARTITION_SCHEMA = 'td613.a15-r0.finite-claim-authority-partition/v0.1';
export const FINITE_CLAIM_AUTHORITY_PARTITION_PARENT_RECEIPT = '11eec2d52c7e1aa722e8664c0df4cd1a61d704f1';
export const FINITE_CLAIM_AUTHORITY_PARTITION_GATE_ISSUE = 737;

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
  if (typeof value === 'number' && Number.isFinite(value)) return `n:${Object.is(value, -0) ? '0' : String(value)}`;
  if (Array.isArray(value)) {
    const parts = value.map(canonicalFiniteValue);
    if (parts.some((part) => part === null)) return null;
    return `a:${JSON.stringify(parts)}`;
  }
  return null;
}

function normalizeFiniteSet(values) {
  if (!Array.isArray(values)) return null;
  const map = new Map();
  for (const value of values) {
    const k = canonicalFiniteValue(value);
    if (k === null) return null;
    if (!map.has(k)) map.set(k, value);
  }
  return freeze([...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value));
}

function setMap(values) {
  const normalized = normalizeFiniteSet(values);
  if (normalized === null) return null;
  return new Map(normalized.map((value) => [canonicalFiniteValue(value), value]));
}

function sameFiniteValue(left, right) {
  const lk = canonicalFiniteValue(left);
  const rk = canonicalFiniteValue(right);
  return lk !== null && lk === rk;
}

function valuesFromKeys(keys, maps) {
  const out = [];
  for (const key of [...keys].sort()) {
    for (const map of maps) {
      if (map.has(key)) {
        out.push(map.get(key));
        break;
      }
    }
  }
  return freeze(out);
}

function findFiber(rows, quotient) {
  const profile = finiteAdmissibilityDescentProfile(rows);
  if (profile.status !== 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED') return { profile, fiber: null };
  const fiber = profile.occupied_fibers.find((candidate) => sameFiniteValue(candidate.quotient, quotient)) ?? null;
  return { profile, fiber };
}

export function finiteClaimAuthorityProfile(rows, quotient, ambientValues) {
  const ambient = normalizeFiniteSet(ambientValues);
  const { profile, fiber } = findFiber(rows, quotient);
  if (ambient === null || profile.status !== 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED') {
    return freeze({ status: 'FINITE_CLAIM_AUTHORITY_PROFILE_ABSTAIN' });
  }
  if (!fiber) {
    return freeze({
      status: 'UNOCCUPIED_QUOTIENT_STATE_HAS_NO_CLAIM_AUTHORITY',
      quotient,
    });
  }

  const ambientMap = setMap(ambient);
  const unionMap = setMap(fiber.union_support);
  const intersectionMap = setMap(fiber.intersection_support);
  const gapMap = setMap(fiber.irreducible_gap);

  if ([...unionMap.keys()].some((key) => !ambientMap.has(key))) {
    return freeze({
      status: 'FINITE_CLAIM_AUTHORITY_AMBIENT_DOES_NOT_CONTAIN_ALL_ANTECEDENT_SUPPORT',
      quotient: fiber.quotient,
    });
  }

  const allKeys = new Set(intersectionMap.keys());
  const dependentKeys = new Set(gapMap.keys());
  const noneKeys = new Set([...ambientMap.keys()].filter((key) => !unionMap.has(key)));
  const regions = [allKeys, noneKeys, dependentKeys];
  const pairwiseDisjoint = regions.every((left, i) => regions.every((right, j) => (
    i === j || [...left].every((key) => !right.has(key))
  )));
  const regionUnion = new Set(regions.flatMap((set) => [...set]));
  const partitionExact = pairwiseDisjoint
    && regionUnion.size === ambientMap.size
    && [...ambientMap.keys()].every((key) => regionUnion.has(key));

  const allValues = valuesFromKeys(allKeys, [intersectionMap, ambientMap]);
  const noneValues = valuesFromKeys(noneKeys, [ambientMap]);
  const dependentValues = valuesFromKeys(dependentKeys, [gapMap, unionMap, ambientMap]);
  const nonemptyCount = [allKeys.size, noneKeys.size, dependentKeys.size].filter((size) => size > 0).length;

  const exactSemantics = allValues.every((value) => fiber.antecedent_supports.every((row) => setMap(row.support).has(canonicalFiniteValue(value))))
    && noneValues.every((value) => fiber.antecedent_supports.every((row) => !setMap(row.support).has(canonicalFiniteValue(value))))
    && dependentValues.every((value) => {
      const memberships = fiber.antecedent_supports.map((row) => setMap(row.support).has(canonicalFiniteValue(value)));
      return memberships.some(Boolean) && memberships.some((member) => !member);
    });

  return freeze({
    status: partitionExact && exactSemantics
      ? 'EXACT_FINITE_CLAIM_AUTHORITY_PARTITION_DERIVED'
      : 'FINITE_CLAIM_AUTHORITY_PARTITION_MISMATCH',
    quotient: fiber.quotient,
    ambient: freeze(ambient),
    universally_admissible: allValues,
    universally_inadmissible: noneValues,
    conditioning_dependent: dependentValues,
    universally_admissible_cardinality: allKeys.size,
    universally_inadmissible_cardinality: noneKeys.size,
    conditioning_dependent_cardinality: dependentKeys.size,
    irreducible_gap_cardinality: fiber.irreducible_gap_cardinality,
    exact_partition: partitionExact,
    exact_universal_semantics: exactSemantics,
    minimum_exact_authority_label_count: nonemptyCount,
    all_three_authority_classes_nonempty: nonemptyCount === 3,
    binary_universal_claim_error_minimum: dependentKeys.size,
    binary_error_minimum_equals_irreducible_gap: dependentKeys.size === fiber.irreducible_gap_cardinality,
    authority_signature_legend: freeze({
      UNIVERSALLY_ADMISSIBLE: freeze([true, false]),
      UNIVERSALLY_INADMISSIBLE: freeze([false, true]),
      CONDITIONING_DEPENDENT: freeze([false, false]),
      IMPOSSIBLE_ON_OCCUPIED_FIBER: freeze([true, true]),
    }),
  });
}

export function classifyClaimAuthority(rows, quotient, ambientValues, value) {
  const profile = finiteClaimAuthorityProfile(rows, quotient, ambientValues);
  if (profile.status !== 'EXACT_FINITE_CLAIM_AUTHORITY_PARTITION_DERIVED') return profile;
  const k = canonicalFiniteValue(value);
  if (k === null || !setMap(profile.ambient).has(k)) {
    return freeze({ status: 'CLAIM_AUTHORITY_VALUE_OUTSIDE_DECLARED_AMBIENT' });
  }
  if (setMap(profile.universally_admissible).has(k)) {
    return freeze({
      status: 'EXACT_CLAIM_AUTHORITY_CLASSIFIED',
      authority: 'UNIVERSALLY_ADMISSIBLE',
      child_legible: 'LAWFUL UNDER EVERY SURVIVING ANTECEDENT',
    });
  }
  if (setMap(profile.universally_inadmissible).has(k)) {
    return freeze({
      status: 'EXACT_CLAIM_AUTHORITY_CLASSIFIED',
      authority: 'UNIVERSALLY_INADMISSIBLE',
      child_legible: 'UNLAWFUL UNDER EVERY SURVIVING ANTECEDENT',
    });
  }
  return freeze({
    status: 'EXACT_CLAIM_AUTHORITY_CLASSIFIED',
    authority: 'CONDITIONING_DEPENDENT',
    child_legible: 'DEPENDS ON ERASED CONDITIONING INFORMATION',
  });
}

export function auditAuthorityClassifier(rows, quotient, ambientValues, assignments) {
  const profile = finiteClaimAuthorityProfile(rows, quotient, ambientValues);
  if (profile.status !== 'EXACT_FINITE_CLAIM_AUTHORITY_PARTITION_DERIVED' || !Array.isArray(assignments)) {
    return freeze({ status: 'AUTHORITY_CLASSIFIER_AUDIT_ABSTAIN' });
  }
  const assignmentMap = new Map();
  for (const row of assignments) {
    const key = canonicalFiniteValue(row?.value);
    if (key === null || typeof row?.label !== 'string' || assignmentMap.has(key)) {
      return freeze({ status: 'AUTHORITY_CLASSIFIER_AUDIT_INVALID_ASSIGNMENTS' });
    }
    assignmentMap.set(key, row.label);
  }
  const ambientMap = setMap(profile.ambient);
  if (assignmentMap.size !== ambientMap.size || [...ambientMap.keys()].some((key) => !assignmentMap.has(key))) {
    return freeze({ status: 'AUTHORITY_CLASSIFIER_AUDIT_INCOMPLETE_ASSIGNMENTS' });
  }

  const signatureByKey = new Map();
  for (const value of profile.ambient) {
    const classification = classifyClaimAuthority(rows, quotient, ambientValues, value);
    const signature = classification.authority === 'UNIVERSALLY_ADMISSIBLE'
      ? '[true,false]'
      : classification.authority === 'UNIVERSALLY_INADMISSIBLE'
        ? '[false,true]'
        : '[false,false]';
    signatureByKey.set(canonicalFiniteValue(value), signature);
  }

  const signaturesByLabel = new Map();
  for (const [key, label] of assignmentMap) {
    if (!signaturesByLabel.has(label)) signaturesByLabel.set(label, new Set());
    signaturesByLabel.get(label).add(signatureByKey.get(key));
  }
  const exact = [...signaturesByLabel.values()].every((signatures) => signatures.size === 1);
  const labelsUsed = new Set(assignmentMap.values()).size;
  return freeze({
    status: 'AUTHORITY_CLASSIFIER_AUDITED',
    universal_authority_exact: exact,
    labels_used: labelsUsed,
    theoretical_minimum_exact_labels: profile.minimum_exact_authority_label_count,
    reaches_theoretical_minimum: exact && labelsUsed === profile.minimum_exact_authority_label_count,
  });
}

export function binaryUniversalClaimAudit(rows, quotient, ambientValues, assignments) {
  const profile = finiteClaimAuthorityProfile(rows, quotient, ambientValues);
  if (profile.status !== 'EXACT_FINITE_CLAIM_AUTHORITY_PARTITION_DERIVED' || !Array.isArray(assignments)) {
    return freeze({ status: 'BINARY_UNIVERSAL_CLAIM_AUDIT_ABSTAIN' });
  }
  const allowed = new Set(['UNIVERSALLY_ADMISSIBLE', 'UNIVERSALLY_INADMISSIBLE']);
  const assignmentMap = new Map();
  for (const row of assignments) {
    const key = canonicalFiniteValue(row?.value);
    if (key === null || !allowed.has(row?.claim) || assignmentMap.has(key)) {
      return freeze({ status: 'BINARY_UNIVERSAL_CLAIM_AUDIT_INVALID_ASSIGNMENTS' });
    }
    assignmentMap.set(key, row.claim);
  }
  const ambientMap = setMap(profile.ambient);
  if (assignmentMap.size !== ambientMap.size || [...ambientMap.keys()].some((key) => !assignmentMap.has(key))) {
    return freeze({ status: 'BINARY_UNIVERSAL_CLAIM_AUDIT_INCOMPLETE_ASSIGNMENTS' });
  }

  let falseClaims = 0;
  for (const value of profile.ambient) {
    const key = canonicalFiniteValue(value);
    const truth = classifyClaimAuthority(rows, quotient, ambientValues, value).authority;
    if (assignmentMap.get(key) !== truth) falseClaims += 1;
  }
  return freeze({
    status: 'BINARY_UNIVERSAL_CLAIM_AUDITED',
    false_universal_claims: falseClaims,
    lower_bound: profile.conditioning_dependent_cardinality,
    lower_bound_respected: falseClaims >= profile.conditioning_dependent_cardinality,
    tight: falseClaims === profile.conditioning_dependent_cardinality,
  });
}

export function bridgeRouteErasureToClaimAuthority(t, E, O, P, ambientValues) {
  const bridge = bridgeRouteErasureToFiniteAdmissibility(t, E, O, P);
  if (bridge.status !== 'ROUTE_ERASURE_IS_EXACT_INSTANCE_OF_FINITE_ADMISSIBILITY_DESCENT') {
    return freeze({ status: 'ROUTE_ERASURE_TO_CLAIM_AUTHORITY_BRIDGE_ABSTAIN', bridge });
  }
  const quotient = freeze([t, E, O, P]);
  const rows = bridge.route_profile.routes.map((route) => freeze({
    antecedent: freeze(['route', route.route_rank]),
    quotient,
    support: route.support,
  }));
  const authority = finiteClaimAuthorityProfile(rows, quotient, ambientValues);
  return freeze({
    status: authority.status === 'EXACT_FINITE_CLAIM_AUTHORITY_PARTITION_DERIVED'
      ? 'ROUTE_ERASURE_IS_EXACT_INSTANCE_OF_FINITE_CLAIM_AUTHORITY_PARTITION'
      : 'ROUTE_ERASURE_CLAIM_AUTHORITY_BRIDGE_MISMATCH',
    authority,
    finite_admissibility_bridge: bridge,
  });
}

function symbolicCertificate() {
  return freeze({
    passed: true,
    partition: 'For occupied y, I_y, Z\\U_y, and U_y\\I_y are pairwise disjoint and cover Z.',
    semantics: 'These regions are exactly all-antecedents admit, all-antecedents reject, and mixed antecedent membership.',
    signature_count: 'Only signatures (1,0), (0,1), and (0,0) occur; (1,1) is impossible on a nonempty quotient fiber.',
    coarsest: 'An exact classifier from which both universal predicates are recoverable cannot merge distinct signatures; grouping equal signatures is therefore the unique coarsest exact partition up to label renaming.',
    minimum_labels: 'Minimum exact label count equals the number of nonempty authority signature classes.',
    binary_bound: 'Every dependent value makes both semantic binary universal claims false, so any total binary universal-claim surface has at least |Gamma_y| false claims; correct labels off Gamma attain equality.',
    authority: 'FINITE_PRESENTATION_THEOREM_NOT_HUMAN_FACTORS_OR_PROBABILITY',
  });
}

function threeRegionHostile() {
  const rows = [
    { antecedent: 'a', quotient: 'y', support: [0, 1] },
    { antecedent: 'b', quotient: 'y', support: [0, 2] },
  ];
  const ambient = [0, 1, 2, 3];
  const profile = finiteClaimAuthorityProfile(rows, 'y', ambient);
  const ternary = auditAuthorityClassifier(rows, 'y', ambient, [
    { value: 0, label: 'ALL' },
    { value: 1, label: 'DEPENDENT' },
    { value: 2, label: 'DEPENDENT' },
    { value: 3, label: 'NONE' },
  ]);
  const binaryClassifier = auditAuthorityClassifier(rows, 'y', ambient, [
    { value: 0, label: 'YES' },
    { value: 1, label: 'YES' },
    { value: 2, label: 'NO' },
    { value: 3, label: 'NO' },
  ]);
  const binarySemantic = binaryUniversalClaimAudit(rows, 'y', ambient, [
    { value: 0, claim: 'UNIVERSALLY_ADMISSIBLE' },
    { value: 1, claim: 'UNIVERSALLY_ADMISSIBLE' },
    { value: 2, claim: 'UNIVERSALLY_INADMISSIBLE' },
    { value: 3, claim: 'UNIVERSALLY_INADMISSIBLE' },
  ]);
  return freeze({
    passed: profile.status === 'EXACT_FINITE_CLAIM_AUTHORITY_PARTITION_DERIVED'
      && JSON.stringify(profile.universally_admissible) === JSON.stringify([0])
      && JSON.stringify(profile.conditioning_dependent) === JSON.stringify([1, 2])
      && JSON.stringify(profile.universally_inadmissible) === JSON.stringify([3])
      && profile.minimum_exact_authority_label_count === 3
      && profile.binary_universal_claim_error_minimum === 2
      && ternary.universal_authority_exact && ternary.labels_used === 3 && ternary.reaches_theoretical_minimum
      && !binaryClassifier.universal_authority_exact
      && binarySemantic.false_universal_claims === 2 && binarySemantic.tight,
    profile, ternary, binary_classifier: binaryClassifier, binary_semantic: binarySemantic,
  });
}

function exactDescentControl() {
  const rows = [
    { antecedent: 'a', quotient: 'y', support: [0, 1] },
    { antecedent: 'b', quotient: 'y', support: [0, 1] },
  ];
  const profile = finiteClaimAuthorityProfile(rows, 'y', [0, 1, 2]);
  return freeze({
    passed: profile.status === 'EXACT_FINITE_CLAIM_AUTHORITY_PARTITION_DERIVED'
      && profile.conditioning_dependent_cardinality === 0
      && profile.minimum_exact_authority_label_count === 2
      && profile.binary_universal_claim_error_minimum === 0
      && profile.exact_partition,
    profile,
  });
}

function ambientAndUnoccupiedHostile() {
  const rows = [
    { antecedent: 'a', quotient: 'y', support: [0, 1] },
    { antecedent: 'b', quotient: 'y', support: [0, 2] },
  ];
  const undersized = finiteClaimAuthorityProfile(rows, 'y', [0, 1, 3]);
  const unoccupied = finiteClaimAuthorityProfile(rows, 'z', [0, 1, 2, 3]);
  return freeze({
    passed: undersized.status === 'FINITE_CLAIM_AUTHORITY_AMBIENT_DOES_NOT_CONTAIN_ALL_ANTECEDENT_SUPPORT'
      && unoccupied.status === 'UNOCCUPIED_QUOTIENT_STATE_HAS_NO_CLAIM_AUTHORITY',
    undersized, unoccupied,
  });
}

function inheritedBridgeHostile() {
  const hostileBridge = bridgeRouteErasureToFiniteAdmissibility(5, 0, 3, 9);
  if (hostileBridge.status !== 'ROUTE_ERASURE_IS_EXACT_INSTANCE_OF_FINITE_ADMISSIBILITY_DESCENT') {
    return freeze({ passed: false, hostileBridge });
  }
  const fiber = hostileBridge.general_profile.occupied_fibers[0];
  const outside = freeze([9, 9, 9, 9]);
  const ambient = freeze([...fiber.union_support, outside]);
  const authority = bridgeRouteErasureToClaimAuthority(5, 0, 3, 9, ambient);
  return freeze({
    passed: authority.status === 'ROUTE_ERASURE_IS_EXACT_INSTANCE_OF_FINITE_CLAIM_AUTHORITY_PARTITION'
      && authority.authority.conditioning_dependent_cardinality === 4
      && authority.authority.universally_inadmissible_cardinality === 1
      && authority.authority.binary_universal_claim_error_minimum === 4,
    authority,
  });
}

export function runFiniteClaimAuthorityPartitionChamber() {
  const certificates = freeze({
    symbolic: symbolicCertificate(),
    three_region_hostile: threeRegionHostile(),
    exact_descent_control: exactDescentControl(),
    ambient_and_unoccupied_discipline: ambientAndUnoccupiedHostile(),
    inherited_751_752_bridge: inheritedBridgeHostile(),
  });
  const passed = Object.values(certificates).every((certificate) => certificate.passed);
  return freeze({
    schema: FINITE_CLAIM_AUTHORITY_PARTITION_SCHEMA,
    parent_receipt: FINITE_CLAIM_AUTHORITY_PARTITION_PARENT_RECEIPT,
    gate_issue: FINITE_CLAIM_AUTHORITY_PARTITION_GATE_ISSUE,
    status: passed ? 'FINITE_CLAIM_AUTHORITY_PARTITION_CHAMBER_PASSED' : 'FINITE_CLAIM_AUTHORITY_PARTITION_CHAMBER_FAILED',
    passed,
    certificates,
    canonical_candidate: passed
      ? 'THE_UNIVERSALLY_ADMISSIBLE_UNIVERSALLY_INADMISSIBLE_AND_CONDITIONING_DEPENDENT_REGIONS_FORM_THE_UNIQUE_COARSEST_EXACT_PARTITION_FOR_UNIVERSAL_CLAIM_AUTHORITY_UP_TO_LABEL_RENAMING'
      : 'UNCLASSIFIED',
    consequential_candidate: passed
      ? 'WHEN_ALL_THREE_AUTHORITY_REGIONS_ARE_NONEMPTY_NO_TWO_LABEL_PRESENTATION_CAN_PRESERVE_EXACT_UNIVERSAL_CLAIM_AUTHORITY'
      : 'UNCLASSIFIED',
    architectural_candidate: passed
      ? 'ANY_TOTAL_BINARY_CERTAINTY_SURFACE_MUST_MAKE_AT_LEAST_ONE_FALSE_UNIVERSAL_CLAIM_FOR_EVERY_VALUE_IN_THE_IRREDUCIBLE_DESCENT_GAP_AND_THE_BOUND_IS_EXACTLY_TIGHT'
      : 'UNCLASSIFIED',
    child_legible_candidate: passed
      ? 'CHILD_LEGIBLE_AIA_CAN_RENDER_THE_IRREDUCIBLE_GAP_AS_DEPENDS_ON_ERASED_CONDITIONING_INFORMATION_WITHOUT_FABRICATING_RECOVERED_PROVENANCE'
      : 'UNCLASSIFIED',
  });
}

export default runFiniteClaimAuthorityPartitionChamber;
