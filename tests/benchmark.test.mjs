import assert from 'assert';
import {
  buildCadenceTransfer,
  compareTexts,
  extractCadenceProfile,
  sentenceSplit
} from '../app/engine/stylometry.js';

const STRUCTURAL_DIMENSIONS = new Set([
  'sentence-mean',
  'sentence-count',
  'sentence-spread',
  'contraction-posture',
  'line-break-texture',
  'connector-stance'
]);

const LEXICAL_DIMENSIONS = new Set([
  'lexical-register',
  'content-word-complexity',
  'modifier-density',
  'directness',
  'abstraction-posture'
]);

function hasBannedConnectors(text = '') {
  return /(though\s+if|honestly[,;]\s+and|but\s+because|and\s+though\s+if)/gi.test(text);
}

function hasOrphanFragments(text = '') {
  return sentenceSplit(text).some((sentence, index) => {
    const normalized = sentence.trim().toLowerCase();
    return index > 0 &&
      /^(?:and|but|so|then|because|since|when|while|though|although)\s+\w{1,3}\s*$/.test(normalized);
  });
}

function structuralDimensions(changedDimensions = []) {
  return changedDimensions.filter((dimension) => STRUCTURAL_DIMENSIONS.has(dimension));
}

function lexicalDimensions(changedDimensions = []) {
  return changedDimensions.filter((dimension) => LEXICAL_DIMENSIONS.has(dimension));
}

function donorDistance(text, donorProfile) {
  const profile = typeof text === 'string' ? extractCadenceProfile(text) : text;
  const fit = compareTexts('', '', {
    profileA: profile,
    profileB: donorProfile
  });
  return Number((
    (fit.sentenceDistance || 0) +
    (fit.functionWordDistance || 0) +
    (fit.contractionDistance || 0) +
    (fit.punctShapeDistance || 0) +
    (fit.registerDistance || 0)
  ).toFixed(3));
}

function contractionDirectionMatches(sourceText, outputText, donorProfile) {
  const sourceProfile = extractCadenceProfile(sourceText);
  const outputProfile = extractCadenceProfile(outputText);
  const sourceDensity = sourceProfile.contractionDensity || 0;
  const outputDensity = outputProfile.contractionDensity || 0;
  const donorDensity = donorProfile.contractionDensity || 0;

  if (donorDensity > sourceDensity + 0.006) {
    return outputDensity >= sourceDensity;
  }

  if (donorDensity < sourceDensity - 0.006) {
    return outputDensity <= sourceDensity;
  }

  return true;
}

function assertFlagshipTransfer(id, sourceText, donorText, result) {
  const donorProfile = extractCadenceProfile(donorText);
  const sourceDistance = donorDistance(sourceText, donorProfile);
  const outputDistance = donorDistance(result.text, donorProfile);

  assert.equal(result.transferClass, 'structural', `${id}: transferClass should be structural`);
  assert.equal(result.realizationTier, 'lexical-structural', `${id}: realizationTier should be lexical-structural`);
  assert.notEqual(result.text, sourceText, `${id}: output should visibly change`);
  assert(structuralDimensions(result.changedDimensions).length >= 1, `${id}: at least 1 structural dimension changed`);
  assert(
    lexicalDimensions(result.changedDimensions).length >= 1 || (result.lexemeSwaps || []).length >= 1,
    `${id}: at least 1 lexical/register shift landed`
  );
  assert(contractionDirectionMatches(sourceText, result.text, donorProfile), `${id}: contraction posture aligns to donor`);
  assert(!hasBannedConnectors(result.text), `${id}: no banned connector stacks`);
  assert(!hasOrphanFragments(result.text), `${id}: no orphan fragments`);
  assert(outputDistance < sourceDistance, `${id}: donor distance should improve`);
}

console.log('=== Patch 25 Benchmark Suite ===\n');

const referenceVoice = `Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed. By the time I finished, I had used three qualifiers, two apologies, and the same phrase twice, which is apparently what I do when I'm buying time to say the hard part out loud.`;
const probeVoice = `Hey, if you're still out, grab the charger and use the side door. It sticks, so lean on it. If nobody hears you right away, wait a second and knock again. I'm in back unloading boxes, and I probably won't catch the first try.`;

console.log('SECTION A: Flagship Screenshot Transfers\n');

const screenshotRefUnderProbe = buildCadenceTransfer(referenceVoice, {
  mode: 'borrowed',
  profile: extractCadenceProfile(probeVoice),
  strength: 0.9
});
assertFlagshipTransfer('A1 reference->probe', referenceVoice, probeVoice, screenshotRefUnderProbe);
console.log(`  ✓ A1 ${screenshotRefUnderProbe.realizationTier} / ${screenshotRefUnderProbe.transferClass}`);

const screenshotProbeUnderRef = buildCadenceTransfer(probeVoice, {
  mode: 'borrowed',
  profile: extractCadenceProfile(referenceVoice),
  strength: 0.9
});
assertFlagshipTransfer('A2 probe->reference', probeVoice, referenceVoice, screenshotProbeUnderRef);
console.log(`  ✓ A2 ${screenshotProbeUnderRef.realizationTier} / ${screenshotProbeUnderRef.transferClass}\n`);

console.log('SECTION B: Structural + Register Contrast\n');

const operationalSource = 'Door sticks. Knock twice. I am in back.';
const reflectiveDonor = `Honestly, I kept circling the point because every time I tried to leave, I found one more reason to stay, and then I stalled again because the room went quiet.`;
const operationalToReflective = buildCadenceTransfer(operationalSource, {
  mode: 'borrowed',
  profile: extractCadenceProfile(reflectiveDonor),
  strength: 0.88
});
assertFlagshipTransfer('B1 operational->reflective', operationalSource, reflectiveDonor, operationalToReflective);
console.log(`  ✓ B1 ${operationalToReflective.text}`);

const reflectiveSource = `Honestly, I wasn't trying to make a speech. I just kept circling the story because every time I got to the part where I should have left, I remembered one more detail that changed why I stayed.`;
const operationalDonor = 'Hey, grab the charger. Use the side door. It sticks, so lean on it. I am in back.';
const reflectiveToOperational = buildCadenceTransfer(reflectiveSource, {
  mode: 'borrowed',
  profile: extractCadenceProfile(operationalDonor),
  strength: 0.88
});
assertFlagshipTransfer('B2 reflective->operational', reflectiveSource, operationalDonor, reflectiveToOperational);
console.log(`  ✓ B2 ${reflectiveToOperational.text}\n`);

console.log('SECTION C: Contraction Posture\n');

const moreContractedSource = 'I am not sure if it is ready. I will bring it when I can.';
const moreContractedDonor = `I'm not sure it's ready. I'll bring it when I can.`;
const moreContracted = buildCadenceTransfer(moreContractedSource, {
  mode: 'borrowed',
  profile: extractCadenceProfile(moreContractedDonor),
  strength: 0.9
});
assertFlagshipTransfer('C1 contraction-heavy', moreContractedSource, moreContractedDonor, moreContracted);
assert(moreContracted.text.includes("I'm") || moreContracted.text.includes("I'll"), 'C1: contractions should surface');
console.log(`  ✓ C1 ${moreContracted.text}`);

const lessContractedSource = `I'm sure it's ready. I'll bring it when I can.`;
const lessContractedDonor = 'I am certain it is ready. I will bring it when I can.';
const lessContracted = buildCadenceTransfer(lessContractedSource, {
  mode: 'borrowed',
  profile: extractCadenceProfile(lessContractedDonor),
  strength: 0.9
});
assertFlagshipTransfer('C2 contraction-light', lessContractedSource, lessContractedDonor, lessContracted);
assert(lessContracted.text.includes('I am') || lessContracted.text.includes('I will'), 'C2: contractions should expand');
console.log(`  ✓ C2 ${lessContracted.text}\n`);

console.log('SECTION D: Literal Safety and Low Opportunity\n');

const lowOpportunity = buildCadenceTransfer('Stone settles under glass.', {
  mode: 'borrowed',
  profile: extractCadenceProfile(probeVoice),
  strength: 0.9
});
assert(['weak', 'rejected'].includes(lowOpportunity.transferClass), 'D1: low-opportunity transfer should stay weak/rejected');
assert.notEqual(lowOpportunity.text, 'Stone settles under glass.', 'D1: non-literal low-opportunity text should still attempt visible movement');
assert((lowOpportunity.lexemeSwaps || []).length >= 1 || lexicalDimensions(lowOpportunity.changedDimensions).length >= 1, 'D1: lexical movement should land for non-literal low-opportunity text');
assert(!hasBannedConnectors(lowOpportunity.text), 'D1: no banned connectors');
console.log(`  ✓ D1 ${lowOpportunity.transferClass} -> ${lowOpportunity.text}`);

const protectedLiteralText = 'Meet at 9:30, bring ID ZX-17.';
const protectedLiteral = buildCadenceTransfer(protectedLiteralText, {
  mode: 'borrowed',
  profile: extractCadenceProfile(referenceVoice),
  strength: 0.9
});
assert(['weak', 'rejected'].includes(protectedLiteral.transferClass), 'D2: protected-literal case should stay weak/rejected');
assert(protectedLiteral.text.includes('9:30'), 'D2: timestamp survives');
assert(protectedLiteral.text.includes('ZX-17'), 'D2: ID survives');
assert(protectedLiteral.semanticRisk <= 0.35, 'D2: semantic risk stays bounded');
console.log(`  ✓ D2 literals held: ${protectedLiteral.text}\n`);

console.log('SECTION E: Pathology Blocking\n');

const pathologySource = 'Because the signal dropped, I was late. But I called to let you know. So the situation improved.';
const pathologyTransfer = buildCadenceTransfer(pathologySource, {
  mode: 'borrowed',
  profile: extractCadenceProfile(reflectiveDonor),
  strength: 0.9
});
assert(!hasBannedConnectors(pathologyTransfer.text), 'E1: no banned connectors');
assert(!hasOrphanFragments(pathologyTransfer.text), 'E1: no orphan fragments');
console.log(`  ✓ E1 pathology-safe output`);

const connectorStackSource = 'I left early though if the train arrived on time. Honestly, and also the signal worked. But because the door was unlocked, I stayed.';
const connectorStackTransfer = buildCadenceTransfer(connectorStackSource, {
  mode: 'borrowed',
  profile: extractCadenceProfile(referenceVoice),
  strength: 0.88
});
assert(
  connectorStackTransfer.transferClass === 'rejected' || !hasBannedConnectors(connectorStackTransfer.text),
  'E2: banned connector stacks are blocked or rejected'
);
console.log(`  ✓ E2 ${connectorStackTransfer.transferClass}\n`);

console.log('benchmark.test.mjs passed');
