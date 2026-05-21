import assert from 'assert';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { HUSH_SWAP_VERSION, buildHushSwap } from '../app/engine/hush-swap.js';
import { buildPhase23HushSwap } from '../app/engine/hush-phase23-swap.js';

assert.equal(HUSH_SWAP_VERSION, 'phase-22');

const mask = getHushMask('plain-witness');
const sourceText = 'The vendor called twice after lunch. I logged INV-440 at 2:18 and told Jordan not to resend the spreadsheet until we know which version finance kept.';
const result = buildHushSwap({
  sourceText,
  mask,
  maskProfile: mask.profile,
  contextType: 'group-chat',
  options: { candidateCount: 18 }
});

assert.equal(result.version, 'phase-22');
assert(result.writer?.meaningPlan);
assert(result.writer?.payloadMap);
assert(result.writer?.payloadMapSummary);
assert(result.writer?.payloadBindingMap);
assert(result.writer?.payloadBindingSummary);
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
assert(result.payloadIntegrity);
assert(result.payloadIntegritySummary);
assert(result.payloadRepairSummary);
assert(result.claimIntegrity);
assert(result.claimIntegritySummary);
assert(result.literalPlacementSummary);
assert(result.candidates.length >= 10);
assert(result.candidates.every((candidate) => candidate.text.includes('INV-440') && candidate.text.includes('2:18')));
assert(result.candidates.some((candidate) => candidate.releasePolicy));
assert(result.candidates.some((candidate) => candidate.sourceResidue));
assert(result.candidates.some((candidate) => candidate.syntaxShift));
assert(result.candidates.some((candidate) => candidate.payloadIntegrity));
assert(result.candidates.some((candidate) => candidate.claimIntegrity));
assert(result.candidates.some((candidate) => candidate.source === 'syntax-recomposer'));
assert(result.candidates.some((candidate) => candidate.source === 'literal-safe-fallback'));
assert(result.candidates.some((candidate) => Object.prototype.hasOwnProperty.call(candidate.scoreBreakdown || {}, 'sourceResidueScore')));
assert(result.candidates.some((candidate) => Object.prototype.hasOwnProperty.call(candidate.scoreBreakdown || {}, 'syntaxShiftScore')));
assert(result.candidates.some((candidate) => Object.prototype.hasOwnProperty.call(candidate.scoreBreakdown || {}, 'payloadIntegrity')));
assert(result.candidates.every((candidate) => candidate.claimIntegrity?.passed !== false || candidate.releasePolicy?.hardBlockReasons.includes('claim-integrity-failed')));
assert(result.candidates.every((candidate) => candidate.payloadIntegrity?.passed !== false || candidate.releasePolicy?.hardBlockReasons.includes('claim-payload-loss')));

if (result.releasePolicy.mayPopulateOutput) {
  assert(result.selectedOutput.length > 0);
  assert(result.selectedOutput.includes('INV-440'));
  assert(result.selectedOutput.includes('2:18'));
} else {
  assert.equal(result.selectedOutput, '');
}

const phase23Mask = getHushMask('phase22-jagged-record');
const phase23 = buildPhase23HushSwap({
  sourceText: 'Keep DOC-77 with 04/21. The file was visible before noon, and the date is the anchor.',
  mask: phase23Mask,
  maskProfile: phase23Mask.profile,
  contextType: 'group-chat',
  options: { candidateCount: 24 }
});

assert.equal(phase23.version, 'phase-23');
assert.equal(phase23.phase22Version, 'phase-22');
assert(phase23.phase23?.usedWrapper, 'Phase 23 wrapper marker missing');
assert(phase23.outputPolishSummary, 'missing output polish summary');
assert(phase23.witnessCoherenceSummary, 'missing witness coherence summary');
assert(phase23.candidates.some((candidate) => candidate.outputPolish));
assert(phase23.candidates.some((candidate) => candidate.witnessCoherence));
assert(Number.isFinite(phase23.witnessCoherence?.score), 'missing coherence score');
if (phase23.selectedOutput) {
  assert(phase23.selectedOutput.includes('DOC-77'));
  assert(phase23.selectedOutput.includes('04/21'));
  assert(!phase23.selectedOutput.startsWith('might Keeping'));
}

console.log('hush-swap tests passed');
