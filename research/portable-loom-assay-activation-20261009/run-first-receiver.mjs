import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { loadServerManifest, prepareServerRequest, captureServerCall } from '../portable-loom-server-transport-20261009/server-client.mjs';
import { validateAssayPolicy, requireThat, sha256, canonicalJson, reservationNanos, inspectAssayResponse } from '../../server/loom-assay-contract.js';

export function primaryCallPlan(manifest) {
  requireThat(manifest.receivers.length === 12 && new Set(manifest.receivers.map(c => c.case_id)).size === 12, 'ASSAY_PRIMARY_CASE_SET');
  const calls = [];
  for (const c of manifest.receivers) for (let repetition = 1; repetition <= 3; repetition++) {
    for (let turn_index = 0; turn_index <= c.later_user_messages.length; turn_index++) calls.push({
      trial_id: `FIRST_CONFIGURED_RECEIVER-${c.case_id}-${repetition}`, case_id: c.case_id, role: 'RECEIVER', turn_index
    });
  }
  requireThat(calls.length === 54, 'ASSAY_PRIMARY_CALL_COUNT');
  return calls;
}

export function continuationCallPlan(policy, manifest, continuation) {
  const calls = primaryCallPlan(manifest);
  requireThat(continuation?.schema === 'td613.loom.first-receiver-continuation/v0.1'
    && typeof continuation.authorization_record === 'string' && continuation.authorization_record.length > 0
    && /^[0-9]+$/.test(continuation.prior_reserved_cost_nanos)
    && Array.isArray(continuation.completed_prefix) && continuation.completed_prefix.length > 0
    && continuation.completed_prefix.length < calls.length, 'ASSAY_CONTINUATION_UNBOUND');
  const old = JSON.parse(readFileSync(continuation.predecessor_policy_path));
  requireThat(old.run_id !== policy.run_id && old.artifact_sha256 === policy.artifact_sha256
    && sha256(canonicalJson(old)) === continuation.predecessor_policy_sha256,
    'ASSAY_CONTINUATION_PREDECESSOR_POLICY');
  for (const key of ['provider', 'trial_family', 'model', 'response_model_ids', 'tools', 'retrieval', 'retries', 'generation_parameters', 'pricing']) {
    requireThat(canonicalJson(old.binding[key]) === canonicalJson(policy.binding[key]), 'ASSAY_CONTINUATION_MEASUREMENT_CHANGED');
  }
  requireThat(old.receiver_output_tokens === policy.receiver_output_tokens
    && ['max_input_tokens_per_call', 'max_output_tokens_per_call', 'max_response_bytes'].every(key =>
      old.binding.limits[key] === policy.binding.limits[key]), 'ASSAY_CONTINUATION_MEASUREMENT_CHANGED');
  const completed = continuation.completed_prefix;
  for (let i = 0; i < completed.length; i++) {
    const entry = completed[i], bytes = readFileSync(entry.capture_path), cap = JSON.parse(bytes);
    requireThat(sha256(bytes) === entry.capture_sha256 && canonicalJson(cap.trial) === canonicalJson(calls[i])
      && cap.status === 'CAPTURED_NOT_ADMITTED' && cap.evidence_class === 'ACTUAL_RECEIVER_TEST'
      && cap.fixture_transport === false && cap.source_commit === old.protocol_commit
      && cap.artifact_sha256 === old.artifact_sha256 && cap.response?.source_commit === old.protocol_commit
      && cap.response.response_complete === true && cap.response.provider_requests === 1
      && cap.response.retries === 0, 'ASSAY_CONTINUATION_PREFIX_CAPTURE');
    const wrapper = readFileSync(resolve(entry.capture_path, '..', 'response.body.bin'));
    requireThat(sha256(wrapper) === cap.response_sha256
      && canonicalJson(JSON.parse(wrapper)) === canonicalJson(cap.response), 'ASSAY_CONTINUATION_PREFIX_BYTES');
    const provider = Buffer.from(cap.response.provider_response_base64, 'base64');
    requireThat(sha256(provider) === cap.response.provider_response_sha256
      && canonicalJson(inspectAssayResponse(provider, old, old.receiver_output_tokens)) === canonicalJson(cap.returned)
      && canonicalJson(cap.returned) === canonicalJson(cap.response.returned), 'ASSAY_CONTINUATION_PREFIX_ANSWER');
  }
  // A fresh run starts a fresh trial; never import an earlier run's messages
  // into a partially completed multi-turn trial.
  requireThat(calls[completed.length - 1].trial_id !== calls[completed.length].trial_id,
    'ASSAY_CONTINUATION_PARTIAL_TRIAL');
  const priorCost = BigInt(continuation.prior_reserved_cost_nanos);
  const newCeiling = BigInt(Math.floor(policy.binding.limits.max_cost_usd * 1000000000));
  const remaining = calls.slice(completed.length);
  requireThat(priorCost > 0n && priorCost + newCeiling <= 10000000000n
    && remaining.length === policy.binding.limits.max_calls
    && BigInt(reservationNanos(policy, policy.receiver_output_tokens)) * BigInt(remaining.length) <= newCeiling,
    'ASSAY_CONTINUATION_AGGREGATE_BUDGET');
  return remaining;
}

export async function runFirstReceiver(policy, output, { root = process.cwd(), capture = captureServerCall, onProgress = () => {}, continuationFile = null } = {}) {
  validateAssayPolicy(policy);
  const { manifest } = loadServerManifest(root);
  const continuation = continuationFile ? JSON.parse(readFileSync(continuationFile)) : null;
  const calls = continuation ? continuationCallPlan(policy, manifest, continuation) : primaryCallPlan(manifest);
  if (!continuation) requireThat(policy.binding.limits.max_calls === 54 && policy.binding.limits.max_cost_usd === 10, 'ASSAY_AUTHORIZED_RUN_BOUND');
  const fixture = capture !== captureServerCall;
  if (!fixture) {
    requireThat(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim() === policy.protocol_commit, 'ASSAY_SOURCE_NOT_FROZEN');
    requireThat(!execFileSync('git', ['diff', 'HEAD', '--name-only'], { cwd: root, encoding: 'utf8' }).trim(), 'ASSAY_UNCOMMITTED_SOURCE');
  }
  requireThat(!existsSync(output), 'ASSAY_ATTEMPT_EXISTS');
  mkdirSync(output);
  const registration = { schema: 'td613.loom.first-receiver-run/v0.1', source_commit: policy.protocol_commit,
    artifact_sha256: policy.artifact_sha256, policy_sha256: sha256(canonicalJson(policy)),
    run_id: policy.run_id, evidence_class: fixture ? 'LOCAL_STRUCTURAL_TEST' : 'ACTUAL_RECEIVER_TEST',
    started_at: new Date().toISOString(), planned_calls: calls.length, max_cost_usd: policy.binding.limits.max_cost_usd, retries: 0,
    retained_prefix_calls: continuation?.completed_prefix.length ?? 0,
    continuation_sha256: continuation ? sha256(canonicalJson(continuation)) : null,
    aggregate_max_cost_usd: 10,
    authority: 'Active operator-directed process only; no background task, auto-resume, custody admission or comparison execution' };
  writeFileSync(join(output, 'registration.json'), JSON.stringify({ ...registration, calls }, null, 2) + '\n', { flag: 'wx' });
  const captured = new Map(), attempts = [];
  let error = null;
  for (const trial of calls) {
    try {
      const prior = captured.get(trial.trial_id) ?? [];
      const { request } = prepareServerRequest(policy, trial, { priorCaptures: prior, root });
      const directory = join(output, `${trial.trial_id}-turn-${trial.turn_index}`);
      const result = await capture(policy, request, directory, { root });
      attempts.push({ trial, directory, status: result.status, evidence_class: result.evidence_class,
        response_sha256: result.response_sha256, usage: result.returned?.usage ?? null });
      writeFileSync(join(output, 'progress.json'), JSON.stringify(attempts, null, 2) + '\n');
      onProgress({ completed_calls: attempts.length, planned_calls: calls.length, trial, status: result.status });
      requireThat(result.status === 'CAPTURED_NOT_ADMITTED', 'ASSAY_PRIMARY_CAPTURE_HELD');
      requireThat(fixture || result.evidence_class === 'ACTUAL_RECEIVER_TEST', 'ASSAY_PRIMARY_CAPTURE_CLASS');
      captured.set(trial.trial_id, [...prior, result]);
    } catch (e) { error = /^ASSAY_[A-Z_]+$/.test(e.message) ? e.message : 'ASSAY_PRIMARY_EXECUTION_HELD'; break; }
  }
  const completion = { ...registration, ended_at: new Date().toISOString(), attempted_calls: attempts.length,
    status: error ? 'HELD_EVIDENCE_GAP' : 'CAPTURED_NOT_ADMITTED', error,
    unattempted_calls: calls.length - attempts.length, custody_admitted: false, retry_authorized: false };
  writeFileSync(join(output, 'completion.json'), JSON.stringify(completion, null, 2) + '\n', { flag: 'wx' });
  return completion;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [policyFile, output, continuationFile = null] = process.argv.slice(2);
    requireThat(policyFile && output, 'ASSAY_USAGE_POLICY_NEW_DIRECTORY');
    const result = await runFirstReceiver(JSON.parse(readFileSync(policyFile)), output, {
      continuationFile, onProgress: progress => console.log(JSON.stringify(progress))
    });
    console.log(JSON.stringify(result));
    if (result.status !== 'CAPTURED_NOT_ADMITTED') process.exitCode = 2;
  } catch (e) { console.error(JSON.stringify({ status: 'HELD', error: e.message })); process.exitCode = 2; }
}
