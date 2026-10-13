import assert from 'assert';
import {
  DEFAULT_WRITING_TRAITS,
  buildRealizationPlan,
  normalizeMaskWritingTraits,
  summarizeRealizationPlan
} from '../app/engine/hush-realization-plan.js';

const base = normalizeMaskWritingTraits({});
assert.equal(base.sentenceLength, DEFAULT_WRITING_TRAITS.sentenceLength);
assert.equal(base.diction, DEFAULT_WRITING_TRAITS.diction);

const legal = buildRealizationPlan({
  mask: {
    id: 'measured-legal-test',
    label: 'Measured Legal Test',
    family: 'facts first',
    transitionBank: ['For clarity'],
    dictionHints: [['said', 'stated']],
    avoidList: ['lol']
  }
});

assert.equal(legal.version, 'phase-16');
assert.equal(legal.maskId, 'measured-legal-test');
assert.equal(legal.traits.diction, 'legal');
assert(legal.rewriteDirectives.length >= 8);
assert(legal.forbiddenMoves.includes('drop-protected-literals'));
assert(legal.forbiddenMoves.includes('erase-negation'));
assert(legal.forbiddenMoves.includes('invent-new-facts'));
assert(legal.transitionBank.includes('For clarity'));
assert(legal.targetDictionHints.some((pair) => pair[0] === 'said' && pair[1] === 'stated'));
assert(Number.isFinite(legal.compressionRatio));
assert(Number.isFinite(legal.expansionRatio));
assert(!legal.rewriteDirectives.join(' ').includes('ontology'));

const compressed = buildRealizationPlan({ mask: { writingTraits: { verbosity: 'compressed' } } });
const expanded = buildRealizationPlan({ mask: { writingTraits: { verbosity: 'expansive' } } });
assert(compressed.compressionRatio < expanded.expansionRatio);

const summary = summarizeRealizationPlan(legal);
assert.equal(summary.maskId, 'measured-legal-test');
assert(summary.directiveCount > 0);
assert(summary.forbiddenMoveCount > 0);

console.log('hush-realization-plan tests passed');
