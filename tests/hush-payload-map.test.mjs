import assert from 'assert';
import { buildMeaningPlan } from '../app/engine/hush-meaning-plan.js';
import {
  HUSH_PAYLOAD_MAP_VERSION,
  buildPayloadMap,
  classifyPayloadToken,
  summarizePayloadMap
} from '../app/engine/hush-payload-map.js';

assert.equal(HUSH_PAYLOAD_MAP_VERSION, 'phase-21');

const sourceText = 'The vendor called twice after lunch. I logged INV-440 at 2:18 and told Jordan not to resend the spreadsheet until we know which version finance kept.';
const meaningPlan = buildMeaningPlan({ sourceText });
const payloadMap = buildPayloadMap({ sourceText, meaningPlan, protectedLiterals: meaningPlan.protectedLiterals });

assert.equal(payloadMap.version, 'phase-21');
assert(payloadMap.payloadUnits.some((unit) => unit.text === 'INV-440' && unit.kind === 'evidence-id' && unit.preserveExact));
assert(payloadMap.payloadUnits.some((unit) => unit.text === '2:18' && unit.kind === 'timestamp' && unit.preserveExact));
assert(payloadMap.payloadUnits.some((unit) => unit.text === 'Jordan' && unit.kind === 'actor'));
assert(payloadMap.payloadUnits.some((unit) => /vendor/i.test(unit.text) && ['org', 'object'].includes(unit.kind)));
assert(payloadMap.payloadUnits.some((unit) => /finance/i.test(unit.text) && unit.kind === 'department'));
assert(payloadMap.payloadUnits.some((unit) => /spreadsheet/i.test(unit.text) && unit.kind === 'object'));
assert(payloadMap.payloadUnits.some((unit) => /which version|finance kept/i.test(unit.text) && unit.kind === 'version'));
assert(payloadMap.payloadUnits.some((unit) => /until we know/i.test(unit.text) && unit.kind === 'reason'));
assert(payloadMap.relationships.length >= 3);

assert.equal(classifyPayloadToken({ text: 'INV-440' }), 'evidence-id');
assert.equal(classifyPayloadToken({ text: '2:18' }), 'timestamp');
assert.equal(classifyPayloadToken({ text: 'Maya' }), 'actor');
assert.equal(classifyPayloadToken({ text: 'finance' }), 'department');

const imperativeSource = 'Make the note less formal without losing the document ID, while DOC-17 remains the anchor.';
const imperativePlan = buildMeaningPlan({ sourceText: imperativeSource });
const imperativePayload = buildPayloadMap({ sourceText: imperativeSource, meaningPlan: imperativePlan, protectedLiterals: imperativePlan.protectedLiterals });
assert(!imperativePlan.protectedLiterals.includes('ID'), 'a bare descriptive ID label is not an operational identifier');
assert(!imperativePayload.payloadUnits.some((unit) => unit.text === 'Make' && unit.kind === 'actor'), 'an imperative sentence opener is not an actor');

const summary = summarizePayloadMap(payloadMap);
assert.equal(summary.version, 'phase-21');
assert(summary.payloadUnitCount >= 8);
assert(summary.exactCount >= 2);
assert(summary.kinds.includes('evidence-id'));
assert(summary.kinds.includes('timestamp'));

console.log('hush-payload-map tests passed');
