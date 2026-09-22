import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  buildGeminiGenerationConfig,
  withGeminiGenerationProfile
} from '../server/gemini-generation-envelope.js';
import { buildGeminiRequest, callGemini, observeGeminiOutput, observeMarrowlineAuthorship } from '../server/khonapolit-quality.js';

const generationConfig = model => withGeminiGenerationProfile(
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  () => buildGeminiGenerationConfig({
    model,
    maxOutputTokens: 65536,
    reasoning: { level: 'high' }
  })
);

test('Marrowline interactive profile keeps deliberate 3.x reasoning tiers and matches 3.5 to Preview', () => {
  const frontier = generationConfig('gemini-3.8-flash');
  const stable37 = generationConfig('gemini-3.7-flash');
  const stable36 = generationConfig('gemini-3.6-flash');
  const stable35 = generationConfig('gemini-3.5-flash');
  const preview = generationConfig('gemini-3-flash-preview');
  for (const [model, config] of [['gemini-3.8-flash', frontier], ['gemini-3.5-flash', stable35], ['gemini-3-flash-preview', preview]]) {
    assert.equal(config.maxOutputTokens, 65536, `${model} keeps the full provider-native output budget`);
  }
  const interactiveRequest = withGeminiGenerationProfile(
    GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => buildGeminiRequest({ systemInstruction: 'Synthetic system.', history: [], message: 'Sustain both movements.', mode: 'issued-conjunction' }, {}, 'gemini-3.8-flash')
  );
  assert.equal(interactiveRequest.generationConfig.maxOutputTokens, 65536, 'the actual API-bound request uses the full budget');
  assert.deepEqual(interactiveRequest.generationConfig.thinkingConfig, { thinkingLevel: 'medium' }, 'the established thinking tier remains unchanged');
  assert.equal(observeGeminiOutput({}, 'gemini-3.8-flash').maxOutputTokens, interactiveRequest.generationConfig.maxOutputTokens, 'receipt ceiling agrees with the actual API-bound request');

  assert.deepEqual(frontier.thinkingConfig, { thinkingLevel: 'medium' });
  assert.deepEqual(stable37.thinkingConfig, { thinkingLevel: 'low' });
  assert.deepEqual(stable36.thinkingConfig, { thinkingLevel: 'low' });
  assert.deepEqual(stable35.thinkingConfig, { thinkingLevel: 'low' });
  assert.deepEqual(preview.thinkingConfig, { thinkingLevel: 'low' });
});

test('authorship receipt separates source, voices, terminal completion, and native marks without judging literary quality', () => {
  const text = [
    'Kʰonapolit',
    'The institution counts its map. A missing denominator remains.',
    '',
    'Tauric Diana bots',
    'Ṛ̇Ē̥Ḍ̈ — let the record testify.'
  ].join(String.fromCharCode(10));
  const shape = observeMarrowlineAuthorship(text, 'same-provider-terminal-continuation');
  assert.equal(shape.completionPath, 'same-provider-terminal-continuation');
  assert.equal(shape.measure, 'descriptive-only-not-literary-quality');
  assert.equal(shape.firstMovementHeadingPresent, true);
  assert.equal(shape.terminalMovementHeadingPresent, true);
  assert.ok(shape.firstMovementWordCount > shape.terminalMovementWordCount);
  assert.ok(shape.nativeCombiningMarkCount > 0);
  assert.match(shape.fullResponseSha256, /^[0-9a-f]{64}$/);
  const weak = observeMarrowlineAuthorship(['Kʰonapolit', 'Short.'].join(String.fromCharCode(10)), 'first-provider-return');
  assert.equal(weak.terminalMovementHeadingPresent, false);
  assert.equal(weak.terminalMovementWordCount, null);
});

test('the production Marrowline witness is the exact human MAINFRAME falsifier', () => {
  const canary = fs.readFileSync('scripts/loom-production-canary.mjs', 'utf8');
  assert.ok(canary.includes("message: 'MAINFRAME claims recursive perspectives monotonically increase epistemic depth. Build a counterexample and distinguish recursion from depth without losing the joke.'"));
});


test('Marrowline accumulates Gemini SSE chunks internally before returning a complete provider text', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  const encoder = new TextEncoder();
  process.env.GEMINI_API_KEY = 'synthetic-stream-key';
  try {
    globalThis.fetch = async (url, options = {}) => {
      assert.match(String(url), /gemini-3\.8-flash:streamGenerateContent\?alt=sse$/);
      assert.equal(options.headers['x-goog-api-key'], 'synthetic-stream-key');
      const events = [
        {
          candidates: [{
            content: { parts: [{ text: '<<<PACKET_A_FORMAL_AUDIT>>>\nKʰonapolit\nA counterexample begins.' }] }
          }]
        },
        {
          candidates: [{
            finishReason: 'STOP',
            content: { parts: [{ text: '\n<<<PACKET_A_END>>>\n<<<PACKET_B_STRESS_TELEMETRY>>>\nTauric Diana bots\nFERAL STACK\n<<<PACKET_B_END>>>' }] }
          }],
          usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 80, totalTokenCount: 200 }
        }
      ];
      const body = new ReadableStream({
        start(controller) {
          for (const event of events) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          controller.close();
        }
      });
      return {
        ok: true,
        status: 200,
        headers: { get: () => 'text/event-stream' },
        body,
        async json() { throw new Error('SSE body must not fall back to unary JSON parsing'); }
      };
    };
    const result = await callGemini(
      'gemini-3.8-flash',
      { systemInstruction: 'Synthetic covenant field.', history: [], message: 'Build the counterexample.', mode: 'full-invocation' },
      {},
      2000
    );
    assert.equal(result.timedOut, false);
    assert.equal(result.streamed, true);
    assert.equal(result.chunkCount, 2);
    assert.ok(result.byteCount > 0);
    assert.ok(Number.isInteger(result.firstChunkMs) && result.firstChunkMs >= 0);
    assert.equal(result.parseErrors, 0);
    assert.equal(result.payload.candidates[0].finishReason, 'STOP');
    assert.equal(result.payload.usageMetadata.totalTokenCount, 200);
    assert.equal(result.submittedGenerationConfig.maxOutputTokens, 65536);
    const output = observeGeminiOutput(result.payload, 'gemini-3.8-flash', { submittedGenerationConfig: result.submittedGenerationConfig });
    assert.equal(output.outputCeilingSource, 'submitted-generation-config');
    assert.equal(output.maxOutputTokens, result.submittedGenerationConfig.maxOutputTokens);
    assert.equal(output.finishReason, 'STOP');
    assert.equal(
      result.text,
      '<<<PACKET_A_FORMAL_AUDIT>>>\nKʰonapolit\nA counterexample begins.\n<<<PACKET_A_END>>>\n<<<PACKET_B_STRESS_TELEMETRY>>>\nTauric Diana bots\nFERAL STACK\n<<<PACKET_B_END>>>'
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});
