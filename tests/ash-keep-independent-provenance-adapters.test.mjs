import assert from 'node:assert/strict';
import {
  INDEPENDENT_PROVENANCE_EVIDENCE_CLASSES,
  compileIndependentProvenanceAdapterRegistry,
  compileIndependentProvenanceVerification,
  replayIndependentProvenanceVerification,
  verifyIndependentProvenanceAdapterRegistry,
  verifyIndependentProvenanceReplay,
  verifyIndependentProvenanceVerification
} from '../app/engine/ash-keep-independent-provenance-adapters.js';

const digest = letter => `sha256:${letter.repeat(64)}`;
const registry = await compileIndependentProvenanceAdapterRegistry({
  registryId: 'indprovregistry_stretch10_fixture',
  createdAt: '2026-07-16T23:30:00.000Z',
  closureStatus: 'OPEN'
});
assert.equal(registry.state, 'INDEPENDENT_PROVENANCE_REGISTRY_ELIGIBLE');
assert.equal(registry.registry_eligible, true);
assert.equal(registry.adapters.length, 11);
assert.equal(registry.evidence_class_count, 11);
assert.equal(registry.digest_domain_count, 11);
assert.equal(registry.adapter_schema_count, 11);
assert.equal(new Set(registry.adapters.map(adapter => adapter.digest_domain)).size, 11);
assert.equal(new Set(registry.adapters.map(adapter => adapter.adapter_schema)).size, 11);
assert.equal(await verifyIndependentProvenanceAdapterRegistry(registry), true);
assert.equal(registry.universal_join_key, null);
assert.equal(registry.destination_transport_authorized, false);

for (const [index, evidenceClass] of INDEPENDENT_PROVENANCE_EVIDENCE_CLASSES.entries()) {
  const adapter = registry.adapters.find(candidate => candidate.evidence_class === evidenceClass);
  const observed = digest(String.fromCharCode(97 + (index % 6)));
  const receipt = await compileIndependentProvenanceVerification({
    registry,
    verificationId: `indprovverify_${adapter.adapter_id}`,
    createdAt: '2026-07-16T23:31:00.000Z',
    adapterId: adapter.adapter_id,
    evidenceClass,
    declaredDigestDomain: adapter.digest_domain,
    operatorGesture: 'VERIFY_INDEPENDENT_PROVENANCE_REFERENCE',
    sourceId: `source_${adapter.adapter_id}`,
    expectedSourceId: `source_${adapter.adapter_id}`,
    sourceNamespace: 'FIXTURE_LOCAL',
    referenceId: `reference_${adapter.adapter_id}`,
    sourceLocalReference: `${adapter.reference_prefix}fixture_${adapter.adapter_id}`,
    expectedDigest: observed,
    observedDigest: observed,
    sourceStatus: 'CURRENT'
  });
  assert.equal(receipt.state, 'INDEPENDENT_PROVENANCE_VERIFIED');
  assert.equal(receipt.verification_eligible, true);
  assert.equal(receipt.adapter.evidence_class, evidenceClass);
  assert.equal(receipt.adapter.digest_domain, adapter.digest_domain);
  assert.equal(receipt.evidence_class_preserved, true);
  assert.equal(receipt.raw_body_present, false);
  assert.equal(receipt.raw_corpus_present, false);
  assert.equal(receipt.universal_join_key, null);
  assert.equal(receipt.identity_inferred, false);
  assert.equal(receipt.authorship_inferred, false);
  assert.equal(receipt.permission_inferred, false);
  assert.equal(receipt.authenticity_inferred, false);
  assert.equal(receipt.truth_inferred, false);
  assert.equal(receipt.relation_inferred, false);
  assert.equal(receipt.custody_inferred, false);
  assert.equal(receipt.external_time_inferred, false);
  assert.equal(receipt.destination_transport_authorized, false);
  assert.equal(await verifyIndependentProvenanceVerification(receipt, registry), true);
}

const artifact = registry.adapters.find(adapter => adapter.evidence_class === 'ARTIFACT_DIGEST');
const base = {
  registry,
  adapterId: artifact.adapter_id,
  evidenceClass: artifact.evidence_class,
  declaredDigestDomain: artifact.digest_domain,
  operatorGesture: 'VERIFY_INDEPENDENT_PROVENANCE_REFERENCE',
  sourceId: 'source_artifact',
  expectedSourceId: 'source_artifact',
  referenceId: 'reference_artifact',
  sourceLocalReference: 'artifact:fixture_artifact',
  expectedDigest: digest('a'),
  observedDigest: digest('a'),
  sourceStatus: 'CURRENT'
};

assert.equal((await compileIndependentProvenanceVerification({ ...base, referenceId: '' })).state, 'MISSING_REFERENCE_HOLD');
assert.equal((await compileIndependentProvenanceVerification({ ...base, evidenceClass: 'UNSUPPORTED_CLASS' })).state, 'UNSUPPORTED_DOMAIN_HOLD');
assert.equal((await compileIndependentProvenanceVerification({ ...base, declaredDigestDomain: 'TD613:WRONG:v1' })).state, 'WRONG_DOMAIN_HOLD');
assert.equal((await compileIndependentProvenanceVerification({ ...base, expectedSourceId: 'source_other' })).state, 'SOURCE_MISMATCH_HOLD');
assert.equal((await compileIndependentProvenanceVerification({ ...base, sourceStatus: 'STALE' })).state, 'STALE_REFERENCE_HOLD');
assert.equal((await compileIndependentProvenanceVerification({ ...base, sourceStatus: 'REVOKED' })).state, 'REVOKED_REFERENCE_HOLD');
assert.equal((await compileIndependentProvenanceVerification({ ...base, collisionDetected: true })).state, 'COLLISION_HOLD');
assert.equal((await compileIndependentProvenanceVerification({ ...base, observedDigest: digest('b') })).state, 'TAMPER_HOLD');
assert.equal((await compileIndependentProvenanceVerification({ ...base, cancelled: true })).state, 'CANCELLED_HOLD');
assert.equal((await compileIndependentProvenanceVerification({ ...base, replayBeyondJurisdiction: true })).state, 'REPLAY_HOLD');
assert.equal((await compileIndependentProvenanceVerification({ ...base, rawBodyIncluded: true })).state, 'UNSUPPORTED_DOMAIN_HOLD');

const verified = await compileIndependentProvenanceVerification(base);
const replay = await replayIndependentProvenanceVerification(verified, registry, {
  replayId: 'indprovreplay_stretch10_fixture',
  createdAt: '2026-07-16T23:32:00.000Z'
});
assert.equal(replay.state, 'INDEPENDENT_PROVENANCE_REPLAY_VERIFIED');
assert.equal(replay.replay_verified, true);
assert.equal(replay.provider_reexecuted, false);
assert.equal(replay.reader_reexecuted, false);
assert.equal(replay.raw_body_restored, false);
assert.equal(replay.destination_transport_authorized, false);
assert.equal(await verifyIndependentProvenanceReplay(replay), true);

const wrongClassReplay = await replayIndependentProvenanceVerification(verified, registry, {
  requestedEvidenceClass: 'MANIFEST_DIGEST'
});
assert.equal(wrongClassReplay.state, 'REPLAY_HOLD');
assert.equal(wrongClassReplay.replay_verified, false);

const executionReplay = await replayIndependentProvenanceVerification(verified, registry, {
  reexecuteProvider: true
});
assert.equal(executionReplay.state, 'REPLAY_HOLD');
assert.equal(executionReplay.provider_reexecuted, false);

const tampered = JSON.parse(JSON.stringify(verified));
tampered.reference.source_id = 'source_tampered';
assert.equal(await verifyIndependentProvenanceVerification(tampered, registry), false);
const tamperReplay = await replayIndependentProvenanceVerification(tampered, registry);
assert.equal(tamperReplay.state, 'REPLAY_HOLD');

console.log('ash-independent-provenance-adapters.test.mjs passed');
