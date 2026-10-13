import assert from 'assert';
import {
  HUSH_SOURCE_RESIDUE_VERSION,
  buildSourceResidue,
  scoreSourceResidue,
  summarizeSourceResidue
} from '../app/engine/hush-source-residue.js';

assert.equal(HUSH_SOURCE_RESIDUE_VERSION, 'phase-18.1-calibrated-body-risk');

const source = 'Please keep DOC-613 before the meeting on 6/13 and do not separate the date from the message.';
const copied = 'Please keep DOC-613 before the meeting on 6/13 and do not separate the date from the message.';
const rewritten = 'For reference, the 6/13 meeting note should keep DOC-613 attached. The date needs to stay with that record.';

const copiedResidue = buildSourceResidue({ sourceText: source, outputText: copied, protectedLiterals: ['DOC-613', '6/13'] });
assert.equal(copiedResidue.version, 'phase-18.1-calibrated-body-risk');
assert(copiedResidue.metrics.nonLiteralTokenRetention > 0.9);
assert(copiedResidue.metrics.longestCopiedRun > 8);
assert(copiedResidue.warnings.includes('source-body-attached'));
assert(copiedResidue.warnings.includes('source-body-severe'));

const rewrittenResidue = buildSourceResidue({ sourceText: source, outputText: rewritten, protectedLiterals: ['DOC-613', '6/13'] });
assert(rewrittenResidue.metrics.nonLiteralTokenRetention < copiedResidue.metrics.nonLiteralTokenRetention);
assert(rewrittenResidue.metrics.longestCopiedRun < copiedResidue.metrics.longestCopiedRun);
assert(scoreSourceResidue(rewrittenResidue).sourceResidueScore > scoreSourceResidue(copiedResidue).sourceResidueScore);

const protectedOnly = buildSourceResidue({
  sourceText: 'Keep EXHIBIT-42 and 6/13 together.',
  outputText: 'For reference, 6/13 stays attached to EXHIBIT-42.',
  protectedLiterals: ['EXHIBIT-42', '6/13']
});
assert(protectedOnly.metrics.nonLiteralTokenRetention < 1, 'protected literals should not inflate source residue');

const summary = summarizeSourceResidue(copiedResidue);
assert.equal(summary.version, 'phase-18.1-calibrated-body-risk');
assert(summary.longestCopiedRun > 8);
assert(summary.warnings.includes('source-body-attached'));

console.log('hush-source-residue tests passed');
