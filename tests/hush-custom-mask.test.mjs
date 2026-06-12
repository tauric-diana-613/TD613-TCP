import assert from 'assert';
import {
  HUSH_CUSTOM_MASK_VERSION,
  HUSH_CUSTOM_MASK_CORPUS_POLICY,
  createCustomMask,
  addCustomMaskSample,
  removeCustomMaskSample,
  rebuildCustomMaskProfile,
  summarizeCustomMask,
  exportCustomMaskJson,
  importCustomMaskJson,
  validateCustomMask
} from '../app/engine/hush-custom-mask.js';

function sampleText(index, category = 'explanatory', count = HUSH_CUSTOM_MASK_CORPUS_POLICY.minWordsPerSample) {
  const tokens = Array.from({ length: count }, (_, tokenIndex) => `${category}${index}w${tokenIndex}`);
  const split = Math.ceil(tokens.length / 2);
  return `${tokens.slice(0, split).join(' ')}. ${tokens.slice(split).join(' ')}.`;
}

const categories = ['explanatory', 'argumentative', 'narrative', 'procedural', 'reflective'];

assert.equal(HUSH_CUSTOM_MASK_VERSION, 'phase-13-corpus');
assert.equal(HUSH_CUSTOM_MASK_CORPUS_POLICY.minWordsPerSample, 75);
assert.equal(HUSH_CUSTOM_MASK_CORPUS_POLICY.operationalSamples, 24);
assert.equal(HUSH_CUSTOM_MASK_CORPUS_POLICY.rigorousSamples, 40);

let mask = createCustomMask({ label: 'River Mask' });
assert.equal(mask.version, 'phase-13-corpus');
assert.equal(mask.source, 'custom');
assert.equal(mask.sampleCount, 0);
assert.equal(mask.acceptedSampleCount, 0);
assert.equal(mask.profileStatus, 'empty');
assert(mask.distribution);
assert(mask.profileTargets);
assert(mask.corpusPolicy);
assert(mask.corpusReadiness);
assert(mask.holdoutValidation);
assert(mask.warnings.includes('no-samples'));

mask = addCustomMaskSample(mask, 'tiny sample', { includePrivateText: true, promptCategory: 'explanatory' });
assert.equal(mask.sampleCount, 1);
assert.equal(mask.acceptedSampleCount, 0);
assert.equal(mask.profileStatus, 'empty');
assert(mask.samples[0].warnings.includes('below-75-word-floor'));
assert(mask.samples[0].eligibility === 'rejected-too-short');
assert(mask.warnings.includes('short-sample'));
assert(mask.warnings.includes('no-accepted-samples'));

mask = createCustomMask({ label: 'River Mask' });
for (let index = 0; index < 12; index += 1) {
  const category = categories[index % categories.length];
  mask = addCustomMaskSample(mask, sampleText(index, category), { includePrivateText: true, promptCategory: category });
}
assert.equal(mask.sampleCount, 12);
assert.equal(mask.acceptedSampleCount, 12);
assert.equal(mask.acceptedWords, 900);
assert.equal(mask.profileStatus, 'provisional');
assert(mask.corpusReadiness.heldoutSampleCount >= 1);
assert.equal(mask.corpusReadiness.generationAllowed, false);

for (let index = 12; index < 24; index += 1) {
  const category = categories[index % categories.length];
  mask = addCustomMaskSample(mask, sampleText(index, category), { includePrivateText: true, promptCategory: category });
}
assert.equal(mask.sampleCount, 24);
assert.equal(mask.acceptedSampleCount, 24);
assert.equal(mask.acceptedWords, 1800);
assert.equal(mask.profileStatus, 'operational');
assert.equal(mask.corpusReadiness.generationAllowed, true);
assert.equal(mask.corpusReadiness.rigorousEligible, false);
assert(mask.warnings.includes('operational-not-rigorous'));

for (let index = 24; index < 40; index += 1) {
  const category = categories[index % categories.length];
  mask = addCustomMaskSample(mask, sampleText(index, category), { includePrivateText: true, promptCategory: category });
}
assert.equal(mask.sampleCount, 40);
assert.equal(mask.acceptedSampleCount, 40);
assert.equal(mask.acceptedWords, 3000);
assert.equal(mask.profileStatus, 'rigorous');
assert.equal(mask.corpusReadiness.rigorousEligible, true);
assert(mask.promptCategorySummary.explanatory);
assert(mask.sampleEligibilityLedger.length === 40);

const summary = summarizeCustomMask(mask);
assert.equal(summary.label, 'River Mask');
assert.equal(summary.sampleCount, 40);
assert.equal(summary.acceptedSampleCount, 40);
assert.equal(summary.profileStatus, 'rigorous');
assert(summary.corpusReadiness);
assert(summary.distribution);

const exportedDefault = exportCustomMaskJson(mask);
assert(exportedDefault.includes('phase-13-corpus'));
assert(exportedDefault.includes('River Mask'));
assert(!exportedDefault.includes('explanatory0w0'), 'default export should exclude raw sample text');
assert(exportedDefault.includes('privateTextIncluded'));
assert(exportedDefault.includes('profileTargets'));
assert(exportedDefault.includes('corpusReadiness'));
assert(exportedDefault.includes('sampleEligibilityLedger'));

const exportedWithText = exportCustomMaskJson(mask, { includePrivateText: true });
assert(exportedWithText.includes('explanatory0w0'));

const restored = importCustomMaskJson(exportedDefault);
assert.equal(restored.label, 'River Mask');
assert.equal(restored.sampleCount, 40);
assert(restored.compositeProfile);
assert(restored.distribution);
assert(restored.corpusReadiness);

const validation = validateCustomMask(mask);
assert.equal(validation.valid, true, validation.failures.join(', '));

const noProfile = validateCustomMask(createCustomMask({ label: 'Empty' }));
assert.equal(noProfile.valid, false);
assert(noProfile.failures.includes('missing-profile'));

const removed = removeCustomMaskSample(mask, mask.samples[0].id);
assert.equal(removed.sampleCount, 39);
assert.equal(removed.version, 'phase-13-corpus');
assert(removed.profileStatus !== 'rigorous');

const emptySample = addCustomMaskSample(createCustomMask({ label: 'Empty Add' }), '');
assert(emptySample.warnings.includes('empty-sample'));

console.log('hush-custom-mask tests passed');
