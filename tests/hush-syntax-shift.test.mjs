import assert from 'assert';
import {
  HUSH_SYNTAX_SHIFT_VERSION,
  buildSyntaxShift,
  scoreSyntaxShift,
  summarizeSyntaxShift
} from '../app/engine/hush-syntax-shift.js';

assert.equal(HUSH_SYNTAX_SHIFT_VERSION, 'phase-19');

const sourceText = 'Please keep DOC-613 with the note from 6/13. I did not change it.';
const exact = buildSyntaxShift({ sourceText, outputText: sourceText });
assert.equal(exact.version, 'phase-19');
assert(exact.metrics.syntaxShiftScore < 0.35);
assert(exact.warnings.includes('syntax-shift-low'));
assert(exact.warnings.includes('source-opening-retained'));

const wrapper = buildSyntaxShift({ sourceText, outputText: `For reference, ${sourceText}` });
assert(wrapper.metrics.syntaxShiftScore < 0.55);
assert(wrapper.warnings.includes('wrapper-only-transform'));

const recomposed = buildSyntaxShift({
  sourceText,
  outputText: 'DOC-613 should stay with the 6/13 note. The attachment was not changed on my end.'
});
assert(recomposed.metrics.openingShapeShift > 0);
assert(recomposed.metrics.closingShapeShift > 0);
assert(recomposed.metrics.clauseOrderShift > exact.metrics.clauseOrderShift);
assert(recomposed.metrics.punctuationSkeletonShift >= exact.metrics.punctuationSkeletonShift);
assert(recomposed.metrics.sentenceCountDelta >= 0);
assert(recomposed.metrics.syntaxShiftScore > exact.metrics.syntaxShiftScore);

const strong = buildSyntaxShift({
  sourceText: 'Please keep EXHIBIT-42 attached to the message because I did not edit it.',
  outputText: 'Record note: EXHIBIT-42 remains attached. The message was not edited on my end.'
});
assert(strong.metrics.syntaxShiftScore >= 0.35);

const scored = scoreSyntaxShift(strong);
assert.equal(scored.version, 'phase-19');
assert(scored.syntaxShiftScore === strong.metrics.syntaxShiftScore);

const summary = summarizeSyntaxShift(strong);
assert.equal(summary.version, 'phase-19');
assert(['usable', 'strong'].includes(summary.status));

console.log('hush-syntax-shift tests passed');
