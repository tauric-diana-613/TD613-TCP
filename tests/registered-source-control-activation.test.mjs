import './loom-assay-priority.test.mjs';
import './source-registration-negative-activation.test.mjs';
import './source-registration-aligned-activation.test.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, globSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { ASSAY_ACTIVATION_RUN_IDS, ASSAY_REQUEST_SCHEMA, ASSAY_REGISTERED_SOURCE_CONTROL_NEXT_RUN_ID, ASSAY_REGISTERED_SOURCE_CONTROL_REPLICATION_RUN_ID, ASSAY_REGISTERED_SOURCE_CONTROL_PRIORITY_RUN_ID, ASSAY_REGISTERED_SOURCE_CONTROL_NEXT_PROMPT_SHA256, ASSAY_REGISTERED_SOURCE_CONTROL_PROVIDER_CREDENTIAL_SHA256, sha256, validateAssayPolicy, requireTrialFamily, buildAssayProviderWire } from '../server/loom-assay-contract.js';
import { createLoomAssayHandler, loadApprovedRunConfiguration } from '../server/loom-assay.js';
import { loadServerManifest, prepareServerRequest } from '../research/portable-loom-server-transport-20261009/server-client.mjs';

const runId = 'portable-loom-registered-source-control-20261011-r01';
const continuationRunId = 'portable-loom-registered-source-control-20261011-r02';
const captureRunId = 'portable-loom-registered-source-control-20261011-r03';
const nextRunId = ASSAY_REGISTERED_SOURCE_CONTROL_NEXT_RUN_ID;
const replicationRunId = ASSAY_REGISTERED_SOURCE_CONTROL_REPLICATION_RUN_ID;
const priorityRunId = ASSAY_REGISTERED_SOURCE_CONTROL_PRIORITY_RUN_ID;
const protocolCommit = '82d73f92e8c560753d2604446269f01f2f856061';
const sourcePath = 'research/portable-loom-registered-source-control-20261011';
const trial = { trial_id: 'FIRST_CONFIGURED_RECEIVER-R01-1', case_id: 'R01', role: 'RECEIVER', turn_index: 0 };
function policy(manifest, selectedRunId = runId, thinkingLevel = 'medium') {
  const corrected = selectedRunId === captureRunId;
  const priority = selectedRunId === priorityRunId;
  const next = [nextRunId, replicationRunId, priorityRunId].includes(selectedRunId);
  const outputCap = corrected || next ? 32768 : 8192;
  return validateAssayPolicy({
    schema: 'td613.loom.server-assay-policy/v0.2', run_id: selectedRunId, protocol_commit: protocolCommit,
    artifact_sha256: manifest.artifact_sha256, expires_at: priority ? '2026-12-31T23:59:59Z' : '2099-01-01T00:00:00Z',
    binding: {
      schema: 'td613.loom.bound-model-transport/v0.1', protocol_commit: protocolCommit,
      provider: 'GEMINI_GENERATE_CONTENT', trial_family: 'FIRST_CONFIGURED_RECEIVER',
      model: 'gemini-3.8-flash', response_model_ids: ['gemini-3.8-flash'],
      credential_env: 'GEMINI_API_KEY', ...(priority ? { service_tier: 'priority' } : {}),
      generation_parameters: { temperature: null, top_p: null, thinking_level: thinkingLevel },
      limits: { max_calls: 1, max_input_tokens_per_call: 200000, max_output_tokens_per_call: outputCap,
        max_cost_usd: priority ? 0.5 : next ? 0.3 : corrected ? 1 : 0.25, timeout_ms: corrected || next ? 240000 : 120000, max_response_bytes: 2000000 },
      pricing: { input_usd_per_million: priority ? 1.35 : 0.75, output_usd_per_million: priority ? 6.75 : 3.75,
        source: 'https://ai.google.dev/gemini-api/docs/pricing', verified_at: '2026-10-11T00:00:00Z' },
      authorization: { record: `research/portable-loom-registered-source-control-20261011/${next ? 'next-protocol-v1/EXECUTION_AUTHORIZATION.json' : 'AUTHORIZATION.json'}`,
        scope: next ? 'One provider request, one durable reservation, maximum $0.30; no retries, tools, retrieval or custody admission.' : 'One provider request, one durable reservation, maximum $0.25; no retries, tools, retrieval or custody admission.' },
      tools: 'DISABLED', retrieval: 'DISABLED', retries: 0
    }, receiver_output_tokens: outputCap
  });
}

test('new one-call run is explicitly allowlisted without reenrolling A20', () => {
  const config = loadApprovedRunConfiguration();
  assert.ok(ASSAY_ACTIVATION_RUN_IDS.includes(runId));
  assert.ok(config.run_ids.includes(runId));
  assert.ok(ASSAY_ACTIVATION_RUN_IDS.includes(continuationRunId));
  assert.ok(config.run_ids.includes(continuationRunId));
  assert.ok(ASSAY_ACTIVATION_RUN_IDS.includes(captureRunId));
  assert.ok(config.run_ids.includes(captureRunId));
  assert.ok(ASSAY_ACTIVATION_RUN_IDS.includes(nextRunId));
  assert.ok(config.run_ids.includes(nextRunId));
  assert.ok(ASSAY_ACTIVATION_RUN_IDS.includes(replicationRunId));
  assert.ok(config.run_ids.includes(replicationRunId));
  assert.ok(config.run_ids.includes('portable-loom-first-receiver-20261010-a20'));
});

test('r04 freezes one intervention asset, exact receiver trial, and the USD 0.30 reservation ceiling', () => {
  const { manifest, artifact } = loadServerManifest(process.cwd(), nextRunId);
  const p = policy(manifest, nextRunId);
  const registration = JSON.parse(readFileSync(resolve(sourcePath, 'next-protocol-v1/ORIGIN_SOURCE_REGISTRATION.json'), 'utf8'));
  const scoring = JSON.parse(readFileSync(resolve(sourcePath, 'next-protocol-v1/SCORING_CONTRACT.json'), 'utf8'));
  const source = readFileSync(resolve(sourcePath, 'next-protocol-v1/SOURCE.txt'), 'utf8');
  const { request, provider_wire } = prepareServerRequest(p, trial, { root: process.cwd() });
  assert.equal(Buffer.byteLength(artifact, 'utf8'), 109285);
  assert.equal(manifest.artifact_sha256, ASSAY_REGISTERED_SOURCE_CONTROL_NEXT_PROMPT_SHA256);
  assert.equal(registration.origin_document.id, 'registered_fee_source_v1');
  assert.equal(registration.raw_utf8_sha256, sha256(source));
  assert.deepEqual(scoring.origin_source_context.registered_document_ids, ['registered_fee_source_v1']);
  assert.deepEqual(scoring.acceptance.used_document_ids, ['registered_fee_source_v1']);
  assert.deepEqual(scoring.acceptance.missing_information, []);
  assert.equal(provider_wire.output_limit, 32768);
  assert.equal(provider_wire.reserved_cost_nanos, 272880000);
  assert.equal(request.trial.trial_id, 'FIRST_CONFIGURED_RECEIVER-R01-1');
  assert.throws(() => requireTrialFamily(p, { ...trial, trial_id: 'FIRST_CONFIGURED_RECEIVER-R01-2' }), /ASSAY_REGISTERED_SOURCE_NEXT_TRIAL_UNBOUND/);
  const changed = structuredClone(p); changed.binding.limits.max_calls = 2;
  assert.throws(() => validateAssayPolicy(changed), /ASSAY_REGISTERED_SOURCE_NEXT_SCOPE_UNBOUND/);
  for (const mutate of [
    x => { x.artifact_sha256 = '0'.repeat(64); },
    x => { x.binding.model = 'gemini-3.8-pro'; },
    x => { x.binding.generation_parameters.thinking_level = 'low'; },
    x => { x.binding.limits.max_output_tokens_per_call = x.receiver_output_tokens = 8192; },
    x => { x.binding.limits.timeout_ms = 120000; },
    x => { x.binding.limits.max_cost_usd = 0.31; }
  ]) {
    const bad = structuredClone(p); mutate(bad);
    assert.throws(() => validateAssayPolicy(bad), /ASSAY_REGISTERED_SOURCE_NEXT_SCOPE_UNBOUND/);
  }
  const wrongArtifact = structuredClone(request); wrongArtifact.artifact_sha256 = '0'.repeat(64);
  assert.throws(() => buildAssayProviderWire(wrongArtifact, p, manifest, artifact), /ASSAY_COORDINATE_MISMATCH/);
  const expired = structuredClone(p); expired.expires_at = '2020-01-01T00:00:00Z';
  assert.throws(() => validateAssayPolicy(expired), /ASSAY_POLICY_UNBOUND_OR_EXPIRED/);
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


async function fixtureRequest(runtimeRoot = process.cwd(), selectedRunId = runId, thinkingLevel = 'medium') {
  const { manifest } = loadServerManifest(process.cwd(), selectedRunId);
  const p = policy(manifest, selectedRunId, thinkingLevel);
  const { request } = prepareServerRequest(p, trial, { root: process.cwd() });
  const token = 'A'.repeat(40), apiKey = 'test-provider-key';
  const operations = [];
  let providerCalls = 0;
  const budget = async (operation, input) => {
    operations.push(operation);
    if (operation === 'inspect') return { policy: p, calls_reserved: 0, reserved_cost_nanos: '0' };
    if (operation === 'reserve') return { durable_reservation: true, request_sha256: input.request_sha256,
      call_key: `${trial.trial_id}:${trial.role}:${trial.turn_index}`, reserved_cost_nanos: selectedRunId === priorityRunId ? '491184000' : selectedRunId === captureRunId || [nextRunId, replicationRunId].includes(selectedRunId) ? '272880000' : '180720000' };
    if (operation === 'complete') return { retained: true, call_key: input.call_key, status: input.status };
    throw new Error('unexpected budget operation');
  };
  const fetchImpl = async (_url, options) => {
    const wire = JSON.parse(options.body);
    assert.equal(wire.generationConfig.thinkingConfig.thinkingLevel, thinkingLevel);
    assert.equal(wire.generationConfig.maxOutputTokens, p.receiver_output_tokens);
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
  const previousRoot = process.cwd();
  try {
    process.chdir(runtimeRoot);
    await handler({ method: 'POST', headers: { authorization: `Bearer ${token}`,
      'x-vercel-oidc-token': 'test-oidc-token', 'x-td613-expected-credential-sha256': [nextRunId, replicationRunId, priorityRunId].includes(selectedRunId)
        ? ASSAY_REGISTERED_SOURCE_CONTROL_PROVIDER_CREDENTIAL_SHA256 : sha256(apiKey) }, body: request }, res);
  } finally { process.chdir(previousRoot); }
  return { res, operations, providerCalls };
}

function assertCaptured({ res, operations, providerCalls }) {
  const result = JSON.parse(res.body);
  assert.equal(res.statusCode, 200);
  assert.equal(result.status, 'CAPTURED_NOT_ADMITTED');
  assert.equal(result.evidence_class, 'LOCAL_STRUCTURAL_TEST');
  assert.equal(result.provider_requests, 1);
  assert.equal(result.retries, 0);
  assert.equal(providerCalls, 1);
  assert.deepEqual(operations, ['inspect', 'reserve', 'complete']);
}

test('production route selects the new manifest and completes one fixture-only request', async () => {
  assertCaptured(await fixtureRequest());
});

test('separate continuation run selects the unchanged registered-control prompt', async () => {
  const original = loadServerManifest(process.cwd(), runId);
  const continuation = loadServerManifest(process.cwd(), continuationRunId);
  assert.equal(continuation.artifact, original.artifact);
  assert.deepEqual(continuation.manifest, original.manifest);
  const capture = await fixtureRequest(process.cwd(), continuationRunId);
  assertCaptured(capture);
});

test('corrected capture preserves medium and the frozen prompt with a larger output allowance', async () => {
  const original = loadServerManifest(process.cwd(), runId);
  const next = loadServerManifest(process.cwd(), captureRunId);
  assert.equal(next.artifact, original.artifact);
  assert.deepEqual(next.manifest, original.manifest);
  const p = policy(next.manifest, captureRunId, 'medium');
  const { provider_wire } = prepareServerRequest(p, trial, { root: process.cwd() });
  assert.equal(provider_wire.output_limit, 32768);
  assert.equal(provider_wire.reserved_cost_nanos, 272880000);
  assertCaptured(await fixtureRequest(process.cwd(), captureRunId, 'medium'));
});

test('r04 fixture follows the new manifest through one complete mocked request', async () => {
  const loaded = loadServerManifest(process.cwd(), nextRunId);
  assert.equal(loaded.manifest.artifact_sha256, ASSAY_REGISTERED_SOURCE_CONTROL_NEXT_PROMPT_SHA256);
  assertCaptured(await fixtureRequest(process.cwd(), nextRunId, 'medium'));
});

test('missing runtime assets hold before reservation and provider dispatch', async () => {
  const root = mkdtempSync(resolve(tmpdir(), 'registered-control-missing-assets-'));
  try {
    const { res, operations, providerCalls } = await fixtureRequest(root);
    assert.equal(res.statusCode, 409);
    assert.equal(JSON.parse(res.body).error, 'ASSAY_PREFLIGHT_HELD');
    assert.equal(JSON.parse(res.body).provider_requests, 0);
    assert.equal(providerCalls, 0);
    assert.deepEqual(operations, ['inspect']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('Vercel-selected runtime assets permit the registered-control fixture request', async () => {
  const root = mkdtempSync(resolve(tmpdir(), 'registered-control-packaged-assets-'));
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const includeFiles = config.functions['api/khonapolit.js'].includeFiles;
  assert.ok(includeFiles.length <= 256, 'Vercel includeFiles must stay within schema limit');
  const selected = new Set(globSync(includeFiles));
  try {
    for (const path of [`${sourcePath}/next-protocol-v1/TRIAL_MANIFEST.json`, `${sourcePath}/next-protocol-v1/PROMPT.txt`]) {
      if (!selected.has(path)) continue;
      const destination = resolve(root, path);
      mkdirSync(dirname(destination), { recursive: true });
      copyFileSync(path, destination);
    }
    assertCaptured(await fixtureRequest(root, nextRunId, 'medium'));
    assertCaptured(await fixtureRequest(root, replicationRunId, 'medium'));
    assertCaptured(await fixtureRequest(root, priorityRunId, 'medium'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});


test('larger output allowance cannot widen earlier runs or change corrected decoding', () => {
  const { manifest } = loadServerManifest(process.cwd(), runId);
  for (const id of [runId, continuationRunId, 'unrelated']) {
    const p = structuredClone(policy(manifest, id));
    p.binding.limits.max_output_tokens_per_call = p.receiver_output_tokens = 32768;
    assert.throws(() => validateAssayPolicy(p), /ASSAY_NUMERICAL_LIMITS/);
  }
  for (const mutate of [
    p => { p.binding.generation_parameters.thinking_level = 'low'; },
    p => { p.binding.limits.max_calls = 4; },
    p => { p.binding.limits.max_cost_usd = 1.01; },
    p => { p.binding.limits.max_output_tokens_per_call = p.receiver_output_tokens = 65536; },
    p => { p.binding.model = 'gemini-3.8-pro'; }
  ]) {
    const p = structuredClone(policy(manifest, captureRunId)); mutate(p);
    assert.throws(() => validateAssayPolicy(p), /ASSAY_CORRECTED_CAPTURE_SCOPE_UNBOUND/);
  }
  const p = policy(manifest, captureRunId);
  assert.throws(() => requireTrialFamily(p, { ...trial, case_id: 'R02', trial_id: 'FIRST_CONFIGURED_RECEIVER-R02-1' }), /ASSAY_CORRECTED_CAPTURE_TRIAL_UNBOUND/);
});

test('r04 cannot reach reservation when its required credential expectation is missing', async () => {
  const { manifest } = loadServerManifest(process.cwd(), nextRunId);
  const p = policy(manifest, nextRunId);
  const { request } = prepareServerRequest(p, trial, { root: process.cwd() });
  const token = 'A'.repeat(40), operations = []; let providerCalls = 0;
  const handler = createLoomAssayHandler({ environment: { TD613_LOOM_ASSAY_ACCESS_SHA256: sha256(token),
    GEMINI_API_KEY: 'test-provider-key', VERCEL_GIT_COMMIT_SHA: protocolCommit },
    fetchImpl: async () => { providerCalls++; throw new Error('unexpected provider request'); },
    budget: async operation => { operations.push(operation); return { policy: p, calls_reserved: 0, reserved_cost_nanos: '0' }; } });
  const res = { headers: {}, setHeader(k,v){this.headers[k]=v;}, end(body){this.body=body;} };
  await handler({ method:'POST', headers:{ authorization:`Bearer ${token}`, 'x-vercel-oidc-token':'fixture-oidc' }, body:request },res);
  assert.equal(res.statusCode,409);
  assert.equal(JSON.parse(res.body).error,'ASSAY_PROVIDER_CREDENTIAL_EXPECTATION_REQUIRED');
  assert.deepEqual(operations,[]);
  assert.equal(providerCalls,0);
});

test('r05 replication preserves exact r04 provider bytes and cannot widen scope', async () => {
  const loaded = loadServerManifest(process.cwd(), replicationRunId);
  const old = prepareServerRequest(policy(loaded.manifest, nextRunId), trial);
  const p = policy(loaded.manifest, replicationRunId);
  const fresh = prepareServerRequest(p, trial);
  assert.equal(fresh.provider_wire.body, old.provider_wire.body);
  assert.equal(fresh.provider_wire.request_sha256, '47dcecf8c2ecf1b56a671dcae04f4d01d3976aa2431e946ff2b3cc6edb44a3c6');
  assert.equal(fresh.provider_wire.reserved_cost_nanos, 272880000);
  for (const mutate of [x => {x.binding.limits.max_calls=2;}, x => {x.binding.generation_parameters.thinking_level='low';}, x => {x.artifact_sha256='0'.repeat(64);}]) {
    const bad=structuredClone(p); mutate(bad);
    assert.throws(() => validateAssayPolicy(bad), /ASSAY_REGISTERED_SOURCE_NEXT_SCOPE_UNBOUND/);
  }
  assert.throws(() => requireTrialFamily(p, {...trial,trial_id:'FIRST_CONFIGURED_RECEIVER-R01-2'}), /ASSAY_REGISTERED_SOURCE_NEXT_TRIAL_UNBOUND/);
  assertCaptured(await fixtureRequest(process.cwd(), replicationRunId, 'medium'));
});
