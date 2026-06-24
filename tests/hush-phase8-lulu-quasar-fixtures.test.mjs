import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry } from '../app/engine/hush-mask-gallery-registry.js';
import fixtures from '../app/data/hush-phase8-fixtures/lulu-quasar-fixtures.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-24T07:00:00Z' });
const lulu = registry.records.find((record) => record.mask_id === 'quirky-orbit');
assert.ok(lulu);
assert.equal(lulu.label, 'Lulu Quasar');
assert.equal(lulu.family, 'strange distance');
assert.equal(lulu.sample_seed_policy.raw_sample_export_allowed, false);
assert.equal(lulu.claim_ceiling.not_identity_proof, true);
assert.equal(lulu.claim_ceiling.not_authorship_proof, true);
assert.equal(lulu.claim_ceiling.not_consent, true);
assert.equal(lulu.claim_ceiling.not_public_default, true);
assert.equal(fixtures.length, 10);

const statuses = new Map();
const passPackets = [];

for (const fixture of fixtures) {
  assert.equal(fixture.source_obligation.explicit_source_obligation_required, true);
  assert.equal(fixture.source_obligation.derive_source_anchors, false);
  const packet = await buildHushPerMaskPacketWithMetricPassport(lulu, {
    stableId: true,
    createdAt: '2026-06-24T07:05:00Z',
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
  assert.equal(packet.stylometric_passport.mask_id, 'quirky-orbit');
  assert.equal(packet.stylometric_passport.role, 'blue_orange_relief');
  assert.equal(packet.stylometric_passport.mask_centroid.role, 'blue_orange_relief');
  assert.equal(packet.stylometric_passport.cadence_heatmap.expectedContour, 'blue-orange-relief-custody-return');
  assert.equal(packet.candidate_realization_vector.feature_vector.cadence_heatmap_contour, 'blue-orange-relief-custody-return');

  const replay = await replayHushPerMaskMetricPassportHashes(packet);
  assert.equal(replay.status, 'passed');

  const status = packet.numeric_decision_surface.status;
  statuses.set(fixture.fixture_id, status);
  assert.equal(status, fixture.expected_status, `${fixture.fixture_id} expected ${fixture.expected_status} got ${status}`);
  if (status === 'pass') passPackets.push(packet);
  const flags = new Set([...(packet.numeric_decision_surface.failed_thresholds || []), ...(packet.numeric_decision_surface.repair_thresholds || [])]);
  for (const name of fixture.expected_flags || []) assert.ok(flags.has(name), `${fixture.fixture_id}:${name}`);
  for (const name of fixture.required_thresholds || []) assert.ok(packet.numeric_decision_surface.passed_thresholds.includes(name), `${fixture.fixture_id}:${name}`);
}

assert.equal(statuses.get('lulu-good-paperwork-comet-001'), 'pass');
assert.equal(statuses.get('lulu-good-evidence-canoe-001'), 'pass');
assert.equal(statuses.get('lulu-good-soup-gravity-001'), 'pass');
assert.equal(statuses.get('lulu-mascot-drift-block-001'), 'blocked');
assert.equal(statuses.get('lulu-lost-anchor-block-001'), 'blocked');
assert.equal(statuses.get('lulu-gravity-collapse-block-001'), 'blocked');
assert.equal(statuses.get('lulu-too-normal-repair-001'), 'repair_required');
assert.equal(statuses.get('lulu-alien-parody-block-001'), 'blocked');
assert.equal(statuses.get('lulu-prop-hoard-block-001'), 'blocked');
assert.equal(statuses.get('lulu-blip-leakage-repair-001'), 'repair_required');

for (const packet of passPackets) {
  const f = packet.candidate_realization_vector.feature_vector;
  assert.equal(packet.candidate_realization_vector.source_retention.mandatory_anchor_retention, 1);
  assert.equal(f.odd_image_count, 1);
  assert.equal(f.repeated_image_risk, 0);
  assert.ok(f.emotional_gravity_retention >= 0.72);
  assert.ok(f.anchor_return_latency <= 0.6);
}

console.log('hush-phase8-lulu-quasar-fixtures: ok');
