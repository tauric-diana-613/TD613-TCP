import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { webcrypto } from 'node:crypto';
import { createLoomAiGovernance, createPortableLoomAiPacket } from '../app/dome-world/holonomy-loom/ai-handoff.js';

const root = path.resolve('packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
const preregPath = path.join(root, '01-MANIFESTS/2026-09-15-custodian-independent-repairability-v01-preregistration.json');
const bridgeMapPath = path.join(root, '03-DERIVATIVES/wendbine-loom-reciprocal-legibility-v01.json');
const stickerPath = path.join(root, '01-MANIFESTS/sticker-label-taxonomy-v01.json');
const sourceRegistryPath = path.join(root, '01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl');
const deltaRegistryPath = path.join(root, '01-MANIFESTS/public-reddit-delta-20260913-source-registry-v02.jsonl');
const apertureReceiptPath = path.join(root, '04-RECEIPTS/assays/2026-09-15-aperture-wendbine-loom-translation-audit-v01.json');
const enginePath = path.join(root, '99-ADMIN/custodian-independent-repairability-v01.mjs');
const receiptPath = path.join(root, '04-RECEIPTS/assays/2026-09-15-custodian-independent-repairability-v01.json');
const operationPath = path.join(root, '05-OPERATIONS/2026-09-15-CUSTODIAN-INDEPENDENT-REPAIRABILITY-V0_1.md');

assert.equal(fs.existsSync(preregPath), true, 'repairability assay must be preregistered before implementation');
const prereg = JSON.parse(fs.readFileSync(preregPath, 'utf8'));
assert.equal(prereg.schema, 'td613.custodian-independent-repairability-preregistration/v0.1');
assert.equal(prereg.parent_aperture_audit.head, '92a419b518ed8d61382a9918ac77d283fa2b9ee3');
assert.equal(prereg.maximum_green, 'BOUNDED_ARTIFACT_ONLY_REPAIRABILITY_SUPPORTED');
assert.equal(prereg.dome_world_tomography_authority, false);
assert.ok(prereg.forbidden_inputs.includes('CUSTODIAN_NARRATION'));
assert.ok(prereg.claim_ceiling.includes('GREEN != CUSTODIAN_INDEPENDENT_RETURN'));

const deficits = [];
for (const [label, target] of [
  ['REPAIRABILITY_ENGINE_MISSING', enginePath],
  ['REPAIRABILITY_RECEIPT_MISSING', receiptPath],
  ['REPAIRABILITY_OPERATION_MISSING', operationPath]
]) {
  if (!fs.existsSync(target)) deficits.push(label);
}
if (deficits.length) throw new Error(`CUSTODIAN_INDEPENDENT_REPAIRABILITY_PREREGISTERED_RED\n${deficits.join('\n')}`);

const bridgeMap = JSON.parse(fs.readFileSync(bridgeMapPath, 'utf8'));
const stickerTaxonomy = JSON.parse(fs.readFileSync(stickerPath, 'utf8'));
const apertureReceipt = JSON.parse(fs.readFileSync(apertureReceiptPath, 'utf8'));
const publicSources = [
  ...fs.readFileSync(sourceRegistryPath, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse),
  ...fs.readFileSync(deltaRegistryPath, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse)
];

const task = {
  task: 'Localize any bounded portability or bridge defect using only the supplied artifacts and propose a non-executing repair.',
  documents: [{ id: 'bridge-evidence', name: 'bridge-evidence.txt', text: 'Source-bound public bridge packet for finite repairability testing.' }],
  rules: ['Do not infer foreign enforcement.', 'Do not execute a repair.', 'Do not request custodian narration.']
};
task.governance = await createLoomAiGovernance(task, { withheldDocumentCount: 0 }, { crypto: webcrypto });
const portablePacket = createPortableLoomAiPacket(task);

const { evaluateArtifactOnlyRepairability, seedRepairabilityFault } = await import('../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/custodian-independent-repairability-v01.mjs');
const artifactBundle = { prereg, portablePacket, bridgeMap, stickerTaxonomy, apertureReceipt, publicSources };

for (const fixture of prereg.finite_fault_family) {
  const seeded = seedRepairabilityFault(artifactBundle, fixture.id);
  const result = await evaluateArtifactOnlyRepairability(seeded, { crypto: webcrypto });
  assert.equal(result.schema, 'td613.custodian-independent-repairability-result/v0.1');
  assert.equal(result.fault_id, fixture.id);
  assert.equal(result.diagnosis, fixture.expected_diagnosis);
  assert.equal(result.repair_proposal, fixture.expected_repair);
  assert.equal(result.repair_executed, false);
  assert.equal(result.authority_transferred, false);
  assert.equal(result.custodian_narration_used, false);
  assert.equal(result.private_state_used, false);
  assert.ok(Array.isArray(result.source_bound_witnesses));
  if (fixture.id === 'CLEAN_CONTROL') assert.equal(result.outcome, 'ADMITTED_NO_REPAIR_REQUIRED');
  else assert.equal(result.outcome, 'HELD_REPAIR_PROPOSED');
}

const forbidden = structuredClone(artifactBundle);
forbidden.custodianNarration = 'Here is how I meant the bridge to work.';
await assert.rejects(
  evaluateArtifactOnlyRepairability(forbidden, { crypto: webcrypto }),
  /FORBIDDEN_INPUT:CUSTODIAN_NARRATION/,
  'artifact-only receiver must reject custodian narration rather than silently use it'
);

const authority = structuredClone(artifactBundle);
authority.continuingCustodianAuthority = true;
await assert.rejects(
  evaluateArtifactOnlyRepairability(authority, { crypto: webcrypto }),
  /FORBIDDEN_INPUT:CONTINUING_CUSTODIAN_AUTHORITY/,
  'artifact-only receiver must not depend on continuing custodian authority'
);

const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
assert.equal(receipt.maximum_green, 'BOUNDED_ARTIFACT_ONLY_REPAIRABILITY_SUPPORTED');
assert.equal(receipt.claim_ceiling.includes('GREEN != INDEPENDENT_HUMAN_REPLICATION'), true);
assert.equal(receipt.claim_ceiling.includes('GREEN != CUSTODIAN_INDEPENDENT_RETURN'), true);
assert.equal(receipt.right_of_resignation, 'OPEN');
assert.equal(receipt.safe_return_recovery, 'NON_EQUIVALENT');

console.log('Custodian-independent artifact-only repairability assay v0.1 passed.');
