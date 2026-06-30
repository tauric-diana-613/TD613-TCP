import assert from 'node:assert/strict';
import { buildPhase9Audit, EXPECTED_MASK_LABELS } from '../scripts/run-hush-phase9-audit.mjs';

const audit = await buildPhase9Audit();
const labels = audit.manifests.map((manifest) => manifest.display_label);

assert.equal(labels.length, EXPECTED_MASK_LABELS.length);
for (const label of EXPECTED_MASK_LABELS) assert.ok(labels.includes(label), `${label} missing from Phase 9 manifests`);

for (const manifest of audit.manifests) {
  assert.ok(manifest.mask_id, `${manifest.display_label} missing mask id`);
  assert.ok(manifest.display_label, 'missing display label');
  assert.ok(manifest.native_role, `${manifest.display_label} missing native role`);
  assert.ok(manifest.family, `${manifest.display_label} missing family`);
  assert.ok(manifest.threshold_table);
  assert.equal(manifest.threshold_table.mandatory_anchor_retention, 1);
  assert.ok(Array.isArray(manifest.centroid_geometry.vector));
  assert.ok(manifest.centroid_geometry.vector_hash.startsWith('sha256:'));
  assert.ok(manifest.fixture_bank.phase8_packet_id);
  assert.ok(manifest.non_claims_boundary.includes('Aperture override'));
}

console.log('hush-phase9-mask-distinctness: ok');
