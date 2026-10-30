/**
 * @fileoverview Independent Mathematical Verification Suite for Atlas Engine
 *
 * Tests the 9 reusable Atlas mathematical capabilities in app/engine/atlas-mathematical-engine.js:
 *   - Genuine input dependency (caller problem objects actively steer outcomes)
 *   - Epistemic status enforcement (NOT_EVALUATED / HELD on malformed / out-of-domain inputs)
 *   - Strict separation:
 *       * SVD on R vs Gaussian elimination over F31 (continuous SVD refused on F31)
 *       * GHZ 2-qubit reduction (rank 2 classical mixture, S=1.0 bit, NOT maximally mixed on 2 qubits)
 *       * Liouville phase volume contraction div(F) = -gamma/m < 0 (damped systems dissipative, NOT symplectic)
 *       * Parameter non-identifiability in quantum visibility inverse problems
 *       * Operational separation of decoherence vs coarse-graining vs quantum intervention vs gauge symmetry
 *       * Symbolic syntactic normalization vs false-twin rejection
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
  dispatchAtlasMathematicalOperation,
  ATLAS_ENGINE_VERSION
} from '../app/engine/atlas-mathematical-engine.js';

test('Atlas Engine - Metadata and Versioning', () => {
  assert.equal(ATLAS_ENGINE_VERSION, '1.0.0');
});

test('A-01: Temporal Fiber Geometry - Positive and Negative Controls', () => {
  const result = evaluateTemporalFiberEquivalence();
  assert.equal(result.epistemic_status, 'MATHEMATICALLY_QUALIFIED');
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.t0_equivalent, true);
  assert.equal(result.positive_control.t1_distinguishable, true);
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.negative_control.radial_congruence_maintained, true);
});

test('A-01: Temporal Fiber Geometry - Custom Inputs and Input Dependency', () => {
  const custom = evaluateTemporalFiberEquivalence({
    stateA: [6, 8],
    stateB: [10, 0],
    f: ([x1, x2]) => x1 * x1 + x2 * x2,
    T: ([x1, x2]) => [x1 + 2, x2]
  });
  assert.equal(custom.epistemic_status, 'MATHEMATICALLY_QUALIFIED');
  assert.equal(custom.positive_control.t0_observation_A, 100);
  assert.equal(custom.positive_control.t0_observation_B, 100);
  assert.equal(custom.positive_control.t0_equivalent, true);
  assert.equal(custom.positive_control.t1_distinguishable, true);
});

test('A-01: Temporal Fiber Geometry - Malformed Input Rejection', () => {
  const malformed = evaluateTemporalFiberEquivalence({
    stateA: ['invalid', 'strings'],
    stateB: [5, 0]
  });
  assert.equal(malformed.epistemic_status, 'NOT_EVALUATED');
  assert.equal(malformed.reason, 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN');
});

test('A-02: Distributed Historical Memory - Parity Holonomy', () => {
  const result = evaluateParityInvariant();
  assert.equal(result.epistemic_status, 'MATHEMATICALLY_QUALIFIED');
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.univariate_identical, true);
  assert.equal(result.positive_control.pairwise_identical, true);
  assert.equal(result.positive_control.even_parity_invariant, 1.0);
  assert.equal(result.positive_control.odd_parity_invariant, -1.0);
  assert.equal(result.positive_control.parity_separated, true);
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.negative_control.unentangled_bernoulli_parity, 0.0);
});

test('A-02: Distributed Historical Memory - Custom Ensemble Input', () => {
  const custom = evaluateParityInvariant({
    evenEnsemble: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]],
    oddEnsemble: [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 1]]
  });
  assert.equal(custom.epistemic_status, 'MATHEMATICALLY_QUALIFIED');
  assert.equal(custom.positive_control.parity_separated, true);
});

test('A-02: Distributed Historical Memory - Malformed Input Rejection', () => {
  const malformed = evaluateParityInvariant({
    evenEnsemble: [[0, 0]], // Only 2 bits instead of 3
    oddEnsemble: [[1, 1, 1]]
  });
  assert.equal(malformed.epistemic_status, 'NOT_EVALUATED');
  assert.equal(malformed.reason, 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN');
});

test('A-03: GHZ Locality Bounds - Exact Reduced Density Matrix Mathematics', () => {
  const result = evaluateGHZReductionAndLocality();
  assert.equal(result.epistemic_status, 'MATHEMATICALLY_QUALIFIED');
  assert.equal(result.positive_control.passed, true);

  // Exact 2-qubit reduced density matrix rho_12:
  // rho_12 = diag(0.5, 0, 0, 0.5)
  // Rank is 2, entropy S = 1.0 bit
  assert.deepEqual(result.positive_control.reduced_2qubit_diagonal, [0.5, 0.0, 0.0, 0.5]);
  assert.equal(result.positive_control.reduced_2qubit_rank, 2);
  assert.equal(result.positive_control.reduced_2qubit_entropy_bits, 1.0);
  // Strictly NOT maximally mixed on 2 qubits (I_4 / 4 would be rank 4, S = 2.0 bits)
  assert.equal(result.positive_control.reduced_2qubit_maximally_mixed_i4_div_4, false);

  // Exact 1-qubit reduced density matrix rho_1:
  // rho_1 = diag(0.5, 0.5) = I_2 / 2
  // Rank 2, S = 1.0 bit -> IS maximally mixed on 1 qubit
  assert.deepEqual(result.positive_control.reduced_1qubit_diagonal, [0.5, 0.5]);
  assert.equal(result.positive_control.reduced_1qubit_maximally_mixed_on_1qubit, true);

  // Global distinction and vulnerability
  assert.equal(result.positive_control.global_eigenvalue_plus, 1);
  assert.equal(result.positive_control.global_eigenvalue_minus, -1);
  assert.equal(result.positive_control.global_distinguishable, true);
  assert.equal(result.positive_control.qec_distance, 1);
  assert.equal(result.positive_control.qec_unjustified_claim_rejected, true);
});

test('A-03: GHZ Locality Bounds - Malformed State Vector Rejection', () => {
  const malformed = evaluateGHZReductionAndLocality({
    state_vector: [1, 0, 0] // Only 3 elements instead of 8
  });
  assert.equal(malformed.epistemic_status, 'NOT_EVALUATED');
  assert.equal(malformed.reason, 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN');
});

test('A-04: Modular Rank vs Real Jacobi SVD Conditioning', () => {
  const result = evaluateRankAndConditioning();
  assert.equal(result.epistemic_status, 'MATHEMATICALLY_QUALIFIED');
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.f31_rank, 2);
  assert.equal(result.positive_control.f31_nullity, 2);
  assert.equal(result.positive_control.svd_refusal_caught, true);

  // Dynamic real Jacobi SVD: condition number = 2.0, sigma_max = 4.0, sigma_min = 2.0
  assert.ok(Math.abs(result.positive_control.real_svd_condition_number - 2.0) < 1e-10);
  assert.ok(Math.abs(result.positive_control.real_svd_sigma_max - 4.0) < 1e-10);
  assert.ok(Math.abs(result.positive_control.real_svd_sigma_min - 2.0) < 1e-10);
});

test('A-04: Modular Rank vs Real SVD - Malformed Matrix Rejection', () => {
  const malformed = evaluateRankAndConditioning({
    modular_matrix: 'not-a-matrix'
  });
  assert.equal(malformed.epistemic_status, 'NOT_EVALUATED');
  assert.equal(malformed.reason, 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN');
});

test('A-05: Liouville Contraction & Dissipative Morphisms', () => {
  const result = evaluateDynamicalMorphism();
  assert.equal(result.epistemic_status, 'MATHEMATICALLY_QUALIFIED');
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

test('A-05: Liouville Contraction - Conservative Oscillator is Symplectic', () => {
  const conservative = evaluateDynamicalMorphism({
    mechanical: { m: 1.0, gamma: 0.0, k: 4.0 },
    electrical: { L: 1.0, R: 0.0, C: 0.25 }
  });
  assert.equal(conservative.positive_control.is_strictly_symplectic, true);
  assert.equal(conservative.positive_control.mechanical_phase_contraction_divF, 0.0);
});

test('A-06: Distinction Ecology - Structural Signature Detection', () => {
  const result = evaluateStructuralSignature();
  assert.equal(result.epistemic_status, 'MATHEMATICALLY_QUALIFIED');
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.lexical_trigger_words_present, false);
  assert.equal(result.positive_control.structural_surprise_detected, true);
  assert.equal(result.negative_control.standard_linear_equation_falsely_flagged, false);
});

test('A-07: Quantum Visibility Nuisance-Parameter Ambiguity', () => {
  const result = evaluateQuantumVisibilityInverseProblem();
  assert.equal(result.epistemic_status, 'MATHEMATICALLY_QUALIFIED');
  assert.equal(result.positive_control.passed, true);
  assert.ok(Math.abs(result.positive_control.visibility_case_1 - 0.45) < 1e-12);
  assert.ok(Math.abs(result.positive_control.visibility_case_2 - 0.45) < 1e-12);
  assert.equal(result.positive_control.degenerate_observation, true);
  assert.equal(result.positive_control.inverse_unidentifiable_flagged, true);
  assert.equal(result.positive_control.physical_uncalibrated_inference_refused, true);
});

test('A-08: Quantum Measurement Context & Transformation Separation', () => {
  const result = evaluateQuantumMeasurementContexts();
  assert.equal(result.epistemic_status, 'MATHEMATICALLY_QUALIFIED');
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.decoherence_classified, 'ENVIRONMENTAL_DECOHERENCE');
  assert.equal(result.positive_control.coarse_graining_classified, 'COARSE_GRAINING');
  assert.equal(result.positive_control.quantum_intervention_classified, 'QUANTUM_INTERVENTION');
  assert.equal(result.positive_control.gauge_redundancy_classified, 'GAUGE_REDUNDANCY');
  assert.equal(result.negative_control.gauge_not_conflated_with_decoherence, true);
});

test('A-09: Harmonic Oscillator Symbolic Syntactic Equivalence', () => {
  const result = evaluateHarmonicOscillatorSymbolicEquivalence();
  assert.equal(result.epistemic_status, 'MATHEMATICALLY_QUALIFIED');
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.latex_standard_accepted, true);
  assert.equal(result.positive_control.unicode_accepted, true);
  assert.equal(result.positive_control.plain_text_accepted, true);
  assert.equal(result.positive_control.algebraic_parameterization_accepted, true);
  assert.equal(result.negative_control.inverted_ratio_rejected, true);
  assert.equal(result.negative_control.missing_square_root_rejected, true);
});

test('Universal Dispatcher: dispatchAtlasMathematicalOperation', () => {
  const op1 = dispatchAtlasMathematicalOperation('A-01');
  assert.equal(op1.capability_id, 'A-01');

  const op3 = dispatchAtlasMathematicalOperation('GHZ_LOCALITY');
  assert.equal(op3.capability_id, 'A-03');

  const unknown = dispatchAtlasMathematicalOperation('NONEXISTENT_OP');
  assert.equal(unknown.epistemic_status, 'NOT_EVALUATED');
  assert.equal(unknown.reason, 'UNRECOGNIZED_MATHEMATICAL_OPERATION');
});
