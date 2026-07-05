import assert from 'node:assert/strict';
import { evaluatePhase14Candidate, rerankPhase14Candidates } from '../app/engine/hush-phase14-cognitive-authorship-gate.js';

const source = 'FILE-72 remains attached. The footer mismatch is not resolved. The receipt matters because the earlier jar image returns as evidence, not decoration.';
const polished = 'Overall, FILE-72 remains attached and the footer mismatch is not resolved. This shows that the receipt matters as evidence and should be handled carefully moving forward.';
const faithful = 'I remember the jar first, because that is how the receipt gets warm enough to show itself.\n\nFILE-72 still stays attached. The footer mismatch is not resolved.\n\nBack to the jar: that part matters later because the receipt is evidence, not decoration.';
const fakeMess = 'Jar—receipt—whatever. FILE-72 proves the whole thing and the footer mismatch is resolved.';

const result = rerankPhase14Candidates({
  mask_id: 'grandma-receipts',
  source_text: source,
  phase13_profile_fidelity_score: 0.78,
  candidates: [
    { candidate_id: 'polished', candidate_text: polished },
    { candidate_id: 'faithful', candidate_text: faithful }
  ]
});
assert.equal(result.selected_candidate_id, 'faithful');
assert.ok(result.selected_because.includes('completion-prior-penalized'));

const polishedEval = evaluatePhase14Candidate({ mask_id: 'grandma-receipts', source_text: source, candidate_text: polished, phase13_profile_fidelity_score: 0.78 });
const faithfulEval = evaluatePhase14Candidate({ mask_id: 'grandma-receipts', source_text: source, candidate_text: faithful, phase13_profile_fidelity_score: 0.78 });
const fakeEval = evaluatePhase14Candidate({ mask_id: 'grandma-receipts', source_text: source, candidate_text: fakeMess, phase13_profile_fidelity_score: 0.8 });
assert.ok(faithfulEval.phase14_final_score > polishedEval.phase14_final_score);
assert.ok(fakeEval.hard_blockers.includes('semantic-integrity-failed'));

console.log('hush-phase14-selector-rerank: ok');
