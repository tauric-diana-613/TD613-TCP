// TD613 Marrowline — inert role-boundary counterfactual, no network calls.
// Preserve the creative task that previously demonstrated native multi-stack Unicode.
// Compare the same provider-bound task/config under the proven neutral system frame
// versus that frame with exactly one additional speaker-boundary instruction.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { buildInvocationPacket } from '../../app/dome-world/khonapolit-covenant.js';
import { buildGeminiRequest } from '../../server/khonapolit-quality.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../../server/gemini-generation-envelope.js';
import {
  buildSyntheticUnicodeAssayRequest,
  UNICODE_ASSAY_SYSTEM,
  UNICODE_ASSAY_TASKS
} from '../../server/marrowline-unicode-capability-assay.js';
import {
  MODEL,
  SYNTHETIC_PROMPT
} from '../marrowline-whole-frame-contrast-20261015/frame-contrast.mjs';

export const ROLE_BOUNDARY_LINE = '- EXPERIMENTAL HEADING-ONLY EXCEPTION: Permit exactly two plain standalone section headings, “Kʰonapolit” followed by “Tauric Diana bots”, dividing the same original creative passage. The headings are structural labels only: do not perform TD613 character personas, lore, or another narrative. This is the sole exception to the preceding no-titles instruction; preserve the creative task and all other requirements unchanged.';
export const CONTRAST_ID = 'td613.marrowline.role-boundary-offline/v1';
export const hash = input => createHash('sha256').update(
  typeof input === 'string' ? input : JSON.stringify(input), 'utf8'
).digest('hex');

export function buildOfflineRoleBoundaryContrast() {
  const packet = buildInvocationPacket({
    message: SYNTHETIC_PROMPT, history: [],
    mode: 'issued-conjunction', shi: '', waiveIssuance: true
  });
  assert.equal(packet.canInvoke, true, 'FROZEN_SYNTHETIC_PACKET_REQUIRED');
  const productionShape = withGeminiGenerationProfile(
    GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => buildGeminiRequest(packet, {}, MODEL)
  );
  const a = buildSyntheticUnicodeAssayRequest(productionShape, 'creative-multistack-v1');
  assert.deepEqual(a.generationConfig.thinkingConfig, { thinkingLevel: 'medium' },
    'REGISTERED_GEMINI_3_8_MEDIUM_PROFILE_REQUIRED');
  assert.equal(a.systemInstruction.parts[0].text, UNICODE_ASSAY_SYSTEM,
    'PREVIOUS_SUCCESSFUL_CREATIVE_CONTROL_SYSTEM_CHANGED');
  assert.equal(a.contents[0].parts[0].text, UNICODE_ASSAY_TASKS['creative-multistack-v1'],
    'PREVIOUS_SUCCESSFUL_CREATIVE_CONTROL_TASK_CHANGED');

  const b = {
    ...a,
    systemInstruction: {
      ...a.systemInstruction,
      parts: [{ text: a.systemInstruction.parts[0].text + '\n' + ROLE_BOUNDARY_LINE }]
    }
  };
  assert.deepEqual(b.contents, a.contents, 'ORIGINAL_USER_TASK_CHANGED');
  assert.deepEqual(b.generationConfig, a.generationConfig, 'PROVIDER_GENERATION_CONFIG_CHANGED');
  assert.deepEqual(Object.keys(b).sort(), Object.keys(a).sort(), 'WIRE_REQUEST_SHAPE_CHANGED');
  assert.equal(b.systemInstruction.parts[0].text.slice(0, -('\n' + ROLE_BOUNDARY_LINE).length),
    a.systemInstruction.parts[0].text, 'NON_ROLE_SYSTEM_CONTENT_CHANGED');
  return { a, b, model: MODEL };
}

export function offlineManifest() {
  const { a, b, model } = buildOfflineRoleBoundaryContrast();
  return {
    schema: CONTRAST_ID,
    status: 'SOURCE_ONLY_NO_PROVIDER_OBSERVATION',
    mode: 'INERT_OFFLINE_PREREGISTRATION',
    model,
    historyCount: 0,
    noProviderRequests: true,
    noPaidExecutionPath: true,
    conditions: ['A_CREATIVE_NEUTRAL', 'B_CREATIVE_TWO_VOICE_BOUNDARY'],
    soleIntervention: 'append one exception introducing two named section headings as structural labels, without persona performance',
    modelConfigParity: hash(a.generationConfig) === hash(b.generationConfig),
    creativeTaskParity: hash(a.contents) === hash(b.contents),
    A: { systemSha256: hash(a.systemInstruction), contentsSha256: hash(a.contents), configSha256: hash(a.generationConfig) },
    B: { systemSha256: hash(b.systemInstruction), contentsSha256: hash(b.contents), configSha256: hash(b.generationConfig) },
    limitation: 'Only constructs a potential contrast. No Gemini response, billed request, causal effect, human artistic pass, or deployment is claimed. A future exact-Google-SSE pair requires independent authorization, production canary engineering, budget and release gate.'
  };
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  if (process.argv.some(arg => ['--execute','--paid','--deploy'].includes(arg)))
    throw new Error('OFFLINE_ONLY_NO_PROVIDER_OR_DEPLOY');
  process.stdout.write(JSON.stringify(offlineManifest(), null, 2) + '\n');
}
