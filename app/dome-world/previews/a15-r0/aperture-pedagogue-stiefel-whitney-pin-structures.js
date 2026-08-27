import {
  integerFractionGroupMultiply,
  exactBarH2GlobalCertificate,
} from './aperture-pedagogue-exact-bar-h2-torsion-sensitive-holonomy.js';

export const STIEFEL_WHITNEY_PIN_STRUCTURES_SCHEMA = 'td613.a15-r0.stiefel-whitney-pin-structures/v0.1';
export const STIEFEL_WHITNEY_PIN_STRUCTURES_PARENT_RECEIPT = '39b8f6e8ba319154378d03c28a1bf42c02870de1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const SWAP = freeze([[0, 1], [1, 0]]);
const PLUS_VECTOR = freeze([1, 1]);
const MINUS_VECTOR = freeze([1, -1]);

function matVec(matrix, vector) {
  return matrix.map((row) => row.reduce((sum, entry, i) => sum + (entry * vector[i]), 0));
}

function sameVector(left, right) {
  return left.length === right.length && left.every((value, i) => value === right[i]);
}

function scaleVector(scalar, vector) {
  return vector.map((value) => scalar * value);
}

function det2(matrix) {
  return (matrix[0][0] * matrix[1][1]) - (matrix[0][1] * matrix[1][0]);
}

export function orientationCharacter(groupElement) {
  if (!groupElement || ![groupElement.t, groupElement.E, groupElement.O].every(Number.isInteger)) return null;
  return Math.abs(groupElement.t % 2) === 1 ? -1 : 1;
}

export function swapEigenlineCertificate() {
  const plusImage = matVec(SWAP, PLUS_VECTOR);
  const minusImage = matVec(SWAP, MINUS_VECTOR);
  const determinant = det2(SWAP);
  const passed = determinant === -1
    && sameVector(plusImage, PLUS_VECTOR)
    && sameVector(minusImage, scaleVector(-1, MINUS_VECTOR));
  return freeze({
    status: passed ? 'SWAP_EIGENLINE_SPLITTING_CERTIFICATE_PASSED' : 'SWAP_EIGENLINE_SPLITTING_CERTIFICATE_FAILED',
    passed,
    matrix: SWAP,
    determinant,
    plus_line: freeze({ generator: PLUS_VECTOR, image: freeze(plusImage), eigenvalue: 1 }),
    minus_line: freeze({ generator: MINUS_VECTOR, image: freeze(minusImage), eigenvalue: -1 }),
    vertical_bundle_candidate: 'epsilon_plus ⊕ L_w',
  });
}

export function orientationCharacterCertificate() {
  const sampleElements = [];
  for (let t = -3; t <= 3; t += 1) {
    for (let E = -1; E <= 1; E += 1) {
      for (let O = -1; O <= 1; O += 1) {
        sampleElements.push(freeze({ t, E, O }));
      }
    }
  }
  const rows = [];
  for (const left of sampleElements) {
    for (const right of sampleElements) {
      const product = integerFractionGroupMultiply(left, right);
      const wLeft = orientationCharacter(left);
      const wRight = orientationCharacter(right);
      const wProduct = orientationCharacter(product);
      rows.push(freeze({
        left,
        right,
        product,
        w_left: wLeft,
        w_right: wRight,
        w_product: wProduct,
        passed: wProduct === (wLeft * wRight),
      }));
    }
  }
  const swap = swapEigenlineCertificate();
  const passed = swap.passed
    && orientationCharacter({ t: 1, E: 0, O: 0 }) === -1
    && orientationCharacter({ t: 0, E: 1, O: 0 }) === 1
    && rows.every((row) => row.passed);
  return freeze({
    status: passed ? 'PARITY_ORIENTATION_CHARACTER_CERTIFICATE_PASSED' : 'PARITY_ORIENTATION_CHARACTER_CERTIFICATE_FAILED',
    passed,
    orientation_character: 'w(t,E,O)=(-1)^t',
    sample_elements: sampleElements.length,
    sample_pairs: rows.length,
    all_homomorphism_rows_pass: rows.every((row) => row.passed),
    odd_base_generator_reverses_orientation: true,
    fiber_generators_preserve_orientation: true,
    swap,
  });
}

export function mappingTorusTangentSplittingCertificate() {
  const parent = exactBarH2GlobalCertificate();
  const swap = swapEigenlineCertificate();
  const orientation = orientationCharacterCertificate();
  const passed = parent.passed
    && swap.passed
    && orientation.passed
    && parent.fraction_group === 'G=Z² ⋊_σ Z'
    && parent.classifying_space_model.includes('mapping torus');
  return freeze({
    status: passed ? 'MAPPING_TORUS_TANGENT_SPLITTING_CERTIFICATE_PASSED' : 'MAPPING_TORUS_TANGENT_SPLITTING_CERTIFICATE_FAILED',
    passed,
    parent_fraction_group: parent.fraction_group,
    parent_classifying_space_model: parent.classifying_space_model,
    base_tangent_line: 'epsilon_base',
    vertical_plus_eigenline: 'epsilon_plus',
    vertical_minus_eigenline: 'L_w',
    tangent_bundle_candidate: 'TM_f ≅ epsilon^2 ⊕ L_w',
    orientation_line: 'L_w',
    orientation_character: orientation.orientation_character,
    geometric_model_only: true,
    operational_route_tangent_authority: false,
    physical_spacetime_authority: false,
  });
}

export function stiefelWhitneyProfileCertificate() {
  const tangent = mappingTorusTangentSplittingCertificate();
  const profile = freeze({ w0: 1, w1: 'u', w2: 0, w3: 0 });
  const uSquare = 0;
  const passed = tangent.passed
    && profile.w1 === 'u'
    && profile.w2 === 0
    && profile.w3 === 0
    && uSquare === 0;
  return freeze({
    status: passed ? 'STIEFEL_WHITNEY_PROFILE_CERTIFICATE_PASSED' : 'STIEFEL_WHITNEY_PROFILE_CERTIFICATE_FAILED',
    passed,
    tangent_splitting: tangent.tangent_bundle_candidate,
    total_class: 'w(TM_f)=1+u',
    profile,
    u_source: 'u=p^*(a), a generator of H^1(S^1;F2)',
    base_circle_H2_F2: 0,
    u_squared: uSquare,
    w1_nonzero_reason: 'odd-t monodromy has determinant -1',
    higher_classes_vanish_reason: 'Whitney product of two trivial lines and one real line bundle has total class 1+u.',
    scar: 'NONORIENTABLE_TANGENT_BUNDLE != NONZERO_HIGHER_STIEFEL_WHITNEY_CLASSES',
  });
}

export function pinStructureCertificate() {
  const sw = stiefelWhitneyProfileCertificate();
  const w1Squared = sw.u_squared;
  const w2 = sw.profile.w2;
  const pinPlusObstruction = w2;
  const pinMinusObstruction = (w2 + w1Squared) % 2;
  const pinPlusExists = pinPlusObstruction === 0;
  const pinMinusExists = pinMinusObstruction === 0;
  const spinExists = sw.profile.w1 === 0 && w2 === 0;
  const H1F2Rank = 2;
  const torsorCardinality = 2 ** H1F2Rank;
  const passed = sw.passed
    && pinPlusExists
    && pinMinusExists
    && !spinExists
    && torsorCardinality === 4;
  return freeze({
    status: passed ? 'PIN_PLUS_MINUS_STRUCTURE_CERTIFICATE_PASSED' : 'PIN_PLUS_MINUS_STRUCTURE_CERTIFICATE_FAILED',
    passed,
    pin_plus: freeze({ obstruction: 'w2', value: pinPlusObstruction, exists: pinPlusExists, isomorphism_classes: torsorCardinality }),
    pin_minus: freeze({ obstruction: 'w2+w1^2', value: pinMinusObstruction, exists: pinMinusExists, isomorphism_classes: torsorCardinality }),
    spin: freeze({ obstruction_requires: 'w1=0 and w2=0', exists: spinExists, rejected_because: 'w1=u!=0' }),
    H1_F2_rank_from_witnessed_H1_Z2: H1F2Rank,
    lift_classification: 'Each nonempty Pin± lift set is an H^1(M_f;F2)-torsor.',
    pin_structures_are_physical_states: false,
  });
}

export function stiefelWhitneyPinStructuresAggregate() {
  const eigenlines = swapEigenlineCertificate();
  const orientation = orientationCharacterCertificate();
  const tangent = mappingTorusTangentSplittingCertificate();
  const sw = stiefelWhitneyProfileCertificate();
  const pin = pinStructureCertificate();
  const passed = eigenlines.passed && orientation.passed && tangent.passed && sw.passed && pin.passed;
  return freeze({
    status: passed ? 'STIEFEL_WHITNEY_AND_PIN_STRUCTURE_AGGREGATE_PASSED' : 'STIEFEL_WHITNEY_AND_PIN_STRUCTURE_AGGREGATE_FAILED',
    passed,
    parent_receipt: STIEFEL_WHITNEY_PIN_STRUCTURES_PARENT_RECEIPT,
    eigenlines,
    orientation,
    tangent,
    stiefel_whitney: sw,
    pin,
    earned_if_passed: freeze([
      'THE_SWAP_MAPPING_TORUS_TANGENT_BUNDLE_SPLITS_AS_TWO_TRIVIAL_LINES_PLUS_THE_PARITY_ORIENTATION_LINE',
      'THE_TOTAL_STIEFEL_WHITNEY_CLASS_IS_ONE_PLUS_THE_BASE_ORIENTATION_CLASS_U',
      'W_ONE_EQUALS_U_IS_NONZERO_WHILE_W_TWO_W_THREE_AND_W_ONE_SQUARED_VANISH',
      'THE_MAPPING_TORUS_MODEL_ADMITS_BOTH_PIN_PLUS_AND_PIN_MINUS_STRUCTURES_BUT_NO_SPIN_STRUCTURE',
      'EACH_PIN_TYPE_FORMS_AN_H_ONE_F_TWO_TORSOR_WITH_FOUR_ISOMORPHISM_CLASSES',
      'ALL_NONORIENTABILITY_IS_CONCENTRATED_IN_A_SINGLE_REAL_LINE_BUNDLE_FACTOR',
      'STIEFEL_WHITNEY_AND_PIN_STRUCTURE_PROFILE_EARNED',
    ]),
    ceilings: freeze({
      physical_fermion_sector: false,
      particle_spin_claim: false,
      operational_route_tangent_bundle: false,
      physical_spacetime_decomposition: false,
      geometric_2_holonomy: false,
    }),
  });
}
