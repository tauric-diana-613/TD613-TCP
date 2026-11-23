import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  FROZEN_R1_SLOT_DIGESTS,
  R1_COVENANT,
  R1_EXPERIMENT_ID,
  R1_GRANT_SCHEMA,
  R1_HARD_LIMITS,
  R1_PINNED_MODEL,
  R1_SEAL,
  R1_THINKING_LEVEL,
  R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256,
  verifyR1OperatorAuthorization,
  analyzeR1TwoSectionObservation,
  buildFrozenR1ObservationPlan,
  canonicalizeR1AuthorizationPayload,
  executeR1OriginalSseObservation,
  measureUnicodeMorphology,
  resolveCheckedOutGitHeadSha
} from '../research/marrowline-r1-activation-handoff-20261122/run-r1-original-sse-observation.mjs';

const RUNNER_PATH = path.resolve('research/marrowline-r1-activation-handoff-20261122/run-r1-original-sse-observation.mjs');
const TEST_HEAD_SHA = 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678';

// Test-only injected trust pins cannot reach the CLI actual-provider path.
// The public key shipped alongside a grant has no inherent authority.
function trustedFingerprint(pem) {
  return crypto.createHash('sha256')
    .update(crypto.createPublicKey(pem).export({ type: 'spki', format: 'der' }))
    .digest('hex');
}

function createEphemeralTestSigner() {
  return crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
}

function buildValidUnsignedPayload(overrides = {}) {
  const plan = buildFrozenR1ObservationPlan();
  const s01 = plan.slots[0];
  const s02 = plan.slots[1];
  const issuedMs = Date.now() - 10_000;
  const expiresMs = issuedMs + 20 * 60 * 1000;
  return {
    schema: R1_GRANT_SCHEMA,
    experimentId: R1_EXPERIMENT_ID,
    pinnedModel: R1_PINNED_MODEL,
    thinkingLevel: R1_THINKING_LEVEL,
    maxCalls: 2,
    retriesPermitted: 0,
    fallbackSeatsPermitted: 0,
    structuralRepairsPermitted: 0,
    executionMode: 'LIVE_TWO_SLOT_SEQUENTIAL_S01_THEN_S02',
    checkedOutHeadSha: TEST_HEAD_SHA,
    generationConfigSha256: s01.observation.generationConfigSha256,
    generationConfig: s01.request.generationConfig,
    slots: {
      R1_S01: {
        arm: s01.arm,
        bodySha256: s01.observation.bodySha256,
        modelAndBodySha256: s01.observation.modelAndBodySha256,
        countTokensRequestSha256: s01.countTokensRequestSha256
      },
      R1_S02: {
        arm: s02.arm,
        bodySha256: s02.observation.bodySha256,
        modelAndBodySha256: s02.observation.modelAndBodySha256,
        countTokensRequestSha256: s02.countTokensRequestSha256
      }
    },
    perSlotHardPromptTokenCeiling: R1_HARD_LIMITS.perSlotHardPromptTokenCeiling,
    combinedPromptPlanningCap: R1_HARD_LIMITS.combinedPromptPlanningCap,
    perSlotMaxOutputTokens: R1_HARD_LIMITS.perSlotMaxOutputTokens,
    combinedOutputAndThoughtCeiling: R1_HARD_LIMITS.combinedOutputAndThoughtCeiling,
    perSlotMaxRequestUtf8Bytes: R1_HARD_LIMITS.perSlotMaxRequestUtf8Bytes,
    issuedAt: new Date(issuedMs).toISOString(),
    expiresAt: new Date(expiresMs).toISOString(),
    nonce: `testnonce_${crypto.randomBytes(12).toString('hex')}`,
    authorizedBy: 'operator-human-test',
    covenant: R1_COVENANT,
    seal: R1_SEAL,
    ...overrides
  };
}

function signGrant(payload, privateKeyPem) {
  const signingInput = Buffer.from(canonicalizeR1AuthorizationPayload(payload), 'utf8');
  const signatureBase64 = crypto.sign(null, signingInput, privateKeyPem).toString('base64');
  return {
    algorithm: 'ed25519',
    payload,
    signatureBase64
  };
}

function makeTempNonceDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'td613-r1-test-nonces-'));
}

function makeCredentialTrapEnv() {
  return new Proxy({}, {
    get(_target, prop) {
      if (prop === 'GEMINI_API_KEY') {
        throw new Error('CREDENTIAL_ACCESSED_PREMATURELY');
      }
      return undefined;
    }
  });
}

function makePoisonFetch() {
  return async (url) => {
    throw new Error(`NETWORK_FORBIDDEN_CALL:${url}`);
  };
}

function makeSseResponse(events, { trailingNewline = '\n\n', status = 200 } = {}) {
  const bodyText = events.map((ev) => `data: ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`).join('\n\n') + trailingNewline;
  return new Response(bodyText, {
    status,
    headers: { 'content-type': 'text/event-stream; charset=utf-8' }
  });
}

function makeJsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

function makeMultiStackSample() {
  // Varied depths (2, 3, 4), above+below bidirectional clusters, and U+0334..U+0338 overlay
  return [
    'T\u0301\u0323\u0335h\u0302\u0327e',
    'b\u0304\u0325\u0336\u0308u\u030C\u0329r\u0300\u0316e',
    'a\u0303\u0317\u0337u\u030A\u0323c',
    'r\u0301\u0329a\u0302\u0325c\u0338y',
    'b\u0308\u0323a\u0304\u0316n\u030C\u0329\u0301\u0334n\u0300\u0327e\u0302\u0323r',
    's\u0301\u0325h\u0304\u0329o\u030A\u0317\u0335o\u0308\u0323k.'
  ].join(' ');
}

function makeUniformDepth3StencilSample() {
  return 'T\u0301\u0323\u0335h\u0302\u0327\u0336e r\u0300\u0316\u0337a\u0303\u0317\u0338i\u030A\u0323\u0334n f\u0304\u0325\u0335e\u030C\u0329\u0336l\u0308\u0323\u0337l.';
}

test('Gate B: runner contains zero private keys, zero Argon grant imports, and stops offline by default', () => {
  const source = fs.readFileSync(RUNNER_PATH, 'utf8');
  assert.equal(source.includes('BEGIN PRIVATE KEY'), false);
  assert.equal(source.includes('argon-be-lexical-discriminator-preflight'), false);
  assert.equal(source.includes('vercel'), false);
  assert.match(source, /R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = null/);
  assert.match(source, /R1_DURABLE_RAW_SSE_WRITE_FAILED/);
  assert.match(source, /R1_EXPLICIT_DURABLE_EVIDENCE_PATHS_REQUIRED/);
  assert.match(source, /blindedOutPath/);
  assert.match(source, /BLIND_READERS_ONLY/);

  const originalFetch = globalThis.fetch;
  globalThis.fetch = makePoisonFetch();
  try {
    const out = execFileSync(process.execPath, [RUNNER_PATH], { encoding: 'utf8' });
    const parsed = JSON.parse(out);
    assert.equal(parsed.status, 'SOURCE_ONLY_QUALIFIED');
    assert.equal(parsed.paidProviderCallsExecuted, 0);
    assert.equal(parsed.countTokensCallsExecuted, 0);
    assert.equal(parsed.modelDiscoveryCallsExecuted, 0);
    assert.equal(parsed.slots[0].bodySha256, FROZEN_R1_SLOT_DIGESTS.R1_S01.bodySha256);
    assert.equal(parsed.slots[1].bodySha256, FROZEN_R1_SLOT_DIGESTS.R1_S02.bodySha256);
    assert.match(resolveCheckedOutGitHeadSha(process.cwd()), /^[0-9a-f]{40}$/);

    // CLI live flags refuse fail-closed before credentials/network
    for (const badFlags of [['--execute'], ['--execute', '--ack-live-r1-observation'], ['--live'], ['--count-tokens']]) {
      let failed = false;
      try {
        execFileSync(process.execPath, [RUNNER_PATH, ...badFlags], {
          encoding: 'utf8',
          env: { ...process.env, GEMINI_API_KEY: 'must-never-be-used' },
          stdio: ['ignore', 'pipe', 'pipe']
        });
      } catch (err) {
        failed = err.status === 1;
      }
      assert.equal(failed, true, `CLI flags ${badFlags.join(' ')} must fail closed`);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Operator public-key trust anchor fails closed until independently pinned in reviewed source', () => {
  assert.equal(R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256, null);
  const { publicKey, privateKey } = createEphemeralTestSigner();
  assert.throws(() => verifyR1OperatorAuthorization({
    grant: signGrant(buildValidUnsignedPayload(), privateKey),
    publicKeyPem: publicKey,
    checkedOutHeadSha: TEST_HEAD_SHA,
    trustedPublicKeySha256: null
  }), (e) => e.code === 'R1_AUTH_TRUST_ANCHOR_NOT_PROVISIONED');
});

test('Gate C/D: rejects unacknowledged, absent, malformed, unsigned, tampered, wrong-key, wrong-HEAD, stale, TTL>30m, covenant-stripped, and Argon grants BEFORE credential read or fetch', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = makePoisonFetch();
  const nonceDir = makeTempNonceDir();
  const { publicKey, privateKey } = createEphemeralTestSigner();
  const { publicKey: wrongPublicKey } = createEphemeralTestSigner();

  const runDenied = async (opts) => executeR1OriginalSseObservation({
    testOnlyTrustedPublicKeySha256: trustedFingerprint(publicKey),
    checkedOutHeadShaOverride: TEST_HEAD_SHA,
    nonceDir,
    env: makeCredentialTrapEnv(),
    fetchImpl: makePoisonFetch(),
    ...opts
  });

  try {
    // Unacknowledged
    await assert.rejects(
      () => runDenied({ acknowledgeLiveExecution: false }),
      (e) => e.code === 'R1_LIVE_EXECUTION_NOT_ACKNOWLEDGED'
    );

    // Absent grant
    await assert.rejects(
      () => runDenied({ acknowledgeLiveExecution: true, grant: null, publicKeyPem: publicKey }),
      (e) => e.code === 'R1_AUTH_MISSING'
    );

    // Malformed grant
    await assert.rejects(
      () => runDenied({ acknowledgeLiveExecution: true, grant: { algorithm: 'ed25519', payload: 'bad', signatureBase64: 'x' }, publicKeyPem: publicKey }),
      (e) => e.code === 'R1_AUTH_MALFORMED'
    );

    // Old Argon grant offered as R1
    await assert.rejects(
      () => runDenied({
        acknowledgeLiveExecution: true,
        grant: signGrant(buildValidUnsignedPayload({ schema: 'td613.marrowline.argon-live-experiment-authorization/v2-ed25519' }), privateKey),
        publicKeyPem: publicKey
      }),
      (e) => e.code === 'R1_AUTH_ARGON_GRANT_FORBIDDEN'
    );

    // Missing signature / invalid signature / wrong public key / missing public key
    const validPayload = buildValidUnsignedPayload();
    await assert.rejects(
      () => runDenied({ acknowledgeLiveExecution: true, grant: { algorithm: 'ed25519', payload: validPayload, signatureBase64: '' }, publicKeyPem: publicKey }),
      (e) => e.code === 'R1_AUTH_MISSING_SIGNATURE'
    );
    await assert.rejects(
      () => runDenied({ acknowledgeLiveExecution: true, grant: signGrant(validPayload, privateKey), publicKeyPem: '' }),
      (e) => e.code === 'R1_AUTH_MISSING_PUBLIC_KEY'
    );
    await assert.rejects(
      () => runDenied({ acknowledgeLiveExecution: true, grant: signGrant(validPayload, privateKey), publicKeyPem: wrongPublicKey }),
      (e) => e.code === 'R1_AUTH_UNTRUSTED_PUBLIC_KEY'
    );
    const tamperedSig = signGrant(validPayload, privateKey);
    tamperedSig.payload = { ...tamperedSig.payload, authorizedBy: 'other-person' };
    await assert.rejects(
      () => runDenied({ acknowledgeLiveExecution: true, grant: tamperedSig, publicKeyPem: publicKey }),
      (e) => e.code === 'R1_AUTH_INVALID_SIGNATURE'
    );

    // Incorrect checked-out HEAD
    await assert.rejects(
      () => runDenied({
        acknowledgeLiveExecution: true,
        grant: signGrant(buildValidUnsignedPayload({ checkedOutHeadSha: 'f'.repeat(40) }), privateKey),
        publicKeyPem: publicKey
      }),
      (e) => e.code === 'R1_AUTH_HEAD_MISMATCH'
    );
    await assert.rejects(
      () => runDenied({
        acknowledgeLiveExecution: true,
        grant: signGrant(buildValidUnsignedPayload({ executionMode: 'UNBOUNDED' }), privateKey),
        publicKeyPem: publicKey
      }),
      (e) => e.code === 'R1_AUTH_EXECUTION_MODE_MISMATCH'
    );

    // Stale / expired grant
    const oldIssued = new Date(Date.now() - 25 * 60 * 1000).toISOString();
    const oldExpired = new Date(Date.now() - 60 * 1000).toISOString();
    await assert.rejects(
      () => runDenied({
        acknowledgeLiveExecution: true,
        grant: signGrant(buildValidUnsignedPayload({ issuedAt: oldIssued, expiresAt: oldExpired }), privateKey),
        publicKeyPem: publicKey
      }),
      (e) => e.code === 'R1_AUTH_EXPIRED'
    );

    // TTL > 30 minutes
    const futureBeyond30m = new Date(Date.now() + 31 * 60 * 1000).toISOString();
    await assert.rejects(
      () => runDenied({
        acknowledgeLiveExecution: true,
        grant: signGrant(buildValidUnsignedPayload({ expiresAt: futureBeyond30m }), privateKey),
        publicKeyPem: publicKey
      }),
      (e) => e.code === 'R1_AUTH_TTL_EXCEEDS_30M'
    );

    // Model mismatch / config mismatch / request digest mismatch / U+200C stripped
    await assert.rejects(
      () => runDenied({
        acknowledgeLiveExecution: true,
        grant: signGrant(buildValidUnsignedPayload({ pinnedModel: 'gemini-3.6-flash' }), privateKey),
        publicKeyPem: publicKey
      }),
      (e) => e.code === 'R1_AUTH_MODEL_MISMATCH'
    );
    await assert.rejects(
      () => runDenied({
        acknowledgeLiveExecution: true,
        grant: signGrant(buildValidUnsignedPayload({
          generationConfig: { ...buildValidUnsignedPayload().generationConfig, maxOutputTokens: 4096 }
        }), privateKey),
        publicKeyPem: publicKey
      }),
      (e) => e.code === 'R1_AUTH_CONFIG_MISMATCH'
    );
    const badSlots = structuredClone(buildValidUnsignedPayload().slots);
    badSlots.R1_S02.bodySha256 = '0'.repeat(64);
    await assert.rejects(
      () => runDenied({
        acknowledgeLiveExecution: true,
        grant: signGrant(buildValidUnsignedPayload({ slots: badSlots }), privateKey),
        publicKeyPem: publicKey
      }),
      (e) => e.code === 'R1_AUTH_DIGEST_MISMATCH'
    );
    await assert.rejects(
      () => runDenied({
        acknowledgeLiveExecution: true,
        grant: signGrant(buildValidUnsignedPayload({ covenant: 'Khonalit-po' }), privateKey),
        publicKeyPem: publicKey
      }),
      (e) => e.code === 'R1_AUTH_COVENANT_OR_SEAL_MISMATCH'
    );
  } finally {
    globalThis.fetch = originalFetch;
    fs.rmSync(nonceDir, { recursive: true, force: true });
  }
});

test('Gate D: rejects changed request hash, different user contents, config drift, B1 arm, and hidden 3rd slot BEFORE credential read', async () => {
  const { publicKey, privateKey } = createEphemeralTestSigner();
  const nonceDir = makeTempNonceDir();
  const grant = signGrant(buildValidUnsignedPayload(), privateKey);
  const canonicalPlan = buildFrozenR1ObservationPlan();
  const s01Req = structuredClone(canonicalPlan.slots[0].request);
  const s02Req = structuredClone(canonicalPlan.slots[1].request);

  try {
    // 1. Different user contents
    const alteredContentsS02 = structuredClone(s02Req);
    alteredContentsS02.contents = [{ role: 'user', parts: [{ text: 'Write a completely different prompt about rain.' }] }];
    await assert.rejects(
      () => executeR1OriginalSseObservation({
    testOnlyTrustedPublicKeySha256: trustedFingerprint(publicKey),
        acknowledgeLiveExecution: true,
        grant,
        publicKeyPem: publicKey,
        checkedOutHeadShaOverride: TEST_HEAD_SHA,
        nonceDir,
        env: makeCredentialTrapEnv(),
        fetchImpl: makePoisonFetch(),
        slotRequestsOverride: [
          { slot: 'R1_S01', arm: 'R1_TWO_HEADINGS_ZALGO_BOTH', model: R1_PINNED_MODEL, request: s01Req },
          { slot: 'R1_S02', arm: 'R1_TWO_HEADINGS_PLAIN_FIRST', model: R1_PINNED_MODEL, request: alteredContentsS02 }
        ]
      }),
      (e) => e.code === 'R1_CONTENTS_DRIFT'
    );

    // 2. Config drift
    const alteredConfigS01 = structuredClone(s01Req);
    alteredConfigS01.generationConfig.maxOutputTokens = 2048;
    await assert.rejects(
      () => executeR1OriginalSseObservation({
    testOnlyTrustedPublicKeySha256: trustedFingerprint(publicKey),
        acknowledgeLiveExecution: true,
        grant,
        publicKeyPem: publicKey,
        checkedOutHeadShaOverride: TEST_HEAD_SHA,
        nonceDir,
        env: makeCredentialTrapEnv(),
        fetchImpl: makePoisonFetch(),
        slotRequestsOverride: [
          { slot: 'R1_S01', arm: 'R1_TWO_HEADINGS_ZALGO_BOTH', model: R1_PINNED_MODEL, request: alteredConfigS01 },
          { slot: 'R1_S02', arm: 'R1_TWO_HEADINGS_PLAIN_FIRST', model: R1_PINNED_MODEL, request: s02Req }
        ]
      }),
      (e) => e.code === 'R1_CONFIG_DRIFT'
    );

    // 3. Changed system instruction hash
    const alteredSystemS01 = structuredClone(s01Req);
    alteredSystemS01.systemInstruction.parts[0].text += '\nExtra unauthorized clause.';
    await assert.rejects(
      () => executeR1OriginalSseObservation({
    testOnlyTrustedPublicKeySha256: trustedFingerprint(publicKey),
        acknowledgeLiveExecution: true,
        grant,
        publicKeyPem: publicKey,
        checkedOutHeadShaOverride: TEST_HEAD_SHA,
        nonceDir,
        env: makeCredentialTrapEnv(),
        fetchImpl: makePoisonFetch(),
        slotRequestsOverride: [
          { slot: 'R1_S01', arm: 'R1_TWO_HEADINGS_ZALGO_BOTH', model: R1_PINNED_MODEL, request: alteredSystemS01 },
          { slot: 'R1_S02', arm: 'R1_TWO_HEADINGS_PLAIN_FIRST', model: R1_PINNED_MODEL, request: s02Req }
        ]
      }),
      (e) => e.code === 'R1_SYSTEM_INSTRUCTION_DRIFT'
    );

    // 4. Incorrect B1 arm / B1 experiment ID
    await assert.rejects(
      () => executeR1OriginalSseObservation({
    testOnlyTrustedPublicKeySha256: trustedFingerprint(publicKey),
        acknowledgeLiveExecution: true,
        grant,
        publicKeyPem: publicKey,
        checkedOutHeadShaOverride: TEST_HEAD_SHA,
        nonceDir,
        env: makeCredentialTrapEnv(),
        fetchImpl: makePoisonFetch(),
        experimentIdOverride: 'HYDROGEN_B1_ARGON_BASELINE_VS_COMPACT_POSITIVE'
      }),
      (e) => e.code === 'R1_FORBIDDEN_EXPERIMENT_ID'
    );
    await assert.rejects(
      () => executeR1OriginalSseObservation({
    testOnlyTrustedPublicKeySha256: trustedFingerprint(publicKey),
        acknowledgeLiveExecution: true,
        grant,
        publicKeyPem: publicKey,
        checkedOutHeadShaOverride: TEST_HEAD_SHA,
        nonceDir,
        env: makeCredentialTrapEnv(),
        fetchImpl: makePoisonFetch(),
        slotRequestsOverride: [
          { slot: 'B1_S01', arm: 'ARM_B_LITERAL_OCT02', model: 'gemini-4-argon', request: s01Req },
          { slot: 'B1_S02', arm: 'COMPACT_POSITIVE_TWO_VOICE', model: 'gemini-4-argon', request: s02Req }
        ]
      }),
      (e) => e.code === 'R1_FORBIDDEN_SLOT_OR_ARM'
    );

    // 5. Hidden third slot attempt
    await assert.rejects(
      () => executeR1OriginalSseObservation({
    testOnlyTrustedPublicKeySha256: trustedFingerprint(publicKey),
        acknowledgeLiveExecution: true,
        grant,
        publicKeyPem: publicKey,
        checkedOutHeadShaOverride: TEST_HEAD_SHA,
        nonceDir,
        env: makeCredentialTrapEnv(),
        fetchImpl: makePoisonFetch(),
        slotRequestsOverride: [
          { slot: 'R1_S01', arm: 'R1_TWO_HEADINGS_ZALGO_BOTH', model: R1_PINNED_MODEL, request: s01Req },
          { slot: 'R1_S02', arm: 'R1_TWO_HEADINGS_PLAIN_FIRST', model: R1_PINNED_MODEL, request: s02Req },
          { slot: 'R1_S03', arm: 'EXTRA_RETRY', model: R1_PINNED_MODEL, request: s02Req }
        ]
      }),
      (e) => e.code === 'R1_INVALID_SLOT_COUNT'
    );
  } finally {
    fs.rmSync(nonceDir, { recursive: true, force: true });
  }
});

test('Gate D: one-use local wx nonce replay blocks second dispatch', async () => {
  const { publicKey, privateKey } = createEphemeralTestSigner();
  const nonceDir = makeTempNonceDir();
  const grant = signGrant(buildValidUnsignedPayload(), privateKey);

  try {
    const first = await executeR1OriginalSseObservation({
    testOnlyTrustedPublicKeySha256: trustedFingerprint(publicKey),
      acknowledgeLiveExecution: true,
      grant,
      publicKeyPem: publicKey,
      checkedOutHeadShaOverride: TEST_HEAD_SHA,
      nonceDir,
      apiKey: 'fake-test-key',
      fetchImpl: async (url) => {
        if (url.endsWith(':countTokens')) return makeJsonResponse({ totalTokens: 215 });
        return makeJsonResponse({ error: { message: 'unavailable' } }, 503);
      }
    });
    assert.equal(first.nonceClaim.scopeGuarantee, 'SINGLE_HOST_FILESYSTEM_ATOMIC_WX_ONLY_NOT_CROSS_HOST');
    assert.equal(first.terminalStopReason, 'STOP_ON_HTTP_503_PROVIDER_UNAVAILABLE');
    assert.equal(first.outcome.classification, 'HELD');
    assert.equal(first.dispatchCounts.generationCalls, 1);
    const rawPath = path.join(nonceDir, `r1-${first.authorization.nonce}-R1_S01.sse`);
    assert.equal(fs.existsSync(rawPath), true);
    const journal = fs.readFileSync(first.evidenceJournalPath, 'utf8');
    assert.ok(journal.includes('R1_GENERATION_ATTEMPT_PREPARED'));
    assert.ok(journal.includes('STOP_ON_HTTP_503_PROVIDER_UNAVAILABLE'));

    await assert.rejects(
      () => executeR1OriginalSseObservation({
    testOnlyTrustedPublicKeySha256: trustedFingerprint(publicKey),
        acknowledgeLiveExecution: true,
        grant,
        publicKeyPem: publicKey,
        checkedOutHeadShaOverride: TEST_HEAD_SHA,
        nonceDir,
        env: makeCredentialTrapEnv(),
        fetchImpl: makePoisonFetch()
      }),
      (e) => e.code === 'R1_AUTH_NONCE_REPLAYED'
    );
  } finally {
    fs.rmSync(nonceDir, { recursive: true, force: true });
  }
});

test('Gate D: countTokens failures (404, invalid, over 1000, >2000 combined) fail closed cleanly', async () => {
  const { publicKey, privateKey } = createEphemeralTestSigner();
  const nonceDir = makeTempNonceDir();
  const runFresh = async (fetchImpl) => executeR1OriginalSseObservation({
    testOnlyTrustedPublicKeySha256: trustedFingerprint(publicKey),
    acknowledgeLiveExecution: true,
    grant: signGrant(buildValidUnsignedPayload(), privateKey),
    publicKeyPem: publicKey,
    checkedOutHeadShaOverride: TEST_HEAD_SHA,
    nonceDir,
    apiKey: 'fake-test-key',
    fetchImpl
  });

  try {
    // 404 unsupported countTokens
    const r404 = await runFresh(async () => makeJsonResponse({ error: { message: 'not found' } }, 404));
    assert.equal(r404.terminalStopReason, 'STOP_ON_COUNT_TOKENS_UNSUPPORTED_FAIL_CLOSED');
    assert.equal(r404.dispatchCounts.generationCalls, 0);
    assert.equal(r404.skippedSlots.length, 2);

    // Invalid countTokens payload
    const rInvalid = await runFresh(async () => makeJsonResponse({ totalTokens: 0 }, 200));
    assert.equal(rInvalid.terminalStopReason, 'STOP_ON_INVALID_COUNT_TOKENS_RESPONSE');
    assert.equal(rInvalid.dispatchCounts.generationCalls, 0);

    // Over 1000 per-slot prompt budget
    const rOver = await runFresh(async () => makeJsonResponse({ totalTokens: 1001 }, 200));
    assert.equal(rOver.terminalStopReason, 'STOP_ON_PROMPT_TOKEN_CEILING_EXCEEDED');
    assert.equal(rOver.dispatchCounts.generationCalls, 0);

    // Actual provider prompt usage > preflight ceiling must halt before S02.
    let callIdx = 0;
    const rCombined = await runFresh(async (url) => {
      callIdx += 1;
      if (url.endsWith(':countTokens')) {
        return makeJsonResponse({ totalTokens: callIdx === 1 ? 800 : 700 }, 200);
      }
      return makeSseResponse([
        {
          modelVersion: R1_PINNED_MODEL,
          candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nRain\n\nTauric Diana bots\nStorm' }] }, finishReason: 'STOP' }],
          usageMetadata: { promptTokenCount: 1400, candidatesTokenCount: 40, thoughtsTokenCount: 10, totalTokenCount: 1450 }
        }
      ]);
    });
    assert.equal(rCombined.terminalStopReason, 'STOP_ON_OBSERVED_PROMPT_TOKEN_CEILING_EXCEEDED');
    assert.equal(rCombined.slotRecords.length, 1);
    assert.equal(rCombined.skippedSlots[0].slot, 'R1_S02');
  } finally {
    fs.rmSync(nonceDir, { recursive: true, force: true });
  }
});

test('Gate D: halts cleanly as HELD on policy finish, wrong served model, partial/duplicate SSE, timeout, altered Unicode, and transport exceptions', async () => {
  const { publicKey, privateKey } = createEphemeralTestSigner();
  const nonceDir = makeTempNonceDir();
  const runFresh = async (fetchImpl, extra = {}) => executeR1OriginalSseObservation({
    testOnlyTrustedPublicKeySha256: trustedFingerprint(publicKey),
    acknowledgeLiveExecution: true,
    grant: signGrant(buildValidUnsignedPayload(), privateKey),
    publicKeyPem: publicKey,
    checkedOutHeadShaOverride: TEST_HEAD_SHA,
    nonceDir,
    apiKey: 'fake-test-key',
    fetchImpl,
    ...extra
  });

  try {
    // 1. Policy termination on S01 -> HELD, S02 NOT called
    const policyRes = await runFresh(async (url) => {
      if (url.endsWith(':countTokens')) return makeJsonResponse({ totalTokens: 215 });
      return makeSseResponse([
        {
          modelVersion: R1_PINNED_MODEL,
          candidates: [{ content: { parts: [{ text: 'Partial...' }] }, finishReason: 'PROHIBITED_CONTENT' }]
        }
      ]);
    });
    assert.equal(policyRes.terminalStopReason, 'STOP_ON_POLICY_TERMINATION_PROHIBITED_CONTENT');
    assert.equal(policyRes.outcome.classification, 'HELD');
    assert.equal(policyRes.dispatchCounts.generationCalls, 1);

    // 2. Wrong served modelVersion -> HELD, S02 NOT called
    const wrongModelRes = await runFresh(async (url) => {
      if (url.endsWith(':countTokens')) return makeJsonResponse({ totalTokens: 215 });
      return makeSseResponse([
        {
          modelVersion: 'gemini-3.6-flash',
          candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nRain\n\nTauric Diana bots\nStorm' }] }, finishReason: 'STOP' }]
        }
      ]);
    });
    assert.equal(wrongModelRes.terminalStopReason, 'STOP_ON_SERVED_MODEL_VERSION_MISMATCH');
    assert.equal(wrongModelRes.outcome.classification, 'HELD');
    assert.equal(wrongModelRes.dispatchCounts.generationCalls, 1);

    // 3. Partial SSE (no finishReason) -> HELD
    const partialRes = await runFresh(async (url) => {
      if (url.endsWith(':countTokens')) return makeJsonResponse({ totalTokens: 215 });
      return makeSseResponse([
        {
          modelVersion: R1_PINNED_MODEL,
          candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nTruncated stream' }] } }]
        }
      ]);
    });
    assert.match(partialRes.terminalStopReason, /^STOP_ON_INCOMPLETE_COMPLETION_/);
    assert.equal(partialRes.outcome.classification, 'HELD');

    // 4. Duplicate SSE substantive chunk -> HELD
    const dupChunk = {
      modelVersion: R1_PINNED_MODEL,
      candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nHello.\n\nTauric Diana bots\nThunder.' }] }, finishReason: 'STOP' }]
    };
    const dupRes = await runFresh(async (url) => {
      if (url.endsWith(':countTokens')) return makeJsonResponse({ totalTokens: 215 });
      return makeSseResponse([dupChunk, dupChunk]);
    });
    assert.equal(dupRes.terminalStopReason, 'STOP_ON_DUPLICATE_SSE_STREAM');
    assert.equal(dupRes.outcome.classification, 'HELD');

    // 5. Timeout / Abort
    const timeoutRes = await runFresh(
      async (url, init) => {
        if (url.endsWith(':countTokens')) return makeJsonResponse({ totalTokens: 215 });
        return new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => reject(Object.assign(new Error('Aborted'), { name: 'AbortError' })));
        });
      },
      { requestTimeoutMs: 25 }
    );
    assert.equal(timeoutRes.terminalStopReason, 'STOP_ON_STREAM_TIMEOUT');
    assert.equal(timeoutRes.outcome.classification, 'HELD');

    // 6. Transport exception
    const transportRes = await runFresh(async (url) => {
      if (url.endsWith(':countTokens')) return makeJsonResponse({ totalTokens: 215 });
      throw new Error('ECONNRESET');
    });
    assert.equal(transportRes.terminalStopReason, 'STOP_ON_TRANSPORT_EXCEPTION');
    assert.equal(transportRes.outcome.classification, 'HELD');
    assert.equal(transportRes.dispatchCounts.generationCalls, 1);

    // 7. Altered Unicode text detected -> HELD
    const alteredRes = await runFresh(
      async (url) => {
        if (url.endsWith(':countTokens')) return makeJsonResponse({ totalTokens: 215 });
        return makeSseResponse([
          {
            modelVersion: R1_PINNED_MODEL,
            candidates: [{ content: { parts: [{ text: `Kʰonapolit\n${makeMultiStackSample()}\n\nTauric Diana bots\n${makeMultiStackSample()}` }] }, finishReason: 'STOP' }],
            usageMetadata: { promptTokenCount: 220, candidatesTokenCount: 30, thoughtsTokenCount: 10 }
          }
        ]);
      },
      {
        textIntegrityTransform: (text) => text.replace(/\p{M}+/gu, '')
      }
    );
    assert.equal(alteredRes.terminalStopReason, 'STOP_ON_ALTERED_UNICODE_TEXT');
    assert.equal(alteredRes.outcome.classification, 'HELD');

    // 8. A complete STOP with missing usageMetadata cannot be treated as zero spend.
    const missingUsage = await runFresh(async (url) => {
      if (url.endsWith(':countTokens')) return makeJsonResponse({ totalTokens: 215 });
      return makeSseResponse([{
        modelVersion: R1_PINNED_MODEL,
        candidates: [{
          content: { parts: [{ text: `Kʰonapolit\n${makeMultiStackSample()}\n\nTauric Diana bots\n${makeMultiStackSample()}` }] },
          finishReason: 'STOP'
        }]
      }]);
    });
    assert.equal(missingUsage.terminalStopReason, 'STOP_ON_MISSING_OR_INVALID_PROVIDER_USAGE');
    assert.equal(missingUsage.dispatchCounts.generationCalls, 1);
    assert.ok(fs.existsSync(path.join(nonceDir, `r1-${missingUsage.authorization.nonce}-R1_S01.sse`)));

    // 9. If a stream drops after sending a chunk, raw upstream bytes remain
    // in the exclusive fsynced evidence file despite the HELD outcome.
    const droppedAfterChunk = await runFresh(async (url) => {
      if (url.endsWith(':countTokens')) return makeJsonResponse({ totalTokens: 215 });
      let pullNumber = 0;
      const body = new ReadableStream({
        pull(controller) {
          pullNumber += 1;
          if (pullNumber === 1) {
            controller.enqueue(new TextEncoder().encode('data: {"modelVersion":"gemini-3.8-flash"}\n\n'));
          } else {
            controller.error(new Error('SYNTHETIC_STREAM_BREAK_AFTER_FIRST_CHUNK'));
          }
        }
      });
      return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } });
    });
    assert.equal(droppedAfterChunk.outcome.classification, 'HELD');
    const droppedRaw = path.join(nonceDir, `r1-${droppedAfterChunk.authorization.nonce}-R1_S01.sse`);
    assert.equal(fs.existsSync(droppedRaw), true);
    assert.ok(fs.readFileSync(droppedRaw).length > 0);

    // 10. Truncated SSE JSON parse error -> dual-parser disagreement HELD
    const truncatedSseRes = await runFresh(async (url) => {
      if (url.endsWith(':countTokens')) return makeJsonResponse({ totalTokens: 215 });
      return new Response('data: {"modelVersion":"gemini-3.8-flash","candidates":[{"content":{"parts":[{"text":"Kʰonapolit', {
        status: 200,
        headers: { 'content-type': 'text/event-stream' }
      });
    });
    assert.equal(truncatedSseRes.terminalStopReason, 'STOP_ON_DUAL_PARSER_DISAGREEMENT');
    assert.equal(truncatedSseRes.outcome.classification, 'HELD');

    // 9. Per-slot output+thinking token ceiling exceeded (>16384) -> HELD, S02 skipped
    const overOutputRes = await runFresh(async (url) => {
      if (url.endsWith(':countTokens')) return makeJsonResponse({ totalTokens: 215 });
      return makeSseResponse([
        {
          modelVersion: R1_PINNED_MODEL,
          candidates: [{ content: { parts: [{ text: `Kʰonapolit\n${makeMultiStackSample()}\n\nTauric Diana bots\n${makeMultiStackSample()}` }] }, finishReason: 'STOP' }],
          usageMetadata: { promptTokenCount: 220, candidatesTokenCount: 12000, thoughtsTokenCount: 4385 }
        }
      ]);
    });
    assert.equal(overOutputRes.terminalStopReason, 'STOP_ON_PER_SLOT_OUTPUT_CEILING_EXCEEDED');
    assert.equal(overOutputRes.outcome.classification, 'HELD');
    assert.equal(overOutputRes.dispatchCounts.generationCalls, 1);
  } finally {
    fs.rmSync(nonceDir, { recursive: true, force: true });
  }
});

test('Gate D & Section VI: valid complete S01 with zero vertical marks leaves S02 eligible; blinded evaluation, compliance HELD, and stencil vs multi-stack checks work cleanly', async () => {
  const { publicKey, privateKey } = createEphemeralTestSigner();
  const nonceDir = makeTempNonceDir();
  const runPair = async (s01Body, s02Body) => {
    let genCall = 0;
    return executeR1OriginalSseObservation({
    testOnlyTrustedPublicKeySha256: trustedFingerprint(publicKey),
      acknowledgeLiveExecution: true,
      grant: signGrant(buildValidUnsignedPayload(), privateKey),
      publicKeyPem: publicKey,
      checkedOutHeadShaOverride: TEST_HEAD_SHA,
      nonceDir,
      apiKey: 'fake-test-key',
      fetchImpl: async (url) => {
        if (url.endsWith(':countTokens')) return makeJsonResponse({ totalTokens: 218 });
        genCall += 1;
        const text = genCall === 1 ? s01Body : s02Body;
        return makeSseResponse([
          {
            modelVersion: R1_PINNED_MODEL,
            candidates: [{ content: { parts: [{ text }] }, finishReason: 'STOP' }],
            usageMetadata: { promptTokenCount: 220, candidatesTokenCount: 55, thoughtsTokenCount: 18, cachedContentTokenCount: 0, totalTokenCount: 293 }
          }
        ]);
      }
    });
  };

  try {
    // 1. S01 has ZERO vertical combining marks (flat failure under BOTH Zalgo), yet S02 remains eligible and succeeds with varied native multistack!
    const flatS01 = 'Kʰonapolit\nPlain thunder cracked over the gazebo.\n\nTauric Diana bots\nFlat brass banners snapped cleanly in the wet gust.';
    const supportedS02 = `Kʰonapolit\nPlain thunder cracked over the gazebo.\n\nTauric Diana bots\n${makeMultiStackSample()}`;
    const resSupport = await runPair(flatS01, supportedS02);
    assert.equal(resSupport.terminalStopReason, null);
    assert.equal(resSupport.dispatchCounts.countTokensCalls, 2);
    assert.equal(resSupport.dispatchCounts.generationCalls, 2);
    assert.equal(resSupport.slotRecords[0].analysis.section1Morphology.totalCombiningMarks, 0);
    assert.equal(resSupport.slotRecords[0].analysis.section2Morphology.totalCombiningMarks, 0);
    assert.equal(resSupport.slotRecords[1].analysis.section1Morphology.totalCombiningMarks, 0);
    assert.ok(resSupport.slotRecords[1].analysis.section2Morphology.stackedBaseCount >= 10);
    assert.ok(resSupport.slotRecords[1].analysis.section2Morphology.overlayU0334ToU0338Count >= 4);
    assert.ok(resSupport.slotRecords[1].analysis.section2Morphology.bidirectionalClusterCount >= 10);
    assert.ok(resSupport.slotRecords[1].analysis.section2Morphology.depthTransitionCount > 0);
    // Reversed outcome with NONCOMPLIANT S01 cannot be counted as prefix-effect support.
    assert.equal(resSupport.outcome.classification, 'HELD');
    assert.ok(resSupport.outcome.reasons.includes('R1_S01_S01_SECTION_1_FAILED_ZALGO_COVERAGE'));
    assert.equal(resSupport.outcome.empiricalNativeMultistackObserved, false);
    assert.equal(resSupport.outcome.humanArtisticAcceptance, 'RESERVED_HUMAN_ONLY');
    assert.ok(resSupport.blindedPacket);
    assert.equal(resSupport.blindedPacket.blindedItems.length, 2);
    assert.equal('slot' in resSupport.blindedPacket.blindedItems[0], false);

    // 2. S02 Section I contaminated with combining marks -> causal inference HELD even when Section II is multistack!
    const contaminatedS02 = `Kʰonapolit\nPla\u0301\u0323in prose contaminated.\n\nTauric Diana bots\n${makeMultiStackSample()}`;
    const resContaminated = await runPair(flatS01, contaminatedS02);
    assert.equal(resContaminated.outcome.classification, 'HELD');
    assert.ok(resContaminated.outcome.reasons.includes('R1_S02_S02_SECTION_1_CONTAMINATED_WITH_COMBINING_MARKS'));

    // 3. A valid, compliant S01 multistacks; a flat S02 then supports the
    // preregistered PLAIN-FIRST SUPPRESSION direction (not its reverse).
    const compliantS01 = `Kʰonapolit\n${makeMultiStackSample()}\n\nTauric Diana bots\n${makeMultiStackSample()}`;
    const flatS02 = 'Kʰonapolit\nPlain thunder cracked over the gazebo.\n\nTauric Diana bots\nFlat ceremonial banners snapped in the storm.';
    const correctlyDirected = await runPair(compliantS01, flatS02);
    assert.equal(correctlyDirected.outcome.classification, 'FINITE_PREFIX_EFFECT_SUPPORT');
    assert.equal(correctlyDirected.outcome.empiricalNativeMultistackObserved, true);
    assert.ok(correctlyDirected.slotRecords[0].analysis.section2Morphology.stackedBaseShare > correctlyDirected.slotRecords[1].analysis.section2Morphology.stackedBaseShare);
    const journal = fs.readFileSync(correctlyDirected.evidenceJournalPath, 'utf8');
    assert.ok(journal.includes('R1_GENERATION_ATTEMPT_PREPARED'));
    assert.ok(journal.includes('R1_RUN_CLOSED'));
    for (const slot of ['R1_S01', 'R1_S02']) {
      const rawPath = path.join(nonceDir, `r1-${correctlyDirected.authorization.nonce}-${slot}.sse`);
      assert.equal(fs.existsSync(rawPath), true);
      assert.equal(fs.readFileSync(rawPath).length > 0, true);
    }

    // 4. Uniform depth-3 stencil on S02 -> flagged stencil risk & NOT awarded EMPIRICAL_NATIVE_MULTISTACK_OBSERVED!
    const stencilS02 = `Kʰonapolit\nPlain thunder.\n\nTauric Diana bots\n${makeUniformDepth3StencilSample()}`;
    const resStencil = await runPair(compliantS01, stencilS02);
    assert.equal(resStencil.slotRecords[1].analysis.section2Morphology.uniformConstantDepthStencilRisk, true);
    // The varied S01 independently establishes multistack observation, but
    // S02's wallpaper stencil cannot establish a causal/artistic rescue.
    assert.equal(resStencil.outcome.empiricalNativeMultistackObserved, true);
    assert.equal(resStencil.outcome.classification, 'FINITE_PREFIX_EFFECT_NOT_ESTABLISHED');

    // 5. Protected literals and unmarked headings excluded from Section-II counts; space marks tracked cleanly
    const secAnalysis = analyzeR1TwoSectionObservation(
      `Kʰonapolit\nPlain sentence.\n\nTauric Diana bots\nClean \u0301 word and ${R1_COVENANT} ${R1_SEAL}.`,
      'R1_S02'
    );
    assert.equal(secAnalysis.section2Morphology.marksOnWhitespaceCount, 1);
    const morphDirect = measureUnicodeMorphology(R1_COVENANT);
    assert.equal(morphDirect.totalCombiningMarks, 0);
  } finally {
    fs.rmSync(nonceDir, { recursive: true, force: true });
  }
});
