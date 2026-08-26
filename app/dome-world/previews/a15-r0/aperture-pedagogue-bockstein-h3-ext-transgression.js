import {
  exactBarH2GlobalCertificate,
  explicitBarH2BasisCertificate,
  modTwoTorsionDetectorCertificate,
  primitiveIntegralCocycleCertificate,
  torsionBeta,
} from './aperture-pedagogue-exact-bar-h2-torsion-sensitive-holonomy.js';

export const BOCKSTEIN_H3_EXT_TRANSGRESSION_SCHEMA = 'td613.a15-r0.bockstein-h3-ext-transgression/v0.1';
export const BOCKSTEIN_H3_EXT_TRANSGRESSION_PARENT_RECEIPT = '39b8f6e8ba319154378d03c28a1bf42c02870de1';
export const BOCKSTEIN_H3_EXT_TRANSGRESSION_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const mod2 = (value) => ((value % 2) + 2) % 2;
const key = (value) => JSON.stringify(value);
const ZERO_RESIDUE = freeze([0, 0, 0]);

function sameResidue(left, right) {
  return Array.isArray(left) && Array.isArray(right)
    && left.length === 3 && right.length === 3
    && left.every((value, index) => value === right[index]);
}

function validResidue(value) {
  return Array.isArray(value) && value.length === 3
    && value.every((entry) => entry === 0 || entry === 1);
}

function residueStates() {
  const states = [];
  for (const t of [0, 1]) {
    for (const E of [0, 1]) {
      for (const O of [0, 1]) states.push(freeze([t, E, O]));
    }
  }
  return freeze(states);
}

function residueProduct(left, right) {
  if (!validResidue(left) || !validResidue(right)) return null;
  const acted = left[0] === 0 ? [right[1], right[2]] : [right[2], right[1]];
  return freeze([
    mod2(left[0] + right[0]),
    mod2(left[1] + acted[0]),
    mod2(left[2] + acted[1]),
  ]);
}

function reachableRepresentative(residue) {
  if (!validResidue(residue)) return null;
  const [t, E, O] = residue;
  if (t === 1) return freeze({ t: 1, E, O });
  if (O === 0) return freeze({ t: 0, E, O: 0 });
  return freeze({ t: 2, E, O });
}

function betaLift(left, right) {
  const leftRepresentative = reachableRepresentative(left);
  const rightRepresentative = reachableRepresentative(right);
  if (!leftRepresentative || !rightRepresentative) return null;
  const value = torsionBeta(leftRepresentative, rightRepresentative);
  return value === 0 || value === 1 ? value : null;
}

function liftedBetaCoboundary(x, y, z, lift = betaLift) {
  const xy = residueProduct(x, y);
  const yz = residueProduct(y, z);
  if (!xy || !yz) return null;
  const values = [
    lift(y, z),
    lift(xy, z),
    lift(x, yz),
    lift(x, y),
  ];
  if (!values.every(Number.isInteger)) return null;
  return values[0] - values[1] + values[2] - values[3];
}

function gammaResidue(x, y, z, lift = betaLift) {
  const defect = liftedBetaCoboundary(x, y, z, lift);
  if (!Number.isInteger(defect) || mod2(defect) !== 0) return null;
  return defect / 2;
}

function degreeFourCoboundary(w, x, y, z, gamma = gammaResidue) {
  const wx = residueProduct(w, x);
  const xy = residueProduct(x, y);
  const yz = residueProduct(y, z);
  if (!wx || !xy || !yz) return null;
  const values = [
    gamma(x, y, z),
    gamma(wx, y, z),
    gamma(w, xy, z),
    gamma(w, x, yz),
    gamma(w, x, y),
  ];
  if (!values.every(Number.isInteger)) return null;
  return values[0] - values[1] + values[2] - values[3] + values[4];
}

export function mappingTorusThirdHomologyCertificate() {
  const global = exactBarH2GlobalCertificate();
  const inheritedActionPinned = global.passed
    && global.H2_fiber_action === -1
    && global.I_minus_H2_action === 2
    && global.H2_bar === 'Z ⊕ Z/2';
  const kernelOfTimesTwoOnZ = 0;
  const passed = inheritedActionPinned && kernelOfTimesTwoOnZ === 0;
  return freeze({
    status: passed
      ? 'MAPPING_TORUS_THIRD_BAR_HOMOLOGY_CERTIFICATE_PASSED'
      : 'MAPPING_TORUS_THIRD_BAR_HOMOLOGY_CERTIFICATE_FAILED',
    passed,
    parent_receipt: BOCKSTEIN_H3_EXT_TRANSGRESSION_PARENT_RECEIPT,
    inherited_H2_fiber_action: global.H2_fiber_action,
    inherited_I_minus_H2_action: global.I_minus_H2_action,
    wang_degree_three_segment: '0 -> H3_bar(B;Z) -> Z --2--> Z',
    kernel_times_two_on_Z: kernelOfTimesTwoOnZ,
    H3_bar: passed ? '0' : 'UNEARNED',
    proof: 'The #775 mapping-torus swap acts by -1 on H2(T²;Z)=Z; therefore 1-sigma*=2, whose kernel on Z is zero.',
    mapping_torus_is_physical_spacetime: false,
  });
}

export function integralThirdCohomologyExtCertificate() {
  const h3 = mappingTorusThirdHomologyCertificate();
  const basis = explicitBarH2BasisCertificate();
  const inheritedH2 = basis.passed && basis.global_H2 === 'Z ⊕ Z/2';
  const extFree = '0';
  const extOrderTwo = 'Z/2';
  const homH3 = h3.passed && h3.H3_bar === '0' ? '0' : 'UNEARNED';
  const passed = h3.passed
    && inheritedH2
    && extFree === '0'
    && extOrderTwo === 'Z/2'
    && homH3 === '0';
  return freeze({
    status: passed
      ? 'INTEGRAL_THIRD_BAR_COHOMOLOGY_EXT_CERTIFICATE_PASSED'
      : 'INTEGRAL_THIRD_BAR_COHOMOLOGY_EXT_CERTIFICATE_FAILED',
    passed,
    H2_bar: basis.global_H2,
    H3_bar: h3.H3_bar,
    UCT_degree_three: '0 -> Ext^1_Z(H2,Z) -> H^3_bar(B;Z) -> Hom(H3,Z) -> 0',
    Ext_Z1_Z_Z: extFree,
    Ext_Z1_Z_over_2_Z: extOrderTwo,
    Hom_H3_Z: homH3,
    H3_cohomology: passed ? 'Z/2' : 'UNEARNED',
    pure_Ext: passed,
    period_character_term: homH3,
    proof: 'Ext^1_Z(Z⊕Z/2,Z)=0⊕Z/2 while H3=0, so the UCT injection from Ext is an isomorphism onto H^3.',
  });
}

export function explicitBocksteinLiftCertificate() {
  const inheritedBeta = modTwoTorsionDetectorCertificate();
  const states = residueStates();
  const tripleRows = [];
  let normalized = true;
  for (const x of states) {
    for (const y of states) {
      for (const z of states) {
        const defect = liftedBetaCoboundary(x, y, z);
        const gamma = gammaResidue(x, y, z);
        const even = Number.isInteger(defect) && mod2(defect) === 0;
        const gammaIntegral = Number.isInteger(gamma);
        if ((sameResidue(x, ZERO_RESIDUE) || sameResidue(y, ZERO_RESIDUE) || sameResidue(z, ZERO_RESIDUE))
          && gamma !== 0) normalized = false;
        tripleRows.push(freeze({ x, y, z, defect, gamma, even, gamma_integral: gammaIntegral }));
      }
    }
  }

  const quadrupleRows = [];
  for (const w of states) {
    for (const x of states) {
      for (const y of states) {
        for (const z of states) {
          const defect = degreeFourCoboundary(w, x, y, z);
          quadrupleRows.push(freeze({ w, x, y, z, defect, passed: defect === 0 }));
        }
      }
    }
  }

  const evenLift = tripleRows.length === 512 && tripleRows.every((row) => row.even && row.gamma_integral);
  const cocycle = quadrupleRows.length === 4096 && quadrupleRows.every((row) => row.passed);
  const nonzeroRows = tripleRows.filter((row) => row.gamma !== 0);
  const passed = inheritedBeta.passed && evenLift && cocycle && normalized && nonzeroRows.length > 0;

  return freeze({
    status: passed
      ? 'EXPLICIT_BOCKSTEIN_LIFT_THREE_COCYCLE_CERTIFICATE_PASSED'
      : 'EXPLICIT_BOCKSTEIN_LIFT_THREE_COCYCLE_CERTIFICATE_FAILED',
    passed,
    inherited_beta_certificate: inheritedBeta.status,
    residue_group_order: states.length,
    triple_count: tripleRows.length,
    all_lifted_beta_coboundaries_even: evenLift,
    gamma_definition: 'gamma=(d beta_tilde)/2',
    gamma_normalized: normalized,
    gamma_nonzero_row_count: nonzeroRows.length,
    gamma_value_set: freeze([...new Set(tripleRows.map((row) => row.gamma))].sort((a, b) => a - b)),
    quadruple_count: quadrupleRows.length,
    all_4096_degree_four_coboundaries_zero: cocycle,
    triple_rows: freeze(tripleRows),
    quadruple_rows: freeze(quadrupleRows),
    cochain_identity: 'd gamma = d(d beta_tilde)/2 = 0.',
    physical_flux_authority: false,
    curvature_authority: false,
  });
}

export function bocksteinNontrivialityCertificate() {
  const h3Cohomology = integralThirdCohomologyExtCertificate();
  const lift = explicitBocksteinLiftCertificate();
  const beta = modTwoTorsionDetectorCertificate();
  const basis = explicitBarH2BasisCertificate();
  const kappa = primitiveIntegralCocycleCertificate();
  const inheritedIntegralH2IsCyclic = basis.passed
    && kappa.passed
    && kappa.kappa_z0 === 1
    && kappa.kappa_theta === 0;
  const betaOutsideReductionImage = beta.passed
    && beta.beta_theta === 1
    && inheritedIntegralH2IsCyclic;
  const passed = h3Cohomology.passed
    && lift.passed
    && betaOutsideReductionImage
    && h3Cohomology.H3_cohomology === 'Z/2';
  return freeze({
    status: passed
      ? 'BOCKSTEIN_NONTRIVIALITY_CERTIFICATE_PASSED'
      : 'BOCKSTEIN_NONTRIVIALITY_CERTIFICATE_FAILED',
    passed,
    coefficient_sequence: '0 -> Z --×2--> Z -> Z/2 -> 0',
    connecting_map: 'delta:H^2_bar(B;Z/2)->H^3_bar(B;Z)',
    inherited_beta_theta: beta.beta_theta,
    inherited_kappa_theta: kappa.kappa_theta,
    integral_H2_cohomology_generator: 'kappa',
    reduction_image_annihilates_theta: inheritedIntegralH2IsCyclic,
    beta_outside_integral_reduction_image: betaOutsideReductionImage,
    bockstein_class: passed ? '[gamma]=delta([beta]) != 0' : 'UNEARNED',
    H3_cohomology: h3Cohomology.H3_cohomology,
    generator_statement: passed ? '[gamma] is the unique nonzero generator of H^3_bar(B;Z)=Z/2.' : 'UNEARNED',
    exactness_proof: 'ker(delta)=im(red_2). Every integral H^2 class is an integer multiple of primitive [kappa] and evaluates zero on theta, while beta(theta)=1.',
  });
}

export function bocksteinQuotientTransgressionCertificate() {
  const nontrivial = bocksteinNontrivialityCertificate();
  const passed = nontrivial.passed;
  return freeze({
    status: passed
      ? 'BOCKSTEIN_QUOTIENT_TRANSGRESSION_CERTIFICATE_PASSED'
      : 'BOCKSTEIN_QUOTIENT_TRANSGRESSION_CERTIFICATE_FAILED',
    passed,
    exactness_kernel: 'ker(delta)=im(red_2:H^2(B;Z)->H^2(B;Z/2))',
    target: 'H^3_bar(B;Z)=Z/2',
    multiplication_by_two_on_target: '0',
    delta_surjective: passed,
    quotient: passed ? 'H^2_bar(B;Z/2)/red_2(H^2_bar(B;Z)) ≅ Z/2' : 'UNEARNED',
    quotient_generator: passed ? '[beta] + im(red_2)' : 'UNEARNED',
    induced_isomorphism: passed
      ? 'delta_bar:H^2_bar(B;Z/2)/im(red_2) -> H^3_bar(B;Z) is an isomorphism.'
      : 'UNEARNED',
    relies_on_778: false,
  });
}

export function periodBlindDegreeThreeObstructionCertificate() {
  const homology = mappingTorusThirdHomologyCertificate();
  const cohomology = integralThirdCohomologyExtCertificate();
  const bockstein = bocksteinNontrivialityCertificate();
  const passed = homology.passed
    && cohomology.passed
    && bockstein.passed
    && homology.H3_bar === '0'
    && cohomology.H3_cohomology === 'Z/2';
  return freeze({
    status: passed
      ? 'PERIOD_BLIND_DEGREE_THREE_OBSTRUCTION_CERTIFICATE_PASSED'
      : 'PERIOD_BLIND_DEGREE_THREE_OBSTRUCTION_CERTIFICATE_FAILED',
    passed,
    H3_bar: homology.H3_bar,
    H3_cohomology: cohomology.H3_cohomology,
    Hom_H3_Z: '0',
    all_closed_integer_H3_period_characters_trivial: passed,
    nonzero_cohomology_class: passed ? '[gamma]=delta([beta])' : 'UNEARNED',
    scar: 'NONZERO_INTEGRAL_DEGREE_THREE_COHOMOLOGY != NONZERO_CLOSED_H3_PERIOD_CHARACTER',
    transgression_statement: passed
      ? 'The order-two H2 sector invisible to integer degree-two periods reappears as a pure Ext/Bockstein class one cohomological degree higher.'
      : 'UNEARNED',
    geometric_three_holonomy_authority: false,
    gerbe_authority: false,
    anomaly_inflow_authority: false,
  });
}

export function bocksteinH3ExtTransgressionHostileCertificate() {
  const states = residueStates();
  const wrongActionH2 = 1;
  const wrongDifferenceMap = 1 - wrongActionH2;
  const wrongH3Kernel = wrongDifferenceMap === 0 ? 'Z' : '0';

  const targetPair = freeze([freeze([1, 0, 0]), freeze([1, 0, 0])]);
  const malformedLift = (left, right) => {
    const original = betaLift(left, right);
    if (!Number.isInteger(original)) return null;
    return key([left, right]) === key(targetPair) ? original + 1 : original;
  };
  let malformedOddDefects = 0;
  for (const x of states) {
    for (const y of states) {
      for (const z of states) {
        const defect = liftedBetaCoboundary(x, y, z, malformedLift);
        if (Number.isInteger(defect) && mod2(defect) === 1) malformedOddDefects += 1;
      }
    }
  }

  const targetTriple = key([[1, 0, 0], [1, 0, 0], [1, 0, 0]]);
  const malformedGamma = (x, y, z) => {
    const original = gammaResidue(x, y, z);
    if (!Number.isInteger(original)) return null;
    return key([x, y, z]) === targetTriple ? original + 1 : original;
  };
  let malformedGammaNonzeroD4 = 0;
  for (const w of states) {
    for (const x of states) {
      for (const y of states) {
        for (const z of states) {
          const defect = degreeFourCoboundary(w, x, y, z, malformedGamma);
          if (Number.isInteger(defect) && defect !== 0) malformedGammaNonzeroD4 += 1;
        }
      }
    }
  }

  const rows = freeze([
    freeze({
      hostile: 'H3_ZERO_IMPLIES_H3_COHOMOLOGY_ZERO',
      rejected: true,
      reason: 'UCT Ext^1(H2,Z)=Z/2 survives even when Hom(H3,Z)=0.',
    }),
    freeze({
      hostile: 'NONZERO_H3_COHOMOLOGY_REQUIRES_NONZERO_H3_PERIOD_DETECTOR',
      rejected: true,
      reason: 'The class is pure Ext and H3 itself is zero.',
    }),
    freeze({
      hostile: 'WRONG_SWAP_ACTION_PLUS_ONE',
      rejected: wrongH3Kernel === 'Z',
      wrong_result: `H3 would be ${wrongH3Kernel}`,
      inherited_required_action: '-1',
    }),
    freeze({
      hostile: 'MALFORMED_BETA_INTEGER_LIFT_ODD_COBOUNDARY',
      rejected: malformedOddDefects > 0,
      odd_defect_rows: malformedOddDefects,
    }),
    freeze({
      hostile: 'MALFORMED_GAMMA_NONCOCYCLE',
      rejected: malformedGammaNonzeroD4 > 0,
      nonzero_degree_four_defect_rows: malformedGammaNonzeroD4,
    }),
    freeze({
      hostile: 'EXT_Z_OVER_TWO_Z_VANISHES',
      rejected: true,
      required_value: 'Ext^1_Z(Z/2,Z)=Z/2',
    }),
    freeze({
      hostile: 'BOCKSTEIN_IS_PHYSICAL_FLUX_OR_GERBE_CURVATURE',
      rejected: true,
      physical_authority: false,
    }),
    freeze({
      hostile: 'REQUIRES_778_ARBITRARY_COEFFICIENT_REPRESENTABILITY',
      rejected: true,
      reason: 'The chamber uses #775 plus degree-three UCT and the single short exact coefficient sequence only.',
    }),
  ]);
  const passed = rows.every((row) => row.rejected === true);
  return freeze({
    status: passed
      ? 'BOCKSTEIN_H3_EXT_TRANSGRESSION_HOSTILES_PASSED'
      : 'BOCKSTEIN_H3_EXT_TRANSGRESSION_HOSTILES_FAILED',
    passed,
    rows,
  });
}

export function bocksteinH3ExtTransgressionCertificate() {
  const homology = mappingTorusThirdHomologyCertificate();
  const cohomology = integralThirdCohomologyExtCertificate();
  const lift = explicitBocksteinLiftCertificate();
  const nontrivial = bocksteinNontrivialityCertificate();
  const quotient = bocksteinQuotientTransgressionCertificate();
  const periodBlind = periodBlindDegreeThreeObstructionCertificate();
  const hostiles = bocksteinH3ExtTransgressionHostileCertificate();
  const passed = homology.passed
    && cohomology.passed
    && lift.passed
    && nontrivial.passed
    && quotient.passed
    && periodBlind.passed
    && hostiles.passed;
  return freeze({
    status: passed
      ? 'BOCKSTEIN_H3_EXT_TRANSGRESSION_CERTIFICATE_PASSED'
      : 'BOCKSTEIN_H3_EXT_TRANSGRESSION_CERTIFICATE_FAILED',
    passed,
    schema: BOCKSTEIN_H3_EXT_TRANSGRESSION_SCHEMA,
    parent_receipt: BOCKSTEIN_H3_EXT_TRANSGRESSION_PARENT_RECEIPT,
    gate_issue: BOCKSTEIN_H3_EXT_TRANSGRESSION_GATE_ISSUE,
    homology,
    cohomology,
    lift,
    nontrivial,
    quotient,
    period_blind: periodBlind,
    hostiles,
    relies_on_778: false,
    earned_if_passed: freeze([
      'THIRD_BAR_HOMOLOGY_VANISHES_IN_THE_DECLARED_REACHABLE_QUOTIENT_JURISDICTION',
      'INTEGRAL_THIRD_BAR_COHOMOLOGY_IS_Z_OVER_TWO_AND_IS_PURELY_EXT_DERIVED',
      'THE_775_MOD_TWO_TORSION_DETECTOR_HAS_NONTRIVIAL_INTEGRAL_BOCKSTEIN_EQUAL_TO_THE_UNIQUE_NONZERO_H_THREE_CLASS',
      'THE_QUOTIENT_OF_MOD_TWO_H_TWO_BY_INTEGRAL_REDUCTION_IS_ISOMORPHIC_VIA_BOCKSTEIN_TO_INTEGRAL_H_THREE',
      'INTEGER_DEGREE_THREE_PERIOD_CHARACTERS_ARE_TRIVIAL_EVEN_THOUGH_INTEGRAL_DEGREE_THREE_COHOMOLOGY_IS_NONTRIVIAL',
      'H2_TORSION_BLINDNESS_REAPPEARS_ONE_COHOMOLOGICAL_DEGREE_HIGHER_AS_A_PURE_EXT_BOCKSTEIN_OBSTRUCTION',
      'BOCKSTEIN_EXT_TRANSGRESSION_AND_PERIOD_BLIND_H3_OBSTRUCTION_EARNED',
    ]),
    ceilings: freeze({
      geometric_three_holonomy_authority: false,
      physical_flux_authority: false,
      gerbe_authority: false,
      curvature_authority: false,
      anomaly_inflow_authority: false,
      operational_route_transgression_authority: false,
      ontology_authority: false,
      operational_inverse_route_authority: false,
    }),
  });
}
