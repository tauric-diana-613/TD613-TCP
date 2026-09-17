import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  KHONAPOLIT_INTERACTIVE_GEMINI25_THINKING_BUDGET,
  buildGeminiGenerationConfig,
  withGeminiGenerationProfile
} from '../server/gemini-generation-envelope.js';

const generationConfig = model => withGeminiGenerationProfile(
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  () => buildGeminiGenerationConfig({
    model,
    maxOutputTokens: 65536,
    reasoning: { level: 'high', budget: 24576 }
  })
);

test('Marrowline keeps one deliberate frontier attempt and cheap stable rescue lanes', () => {
  const frontier = generationConfig('gemini-3.8-flash');
  const stable35 = generationConfig('gemini-3.5-flash');
  const compatibility25 = generationConfig('gemini-2.5-flash');

  assert.deepEqual(frontier.thinkingConfig, { thinkingLevel: 'medium' });
  assert.deepEqual(stable35.thinkingConfig, { thinkingLevel: 'low' });
  assert.equal(KHONAPOLIT_INTERACTIVE_GEMINI25_THINKING_BUDGET, 1024);
  assert.deepEqual(compatibility25.thinkingConfig, { thinkingBudget: 1024 });
});

test('the production Marrowline witness is the operator-reported Latin regression prompt', () => {
  const canary = fs.readFileSync('scripts/loom-production-canary.mjs', 'utf8');
  assert.match(canary, /message:\s*'Quis custodiet ipsos custodes\?'/);
});
