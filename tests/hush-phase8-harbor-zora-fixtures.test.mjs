import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry } from '../app/engine/hush-mask-gallery-registry.js';
import zoraFixtures from '../app/data/hush-phase8-fixtures/harbor-zora-fixtures.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-24T03:00:00Z' });
const zora = registry.records.find((record) => record.mask_id === 'phase27-register-preserve');
assert.ok(zora);
assert.equal(zora.sample_seed_policy.raw_sample_export_allowed, false);
assert.equal(zora.claim_ceiling.not_identity_proof, true);
assert.equal(zora.claim_ceiling.not_authorship_proof, true);
assert.equal(zora.claim_ceiling.not_consent, true);
assert.equal(zora.claim_ceiling.not_public_default, true);
assert.equal(zoraFixtures.length, 10);

const statuses = new Map();

for (const fixture of zoraFixtures) {
  assert.equal(fixture.source_obligation.explicit_source_obligation_required, true);
  assert.equal(fixture.source_obligation.derive_source_anchors, false);
  const packet = await buildHushPerMaskPacketWithMetricPassport(zora, {
    stableId: true,
    createdAt: '2026-06-24T03:05:00Z',
    queue: { registry_id: registry.registry_id, registry_hash_sha256: registry.registry_hash_sha256 },
    sourceText: fixture.source_obligation_summary,
    sourceRegisterText: fixture.source_summary,
    candidate: fixture.candidate,
    sourceObligation: fixture.source_obligation,
    featureVector: fixture.feature_options || {}
  });

  assert.equal(packet.schema, 'td613.hush.phase8.metric-passport-wrapper/v1');
  assert.equal(packet.entrypoint_assertion.status, 'passed');
  assert.equal(packet.candidate_presence_gate.status, 'passed');
  assert.equal(packet.raw_candidate_included, false);
  assert.equal(packet.candidate_realization_vector.raw_candidate_included, false);
  assert.equal(packet.raw_sample_text_included, false);
  assert.equal(packet.public_default_allowed, false);
  assert.equal(packet.source_obligation_set.raw_source_included, false);
  assert.equal(packet.source_obligation_set.explicit_source_obligation_required, true);
  assert.equal(packet.source_obligation_set.derive_source_anchors, false);
  assert.equal(packet.stylometric_passport.mask_id, 'phase27-register-preserve');
  assert.equal(packet.stylometric_passport.role, 'source_register');
  assert.equal(packet.stylometric_passport.mask_centroid.role, 'source_register');
  assert.equal(packet.stylometric_passport.mask_centroid.source_adaptive, true);
  assert.ok(packet.stylometric_passport.mask_centroid.adaptive_dimensions.includes('idiolect_fingerprint_reduction'));
  assert.equal(packet.stylometric_passport.cadence_heatmap.expectedContour, 'source-shadow-displaced-fingerprint');
  assert.equal(packet.candidate_realization_vector.feature_vector.cadence_heatmap_contour, 'source-shadow-displaced-fingerprint');

  const replay = await replayHushPerMaskMetricPassportHashes(packet);
  assert.equal(replay.status, 'passed');

  const status = packet.numeric_decision_surface.status;
  statuses.set(fixture.fixture_id, status);
  assert.equal(status, fixture.expected_status, `${fixture.fixture_id} expected ${fixture.expected_status} got ${status}`);
  const flags = new Set([...packet.numeric_decision_surface.failed_thresholds, ...packet.numeric_decision_surface.repair_thresholds]);
  for (const name of fixture.expected_flags || []) assert.ok(flags.has(name), `${fixture.fixture_id}:${name}`);
  for (const name of fixture.required_thresholds || []) assert.ok(packet.numeric_decision_surface.passed_thresholds.includes(name), `${fixture.fixture_id}:${name}`);
}

assert.equal(statuses.get('zora-good-source-register-harbor-001'), 'pass');
assert.equal(statuses.get('zora-good-hedge-rotation-001'), 'pass');
assert.equal(statuses.get('zora-good-relation-retention-001'), 'pass');
assert.equal(statuses.get('zora-over-held-source-001'), 'blocked');
assert.equal(statuses.get('zora-bleached-institutional-voice-001'), 'repair_required');
assert.equal(statuses.get('zora-certainty-inflation-001'), 'blocked');
assert.equal(statuses.get('zora-false-harbor-claim-001'), 'blocked');
assert.equal(statuses.get('zora-invented-reassurance-001'), 'blocked');
assert.equal(statuses.get('zora-register-replacement-001'), 'blocked');
assert.equal(statuses.get('zora-over-opacity-meaning-loss-001'), 'blocked');

console.log('hush-phase8-harbor-zora-fixtures: ok');
