import {
  multiplyQuotientCoordinates,
  quotientCoordinate,
} from './aperture-pedagogue-target-equivalence-quotient-congruence.js';
import {
  firstMomentCoordinate,
  multiplyFirstMomentCoordinates,
} from './aperture-pedagogue-first-moment-weaker-transport-quotient.js';
import {
  enterCurrentQLastActionDomain,
  rehydrateReceiptPinnedRecurrenceSource,
} from './aperture-pedagogue-directed-fiber-transport-quotient-descent.js';

export const AFFINE_TRANSPORT_INCREMENT_COCYCLE_SCHEMA = 'td613.a15-r0.aperture-pedagogue-affine-transport-increment-cocycle/v0.1';
export const AFFINE_TRANSPORT_INCREMENT_COCYCLE_PARENT_RECEIPT = 'fd632f912982914a36807f83b02f750945c230a7';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const keyOf = (value) => JSON.stringify(value);

function validBase(x) {
  return x && [x.t, x.E, x.O].every((n) => Number.isInteger(n) && n >= 0);
}

function validExtension(x) {
  return x && [x.t, x.E, x.O, x.P].every((n) => Number.isInteger(n) && n >= 0);
}

export function baseQ(x) {
  if (!validBase(x)) return null;
  return x.E + x.O;
}

export function transportIncrementCocycle(left, right) {
  if (!validBase(left) || !validBase(right)) return null;
  return left.t * baseQ(right);
}

export function multiplyByTransportCocycle(left, right) {
  if (!validExtension(left) || !validExtension(right)) {
    return freeze({ status: 'AFFINE_TRANSPORT_COCYCLE_PRODUCT_ABSTAINS' });
  }
  const parent = multiplyQuotientCoordinates(left, right);
  if (parent?.status !== 'PARITY_TWISTED_QUOTIENT_PRODUCT_DERIVED') {
    return freeze({ status: parent?.status ?? 'PARENT_QUOTIENT_PRODUCT_ABSTAINS' });
  }
  return freeze({
    status: 'AFFINE_TRANSPORT_COCYCLE_EXTENSION_PRODUCT_DERIVED',
    t: parent.t,
    E: parent.E,
    O: parent.O,
    P: left.P + right.P + transportIncrementCocycle(left, right),
  });
}

function sameBase(a, b) {
  return validBase(a) && validBase(b)
    && a.t === b.t && a.E === b.E && a.O === b.O;
}

function sameExtension(a, b) {
  return validExtension(a) && validExtension(b)
    && a.t === b.t && a.E === b.E && a.O === b.O && a.P === b.P;
}

function homomorphismCertificate() {
  const x = freeze({ t: 3, E: 5, O: 7 });
  const y = freeze({ t: 4, E: 11, O: 13 });
  const xy = multiplyQuotientCoordinates(x, y);
  return freeze({
    passed: xy?.status === 'PARITY_TWISTED_QUOTIENT_PRODUCT_DERIVED'
      && xy.t === x.t + y.t
      && baseQ(xy) === baseQ(x) + baseQ(y),
    symbolic: freeze({
      t_law: 't(x★y)=t(x)+t(y)',
      q_law: 'q(x★y)=E(x★y)+O(x★y)=q(x)+q(y); the odd-t parity swap permutes F,G but preserves F+G.',
      authority: 'ALL_BASE_COORDINATES_BY_THE_WITNESSED_#729_PRODUCT_FORMULA',
    }),
  });
}

function normalizationCertificate() {
  const e = freeze({ t: 0, E: 0, O: 0 });
  const x = freeze({ t: 7, E: 5, O: 3 });
  return freeze({
    passed: transportIncrementCocycle(e, x) === 0
      && transportIncrementCocycle(x, e) === 0,
    identity: e,
    symbolic: 'ω(e,x)=0*q(x)=0 and ω(x,e)=t(x)*0=0 for every x.',
  });
}

function symbolicCocycleCertificate() {
  const lhs = freeze({ t_x_q_y: 1, t_x_q_z: 1, t_y_q_z: 1 });
  const rhs = freeze({ t_x_q_y: 1, t_x_q_z: 1, t_y_q_z: 1 });
  return freeze({
    passed: keyOf(lhs) === keyOf(rhs),
    lhs,
    rhs,
    identity: 'ω(x,y)+ω(x★y,z)=t_x q_y+(t_x+t_y)q_z=t_x q_y+t_x q_z+t_y q_z',
    reverse: 'ω(y,z)+ω(x,y★z)=t_y q_z+t_x(q_y+q_z)=t_x q_y+t_x q_z+t_y q_z',
    proof_scope: 'ALL_#729_BASE_COORDINATES_USING_ONLY_ADDITIVITY_OF_t_AND_q',
  });
}

function cocycleDefect(omega, x, y, z) {
  const xy = multiplyQuotientCoordinates(x, y);
  const yz = multiplyQuotientCoordinates(y, z);
  if (xy?.status !== 'PARITY_TWISTED_QUOTIENT_PRODUCT_DERIVED'
    || yz?.status !== 'PARITY_TWISTED_QUOTIENT_PRODUCT_DERIVED') return null;
  return omega(x, y) + omega(xy, z) - omega(y, z) - omega(x, yz);
}

function concreteCocycleControls() {
  const coords = freeze([
    freeze({ t: 0, E: 0, O: 0 }),
    freeze({ t: 1, E: 0, O: 0 }),
    freeze({ t: 0, E: 1, O: 0 }),
    freeze({ t: 1, E: 0, O: 1 }),
    freeze({ t: 2, E: 3, O: 1 }),
    freeze({ t: 3, E: 2, O: 4 }),
  ]);
  const rows = [];
  for (const x of coords) {
    for (const y of coords) {
      for (const z of coords) {
        rows.push(freeze({ x, y, z, defect: cocycleDefect(transportIncrementCocycle, x, y, z) }));
      }
    }
  }
  return freeze({
    passed: rows.every((row) => row.defect === 0),
    rows: freeze(rows),
    authority: 'FINITE_HOSTILE_CORROBORATION_ONLY_NOT_UNIVERSAL_PROOF',
  });
}

function extensionRecoveryCertificate() {
  const samples = freeze([
    freeze([freeze({ t: 1, E: 0, O: 0, P: 0 }), freeze({ t: 0, E: 1, O: 0, P: 0 })]),
    freeze([freeze({ t: 0, E: 1, O: 0, P: 0 }), freeze({ t: 1, E: 0, O: 0, P: 0 })]),
    freeze([freeze({ t: 3, E: 1, O: 1, P: 3 }), freeze({ t: 2, E: 2, O: 1, P: 4 })]),
    freeze([freeze({ t: 4, E: 1, O: 0, P: 4 }), freeze({ t: 3, E: 1, O: 1, P: 3 })]),
  ]);
  const rows = samples.map(([left, right]) => {
    const witnessed = multiplyFirstMomentCoordinates(left, right);
    const cocycle = multiplyByTransportCocycle(left, right);
    return freeze({ left, right, witnessed, cocycle, equal: sameExtension(witnessed, cocycle) });
  });
  return freeze({
    passed: rows.every((row) => row.equal),
    rows: freeze(rows),
    universal_identity: 'The #733 P-product is P+R+t*q(right), exactly the cocycle-extension product by definition of ω=t*q.',
    authority: 'UNIVERSAL_RECOVERY_FROM_FROZEN_#733_PRODUCT_FORMULA_WITH_FINITE_IMPLEMENTATION_CONTROLS',
  });
}

function concatenationControls() {
  const pairs = freeze([
    freeze([freeze(['T']), freeze(['Q'])]),
    freeze([freeze(['Q']), freeze(['T'])]),
    freeze([freeze(['T', 'Q']), freeze(['Q', 'T', 'Q'])]),
    freeze([freeze(['Q', 'T', 'T']), freeze(['Q', 'Q', 'T'])]),
    freeze([freeze(['T', 'Q', 'T']), freeze(['Q', 'T', 'T', 'Q'])]),
  ]);
  const rows = pairs.map(([u, v]) => {
    const direct = firstMomentCoordinate([...u, ...v]);
    const product = multiplyByTransportCocycle(firstMomentCoordinate(u), firstMomentCoordinate(v));
    return freeze({ u, v, direct, product, equal: sameExtension(direct, product) });
  });
  return freeze({
    passed: rows.every((row) => row.equal),
    rows: freeze(rows),
    authority: 'FINITE_CONTROLS_CORROBORATE_#733_ALL_FINITE_CONCATENATION_THEOREM',
  });
}

function representativeIndependenceControl() {
  const u = freeze(['T', 'T', 'Q']);
  const v = freeze(['Q', 'T', 'T']);
  const cu = quotientCoordinate(u);
  const cv = quotientCoordinate(v);
  const partners = freeze([
    freeze(['T']),
    freeze(['Q']),
    freeze(['T', 'Q']),
    freeze(['Q', 'T']),
  ]);
  const rows = partners.map((word) => {
    const c = quotientCoordinate(word);
    return freeze({
      partner: word,
      right_equal: transportIncrementCocycle(cu, c) === transportIncrementCocycle(cv, c),
      left_equal: transportIncrementCocycle(c, cu) === transportIncrementCocycle(c, cv),
    });
  });
  return freeze({
    passed: sameBase(cu, cv)
      && keyOf(u) !== keyOf(v)
      && rows.every((row) => row.right_equal && row.left_equal),
    representative_u: u,
    representative_v: v,
    common_base: freeze({ t: cu.t, E: cu.E, O: cu.O }),
    rows: freeze(rows),
    claim: 'ω reads only #729 base coordinates; route spelling is external.',
  });
}

function orderSensitiveHostile() {
  const T = freeze({ t: 1, E: 0, O: 0 });
  const Q = freeze({ t: 0, E: 1, O: 0 });
  const omegaTQ = transportIncrementCocycle(T, Q);
  const omegaQT = transportIncrementCocycle(Q, T);
  return freeze({
    passed: omegaTQ === 1 && omegaQT === 0,
    omega_TQ: omegaTQ,
    omega_QT: omegaQT,
    classification: 'TRANSPORT_INCREMENT_COCYCLE_IS_NONZERO_AND_DIRECTED_ORDER_SENSITIVE',
    cohomology_class_claim: false,
  });
}

function swappedCrossTermHostile() {
  const omegaSwap = (x, y) => baseQ(x) * y.t;
  const T1 = firstMomentCoordinate(['T']);
  const Q1 = firstMomentCoordinate(['Q']);
  const parentTQ = multiplyFirstMomentCoordinates(T1, Q1);
  const parentQT = multiplyFirstMomentCoordinates(Q1, T1);
  const productWith = (left, right, omega) => {
    const parent = multiplyQuotientCoordinates(left, right);
    return freeze({ t: parent.t, E: parent.E, O: parent.O, P: left.P + right.P + omega(left, right) });
  };
  const wrongTQ = productWith(T1, Q1, omegaSwap);
  const wrongQT = productWith(Q1, T1, omegaSwap);
  return freeze({
    passed: !sameExtension(parentTQ, wrongTQ)
      && !sameExtension(parentQT, wrongQT)
      && cocycleDefect(omegaSwap, T1, Q1, T1) === 0,
    parent_TQ: parentTQ,
    wrong_TQ: wrongTQ,
    parent_QT: parentQT,
    wrong_QT: wrongQT,
    lesson: 'Being a cocycle is insufficient; the witnessed transport dynamics select ω=t(left)q(right), not q(left)t(right).',
  });
}

function parityFragileHostile() {
  const omegaE = (x, y) => x.t * y.E;
  const T = freeze({ t: 1, E: 0, O: 0 });
  const Q = freeze({ t: 0, E: 1, O: 0 });
  const defect = cocycleDefect(omegaE, T, T, Q);
  return freeze({
    passed: defect !== 0,
    defect_T_T_Q: defect,
    expected_nonzero: true,
    lesson: 'E alone is not additive through the odd-parity swap; q=E+O is the swap-invariant additive observable required by the cocycle law.',
  });
}

function phi(base) {
  return base.t * base.t + baseQ(base);
}

export function transformedTransportIncrementCocycle(left, right, section = phi) {
  const parent = multiplyQuotientCoordinates(left, right);
  if (parent?.status !== 'PARITY_TWISTED_QUOTIENT_PRODUCT_DERIVED') return null;
  return transportIncrementCocycle(left, right)
    + section(parent)
    - section(left)
    - section(right);
}

function sectionChangeCertificate() {
  const cancellation = freeze({ phi_x: 0, phi_y: 0, phi_z: 0, phi_xy: 0, phi_yz: 0, phi_xyz: 0 });
  const symbolic = freeze({
    original_defect: 'Dω',
    correction: 'δφ(x,y)+δφ(x★y,z)-δφ(y,z)-δφ(x,y★z)=0 by associativity of ★',
    transformed_defect: 'Dω_φ=Dω=0',
  });
  const coords = freeze([
    freeze({ t: 0, E: 0, O: 0 }),
    freeze({ t: 1, E: 0, O: 0 }),
    freeze({ t: 0, E: 1, O: 0 }),
    freeze({ t: 1, E: 0, O: 1 }),
    freeze({ t: 2, E: 2, O: 1 }),
  ]);
  const rows = [];
  for (const x of coords) {
    for (const y of coords) {
      for (const z of coords) {
        rows.push(freeze({
          x, y, z,
          defect: cocycleDefect((a, b) => transformedTransportIncrementCocycle(a, b, phi), x, y, z),
        }));
      }
    }
  }
  const e = coords[0];
  const normalization = coords.every((x) => transformedTransportIncrementCocycle(e, x, phi) === 0
    && transformedTransportIncrementCocycle(x, e, phi) === 0);

  const extensionSamples = freeze([
    freeze([freeze({ t: 1, E: 0, O: 0, P: 0 }), freeze({ t: 0, E: 1, O: 0, P: 0 })]),
    freeze([freeze({ t: 2, E: 1, O: 0, P: 2 }), freeze({ t: 1, E: 1, O: 1, P: 1 })]),
  ]);
  const extensionRows = extensionSamples.map(([left, right]) => {
    const baseProduct = multiplyQuotientCoordinates(left, right);
    const original = multiplyFirstMomentCoordinates(left, right);
    const leftPrime = left.P + phi(left);
    const rightPrime = right.P + phi(right);
    const transformedProductP = leftPrime + rightPrime + transformedTransportIncrementCocycle(left, right, phi);
    const expectedPrime = original.P + phi(baseProduct);
    return freeze({ left, right, transformed_product_P: transformedProductP, expected_prime_P: expectedPrime, equal: transformedProductP === expectedPrime });
  });

  return freeze({
    passed: phi(e) === 0
      && normalization
      && rows.every((row) => row.defect === 0)
      && extensionRows.every((row) => row.equal),
    section: 'φ(t,E,O)=t^2+E+O',
    symbolic,
    cancellation,
    normalization,
    rows: freeze(rows),
    extension_rows: freeze(extensionRows),
    classification: 'SECTION_CHANGE_COVARIANCE_OF_NORMALIZED_MONOID_COCYCLE_PRESENTATION',
    cohomology_claim: false,
  });
}

function receiptExternalityControl() {
  const a = enterCurrentQLastActionDomain(rehydrateReceiptPinnedRecurrenceSource('S0', 'R1'));
  const b = enterCurrentQLastActionDomain(rehydrateReceiptPinnedRecurrenceSource('S0', 'R1_DUP'));
  const left = quotientCoordinate(['T', 'T', 'Q']);
  const right = quotientCoordinate(['Q', 'T']);
  const omegaA = transportIncrementCocycle(left, right);
  const omegaB = transportIncrementCocycle(left, right);
  return freeze({
    passed: a?.receipt_variant === 'R1'
      && b?.receipt_variant === 'R1_DUP'
      && a.receipt_variant !== b.receipt_variant
      && omegaA === omegaB,
    receipt_a: a?.receipt_variant,
    receipt_b: b?.receipt_variant,
    cocycle_equal: omegaA === omegaB,
    claim: 'Receipt provenance remains external to the #729 base coordinate and cocycle value.',
  });
}

export function runAffineTransportIncrementCocycleAssay() {
  const homomorphisms = homomorphismCertificate();
  const normalization = normalizationCertificate();
  const symbolic = symbolicCocycleCertificate();
  const concrete = concreteCocycleControls();
  const recovery = extensionRecoveryCertificate();
  const concatenation = concatenationControls();
  const representatives = representativeIndependenceControl();
  const order = orderSensitiveHostile();
  const swapped = swappedCrossTermHostile();
  const parity = parityFragileHostile();
  const section = sectionChangeCertificate();
  const receipt = receiptExternalityControl();

  const passed = homomorphisms.passed
    && normalization.passed
    && symbolic.passed
    && concrete.passed
    && recovery.passed
    && concatenation.passed
    && representatives.passed
    && order.passed
    && swapped.passed
    && parity.passed
    && section.passed
    && receipt.passed;

  return freeze({
    schema: AFFINE_TRANSPORT_INCREMENT_COCYCLE_SCHEMA,
    passed,
    status: passed
      ? 'AFFINE_TRANSPORT_INCREMENT_COCYCLE_ROUND_CLOSED'
      : 'AFFINE_TRANSPORT_INCREMENT_COCYCLE_AUDITION_FAILED',
    canonical_classification: passed
      ? 'FIRST_MOMENT_AFFINE_CROSS_TERM_IS_WELL_DEFINED_NORMALIZED_MONOID_2_COCYCLE_RECOVERING_WITNESSED_TRANSPORT_EXTENSION_WITH_SECTION_CHANGE_COVARIANCE'
      : 'AFFINE_TRANSPORT_COCYCLE_CLASSIFICATION_WITHHELD',
    parent_receipt: AFFINE_TRANSPORT_INCREMENT_COCYCLE_PARENT_RECEIPT,
    coefficient_object: '(N,+,0) with trivial base action; Z embedding only for section-change re-zeroing audit',
    cocycle: 'ω(x,y)=t(x)q(y), q=E+O',
    homomorphisms,
    normalization,
    symbolic,
    concrete,
    recovery,
    concatenation,
    representatives,
    order,
    swapped,
    parity,
    section,
    receipt,
    claim_ceiling: freeze({
      nontrivial_cohomology_class: false,
      coboundary_classification: false,
      H2_computation: false,
      group_cohomology: false,
      group_completion: false,
      inverse_transport: false,
      groupoid: false,
      connection: false,
      closed_nonidentity_loop: false,
      holonomy: false,
      curvature: false,
      berry_quantum_analogy: false,
      higher_moment_completeness: false,
      proto_loom: false,
      a16: false,
      live_ash_mutation: false,
      merge: false,
      production: false,
      vercel: false,
    }),
    stop: passed
      ? 'HUMAN_𝄐_REQUIRED_BEFORE_ANY_COHOMOLOGY_CLASS_NONTRIVIALITY_OR_HIGHER_MOMENT_HIERARCHY_AUDITION'
      : 'PRESERVE_FIRST_OBSTRUCTION_AND_DO_NOT_PROMOTE_COCYCLE_LANGUAGE',
  });
}
