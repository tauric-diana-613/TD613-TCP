import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry } from '../app/engine/hush-mask-gallery-registry.js';
import blipFixtures from '../app/data/hush-phase8-fixtures/blooping-blip-fixtures.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-24T05:00:00Z' });
const blip = registry.records.find((record) => record.mask_id === 'burner-minimal');
assert.ok(blip);
assert.equal(blip.label, 'Blooping Blip');
assert.equal(blip.family, 'low signature');
assert.equal(blip.sample_seed_policy.raw_sample_export_allowed, false);
assert.equal(blip.claim_ceiling.not_identity_proof, true);
assert.equal(blip.claim_ceiling.not_authorship_proof, true);
assert.equal(blip.claim_ceiling.not_consent, true);
assert.equal(blip.claim_ceiling.not_public_default, true);
assert.equal(blipFixtures.length, 10);

const statuses = new Map();

for (const fixture of blipFixtures) {
  assert.equal(fixture.source_obligation.explicit_source_obligation_required, true);
  assert.equal(fixture.source_obligation.derive_source_anchors, false);
  const packet = await buildHushPerMaskPacketWithMetricPassport(blip, {
    stableId: true,
    createdAt: '2026-06-24T05:05:00Z',
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
  assert.equal(packet.stylometric_passport.mask_id, 'burner-minimal');
  assert.equal(packet.stylometric_passport.role, 'hyperchat_custody');
  assert.equal(packet.stylometric_passport.mask_centroid.role, 'hyperchat_custody');
  assert.equal(packet.stylometric_passport.cadence_heatmap.expectedContour, 'hyperchat-custody-semantic-compression');
  assert.equal(packet.candidate_realization_vector.feature_vector.cadence_heatmap_contour, 'hyperchat-custody-semantic-compression');

  const replay = await replayHushPerMaskMetricPassportHashes(packet);
  assert.equal(replay.status, 'passed');

  const status = packet.numeric_decision_surface.status;
  statuses.set(fixture.fixture_id, status);
  assert.equal(status, fixture.expected_status, `${fixture.fixture_id} expected ${fixture.expected_status} got ${status}`);
  const flags = new Set([...packet.numeric_decision_surface.failed_thresholds, ...packet.numeric_decision_surface.repair_thresholds]);
  for (const name of fixture.expected_flags || []) assert.ok(flags.has(name), `${fixture.fixture_id}:${name}`);
  for (const name of fixture.required_thresholds || []) assert.ok(packet.numeric_decision_surface.passed_thresholds.includes(name), `${fixture.fixture_id}:${name}`);
}

assert.equal(statuses.get('blip-high-academia-hyperchat-pass-001'), 'pass');
assert.equal(statuses.get('blip-semiotic-gravity-pass-001'), 'pass');
assert.equal(statuses.get('blip-good-dense-stream-pass-001'), 'pass');
assert.equal(statuses.get('blip-under-preservation-block-001'), 'blocked');
assert.equal(statuses.get('blip-brainrot-without-custody-block-001'), 'blocked');
assert.equal(statuses.get('blip-fake-chat-overlay-repair-001'), 'repair_required');
assert.equal(statuses.get('blip-technical-noun-deletion-repair-001'), 'repair_required');
assert.equal(statuses.get('blip-joke-eats-gravity-block-001'), 'blocked');
assert.equal(statuses.get('blip-pixie-leakage-repair-001'), 'repair_required');
assert.equal(statuses.get('blip-academic-cadence-repair-001'), 'repair_required');

console.log('hush-phase8-blooping-blip-fixtures: ok');
