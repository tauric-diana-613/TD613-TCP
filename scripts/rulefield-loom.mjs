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
  evaluateProceduralAuthorizationTopology
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
