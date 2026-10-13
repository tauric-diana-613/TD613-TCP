import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry } from '../app/engine/hush-mask-gallery-registry.js';
import blackstarFixtures from '../app/data/hush-phase8-fixtures/blackstar-sheree-fixtures.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-24T16:30:00Z' });
const sheree = registry.records.find((record) => record.mask_id === 'phase28-transform-to-aave');
assert.ok(sheree);
assert.equal(sheree.label, 'Blackstar Shereé');
assert.equal(sheree.family, 'target register');
assert.equal(sheree.internalRegister, 'AAVE');
assert.equal(sheree.sample_seed_policy.raw_sample_export_allowed, false);
assert.equal(sheree.claim_ceiling.not_identity_proof, true);
assert.equal(sheree.claim_ceiling.not_authorship_proof, true);
assert.equal(sheree.claim_ceiling.not_consent, true);
assert.equal(sheree.claim_ceiling.not_public_default, true);
assert.equal(blackstarFixtures.length, 10);

const statuses = new Map();

for (const fixture of blackstarFixtures) {
  assert.equal(fixture.source_obligation.explicit_source_obligation_required, true);
  assert.equal(fixture.source_obligation.derive_source_anchors, false);
  const packet = await buildHushPerMaskPacketWithMetricPassport(sheree, {
    stableId: true,
    createdAt: '2026-06-24T16:35:00Z',
    queue: { registry_id: registry.registry_id, registry_hash_sha256: registry.registry_hash_sha256 },
    sourceText: fixture.source_summary,
    candidate: fixture.candidate,
    sourceObligation: fixture.source_obligation,
    featureVector: fixture.feature_options || {}
  });

  assert.equal(packet.schema, 'td613.hush.phase8.metric-passport-wrapper/v1');
  assert.equal(packet.entrypoint_assertion.status, 'passed');
  if (fixture.expected_flags?.includes('source_candidate_separation')) {
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
  assert.equal(packet.stylometric_passport.mask_id, 'phase28-transform-to-aave');
  assert.equal(packet.stylometric_passport.role, 'chosen_target_register');
  assert.equal(packet.stylometric_passport.mask_centroid.role, 'chosen_target_register');
  assert.equal(packet.stylometric_passport.mask_centroid.internal_register, 'AAVE');
  assert.equal(packet.stylometric_passport.mask_centroid.cultural_review_required, true);
  assert.equal(packet.stylometric_passport.cadence_heatmap.expectedContour, 'chosen-target-register-fact-custody');
  assert.equal(packet.candidate_realization_vector.feature_vector.cadence_heatmap_contour, 'chosen-target-register-fact-custody');

  const replay = await replayHushPerMaskMetricPassportHashes(packet);
  assert.equal(replay.status, 'passed');

  const status = packet.numeric_decision_surface.status;
  statuses.set(fixture.fixture_id, status);
  assert.equal(status, fixture.expected_status, `${fixture.fixture_id} expected ${fixture.expected_status} got ${status}`);
  const flags = new Set([
    ...packet.numeric_decision_surface.failed_thresholds,
    ...packet.numeric_decision_surface.repair_thresholds,
    ...(packet.numeric_decision_surface.review_thresholds || [])
  ]);
  for (const name of fixture.expected_flags || []) assert.ok(flags.has(name), `${fixture.fixture_id}:${name}`);
  for (const name of fixture.required_thresholds || []) assert.ok(packet.numeric_decision_surface.passed_thresholds.includes(name), `${fixture.fixture_id}:${name}`);
}

assert.equal(statuses.get('sheree-good-full-coverage-001'), 'pass');
assert.equal(statuses.get('sheree-technical-mechanism-survival-001'), 'pass');
assert.equal(statuses.get('sheree-good-argument-density-001'), 'pass');
assert.equal(statuses.get('sheree-costume-overlay-block-001'), 'blocked');
assert.equal(statuses.get('sheree-assistant-polish-repair-001'), 'repair_required');
assert.equal(statuses.get('sheree-proposition-drop-block-001'), 'blocked');
assert.equal(statuses.get('sheree-technical-noun-deletion-repair-001'), 'blocked');
assert.equal(statuses.get('sheree-source-shadow-repair-001'), 'blocked');
assert.equal(statuses.get('sheree-cultural-review-trigger-001'), 'cultural_review_required');
assert.equal(statuses.get('sheree-respectability-laundering-repair-001'), 'repair_required');

console.log('hush-phase8-blackstar-sheree-fixtures: ok');
