// 𝌋 TD613 · Marrowline interactive provider config / D control source-truth check.
// Offline, no network. The live text entrypoint must continue to supply the
// AsyncLocalStorage interactive profile before Gemini request construction.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildInvocationPacket } from '../app/dome-world/khonapolit-covenant.js';
import { buildGeminiRequest } from '../server/khonapolit-quality.js';
import { buildDThinkingContrast } from '../research/marrowline-d-thinking-isolation-20261019/d-thinking-contrast.mjs';
import {
  withGeminiGenerationProfile,
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE
} from '../server/gemini-generation-envelope.js';

test('the actual ordinary text-entry handler retains the Gemini interactive profile wrapper', () => {
  const entry = readFileSync(new URL('../api/khonapolit.js', import.meta.url), 'utf8');
  assert.match(entry, /return withGeminiGenerationProfile\(\s*GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,\s*\(\) => khonapolitHandler\(req, res\)/s);
  // A change in the entrypoint requires this test to be revisited. Callers of
  // buildGeminiRequest outside this wrapper MUST NOT be described as production.
});

test('production-restored 3.8 route uses MEDIUM despite constructor asking HIGH', () => {
  const packet = buildInvocationPacket({
    message: 'A completely fictional investigation of a missing denominator.',
    history: [], mode: 'issued-conjunction', waiveIssuance: true
  });
  assert.equal(packet.canInvoke, true);
  const model = 'gemini-3.8-flash';
  const syntheticUnprofiled = buildGeminiRequest(packet, {}, model, {
    groveTrial: 'historical-20261002-v1'
  });
  const productionProfiled = withGeminiGenerationProfile(
    GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => buildGeminiRequest(packet, {}, model, {
      groveTrial: 'historical-20261002-v1'
    })
  );
  assert.deepEqual(syntheticUnprofiled.generationConfig.thinkingConfig, { thinkingLevel: 'high' });
  assert.deepEqual(productionProfiled.generationConfig.thinkingConfig, { thinkingLevel: 'medium' });
  // Profile can change generation configuration but never the user text or
  // fictional system frame; isolating that avoids a fake prompt confound.
  assert.deepEqual(productionProfiled.contents, syntheticUnprofiled.contents);
  assert.deepEqual(productionProfiled.systemInstruction, syntheticUnprofiled.systemInstruction);
  const { medium: originalD } = buildDThinkingContrast();
  assert.deepEqual(productionProfiled.generationConfig, originalD.generationConfig);
  assert.notDeepEqual(productionProfiled.systemInstruction, originalD.systemInstruction);
  assert.notDeepEqual(productionProfiled.contents, originalD.contents);
});

test('no empirical attribution to thinking level is created by this source-only test', () => {
  const research = readFileSync(
    new URL('../research/marrowline-d-thinking-isolation-20261019/README.md', import.meta.url),
    'utf8'
  );
  assert.match(research, /CORRECTION — entrypoint context/);
  assert.match(research, /MEDIUM vs MEDIUM/);
  assert.match(research, /retired without execution/);
});
