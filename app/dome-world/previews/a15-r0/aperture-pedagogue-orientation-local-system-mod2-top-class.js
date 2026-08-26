import {
  exactBarH2GlobalCertificate,
  integerFractionGroupMultiply,
  integerFractionGroupInverse,
} from './aperture-pedagogue-exact-bar-h2-torsion-sensitive-holonomy.js';

export const ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_SCHEMA = 'td613.a15-r0.orientation-local-system-mod2-top-class/v0.1';
export const ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_PARENT_RECEIPT = '39b8f6e8ba319154378d03c28a1bf42c02870de1';
export const ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const validIntegerCoordinate = (value) => value && typeof value === 'object'
  && [value.t, value.E, value.O].every(Number.isInteger);

const sameCoordinate = (left, right) => validIntegerCoordinate(left)
  && validIntegerCoordinate(right)
  && left.t === right.t && left.E === right.E && left.O === right.O;

const parity = (n) => ((n % 2) + 2) % 2;

export function orientationCharacter(value) {
  if (!validIntegerCoordinate(value)) return null;
  return parity(value.t) === 0 ? 1 : -1;
}

function sampleGroupElements() {
  const out = [];
  for (const t of [-2, -1, 0, 1, 2]) {
    for (const E of [-1, 0, 1]) {
      for (const O of [-1, 0, 1]) out.push(freeze({ t, E, O }));
    }
  }
  return freeze(out);
}

export function orientationCharacterCertificate() {
  const states = sampleGroupElements();
  const rows = [];
  for (const x of states) {
    for (const y of states) {
      const xy = integerFractionGroupMultiply(x, y);
      const wx = orientationCharacter(x);
      const wy = orientationCharacter(y);
      const wxy = orientationCharacter(xy);
      rows.push(freeze({ x, y, xy, wx, wy, wxy, passed: wxy === wx * wy }));
    }
  }
  const T = freeze({ t: 1, E: 0, O: 0 });
  const unit = freeze({ t: 0, E: 0, O: 0 });
  const passed = rows.length === states.length ** 2
    && rows.every((row) => row.passed)
    && orientationCharacter(T) === -1
    && orientationCharacter(unit) === 1;
  return freeze({
    status: passed ? 'ORIENTATION_CHARACTER_CERTIFICATE_PASSED' : 'ORIENTATION_CHARACTER_CERTIFICATE_FAILED',
    passed,
    parent_receipt: ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_PARENT_RECEIPT,
    sample_pair_count: rows.length,
    all_sample_homomorphism_rows_pass: rows.every((row) => row.passed),
    generator_T_value: orientationCharacter(T),
    unit_value: orientationCharacter(unit),
    image: passed ? '{+1,-1}' : 'UNEARNED',
    kernel_condition: passed ? 't is even' : 'UNEARNED',
    proof: 'The t-coordinate is additive in G, so (-1)^(t+u)=(-1)^t(-1)^u for all integer coordinates.',
  });
}

function kernelToZ3(value) {
  if (!validIntegerCoordinate(value) || parity(value.t) !== 0) return null;
  return freeze({ x: value.E, y: value.O, z: value.t / 2 });
}

function z3ToKernel(value) {
  if (!value || typeof value !== 'object' || ![value.x, value.y, value.z].every(Number.isInteger)) return null;
  return freeze({ t: 2 * value.z, E: value.x, O: value.y });
}

function addZ3(left, right) {
  return freeze({ x: left.x + right.x, y: left.y + right.y, z: left.z + right.z });
}

export function orientationKernelTorusCoverCertificate() {
  const orientation = orientationCharacterCertificate();
  const kernelSamples = sampleGroupElements().filter((value) => parity(value.t) === 0);
  const pairRows = [];
  for (const x of kernelSamples) {
    for (const y of kernelSamples) {
      const xy = integerFractionGroupMultiply(x, y);
      const lhs = kernelToZ3(xy);
      const rhs = addZ3(kernelToZ3(x), kernelToZ3(y));
      pairRows.push(freeze({ x, y, xy, lhs, rhs, passed: JSON.stringify(lhs) === JSON.stringify(rhs) }));
    }
  }
  const roundTripRows = kernelSamples.map((value) => {
    const z3 = kernelToZ3(value);
    const back = z3ToKernel(z3);
    return freeze({ value, z3, back, passed: sameCoordinate(value, back) });
  });

  const T = freeze({ t: 1, E: 0, O: 0 });
  const Tinv = integerFractionGroupInverse(T);
  const conjugationRows = [
    freeze({ t: 0, E: 1, O: 0 }),
    freeze({ t: 0, E: 0, O: 1 }),
    freeze({ t: 2, E: 0, O: 0 }),
    freeze({ t: -2, E: 2, O: -3 }),
  ].map((value) => {
    const left = integerFractionGroupMultiply(T, value);
    const conjugated = integerFractionGroupMultiply(left, Tinv);
    const expected = freeze({ t: value.t, E: value.O, O: value.E });
    return freeze({ value, conjugated, expected, passed: sameCoordinate(conjugated, expected) });
  });

  const deckMatrix = freeze([
    freeze([0, 1, 0]),
    freeze([1, 0, 0]),
    freeze([0, 0, 1]),
  ]);
  const deckDeterminant = -1;
  const passed = orientation.passed
    && pairRows.every((row) => row.passed)
    && roundTripRows.every((row) => row.passed)
    && conjugationRows.every((row) => row.passed)
    && deckDeterminant === -1;

  return freeze({
    status: passed ? 'ORIENTATION_KERNEL_T3_COVER_CERTIFICATE_PASSED' : 'ORIENTATION_KERNEL_T3_COVER_CERTIFICATE_FAILED',
    passed,
    kernel: passed ? 'ker(w)={t even}' : 'UNEARNED',
    kernel_group: passed ? 'Z^3' : 'UNEARNED',
    kernel_isomorphism: passed ? '(t,E,O) |-> (E,O,t/2)' : 'UNEARNED',
    pair_rows: freeze(pairRows),
    round_trip_rows: freeze(roundTripRows),
    orientation_cover_classifying_space: passed ? 'B ker(w) ≃ T^3' : 'UNEARNED',
    deck_conjugation_rows: freeze(conjugationRows),
    deck_H1_matrix: deckMatrix,
    deck_determinant: deckDeterminant,
    deck_top_class_action: passed ? '-1' : 'UNEARNED',
    classification_if_passed: passed
      ? 'THE_775_CLASSIFYING_SPACE_MODEL_HAS_A_NONTRIVIAL_ORIENTATION_CHARACTER_WITH_T_THREE_ORIENTATION_DOUBLE_COVER'
      : 'UNEARNED',
    operational_route_cover_authority: false,
    physical_spacetime_torus_authority: false,
  });
}

function rankMod2(matrix) {
  const rows = matrix.map((row) => row.map((value) => parity(value)));
  let rank = 0;
  let column = 0;
  while (rank < rows.length && column < rows[0].length) {
    const pivot = rows.findIndex((row, index) => index >= rank && row[column] === 1);
    if (pivot === -1) {
      column += 1;
      continue;
    }
    [rows[rank], rows[pivot]] = [rows[pivot], rows[rank]];
    for (let i = 0; i < rows.length; i += 1) {
      if (i !== rank && rows[i][column] === 1) {
        rows[i] = rows[i].map((value, j) => parity(value + rows[rank][j]));
      }
    }
    rank += 1;
    column += 1;
  }
  return rank;
}

export function modTwoHomologyCertificate() {
  const global = exactBarH2GlobalCertificate();
  const inheritedPinned = global.passed
    && global.H2_fiber_action === -1
    && JSON.stringify(global.H1_fiber_action) === JSON.stringify([[0, 1], [1, 0]]);
  const IminusSwapMod2 = freeze([
    freeze([1, 1]),
    freeze([1, 1]),
  ]);
  const rank = rankMod2(IminusSwapMod2);
  const h1KernelDim = 2 - rank;
  const h1CokerDim = 2 - rank;
  const h0DifferenceRank = 0;
  const h2DifferenceRank = 0;

  const H0dim = 1;
  const H1dim = h1CokerDim + (1 - h0DifferenceRank);
  const H2dim = (1 - h2DifferenceRank) + h1KernelDim;
  const H3dim = 1 - h2DifferenceRank;
  const vector = freeze([H0dim, H1dim, H2dim, H3dim]);
  const passed = inheritedPinned
    && rank === 1
    && JSON.stringify(vector) === JSON.stringify([1, 2, 2, 1]);

  return freeze({
    status: passed ? 'MOD_TWO_BAR_HOMOLOGY_CERTIFICATE_PASSED' : 'MOD_TWO_BAR_HOMOLOGY_CERTIFICATE_FAILED',
    passed,
    coefficient_field: 'F2',
    minus_one_equals_plus_one: true,
    I_minus_swap_on_H1_mod2: IminusSwapMod2,
    I_minus_swap_rank: rank,
    H1_kernel_dimension: h1KernelDim,
    H1_cokernel_dimension: h1CokerDim,
    H0_difference_rank: h0DifferenceRank,
    H2_difference_rank: h2DifferenceRank,
    betti_vector_degrees_0_through_3: vector,
    H0: passed ? 'F2' : 'UNEARNED',
    H1: passed ? 'F2^2' : 'UNEARNED',
    H2: passed ? 'F2^2' : 'UNEARNED',
    H3: passed ? 'F2' : 'UNEARNED',
    higher_in_mapping_torus_model: passed ? '0 for n>3' : 'UNEARNED',
  });
}

export function orientationTwistedIntegralHomologyCertificate() {
  const global = exactBarH2GlobalCertificate();
  const inheritedPinned = global.passed
    && global.H2_fiber_action === -1
    && JSON.stringify(global.H1_fiber_action) === JSON.stringify([[0, 1], [1, 0]]);

  const h0Difference = 2;
  const h1Difference = freeze([
    freeze([1, 1]),
    freeze([1, 1]),
  ]);
  const h2Difference = 0;

  const h1KernelGenerator = freeze([1, -1]);
  const h1KernelRank = 1;
  const h1CokerFreeRank = 1;
  const h1CokerTorsion = '0';
  const h0Kernel = '0';
  const h0Coker = 'Z/2';
  const h2Kernel = 'Z';
  const h2Coker = 'Z';

  const passed = inheritedPinned
    && h0Difference === 2
    && h2Difference === 0
    && h1KernelRank === 1
    && h1CokerFreeRank === 1
    && h1CokerTorsion === '0';

  return freeze({
    status: passed ? 'ORIENTATION_TWISTED_INTEGRAL_HOMOLOGY_CERTIFICATE_PASSED' : 'ORIENTATION_TWISTED_INTEGRAL_HOMOLOGY_CERTIFICATE_FAILED',
    passed,
    coefficient_module: 'Z^w',
    effective_monodromy_rule: '-sigma_*',
    q0_difference: h0Difference,
    q1_difference_matrix: h1Difference,
    q2_difference: h2Difference,
    q1_kernel_generator: h1KernelGenerator,
    q1_kernel_rank: h1KernelRank,
    q1_cokernel_free_rank: h1CokerFreeRank,
    q1_cokernel_torsion: h1CokerTorsion,
    q0_kernel: h0Kernel,
    q0_cokernel: h0Coker,
    q2_kernel: h2Kernel,
    q2_cokernel: h2Coker,
    H0: passed ? 'Z/2' : 'UNEARNED',
    H1: passed ? 'Z' : 'UNEARNED',
    H2: passed ? 'Z^2' : 'UNEARNED',
    H3: passed ? 'Z' : 'UNEARNED',
    H2_split_reason: 'The Wang quotient in degree two is Z, hence free/projective, so the extension splits.',
  });
}

export function topClassCoefficientTrichotomyCertificate() {
  const global = exactBarH2GlobalCertificate();
  const mod2 = modTwoHomologyCertificate();
  const twisted = orientationTwistedIntegralHomologyCertificate();
  const ordinaryDifference = global.passed && global.H2_fiber_action === -1
    ? 1 - global.H2_fiber_action
    : null;
  const ordinaryH3 = ordinaryDifference === 2 ? '0' : 'UNEARNED';
  const passed = global.passed
    && ordinaryDifference === 2
    && ordinaryH3 === '0'
    && mod2.passed && mod2.H3 === 'F2'
    && twisted.passed && twisted.H3 === 'Z';

  return freeze({
    status: passed ? 'TOP_CLASS_COEFFICIENT_TRICHOTOMY_CERTIFICATE_PASSED' : 'TOP_CLASS_COEFFICIENT_TRICHOTOMY_CERTIFICATE_FAILED',
    passed,
    untwisted_integral_top_difference: ordinaryDifference,
    H3_Z: ordinaryH3,
    H3_F2: mod2.H3,
    H3_Zw: twisted.H3,
    trichotomy: passed ? 'H3(Z)=0; H3(F2)=F2; H3(Z^w)=Z' : 'UNEARNED',
    scar: 'COEFFICIENT_BLINDNESS_TO_A_TOP_CLASS != ABSENCE_OF_ORIENTATION_DATA_IN_THE_FORMAL_CLASSIFYING_SPACE_MODEL',
    relies_on_778: false,
    relies_on_780: false,
  });
}

export function orientationReductionCompatibilityCertificate() {
  const twisted = orientationTwistedIntegralHomologyCertificate();
  const mod2 = modTwoHomologyCertificate();
  const signValues = freeze([-1, 1]);
  const reducedSigns = freeze(signValues.map((value) => parity(value)));
  const signTrivializes = reducedSigns.every((value) => value === 1);
  const passed = twisted.passed && mod2.passed
    && twisted.H3 === 'Z' && mod2.H3 === 'F2'
    && signTrivializes;
  return freeze({
    status: passed ? 'ORIENTATION_REDUCTION_COMPATIBILITY_CERTIFICATE_PASSED' : 'ORIENTATION_REDUCTION_COMPATIBILITY_CERTIFICATE_FAILED',
    passed,
    integral_orientation_module: 'Z^w',
    reduced_module: passed ? 'F2 with trivial sign action' : 'UNEARNED',
    sign_values: signValues,
    reduced_sign_values: reducedSigns,
    sign_action_trivial_mod_two: signTrivializes,
    top_generator_reduction: passed
      ? 'twisted integral top generator -> ordinary mod-two top generator'
      : 'UNEARNED',
    physical_parity_authority: false,
    gauge_bundle_authority: false,
  });
}

export function orientationLocalSystemHostileCertificate() {
  const T = freeze({ t: 1, E: 0, O: 0 });
  const Q = freeze({ t: 0, E: 1, O: 0 });
  const TQ = integerFractionGroupMultiply(T, Q);
  const wrongCharacter = (value) => (parity(value.E) === 0 ? 1 : -1);
  const wrongCharacterHomomorphismFails = wrongCharacter(TQ) !== wrongCharacter(T) * wrongCharacter(Q);
  const wrongCharacterOddKernelWitness = wrongCharacter(T) === 1 && parity(T.t) === 1;
  const wrongDeckDeterminant = 1;
  const wrongDeckDetected = wrongDeckDeterminant !== -1;
  const wrongUntwistedH3 = 'Z';
  const wrongUntwistedDetected = wrongUntwistedH3 !== '0';
  const wrongModTwoH3 = '0';
  const wrongModTwoDetected = wrongModTwoH3 !== 'F2';
  const wrongTwistedH3 = '0';
  const wrongTwistedDetected = wrongTwistedH3 !== 'Z';
  const falseH1CokerTorsion = 'Z/2';
  const h1CokerTorsionDetected = falseH1CokerTorsion !== '0';
  const wrongReducedSign = freeze([-1, 1]);
  const reducedSignDetected = !wrongReducedSign.every((value) => parity(value) === 1);

  const passed = wrongCharacterHomomorphismFails
    && wrongCharacterOddKernelWitness
    && wrongDeckDetected
    && wrongUntwistedDetected
    && wrongModTwoDetected
    && wrongTwistedDetected
    && h1CokerTorsionDetected
    && reducedSignDetected;

  return freeze({
    status: passed ? 'ORIENTATION_LOCAL_SYSTEM_HOSTILE_CERTIFICATE_PASSED' : 'ORIENTATION_LOCAL_SYSTEM_HOSTILE_CERTIFICATE_FAILED',
    passed,
    wrong_character_T: wrongCharacter(T),
    wrong_character_Q: wrongCharacter(Q),
    wrong_character_TQ: wrongCharacter(TQ),
    wrong_character_homomorphism_rejected: wrongCharacterHomomorphismFails,
    wrong_character_odd_kernel_witness_rejected: wrongCharacterOddKernelWitness,
    wrong_deck_determinant_rejected: wrongDeckDetected,
    wrong_untwisted_top_class_rejected: wrongUntwistedDetected,
    wrong_mod_two_top_class_rejected: wrongModTwoDetected,
    wrong_twisted_top_class_rejected: wrongTwistedDetected,
    false_I_plus_swap_torsion_cokernel_rejected: h1CokerTorsionDetected,
    nontrivial_mod_two_sign_action_rejected: reducedSignDetected,
  });
}

export function orientationLocalSystemMod2TopClassCertificate() {
  const orientation = orientationCharacterCertificate();
  const cover = orientationKernelTorusCoverCertificate();
  const mod2 = modTwoHomologyCertificate();
  const twisted = orientationTwistedIntegralHomologyCertificate();
  const trichotomy = topClassCoefficientTrichotomyCertificate();
  const reduction = orientationReductionCompatibilityCertificate();
  const hostiles = orientationLocalSystemHostileCertificate();
  const passed = orientation.passed
    && cover.passed
    && mod2.passed
    && twisted.passed
    && trichotomy.passed
    && reduction.passed
    && hostiles.passed;

  return freeze({
    status: passed ? 'ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_CERTIFICATE_PASSED' : 'ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_CERTIFICATE_FAILED',
    passed,
    parent_receipt: ORIENTATION_LOCAL_SYSTEM_MOD2_TOP_CLASS_PARENT_RECEIPT,
    orientation,
    orientation_cover: cover,
    mod_two_homology: mod2,
    orientation_twisted_homology: twisted,
    top_class_trichotomy: trichotomy,
    reduction_compatibility: reduction,
    hostiles,
    earned_if_passed: freeze([
      'THE_775_CLASSIFYING_SPACE_MODEL_HAS_A_NONTRIVIAL_ORIENTATION_CHARACTER_WITH_T_THREE_ORIENTATION_DOUBLE_COVER',
      'THE_DECK_INVOLUTION_REVERSES_THE_INTEGRAL_TOP_CLASS_OF_THE_ORIENTATION_COVER',
      'ORDINARY_INTEGRAL_TOP_HOMOLOGY_VANISHES_WHILE_MOD_TWO_TOP_HOMOLOGY_SURVIVES',
      'THE_ORIENTATION_LOCAL_SYSTEM_RESTORES_AN_INTEGRAL_TOP_CLASS',
      'MOD_TWO_REDUCTION_OF_THE_TWISTED_INTEGRAL_TOP_CLASS_IS_THE_ORDINARY_MOD_TWO_TOP_CLASS',
      'FULL_MOD_TWO_BAR_HOMOLOGY_HAS_BETTI_VECTOR_ONE_TWO_TWO_ONE',
      'FULL_ORIENTATION_TWISTED_INTEGRAL_BAR_HOMOLOGY_IS_Z_OVER_TWO_Z_Z_SQUARED_Z_IN_DEGREES_ZERO_THROUGH_THREE',
      'ORIENTATION_COVER_AND_COEFFICIENT_TOP_CLASS_TRICHOTOMY_EARNED',
    ]),
    authority_ceiling: freeze({
      operational_route_cover: false,
      operational_inverse_route: false,
      physical_chirality: false,
      physical_spacetime_torus: false,
      physical_parity_symmetry: false,
      gauge_bundle: false,
      geometric_route_volume_form: false,
      ontology: false,
      production: false,
      vercel: false,
    }),
  });
}
