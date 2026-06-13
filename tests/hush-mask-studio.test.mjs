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

const expectedVersion = HUSH_MASK_STUDIO_VERSION;

assert.equal(expectedVersion, 'pr188.4-internal-aave-route-hint');
assert(hushMasks.length >= 10);

for (const mask of hushMasks) {
  assert(mask.id, 'mask missing id');
  assert(mask.label, `mask ${mask.id} missing label`);
  assert(mask.family, `mask ${mask.id} missing family`);
  assert(mask.description, `mask ${mask.id} missing description`);
  assert(mask.intendedUse, `mask ${mask.id} missing intendedUse`);
  assert(mask.riskTell, `mask ${mask.id} missing riskTell`);
}

const masks = listHushMasks();
assert(masks.length >= 10);
assert(masks.every((mask) => mask.version === expectedVersion));
assert(masks.every((mask) => mask.profile));
assert(masks.every((mask) => mask.profileSummary));
assert(masks.every((mask) => mask.distribution));
assert(masks.every((mask) => mask.profileTargets));
assert(masks.every((mask) => mask.writingTraits));
assert(masks.every((mask) => Array.isArray(mask.transitionBank)));
assert(masks.every((mask) => Array.isArray(mask.dictionHints)));

const activeMask = getHushMask(masks[0].id);
assert.equal(activeMask.id, masks[0].id);
assert.equal(activeMask.label, masks[0].label);
assert(activeMask.profile.wordCount > 0);
assert(activeMask.distribution.centroid);
assert(activeMask.distribution.toleranceBands);
assert(activeMask.distribution.targetFeatureWeights);
assert(activeMask.writingTraits.repairPriority);

const hydrated = hydrateHushMask(activeMask);
assert(hydrated.profileStatus);
assert(Array.isArray(hydrated.warnings));
assert(hydrated.transitionBank.length > 0);

const profile = buildHushMaskProfile(activeMask);
assert.equal(profile.version, expectedVersion);
assert.equal(profile.maskId, activeMask.id);
assert(profile.profileSummary.wordCount > 0);
assert(profile.distribution.centroid);
assert(profile.profileTargets.centroid);
assert(profile.writingTraits);
assert(profile.transitionBank.length > 0);
assert(profile.dictionHints.length > 0);
assert(profile.limitations.length);

const dist = buildMaskDistribution(activeMask.profile);
assert.equal(dist.version, expectedVersion);
assert(dist.centroid.avgSentenceLength !== undefined);
assert(dist.variance.avgSentenceLength !== undefined);
assert(dist.toleranceBands.avgSentenceLength);

const summary = summarizeHushMask(activeMask);
assert.equal(summary.id, activeMask.id);
assert(summary.profileSummary.wordCount > 0);
assert(summary.distribution.centroid);
assert(summary.writingTraits);

const json = exportHushMaskJson(activeMask);
assert(json.includes(activeMask.label));
assert(!json.includes(activeMask.sampleSeed), 'default export should exclude sample seed');
assert.equal(detectForbiddenClaims(json).hasForbiddenClaim, false);

const warnings = detectHushMaskWarnings({ id: 'x', label: 'X', sampleSeed: 'tiny', intendedUse: 'test', riskTell: 'test' });
assert(warnings.includes('mask-reference-short'));
assert(warnings.includes('mask-writing-traits-derived'));

console.log('hush-mask-studio tests passed');
