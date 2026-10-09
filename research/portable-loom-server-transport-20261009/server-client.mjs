import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { ASSAY_REQUEST_SCHEMA, ASSAY_RESPONSE_SCHEMA, ASSAY_CLIENT_RETURN_MARGIN_MS, sha256, requireThat, validateAssayPolicy, buildAssayProviderWire, inspectAssayResponse } from '../../server/loom-assay-contract.js';

const estate = 'research/portable-loom-server-transport-20261009';
export function loadServerManifest(root = process.cwd()) {
  const manifest = JSON.parse(readFileSync(resolve(root, estate, 'TRIAL_MANIFEST.json')));
  const artifact = readFileSync(resolve(root, manifest.artifact_path), 'utf8');
  requireThat(sha256(artifact) === manifest.artifact_sha256, 'ASSAY_CORRECTED_ARTIFACT_CHANGED');
  return { manifest, artifact };
}
export function prepareServerRequest(policy, trial, { priorCaptures = [], comparisonPrompt = null, root = process.cwd() } = {}) {
  validateAssayPolicy(policy);
  const { manifest, artifact } = loadServerManifest(root);
  let messages;
  if (trial.role === 'RECEIVER') {
    const c = manifest.receivers.find(c => c.case_id === trial.case_id);
    requireThat(c && priorCaptures.length === trial.turn_index, 'ASSAY_PREDECESSOR_COUNT');
    messages = [];
    for (let i = 0; i <= trial.turn_index; i++) {
      messages.push({ role: 'user', content: i === 0 ? artifact + c.first_user_suffix : c.later_user_messages[i - 1] });
      if (i < trial.turn_index) {
        const cap = priorCaptures[i];
        requireThat(cap?.status === 'CAPTURED_NOT_ADMITTED' && cap.evidence_class === 'ACTUAL_RECEIVER_TEST'
          && cap.trial.trial_id === trial.trial_id && cap.trial.case_id === trial.case_id && cap.trial.turn_index === i
          && cap.source_commit === policy.protocol_commit && cap.artifact_sha256 === policy.artifact_sha256
          && cap.returned?.answer_sha256 === sha256(cap.returned.text), 'ASSAY_PREDECESSOR_CAPTURE_HELD');
        messages.push({ role: 'assistant', content: cap.returned.text });
      }
    }
  } else messages = [{ role: 'user', content: comparisonPrompt }];
  const request = { schema: ASSAY_REQUEST_SCHEMA, run_id: policy.run_id, protocol_commit: policy.protocol_commit,
    artifact_sha256: policy.artifact_sha256, trial, messages };
  const wire = buildAssayProviderWire(request, policy, manifest, artifact);
  return { request, provider_wire: wire };
}
export async function captureServerCall(policy, request, directory, { environment = process.env, fetchImpl = fetch } = {}) {
  validateAssayPolicy(policy);
  const fixture = fetchImpl !== globalThis.fetch;
  const { manifest, artifact } = loadServerManifest();
  const wire = buildAssayProviderWire(request, policy, manifest, artifact);
  const token = environment.TD613_LOOM_ASSAY_TOKEN;
  requireThat(typeof token === 'string' && /^[a-zA-Z0-9_-]{32,256}$/.test(token), 'ASSAY_CALLER_CAPABILITY_UNBOUND');
  if (!fixture) {
    const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    requireThat(head === policy.protocol_commit, 'ASSAY_SOURCE_NOT_FROZEN');
    requireThat(!execFileSync('git', ['diff', 'HEAD', '--name-only'], { encoding: 'utf8' }).trim(), 'ASSAY_UNCOMMITTED_SOURCE');
  }
  requireThat(!existsSync(directory), 'ASSAY_ATTEMPT_EXISTS');
  const body = Buffer.from(JSON.stringify(request));
  requireThat(!body.includes(Buffer.from(token)), 'ASSAY_CALLER_CAPABILITY_IN_PAYLOAD');
  mkdirSync(directory, { recursive: false });
  writeFileSync(join(directory, 'request.body.json'), body, { flag: 'wx', mode: 0o600 });
  writeFileSync(join(directory, 'provider-request.body.json'), wire.body, { flag: 'wx', mode: 0o600 });
  const url = 'https://td613.com/api/khonapolit?operation=loom-assay';
  const started = new Date().toISOString();
  const record = { schema: 'td613.loom.server-assay-capture/v0.1', source_commit: policy.protocol_commit,
    artifact_sha256: policy.artifact_sha256, trial: request.trial, fixture_transport: fixture,
    evidence_class: fixture ? 'LOCAL_STRUCTURAL_TEST' : 'ACTUAL_RECEIVER_TEST', url,
    request_sha256: sha256(body), provider_request_sha256: wire.request_sha256, started_at: started, retries: 0 };
  writeFileSync(join(directory, 'request.json'), JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), policy.binding.limits.timeout_ms + ASSAY_CLIENT_RETURN_MARGIN_MS);
  const chunks = []; let response, parsed = null, error = null, length = 0;
  const relayLimit = policy.binding.limits.max_response_bytes * 3 + 32768;
  try {
    response = await fetchImpl(url, { method: 'POST', redirect: 'error', signal: controller.signal,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body });
    for await (const chunk of response.body) {
      const data = Buffer.from(chunk), available = Math.max(0, relayLimit - length);
      chunks.push(data.subarray(0, available)); length += data.length;
      if (length > relayLimit) { controller.abort(); throw new Error('ASSAY_CAPTURE_BYTE_LIMIT'); }
    }
    parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    requireThat(response.ok && parsed.schema === ASSAY_RESPONSE_SCHEMA && parsed.status === 'CAPTURED_NOT_ADMITTED'
      && parsed.source_commit === policy.protocol_commit && parsed.artifact_sha256 === policy.artifact_sha256
      && JSON.stringify(parsed.trial) === JSON.stringify(request.trial) && parsed.provider_requests === 1 && parsed.retries === 0
      && parsed.provider_request_sha256 === wire.request_sha256 && parsed.response_complete === true
      && parsed.evidence_class === (fixture ? 'LOCAL_STRUCTURAL_TEST' : 'ACTUAL_RECEIVER_TEST'), 'ASSAY_SERVER_CAPTURE_HELD');
    const providerBytes = Buffer.from(parsed.provider_response_base64, 'base64');
    requireThat(sha256(providerBytes) === parsed.provider_response_sha256 && parsed.returned?.answer_sha256 === sha256(parsed.returned.text), 'ASSAY_SERVER_BYTES_MISMATCH');
    const independentlyDecoded = inspectAssayResponse(providerBytes, policy, wire.output_limit, wire.input_token_bound);
    requireThat(JSON.stringify(independentlyDecoded) === JSON.stringify(parsed.returned), 'ASSAY_RETURN_DECLARATION_MISMATCH');
  } catch (e) { error = /^ASSAY_[A-Z_]+$/.test(e.message) ? e.message : 'ASSAY_CAPTURE_TRANSPORT_HELD'; }
  finally { clearTimeout(timer); }
  const raw = Buffer.concat(chunks), secretEcho = raw.includes(Buffer.from(token));
  if (secretEcho) { parsed = null; error = 'ASSAY_CALLER_CAPABILITY_ECHO'; }
  writeFileSync(join(directory, secretEcho ? 'PRIVATE_CREDENTIAL_ECHO.bin' : 'response.body.bin'), raw, { flag: 'wx', mode: 0o600 });
  const result = { ...record, ended_at: new Date().toISOString(), http_status: response?.status ?? null,
    response_sha256: sha256(raw), releasable: !secretEcho, status: error ? 'HELD_EVIDENCE_GAP' : 'CAPTURED_NOT_ADMITTED', error,
    returned: error ? null : parsed.returned,
    response: parsed, origin_scope: fixture ? 'MOCK_HTTP_FIXTURE_ONLY' : 'HTTPS_RESPONSE_FROM_TD613; provider-origin fields separately server-declared' };
  writeFileSync(join(directory, 'capture.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
  return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [mode, policyFile, requestFile, output] = process.argv.slice(2);
    requireThat(mode === 'call' && policyFile && requestFile && output, 'ASSAY_USAGE_CALL_POLICY_REQUEST_NEW_DIRECTORY');
    const result = await captureServerCall(JSON.parse(readFileSync(policyFile)), JSON.parse(readFileSync(requestFile)), output);
    console.log(JSON.stringify({ status: result.status, source_commit: result.source_commit, response_sha256: result.response_sha256 }));
    if (result.status !== 'CAPTURED_NOT_ADMITTED') process.exitCode = 2;
  } catch (error) { console.error(JSON.stringify({ status: 'HELD', error: error.message })); process.exitCode = 2; }
}
