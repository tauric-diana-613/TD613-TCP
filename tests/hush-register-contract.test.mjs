import assert from 'assert';
import { buildHushRegisterContract } from '../app/engine/hush-register-contract.js';

const preserve = buildHushRegisterContract();
assert.equal(preserve.registerMode, 'preserve-source');
assert.equal(preserve.dialectPolicy, 'preserve');
assert.equal(preserve.chatspeakPolicy, 'preserve');
assert.equal(preserve.codeSwitchPolicy, 'preserve-boundaries');

const formal = buildHushRegisterContract({ registerMode: 'formalize-source' });
assert.equal(formal.transformsRegister, true);
assert.equal(formal.dialectPolicy, 'translate-with-warning');
assert.equal(formal.warningMode, 'strict');

const target = buildHushRegisterContract({ registerMode: 'transform-to-aave' });
assert.equal(target.ontologySource, 'repo-aave');
assert.equal(target.dialectPolicy, 'target-register');

console.log('hush-register-contract tests passed');
