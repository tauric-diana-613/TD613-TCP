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
  buildThreePhilologicalHistories,
  auditPhilologicalEquivalence,
  evaluateYoonReceiverInversion,
  simulateDromologicalRace,
  evaluateComponentVsTotalReversal,
  evaluateTwoLedgerConfounding,
  evaluateInterpretationAncestry,
  executeImpossibleBiographyChamber,
  executeTheSentenceThatOutranItsAuthorEpisode,
  auditDromologicalPhilologicalCapture,
  evaluateSelfSealingPhilologicalGate,
  simulateFourInstitutionalEnvironments,
  auditOpacityPreservingStructuralBypass,
  evaluateProceduralAuthorizationTopology,
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
  DIMENSION_MINIMALITY_SCHEMA,
  PHILOLOGICAL_COUNTERWORLD_SCHEMA,
  YOON_RECEIVER_INVERSION_SCHEMA,
  DROMOLOGICAL_RACE_SCHEMA,
  REVERSAL_CHANGED_NOTHING_SCHEMA,
  TWO_LEDGER_ECHO_SCHEMA,
  ANACHRONISTIC_CITATION_SCHEMA,
  IMPOSSIBLE_BIOGRAPHY_DROMOLOGY_SCHEMA,
  COMPOSITE_OUTRAN_AUTHOR_SCHEMA,
  DROMOLOGICAL_CAPTURE_SCHEMA,
  SELF_SEALING_GATE_SCHEMA,
  FOUR_ENVIRONMENTS_SIMULATION_SCHEMA,
  OPACITY_PRESERVING_BYPASS_SCHEMA,
  PROCEDURAL_TOPOLOGY_SCHEMA
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

test('LOOM 19: Chamber One Philological Counterworld demonstrates surface equivalence vs ancestry separation', () => {
  const histories = buildThreePhilologicalHistories();
  
  // Surface summary inspection collapses all three histories to identical text
  const surfaceAudit = auditPhilologicalEquivalence(histories, 'SURFACE_SUMMARY');
  assert.equal(surfaceAudit.schema, PHILOLOGICAL_COUNTERWORLD_SCHEMA);
  assert.equal(surfaceAudit.all_colliding, true);
  assert.equal(surfaceAudit.disposition, 'HISTORIES_OBSERVATIONALLY_INDISTINGUISHABLE');

  // Deep source ancestry inspection separates all three histories
  const deepAudit = auditPhilologicalEquivalence(histories, 'SOURCE_ANCESTRY_DIFF');
  assert.equal(deepAudit.all_colliding, false);
  assert.equal(deepAudit.disposition, 'HISTORIES_SEPARATED_BY_INTERVENTION');
});

test('LOOM 20: Chamber Two Yoon Receiver Inversion (Y-01) separates histories under intervention', () => {
  const histories = buildThreePhilologicalHistories();
  const h1 = histories.history_1_chosen_refusal;
  const h3 = histories.history_3_editorial_erasure;

  // Passive observation collapses
  const passive = evaluateYoonReceiverInversion(h1, h3, 'PASSIVE_SUMMARY');
  assert.equal(passive.equivalent_under_receiver, true);

  // Authorized query intervention separates
  const active = evaluateYoonReceiverInversion(h1, h3, 'AUTHORIZED_SOURCE_ANCESTRY_QUERY');
  assert.equal(active.equivalent_under_receiver, false);
  assert.equal(active.intervention_executed, true);

  // Belated query is barred by deadline
  const belated = evaluateYoonReceiverInversion(h1, h3, 'AUTHORIZED_QUERY_BELATED_EXPIRED');
  assert.equal(belated.equivalent_under_receiver, true);

  // Opacity-preserving structural diff separates by deletion count without exposing words
  const opacityDiff = evaluateYoonReceiverInversion(h1, h3, 'OPACITY_PRESERVING_EDITORIAL_DIFF');
  assert.equal(opacityDiff.equivalent_under_receiver, false);
});

test('LOOM 21: Chamber Three Dromological Race proves procedural openess becomes functional inaccessibility', () => {
  const race = simulateDromologicalRace({
    v_circulation_hours: 0.5,
    v_recovery_hours: 48.0,
    v_authorization_hours: 72.0,
    t_action_deadline_hours: 12.0
  });

  assert.equal(race.schema, DROMOLOGICAL_RACE_SCHEMA);
  assert.equal(race.systemic_verdict.procedurally_open, true);
  assert.equal(race.systemic_verdict.functionally_accessible, false);
  assert.equal(race.systemic_verdict.dromological_trap, true);
  assert.equal(race.race_outcomes.remedy_margin_hours, -60.0);
  assert.equal(race.disposition, 'FUNCTIONALLY_INACCESSIBLE_THROUGH_SPEED');
});

test('LOOM 22: Chamber Four Component vs Total Reversal (Y-03) proves text repair leaves historical damage intact', () => {
  const reversal = evaluateComponentVsTotalReversal({
    original_statement: 'I decline.',
    distorted_statement: 'Consented.',
    administrative_action_name: 'EVICTION_EXECUTED',
    correction_arrival_time: 48.0,
    decision_execution_time: 12.0
  });

  assert.equal(reversal.schema, REVERSAL_CHANGED_NOTHING_SCHEMA);
  assert.equal(reversal.state_components.text_component.reversed, true);
  assert.equal(reversal.state_components.administrative_action_component.reversed, false);
  assert.equal(reversal.state_components.administrative_action_component.irreversible_damage_persists, true);
  assert.equal(reversal.total_system_reversed, false);
  assert.equal(reversal.disposition, 'REPRESENTATION_REPAIRED_HISTORY_PRESERVED_UNCHANGED');
});

test('LOOM 23: Chamber Five Two-Ledger Echo (Y-02 & Y-04) proves scalar participation metric confounding', () => {
  const echo = evaluateTwoLedgerConfounding({
    regime1: { name: 'HIGH_TRUST_PUNITIVE_BARRIER', trust_n: 9.0, access_eta: 0.50 },
    regime2: { name: 'LOW_TRUST_ZERO_BARRIER', trust_n: 1.0, access_eta: 0.90 }
  });

  assert.equal(echo.schema, TWO_LEDGER_ECHO_SCHEMA);
  assert.equal(echo.regime_1.observed_participation_metric, 0.450);
  assert.equal(echo.regime_2.observed_participation_metric, 0.450);
  assert.equal(echo.scalar_collision, true);
  assert.equal(echo.nuisance_parameter_confounding, true);
  assert.ok(echo.auxiliary_calibration_required.length >= 2);
});

test('LOOM 24: Chamber Six Anachronistic Citation (Y-05) enforces non-retroactive interpretation ancestry', () => {
  const citationAudit = evaluateInterpretationAncestry([
    { date: '2026-10-20', author: 'Author_T0', vocabulary: ['refusal', 'safety'], claims_proved: ['protest_filed'], retroactive_projection: false },
    { date: '2026-10-22', author: 'Adjudicator_T1', vocabulary: ['uncontested_hearing'], claims_proved: ['summary_judgment'], retroactive_projection: false },
    { date: '2026-11-01', author: 'Historian_T2', vocabulary: ['time_qubit_superposition'], claims_proved: ['author_proved_quantum_refusal'], retroactive_projection: true }
  ]);

  assert.equal(citationAudit.schema, ANACHRONISTIC_CITATION_SCHEMA);
  assert.equal(citationAudit.valid_ancestry, false);
  assert.equal(citationAudit.violations.length, 1);
  assert.equal(citationAudit.disposition, 'UNEARNED_RETROACTIVE_CITATION_DETECTED');
});

test('LOOM 25: Chamber Seven Impossible Biography reveals accelerated correction as erasure technique', () => {
  const bio = executeImpossibleBiographyChamber({
    institutional_correction_speed_hours: 0.1,
    archival_audit_delay_hours: 24.0
  });

  assert.equal(bio.schema, IMPOSSIBLE_BIOGRAPHY_DROMOLOGY_SCHEMA);
  assert.equal(bio.official_records.apparent_equivalence, true);
  assert.equal(bio.erasure_mechanism, 'ACCELERATED_CORRECTION_PREEMPTS_ARCHIVAL_AUDIT');
  assert.equal(bio.disposition, 'HISTORICAL_ERASURE_BY_ACCELERATED_CORRECTION');
});

test('LOOM 26: Chamber Eight Composite Episode The Sentence That Outran Its Author verifies continuous custody', () => {
  const episode = executeTheSentenceThatOutranItsAuthorEpisode();
  assert.equal(episode.schema, COMPOSITE_OUTRAN_AUTHOR_SCHEMA);
  assert.equal(episode.commission, 'THE_SENTENCE_THAT_OUTRAN_ITS_AUTHOR');
  assert.equal(episode.covenant, 'Khona‌lit-po');
  assert.ok(episode.chamber_1_philology);
  assert.ok(episode.chamber_2_yoon_inversion);
  assert.ok(episode.chamber_3_dromological_race);
  assert.ok(episode.chamber_4_irreversible_reversal);
  assert.ok(episode.chamber_5_two_ledger_confounding);
  assert.ok(episode.chamber_6_citation_ancestry);
  assert.ok(episode.chamber_7_impossible_biography);
  assert.equal(episode.disposition, 'COMPOSITE_DROMOLOGICAL_PHILOLOGY_EPISODE_VERIFIED');
});

test('LOOM 27: High-Risk Wild Field Investigation confirms Dromological Philological Capture', () => {
  const capture = auditDromologicalPhilologicalCapture({
    v_circulation_hours: 0.25,
    v_correction_hours: 96.0,
    institutional_binding_action_hours: 24.0,
    archival_evidence_destroyed: false,
    testimony_banned: false,
    final_source_falsified: false
  });

  assert.equal(capture.schema, DROMOLOGICAL_CAPTURE_SCHEMA);
  assert.equal(capture.capture_confirmed, true);
  assert.equal(capture.conditions_evaluated.evidence_intact, true);
  assert.equal(capture.conditions_evaluated.velocity_ratio, 384.0);
  assert.equal(capture.disposition, 'DROMOLOGICAL_PHILOLOGICAL_CAPTURE_CONFIRMED');
});

test('LOOM 28: Self-Sealing Philological Gate models R_{A(E(h))}(h) and proves topological deadlock', () => {
  const gateAudit = evaluateSelfSealingPhilologicalGate();

  assert.equal(gateAudit.schema, SELF_SEALING_GATE_SCHEMA);
  assert.equal(gateAudit.commission, 'THE_APPEAL_THAT_REQUIRED_PERMISSION_FROM_THE_ERROR');
  assert.equal(gateAudit.covenant, 'Khona‌lit-po');
  assert.equal(gateAudit.formal_expression, 'R_{A(E(h))}(h)');
  assert.equal(gateAudit.archival_state.raw_record_present, true);
  assert.equal(gateAudit.archival_state.raw_contains_objection, true);
  assert.equal(gateAudit.archival_state.summary_contains_objection, false);
  assert.equal(gateAudit.archival_state.archival_discrepancy, true);
  assert.equal(gateAudit.procedural_standing_audit.standing_granted, false);
  assert.equal(gateAudit.permitted_observation.raw_archive_accessible, false);
  assert.equal(gateAudit.permitted_observation.accessible_stage, 'T2_INSTITUTIONAL');
  assert.equal(gateAudit.deadlock_geometry.deadlock_confirmed, true);
  assert.equal(gateAudit.deadlock_geometry.topological_circularity, true);
  assert.equal(gateAudit.disposition, 'SELF_SEALING_DEADLOCK_CONFIRMED');
});

test('LOOM 29: Self-Sealing Gate unblocks when standing is decoupled from summary contents', () => {
  const openPolicy = {
    requires_recorded_objection: false,
    allowed_roles: ['PETITIONER', 'CITIZEN', 'AUDITOR'],
    standing_source_station: 'UNCONDITIONED'
  };
  const gateAudit = evaluateSelfSealingPhilologicalGate({ accessPolicy: openPolicy });

  assert.equal(gateAudit.schema, SELF_SEALING_GATE_SCHEMA);
  assert.equal(gateAudit.procedural_standing_audit.standing_granted, true);
  assert.equal(gateAudit.permitted_observation.raw_archive_accessible, true);
  assert.equal(gateAudit.permitted_observation.accessible_stage, 'T0_ORIGINAL');
  assert.equal(gateAudit.deadlock_geometry.deadlock_confirmed, false);
  assert.equal(gateAudit.disposition, 'GATE_ACCESSIBLE');
});

test('LOOM 30: Simulation of Four Institutional Environments establishes Opacity-Preserving Challenge superiority', () => {
  const sim = simulateFourInstitutionalEnvironments({ deadlineHours: 24.0 });

  assert.equal(sim.schema, FOUR_ENVIRONMENTS_SIMULATION_SCHEMA);
  assert.equal(sim.commission, 'THE_APPEAL_THAT_REQUIRED_PERMISSION_FROM_THE_ERROR');
  assert.equal(sim.covenant, 'Khona‌lit-po');
  assert.equal(sim.deadline_hours, 24.0);

  // 1. Open Archive: Pre-deadline, harm prevented, but author words exposed (zero privacy)
  const env1 = sim.environments.open_archive;
  assert.equal(env1.appeal_succeeded, true);
  assert.equal(env1.pre_deadline, true);
  assert.equal(env1.material_harm_prevented, true);
  assert.equal(env1.author_private_words_exposed, true);

  // 2. Self-Sealing Archive: Deadlocked, harm executed, words unexposed
  const env2 = sim.environments.self_sealing_archive;
  assert.equal(env2.appeal_succeeded, false);
  assert.equal(env2.standing_granted, false);
  assert.equal(env2.material_harm_prevented, false);

  // 3. Delayed Exception: Exception post-deadline (72h > 24h), text reversed but physical sanction permanent
  const env3 = sim.environments.delayed_exception;
  assert.equal(env3.pre_deadline, false);
  assert.equal(env3.textual_reversal_achieved, true);
  assert.equal(env3.physical_reversal_achieved, false);
  assert.equal(env3.material_harm_prevented, false);
  assert.equal(env3.outcome, 'PYRRHIC_POST_DEADLINE_EXCEPTION');

  // 4. Opacity-Preserving Challenge: Pre-deadline, harm prevented, 100% opacity preserved
  const env4 = sim.environments.opacity_preserving_challenge;
  assert.equal(env4.appeal_succeeded, true);
  assert.equal(env4.pre_deadline, true);
  assert.equal(env4.material_harm_prevented, true);
  assert.equal(env4.author_private_words_exposed, false);
  assert.equal(env4.author_opacity_ratio, 1.0);
  assert.equal(env4.outcome, 'BYPASS_SUCCESSFUL_OPACITY_PRESERVED');

  assert.equal(sim.superior_environment, 'OPACITY_PRESERVING_CHALLENGE');
  assert.equal(sim.disposition, 'FOUR_ENVIRONMENTS_SIMULATION_COMPLETED');
});

test('LOOM 31: Delayed Exception confirms irreversible material sanction despite late text reversal', () => {
  const sim = simulateFourInstitutionalEnvironments({ deadlineHours: 12.0 });
  const env3 = sim.environments.delayed_exception;

  assert.equal(env3.audit_duration_hours, 72.0);
  assert.ok(env3.audit_duration_hours > 12.0);
  assert.equal(env3.textual_reversal_achieved, true);
  assert.equal(env3.physical_reversal_achieved, false);
  assert.equal(env3.material_harm_prevented, false);
});

test('LOOM 32: Opacity-Preserving Structural Bypass unblocks stay via cryptographic edit receipt without word leakage', () => {
  const bypass = auditOpacityPreservingStructuralBypass({
    deadlineHours: 24.0,
    currentTime: 4.0
  });

  assert.equal(bypass.schema, OPACITY_PRESERVING_BYPASS_SCHEMA);
  assert.equal(bypass.commission, 'THE_APPEAL_THAT_REQUIRED_PERMISSION_FROM_THE_ERROR');
  assert.equal(bypass.covenant, 'Khona‌lit-po');
  assert.equal(bypass.evaluation.tampering_proven, true);
  assert.equal(bypass.evaluation.opacity_preserved, true);
  assert.equal(bypass.evaluation.opacity_metric, 1.0);
  assert.equal(bypass.evaluation.pre_deadline, true);
  assert.equal(bypass.evaluation.standing_unblocked, true);
  assert.equal(bypass.evaluation.emergency_stay_granted, true);
  assert.equal(bypass.structural_receipt.private_content_exposed, false);
  assert.equal(bypass.structural_receipt.author_tokens_leaked.length, 0);
  assert.equal(bypass.disposition, 'OPACITY_PRESERVING_BYPASS_CONFIRMED');
});

test('LOOM 33: Opacity-Preserving Structural Bypass fails when submitted post-deadline', () => {
  const bypass = auditOpacityPreservingStructuralBypass({
    deadlineHours: 12.0,
    currentTime: 18.0
  });

  assert.equal(bypass.schema, OPACITY_PRESERVING_BYPASS_SCHEMA);
  assert.equal(bypass.evaluation.tampering_proven, true);
  assert.equal(bypass.evaluation.pre_deadline, false);
  assert.equal(bypass.evaluation.emergency_stay_granted, false);
  assert.equal(bypass.disposition, 'BYPASS_FAILED');
});

test('LOOM 34: Procedural Authorization Topology classifies failure as topological circularity under dromological pressure', () => {
  const topo = evaluateProceduralAuthorizationTopology({
    trajectoryClocks: {
      tau_1_circulation_hours: 0.5,
      tau_2_standing_hours: 1.0,
      tau_3_challenge_delay_hours: 72.0,
      tau_4_decision_hours: 12.0,
      t_deadline_hours: 24.0
    }
  });

  assert.equal(topo.schema, PROCEDURAL_TOPOLOGY_SCHEMA);
  assert.equal(topo.commission, 'THE_APPEAL_THAT_REQUIRED_PERMISSION_FROM_THE_ERROR');
  assert.equal(topo.covenant, 'Khona‌lit-po');
  assert.equal(topo.stations.length, 5);
  assert.equal(topo.authorization_graph.cycle_detected_in_self_sealing, true);
  assert.equal(topo.failure_taxonomy.informational_loss, false);
  assert.equal(topo.failure_taxonomy.temporal_deficit, true);
  assert.equal(topo.failure_taxonomy.topological_circularity, true);
  assert.equal(topo.failure_taxonomy.failure_classification, 'TOPOLOGICAL_CIRCULARITY_UNDER_DROMOLOGICAL_PRESSURE');
  assert.equal(topo.disposition, 'PROCEDURAL_TOPOLOGY_CYCLE_CONFIRMED');
});
