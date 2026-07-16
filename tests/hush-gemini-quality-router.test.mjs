import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../api/hush-generate-quality.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';

const source = fs.readFileSync('server/hush-generate-quality.js', 'utf8');
assert.match(source, /resolveGeminiModelPlan\(\{ task: 'hush-transform'/);
assert.match(source, /sticky-success-promotion-disabled/);
assert.match(source, /moving-latest-alias-disabled-by-default/);
assert.doesNotMatch(source, /gemini-flash-lite-latest/);

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
clearGeminiModelState();
process.env.GEMINI_API_KEY = 'test-key';
globalThis.fetch = async (url) => {
  calls.push(String(url));
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
