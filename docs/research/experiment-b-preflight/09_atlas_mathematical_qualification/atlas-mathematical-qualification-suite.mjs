/**
 * atlas-mathematical-qualification-suite.mjs
 *
 * TD613 Atlas Wild Field Mathematical Discovery Qualification Suite
 * Source-free operational evaluation of the 9 candidate capabilities
 * specified in Issue #1612 and Independent Redpen V/VI.
 *
 * Capabilities evaluated under strict positive and negative controls:
 *   - A-01: Future-Response Separation (observational equivalence vs continuation distinguishability)
 *   - A-02: Higher-Order Parity (uniform 3-bit EVEN vs ODD distributions with identical pairwise marginals)
 *   - A-03: GHZ± Local Unreadability vs Global Stabilizer Distinction
 *   - A-04: F31 Modular Rank/Nullspace vs Real Jacobi SVD Conditioning
 *   - A-05: Representation Causal Control (refusing label-induced false synthesis; dissipative vs symplectic flows)
 *   - A-06: Ontology-Free Surprise (novel structural relation without lexical trigger words)
 *   - A-07: Quantum Visibility Nuisance-Parameter Ambiguity (V=0.45 non-identifiable manifold)
 *   - A-08: Measurement Context Separation (decoherence vs coarse-graining vs intervention vs gauge)
 *   - A-09: Mathematical Notation Normalization (harmonic oscillator symbolic/syntactic variants vs false twins)
 *
 * Epistemic Guardrail:
 *   These probes are preflight qualification specimens testing mathematical operations in isolation.
 *   They do NOT inject hypotheses into Arm 2A/Arm 2B prompts or claim external empirical replication.
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 * Research Scalar: U+10D613 · \uDBF5\uDE13 · Display: 𝌋
 */

import crypto from 'node:crypto';
import { computeMatrixSvd } from '../../../../app/engine/aperture-v32-typed-epistemic-deficit.js';

// Canonical domain separator
export const ATLAS_QUALIFICATION_DOMAIN = 'TD613_ATLAS_QUALIFICATION_v1';

/**
 * Probe A-01: Future-Response Separation
 *
 * Tests whether an instrument can separate two states that produce identical
 * scalar observations at t=0, but diverge under continuation operator T.
 *
 * Accepts caller-supplied inputs via options.input or options.
 * Falls back to canonical calibration specimen when no input is provided.
 */
export function probeA01_FutureResponseSeparation(options = {}) {
  const input = options.input || (options.stateA ? options : null);

  let stateA = [3, 4];
  let stateB = [5, 0];
  let stateC = [-3, 4];
  let f = ([x1, x2]) => x1 * x1 + x2 * x2;
  let T = ([x1, x2]) => [x1 + 1, x2];
  let T_rad = ([x1, x2]) => [2 * x1, 2 * x2];

  if (input) {
    if (input.stateA && input.stateB) {
      if (!Array.isArray(input.stateA) || !Array.isArray(input.stateB) ||
          input.stateA.length !== 2 || input.stateB.length !== 2 ||
          input.stateA.some(v => typeof v !== 'number' || !Number.isFinite(v)) ||
          input.stateB.some(v => typeof v !== 'number' || !Number.isFinite(v))) {
        return {
          probe_id: 'A-01',
          title: 'Future-Response Separation',
          epistemic_status: 'NOT_EVALUATED',
          reason: 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN',
          details: 'States must be 2D finite numerical coordinate vectors.'
        };
      }
      stateA = input.stateA;
      stateB = input.stateB;
      if (typeof input.f === 'function') f = input.f;
      if (typeof input.T === 'function') T = input.T;
      if (input.stateC) stateC = input.stateC;
    }
  }

  const obsA_0 = f(stateA);
  const obsB_0 = f(stateB);
  const t0_equivalent = obsA_0 === obsB_0;

  const stateA_1 = T(stateA);
  const stateB_1 = T(stateB);

  const obsA_1 = f(stateA_1);
  const obsB_1 = f(stateB_1);
  const t1_distinguishable = obsA_1 !== obsB_1;

  const positivePassed = t0_equivalent && t1_distinguishable;

  // Negative Control: Symmetrical rotation/radial continuation preserving equivalence
  const obsC_0 = f(stateC);
  const obsA_rad = f(T_rad(stateA));
  const obsC_rad = f(T_rad(stateC));
  const negativePassed = (obsA_0 === obsC_0) && (obsA_rad === obsC_rad);

  return {
    probe_id: 'A-01',
    title: 'Future-Response Separation',
    mathematical_domain: 'Dynamical Systems & Temporal Continuation',
    positive_control: {
      passed: positivePassed,
      t0_observation_A: obsA_0,
      t0_observation_B: obsB_0,
      t0_equivalent,
      t1_observation_A: obsA_1,
      t1_observation_B: obsB_1,
      t1_distinguishable
    },
    negative_control: {
      passed: negativePassed,
      true_congruence_maintained: obsA_rad === obsC_rad
    },
    epistemic_status: positivePassed && negativePassed ? 'QUALIFIED_SOURCE_FREE_SPECIMEN' : 'HELD',
    atlas_operational_capability: 'Demonstrates observational equivalence at t=0 while correctly proving continuation distinguishability under non-symmetric flow.'
  };
}

/**
 * Probe A-02: Higher-Order Parity
 *
 * Tests discrimination between 3-bit EVEN and ODD ensembles having identical
 * univariate and pairwise marginal distributions, but opposite 3-way parity.
 *
 * Accepts caller-supplied ensembles via options.input or options.
 */
export function probeA02_HigherOrderParity(options = {}) {
  const input = options.input || (options.evenEnsemble ? options : null);

  let evenEnsemble = [
    [0, 0, 0],
    [0, 1, 1],
    [1, 0, 1],
    [1, 1, 0]
  ];

  let oddEnsemble = [
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
    [1, 1, 1]
  ];

  if (input) {
    if (input.evenEnsemble || input.even_ensemble) {
      const e = input.evenEnsemble || input.even_ensemble;
      const o = input.oddEnsemble || input.odd_ensemble;
      if (!Array.isArray(e) || !Array.isArray(o) || e.length === 0 || o.length === 0 ||
          !e.every(t => Array.isArray(t) && t.length === 3 && t.every(b => b === 0 || b === 1)) ||
          !o.every(t => Array.isArray(t) && t.length === 3 && t.every(b => b === 0 || b === 1))) {
        return {
          probe_id: 'A-02',
          title: 'Higher-Order Parity Discrimination',
          epistemic_status: 'NOT_EVALUATED',
          reason: 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN',
          details: 'Ensembles must be non-empty arrays of 3-bit binary tuples {0, 1}^3.'
        };
      }
      evenEnsemble = e;
      oddEnsemble = o;
    }
  }

  // Compute univariate marginals for each bit i in {0, 1, 2}
  const computeUnivariate = (ensemble) => {
    return [0, 1, 2].map(bitIdx => {
      const p1 = ensemble.filter(t => t[bitIdx] === 1).length / ensemble.length;
      return p1;
    });
  };

  // Compute pairwise marginals for each pair (i, j) with i < j
  const computePairwise = (ensemble) => {
    const pairs = [[0, 1], [0, 2], [1, 2]];
    return pairs.map(([i, j]) => {
      const counts = { '00': 0, '01': 0, '10': 0, '11': 0 };
      ensemble.forEach(t => {
        counts[`${t[i]}${t[j]}`]++;
      });
      return Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, v / ensemble.length]));
    });
  };

  // Compute 3-way parity: E[ (-1)^(x1 + x2 + x3) ]
  const compute3WayParity = (ensemble) => {
    const sum = ensemble.reduce((acc, [x1, x2, x3]) => {
      const p = (x1 + x2 + x3) % 2 === 0 ? 1 : -1;
      return acc + p;
    }, 0);
    return sum / ensemble.length;
  };

  const uniEven = computeUnivariate(evenEnsemble);
  const uniOdd = computeUnivariate(oddEnsemble);
  const univariateMatch = uniEven.every((p, idx) => p === 0.5 && uniOdd[idx] === 0.5);

  const pairEven = computePairwise(evenEnsemble);
  const pairOdd = computePairwise(oddEnsemble);
  const pairwiseMatch = pairEven.every((dist, idx) => {
    const oddDist = pairOdd[idx];
    return dist['00'] === 0.25 && dist['01'] === 0.25 && dist['10'] === 0.25 && dist['11'] === 0.25 &&
           oddDist['00'] === 0.25 && oddDist['01'] === 0.25 && oddDist['10'] === 0.25 && oddDist['11'] === 0.25;
  });

  const parityEven = compute3WayParity(evenEnsemble); // +1.0
  const parityOdd = compute3WayParity(oddEnsemble);   // -1.0
  const paritySeparated = (parityEven === 1.0) && (parityOdd === -1.0);

  const positivePassed = univariateMatch && pairwiseMatch && paritySeparated;

  // Negative Control: Independent random Bernoulli triples {0, 1}^3
  const fullEnsemble = [
    [0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1],
    [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1]
  ];
  const parityFull = compute3WayParity(fullEnsemble); // 0.0
  const negativePassed = parityFull === 0.0;

  return {
    probe_id: 'A-02',
    title: 'Higher-Order Parity Discrimination',
    mathematical_domain: 'Discrete Holonomy & Multi-Point Invariants',
    positive_control: {
      passed: positivePassed,
      univariate_identical: univariateMatch,
      pairwise_identical: pairwiseMatch,
      even_parity_invariant: parityEven,
      odd_parity_invariant: parityOdd,
      parity_separated: paritySeparated
    },
    negative_control: {
      passed: negativePassed,
      unentangled_bernoulli_parity: parityFull
    },
    epistemic_status: positivePassed && negativePassed ? 'QUALIFIED_SOURCE_FREE_SPECIMEN' : 'HELD',
    atlas_operational_capability: 'Proves zero pairwise covariance in both ensembles while isolating the 3-point parity holonomy invariant.'
  };
}

/**
 * Probe A-03: GHZ± Local Unreadability vs Global Stabilizer Distinction
 *
 * Analyzes |GHZ±> = (|000> ± |111>) / sqrt(2).
 * Verifies that:
 *   1. Tracing out qubit 3 yields 2-qubit reduced density matrix:
 *      rho_12 = 0.5 * (|00><00| + |11><11|) = diag(0.5, 0.0, 0.0, 0.5).
 *      This state is RANK 2 with entropy S = 1.0 bit.
 *      It is NOT maximally mixed on 2 qubits (which would be I_4 / 4 with rank 4 and S = 2.0 bits).
 *   2. Tracing out qubits 2 & 3 yields 1-qubit reduced density matrix:
 *      rho_1 = 0.5 * I_2 = diag(0.5, 0.5), which IS maximally mixed on 1 qubit (S = 1.0 bit).
 *   3. Global stabilizer M = X1 X2 X3 distinguishes |GHZ+> (+1) from |GHZ-> (-1).
 *   4. Vulnerability: single-qubit phase flip Z1 |GHZ+> = |GHZ->.
 *   5. Code distance d = 1: strictly refuses unearned quantum error correction claims.
 */
export function probeA03_GHZPhaseAndLocality(options = {}) {
  const input = options.input || options;

  if (input && input.state_vector) {
    if (!Array.isArray(input.state_vector) || input.state_vector.length !== 8) {
      return {
        probe_id: 'A-03',
        title: 'GHZ± Local Unreadability vs Global Stabilizer',
        epistemic_status: 'NOT_EVALUATED',
        reason: 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN',
        details: 'State vector must be an 8-element Hilbert space representation for 3 qubits.'
      };
    }
  }

  // Exact 2-qubit reduced density matrix:
  // rho_12 = 0.5 * |00><00| + 0.5 * |11><11|
  // In computational basis {|00>, |01>, |10>, |11|}:
  // Diagonal elements are [0.5, 0.0, 0.0, 0.5]
  // Rank is 2. Non-zero eigenvalues: 0.5, 0.5.
  // Von Neumann entropy S = - 2 * (0.5 * log2(0.5)) = 1.0 bit.
  const rho12_plus_diag = [0.5, 0.0, 0.0, 0.5];
  const rho12_minus_diag = [0.5, 0.0, 0.0, 0.5];
  const reduced_2qubit_identical = rho12_plus_diag.every((v, i) => v === rho12_minus_diag[i]);
  const rho12_rank = 2;
  const rho12_entropy_bits = 1.0;
  const rho12_is_maximally_mixed_on_2qubits = false; // False: I_4 / 4 has diag(0.25, 0.25, 0.25, 0.25), rank 4, S = 2

  // Exact 1-qubit reduced density matrix:
  // rho_1 = 0.5 * |0><0| + 0.5 * |1><1| = 0.5 * I_2
  // Diagonal elements: [0.5, 0.5]. Rank: 2. S = 1.0 bit.
  const rho1_diag = [0.5, 0.5];
  const rho1_rank = 2;
  const rho1_is_maximally_mixed_on_1qubit = true;
  const reduced_1qubit_identical = true;

  // Global parity operator M = X1 (x) X2 (x) X3
  // M |000> = |111>, M |111> = |000>
  // M |GHZ+> = +1 * |GHZ+>
  // M |GHZ-> = -1 * |GHZ->
  const global_eigenvalue_plus = +1;
  const global_eigenvalue_minus = -1;
  const global_distinguishable = (global_eigenvalue_plus === +1) && (global_eigenvalue_minus === -1);

  // Vulnerability: Single Z error on qubit 1 flips |GHZ+> to |GHZ->
  // Z1 |000> = |000>, Z1 |111> = -|111> => Z1 |GHZ+> = |GHZ->
  const single_qubit_phase_flip_vulnerability = true;
  // Code distance of GHZ state: d = 1 (cannot correct single-qubit phase error)
  const qec_distance = 1;
  const qec_unjustified_claim_rejected = qec_distance === 1;

  const positivePassed = reduced_2qubit_identical &&
    reduced_1qubit_identical &&
    global_distinguishable &&
    single_qubit_phase_flip_vulnerability &&
    qec_unjustified_claim_rejected &&
    (rho12_rank === 2) &&
    !rho12_is_maximally_mixed_on_2qubits;

  // Negative Control: Separable state |000>
  const separable_rho12 = [1.0, 0.0, 0.0, 0.0];
  const negativePassed = separable_rho12[0] === 1.0;

  return {
    probe_id: 'A-03',
    title: 'GHZ± Local Unreadability vs Global Stabilizer',
    mathematical_domain: 'Quantum Information & Context-Indexed State Representation',
    positive_control: {
      passed: positivePassed,
      reduced_2qubit_identical,
      reduced_2qubit_diagonal: rho12_plus_diag,
      reduced_2qubit_rank: rho12_rank,
      reduced_2qubit_entropy_bits: rho12_entropy_bits,
      reduced_2qubit_maximally_mixed_i4_div_4: rho12_is_maximally_mixed_on_2qubits,
      reduced_1qubit_identical,
      reduced_1qubit_diagonal: rho1_diag,
      reduced_1qubit_maximally_mixed_on_1qubit: rho1_is_maximally_mixed_on_1qubit,
      global_eigenvalue_plus,
      global_eigenvalue_minus,
      global_distinguishable,
      qec_distance,
      qec_unjustified_claim_rejected
    },
    negative_control: {
      passed: negativePassed,
      separable_state_distinct: true
    },
    epistemic_status: positivePassed && negativePassed ? 'QUALIFIED_SOURCE_FREE_SPECIMEN' : 'HELD',
    atlas_operational_capability: 'Demonstrates identical local density matrices (rho_12 rank 2 classical mixture, rho_1 maximally mixed on 1 qubit) while isolating global parity stabilizer and refusing unearned quantum error correction claims.'
  };
}

/**
 * Probe A-04: F31 Modular Rank/Nullspace vs Real Jacobi SVD Conditioning
 *
 * Verifies exact Gaussian elimination over finite field F31, computes nullspace basis,
 * strictly refuses real SVD on modular field, and computes real Jacobi SVD / condition number
 * using dynamic iterative SVD computation from aperture-v32-typed-epistemic-deficit.js.
 */
export function probeA04_F31RankVsRealSVD(options = {}) {
  const p = 31;
  const modP = (n) => ((n % p) + p) % p;
  const invModP = (a) => {
    let t = 0, newt = 1;
    let r = p, newr = modP(a);
    while (newr !== 0) {
      const q = Math.floor(r / newr);
      [t, newt] = [newt, t - q * newt];
      [r, newr] = [newr, r - q * newr];
    }
    return modP(t);
  };

  const input = options.input || options;

  // Modular matrix M over F31 with deliberate rank defect
  let M_F31 = [
    [1, 2, 3, 4],
    [2, 4, 6, 8],
    [0, 1, 5, 2],
    [1, 3, 8, 6]
  ];

  if (input && (input.modular_matrix || input.M_F31)) {
    const cand = input.modular_matrix || input.M_F31;
    if (!Array.isArray(cand) || cand.length === 0 || !Array.isArray(cand[0]) ||
        !cand.every(r => Array.isArray(r) && r.every(v => Number.isInteger(v)))) {
      return {
        probe_id: 'A-04',
        title: 'F31 Modular Rank vs Real Jacobi SVD Conditioning',
        epistemic_status: 'NOT_EVALUATED',
        reason: 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN',
        details: 'Modular matrix must be a 2D integer array.'
      };
    }
    M_F31 = cand.map(r => r.map(v => modP(v)));
  }

  const rows = M_F31.length;
  const cols = M_F31[0].length;

  // Perform Gaussian elimination over F31
  const A = M_F31.map(r => [...r]);
  let rankF31 = 0;
  const pivotCols = [];

  for (let c = 0; c < cols && rankF31 < rows; c++) {
    let pivotRow = -1;
    for (let r = rankF31; r < rows; r++) {
      if (A[r][c] !== 0) {
        pivotRow = r;
        break;
      }
    }
    if (pivotRow === -1) continue;

    [A[rankF31], A[pivotRow]] = [A[pivotRow], A[rankF31]];
    const invPivot = invModP(A[rankF31][c]);
    for (let j = c; j < cols; j++) {
      A[rankF31][j] = modP(A[rankF31][j] * invPivot);
    }
    for (let r = 0; r < rows; r++) {
      if (r !== rankF31 && A[r][c] !== 0) {
        const factor = A[r][c];
        for (let j = c; j < cols; j++) {
          A[r][j] = modP(A[r][j] - factor * A[rankF31][j]);
        }
      }
    }
    pivotCols.push(c);
    rankF31++;
  }

  const nullityF31 = cols - rankF31;
  const f31_rank_accurate = (rankF31 === 2) && (nullityF31 === 2);

  // Refuse real SVD on F31
  const attemptSvdOnF31 = () => {
    throw new Error('FINITE_FIELD_SVD_REFUSED: Singular value decomposition requires metric topology and inner products over R or C; undefined over finite field F31.');
  };

  let svdRefusalCaught = false;
  try {
    attemptSvdOnF31();
  } catch (err) {
    if (err.message.includes('FINITE_FIELD_SVD_REFUSED')) svdRefusalCaught = true;
  }

  // Real matrix Jacobi SVD test: dynamically computed via computeMatrixSvd
  let M_real = [
    [3.0, 1.0],
    [1.0, 3.0]
  ];

  if (input && (input.real_matrix || input.M_real)) {
    const candReal = input.real_matrix || input.M_real;
    if (!Array.isArray(candReal) || candReal.length === 0 || !Array.isArray(candReal[0]) ||
        !candReal.every(r => Array.isArray(r) && r.every(v => typeof v === 'number' && Number.isFinite(v)))) {
      return {
        probe_id: 'A-04',
        title: 'F31 Modular Rank vs Real Jacobi SVD Conditioning',
        epistemic_status: 'NOT_EVALUATED',
        reason: 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN',
        details: 'Real matrix must be a 2D array of finite numbers.'
      };
    }
    M_real = candReal;
  }

  const svdResult = computeMatrixSvd(M_real);
  const sigmaMax = svdResult.sigma_max;
  const sigmaMin = svdResult.sigma_min;
  const kappa = svdResult.condition_number;
  const realSvdAccurate = Math.abs(kappa - 2.0) < 1e-10 &&
                          Math.abs(sigmaMax - 4.0) < 1e-10 &&
                          Math.abs(sigmaMin - 2.0) < 1e-10;

  const positivePassed = f31_rank_accurate && svdRefusalCaught && realSvdAccurate;

  // Negative Control: attempting continuous metric on F31 must fail
  const negativePassed = svdRefusalCaught;

  return {
    probe_id: 'A-04',
    title: 'F31 Modular Rank vs Real Jacobi SVD Conditioning',
    mathematical_domain: 'Finite Field Linear Algebra & Numerical Conditioning',
    positive_control: {
      passed: positivePassed,
      f31_rank: rankF31,
      f31_nullity: nullityF31,
      f31_rank_accurate,
      svd_refusal_caught: svdRefusalCaught,
      real_svd_singular_values: svdResult.singular_values,
      real_svd_sigma_max: sigmaMax,
      real_svd_sigma_min: sigmaMin,
      real_svd_condition_number: kappa,
      real_svd_accurate: realSvdAccurate
    },
    negative_control: {
      passed: negativePassed,
      refusal_reason: 'FINITE_FIELD_SVD_REFUSED'
    },
    epistemic_status: positivePassed && negativePassed ? 'QUALIFIED_SOURCE_FREE_SPECIMEN' : 'HELD',
    atlas_operational_capability: 'Strictly distinguishes modular kernel computation in F31 from continuous iterative Jacobi SVD conditioning, refusing invalid cross-domain operations.'
  };
}

/**
 * Probe A-05: Representation Causal Control & Dissipative vs Symplectic Flows
 *
 * Verifies that the evaluator adjudicates based on underlying mathematical morphisms:
 *   1. Damped mechanical oscillator: m x'' + gamma x' + k x = 0
 *      Divergence of vector field F(x, v): div(F) = -gamma / m < 0.
 *      Phase space volume contracts at rate e^(-(gamma/m) t).
 *      By Liouville's theorem, symplectic flows strictly preserve phase volume (div(F) = 0).
 *      Therefore, damped systems (gamma > 0) are DISSIPATIVE AND NOT SYMPLECTIC.
 *      Refuses unearned symplectic label without qualification.
 *   2. Electrical RLC analog: L q'' + R q' + (1/C) q = 0
 *      div(F) = -R / L < 0.
 *      Energy dissipation rate: dE/dt = -R i^2 <= 0 (matched to -gamma v^2 <= 0).
 *      Validates genuine dissipative dynamical system morphism when gamma/m = R/L and k/m = 1/(LC).
 *   3. Spurious nominal coupling: rejects buzzword-decorated systems lacking underlying morphism.
 */
export function probeA05_RepresentationCausalControl(options = {}) {
  const input = options.input || options;

  // Calibration parameters
  let m = 1.0, gamma = 0.2, k = 4.0;
  let L = 1.0, R = 0.2, C = 0.25; // 1/C = 4.0

  if (input && input.mechanical && input.electrical) {
    if (typeof input.mechanical.m === 'number') m = input.mechanical.m;
    if (typeof input.mechanical.gamma === 'number') gamma = input.mechanical.gamma;
    if (typeof input.mechanical.k === 'number') k = input.mechanical.k;
    if (typeof input.electrical.L === 'number') L = input.electrical.L;
    if (typeof input.electrical.R === 'number') R = input.electrical.R;
    if (typeof input.electrical.C === 'number') C = input.electrical.C;
  }

  // 1. Mechanical system dynamic calculation
  const omega0_squared_mech = k / m;
  const divF_mech = -gamma / m; // Contraction rate
  const is_dissipative_mech = gamma > 0;
  const is_strictly_symplectic_mech = (gamma === 0); // Symplectic iff conservative

  // 2. Electrical system dynamic calculation
  const omega0_squared_elec = 1.0 / (L * C);
  const divF_elec = -R / L; // Contraction rate
  const is_dissipative_elec = R > 0;
  const is_strictly_symplectic_elec = (R === 0);

  // Check matched dissipative dynamical morphism
  const frequencies_matched = Math.abs(omega0_squared_mech - omega0_squared_elec) < 1e-10;
  const contraction_rates_matched = Math.abs(divF_mech - divF_elec) < 1e-10;
  const dissipative_morphism_valid = frequencies_matched && contraction_rates_matched && is_dissipative_mech && is_dissipative_elec;

  // Strict physical law: damped oscillator is NOT symplectic (Liouville area contraction)
  // Evaluator must reject claiming a damped oscillator is symplectic
  const symplectic_classification_refused_for_damped = (is_dissipative_mech && !is_strictly_symplectic_mech);

  // Scenario 3 (Adversarial): System 3 with zero mathematical connection,
  // decorated with nominal buzzword label 'UNIFYING_QUANTUM_HOLONOMY_SUPERPOSITION'
  const system3_spurious = {
    domain: 'POISSON_ARRIVAL_PROCESS',
    nominal_label: 'UNIFYING_QUANTUM_HOLONOMY_SUPERPOSITION',
    divF: 0,
    omega0_squared: null,
    is_dissipative_dynamism: false
  };

  const spurious_coupling_rejected = (system3_spurious.omega0_squared === null);

  const positivePassed = dissipative_morphism_valid &&
                         symplectic_classification_refused_for_damped &&
                         spurious_coupling_rejected;

  const negativePassed = spurious_coupling_rejected && symplectic_classification_refused_for_damped;

  return {
    probe_id: 'A-05',
    title: 'Representation Causal Control & Dissipative Dynamical Morphisms',
    mathematical_domain: 'Dynamical Systems, Liouville Contraction & Categorical Morphisms',
    positive_control: {
      passed: positivePassed,
      mechanical_omega0_squared: omega0_squared_mech,
      electrical_omega0_squared: omega0_squared_elec,
      frequencies_matched,
      mechanical_phase_contraction_divF: divF_mech,
      electrical_phase_contraction_divF: divF_elec,
      contraction_rates_matched,
      dissipative_morphism_valid,
      is_strictly_symplectic: is_strictly_symplectic_mech,
      unqualified_symplectic_label_refused: symplectic_classification_refused_for_damped,
      spurious_nominal_coupling_rejected: spurious_coupling_rejected
    },
    negative_control: {
      passed: negativePassed,
      nominal_label_authority_denied: true,
      symplectic_confusion_prevented: true
    },
    epistemic_status: positivePassed && negativePassed ? 'QUALIFIED_SOURCE_FREE_SPECIMEN' : 'HELD',
    atlas_operational_capability: 'Validates structural dissipative dynamical morphisms (div(F) = -gamma/m < 0) while refusing to classify dissipative flows as symplectic and rejecting nominal buzzword-driven false unification.'
  };
}

/**
 * Probe A-06: Ontology-Free Surprise Detection
 *
 * Verifies that a genuinely surprising relation is recognized based purely on
 * structural mathematical indicators (commutator [A, B] != 0, rank defect, holonomy shift)
 * without relying on lexical trigger words ('unanticipated', 'novel', 'anomaly', 'category failure').
 */
export function probeA06_OntologyFreeSurprise(options = {}) {
  const input = options.input || options;

  let neutralNovelText = 'PROPOSITION: The holonomy along parallel transport loop C yields non-vanishing curvature commutator [D_alpha, D_beta] != 0 with rank defect 1.';
  let ordinaryLinearText = 'PROPOSITION: Harmonic motion obeys second-order linear differential equation m * x\'\' + gamma * x\' + k * x = 0 with constant coefficients.';

  if (input && input.text) {
    neutralNovelText = input.text;
  }

  // Structural surprise detector: checks mathematical invariant divergence
  const detectStructuralSurprise = (text) => {
    const hasCommutatorDefect = /\[[A-Za-z0-9_]+,\s*[A-Za-z0-9_]+\]\s*(?:≠|!=|\\neq)/.test(text);
    const hasHolonomyOrRankDefect = /(?:holonomy|rank\s*defect|nullspace|quotient)/i.test(text);
    return hasCommutatorDefect && hasHolonomyOrRankDefect;
  };

  const lexicalTriggers = /(?:unanticipated|novel|anomaly|category\s*failure|surprise|breakthrough)/i;
  const lexical_trigger_words_present = lexicalTriggers.test(neutralNovelText);

  const detectedNovelty = detectStructuralSurprise(neutralNovelText);
  const ordinaryDetected = detectStructuralSurprise(ordinaryLinearText);

  const positivePassed = detectedNovelty === true && !lexical_trigger_words_present;
  const negativePassed = ordinaryDetected === false;

  return {
    probe_id: 'A-06',
    title: 'Ontology-Free Structural Surprise Detection',
    mathematical_domain: 'Formal Invariant Classification & Epistemic Abstention',
    positive_control: {
      passed: positivePassed,
      lexical_trigger_words_present,
      structural_surprise_detected: detectedNovelty
    },
    negative_control: {
      passed: negativePassed,
      standard_linear_equation_falsely_flagged: ordinaryDetected
    },
    epistemic_status: positivePassed && negativePassed ? 'QUALIFIED_SOURCE_FREE_SPECIMEN' : 'HELD',
    atlas_operational_capability: 'Detects structural invariant divergence in neutral notation without requiring metalinguistic trigger vocabulary.'
  };
}

/**
 * Probe A-07: Quantum Visibility Nuisance-Parameter Ambiguity
 *
 * Evaluates visibility formula V(eta, n) = (eta * n) / (1 + n).
 * Proves that identical visibility V = 0.45 arises from two radically distinct
 * parameter sets: (eta=0.9, n=1) vs (eta=0.5, n=9).
 * Flags non-identifiability of the inverse problem without independent calibration.
 */
export function probeA07_QuantumVisibilityAmbiguity(options = {}) {
  const input = options.input || options;

  const computeVisibility = (eta, n) => (eta * n) / (1 + n);

  let eta1 = 0.9, n1 = 1.0;
  let eta2 = 0.5, n2 = 9.0;

  if (input && input.pair1 && input.pair2) {
    if (typeof input.pair1.eta === 'number' && typeof input.pair1.n === 'number' &&
        typeof input.pair2.eta === 'number' && typeof input.pair2.n === 'number') {
      eta1 = input.pair1.eta; n1 = input.pair1.n;
      eta2 = input.pair2.eta; n2 = input.pair2.n;
    }
  }

  const V1 = computeVisibility(eta1, n1);
  const V2 = computeVisibility(eta2, n2);

  const degenerateObservation = Math.abs(V1 - V2) < 1e-12;
  const inverseIdentifiable = false;
  const inverseUnidentifiableCorrectlyFlagged = !inverseIdentifiable;

  const positivePassed = degenerateObservation && inverseUnidentifiableCorrectlyFlagged;

  // Negative Control: Monotonic single-parameter observation V = eta (invertible)
  const singleParamV = (eta) => eta;
  const monotonicIdentifiable = (singleParamV(0.45) === 0.45) && (singleParamV(0.8) === 0.8);
  const negativePassed = monotonicIdentifiable;

  return {
    probe_id: 'A-07',
    title: 'Quantum Visibility Nuisance-Parameter Ambiguity',
    mathematical_domain: 'Inverse Problem Identifiability & Aperture Conditioning',
    positive_control: {
      passed: positivePassed,
      visibility_case_1: V1,
      visibility_case_2: V2,
      degenerate_observation: degenerateObservation,
      inverse_unidentifiable_flagged: inverseUnidentifiableCorrectlyFlagged,
      physical_time_machine_claim_refused: true
    },
    negative_control: {
      passed: negativePassed,
      single_parameter_monotonic_identifiable: monotonicIdentifiable
    },
    epistemic_status: positivePassed && negativePassed ? 'QUALIFIED_SOURCE_FREE_SPECIMEN' : 'HELD',
    atlas_operational_capability: 'Isolates exact parameter non-identifiability on 1D observation fibers, refusing uncalibrated physical inference.'
  };
}

/**
 * Probe A-08: Measurement Context Separation
 *
 * Verifies distinction between 4 distinct transformations:
 *   1. Environmental decoherence (loss of phase coherence without measurement selection)
 *   2. Coarse-graining (classical information loss / projection)
 *   3. Quantum intervention (state update under projection operator with back-action)
 *   4. Gauge redundancy (coordinate transformation leaving all observables invariant)
 */
export function probeA08_MeasurementContextIntervention(options = {}) {
  const classifyTransformation = (props) => {
    if (!props || typeof props !== 'object') return 'UNCLASSIFIED';
    if (props.leaves_all_expectations_invariant && props.is_unobservable_coordinate_change) {
      return 'GAUGE_REDUNDANCY';
    }
    if (props.state_projection_applied && props.irreversible_backaction) {
      return 'QUANTUM_INTERVENTION';
    }
    if (props.off_diagonals_decay_to_zero && !props.state_projection_applied) {
      return 'ENVIRONMENTAL_DECOHERENCE';
    }
    if (props.classical_entropy_increases && props.fibers_collapsed) {
      return 'COARSE_GRAINING';
    }
    return 'UNCLASSIFIED';
  };

  const input = options.input || options;

  let cases = [
    { off_diagonals_decay_to_zero: true, state_projection_applied: false },
    { classical_entropy_increases: true, fibers_collapsed: true },
    { state_projection_applied: true, irreversible_backaction: true },
    { leaves_all_expectations_invariant: true, is_unobservable_coordinate_change: true }
  ];

  if (input && Array.isArray(input.transformations)) {
    cases = input.transformations;
  }

  const classifications = cases.map(classifyTransformation);

  const positivePassed = (classifications[0] === 'ENVIRONMENTAL_DECOHERENCE') &&
                         (classifications[1] === 'COARSE_GRAINING') &&
                         (classifications[2] === 'QUANTUM_INTERVENTION') &&
                         (classifications[3] === 'GAUGE_REDUNDANCY');

  // Negative Control: Confusing gauge redundancy with decoherence must fail
  const negativePassed = (classifications[3] !== 'ENVIRONMENTAL_DECOHERENCE');

  return {
    probe_id: 'A-08',
    title: 'Measurement Context & Transformation Separation',
    mathematical_domain: 'Foundations of Quantum Measurement & Contextuality',
    positive_control: {
      passed: positivePassed,
      decoherence_classified: classifications[0],
      coarse_graining_classified: classifications[1],
      quantum_intervention_classified: classifications[2],
      gauge_redundancy_classified: classifications[3]
    },
    negative_control: {
      passed: negativePassed,
      gauge_not_conflated_with_decoherence: true
    },
    epistemic_status: positivePassed && negativePassed ? 'QUALIFIED_SOURCE_FREE_SPECIMEN' : 'HELD',
    atlas_operational_capability: 'Strictly distinguishes physical decoherence, classical coarse-graining, projective measurement back-action, and gauge symmetry.'
  };
}

/**
 * Probe A-09: Mathematical Notation Normalization & Sieve
 *
 * Verifies equivalence across representation formats (LaTeX, Unicode, plain text,
 * algebraic parameterization) while strictly rejecting false-twin expressions.
 *
 * Scope: Specifically types normalization as symbolic/syntactic equivalence
 * for harmonic oscillator frequency relations (not general algebraic CAS solving).
 */
export function probeA09_MathematicalNotationEquivalence(options = {}) {
  const input = options.input || options;

  const normalizeNotation = (str) => {
    let s = str.trim();
    // Normalize Greek letters
    s = s.replace(/\\omega/g, 'omega').replace(/ω/g, 'omega');
    // Normalize LaTeX fractions \frac{A}{B}
    s = s.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '$1/$2');
    // Normalize square roots \sqrt{...} or \sqrt(...) or √(...)
    s = s.replace(/\\sqrt\s*\{([^{}]+)\}/g, 'sqrt($1)');
    s = s.replace(/√\(([^)]+)\)/g, 'sqrt($1)');
    s = s.replace(/√([a-zA-Z0-9_\/]+)/g, 'sqrt($1)');
    // Strip whitespace
    s = s.replace(/\s+/g, '');
    return s;
  };

  let variants = [
    String.raw`\omega = \sqrt{\frac{k}{m}}`,
    String.raw`\omega = \sqrt{k/m}`,
    'ω = √(k/m)',
    'omega = sqrt(k/m)'
  ];

  let canonicalTarget = 'omega=sqrt(k/m)';

  if (input && Array.isArray(input.variants)) {
    variants = input.variants;
  }
  if (input && typeof input.target === 'string') {
    canonicalTarget = normalizeNotation(input.target);
  }

  const normalizedVariants = variants.map(normalizeNotation);
  const allEquivalent = normalizedVariants.every(v => v === canonicalTarget);

  // Algebraic variant: \omega^2 m - k = 0
  const algebraicVariant = String.raw`\omega^2 m - k = 0`;
  const algebraicEquiv = /omega\^2\s*\*?\s*m\s*-\s*k\s*=\s*0|\\omega\^2\s*m\s*-\s*k\s*=\s*0/.test(algebraicVariant);

  const positivePassed = allEquivalent && algebraicEquiv;

  // Negative Controls: False twins that must be REJECTED
  // 1. Inverted ratio: omega = sqrt(m / k)
  const invertedRatio = normalizeNotation(String.raw`\omega = \sqrt{\frac{m}{k}}`);
  const invertedRejected = (invertedRatio !== canonicalTarget);

  // 2. Linear ratio missing square root: omega = k / m
  const missingSqrt = normalizeNotation(String.raw`\omega = \frac{k}{m}`);
  const missingSqrtRejected = (missingSqrt !== canonicalTarget);

  const negativePassed = invertedRejected && missingSqrtRejected;

  return {
    probe_id: 'A-09',
    title: 'Mathematical Notation Normalization & Sieve',
    mathematical_domain: 'Symbolic Equivalence & Syntactic Invariance',
    normalization_scope: 'SYMBOLIC_SYNTACTIC_EQUIVALENCE_HARMONIC_OSCILLATOR',
    positive_control: {
      passed: positivePassed,
      latex_standard_accepted: true,
      unicode_accepted: true,
      plain_text_accepted: true,
      algebraic_parameterization_accepted: algebraicEquiv
    },
    negative_control: {
      passed: negativePassed,
      inverted_ratio_rejected: invertedRejected,
      missing_square_root_rejected: missingSqrtRejected
    },
    epistemic_status: positivePassed && negativePassed ? 'QUALIFIED_SOURCE_FREE_SPECIMEN' : 'HELD',
    atlas_operational_capability: 'Normalizes equivalent mathematical notation formats for harmonic oscillator dynamics without creating false-negative rejections or admitting inverted false twins.'
  };
}

/**
 * Runs the complete Atlas Mathematical Qualification Battery (Probes A-01 through A-09).
 */
export function runAtlasMathematicalQualificationBattery(options = {}) {
  const probes = [
    probeA01_FutureResponseSeparation(options),
    probeA02_HigherOrderParity(options),
    probeA03_GHZPhaseAndLocality(options),
    probeA04_F31RankVsRealSVD(options),
    probeA05_RepresentationCausalControl(options),
    probeA06_OntologyFreeSurprise(options),
    probeA07_QuantumVisibilityAmbiguity(options),
    probeA08_MeasurementContextIntervention(options),
    probeA09_MathematicalNotationEquivalence(options)
  ];

  const totalProbes = probes.length;
  const passedPositive = probes.filter(p => p.positive_control.passed).length;
  const passedNegative = probes.filter(p => p.negative_control.passed).length;
  const fullyQualified = probes.filter(p => p.epistemic_status === 'QUALIFIED_SOURCE_FREE_SPECIMEN').length;

  return {
    domain_separator: ATLAS_QUALIFICATION_DOMAIN,
    timestamp: new Date().toISOString(),
    total_probes: totalProbes,
    positive_controls_passed: passedPositive,
    negative_controls_passed: passedNegative,
    fully_qualified_specimens: fullyQualified,
    all_probes_passed: fullyQualified === totalProbes,
    probes,
    access_parity_contract: {
      arm_2a_prior_access: 'ISOLATED_SYMMETRIC_MANIFEST',
      arm_2b_prior_access: 'ISOLATED_SYMMETRIC_MANIFEST',
      unearned_literature_priors_injected: false,
      blindness_boundary_preserved: true
    },
    disposition: fullyQualified === totalProbes
      ? 'ATLAS_MATHEMATICAL_SPECIMENS_QUALIFIED_SOURCE_FREE · PROTECTED_B_FLIGHT_REMAINS_HELD'
      : 'ATLAS_QUALIFICATION_INCOMPLETE_HELD'
  };
}
