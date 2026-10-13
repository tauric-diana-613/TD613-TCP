import assert from 'node:assert/strict';
import { HUSH_PHASE13_NON_CLAIMS } from '../app/data/hush-phase13-mask-fidelity-profiles.js';
import { evaluatePhase13Candidate } from '../app/engine/hush-phase13-profile-fidelity-gate.js';

for (const claim of ['authorship proof', 'identity proof', 'anonymity', 'non-attribution', 'human equivalence', 'perfect voice match', 'legal protection', 'truth adjudication', 'provider certainty']) {
  assert.ok(HUSH_PHASE13_NON_CLAIMS.includes(claim));
}

const packet = evaluatePhase13Candidate({
  mask_id: 'luz-index',
  source_text: '1. FILE-72 remains attached.\n\nCare note.',
  candidate_text: '1. FILE-72 remains attached.\n\nCare note.'
});
for (const claim of HUSH_PHASE13_NON_CLAIMS) assert.ok(packet.non_claims.includes(claim));
assert.doesNotMatch(JSON.stringify(packet), /exactly like the person|human equivalence claim|authorship proof granted/i);

console.log('hush-phase13-nonclaims: ok');
