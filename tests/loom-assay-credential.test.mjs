import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createLoomAssayCredentialHandler } from '../server/loom-assay-credential.js';
import { sha256 } from '../server/loom-assay-contract.js';
import { createLoomAssayHandler } from '../server/loom-assay.js';

const token = 'synthetic-assay-capability-for-credential-test';
const key = 'synthetic-google-key-for-credential-test';
const source = 'a'.repeat(40);
function run({ env = {}, headers = {}, method = 'GET' } = {}) {
  const environment = { GEMINI_API_KEY: key, VERCEL_GIT_COMMIT_SHA: source,
    VERCEL_ENV: 'production', TD613_LOOM_ASSAY_ACCESS_SHA256: sha256(token), ...env };
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; },
    end(raw) { this.raw = raw; this.body = JSON.parse(raw); } };
  createLoomAssayCredentialHandler({ environment })({ method, headers: {
    authorization: `Bearer ${token}`, 'x-td613-expected-source': source, ...headers
  } }, res);
  return res;
}

test('authorized exact-source observation carries only fingerprint and honest claim limits, with no network calls', () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = () => { calls++; throw new Error('network must remain closed'); };
  try {
    const res = run();
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.credential_sha256, sha256(key));
    assert.equal(res.body.source_commit, source);
    assert.equal(res.body.vercel_environment, 'production');
    assert.equal(res.body.expected_credential_matches, null);
    assert.equal(res.body.google_project_id, null);
    assert.equal(res.body.billing_tier, 'UNVERIFIED');
    assert.equal(res.body.provider_requests, 0);
    assert.equal(res.body.ledger_operations, 0);
    assert.equal(calls, 0);
    assert.equal(res.headers['Cache-Control'], 'no-store, max-age=0');
    assert.ok(!res.raw.includes(key)); assert.ok(!res.raw.includes(token));
  } finally { globalThis.fetch = originalFetch; }
});

test('missing, malformed and wrong capability disclose no provider fingerprint', () => {
  for (const authorization of [undefined, ['Bearer ' + token], 'Bearer invalid', 'Bearer ' + 'b'.repeat(40)]) {
    const res = run({ headers: { authorization } });
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.credential_sha256, undefined);
  }
  assert.equal(run({ env: { TD613_LOOM_ASSAY_ACCESS_SHA256: '' } }).statusCode, 503);
});

test('unknown or mismatched source, absent key and malformed expected fingerprint hold before disclosure', () => {
  for (const options of [
    { headers: { 'x-td613-expected-source': undefined } },
    { headers: { 'x-td613-expected-source': 'b'.repeat(40) } },
    { env: { VERCEL_GIT_COMMIT_SHA: '' } },
    { env: { GEMINI_API_KEY: '' } },
    { headers: { 'x-td613-expected-credential-sha256': 'not-a-digest' } }
  ]) {
    const res = run(options);
    assert.equal(res.statusCode, 409);
    assert.equal(res.body.credential_sha256, undefined);
  }
});

test('an expected fingerprint match identifies equality only; a mismatch holds', () => {
  const match = run({ headers: { 'x-td613-expected-credential-sha256': sha256(key) } });
  assert.equal(match.statusCode, 200);
  assert.equal(match.body.expected_credential_matches, true);
  assert.equal(match.body.billing_tier, 'UNVERIFIED');
  const mismatch = run({ headers: { 'x-td613-expected-credential-sha256': '0'.repeat(64) } });
  assert.equal(mismatch.statusCode, 409);
  assert.equal(mismatch.body.expected_credential_matches, false);
  assert.equal(mismatch.body.error, 'ASSAY_CREDENTIAL_FINGERPRINT_MISMATCH');
});

test('unexpected methods, secret aliases and workload-token echoes fail without releasing secrets', () => {
  assert.equal(run({ method: 'POST' }).statusCode, 405);
  for (const env of [{ GEMINI_API_KEY: source }, { VERCEL_OIDC_TOKEN: source }]) {
    const res = run({ env });
    assert.equal(res.statusCode, 409);
    assert.equal(res.body.error, 'ASSAY_PROTECTED_CREDENTIAL_ECHO');
    assert.ok(!res.raw.includes(source));
  }
});

test('dedicated operation dispatches before ordinary generation routes', () => {
  const api = readFileSync('api/khonapolit.js', 'utf8');
  assert.match(api, /requestedOperation\(req\) === 'loom-assay-credential'\) return loomAssayCredentialHandler\(req, res\)/);
  assert.ok(api.indexOf("=== 'loom-assay-credential'") < api.indexOf("=== 'loom-assay'"));
});

test('a changed or malformed execution-key expectation holds before any budget or provider operation', async () => {
  for (const expected of ['0'.repeat(64), 'not-a-digest', ['0'.repeat(64)]]) {
    let ledgerOperations = 0, providerRequests = 0;
    const handler = createLoomAssayHandler({ environment: {
      GEMINI_API_KEY: key, TD613_LOOM_ASSAY_ACCESS_SHA256: sha256(token), VERCEL_GIT_COMMIT_SHA: source
    }, budget: async () => { ledgerOperations++; throw new Error('should not inspect'); },
    fetchImpl: async () => { providerRequests++; throw new Error('should not generate'); } });
    const res = { setHeader() {}, end(raw) { this.body = JSON.parse(raw); } };
    await handler({ method: 'POST', body: {}, headers: { authorization: `Bearer ${token}`,
      'x-td613-expected-credential-sha256': expected } }, res);
    assert.equal(res.statusCode, 409);
    assert.equal(res.body.provider_requests, 0);
    assert.match(res.body.error, /^ASSAY_PROVIDER_CREDENTIAL_/);
    assert.equal(ledgerOperations, 0); assert.equal(providerRequests, 0);
  }
});

test('correct or absent execution expectation preserves the provider wire and reports the actual key fingerprint', async () => {
  const artifact = 'synthetic artifact only', firstUser = artifact + '\nsynthetic receiver input';
  const manifest = { artifact_sha256: sha256(artifact), receivers: [{ case_id: 'R01', maximum_assistant_outputs: 1,
    first_user_message_sha256: sha256(firstUser), later_user_messages: [] }] };
  const p = { schema: 'td613.loom.server-assay-policy/v0.2', run_id: 'fixture', protocol_commit: source,
    artifact_sha256: manifest.artifact_sha256, expires_at: '2099-01-01T00:00:00Z', receiver_output_tokens: 8192,
    binding: { provider: 'GEMINI_GENERATE_CONTENT', protocol_commit: source, trial_family: 'FIRST_CONFIGURED_RECEIVER',
      credential_env: 'GEMINI_API_KEY', model: 'gemini-3.8-flash', response_model_ids: ['gemini-3.8-flash'],
      tools: 'DISABLED', retrieval: 'DISABLED', retries: 0,
      limits: { max_calls: 1, max_cost_usd: 1, max_input_tokens_per_call: 200000, max_output_tokens_per_call: 8192,
        timeout_ms: 1000, max_response_bytes: 2000000 },
      generation_parameters: { temperature: null, top_p: null, thinking_level: 'medium' },
      pricing: { input_usd_per_million: 0.75, output_usd_per_million: 3.75,
        source: 'synthetic fixture', verified_at: '2026-10-01T00:00:00Z' },
      authorization: { record: 'synthetic fixture', scope: 'local test only' } } };
  const trial = { trial_id: 'FIRST_CONFIGURED_RECEIVER-R01-1', case_id: 'R01', role: 'RECEIVER', turn_index: 0 };
  const wires = [];
  for (const expected of [undefined, sha256(key)]) {
    const operations = [];
    const handler = createLoomAssayHandler({ environment: {
      GEMINI_API_KEY: key, TD613_LOOM_ASSAY_ACCESS_SHA256: sha256(token), VERCEL_GIT_COMMIT_SHA: source
    }, manifest, artifactText: artifact, budget: async (op, input) => {
      operations.push(op);
      if (op === 'inspect') return { policy: p };
      if (op === 'reserve') return { durable_reservation: true, request_sha256: input.request_sha256,
        call_key: `${trial.trial_id}:${trial.role}:0`, reserved_cost_nanos: '180720000' };
      return { retained: true, call_key: input.call_key, status: input.status };
    }, fetchImpl: async (url, request) => {
      wires.push({ url, body: request.body, headers: request.headers });
      return new Response(JSON.stringify({ modelVersion: 'gemini-3.8-flash',
        candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'synthetic response only' }] } }],
        usageMetadata: { promptTokenCount: 100, totalTokenCount: 110 } }));
    } });
    const res = { setHeader() {}, end(raw) { this.raw = raw; this.body = JSON.parse(raw); } };
    await handler({ method: 'POST', headers: { authorization: `Bearer ${token}`,
      ...(expected === undefined ? {} : { 'x-td613-expected-credential-sha256': expected }) },
      body: { schema: 'td613.loom.server-assay-request/v0.1', run_id: 'fixture', protocol_commit: source,
        artifact_sha256: manifest.artifact_sha256, trial, messages: [{ role: 'user', content: firstUser }] } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.provider_credential_sha256, sha256(key));
    assert.equal(res.body.status, 'CAPTURED_NOT_ADMITTED');
    assert.deepEqual(operations, ['inspect', 'reserve', 'complete']);
    assert.ok(!res.raw.includes(key));
  }
  assert.deepEqual(wires[0], wires[1]);
  assert.equal(wires.length, 2);
});
