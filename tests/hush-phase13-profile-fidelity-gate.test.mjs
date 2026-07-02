import assert from 'node:assert/strict';
import { HUSH_PHASE13_MASK_FIDELITY_PROFILES, HUSH_PHASE13_PROFILE_SCHEMA } from '../app/data/hush-phase13-mask-fidelity-profiles.js';

assert.ok(HUSH_PHASE13_MASK_FIDELITY_PROFILES.length >= 13);
for (const profile of HUSH_PHASE13_MASK_FIDELITY_PROFILES) {
  assert.equal(profile.schema, HUSH_PHASE13_PROFILE_SCHEMA);
  assert.ok(profile.mask_id, profile.mask_label);
  assert.ok(profile.mask_label, profile.mask_id);
  assert.ok(profile.layout_mode, profile.mask_id);
  assert.ok(profile.profile_id.startsWith('phase13-'), profile.mask_id);
  assert.ok(profile.positive_fidelity_markers.length >= 3, profile.mask_label);
  assert.ok(profile.synthetic_failure_markers.length >= 3, profile.mask_label);
  assert.ok(profile.mask_native_variance_markers.length >= 2, profile.mask_label);
  assert.ok(profile.thresholds.profile_block_below < profile.thresholds.profile_repair_below, profile.mask_label);
  assert.ok(profile.thresholds.smoothness_repair_above < profile.thresholds.smoothness_block_above, profile.mask_label);
}

console.log('hush-phase13-profile-fidelity-gate: ok');
