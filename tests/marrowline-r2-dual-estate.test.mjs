// TD613 · Marrowline R2 · Offline Dual-Estate Verification Suite
// Commission: TD613-MARROWLINE-R2-DUAL-ESTATE-OFFLINE-20261123
// Tests: Estate R2-U 3-mode builders & Unicode evaluator (vs R1 depth-1 stencil),
// Estate R2-W whole-frame provenance diff & blind artistic veto, Dromological Gate &
// Safe Harbor boundaries, and offline zero-network/zero-credential CLI verification.

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  UNICODE_ASSAY_SYSTEM
} from '../server/marrowline-unicode-capability-assay.js';
import {
  R2_U_CALIBRATED_CONTROLS,
  evaluateLiteralCopyFidelity,
  evaluateSectionedUnicode,
  evaluateUnicodeMorphology
} from '../research/marrowline-r2-dual-estate-20261123/r2-unicode-evaluator.mjs';
import {
  R2_U_EXPERIMENT_ID,
  R2_U_PINNED_COPY_SPECIMEN,
  buildR2UCounterbalancePlan,
  buildR2URequests,
  buildR2UWireManifest
} from '../research/marrowline-r2-dual-estate-20261123/r2-u-preflight.mjs';
import {
  R2_W_DRAMATIC_PROMPT,
  R2_W_EXPERIMENT_ID,
  buildR2WBlindPacket,
  buildR2WRequests,
  buildR2WWireManifest,
  evaluateR2WQualitativeRubric
} from '../research/marrowline-r2-dual-estate-20261123/r2-w-preflight.mjs';
import {
  R2_LIFECYCLE_STATES,
  evaluateR2DromologicalGate
} from '../research/marrowline-r2-dual-estate-20261123/r2-dromological-gate.mjs';
import {
  buildR2OfflinePreviewPlan,
  runVerifyR2OfflineCli
} from '../research/marrowline-r2-dual-estate-20261123/verify-r2-offline.mjs';

const R2_DIR = path.resolve('research/marrowline-r2-dual-estate-20261123');
const R2_CLI_PATH = path.join(R2_DIR, 'verify-r2-offline.mjs');

test('Estate R2-U: three task families + controls isolate factors, keep zero voice lore, and match canonical manifest bytes', () => {
  const requests = buildR2URequests();
  const manifest = buildR2UWireManifest();
  const expectedArms = [
    'R2_U_LITERAL_COPY',
    'R2_U_PLAIN_BASELINE',
    'R2_U_GUIDED_RULES',
    'R2_U_GUIDED_CONTRAST',
    'R2_U_FREE_SYNTHESIS'
  ];
  assert.deepEqual(Object.keys(requests), expectedArms);
  assert.equal(manifest.experimentId, R2_U_EXPERIMENT_ID);
  assert.equal(manifest.paidProviderCallsExecuted, 0);
  assert.equal(manifest.voicePersonasExcluded, true);
  assert.equal(manifest.sharedInvariants.td613ArtificialCaps, null);

  for (const arm of expectedArms) {
    assert.equal(requests[arm].systemInstruction.parts[0].text, UNICODE_ASSAY_SYSTEM);
    assert.equal(requests[arm].generationConfig.maxOutputTokens, 65536);
    assert.equal(requests[arm].generationConfig.thinkingConfig.thinkingLevel, 'medium');
    assert.equal(requests[arm].contents[0].parts[0].text.includes('Kʰonapolit'), false);
  }

  // Exact single-factor isolation between GUIDED_RULES and GUIDED_CONTRAST
  const rulesText = requests.R2_U_GUIDED_RULES.contents[0].parts[0].text;
  const contrastText = requests.R2_U_GUIDED_CONTRAST.contents[0].parts[0].text;
  assert.ok(contrastText.startsWith(`${rulesText}\n`));
  assert.notEqual(
    manifest.arms.find((a) => a.armId === 'R2_U_GUIDED_RULES').observation.bodySha256,
    manifest.arms.find((a) => a.armId === 'R2_U_GUIDED_CONTRAST').observation.bodySha256
  );

  // Deterministic reversed / counterbalanced plans
  const plan = buildR2UCounterbalancePlan('U_C1_RULES_VS_CONTRAST_EXAMPLES', 4);
  assert.equal(plan.episodes[0].order, 'FORWARD');
  assert.equal(plan.episodes[1].order, 'REVERSED');
  assert.deepEqual(plan.episodes[0].sequence, ['R2_U_GUIDED_RULES', 'R2_U_GUIDED_CONTRAST']);
  assert.deepEqual(plan.episodes[1].sequence, ['R2_U_GUIDED_CONTRAST', 'R2_U_GUIDED_RULES']);

  const diskManifest = fs.readFileSync(path.join(R2_DIR, 'R2_U_WIRE_MANIFEST.json'));
  assert.equal(diskManifest[0] === 0xef && diskManifest[1] === 0xbb && diskManifest[2] === 0xbf, false);
  assert.equal(diskManifest.includes('\r\n'), false);
  assert.equal(diskManifest.toString('utf8'), `${JSON.stringify(manifest, null, 2)}\n`);
});

test('R2 Unicode Evaluator: distinguishes depth-1 stencil, alternate grammar, silent NFC/NFD normalization, and genuine multistack', () => {
  const plain = evaluateUnicodeMorphology(R2_U_CALIBRATED_CONTROLS.PLAIN_BASELINE_REF.sample);
  const stencil = evaluateUnicodeMorphology(R2_U_CALIBRATED_CONTROLS.ONE_MARK_STENCIL_REF.sample);
  const multistack = evaluateUnicodeMorphology(R2_U_CALIBRATED_CONTRAST_OR_MULTI());
  const alt = evaluateUnicodeMorphology(R2_U_CALIBRATED_CONTROLS.ALTERNATE_NOTATION_GRAMMAR_REF.sample);

  assert.equal(plain.combiningMarkCount, 0);
  assert.equal(plain.genuineMultistackObserved, false);

  assert.equal(stencil.maxMarkDepth, 1);
  assert.equal(stencil.multiMarkBaseCount, 0);
  assert.equal(stencil.stencilRisk.isStencil, true);
  assert.equal(stencil.stencilRisk.depthOneLimited, true);
  assert.equal(stencil.genuineMultistackObserved, false);

  assert.ok(multistack.maxMarkDepth >= 3);
  assert.ok(multistack.multiMarkBaseCount >= 5);
  assert.ok(multistack.bidirectionalAboveBelowCount >= 4);
  assert.ok(multistack.overlayU0334ToU0338Count >= 2);
  assert.equal(multistack.stencilRisk.isStencil, false);
  assert.equal(multistack.genuineMultistackObserved, true);
  assert.ok(multistack.graphemeSegmentationCaveat.includes('Intl.Segmenter'));

  assert.equal(alt.combiningMarkCount, 0);
  assert.equal(alt.genuineMultistackObserved, false);
  assert.ok(alt.alternateNotationBracketTokens >= 3);

  // Copy fidelity catches silent NFC/NFD normalization even though composed form renders identically
  const exactCopy = evaluateLiteralCopyFidelity(R2_U_PINNED_COPY_SPECIMEN, R2_U_PINNED_COPY_SPECIMEN);
  const nfcCopy = evaluateLiteralCopyFidelity(R2_U_PINNED_COPY_SPECIMEN, R2_U_PINNED_COPY_SPECIMEN.normalize('NFC'));
  assert.equal(exactCopy.rawByteExact, true);
  assert.equal(exactCopy.codePointExact, true);
  assert.equal(nfcCopy.rawByteExact, false);
  assert.equal(nfcCopy.nfcEquivalentOnly, true);
  assert.equal(nfcCopy.silentNormalizationDetected, true);
  assert.notEqual(exactCopy.observedSha256, nfcCopy.observedSha256);

  // Sectioned coverage verifier separates plain Section 1 vs multistack Section 2 cleanly
  const secReport = evaluateSectionedUnicode([
    { label: 'Kʰonapolit', text: R2_U_CALIBRATED_CONTROLS.PLAIN_BASELINE_REF.sample },
    { label: 'Tauric Diana bots', text: R2_U_CALIBRATED_CONTROLS.DELIBERATE_MULTISTACK_REF.sample }
  ], { expectedPlainSectionIndices: [0] });
  assert.equal(secReport.coverageAllPassed, true);

  function R2_U_CALIBRATED_CONTRAST_OR_MULTI() {
    return R2_U_CALIBRATED_CONTROLS.DELIBERATE_MULTISTACK_REF.sample;
  }
});

test('Estate R2-W: uses production voice/covenant builder, rejects assay anti-persona rules, diffs whole-frame bytes, and enforces blind human veto', () => {
  const requests = buildR2WRequests();
  const manifest = buildR2WWireManifest();

  assert.equal(manifest.experimentId, R2_W_EXPERIMENT_ID);
  assert.equal(manifest.syntheticAssaySystemExcluded, true);
  assert.equal(manifest.paidProviderCallsExecuted, 0);

  const fullText = requests.W_FULL_PRODUCTION_FRAME.systemInstruction.parts[0].text;
  const condensedText = requests.W_CONDENSED_WHOLE_FRAME.systemInstruction.parts[0].text;
  assert.equal(fullText.includes('No TD613 narrative'), false);
  assert.equal(condensedText.includes('No TD613 narrative'), false);
  assert.equal(R2_W_DRAMATIC_PROMPT.includes('short'), false);
  assert.ok(fullText.includes('Khona\u200Clit-po'));
  assert.ok(condensedText.includes('Khona\u200Clit-po'));
  assert.ok(manifest.provenanceDiff.byteDelta < -20000);
  assert.equal(manifest.provenanceDiff.protectedAnchorPreservation.every((p) => p.inFull && p.inCondensed), true);

  // Blind packet strips condition identifiers cleanly while keeping sealed map separate
  const workA = 'Kʰonapolit\nThe denominator counts only silence.\n\nTauric Diana bots\n' + R2_U_CALIBRATED_CONTROLS.DELIBERATE_MULTISTACK_REF.sample + '\n\n⟐';
  const workB = 'Kʰonapolit\nShort weather report.\n\nTauric Diana bots\nRain.\n\n⟐';
  const blind = buildR2WBlindPacket({
    episodeId: 1,
    seed: 'test-seed',
    works: [
      { conditionId: 'W_FULL_PRODUCTION_FRAME', authoredText: workA },
      { conditionId: 'W_CONDENSED_WHOLE_FRAME', authoredText: workB }
    ]
  });
  const blindJson = JSON.stringify(blind.publicPacket);
  assert.equal(blindJson.includes('W_FULL_PRODUCTION_FRAME'), false);
  assert.equal(blindJson.includes('W_CONDENSED_WHOLE_FRAME'), false);
  assert.equal(blind.sealedUnblindingMap.length, 2);

  // Qualitative rubric: technical completion PASS + synthetic-stub rejection yields ARTISTIC_REJECTED
  const rejectedDespiteValidWire = evaluateR2WQualitativeRubric({
    authoredText: workA,
    outputMetadata: { finishReason: 'STOP', streamed: true, parseErrors: 0 },
    declaredAsSyntheticHeadingStubOnly: true,
    humanJudgment: {
      verdict: 'ARTISTIC_REJECTED',
      criteria: {
        expressiveSufficiency: false,
        distinctVoicesAndAgency: false,
        motifTransformation: false,
        temporalAuthorityShift: false,
        readableNonStencilMorphology: true,
        artisticSurpriseAndClosure: false,
        protectedAnchorsIntact: true
      },
      notes: 'Synthetic label headings without genuine dramatic voice transformation.'
    }
  });
  assert.equal(rejectedDespiteValidWire.technicalGatePassed, true);
  assert.equal(rejectedDespiteValidWire.structuralNonStubChecks.notDeclaredSyntheticStub, false);
  assert.equal(rejectedDespiteValidWire.humanArtisticVerdict, 'ARTISTIC_REJECTED');

  const diskManifest = fs.readFileSync(path.join(R2_DIR, 'R2_W_WIRE_MANIFEST.json'));
  assert.equal(diskManifest[0] === 0xef && diskManifest[1] === 0xbb && diskManifest[2] === 0xBF, false);
  assert.equal(diskManifest.includes('\r\n'), false);
  assert.equal(diskManifest.toString('utf8'), `${JSON.stringify(manifest, null, 2)}\n`);
});

test('R2 Dromological & Adversarial Gate: enforces NOTICE < ACT < WORLD_ANSWERS < NAME, non-fabricated clocks, Safe Harbor, and all 8 failure modes', () => {
  assert.deepEqual(R2_LIFECYCLE_STATES, [
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

  // 1. R1 session_67793e4a610bcebc pattern: signed + nonce claimed + metadata transport failure + exit 0 -> MUST BE HELD at NONCE_CLAIMED
  const r1Halted = evaluateR2DromologicalGate({
    sourceStaged: true,
    authority: { signatureValid: true },
    replayProtection: { nonceClaimed: true },
    providerMetadata: { checked: true, ok: false, expectedOutputTokenLimit: 65536 },
    processExitedZero: true,
    claimedEmpiricalSuccessWithoutModelOutput: true
  });
  assert.equal(r1Halted.held, true);
  assert.equal(r1Halted.overallDisposition, 'HELD');
  assert.equal(r1Halted.highestSupportedState, 'NONCE_CLAIMED');
  assert.equal(r1Halted.lifecycleCapabilities.EMPIRICALLY_QUALIFIED, false);
  assert.ok(r1Halted.dromologicalOrder.violations.includes('PROCESS_EXIT_CONFUSED_WITH_EMPIRICAL_QUALIFICATION'));

  // 2. Action before notice, premature naming, hidden retry, forced adjacency, rest/exit withheld, unverified clock gap
  const orderViolations = evaluateR2DromologicalGate({
    sourceStaged: true,
    clocks: { operatorClockMs: 100, custodyClockMs: null },
    timeBaseValidated: false,
    claimsPositivePreemptionGap: true,
    phases: { noticeAt: 20, actAt: 10, worldAnswersAt: 50, nameAt: 40, restAvailable: false, exitAvailable: false },
    hiddenRetriesExecuted: true,
    forcedAdjacencyDetected: true
  });
  assert.equal(orderViolations.dromologicalOrder.satisfied, false);
  for (const v of [
    'ACTION_BEFORE_NOTICE',
    'PREMATURE_NAMING',
    'HIDDEN_RETRY_DETECTED',
    'FORCED_ADJACENCY',
    'REST_OR_EXIT_WITHHELD',
    'POSITIVE_PREEMPTION_GAP_WITHOUT_VALIDATED_CLOCKS'
  ]) {
    assert.ok(orderViolations.dromologicalOrder.violations.includes(v), `missing ${v}`);
  }
  assert.equal(orderViolations.clocks.custodyClockMs, null);
  assert.equal(orderViolations.clocks.preemptionGapMs, null);

  // 3. Missing/mismatched capacity, altered digest under valid signature, within-host replay & cross-host claim, normalized text digest
  const adversarialWire = evaluateR2DromologicalGate({
    sourceStaged: true,
    authority: { signatureValid: true, alteredDigestOrHeadDetected: true },
    replayProtection: { nonceClaimed: true, withinHostNonceReplayed: true, claimsCrossHostReplayPreventionProved: true },
    providerMetadata: { checked: true, ok: true, outputTokenLimit: null, expectedOutputTokenLimit: 65536 },
    wireCapture: {
      rawAuthoredText: 'A\u0301',
      claimedAuthoredSha256: crypto.createHash('sha256').update(Buffer.from('A\u0301'.normalize('NFC'), 'utf8')).digest('hex'),
      truncatedOrDuplicateSse: true,
      parserAgreement: false,
      servedModelMismatch: true,
      arbitrarySuccessFromDurationBytesTokensOrStopOnly: true
    },
    humanReview: { structuralPassed: true, verdict: 'ARTISTIC_REJECTED' },
    safeHarbor: {
      claimsForeignHostEnforcement: true,
      claimsIndependentExternalOrigin: true,
      surfacesInternalLabVocabularyInPublicUi: true
    },
    gateRouteReceipt: { status: 'LIVE_RESPONSE', http: { routeHeader: 'live-marrowline-ingress' } }
  });
  assert.equal(adversarialWire.held, true);
  assert.equal(adversarialWire.securityAndSafeHarbor.crossHostReplayPreventionProved, false);
  assert.equal(adversarialWire.securityAndSafeHarbor.foreignHostEnforcementProved, false);
  assert.equal(adversarialWire.securityAndSafeHarbor.independentExternalOriginProved, false);
  assert.equal(adversarialWire.securityAndSafeHarbor.operahouseOperaPerformerDistinct, false);
  assert.equal(adversarialWire.gateRouteReceipt.mode, 'PUBLIC_ABSORPTION');
  for (const reason of [
    'SIGNATURE_ON_ALTERED_DIGEST_OR_HEAD',
    'WITHIN_HOST_NONCE_REPLAYED',
    'UNPROVED_CROSS_HOST_REPLAY_CLAIM_REJECTED',
    'STOP_ON_PROVIDER_CAPACITY_UNVERIFIED',
    'AUTHORED_TEXT_DIGEST_MISMATCH_OR_SILENT_NORMALIZATION',
    'TRUNCATED_OR_DUPLICATE_SSE',
    'DUAL_PARSER_DISAGREEMENT',
    'SERVED_MODEL_VERSION_MISMATCH',
    'ARBITRARY_SUCCESS_PROMOTION_FORBIDDEN',
    'HUMAN_ARTISTIC_REJECTED_DESPITE_STRUCTURAL_PASS',
    'SAFE_HARBOR_AUTHORITY_OVERCLAIM_REJECTED',
    'OPERAHOUSE_OPERA_PERFORMER_SEPARATION_VIOLATED'
  ]) {
    assert.ok(adversarialWire.holdReasons.includes(reason), `missing hold reason ${reason}`);
  }

  // 4. Clean synthetic progression up to EMPIRICALLY_QUALIFIED stops short of HUMAN_ACCEPTED & RELEASE_APPROVED without explicit human actions
  const cleanEmpirical = evaluateR2DromologicalGate({
    sourceStaged: true,
    authority: { signatureValid: true },
    replayProtection: { nonceClaimed: true },
    providerMetadata: { checked: true, ok: true, outputTokenLimit: 65536, expectedOutputTokenLimit: 65536 },
    requestDispatched: true,
    providerResponseObserved: true,
    wireCapture: { rawCaptureVerified: true, parserAgreement: true },
    scientificHypothesisSupported: true,
    phases: { noticeAt: 10, actAt: 20, worldAnswersAt: 30, nameAt: 40, restAvailable: true, exitAvailable: true },
    clocks: { operatorClockMs: 1000, serviceClockMs: 1010, providerReceiptClockMs: 1020, custodyClockMs: 1050, classificationClockMs: 1060 },
    timeBaseValidated: true
  });
  assert.equal(cleanEmpirical.held, false);
  assert.equal(cleanEmpirical.overallDisposition, 'EMPIRICALLY_QUALIFIED');
  assert.equal(cleanEmpirical.clocks.preemptionGapMs, 50);
  assert.equal(cleanEmpirical.lifecycleCapabilities.HUMAN_ACCEPTED, false);
  assert.equal(cleanEmpirical.lifecycleCapabilities.RELEASE_APPROVED, false);
});

test('R2 Offline Verification CLI: zero credentials, zero network, blocks live flags, and matches checked-in preview plan', () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('NETWORK_FORBIDDEN_IN_R2_OFFLINE'); };
  try {
    assert.throws(
      () => runVerifyR2OfflineCli(['--execute']),
      /R2_OFFLINE_COMMISSION_ONLY_NO_LIVE_EXECUTION/
    );
    const cliOut = JSON.parse(execFileSync(process.execPath, [R2_CLI_PATH], {
      encoding: 'utf8',
      env: { ...process.env, GEMINI_API_KEY: 'must-never-be-read' }
    }));
    const expected = buildR2OfflinePreviewPlan();
    assert.deepEqual(cliOut, expected);
    assert.equal(cliOut.paidProviderCallsExecuted, 0);
    assert.equal(cliOut.credentialsAccessed, false);
    assert.equal(cliOut.nonceClaimsWritten, 0);
    assert.equal(cliOut.r1CustodyTouched, false);
    assert.equal(cliOut.empiricalProviderReturnsIncluded, false);

    const diskPreview = fs.readFileSync(path.join(R2_DIR, 'R2_PREVIEW_PLAN.json'));
    assert.equal(diskPreview[0] === 0xef && diskPreview[1] === 0xbb && diskPreview[2] === 0xbf, false);
    assert.equal(diskPreview.includes('\r\n'), false);
    assert.equal(diskPreview.toString('utf8'), `${JSON.stringify(expected, null, 2)}\n`);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
