import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ASH_EXPERIMENT_CUSTODY_DOMAIN,
  compileAshExperimentCustodyManifest,
  verifyAshExperimentCustodyManifest
} from '../app/dome-world/ash/experiment-custody.js';
import {
  ASH_SNAPSHOT_BATCH_DOMAIN,
  compileAshSnapshotBatch,
  verifyAshSnapshotBatch
} from '../app/dome-world/ash/snapshot-batch.js';
import {
  ASH_TOMOGRAPHY_RESULT_CUSTODY_DOMAIN,
  compileAshTomographyResultCustody,
  verifyAshTomographyResultCustody
} from '../app/dome-world/ash/tomography-result-custody.js';

const DIGEST_A = `sha256:${'a'.repeat(64)}`;
const DIGEST_B = `sha256:${'b'.repeat(64)}`;

const manifest = await compileAshExperimentCustodyManifest({
  manifestId: 'ashexp_0123456789abcdef0123',
  createdAt: '2026-07-13T01:00:00.000Z',
  experimentId: 'atx_0123456789abcdef0123',
  sourceReceiptReference: 'ashc_0123456789abcdef0123',
  sourceReceiptDigest: DIGEST_A,
  sourceCustodyVerified: true,
  preRegistrationDigest: DIGEST_B,
  instrumentEnsembleDigest: DIGEST_A
});
assert.equal(manifest.source_custody.independently_verified, true);
assert.equal(manifest.raw_artifact_content_present, false);
assert.equal(manifest.automatic_cinder_action, false);
assert.equal(manifest.closure.status, 'OPEN');
assert.equal(await verifyAshExperimentCustodyManifest(manifest), true);
const tamperedManifest = structuredClone(manifest);
tamperedManifest.instrument_ensemble_digest = DIGEST_B;
assert.equal(await verifyAshExperimentCustodyManifest(tamperedManifest), false);

const batch = await compileAshSnapshotBatch({
  batchId: 'ashsnap_0123456789abcdef0123',
  createdAt: '2026-07-13T01:01:00.000Z',
  experimentId: manifest.experiment_id,
  sourceReceiptReference: manifest.source_custody.receipt_reference,
  snapshots: [
    { snapshotId: 'atsnap_observed_001', trial: 1, temporalCoordinate: 't0', instrumentId: 'reference-a', sourceStatus: 'OBSERVED', inclusionStatus: 'INCLUDED', observationReference: 'atobs_001', observationDigest: DIGEST_A, contextReceiptReference: 'flowctx_001', operatorIncluded: true },
    { snapshotId: 'atsnap_null_002', trial: 2, temporalCoordinate: 't1', instrumentId: 'reference-a', sourceStatus: 'OBSERVED', inclusionStatus: 'NULL_RESULT', observationReference: 'atobs_002', observationDigest: DIGEST_B, contextReceiptReference: 'flowctx_002', operatorIncluded: true },
    { snapshotId: 'atsnap_missing_003', trial: 3, temporalCoordinate: 't2', instrumentId: 'reference-b', sourceStatus: 'UNRESOLVED', inclusionStatus: 'MISSING', missingness: ['provider response absent'], operatorIncluded: false },
    { snapshotId: 'atsnap_rejected_004', trial: 4, temporalCoordinate: 't3', instrumentId: 'reference-b', sourceStatus: 'SUPPLIED', inclusionStatus: 'REJECTED', observationReference: 'atobs_004', observationDigest: DIGEST_A, missingness: ['failed declared range check'], operatorIncluded: false },
    { snapshotId: 'atsnap_uncaptured_005', trial: 5, temporalCoordinate: 't4', instrumentId: 'reference-c', sourceStatus: 'UNRESOLVED', inclusionStatus: 'UNCAPTURED', missingness: ['capture unavailable'], operatorIncluded: false },
    { snapshotId: 'atsnap_encoder_006', trial: 6, temporalCoordinate: 't5', instrumentId: 'reference-c', sourceStatus: 'UNRESOLVED', inclusionStatus: 'ENCODER_REQUIRED', missingness: ['declared adapter unavailable'], operatorIncluded: false }
  ]
});
assert.equal(batch.snapshot_count, 6);
assert.equal(batch.included_count, 2);
assert.equal(batch.null_result_count, 1);
assert.equal(batch.unresolved_count, 4);
assert.deepEqual(batch.entries.map(entry => entry.inclusion_status), ['INCLUDED', 'NULL_RESULT', 'MISSING', 'REJECTED', 'UNCAPTURED', 'ENCODER_REQUIRED']);
assert.equal(batch.entries[2].observation_digest, null);
assert.equal(batch.raw_observation_content_present, false);
assert.equal(batch.automatic_exclusion, false);
assert.equal(batch.closure.status, 'OPEN');
assert.equal(await verifyAshSnapshotBatch(batch), true);
const tamperedBatch = structuredClone(batch);
tamperedBatch.entries[2].missingness = [];
assert.equal(await verifyAshSnapshotBatch(tamperedBatch), false);
await assert.rejects(compileAshSnapshotBatch({ experimentId: manifest.experiment_id, sourceReceiptReference: 'ashc_x', snapshots: [{ snapshotId: 'x', trial: 1, temporalCoordinate: 't', instrumentId: 'i', inclusionStatus: 'MISSING', observationDigest: DIGEST_A }] }), /may not invent/);

const result = await compileAshTomographyResultCustody({
  custodyId: 'ashtomo_0123456789abcdef0123',
  createdAt: '2026-07-13T01:02:00.000Z',
  experimentManifestReference: manifest.manifest_id,
  snapshotBatchReference: batch.batch_id,
  tomographyReceiptReference: 'attomo_0123456789abcdef0123',
  tomographyReceiptDigest: DIGEST_B,
  sourceDriftStatus: 'SOURCE_INVARIANT',
  coverageStatus: 'ADEQUATE',
  tamperStatus: 'VERIFIED'
});
assert.equal(result.derivative_present, false);
assert.equal(result.cinder_present, false);
assert.equal(result.transport_authorized, false);
assert.equal(result.closure.status, 'OPEN');
assert.equal(await verifyAshTomographyResultCustody(result), true);

assert.equal(new Set([ASH_EXPERIMENT_CUSTODY_DOMAIN, ASH_SNAPSHOT_BATCH_DOMAIN, ASH_TOMOGRAPHY_RESULT_CUSTODY_DOMAIN]).size, 3);
for (const path of [
  'app/dome-world/schemas/ash-experiment-custody-v02.schema.json',
  'app/dome-world/schemas/ash-snapshot-batch-v02.schema.json',
  'app/dome-world/schemas/ash-tomography-result-custody-v02.schema.json'
]) {
  const schema = JSON.parse(fs.readFileSync(path, 'utf8'));
  assert.ok(schema.$id);
  assert.equal(schema.additionalProperties, false);
}
console.log('ash-v09-experiment-custody.test.mjs passed');
