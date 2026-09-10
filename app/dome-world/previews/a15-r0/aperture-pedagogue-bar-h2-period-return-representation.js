import {
  multiplyQuotientCoordinates,
} from './aperture-pedagogue-target-equivalence-quotient-congruence.js';
import {
  transportIncrementCocycle,
} from './aperture-pedagogue-affine-transport-increment-cocycle.js';
import {
  relationBarCycle,
  boundaryOfBar2Chain,
  pairTwoCochainWithBarChain,
  normalizedOneCoboundary,
} from './aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';

export const BAR_H2_PERIOD_RETURN_REPRESENTATION_SCHEMA = 'td613.a15-r0.bar-h2-period-return-representation/v0.1';
export const BAR_H2_PERIOD_RETURN_REPRESENTATION_PARENT_RECEIPT = '142cf2fc7b0814dc56fd131df076b9071fe369ff';
export const BAR_H2_PERIOD_RETURN_REPRESENTATION_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const canonicalInteger = (value) => (value === 0 ? 0 : value);
const keyOf = (value) => JSON.stringify(value);

function validBase(x) {
  return x && [x.t, x.E, x.O].every((n) => Number.isInteger(n) && n >= 0);
}

function plainBase(x) {
  return freeze({ t: x.t, E: x.E, O: x.O });
}

function product(left, right) {
  if (!validBase(left) || !validBase(right)) return null;
  const out = multiplyQuotientCoordinates(left, right);
  if (out?.status !== 'PARITY_TWISTED_QUOTIENT_PRODUCT_DERIVED') return null;
  return plainBase(out);
}

function validBar2Term(term) {
  return term
    && Number.isInteger(term.coefficient)
    && validBase(term.left)
    && validBase(term.right);
}

function validBar3Term(term) {
  return term
    && Number.isInteger(term.coefficient)
    && validBase(term.x)
    && validBase(term.y)
    && validBase(term.z);
}

function addBar2Coefficient(map, left, right, coefficient, label = null) {
  if (coefficient === 0) return;
  const key = `${keyOf(left)}|${keyOf(right)}`;
  const current = map.get(key) ?? {
    left: plainBase(left),
    right: plainBase(right),
    coefficient: 0,
    labels: [],
  };
  current.coefficient += coefficient;
  if (label) current.labels.push(label);
  if (current.coefficient === 0) map.delete(key);
  else map.set(key, current);
}

export function normalizeBar2Chain(chain) {
  if (!Array.isArray(chain) || !chain.every(validBar2Term)) {
    return freeze({ status: 'BAR_2_CHAIN_NORMALIZATION_ABSTAINS', chain: freeze([]) });
  }
  const map = new Map();
  chain.forEach((term) => addBar2Coefficient(
    map,
    term.left,
    term.right,
    term.coefficient,
    term.label ?? null,
  ));
  const normalized = [...map.values()]
    .map((term) => freeze({
      coefficient: canonicalInteger(term.coefficient),
      left: term.left,
      right: term.right,
      label: term.labels.join(' + ') || null,
    }))
    .sort((a, b) => `${keyOf(a.left)}|${keyOf(a.right)}`.localeCompare(`${keyOf(b.left)}|${keyOf(b.right)}`));
  return freeze({ status: 'BAR_2_CHAIN_NORMALIZED', chain: freeze(normalized) });
}

export function addBar2Chains(...chains) {
  const flat = [];
  for (const chain of chains) {
    if (!Array.isArray(chain)) return freeze({ status: 'BAR_2_CHAIN_ADDITION_ABSTAINS', chain: freeze([]) });
    flat.push(...chain);
  }
  return normalizeBar2Chain(flat);
}

export function scaleBar2Chain(chain, scalar) {
  if (!Array.isArray(chain) || !Number.isInteger(scalar) || !chain.every(validBar2Term)) {
    return freeze({ status: 'BAR_2_CHAIN_SCALING_ABSTAINS', chain: freeze([]) });
  }
  return normalizeBar2Chain(chain.map((term) => freeze({
    ...term,
    coefficient: scalar * term.coefficient,
  })));
}

export function boundaryOfBar3Chain(chain) {
  if (!Array.isArray(chain) || !chain.every(validBar3Term)) {
    return freeze({ status: 'BAR_3_BOUNDARY_ABSTAINS', chain: freeze([]) });
  }
  const terms = [];
  for (const term of chain) {
    const xy = product(term.x, term.y);
    const yz = product(term.y, term.z);
    if (!xy || !yz) return freeze({ status: 'BAR_3_BOUNDARY_ABSTAINS', chain: freeze([]) });
    const c = term.coefficient;
    // ∂[x|y|z] = [y|z] - [x★y|z] + [x|y★z] - [x|y].
    terms.push(
      freeze({ coefficient: c, left: term.y, right: term.z, label: '+[y|z]' }),
      freeze({ coefficient: -c, left: xy, right: term.z, label: '-[x★y|z]' }),
      freeze({ coefficient: c, left: term.x, right: yz, label: '+[x|y★z]' }),
      freeze({ coefficient: -c, left: term.x, right: term.y, label: '-[x|y]' }),
    );
  }
  const normalized = normalizeBar2Chain(terms);
  if (normalized.status !== 'BAR_2_CHAIN_NORMALIZED') return normalized;
  const boundary2 = boundaryOfBar2Chain(normalized.chain);
  return freeze({
    status: 'NORMALIZED_BAR_3_BOUNDARY_DERIVED',
    chain: normalized.chain,
    boundary_of_boundary: boundary2,
    is_bar2_cycle: boundary2.is_cycle,
    symbolic: '∂[x|y|z]=[y|z]-[x★y|z]+[x|y★z]-[x|y], and ∂²=0 in the declared bar complex.',
  });
}

export function barH2Period(chain, cochain = transportIncrementCocycle) {
  if (!Array.isArray(chain) || typeof cochain !== 'function') {
    return freeze({ status: 'BAR_H2_PERIOD_ABSTAINS_INVALID_INPUT' });
  }
  const normalized = normalizeBar2Chain(chain);
  if (normalized.status !== 'BAR_2_CHAIN_NORMALIZED') return normalized;
  const boundary = boundaryOfBar2Chain(normalized.chain);
  if (!boundary.is_cycle) {
    return freeze({
      status: 'BAR_H2_PERIOD_ABSTAINS_NONCYCLE',
      chain: normalized.chain,
      boundary,
    });
  }
  const pairing = pairTwoCochainWithBarChain(cochain, normalized.chain);
  if (pairing.status !== 'BAR_2_COCHAIN_PAIRING_DERIVED') {
    return freeze({ status: 'BAR_H2_PERIOD_ABSTAINS_PAIRING' });
  }
  return freeze({
    status: 'BAR_H2_PERIOD_DERIVED',
    chain: normalized.chain,
    boundary,
    period: canonicalInteger(pairing.value),
    pairing,
  });
}

export function barH2PeriodReturn(chain, input = 0, cochain = transportIncrementCocycle) {
  if (!Number.isInteger(input)) return freeze({ status: 'BAR_H2_PERIOD_RETURN_ABSTAINS_INPUT' });
  const period = barH2Period(chain, cochain);
  if (period.status !== 'BAR_H2_PERIOD_DERIVED') return period;
  return freeze({
    status: 'BAR_H2_PERIOD_RETURN_TRANSLATION_DERIVED',
    period: period.period,
    input,
    output: input + period.period,
    represented_translation: `tau_${period.period}`,
    identity: period.period === 0,
  });
}

function sectionChangedCocycle(phi) {
  return (left, right) => {
    const omega = transportIncrementCocycle(left, right);
    const dphi = normalizedOneCoboundary(phi, left, right);
    if (!Number.isInteger(omega) || !Number.isInteger(dphi)) return null;
    return canonicalInteger(omega + dphi);
  };
}

function bar3BoundaryPeriodCertificate() {
  const T = freeze({ t: 1, E: 0, O: 0 });
  const Q = freeze({ t: 0, E: 1, O: 0 });
  const chain3 = freeze([
    freeze({ coefficient: 1, x: T, y: Q, z: T }),
    freeze({ coefficient: 2, x: Q, y: T, z: Q }),
  ]);
  const boundary3 = boundaryOfBar3Chain(chain3);
  const period = barH2Period(boundary3.chain);
  return freeze({
    passed: boundary3.status === 'NORMALIZED_BAR_3_BOUNDARY_DERIVED'
      && boundary3.is_bar2_cycle
      && period.status === 'BAR_H2_PERIOD_DERIVED'
      && period.period === 0,
    chain3,
    boundary3,
    period,
    all_finite_identity: '<omega,∂b>=<domega,b>=0 for every finite normalized integer bar 3-chain b because #734 earned domega=0.',
  });
}

function representativeShiftCertificate() {
  const cycle = relationBarCycle();
  const T = freeze({ t: 1, E: 0, O: 0 });
  const Q = freeze({ t: 0, E: 1, O: 0 });
  const b = boundaryOfBar3Chain(freeze([
    freeze({ coefficient: 1, x: T, y: T, z: Q }),
  ]));
  const shifted = addBar2Chains(cycle.chain, b.chain);
  const originalPeriod = barH2Period(cycle.chain);
  const shiftedPeriod = barH2Period(shifted.chain);
  return freeze({
    passed: cycle.passed
      && b.status === 'NORMALIZED_BAR_3_BOUNDARY_DERIVED'
      && shifted.status === 'BAR_2_CHAIN_NORMALIZED'
      && originalPeriod.period === 2
      && shiftedPeriod.period === 2,
    original_period: originalPeriod,
    added_boundary: b,
    shifted_cycle: shifted,
    shifted_period: shiftedPeriod,
    identity: 'Per(c+∂b)=Per(c)+<omega,∂b>=Per(c).',
  });
}

function sectionChangeCycleInvarianceCertificate() {
  const cycle = relationBarCycle();
  const phi = (base) => base.t * (base.E + base.O);
  const changed = sectionChangedCocycle(phi);
  const T = freeze({ t: 1, E: 0, O: 0 });
  const Q = freeze({ t: 0, E: 1, O: 0 });
  const omegaTQ = transportIncrementCocycle(T, Q);
  const changedTQ = changed(T, Q);
  const original = barH2Period(cycle.chain, transportIncrementCocycle);
  const transformed = barH2Period(cycle.chain, changed);
  return freeze({
    passed: cycle.passed
      && phi(freeze({ t: 0, E: 0, O: 0 })) === 0
      && omegaTQ === 1
      && changedTQ === 0
      && original.period === 2
      && transformed.period === 2,
    phi_name: 'phi=t(E+O)',
    omega_T_Q: omegaTQ,
    changed_omega_T_Q: changedTQ,
    original_period: original.period,
    transformed_period: transformed.period,
    identity: '<omega+dphi,c>=<omega,c>+<phi,∂c>=<omega,c> for every 2-cycle c.',
  });
}

function additiveOrientationCertificate() {
  const z = relationBarCycle();
  const negative = scaleBar2Chain(z.chain, -1);
  const doubled = scaleBar2Chain(z.chain, 2);
  const cancelled = addBar2Chains(z.chain, negative.chain);
  const pZ = barH2Period(z.chain);
  const pNeg = barH2Period(negative.chain);
  const pDouble = barH2Period(doubled.chain);
  const pCancel = barH2Period(cancelled.chain);
  const rZ = barH2PeriodReturn(z.chain, 11);
  const rNeg = barH2PeriodReturn(negative.chain, rZ.output);
  return freeze({
    passed: pZ.period === 2
      && pNeg.period === -2
      && pDouble.period === 4
      && pCancel.period === 0
      && rZ.output === 13
      && rNeg.output === 11,
    period_z: pZ,
    period_negative_z: pNeg,
    period_2z: pDouble,
    period_z_plus_negative_z: pCancel,
    return_z: rZ,
    return_negative_after_z: rNeg,
    all_finite_additivity: 'Per(c1+c2)=Per(c1)+Per(c2), Per(-c)=-Per(c), and translation composition adds periods by integer linearity.',
  });
}

function cyclicSubgroupCertificate() {
  const z = relationBarCycle();
  const sampleN = freeze([-5, -2, -1, 0, 1, 2, 7]);
  const rows = sampleN.map((n) => {
    const nz = scaleBar2Chain(z.chain, n);
    const period = barH2Period(nz.chain);
    return freeze({ n, period: period.period, expected: 2 * n, passed: period.period === 2 * n });
  });
  return freeze({
    passed: z.passed && rows.every((row) => row.passed),
    rows: freeze(rows),
    all_integer_identity: 'For every n in Z, Per(n[z])=n Per([z])=2n. Since #735 earned infinite order of [z], the restriction to <[z]> is injective with image exactly 2Z.',
    domain_classification: 'CYCLIC_SUBGROUP_GENERATED_BY_EXPLICIT_[z]_ONLY',
    image: '2Z',
    full_period_image_claimed: false,
  });
}

function noncycleAbstentionCertificate() {
  const T = freeze({ t: 1, E: 0, O: 0 });
  const Q = freeze({ t: 0, E: 1, O: 0 });
  const fake = freeze([
    freeze({ coefficient: 1, left: T, right: Q, label: '[T|Q]' }),
  ]);
  const period = barH2Period(fake);
  return freeze({
    passed: period.status === 'BAR_H2_PERIOD_ABSTAINS_NONCYCLE'
      && period.boundary.terms.length > 0,
    fake,
    result: period,
  });
}

function receiptExternalityCertificate() {
  const z = relationBarCycle();
  const a = freeze({ receipt: 'R_PERIOD_A', chain: z.chain });
  const b = freeze({ receipt: 'R_PERIOD_B', chain: z.chain });
  const pa = barH2Period(a.chain);
  const pb = barH2Period(b.chain);
  return freeze({
    passed: a.receipt !== b.receipt && pa.period === pb.period && pa.period === 2,
    receipt_a: a.receipt,
    receipt_b: b.receipt,
    period: pa.period,
    conclusion: 'Receipt identity remains external to mathematical bar-cycle period evaluation.',
  });
}

export function barH2PeriodReturnRepresentationCertificate() {
  const z = relationBarCycle();
  const zPeriod = barH2Period(z.chain);
  const zReturn = barH2PeriodReturn(z.chain, 0);
  const boundary = bar3BoundaryPeriodCertificate();
  const representative = representativeShiftCertificate();
  const section = sectionChangeCycleInvarianceCertificate();
  const additive = additiveOrientationCertificate();
  const cyclic = cyclicSubgroupCertificate();
  const noncycle = noncycleAbstentionCertificate();
  const receipt = receiptExternalityCertificate();

  const passed = [
    z.passed,
    zPeriod.status === 'BAR_H2_PERIOD_DERIVED' && zPeriod.period === 2,
    zReturn.status === 'BAR_H2_PERIOD_RETURN_TRANSLATION_DERIVED' && zReturn.output === 2,
    boundary.passed,
    representative.passed,
    section.passed,
    additive.passed,
    cyclic.passed,
    noncycle.passed,
    receipt.passed,
  ].every(Boolean);

  return freeze({
    schema: BAR_H2_PERIOD_RETURN_REPRESENTATION_SCHEMA,
    parent_receipt: BAR_H2_PERIOD_RETURN_REPRESENTATION_PARENT_RECEIPT,
    gate_issue: BAR_H2_PERIOD_RETURN_REPRESENTATION_GATE_ISSUE,
    passed,
    explicit_relation_cycle: z,
    explicit_period: zPeriod,
    explicit_return: zReturn,
    bar3_boundary_period_zero: boundary,
    representative_shift_invariance: representative,
    section_change_cycle_invariance: section,
    additive_orientation: additive,
    cyclic_subgroup_generated_by_z: cyclic,
    noncycle_abstention: noncycle,
    receipt_externality: receipt,
    homology_factorization: freeze({
      passed: boundary.passed && representative.passed,
      statement: 'Because omega is a 2-cocycle, its integer pairing annihilates bar 2-boundaries and therefore descends to a homomorphism Per_[omega]:H_2^bar(B;Z)->Z in the declared normalized bar complex.',
      full_h2_computed: false,
    }),
    canonical_classifications: passed ? freeze([
      'NORMALIZED_INTEGER_TRANSPORT_TWO_COCYCLE_INDUCES_A_WELL_DEFINED_ADDITIVE_BAR_H2_PERIOD_HOMOMORPHISM_IN_THE_DECLARED_BAR_COMPLEX',
      'THE_EXPLICIT_RELATION_HOMOLOGY_CLASS_[z]_HAS_PERIOD_TWO_AND_INDUCES_A_NONIDENTITY_INTEGER_TORSOR_RETURN_TRANSLATION_TAU_2',
      'BAR_H2_PERIOD_IS_INVARIANT_UNDER_COHOMOLOGOUS_SECTION_PRESENTATIONS_AND_UNDER_CHANGE_OF_CYCLE_REPRESENTATIVE_BY_BAR_3_BOUNDARIES',
      'THE_CYCLIC_SUBGROUP_GENERATED_BY_[z]_MAPS_INJECTIVELY_TO_THE_EVEN_INTEGER_TRANSLATIONS_WITH_PERIOD_n[z]_EQUAL_2n',
    ]) : freeze([]),
    consequential_bearing: passed
      ? 'A_GENUINE_NONZERO_CYCLE_INVARIANT_NOW_SURVIVES_THE_DEGREE_TWO_DESCENT_LAYER_WHILE_ORDINARY_RELATION_GROUPOID_ONE_HOLONOMY_REMAINS_RULED_OUT'
      : null,
    quarantines: freeze([
      'BAR_H2_PERIOD_REPRESENTATION_NOT_2_HOLONOMY',
      'BAR_2_CYCLE_NOT_OPERATIONAL_TQ_LOOP_OR_SURFACE',
      'COBOUNDARY_INVARIANCE_NOT_CONNECTION_GAUGE_INVARIANCE',
      'NO_2_CONNECTION_CURVATURE_GERBE_OR_BERRY_PROMOTION',
      'NO_FULL_H2_OR_H2_COEFFICIENT_CLASSIFICATION',
      'NO_PROTO_LOOM_A16_MERGE_PRODUCTION_PUBLICATION_OR_VERCEL',
    ]),
  });
}
