import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry, summarizePhase7RegistryForPhase8 } from '../app/engine/hush-mask-gallery-registry.js';
import { buildStylometricPassport, buildPhase8OntologyBindings } from '../app/engine/hush-phase8-stylometric-passport.js';
import { extractMaskFeatureVector, buildGenericAIBaseline, scoreCandidateAgainstMask } from '../app/engine/hush-stylometric-feature-vector.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-20T00:00:00Z' });
const handoff = summarizePhase7RegistryForPhase8(registry);
const mask = handoff.masks[0];
const passport = await buildStylometricPassport(mask);
assert.equal(passport.schema, 'td613.hush.phase8.stylometric-passport/v1');
assert.equal(passport.passport_tag, 'phase8-hard-metric-passport/v1');
assert.equal(passport.mask_id, mask.mask_id);
assert.ok(passport.mask_centroid.centroid_hash_sha256.startsWith('sha256:'));
assert.ok(passport.generic_ai_baseline.baseline_hash_sha256.startsWith('sha256:'));
assert.ok(passport.tolerance_bands.mandatory_anchor_retention >= 1);
assert.ok(passport.passport_hash_sha256.startsWith('sha256:'));

const vector = await extractMaskFeatureVector('idk rn the timestamp mismatch still stays visible, maybe keep the record sequence intact.');
assert.equal(vector.raw_text_included, false);
assert.ok(vector.feature_vector_hash_sha256.startsWith('sha256:'));
assert.ok(typeof vector.feature_vector.mean_sentence_length === 'number');

const baseline = await buildGenericAIBaseline();
const fit = scoreCandidateAgainstMask(vector, passport.mask_centroid, baseline);
assert.ok(typeof fit.mask_centroid_distance === 'number');
assert.ok(typeof fit.generic_ai_baseline_distance === 'number');

const ontology = buildPhase8OntologyBindings();
assert.ok(ontology.classes.includes('StylometricPassport'));
assert.ok(ontology.relations.some((item) => item.includes('StylometricPassport')));
assert.ok(ontology.forbidden_equivalences.length >= 1);

console.log('hush-phase8-stylometric-passport: ok');
