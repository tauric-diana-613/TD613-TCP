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

test('Atlas Qualification A-01: Future-Response Separation', () => {
  const result = probeA01_FutureResponseSeparation();
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.t0_equivalent, true);
  assert.equal(result.positive_control.t1_distinguishable, true);
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.negative_control.true_congruence_maintained, true);
  assert.equal(result.epistemic_status, 'QUALIFIED_SOURCE_FREE_SPECIMEN');
});

test('Atlas Qualification A-02: Higher-Order Parity Discrimination', () => {
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

test('Atlas Qualification A-03: GHZ± Local Unreadability vs Global Stabilizer', () => {
  const result = probeA03_GHZPhaseAndLocality();
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.reduced_2qubit_identical, true);
  assert.equal(result.positive_control.reduced_1qubit_identical, true);
  assert.equal(result.positive_control.global_eigenvalue_plus, 1);
  assert.equal(result.positive_control.global_eigenvalue_minus, -1);
  assert.equal(result.positive_control.global_distinguishable, true);
  assert.equal(result.positive_control.qec_distance, 1);
  assert.equal(result.positive_control.qec_unjustified_claim_rejected, true);
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.epistemic_status, 'QUALIFIED_SOURCE_FREE_SPECIMEN');
});

test('Atlas Qualification A-04: F31 Modular Rank vs Real Jacobi SVD Conditioning', () => {
  const result = probeA04_F31RankVsRealSVD();
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.f31_rank, 2);
  assert.equal(result.positive_control.f31_nullity, 2);
  assert.equal(result.positive_control.svd_refusal_caught, true);
  assert.equal(result.positive_control.real_svd_condition_number, 2.0);
  assert.equal(result.negative_control.passed, true);
  assert.equal(result.negative_control.refusal_reason, 'FINITE_FIELD_SVD_REFUSED');
  assert.equal(result.epistemic_status, 'QUALIFIED_SOURCE_FREE_SPECIMEN');
});

test('Atlas Qualification A-05: Representation Causal Control & Label Sieve', () => {
  const result = probeA05_RepresentationCausalControl();
  assert.equal(result.positive_control.passed, true);
  assert.equal(result.positive_control.legitimate_morphism_detected, true);
  assert.equal(result.positive_control.spurious_nominal_coupling_rejected, true);
  assert.equal(result.negative_control.passed, true);
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
