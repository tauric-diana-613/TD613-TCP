import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('scripts/loom-production-canary.mjs', 'utf8');

assert.doesNotMatch(source, /Promise\.all\s*\(/, 'production AI witnesses must not be launched concurrently');

const marrowlineProbe = source.indexOf('const marrowlineResult = await postJson(marrowlineUrl, marrowlineInput);');
const loomProbe = source.indexOf('const loomResult = await postJson(loomUrl, input);');
assert.ok(marrowlineProbe >= 0, 'Marrowline live-route witness must remain present');
assert.ok(loomProbe >= 0, 'Loom Demo 1 witness must remain present');
assert.ok(marrowlineProbe < loomProbe, 'Marrowline and Loom witnesses must execute serially in declared order');

assert.match(source, /request_execution:\s*'serial-independent'/);
assert.match(source, /request_order:\s*\['marrowline',\s*'loom'\]/);
assert.match(source, /Array\.isArray\(marrowlinePayload\?\.attempts\)/, 'held Marrowline responses must preserve provider-attempt evidence');
assert.match(source, /diagnostic:\s*boundedRouteDiagnostic\(marrowlinePayload\?\.diagnostic\)/, 'held Marrowline responses must preserve bounded diagnostic evidence');
assert.match(source, /if \(!receipt\.marrowline_live_route\.relay_admitted\)/, 'serial isolation must not weaken relay admission');
assert.match(source, /if \(!receipt\.answer_nonempty\)/, 'serial isolation must not weaken Loom answer admission');

console.log('loom-production-canary-isolation.test.mjs passed');
