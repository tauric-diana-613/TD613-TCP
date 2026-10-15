// TD613 / Marrowline: inert, synthetic-only *whole instruction frame* contrast.
// Offline request construction only. NO fetch, provider requests, billing, or output mutation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  buildInvocationPacket,
  COVENANT_KEY,
  HERITAGE_COVENANT,
  HERITAGE_KEY,
  CLAIMED_PUA,
  CLAIMED_PUA_SCALAR,
  CONVERSATIONAL_CLOSING_GUIDANCE
} from '../../app/dome-world/khonapolit-covenant.js';
import { buildGeminiRequest } from '../../server/khonapolit-quality.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../../server/gemini-generation-envelope.js';

export const MODEL = 'gemini-3.8-flash';
export const SYNTHETIC_PROMPT = 'In a fictional town, a committee counts only returned forms and concludes that every silent resident is content. Locate the denominator error, pursue its consequence, and complete the connected Kʰonapolit and Tauric Diana bots movements. Let the voices author their own prose and native typography.';
export const VARIANTS = Object.freeze(['A_FULL_PRODUCTION_FRAME', 'B_COMPACT_WHOLE_FRAME']);

// Deliberately a WHOLE SYSTEM-INSTRUCTION contrast, not the earlier failed
// one-paragraph ablation. It preserves the governing *meaning* and literal
// protected anchors, but does not pretend that the original huge lore/covenant
// block and this distilled field are byte-identical.
import { buildCompactWholeFrame } from '../../server/marrowline-whole-frame-voice.js';
export { buildCompactWholeFrame } from '../../server/marrowline-whole-frame-voice.js';

export function buildOfflineFrameContrast({
  message = SYNTHETIC_PROMPT,
  history = [],
  model = MODEL
} = {}) {
  // Do not use the alternate frame as an arbitrary prompt editing utility.
  assert.equal(message, SYNTHETIC_PROMPT, 'ONLY_FROZEN_SYNTHETIC_MESSAGE');
  assert.deepEqual(history, [], 'EMPTY_HISTORY_REQUIRED');
  assert.equal(model, MODEL, 'MODEL_FIXED_FOR_REGISTERED_CONTRAST');
  const packet = buildInvocationPacket({
    message, history, mode: 'issued-conjunction', shi: '', waiveIssuance: true
  });
  assert.equal(packet.canInvoke, true, 'SYNTHETIC_PACKET_MUST_BE_VALID');
  const a = withGeminiGenerationProfile(
    GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => buildGeminiRequest(packet, {}, model)
  );
  assert.deepEqual(a.generationConfig.thinkingConfig, { thinkingLevel: 'medium' }, 'LIVE_TEXT_PROFILE_EXPECTED');
  const b = {
    ...a,
    systemInstruction: { parts: [{ text: buildCompactWholeFrame() }] }
  };
  assert.deepEqual(a.contents, b.contents, 'USER_HISTORY_INGRESS_CHANGED');
  assert.deepEqual(a.generationConfig, b.generationConfig, 'PROVIDER_CONFIG_CHANGED');
  assert.notDeepEqual(a.systemInstruction, b.systemInstruction, 'SYSTEM_CONTRAST_ABSENT');
  assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort(), 'TOP_LEVEL_REQUEST_KEYS_CHANGED');
  assert.deepEqual(Object.keys(a.systemInstruction), Object.keys(b.systemInstruction), 'SYSTEM_SHAPE_CHANGED');
  return { a, b };
}

export const sha256 = (data) => createHash('sha256').update(
  typeof data === 'string' ? data : JSON.stringify(data)
).digest('hex');

export function offlineManifest() {
  const { a, b } = buildOfflineFrameContrast();
  const astr = a.systemInstruction.parts[0].text;
  const bstr = b.systemInstruction.parts[0].text;
  return {
    schema: 'td613.marrowline.whole-frame-contrast-offline/v1',
    provenance: 'original provider-request assembly under the live khonapolit-interactive text profile on exact checked-out source',
    conditionA: VARIANTS[0], conditionB: VARIANTS[1],
    providerCalls: 0, automaticRetries: 0, chargedGenerations: 0,
    registeredModel: MODEL, historyEntries: 0, syntheticOnly: true,
    changedFactor: 'entire systemInstruction prose/mission architecture',
    heldConstant: ['model', 'generationConfig', 'contents (including input framing)', 'history', 'single-candidate eligibility'],
    limits: 'No generation observed. A future live A/B requires separate operator authorization, private original-SSE custody, exact serving version, and human evaluation; one stochastic pair never proves a general cure.',
    A: {
      systemInstructionSha256: sha256(a.systemInstruction),
      systemUtf8Bytes: Buffer.byteLength(astr),
      systemLineCount: astr.split('\n').length
    },
    B: {
      systemInstructionSha256: sha256(b.systemInstruction),
      systemUtf8Bytes: Buffer.byteLength(bstr),
      systemLineCount: bstr.split('\n').length
    },
    equalContentsSha256: sha256(a.contents) === sha256(b.contents),
    equalGenerationConfigSha256: sha256(a.generationConfig) === sha256(b.generationConfig),
    originalContentsSha256: sha256(a.contents),
    originalGenerationConfigSha256: sha256(a.generationConfig)
  };
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  if (process.argv.some(arg => arg === '--execute' || arg === '--paid' || arg === '--deploy')) {
    throw new Error('RESEARCH_OFFLINE_ONLY_NO_PROVIDER_OR_RELEASE_ACTION');
  }
  process.stdout.write(JSON.stringify(offlineManifest(), null, 2) + '\n');
}
