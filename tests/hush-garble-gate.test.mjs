import assert from 'assert';
import { detectHushGarble } from '../app/engine/hush-garble-gate.js';

const bad = detectHushGarble({ outputText: 'Keeping this organized: FILE-72 remains the record anchor. not no.', protectedLiterals: ['FILE-72'] });
assert.equal(bad.passed, false);
assert(bad.hardFailures.includes('dangling-negation'));
assert(bad.hardFailures.includes('literal-plus-nonsense'));

const short = detectHushGarble({ outputText: 'Keep with 04/21.', protectedLiterals: ['04/21'] });
assert.equal(short.passed, false);
assert(short.fragments.some((fragment) => fragment.includes('keep with')));

const clean = detectHushGarble({ outputText: 'FILE-72 should stay tied to the same export minute. One copy has the footer and one copy does not.', protectedLiterals: ['FILE-72'] });
assert.equal(clean.passed, true);
assert.equal(clean.hardFailures.length, 0);

console.log('hush-garble-gate tests passed');
