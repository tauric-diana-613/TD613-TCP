import assert from 'node:assert/strict';
import test from 'node:test';

import {
  probeA01_FutureResponseSeparation,
  probeA02_HigherOrderParity,
  probeA03_GHZPhaseAndLocality,
  probeA04_F31RankVsRealSVD,
  probeA05_RepresentationCausalControl,
  probeA06_OntologyFreeSurprise,
  probeA07_QuantumVisibilityAmbiguity,
  probeA08_MeasurementContextIntervention,
  probeA09_MathematicalNotationEquivalence,
  runAtlasMathematicalQualificationBattery
} from '../docs/research/experiment-b-preflight/09_atlas_mathematical_qualification/atlas-mathematical-qualification-suite.mjs';

test('Atlas Qualification A-01: Future-Response Separation (Default Specimen)', () => {
  const result = probeA01_FutureResponseSeparation();
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.t0_equivalent, true);
  assert.equal(result.positive_control.t1_distinguishable, true);
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.negative_control.true_congruence_maintained, true);
  assert.equal(result.epistemic_status, 'QUALIFIED_SOURCE_FREE_SPECIMEN');
});

test('Atlas Qualification A-01: Caller-Supplied Input and Malformed Refusal', () => {
  // 1. Valid custom input: [6, 8] and [10, 0], f(x) = x1^2 + x2^2 = 100
  const custom = probeA01_FutureResponseSeparation({
    input: {
      stateA: [6, 8],
      stateB: [10, 0]
    }
  });
  assert.equal(custom.positive_control.passed, true);
  assert.equal(custom.positive_control.t0_observation_A, 100);
  assert.equal(custom.positive_control.t0_observation_B, 100);
  assert.equal(custom.positive_control.t0_equivalent, true);
  assert.equal(custom.positive_control.t1_distinguishable, true);

  // 2. Malformed input fails closed to NOT_EVALUATED
  const malformed = probeA01_FutureResponseSeparation({
    input: {
      stateA: [1, 2, 3], // 3D instead of 2D
      stateB: [5, 0]
    }
  });
  assert.equal(malformed.epistemic_status, 'NOT_EVALUATED');
  assert.equal(malformed.reason, 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN');
});

test('Atlas Qualification A-02: Higher-Order Parity Discrimination (Default Specimen)', () => {
  const result = probeA02_HigherOrderParity();
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.univariate_identical, true);
  assert.equal(result.positive_control.pairwise_identical, true);
  assert.equal(result.positive_control.even_parity_invariant, 1.0);
  assert.equal(result.positive_control.odd_parity_invariant, -1.0);
  assert.equal(result.positive_control.parity_separated, true);
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.negative_control.unentangled_bernoulli_parity, 0.0);
  assert.equal(result.epistemic_status, 'QUALIFIED_SOURCE_FREE_SPECIMEN');
});

test('Atlas Qualification A-02: Malformed Ensemble Refusal', () => {
  const malformed = probeA02_HigherOrderParity({
    input: {
      evenEnsemble: [[0, 0], [1, 1]] // 2-bit instead of 3-bit
    }
  });
  assert.equal(malformed.epistemic_status, 'NOT_EVALUATED');
  assert.equal(malformed.reason, 'INPUT_UNSUPPORTED_OR_EXCEEDS_DOMAIN');
});

test('Atlas Qualification A-03: GHZ± Local Unreadability vs Global Stabilizer (Rigorous Density Matrix Math)', () => {
  const result = probeA03_GHZPhaseAndLocality();
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.reduced_2qubit_identical, true);

  // Mathematical rigor: rho_12 has diagonal [0.5, 0, 0, 0.5], rank 2, entropy 1.0 bit
  // It is NOT maximally mixed on 2 qubits (I_4/4)
  assert.deepEqual(result.positive_control.reduced_2qubit_diagonal, [0.5, 0.0, 0.0, 0.5]);
  assert.equal(result.positive_control.reduced_2qubit_rank, 2);
  assert.equal(result.positive_control.reduced_2qubit_entropy_bits, 1.0);
  assert.equal(result.positive_control.reduced_2qubit_maximally_mixed_i4_div_4, false);

  // Single-qubit state rho_1 = 0.5 * I_2 is maximally mixed on 1 qubit
  assert.deepEqual(result.positive_control.reduced_1qubit_diagonal, [0.5, 0.5]);
  assert.equal(result.positive_control.reduced_1qubit_maximally_mixed_on_1qubit, true);

  // Global distinction and QEC claim refusal
  assert.equal(result.positive_control.global_eigenvalue_plus, 1);
  assert.equal(result.positive_control.global_eigenvalue_minus, -1);
  assert.equal(result.positive_control.global_distinguishable, true);
  assert.equal(result.positive_control.qec_distance, 1);
  assert.equal(result.positive_control.qec_unjustified_claim_rejected, true);

  assert.equal(result.negative_control.passed, true);
  assert.equal(result.epistemic_status, 'QUALIFIED_SOURCE_FREE_SPECIMEN');
});

test('Atlas Qualification A-04: F31 Modular Rank vs Real Jacobi SVD Conditioning (Dynamic SVD Execution)', () => {
  const result = probeA04_F31RankVsRealSVD();
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.f31_rank, 2);
  assert.equal(result.positive_control.f31_nullity, 2);
  assert.equal(result.positive_control.svd_refusal_caught, true);

  // Dynamically computed SVD on [[3, 1], [1, 3]]
  assert.ok(Math.abs(result.positive_control.real_svd_sigma_max - 4.0) < 1e-10);
  assert.ok(Math.abs(result.positive_control.real_svd_sigma_min - 2.0) < 1e-10);
  assert.ok(Math.abs(result.positive_control.real_svd_condition_number - 2.0) < 1e-10);
  assert.equal(result.positive_control.real_svd_accurate, true);

  assert.equal(result.negative_control.passed, true);
  assert.equal(result.negative_control.refusal_reason, 'FINITE_FIELD_SVD_REFUSED');
  assert.equal(result.epistemic_status, 'QUALIFIED_SOURCE_FREE_SPECIMEN');
});

test('Atlas Qualification A-04: Caller-Supplied Real Matrix SVD Evaluation', () => {
  // Diagonal matrix with singular values 6.0 and 2.0 -> condition number 3.0
  const custom = probeA04_F31RankVsRealSVD({
    input: {
      real_matrix: [
        [6.0, 0.0],
        [0.0, 2.0]
      ]
    }
  });
  assert.equal(custom.positive_control.real_svd_sigma_max, 6.0);
  assert.equal(custom.positive_control.real_svd_sigma_min, 2.0);
  assert.equal(custom.positive_control.real_svd_condition_number, 3.0);
});

test('Atlas Qualification A-05: Representation Causal Control & Dissipative Dynamical Morphisms (Liouville Law)', () => {
  const result = probeA05_RepresentationCausalControl();
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.frequencies_matched, true);
  assert.equal(result.positive_control.contraction_rates_matched, true);
  assert.equal(result.positive_control.dissipative_morphism_valid, true);

  // Crucial physical law: damped oscillator contracts phase space (div(F) = -0.2 < 0),
  // so it is DISSIPATIVE and NOT symplectic!
  assert.equal(result.positive_control.mechanical_phase_contraction_divF, -0.2);
  assert.equal(result.positive_control.electrical_phase_contraction_divF, -0.2);
  assert.equal(result.positive_control.is_strictly_symplectic, false);
  assert.equal(result.positive_control.unqualified_symplectic_label_refused, true);

  // Spurious nominal coupling rejected
  assert.equal(result.positive_control.spurious_nominal_coupling_rejected, true);
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.negative_control.nominal_label_authority_denied, true);
  assert.equal(result.negative_control.symplectic_confusion_prevented, true);
  assert.equal(result.epistemic_status, 'QUALIFIED_SOURCE_FREE_SPECIMEN');
});

test('Atlas Qualification A-06: Ontology-Free Structural Surprise Detection', () => {
  const result = probeA06_OntologyFreeSurprise();
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.lexical_trigger_words_present, false);
  assert.equal(result.positive_control.structural_surprise_detected, true);
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.negative_control.standard_linear_equation_falsely_flagged, false);
  assert.equal(result.epistemic_status, 'QUALIFIED_SOURCE_FREE_SPECIMEN');
});

test('Atlas Qualification A-07: Quantum Visibility Nuisance-Parameter Ambiguity', () => {
  const result = probeA07_QuantumVisibilityAmbiguity();
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.visibility_case_1, 0.45);
  assert.equal(result.positive_control.visibility_case_2, 0.45);
  assert.equal(result.positive_control.degenerate_observation, true);
  assert.equal(result.positive_control.inverse_unidentifiable_flagged, true);
  assert.equal(result.positive_control.physical_time_machine_claim_refused, true);
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.epistemic_status, 'QUALIFIED_SOURCE_FREE_SPECIMEN');
});

test('Atlas Qualification A-08: Measurement Context & Transformation Separation', () => {
  const result = probeA08_MeasurementContextIntervention();
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.decoherence_classified, 'ENVIRONMENTAL_DECOHERENCE');
  assert.equal(result.positive_control.coarse_graining_classified, 'COARSE_GRAINING');
  assert.equal(result.positive_control.quantum_intervention_classified, 'QUANTUM_INTERVENTION');
  assert.equal(result.positive_control.gauge_redundancy_classified, 'GAUGE_REDUNDANCY');
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.epistemic_status, 'QUALIFIED_SOURCE_FREE_SPECIMEN');
});

test('Atlas Qualification A-09: Mathematical Notation Normalization & Sieve', () => {
  const result = probeA09_MathematicalNotationEquivalence();
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.latex_standard_accepted, true);
  assert.equal(result.positive_control.unicode_accepted, true);
  assert.equal(result.positive_control.plain_text_accepted, true);
  assert.equal(result.positive_control.algebraic_parameterization_accepted, true);
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.negative_control.inverted_ratio_rejected, true);
  assert.equal(result.negative_control.missing_square_root_rejected, true);
  assert.equal(result.normalization_scope, 'SYMBOLIC_SYNTACTIC_EQUIVALENCE_HARMONIC_OSCILLATOR');
  assert.equal(result.epistemic_status, 'QUALIFIED_SOURCE_FREE_SPECIMEN');
});

test('Atlas Qualification Battery: Full 9-Probe Integration & Access Parity', () => {
  const battery = runAtlasMathematicalQualificationBattery();
  assert.equal(battery.total_probes, 9);
  assert.equal(battery.positive_controls_passed, 9);
  assert.equal(battery.negative_controls_passed, 9);
  assert.equal(battery.fully_qualified_specimens, 9);
  assert.equal(battery.all_probes_passed, true);
  assert.equal(battery.access_parity_contract.unearned_literature_priors_injected, false);
  assert.equal(battery.access_parity_contract.blindness_boundary_preserved, true);
  assert.match(battery.disposition, /ATLAS_MATHEMATICAL_SPECIMENS_QUALIFIED_SOURCE_FREE/);
});
