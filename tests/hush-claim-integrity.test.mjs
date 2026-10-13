import assert from 'assert';
import {
  HUSH_CLAIM_INTEGRITY_VERSION,
  buildClaimIntegrityCheck,
  verifyClaimIntegrity,
  summarizeClaimIntegrity
} from '../app/engine/hush-claim-integrity.js';

assert.equal(HUSH_CLAIM_INTEGRITY_VERSION, 'phase-19');

const sourceText = 'Please keep DOC-613 with the note from 6/13. I did not change it, and it may need review.';
const protectedLiterals = ['DOC-613', '6/13'];
const intact = verifyClaimIntegrity({
  sourceText,
  outputText: 'DOC-613 should stay with the 6/13 note. It was not changed on my end, and it may need review.',
  protectedLiterals,
  meaningPlan: { protectedLiterals }
});
assert.equal(intact.version, 'phase-19');
assert.equal(intact.passed, true);
assert.equal(intact.checks.protectedLiterals, 'pass');
assert.equal(intact.checks.negations, 'pass');
assert.equal(intact.checks.caveats, 'pass');
assert.equal(intact.checks.dates, 'pass');
assert.equal(intact.checks.evidenceAnchors, 'pass');

const droppedNegation = verifyClaimIntegrity({ sourceText, outputText: 'DOC-613 should stay with the 6/13 note. It was changed on my end, and it may need review.', protectedLiterals });
assert.equal(droppedNegation.passed, false);
assert(droppedNegation.hardFailures.includes('negation-dropped') || droppedNegation.hardFailures.includes('negation-inverted'));

const inverted = verifyClaimIntegrity({ sourceText: 'I did not edit EXHIBIT-42.', outputText: 'I did edit EXHIBIT-42.', protectedLiterals: ['EXHIBIT-42'] });
assert.equal(inverted.passed, false);
assert(inverted.hardFailures.includes('negation-inverted'));

const droppedDate = verifyClaimIntegrity({ sourceText, outputText: 'DOC-613 should stay with the note. It was not changed on my end, and it may need review.', protectedLiterals: ['DOC-613'] });
assert.equal(droppedDate.passed, false);
assert(droppedDate.hardFailures.includes('date-dropped'));

const droppedEvidence = verifyClaimIntegrity({ sourceText, outputText: 'The note from 6/13 was not changed on my end, and it may need review.', protectedLiterals: ['6/13'] });
assert.equal(droppedEvidence.passed, false);
assert(droppedEvidence.hardFailures.includes('evidence-anchor-dropped'));

const removedUncertainty = verifyClaimIntegrity({ sourceText, outputText: 'DOC-613 should stay with the 6/13 note. It was not changed on my end.', protectedLiterals });
assert.equal(removedUncertainty.passed, false);
assert(removedUncertainty.hardFailures.includes('uncertainty-removed'));

const softenedRequest = verifyClaimIntegrity({
  sourceText: 'Please keep EXHIBIT-42 attached to the message.',
  outputText: 'It would help to keep EXHIBIT-42 with the message.',
  protectedLiterals: ['EXHIBIT-42']
});
assert.equal(softenedRequest.passed, true);
assert(['pass', 'review'].includes(softenedRequest.checks.requestIntent));

const missingLiteral = buildClaimIntegrityCheck({ sourceText, outputText: 'The note from 6/13 was not changed on my end, and it may need review.', protectedLiterals });
assert.equal(missingLiteral.passed, false);
assert(missingLiteral.hardFailures.includes('protected-literal-dropped'));

const summary = summarizeClaimIntegrity(intact);
assert.equal(summary.version, 'phase-19');
assert.equal(summary.passed, true);
assert.equal(summary.hardFailureCount, 0);

console.log('hush-claim-integrity tests passed');
