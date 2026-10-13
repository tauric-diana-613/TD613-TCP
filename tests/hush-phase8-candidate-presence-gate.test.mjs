import assert from 'node:assert/strict';
import { buildCandidatePresenceGate } from '../app/engine/hush-phase8-candidate-presence-gate.js';

const source = 'FILE-72 has the same export minute and footer mismatch.';
const candidate = 'FILE-72 keeps export minute + footer mismatch visible.';

const pass = await buildCandidatePresenceGate(candidate, source);
assert.equal(pass.schema, 'td613.hush.phase8.candidate-presence-gate/v1');
assert.equal(pass.status, 'passed');
assert.equal(pass.candidate_required, true);
assert.equal(pass.candidate_present, true);
assert.ok(pass.candidate_hash_sha256.startsWith('sha256:'));
assert.equal(pass.raw_candidate_included, false);
assert.equal(pass.source_text_used_as_candidate, false);
assert.equal(pass.source_candidate_separation, 'held');

const missing = await buildCandidatePresenceGate('', source);
assert.equal(missing.status, 'blocked');
assert.equal(missing.candidate_present, false);
assert.ok(missing.block_reasons.includes('candidate_present'));
assert.ok(missing.block_reasons.includes('candidate_hash_sha256'));

const collapsed = await buildCandidatePresenceGate(source, source);
assert.equal(collapsed.status, 'blocked');
assert.equal(collapsed.source_text_used_as_candidate, true);
assert.ok(collapsed.block_reasons.includes('source_candidate_separation'));

console.log('hush-phase8-candidate-presence-gate: ok');
