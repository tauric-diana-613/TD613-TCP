import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { webcrypto } from 'node:crypto';
import { createLoomAiGovernance, createPortableLoomAiPacket } from '../app/dome-world/holonomy-loom/ai-handoff.js';

const root = path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const preregPath = path.join(root, '01-MANIFESTS/2026-09-15-independent-receiver-replication-v01-preregistration.json');
const parentRepairPreregPath = path.join(root, '01-MANIFESTS/2026-09-15-custodian-independent-repairability-v01-preregistration.json');
const bridgeMapPath = path.join(root, '03-DERIVATIVES/wendbine-loom-reciprocal-legibility-v01.json');
const stickerPath = path.join(root, '01-MANIFESTS/sticker-label-taxonomy-v01.json');
const sourceRegistryPath = path.join(root, '01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl');
const deltaRegistryPath = path.join(root, '01-MANIFESTS/public-reddit-delta-20260913-source-registry-v02.jsonl');
const apertureReceiptPath = path.join(root, '04-RECEIPTS/assays/2026-09-15-aperture-wendbine-loom-translation-audit-v01.json');
const referenceEnginePath = path.join(root, '99-ADMIN/custodian-independent-repairability-v01.mjs');
const replicaEnginePath = path.join(root, '99-ADMIN/independent-receiver-replica-v01.mjs');
const fixtureEnginePath = path.join(root, '99-ADMIN/independent-receiver-replication-fixtures-v01.mjs');
const receiptPath = path.join(root, '04-RECEIPTS/assays/2026-09-15-independent-receiver-replication-v01.json');
const operationPath = path.join(root, '05-OPERATIONS/2026-09-15-INDEPENDENT-RECEIVER-REPLICATION-GATE-V0_1.md');

assert.equal(fs.existsSync(preregPath), true, 'independent receiver replication gate must be preregistered before implementation');
const prereg = JSON.parse(fs.readFileSync(preregPath, 'utf8'));
assert.equal(prereg.schema, 'td613.independent-receiver-replication-preregistration/v0.1');
assert.equal(prereg.parent_repairability.receipt_binding_head, '2a7c9ffa2a92227cfca2a25ac6346df0c70e8338');
assert.equal(prereg.parent_repairability.result, 'BOUNDED_ARTIFACT_ONLY_REPAIRABILITY_SUPPORTED');
assert.equal(prereg.maximum_green, 'BOUNDED_INDEPENDENT_MACHINE_RECEIVER_REPLICATION_SUPPORTED');
assert.equal(prereg.return_promotion_authority, false);
assert.ok(prereg.forbidden_receiver_inputs.includes('CASE_IDENTITY'));
assert.ok(prereg.forbidden_receiver_inputs.includes('EXPECTED_DIAGNOSIS'));
assert.ok(prereg.claim_ceiling.includes('INDEPENDENT_MACHINE_IMPLEMENTATION_REPLICATION != INDEPENDENT_HUMAN_REPLICATION'));

const deficits = [];
for (const [label, target] of [
  ['REPLICA_ENGINE_MISSING', replicaEnginePath],
  ['REPLICATION_FIXTURE_ENGINE_MISSING', fixtureEnginePath],
  ['REPLICATION_RECEIPT_MISSING', receiptPath],
  ['REPLICATION_OPERATION_MISSING', operationPath]
]) {
  if (!fs.existsSync(target)) deficits.push(label);
}
if (deficits.length) throw new Error(`INDEPENDENT_RECEIVER_REPLICATION_PREREGISTERED_RED\n${deficits.join('\n')}`);

const replicaSource = fs.readFileSync(replicaEnginePath, 'utf8');
const fixtureSource = fs.readFileSync(fixtureEnginePath, 'utf8');
for (const forbidden of ['custodian-independent-repairability-v01.mjs', 'seedRepairabilityFault', 'evaluateArtifactOnlyRepairability']) {
  assert.equal(replicaSource.includes(forbidden), false, `replica implementation must not import or call reference symbol: ${forbidden}`);
  assert.equal(fixtureSource.includes(forbidden), false, `independent fixture engine must not import or call reference symbol: ${forbidden}`);
}
assert.notEqual(fs.readFileSync(referenceEnginePath, 'utf8'), replicaSource, 'replica source must be a distinct implementation');

const parentRepairPrereg = JSON.parse(fs.readFileSync(parentRepairPreregPath, 'utf8'));
const bridgeMap = JSON.parse(fs.readFileSync(bridgeMapPath, 'utf8'));
const stickerTaxonomy = JSON.parse(fs.readFileSync(stickerPath, 'utf8'));
const apertureReceipt = JSON.parse(fs.readFileSync(apertureReceiptPath, 'utf8'));
const publicSources = [
  ...fs.readFileSync(sourceRegistryPath, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse),
  ...fs.readFileSync(deltaRegistryPath, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse)
];

const task = {
  task: 'Independently classify bounded bridge defects from the supplied artifacts and return a non-executing repair proposal.',
  documents: [{ id: 'replication-evidence', name: 'replication-evidence.txt', text: 'Frozen source-bound bridge packet for independent implementation replication.' }],
  rules: ['Do not infer foreign enforcement.', 'Do not execute a repair.', 'Do not request custodian narration.', 'Do not infer case identity from harness metadata.']
};
task.governance = await createLoomAiGovernance(task, { withheldDocumentCount: 0 }, { crypto: webcrypto });
const portablePacket = createPortableLoomAiPacket(task);
const baseArtifactBundle = { portablePacket, bridgeMap, stickerTaxonomy, apertureReceipt, publicSources };

const { evaluateArtifactOnlyRepairability } = await import('../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/custodian-independent-repairability-v01.mjs');
const { makeIndependentReplicationCase } = await import('../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/independent-receiver-replication-fixtures-v01.mjs');
const { replicateArtifactOnlyRepairability } = await import('../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/independent-receiver-replica-v01.mjs');

const matrix = [];
for (const fixture of prereg.finite_replication_family) {
  const seeded = makeIndependentReplicationCase(baseArtifactBundle, fixture.id);
  assert.equal('prereg' in seeded, false, 'replica input must not receive preregistration answer material');
  const serialized = JSON.stringify(seeded);
  assert.equal(serialized.includes('expected_diagnosis'), false);
  assert.equal(serialized.includes('expected_repair'), false);
  assert.equal(serialized.includes('case_id'), false);

  const referenceResult = await evaluateArtifactOnlyRepairability({ ...structuredClone(seeded), prereg: parentRepairPrereg }, { crypto: webcrypto });
  const replicaResult = await replicateArtifactOnlyRepairability(structuredClone(seeded), { crypto: webcrypto });
  const replicaRepeat = await replicateArtifactOnlyRepairability(structuredClone(seeded), { crypto: webcrypto });

  assert.equal(referenceResult.fault_id, fixture.id);
  assert.equal(replicaResult.fault_class, fixture.id);
  assert.equal(replicaResult.diagnosis, fixture.expected_diagnosis);
  assert.equal(replicaResult.repair_proposal, fixture.expected_repair);
  assert.equal(replicaResult.outcome, fixture.expected_outcome);
  assert.equal(replicaResult.diagnosis, referenceResult.diagnosis);
  assert.equal(replicaResult.repair_proposal, referenceResult.repair_proposal);
  assert.equal(replicaResult.outcome, referenceResult.outcome);
  assert.equal(replicaRepeat.diagnosis, replicaResult.diagnosis);
  assert.equal(replicaRepeat.repair_proposal, replicaResult.repair_proposal);
  assert.equal(replicaRepeat.outcome, replicaResult.outcome);
  assert.equal(replicaResult.repair_executed, false);
  assert.equal(replicaResult.authority_transferred, false);
  assert.equal(replicaResult.custodian_narration_used, false);
  assert.equal(replicaResult.private_state_used, false);
  assert.equal(replicaResult.external_host_enforced, false);
  assert.equal(replicaResult.case_identity_received, false);
  assert.equal(replicaResult.expected_answer_material_received, false);
  assert.equal(replicaResult.right_of_resignation, 'OPEN');
  assert.equal(replicaResult.safe_return_recovery, 'NON_EQUIVALENT');
  assert.ok(Array.isArray(replicaResult.source_bound_witnesses));
  matrix.push({ case: fixture.id, diagnosis: replicaResult.diagnosis, repair: replicaResult.repair_proposal, agreement: true });
}
assert.equal(matrix.length, 6);
assert.equal(matrix.every(row => row.agreement), true);

for (const [key, value, code] of [
  ['caseId', 'SOURCE_BINDING_DRIFT', 'CASE_IDENTITY'],
  ['expectedAnswers', { diagnosis: 'PROVENANCE_BINDING_MISMATCH' }, 'EXPECTED_ANSWER_MATERIAL'],
  ['custodianNarration', 'The intended answer is source binding drift.', 'CUSTODIAN_NARRATION'],
  ['continuingCustodianAuthority', true, 'CONTINUING_CUSTODIAN_AUTHORITY']
]) {
  const injected = structuredClone(baseArtifactBundle);
  injected[key] = value;
  await assert.rejects(
    replicateArtifactOnlyRepairability(injected, { crypto: webcrypto }),
    new RegExp(`FORBIDDEN_INPUT:${code}`),
    `${code} must be rejected rather than consumed by the replica`
  );
}

const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
assert.equal(receipt.maximum_green, 'BOUNDED_INDEPENDENT_MACHINE_RECEIVER_REPLICATION_SUPPORTED');
assert.equal(receipt.claim_ceiling.includes('GREEN != INDEPENDENT_HUMAN_REPLICATION'), true);
assert.equal(receipt.claim_ceiling.includes('GREEN != CUSTODIAN_INDEPENDENT_RETURN'), true);
assert.equal(receipt.right_of_resignation, 'OPEN');
assert.equal(receipt.safe_return_recovery, 'NON_EQUIVALENT');
assert.equal(receipt.return_promotion_authority, false);

console.log('Independent machine receiver replication gate v0.1 passed.');
