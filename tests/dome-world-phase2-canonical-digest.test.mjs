import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import fs from 'node:fs';

import {
  CANONICAL_JSON_PROFILE,
  MANIFEST_DIGEST_DOMAIN,
  RECEIPT_DIGEST_DOMAIN,
  canonicalDigest,
  canonicalJson,
  computeManifestDigest,
  computeReceiptDigest,
  verifyReceiptDigests,
} from '../app/dome-world/ash/canonical-json.js';

const vectors = JSON.parse(fs.readFileSync('app/dome-world/fixtures/ash-canonical-json-vectors.json', 'utf8'));
assert.equal(vectors.profile, CANONICAL_JSON_PROFILE);
for (const vector of vectors.vectors) {
  assert.equal(canonicalJson(vector.value), vector.canonical_json, vector.id);
  assert.equal(
    await canonicalDigest(vector.domain, vector.value, { cryptoImpl: webcrypto }),
    vector.digest,
    vector.id,
  );
}

const manifest = {
  schema: 'td613.ash.custody-manifest/v0.8',
  artifact_id: 'ash_artifact_fixture',
  artifact_metadata: { artifact_digest: null, assurance_class: 'L0_METADATA_ONLY' },
  aperture: { volatile: 'first' },
};
manifest.manifest_digest = await computeManifestDigest(manifest, { cryptoImpl: webcrypto });
const manifestDigest = manifest.manifest_digest;
manifest.aperture = { volatile: 'second' };
assert.equal(await computeManifestDigest(manifest, { cryptoImpl: webcrypto }), manifestDigest);

const receipt = {
  schema: 'td613.ash.custody-receipt/v0.8',
  created_at: '2026-07-12T00:00:00Z',
  manifest_digest: manifestDigest,
  manifest,
};
receipt.receipt_digest = await computeReceiptDigest(receipt, { cryptoImpl: webcrypto });
receipt.receipt_id = `ashc_${receipt.receipt_digest.slice(-20)}`;
assert.equal((await verifyReceiptDigests(receipt, { cryptoImpl: webcrypto })).valid, true);
assert.notEqual(manifestDigest, receipt.receipt_digest);
assert.notEqual(MANIFEST_DIGEST_DOMAIN, RECEIPT_DIGEST_DOMAIN);

const metadataChange = structuredClone(receipt);
metadataChange.manifest.artifact_metadata.media_type = 'text/plain';
assert.notEqual(
  await computeManifestDigest(metadataChange.manifest, { cryptoImpl: webcrypto }),
  manifestDigest,
);
assert.equal(
  metadataChange.manifest.artifact_metadata.artifact_digest,
  receipt.manifest.artifact_metadata.artifact_digest,
);

const receiptChange = structuredClone(receipt);
receiptChange.created_at = '2026-07-12T00:00:01Z';
assert.notEqual(
  await computeReceiptDigest(receiptChange, { cryptoImpl: webcrypto }),
  receipt.receipt_digest,
);

assert.throws(() => canonicalJson({ value: 1.5 }), /safe integer/);
assert.throws(() => canonicalJson({ value: -0 }), /negative zero/);
assert.throws(() => canonicalJson({ 'é': 1 }), /non-ASCII/);
assert.throws(() => canonicalJson({ value: '\ud800' }), /surrogate/);
assert.throws(() => canonicalJson({ value: undefined }), /undefined/);
assert.throws(() => canonicalJson(new Date()), /plain object/);
assert.notEqual(canonicalJson({ value: 'é' }), canonicalJson({ value: 'e\u0301' }));

console.log('Ash Phase 2 canonical digest parity: PASS');
