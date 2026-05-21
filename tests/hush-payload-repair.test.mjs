import assert from 'assert';
import { buildMeaningPlan } from '../app/engine/hush-meaning-plan.js';
import { buildPayloadMap } from '../app/engine/hush-payload-map.js';
import { buildPayloadBindingMap } from '../app/engine/hush-payload-binding.js';
import { verifyPayloadIntegrity } from '../app/engine/hush-payload-integrity.js';
import {
  HUSH_PAYLOAD_REPAIR_VERSION,
  rebuildPayloadSentence,
  repairPayloadLoss,
  summarizePayloadRepair
} from '../app/engine/hush-payload-repair.js';

assert.equal(HUSH_PAYLOAD_REPAIR_VERSION, 'phase-21');

const sourceText = 'The vendor called twice after lunch. I logged INV-440 at 2:18 and told Jordan not to resend the spreadsheet until we know which version finance kept.';
const meaningPlan = buildMeaningPlan({ sourceText });
const payloadMap = buildPayloadMap({ sourceText, meaningPlan, protectedLiterals: meaningPlan.protectedLiterals });
const payloadBindingMap = buildPayloadBindingMap({ sourceText, payloadMap, meaningPlan });
const broken = '440 record should stay with the record on. No extra claim is added on 18. not';
const integrity = verifyPayloadIntegrity({ sourceText, outputText: broken, payloadMap, payloadBindingMap });

const rebuilt = rebuildPayloadSentence({ sourceText, payloadMap, payloadBindingMap });
assert(rebuilt.includes('INV-440'));
assert(rebuilt.includes('2:18'));
assert(rebuilt.includes('Jordan'));
assert(rebuilt.includes('spreadsheet'));
assert(rebuilt.toLowerCase().includes('finance'));
assert(rebuilt.toLowerCase().includes('version'));

const repair = repairPayloadLoss({ sourceText, text: broken, payloadMap, payloadBindingMap, payloadIntegrity: integrity });
assert.equal(repair.version, 'phase-21');
assert.equal(repair.changed, true);
assert(repair.text.includes('INV-440'));
assert(repair.text.includes('2:18'));
assert(repair.text.includes('Jordan'));
assert(repair.text.includes('spreadsheet'));
assert(!/\b440 record\b/i.test(repair.text));
assert(!/\b18\.\s*not\b/i.test(repair.text));
assert(repair.operations.includes('payload-rebuild-sentence'));

const repairedIntegrity = verifyPayloadIntegrity({ sourceText, outputText: repair.text, payloadMap, payloadBindingMap });
assert.equal(repairedIntegrity.passed, true);

const summary = summarizePayloadRepair(repair);
assert.equal(summary.version, 'phase-21');
assert.equal(summary.changed, true);
assert(summary.operationCount >= 1);

console.log('hush-payload-repair tests passed');
