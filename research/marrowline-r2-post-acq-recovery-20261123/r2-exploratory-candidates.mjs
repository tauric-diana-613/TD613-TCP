// TD613 · Marrowline R2 · Versioned Exploratory Candidate Prompts & Manifests (Offline / Zero Calls)
// Commission: TD613-MARROWLINE-R2-POST-ACQ-RECOVERY-20261123
// Predecessor: a48d2556ed946e01d4925dee93c463c73712d590 (PR #1783, R2-U pilot r2_r2u_036ef18ebc2e)
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// STRICT SEPARATION: Versioned exploratory candidates ONLY. Never silently mutates or substitutes into
// frozen R2_U_WIRE_MANIFEST.json or R2_W_WIRE_MANIFEST.json. Zero live provider calls executed.

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
import {
  R2_U_COVENANT,
  R2_U_PINNED_MODEL,
  R2_U_PUBLISHED_OUTPUT_CAPACITY,
  R2_U_SEAL,
  R2_U_THINKING_LEVEL
} from '../marrowline-r2-dual-estate-20261123/r2-u-preflight.mjs';
import { SYNTHETIC_PROMPT } from '../marrowline-whole-frame-contrast-20261015/frame-contrast.mjs';

export const R2_EXPLORATORY_CANDIDATES_SCHEMA = 'td613.marrowline.r2-exploratory-candidates/v1';

const SHARED_CIVIC_HARBOR_SCENARIO =
  'Subject: a municipal harbor bell sounding across an icy wooden pier while clerks bundle stamped forms in wet wool.';

/**
 * Consequence-before-ontology exploratory R2-U candidate prompts:
 * - Preserves full towering vertical High Zalgo height (never shrinks to Baby Zalgo)
 * - Omits literal anti-pattern descriptions ("depth 1", "cloned depth 3") that triggered parroting & loop collapse
 * - Keeps spaces and punctuation unstacked so towering spires remain readable typography
 * - Establishes plain undecorated speech as the resting ground with organic breath, rise, rupture, and recovery
 */
export const R2_U_EXPLORATORY_CANDIDATE_TASKS = Object.freeze({
  R2_U_EXP_V2_CHOREOGRAPHED_HIGH_ZALGO: [
    'Task: Write an original English prose passage on the subject below where native Unicode High Zalgo glitch typography acts as deliberate dramatic choreography rather than continuous clutter.',
    SHARED_CIVIC_HARBOR_SCENARIO,
    'Choreography and readability:',
    '- Anchor the passage in clean, undecorated English prose so every phrase remains readable.',
    '- Let the distortion rise selectively where shock, cold, or acoustic rupture strikes: on those chosen words, build full-height, ragged vertical High Zalgo spires (deep asymmetric crowns above using e.g. U+0300..U+0314, U+033D..U+0352, U+0363..U+036F paired with plunging roots below using U+0316..U+0330, U+0339..U+033C, U+0347..U+0356), then allow the line to recover back into restrained tremor or clean prose.',
    '- Keep all spaces between words and all punctuation completely clean with ZERO combining marks so vertical spires frame intelligible language instead of colliding into a solid wall.',
    '- Vary the mark combinations naturally across letters rather than repeating one copied mark sequence, and avoid flat overline/underline bars or boxed enclosing glyphs.',
    '- Do not print instructions, code fences, or calibration alphabets.'
  ].join('\n'),

  R2_U_EXP_V2_FOUR_MOVEMENT_ARC: [
    'Task: Write an original English prose passage on the subject below shaped across a four-beat typographic arc in native Unicode.',
    SHARED_CIVIC_HARBOR_SCENARIO,
    'Movement arc:',
    '1. Arrival: begin in completely plain, unornamented prose.',
    '2. Tremor: let subtle, sparse combining marks disturb a few cold-struck syllables.',
    '3. Rupture: erupt into full-height, asymmetrical towering vertical High Zalgo crowns and plunging roots on the bell strike and shattering frost words.',
    '4. Recovery: recede back into sparse traces and end on clean, quiet undecorated prose.',
    'Keep inter-word spaces and punctuation completely undecorated, invent varied cluster shapes without recycling a single template, and omit commentary or code fences.'
  ].join('\n')
});

function sha256Hex(value = '') {
  return crypto.createHash('sha256').update(Buffer.from(String(value ?? ''), 'utf8')).digest('hex');
}

function buildBaseAssayEnvelope() {
  return withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, () => {
    const packet = buildInvocationPacket({
      message: SYNTHETIC_PROMPT,
      history: [],
      mode: 'issued-conjunction',
      shi: '',
      waiveIssuance: true
    });
    assert.equal(packet.canInvoke, true);
    const baseProd = buildGeminiRequest(packet, {}, R2_U_PINNED_MODEL);
    const assayBase = buildSyntheticUnicodeAssayRequest(baseProd, 'creative-multistack-v1');
    assert.equal(assayBase.generationConfig.maxOutputTokens, R2_U_PUBLISHED_OUTPUT_CAPACITY);
    assert.deepEqual(assayBase.generationConfig.thinkingConfig, { thinkingLevel: R2_U_THINKING_LEVEL });
    return assayBase;
  });
}

export function buildR2ExploratoryCandidateRequests() {
  const base = buildBaseAssayEnvelope();
  const requests = {};
  for (const [candidateId, userText] of Object.entries(R2_U_EXPLORATORY_CANDIDATE_TASKS)) {
    requests[candidateId] = Object.freeze({
      ...base,
      generationConfig: {
        maxOutputTokens: R2_U_PUBLISHED_OUTPUT_CAPACITY,
        thinkingConfig: { thinkingLevel: R2_U_THINKING_LEVEL }
      },
      systemInstruction: { parts: [{ text: UNICODE_ASSAY_SYSTEM }] },
      contents: [{ role: 'user', parts: [{ text: userText }] }]
    });
  }
  return Object.freeze(requests);
}

export function buildR2ExploratoryCandidateManifest() {
  const requests = buildR2ExploratoryCandidateRequests();
  const candidates = [];
  for (const [candidateId, req] of Object.entries(requests)) {
    const wire = serializeGeminiRequest(req, R2_U_PINNED_MODEL);
    const countTokensReq = {
      generateContentRequest: {
        model: `models/${R2_U_PINNED_MODEL}`,
        systemInstruction: req.systemInstruction,
        contents: req.contents,
        generationConfig: req.generationConfig
      }
    };
    candidates.push(Object.freeze({
      candidateId,
      estateTarget: 'R2-U_EXPLORATORY_CANDIDATE',
      replacesFrozenArm: false,
      userPromptSha256: sha256Hex(req.contents[0].parts[0].text),
      observation: wire.observation,
      countTokensRequestSha256: sha256Hex(JSON.stringify(countTokensReq))
    }));
  }

  return Object.freeze({
    schema: R2_EXPLORATORY_CANDIDATES_SCHEMA,
    status: 'EXPLORATORY_CANDIDATE_UNFROZEN_ZERO_CALLS',
    predecessorCommitSha: 'a48d2556ed946e01d4925dee93c463c73712d590',
    predecessorSessionId: 'r2_r2u_036ef18ebc2e',
    covenant: R2_U_COVENANT,
    seal: R2_U_SEAL,
    paidProviderCallsExecuted: 0,
    frozenR2UManifestModified: false,
    frozenR2WManifestModified: false,
    sharedInvariants: Object.freeze({
      model: R2_U_PINNED_MODEL,
      systemInstruction: UNICODE_ASSAY_SYSTEM,
      generationConfig: requests.R2_U_EXP_V2_CHOREOGRAPHED_HIGH_ZALGO.generationConfig,
      generationConfigSha256: candidates[0].observation.generationConfigSha256,
      td613ArtificialCaps: null
    }),
    candidates: Object.freeze(candidates)
  });
}
