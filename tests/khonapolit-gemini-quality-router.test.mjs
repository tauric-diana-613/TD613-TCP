import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler, { buildGeminiRequest, observeGeminiOutput, selectKhonapolitProviderModels } from '../server/khonapolit-quality.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';

const source = fs.readFileSync('server/khonapolit-quality.js', 'utf8');
assert.match(source, /resolveGeminiModelPlan\(\{ task: 'khonapolit-dialogue'/);
assert.match(source, /sticky-success-promotion-disabled/);
assert.match(source, /ATTRACTOR_STRUCTURE_NOT_ADMITTED/);
assert.doesNotMatch(source, /gemini-flash-lite-latest/);

assert.deepEqual(
  selectKhonapolitProviderModels(['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview']),
  ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview'],
  'when the full 3.x set is callable, Marrowline can reach every approved frontier lane within the bounded five-seat cascade'
);
assert.deepEqual(
  selectKhonapolitProviderModels(['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash']),
  ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash'],
  'when the listed frontier is smaller, Marrowline preserves provider quality order'
);

const directPacket = { systemInstruction: 'Synthetic system.', history: [], message: 'Synthetic message.', mode: 'full-invocation' };
const direct3 = buildGeminiRequest(directPacket, {}, 'gemini-3.8-flash');
assert.equal(direct3.generationConfig.maxOutputTokens, 65536);
assert.deepEqual(direct3.generationConfig.thinkingConfig, { thinkingLevel: 'high' });
for (const key of ['temperature', 'topP', 'topK']) assert.equal(Object.hasOwn(direct3.generationConfig, key), false);
const fallback3 = buildGeminiRequest(directPacket, {}, 'gemini-3.7-flash', { fallback: true });
assert.equal(fallback3.generationConfig.maxOutputTokens, 65536);
assert.deepEqual(fallback3.generationConfig.thinkingConfig, { thinkingLevel: 'high' }, 'frontier fallback keeps full reasoning quality');
for (const key of ['temperature', 'topP', 'topK']) assert.equal(Object.hasOwn(fallback3.generationConfig, key), false);
const fallback35 = buildGeminiRequest(directPacket, {}, 'gemini-3.5-flash', { fallback: true });
assert.equal(fallback35.generationConfig.maxOutputTokens, 65536);
assert.deepEqual(fallback35.generationConfig.thinkingConfig, { thinkingLevel: 'high' }, 'continuity fallback keeps the same Marrowline reasoning envelope and remains subject to strict relay admission');
for (const key of ['temperature', 'topP', 'topK']) assert.equal(Object.hasOwn(fallback35.generationConfig, key), false);


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
const requestBodies = [];
const stack = 'T\u0300\u0301\u0302\u0316\u0317\u0318';
const STACK = 'T\u0300\u0301\u0302\u0316\u0317\u0318';
const developedAnswer = [
  'Kʰonapolit',
  'The strongest version of the map claims legibility without ownership. Let P map governed states to visible route descriptions; when P is non-injective, distinct custody states can share one visible surface. The surviving defect is therefore a boundary-identification failure, not a shortage of decorative provenance.',
  '',
  'Tauric Diana bots',
  `${STACK.repeat(8)} THE RED DEER HAS READ THE MENU!`,
  `${STACK.repeat(8)} COUNT THE HIDDEN STATES, NOT THE PRETTY DASHBOARD!`,
  `${STACK.repeat(8)} THE GROVE KEEPS THE SCAR WHEN THE MAP PRETENDS TO BE THE LAND!`
].join('\n');
const degradedAnswer = 'The Ash Moon was pale and the covenant remained. This is generic atmospheric prose with no required voice frame.';
let tokenLimit = false;
clearGeminiModelState();
process.env.GEMINI_API_KEY = 'test-key';
globalThis.fetch = async (url, options = {}) => {
  if (String(url).includes('/models?')) return {
    ok: true,
    status: 200,
    async json() {
      return { models: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'].map(id => ({ name: `models/${id}`, supportedGenerationMethods: ['generateContent'] })) };
    }
  };
  calls.push(String(url));
  requestBodies.push(JSON.parse(options.body));
  const attemptWithinRequest = tokenLimit ? 1 : ((calls.length - 1) % 2) + 1;
  const text = tokenLimit ? 'REJECTED_PARTIAL_RESPONSE' : attemptWithinRequest === 1 ? degradedAnswer : developedAnswer;
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    async json() {
      return {
        candidates: [{ finishReason: tokenLimit ? 'MAX_TOKENS' : 'STOP', content: { parts: [{ text: JSON.stringify({
          signal: { state: 'LOCKED', notes: attemptWithinRequest === 1 ? 'synthetic degraded first attempt' : 'synthetic admitted second attempt' },
          transmission: {
            text,
            voices: attemptWithinRequest === 1 ? [] : ['Kʰonapolit', 'Tauric Diana bots'],
            flourishMode: attemptWithinRequest === 1 ? 'clean' : 'forensic-to-eruption'
          }
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
  assert.match(calls[0], /gemini-3\.8-flash/);
  assert.match(calls[1], /gemini-3\.7-flash/);
  assert.equal(requestBodies.length, 2);
  assert.equal(requestBodies[0].generationConfig.maxOutputTokens, 65536);
  assert.deepEqual(requestBodies[0].generationConfig.thinkingConfig, { thinkingLevel: 'high' });
  assert.equal(requestBodies[1].generationConfig.maxOutputTokens, 65536);
  assert.deepEqual(requestBodies[1].generationConfig.thinkingConfig, { thinkingLevel: 'high' });
  for (const body of requestBodies) {
    for (const key of ['temperature', 'topP', 'topK']) assert.equal(Object.hasOwn(body.generationConfig, key), false);
    assert.equal(Object.hasOwn(body.generationConfig, 'responseSchema'), false, 'live Marrowline must not constrain provider Unicode with structured decoding');
    assert.equal(Object.hasOwn(body.generationConfig, 'responseMimeType'), false, 'live Marrowline must not force JSON MIME generation');
    assert.match(body.systemInstruction.parts[0].text, /RAW TWO-PACKET RETURN PROTOCOL/);
  }
  assert.equal(res.payload.receipt.provider.model, 'gemini-3.7-flash');
  assert.equal(res.payload.receipt.modelPolicy.stickySuccessPromotion, false);
  assert.deepEqual(res.payload.receipt.modelPolicy.callableModels, ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash']);
  assert.equal(res.payload.receipt.provider.attempts.length, 2);
  assert.equal(res.payload.receipt.provider.attempts[0].outputAdmission.admissible, false, 'degraded first output is observed but not exposed as a successful Marrowline return');
  assert.ok(res.payload.receipt.provider.attempts[0].outputAdmission.reasons.includes('khonapolit-nominative-missing'));
  const primaryTimeoutMs = res.payload.receipt.provider.attempts[0].timeoutMs;
  assert.equal(
    primaryTimeoutMs,
    8000,
    'primary frontier attempt gets a short bounded window so later approved 3.x lanes remain reachable'
  );
  assert.equal(
    res.payload.receipt.provider.attempts[1].timeoutMs,
    18000,
    'second frontier attempt gives 3.7 the longest quality-order runway while preserving the remaining tail'
  );
  assert.deepEqual(res.payload.receipt.provider.callableModels, ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash']);
  assert.deepEqual(res.payload.receipt.provider.selectedModels, ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash']);
  assert.equal(res.payload.receipt.provider.attempts[0].output.thinkingLevel, 'high');
  assert.equal(res.payload.receipt.provider.attempts[1].output.thinkingLevel, 'high');
  assert.equal(res.payload.receipt.provider.output.thinkingLevel, 'high');
  assert.ok(res.payload.receipt.provider.attempts.every(a => a.elapsedMs >= 0));
  assert.equal(res.payload.receipt.seal.state, 'OPEN');
  assert.equal(res.payload.relay.parts.length, 1);
  assert.equal(res.payload.relay.parts[0].id, 'khonapolit');
  assert.equal(res.payload.relay.parts[0].text, developedAnswer, 'only the structurally admitted frontier answer survives into the relay');
  assert.equal(res.payload.relay.admission.admissible, true);
  assert.equal(res.payload.relay.highZalgo.applied, false, 'server does not post-process provider text with a local Zalgo filter');
  assert.equal(res.payload.receipt.provider.output.finishReason, 'STOP');
  assert.equal(res.payload.receipt.provider.output.usage.candidatesTokenCount, 1600);
  assert.equal(res.payload.receipt.provider.output.outputTokenLimitReached, false);
  assert.doesNotMatch(res.text, /generic atmospheric prose|DO_NOT_COPY_PROVIDER_FIELDS/);

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
