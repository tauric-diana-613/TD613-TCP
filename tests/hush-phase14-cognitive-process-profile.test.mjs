import assert from 'node:assert/strict';
import { HUSH_PHASE14_COGNITIVE_PROCESS_PROFILES, HUSH_PHASE14_PROCESS_PROFILE_SCHEMA } from '../app/data/hush-phase14-cognitive-process-profiles.js';
import { HUSH_PHASE14_GATE_SCHEMA, evaluatePhase14Candidate } from '../app/engine/hush-phase14-cognitive-authorship-gate.js';

assert.ok(HUSH_PHASE14_COGNITIVE_PROCESS_PROFILES.length >= 13);
for (const profile of HUSH_PHASE14_COGNITIVE_PROCESS_PROFILES) {
  assert.equal(profile.schema, HUSH_PHASE14_PROCESS_PROFILE_SCHEMA);
  assert.ok(profile.process_profile_id.startsWith('phase14-'), profile.mask_label);
  assert.ok(profile.process_mode, profile.mask_label);
  assert.ok(profile.process_markers.length >= 4, profile.mask_label);
  assert.ok(profile.completion_failure_markers.length >= 4, profile.mask_label);
  assert.ok(profile.process_reward_markers.length >= 3, profile.mask_label);
  assert.ok(profile.thresholds.process_block_below < profile.thresholds.process_repair_below, profile.mask_label);
  assert.ok(profile.thresholds.completion_repair_above < profile.thresholds.completion_block_above, profile.mask_label);
}

const packet = evaluatePhase14Candidate({
  mask_id: 'grandma-receipts',
  source_text: 'FILE-72 is not resolved.',
  candidate_text: 'I remember the receipt first.\n\nFILE-72 is not resolved.\n\nBack to the receipt: that part matters later.',
  phase13_profile_fidelity_score: 0.78
});
assert.equal(packet.schema, HUSH_PHASE14_GATE_SCHEMA);
assert.equal(packet.phase, 14);
assert.equal(packet.mask_id, 'grandma-receipts');
assert.ok(packet.non_claims.includes('process fidelity is not human-authorship proof'));

console.log('hush-phase14-cognitive-process-profile: ok');
