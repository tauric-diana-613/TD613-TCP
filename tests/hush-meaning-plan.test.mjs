import assert from 'assert';
import {
  buildMeaningPlan,
  protectMeaningUnits,
  summarizeMeaningPlan
} from '../app/engine/hush-meaning-plan.js';

const sourceText = 'On 6/13, I saved EXHIBIT-42. I did not alter the attachment. Please keep the label with the note.';
const plan = buildMeaningPlan({ sourceText, protectedLiterals: ['EXHIBIT-42'] });

assert.equal(plan.version, 'phase-16');
assert(plan.sourceHash.startsWith('hmp-'));
assert(plan.units.length >= 3);
assert(plan.protectedLiterals.includes('EXHIBIT-42'));
assert(plan.protectedLiterals.includes('6/13'));
assert(plan.units.some((unit) => unit.kind === 'evidence'));
assert(plan.units.some((unit) => unit.kind === 'request'));
assert(plan.units.some((unit) => unit.hasNegation));
assert(plan.units.some((unit) => unit.rewriteFreedom === 'low'));

const units = protectMeaningUnits({ sourceText, protectedLiterals: ['EXHIBIT-42'] });
assert.equal(units.length, plan.units.length);
assert(units.every((unit) => unit.id && unit.text));

const summary = summarizeMeaningPlan(plan);
assert.equal(summary.unitCount, plan.units.length);
assert(summary.protectedLiteralCount >= 2);
assert(summary.lowFreedomCount >= 1);
assert(summary.kinds.includes('evidence'));

console.log('hush-meaning-plan tests passed');
