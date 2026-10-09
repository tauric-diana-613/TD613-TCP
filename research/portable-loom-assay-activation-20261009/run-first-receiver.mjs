import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { loadServerManifest, prepareServerRequest, captureServerCall } from '../portable-loom-server-transport-20261009/server-client.mjs';
import { validateAssayPolicy, requireThat, sha256, canonicalJson } from '../../server/loom-assay-contract.js';

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

export async function runFirstReceiver(policy, output, { root = process.cwd(), capture = captureServerCall, onProgress = () => {} } = {}) {
  validateAssayPolicy(policy);
  requireThat(policy.binding.limits.max_calls === 54 && policy.binding.limits.max_cost_usd === 10, 'ASSAY_AUTHORIZED_RUN_BOUND');
  const fixture = capture !== captureServerCall;
  if (!fixture) {
    requireThat(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim() === policy.protocol_commit, 'ASSAY_SOURCE_NOT_FROZEN');
    requireThat(!execFileSync('git', ['diff', 'HEAD', '--name-only'], { cwd: root, encoding: 'utf8' }).trim(), 'ASSAY_UNCOMMITTED_SOURCE');
  }
  const { manifest } = loadServerManifest(root), calls = primaryCallPlan(manifest);
  requireThat(!existsSync(output), 'ASSAY_ATTEMPT_EXISTS');
  mkdirSync(output);
  const registration = { schema: 'td613.loom.first-receiver-run/v0.1', source_commit: policy.protocol_commit,
    artifact_sha256: policy.artifact_sha256, policy_sha256: sha256(canonicalJson(policy)),
    run_id: policy.run_id, evidence_class: fixture ? 'LOCAL_STRUCTURAL_TEST' : 'ACTUAL_RECEIVER_TEST',
    started_at: new Date().toISOString(), planned_calls: 54, max_cost_usd: 10, retries: 0,
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
      onProgress({ completed_calls: attempts.length, planned_calls: 54, trial, status: result.status });
      requireThat(result.status === 'CAPTURED_NOT_ADMITTED', 'ASSAY_PRIMARY_CAPTURE_HELD');
      requireThat(fixture || result.evidence_class === 'ACTUAL_RECEIVER_TEST', 'ASSAY_PRIMARY_CAPTURE_CLASS');
      captured.set(trial.trial_id, [...prior, result]);
    } catch (e) { error = /^ASSAY_[A-Z_]+$/.test(e.message) ? e.message : 'ASSAY_PRIMARY_EXECUTION_HELD'; break; }
  }
  const completion = { ...registration, ended_at: new Date().toISOString(), attempted_calls: attempts.length,
    status: error ? 'HELD_EVIDENCE_GAP' : 'CAPTURED_NOT_ADMITTED', error,
    unattempted_calls: 54 - attempts.length, custody_admitted: false, retry_authorized: false };
  writeFileSync(join(output, 'completion.json'), JSON.stringify(completion, null, 2) + '\n', { flag: 'wx' });
  return completion;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [policyFile, output] = process.argv.slice(2);
    requireThat(policyFile && output, 'ASSAY_USAGE_POLICY_NEW_DIRECTORY');
    const result = await runFirstReceiver(JSON.parse(readFileSync(policyFile)), output, {
      onProgress: progress => console.log(JSON.stringify(progress))
    });
    console.log(JSON.stringify(result));
    if (result.status !== 'CAPTURED_NOT_ADMITTED') process.exitCode = 2;
  } catch (e) { console.error(JSON.stringify({ status: 'HELD', error: e.message })); process.exitCode = 2; }
}
