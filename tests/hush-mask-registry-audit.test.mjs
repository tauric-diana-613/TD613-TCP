import assert from 'assert';
import { auditHushMaskRegistry } from '../app/engine/hush-mask-registry-audit.js';

const audit = auditHushMaskRegistry();
assert.equal(audit.version, 'phase-30');
assert.equal(audit.passed, true);
assert(audit.dataMaskCount >= 1);
assert(audit.dataMasks.includes('phase28-transform-to-aave'));
assert.equal(audit.missingFromStudio.length, 0);
console.log('hush-mask-registry-audit tests passed');
