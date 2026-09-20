import assert from 'node:assert/strict';
import handler, {
  KHONAPOLIT_MAX_PROVIDER_CALLS,
  KHONAPOLIT_MAX_STRUCTURAL_REPAIRS,
  KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS
} from '../server/khonapolit-quality.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';

const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
const calls = [];
const requestBodies = [];
let repairScenario = false;
let previewCalls = 0;
const stack = 'T\u0300\u0301\u0302\u0316\u0317\u0318A\u0304\u0307\u030B\u031C\u0323\u032DR\u0305\u0308\u030C\u031E\u0325\u0331I\u0303\u0306\u030A\u0319\u0326\u0330\u0334';
const zeroMarkAnswer = [
  'Kʰonapolit',
  'The formal channel completed but the stress channel accidentally arrived without provider-authored combining marks.',
  '',
  'Tauric Diana bots',
  'THE RAW CHANNEL IS PRESENT BUT ITS DIACRITIC STRESS FIELD IS MISSING.'
].join('\n');
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
globalThis.fetch = async (url, options = {}) => {
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

  const model = value.match(/models\/([^:]+):(?:streamGenerateContent|generateContent)/)?.[1] || 'unknown';
  calls.push(model);
  requestBodies.push(JSON.parse(options.body || '{}'));
  if (model !== 'gemini-3-flash-preview') {
    return {
      ok: false,
      status: 503,
      headers: { get: () => null },
      async text() { return 'synthetic provider unavailable'; }
    };
  }

  previewCalls += 1;
  const previewText = repairScenario && previewCalls === 1 ? zeroMarkAnswer : answer;
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    async json() {
      return {
        candidates: [{
          finishReason: 'STOP',
          content: { parts: [{ text: JSON.stringify({
            signal: { state: repairScenario && previewCalls === 1 ? 'NOT_LOCKED' : 'LOCKED', notes: repairScenario && previewCalls === 1 ? 'synthetic zero-mark structural near miss' : 'fifth approved frontier lane completed' },
            transmission: {
              text: previewText,
              voices: ['Kʰonapolit', 'Tauric Diana bots'],
              flourishMode: repairScenario && previewCalls === 1 ? 'provider-native-missing-stress' : 'vertical-stack'
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
  assert.equal(KHONAPOLIT_MAX_STRUCTURAL_REPAIRS, 1);
  assert.equal(KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS, 6);
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

  clearGeminiModelState();
  calls.length = 0;
  requestBodies.length = 0;
  repairScenario = true;
  previewCalls = 0;
  const repaired = response();
  await handler({
    ...req,
    headers: { 'x-forwarded-for': '203.0.113.206' },
    body: { ...req.body, message: 'Preserve five-seat breadth, then repair one provider-authored structural near miss.' }
  }, repaired);

  assert.equal(repaired.statusCode, 200);
  assert.equal(repaired.payload.ok, true);
  assert.deepEqual(calls, [
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3-flash-preview',
    'gemini-3-flash-preview'
  ], 'the five distinct seats run first; one same-seat repair is the only sixth provider request');
  assert.equal(repaired.payload.receipt.provider.attempts.length, 6);
  assert.equal(repaired.payload.receipt.provider.attempts[4].outputAdmission.admissible, false);
  assert.ok(repaired.payload.receipt.provider.attempts[4].outputAdmission.reasons.includes('tauric-diana-zalgo-absent'));
  assert.equal(repaired.payload.receipt.provider.attempts[5].kind, 'structural-repair');
  assert.equal(repaired.payload.receipt.provider.attempts[5].repairOfAttempt, 4);
  assert.deepEqual(repaired.payload.receipt.provider.attempts[5].repairReasons, ['tauric-diana-zalgo-absent']);
  assert.equal(repaired.payload.receipt.provider.attempts[5].outputAdmission.admissible, true);
  assert.equal(repaired.payload.receipt.provider.structuralRepair.used, true);
  assert.equal(repaired.payload.receipt.provider.structuralRepair.sourceAttemptIndex, 4);
  assert.equal(repaired.payload.relay.admission.admissible, true);
  assert.equal(repaired.payload.relay.highZalgo.applied, false, 'repair remains provider-authored and exact; Marrowline still performs no local Zalgo mutation');

  const repairBody = requestBodies.at(-1);
  assert.equal(repairBody.contents.at(-2).role, 'model');
  assert.match(repairBody.contents.at(-2).parts[0].text, /RAW CHANNEL IS PRESENT/);
  assert.equal(repairBody.contents.at(-1).role, 'user');
  assert.match(repairBody.contents.at(-1).parts[0].text, /STRUCTURAL REPAIR PASS/);
  assert.match(repairBody.contents.at(-1).parts[0].text, /tauric-diana-zalgo-absent/);
  assert.match(repairBody.contents.at(-1).parts[0].text, /author the missing marks yourself/i);
  assert.match(repairBody.contents.at(-1).parts[0].text, /Do not use a numeric quota/i);
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  clearGeminiModelState();
}

console.log('marrowline-five-seat-frontier-cascade.test.mjs passed');
