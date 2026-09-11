import assert from 'node:assert/strict';
import fs from 'node:fs';

const receiptPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/04-RECEIPTS/assays/2026-09-11-td613-devastate-repair-sieve-v03.json';
const operationPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/05-OPERATIONS/2026-09-11-TD613-DEVASTATE-THEN-REPAIR-SIEVE-V0_3.md';
const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const operation = fs.readFileSync(operationPath, 'utf8');

assert.equal(receipt.schema, 'td613.devastate-repair-sieve/v0.3');
assert.equal(receipt.counts.verdict_rows, 6);
assert.equal(receipt.counts.novelty_promotions, 0);
assert.equal(receipt.counts.novelty_credit_false, 6);
assert.equal(receipt.verdicts.every(v => v.novelty_credit === false), true);

const ids = new Set(receipt.verdicts.map(v => v.id));
for (const id of ['FADT', 'VCPL', 'AIA', 'PRCS_A', 'HOLONOMY_LOOM_GOVERNANCE', 'SAFE_HARBOR_RIGHT_OF_RESIGNATION']) {
  assert.equal(ids.has(id), true, `missing verdict ${id}`);
}

assert.match(receipt.verdicts.find(v => v.id === 'FADT').repair_name, /Finite Quotient Admissibility Audit/);
assert.match(receipt.verdicts.find(v => v.id === 'VCPL').repair_name, /forensic evidence-state vector/);
assert.match(receipt.verdicts.find(v => v.id === 'AIA').repair_name, /receiver-indexed policy-governed view architecture/);
assert.match(receipt.verdicts.find(v => v.id === 'PRCS_A').repair_name, /policy-conditioned coarsening/);
assert.match(receipt.verdicts.find(v => v.id === 'HOLONOMY_LOOM_GOVERNANCE').repair_name, /continuous usage-control/);
assert.match(receipt.verdicts.find(v => v.id === 'SAFE_HARBOR_RIGHT_OF_RESIGNATION').repair_name, /custodian-independent handoff/);

const sourceFamilies = new Set(receipt.source_bank.map(s => s.family));
for (const family of ['rough_sets', 'epistemic_temporal_logic', 'information_flow_security', 'usage_control', 'provenance_access_control', 'knowledge_transfer', 'software_resilience']) {
  assert.equal(sourceFamilies.has(family), true, `missing source family ${family}`);
}

assert.match(operation, /No residual is promoted to novelty/);
assert.match(operation, /holonomy.*reserved/i);
assert.match(operation, /anisotropic.*reserved/i);
assert.match(operation, /custodian-independent handoff/i);

console.log('TD613 devastate-then-repair sieve v0.3: PASS');
