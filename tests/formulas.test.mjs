import assert from 'assert';
import {
  solveQuadratic,
  fieldPotential,
  waveStats,
  custodyThreshold,
  routePressure,
  providerDecision
} from '../app/engine/formulas.js';

const branch = solveQuadratic(1, -2, -3);
assert.deepEqual(branch.roots, [-1, 3]);
assert.equal(branch.classification, 'candidate-discovery-branch');

const pressure = routePressure(0.7, 0.6, 1, 0.5);
assert(pressure > 0.5 && pressure < 1);

const field = fieldPotential({ routePressure: pressure, mirrorLogic: 'off', containment: 'on' });
assert(field > 0 && field < 1);

const wave = waveStats({ traceability: 0.8, recurrencePressure: 0.5, fieldPotential: field });
assert.equal(wave.amplitude, 0.8);
assert(wave.k > 1);
assert(wave.density > 0);

assert.equal(custodyThreshold(0.8, 0.2, 0.2).archive, 'institutional');
assert.equal(custodyThreshold(0.3, 0.25, 0.2).archive, 'witness');

assert.equal(
  providerDecision({
    recognized: true,
    explained: false,
    routeAvailable: false,
    density: 0.3,
    recurrencePressure: 0.6
  }),
  'criticality'
);
assert.equal(
  providerDecision({
    recognized: true,
    explained: false,
    routeAvailable: true,
    density: 0.3,
    recurrencePressure: 0.6
  }),
  'passage'
);
assert.equal(
  providerDecision({
    recognized: false,
    explained: true,
    routeAvailable: false,
    density: 0.1,
    recurrencePressure: 0.1
  }),
  'weak-signal'
);

console.log('formulas.test.mjs passed');
