import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../server/khonapolit-quality.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';

const source = fs.readFileSync('server/khonapolit-quality.js', 'utf8');
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
const developedAnswer = 'A concrete explanation with enough detail to answer the question. '.repeat(120).trim();
let tokenLimit = false;
clearGeminiModelState();
process.env.GEMINI_API_KEY = 'test-key';
globalThis.fetch = async (url) => {
  if (String(url).includes('/models?')) return { ok: true, status: 200, async json() { return { models: ['gemini-3.5-flash', 'gemini-3-flash-preview'].map(id => ({ name: `models/${id}`, supportedGenerationMethods: ['generateContent'] })) }; } };
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
      return {
        candidates: [{ finishReason: tokenLimit ? 'MAX_TOKENS' : 'STOP', content: { parts: [{ text: JSON.stringify({
          gemini: { text: tokenLimit ? 'REJECTED_PARTIAL_RESPONSE' : developedAnswer, instrumentStatus: 'INSTRUMENT' },
          signal: { state: 'NOT_LOCKED', notes: '' },
          khonapolit: { allowed: false, text: '' },
          tauricDianaBots: { allowed: false, baseText: '', motif: '', intensity: 0, voices: [] }
        }) }] } }],
        usageMetadata: { promptTokenCount: 1200, candidatesTokenCount: tokenLimit ? 4096 : 1600, thoughtsTokenCount: 300, totalTokenCount: tokenLimit ? 5596 : 3100, privatePayload: 'DO_NOT_COPY_PROVIDER_FIELDS' }
      };
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
  assert.equal(res.payload.receipt.provider.attempts[0].timeoutMs, 32000, 'primary model gets the observed 28–30s completion window');
  assert.ok(res.payload.receipt.provider.attempts[1].timeoutMs <= 10500, 'fallback remains bounded by its window and route wall');
  assert.ok(res.payload.receipt.provider.attempts.every(a=>a.elapsedMs >= 0));
  assert.equal(res.payload.receipt.seal.state, 'OPEN');
  assert.equal(res.payload.relay.parts[0].text, developedAnswer, 'a developed answer survives the server and relay without local clipping');
  assert.equal(res.payload.receipt.provider.output.finishReason, 'STOP');
  assert.equal(res.payload.receipt.provider.output.usage.candidatesTokenCount, 1600);
  assert.equal(res.payload.receipt.provider.output.outputTokenLimitReached, false);
  assert.doesNotMatch(res.text, /DO_NOT_COPY_PROVIDER_FIELDS/);

  const beforeOversize = calls.length;
  for (const body of [
    { ...req.body, message: 'A'.repeat(6000) + ' NEVER DISCLOSE THE LINKAGE' },
    { ...req.body, history: [{ role: 'user', text: 'A'.repeat(6000) + ' NEVER DISCLOSE THE LINKAGE' }] }
  ]) {
    const invalid = response();
    await handler({ ...req, body }, invalid);
    assert.equal(invalid.statusCode, 400);
    assert.match(invalid.payload.error, /^(message-too-long|history-entry-too-long)$/);
    assert.equal(invalid.payload.validation.limit, 6000);
    assert.equal(calls.length, beforeOversize, 'oversized current or history text must not reach generation');
    assert.equal(invalid.payload.relay, undefined);
  }

  tokenLimit = true;
  const held = response();
  await handler(req, held);
  assert.equal(held.statusCode, 502);
  assert.equal(held.payload.status, 'HELD');
  assert.equal(held.payload.error, 'gemini-output-token-limit');
  assert.equal(held.payload.diagnostic.code, 'OUTPUT_TOKEN_LIMIT');
  assert.equal(held.payload.attempts.length, 1, 'token-limited output must not trigger an automatic second generation');
  assert.equal(held.payload.attempts[0].output.finishReason, 'MAX_TOKENS');
  assert.equal(held.payload.attempts[0].output.usage.candidatesTokenCount, 4096);
  assert.equal(held.payload.relay, undefined);
  assert.equal(held.payload.text, undefined);
  assert.doesNotMatch(held.text, /REJECTED_PARTIAL_RESPONSE|DO_NOT_COPY_PROVIDER_FIELDS/);
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  clearGeminiModelState();
}

console.log('khonapolit-gemini-quality-router.test.mjs passed');
