/**
 * @fileoverview Independent Mathematical Verification Suite for Atlas Engine
 *
 * Tests the 9 reusable Atlas mathematical capabilities in app/engine/atlas-mathematical-engine.js:
 *   - Genuine input dependency (caller problem objects actively steer outcomes)
 *   - Epistemic status enforcement (FIXTURE_DEMONSTRATION vs INPUT_DEPENDENT_EVALUATION vs NOT_EVALUATED)
 *   - Out-of-family generalization testing across unexpected inputs
 *   - Strict separation:
 *       * SVD on R vs Gaussian elimination over F31 (callable continuous SVD refused on F31)
 *       * Physical 3-qubit density matrix reduction (genuine partial traces, rank, entropy)
 *       * Liouville phase volume contraction div(F) = -gamma/m < 0 (damped systems dissipative, NOT symplectic)
 *       * Disentangled photon statistics vs spectral sinc visibility inverse models
 *       * Operational separation of decoherence vs coarse-graining vs quantum intervention vs gauge symmetry
 *       * Harmonic frequency normalization vs non-commutative ladder operator algebra
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Heritage: Tauric Diana · Khona‌lit-po · Display: 𝌋 · Scalar: U+10D613 (\uDBF5\uDE13)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateTemporalFiberEquivalence,
  evaluateParityInvariant,
  evaluateGHZReductionAndLocality,
  evaluateRankAndConditioning,
  evaluateDynamicalMorphism,
  evaluateStructuralSignature,
  evaluateQuantumVisibilityInverseProblem,
  evaluateQuantumMeasurementContexts,
  evaluateHarmonicOscillatorSymbolicEquivalence,
  evaluateLadderOperatorCommutator,
  computeFiniteFieldSvd,
  dispatchAtlasMathematicalOperation,
  computeComplexHermitianSpectrum,
  ATLAS_EPISTEMIC_STATUS_TAXONOMY,
  mapToScientificAcceptanceStatus,
  ATLAS_ENGINE_VERSION
} from '../app/engine/atlas-mathematical-engine.js';

test('Atlas Engine - Metadata and Versioning', () => {
  assert.ok(ATLAS_ENGINE_VERSION === '1.1.0' || ATLAS_ENGINE_VERSION === '1.2.0');
});

// ============================================================================
// SECTION 1: CANONICAL CALIBRATION FIXTURES (FIXTURE_DEMONSTRATION)
// ============================================================================

test('A-01: Temporal Fiber Geometry - Canonical Fixture Demonstration', () => {
  const result = evaluateTemporalFiberEquivalence();
  assert.equal(result.epistemic_status, 'FIXTURE_DEMONSTRATION');
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.t0_equivalent, true);
  assert.equal(result.positive_control.t1_distinguishable, true);
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.negative_control.radial_congruence_maintained, true);
});

test('A-02: Distributed Historical Memory - Canonical Fixture Demonstration', () => {
  const result = evaluateParityInvariant();
  assert.equal(result.epistemic_status, 'FIXTURE_DEMONSTRATION');
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.univariate_identical, true);
  assert.equal(result.positive_control.pairwise_identical, true);
  assert.equal(result.positive_control.even_parity_invariant, 1.0);
  assert.equal(result.positive_control.odd_parity_invariant, -1.0);
  assert.equal(result.positive_control.parity_separated, true);
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.negative_control.unentangled_bernoulli_parity, 0.0);
});

test('A-03: GHZ Locality Bounds - Canonical Fixture Demonstration', () => {
  const result = evaluateGHZReductionAndLocality();
  assert.equal(result.epistemic_status, 'FIXTURE_DEMONSTRATION');
  assert.equal(result.positive_control.passed, true);

  // Exact 2-qubit reduced density matrix rho_12:
  // rho_12 = diag(0.5, 0, 0, 0.5)
  // Rank is 2, entropy S = 1.0 bit
  assert.deepEqual(result.positive_control.reduced_2qubit_diagonal, [0.5, 0.0, 0.0, 0.5]);
  assert.equal(result.positive_control.reduced_2qubit_rank, 2);
  assert.ok(Math.abs(result.positive_control.reduced_2qubit_entropy_bits - 1.0) < 1e-4);
  // Strictly NOT maximally mixed on 2 qubits (I_4 / 4 would be rank 4, S = 2.0 bits)
  assert.equal(result.positive_control.reduced_2qubit_maximally_mixed_i4_div_4, false);

  // Exact 1-qubit reduced density matrix rho_1:
  // rho_1 = diag(0.5, 0.5) = I_2 / 2
  // Rank 2, S = 1.0 bit -> IS maximally mixed on 1 qubit
  assert.deepEqual(result.positive_control.reduced_1qubit_diagonal, [0.5, 0.5]);
  assert.equal(result.positive_control.reduced_1qubit_maximally_mixed_on_1qubit, true);

  // Global distinction and vulnerability
  assert.ok(Math.abs(result.positive_control.global_stabilizer_x1x2x3_expectation - 1.0) < 1e-4);
  assert.equal(result.positive_control.is_canonical_ghz_plus, true);
  assert.equal(result.positive_control.qec_distance, 1);
  assert.equal(result.positive_control.qec_unjustified_claim_rejected, true);
});

test('A-04: Modular Rank vs Real Jacobi SVD Conditioning - Canonical Fixture Demonstration', () => {
  const result = evaluateRankAndConditioning();
  assert.equal(result.epistemic_status, 'FIXTURE_DEMONSTRATION');
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.f31_rank, 2);
  assert.equal(result.positive_control.f31_nullity, 2);
  assert.equal(result.positive_control.rank_nullity_consistent, true);
  assert.equal(result.positive_control.svd_refusal_verified, true);

  // Dynamic real Jacobi SVD: condition number = 2.0, sigma_max = 4.0, sigma_min = 2.0
  assert.ok(Math.abs(result.positive_control.real_svd_condition_number - 2.0) < 1e-10);
  assert.ok(Math.abs(result.positive_control.real_svd_sigma_max - 4.0) < 1e-10);
  assert.ok(Math.abs(result.positive_control.real_svd_sigma_min - 2.0) < 1e-10);
});

test('A-05: Liouville Contraction & Dissipative Morphisms - Canonical Fixture Demonstration', () => {
  const result = evaluateDynamicalMorphism();
  assert.equal(result.epistemic_status, 'FIXTURE_DEMONSTRATION');
  assert.equal(result.positive_control.passed, true);

  // Mechanical and electrical phase space volume contraction
  assert.equal(result.positive_control.mechanical_phase_contraction_divF, -0.2);
  assert.equal(result.positive_control.electrical_phase_contraction_divF, -0.2);
  assert.equal(result.positive_control.contraction_rates_matched, true);
  assert.equal(result.positive_control.frequencies_matched, true);
  assert.equal(result.positive_control.dissipative_morphism_valid, true);

  // Strictly NOT symplectic (Liouville divergence is negative)
  assert.equal(result.positive_control.is_strictly_symplectic, false);
  assert.equal(result.positive_control.unqualified_symplectic_label_refused, true);
  assert.equal(result.positive_control.spurious_nominal_coupling_rejected, true);
});

test('A-06: Distinction Ecology - Structural Signature Detection', () => {
  const result = evaluateStructuralSignature();
  assert.equal(result.epistemic_status, 'STRUCTURAL_SIGNATURE_RECOGNIZED');
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.lexical_trigger_words_present, false);
  assert.equal(result.positive_control.structural_surprise_detected, true);
  assert.equal(result.negative_control.standard_linear_equation_falsely_flagged, false);
});

test('A-07: Quantum Visibility Nuisance-Parameter Ambiguity - Photon Occupancy Fixture', () => {
  const result = evaluateQuantumVisibilityInverseProblem();
  assert.equal(result.epistemic_status, 'FIXTURE_DEMONSTRATION');
  assert.equal(result.positive_control.passed, true);
  assert.ok(Math.abs(result.positive_control.visibility_case_1 - 0.45) < 1e-12);
  assert.ok(Math.abs(result.positive_control.visibility_case_2 - 0.45) < 1e-12);
  assert.equal(result.positive_control.degenerate_observation, true);
  assert.equal(result.positive_control.inverse_unidentifiable_flagged, true);
  assert.equal(result.positive_control.physical_uncalibrated_inference_refused, true);
});

test('A-08: Quantum Measurement Context & Transformation Separation', () => {
  const result = evaluateQuantumMeasurementContexts();
  assert.equal(result.epistemic_status, 'FIXTURE_DEMONSTRATION');
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.decoherence_classified, 'ENVIRONMENTAL_DECOHERENCE');
  assert.equal(result.positive_control.coarse_graining_classified, 'COARSE_GRAINING');
  assert.equal(result.positive_control.quantum_intervention_classified, 'QUANTUM_INTERVENTION');
  assert.equal(result.positive_control.gauge_redundancy_classified, 'GAUGE_REDUNDANCY');
  assert.equal(result.negative_control.gauge_not_conflated_with_decoherence, true);
});

test('A-09: Harmonic Oscillator Symbolic Syntactic Equivalence - Frequency Relation Fixture', () => {
  const result = evaluateHarmonicOscillatorSymbolicEquivalence();
  assert.equal(result.epistemic_status, 'FIXTURE_DEMONSTRATION');
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.latex_standard_accepted, true);
  assert.equal(result.positive_control.unicode_accepted, true);
  assert.equal(result.positive_control.plain_text_accepted, true);
  assert.equal(result.positive_control.algebraic_parameterization_accepted, true);
  assert.equal(result.negative_control.inverted_ratio_rejected, true);
  assert.equal(result.negative_control.missing_square_root_rejected, true);
});

test('A-09-LADDER: Ladder Operator Commutator Algebra - Canonical Commutator [a, a^dagger] = 1', () => {
  const result = evaluateLadderOperatorCommutator();
  assert.equal(result.epistemic_status, 'FIXTURE_DEMONSTRATION');
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.canonical_commutator_verified, true);
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.negative_control.perturbed_commutator_rejected, true);
  assert.equal(result.negative_control.independent_mode_commutes, true);
});

// ============================================================================
// SECTION 2: OUT-OF-FAMILY GENERALIZATION BATTERY (INPUT_DEPENDENT_EVALUATION)
// ============================================================================

test('A7-01 Generalization: GHZ Evaluation on Separable Product State |000>', () => {
  // Caller supplies product state |000>
  const result = evaluateGHZReductionAndLocality({
    state_vector: [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
  });

  assert.equal(result.epistemic_status, 'INPUT_DEPENDENT_EVALUATION');
  // Two-qubit reduction of |000> is a pure state diag(1, 0, 0, 0)
  assert.deepEqual(result.positive_control.reduced_2qubit_diagonal, [1.0, 0.0, 0.0, 0.0]);
  assert.equal(result.positive_control.reduced_2qubit_rank, 1);
  assert.equal(result.positive_control.reduced_2qubit_entropy_bits, 0.0);
  assert.equal(result.positive_control.reduced_2qubit_maximally_mixed_i4_div_4, false);

  // Single-qubit reduction is also pure diag(1, 0)
  assert.deepEqual(result.positive_control.reduced_1qubit_diagonal, [1.0, 0.0]);
  assert.equal(result.positive_control.reduced_1qubit_rank, 1);
  assert.equal(result.positive_control.reduced_1qubit_entropy_bits, 0.0);
  assert.equal(result.positive_control.reduced_1qubit_maximally_mixed_on_1qubit, false);

  // Global stabilizer expectation for |000> is 0 (not +1 or -1)
  assert.equal(result.positive_control.global_stabilizer_x1x2x3_expectation, 0.0);
  assert.equal(result.positive_control.is_canonical_ghz_plus, false);
});

test('A7-01 Generalization: GHZ Evaluation on Entangled W State (|001> + |010> + |100>)/sqrt(3)', () => {
  const s = 1 / Math.sqrt(3);
  // Indices: 1 = 001, 2 = 010, 4 = 100
  const wState = [0.0, s, s, 0.0, s, 0.0, 0.0, 0.0];

  const result = evaluateGHZReductionAndLocality({ state_vector: wState });
  assert.equal(result.epistemic_status, 'INPUT_DEPENDENT_EVALUATION');

  // W-state has bipartite entanglement, non-zero entropy, but differs completely from GHZ
  assert.ok(result.positive_control.reduced_2qubit_rank > 1);
  assert.ok(result.positive_control.reduced_2qubit_entropy_bits > 0.0);
  assert.equal(result.positive_control.is_canonical_ghz_plus, false);
});

test('A7-01 Negative Control: Rejection of Unnormalized and Malformed State Vectors', () => {
  // Unnormalized (norm^2 = 2 != 1)
  const unnorm = evaluateGHZReductionAndLocality({
    state_vector: [1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
  });
  assert.equal(unnorm.epistemic_status, 'NOT_EVALUATED');
  assert.equal(unnorm.reason, 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN');

  // Wrong dimension (length 4)
  const wrongDim = evaluateGHZReductionAndLocality({
    state_vector: [0.5, 0.5, 0.5, 0.5]
  });
  assert.equal(wrongDim.epistemic_status, 'NOT_EVALUATED');

  // Non-numeric elements
  const nonNum = evaluateGHZReductionAndLocality({
    state_vector: ['string', 0, 0, 0, 0, 0, 0, 0]
  });
  assert.equal(nonNum.epistemic_status, 'NOT_EVALUATED');
});

test('A7-02 Generalization: Out-of-Family Custom Modular Matrix (Rank 2, Nullity 0)', () => {
  // Custom 2x2 identity matrix over F31: rank is 2, nullity is 0
  // Crucial test: must NOT demand canonical answer (rank 2, nullity 2)
  const custom = evaluateRankAndConditioning({
    modular_matrix: [
      [1, 0],
      [0, 1]
    ]
  });

  assert.equal(custom.epistemic_status, 'INPUT_DEPENDENT_EVALUATION');
  assert.equal(custom.positive_control.f31_rank, 2);
  assert.equal(custom.positive_control.f31_nullity, 0);
  assert.equal(custom.positive_control.rank_nullity_consistent, true);
});

test('A7-02 Generalization: Out-of-Family Custom Real Matrix with Condition Number 5.0', () => {
  // Custom diagonal matrix diag(5.0, 1.0): sigmaMax = 5.0, sigmaMin = 1.0, kappa = 5.0
  // Must NOT demand canonical answer kappa = 2.0
  const custom = evaluateRankAndConditioning({
    real_matrix: [
      [5.0, 0.0],
      [0.0, 1.0]
    ]
  });

  assert.equal(custom.epistemic_status, 'INPUT_DEPENDENT_EVALUATION');
  assert.ok(Math.abs(custom.positive_control.real_svd_condition_number - 5.0) < 1e-10);
  assert.ok(Math.abs(custom.positive_control.real_svd_sigma_max - 5.0) < 1e-10);
  assert.ok(Math.abs(custom.positive_control.real_svd_sigma_min - 1.0) < 1e-10);
  assert.equal(custom.positive_control.real_svd_valid, true);
});

test('A7-02 Callable Public API Boundary: computeFiniteFieldSvd Throws Explicit Refusal', () => {
  assert.throws(
    () => computeFiniteFieldSvd([[1, 0], [0, 1]], 31),
    /FINITE_FIELD_SVD_REFUSED/
  );
});

test('A7-02 Negative Control: Ragged Row and Non-Finite Matrix Rejection', () => {
  // Ragged row
  const ragged = evaluateRankAndConditioning({
    modular_matrix: [[1, 2], [3]]
  });
  assert.equal(ragged.epistemic_status, 'NOT_EVALUATED');
  assert.equal(ragged.reason, 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN');

  // Non-finite entry (NaN)
  const nonFinite = evaluateRankAndConditioning({
    real_matrix: [[NaN, 1.0], [0.0, 1.0]]
  });
  assert.equal(nonFinite.epistemic_status, 'NOT_EVALUATED');
});

test('A7-03 Generalization: Non-Commutative Ladder Operator Commutator Evaluation', () => {
  // Evaluate canonical [a, a^dagger]
  const resCanonical = evaluateLadderOperatorCommutator({
    commutator_relation: '[a, a^dagger]'
  });
  assert.equal(resCanonical.epistemic_status, 'INPUT_DEPENDENT_EVALUATION');
  assert.equal(resCanonical.simplified_result, '1');
  assert.equal(resCanonical.positive_control.passed, true);

  // Evaluate inverted commutator [a^dagger, a] = -1
  const resInverted = evaluateLadderOperatorCommutator({
    commutator_relation: '[a^dagger, a]',
    expected_value: '-1'
  });
  assert.equal(resInverted.simplified_result, '-1');
  assert.equal(resInverted.positive_control.passed, true);

  // Negative control: perturbed commutator does NOT equal 1
  const resPerturbed = evaluateLadderOperatorCommutator({
    commutator_relation: '[a, a^dagger] + epsilon * N',
    expected_value: '1'
  });
  assert.equal(resPerturbed.epistemic_status, 'HELD');
  assert.equal(resPerturbed.positive_control.passed, false);
});

test('A7-04 Generalization: Spectral Sinc Interferometric Forward Model', () => {
  const sincModel = evaluateQuantumVisibilityInverseProblem({
    model: 'SPECTRAL_INTERFEROMETRIC_SINC',
    sinc_parameters: {
      eta1: 0.8,
      delta_omega1: 1.0e12,
      tau: 1.0e-12,
      eta2: 0.4,
      delta_omega2: 0.5e12
    }
  });

  assert.equal(sincModel.epistemic_status, 'INPUT_DEPENDENT_EVALUATION');
  assert.equal(sincModel.forward_model.model_name, 'SPECTRAL_INTERFEROMETRIC_SINC');
  assert.ok(sincModel.positive_control.visibility_case_1 > 0);
  assert.ok(sincModel.positive_control.visibility_case_2 > 0);
  assert.equal(sincModel.positive_control.inverse_unidentifiable_flagged, true);
});

test('A7-04 Negative Control: Rejection of Unphysical Negative Parameters', () => {
  const negativeEta = evaluateQuantumVisibilityInverseProblem({
    pair1: { eta: -0.5, n: 1.0 },
    pair2: { eta: 0.5, n: 9.0 }
  });
  assert.equal(negativeEta.epistemic_status, 'NOT_EVALUATED');
  assert.equal(negativeEta.reason, 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN');

  const negativeOccupancy = evaluateQuantumVisibilityInverseProblem({
    pair1: { eta: 0.9, n: -2.0 },
    pair2: { eta: 0.5, n: 9.0 }
  });
  assert.equal(negativeOccupancy.epistemic_status, 'NOT_EVALUATED');
});

test('A7-05 Generalization: Damped vs Conservative Dynamical Morphisms & Domain Validation', () => {
  // Conservative oscillator (gamma = 0) is volume preserving
  const conservative = evaluateDynamicalMorphism({
    mechanical: { m: 2.0, gamma: 0.0, k: 8.0 },
    electrical: { L: 2.0, R: 0.0, C: 0.125 }
  });
  assert.equal(conservative.epistemic_status, 'INPUT_DEPENDENT_EVALUATION');
  assert.equal(conservative.positive_control.is_strictly_symplectic, true);
  assert.equal(conservative.positive_control.mechanical_phase_contraction_divF, 0.0);

  // Negative control: unphysical negative mass
  const unphysical = evaluateDynamicalMorphism({
    mechanical: { m: -1.0, gamma: 0.2, k: 4.0 },
    electrical: { L: 1.0, R: 0.2, C: 0.25 }
  });
  assert.equal(unphysical.epistemic_status, 'NOT_EVALUATED');
  assert.equal(unphysical.reason, 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN');
});

test('A7-05 Generalization: Structural Signature Retains Unknown Candidate Propositions', () => {
  // An unknown mathematical proposition outside regular expressions is NOT erased
  const unknownProp = evaluateStructuralSignature({
    text: 'PROPOSITION: The spectral gap of the transfer operator is strictly positive for all beta > 0.'
  });
  assert.equal(unknownProp.epistemic_status, 'STRUCTURAL_SIGNATURE_RECOGNIZED');
  assert.equal(unknownProp.positive_control.structural_surprise_detected, false);
  assert.equal(unknownProp.positive_control.retained_for_adjudication, true);
});

test('Universal Dispatcher: Routes All Capabilities and Ladder Algebra', () => {
  const opLadder = dispatchAtlasMathematicalOperation('LADDER_OPERATOR', {
    commutator_relation: '[a, a^dagger]'
  });
  assert.equal(opLadder.capability_id, 'A-09-LADDER');
  assert.equal(opLadder.simplified_result, '1');

  const opVisibilitySinc = dispatchAtlasMathematicalOperation('A-07', {
    model: 'SPECTRAL_SINC'
  });
  assert.equal(opVisibilitySinc.capability_id, 'A-07');
  assert.equal(opVisibilitySinc.forward_model.model_name, 'SPECTRAL_INTERFEROMETRIC_SINC');

  const unknown = dispatchAtlasMathematicalOperation('NONEXISTENT_OP');
  assert.equal(unknown.epistemic_status, 'NOT_EVALUATED');
  assert.equal(unknown.reason, 'UNRECOGNIZED_MATHEMATICAL_OPERATION');
});

/* ========================================================================= */
/* REDPEN VIII SCIENTIFIC COUNTEREXAMPLE & ACCEPTANCE BATTERY                */
/* ========================================================================= */

test('Redpen VIII-A1: Complex GHZ Pure State with Imaginary Off-Diagonal Coherence', () => {
  // Adversarial pure state: |psi> = (|000> + i|010>) / sqrt(2)
  // Exact reduced state rho_12 is pure: spec(rho_12) = (1, 0, 0, 0), rank = 1, entropy = 0 bits.
  // The real block embedding M_(8x8) preserves imaginary coherence and recovers pure spectrum.
  const psi_imag = [
    1 / Math.SQRT2, 0,
    { re: 0, im: 1 / Math.SQRT2 }, 0,
    0, 0, 0, 0
  ];
  const res = evaluateGHZReductionAndLocality({ state_vector: psi_imag });

  assert.equal(res.positive_control.passed, true);
  assert.equal(res.positive_control.reduced_2qubit_rank, 1);
  assert.equal(res.positive_control.reduced_2qubit_entropy_bits, 0.0);
  assert.deepEqual(res.positive_control.reduced_2qubit_singular_values, [1.0, 0.0, 0.0, 0.0]);
  assert.equal(res.positive_control.reduced_1qubit_rank, 1);
  assert.equal(res.positive_control.reduced_1qubit_entropy_bits, 0.0);

  // QEC Code Scope: arbitrary custom state abstains from d=1 claim
  assert.equal(res.positive_control.qec_distance, null);
  assert.equal(res.positive_control.qec_code_scope, 'UNDECLARED_CODE_SUBSPACE');
  assert.equal(res.positive_control.qec_unjustified_claim_rejected, true);
  assert.equal(res.scientific_status, ATLAS_EPISTEMIC_STATUS_TAXONOMY.SUPPORTED_INPUT_DEPENDENT_CALCULATION);
});

test('Redpen VIII-A1: Conjugate Phase Variant (|000> - i|010>)/sqrt(2)', () => {
  const psi_conj = [
    1 / Math.SQRT2, 0,
    { re: 0, im: -1 / Math.SQRT2 }, 0,
    0, 0, 0, 0
  ];
  const res = evaluateGHZReductionAndLocality({ state_vector: psi_conj });

  assert.equal(res.positive_control.passed, true);
  assert.equal(res.positive_control.reduced_2qubit_rank, 1);
  assert.equal(res.positive_control.reduced_2qubit_entropy_bits, 0.0);
  assert.deepEqual(res.positive_control.reduced_2qubit_singular_values, [1.0, 0.0, 0.0, 0.0]);
});

test('Redpen VIII-A1: Complex Mixed State Partial Trace (|000> + i|011>)/sqrt(2)', () => {
  // |psi> = (|000> + i|011>) / sqrt(2)
  // rho_12 = 0.5 * (|00><00| + |01><01|), diagonal classical mixture
  const psi_mixed = [
    1 / Math.SQRT2, 0, 0,
    { re: 0, im: 1 / Math.SQRT2 },
    0, 0, 0, 0
  ];
  const res = evaluateGHZReductionAndLocality({ state_vector: psi_mixed });

  assert.equal(res.positive_control.passed, true);
  assert.equal(res.positive_control.reduced_2qubit_rank, 2);
  assert.equal(res.positive_control.reduced_2qubit_entropy_bits, 1.0);
  assert.deepEqual(res.positive_control.reduced_2qubit_singular_values, [0.5, 0.5, 0.0, 0.0]);
});

test('Redpen VIII-A2: Spectral Sinc Visibility Genuine Degenerate Pair Witness', () => {
  // Genuine Degenerate Pair at V* = 0.450000:
  // Tuple 1: (eta1 = 0.5347777976, delta_omega1 = 2.0e12, tau = 1.0e-12) -> V1 = 0.4500000000
  // Tuple 2: (eta2 = 0.9897751533, delta_omega2 = 4.0e12, tau = 1.0e-12) -> V2 = 0.4500000000
  const res = evaluateQuantumVisibilityInverseProblem({
    model: 'SPECTRAL_INTERFEROMETRIC_SINC'
  });

  assert.equal(res.forward_model_evaluated, true);
  assert.equal(res.degenerate_observation_witness, true);
  assert.equal(res.parameters_distinct, true);
  assert.equal(res.structural_non_identifiability, true);
  assert.equal(res.positive_control.passed, true);
  assert.ok(Math.abs(res.positive_control.visibility_case_1 - 0.45) < 1e-6);
  assert.ok(Math.abs(res.positive_control.visibility_case_2 - 0.45) < 1e-6);
  assert.ok(res.positive_control.visibility_difference < 1e-6);
  assert.equal(res.scientific_status, ATLAS_EPISTEMIC_STATUS_TAXONOMY.CANONICAL_FIXTURE_DEMONSTRATION);
});

test('Redpen VIII-A2: Spectral Sinc Visibility Forward Model Separation on Unequal Pair', () => {
  // Evaluates forward model on an unequal parameter pair (V1 != V2),
  // asserting degenerate_observation_witness is FALSE while forward model was successfully evaluated.
  const res = evaluateQuantumVisibilityInverseProblem({
    model: 'SPECTRAL_INTERFEROMETRIC_SINC',
    sinc_parameters: {
      eta1: 0.9, delta_omega1: 2.0e12,
      eta2: 0.5, delta_omega2: 1.0e12,
      tau: 0.5e-12
    }
  });

  assert.equal(res.forward_model_evaluated, true);
  assert.equal(res.degenerate_observation_witness, false);
  assert.equal(res.parameters_distinct, true);
  assert.equal(res.structural_non_identifiability, true);
  assert.ok(res.positive_control.visibility_difference > 0.1);
  assert.equal(res.scientific_status, ATLAS_EPISTEMIC_STATUS_TAXONOMY.SUPPORTED_INPUT_DEPENDENT_CALCULATION);
});

test('Redpen VIII-A3: Typed Non-Commutative Ladder Operator Commutator Algebra Engine', () => {
  // Path B: Genuine polynomial algebra engine with normal ordering and multi-mode commutators
  // 1. Canonical [a, a^dagger] = 1
  const r1 = evaluateLadderOperatorCommutator({
    commutator_relation: '[a, a^dagger]',
    expected_value: '1'
  });
  assert.equal(r1.simplified_result, '1');
  assert.equal(r1.positive_control.passed, true);

  // 2. Reverse ordering [a^dagger, a] = -1
  const r2 = evaluateLadderOperatorCommutator({
    commutator_relation: '[a^dagger, a]',
    expected_value: '-1'
  });
  assert.equal(r2.simplified_result, '-1');
  assert.equal(r2.positive_control.passed, true);

  // 3. Independent modes commute [a, b] = 0
  const r3 = evaluateLadderOperatorCommutator({
    commutator_relation: '[a, b]',
    expected_value: '0'
  });
  assert.equal(r3.simplified_result, '0');
  assert.equal(r3.positive_control.passed, true);

  // 4. Mode cross-commutator [a, b^dagger] = 0
  const r4 = evaluateLadderOperatorCommutator({
    commutator_relation: '[a, b^dagger]',
    expected_value: '0'
  });
  assert.equal(r4.simplified_result, '0');
  assert.equal(r4.positive_control.passed, true);

  // 5. Higher power quadratic relation [a, (a^dagger)^2] = 2*a^dagger
  const r5 = evaluateLadderOperatorCommutator({
    commutator_relation: '[a, a^dagger*a^dagger]',
    expected_value: '2*a^dagger'
  });
  assert.equal(r5.simplified_result, '2*a^dagger');
  assert.equal(r5.positive_control.passed, true);

  // 6. Perturbed relation [a, a^dagger] = 1 + epsilon*N fails expected '1'
  const r6 = evaluateLadderOperatorCommutator({
    commutator_relation: '[a, a^dagger]',
    expected_value: '1',
    perturbed: true
  });
  assert.equal(r6.positive_control.passed, false);
  assert.equal(r6.epistemic_status, 'HELD');
});

test('Redpen VIII-A4: Finite-Field Nullspace Annihilation and Real SVD Residuals', () => {
  // Tests A-04 with independent matrix-vector residuals M * v = 0 mod 31
  // and Frobenius norm conservation sum(sigma^2) == ||M||_F^2
  const res = evaluateRankAndConditioning({});

  assert.equal(res.positive_control.f31_rank, 2);
  assert.equal(res.positive_control.f31_nullity, 2);
  assert.equal(res.positive_control.f31_rank_nullity_consistent, true);
  assert.equal(res.positive_control.f31_nullspace_basis_dimension, 2);
  assert.equal(res.positive_control.f31_independent_nullspace_residuals_zero, true);
  assert.equal(res.positive_control.real_svd_frobenius_norm_conserved, true);
  assert.equal(res.positive_control.real_svd_valid, true);
  assert.equal(res.scientific_status, ATLAS_EPISTEMIC_STATUS_TAXONOMY.CANONICAL_FIXTURE_DEMONSTRATION);
});

test('Redpen VIII-A4: Measurement Contexts Derives Custom Positive Control Honestly', () => {
  // When an unsupported/unclassified transformation property is provided,
  // positive_control.passed must NOT be hardcoded true
  const customUnsupported = evaluateQuantumMeasurementContexts({
    transformations: [
      { unmodeled_exotic_property: true, random_noise: 42 }
    ]
  });

  assert.equal(customUnsupported.positive_control.passed, false);
  assert.equal(customUnsupported.positive_control.all_transformations_classified, false);
  assert.equal(customUnsupported.epistemic_status, 'NOT_EVALUATED');
  assert.equal(customUnsupported.scientific_status, ATLAS_EPISTEMIC_STATUS_TAXONOMY.UNSUPPORTED_INPUT);
});

test('Redpen VIII Section VII: Exact Scientific Acceptance Taxonomy Completeness', () => {
  // Verifies the 8 canonical statuses defined in Section VII
  const expectedStatuses = [
    'CANONICAL_FIXTURE_DEMONSTRATION',
    'SUPPORTED_INPUT_DEPENDENT_CALCULATION',
    'SOURCE_BOUND_MATHEMATICAL_AUDIT',
    'INDEPENDENTLY_VERIFIED_FORMAL_RELATION',
    'BOUNDED_STRUCTURAL_RECOGNITION',
    'TYPED_DESCRIPTION_CLASSIFICATION',
    'UNSUPPORTED_INPUT',
    'NOT_EVALUATED'
  ];

  for (const s of expectedStatuses) {
    assert.equal(ATLAS_EPISTEMIC_STATUS_TAXONOMY[s], s);
  }

  // Verify mapToScientificAcceptanceStatus helper
  assert.equal(mapToScientificAcceptanceStatus({ scientific_status: 'CANONICAL_FIXTURE_DEMONSTRATION' }), 'CANONICAL_FIXTURE_DEMONSTRATION');
  assert.equal(mapToScientificAcceptanceStatus({ epistemic_status: 'INPUT_DEPENDENT_EVALUATION' }), 'SUPPORTED_INPUT_DEPENDENT_CALCULATION');
  assert.equal(mapToScientificAcceptanceStatus({ epistemic_status: 'FIXTURE_DEMONSTRATION' }), 'CANONICAL_FIXTURE_DEMONSTRATION');
  assert.equal(mapToScientificAcceptanceStatus({ epistemic_status: 'NOT_EVALUATED' }), 'NOT_EVALUATED');
});

// ============================================================================
// SECTION 3: REDPEN IX EXACT-HEAD ACCEPTANCE TEST BATTERY
// ============================================================================

test('Redpen IX-A1: Signed Complex Hermitian Spectrum via Cyclic Jacobi Diagonalization', () => {
  // Test negative eigenvalue signed spectrum preservation on indefinite matrix [[1, 0], [0, -1]]
  const indefiniteMatrix = [
    [1.0, 0.0],
    [0.0, -1.0]
  ];
  const spec = computeComplexHermitianSpectrum(indefiniteMatrix);

  assert.equal(spec.valid, true);
  assert.deepEqual(spec.eigenvalues, [1.0, -1.0]);
  assert.equal(spec.trace, 0.0);
  assert.equal(spec.min_eigenvalue, -1.0);
  assert.equal(spec.max_eigenvalue, 1.0);
  assert.equal(spec.rank, 2);
  assert.equal(spec.is_positive_semidefinite, false);
  assert.equal(spec.density_matrix_valid, false);
  assert.equal(spec.entropy_bits, null);

  // Test standard positive-semidefinite density matrix diag(0.5, 0.5)
  const psdMatrix = [
    [0.5, 0.0],
    [0.0, 0.5]
  ];
  const specPsd = computeComplexHermitianSpectrum(psdMatrix);
  assert.equal(specPsd.valid, true);
  assert.deepEqual(specPsd.eigenvalues, [0.5, 0.5]);
  assert.equal(specPsd.trace, 1.0);
  assert.equal(specPsd.min_eigenvalue, 0.5);
  assert.equal(specPsd.is_positive_semidefinite, true);
  assert.equal(specPsd.density_matrix_valid, true);
  assert.equal(specPsd.entropy_bits, 1.0);
});

test('Redpen IX-A2: Quantum Coherence Localization in (|000> + i|010>)/sqrt(2)', () => {
  // (|000> + i|010>)/sqrt(2):
  // Qubit 1 is pure state |0>, density matrix rho_1 = diag(1, 0)
  // Qubit 2 carries the superposition (|0> + i|1>)/sqrt(2), density matrix rho_2 has coherence -0.5i, 0.5i
  // Subsystem 12 carries coherence at (0, 1) and (1, 0)
  const psi = [
    { re: 1 / Math.SQRT2, im: 0 },
    { re: 0, im: 0 },
    { re: 0, im: 1 / Math.SQRT2 },
    { re: 0, im: 0 },
    { re: 0, im: 0 },
    { re: 0, im: 0 },
    { re: 0, im: 0 },
    { re: 0, im: 0 }
  ];

  const res = evaluateGHZReductionAndLocality({ state_vector: psi });
  assert.equal(res.epistemic_status, 'INPUT_DEPENDENT_EVALUATION');
  assert.equal(res.positive_control.passed, true);

  // 1. Inspect rho_1 (tracing out qubits 2 and 3): pure real diag(1, 0)
  const rho1 = res.positive_control.reduced_1qubit_matrix;
  assert.ok(Math.abs(rho1[0][0].re - 1.0) < 1e-10 && Math.abs(rho1[0][0].im) < 1e-10);
  assert.ok(Math.abs(rho1[0][1].re) < 1e-10 && Math.abs(rho1[0][1].im) < 1e-10);
  assert.ok(Math.abs(rho1[1][0].re) < 1e-10 && Math.abs(rho1[1][0].im) < 1e-10);
  assert.ok(Math.abs(rho1[1][1].re) < 1e-10 && Math.abs(rho1[1][1].im) < 1e-10);
  assert.equal(res.positive_control.reduced_1qubit_rank, 1);
  assert.equal(res.positive_control.reduced_1qubit_entropy_bits, 0.0);

  // 2. Inspect rho_2 (tracing out qubits 1 and 3): carries imaginary coherence -0.5i and 0.5i
  const rho2 = res.positive_control.reduced_qubit2_matrix;
  assert.ok(Math.abs(rho2[0][0].re - 0.5) < 1e-10 && Math.abs(rho2[0][0].im) < 1e-10);
  assert.ok(Math.abs(rho2[0][1].re) < 1e-10 && Math.abs(rho2[0][1].im - (-0.5)) < 1e-10);
  assert.ok(Math.abs(rho2[1][0].re) < 1e-10 && Math.abs(rho2[1][0].im - 0.5) < 1e-10);
  assert.ok(Math.abs(rho2[1][1].re - 0.5) < 1e-10 && Math.abs(rho2[1][1].im) < 1e-10);
  assert.equal(res.positive_control.reduced_qubit2_rank, 1);
  assert.equal(res.positive_control.reduced_qubit2_entropy_bits, 0.0);

  // 3. Inspect rho_12 (tracing out qubit 3): rank 1 pure state, preserving off-diagonal coherence
  const rho12 = res.positive_control.reduced_2qubit_matrix;
  assert.ok(Math.abs(rho12[0][0].re - 0.5) < 1e-10);
  assert.ok(Math.abs(rho12[0][1].im - (-0.5)) < 1e-10);
  assert.ok(Math.abs(rho12[1][0].im - 0.5) < 1e-10);
  assert.ok(Math.abs(rho12[1][1].re - 0.5) < 1e-10);
  assert.equal(res.positive_control.reduced_2qubit_rank, 1);
  assert.equal(res.positive_control.reduced_2qubit_entropy_bits, 0.0);
});

test('Redpen IX-A3: Noncommutative Ladder Operator Grammar Parser & Linear Combinations', () => {
  // 1. Linear combination: [a + a^dagger, a] = -1
  const r1 = evaluateLadderOperatorCommutator({
    commutator_relation: '[a + a^dagger, a]',
    expected_value: '-1'
  });
  assert.equal(r1.epistemic_status, 'INPUT_DEPENDENT_EVALUATION');
  assert.equal(r1.simplified_result, '-1');
  assert.equal(r1.positive_control.passed, true);
  assert.equal(r1.positive_control.normal_ordering_exact, true);

  // 2. Linear combination: [a + a^dagger, a^dagger] = 1
  const r2 = evaluateLadderOperatorCommutator({
    commutator_relation: '[a + a^dagger, a^dagger]',
    expected_value: '1'
  });
  assert.equal(r2.simplified_result, '1');
  assert.equal(r2.positive_control.passed, true);

  // 3. Independent modes with linear combination: [2*a - b, a^dagger] = 2
  const r3 = evaluateLadderOperatorCommutator({
    commutator_relation: '[2*a - b, a^dagger]',
    expected_value: '2'
  });
  assert.equal(r3.simplified_result, '2');
  assert.equal(r3.positive_control.passed, true);

  // 4. Powers: [a, (a^dagger)^2] = 2*a^dagger
  const r4 = evaluateLadderOperatorCommutator({
    commutator_relation: '[a, (a^dagger)^2]',
    expected_value: '2*a^dagger'
  });
  assert.equal(r4.simplified_result, '2*a^dagger');
  assert.equal(r4.positive_control.passed, true);

  // 5. Adversarial input: Unrecognized operator [a, xyz] fails closed
  const r5 = evaluateLadderOperatorCommutator({
    commutator_relation: '[a, xyz]'
  });
  assert.equal(r5.epistemic_status, 'NOT_EVALUATED');
  assert.equal(r5.scientific_status, ATLAS_EPISTEMIC_STATUS_TAXONOMY.NOT_EVALUATED);
  assert.equal(r5.reason, 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN');
  assert.equal(r5.positive_control, undefined);

  // 6. Adversarial structured array input with invalid token
  const r6 = evaluateLadderOperatorCommutator({
    A: [{ coeff: 1, factors: ['invalid_op'] }],
    B: 'a'
  });
  assert.equal(r6.epistemic_status, 'NOT_EVALUATED');
  assert.equal(r6.reason, 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN');
});
