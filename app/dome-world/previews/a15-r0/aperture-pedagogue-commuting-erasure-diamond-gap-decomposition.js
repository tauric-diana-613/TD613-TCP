import {
  finiteSequentialErasureGapProfile,
} from './aperture-pedagogue-finite-sequential-erasure-gap-monotonicity.js';

export const COMMUTING_ERASURE_DIAMOND_SCHEMA = 'td613.a15-r0.commuting-erasure-diamond-gap-decomposition/v0.1';
export const COMMUTING_ERASURE_DIAMOND_PARENT_RECEIPT = '40bcc658bf34a2f31e5f1b20bcc51fe1d9d9c0ba';
export const COMMUTING_ERASURE_DIAMOND_GATE_ISSUE = 737;

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

function canonicalSupport(support) {
  if (!Array.isArray(support)) return null;
  const keys = support.map(canonicalFiniteValue);
  if (keys.some((key) => key === null)) return null;
  return [...new Set(keys)].sort();
}

function sameCanonicalArray(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  const aa = a.map(canonicalFiniteValue).sort();
  const bb = b.map(canonicalFiniteValue).sort();
  return aa.every((value, index) => value === bb[index]);
}

function keySet(values) {
  return new Set((values ?? []).map(canonicalFiniteValue));
}

function setEquals(a, b) {
  return a.size === b.size && [...a].every((key) => b.has(key));
}

function subset(a, b) {
  return [...a].every((key) => b.has(key));
}

function symmetricDifference(a, b) {
  return new Set([...a].filter((key) => !b.has(key)).concat([...b].filter((key) => !a.has(key))));
}

function representativeMap(...arrays) {
  const out = new Map();
  for (const values of arrays) {
    for (const value of values ?? []) {
      const key = canonicalFiniteValue(value);
      if (!out.has(key)) out.set(key, value);
    }
  }
  return out;
}

function valuesFromKeySet(keys, representatives) {
  return freeze([...keys].sort().map((key) => representatives.get(key) ?? key));
}

function normalizeDiamondRows(rowsA, rowsB) {
  if (!Array.isArray(rowsA) || !Array.isArray(rowsB) || rowsA.length < 1 || rowsB.length < 1) {
    return freeze({ status: 'COMMUTING_ERASURE_DIAMOND_INPUT_ABSTAIN_EMPTY_OR_NONARRAY' });
  }

  const indexRows = (rows) => {
    const out = new Map();
    for (const row of rows) {
      const antecedentKey = canonicalFiniteValue(row?.antecedent);
      const terminalKey = canonicalFiniteValue(row?.stage2);
      const support = canonicalSupport(row?.support);
      if (antecedentKey === null || terminalKey === null || canonicalFiniteValue(row?.stage1) === null || support === null) return null;
      if (out.has(antecedentKey)) return null;
      out.set(antecedentKey, freeze({
        antecedent: row.antecedent,
        stage1: row.stage1,
        stage2: row.stage2,
        terminal_key: terminalKey,
        support_keys: support,
        support: row.support,
      }));
    }
    return out;
  };

  const a = indexRows(rowsA);
  const b = indexRows(rowsB);
  if (!a || !b || a.size !== b.size || ![...a.keys()].every((key) => b.has(key))) {
    return freeze({ status: 'COMMUTING_ERASURE_DIAMOND_INPUT_ABSTAIN_ANTECEDENT_MISMATCH' });
  }

  for (const key of a.keys()) {
    const left = a.get(key);
    const right = b.get(key);
    if (left.terminal_key !== right.terminal_key) {
      return freeze({ status: 'COMMUTING_ERASURE_DIAMOND_INPUT_ABSTAIN_NONCOMMUTING_COMPOSITE' });
    }
    if (left.support_keys.length !== right.support_keys.length
      || !left.support_keys.every((value, index) => value === right.support_keys[index])) {
      return freeze({ status: 'COMMUTING_ERASURE_DIAMOND_INPUT_ABSTAIN_SUPPORT_MISMATCH' });
    }
  }

  return freeze({ status: 'COMMUTING_ERASURE_DIAMOND_INPUT_NORMALIZED', a, b });
}

function certificateByTerminal(profile) {
  return new Map((profile.second_stage_certificates ?? []).map((cert) => [canonicalFiniteValue(cert.stage2), cert]));
}

function inducedPartition(rows, terminalKey) {
  const blocks = new Map();
  for (const row of rows) {
    if (canonicalFiniteValue(row.stage2) !== terminalKey) continue;
    const stage1Key = canonicalFiniteValue(row.stage1);
    if (!blocks.has(stage1Key)) blocks.set(stage1Key, new Set());
    blocks.get(stage1Key).add(canonicalFiniteValue(row.antecedent));
  }
  return blocks;
}

function partitionRefines(fineRows, coarseRows, terminalKey) {
  const fine = inducedPartition(fineRows, terminalKey);
  const coarse = inducedPartition(coarseRows, terminalKey);
  const coarseOwner = new Map();
  for (const [blockKey, members] of coarse.entries()) {
    for (const member of members) coarseOwner.set(member, blockKey);
  }
  for (const members of fine.values()) {
    const owners = new Set([...members].map((member) => coarseOwner.get(member)));
    if (owners.has(undefined) || owners.size !== 1) return false;
  }
  return true;
}

function roleCharacterization(rows, terminal, terminalGap) {
  const terminalKey = canonicalFiniteValue(terminal);
  const gapKeys = keySet(terminalGap);
  const blocks = new Map();
  for (const row of rows) {
    if (canonicalFiniteValue(row.stage2) !== terminalKey) continue;
    const stage1Key = canonicalFiniteValue(row.stage1);
    if (!blocks.has(stage1Key)) blocks.set(stage1Key, []);
    blocks.get(stage1Key).push(row);
  }

  const inherited = new Set();
  const cross = new Set();
  for (const zKey of gapKeys) {
    const signatures = [];
    for (const blockRows of blocks.values()) {
      const memberships = blockRows.map((row) => keySet(row.support).has(zKey));
      const hasTrue = memberships.includes(true);
      const hasFalse = memberships.includes(false);
      signatures.push(hasTrue && hasFalse ? 'MIXED' : hasTrue ? 'ALL' : 'NONE');
    }
    if (signatures.includes('MIXED')) inherited.add(zKey);
    else if (signatures.includes('ALL') && signatures.includes('NONE')) cross.add(zKey);
  }
  return freeze({ inherited, cross });
}

export function finiteCommutingErasureDiamondProfile(rowsA, rowsB) {
  const normalized = normalizeDiamondRows(rowsA, rowsB);
  if (normalized.status !== 'COMMUTING_ERASURE_DIAMOND_INPUT_NORMALIZED') return normalized;

  const profileA = finiteSequentialErasureGapProfile(rowsA);
  const profileB = finiteSequentialErasureGapProfile(rowsB);
  if (!profileA.passed || !profileB.passed) {
    return freeze({
      status: 'COMMUTING_ERASURE_DIAMOND_PROFILE_ABSTAIN_PARENT_PROFILE',
      path_a: profileA,
      path_b: profileB,
    });
  }

  const aByTerminal = certificateByTerminal(profileA);
  const bByTerminal = certificateByTerminal(profileB);
  if (aByTerminal.size !== bByTerminal.size || ![...aByTerminal.keys()].every((key) => bByTerminal.has(key))) {
    return freeze({ status: 'COMMUTING_ERASURE_DIAMOND_PROFILE_MISMATCH_TERMINAL_SET' });
  }

  const certificates = [];
  for (const terminalKey of [...aByTerminal.keys()].sort()) {
    const a = aByTerminal.get(terminalKey);
    const b = bByTerminal.get(terminalKey);
    const terminal = a.stage2;

    const unionA = keySet(a.second_union);
    const unionB = keySet(b.second_union);
    const intersectionA = keySet(a.second_intersection);
    const intersectionB = keySet(b.second_intersection);
    const gapA = keySet(a.second_gap);
    const gapB = keySet(b.second_gap);
    const inheritedA = keySet(a.inherited_gap_union);
    const inheritedB = keySet(b.inherited_gap_union);
    const crossA = keySet(a.new_cross_settled_gap);
    const crossB = keySet(b.new_cross_settled_gap);

    const endpointUnionInvariant = setEquals(unionA, unionB);
    const endpointIntersectionInvariant = setEquals(intersectionA, intersectionB);
    const endpointGapInvariant = setEquals(gapA, gapB);
    const decompositionAExact = gapA.size === inheritedA.size + crossA.size
      && [...gapA].every((key) => inheritedA.has(key) || crossA.has(key))
      && [...inheritedA].every((key) => !crossA.has(key));
    const decompositionBExact = gapB.size === inheritedB.size + crossB.size
      && [...gapB].every((key) => inheritedB.has(key) || crossB.has(key))
      && [...inheritedB].every((key) => !crossB.has(key));

    const defectH = symmetricDifference(inheritedA, inheritedB);
    const defectC = symmetricDifference(crossA, crossB);
    const defectIdentity = setEquals(defectH, defectC);

    const rolesA = roleCharacterization(rowsA, terminal, a.second_gap);
    const rolesB = roleCharacterization(rowsB, terminal, b.second_gap);
    const pointwiseA = setEquals(rolesA.inherited, inheritedA) && setEquals(rolesA.cross, crossA);
    const pointwiseB = setEquals(rolesB.inherited, inheritedB) && setEquals(rolesB.cross, crossB);

    const aRefinesB = partitionRefines(rowsA, rowsB, terminalKey);
    const bRefinesA = partitionRefines(rowsB, rowsA, terminalKey);
    const refinementAtoB = !aRefinesB || (subset(inheritedA, inheritedB) && subset(crossB, crossA));
    const refinementBtoA = !bRefinesA || (subset(inheritedB, inheritedA) && subset(crossA, crossB));

    const representatives = representativeMap(
      a.second_gap,
      a.inherited_gap_union,
      a.new_cross_settled_gap,
      b.inherited_gap_union,
      b.new_cross_settled_gap,
    );

    certificates.push(freeze({
      terminal,
      endpoint_union: a.second_union,
      endpoint_intersection: a.second_intersection,
      endpoint_gap: a.second_gap,
      path_a_inherited: a.inherited_gap_union,
      path_a_cross_settled: a.new_cross_settled_gap,
      path_b_inherited: b.inherited_gap_union,
      path_b_cross_settled: b.new_cross_settled_gap,
      parallel_path_decomposition_defect: valuesFromKeySet(defectH, representatives),
      parallel_path_decomposition_defect_cardinality: defectH.size,
      endpoint_union_invariant: endpointUnionInvariant,
      endpoint_intersection_invariant: endpointIntersectionInvariant,
      endpoint_gap_invariant: endpointGapInvariant,
      path_a_decomposition_exact: decompositionAExact,
      path_b_decomposition_exact: decompositionBExact,
      pointwise_role_characterization_a_exact: pointwiseA,
      pointwise_role_characterization_b_exact: pointwiseB,
      defect_identity_exact: defectIdentity,
      path_a_partition_refines_b: aRefinesB,
      path_b_partition_refines_a: bRefinesA,
      refinement_monotonicity_a_to_b: refinementAtoB,
      refinement_monotonicity_b_to_a: refinementBtoA,
      passed: endpointUnionInvariant
        && endpointIntersectionInvariant
        && endpointGapInvariant
        && decompositionAExact
        && decompositionBExact
        && pointwiseA
        && pointwiseB
        && defectIdentity
        && refinementAtoB
        && refinementBtoA,
    }));
  }

  const passed = certificates.length > 0 && certificates.every((certificate) => certificate.passed);
  return freeze({
    schema: COMMUTING_ERASURE_DIAMOND_SCHEMA,
    parent_receipt: COMMUTING_ERASURE_DIAMOND_PARENT_RECEIPT,
    gate_issue: COMMUTING_ERASURE_DIAMOND_GATE_ISSUE,
    status: passed
      ? 'FINITE_COMMUTING_ERASURE_DIAMOND_GAP_DECOMPOSITION_DERIVED'
      : 'FINITE_COMMUTING_ERASURE_DIAMOND_GAP_DECOMPOSITION_MISMATCH',
    passed,
    path_a_profile: profileA,
    path_b_profile: profileB,
    terminal_certificates: freeze(certificates),
  });
}

function roleSwapDiamondHostile() {
  const rowsA = [
    { antecedent: 'x1', stage1: 'A1', stage2: 'w', support: ['a', 'b'] },
    { antecedent: 'x2', stage1: 'A1', stage2: 'w', support: ['a'] },
    { antecedent: 'x3', stage1: 'A2', stage2: 'w', support: ['b'] },
    { antecedent: 'x4', stage1: 'A2', stage2: 'w', support: [] },
  ];
  const rowsB = [
    { antecedent: 'x1', stage1: 'B1', stage2: 'w', support: ['a', 'b'] },
    { antecedent: 'x2', stage1: 'B2', stage2: 'w', support: ['a'] },
    { antecedent: 'x3', stage1: 'B1', stage2: 'w', support: ['b'] },
    { antecedent: 'x4', stage1: 'B2', stage2: 'w', support: [] },
  ];
  const profile = finiteCommutingErasureDiamondProfile(rowsA, rowsB);
  const cert = profile.terminal_certificates?.[0];
  return freeze({
    passed: profile.passed
      && sameCanonicalArray(cert.endpoint_union, ['a', 'b'])
      && sameCanonicalArray(cert.endpoint_intersection, [])
      && sameCanonicalArray(cert.endpoint_gap, ['a', 'b'])
      && sameCanonicalArray(cert.path_a_inherited, ['b'])
      && sameCanonicalArray(cert.path_a_cross_settled, ['a'])
      && sameCanonicalArray(cert.path_b_inherited, ['a'])
      && sameCanonicalArray(cert.path_b_cross_settled, ['b'])
      && sameCanonicalArray(cert.parallel_path_decomposition_defect, ['a', 'b']),
    profile,
  });
}

function relabeledPartitionControl() {
  const rowsA = [
    { antecedent: 'x1', stage1: 'left', stage2: 'w', support: [0] },
    { antecedent: 'x2', stage1: 'left', stage2: 'w', support: [1] },
    { antecedent: 'x3', stage1: 'right', stage2: 'w', support: [0] },
  ];
  const rowsB = [
    { antecedent: 'x1', stage1: 'renamed-1', stage2: 'w', support: [0] },
    { antecedent: 'x2', stage1: 'renamed-1', stage2: 'w', support: [1] },
    { antecedent: 'x3', stage1: 'renamed-2', stage2: 'w', support: [0] },
  ];
  const profile = finiteCommutingErasureDiamondProfile(rowsA, rowsB);
  const cert = profile.terminal_certificates?.[0];
  return freeze({ passed: profile.passed && cert.parallel_path_decomposition_defect_cardinality === 0, profile });
}

function exactDescentControl() {
  const rowsA = [
    { antecedent: 'x1', stage1: 'A1', stage2: 'w', support: [0] },
    { antecedent: 'x2', stage1: 'A2', stage2: 'w', support: [0] },
  ];
  const rowsB = [
    { antecedent: 'x1', stage1: 'B1', stage2: 'w', support: [0] },
    { antecedent: 'x2', stage1: 'B1', stage2: 'w', support: [0] },
  ];
  const profile = finiteCommutingErasureDiamondProfile(rowsA, rowsB);
  const cert = profile.terminal_certificates?.[0];
  return freeze({
    passed: profile.passed
      && cert.endpoint_gap.length === 0
      && cert.path_a_inherited.length === 0
      && cert.path_a_cross_settled.length === 0
      && cert.path_b_inherited.length === 0
      && cert.path_b_cross_settled.length === 0
      && cert.parallel_path_decomposition_defect.length === 0,
    profile,
  });
}

function strictRefinementControl() {
  const fine = [
    { antecedent: 'x1', stage1: 'f1', stage2: 'w', support: ['z'] },
    { antecedent: 'x2', stage1: 'f2', stage2: 'w', support: [] },
  ];
  const coarse = [
    { antecedent: 'x1', stage1: 'c', stage2: 'w', support: ['z'] },
    { antecedent: 'x2', stage1: 'c', stage2: 'w', support: [] },
  ];
  const profile = finiteCommutingErasureDiamondProfile(fine, coarse);
  const cert = profile.terminal_certificates?.[0];
  return freeze({
    passed: profile.passed
      && cert.path_a_partition_refines_b
      && sameCanonicalArray(cert.path_a_inherited, [])
      && sameCanonicalArray(cert.path_a_cross_settled, ['z'])
      && sameCanonicalArray(cert.path_b_inherited, ['z'])
      && sameCanonicalArray(cert.path_b_cross_settled, []),
    profile,
  });
}

function noncommutingCompositeHostile() {
  const rowsA = [{ antecedent: 'x', stage1: 'a', stage2: 'w0', support: [0] }];
  const rowsB = [{ antecedent: 'x', stage1: 'b', stage2: 'w1', support: [0] }];
  const profile = finiteCommutingErasureDiamondProfile(rowsA, rowsB);
  return freeze({
    passed: profile.status === 'COMMUTING_ERASURE_DIAMOND_INPUT_ABSTAIN_NONCOMMUTING_COMPOSITE',
    profile,
  });
}

function symbolicCertificate() {
  return freeze({
    passed: true,
    endpoint_union: 'For each w, union_y union_{x in q^-1(y)} K_x = union_{x in p^-1(w)} K_x because the occupied q-fibers partition the common composite fiber.',
    endpoint_intersection: 'For each w, intersection_y intersection_{x in q^-1(y)} K_x = intersection_{x in p^-1(w)} K_x for the same finite partition.',
    pointwise_roles: 'A terminal-gap value is inherited exactly when at least one intermediate block is mixed; otherwise every block is homogeneous and terminal mixedness forces opposite settled block values, hence cross-settled.',
    defect: 'Because H_alpha and C_alpha are complementary subsets inside the same Gamma, H_A symmetric-difference H_B equals C_A symmetric-difference C_B.',
    refinement: 'If partition A refines B, any A-mixed block lies inside a B-block and remains mixed there, so H_A subseteq H_B; complementing inside common Gamma gives C_B subseteq C_A.',
    bearing: 'FINITE_PARALLEL_PATH_DECOMPOSITION_DEFECT_WITH_ENDPOINT_AUTHORITY_INVARIANCE_NOT_OPERATIONAL_LOOP_OR_HOLONOMY',
  });
}

export function runCommutingErasureDiamondGapDecompositionChamber() {
  const certificates = freeze({
    symbolic_theorem: symbolicCertificate(),
    role_swap_diamond_hostile: roleSwapDiamondHostile(),
    relabeled_partition_control: relabeledPartitionControl(),
    exact_descent_control: exactDescentControl(),
    strict_refinement_control: strictRefinementControl(),
    noncommuting_composite_hostile: noncommutingCompositeHostile(),
  });
  const passed = Object.values(certificates).every((certificate) => certificate.passed);
  return freeze({
    schema: COMMUTING_ERASURE_DIAMOND_SCHEMA,
    parent_receipt: COMMUTING_ERASURE_DIAMOND_PARENT_RECEIPT,
    gate_issue: COMMUTING_ERASURE_DIAMOND_GATE_ISSUE,
    status: passed
      ? 'FINITE_COMMUTING_ERASURE_DIAMOND_GAP_DECOMPOSITION_ROUND_CLOSED'
      : 'FINITE_COMMUTING_ERASURE_DIAMOND_GAP_DECOMPOSITION_ROUND_OPEN',
    classification: passed
      ? 'FINITE_COMMUTING_ERASURE_DIAMONDS_HAVE_FACTORIZATION_INVARIANT_TERMINAL_ADMISSIBILITY_GAPS_BUT_CAN_HAVE_FACTORIZATION_SENSITIVE_INHERITED_VS_CROSS_SETTLED_GAP_DECOMPOSITIONS_WITH_EXACT_PARALLEL_PATH_DEFECT'
      : null,
    certificates,
    claim_ceiling: freeze({
      operational_closed_path: false,
      inverse_transport: false,
      groupoid: false,
      connection: false,
      loop_endomorphism: false,
      holonomy: false,
      curvature: false,
      berry_quantum: false,
      gauge_structure: false,
      asymptotic_theorem: false,
      proto_loom: false,
      a16: false,
      live_ash: false,
      merge: false,
      publication: false,
      production: false,
      vercel: false,
    }),
    passed,
  });
}
