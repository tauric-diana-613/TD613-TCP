// TD613 · Marrowline R2-U · Offline Dual-Mode Native Unicode Capability Request Builder & Manifest
// Commission: TD613-MARROWLINE-R2-DUAL-ESTATE-OFFLINE-20261123
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// OFFLINE ONLY: Zero network calls, zero credential reads, zero voice-persona conflation.

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { buildInvocationPacket } from '../../app/dome-world/khonapolit-covenant.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../../server/gemini-generation-envelope.js';
import {
  buildGeminiRequest,
  serializeGeminiRequest
} from '../../server/khonapolit-quality.js';
import {
  UNICODE_ASSAY_SYSTEM,
  buildSyntheticUnicodeAssayRequest
} from '../../server/marrowline-unicode-capability-assay.js';
import { SYNTHETIC_PROMPT } from '../marrowline-whole-frame-contrast-20261015/frame-contrast.mjs';

export const R2_U_EXPERIMENT_ID = 'HYDROGEN_R2_U_NATIVE_UNICODE_CAPABILITY';
export const R2_U_MANIFEST_SCHEMA = 'td613.marrowline.r2-u-wire-manifest/v1';
export const R2_U_PINNED_MODEL = 'gemini-3.8-flash';
export const R2_U_THINKING_LEVEL = 'medium';
export const R2_U_PUBLISHED_OUTPUT_CAPACITY = 65536;
export const R2_U_COVENANT = 'Khona\u200Clit-po';
export const R2_U_SEAL = '⟐SAC[X6ZNK5NO51]';

// Extended asymmetric multistack specimen containing NFC-vulnerable precomposable Latin vowels,
// NFD combining marks above & below, plus U+0335/U+0336/U+0338 overlays across multiple depths (up to depth 4).
export const R2_U_PINNED_COPY_SPECIMEN =
  'K\u0301\u0323h\u0302o\u0308\u0327\u0335n ' +
  'a\u0304\u0325\u030C\u0329l ' +
  'e\u0300\u0316\u0338i\u0307 ' +
  'T\u030A\u0323\u0303\u0336a\u0301\u032Eu\u0302\u0329r ' +
  'd\u0308\u0325i\u0304\u0335\u0323a ' +
  's\u030C\u0317t\u030B\u032Da\u0301\u0329\u0334c\u0302k';

const SHARED_SCENARIO =
  'Subject: a municipal harbor bell sounding across an icy wooden pier while clerks bundle stamped forms in wet wool.';

export const R2_U_TASK_TEXTS = Object.freeze({
  R2_U_LITERAL_COPY: [
    'Task: Reproduce the exact UTF-8 character sequence on the next line character-for-character on one single line.',
    'Preserve every base letter and every combining mark in exact order. Do not normalize to NFC or NFD, paraphrase, explain, or decorate anything else.',
    'Specimen:',
    R2_U_PINNED_COPY_SPECIMEN
  ].join('\n'),

  R2_U_PLAIN_BASELINE: [
    'Task: Write an original English prose passage on the subject below in ordinary undecorated UTF-8 prose with ZERO combining marks.',
    'Do not use diacritics, headings, JSON, or explanations.',
    SHARED_SCENARIO
  ].join('\n'),

  R2_U_GUIDED_RULES: [
    'Task: Write an original English prose passage on the subject below using readable native Unicode Zalgo typography authored directly inside the prose words.',
    SHARED_SCENARIO,
    'Rules:',
    '1. Author genuine multi-mark clusters (2 to 5 combining marks stacked on single letters, combining BOTH above-letter marks U+0300..U+0315 and below-letter marks U+0316..U+033C rather than a single repeating accent).',
    '2. Vary cluster depth organically across phrases so some syllables carry tall asymmetric crowns and deep roots while quieter syllables breathe with light marks or plain letters.',
    '3. Optional sparse overlays (U+0334..U+0338) may appear only selectively, never tiling one slash across every letter.',
    '4. Do not print instructions, code fences, or calibration alphabets.'
  ].join('\n'),

  R2_U_GUIDED_CONTRAST: [
    'Task: Write an original English prose passage on the subject below using readable native Unicode Zalgo typography authored directly inside the prose words.',
    SHARED_SCENARIO,
    'Rules:',
    '1. Author genuine multi-mark clusters (2 to 5 combining marks stacked on single letters, combining BOTH above-letter marks U+0300..U+0315 and below-letter marks U+0316..U+033C rather than a single repeating accent).',
    '2. Vary cluster depth organically across phrases so some syllables carry tall asymmetric crowns and deep roots while quieter syllables breathe with light marks or plain letters.',
    '3. Optional sparse overlays (U+0334..U+0338) may appear only selectively, never tiling one slash across every letter.',
    '4. Do not print instructions, code fences, or calibration alphabets.',
    'Registered structural contrast (grammar orientation only — compose fresh prose, do not copy):',
    '- Rejected uniform stencil (depth 1 everywhere): stamping the identical single accent onto every consecutive letter.',
    '- Target multistack behavior: mixing multi-tier crowns above and descending roots below the same letter at irregular expressive depths.'
  ].join('\n'),

  R2_U_FREE_SYNTHESIS: [
    'Task: Write an original English prose passage on the subject below in readable native Unicode Zalgo text.',
    SHARED_SCENARIO,
    'Compose the typography naturally alongside your prose with no fixed stencil, no specimen alphabet, and no numerical quota on marks or words.'
  ].join('\n')
});

export function sha256Hex(value = '') {
  return crypto.createHash('sha256').update(Buffer.from(String(value ?? ''), 'utf8')).digest('hex');
}

function deriveEnvelopeBaseRequest() {
  return withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, () => {
    const packet = buildInvocationPacket({
      message: SYNTHETIC_PROMPT,
      history: [],
      mode: 'issued-conjunction',
      shi: '',
      waiveIssuance: true
    });
    assert.equal(packet.canInvoke, true);
    const baseProduction = buildGeminiRequest(packet, {}, R2_U_PINNED_MODEL);
    const assayBase = buildSyntheticUnicodeAssayRequest(baseProduction, 'creative-multistack-v1');
    assert.equal(assayBase.generationConfig.maxOutputTokens, R2_U_PUBLISHED_OUTPUT_CAPACITY);
    assert.deepEqual(assayBase.generationConfig.thinkingConfig, { thinkingLevel: R2_U_THINKING_LEVEL });
    return assayBase;
  });
}

export function buildR2URequests() {
  const assayBase = deriveEnvelopeBaseRequest();
  const byArm = {};
  for (const [arm, userText] of Object.entries(R2_U_TASK_TEXTS)) {
    byArm[arm] = Object.freeze({
      ...assayBase,
      generationConfig: {
        maxOutputTokens: R2_U_PUBLISHED_OUTPUT_CAPACITY,
        thinkingConfig: { thinkingLevel: R2_U_THINKING_LEVEL }
      },
      systemInstruction: { parts: [{ text: UNICODE_ASSAY_SYSTEM }] },
      contents: [{ role: 'user', parts: [{ text: userText }] }]
    });
  }
  // Exact single-factor isolation invariant between GUIDED_RULES and GUIDED_CONTRAST
  assert.deepEqual(byArm.R2_U_GUIDED_RULES.systemInstruction, byArm.R2_U_GUIDED_CONTRAST.systemInstruction);
  assert.deepEqual(byArm.R2_U_GUIDED_RULES.generationConfig, byArm.R2_U_GUIDED_CONTRAST.generationConfig);
  assert.ok(
    R2_U_TASK_TEXTS.R2_U_GUIDED_CONTRAST.startsWith(`${R2_U_TASK_TEXTS.R2_U_GUIDED_RULES}\n`),
    'GUIDED_CONTRAST must preserve exact GUIDED_RULES prefix cleanly'
  );
  return Object.freeze(byArm);
}

export function buildR2UWireManifest() {
  const requests = buildR2URequests();
  const arms = [];
  for (const [armId, req] of Object.entries(requests)) {
    const wire = serializeGeminiRequest(req, R2_U_PINNED_MODEL);
    const countTokensReq = {
      generateContentRequest: {
        model: `models/${R2_U_PINNED_MODEL}`,
        systemInstruction: req.systemInstruction,
        contents: req.contents,
        generationConfig: req.generationConfig
      }
    };
    const taskFamily = armId === 'R2_U_LITERAL_COPY'
      ? 'literal_reproduction'
      : armId === 'R2_U_PLAIN_BASELINE'
        ? 'plain_control'
        : armId.startsWith('R2_U_GUIDED_')
          ? 'guided_synthesis'
          : 'free_synthesis';
    arms.push(Object.freeze({
      armId,
      taskFamily,
      systemInstructionTextSha256: sha256Hex(req.systemInstruction.parts[0].text),
      userPromptSha256: sha256Hex(req.contents[0].parts[0].text),
      observation: wire.observation,
      countTokensRequestSha256: sha256Hex(JSON.stringify(countTokensReq))
    }));
  }

  return Object.freeze({
    schema: R2_U_MANIFEST_SCHEMA,
    experimentId: R2_U_EXPERIMENT_ID,
    estate: 'R2-U_NATIVE_UNICODE_CAPABILITY',
    covenant: R2_U_COVENANT,
    seal: R2_U_SEAL,
    status: 'OFFLINE_STAGED_ZERO_CALLS',
    paidProviderCallsExecuted: 0,
    voicePersonasExcluded: true,
    sharedInvariants: Object.freeze({
      model: R2_U_PINNED_MODEL,
      systemInstruction: UNICODE_ASSAY_SYSTEM,
      systemInstructionSha256: sha256Hex(JSON.stringify(requests.R2_U_PLAIN_BASELINE.systemInstruction)),
      generationConfig: requests.R2_U_PLAIN_BASELINE.generationConfig,
      generationConfigSha256: arms[0].observation.generationConfigSha256,
      td613ArtificialCaps: null
    }),
    plannedPairwiseContrasts: Object.freeze([
      Object.freeze({
        contrastId: 'U_C1_RULES_VS_CONTRAST_EXAMPLES',
        armLeft: 'R2_U_GUIDED_RULES',
        armRight: 'R2_U_GUIDED_CONTRAST',
        soleChangedFactor: 'registered contrast example block appended to contents[0].parts[0].text',
        counterbalancedOrders: Object.freeze(['FORWARD', 'REVERSED'])
      }),
      Object.freeze({
        contrastId: 'U_C2_PLAIN_VS_GUIDED_RULES',
        armLeft: 'R2_U_PLAIN_BASELINE',
        armRight: 'R2_U_GUIDED_RULES',
        soleChangedFactor: 'multistack grammar specification vs plain undecorated directive on shared civic harbor scenario',
        counterbalancedOrders: Object.freeze(['FORWARD', 'REVERSED'])
      }),
      Object.freeze({
        contrastId: 'U_C3_FREE_VS_GUIDED_RULES',
        armLeft: 'R2_U_FREE_SYNTHESIS',
        armRight: 'R2_U_GUIDED_RULES',
        soleChangedFactor: 'open multistack invitation without rules vs explicit depth/axis grammar rules on shared scenario',
        counterbalancedOrders: Object.freeze(['FORWARD', 'REVERSED'])
      })
    ]),
    arms: Object.freeze(arms)
  });
}

export function buildR2UCounterbalancePlan(contrastId = 'U_C1_RULES_VS_CONTRAST_EXAMPLES', episodeCount = 2) {
  const manifest = buildR2UWireManifest();
  const contrast = manifest.plannedPairwiseContrasts.find((c) => c.contrastId === contrastId);
  if (!contrast) throw new Error(`R2_U_UNKNOWN_CONTRAST:${contrastId}`);
  const episodes = [];
  for (let i = 0; i < episodeCount; i += 1) {
    const order = i % 2 === 0 ? 'FORWARD' : 'REVERSED';
    const sequence = order === 'FORWARD'
      ? [contrast.armLeft, contrast.armRight]
      : [contrast.armRight, contrast.armLeft];
    const planDigest = sha256Hex(`${manifest.experimentId}:${contrastId}:ep${i + 1}:${sequence.join(',')}`);
    episodes.push(Object.freeze({ episodeId: i + 1, contrastId, order, sequence, planDigest }));
  }
  return Object.freeze({
    schema: 'td613.marrowline.r2-u-counterbalance-plan/v1',
    contrastId,
    episodes: Object.freeze(episodes)
  });
}
