import assert from 'assert';
import { buildMeaningPlan } from '../app/engine/hush-meaning-plan.js';
import { buildPayloadMap } from '../app/engine/hush-payload-map.js';
import { buildPayloadBindingMap } from '../app/engine/hush-payload-binding.js';
import {
  HUSH_PAYLOAD_INTEGRITY_VERSION,
  buildPayloadIntegrityCheck,
  summarizePayloadIntegrity,
  verifyPayloadIntegrity
} from '../app/engine/hush-payload-integrity.js';

assert.equal(HUSH_PAYLOAD_INTEGRITY_VERSION, 'phase-21');

const sourceText = 'The vendor called twice after lunch. I logged INV-440 at 2:18 and told Jordan not to resend the spreadsheet until we know which version finance kept.';
const meaningPlan = buildMeaningPlan({ sourceText });
const payloadMap = buildPayloadMap({ sourceText, meaningPlan, protectedLiterals: meaningPlan.protectedLiterals });
const payloadBindingMap = buildPayloadBindingMap({ sourceText, payloadMap, meaningPlan });

const goodOutput = 'The vendor called twice after lunch. INV-440 was logged at 2:18, and Jordan should not resend the spreadsheet until finance confirms which version it kept.';
const good = verifyPayloadIntegrity({ sourceText, outputText: goodOutput, payloadMap, payloadBindingMap });
assert.equal(good.version, 'phase-21');
assert.equal(good.passed, true);
assert.equal(good.checks.evidenceIds, 'pass');
assert.equal(good.checks.timestamps, 'pass');
assert.equal(good.checks.actors, 'pass');
assert.notEqual(good.checks.bindings, 'fail');

const bad = buildPayloadIntegrityCheck({ sourceText, outputText: '440 record should stay with the record on. No extra claim is added on 18. not', payloadMap, payloadBindingMap });
assert.equal(bad.passed, false);
assert(bad.hardFailures.includes('evidence-id-truncated'));
assert(bad.hardFailures.includes('timestamp-truncated'));
assert(bad.hardFailures.includes('actor-dropped'));
assert(bad.hardFailures.includes('required-org-dropped'));
assert(bad.hardFailures.includes('version-context-dropped'));
assert(bad.hardFailures.includes('payload-binding-broken'));

const reasonSource = 'hey, quick thing: the file was there before noon. pls keep DOC-77 + 04/21 together bc that date is the whole point.';
const reasonPlan = buildMeaningPlan({ sourceText: reasonSource });
const reasonPayload = buildPayloadMap({ sourceText: reasonSource, meaningPlan: reasonPlan, protectedLiterals: reasonPlan.protectedLiterals });
const reasonBindings = buildPayloadBindingMap({ sourceText: reasonSource, payloadMap: reasonPayload, meaningPlan: reasonPlan });
const reasonBad = verifyPayloadIntegrity({ sourceText: reasonSource, outputText: 'DOC-77 and 04/21 should stay together.', payloadMap: reasonPayload, payloadBindingMap: reasonBindings });
assert.equal(reasonBad.passed, false);
assert(reasonBad.hardFailures.includes('causal-reason-dropped'));

const summary = summarizePayloadIntegrity(good);
assert.equal(summary.version, 'phase-21');
assert.equal(summary.passed, true);
assert.equal(summary.hardFailureCount, 0);

console.log('hush-payload-integrity tests passed');
