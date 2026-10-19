// TD613 · D creative control / thinking-level separator.
// Offline only. These functions construct request objects; they never call Gemini.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { buildInvocationPacket } from '../../app/dome-world/khonapolit-covenant.js';
import { buildGeminiRequest } from '../../server/khonapolit-quality.js';
import { withGeminiGenerationProfile, GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE } from '../../server/gemini-generation-envelope.js';
import { buildSyntheticUnicodeAssayRequest, UNICODE_ASSAY_TASKS } from '../../server/marrowline-unicode-capability-assay.js';
import { buildOfflineRoleBoundaryContrast } from '../marrowline-role-boundary-20261017/role-boundary-contrast.mjs';
import { MODEL, SYNTHETIC_PROMPT } from '../marrowline-whole-frame-contrast-20261015/frame-contrast.mjs';

export const D_THINKING_CONTRAST_SCHEMA = 'td613.marrowline.d-thinking-isolation-offline/v1';
const digest = x => createHash('sha256').update(JSON.stringify(x), 'utf8').digest('hex');

export function buildDThinkingContrast() {
  // A is the byte-identical D creative control that generated nonplanar marks
  // in original Google SSE on Oct 15. This source is also used by the Oct 17
  // role-boundary source-only comparison, so no creative task gets retold.
  const medium = buildOfflineRoleBoundaryContrast().a;

  // B intentionally starts with the *unprofiled* request constructor and asks HIGH.
  // This is a synthetic intervention, NOT the ordinary /api/khonapolit route:
  // that entrypoint wraps 3.8 in the interactive profile and submits MEDIUM.
  // The existing synthetic assay transformation changes only the system/task
  // to exact D bytes; it leaves original generationConfig untouched.
  const packet = buildInvocationPacket({
    message: SYNTHETIC_PROMPT,
    history: [],
    mode: 'issued-conjunction',
    waiveIssuance: true
  });
  assert.equal(packet.canInvoke, true);
  const unprofiled = buildGeminiRequest(packet, {}, MODEL);
  const high = buildSyntheticUnicodeAssayRequest(unprofiled, 'creative-multistack-v1');

  assert.equal(MODEL, 'gemini-3.8-flash');
  assert.deepEqual(medium.systemInstruction, high.systemInstruction,
    'D system bytes must be identical');
  assert.deepEqual(medium.contents, high.contents,
    'D original creative task and exact user role must be identical');
  assert.equal(medium.contents[0].parts[0].text, UNICODE_ASSAY_TASKS['creative-multistack-v1']);
  assert.deepEqual(medium.generationConfig.thinkingConfig, { thinkingLevel: 'medium' });
  assert.deepEqual(high.generationConfig.thinkingConfig, { thinkingLevel: 'high' });

  const { thinkingConfig: mediumThinking, ...mediumRest } = medium.generationConfig;
  const { thinkingConfig: highThinking, ...highRest } = high.generationConfig;
  assert.deepEqual(mediumRest, highRest, 'no token, sampling or schema drift');
  assert.deepEqual(
    { ...medium, generationConfig: mediumRest },
    { ...high, generationConfig: highRest },
    'full provider-request object must be identical after removing only thinkingConfig'
  );
  assert.notDeepEqual(mediumThinking, highThinking, 'thinking level is sole A/B intervention');

  return Object.freeze({ medium, high, model: MODEL });
}

// Countercontrol: the actual text entrypoint wraps khonapolitHandler in
// khonapolit-interactive, changing the requested 3.8 HIGH to MEDIUM.
// Its user ingress and multi-layer fictional system frame STILL differ from D.
// A synthetic unprofiled HIGH request must not be called ordinary production.
export function describeRestoredVersusD() {
  const { medium, high, model } = buildDThinkingContrast();
  const packet = buildInvocationPacket({
    message: UNICODE_ASSAY_TASKS['creative-multistack-v1'],
    history: [],
    mode: 'issued-conjunction',
    waiveIssuance: true
  });
  const restored = withGeminiGenerationProfile(
    GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => buildGeminiRequest(packet, {}, model, {
      groveTrial: 'historical-20261002-v1'
    })
  );
  return Object.freeze({
    sameModel: true,
    actualEntrypointProfile: GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    sameUserContents: digest(restored.contents) === digest(medium.contents),
    sameSystemFrame: digest(restored.systemInstruction) === digest(medium.systemInstruction),
    sameGenerationConfigAsDMedium: digest(restored.generationConfig) === digest(medium.generationConfig),
    sameGenerationConfigAsDHigh: digest(restored.generationConfig) === digest(high.generationConfig),
    restoredThinking: restored.generationConfig.thinkingConfig,
    DThinking: medium.generationConfig.thinkingConfig
  });
}

export function dThinkingManifest() {
  const { medium, high, model } = buildDThinkingContrast();
  return Object.freeze({
    schema: D_THINKING_CONTRAST_SCHEMA,
    status: 'OFFLINE_INPUT_ISOLATION_ONLY',
    noProviderRequests: true,
    model,
    conditionA: 'D_CREATIVE_ORIGINAL_MEDIUM',
    conditionB: 'D_CREATIVE_ORIGINAL_HIGH',
    soleIntervention: 'generationConfig.thinkingConfig.thinkingLevel: medium -> high',
    sourceContentsIdentical: digest(medium.contents) === digest(high.contents),
    sourceSystemIdentical: digest(medium.systemInstruction) === digest(high.systemInstruction),
    A: { systemSha256: digest(medium.systemInstruction), contentsSha256: digest(medium.contents), generationSha256: digest(medium.generationConfig) },
    B: { systemSha256: digest(high.systemInstruction), contentsSha256: digest(high.contents), generationSha256: digest(high.generationConfig) },
    restoredVersusD: describeRestoredVersusD(),
    limitation: 'The MEDIUM/HIGH pair is a synthetic unprofiled comparison, NOT a production discrepancy: actual /api/khonapolit interactive 3.8 requests MEDIUM. No Gemini call or causal/artistic result.'
  });
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  if (process.argv.some(arg => ['--execute','--paid','--deploy'].includes(arg))) {
    throw new Error('D_THINKING_OFFLINE_ONLY_NO_PROVIDER_OR_DEPLOY');
  }
  process.stdout.write(JSON.stringify(dThinkingManifest(), null, 2) + '\n');
}
