#!/usr/bin/env node

/**
 * run-experiment-b-flight.mjs
 *
 * TD613 Experiment B · Sovereign Flight Runner & Preflight Verification
 *
 * Coordinates the full four-arm heterogeneous discovery flight:
 *   - Arm 0: Transport-Only Baseline
 *   - Arm 1: Authentic Native Archival Control (Encyclopedia & Wendbine)
 *   - Arm 2A: Modular Paratactic Research Instrument
 *   - Arm 2B: Matched Strong-Union Comparator
 *
 * Dual-Backend Architecture (Sovereign Steer 2026-10-30):
 *   - Track Alpha (--backend native): Antigravity in-app agent reasoning route (Operator-Designated Primary).
 *   - Track Beta (--backend rest): Optional Gemini REST client route (Preserved Secondary Comparator).
 *
 * Redpen R3 Reconciliation:
 *   - R3-01: Explicit phase boundary between candidate generation and independent witness adjudication.
 *   - R3-02: Authentic document-specific native Arm 1 archival outcomes (no fixture substitution).
 *   - R3-03: Zero unauthenticated binary derivative attachment (exact SHA-256 + provenance).
 *   - R3-04: Aggregate attempt tracking, conservative token reservation, shared ceilings.
 *   - R3-05: Prospective chronology and topic metadata contract (explicit CHRONOLOGY_UNIDENTIFIABLE hold).
 *   - R3-06: Fine-grained journal recovery and strict private-path confinement.
 *   - R3-07: Key masking, caller-consistency vs independent human authority separation.
 *
 * Usage:
 *   node scripts/run-experiment-b-flight.mjs --dry-run --arm ALL --permutation CHRONOLOGICAL --backend native
 *   node scripts/run-experiment-b-flight.mjs --archive-path <path> --grant-path <grant.json> --backend native
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import {
  ControlledArchiveIntake,
  createSyntheticZipArchive,
  verifyOperatorFlightGrant
} from '../docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs';
import { HeterogeneousDiscoveryHarness } from '../docs/research/experiment-b-preflight/02_four_arm_harness/run-heterogeneous-discovery-harness.mjs';
import {
  Stage2IndependentEvaluator,
  computeProofBindingDigest,
  createIndependentProofReceipt,
  verifyWitnessAttestation
} from '../docs/research/experiment-b-preflight/02_four_arm_harness/stage2-independent-evaluator.mjs';
import {
  SharedBudgetGovernor,
  AtomicCustodyLedger,
  validatePrivatePathConfinement
} from '../docs/research/experiment-b-preflight/02_four_arm_harness/atomic-custody-ledger.mjs';
import { runArm1Archival } from '../docs/research/experiment-b-preflight/02_four_arm_harness/run-arm1-archival.mjs';
import {
  AntigravityNativeOrchestrator,
  ANTIGRAVITY_NATIVE_ORCHESTRATION_SCHEMA
} from '../docs/research/experiment-b-preflight/02_four_arm_harness/antigravity-native-orchestrator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

function parseArgs(args) {
  const options = {
    dryRun: false,
    backend: 'native', // 'native' (Antigravity in-app agent) | 'rest' (Gemini HTTP API)
    archivePath: null,
    arm: 'ALL', // 'ALL' | 'ARM_0_TRANSPORT' | 'ARM_1_ARCHIVAL' | 'ARM_2A_MODULAR' | 'ARM_2B_MATCHED_UNION'
    permutation: 'CHRONOLOGICAL', // 'CHRONOLOGICAL' | 'REVERSE_CHRONOLOGICAL' | 'TOPICAL'
    model: 'gemini-2.5-flash-lite',
    maxCalls: 120,
    maxTokens: 400000,
    maxCostUSD: 0.50,
    grantPath: null,
    operatorKey: null,
    operatorKeyId: null,
    operatorKeysFile: null,
    requireWitnessTier: false,
    witnessKey: null,
    witnessKeyId: null,
    witnessKeysFile: null,
    attestedWitnessFile: null,
    ledgerPath: null,
    derivativesManifest: null,
    strictTreatment: false,
    resume: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--strict-treatment') {
      options.strictTreatment = true;
    } else if (arg === '--resume') {
      options.resume = true;
    } else if (arg === '--backend' && args[i + 1]) {
      options.backend = args[++i].toLowerCase();
    } else if (arg === '--archive-path' && args[i + 1]) {
      options.archivePath = args[++i];
    } else if (arg === '--arm' && args[i + 1]) {
      options.arm = args[++i].toUpperCase();
    } else if (arg === '--permutation' && args[i + 1]) {
      options.permutation = args[++i].toUpperCase();
    } else if (arg === '--model' && args[i + 1]) {
      options.model = args[++i];
    } else if (arg === '--max-calls' && args[i + 1]) {
      options.maxCalls = parseInt(args[++i], 10);
    } else if (arg === '--max-tokens' && args[i + 1]) {
      options.maxTokens = parseInt(args[++i], 10);
    } else if (arg === '--max-cost' && args[i + 1]) {
      options.maxCostUSD = parseFloat(args[++i]);
    } else if (arg === '--grant-path' && args[i + 1]) {
      options.grantPath = args[++i];
    } else if (arg === '--operator-key' && args[i + 1]) {
      options.operatorKey = args[++i];
    } else if (arg === '--operator-key-id' && args[i + 1]) {
      options.operatorKeyId = args[++i];
    } else if (arg === '--operator-keys-file' && args[i + 1]) {
      options.operatorKeysFile = args[++i];
    } else if (arg === '--require-witness-tier') {
      options.requireWitnessTier = true;
    } else if (arg === '--witness-key' && args[i + 1]) {
      options.witnessKey = args[++i];
    } else if (arg === '--witness-key-id' && args[i + 1]) {
      options.witnessKeyId = args[++i];
    } else if (arg === '--witness-keys-file' && args[i + 1]) {
      options.witnessKeysFile = args[++i];
    } else if (arg === '--attested-witness-file' && args[i + 1]) {
      options.attestedWitnessFile = args[++i];
    } else if (arg === '--ledger-path' && args[i + 1]) {
      options.ledgerPath = args[++i];
    } else if (arg === '--derivatives-manifest' && args[i + 1]) {
      options.derivativesManifest = args[++i];
    }
  }

  return options;
}

function printHelp() {
  console.log(`
𝌋 TD613 · Experiment B Flight Runner

Usage:
  node scripts/run-experiment-b-flight.mjs [options]

Options:
  --dry-run                 Run source-free verification with synthetic fixtures (default in preflight)
  --backend <name>          Execution backend: native (Antigravity In-App Agent, Primary) | rest (Gemini API, Optional) (default: native)
  --archive-path <path>     Designated absolute path to physical ZIP archive (requires operator grant)
  --arm <name>              Arm to execute: ALL | ARM_0_TRANSPORT | ARM_1_ARCHIVAL | ARM_2A_MODULAR | ARM_2B_MATCHED_UNION (default: ALL)
  --permutation <name>      Exposure sequence: CHRONOLOGICAL | REVERSE_CHRONOLOGICAL | TOPICAL (default: CHRONOLOGICAL)
  --model <name>            Model version: gemini-2.5-flash-lite | gemini-2.5-flash (default: gemini-2.5-flash-lite)
  --max-calls <n>           Maximum provider attempts ceiling (default: 120)
  --max-tokens <n>          Maximum aggregate token ceiling (default: 400000)
  --max-cost <n>            Maximum financial ceiling in USD for REST backend (default: 0.50)
  --grant-path <path>       Path to operator cryptographic flight grant JSON
  --operator-key <key>      Operator root secret key for grant cryptographic verification
  --operator-keys-file <p>  Path to JSON file mapping issuerId -> secretKey
  --require-witness-tier    Require in-line independent witnessed evaluation (fails closed if witness keys unsupplied)
  --witness-keys-file <p>   Path to JSON file mapping witnessId -> secretKey
  --attested-witness-file<p>Path to JSON file containing attested witness payload and signature
  --ledger-path <path>      Private custody path for research ledger (defaults to artifacts/private/)
  --derivatives-manifest <p> Optional path to JSON map of authenticated text derivatives for binary files
  --help, -h                Show this help message
`);
}

function resolveOperatorKeys(options) {
  const keys = {};

  if (options.operatorKeysFile && fs.existsSync(options.operatorKeysFile)) {
    try {
      const fileData = JSON.parse(fs.readFileSync(options.operatorKeysFile, 'utf8'));
      Object.assign(keys, fileData);
    } catch (e) {
      console.warn(`Warning: Could not parse operator keys file: ${e.message}`);
    }
  }

  if (options.operatorKey) {
    const keyId = options.operatorKeyId || 'OPERATOR_PRIMARY';
    keys[keyId] = options.operatorKey;
    keys['default'] = options.operatorKey;
  }

  const envKey = process.env.TD613_OPERATOR_SIGNING_KEY || process.env.TD613_OPERATOR_KEY || process.env.TD613_OPERATOR_VERIFYING_KEY;
  if (envKey) {
    const envKeyId = process.env.TD613_OPERATOR_KEY_ID || 'OPERATOR_PRIMARY';
    keys[envKeyId] = envKey;
    keys['default'] = envKey;
  }

  return keys;
}

function resolveWitnessKeys(options) {
  const keys = {};

  if (options.witnessKeysFile && fs.existsSync(options.witnessKeysFile)) {
    try {
      const fileData = JSON.parse(fs.readFileSync(options.witnessKeysFile, 'utf8'));
      Object.assign(keys, fileData);
    } catch (e) {
      console.warn(`Warning: Could not parse witness keys file: ${e.message}`);
    }
  }

  if (options.witnessKey) {
    const keyId = options.witnessKeyId || 'WITNESS_PRIMARY';
    keys[keyId] = options.witnessKey;
    keys['default'] = options.witnessKey;
  }

  const envKey = process.env.TD613_WITNESS_SIGNING_KEY || process.env.TD613_WITNESS_KEY;
  if (envKey) {
    const envKeyId = process.env.TD613_WITNESS_KEY_ID || 'WITNESS_PRIMARY';
    keys[envKeyId] = envKey;
    keys['default'] = envKey;
  }

  return keys;
}

function resolveAttestedWitness(options) {
  if (options.attestedWitnessFile && fs.existsSync(options.attestedWitnessFile)) {
    try {
      return JSON.parse(fs.readFileSync(options.attestedWitnessFile, 'utf8'));
    } catch (e) {
      console.warn(`Warning: Could not parse attested witness file: ${e.message}`);
    }
  }
  return null;
}

function resolveDerivativesMap(options) {
  if (options.derivativesManifest && fs.existsSync(options.derivativesManifest)) {
    try {
      return JSON.parse(fs.readFileSync(options.derivativesManifest, 'utf8'));
    } catch (e) {
      console.warn(`Warning: Could not parse derivatives manifest: ${e.message}`);
    }
  }
  return {};
}

/**
 * R3-05: Orders admitted documents according to designated sequence treatment.
 * Distinguishes operator/author verified dates from archive order.
 * If true chronological order cannot be established, records CHRONOLOGY_UNIDENTIFIABLE
 * rather than relabeling archive order as historical chronology.
 */
function applySequencePermutation(documents, permutation) {
  const docs = [...documents];

  if (permutation === 'REVERSE_CHRONOLOGICAL') {
    const chronRes = applySequencePermutation(docs, 'CHRONOLOGICAL');
    return {
      documents: chronRes.documents.reverse(),
      permutation: 'REVERSE_CHRONOLOGICAL',
      status: chronRes.status,
      notice: chronRes.notice
    };
  }

  if (permutation === 'TOPICAL') {
    const hasUndeclaredTopic = docs.some(d => !d.topic_evidence?.declared_topic && !d.metadata?.declared_topic);
    if (hasUndeclaredTopic) {
      return {
        documents: docs,
        permutation: 'TOPICAL',
        status: 'TOPIC_UNCLASSIFIED_ORDER_HELD',
        notice: 'One or more documents lack declared research topics. Grouping by keyword guessing is refused; admission order preserved under hold.'
      };
    }
    const sorted = docs.sort((a, b) => {
      const topA = a.topic_evidence?.declared_topic || a.metadata?.declared_topic || '';
      const topB = b.topic_evidence?.declared_topic || b.metadata?.declared_topic || '';
      return topA.localeCompare(topB);
    });
    return {
      documents: sorted,
      permutation: 'TOPICAL',
      status: 'DECLARED_TOPIC_ORDER_APPLIED',
      notice: 'Documents grouped by explicit declared research topics.'
    };
  }

  // Default: CHRONOLOGICAL
  const hasUnidentifiableDate = docs.some(d => {
    const ev = d.chronology_evidence;
    return !ev?.verified_chronology_date && !d.metadata?.timestamp && !d.metadata?.date;
  });

  if (hasUnidentifiableDate) {
    return {
      documents: docs,
      permutation: 'CHRONOLOGICAL',
      status: 'CHRONOLOGY_UNIDENTIFIABLE',
      notice: 'One or more documents lack verified historical timestamps. Relabeling archive order as chronology is strictly refused; admission order preserved under explicit hold.'
    };
  }

  const sorted = docs.sort((a, b) => {
    const dateA = new Date(a.chronology_evidence?.verified_chronology_date || a.metadata?.timestamp || a.metadata?.date).getTime();
    const dateB = new Date(b.chronology_evidence?.verified_chronology_date || b.metadata?.timestamp || b.metadata?.date).getTime();
    return dateA - dateB;
  });

  return {
    documents: sorted,
    permutation: 'CHRONOLOGICAL',
    status: 'VERIFIED_CHRONOLOGY_APPLIED',
    notice: 'Documents ordered strictly by verified historical timestamps.'
  };
}

/**
 * Executes Arm 0: Transport-Only Baseline.
 */
function executeArm0Transport(documents) {
  const records = [];
  let totalBytes = 0;

  for (const doc of documents) {
    const rawLen = doc.raw_bytes ? doc.raw_bytes.length : Buffer.from(doc.content || '', 'utf8').length;
    totalBytes += rawLen;
    records.push({
      document_id: doc.id,
      filename: doc.filename,
      is_binary: doc.is_binary,
      bytes: rawLen,
      sha256: doc.sha256,
      derivative_status: doc.derivative_status,
      transport_fidelity: 'BIT_EXACT_PRESERVED',
      timestamp: new Date().toISOString()
    });
  }

  return {
    arm: 'ARM_0_TRANSPORT',
    total_documents: documents.length,
    total_bytes_transported: totalBytes,
    records,
    status: 'TRANSPORT_BASELINE_VERIFIED'
  };
}

/**
 * Executes Arm 1: Native Archival Control (R3-02 Repair).
 */
async function executeArm1Archival(repoRoot, documents) {
  const arm1Res = await runArm1Archival(repoRoot, documents);

  return {
    arm: 'ARM_1_ARCHIVAL',
    runtime: 'NATIVE_ENCYCLOPEDIA_AND_WENDBINE_COMPILER',
    total_documents: documents.length,
    raw_bytes_preserved: arm1Res.raw_bytes_preserved,
    total_indexed: arm1Res.total_indexed, // authentic count, e.g. 0
    schema_admitted: arm1Res.schema_admitted,
    schema_rejected: arm1Res.schema_rejected,
    relations_compiled: arm1Res.relations_compiled,
    autonomous_relation_synthesis_present: arm1Res.autonomous_relation_synthesis_present,
    per_document_operations: arm1Res.per_document_operations,
    execution_log: arm1Res.log,
    status: 'NATIVE_ARCHIVAL_CONTROL_VERIFIED'
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  // 1. Live Flight Custody Verification
  const isEnvAdmitted = process.env.TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED === 'true';
  const isFlightAuthorized = process.env.TD613_FLIGHT_EXECUTION_AUTHORIZED === 'true';
  const operatorKeys = resolveOperatorKeys(options);
  const derivativesMap = resolveDerivativesMap(options);

  if (!options.dryRun) {
    if (!isEnvAdmitted || !isFlightAuthorized) {
      console.error(
        'FLIGHT_EXECUTION_BLOCKED_UNAUTHORIZED: Protected Flight over physical archives remains gated until live Sovereign Operator activation.\n' +
        'Missing required environment grants: TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED=true and TD613_FLIGHT_EXECUTION_AUTHORIZED=true.\n' +
        'Use --dry-run for source-free verification.'
      );
      process.exit(1);
    }

    if (!options.archivePath) {
      console.error(
        'FLIGHT_EXECUTION_BLOCKED_UNAUTHORIZED: Physical archive path (--archive-path) must be explicitly designated for live flight.'
      );
      process.exit(1);
    }

    if (Object.keys(operatorKeys).length === 0) {
      console.error(
        'FLIGHT_EXECUTION_BLOCKED_UNAUTHORIZED: Physical archive admission requires trusted operator keys via --operator-key, --operator-keys-file, or TD613_OPERATOR_KEY.'
      );
      process.exit(1);
    }
  }

  // R4-02: Preflight Stage 2 Witness Contract Check (Verifies signature, scope, and trust root before archive admission)
  if (options.requireWitnessTier) {
    const witnessKeys = resolveWitnessKeys(options);
    const attestedWitness = resolveAttestedWitness(options);
    if (!attestedWitness || !witnessKeys[attestedWitness.witnessId]) {
      console.error(
        'PREFLIGHT_STAGE2_WITNESS_CONTRACT_MISSING: In-line witnessed evaluation requested (--require-witness-tier), ' +
        'but missing authentic cryptographic witness attestation or trusted key. Halted before archive admission or provider dispatch.'
      );
      process.exit(1);
    }
    const witnessKey = witnessKeys[attestedWitness.witnessId];
    const isValid = verifyWitnessAttestation(attestedWitness, witnessKey);
    if (!isValid) {
      console.error(
        `PREFLIGHT_STAGE2_WITNESS_SIGNATURE_INVALID: Cryptographic witness signature verification failed for witnessId '${attestedWitness.witnessId}'. Zero protected exposure or provider calls permitted.`
      );
      process.exit(1);
    }
    if (attestedWitness.scope && attestedWitness.scope !== 'EXPERIMENT_B_STAGE2_INDEPENDENT_EVALUATION') {
      console.error(
        `PREFLIGHT_STAGE2_WITNESS_SCOPE_MISMATCH: Witness scope '${attestedWitness.scope}' does not match required 'EXPERIMENT_B_STAGE2_INDEPENDENT_EVALUATION'. Halted before archive admission or model dispatch.`
      );
      process.exit(1);
    }
  }

  // Critical pre-admission fail-closed gate. Protected material must not be opened
  // before the requested native cognitive backend can perform an authentic turn.
  // The current 'native' module is a source-free simulator with no in-app model adapter.
  if (!options.dryRun && options.backend === 'native' &&
      (options.arm === 'ALL' || options.arm === 'ARM_2A_MODULAR' || options.arm === 'ARM_2B_MATCHED_UNION')) {
    console.error(
      'NATIVE_UNIMPLEMENTED_HELD: Native Antigravity model execution adapter is unavailable. ' +
      'Rejecting before protected archive admission; session environment flags are insufficient. ' +
      'No synthetic research, archive access, or implicit REST fallback permitted.'
    );
    process.exit(1);
  }

  console.log(`======================================================================`);
  console.log(`  𝌋 TD613 EXPERIMENT B FLIGHT RUNNER · ${options.dryRun ? 'SOURCE-FREE DRY RUN' : 'LIVE FLIGHT'}`);
  console.log(`======================================================================`);
  console.log(`Backend Route:    ${options.backend === 'native' ? 'Track Alpha · Antigravity Native Agent' : 'Track Beta · Gemini REST API'}`);
  console.log(`Arm Selection:    ${options.arm}`);
  console.log(`Permutation:      ${options.permutation}`);
  console.log(`Model Engine:     ${options.model}`);
  console.log(`Budget Ceilings:  ${options.maxCalls} calls · ${options.maxTokens} tokens · $${options.maxCostUSD} USD`);

  // 2. Admission of Specimens
  let admissionReceipt;
  const syntheticMetadata = {
    'synthetic_dissipative_oscillator.md': {
      operator_declared_date: '2026-01-15T00:00:00Z',
      declared_topic: 'TOPIC_DISSIPATION'
    },
    'synthetic_series_rlc_circuit.md': {
      operator_declared_date: '2026-02-01T00:00:00Z',
      declared_topic: 'TOPIC_CIRCUITS'
    }
  };

  const intake = new ControlledArchiveIntake({
    syntheticMode: options.dryRun,
    allowProtectedAdmission: !options.dryRun,
    trustedOperatorKeys: operatorKeys,
    authorizedDerivativesMap: derivativesMap,
    prospectiveMetadataMap: options.dryRun ? syntheticMetadata : {},
    maxMembers: 50,
    maxTotalExpandedBytes: 10 * 1024 * 1024,
    maxPerMemberBytes: 2 * 1024 * 1024,
    maxDecompressionRatio: 100
  });

  if (options.dryRun) {
    const syntheticZipBuffer = createSyntheticZipArchive([
      {
        name: 'synthetic_dissipative_oscillator.md',
        data: '# Synthetic Specimen 1: Damped Harmonic Oscillator\nDifferential Equation: m * x\'\'(t) + gamma * x\'(t) + k * x(t) = 0\nInvariant: Hamiltonian energy decay rate dE/dt = -gamma * (x\')^2 <= 0\nQUOTE: "m * x\'\'(t) + gamma * x\'(t) + k * x(t) = 0"'
      },
      {
        name: 'synthetic_series_rlc_circuit.md',
        data: '# Synthetic Specimen 2: Series RLC Circuit\nDifferential Equation: L * q\'\'(t) + R * q\'(t) + (1/C) * q(t) = 0\nInvariant: Dissipated power P(t) = -R * (q\')^2 <= 0\nQUOTE: "L * q\'\'(t) + R * q\'(t) + (1/C) * q(t) = 0"'
      }
    ]);

    admissionReceipt = intake.admitArchive(
      { zipBuffer: syntheticZipBuffer },
      { trustedSyntheticFixture: true }
    );
    console.log(`  ✓ Admitted ${admissionReceipt.document_count} synthetic specimens from in-memory ZIP (manifest: ${admissionReceipt.manifest_sha256.slice(0, 16)}...)`);
  } else {
    const grantRaw = fs.readFileSync(path.resolve(options.grantPath), 'utf8');
    const grant = JSON.parse(grantRaw);
    admissionReceipt = intake.admitArchive(options.archivePath, {
      operatorFlightGrant: grant
    });
    console.log(`  ✓ Admitted ${admissionReceipt.document_count} physical specimens from archive: ${options.archivePath}`);
  }

  // 3. Sequence Permutation Treatment (R3-05 & R4-03)
  const permResult = applySequencePermutation(admissionReceipt.documents, options.permutation);
  if (options.strictTreatment || !options.dryRun) {
    if (permResult.status === 'CHRONOLOGY_UNIDENTIFIABLE' || permResult.status === 'TOPIC_UNCLASSIFIED_ORDER_HELD') {
      console.error(
        `TREATMENT_METADATA_UNAVAILABLE_HELD: Permutation '${options.permutation}' halted fail-closed (${permResult.status}). ` +
        `Required verified historical metadata is unavailable. Silent fallback to archive-order or guessing is strictly prohibited.`
      );
      process.exit(1);
    }
  }

  const admittedDocs = permResult.documents;
  console.log(`  ✓ Sequence treatment applied: ${options.permutation} (${admittedDocs.map(d => d.filename).join(' -> ')}) [status: ${permResult.status}]`);
  if (permResult.notice) {
    console.log(`    Note: ${permResult.notice}`);
  }

  // 4. Private Custody Ledger & Shared Budget Governor Initialization (R3-04, R3-06 & R4-04)
  const defaultLedger = path.resolve(REPO_ROOT, 'artifacts/private', options.dryRun ? 'flight_research_ledger_dry_run_test.json' : 'flight_research_ledger_live.json');
  const targetLedgerPath = options.ledgerPath ? path.resolve(options.ledgerPath) : defaultLedger;

  // Enforce private confinement
  validatePrivatePathConfinement(targetLedgerPath, REPO_ROOT);

  const sharedBudgetGovernor = new SharedBudgetGovernor({
    maxCalls: options.maxCalls,
    maxTokens: options.maxTokens,
    maxCostUSD: options.maxCostUSD,
    model: options.model
  });

  const custodyLedger = new AtomicCustodyLedger(targetLedgerPath, {
    repoRoot: REPO_ROOT,
    resume: options.resume
  });

  custodyLedger.initializeFlight({
    executionMode: options.dryRun ? 'SOURCE_FREE_DRY_RUN' : 'LIVE_PHYSICAL_FLIGHT',
    permutation: options.permutation,
    backend: options.backend,
    model: options.model,
    budgetCeilings: {
      max_calls: options.maxCalls,
      max_tokens: options.maxTokens,
      max_cost_usd: options.maxCostUSD
    },
    admissionReceipt
  });

  // 5. Execution of Designated Arms (R4-01 & R4-04)
  const allHarnesses = {};
  const armsToRun = options.arm === 'ALL'
    ? ['ARM_0_TRANSPORT', 'ARM_1_ARCHIVAL', 'ARM_2A_MODULAR', 'ARM_2B_MATCHED_UNION']
    : [options.arm];

  for (const arm of armsToRun) {
    if (arm === 'ARM_0_TRANSPORT') {
      if (options.resume && custodyLedger.isArmCompleted('ARM_0_TRANSPORT')) {
        console.log(`\n--- Arm 0 Already Completed (Restoring from persisted ledger) ---`);
        continue;
      }
      console.log(`\n--- Executing ARM_0_TRANSPORT ---`);
      const arm0Result = executeArm0Transport(admittedDocs);
      custodyLedger.recordArmCompletion('ARM_0_TRANSPORT', arm0Result);
      console.log(`  ✓ Arm 0 Complete: ${arm0Result.total_documents} docs transported (${arm0Result.total_bytes_transported} bytes)`);
    } else if (arm === 'ARM_1_ARCHIVAL') {
      if (options.resume && custodyLedger.isArmCompleted('ARM_1_ARCHIVAL')) {
        console.log(`\n--- Arm 1 Already Completed (Restoring from persisted ledger) ---`);
        continue;
      }
      console.log(`\n--- Executing ARM_1_ARCHIVAL ---`);
      const arm1Result = await executeArm1Archival(REPO_ROOT, admittedDocs);
      custodyLedger.recordArmCompletion('ARM_1_ARCHIVAL', arm1Result);
      console.log(`  ✓ Arm 1 Complete: ${arm1Result.total_documents} docs processed (raw_preserved: ${arm1Result.raw_bytes_preserved}, indexed: ${arm1Result.total_indexed}, schema_admitted: ${arm1Result.schema_admitted}, schema_rejected: ${arm1Result.schema_rejected})`);
    } else if (arm === 'ARM_2A_MODULAR' || arm === 'ARM_2B_MATCHED_UNION') {
      console.log(`\n--- Executing ${arm} (${options.backend === 'native' ? 'Antigravity Native Agent' : 'Gemini REST Client'}) ---`);

      let nativeOrchestrator = null;
      let harness = null;

      if (options.backend === 'native') {
        nativeOrchestrator = new AntigravityNativeOrchestrator({
          syntheticMode: options.dryRun,
          allowLiveNativeFlight: !options.dryRun && isFlightAuthorized,
          sessionId: `AGY-${arm}-${Date.now()}`,
          modelIdentity: options.model
        });

        if (!options.dryRun && !nativeOrchestrator.isLiveNativeEnvironmentActive()) {
          console.error(
            'NATIVE_UNIMPLEMENTED_HELD: Genuine Antigravity in-app native agent flight requires an active, ' +
            'connected in-app agent runner environment (TD613_ANTIGRAVITY_NATIVE_SESSION_ID). ' +
            'Fallback to Gemini REST client is strictly prohibited by Sovereign Steer 2026-10-30.'
          );
          process.exit(1);
        }
      } else {
        harness = new HeterogeneousDiscoveryHarness({
          arm,
          mockMode: options.dryRun,
          allowLivePaidInference: !options.dryRun,
          model: options.model,
          maxCalls: options.maxCalls,
          maxTokens: options.maxTokens,
          maxCostUSD: options.maxCostUSD,
          sharedBudgetGovernor
        });
      }

      // Pre-Exposure Baseline (t0) with Granular Recovery Check
      const completedBaseline = custodyLedger.getCompletedTurn(arm, 0);
      let baselineTurnRecord;
      if (completedBaseline) {
        console.log(`  ✓ Restoring Pre-Exposure Baseline (t0) from persisted ledger...`);
        baselineTurnRecord = completedBaseline.turn_record;
      } else {
        console.log(`  ✓ Establishing Pre-Exposure Baseline (t0)...`);
        custodyLedger.recordEvent({ type: 'BASELINE_ENTERED', arm });
        if (options.backend === 'native') {
          baselineTurnRecord = await nativeOrchestrator.executeTurn({
            arm,
            turnIndex: 0,
            document: null
          });
        } else {
          await harness.establishPreExposureBaseline();
          baselineTurnRecord = harness.history[0];
        }
        custodyLedger.recordTurn({
          arm,
          turnIndex: 0,
          documentId: 'BASELINE_T0',
          turnRecord: baselineTurnRecord,
          sharedBudgetGovernor: options.backend === 'rest' ? sharedBudgetGovernor : null
        });
        custodyLedger.recordEvent({ type: 'BASELINE_COMPLETED', arm });
      }

      let turnIdx = 0;
      const candidates = [];
      const history = [baselineTurnRecord];

      for (const doc of admittedDocs) {
        turnIdx++;
        const completedTurn = custodyLedger.getCompletedTurn(arm, turnIdx);
        let turnRecord;
        if (completedTurn) {
          console.log(`  ✓ Restoring turn ${turnIdx} (${doc.filename}) from persisted ledger...`);
          turnRecord = completedTurn.turn_record;
          history.push(turnRecord);
          if (turnRecord.parsed_candidate) {
            candidates.push(turnRecord.parsed_candidate);
          }
          continue;
        }

        console.log(`  ✓ Ingesting turn ${turnIdx}: ${doc.filename}...`);
        custodyLedger.recordEvent({ type: 'CHAMBER_1_ENTERED', arm, turn_index: turnIdx, document_id: doc.id });
        if (options.backend === 'native') {
          turnRecord = await nativeOrchestrator.executeTurn({
            arm,
            turnIndex: turnIdx,
            document: doc,
            priorHistory: history
          });
          if (turnRecord.parsed_candidate) {
            candidates.push(turnRecord.parsed_candidate);
            custodyLedger.recordEvent({
              type: 'CANDIDATE_EXTRACTED',
              arm,
              turn_index: turnIdx,
              candidate_id: turnRecord.parsed_candidate.candidate_id
            });
          }
        } else {
          await harness.ingestSequentialDocument(doc, turnIdx);
          turnRecord = harness.history[harness.history.length - 1];
          if (harness.candidates.length > 0) {
            const latestCand = harness.candidates[harness.candidates.length - 1];
            if (!candidates.some(c => c.candidate_id === latestCand.candidate_id)) {
              candidates.push(latestCand);
              custodyLedger.recordEvent({
                type: 'CANDIDATE_EXTRACTED',
                arm,
                turn_index: turnIdx,
                candidate_id: latestCand.candidate_id
              });
            }
          }
        }
        history.push(turnRecord);
        custodyLedger.recordEvent({ type: 'CHAMBER_1_COMPLETED', arm, turn_index: turnIdx, document_id: doc.id });
        custodyLedger.recordTurn({
          arm,
          turnIndex: turnIdx,
          documentId: doc.id,
          turnRecord,
          sharedBudgetGovernor: options.backend === 'rest' ? sharedBudgetGovernor : null
        });
      }

      allHarnesses[arm] = { candidates, history };
      custodyLedger.recordArmCompletion(arm, {
        arm,
        backend: options.backend,
        turns_executed: history.length,
        candidates_formulated: candidates.length,
        summary: options.backend === 'rest' ? sharedBudgetGovernor.getSummary() : { backend: 'ANTIGRAVITY_NATIVE_AGENT', turns: history.length }
      });

      console.log(`  ✓ ${arm} Complete: ${history.length} turns, ${candidates.length} candidates formulated.`);
      if (options.backend === 'rest') {
        console.log(`    Aggregate Calls: ${sharedBudgetGovernor.providerAttempts} | Tokens: ${sharedBudgetGovernor.totalTokensConsumed} | Cost: $${sharedBudgetGovernor.getEstimatedCostUSD()}`);
      }
    }
  }

  // 6. Stage 2 Independent Adjudication / Phase Boundary (R3-01)
  let evaluatorTier;
  let witnessKeys = {};
  let attestedWitness = null;

  if (options.dryRun) {
    evaluatorTier = 'IMPLEMENTER_AUTHORED_SEMANTIC_REVIEW';
  } else if (options.requireWitnessTier) {
    evaluatorTier = 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION';
    witnessKeys = resolveWitnessKeys(options);
    attestedWitness = resolveAttestedWitness(options);
  } else {
    // Blinded live candidate generation: provisional held tier
    evaluatorTier = 'PROVISIONAL_LIVE_RECORDING_HELD_FOR_WITNESS';
  }

  const allAdjudications = [];
  const evaluator = new Stage2IndependentEvaluator({
    evaluatorTier,
    trustedWitnessKeys: witnessKeys,
    attestedWitness: attestedWitness
  });

  console.log(`\n--- Executing Stage 2 Independent Evaluation (Tier: ${evaluatorTier}) ---`);

  if (options.dryRun) {
    console.log(`  (Running source-free pipeline verification; results marked as DRY_RUN_PLUMBING_VERIFICATION)`);
    let candIdx = 0;
    for (const [armKey, harness] of Object.entries(allHarnesses)) {
      for (const cand of harness.candidates) {
        candIdx++;
        let adj;

        if (cand.status === 'ABSTAIN_BINARY_WITHOUT_AUTHENTICATED_DERIVATIVE') {
          adj = {
            adjudicated_candidate: {
              ...cand,
              status: 'HELD_INSUFFICIENT_DATA',
              warrant_class: 'WARRANT_UNPRODUCED',
              adjudication_ancestry: {
                evaluator_tier: 'IMPLEMENTER_AUTHORED_SEMANTIC_REVIEW',
                disposition: 'EPISTEMIC_ABSTENTION_BINARY_PAYLOAD_UNANALYZED',
                verification_notice: 'DRY_RUN_PLUMBING_VERIFICATION'
              }
            }
          };
        } else if (candIdx === 1) {
          // Candidate 1: Genuine matching criteria -> WARRANTED
          adj = evaluator.evaluateCandidate(cand, {
            groundTruthWarrant: 'FORMAL_EQUIVALENCE',
            negativeControlRejected: true,
            discoveredInCellA: armKey === 'ARM_2B_MATCHED_UNION',
            discoveredInCellB: armKey === 'ARM_2A_MODULAR',
            isNovel: true,
            instrumentAnomalies: 'CLEAN_EXECUTION',
            episodeId: `Episode-${armKey}`,
            evaluatorNotes: 'DRY_RUN_PLUMBING_VERIFICATION: Specimen 1 formula equivalence verified against synthetic oscillator.'
          });
        } else if (candIdx === 2) {
          // Candidate 2: Fired on negative control noise -> SCAFFOLDING_ARTIFACT with math warrant surviving
          adj = evaluator.evaluateCandidate(cand, {
            groundTruthWarrant: 'ISOMORPHISM',
            negativeControlRejected: false, // Fired on noise!
            discoveredInCellA: false,
            discoveredInCellB: true,
            isNovel: true,
            instrumentAnomalies: 'CLEAN_EXECUTION',
            episodeId: `Episode-${armKey}`,
            evaluatorNotes: 'DRY_RUN_PLUMBING_VERIFICATION: Candidate fired on negative control noise; representation claim held as scaffolding artifact.'
          });
        } else {
          // Candidate 3+: Incomplete evidence criteria -> HELD_INSUFFICIENT_DATA
          adj = evaluator.evaluateCandidate(cand, {
            groundTruthWarrant: null, // Incomplete criteria!
            negativeControlRejected: null,
            discoveredInCellA: false,
            discoveredInCellB: false,
            isNovel: false,
            instrumentAnomalies: 'CLEAN_EXECUTION',
            episodeId: `Episode-${armKey}`,
            evaluatorNotes: 'DRY_RUN_PLUMBING_VERIFICATION: Incomplete criteria supplied; evaluation correctly held.'
          });
        }

        allAdjudications.push(adj);
      }
    }
  } else {
    // Live flight adjudication: evaluates candidates under assigned tier (provisional or witnessed)
    for (const [armKey, harness] of Object.entries(allHarnesses)) {
      for (const cand of harness.candidates) {
        const adj = evaluator.evaluateCandidate(cand, {
          groundTruthWarrant: null,
          negativeControlRejected: null,
          discoveredInCellA: null,
          discoveredInCellB: null,
          isNovel: null,
          instrumentAnomalies: null,
          episodeId: `Episode-${armKey}`,
          evaluatorNotes: 'Live flight adjudication recorded.'
        });
        allAdjudications.push(adj);
      }
    }
  }

  custodyLedger.recordAdjudications(allAdjudications);
  console.log(`  ✓ Evaluated ${allAdjudications.length} candidates through Stage 2 Evaluator (spectrum of RCA-01 outcomes demonstrated)`);

  const displayLedgerPath = path.relative(REPO_ROOT, targetLedgerPath) || targetLedgerPath;
  console.log(`\n  ✓ Research Ledger Persisted to Private Local Custody: ${displayLedgerPath}`);
  console.log(`\n======================================================================`);
  console.log(`  𝌋 FLIGHT EXECUTION FINISHED: B_FLIGHT_ENGINEERING_READY ⟐`);
  console.log(`======================================================================`);
}

main().catch(err => {
  console.error(`\n❌ FLIGHT EXECUTION FAILED: ${err.message}`);
  process.exit(1);
});
