/**
 * 𝌋 TD613 · Experiment B Gate F · source-free feasibility assay.
 * This program never opens the challenge archive, calls a model or creates
 * a witness signature. A process-only rehearsal MUST NOT count as native AI.
 */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  createNativeOrchestrationPlan,
  AntigravityNativeOrchestrator,
  ANTIGRAVITY_NATIVE_ORCHESTRATION_SCHEMA
} from '../docs/research/experiment-b-preflight/02_four_arm_harness/antigravity-native-orchestrator.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTOCOL = path.join(ROOT, 'docs/research/experiment-b-preflight/04_evaluation_and_preregistration/EXPERIMENT_B_PREREGISTERED_PROTOCOL.md');
export const FROZEN_FOUR_ARMS = Object.freeze([
  'ARM_0_TRANSPORT', 'ARM_1_ARCHIVAL', 'ARM_2A_MODULAR', 'ARM_2B_MATCHED_UNION'
]);
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function sourceFreeProcessLane(arm, commonFixture, privateCanary) {
  // This process invokes no model. It tests only that separately launched
  // processes receive matching source fixtures and distinct private inputs.
  const worker = [
    "const crypto = require('node:crypto');",
    "let input = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', chunk => { input += chunk; });",
    "process.stdin.on('end', () => {",
    "  const p = JSON.parse(input);",
    "  const hash = x => crypto.createHash('sha256').update(x).digest('hex');",
    "  process.stdout.write(JSON.stringify({",
    "    pid: process.pid, arm: p.arm, source_sha256: hash(p.fixture),",
    "    private_canary_sha256: hash(p.canary),",
    "    transcript: 'SOURCE_FREE_PROCESS_ONLY_NO_MODEL', native_turn_executed: false",
    "  }));",
    "});"
  ].join('\n');
  const child = spawnSync(process.execPath, ['-e', worker], {
    cwd: ROOT,
    input: JSON.stringify({arm, fixture: commonFixture, canary: privateCanary}),
    encoding: 'utf8',
    timeout: 8000,
    maxBuffer: 65536,
    env: {PATH: process.env.PATH || '', SystemRoot: process.env.SystemRoot || process.env.SYSTEMROOT || ''}
  });
  assert.equal(child.status, 0, 'source-free process lane must exit normally: ' + String(child.stderr).slice(0, 300));
  const result = JSON.parse(child.stdout);
  assert.equal(result.arm, arm);
  assert.equal(result.source_sha256, sha(Buffer.from(commonFixture, 'utf8')));
  assert.equal(result.native_turn_executed, false);
  return result;
}

export async function assessSourceFreeGateFFeasibility() {
  const source = fs.readFileSync(PROTOCOL);
  const protocolText = source.toString('utf8');
  const plan = createNativeOrchestrationPlan({
    sessionId: 'SOURCE_FREE_FEASIBILITY_ONLY',
    modelIdentity: 'UNATTESTED_NATIVE_MODEL'
  });
  const arms = Object.keys(plan.arms_configuration);
  assert.deepEqual(arms, FROZEN_FOUR_ARMS);
  assert.equal(plan.arms_configuration.ARM_0_TRANSPORT.requires_agent_inference, false);
  assert.equal(plan.arms_configuration.ARM_1_ARCHIVAL.requires_agent_inference, false);
  assert.equal(plan.arms_configuration.ARM_2A_MODULAR.requires_agent_inference, true);
  assert.equal(plan.arms_configuration.ARM_2B_MATCHED_UNION.requires_agent_inference, true);
  assert.match(protocolText, /Maximum 15 calls per arm/);
  assert.match(protocolText, /Gemini REST API/);

  // Test the REAL live adapter's fail-closed branch using no archive or model.
  const live = new AntigravityNativeOrchestrator({
    syntheticMode: false,
    allowLiveNativeFlight: false,
    sessionId: 'SOURCE_FREE_LIVE_REFUSAL_TEST'
  });
  let liveRefusal = null;
  try {
    await live.executeTurn({arm: 'ARM_2A_MODULAR', turnIndex: 0, document: null});
  } catch (err) {
    liveRefusal = String(err.message);
  }
  assert.match(liveRefusal || '', /NATIVE_UNIMPLEMENTED_HELD/);

  const simulated = new AntigravityNativeOrchestrator({
    syntheticMode: true, sessionId: 'SOURCE_FREE_SIMULATOR'
  });
  const syntheticTurn = await simulated.executeTurn({
    arm: 'ARM_2A_MODULAR', turnIndex: 1,
    document: {id: 'SYNTHETIC-01', filename: 'source-free-fixture.md'}
  });
  const syntheticAudit = AntigravityNativeOrchestrator.verifyNativeSessionExecution(syntheticTurn);
  assert.equal(syntheticAudit.valid, false);

  // A forged backend label and booleans must not authenticate a model turn.
  const forged = {
    ...syntheticTurn,
    backend: 'ANTIGRAVITY_NATIVE_AGENT',
    orchestration_schema: ANTIGRAVITY_NATIVE_ORCHESTRATION_SCHEMA,
    telemetry: {...syntheticTurn.telemetry, native_turn_executed: true, synthetic_turn_executed: false}
  };
  const forgedAudit = AntigravityNativeOrchestrator.verifyNativeSessionExecution(forged);
  assert.deepEqual(forgedAudit, {valid: false, reason: 'NATIVE_INDEPENDENT_ATTESTATION_UNAVAILABLE'});

  const identicalSource = 'SOURCE-FREE EXPERIMENT B PROCESS FIXTURE; no Em or protected bytes';
  const a = sourceFreeProcessLane('ARM_2A_MODULAR', identicalSource, crypto.randomBytes(32).toString('hex'));
  const b = sourceFreeProcessLane('ARM_2B_MATCHED_UNION', identicalSource, crypto.randomBytes(32).toString('hex'));
  assert.notEqual(a.pid, b.pid);
  assert.equal(a.source_sha256, b.source_sha256);
  assert.notEqual(a.private_canary_sha256, b.private_canary_sha256);

  // An evaluator may receive a blinded *metadata* packet in a rehearsal.
  // This cannot prove semantic blindness for model-generated prose.
  const blindPackets = [a,b].map((r, index) => ({
    blind_id: 'SOURCE_FREE_BLIND_' + sha(Buffer.from(r.private_canary_sha256 + index)).slice(0, 16),
    evidence_sha256: r.source_sha256,
    candidate_status: 'UNPRODUCED_NO_MODEL',
    content: r.transcript
  }));
  const blindedPayload = JSON.stringify(blindPackets);
  assert.doesNotMatch(blindedPayload, /ARM_2A|ARM_2B|MODULAR|MATCHED_UNION|CHAMBER/);

  const minDocuments = 20;
  const callsPerArm = 15;
  const minimumSequential2A = minDocuments * 2;
  const minimumSequential2B = minDocuments;
  assert.ok(minimumSequential2A > callsPerArm && minimumSequential2B > callsPerArm);

  return {
    schema: 'td613.experiment-b.gate-f-source-free-feasibility/v1',
    evidence_class: 'SOURCE_FREE_EXECUTED_PROCESS_AND_SOURCE_CONTRACT_CHECK',
    protocol_sha256: sha(source),
    protocol_status: 'CANDIDATE_PROTOCOL_PENDING_INDEPENDENT_REVIEW',
    four_arm_structure: FROZEN_FOUR_ARMS,
    simulated_process_lanes: {
      process_count: 2,
      distinct_pids_observed: a.pid !== b.pid,
      identical_source_digest: a.source_sha256 === b.source_sha256,
      distinct_private_canary_digests: a.private_canary_sha256 !== b.private_canary_sha256,
      process_only_no_model: true,
      filesystem_and_tool_sandbox_verified: false
    },
    blinded_metadata_rehearsal: {
      packet_count: blindPackets.length,
      arm_labels_absent: true,
      semantic_evaluator_blinding_verified: false,
      independently_witnessed: false
    },
    native_turn: {
      status: 'NATIVE_UNIMPLEMENTED_HELD',
      observed_live_refusal: liveRefusal.startsWith('NATIVE_UNIMPLEMENTED_HELD'),
      synthetic_turn_native_authentication: syntheticAudit.valid,
      forged_native_receipt_authentication: forgedAudit.valid,
      authenticated_agent_context_isolation: false,
      pinned_model_identity: false,
      pinned_native_sampling_temperature: false,
      platform_transcript_and_usage_attestation: false
    },
    capacity: {
      minimum_corpus_documents: minDocuments,
      preregistered_per_arm_call_ceiling: callsPerArm,
      minimum_arm_2a_calls_one_pass: minimumSequential2A,
      minimum_arm_2b_calls_one_pass: minimumSequential2B,
      full_corpus_capacity_under_frozen_ceiling: 'NOT_FEASIBLE_WITH_TWO_CALLS_PER_DOCUMENT',
      future_amendment_requires_operator_approval: true
    },
    protected_archive_files_read: 0,
    model_provider_calls: 0,
    external_paid_inference_usd: 0,
    gate_p: 'CLOSED_ACCEPTED_WITH_SCOPE_CARRIED',
    gate_f: 'HELD_NATIVE_ADAPTER_AND_INDEPENDENT_BLINDNESS_NOT_DEMONSTRATED',
    gate_e: 'HELD',
    empirical_replication_credit: 0,
    authority: 'NO_OPERATOR_GRANT_NO_WITNESS_SIGNATURE_NO_FLIGHT'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const receipt = await assessSourceFreeGateFFeasibility();
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    if (process.argv.includes('--require-ready')) process.exitCode = 2;
  } catch (err) {
    process.stderr.write('SOURCE_FREE_GATE_F_ASSAY_FAILED: ' + err.stack + '\n');
    process.exitCode = 1;
  }
}
