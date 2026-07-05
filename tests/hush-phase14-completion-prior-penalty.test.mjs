import assert from 'node:assert/strict';
import { evaluatePhase14Candidate, scoreCompletionPrior, scoreProcessFidelity } from '../app/engine/hush-phase14-cognitive-authorship-gate.js';
import { resolvePhase14ProcessProfile } from '../app/data/hush-phase14-cognitive-process-profiles.js';

const source = 'FILE-72 remains attached. The footer mismatch is not resolved. The receipt matters because the earlier jar image returns as evidence, not decoration.';
const polished = 'Overall, FILE-72 remains attached and the footer mismatch is not resolved. This shows that the receipt matters as evidence and should be handled carefully moving forward.';
const timeBearing = 'I remember the jar first, because that is how the receipt gets warm enough to show itself.\n\nFILE-72 still stays attached. The footer mismatch is not resolved.\n\nBack to the jar: that part matters later because the receipt is evidence, not decoration.';
const profile = resolvePhase14ProcessProfile({ id: 'grandma-receipts' });

assert.ok(scoreCompletionPrior(polished) > scoreCompletionPrior(timeBearing));
assert.ok(scoreProcessFidelity(timeBearing, profile) > scoreProcessFidelity(polished, profile));

const polishedEval = evaluatePhase14Candidate({ mask_id: 'grandma-receipts', source_text: source, candidate_text: polished, phase13_profile_fidelity_score: 0.78 });
const timeEval = evaluatePhase14Candidate({ mask_id: 'grandma-receipts', source_text: source, candidate_text: timeBearing, phase13_profile_fidelity_score: 0.78 });
assert.ok(timeEval.process_fidelity_score > polishedEval.process_fidelity_score);
assert.ok(timeEval.phase14_final_score > polishedEval.phase14_final_score);

console.log('hush-phase14-completion-prior-penalty: ok');
