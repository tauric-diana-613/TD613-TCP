import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler, { buildHushGeminiRequest } from '../api/hush-generate-quality.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';

const source = fs.readFileSync('server/hush-generate-quality.js', 'utf8');
assert.match(source, /resolveGeminiModelPlan\(\{ task: 'hush-transform'/);
assert.match(source, /sticky-success-promotion-disabled/);
assert.match(source, /moving-latest-alias-disabled-by-default/);
assert.doesNotMatch(source, /gemini-flash-lite-latest/);

const direct3 = buildHushGeminiRequest({ model: 'gemini-3.8-flash', prompt: 'synthetic', deterministic: true });
assert.equal(direct3.generationConfig.maxOutputTokens, 3072);
assert.equal(direct3.generationConfig.responseMimeType, 'application/json');
for (const key of ['temperature', 'topP', 'topK']) assert.equal(Object.hasOwn(direct3.generationConfig, key), false);
const direct25 = buildHushGeminiRequest({ model: 'gemini-2.5-flash', prompt: 'synthetic', deterministic: true });
assert.equal(direct25.generationConfig.temperature, 0.22);
assert.equal(direct25.generationConfig.topP, 0.64);
assert.equal(Object.hasOwn(direct25.generationConfig, 'thinkingConfig'), false);

function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return payload; }
  };
}

const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
const calls = [];
const requestBodies = [];
clearGeminiModelState();
process.env.GEMINI_API_KEY = 'test-key';
globalThis.fetch = async (url, options = {}) => {
  if (String(url).includes('/models?')) return { ok: true, status: 200, async json() { return { models: ['gemini-3.5-flash', 'gemini-3-flash-preview'].map(id => ({ name: `models/${id}`, supportedGenerationMethods: ['generateContent'] })) }; } };
  calls.push(String(url));
  requestBodies.push(JSON.parse(options.body));
  if (calls.length === 1) {
    return {
      ok: false,
      status: 429,
      headers: { get: (name) => name.toLowerCase() === 'retry-after' ? '60' : null },
      async json() { return { error: { status: 'RESOURCE_EXHAUSTED', code: 429, message: 'quota' } }; }
    };
  }
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    async json() {
      return {
        candidates: [{ content: { parts: [{ text: JSON.stringify({ candidates: [{ text: 'because the door opened, the cat crossed the room.', style_note: 'reordered', authorship_moves: ['recomposed away from source sequence'] }] }) }] } }]
      };
    }
  };
};

try {
  const req = {
    method: 'POST',
    body: { contract: { sourceText: 'the cat crossed the room because the door opened.', candidateCount: 1 } }
  };
  const res = response();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.ok, true);
  assert.equal(res.payload.model, 'gemini-3-flash-preview');
  assert.equal(res.payload.attempts.length, 2);
  assert.match(calls[0], /gemini-3\.5-flash/);
  assert.match(calls[1], /gemini-3-flash-preview/);
  assert.equal(requestBodies.length, 2);
  for (const body of requestBodies) {
    assert.equal(body.generationConfig.maxOutputTokens, 3072);
    assert.equal(body.generationConfig.responseMimeType, 'application/json');
    for (const key of ['temperature', 'topP', 'topK']) assert.equal(Object.hasOwn(body.generationConfig, key), false);
  }
  assert.equal(res.payload.requestReceipt.modelOrder[0], 'gemini-3.5-flash');
  assert.equal(res.payload.requestReceipt.modelPolicy.stickySuccessPromotion, false);
  assert.ok(res.payload.candidates.length >= 1);
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  clearGeminiModelState();
}

console.log('hush-gemini-quality-router.test.mjs passed');
