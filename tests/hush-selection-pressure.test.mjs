import assert from 'node:assert/strict';
import hushMasks from '../app/data/hush-masks.js';
import {
  HUSH_SWAP_VERSION,
  buildHushSwap,
  chooseBestHushSwapCandidate
} from '../app/engine/hush-swap.js';

assert.equal(HUSH_SWAP_VERSION, 'phase-22.1-selection-pressure');

const masksById = new Map(hushMasks.map((mask) => [mask.id, mask]));
const sourceText = [
  'Please keep DOC-17 with the 3:45 timestamp because the later copy changed the label.',
  'I need the point to stay narrow: the changed label is the issue, not a broader accusation.',
  'Make it less formal without losing the timestamp, the document ID, or the reason for the review.'
].join(' ');
const protectedLiterals = ['DOC-17', '3:45'];
const requiredMaskIds = [
  'burner-minimal',
  'group-chat-soft',
  'forum-regular',
  'clipboard',
  'library-ghost',
  'grandma-receipts',
  'soft-snark'
];

for (const id of requiredMaskIds) {
  const mask = masksById.get(id);
  assert.ok(mask, `missing mask fixture: ${id}`);
  const result = buildHushSwap({
    sourceText,
    protectedLiterals,
    mask,
    operatorMode: 'neutralize',
    contextType: 'group-chat',
    exposureDuration: 'single-use',
    options: { candidateCount: 24 }
  });
  const selected = result.candidates.find((candidate) => candidate.id === result.selectedCandidateId);
  assert.ok(selected, `${id} should select a candidate`);
  assert.equal(selected.source, 'mask-writer', `${id} should not let generic syntax recomposer outrank the mask writer`);
  assert.ok(selected.maskStyleSignal?.maskSpecific || selected.maskStyleSignal?.writerSource, `${id} should carry mask-style selection signal`);
  assert.ok(selected.scoreBreakdown?.maskStyleScore > 0.6, `${id} should score mask style pressure`);
  assert.equal(selected.payloadIntegrity?.passed, true, `${id} selected candidate should preserve payload`);
}

const genericCandidate = {
  id: 'generic-safe',
  source: 'syntax-recomposer',
  strategy: 'formal-record',
  finalScore: 0.72,
  selectionScore: 0.72,
  payloadIntegrity: { passed: true },
  releasePolicy: { hardBlocked: false },
  syntaxShift: { warnings: [] },
  maskStyleSignal: { maskStyleScore: 0.14, genericSafe: true }
};
const maskCandidate = {
  id: 'mask-specific',
  source: 'mask-writer',
  strategy: 'forum-slowdown',
  finalScore: 0.715,
  selectionScore: 0.715,
  payloadIntegrity: { passed: true },
  releasePolicy: { hardBlocked: false },
  syntaxShift: { warnings: [] },
  maskStyleSignal: { maskStyleScore: 0.98, maskSpecific: true }
};
assert.equal(chooseBestHushSwapCandidate([genericCandidate, maskCandidate])?.id, 'mask-specific');

console.log('hush-selection-pressure: ok');
