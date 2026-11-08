#!/usr/bin/env node

/**
 * @fileoverview TD613 Rulefield Counterworld Loom CLI runner.
 *
 * Usage:
 *   node scripts/rulefield-loom.mjs [command]
 *
 * Commands:
 *   witness-too-late   Execute 'The Witness That Arrived Too Late' experimental suite
 *   suite              Execute full five-engine composition suite
 *   help               Show help message
 */

import {
  CounterworldLoom,
  executeWitnessArrivedTooLateSuite,
  auditObservationalClosure,
  auditHeterostratigraphy,
  createDiscrepancyFiber,
  applyDiscrepancyRepair,
  evaluateInstitutionalHearing,
  computeEpistemicPhaseDisplacement,
  executeWitnessRefusedToBeProvenChamber,
  auditStructuralInducedSilenceWithoutDisclosure,
  auditDimensionMinimality,
  buildThreePhilologicalHistories,
  auditPhilologicalEquivalence,
  executeTheSentenceThatOutranItsAuthorEpisode,
  auditDromologicalPhilologicalCapture,
  evaluateSelfSealingPhilologicalGate,
  simulateFourInstitutionalEnvironments,
  auditOpacityPreservingStructuralBypass,
  evaluateProceduralAuthorizationTopology,
  buildFiveCounterworlds,
  evaluateFiveCounterworlds,
  evaluatePhilologicalProofLattice,
  simulateAdaptiveInstitutionGame,
  evaluateJurisdictionalBootstrap,
  executeFinalAdaptiveExperiment,
  buildTwoCertifiedWorlds,
  auditTwoCertifiedWorldsDiscrimination,
  evaluateDataProcessingComposition,
  evaluateExteriorityChallenge,
  simulateThreeConditionsTrial,
  answerOperatorsQuestionOnWitnessIndependence,
  buildGraeberianCrosswalk,
  buildSemanticCounterworlds,
  auditSemanticExteriority,
  simulateAsymmetricInterpretiveLaborTrial,
  simulateDromologicalReadingExperiment,
  answerOperatorsQuestionOnEpistemicFailure,
  buildFourthOrderDiscoveryDocket,
  evaluateDecisionChannelLeakage,
  evaluateFourRemedyConditions,
  evaluateObserverRelativeChannels,
  evaluateReparativeInterventionEthics,
  answerOperatorsQuestionOnRemedyLeakage,
  evaluateAnticipatorySpeakerModel,
  buildTwoIdenticalAdministrativeRecords,
  evaluateInformationTheoreticParadox,
  evaluateGraeberDotsonInterpretiveLabor,
  simulateFeedbackRegimesTrial,
  auditObserversBlindSpot,
  answerOperatorsQuestionOnAnticipatoryDisappearance
} from '../packages/rulefield/lab/counterworld_loom.mjs';

function printHelp() {
  console.log(`
TD613 Rulefield Counterworld Loom Laboratory CLI
Usage: node scripts/rulefield-loom.mjs [command]

Commands:
  witness-too-late       Execute 'The Witness That Arrived Too Late' experimental suite
  refused-proven         Execute 'The Witness Who Refused To Be Proven' chamber
  structural-coercion    Execute zero-disclosure structural induced silence audit
  minimality             Audit dimension minimality & Temporal Custodian non-redundancy
  outran-author          Execute 'The Sentence That Outran Its Author' composite episode
  dromological-capture   Audit Dromological Philological Capture hypothesis
  philology              Audit Three Philological Histories under source ancestry diff
  self-sealing-gate      Audit Self-Sealing Philological Gate R_{A(E(h))}(h)
  four-environments      Simulate Four Institutional Environments under summary error
  opacity-bypass         Execute Opacity-Preserving Structural Bypass audit
  procedural-topology    Evaluate 5-station procedural authorization topology
  five-counterworlds     Evaluate Five Counterworlds (A through E) under lattice policy
  proof-lattice          Audit Philological Proof Lattice Levels 1 through 4
  adaptive-game          Simulate 3-round Adaptive Institution repeated game
  jurisdictional-boot    Evaluate Jurisdictional Bootstrap & External Constitutional Anchor
  final-adaptive         Execute Final Adaptive Experiment satisfying all 5 Section VI reqs
  two-certified-worlds   Audit Two Certified Worlds (W_alpha vs W_beta) discrimination failure
  data-processing        Evaluate Data Processing Inequality H -> E(H) -> N(E(H))
  exteriority-challenge  Audit Exteriority Challenge and multi-signer rank collapse
  three-conditions       Execute Three Conditions Trial (A vs B vs C) & portal counterexample
  witness-independence   Audit Operator's Question on what an independent witness must observe
  graeber-crosswalk      Display Graeberian Interpretive Labor Crosswalk (Graeber 2012)
  semantic-counterworlds Audit Semantic Counterworlds (W_alpha, W_beta, W_gamma) & P_L collision
  interpretive-labor     Execute Asymmetric Interpretive Labor Trial (Envs A, B, C)
  dromological-reading   Simulate Dromological Reading Experiment & extractive hearing danger
  epistemic-failure      Answer Operator's Question on location of epistemic failure
  fourth-order-docket    Build complete Fourth-Order Discovery Docket
  decision-leakage       Audit Decision-Channel Semantic Leakage I(Q; D) under deterministic policy
  four-remedies          Evaluate Four Remedy Conditions (A, B, C, D) & dromological dilemma
  observer-channels      Evaluate Observer-Relative Leakage Channels (Institution vs Public vs Author)
  reparative-ethics      Audit Reparative Intervention Ethics and speaker consent / unrequested stay
  stay-leakage-answer    Answer Operator's Question on how the stay testifies against its author
  anticipatory-speaker   Evaluate Anticipatory Speaker Decision Model U(F=1) vs U(F=0)
  identical-records      Audit Two Identical Administrative Records (World Alpha vs World Beta)
  information-paradox    Audit Information-Theoretic Paradox I(Q; D)=0 under complete suppression
  graeber-dotson         Display Graeber-Dotson Interpretive Labor Crosswalk & Nonparticipation Taxonomy
  feedback-experiment    Simulate Feedback Regimes Trial (Regimes A, B, C) & Campbell-Goodhart-Lucas Law
  observers-blindspot    Audit Observer's Blind Spot (Institutional Surface vs Ground Truth)
  anticipatory-answer    Answer Operator's Question on anticipatory disappearance
  suite                  Execute full five-engine composition suite
  help                   Show this help message
`);
}

async function main() {
  const cmd = (process.argv[2] || 'witness-too-late').toLowerCase();

  if (cmd === 'help' || cmd === '-h' || cmd === '--help') {
    printHelp();
    process.exit(0);
  }

  if (cmd === 'witness-too-late') {
    const report = executeWitnessArrivedTooLateSuite();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'refused-proven') {
    const report = executeWitnessRefusedToBeProvenChamber({
      predecessor_state: 'STATE_COMPROMISED_V1',
      post_state: 'STATE_SECURED_V2',
      action_timestamp: 6.0,
      deadline_timestamp: 10.0,
      agent_private_identity: 'ANONYMOUS_WHISTLEBLOWER_42',
      exercise_right_to_opacity: true
    });
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'structural-coercion') {
    const report = auditStructuralInducedSilenceWithoutDisclosure({
      reward_for_accurate_report: 10,
      retaliation_or_cost_risk: -30,
      penalty_for_disputed_report: -80,
      p_dispute_or_unproven: 0.5,
      procedure_duration_hours: 2,
      action_window_deadline_hours: 10,
      institution_utility_on_action: -100,
      institution_utility_on_silence: 50
    });
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'minimality') {
    const report = auditDimensionMinimality();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'outran-author') {
    const report = executeTheSentenceThatOutranItsAuthorEpisode();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'dromological-capture') {
    const report = auditDromologicalPhilologicalCapture({});
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'philology') {
    const histories = buildThreePhilologicalHistories();
    const report = auditPhilologicalEquivalence(histories, 'SOURCE_ANCESTRY_DIFF');
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'self-sealing-gate') {
    const report = evaluateSelfSealingPhilologicalGate();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'four-environments') {
    const report = simulateFourInstitutionalEnvironments({ deadlineHours: 24.0 });
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'opacity-bypass') {
    const report = auditOpacityPreservingStructuralBypass({ deadlineHours: 24.0, currentTime: 4.0 });
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'procedural-topology') {
    const report = evaluateProceduralAuthorizationTopology();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'five-counterworlds') {
    const report = evaluateFiveCounterworlds({ reviewerPolicy: 'STRUCTURAL_CATEGORY_NOTARIZATION', externalNotaryAvailable: true });
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'proof-lattice') {
    const report = evaluatePhilologicalProofLattice({
      sourceDigest: 'abc1234',
      summaryDigest: 'def5678',
      operationLogs: ['PASSIVE_CONVERSION', 'OBJECTION_EXPUNGEMENT'],
      intakeCategoryReceipt: {
        raw_contains_qualifying_objection: true,
        summary_recorded_objection: false
      },
      repeatedGameCohortData: null
    });
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'adaptive-game') {
    const report = simulateAdaptiveInstitutionGame({ rounds: 3, independentNotaryEnabled: true });
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'jurisdictional-boot') {
    const report = evaluateJurisdictionalBootstrap();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'final-adaptive') {
    const report = executeFinalAdaptiveExperiment();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'two-certified-worlds') {
    const report = auditTwoCertifiedWorldsDiscrimination();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'data-processing') {
    const report = evaluateDataProcessingComposition();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'exteriority-challenge') {
    const report = evaluateExteriorityChallenge({ numSigners: 5 });
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'three-conditions') {
    const report = simulateThreeConditionsTrial({ deadlineHours: 24.0, intakeProbeMediatedByPortal: false });
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'witness-independence') {
    const report = answerOperatorsQuestionOnWitnessIndependence();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'graeber-crosswalk') {
    const report = buildGraeberianCrosswalk();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'semantic-counterworlds') {
    const report = auditSemanticExteriority();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'interpretive-labor') {
    const report = simulateAsymmetricInterpretiveLaborTrial();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'dromological-reading') {
    const report = simulateDromologicalReadingExperiment({ deadlineHours: 24.0 });
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'epistemic-failure') {
    const report = answerOperatorsQuestionOnEpistemicFailure();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'fourth-order-docket') {
    const report = buildFourthOrderDiscoveryDocket();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'decision-leakage') {
    const report = evaluateDecisionChannelLeakage();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'four-remedies') {
    const report = evaluateFourRemedyConditions();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'observer-channels') {
    const report = evaluateObserverRelativeChannels();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'reparative-ethics') {
    const report = evaluateReparativeInterventionEthics();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'stay-leakage-answer') {
    const report = answerOperatorsQuestionOnRemedyLeakage();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'anticipatory-speaker') {
    const report = evaluateAnticipatorySpeakerModel();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'identical-records') {
    const report = buildTwoIdenticalAdministrativeRecords();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'information-paradox') {
    const report = evaluateInformationTheoreticParadox();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'graeber-dotson') {
    const report = evaluateGraeberDotsonInterpretiveLabor();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'feedback-experiment') {
    const report = simulateFeedbackRegimesTrial();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'observers-blindspot') {
    const report = auditObserversBlindSpot();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'anticipatory-answer') {
    const report = answerOperatorsQuestionOnAnticipatoryDisappearance();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (cmd === 'suite') {
    const loom = new CounterworldLoom();
    const mockEpisode = {
      id: 'EPISODE_COMPOSED_01',
      worlds: [
        { id: 'W1', state: 'NORMAL', latent_p: 3, winding: 0, journal_id: 'J1', velocity: 1.0 },
        { id: 'W2', state: 'NORMAL', latent_p: 7, winding: 1, journal_id: 'J2', velocity: 2.5 }
      ],
      projectionFn: w => ({ state: w.state }),
      evolutionFn: w => ({ id: w.id, state: 'EVOLVED_' + (w.latent_p > 5 ? 'HIGH' : 'LOW'), latent_p: w.latent_p }),
      questionFn: w => (w.winding > 0),
      historyAlpha: {
        id: 'RULE_ALPHA',
        timeline: [
          { era: 'T0', role: 'RULE', executable: true },
          { era: 'T1', role: 'DUAL_ROLE', executable: true },
          { era: 'T2', role: 'SUPERSEDED_CANDIDATE', executable: false }
        ]
      },
      historyBeta: {
        id: 'RULE_BETA',
        timeline: [
          { era: 'T0', role: 'RULE', executable: true },
          { era: 'T1', role: 'RULEFIELD', executable: false },
          { era: 'T2', role: 'SUPERSEDED_CANDIDATE', executable: false }
        ]
      },
      governancePolicy: { require_continuous_authority: true },
      observer: {
        id: 'Lead_Auditor',
        accessible_evidence: ['WITNESS_01'],
        interpretive_capacity: 4,
        authorized_actions: ['EXECUTE_INTERVENTION'],
        available_time_deadline: 100
      },
      evidence: { id: 'WITNESS_01', complexity: 2, required_action: 'EXECUTE_INTERVENTION' },
      currentTime: 10
    };

    const res = loom.executeFullComposition(mockEpisode);
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  }

  console.error(`Unknown command: ${cmd}`);
  printHelp();
  process.exit(1);
}

main().catch(err => {
  console.error('Loom CLI failure:', err);
  process.exit(1);
});
