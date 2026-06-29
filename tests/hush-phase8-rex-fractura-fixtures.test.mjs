import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry } from '../app/engine/hush-mask-gallery-registry.js';
import rexFixtures from '../app/data/hush-phase8-fixtures/rex-fractura-fixtures.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-20T00:00:00Z' });
const rex = registry.records.find((record) => record.mask_id === 'phase22-jagged-record');
assert.ok(rex, 'phase22-jagged-record should be present in Phase 7 registry');
assert.equal(rex.label, 'Rex Fractura');
assert.equal(rex.family, 'jagged note');
assert.equal(rex.sample_seed_policy.raw_sample_export_allowed, false);
assert.equal(rex.claim_ceiling.not_identity_proof, true);
assert.equal(rex.claim_ceiling.not_authorship_proof, true);
assert.equal(rex.claim_ceiling.not_consent, true);
assert.equal(rex.claim_ceiling.not_public_default, true);
assert.equal(rexFixtures.length, 10);

for (const fixture of rexFixtures) {
  assert.equal(fixture.source_obligation.explicit_source_obligation_required, true, `${fixture.fixture_id}: explicit source obligations required`);
  assert.equal(fixture.source_obligation.derive_source_anchors, false, `${fixture.fixture_id}: heuristic anchors disabled`);
  const packet = await buildHushPerMaskPacketWithMetricPassport(rex, {
    stableId: true,
    createdAt: '2026-06-20T00:05:00Z',
    queue: { registry_id: registry.registry_id, registry_hash_sha256: registry.registry_hash_sha256 },
    sourceText: fixture.source_summary,
    candidate: fixture.candidate,
    sourceObligation: fixture.source_obligation,
    featureVector: fixture.feature_options || {},
    unicodePerturbation: fixture.unicode_perturbation || null
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
  assert.equal(packet.stylometric_passport.mask_id, 'phase22-jagged-record');
  assert.equal(packet.stylometric_passport.role, 'adversarial_fracture');
  assert.equal(packet.stylometric_passport.mask_centroid.role, 'adversarial_fracture');
  assert.equal(packet.stylometric_passport.tolerance_bands.human_recoverability_score_min, 0.7);

  if (fixture.unicode_perturbation) {
    assert.equal(packet.unicode_perturbation_envelope.schema, 'td613.hush.phase8.unicode-perturbation-envelope/v1');
    assert.equal(packet.unicode_perturbation_envelope.raw_candidate_included, false);
    assert.equal(packet.unicode_perturbation_envelope.raw_recovery_text_included, false);
    assert.equal(packet.unicode_perturbation_envelope.raw_perturbation_map_included, false);
    assert.equal(packet.candidate_realization_vector.feature_vector.perturbation_map_present, 1);
  }

  const replay = await replayHushPerMaskMetricPassportHashes(packet);
  assert.equal(replay.status, 'passed', `${fixture.fixture_id} metric replay should pass`);

  const status = packet.numeric_decision_surface.status;
  assert.equal(status, fixture.expected_status, `${fixture.fixture_id} expected ${fixture.expected_status} got ${status}`);
  const flags = new Set([...packet.numeric_decision_surface.failed_thresholds, ...packet.numeric_decision_surface.repair_thresholds]);
  for (const name of fixture.expected_flags || []) assert.ok(flags.has(name), `${fixture.fixture_id}:${name}`);
  for (const name of fixture.required_thresholds || []) assert.ok(packet.numeric_decision_surface.passed_thresholds.includes(name), `${fixture.fixture_id}:${name}`);
}

console.log('hush-phase8-rex-fractura-fixtures: ok');
