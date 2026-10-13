import assert from 'node:assert/strict';
import { evaluatePhase13Candidate, scoreGenericVoice, scoreSyntheticSmoothness } from '../app/engine/hush-phase13-profile-fidelity-gate.js';

const smooth = 'Overall, this summary highlights the key issue. Additionally, it presents the concern in a clear way. In conclusion, this version should help the reader understand the situation moving forward.';
const rough = '1. FILE-72 stays attached.\n2. Footer mismatch is not resolved.\n\nCare note: keep grouping visible.';

assert.ok(scoreSyntheticSmoothness(smooth) > scoreSyntheticSmoothness(rough));
assert.ok(scoreGenericVoice(smooth) > scoreGenericVoice(rough));

const smoothEval = evaluatePhase13Candidate({ mask_id: 'luz-index', source_text: rough, candidate_text: smooth });
const roughEval = evaluatePhase13Candidate({ mask_id: 'luz-index', source_text: rough, candidate_text: rough });
assert.ok(smoothEval.synthetic_perfection_score > roughEval.synthetic_perfection_score);
assert.ok(smoothEval.profile_fidelity_score < roughEval.profile_fidelity_score);
assert.ok(smoothEval.hard_blockers.includes('paragraph-topology-flattened'));

console.log('hush-phase13-synthetic-perfection-penalty: ok');
