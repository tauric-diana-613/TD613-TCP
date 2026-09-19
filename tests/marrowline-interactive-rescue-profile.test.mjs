import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  buildGeminiGenerationConfig,
  withGeminiGenerationProfile
} from '../server/gemini-generation-envelope.js';

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
  const stable35 = generationConfig('gemini-3.5-flash');

  assert.deepEqual(frontier.thinkingConfig, { thinkingLevel: 'medium' });
  assert.deepEqual(stable37.thinkingConfig, { thinkingLevel: 'medium' });
  assert.deepEqual(stable35.thinkingConfig, { thinkingLevel: 'low' });
});

test('the production Marrowline witness is the exact human MAINFRAME falsifier', () => {
  const canary = fs.readFileSync('scripts/loom-production-canary.mjs', 'utf8');
  assert.ok(canary.includes("message: 'MAINFRAME claims recursive perspectives monotonically increase epistemic depth. Build a counterexample and distinguish recursion from depth without losing the joke.'"));
});
