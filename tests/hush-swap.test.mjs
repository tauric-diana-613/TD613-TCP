import assert from 'assert';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import {
  HUSH_SWAP_VERSION,
  buildHushSwap,
  generateHushSwapCandidate,
  scoreHushSwapCandidate,
  chooseBestHushSwapCandidate,
  exportHushSwapJson
} from '../app/engine/hush-swap.js';

assert.equal(HUSH_SWAP_VERSION, 'phase-12');

const mask = getHushMask('burner-minimal');
const sourceText = 'Please keep EXHIBIT-42 attached to the message and make sure the date 6/13 remains visible in the note.';
const protectedLiterals = ['EXHIBIT-42', '6/13'];

const candidate = generateHushSwapCandidate({ sourceText, mask, maskProfile: mask.profile, protectedLiterals, index: 0 });
assert(candidate.id);
assert(candidate.text);
assert(candidate.profile);

const scored = scoreHushSwapCandidate({ sourceText, mask, maskProfile: mask.profile, protectedLiterals, candidate, contextType: 'group-chat' });
assert(Number.isFinite(scored.finalScore));
assert(scored.scoreBreakdown);
for (const key of ['maskMatch', 'semanticFidelity', 'protectedLiteralScore', 'sourceReductionScore', 'contextSafetyScore', 'residualPressure']) {
  assert(Object.prototype.hasOwnProperty.call(scored.scoreBreakdown, key), `missing score ${key}`);
}
assert(scored.match);
assert(scored.residualVector);
assert(scored.residualSummary);
assert(scored.lockbox);
assert(scored.lockboxVerification);
assert(scored.lockboxSummary);
assert(scored.steeringPlan);
assert(scored.steeringSummary);
assert(scored.escapeVector);
assert(scored.ingestionAudit);
assert(scored.controllerDecision);
assert(scored.recognitionField);

const result = buildHushSwap({ sourceText, mask, maskProfile: mask.profile, protectedLiterals, contextType: 'group-chat', options: { candidateCount: 5 } });
assert.equal(result.version, 'phase-12');
assert(result.candidates.length >= 5);
assert(result.selectedCandidateId);
assert(Object.prototype.hasOwnProperty.call(result, 'allCandidatesFailed'));
assert(result.lockbox);
assert(result.lockboxSummary);
assert(result.maskLifecycle);
assert(result.maskLifecycleSummary);
assert(result.claimCeiling);
assert(result.recognitionField);
if (!result.allCandidatesFailed) {
  assert(result.selectedOutput);
  assert(result.match);
  assert(result.residualVector);
  assert(result.steeringPlan);
} else {
  assert.equal(result.selectedOutput, '');
  assert(result.failureReason.includes('prettiest failed candidate'));
}

const best = chooseBestHushSwapCandidate(result.candidates);
assert.equal(best.id, result.selectedCandidateId);
assert(Object.prototype.hasOwnProperty.call(best, 'belowViabilityThreshold'));

const badCandidate = scoreHushSwapCandidate({
  sourceText,
  mask,
  maskProfile: mask.profile,
  protectedLiterals,
  candidate: { id: 'bad', text: 'File attached only.', profile: candidate.profile },
  contextType: 'group-chat'
});
assert(badCandidate.warnings.includes('protected-literal-drop'));
assert(badCandidate.scoreBreakdown.protectedLiteralScore < 1);
assert(badCandidate.vetoes.length >= 1);

const exportedDefault = exportHushSwapJson(result);
const parsedDefault = JSON.parse(exportedDefault);
assert(exportedDefault.includes('phase-12'));
if (result.selectedOutput) assert(!exportedDefault.includes(result.selectedOutput), 'default export should exclude selected output');
assert.equal(parsedDefault.reproducibility.privateTextIncluded, false);
assert.equal(parsedDefault.reproducibility.exportMode, 'share-export');
assert.equal(Object.prototype.hasOwnProperty.call(parsedDefault, 'selectedOutput'), false);
assert(Array.isArray(parsedDefault.candidates));
assert(parsedDefault.candidates.every((item) => !Object.prototype.hasOwnProperty.call(item, 'text')));
assert(parsedDefault.candidates.every((item) => !Object.prototype.hasOwnProperty.call(item, 'escapeVector')));
assert(parsedDefault.candidates.every((item) => !Object.prototype.hasOwnProperty.call(item, 'controllerDecision')));

const exportedWithText = exportHushSwapJson(result, { includePrivateText: true });
if (result.selectedOutput) assert(exportedWithText.includes(result.selectedOutput));
assert(JSON.parse(exportedWithText).reproducibility.privateTextIncluded);

console.log('hush-swap tests passed');
