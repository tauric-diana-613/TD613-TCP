/**
 * Gate F source-free fidelity checks. Imported into the existing Flight
 * launchbridge battery; no new full-repository test cycle is required.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assessSourceFreeGateFFeasibility, FROZEN_FOUR_ARMS } from '../scripts/assess-experiment-b-gate-f-source-free.mjs';

const SCRIPT = fileURLToPath(new URL('../scripts/assess-experiment-b-gate-f-source-free.mjs', import.meta.url));

test('Gate F-SF01: original four arms and honest native refusal', async () => {
  const r = await assessSourceFreeGateFFeasibility();
  assert.deepEqual(r.four_arm_structure, FROZEN_FOUR_ARMS);
  assert.equal(r.native_turn.status, 'NATIVE_UNIMPLEMENTED_HELD');
  assert.equal(r.native_turn.observed_live_refusal, true);
  assert.equal(r.native_turn.synthetic_turn_native_authentication, false);
  assert.equal(r.native_turn.forged_native_receipt_authentication, false);
});

test('Gate F-SF02: independent OS processes are source-free plumbing only', async () => {
  const r = await assessSourceFreeGateFFeasibility();
  assert.equal(r.simulated_process_lanes.process_count, 2);
  assert.equal(r.simulated_process_lanes.distinct_pids_observed, true);
  assert.equal(r.simulated_process_lanes.identical_source_digest, true);
  assert.equal(r.simulated_process_lanes.distinct_private_canary_digests, true);
  assert.equal(r.simulated_process_lanes.process_only_no_model, true);
  assert.equal(r.simulated_process_lanes.filesystem_and_tool_sandbox_verified, false);
});

test('Gate F-SF03: metadata blinding does not claim independent model evaluation', async () => {
  const r = await assessSourceFreeGateFFeasibility();
  assert.equal(r.blinded_metadata_rehearsal.arm_labels_absent, true);
  assert.equal(r.blinded_metadata_rehearsal.semantic_evaluator_blinding_verified, false);
  assert.equal(r.blinded_metadata_rehearsal.independently_witnessed, false);
});

test('Gate F-SF04: frozen call ceiling prevents unamended full-corpus readiness', async () => {
  const r = await assessSourceFreeGateFFeasibility();
  assert.ok(r.capacity.minimum_arm_2a_calls_one_pass > r.capacity.preregistered_per_arm_call_ceiling);
  assert.ok(r.capacity.minimum_arm_2b_calls_one_pass > r.capacity.preregistered_per_arm_call_ceiling);
  assert.equal(r.gate_f.startsWith('HELD_'), true);
  assert.equal(r.empirical_replication_credit, 0);
  assert.equal(r.model_provider_calls, 0);
});

test('Gate F-SF05: strict flight-readiness CLI fails closed even after source-free PASS', () => {
  const run = spawnSync(process.execPath, [SCRIPT, '--require-ready'], {encoding:'utf8', timeout:12000});
  assert.equal(run.status, 2, 'strict flight-readiness invocation must refuse');
  const result = JSON.parse(run.stdout);
  assert.match(result.gate_f, /^HELD_/);
  assert.equal(result.protected_archive_files_read, 0);
  assert.equal(result.external_paid_inference_usd, 0);
});
