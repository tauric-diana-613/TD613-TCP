import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  HISTORICAL_BOUNDED_R1_PROVENANCE,
  R1_NATIVE_COVENANT,
  R1_NATIVE_PINNED_MODEL,
  R1_NATIVE_SEAL,
  R1_NATIVE_THINKING_LEVEL,
  R1_PROVIDER_NATIVE_EXPERIMENT_ID,
  buildProviderNativeR1Requests,
  buildProviderNativeWireManifest
} from '../research/marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-preflight.mjs';
import {
  FROZEN_PROVIDER_NATIVE_CONDITIONS,
  R1_NATIVE_GRANT_SCHEMA,
  buildProviderNativeConditionPlans,
  canonicalizeProviderNativeAuthorizationPayload,
  executeProviderNativeCore
} from '../research/marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-core.mjs';
import {
  R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256,
  buildPublicBlindedArtifact,
  executeProviderNativeR1Observation,
  resolveCheckedOutGitHeadSha
} from '../research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs';
import { serializeGeminiRequest } from '../server/khonapolit-quality.js';

const EXECUTABLE_PATH = path.resolve('research/marrowline-r1-no-artificial-ceilings-20261122/run-r1-provider-native-observation.mjs');
const CORE_PATH = path.resolve('research/marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-core.mjs');
const MANIFEST_JSON_PATH = path.resolve('research/marrowline-r1-no-artificial-ceilings-20261122/R1_PROVIDER_NATIVE_WIRE_MANIFEST.json');
const TEST_HEAD_SHA = '11223344556677889900aabbccddeeff00112233';

function createEphemeralTestSigner() {
  return crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
}

function spkiFingerprint(pem) {
  return crypto.createHash('sha256')
    .update(crypto.createPublicKey(pem).export({ type: 'spki', format: 'der' }))
    .digest('hex');
}

function buildValidNativePayload(overrides = {}) {
  const plan = buildProviderNativeConditionPlans();
  const cA = plan.conditions.R1_NATIVE_A;
  const cB = plan.conditions.R1_NATIVE_B;
  return {
    schema: R1_NATIVE_GRANT_SCHEMA,
    experimentId: R1_PROVIDER_NATIVE_EXPERIMENT_ID,
    pinnedModel: R1_NATIVE_PINNED_MODEL,
    thinkingLevel: R1_NATIVE_THINKING_LEVEL,
    sessionMode: 'OPERATOR_CONTROLLED_UNBOUNDED_PAIRED_OBSERVATION',
    permittedPurpose: 'Provider-native unrestricted A/B morphology observation without artificial resource limits',
    sessionId: `session_${crypto.randomBytes(8).toString('hex')}`,
    checkedOutHeadSha: TEST_HEAD_SHA,
    generationConfigSha256: cA.observation.generationConfigSha256,
    generationConfig: cA.request.generationConfig,
    conditions: {
      R1_NATIVE_A: {
        arm: cA.arm,
        bodySha256: cA.observation.bodySha256,
        modelAndBodySha256: cA.observation.modelAndBodySha256,
        countTokensRequestSha256: cA.countTokensRequestSha256
      },
      R1_NATIVE_B: {
        arm: cB.arm,
        bodySha256: cB.observation.bodySha256,
        modelAndBodySha256: cB.observation.modelAndBodySha256,
        countTokensRequestSha256: cB.countTokensRequestSha256
      }
    },
    issuedAt: new Date(Date.now() - 5000).toISOString(),
    nonce: `nativenonce_${crypto.randomBytes(12).toString('hex')}`,
    authorizedBy: 'operator-human-test',
    covenant: R1_NATIVE_COVENANT,
    seal: R1_NATIVE_SEAL,
    ...overrides
  };
}

function signGrant(payload, privateKeyPem) {
  const bytes = Buffer.from(canonicalizeProviderNativeAuthorizationPayload(payload), 'utf8');
  return {
    algorithm: 'ed25519',
    payload,
    signatureBase64: crypto.sign(null, bytes, privateKeyPem).toString('base64')
  };
}

function makeTempEvidenceDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'td613-r1-native-test-'));
}

function makeCredentialTrapEnv() {
  return new Proxy({}, {
    get(_t, prop) {
      if (prop === 'GEMINI_API_KEY') throw new Error('CREDENTIAL_ACCESSED_PREMATURELY');
      return undefined;
    }
  });
}

function makeJsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

function makeSseResponse(events, { trailingNewline = '\n\n', status = 200 } = {}) {
  const body = events.map((ev) => `data: ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`).join('\n\n') + trailingNewline;
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/event-stream; charset=utf-8' }
  });
}

function makeVariableMultistackPhrase() {
  return [
    'T\u0301\u0323\u0335h\u0302\u0327e',
    'b\u0304\u0325\u0336\u0308u\u030C\u0329r\u0300\u0316e',
    'a\u0303\u0317\u0337u\u030A\u0323c',
    'r\u0301\u0329a\u0302\u0325c\u0338y',
    'b\u0308\u0323a\u0304\u0316n\u030C\u0329\u0301\u0334n\u0300\u0327e\u0302\u0323r',
    's\u0301\u0325h\u0304\u0329o\u030A\u0317\u0335o\u0308\u0323k.'
  ].join(' ');
}

test('Preflight & Wire Manifest: no hidden maxOutputTokens, byte-identical manifest JSON, distinct from bounded historical digests', () => {
  const rawRequests = buildProviderNativeR1Requests();
  for (const key of ['R1_NATIVE_A', 'R1_NATIVE_B']) {
    const req = rawRequests[key];
    assert.equal(Object.hasOwn(req.generationConfig, 'maxOutputTokens'), false);
    assert.equal(Object.hasOwn(req.generationConfig, 'temperature'), false);
    assert.deepEqual(req.generationConfig, { thinkingConfig: { thinkingLevel: 'medium' } });
    const serialized = serializeGeminiRequest(req, R1_NATIVE_PINNED_MODEL);
    assert.equal(serialized.body.includes('maxOutputTokens'), false);
    assert.equal(serialized.observation.bodySha256, FROZEN_PROVIDER_NATIVE_CONDITIONS[key].bodySha256);
    assert.notEqual(serialized.observation.bodySha256, HISTORICAL_BOUNDED_R1_PROVENANCE.slots[key === 'R1_NATIVE_A' ? 'R1_S01' : 'R1_S02'].bodySha256);
  }

  const rawManifestBytes = fs.readFileSync(MANIFEST_JSON_PATH);
  assert.equal(rawManifestBytes[0] === 0xef && rawManifestBytes[1] === 0xbb && rawManifestBytes[2] === 0xbf, false, 'UTF-8 BOM forbidden');
  const textManifest = rawManifestBytes.toString('utf8');
  assert.equal(textManifest.includes('\r\n'), false, 'CRLF forbidden');
  assert.equal(textManifest, `${JSON.stringify(buildProviderNativeWireManifest(), null, 2)}\n`);
});

test('Architectural Security Proof: production executable has ZERO test trust overrides, ZERO NODE_TEST_CONTEXT branches, and rejects override injection', async () => {
  const rawExecSource = fs.readFileSync(EXECUTABLE_PATH, 'utf8');
  const execCodeNoComments = rawExecSource.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const rawCoreSource = fs.readFileSync(CORE_PATH, 'utf8');
  const coreCodeNoComments = rawCoreSource.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  assert.equal(R1_NATIVE_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256, null);
  assert.equal(execCodeNoComments.includes('NODE_TEST_CONTEXT'), false);
  assert.equal(execCodeNoComments.includes('testOnly'), false);
  assert.equal(execCodeNoComments.includes('checkedOutHeadShaOverride'), false);
  assert.equal(execCodeNoComments.includes('fetchImpl'), false);
  assert.equal(coreCodeNoComments.includes('globalThis.fetch'), false);
  assert.equal(coreCodeNoComments.includes('child_process'), false);

  const { publicKey, privateKey } = createEphemeralTestSigner();
  const realHead = resolveCheckedOutGitHeadSha(process.cwd());
  const grant = signGrant(buildValidNativePayload({ checkedOutHeadSha: realHead }), privateKey);
  const evidenceDir = makeTempEvidenceDir();
  const tmpDir = makeTempEvidenceDir();
  const grantFile = path.join(tmpDir, 'grant.json');
  const pubFile = path.join(tmpDir, 'pub.pem');
  const outFile = path.join(tmpDir, 'out.json');
  fs.writeFileSync(grantFile, `${JSON.stringify(grant, null, 2)}\n`, 'utf8');
  fs.writeFileSync(pubFile, publicKey, 'utf8');

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('NETWORK_FORBIDDEN_IN_TEST'); };
  try {
    // Default offline CLI runs with zero network or credentials
    const offlineJson = JSON.parse(execFileSync(process.execPath, [EXECUTABLE_PATH], { encoding: 'utf8' }));
    assert.equal(offlineJson.status, 'SOURCE_ONLY_QUALIFIED');
    assert.equal(offlineJson.paidProviderCallsExecuted, 0);
    assert.equal(offlineJson.trustAnchorProvisioned, false);
    assert.equal(offlineJson.resourceCeilingsImposedByTD613, 'NONE');

    // Programmatic attempt to pass test overrides to executable entrypoint fails closed immediately
    for (const badOpt of [
      { testOnlyTrustedPublicKeySha256: spkiFingerprint(publicKey) },
      { trustedPublicKeySha256: spkiFingerprint(publicKey) },
      { transportFetch: async () => new Response('') },
      { fetchImpl: async () => new Response('') },
      { checkedOutHeadShaOverride: realHead }
    ]) {
      await assert.rejects(
        () => executeProviderNativeR1Observation({
          acknowledgeLiveExecution: true,
          grant,
          publicKeyPem: publicKey,
          evidenceDir,
          ...badOpt
        }),
        (e) => e.code === 'R1_UNBOUNDED_FORBIDDEN_EXECUTABLE_OVERRIDE'
      );
    }

    // Even valid un-overridden call to executable fails closed on unprovisioned trust anchor
    await assert.rejects(
      () => executeProviderNativeR1Observation({
        acknowledgeLiveExecution: true,
        grant,
        publicKeyPem: publicKey,
        evidenceDir
      }),
      (e) => e.code === 'R1_AUTH_TRUST_ANCHOR_NOT_PROVISIONED'
    );

    // Live CLI inside NODE_TEST_CONTEXT still fails closed on unprovisioned trust anchor and leaves zero 0-byte orphan files
    let stderr = '';
    let exit = 0;
    try {
      execFileSync(process.execPath, [
        EXECUTABLE_PATH,
        '--execute',
        '--ack-live-r1-observation',
        '--grant-file', grantFile,
        '--public-key-file', pubFile,
        '--evidence-dir', evidenceDir,
        '--out', outFile
      ], {
        encoding: 'utf8',
        env: { ...process.env, GEMINI_API_KEY: 'must-never-be-read' },
        stdio: ['ignore', 'pipe', 'pipe']
      });
    } catch (err) {
      exit = err.status;
      stderr = String(err.stderr || '');
    }
    assert.equal(exit, 1);
    assert.match(stderr, /R1_AUTH_TRUST_ANCHOR_NOT_PROVISIONED/);
    assert.equal(fs.existsSync(outFile), false);
    assert.equal(fs.existsSync(`${outFile}.blinded.json`), false);
    assert.deepEqual(fs.readdirSync(evidenceDir), []);
  } finally {
    globalThis.fetch = originalFetch;
    fs.rmSync(evidenceDir, { recursive: true, force: true });
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Authority Negative Controls: rejects old capped grants, forbidden cap fields, Argon grants, untrusted keys, U+200C strip, revocation, and nonce replay', async () => {
  const { publicKey, privateKey } = createEphemeralTestSigner();
  const { publicKey: wrongPublicKey } = createEphemeralTestSigner();
  const fp = spkiFingerprint(publicKey);
  const evidenceDir = makeTempEvidenceDir();
  const revFile = path.join(evidenceDir, 'revoked.json');

  const runCore = (opts = {}) => executeProviderNativeCore({
    acknowledgeLiveExecution: true,
    pinnedTrustFingerprintSha256: fp,
    checkedOutHeadSha: TEST_HEAD_SHA,
    evidenceDir,
    env: makeCredentialTrapEnv(),
    transportFetch: async () => { throw new Error('NETWORK_FORBIDDEN'); },
    ...opts
  });

  try {
    // 1. Old capped R1 grant schema rejected
    await assert.rejects(
      () => runCore({
        grant: signGrant(buildValidNativePayload({ schema: 'td613.marrowline.r1-live-observation-authorization/v1-ed25519' }), privateKey),
        publicKeyPem: publicKey
      }),
      (e) => e.code === 'R1_AUTH_OLD_CAPPED_GRANT_REJECTED'
    );

    // 2. Old Argon grant rejected
    await assert.rejects(
      () => runCore({
        grant: signGrant(buildValidNativePayload({ schema: 'td613.marrowline.argon-live-experiment-authorization/v2-ed25519' }), privateKey),
        publicKeyPem: publicKey
      }),
      (e) => e.code === 'R1_AUTH_ARGON_GRANT_FORBIDDEN'
    );

    // 3. Grant with any artificial ceiling field rejected
    for (const capField of ['maxCalls', 'perSlotMaxOutputTokens', 'maxUsdCeiling', 'requestTimeoutMs', 'maxRawSseCaptureBytes']) {
      await assert.rejects(
        () => runCore({
          grant: signGrant(buildValidNativePayload({ [capField]: 1 }), privateKey),
          publicKeyPem: publicKey
        }),
        (e) => e.code === 'R1_AUTH_FORBIDDEN_ARTIFICIAL_CEILING_IN_GRANT'
      );
    }

    // 4. Old bounded wire digest rejected
    const badConds = structuredClone(buildValidNativePayload().conditions);
    badConds.R1_NATIVE_A.bodySha256 = HISTORICAL_BOUNDED_R1_PROVENANCE.slots.R1_S01.bodySha256;
    await assert.rejects(
      () => runCore({ grant: signGrant(buildValidNativePayload({ conditions: badConds }), privateKey), publicKeyPem: publicKey }),
      (e) => e.code === 'R1_AUTH_DIGEST_MISMATCH'
    );

    // 5. Public-key substitution / untrusted key rejected
    await assert.rejects(
      () => runCore({ grant: signGrant(buildValidNativePayload(), privateKey), publicKeyPem: wrongPublicKey }),
      (e) => e.code === 'R1_AUTH_UNTRUSTED_PUBLIC_KEY'
    );

    // 6. Covenant missing U+200C rejected
    await assert.rejects(
      () => runCore({ grant: signGrant(buildValidNativePayload({ covenant: 'Khonalit-po' }), privateKey), publicKeyPem: publicKey }),
      (e) => e.code === 'R1_AUTH_COVENANT_OR_SEAL_MISMATCH'
    );

    // 7. Revoked session rejected before credentials or network
    const revPayload = buildValidNativePayload();
    fs.writeFileSync(revFile, JSON.stringify({ revokedSessionIds: [revPayload.sessionId] }), 'utf8');
    await assert.rejects(
      () => runCore({ grant: signGrant(revPayload, privateKey), publicKeyPem: publicKey, revocationFilePath: revFile }),
      (e) => e.code === 'R1_AUTH_SESSION_REVOKED'
    );

    // 8. Nonce replay on same host blocked
    const replayGrant = signGrant(buildValidNativePayload(), privateKey);
    const first = await executeProviderNativeCore({
      acknowledgeLiveExecution: true,
      grant: replayGrant,
      publicKeyPem: publicKey,
      pinnedTrustFingerprintSha256: fp,
      checkedOutHeadSha: TEST_HEAD_SHA,
      evidenceDir,
      apiKey: 'fake-key',
      transportFetch: async () => makeJsonResponse({ error: { message: 'missing' } }, 404)
    });
    assert.equal(first.nonceClaim.scopeGuarantee, 'SINGLE_HOST_FILESYSTEM_ATOMIC_WX_ONLY_NOT_CROSS_HOST');
    assert.equal(first.integritySessionHaltReason, 'STOP_ON_MODEL_METADATA_UNAVAILABLE');
    await assert.rejects(
      () => runCore({ grant: replayGrant, publicKeyPem: publicKey }),
      (e) => e.code === 'R1_AUTH_NONCE_REPLAYED'
    );
  } finally {
    fs.rmSync(evidenceDir, { recursive: true, force: true });
  }
});

test('Unbounded SSE Streaming Custody: handles >4.5 MiB raw SSE streams, >32,768 reported tokens, and disk-SHA / Unicode verification without memory cap', async () => {
  const { publicKey, privateKey } = createEphemeralTestSigner();
  const fp = spkiFingerprint(publicKey);
  const evidenceDir = makeTempEvidenceDir();

  // Build > 4.5 MiB synthetic raw SSE stream (~260 chunks x ~20 KiB ≈ 5.2 MiB each) incrementally via ReadableStream
  const linePayload = `${makeVariableMultistackPhrase()} Stormwinds rattled the tall portico.\n`;
  const repeatedMultistackBlock = Array.from({ length: 80 }, () => linePayload).join('');
  const repeatedFlatBlock = Array.from({ length: 240 }, () => 'Flat undecorated storm prose echoed along the hall.\n').join('');
  const targetEventCount = 400;
  function makeLargeSseResponse({ section1Zalgo, count }) {
    let idx = -1;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      pull(controller) {
        idx += 1;
        if (idx === 0) {
          const sec1 = section1Zalgo ? makeVariableMultistackPhrase() : 'Plain undecorated thunderstorm narrative.';
          const intro = `Kʰonapolit\n${sec1}\n\nTauric Diana bots\n`;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ modelVersion: R1_NATIVE_PINNED_MODEL, candidates: [{ content: { parts: [{ text: intro }] } }] })}\n\n`));
          return;
        }
        if (idx <= count) {
          const text = section1Zalgo
            ? `${repeatedMultistackBlock}Sequence-${idx}\n`
            : `${repeatedFlatBlock}Sequence-${idx}\n`;
          const chunk = `data: ${JSON.stringify({
            modelVersion: R1_NATIVE_PINNED_MODEL,
            candidates: [{ content: { parts: [{ text }] } }]
          })}\n\n`;
          controller.enqueue(encoder.encode(chunk));
          return;
        }
        if (idx === count + 1) {
          // Huge provider-native token counts well beyond legacy 1k/16k/32k caps!
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            modelVersion: R1_NATIVE_PINNED_MODEL,
            candidates: [{ content: { parts: [{ text: 'End.' }] }, finishReason: 'STOP' }],
            usageMetadata: {
              promptTokenCount: 2500,
              candidatesTokenCount: 45000,
              thoughtsTokenCount: 25000,
              cachedContentTokenCount: 0,
              totalTokenCount: 72500
            }
          })}\n\n`));
          controller.close();
        }
      }
    });
    return new Response(stream, { status: 200, headers: { 'content-type': 'text/event-stream; charset=utf-8' } });
  }

  let genNum = 0;
  try {
    const result = await executeProviderNativeCore({
      acknowledgeLiveExecution: true,
      grant: signGrant(buildValidNativePayload(), privateKey),
      publicKeyPem: publicKey,
      pinnedTrustFingerprintSha256: fp,
      checkedOutHeadSha: TEST_HEAD_SHA,
      evidenceDir,
      apiKey: 'fake-test-key',
      transportFetch: async (url) => {
        if (url.includes(':countTokens')) return makeJsonResponse({ totalTokens: 2498 });
        if (url.endsWith(`/models/${R1_NATIVE_PINNED_MODEL}`)) {
          return makeJsonResponse({ name: `models/${R1_NATIVE_PINNED_MODEL}`, outputTokenLimit: 65536, supportedGenerationMethods: ['generateContent', 'countTokens'] });
        }
        genNum += 1;
        return makeLargeSseResponse({ section1Zalgo: genNum === 1, count: targetEventCount });
      }
    });

    assert.equal(result.integritySessionHaltReason, null);
    assert.equal(result.dispatchCounts.generationCalls, 2);
    assert.equal(result.metadataDiscovery.outputTokenLimitReportedByProvider, 65536);

    const recA = result.attemptRecords[0];
    assert.ok(recA.wire.rawSseBytes > 4 * 1024 * 1024, `expected >4 MiB raw SSE, got ${recA.wire.rawSseBytes}`);
    assert.equal(recA.wire.rawDiskVerified, true);
    assert.equal(recA.wire.authoredDiskVerified, true);
    assert.equal(recA.wire.parserAgreement, true);
    assert.equal(recA.wire.usageMetadata.totalTokenCount, 72500);
    assert.equal(recA.countTokensMeasurement.totalTokens, 2498);

    // Direct disk SHA verification on both >4 MiB raw SSE and Section-II blinded sidecar file
    const diskSseSha = crypto.createHash('sha256').update(fs.readFileSync(recA.rawSseFilePath)).digest('hex');
    assert.equal(diskSseSha, recA.wire.rawSseSha256);
    const sec2ShaDisk = crypto.createHash('sha256').update(fs.readFileSync(recA.analysis.section2OutFilePath)).digest('hex');
    assert.equal(sec2ShaDisk, recA.analysis.section2Morphology.sha256);

    // Condition A multistack share strictly > Condition B flat Section II -> finite support
    assert.equal(result.episodeSummaries[0].outcome.classification, 'FINITE_PREFIX_EFFECT_SUPPORT');
    assert.equal(result.episodeSummaries[0].outcome.empiricalNativeMultistackObserved, true);
    assert.equal(result.episodeSummaries[0].outcome.humanArtisticAcceptance, 'RESERVED_HUMAN_ONLY');

    // Blinded output excludes unblinding map
    const publicBlind = buildPublicBlindedArtifact(result);
    assert.equal(JSON.stringify(publicBlind).includes('sealedUnblindingMap'), false);
    assert.equal(JSON.stringify(publicBlind).includes('R1_NATIVE_A'), false);
  } finally {
    fs.rmSync(evidenceDir, { recursive: true, force: true });
  }
});

test('Unbounded Paired Episodes & Integrity Controls: allows >2 repeated pairs, retains failed attempts, persists partial SSE, detects altered text & missing usage', async () => {
  const { publicKey, privateKey } = createEphemeralTestSigner();
  const fp = spkiFingerprint(publicKey);
  const evidenceDir = makeTempEvidenceDir();

  const compliantZalgo = `Kʰonapolit\n${makeVariableMultistackPhrase()}\n\nTauric Diana bots\n${makeVariableMultistackPhrase()}`;
  const flatPlainFirst = 'Kʰonapolit\nPlain thunder.\n\nTauric Diana bots\nFlat rain.';
  let callNum = 0;

  try {
    // 1. Run 3 paired episodes (6 generation attempts, alternating A_THEN_B, B_THEN_A, A_THEN_B),
    // with attempt #2 returning HTTP 503 and attempt #5 suffering mid-stream break after first chunk!
    const multi = await executeProviderNativeCore({
      acknowledgeLiveExecution: true,
      grant: signGrant(buildValidNativePayload(), privateKey),
      publicKeyPem: publicKey,
      pinnedTrustFingerprintSha256: fp,
      checkedOutHeadSha: TEST_HEAD_SHA,
      evidenceDir,
      apiKey: 'fake-key',
      episodes: [
        { episodeId: 1, order: 'A_THEN_B' },
        { episodeId: 2, order: 'B_THEN_A' },
        { episodeId: 3, order: 'A_THEN_B' }
      ],
      transportFetch: async (url) => {
        if (url.includes(':countTokens')) return makeJsonResponse({ totalTokens: 210 });
        if (url.endsWith(`/models/${R1_NATIVE_PINNED_MODEL}`)) {
          return makeJsonResponse({ name: `models/${R1_NATIVE_PINNED_MODEL}`, supportedGenerationMethods: ['generateContent', 'countTokens'] });
        }
        callNum += 1;
        if (callNum === 2) return makeJsonResponse({ error: { message: 'overloaded' } }, 503);
        if (callNum === 5) {
          let n = 0;
          return new Response(new ReadableStream({
            pull(c) {
              n += 1;
              if (n === 1) c.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ modelVersion: R1_NATIVE_PINNED_MODEL, candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nPartial chunk' }] } }] })}\n\n`));
              else c.error(new Error('MID_STREAM_DROP'));
            }
          }), { status: 200, headers: { 'content-type': 'text/event-stream' } });
        }
        const isA = callNum === 1 || callNum === 4 || callNum === 5;
        return makeSseResponse([{
          modelVersion: R1_NATIVE_PINNED_MODEL,
          candidates: [{ content: { parts: [{ text: isA ? compliantZalgo : flatPlainFirst }] }, finishReason: 'STOP' }],
          usageMetadata: { promptTokenCount: 215, candidatesTokenCount: 40, thoughtsTokenCount: 15, totalTokenCount: 270 }
        }]);
      }
    });

    assert.equal(multi.dispatchCounts.generationCalls, 6);
    assert.equal(multi.attemptRecords.length, 6);
    // Episode 1 failed on 503 for B, NEVER erased, classified HELD
    assert.equal(multi.attemptRecords[1].integrityStopReason, 'PROVIDER_HTTP_503_UNAVAILABLE');
    assert.equal(multi.episodeSummaries[0].outcome.classification, 'HELD');
    // Episode 2 reversed order B_THEN_A succeeded and retains sequential inference scope label
    assert.equal(multi.episodeSummaries[1].outcome.classification, 'FINITE_PREFIX_EFFECT_SUPPORT');
    assert.equal(multi.episodeSummaries[1].outcome.inferenceScope, 'EXPLORATORY_SEQUENTIAL_MULTI_EPISODE');
    // Episode 3 had mid-stream drop on attempt 5; partial raw SSE remains on disk!
    const droppedAttempt = multi.attemptRecords[4];
    assert.equal(droppedAttempt.integrityStopReason, 'STOP_ON_STREAM_INTERRUPTED');
    assert.equal(fs.existsSync(droppedAttempt.rawSseFilePath), true);
    assert.ok(droppedAttempt.wire.rawSseBytes > 0);
    assert.equal(multi.episodeSummaries[2].outcome.classification, 'HELD');

    const journal = fs.readFileSync(multi.evidenceJournalPath, 'utf8');
    assert.ok(journal.includes('PROVIDER_HTTP_503_UNAVAILABLE'));
    assert.ok(journal.includes('R1_NATIVE_SESSION_CLOSED'));

    // 2. Post-capture disk tampering + missing usage fail closed as HELD
    const integrityTest = await executeProviderNativeCore({
      acknowledgeLiveExecution: true,
      grant: signGrant(buildValidNativePayload(), privateKey),
      publicKeyPem: publicKey,
      pinnedTrustFingerprintSha256: fp,
      checkedOutHeadSha: TEST_HEAD_SHA,
      evidenceDir,
      apiKey: 'fake-key',
      checkModelDiscovery: false,
      measureCountTokens: false,
      textIntegrityProbe: (authoredPath, cond) => {
        if (cond === 'R1_NATIVE_A') fs.writeFileSync(authoredPath, 'TAMPERED', 'utf8');
      },
      transportFetch: async () => makeSseResponse([{
        modelVersion: R1_NATIVE_PINNED_MODEL,
        candidates: [{ content: { parts: [{ text: compliantZalgo }] }, finishReason: 'STOP' }]
        // missing usageMetadata on purpose -> HELD
      }])
    });
    assert.equal(integrityTest.attemptRecords[0].textIntegrityOk, false);
    assert.equal(integrityTest.attemptRecords[0].integrityStopReason, 'STOP_ON_MISSING_OR_INVALID_PROVIDER_USAGE');
    assert.equal(integrityTest.episodeSummaries[0].outcome.classification, 'HELD');
  } finally {
    fs.rmSync(evidenceDir, { recursive: true, force: true });
  }
});

test('Red Pen #2 (In-Flight Operator STOP & Live Revocation): interrupts active original-Google-SSE stream mid-flight, preserves partial raw bytes, and stops session', async () => {
  const { publicKey, privateKey } = createEphemeralTestSigner();
  const fp = spkiFingerprint(publicKey);
  const evidenceDir = makeTempEvidenceDir();

  try {
    // Case A: Mid-stream operatorAbortSignal fires while reader.read() is blocked waiting on chunk #2
    const abortCtrl = new AbortController();
    const partialChunk = `data: ${JSON.stringify({ modelVersion: R1_NATIVE_PINNED_MODEL, candidates: [{ content: { parts: [{ text: 'Kʰonapolit\nPartial chunk before operator stop' }] } }] })}\n\n`;
    let streamCancelled = false;
    let pullCount = 0;

    const stoppedBySignal = await executeProviderNativeCore({
      acknowledgeLiveExecution: true,
      grant: signGrant(buildValidNativePayload(), privateKey),
      publicKeyPem: publicKey,
      pinnedTrustFingerprintSha256: fp,
      checkedOutHeadSha: TEST_HEAD_SHA,
      evidenceDir,
      apiKey: 'fake-key',
      checkModelDiscovery: false,
      measureCountTokens: false,
      operatorAbortSignal: abortCtrl.signal,
      episodes: [{ episodeId: 1, order: 'A_THEN_B' }, { episodeId: 2, order: 'B_THEN_A' }],
      transportFetch: async () => new Response(new ReadableStream({
        pull(controller) {
          pullCount += 1;
          if (pullCount === 1) {
            controller.enqueue(new TextEncoder().encode(partialChunk));
            setTimeout(() => abortCtrl.abort(), 30);
            return undefined;
          }
          // Intentionally stay pending forever unless operator STOP cancels the stream
          return new Promise(() => {});
        },
        cancel() {
          streamCancelled = true;
        }
      }), { status: 200, headers: { 'content-type': 'text/event-stream; charset=utf-8' } })
    });

    assert.equal(streamCancelled, true);
    assert.equal(stoppedBySignal.dispatchCounts.generationCalls, 1);
    assert.equal(stoppedBySignal.integritySessionHaltReason, 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED');
    const attA = stoppedBySignal.attemptRecords[0];
    assert.equal(attA.wire.operatorStopped, true);
    assert.equal(attA.integrityStopReason, 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED');
    assert.equal(fs.readFileSync(attA.rawSseFilePath, 'utf8'), partialChunk);
    assert.equal(crypto.createHash('sha256').update(Buffer.from(partialChunk, 'utf8')).digest('hex'), attA.wire.rawSseSha256);
    assert.equal(stoppedBySignal.episodeSummaries[0].outcome.classification, 'HELD');
    assert.equal(stoppedBySignal.episodeSummaries.length, 1);

    // Case B: Live revocation file update arrives mid-stream and aborts without waiting for provider EOF
    const revocationFile = path.join(evidenceDir, 'revocations.json');
    fs.writeFileSync(revocationFile, JSON.stringify({ revokedSessionIds: [] }), 'utf8');
    const payloadB = buildValidNativePayload();
    let liveRevocationCancelled = false;
    let livePullCount = 0;

    const stoppedByRevocation = await executeProviderNativeCore({
      acknowledgeLiveExecution: true,
      grant: signGrant(payloadB, privateKey),
      publicKeyPem: publicKey,
      pinnedTrustFingerprintSha256: fp,
      checkedOutHeadSha: TEST_HEAD_SHA,
      evidenceDir,
      revocationFilePath: revocationFile,
      apiKey: 'fake-key',
      checkModelDiscovery: false,
      measureCountTokens: false,
      episodes: [{ episodeId: 1, order: 'A_THEN_B' }],
      transportFetch: async () => new Response(new ReadableStream({
        pull(controller) {
          livePullCount += 1;
          if (livePullCount === 1) {
            controller.enqueue(new TextEncoder().encode(partialChunk));
            setTimeout(() => {
              fs.writeFileSync(revocationFile, JSON.stringify({ revokedSessionIds: [payloadB.sessionId] }), 'utf8');
            }, 30);
            return undefined;
          }
          return new Promise(() => {});
        },
        cancel() {
          liveRevocationCancelled = true;
        }
      }), { status: 200, headers: { 'content-type': 'text/event-stream; charset=utf-8' } })
    });

    assert.equal(liveRevocationCancelled, true);
    assert.equal(stoppedByRevocation.dispatchCounts.generationCalls, 1);
    assert.equal(stoppedByRevocation.integritySessionHaltReason, 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED');
    assert.equal(stoppedByRevocation.attemptRecords[0].wire.operatorStopped, true);
    assert.equal(stoppedByRevocation.attemptRecords[0].integrityStopReason, 'STOP_ON_OPERATOR_SESSION_REVOKED_OR_STOPPED');
    assert.equal(fs.readFileSync(stoppedByRevocation.attemptRecords[0].rawSseFilePath, 'utf8'), partialChunk);
    assert.equal(stoppedByRevocation.episodeSummaries[0].outcome.classification, 'HELD');
  } finally {
    fs.rmSync(evidenceDir, { recursive: true, force: true });
  }
});

test('Red Pen #3 (Single Giant SSE Event & Giant Single Authored Line): streams >2.5 MiB single event and >2.2 MiB single newline-free line with unordered thought keys & zero leftover spools', async () => {
  const { publicKey, privateKey } = createEphemeralTestSigner();
  const fp = spkiFingerprint(publicKey);
  const evidenceDir = makeTempEvidenceDir();

  try {
    const giantThoughtText = `SECRET_THOUGHT_DO_NOT_EMIT ${'t\u0301\u0323'.repeat(60000)}`;
    const unitZalgo = 'z\u0301\u0323\u0335a\u0302\u0327l ';
    const expectedLineBody = unitZalgo.repeat(260000).trimEnd();
    assert.ok(Buffer.byteLength(expectedLineBody, 'utf8') > 2.2 * 1024 * 1024);

    const s1Expected = makeVariableMultistackPhrase();
    const expectedAuthored = `Kʰonapolit\n${s1Expected}\n\nTauric Diana bots\n${expectedLineBody}`;

    // Single massive SSE `data:` frame (>2.5 MiB), unordered `"thought": true` after `"text"`,
    // sliced into arbitrary ~17 KiB UTF-8 byte chunks (splitting mid-character and mid-JSON escape)
    const singleGiantEventJson = JSON.stringify({
      modelVersion: R1_NATIVE_PINNED_MODEL,
      candidates: [{
        content: {
          role: 'model',
          parts: [
            { text: giantThoughtText, thought: true },
            { text: expectedAuthored }
          ]
        },
        finishReason: 'STOP'
      }],
      usageMetadata: { promptTokenCount: 215, candidatesTokenCount: 950000, thoughtsTokenCount: 55000, totalTokenCount: 1005215 }
    });
    const giantSseBytes = Buffer.from(`data: ${singleGiantEventJson}\n\n`, 'utf8');
    assert.ok(giantSseBytes.byteLength > 2.5 * 1024 * 1024);

    const chunkSliceBytes = 17321;
    let callIdx = 0;
    const obs = await executeProviderNativeCore({
      acknowledgeLiveExecution: true,
      grant: signGrant(buildValidNativePayload(), privateKey),
      publicKeyPem: publicKey,
      pinnedTrustFingerprintSha256: fp,
      checkedOutHeadSha: TEST_HEAD_SHA,
      evidenceDir,
      apiKey: 'fake-key',
      checkModelDiscovery: false,
      measureCountTokens: false,
      episodes: [{ episodeId: 1, order: 'A_THEN_B' }],
      transportFetch: async () => {
        callIdx += 1;
        if (callIdx === 1) {
          let offset = 0;
          return new Response(new ReadableStream({
            pull(controller) {
              if (offset >= giantSseBytes.byteLength) {
                controller.close();
                return;
              }
              const nextEnd = Math.min(giantSseBytes.byteLength, offset + chunkSliceBytes);
              controller.enqueue(giantSseBytes.subarray(offset, nextEnd));
              offset = nextEnd;
            }
          }), { status: 200, headers: { 'content-type': 'text/event-stream; charset=utf-8' } });
        }
        return makeSseResponse([{
          modelVersion: R1_NATIVE_PINNED_MODEL,
          candidates: [{ content: { parts: [{ text: `Kʰonapolit\nPlain thunder.\n\nTauric Diana bots\n${makeVariableMultistackPhrase()}` }] }, finishReason: 'STOP' }],
          usageMetadata: { promptTokenCount: 230, candidatesTokenCount: 120, thoughtsTokenCount: 25, totalTokenCount: 375 }
        }]);
      }
    });

    const aRecord = obs.attemptRecords[0];
    assert.equal(aRecord.wire.parserA.eventCount, 1);
    assert.equal(aRecord.wire.parserB.eventCount, 1);
    assert.equal(aRecord.wire.parserAgreement, true);
    assert.equal(aRecord.wire.rawDiskVerified, true);
    assert.equal(aRecord.wire.authoredDiskVerified, true);
    assert.equal(aRecord.textIntegrityOk, true);
    assert.equal(aRecord.integrityStopReason, null);
    assert.equal(aRecord.analysis.structuralComplianceOk, true);
    assert.equal(aRecord.wire.thoughtUtf8Bytes, Buffer.byteLength(giantThoughtText, 'utf8'));
    assert.equal(aRecord.wire.authoredTextSha256, crypto.createHash('sha256').update(Buffer.from(expectedAuthored, 'utf8')).digest('hex'));
    assert.equal(aRecord.analysis.section2Morphology.sha256, crypto.createHash('sha256').update(Buffer.from(expectedLineBody, 'utf8')).digest('hex'));
    assert.equal(aRecord.analysis.section2Morphology.stackedBaseCount, 520000);
    assert.equal(fs.readFileSync(aRecord.authoredTextFilePath, 'utf8').includes('SECRET_THOUGHT_DO_NOT_EMIT'), false);

    // Ensure zero temporary spool files were left behind in evidenceDir
    const leftoverTmps = fs.readdirSync(evidenceDir).filter((name) => name.includes('.tmp'));
    assert.deepEqual(leftoverTmps, []);
  } finally {
    fs.rmSync(evidenceDir, { recursive: true, force: true });
  }
});

test('Red Pen #4 (HTTP Non-2XX Wire Custody): persists unmodified raw error bytes, headers, and status for 503 streamGenerateContent, countTokens, and 429 modelMetadata', async () => {
  const { publicKey, privateKey } = createEphemeralTestSigner();
  const fp = spkiFingerprint(publicKey);
  const evidenceDir = makeTempEvidenceDir();

  try {
    const rawMetaErr = '{"error":{"code":429,"message":"Rate limited metadata check","status":"RESOURCE_EXHAUSTED"}}';
    const metaFail = await executeProviderNativeCore({
      acknowledgeLiveExecution: true,
      grant: signGrant(buildValidNativePayload(), privateKey),
      publicKeyPem: publicKey,
      pinnedTrustFingerprintSha256: fp,
      checkedOutHeadSha: TEST_HEAD_SHA,
      evidenceDir,
      apiKey: 'fake-key',
      checkModelDiscovery: true,
      transportFetch: async () => new Response(rawMetaErr, {
        status: 429,
        statusText: 'Too Many Requests',
        headers: { 'content-type': 'application/json', 'retry-after': '17' }
      })
    });

    assert.equal(metaFail.integritySessionHaltReason, 'STOP_ON_MODEL_METADATA_UNAVAILABLE');
    assert.equal(metaFail.dispatchCounts.generationCalls, 0);
    assert.ok(metaFail.metadataHttpErrorCustody);
    assert.equal(metaFail.metadataHttpErrorCustody.httpStatus, 429);
    assert.equal(metaFail.metadataHttpErrorCustody.responseHeaders['retry-after'], '17');
    assert.equal(fs.readFileSync(metaFail.metadataHttpErrorCustody.rawErrorBodyPath, 'utf8'), rawMetaErr);
    assert.equal(JSON.parse(fs.readFileSync(metaFail.metadataHttpErrorCustody.metaFilePath, 'utf8')).httpStatus, 429);

    const rawCountTokensErr = '{"error":{"code":400,"message":"countTokens rejected"}}';
    const rawStream503Body = 'UPSTREAM_503_RAW_WIRE_BODY::{"error":{"code":503,"status":"UNAVAILABLE"}}';
    const errRun = await executeProviderNativeCore({
      acknowledgeLiveExecution: true,
      grant: signGrant(buildValidNativePayload(), privateKey),
      publicKeyPem: publicKey,
      pinnedTrustFingerprintSha256: fp,
      checkedOutHeadSha: TEST_HEAD_SHA,
      evidenceDir,
      apiKey: 'fake-key',
      checkModelDiscovery: false,
      measureCountTokens: true,
      episodes: [{ episodeId: 1, order: 'A_THEN_B' }],
      transportFetch: async (url) => {
        if (url.includes(':countTokens')) {
          return new Response(rawCountTokensErr, {
            status: 400,
            statusText: 'Bad Request',
            headers: { 'content-type': 'application/json', 'x-debug-id': 'ct-400' }
          });
        }
        if (url.includes('streamGenerateContent')) {
          return new Response(rawStream503Body, {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'content-type': 'text/plain; charset=utf-8', 'retry-after': '42', 'x-provider-trace': 'trace-503' }
          });
        }
        throw new Error(`Unexpected URL: ${url}`);
      }
    });

    assert.equal(errRun.dispatchCounts.generationCalls, 2);
    for (const rec of errRun.attemptRecords) {
      assert.equal(rec.integrityStopReason, 'PROVIDER_HTTP_503_UNAVAILABLE');
      assert.ok(rec.httpErrorCustody);
      assert.equal(rec.httpErrorCustody.httpStatus, 503);
      assert.equal(rec.httpErrorCustody.responseHeaders['retry-after'], '42');
      assert.equal(rec.httpErrorCustody.responseHeaders['x-provider-trace'], 'trace-503');
      assert.equal(fs.readFileSync(rec.httpErrorCustody.rawErrorBodyPath, 'utf8'), rawStream503Body);
      assert.equal(
        rec.httpErrorCustody.rawErrorBodySha256,
        crypto.createHash('sha256').update(Buffer.from(rawStream503Body, 'utf8')).digest('hex')
      );
      assert.equal(JSON.parse(fs.readFileSync(rec.httpErrorCustody.metaFilePath, 'utf8')).rawErrorBodyBytes, Buffer.byteLength(rawStream503Body));
      assert.equal(fs.readFileSync(rec.countTokensMeasurement.httpErrorCustody.rawErrorBodyPath, 'utf8'), rawCountTokensErr);
      assert.equal(rec.countTokensMeasurement.httpErrorCustody.httpStatus, 400);
    }
    const journalText = fs.readFileSync(errRun.evidenceJournalPath, 'utf8');
    assert.ok(journalText.includes('trace-503'));
    assert.ok(journalText.includes(errRun.attemptRecords[0].httpErrorCustody.rawErrorBodySha256));
  } finally {
    fs.rmSync(evidenceDir, { recursive: true, force: true });
  }
});
