import assert from 'assert';
import {
  buildEscapeControllerDecision,
  computeControlError,
  deriveControllerBands
} from '../app/engine/escape-controller.js';

assert.equal(typeof buildEscapeControllerDecision, 'function');
assert.equal(typeof deriveControllerBands, 'function');
assert.equal(typeof computeControlError, 'function');

function vector(overrides = {}) {
  return {
    version: 'phase-test',
    mode: overrides.mode || 'neutralize',
    scores: {
      sourceResidualRisk: 0.22,
      maskFit: 0.72,
      maskDeltaSafe: 0.34,
      maskDeltaRaw: 0.34,
      semanticFidelity: 0.94,
      maskLinkability: 0.30,
      belongingWithoutCollapse: 0.78,
      ingestionFriction: 0.22,
      apertureRecaptureRisk: 0.20,
      ...(overrides.scores || {})
    },
    diagnostics: {
      sampleSufficiency: 'sufficient',
      warnings: [],
      historyStatus: 'measured',
      ...(overrides.diagnostics || {})
    }
  };
}

const sealDecision = buildEscapeControllerDecision({ vector: vector() });
assert.equal(sealDecision.state, 'seal');
assert.equal(sealDecision.action, 'seal-output');
assert(sealDecision.reasons.includes('all-controller-bands-satisfied'));

const restoreDecision = buildEscapeControllerDecision({
  vector: vector({
    scores: { semanticFidelity: 0.61, maskFit: 0.91, sourceResidualRisk: 0.18 },
    diagnostics: { warnings: ['protected-literal-missing'], sampleSufficiency: 'sufficient', historyStatus: 'measured' }
  })
});
assert.equal(restoreDecision.state, 'restore');
assert.equal(restoreDecision.action, 'repair-semantics');

const sourceDecision = buildEscapeControllerDecision({
  vector: vector({ scores: { sourceResidualRisk: 0.81, semanticFidelity: 0.93 } })
});
assert.equal(sourceDecision.state, 'continue');
assert(sourceDecision.steeringActions.some((item) => item.code === 'dampen-source-connectors' || item.code === 'neutralize-source'));

const maskPressureDecision = buildEscapeControllerDecision({
  vector: vector({ scores: { sourceResidualRisk: 0.20, maskFit: 0.36, maskDeltaSafe: 0.04, semanticFidelity: 0.93 } })
});
assert.equal(maskPressureDecision.state, 'continue');
assert(maskPressureDecision.steeringActions.some((item) => item.code === 'increase-mask-pressure'));

const rotateDecision = buildEscapeControllerDecision({
  vector: vector({
    mode: 'rotating-mask',
    scores: { sourceResidualRisk: 0.20, maskFit: 0.70, maskDeltaSafe: 0.40, semanticFidelity: 0.93, maskLinkability: 0.82, ingestionFriction: 0.22, apertureRecaptureRisk: 0.20 }
  }),
  mode: 'rotating-mask'
});
assert.equal(rotateDecision.state, 'rotate');
assert.equal(rotateDecision.action, 'rotate-persona');

const stableDecision = buildEscapeControllerDecision({
  vector: vector({
    mode: 'stable-pseudonym',
    scores: { sourceResidualRisk: 0.20, maskFit: 0.72, maskDeltaSafe: 0.34, semanticFidelity: 0.94, maskLinkability: 0.52, belongingWithoutCollapse: 0.78, ingestionFriction: 0.22, apertureRecaptureRisk: 0.20 },
    diagnostics: { sampleSufficiency: 'sufficient', warnings: [], historyStatus: 'measured' }
  }),
  mode: 'stable-pseudonym'
});
assert.notEqual(stableDecision.state, 'rotate');

const sharedIngestionVector = vector({ scores: { ingestionFriction: 0.50 } });
const neutralDecision = buildEscapeControllerDecision({ vector: sharedIngestionVector, mode: 'neutralize' });
const hostileDecision = buildEscapeControllerDecision({
  vector: { ...sharedIngestionVector, mode: 'hostile-pipeline-compression' },
  mode: 'hostile-pipeline-compression'
});
assert.equal(neutralDecision.state, 'seal');
assert.notEqual(hostileDecision.state, 'seal');
assert(hostileDecision.steeringActions.some((item) => item.code === 'lower-ingestion-risk'));

const holdDecision = buildEscapeControllerDecision({
  vector: vector({
    scores: {},
    diagnostics: { warnings: ['missing-protected-baseline', 'missing-mask'], sampleSufficiency: 'unavailable' }
  })
});
assert.equal(holdDecision.state, 'hold');
assert.equal(holdDecision.action, 'hold-for-review');

const packetText = JSON.stringify(sealDecision.steeringPacket).toLowerCase();
for (const forbidden of ['anonymous', 'untraceable', 'platform-proof', 'same author', 'not same author', 'guaranteed safe']) {
  assert(!packetText.includes(forbidden));
}

const bands = deriveControllerBands({ mode: 'hostile-pipeline-compression' });
assert(bands.semanticFidelityMin > deriveControllerBands({ mode: 'neutralize' }).semanticFidelityMin);
assert(bands.ingestionFrictionMax < deriveControllerBands({ mode: 'neutralize' }).ingestionFrictionMax);

const error = computeControlError(vector({ scores: { sourceResidualRisk: 0.62 } }), deriveControllerBands({ mode: 'neutralize' }), 'neutralize');
assert(error.sourceResidual > 0);

console.log('escape-controller tests passed');
