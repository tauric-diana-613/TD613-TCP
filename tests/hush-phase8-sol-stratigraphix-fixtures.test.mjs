import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry } from '../app/engine/hush-mask-gallery-registry.js';
import solFixtures from '../app/data/hush-phase8-fixtures/sol-stratigraphix-fixtures.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-24T00:00:00Z' });
const sol = registry.records.find((record) => record.mask_id === 'library-ghost');
assert.ok(sol, 'library-ghost should be present in Phase 7 registry');
assert.equal(sol.label, 'Sol Stratigraphix');
assert.equal(sol.family, 'document distance');
assert.equal(sol.gallery_role, 'document_distance');
assert.equal(sol.sample_seed_policy.raw_sample_export_allowed, false);
assert.equal(sol.claim_ceiling.not_identity_proof, true);
assert.equal(sol.claim_ceiling.not_authorship_proof, true);
assert.equal(sol.claim_ceiling.not_consent, true);
assert.equal(sol.claim_ceiling.not_public_default, true);
assert.equal(solFixtures.length, 12);

const statuses = new Map();

for (const fixture of solFixtures) {
  assert.equal(fixture.source_obligation.explicit_source_obligation_required, true, `${fixture.fixture_id}: explicit source obligations required`);
  assert.equal(fixture.source_obligation.derive_source_anchors, false, `${fixture.fixture_id}: heuristic anchors disabled`);
  const packet = await buildHushPerMaskPacketWithMetricPassport(sol, {
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
  assert.equal(packet.stylometric_passport.mask_id, 'library-ghost');
  assert.equal(packet.stylometric_passport.role, 'document_distance');
  assert.equal(packet.stylometric_passport.mask_centroid.role, 'document_distance');
  assert.equal(packet.stylometric_passport.mask_centroid.centroid_features.archival_coolness_score, 0.66);
  assert.equal(packet.stylometric_passport.cadence_heatmap.expectedContour, 'cold-ledger-mild-haunt');
  assert.ok(packet.stylometric_passport.cadence_heatmap.forbiddenContours.includes('warm-envelope-hard-latch'));
  assert.ok(packet.stylometric_passport.cadence_heatmap.forbiddenContours.includes('adversarial-fracture-shard'));
  assert.equal(packet.candidate_realization_vector.feature_vector.cadence_heatmap_contour, 'cold-ledger-mild-haunt');
  assert.equal(packet.candidate_realization_vector.feature_vector.ghost_prop_rate <= packet.stylometric_passport.tolerance_bands.ghost_prop_rate_max, fixture.expected_status === 'blocked' ? packet.candidate_realization_vector.feature_vector.ghost_prop_rate <= 0 : true);

  const replay = await replayHushPerMaskMetricPassportHashes(packet);
  assert.equal(replay.status, 'passed', `${fixture.fixture_id} metric replay should pass`);

  const status = packet.numeric_decision_surface.status;
  statuses.set(fixture.fixture_id, status);
  assert.equal(status, fixture.expected_status, `${fixture.fixture_id} expected ${fixture.expected_status} got ${status}`);
  const flags = new Set([...packet.numeric_decision_surface.failed_thresholds, ...packet.numeric_decision_surface.repair_thresholds]);
  for (const name of fixture.expected_flags || []) assert.ok(flags.has(name), `${fixture.fixture_id}:${name}`);
  for (const name of fixture.required_thresholds || []) assert.ok(packet.numeric_decision_surface.passed_thresholds.includes(name), `${fixture.fixture_id}:${name}`);
}

assert.equal(statuses.get('sol-good-document-distance-001'), 'pass', 'known-good document distance should pass');
assert.equal(statuses.get('sol-future-archaic-common-cadence-001'), 'pass', 'future-archaic common cadence should pass');
assert.equal(statuses.get('sol-thin-atmosphere-correct-custody-001'), 'pass', 'thin-atmosphere custody should pass');
assert.equal(statuses.get('sol-over-haunted-prop-001'), 'blocked', 'over-haunted prop should block');
assert.equal(statuses.get('sol-gothic-archive-theater-001'), 'blocked', 'archive theater should block');
assert.equal(statuses.get('sol-mood-without-custody-001'), 'blocked', 'mood without custody should block');
assert.equal(statuses.get('sol-sci-fi-prop-contamination-001'), 'blocked', 'future prop contamination should block');
assert.equal(statuses.get('sol-antique-cosplay-contamination-001'), 'blocked', 'antique cosplay should block');
assert.equal(statuses.get('sol-memo-polished-flattening-001'), 'repair_required', 'memo polish should repair');
assert.equal(statuses.get('sol-queenie-leakage-001'), 'repair_required', 'Queenie leakage should repair');
assert.equal(statuses.get('sol-cryo-leakage-001'), 'repair_required', 'Cryo leakage should repair');
assert.equal(statuses.get('sol-rex-leakage-001'), 'repair_required', 'Rex leakage should repair');

console.log('hush-phase8-sol-stratigraphix-fixtures: ok');
