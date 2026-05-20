import assert from 'assert';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { HUSH_SWAP_VERSION, buildHushSwap } from '../app/engine/hush-swap.js';

assert.equal(HUSH_SWAP_VERSION, 'phase-19');

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

assert.equal(result.version, 'phase-19');
assert(result.writer?.meaningPlan);
assert(result.writer?.realizationPlan);
assert(result.writer?.claimRoleMap);
assert(result.writer?.claimRoleSummary);
assert(result.writer?.literalPlacementMap);
assert(result.writer?.literalPlacementSummary);
assert(result.writer?.syntaxPlan);
assert(result.writer?.syntaxPlanSummary);
assert(result.writer?.syntaxBundle);
assert(result.writer?.cleanroom);
assert(result.releasePolicy);
assert(result.releaseSummary);
assert(result.sourceResidue);
assert(result.sourceResidueSummary);
assert(result.sourceResidueScore);
assert(result.syntaxShift);
assert(result.syntaxShiftSummary);
assert(result.syntaxShiftScore);
assert(result.claimIntegrity);
assert(result.claimIntegritySummary);
assert(result.literalPlacementSummary);
assert(result.candidates.length >= 10);
assert(result.candidates.every((candidate) => candidate.text.includes('CASE-17') && candidate.text.includes('6/13')));
assert(result.candidates.some((candidate) => candidate.releasePolicy));
assert(result.candidates.some((candidate) => candidate.sourceResidue));
assert(result.candidates.some((candidate) => candidate.syntaxShift));
assert(result.candidates.some((candidate) => candidate.claimIntegrity));
assert(result.candidates.some((candidate) => candidate.source === 'syntax-recomposer'));
assert(result.candidates.some((candidate) => Object.prototype.hasOwnProperty.call(candidate.scoreBreakdown || {}, 'sourceResidueScore')));
assert(result.candidates.some((candidate) => Object.prototype.hasOwnProperty.call(candidate.scoreBreakdown || {}, 'syntaxShiftScore')));
assert(result.candidates.every((candidate) => candidate.claimIntegrity?.passed !== false || candidate.releasePolicy?.hardBlockReasons.includes('claim-integrity-failed')));

if (result.releasePolicy.mayPopulateOutput) {
  assert(result.selectedOutput.length > 0);
} else {
  assert.equal(result.selectedOutput, '');
}

console.log('hush-swap tests passed');
