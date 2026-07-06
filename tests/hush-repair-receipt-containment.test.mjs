import assert from 'node:assert/strict';
import { evaluateApertureRepairCandidate } from '../app/engine/hush-aperture-repair-pass.js';
import { applyApertureHushRepair } from '../app/hush-aperture-repair-runtime.js';

const source = 'FILE-72 remains attached. The footer mismatch is not resolved. The receipt matters because the earlier image returns as evidence, not decoration.';
const candidate = { id: 'same-source', text: source, finalScore: 0.82, releasePolicy: { mayPopulateOutput: true }, payloadIntegrity: { passed: true, score: 1 } };
const receipt = evaluateApertureRepairCandidate(candidate, source, { mask: { id: 'grandma-receipts', label: 'Receipts Queenie' } });
assert.equal(receipt.hardBlocked, false, JSON.stringify(receipt));
assert.ok(receipt.reviewReasons.includes('source-residual-review-high'), JSON.stringify(receipt));
assert.equal(receipt.hardBlockReasons.includes('aperture-source-residual-hard-high'), false, JSON.stringify(receipt));

const nodes = {
  messageDraftInput: { value: source },
  protectedOutputInput: { value: source, dataset: {}, dispatchEvent(event) { this.lastEvent = event.type; } },
  hushGeneratorStatus: { hidden: true, dataset: {}, textContent: '' },
  maskFieldSelect: { value: 'grandma-receipts', selectedOptions: [{ textContent: 'Receipts Queenie' }] }
};
const doc = { getElementById(id) { return nodes[id] || null; } };
const result = { selectedCandidateId: 'same-source', selectedOutput: source, candidates: [candidate], patch38Diagnostics: { selectedCandidateId: 'same-source' } };
assert.equal(applyApertureHushRepair(result, doc), false);
assert.equal(nodes.protectedOutputInput.value, source);
assert.equal(nodes.hushGeneratorStatus.textContent.includes('Aperture repair held output'), false);
assert.equal(nodes.hushGeneratorStatus.textContent.includes('aperture-source-residual-hard-high'), false);

const hardMotif = evaluateApertureRepairCandidate({ id: 'motif', text: 'The cracked jar appears. FILE-72 remains attached.' }, source, { mask: { id: 'grandma-receipts', label: 'Receipts Queenie' } });
assert.equal(hardMotif.hardBlocked, true);

console.log('hush-repair-receipt-containment: ok');
