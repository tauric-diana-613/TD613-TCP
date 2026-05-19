import assert from 'assert';
import {
  HUSH_RELEASE_POLICY_VERSION,
  buildReleasePolicy,
  classifyHushReasons,
  isExactOrNearExactSourceBody,
  summarizeReleasePolicy
} from '../app/engine/hush-release-policy.js';

assert.equal(HUSH_RELEASE_POLICY_VERSION, 'phase-18');

const residualOnly = buildReleasePolicy({
  outputText: 'For reference, EXHIBIT-42 stayed attached on 6/13.',
  protectedLiterals: ['EXHIBIT-42', '6/13'],
  semanticFidelity: 1,
  protectedLiteralScore: 1,
  naturalnessScore: 1,
  reasons: ['critical-residual-dimension-hot', 'source-residual-high']
});
assert.equal(residualOnly.hardBlocked, false);
assert.equal(residualOnly.releaseStatus, 'needs-review');
assert.equal(residualOnly.mayPopulateOutput, true);
assert.equal(residualOnly.maySeal, false);
assert(residualOnly.reviewWarnings.includes('critical-residual-dimension-hot'));

const sourceAttached = buildReleasePolicy({
  outputText: 'For reference, EXHIBIT-42 stayed attached on 6/13.',
  protectedLiterals: ['EXHIBIT-42', '6/13'],
  semanticFidelity: 1,
  protectedLiteralScore: 1,
  naturalnessScore: 1,
  maskMatch: 0.8,
  sourceResidue: { warnings: ['source-body-attached'], metrics: { cadenceBodyRisk: 0.7 } },
  sourceResidueScore: 0.3
});
assert.equal(sourceAttached.hardBlocked, false);
assert.equal(sourceAttached.releaseStatus, 'needs-review');
assert(sourceAttached.reviewWarnings.includes('source-body-attached'));

const exactCopy = buildReleasePolicy({
  outputText: 'Please keep EXHIBIT-42 attached on 6/13 and do not separate the date.',
  protectedLiterals: ['EXHIBIT-42', '6/13'],
  semanticFidelity: 1,
  protectedLiteralScore: 1,
  naturalnessScore: 1,
  maskMatch: 0.95,
  sourceResidue: { warnings: ['source-body-attached', 'source-body-severe'], metrics: { cadenceBodyRisk: 1, nonLiteralTokenRetention: 1, longestCopiedRun: 17 } },
  sourceResidueScore: 0
});
assert.equal(exactCopy.hardBlocked, true);
assert.equal(exactCopy.mayPopulateOutput, false);
assert(exactCopy.hardBlockReasons.includes('source-body-exact-or-near-exact'));
assert(isExactOrNearExactSourceBody({ metrics: { cadenceBodyRisk: 0.97, nonLiteralTokenRetention: 0.8, longestCopiedRun: 4 } }));
assert(isExactOrNearExactSourceBody({ metrics: { cadenceBodyRisk: 0.8, nonLiteralTokenRetention: 0.98, longestCopiedRun: 12 } }));

const severeWeak = buildReleasePolicy({
  outputText: 'For reference, EXHIBIT-42 stayed attached on 6/13.',
  protectedLiterals: ['EXHIBIT-42', '6/13'],
  semanticFidelity: 1,
  protectedLiteralScore: 1,
  naturalnessScore: 1,
  maskMatch: 0.2,
  sourceResidue: { warnings: ['source-body-severe'], metrics: { cadenceBodyRisk: 0.9 } },
  sourceResidueScore: 0.1
});
assert.equal(severeWeak.hardBlocked, true);
assert(severeWeak.hardBlockReasons.includes('source-body-severe-with-weak-mask-movement'));

const semanticFail = buildReleasePolicy({ outputText: 'Changed text.', semanticFidelity: 0.2, protectedLiteralScore: 1, naturalnessScore: 1 });
assert.equal(semanticFail.hardBlocked, true);
assert(semanticFail.hardBlockReasons.includes('semantic-fidelity-below-mode-floor'));
assert.equal(semanticFail.mayPopulateOutput, false);

const literalFail = buildReleasePolicy({ outputText: 'The record stayed attached.', protectedLiterals: ['EXHIBIT-42'], semanticFidelity: 1, protectedLiteralScore: 0, naturalnessScore: 1 });
assert.equal(literalFail.hardBlocked, true);
assert(literalFail.hardBlockReasons.includes('protected-literal-score-below-mode-floor'));

const naturalFail = buildReleasePolicy({ outputText: 'Text text text.', semanticFidelity: 1, protectedLiteralScore: 1, naturalnessScore: 0.1 });
assert.equal(naturalFail.hardBlocked, true);
assert(naturalFail.hardBlockReasons.includes('naturalness-catastrophic'));

const classified = classifyHushReasons(['critical-residual-dimension-hot', 'protected-literal-drop']);
assert(classified.reviewWarnings.includes('critical-residual-dimension-hot'));
assert(classified.hardBlockReasons.includes('protected-literal-drop'));

const summary = summarizeReleasePolicy(residualOnly);
assert.equal(summary.releaseStatus, 'needs-review');
assert.equal(summary.mayPopulateOutput, true);
assert.equal(summary.hardBlockCount, 0);
assert(summary.reviewWarningCount >= 1);

console.log('hush-release-policy tests passed');
