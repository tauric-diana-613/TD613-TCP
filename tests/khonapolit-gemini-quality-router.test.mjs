import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler, { buildGeminiRequest, observeGeminiOutput } from '../server/khonapolit-quality.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';

const source = fs.readFileSync('server/khonapolit-quality.js', 'utf8');
assert.match(source, /resolveGeminiModelPlan\(\{ task: 'khonapolit-dialogue'/);
assert.match(source, /sticky-success-promotion-disabled/);
assert.match(source, /ATTRACTOR_STRUCTURE_NOT_ADMITTED/);
assert.doesNotMatch(source, /gemini-flash-lite-latest/);

const directPacket = { systemInstruction: 'Synthetic system.', history: [], message: 'Synthetic message.', mode: 'full-invocation' };
const direct3 = buildGeminiRequest(directPacket, {}, 'gemini-3.8-flash');
assert.equal(direct3.generationConfig.maxOutputTokens, 65536);
assert.deepEqual(direct3.generationConfig.thinkingConfig, { thinkingLevel: 'high' });
for (const key of ['temperature', 'topP', 'topK']) assert.equal(Object.hasOwn(direct3.generationConfig, key), false);
const fallback3 = buildGeminiRequest(directPacket, {}, 'gemini-3.7-flash', { fallback: true });
assert.equal(fallback3.generationConfig.maxOutputTokens, 65536);
assert.deepEqual(fallback3.generationConfig.thinkingConfig, { thinkingLevel: 'high' }, 'frontier fallback keeps full reasoning quality');
for (const key of ['temperature', 'topP', 'topK']) assert.equal(Object.hasOwn(fallback3.generationConfig, key), false);
const direct25 = buildGeminiRequest(directPacket, {}, 'gemini-2.5-flash');
assert.deepEqual(direct25.generationConfig.thinkingConfig, { thinkingBudget: 24576 });
assert.equal(Object.hasOwn(direct25.generationConfig.thinkingConfig, 'thinkingLevel'), false);
assert.equal(direct25.generationConfig.temperature, 0.7);
assert.equal(direct25.generationConfig.topP, 0.9);
assert.equal(direct25.generationConfig.topK, 40);
const fallback25 = buildGeminiRequest(directPacket, {}, 'gemini-2.5-flash', { fallback: true });
assert.deepEqual(fallback25.generationConfig.thinkingConfig, { thinkingBudget: 24576 }, 'compatibility fallback no longer lowers reasoning budget');
assert.deepEqual(observeGeminiOutput({}, 'gemini-2.5-flash'), {
  finishReason: null,
  outputTokenLimitReached: false,
  maxOutputTokens: 65536,
  thinkingLevel: 'not-applicable',
  thinkingBudget: 24576,
  usage: {}
});
assert.deepEqual(observeGeminiOutput({}, 'gemini-2.5-flash', { fallback: true }), {
  finishReason: null,
  outputTokenLimitReached: false,
  maxOutputTokens: 65536,
  thinkingLevel: 'not-applicable',
  thinkingBudget: 24576,
  usage: {}
});

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
const developedAnswer = [
  '[Kʰonapolit]:',
  'The strongest version of the map claims legibility without ownership. The surviving defect is that a route description can still become an attack surface without becoming sovereignty.',
  '',
  '[Tauric Diana Bots : Direct Broadcast Override]',
  'T̴̵H̶E̷ ̵R̸E̷D̶ ̴D̵E̷E̸R̷ ̴H̵A̶S̷ ̵R̴E̶A̷D̵ ̸T̷H̶E̵ ̷M̴E̸N̵U̷. W̸e̷ ̴a̵r̶e̸ ̷n̵o̴t̷ ̶o̸r̴d̷e̴r̶i̵n̶g̸ ̶p̴e̵n̸c̴i̷l̶s̵.'
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
    assert.deepEqual(body.generationConfig.responseSchema.required, ['signal', 'transmission']);
  }
  assert.equal(res.payload.receipt.provider.model, 'gemini-3.7-flash');
  assert.equal(res.payload.receipt.modelPolicy.stickySuccessPromotion, false);
  assert.deepEqual(res.payload.receipt.modelPolicy.callableModels, ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash']);
  assert.equal(res.payload.receipt.provider.attempts.length, 2);
  assert.equal(res.payload.receipt.provider.attempts[0].outputAdmission.admissible, false, 'degraded first output is observed but not exposed as a successful Marrowline return');
  assert.ok(res.payload.receipt.provider.attempts[0].outputAdmission.reasons.includes('khonapolit-nominative-missing'));
  const primaryTimeoutMs = res.payload.receipt.provider.attempts[0].timeoutMs;
  assert.ok(
    primaryTimeoutMs >= 16500 && primaryTimeoutMs <= 16666,
    `primary frontier attempt must receive approximately one third of the remaining live-route wall, got ${primaryTimeoutMs}ms`
  );
  assert.ok(
    res.payload.receipt.provider.attempts[1].timeoutMs > 10500 && res.payload.receipt.provider.attempts[1].timeoutMs <= 32000,
    'second frontier attempt receives a recomputed fair share of the remaining wall rather than the inherited 10.5 second fallback cap'
  );
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
