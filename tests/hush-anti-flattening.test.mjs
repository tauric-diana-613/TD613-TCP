import assert from 'assert';
import { detectHushFlattening } from '../app/engine/hush-anti-flattening.js';

const flat = detectHushFlattening({
  sourceText: 'FILE-72 exported at the same minute, but one copy has the footer and one copy does not.',
  outputText: 'FILE-72 remains the record anchor. The point is preservation, not expansion.',
  protectedLiterals: ['FILE-72']
});
assert.equal(flat.passed, false);
assert(flat.hardFailures.includes('generic-anchor-only-output') || flat.hardFailures.includes('concrete-event-flattened'));

const kept = detectHushFlattening({
  sourceText: 'FILE-72 exported at the same minute, but one copy has the footer and one copy does not.',
  outputText: 'FILE-72 should stay tied to the same export minute. One copy has the footer and one copy does not.',
  protectedLiterals: ['FILE-72']
});
assert.equal(kept.passed, true);
assert.equal(kept.missingGroups.length, 0);

const invoice = detectHushFlattening({
  sourceText: 'INV-440 was logged at 2:18. Jordan should hold the resend until finance confirms the version.',
  outputText: 'INV-440 remains the note anchor.',
  protectedLiterals: ['INV-440', '2:18']
});
assert.equal(invoice.passed, false);

console.log('hush-anti-flattening tests passed');
