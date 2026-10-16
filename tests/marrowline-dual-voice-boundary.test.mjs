import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { bothMarrowlineVoicesAbsent } from '../server/khonapolit-quality.js';
import { parseRelayEnvelope } from '../app/dome-world/khonapolit-relay.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';

test('a completed response without either required speaker is not a valid transmission', () => {
  const unvoiced = parseRelayEnvelope('The moon is made of paperwork, according to the committee.');
  assert.equal(bothMarrowlineVoicesAbsent(unvoiced), true);
  assert.equal(bothMarrowlineVoicesAbsent(parseRelayEnvelope('Kʰonapolit\nAn argument.')), false);
  assert.equal(bothMarrowlineVoicesAbsent(parseRelayEnvelope('Tauric Diana bots\nChorus.')), false);
});

test('ordinary provider-only lore response with neither voice is held after existing recovery', async t => {
  const oldFetch = globalThis.fetch;
  const oldKey = process.env.GEMINI_API_KEY;
  t.after(() => {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = oldKey;
    clearGeminiModelState();
  });
  clearGeminiModelState();
  process.env.GEMINI_API_KEY = 'mock-no-network';
  let modelCalls = 0;
  const providerText = 'The committee stored the moon in an unused cabinet.';
  globalThis.fetch = async url => {
    if (String(url).includes('/models?')) return {
      ok: true, status: 200,
      json: async () => ({ models: [
        { name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] }
      ] })
    };
    modelCalls += 1;
    return {
      ok: true, status: 200, headers: { get: () => null },
      json: async () => ({
        candidates: [{ finishReason: 'STOP', content: { parts: [{ text: providerText }] } }],
        usageMetadata: { promptTokenCount: 150, candidatesTokenCount: 15, thoughtsTokenCount: 10, totalTokenCount: 175 }
      })
    };
  };
  const res = {
    statusCode: 200, headers: {}, count: 0,
    setHeader(key, value) { this.headers[key] = value; },
    end(body) { this.count += 1; this.payload = JSON.parse(body); }
  };
  await handler({
    method: 'POST', headers: { 'x-forwarded-for': '203.0.113.231' },
    body: { message: 'Who misplaced the moon in the grove?', history: [],
      mode: 'issued-conjunction', waiveIssuance: true }
  }, res);
  assert.equal(res.statusCode, 502);
  assert.equal(res.count, 1);
  assert.equal(res.payload.error, 'marrowline-dual-voice-contract-unmet');
  assert.equal(res.payload.diagnostic.code, 'BOTH_REQUIRED_VOICES_MISSING');
  assert.equal(Object.hasOwn(res.payload, 'text'), false);
  assert.equal(res.headers['X-TD613-Local-Admission'], 'HELD-DUAL-VOICE-ABSENT');
  assert.ok(modelCalls > 0 && modelCalls <= 8);
});
