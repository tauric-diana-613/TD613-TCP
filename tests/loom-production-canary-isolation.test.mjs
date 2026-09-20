import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('scripts/loom-production-canary.mjs', 'utf8');
const releaseWorkflow = fs.readFileSync('.github/workflows/vercel-operator-release.yml', 'utf8');
const qualityServer = fs.readFileSync('server/khonapolit-quality.js', 'utf8');
const loomServer = fs.readFileSync('server/loom-task.js', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.doesNotMatch(source, /Promise\.all\s*\(/, 'production AI witnesses must not be launched concurrently');

const marrowlineProbe = source.indexOf('const marrowlineResult = await postJson(marrowlineUrl, marrowlineInput, LIVE_WITNESS_TIMEOUT_MS, { canaryModel: marrowlineCanaryModel });');
const marrowlineCheckpoint = source.indexOf("fs.writeFileSync(path.join(artifactDir, 'marrowline-transport-checkpoint.json')");
const loomProbe = source.indexOf('const loomResult = await postJson(loomUrl, input, LIVE_WITNESS_TIMEOUT_MS, { canaryModel: loomCanaryModel });');
assert.ok(marrowlineProbe >= 0, 'Marrowline live-route witness must remain present');
assert.ok(marrowlineCheckpoint > marrowlineProbe, 'Marrowline transport evidence must checkpoint after its live witness completes');
assert.ok(loomProbe > marrowlineCheckpoint, 'Marrowline checkpoint must be durable before the Loom witness starts');
assert.ok(marrowlineProbe < loomProbe, 'Marrowline and Loom witnesses must execute serially in declared order');

const witnessTimeoutMatch = source.match(/const LIVE_WITNESS_TIMEOUT_MS = (\d+);/);
assert.ok(witnessTimeoutMatch, 'production canary must declare one explicit per-witness timeout');
const witnessTimeoutMs = Number(witnessTimeoutMatch[1]);
assert.equal(witnessTimeoutMs, 270000, 'remote observer must leave return-flight margin beyond the 240-second Vercel function ceiling');
const providerFunctionCeilingMs = Number(vercel.functions?.['api/khonapolit.js']?.maxDuration || 0) * 1000;
assert.equal(providerFunctionCeilingMs, 240000, 'production provider route must retain its bounded 240-second server ceiling');
assert.ok(
  witnessTimeoutMs >= providerFunctionCeilingMs + 15000,
  'remote witness timeout must exceed the server ceiling by at least fifteen seconds of return-flight margin'
);
assert.ok(
  witnessTimeoutMs <= providerFunctionCeilingMs + 60000,
  'remote witness margin must remain bounded rather than silently widening provider execution authority'
);
const outerTimeoutMatch = releaseWorkflow.match(/timeout --foreground --signal=INT --kill-after=10s (\d+)s node scripts\/loom-production-canary\.mjs/);
assert.ok(outerTimeoutMatch, 'release workflow must retain an explicit outer canary timeout');
const outerTimeoutMs = Number(outerTimeoutMatch[1]) * 1000;
const requiredSerialBudgetMs = witnessTimeoutMs * 2 + 15000;
assert.ok(
  outerTimeoutMs >= requiredSerialBudgetMs,
  `outer canary timeout ${outerTimeoutMs}ms cannot preempt two strict serial ${witnessTimeoutMs}ms witnesses plus 15s orchestration margin`
);
assert.ok(outerTimeoutMs >= 600000, 'outer release witness must cover serial Marrowline and Loom live routes under the streamed completion wall');

assert.match(source, /'x-td613-release-canary': '1'/);
assert.match(source, /'x-td613-canary-model': canaryModel/);
assert.match(source, /posture: 'one-seat-per-route-provider-liveness'/);
assert.match(source, /max_http_requests: 2/);
assert.match(source, /max_provider_requests: 2/);
assert.match(source, /marrowline_structural_repair_ceiling: 0/);
assert.match(source, /loom_provider_seat_ceiling: 1/);
assert.match(loomServer, /const canaryModels = canaryModel/);
assert.doesNotMatch(loomServer, /\.\.\.allModels\.filter\(candidate => candidate !== canaryModel\)/, 'release canary cannot fan out across Loom seats');
assert.match(loomServer, /const canaryModels = canaryModel \? \[canaryModel\] : \[\]/);
assert.match(loomServer, /const models = releaseCanary \? canaryModels : allModels;/);
assert.match(qualityServer, /if \(releaseCanary\) return null;/, 'release canary must not spend an interactive structural-repair request');
assert.match(qualityServer, /KHONAPOLIT_MAX_STRUCTURAL_REPAIRS = 1/);
assert.match(source, /const marrowlineResult = await postJson\(marrowlineUrl, marrowlineInput, LIVE_WITNESS_TIMEOUT_MS, \{ canaryModel: marrowlineCanaryModel \}\)/);
assert.match(source, /schema: 'td613\.loom\.production-canary-route-checkpoint\/v0\.5-one-seat-release-budget'/);
assert.doesNotMatch(source, /marrowlineSeatRetry/);
assert.doesNotMatch(source, /marrowlinePrimaryResult/);
assert.match(source, /coverage: 'this-release-witness-only'/);
assert.match(source, /provider_daily_total: null/);
assert.match(source, /releaseConsumptionEvents\.length/);
assert.match(source, /\.slice\(0, 2\)/, 'release consumption artifact cannot exceed one Marrowline call plus one Loom call');
assert.match(source, /marrowline_model: marrowlineCanaryModel/);
assert.match(source, /loom_model: loomCanaryModel/);
assert.match(source, /request_execution:\s*'serial-independent'/);
assert.match(source, /request_order:\s*\['marrowline', 'loom'\]/);
assert.doesNotMatch(source, /marrowline-seat-retry/);
assert.match(source, /per_witness_timeout_ms:\s*LIVE_WITNESS_TIMEOUT_MS/);
assert.match(source, /count <= LIVE_WITNESS_TIMEOUT_MS/, 'long stage timing evidence must survive the post-60s provider world');
assert.match(source, /provider_stream:\s*attempt\?\.providerStream/, 'production receipts must preserve bounded provider stream progress');
assert.match(source, /Array\.isArray\(marrowlinePayload\?\.attempts\)/, 'held Marrowline responses must preserve provider-attempt evidence');
assert.match(source, /diagnostic:\s*boundedRouteDiagnostic\(marrowlinePayload\?\.diagnostic\)/, 'held Marrowline responses must preserve bounded diagnostic evidence');
assert.match(source, /if \(!receipt\.marrowline_live_route\.relay_admitted\)/, 'serial isolation must not weaken relay admission');
assert.match(source, /if \(!receipt\.answer_nonempty\)/, 'serial isolation must not weaken Loom answer admission');

console.log('loom-production-canary-isolation.test.mjs passed');
