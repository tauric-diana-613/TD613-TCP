import assert from 'assert';
import {
  buildMeaningPlan,
  extractOperationalIdentifiers,
  extractPayloadProtectedLiterals,
  extractTimeAnchors,
  protectMeaningUnits,
  summarizeMeaningPlan
} from '../app/engine/hush-meaning-plan.js';

const sourceText = 'On 6/13, I saved EXHIBIT-42. I did not alter the attachment. Please keep the label with the note.';
const plan = buildMeaningPlan({ sourceText, protectedLiterals: ['EXHIBIT-42'] });

assert.equal(plan.version, 'phase-21');
assert(plan.sourceHash.startsWith('hmp-'));
assert(plan.units.length >= 3);
assert(plan.protectedLiterals.includes('EXHIBIT-42'));
assert(plan.protectedLiterals.includes('6/13'));
assert(plan.units.some((unit) => unit.kind === 'evidence'));
assert(plan.units.some((unit) => unit.kind === 'request'));
assert(plan.units.some((unit) => unit.hasNegation));
assert(plan.units.some((unit) => unit.rewriteFreedom === 'low'));

const payloadText = 'I logged INV-440 at 2:18 and kept DOC-77 + 04/21 with SAC[X6ZNK5NO51]. The 1099-NEC and I-9 packet stayed visible.';
const ids = extractOperationalIdentifiers(payloadText);
const times = extractTimeAnchors(payloadText);
const literals = extractPayloadProtectedLiterals(payloadText);
assert(ids.includes('INV-440'));
assert(ids.includes('DOC-77'));
assert(ids.includes('SAC[X6ZNK5NO51]'));
assert(ids.includes('1099-NEC'));
assert(ids.includes('I-9'));
assert(times.includes('2:18'));
assert(times.includes('04/21'));
assert(literals.includes('INV-440'));
assert(literals.includes('2:18'));
assert(literals.includes('DOC-77'));
assert(literals.includes('04/21'));

const units = protectMeaningUnits({ sourceText, protectedLiterals: ['EXHIBIT-42'] });
assert.equal(units.length, plan.units.length);
assert(units.every((unit) => unit.id && unit.text));

const summary = summarizeMeaningPlan(plan);
assert.equal(summary.version, 'phase-21');
assert.equal(summary.unitCount, plan.units.length);
assert(summary.protectedLiteralCount >= 2);
assert(summary.lowFreedomCount >= 1);
assert(summary.kinds.includes('evidence'));

console.log('hush-meaning-plan tests passed');
