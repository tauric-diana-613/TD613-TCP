import {
  finiteCommutingErasureDiamondProfile,
} from './aperture-pedagogue-commuting-erasure-diamond-gap-decomposition.js';

export const PASTED_DIAMOND_DEFECT_TRANSPORT_SCHEMA = 'td613.a15-r0.pasted-diamond-defect-transport/v0.1';
export const PASTED_DIAMOND_DEFECT_TRANSPORT_PARENT_RECEIPT = '1340cbf785547454ecbe365986b88b6ec9ff3283';
export const PASTED_DIAMOND_DEFECT_TRANSPORT_GATE_ISSUE = 737;

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

function keySet(values) {
  return new Set((values ?? []).map(canonicalFiniteValue));
}

function setEquals(a, b) {
  return a.size === b.size && [...a].every((key) => b.has(key));
}

function subset(a, b) {
  return [...a].every((key) => b.has(key));
}

function unionInto(target, source) {
  for (const key of source) target.add(key);
  return target;
}

function difference(a, b) {
  return new Set([...a].filter((key) => !b.has(key)));
}

function symmetricDifference(a, b) {
  return new Set([...difference(a, b), ...difference(b, a)]);
}

function representativesFrom(...arrays) {
  const out = new Map();
  for (const values of arrays) {
    for (const value of values ?? []) {
      const key = canonicalFiniteValue(value);
      if (key !== null && !out.has(key)) out.set(key, value);
    }
  }
  return out;
}

function valuesFromKeys(keys, representatives) {
  return freeze([...keys].sort().map((key) => representatives.get(key) ?? key));
}

function normalizeCoarsening(coarseningRows) {
  if (!Array.isArray(coarseningRows) || coarseningRows.length < 1) {
    return freeze({ status: 'PASTED_DIAMOND_ABSTAIN_EMPTY_COARSENING' });
  }
  const map = new Map();
  const representatives = new Map();
  for (const row of coarseningRows) {
    const terminalKey = canonicalFiniteValue(row?.terminal);
    const coarseKey = canonicalFiniteValue(row?.coarse);
    if (terminalKey === null || coarseKey === null) {
      return freeze({ status: 'PASTED_DIAMOND_ABSTAIN_NONFINITE_COARSENING' });
    }
    if (map.has(terminalKey) && map.get(terminalKey) !== coarseKey) {
      return freeze({ status: 'PASTED_DIAMOND_ABSTAIN_CONFLICTING_COARSENING' });
    }
    map.set(terminalKey, coarseKey);
    if (!representatives.has(coarseKey)) representatives.set(coarseKey, row.coarse);
  }
  return freeze({ status: 'PASTED_DIAMOND_COARSENING_NORMALIZED', map, representatives });
}

function coarsenRows(rows, coarseningMap, coarseRepresentatives) {
  const out = [];
  for (const row of rows ?? []) {
    const terminalKey = canonicalFiniteValue(row?.stage2);
    if (!coarseningMap.has(terminalKey)) return null;
    const coarseKey = coarseningMap.get(terminalKey);
    out.push({
      antecedent: row.antecedent,
      stage1: row.stage1,
      stage2: coarseRepresentatives.get(coarseKey),
      support: row.support,
    });
  }
  return out;
}

function certMap(profile) {
  return new Map((profile?.terminal_certificates ?? []).map((cert) => [canonicalFiniteValue(cert.terminal), cert]));
}

export function finitePastedDiamondDefectTransportProfile(rowsA, rowsB, coarseningRows) {
  const localProfile = finiteCommutingErasureDiamondProfile(rowsA, rowsB);
  if (!localProfile.passed) {
    return freeze({
      status: 'PASTED_DIAMOND_ABSTAIN_PARENT_LOCAL_PROFILE',
      local_profile: localProfile,
    });
  }

  const normalized = normalizeCoarsening(coarseningRows);
  if (normalized.status !== 'PASTED_DIAMOND_COARSENING_NORMALIZED') return normalized;

  const localCerts = certMap(localProfile);
  for (const terminalKey of localCerts.keys()) {
    if (!normalized.map.has(terminalKey)) {
      return freeze({ status: 'PASTED_DIAMOND_ABSTAIN_NON_TOTAL_COARSENING' });
    }
  }

  const coarseRowsA = coarsenRows(rowsA, normalized.map, normalized.representatives);
  const coarseRowsB = coarsenRows(rowsB, normalized.map, normalized.representatives);
  if (!coarseRowsA || !coarseRowsB) {
    return freeze({ status: 'PASTED_DIAMOND_ABSTAIN_NON_TOTAL_COARSENING' });
  }

  const pastedProfile = finiteCommutingErasureDiamondProfile(coarseRowsA, coarseRowsB);
  if (!pastedProfile.passed) {
    return freeze({
      status: 'PASTED_DIAMOND_ABSTAIN_PARENT_PASTED_PROFILE',
      local_profile: localProfile,
      pasted_profile: pastedProfile,
    });
  }

  const pastedCerts = certMap(pastedProfile);
  const groups = new Map();
  for (const [terminalKey, cert] of localCerts.entries()) {
    const coarseKey = normalized.map.get(terminalKey);
    if (!groups.has(coarseKey)) groups.set(coarseKey, []);
    groups.get(coarseKey).push({ terminalKey, cert });
  }

  const certificates = [];
  for (const [coarseKey, locals] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const pasted = pastedCerts.get(coarseKey);
    if (!pasted) return freeze({ status: 'PASTED_DIAMOND_MISMATCH_COARSE_TERMINAL_SET' });

    const unionA = new Set();
    const unionB = new Set();
    const unionLocalDefect = new Set();
    const localTerminalProvenance = [];
    const representativeArrays = [];

    for (const { cert } of locals) {
      const hA = keySet(cert.path_a_inherited);
      const hB = keySet(cert.path_b_inherited);
      const positive = difference(hA, hB);
      const negative = difference(hB, hA);
      const defect = symmetricDifference(hA, hB);
      unionInto(unionA, hA);
      unionInto(unionB, hB);
      unionInto(unionLocalDefect, defect);
      representativeArrays.push(
        cert.path_a_inherited,
        cert.path_b_inherited,
        cert.parallel_path_decomposition_defect,
      );
      const reps = representativesFrom(
        cert.path_a_inherited,
        cert.path_b_inherited,
        cert.parallel_path_decomposition_defect,
      );
      localTerminalProvenance.push(freeze({
        terminal: cert.terminal,
        path_a_inherited: cert.path_a_inherited,
        path_b_inherited: cert.path_b_inherited,
        positive_orientation_a_only: valuesFromKeys(positive, reps),
        negative_orientation_b_only: valuesFromKeys(negative, reps),
        local_unoriented_defect: cert.parallel_path_decomposition_defect,
      }));
    }

    const pastedA = keySet(pasted.path_a_inherited);
    const pastedB = keySet(pasted.path_b_inherited);
    const pastedDefect = symmetricDifference(pastedA, pastedB);
    const representatives = representativesFrom(
      ...representativeArrays,
      pasted.path_a_inherited,
      pasted.path_b_inherited,
      pasted.parallel_path_decomposition_defect,
    );

    const unionCompositionAExact = setEquals(unionA, pastedA);
    const unionCompositionBExact = setEquals(unionB, pastedB);
    const pastedDefectExact = setEquals(pastedDefect, keySet(pasted.parallel_path_decomposition_defect));
    const noDefectCreation = subset(pastedDefect, unionLocalDefect);

    certificates.push(freeze({
      coarse_terminal: normalized.representatives.get(coarseKey),
      local_terminal_provenance: freeze(localTerminalProvenance),
      union_path_a_inherited: valuesFromKeys(unionA, representatives),
      union_path_b_inherited: valuesFromKeys(unionB, representatives),
      union_local_unoriented_defect: valuesFromKeys(unionLocalDefect, representatives),
      pasted_path_a_inherited: pasted.path_a_inherited,
      pasted_path_b_inherited: pasted.path_b_inherited,
      pasted_unoriented_defect: pasted.parallel_path_decomposition_defect,
      inherited_union_composition_a_exact: unionCompositionAExact,
      inherited_union_composition_b_exact: unionCompositionBExact,
      pasted_defect_recomputed_exact: pastedDefectExact,
      common_coarsening_creates_no_new_defect: noDefectCreation,
      strict_defect_annihilation: pastedDefect.size < unionLocalDefect.size,
      passed: unionCompositionAExact
        && unionCompositionBExact
        && pastedDefectExact
        && noDefectCreation,
    }));
  }

  const passed = certificates.length > 0 && certificates.every((certificate) => certificate.passed);
  return freeze({
    schema: PASTED_DIAMOND_DEFECT_TRANSPORT_SCHEMA,
    parent_receipt: PASTED_DIAMOND_DEFECT_TRANSPORT_PARENT_RECEIPT,
    gate_issue: PASTED_DIAMOND_DEFECT_TRANSPORT_GATE_ISSUE,
    status: passed
      ? 'FINITE_PASTED_DIAMOND_DEFECT_TRANSPORT_DERIVED'
      : 'FINITE_PASTED_DIAMOND_DEFECT_TRANSPORT_MISMATCH',
    passed,
    local_profile: localProfile,
    pasted_profile: pastedProfile,
    terminal_certificates: freeze(certificates),
  });
}

function fourRows(prefix, terminal, pathKind, supportValue = 'z') {
  const mixedBlocks = [
    `${prefix}-M1`, `${prefix}-M2`, `${prefix}-M1`, `${prefix}-M2`,
  ];
  const settledBlocks = [
    `${prefix}-S1`, `${prefix}-S1`, `${prefix}-S2`, `${prefix}-S2`,
  ];
  const blocks = pathKind === 'MIXED' ? mixedBlocks : settledBlocks;
  const memberships = [true, true, false, false];
  return memberships.map((hasValue, index) => ({
    antecedent: `${terminal}-x${index + 1}`,
    stage1: blocks[index],
    stage2: terminal,
    support: hasValue ? [supportValue] : [],
  }));
}

function buildTwoTerminalSystem(orientationW1, orientationW2) {
  const buildPath = (pathName, orientation, terminal) => {
    const kind = orientation === 'A_ONLY'
      ? (pathName === 'A' ? 'MIXED' : 'SETTLED')
      : (pathName === 'A' ? 'SETTLED' : 'MIXED');
    return fourRows(`${pathName}-${terminal}`, terminal, kind);
  };
  const rowsA = [
    ...buildPath('A', orientationW1, 'w1'),
    ...buildPath('A', orientationW2, 'w2'),
  ];
  const rowsB = [
    ...buildPath('B', orientationW1, 'w1'),
    ...buildPath('B', orientationW2, 'w2'),
  ];
  return { rowsA, rowsB };
}

export function pastedDiamondDefectTransportWitnesses() {
  const coarsening = [
    { terminal: 'w1', coarse: 'v' },
    { terminal: 'w2', coarse: 'v' },
  ];
  const oppositeRows = buildTwoTerminalSystem('A_ONLY', 'B_ONLY');
  const sameRows = buildTwoTerminalSystem('A_ONLY', 'A_ONLY');
  const opposite = finitePastedDiamondDefectTransportProfile(
    oppositeRows.rowsA,
    oppositeRows.rowsB,
    coarsening,
  );
  const same = finitePastedDiamondDefectTransportProfile(
    sameRows.rowsA,
    sameRows.rowsB,
    coarsening,
  );

  const localDefects = (profile) => (profile.local_profile?.terminal_certificates ?? [])
    .map((cert) => ({ terminal: cert.terminal, defect: cert.parallel_path_decomposition_defect }));
  const pastedDefect = (profile) => profile.terminal_certificates?.[0]?.pasted_unoriented_defect ?? [];

  return freeze({
    opposite,
    same,
    opposite_local_defects: freeze(localDefects(opposite)),
    same_local_defects: freeze(localDefects(same)),
    opposite_pasted_defect: pastedDefect(opposite),
    same_pasted_defect: pastedDefect(same),
  });
}
