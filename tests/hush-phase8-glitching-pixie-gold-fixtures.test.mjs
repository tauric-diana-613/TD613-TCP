import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry, summarizePhase7RegistryForPhase8 } from '../app/engine/hush-mask-gallery-registry.js';
import glitchingPixieFixtures from '../app/data/hush-phase8-fixtures/glitching-pixie-fixtures.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-20T00:00:00Z' });
const handoff = summarizePhase7RegistryForPhase8(registry);
const pixie = handoff.masks.find((mask) => mask.mask_id === 'phase28-transform-to-chatspeak');
assert.ok(pixie);
assert.equal(glitchingPixieFixtures.length, 5);

function statusFor(packet) {
  return packet.numeric_decision_surface.status;
}
function flagsFor(packet) {
  return new Set([...packet.numeric_decision_surface.failed_thresholds, ...packet.numeric_decision_surface.repair_thresholds]);
}
const sourceObligation = {
  derive_source_anchors: false,
  mandatory_anchors: ['FILE-72', 'export', 'minute', 'copy', 'footer', 'mismatch', 'review'],
  optional_anchors: [],
  must_preserve_score_floor: 1
};

for (const fixture of glitchingPixieFixtures) {
  const packet = await buildHushPerMaskPacketWithMetricPassport(pixie, {
    stableId: true,
    createdAt: '2026-06-20T00:03:00Z',
    queue: { registry_id: handoff.registry_id, registry_hash_sha256: handoff.registry_hash_sha256 },
    sourceText: fixture.source_summary,
    candidate: fixture.candidate,
    sourceObligation,
    featureVector: fixture.feature_options || {},
    sourceRetention: fixture.feature_options || {}
  });
  assert.equal(packet.schema, 'td613.hush.phase8.metric-passport-wrapper/v1');
  assert.equal(packet.entrypoint_assertion.status, 'passed');
  assert.equal(packet.raw_candidate_included, false);
  assert.equal(packet.raw_sample_text_included, false);
  assert.equal(packet.public_default_allowed, false);
  const replay = await replayHushPerMaskMetricPassportHashes(packet);
  assert.equal(replay.status, 'passed');

  const status = statusFor(packet);
  const flags = flagsFor(packet);
  if (fixture.expected_status === 'pass') {
    assert.equal(status, 'pass', `${fixture.fixture_id} should pass`);
    for (const name of fixture.required_thresholds) assert.ok(packet.numeric_decision_surface.passed_thresholds.includes(name), `${fixture.fixture_id} missing pass threshold ${name}`);
    for (const name of fixture.forbidden_thresholds) assert.equal(flags.has(name), false, `${fixture.fixture_id} should not flag ${name}`);
  } else if (fixture.expected_status === 'blocked') {
    assert.equal(status, 'blocked', `${fixture.fixture_id} should block`);
    assert.ok(fixture.expected_flags.some((name) => flags.has(name)), `${fixture.fixture_id} should expose at least one expected flag`);
  } else {
    assert.ok(['repair_required', 'blocked'].includes(status), `${fixture.fixture_id} should repair or block`);
    assert.ok(fixture.expected_flags.some((name) => flags.has(name)), `${fixture.fixture_id} should expose at least one expected flag`);
  }
}

console.log('hush-phase8-glitching-pixie-gold-fixtures: ok');
