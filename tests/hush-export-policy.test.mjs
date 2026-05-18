import assert from 'assert';
import {
  HUSH_EXPORT_POLICY_VERSION,
  HUSH_EXPORT_MODES,
  normalizeHushExportMode,
  getHushExportPolicy,
  buildHushExportPayload,
  exportHushPolicyJson,
  detectExportOverDisclosure
} from '../app/engine/hush-export-policy.js';

assert.equal(HUSH_EXPORT_POLICY_VERSION, 'phase-12');
assert(HUSH_EXPORT_MODES['share-export']);
assert(HUSH_EXPORT_MODES['review-export']);
assert(HUSH_EXPORT_MODES['legal-export']);

assert.equal(normalizeHushExportMode('nope'), 'share-export');
assert.equal(getHushExportPolicy('review-export').includeFullVectors, true);

const result = {
  version: 'phase-12',
  selectedOutput: 'Private selected output EXHIBIT-42',
  selectedCandidateId: 'candidate-1',
  candidates: [{ id: 'candidate-1', text: 'Private candidate text', finalScore: 0.7, scoreBreakdown: { maskMatch: 0.8 }, match: { matchScore: 0.8, toleranceStatus: 'strong', protectedLiteralStatus: 'preserved', warnings: [] }, escapeVector: { private: true } }],
  lockbox: { literals: [{ id: 'lit-1', literal: 'EXHIBIT-42', literalHash: 'h123', type: 'exhibit', locked: true }] },
  lockboxVerification: { checks: [{ literal: 'EXHIBIT-42', literalHash: 'h123', preserved: true }], missing: [] },
  claimCeiling: { level: 5, id: 'mask-fit-candidate', label: 'Mask-fit candidate', forbiddenConclusions: ['nope'], warnings: [] },
  escapeVector: { scores: { sourceResidualRisk: 0.2 } },
  warnings: []
};

const share = buildHushExportPayload(result, { mode: 'share-export' });
assert.equal(share.reproducibility.privateTextIncluded, false);
assert.equal(Object.prototype.hasOwnProperty.call(share, 'selectedOutput'), false);
assert.equal(share.candidates[0].text, undefined);
assert.equal(share.lockbox.literals[0].literal, null);
assert.equal(share.escapeVector, null);

const shareJson = exportHushPolicyJson(result, { mode: 'share-export' });
assert(!shareJson.includes('Private selected output'));
assert(!shareJson.includes('Private candidate text'));
assert(!shareJson.includes('EXHIBIT-42'));
assert.equal(detectExportOverDisclosure(shareJson).hasRawTextField, false);
assert.equal(detectExportOverDisclosure(shareJson).hasLiteralValue, false);

const review = buildHushExportPayload(result, { mode: 'review-export' });
assert(review.escapeVector);
assert.equal(review.lockbox.literals[0].literal, null);

const privateFull = exportHushPolicyJson(result, { mode: 'private-full-export' });
assert(privateFull.includes('Private selected output'));
assert(privateFull.includes('EXHIBIT-42'));
assert.equal(detectExportOverDisclosure(privateFull).hasRawTextField, true);

console.log('hush-export-policy tests passed');
