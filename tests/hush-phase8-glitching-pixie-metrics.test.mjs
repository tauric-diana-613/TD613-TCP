import assert from 'node:assert/strict';
import { buildHushMaskGalleryRegistry, summarizePhase7RegistryForPhase8 } from '../app/engine/hush-mask-gallery-registry.js';
import { GLITCHING_PIXIE_THRESHOLDS } from '../app/engine/hush-phase8-numeric-decision.js';
import { buildStylometricPassport } from '../app/engine/hush-phase8-stylometric-passport.js';
import { buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes } from '../app/engine/hush-per-mask-metric-passport.js';

const registry = await buildHushMaskGalleryRegistry({ stableId: true, createdAt: '2026-06-20T00:00:00Z' });
const handoff = summarizePhase7RegistryForPhase8(registry);
const pixie = handoff.masks.find((mask) => mask.mask_id === 'phase28-transform-to-chatspeak');
assert.ok(pixie);
assert.equal(pixie.label, 'Glitching Pixie');

const passport = await buildStylometricPassport(pixie);
assert.equal(passport.tolerance_bands.source_unit_coverage_min, GLITCHING_PIXIE_THRESHOLDS.source_unit_coverage_min);
assert.equal(passport.tolerance_bands.hedge_retention_min, 0.95);
assert.equal(passport.tolerance_bands.abbreviation_rate_min, 0.02);
assert.equal(passport.tolerance_bands.sample_seed_phrase_overlap_max, 0);

const wrapped = await buildHushPerMaskPacketWithMetricPassport(pixie, {
  stableId: true,
  createdAt: '2026-06-20T00:01:00Z',
  queue: { registry_id: handoff.registry_id, registry_hash_sha256: handoff.registry_hash_sha256 },
  sourceText: 'idk maybe normal but the timestamp and mismatch still need to stay visible before dispatch.',
  candidate: 'idk rn maybe normal, but timestamp and mismatch still stay visible before dispatch.',
  sourceRetention: { compression_loss_rate: 0.05 },
  featureVector: { sample_seed_phrase_overlap: 0, rare_phrase_reuse: 0, mascot_language_repetition: 0 }
});
assert.equal(wrapped.schema, 'td613.hush.phase8.metric-passport-wrapper/v1');
assert.equal(wrapped.mask_id, pixie.mask_id);
assert.equal(wrapped.raw_candidate_included, false);
assert.equal(wrapped.raw_sample_text_included, false);
assert.equal(wrapped.public_default_allowed, false);
assert.equal(wrapped.stylometric_passport.mask_id, pixie.mask_id);
assert.equal(wrapped.candidate_realization_vector.raw_candidate_included, false);
assert.ok(['calibrated', 'repair_required', 'blocked'].includes(wrapped.packet_status));
assert.ok(wrapped.metric_packet_hash_sha256.startsWith('sha256:'));
const replay = await replayHushPerMaskMetricPassportHashes(wrapped);
assert.equal(replay.status, 'passed');

console.log('hush-phase8-glitching-pixie-metrics: ok');
