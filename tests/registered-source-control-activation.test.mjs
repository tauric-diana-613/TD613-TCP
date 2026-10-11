import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ASSAY_ACTIVATION_RUN_IDS, ASSAY_REQUEST_SCHEMA, sha256, validateAssayPolicy, buildAssayProviderWire } from '../server/loom-assay-contract.js';
import { createLoomAssayHandler, loadApprovedRunConfiguration } from '../server/loom-assay.js';
import { loadServerManifest, prepareServerRequest } from '../research/portable-loom-server-transport-20261009/server-client.mjs';

const runId = 'portable-loom-registered-source-control-20261011-r01';
const protocolCommit = '82d73f92e8c560753d2604446269f01f2f856061';
const sourcePath = 'research/portable-loom-registered-source-control-20261011';
const trial = { trial_id: 'FIRST_CONFIGURED_RECEIVER-R01-1', case_id: 'R01', role: 'RECEIVER', turn_index: 0 };
function policy(manifest) {
  return validateAssayPolicy({
    schema: 'td613.loom.server-assay-policy/v0.2', run_id: runId, protocol_commit: protocolCommit,
    artifact_sha256: manifest.artifact_sha256, expires_at: '2099-01-01T00:00:00Z',
    binding: {
      schema: 'td613.loom.bound-model-transport/v0.1', protocol_commit: protocolCommit,
      provider: 'GEMINI_GENERATE_CONTENT', trial_family: 'FIRST_CONFIGURED_RECEIVER',
      model: 'gemini-3.8-flash', response_model_ids: ['gemini-3.8-flash'],
      credential_env: 'GEMINI_API_KEY',
      generation_parameters: { temperature: null, top_p: null, thinking_level: 'medium' },
      limits: { max_calls: 1, max_input_tokens_per_call: 200000, max_output_tokens_per_call: 8192,
        max_cost_usd: 0.25, timeout_ms: 120000, max_response_bytes: 2000000 },
      pricing: { input_usd_per_million: 0.75, output_usd_per_million: 3.75,
        source: 'https://ai.google.dev/gemini-api/docs/pricing', verified_at: '2026-10-11T00:00:00Z' },
      authorization: { record: 'research/portable-loom-registered-source-control-20261011/AUTHORIZATION.json',
        scope: 'One provider request, one durable reservation, maximum $0.25; no retries, tools, retrieval or custody admission.' },
      tools: 'DISABLED', retrieval: 'DISABLED', retries: 0
    }, receiver_output_tokens: 8192
  });
}

test('new one-call run is explicitly allowlisted without reenrolling A20', () => {
  const config = loadApprovedRunConfiguration();
  assert.ok(ASSAY_ACTIVATION_RUN_IDS.includes(runId));
  assert.ok(config.run_ids.includes(runId));
  assert.ok(config.run_ids.includes('portable-loom-first-receiver-20261010-a20'));
});

test('positive-control prompt, source registry, exact trial and bounded request are source-bound', () => {
  const { manifest, artifact } = loadServerManifest(process.cwd(), runId);
  const registration = JSON.parse(readFileSync(resolve(sourcePath, 'ORIGIN_SOURCE_REGISTRATION.json'), 'utf8'));
  const source = readFileSync(resolve(sourcePath, 'SOURCE.txt'), 'utf8');
  assert.equal(manifest.receivers.length, 1);
  assert.equal(manifest.artifact_sha256, sha256(artifact));
  assert.equal(manifest.receivers[0].first_user_message_sha256, sha256(artifact));
  assert.equal(registration.origin_document.id, 'registered_fee_source_v1');
  assert.equal(registration.raw_utf8_sha256, sha256(source));
  const p = policy(manifest);
  const { request, provider_wire } = prepareServerRequest(p, trial, { root: process.cwd() });
  assert.equal(request.schema, ASSAY_REQUEST_SCHEMA);
  assert.equal(request.run_id, runId);
  assert.equal(request.messages.length, 1);
  assert.equal(request.messages[0].content, artifact);
  const rebuilt = buildAssayProviderWire(request, p, manifest, artifact);
  assert.equal(rebuilt.request_sha256, provider_wire.request_sha256);
  assert.equal(rebuilt.reserved_cost_nanos, 180720000);
  assert.ok(rebuilt.reserved_cost_nanos <= 250000000);
  assert.equal(p.binding.limits.max_calls, 1);
  assert.equal(p.binding.retries, 0);
  assert.equal(p.binding.tools, 'DISABLED');
  assert.equal(p.binding.retrieval, 'DISABLED');
});


test('production route selects the new manifest and completes one fixture-only request', async () => {
  const { manifest } = loadServerManifest(process.cwd(), runId);
  const p = policy(manifest);
  const { request } = prepareServerRequest(p, trial, { root: process.cwd() });
  const token = 'A'.repeat(40), apiKey = 'test-provider-key';
  const operations = [];
  let providerCalls = 0;
  const budget = async (operation, input) => {
    operations.push(operation);
    if (operation === 'inspect') return { policy: p, calls_reserved: 0, reserved_cost_nanos: '0' };
    if (operation === 'reserve') return { durable_reservation: true, request_sha256: input.request_sha256,
      call_key: `${trial.trial_id}:${trial.role}:${trial.turn_index}`, reserved_cost_nanos: '180720000' };
    if (operation === 'complete') return { retained: true, call_key: input.call_key, status: input.status };
    throw new Error('unexpected budget operation');
  };
  const fetchImpl = async () => {
    providerCalls++;
    return new Response(JSON.stringify({ modelVersion: 'gemini-3.8-flash',
      usageMetadata: { promptTokenCount: 1, totalTokenCount: 5 },
      candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'One local fixture result.' }] } }] }),
      { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const handler = createLoomAssayHandler({ environment: {
    TD613_LOOM_ASSAY_ACCESS_SHA256: sha256(token), GEMINI_API_KEY: apiKey,
    VERCEL_GIT_COMMIT_SHA: protocolCommit
  }, fetchImpl, budget });
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(body) { this.body = body; } };
  await handler({ method: 'POST', headers: { authorization: `Bearer ${token}`,
    'x-vercel-oidc-token': 'test-oidc-token', 'x-td613-expected-credential-sha256': sha256(apiKey) }, body: request }, res);
  const result = JSON.parse(res.body);
  assert.equal(res.statusCode, 200);
  assert.equal(result.status, 'CAPTURED_NOT_ADMITTED');
  assert.equal(result.evidence_class, 'LOCAL_STRUCTURAL_TEST');
  assert.equal(result.provider_requests, 1);
  assert.equal(result.retries, 0);
  assert.equal(providerCalls, 1);
  assert.deepEqual(operations, ['inspect', 'reserve', 'complete']);
});
