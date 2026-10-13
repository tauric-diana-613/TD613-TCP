import assert from 'assert';
import {
  CLAIM_LEVELS,
  collectClaimLimitations,
  describeClaimLevel,
  detectForbiddenClaims,
  enforceClaimLanguage,
  evaluateClaimCeiling,
  normalizeClaimLevel
} from '../app/engine/claim-ladder.js';

const vector = (scores = {}) => ({
  scores: {
    sourceResidualRisk: null,
    maskFit: null,
    maskDeltaSafe: null,
    semanticFidelity: null,
    ingestionFriction: 0.2,
    apertureRecaptureRisk: 0.2,
    maskLinkability: null,
    maskDrift: null,
    ...scores
  }
});

const decision = (state = 'continue') => ({ state, action: state === 'seal' ? 'seal-output' : 'continue-steering' });

assert.equal(CLAIM_LEVELS.length, 8);
assert.equal(CLAIM_LEVELS[0].id, 'no-reliable-signal');
assert.equal(CLAIM_LEVELS.at(-1).id, 'requires-external-corroboration');
assert.equal(normalizeClaimLevel(5).id, 'mask-fit-candidate');
assert.equal(normalizeClaimLevel('style-contact').level, 3);
assert.equal(normalizeClaimLevel('bad-level').level, 1);
assert(describeClaimLevel(6).includes('Reduced source-linkage candidate'));

const missing = evaluateClaimCeiling({});
assert.equal(missing.level, 1);
assert(missing.limitations.some((item) => item.includes('Escape Vector')));

const moderate = evaluateClaimCeiling({
  escapeVector: vector({ maskFit: 0.39, semanticFidelity: 0.8, sourceResidualRisk: 0.62, maskDeltaSafe: -0.1 }),
  controllerDecision: decision('continue'),
  iterationLedger: { rows: [{ changedDimensions: ['punctuation-shift', 'sentence-rhythm'] }] }
});
assert(moderate.level === 3 || moderate.level === 4, `expected level 3 or 4, got ${moderate.level}`);

const traceable = evaluateClaimCeiling({
  escapeVector: vector({ maskFit: 0.49, semanticFidelity: 0.83, sourceResidualRisk: 0.58, maskDeltaSafe: -0.02 }),
  controllerDecision: decision('continue'),
  iterationLedger: { rows: [{ changedDimensions: ['punctuation-shift', 'sentence-rhythm', 'connector-shift'] }] }
});
assert.equal(traceable.level, 4);

const maskFit = evaluateClaimCeiling({
  escapeVector: vector({ maskFit: 0.68, semanticFidelity: 0.9, sourceResidualRisk: 0.56, maskDeltaSafe: 0.12 }),
  controllerDecision: decision('continue'),
  iterationLedger: { rows: [{ changedDimensions: ['punctuation-shift', 'sentence-rhythm'] }] }
});
assert.equal(maskFit.level, 5);

const reduced = evaluateClaimCeiling({
  escapeVector: vector({ maskFit: 0.7, semanticFidelity: 0.9, sourceResidualRisk: 0.32, maskDeltaSafe: 0.26, apertureRecaptureRisk: 0.25 }),
  controllerDecision: decision('seal'),
  iterationLedger: { rows: [{ changedDimensions: ['punctuation-shift', 'sentence-rhythm'] }] }
});
assert.equal(reduced.level, 6);

const stable = evaluateClaimCeiling({
  escapeVector: vector({ maskFit: 0.72, semanticFidelity: 0.92, sourceResidualRisk: 0.3, maskDeltaSafe: 0.31, apertureRecaptureRisk: 0.25, maskLinkability: 0.48, maskDrift: 0.2 }),
  controllerDecision: decision('seal'),
  personaSummary: { acceptedCount: 4, field: { linkabilityStatus: 'usable' } },
  iterationLedger: { accepted: { iterationIds: ['a', 'b', 'c', 'd'] }, rows: [{ changedDimensions: ['punctuation-shift', 'sentence-rhythm'] }] },
  reportIntent: 'stable-pseudonym local review'
});
assert.equal(stable.level, 7);

const proof = evaluateClaimCeiling({
  escapeVector: vector({ maskFit: 0.9, semanticFidelity: 0.95, sourceResidualRisk: 0.1, maskDeltaSafe: 0.7 }),
  controllerDecision: decision('seal'),
  reportIntent: 'identity proof requested'
});
assert.equal(proof.level, 8);
assert(proof.warnings.includes('external-corroboration-required'));

for (const phrase of ['anonymous', 'untraceable', 'platform-proof', 'same author', 'not same author', 'guaranteed safe']) {
  const detected = detectForbiddenClaims(`This output is ${phrase}.`);
  assert.equal(detected.hasForbiddenClaim, true, `expected forbidden detection for ${phrase}`);
  assert.equal(detected.severity, 'block');
}

const disclaimerText = 'This report does not claim anonymity. This report does not claim untraceability. This report does not claim platform-proof behavior. This report does not issue same-author or not-same-author identity verdicts.';
assert.equal(detectForbiddenClaims(disclaimerText).hasForbiddenClaim, false);
assert.equal(enforceClaimLanguage({ text: 'This output is untraceable.' }).allowed, false);
assert.equal(enforceClaimLanguage({ text: 'This report does not claim untraceability.' }).allowed, true);
assert(collectClaimLimitations({ escapeVector: vector({ semanticFidelity: 0.7 }), controllerDecision: decision('continue') }).length > 0);

console.log('claim-ladder tests passed');
