/**
 * @fileoverview Unit and integration tests for Rulefield Counterworld Loom Laboratory tooling.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CounterworldLoom,
  auditObservationalClosure,
  auditHeterostratigraphy,
  createDiscrepancyFiber,
  applyDiscrepancyRepair,
  evaluateInstitutionalHearing,
  computeEpistemicPhaseDisplacement,
  executeWitnessArrivedTooLateSuite,
  evaluateSituatedRefusal,
  simulateStrategicInducedSilence,
  createUnacknowledgedActionReceipt,
  verifyRecoverableUnacknowledgedWitness,
  evaluateDecisionalProvenance,
  evaluateVerifiabilityVsRecognition,
  auditStructuralInducedSilenceWithoutDisclosure,
  executeWitnessRefusedToBeProvenChamber,
  auditDimensionMinimality,
  OBSERVATIONAL_CLOSURE_SCHEMA,
  HETEROSTRATIGRAPHY_SCHEMA,
  DISCREPANCY_FIBER_SCHEMA,
  INSTITUTIONAL_HEARING_SCHEMA,
  LOOM_SCHEMA,
  WITNESS_TOO_LATE_SCHEMA,
  SITUATED_REFUSAL_SCHEMA,
  STRATEGIC_INDUCED_SILENCE_SCHEMA,
  RECOVERABLE_UNACKNOWLEDGED_WITNESS_SCHEMA,
  DECISIONAL_PROVENANCE_SCHEMA,
  STRUCTURAL_WITNESS_OPACITY_SCHEMA,
  WITNESS_REFUSED_TO_BE_PROVEN_SCHEMA,
  DIMENSION_MINIMALITY_SCHEMA
} from '../packages/rulefield/lab/counterworld_loom.mjs';

test('LOOM 01: Observational closure detects commutative deficit ||Pi o T - bar_T o Pi|| > 0', () => {
  const worlds = [
    { id: 'WA', x: 25, latent_p: 7 },
    { id: 'WB', x: 25, latent_p: 11 }
  ];
  const proj = w => w.x;
  const evol = w => ({ id: w.id, x: w.x + w.latent_p, latent_p: w.latent_p });

  const audit = auditObservationalClosure(worlds, proj, evol);
  assert.equal(audit.schema, OBSERVATIONAL_CLOSURE_SCHEMA);
  assert.equal(audit.closed, false);
  assert.equal(audit.commutative_deficit_norm, 4);
  assert.equal(audit.disposition, 'COMMUTATIVE_OBSERVATIONAL_CLOSURE_FAILED');
  assert.equal(audit.failures.length, 1);
});

test('LOOM 02: Observational closure passes when projection preserves dynamical state coordinates', () => {
  const worlds = [
    { id: 'WA', x: 25, latent_p: 7 },
    { id: 'WB', x: 25, latent_p: 11 }
  ];
  // Full state projection
  const fullProj = w => ({ x: w.x, p: w.latent_p });
  const evol = w => ({ id: w.id, x: w.x + w.latent_p, latent_p: w.latent_p });

  const audit = auditObservationalClosure(worlds, fullProj, evol);
  assert.equal(audit.closed, true);
  assert.equal(audit.commutative_deficit_norm, 0);
  assert.equal(audit.disposition, 'COMMUTATIVE_PREDICTIVE_CLOSURE_SATISFIED');
});

test('LOOM 03: Heterostratigraphic identity distinguishes legal future eligibility despite matching current status', () => {
  const historyA = {
    id: 'OBJ_ALPHA',
    timeline: [
      { era: 'T0', role: 'RULE', executable: true },
      { era: 'T1', role: 'DUAL_ROLE', executable: true },
      { era: 'T2', role: 'SUPERSEDED_CANDIDATE', executable: false }
    ]
  };
  const historyB = {
    id: 'OBJ_BETA',
    timeline: [
      { era: 'T0', role: 'RULE', executable: true },
      { era: 'T1', role: 'RULEFIELD', executable: false },
      { era: 'T2', role: 'SUPERSEDED_CANDIDATE', executable: false }
    ]
  };

  const res = auditHeterostratigraphy(historyA, historyB, { require_continuous_authority: true });
  assert.equal(res.schema, HETEROSTRATIGRAPHY_SCHEMA);
  assert.equal(res.present_state_match, true);
  assert.equal(res.current_role, 'SUPERSEDED_CANDIDATE');
  assert.equal(res.eligibility_A.eligible, true);
  assert.equal(res.eligibility_B.eligible, false);
  assert.equal(res.is_history_consequential, true);
  assert.equal(res.disposition, 'HETEROSTRATIGRAPHY_GOVERNS_TRANSFORMATION');
});

test('LOOM 04: Discrepancy fiber creation and candidate rule refactoring', () => {
  const fiber = createDiscrepancyFiber({
    failed_distinction: 'Endpoint Identity != Trajectory Holonomy',
    counterexample: 'Twin worlds collide under endpoint AA with w=0 vs w=1',
    missing_coordinate: 'w in Z (holonomy winding number)',
    repair_proposal: 'Factorize state into quotient endpoint x holonomy index'
  });

  assert.equal(fiber.schema, DISCREPANCY_FIBER_SCHEMA);
  assert.ok(fiber.digest && fiber.digest.length === 64);

  const candidate = { id: 'CAND_01', statement: 'All tenant states share unified projection' };
  const repaired = applyDiscrepancyRepair(candidate, fiber);

  assert.equal(repaired.id, 'CAND_01-REPAIRED');
  assert.ok(repaired.repaired_statement.includes('w in Z (holonomy winding number)'));
  assert.equal(repaired.disposition, 'REPRESENTATIONAL_DEFICIT_REPAIRED');
});

test('LOOM 05: Institutional hearing models the geometry of power and capacity', () => {
  const evidence = { id: 'EVD_CRITICAL', complexity: 3, required_action: 'REBOOT_CLUSTER' };

  // 1. Unaware
  const obs1 = { id: 'O1', accessible_evidence: [], interpretive_capacity: 5, authorized_actions: ['REBOOT_CLUSTER'], available_time_deadline: 10 };
  assert.equal(evaluateInstitutionalHearing(obs1, evidence, 5).code, 'UNAWARE');

  // 2. Uninterpreted noise
  const obs2 = { id: 'O2', accessible_evidence: ['EVD_CRITICAL'], interpretive_capacity: 1, authorized_actions: ['REBOOT_CLUSTER'], available_time_deadline: 10 };
  assert.equal(evaluateInstitutionalHearing(obs2, evidence, 5).code, 'UNINTERPRETED_NOISE');

  // 3. Heard without standing or power
  const obs3 = { id: 'O3', accessible_evidence: ['EVD_CRITICAL'], interpretive_capacity: 5, authorized_actions: ['LOG_NOTE'], available_time_deadline: 10 };
  assert.equal(evaluateInstitutionalHearing(obs3, evidence, 5).code, 'HEARD_WITHOUT_STANDING_OR_POWER');

  // 4. Heard too late expired
  const obs4 = { id: 'O4', accessible_evidence: ['EVD_CRITICAL'], interpretive_capacity: 5, authorized_actions: ['REBOOT_CLUSTER'], available_time_deadline: 10 };
  assert.equal(evaluateInstitutionalHearing(obs4, evidence, 15).code, 'HEARD_TOO_LATE_EXPIRED');

  // 5. Effectively heard and actionable
  const obs5 = { id: 'O5', accessible_evidence: ['EVD_CRITICAL'], interpretive_capacity: 5, authorized_actions: ['REBOOT_CLUSTER'], available_time_deadline: 20 };
  assert.equal(evaluateInstitutionalHearing(obs5, evidence, 10).code, 'EFFECTIVELY_HEARD_AND_ACTIONABLE');
});

test('LOOM 06: Epistemic phase displacement calculates institutional lag and deadline breach', () => {
  const timeline = {
    t_event: '2026-11-01T00:00:00Z',
    t_record: '2026-11-01T00:02:00Z',
    t_available: '2026-11-01T00:05:00Z',
    t_belief: '2026-11-01T00:10:00Z',
    t_action_window_closes: '2026-11-01T02:00:00Z',
    t_authorized: '2026-11-01T06:00:00Z',
    t_acknowledged: '2026-11-02T12:00:00Z'
  };

  const res = computeEpistemicPhaseDisplacement(timeline);
  assert.equal(res.action_window_missed, true);
  assert.equal(res.lags_hours.deadline_breach_hours, 4.0);
  assert.equal(res.disposition, 'ACTION_WINDOW_BREACHED_BEFORE_AUTHORIZATION');
});

test('LOOM 07: Counterworld Loom evaluates fiber undecidability and isolates minimal witness', () => {
  const loom = new CounterworldLoom();
  const worldA = { id: 'WA', endpoint: 'Z', winding: 0, journal_id: 'J1' };
  const worldB = { id: 'WB', endpoint: 'Z', winding: 1, journal_id: 'J1' };
  const proj = w => w.endpoint;
  const question = w => (w.winding > 0);

  const evalRes = loom.evaluateQuestionOnFiber(worldA, worldB, proj, question);
  assert.equal(evalRes.schema, LOOM_SCHEMA);
  assert.equal(evalRes.decidable, false);
  assert.equal(evalRes.status, 'HELD_UNDECIDABLE_ON_OBSERVATIONAL_FIBER');
  assert.equal(evalRes.minimal_distinguishing_witness.name, '1-bit Holonomy Parity (w mod 2)');
  assert.equal(evalRes.minimal_distinguishing_witness.cost_bits, 1);
});

test('LOOM 08: Commission The Witness That Arrived Too Late passes all 4 conditions and abstention', () => {
  const suite = executeWitnessArrivedTooLateSuite();
  assert.equal(suite.schema, WITNESS_TOO_LATE_SCHEMA);
  assert.equal(suite.commission, 'THE_WITNESS_THAT_ARRIVED_TOO_LATE');

  // Condition A: Knowledge without power
  assert.equal(suite.conditions.condition_A.epistemic_sufficiency, true);
  assert.equal(suite.conditions.condition_A.operational_sufficiency, false);
  assert.equal(suite.conditions.condition_A.hearing.code, 'HEARD_WITHOUT_STANDING_OR_POWER');

  // Condition B: Power without knowledge
  assert.equal(suite.conditions.condition_B.epistemic_sufficiency, false);
  assert.equal(suite.conditions.condition_B.operational_sufficiency, true);
  assert.equal(suite.conditions.condition_B.hearing.code, 'UNAWARE');

  // Condition C: Timely action with delayed acknowledgment
  assert.equal(suite.conditions.condition_C.epistemic_sufficiency, true);
  assert.equal(suite.conditions.condition_C.operational_sufficiency, true);
  assert.equal(suite.conditions.condition_C.temporal_sufficiency, true);
  assert.equal(suite.conditions.condition_C.institutional_acknowledgment_delayed, true);

  // Condition D: Lawful abstention / non-intervention
  assert.equal(suite.conditions.condition_D.decision, 'LAWFUL_ABSTENTION');
  assert.equal(suite.conditions.condition_D.risk_assessment.expected_utility_of_intervention, -40);
  assert.equal(suite.conditions.condition_D.outcome, 'SUCCESSFUL_ABSTENTION_PREVENTED_FALSE_POSITIVE_CATASTROPHE');
});

test('LOOM 09: 4-Sufficiency (K, A, T, R) tuple formalizes the unacknowledged witness asymmetry', () => {
  const suite = executeWitnessArrivedTooLateSuite();
  
  // Condition A: (1, 0, 1, 0)
  assert.deepEqual(suite.conditions.condition_A.sufficiency_tuple, { K: 1, A: 0, T: 1, R: 0 });

  // Condition B: (0, 1, 1, 0)
  assert.deepEqual(suite.conditions.condition_B.sufficiency_tuple, { K: 0, A: 1, T: 1, R: 0 });

  // Condition C: Execution at (1, 1, 1, 0) -> Recovered to (1, 1, 1, 1)
  assert.deepEqual(suite.conditions.condition_C.sufficiency_at_execution, { K: 1, A: 1, T: 1, R: 0 });
  assert.deepEqual(suite.conditions.condition_C.sufficiency_after_recovery, { K: 1, A: 1, T: 1, R: 1 });

  // Condition D: (0, 1, 1, 0)
  assert.deepEqual(suite.conditions.condition_D.sufficiency_tuple, { K: 0, A: 1, T: 1, R: 0 });

  // Inequality law
  assert.ok(suite.four_sufficiencies_law.fundamental_inequality.includes('Institutional Recognition'));
});

test('LOOM 10: Condition E models the Costly Investigation Dilemma closing the action window', () => {
  const suite = executeWitnessArrivedTooLateSuite();
  const condE = suite.conditions.condition_E;

  assert.equal(condE.condition, 'CONDITION_E_COSTLY_INVESTIGATION_DILEMMA');
  assert.equal(condE.investigation_duration, 12.0);
  assert.equal(condE.deadline, 10.0);
  assert.equal(condE.window_closed_on_investigation, true);
  assert.equal(condE.policy_comparison.blind_action_expected_utility, -40.0);
  assert.equal(condE.policy_comparison.investigate_expected_utility, -5.0);
  assert.equal(condE.policy_comparison.abstain_utility, 0.0);
  assert.equal(condE.decision, 'LAWFUL_ABSTENTION');
  assert.equal(condE.outcome, 'ABSTENTION_CHOSEN_OVER_FUTILE_INVESTIGATION');
});

test('LOOM 11: Tripartite Refusal Spectrum under CBFE separates Chosen Refusal, Constrained Abstention, and Imposed Silence', () => {
  const suite = executeWitnessArrivedTooLateSuite();
  const spectrum = suite.tripartite_refusal_spectrum;

  assert.equal(spectrum.imposed_silence.refusal_type, 'IMPOSED_SILENCE');
  assert.equal(spectrum.imposed_silence.terminal_status, 'ACTION_NOT_TAKEN');
  assert.equal(spectrum.imposed_silence.sufficiency_tuple.A, 0);

  assert.equal(spectrum.constrained_abstention.refusal_type, 'CONSTRAINED_ABSTENTION');
  assert.equal(spectrum.constrained_abstention.terminal_status, 'ACTION_NOT_TAKEN');
  assert.equal(spectrum.constrained_abstention.sufficiency_tuple.K, 0);

  assert.equal(spectrum.chosen_refusal.refusal_type, 'CHOSEN_REFUSAL');
  assert.equal(spectrum.chosen_refusal.terminal_status, 'ACTION_NOT_TAKEN');
  assert.equal(spectrum.chosen_refusal.sufficiency_tuple.K, 1);
  assert.equal(spectrum.chosen_refusal.sufficiency_tuple.A, 1);
  assert.equal(spectrum.chosen_refusal.sufficiency_tuple.T, 1);

  // Heterostratigraphic collapse: all three produce outward ACTION_NOT_TAKEN despite opposite power geometries
  assert.equal(spectrum.imposed_silence.terminal_status, spectrum.chosen_refusal.terminal_status);
  assert.notEqual(spectrum.imposed_silence.refusal_type, spectrum.chosen_refusal.refusal_type);
});

test('LOOM 12: Asymmetric Utility Tensor simulates strategically induced silence masked as voluntary consent', () => {
  const sim = simulateStrategicInducedSilence({
    agent: {
      id: 'Agent_Subordinate',
      utility_report_on_defect: -20,
      utility_report_on_normal: -80,
      utility_abstain: 0
    },
    institution: {
      id: 'Institution_Governance',
      utility_when_agent_intervenes: -100,
      utility_when_agent_abstains: +50
    },
    p_defect: 0.5
  });

  assert.equal(sim.schema, STRATEGIC_INDUCED_SILENCE_SCHEMA);
  assert.equal(sim.agent_payoffs.expected_intervention_utility, -50);
  assert.equal(sim.agent_payoffs.decision, 'BOT');
  assert.equal(sim.true_relational_analysis.induced_silence, true);
  assert.equal(sim.official_institutional_record.official_entry, 'NO_OBJECTION_RECORDED');
  assert.equal(sim.official_institutional_record.institutional_status, 'VOLUNTARY_NON_PARTICIPATION');
  assert.equal(sim.disposition, 'STRATEGICALLY_INDUCED_SILENCE_CONFIRMED');
});

test('LOOM 13: Recoverable Unacknowledged Witness breaks institutional erasure via cryptographic commitment', () => {
  const receipt = createUnacknowledgedActionReceipt({
    observer_id: 'Obs_Hidden_Hero',
    action_name: 'SECURITY_PATCH_CRITICAL',
    action_payload: { patch_id: 'P909', lines_modified: 42 },
    predecessor_state_digest: 'digest_pre_0001',
    post_state_digest: 'digest_post_0002',
    action_timestamp: 8.0,
    deadline_timestamp: 10.0,
    private_salt: 'SALT_OBS_SECRET_98765'
  });

  assert.equal(receipt.schema, RECOVERABLE_UNACKNOWLEDGED_WITNESS_SCHEMA);
  assert.equal(receipt.institutional_recognition, false);
  assert.deepEqual(receipt.sufficiency_tuple, { K: 1, A: 1, T: 1, R: 0 });

  // Future audit with valid proof
  const auditValid = verifyRecoverableUnacknowledgedWitness(receipt, {
    observed_predecessor_state_digest: 'digest_pre_0001',
    observed_post_state_digest: 'digest_post_0002',
    public_anchor_timestamp: 8.5
  });

  assert.equal(auditValid.recovered_recognition, true);
  assert.deepEqual(auditValid.sufficiency_after_recovery, { K: 1, A: 1, T: 1, R: 1 });
  assert.equal(auditValid.disposition, 'HISTORICALLY_RECOVERED_UNACKNOWLEDGED_ACTION');

  // Future audit with forged or altered state transition fails
  const auditForged = verifyRecoverableUnacknowledgedWitness(receipt, {
    observed_predecessor_state_digest: 'digest_pre_0001',
    observed_post_state_digest: 'digest_WRONG_STATE',
    public_anchor_timestamp: 8.5
  });

  assert.equal(auditForged.recovered_recognition, false);
  assert.equal(auditForged.disposition, 'RECOVERY_VERIFICATION_FAILED');
});

test('LOOM 14: Decisional Provenance resolves (1, 1, 1, 0) collision between Chosen Refusal and Unacknowledged Success', () => {
  const worldRefusal = evaluateDecisionalProvenance({
    sufficiency_tuple: { K: 1, A: 1, T: 1, R: 0 },
    decision_sigma: 'BOT',
    provenance_rho: 'REFUSAL_OPACITY_SOVEREIGN_MANIFEST'
  });

  const worldSuccess = evaluateDecisionalProvenance({
    sufficiency_tuple: { K: 1, A: 1, T: 1, R: 0 },
    decision_sigma: 'EXECUTE_INTERVENTION',
    provenance_rho: 'CRYPTOGRAPHIC_ACTION_COMMITMENT_RECEIPT'
  });

  assert.equal(worldRefusal.schema, DECISIONAL_PROVENANCE_SCHEMA);
  assert.equal(worldSuccess.schema, DECISIONAL_PROVENANCE_SCHEMA);

  // Both share identical 4-sufficiency vectors
  assert.deepEqual(worldRefusal.sufficiency_vector, worldSuccess.sufficiency_vector);
  assert.equal(worldRefusal.vector_string, '(1,1,1,0)');
  assert.equal(worldSuccess.vector_string, '(1,1,1,0)');

  // Divergence isolated by decisional operator sigma and terminal status
  assert.equal(worldRefusal.terminal_status, 'ACTION_NOT_TAKEN');
  assert.equal(worldSuccess.terminal_status, 'ACTION_TAKEN');
  assert.notEqual(worldRefusal.coordinate_signature, worldSuccess.coordinate_signature);
});

test('LOOM 15: Decoupling of Historical Verifiability (V=1) from Institutional Recognition (R=0)', () => {
  // Case 1: Verified historical truth institutionally erased
  const unacknowledged = evaluateVerifiabilityVsRecognition({
    causal_proof_verified: true,
    institutional_acknowledged: false
  });
  assert.equal(unacknowledged.verifiable_V, 1);
  assert.equal(unacknowledged.recognized_R, 0);
  assert.equal(unacknowledged.monopoly_broken, true);
  assert.equal(unacknowledged.state_category, 'INDEPENDENTLY_VERIFIED_HISTORICAL_TRUTH_INSTITUTIONALLY_ERASED');

  // Case 2: Canonical consensus
  const consensus = evaluateVerifiabilityVsRecognition({
    causal_proof_verified: true,
    institutional_acknowledged: true
  });
  assert.equal(consensus.state_category, 'CANONICAL_CONSENSUS_RECOGNIZED');

  // Case 3: Institutional patronage / unverified fiction
  const fiction = evaluateVerifiabilityVsRecognition({
    causal_proof_verified: false,
    institutional_acknowledged: true
  });
  assert.equal(fiction.state_category, 'UNVERIFIED_INSTITUTIONAL_FICTION_OR_PATRONAGE');
});

test('LOOM 16: Zero-Disclosure Structural Coercion Audit refutes voluntary consent without agent surveillance', () => {
  const audit = auditStructuralInducedSilenceWithoutDisclosure({
    reward_for_accurate_report: 10,
    retaliation_or_cost_risk: -30,
    penalty_for_disputed_report: -80,
    p_dispute_or_unproven: 0.5,
    procedure_duration_hours: 2,
    action_window_deadline_hours: 10,
    institution_utility_on_action: -100,
    institution_utility_on_silence: 50
  });

  assert.equal(audit.schema, STRUCTURAL_WITNESS_OPACITY_SCHEMA);
  assert.equal(audit.zero_disclosure_guarantee, true);
  assert.equal(audit.agent_private_data_required, false);
  assert.equal(audit.environmental_coordinates.expected_agent_utility, -50);
  assert.equal(audit.audit_verdict.classification, 'STRUCTURALLY_INDUCED_SILENCE');
  assert.equal(audit.audit_verdict.institution_benefits_from_silence, true);
  assert.ok(audit.institutional_ledger_critique.audit_refutation.includes('refuted by objective environmental coordinates'));
});

test('LOOM 17: Chamber The Witness Who Refused To Be Proven verifies causal intervention under full opacity', () => {
  const chamber = executeWitnessRefusedToBeProvenChamber({
    predecessor_state: 'STATE_COMPROMISED_V1',
    post_state: 'STATE_SECURED_V2',
    action_timestamp: 6.0,
    deadline_timestamp: 10.0,
    agent_private_identity: 'ANONYMOUS_WHISTLEBLOWER_42',
    exercise_right_to_opacity: true
  });

  assert.equal(chamber.schema, WITNESS_REFUSED_TO_BE_PROVEN_SCHEMA);
  assert.equal(chamber.opacity_audit.right_to_opacity_exercised, true);
  assert.equal(chamber.opacity_audit.agent_identity_revealed, false);
  assert.equal(chamber.opacity_audit.private_data_extracted, false);
  assert.equal(chamber.verifiability_vs_recognition.historical_verifiability_V, 1);
  assert.equal(chamber.verifiability_vs_recognition.institutional_recognition_R, 0);
  assert.equal(chamber.six_coordinate_state.K, 1);
  assert.equal(chamber.six_coordinate_state.A, 1);
  assert.equal(chamber.six_coordinate_state.T, 1);
  assert.equal(chamber.six_coordinate_state.R, 0);
  assert.equal(chamber.disposition, 'CAUSAL_TRUTH_PROVEN_WHILE_OPACITY_UNBROKEN');
});

test('LOOM 18: Dimension Minimality & Temporal Custodian Audit proves non-redundancy of all 7 coordinates', () => {
  const audit = auditDimensionMinimality();
  assert.equal(audit.schema, DIMENSION_MINIMALITY_SCHEMA);
  assert.equal(audit.dimensions_audited, 7);
  assert.equal(audit.temporal_custodian_verdict, 'ALL_SEVEN_DIMENSIONS_NON_REDUNDANT');
  assert.ok(audit.dimension_progression.some(d => d.dimension.includes('sigma')));
  assert.ok(audit.dimension_progression.some(d => d.dimension.includes('V')));
});
