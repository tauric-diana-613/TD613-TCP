import assert from 'node:assert/strict';
import { evaluatePhase14Candidate, scoreClosureAsymmetry, scoreDelayedClarification, scoreMemoryReturn } from '../app/engine/hush-phase14-cognitive-authorship-gate.js';

const queenie = 'I remember the receipt before proof.\n\nFILE-72 is not resolved; the receipt return comes after the aside.\n\nBack to the receipt: that part matters later because the evidence has attitude.';
const luz = 'Provisional index:\n1. FILE-72 belongs with WJCT.\n2. Footer mismatch sits separately for now.\n\nLater classification: item 2 reframes item 1 because the footer decides custody.';
const cryo = 'Status: held.\n\nFILE-72 stays attached.\n\nStop here.';

assert.ok(scoreMemoryReturn(queenie) > 0.25);
assert.ok(scoreDelayedClarification(luz) > 0.2);
assert.ok(scoreClosureAsymmetry(cryo, { process_reward_markers: ['status:', 'held.', 'stop here'] }) > 0.3);

const qEval = evaluatePhase14Candidate({ mask_id: 'grandma-receipts', source_text: 'FILE-72 is not resolved.', candidate_text: queenie, phase13_profile_fidelity_score: 0.78 });
assert.ok(qEval.memory_return_score > 0.25);
assert.ok(qEval.process_fidelity_score > 0.46, JSON.stringify(qEval));

console.log('hush-phase14-memory-return-behavior: ok');
