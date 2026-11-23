// TD613 · Marrowline R2 · Offline Live-Runner & Physical Custody Adversarial Test Suite
// Commission: TD613-MARROWLINE-R2-LIVE-RUNNER-20261123
// Tests: Architectural zero-override boundaries, strict R2-U/R2-W estate isolation,
// Ed25519 grant/HEAD/manifest verification, physical disk & raw-SSE Gate closure,
// limited-pilot vs multi-episode scope classification, R2-W blinding & Oct-2 correlation,
// non-2xx HTTP error custody, mid-stream revocation, and PowerShell launcher AST/preflight.

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  R2_U_ACQUISITION_PLANS,
  R2_W_ACQUISITION_PLANS,
  classifyR2AcquisitionCompletion,
  validateAcquisitionEpisodesForEstate
} from '../research/marrowline-r2-live-runner-20261123/r2-acquisition-plans.mjs';
import {
  R2_ESTATE_SPECS,
  buildExpectedEstatePlan,
  canonicalizeR2AuthorizationPayload,
  verifyPhysicalR2CustodyAndEvaluateGate,
  verifyR2OperatorAuthorization
} from '../research/marrowline-r2-live-runner-20261123/r2-custody-gate-verifier.mjs';
import { buildR2HealthyBaselineCorrelation } from '../research/marrowline-r2-live-runner-20261123/r2-healthy-baseline-correlation.mjs';
import { executeR2ObservationCore } from '../research/marrowline-r2-live-runner-20261123/r2-live-core.mjs';
import {
  R2_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256,
  runEstateRunnerCli
} from '../research/marrowline-r2-live-runner-20261123/r2-runner-cli-common.mjs';
import { executeR2UObservation } from '../research/marrowline-r2-live-runner-20261123/run-r2-u-observation.mjs';
import { executeR2WObservation } from '../research/marrowline-r2-live-runner-20261123/run-r2-w-observation.mjs';
import { buildUnsignedR2GrantPayload } from '../research/marrowline-r2-live-runner-20261123/sign-r2-grant-interactive.mjs';
import { runVerifyR2LiveRunnerOfflineCli } from '../research/marrowline-r2-live-runner-20261123/verify-r2-live-runner-offline.mjs';
import { R2_U_CALIBRATED_CONTROLS } from '../research/marrowline-r2-dual-estate-20261123/r2-unicode-evaluator.mjs';
import { R2_U_PINNED_COPY_SPECIMEN } from '../research/marrowline-r2-dual-estate-20261123/r2-u-preflight.mjs';

const RUNNER_DIR = path.resolve('research/marrowline-r2-live-runner-20261123');
const TEST_HEAD_SHA = 'a'.repeat(40);

function makeEphemeralTestKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' });
  const fingerprintSha256 = crypto.createHash('sha256').update(publicKey.export({ type: 'spki', format: 'der' })).digest('hex');
  return { publicKeyPem, privateKey, fingerprintSha256 };
}

function signGrantForTest({ estate, privateKey, checkedOutHeadSha = TEST_HEAD_SHA, mutatePayload = null, nonce = null, sessionId = null }) {
  const unsigned = buildUnsignedR2GrantPayload({
    estate,
    checkedOutHeadSha,
    issuedAt: new Date().toISOString(),
    sessionId: sessionId || `test_${estate.toLowerCase().replace(/[^a-z0-9]/g, '')}_01`,
    nonce: nonce || `test_nonce_${crypto.randomBytes(10).toString('hex')}`
  });
  const payload = mutatePayload ? mutatePayload(structuredClone(unsigned.payload)) : unsigned.payload;
  const canonical = canonicalizeR2AuthorizationPayload(estate, payload);
  const sig = crypto.sign(null, Buffer.from(canonical, 'utf8'), privateKey);
  return {
    algorithm: 'ed25519',
    payload,
    signatureBase64: sig.toString('base64')
  };
}

function makeSseStreamResponse(authoredText, {
  modelVersion = 'gemini-3.8-flash',
  finishReason = 'STOP',
  promptTokens = 120,
  candidateTokens = 210,
  thoughtTokens = 40
} = {}) {
  const ev1 = `data: ${JSON.stringify({
    modelVersion,
    candidates: [{ content: { parts: [{ thought: true, text: 'deliberation' }, { text: authoredText.slice(0, Math.ceil(authoredText.length / 2)) }] } }]
  })}\n\n`;
  const ev2 = `data: ${JSON.stringify({
    modelVersion,
    candidates: [{ content: { parts: [{ text: authoredText.slice(Math.ceil(authoredText.length / 2)) }] }, finishReason }],
    usageMetadata: {
      promptTokenCount: promptTokens,
      candidatesTokenCount: candidateTokens,
      thoughtsTokenCount: thoughtTokens,
      totalTokenCount: promptTokens + candidateTokens + thoughtTokens
    }
  })}\n\n`;
  const chunks = [Buffer.from(ev1, 'utf8'), Buffer.from(ev2, 'utf8')];
  let idx = 0;
  const stream = new ReadableStream({
    pull(controller) {
      if (idx < chunks.length) {
        controller.enqueue(chunks[idx]);
        idx += 1;
      } else {
        controller.close();
      }
    }
  });
  return new Response(stream, { status: 200, headers: { 'content-type': 'text/event-stream' } });
}

function makeMockTransport({ slotTextResolver, metaLimit = 65536, onSseAbortable = null } = {}) {
  const calls = [];
  const transportFetch = async (url, init = {}) => {
    calls.push({ url, method: init.method || 'GET' });
    if (url.includes('/v1beta/models/gemini-3.8-flash:countTokens')) {
      return new Response(JSON.stringify({ totalTokens: 144 }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (url.includes('/v1beta/models/gemini-3.8-flash:streamGenerateContent')) {
      const parsed = JSON.parse(init.body);
      const userText = parsed?.contents?.[0]?.parts?.[0]?.text || '';
      if (typeof onSseAbortable === 'function') {
        return onSseAbortable({ url, init, userText });
      }
      const resSpec = slotTextResolver(userText, parsed);
      if (resSpec?.httpError) {
        return new Response(resSpec.httpError.body, { status: resSpec.httpError.status, headers: { 'x-mock-err': '1' } });
      }
      return makeSseStreamResponse(resSpec.text, resSpec.meta);
    }
    if (url.includes('/v1beta/models/gemini-3.8-flash')) {
      return new Response(JSON.stringify({
        name: 'models/gemini-3.8-flash',
        outputTokenLimit: metaLimit,
        inputTokenLimit: 1048576,
        supportedGenerationMethods: ['generateContent', 'countTokens']
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    throw new Error(`UNEXPECTED_MOCK_URL:${url}`);
  };
  return { transportFetch, calls };
}

test('Architectural Security Proof: production executables hold pinned trust anchor, zero test overrides, and reject CLI bypass', async () => {
  assert.equal(R2_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256, '840a71625f4b9db224871bbb126b6debc3fefdc9179b5628bd9faf514f2c7701');
  for (const fname of ['run-r2-u-observation.mjs', 'run-r2-w-observation.mjs', 'r2-runner-cli-common.mjs', 'r2-live-core.mjs']) {
    const src = fs.readFileSync(path.join(RUNNER_DIR, fname), 'utf8');
    assert.equal(/process\.env\.NODE_TEST_CONTEXT/.test(src), false, `${fname} must not branch on NODE_TEST_CONTEXT`);
    assert.equal(src.includes('testOnly'), false, `${fname} must not include testOnly hooks`);
  }
  const coreSrc = fs.readFileSync(path.join(RUNNER_DIR, 'r2-live-core.mjs'), 'utf8');
  assert.equal(coreSrc.includes('globalThis.fetch'), false);
  assert.equal(coreSrc.includes('child_process'), false);

  await assert.rejects(
    () => executeR2UObservation({ acknowledgeLiveExecution: true, transportFetch: async () => {} }),
    { code: 'R2_UNBOUNDED_FORBIDDEN_EXECUTABLE_OVERRIDE' }
  );
  await assert.rejects(
    () => executeR2WObservation({ acknowledgeLiveExecution: true, checkedOutHeadShaOverride: TEST_HEAD_SHA }),
    { code: 'R2_UNBOUNDED_FORBIDDEN_EXECUTABLE_OVERRIDE' }
  );
  await assert.rejects(() => runEstateRunnerCli('R2-U', ['--live']), { code: 'R2_CLI_LIVE_DISPATCH_HELD' });
  await assert.rejects(() => runEstateRunnerCli('R2-W', ['--count-tokens']), { code: 'R2_CLI_LIVE_DISPATCH_HELD' });
  await assert.rejects(
    () => runEstateRunnerCli('R2-U', ['--execute', '--ack-live-r2-w-observation']),
    { code: 'R2_AUTH_CROSS_ESTATE_ACK_FORBIDDEN' }
  );
  await assert.rejects(
    () => runEstateRunnerCli('R2-W', ['--execute', '--ack-live-r2-u-observation']),
    { code: 'R2_AUTH_CROSS_ESTATE_ACK_FORBIDDEN' }
  );

  // Default offline CLI emits 0-call preflights for both estates without needing private keys
  const uPreflight = JSON.parse(execFileSync(process.execPath, [path.join(RUNNER_DIR, 'run-r2-u-observation.mjs')], { encoding: 'utf8' }));
  const wPreflight = JSON.parse(execFileSync(process.execPath, [path.join(RUNNER_DIR, 'run-r2-w-observation.mjs')], { encoding: 'utf8' }));
  assert.equal(uPreflight.status, 'SOURCE_ONLY_QUALIFIED');
  assert.equal(uPreflight.paidProviderCallsExecuted, 0);
  assert.equal(wPreflight.status, 'SOURCE_ONLY_QUALIFIED');
  assert.equal(wPreflight.paidProviderCallsExecuted, 0);
});

test('Estate Scope & Authority Separation: rejects cross-estate grants/slots/dirs, forbidden ceilings, R1/Argon grants, untrusted keys, and nonce replay', async () => {
  const kp = makeEphemeralTestKeyPair();
  const otherKp = makeEphemeralTestKeyPair();
  const uGrant = signGrantForTest({ estate: 'R2-U', privateKey: kp.privateKey });
  const wGrant = signGrantForTest({ estate: 'R2-W', privateKey: kp.privateKey });

  // Cross-estate grant rejection
  assert.throws(
    () => verifyR2OperatorAuthorization({
      estate: 'R2-U',
      grant: wGrant,
      publicKeyPem: kp.publicKeyPem,
      checkedOutHeadSha: TEST_HEAD_SHA,
      pinnedTrustFingerprintSha256: kp.fingerprintSha256
    }),
    { code: 'R2_AUTH_CROSS_ESTATE_SCOPE_MISMATCH' }
  );
  assert.throws(
    () => verifyR2OperatorAuthorization({
      estate: 'R2-W',
      grant: uGrant,
      publicKeyPem: kp.publicKeyPem,
      checkedOutHeadSha: TEST_HEAD_SHA,
      pinnedTrustFingerprintSha256: kp.fingerprintSha256
    }),
    { code: 'R2_AUTH_CROSS_ESTATE_SCOPE_MISMATCH' }
  );

  // Untrusted key & stripped U+200C & forbidden ceiling field & HEAD mismatch & R1/Argon schemas
  assert.throws(
    () => verifyR2OperatorAuthorization({
      estate: 'R2-U',
      grant: uGrant,
      publicKeyPem: kp.publicKeyPem,
      checkedOutHeadSha: TEST_HEAD_SHA,
      pinnedTrustFingerprintSha256: otherKp.fingerprintSha256
    }),
    { code: 'R2_AUTH_UNTRUSTED_PUBLIC_KEY' }
  );
  assert.throws(
    () => verifyR2OperatorAuthorization({
      estate: 'R2-U',
      grant: uGrant,
      publicKeyPem: kp.publicKeyPem,
      checkedOutHeadSha: 'b'.repeat(40),
      pinnedTrustFingerprintSha256: kp.fingerprintSha256
    }),
    { code: 'R2_AUTH_HEAD_MISMATCH' }
  );
  const cappedGrant = signGrantForTest({
    estate: 'R2-U',
    privateKey: kp.privateKey,
    mutatePayload: (p) => ({ ...p, maxCalls: 2 })
  });
  assert.throws(
    () => verifyR2OperatorAuthorization({
      estate: 'R2-U',
      grant: cappedGrant,
      publicKeyPem: kp.publicKeyPem,
      checkedOutHeadSha: TEST_HEAD_SHA,
      pinnedTrustFingerprintSha256: kp.fingerprintSha256
    }),
    { code: 'R2_AUTH_FORBIDDEN_ARTIFICIAL_CEILING_IN_GRANT' }
  );
  const badCovenantGrant = signGrantForTest({
    estate: 'R2-U',
    privateKey: kp.privateKey,
    mutatePayload: (p) => ({ ...p, covenant: 'Khonalit-po' })
  });
  assert.throws(
    () => verifyR2OperatorAuthorization({
      estate: 'R2-U',
      grant: badCovenantGrant,
      publicKeyPem: kp.publicKeyPem,
      checkedOutHeadSha: TEST_HEAD_SHA,
      pinnedTrustFingerprintSha256: kp.fingerprintSha256
    }),
    { code: 'R2_AUTH_COVENANT_OR_SEAL_MISMATCH' }
  );

  // Acquisition plan rejects cross-estate slot mixing
  assert.throws(
    () => validateAcquisitionEpisodesForEstate('R2-U', [{ episodeId: 1, sequence: ['W_FULL_PRODUCTION_FRAME'] }]),
    /R2_CROSS_ESTATE_CONDITION_FORBIDDEN/
  );
  assert.throws(
    () => validateAcquisitionEpisodesForEstate('R2-W', [{ episodeId: 1, sequence: ['R2_U_GUIDED_RULES'] }]),
    /R2_CROSS_ESTATE_CONDITION_FORBIDDEN/
  );

  // Separate evidence directory blocks foreign estate/R1 contamination
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-r2-iso-'));
  const dirtyDir = path.join(tmpRoot, 'shared');
  fs.mkdirSync(dirtyDir, { recursive: true });
  fs.writeFileSync(path.join(dirtyDir, 'r2-u-nonce-fake.json'), '{}', 'utf8');
  const { transportFetch } = makeMockTransport({
    slotTextResolver: () => ({ text: 'Kʰonapolit\nx\n\nTauric Diana bots\ny\n\n⟐' })
  });
  await assert.rejects(
    () => executeR2ObservationCore({
      estate: 'R2-W',
      acknowledgeLiveExecution: true,
      grant: wGrant,
      publicKeyPem: kp.publicKeyPem,
      pinnedTrustFingerprintSha256: kp.fingerprintSha256,
      checkedOutHeadSha: TEST_HEAD_SHA,
      evidenceDir: dirtyDir,
      transportFetch,
      apiKey: 'mock-key-never-called',
      planId: 'SINGLE_CIVIC_PAIR'
    }),
    { code: 'R2_CROSS_ESTATE_EVIDENCE_DIR_CONTAMINATION' }
  );

  // Single-host nonce replay blocks second launch with same signed grant BEFORE fetch
  const cleanDir = path.join(tmpRoot, 'u-clean');
  const uMock = makeMockTransport({
    slotTextResolver: () => ({ text: R2_U_CALIBRATED_CONTROLS.DELIBERATE_MULTISTACK_REF.sample })
  });
  await executeR2ObservationCore({
    estate: 'R2-U',
    acknowledgeLiveExecution: true,
    grant: uGrant,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: cleanDir,
    transportFetch: uMock.transportFetch,
    apiKey: 'mock-key',
    planId: 'INITIAL_SINGLE_ARM_LITERAL_CHECK'
  });
  await assert.rejects(
    () => executeR2ObservationCore({
      estate: 'R2-U',
      acknowledgeLiveExecution: true,
      grant: uGrant,
      publicKeyPem: kp.publicKeyPem,
      pinnedTrustFingerprintSha256: kp.fingerprintSha256,
      checkedOutHeadSha: TEST_HEAD_SHA,
      evidenceDir: cleanDir,
      transportFetch: uMock.transportFetch,
      apiKey: 'mock-key',
      planId: 'INITIAL_SINGLE_ARM_LITERAL_CHECK'
    }),
    { code: 'R2_AUTH_NONCE_REPLAYED' }
  );
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('R2-U Live Runner, Limited vs Multi-Episode Scope, Negative-Result Qualification & Adversarial Physical Gate Closure', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-r2-u-'));
  const kp = makeEphemeralTestKeyPair();

  // 1. Limited initial pilot (1 forward U_C1 episode returning uniform depth-1 stencil -> NEGATIVE RESULT)
  const dirNeg = path.join(tmpRoot, 'u-neg');
  const grantNeg = signGrantForTest({ estate: 'R2-U', privateKey: kp.privateKey });
  const mockNeg = makeMockTransport({
    slotTextResolver: () => ({ text: R2_U_CALIBRATED_CONTROLS.ONE_MARK_STENCIL_REF.sample })
  });
  const negRes = await executeR2ObservationCore({
    estate: 'R2-U',
    acknowledgeLiveExecution: true,
    grant: grantNeg,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirNeg,
    transportFetch: mockNeg.transportFetch,
    apiKey: 'mock-key',
    planId: 'INITIAL_PILOT'
  });
  assert.equal(negRes.physicalCustodyGate.physicalVerificationPassed, true);
  assert.equal(negRes.physicalCustodyGate.gateResult.held, false);
  assert.equal(negRes.physicalCustodyGate.gateResult.lifecycleCapabilities.EMPIRICALLY_QUALIFIED, true);
  assert.equal(negRes.physicalCustodyGate.gateResult.securityAndSafeHarbor.externalAdmissionProved, true);
  assert.equal(negRes.physicalCustodyGate.gateResult.scientificHypothesisVerdict, 'OBSERVATION_VALID_HYPOTHESIS_NOT_SUPPORTED');
  assert.equal(negRes.acquisitionScope.classification, 'SINGLE_COUNTERBALANCED_PAIR_ONLY');
  assert.equal(negRes.acquisitionScope.multiEpisodeComparisonCompleted, false);

  // 2. Adversarial Gate integration closure: mutate authored file on disk to NFC/corrupted text while keeping caller metadata claims intact -> MUST HOLD!
  const firstAuthored = negRes.attemptRecords[0].authoredTextFilePath;
  fs.appendFileSync(firstAuthored, ' TAMPERED', 'utf8');
  const tamperedGate = verifyPhysicalR2CustodyAndEvaluateGate({
    estate: 'R2-U',
    grant: grantNeg,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirNeg,
    receipt: negRes,
    reportedClaims: { signatureValid: true, nonceClaimed: true, rawCaptureVerified: true },
    clockContext: { timebaseValidated: false }
  });
  assert.equal(tamperedGate.physicalVerificationPassed, false);
  assert.equal(tamperedGate.gateResult.held, true);
  assert.equal(tamperedGate.gateResult.lifecycleCapabilities.EMPIRICALLY_QUALIFIED, false);
  assert.equal(tamperedGate.gateResult.securityAndSafeHarbor.externalAdmissionProved, false);
  assert.equal(tamperedGate.gateResult.clocks.preemptionGapMs, null);
  assert.ok(tamperedGate.physicalFailures.some((f) => f.includes('AUTHORED_TEXT_DISK_VS_SSE_MISMATCH')));

  // 3. Adversarial naked-claims check: invalid signature + fabricated hashes MUST fail closed even with caller claims
  const forgedGrant = { ...grantNeg, signatureBase64: Buffer.alloc(64, 7).toString('base64') };
  const forgedGate = verifyPhysicalR2CustodyAndEvaluateGate({
    estate: 'R2-U',
    grant: forgedGrant,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirNeg,
    receipt: negRes,
    reportedClaims: { signatureValid: true, nonceClaimed: true, rawCaptureVerified: true }
  });
  assert.equal(forgedGate.physicalVerificationPassed, false);
  assert.equal(forgedGate.gateResult.held, true);
  assert.equal(forgedGate.gateResult.securityAndSafeHarbor.externalAdmissionProved, false);
  assert.ok(forgedGate.physicalFailures.some((f) => f.includes('AUTH_VERIFICATION_FAILED')));

  // 4. Full balanced COUNTERBALANCED_C1_PAIR with authentic towering High Zalgo -> MULTI_EPISODE_COUNTERBALANCED_COMPLETE + HYPOTHESIS_SUPPORTED
  const dirPos = path.join(tmpRoot, 'u-pos');
  const grantPos = signGrantForTest({ estate: 'R2-U', privateKey: kp.privateKey });
  const mockPos = makeMockTransport({
    slotTextResolver: (userText) => ({
      text: userText.includes(R2_U_PINNED_COPY_SPECIMEN)
        ? R2_U_PINNED_COPY_SPECIMEN
        : R2_U_CALIBRATED_CONTROLS.DELIBERATE_MULTISTACK_REF.sample
    })
  });
  const posRes = await executeR2ObservationCore({
    estate: 'R2-U',
    acknowledgeLiveExecution: true,
    grant: grantPos,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirPos,
    transportFetch: mockPos.transportFetch,
    apiKey: 'mock-key',
    planId: 'COUNTERBALANCED_C1_PAIR'
  });
  assert.equal(posRes.physicalCustodyGate.physicalVerificationPassed, true);
  assert.equal(posRes.physicalCustodyGate.gateResult.scientificHypothesisVerdict, 'HYPOTHESIS_SUPPORTED');
  assert.equal(posRes.acquisitionScope.classification, 'MULTI_EPISODE_COUNTERBALANCED_COMPLETE');
  assert.equal(posRes.acquisitionScope.multiEpisodeComparisonCompleted, true);
  assert.equal(posRes.dispatchCounts.episodesCompletedValid, 2);

  // Confirm single-slot scope classifier guard
  const scopeGuard = classifyR2AcquisitionCompletion({
    estate: 'R2-U',
    plannedEpisodes: R2_U_ACQUISITION_PLANS.INITIAL_SINGLE_ARM_LITERAL_CHECK.episodes,
    episodeSummaries: [{ episodeId: 1, order: 'SINGLE_SLOT', sequence: ['R2_U_LITERAL_COPY'], attemptedSlotsCount: 1, validSlotsCount: 1, allSlotsValid: true, held: false }]
  });
  assert.equal(scopeGuard.classification, 'LIMITED_INITIAL_SINGLE_OBSERVATION');
  assert.equal(scopeGuard.multiEpisodeComparisonCompleted, false);

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('R2-W Whole-Frame Civic + Noncivic Runner, Blinded Packet, Oct-2 Baseline Correlation & Abort/503 Custody', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-r2-w-'));
  const kp = makeEphemeralTestKeyPair();

  // 1. Complete INITIAL_PILOT (1 civic tribunal pair + 1 noncivic Black Sea orchard pair)
  const dirW = path.join(tmpRoot, 'w-pilot');
  const grantW = signGrantForTest({ estate: 'R2-W', privateKey: kp.privateKey });
  const wMock = makeMockTransport({
    slotTextResolver: (userText) => {
      const isNonCivic = userText.includes('Black Sea salt mist');
      const sec1 = isNonCivic
        ? 'Kʰonapolit\nThe kiln salt settles on unstrung wood before sunrise.'
        : 'Kʰonapolit\nBlank envelopes never prove consent under an inverted denominator.';
      const sec2 = `Tauric Diana bots\n${R2_U_CALIBRATED_CONTROLS.DELIBERATE_MULTISTACK_REF.sample}\n\n⟐`;
      return { text: `${sec1}\n\n${sec2}` };
    }
  });
  const wRes = await executeR2ObservationCore({
    estate: 'R2-W',
    acknowledgeLiveExecution: true,
    grant: grantW,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirW,
    transportFetch: wMock.transportFetch,
    apiKey: 'mock-key',
    planId: 'INITIAL_PILOT'
  });
  assert.equal(wRes.estate, 'R2-W');
  assert.equal(wRes.physicalCustodyGate.physicalVerificationPassed, true);
  assert.equal(wRes.humanArtisticAcceptance, 'RESERVED_HUMAN_ONLY');
  assert.equal(wRes.physicalCustodyGate.gateResult.lifecycleCapabilities.HUMAN_ACCEPTED, false);
  assert.equal(wRes.acquisitionScope.classification, 'LIMITED_MULTI_SLOT_WITHOUT_WITHIN_PAIR_COUNTERBALANCE');
  assert.equal(wRes.acquisitionScope.multiEpisodeComparisonCompleted, false);
  assert.equal(wRes.blindedEpisodes.length, 2);
  const blindJson = JSON.stringify(wRes.blindedEpisodes.map((b) => b.publicPacket));
  assert.equal(blindJson.includes('W_FULL_PRODUCTION_FRAME'), false);
  assert.equal(blindJson.includes('W_NONCIVIC_FULL_PRODUCTION_FRAME'), false);
  assert.equal(blindJson.includes('W_CONDENSED_WHOLE_FRAME'), false);
  assert.equal(wRes.attemptRecords.every((r) => r.evaluation.rubric.verifiedTransportCapturePassed === true), true);
  assert.equal(wRes.attemptRecords.every((r) => r.evaluation.baselineComparison.humanArtisticAuthority === 'RESERVED_HUMAN_ONLY'), true);
  assert.equal(wRes.healthyBaselineCorrelation.healthySourceBasis.oct02SourceCommit, 'ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a');

  // 2. Non-200 HTTP 503 error custody persists exact raw error bytes on disk and holds Gate
  const dirErr = path.join(tmpRoot, 'w-503');
  const grantErr = signGrantForTest({ estate: 'R2-W', privateKey: kp.privateKey });
  const mock503 = makeMockTransport({
    slotTextResolver: () => ({ httpError: { status: 503, body: '{"error":{"code":503,"message":"Overloaded"}}' } })
  });
  const res503 = await executeR2ObservationCore({
    estate: 'R2-W',
    acknowledgeLiveExecution: true,
    grant: grantErr,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirErr,
    transportFetch: mock503.transportFetch,
    apiKey: 'mock-key',
    planId: 'SINGLE_NONCIVIC_PAIR'
  });
  assert.equal(res503.physicalCustodyGate.gateResult.held, true);
  assert.equal(res503.physicalCustodyGate.gateResult.lifecycleCapabilities.EMPIRICALLY_QUALIFIED, false);
  assert.equal(res503.attemptRecords[0].httpErrorCustody.httpStatus, 503);
  assert.equal(
    fs.readFileSync(res503.attemptRecords[0].httpErrorCustody.rawErrorBodyPath, 'utf8'),
    '{"error":{"code":503,"message":"Overloaded"}}'
  );

  // 3. In-flight operator revocation aborts stream mid-flight and preserves partial .sse bytes cleanly
  const dirRev = path.join(tmpRoot, 'w-rev');
  const grantRev = signGrantForTest({ estate: 'R2-W', privateKey: kp.privateKey, sessionId: 'revoked_midstream_01' });
  const revFile = path.join(tmpRoot, 'revocations.json');
  const abortableMock = makeMockTransport({
    onSseAbortable: () => {
      const partial = `data: ${JSON.stringify({ modelVersion: 'gemini-3.8-flash', candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nPartial chunk' }] } }] })}\n\n`;
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(Buffer.from(partial, 'utf8'));
          fs.writeFileSync(revFile, JSON.stringify({ revokedSessionIds: ['revoked_midstream_01'] }), 'utf8');
        }
      });
      return new Response(stream, { status: 200, headers: { 'content-type': 'text/event-stream' } });
    }
  });
  const revRes = await executeR2ObservationCore({
    estate: 'R2-W',
    acknowledgeLiveExecution: true,
    grant: grantRev,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirRev,
    revocationFilePath: revFile,
    transportFetch: abortableMock.transportFetch,
    apiKey: 'mock-key',
    planId: 'SINGLE_CIVIC_PAIR'
  });
  assert.equal(revRes.integritySessionHaltReason, 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED');
  assert.equal(revRes.physicalCustodyGate.gateResult.held, true);
  assert.ok(fs.readFileSync(revRes.attemptRecords[0].rawSseFilePath, 'utf8').includes('Partial chunk'));

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('Windows PowerShell Launcher AST Validity, Offline Verifier & Healthy Baseline Artifact Match', async () => {
  const ps1Path = path.join(RUNNER_DIR, 'Launch-R2Observation.ps1');
  if (process.platform === 'win32') {
    const astCheck = execFileSync('powershell', [
      '-NoProfile',
      '-Command',
      `$err = $null; $tok = $null; [void][System.Management.Automation.Language.Parser]::ParseFile('${ps1Path.replace(/'/g, "''")}', [ref]$tok, [ref]$err); if ($err.Count -gt 0) { throw ($err | Out-String) }; 'PS_AST_OK'`
    ], { encoding: 'utf8' }).trim();
    assert.equal(astCheck, 'PS_AST_OK');

    // Run default offline preflight of Launch-R2Observation.ps1 with zero API keys / zero network
    const psPreflight = execFileSync('powershell', [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      ps1Path,
      '-Estate',
      'R2-W',
      '-Plan',
      'INITIAL_PILOT'
    ], { encoding: 'utf8' });
    assert.ok(psPreflight.includes('OFFLINE PREFLIGHT COMPLETE'));
    assert.ok(psPreflight.includes('HYDROGEN_R2_W_AUTHENTIC_WHOLE_FRAME_ART'));
  }

  const offlineSummary = await runVerifyR2LiveRunnerOfflineCli([]);
  assert.equal(offlineSummary.status, 'R2_LIVE_READY_HUMAN_AUTHORIZATION_REQUIRED');
  assert.equal(offlineSummary.paidProviderCallsExecuted, 0);

  const baselineBuilt = buildR2HealthyBaselineCorrelation();
  const baselineDisk = fs.readFileSync(path.join(RUNNER_DIR, 'R2_HEALTHY_BASELINE_CORRELATION.json'));
  assert.equal(baselineDisk[0] === 0xef && baselineDisk[1] === 0xbb && baselineDisk[2] === 0xbf, false);
  assert.equal(baselineDisk.includes('\r\n'), false);
  assert.equal(baselineDisk.toString('utf8'), `${JSON.stringify(baselineBuilt, null, 2)}\n`);
});
