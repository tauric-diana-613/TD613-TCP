import assert from 'assert';
import { evaluateCodeSwitchBoundaries } from '../app/engine/hush-code-switch-boundary.js';
import { buildHushRegisterContract } from '../app/engine/hush-register-contract.js';

const source = 'girl i am saying this soft bc i do not want smoke, but for the record INV-440 at 2:18 needs Jordan kept with finance.';
const kept = evaluateCodeSwitchBoundaries({ sourceText: source, outputText: source, contract: buildHushRegisterContract({ registerMode: 'preserve-source' }) });
assert.equal(kept.passed, true);
assert.equal(kept.preservedBoundaries.length, 1);

const erased = evaluateCodeSwitchBoundaries({ sourceText: source, outputText: 'For the record, INV-440 at 2:18 needs Jordan kept with finance.', contract: buildHushRegisterContract({ registerMode: 'preserve-source' }) });
assert.equal(erased.passed, false);
assert(erased.hardFailures.includes('code-switch-boundary-erased'));

const formal = evaluateCodeSwitchBoundaries({ sourceText: source, outputText: 'For the record, INV-440 at 2:18 needs Jordan kept with finance.', contract: buildHushRegisterContract({ registerMode: 'formalize-source' }) });
assert.equal(formal.passed, true);
assert(formal.warnings.includes('boundary-normalization-warning-required'));

console.log('hush-code-switch-boundary tests passed');
