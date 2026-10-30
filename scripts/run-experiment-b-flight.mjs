#!/usr/bin/env node
/**
 * run-experiment-b-flight.mjs
 *
 * TD613 Experiment B Flight Execution Entry Point.
 * Provides a source-free dry-run harness and enforces fail-closed gates for live Flight.
 *
 * Usage:
 *   node scripts/run-experiment-b-flight.mjs --dry-run
 *   node scripts/run-experiment-b-flight.mjs --archive-path <path> --permutation CHRONOLOGICAL
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ControlledArchiveIntake } from '../docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs';
import { HeterogeneousDiscoveryHarness } from '../docs/research/experiment-b-preflight/02_four_arm_harness/run-heterogeneous-discovery-harness.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(args) {
  const options = {
    dryRun: false,
    archivePath: null,
    permutation: 'CHRONOLOGICAL',
    model: 'gemini-2.5-flash-lite',
    maxCalls: 120,
    maxTokens: 400000,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--archive-path' && args[i + 1]) {
      options.archivePath = args[++i];
    } else if (arg === '--permutation' && args[i + 1]) {
      options.permutation = args[++i];
    } else if (arg === '--model' && args[i + 1]) {
      options.model = args[++i];
    } else if (arg === '--max-calls' && args[i + 1]) {
      options.maxCalls = parseInt(args[++i], 10);
    } else if (arg === '--max-tokens' && args[i + 1]) {
      options.maxTokens = parseInt(args[++i], 10);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
𝌋 TD613 · Experiment B Flight Runner

Options:
  --dry-run             Run source-free verification with synthetic in-memory fixtures (default in preflight)
  --archive-path <path> Designated path to archive (gated by operator authorization)
  --permutation <name>  Exposure sequence: CHRONOLOGICAL | REVERSE_CHRONOLOGICAL | TOPICAL
  --model <name>        Model version (default: gemini-2.5-flash-lite)
  --max-calls <n>       Maximum provider attempts ceiling (default: 120)
  --max-tokens <n>      Maximum token ceiling (default: 400000)
  --help, -h            Show this help message
`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  // Live Flight Custody Verification
  const isEnvAdmitted = process.env.TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED === 'true';
  const isFlightAuthorized = process.env.TD613_FLIGHT_EXECUTION_AUTHORIZED === 'true';

  if (!options.dryRun) {
    if (!isEnvAdmitted || !isFlightAuthorized) {
      console.error(
        'FLIGHT_EXECUTION_BLOCKED_IN_PREFLIGHT: Protected Flight over physical archives remains gated until live Sovereign Operator activation.\n' +
        'Missing required environment grants: TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED=true and TD613_FLIGHT_EXECUTION_AUTHORIZED=true.\n' +
        'Use --dry-run for source-free verification.'
      );
      process.exit(1);
    }

    if (options.archivePath) {
      console.error(
        'ARCHIVE_ADMISSION_PHYSICAL_ZIP_HELD: Physical archive intake is held. In preflight, physical file reading is disabled fail-closed.'
      );
      process.exit(1);
    }
  }

  // Source-Free Dry Run Execution with Trusted In-Memory Synthetic Fixtures
  console.log('𝌋 TD613 Experiment B Flight Runner: Commencing source-free synthetic verification...');

  const intake = new ControlledArchiveIntake({ syntheticMode: true, allowProtectedAdmission: false });
  const syntheticSpecimens = {
    syntheticDocuments: [
      {
        id: 'DOC-SYN-01',
        filename: 'synthetic_dissipative_oscillator.md',
        content: '# Synthetic Specimen 1: Damped Harmonic Oscillator\nDifferential Equation: m * x\'\'(t) + gamma * x\'(t) + k * x(t) = 0\nInvariant: Hamiltonian energy decay rate dE/dt = -gamma * (x\')^2 <= 0',
        author_provenance: 'Source-Free Calibration Fixture'
      },
      {
        id: 'DOC-SYN-02',
        filename: 'synthetic_series_rlc_circuit.md',
        content: '# Synthetic Specimen 2: Series RLC Circuit\nDifferential Equation: L * q\'\'(t) + R * q\'(t) + (1/C) * q(t) = 0\nInvariant: Dissipated power P(t) = -R * (q\')^2 <= 0',
        author_provenance: 'Source-Free Calibration Fixture'
      }
    ]
  };

  const admissionReceipt = intake.admitArchive(syntheticSpecimens, { trustedSyntheticFixture: true });
  console.log(`  ✓ Admitted ${admissionReceipt.document_count} synthetic specimens (manifest: ${admissionReceipt.manifest_sha256.slice(0, 16)}...)`);

  const harness = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2A_MODULAR',
    mockMode: true,
    maxCalls: options.maxCalls,
    maxTokens: options.maxTokens
  });

  console.log('  ✓ Establishing Pre-Exposure Baseline (t0)...');
  await harness.establishPreExposureBaseline('Baseline priors unconditioned.');

  for (let i = 0; i < admissionReceipt.documents.length; i++) {
    const doc = admissionReceipt.documents[i];
    console.log(`  ✓ Ingesting turn ${i + 1}: ${doc.filename}...`);
    await harness.ingestSequentialDocument(doc, i + 1);
  }

  const ledger = harness.exportResearchLedger();
  console.log(`\n𝌋 Execution Summary:`);
  console.log(`  Turns Executed: ${ledger.turn_count}`);
  console.log(`  Candidates Formulated: ${ledger.candidate_count}`);
  console.log(`  Provider Calls: ${ledger.provider_accounting.successful_calls}`);
  console.log(`  Tokens Consumed: ${ledger.provider_accounting.total_tokens_consumed}`);
  console.log(`  Context Strategy: ${ledger.context_strategy}`);
  console.log(`  Custody Status: ${admissionReceipt.custody_status}`);

  // Flush checkpoint
  const checkpointDir = path.resolve(__dirname, '../docs/research/experiment-b-preflight/02_four_arm_harness');
  const checkpointPath = path.join(checkpointDir, 'dry_run_checkpoint.json');
  fs.writeFileSync(checkpointPath, JSON.stringify(ledger, null, 2), 'utf8');
  console.log(`  ✓ Checkpoint persisted: ${checkpointPath}`);

  console.log('\n𝌋 Source-Free Dry Run Complete: B_SOURCE_FREE_LAUNCHBRIDGE_VERIFIED ⟐');
}

main().catch(err => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
