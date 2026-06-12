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

function lineBrokenSample(index, category = 'line-broken', count = HUSH_CUSTOM_MASK_CORPUS_POLICY.minWordsPerSample) {
  const tokens = Array.from({ length: count }, (_, tokenIndex) => `${category}${index}w${tokenIndex}`);
  const splitA = Math.ceil(tokens.length / 3);
  const splitB = Math.ceil((tokens.length * 2) / 3);
  return `${tokens.slice(0, splitA).join(' ')}\n${tokens.slice(splitA, splitB).join(' ')}\n\n${tokens.slice(splitB).join(' ')}`;
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
assert(mask.surfaceCadence);
assert(mask.layoutCadence);
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
assert(mask.samples[0].surfaceCadence, 'sample should include surface cadence metadata');
assert(mask.samples[0].layoutCadence, 'sample should include layout cadence metadata');
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
assert(mask.sampleEligibilityLedger.every((entry) => entry.surfaceCadence));
assert.equal(typeof mask.surfaceCadence.lineBreaks.lineBreakDensity, 'number');
assert.equal(typeof mask.surfaceCadence.punctuation.punctuationDensity, 'number');

const summary = summarizeCustomMask(mask);
assert.equal(summary.label, 'River Mask');
assert.equal(summary.sampleCount, 40);
assert.equal(summary.acceptedSampleCount, 40);
assert.equal(summary.profileStatus, 'rigorous');
assert(summary.corpusReadiness);
assert(summary.distribution);
assert(summary.surfaceCadence);
assert(summary.layoutCadence);

const exportedDefault = exportCustomMaskJson(mask);
const parsedDefault = JSON.parse(exportedDefault);
assert(exportedDefault.includes('phase-13-corpus'));
assert(exportedDefault.includes('River Mask'));
assert(!exportedDefault.includes('explanatory0w0'), 'default export should exclude raw sample text');
assert(exportedDefault.includes('privateTextIncluded'));
assert(exportedDefault.includes('profileTargets'));
assert(exportedDefault.includes('corpusReadiness'));
assert(exportedDefault.includes('sampleEligibilityLedger'));
assert(exportedDefault.includes('surfaceCadence'));
assert(parsedDefault.samples.every((sample) => sample.text === null), 'default export must not include raw sample text');
assert(parsedDefault.samples.every((sample) => sample.surfaceCadence), 'default export should include sample surface cadence');
assert(parsedDefault.rebuilt.surfaceCadence, 'default export should include rebuilt surface cadence');
assert(parsedDefault.profile.surfaceCadence, 'default export should include profile surface cadence');
assert(parsedDefault.profileTargets.surfaceCadence, 'default export should include profileTargets surface cadence');
assert(parsedDefault.distribution.surfaceCadence, 'default export should include distribution surface cadence');
assert(parsedDefault.sampleEligibilityLedger.every((entry) => entry.surfaceCadence), 'ledger should summarize surface cadence');

const exportedWithText = exportCustomMaskJson(mask, { includePrivateText: true });
assert(exportedWithText.includes('explanatory0w0'));

const sparseMask = addCustomMaskSample(createCustomMask({ label: 'Sparse Surface' }), lineBrokenSample(1), { includePrivateText: true, promptCategory: 'line-broken' });
assert(sparseMask.samples[0].surfaceCadence.lineBreaks.lineBreakCount >= 2);
assert(['line-broken', 'paragraph-sensitive', 'long-paragraph-sensitive'].includes(sparseMask.samples[0].surfaceCadence.lineBreaks.tendency));
assert.equal(sparseMask.samples[0].surfaceCadence.punctuation.style, 'sparse');
assert(sparseMask.corpusWarnings.includes('surface-punctuation-sparse'));
assert(sparseMask.corpusWarnings.includes('surface-line-break-sensitive'));

const restored = importCustomMaskJson(exportedDefault);
assert.equal(restored.label, 'River Mask');
assert.equal(restored.sampleCount, 40);
assert(restored.compositeProfile);
assert(restored.distribution);
assert(restored.corpusReadiness);
assert(restored.surfaceCadence);

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
