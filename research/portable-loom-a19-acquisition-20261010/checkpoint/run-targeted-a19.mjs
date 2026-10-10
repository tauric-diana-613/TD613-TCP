import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const attempt = resolve('/workspace/scratch/26d2ceda3f9e/continuation-a19');
const caller = resolve('/workspace/scratch/26d2ceda3f9e/caller-a19');
const read = name => JSON.parse(readFileSync(join(attempt, name), 'utf8'));
const policy = read('POLICY.json');
const plan = read('PLAN.json');
const freeze = read('FREEZE_COMMIT.json');
const credential = read('CREDENTIAL_BINDING.json');
process.env.TD613_LOOM_ASSAY_EXPECTED_CREDENTIAL_SHA256 = credential.expected_provider_credential_sha256;
process.env.TD613_LOOM_ASSAY_TOKEN = readFileSync('/workspace/scratch/9d69e9b2a01d/recovery-private/assay-relay-access.token','utf8').trim();
const { sha256, canonicalJson, validateAssayPolicy, requireThat } = await import(pathToFileURL(join(caller, 'server/loom-assay-contract.js')));
const { prepareServerRequest, captureServerCall, loadServerManifest } = await import(pathToFileURL(join(caller, 'research/portable-loom-server-transport-20261009/server-client.mjs')));
const { verifyRestoredCaller } = await import(pathToFileURL(join(caller, 'restore-caller-guard.mjs')));

const { execFileSync } = await import('node:child_process');
requireThat(process.cwd() === caller && process.env.NODE_USE_ENV_PROXY === '1', 'A19_TRANSPORT_OR_CWD_MISMATCH');
requireThat(execFileSync('git', ['rev-parse', 'HEAD'], {cwd:caller,encoding:'utf8'}).trim() === freeze.local_caller_commit
  && execFileSync('git', ['status','--porcelain'], {cwd:caller,encoding:'utf8'}).trim() === '', 'A19_CALLER_GIT_CHANGED');
requireThat(sha256(readFileSync(join(attempt,'FREEZE_BUNDLE.json'))) === freeze.bundle_sha256, 'A19_BUNDLE_CHANGED');
for (const file of read('FREEZE_BUNDLE.json').files) {
  const bytes = readFileSync(join(attempt,file.path));
  requireThat(sha256(bytes) === file.sha256 && bytes.length === file.bytes
    && Buffer.from(file.content_base64,'base64').equals(bytes), 'A19_BUNDLE_MEMBER_CHANGED');
}
const bindingPath = join(attempt, 'RECONSTRUCTED_CALLER_BINDING.json');
process.env.TD613_RESTORED_CALLER_BINDING = bindingPath;
validateAssayPolicy(policy);
requireThat(policy.run_id === plan.run_id && policy.protocol_commit === plan.protocol_commit
  && sha256(canonicalJson(policy)) === freeze.policy_sha256
  && sha256(canonicalJson(plan)) === freeze.plan_sha256
  && sha256(readFileSync(join(attempt, 'run-targeted-a19.mjs'))) === plan.runner_sha256
  && plan.runner_sha256 === freeze.runner_sha256
  && sha256(readFileSync(join(caller, 'RESTORED_SOURCE_LOCK.json'))) === freeze.source_lock_sha256,
  'A19_FROZEN_BINDING_MISMATCH');
const binding = JSON.parse(readFileSync(bindingPath, 'utf8'));
requireThat(binding.local_git_commit === freeze.local_caller_commit
  && binding.deployed_commit === policy.protocol_commit, 'A19_CALLER_COMMIT_MISMATCH');
verifyRestoredCaller(policy, caller);
const { manifest, artifact } = loadServerManifest(caller);
requireThat(manifest.artifact_sha256 === policy.artifact_sha256
  && sha256(artifact) === policy.artifact_sha256
  && plan.calls.length === 2 && plan.stop_on_first_hold === true
  && policy.binding.limits.max_calls === 2 && policy.binding.retries === 0,
  'A19_EXECUTION_SCOPE_MISMATCH');

if (process.argv.includes('--preflight')) {
  console.log(JSON.stringify({ status: 'PREFLIGHT_PASS_NO_PROVIDER_CALLS', run_id: policy.run_id,
    planned_calls: plan.calls.length, caller_commit: freeze.local_caller_commit,
    protocol_commit: policy.protocol_commit, artifact_sha256: policy.artifact_sha256,
    first_provider_request_sha256: freeze.first_provider_request_sha256 }));
  process.exit(0);
}

const enrollment = read('ENROLLMENT_RECEIPT.json');
requireThat(enrollment.run_id === policy.run_id && enrollment.status === 'ACTIVE'
  && enrollment.policy_sha256 === freeze.policy_sha256
  && enrollment.calls_reserved === 0 && String(enrollment.reserved_cost_nanos) === '0',
  'A19_ENROLLMENT_NOT_READY');
const output = join(attempt, 'raw/run-001');
requireThat(!existsSync(output), 'A19_ATTEMPT_ALREADY_EXISTS');
mkdirSync(output, { recursive: false });
const started = new Date().toISOString();
writeFileSync(join(output, 'registration.json'), JSON.stringify({
  schema: 'td613.loom.receiver-repair-registration/v0.1', status: 'EXECUTION_STARTED',
  run_id: policy.run_id, freeze_sha256: sha256(canonicalJson(freeze)),
  policy_sha256: freeze.policy_sha256, plan_sha256: freeze.plan_sha256,
  transport_environment: {NODE_USE_ENV_PROXY:process.env.NODE_USE_ENV_PROXY,node_version:process.version,cwd:process.cwd()},
  started_at: started, planned_calls: plan.calls.length, retries: 0,
  stop_on_first_hold: true, custody_admitted: false
}, null, 2) + '\n', { flag: 'wx', mode: 0o600 });

const receipts = [];
const capturesByTrial = new Map();
let stop = null;
for (let index = 0; index < plan.calls.length; index += 1) {
  const item = plan.calls[index];
  const prior = capturesByTrial.get(item.trial_id) || [];
  requireThat(item.turn_index === prior.length, 'A19_PREDECESSOR_ORDER');
  const trial = { trial_id: item.trial_id, case_id: item.case_id, role: item.role, turn_index: item.turn_index };
  const { request, provider_wire: wire } = prepareServerRequest(policy, trial, { priorCaptures: prior, root: caller });
  if (item.turn_index === 0) {
    const frozenTrial = plan.trial_order.find(t => t.trial_id === item.trial_id);
    requireThat(wire.request_sha256 === frozenTrial.first_provider_request_sha256, 'A19_FIRST_WIRE_CHANGED');
  }
  requireThat(wire.reserved_cost_nanos <= plan.maximum_reserved_cost_per_call_nanos,
    'A19_CALL_RESERVATION_BOUND');
  requireThat(receipts.reduce((n,r)=>n+r.reserved_cost_nanos,0)+wire.reserved_cost_nanos <= plan.maximum_reserved_cost_nanos, 'A19_LOCAL_TOTAL_RESERVATION_BOUND');
  const directory = join(output, `call-${String(index + 1).padStart(2, '0')}`);
  const capture = await captureServerCall(policy, request, directory);
  const observedProviderCredential = capture.response?.provider_credential_sha256 ?? null;
  const capturePath = join(directory, 'capture.json');
  const receipt = {
    schema: 'td613.loom.receiver-repair-call-receipt/v0.1',
    call_number: index + 1, planned_call: item,
    status: capture.status,
    capture_path: capturePath,
    capture_sha256: sha256(readFileSync(capturePath)),
    request_sha256: capture.request_sha256,
    provider_request_sha256: wire.request_sha256,
    provider_response_sha256: capture.response?.provider_response_sha256 ?? null,
    response_sha256: capture.response_sha256,
    answer_sha256: capture.returned?.answer_sha256 ?? null,
    reserved_cost_nanos: wire.reserved_cost_nanos,
    provider_requests: capture.response?.provider_requests ?? null,
    retries: capture.response?.retries ?? 0,
    expected_provider_credential_sha256: credential.expected_provider_credential_sha256,
    observed_provider_credential_sha256: observedProviderCredential,
    response_complete: capture.response?.response_complete ?? false,
    http_status: capture.http_status,
    started_at: capture.started_at,
    ended_at: capture.ended_at
  };
  receipts.push(receipt);
  writeFileSync(join(output, `call-${String(index + 1).padStart(2, '0')}-receipt.json`),
    JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ event: 'call-captured', call_number: index + 1,
    planned_calls: plan.calls.length, trial_id: item.trial_id, turn_index: item.turn_index,
    status: capture.status, provider_http_status: capture.response?.http_status ?? null,
    reserved_cost_nanos: wire.reserved_cost_nanos, capture_sha256: receipt.capture_sha256 }));
  if (capture.status !== 'CAPTURED_NOT_ADMITTED') {
    stop = { reason: 'FIRST_HOLD', held_call_number: index + 1,
      unattempted_calls: plan.calls.slice(index + 1), retries: 0 };
    break;
  }
  prior.push(capture);
  capturesByTrial.set(item.trial_id, prior);
}

const result = {
  schema: 'td613.loom.receiver-repair-execution-result/v0.1',
  run_id: policy.run_id,
  status: stop ? 'HELD_STOPPED_ON_FIRST_HOLD' : 'ALL_PLANNED_CALLS_CAPTURED_NOT_ADMITTED',
  started_at: started, ended_at: new Date().toISOString(),
  calls_planned: plan.calls.length, calls_attempted: receipts.length,
  calls_captured_not_admitted: receipts.filter(r => r.status === 'CAPTURED_NOT_ADMITTED').length,
  calls_held: receipts.filter(r => r.status !== 'CAPTURED_NOT_ADMITTED').length,
  reserved_cost_nanos: receipts.reduce((n, r) => n + r.reserved_cost_nanos, 0),
  retries: 0, stop, receipts, custody_admitted: false,
  analysis_performed: false
};
writeFileSync(join(output, 'execution.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
console.log(JSON.stringify({ event: 'execution-complete', status: result.status,
  calls_attempted: result.calls_attempted, calls_captured_not_admitted: result.calls_captured_not_admitted,
  calls_held: result.calls_held, reserved_cost_nanos: result.reserved_cost_nanos,
  analysis_performed: false, custody_admitted: false }));
