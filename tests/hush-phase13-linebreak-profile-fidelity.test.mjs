import assert from 'node:assert/strict';
import { evaluatePhase13Candidate, scoreSourceLayoutTopology } from '../app/engine/hush-phase13-profile-fidelity-gate.js';

const source = 'Bundle:\n1. FILE-72 remains attached.\n2. Footer mismatch is not resolved.\n\nCare note stays visible.';
const flat = 'Bundle: FILE-72 remains attached. Footer mismatch is not resolved. Care note stays visible.';
const indexed = '1. FILE-72 remains attached.\n2. Footer mismatch is not resolved.\n\nCare note stays visible.';
const cryo = 'Status: held.\n\nDo not overexplain. Keep the handoff short.';

assert.ok(scoreSourceLayoutTopology(source, indexed) > scoreSourceLayoutTopology(source, flat));
const flatEval = evaluatePhase13Candidate({ mask_id: 'luz-index', source_text: source, candidate_text: flat });
const indexedEval = evaluatePhase13Candidate({ mask_id: 'luz-index', source_text: source, candidate_text: indexed });
assert.ok(flatEval.hard_blockers.includes('profile-fidelity-blocked') || flatEval.hard_blockers.includes('paragraph-topology-flattened'));
assert.equal(indexedEval.source_layout_topology.exact_linebreak_pattern_exported, false);
assert.ok(indexedEval.profile_fidelity_score > flatEval.profile_fidelity_score);

const cryoEval = evaluatePhase13Candidate({ mask_id: 'cryo-cristiano', source_text: 'Need quick handoff.\n\nDo not overexplain.', candidate_text: cryo });
assert.equal(cryoEval.hard_blockers.length, 0);
assert.ok(cryoEval.mask_native_variance_score > 0.5);

console.log('hush-phase13-linebreak-profile-fidelity: ok');
