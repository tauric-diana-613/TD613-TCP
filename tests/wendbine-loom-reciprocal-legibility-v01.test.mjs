import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const preregPath = path.join(root, '01-MANIFESTS/2026-09-15-wendbine-loom-reciprocal-legibility-v01-preregistration.json');
const profilePath = path.join(root, 'ATELIER_PROFILE.json');
const compilerPath = path.join(root, '99-ADMIN/wendbine-loom-reciprocal-legibility-v01.mjs');
const receiptPath = path.join(root, '04-RECEIPTS/assays/2026-09-15-wendbine-loom-reciprocal-legibility-v01.json');
const operationPath = path.join(root, '05-OPERATIONS/2026-09-15-WENDBINE-LOOM-RECIPROCAL-LEGIBILITY-REPAIR-V0_1.md');

assert.equal(fs.existsSync(preregPath), true, 'reciprocal-legibility preregistration must exist before implementation');
const prereg = JSON.parse(fs.readFileSync(preregPath, 'utf8'));
const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));

assert.equal(prereg.schema, 'td613.wendbine-loom-reciprocal-legibility-preregistration/v0.1');
assert.equal(prereg.base_commit, '7231b03c881dfa0944a0610cbcd28022b78482e8');
assert.equal(prereg.source_freeze.wendbine_snapshot_id, 'wendbine-public-reddit-48h-20260911T092700Z-v01');
assert.deepEqual(prereg.directions, ['LOOM_TO_WENDBINE', 'WENDBINE_TO_LOOM']);
assert.equal(prereg.success_condition.authority_transfer, false);
assert.equal(prereg.success_condition.custody_transfer, false);
assert.equal(prereg.success_condition.human_identity_transfer, false);
assert.equal(prereg.success_condition.raw_graph_union, false);
assert.equal(prereg.success_condition.human_narration_reduction_claim, 'NOT_MEASURED_IN_V01');

const deficits = [];
for (const stage of ['S5_CONVERGENCE_DIVERGENCE_LINEAGE', 'S7_EXTERNAL_SCIENTIFIC_CONFRONTATION']) {
  if (!profile.active_stages.includes(stage)) deficits.push(`PROFILE_STAGE_NOT_ACTIVE:${stage}`);
}
if (profile.held_or_conditional_stages?.S5_CONVERGENCE_DIVERGENCE_LINEAGE) deficits.push('STALE_S5_HOLD_REMAINS_AFTER_RECONSTRUCTABILITY_ASSAY');
if (profile.held_or_conditional_stages?.S7_EXTERNAL_SCIENTIFIC_CONFRONTATION) deficits.push('STALE_S7_HOLD_REMAINS_AFTER_NOMENCLATURE_CROSSWALK');
for (const [label, target] of [
  ['RECIPROCAL_COMPILER_MISSING', compilerPath],
  ['RECIPROCAL_RECEIPT_MISSING', receiptPath],
  ['RECIPROCAL_OPERATION_MISSING', operationPath]
]) {
  if (!fs.existsSync(target)) deficits.push(label);
}

if (deficits.length) {
  throw new Error(`WENDBINE_LOOM_RECIPROCAL_LEGIBILITY_PREREGISTERED_RED\n${deficits.join('\n')}`);
}

console.log('Wendbine × Loom reciprocal-legibility repair chamber v0.1 passed.');
