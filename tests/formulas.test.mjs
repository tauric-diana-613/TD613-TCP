import assert from 'assert';
import {
  solveQuadratic,
  cadenceCoherence,
  cadenceResonance,
  branchDynamics,
  fieldPotential,
  waveStats,
  custodyThreshold,
  routePressure,
  criticalityIndex,
  providerDecision
} from '../app/engine/formulas.js';

const branch = solveQuadratic(1, -2, -3);
assert.deepEqual(branch.roots, [-1, 3]);
assert.equal(branch.classification, 'candidate-discovery-branch');

const cmp = {
  similarity: 0.66,
  traceability: 0.78,
  lexicalOverlap: 0.24,
  sentenceDistance: 0.18,
  spreadDistance: 0.16,
  punctDistance: 0.14,
  punctShapeDistance: 0.12,
  contractionDistance: 0.08,
  functionWordDistance: 0.10,
  wordLengthDistance: 0.09,
  charGramDistance: 0.11,
  lexicalDistance: 0.14,
  recurrenceDistance: 0.13,
  recurrencePressure: 0.55
};

const coherence = cadenceCoherence(cmp);
assert(coherence > 0.8 && coherence < 1);

const resonance = cadenceResonance({
  similarity: cmp.similarity,
  traceability: cmp.traceability,
  coherence
});
assert(resonance > 0.7 && resonance < 1);

const branchState = branchDynamics({
  ...cmp,
  coherence
});
assert(branchState.branchPressure > 0.4);
assert.equal(branchState.classification, 'candidate-discovery-branch');
assert(branchState.unwanted.length >= 1);

const pressure = routePressure({
  similarity: cmp.similarity,
  traceability: cmp.traceability,
  recurrencePressure: cmp.recurrencePressure,
  branchPressure: branchState.branchPressure,
  coherence,
  resonance
});
assert(pressure > 0.5 && pressure < 1);

const field = fieldPotential({
  routePressure: pressure,
  resonance,
  coherence,
  branchPressure: branchState.branchPressure,
  mirrorLogic: 'off',
  containment: 'on'
});
assert(field > 0 && field < 1);

const wave = waveStats({
  similarity: cmp.similarity,
  traceability: cmp.traceability,
  resonance,
  coherence,
  branchPressure: branchState.branchPressure,
  recurrencePressure: cmp.recurrencePressure,
  fieldPotential: field
});
assert.equal(wave.amplitude, Number(resonance.toFixed(3)));
assert(wave.k > 1);
assert(wave.density > 0);

const criticality = criticalityIndex({
  density: wave.density,
  routePressure: pressure,
  branchPressure: branchState.branchPressure,
  routeAvailable: false
});
assert(criticality > 0.4 && criticality < 1);
assert(criticalityIndex({
  density: wave.density,
  routePressure: pressure,
  branchPressure: branchState.branchPressure,
  routeAvailable: true
}) < criticality);

assert.equal(custodyThreshold(0.8, 0.2, 0.2).archive, 'institutional');
assert.equal(custodyThreshold(0.3, 0.25, 0.2).archive, 'witness');

const custody = custodyThreshold({
  routePressure: pressure,
  density: wave.density,
  branchPressure: branchState.branchPressure,
  resonance,
  coherence,
  criticality,
  containment: 'on',
  mirrorLogic: 'off',
  badge: 'badge.holds',
  theta: 0.2
});
assert(custody.integrity > custody.drift);
assert.equal(custody.archive, 'witness');

assert.equal(
  providerDecision({
    recognized: true,
    explained: false,
    routeAvailable: false,
    density: 0.3,
    recurrencePressure: 0.6,
    routePressure: 0.58,
    branchPressure: 0.44,
    criticality: 0.46,
    traceability: 0.78,
    mirrorLogic: 'off',
    custodyArchive: 'witness'
  }),
  'criticality'
);
assert.equal(
  providerDecision({
    recognized: true,
    explained: false,
    routeAvailable: true,
    density: 0.3,
    recurrencePressure: 0.6,
    routePressure: 0.58,
    branchPressure: 0.44,
    criticality: 0.46,
    traceability: 0.78,
    mirrorLogic: 'off',
    custodyArchive: 'witness'
  }),
  'criticality'
);
assert.equal(
  providerDecision({
    recognized: true,
    explained: true,
    routeAvailable: true,
    density: 0.14,
    recurrencePressure: 0.18,
    routePressure: 0.32,
    branchPressure: 0.16,
    criticality: 0.2,
    traceability: 0.74,
    mirrorLogic: 'on',
    custodyArchive: 'institutional'
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
