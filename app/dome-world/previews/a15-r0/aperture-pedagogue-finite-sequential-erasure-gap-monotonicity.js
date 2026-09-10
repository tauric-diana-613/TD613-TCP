import {
  finiteAdmissibilityDescentProfile,
} from './aperture-pedagogue-finite-admissibility-descent-theorem.js';

export const FINITE_SEQUENTIAL_ERASURE_SCHEMA = 'td613.a15-r0.finite-sequential-erasure-gap-monotonicity/v0.1';
export const FINITE_SEQUENTIAL_ERASURE_PARENT_RECEIPT = 'ce28f7002feec256ecea191e829a2cbff7afd3b4';
export const FINITE_SEQUENTIAL_ERASURE_GATE_ISSUE = 737;

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

function valueMap(values) {
  if (!Array.isArray(values)) return null;
  const out = new Map();
  for (const value of values) {
    const key = canonicalFiniteValue(value);
    if (key === null) return null;
    if (!out.has(key)) out.set(key, value);
  }
  return out;
}

function valuesFromKeys(keys, maps) {
  const out = [];
  for (const key of [...keys].sort()) {
    for (const map of maps) {
      if (map?.has(key)) {
        out.push(map.get(key));
        break;
      }
    }
  }
  return freeze(out);
}

function normalizeSequentialRows(rows) {
  if (!Array.isArray(rows) || rows.length < 1) {
    return freeze({ status: 'FINITE_SEQUENTIAL_ERASURE_INPUT_ABSTAIN_EMPTY_OR_NONARRAY' });
  }

  const stage1ToStage2 = new Map();
  const stage1Values = new Map();
  const stage2Values = new Map();
  const qRows = [];
  const compositeRows = [];

  for (const row of rows) {
    const antecedentKey = canonicalFiniteValue(row?.antecedent);
    const stage1Key = canonicalFiniteValue(row?.stage1);
    const stage2Key = canonicalFiniteValue(row?.stage2);
    if (antecedentKey === null || stage1Key === null || stage2Key === null || !Array.isArray(row?.support)) {
      return freeze({ status: 'FINITE_SEQUENTIAL_ERASURE_INPUT_ABSTAIN_INVALID_ROW' });
    }
    if (stage1ToStage2.has(stage1Key) && stage1ToStage2.get(stage1Key) !== stage2Key) {
      return freeze({ status: 'FINITE_SEQUENTIAL_ERASURE_INPUT_ABSTAIN_STAGE2_NOT_FUNCTION_OF_STAGE1' });
    }
    stage1ToStage2.set(stage1Key, stage2Key);
    if (!stage1Values.has(stage1Key)) stage1Values.set(stage1Key, row.stage1);
    if (!stage2Values.has(stage2Key)) stage2Values.set(stage2Key, row.stage2);
    qRows.push(freeze({ antecedent: row.antecedent, quotient: row.stage1, support: row.support }));
    compositeRows.push(freeze({ antecedent: row.antecedent, quotient: row.stage2, support: row.support }));
  }

  const stage1ToStage2Rows = [...stage1ToStage2.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([stage1Key, stage2Key]) => freeze({
      stage1_key: stage1Key,
      stage1: stage1Values.get(stage1Key),
      stage2_key: stage2Key,
      stage2: stage2Values.get(stage2Key),
    }));

  return freeze({
    status: 'FINITE_SEQUENTIAL_ERASURE_INPUT_NORMALIZED',
    q_rows: freeze(qRows),
    composite_rows: freeze(compositeRows),
    stage1_to_stage2: freeze(stage1ToStage2Rows),
  });
}

function unionKeys(maps) {
  const out = new Set();
  for (const map of maps) for (const key of map.keys()) out.add(key);
  return out;
}

function intersectionKeys(maps) {
  if (maps.length < 1) return new Set();
  const out = new Set(maps[0].keys());
  for (const key of [...out]) {
    if (!maps.every((map) => map.has(key))) out.delete(key);
  }
  return out;
}

export function finiteSequentialErasureGapProfile(rows) {
  const normalized = normalizeSequentialRows(rows);
  if (normalized.status !== 'FINITE_SEQUENTIAL_ERASURE_INPUT_NORMALIZED') return normalized;

  const first = finiteAdmissibilityDescentProfile(normalized.q_rows);
  const second = finiteAdmissibilityDescentProfile(normalized.composite_rows);
  if (first.status !== 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED'
      || second.status !== 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED') {
    return freeze({
      status: 'FINITE_SEQUENTIAL_ERASURE_PROFILE_ABSTAIN_PARENT_PROFILE',
      first_stage: first,
      second_stage: second,
    });
  }

  const firstByKey = new Map(first.occupied_fibers.map((fiber) => [canonicalFiniteValue(fiber.quotient), fiber]));
  const secondByKey = new Map(second.occupied_fibers.map((fiber) => [canonicalFiniteValue(fiber.quotient), fiber]));
  const mappingsBySecond = new Map();
  for (const mapping of normalized.stage1_to_stage2) {
    if (!mappingsBySecond.has(mapping.stage2_key)) mappingsBySecond.set(mapping.stage2_key, []);
    mappingsBySecond.get(mapping.stage2_key).push(mapping);
  }

  const certificates = [];
  for (const [stage2Key, mappings] of [...mappingsBySecond.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const secondFiber = secondByKey.get(stage2Key);
    if (!secondFiber) {
      return freeze({ status: 'FINITE_SEQUENTIAL_ERASURE_PROFILE_MISMATCH_MISSING_SECOND_FIBER' });
    }
    const firstFibers = mappings.map((mapping) => firstByKey.get(mapping.stage1_key));
    if (firstFibers.some((fiber) => !fiber)) {
      return freeze({ status: 'FINITE_SEQUENTIAL_ERASURE_PROFILE_MISMATCH_MISSING_FIRST_FIBER' });
    }

    const firstUnionMaps = firstFibers.map((fiber) => valueMap(fiber.union_support));
    const firstIntersectionMaps = firstFibers.map((fiber) => valueMap(fiber.intersection_support));
    const firstGapMaps = firstFibers.map((fiber) => valueMap(fiber.irreducible_gap));
    const secondUnionMap = valueMap(secondFiber.union_support);
    const secondIntersectionMap = valueMap(secondFiber.intersection_support);
    const secondGapMap = valueMap(secondFiber.irreducible_gap);

    const composedUnionKeys = unionKeys(firstUnionMaps);
    const composedIntersectionKeys = intersectionKeys(firstIntersectionMaps);
    const inheritedGapKeys = unionKeys(firstGapMaps);
    const crossSettledKeys = new Set([...secondGapMap.keys()].filter((key) => !inheritedGapKeys.has(key)));

    const compositionUnionExact = composedUnionKeys.size === secondUnionMap.size
      && [...composedUnionKeys].every((key) => secondUnionMap.has(key));
    const compositionIntersectionExact = composedIntersectionKeys.size === secondIntersectionMap.size
      && [...composedIntersectionKeys].every((key) => secondIntersectionMap.has(key));

    const inheritedSubsetExact = firstGapMaps.every((gap) => [...gap.keys()].every((key) => secondGapMap.has(key)));
    const decompositionExact = secondGapMap.size === inheritedGapKeys.size + crossSettledKeys.size
      && [...secondGapMap.keys()].every((key) => inheritedGapKeys.has(key) || crossSettledKeys.has(key));

    const crossCharacterizedKeys = new Set();
    for (const key of secondGapMap.keys()) {
      const signatures = firstFibers.map((fiber, index) => {
        const inGap = firstGapMaps[index].has(key);
        const inAll = firstIntersectionMaps[index].has(key);
        const inUnion = firstUnionMaps[index].has(key);
        return inGap ? 'MIXED' : inAll ? 'ALL' : !inUnion ? 'NONE' : 'INVALID';
      });
      const allSettled = signatures.every((signature) => signature === 'ALL' || signature === 'NONE');
      if (allSettled && signatures.includes('ALL') && signatures.includes('NONE')) crossCharacterizedKeys.add(key);
    }
    const crossCharacterizationExact = crossCharacterizedKeys.size === crossSettledKeys.size
      && [...crossCharacterizedKeys].every((key) => crossSettledKeys.has(key));

    const maxFirstGap = firstFibers.reduce((max, fiber) => Math.max(max, fiber.irreducible_gap_cardinality), 0);
    const monotonicCardinality = secondFiber.irreducible_gap_cardinality >= maxFirstGap;

    const sourceMaps = [secondGapMap, ...firstGapMaps, ...firstUnionMaps, ...firstIntersectionMaps];
    certificates.push(freeze({
      stage2: secondFiber.quotient,
      stage1_states: freeze(firstFibers.map((fiber) => fiber.quotient)),
      stage1_gaps: freeze(firstFibers.map((fiber) => freeze({
        stage1: fiber.quotient,
        gap: fiber.irreducible_gap,
        gap_cardinality: fiber.irreducible_gap_cardinality,
      }))),
      second_union: secondFiber.union_support,
      second_intersection: secondFiber.intersection_support,
      second_gap: secondFiber.irreducible_gap,
      inherited_gap_union: valuesFromKeys(inheritedGapKeys, sourceMaps),
      inherited_gap_union_cardinality: inheritedGapKeys.size,
      new_cross_settled_gap: valuesFromKeys(crossSettledKeys, sourceMaps),
      new_cross_settled_gap_cardinality: crossSettledKeys.size,
      composition_union_exact: compositionUnionExact,
      composition_intersection_exact: compositionIntersectionExact,
      inherited_gap_subset_exact: inheritedSubsetExact,
      gap_decomposition_exact: decompositionExact,
      cross_settled_characterization_exact: crossCharacterizationExact,
      max_first_stage_gap_cardinality: maxFirstGap,
      second_stage_gap_cardinality: secondFiber.irreducible_gap_cardinality,
      gap_cardinality_monotone: monotonicCardinality,
      passed: compositionUnionExact
        && compositionIntersectionExact
        && inheritedSubsetExact
        && decompositionExact
        && crossCharacterizationExact
        && monotonicCardinality,
    }));
  }

  const passed = certificates.length > 0 && certificates.every((certificate) => certificate.passed);
  return freeze({
    schema: FINITE_SEQUENTIAL_ERASURE_SCHEMA,
    parent_receipt: FINITE_SEQUENTIAL_ERASURE_PARENT_RECEIPT,
    gate_issue: FINITE_SEQUENTIAL_ERASURE_GATE_ISSUE,
    status: passed
      ? 'FINITE_SEQUENTIAL_ERASURE_GAP_PROFILE_DERIVED'
      : 'FINITE_SEQUENTIAL_ERASURE_GAP_PROFILE_MISMATCH',
    passed,
    first_stage_profile: first,
    second_stage_profile: second,
    second_stage_certificates: freeze(certificates),
  });
}

function newGapFromExactLocalsHostile() {
  const rows = [
    { antecedent: 'a', stage1: 'y0', stage2: 'w', support: [0] },
    { antecedent: 'b', stage1: 'y1', stage2: 'w', support: [1] },
  ];
  const profile = finiteSequentialErasureGapProfile(rows);
  const cert = profile.second_stage_certificates?.[0];
  return freeze({
    passed: profile.passed
      && cert.stage1_gaps.every((row) => row.gap_cardinality === 0)
      && JSON.stringify(cert.second_gap) === JSON.stringify([0, 1])
      && JSON.stringify(cert.new_cross_settled_gap) === JSON.stringify([0, 1])
      && cert.new_cross_settled_gap_cardinality === 2,
    profile,
  });
}

function overlappingInheritedGapHostile() {
  const rows = [
    { antecedent: 'a', stage1: 'y0', stage2: 'w', support: [0, 1] },
    { antecedent: 'b', stage1: 'y0', stage2: 'w', support: [0] },
    { antecedent: 'c', stage1: 'y1', stage2: 'w', support: [0, 1] },
    { antecedent: 'd', stage1: 'y1', stage2: 'w', support: [0] },
  ];
  const profile = finiteSequentialErasureGapProfile(rows);
  const cert = profile.second_stage_certificates?.[0];
  return freeze({
    passed: profile.passed
      && cert.stage1_gaps.every((row) => row.gap_cardinality === 1)
      && cert.inherited_gap_union_cardinality === 1
      && cert.second_stage_gap_cardinality === 1
      && cert.new_cross_settled_gap_cardinality === 0,
    profile,
  });
}

function noNewGapControl() {
  const rows = [
    { antecedent: 'a', stage1: 'y0', stage2: 'w', support: [0] },
    { antecedent: 'b', stage1: 'y1', stage2: 'w', support: [0] },
  ];
  const profile = finiteSequentialErasureGapProfile(rows);
  const cert = profile.second_stage_certificates?.[0];
  return freeze({
    passed: profile.passed
      && cert.stage1_gaps.every((row) => row.gap_cardinality === 0)
      && cert.second_stage_gap_cardinality === 0
      && cert.new_cross_settled_gap_cardinality === 0,
    profile,
  });
}

function mixedInheritedAndNewHostile() {
  const rows = [
    { antecedent: 'a', stage1: 'y0', stage2: 'w', support: [0, 1] },
    { antecedent: 'b', stage1: 'y0', stage2: 'w', support: [0] },
    { antecedent: 'c', stage1: 'y1', stage2: 'w', support: [2] },
  ];
  const profile = finiteSequentialErasureGapProfile(rows);
  const cert = profile.second_stage_certificates?.[0];
  return freeze({
    passed: profile.passed
      && cert.inherited_gap_union_cardinality === 1
      && cert.new_cross_settled_gap_cardinality === 2
      && cert.second_stage_gap_cardinality === 3,
    profile,
  });
}

function symbolicCertificate() {
  return freeze({
    passed: true,
    composition: 'For occupied w, U2_w is the union of first-stage U_y and I2_w is the intersection of first-stage I_y over y later collapsed to w.',
    monotonicity: 'Every z mixed inside one first-stage fiber remains mixed in every containing composite fiber, so Gamma_y subseteq Gamma2_w and |Gamma2_w| >= max_y |Gamma_y|.',
    decomposition: 'Gamma2_w is the disjoint union of inherited gap union H_w and new cross-settled disagreement C_w=Gamma2_w\\H_w.',
    new_gap: 'C_w consists exactly of values settled at every first-stage state but settled ALL at at least one and NONE at at least one other state later erased together.',
    nonadditivity: 'Inherited gap support is a union, not a sum; overlapping first-stage gaps must not be double-counted.',
    authority: 'FINITE_SEQUENTIAL_QUOTIENT_THEOREM_NOT_STOCHASTIC_DATA_PROCESSING_OR_CAUSAL_RECONSTRUCTION',
  });
}

export function runFiniteSequentialErasureGapMonotonicityChamber() {
  const certificates = freeze({
    symbolic_theorem: symbolicCertificate(),
    new_gap_from_exact_locals: newGapFromExactLocalsHostile(),
    overlapping_inherited_gap_nonadditivity: overlappingInheritedGapHostile(),
    no_new_gap_control: noNewGapControl(),
    mixed_inherited_and_new_gap: mixedInheritedAndNewHostile(),
  });
  const passed = Object.values(certificates).every((certificate) => certificate.passed);
  return freeze({
    schema: FINITE_SEQUENTIAL_ERASURE_SCHEMA,
    parent_receipt: FINITE_SEQUENTIAL_ERASURE_PARENT_RECEIPT,
    gate_issue: FINITE_SEQUENTIAL_ERASURE_GATE_ISSUE,
    status: passed
      ? 'FINITE_SEQUENTIAL_ERASURE_GAP_MONOTONICITY_CHAMBER_PASSED'
      : 'FINITE_SEQUENTIAL_ERASURE_GAP_MONOTONICITY_CHAMBER_FAILED',
    passed,
    certificates,
    canonical_candidate: passed
      ? 'UNDER_FINITE_SEQUENTIAL_ERASURE_EVERY_FIRST_STAGE_IRREDUCIBLE_GAP_EMBEDS_IN_THE_CONTAINING_COMPOSITE_GAP_SO_FURTHER_ERASURE_CANNOT_SHRINK_EXISTING_ADMISSIBILITY_DISAGREEMENT'
      : 'UNCLASSIFIED',
    decomposition_candidate: passed
      ? 'THE_COMPOSITE_GAP_IS_EXACTLY_THE_DISJOINT_UNION_OF_INHERITED_FIRST_STAGE_GAP_SUPPORT_AND_NEW_CROSS_SETTLED_DISAGREEMENT_CREATED_BY_LATER_ERASURE'
      : 'UNCLASSIFIED',
    architectural_candidate: passed
      ? 'A_LATER_INFORMATION_LOSS_CAN_CREATE_CLAIM_AUTHORITY_DEBT_FROM_PREVIOUSLY_EXACT_LOCAL_STATES_BY_COLLAPSING_STATES_WITH_MUTUALLY_INCOMPATIBLE_SETTLED_AUTHORITY'
      : 'UNCLASSIFIED',
  });
}

export default runFiniteSequentialErasureGapMonotonicityChamber;