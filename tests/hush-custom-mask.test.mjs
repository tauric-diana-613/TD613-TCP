import assert from 'assert';
import {
  HUSH_CUSTOM_MASK_VERSION,
  createCustomMask,
  addCustomMaskSample,
  removeCustomMaskSample,
  rebuildCustomMaskProfile,
  summarizeCustomMask,
  exportCustomMaskJson,
  importCustomMaskJson,
  validateCustomMask
} from '../app/engine/hush-custom-mask.js';

assert.equal(HUSH_CUSTOM_MASK_VERSION, 'phase-11');

let mask = createCustomMask({ label: 'River Mask' });
assert.equal(mask.source, 'custom');
assert.equal(mask.sampleCount, 0);
assert(mask.warnings.includes('no-samples'));

mask = addCustomMaskSample(mask, 'tiny sample', { includePrivateText: true });
assert.equal(mask.sampleCount, 1);
assert(mask.totalWords > 0);
assert(mask.warnings.includes('short-sample'));
assert(mask.warnings.includes('thin-mask'));

mask = addCustomMaskSample(mask, 'I am writing a second sample with enough plain detail to refine the local mask profile. The sentence rhythm stays ordinary, and the facts stay visible so the profile can measure more than one breath.', { includePrivateText: true });
assert.equal(mask.sampleCount, 2);
assert(mask.totalWords > 20);
assert(mask.compositeProfile);

const summary = summarizeCustomMask(mask);
assert.equal(summary.label, 'River Mask');
assert.equal(summary.sampleCount, 2);
assert(summary.profileSummary.wordCount >= 0);

const exportedDefault = exportCustomMaskJson(mask);
assert(exportedDefault.includes('River Mask'));
assert(!exportedDefault.includes('second sample with enough plain detail'), 'default export should exclude raw sample text');
assert(exportedDefault.includes('privateTextIncluded'));

const exportedWithText = exportCustomMaskJson(mask, { includePrivateText: true });
assert(exportedWithText.includes('second sample with enough plain detail'));

const restored = importCustomMaskJson(exportedDefault);
assert.equal(restored.label, 'River Mask');
assert.equal(restored.sampleCount, 2);
assert(restored.compositeProfile);

const validation = validateCustomMask(mask);
assert.equal(validation.valid, true, validation.failures.join(', '));

const noProfile = validateCustomMask(createCustomMask({ label: 'Empty' }));
assert.equal(noProfile.valid, false);
assert(noProfile.failures.includes('missing-profile'));

const removed = removeCustomMaskSample(mask, mask.samples[0].id);
assert.equal(removed.sampleCount, 1);

const emptySample = addCustomMaskSample(createCustomMask({ label: 'Empty Add' }), '');
assert(emptySample.warnings.includes('empty-sample'));

console.log('hush-custom-mask tests passed');
