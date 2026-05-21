import assert from 'assert';
import { evaluateDialectCustody } from '../app/engine/hush-dialect-custody.js';
import { buildHushRegisterContract } from '../app/engine/hush-register-contract.js';

const source = 'girl i been said FILE-72 was weird bc one copy got footer and one dont.';
const kept = evaluateDialectCustody({ sourceText: source, outputText: 'girl i been said FILE-72 was weird bc one copy got footer and one dont.', contract: buildHushRegisterContract({ registerMode: 'preserve-source' }) });
assert.equal(kept.passed, true);
assert.equal(kept.droppedFeatures.length, 0);

const dropped = evaluateDialectCustody({ sourceText: source, outputText: 'FILE-72 had a footer mismatch.', contract: buildHushRegisterContract({ registerMode: 'preserve-source' }) });
assert.equal(dropped.passed, false);
assert(dropped.hardFailures.includes('register-feature-erased'));

const formal = evaluateDialectCustody({ sourceText: source, outputText: 'FILE-72 had a footer mismatch.', contract: buildHushRegisterContract({ registerMode: 'formalize-source' }) });
assert.equal(formal.passed, true);
assert(formal.reviewWarnings.includes('formalization-warning-required'));

console.log('hush-dialect-custody tests passed');
