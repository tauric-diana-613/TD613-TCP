import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('scripts/loom-production-canary.mjs', 'utf8');
const releaseWorkflow = fs.readFileSync('.github/workflows/vercel-operator-release.yml', 'utf8');

assert.doesNotMatch(source, /Promise\.all\s*\(/, 'production AI witnesses must not be launched concurrently');

const marrowlineProbe = source.indexOf('const marrowlineResult = await postJson(marrowlineUrl, marrowlineInput);');
const marrowlineCheckpoint = source.indexOf("fs.writeFileSync(path.join(artifactDir, 'marrowline-transport-checkpoint.json')");
const loomProbe = source.indexOf('const loomResult = await postJson(loomUrl, input);');
assert.ok(marrowlineProbe >= 0, 'Marrowline live-route witness must remain present');
assert.ok(marrowlineCheckpoint > marrowlineProbe, 'Marrowline transport evidence must checkpoint after its live witness completes');
assert.ok(loomProbe > marrowlineCheckpoint, 'Marrowline checkpoint must be durable before the Loom witness starts');
assert.ok(marrowlineProbe < loomProbe, 'Marrowline and Loom witnesses must execute serially in declared order');

const witnessTimeoutMatch = source.match(/const LIVE_WITNESS_TIMEOUT_MS = (\d+);/);
assert.ok(witnessTimeoutMatch, 'production canary must declare one explicit per-witness timeout');
const witnessTimeoutMs = Number(witnessTimeoutMatch[1]);
assert.equal(witnessTimeoutMs, 240000, 'streamed Marrowline live-route witness must allow the bounded 210-second completion wall');
const outerTimeoutMatch = releaseWorkflow.match(/timeout --foreground --signal=INT --kill-after=10s (\d+)s node scripts\/loom-production-canary\.mjs/);
assert.ok(outerTimeoutMatch, 'release workflow must retain an explicit outer canary timeout');
const outerTimeoutMs = Number(outerTimeoutMatch[1]) * 1000;
const requiredSerialBudgetMs = witnessTimeoutMs * 2 + 15000;
assert.ok(
  outerTimeoutMs >= requiredSerialBudgetMs,
  `outer canary timeout ${outerTimeoutMs}ms cannot preempt two strict serial ${witnessTimeoutMs}ms witnesses plus 15s orchestration margin`
);
assert.ok(outerTimeoutMs >= 600000, 'outer release witness must cover serial Marrowline and Loom live routes under the streamed completion wall');

assert.match(source, /request_execution:\s*'serial-independent'/);
assert.match(source, /request_order:\s*\['marrowline',\s*'loom'\]/);
assert.match(source, /per_witness_timeout_ms:\s*LIVE_WITNESS_TIMEOUT_MS/);
assert.match(source, /Array\.isArray\(marrowlinePayload\?\.attempts\)/, 'held Marrowline responses must preserve provider-attempt evidence');
assert.match(source, /diagnostic:\s*boundedRouteDiagnostic\(marrowlinePayload\?\.diagnostic\)/, 'held Marrowline responses must preserve bounded diagnostic evidence');
assert.match(source, /if \(!receipt\.marrowline_live_route\.relay_admitted\)/, 'serial isolation must not weaken relay admission');
assert.match(source, /if \(!receipt\.answer_nonempty\)/, 'serial isolation must not weaken Loom answer admission');

console.log('loom-production-canary-isolation.test.mjs passed');
