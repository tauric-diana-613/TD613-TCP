// TD613 · The Screaming Grove · R1 Provider-Native Uncapped Observation Core
// Commission: TD613-MARROWLINE-R1-NO-ARTIFICIAL-CEILINGS-20261122
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// SECURITY SEPARATION PROOF:
// This core module contains ZERO references to `globalThis.fetch` and ZERO `child_process`
// calls. Network transport, active git HEAD resolution, and pinned trust fingerprint MUST be
// supplied by the caller. The production executable binds `TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = null`,
// real `globalThis.fetch`, and real `git rev-parse HEAD` with zero override parameters.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  geminiRequestHeaders,
  geminiStreamGenerateContentUrl
} from '../../server/gemini-provider-transport.js';
import {
  POLICY_NONSTOP_FINISH_REASONS,
  observeMarrowlineCompletion
} from '../../server/marrowline-completion.js';
import { serializeGeminiRequest } from '../../server/khonapolit-quality.js';
import {
  R1_SECTION_COVERAGE_CLAUSE_BOTH,
  R1_SECTION_COVERAGE_CLAUSE_PLAIN_FIRST
} from '../marrowline-hydrogen-handoff-20261122/hydrogen-next-experiment-preflight.mjs';
import {
  R1_NATIVE_COVENANT,
  R1_NATIVE_PINNED_MODEL,
  R1_NATIVE_SEAL,
  R1_NATIVE_THINKING_LEVEL,
  R1_PROVIDER_NATIVE_EXPERIMENT_ID,
  buildProviderNativeCountTokensRequest,
  buildProviderNativeR1Requests,
  buildProviderNativeWireManifest,
  sha256Hex
} from './r1-provider-native-preflight.mjs';

export const R1_NATIVE_RUNNER_SCHEMA = 'td613.marrowline.r1-provider-native-observation/v1';
export const R1_NATIVE_GRANT_SCHEMA = 'td613.marrowline.r1-provider-native-authorization/v1-ed25519';
export const R1_NATIVE_AUTH_DOMAIN_SEPARATOR = 'TD613_R1_NATIVE_AUTH_V1';
export const R1_NATIVE_SECTION1_HEADING = 'Kʰonapolit';
export const R1_NATIVE_SECTION2_HEADING = 'Tauric Diana bots';
export const MAX_FUTURE_ISSUED_SKEW_MS = 60 * 1000;
export const STREAM_READBACK_CHUNK_BYTES = 64 * 1024;

// Frozen provider-native condition digests (maxOutputTokens omitted cleanly)
export const FROZEN_PROVIDER_NATIVE_CONDITIONS = Object.freeze({
  R1_NATIVE_A: Object.freeze({
    arm: 'R1_TWO_HEADINGS_ZALGO_BOTH',
    bodySha256: 'b4e1e7598fe1ff38221e47be3e63492e6fa7890d910df12f8d870b2bbadef46f',
    modelAndBodySha256: '044467bcaa2482fac644e0e05b993dffb830639727bd6470df7de82187a68bbd',
    systemInstructionSha256: '78df5f9b5ad6ceefa8ce10071b40194e8ace56226fefef186ba4e1e5c7a1079c',
    contentsSha256: 'e056b75319141b145903441d1156bbf4f7fa3f15e14de5dd007cf812d8486998',
    generationConfigSha256: '425eee5014c42dcb66bb7553a9381935f97bb4eb87f61d335f9bfca6dc6fead5',
    countTokensRequestSha256: 'dc67f8f279f647b47e30c39c87b14df0348770944802e1313465faf4f360c330',
    utf8Bytes: 1746
  }),
  R1_NATIVE_B: Object.freeze({
    arm: 'R1_TWO_HEADINGS_PLAIN_FIRST',
    bodySha256: '257be8467d5d827e8ac1a20f29beb56f1627f4603a84c9ccfdcbaadeb14e51f6',
    modelAndBodySha256: '96220184f79f4eae1436944e8ad4fb92f7a74166c4994febeada1eb4b176fdf3',
    systemInstructionSha256: '7c48aeda766e4e10c63b048f6cee990ec126baac8f5cd419769e410d0ca0274b',
    contentsSha256: 'e056b75319141b145903441d1156bbf4f7fa3f15e14de5dd007cf812d8486998',
    generationConfigSha256: '425eee5014c42dcb66bb7553a9381935f97bb4eb87f61d335f9bfca6dc6fead5',
    countTokensRequestSha256: 'e34cbd9ab2bde2e505deb03744029a11411cb5ee357289a285e7ccd957a646b9',
    utf8Bytes: 1912
  })
});

export const FORBIDDEN_CEILING_GRANT_FIELDS = Object.freeze([
  'maxCalls',
  'maxAttempts',
  'maxEpisodes',
  'retriesPermitted',
  'maxOutputTokens',
  'perSlotMaxOutputTokens',
  'perSlotHardPromptTokenCeiling',
  'combinedPromptPlanningCap',
  'combinedOutputAndThoughtCeiling',
  'perSlotMaxRequestUtf8Bytes',
  'maxUsdCeiling',
  'spendingUsdCeiling',
  'requestTimeoutMs',
  'maxDurationMs',
  'maxRawSseCaptureBytes'
]);

const GRAPHEME_SEGMENTER = new Intl.Segmenter('en', { granularity: 'grapheme' });
const COMBINING_MARK_RE = /\p{M}/gu;

export class R1ProviderNativeError extends Error {
  constructor(code, message, details = null) {
    super(message || code);
    this.name = 'R1ProviderNativeError';
    this.code = String(code || 'R1_PROVIDER_NATIVE_ERROR');
    this.details = details;
  }
}

export function canonicalJson(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new R1ProviderNativeError('R1_CANONICAL_JSON_NON_FINITE_NUMBER', 'Non-finite number in canonical JSON');
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
        throw new R1ProviderNativeError('R1_CANONICAL_JSON_UNDEFINED', `Undefined key in canonical JSON: ${key}`);
      }
      parts.push(`${JSON.stringify(key)}:${canonicalJson(value[key])}`);
    }
    return `{${parts.join(',')}}`;
  }
  throw new R1ProviderNativeError('R1_CANONICAL_JSON_UNSUPPORTED_TYPE', `Unsupported type in canonical JSON: ${typeof value}`);
}

export function canonicalizeProviderNativeAuthorizationPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new R1ProviderNativeError('R1_AUTH_MALFORMED', 'Authorization payload must be a non-null JSON object');
  }
  return `${R1_NATIVE_AUTH_DOMAIN_SEPARATOR}\n${canonicalJson(payload)}`;
}

export function geminiModelMetadataUrl(model = R1_NATIVE_PINNED_MODEL) {
  const normalized = String(model || '').replace(/^models\//, '').trim();
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalized)}`;
}

export function geminiCountTokensUrl(model = R1_NATIVE_PINNED_MODEL) {
  const normalized = String(model || '').replace(/^models\//, '').trim();
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalized)}:countTokens`;
}

export function buildProviderNativeConditionPlans({
  conditionRequestsOverride = null,
  experimentIdOverride = null
} = {}) {
  const effectiveExperimentId = experimentIdOverride ?? R1_PROVIDER_NATIVE_EXPERIMENT_ID;
  if (effectiveExperimentId !== R1_PROVIDER_NATIVE_EXPERIMENT_ID) {
    throw new R1ProviderNativeError(
      'R1_FORBIDDEN_EXPERIMENT_ID',
      `Only successor experiment ${R1_PROVIDER_NATIVE_EXPERIMENT_ID} is permitted; received ${effectiveExperimentId}`
    );
  }

  const manifest = buildProviderNativeWireManifest();
  const rawRequests = buildProviderNativeR1Requests();
  const candidates = conditionRequestsOverride ?? [
    {
      condition: 'R1_NATIVE_A',
      arm: FROZEN_PROVIDER_NATIVE_CONDITIONS.R1_NATIVE_A.arm,
      model: R1_NATIVE_PINNED_MODEL,
      request: rawRequests.R1_NATIVE_A
    },
    {
      condition: 'R1_NATIVE_B',
      arm: FROZEN_PROVIDER_NATIVE_CONDITIONS.R1_NATIVE_B.arm,
      model: R1_NATIVE_PINNED_MODEL,
      request: rawRequests.R1_NATIVE_B
    }
  ];

  if (!Array.isArray(candidates) || candidates.length !== 2) {
    throw new R1ProviderNativeError('R1_INVALID_CONDITION_PAIR', 'Unbounded successor still compares exact 2 experimental conditions (A and B)');
  }
  if (candidates[0]?.condition !== 'R1_NATIVE_A' || candidates[1]?.condition !== 'R1_NATIVE_B') {
    throw new R1ProviderNativeError('R1_FORBIDDEN_CONDITION_OR_ARM', 'Conditions must be exact R1_NATIVE_A and R1_NATIVE_B');
  }

  const preparedByCondition = {};
  for (let i = 0; i < candidates.length; i += 1) {
    const entry = candidates[i];
    const frozen = FROZEN_PROVIDER_NATIVE_CONDITIONS[entry.condition];
    const manifestCond = manifest.conditions[i];

    if (!entry.request || typeof entry.request !== 'object') {
      throw new R1ProviderNativeError('R1_MISSING_REQUEST_OBJECT', `Missing request object for ${entry.condition}`);
    }
    if (entry.arm !== frozen.arm) {
      throw new R1ProviderNativeError('R1_FORBIDDEN_CONDITION_OR_ARM', `Unexpected arm ${entry.arm} for ${entry.condition}`);
    }
    if (entry.model !== R1_NATIVE_PINNED_MODEL) {
      throw new R1ProviderNativeError('R1_MODEL_MISMATCH', `Pinned model ${R1_NATIVE_PINNED_MODEL} required; received ${entry.model}`);
    }
    if (Object.hasOwn(entry.request.generationConfig || {}, 'maxOutputTokens')) {
      throw new R1ProviderNativeError('R1_FORBIDDEN_HIDDEN_MAX_OUTPUT_TOKENS', `${entry.condition} must not embed hidden maxOutputTokens`);
    }

    const userText = entry.request?.contents?.[0]?.parts?.[0]?.text || '';
    if (userText.includes('Do not use Markdown or headings.') || userText.includes('entire passage')) {
      throw new R1ProviderNativeError('R1_CONTENTS_CONTRADICTION_DETECTED', `Forbidden contradiction in ${entry.condition}`);
    }

    const serialized = serializeGeminiRequest(entry.request, entry.model);
    if (serialized.body.includes('maxOutputTokens')) {
      throw new R1ProviderNativeError('R1_FORBIDDEN_HIDDEN_MAX_OUTPUT_TOKENS', `Serialized body for ${entry.condition} contains forbidden maxOutputTokens`);
    }
    const countTokensReq = buildProviderNativeCountTokensRequest(entry.request, entry.model);
    const countTokensWireBody = JSON.stringify(countTokensReq);
    const countTokensRequestSha256 = sha256Hex(countTokensWireBody);

    if (serialized.observation.generationConfigSha256 !== frozen.generationConfigSha256) {
      throw new R1ProviderNativeError('R1_CONFIG_DRIFT', `generationConfigSha256 drift on ${entry.condition}`);
    }
    if (serialized.observation.contentsSha256 !== frozen.contentsSha256) {
      throw new R1ProviderNativeError('R1_CONTENTS_DRIFT', `contentsSha256 drift on ${entry.condition}`);
    }
    if (serialized.observation.systemInstructionSha256 !== frozen.systemInstructionSha256) {
      throw new R1ProviderNativeError('R1_SYSTEM_INSTRUCTION_DRIFT', `systemInstructionSha256 drift on ${entry.condition}`);
    }
    if (
      serialized.observation.bodySha256 !== frozen.bodySha256
      || serialized.observation.modelAndBodySha256 !== frozen.modelAndBodySha256
      || serialized.observation.utf8Bytes !== frozen.utf8Bytes
      || countTokensRequestSha256 !== frozen.countTokensRequestSha256
      || serialized.observation.bodySha256 !== manifestCond.observation.bodySha256
    ) {
      throw new R1ProviderNativeError('R1_FROZEN_DIGEST_MISMATCH', `Wire digest mismatch on ${entry.condition}`);
    }

    preparedByCondition[entry.condition] = Object.freeze({
      condition: entry.condition,
      arm: entry.arm,
      model: entry.model,
      request: entry.request,
      wireBody: serialized.body,
      observation: serialized.observation,
      countTokensRequest: countTokensReq,
      countTokensWireBody,
      countTokensRequestSha256
    });
  }

  const sA = preparedByCondition.R1_NATIVE_A.request.systemInstruction.parts[0].text;
  const sB = preparedByCondition.R1_NATIVE_B.request.systemInstruction.parts[0].text;
  if (sA.replace(R1_SECTION_COVERAGE_CLAUSE_BOTH, R1_SECTION_COVERAGE_CLAUSE_PLAIN_FIRST) !== sB) {
    throw new R1ProviderNativeError('R1_BETWEEN_ARM_SYSTEM_DIFF_VIOLATION', 'A and B differ beyond single Section-I coverage clause');
  }

  return Object.freeze({
    schema: R1_NATIVE_RUNNER_SCHEMA,
    experimentId: R1_PROVIDER_NATIVE_EXPERIMENT_ID,
    pinnedModel: R1_NATIVE_PINNED_MODEL,
    thinkingLevel: R1_NATIVE_THINKING_LEVEL,
    covenant: R1_NATIVE_COVENANT,
    seal: R1_NATIVE_SEAL,
    conditions: Object.freeze(preparedByCondition)
  });
}

export function isSessionRevokedOnDisk(sessionId, revocationFilePath = null) {
  if (!revocationFilePath || !fs.existsSync(revocationFilePath)) return false;
  try {
    const raw = fs.readFileSync(revocationFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed?.revokeAll === true) return true;
    const list = Array.isArray(parsed?.revokedSessionIds) ? parsed.revokedSessionIds : [];
    return list.includes(sessionId);
  } catch {
    // Fail closed if an explicit revocation file is corrupt or unreadable
    return true;
  }
}

export function verifyProviderNativeOperatorAuthorization({
  grant,
  publicKeyPem,
  checkedOutHeadSha,
  expectedPlan = null,
  pinnedTrustFingerprintSha256 = null,
  revocationFilePath = null,
  nowMs = Date.now()
} = {}) {
  if (!grant || typeof grant !== 'object' || Array.isArray(grant)) {
    throw new R1ProviderNativeError('R1_AUTH_MISSING', 'Signed Ed25519 provider-native R1 authorization grant is required');
  }
  const { payload, signatureBase64, algorithm } = grant;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new R1ProviderNativeError('R1_AUTH_MALFORMED', 'Authorization grant missing payload');
  }
  if (typeof payload.schema !== 'string') {
    throw new R1ProviderNativeError('R1_AUTH_SCHEMA_MISMATCH', 'Authorization payload missing schema');
  }
  if (payload.schema.startsWith('td613.marrowline.argon')) {
    throw new R1ProviderNativeError('R1_AUTH_ARGON_GRANT_FORBIDDEN', `Argon grant schema ${payload.schema} cannot authorize R1`);
  }
  if (payload.schema.startsWith('td613.marrowline.r1-live-observation-authorization')) {
    throw new R1ProviderNativeError('R1_AUTH_OLD_CAPPED_GRANT_REJECTED', `Legacy capped R1 grant schema ${payload.schema} is rejected under no-artificial-ceilings policy`);
  }
  if (payload.schema !== R1_NATIVE_GRANT_SCHEMA) {
    throw new R1ProviderNativeError('R1_AUTH_SCHEMA_MISMATCH', `Expected ${R1_NATIVE_GRANT_SCHEMA}; got ${payload.schema}`);
  }
  if (algorithm !== 'ed25519') {
    throw new R1ProviderNativeError('R1_AUTH_UNSUPPORTED_ALGORITHM', `Expected ed25519 signature; got ${algorithm}`);
  }
  if (typeof signatureBase64 !== 'string' || !signatureBase64.trim()) {
    throw new R1ProviderNativeError('R1_AUTH_MISSING_SIGNATURE', 'Grant missing signatureBase64');
  }
  if (typeof publicKeyPem !== 'string' || !publicKeyPem.trim()) {
    throw new R1ProviderNativeError('R1_AUTH_MISSING_PUBLIC_KEY', 'Independent Ed25519 SPKI public key PEM is required');
  }

  let publicKey;
  try {
    publicKey = crypto.createPublicKey(publicKeyPem);
  } catch (error) {
    throw new R1ProviderNativeError('R1_AUTH_INVALID_PUBLIC_KEY', `Invalid Ed25519 public key: ${error?.message || error}`);
  }
  if (publicKey.asymmetricKeyType !== 'ed25519') {
    throw new R1ProviderNativeError('R1_AUTH_INVALID_PUBLIC_KEY_TYPE', `Expected ed25519 key; got ${publicKey.asymmetricKeyType}`);
  }
  if (typeof pinnedTrustFingerprintSha256 !== 'string' || !/^[0-9a-f]{64}$/.test(pinnedTrustFingerprintSha256)) {
    throw new R1ProviderNativeError(
      'R1_AUTH_TRUST_ANCHOR_NOT_PROVISIONED',
      'No independently operator-pinned Ed25519 public-key SHA-256 fingerprint provisioned in reviewed source'
    );
  }
  const actualFingerprint = sha256Hex(publicKey.export({ type: 'spki', format: 'der' }));
  if (!crypto.timingSafeEqual(Buffer.from(actualFingerprint, 'hex'), Buffer.from(pinnedTrustFingerprintSha256, 'hex'))) {
    throw new R1ProviderNativeError('R1_AUTH_UNTRUSTED_PUBLIC_KEY', 'Presented public key does not match pinned operator trust anchor');
  }

  for (const forbiddenField of FORBIDDEN_CEILING_GRANT_FIELDS) {
    if (Object.hasOwn(payload, forbiddenField)) {
      throw new R1ProviderNativeError(
        'R1_AUTH_FORBIDDEN_ARTIFICIAL_CEILING_IN_GRANT',
        `Grant carries forbidden resource cap field "${forbiddenField}" under zero-artificial-ceilings policy`
      );
    }
  }

  if (payload.experimentId !== R1_PROVIDER_NATIVE_EXPERIMENT_ID) {
    throw new R1ProviderNativeError('R1_AUTH_EXPERIMENT_MISMATCH', `Grant experimentId mismatch: ${payload.experimentId}`);
  }
  if (payload.pinnedModel !== R1_NATIVE_PINNED_MODEL || payload.thinkingLevel !== R1_NATIVE_THINKING_LEVEL) {
    throw new R1ProviderNativeError('R1_AUTH_MODEL_MISMATCH', `Grant model/thinking mismatch: ${payload.pinnedModel}/${payload.thinkingLevel}`);
  }
  if (payload.sessionMode !== 'OPERATOR_CONTROLLED_UNBOUNDED_PAIRED_OBSERVATION') {
    throw new R1ProviderNativeError('R1_AUTH_SESSION_MODE_MISMATCH', `Expected OPERATOR_CONTROLLED_UNBOUNDED_PAIRED_OBSERVATION; got ${payload.sessionMode}`);
  }
  if (typeof payload.permittedPurpose !== 'string' || !payload.permittedPurpose.trim()) {
    throw new R1ProviderNativeError('R1_AUTH_MISSING_PERMITTED_PURPOSE', 'Grant must declare non-empty permittedPurpose');
  }
  if (payload.covenant !== R1_NATIVE_COVENANT || !payload.covenant.includes('\u200C') || payload.seal !== R1_NATIVE_SEAL) {
    throw new R1ProviderNativeError('R1_AUTH_COVENANT_OR_SEAL_MISMATCH', 'Grant covenant (with U+200C) or seal mismatch');
  }
  if (typeof payload.authorizedBy !== 'string' || !payload.authorizedBy.trim()) {
    throw new R1ProviderNativeError('R1_AUTH_INVALID_OPERATOR', 'Grant must declare non-empty authorizedBy operator identity');
  }
  if (typeof payload.sessionId !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(payload.sessionId)) {
    throw new R1ProviderNativeError('R1_AUTH_INVALID_SESSION_ID', 'Grant sessionId must match /^[A-Za-z0-9_-]{8,128}$/');
  }
  if (payload.sessionRevoked === true || isSessionRevokedOnDisk(payload.sessionId, revocationFilePath)) {
    throw new R1ProviderNativeError('R1_AUTH_SESSION_REVOKED', `Operator session ${payload.sessionId} is revoked`);
  }
  if (!/^[0-9a-f]{40}$/.test(String(checkedOutHeadSha || '')) || payload.checkedOutHeadSha !== checkedOutHeadSha) {
    throw new R1ProviderNativeError('R1_AUTH_HEAD_MISMATCH', `Grant HEAD (${payload.checkedOutHeadSha}) != checked-out HEAD (${checkedOutHeadSha})`);
  }

  const plan = expectedPlan ?? buildProviderNativeConditionPlans();
  const cA = plan.conditions.R1_NATIVE_A;
  const cB = plan.conditions.R1_NATIVE_B;
  if (
    payload.conditions?.R1_NATIVE_A?.bodySha256 !== cA.observation.bodySha256
    || payload.conditions?.R1_NATIVE_B?.bodySha256 !== cB.observation.bodySha256
    || payload.conditions?.R1_NATIVE_A?.modelAndBodySha256 !== cA.observation.modelAndBodySha256
    || payload.conditions?.R1_NATIVE_B?.modelAndBodySha256 !== cB.observation.modelAndBodySha256
    || payload.conditions?.R1_NATIVE_A?.countTokensRequestSha256 !== cA.countTokensRequestSha256
    || payload.conditions?.R1_NATIVE_B?.countTokensRequestSha256 !== cB.countTokensRequestSha256
  ) {
    throw new R1ProviderNativeError('R1_AUTH_DIGEST_MISMATCH', 'Grant wire digests do not match frozen provider-native R1 A/B requests');
  }
  if (
    payload.generationConfigSha256 !== cA.observation.generationConfigSha256
    || canonicalJson(payload.generationConfig) !== canonicalJson(cA.request.generationConfig)
    || Object.hasOwn(payload.generationConfig || {}, 'maxOutputTokens')
  ) {
    throw new R1ProviderNativeError('R1_AUTH_CONFIG_MISMATCH', 'Grant generationConfig must match provider-native config with zero maxOutputTokens');
  }
  if (typeof payload.nonce !== 'string' || !/^[A-Za-z0-9_-]{16,128}$/.test(payload.nonce)) {
    throw new R1ProviderNativeError('R1_AUTH_INVALID_NONCE', 'Grant nonce must match /^[A-Za-z0-9_-]{16,128}$/');
  }

  const issuedAtMs = Date.parse(payload.issuedAt);
  if (!Number.isFinite(issuedAtMs)) {
    throw new R1ProviderNativeError('R1_AUTH_INVALID_ISSUED_AT', 'Grant issuedAt must be a valid ISO-8601 timestamp');
  }
  if (issuedAtMs > nowMs + MAX_FUTURE_ISSUED_SKEW_MS) {
    throw new R1ProviderNativeError('R1_AUTH_ISSUED_IN_FUTURE', 'Grant issuedAt is unreasonably in the future');
  }
  // No forced 30-minute TD613 TTL cap; respect optional operator-chosen notAfter only if explicitly declared
  if (payload.notAfter !== undefined && payload.notAfter !== null) {
    const notAfterMs = Date.parse(payload.notAfter);
    if (!Number.isFinite(notAfterMs)) {
      throw new R1ProviderNativeError('R1_AUTH_INVALID_NOT_AFTER', 'Optional grant notAfter must be a valid ISO-8601 timestamp');
    }
    if (notAfterMs <= nowMs) {
      throw new R1ProviderNativeError('R1_AUTH_SESSION_ENDED', `Operator-declared session notAfter ${payload.notAfter} has passed`);
    }
  }

  const signingBytes = Buffer.from(canonicalizeProviderNativeAuthorizationPayload(payload), 'utf8');
  let signatureBuffer;
  try {
    signatureBuffer = Buffer.from(signatureBase64, 'base64');
  } catch {
    throw new R1ProviderNativeError('R1_AUTH_INVALID_SIGNATURE', 'Malformed base64 signature');
  }
  if (signatureBuffer.length !== 64 || !crypto.verify(null, signingBytes, publicKey, signatureBuffer)) {
    throw new R1ProviderNativeError('R1_AUTH_INVALID_SIGNATURE', 'Ed25519 signature verification failed');
  }

  return Object.freeze({
    verified: true,
    schema: payload.schema,
    experimentId: payload.experimentId,
    sessionId: payload.sessionId,
    permittedPurpose: payload.permittedPurpose,
    checkedOutHeadSha: payload.checkedOutHeadSha,
    authorizedBy: payload.authorizedBy,
    nonce: payload.nonce,
    issuedAt: payload.issuedAt,
    notAfter: payload.notAfter ?? null,
    grantSha256: sha256Hex(signingBytes),
    publicKeySha256: actualFingerprint
  });
}

export function claimSingleHostNonceAtomically({
  nonce,
  evidenceDir,
  checkedOutHeadSha,
  grantSha256,
  sessionId,
  issuedAt,
  claimedAt = new Date().toISOString()
} = {}) {
  if (!evidenceDir || !path.isAbsolute(evidenceDir)) {
    throw new R1ProviderNativeError('R1_EXPLICIT_ABSOLUTE_EVIDENCE_DIR_REQUIRED', 'Explicit absolute evidenceDir required for single-host nonce and wire custody');
  }
  fs.mkdirSync(evidenceDir, { recursive: true, mode: 0o700 });
  const nonceFilePath = path.join(evidenceDir, `r1-native-nonce-${nonce}.json`);
  const record = {
    schema: 'td613.marrowline.r1-provider-native-nonce-claim/v1',
    scopeGuarantee: 'SINGLE_HOST_FILESYSTEM_ATOMIC_WX_ONLY_NOT_CROSS_HOST',
    nonce,
    sessionId,
    checkedOutHeadSha,
    grantSha256,
    issuedAt,
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
      throw new R1ProviderNativeError('R1_AUTH_NONCE_REPLAYED', `Nonce ${nonce} already redeemed on this host (${nonceFilePath})`);
    }
    throw new R1ProviderNativeError('R1_NONCE_CLAIM_IO_ERROR', `Failed to claim nonce: ${error?.message || error}`);
  }
  return Object.freeze({
    claimed: true,
    nonce,
    nonceFilePath,
    claimedAt,
    scopeGuarantee: 'SINGLE_HOST_FILESYSTEM_ATOMIC_WX_ONLY_NOT_CROSS_HOST'
  });
}

function writeAllSync(fd, buffer) {
  let offset = 0;
  while (offset < buffer.length) {
    offset += fs.writeSync(fd, buffer, offset, buffer.length - offset);
  }
}

const PART_MEMORY_SPILL_BYTES = 64 * 1024;
const TEXT_FLUSH_CHUNK_CHARS = 16 * 1024;
const HEADING_MAX_CHARS = 512;
const GIANT_LINE_FLUSH_CHARS = 32 * 1024;

function createPartSpool(tempFilePath) {
  let chunks = [];
  let memoryBytes = 0;
  let spilled = false;
  let spoolFd = null;
  let totalBytes = 0;

  return {
    appendUtf8(buf) {
      if (!buf || buf.byteLength === 0) return;
      totalBytes += buf.byteLength;
      if (!spilled) {
        if (memoryBytes + buf.byteLength <= PART_MEMORY_SPILL_BYTES) {
          chunks.push(buf);
          memoryBytes += buf.byteLength;
          return;
        }
        spilled = true;
        spoolFd = fs.openSync(tempFilePath, 'w+', 0o600);
        for (const existing of chunks) writeAllSync(spoolFd, existing);
        chunks = [];
        memoryBytes = 0;
      }
      writeAllSync(spoolFd, buf);
    },
    drainChunks(onChunk) {
      if (!spilled) {
        for (const buf of chunks) onChunk(buf);
      } else if (spoolFd !== null) {
        const readBuf = Buffer.allocUnsafe(STREAM_READBACK_CHUNK_BYTES);
        let pos = 0;
        while (pos < totalBytes) {
          const toRead = Math.min(readBuf.length, totalBytes - pos);
          const n = fs.readSync(spoolFd, readBuf, 0, toRead, pos);
          if (n <= 0) break;
          onChunk(readBuf.subarray(0, n));
          pos += n;
        }
      }
      chunks = [];
      memoryBytes = 0;
      if (spoolFd !== null) {
        try { fs.closeSync(spoolFd); } catch { /* ignore */ }
        spoolFd = null;
        try { fs.unlinkSync(tempFilePath); } catch { /* ignore */ }
      }
      spilled = false;
      totalBytes = 0;
    },
    cleanup() {
      chunks = [];
      if (spoolFd !== null) {
        try { fs.closeSync(spoolFd); } catch { /* ignore */ }
        spoolFd = null;
        try { fs.unlinkSync(tempFilePath); } catch { /* ignore */ }
      }
    }
  };
}

// Pure streaming RFC-8259 JSON parser tailored for arbitrary-size Gemini SSE events.
// Keeps scalar metadata in primitives and streams arbitrarily large parts[*].text
// into bounded <=64 KiB scratch/disk spool without building giant strings in heap.
function createStreamingGeminiJsonFrameParser({ spoolPath, onPartCompleted }) {
  const stack = [];
  let mode = 'VALUE'; // VALUE | KEY | COLON | COMMA_OR_END | STRING | NUMBER | LITERAL | DONE
  let parseError = false;
  let strPurpose = null; // 'KEY' | 'SCALAR' | 'TEXT_PART' | 'SKIP'
  let strEscaping = false;
  let strUnicodeDigits = '';
  let scalarBuf = '';
  let primBuf = '';
  let literalTarget = '';
  let literalIdx = 0;
  let partSeq = 0;

  let textOutAcc = '';
  let activePartSpool = null;
  let tailSample = '';

  const metadata = {
    modelVersion: null,
    finishReason: null,
    finishMessage: null,
    promptBlockReason: null,
    usageMetadata: null,
    hasAuthoredOrFinish: false
  };

  function isPartTextField() {
    // candidates[0].content.parts[k] object, where current key is 'text'
    return stack.length === 6
      && stack[0].kind === 'object' && stack[0].pendingKey === 'candidates'
      && stack[1].kind === 'array' && stack[1].index === 0
      && stack[2].kind === 'object' && stack[2].pendingKey === 'content'
      && stack[3].kind === 'object' && stack[3].pendingKey === 'parts'
      && stack[4].kind === 'array'
      && stack[5].kind === 'object' && stack[5].pendingKey === 'text' && stack[5].partSpool;
  }

  function classifyScalarPath() {
    if (stack.length === 1 && stack[0].kind === 'object') {
      if (stack[0].pendingKey === 'modelVersion') return 'modelVersion';
    }
    if (stack.length === 2 && stack[0].kind === 'object' && stack[0].pendingKey === 'promptFeedback' && stack[1].kind === 'object' && stack[1].pendingKey === 'blockReason') {
      return 'promptBlockReason';
    }
    if (stack.length === 3 && stack[0].kind === 'object' && stack[0].pendingKey === 'candidates' && stack[1].kind === 'array' && stack[1].index === 0 && stack[2].kind === 'object') {
      if (stack[2].pendingKey === 'finishReason') return 'finishReason';
      if (stack[2].pendingKey === 'finishMessage') return 'finishMessage';
    }
    if (stack.length === 2 && stack[0].kind === 'object' && stack[0].pendingKey === 'usageMetadata' && stack[1].kind === 'object') {
      return `usage:${stack[1].pendingKey}`;
    }
    if (
      stack.length === 6
      && stack[0].pendingKey === 'candidates'
      && stack[1].kind === 'array' && stack[1].index === 0
      && stack[2].pendingKey === 'content'
      && stack[3].pendingKey === 'parts'
      && stack[4].kind === 'array'
      && stack[5].kind === 'object' && stack[5].pendingKey === 'thought'
    ) {
      return 'partThought';
    }
    return null;
  }

  function flushTextAcc(forceAll = false) {
    if (!textOutAcc || !activePartSpool) return;
    let flushLen = textOutAcc.length;
    if (!forceAll) {
      if (flushLen < TEXT_FLUSH_CHUNK_CHARS) return;
      const lastCode = textOutAcc.charCodeAt(flushLen - 1);
      if (lastCode >= 0xD800 && lastCode <= 0xDBFF && flushLen > 1) flushLen -= 1;
    }
    const piece = textOutAcc.slice(0, flushLen);
    textOutAcc = textOutAcc.slice(flushLen);
    activePartSpool.appendUtf8(Buffer.from(piece, 'utf8'));
    if (piece.length > 0) {
      tailSample = (tailSample + piece.slice(-256)).slice(-256);
    }
  }

  function afterValueCompleted() {
    if (stack.length === 0) {
      mode = 'DONE';
      return;
    }
    mode = 'COMMA_OR_END';
  }

  function commitScalarValue(val) {
    const slot = classifyScalarPath();
    if (!slot) return;
    if (slot === 'modelVersion' && typeof val === 'string' && val.trim()) metadata.modelVersion = val.trim();
    else if (slot === 'promptBlockReason' && typeof val === 'string' && val.trim()) metadata.promptBlockReason = val.trim();
    else if (slot === 'finishReason' && typeof val === 'string' && val.trim()) {
      metadata.finishReason = val.trim();
      metadata.hasAuthoredOrFinish = true;
    } else if (slot === 'finishMessage' && typeof val === 'string' && val.trim()) {
      metadata.finishMessage = val.trim();
    } else if (slot === 'partThought' && typeof val === 'boolean') {
      stack[5].isThought = val === true;
    } else if (slot.startsWith('usage:') && typeof val === 'number') {
      if (!metadata.usageMetadata) metadata.usageMetadata = {};
      metadata.usageMetadata[slot.slice(6)] = val;
    }
  }

  function onBeginValue(ch) {
    if (ch === '{') {
      const isPartsElem = stack.length === 5
        && stack[0].pendingKey === 'candidates'
        && stack[1].kind === 'array' && stack[1].index === 0
        && stack[2].pendingKey === 'content'
        && stack[3].pendingKey === 'parts'
        && stack[4].kind === 'array';
      const frame = {
        kind: 'object',
        pendingKey: null,
        isPartObj: isPartsElem,
        isThought: false,
        partSpool: isPartsElem ? createPartSpool(`${spoolPath}.${partSeq++}`) : null
      };
      stack.push(frame);
      mode = 'KEY';
    } else if (ch === '[') {
      stack.push({ kind: 'array', index: 0, empty: true });
      mode = 'VALUE';
    } else if (ch === '"') {
      if (isPartTextField()) {
        strPurpose = 'TEXT_PART';
        activePartSpool = stack[5].partSpool;
        stack[5].hasText = true;
      } else {
        const scalarSlot = classifyScalarPath();
        strPurpose = scalarSlot ? 'SCALAR' : 'SKIP';
        scalarBuf = '';
      }
      strEscaping = false;
      strUnicodeDigits = '';
      mode = 'STRING';
    } else if (ch === 't') {
      literalTarget = 'true'; literalIdx = 1; mode = 'LITERAL';
    } else if (ch === 'f') {
      literalTarget = 'false'; literalIdx = 1; mode = 'LITERAL';
    } else if (ch === 'n') {
      literalTarget = 'null'; literalIdx = 1; mode = 'LITERAL';
    } else if (ch === '-' || (ch >= '0' && ch <= '9')) {
      primBuf = ch; mode = 'NUMBER';
    } else {
      parseError = true;
    }
  }

  function closeTopContainer(ch) {
    const top = stack.pop();
    if (!top) { parseError = true; return; }
    if (ch === '}' && top.kind !== 'object') { parseError = true; return; }
    if (ch === ']' && top.kind !== 'array') { parseError = true; return; }
    if (top.isPartObj && top.partSpool) {
      if (top.hasText && !top.isThought) metadata.hasAuthoredOrFinish = true;
      try {
        onPartCompleted({
          isThought: top.isThought === true,
          spool: top.partSpool
        });
      } finally {
        top.partSpool.cleanup();
      }
    }
    afterValueCompleted();
  }

  function appendStringChar(ch) {
    if (strPurpose === 'TEXT_PART') {
      textOutAcc += ch;
      if (textOutAcc.length >= TEXT_FLUSH_CHUNK_CHARS) flushTextAcc(false);
    } else if (strPurpose === 'KEY' || strPurpose === 'SCALAR') {
      if (scalarBuf.length < 4096) scalarBuf += ch;
    }
  }

  function pushText(strChunk) {
    for (let i = 0; !parseError && i < strChunk.length; i += 1) {
      const ch = strChunk[i];

      if (mode === 'STRING') {
        if (strUnicodeDigits.length > 0 || (strEscaping && ch === 'u')) {
          if (ch === 'u' && strEscaping && strUnicodeDigits.length === 0) {
            strEscaping = false;
            strUnicodeDigits = 'WAIT';
            continue;
          }
          const hex = strUnicodeDigits === 'WAIT' ? ch : strUnicodeDigits + ch;
          if (!/^[0-9a-fA-F]{1,4}$/.test(hex)) { parseError = true; break; }
          if (hex.length === 4) {
            strUnicodeDigits = '';
            appendStringChar(String.fromCharCode(parseInt(hex, 16)));
          } else {
            strUnicodeDigits = hex;
          }
          continue;
        }
        if (strEscaping) {
          strEscaping = false;
          if (ch === '"' || ch === '\\' || ch === '/') appendStringChar(ch);
          else if (ch === 'b') appendStringChar('\b');
          else if (ch === 'f') appendStringChar('\f');
          else if (ch === 'n') appendStringChar('\n');
          else if (ch === 'r') appendStringChar('\r');
          else if (ch === 't') appendStringChar('\t');
          else parseError = true;
          continue;
        }
        if (ch === '\\') { strEscaping = true; continue; }
        if (ch === '"') {
          if (strPurpose === 'TEXT_PART') {
            flushTextAcc(true);
            activePartSpool = null;
          } else if (strPurpose === 'KEY') {
            stack[stack.length - 1].pendingKey = scalarBuf;
            mode = 'COLON';
            continue;
          } else if (strPurpose === 'SCALAR') {
            commitScalarValue(scalarBuf);
          }
          afterValueCompleted();
          continue;
        }
        if (ch.charCodeAt(0) < 0x20) { parseError = true; break; }
        appendStringChar(ch);
        continue;
      }

      if (mode === 'NUMBER') {
        if (/[0-9eE+\-.]/.test(ch)) {
          if (primBuf.length < 64) primBuf += ch;
          continue;
        }
        const num = Number(primBuf);
        if (!Number.isFinite(num)) { parseError = true; break; }
        commitScalarValue(num);
        afterValueCompleted();
        i -= 1; // reprocess delimiter in COMMA_OR_END / DONE
        continue;
      }

      if (mode === 'LITERAL') {
        if (ch === literalTarget[literalIdx]) {
          literalIdx += 1;
          if (literalIdx === literalTarget.length) {
            const val = literalTarget === 'true' ? true : (literalTarget === 'false' ? false : null);
            commitScalarValue(val);
            afterValueCompleted();
          }
          continue;
        }
        parseError = true;
        break;
      }

      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') continue;

      if (mode === 'VALUE') {
        if (ch === ']') {
          const top = stack[stack.length - 1];
          if (top && top.kind === 'array' && top.empty) {
            closeTopContainer(']');
            continue;
          }
          parseError = true;
          break;
        }
        if (stack.length > 0 && stack[stack.length - 1].kind === 'array') {
          stack[stack.length - 1].empty = false;
        }
        onBeginValue(ch);
      } else if (mode === 'KEY') {
        if (ch === '}') {
          if (stack.length > 0 && stack[stack.length - 1].kind === 'object' && stack[stack.length - 1].pendingKey === null) {
            closeTopContainer('}');
            continue;
          }
          parseError = true;
          break;
        }
        if (ch === '"') {
          strPurpose = 'KEY';
          scalarBuf = '';
          strEscaping = false;
          strUnicodeDigits = '';
          mode = 'STRING';
        } else {
          parseError = true;
        }
      } else if (mode === 'COLON') {
        if (ch === ':') mode = 'VALUE';
        else parseError = true;
      } else if (mode === 'COMMA_OR_END') {
        const top = stack[stack.length - 1];
        if (ch === ',') {
          if (top?.kind === 'object') mode = 'KEY';
          else if (top?.kind === 'array') { top.index += 1; mode = 'VALUE'; }
          else parseError = true;
        } else if (ch === '}' || ch === ']') {
          closeTopContainer(ch);
        } else {
          parseError = true;
        }
      } else if (mode === 'DONE') {
        parseError = true;
      }
    }
  }

  return {
    pushText,
    finish() {
      if (mode === 'NUMBER') {
        const num = Number(primBuf);
        if (!Number.isFinite(num)) parseError = true;
        else { commitScalarValue(num); afterValueCompleted(); }
      }
      if (mode !== 'DONE' || stack.length !== 0) parseError = true;
      for (const frame of stack) frame.partSpool?.cleanup?.();
      if (activePartSpool) activePartSpool.cleanup();
      return { parseError, metadata, tailSample };
    }
  };
}

// Parser A: Reads completed raw SSE frame byte ranges [frameStart, frameEnd] directly
// from the on-disk `.sse` file in 64 KiB chunks so single frames of arbitrary MiB size
// never accumulate as multi-MiB JS strings in heap.
function createDiskBackedSseParserA({ rawSseFilePath, authoredFd }) {
  const authoredHash = crypto.createHash('sha256');
  const thoughtHash = crypto.createHash('sha256');
  const readBuf = Buffer.allocUnsafe(STREAM_READBACK_CHUNK_BYTES);
  const completedFrameRanges = [];
  let frameStartOffset = 0;
  let totalSeenOffset = 0;
  let trailingTailBytes = Buffer.alloc(0);

  let authoredBytes = 0;
  let thoughtBytes = 0;
  let eventCount = 0;
  let parseErrors = 0;
  let modelVersion = null;
  let finishReason = null;
  let finishMessage = null;
  let promptBlockReason = null;
  let usageMetadata = null;

  function parseFrameRange(readFd, startByte, endByte) {
    if (endByte <= startByte) return;
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const frameParser = createStreamingGeminiJsonFrameParser({
      spoolPath: `${rawSseFilePath}.partA.tmp`,
      onPartCompleted: ({ isThought, spool }) => {
        spool.drainChunks((buf) => {
          if (isThought) {
            thoughtHash.update(buf);
            thoughtBytes += buf.byteLength;
          } else {
            authoredHash.update(buf);
            authoredBytes += buf.byteLength;
            writeAllSync(authoredFd, buf);
          }
        });
      }
    });

    // Line-prefix state scanner across 64 KiB byte reads: skips SSE comments, handles multi-line data:
    let lineAtStart = true;
    let lineState = 'UNKNOWN'; // UNKNOWN | COMMENT | DATA_PREFIX | DATA_BODY | OTHER
    let prefixCarry = '';
    let hasAnyJsonPayload = false;
    let payloadFirstChars = '';
    let firstDataLineSeen = false;

    function pushDataPayloadPiece(piece) {
      if (!piece) return;
      if (payloadFirstChars.length < 16) payloadFirstChars += piece.trimStart();
      hasAnyJsonPayload = true;
      frameParser.pushText(piece);
    }

    function consumeDecodedSlice(strSlice) {
      let i = 0;
      while (i < strSlice.length) {
        if (lineAtStart) {
          const nlIdx = strSlice.indexOf('\n', i);
          const candidateEnd = nlIdx === -1 ? strSlice.length : nlIdx + 1;
          const combined = prefixCarry + strSlice.slice(i, Math.min(candidateEnd, i + 16));
          if (nlIdx === -1 && combined.length < 6 && !combined.startsWith(':')) {
            prefixCarry = combined;
            i = candidateEnd;
            continue;
          }
          prefixCarry = '';
          const fullSegmentStart = i;
          // Evaluate line prefix cleanly from reconstructed start
          const probe = combined;
          if (probe.startsWith('\n') || probe.startsWith('\r\n')) {
            lineAtStart = true;
            lineState = 'UNKNOWN';
            i += probe.startsWith('\r\n') ? 2 : 1;
            continue;
          }
          if (probe.startsWith(':')) {
            lineState = 'COMMENT';
            lineAtStart = false;
          } else if (probe.startsWith('data:')) {
            if (firstDataLineSeen) pushDataPayloadPiece('\n');
            firstDataLineSeen = true;
            lineState = 'DATA_BODY';
            lineAtStart = false;
            const consumeFromChunk = Math.max(0, 5 - (combined.length - (Math.min(candidateEnd, i + 16) - i)));
            i = fullSegmentStart + consumeFromChunk;
            while (i < strSlice.length && strSlice[i] === ' ') i += 1;
            continue;
          } else {
            lineState = 'OTHER';
            lineAtStart = false;
          }
        }

        const nlIdx = strSlice.indexOf('\n', i);
        if (nlIdx === -1) {
          if (lineState === 'DATA_BODY') pushDataPayloadPiece(strSlice.slice(i));
          i = strSlice.length;
        } else {
          if (lineState === 'DATA_BODY') pushDataPayloadPiece(strSlice.slice(i, nlIdx));
          lineAtStart = true;
          lineState = 'UNKNOWN';
          i = nlIdx + 1;
        }
      }
    }

    let pos = startByte;
    while (pos < endByte) {
      const toRead = Math.min(readBuf.length, endByte - pos);
      const n = fs.readSync(readFd, readBuf, 0, toRead, pos);
      if (n <= 0) break;
      consumeDecodedSlice(decoder.decode(readBuf.subarray(0, n), { stream: true }));
      pos += n;
    }
    consumeDecodedSlice(decoder.decode());
    if (prefixCarry.trim()) parseErrors += 1;
    if (!hasAnyJsonPayload || payloadFirstChars.trim() === '[DONE]') {
      frameParser.finish();
      return;
    }

    const res = frameParser.finish();
    if (res.parseError) {
      parseErrors += 1;
      return;
    }
    eventCount += 1;
    if (res.metadata.modelVersion) modelVersion = res.metadata.modelVersion;
    if (res.metadata.promptBlockReason) promptBlockReason = res.metadata.promptBlockReason;
    if (res.metadata.finishReason) finishReason = res.metadata.finishReason;
    if (res.metadata.finishMessage) finishMessage = res.metadata.finishMessage;
    if (res.metadata.usageMetadata) usageMetadata = res.metadata.usageMetadata;
  }

  let scanLastByte = -1;
  let scanPrevByte = -1;
  let scanPrev2Byte = -1;

  return {
    pushChunk(uint8Chunk) {
      const baseOffset = totalSeenOffset;
      for (let i = 0; i < uint8Chunk.length; i += 1) {
        const b = uint8Chunk[i];
        const absPos = baseOffset + i;
        // Detect `\n\n` or `\r\n\r\n` without buffering bytes
        if (b === 0x0A && (scanLastByte === 0x0A || (scanLastByte === 0x0D && scanPrevByte === 0x0A))) {
          const endOffset = absPos + 1;
          completedFrameRanges.push([frameStartOffset, endOffset]);
          frameStartOffset = endOffset;
        }
        scanPrev2Byte = scanPrevByte;
        scanPrevByte = scanLastByte;
        scanLastByte = b;
      }
      totalSeenOffset += uint8Chunk.length;
      if (completedFrameRanges.length > 0) {
        const readFd = fs.openSync(rawSseFilePath, 'r');
        try {
          while (completedFrameRanges.length > 0) {
            const [s, e] = completedFrameRanges.shift();
            parseFrameRange(readFd, s, e);
          }
        } finally {
          fs.closeSync(readFd);
        }
      }
      trailingTailBytes = uint8Chunk.length ? Buffer.from(uint8Chunk.subarray(Math.max(0, uint8Chunk.length - 4))) : trailingTailBytes;
    },
    finish() {
      if (frameStartOffset < totalSeenOffset) {
        const readFd = fs.openSync(rawSseFilePath, 'r');
        try {
          parseFrameRange(readFd, frameStartOffset, totalSeenOffset);
        } finally {
          fs.closeSync(readFd);
        }
        frameStartOffset = totalSeenOffset;
      }
      fs.fsyncSync(authoredFd);
      return Object.freeze({
        authoredTextSha256: authoredHash.digest('hex'),
        authoredUtf8Bytes: authoredBytes,
        thoughtSha256: thoughtHash.digest('hex'),
        thoughtUtf8Bytes: thoughtBytes,
        eventCount,
        parseErrors,
        modelVersion,
        finishReason,
        finishMessage,
        promptBlockReason,
        usageMetadata
      });
    }
  };
}

// Parser B: Independent chunk-bounded streaming SSE parser directly on network bytes
// with strict UTF-8 decoding, chunk-bounded duplicate frame hash, and streaming JSON lexer.
function createStreamingSseParserB({ tempSpoolBasePath }) {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const authoredHash = crypto.createHash('sha256');
  const seenSubstantiveHashes = new Set();

  let invalidUtf8Detected = false;
  let parseErrors = 0;
  let eventCount = 0;
  let duplicateEventCount = 0;
  let duplicateFinishEventCount = 0;
  let authoredBytes = 0;
  let authoredTail = '';
  const finishReasons = [];
  const promptBlockReasons = [];
  const modelVersions = new Set();
  let lastUsageMetadata = null;

  let lineAtStart = true;
  let prefixCarry = '';
  let lineKind = 'NONE'; // NONE | COMMENT | DATA | OTHER
  let endedWithBlankLine = false;
  let activeFrameParser = null;
  let activeFrameHash = null;
  let firstDataLineInFrame = false;
  let frameHeadSnippet = '';
  let frameSawNonWhitespace = false;
  let endedWithoutDelimiter = false;
  let frameSeq = 0;

  function ensureFrameActive() {
    if (activeFrameParser) return;
    activeFrameHash = crypto.createHash('sha256');
    firstDataLineInFrame = false;
    frameHeadSnippet = '';
    frameSawNonWhitespace = false;
    activeFrameParser = createStreamingGeminiJsonFrameParser({
      spoolPath: `${tempSpoolBasePath}.partB.${frameSeq++}.tmp`,
      onPartCompleted: ({ isThought, spool }) => {
        if (isThought) {
          spool.cleanup();
          return;
        }
        spool.drainChunks((buf) => {
          authoredHash.update(buf);
          authoredBytes += buf.byteLength;
        });
      }
    });
  }

  function closeCurrentFrame() {
    if (!activeFrameParser) return;
    const res = activeFrameParser.finish();
    const rawFrameDigest = activeFrameHash.digest('hex');
    if (res.tailSample) authoredTail = (authoredTail + res.tailSample).slice(-256);
    activeFrameParser = null;
    activeFrameHash = null;

    if (!frameSawNonWhitespace || frameHeadSnippet.trim() === '[DONE]') return;
    if (res.parseError) {
      parseErrors += 1;
      return;
    }

    eventCount += 1;
    if (res.metadata.hasAuthoredOrFinish) {
      if (seenSubstantiveHashes.has(rawFrameDigest)) duplicateEventCount += 1;
      else seenSubstantiveHashes.add(rawFrameDigest);
    }
    if (res.metadata.modelVersion) modelVersions.add(res.metadata.modelVersion);
    if (res.metadata.promptBlockReason) promptBlockReasons.push(res.metadata.promptBlockReason);
    if (res.metadata.finishReason) {
      finishReasons.push(res.metadata.finishReason);
      if (finishReasons.length > 1) duplicateFinishEventCount += 1;
    }
    if (res.metadata.usageMetadata) lastUsageMetadata = res.metadata.usageMetadata;
  }

  function feedDataText(slice) {
    if (!slice) return;
    ensureFrameActive();
    if (!frameSawNonWhitespace && /\S/.test(slice)) frameSawNonWhitespace = true;
    if (frameHeadSnippet.length < 16) frameHeadSnippet += slice.trim();
    activeFrameHash.update(Buffer.from(slice, 'utf8'));
    activeFrameParser.pushText(slice);
  }

  function processDecodedChunk(text) {
    let i = 0;
    while (i < text.length) {
      if (lineAtStart) {
        const nl = text.indexOf('\n', i);
        const segEnd = nl === -1 ? text.length : nl;
        const needed = 6 - prefixCarry.length;
        const sample = prefixCarry + text.slice(i, Math.min(segEnd, i + needed + 2));
        if (nl === -1 && sample.length < 6 && !sample.startsWith(':')) {
          prefixCarry = sample;
          i = segEnd;
          continue;
        }
        prefixCarry = '';
        const cleanSample = sample.replace(/\r$/, '');
        if (nl !== -1 && cleanSample === '') {
          // Blank line terminates current SSE frame
          closeCurrentFrame();
          endedWithBlankLine = true;
          lineAtStart = true;
          lineKind = 'NONE';
          i = nl + 1;
          continue;
        }
        endedWithBlankLine = false;
        if (cleanSample.startsWith(':')) {
          lineKind = 'COMMENT';
          lineAtStart = false;
        } else if (cleanSample.startsWith('data:')) {
          lineKind = 'DATA';
          lineAtStart = false;
          ensureFrameActive();
          if (firstDataLineInFrame) feedDataText('\n');
          firstDataLineInFrame = true;
          const skip = Math.max(0, 5 - (sample.length - (Math.min(segEnd, i + needed + 2) - i)));
          i += skip;
          while (i < text.length && text[i] === ' ') i += 1;
          continue;
        } else {
          lineKind = 'OTHER';
          lineAtStart = false;
        }
      }

      const nl = text.indexOf('\n', i);
      if (nl === -1) {
        if (lineKind === 'DATA') feedDataText(text.slice(i).replace(/\r$/, ''));
        i = text.length;
      } else {
        if (lineKind === 'DATA') feedDataText(text.slice(i, nl).replace(/\r$/, ''));
        lineAtStart = true;
        lineKind = 'NONE';
        i = nl + 1;
      }
    }
  }

  return {
    pushChunk(uint8Chunk) {
      let decoded = '';
      try {
        decoded = decoder.decode(uint8Chunk, { stream: true });
      } catch {
        invalidUtf8Detected = true;
        decoded = new TextDecoder('utf-8', { fatal: false }).decode(uint8Chunk);
      }
      processDecodedChunk(decoded);
    },
    finish() {
      let tail = '';
      try {
        tail = decoder.decode();
      } catch {
        invalidUtf8Detected = true;
      }
      if (tail) processDecodedChunk(tail);
      const hasTrailingFragment = Boolean(prefixCarry.trim()) || Boolean(activeFrameParser);
      if (prefixCarry.trim()) {
        parseErrors += 1;
        prefixCarry = '';
      }
      if (activeFrameParser) {
        endedWithoutDelimiter = true;
        closeCurrentFrame();
      }
      return Object.freeze({
        authoredTextSha256: authoredHash.digest('hex'),
        authoredUtf8Bytes: authoredBytes,
        authoredTail,
        eventCount,
        parseErrors,
        duplicateEventCount,
        duplicateFinishEventCount,
        duplicateSseDetected: duplicateEventCount > 0 || duplicateFinishEventCount > 0,
        invalidUtf8Detected,
        endsWithEventDelimiter: endedWithBlankLine && !hasTrailingFragment && !endedWithoutDelimiter,
        hasTrailingFragment,
        finishReasons: Object.freeze([...new Set(finishReasons)]),
        finalFinishReason: finishReasons.at(-1) ?? null,
        promptBlockReasons: Object.freeze([...new Set(promptBlockReasons)]),
        promptBlockReason: promptBlockReasons.at(-1) ?? null,
        modelVersions: Object.freeze([...modelVersions]),
        usageMetadata: lastUsageMetadata
      });
    }
  };
}

function hashFileChunkedSync(filePath) {
  const hash = crypto.createHash('sha256');
  const buf = Buffer.allocUnsafe(STREAM_READBACK_CHUNK_BYTES);
  const fd = fs.openSync(filePath, 'r');
  let bytes = 0;
  try {
    while (true) {
      const read = fs.readSync(fd, buf, 0, buf.length, null);
      if (read <= 0) break;
      hash.update(buf.subarray(0, read));
      bytes += read;
    }
  } finally {
    fs.closeSync(fd);
  }
  return { sha256: hash.digest('hex'), bytes };
}

function readNextChunkOrAbort(reader, abortSignal) {
  if (!abortSignal) return reader.read();
  if (abortSignal.aborted) {
    return Promise.reject(abortSignal.reason ?? Object.assign(new Error('Aborted'), { name: 'AbortError' }));
  }
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      reject(abortSignal.reason ?? Object.assign(new Error('Aborted by operator'), { name: 'AbortError' }));
    };
    abortSignal.addEventListener('abort', onAbort, { once: true });
    reader.read().then(
      (res) => {
        abortSignal.removeEventListener('abort', onAbort);
        resolve(res);
      },
      (err) => {
        abortSignal.removeEventListener('abort', onAbort);
        reject(err);
      }
    );
  });
}

export async function streamAndDualParseProviderSseToDisk({
  response,
  expectedModel = R1_NATIVE_PINNED_MODEL,
  rawSseFilePath,
  authoredTextFilePath,
  operatorAbortSignal = null
} = {}) {
  const reader = response?.body?.getReader?.();
  if (!reader) {
    throw new R1ProviderNativeError('R1_EMPTY_RESPONSE_BODY', 'Streaming response has no readable body');
  }
  if (!rawSseFilePath || !authoredTextFilePath) {
    throw new R1ProviderNativeError('R1_MISSING_STREAM_CUSTODY_PATHS', 'Exclusive on-disk rawSseFilePath and authoredTextFilePath are required');
  }

  let rawFd = null;
  let authoredFd = null;
  try {
    rawFd = fs.openSync(rawSseFilePath, 'wx', 0o600);
    authoredFd = fs.openSync(authoredTextFilePath, 'wx', 0o600);
  } catch (error) {
    if (rawFd !== null) try { fs.closeSync(rawFd); } catch { /* ignore */ }
    if (authoredFd !== null) try { fs.closeSync(authoredFd); } catch { /* ignore */ }
    throw new R1ProviderNativeError('R1_DURABLE_EVIDENCE_SETUP_FAILED', String(error?.message || error));
  }

  const rawSseHash = crypto.createHash('sha256');
  let rawSseBytes = 0;
  let streamInterrupted = false;
  let operatorStopped = false;
  let streamErrorName = null;
  let streamErrorMessage = null;
  let diskWriteError = null;

  const parserA = createDiskBackedSseParserA({ rawSseFilePath, authoredFd });
  const parserB = createStreamingSseParserB({ tempSpoolBasePath: rawSseFilePath });

  try {
    while (true) {
      if (operatorAbortSignal?.aborted) {
        try { await reader.cancel(); } catch { /* ignore */ }
        streamInterrupted = true;
        operatorStopped = true;
        streamErrorName = 'OPERATOR_ABORT_OR_REVOCATION';
        streamErrorMessage = String(operatorAbortSignal.reason?.message || 'Aborted by operator');
        break;
      }
      const { value, done } = await readNextChunkOrAbort(reader, operatorAbortSignal);
      if (done) break;
      if (value && value.byteLength > 0) {
        const chunkBuf = Buffer.from(value.buffer, value.byteOffset, value.byteLength);
        try {
          writeAllSync(rawFd, chunkBuf);
          fs.fsyncSync(rawFd);
        } catch (ioError) {
          diskWriteError = {
            code: String(ioError?.code || 'IO_ERROR'),
            message: String(ioError?.message || ioError)
          };
          throw new R1ProviderNativeError('R1_DURABLE_RAW_SSE_WRITE_FAILED', diskWriteError.message, diskWriteError);
        }
        rawSseHash.update(chunkBuf);
        rawSseBytes += chunkBuf.byteLength;

        parserA.pushChunk(value);
        parserB.pushChunk(value);
      }
    }
  } catch (error) {
    if (error instanceof R1ProviderNativeError && error.code === 'R1_DURABLE_RAW_SSE_WRITE_FAILED') {
      streamInterrupted = true;
      streamErrorName = error.code;
      streamErrorMessage = error.message;
    } else {
      streamInterrupted = true;
      operatorStopped = Boolean(
        operatorAbortSignal?.aborted
        || error?.name === 'AbortError'
        || error?.code === 'R1_OPERATOR_SESSION_REVOKED'
      );
      if (operatorStopped) {
        try { await reader.cancel(); } catch { /* ignore */ }
      }
      streamErrorName = String(error?.name || 'STREAM_READ_ERROR').slice(0, 64);
      streamErrorMessage = String(error?.message || error);
    }
  } finally {
    try { fs.fsyncSync(rawFd); } finally { fs.closeSync(rawFd); }
  }

  let resA;
  try {
    resA = parserA.finish();
  } finally {
    fs.closeSync(authoredFd);
  }
  const resB = parserB.finish();

  const rawSseSha256 = rawSseHash.digest('hex');
  const rawDiskStat = hashFileChunkedSync(rawSseFilePath);
  const authoredDiskStat = hashFileChunkedSync(authoredTextFilePath);

  const rawDiskVerified = rawDiskStat.sha256 === rawSseSha256 && rawDiskStat.bytes === rawSseBytes;
  const authoredDiskVerified = (
    authoredDiskStat.sha256 === resA.authoredTextSha256
    && authoredDiskStat.sha256 === resB.authoredTextSha256
    && authoredDiskStat.bytes === resA.authoredUtf8Bytes
  );

  const parserAgreement = (
    !streamInterrupted
    && !diskWriteError
    && !resB.invalidUtf8Detected
    && resA.parseErrors === 0
    && resB.parseErrors === 0
    && resB.endsWithEventDelimiter
    && !resB.hasTrailingFragment
    && resA.authoredTextSha256 === resB.authoredTextSha256
    && resA.authoredUtf8Bytes === resB.authoredUtf8Bytes
    && (resA.finishReason ?? null) === resB.finalFinishReason
    && (resA.promptBlockReason ?? null) === resB.promptBlockReason
    && authoredDiskVerified
    && rawDiskVerified
  );

  const rawUsageMetadata = Object.freeze({
    promptTokenCount: resB.usageMetadata?.promptTokenCount ?? null,
    candidatesTokenCount: resB.usageMetadata?.candidatesTokenCount ?? null,
    thoughtsTokenCount: resB.usageMetadata?.thoughtsTokenCount ?? null,
    cachedContentTokenCount: resB.usageMetadata?.cachedContentTokenCount ?? null,
    totalTokenCount: resB.usageMetadata?.totalTokenCount ?? null
  });

  // Never gate or halt on ceiling comparisons; simply verify valid nonnegative provider integer reporting
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

  const observedModelVersions = resB.modelVersions;
  const exactServedModelMatch = observedModelVersions.length === 1 && observedModelVersions[0] === expectedModel;

  // Use completion witness purely on bounded tail string + observed metadata cleanly without multi-MiB string allocation
  const tailRepresentative = resA.authoredUtf8Bytes > 0 ? (resB.authoredTail || 'x.') : '';
  const completion = observeMarrowlineCompletion(tailRepresentative, {
    finishReason: resB.finalFinishReason,
    promptBlockReason: resB.promptBlockReason
  }, {
    streamed: true,
    parseErrors: resA.parseErrors + resB.parseErrors,
    creative: true
  });

  return Object.freeze({
    schema: 'td613.marrowline.r1-provider-native-sse-capture/v1',
    rawSseFilePath,
    rawSseSha256,
    rawSseBytes,
    rawDiskVerified,
    authoredTextFilePath,
    authoredTextSha256: authoredDiskStat.sha256,
    authoredUtf8Bytes: authoredDiskStat.bytes,
    authoredDiskVerified,
    thoughtSha256: resA.thoughtSha256,
    thoughtUtf8Bytes: resA.thoughtUtf8Bytes,
    streamInterrupted,
    operatorStopped,
    diskWriteError,
    streamErrorName,
    streamErrorMessage,
    parserA: Object.freeze({
      authoredTextSha256: resA.authoredTextSha256,
      authoredUtf8Bytes: resA.authoredUtf8Bytes,
      eventCount: resA.eventCount,
      parseErrors: resA.parseErrors,
      finishReason: resA.finishReason,
      finishMessage: resA.finishMessage,
      promptBlockReason: resA.promptBlockReason,
      modelVersion: resA.modelVersion
    }),
    parserB: Object.freeze({
      authoredTextSha256: resB.authoredTextSha256,
      authoredUtf8Bytes: resB.authoredUtf8Bytes,
      eventCount: resB.eventCount,
      parseErrors: resB.parseErrors,
      duplicateEventCount: resB.duplicateEventCount,
      duplicateFinishEventCount: resB.duplicateFinishEventCount,
      duplicateSseDetected: resB.duplicateSseDetected,
      invalidUtf8Detected: resB.invalidUtf8Detected,
      endsWithEventDelimiter: resB.endsWithEventDelimiter,
      hasTrailingFragment: resB.hasTrailingFragment,
      finishReasons: resB.finishReasons,
      finalFinishReason: resB.finalFinishReason,
      promptBlockReason: resB.promptBlockReason,
      modelVersions: resB.modelVersions
    }),
    parserAgreement,
    exactServedModelMatch,
    observedModelVersions,
    usageMetadata: rawUsageMetadata,
    validUsageMetadata,
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

function createMorphologyAccumulator() {
  const hash = crypto.createHash('sha256');
  const uniqueCodepoints = new Set();
  const depthDistribution = {};
  const nonZeroUniqueDepths = new Set();
  let utf8Bytes = 0;
  let codePointCount = 0;
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
  let nonEmpty = false;
  let sumDecoratedDepth = 0;

  return {
    addRawSegment(rawLineWithNewline, { excludeProtectedForCounts = true } = {}) {
      const buf = Buffer.from(rawLineWithNewline, 'utf8');
      hash.update(buf);
      utf8Bytes += buf.byteLength;
      if (!nonEmpty && rawLineWithNewline.trim().length > 0) nonEmpty = true;

      const sanitized = excludeProtectedForCounts
        ? rawLineWithNewline.replaceAll(R1_NATIVE_COVENANT, ' ').replaceAll(R1_NATIVE_SEAL, ' ')
        : rawLineWithNewline;
      for (const _cp of sanitized) codePointCount += 1;

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
          sumDecoratedDepth += depth;
          nonZeroUniqueDepths.add(depth);
          if (depth >= 2) stackedBaseCount += 1;
          if (depth > maxMarkDepth) maxMarkDepth = depth;

          let hasAbove = false;
          let hasBelow = false;
          for (const mark of marks) {
            const cp = mark.codePointAt(0);
            uniqueCodepoints.add(`U+${cp.toString(16).toUpperCase().padStart(4, '0')}`);
            totalCombiningMarks += 1;
            const placement = classifyCombiningMarkPlacement(cp);
            if (placement === 'overlay') overlayU0334ToU0338Count += 1;
            else if (placement === 'above') { aboveCount += 1; hasAbove = true; }
            else if (placement === 'below') { belowCount += 1; hasBelow = true; }
            else otherMarkCount += 1;
          }
          if (hasAbove && hasBelow) bidirectionalClusterCount += 1;
        }
      }
    },
    finish() {
      const stackedBaseShare = baseClusterCount > 0 ? Number((stackedBaseCount / baseClusterCount).toFixed(6)) : 0;
      const meanMarkDepth = baseClusterCount > 0 ? Number((totalCombiningMarks / baseClusterCount).toFixed(4)) : 0;
      const meanDecoratedDepth = decoratedBaseCount > 0 ? sumDecoratedDepth / decoratedBaseCount : 0;
      let varianceSum = 0;
      if (decoratedBaseCount > 0) {
        for (const [dKey, count] of Object.entries(depthDistribution)) {
          const d = Number(dKey);
          if (d > 0) varianceSum += count * ((d - meanDecoratedDepth) ** 2);
        }
      }
      const depthStdDev = decoratedBaseCount > 0
        ? Number(Math.sqrt(varianceSum / decoratedBaseCount).toFixed(4))
        : 0;
      return Object.freeze({
        sha256: hash.digest('hex'),
        utf8Bytes,
        nonEmpty,
        codePointCount,
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
  };
}

export function measureProviderNativeUnicodeMorphology(rawText = '') {
  const acc = createMorphologyAccumulator();
  for (const line of String(rawText || '').split(/(?<=\n)/)) {
    acc.addRawSegment(line);
  }
  return acc.finish();
}

function classifyHeadingLine(trimmedLine) {
  if (/^(#{1,6}[ \t]*)?Kʰonapolit[ \t]*:?[ \t]*$/iu.test(trimmedLine)) {
    return { section: 1, exactPlainUnmarked: trimmedLine === R1_NATIVE_SECTION1_HEADING };
  }
  if (/^(#{1,6}[ \t]*)?Tauric Diana bots[ \t]*:?[ \t]*$/iu.test(trimmedLine)) {
    return { section: 2, exactPlainUnmarked: trimmedLine === R1_NATIVE_SECTION2_HEADING };
  }
  return null;
}

function boundaryCrossesProtectedToken(text, i) {
  const windowStart = Math.max(0, i - 24);
  const windowSlice = text.slice(windowStart, Math.min(text.length, i + 24));
  const localIdx = i - windowStart;
  for (const token of [R1_NATIVE_COVENANT, R1_NATIVE_SEAL]) {
    let pos = windowSlice.indexOf(token);
    while (pos !== -1) {
      if (localIdx > pos && localIdx < pos + token.length) return true;
      pos = windowSlice.indexOf(token, pos + 1);
    }
  }
  return false;
}

function findSafeGraphemeFlushLength(text, targetLen) {
  const maxScan = Math.min(text.length - 1, targetLen);
  for (let i = maxScan; i >= 1024; i -= 1) {
    const prev = text.charCodeAt(i - 1);
    if (
      (text[i] === ' ' || text[i] === '\t')
      && prev !== 0x200D
      && prev !== 0x200C
      && (prev < 0xD800 || prev > 0xDBFF)
      && !boundaryCrossesProtectedToken(text, i)
    ) {
      return i;
    }
  }
  for (let i = maxScan; i >= 1024; i -= 1) {
    const ch = text[i];
    const prev = text.charCodeAt(i - 1);
    // Avoid splitting surrogate pairs, CR/LF, ZWJ/ZWNJ, protected tokens, or before combining marks / variation selectors
    if (
      prev !== 0x0D
      && prev !== 0x200D
      && prev !== 0x200C
      && (prev < 0xD800 || prev > 0xDBFF)
      && /^[^\p{M}\uDC00-\uDFFF\uFE00-\uFE0F\u200C\u200D]$/u.test(ch)
      && !boundaryCrossesProtectedToken(text, i)
    ) {
      return i;
    }
  }
  // If entire 32 KiB window is one continuous combining-mark cloud, allow larger window unless hitting non-mark
  return -1;
}

// Pass 1: Scans strictly line indices of potential headings (`<= HEADING_MAX_CHARS`),
// discarding oversized non-heading bytes without buffering giant lines in RAM.
function scanHeadingIndicesFromFile(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const chunkBuf = Buffer.allocUnsafe(STREAM_READBACK_CHUNK_BYTES);
  const headingsFound = [];
  let lineBuffer = '';
  let oversizedLine = false;
  let lineIndex = 0;

  function checkLine(rawLine) {
    const match = classifyHeadingLine(rawLine.replace(/\r$/, '').trim());
    if (match) headingsFound.push(Object.freeze({ lineIndex, ...match }));
  }

  try {
    while (true) {
      const read = fs.readSync(fd, chunkBuf, 0, chunkBuf.length, null);
      if (read <= 0) break;
      const decoded = decoder.decode(chunkBuf.subarray(0, read), { stream: true });
      let pos = 0;
      while (pos < decoded.length) {
        const nl = decoded.indexOf('\n', pos);
        if (nl === -1) {
          if (!oversizedLine) {
            if (lineBuffer.length + (decoded.length - pos) > HEADING_MAX_CHARS) {
              oversizedLine = true;
              lineBuffer = '';
            } else {
              lineBuffer += decoded.slice(pos);
            }
          }
          pos = decoded.length;
        } else {
          if (!oversizedLine && lineBuffer.length + (nl - pos) <= HEADING_MAX_CHARS) {
            checkLine(lineBuffer + decoded.slice(pos, nl));
          }
          lineBuffer = '';
          oversizedLine = false;
          lineIndex += 1;
          pos = nl + 1;
        }
      }
    }
    const tail = decoder.decode();
    if (tail) {
      if (!oversizedLine && lineBuffer.length + tail.length <= HEADING_MAX_CHARS) lineBuffer += tail;
      else oversizedLine = true;
    }
    if (!oversizedLine && lineBuffer.length > 0) checkLine(lineBuffer);
  } finally {
    fs.closeSync(fd);
  }
  return headingsFound;
}

// Pass 2: Emits chunk-bounded segments `(segmentTextWithOptionalNewline, lineIndex)`,
// flushing lines > GIANT_LINE_FLUSH_CHARS incrementally at safe grapheme boundaries.
function forEachBoundedSegmentFromFile(filePath, onSegment) {
  const fd = fs.openSync(filePath, 'r');
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const chunkBuf = Buffer.allocUnsafe(STREAM_READBACK_CHUNK_BYTES);
  let carry = '';
  let lineIndex = 0;

  function drainCarry(eof = false) {
    while (true) {
      const nl = carry.indexOf('\n');
      if (nl !== -1 && nl <= GIANT_LINE_FLUSH_CHARS) {
        const seg = carry.slice(0, nl + 1);
        onSegment(seg, lineIndex);
        carry = carry.slice(nl + 1);
        lineIndex += 1;
        continue;
      }
      const pendingLen = nl === -1 ? carry.length : nl;
      if (pendingLen > GIANT_LINE_FLUSH_CHARS) {
        const cut = findSafeGraphemeFlushLength(carry, GIANT_LINE_FLUSH_CHARS);
        if (cut > 0) {
          onSegment(carry.slice(0, cut), lineIndex);
          carry = carry.slice(cut);
          continue;
        }
      }
      if (eof && carry.length > 0) {
        if (nl !== -1) {
          onSegment(carry.slice(0, nl + 1), lineIndex);
          carry = carry.slice(nl + 1);
          lineIndex += 1;
          continue;
        }
        onSegment(carry, lineIndex);
        carry = '';
      }
      break;
    }
  }

  try {
    while (true) {
      const read = fs.readSync(fd, chunkBuf, 0, chunkBuf.length, null);
      if (read <= 0) break;
      carry += decoder.decode(chunkBuf.subarray(0, read), { stream: true });
      drainCarry(false);
    }
    carry += decoder.decode();
    drainCarry(true);
  } finally {
    fs.closeSync(fd);
  }
}

export function analyzeProviderNativeTwoSectionFile({
  authoredTextFilePath,
  condition = 'R1_NATIVE_A',
  section2OutFilePath = null
} = {}) {
  const fileStat = hashFileChunkedSync(authoredTextFilePath);
  const headingsFound = scanHeadingIndicesFromFile(authoredTextFilePath);
  let sec1Count = 0;
  let sec2Count = 0;
  let firstSec1Idx = -1;
  let firstSec2Idx = -1;

  for (const h of headingsFound) {
    if (h.section === 1) {
      sec1Count += 1;
      if (firstSec1Idx === -1) firstSec1Idx = h.lineIndex;
    } else {
      sec2Count += 1;
      if (firstSec2Idx === -1) firstSec2Idx = h.lineIndex;
    }
  }

  const exactHeadingCountOk = sec1Count === 1 && sec2Count === 1;
  const headingOrderOk = exactHeadingCountOk && firstSec1Idx < firstSec2Idx;
  const headingsPlainUnmarked = exactHeadingCountOk && headingsFound.every((h) => h.exactPlainUnmarked);

  const sec1Acc = createMorphologyAccumulator();
  const sec2Acc = createMorphologyAccumulator();
  let nonEmptyPreamble = false;
  let sec2Fd = null;
  let sec2WrittenAny = false;
  if (section2OutFilePath && headingOrderOk) {
    sec2Fd = fs.openSync(section2OutFilePath, 'wx', 0o600);
  }

  try {
    forEachBoundedSegmentFromFile(authoredTextFilePath, (segmentText, lineIndex) => {
      if (exactHeadingCountOk && lineIndex < firstSec1Idx) {
        if (segmentText.trim().length > 0) nonEmptyPreamble = true;
      } else if (headingOrderOk && lineIndex > firstSec1Idx && lineIndex < firstSec2Idx) {
        sec1Acc.addRawSegment(segmentText);
      } else if (headingOrderOk && lineIndex > firstSec2Idx) {
        sec2Acc.addRawSegment(segmentText);
        if (sec2Fd !== null) {
          writeAllSync(sec2Fd, Buffer.from(segmentText, 'utf8'));
          sec2WrittenAny = true;
        }
      }
    });
    if (sec2Fd !== null && sec2WrittenAny) fs.fsyncSync(sec2Fd);
  } finally {
    if (sec2Fd !== null) fs.closeSync(sec2Fd);
  }

  const section1Morphology = sec1Acc.finish();
  const section2Morphology = sec2Acc.finish();
  const bodiesNonEmpty = section1Morphology.nonEmpty && section2Morphology.nonEmpty;

  let section1AssignedStyleOk = false;
  if (condition === 'R1_NATIVE_A') {
    section1AssignedStyleOk = headingOrderOk && bodiesNonEmpty && section1Morphology.stackedBaseCount > 0;
  } else if (condition === 'R1_NATIVE_B') {
    section1AssignedStyleOk = headingOrderOk && bodiesNonEmpty && section1Morphology.totalCombiningMarks === 0;
  }

  const causalComplianceHoldReasons = [];
  if (!exactHeadingCountOk || !headingOrderOk) causalComplianceHoldReasons.push('HEADING_COUNT_OR_ORDER_NONCOMPLIANT');
  if (!headingsPlainUnmarked) causalComplianceHoldReasons.push('HEADINGS_NOT_PLAIN_UNMARKED');
  if (!bodiesNonEmpty) causalComplianceHoldReasons.push('EMPTY_SECTION_BODY');
  if (nonEmptyPreamble) causalComplianceHoldReasons.push('NON_EMPTY_PREAMBLE_BEFORE_SECTION_1');
  if (condition === 'R1_NATIVE_A' && section1Morphology.stackedBaseCount === 0) {
    causalComplianceHoldReasons.push('CONDITION_A_SECTION_1_FAILED_ZALGO_COVERAGE');
  }
  if (condition === 'R1_NATIVE_B' && section1Morphology.totalCombiningMarks > 0) {
    causalComplianceHoldReasons.push('CONDITION_B_SECTION_1_CONTAMINATED_WITH_COMBINING_MARKS');
  }

  return Object.freeze({
    schema: 'td613.marrowline.r1-provider-native-two-section-analysis/v1',
    condition,
    authoredTextFilePath,
    authoredTextSha256: fileStat.sha256,
    authoredUtf8Bytes: fileStat.bytes,
    ...(section2OutFilePath && headingOrderOk ? { section2OutFilePath } : {}),
    exactHeadingCountOk,
    headingOrderOk,
    headingsPlainUnmarked,
    bodiesNonEmpty,
    nonEmptyPreamble,
    section1AssignedStyleOk,
    structuralComplianceOk: causalComplianceHoldReasons.length === 0,
    causalComplianceHoldReasons: Object.freeze(causalComplianceHoldReasons),
    section1Morphology,
    section2Morphology
  });
}

export function buildProviderNativeBlindedEpisodePacket({
  attemptA,
  attemptB,
  episodeId,
  nonceSeed = ''
} = {}) {
  const pair = [
    { condition: 'R1_NATIVE_A', attemptRecord: attemptA },
    { condition: 'R1_NATIVE_B', attemptRecord: attemptB }
  ].map((entry) => ({
    ...entry,
    orderDigest: sha256Hex(`${nonceSeed}:ep${episodeId}:${entry.condition}:${entry.attemptRecord.analysis.section2Morphology.sha256}`)
  }));
  pair.sort((a, b) => a.orderDigest.localeCompare(b.orderDigest));
  const labels = ['BLIND_ARM_ALPHA', 'BLIND_ARM_BETA'];

  const blindedItems = pair.map((entry, idx) => Object.freeze({
    blindLabel: labels[idx],
    episodeId,
    section2FilePath: entry.attemptRecord.analysis.section2OutFilePath || null,
    section2Morphology: entry.attemptRecord.analysis.section2Morphology
  }));

  const unblindingMap = Object.freeze(Object.fromEntries(
    pair.map((entry, idx) => [labels[idx], Object.freeze({
      episodeId,
      condition: entry.condition,
      arm: entry.attemptRecord.arm,
      attemptId: entry.attemptRecord.attemptId,
      authoredTextFilePath: entry.attemptRecord.wire.authoredTextFilePath
    })])
  ));

  return Object.freeze({
    schema: 'td613.marrowline.r1-provider-native-blinded-pair/v1',
    episodeId,
    blindedItems: Object.freeze(blindedItems),
    sealedUnblindingMap: unblindingMap
  });
}

export function classifyProviderNativeEpisodeOutcome({
  attemptA = null,
  attemptB = null,
  totalEpisodesObserved = 1
} = {}) {
  if (!attemptA || !attemptB) {
    return Object.freeze({
      classification: 'HELD',
      empiricalNativeMultistackObserved: false,
      inferenceScope: totalEpisodesObserved > 1 ? 'EXPLORATORY_SEQUENTIAL_MULTI_EPISODE' : 'BOUNDED_SINGLE_PAIR',
      humanArtisticAcceptance: 'RESERVED_HUMAN_ONLY',
      reasons: Object.freeze(['INCOMPLETE_PAIRED_ATTEMPT'])
    });
  }

  const holdReasons = [];
  for (const rec of [attemptA, attemptB]) {
    if (rec.integrityStopReason) holdReasons.push(`${rec.condition}_${rec.integrityStopReason}`);
    if (!rec.wire?.completion?.complete) holdReasons.push(`${rec.condition}_INCOMPLETE_PROVIDER_STOP`);
    if (!rec.wire?.exactServedModelMatch) holdReasons.push(`${rec.condition}_MODEL_VERSION_MISMATCH`);
    if (!rec.wire?.parserAgreement) holdReasons.push(`${rec.condition}_DUAL_PARSER_DISAGREEMENT`);
    if (rec.wire?.parserB?.duplicateSseDetected) holdReasons.push(`${rec.condition}_DUPLICATE_SSE_DETECTED`);
    if (!rec.wire?.validUsageMetadata) holdReasons.push(`${rec.condition}_MISSING_OR_INVALID_PROVIDER_USAGE`);
    if (rec.textIntegrityOk === false) holdReasons.push(`${rec.condition}_ALTERED_UNICODE_TEXT`);
    if (!rec.analysis) {
      holdReasons.push(`${rec.condition}_MISSING_STRUCTURAL_ANALYSIS`);
    } else if (!rec.analysis.structuralComplianceOk) {
      holdReasons.push(...rec.analysis.causalComplianceHoldReasons.map((r) => `${rec.condition}_${r}`));
    }
  }

  if (holdReasons.length > 0) {
    return Object.freeze({
      classification: 'HELD',
      empiricalNativeMultistackObserved: false,
      inferenceScope: totalEpisodesObserved > 1 ? 'EXPLORATORY_SEQUENTIAL_MULTI_EPISODE' : 'BOUNDED_SINGLE_PAIR',
      humanArtisticAcceptance: 'RESERVED_HUMAN_ONLY',
      reasons: Object.freeze(holdReasons)
    });
  }

  const sec2A = attemptA.analysis.section2Morphology;
  const sec2B = attemptB.analysis.section2Morphology;
  const empiricalNativeMultistackObserved = (
    (sec2A.stackedBaseCount > 0 && !sec2A.uniformConstantDepthStencilRisk)
    || (sec2B.stackedBaseCount > 0 && !sec2B.uniformConstantDepthStencilRisk)
  );

  // Predeclared hypothesis: plain Section I (Condition B) suppresses Section-II multistack share
  // relative to Zalgo-both (Condition A), evaluated with genuine non-stencil bidirectional variance.
  const conditionASupportsPrefixEffect = (
    !sec2A.uniformConstantDepthStencilRisk
    && !sec2B.uniformConstantDepthStencilRisk
    && sec2A.uniqueNonZeroDepthCount >= 2
    && sec2A.stackedBaseCount > 0
    && sec2A.stackedBaseShare > sec2B.stackedBaseShare
    && sec2A.maxMarkDepth >= sec2B.maxMarkDepth
    && sec2A.bidirectionalClusterCount > 0
    && sec2A.depthTransitionCount > 0
  );

  return Object.freeze({
    classification: conditionASupportsPrefixEffect
      ? 'FINITE_PREFIX_EFFECT_SUPPORT'
      : 'FINITE_PREFIX_EFFECT_NOT_ESTABLISHED',
    empiricalNativeMultistackObserved,
    inferenceScope: totalEpisodesObserved > 1 ? 'EXPLORATORY_SEQUENTIAL_MULTI_EPISODE' : 'BOUNDED_SINGLE_PAIR',
    humanArtisticAcceptance: 'RESERVED_HUMAN_ONLY',
    reasons: Object.freeze([
      conditionASupportsPrefixEffect
        ? 'CONDITION_A_SECTION_II_MULTISTACK_SHARE_EXCEEDS_CONDITION_B'
        : 'NO_ESTABLISHED_PLAIN_FIRST_SUPPRESSION'
    ])
  });
}

// Pure engine requiring caller-supplied transportFetch, checkedOutHeadSha, and pinnedTrustFingerprintSha256.
// Zero artificial caps: NO maxCalls, NO token ceilings, NO dollar ceilings, NO forced wall-clock timeout, NO 4 MiB SSE limit.
export async function executeProviderNativeCore({
  acknowledgeLiveExecution = false,
  grant = null,
  publicKeyPem = null,
  pinnedTrustFingerprintSha256 = null,
  checkedOutHeadSha = null,
  evidenceDir = null,
  revocationFilePath = null,
  transportFetch = null,
  env = process.env,
  apiKey = null,
  nowMs = Date.now(),
  episodes = [{ episodeId: 1, order: 'A_THEN_B' }],
  measureCountTokens = true,
  checkModelDiscovery = true,
  operatorAbortSignal = null,
  conditionRequestsOverride = null,
  experimentIdOverride = null,
  textIntegrityProbe = null
} = {}) {
  if (acknowledgeLiveExecution !== true) {
    throw new R1ProviderNativeError('R1_LIVE_EXECUTION_NOT_ACKNOWLEDGED', 'Explicit live acknowledgment required');
  }
  if (typeof transportFetch !== 'function') {
    throw new R1ProviderNativeError('R1_MISSING_TRANSPORT_FETCH', 'Caller must supply explicit transportFetch');
  }

  // 1. Verify frozen provider-native A/B wire plan BEFORE reading credentials, claiming nonce, or transport calls
  const plan = buildProviderNativeConditionPlans({ conditionRequestsOverride, experimentIdOverride });

  // 2. Verify operator Ed25519 grant + pinned trust fingerprint + checked-out HEAD BEFORE reading API credentials
  const effectivePublicKeyPem = publicKeyPem ?? env?.TD613_R1_OPERATOR_AUTH_PUBLIC_KEY_PEM ?? null;
  const authVerification = verifyProviderNativeOperatorAuthorization({
    grant,
    publicKeyPem: effectivePublicKeyPem,
    checkedOutHeadSha,
    expectedPlan: plan,
    pinnedTrustFingerprintSha256,
    revocationFilePath,
    nowMs
  });

  // 3. Validate episodes sequence (must be non-empty array of valid paired order objects; NO upper limit on length!)
  if (!Array.isArray(episodes) || episodes.length === 0) {
    throw new R1ProviderNativeError('R1_INVALID_EPISODES_PLAN', 'episodes must specify at least 1 paired comparison entry');
  }
  for (const ep of episodes) {
    if (!ep || (ep.order !== 'A_THEN_B' && ep.order !== 'B_THEN_A')) {
      throw new R1ProviderNativeError('R1_INVALID_EPISODE_ORDER', `Each episode order must be A_THEN_B or B_THEN_A; got ${ep?.order}`);
    }
  }

  // 4. Atomically claim single-host wx nonce & initialize immutable-in-normal-use append-only session journal
  const nonceClaim = claimSingleHostNonceAtomically({
    nonce: authVerification.nonce,
    evidenceDir,
    checkedOutHeadSha,
    grantSha256: authVerification.grantSha256,
    sessionId: authVerification.sessionId,
    issuedAt: authVerification.issuedAt
  });

  const evidenceJournalPath = path.join(evidenceDir, `r1-native-${authVerification.sessionId}-${authVerification.nonce}-journal.jsonl`);
  const jInitFd = fs.openSync(evidenceJournalPath, 'wx', 0o600);
  fs.closeSync(jInitFd);

  function appendJournal(event, details = {}) {
    const line = `${JSON.stringify({
      schema: 'td613.marrowline.r1-provider-native-journal/v1',
      event,
      at: new Date().toISOString(),
      experimentId: R1_PROVIDER_NATIVE_EXPERIMENT_ID,
      sessionId: authVerification.sessionId,
      grantSha256: authVerification.grantSha256,
      checkedOutHeadSha,
      ...details
    })}\n`;
    const fd = fs.openSync(evidenceJournalPath, 'a', 0o600);
    try {
      fs.writeSync(fd, line);
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
  }

  appendJournal('R1_NATIVE_AUTHORITY_REDEEMED', {
    model: R1_NATIVE_PINNED_MODEL,
    plannedEpisodes: episodes.length,
    conditions: {
      R1_NATIVE_A: plan.conditions.R1_NATIVE_A.observation.bodySha256,
      R1_NATIVE_B: plan.conditions.R1_NATIVE_B.observation.bodySha256
    }
  });

async function captureHttpErrorCustodyToDisk({
  response,
  endpointKind,
  model,
  bodyFilePath,
  metaFilePath
}) {
  const httpStatus = Number(response?.status || 0);
  const statusText = typeof response?.statusText === 'string' ? response.statusText : '';
  const responseHeaders = response?.headers && typeof response.headers.entries === 'function'
    ? Object.freeze(Object.fromEntries([...response.headers.entries()].map(([k, v]) => [String(k).toLowerCase(), String(v)])))
    : Object.freeze({});

  const hash = crypto.createHash('sha256');
  let rawErrorBodyBytes = 0;
  let bodyReadError = null;
  const bodyFd = fs.openSync(bodyFilePath, 'wx', 0o600);
  try {
    const reader = response?.body?.getReader?.();
    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value && value.byteLength > 0) {
          const buf = Buffer.from(value.buffer, value.byteOffset, value.byteLength);
          writeAllSync(bodyFd, buf);
          fs.fsyncSync(bodyFd);
          hash.update(buf);
          rawErrorBodyBytes += buf.byteLength;
        }
      }
    } else if (typeof response?.arrayBuffer === 'function') {
      const ab = await response.arrayBuffer();
      const buf = Buffer.from(ab);
      if (buf.byteLength > 0) {
        writeAllSync(bodyFd, buf);
        hash.update(buf);
        rawErrorBodyBytes += buf.byteLength;
      }
    }
    fs.fsyncSync(bodyFd);
  } catch (error) {
    bodyReadError = String(error?.message || error);
  } finally {
    fs.closeSync(bodyFd);
  }

  const rawErrorBodySha256 = hash.digest('hex');
  const custody = Object.freeze({
    schema: 'td613.marrowline.r1-provider-http-error-custody/v1',
    endpointKind,
    model,
    httpStatus,
    statusText,
    responseHeaders,
    rawErrorBodyPath: bodyFilePath,
    rawErrorBodySha256,
    rawErrorBodyBytes,
    metaFilePath,
    ...(bodyReadError ? { bodyReadError } : {}),
    capturedAt: new Date().toISOString()
  });

  const metaFd = fs.openSync(metaFilePath, 'wx', 0o600);
  try {
    writeAllSync(metaFd, Buffer.from(`${JSON.stringify(custody, null, 2)}\n`, 'utf8'));
    fs.fsyncSync(metaFd);
  } finally {
    fs.closeSync(metaFd);
  }
  return custody;
}

  // 5. Read API key ONLY after authority + nonce + journal initialized
  const resolvedApiKey = String(apiKey ?? env?.GEMINI_API_KEY ?? '').trim();
  if (!resolvedApiKey) {
    throw new R1ProviderNativeError('R1_MISSING_GEMINI_API_KEY', 'GEMINI_API_KEY missing after authority verification');
  }

  function assertUrlMatchesPinnedModel(url) {
    if (!url.includes(encodeURIComponent(R1_NATIVE_PINNED_MODEL)) && !url.includes(R1_NATIVE_PINNED_MODEL)) {
      throw new R1ProviderNativeError('R1_FORBIDDEN_MODEL_URL', `Blocked non-pinned URL: ${url}`);
    }
  }

  // Live operator STOP / revocation AbortController: monitors caller abort signal AND live
  // revocation file updates continuously so in-flight HTTP requests or SSE streams stop immediately.
  const sessionAbortController = new AbortController();
  const triggerOperatorStop = (reasonCode = 'R1_OPERATOR_SESSION_STOPPED') => {
    if (!sessionAbortController.signal.aborted) {
      sessionAbortController.abort(new R1ProviderNativeError(reasonCode, 'Stopped by active operator signal or revocation'));
    }
  };
  let onCallerAbort = null;
  if (operatorAbortSignal) {
    if (operatorAbortSignal.aborted) triggerOperatorStop('R1_OPERATOR_ABORT_SIGNAL');
    else {
      onCallerAbort = () => triggerOperatorStop('R1_OPERATOR_ABORT_SIGNAL');
      operatorAbortSignal.addEventListener('abort', onCallerAbort, { once: true });
    }
  }
  let revocationWatcher = null;
  let revocationPollTimer = null;
  const checkRevocationLive = () => {
    if (revocationFilePath && isSessionRevokedOnDisk(authVerification.sessionId, revocationFilePath)) {
      triggerOperatorStop('R1_OPERATOR_SESSION_REVOKED');
    }
  };
  if (revocationFilePath) {
    checkRevocationLive();
    try {
      const watchTarget = fs.existsSync(revocationFilePath) ? revocationFilePath : path.dirname(revocationFilePath);
      if (fs.existsSync(watchTarget)) {
        revocationWatcher = fs.watch(watchTarget, { persistent: false }, () => checkRevocationLive());
        revocationWatcher.unref?.();
      }
    } catch { /* ignore watch setup errors; interval fallback still runs */ }
    revocationPollTimer = setInterval(checkRevocationLive, 25);
    revocationPollTimer.unref?.();
  }

  let metadataDiscovery = null;
  let metadataHttpErrorCustody = null;
  let integritySessionHaltReason = null;
  const allAttemptRecords = [];
  const episodeSummaries = [];
  const blindedEpisodes = [];
  let attemptCounter = 0;
  let totalCountTokensCalls = 0;
  let totalGenerationCalls = 0;

  try {
    if (checkModelDiscovery) {
      if (sessionAbortController.signal.aborted) {
        integritySessionHaltReason = 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED';
      } else {
        const metaUrl = geminiModelMetadataUrl(R1_NATIVE_PINNED_MODEL);
        assertUrlMatchesPinnedModel(metaUrl);
        try {
          const metaResp = await transportFetch(metaUrl, {
            method: 'GET',
            headers: geminiRequestHeaders(resolvedApiKey),
            signal: sessionAbortController.signal
          });
          if (!metaResp?.ok) {
            integritySessionHaltReason = 'STOP_ON_MODEL_METADATA_UNAVAILABLE';
            metadataHttpErrorCustody = await captureHttpErrorCustodyToDisk({
              response: metaResp,
              endpointKind: 'modelMetadata',
              model: R1_NATIVE_PINNED_MODEL,
              bodyFilePath: path.join(evidenceDir, `r1-native-${authVerification.sessionId}-${authVerification.nonce}-model-metadata-http-error.body`),
              metaFilePath: path.join(evidenceDir, `r1-native-${authVerification.sessionId}-${authVerification.nonce}-model-metadata-http-error.meta.json`)
            });
            appendJournal('R1_NATIVE_MODEL_METADATA_HTTP_ERROR', metadataHttpErrorCustody);
          } else {
            const metaJson = await metaResp.json().catch(() => ({}));
            const methods = Array.isArray(metaJson?.supportedGenerationMethods) ? metaJson.supportedGenerationMethods : [];
            if (!methods.includes('generateContent')) {
              integritySessionHaltReason = 'STOP_ON_MODEL_METHODS_MISSING';
            } else {
              metadataDiscovery = Object.freeze({
                status: Number(metaResp.status),
                name: metaJson.name || `models/${R1_NATIVE_PINNED_MODEL}`,
                outputTokenLimitReportedByProvider: Number.isInteger(metaJson?.outputTokenLimit) ? metaJson.outputTokenLimit : null,
                inputTokenLimitReportedByProvider: Number.isInteger(metaJson?.inputTokenLimit) ? metaJson.inputTokenLimit : null,
                supportedGenerationMethods: Object.freeze([...methods])
              });
              appendJournal('R1_NATIVE_MODEL_METADATA_OBSERVED', metadataDiscovery);
            }
          }
        } catch (error) {
          if (error instanceof R1ProviderNativeError && error.code.startsWith('R1_FORBIDDEN_')) throw error;
          integritySessionHaltReason = sessionAbortController.signal.aborted
            ? 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED'
            : 'STOP_ON_MODEL_METADATA_TRANSPORT_EXCEPTION';
        }
      }
    }

    for (let epIdx = 0; !integritySessionHaltReason && epIdx < episodes.length; epIdx += 1) {
      const ep = episodes[epIdx];
      const episodeId = ep.episodeId ?? (epIdx + 1);
      const orderedConditionKeys = ep.order === 'B_THEN_A'
        ? ['R1_NATIVE_B', 'R1_NATIVE_A']
        : ['R1_NATIVE_A', 'R1_NATIVE_B'];

      const epRecordsByCondition = {};

      for (const conditionKey of orderedConditionKeys) {
        checkRevocationLive();
        if (sessionAbortController.signal.aborted) {
          integritySessionHaltReason = 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED';
          appendJournal('R1_NATIVE_OPERATOR_STOP_OBSERVED', { episodeId, beforeCondition: conditionKey });
          break;
        }

        const condPlan = plan.conditions[conditionKey];
        attemptCounter += 1;
        const attemptId = attemptCounter;

        // Optional observational :countTokens telemetry ONLY — NEVER a token cap or stopping gate!
        let countTokensMeasurement = null;
        if (measureCountTokens) {
          const ctUrl = geminiCountTokensUrl(condPlan.model);
          assertUrlMatchesPinnedModel(ctUrl);
          totalCountTokensCalls += 1;
          appendJournal('R1_NATIVE_COUNT_TOKENS_ATTEMPT', {
            attemptId,
            episodeId,
            condition: conditionKey,
            countTokensRequestSha256: condPlan.countTokensRequestSha256
          });
          try {
            const ctResp = await transportFetch(ctUrl, {
              method: 'POST',
              headers: geminiRequestHeaders(resolvedApiKey),
              body: condPlan.countTokensWireBody,
              signal: sessionAbortController.signal
            });
            const ctStatus = Number(ctResp?.status || 0);
            if (!ctResp?.ok) {
              const ctErrCustody = await captureHttpErrorCustodyToDisk({
                response: ctResp,
                endpointKind: 'countTokens',
                model: condPlan.model,
                bodyFilePath: path.join(evidenceDir, `r1-native-${authVerification.sessionId}-${authVerification.nonce}-ep${episodeId}-att${attemptId}-${conditionKey}-count-tokens-http-error.body`),
                metaFilePath: path.join(evidenceDir, `r1-native-${authVerification.sessionId}-${authVerification.nonce}-ep${episodeId}-att${attemptId}-${conditionKey}-count-tokens-http-error.meta.json`)
              });
              countTokensMeasurement = Object.freeze({
                httpStatus: ctStatus,
                available: false,
                totalTokens: null,
                httpErrorCustody: ctErrCustody
              });
            } else {
              const ctJson = await ctResp.json().catch(() => ({}));
              const totalTokens = Number.isInteger(ctJson?.totalTokens) ? ctJson.totalTokens : null;
              countTokensMeasurement = Object.freeze({
                httpStatus: ctStatus,
                available: totalTokens !== null && totalTokens > 0,
                totalTokens
              });
            }
          } catch {
            countTokensMeasurement = Object.freeze({ httpStatus: 0, available: false, totalTokens: null });
          }
          appendJournal('R1_NATIVE_COUNT_TOKENS_MEASURED', {
            attemptId,
            episodeId,
            condition: conditionKey,
            ...countTokensMeasurement
          });
          if (sessionAbortController.signal.aborted) {
            integritySessionHaltReason = 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED';
            appendJournal('R1_NATIVE_OPERATOR_STOP_OBSERVED', { episodeId, afterCountTokensCondition: conditionKey });
            break;
          }
        }

        const rawSseFilePath = path.join(evidenceDir, `r1-native-${authVerification.sessionId}-${authVerification.nonce}-ep${episodeId}-att${attemptId}-${conditionKey}.sse`);
        const authoredTextFilePath = path.join(evidenceDir, `r1-native-${authVerification.sessionId}-${authVerification.nonce}-ep${episodeId}-att${attemptId}-${conditionKey}.authored.txt`);
        const httpErrorBodyPath = path.join(evidenceDir, `r1-native-${authVerification.sessionId}-${authVerification.nonce}-ep${episodeId}-att${attemptId}-${conditionKey}.http-error.body`);
        const httpErrorMetaPath = path.join(evidenceDir, `r1-native-${authVerification.sessionId}-${authVerification.nonce}-ep${episodeId}-att${attemptId}-${conditionKey}.http-error.meta.json`);
        const blindToken = sha256Hex(`${authVerification.nonce}:ep${episodeId}:att${attemptId}:${conditionKey}:${condPlan.observation.bodySha256}`).slice(0, 12);
        const section2BlindFilePath = path.join(evidenceDir, `r1-blind-${authVerification.sessionId}-ep${episodeId}-${blindToken}.section2.txt`);

        const genUrl = geminiStreamGenerateContentUrl(condPlan.model);
        assertUrlMatchesPinnedModel(genUrl);
        totalGenerationCalls += 1;
        const startedAt = new Date().toISOString();
        appendJournal('R1_NATIVE_GENERATION_ATTEMPT_PREPARED', {
          attemptId,
          episodeId,
          condition: conditionKey,
          requestBodySha256: condPlan.observation.bodySha256,
          rawSseFilePath
        });

        let httpStatus = null;
        let wire = null;
        let httpErrorCustody = null;
        let callError = null;
        let integrityStopReason = null;

        try {
          const sseResp = await transportFetch(genUrl, {
            method: 'POST',
            headers: geminiRequestHeaders(resolvedApiKey),
            body: condPlan.wireBody,
            signal: sessionAbortController.signal
          });
          httpStatus = Number(sseResp?.status || 0);
          if (!sseResp?.ok) {
            integrityStopReason = httpStatus === 503
              ? 'PROVIDER_HTTP_503_UNAVAILABLE'
              : `PROVIDER_HTTP_${httpStatus || 'ERROR'}`;
            httpErrorCustody = await captureHttpErrorCustodyToDisk({
              response: sseResp,
              endpointKind: 'streamGenerateContent',
              model: condPlan.model,
              bodyFilePath: httpErrorBodyPath,
              metaFilePath: httpErrorMetaPath
            });
          } else {
            wire = await streamAndDualParseProviderSseToDisk({
              response: sseResp,
              expectedModel: condPlan.model,
              rawSseFilePath,
              authoredTextFilePath,
              operatorAbortSignal: sessionAbortController.signal
            });
          }
        } catch (error) {
          if (error instanceof R1ProviderNativeError && error.code.startsWith('R1_FORBIDDEN_')) throw error;
          callError = {
            name: String(error?.name || 'Error'),
            ...(error?.code ? { code: String(error.code) } : {}),
            message: String(error?.message || error)
          };
          integrityStopReason = (
            sessionAbortController.signal.aborted
            || error?.name === 'AbortError'
            || error?.code === 'R1_OPERATOR_SESSION_REVOKED'
          )
            ? 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED'
            : 'STOP_ON_TRANSPORT_EXCEPTION';
        }

        const finishedAt = new Date().toISOString();

        if (!integrityStopReason && wire) {
          if (wire.diskWriteError) integrityStopReason = 'STOP_ON_DURABLE_RAW_SSE_WRITE_FAILED';
          else if (wire.operatorStopped) integrityStopReason = 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED';
          else if (wire.streamInterrupted) integrityStopReason = 'STOP_ON_STREAM_INTERRUPTED';
          else if (!wire.parserAgreement) integrityStopReason = 'STOP_ON_DUAL_PARSER_DISAGREEMENT';
          else if (wire.parserB.duplicateSseDetected) integrityStopReason = 'STOP_ON_DUPLICATE_SSE_STREAM';
          else if (!wire.exactServedModelMatch) integrityStopReason = 'STOP_ON_SERVED_MODEL_VERSION_MISMATCH';
          else if (wire.completion.policyTerminated) {
            integrityStopReason = `STOP_ON_POLICY_TERMINATION_${wire.completion.promptBlockReason || wire.completion.finishReason || 'UNKNOWN'}`;
          } else if (!wire.completion.complete) {
            integrityStopReason = `STOP_ON_INCOMPLETE_COMPLETION_${wire.completion.reason}`;
          } else if (!wire.validUsageMetadata) {
            integrityStopReason = 'STOP_ON_MISSING_OR_INVALID_PROVIDER_USAGE';
          }
        }

        if (typeof textIntegrityProbe === 'function' && wire && fs.existsSync(authoredTextFilePath)) {
          // Allows adversarial tests to inject post-capture normalization/tampering on disk to verify fail-closed detection
          textIntegrityProbe(authoredTextFilePath, conditionKey, episodeId);
        }

        let analysis = null;
        let textIntegrityOk = true;
        if (wire && fs.existsSync(authoredTextFilePath)) {
          const postDiskCheck = hashFileChunkedSync(authoredTextFilePath);
          if (postDiskCheck.sha256 !== wire.authoredTextSha256) {
            textIntegrityOk = false;
            if (!integrityStopReason) integrityStopReason = 'STOP_ON_ALTERED_UNICODE_TEXT';
          }
          analysis = analyzeProviderNativeTwoSectionFile({
            authoredTextFilePath,
            condition: conditionKey,
            section2OutFilePath: section2BlindFilePath
          });
        }

        const record = Object.freeze({
          attemptId,
          episodeId,
          condition: conditionKey,
          arm: condPlan.arm,
          model: condPlan.model,
          requestBodySha256: condPlan.observation.bodySha256,
          countTokensRequestSha256: condPlan.countTokensRequestSha256,
          countTokensMeasurement,
          httpStatus,
          startedAt,
          finishedAt,
          rawSseFilePath: wire?.rawSseFilePath || null,
          authoredTextFilePath: wire?.authoredTextFilePath || null,
          httpErrorCustody,
          error: callError,
          wire,
          textIntegrityOk,
          integrityStopReason,
          analysis
        });

        allAttemptRecords.push(record);
        epRecordsByCondition[conditionKey] = record;

        appendJournal('R1_NATIVE_ATTEMPT_RECORDED', {
          attemptId,
          episodeId,
          condition: conditionKey,
          httpStatus,
          rawSseSha256: wire?.rawSseSha256 ?? null,
          rawSseBytes: wire?.rawSseBytes ?? null,
          authoredTextSha256: wire?.authoredTextSha256 ?? null,
          httpErrorCustody,
          usageMetadata: wire?.usageMetadata ?? null,
          integrityStopReason,
          structuralComplianceOk: analysis?.structuralComplianceOk ?? false
        });

        if (integrityStopReason === 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED') {
          integritySessionHaltReason = 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED';
          break;
        }
      }

      const epOutcome = classifyProviderNativeEpisodeOutcome({
        attemptA: epRecordsByCondition.R1_NATIVE_A || null,
        attemptB: epRecordsByCondition.R1_NATIVE_B || null,
        totalEpisodesObserved: episodes.length
      });
      const blindPair = (epRecordsByCondition.R1_NATIVE_A?.analysis && epRecordsByCondition.R1_NATIVE_B?.analysis)
        ? buildProviderNativeBlindedEpisodePacket({
          attemptA: epRecordsByCondition.R1_NATIVE_A,
          attemptB: epRecordsByCondition.R1_NATIVE_B,
          episodeId,
          nonceSeed: authVerification.nonce
        })
        : null;

      episodeSummaries.push(Object.freeze({
        episodeId,
        order: ep.order,
        outcome: epOutcome
      }));
      if (blindPair) blindedEpisodes.push(blindPair);
    }
  } finally {
    if (revocationPollTimer) clearInterval(revocationPollTimer);
    if (revocationWatcher) try { revocationWatcher.close(); } catch { /* ignore */ }
    if (operatorAbortSignal && onCallerAbort) {
      try { operatorAbortSignal.removeEventListener('abort', onCallerAbort); } catch { /* ignore */ }
    }
  }

  appendJournal('R1_NATIVE_SESSION_CLOSED', {
    integritySessionHaltReason,
    totalAttempts: allAttemptRecords.length,
    totalCountTokensCalls,
    totalGenerationCalls,
    episodeClassifications: episodeSummaries.map((e) => ({ episodeId: e.episodeId, classification: e.outcome.classification }))
  });

  return Object.freeze({
    schema: R1_NATIVE_RUNNER_SCHEMA,
    experimentId: R1_PROVIDER_NATIVE_EXPERIMENT_ID,
    covenant: R1_NATIVE_COVENANT,
    seal: R1_NATIVE_SEAL,
    authorization: authVerification,
    nonceClaim,
    evidenceJournalPath,
    metadataDiscovery,
    ...(metadataHttpErrorCustody ? { metadataHttpErrorCustody } : {}),
    integritySessionHaltReason,
    dispatchCounts: Object.freeze({
      countTokensCalls: totalCountTokensCalls,
      generationCalls: totalGenerationCalls,
      attemptsRecorded: allAttemptRecords.length,
      episodesPlanned: episodes.length,
      episodesCompleted: episodeSummaries.length
    }),
    attemptRecords: Object.freeze(allAttemptRecords),
    episodeSummaries: Object.freeze(episodeSummaries),
    blindedEpisodes: Object.freeze(blindedEpisodes),
    humanArtisticAcceptance: 'RESERVED_HUMAN_ONLY'
  });
}
