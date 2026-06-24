import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry } from '../app/engine/hush-mask-gallery-registry.js';
import nolanFixtures from '../app/data/hush-phase8-fixtures/nolan-needler-fixtures.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-24T04:00:00Z' });
const nolan = registry.records.find((record) => record.mask_id === 'soft-snark');
assert.ok(nolan);
assert.equal(nolan.label, 'Nolan the Needler');
assert.equal(nolan.family, 'low heat');
assert.equal(nolan.sample_seed_policy.raw_sample_export_allowed, false);
assert.equal(nolan.claim_ceiling.not_identity_proof, true);
assert.equal(nolan.claim_ceiling.not_authorship_proof, true);
assert.equal(nolan.claim_ceiling.not_consent, true);
assert.equal(nolan.claim_ceiling.not_public_default, true);
assert.equal(nolanFixtures.length, 10);

const statuses = new Map();

for (const fixture of nolanFixtures) {
  assert.equal(fixture.source_obligation.explicit_source_obligation_required, true);
  assert.equal(fixture.source_obligation.derive_source_anchors, false);
  const packet = await buildHushPerMaskPacketWithMetricPassport(nolan, {
    stableId: true,
    createdAt: '2026-06-24T04:05:00Z',
    queue: { registry_id: registry.registry_id, registry_hash_sha256: registry.registry_hash_sha256 },
    sourceText: fixture.source_summary,
    candidate: fixture.candidate,
    sourceObligation: fixture.source_obligation,
    recentOutputs: fixture.recent_outputs || [],
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
  assert.equal(packet.stylometric_passport.mask_id, 'soft-snark');
  assert.equal(packet.stylometric_passport.role, 'low_heat_edge');
  assert.equal(packet.stylometric_passport.mask_centroid.role, 'low_heat_edge');
  assert.equal(packet.stylometric_passport.mask_centroid.variance_required, true);
  assert.ok(packet.stylometric_passport.mask_centroid.variance_dimensions.includes('sarcasm_template_uniqueness'));
  assert.equal(packet.stylometric_passport.cadence_heatmap.expectedContour, 'one-perturbation-immediate-receipt');
  assert.equal(packet.candidate_realization_vector.feature_vector.cadence_heatmap_contour, 'one-perturbation-immediate-receipt');

  const replay = await replayHushPerMaskMetricPassportHashes(packet);
  assert.equal(replay.status, 'passed');

  const status = packet.numeric_decision_surface.status;
  statuses.set(fixture.fixture_id, status);
  assert.equal(status, fixture.expected_status, `${fixture.fixture_id} expected ${fixture.expected_status} got ${status}`);
  const flags = new Set([...packet.numeric_decision_surface.failed_thresholds, ...packet.numeric_decision_surface.repair_thresholds]);
  for (const name of fixture.expected_flags || []) assert.ok(flags.has(name), `${fixture.fixture_id}:${name}`);
  for (const name of fixture.required_thresholds || []) assert.ok(packet.numeric_decision_surface.passed_thresholds.includes(name), `${fixture.fixture_id}:${name}`);
}

assert.equal(statuses.get('nolan-good-low-heat-receipt-001'), 'pass');
assert.equal(statuses.get('nolan-good-variant-receipt-001'), 'pass');
assert.equal(statuses.get('nolan-template-reuse-001'), 'repair_required');
assert.equal(statuses.get('nolan-motive-inference-001'), 'blocked');
assert.equal(statuses.get('nolan-punchline-dominance-001'), 'blocked');
assert.equal(statuses.get('nolan-flat-memo-001'), 'repair_required');
assert.equal(statuses.get('nolan-stacked-snark-001'), 'repair_required');
assert.equal(statuses.get('nolan-register-replacement-001'), 'blocked');
assert.equal(statuses.get('nolan-edge-after-receipt-001'), 'repair_required');
assert.equal(statuses.get('nolan-cross-sample-stability-001'), 'repair_required');

console.log('hush-phase8-nolan-needler-fixtures: ok');
