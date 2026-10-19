// TD613 · D creative control / thinking-level separator.
// Offline only. These functions construct request objects; they never call Gemini.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { buildInvocationPacket } from '../../app/dome-world/khonapolit-covenant.js';
import { buildGeminiRequest } from '../../server/khonapolit-quality.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../../server/gemini-generation-envelope.js';
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

  // B is a purely counterfactual UNPROFILED HIGH control. This is NOT the
  // ordinary browser/HTTP route: api/khonapolit.js wraps the actual text
  // handler in khonapolit-interactive, mapping 3.8 HIGH -> MEDIUM.
  // The synthetic assay changes only system/task, retaining config for B.
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

// Countercontrol: even if the same original D task is typed into normal
// Marrowline, the restored profile is NOT a matched D task. It carries the
// user ingress/seal and multi-layer fictional system frame. Never attribute
// D-vs-live differences to one role/persona sentence.
export function describeRestoredVersusD() {
  const { medium, high, model } = buildDThinkingContrast();
  const packet = buildInvocationPacket({
    message: UNICODE_ASSAY_TASKS['creative-multistack-v1'],
    history: [],
    mode: 'issued-conjunction',
    waiveIssuance: true
  });
  // Match the actual /api/khonapolit text entrypoint rather than calling
  // the inner builder outside its AsyncLocalStorage profile.
  const restored = withGeminiGenerationProfile(
    GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => buildGeminiRequest(packet, {}, model, {
      groveTrial: 'historical-20261002-v1'
    })
  );
  return Object.freeze({
    sameModel: true,
    sameUserContents: digest(restored.contents) === digest(medium.contents),
    sameSystemFrame: digest(restored.systemInstruction) === digest(medium.systemInstruction),
    sameGenerationConfigAsDMedium: digest(restored.generationConfig) === digest(medium.generationConfig),
    sameGenerationConfigAsDHigh: digest(restored.generationConfig) === digest(high.generationConfig),
    actualEntrypointProfile: GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    unprofiledHighIsProduction: false,
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
    soleIntervention: 'COUNTERFACTUAL UNPROFILED HIGH ONLY: generationConfig.thinkingConfig.thinkingLevel medium -> high; not the actual browser request',
    sourceContentsIdentical: digest(medium.contents) === digest(high.contents),
    sourceSystemIdentical: digest(medium.systemInstruction) === digest(high.systemInstruction),
    A: { systemSha256: digest(medium.systemInstruction), contentsSha256: digest(medium.contents), generationSha256: digest(medium.generationConfig) },
    B: { systemSha256: digest(high.systemInstruction), contentsSha256: digest(high.contents), generationSha256: digest(high.generationConfig) },
    restoredVersusD: describeRestoredVersusD(),
    limitation: 'No Gemini call. Actual text API applies the khonapolit-interactive profile: its 3.8 thinking is MEDIUM, identical to D, so this counterfactual HIGH branch does not explain ordinary Marrowline slash-only morphology.'
  });
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  if (process.argv.some(arg => ['--execute','--paid','--deploy'].includes(arg))) {
    throw new Error('D_THINKING_OFFLINE_ONLY_NO_PROVIDER_OR_DEPLOY');
  }
  process.stdout.write(JSON.stringify(dThinkingManifest(), null, 2) + '\n');
}
