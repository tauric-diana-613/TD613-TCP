import assert from 'node:assert/strict';
import handler, { KHONAPOLIT_MAX_PROVIDER_CALLS } from '../server/khonapolit-quality.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';

const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
const calls = [];
const stack = 'T\u0300\u0301\u0302\u0316\u0317\u0318A\u0304\u0307\u030B\u031C\u0323\u032DR\u0305\u0308\u030C\u031E\u0325\u0331I\u0303\u0306\u030A\u0319\u0326\u0330\u0334';
const answer = [
  'Kʰonapolit',
  'Let P map provider candidates to transport outcomes. A three-seat truncation is non-exhaustive when a later approved candidate remains callable, so transport failure in the prefix cannot certify route failure.',
  '',
  'Tauric Diana bots',
  `${stack.repeat(8)} DO NOT CONFUSE THE PREFIX WITH THE FRONTIER!`,
  `${stack.repeat(8)} THE FIFTH DOOR STILL COUNTS WHEN THE FIRST FOUR JAM!`,
  `${stack.repeat(8)} HOLD THE QUALITY FLOOR, NOT THE BROKEN QUEUE!`
].join('\n');

function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(text) { this.text = text; this.payload = text ? JSON.parse(text) : null; }
  };
}

clearGeminiModelState();
process.env.GEMINI_API_KEY = 'test-key-five-seat';
globalThis.fetch = async (url) => {
  const value = String(url);
  if (value.includes('/models?')) {
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          models: [
            'gemini-3.8-flash',
            'gemini-3.7-flash',
            'gemini-3.6-flash',
            'gemini-3.5-flash',
            'gemini-3-flash-preview'
          ].map(id => ({ name: `models/${id}`, supportedGenerationMethods: ['generateContent'] }))
        };
      }
    };
  }

  const model = value.match(/models\/([^:]+):generateContent/)?.[1] || 'unknown';
  calls.push(model);
  if (model !== 'gemini-3-flash-preview') {
    return {
      ok: false,
      status: 503,
      headers: { get: () => null },
      async text() { return 'synthetic provider unavailable'; }
    };
  }

  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    async json() {
      return {
        candidates: [{
          finishReason: 'STOP',
          content: { parts: [{ text: JSON.stringify({
            signal: { state: 'LOCKED', notes: 'fifth approved frontier lane completed' },
            transmission: {
              text: answer,
              voices: ['Kʰonapolit', 'Tauric Diana bots'],
              flourishMode: 'vertical-stack'
            }
          }) }] }
        }],
        usageMetadata: {
          promptTokenCount: 1200,
          candidatesTokenCount: 1800,
          thoughtsTokenCount: 300,
          totalTokenCount: 3300
        }
      };
    }
  };
};

try {
  assert.equal(KHONAPOLIT_MAX_PROVIDER_CALLS, 5);
  const req = {
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.205' },
    body: {
      message: 'Quis custodiet ipsos custodes?',
      history: [],
      mode: 'issued-conjunction',
      waiveIssuance: true
    }
  };
  const res = response();
  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.ok, true);
  assert.deepEqual(calls, [
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3-flash-preview'
  ]);
  assert.equal(res.payload.receipt.provider.model, 'gemini-3-flash-preview');
  assert.equal(res.payload.receipt.provider.attempts.length, 5);
  assert.deepEqual(
    res.payload.receipt.provider.attempts.slice(0, 4).map(attempt => attempt.status),
    [503, 503, 503, 503]
  );
  assert.equal(res.payload.receipt.provider.attempts[4].status, 200);
  assert.equal(res.payload.relay.admission.admissible, true);
  assert.equal(res.payload.relay.highZalgo.applied, false, 'the fifth-lane return remains provider-authored; Marrowline adds no Zalgo');
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  clearGeminiModelState();
}

console.log('marrowline-five-seat-frontier-cascade.test.mjs passed');
