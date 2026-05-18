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
  detectHushMaskWarnings
} from '../app/engine/hush-mask-studio.js';
import { detectForbiddenClaims } from '../app/engine/claim-ladder.js';

assert.equal(HUSH_MASK_STUDIO_VERSION, 'phase-11');
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
assert(masks.every((mask) => mask.version === 'phase-11'));
assert(masks.every((mask) => mask.profile));
assert(masks.every((mask) => mask.profileSummary));

const plain = getHushMask('plain-witness');
assert.equal(plain.id, 'plain-witness');
assert(plain.profile.wordCount > 0);

const hydrated = hydrateHushMask(plain);
assert(hydrated.profileStatus);
assert(Array.isArray(hydrated.warnings));

const profile = buildHushMaskProfile(plain);
assert.equal(profile.version, 'phase-11');
assert.equal(profile.maskId, 'plain-witness');
assert(profile.profileSummary.wordCount > 0);
assert(profile.limitations.length);

const summary = summarizeHushMask(plain);
assert.equal(summary.id, 'plain-witness');
assert(summary.profileSummary.wordCount > 0);

const json = exportHushMaskJson(plain);
assert(json.includes('Plain Witness'));
assert(!json.includes(plain.sampleSeed), 'default export should exclude sample seed');
assert.equal(detectForbiddenClaims(json).hasForbiddenClaim, false);

const warnings = detectHushMaskWarnings({ id: 'x', label: 'X', sampleSeed: 'tiny', intendedUse: 'test', riskTell: 'test' });
assert(warnings.includes('mask-reference-short'));

console.log('hush-mask-studio tests passed');
