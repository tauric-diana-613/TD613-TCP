import assert from 'node:assert/strict';
import fs from 'node:fs';
import { APERTURE_RELEASE } from '../../app/aperture/release.js';
import { releaseManifestFromMetadata } from '../../scripts/lib/aperture-sync-lane.mjs';

const releaseJson = JSON.parse(fs.readFileSync(new URL('../../app/aperture/release.json', import.meta.url), 'utf8'));
assert.deepEqual(releaseJson, APERTURE_RELEASE);
assert.equal(releaseJson.composition.version, 'v0.1');
assert.equal(releaseJson.composition.schema, 'td613.aperture.composition-manifest/v0.1');
assert.equal(releaseJson.composition.runtimeSchema, 'td613.aperture.composition-runtime/v0.1');
assert.equal(releaseJson.composition.receiptSchema, 'td613.aperture.composition-receipt/v0.1');
assert.equal(releaseJson.composition.replaySchema, 'td613.aperture.composition-replay/v0.1');
assert.equal(releaseJson.composition.status, 'IMPLEMENTED_VALIDATION_GATED');
assert.equal(releaseJson.composition.canonicalBody, 'app/aperture/tool.html');
assert.equal(releaseJson.composition.publicShim, 'app/aperture/index.html');
assert.equal(releaseJson.composition.bootstrap, 'app/aperture/bootstrap.js');
assert.deepEqual(releaseJson.composition.componentOrder, [
  'release-manifest',
  'task-intent',
  'v31-compatibility',
  'phase4-reciprocal-bridge'
]);
assert.equal(releaseJson.composition.canonicalBodyRewritten, false);
assert.equal(releaseJson.composition.automaticAuthorityTransfer, false);
assert.equal(releaseJson.composition.operatorClosureRequired, true);

const regenerated = releaseManifestFromMetadata({
  version: 'v3.1-alpha',
  schema: 'td613-aperture/v3.1-alpha',
  featureVersion: releaseJson.featureVersion,
  doctrineKernelSchema: releaseJson.doctrineKernelSchema
}, releaseJson);
assert.deepEqual(regenerated.composition, releaseJson.composition);
assert.equal(regenerated.domeDiagnosticReceiptSchema, 'td613.aperture.diagnostic-receipt/v3.0-alpha');
assert.equal(regenerated.roundTripReceiptSchema, 'td613.aperture.round-trip-receipt/v3.0-alpha');
assert.equal(regenerated.phase5RelationEnvelopeSchema, 'td613.relation-envelope/v0.1');

console.log('aperture-composition/release.test.mjs passed');
