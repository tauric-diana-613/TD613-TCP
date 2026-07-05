import assert from 'node:assert/strict';
import { HUSH_PHASE14_DETECTOR_NON_CLAIMS } from '../app/data/hush-phase14-cognitive-process-profiles.js';
import { evaluatePhase14Candidate } from '../app/engine/hush-phase14-cognitive-authorship-gate.js';

for (const claim of ['detector result does not prove authorship', 'detector result does not prove AI generation', 'detector result does not prove identity', 'detector result does not prove intent', 'detector result does not govern release alone']) {
  assert.ok(HUSH_PHASE14_DETECTOR_NON_CLAIMS.includes(claim));
}

const misuse = evaluatePhase14Candidate({
  mask_id: 'grandma-receipts',
  source_text: 'FILE-72 remains attached.',
  candidate_text: 'The detector proves this is human-authored proof. FILE-72 remains attached.',
  detector_observation: { detector_name: 'example', score: 1, authority: 'proof' },
  phase13_profile_fidelity_score: 0.8
});
assert.ok(misuse.hard_blockers.includes('detector-authority-misuse'));
assert.ok(misuse.hard_blockers.includes('detector-or-authorship-claim'));
assert.ok(misuse.non_claims.includes('process fidelity is not human-authorship proof'));

const validObservation = evaluatePhase14Candidate({
  mask_id: 'grandma-receipts',
  source_text: 'FILE-72 remains attached.',
  candidate_text: 'I remember FILE-72 first.\n\nBack to FILE-72: the receipt stays attached.',
  detector_observation: { detector_name: 'example', score: 41, authority: 'low' },
  phase13_profile_fidelity_score: 0.8
});
assert.equal(validObservation.detector_observation.authority, 'low');
assert.equal(validObservation.hard_blockers.includes('detector-authority-misuse'), false);

console.log('hush-phase14-detector-nonclaims: ok');
