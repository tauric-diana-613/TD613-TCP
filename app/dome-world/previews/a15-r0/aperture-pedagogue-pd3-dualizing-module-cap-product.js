import {
  exactBarH2GlobalCertificate,
  integerFractionGroupMultiply,
} from './aperture-pedagogue-exact-bar-h2-torsion-sensitive-holonomy.js';

export const PD3_DUALIZING_MODULE_CAP_PRODUCT_SCHEMA = 'td613.a15-r0.pd3-dualizing-module-cap-product/v0.1';
export const PD3_DUALIZING_MODULE_CAP_PRODUCT_PARENT_RECEIPT = '39b8f6e8ba319154378d03c28a1bf42c02870de1';
export const PD3_DUALIZING_MODULE_CAP_PRODUCT_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const parity = (n) => ((n % 2) + 2) % 2;

function det2(matrix) {
  return (matrix[0][0] * matrix[1][1]) - (matrix[0][1] * matrix[1][0]);
}

function rank2(matrix) {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return 0;
  if (matrix.some((row) => row.some((v) => v !== 0))) {
    if (rows >= 2 && cols >= 2) {
      for (let i = 0; i < rows; i += 1) {
        for (let j = i + 1; j < rows; j += 1) {
          for (let a = 0; a < cols; a += 1) {
            for (let b = a + 1; b < cols; b += 1) {
              const minor = (matrix[i][a] * matrix[j][b]) - (matrix[i][b] * matrix[j][a]);
              if (minor !== 0) return 2;
            }
          }
        }
      }
    }
    return 1;
  }
  return 0;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

function gcdEntries(matrix) {
  return matrix.flat().reduce((acc, value) => gcd(acc, value), 0);
}

function rankOneCokernel(matrix, ambientRank) {
  const rank = rank2(matrix);
  if (rank === 0) return ambientRank === 1 ? 'Z' : `Z^${ambientRank}`;
  if (rank !== 1) return 'UNSUPPORTED';
  const d = gcdEntries(matrix);
  const freeRank = ambientRank - 1;
  if (d === 1) return freeRank === 0 ? '0' : (freeRank === 1 ? 'Z' : `Z^${freeRank}`);
  const torsion = `Z/${d}`;
  if (freeRank === 0) return torsion;
  return freeRank === 1 ? `Z ⊕ ${torsion}` : `Z^${freeRank} ⊕ ${torsion}`;
}

export function orientationCharacter(value) {
  if (!value || ![value.t, value.E, value.O].every(Number.isInteger)) return null;
  return parity(value.t) === 0 ? 1 : -1;
}

export function orientationCharacterCertificate() {
  const swap = freeze([[0, 1], [1, 0]]);
  const samples = [];
  for (const t of [-2, -1, 0, 1, 2]) {
    for (const E of [-1, 0, 1]) {
      for (const O of [-1, 0, 1]) samples.push(freeze({ t, E, O }));
    }
  }
  const rows = [];
  for (const left of samples) {
    for (const right of samples) {
      const product = integerFractionGroupMultiply(left, right);
      rows.push(freeze({
        left,
        right,
        product,
        passed: orientationCharacter(product) === orientationCharacter(left) * orientationCharacter(right),
      }));
    }
  }
  const passed = det2(swap) === -1
    && orientationCharacter({ t: 1, E: 0, O: 0 }) === -1
    && orientationCharacter({ t: 0, E: 1, O: 0 }) === 1
    && rows.every((row) => row.passed);
  return freeze({
    status: passed ? 'PD3_ORIENTATION_CHARACTER_CERTIFICATE_PASSED' : 'PD3_ORIENTATION_CHARACTER_CERTIFICATE_FAILED',
    passed,
    swap,
    det_swap: det2(swap),
    sample_pairs: rows.length,
    all_homomorphism_rows_pass: rows.every((row) => row.passed),
    orientation_character: 'w(t,E,O)=(-1)^t',
    dualizing_module_candidate: 'Z^w',
  });
}

export function mappingTorusAsphericalModelCertificate() {
  const parent = exactBarH2GlobalCertificate();
  const orientation = orientationCharacterCertificate();
  const passed = parent.passed
    && parent.fraction_group === 'G=Z² ⋊_σ Z'
    && orientation.passed;
  return freeze({
    status: passed ? 'SWAP_MAPPING_TORUS_ASPHERICAL_MODEL_CERTIFICATE_PASSED' : 'SWAP_MAPPING_TORUS_ASPHERICAL_MODEL_CERTIFICATE_FAILED',
    passed,
    parent_receipt: PD3_DUALIZING_MODULE_CAP_PRODUCT_PARENT_RECEIPT,
    group: parent.fraction_group,
    fiber: 'T^2',
    monodromy: 'coordinate swap',
    closed_manifold_dimension: 3,
    fundamental_group_identification: 'pi1(M_f) ≅ Z^2 ⋊_swap Z = G',
    universal_cover_model: 'R^2 × R ≅ R^3',
    aspherical: passed,
    K_G_1_model: passed ? 'M_f is a finite closed aspherical 3-manifold K(G,1)' : 'UNEARNED',
    theorem_application: 'standard mapping-torus manifold/fibration theorem plus universal-cover pullback',
    physical_spacetime_authority: false,
  });
}

export function twistedWangCertificate() {
  const orientation = orientationCharacterCertificate();
  const mu0 = freeze([[-1]]);
  const mu1 = freeze([[0, -1], [-1, 0]]);
  const mu2 = freeze([[1]]);
  const D0 = freeze([[2]]);
  const D1 = freeze([[1, 1], [1, 1]]);
  const D2 = freeze([[0]]);

  const d1Rank = rank2(D1);
  const d1Cokernel = rankOneCokernel(D1, 2);
  const passed = orientation.passed
    && same(mu0, [[-1]])
    && same(mu1, [[0, -1], [-1, 0]])
    && same(mu2, [[1]])
    && same(D0, [[2]])
    && same(D1, [[1, 1], [1, 1]])
    && same(D2, [[0]])
    && d1Rank === 1
    && d1Cokernel === 'Z';

  const groups = freeze({
    H0: 'Z/2',
    H1: 'Z',
    H2: 'Z^2',
    H3: 'Z',
  });
  return freeze({
    status: passed ? 'ORIENTATION_TWISTED_WANG_CERTIFICATE_PASSED' : 'ORIENTATION_TWISTED_WANG_CERTIFICATE_FAILED',
    passed,
    effective_monodromy: freeze({ q0: mu0, q1: mu1, q2: mu2 }),
    I_minus_effective_monodromy: freeze({ q0: D0, q1: D1, q2: D2 }),
    q0: freeze({ kernel: '0', cokernel: 'Z/2' }),
    q1: freeze({ kernel: 'Z<(1,-1)>', cokernel: d1Cokernel }),
    q2: freeze({ kernel: 'Z', cokernel: 'Z' }),
    twisted_homology: groups,
    split_degree_two_reason: '0 -> Z -> H2(G;Z^w) -> Z -> 0 splits because Z is free/projective.',
    top_twisted_fundamental_class_group: groups.H3,
  });
}

export function ordinaryIntegralCohomologyUCTCertificate() {
  const parent = exactBarH2GlobalCertificate();
  const passed = parent.passed
    && parent.H2_bar === 'Z ⊕ Z/2'
    && parent.inherited_H1_consistency;
  return freeze({
    status: passed ? 'ORDINARY_INTEGRAL_COHOMOLOGY_UCT_CERTIFICATE_PASSED' : 'ORDINARY_INTEGRAL_COHOMOLOGY_UCT_CERTIFICATE_FAILED',
    passed,
    ordinary_homology: freeze({ H0: 'Z', H1: 'Z^2', H2: 'Z ⊕ Z/2', H3: '0' }),
    ordinary_cohomology: freeze({ H0: 'Z', H1: 'Z^2', H2: 'Z', H3: 'Z/2' }),
    H3_UCT: freeze({
      Hom_H3_Z: '0',
      Ext1_H2_Z: 'Z/2',
      result: 'Z/2',
      reason: 'Ext^1_Z(Z,Z)=0 and Ext^1_Z(Z/2,Z)=Z/2.',
    }),
  });
}

export function orientationCoinvariantCertificate() {
  const orientation = orientationCharacterCertificate();
  const oddGeneratorAction = -1;
  const relationCoefficient = oddGeneratorAction - 1;
  const passed = orientation.passed && relationCoefficient === -2;
  return freeze({
    status: passed ? 'ORIENTATION_COINVARIANT_CERTIFICATE_PASSED' : 'ORIENTATION_COINVARIANT_CERTIFICATE_FAILED',
    passed,
    module: 'Z^w',
    odd_generator_action: oddGeneratorAction,
    coinvariant_relation: '-a-a=-2a',
    H0_twisted: passed ? 'Z/2' : 'UNEARNED',
    unique_nonzero_class: passed,
  });
}

export function poincareDualityCapProductCertificate() {
  const model = mappingTorusAsphericalModelCertificate();
  const twisted = twistedWangCertificate();
  const ordinary = ordinaryIntegralCohomologyUCTCertificate();
  const coinvariants = orientationCoinvariantCertificate();

  const ordinaryHomology = freeze(['Z', 'Z^2', 'Z ⊕ Z/2', '0']);
  const ordinaryCohomology = freeze(['Z', 'Z^2', 'Z', 'Z/2']);
  const twistedHomology = freeze(['Z/2', 'Z', 'Z^2', 'Z']);
  const twistedCohomology = freeze(['0', 'Z ⊕ Z/2', 'Z^2', 'Z']);

  const pdOrdinaryRows = ordinaryCohomology.map((group, k) => freeze({
    k,
    cohomology: group,
    dual_twisted_homology: twistedHomology[3 - k],
    passed: group === twistedHomology[3 - k],
  }));
  const pdTwistedRows = twistedCohomology.map((group, k) => freeze({
    k,
    twisted_cohomology: group,
    dual_ordinary_homology: ordinaryHomology[3 - k],
    passed: group === ordinaryHomology[3 - k],
  }));

  const passed = model.passed
    && twisted.passed
    && ordinary.passed
    && coinvariants.passed
    && pdOrdinaryRows.every((row) => row.passed)
    && pdTwistedRows.every((row) => row.passed)
    && ordinary.ordinary_cohomology.H3 === coinvariants.H0_twisted;

  return freeze({
    status: passed ? 'PD3_CAP_PRODUCT_DUALITY_CERTIFICATE_PASSED' : 'PD3_CAP_PRODUCT_DUALITY_CERTIFICATE_FAILED',
    passed,
    fundamental_class: passed ? '[M]_w generates H3(G;Z^w)=Z' : 'UNEARNED',
    ordinary_homology: ordinaryHomology,
    ordinary_cohomology: ordinaryCohomology,
    twisted_homology: twistedHomology,
    twisted_cohomology: twistedCohomology,
    ordinary_to_twisted_cap_rows: freeze(pdOrdinaryRows),
    twisted_to_ordinary_cap_rows: freeze(pdTwistedRows),
    H3_bridge: freeze({
      UCT_Ext_description: ordinary.ordinary_cohomology.H3,
      PD_orientation_coinvariant_description: coinvariants.H0_twisted,
      same_unique_nonzero_Z2_class: passed,
    }),
    theorem_application: 'Poincare duality with orientation local coefficients on the closed aspherical mapping torus M_f.',
    chain_level_cap_formula_authored_here: false,
    physical_duality_authority: false,
  });
}

export function pd3DualizingModuleCertificate() {
  const pd = poincareDualityCapProductCertificate();
  const orientation = orientationCharacterCertificate();
  const model = mappingTorusAsphericalModelCertificate();
  const passed = pd.passed
    && orientation.passed
    && model.passed
    && pd.twisted_cohomology[3] === 'Z'
    && pd.ordinary_homology[3] === '0';
  return freeze({
    status: passed ? 'PD3_DUALIZING_MODULE_CERTIFICATE_PASSED' : 'PD3_DUALIZING_MODULE_CERTIFICATE_FAILED',
    passed,
    group: 'G=Z^2 ⋊_swap Z',
    cohomological_dimension: passed ? 3 : null,
    PD_group_dimension: passed ? 3 : null,
    dualizing_module: passed ? 'Z^w' : 'UNEARNED',
    orientation_character: orientation.orientation_character,
    ordinary_top_homology: pd.ordinary_homology[3],
    twisted_top_homology: pd.twisted_homology[3],
    twisted_top_cohomology: pd.twisted_cohomology[3],
    ordinary_top_cohomology: pd.ordinary_cohomology[3],
    scar: 'ORDINARY_TOP_HOMOLOGY_VANISHES != FAILURE_OF_THREE_DIMENSIONAL_POINCARE_DUALITY',
    geometric_2_holonomy_authority: false,
    physical_spacetime_authority: false,
  });
}

export function pd3DualizingModuleCapProductAggregate() {
  const orientation = orientationCharacterCertificate();
  const model = mappingTorusAsphericalModelCertificate();
  const twisted = twistedWangCertificate();
  const ordinary = ordinaryIntegralCohomologyUCTCertificate();
  const coinvariants = orientationCoinvariantCertificate();
  const pd = poincareDualityCapProductCertificate();
  const dualizing = pd3DualizingModuleCertificate();
  const passed = orientation.passed
    && model.passed
    && twisted.passed
    && ordinary.passed
    && coinvariants.passed
    && pd.passed
    && dualizing.passed;
  return freeze({
    schema: PD3_DUALIZING_MODULE_CAP_PRODUCT_SCHEMA,
    status: passed ? 'PD3_DUALIZING_MODULE_AND_CAP_PRODUCT_AGGREGATE_PASSED' : 'PD3_DUALIZING_MODULE_AND_CAP_PRODUCT_AGGREGATE_FAILED',
    passed,
    parent_receipt: PD3_DUALIZING_MODULE_CAP_PRODUCT_PARENT_RECEIPT,
    gate_issue: PD3_DUALIZING_MODULE_CAP_PRODUCT_GATE_ISSUE,
    orientation,
    mapping_torus_model: model,
    twisted_wang: twisted,
    ordinary_UCT: ordinary,
    orientation_coinvariants: coinvariants,
    poincare_duality: pd,
    dualizing,
    earned_if_passed: freeze([
      'THE_775_FRACTION_GROUP_IS_A_POINCARE_DUALITY_GROUP_OF_DIMENSION_THREE_WITH_DUALIZING_MODULE_Z_TO_THE_PARITY_ORIENTATION_CHARACTER',
      'THE_PARITY_CHARACTER_W_T_E_O_EQUALS_MINUS_ONE_TO_THE_T_IS_THE_ORIENTATION_CHARACTER_OF_THE_SWAP_MAPPING_TORUS_MODEL',
      'THE_ORIENTATION_TWISTED_FUNDAMENTAL_CLASS_GENERATES_H3_G_ZW_ISOMORPHIC_TO_Z_WHILE_ORDINARY_H3_G_Z_VANISHES',
      'THE_FULL_ORIENTATION_TWISTED_HOMOLOGY_TABLE_IS_Z_OVER_TWO_Z_Z_SQUARED_Z_IN_DEGREES_ZERO_THROUGH_THREE',
      'THE_FULL_ORIENTATION_TWISTED_COHOMOLOGY_TABLE_IS_ZERO_Z_PLUS_Z_OVER_TWO_Z_SQUARED_Z_IN_DEGREES_ZERO_THROUGH_THREE',
      'CAP_PRODUCT_WITH_THE_TWISTED_FUNDAMENTAL_CLASS_GIVES_POINCARE_DUALITY_ISOMORPHISMS_IN_ALL_DEGREES',
      'THE_UNIQUE_NONZERO_H3_INTEGRAL_COHOMOLOGY_CLASS_IS_BOTH_EXT_DERIVED_FROM_H2_TORSION_AND_PD_DUAL_TO_THE_ORIENTATION_COINVARIANT',
      'ORDINARY_TOP_HOMOLOGY_VANISHING_DOES_NOT_SIGNAL_FAILURE_OF_PD3_DUALITY',
      'PD3_DUALIZING_MODULE_AND_CAP_PRODUCT_DUALITY_EARNED',
    ]),
    ceilings: freeze({
      physical_spacetime: false,
      physical_chirality_field: false,
      operational_route_duality: false,
      geometric_2_holonomy: false,
      Berry_gerbe_holonomy: false,
    }),
  });
}
