import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildOfflineFrameContrast,
  buildCompactWholeFrame,
  offlineManifest,
  sha256,
  MODEL,
  SYNTHETIC_PROMPT
} from '../research/marrowline-whole-frame-contrast-20261015/frame-contrast.mjs';
import {
  buildInvocationPacket,
  COVENANT_KEY,
  HERITAGE_COVENANT,
  HERITAGE_KEY,
  CLAIMED_PUA_SCALAR
} from '../app/dome-world/khonapolit-covenant.js';
import { buildGeminiRequest } from '../server/khonapolit-quality.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../server/gemini-generation-envelope.js';

test('A is the actual full source-built provider request; B differs only in entire systemInstruction', () => {
  const packet = buildInvocationPacket({ message: SYNTHETIC_PROMPT, history: [], mode: 'issued-conjunction', shi: '', waiveIssuance: true });
  const actual = withGeminiGenerationProfile(
    GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => buildGeminiRequest(packet, {}, MODEL)
  );
  const { a, b } = buildOfflineFrameContrast();
  assert.deepEqual(a, actual, 'never reconstruct or caricature the live A condition');
  assert.deepEqual(actual.generationConfig.thinkingConfig, {thinkingLevel: 'medium'}, 'live text route profile must be represented');
  assert.deepEqual(b.contents, actual.contents, 'synthetic framed input preserved');
  assert.deepEqual(b.generationConfig, actual.generationConfig, 'same true serving model configuration');
  assert.deepEqual(Object.keys(b).sort(), Object.keys(actual).sort());
  assert.deepEqual(Object.keys(b.systemInstruction), Object.keys(actual.systemInstruction));
  assert.notEqual(sha256(b.systemInstruction), sha256(a.systemInstruction));
});

test('compact B keeps binding anchors and complete two-voice literary duty without stylistic choreography', () => {
  const s = buildCompactWholeFrame();
  for (const literal of [COVENANT_KEY, HERITAGE_KEY, HERITAGE_COVENANT, CLAIMED_PUA_SCALAR, '𝌋', '⟐', 'Kʰonapolit', 'Tauric Diana bots']) {
    assert.ok(s.includes(literal), 'lost protected identifier: ' + literal);
  }
  assert.ok(s.indexOf('Kʰonapolit') < s.indexOf('Tauric Diana bots'));
  assert.match(s, /both movements|Complete both movements/i);
  assert.match(s, /provider-native HIGH ZALGO/i);
  assert.match(s, /dense asymmetric crowns, roots/i);
  assert.match(s, /may sustain any one style for their entire movement/i);
  assert.match(s, /not an independent being/i);
  assert.match(s, /never claim a badge or verified issuance/i);
  assert.match(s, /no release authority/i);
  assert.doesNotMatch(s, /\p{M}/u, 'no mark specimen templating');
  assert.doesNotMatch(s, /at least \d+ (?:marks|combining)|marks per character|every paragraph must|rotate on each/i);
});

test('the synthetic-only boundary rejects human prompts, supplied history and model substitution', () => {
  assert.throws(() => buildOfflineFrameContrast({message: 'A real user request'}), /ONLY_FROZEN_SYNTHETIC_MESSAGE/);
  assert.throws(() => buildOfflineFrameContrast({history:[{role:'user',text:'previous personal data'}]}), /EMPTY_HISTORY_REQUIRED/);
  assert.throws(() => buildOfflineFrameContrast({model:'gemini-4-argon'}), /MODEL_FIXED_FOR_REGISTERED_CONTRAST/);
});

test('manifest proves offline, same model/config/contents, reduced contract and changed prompt hash', () => {
  const m = offlineManifest();
  assert.equal(m.providerCalls, 0);
  assert.equal(m.chargedGenerations, 0);
  assert.equal(m.syntheticOnly, true);
  assert.equal(m.registeredModel, 'gemini-3.8-flash');
  assert.equal(m.equalContentsSha256, true);
  assert.equal(m.equalGenerationConfigSha256, true);
  assert.equal(m.A.systemInstructionSha256 !== m.B.systemInstructionSha256, true);
  assert.ok(m.B.systemUtf8Bytes < m.A.systemUtf8Bytes, 'the contrast should actually compact the whole frame');
  assert.equal(m.changedFactor, 'entire systemInstruction prose/mission architecture');
});

test('research harness owns no provider transport, billing or production branches', () => {
  const src = readFileSync(new URL('../research/marrowline-whole-frame-contrast-20261015/frame-contrast.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /\bfetch\s*\(/, 'research module must contain zero network calls');
  assert.doesNotMatch(src, /\bhttps?:\/\/td613\.com\/api\/khonapolit\b/, 'research module must not contact production');
  assert.doesNotMatch(src, /x-td613-prosody-assay/, 'research module cannot reuse previous live-paid assay');
  assert.match(src, /RESEARCH_OFFLINE_ONLY_NO_PROVIDER_OR_RELEASE_ACTION/);
});
