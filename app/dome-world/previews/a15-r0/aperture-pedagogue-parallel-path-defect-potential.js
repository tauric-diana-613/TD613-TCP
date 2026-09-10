import {
  finiteCommutingErasureDiamondProfile,
} from './aperture-pedagogue-commuting-erasure-diamond-gap-decomposition.js';

export const PARALLEL_PATH_DEFECT_POTENTIAL_SCHEMA = 'td613.a15-r0.parallel-path-defect-potential/v0.1';
export const PARALLEL_PATH_DEFECT_POTENTIAL_PARENT_RECEIPT = '1340cbf785547454ecbe365986b88b6ec9ff3283';
export const PARALLEL_PATH_DEFECT_POTENTIAL_GATE_ISSUE = 737;

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

function canonicalSet(values) {
  const keys = (values ?? []).map(canonicalFiniteValue);
  if (keys.some((key) => key === null)) return null;
  return new Set(keys);
}

function sameSet(a, b) {
  return a.size === b.size && [...a].every((key) => b.has(key));
}

function sameVector(a, b) {
  return Array.isArray(a)
    && Array.isArray(b)
    && a.length === b.length
    && a.every((value, index) => value === b[index]);
}

function addVectors(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return null;
  return a.map((value, index) => value + b[index]);
}

function negateVector(a) {
  return a.map((value) => (value === 0 ? 0 : -value));
}

function zeroVector(length) {
  return Array.from({ length }, () => 0);
}

function vectorSupportKeys(vector, gammaKeys) {
  return new Set(gammaKeys.filter((_, index) => vector[index] !== 0));
}

function differenceVector(fromSet, toSet, gammaKeys) {
  return gammaKeys.map((key) => (toSet.has(key) ? 1 : 0) - (fromSet.has(key) ? 1 : 0));
}

function gainSet(fromSet, toSet) {
  return new Set([...toSet].filter((key) => !fromSet.has(key)));
}

function lossSet(fromSet, toSet) {
  return new Set([...fromSet].filter((key) => !toSet.has(key)));
}

function symmetricDifference(a, b) {
  return new Set([
    ...[...a].filter((key) => !b.has(key)),
    ...[...b].filter((key) => !a.has(key)),
  ]);
}

function representativeMap(values) {
  const out = new Map();
  for (const value of values ?? []) {
    const key = canonicalFiniteValue(value);
    if (key !== null && !out.has(key)) out.set(key, value);
  }
  return out;
}

function valuesFromKeys(keys, reps) {
  return freeze([...keys].sort().map((key) => reps.get(key) ?? key));
}

function pairKey(a, b) {
  return `${a}\u0000${b}`;
}

function terminalKey(value) {
  return canonicalFiniteValue(value);
}

function normalizePaths(paths) {
  if (!Array.isArray(paths) || paths.length < 2) {
    return freeze({ status: 'PARALLEL_PATH_DEFECT_INPUT_ABSTAIN_NEED_TWO_PATHS' });
  }
  const ids = new Set();
  const normalized = [];
  for (const path of paths) {
    if (typeof path?.id !== 'string' || path.id.length < 1 || ids.has(path.id) || !Array.isArray(path.rows) || path.rows.length < 1) {
      return freeze({ status: 'PARALLEL_PATH_DEFECT_INPUT_ABSTAIN_MALFORMED_OR_DUPLICATE_PATH' });
    }
    ids.add(path.id);
    normalized.push(freeze({ id: path.id, rows: path.rows }));
  }
  return freeze({ status: 'PARALLEL_PATH_DEFECT_INPUT_NORMALIZED', paths: freeze(normalized) });
}

function indexCertificates(profile) {
  return new Map((profile.terminal_certificates ?? []).map((cert) => [terminalKey(cert.terminal), cert]));
}

export function finiteParallelPathDefectPotentialProfile(paths) {
  const normalized = normalizePaths(paths);
  if (normalized.status !== 'PARALLEL_PATH_DEFECT_INPUT_NORMALIZED') return normalized;

  const pairProfiles = new Map();
  for (let i = 0; i < normalized.paths.length; i += 1) {
    for (let j = i + 1; j < normalized.paths.length; j += 1) {
      const left = normalized.paths[i];
      const right = normalized.paths[j];
      const profile = finiteCommutingErasureDiamondProfile(left.rows, right.rows);
      if (!profile.passed) {
        return freeze({
          status: 'PARALLEL_PATH_DEFECT_PROFILE_ABSTAIN_PARENT_PAIR',
          left: left.id,
          right: right.id,
          parent_profile: profile,
        });
      }
      pairProfiles.set(pairKey(left.id, right.id), freeze({ left: left.id, right: right.id, profile }));
    }
  }

  const firstPair = pairProfiles.values().next().value;
  const firstCertificates = indexCertificates(firstPair.profile);
  const terminalCertificates = [];

  for (const [tKey, firstCert] of firstCertificates.entries()) {
    const gammaKeys = [...canonicalSet(firstCert.endpoint_gap)].sort();
    const reps = representativeMap(firstCert.endpoint_gap);
    const inheritedByPath = new Map();
    let familyConsistent = true;
    let supportMatchesParent = true;
    const refinementClaims = [];

    for (const pair of pairProfiles.values()) {
      const cert = indexCertificates(pair.profile).get(tKey);
      if (!cert) {
        familyConsistent = false;
        continue;
      }
      const pairGamma = canonicalSet(cert.endpoint_gap);
      if (!pairGamma || !sameSet(new Set(gammaKeys), pairGamma)) familyConsistent = false;

      const leftH = canonicalSet(cert.path_a_inherited);
      const rightH = canonicalSet(cert.path_b_inherited);
      if (!leftH || !rightH) {
        familyConsistent = false;
        continue;
      }

      for (const [id, h] of [[pair.left, leftH], [pair.right, rightH]]) {
        if (!inheritedByPath.has(id)) inheritedByPath.set(id, h);
        else if (!sameSet(inheritedByPath.get(id), h)) familyConsistent = false;
      }

      const parentDefect = canonicalSet(cert.parallel_path_decomposition_defect);
      const derivedDefect = symmetricDifference(leftH, rightH);
      if (!parentDefect || !sameSet(parentDefect, derivedDefect)) supportMatchesParent = false;

      if (cert.path_a_partition_refines_b) {
        refinementClaims.push(freeze({ fine: pair.left, coarse: pair.right }));
      }
      if (cert.path_b_partition_refines_a) {
        refinementClaims.push(freeze({ fine: pair.right, coarse: pair.left }));
      }
    }

    if (inheritedByPath.size !== normalized.paths.length) familyConsistent = false;

    const pathPotentials = normalized.paths.map(({ id }) => freeze({
      path_id: id,
      inherited_gap: valuesFromKeys(inheritedByPath.get(id) ?? new Set(), reps),
      indicator_vector: freeze(gammaKeys.map((key) => (inheritedByPath.get(id)?.has(key) ? 1 : 0))),
    }));

    const defects = [];
    let identityExact = true;
    let reversalExact = true;
    let supportExact = supportMatchesParent;
    let gainLossExact = true;
    let refinementOrientationExact = true;

    for (const from of normalized.paths) {
      for (const to of normalized.paths) {
        const fromH = inheritedByPath.get(from.id) ?? new Set();
        const toH = inheritedByPath.get(to.id) ?? new Set();
        const vector = differenceVector(fromH, toH, gammaKeys);
        const support = vectorSupportKeys(vector, gammaKeys);
        const gain = gainSet(fromH, toH);
        const loss = lossSet(fromH, toH);
        const expectedSupport = symmetricDifference(fromH, toH);
        if (!sameSet(support, expectedSupport)) supportExact = false;
        const gainExact = gammaKeys.every((key, index) => vector[index] === (gain.has(key) ? 1 : loss.has(key) ? -1 : 0));
        if (!gainExact) gainLossExact = false;
        if (from.id === to.id && !sameVector(vector, zeroVector(gammaKeys.length))) identityExact = false;

        defects.push(freeze({
          from: from.id,
          to: to.id,
          vector: freeze(vector),
          support: valuesFromKeys(support, reps),
          gain_inherited: valuesFromKeys(gain, reps),
          loss_inherited: valuesFromKeys(loss, reps),
        }));
      }
    }

    const defectMap = new Map(defects.map((defect) => [pairKey(defect.from, defect.to), defect.vector]));
    for (const a of normalized.paths) {
      for (const b of normalized.paths) {
        const ab = defectMap.get(pairKey(a.id, b.id));
        const ba = defectMap.get(pairKey(b.id, a.id));
        if (!sameVector(ba, negateVector(ab))) reversalExact = false;
      }
    }

    let additivePastingExact = true;
    for (const a of normalized.paths) {
      for (const b of normalized.paths) {
        for (const c of normalized.paths) {
          const ab = defectMap.get(pairKey(a.id, b.id));
          const bc = defectMap.get(pairKey(b.id, c.id));
          const ac = defectMap.get(pairKey(a.id, c.id));
          if (!sameVector(addVectors(ab, bc), ac)) additivePastingExact = false;
        }
      }
    }

    for (const claim of refinementClaims) {
      const vector = defectMap.get(pairKey(claim.fine, claim.coarse));
      if (!vector?.every((entry) => entry >= 0)) refinementOrientationExact = false;
    }

    const symbolicZeroCirculation = true;
    const passed = familyConsistent
      && identityExact
      && reversalExact
      && additivePastingExact
      && symbolicZeroCirculation
      && supportExact
      && gainLossExact
      && refinementOrientationExact;

    terminalCertificates.push(freeze({
      terminal: firstCert.terminal,
      terminal_gap: firstCert.endpoint_gap,
      gamma_coordinate_order: valuesFromKeys(new Set(gammaKeys), reps),
      path_potentials: freeze(pathPotentials),
      oriented_defects: freeze(defects),
      identity_exact: identityExact,
      reversal_exact: reversalExact,
      additive_pasting_exact: additivePastingExact,
      closed_comparison_circulation_symbolically_zero: symbolicZeroCirculation,
      support_recovers_760_defect: supportExact,
      gain_loss_orientation_exact: gainLossExact,
      refinement_orientation_exact: refinementOrientationExact,
      family_consistent: familyConsistent,
      passed,
    }));
  }

  const passed = terminalCertificates.length > 0 && terminalCertificates.every((cert) => cert.passed);
  return freeze({
    schema: PARALLEL_PATH_DEFECT_POTENTIAL_SCHEMA,
    parent_receipt: PARALLEL_PATH_DEFECT_POTENTIAL_PARENT_RECEIPT,
    gate_issue: PARALLEL_PATH_DEFECT_POTENTIAL_GATE_ISSUE,
    status: passed
      ? 'FINITE_PARALLEL_PATH_DEFECT_POTENTIAL_DERIVED'
      : 'FINITE_PARALLEL_PATH_DEFECT_POTENTIAL_MISMATCH',
    passed,
    path_ids: freeze(normalized.paths.map((path) => path.id)),
    terminal_certificates: freeze(terminalCertificates),
  });
}

function fourPathRows() {
  const supports = {
    x1: ['a', 'b'],
    x2: ['a'],
    x3: ['b'],
    x4: [],
  };
  const build = (id, assignments) => freeze({
    id,
    rows: freeze(Object.entries(assignments).map(([antecedent, stage1]) => freeze({
      antecedent,
      stage1,
      stage2: 'w',
      support: supports[antecedent],
    }))),
  });
  return freeze([
    build('A', { x1: 'A1', x2: 'A1', x3: 'A2', x4: 'A2' }),
    build('B', { x1: 'B1', x2: 'B2', x3: 'B1', x4: 'B2' }),
    build('C', { x1: 'C1', x2: 'C2', x3: 'C3', x4: 'C4' }),
    build('D', { x1: 'D1', x2: 'D1', x3: 'D1', x4: 'D1' }),
  ]);
}

function findPotential(cert, id) {
  return cert.path_potentials.find((entry) => entry.path_id === id);
}

function findDefect(cert, from, to) {
  return cert.oriented_defects.find((entry) => entry.from === from && entry.to === to);
}

function sumCycle(cert, cycle) {
  let total = zeroVector(cert.gamma_coordinate_order.length);
  for (let i = 0; i + 1 < cycle.length; i += 1) {
    total = addVectors(total, findDefect(cert, cycle[i], cycle[i + 1]).vector);
  }
  return total;
}

function sameValues(values, expected) {
  const left = canonicalSet(values);
  const right = canonicalSet(expected);
  return left && right && sameSet(left, right);
}

function fourPathPastedHostile() {
  const profile = finiteParallelPathDefectPotentialProfile(fourPathRows());
  const cert = profile.terminal_certificates?.[0];
  if (!profile.passed || !cert) return freeze({ passed: false, profile });

  const AB = findDefect(cert, 'A', 'B').vector;
  const BD = findDefect(cert, 'B', 'D').vector;
  const AC = findDefect(cert, 'A', 'C').vector;
  const CD = findDefect(cert, 'C', 'D').vector;
  const AD = findDefect(cert, 'A', 'D').vector;
  const cycle = sumCycle(cert, ['A', 'B', 'D', 'C', 'A']);

  const potentialsExact = sameValues(findPotential(cert, 'A').inherited_gap, ['b'])
    && sameValues(findPotential(cert, 'B').inherited_gap, ['a'])
    && sameValues(findPotential(cert, 'C').inherited_gap, [])
    && sameValues(findPotential(cert, 'D').inherited_gap, ['a', 'b']);

  const vectorsExact = sameVector(AB, [1, -1])
    && sameVector(BD, [0, 1])
    && sameVector(AC, [0, -1])
    && sameVector(CD, [1, 1])
    && sameVector(AD, [1, 0]);

  const pastedExact = sameVector(addVectors(AB, BD), AD)
    && sameVector(addVectors(AC, CD), AD);

  const cycleZero = sameVector(cycle, [0, 0]);

  const cardinalityAntiShortcut = findDefect(cert, 'A', 'B').support.length
      + findDefect(cert, 'B', 'C').support.length
    !== findDefect(cert, 'A', 'C').support.length;

  return freeze({
    passed: potentialsExact && vectorsExact && pastedExact && cycleZero && cardinalityAntiShortcut,
    potentials_exact: potentialsExact,
    vectors_exact: vectorsExact,
    pasted_comparison_exact: pastedExact,
    closed_cycle_zero: cycleZero,
    cardinality_anti_shortcut: cardinalityAntiShortcut,
    exact_values: freeze({
      defect_AB_cardinality: findDefect(cert, 'A', 'B').support.length,
      defect_BC_cardinality: findDefect(cert, 'B', 'C').support.length,
      defect_AC_cardinality: findDefect(cert, 'A', 'C').support.length,
      cycle,
    }),
    profile,
  });
}

function relabelZeroControl() {
  const supports = { x1: ['a'], x2: [] };
  const make = (id, prefix) => freeze({
    id,
    rows: freeze([
      freeze({ antecedent: 'x1', stage1: `${prefix}1`, stage2: 'w', support: supports.x1 }),
      freeze({ antecedent: 'x2', stage1: `${prefix}2`, stage2: 'w', support: supports.x2 }),
    ]),
  });
  const profile = finiteParallelPathDefectPotentialProfile([make('R1', 'left-'), make('R2', 'rename-')]);
  const cert = profile.terminal_certificates?.[0];
  const vector = cert ? findDefect(cert, 'R1', 'R2').vector : null;
  return freeze({ passed: profile.passed && sameVector(vector, [0]), profile });
}

function noncommutingAbstentionControl() {
  const left = freeze({
    id: 'L',
    rows: freeze([
      freeze({ antecedent: 'x1', stage1: 'l1', stage2: 'w1', support: ['a'] }),
      freeze({ antecedent: 'x2', stage1: 'l2', stage2: 'w1', support: [] }),
    ]),
  });
  const right = freeze({
    id: 'R',
    rows: freeze([
      freeze({ antecedent: 'x1', stage1: 'r1', stage2: 'w2', support: ['a'] }),
      freeze({ antecedent: 'x2', stage1: 'r2', stage2: 'w1', support: [] }),
    ]),
  });
  const profile = finiteParallelPathDefectPotentialProfile([left, right]);
  return freeze({
    passed: profile.status === 'PARALLEL_PATH_DEFECT_PROFILE_ABSTAIN_PARENT_PAIR'
      && profile.parent_profile?.status === 'COMMUTING_ERASURE_DIAMOND_INPUT_ABSTAIN_NONCOMMUTING_COMPOSITE',
    profile,
  });
}

export function parallelPathDefectPotentialAssay() {
  const pasted = fourPathPastedHostile();
  const relabel = relabelZeroControl();
  const noncommuting = noncommutingAbstentionControl();

  const passed = pasted.passed && relabel.passed && noncommuting.passed;
  return freeze({
    schema: PARALLEL_PATH_DEFECT_POTENTIAL_SCHEMA,
    parent_receipt: PARALLEL_PATH_DEFECT_POTENTIAL_PARENT_RECEIPT,
    gate_issue: PARALLEL_PATH_DEFECT_POTENTIAL_GATE_ISSUE,
    classification: passed
      ? 'PARALLEL_PATH_GAP_GENEALOGY_ADMITS_AN_EXACT_ORIENTED_INTEGER_POTENTIAL_DIFFERENCE_WITH_ADDITIVE_PASTING_AND_ZERO_CLOSED_COMPARISON_CIRCULATION'
      : 'PARALLEL_PATH_DEFECT_POTENTIAL_AUDITION_NOT_EARNED',
    consequential_classification: passed
      ? 'THE_760_PARALLEL_PATH_DEFECT_IS_GLOBALLY_INTEGRABLE_AS_A_DIFFERENCE_OF_PATH_LOCAL_H_INDICATORS_AND_CANNOT_BY_ITSELF_SUPPLY_NONZERO_HOLONOMY'
      : 'NO_PRE_HOLONOMY_NEGATIVE_BEARING_EARNED',
    passed,
    pasted_comparison_hostile: pasted,
    relabel_zero_control: relabel,
    noncommuting_abstention_control: noncommuting,
    claim_ceiling: freeze({
      operational_loop: false,
      connection: false,
      holonomy: false,
      curvature: false,
      groupoid: false,
      proto_loom_a16: false,
      merge: false,
      production: false,
      vercel: false,
    }),
  });
}
