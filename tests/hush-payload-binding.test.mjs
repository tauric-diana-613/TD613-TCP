import assert from 'assert';
import { buildMeaningPlan } from '../app/engine/hush-meaning-plan.js';
import { buildPayloadMap } from '../app/engine/hush-payload-map.js';
import {
  HUSH_PAYLOAD_BINDING_VERSION,
  bindPayloadUnits,
  buildPayloadBindingMap,
  summarizePayloadBindingMap
} from '../app/engine/hush-payload-binding.js';

assert.equal(HUSH_PAYLOAD_BINDING_VERSION, 'phase-21');

const sourceText = 'The vendor called twice after lunch. I logged INV-440 at 2:18 and told Jordan not to resend the spreadsheet until we know which version finance kept.';
const meaningPlan = buildMeaningPlan({ sourceText });
const payloadMap = buildPayloadMap({ sourceText, meaningPlan, protectedLiterals: meaningPlan.protectedLiterals });
const rawBindings = bindPayloadUnits({ sourceText, payloadMap, meaningPlan });
assert(rawBindings.length >= 4);

const bindingMap = buildPayloadBindingMap({ sourceText, payloadMap, meaningPlan });
assert.equal(bindingMap.version, 'phase-21');
assert(bindingMap.bindings.some((binding) => binding.kind === 'evidence-time'));
assert(bindingMap.bindings.some((binding) => binding.kind === 'actor-action'));
assert(bindingMap.bindings.some((binding) => binding.kind === 'action-object'));
assert(bindingMap.bindings.some((binding) => binding.kind === 'instruction-target'));
assert(bindingMap.bindings.some((binding) => binding.kind === 'reason-instruction'));
assert(bindingMap.bindings.some((binding) => binding.kind === 'version-object'));
assert(bindingMap.bindings.every((binding) => binding.required));
assert(bindingMap.bindings.every((binding) => binding.maxDistanceTokens >= 8));

const summary = summarizePayloadBindingMap(bindingMap);
assert.equal(summary.version, 'phase-21');
assert(summary.bindingCount >= 4);
assert(summary.kinds.includes('evidence-time'));
assert(summary.requiredCount >= 4);

console.log('hush-payload-binding tests passed');
