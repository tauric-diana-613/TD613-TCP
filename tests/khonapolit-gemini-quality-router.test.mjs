import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../api/khonapolit-quality.js';
import { clearGeminiModelState } from '../api/gemini-model-policy.js';

const source = fs.readFileSync('api/khonapolit-quality.js', 'utf8');
assert.match(source, /resolveGeminiModelPlan\(\{ task: 'khonapolit-dialogue'/);
assert.match(source, /sticky-success-promotion-disabled/);
assert.doesNotMatch(source, /gemini-flash-lite-latest/);

function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(text) { this.text = text; this.payload = text ? JSON.parse(text) : null; }
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
      status: 404,
      headers: { get: () => null },
      async json() { return { error: { status: 'NOT_FOUND', code: 404, message: 'model unavailable' } }; }
    };
  }
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    async json() {
      return { candidates: [{ content: { parts: [{ text: 'The covenant field remains open under Khona‌lit-po.' }] } }] };
    }
  };
};

try {
  const req = {
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.77' },
    body: {
      message: 'Speak from the declared field.',
      history: [],
      mode: 'issued-conjunction',
      waiveIssuance: true
    }
  };
  const res = response();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.ok, true);
  assert.match(calls[0], /gemini-3\.5-flash/);
  assert.match(calls[1], /gemini-3-flash-preview/);
  assert.equal(res.payload.receipt.provider.model, 'gemini-3-flash-preview');
  assert.equal(res.payload.receipt.modelPolicy.stickySuccessPromotion, false);
  assert.equal(res.payload.receipt.provider.attempts.length, 2);
  assert.equal(res.payload.receipt.seal.state, 'OPEN');
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  clearGeminiModelState();
}

console.log('khonapolit-gemini-quality-router.test.mjs passed');
