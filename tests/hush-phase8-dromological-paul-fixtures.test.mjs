import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry } from '../app/engine/hush-mask-gallery-registry.js';
import fixtures from '../app/data/hush-phase8-fixtures/dromological-paul-fixtures.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-24T08:00:00Z' });
const paul = registry.records.find((record) => record.mask_id === 'forum-regular');
assert.ok(paul);
assert.equal(paul.label, 'Dromological Paul');
assert.equal(paul.family, 'forum pseudonym');
assert.equal(paul.sample_seed_policy.raw_sample_export_allowed, false);
assert.equal(paul.claim_ceiling.not_identity_proof, true);
assert.equal(paul.claim_ceiling.not_authorship_proof, true);
assert.equal(paul.claim_ceiling.not_consent, true);
assert.equal(paul.claim_ceiling.not_public_default, true);
assert.equal(fixtures.length, 10);

const statuses = new Map();
const passPackets = [];

for (const fixture of fixtures) {
  assert.equal(fixture.source_obligation.explicit_source_obligation_required, true);
  assert.equal(fixture.source_obligation.derive_source_anchors, false);
  const packet = await buildHushPerMaskPacketWithMetricPassport(paul, {
    stableId: true,
    createdAt: '2026-06-24T08:05:00Z',
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
  assert.equal(packet.stylometric_passport.mask_id, 'forum-regular');
  assert.equal(packet.stylometric_passport.role, 'public_forum_dromology');
  assert.equal(packet.stylometric_passport.mask_centroid.role, 'public_forum_dromology');
  assert.equal(packet.stylometric_passport.cadence_heatmap.expectedContour, 'public-forum-dromological-slowdown');
  assert.equal(packet.candidate_realization_vector.feature_vector.cadence_heatmap_contour, 'public-forum-dromological-slowdown');

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

assert.equal(statuses.get('paul-good-slowdown-001'), 'pass');
assert.equal(statuses.get('paul-good-anti-overclaim-001'), 'pass');
assert.equal(statuses.get('paul-good-anti-compression-001'), 'pass');
assert.equal(statuses.get('paul-source-leakage-block-001'), 'blocked');
assert.equal(statuses.get('paul-fact-invention-block-001'), 'blocked');
assert.equal(statuses.get('paul-generic-ai-repair-001'), 'repair_required');
assert.equal(statuses.get('paul-too-compressed-repair-001'), 'repair_required');
assert.equal(statuses.get('paul-topic-exposure-block-001'), 'blocked');
assert.equal(statuses.get('paul-threadlord-block-001'), 'blocked');
assert.equal(statuses.get('paul-human-quirk-repair-001'), 'repair_required');

for (const packet of passPackets) {
  const f = packet.candidate_realization_vector.feature_vector;
  assert.equal(packet.candidate_realization_vector.source_retention.mandatory_anchor_retention, 1);
  assert.ok(f.information_decompression_score >= 0.7);
  assert.ok(f.no_new_fact_expansion_score >= 0.94);
  assert.ok(f.topic_specificity_exposure_risk <= 0.16);
  assert.ok(f.private_history_leakage_risk <= 0.04);
}

console.log('hush-phase8-dromological-paul-fixtures: ok');
