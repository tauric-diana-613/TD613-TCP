import assert from 'assert';
import { buildTargetRegisterPlan } from '../app/engine/hush-target-register-plan.js';
import { auditTargetRegisterShift } from '../app/engine/hush-target-register-audit.js';

const source = 'FILE-72 exported at the same minute, but one copy has the footer and one copy does not. The explanation may be a template issue.';
const plan = buildTargetRegisterPlan({ sourceText: source, targetRegister: 'aave', registerMode: 'transform-to-aave' });
assert.equal(plan.targetRegister, 'aave');
assert(plan.requiredFeatureFamilies.includes('event-shape'));
assert(plan.warnings.includes('target-register-generated'));

const good = auditTargetRegisterShift({
  sourceText: source,
  outputText: 'girl FILE-72 was same minute, one copy got the footer and one dont. maybe template, fine, but dont act like the mismatch not there.',
  targetRegister: 'aave',
  plan
});
assert.equal(good.passed, true);
assert.equal(good.eventShapePassed, true);
assert(good.targetFeaturesAdded.length > 0);

const invisible = auditTargetRegisterShift({ sourceText: source, outputText: 'FILE-72 exported at the same minute, but one copy has the footer and one copy does not.', targetRegister: 'aave', plan });
assert.equal(invisible.passed, false);
assert(invisible.hardFailures.includes('target-register-not-visible'));

const inflated = auditTargetRegisterShift({ sourceText: source, outputText: 'girl FILE-72 proves fraud because one copy got footer and one dont.', targetRegister: 'aave', plan });
assert.equal(inflated.passed, false);
assert(inflated.hardFailures.includes('certainty-inflated'));

console.log('hush-target-register-audit tests passed');
