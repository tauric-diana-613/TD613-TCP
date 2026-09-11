import assert from 'node:assert/strict';
import {
  GEMINI25_HIGH_THINKING_BUDGET,
  GEMINI_GENERATION_ENVELOPE_VERSION,
  buildGeminiGenerationConfig,
  describeGeminiGenerationEnvelope,
  geminiGeneration,
  geminiThinkingConfig
} from '../server/gemini-generation-envelope.js';

assert.equal(GEMINI_GENERATION_ENVELOPE_VERSION, 'td613.gemini-generation-envelope/v0.1-20260911');
assert.equal(GEMINI25_HIGH_THINKING_BUDGET, 24576);
assert.equal(geminiGeneration('models/gemini-3.8-flash'), '3');
assert.equal(geminiGeneration('gemini-2.5-flash'), '2.5');
assert.equal(geminiGeneration('synthetic-model'), 'unknown');

const schema = { type: 'OBJECT', properties: { answer: { type: 'STRING' } } };
const g3 = buildGeminiGenerationConfig({
  model: 'gemini-3.8-flash',
  maxOutputTokens: 65536,
  sampling: { temperature: 0.22, topP: 0.64, topK: 40 },
  reasoning: { level: 'high', budget: 24576 },
  responseMimeType: 'application/json',
  responseSchema: schema
});
assert.equal(g3.maxOutputTokens, 65536);
assert.equal(g3.responseMimeType, 'application/json');
assert.deepEqual(g3.responseSchema, schema);
assert.deepEqual(g3.thinkingConfig, { thinkingLevel: 'high' });
for (const key of ['temperature', 'topP', 'topK']) assert.equal(Object.hasOwn(g3, key), false);

const g25 = buildGeminiGenerationConfig({
  model: 'gemini-2.5-flash',
  maxOutputTokens: 65536,
  sampling: { temperature: 0.22, topP: 0.64, topK: 40 },
  reasoning: { level: 'high', budget: 24576 },
  responseMimeType: 'application/json',
  responseSchema: schema
});
assert.equal(g25.temperature, 0.22);
assert.equal(g25.topP, 0.64);
assert.equal(g25.topK, 40);
assert.deepEqual(g25.thinkingConfig, { thinkingBudget: 24576 });
assert.equal(Object.hasOwn(g25.thinkingConfig, 'thinkingLevel'), false);

const unknown = buildGeminiGenerationConfig({
  model: 'synthetic-model',
  maxOutputTokens: 4096,
  sampling: { temperature: 0.7, topP: 0.9, topK: 40 },
  reasoning: { level: 'high', budget: 24576 }
});
assert.equal(unknown.temperature, 0.7);
assert.equal(unknown.topP, 0.9);
assert.equal(unknown.topK, 40);
assert.equal(Object.hasOwn(unknown, 'thinkingConfig'), false);

assert.deepEqual(geminiThinkingConfig('gemini-3.5-flash', { enabled: true, level: 'high' }), { thinkingLevel: 'high' });
assert.deepEqual(geminiThinkingConfig('gemini-2.5-flash', { enabled: true, budget: 999999 }), { thinkingBudget: 24576 });
assert.deepEqual(describeGeminiGenerationEnvelope('gemini-3.8-flash', { reasoning: { level: 'high' } }), {
  version: GEMINI_GENERATION_ENVELOPE_VERSION,
  model: 'gemini-3.8-flash',
  generation: '3',
  sampling: 'provider-default',
  thinking: { thinkingLevel: 'high' }
});

console.log('gemini-generation-envelope.test.mjs passed');
