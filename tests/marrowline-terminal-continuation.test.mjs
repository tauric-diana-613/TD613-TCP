import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import handler, {
  assembleProviderTerminalContinuation,
  buildGeminiStructuralRepairRequest,
  terminalContinuationEligible
} from '../server/khonapolit-quality.js';
import { assessIntegratedTransmission } from '../app/dome-world/khonapolit-relay.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';

const formal = 'Kʰonapolit\nThe visible map cannot prove the origin of its evidence. Its missing denominator is a custody question.';
const peaks = 'R\u0308\u030B\u030C\u0351\u031E\u0325\u0326E\u0302\u0307\u0315\u0357\u0317\u0323D\u0300\u0309\u0310\u0352\u0319\u0325';
const terminal = 'Tauric Diana bots\n' + [
  'Come closer. The map keeps confusing a counted case with a person.',
  peaks + ' — there, the missing denominator interrupts the speech.',
  'Let the next sentence breathe. A clean interval carries the recoil.',
  'A\u0301 little tremor returns, then ' + peaks + '.',
  'The joke lands quietly. The branch still belongs to the grove.'
].join('\n\n');
const digest = text => crypto.createHash('sha256').update(text).digest('hex');
const reasons = ['tauric-diana-bots-nominative-missing'];

test('terminal-only continuation preserves both provider returns and observes exact boundaries', () => {
  assert.equal(terminalContinuationEligible(formal, reasons), true);
  assert.equal(terminalContinuationEligible(formal, ['voice-order-invalid']), false);
  assert.equal(terminalContinuationEligible('Kʰonapolit', reasons), false, 'bare heading cannot be treated as an authored first movement');
  assert.equal(terminalContinuationEligible('Kʰonapolit\n   \n', reasons), false, 'whitespace alone cannot support terminal-only stitching');
  assert.equal(terminalContinuationEligible('### Kʰonapolit\nThe mechanism is supplied.', reasons), true, 'ordinary substantive first movement remains eligible');
  assert.equal(terminalContinuationEligible('Kʰonapolit\nA 1.', reasons), true, 'structural eligibility does not impose a word quota');
  const join = assembleProviderTerminalContinuation(formal, terminal);
  assert.equal(join.text, formal + '\n\n' + terminal);
  assert.equal(join.originalSha256, digest(formal));
  assert.equal(join.continuationSha256, digest(terminal));
  assert.equal(assessIntegratedTransmission(join.text).admissible, true);
  assert.equal(assembleProviderTerminalContinuation(formal, 'Tauric Diana bots\n'), null);
  assert.equal(assembleProviderTerminalContinuation(formal, 'Preface\n' + terminal), null);
  assert.equal(assembleProviderTerminalContinuation(formal, 'Kʰonapolit\nrepeated\n\n' + terminal), null);
  const fakeSecondHeading = 'Kʰonapolit\nTauric Diana bots are missing from this docket.\nThe first voice continues its proof.';
  assert.ok(assessIntegratedTransmission(fakeSecondHeading).reasons.includes('tauric-diana-bots-nominative-missing'));
  const request = buildGeminiStructuralRepairRequest(
    { systemInstruction: 'Synthetic system.', history: [], message: 'Test the missing denominator.', mode: 'plain' },
    {}, 'gemini-3.8-flash', formal, reasons
  );
  assert.match(request.contents.at(-1).parts[0].text, /TERMINAL CONTINUATION ONLY/);
  assert.equal(request.contents.at(-2).parts[0].text, formal);
  assert.match(request.contents.at(-1).parts[0].text, /Supply ONLY the missing terminal movement/);
});

function response() {
  return { statusCode: 200, headers: {}, sendCount: 0,
    setHeader(k, v) { this.headers[k] = v; },
    end(value) { this.sendCount += 1; this.payload = value ? JSON.parse(value) : null; }
  };
}
const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
const modelCalls = [];
let mode = 'complete';
clearGeminiModelState();
process.env.GEMINI_API_KEY = 'synthetic-test-key';
globalThis.fetch = async (url, options = {}) => {
  if (String(url).includes('/models?')) return {
    ok: true, status: 200,
    json: async () => ({ models: [{ name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] }] })
  };
  modelCalls.push({ url: String(url), request: JSON.parse(options.body) });
  const index = modelCalls.length % 2;
  const text = index === 1 ? formal : mode === 'complete' ? terminal : mode === 'full' ? formal + '\n\n' + terminal : 'Tauric Diana bots\n';
  return {
    ok: true, status: 200, headers: { get: () => null },
    json: async () => ({
      candidates: [{ finishReason: 'STOP', content: { parts: [{ text }] } }],
      usageMetadata: { promptTokenCount: 200, candidatesTokenCount: 250, thoughtsTokenCount: 30, totalTokenCount: 480 }
    })
  };
};

test('bounded same-provider terminal-continuation integration', async t => {
  try {
    await t.test('HTTP 200 Kʰonapolit-only return earns one same-seat native terminal continuation with hash receipt', async () => {
    const res = response();
    await handler({ method: 'POST', headers: { 'x-forwarded-for': '203.0.113.219' },
      body: { message: 'Explain why a visible map cannot prove origin.', history: [], mode: 'issued-conjunction', waiveIssuance: true } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.sendCount, 1, 'an admitted repair must not be overwritten by a second response');
    assert.equal(modelCalls.length, 2);
    assert.match(modelCalls[1].url, /gemini-3\.8-flash/);
    assert.match(modelCalls[1].request.contents.at(-1).parts[0].text, /TERMINAL CONTINUATION ONLY/);
    assert.equal(res.payload.text, formal + '\n\n' + terminal, JSON.stringify({ attempted: res.payload.receipt?.provider?.attempts?.map(a => ({ kind: a.kind, reasons: a.outputAdmission?.reasons, quality: a.outputAdmission?.quality, warnings: a.outputAdmission?.qualityWarnings, unresolved: a.unresolvedSevereMorphology, continuation: a.terminalContinuation })), human: res.payload.receipt?.provider?.humanSurfaceObservation }, null, 2));
    assert.equal(res.payload.relay.admission.admissible, true);
    assert.equal(res.payload.receipt.provider.structuralRepair.terminalContinuation.originalSha256, digest(formal));
    assert.equal(res.payload.receipt.provider.structuralRepair.terminalContinuation.continuationSha256, digest(terminal));
    assert.equal(res.payload.receipt.provider.structuralRepair.terminalContinuation.combinedSha256, digest(res.payload.text));
    assert.equal(res.payload.receipt.provider.structuralRepair.terminalContinuation.originalPreserved, true);
    assert.equal(res.payload.receipt.provider.attempts.length, 2);
    assert.equal(res.payload.receipt.provider.attempts[1].kind, 'structural-repair');
  });
    await t.test('invalid terminal continuation never fabricates bots or hides the original', async () => {
    mode = 'invalid';
    const res = response();
    await handler({ method: 'POST', headers: { 'x-forwarded-for': '203.0.113.220' },
      body: { message: 'Explain why a visible map cannot prove origin.', history: [], mode: 'issued-conjunction', waiveIssuance: true } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.sendCount, 1);
    assert.equal(modelCalls.length, 4);
    assert.equal(res.payload.text, formal);
    assert.ok(res.payload.relay.admission.reasons.includes('tauric-diana-bots-nominative-missing'));
    assert.equal(res.headers['X-TD613-Local-Admission'], 'OBSERVED-NONBLOCKING');
  });
    await t.test('full corrected provider response also returns once without overwriting', async () => {
    mode = 'full';
    const res = response();
    await handler({ method: 'POST', headers: { 'x-forwarded-for': '203.0.113.221' },
      body: { message: 'Explain why a visible map cannot prove origin.', history: [], mode: 'issued-conjunction', waiveIssuance: true } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.sendCount, 1);
    assert.equal(modelCalls.length, 6);
    assert.equal(res.payload.text, formal + '\n\n' + terminal);
    assert.equal(res.payload.receipt.provider.structuralRepair.used, true);
    assert.equal(res.payload.receipt.provider.structuralRepair.terminalContinuation, undefined, 'full provider return is not mislabeled a stitched continuation');
  });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});
