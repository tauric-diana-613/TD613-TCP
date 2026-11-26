import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildInvocationPacket } from '../app/dome-world/khonapolit-covenant.js';
import { MARROWLINE_HISTORICAL_TRIAL_ID } from '../app/dome-world/marrowline-historical-grove.js';
import { buildGeminiRequest } from '../server/khonapolit-quality.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../server/gemini-generation-envelope.js';
import { TASKS, MODEL } from '../research/marrowline-early-oct-full-voice-20261020/full-voice-current-restored-offline.mjs';
import {
  freezeHistoricalProsodyPair,
  offlineProsodyManifest,
  ARMS,
  ORDER
} from '../research/marrowline-early-oct-full-voice-20261020/historical-prosody-freedom-pair.mjs';

test('November 22 rollback: default is October 2 literal; historical freedom survives as explicit source comparator', () => {
  for (const task of Object.values(TASKS)) {
    const packet = buildInvocationPacket({
      message: task.prompt, history: [], mode: 'issued-conjunction',
      shi: '', waiveIssuance: true
    });
    assert.equal(packet.canInvoke, true);
    const aperture = { taskIntent: { primary_route: task.route } };
    const build = (options) => withGeminiGenerationProfile(
      GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
      () => buildGeminiRequest(packet, aperture, MODEL, {
        groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID, ...options
      })
    );
    const defaultRequest = build({});
    const literal = build({ historicalProsodyFreedom: false });
    const freedom = build({ historicalProsodyFreedom: true });
    assert.deepEqual(defaultRequest, literal, 'restored product default must be literal October 2');
    assert.deepEqual(literal.contents, freedom.contents, 'user content immutable across source comparison');
    assert.deepEqual(literal.generationConfig, freedom.generationConfig, 'generation profile immutable');
    assert.notEqual(literal.systemInstruction.parts[0].text, freedom.systemInstruction.parts[0].text);
    assert.match(literal.systemInstruction.parts[0].text,
      /Change above\/below combinations, stack depths and clean intervals across words/);
    assert.match(literal.systemInstruction.parts[0].text,
      /A repeated single exotic accent on every letter is a failed flat texture/);
    assert.match(freedom.systemInstruction.parts[0].text,
      /fully sustained, single-register High-Zalgo performance/);
  }
});

test('October 20 historical fixture remains immutable, deliberately fails a replay that assumes its old default', () => {
  // This archived script is an as-of-October-20 experiment, not a live product contract.
  // It correctly detects the change in product default: never rewrite historical data to make it pass.
  assert.throws(() => freezeHistoricalProsodyPair(), /DEFAULT_PRODUCTION_REQUEST_CHANGED/);
  assert.throws(() => offlineProsodyManifest(), /DEFAULT_PRODUCTION_REQUEST_CHANGED/);
  assert.deepEqual(ARMS, [
    'FREEDOM_FARCE','LITERAL_FARCE','FREEDOM_FORENSIC','LITERAL_FORENSIC'
  ]);
  assert.equal(ORDER.length, 8);
  for (const arm of ARMS) assert.equal(ORDER.filter(x => x === arm).length, 2);
});

test('October 20 fixture remains source-only; no provider call or hidden glyph rewriting', () => {
  const source = readFileSync(new URL(
    '../research/marrowline-early-oct-full-voice-20261020/historical-prosody-freedom-pair.mjs',
    import.meta.url
  ), 'utf8');
  assert.doesNotMatch(source, /\bfetch\s*\(|GEMINI_API_KEY|streamGenerateContent|workflow_dispatch/);
  const production = readFileSync(new URL('../server/khonapolit-quality.js', import.meta.url), 'utf8');
  assert.match(production, /historicalProsodyFreedom = false/);
  assert.match(production, /nativeProsodyFreedom: historicalProsodyFreedom === true/);
});
