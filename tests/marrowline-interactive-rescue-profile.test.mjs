import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  buildGeminiGenerationConfig,
  withGeminiGenerationProfile
} from '../server/gemini-generation-envelope.js';
import { callGemini } from '../server/khonapolit-quality.js';

const generationConfig = model => withGeminiGenerationProfile(
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  () => buildGeminiGenerationConfig({
    model,
    maxOutputTokens: 65536,
    reasoning: { level: 'high' }
  })
);

test('Marrowline interactive profile keeps deliberate 3.x reasoning tiers only', () => {
  const frontier = generationConfig('gemini-3.8-flash');
  const stable37 = generationConfig('gemini-3.7-flash');
  const stable36 = generationConfig('gemini-3.6-flash');
  const stable35 = generationConfig('gemini-3.5-flash');
  const preview = generationConfig('gemini-3-flash-preview');

  assert.deepEqual(frontier.thinkingConfig, { thinkingLevel: 'medium' });
  assert.deepEqual(stable37.thinkingConfig, { thinkingLevel: 'low' });
  assert.deepEqual(stable36.thinkingConfig, { thinkingLevel: 'low' });
  assert.deepEqual(stable35.thinkingConfig, { thinkingLevel: 'minimal' });
  assert.deepEqual(preview.thinkingConfig, { thinkingLevel: 'low' });
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
            content: { parts: [{ text: '<<<PACKET_A_FORMAL_AUDIT>>>\\nKʰonapolit\\nA counterexample begins.' }] }
          }]
        },
        {
          candidates: [{
            finishReason: 'STOP',
            content: { parts: [{ text: '\\n<<<PACKET_A_END>>>\\n<<<PACKET_B_STRESS_TELEMETRY>>>\\nTauric Diana bots\\nFERAL STACK\\n<<<PACKET_B_END>>>' }] }
          }],
          usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 80, totalTokenCount: 200 }
        }
      ];
      const body = new ReadableStream({
        start(controller) {
          for (const event of events) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\\n\\n`));
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
    assert.equal(
      result.text,
      '<<<PACKET_A_FORMAL_AUDIT>>>\\nKʰonapolit\\nA counterexample begins.\\n<<<PACKET_A_END>>>\\n<<<PACKET_B_STRESS_TELEMETRY>>>\\nTauric Diana bots\\nFERAL STACK\\n<<<PACKET_B_END>>>'
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});
