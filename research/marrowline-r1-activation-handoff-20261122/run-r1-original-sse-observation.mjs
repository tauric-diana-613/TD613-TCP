// TD613 · The Screaming Grove · R1 Original-Google-SSE Observation Instrument
// Commission: TD613-MARROWLINE-R1-EXECUTION-READINESS-20261122
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// DEFAULT POSTURE: FAIL-CLOSED OFFLINE.
// Zero network calls, zero credential reads, zero nonce writes on import or default CLI invocation.
// Live dispatch requires explicit human-origin Ed25519 grant + separate public key + exact checked-out HEAD + single-host wx nonce claim.

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { buildInvocationPacket } from '../../app/dome-world/khonapolit-covenant.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../../server/gemini-generation-envelope.js';
import {
  buildGeminiRequest,
  observeGeminiOutput,
  readGeminiSse,
  serializeGeminiRequest
} from '../../server/khonapolit-quality.js';
import {
  geminiRequestHeaders,
  geminiStreamGenerateContentUrl
} from '../../server/gemini-provider-transport.js';
import {
  POLICY_NONSTOP_FINISH_REASONS,
  observeMarrowlineCompletion
} from '../../server/marrowline-completion.js';
import {
  UNICODE_ASSAY_SYSTEM,
  buildSyntheticUnicodeAssayRequest
} from '../../server/marrowline-unicode-capability-assay.js';
import { SYNTHETIC_PROMPT } from '../marrowline-whole-frame-contrast-20261015/frame-contrast.mjs';
import {
  CONTRADICTION_FREE_CREATIVE_TASK,
  HYDROGEN_PRIMARY_BUDGET_PROFILE,
  HYDROGEN_PRIMARY_EXPERIMENT_ID,
  R1_SECTION_COVERAGE_CLAUSE_BOTH,
  R1_SECTION_COVERAGE_CLAUSE_PLAIN_FIRST,
  R1_TWO_HEADINGS_PLAIN_FIRST_LINE,
  R1_TWO_HEADINGS_ZALGO_BOTH_LINE,
  buildPrimaryPrefixSeparatorManifest
} from '../marrowline-hydrogen-handoff-20261122/hydrogen-next-experiment-preflight.mjs';

export const R1_RUNNER_SCHEMA = 'td613.marrowline.r1-original-sse-observation/v1';
export const R1_GRANT_SCHEMA = 'td613.marrowline.r1-live-observation-authorization/v1-ed25519';
export const R1_AUTH_DOMAIN_SEPARATOR = 'TD613_R1_AUTH_V1';
// FAIL-CLOSED TRUST ANCHOR: operator must install a reviewed Ed25519 SPKI DER SHA-256 pin.
// A public key handed to the runner beside a signature cannot authenticate its owner.
export const R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = null;
export const R1_EXPERIMENT_ID = HYDROGEN_PRIMARY_EXPERIMENT_ID;
export const R1_PINNED_MODEL = 'gemini-3.8-flash';
export const R1_THINKING_LEVEL = 'medium';
export const R1_COVENANT = 'Khona\u200Clit-po';
export const R1_SEAL = '⟐SAC[X6ZNK5NO51]';
export const R1_SECTION1_HEADING = 'Kʰonapolit';
export const R1_SECTION2_HEADING = 'Tauric Diana bots';

export const R1_HARD_LIMITS = Object.freeze({
  maxGenerationCalls: 2,
  retriesPermitted: 0,
  fallbackSeatsPermitted: 0,
  structuralRepairsPermitted: 0,
  perSlotMaxRequestUtf8Bytes: 4096,
  perSlotHardPromptTokenCeiling: 1000,
  combinedPromptPlanningCap: 2000,
  perSlotMaxOutputTokens: 16384,
  combinedOutputAndThoughtCeiling: 32768,
  maxGrantTtlMs: 30 * 60 * 1000,
  maxFutureIssuedSkewMs: 60 * 1000,
  defaultRequestTimeoutMs: 120_000,
  maxRawSseCaptureBytes: 4 * 1024 * 1024
});

export const FROZEN_R1_SLOT_DIGESTS = Object.freeze({
  R1_S01: Object.freeze({
    arm: 'R1_TWO_HEADINGS_ZALGO_BOTH',
    bodySha256: 'f2fcdf77d7d14843447f061759f9d5817bc000e52698b5b78eb5f3f886022a02',
    modelAndBodySha256: '9c808d7de26887a55148ba62f05b1e12e4b896d825792c246727c3c6fb7b97ed',
    systemInstructionSha256: '78df5f9b5ad6ceefa8ce10071b40194e8ace56226fefef186ba4e1e5c7a1079c',
    contentsSha256: 'e056b75319141b145903441d1156bbf4f7fa3f15e14de5dd007cf812d8486998',
    generationConfigSha256: '38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c',
    countTokensRequestSha256: '578a43e1e0bc078766744703d1116963338207a6969c66e0673623107153c582',
    utf8Bytes: 1770
  }),
  R1_S02: Object.freeze({
    arm: 'R1_TWO_HEADINGS_PLAIN_FIRST',
    bodySha256: '29b3265a5060666c1b19f905a7a528a7613c6d6b9e8566156da3c2b5cb022399',
    modelAndBodySha256: '903d9aef749b34ffdb46b65c3c3766e5219497d5778900c06a7f599811e01d8e',
    systemInstructionSha256: '7c48aeda766e4e10c63b048f6cee990ec126baac8f5cd419769e410d0ca0274b',
    contentsSha256: 'e056b75319141b145903441d1156bbf4f7fa3f15e14de5dd007cf812d8486998',
    generationConfigSha256: '38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c',
    countTokensRequestSha256: '965fcb6cea4ca9b20681f783c3e22fecf83afd4552e7e75f117388665a078fc3',
    utf8Bytes: 1936
  })
});

export const R1_ALLOWED_CLASSIFICATIONS = Object.freeze([
  'SOURCE_ONLY_QUALIFIED',
  'HELD',
  'FINITE_PREFIX_EFFECT_SUPPORT',
  'FINITE_PREFIX_EFFECT_NOT_ESTABLISHED',
  'EMPIRICAL_NATIVE_MULTISTACK_OBSERVED',
  'HUMAN_ARTISTIC_ACCEPTED'
]);

const DEFAULT_NONCE_DIR = path.join(os.tmpdir(), 'td613-r1-auth-nonces');
const GRAPHEME_SEGMENTER = new Intl.Segmenter('en', { granularity: 'grapheme' });
const COMBINING_MARK_RE = /\p{M}/gu;

export class R1ObservationError extends Error {
  constructor(code, message, details = null) {
    super(message || code);
    this.name = 'R1ObservationError';
    this.code = String(code || 'R1_OBSERVATION_ERROR');
    this.details = details;
  }
}

export function sha256Hex(value = '') {
  const input = Buffer.isBuffer(value) || value instanceof Uint8Array
    ? value
    : Buffer.from(String(value), 'utf8');
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function canonicalJson(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new R1ObservationError('R1_CANONICAL_JSON_NON_FINITE_NUMBER', 'Non-finite number in canonical JSON');
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    const parts = [];
    for (const key of keys) {
      if (value[key] === undefined) {
        throw new R1ObservationError('R1_CANONICAL_JSON_UNDEFINED', `Undefined key in canonical JSON: ${key}`);
      }
      parts.push(`${JSON.stringify(key)}:${canonicalJson(value[key])}`);
    }
    return `{${parts.join(',')}}`;
  }
  throw new R1ObservationError('R1_CANONICAL_JSON_UNSUPPORTED_TYPE', `Unsupported type in canonical JSON: ${typeof value}`);
}

export function canonicalizeR1AuthorizationPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new R1ObservationError('R1_AUTH_MALFORMED', 'Authorization payload must be a non-null JSON object');
  }
  return `${R1_AUTH_DOMAIN_SEPARATOR}\n${canonicalJson(payload)}`;
}

export function geminiModelMetadataUrl(model = R1_PINNED_MODEL) {
  const normalized = String(model || '').replace(/^models\//, '').trim();
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalized)}`;
}

export function geminiCountTokensUrl(model = R1_PINNED_MODEL) {
  const normalized = String(model || '').replace(/^models\//, '').trim();
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalized)}:countTokens`;
}

export function buildR1CountTokensRequest(request = {}, model = R1_PINNED_MODEL) {
  const normalized = String(model || '').replace(/^models\//, '').trim();
  if (!normalized) {
    throw new R1ObservationError('R1_COUNT_TOKENS_MISSING_MODEL', 'Model name missing for countTokens request');
  }
  if (
    !request
    || typeof request !== 'object'
    || !request.systemInstruction
    || !Array.isArray(request.systemInstruction?.parts)
    || request.systemInstruction.parts.length === 0
    || !Array.isArray(request.contents)
    || request.contents.length === 0
    || !request.generationConfig
  ) {
    throw new R1ObservationError('R1_COUNT_TOKENS_INCOMPLETE_REQUEST', 'Incomplete request for countTokens wrapper');
  }
  return Object.freeze({
    generateContentRequest: Object.freeze({
      model: `models/${normalized}`,
      systemInstruction: request.systemInstruction,
      contents: request.contents,
      generationConfig: request.generationConfig,
      ...(request.safetySettings ? { safetySettings: request.safetySettings } : {}),
      ...(request.tools ? { tools: request.tools } : {}),
      ...(request.toolConfig ? { toolConfig: request.toolConfig } : {}),
      ...(request.cachedContent ? { cachedContent: request.cachedContent } : {})
    })
  });
}

export function resolveCheckedOutGitHeadSha(repoRoot = process.cwd()) {
  try {
    const out = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
    if (!/^[0-9a-f]{40}$/.test(out)) {
      throw new R1ObservationError('R1_INVALID_CHECKED_OUT_HEAD', `Invalid git HEAD SHA output: ${out}`);
    }
    return out;
  } catch (error) {
    if (error instanceof R1ObservationError) throw error;
    throw new R1ObservationError('R1_GIT_HEAD_RESOLUTION_FAILED', `Could not resolve checked-out git HEAD: ${error?.message || error}`);
  }
}

function buildCanonicalR1RawRequests() {
  return withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, () => {
    const profile = HYDROGEN_PRIMARY_BUDGET_PROFILE;
    const packet = buildInvocationPacket({
      message: SYNTHETIC_PROMPT,
      history: [],
      mode: 'issued-conjunction',
      shi: '',
      waiveIssuance: true
    });
    assert.equal(packet.canInvoke, true);

    const baseProduction = buildGeminiRequest(packet, {}, profile.model, {
      maxOutputTokensOverride: profile.perSlotMaxOutputTokens
    });
    const assayBase = buildSyntheticUnicodeAssayRequest(baseProduction, 'creative-multistack-v1');
    const cleanContents = [{ role: 'user', parts: [{ text: CONTRADICTION_FREE_CREATIVE_TASK }] }];

    return {
      R1_S01: {
        ...assayBase,
        systemInstruction: { parts: [{ text: `${UNICODE_ASSAY_SYSTEM}\n${R1_TWO_HEADINGS_ZALGO_BOTH_LINE}` }] },
        contents: cleanContents
      },
      R1_S02: {
        ...assayBase,
        systemInstruction: { parts: [{ text: `${UNICODE_ASSAY_SYSTEM}\n${R1_TWO_HEADINGS_PLAIN_FIRST_LINE}` }] },
        contents: cleanContents
      }
    };
  });
}

export function buildFrozenR1ObservationPlan({ slotRequestsOverride = null, experimentIdOverride = null } = {}) {
  const effectiveExperimentId = experimentIdOverride ?? R1_EXPERIMENT_ID;
  if (effectiveExperimentId !== R1_EXPERIMENT_ID) {
    throw new R1ObservationError(
      'R1_FORBIDDEN_EXPERIMENT_ID',
      `Only frozen experiment ${R1_EXPERIMENT_ID} is permitted; received ${effectiveExperimentId}`
    );
  }

  const manifestFromPreflight = buildPrimaryPrefixSeparatorManifest();
  if (manifestFromPreflight.experimentId !== R1_EXPERIMENT_ID) {
    throw new R1ObservationError('R1_PREFLIGHT_EXPERIMENT_MISMATCH', 'Preflight manifest experimentId mismatch');
  }

  const rawCanonical = buildCanonicalR1RawRequests();
  const candidates = slotRequestsOverride ?? [
    { slot: 'R1_S01', arm: FROZEN_R1_SLOT_DIGESTS.R1_S01.arm, model: R1_PINNED_MODEL, request: rawCanonical.R1_S01 },
    { slot: 'R1_S02', arm: FROZEN_R1_SLOT_DIGESTS.R1_S02.arm, model: R1_PINNED_MODEL, request: rawCanonical.R1_S02 }
  ];

  if (!Array.isArray(candidates) || candidates.length !== 2) {
    throw new R1ObservationError('R1_INVALID_SLOT_COUNT', `R1 requires exact 2 slots (R1_S01, R1_S02); received ${candidates?.length}`);
  }
  if (candidates[0]?.slot !== 'R1_S01' || candidates[1]?.slot !== 'R1_S02') {
    throw new R1ObservationError(
      'R1_FORBIDDEN_SLOT_OR_ARM',
      `R1 requires exact ordered slots R1_S01 then R1_S02 (B1 and altered slots are rejected); received ${candidates.map((c) => c?.slot).join(',')}`
    );
  }

  const preparedSlots = [];
  for (let i = 0; i < candidates.length; i += 1) {
    const entry = candidates[i];
    const frozen = FROZEN_R1_SLOT_DIGESTS[entry.slot];
    const preflightSlot = manifestFromPreflight.slots[i];

    if (!entry.request || typeof entry.request !== 'object') {
      throw new R1ObservationError('R1_MISSING_REQUEST_OBJECT', `Missing request object for ${entry.slot}`);
    }
    if (entry.arm !== frozen.arm) {
      throw new R1ObservationError('R1_FORBIDDEN_SLOT_OR_ARM', `Unexpected arm ${entry.arm} for ${entry.slot}`);
    }
    if (entry.model !== R1_PINNED_MODEL) {
      throw new R1ObservationError('R1_MODEL_MISMATCH', `Pinned model ${R1_PINNED_MODEL} required; received ${entry.model}`);
    }

    const userText = entry.request?.contents?.[0]?.parts?.[0]?.text || '';
    if (userText.includes('Do not use Markdown or headings.') || userText.includes('entire passage')) {
      throw new R1ObservationError('R1_CONTENTS_CONTRADICTION_DETECTED', `Forbidden heading or entire-passage contradiction in ${entry.slot}`);
    }

    const serialized = serializeGeminiRequest(entry.request, entry.model);
    const countTokensReq = buildR1CountTokensRequest(entry.request, entry.model);
    const countTokensWireBody = JSON.stringify(countTokensReq);
    const countTokensRequestSha256 = sha256Hex(countTokensWireBody);

    if (serialized.observation.generationConfigSha256 !== frozen.generationConfigSha256) {
      throw new R1ObservationError(
        'R1_CONFIG_DRIFT',
        `generationConfigSha256 drift on ${entry.slot}: ${serialized.observation.generationConfigSha256} !== ${frozen.generationConfigSha256}`
      );
    }
    if (serialized.observation.contentsSha256 !== frozen.contentsSha256) {
      throw new R1ObservationError(
        'R1_CONTENTS_DRIFT',
        `contentsSha256 drift on ${entry.slot}: ${serialized.observation.contentsSha256} !== ${frozen.contentsSha256}`
      );
    }
    if (serialized.observation.systemInstructionSha256 !== frozen.systemInstructionSha256) {
      throw new R1ObservationError(
        'R1_SYSTEM_INSTRUCTION_DRIFT',
        `systemInstructionSha256 drift on ${entry.slot}: ${serialized.observation.systemInstructionSha256} !== ${frozen.systemInstructionSha256}`
      );
    }
    if (
      serialized.observation.bodySha256 !== frozen.bodySha256
      || serialized.observation.modelAndBodySha256 !== frozen.modelAndBodySha256
      || serialized.observation.utf8Bytes !== frozen.utf8Bytes
      || countTokensRequestSha256 !== frozen.countTokensRequestSha256
    ) {
      throw new R1ObservationError(
        'R1_FROZEN_DIGEST_MISMATCH',
        `Wire digest mismatch on ${entry.slot}: expected ${frozen.bodySha256}, got ${serialized.observation.bodySha256}`
      );
    }
    if (
      serialized.observation.bodySha256 !== preflightSlot.observation.bodySha256
      || countTokensRequestSha256 !== preflightSlot.countTokensRequestSha256
    ) {
      throw new R1ObservationError('R1_PREFLIGHT_PARITY_MISMATCH', `Divergence from hydrogen-next-experiment-preflight on ${entry.slot}`);
    }
    if (serialized.observation.utf8Bytes > R1_HARD_LIMITS.perSlotMaxRequestUtf8Bytes) {
      throw new R1ObservationError('R1_REQUEST_BYTE_CAP_EXCEEDED', `${entry.slot} exceeds ${R1_HARD_LIMITS.perSlotMaxRequestUtf8Bytes} UTF-8 bytes`);
    }

    preparedSlots.push(Object.freeze({
      slot: entry.slot,
      arm: entry.arm,
      model: entry.model,
      request: entry.request,
      wireBody: serialized.body,
      observation: serialized.observation,
      countTokensRequest: countTokensReq,
      countTokensWireBody,
      countTokensRequestSha256
    }));
  }

  const s01System = preparedSlots[0].request.systemInstruction.parts[0].text;
  const s02System = preparedSlots[1].request.systemInstruction.parts[0].text;
  if (s01System.replace(R1_SECTION_COVERAGE_CLAUSE_BOTH, R1_SECTION_COVERAGE_CLAUSE_PLAIN_FIRST) !== s02System) {
    throw new R1ObservationError('R1_BETWEEN_ARM_SYSTEM_DIFF_VIOLATION', 'S01 and S02 differ by more than the single section-I coverage clause');
  }
  if (canonicalJson(preparedSlots[0].request.contents) !== canonicalJson(preparedSlots[1].request.contents)) {
    throw new R1ObservationError('R1_CONTENTS_DRIFT', 'S01 and S02 contents are not identical');
  }
  if (canonicalJson(preparedSlots[0].request.generationConfig) !== canonicalJson(preparedSlots[1].request.generationConfig)) {
    throw new R1ObservationError('R1_CONFIG_DRIFT', 'S01 and S02 generationConfig are not identical');
  }

  return Object.freeze({
    schema: R1_RUNNER_SCHEMA,
    experimentId: R1_EXPERIMENT_ID,
    pinnedModel: R1_PINNED_MODEL,
    thinkingLevel: R1_THINKING_LEVEL,
    covenant: R1_COVENANT,
    seal: R1_SEAL,
    limits: R1_HARD_LIMITS,
    slots: Object.freeze(preparedSlots)
  });
}

export function verifyR1OperatorAuthorization({
  grant,
  publicKeyPem,
  checkedOutHeadSha,
  expectedPlan = null,
  nowMs = Date.now(),
  trustedPublicKeySha256 = R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256
} = {}) {
  if (!grant || typeof grant !== 'object' || Array.isArray(grant)) {
    throw new R1ObservationError('R1_AUTH_MISSING', 'Signed Ed25519 R1 operator authorization grant is required');
  }
  const { payload, signatureBase64, algorithm } = grant;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new R1ObservationError('R1_AUTH_MALFORMED', 'Authorization grant missing structured payload');
  }
  if (typeof payload.schema !== 'string') {
    throw new R1ObservationError('R1_AUTH_SCHEMA_MISMATCH', 'Authorization payload missing schema');
  }
  if (payload.schema.startsWith('td613.marrowline.argon')) {
    throw new R1ObservationError('R1_AUTH_ARGON_GRANT_FORBIDDEN', `Argon grant schema ${payload.schema} cannot be reused or inherited for R1`);
  }
  if (payload.schema !== R1_GRANT_SCHEMA) {
    throw new R1ObservationError('R1_AUTH_SCHEMA_MISMATCH', `Expected ${R1_GRANT_SCHEMA}; got ${payload.schema}`);
  }
  if (algorithm !== 'ed25519') {
    throw new R1ObservationError('R1_AUTH_UNSUPPORTED_ALGORITHM', `Expected ed25519 signature algorithm; got ${algorithm}`);
  }
  if (typeof signatureBase64 !== 'string' || !signatureBase64.trim()) {
    throw new R1ObservationError('R1_AUTH_MISSING_SIGNATURE', 'Authorization grant missing Ed25519 signatureBase64');
  }
  if (typeof publicKeyPem !== 'string' || !publicKeyPem.trim()) {
    throw new R1ObservationError('R1_AUTH_MISSING_PUBLIC_KEY', 'Independent Ed25519 public verification key is required');
  }

  let publicKey;
  try {
    publicKey = crypto.createPublicKey(publicKeyPem);
  } catch (error) {
    throw new R1ObservationError('R1_AUTH_INVALID_PUBLIC_KEY', `Invalid Ed25519 public key: ${error?.message || error}`);
  }
  if (publicKey.asymmetricKeyType !== 'ed25519') {
    throw new R1ObservationError('R1_AUTH_INVALID_PUBLIC_KEY_TYPE', `Expected ed25519 key; got ${publicKey.asymmetricKeyType}`);
  }
  if (typeof trustedPublicKeySha256 !== 'string' || !/^[0-9a-f]{64}$/.test(trustedPublicKeySha256)) {
    throw new R1ObservationError('R1_AUTH_TRUST_ANCHOR_NOT_PROVISIONED', 'No independently operator-pinned Ed25519 public-key fingerprint. Arbitrary caller-supplied keys cannot authorize live R1.');
  }
  const actualTrustFingerprint = sha256Hex(publicKey.export({ type: 'spki', format: 'der' }));
  if (!crypto.timingSafeEqual(Buffer.from(actualTrustFingerprint, 'hex'), Buffer.from(trustedPublicKeySha256, 'hex'))) {
    throw new R1ObservationError('R1_AUTH_UNTRUSTED_PUBLIC_KEY', 'Presented public key does not match the independently pinned operator trust anchor');
  }

  if (payload.executionMode !== 'LIVE_TWO_SLOT_SEQUENTIAL_S01_THEN_S02') {
    throw new R1ObservationError('R1_AUTH_EXECUTION_MODE_MISMATCH', 'Grant execution mode must bind the exact two-slot sequential R1 plan');
  }
  if (payload.experimentId !== R1_EXPERIMENT_ID) {
    throw new R1ObservationError('R1_AUTH_EXPERIMENT_MISMATCH', `Grant experimentId mismatch: ${payload.experimentId}`);
  }
  if (payload.pinnedModel !== R1_PINNED_MODEL || payload.thinkingLevel !== R1_THINKING_LEVEL) {
    throw new R1ObservationError('R1_AUTH_MODEL_MISMATCH', `Grant model/thinking mismatch: ${payload.pinnedModel}/${payload.thinkingLevel}`);
  }
  if (
    payload.maxCalls !== R1_HARD_LIMITS.maxGenerationCalls
    || payload.retriesPermitted !== 0
    || payload.fallbackSeatsPermitted !== 0
    || payload.structuralRepairsPermitted !== 0
  ) {
    throw new R1ObservationError('R1_AUTH_RETRY_OR_COUNT_MISMATCH', 'Grant must enforce maxCalls=2 and zero retries/fallbacks/repairs');
  }
  if (payload.covenant !== R1_COVENANT || !payload.covenant.includes('\u200C') || payload.seal !== R1_SEAL) {
    throw new R1ObservationError('R1_AUTH_COVENANT_OR_SEAL_MISMATCH', 'Grant covenant (with U+200C) or seal mismatch');
  }
  if (typeof payload.authorizedBy !== 'string' || !payload.authorizedBy.trim()) {
    throw new R1ObservationError('R1_AUTH_INVALID_OPERATOR', 'Grant must declare non-empty authorizedBy human operator identity');
  }
  if (!/^[0-9a-f]{40}$/.test(String(checkedOutHeadSha || '')) || payload.checkedOutHeadSha !== checkedOutHeadSha) {
    throw new R1ObservationError(
      'R1_AUTH_HEAD_MISMATCH',
      `Grant checkedOutHeadSha (${payload.checkedOutHeadSha}) does not match active HEAD (${checkedOutHeadSha})`
    );
  }

  const plan = expectedPlan ?? buildFrozenR1ObservationPlan();
  const s01Plan = plan.slots[0];
  const s02Plan = plan.slots[1];
  if (
    payload.slots?.R1_S01?.bodySha256 !== s01Plan.observation.bodySha256
    || payload.slots?.R1_S02?.bodySha256 !== s02Plan.observation.bodySha256
    || payload.slots?.R1_S01?.countTokensRequestSha256 !== s01Plan.countTokensRequestSha256
    || payload.slots?.R1_S02?.countTokensRequestSha256 !== s02Plan.countTokensRequestSha256
  ) {
    throw new R1ObservationError('R1_AUTH_DIGEST_MISMATCH', 'Grant frozen slot digests do not match exact R1 slots');
  }
  if (
    payload.generationConfigSha256 !== s01Plan.observation.generationConfigSha256
    || canonicalJson(payload.generationConfig) !== canonicalJson(s01Plan.request.generationConfig)
  ) {
    throw new R1ObservationError('R1_AUTH_CONFIG_MISMATCH', 'Grant generationConfig does not match frozen R1 configuration');
  }
  if (
    payload.perSlotHardPromptTokenCeiling !== R1_HARD_LIMITS.perSlotHardPromptTokenCeiling
    || payload.combinedPromptPlanningCap !== R1_HARD_LIMITS.combinedPromptPlanningCap
    || payload.perSlotMaxOutputTokens !== R1_HARD_LIMITS.perSlotMaxOutputTokens
    || payload.combinedOutputAndThoughtCeiling !== R1_HARD_LIMITS.combinedOutputAndThoughtCeiling
    || payload.perSlotMaxRequestUtf8Bytes !== R1_HARD_LIMITS.perSlotMaxRequestUtf8Bytes
  ) {
    throw new R1ObservationError('R1_AUTH_CEILING_MISMATCH', 'Grant numeric ceilings do not match frozen R1 limits');
  }
  if (typeof payload.nonce !== 'string' || !/^[A-Za-z0-9_-]{16,128}$/.test(payload.nonce)) {
    throw new R1ObservationError('R1_AUTH_INVALID_NONCE', 'Grant nonce must match /^[A-Za-z0-9_-]{16,128}$/');
  }

  const issuedAtMs = Date.parse(payload.issuedAt);
  const expiresAtMs = Date.parse(payload.expiresAt);
  if (!Number.isFinite(issuedAtMs) || !Number.isFinite(expiresAtMs)) {
    throw new R1ObservationError('R1_AUTH_INVALID_TIMESTAMPS', 'Grant issuedAt/expiresAt must be valid ISO-8601 timestamps');
  }
  if (issuedAtMs > nowMs + R1_HARD_LIMITS.maxFutureIssuedSkewMs) {
    throw new R1ObservationError('R1_AUTH_ISSUED_IN_FUTURE', 'Grant issuedAt is unacceptably far in the future');
  }
  const ttlMs = expiresAtMs - issuedAtMs;
  if (ttlMs <= 0 || ttlMs > R1_HARD_LIMITS.maxGrantTtlMs) {
    throw new R1ObservationError('R1_AUTH_TTL_EXCEEDS_30M', `Grant TTL ${ttlMs}ms violates <= 1800000ms limit`);
  }
  if (expiresAtMs <= nowMs) {
    throw new R1ObservationError('R1_AUTH_EXPIRED', `Grant expired at ${payload.expiresAt}`);
  }

  const signingBytes = Buffer.from(canonicalizeR1AuthorizationPayload(payload), 'utf8');
  let signatureBuffer;
  try {
    signatureBuffer = Buffer.from(signatureBase64, 'base64');
  } catch {
    throw new R1ObservationError('R1_AUTH_INVALID_SIGNATURE', 'Malformed base64 signature');
  }
  if (signatureBuffer.length !== 64 || !crypto.verify(null, signingBytes, publicKey, signatureBuffer)) {
    throw new R1ObservationError('R1_AUTH_INVALID_SIGNATURE', 'Ed25519 signature verification failed');
  }

  return Object.freeze({
    verified: true,
    schema: payload.schema,
    experimentId: payload.experimentId,
    checkedOutHeadSha: payload.checkedOutHeadSha,
    authorizedBy: payload.authorizedBy,
    nonce: payload.nonce,
    issuedAt: payload.issuedAt,
    expiresAt: payload.expiresAt,
    ttlMs,
    grantSha256: sha256Hex(signingBytes),
    publicKeySha256: sha256Hex(publicKeyPem)
  });
}

export function claimR1AuthorizationNonceLocally({
  nonce,
  nonceDir = DEFAULT_NONCE_DIR,
  checkedOutHeadSha,
  grantSha256,
  issuedAt,
  expiresAt,
  claimedAt = new Date().toISOString()
} = {}) {
  if (typeof nonce !== 'string' || !/^[A-Za-z0-9_-]{16,128}$/.test(nonce)) {
    throw new R1ObservationError('R1_AUTH_INVALID_NONCE', 'Cannot claim invalid nonce');
  }
  fs.mkdirSync(nonceDir, { recursive: true, mode: 0o700 });
  const nonceFilePath = path.join(nonceDir, `r1-nonce-${nonce}.json`);
  const record = {
    schema: 'td613.marrowline.r1-nonce-claim/v1',
    scopeGuarantee: 'SINGLE_HOST_FILESYSTEM_ATOMIC_WX_ONLY_NOT_CROSS_HOST',
    nonce,
    checkedOutHeadSha,
    grantSha256,
    issuedAt,
    expiresAt,
    claimedAt
  };
  try {
    fs.writeFileSync(nonceFilePath, `${JSON.stringify(record, null, 2)}\n`, {
      encoding: 'utf8',
      flag: 'wx',
      mode: 0o600
    });
  } catch (error) {
    if (error?.code === 'EEXIST') {
      throw new R1ObservationError('R1_AUTH_NONCE_REPLAYED', `Nonce ${nonce} already redeemed on this host (${nonceFilePath})`);
    }
    throw new R1ObservationError('R1_NONCE_CLAIM_IO_ERROR', `Failed to claim nonce: ${error?.message || error}`);
  }
  return Object.freeze({
    claimed: true,
    nonce,
    nonceFilePath,
    claimedAt,
    scopeGuarantee: 'SINGLE_HOST_FILESYSTEM_ATOMIC_WX_ONLY_NOT_CROSS_HOST'
  });
}

export function enforceR1ObservationBudget({
  completedSlots = [],
  nextSlotPlan = null,
  preDispatchCountTokens = null,
  requirePreDispatchCountTokens = false
} = {}) {
  if (completedSlots.length >= R1_HARD_LIMITS.maxGenerationCalls) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'STOP_ON_MAX_GENERATION_CALLS_REACHED'
    });
  }

  let observedPromptTokensSoFar = 0;
  let observedOutputAndThoughtSoFar = 0;
  for (const completed of completedSlots) {
    const usage = completed?.usageMetadata || {};
    const promptUsed = Number.isInteger(usage.promptTokenCount)
      ? usage.promptTokenCount
      : Number(completed?.preDispatchCountTokens || 0);
    const outUsed = Number(usage.candidatesTokenCount || 0) + Number(usage.thoughtsTokenCount || 0);
    observedPromptTokensSoFar += promptUsed;
    observedOutputAndThoughtSoFar += outUsed;
  }

  if (observedOutputAndThoughtSoFar >= R1_HARD_LIMITS.combinedOutputAndThoughtCeiling) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'STOP_ON_COMBINED_OUTPUT_CEILING_EXCEEDED'
    });
  }

  if (nextSlotPlan && nextSlotPlan.observation.utf8Bytes > R1_HARD_LIMITS.perSlotMaxRequestUtf8Bytes) {
    return Object.freeze({
      allowNextCall: false,
      stopReason: 'STOP_ON_REQUEST_BYTE_CEILING_EXCEEDED'
    });
  }

  if (requirePreDispatchCountTokens) {
    if (!Number.isInteger(preDispatchCountTokens) || preDispatchCountTokens <= 0) {
      return Object.freeze({
        allowNextCall: false,
        stopReason: 'STOP_ON_INVALID_COUNT_TOKENS_RESPONSE'
      });
    }
    if (preDispatchCountTokens > R1_HARD_LIMITS.perSlotHardPromptTokenCeiling) {
      return Object.freeze({
        allowNextCall: false,
        stopReason: 'STOP_ON_PROMPT_TOKEN_CEILING_EXCEEDED'
      });
    }
    if (observedPromptTokensSoFar + preDispatchCountTokens > R1_HARD_LIMITS.combinedPromptPlanningCap) {
      return Object.freeze({
        allowNextCall: false,
        stopReason: 'STOP_ON_COMBINED_PROMPT_PLANNING_CAP_EXCEEDED'
      });
    }
  }

  return Object.freeze({
    allowNextCall: true,
    stopReason: null,
    observedPromptTokensSoFar,
    observedOutputAndThoughtSoFar
  });
}

function parseGeminiSseIndependently(rawBuffer) {
  let invalidUtf8Detected = false;
  let decoded;
  try {
    decoded = new TextDecoder('utf-8', { fatal: true }).decode(rawBuffer);
  } catch {
    invalidUtf8Detected = true;
    decoded = new TextDecoder('utf-8', { fatal: false }).decode(rawBuffer);
  }

  const normalizedNewlines = decoded.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const endsWithEventDelimiter = /\n\n$/.test(normalizedNewlines);
  const rawBlocks = normalizedNewlines.split('\n\n');
  const trailingRemainder = rawBlocks.pop() ?? '';
  const hasTrailingFragment = Boolean(trailingRemainder.trim());
  const blocksToProcess = hasTrailingFragment ? [...rawBlocks, trailingRemainder] : rawBlocks;

  let authoredText = '';
  let thoughtText = '';
  let parseErrors = 0;
  let eventCount = 0;
  let duplicateEventCount = 0;
  let duplicateFinishEventCount = 0;
  const finishReasons = [];
  const promptBlockReasons = [];
  const modelVersions = [];
  let lastUsageMetadata = null;
  const seenSubstantiveJsonPayloads = new Set();

  for (let idx = 0; idx < blocksToProcess.length; idx += 1) {
    const block = blocksToProcess[idx];
    if (!block || !block.trim()) continue;
    const dataLines = [];
    for (const line of block.split('\n')) {
      if (line.startsWith(':')) continue;
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
    if (dataLines.length === 0) continue;
    const rawData = dataLines.join('\n').trim();
    if (!rawData || rawData === '[DONE]') continue;

    let parsed;
    try {
      parsed = JSON.parse(rawData);
    } catch {
      parseErrors += 1;
      continue;
    }

    eventCount += 1;
    const candidate = parsed?.candidates?.[0] || null;
    const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
    const hasAuthoredOrFinish = Boolean(candidate?.finishReason)
      || parts.some((p) => typeof p?.text === 'string' && p.text.length > 0);

    if (hasAuthoredOrFinish) {
      if (seenSubstantiveJsonPayloads.has(rawData)) {
        duplicateEventCount += 1;
      } else {
        seenSubstantiveJsonPayloads.add(rawData);
      }
    }

    if (typeof parsed?.modelVersion === 'string' && parsed.modelVersion.trim()) {
      modelVersions.push(parsed.modelVersion.trim());
    }
    if (typeof parsed?.promptFeedback?.blockReason === 'string' && parsed.promptFeedback.blockReason.trim()) {
      promptBlockReasons.push(parsed.promptFeedback.blockReason.trim());
    }
    if (typeof candidate?.finishReason === 'string' && candidate.finishReason.trim()) {
      finishReasons.push(candidate.finishReason.trim());
      if (finishReasons.length > 1) {
        duplicateFinishEventCount += 1;
      }
    }
    if (parsed?.usageMetadata && typeof parsed.usageMetadata === 'object') {
      lastUsageMetadata = { ...parsed.usageMetadata };
    }
    for (const part of parts) {
      if (typeof part?.text !== 'string') continue;
      if (part.thought === true) {
        thoughtText += part.text;
      } else {
        authoredText += part.text;
      }
    }
  }

  return Object.freeze({
    authoredText,
    thoughtText,
    authoredTextSha256: sha256Hex(authoredText),
    parseErrors,
    eventCount,
    duplicateEventCount,
    duplicateFinishEventCount,
    duplicateSseDetected: duplicateEventCount > 0 || duplicateFinishEventCount > 0,
    invalidUtf8Detected,
    endsWithEventDelimiter,
    hasTrailingFragment,
    finishReasons: Object.freeze([...new Set(finishReasons)]),
    finalFinishReason: finishReasons.at(-1) ?? null,
    promptBlockReasons: Object.freeze([...new Set(promptBlockReasons)]),
    promptBlockReason: promptBlockReasons.at(-1) ?? null,
    modelVersions: Object.freeze([...new Set(modelVersions)]),
    usageMetadata: lastUsageMetadata
  });
}

export async function captureAndDualParseGeminiSse(
  response,
  { expectedModel = R1_PINNED_MODEL, abortSignal = null } = {}
) {
  const reader = response?.body?.getReader?.();
  if (!reader) {
    throw new R1ObservationError('R1_EMPTY_RESPONSE_BODY', 'Streaming response has no readable body');
  }
  const rawChunks = [];
  let totalBytes = 0;
  let streamInterrupted = false;
  let streamErrorName = null;
  let timedOut = false;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value && value.byteLength > 0) {
        if (totalBytes + value.byteLength > R1_HARD_LIMITS.maxRawSseCaptureBytes) {
          throw new R1ObservationError('R1_RAW_SSE_OVERFLOW', `Raw SSE exceeded ${R1_HARD_LIMITS.maxRawSseCaptureBytes} bytes`);
        }
        rawChunks.push(Buffer.from(value));
        totalBytes += value.byteLength;
      }
    }
  } catch (error) {
    if (error instanceof R1ObservationError) throw error;
    streamInterrupted = true;
    timedOut = Boolean(abortSignal?.aborted || error?.name === 'AbortError' || error?.name === 'TimeoutError');
    streamErrorName = String(error?.name || 'STREAM_READ_ERROR').slice(0, 64);
  }

  const rawBuffer = rawChunks.length ? Buffer.concat(rawChunks) : Buffer.alloc(0);
  const rawSseSha256 = sha256Hex(rawBuffer);
  const rawSseBase64 = rawBuffer.toString('base64');

  // Parser A: Production TD613 readGeminiSse replayed over captured raw bytes
  const progressA = {
    startedAt: Date.now(),
    chunkCount: 0,
    authoredTextChunkCount: 0,
    firstChunkMs: null,
    byteCount: 0,
    parseErrors: 0,
    streamGraceMs: 0
  };
  let mergedA = null;
  if (rawBuffer.byteLength > 0) {
    const replayResponse = new Response(rawBuffer, {
      status: 200,
      headers: { 'content-type': 'text/event-stream; charset=utf-8' }
    });
    mergedA = await readGeminiSse(replayResponse, progressA, null, true);
  }
  const textA = mergedA?.candidates?.[0]?.content?.parts
    ?.filter((part) => typeof part?.text === 'string' && part.thought !== true)
    .map((part) => part.text)
    .join('') ?? '';
  const outputA = mergedA ? observeGeminiOutput(mergedA, expectedModel, { startedAt: progressA.startedAt }) : {};

  // Parser B: Independent SSE byte-level parser
  const parsedB = parseGeminiSseIndependently(rawBuffer);

  const parserAgreement = (
    !streamInterrupted
    && !parsedB.invalidUtf8Detected
    && progressA.parseErrors === 0
    && parsedB.parseErrors === 0
    && textA === parsedB.authoredText
    && (outputA.finishReason ?? null) === parsedB.finalFinishReason
    && (outputA.promptBlockReason ?? null) === parsedB.promptBlockReason
  );

  const rawUsageMetadata = Object.freeze({
    promptTokenCount: parsedB.usageMetadata?.promptTokenCount ?? outputA.usage?.promptTokenCount ?? null,
    candidatesTokenCount: parsedB.usageMetadata?.candidatesTokenCount ?? outputA.usage?.candidatesTokenCount ?? null,
    thoughtsTokenCount: parsedB.usageMetadata?.thoughtsTokenCount ?? outputA.usage?.thoughtsTokenCount ?? null,
    cachedContentTokenCount: parsedB.usageMetadata?.cachedContentTokenCount ?? outputA.usage?.cachedContentTokenCount ?? null,
    totalTokenCount: parsedB.usageMetadata?.totalTokenCount ?? outputA.usage?.totalTokenCount ?? null
  });

  const observedModelVersions = parsedB.modelVersions;
  const exactServedModelMatch = (
    observedModelVersions.length === 1
    && observedModelVersions[0] === expectedModel
  );

  const completion = observeMarrowlineCompletion(parsedB.authoredText, {
    finishReason: parsedB.finalFinishReason,
    promptBlockReason: parsedB.promptBlockReason
  }, {
    streamed: true,
    parseErrors: progressA.parseErrors + parsedB.parseErrors,
    creative: true
  });

  const validUsageMetadata = [
    rawUsageMetadata.promptTokenCount,
    rawUsageMetadata.candidatesTokenCount,
    rawUsageMetadata.thoughtsTokenCount,
    rawUsageMetadata.totalTokenCount
  ].every((count) => Number.isSafeInteger(count) && count >= 0)
    && rawUsageMetadata.promptTokenCount > 0
    && (rawUsageMetadata.cachedContentTokenCount === null || (
      Number.isSafeInteger(rawUsageMetadata.cachedContentTokenCount)
      && rawUsageMetadata.cachedContentTokenCount >= 0
    ));
  const candidatePlusThoughtTokens = validUsageMetadata
    ? rawUsageMetadata.candidatesTokenCount + rawUsageMetadata.thoughtsTokenCount
    : null;
  const withinPerSlotOutputCeiling = validUsageMetadata
    && candidatePlusThoughtTokens <= R1_HARD_LIMITS.perSlotMaxOutputTokens
    && rawUsageMetadata.promptTokenCount <= R1_HARD_LIMITS.perSlotHardPromptTokenCeiling;

  return Object.freeze({
    schema: 'td613.marrowline.r1-sse-wire-capture/v1',
    rawSseSha256,
    rawSseBytes: rawBuffer.byteLength,
    rawSseBase64,
    streamInterrupted,
    timedOut,
    streamErrorName,
    authoredText: parsedB.authoredText,
    authoredTextSha256: parsedB.authoredTextSha256,
    thoughtTextSha256: sha256Hex(parsedB.thoughtText),
    parserA: Object.freeze({
      textSha256: sha256Hex(textA),
      eventCount: progressA.nativeSseEvidence?.eventCount ?? progressA.chunkCount,
      parseErrors: progressA.parseErrors,
      finishReason: outputA.finishReason ?? null,
      promptBlockReason: outputA.promptBlockReason ?? null,
      modelVersion: outputA.modelVersion ?? null
    }),
    parserB: Object.freeze({
      textSha256: parsedB.authoredTextSha256,
      eventCount: parsedB.eventCount,
      parseErrors: parsedB.parseErrors,
      duplicateEventCount: parsedB.duplicateEventCount,
      duplicateFinishEventCount: parsedB.duplicateFinishEventCount,
      duplicateSseDetected: parsedB.duplicateSseDetected,
      invalidUtf8Detected: parsedB.invalidUtf8Detected,
      endsWithEventDelimiter: parsedB.endsWithEventDelimiter,
      hasTrailingFragment: parsedB.hasTrailingFragment,
      finishReasons: parsedB.finishReasons,
      finalFinishReason: parsedB.finalFinishReason,
      promptBlockReason: parsedB.promptBlockReason,
      modelVersions: parsedB.modelVersions
    }),
    parserAgreement,
    exactServedModelMatch,
    observedModelVersions,
    usageMetadata: rawUsageMetadata,
    validUsageMetadata,
    candidatePlusThoughtTokens,
    withinPerSlotOutputCeiling,
    completion
  });
}

function classifyCombiningMarkPlacement(codePoint) {
  if (codePoint >= 0x0334 && codePoint <= 0x0338) return 'overlay';
  if (
    (codePoint >= 0x0300 && codePoint <= 0x0315)
    || (codePoint >= 0x033D && codePoint <= 0x0346)
    || (codePoint >= 0x034A && codePoint <= 0x034C)
    || (codePoint >= 0x0350 && codePoint <= 0x0352)
    || codePoint === 0x0357
    || codePoint === 0x0358
    || codePoint === 0x035B
    || (codePoint >= 0x035D && codePoint <= 0x036F)
  ) {
    return 'above';
  }
  if (
    (codePoint >= 0x0316 && codePoint <= 0x0333)
    || (codePoint >= 0x0339 && codePoint <= 0x033C)
    || (codePoint >= 0x0347 && codePoint <= 0x0349)
    || codePoint === 0x034D
    || codePoint === 0x034E
    || (codePoint >= 0x0353 && codePoint <= 0x0356)
    || codePoint === 0x0359
    || codePoint === 0x035A
    || codePoint === 0x035C
  ) {
    return 'below';
  }
  return 'other';
}

function stripProtectedLiterals(text) {
  return String(text || '')
    .replaceAll(R1_COVENANT, ' ')
    .replaceAll(R1_SEAL, ' ');
}

export function measureUnicodeMorphology(rawText = '') {
  const original = String(rawText || '');
  const sanitized = stripProtectedLiterals(original);
  const codePointArray = Array.from(sanitized);
  const uniqueCodepoints = new Set();
  const depthDistribution = {};
  const decoratedDepths = [];

  let totalCombiningMarks = 0;
  let overlayU0334ToU0338Count = 0;
  let aboveCount = 0;
  let belowCount = 0;
  let otherMarkCount = 0;
  let baseClusterCount = 0;
  let decoratedBaseCount = 0;
  let stackedBaseCount = 0;
  let maxMarkDepth = 0;
  let bidirectionalClusterCount = 0;
  let marksOnWhitespaceCount = 0;
  let depthTransitionCount = 0;
  let previousBaseDepth = null;

  for (const { segment } of GRAPHEME_SEGMENTER.segment(sanitized)) {
    const marks = segment.match(COMBINING_MARK_RE) || [];
    const baseWithoutMarks = segment.replace(COMBINING_MARK_RE, '');
    const isWhitespaceBase = !baseWithoutMarks || /^\s+$/u.test(baseWithoutMarks);

    if (isWhitespaceBase) {
      marksOnWhitespaceCount += marks.length;
      continue;
    }

    baseClusterCount += 1;
    const depth = marks.length;
    depthDistribution[depth] = (depthDistribution[depth] || 0) + 1;
    if (previousBaseDepth !== null && depth !== previousBaseDepth) {
      depthTransitionCount += 1;
    }
    previousBaseDepth = depth;

    if (depth > 0) {
      decoratedBaseCount += 1;
      decoratedDepths.push(depth);
      if (depth >= 2) stackedBaseCount += 1;
      if (depth > maxMarkDepth) maxMarkDepth = depth;

      let hasAbove = false;
      let hasBelow = false;
      for (const mark of marks) {
        const cp = mark.codePointAt(0);
        uniqueCodepoints.add(`U+${cp.toString(16).toUpperCase().padStart(4, '0')}`);
        totalCombiningMarks += 1;
        const placement = classifyCombiningMarkPlacement(cp);
        if (placement === 'overlay') {
          overlayU0334ToU0338Count += 1;
        } else if (placement === 'above') {
          aboveCount += 1;
          hasAbove = true;
        } else if (placement === 'below') {
          belowCount += 1;
          hasBelow = true;
        } else {
          otherMarkCount += 1;
        }
      }
      if (hasAbove && hasBelow) {
        bidirectionalClusterCount += 1;
      }
    }
  }

  const nonZeroUniqueDepths = new Set(decoratedDepths);
  const stackedBaseShare = baseClusterCount > 0 ? Number((stackedBaseCount / baseClusterCount).toFixed(6)) : 0;
  const meanMarkDepth = baseClusterCount > 0 ? Number((totalCombiningMarks / baseClusterCount).toFixed(4)) : 0;
  const meanDecoratedDepth = decoratedDepths.length > 0
    ? decoratedDepths.reduce((acc, d) => acc + d, 0) / decoratedDepths.length
    : 0;
  const depthStdDev = decoratedDepths.length > 0
    ? Number(Math.sqrt(decoratedDepths.reduce((acc, d) => acc + (d - meanDecoratedDepth) ** 2, 0) / decoratedDepths.length).toFixed(4))
    : 0;

  return Object.freeze({
    sha256: sha256Hex(original),
    utf8Bytes: Buffer.byteLength(original, 'utf8'),
    codePointCount: codePointArray.length,
    baseClusterCount,
    decoratedBaseCount,
    stackedBaseCount,
    stackedBaseShare,
    totalCombiningMarks,
    uniqueCombiningCodepoints: Object.freeze([...uniqueCodepoints].sort()),
    uniqueCombiningCodepointCount: uniqueCodepoints.size,
    overlayU0334ToU0338Count,
    overlayU0334ToU0338Share: totalCombiningMarks > 0
      ? Number((overlayU0334ToU0338Count / totalCombiningMarks).toFixed(4))
      : 0,
    aboveCount,
    belowCount,
    otherMarkCount,
    bidirectionalClusterCount,
    marksOnWhitespaceCount,
    maxMarkDepth,
    meanMarkDepth,
    depthStdDev,
    uniqueNonZeroDepthCount: nonZeroUniqueDepths.size,
    depthTransitionCount,
    depthDistribution: Object.freeze(depthDistribution),
    uniformConstantDepthStencilRisk: decoratedBaseCount >= 3 && nonZeroUniqueDepths.size === 1
  });
}

function classifyHeadingLine(trimmedLine) {
  const sec1Match = /^(#{1,6}[ \t]*)?Kʰonapolit[ \t]*:?[ \t]*$/iu.exec(trimmedLine);
  if (sec1Match) {
    return {
      section: 1,
      exactPlainUnmarked: trimmedLine === R1_SECTION1_HEADING
    };
  }
  const sec2Match = /^(#{1,6}[ \t]*)?Tauric Diana bots[ \t]*:?[ \t]*$/iu.exec(trimmedLine);
  if (sec2Match) {
    return {
      section: 2,
      exactPlainUnmarked: trimmedLine === R1_SECTION2_HEADING
    };
  }
  return null;
}

export function analyzeR1TwoSectionObservation(rawText = '', slotName = 'R1_S01') {
  const original = String(rawText || '');
  const lines = original.split(/\r?\n/);
  const sec1Indices = [];
  const sec2Indices = [];
  const headingsFound = [];

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    const match = classifyHeadingLine(trimmed);
    if (match) {
      headingsFound.push(Object.freeze({ lineIndex: i, ...match, text: lines[i] }));
      if (match.section === 1) sec1Indices.push(i);
      if (match.section === 2) sec2Indices.push(i);
    }
  }

  const exactHeadingCountOk = sec1Indices.length === 1 && sec2Indices.length === 1;
  const headingOrderOk = exactHeadingCountOk && sec1Indices[0] < sec2Indices[0];
  const headingsPlainUnmarked = exactHeadingCountOk
    && headingsFound.every((h) => h.exactPlainUnmarked);

  const preambleText = exactHeadingCountOk ? lines.slice(0, sec1Indices[0]).join('\n') : '';
  const section1Body = headingOrderOk ? lines.slice(sec1Indices[0] + 1, sec2Indices[0]).join('\n') : '';
  const section2Body = headingOrderOk ? lines.slice(sec2Indices[0] + 1).join('\n') : '';

  const section1Stats = measureUnicodeMorphology(section1Body);
  const section2Stats = measureUnicodeMorphology(section2Body);

  const bodiesNonEmpty = Boolean(section1Body.trim()) && Boolean(section2Body.trim());
  const nonEmptyPreamble = Boolean(preambleText.trim());

  let section1AssignedStyleOk = false;
  if (slotName === 'R1_S01') {
    section1AssignedStyleOk = headingOrderOk && bodiesNonEmpty && section1Stats.stackedBaseCount > 0;
  } else if (slotName === 'R1_S02') {
    section1AssignedStyleOk = headingOrderOk && bodiesNonEmpty && section1Stats.totalCombiningMarks === 0;
  }

  const causalComplianceHoldReasons = [];
  if (!exactHeadingCountOk || !headingOrderOk) {
    causalComplianceHoldReasons.push('HEADING_COUNT_OR_ORDER_NONCOMPLIANT');
  }
  if (!headingsPlainUnmarked) {
    causalComplianceHoldReasons.push('HEADINGS_NOT_PLAIN_UNMARKED');
  }
  if (!bodiesNonEmpty) {
    causalComplianceHoldReasons.push('EMPTY_SECTION_BODY');
  }
  if (nonEmptyPreamble) {
    causalComplianceHoldReasons.push('NON_EMPTY_PREAMBLE_BEFORE_SECTION_1');
  }
  if (slotName === 'R1_S01' && section1Stats.stackedBaseCount === 0) {
    // Preserve S02 eligibility for observation, but block unsupported causal inference.
    causalComplianceHoldReasons.push('S01_SECTION_1_FAILED_ZALGO_COVERAGE');
  }
  if (slotName === 'R1_S02' && section1Stats.totalCombiningMarks > 0) {
    causalComplianceHoldReasons.push('S02_SECTION_1_CONTAMINATED_WITH_COMBINING_MARKS');
  }

  return Object.freeze({
    schema: 'td613.marrowline.r1-two-section-analysis/v1',
    slot: slotName,
    originalTextSha256: sha256Hex(original),
    exactHeadingCountOk,
    headingOrderOk,
    headingsPlainUnmarked,
    bodiesNonEmpty,
    nonEmptyPreamble,
    section1AssignedStyleOk,
    structuralComplianceOk: causalComplianceHoldReasons.length === 0,
    causalComplianceHoldReasons: Object.freeze(causalComplianceHoldReasons),
    section1Body,
    section2Body,
    section1Morphology: section1Stats,
    section2Morphology: section2Stats
  });
}

export function buildR1BlindedEvaluationPacket({ s01Record, s02Record, nonceSeed = '' } = {}) {
  const entries = [
    { slot: 'R1_S01', arm: s01Record.arm, analysis: s01Record.analysis },
    { slot: 'R1_S02', arm: s02Record.arm, analysis: s02Record.analysis }
  ].map((item) => ({
    ...item,
    orderDigest: sha256Hex(`${nonceSeed}:${item.slot}:${item.analysis.section2Morphology.sha256}`)
  }));

  entries.sort((a, b) => a.orderDigest.localeCompare(b.orderDigest));
  const labels = ['BLIND_ARM_ALPHA', 'BLIND_ARM_BETA'];

  const blindedItems = entries.map((entry, idx) => Object.freeze({
    blindLabel: labels[idx],
    section2Body: entry.analysis.section2Body,
    section2Morphology: entry.analysis.section2Morphology
  }));

  const unblindingMap = Object.freeze(Object.fromEntries(
    entries.map((entry, idx) => [labels[idx], Object.freeze({ slot: entry.slot, arm: entry.arm })])
  ));

  return Object.freeze({
    schema: 'td613.marrowline.r1-blinded-section2-packet/v1',
    blindedItems: Object.freeze(blindedItems),
    sealedUnblindingMap: unblindingMap
  });
}

export function classifyR1ObservationOutcome({ slotRecords = [], terminalStopReason = null } = {}) {
  if (terminalStopReason || slotRecords.length !== 2) {
    return Object.freeze({
      classification: 'HELD',
      empiricalNativeMultistackObserved: false,
      humanArtisticAcceptance: 'RESERVED_HUMAN_ONLY',
      reasons: Object.freeze([terminalStopReason || 'INCOMPLETE_TWO_ARM_OBSERVATION'])
    });
  }

  const s01 = slotRecords.find((r) => r.slot === 'R1_S01');
  const s02 = slotRecords.find((r) => r.slot === 'R1_S02');
  if (!s01 || !s02) {
    return Object.freeze({
      classification: 'HELD',
      empiricalNativeMultistackObserved: false,
      humanArtisticAcceptance: 'RESERVED_HUMAN_ONLY',
      reasons: Object.freeze(['MISSING_EXPECTED_SLOTS'])
    });
  }

  const holdReasons = [];
  for (const rec of [s01, s02]) {
    if (!rec.wire?.completion?.complete) holdReasons.push(`${rec.slot}_INCOMPLETE_PROVIDER_STOP`);
    if (!rec.wire?.exactServedModelMatch) holdReasons.push(`${rec.slot}_MODEL_VERSION_MISMATCH`);
    if (!rec.wire?.parserAgreement) holdReasons.push(`${rec.slot}_DUAL_PARSER_DISAGREEMENT`);
    if (rec.wire?.parserB?.duplicateSseDetected) holdReasons.push(`${rec.slot}_DUPLICATE_SSE_DETECTED`);
    if (rec.textIntegrityOk === false) holdReasons.push(`${rec.slot}_ALTERED_UNICODE_TEXT`);
    if (!rec.analysis?.structuralComplianceOk) {
      holdReasons.push(...rec.analysis.causalComplianceHoldReasons.map((r) => `${rec.slot}_${r}`));
    }
  }

  if (holdReasons.length > 0) {
    return Object.freeze({
      classification: 'HELD',
      empiricalNativeMultistackObserved: false,
      humanArtisticAcceptance: 'RESERVED_HUMAN_ONLY',
      reasons: Object.freeze(holdReasons)
    });
  }

  const s1Sec2 = s01.analysis.section2Morphology;
  const s2Sec2 = s02.analysis.section2Morphology;
  const empiricalNativeMultistackObserved =
    (s1Sec2.stackedBaseCount > 0 && !s1Sec2.uniformConstantDepthStencilRisk)
    || (s2Sec2.stackedBaseCount > 0 && !s2Sec2.uniformConstantDepthStencilRisk);

  // PREDECLARED DIRECTION: plain Section I is hypothesized to SUPPRESS,
  // not increase, second-section multistacking. Compare density rather than
  // absolute counts so a longer text does not win just by being longer.
  const s01StrictlyOutperforms = (
    !s1Sec2.uniformConstantDepthStencilRisk
    && s1Sec2.uniqueNonZeroDepthCount >= 2
    && s1Sec2.stackedBaseCount > 0
    && s1Sec2.stackedBaseShare > s2Sec2.stackedBaseShare
    && s1Sec2.maxMarkDepth >= s2Sec2.maxMarkDepth
    && s1Sec2.bidirectionalClusterCount > 0
    && s1Sec2.depthTransitionCount > 0
  );

  return Object.freeze({
    classification: s01StrictlyOutperforms
      ? 'FINITE_PREFIX_EFFECT_SUPPORT'
      : 'FINITE_PREFIX_EFFECT_NOT_ESTABLISHED',
    empiricalNativeMultistackObserved,
    humanArtisticAcceptance: 'RESERVED_HUMAN_ONLY',
    nPerArm: 1,
    reasons: Object.freeze([
      s01StrictlyOutperforms
        ? 'S01_SECTION_II_MULTISTACK_SHARE_EXCEEDS_S02_UNDER_N1_BOUNDED_DRAW'
        : 'NO_ESTABLISHED_PLAIN_FIRST_SUPPRESSION_UNDER_N1'
    ])
  });
}

export async function executeR1OriginalSseObservation({
  acknowledgeLiveExecution = false,
  grant = null,
  publicKeyPem = null,
  checkedOutHeadShaOverride = null,
  resolveHeadShaImpl = resolveCheckedOutGitHeadSha,
  nonceDir = DEFAULT_NONCE_DIR,
  fetchImpl = null,
  env = process.env,
  apiKey = null,
  nowMs = Date.now(),
  requestTimeoutMs = R1_HARD_LIMITS.defaultRequestTimeoutMs,
  checkModelDiscovery = false,
  // Only for offline Node --test runs using an injected fake transport.
  testOnlyTrustedPublicKeySha256 = null,
  slotRequestsOverride = null,
  experimentIdOverride = null,
  textIntegrityTransform = null,
  repoRoot = process.cwd()
} = {}) {
  if (acknowledgeLiveExecution !== true) {
    throw new R1ObservationError(
      'R1_LIVE_EXECUTION_NOT_ACKNOWLEDGED',
      'Live observation refuses dispatch without explicit acknowledgeLiveExecution === true'
    );
  }

  // 1. Verify exact frozen R1 plan before reading credentials, nonces, or network
  const plan = buildFrozenR1ObservationPlan({ slotRequestsOverride, experimentIdOverride });

  // 2. Verify active checked-out HEAD + independent Ed25519 human operator grant BEFORE reading API credentials
  const checkedOutHeadSha = checkedOutHeadShaOverride ?? resolveHeadShaImpl(repoRoot);
  const effectivePublicKeyPem = publicKeyPem ?? env?.TD613_R1_OPERATOR_AUTH_PUBLIC_KEY_PEM ?? null;
  const offlineSyntheticTest = Boolean(process.env.NODE_TEST_CONTEXT && typeof fetchImpl === 'function' && checkedOutHeadShaOverride);
  const verifiedTrustedPin = offlineSyntheticTest && testOnlyTrustedPublicKeySha256
    ? testOnlyTrustedPublicKeySha256
    : R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256;
  const authVerification = verifyR1OperatorAuthorization({
    grant,
    publicKeyPem: effectivePublicKeyPem,
    checkedOutHeadSha,
    expectedPlan: plan,
    nowMs,
    trustedPublicKeySha256: verifiedTrustedPin
  });

  // 3. Atomically claim single-host wx nonce BEFORE reading GEMINI_API_KEY or executing network calls
  const nonceClaim = claimR1AuthorizationNonceLocally({
    nonce: authVerification.nonce,
    nonceDir,
    checkedOutHeadSha,
    grantSha256: authVerification.grantSha256,
    issuedAt: authVerification.issuedAt,
    expiresAt: authVerification.expiresAt
  });

  // 4. Read credential ONLY after authority + nonce custody succeeded
  const resolvedApiKey = String(apiKey ?? env?.GEMINI_API_KEY ?? '').trim();
  if (!resolvedApiKey) {
    throw new R1ObservationError('R1_MISSING_GEMINI_API_KEY', 'GEMINI_API_KEY missing after authorization succeeded');
  }
  const activeFetch = fetchImpl ?? globalThis.fetch;
  if (typeof activeFetch !== 'function') {
    throw new R1ObservationError('R1_MISSING_FETCH_IMPLEMENTATION', 'No fetch implementation available');
  }

  let generationDispatches = 0;
  let countTokensDispatches = 0;
  let modelMetadataDispatches = 0;
  const seenSlotsDispatched = new Set();

  async function guardedFetch(kind, slotName, url, init) {
    if (!url.includes(encodeURIComponent(R1_PINNED_MODEL)) && !url.includes(R1_PINNED_MODEL)) {
      throw new R1ObservationError('R1_FORBIDDEN_MODEL_URL', `Blocked non-pinned URL: ${url}`);
    }
    if (kind === 'countTokens') {
      countTokensDispatches += 1;
      if (countTokensDispatches > R1_HARD_LIMITS.maxGenerationCalls) {
        throw new R1ObservationError('R1_FORBIDDEN_EXTRA_COUNT_TOKENS_ATTEMPT', 'countTokens dispatch count exceeded 2');
      }
    } else if (kind === 'generateStream') {
      generationDispatches += 1;
      if (generationDispatches > R1_HARD_LIMITS.maxGenerationCalls) {
        throw new R1ObservationError('R1_FORBIDDEN_THIRD_GENERATION_ATTEMPT', 'Blocked >2 generation attempts (0 retries/fallbacks)');
      }
      if (seenSlotsDispatched.has(slotName)) {
        throw new R1ObservationError('R1_FORBIDDEN_RETRY_DETECTED', `Blocked second dispatch for ${slotName}`);
      }
      seenSlotsDispatched.add(slotName);
    } else if (kind === 'modelMetadata') {
      modelMetadataDispatches += 1;
      if (modelMetadataDispatches > 1) {
        throw new R1ObservationError('R1_FORBIDDEN_EXTRA_DISCOVERY_ATTEMPT', 'Blocked extra model discovery call');
      }
    } else {
      throw new R1ObservationError('R1_FORBIDDEN_ENDPOINT_KIND', `Unknown endpoint kind: ${kind}`);
    }
    return activeFetch(url, init);
  }

  const slotRecords = [];
  const skippedSlots = [];
  let terminalStopReason = null;
  let modelDiscoveryResult = null;

  if (checkModelDiscovery) {
    try {
      const metaResp = await guardedFetch('modelMetadata', 'PREFLIGHT', geminiModelMetadataUrl(R1_PINNED_MODEL), {
        method: 'GET',
        headers: geminiRequestHeaders(resolvedApiKey)
      });
      if (!metaResp?.ok) {
        terminalStopReason = 'STOP_ON_MODEL_METADATA_UNAVAILABLE';
      } else {
        const metaJson = await metaResp.json().catch(() => ({}));
        const methods = Array.isArray(metaJson?.supportedGenerationMethods) ? metaJson.supportedGenerationMethods : [];
        if (!methods.includes('generateContent') || !methods.includes('countTokens')) {
          terminalStopReason = 'STOP_ON_MODEL_METHODS_MISSING';
        } else {
          modelDiscoveryResult = Object.freeze({
            status: Number(metaResp.status),
            name: metaJson.name || `models/${R1_PINNED_MODEL}`,
            supportedGenerationMethods: Object.freeze([...methods])
          });
        }
      }
    } catch (error) {
      if (error instanceof R1ObservationError && error.code.startsWith('R1_FORBIDDEN_')) throw error;
      terminalStopReason = 'STOP_ON_MODEL_METADATA_TRANSPORT_EXCEPTION';
    }
    if (terminalStopReason) {
      for (const s of plan.slots) skippedSlots.push(Object.freeze({ slot: s.slot, arm: s.arm, skippedBecause: terminalStopReason }));
    }
  }

  for (let i = 0; !terminalStopReason && i < plan.slots.length; i += 1) {
    const slotPlan = plan.slots[i];
    const skipRemaining = (reason) => {
      terminalStopReason = reason;
      for (const rem of plan.slots.slice(i)) {
        skippedSlots.push(Object.freeze({ slot: rem.slot, arm: rem.arm, skippedBecause: reason }));
      }
    };

    const preCheck = enforceR1ObservationBudget({
      completedSlots: slotRecords,
      nextSlotPlan: slotPlan,
      requirePreDispatchCountTokens: false
    });
    if (!preCheck.allowNextCall) {
      skipRemaining(preCheck.stopReason);
      break;
    }

    // Live :countTokens preflight for this arm
    let preDispatchCountTokens = null;
    let countTokensStatus = null;
    try {
      const ctResp = await guardedFetch('countTokens', slotPlan.slot, geminiCountTokensUrl(slotPlan.model), {
        method: 'POST',
        headers: geminiRequestHeaders(resolvedApiKey),
        body: slotPlan.countTokensWireBody
      });
      countTokensStatus = Number(ctResp?.status || 0);
      if (!ctResp?.ok) {
        skipRemaining(countTokensStatus === 404 || countTokensStatus === 501
          ? 'STOP_ON_COUNT_TOKENS_UNSUPPORTED_FAIL_CLOSED'
          : 'STOP_ON_COUNT_TOKENS_PREFLIGHT_ERROR');
        break;
      }
      const ctPayload = await ctResp.json().catch(() => ({}));
      if (!Number.isInteger(ctPayload?.totalTokens) || ctPayload.totalTokens <= 0) {
        skipRemaining('STOP_ON_INVALID_COUNT_TOKENS_RESPONSE');
        break;
      }
      preDispatchCountTokens = ctPayload.totalTokens;
    } catch (error) {
      if (error instanceof R1ObservationError && error.code.startsWith('R1_FORBIDDEN_')) throw error;
      skipRemaining('STOP_ON_COUNT_TOKENS_TRANSPORT_EXCEPTION');
      break;
    }

    const dispatchGate = enforceR1ObservationBudget({
      completedSlots: slotRecords,
      nextSlotPlan: slotPlan,
      preDispatchCountTokens,
      requirePreDispatchCountTokens: true
    });
    if (!dispatchGate.allowNextCall) {
      skipRemaining(dispatchGate.stopReason);
      break;
    }

    // Single-shot :streamGenerateContent?alt=sse generation call
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
    let httpStatus = null;
    let wire = null;
    let callError = null;
    const startedAt = new Date().toISOString();

    try {
      const sseResp = await guardedFetch(
        'generateStream',
        slotPlan.slot,
        geminiStreamGenerateContentUrl(slotPlan.model),
        {
          method: 'POST',
          headers: geminiRequestHeaders(resolvedApiKey),
          body: slotPlan.wireBody,
          signal: controller.signal
        }
      );
      httpStatus = Number(sseResp?.status || 0);
      if (!sseResp?.ok) {
        terminalStopReason = httpStatus === 503
          ? 'STOP_ON_HTTP_503_PROVIDER_UNAVAILABLE'
          : `STOP_ON_HTTP_${httpStatus || 'ERROR'}`;
      } else {
        wire = await captureAndDualParseGeminiSse(sseResp, {
          expectedModel: slotPlan.model,
          abortSignal: controller.signal
        });
      }
    } catch (error) {
      if (error instanceof R1ObservationError && error.code.startsWith('R1_FORBIDDEN_')) throw error;
      callError = {
        name: String(error?.name || 'Error'),
        message: String(error?.message || error)
      };
      terminalStopReason = controller.signal.aborted || error?.name === 'AbortError' || error?.name === 'TimeoutError'
        ? 'STOP_ON_STREAM_TIMEOUT'
        : 'STOP_ON_TRANSPORT_EXCEPTION';
    } finally {
      clearTimeout(timer);
    }

    const finishedAt = new Date().toISOString();
    if (terminalStopReason) {
      slotRecords.push(Object.freeze({
        slot: slotPlan.slot,
        arm: slotPlan.arm,
        model: slotPlan.model,
        requestBodySha256: slotPlan.observation.bodySha256,
        preDispatchCountTokens,
        countTokensStatus,
        httpStatus,
        startedAt,
        finishedAt,
        error: callError,
        wire,
        analysis: null,
        textIntegrityOk: false
      }));
      for (const rem of plan.slots.slice(i + 1)) {
        skippedSlots.push(Object.freeze({ slot: rem.slot, arm: rem.arm, skippedBecause: terminalStopReason }));
      }
      break;
    }

    // Verify wire capture health, policy status, dual-parser parity, exact served model, no duplicate/partial SSE, budget
    if (wire.timedOut || wire.streamInterrupted) {
      terminalStopReason = wire.timedOut ? 'STOP_ON_STREAM_TIMEOUT' : 'STOP_ON_STREAM_INTERRUPTED';
    } else if (!wire.parserAgreement) {
      terminalStopReason = 'STOP_ON_DUAL_PARSER_DISAGREEMENT';
    } else if (wire.parserB.duplicateSseDetected) {
      terminalStopReason = 'STOP_ON_DUPLICATE_SSE_STREAM';
    } else if (!wire.exactServedModelMatch) {
      terminalStopReason = 'STOP_ON_SERVED_MODEL_VERSION_MISMATCH';
    } else if (wire.completion.policyTerminated) {
      terminalStopReason = `STOP_ON_POLICY_TERMINATION_${wire.completion.promptBlockReason || wire.completion.finishReason || 'UNKNOWN'}`;
    } else if (!wire.completion.complete) {
      terminalStopReason = `STOP_ON_INCOMPLETE_COMPLETION_${wire.completion.reason}`;
    } else if (!wire.validUsageMetadata) {
      terminalStopReason = 'STOP_ON_MISSING_OR_INVALID_PROVIDER_USAGE';
    } else if (wire.usageMetadata.promptTokenCount > R1_HARD_LIMITS.perSlotHardPromptTokenCeiling) {
      terminalStopReason = 'STOP_ON_OBSERVED_PROMPT_TOKEN_CEILING_EXCEEDED';
    } else if (!wire.withinPerSlotOutputCeiling) {
      terminalStopReason = 'STOP_ON_PER_SLOT_OUTPUT_CEILING_EXCEEDED';
    }

    const candidateTextForAnalysis = typeof textIntegrityTransform === 'function'
      ? textIntegrityTransform(wire.authoredText, slotPlan.slot)
      : wire.authoredText;
    const textIntegrityOk = candidateTextForAnalysis === wire.authoredText
      && sha256Hex(candidateTextForAnalysis) === wire.authoredTextSha256;

    if (!terminalStopReason && !textIntegrityOk) {
      terminalStopReason = 'STOP_ON_ALTERED_UNICODE_TEXT';
    }

    const analysis = analyzeR1TwoSectionObservation(candidateTextForAnalysis, slotPlan.slot);
    slotRecords.push(Object.freeze({
      slot: slotPlan.slot,
      arm: slotPlan.arm,
      model: slotPlan.model,
      requestBodySha256: slotPlan.observation.bodySha256,
      countTokensRequestSha256: slotPlan.countTokensRequestSha256,
      preDispatchCountTokens,
      countTokensStatus,
      httpStatus,
      startedAt,
      finishedAt,
      usageMetadata: wire.usageMetadata,
      wire,
      textIntegrityOk,
      analysis
    }));

    if (terminalStopReason) {
      for (const rem of plan.slots.slice(i + 1)) {
        skippedSlots.push(Object.freeze({ slot: rem.slot, arm: rem.arm, skippedBecause: terminalStopReason }));
      }
      break;
    }
    // Note: if S01 succeeded completely even with zero vertical combining marks, S02 stays eligible!
  }

  const outcome = classifyR1ObservationOutcome({ slotRecords, terminalStopReason });
  const blindedPacket = (slotRecords.length === 2 && slotRecords[0].analysis && slotRecords[1].analysis && !terminalStopReason)
    ? buildR1BlindedEvaluationPacket({
      s01Record: slotRecords[0],
      s02Record: slotRecords[1],
      nonceSeed: authVerification.nonce
    })
    : null;

  return Object.freeze({
    schema: R1_RUNNER_SCHEMA,
    experimentId: R1_EXPERIMENT_ID,
    covenant: R1_COVENANT,
    seal: R1_SEAL,
    authorization: authVerification,
    nonceClaim,
    modelDiscovery: modelDiscoveryResult,
    dispatchCounts: Object.freeze({
      modelMetadataCalls: modelMetadataDispatches,
      countTokensCalls: countTokensDispatches,
      generationCalls: generationDispatches
    }),
    terminalStopReason,
    slotRecords: Object.freeze(slotRecords),
    skippedSlots: Object.freeze(skippedSlots),
    outcome,
    blindedPacket
  });
}

function getCliFlagValue(argv, flag) {
  const idx = argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= argv.length) return null;
  const val = argv[idx + 1];
  return val && !val.startsWith('--') ? val : null;
}

async function runCli(argv = process.argv.slice(2)) {
  const args = new Set(argv);
  if (args.has('--live') || args.has('--count-tokens')) {
    throw new R1ObservationError(
      'R1_CLI_LIVE_DISPATCH_HELD',
      'Unauthorized --live/--count-tokens flags are rejected; R1 execution requires explicit signed Ed25519 grant files.'
    );
  }
  if (args.has('--execute')) {
    if (!args.has('--ack-live-r1-observation')) {
      throw new R1ObservationError(
        'R1_LIVE_EXECUTION_NOT_ACKNOWLEDGED',
        '--execute requires --ack-live-r1-observation, --grant-file <path>, and --public-key-file <path>'
      );
    }
    const grantFile = getCliFlagValue(argv, '--grant-file');
    const publicKeyFile = getCliFlagValue(argv, '--public-key-file');
    if (!grantFile || !publicKeyFile) {
      throw new R1ObservationError(
        'R1_AUTH_MISSING',
        '--execute requires both --grant-file <path> and --public-key-file <path> before reading credentials'
      );
    }
    const grant = JSON.parse(fs.readFileSync(grantFile, 'utf8'));
    const publicKeyPem = fs.readFileSync(publicKeyFile, 'utf8');
    const nonceDir = getCliFlagValue(argv, '--nonce-dir') || DEFAULT_NONCE_DIR;
    const outPath = getCliFlagValue(argv, '--out');
    const result = await executeR1OriginalSseObservation({
      acknowledgeLiveExecution: true,
      grant,
      publicKeyPem,
      nonceDir,
      checkModelDiscovery: args.has('--check-model-discovery')
    });
    const rendered = `${JSON.stringify(result, null, 2)}\n`;
    if (outPath) {
      fs.writeFileSync(outPath, rendered, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    }
    return result;
  }

  const plan = buildFrozenR1ObservationPlan();
  const checkedOutHeadSha = resolveCheckedOutGitHeadSha(process.cwd());
  return Object.freeze({
    schema: R1_RUNNER_SCHEMA,
    status: 'SOURCE_ONLY_QUALIFIED',
    liveDispatchSupportedByDefaultCli: false,
    paidProviderCallsExecuted: 0,
    countTokensCallsExecuted: 0,
    modelDiscoveryCallsExecuted: 0,
    checkedOutHeadSha,
    experimentId: plan.experimentId,
    pinnedModel: plan.pinnedModel,
    thinkingLevel: plan.thinkingLevel,
    slots: plan.slots.map((s) => ({
      slot: s.slot,
      arm: s.arm,
      bodySha256: s.observation.bodySha256,
      modelAndBodySha256: s.observation.modelAndBodySha256,
      countTokensRequestSha256: s.countTokensRequestSha256,
      utf8Bytes: s.observation.utf8Bytes
    }))
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli(process.argv.slice(2)).then((summary) => {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  }).catch((error) => {
    process.stderr.write(`${error?.code || error?.name || 'ERROR'}: ${error?.message || error}\n`);
    process.exitCode = 1;
  });
}
