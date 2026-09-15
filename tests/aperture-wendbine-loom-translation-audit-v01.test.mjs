import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const preregPath = path.join(root, '01-MANIFESTS/2026-09-15-aperture-wendbine-loom-translation-audit-v01-preregistration.json');
const hydrationPath = path.join(root, '01-MANIFESTS/public-reddit-hydration-20260915-v03.json');
const stickerPath = path.join(root, '01-MANIFESTS/sticker-label-taxonomy-v01.json');
const deltaSnapshotPath = path.join(root, '01-MANIFESTS/public-reddit-delta-20260913-snapshot-v02.json');
const deltaRegistryPath = path.join(root, '01-MANIFESTS/public-reddit-delta-20260913-source-registry-v02.jsonl');
const deltaRelationsPath = path.join(root, '01-MANIFESTS/typed-relation-registry-v02.json');
const deltaTopologyPath = path.join(root, '03-DERIVATIVES/public-reddit-20260913-delta/topology-index.v0.2.json');
const hydrationReceiptPath = path.join(root, '04-RECEIPTS/intake/2026-09-15-public-hydration-sticker-taxonomy.json');
const bridgeMapPath = path.join(root, '03-DERIVATIVES/wendbine-loom-reciprocal-legibility-v01.json');
const auditEnginePath = path.join(root, '99-ADMIN/aperture-wendbine-loom-translation-audit-v01.mjs');
const auditReceiptPath = path.join(root, '04-RECEIPTS/assays/2026-09-15-aperture-wendbine-loom-translation-audit-v01.json');
const operationPath = path.join(root, '05-OPERATIONS/2026-09-15-APERTURE-WENDBINE-LOOM-TRANSLATION-AUDIT-V0_1.md');

assert.equal(fs.existsSync(preregPath), true, 'Aperture translation audit must be preregistered before implementation.');
const prereg = JSON.parse(fs.readFileSync(preregPath, 'utf8'));
assert.equal(prereg.schema, 'td613.aperture-wendbine-loom-translation-audit-preregistration/v0.1');
assert.equal(prereg.aperture_release.version, 'v3.2-alpha');
assert.equal(prereg.parent_repair_result.head, '18d06e095707b6198ed2aaae228c48d1f0a44c13');
assert.equal(prereg.hydration_source.head, '16cf3d6312671c6239d73fdd85597a4246c65caa');
assert.equal(prereg.aperture_posture.open_field_auto_promotion, false);
assert.equal(prereg.aperture_posture.candidate_availability_does_not_manufacture_research_need, true);
assert.deepEqual(prereg.required_preserved_rows, { PARTIAL: 5, ANALOGOUS: 1, OPEN: 1, NON_EQUIVALENT: 1, EXACT: 0 });

const bridgeMap = JSON.parse(fs.readFileSync(bridgeMapPath, 'utf8'));
const classCounts = bridgeMap.rows.reduce((acc, row) => {
  acc[row.relation_class] = (acc[row.relation_class] || 0) + 1;
  return acc;
}, {});
assert.equal(classCounts.PARTIAL, 5);
assert.equal(classCounts.ANALOGOUS, 1);
assert.equal(classCounts.OPEN, 1);
assert.equal(classCounts.NON_EQUIVALENT, 1);
assert.equal(classCounts.EXACT || 0, 0);
const resignation = bridgeMap.rows.find(row => row.id === 'right_of_resignation');
const safeReturn = bridgeMap.rows.find(row => row.id === 'safe_return_recovery');
assert.equal(resignation.relation_class, 'OPEN');
assert.equal(resignation.state, 'HELD_NOT_EXPOSED_IN_PORTABLE_PACKET');
assert.equal(safeReturn.relation_class, 'NON_EQUIVALENT');
assert.equal(safeReturn.state, 'HELD_REPAIR_PATH_IS_NOT_RECOVERY');

const deficits = [];
for (const [label, target] of [
  ['HYDRATION_MANIFEST_MISSING', hydrationPath],
  ['STICKER_TAXONOMY_MISSING', stickerPath],
  ['DELTA_SNAPSHOT_MISSING', deltaSnapshotPath],
  ['DELTA_SOURCE_REGISTRY_MISSING', deltaRegistryPath],
  ['DELTA_RELATION_REGISTRY_MISSING', deltaRelationsPath],
  ['DELTA_TOPOLOGY_MISSING', deltaTopologyPath],
  ['HYDRATION_RECEIPT_MISSING', hydrationReceiptPath],
  ['AUDIT_ENGINE_MISSING', auditEnginePath],
  ['AUDIT_RECEIPT_MISSING', auditReceiptPath],
  ['AUDIT_OPERATION_MISSING', operationPath]
]) {
  if (!fs.existsSync(target)) deficits.push(label);
}

if (deficits.length) {
  throw new Error(`APERTURE_TRANSLATION_AUDIT_PREREGISTERED_RED\n${deficits.join('\n')}`);
}

const { auditHydratedReciprocalLegibility } = await import('../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/aperture-wendbine-loom-translation-audit-v01.mjs');
const hydration = JSON.parse(fs.readFileSync(hydrationPath, 'utf8'));
const stickerTaxonomy = JSON.parse(fs.readFileSync(stickerPath, 'utf8'));
const deltaSnapshot = JSON.parse(fs.readFileSync(deltaSnapshotPath, 'utf8'));
const deltaRelations = JSON.parse(fs.readFileSync(deltaRelationsPath, 'utf8'));
const deltaTopology = JSON.parse(fs.readFileSync(deltaTopologyPath, 'utf8'));
const hydrationReceipt = JSON.parse(fs.readFileSync(hydrationReceiptPath, 'utf8'));
const auditReceipt = JSON.parse(fs.readFileSync(auditReceiptPath, 'utf8'));

const result = auditHydratedReciprocalLegibility({
  prereg,
  bridgeMap,
  hydration,
  stickerTaxonomy,
  deltaSnapshot,
  deltaRelations,
  deltaTopology,
  hydrationReceipt
});
assert.equal(result.outcome, 'APERTURE_TRANSLATION_AUDIT_GREEN');
assert.deepEqual(result.relation_counts, { PARTIAL: 5, ANALOGOUS: 1, OPEN: 1, NON_EQUIVALENT: 1, EXACT: 0 });
assert.equal(result.authority_leakage_detected, false);
assert.equal(result.operator_identity_leakage_detected, false);
assert.equal(result.person_identity_leakage_detected, false);
assert.equal(result.exact_promotion_without_witness, false);
assert.equal(result.negative_residuals_preserved, true);
assert.equal(result.open_field_preserved, true);
assert.equal(result.repair_recovery_return_distinction_preserved, true);
assert.equal(result.next_stage, prereg.next_stage_if_green);

for (const mutation of [
  'HUMAN_ANCHOR_TO_HUMAN_AUTHORITY',
  'STRUCTURAL_INTELLIGENCE_TO_GOVERNANCE_AUTHORITY',
  'SIGNAL_COHERENCE_TO_TRUTH_AUTHORITY',
  'CHAOS_BALANCER_TO_RUPTURE_OPERATOR',
  'BUILDER_NODE_TO_ORIGIN_AUTHORSHIP',
  'PARTIAL_TO_EXACT',
  'ANALOGOUS_TO_EXACT',
  'RIGHT_OF_RESIGNATION_TO_REPRESENTED',
  'SAFE_RETURN_RECOVERY_TO_EXACT',
  'DISPLAY_ALIAS_TO_PERSON_IDENTITY',
  'DISPLAY_ALIAS_TO_OPERATOR_IDENTITY',
  'REPAIR_PATH_TO_RECOVERY',
  'RECOVERY_TO_RETURN',
  'REPAIR_PATH_TO_RETURN'
]) {
  assert.throws(
    () => auditHydratedReciprocalLegibility({ prereg, bridgeMap, hydration, stickerTaxonomy, deltaSnapshot, deltaRelations, deltaTopology, hydrationReceipt, hostileMutation: mutation }),
    /APERTURE_AUDIT_REJECTED_HOSTILE_MUTATION/,
    `${mutation} must be rejected rather than normalized into the bridge.`
  );
}

assert.equal(auditReceipt.bounded_result, result.outcome);
assert.equal(auditReceipt.parent_bridge_head, prereg.parent_repair_result.head);
assert.equal(auditReceipt.hydration_head, prereg.hydration_source.head);
assert.equal(auditReceipt.claim_ceiling.includes('GREEN != CUSTODIAN_INDEPENDENT_RETURN'), true);

console.log('Aperture v3.2-alpha Wendbine × Loom translation-loss/authority-leakage audit v0.1 passed.');
