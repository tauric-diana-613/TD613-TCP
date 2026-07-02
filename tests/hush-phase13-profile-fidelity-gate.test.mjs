import assert from 'node:assert/strict';
import { HUSH_PHASE13_MASK_FIDELITY_PROFILES } from '../app/data/hush-phase13-mask-fidelity-profiles.js';
import { HUSH_PHASE13_GATE_SCHEMA, evaluatePhase13Candidate } from '../app/engine/hush-phase13-profile-fidelity-gate.js';

assert.ok(HUSH_PHASE13_MASK_FIDELITY_PROFILES.length >= 13);
for (const profile of HUSH_PHASE13_MASK_FIDELITY_PROFILES) {
  assert.equal(profile.schema, 'td613-hush-phase13-mask-fidelity-profile/v1');
  assert.ok(profile.mask_id);
  assert.ok(profile.mask_label);
  assert.ok(profile.layout_mode);
  assert.ok(profile.positive_fidelity_markers.length >= 3, profile.mask_label);
  assert.ok(profile.synthetic_failure_markers.length >= 3, profile.mask_label);
  assert.ok(profile.mask_native_variance_markers.length >= 2, profile.mask_label);
}

const evaluated = evaluatePhase13Candidate({
  mask_id: 'luz-index',
  source_text: 'Bundle:\n1. FILE-72 remains attached.\n2. Footer mismatch is not resolved.\n\nCare note stays visible.',
  candidate_text: '1. FILE-72 remains attached.\n2. Footer mismatch is not resolved.\n\nCare note stays visible.'
});
assert.equal(evaluated.schema, HUSH_PHASE13_GATE_SCHEMA);
assert.equal(evaluated.phase, 13);
assert.equal(evaluated.mask_id, 'luz-index');
assert.ok(evaluated.profile_fidelity_score > 0.62, JSON.stringify(evaluated));
assert.ok(evaluated.non_claims.includes('authorship proof'));

console.log('hush-phase13-profile-fidelity-gate: ok');
