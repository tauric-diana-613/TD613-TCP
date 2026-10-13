import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry } from '../app/engine/hush-mask-gallery-registry.js';
import fixtures from '../app/data/hush-phase8-fixtures/luz-index-fixtures.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-24T08:00:00Z' });
const luz = registry.records.find((record) => record.mask_id === 'clipboard');
assert.ok(luz);
assert.equal(luz.label, 'Luz of the Index');
assert.equal(luz.family, 'custodial index');
assert.equal(luz.sample_seed_policy.raw_sample_export_allowed, false);
assert.equal(luz.claim_ceiling.not_identity_proof, true);
assert.equal(luz.claim_ceiling.not_authorship_proof, true);
assert.equal(luz.claim_ceiling.not_consent, true);
assert.equal(luz.claim_ceiling.not_public_default, true);
assert.equal(fixtures.length, 10);

const statuses = new Map();
const passPackets = [];

for (const fixture of fixtures) {
  assert.equal(fixture.source_obligation.explicit_source_obligation_required, true);
  assert.equal(fixture.source_obligation.derive_source_anchors, false);
  const packet = await buildHushPerMaskPacketWithMetricPassport(luz, {
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
  if (fixture.fixture_id === 'luz-source-cadence-leakage-repair-001') {
    assert.equal(packet.candidate_presence_gate.status, 'blocked');
  } else {
    assert.equal(packet.candidate_presence_gate.status, 'passed');
  }
  assert.equal(packet.raw_candidate_included, false);
  assert.equal(packet.candidate_realization_vector.raw_candidate_included, false);
  assert.equal(packet.raw_sample_text_included, false);
  assert.equal(packet.public_default_allowed, false);
  assert.equal(packet.source_obligation_set.explicit_source_obligation_required, true);
  assert.equal(packet.source_obligation_set.derive_source_anchors, false);
  assert.equal(packet.stylometric_passport.mask_id, 'clipboard');
  assert.equal(packet.stylometric_passport.role, 'custodial_index');
  assert.equal(packet.stylometric_passport.mask_centroid.role, 'custodial_index');
  assert.equal(packet.stylometric_passport.cadence_heatmap.expectedContour, 'custodial-index-tender-itemization');
  assert.equal(packet.candidate_realization_vector.feature_vector.cadence_heatmap_contour, 'custodial-index-tender-itemization');

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

assert.equal(statuses.get('luz-good-bundle-index-001'), 'pass');
assert.equal(statuses.get('luz-good-reader-support-001'), 'pass');
assert.equal(statuses.get('luz-good-do-not-split-001'), 'pass');
assert.equal(statuses.get('luz-mechanical-coldness-repair-001'), 'repair_required');
assert.equal(statuses.get('luz-false-completion-block-001'), 'blocked');
assert.equal(statuses.get('luz-vague-index-block-001'), 'blocked');
assert.equal(statuses.get('luz-project-manager-block-001'), 'blocked');
assert.equal(statuses.get('luz-relationship-missing-repair-001'), 'repair_required');
assert.equal(statuses.get('luz-over-indexing-repair-001'), 'repair_required');
assert.equal(statuses.get('luz-source-cadence-leakage-repair-001'), 'blocked');

for (const packet of passPackets) {
  const f = packet.candidate_realization_vector.feature_vector;
  assert.equal(packet.candidate_realization_vector.source_retention.mandatory_anchor_retention, 1);
  assert.ok(f.index_integrity_score >= 0.82);
  assert.ok(f.relationship_retention_score >= 0.8);
  assert.ok(f.format_dominance_score >= 0.78);
  assert.equal(packet.numeric_decision_surface.failed_thresholds.length, 0);
}

console.log('hush-phase8-luz-index-fixtures: ok');
