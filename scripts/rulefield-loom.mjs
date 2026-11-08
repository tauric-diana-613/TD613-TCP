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
  computeEpistemicPhaseDisplacement
} from '../packages/rulefield/lab/counterworld_loom.mjs';

function printHelp() {
  console.log(`
TD613 Rulefield Counterworld Loom Laboratory CLI
Usage: node scripts/rulefield-loom.mjs [command]

Commands:
  witness-too-late   Execute 'The Witness That Arrived Too Late' experimental suite
  suite              Execute full five-engine composition suite
  help               Show this help message
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
