import assert from 'assert';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { HUSH_SWAP_VERSION, buildHushSwap } from '../app/engine/hush-swap.js';

assert.equal(HUSH_SWAP_VERSION, 'phase-18');

const mask = getHushMask('plain-witness');
const sourceText = 'Keep CASE-17 with the note from 6/13. I did not change the attachment.';
const result = buildHushSwap({
  sourceText,
  mask,
  maskProfile: mask.profile,
  protectedLiterals: ['CASE-17', '6/13'],
  contextType: 'group-chat',
  options: { candidateCount: 18 }
});

assert.equal(result.version, 'phase-18');
assert(result.writer?.meaningPlan);
assert(result.writer?.realizationPlan);
assert(result.writer?.cleanroom);
assert(result.releasePolicy);
assert(result.releaseSummary);
assert(result.sourceResidue);
assert(result.sourceResidueSummary);
assert(result.sourceResidueScore);
assert(result.candidates.length >= 10);
assert(result.candidates.every((candidate) => candidate.text.includes('CASE-17') && candidate.text.includes('6/13')));
assert(result.candidates.some((candidate) => candidate.releasePolicy));
assert(result.candidates.some((candidate) => candidate.sourceResidue));
assert(result.candidates.some((candidate) => Object.prototype.hasOwnProperty.call(candidate.scoreBreakdown || {}, 'sourceResidueScore')));

if (result.releasePolicy.mayPopulateOutput) {
  assert(result.selectedOutput.length > 0);
} else {
  assert.equal(result.selectedOutput, '');
}

console.log('hush-swap tests passed');
