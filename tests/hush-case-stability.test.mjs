import assert from 'assert';
import { repairProtectedLiteralCase, detectProtectedLiteralCaseDrift } from '../app/engine/hush-case-stability.js';

const repaired = repairProtectedLiteralCase({
  outputText: 'iNV-440 and rOSTER-8 stayed in the note.',
  protectedLiterals: ['INV-440', 'ROSTER-8']
});

assert.equal(repaired.text, 'INV-440 and ROSTER-8 stayed in the note.');
assert.equal(repaired.failed, false);
assert.equal(repaired.changed, true);
assert.equal(repaired.repaired.length, 2);

const drift = detectProtectedLiteralCaseDrift({
  outputText: repaired.text,
  protectedLiterals: ['INV-440', 'ROSTER-8']
});
assert.equal(drift.passed, true);
assert.equal(drift.drift.length, 0);

const clean = repairProtectedLiteralCase({ outputText: 'DOC-77 stayed attached.', protectedLiterals: ['DOC-77'] });
assert.equal(clean.text, 'DOC-77 stayed attached.');
assert.equal(clean.changed, false);

console.log('hush-case-stability tests passed');
