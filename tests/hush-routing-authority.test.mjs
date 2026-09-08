import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as legacy from '../server/hush-generate-budgeted.js';
import quality from '../server/hush-generate-quality.js';
import * as contract from '../server/hush-provider-contract.js';

// The compatibility route cannot retain a second selection loop or sticky state.
assert.equal(legacy.default, quality);
for (const [name, helper] of Object.entries(contract)) assert.equal(legacy[name], helper);
const source = readFileSync(new URL('../server/hush-provider-contract.js', import.meta.url), 'utf8');
assert.doesNotMatch(source, /process\.env|fetch\(|DEFAULT_MODEL_ORDER|preferredWorkingModel/);
console.log('hush-routing-authority.test.mjs passed');
