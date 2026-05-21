import assert from 'assert';
import hushMasks from '../app/data/hush-masks.js';
import {
  HUSH_MASK_STUDIO_VERSION,
  listHushMasks,
  getHushMask,
  hydrateHushMask,
  buildHushMaskProfile,
  summarizeHushMask,
  exportHushMaskJson,
  detectHushMaskWarnings,
  buildMaskDistribution
} from '../app/engine/hush-mask-studio.js';
import { detectForbiddenClaims } from '../app/engine/claim-ladder.js';

assert.equal(HUSH_MASK_STUDIO_VERSION, 'phase-16');
assert(hushMasks.length >= 20);

for (const mask of hushMasks) {
  assert(mask.id, 'mask missing id');
  assert(mask.label, `mask ${mask.id} missing label`);
  assert(mask.family, `mask ${mask.id} missing family`);
  assert(mask.description, `mask ${mask.id} missing description`);
  assert(mask.intendedUse, `mask ${mask.id} missing intendedUse`);
  assert(mask.riskTell, `mask ${mask.id} missing riskTell`);
}

const masks = listHushMasks();
assert(masks.length >= 20);
assert(masks.every((mask) => mask.version === 'phase-16'));
assert(masks.every((mask) => mask.profile));
assert(masks.every((mask) => mask.profileSummary));
assert(masks.every((mask) => mask.distribution));
assert(masks.every((mask) => mask.profileTargets));
assert(masks.every((mask) => mask.writingTraits));
assert(masks.every((mask) => Array.isArray(mask.transitionBank)));
assert(masks.every((mask) => Array.isArray(mask.dictionHints)));

const plain = getHushMask('plain-witness');
assert.equal(plain.id, 'plain-witness');
assert.equal(plain.label, 'Steady Mabel');
assert(plain.profile.wordCount > 0);
assert(plain.distribution.centroid);
assert(plain.distribution.toleranceBands);
assert(plain.distribution.targetFeatureWeights);
assert(plain.writingTraits.repairPriority === 'facts-first');

const hydrated = hydrateHushMask(plain);
assert(hydrated.profileStatus);
assert(Array.isArray(hydrated.warnings));
assert(hydrated.transitionBank.length > 0);

const profile = buildHushMaskProfile(plain);
assert.equal(profile.version, 'phase-16');
assert.equal(profile.maskId, 'plain-witness');
assert(profile.profileSummary.wordCount > 0);
assert(profile.distribution.centroid);
assert(profile.profileTargets.centroid);
assert(profile.writingTraits);
assert(profile.transitionBank.length > 0);
assert(profile.dictionHints.length > 0);
assert(profile.limitations.length);

const dist = buildMaskDistribution(plain.profile);
assert.equal(dist.version, 'phase-16');
assert(dist.centroid.avgSentenceLength !== undefined);
assert(dist.variance.avgSentenceLength !== undefined);
assert(dist.toleranceBands.avgSentenceLength);

const summary = summarizeHushMask(plain);
assert.equal(summary.id, 'plain-witness');
assert(summary.profileSummary.wordCount > 0);
assert(summary.distribution.centroid);
assert(summary.writingTraits);

const json = exportHushMaskJson(plain);
assert(json.includes('Steady Mabel'));
assert(!json.includes(plain.sampleSeed), 'default export should exclude sample seed');
assert.equal(detectForbiddenClaims(json).hasForbiddenClaim, false);

const warnings = detectHushMaskWarnings({ id: 'x', label: 'X', sampleSeed: 'tiny', intendedUse: 'test', riskTell: 'test' });
assert(warnings.includes('mask-reference-short'));
assert(warnings.includes('mask-writing-traits-derived'));

console.log('hush-mask-studio tests passed');