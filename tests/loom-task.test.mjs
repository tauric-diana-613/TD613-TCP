import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createLoomTaskHandler, validateLoomTaskInput, LOOM_TASK_SCHEMA, LOOM_TASK_RESULT_SCHEMA } from '../server/loom-task.js';
const task = () => ({ schema: LOOM_TASK_SCHEMA, request_id: 'fixture-1', task: 'Compare budget and dependencies using only the shared packet.', documents: [{ id: 'budget', name: 'Shared budget', text: 'Project Rowan has 12 workstreams and a projected budget of 42000.' }], rules: ['Use project aliases.'] });
const answer = () => ({ answer: 'Project Rowan has 12 workstreams; dependencies remain unspecified [budget].', missing_information: ['Dependency edges'], used_document_ids: ['budget'], suggested_next_step: 'Supply a dependency map with aliases.' });
function payload(value = answer(), finishReason = 'STOP') { return { candidates: [{ finishReason, content: { parts: [{ text: JSON.stringify(value) }] } }], usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 60, totalTokenCount: 180, hidden: 'omit', thoughtsTokenCount: -1 } }; }
function harness(overrides = {}) {
  const calls = []; const outcomes = [];
  const handler = createLoomTaskHandler({ env: { GEMINI_API_KEY: 'server-secret-test-key' },
    resolvePlan: async options => { calls.push({ kind: 'plan', options }); return { callableModels: ['gemini-test'] }; },
    fetchImpl: async (url, options) => { calls.push({ kind: 'generate', url, options }); return { ok: true, status: 200, json: async () => payload() }; },
    recordOutcome: (...args) => outcomes.push(args), rateSlot: () => ({ allowed: true, remaining: 11 }), ...overrides });
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
  assert.deepEqual(r.body.observations.usage, { promptTokenCount: 120, candidatesTokenCount: 60, totalTokenCount: 180 });
  assert.equal(r.body.observations.source_claims, 'model-reported-unverified');
  const invocation = h.calls.find(row => row.kind === 'generate');
  assert.match(invocation.url, /:generateContent$/); assert.equal(invocation.url.includes('server-secret'), false);
  assert.equal(invocation.options.headers['x-goog-api-key'], 'server-secret-test-key');
  const body = JSON.parse(invocation.options.body);
  assert.deepEqual(JSON.parse(body.contents[0].parts[0].text), { task: task().task, documents: task().documents, rules: task().rules });
  assert.equal(body.generationConfig.responseMimeType, 'application/json');
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
  assert.equal((await h.run()).status, 502);
});

test('provider failures do not emit raw error bodies, exception messages, secrets or fake success', async () => {
  const h = harness({ fetchImpl: async () => ({ ok: false, status: 429, json: async () => { throw new Error('raw private provider body should never be read'); } }) });
  const r = await h.run(); assert.equal(r.status, 502); assert.equal(r.body.error, 'provider-request-failed'); assert.equal(r.body.observations.http_status, 429);
  const thrown = harness({ fetchImpl: async () => { throw new Error('server-secret-test-key private details'); } });
  assert.equal(JSON.stringify(await thrown.run()).includes('server-secret'), false);
  const empty = harness({ resolvePlan: async () => ({ callableModels: [] }) });
  const e = await empty.run(); assert.equal(e.status, 503); assert.equal(e.body.observations.provider_calls, 0);
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
