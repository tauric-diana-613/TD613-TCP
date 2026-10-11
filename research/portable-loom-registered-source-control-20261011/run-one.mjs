import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadServerManifest, prepareServerRequest, captureServerCall } from '../portable-loom-server-transport-20261009/server-client.mjs';
import { requireThat, validateAssayPolicy } from '../../server/loom-assay-contract.js';

const RUN_ID = 'portable-loom-registered-source-control-20261011-r01';
const TRIAL = Object.freeze({ trial_id: 'FIRST_CONFIGURED_RECEIVER-R01-1', case_id: 'R01', role: 'RECEIVER', turn_index: 0 });
export async function runOne(policyPath, outputDirectory) {
  requireThat(policyPath && outputDirectory, 'REGISTERED_CONTROL_ARGUMENTS');
  const policy = validateAssayPolicy(JSON.parse(readFileSync(policyPath, 'utf8')));
  requireThat(policy.run_id === RUN_ID && policy.binding.limits.max_calls === 1
    && policy.binding.limits.max_cost_usd <= 0.25 && policy.binding.retries === 0
    && policy.binding.tools === 'DISABLED' && policy.binding.retrieval === 'DISABLED', 'REGISTERED_CONTROL_SCOPE');
  const { manifest } = loadServerManifest(process.cwd(), RUN_ID);
  requireThat(manifest.receivers.length === 1 && manifest.receivers[0].case_id === TRIAL.case_id
    && manifest.receivers[0].maximum_assistant_outputs === 1, 'REGISTERED_CONTROL_TRIAL');
  const { request } = prepareServerRequest(policy, TRIAL, { root: process.cwd() });
  return captureServerCall(policy, request, resolve(outputDirectory));
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await runOne(process.argv[2], process.argv[3]);
    process.stdout.write(JSON.stringify({ status: result.status, error: result.error, provider_requests: result.response?.provider_requests ?? 1,
      retries: result.retries, run_id: result.run_id, source_commit: result.source_commit, request_sha256: result.request_sha256 }) + '\n');
    if (result.status !== 'CAPTURED_NOT_ADMITTED') process.exitCode = 2;
  } catch (error) {
    process.stderr.write(JSON.stringify({ status: 'HELD', error: error.message }) + '\n');
    process.exitCode = 2;
  }
}
