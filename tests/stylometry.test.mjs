import assert from 'assert';
import {
  applyCadenceToText,
  applyCadenceShell,
  buildCadenceSignature,
  charTrigramProfile,
  compareTexts,
  extractCadenceProfile,
  functionWordProfile,
  recurrencePressure,
  transformText
} from '../app/engine/stylometry.js';

const stripSurface = (text) => text
  .toLowerCase()
  .replace(/[^a-z0-9'\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const a = 'I keep a hush in my pocket, and the room remembers.';
const b = 'I keep a hush in my pocket, and the room remembers.';
const c = 'Brisk systems route plain text without pause.';
const same = compareTexts(a, b);
const diff = compareTexts(a, c);
const styleNearA = "I said I'd call when I got off the train, but the signal dropped and I had to walk the last few blocks. I'm here now, though, and the stairwell light is still flickering.";
const styleNearB = "I told you I'd ring when I left the bus, but the service cut out and I had to walk the last six blocks. I'm here now, though, and the hall light is still flickering.";
const styleFar = 'Arrival delayed. Signal dropped. Walked final blocks. Hall light flickers.';
const near = compareTexts(styleNearA, styleNearB);
const far = compareTexts(styleNearA, styleFar);

assert.equal(same.similarity, 1);
assert.equal(same.traceability, 1);
assert(same.similarity > diff.similarity);
assert(same.traceability >= diff.traceability);
assert(recurrencePressure(`line one\nline two\nline two`) > 0);
assert(typeof same.spreadDistance === 'number');
assert(typeof same.punctShapeDistance === 'number');
assert(typeof same.functionWordDistance === 'number');
assert(typeof same.wordLengthDistance === 'number');
assert(typeof same.charGramDistance === 'number');
assert(Object.keys(functionWordProfile('This is the sample and it is not alone.')).length > 0);
assert(Object.keys(charTrigramProfile('Signal route signal route')).length > 0);
assert(near.traceability > far.traceability);
assert(near.functionWordDistance < far.functionWordDistance);
assert(near.charGramDistance < far.charGramDistance);

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
const shellShiftSource = "I kept circling the point because I wasn't ready to say the hard part, and then I stalled again because the room went quiet.";
const shellShiftedText = applyCadenceToText(
  shellShiftSource,
  {
    mode: 'borrowed',
    profile: borrowedProfile,
    strength: 0.82
  }
);
const shellShiftedProfile = extractCadenceProfile(shellShiftedText);
const shellSourceProfile = extractCadenceProfile(shellShiftSource);
const connectiveSource = 'I do not know and I will wait because that door is stuck, but I am still outside.';
const connectiveShifted = applyCadenceToText(
  connectiveSource,
  {
    mode: 'borrowed',
    profile: borrowedProfile,
    strength: 0.82
  }
);

assert.notEqual(swapped.avgSentenceLength, baseProfile.avgSentenceLength);
assert.notEqual(swapped.contractionDensity, baseProfile.contractionDensity);
assert.notEqual(swapped.recurrencePressure, baseProfile.recurrencePressure);
assert(typeof swapped.functionWordProfile === 'object');
assert(typeof swapped.wordLengthProfile === 'object');
assert(typeof swapped.charTrigramProfile === 'object');
assert(transformedCadenceText.includes("don't") || transformedCadenceText.includes("can't"));
assert.notEqual(transformedCadenceText, 'I do not know and I cannot stay.');
assert.notEqual(shellShiftedText, shellShiftSource);
assert.notEqual(stripSurface(connectiveShifted), stripSurface(connectiveSource));
assert(shellShiftedProfile.avgSentenceLength < shellSourceProfile.avgSentenceLength);
assert(shellShiftedProfile.sentenceCount >= shellSourceProfile.sentenceCount);
assert(
  Math.abs(shellShiftedProfile.avgSentenceLength - borrowedProfile.avgSentenceLength) <
  Math.abs(shellSourceProfile.avgSentenceLength - borrowedProfile.avgSentenceLength)
);

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
