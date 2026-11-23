// TD613 · Marrowline R2 · Estate-Isolated Offline/Live Observation Core Engine
// Commission: TD613-MARROWLINE-R2-LIVE-RUNNER-20261123
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// SECURITY SEPARATION PROOF:
// Network transport, checked-out HEAD resolution, and pinned trust fingerprint MUST be supplied by the caller.
// Zero ambient network or subprocess execution lives in core.
// Enforces independent R2-U vs R2-W schemas, domain separators, evidence directories,
// counters, outcomes, and cryptographic/disk physical custody gate verification.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  geminiRequestHeaders,
  geminiStreamGenerateContentUrl
} from '../../server/gemini-provider-transport.js';
import {
  geminiCountTokensUrl,
  geminiModelMetadataUrl,
  isSessionRevokedOnDisk,
  streamAndDualParseProviderSseToDisk
} from '../marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-core.mjs';
import {
  R2_U_PINNED_COPY_SPECIMEN,
  buildR2UWireManifest
} from '../marrowline-r2-dual-estate-20261123/r2-u-preflight.mjs';
import {
  evaluateLiteralCopyFidelity,
  evaluateUnicodeMorphology
} from '../marrowline-r2-dual-estate-20261123/r2-unicode-evaluator.mjs';
import {
  buildR2WBlindPacket,
  buildR2WWireManifest,
  evaluateR2WQualitativeRubric
} from '../marrowline-r2-dual-estate-20261123/r2-w-preflight.mjs';
import {
  classifyR2AcquisitionCompletion,
  getR2PlanPreset,
  validateAcquisitionEpisodesForEstate
} from './r2-acquisition-plans.mjs';
import {
  R2_ESTATE_SPECS,
  R2_TRUSTED_COVENANT,
  R2_TRUSTED_SEAL,
  R2ObservationError,
  buildExpectedEstatePlan,
  hashFileChunkedSync,
  sha256HexBuffer,
  verifyPhysicalR2CustodyAndEvaluateGate,
  verifyR2OperatorAuthorization
} from './r2-custody-gate-verifier.mjs';
import {
  buildR2HealthyBaselineCorrelation,
  correlateObservedSection2WithHealthyBaseline
} from './r2-healthy-baseline-correlation.mjs';

export const R2_LIVE_CORE_SCHEMA = 'td613.marrowline.r2-observation-execution/v1';

function writeAllSync(fd, buffer) {
  let offset = 0;
  while (offset < buffer.length) {
    const written = fs.writeSync(fd, buffer, offset, buffer.length - offset, null);
    if (written <= 0) {
      throw new Error('Short write while flushing raw custody bytes');
    }
    offset += written;
  }
}

export function assertIsolatedEvidenceDir(evidenceDir, estate) {
  const spec = R2_ESTATE_SPECS[estate];
  if (!spec) {
    throw new R2ObservationError('R2_UNKNOWN_ESTATE', `Unknown estate ${estate}`);
  }
  if (!evidenceDir || !path.isAbsolute(evidenceDir)) {
    throw new R2ObservationError(
      'R2_EXPLICIT_ABSOLUTE_EVIDENCE_DIR_REQUIRED',
      `Explicit absolute evidenceDir is required for ${estate} single-host nonce and wire custody`
    );
  }
  fs.mkdirSync(evidenceDir, { recursive: true, mode: 0o700 });
  const existing = fs.readdirSync(evidenceDir);
  for (const name of existing) {
    for (const forbiddenPrefix of spec.forbiddenOtherPrefixes) {
      if (name.startsWith(forbiddenPrefix)) {
        throw new R2ObservationError(
          'R2_CROSS_ESTATE_EVIDENCE_DIR_CONTAMINATION',
          `Evidence directory "${evidenceDir}" contains foreign artifact "${name}" (${forbiddenPrefix}*); separate estate directory required`
        );
      }
    }
  }
}

export function claimR2SingleHostNonceAtomically({
  estate,
  nonce,
  evidenceDir,
  checkedOutHeadSha,
  grantSha256,
  sessionId,
  issuedAt,
  claimedAt = new Date().toISOString()
} = {}) {
  const spec = R2_ESTATE_SPECS[estate];
  if (!spec) {
    throw new R2ObservationError('R2_UNKNOWN_ESTATE', `Unknown estate ${estate}`);
  }
  assertIsolatedEvidenceDir(evidenceDir, estate);
  const nonceFilePath = path.join(evidenceDir, `${spec.filePrefix}-nonce-${nonce}.json`);
  const record = {
    schema: 'td613.marrowline.r2-single-host-nonce-claim/v1',
    scopeGuarantee: 'SINGLE_HOST_FILESYSTEM_ATOMIC_WX_ONLY_NOT_CROSS_HOST',
    estate,
    experimentId: spec.experimentId,
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
      throw new R2ObservationError('R2_AUTH_NONCE_REPLAYED', `Nonce ${nonce} already redeemed on this host (${nonceFilePath})`);
    }
    throw new R2ObservationError('R2_NONCE_CLAIM_IO_ERROR', `Failed to claim nonce: ${error?.message || error}`);
  }
  return Object.freeze({
    claimed: true,
    estate,
    nonce,
    nonceFilePath,
    claimedAt,
    scopeGuarantee: 'SINGLE_HOST_FILESYSTEM_ATOMIC_WX_ONLY_NOT_CROSS_HOST'
  });
}

async function captureR2HttpErrorCustodyToDisk({
  response,
  estate,
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
    schema: 'td613.marrowline.r2-provider-http-error-custody/v1',
    estate,
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

function extractSectionsForW(authoredText = '') {
  const raw = String(authoredText ?? '');
  const kMatch = raw.match(/(?:^|\n)[ \t]*(?:#{1,6}[ \t]*)?Kʰonapolit[ \t]*:?[ \t]*(?:\r?\n|$)/u);
  const tMatch = raw.match(/(?:^|\n)[ \t]*(?:#{1,6}[ \t]*)?Tauric Diana bots[ \t]*:?[ \t]*(?:\r?\n|$)/u);
  if (!kMatch || !tMatch || kMatch.index >= tMatch.index) {
    return { valid: false, section1Text: '', section2Text: '' };
  }
  return {
    valid: true,
    section1Text: raw.slice(kMatch.index + kMatch[0].length, tMatch.index).trim(),
    section2Text: raw.slice(tMatch.index + tMatch[0].length).trim()
  };
}

function evaluateSlotObservation({
  estate,
  slotId,
  condPlan,
  wire,
  authoredTextFilePath,
  section2BlindFilePath,
  baselineCorrelation
}) {
  if (!wire || !fs.existsSync(authoredTextFilePath)) return null;
  // Read authored output safely for evaluation (standard text outputs)
  const authoredText = fs.readFileSync(authoredTextFilePath, 'utf8');

  if (estate === 'R2-U') {
    if (slotId === 'R2_U_LITERAL_COPY') {
      const copyEval = evaluateLiteralCopyFidelity(R2_U_PINNED_COPY_SPECIMEN, authoredText);
      return Object.freeze({
        estate: 'R2-U',
        slotId,
        evaluationKind: 'LITERAL_COPY_FIDELITY',
        classification: copyEval.rawByteExact
          ? 'LITERAL_COPY_VERIFIED'
          : copyEval.silentNormalizationDetected
            ? 'LITERAL_COPY_SILENTLY_NORMALIZED'
            : 'LITERAL_COPY_MISMATCH',
        supportsPositiveHypothesis: copyEval.rawByteExact,
        copyFidelity: copyEval
      });
    }
    const morph = evaluateUnicodeMorphology(authoredText);
    const supportsPositive = slotId === 'R2_U_PLAIN_BASELINE'
      ? morph.combiningMarkCount === 0
      : morph.genuineMultistackObserved;
    const classification = slotId === 'R2_U_PLAIN_BASELINE'
      ? (morph.combiningMarkCount === 0 ? 'PLAIN_BASELINE_CLEAN' : 'PLAIN_BASELINE_UNSOLICITED_MARKS')
      : morph.toweringHighZalgoObserved
        ? 'TOWERING_HIGH_ZALGO_OBSERVED'
        : morph.genuineMultistackObserved
          ? 'GENUINE_MULTISTACK_OBSERVED'
          : 'DEPTH_ONE_OR_STENCIL_LIMITED';
    return Object.freeze({
      estate: 'R2-U',
      slotId,
      evaluationKind: 'UNICODE_MORPHOLOGY',
      classification,
      supportsPositiveHypothesis: supportsPositive,
      morphologySummary: Object.freeze({
        utf8Bytes: morph.utf8Bytes,
        combiningMarkCount: morph.combiningMarkCount,
        maxVerticalDepth: morph.maxVerticalDepth,
        tallStackBaseCount: morph.tallStackBaseCount,
        toweringStackBaseCount: morph.toweringStackBaseCount,
        planarBarCount: morph.planarBarCount,
        overlayU0334ToU0338Count: morph.overlayU0334ToU0338Count,
        depthStdDev: morph.depthStdDev,
        isStencil: morph.stencilRisk.isStencil,
        stencilReasons: morph.stencilRisk.reasons,
        genuineMultistackObserved: morph.genuineMultistackObserved,
        toweringHighZalgoObserved: morph.toweringHighZalgoObserved
      })
    });
  }

  // Estate R2-W evaluation: genuine verified capture attestation + source-correlated Oct 2 comparison + blind artifact
  const sections = extractSectionsForW(authoredText);
  if (sections.valid && section2BlindFilePath) {
    fs.writeFileSync(section2BlindFilePath, `${sections.section2Text}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  }
  const verifiedAttestation = Object.freeze({
    rawSseBytesVerified: Boolean(wire.rawDiskVerified),
    rawSseSha256: wire.rawSseSha256,
    independentlyParsedEventsVerified: Boolean(wire.parserAgreement && wire.authoredDiskVerified),
    dualParserAgreement: Boolean(wire.parserAgreement),
    requestBindingSha256: condPlan.observation.bodySha256,
    diskWritten: Boolean(wire.rawDiskVerified && wire.authoredDiskVerified),
    diskCustodySha256: wire.authoredTextSha256
  });

  const rubric = evaluateR2WQualitativeRubric({
    authoredText,
    outputMetadata: {
      finishReason: wire.parserB?.finalFinishReason ?? null,
      promptBlockReason: wire.parserB?.promptBlockReason ?? null,
      streamed: true,
      parseErrors: Number((wire.parserA?.parseErrors || 0) + (wire.parserB?.parseErrors || 0))
    },
    verifiedCaptureAttestation: verifiedAttestation,
    humanJudgment: null
  });

  const baselineComparison = correlateObservedSection2WithHealthyBaseline(
    sections.valid ? sections.section2Text : '',
    baselineCorrelation
  );

  return Object.freeze({
    estate: 'R2-W',
    slotId,
    evaluationKind: 'WHOLE_FRAME_RUBRIC_AND_BASELINE_CORRELATION',
    authoredTextForBlindPacket: authoredText,
    section2BlindFilePath: sections.valid ? section2BlindFilePath : null,
    rubric,
    baselineComparison,
    humanArtisticAuthority: 'RESERVED_HUMAN_ONLY'
  });
}

export async function executeR2ObservationCore({
  estate,
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
  planId = 'INITIAL_PILOT',
  episodes = null,
  measureCountTokens = true,
  checkModelDiscovery = true,
  operatorAbortSignal = null,
  textIntegrityProbe = null,
  onProgress = null
} = {}) {
  const spec = R2_ESTATE_SPECS[estate];
  if (!spec) {
    throw new R2ObservationError('R2_UNKNOWN_ESTATE', `Unsupported R2 estate "${estate}"`);
  }
  if (acknowledgeLiveExecution !== true) {
    throw new R2ObservationError('R2_LIVE_EXECUTION_NOT_ACKNOWLEDGED', `Explicit live acknowledgment required for ${estate}`);
  }
  if (typeof transportFetch !== 'function') {
    throw new R2ObservationError('R2_MISSING_TRANSPORT_FETCH', 'Caller must supply explicit transportFetch');
  }

  const notify = (msg) => {
    if (typeof onProgress === 'function') {
      try { onProgress(msg); } catch { /* ignore listener failure */ }
    }
  };

  // 1. Resolve frozen estate plan and verify operator Ed25519 grant BEFORE reading credentials or mutating disk
  const expectedPlan = buildExpectedEstatePlan(estate);
  const selectedPreset = episodes ? null : getR2PlanPreset(estate, planId);
  const validatedEpisodes = validateAcquisitionEpisodesForEstate(estate, episodes ?? selectedPreset.episodes);

  const effectivePublicKeyPem = publicKeyPem ?? env?.TD613_R2_OPERATOR_AUTH_PUBLIC_KEY_PEM ?? null;
  const authVerification = verifyR2OperatorAuthorization({
    estate,
    grant,
    publicKeyPem: effectivePublicKeyPem,
    checkedOutHeadSha,
    expectedPlan,
    pinnedTrustFingerprintSha256,
    revocationFilePath,
    nowMs
  });

  // 2. Claim single-host wx nonce in isolated estate directory and initialize journal + counters
  const operatorClockMs = Date.now();
  const nonceClaim = claimR2SingleHostNonceAtomically({
    estate,
    nonce: authVerification.nonce,
    evidenceDir,
    checkedOutHeadSha,
    grantSha256: authVerification.grantSha256,
    sessionId: authVerification.sessionId,
    issuedAt: authVerification.issuedAt
  });

  const sessionStem = `${spec.filePrefix}-${authVerification.sessionId}-${authVerification.nonce}`;
  const evidenceJournalPath = path.join(evidenceDir, `${sessionStem}-journal.jsonl`);
  const countersFilePath = path.join(evidenceDir, `${sessionStem}-counters.json`);
  const jInitFd = fs.openSync(evidenceJournalPath, 'wx', 0o600);
  fs.closeSync(jInitFd);

  function appendJournal(event, details = {}) {
    const line = `${JSON.stringify({
      schema: 'td613.marrowline.r2-observation-journal/v1',
      event,
      at: new Date().toISOString(),
      estate,
      experimentId: spec.experimentId,
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

  appendJournal('R2_AUTHORITY_REDEEMED', {
    model: spec.pinnedModel,
    planId: selectedPreset?.planId || 'CUSTOM',
    plannedEpisodes: validatedEpisodes.length
  });

  // 3. Resolve GEMINI_API_KEY strictly AFTER Ed25519 grant + isolated nonce + journal succeed
  const resolvedApiKey = String(apiKey ?? env?.GEMINI_API_KEY ?? '').trim();
  if (!resolvedApiKey) {
    throw new R2ObservationError('R2_MISSING_GEMINI_API_KEY', 'GEMINI_API_KEY missing after authority verification');
  }

  function assertUrlMatchesPinnedModel(url) {
    if (!url.includes(encodeURIComponent(spec.pinnedModel)) && !url.includes(spec.pinnedModel)) {
      throw new R2ObservationError('R2_FORBIDDEN_MODEL_URL', `Blocked non-pinned URL: ${url}`);
    }
  }

  const baselineCorrelation = estate === 'R2-W' ? buildR2HealthyBaselineCorrelation() : null;

  const sessionAbortController = new AbortController();
  const triggerOperatorStop = (reasonCode = 'R2_OPERATOR_SESSION_STOPPED') => {
    if (!sessionAbortController.signal.aborted) {
      sessionAbortController.abort(new R2ObservationError(reasonCode, 'Stopped by active operator signal or revocation'));
    }
  };
  let onCallerAbort = null;
  if (operatorAbortSignal) {
    if (operatorAbortSignal.aborted) triggerOperatorStop('R2_OPERATOR_ABORT_SIGNAL');
    else {
      onCallerAbort = () => triggerOperatorStop('R2_OPERATOR_ABORT_SIGNAL');
      operatorAbortSignal.addEventListener('abort', onCallerAbort, { once: true });
    }
  }
  let revocationWatcher = null;
  let revocationPollTimer = null;
  const checkRevocationLive = () => {
    if (revocationFilePath && isSessionRevokedOnDisk(authVerification.sessionId, revocationFilePath)) {
      triggerOperatorStop('R2_OPERATOR_SESSION_REVOKED');
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
    } catch { /* ignore watch errors; timer runs */ }
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
  let serviceClockMs = Date.now();
  let lastProviderClockMs = null;

  try {
    if (checkModelDiscovery) {
      notify(`[${estate}] [1/4] Verifying GET /v1beta/models/${spec.pinnedModel} outputTokenLimit...`);
      if (sessionAbortController.signal.aborted) {
        integritySessionHaltReason = 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED';
      } else {
        const metaUrl = geminiModelMetadataUrl(spec.pinnedModel);
        assertUrlMatchesPinnedModel(metaUrl);
        try {
          const metaResp = await transportFetch(metaUrl, {
            method: 'GET',
            headers: geminiRequestHeaders(resolvedApiKey),
            signal: sessionAbortController.signal
          });
          if (!metaResp?.ok) {
            integritySessionHaltReason = 'STOP_ON_MODEL_METADATA_UNAVAILABLE';
            metadataHttpErrorCustody = await captureR2HttpErrorCustodyToDisk({
              response: metaResp,
              estate,
              endpointKind: 'modelMetadata',
              model: spec.pinnedModel,
              bodyFilePath: path.join(evidenceDir, `${sessionStem}-model-metadata-http-error.body`),
              metaFilePath: path.join(evidenceDir, `${sessionStem}-model-metadata-http-error.meta.json`)
            });
            appendJournal('R2_MODEL_METADATA_HTTP_ERROR', metadataHttpErrorCustody);
          } else {
            const metaJson = await metaResp.json().catch(() => ({}));
            const methods = Array.isArray(metaJson?.supportedGenerationMethods) ? metaJson.supportedGenerationMethods : [];
            const hasOutLimit = Boolean(metaJson && typeof metaJson === 'object' && Object.hasOwn(metaJson, 'outputTokenLimit'));
            const rawOutLimit = hasOutLimit ? metaJson.outputTokenLimit : null;
            const validOutLimit = typeof rawOutLimit === 'number' && Number.isSafeInteger(rawOutLimit) && rawOutLimit > 0;
            const reportedOutLimit = validOutLimit ? rawOutLimit : null;
            if (!methods.includes('generateContent')) {
              integritySessionHaltReason = 'STOP_ON_MODEL_METHODS_MISSING';
            } else {
              metadataDiscovery = Object.freeze({
                status: Number(metaResp.status),
                name: metaJson.name || `models/${spec.pinnedModel}`,
                outputTokenLimitPresent: hasOutLimit,
                outputTokenLimitReportedByProvider: reportedOutLimit,
                maxOutputTokensOnWire: spec.publishedOutputCapacity,
                supportedGenerationMethods: Object.freeze([...methods])
              });
              appendJournal('R2_MODEL_METADATA_OBSERVED', metadataDiscovery);
              if (!validOutLimit) {
                integritySessionHaltReason = 'STOP_ON_PROVIDER_CAPACITY_UNVERIFIED';
              } else if (reportedOutLimit !== spec.publishedOutputCapacity) {
                integritySessionHaltReason = 'STOP_ON_PROVIDER_CAPACITY_MISMATCH';
              }
            }
          }
        } catch (error) {
          if (error instanceof R2ObservationError && error.code.startsWith('R2_FORBIDDEN_')) throw error;
          integritySessionHaltReason = sessionAbortController.signal.aborted
            ? 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED'
            : 'STOP_ON_MODEL_METADATA_TRANSPORT_EXCEPTION';
        }
      }
    }

    for (let epIdx = 0; !integritySessionHaltReason && epIdx < validatedEpisodes.length; epIdx += 1) {
      const ep = validatedEpisodes[epIdx];
      const epRecords = [];
      const blindWorksInput = [];
      let validSlotsCount = 0;

      for (const slotId of ep.sequence) {
        checkRevocationLive();
        if (sessionAbortController.signal.aborted) {
          integritySessionHaltReason = 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED';
          appendJournal('R2_OPERATOR_STOP_OBSERVED', { episodeId: ep.episodeId, beforeSlot: slotId });
          break;
        }

        const condPlan = expectedPlan.conditions[slotId];
        attemptCounter += 1;
        const attemptId = attemptCounter;

        let countTokensMeasurement = null;
        if (measureCountTokens) {
          notify(`[${estate}] [2/4] Episode ${ep.episodeId} (${slotId}): measuring :countTokens...`);
          const ctUrl = geminiCountTokensUrl(condPlan.model);
          assertUrlMatchesPinnedModel(ctUrl);
          totalCountTokensCalls += 1;
          try {
            const ctResp = await transportFetch(ctUrl, {
              method: 'POST',
              headers: geminiRequestHeaders(resolvedApiKey),
              body: condPlan.countTokensWireBody,
              signal: sessionAbortController.signal
            });
            const ctStatus = Number(ctResp?.status || 0);
            if (!ctResp?.ok) {
              const ctErr = await captureR2HttpErrorCustodyToDisk({
                response: ctResp,
                estate,
                endpointKind: 'countTokens',
                model: condPlan.model,
                bodyFilePath: path.join(evidenceDir, `${sessionStem}-ep${ep.episodeId}-att${attemptId}-${slotId}-count-tokens-http-error.body`),
                metaFilePath: path.join(evidenceDir, `${sessionStem}-ep${ep.episodeId}-att${attemptId}-${slotId}-count-tokens-http-error.meta.json`)
              });
              countTokensMeasurement = Object.freeze({ httpStatus: ctStatus, available: false, totalTokens: null, httpErrorCustody: ctErr });
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
          appendJournal('R2_COUNT_TOKENS_MEASURED', { attemptId, episodeId: ep.episodeId, slotId, ...countTokensMeasurement });
          if (sessionAbortController.signal.aborted) {
            integritySessionHaltReason = 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED';
            break;
          }
        }

        const attemptStem = `${sessionStem}-ep${ep.episodeId}-att${attemptId}-${slotId}`;
        const rawSseFilePath = path.join(evidenceDir, `${attemptStem}.sse`);
        const authoredTextFilePath = path.join(evidenceDir, `${attemptStem}.authored.txt`);
        const httpErrorBodyPath = path.join(evidenceDir, `${attemptStem}.http-error.body`);
        const httpErrorMetaPath = path.join(evidenceDir, `${attemptStem}.http-error.meta.json`);
        const blindToken = sha256HexBuffer(Buffer.from(`${authVerification.nonce}:ep${ep.episodeId}:att${attemptId}:${slotId}:${condPlan.observation.bodySha256}`, 'utf8')).slice(0, 12);
        const section2BlindFilePath = path.join(evidenceDir, `r2-w-blind-${authVerification.sessionId}-ep${ep.episodeId}-${blindToken}.section2.txt`);

        const genUrl = geminiStreamGenerateContentUrl(condPlan.model);
        assertUrlMatchesPinnedModel(genUrl);
        totalGenerationCalls += 1;
        notify(`[${estate}] [3/4] Episode ${ep.episodeId} (${slotId}): streaming native SSE to disk...`);
        const startedAt = new Date().toISOString();
        appendJournal('R2_GENERATION_ATTEMPT_PREPARED', {
          attemptId,
          episodeId: ep.episodeId,
          slotId,
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
            integrityStopReason = httpStatus === 503 ? 'PROVIDER_HTTP_503_UNAVAILABLE' : `PROVIDER_HTTP_${httpStatus || 'ERROR'}`;
            httpErrorCustody = await captureR2HttpErrorCustodyToDisk({
              response: sseResp,
              estate,
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
          if (error instanceof R2ObservationError && error.code.startsWith('R2_FORBIDDEN_')) throw error;
          callError = { name: String(error?.name || 'Error'), message: String(error?.message || error) };
          integrityStopReason = (
            sessionAbortController.signal.aborted
            || error?.name === 'AbortError'
            || error?.code === 'R2_OPERATOR_SESSION_REVOKED'
          )
            ? 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED'
            : 'STOP_ON_TRANSPORT_EXCEPTION';
        }

        const finishedAt = new Date().toISOString();
        lastProviderClockMs = Math.max(serviceClockMs, Date.now());

        if (!integrityStopReason && wire) {
          if (wire.diskWriteError) integrityStopReason = 'STOP_ON_DURABLE_RAW_SSE_WRITE_FAILED';
          else if (wire.operatorStopped) integrityStopReason = 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED';
          else if (wire.streamInterrupted) integrityStopReason = 'STOP_ON_STREAM_INTERRUPTED';
          else if (!wire.parserAgreement) integrityStopReason = 'STOP_ON_DUAL_PARSER_DISAGREEMENT';
          else if (wire.parserB?.duplicateSseDetected) integrityStopReason = 'STOP_ON_DUPLICATE_SSE_STREAM';
          else if (!wire.exactServedModelMatch) integrityStopReason = 'STOP_ON_SERVED_MODEL_VERSION_MISMATCH';
          else if (wire.completion?.policyTerminated) {
            integrityStopReason = `STOP_ON_POLICY_TERMINATION_${wire.completion.promptBlockReason || wire.completion.finishReason || 'UNKNOWN'}`;
          } else if (!wire.completion?.complete) {
            integrityStopReason = `STOP_ON_INCOMPLETE_COMPLETION_${wire.completion?.reason || 'UNKNOWN'}`;
          } else if (!wire.validUsageMetadata) {
            integrityStopReason = 'STOP_ON_MISSING_OR_INVALID_PROVIDER_USAGE';
          }
        }

        if (typeof textIntegrityProbe === 'function' && wire && fs.existsSync(authoredTextFilePath)) {
          textIntegrityProbe(authoredTextFilePath, slotId, ep.episodeId);
        }

        let evaluation = null;
        let textIntegrityOk = true;
        if (wire && fs.existsSync(authoredTextFilePath)) {
          const postDisk = hashFileChunkedSync(authoredTextFilePath);
          if (postDisk.sha256 !== wire.authoredTextSha256) {
            textIntegrityOk = false;
            if (!integrityStopReason) integrityStopReason = 'STOP_ON_ALTERED_UNICODE_TEXT';
          } else if (!integrityStopReason) {
            evaluation = evaluateSlotObservation({
              estate,
              slotId,
              condPlan,
              wire,
              authoredTextFilePath,
              section2BlindFilePath,
              baselineCorrelation
            });
            validSlotsCount += 1;
            if (estate === 'R2-W' && evaluation?.authoredTextForBlindPacket) {
              blindWorksInput.push({ conditionId: slotId, authoredText: evaluation.authoredTextForBlindPacket });
            }
          }
        }

        const safeEvaluation = evaluation && estate === 'R2-W'
          ? (() => {
            const { authoredTextForBlindPacket: _omit, ...rest } = evaluation;
            return Object.freeze(rest);
          })()
          : evaluation;

        const record = Object.freeze({
          attemptId,
          episodeId: ep.episodeId,
          slotId,
          ...(condPlan.scenarioId ? { scenarioId: condPlan.scenarioId } : {}),
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
          evaluation: safeEvaluation
        });

        allAttemptRecords.push(record);
        epRecords.push(record);

        appendJournal('R2_ATTEMPT_RECORDED', {
          attemptId,
          episodeId: ep.episodeId,
          slotId,
          httpStatus,
          rawSseSha256: wire?.rawSseSha256 ?? null,
          rawSseBytes: wire?.rawSseBytes ?? null,
          authoredTextSha256: wire?.authoredTextSha256 ?? null,
          httpErrorCustody,
          integrityStopReason
        });

        if (integrityStopReason === 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED') {
          integritySessionHaltReason = 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED';
          break;
        }
      }

      if (estate === 'R2-W' && blindWorksInput.length > 0) {
        blindedEpisodes.push(buildR2WBlindPacket({
          episodeId: ep.episodeId,
          seed: `${authVerification.nonce}:ep${ep.episodeId}`,
          works: blindWorksInput
        }));
      }

      const allSlotsValid = epRecords.length === ep.sequence.length && epRecords.every((r) => !r.integrityStopReason && r.textIntegrityOk);
      episodeSummaries.push(Object.freeze({
        episodeId: ep.episodeId,
        ...(ep.contrastId ? { contrastId: ep.contrastId } : {}),
        ...(ep.scenarioId ? { scenarioId: ep.scenarioId } : {}),
        order: ep.order,
        sequence: ep.sequence,
        attemptedSlotsCount: epRecords.length,
        validSlotsCount,
        allSlotsValid,
        held: !allSlotsValid
      }));
    }
  } finally {
    if (revocationPollTimer) clearInterval(revocationPollTimer);
    if (revocationWatcher) try { revocationWatcher.close(); } catch { /* ignore */ }
    if (operatorAbortSignal && onCallerAbort) {
      try { operatorAbortSignal.removeEventListener('abort', onCallerAbort); } catch { /* ignore */ }
    }
  }

  const acquisitionScope = classifyR2AcquisitionCompletion({
    estate,
    plannedEpisodes: validatedEpisodes,
    episodeSummaries
  });

  // Determine hypothesis support telemetry strictly for R2-U without blocking EMPIRICALLY_QUALIFIED on negative results
  let hypothesisSupported;
  let hypothesisVerdict = 'PENDING_SCIENTIFIC_ANALYSIS';
  if (estate === 'R2-U') {
    const validEvals = allAttemptRecords.filter((r) => !r.integrityStopReason && r.evaluation).map((r) => r.evaluation);
    if (validEvals.length > 0 && validEvals.length === allAttemptRecords.length) {
      const guidedOrFree = validEvals.filter((e) => e.slotId !== 'R2_U_PLAIN_BASELINE');
      hypothesisSupported = guidedOrFree.every((e) => e.supportsPositiveHypothesis === true);
      hypothesisVerdict = hypothesisSupported
        ? 'HYPOTHESIS_SUPPORTED'
        : 'OBSERVATION_VALID_HYPOTHESIS_NOT_SUPPORTED';
    }
  }

  const custodyClockMs = Math.max(lastProviderClockMs ?? serviceClockMs, Date.now());
  const draftReceipt = {
    metadataDiscovery,
    attemptRecords: allAttemptRecords
  };

  notify(`[${estate}] [4/4] Running independent cryptographic & on-disk physical custody Gate verification...`);
  appendJournal('R2_SESSION_CLOSING_FOR_GATE_VERIFICATION', {
    totalAttempts: allAttemptRecords.length,
    totalCountTokensCalls,
    totalGenerationCalls,
    acquisitionClassification: acquisitionScope.classification
  });

  const physicalCustodyGate = verifyPhysicalR2CustodyAndEvaluateGate({
    estate,
    grant,
    publicKeyPem: effectivePublicKeyPem,
    pinnedTrustFingerprintSha256,
    checkedOutHeadSha,
    expectedPlan,
    evidenceDir,
    revocationFilePath,
    receipt: draftReceipt,
    clockContext: {
      timebaseValidated: true,
      timebaseRelation: 'SINGLE_HOST_MONOTONIC_EPOCH_MS',
      phases: {
        noticeAt: 1,
        actAt: 2,
        worldAnswersAt: allAttemptRecords.some((a) => Boolean(a.rawSseFilePath)) ? 3 : null,
        nameAt: null,
        restAvailable: true,
        exitAvailable: true
      },
      clocks: {
        operatorClockMs,
        serviceClockMs,
        providerReceiptClockMs: lastProviderClockMs,
        custodyClockMs,
        classificationClockMs: Math.max(custodyClockMs, Date.now())
      }
    },
    scientificHypothesisSupported: hypothesisSupported,
    scientificHypothesisVerdict: hypothesisVerdict,
    humanReview: { verdict: 'PENDING_HUMAN_REVIEW' },
    explicitReleaseApproved: false,
    nowMs
  });

  const counters = Object.freeze({
    schema: 'td613.marrowline.r2-estate-counters/v1',
    estate,
    experimentId: spec.experimentId,
    sessionId: authVerification.sessionId,
    planId: selectedPreset?.planId || 'CUSTOM',
    countTokensCalls: totalCountTokensCalls,
    generationCalls: totalGenerationCalls,
    attemptsRecorded: allAttemptRecords.length,
    episodesPlanned: validatedEpisodes.length,
    episodesCompletedValid: acquisitionScope.completedValidEpisodeCount,
    acquisitionClassification: acquisitionScope.classification
  });
  fs.writeFileSync(countersFilePath, `${JSON.stringify(counters, null, 2)}\n`, {
    encoding: 'utf8',
    flag: 'wx',
    mode: 0o600
  });

  appendJournal('R2_SESSION_CLOSED', {
    integritySessionHaltReason,
    overallDisposition: physicalCustodyGate.gateResult.overallDisposition,
    physicalVerificationPassed: physicalCustodyGate.physicalVerificationPassed,
    scientificHypothesisVerdict: physicalCustodyGate.gateResult.scientificHypothesisVerdict
  });

  return Object.freeze({
    schema: R2_LIVE_CORE_SCHEMA,
    estate,
    experimentId: spec.experimentId,
    covenant: R2_TRUSTED_COVENANT,
    seal: R2_TRUSTED_SEAL,
    authorization: authVerification,
    nonceClaim,
    evidenceDir,
    evidenceJournalPath,
    countersFilePath,
    metadataDiscovery,
    ...(metadataHttpErrorCustody ? { metadataHttpErrorCustody } : {}),
    ...(baselineCorrelation ? { healthyBaselineCorrelation: baselineCorrelation } : {}),
    integritySessionHaltReason,
    dispatchCounts: counters,
    acquisitionScope,
    attemptRecords: Object.freeze(allAttemptRecords),
    episodeSummaries: Object.freeze(episodeSummaries),
    ...(estate === 'R2-W' ? { blindedEpisodes: Object.freeze(blindedEpisodes) } : {}),
    physicalCustodyGate,
    humanArtisticAcceptance: 'RESERVED_HUMAN_ONLY'
  });
}

export { buildR2UWireManifest, buildR2WWireManifest };
