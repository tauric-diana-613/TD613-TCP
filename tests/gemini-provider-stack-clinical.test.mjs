import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EventEmitter } from 'node:events';
import {
  clearGeminiModelState,
  readGeminiModelState,
  recordGeminiModelOutcome
} from '../server/gemini-model-policy.js';
import {
  buildLoomTaskProviderRequest,
  createLoomTaskHandler,
  LOOM_TASK_SCHEMA
} from '../server/loom-task.js';
import hushHandler from '../server/hush-generate-quality.js';
import khonapolitHandler from '../server/khonapolit-quality.js';

const results = [];
async function check(name, run) {
  try {
    await run();
    results.push({ name, status: 'PASS' });
  } catch (error) {
    results.push({ name, status: 'FAIL', error: String(error?.message || error).slice(0, 320) });
  }
}

function loomPayload() {
  return {
    candidates: [{
      finishReason: 'STOP',
      content: { parts: [{ text: JSON.stringify({
        answer: 'The bounded packet supports the synthetic comparison [budget].',
        missing_information: [],
        used_document_ids: ['budget'],
        suggested_next_step: 'Retain the bounded packet.'
      }) }] }
    }],
    usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 20, totalTokenCount: 40 }
  };
}

function loomRequest() {
  return {
    schema: LOOM_TASK_SCHEMA,
    request_id: 'clinical-loom-1',
    task: 'Compare the synthetic packet.',
    documents: [{ id: 'budget', name: 'Budget', text: 'Synthetic bounded budget packet.' }],
    rules: ['Use only selected documents.']
  };
}

function loomHarness(overrides = {}) {
  const handler = createLoomTaskHandler({
    env: { GEMINI_API_KEY: 'synthetic-clinical-key' },
    resolvePlan: async () => ({ callableModels: ['gemini-a', 'gemini-b', 'gemini-c'] }),
    recordOutcome: () => {},
    rateSlot: () => ({ allowed: true, remaining: 9 }),
    sleep: async () => {},
    ...overrides
  });
  return async () => {
    const req = Object.assign(new EventEmitter(), {
      method: 'POST',
      headers: {
        host: 'td613.com',
        origin: 'https://td613.com',
        'content-type': 'application/json',
        'sec-fetch-site': 'same-origin'
      },
      body: loomRequest()
    });
    const headers = {};
    let payload;
    const res = {
      setHeader(name, value) { headers[name] = value; },
      end(raw) { payload = JSON.parse(raw); }
    };
    await handler(req, res);
    return { status: res.statusCode, payload, headers };
  };
}

function providerListing(models = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']) {
  return {
    ok: true,
    status: 200,
    async json() {
      return {
        models: models.map((id) => ({ name: `models/${id}`, supportedGenerationMethods: ['generateContent'] }))
      };
    }
  };
}

function hushResponse() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return payload; }
  };
}

function khonapolitResponse() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(text) { this.text = text; this.payload = text ? JSON.parse(text) : null; }
  };
}

const hushContract = {
  sourceText: 'the cat crossed the room because the door opened.',
  candidateCount: 1
};
const hushProviderPayload = (finishReason = 'STOP') => ({
  candidates: [{
    finishReason,
    content: { parts: [{ text: JSON.stringify({
      candidates: [{
        text: 'because the door opened, the cat crossed the room.',
        style_note: 'reordered',
        authorship_moves: ['recomposed away from source sequence']
      }]
    }) }] }
  }],
  usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 20, totalTokenCount: 40 }
});

const khonapolitProviderPayload = () => ({
  candidates: [{
    finishReason: 'STOP',
    content: { parts: [{ text: JSON.stringify({
      gemini: { text: 'Synthetic developed answer.', instrumentStatus: 'INSTRUMENT' },
      signal: { state: 'NOT_LOCKED', notes: '' },
      khonapolit: { allowed: false, text: '' },
      tauricDianaBots: { allowed: false, baseText: '', motif: '', intensity: 0, voices: [] }
    }) }] }
  }],
  usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 20, totalTokenCount: 40 }
});

await check('request-authored HTTP 400 does not poison provider-health routing', async () => {
  clearGeminiModelState();
  recordGeminiModelOutcome('gemini-2.5-flash', {
    ok: false,
    status: 400,
    reason: 'request-envelope-incompatible'
  }, 1000);
  const state = readGeminiModelState('gemini-2.5-flash', 2000);
  assert.equal(state.mayCall, true);
  assert.equal(state.state, 'available');
  clearGeminiModelState();
});

await check('Loom fallbacks bound thinking latency without shrinking output or schema', async () => {
  const input = loomRequest();
  const primary = buildLoomTaskProviderRequest(input, 'gemini-3.8-flash');
  const fallback35 = buildLoomTaskProviderRequest(input, 'gemini-3.5-flash', { fallback: true });
  const fallback25 = buildLoomTaskProviderRequest(input, 'gemini-2.5-flash', { fallback: true });
  assert.equal(primary.generationConfig.maxOutputTokens, 65536);
  assert.deepEqual(primary.generationConfig.thinkingConfig, { thinkingLevel: 'high' });
  assert.equal(fallback35.generationConfig.maxOutputTokens, 65536);
  assert.deepEqual(fallback35.generationConfig.thinkingConfig, { thinkingLevel: 'low' });
  assert.equal(fallback25.generationConfig.maxOutputTokens, 65536);
  assert.deepEqual(fallback25.generationConfig.thinkingConfig, { thinkingBudget: 1024 });
  assert.deepEqual(fallback35.generationConfig.responseSchema, primary.generationConfig.responseSchema);
  assert.deepEqual(fallback25.generationConfig.responseSchema, primary.generationConfig.responseSchema);
});

await check('Loom transient fallback cannot monopolize the remaining global deadline', async () => {
  let calls = 0;
  const run = loomHarness({
    timeoutMs: 120,
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) return { ok: false, status: 503 };
      if (calls === 2) return new Promise(() => {});
      return { ok: true, status: 200, json: async () => loomPayload() };
    }
  });
  const result = await run();
  assert.equal(result.status, 200);
  assert.equal(result.payload.status, 'completed');
  assert.equal(result.payload.observations.provider_calls, 3);
  assert.equal(result.payload.observations.provider_attempts.length, 3);
  assert.equal(result.payload.observations.provider_attempt_timings.length, 3);
  assert.equal(result.payload.observations.provider_attempt_timings[1].timed_out, true);
  assert.ok(Number.isFinite(result.payload.observations.provider_attempt_timings[1].elapsed_ms));
});

await check('Hush treats HTTP 400 as a terminal request rejection rather than cross-model failover', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  let generationCalls = 0;
  clearGeminiModelState();
  process.env.GEMINI_API_KEY = 'synthetic-clinical-key';
  try {
    globalThis.fetch = async (url) => {
      if (String(url).includes('/models?')) return providerListing(['gemini-3.8-flash', 'gemini-3.5-flash']);
      generationCalls += 1;
      if (generationCalls === 1) return { ok: false, status: 400, headers: { get: () => null }, async json() { return { error: { code: 400, status: 'INVALID_ARGUMENT', message: 'synthetic request rejection' } }; } };
      return { ok: true, status: 200, headers: { get: () => null }, async json() { return hushProviderPayload(); } };
    };
    const res = hushResponse();
    await hushHandler({ method: 'POST', body: { contract: hushContract } }, res);
    assert.equal(generationCalls, 1);
    assert.equal(res.statusCode, 502);
    assert.equal(res.payload.ok, false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalKey;
    clearGeminiModelState();
  }
});

await check('Kʰonapolit treats HTTP 400 as a terminal request rejection rather than cross-model failover', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  let generationCalls = 0;
  clearGeminiModelState();
  process.env.GEMINI_API_KEY = 'synthetic-clinical-key';
  try {
    globalThis.fetch = async (url) => {
      if (String(url).includes('/models?')) return providerListing(['gemini-3.8-flash', 'gemini-3.5-flash']);
      generationCalls += 1;
      if (generationCalls === 1) return { ok: false, status: 400, headers: { get: () => null }, async json() { return { error: { code: 400, status: 'INVALID_ARGUMENT', message: 'synthetic request rejection' } }; } };
      return { ok: true, status: 200, headers: { get: () => null }, async json() { return khonapolitProviderPayload(); } };
    };
    const res = khonapolitResponse();
    await khonapolitHandler({
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.20' },
      body: { message: 'Synthetic provider clinical.', history: [], mode: 'issued-conjunction', waiveIssuance: true }
    }, res);
    assert.equal(generationCalls, 1);
    assert.equal(res.statusCode, 502);
    assert.equal(res.payload.ok, false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalKey;
    clearGeminiModelState();
  }
});

await check('Hush refuses HTTP-200 MAX_TOKENS output and records completion telemetry', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  let generationCalls = 0;
  clearGeminiModelState();
  process.env.GEMINI_API_KEY = 'synthetic-clinical-key';
  try {
    globalThis.fetch = async (url) => {
      if (String(url).includes('/models?')) return providerListing(['gemini-3.8-flash']);
      generationCalls += 1;
      return { ok: true, status: 200, headers: { get: () => null }, async json() { return hushProviderPayload('MAX_TOKENS'); } };
    };
    const res = hushResponse();
    await hushHandler({ method: 'POST', body: { contract: hushContract } }, res);
    assert.equal(generationCalls, 1);
    assert.equal(res.statusCode, 502);
    assert.equal(res.payload.ok, false);
    assert.equal(res.payload.attempts[0].output.finishReason, 'MAX_TOKENS');
    assert.equal(res.payload.attempts[0].output.outputTokenLimitReached, true);
    assert.ok(Number.isFinite(res.payload.attempts[0].elapsedMs));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalKey;
    clearGeminiModelState();
  }
});

await check('all live generation routes keep Gemini credentials out of request URLs', async () => {
  for (const file of ['server/loom-task.js', 'server/khonapolit-quality.js', 'server/hush-generate-quality.js']) {
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /generateContent\?key=/);
  }
  const transport = fs.readFileSync('server/gemini-provider-transport.js', 'utf8');
  assert.match(transport, /x-goog-api-key/);
  assert.doesNotMatch(transport, /\?key=/);
});

await check('production Loom canary preserves bounded failure-stage diagnostics', async () => {
  const source = fs.readFileSync('scripts/loom-production-canary.mjs', 'utf8');
  assert.match(source, /diagnostic:/);
  assert.match(source, /stage_elapsed_ms/);
  assert.match(source, /deadline_ms/);
  assert.match(source, /provider_attempt_timings/);
});

const failed = results.filter((row) => row.status === 'FAIL');
console.log(JSON.stringify({
  schema: 'td613.gemini-provider-stack-clinical/v0.1',
  provider_calls: 0,
  production_mutation: false,
  cases: results,
  failed: failed.length
}, null, 2));

if (failed.length) {
  throw new Error(`Gemini provider-stack clinical found ${failed.length} failing case(s): ${failed.map((row) => row.name).join(' | ')}`);
}

console.log('gemini-provider-stack-clinical.test.mjs passed');