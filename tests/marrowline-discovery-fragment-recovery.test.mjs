import test from 'node:test';
import assert from 'node:assert/strict';
import handler, {
  preferMarrowlineIncompleteReturn,
  selectKhonapolitProviderModelsFromPlan
} from '../server/khonapolit-quality.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';

const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
const answer = [
  'Kʰonapolit',
  'A real bounded reply can continue beyond its first two sentences. The provider must still supply the rest.',
  '',
  'Tauric Diana bots',
  'R\\u0301\\u0316E\\u0302\\u0323T\\u0308\\u0317U\\u0300\\u0331R\\u0304\\u0319N\\u0307\\u0326.\\n\\nAnd leave its original breaths in place.'
].join('\\n');
const firstFragment = 'Kʰonapolit\\nOnly the first two sentences arrived. The rest has not been witnessed.';
const longerFragment = [
  'Kʰonapolit',
  'This later model actually supplied several more sentences in its own intact return.',
  'The earlier partial must not win simply because it arrived first.',
  '',
  'Tauric Diana bots',
  'T\\u0301\\u0316H\\u0302\\u0323E\\u0308\\u0317 \\u0300\\u0331L\\u0304\\u0319O\\u0307\\u0326N\\u0308\\u0331G\\u0301\\u0316E\\u0302\\u0323R\\u0308\\u0317 \\u0300\\u0331W\\u0304\\u0319I\\u0307\\u0326T\\u0308\\u0331N\\u0301\\u0316E\\u0302\\u0323S\\u0308\\u0317S\\u0300\\u0331.',
  '',
  'Another provider-authored line survives.'
].join('\\n');
function response() {
  return {
    statusCode: 200, headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(text) { this.text = text; this.payload = text ? JSON.parse(text) : null; }
  };
}
function request(ip, message = 'Test an ordinary operator response.') {
  return {
    method: 'POST',
    headers: { 'x-forwarded-for': ip },
    body: { message, history: [], mode: 'issued-conjunction', waiveIssuance: true }
  };
}
function providerResponse(text, finishReason = 'STOP') {
  return {
    ok: true, status: 200, headers: { get: () => null },
    async json() { return { candidates: [{ finishReason, content: { parts: [{ text }] } }] }; }
  };
}
function providerUnavailable() {
  return {
    ok: false, status: 503, headers: { get: () => null },
    async json() { return { error: { status: 'UNAVAILABLE', message: 'Synthetic 503' } }; }
  };
}
test('failed discovery cannot preempt all generation calls for approved current models', async () => {
  clearGeminiModelState();
  process.env.GEMINI_API_KEY = 'synthetic-discovery-failure-key';
  let discoveryCalls = 0;
  const generated = [];
  globalThis.fetch = async url => {
    const href = String(url);
    if (href.includes('/models?')) { discoveryCalls += 1; return providerUnavailable(); }
    const model = href.match(/models\\/([^:]+):/)?.[1];
    generated.push(model);
    return providerResponse(answer);
  };
  try {
    const res = response();
    await handler(request('203.0.113.241'), res);
    assert.equal(discoveryCalls, 2, 'the existing one-refresh discovery bound remains unchanged');
    assert.equal(res.statusCode, 200);
    assert.deepEqual(generated, ['gemini-3.8-flash'], 'current pinned frontier gets one actual provider probe, not an invented model');
    assert.equal(res.payload.text, answer);
    assert.equal(res.payload.receipt.modelPolicy.providerDiscovery.initial.status, 503);
    assert.equal(res.payload.receipt.modelPolicy.providerDiscovery.refreshed.status, 503);
    assert.equal(res.payload.receipt.modelPolicy.providerDiscovery.initial.ok, false);
    assert.equal(res.payload.receipt.provider.attempts[0].status, 200);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    clearGeminiModelState();
  }
});

test('missing listing permits only approved current seats, never Lite, shutdown or disabled', () => {
  const missing = Object.freeze({ eligible: false, reasons: Object.freeze(['fresh-complete-provider-observation-required']) });
  const invalid = Object.freeze({ eligible: false, reasons: Object.freeze(['documented-shutdown']) });
  const plan = { callableModels: [], rows: [
    { model: 'gemini-3.8-flash', eligibility: missing, metadata: { lifecycle: 'current' } },
    { model: 'gemini-3.5-flash', eligibility: missing, metadata: { lifecycle: 'current' } },
    { model: 'gemini-3.1-flash-lite', eligibility: missing, metadata: { lifecycle: 'current' } },
    { model: 'gemini-3.7-flash', eligibility: invalid, metadata: { lifecycle: 'shutdown' } },
    { model: 'gemini-3.6-flash', eligibility: { eligible: false, reasons: ['fresh-complete-provider-observation-required','specialized-route-required'] }, metadata: { lifecycle: 'current' } }
  ] };
  assert.deepEqual(selectKhonapolitProviderModelsFromPlan(plan), ['gemini-3.8-flash','gemini-3.5-flash']);
});

test('incomplete candidate selection scores actual prose, never repeated marks or cross-seat joins', () => {
  const first = { model: 'gemini-3.8-flash', result: { text: 'A\\u0301'.repeat(200) }, relay: { transcript: 'A\\u0301'.repeat(200) } };
  const second = { model: 'gemini-3.5-flash', result: { text: longerFragment }, relay: { transcript: longerFragment } };
  assert.equal(preferMarrowlineIncompleteReturn(first, second), second);
  assert.equal(preferMarrowlineIncompleteReturn(second, first), second);
  assert.equal(preferMarrowlineIncompleteReturn(second, { result: { text: '' } }), second);
  assert.equal(second.result.text, longerFragment, 'native Unicode and blank lines remain exact');
});

test('when two models produce incomplete text, show the more substantial original return with incomplete receipt', async () => {
  clearGeminiModelState();
  process.env.GEMINI_API_KEY = 'synthetic-longer-incomplete-key';
  const calls = [];
  globalThis.fetch = async url => {
    const href = String(url);
    if (href.includes('/models?')) return {
      ok: true, status: 200,
      async json() { return { models: [
        'gemini-3.8-flash','gemini-3.5-flash','gemini-3.6-flash','gemini-3.7-flash','gemini-3-flash-preview'
      ].map(id => ({ name: `models/${id}`, supportedGenerationMethods: ['generateContent'] })) }; }
    };
    const model = href.match(/models\\/([^:]+):/)?.[1];
    calls.push(model);
    if (model === 'gemini-3.8-flash' && calls.filter(x => x === model).length === 1) return providerResponse(firstFragment, 'MAX_TOKENS');
    if (model === 'gemini-3.5-flash') return providerResponse(longerFragment, 'MAX_TOKENS');
    return providerUnavailable();
  };
  try {
    const res = response();
    await handler(request('203.0.113.242', 'Preserve the longest witnessed prose after bounded recovery.'), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.text, longerFragment);
    assert.equal(res.payload.receipt.provider.model, 'gemini-3.5-flash');
    assert.equal(res.payload.receipt.provider.completion.complete, false);
    assert.equal(res.payload.receipt.status, 'MODEL_RESPONSE_INCOMPLETE');
    assert.equal(calls[0], 'gemini-3.8-flash');
    assert.ok(calls.includes('gemini-3.5-flash'));
    assert.equal(res.payload.receipt.provider.attempts.length <= 6, true);
    assert.equal(res.payload.text.includes(firstFragment), false, 'different model outputs must never be spliced');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    clearGeminiModelState();
  }
});
