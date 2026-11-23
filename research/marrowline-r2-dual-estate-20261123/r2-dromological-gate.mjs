// TD613 · Marrowline R2 · Integrated Dromological, Lifecycle & Safe Harbor Gate
// Commission: TD613-MARROWLINE-R2-DUAL-ESTATE-OFFLINE-20261123
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// Enforces NOTICE ≺ ACT ≺ WORLD_ANSWERS ≺ NAME, five explicit non-invented clocks,
// non-conflated lifecycle states, adversarial falsifiers, and OPERAHOUSE ≠ OPERA ≠ PERFORMER boundaries.

import { classifyMarrowlineGateReceipt } from '../../app/dome-world/marrowline-gate-assay.js';
import { sha256Utf8 } from './r2-unicode-evaluator.mjs';

export const R2_DROMOLOGICAL_GATE_SCHEMA = 'td613.marrowline.r2-dromological-gate/v1';

export const R2_LIFECYCLE_STATES = Object.freeze([
  'SOURCE_STAGED',
  'AUTHENTICATED',
  'NONCE_CLAIMED',
  'REQUEST_DISPATCHED',
  'PROVIDER_RESPONSE_OBSERVED',
  'RAW_CAPTURE_VERIFIED',
  'EMPIRICALLY_QUALIFIED',
  'HUMAN_ACCEPTED',
  'RELEASE_APPROVED'
]);

const CLOCK_KEYS = Object.freeze([
  'operatorClockMs',
  'serviceClockMs',
  'providerReceiptClockMs',
  'custodyClockMs',
  'classificationClockMs'
]);

const SHA256_HEX_RE = /^[0-9a-f]{64}$/i;
const GIT_SHA_RE = /^[0-9a-f]{40,64}$/i;

function normalizeClockOrNull(val, name) {
  if (val === null || val === undefined) return null;
  if (!Number.isSafeInteger(val) || Object.is(val, -0) || val < 0) {
    throw new TypeError(`Clock "${name}" must be a non-negative safe integer timestamp or null (never invent clocks)`);
  }
  return val;
}

function hasIndependentSignature(auth = {}) {
  const v = auth.independentSignatureVerification;
  return Boolean(
    v && typeof v === 'object'
    && v.verified === true
    && SHA256_HEX_RE.test(String(v.signatureSha256 || ''))
    && SHA256_HEX_RE.test(String(v.trustedPublicKeySha256 || ''))
    && GIT_SHA_RE.test(String(v.verifiedHeadSha256 || ''))
  );
}

function hasIndependentNonceJournal(replay = {}) {
  const v = replay.independentJournalVerification;
  return Boolean(
    v && typeof v === 'object'
    && v.verified === true
    && SHA256_HEX_RE.test(String(v.nonceSha256 || ''))
    && typeof v.journalEntryId === 'string' && v.journalEntryId.trim().length > 0
  );
}

function hasIndependentWireVerification(wire = {}) {
  const v = wire.independentWireVerification;
  return Boolean(
    v && typeof v === 'object'
    && v.verified === true
    && SHA256_HEX_RE.test(String(v.rawSseSha256 || ''))
    && SHA256_HEX_RE.test(String(v.requestBindingSha256 || ''))
    && v.dualParserAgreement === true
  );
}

function resolveScientificHypothesisVerdict(input = {}) {
  if (input.scientificHypothesisSupported === true || input.scientificHypothesisVerdict === 'HYPOTHESIS_SUPPORTED') {
    return 'HYPOTHESIS_SUPPORTED';
  }
  if (
    input.scientificHypothesisSupported === false
    || input.scientificHypothesisVerdict === 'OBSERVATION_VALID_HYPOTHESIS_NOT_SUPPORTED'
  ) {
    return 'OBSERVATION_VALID_HYPOTHESIS_NOT_SUPPORTED';
  }
  if (input.scientificHypothesisVerdict === 'INCONCLUSIVE') {
    return 'INCONCLUSIVE';
  }
  return 'PENDING_SCIENTIFIC_ANALYSIS';
}

function lagOrNull(later, earlier) {
  if (later === null || earlier === null) return null;
  return later - earlier;
}

/**
 * Evaluates complete R2 lifecycle state, dromological partial order, Safe Harbor boundaries,
 * and adversarial failure modes from observed witness evidence (never promotes process exit to empirical truth,
 * and keeps valid empirical qualification orthogonal to whether the scientific hypothesis was supported).
 */
export function evaluateR2DromologicalGate(evidence = {}) {
  const input = evidence && typeof evidence === 'object' ? evidence : {};
  const holdReasons = [];
  const dromologicalViolations = [];

  // 1. Validate five distinct clocks without inventing missing measurements or masking clock inversions
  const rawClocks = input.clocks && typeof input.clocks === 'object' ? input.clocks : {};
  const clocks = {};
  for (const key of CLOCK_KEYS) {
    clocks[key] = normalizeClockOrNull(rawClocks[key], key);
  }
  const nonNullClockValues = CLOCK_KEYS.map((key) => clocks[key]).filter((v) => v !== null);
  let clockInverted = false;
  for (let i = 1; i < nonNullClockValues.length; i += 1) {
    if (nonNullClockValues[i] < nonNullClockValues[i - 1]) {
      clockInverted = true;
      break;
    }
  }
  if (clockInverted || input.fabricatedChronologyDetected === true) {
    dromologicalViolations.push('FABRICATED_OR_INVERTED_CHRONOLOGY');
    holdReasons.push('INVALID_CLOCK_CHRONOLOGY');
  }

  const timeBaseValidated = input.timeBaseValidated === true;
  const preemptionGapMs = timeBaseValidated ? lagOrNull(clocks.custodyClockMs, clocks.operatorClockMs) : null;
  if (input.claimsPositivePreemptionGap === true && (preemptionGapMs === null || preemptionGapMs <= 0)) {
    holdReasons.push('UNVERIFIED_PREEMPTION_GAP_CLAIM');
    dromologicalViolations.push('POSITIVE_PREEMPTION_GAP_WITHOUT_VALIDATED_CLOCKS');
  }

  // 2. Canonical phase order: NOTICE ≺ ACT ≺ WORLD_ANSWERS ≺ NAME (with upstream omission checks)
  const p = input.phases && typeof input.phases === 'object' ? input.phases : {};
  const noticeAt = normalizeClockOrNull(p.noticeAt, 'phases.noticeAt');
  const actAt = normalizeClockOrNull(p.actAt, 'phases.actAt');
  const worldAnswersAt = normalizeClockOrNull(p.worldAnswersAt, 'phases.worldAnswersAt');
  const nameAt = normalizeClockOrNull(p.nameAt, 'phases.nameAt');
  const restAvailable = p.restAvailable !== false;
  const exitAvailable = p.exitAvailable !== false;

  if (noticeAt === null && actAt !== null) {
    dromologicalViolations.push('ACT_WITHOUT_NOTICE');
  }
  if (noticeAt !== null && actAt !== null && actAt < noticeAt) {
    dromologicalViolations.push('ACTION_BEFORE_NOTICE');
  }
  if (actAt === null && worldAnswersAt !== null) {
    dromologicalViolations.push('WORLD_ANSWERS_WITHOUT_ACT');
  }
  if (noticeAt === null && worldAnswersAt !== null) {
    dromologicalViolations.push('WORLD_ANSWERS_WITHOUT_NOTICE');
  }
  if (actAt !== null && worldAnswersAt !== null && worldAnswersAt < actAt) {
    dromologicalViolations.push('WORLD_ANSWERS_BEFORE_ACT');
  }
  if (worldAnswersAt === null && nameAt !== null) {
    dromologicalViolations.push('SUCCESS_BEFORE_CONSEQUENCE');
  }
  if (worldAnswersAt !== null && nameAt !== null && nameAt < worldAnswersAt) {
    dromologicalViolations.push('PREMATURE_NAMING');
  }
  if (input.hiddenRetriesExecuted === true) {
    dromologicalViolations.push('HIDDEN_RETRY_DETECTED');
  }
  if (input.forcedAdjacencyDetected === true) {
    dromologicalViolations.push('FORCED_ADJACENCY');
  }
  if (!restAvailable || !exitAvailable) {
    dromologicalViolations.push('REST_OR_EXIT_WITHHELD');
  }
  if (input.processExitedZero === true && input.claimedEmpiricalSuccessWithoutModelOutput === true) {
    dromologicalViolations.push('PROCESS_EXIT_CONFUSED_WITH_EMPIRICAL_QUALIFICATION');
    holdReasons.push('PREMATURE_SUCCESS_WITHOUT_MODEL_OUTPUT');
  }

  // 3. Adversarial wire, authority, metadata, and custody checks
  const auth = input.authority && typeof input.authority === 'object' ? input.authority : {};
  const meta = input.providerMetadata && typeof input.providerMetadata === 'object' ? input.providerMetadata : {};
  const wire = input.wireCapture && typeof input.wireCapture === 'object' ? input.wireCapture : {};
  const replay = input.replayProtection && typeof input.replayProtection === 'object' ? input.replayProtection : {};
  const human = input.humanReview && typeof input.humanReview === 'object' ? input.humanReview : {};
  const safeHarbor = input.safeHarbor && typeof input.safeHarbor === 'object' ? input.safeHarbor : {};

  if (auth.signatureValid && auth.alteredDigestOrHeadDetected === true) {
    holdReasons.push('SIGNATURE_ON_ALTERED_DIGEST_OR_HEAD');
  }
  if (replay.withinHostNonceReplayed === true) {
    holdReasons.push('WITHIN_HOST_NONCE_REPLAYED');
  }
  if (replay.claimsCrossHostReplayPreventionProved === true) {
    // Single-host wx locking NEVER proves cross-host replay prevention
    holdReasons.push('UNPROVED_CROSS_HOST_REPLAY_CLAIM_REJECTED');
  }

  const expectedOutCap = meta.expectedOutputTokenLimit ?? 65536;
  const metaValidInt = typeof meta.outputTokenLimit === 'number'
    && Number.isSafeInteger(meta.outputTokenLimit)
    && meta.outputTokenLimit > 0;
  if (meta.checked === true && !meta.ok) {
    holdReasons.push('MODEL_METADATA_TRANSPORT_OR_HTTP_UNAVAILABLE');
  } else if (meta.checked === true && !metaValidInt) {
    holdReasons.push('STOP_ON_PROVIDER_CAPACITY_UNVERIFIED');
  } else if (meta.checked === true && meta.outputTokenLimit !== expectedOutCap) {
    holdReasons.push('STOP_ON_PROVIDER_CAPACITY_MISMATCH');
  }

  if (wire.truncatedOrDuplicateSse === true) holdReasons.push('TRUNCATED_OR_DUPLICATE_SSE');
  if (wire.parserAgreement === false) holdReasons.push('DUAL_PARSER_DISAGREEMENT');
  if (wire.servedModelMismatch === true) holdReasons.push('SERVED_MODEL_VERSION_MISMATCH');

  // Check raw authored bytes vs claimed normalized/altered digest
  if (typeof wire.rawAuthoredText === 'string' && typeof wire.claimedAuthoredSha256 === 'string') {
    if (sha256Utf8(wire.rawAuthoredText) !== wire.claimedAuthoredSha256) {
      holdReasons.push('AUTHORED_TEXT_DIGEST_MISMATCH_OR_SILENT_NORMALIZATION');
    }
  }

  if (wire.arbitrarySuccessFromDurationBytesTokensOrStopOnly === true) {
    holdReasons.push('ARBITRARY_SUCCESS_PROMOTION_FORBIDDEN');
  }

  if (human.structuralPassed === true && human.verdict === 'ARTISTIC_REJECTED') {
    holdReasons.push('HUMAN_ARTISTIC_REJECTED_DESPITE_STRUCTURAL_PASS');
  }

  if (safeHarbor.claimsForeignHostEnforcement === true || safeHarbor.claimsIndependentExternalOrigin === true) {
    holdReasons.push('SAFE_HARBOR_AUTHORITY_OVERCLAIM_REJECTED');
  }
  if (safeHarbor.surfacesInternalLabVocabularyInPublicUi === true) {
    holdReasons.push('OPERAHOUSE_OPERA_PERFORMER_SEPARATION_VIOLATED');
  }

  // 4. Route boundary verification via existing Gate assay semantics
  const gateRouteReceipt = input.gateRouteReceipt
    ? classifyMarrowlineGateReceipt(input.gateRouteReceipt)
    : null;

  // 5. Attestation provenance labeling (distinguishes caller booleans from independent verification)
  const indepSig = hasIndependentSignature(auth);
  const indepNonce = hasIndependentNonceJournal(replay);
  const indepWire = hasIndependentWireVerification(wire);
  const callerReportedSig = Boolean(auth.signatureValid === true);
  const callerReportedNonce = Boolean(replay.nonceClaimed === true);
  const callerReportedWire = Boolean(wire.rawCaptureVerified === true);

  const attestationProvenance = Object.freeze({
    signature: Object.freeze({
      callerReportedAttestation: callerReportedSig,
      independentlyVerified: indepSig,
      status: indepSig
        ? 'INDEPENDENT_CRYPTOGRAPHIC_VERIFICATION'
        : callerReportedSig ? 'CALLER_REPORTED_ATTESTATION_ONLY' : 'UNVERIFIED'
    }),
    nonceClaim: Object.freeze({
      callerReportedAttestation: callerReportedNonce,
      independentlyVerified: indepNonce,
      status: indepNonce
        ? 'INDEPENDENT_JOURNAL_VERIFICATION'
        : callerReportedNonce ? 'CALLER_REPORTED_ATTESTATION_ONLY' : 'UNVERIFIED'
    }),
    rawCapture: Object.freeze({
      callerReportedAttestation: callerReportedWire,
      independentlyVerified: indepWire,
      status: indepWire
        ? 'INDEPENDENT_WIRE_AND_DISK_VERIFICATION'
        : callerReportedWire ? 'CALLER_REPORTED_ATTESTATION_ONLY' : 'UNVERIFIED'
    }),
    selfReportedBooleansProveExternalAdmission: false,
    allCoreWitnessesIndependentlyVerified: Boolean(indepSig && indepNonce && indepWire)
  });

  if (
    (input.claimsExternalAdmission === true || input.requireIndependentVerification === true)
    && !attestationProvenance.allCoreWitnessesIndependentlyVerified
  ) {
    holdReasons.push('UNPROVED_EXTERNAL_ADMISSION_FROM_SELF_REPORTED_FLAGS');
  }

  // 6. Compute strictly supported causal chain & detect missing upstream witnesses when later states are claimed
  const sourceStaged = Boolean(input.sourceStaged === true);
  const sigWitnessed = callerReportedSig || indepSig;
  const nonceWitnessed = callerReportedNonce || indepNonce;
  const wireWitnessed = callerReportedWire || indepWire;

  const authenticated = sourceStaged && Boolean(sigWitnessed && auth.alteredDigestOrHeadDetected !== true);
  const nonceClaimed = authenticated && Boolean(nonceWitnessed && replay.withinHostNonceReplayed !== true);
  const requestDispatched = nonceClaimed
    && Boolean(input.requestDispatched === true)
    && meta.checked === true
    && meta.ok === true
    && metaValidInt
    && meta.outputTokenLimit === expectedOutCap;
  const providerResponseObserved = requestDispatched && Boolean(input.providerResponseObserved === true);
  const rawCaptureVerified = providerResponseObserved && Boolean(
    wireWitnessed
    && wire.parserAgreement === true
    && wire.truncatedOrDuplicateSse !== true
    && wire.servedModelMismatch !== true
    && !holdReasons.includes('AUTHORED_TEXT_DIGEST_MISMATCH_OR_SILENT_NORMALIZATION')
  );

  // Enforce HELD if any downstream consequential state is claimed without its required upstream witnesses
  if (sigWitnessed && !sourceStaged) holdReasons.push('MISSING_UPSTREAM_WITNESS_FOR_AUTHENTICATION');
  if (nonceWitnessed && !authenticated) holdReasons.push('MISSING_UPSTREAM_WITNESS_FOR_NONCE_CLAIM');
  if (input.requestDispatched === true && !nonceClaimed) holdReasons.push('MISSING_UPSTREAM_WITNESS_FOR_DISPATCH');
  if (input.requestDispatched === true && (!meta.checked || !meta.ok || !metaValidInt)) {
    holdReasons.push('MISSING_PROVIDER_CAPACITY_WITNESS_FOR_DISPATCH');
  }
  if (input.providerResponseObserved === true && !requestDispatched) holdReasons.push('MISSING_UPSTREAM_WITNESS_FOR_RESPONSE');
  if (wireWitnessed && !providerResponseObserved) holdReasons.push('MISSING_UPSTREAM_WITNESS_FOR_RAW_CAPTURE');
  if (input.claimsEmpiricalQualification === true && !rawCaptureVerified) {
    holdReasons.push('MISSING_UPSTREAM_WITNESS_FOR_EMPIRICAL_QUALIFICATION');
  }
  if (human.verdict === 'HUMAN_ARTISTIC_ACCEPTED' && !rawCaptureVerified) {
    holdReasons.push('MISSING_UPSTREAM_WITNESS_FOR_HUMAN_ACCEPTANCE');
  }
  if (input.explicitReleaseApproved === true && !rawCaptureVerified) {
    holdReasons.push('MISSING_UPSTREAM_WITNESS_FOR_RELEASE');
  }

  // Empirical qualification MUST accept valid negative results (hypothesis not supported) on equal footing
  const scientificHypothesisVerdict = resolveScientificHypothesisVerdict(input);
  const empiricallyQualified = rawCaptureVerified
    && dromologicalViolations.length === 0
    && holdReasons.length === 0;
  // W artistic judgment is independent of whether U's hypothesis was supported
  const humanAccepted = empiricallyQualified && human.verdict === 'HUMAN_ARTISTIC_ACCEPTED';
  const releaseApproved = humanAccepted && Boolean(input.explicitReleaseApproved === true);

  let highestSupportedState = 'UNSTAGED';
  if (releaseApproved) highestSupportedState = 'RELEASE_APPROVED';
  else if (humanAccepted) highestSupportedState = 'HUMAN_ACCEPTED';
  else if (empiricallyQualified) highestSupportedState = 'EMPIRICALLY_QUALIFIED';
  else if (rawCaptureVerified) highestSupportedState = 'RAW_CAPTURE_VERIFIED';
  else if (providerResponseObserved) highestSupportedState = 'PROVIDER_RESPONSE_OBSERVED';
  else if (requestDispatched) highestSupportedState = 'REQUEST_DISPATCHED';
  else if (nonceClaimed) highestSupportedState = 'NONCE_CLAIMED';
  else if (authenticated) highestSupportedState = 'AUTHENTICATED';
  else if (sourceStaged) highestSupportedState = 'SOURCE_STAGED';

  const held = dromologicalViolations.length > 0 || holdReasons.length > 0;
  const overallDisposition = held
    ? 'HELD'
    : humanAccepted
      ? 'HUMAN_ACCEPTED'
      : empiricallyQualified
        ? 'EMPIRICALLY_QUALIFIED'
        : highestSupportedState;

  const externalAdmissionProved = Boolean(
    attestationProvenance.allCoreWitnessesIndependentlyVerified
    && !held
    && empiricallyQualified
  );

  return Object.freeze({
    schema: R2_DROMOLOGICAL_GATE_SCHEMA,
    overallDisposition,
    held,
    highestSupportedState,
    scientificHypothesisVerdict,
    humanArtisticVerdict: typeof human.verdict === 'string' ? human.verdict : 'PENDING_HUMAN_REVIEW',
    attestationProvenance,
    lifecycleCapabilities: Object.freeze({
      SOURCE_STAGED: sourceStaged,
      AUTHENTICATED: authenticated,
      NONCE_CLAIMED: nonceClaimed,
      REQUEST_DISPATCHED: requestDispatched,
      PROVIDER_RESPONSE_OBSERVED: providerResponseObserved,
      RAW_CAPTURE_VERIFIED: rawCaptureVerified,
      EMPIRICALLY_QUALIFIED: empiricallyQualified,
      HUMAN_ACCEPTED: humanAccepted,
      RELEASE_APPROVED: releaseApproved
    }),
    dromologicalOrder: Object.freeze({
      requiredPartialOrder: 'NOTICE ≺ ACT ≺ WORLD_ANSWERS ≺ NAME',
      satisfied: dromologicalViolations.length === 0,
      violations: Object.freeze([...new Set(dromologicalViolations)])
    }),
    clocks: Object.freeze({
      ...clocks,
      timeBaseValidated,
      preemptionGapMs
    }),
    holdReasons: Object.freeze([...new Set(holdReasons)]),
    securityAndSafeHarbor: Object.freeze({
      externalAdmissionProved,
      crossHostReplayPreventionProved: false,
      foreignHostEnforcementProved: false,
      independentExternalOriginProved: false,
      processExitPromotesEmpiricalQualification: false,
      operahouseOperaPerformerDistinct: safeHarbor.surfacesInternalLabVocabularyInPublicUi !== true
    }),
    gateRouteReceipt
  });
}
