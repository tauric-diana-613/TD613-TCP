import assert from 'assert';
import {
  applyCadenceToText,
  applyCadenceShell,
  buildCadenceTransfer,
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
const nativeTransfer = buildCadenceTransfer(a, { mode: 'native' });
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
assert.equal(nativeTransfer.transferClass, 'native');

const transformed = transformText('I do not know and I cannot stay.', { sent: 0, cont: 1, punc: 0 });
const wrappedTransfer = buildCadenceTransfer(
  'I do not know and I cannot stay.',
  { mode: 'synthetic', mod: { sent: 0, cont: 1, punc: 0 }, strength: 0.76 }
);
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
const wrappedCadenceTransfer = buildCadenceTransfer(
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
const shellTransfer = buildCadenceTransfer(
  shellShiftSource,
  {
    mode: 'borrowed',
    profile: borrowedProfile,
    strength: 0.82
  }
);
const shellShiftCompare = compareTexts(shellShiftSource, shellShiftedText, {
  profileA: shellSourceProfile,
  profileB: shellShiftedProfile
});
const shellShiftDeltaCount = [
  Math.abs(shellShiftedProfile.avgSentenceLength - shellSourceProfile.avgSentenceLength) >= 1,
  Math.abs(shellShiftedProfile.sentenceCount - shellSourceProfile.sentenceCount) >= 1,
  Math.abs(shellShiftedProfile.contractionDensity - shellSourceProfile.contractionDensity) >= 0.012,
  Math.abs(shellShiftedProfile.lineBreakDensity - shellSourceProfile.lineBreakDensity) >= 0.04,
  shellShiftCompare.functionWordDistance >= 0.04
].filter(Boolean).length;
const connectiveSource = 'I do not know and I will wait because that door is stuck, but I am still outside.';
const connectiveShifted = applyCadenceToText(
  connectiveSource,
  {
    mode: 'borrowed',
    profile: borrowedProfile,
    strength: 0.82
  }
);
const connectorTarget = extractCadenceProfile(
  'Since the room stayed loud, I kept the note. Though the line dragged, I stayed. Then I left that mark behind.'
);
const connectorSource = 'Because the room stayed loud, I kept the note, but the line dragged, so I left this mark behind.';
const connectorShifted = applyCadenceToText(
  connectorSource,
  {
    mode: 'borrowed',
    profile: connectorTarget,
    strength: 0.88
  }
);
const connectorSourceProfile = extractCadenceProfile(connectorSource);
const connectorShiftedProfile = extractCadenceProfile(connectorShifted);
const connectorSourceToTarget = compareTexts(connectorSource, 'Since the room stayed loud, I kept the note. Though the line dragged, I stayed. Then I left that mark behind.', {
  profileA: connectorSourceProfile,
  profileB: connectorTarget
}).functionWordDistance;
const connectorShiftedToTarget = compareTexts(connectorShifted, 'Since the room stayed loud, I kept the note. Though the line dragged, I stayed. Then I left that mark behind.', {
  profileA: connectorShiftedProfile,
  profileB: connectorTarget
}).functionWordDistance;
const connectorShiftedLower = connectorShifted.toLowerCase();
const noNumberLeakTarget = extractCadenceProfile(
  "Need you to grab the charger on your way in. Front door sticks, so pull hard. If the downstairs light is off, knock twice. I'm in back."
);
const noNumberLeakSource = "Honestly, I was not trying to make a speech because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed. By the time I finished, which is apparently what I do, I was still buying time.";
const noNumberLeakShifted = applyCadenceToText(
  noNumberLeakSource,
  {
    mode: 'borrowed',
    profile: noNumberLeakTarget,
    strength: 0.9
  }
);
const noNumberLeakProfile = extractCadenceProfile(noNumberLeakShifted);
const noNumberLeakSourceProfile = extractCadenceProfile(noNumberLeakSource);
const literalSource = 'Meet me at 9:30, bring ID ZX-17, and keep "not for archive" exactly as written. Email hold@field.lab if the side-door note changes.';
const literalTransfer = buildCadenceTransfer(
  literalSource,
  {
    mode: 'borrowed',
    profile: borrowedProfile,
    strength: 0.9
  }
);
const mergeSource = 'Door sticks. Knock twice. I am in back.';
const mergeDonor = extractCadenceProfile(
  'Honestly, I kept circling the point because every time I tried to leave, I found one more reason to stay, and then I stalled again because the room went quiet.'
);
const mergeTransfer = buildCadenceTransfer(
  mergeSource,
  {
    mode: 'borrowed',
    profile: mergeDonor,
    strength: 0.88
  }
);
const mergeSourceProfile = extractCadenceProfile(mergeSource);
const mergeProfile = extractCadenceProfile(mergeTransfer.text);
const reverseContrastSource = 'Need the charger. Front door sticks. Knock twice if the light is out. I am in back.';
const reverseContrastDonor = extractCadenceProfile(
  'Honestly, I kept circling the point because every time I tried to leave, I found one more reason to stay, and then I stalled again because the room went quiet.'
);
const reverseContrastTransfer = buildCadenceTransfer(
  reverseContrastSource,
  {
    mode: 'borrowed',
    profile: reverseContrastDonor,
    strength: 0.9
  }
);
const reverseContrastSourceProfile = extractCadenceProfile(reverseContrastSource);
const reverseContrastProfile = extractCadenceProfile(reverseContrastTransfer.text);
const additiveGuardSource = 'Because the room stayed loud, I kept the note. But the line dragged. So I left this mark behind.';
const additiveGuardTransfer = buildCadenceTransfer(
  additiveGuardSource,
  {
    mode: 'borrowed',
    profile: reverseContrastDonor,
    strength: 0.9
  }
);
const additiveGlueCount = (additiveGuardTransfer.text.match(/(?:,\s+and\b|;\s+and\b|-\s+and\b)/gi) || []).length;
const additiveGuardLower = additiveGuardTransfer.text.toLowerCase();
const lowOpportunitySource = 'Stone settles under glass.';
const lowOpportunityTransfer = buildCadenceTransfer(
  lowOpportunitySource,
  {
    mode: 'borrowed',
    profile: borrowedProfile,
    strength: 0.9
  }
);
const truthGuardFormal = `I want to revise one phrase from my earlier recap before it starts hardening into the story. I wrote that the committee was considering a "service adjustment," which is technically true in the narrow memo sense and misleading in the lived one. What the table actually showed is that if the hiring freeze runs through Q3, the coordinator line stays empty for twelve more weeks and the intake queue either gets redistributed badly or evening hours shrink. Those are not abstract efficiencies. They are service consequences. Yes, we still have the same three provisional paths: temporary use of the analyst line, reduced evening coverage, or a reserve draw if finance confirms the rule and the dean signs off. But I do not want the language to get gentler than the problem just because we are waiting for the Thursday table.`;
const truthGuardRushed = `if youre late thats ok just dont start random jobs. check in west fence table first. glass + pallets first pass. saws stay under canopy b, kids stay off solvent side, paint only if wind chills out. 10:15 inventory stop still stands. pls bring water for real, not saying it to be annoying`;
const truthGuardFormalTransfer = buildCadenceTransfer(
  truthGuardFormal,
  {
    mode: 'borrowed',
    profile: extractCadenceProfile(truthGuardRushed),
    strength: 0.82,
    source: 'swapped'
  },
  { retrieval: true }
);
const truthGuardRushedTransfer = buildCadenceTransfer(
  truthGuardRushed,
  {
    mode: 'borrowed',
    profile: extractCadenceProfile(truthGuardFormal),
    strength: 0.82,
    source: 'swapped'
  },
  { retrieval: true }
);
const compressedSurfaceSource = 'If you are late, that is okay. Please do not start independent work before you check in at the west fence table first. Glass and pallets need a first pass. Saws stay under canopy B, and paint only if the wind settles. Please bring water.';
const compressedSurfaceTransfer = buildCadenceTransfer(
  compressedSurfaceSource,
  {
    mode: 'borrowed',
    profile: extractCadenceProfile(truthGuardRushed),
    strength: 0.82,
    source: 'swapped'
  },
  { retrieval: true }
);
const truthGuardFormalProfile = extractCadenceProfile(truthGuardFormal);
const truthGuardRushedProfile = extractCadenceProfile(truthGuardRushed);

assert.notEqual(swapped.avgSentenceLength, baseProfile.avgSentenceLength);
assert.notEqual(swapped.contractionDensity, baseProfile.contractionDensity);
assert.notEqual(swapped.recurrencePressure, baseProfile.recurrencePressure);
assert(typeof swapped.functionWordProfile === 'object');
assert(typeof swapped.wordLengthProfile === 'object');
assert(typeof swapped.charTrigramProfile === 'object');
assert(transformedCadenceText.includes("don't") || transformedCadenceText.includes("can't"));
assert.equal(transformed, wrappedTransfer.text);
assert.equal(transformedCadenceText, wrappedCadenceTransfer.text);
assert.notEqual(transformedCadenceText, 'I do not know and I cannot stay.');
assert.notEqual(shellShiftedText, shellShiftSource);
assert.equal(shellTransfer.text, shellShiftedText);
assert(shellTransfer.qualityGatePassed);
assert.equal(shellTransfer.transferClass, 'structural');
assert.equal(shellTransfer.realizationTier, 'lexical-structural');
assert(typeof shellTransfer.opportunityProfile === 'object');
assert(typeof shellTransfer.lexicalShiftProfile === 'object');
assert(Array.isArray(shellTransfer.lexemeSwaps));
assert(Array.isArray(shellTransfer.realizationNotes));
assert(typeof shellTransfer.semanticRisk === 'number');
assert(shellTransfer.protectedLiteralCount === 0);
assert(shellTransfer.changedDimensions.filter((dimension) => dimension !== 'punctuation-shape').length >= 2);
assert(shellTransfer.passesApplied.length >= 2);
assert.notEqual(stripSurface(connectiveShifted), stripSurface(connectiveSource));
assert(shellShiftDeltaCount >= 2);
assert.notEqual(stripSurface(connectorShifted), stripSurface(connectorSource));
assert(
  connectorShiftedLower.includes('since') ||
  connectorShiftedLower.includes('though') ||
  connectorShiftedLower.includes('then') ||
  connectorShiftedLower.includes('that')
);
assert(connectorShiftedToTarget < connectorSourceToTarget);
assert(!/\b\d+\b/.test(noNumberLeakShifted));
assert(
  noNumberLeakShifted.toLowerCase().includes('when') ||
  noNumberLeakShifted.includes("that's")
);
assert(noNumberLeakProfile.sentenceCount > noNumberLeakSourceProfile.sentenceCount);
assert(shellShiftedProfile.avgSentenceLength < shellSourceProfile.avgSentenceLength);
assert(shellShiftedProfile.sentenceCount >= shellSourceProfile.sentenceCount);
assert(
  Math.abs(shellShiftedProfile.avgSentenceLength - borrowedProfile.avgSentenceLength) <
  Math.abs(shellSourceProfile.avgSentenceLength - borrowedProfile.avgSentenceLength)
);
assert(literalTransfer.text.includes('9:30'));
assert(literalTransfer.text.includes('ZX-17'));
assert(literalTransfer.text.includes('"not for archive"'));
assert(literalTransfer.text.includes('hold@field.lab'));
assert(literalTransfer.protectedLiteralCount >= 4);
assert(
  mergeTransfer.transferClass === 'structural' ||
  mergeTransfer.changedDimensions.includes('sentence-count') ||
  mergeTransfer.changedDimensions.includes('sentence-mean')
);
assert(mergeProfile.sentenceCount <= mergeSourceProfile.sentenceCount);
assert(
  reverseContrastTransfer.transferClass === 'structural' ||
  reverseContrastTransfer.changedDimensions.includes('sentence-count') ||
  reverseContrastTransfer.changedDimensions.includes('sentence-mean')
);
assert(
  reverseContrastProfile.avgSentenceLength > reverseContrastSourceProfile.avgSentenceLength ||
  reverseContrastProfile.sentenceCount < reverseContrastSourceProfile.sentenceCount
);
assert(additiveGlueCount <= 1);
assert(
  additiveGuardTransfer.transferClass === 'rejected' ||
  additiveGuardLower.includes('because') ||
  additiveGuardLower.includes('since') ||
  additiveGuardLower.includes('though') ||
  additiveGuardLower.includes('yet') ||
  additiveGuardLower.includes('but') ||
  additiveGuardLower.includes('so') ||
  additiveGuardLower.includes('then')
);
assert(lowOpportunityTransfer.opportunityProfile.sentenceSplit === 0);
assert(lowOpportunityTransfer.opportunityProfile.sentenceMerge === 0);
assert(['weak', 'rejected'].includes(lowOpportunityTransfer.transferClass));
assert.notEqual(lowOpportunityTransfer.transferClass, 'structural');
assert(truthGuardRushedProfile.abbreviationDensity > truthGuardFormalProfile.abbreviationDensity);
assert(truthGuardRushedProfile.orthographicLooseness > truthGuardFormalProfile.orthographicLooseness);
assert(truthGuardRushedProfile.fragmentPressure > truthGuardFormalProfile.fragmentPressure);
assert(truthGuardRushedProfile.conversationalPosture > truthGuardFormalProfile.conversationalPosture);
assert.equal(compressedSurfaceTransfer.borrowedShellOutcome, 'structural');
assert.equal(compressedSurfaceTransfer.transferClass, 'structural');
assert.notEqual(compressedSurfaceTransfer.text, compressedSurfaceSource);
assert(compressedSurfaceTransfer.changedDimensions.includes('abbreviation-posture'));
assert(compressedSurfaceTransfer.changedDimensions.includes('orthography-posture'));
assert(/pls|thats|dont|if youre/i.test(compressedSurfaceTransfer.text.toLowerCase()));
assert.equal(truthGuardFormalTransfer.borrowedShellOutcome, 'structural');
assert.equal(truthGuardFormalTransfer.transferClass, 'structural');
assert.notEqual(truthGuardFormalTransfer.text, truthGuardFormal);
assert(!truthGuardFormalTransfer.text.includes('$1'));
assert(!truthGuardFormalTransfer.text.includes('signals off'));
assert(truthGuardFormalTransfer.changedDimensions.includes('abbreviation-posture'));
assert((truthGuardFormalTransfer.donorProgress?.donorImprovement || 0) > 0.5);
assert.equal(truthGuardRushedTransfer.borrowedShellOutcome, 'structural');
assert.equal(truthGuardRushedTransfer.transferClass, 'structural');
assert.notEqual(truthGuardRushedTransfer.text, truthGuardRushed);
assert(truthGuardRushedTransfer.changedDimensions.includes('abbreviation-posture'));
assert((truthGuardRushedTransfer.donorProgress?.donorImprovement || 0) > 0.5);

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
