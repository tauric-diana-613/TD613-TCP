import assert from 'assert';
import {
  buildEscapeVector,
  computeMaskDelta,
  computeSourceRiskEnvelope,
  deriveClaimLadder
} from '../app/engine/escape-vector.js';

const thresholds = { minWords: 5, semanticFidelityFloor: 0.75 };
const closeEnough = (actual, expected, tolerance = 0.00001) => Math.abs(actual - expected) < tolerance;

const protectedBaseline = `I kept circling the room because I was not ready to say the hard part, and then I stalled again because the room went quiet. Honestly, I kept threading every clause through a little ache, because the whole point was not just what happened, but how long it took anyone to notice.`;

const maskReference = `Need the charger. Front door sticks. Knock twice if the porch light is out. Bring the small bag, not the blue one. I am in back. Keep it simple. Say less. Move fast.`;

const closeToSource = `I kept circling the room because I was not ready to say the hard part, and then I stalled again when everything went quiet. Honestly, I kept threading each clause through the ache because the point was not only what happened, but how long it took anyone to notice.`;

const closeToMask = `Need the charger. The front door sticks. Knock twice if the porch light is out. Bring the small bag, not the blue one. I am in back. Keep it simple. Move fast.`;

const farOutput = `The quarterly file uses a neutral format. Each section lists the item, date, custodian, and action taken. Nothing in this note relies on rhythm, metaphor, or scene-setting.`;

const baseInput = {
  protectedBaselineText: protectedBaseline,
  maskText: maskReference,
  draftText: `Please preserve EXHIBIT-42 and the May 16 timeline while routing the message through a shorter field voice.`,
  outputText: closeToMask,
  protectedLiterals: ['EXHIBIT-42'],
  options: { thresholds, targetContext: 'secure group chat' }
};

assert.equal(typeof buildEscapeVector, 'function');
assert.equal(typeof deriveClaimLadder, 'function');

const closeSourceVector = buildEscapeVector({
  ...baseInput,
  outputText: closeToSource,
  options: { thresholds, targetContext: 'secure group chat' }
});
const farSourceVector = buildEscapeVector({
  ...baseInput,
  outputText: farOutput,
  options: { thresholds, targetContext: 'secure group chat' }
});
assert(closeSourceVector.scores.sourceResidualRisk > farSourceVector.scores.sourceResidualRisk);

const closeMaskVector = buildEscapeVector({
  ...baseInput,
  outputText: closeToMask,
  options: { thresholds, targetContext: 'secure group chat' }
});
const farMaskVector = buildEscapeVector({
  ...baseInput,
  outputText: farOutput,
  options: { thresholds, targetContext: 'secure group chat' }
});
assert(closeMaskVector.scores.maskFit > farMaskVector.scores.maskFit);

assert(closeEnough(closeMaskVector.scores.maskDeltaRaw, closeMaskVector.scores.maskFit - closeMaskVector.views.sourceRisk.raw));

const delta = computeMaskDelta({
  sourceRisk: { raw: 0.4, normalized: 0.5, visible: 0.3 },
  maskFit: { raw: 0.7, normalized: 0.6, visible: 0.55 }
});
assert(closeEnough(delta.raw, 0.3));
assert(closeEnough(delta.normalized, 0.1));
assert(closeEnough(delta.visible, 0.25));
assert(closeEnough(delta.safe, 0.1));

const envelope = computeSourceRiskEnvelope({ raw: 0.2, normalized: 0.4, visible: 0.3, semantic: 0.5, glyph: 0.9 });
assert.equal(envelope, 0.9);

const missingLiteralVector = buildEscapeVector({
  protectedBaselineText: protectedBaseline,
  maskText: maskReference,
  draftText: `The protected reference is EXHIBIT-42 and the report date is 2026-05-16.`,
  outputText: `The protected reference is omitted and the report date is 2026-05-16.`,
  protectedLiterals: ['EXHIBIT-42'],
  options: { thresholds, targetContext: 'secure group chat' }
});
assert(missingLiteralVector.diagnostics.warnings.includes('protected-literal-missing'));
assert(missingLiteralVector.scores.semanticFidelity < 1);

const historyVector = buildEscapeVector({
  ...baseInput,
  outputText: closeToMask,
  maskHistory: [
    `Need the badge. Back gate sticks. Knock twice if the window light is off. Keep it short.`,
    `Bring the paper bag. Front step creaks. Say less and move fast. I am in back.`,
    `Call once. Door sticks. Take the small bag and leave the big one. Keep it plain.`
  ],
  options: { thresholds, mode: 'stable-pseudonym', targetContext: 'secure group chat' }
});
assert.equal(historyVector.diagnostics.historyStatus, 'measured');
assert.equal(typeof historyVector.scores.maskLinkability, 'number');

const claimText = `${closeMaskVector.claim.label} ${closeMaskVector.claim.ceiling}`.toLowerCase();
for (const forbidden of ['anonymous', 'untraceable', 'platform-proof', 'same author', 'not same author', 'guaranteed safe']) {
  assert(!claimText.includes(forbidden));
}

const lowClaim = deriveClaimLadder({
  scores: {},
  diagnostics: { warnings: ['missing-mask'], sampleSufficiency: 'unavailable' },
  thresholds
});
assert.equal(lowClaim.label, 'No reliable signal');

const incompleteVector = buildEscapeVector({ outputText: 'Only an output surface is present here.' });
assert(incompleteVector.diagnostics.warnings.includes('missing-protected-baseline'));
assert(incompleteVector.diagnostics.warnings.includes('missing-mask'));
assert.equal(incompleteVector.claim.label, 'No reliable signal');

console.log('escape-vector tests passed');
