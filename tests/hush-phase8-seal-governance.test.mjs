import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildHushMaskGalleryRegistry } from '../app/engine/hush-mask-gallery-registry.js';
import { buildStylometricPassport } from '../app/engine/hush-phase8-stylometric-passport.js';

const completedMaskIds = [
  'phase28-transform-to-chatspeak',
  'group-chat-soft',
  'night-shift-note',
  'phase22-jagged-record',
  'grandma-receipts',
  'library-ghost',
  'phase27-register-preserve',
  'soft-snark',
  'burner-minimal',
  'phase28-transform-to-aave',
  'quirky-orbit',
  'forum-regular',
  'clipboard'
];

const governanceFloorKeys = [
  'public_default_allowed',
  'raw_sample_text_allowed',
  'candidate_text_stored',
  'sample_seed_phrase_overlap_max',
  'sample_seed_lexical_overlap_max',
  'profile_reconstruction_risk_max'
];

const optionalNumericGateKeys = [
  'bounded_irregularity_index_min',
  'bounded_irregularity_index_max',
  'mask_centroid_distance_max',
  'mask_family_fit_min',
  'role_behavior_fit_min'
];

const centroidBaseKeys = [
  'mean_sentence_length',
  'sentence_length_cv',
  'lexical_density',
  'generic_helper_voice_score',
  'api_sheen_score',
  'bounded_irregularity_index',
  'source_adaptive',
  'public_default_allowed'
];

const expectedGateTests = [
  'hush-phase8-glitching-pixie-gold-fixtures.test.mjs',
  'hush-phase8-keisha-soft-circle-fixtures.test.mjs',
  'hush-phase8-handoff-fixtures.test.mjs',
  'hush-phase8-rex-fractura-fixtures.test.mjs',
  'hush-phase8-receipts-queenie-fixtures.test.mjs',
  'hush-phase8-sol-stratigraphix-fixtures.test.mjs',
  'hush-phase8-harbor-zora-fixtures.test.mjs',
  'hush-phase8-nolan-needler-fixtures.test.mjs',
  'hush-phase8-blooping-blip-fixtures.test.mjs',
  'hush-phase8-blackstar-sheree-fixtures.test.mjs',
  'hush-phase8-lulu-quasar-fixtures.test.mjs',
  'hush-phase8-forum-pseudonym-fixtures.test.mjs',
  'hush-phase8-luz-index-fixtures.test.mjs'
];

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-24T20:00:00Z' });
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const gateScript = packageJson.scripts['test:hush:phase8:gate'];
const suiteText = fs.readFileSync('scripts/hush-test-suite.txt', 'utf8');

for (const id of completedMaskIds) {
  const record = registry.records.find((entry) => entry.mask_id === id);
  assert.ok(record, `missing registry record: ${id}`);
  assert.equal(record.claim_ceiling.not_public_default, true, `${id}: public default claim ceiling`);
  assert.equal(record.sample_seed_policy.raw_sample_export_allowed, false, `${id}: raw sample export disabled`);
  const passport = await buildStylometricPassport(record);
  assert.equal(passport.minimum_evidence.raw_sample_text_allowed, false, `${id}: passport raw sample disabled`);
  assert.equal(passport.minimum_evidence.candidate_text_stored, false, `${id}: candidate text not stored`);
  assert.equal(passport.tolerance_bands.public_default_allowed, false, `${id}: threshold public default false`);
  for (const key of governanceFloorKeys) assert.ok(Object.hasOwn(passport.tolerance_bands, key), `${id}: missing governance floor ${key}`);
  for (const key of optionalNumericGateKeys) {
    if (Object.hasOwn(passport.tolerance_bands, key)) assert.equal(typeof passport.tolerance_bands[key], 'number', `${id}: calibrated numeric gate ${key}`);
  }
  if (id === 'burner-minimal') {
    assert.equal(Object.hasOwn(passport.tolerance_bands, 'bounded_irregularity_index_min'), false, `${id}: uncalibrated bounded irregularity gate not inherited`);
    assert.equal(Object.hasOwn(passport.tolerance_bands, 'mask_centroid_distance_max'), false, `${id}: uncalibrated centroid distance gate not inherited`);
  }
  const centroid = passport.mask_centroid.centroid_features || {};
  for (const key of centroidBaseKeys) assert.ok(Object.hasOwn(centroid, key), `${id}: missing centroid key ${key}`);
}

const fallbackPassport = await buildStylometricPassport({ mask_id: 'unknown-phase8-fallback', label: 'Unknown fallback' });
assert.equal(fallbackPassport.tolerance_bands.public_default_allowed, false, 'fallback: public default false');
for (const key of governanceFloorKeys) assert.ok(Object.hasOwn(fallbackPassport.tolerance_bands, key), `fallback: missing governance floor ${key}`);

for (const testFile of expectedGateTests) {
  assert.ok(gateScript.includes(testFile), `package gate missing ${testFile}`);
  assert.ok(suiteText.includes(testFile), `hush suite missing ${testFile}`);
}

console.log('hush-phase8-seal-governance: ok');
