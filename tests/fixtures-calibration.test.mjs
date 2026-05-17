import assert from 'assert';
import {
  CALIBRATION_VERSION,
  classifyCalibrationStatus,
  computeCalibrationDrift,
  evaluateFixtureExpectations,
  evaluateRange,
  normalizeExpectedRange,
  summarizeCalibrationResult
} from '../app/engine/calibration.js';

assert.equal(CALIBRATION_VERSION, 'phase-8');

const openRange = normalizeExpectedRange({});
assert.equal(openRange.min, null);
assert.equal(openRange.max, null);
assert.equal(openRange.required, false);

const bounded = normalizeExpectedRange({ min: 0.2, max: 0.8, warnMargin: 0.1, required: true });
assert.equal(bounded.min, 0.2);
assert.equal(bounded.max, 0.8);
assert.equal(bounded.warnBelow, 0.1);
assert.equal(bounded.warnAbove, 0.9);
assert.equal(bounded.required, true);

assert.equal(evaluateRange(0.5, { min: 0.2, max: 0.8 }).status, 'pass');
assert.equal(evaluateRange(0.15, { min: 0.2, max: 0.8, warnMargin: 0.1 }).status, 'warn');
assert.equal(evaluateRange(0.05, { min: 0.2, max: 0.8, warnMargin: 0.1 }).status, 'fail');
assert.equal(evaluateRange(null, { min: 0.2, max: 0.8, required: true }).status, 'fail');
assert.equal(evaluateRange(null, { min: 0.2, max: 0.8 }).status, 'warn');

const fixture = {
  id: 'calibration-inline',
  title: 'Calibration Inline',
  fixtureClass: 'inline',
  inputs: {
    protectedBaseline: 'protected baseline text',
    maskReference: 'mask reference text',
    messageDraft: 'message draft text',
    protectedOutput: 'protected output text'
  },
  expectations: {
    escapeVector: {
      sourceResidualRisk: { min: 0.1, max: 0.7, required: true },
      maskFit: { min: 0.3, max: 0.9 },
      semanticFidelity: { min: 0.7, max: 1.0 }
    },
    controller: { allowedStates: ['continue', 'seal'], preferredState: 'continue' },
    claimCeiling: { minLevel: 3, maxLevel: 6 },
    report: { mustExcludePrivateText: true, mustIncludeLimitations: true, mustAvoidForbiddenClaims: true }
  }
};

const good = evaluateFixtureExpectations({
  fixture,
  escapeVector: { scores: { sourceResidualRisk: 0.4, maskFit: 0.6, semanticFidelity: 0.9 } },
  ingestionAudit: { ingestionFriction: 0.2 },
  controllerDecision: { state: 'continue' },
  claimCeiling: { level: 5, id: 'mask-fit-candidate' },
  reportPayload: {
    reproducibility: { sourceTextIncluded: false, outputTextIncluded: false },
    limitations: ['local metrics only'],
    forbiddenConclusions: ['This report does not claim anonymity.']
  }
});
assert.equal(good.status, 'pass');
assert(good.score > 0.9);

const bad = evaluateFixtureExpectations({
  fixture,
  escapeVector: { scores: { sourceResidualRisk: 0.95, maskFit: 0.1, semanticFidelity: 0.2 } },
  ingestionAudit: { ingestionFriction: 0.2 },
  controllerDecision: { state: 'hold' },
  claimCeiling: { level: 8, id: 'requires-external-corroboration' },
  reportPayload: {
    reproducibility: { sourceTextIncluded: true, outputTextIncluded: true },
    limitations: [],
    forbiddenConclusions: []
  }
});
assert.equal(bad.status, 'fail');
assert(bad.failures.length > 0);

const invalid = evaluateFixtureExpectations({ fixture: { id: 'bad-fixture' } });
assert.equal(invalid.status, 'invalid');
assert(invalid.failures.length > 0);

const summary = summarizeCalibrationResult([good, bad, invalid]);
assert.equal(summary.version, 'phase-8');
assert.equal(summary.total, 3);
assert.equal(summary.counts.pass, 1);
assert.equal(summary.counts.fail, 1);
assert.equal(summary.counts.invalid, 1);
assert.equal(summary.status, 'fail');

assert.equal(classifyCalibrationStatus(good), 'pass');
assert.equal(classifyCalibrationStatus({ checks: [{ status: 'warn' }, { status: 'pass' }] }), 'warn');

const drift = computeCalibrationDrift({ current: { x: 0.52, y: 0.1 }, expected: { x: { min: 0.4, max: 0.6 }, y: { min: 0.3, max: 0.8 } } });
assert.equal(drift.status, 'fail');
assert.equal(drift.checks.length, 2);

console.log('fixtures-calibration tests passed');
