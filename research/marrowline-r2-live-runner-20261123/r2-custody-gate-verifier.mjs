// TD613 · Marrowline R2 · Cryptographic & On-Disk Physical Custody Gate Verifier
// Commission: TD613-MARROWLINE-R2-LIVE-RUNNER-20261123
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// Closes the Gate integration boundary: never promotes caller-supplied booleans or naked hashes;
// independently verifies Ed25519 signature, SPKI fingerprint, HEAD, frozen manifest digests,
// exclusive wx nonce file, append-only journal, raw .sse disk SHA-256 & re-parse, and .authored.txt SHA-256.

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  FORBIDDEN_CEILING_GRANT_FIELDS,
  MAX_FUTURE_ISSUED_SKEW_MS,
  R1ProviderNativeError,
  STREAM_READBACK_CHUNK_BYTES,
  canonicalJson,
  isSessionRevokedOnDisk
} from '../marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-core.mjs';
import { evaluateR2DromologicalGate } from '../marrowline-r2-dual-estate-20261123/r2-dromological-gate.mjs';
import {
  R2_U_EXPERIMENT_ID,
  R2_U_PINNED_MODEL,
  R2_U_PUBLISHED_OUTPUT_CAPACITY,
  R2_U_THINKING_LEVEL,
  buildR2URequests,
  buildR2UWireManifest
} from '../marrowline-r2-dual-estate-20261123/r2-u-preflight.mjs';
import {
  R2_W_EXPERIMENT_ID,
  R2_W_PINNED_MODEL,
  buildR2WRequests,
  buildR2WWireManifest
} from '../marrowline-r2-dual-estate-20261123/r2-w-preflight.mjs';
import { serializeGeminiRequest } from '../../server/khonapolit-quality.js';
import {
  getR2PlanPreset,
  validateAcquisitionEpisodesForEstate
} from './r2-acquisition-plans.mjs';

export const R2_CUSTODY_VERIFIER_SCHEMA = 'td613.marrowline.r2-physical-custody-gate/v1';
export const R2_TRUSTED_COVENANT = 'Khona\u200Clit-po';
export const R2_TRUSTED_SEAL = '⟐SAC[X6ZNK5NO51]';
export const R2_CALIBRATED_MONOTONIC_TIMEBASE = 'SINGLE_PROCESS_HRTIME_MONOTONIC_CALIBRATED_MS';

export const R2_ESTATE_SPECS = Object.freeze({
  'R2-U': Object.freeze({
    estate: 'R2-U',
    grantSchema: 'td613.marrowline.r2-u-observation-authorization/v1-ed25519',
    domainSeparator: 'TD613_R2_U_AUTH_V1',
    experimentId: R2_U_EXPERIMENT_ID,
    filePrefix: 'r2-u',
    forbiddenOtherPrefixes: Object.freeze(['r2-w-', 'r1-native-', 'r1-blind-']),
    pinnedModel: R2_U_PINNED_MODEL,
    thinkingLevel: R2_U_THINKING_LEVEL,
    publishedOutputCapacity: R2_U_PUBLISHED_OUTPUT_CAPACITY
  }),
  'R2-W': Object.freeze({
    estate: 'R2-W',
    grantSchema: 'td613.marrowline.r2-w-observation-authorization/v1-ed25519',
    domainSeparator: 'TD613_R2_W_AUTH_V1',
    experimentId: R2_W_EXPERIMENT_ID,
    filePrefix: 'r2-w',
    forbiddenOtherPrefixes: Object.freeze(['r2-u-', 'r1-native-', 'r1-blind-']),
    pinnedModel: R2_W_PINNED_MODEL,
    thinkingLevel: R2_U_THINKING_LEVEL,
    publishedOutputCapacity: R2_U_PUBLISHED_OUTPUT_CAPACITY
  })
});

export function resolveFixedHostNonceRegistryDir(estate, env = process.env) {
  const spec = R2_ESTATE_SPECS[estate];
  if (!spec) {
    throw new R2ObservationError('R2_UNKNOWN_ESTATE', `Unknown estate ${estate}`);
  }
  const home = typeof os.homedir === 'function' ? os.homedir() : '';
  const winBase = env?.LOCALAPPDATA
    || (env?.USERPROFILE ? path.join(env.USERPROFILE, 'AppData', 'Local') : (home ? path.join(home, 'AppData', 'Local') : ''));
  const posixBase = env?.XDG_STATE_HOME || (env?.HOME ? path.join(env.HOME, '.local', 'state') : (home ? path.join(home, '.local', 'state') : ''));
  const base = process.platform === 'win32' ? winBase : posixBase;
  if (!base || !path.isAbsolute(base)) {
    throw new R2ObservationError('R2_HOST_NONCE_REGISTRY_UNRESOLVABLE', `Cannot resolve absolute non-relocatable host nonce registry path for ${estate}`);
  }
  return process.platform === 'win32'
    ? path.join(base, 'TD613', 'marrowline-r2', 'host-nonce-registry', spec.filePrefix)
    : path.join(base, 'td613', 'marrowline-r2', 'host-nonce-registry', spec.filePrefix);
}

/**
 * Canonicalizes the human operator's authorized execution plan & episode order.
 * Episode scope here defines human consent boundary, NOT an artificial output-token/byte/retry ceiling.
 */
export function computeR2PlanConsentScope({ estate, planId = 'INITIAL_PILOT', episodes = null } = {}) {
  const spec = R2_ESTATE_SPECS[estate];
  if (!spec) {
    throw new R2ObservationError('R2_UNKNOWN_ESTATE', `Unknown R2 estate: ${estate}`);
  }
  const resolvedPlanId = String(planId || '').trim() || 'INITIAL_PILOT';
  const rawEpisodes = episodes ?? getR2PlanPreset(estate, resolvedPlanId).episodes;
  const validated = validateAcquisitionEpisodesForEstate(estate, rawEpisodes);
  const normalizedEpisodes = validated.map((ep) => Object.freeze({
    episodeId: ep.episodeId,
    ...(ep.contrastId ? { contrastId: ep.contrastId } : {}),
    ...(ep.scenarioId ? { scenarioId: ep.scenarioId } : {}),
    order: ep.order,
    sequence: Object.freeze([...ep.sequence])
  }));
  const canonicalScopeObj = {
    estate,
    planId: resolvedPlanId,
    episodeCount: normalizedEpisodes.length,
    episodes: normalizedEpisodes
  };
  const planDigestSha256 = sha256HexBuffer(Buffer.from(canonicalJson(canonicalScopeObj), 'utf8'));
  return Object.freeze({
    ...canonicalScopeObj,
    episodes: Object.freeze(normalizedEpisodes),
    planDigestSha256
  });
}

export class R2ObservationError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'R2ObservationError';
    this.code = code;
    if (details) this.details = details;
  }
}

export function sha256HexBuffer(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export function hashFileChunkedSync(filePath) {
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

export function buildExpectedEstatePlan(estate) {
  const spec = R2_ESTATE_SPECS[estate];
  if (!spec) {
    throw new R2ObservationError('R2_UNKNOWN_ESTATE', `Unknown R2 estate: ${estate}`);
  }
  if (estate === 'R2-U') {
    const manifest = buildR2UWireManifest();
    const requests = buildR2URequests();
    const conditions = {};
    for (const armEntry of manifest.arms) {
      const req = requests[armEntry.armId];
      const serialized = serializeGeminiRequest(req, spec.pinnedModel);
      const countTokensReq = {
        generateContentRequest: {
          model: `models/${spec.pinnedModel}`,
          systemInstruction: req.systemInstruction,
          contents: req.contents,
          generationConfig: req.generationConfig
        }
      };
      const countTokensWireBody = JSON.stringify(countTokensReq);
      conditions[armEntry.armId] = Object.freeze({
        slotId: armEntry.armId,
        model: spec.pinnedModel,
        request: req,
        wireBody: serialized.body,
        observation: armEntry.observation,
        countTokensWireBody,
        countTokensRequestSha256: armEntry.countTokensRequestSha256
      });
    }
    return Object.freeze({
      estate,
      spec,
      manifest,
      generationConfigSha256: manifest.sharedInvariants.generationConfigSha256,
      generationConfig: manifest.sharedInvariants.generationConfig,
      conditions: Object.freeze(conditions)
    });
  }

  const manifest = buildR2WWireManifest();
  const requests = buildR2WRequests();
  const conditions = {};
  const allManifestConds = [
    ...manifest.conditions.map((c) => ({ ...c, scenarioId: 'W_SCENARIO_CIVIC_TRIBUNAL' })),
    ...manifest.nonCivicArtisticWitness.conditions.map((c) => ({
      ...c,
      scenarioId: manifest.nonCivicArtisticWitness.scenarioId
    }))
  ];
  for (const condEntry of allManifestConds) {
    const req = requests[condEntry.conditionId];
    const serialized = serializeGeminiRequest(req, spec.pinnedModel);
    const countTokensReq = {
      generateContentRequest: {
        model: `models/${spec.pinnedModel}`,
        systemInstruction: req.systemInstruction,
        contents: req.contents,
        generationConfig: req.generationConfig
      }
    };
    const countTokensWireBody = JSON.stringify(countTokensReq);
    conditions[condEntry.conditionId] = Object.freeze({
      slotId: condEntry.conditionId,
      scenarioId: condEntry.scenarioId,
      model: spec.pinnedModel,
      request: req,
      wireBody: serialized.body,
      observation: condEntry.observation,
      countTokensWireBody,
      countTokensRequestSha256: condEntry.countTokensRequestSha256
    });
  }
  return Object.freeze({
    estate,
    spec,
    manifest,
    generationConfigSha256: manifest.sharedInvariants.generationConfigSha256,
    generationConfig: manifest.sharedInvariants.generationConfig,
    conditions: Object.freeze(conditions)
  });
}

export function canonicalizeR2AuthorizationPayload(estate, payload) {
  const spec = R2_ESTATE_SPECS[estate];
  if (!spec) {
    throw new R2ObservationError('R2_UNKNOWN_ESTATE', `Unknown R2 estate: ${estate}`);
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new R2ObservationError('R2_AUTH_MALFORMED', 'Authorization payload must be a non-null JSON object');
  }
  return `${spec.domainSeparator}\n${canonicalJson(payload)}`;
}

export function verifyR2OperatorAuthorization({
  estate,
  grant,
  publicKeyPem,
  checkedOutHeadSha,
  expectedPlan = null,
  pinnedTrustFingerprintSha256 = null,
  revocationFilePath = null,
  requestedPlanId = null,
  requestedEpisodes = null,
  nowMs = Date.now()
} = {}) {
  const spec = R2_ESTATE_SPECS[estate];
  if (!spec) {
    throw new R2ObservationError('R2_UNKNOWN_ESTATE', `Unknown R2 estate: ${estate}`);
  }
  if (!grant || typeof grant !== 'object' || Array.isArray(grant)) {
    throw new R2ObservationError('R2_AUTH_MISSING', `Signed Ed25519 ${estate} authorization grant is required`);
  }
  const { payload, signatureBase64, algorithm } = grant;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new R2ObservationError('R2_AUTH_MALFORMED', 'Authorization grant missing payload');
  }
  if (typeof payload.schema !== 'string') {
    throw new R2ObservationError('R2_AUTH_SCHEMA_MISMATCH', 'Authorization payload missing schema');
  }
  if (payload.schema.startsWith('td613.marrowline.argon')) {
    throw new R2ObservationError('R2_AUTH_ARGON_GRANT_FORBIDDEN', `Argon grant schema ${payload.schema} cannot authorize ${estate}`);
  }
  if (payload.schema.startsWith('td613.marrowline.r1-')) {
    throw new R2ObservationError('R2_AUTH_R1_GRANT_FORBIDDEN', `R1 grant schema ${payload.schema} cannot authorize ${estate}`);
  }
  if (
    (estate === 'R2-U' && payload.schema.includes('.r2-w-'))
    || (estate === 'R2-W' && payload.schema.includes('.r2-u-'))
  ) {
    throw new R2ObservationError(
      'R2_AUTH_CROSS_ESTATE_SCOPE_MISMATCH',
      `Cross-estate grant rejected: ${payload.schema} cannot authorize ${estate}`
    );
  }
  if (payload.schema !== spec.grantSchema) {
    throw new R2ObservationError('R2_AUTH_SCHEMA_MISMATCH', `Expected ${spec.grantSchema}; got ${payload.schema}`);
  }
  if (payload.estate !== estate) {
    throw new R2ObservationError(
      'R2_AUTH_CROSS_ESTATE_SCOPE_MISMATCH',
      `Grant estate "${payload.estate}" does not match target route "${estate}"`
    );
  }
  if (algorithm !== 'ed25519') {
    throw new R2ObservationError('R2_AUTH_UNSUPPORTED_ALGORITHM', `Expected ed25519 signature; got ${algorithm}`);
  }
  if (typeof signatureBase64 !== 'string' || !signatureBase64.trim()) {
    throw new R2ObservationError('R2_AUTH_MISSING_SIGNATURE', 'Grant missing signatureBase64');
  }
  if (typeof publicKeyPem !== 'string' || !publicKeyPem.trim()) {
    throw new R2ObservationError('R2_AUTH_MISSING_PUBLIC_KEY', 'Independent Ed25519 SPKI public key PEM is required');
  }

  let publicKey;
  try {
    publicKey = crypto.createPublicKey(publicKeyPem);
  } catch (error) {
    throw new R2ObservationError('R2_AUTH_INVALID_PUBLIC_KEY', `Invalid Ed25519 public key: ${error?.message || error}`);
  }
  if (publicKey.asymmetricKeyType !== 'ed25519') {
    throw new R2ObservationError('R2_AUTH_INVALID_PUBLIC_KEY_TYPE', `Expected ed25519 key; got ${publicKey.asymmetricKeyType}`);
  }
  if (typeof pinnedTrustFingerprintSha256 !== 'string' || !/^[0-9a-f]{64}$/.test(pinnedTrustFingerprintSha256)) {
    throw new R2ObservationError(
      'R2_AUTH_TRUST_ANCHOR_NOT_PROVISIONED',
      'No independently operator-pinned Ed25519 public-key SHA-256 fingerprint provisioned in reviewed source'
    );
  }
  const actualFingerprint = sha256HexBuffer(publicKey.export({ type: 'spki', format: 'der' }));
  if (!crypto.timingSafeEqual(Buffer.from(actualFingerprint, 'hex'), Buffer.from(pinnedTrustFingerprintSha256, 'hex'))) {
    throw new R2ObservationError('R2_AUTH_UNTRUSTED_PUBLIC_KEY', 'Presented public key does not match pinned operator trust anchor');
  }

  for (const forbiddenField of FORBIDDEN_CEILING_GRANT_FIELDS) {
    if (Object.hasOwn(payload, forbiddenField)) {
      throw new R2ObservationError(
        'R2_AUTH_FORBIDDEN_ARTIFICIAL_CEILING_IN_GRANT',
        `Grant carries forbidden resource cap field "${forbiddenField}" under zero-artificial-ceilings policy`
      );
    }
  }

  if (payload.experimentId !== spec.experimentId) {
    throw new R2ObservationError('R2_AUTH_EXPERIMENT_MISMATCH', `Grant experimentId mismatch: ${payload.experimentId}`);
  }
  if (payload.pinnedModel !== spec.pinnedModel || payload.thinkingLevel !== spec.thinkingLevel) {
    throw new R2ObservationError('R2_AUTH_MODEL_MISMATCH', `Grant model/thinking mismatch: ${payload.pinnedModel}/${payload.thinkingLevel}`);
  }
  if (payload.sessionMode !== 'OPERATOR_CONTROLLED_UNBOUNDED_OBSERVATION') {
    throw new R2ObservationError('R2_AUTH_SESSION_MODE_MISMATCH', `Expected OPERATOR_CONTROLLED_UNBOUNDED_OBSERVATION; got ${payload.sessionMode}`);
  }
  if (typeof payload.permittedPurpose !== 'string' || !payload.permittedPurpose.trim()) {
    throw new R2ObservationError('R2_AUTH_MISSING_PERMITTED_PURPOSE', 'Grant must declare non-empty permittedPurpose');
  }
  if (payload.covenant !== R2_TRUSTED_COVENANT || !payload.covenant.includes('\u200C') || payload.seal !== R2_TRUSTED_SEAL) {
    throw new R2ObservationError('R2_AUTH_COVENANT_OR_SEAL_MISMATCH', 'Grant covenant (with literal U+200C) or seal mismatch');
  }
  if (typeof payload.authorizedBy !== 'string' || !payload.authorizedBy.trim()) {
    throw new R2ObservationError('R2_AUTH_INVALID_OPERATOR', 'Grant must declare non-empty authorizedBy operator identity');
  }
  if (typeof payload.sessionId !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(payload.sessionId)) {
    throw new R2ObservationError('R2_AUTH_INVALID_SESSION_ID', 'Grant sessionId must match /^[A-Za-z0-9_-]{8,128}$/');
  }
  if (payload.sessionRevoked === true || isSessionRevokedOnDisk(payload.sessionId, revocationFilePath)) {
    throw new R2ObservationError('R2_AUTH_SESSION_REVOKED', `Operator session ${payload.sessionId} is revoked`);
  }
  if (!/^[0-9a-f]{40}$/.test(String(checkedOutHeadSha || '')) || payload.checkedOutHeadSha !== checkedOutHeadSha) {
    throw new R2ObservationError('R2_AUTH_HEAD_MISMATCH', `Grant HEAD (${payload.checkedOutHeadSha}) != checked-out HEAD (${checkedOutHeadSha})`);
  }

  const plan = expectedPlan ?? buildExpectedEstatePlan(estate);
  const slotMap = payload.conditions;
  if (!slotMap || typeof slotMap !== 'object' || Array.isArray(slotMap)) {
    throw new R2ObservationError('R2_AUTH_DIGEST_MISMATCH', `Grant missing exact frozen conditions map for ${estate}`);
  }
  const expectedKeys = Object.keys(plan.conditions).sort();
  const actualKeys = Object.keys(slotMap).sort();
  if (canonicalJson(actualKeys) !== canonicalJson(expectedKeys)) {
    throw new R2ObservationError(
      'R2_AUTH_DIGEST_MISMATCH',
      `Grant conditions keys (${actualKeys.join(',')}) do not match ${estate} frozen slots (${expectedKeys.join(',')})`
    );
  }
  for (const key of expectedKeys) {
    const expectedSlot = plan.conditions[key];
    const grantSlot = slotMap[key];
    if (
      grantSlot?.bodySha256 !== expectedSlot.observation.bodySha256
      || grantSlot?.modelAndBodySha256 !== expectedSlot.observation.modelAndBodySha256
      || grantSlot?.countTokensRequestSha256 !== expectedSlot.countTokensRequestSha256
    ) {
      throw new R2ObservationError('R2_AUTH_DIGEST_MISMATCH', `Grant wire digests for ${estate}.${key} do not match frozen manifest`);
    }
  }

  if (
    payload.generationConfigSha256 !== plan.generationConfigSha256
    || canonicalJson(payload.generationConfig) !== canonicalJson(plan.generationConfig)
    || payload.generationConfig?.maxOutputTokens !== spec.publishedOutputCapacity
  ) {
    throw new R2ObservationError(
      'R2_AUTH_CONFIG_MISMATCH',
      `Grant generationConfig must match published capacity config (maxOutputTokens: ${spec.publishedOutputCapacity})`
    );
  }

  // Bind signed human consent to exact planId, episodeCount, ordered episodes, and planDigestSha256
  if (
    typeof payload.planId !== 'string'
    || !payload.planId.trim()
    || !Number.isSafeInteger(payload.episodeCount)
    || payload.episodeCount < 1
    || !Array.isArray(payload.episodes)
    || typeof payload.planDigestSha256 !== 'string'
    || !/^[0-9a-f]{64}$/.test(payload.planDigestSha256)
  ) {
    throw new R2ObservationError(
      'R2_AUTH_MISSING_PLAN_SCOPE',
      `Grant must explicitly sign planId, episodeCount, ordered episodes, and planDigestSha256`
    );
  }
  let grantPlanScope;
  try {
    grantPlanScope = computeR2PlanConsentScope({
      estate,
      planId: payload.planId,
      episodes: payload.episodes
    });
  } catch (error) {
    throw new R2ObservationError(
      'R2_AUTH_PLAN_SCOPE_MISMATCH',
      `Grant signed episodes invalid for ${estate}: ${error?.message || error}`
    );
  }
  if (
    payload.episodeCount !== grantPlanScope.episodeCount
    || payload.planDigestSha256 !== grantPlanScope.planDigestSha256
    || canonicalJson(payload.episodes) !== canonicalJson(grantPlanScope.episodes)
  ) {
    throw new R2ObservationError(
      'R2_AUTH_PLAN_DIGEST_MISMATCH',
      `Grant planDigestSha256 or episode count mismatch for ${payload.planId}`
    );
  }
  if (requestedPlanId !== null || requestedEpisodes !== null) {
    let runtimeRequestedScope;
    try {
      runtimeRequestedScope = computeR2PlanConsentScope({
        estate,
        planId: requestedPlanId ?? (requestedEpisodes ? 'CUSTOM' : payload.planId),
        episodes: requestedEpisodes
      });
    } catch (error) {
      throw new R2ObservationError(
        'R2_AUTH_PLAN_SCOPE_MISMATCH',
        `Requested runtime execution plan invalid for ${estate}: ${error?.message || error}`
      );
    }
    if (runtimeRequestedScope.planDigestSha256 !== grantPlanScope.planDigestSha256) {
      throw new R2ObservationError(
        'R2_AUTH_PLAN_SCOPE_MISMATCH',
        `Requested runtime plan (${runtimeRequestedScope.planId}, digest ${runtimeRequestedScope.planDigestSha256}) does not match signed human grant (${grantPlanScope.planId}, digest ${grantPlanScope.planDigestSha256})`
      );
    }
  }

  if (typeof payload.nonce !== 'string' || !/^[A-Za-z0-9_-]{16,128}$/.test(payload.nonce)) {
    throw new R2ObservationError('R2_AUTH_INVALID_NONCE', 'Grant nonce must match /^[A-Za-z0-9_-]{16,128}$/');
  }

  const issuedAtMs = Date.parse(payload.issuedAt);
  if (!Number.isFinite(issuedAtMs)) {
    throw new R2ObservationError('R2_AUTH_INVALID_ISSUED_AT', 'Grant issuedAt must be a valid ISO-8601 timestamp');
  }
  if (issuedAtMs > nowMs + MAX_FUTURE_ISSUED_SKEW_MS) {
    throw new R2ObservationError('R2_AUTH_ISSUED_IN_FUTURE', 'Grant issuedAt is unreasonably in the future');
  }
  if (payload.notAfter !== undefined && payload.notAfter !== null) {
    const notAfterMs = Date.parse(payload.notAfter);
    if (!Number.isFinite(notAfterMs)) {
      throw new R2ObservationError('R2_AUTH_INVALID_NOT_AFTER', 'Optional grant notAfter must be a valid ISO-8601 timestamp');
    }
    if (notAfterMs <= nowMs) {
      throw new R2ObservationError('R2_AUTH_SESSION_ENDED', `Operator-declared session notAfter ${payload.notAfter} has passed`);
    }
  }

  const canonicalMessage = canonicalizeR2AuthorizationPayload(estate, payload);
  const signingBytes = Buffer.from(canonicalMessage, 'utf8');
  let signatureBuffer;
  try {
    signatureBuffer = Buffer.from(signatureBase64, 'base64');
  } catch {
    throw new R2ObservationError('R2_AUTH_INVALID_SIGNATURE', 'Malformed base64 signature');
  }
  if (signatureBuffer.length !== 64 || !crypto.verify(null, signingBytes, publicKey, signatureBuffer)) {
    throw new R2ObservationError('R2_AUTH_INVALID_SIGNATURE', 'Ed25519 signature verification failed');
  }

  return Object.freeze({
    verified: true,
    estate,
    schema: payload.schema,
    domainSeparator: spec.domainSeparator,
    experimentId: payload.experimentId,
    sessionId: payload.sessionId,
    permittedPurpose: payload.permittedPurpose,
    checkedOutHeadSha: payload.checkedOutHeadSha,
    authorizedBy: payload.authorizedBy,
    planId: grantPlanScope.planId,
    episodeCount: grantPlanScope.episodeCount,
    planDigestSha256: grantPlanScope.planDigestSha256,
    nonce: payload.nonce,
    issuedAt: payload.issuedAt,
    notAfter: payload.notAfter ?? null,
    grantSha256: sha256HexBuffer(signingBytes),
    signatureSha256: sha256HexBuffer(signatureBuffer),
    publicKeySha256: actualFingerprint
  });
}

/**
 * Independently reads raw .sse bytes directly from disk and extracts authored text,
 * finishReason, modelVersion, and usageMetadata without trusting caller caches.
 */
export function parseRawSseFileIndependently(rawSseFilePath) {
  const rawDiskStat = hashFileChunkedSync(rawSseFilePath);
  const rawBuf = fs.readFileSync(rawSseFilePath);
  const rawText = rawBuf.toString('utf8');
  if (Buffer.byteLength(rawText, 'utf8') !== rawBuf.byteLength) {
    return Object.freeze({ valid: false, reason: 'INVALID_UTF8_IN_RAW_SSE', ...rawDiskStat });
  }
  const normalized = rawText.replace(/\r\n/g, '\n');
  const endsWithEventDelimiter = normalized.endsWith('\n\n');
  const rawEvents = normalized.split('\n\n');
  const trailing = rawEvents.pop();
  if (!endsWithEventDelimiter || (trailing && trailing.trim().length > 0)) {
    return Object.freeze({ valid: false, reason: 'INCOMPLETE_OR_TRUNCATED_SSE_TAIL', ...rawDiskStat });
  }

  const authoredChunks = [];
  const finishReasons = [];
  const modelVersions = new Set();
  let promptBlockReason = null;
  let lastUsageMetadata = null;
  let eventCount = 0;

  for (const frame of rawEvents) {
    if (!frame.trim()) continue;
    const dataLines = frame
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).replace(/^ /, ''));
    if (dataLines.length === 0) continue;
    const payloadStr = dataLines.join('\n').trim();
    if (!payloadStr || payloadStr === '[DONE]') continue;

    let parsed;
    try {
      parsed = JSON.parse(payloadStr);
    } catch {
      return Object.freeze({ valid: false, reason: 'MALFORMED_SSE_JSON_EVENT', ...rawDiskStat });
    }
    eventCount += 1;
    if (typeof parsed?.modelVersion === 'string' && parsed.modelVersion.trim()) {
      modelVersions.add(parsed.modelVersion.trim());
    }
    if (parsed?.promptFeedback?.blockReason) {
      promptBlockReason = String(parsed.promptFeedback.blockReason);
    }
    if (parsed?.usageMetadata && typeof parsed.usageMetadata === 'object') {
      lastUsageMetadata = parsed.usageMetadata;
    }
    const candidates = Array.isArray(parsed?.candidates) ? parsed.candidates : [];
    for (const cand of candidates) {
      if (cand?.finishReason) finishReasons.push(String(cand.finishReason));
      const parts = Array.isArray(cand?.content?.parts) ? cand.content.parts : [];
      for (const part of parts) {
        if (part && part.thought !== true && typeof part.text === 'string') {
          authoredChunks.push(part.text);
        }
      }
    }
  }

  const authoredText = authoredChunks.join('');
  const authoredTextSha256 = sha256HexBuffer(Buffer.from(authoredText, 'utf8'));
  const finalFinishReason = finishReasons.length > 0 ? finishReasons[finishReasons.length - 1] : null;
  const usageCountsValid = Boolean(
    lastUsageMetadata
    && Number.isSafeInteger(lastUsageMetadata.promptTokenCount) && lastUsageMetadata.promptTokenCount > 0
    && Number.isSafeInteger(lastUsageMetadata.candidatesTokenCount) && lastUsageMetadata.candidatesTokenCount >= 0
    && Number.isSafeInteger(lastUsageMetadata.thoughtsTokenCount ?? 0) && (lastUsageMetadata.thoughtsTokenCount ?? 0) >= 0
    && Number.isSafeInteger(lastUsageMetadata.totalTokenCount) && lastUsageMetadata.totalTokenCount >= 0
  );

  return Object.freeze({
    valid: true,
    rawSseSha256: rawDiskStat.sha256,
    rawSseBytes: rawDiskStat.bytes,
    eventCount,
    authoredTextSha256,
    authoredUtf8Bytes: Buffer.byteLength(authoredText, 'utf8'),
    finalFinishReason,
    promptBlockReason,
    modelVersions: Object.freeze([...modelVersions]),
    usageCountsValid,
    usageMetadata: lastUsageMetadata
  });
}

function verifyPhysicalAttemptRecord(attempt, { estate, expectedPlan }) {
  const failures = [];
  const slotId = attempt?.slotId;
  const expectedSlot = expectedPlan.conditions[slotId];
  if (!expectedSlot) {
    failures.push(`UNKNOWN_OR_CROSS_ESTATE_SLOT:${slotId}`);
    return { valid: false, failures };
  }
  if (attempt?.requestBodySha256 !== expectedSlot.observation.bodySha256) {
    failures.push(`REQUEST_BODY_SHA256_MISMATCH:${slotId}`);
  }
  if (attempt?.countTokensRequestSha256 !== expectedSlot.countTokensRequestSha256) {
    failures.push(`COUNT_TOKENS_SHA256_MISMATCH:${slotId}`);
  }

  if (attempt?.httpErrorCustody) {
    const errBodyPath = attempt.httpErrorCustody.rawErrorBodyPath;
    if (!errBodyPath || !fs.existsSync(errBodyPath)) {
      failures.push(`MISSING_HTTP_ERROR_BODY_ON_DISK:${slotId}`);
    } else {
      const diskErr = hashFileChunkedSync(errBodyPath);
      if (diskErr.sha256 !== attempt.httpErrorCustody.rawErrorBodySha256) {
        failures.push(`HTTP_ERROR_BODY_SHA256_MISMATCH:${slotId}`);
      }
    }
    return { valid: failures.length === 0, failures, kind: 'HTTP_ERROR_CUSTODY' };
  }

  const rawSsePath = attempt?.rawSseFilePath;
  const authoredPath = attempt?.authoredTextFilePath;
  if (!rawSsePath || !fs.existsSync(rawSsePath)) {
    failures.push(`MISSING_RAW_SSE_FILE:${slotId}`);
    return { valid: false, failures };
  }
  if (!authoredPath || !fs.existsSync(authoredPath)) {
    failures.push(`MISSING_AUTHORED_TEXT_FILE:${slotId}`);
    return { valid: false, failures };
  }

  const reParsed = parseRawSseFileIndependently(rawSsePath);
  if (!reParsed.valid) {
    failures.push(`RAW_SSE_REPARSE_FAILED:${reParsed.reason}:${slotId}`);
    return { valid: false, failures };
  }
  const diskAuthored = hashFileChunkedSync(authoredPath);
  if (diskAuthored.sha256 !== reParsed.authoredTextSha256) {
    failures.push(`AUTHORED_TEXT_DISK_VS_SSE_MISMATCH:${slotId}`);
  }
  if (reParsed.rawSseSha256 !== attempt?.wire?.rawSseSha256 || reParsed.rawSseBytes !== attempt?.wire?.rawSseBytes) {
    failures.push(`RAW_SSE_SHA256_VS_ATTEMPT_MISMATCH:${slotId}`);
  }
  if (diskAuthored.sha256 !== attempt?.wire?.authoredTextSha256) {
    failures.push(`AUTHORED_TEXT_SHA256_VS_ATTEMPT_MISMATCH:${slotId}`);
  }
  if (reParsed.finalFinishReason !== 'STOP' || reParsed.promptBlockReason) {
    failures.push(`NON_STOP_OR_BLOCKED_GENERATION:${reParsed.finalFinishReason || reParsed.promptBlockReason}:${slotId}`);
  }
  if (reParsed.modelVersions.length !== 1 || reParsed.modelVersions[0] !== expectedSlot.model) {
    failures.push(`SERVED_MODEL_MISMATCH:${reParsed.modelVersions.join(',')}:${slotId}`);
  }
  if (!reParsed.usageCountsValid) {
    failures.push(`INVALID_PROVIDER_USAGE_METADATA:${slotId}`);
  }
  if (attempt?.streamDiagnostics && (attempt.streamDiagnostics.postFinishEofTimeoutTriggered === true || attempt.streamDiagnostics.eofObserved === false)) {
    failures.push(`TRANSPORT_EOF_UNWITNESSED:${reParsed.finalFinishReason || 'UNKNOWN'}:${slotId}`);
  }

  return {
    valid: failures.length === 0,
    failures,
    kind: 'VERIFIED_SSE_CAPTURE',
    rawSseSha256: reParsed.rawSseSha256,
    authoredTextSha256: diskAuthored.sha256,
    requestBindingSha256: expectedSlot.observation.bodySha256,
    estate
  };
}

/**
 * Cryptographically and physically verifies ALL custody evidence from original files on disk,
 * ignoring caller-reported booleans as mere claims until independently proven, before calling evaluateR2DromologicalGate.
 */
export function verifyPhysicalR2CustodyAndEvaluateGate({
  estate,
  grant,
  publicKeyPem,
  pinnedTrustFingerprintSha256,
  checkedOutHeadSha,
  expectedPlan = null,
  requestedPlanId = null,
  requestedEpisodes = null,
  evidenceDir,
  hostNonceRegistryDir = null,
  env = process.env,
  revocationFilePath = null,
  receipt = {},
  clockContext = null,
  scientificHypothesisSupported = undefined,
  scientificHypothesisVerdict = undefined,
  humanReview = null,
  explicitReleaseApproved = false,
  reportedClaims = null,
  nowMs = Date.now()
} = {}) {
  const spec = R2_ESTATE_SPECS[estate];
  if (!spec) {
    throw new R2ObservationError('R2_UNKNOWN_ESTATE', `Unknown R2 estate: ${estate}`);
  }
  const plan = expectedPlan ?? buildExpectedEstatePlan(estate);
  const physicalFailures = [];

  // 1. Cryptographic signature verification + plan consent verification (zero trust in reported booleans)
  let authVerified = null;
  try {
    authVerified = verifyR2OperatorAuthorization({
      estate,
      grant,
      publicKeyPem,
      checkedOutHeadSha,
      expectedPlan: plan,
      pinnedTrustFingerprintSha256,
      revocationFilePath,
      requestedPlanId,
      requestedEpisodes,
      nowMs
    });
  } catch (error) {
    physicalFailures.push(`AUTH_VERIFICATION_FAILED:${error?.code || error?.message || error}`);
  }

  // 2. Physical shared host-wide wx nonce registry + session evidence pointer + journal verification
  let nonceJournalValid = false;
  let nonceSha256 = null;
  let journalSha256 = null;
  let resolvedRegistryDir = null;
  try {
    resolvedRegistryDir = hostNonceRegistryDir ?? resolveFixedHostNonceRegistryDir(estate, env);
  } catch (error) {
    physicalFailures.push(`HOST_NONCE_REGISTRY_ERROR:${error?.code || error?.message || error}`);
  }

  if (authVerified && evidenceDir && path.isAbsolute(evidenceDir) && resolvedRegistryDir) {
    const resolvedEvidenceDir = path.resolve(evidenceDir);
    const registryNoncePath = path.join(resolvedRegistryDir, `${spec.filePrefix}-nonce-${authVerified.nonce}.json`);
    const sessionRefPath = path.join(resolvedEvidenceDir, `${spec.filePrefix}-nonce-ref-${authVerified.nonce}.json`);
    const journalPath = path.join(resolvedEvidenceDir, `${spec.filePrefix}-${authVerified.sessionId}-${authVerified.nonce}-journal.jsonl`);

    if (!fs.existsSync(registryNoncePath)) {
      physicalFailures.push('MISSING_HOST_REGISTRY_NONCE_CLAIM_FILE');
    } else {
      try {
        const nonceRaw = fs.readFileSync(registryNoncePath, 'utf8');
        nonceSha256 = sha256HexBuffer(Buffer.from(nonceRaw, 'utf8'));
        const nonceObj = JSON.parse(nonceRaw);
        if (
          nonceObj.nonce !== authVerified.nonce
          || nonceObj.sessionId !== authVerified.sessionId
          || nonceObj.estate !== estate
          || nonceObj.checkedOutHeadSha !== checkedOutHeadSha
          || nonceObj.grantSha256 !== authVerified.grantSha256
          || nonceObj.planDigestSha256 !== authVerified.planDigestSha256
          || path.resolve(String(nonceObj.evidenceDir || '')) !== resolvedEvidenceDir
        ) {
          physicalFailures.push('PHYSICAL_NONCE_CLAIM_BINDING_MISMATCH');
        }
      } catch {
        physicalFailures.push('CORRUPT_PHYSICAL_NONCE_CLAIM_FILE');
      }
    }

    if (!fs.existsSync(sessionRefPath)) {
      physicalFailures.push('MISSING_SESSION_NONCE_POINTER_FILE');
    } else {
      try {
        const refObj = JSON.parse(fs.readFileSync(sessionRefPath, 'utf8'));
        if (
          refObj.nonce !== authVerified.nonce
          || refObj.registryRecordSha256 !== nonceSha256
          || path.resolve(String(refObj.hostNonceRegistryPath || '')) !== path.resolve(registryNoncePath)
        ) {
          physicalFailures.push('SESSION_NONCE_POINTER_MISMATCH');
        }
      } catch {
        physicalFailures.push('CORRUPT_SESSION_NONCE_POINTER_FILE');
      }
    }

    if (!fs.existsSync(journalPath)) {
      physicalFailures.push('MISSING_PHYSICAL_SESSION_JOURNAL');
    } else {
      try {
        const journalRaw = fs.readFileSync(journalPath, 'utf8');
        journalSha256 = sha256HexBuffer(Buffer.from(journalRaw, 'utf8'));
        const lines = journalRaw.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length === 0) {
          physicalFailures.push('EMPTY_PHYSICAL_SESSION_JOURNAL');
        } else {
          let sawRedeemed = false;
          for (const line of lines) {
            const evt = JSON.parse(line);
            if (
              evt.sessionId !== authVerified.sessionId
              || evt.estate !== estate
              || evt.grantSha256 !== authVerified.grantSha256
              || evt.checkedOutHeadSha !== checkedOutHeadSha
            ) {
              physicalFailures.push('JOURNAL_ENTRY_CUSTODY_BINDING_MISMATCH');
              break;
            }
            if (evt.event === 'R2_AUTHORITY_REDEEMED') sawRedeemed = true;
          }
          if (!sawRedeemed) physicalFailures.push('JOURNAL_MISSING_AUTHORITY_REDEEMED');
        }
      } catch {
        physicalFailures.push('CORRUPT_PHYSICAL_SESSION_JOURNAL');
      }
    }
    nonceJournalValid = physicalFailures.length === 0;
  } else if (authVerified) {
    physicalFailures.push('MISSING_ABSOLUTE_EVIDENCE_DIR');
  }

  // 3. Physical wire & raw SSE verification for every recorded attempt
  const attempts = Array.isArray(receipt?.attemptRecords) ? receipt.attemptRecords : [];
  const attemptVerifications = [];
  let wireAllValid = attempts.length > 0;
  let lastValidWire = null;
  if (attempts.length === 0) {
    physicalFailures.push('NO_ATTEMPT_RECORDS_OBSERVED');
  } else {
    for (const attempt of attempts) {
      const check = verifyPhysicalAttemptRecord(attempt, { estate, expectedPlan: plan });
      attemptVerifications.push(Object.freeze({ attemptId: attempt?.attemptId ?? null, slotId: attempt?.slotId ?? null, ...check }));
      if (!check.valid) {
        wireAllValid = false;
        physicalFailures.push(...check.failures);
      } else if (check.kind === 'VERIFIED_SSE_CAPTURE') {
        lastValidWire = check;
      }
    }
  }
  if (!lastValidWire) {
    wireAllValid = false;
    physicalFailures.push('NO_VERIFIED_COMPLETED_SSE_CAPTURE');
  }

  // 4. Validate metadata + clock timebase strictly
  const metaDisc = receipt?.metadataDiscovery;
  const metaValid = Boolean(
    metaDisc
    && Number.isSafeInteger(metaDisc.outputTokenLimitReportedByProvider)
    && metaDisc.outputTokenLimitReportedByProvider === spec.publishedOutputCapacity
  );
  if (!metaValid) {
    physicalFailures.push('UNVERIFIED_OR_MISSING_PROVIDER_CAPACITY_DISCOVERY');
  }

  const rawTimebaseRelation = typeof clockContext?.timebaseRelation === 'string'
    ? clockContext.timebaseRelation.trim()
    : null;
  // Raw Date.now() wall-clock intervals cannot falsely claim monotonic hardware proof
  const isCalibratedMonotonicRelation = rawTimebaseRelation === R2_CALIBRATED_MONOTONIC_TIMEBASE
    && Number.isSafeInteger(clockContext?.calibrationAnchor?.wallAnchorMs)
    && typeof clockContext?.calibrationAnchor?.hrtimeBaseNs === 'string';
  if (clockContext?.timebaseValidated === true && rawTimebaseRelation === 'SINGLE_HOST_MONOTONIC_EPOCH_MS') {
    physicalFailures.push('MISLEADING_MONOTONIC_WALL_CLOCK_CLAIM');
  }
  const orderedClockSamples = [
    clockContext?.clocks?.operatorClockMs,
    clockContext?.clocks?.serviceClockMs,
    clockContext?.clocks?.providerReceiptClockMs,
    clockContext?.clocks?.custodyClockMs,
    clockContext?.clocks?.classificationClockMs
  ].filter((v) => typeof v === 'number' && Number.isSafeInteger(v));
  for (let i = 1; i < orderedClockSamples.length; i += 1) {
    if (orderedClockSamples[i] < orderedClockSamples[i - 1]) {
      physicalFailures.push('CLOCK_CHRONOLOGY_INVERSION');
      break;
    }
  }
  const timebaseDocumented = Boolean(
    clockContext
    && clockContext.timebaseValidated === true
    && isCalibratedMonotonicRelation
  );
  const resolvedPhases = clockContext?.phases ?? {
    noticeAt: null,
    actAt: null,
    worldAnswersAt: null,
    nameAt: null,
    restAvailable: true,
    exitAvailable: true
  };
  if (lastValidWire && (resolvedPhases.noticeAt === null || resolvedPhases.actAt === null || resolvedPhases.worldAnswersAt === null)) {
    physicalFailures.push('MISSING_MEASURED_PHASE_TIMESTAMPS_FOR_COMPLETED_CAPTURE');
  }

  const hasParserOrDiskDisagreement = attempts.some((a) => a?.wire && a.wire.parserAgreement === false)
    || physicalFailures.some((f) => (
      f.startsWith('RAW_SSE_REPARSE_FAILED:')
      || f.startsWith('AUTHORED_TEXT_DISK_VS_SSE_MISMATCH:')
      || f.startsWith('RAW_SSE_SHA256_VS_ATTEMPT_MISMATCH:')
      || f.startsWith('AUTHORED_TEXT_SHA256_VS_ATTEMPT_MISMATCH:')
    ));
  const hasTruncatedOrDuplicateSse = attempts.some((a) => Boolean(a?.wire?.streamInterrupted || a?.wire?.parserB?.duplicateSseDetected));
  const hasServedModelMismatch = attempts.some((a) => a?.wire && a.wire.exactServedModelMatch === false)
    || physicalFailures.some((f) => f.startsWith('SERVED_MODEL_MISMATCH:'));

  // 5. Invoke Dromological Gate ONLY with physically derived proofs and actual measured timestamps (never caller booleans or 1/2/3 placeholders!)
  const gateResult = evaluateR2DromologicalGate({
    sourceStaged: true,
    claimsEmpiricalQualification: true,
    authority: authVerified
      ? {
        signatureValid: true,
        independentSignatureVerification: {
          verified: true,
          signatureSha256: authVerified.signatureSha256,
          trustedPublicKeySha256: authVerified.publicKeySha256,
          verifiedHeadSha256: authVerified.checkedOutHeadSha
        }
      }
      : { signatureValid: false },
    replayProtection: (authVerified && nonceJournalValid && nonceSha256 && journalSha256)
      ? {
        nonceClaimed: true,
        independentJournalVerification: {
          verified: true,
          nonceSha256,
          journalEntryId: `${authVerified.sessionId}:${journalSha256.slice(0, 16)}`
        }
      }
      : { nonceClaimed: false },
    providerMetadata: {
      checked: true,
      ok: metaValid,
      outputTokenLimit: metaDisc?.outputTokenLimitReportedByProvider ?? null,
      expectedOutputTokenLimit: spec.publishedOutputCapacity
    },
    requestDispatched: Boolean(authVerified && nonceJournalValid && metaValid && attempts.length > 0),
    providerResponseObserved: Boolean(authVerified && nonceJournalValid && metaValid && attempts.some((a) => Boolean(a?.rawSseFilePath))),
    wireCapture: (wireAllValid && lastValidWire && physicalFailures.length === 0)
      ? {
        rawCaptureVerified: true,
        parserAgreement: true,
        independentWireVerification: {
          verified: true,
          rawSseSha256: lastValidWire.rawSseSha256,
          requestBindingSha256: lastValidWire.requestBindingSha256,
          dualParserAgreement: true
        }
      }
      : {
        rawCaptureVerified: false,
        ...(hasParserOrDiskDisagreement
          ? { parserAgreement: false }
          : (attempts.length > 0 && attempts.every((a) => a?.wire?.parserAgreement === true)
            ? { parserAgreement: true }
            : {})),
        ...(hasTruncatedOrDuplicateSse ? { truncatedOrDuplicateSse: true } : {}),
        ...(hasServedModelMismatch ? { servedModelMismatch: true } : {})
      },
    scientificHypothesisSupported,
    scientificHypothesisVerdict,
    humanReview: humanReview ?? { verdict: 'PENDING_HUMAN_REVIEW' },
    explicitReleaseApproved,
    phases: resolvedPhases,
    clocks: clockContext?.clocks ?? {
      operatorClockMs: null,
      serviceClockMs: null,
      providerReceiptClockMs: null,
      custodyClockMs: null,
      classificationClockMs: null
    },
    timeBaseValidated: timebaseDocumented
  });

  const physicalVerificationPassed = physicalFailures.length === 0 && !gateResult.held;
  return Object.freeze({
    schema: R2_CUSTODY_VERIFIER_SCHEMA,
    estate,
    physicalVerificationPassed,
    physicalFailures: Object.freeze([...new Set(physicalFailures)]),
    timebaseValidated: timebaseDocumented,
    timebaseRelation: rawTimebaseRelation,
    wallClockSamplesMs: clockContext?.wallClockSamplesMs ?? null,
    reportedVsVerified: Object.freeze({
      callerSuppliedClaimsIgnoredForProof: true,
      reportedClaims: reportedClaims ?? null,
      independentlyVerifiedPhysicalEvidence: Object.freeze({
        cryptographicEd25519Verified: Boolean(authVerified),
        hostNonceRegistryDir: resolvedRegistryDir,
        nonceFileSha256: nonceSha256,
        journalFileSha256: journalSha256,
        verifiedAttemptCount: attemptVerifications.filter((a) => a.valid).length,
        attemptVerifications: Object.freeze(attemptVerifications)
      })
    }),
    gateResult
  });
}

// Re-export R1ProviderNativeError cleanly if callers check instance types during streaming reuse
export { R1ProviderNativeError };
