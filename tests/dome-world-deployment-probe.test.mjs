import assert from 'node:assert/strict';
import { runDomeWorldDeploymentProbe } from '../scripts/dome-world-deployment-probe.mjs';

function response(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    async json() { return body; },
  };
}

const manifestDigest = `sha256:${'a'.repeat(64)}`;
const receiptDigest = `sha256:${'b'.repeat(64)}`;
let registeredReceipt = null;
const calls = [];

const fetchImpl = async (url, options = {}) => {
  calls.push({ url, options });
  if (url.endsWith('/api/dome-world/ping')) return response(200, { ok: true, operation: 'ping' });
  if (url.endsWith('/api/dome-world/readiness')) {
    return response(200, {
      ok: true,
      operation: 'readiness',
      operations: ['aperture-bridge', 'ash-readiness', 'phason-gate'],
      metadataDigestFallbackOnPublicCustodyRoute: false,
    });
  }
  if (url.endsWith('/api/ash-local-commitment?operation=readiness')) {
    return response(200, {
      ok: true,
      schema: 'td613.ash.canonical-digest-readiness/v0.8',
      status: 'phase-2-active',
      operations: ['ash-custody-register', 'ash-custody-replay', 'ash-custody-migrate'],
      canonicalJsonProfile: 'td613.ash.canonical-json/v0.1',
      rawBytesAcceptedByServer: false,
      metadataDigestFallback: false,
      universalStableDigestPublishedByDefault: false,
    });
  }
  if (url.endsWith('/api/dome-world/ash-custody-register')) {
    const envelope = JSON.parse(options.body);
    assert.equal(envelope.operation, 'ash-custody-register');
    assert.equal(envelope.payload.artifactMetadata.assuranceClass, 'L0_METADATA_ONLY');
    assert.equal(envelope.payload.artifactMetadata.artifactDigest, null);
    assert.equal(envelope.payload.artifactMetadata.contentHash, null);
    assert.equal(envelope.payload.artifactMetadata.localCommitment, null);
    assert.equal(envelope.payload.operatorMetadata.raw_content_supplied, false);
    assert.doesNotMatch(options.body, /rawBytes|fileBytes|fileContent|sensitiveText/);
    registeredReceipt = {
      schema: 'td613.ash.custody-receipt/v0.8',
      receipt_id: `ashc_${receiptDigest.slice(-20)}`,
      assurance_class: 'L0_METADATA_ONLY',
      artifact_digest_present: false,
      manifest_digest: manifestDigest,
      receipt_digest: receiptDigest,
      manifest: {
        schema: 'td613.ash.custody-manifest/v0.8',
        manifest_digest: manifestDigest,
        artifact_metadata: {
          artifact_digest: null,
          assurance_class: 'L0_METADATA_ONLY',
        },
        local_commitment: null,
        privacy_boundary: { raw_content_received_by_server: false },
      },
    };
    return response(200, { ok: true, operation: 'ash-custody-register', result: registeredReceipt });
  }
  if (url.endsWith('/api/dome-world/ash-custody-replay')) {
    const envelope = JSON.parse(options.body);
    assert.deepEqual(envelope.payload.receipt, registeredReceipt);
    return response(200, {
      ok: true,
      operation: 'ash-custody-replay',
      result: {
        schema: 'td613.ash.custody-replay/v0.8',
        validation_status: 'V0_8_DIGEST_SPINE_VERIFIED',
        manifest_digest: manifestDigest,
        receipt_digest: receiptDigest,
        artifact_digest: null,
        raw_replay_available: false,
      },
    });
  }
  if (url.endsWith('/api/dome-world-engine')) {
    return response(400, {
      ok: false,
      error: 'Ash custody registration/replay is owned exclusively by api/ash-local-commitment-guard.py',
    });
  }
  throw new Error(`Unexpected probe URL: ${url}`);
};

const receipt = await runDomeWorldDeploymentProbe({
  baseUrl: 'https://example.test/',
  fetchImpl,
  traceId: 'phase2_probe_fixture',
});
assert.equal(receipt.schema, 'td613.dome-world.deployment-probe/v0.2');
assert.equal(receipt.status, 'PASS');
assert.equal(receipt.checks.length, 6);
assert.ok(receipt.checks.every((check) => check.status === 'PASS'));
assert.deepEqual(receipt.transmitted, {
  artifact_bytes: false,
  raw_document_text: false,
  credential_secret: false,
  artifact_digest: false,
  l0_manifest_and_receipt_digests: true,
});
assert.equal(calls.length, 6);
assert.deepEqual(
  calls.map(({ url, options }) => [new URL(url).pathname + new URL(url).search, options.method]),
  [
    ['/api/dome-world/ping', 'GET'],
    ['/api/dome-world/readiness', 'GET'],
    ['/api/ash-local-commitment?operation=readiness', 'GET'],
    ['/api/dome-world/ash-custody-register', 'POST'],
    ['/api/dome-world/ash-custody-replay', 'POST'],
    ['/api/dome-world-engine', 'POST'],
  ],
);

await assert.rejects(
  () => runDomeWorldDeploymentProbe({ baseUrl: '', fetchImpl }),
  /Provide a base URL/,
);
await assert.rejects(
  () => runDomeWorldDeploymentProbe({
    baseUrl: 'https://example.test',
    fetchImpl: async () => response(503, { ok: false, error: 'held' }),
  }),
  /ping returned HTTP 503/,
);

console.log('Dome-World Phase 0–2 deployment probe contract: PASS');
