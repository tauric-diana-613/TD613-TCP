import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry, summarizePhase7RegistryForPhase8 } from '../app/engine/hush-mask-gallery-registry.js';
import keishaSoftCircleFixtures from '../app/data/hush-phase8-fixtures/keisha-soft-circle-fixtures.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-20T00:00:00Z' });
const handoff = summarizePhase7RegistryForPhase8(registry);
const keisha = handoff.masks.find((mask) => mask.mask_id === 'group-chat-soft');
assert.ok(keisha, 'group-chat-soft should be present in Phase 7 handoff');
assert.equal(keisha.label, 'Keisha Soft Circle');
assert.equal(keisha.family, 'small circle');
assert.equal(keishaSoftCircleFixtures.length, 7);

function statusFor(packet) {
  return packet.numeric_decision_surface.status;
}

function flagsFor(packet) {
  return new Set([...packet.numeric_decision_surface.failed_thresholds, ...packet.numeric_decision_surface.repair_thresholds]);
}

for (const fixture of keishaSoftCircleFixtures) {
  assert.equal(fixture.source_obligation?.explicit_source_obligation_required, true, `${fixture.fixture_id} requires explicit source obligations`);
  assert.equal(fixture.source_obligation?.derive_source_anchors, false, `${fixture.fixture_id} disables heuristic source anchors`);
  const packet = await buildHushPerMaskPacketWithMetricPassport(keisha, {
    stableId: true,
    createdAt: '2026-06-20T00:04:00Z',
    queue: { registry_id: handoff.registry_id, registry_hash_sha256: handoff.registry_hash_sha256 },
    sourceText: fixture.source_summary,
    candidate: fixture.candidate,
    sourceObligation: fixture.source_obligation,
    featureVector: fixture.feature_options || {},
    sourceRetention: fixture.source_retention_options || {}
  });

  assert.equal(packet.schema, 'td613.hush.phase8.metric-passport-wrapper/v1');
  assert.equal(packet.entrypoint_assertion.status, 'passed');
  assert.equal(packet.candidate_presence_gate.status, 'passed');
  assert.equal(packet.candidate_realization_vector.raw_candidate_included, false);
  assert.equal(packet.raw_candidate_included, false);
  assert.equal(packet.raw_sample_text_included, false);
  assert.equal(packet.public_default_allowed, false);
  assert.equal(packet.source_obligation_set.explicit_source_obligation_required, true);
  assert.equal(packet.source_obligation_set.derive_source_anchors, false);
  assert.equal(packet.stylometric_passport.mask_id, 'group-chat-soft');
  assert.equal(packet.stylometric_passport.mask_centroid.role, 'small circle');
  assert.equal(packet.stylometric_passport.tolerance_bands.relational_proximity_score_min, 0.18);

  const replay = await replayHushPerMaskMetricPassportHashes(packet);
  assert.equal(replay.status, 'passed', `${fixture.fixture_id} metric replay should pass`);

  const status = statusFor(packet);
  const flags = flagsFor(packet);
  assert.equal(status, fixture.expected_status, `${fixture.fixture_id} expected ${fixture.expected_status} got ${status}`);

  for (const name of fixture.required_thresholds || []) {
    assert.ok(packet.numeric_decision_surface.passed_thresholds.includes(name), `${fixture.fixture_id} missing pass threshold ${name}`);
  }
  for (const name of fixture.forbidden_thresholds || []) {
    assert.equal(flags.has(name), false, `${fixture.fixture_id} should not flag ${name}`);
  }
  for (const name of fixture.expected_flags || []) {
    assert.ok(flags.has(name), `${fixture.fixture_id} should expose ${name}`);
  }
}

console.log('hush-phase8-keisha-soft-circle-fixtures: ok');
