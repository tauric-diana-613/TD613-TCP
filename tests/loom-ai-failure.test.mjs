import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readLoomAiFailure, describeLoomAiFailure } from '../app/dome-world/holonomy-loom/ai-failure.js';
import { createResilientLoomTaskHandler, LOOM_TASK_MAX_PROVIDER_CALLS } from '../server/loom-task-resilient.js';
const payload = () => ({ schema: 'td613.loom.ai-task-result/v0.1', request_id: 'request-1', status: 'held', error: 'provider-response-not-admitted', answer: 'REJECTED_PRIVATE_PAYLOAD', diagnostic: { schema: 'td613.loom.ai-task-diagnostic/v0.1', stage: 'output-admission', code: 'OUTPUT_TOKEN_LIMIT', raw: 'REJECTED_PRIVATE_PAYLOAD' }, observations: { model: 'gemini-3.5-flash', elapsed_ms: 17300, provider_calls: 1, http_status: 200, model_policy: 'td613.gemini-model-policy/v2-lifecycle-admission', usage: { candidatesTokenCount: 8192, promptTokenCount: 2100, secret: 'REJECTED_PRIVATE_PAYLOAD' }, response_text: 'REJECTED_PRIVATE_PAYLOAD' } });
test('failure retains request-bound finite diagnostics and numeric observations, excluding rejected content', () => {
  const failure = readLoomAiFailure(payload(), 'request-1');
  assert.equal(failure.diagnostic.code, 'OUTPUT_TOKEN_LIMIT'); assert.equal(failure.observations.provider_calls, 1);
  assert.equal(failure.observations.elapsed_ms, 17300); assert.equal(failure.observations.http_status, 200);
  assert.deepEqual(failure.observations.usage, { promptTokenCount: 2100, candidatesTokenCount: 8192 });
  assert.equal(JSON.stringify(failure).includes('REJECTED_PRIVATE_PAYLOAD'), false);
  assert.match(describeLoomAiFailure(failure), /generation limit/);
});
test('stale, unrecognized or nonfailure envelopes cannot create matched failure receipts', () => {
  for (const changed of [{ request_id: 'other' }, { schema: 'other' }, { status: 'completed' }, { error: 'unrecognized-response' }]) assert.equal(readLoomAiFailure({ ...payload(), ...changed }, 'request-1'), null);
  assert.equal(readLoomAiFailure(payload(), ''), null); assert.equal(readLoomAiFailure(null, 'request-1'), null);
  assert.match(describeLoomAiFailure(null, 502), /matching diagnostic receipt was unavailable/);
});
test('invalid diagnostics and unbounded or nonnumeric observations are omitted', () => {
  const input = payload(); input.diagnostic.code = 'RAW_MODEL_STORY';
  input.observations = { elapsed_ms: -1, provider_calls: Infinity, model: '<img src=x>', http_status: 900, document_count: 2, usage: { promptTokenCount: -5, totalTokenCount: 4.5 }, raw: 'PRIVATE' };
  assert.deepEqual(readLoomAiFailure(input, 'request-1'), { error: input.error, observations: { document_count: 2 } });
});
test('older finite server failures remain useful without manufacturing a provider diagnosis', () => {
  const failure = readLoomAiFailure({ schema: 'td613.loom.ai-task-result/v0.1', request_id: 'request-1', status: 'held', error: 'task-rate-limit', observations: { model: null, elapsed_ms: 1, provider_calls: 0 } }, 'request-1');
  assert.equal(failure.diagnostic, undefined); assert.equal(failure.observations.provider_calls, 0); assert.match(describeLoomAiFailure(failure), /request limit/);
});

test('deadline receipts retain allowlisted stage timings and separate timeout from cancellation', () => {
  const input = payload();
  input.error = 'task-aborted-or-timed-out';
  input.diagnostic = { schema: 'td613.loom.ai-task-diagnostic/v0.1', stage: 'provider-transport', code: 'DEADLINE_EXCEEDED' };
  input.observations = { elapsed_ms: 50001, deadline_ms: 50000, stage_elapsed_ms: {
    'provider-plan': 183, 'provider-transport': 49818, raw: 'REJECTED_PRIVATE_PAYLOAD', 'output-admission': -1, 'provider-json': Infinity
  } };
  const failure = readLoomAiFailure(input, 'request-1');
  assert.deepEqual(failure.observations, { elapsed_ms: 50001, deadline_ms: 50000, stage_elapsed_ms: { 'provider-plan': 183, 'provider-transport': 49818 } });
  assert.match(describeLoomAiFailure(failure), /50-second time limit/);
  assert.doesNotMatch(JSON.stringify(failure), /REJECTED_PRIVATE_PAYLOAD/);
  input.diagnostic.code = 'REQUEST_CANCELLED';
  const cancelled = describeLoomAiFailure(readLoomAiFailure(input, 'request-1'));
  assert.match(cancelled, /cancelled/);
  assert.doesNotMatch(cancelled, /time limit/);
});

test('untrusted duration fields cannot inject prose or manufacture a timeout duration', () => {
  for (const deadline of ['PRIVATE', -10, 0, Infinity, 60001]) {
    const input = payload();
    input.diagnostic.code = 'DEADLINE_EXCEEDED';
    input.observations = { deadline_ms: deadline, stage_elapsed_ms: { 'provider-plan': 'PRIVATE', 'provider-transport': -1 } };
    const failure = readLoomAiFailure(input, 'request-1');
    assert.deepEqual(failure.observations, {});
    assert.match(describeLoomAiFailure(failure), /reached its time limit/);
    assert.doesNotMatch(describeLoomAiFailure(failure), /PRIVATE|second/);
  }
});

test('generation budget is numeric and bounded independently of rejected output', () => {
  const input = payload();
  input.observations.output_token_budget = 16384;
  assert.equal(readLoomAiFailure(input, 'request-1').observations.output_token_budget, 16384);
  for (const invalid of ['PRIVATE', -1, 0, 65537, Infinity]) {
    input.observations.output_token_budget = invalid;
    assert.equal(Object.hasOwn(readLoomAiFailure(input, 'request-1').observations, 'output_token_budget'), false);
  }
});

test('provider HTTP failure copy names the observed status without inventing source claims', () => {
  const input = payload();
  input.error = 'provider-request-failed';
  input.diagnostic = { schema: 'td613.loom.ai-task-diagnostic/v0.1', stage: 'provider-transport', code: 'PROVIDER_HTTP_ERROR' };
  input.observations = { model: 'gemini-3.8-flash', http_status: 503, provider_calls: 1, elapsed_ms: 1400 };
  const failure = readLoomAiFailure(input, 'request-1');
  assert.match(describeLoomAiFailure(failure), /HTTP 503/);
  assert.match(describeLoomAiFailure(failure), /no source references were admitted/);
  assert.doesNotMatch(describeLoomAiFailure(failure), /outage|retired|Unknown source/);
});

const liveTask = () => ({ schema: 'td613.loom.ai-task/v0.1', request_id: 'request-1', task: 'Compare the fictional suppliers.', documents: [{ id: 'brief', name: 'Brief', text: 'Vendor A costs 10. Vendor B costs 12.' }], rules: ['Use only the selected document.'] });
const admittedProviderPayload = () => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ answer: 'Vendor A costs 10 and Vendor B costs 12 [brief].', missing_information: [], used_document_ids: ['brief'], suggested_next_step: 'Review the comparison.' }) }] } }], usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 30, totalTokenCount: 50 } });
function requestHarness(handler) {
  return async () => {
    const req = Object.assign(new EventEmitter(), { method: 'POST', headers: { host: 'td613.com', origin: 'https://td613.com', 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' }, body: liveTask() });
    const headers = {}; let body;
    const res = { statusCode: 200, setHeader(name, value) { headers[name] = value; }, end(raw) { body = JSON.parse(String(raw)); } };
    await handler(req, res);
    return { status: res.statusCode, body, headers };
  };
}

test('one transient HTTP failure may cross to one different eligible model and then succeed', async () => {
  let generationCalls = 0;
  const urls = [];
  const handler = createResilientLoomTaskHandler({
    env: { GEMINI_API_KEY: 'test-key' },
    resolvePlan: async () => ({ callableModels: ['gemini-a', 'gemini-b', 'gemini-c'] }),
    fetchImpl: async url => {
      generationCalls += 1; urls.push(url);
      if (generationCalls === 1) return { ok: false, status: 503 };
      return { ok: true, status: 200, json: async () => admittedProviderPayload() };
    },
    recordOutcome: () => {}, rateSlot: () => ({ allowed: true, remaining: 9 })
  });
  const result = await requestHarness(handler)();
  assert.equal(result.status, 200);
  assert.equal(generationCalls, 2);
  assert.match(urls[0], /gemini-a/); assert.match(urls[1], /gemini-b/);
  assert.equal(result.body.status, 'completed');
  assert.equal(result.body.observations.provider_calls, 2);
  assert.equal(result.body.observations.model, 'gemini-b');
  assert.equal(result.body.observations.provider_failover, 'td613.loom.provider-failover/v0.1');
  assert.deepEqual(result.body.observations.provider_attempts, [
    { model: 'gemini-a', http_status: 503 }, { model: 'gemini-b', http_status: 200 }
  ]);
});

test('bounded failover cannot make a third generation call even when another model is eligible', async () => {
  let generationCalls = 0;
  const handler = createResilientLoomTaskHandler({
    env: { GEMINI_API_KEY: 'test-key' },
    resolvePlan: async () => ({ callableModels: ['gemini-a', 'gemini-b', 'gemini-c'] }),
    fetchImpl: async () => { generationCalls += 1; return { ok: false, status: 503 }; },
    recordOutcome: () => {}, rateSlot: () => ({ allowed: true, remaining: 9 })
  });
  const result = await requestHarness(handler)();
  assert.equal(result.status, 502);
  assert.equal(generationCalls, LOOM_TASK_MAX_PROVIDER_CALLS);
  assert.equal(result.body.status, 'held');
  assert.equal(result.body.observations.provider_calls, 2);
  assert.equal(result.body.observations.model, 'gemini-b');
  assert.equal(result.body.observations.provider_attempts.length, 2);
  const failure = readLoomAiFailure(result.body, 'request-1');
  assert.equal(failure.observations.provider_calls, 2);
  assert.equal(failure.observations.provider_attempts.length, 2);
  assert.match(describeLoomAiFailure(failure), /bounded alternate-model attempt/);
});
