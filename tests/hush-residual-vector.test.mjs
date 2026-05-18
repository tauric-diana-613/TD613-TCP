import assert from 'assert';
import { extractCadenceProfile } from '../app/engine/stylometry.js';
import {
  HUSH_RESIDUAL_VECTOR_VERSION,
  RESIDUAL_DIMENSIONS,
  buildResidualVector,
  summarizeResidualVector,
  residualVeto
} from '../app/engine/hush-residual-vector.js';

assert.equal(HUSH_RESIDUAL_VECTOR_VERSION, 'phase-12');
assert(RESIDUAL_DIMENSIONS.length >= 6);

const sourceText = 'I keep returning to the same layered sentence rhythm, with repeated clauses, reflective pressure, and a very recognizable return pattern that keeps circling the point.';
const maskText = 'File attached. Date visible. Label unchanged. Keep together.';
const outputText = 'File attached. Date visible. Label unchanged. Keep together.';

const vector = buildResidualVector({ sourceText, outputText, maskProfile: extractCadenceProfile(maskText) });
assert.equal(vector.version, 'phase-12');
assert.equal(vector.dimensionCount, RESIDUAL_DIMENSIONS.length);
assert(Array.isArray(vector.dimensions));
assert(vector.largestResidualFeature);
assert(vector.summary);
assert(Number.isFinite(vector.summary.residualPressure));
assert(Number.isFinite(vector.summary.movementTowardMask));
assert(Array.isArray(vector.hotDimensions));
assert(Array.isArray(vector.criticalHotDimensions));

const summary = summarizeResidualVector(vector);
assert.equal(summary.version, 'phase-12');
assert(Object.prototype.hasOwnProperty.call(summary, 'largestResidualFeature'));
assert(Object.prototype.hasOwnProperty.call(summary, 'viableForSeal'));

const veto = residualVeto(vector, { maxResidual: 0.01, maxCritical: 0 });
assert.equal(veto.vetoed, true);
assert(veto.reasons.length >= 1);

const cool = buildResidualVector({ sourceText: maskText, outputText: maskText, maskProfile: extractCadenceProfile(maskText) });
assert(cool.summary.residualPressure <= vector.summary.residualPressure);

console.log('hush-residual-vector tests passed');
