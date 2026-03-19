import assert from 'assert';
import {
  applyCadenceToText,
  applyCadenceShell,
  buildCadenceSignature,
  compareTexts,
  extractCadenceProfile,
  recurrencePressure,
  transformText
} from '../app/engine/stylometry.js';

const a = 'I keep a hush in my pocket, and the room remembers.';
const b = 'I keep a hush in my pocket, and the room remembers.';
const c = 'Brisk systems route plain text without pause.';
const same = compareTexts(a, b);
const diff = compareTexts(a, c);

assert.equal(same.similarity, 1);
assert.equal(same.traceability, 1);
assert(same.similarity > diff.similarity);
assert(same.traceability >= diff.traceability);
assert(recurrencePressure(`line one\nline two\nline two`) > 0);
assert(typeof same.spreadDistance === 'number');
assert(typeof same.punctShapeDistance === 'number');

const transformed = transformText('I do not know and I cannot stay.', { sent: 0, cont: 1, punc: 0 });
assert(transformed.includes("don't") || transformed.includes("can't"));

const baseProfile = extractCadenceProfile(
  "Honestly, I kept circling the point because I wasn't ready to say the hard part."
);
const borrowedProfile = extractCadenceProfile(
  "Need the charger. Front door sticks. Knock twice if the light is out. I'm in back."
);
const swapped = applyCadenceShell(baseProfile, {
  mode: 'borrowed',
  profile: borrowedProfile,
  strength: 0.82
});
const transformedCadenceText = applyCadenceToText(
  'I do not know and I cannot stay.',
  { mode: 'borrowed', mod: { sent: -1, cont: 1, punc: 1 } }
);

assert.notEqual(swapped.avgSentenceLength, baseProfile.avgSentenceLength);
assert.notEqual(swapped.contractionDensity, baseProfile.contractionDensity);
assert.notEqual(swapped.recurrencePressure, baseProfile.recurrencePressure);
assert(transformedCadenceText.includes("don't") || transformedCadenceText.includes("can't"));
assert.notEqual(transformedCadenceText, 'I do not know and I cannot stay.');

const signature = buildCadenceSignature(
  "I kept talking because the first version sounded too neat. Then I stopped, crossed it out, and started over."
);
const heatmapTotal = signature.heatmap.matrix.flat().reduce((sum, value) => sum + value, 0);

assert.equal(signature.axes.length, 7);
assert.equal(signature.heatmap.matrix.length, 4);
assert.equal(signature.heatmap.matrix[0].length, 4);
assert.equal(signature.dominantAxes.length, 3);
assert(Math.abs(heatmapTotal - 1) < 0.02);
assert(signature.axes.every((axis) => axis.normalized >= 0 && axis.normalized <= 1));

console.log('stylometry.test.mjs passed');
