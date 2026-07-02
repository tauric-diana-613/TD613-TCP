import assert from 'node:assert/strict';
import { evaluatePhase13Candidate, rerankPhase13Candidates } from '../app/engine/hush-phase13-profile-fidelity-gate.js';

const source = 'Bundle:\n1. FILE-72 / WJCT remains attached.\n2. Footer mismatch is not resolved.\n\nCare note: keep the custody grouping visible.';
const smooth = 'Overall, this summary highlights that FILE-72 and WJCT are related, while also noting that the footer mismatch is unresolved and should be handled carefully moving forward.';
const faithful = '1. FILE-72 / WJCT remains attached.\n2. Footer mismatch is not resolved.\n\nCare note: keep the custody grouping visible.';
const damaged = '1. FILE-72 proves the WJCT issue.\n2. Footer mismatch is resolved.';

const result = rerankPhase13Candidates({
  mask_id: 'luz-index',
  source_text: source,
  candidates: [
    { candidate_id: 'smooth', candidate_text: smooth },
    { candidate_id: 'faithful', candidate_text: faithful }
  ]
});
assert.equal(result.selected_candidate_id, 'faithful');
assert.ok(result.selected_because.includes('synthetic-smoothness-penalized'));

const smoothEval = evaluatePhase13Candidate({ mask_id: 'luz-index', source_text: source, candidate_text: smooth });
const faithfulEval = evaluatePhase13Candidate({ mask_id: 'luz-index', source_text: source, candidate_text: faithful });
const damagedEval = evaluatePhase13Candidate({ mask_id: 'luz-index', source_text: source, candidate_text: damaged });
assert.ok(faithfulEval.profile_fidelity_score > smoothEval.profile_fidelity_score);
assert.ok(faithfulEval.candidate_metrics.final_candidate_score > smoothEval.candidate_metrics.final_candidate_score);
assert.ok(damagedEval.hard_blockers.includes('semantic-integrity-failed'));

console.log('hush-phase13-selector-rerank: ok');
