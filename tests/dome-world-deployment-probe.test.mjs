import assert from 'node:assert/strict';
import { runDomeWorldDeploymentProbe } from '../scripts/dome-world-deployment-probe.mjs';

function response(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    async json() {
      return body;
    },
  };
}

const calls = [];
const fetchImpl = async (url, options = {}) => {
  calls.push({ url, options });

  if (url.endsWith('/api/dome-world/ping')) {
    return response(200, { ok: true, operation: 'ping' });
  }

  if (url.endsWith('/api/dome-world/readiness')) {
    return response(200, {
      ok: true,
      operation: 'readiness',
      operations: ['aperture-bridge', 'ash-readiness', 'phason-gate'],
      delegatedCustodyOperations: ['ash-custody-register', 'ash-custody-replay'],
      metadataDigestFallbackOnPublicCustodyRoute: false,
    });
  }

  if (url.endsWith('/api/ash-local-commitment?operation=readiness')) {
    return response(200, {
      ok: true,
      operations: ['ash-custody-register', 'ash-custody-replay'],
      rawBytesAcceptedByServer: false,
      metadataDigestFallback: false,
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

    return response(200, {
      ok: true,
      operation: 'ash-custody-register',
      traceId: envelope.traceId,
      result: {
        schema: 'td613.ash.custody-receipt/v0.7',
        assurance_class: 'L0_METADATA_ONLY',
        artifact_digest_present: false,
        manifest: {
          artifact_metadata: {
            artifact_digest: null,
            content_hash: null,
          },
          local_commitment: null,
          privacy_boundary: {
            raw_content_received_by_server: false,
          },
        },
      },
    });
  }

  if (url.endsWith('/api/dome-world-engine')) {
    const envelope = JSON.parse(options.body);
    assert.equal(envelope.operation, 'ash-custody-register');
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
  traceId: 'phase0_probe_fixture',
});

assert.equal(receipt.schema, 'td613.dome-world.deployment-probe/v0.1');
assert.equal(receipt.status, 'PASS');
assert.equal(receipt.base_url, 'https://example.test');
assert.equal(receipt.trace_id, 'phase0_probe_fixture');
assert.equal(receipt.checks.length, 5);
assert.ok(receipt.checks.every((check) => check.status === 'PASS'));
assert.deepEqual(receipt.transmitted, {
  artifact_bytes: false,
  raw_document_text: false,
  credential_secret: false,
  artifact_digest: false,
});
assert.equal(calls.length, 5);
assert.deepEqual(
  calls.map(({ url, options }) => [new URL(url).pathname + new URL(url).search, options.method]),
  [
    ['/api/dome-world/ping', 'GET'],
    ['/api/dome-world/readiness', 'GET'],
    ['/api/ash-local-commitment?operation=readiness', 'GET'],
    ['/api/dome-world/ash-custody-register', 'POST'],
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

console.log('Dome-World Phase 0 deployment probe contract: PASS');
