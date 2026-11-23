// TD613 · Marrowline R2 · Post-Acquisition Engineering & Artistic Recovery Regression Suite
// Commission: TD613-MARROWLINE-R2-POST-ACQ-RECOVERY-20261123
// Predecessor: a48d2556ed946e01d4925dee93c463c73712d590 (PR #1783, R2-U pilot r2_r2u_036ef18ebc2e)
// Tests (100% offline, 0 real keys, 0 host-registry mutations):
// 1. Transport interruption & truncated SSE preservation
// 2. Incomplete provider completion (clean EOF missing finishReason)
// 3. MAX_TOKENS prompt closure (normal EOF + hung post-finish EOF timeout), truthful hold reasons (no fake DUAL_PARSER_DISAGREEMENT)
// 4. Slow active stream heartbeats + silence inactivity warning & abort (zero token ceilings)
// 5. Raw UTF-8 Unicode preservation & NFC/tampering detection
// 6. Windows PowerShell 5.1 full-key credential ingestion, Ctrl+V trap protection, CLI secret rejection & QuickEdit module safety
// 7. Nonce replay, post-attempt revocation, causal monotonic clocks, and backward-clock rejection
// 8. Exploratory morphology diagnostics & versioned candidate isolation (frozen v2/manifests untouched)

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  verifyPhysicalR2CustodyAndEvaluateGate,
  canonicalizeR2AuthorizationPayload
} from '../research/marrowline-r2-live-runner-20261123/r2-custody-gate-verifier.mjs';
import { executeR2ObservationCore } from '../research/marrowline-r2-live-runner-20261123/r2-live-core.mjs';
import { buildUnsignedR2GrantPayload } from '../research/marrowline-r2-live-runner-20261123/sign-r2-grant-interactive.mjs';
import {
  R2_U_CALIBRATED_CONTROLS,
  evaluateUnicodeMorphology
} from '../research/marrowline-r2-dual-estate-20261123/r2-unicode-evaluator.mjs';
import { R2_U_PINNED_COPY_SPECIMEN } from '../research/marrowline-r2-dual-estate-20261123/r2-u-preflight.mjs';
import { evaluateExploratoryMorphology } from '../research/marrowline-r2-post-acq-recovery-20261123/r2-exploratory-morphology.mjs';
import { buildR2ExploratoryCandidateManifest } from '../research/marrowline-r2-post-acq-recovery-20261123/r2-exploratory-candidates.mjs';
import { runAnalyzePilotExploratoryCli } from '../research/marrowline-r2-post-acq-recovery-20261123/analyze-pilot-exploratory.mjs';

const RUNNER_DIR = path.resolve('research/marrowline-r2-live-runner-20261123');
const TEST_HEAD_SHA = 'b'.repeat(40);

function makeEphemeralTestKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' });
  const fingerprintSha256 = crypto.createHash('sha256').update(publicKey.export({ type: 'spki', format: 'der' })).digest('hex');
  return { publicKeyPem, privateKey, fingerprintSha256 };
}

function signGrantForTest({
  estate = 'R2-U',
  privateKey,
  planId = 'INITIAL_SINGLE_ARM_LITERAL_CHECK',
  episodes = null,
  sessionId = null,
  nonce = null
}) {
  const unsigned = buildUnsignedR2GrantPayload({
    estate,
    checkedOutHeadSha: TEST_HEAD_SHA,
    planId,
    episodes,
    issuedAt: new Date().toISOString(),
    sessionId: sessionId || `rec_${crypto.randomBytes(6).toString('hex')}`,
    nonce: nonce || `wx_rec_${crypto.randomBytes(10).toString('hex')}`
  });
  const canonical = canonicalizeR2AuthorizationPayload(estate, unsigned.payload);
  const sig = crypto.sign(null, Buffer.from(canonical, 'utf8'), privateKey);
  return {
    algorithm: 'ed25519',
    payload: unsigned.payload,
    signatureBase64: sig.toString('base64')
  };
}

function makeMetadataOkResponse() {
  return new Response(JSON.stringify({
    name: 'models/gemini-3.8-flash',
    outputTokenLimit: 65536,
    inputTokenLimit: 1048576,
    supportedGenerationMethods: ['generateContent', 'countTokens']
  }), { status: 200, headers: { 'content-type': 'application/json' } });
}

function makeCountTokensOkResponse() {
  return new Response(JSON.stringify({ totalTokens: 128 }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}

function makeStreamResponseFromFactory(streamFactory) {
  return new Response(streamFactory(), {
    status: 200,
    headers: { 'content-type': 'text/event-stream' }
  });
}

test('Transport Interruption & Incomplete Provider Completion (Missing finishReason) Hold Cleanly', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-r2-rec-tx-'));
  const hostRegDir = path.join(tmpRoot, 'host-reg');
  const kp = makeEphemeralTestKeyPair();

  // 1. Mid-stream transport interruption (truncated frame without \n\n and stream error)
  const dirDrop = path.join(tmpRoot, 'drop');
  const grantDrop = signGrantForTest({ privateKey: kp.privateKey });
  const dropTransport = async (url) => {
    if (url.includes(':countTokens')) return makeCountTokensOkResponse();
    if (url.includes(':streamGenerateContent')) {
      return makeStreamResponseFromFactory(() => new ReadableStream({
        start(controller) {
          const goodEv = `data: ${JSON.stringify({
            modelVersion: 'gemini-3.8-flash',
            candidates: [{ content: { parts: [{ text: 'First fragment ' }] } }]
          })}\n\n`;
          controller.enqueue(Buffer.from(goodEv, 'utf8'));
          setTimeout(() => {
            controller.enqueue(Buffer.from('data: {"candidates":[{"content":{"parts":[{"text":"cut', 'utf8'));
            controller.error(new Error('ECONNRESET mock socket drop'));
          }, 15);
        }
      }));
    }
    return makeMetadataOkResponse();
  };

  const dropRes = await executeR2ObservationCore({
    estate: 'R2-U',
    acknowledgeLiveExecution: true,
    grant: grantDrop,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirDrop,
    hostNonceRegistryDir: hostRegDir,
    transportFetch: dropTransport,
    apiKey: 'mock-offline-key',
    planId: 'INITIAL_SINGLE_ARM_LITERAL_CHECK'
  });

  assert.equal(dropRes.attemptRecords[0].wire.streamInterrupted, true);
  assert.equal(dropRes.attemptRecords[0].integrityStopReason, 'STOP_ON_STREAM_INTERRUPTED');
  assert.equal(dropRes.attemptRecords[0].evaluation, null);
  assert.equal(dropRes.physicalCustodyGate.physicalVerificationPassed, false);
  assert.equal(dropRes.physicalCustodyGate.gateResult.held, true);
  assert.ok(dropRes.physicalCustodyGate.gateResult.holdReasons.includes('TRUNCATED_OR_DUPLICATE_SSE'));
  assert.ok(fs.readFileSync(dropRes.attemptRecords[0].rawSseFilePath, 'utf8').includes('First fragment '));

  // 2. Clean EOF with valid SSE frame delimiter but NO finishReason -> incomplete completion
  const dirNoFinish = path.join(tmpRoot, 'no-finish');
  const grantNoFinish = signGrantForTest({ privateKey: kp.privateKey });
  const noFinishTransport = async (url) => {
    if (url.includes(':countTokens')) return makeCountTokensOkResponse();
    if (url.includes(':streamGenerateContent')) {
      return makeStreamResponseFromFactory(() => new ReadableStream({
        start(controller) {
          const ev = `data: ${JSON.stringify({
            modelVersion: 'gemini-3.8-flash',
            candidates: [{ content: { parts: [{ text: R2_U_PINNED_COPY_SPECIMEN }] } }],
            usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 40, thoughtsTokenCount: 0, totalTokenCount: 140 }
          })}\n\n`;
          controller.enqueue(Buffer.from(ev, 'utf8'));
          controller.close();
        }
      }));
    }
    return makeMetadataOkResponse();
  };

  const noFinishRes = await executeR2ObservationCore({
    estate: 'R2-U',
    acknowledgeLiveExecution: true,
    grant: grantNoFinish,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirNoFinish,
    hostNonceRegistryDir: hostRegDir,
    transportFetch: noFinishTransport,
    apiKey: 'mock-offline-key',
    planId: 'INITIAL_SINGLE_ARM_LITERAL_CHECK'
  });

  assert.equal(noFinishRes.attemptRecords[0].wire.streamInterrupted, false);
  assert.equal(noFinishRes.attemptRecords[0].wire.completion.complete, false);
  assert.equal(noFinishRes.attemptRecords[0].integrityStopReason, 'STOP_ON_INCOMPLETE_COMPLETION_provider-stream-finish-unwitnessed');
  assert.equal(noFinishRes.attemptRecords[0].streamDiagnostics.terminationClass, 'NORMAL_EOF_WITHOUT_FINISH');
  assert.equal(noFinishRes.physicalCustodyGate.gateResult.held, true);

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('MAX_TOKENS Terminates Promptly (Normal & Hung Post-Finish EOF), Preserves Exact Reason, and Avoids False DUAL_PARSER_DISAGREEMENT', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-r2-rec-maxtok-'));
  const hostRegDir = path.join(tmpRoot, 'host-reg');
  const kp = makeEphemeralTestKeyPair();

  // 1. Normal MAX_TOKENS + EOF
  const dirMax = path.join(tmpRoot, 'max-normal');
  const grantMax = signGrantForTest({ privateKey: kp.privateKey });
  const maxNormalTransport = async (url) => {
    if (url.includes(':countTokens')) return makeCountTokensOkResponse();
    if (url.includes(':streamGenerateContent')) {
      return makeStreamResponseFromFactory(() => new ReadableStream({
        start(controller) {
          const ev = `data: ${JSON.stringify({
            modelVersion: 'gemini-3.8-flash',
            candidates: [{ content: { parts: [{ text: 'Partial hit max tokens' }] }, finishReason: 'MAX_TOKENS' }],
            usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 65500, thoughtsTokenCount: 36, totalTokenCount: 65636 }
          })}\n\n`;
          controller.enqueue(Buffer.from(ev, 'utf8'));
          controller.close();
        }
      }));
    }
    return makeMetadataOkResponse();
  };

  const maxRes = await executeR2ObservationCore({
    estate: 'R2-U',
    acknowledgeLiveExecution: true,
    grant: grantMax,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirMax,
    hostNonceRegistryDir: hostRegDir,
    transportFetch: maxNormalTransport,
    apiKey: 'mock-offline-key',
    planId: 'INITIAL_SINGLE_ARM_LITERAL_CHECK'
  });

  assert.equal(maxRes.attemptRecords[0].wire.parserAgreement, true);
  assert.equal(maxRes.attemptRecords[0].wire.parserB.finalFinishReason, 'MAX_TOKENS');
  assert.equal(maxRes.attemptRecords[0].integrityStopReason, 'STOP_ON_INCOMPLETE_COMPLETION_provider-output-token-limit');
  assert.equal(maxRes.attemptRecords[0].evaluation, null);
  assert.equal(maxRes.physicalCustodyGate.physicalVerificationPassed, false);
  assert.equal(maxRes.physicalCustodyGate.gateResult.held, true);
  assert.equal(maxRes.physicalCustodyGate.gateResult.lifecycleCapabilities.EMPIRICALLY_QUALIFIED, false);
  assert.ok(maxRes.physicalCustodyGate.physicalFailures.includes('NON_STOP_OR_BLOCKED_GENERATION:MAX_TOKENS:R2_U_LITERAL_COPY'));
  assert.equal(maxRes.physicalCustodyGate.gateResult.holdReasons.includes('DUAL_PARSER_DISAGREEMENT'), false);

  // 2. MAX_TOKENS followed by missing upstream EOF (hung socket) -> postFinishEofTimeoutMs closes cleanly and promptly
  const dirHungEof = path.join(tmpRoot, 'max-hung-eof');
  const grantHungEof = signGrantForTest({ privateKey: kp.privateKey });
  const maxHungEofTransport = async (url) => {
    if (url.includes(':countTokens')) return makeCountTokensOkResponse();
    if (url.includes(':streamGenerateContent')) {
      return makeStreamResponseFromFactory(() => new ReadableStream({
        start(controller) {
          const ev = `data: ${JSON.stringify({
            modelVersion: 'gemini-3.8-flash',
            candidates: [{ content: { parts: [{ text: 'Final text before missing EOF' }] }, finishReason: 'MAX_TOKENS' }],
            usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 65500, thoughtsTokenCount: 36, totalTokenCount: 65636 }
          })}\r\n\r\n`;
          controller.enqueue(Buffer.from(ev, 'utf8'));
          // Intentionally never call controller.close() to simulate missing upstream EOF
        }
      }));
    }
    return makeMetadataOkResponse();
  };

  const t0 = Date.now();
  const hungEofRes = await executeR2ObservationCore({
    estate: 'R2-U',
    acknowledgeLiveExecution: true,
    grant: grantHungEof,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirHungEof,
    hostNonceRegistryDir: hostRegDir,
    transportFetch: maxHungEofTransport,
    apiKey: 'mock-offline-key',
    planId: 'INITIAL_SINGLE_ARM_LITERAL_CHECK',
    postFinishEofTimeoutMs: 60
  });
  const elapsedMs = Date.now() - t0;

  assert.ok(elapsedMs < 2000, `Expected prompt post-finish EOF timeout closure, took ${elapsedMs}ms`);
  assert.equal(hungEofRes.attemptRecords[0].streamDiagnostics.postFinishEofTimeoutTriggered, true);
  assert.equal(hungEofRes.attemptRecords[0].streamDiagnostics.eofObserved, false);
  assert.equal(hungEofRes.attemptRecords[0].streamDiagnostics.transportEofUnwitnessed, true);
  assert.equal(hungEofRes.attemptRecords[0].streamDiagnostics.terminationClass, 'POST_FINISH_EOF_TIMEOUT_CLOSED_CLEANLY');
  assert.equal(hungEofRes.attemptRecords[0].wire.parserAgreement, true);
  assert.equal(hungEofRes.attemptRecords[0].wire.parserB.finalFinishReason, 'MAX_TOKENS');
  assert.equal(hungEofRes.attemptRecords[0].evaluation, null);
  assert.equal(hungEofRes.physicalCustodyGate.gateResult.held, true);
  assert.ok(hungEofRes.physicalCustodyGate.physicalFailures.includes('NON_STOP_OR_BLOCKED_GENERATION:MAX_TOKENS:R2_U_LITERAL_COPY'));
  assert.ok(hungEofRes.physicalCustodyGate.physicalFailures.includes('TRANSPORT_EOF_UNWITNESSED:MAX_TOKENS:R2_U_LITERAL_COPY'));

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('finishReason=STOP with Complete Terminal SSE Frame but Missing Upstream EOF Holds Fail-Closed with Zero Valid Slot Credit and Preserved Raw Bytes', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-r2-rec-stop-noeof-'));
  const hostRegDir = path.join(tmpRoot, 'host-reg');
  const kp = makeEphemeralTestKeyPair();
  const dirStopNoEof = path.join(tmpRoot, 'stop-missing-eof');
  const grantStopNoEof = signGrantForTest({ privateKey: kp.privateKey });

  const exactRawSseFrame = `data: ${JSON.stringify({
    modelVersion: 'gemini-3.8-flash',
    candidates: [{ content: { parts: [{ text: R2_U_PINNED_COPY_SPECIMEN }] }, finishReason: 'STOP' }],
    usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 40, thoughtsTokenCount: 5, totalTokenCount: 145 }
  })}\r\n\r\n`;

  const stopHungEofTransport = async (url) => {
    if (url.includes(':countTokens')) return makeCountTokensOkResponse();
    if (url.includes(':streamGenerateContent')) {
      return makeStreamResponseFromFactory(() => new ReadableStream({
        start(controller) {
          controller.enqueue(Buffer.from(exactRawSseFrame, 'utf8'));
          // Intentionally omit controller.close() to simulate missing upstream transport EOF after STOP
        }
      }));
    }
    return makeMetadataOkResponse();
  };

  const t0 = Date.now();
  const res = await executeR2ObservationCore({
    estate: 'R2-U',
    acknowledgeLiveExecution: true,
    grant: grantStopNoEof,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirStopNoEof,
    hostNonceRegistryDir: hostRegDir,
    transportFetch: stopHungEofTransport,
    apiKey: 'mock-offline-key',
    planId: 'INITIAL_SINGLE_ARM_LITERAL_CHECK',
    postFinishEofTimeoutMs: 60
  });
  const elapsedMs = Date.now() - t0;

  assert.ok(elapsedMs < 2000, `Expected prompt post-finish EOF timeout closure, took ${elapsedMs}ms`);

  // Preserved raw SSE & authored UTF-8 bytes and truthful parser results
  const att = res.attemptRecords[0];
  assert.equal(fs.readFileSync(att.rawSseFilePath, 'utf8'), exactRawSseFrame);
  assert.equal(fs.readFileSync(att.authoredTextFilePath, 'utf8'), R2_U_PINNED_COPY_SPECIMEN);
  assert.equal(att.wire.rawDiskVerified, true);
  assert.equal(att.wire.authoredDiskVerified, true);
  assert.equal(att.wire.parserAgreement, true);
  assert.equal(att.wire.parserB.finalFinishReason, 'STOP');
  assert.equal(att.wire.parserB.endsWithEventDelimiter, true);
  assert.equal(att.wire.completion.complete, true);

  // Transport EOF explicitly unwitnessed
  assert.equal(att.streamDiagnostics.postFinishEofTimeoutTriggered, true);
  assert.equal(att.streamDiagnostics.eofObserved, false);
  assert.equal(att.streamDiagnostics.transportEofUnwitnessed, true);
  assert.equal(att.streamDiagnostics.terminationClass, 'POST_FINISH_EOF_TIMEOUT_CLOSED_CLEANLY');

  // Fail-closed: zero valid slot credit, zero qualified episodes, HELD Gate
  assert.equal(att.integrityStopReason, 'STOP_ON_TRANSPORT_EOF_UNWITNESSED_AFTER_FINISH');
  assert.equal(att.evaluation, null);
  assert.equal(res.episodeSummaries[0].validSlotsCount, 0);
  assert.equal(res.episodeSummaries[0].allSlotsValid, false);
  assert.equal(res.episodeSummaries[0].held, true);
  assert.equal(res.dispatchCounts.episodesCompletedValid, 0);
  assert.equal(res.acquisitionScope.validAttemptsCount, 0);
  assert.equal(res.acquisitionScope.completedValidEpisodeCount, 0);
  assert.equal(res.acquisitionScope.classification, 'NO_VALID_OBSERVATION');

  assert.equal(res.physicalCustodyGate.physicalVerificationPassed, false);
  assert.equal(res.physicalCustodyGate.reportedVsVerified.independentlyVerifiedPhysicalEvidence.verifiedAttemptCount, 0);
  assert.ok(res.physicalCustodyGate.physicalFailures.includes('TRANSPORT_EOF_UNWITNESSED:STOP:R2_U_LITERAL_COPY'));
  assert.ok(res.physicalCustodyGate.physicalFailures.includes('NO_VERIFIED_COMPLETED_SSE_CAPTURE'));
  assert.equal(res.physicalCustodyGate.gateResult.overallDisposition, 'HELD');
  assert.equal(res.physicalCustodyGate.gateResult.held, true);
  assert.equal(res.physicalCustodyGate.gateResult.lifecycleCapabilities.EMPIRICALLY_QUALIFIED, false);
  assert.equal(res.physicalCustodyGate.gateResult.securityAndSafeHarbor.externalAdmissionProved, false);
  assert.equal(res.physicalCustodyGate.gateResult.holdReasons.includes('DUAL_PARSER_DISAGREEMENT'), false);

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('Bounded Inactivity Observability, Heartbeat Progress Log & Safe Silence Abort (Zero Token Ceilings)', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-r2-rec-obs-'));
  const hostRegDir = path.join(tmpRoot, 'host-reg');
  const kp = makeEphemeralTestKeyPair();

  // 1. Slow healthy stream emits heartbeats + writes progress.log without capping output
  const dirSlow = path.join(tmpRoot, 'slow-ok');
  const grantSlow = signGrantForTest({ privateKey: kp.privateKey });
  const progressLines = [];
  const slowTransport = async (url) => {
    if (url.includes(':countTokens')) return makeCountTokensOkResponse();
    if (url.includes(':streamGenerateContent')) {
      return makeStreamResponseFromFactory(() => new ReadableStream({
        start(controller) {
          const half = Math.ceil(R2_U_PINNED_COPY_SPECIMEN.length / 2);
          const ev1 = `data: ${JSON.stringify({
            modelVersion: 'gemini-3.8-flash',
            candidates: [{ content: { parts: [{ text: R2_U_PINNED_COPY_SPECIMEN.slice(0, half) }] } }],
            usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 10, thoughtsTokenCount: 5, totalTokenCount: 115 }
          })}\n\n`;
          const ev2 = `data: ${JSON.stringify({
            modelVersion: 'gemini-3.8-flash',
            candidates: [{ content: { parts: [{ text: R2_U_PINNED_COPY_SPECIMEN.slice(half) }] }, finishReason: 'STOP' }],
            usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 20, thoughtsTokenCount: 5, totalTokenCount: 125 }
          })}\n\n`;
          controller.enqueue(Buffer.from(ev1, 'utf8'));
          setTimeout(() => {
            controller.enqueue(Buffer.from(ev2, 'utf8'));
            controller.close();
          }, 95);
        }
      }));
    }
    return makeMetadataOkResponse();
  };

  const slowRes = await executeR2ObservationCore({
    estate: 'R2-U',
    acknowledgeLiveExecution: true,
    grant: grantSlow,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirSlow,
    hostNonceRegistryDir: hostRegDir,
    transportFetch: slowTransport,
    apiKey: 'mock-offline-key',
    planId: 'INITIAL_SINGLE_ARM_LITERAL_CHECK',
    streamHeartbeatIntervalMs: 25,
    inactivityWarnMs: 500,
    onProgress: (line) => progressLines.push(line)
  });

  assert.equal(slowRes.physicalCustodyGate.physicalVerificationPassed, true);
  assert.equal(slowRes.attemptRecords[0].streamDiagnostics.artificialTokenCeilingImposed, false);
  assert.equal(slowRes.attemptRecords[0].streamDiagnostics.terminationClass, 'NORMAL_EOF_AFTER_FINISH');
  assert.ok(progressLines.some((l) => l.includes('heartbeat: ACTIVE_STREAMING')));
  assert.ok(fs.existsSync(slowRes.progressLogPath));
  assert.ok(fs.readFileSync(slowRes.progressLogPath, 'utf8').includes('heartbeat: ACTIVE_STREAMING'));
  assert.ok(Number.isFinite(slowRes.observabilityDiagnostics.eventLoopDelayP99Ms));

  // 2. Hung silent stream emits INACTIVITY_WARNING and triggers operator-configured inactivityAbortMs cleanly
  const dirSilent = path.join(tmpRoot, 'silent-abort');
  const grantSilent = signGrantForTest({ privateKey: kp.privateKey });
  const silentTransport = async (url) => {
    if (url.includes(':countTokens')) return makeCountTokensOkResponse();
    if (url.includes(':streamGenerateContent')) {
      return makeStreamResponseFromFactory(() => new ReadableStream({
        start(controller) {
          const ev1 = `data: ${JSON.stringify({
            modelVersion: 'gemini-3.8-flash',
            candidates: [{ content: { parts: [{ text: 'Start before stall ' }] } }]
          })}\n\n`;
          controller.enqueue(Buffer.from(ev1, 'utf8'));
          // Silence forever without finishReason or EOF
        }
      }));
    }
    return makeMetadataOkResponse();
  };

  const silentRes = await executeR2ObservationCore({
    estate: 'R2-U',
    acknowledgeLiveExecution: true,
    grant: grantSilent,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirSilent,
    hostNonceRegistryDir: hostRegDir,
    transportFetch: silentTransport,
    apiKey: 'mock-offline-key',
    planId: 'INITIAL_SINGLE_ARM_LITERAL_CHECK',
    streamHeartbeatIntervalMs: 20,
    inactivityWarnMs: 30,
    inactivityAbortMs: 90
  });

  assert.equal(silentRes.attemptRecords[0].streamDiagnostics.inactivityAbortTriggered, true);
  assert.ok(silentRes.attemptRecords[0].streamDiagnostics.inactivityWarningsCount >= 1);
  assert.equal(silentRes.attemptRecords[0].streamDiagnostics.terminationClass, 'TRANSPORT_INACTIVITY_ABORT');
  assert.equal(silentRes.attemptRecords[0].integrityStopReason, 'STOP_ON_STREAM_INACTIVITY_ABORT');
  assert.equal(silentRes.physicalCustodyGate.gateResult.held, true);

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('Unicode Integrity: Preserves Raw Combining Marks Byte-for-Byte and Detects Silent NFC Recomputation', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-r2-rec-uni-'));
  const hostRegDir = path.join(tmpRoot, 'host-reg');
  const kp = makeEphemeralTestKeyPair();

  const dirUni = path.join(tmpRoot, 'uni-tamper');
  const grantUni = signGrantForTest({ privateKey: kp.privateKey });
  const nfdSample = R2_U_PINNED_COPY_SPECIMEN;
  const uniTransport = async (url) => {
    if (url.includes(':countTokens')) return makeCountTokensOkResponse();
    if (url.includes(':streamGenerateContent')) {
      return makeStreamResponseFromFactory(() => new ReadableStream({
        start(controller) {
          const ev = `data: ${JSON.stringify({
            modelVersion: 'gemini-3.8-flash',
            candidates: [{ content: { parts: [{ text: nfdSample }] }, finishReason: 'STOP' }],
            usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 25, thoughtsTokenCount: 0, totalTokenCount: 125 }
          })}\n\n`;
          controller.enqueue(Buffer.from(ev, 'utf8'));
          controller.close();
        }
      }));
    }
    return makeMetadataOkResponse();
  };

  // Simulate post-write silent NFC normalization on disk before postDisk SHA-256 verification
  const uniRes = await executeR2ObservationCore({
    estate: 'R2-U',
    acknowledgeLiveExecution: true,
    grant: grantUni,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirUni,
    hostNonceRegistryDir: hostRegDir,
    transportFetch: uniTransport,
    apiKey: 'mock-offline-key',
    planId: 'INITIAL_SINGLE_ARM_LITERAL_CHECK',
    textIntegrityProbe: (authoredPath) => {
      const orig = fs.readFileSync(authoredPath, 'utf8');
      fs.writeFileSync(authoredPath, orig.normalize('NFC'), 'utf8');
    }
  });

  assert.equal(uniRes.attemptRecords[0].textIntegrityOk, false);
  assert.equal(uniRes.attemptRecords[0].integrityStopReason, 'STOP_ON_ALTERED_UNICODE_TEXT');
  assert.equal(uniRes.physicalCustodyGate.physicalVerificationPassed, false);
  assert.ok(uniRes.physicalCustodyGate.physicalFailures.includes('AUTHORED_TEXT_DISK_VS_SSE_MISMATCH:R2_U_LITERAL_COPY'));
  assert.ok(uniRes.physicalCustodyGate.gateResult.holdReasons.includes('DUAL_PARSER_DISAGREEMENT'));

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('Windows PowerShell 5.1 Credential Ingestion, Ctrl+V Control-Byte Rejection, File Intake & CLI Secret Rejection', () => {
  if (process.platform !== 'win32') return;

  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-r2-rec-ps-'));
  const psModulePath = path.join(RUNNER_DIR, 'R2-CredentialInput.psm1');
  const psLaunchPath = path.join(RUNNER_DIR, 'Launch-R2Observation.ps1');
  const secretFilePath = path.join(tmpRoot, 'test-api-key.txt');
  const syntheticKey = 'AIzaSyFakeRegressionKey0123456789ABCDEF';
  fs.writeFileSync(secretFilePath, `${syntheticKey}\r\n`, 'utf8');

  // 1. AST parse both PS files cleanly
  for (const p of [psModulePath, psLaunchPath]) {
    const astOut = execFileSync('powershell', [
      '-NoProfile',
      '-Command',
      `$err = $null; $tok = $null; [void][System.Management.Automation.Language.Parser]::ParseFile('${p.replace(/'/g, "''")}', [ref]$tok, [ref]$err); if ($err.Count -gt 0) { throw ($err | Out-String) }; 'AST_OK'`
    ], { encoding: 'utf8' }).trim();
    assert.equal(astOut, 'AST_OK');
  }

  // 2. Test credential candidate validation (1-char Ctrl+V 0x16, empty, short, embedded whitespace, valid file read) without echoing secret
  const credOut = execFileSync('powershell', [
    '-NoProfile',
    '-Command',
    [
      'Set-StrictMode -Version Latest',
      '$ErrorActionPreference = "Stop"',
      `Import-Module '${psModulePath.replace(/'/g, "''")}' -Force`,
      '$ctrlV = Test-R2CredentialCandidate -Value ([string][char]22) -Kind GeminiApiKey',
      '$empty = Test-R2CredentialCandidate -Value "" -Kind GeminiApiKey',
      '$short = Test-R2CredentialCandidate -Value "AIza123" -Kind GeminiApiKey',
      '$space = Test-R2CredentialCandidate -Value "AIzaSyFakeKey WithSpace12345" -Kind GeminiApiKey',
      `$fromFile = Read-R2SecretFromFile -Path '${secretFilePath.replace(/'/g, "''")}' -Kind GeminiApiKey`,
      '$qe = Disable-R2ConsoleQuickEdit',
      'Restore-R2ConsoleMode -State $qe',
      '[PSCustomObject]@{ ' +
      'ctrlV = $ctrlV.FailureCode; ' +
      'empty = $empty.FailureCode; ' +
      'short = $short.FailureCode; ' +
      'space = $space.FailureCode; ' +
      'fileValid = $fromFile.Valid; ' +
      'fileLen = $fromFile.Length; ' +
      'exactMatch = ($fromFile.NormalizedValue -ceq "AIzaSyFakeRegressionKey0123456789ABCDEF"); ' +
      'noSecretInDiag = -not $fromFile.SafeDiagnostic.Contains("AIzaSyFakeRegression") ' +
      '} | ConvertTo-Json'
    ].join('; ')
  ], { encoding: 'utf8' });

  assert.equal(credOut.includes(syntheticKey), false, 'PowerShell stdout must never disclose secret');
  const parsedCred = JSON.parse(credOut);
  assert.equal(parsedCred.ctrlV, 'RAW_CTRL_V_PASTE_INTERCEPTED');
  assert.equal(parsedCred.empty, 'EMPTY_CREDENTIAL');
  assert.equal(parsedCred.short, 'CREDENTIAL_TOO_SHORT');
  assert.equal(parsedCred.space, 'WHITESPACE_IN_API_KEY');
  assert.equal(parsedCred.fileValid, true);
  assert.equal(parsedCred.fileLen, syntheticKey.length);
  assert.equal(parsedCred.exactMatch, true);
  assert.equal(parsedCred.noSecretInDiag, true);

  // 3. Reject plaintext -ApiKey CLI parameter on Launch-R2Observation.ps1
  assert.throws(() => {
    execFileSync('powershell', [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      psLaunchPath,
      '-ApiKey',
      'never-allowed'
    ], { encoding: 'utf8', stdio: 'pipe' });
  });

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('Nonce Replay, Post-Attempt Revocation, Causal Clock Ordering & Backward-Clock Rejection', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-r2-rec-custody-'));
  const hostRegDir = path.join(tmpRoot, 'host-reg');
  const kp = makeEphemeralTestKeyPair();

  // 1. Post-attempt revocation (revocation written AFTER attempt completes, BEFORE gate verification closes)
  const dirRevPost = path.join(tmpRoot, 'rev-post');
  const revFile = path.join(tmpRoot, 'r2-u-revocation.json');
  const grantRevPost = signGrantForTest({
    privateKey: kp.privateKey,
    sessionId: 'post_attempt_rev_01'
  });
  const okTransport = async (url) => {
    if (url.includes(':countTokens')) return makeCountTokensOkResponse();
    if (url.includes(':streamGenerateContent')) {
      return makeStreamResponseFromFactory(() => new ReadableStream({
        start(controller) {
          const ev = `data: ${JSON.stringify({
            modelVersion: 'gemini-3.8-flash',
            candidates: [{ content: { parts: [{ text: R2_U_PINNED_COPY_SPECIMEN }] }, finishReason: 'STOP' }],
            usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 30, thoughtsTokenCount: 0, totalTokenCount: 130 }
          })}\n\n`;
          controller.enqueue(Buffer.from(ev, 'utf8'));
          controller.close();
        }
      }));
    }
    return makeMetadataOkResponse();
  };

  const revPostRes = await executeR2ObservationCore({
    estate: 'R2-U',
    acknowledgeLiveExecution: true,
    grant: grantRevPost,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirRevPost,
    hostNonceRegistryDir: hostRegDir,
    revocationFilePath: revFile,
    transportFetch: okTransport,
    apiKey: 'mock-offline-key',
    planId: 'INITIAL_SINGLE_ARM_LITERAL_CHECK',
    onProgress: (line) => {
      if (line.includes('[4/4] Running independent cryptographic')) {
        fs.writeFileSync(revFile, JSON.stringify({ revokeAll: true }), 'utf8');
      }
    }
  });

  assert.equal(revPostRes.attemptRecords[0].wire.parserB.finalFinishReason, 'STOP');
  assert.equal(revPostRes.physicalCustodyGate.physicalVerificationPassed, false);
  assert.equal(revPostRes.physicalCustodyGate.gateResult.held, true);
  assert.ok(revPostRes.physicalCustodyGate.physicalFailures.includes('AUTH_VERIFICATION_FAILED:R2_AUTH_SESSION_REVOKED'));
  assert.equal(revPostRes.observabilityDiagnostics.postAttemptRevocationObserved, true);
  assert.ok(revPostRes.observabilityDiagnostics.revocationObservedAt);

  // Causal clock ordering check
  const c = revPostRes.observabilityDiagnostics.clocks;
  assert.ok(c.operatorClockMs <= c.serviceClockMs);
  assert.ok(c.serviceClockMs <= c.providerReceiptClockMs);
  assert.ok(c.providerReceiptClockMs <= c.custodyClockMs);
  assert.ok(c.custodyClockMs <= c.postGateClassificationClockMs);
  assert.equal(revPostRes.physicalCustodyGate.gateResult.clocks.classificationClockMs, null);

  // 2. Replaying same grant in a new folder fails with R2_AUTH_NONCE_REPLAYED
  await assert.rejects(
    () => executeR2ObservationCore({
      estate: 'R2-U',
      acknowledgeLiveExecution: true,
      grant: grantRevPost,
      publicKeyPem: kp.publicKeyPem,
      pinnedTrustFingerprintSha256: kp.fingerprintSha256,
      checkedOutHeadSha: TEST_HEAD_SHA,
      evidenceDir: path.join(tmpRoot, 'replay-dir'),
      hostNonceRegistryDir: hostRegDir,
      transportFetch: okTransport,
      apiKey: 'mock-offline-key',
      planId: 'INITIAL_SINGLE_ARM_LITERAL_CHECK'
    }),
    { code: 'R2_AUTH_NONCE_REPLAYED' }
  );

  // 3. Backward-clock inversion rejected explicitly by physical Gate verifier
  const invertedClockGate = verifyPhysicalR2CustodyAndEvaluateGate({
    estate: 'R2-U',
    grant: grantRevPost,
    publicKeyPem: kp.publicKeyPem,
    pinnedTrustFingerprintSha256: kp.fingerprintSha256,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir: dirRevPost,
    hostNonceRegistryDir: hostRegDir,
    revocationFilePath: revFile,
    receipt: revPostRes,
    clockContext: {
      timebaseValidated: true,
      timebaseRelation: 'SINGLE_PROCESS_HRTIME_MONOTONIC_CALIBRATED_MS',
      calibrationAnchor: { wallAnchorMs: 1000, hrtimeBaseNs: '1000' },
      phases: { noticeAt: 1000, actAt: 1010, worldAnswersAt: 1020, nameAt: null },
      clocks: {
        operatorClockMs: 1000,
        serviceClockMs: 1010,
        providerReceiptClockMs: 1020,
        custodyClockMs: 1015, // Inverted backwards!
        classificationClockMs: null
      }
    }
  });
  assert.equal(invertedClockGate.physicalVerificationPassed, false);
  assert.ok(invertedClockGate.physicalFailures.includes('CLOCK_CHRONOLOGY_INVERSION'));
  assert.ok(invertedClockGate.gateResult.holdReasons.includes('INVALID_CLOCK_CHRONOLOGY'));

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('Exploratory Morphology Diagnostics & Versioned Candidate Isolation Keep Frozen Evaluators/Manifests Untouched', () => {
  // 1. Synthetic period-17 blizzard with decorated spaces & punctuation (mimicking GUIDED_RULES failure mode)
  const periodTape = Array.from({ length: 17 }, (_, idx) => (
    String.fromCodePoint(0x0300 + (idx % 10)).repeat(4) +
    String.fromCodePoint(0x0316 + (idx % 10)).repeat(4) +
    '\u0308\u0301\u0308\u0301'
  ));
  const plainSentence = 'The harbor bell, cold and loud, shakes wet wool, ink, and stamped forms across the icy pier. ';
  let blizzardSample = '';
  let ci = 0;
  for (const ch of plainSentence.repeat(2)) {
    blizzardSample += ch + periodTape[ci % 17];
    ci += 1;
  }

  const blizzardExp = evaluateExploratoryMorphology(blizzardSample);
  assert.equal(blizzardExp.exploratoryOnly, true);
  assert.equal(blizzardExp.doesNotModifyFrozenV2Verdict, true);
  assert.equal(blizzardExp.artisticQualityVerdict, 'UNIDENTIFIABLE_AUTOMATICALLY_RESERVED_HUMAN_ONLY');
  assert.equal(blizzardExp.periodicRepetition.dominantLag, 17);
  assert.ok(blizzardExp.periodicRepetition.maxLagMatchRate >= 0.9);
  assert.equal(blizzardExp.exploratoryDiagnosticFlags.periodicTapeLoopStencil, true);
  assert.equal(blizzardExp.exploratoryDiagnosticFlags.extremeUniformDepthBlizzard, true);
  assert.equal(blizzardExp.exploratoryDiagnosticFlags.indiscriminateWhitespaceDecoration, true);
  assert.equal(blizzardExp.exploratoryDiagnosticFlags.indiscriminatePunctuationDecoration, true);
  assert.equal(blizzardExp.exploratoryDiagnosticFlags.controlledChoreographicVariationObserved, false);

  // 2. Single-cluster runaway spike
  const spikeSample = 'The\u0301 pier\u0302 groans\u0303. U' + '\u0308\u0301\u0344\u035D'.repeat(250);
  const spikeExp = evaluateExploratoryMorphology(spikeSample);
  assert.equal(spikeExp.exploratoryDiagnosticFlags.runawaySingleClusterSpike, true);
  assert.ok(spikeExp.runawaySpikeGeometry.top1MarkShare > 0.95);
  assert.ok(spikeExp.scaleInvariantDispersion.decorated.median <= 2);

  // 3. Calibrated towering genuine High Zalgo passes exploratory variation without false pathological flags
  const healthyExp = evaluateExploratoryMorphology(R2_U_CALIBRATED_CONTROLS.DELIBERATE_MULTISTACK_REF.sample);
  assert.equal(healthyExp.exploratoryDiagnosticFlags.flags.length, 0);
  assert.equal(healthyExp.exploratoryDiagnosticFlags.technicalUnicodeCapabilityObserved, true);
  assert.equal(healthyExp.exploratoryDiagnosticFlags.controlledChoreographicVariationObserved, true);

  // Verify frozen v2 still runs unchanged on calibrated sample
  const frozenV2 = evaluateUnicodeMorphology(R2_U_CALIBRATED_CONTROLS.DELIBERATE_MULTISTACK_REF.sample);
  assert.equal(frozenV2.toweringHighZalgoObserved, true);
  assert.equal(frozenV2.stencilRisk.isStencil, false);

  // 4. Exploratory candidate manifest and offline analyzer emit 0 calls and preserve frozen manifests
  const candManifest = buildR2ExploratoryCandidateManifest();
  assert.equal(candManifest.paidProviderCallsExecuted, 0);
  assert.equal(candManifest.frozenR2UManifestModified, false);
  assert.equal(candManifest.frozenR2WManifestModified, false);
  assert.equal(candManifest.candidates.length, 2);

  const analyzerOut = runAnalyzePilotExploratoryCli([]);
  assert.equal(analyzerOut.analysis.doesNotRewriteHistoricalVerdict, true);
  assert.ok(analyzerOut.analysis.calibratedControls.length >= 6);
});
