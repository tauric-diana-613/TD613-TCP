import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createLoomTaskHandler, validateLoomTaskInput, selectLoomProviderModels, LOOM_TASK_SCHEMA, LOOM_TASK_RESULT_SCHEMA, LOOM_TASK_TIMEOUT_MS, LOOM_TASK_OUTPUT_TOKEN_BUDGET, LOOM_TASK_MAX_PROVIDER_CALLS, LOOM_TASK_TRANSIENT_BACKOFF_MS } from '../server/loom-task.js';
const task = () => ({ schema: LOOM_TASK_SCHEMA, request_id: 'fixture-1', task: 'Compare budget and dependencies using only the shared packet.', documents: [{ id: 'budget', name: 'Shared budget', text: 'Project Rowan has 12 workstreams and a projected budget of 42000.' }], rules: ['Use project aliases.'] });
const answer = () => ({ answer: 'Project Rowan has 12 workstreams; dependencies remain unspecified [budget].', missing_information: ['Dependency edges'], used_document_ids: ['budget'], suggested_next_step: 'Supply a dependency map with aliases.' });
function payload(value = answer(), finishReason = 'STOP') { return { candidates: [{ finishReason, content: { parts: [{ text: JSON.stringify(value) }] } }], usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 60, totalTokenCount: 180, hidden: 'omit', thoughtsTokenCount: -1 } }; }
function harness(overrides = {}) {
  const calls = []; const outcomes = [];
  const handler = createLoomTaskHandler({ env: { GEMINI_API_KEY: 'server-secret-test-key' },
    resolvePlan: async options => { calls.push({ kind: 'plan', options }); return { callableModels: ['gemini-test'] }; },
    fetchImpl: async (url, options) => { calls.push({ kind: 'generate', url, options }); return { ok: true, status: 200, json: async () => payload() }; },
    recordOutcome: (...args) => outcomes.push(args), rateSlot: () => ({ allowed: true, remaining: 11 }), sleep: async () => {}, ...overrides });
  async function run(input = task(), changes = {}) {
    const req = Object.assign(new EventEmitter(), { method: 'POST', headers: { host: 'td613.com', origin: 'https://td613.com', 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' }, body: input }, changes);
    const headers = {}; let result;
    const res = { setHeader: (key, value) => { headers[key] = value; }, end: raw => { result = JSON.parse(raw); } };
    await handler(req, res);
    return { status: res.statusCode, body: result, headers, req };
  }
  return { run, handler, calls, outcomes };
}

test('real provider boundary builds structured generation from admitted input, preserves actual observations', async () => {
  const h = harness(); const r = await h.run();
  assert.equal(r.status, 200); assert.equal(r.body.schema, LOOM_TASK_RESULT_SCHEMA); assert.equal(r.body.status, 'completed');
  assert.equal(r.body.request_id, 'fixture-1'); assert.equal(r.body.observations.provider_calls, 1);
  assert.deepEqual(r.body.observations.provider_attempts, [{ model: 'gemini-test', status: 200 }]);
  assert.deepEqual(r.body.observations.usage, { promptTokenCount: 120, candidatesTokenCount: 60, totalTokenCount: 180 });
  assert.equal(r.body.observations.source_claims, 'model-reported-unverified');
  const invocation = h.calls.find(row => row.kind === 'generate');
  assert.match(invocation.url, /:generateContent$/); assert.equal(invocation.url.includes('server-secret'), false);
  assert.equal(invocation.options.headers['x-goog-api-key'], 'server-secret-test-key');
  const body = JSON.parse(invocation.options.body);
  assert.deepEqual(JSON.parse(body.contents[0].parts[0].text), { task: task().task, documents: task().documents, rules: task().rules });
  assert.equal(body.generationConfig.responseMimeType, 'application/json');
  assert.equal(body.generationConfig.maxOutputTokens, 16384);
  assert.equal(r.body.observations.output_token_budget, LOOM_TASK_OUTPUT_TOKEN_BUDGET);
  assert.equal(JSON.stringify(r).includes('server-secret-test-key'), false);
  assert.equal(r.headers['Cache-Control'], 'no-store, max-age=0');
});

test('reject unknown fields, sparse lists, duplicates, credential fields and oversized inputs before provider access', async () => {
  const mutations = [
    t => { t.api_key = 'user-key'; }, t => { t.documents[0].keep_local = true; },
    t => { t.documents.push({ ...t.documents[0] }); }, t => { t.task = 'x'.repeat(12001); },
    t => { t.documents = Array.from({ length: 9 }, (_, n) => ({ id: `d${n}`, name: 'n', text: 'a' })); },
    t => { t.documents[0].text = 'x'.repeat(48001); }, t => { t.rules = [4]; },
    t => { t.rules = ['x'.repeat(1001)]; }, t => { t.request_id = 'x?secret=1'; },
    t => { t.documents = [{ id: 'd1', name: 'n', text: 'x'.repeat(40000) }, { id: 'd2', name: 'n', text: 'x'.repeat(21000) }]; }
  ];
  for (const change of mutations) {
    const h = harness(); const input = task(); change(input); const result = await h.run(input);
    assert.equal(result.status, 400); assert.equal(h.calls.length, 0);
  }
  const sparse = task(); sparse.rules = new Array(2); assert.throws(() => validateLoomTaskInput(sparse));
  const h = harness(); assert.equal((await h.run('x'.repeat(240001))).status, 413); assert.equal(h.calls.length, 0);
});

test('reject cross-origin, wrong method and non-JSON; refuse missing server key and exhausted rate slot', async () => {
  for (const [changes, expected] of [[{ method: 'GET' }, 405], [{ headers: { host: 'td613.com', origin: 'https://evil.example', 'content-type': 'application/json' } }, 403], [{ headers: { host: 'td613.com', 'content-type': 'application/json' } }, 403], [{ headers: { host: 'td613.com', origin: 'https://td613.com', 'content-type': 'text/plain' } }, 415]]) {
    const h = harness(); assert.equal((await h.run(task(), changes)).status, expected); assert.equal(h.calls.length, 0);
  }
  assert.equal((await harness({ env: {} }).run()).status, 503);
  const h = harness({ rateSlot: () => ({ allowed: false, remaining: 0 }) }); assert.equal((await h.run()).status, 429); assert.equal(h.calls.length, 0);
});

test('model citations, renderer authority and incomplete or credential-bearing output fail deterministic admission', async () => {
  const badOutputs = [
    { ...answer(), used_document_ids: ['not-sent'] }, { ...answer(), used_document_ids: ['budget', 'budget'] },
    { ...answer(), execute: 'release' }, { ...answer(), missing_information: [123] }, { ...answer(), answer: '' },
    { ...answer(), answer: 'server-secret-test-key' }, { ...answer(), suggested_next_step: 'a'.repeat(2001) }
  ];
  for (const value of badOutputs) {
    const h = harness({ fetchImpl: async () => ({ ok: true, status: 200, json: async () => payload(value) }) });
    const r = await h.run(); assert.equal(r.status, 502); assert.equal(r.body.status, 'held'); assert.equal(r.body.answer, '');
    assert.equal(JSON.stringify(r).includes('server-secret'), false);
  }
  const h = harness({ fetchImpl: async () => ({ ok: true, status: 200, json: async () => payload(answer(), 'MAX_TOKENS') }) });
  const limited = await h.run();
  assert.equal(limited.status, 502);
  assert.equal(limited.body.observations.output_token_budget, 16384);
});

test('provider failures do not emit raw error bodies, exception messages, secrets or fake success', async () => {
  const h = harness({ fetchImpl: async () => ({ ok: false, status: 429, json: async () => { throw new Error('raw private provider body should never be read'); } }) });
  const r = await h.run(); assert.equal(r.status, 502); assert.equal(r.body.error, 'provider-request-failed'); assert.equal(r.body.observations.http_status, 429);
  const thrown = harness({ fetchImpl: async () => { throw new Error('server-secret-test-key private details'); } });
  assert.equal(JSON.stringify(await thrown.run()).includes('server-secret'), false);
  const empty = harness({ resolvePlan: async () => ({ callableModels: [] }) });
  const e = await empty.run(); assert.equal(e.status, 503); assert.equal(e.body.observations.provider_calls, 0);
});

test('one transient HTTP failure may fail over to the next eligible model', async () => {
  let calls = 0;
  const result = await harness({
    resolvePlan: async () => ({ callableModels: ['gemini-first', 'gemini-second', 'gemini-third'] }),
    fetchImpl: async () => {
      calls += 1;
      return calls === 1 ? { ok: false, status: 503 } : { ok: true, status: 200, json: async () => payload() };
    }
  }).run();
  assert.equal(result.status, 200);
  assert.equal(calls, 2);
  assert.equal(result.body.observations.provider_calls, 2);
  assert.equal(result.body.observations.model, 'gemini-second');
  assert.equal(result.body.observations.http_status, 200);
  assert.deepEqual(result.body.observations.provider_attempts, [
    { model: 'gemini-first', status: 503 }, { model: 'gemini-second', status: 200 }
  ]);
});

test('quality-first Loom failover diversifies away from adjacent frontier siblings without server memory', async () => {
  assert.deepEqual(selectLoomProviderModels(['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']),
    ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']);
  const attempted = []; const sleeps = [];
  const result = await harness({
    resolvePlan: async () => ({ callableModels: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'] }),
    sleep: async ms => sleeps.push(ms),
    fetchImpl: async url => {
      const model = decodeURIComponent(url.match(/models\/([^:]+):generateContent/)?.[1] || '');
      attempted.push(model);
      return attempted.length < 3 ? { ok: false, status: 503 } : { ok: true, status: 200, json: async () => payload() };
    }
  }).run();
  assert.equal(result.status, 200);
  assert.deepEqual(attempted, ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']);
  assert.deepEqual(sleeps, [...LOOM_TASK_TRANSIENT_BACKOFF_MS]);
  assert.equal(result.body.observations.provider_calls, 3);
  assert.equal(result.body.observations.model, 'gemini-2.5-flash');
  assert.deepEqual(result.body.observations.provider_attempts, [
    { model: 'gemini-3.8-flash', status: 503 },
    { model: 'gemini-3.5-flash', status: 503 },
    { model: 'gemini-2.5-flash', status: 200 }
  ]);
});

test('transient failover has a hard three-call ceiling and deterministic output failures never fail over', async () => {
  let transientCalls = 0;
  const failed = await harness({
    resolvePlan: async () => ({ callableModels: ['gemini-first', 'gemini-second', 'gemini-third', 'gemini-fourth'] }),
    fetchImpl: async () => { transientCalls += 1; return { ok: false, status: 503 }; }
  }).run();
  assert.equal(failed.status, 502);
  assert.equal(transientCalls, LOOM_TASK_MAX_PROVIDER_CALLS);
  assert.equal(failed.body.observations.provider_calls, LOOM_TASK_MAX_PROVIDER_CALLS);
  assert.equal(failed.body.observations.model, 'gemini-third');
  assert.deepEqual(failed.body.observations.provider_attempts, [
    { model: 'gemini-first', status: 503 }, { model: 'gemini-second', status: 503 }, { model: 'gemini-third', status: 503 }
  ]);
  let admissionCalls = 0;
  const held = await harness({
    resolvePlan: async () => ({ callableModels: ['gemini-first', 'gemini-second'] }),
    fetchImpl: async () => { admissionCalls += 1; return { ok: true, status: 200, json: async () => payload({ ...answer(), used_document_ids: ['not-sent'] }) }; }
  }).run();
  assert.equal(held.status, 502);
  assert.equal(held.body.diagnostic.stage, 'output-admission');
  assert.equal(admissionCalls, 1);
  assert.equal(held.body.observations.provider_calls, 1);
});

test('deadline bounds stalled listing and generation; abort prevents late successful admission', async () => {
  const listing = harness({ timeoutMs: 5, resolvePlan: () => new Promise(() => {}) });
  const l = await listing.run(); assert.equal(l.status, 504); assert.equal(l.body.observations.provider_calls, 0);
  let observedSignal;
  const generation = harness({ timeoutMs: 5, fetchImpl: async (_, options) => { observedSignal = options.signal; return new Promise(() => {}); } });
  const g = await generation.run(); assert.equal(g.status, 504); assert.equal(observedSignal.aborted, true); assert.equal(g.body.answer, '');
  const preaborted = harness(); const p = await preaborted.run(task(), { aborted: true }); assert.equal(p.status, 504);
  assert.equal(preaborted.calls.some(row => row.kind === 'generate'), false);
});

test('bounded diagnostics distinguish provider stages without promoting a guessed cause', async () => {
  const cases = [
    { overrides: { resolvePlan: async () => { throw new Error('server-secret-test-key plan details'); } }, stage: 'provider-plan', code: 'PROVIDER_PLAN_FAILED', calls: 0, http: undefined },
    { overrides: { fetchImpl: async () => { throw Object.assign(new Error('private transport details'), { code: 'SOURCE_ID_NOT_SELECTED' }); } }, stage: 'provider-transport', code: 'PROVIDER_TRANSPORT_FAILED', calls: 1, http: undefined },
    { overrides: { fetchImpl: async () => ({ ok: false, status: 503 }) }, stage: 'provider-transport', code: 'PROVIDER_HTTP_ERROR', calls: 1, http: 503 },
    { overrides: { fetchImpl: async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('PRIVATE_UNPARSED_PROVIDER_BODY'); } }) }, stage: 'provider-json', code: 'PROVIDER_JSON_INVALID', calls: 1, http: 200 },
    { overrides: { fetchImpl: async () => ({ ok: true, status: 200, json: async () => payload({ ...answer(), used_document_ids: ['PRIVATE_UNSELECTED_ID'] }) }) }, stage: 'output-admission', code: 'SOURCE_ID_NOT_SELECTED', calls: 1, http: 200 }
  ];
  for (const item of cases) {
    const result = await harness(item.overrides).run();
    assert.equal(result.status, 502); assert.equal(result.body.status, 'held'); assert.equal(result.body.answer, '');
    assert.deepEqual(result.body.diagnostic, { schema: 'td613.loom.ai-task-diagnostic/v0.1', stage: item.stage, code: item.code });
    assert.equal(result.body.observations.provider_calls, item.calls);
    assert.equal(result.body.observations.http_status, item.http);
    if (item.calls) assert.equal(result.body.observations.model, 'gemini-test');
    assert.doesNotMatch(JSON.stringify(result), /server-secret-test-key|private transport|PRIVATE_UNPARSED|PRIVATE_UNSELECTED/);
  }
});

test('strict output failures retain safe usage and expose field-specific codes without rejected content', async () => {
  const cases = [
    [payload(answer(), 'MAX_TOKENS'), 'OUTPUT_TOKEN_LIMIT'],
    [payload(answer(), 'SAFETY'), 'FINISH_REASON_NOT_STOP'],
    [{ ...payload(), promptFeedback: { blockReason: 'PRIVATE_PROVIDER_DESCRIPTION' } }, 'PROMPT_BLOCKED'],
    [{ ...payload(), candidates: [{ finishReason: 'STOP', content: { parts: [] } }] }, 'RESPONSE_PARTS_INVALID'],
    [{ ...payload(), candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'x'.repeat(40001) }] } }] }, 'RESPONSE_TEXT_TOO_LARGE'],
    [{ ...payload(), candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'PRIVATE_UNPARSEABLE_OUTPUT' }] } }] }, 'OUTPUT_JSON_INVALID'],
    [payload({ ...answer(), extra: 'PRIVATE_EXTRA_CONTENT' }), 'OUTPUT_FIELDS_INVALID'],
    [payload({ ...answer(), answer: '' }), 'ANSWER_INVALID'],
    [payload({ ...answer(), answer: 'server-secret-test-key' }), 'CREDENTIAL_OUTPUT_REJECTED'],
    [payload({ ...answer(), suggested_next_step: 8 }), 'NEXT_STEP_INVALID'],
    [payload({ ...answer(), missing_information: [4] }), 'MISSING_INFORMATION_INVALID'],
    [payload({ ...answer(), used_document_ids: [4] }), 'SOURCE_IDS_INVALID'],
    [payload({ ...answer(), used_document_ids: ['budget', 'budget'] }), 'SOURCE_ID_DUPLICATE']
  ];
  for (const [body, code] of cases) {
    const result = await harness({ fetchImpl: async () => ({ ok: true, status: 200, json: async () => body }) }).run();
    assert.equal(result.body.diagnostic.stage, 'output-admission'); assert.equal(result.body.diagnostic.code, code);
    assert.equal(result.body.status, 'held'); assert.equal(result.body.answer, '');
    assert.equal(result.body.observations.http_status, 200);
    assert.deepEqual(result.body.observations.usage, { promptTokenCount: 120, candidatesTokenCount: 60, totalTokenCount: 180 });
    assert.doesNotMatch(JSON.stringify(result), /PRIVATE_PROVIDER_DESCRIPTION|PRIVATE_UNPARSEABLE_OUTPUT|PRIVATE_EXTRA_CONTENT|server-secret-test-key/);
  }
});

test('timeout and cancellation diagnostics retain the exact interrupted stage', async () => {
  const late = await harness({ timeoutMs: 5, fetchImpl: async () => ({ ok: true, status: 200, json: () => new Promise(() => {}) }) }).run();
  assert.equal(late.body.diagnostic.stage, 'provider-json'); assert.equal(late.body.diagnostic.code, 'DEADLINE_EXCEEDED');
  assert.equal(late.body.observations.http_status, 200); assert.equal(Object.hasOwn(late.body.observations, 'usage'), false);
  const cancelled = await harness().run(task(), { aborted: true });
  assert.equal(cancelled.body.diagnostic.code, 'REQUEST_CANCELLED'); assert.equal(cancelled.body.diagnostic.stage, 'provider-plan');
  assert.equal(cancelled.body.observations.provider_calls, 0);
});

test('a single slow generation can complete after the old 32s ceiling, inside the host budget', async t => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 0 });
  let calls = 0;
  const h = harness({ fetchImpl: () => {
    calls += 1;
    return new Promise(resolve => setTimeout(() => resolve({ ok: true, status: 200, json: async () => payload() }), 40000));
  } });
  const pending = h.run();
  await new Promise(resolve => setImmediate(resolve));
  t.mock.timers.tick(40000);
  const result = await pending;
  assert.equal(result.status, 200);
  assert.equal(calls, 1);
  assert.equal(result.body.observations.elapsed_ms, 40000);
  assert.equal(result.body.observations.deadline_ms, LOOM_TASK_TIMEOUT_MS);
  assert.equal(result.body.observations.stage_elapsed_ms['provider-transport'], 40000);
});

test('the 50s total deadline includes planning, aborts transport and never retries', async t => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 0 });
  let signal;
  let calls = 0;
  const h = harness({
    resolvePlan: () => new Promise(resolve => setTimeout(() => resolve({ callableModels: ['gemini-test', 'unused-fallback'] }), 5000)),
    fetchImpl: async (_, options) => { calls += 1; signal = options.signal; return new Promise(() => {}); }
  });
  const pending = h.run();
  t.mock.timers.tick(5000);
  await new Promise(resolve => setImmediate(resolve));
  t.mock.timers.tick(45000);
  const result = await pending;
  assert.equal(result.status, 504);
  assert.equal(result.body.diagnostic.code, 'DEADLINE_EXCEEDED');
  assert.equal(result.body.observations.elapsed_ms, 50000);
  assert.deepEqual(result.body.observations.stage_elapsed_ms, { 'provider-plan': 5000, 'provider-transport': 45000 });
  assert.equal(result.body.answer, '');
  assert.equal(signal.aborted, true);
  assert.equal(calls, 1);
});

test('timings distinguish listing, response arrival, body read and admission without provider text', async () => {
  let clock = 100;
  const result = await harness({
    now: () => clock,
    resolvePlan: async () => { clock += 200; return { callableModels: ['gemini-test'] }; },
    fetchImpl: async () => {
      clock += 31000;
      return { ok: true, status: 200, json: async () => { clock += 40; return payload(); } };
    }
  }).run();
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.observations.stage_elapsed_ms, {
    'provider-plan': 200, 'provider-transport': 31000, 'provider-json': 40, 'output-admission': 0
  });
  assert.equal(result.body.observations.elapsed_ms, 31240);
  assert.doesNotMatch(JSON.stringify(result), /server-secret-test-key/);
});