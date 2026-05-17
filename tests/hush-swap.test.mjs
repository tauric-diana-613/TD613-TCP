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
import { detectForbiddenClaims } from '../app/engine/claim-ladder.js';

assert.equal(HUSH_SWAP_VERSION, 'phase-11');

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
for (const key of ['maskMatch', 'semanticFidelity', 'protectedLiteralScore', 'sourceReductionScore', 'contextSafetyScore']) {
  assert(Object.prototype.hasOwnProperty.call(scored.scoreBreakdown, key), `missing score ${key}`);
}
assert(scored.match);
assert(scored.escapeVector);
assert(scored.ingestionAudit);
assert(scored.controllerDecision);
assert(scored.recognitionField);

const result = buildHushSwap({ sourceText, mask, maskProfile: mask.profile, protectedLiterals, contextType: 'group-chat', options: { candidateCount: 5 } });
assert.equal(result.version, 'phase-11');
assert(result.selectedOutput);
assert(result.candidates.length >= 5);
assert(result.selectedCandidateId);
assert(result.match);
assert(result.escapeVector);
assert(result.ingestionAudit);
assert(result.controllerDecision);
assert(result.claimCeiling);
assert(result.recognitionField);

const best = chooseBestHushSwapCandidate(result.candidates);
assert.equal(best.id, result.selectedCandidateId);

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

const exportedDefault = exportHushSwapJson(result);
assert(exportedDefault.includes('phase-11'));
assert(!exportedDefault.includes(result.selectedOutput), 'default export should exclude selected output');
assert.equal(detectForbiddenClaims(exportedDefault).hasForbiddenClaim, false);

const exportedWithText = exportHushSwapJson(result, { includePrivateText: true });
assert(exportedWithText.includes(result.selectedOutput));

console.log('hush-swap tests passed');
