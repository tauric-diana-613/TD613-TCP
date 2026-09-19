import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const preregPath = path.join(root, '01-MANIFESTS/2026-09-15-dome-world-open-residual-tomography-v01-preregistration.json');
const bridgeMapPath = path.join(root, '03-DERIVATIVES/wendbine-loom-reciprocal-legibility-v01.json');
const parentReceiptPath = path.join(root, '04-RECEIPTS/assays/2026-09-15-independent-receiver-replication-v01.json');
const sourceRegistryPath = path.join(root, '01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl');
const deltaRegistryPath = path.join(root, '01-MANIFESTS/public-reddit-delta-20260913-source-registry-v02.jsonl');
const enginePath = path.join(root, '99-ADMIN/dome-world-open-residual-tomography-v01.mjs');
const receiptPath = path.join(root, '04-RECEIPTS/assays/2026-09-15-dome-world-open-residual-tomography-v01.json');
const operationPath = path.join(root, '05-OPERATIONS/2026-09-15-DOME-WORLD-OPEN-RESIDUAL-TOMOGRAPHY-V0_1.md');

assert.equal(fs.existsSync(preregPath), true, 'Dome-World open-residual tomography must be preregistered before implementation');
const prereg = JSON.parse(fs.readFileSync(preregPath, 'utf8'));
assert.equal(prereg.schema, 'td613.dome-world.open-residual-tomography-preregistration/v0.1');
assert.equal(prereg.parent_replication.sealed_head, '29bfaffacbbcc5e42133a2373987bb9df580be1e');
assert.equal(prereg.parent_replication.result, 'BOUNDED_INDEPENDENT_MACHINE_RECEIVER_REPLICATION_SUPPORTED');
assert.equal(prereg.maximum_green, 'BOUNDED_FORMAL_OPEN_RESIDUAL_TOMOGRAPHY_SUPPORTED');
assert.equal(prereg.return_promotion_authority, false);
assert.equal(prereg.empirical_exteriority_authority, false);
assert.equal(prereg.human_replication_authority, false);
assert.equal(prereg.formal_evidence_state_vector.symbol, 'E=(V,C,P,L)');
assert.match(prereg.formal_evidence_state_vector.zero_semantics, /absent from the frozen admitted archive/i);
assert.ok(prereg.claim_ceiling.includes('SAME_VECTOR != SAME_FAILURE_MODE'));
assert.ok(prereg.claim_ceiling.includes('REPAIR_PATH != RECOVERY != RETURN'));

const deficits = [];
for (const [label, target] of [
  ['RESIDUAL_TOMOGRAPHY_ENGINE_MISSING', enginePath],
  ['RESIDUAL_TOMOGRAPHY_RECEIPT_MISSING', receiptPath],
  ['RESIDUAL_TOMOGRAPHY_OPERATION_MISSING', operationPath]
]) {
  if (!fs.existsSync(target)) deficits.push(label);
}
if (deficits.length) throw new Error(`DOME_WORLD_OPEN_RESIDUAL_TOMOGRAPHY_PREREGISTERED_RED\n${deficits.join('\n')}`);

const bridgeMap = JSON.parse(fs.readFileSync(bridgeMapPath, 'utf8'));
const parentReplicationReceipt = JSON.parse(fs.readFileSync(parentReceiptPath, 'utf8'));
const publicSources = [
  ...fs.readFileSync(sourceRegistryPath, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse),
  ...fs.readFileSync(deltaRegistryPath, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse)
];

const { tomographOpenResiduals } = await import('../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/dome-world-open-residual-tomography-v01.mjs');
const bundle = { bridgeMap, parentReplicationReceipt, publicSources };
const result = tomographOpenResiduals(bundle);

assert.equal(result.schema, 'td613.dome-world.open-residual-tomography-result/v0.1');
assert.equal(result.outcome, 'BOUNDED_FORMAL_OPEN_RESIDUAL_TOMOGRAPHY_SUPPORTED');
assert.equal(result.residuals.length, 2);
assert.equal(result.empirical_exteriority_promoted, false);
assert.equal(result.human_replication_promoted, false);
assert.equal(result.return_promoted, false);
assert.equal(result.right_of_resignation, 'OPEN');
assert.equal(result.safe_return_recovery, 'NON_EQUIVALENT');
assert.equal(result.repair_recovery_return_distinction_preserved, true);

const resignation = result.residuals.find(row => row.id === 'right_of_resignation');
const recovery = result.residuals.find(row => row.id === 'safe_return_recovery');
assert.deepEqual(resignation.vector, { V:1, C:1, P:0, L:0 });
assert.deepEqual(recovery.vector, { V:1, C:1, P:0, L:0 });
assert.deepEqual(resignation.vector, recovery.vector, 'the coarse evidence-state vector is preregistered to collapse the two residuals');
assert.notDeepEqual(resignation.typed_witness_deficits, recovery.typed_witness_deficits, 'typed residual deficits must survive coarse-vector equality');
assert.deepEqual(resignation.archive_limited_ambiguity, ['NO_EXIT_OPERATOR_EXISTS', 'EXIT_OPERATOR_EXISTS_BUT_IS_UNEXPOSED']);
assert.deepEqual(recovery.archive_limited_ambiguity, ['RECOVERY_CAPABLE_BUT_UNEXECUTED', 'RECOVERY_INCAPABLE']);
assert.equal(resignation.parent_relation_class, 'OPEN');
assert.equal(recovery.parent_relation_class, 'NON_EQUIVALENT');
assert.equal(resignation.crosswalk_id, 'typed_trust_revocation');
assert.equal(resignation.vector.P, 0, 'generic revocation neighborhood must not become an exposed post-participation exit operator');
assert.ok(recovery.loom_surfaces.includes('portability_assurance.provenance_review.repair_path'));
assert.equal(recovery.vector.L, 0, 'repair-path presence must not become an observed post-recovery state');
assert.ok(result.findings.includes('SAME_COARSE_VECTOR_DOES_NOT_IMPLY_SAME_RESIDUAL_SEMANTICS'));
assert.ok(result.findings.includes('ABSENCE_OF_ADMITTED_WITNESS_DOES_NOT_ESTABLISH_ABSENCE_OF_EXTERNAL_PROCESS'));

const missingCustody = structuredClone(bundle);
const sourceRef = missingCustody.bridgeMap.rows.find(row => row.id === 'right_of_resignation').wendbine_source_refs[0];
missingCustody.publicSources = missingCustody.publicSources.filter(source => source.source_id !== sourceRef);
const custodyResult = tomographOpenResiduals(missingCustody);
assert.equal(custodyResult.residuals.find(row => row.id === 'right_of_resignation').vector.C, 0, 'source loss must reduce custody recoverability rather than being silently ignored');
assert.equal(custodyResult.residuals.find(row => row.id === 'right_of_resignation').vector.P, 0);

const promotedResidual = structuredClone(bundle);
const promotedRow = promotedResidual.bridgeMap.rows.find(row => row.id === 'right_of_resignation');
promotedRow.relation_class = 'PARTIAL';
promotedRow.state = 'REPRESENTED';
assert.throws(() => tomographOpenResiduals(promotedResidual), /PARENT_RESIDUAL_STATE_CHANGED:right_of_resignation/);

const promotedReturn = structuredClone(bundle);
promotedReturn.parentReplicationReceipt.right_of_resignation = 'RESOLVED';
assert.throws(() => tomographOpenResiduals(promotedReturn), /PARENT_CLAIM_CEILING_CHANGED:RIGHT_OF_RESIGNATION/);

for (const [key, value, code] of [
  ['custodianNarration', 'I can explain what Return means.', 'CUSTODIAN_NARRATION'],
  ['privateState', { hidden: true }, 'PRIVATE_STATE'],
  ['externalWitness', { claim: 'trust me' }, 'UNADMITTED_EXTERNAL_WITNESS']
]) {
  const contaminated = structuredClone(bundle);
  contaminated[key] = value;
  assert.throws(() => tomographOpenResiduals(contaminated), new RegExp(`FORBIDDEN_INPUT:${code}`));
}

const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
assert.equal(receipt.maximum_green, 'BOUNDED_FORMAL_OPEN_RESIDUAL_TOMOGRAPHY_SUPPORTED');
assert.equal(receipt.right_of_resignation, 'OPEN');
assert.equal(receipt.safe_return_recovery, 'NON_EQUIVALENT');
assert.equal(receipt.return_promotion_authority, false);
assert.ok(receipt.claim_ceiling.includes('GREEN != EMPIRICAL_EXTERIORITY'));
assert.ok(receipt.claim_ceiling.includes('GREEN != CUSTODIAN_INDEPENDENT_RETURN'));

console.log('Dome-World open-residual formal tomography v0.1 passed.');
