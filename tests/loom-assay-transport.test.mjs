import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLoomAssayHandler, loadApprovedRunConfiguration } from '../server/loom-assay.js';
import { ASSAY_CLIENT_RETURN_MARGIN_MS, buildAssayProviderWire, validateAssayPolicy, sha256 } from '../server/loom-assay-contract.js';
import { loadServerManifest, prepareServerRequest, captureServerCall } from '../research/portable-loom-server-transport-20261009/server-client.mjs';
import { createAssayBudgetClient } from '../server/loom-assay-budget-client.js';
import { createAssayBudgetFunction } from '../neon/functions/loom-assay-budget/index.mjs';

const token = 'synthetic-caller-capability-613-32-characters', key = 'synthetic-server-key-613';
const head = 'a'.repeat(40), { manifest, artifact } = loadServerManifest();
function policy() {
  const binding = JSON.parse(readFileSync('research/portable-loom-server-transport-20261009/POLICY.template.json')).binding;
  binding.protocol_commit = head; binding.limits.max_cost_usd = 10;
  binding.pricing = { input_usd_per_million: 1, output_usd_per_million: 2, source: 'synthetic fixture pricing', verified_at: '2026-10-01T00:00:00Z' };
  return { schema: 'td613.loom.server-assay-policy/v0.2', run_id: 'fixture', protocol_commit: head,
    artifact_sha256: manifest.artifact_sha256, expires_at: '2099-01-01T00:00:00Z', binding, receiver_output_tokens: 8192 };
}
const trial = { trial_id: 'FIRST_CONFIGURED_RECEIVER-R01-1', case_id: 'R01', role: 'RECEIVER', turn_index: 0 };
function payload(text = 'Synthetic provider response.') { return { candidates: [{ finishReason: 'STOP', content: { parts: [{ text }] } }],
  modelVersion: 'gemini-3.8-flash', usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 12, thoughtsTokenCount: 3, totalTokenCount: 115 } }; }
function harness({ p = policy(), change = x => x, fetchOverride, budgetOverride, envOverride = {} } = {}) {
  const request = structuredClone(prepareServerRequest(p, trial).request); change(request);
  const operations = [], sent = [];
  const budget = budgetOverride ?? (async (op, input) => {
    operations.push({ op, input });
    if (op === 'inspect') return { policy: p };
    if (op === 'reserve') return { durable_reservation: true, call_key: `${input.trial.trial_id}:${input.trial.role}:${input.trial.turn_index}`,
      request_sha256: input.request_sha256, reserved_cost_nanos: String(p.binding.limits.max_input_tokens_per_call * 1000 + input.output_limit * 2000) };
    return { retained: true, call_key: input.call_key, status: input.status };
  });
  const fetchImpl = async (...args) => { sent.push(args); return fetchOverride ? fetchOverride(...args) : new Response(JSON.stringify(payload())); };
  const environment = { GEMINI_API_KEY: key, TD613_LOOM_ASSAY_ACCESS_SHA256: sha256(token), VERCEL_GIT_COMMIT_SHA: head, ...envOverride };
  const handler = createLoomAssayHandler({ environment, fetchImpl, budget, manifest, artifactText: artifact });
  return { request, operations, sent, handler, async run({ method = 'POST', auth = `Bearer ${token}` } = {}) {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(raw) { this.body = JSON.parse(raw); } };
    await handler({ method, headers: { authorization: auth }, body: request }, res);
    return res;
  } };
}
test('full corrected packet reaches one explicit provider request after durable reservation', async () => {
  const h = harness(), r = await h.run();
  assert.equal(r.statusCode, 200); assert.equal(h.sent.length, 1);
  const body = JSON.parse(h.sent[0][1].body);
  assert.ok(Buffer.byteLength(body.contents[0].parts[0].text) > 90000);
  assert.equal(body.contents[0].parts[0].text, artifact + manifest.receivers[0].first_user_suffix);
  assert.equal(body.generationConfig.maxOutputTokens, 8192); assert.equal(body.tools, undefined);
  assert.equal(h.sent[0][1].redirect, 'error'); assert.equal(h.sent[0][1].headers['x-goog-api-key'], key);
  assert.deepEqual(h.operations.map(x => x.op), ['inspect', 'reserve', 'complete']);
  assert.equal(r.body.evidence_class, 'LOCAL_STRUCTURAL_TEST'); assert.equal(r.body.retries, 0);
  assert.equal(sha256(Buffer.from(r.body.provider_response_base64, 'base64')), r.body.provider_response_sha256);
  assert.ok(!JSON.stringify(r.body).includes(key));
});
test('disabled and unauthorized requests cannot inspect the ledger or generate', async () => {
  for (const settings of [{ envOverride: { TD613_LOOM_ASSAY_ACCESS_SHA256: '' } }, {}]) {
    const h = harness(settings), r = await h.run({ auth: 'Bearer invalid' });
    assert.ok([401, 503].includes(r.statusCode)); assert.equal(h.sent.length, 0); assert.equal(h.operations.length, 0);
  }
});
test('missing numerical limits, expired policy and missing pricing fail closed', () => {
  for (const mutate of [p => p.binding.limits.max_cost_usd = null, p => p.expires_at = '2000-01-01', p => p.binding.pricing.source = null]) {
    const p = policy(); mutate(p); assert.throws(() => validateAssayPolicy(p));
  }
});
test('changed artifact, added tool request, wrong source and unregistered trial do not generate', async () => {
  for (const mutate of [r => r.artifact_sha256 = '0'.repeat(64), r => r.tools = ['search'], r => r.protocol_commit = 'b'.repeat(40),
    r => r.trial.trial_id = 'FIRST_CONFIGURED_RECEIVER-R01-4', r => r.messages[0].content += '\nInjected change']) {
    const h = harness({ change: mutate }), r = await h.run();
    assert.equal(r.statusCode, 409); assert.equal(h.sent.length, 0); assert.ok(!h.operations.some(x => x.op === 'reserve'));
  }
});
test('the second provider slot cannot be silently filled by this Gemini conduit', () => {
  assert.throws(() => prepareServerRequest(policy(), { ...trial, trial_id: 'SECOND_PROVIDER-R01-1' }), /SECOND_PROVIDER_UNBOUND/);
});
test('first-receiver authority cannot be spent on registered comparative prompts', () => {
  const p = policy();
  assert.throws(() => prepareServerRequest(p, { trial_id: 'COMPARE-K01-1', case_id: 'K01', role: 'MONOLITH', turn_index: 0 },
    { comparisonPrompt: 'comparison' }), /TRIAL_FAMILY_UNAUTHORIZED/);
  delete p.binding.trial_family; assert.throws(() => validateAssayPolicy(p), /MODEL_BINDING/);
});
test('credential material cannot enter outbound input or releasable response', async () => {
  let h = harness({ change: r => r.messages[0].content += key }), r = await h.run();
  assert.equal(h.sent.length, 0); assert.equal(r.body.error, 'ASSAY_PROTECTED_CREDENTIAL_IN_PAYLOAD');
  h = harness({ fetchOverride: async () => new Response(JSON.stringify(payload(key))) }); r = await h.run();
  assert.equal(r.body.error, 'ASSAY_PROTECTED_CREDENTIAL_ECHO'); assert.equal(r.body.provider_response_base64, null);
  assert.equal(r.body.returned, null); assert.ok(!JSON.stringify(r.body).includes(key));
});
test('budget refusal or mismatched reservation prevents generation', async () => {
  for (const reserveResult of [null, { durable_reservation: false }]) {
    const h = harness({ budgetOverride: async (op) => {
      if (op === 'inspect') return { policy: policy() };
      if (!reserveResult) throw new Error('ASSAY_BUDGET_EXHAUSTED');
      return reserveResult;
    } }), r = await h.run();
    assert.equal(r.statusCode, 409); assert.equal(h.sent.length, 0);
  }
});
test('non-success, truncated, wrong-model and over-budget returns retain one failed call without retry', async () => {
  const variants = [async () => new Response('quota failure', { status: 429 }), async () => new Response(JSON.stringify({ ...payload(), modelVersion: 'wrong-model' })),
    async () => new Response(JSON.stringify({ ...payload(), usageMetadata: { promptTokenCount: 100, totalTokenCount: 10000 } })),
    async () => new Response(JSON.stringify({ ...payload(), candidates: [{ finishReason: 'MAX_TOKENS' }] }))];
  for (const fetchOverride of variants) {
    const h = harness({ fetchOverride }), r = await h.run();
    assert.equal(r.body.status, 'HELD_EVIDENCE_GAP'); assert.equal(h.sent.length, 1);
    assert.equal(h.operations.at(-1).input.status, 'HELD_EVIDENCE_GAP'); assert.equal(r.body.retries, 0);
  }
});
test('response byte overflow retains a bounded prefix and identifies incomplete capture', async () => {
  const p = policy(); p.binding.limits.max_response_bytes = 32;
  const h = harness({ p }), r = await h.run();
  assert.equal(r.body.error, 'ASSAY_RESPONSE_BYTE_LIMIT'); assert.equal(r.body.response_complete, false);
  assert.equal(Buffer.from(r.body.provider_response_base64, 'base64').length, 32);
});
test('an expired provider deadline is explicit, retains one failed reservation, and never retries', async () => {
  const p = policy(); p.binding.limits.timeout_ms = 20;
  const h = harness({ p, fetchOverride: async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('synthetic abort', 'AbortError')), { once: true });
  }) });
  const r = await h.run();
  assert.equal(r.body.error, 'ASSAY_PROVIDER_DEADLINE_EXCEEDED');
  assert.equal(r.body.provider_deadline_expired, true); assert.equal(r.body.provider_deadline_ms, 20);
  assert.equal(r.body.response_complete, false); assert.equal(r.body.http_status, null);
  assert.equal(r.body.provider_response_base64, ''); assert.equal(h.sent.length, 1);
  assert.equal(h.operations.at(-1).input.status, 'HELD_EVIDENCE_GAP'); assert.equal(r.body.retries, 0);
});
test('the bounded deadline admits a delayed response and fits inside the function duration with completion margin', async () => {
  const p = policy(); p.binding.limits.timeout_ms = 240000;
  const h = harness({ p, fetchOverride: async () => {
    await new Promise(resolve => setTimeout(resolve, 35)); return new Response(JSON.stringify(payload()));
  } });
  const r = await h.run(); assert.equal(r.body.status, 'CAPTURED_NOT_ADMITTED');
  assert.equal(r.body.provider_deadline_expired, false); assert.equal(r.body.provider_deadline_ms, 240000);
  const config = JSON.parse(readFileSync('vercel.json'));
  assert.ok(config.functions['api/khonapolit.js'].maxDuration * 1000 >= p.binding.limits.timeout_ms + 60000);
  assert.ok(ASSAY_CLIENT_RETURN_MARGIN_MS >= 3 * 8000 + 15000, 'client permits all three bounded ledger round trips and response flight');
  assert.ok(ASSAY_CLIENT_RETURN_MARGIN_MS < 60000, 'client margin remains within the bounded host completion margin');
  p.binding.limits.timeout_ms = 240001; assert.throws(() => validateAssayPolicy(p), /NUMERICAL_LIMITS/);
});
test('failed completion cannot be presented as a completed provider trial', async () => {
  const p = policy(); const wire = buildAssayProviderWire(prepareServerRequest(p, trial).request, p, manifest, artifact);
  const h = harness({ budgetOverride: async op => {
    if (op === 'inspect') return { policy: p };
    if (op === 'reserve') return { durable_reservation: true, call_key: 'FIRST_CONFIGURED_RECEIVER-R01-1:RECEIVER:0', request_sha256: wire.request_sha256, reserved_cost_nanos: String(wire.reserved_cost_nanos) };
    throw new Error('completion transport failed');
  } }), r = await h.run();
  assert.equal(r.body.error, 'ASSAY_COMPLETION_UNCONFIRMED'); assert.equal(r.body.status, 'HELD_EVIDENCE_GAP');
});
test('budget client rejects arbitrary endpoints and missing workload identity', async () => {
  let calls = 0;
  for (const environment of [{ TD613_LOOM_ASSAY_BUDGET_URL: 'https://evil.invalid', VERCEL_OIDC_TOKEN: 'test' }, {}]) {
    await assert.rejects(createAssayBudgetClient({ environment, fetchImpl: async () => { calls++; } })('inspect', {}));
  }
  assert.equal(calls, 0);
});
test('budget function verifies workload before body parsing or database work', async () => {
  let connects = 0;
  const fn = createAssayBudgetFunction({ pool: { connect: async () => { connects++; } }, verifyWorkload: async () => { throw new Error('bad signature'); } });
  const r = await fn.fetch(new Request('https://budget.invalid', { method: 'POST', body: 'invalid JSON', headers: { authorization: 'Bearer bad' } }));
  assert.equal(r.status, 401); assert.equal(connects, 0);
});
test('budget dispatch rejects inherited operation names and oversized bodies before database work', async () => {
  let connects = 0;
  const fn = createAssayBudgetFunction({ pool: { connect: async () => { connects++; } }, verifyWorkload: async () => ({}) });
  for (const body of [JSON.stringify({ schema: 'td613.loom.assay-budget-request/v0.1', operation: 'constructor', input: {} }), 'x'.repeat(16001)]) {
    const r = await fn.fetch(new Request('https://budget.invalid', { method: 'POST', body, headers: { authorization: 'Bearer fixture' } }));
    assert.equal(r.status, 409); assert.equal(connects, 0);
  }
});
test('client retains exact mock bytes, keeps fixture evidence class, and rejects existing attempts', async () => {
  const root = mkdtempSync(join(tmpdir(), 'td613-server-capture-')), path = join(root, 'attempt');
  try {
    const h = harness(), r = await h.run();
    const result = await captureServerCall(policy(), h.request, path, { environment: { TD613_LOOM_ASSAY_TOKEN: token },
      fetchImpl: async () => new Response(JSON.stringify(r.body)) });
    assert.equal(result.status, 'CAPTURED_NOT_ADMITTED'); assert.equal(result.evidence_class, 'LOCAL_STRUCTURAL_TEST');
    assert.deepEqual(result.returned, r.body.returned);
    assert.equal(sha256(readFileSync(join(path, 'response.body.bin'))), result.response_sha256);
    await assert.rejects(captureServerCall(policy(), h.request, path, { environment: { TD613_LOOM_ASSAY_TOKEN: token }, fetchImpl: async () => {} }), /ATTEMPT_EXISTS/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test('the retained capture exposes the verified answer used by continuation and keeps fixture authority closed', async () => {
  const root = mkdtempSync(join(tmpdir(), 'td613-server-continuation-'));
  try {
    const first = { ...trial, case_id: 'R02', trial_id: 'FIRST_CONFIGURED_RECEIVER-R02-1' };
    const p = policy(), h = harness(), response = await h.run();
    response.body.trial = first;
    const request = prepareServerRequest(p, first).request;
    response.body.provider_request_sha256 = buildAssayProviderWire(request, p, manifest, artifact).request_sha256;
    const cap = await captureServerCall(p, request, join(root, 'first'), {
      environment: { TD613_LOOM_ASSAY_TOKEN: token }, fetchImpl: async () => new Response(JSON.stringify(response.body))
    });
    assert.equal(cap.returned.text, payload().candidates[0].content.parts[0].text);
    const next = { ...first, turn_index: 1 };
    assert.throws(() => prepareServerRequest(p, next, { priorCaptures: [cap] }), /PREDECESSOR_CAPTURE_HELD/);
    // Synthetic local input to exercise the declared actual-capture shape, not an actual receiver result.
    const declaredShape = structuredClone(cap); declaredShape.evidence_class = 'ACTUAL_RECEIVER_TEST';
    assert.equal(prepareServerRequest(p, next, { priorCaptures: [declaredShape] }).request.messages[1].content, cap.returned.text);
    declaredShape.returned.text += 'alteration';
    assert.throws(() => prepareServerRequest(p, next, { priorCaptures: [declaredShape] }), /PREDECESSOR_CAPTURE_HELD/);
    const failed = await captureServerCall(p, request, join(root, 'failed'), {
      environment: { TD613_LOOM_ASSAY_TOKEN: token }, fetchImpl: async () => new Response('failure', { status: 503 })
    });
    assert.equal(failed.returned, null); assert.equal(failed.status, 'HELD_EVIDENCE_GAP');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test('client cannot continue using fixture captures or wrong predecessor identity', () => {
  assert.throws(() => prepareServerRequest(policy(), { ...trial, case_id: 'R02', trial_id: 'FIRST_CONFIGURED_RECEIVER-R02-1', turn_index: 1 },
    { priorCaptures: [{ status: 'CAPTURED_NOT_ADMITTED', evidence_class: 'LOCAL_STRUCTURAL_TEST' }] }), /PREDECESSOR_CAPTURE_HELD/);
});
test('canonical API dispatch and deployment packaging preserve dedicated bounded operation', () => {
  const api = readFileSync('api/khonapolit.js', 'utf8');
  assert.match(api, /requestedOperation\(req\) === 'loom-assay'/);
  const config = JSON.parse(readFileSync('vercel.json'));
  assert.match(config.functions['api/khonapolit.js'].includeFiles, /TRIAL_MANIFEST\.json/);
  assert.match(config.functions['api/khonapolit.js'].includeFiles, /corrected-artifact\/portable-loom-standard\.md/);
  assert.match(config.functions['api/khonapolit.js'].includeFiles, /server\/loom-assay-run-config\.json/);
});
test('source-bound public activation admits only its run and does not contain provider or caller secrets', async () => {
  const c = loadApprovedRunConfiguration();
  assert.match(c.access_sha256, /^[a-f0-9]{64}$/); assert.ok(!JSON.stringify(c).includes(key));
  assert.ok(!JSON.stringify(c).includes(token)); assert.equal(c.run_id, 'portable-loom-first-receiver-20261009-a3');
  const h = harness();
  const handler = createLoomAssayHandler({ environment: { GEMINI_API_KEY: key, TD613_LOOM_ASSAY_ACCESS_SHA256: sha256(token), VERCEL_GIT_COMMIT_SHA: head },
    allowedRunId: c.run_id, budget: async () => { throw new Error('unexpected ledger work'); }, fetchImpl: async () => { throw new Error('unexpected provider work'); } });
  const res = { setHeader() {}, end(raw) { this.body = JSON.parse(raw); } };
  await handler({ method: 'POST', headers: { authorization: `Bearer ${token}` }, body: h.request }, res);
  assert.equal(res.statusCode, 409); assert.equal(res.body.error, 'ASSAY_RUN_OUTSIDE_ACTIVATION');
});

test('request workload identity reaches the budget service and rotates without changing caller authority', async () => {
  const p = policy(), request = prepareServerRequest(p, trial).request;
  const ledgerTokens = [], sent = [];
  const fetchImpl = async (url, options) => {
    url = String(url);
    sent.push({ url, options });
    if (url.startsWith('https://generativelanguage.googleapis.com/')) return new Response(JSON.stringify(payload()));
    ledgerTokens.push(options.headers.authorization);
    const { operation, input } = JSON.parse(options.body);
    const result = operation === 'inspect' ? { policy: p } : operation === 'reserve'
      ? { durable_reservation: true, call_key: `${input.trial.trial_id}:${input.trial.role}:${input.trial.turn_index}`,
        request_sha256: input.request_sha256, reserved_cost_nanos: String(p.binding.limits.max_input_tokens_per_call * 1000 + input.output_limit * 2000) }
      : { retained: true, call_key: input.call_key, status: input.status };
    return new Response(JSON.stringify({ schema: 'td613.loom.assay-budget-response/v0.1', status: 'ok', result }));
  };
  const environment = { GEMINI_API_KEY: key, TD613_LOOM_ASSAY_ACCESS_SHA256: sha256(token),
    VERCEL_GIT_COMMIT_SHA: head, TD613_LOOM_ASSAY_BUDGET_URL: loadApprovedRunConfiguration().budget_url,
    VERCEL_OIDC_TOKEN: 'synthetic-stale-build-token' };
  const handler = createLoomAssayHandler({ environment, fetchImpl, manifest, artifactText: artifact });
  for (const workload of ['synthetic-platform-request-one', 'synthetic-platform-request-two']) {
    const res = { setHeader() {}, end(raw) { this.body = JSON.parse(raw); } };
    await handler({ method: 'POST', headers: { authorization: `Bearer ${token}`, 'x-vercel-oidc-token': workload }, body: request }, res);
    assert.equal(res.statusCode, 200); assert.equal(res.body.evidence_class, 'LOCAL_STRUCTURAL_TEST');
    assert.ok(!JSON.stringify(res.body).includes(workload));
    assert.deepEqual(ledgerTokens.slice(-3), Array(3).fill(`Bearer ${workload}`));
  }
  assert.equal(sent.filter(x => x.url.startsWith('https://generativelanguage.googleapis.com/')).length, 2);
  assert.ok(sent.every(x => !x.options.body.includes('synthetic-platform-request-')));
});

test('missing or rejected workload identity fails before provider generation', async () => {
  const p = policy(), request = prepareServerRequest(p, trial).request;
  for (const workload of ['', 'synthetic-forged-platform-token']) {
    const sent = [];
    const handler = createLoomAssayHandler({ environment: { GEMINI_API_KEY: key, TD613_LOOM_ASSAY_ACCESS_SHA256: sha256(token),
      VERCEL_GIT_COMMIT_SHA: head, TD613_LOOM_ASSAY_BUDGET_URL: loadApprovedRunConfiguration().budget_url },
      fetchImpl: async (url) => { sent.push(String(url)); return new Response('{}', { status: 401 }); }, manifest, artifactText: artifact });
    const res = { setHeader() {}, end(raw) { this.body = JSON.parse(raw); } };
    await handler({ method: 'POST', headers: { authorization: `Bearer ${token}`, 'x-vercel-oidc-token': workload }, body: request }, res);
    assert.equal(res.statusCode, 409); assert.equal(res.body.provider_requests, 0);
    assert.equal(res.body.error, workload ? 'ASSAY_DURABLE_BUDGET_HELD' : 'ASSAY_BUDGET_WORKLOAD_UNCONFIGURED');
    assert.ok(sent.every(url => !url.startsWith('https://generativelanguage.googleapis.com/')));
  }
});

test('the resolved request workload token cannot enter prompt or returned public bytes', async () => {
  const workload = 'synthetic-secret-platform-workload';
  const h = harness({ fetchOverride: async () => new Response(JSON.stringify(payload(workload))) });
  const res = { setHeader() {}, end(raw) { this.body = JSON.parse(raw); } };
  await h.handler({ method: 'POST', headers: { authorization: `Bearer ${token}`, 'x-vercel-oidc-token': workload }, body: h.request }, res);
  assert.equal(res.body.error, 'ASSAY_PROTECTED_CREDENTIAL_ECHO');
  assert.equal(res.body.provider_response_base64, null); assert.equal(res.body.returned, null);
  assert.ok(!JSON.stringify(res.body).includes(workload));
  const injected = harness({ change: r => r.messages[0].content += workload });
  await injected.handler({ method: 'POST', headers: { authorization: `Bearer ${token}`, 'x-vercel-oidc-token': workload }, body: injected.request }, res);
  assert.equal(res.body.error, 'ASSAY_PROTECTED_CREDENTIAL_IN_PAYLOAD');
  assert.equal(injected.sent.length, 0); assert.equal(injected.operations.length, 0);
});
