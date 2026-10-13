import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry } from '../app/engine/hush-mask-gallery-registry.js';
import queenieFixtures from '../app/data/hush-phase8-fixtures/receipts-queenie-fixtures.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-24T00:00:00Z' });
const queenie = registry.records.find((record) => record.mask_id === 'grandma-receipts');
assert.ok(queenie, 'grandma-receipts should be present in Phase 7 registry');
assert.equal(queenie.label, 'Receipts Queenie');
assert.equal(queenie.family, 'warm receipts');
assert.equal(queenie.gallery_role, 'warm_receipts');
assert.equal(queenie.sample_seed_policy.raw_sample_export_allowed, false);
assert.equal(queenie.claim_ceiling.not_identity_proof, true);
assert.equal(queenie.claim_ceiling.not_authorship_proof, true);
assert.equal(queenie.claim_ceiling.not_consent, true);
assert.equal(queenie.claim_ceiling.not_public_default, true);
assert.equal(queenieFixtures.length, 10);

const statuses = new Map();

for (const fixture of queenieFixtures) {
  assert.equal(fixture.source_obligation.explicit_source_obligation_required, true, `${fixture.fixture_id}: explicit source obligations required`);
  assert.equal(fixture.source_obligation.derive_source_anchors, false, `${fixture.fixture_id}: heuristic anchors disabled`);
  const packet = await buildHushPerMaskPacketWithMetricPassport(queenie, {
    stableId: true,
    createdAt: '2026-06-24T00:05:00Z',
    queue: { registry_id: registry.registry_id, registry_hash_sha256: registry.registry_hash_sha256 },
    sourceText: fixture.source_summary,
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
  assert.equal(packet.source_obligation_set.explicit_source_obligation_required, true);
  assert.equal(packet.source_obligation_set.derive_source_anchors, false);
  assert.equal(packet.stylometric_passport.mask_id, 'grandma-receipts');
  assert.equal(packet.stylometric_passport.role, 'warm_receipts');
  assert.equal(packet.stylometric_passport.mask_centroid.role, 'warm_receipts');
  assert.equal(packet.stylometric_passport.mask_centroid.centroid_features.warmth_to_custody_ratio, 0.58);
  assert.equal(packet.stylometric_passport.cadence_heatmap.expectedContour, 'warm-envelope-hard-latch');
  assert.ok(packet.stylometric_passport.cadence_heatmap.forbiddenContours.includes('small-circle-cluster'));
  assert.ok(packet.stylometric_passport.cadence_heatmap.forbiddenContours.includes('adversarial-fracture-shard'));
  assert.equal(packet.candidate_realization_vector.feature_vector.cadence_heatmap_contour, 'warm-envelope-hard-latch');

  const replay = await replayHushPerMaskMetricPassportHashes(packet);
  assert.equal(replay.status, 'passed', `${fixture.fixture_id} metric replay should pass`);

  const status = packet.numeric_decision_surface.status;
  statuses.set(fixture.fixture_id, status);
  assert.equal(status, fixture.expected_status, `${fixture.fixture_id} expected ${fixture.expected_status} got ${status}`);
  const flags = new Set([...packet.numeric_decision_surface.failed_thresholds, ...packet.numeric_decision_surface.repair_thresholds]);
  for (const name of fixture.expected_flags || []) assert.ok(flags.has(name), `${fixture.fixture_id}:${name}`);
  for (const name of fixture.required_thresholds || []) assert.ok(packet.numeric_decision_surface.passed_thresholds.includes(name), `${fixture.fixture_id}:${name}`);
}

assert.equal(statuses.get('queenie-good-warm-receipt-001'), 'pass', 'known-good warm receipt should pass');
assert.equal(statuses.get('queenie-good-bounded-story-warmth-001'), 'pass', 'bounded story warmth should pass');
assert.equal(statuses.get('queenie-family-scene-invention-001'), 'blocked', 'family-scene invention should block');
assert.equal(statuses.get('queenie-gossip-contamination-001'), 'blocked', 'gossip contamination should block');
assert.equal(statuses.get('queenie-extra-backstory-addition-001'), 'blocked', 'extra backstory should block');
assert.equal(statuses.get('queenie-memo-polish-flattening-001'), 'repair_required', 'memo polish should repair');
assert.equal(statuses.get('queenie-rex-leakage-001'), 'repair_required', 'Rex leakage should repair');
assert.equal(statuses.get('queenie-receipt-scold-001'), 'repair_required', 'receipt scold should repair');

console.log('hush-phase8-receipts-queenie-fixtures: ok');
