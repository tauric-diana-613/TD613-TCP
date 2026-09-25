import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('scripts/loom-production-canary.mjs', 'utf8');
const releaseWorkflow = fs.readFileSync('.github/workflows/vercel-operator-release.yml', 'utf8');
const reobserveWorkflow = fs.readFileSync('.github/workflows/vercel-production-reobserve.yml', 'utf8');
const qualityServer = fs.readFileSync('server/khonapolit-quality.js', 'utf8');
const loomServer = fs.readFileSync('server/loom-task.js', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.doesNotMatch(source, /Promise\.all\s*\(/, 'production AI witnesses must not be launched concurrently');

const marrowlineProbe = source.indexOf('const marrowlineResult = await postJson(marrowlineUrl, marrowlineInput, LIVE_WITNESS_TIMEOUT_MS, { releaseCanary: false });');
const marrowlineCheckpoint = source.indexOf("fs.writeFileSync(path.join(artifactDir, 'marrowline-transport-checkpoint.json')");
const loomProbe = source.indexOf('const loomResult = await postJson(loomUrl, input, LIVE_WITNESS_TIMEOUT_MS, { releaseCanary: true, canaryModel: loomCanaryModel });');
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
assert.doesNotMatch(releaseWorkflow, /node scripts\/loom-production-canary\.mjs/, 'Vercel deployment success must not automatically spend Gemini quota or depend on provider liveness');
assert.match(releaseWorkflow, /Defer live AI canary to explicit observation lane/);
assert.match(releaseWorkflow, /automatic_provider_calls:\s*0/);
assert.match(releaseWorkflow, /production_loom_demo1_canary = .*DEFERRED_EXPLICIT_OBSERVATION/);
const outerTimeoutMatch = reobserveWorkflow.match(/timeout --foreground --signal=INT --kill-after=10s (\d+)s node scripts\/loom-production-canary\.mjs/);
assert.ok(outerTimeoutMatch, 'explicit production AI observation must retain a bounded outer canary timeout');
const outerTimeoutMs = Number(outerTimeoutMatch[1]) * 1000;
const requiredSerialBudgetMs = witnessTimeoutMs * 2 + 15000;
assert.ok(
  outerTimeoutMs >= requiredSerialBudgetMs,
  `outer canary timeout ${outerTimeoutMs}ms cannot preempt two strict serial ${witnessTimeoutMs}ms witnesses plus 15s orchestration margin`
);
assert.ok(outerTimeoutMs >= 600000, 'outer release witness must cover serial Marrowline and Loom live routes under the streamed completion wall');

assert.match(source, /releaseCanary \? \{ 'x-td613-release-canary': '1' \} : \{\}/);
assert.match(source, /'x-td613-canary-model': canaryModel/);
assert.match(source, /posture: 'explicit-observation-marrowline-operator-parity-plus-one-seat-loom'/);
assert.match(source, /max_http_requests: 2/);
assert.match(source, /max_provider_requests: 7/);
assert.match(source, /marrowline_provider_seat_ceiling: 5/);
assert.match(source, /marrowline_structural_repair_ceiling: 1/);
assert.match(source, /loom_provider_seat_ceiling: 1/);
assert.match(loomServer, /const canaryModels = canaryModel/);
assert.doesNotMatch(loomServer, /\.\.\.allModels\.filter\(candidate => candidate !== canaryModel\)/, 'release canary cannot fan out across Loom seats');
assert.match(loomServer, /const canaryModels = canaryModel \? \[canaryModel\] : \[\]/);
assert.match(loomServer, /const models = releaseCanary \? canaryModels : allModels;/);
assert.match(qualityServer, /if \(releaseCanary\) return null;/, 'release canary must not spend an interactive structural-repair request');
assert.match(qualityServer, /KHONAPOLIT_MAX_STRUCTURAL_REPAIRS = 1/);
assert.match(source, /const marrowlineResult = await postJson\(marrowlineUrl, marrowlineInput, LIVE_WITNESS_TIMEOUT_MS, \{ releaseCanary: false \}\)/);
assert.match(source, /schema: 'td613\.loom\.production-canary-route-checkpoint\/v0\.6-explicit-observation-only'/);
assert.doesNotMatch(source, /marrowlineSeatRetry/);
assert.doesNotMatch(source, /marrowlinePrimaryResult/);
assert.match(source, /coverage: 'this-release-witness-only'/);
assert.match(source, /provider_daily_total: null/);
assert.match(source, /releaseConsumptionEvents\.length/);
assert.match(source, /\.slice\(0, 7\)/, 'release consumption artifact must preserve up to five Marrowline seats, one structural repair, and one Loom call');
assert.doesNotMatch(source, /TD613_MARROWLINE_CANARY_MODEL/, 'Marrowline observation must never pin the human route to one provider seat');
assert.match(source, /TD613_LOOM_CANARY_MODEL \|\| 'gemini-3\.5-flash'/);
assert.match(source, /const loomResult = await postJson\(loomUrl, input, LIVE_WITNESS_TIMEOUT_MS, \{ releaseCanary: true, canaryModel: loomCanaryModel \}\)/, 'Loom observation remains explicitly one-seat pinned while Marrowline exercises operator-parity failover');
assert.doesNotMatch(source, /canarySeed/, 'explicit canaries must not hash-rotate deployments onto arbitrary model seats');
assert.match(source, /marrowline_routing: 'interactive-five-seat-frontier'/);
assert.match(source, /routing_mode: 'interactive-five-seat-frontier'/);
assert.match(source, /loom_model: loomCanaryModel/);
assert.match(source, /request_execution:\s*'serial-independent'/);
assert.match(source, /request_order:\s*\['marrowline', 'loom'\]/);
assert.doesNotMatch(source, /marrowline-seat-retry/);
assert.match(source, /per_witness_timeout_ms:\s*LIVE_WITNESS_TIMEOUT_MS/);
assert.match(source, /count <= LIVE_WITNESS_TIMEOUT_MS/, 'long stage timing evidence must survive the post-60s provider world');
assert.match(source, /provider_stream:\s*attempt\?\.providerStream/, 'production receipts must preserve bounded provider stream progress');
assert.match(source, /completion:\s*attempt\?\.completion/, 'paid HTTP 200 must retain the observed finish and completion reason for each attempt');
assert.match(source, /finish_reason:\s*typeof attempt\.completion\.finishReason/, 'a STOP or MAX_TOKENS observation must survive the bounded witness');
assert.match(source, /authored_text_chunk_count:\s*boundedCount\(attempt\.providerStream\.authoredTextChunkCount\)/);
assert.match(source, /stream_grace_ms:\s*boundedCount\(attempt\.providerStream\.streamGraceMs\)/);
assert.match(source, /interrupted:\s*attempt\.providerStream\.interrupted === true/);
assert.match(source, /interruption_class:\s*typeof attempt\.providerStream\.interruptionClass/);
assert.match(source, /Array\.isArray\(marrowlinePayload\?\.attempts\)/, 'held Marrowline responses must preserve provider-attempt evidence');
assert.match(source, /diagnostic:\s*boundedRouteDiagnostic\(marrowlinePayload\?\.diagnostic\)/, 'held Marrowline responses must preserve bounded diagnostic evidence');
assert.doesNotMatch(source, /throw new Error\('Marrowline production canary returned a non-admitted relay\.'\)/, 'local admission cannot veto a nonempty human-surface Marrowline return');
assert.match(source, /human_surface_returned:/, 'receipt must record the human-surface success boundary independently of local admission');
assert.match(source, /local_admission_authority:\s*'diagnostic-not-human-surface-veto'/, 'receipt must state the local-admission authority ceiling');
assert.match(source, /LOCAL_ADMISSION_NONBLOCKING/, 'non-admitted local structure remains visible diagnostic evidence');
assert.match(source, /if \(!receipt\.answer_nonempty\)/, 'serial isolation must not weaken Loom answer admission');
assert.match(source, /const loomProviderLivenessHeld = !transportError/);
assert.match(source, /attempt\.status === 429 \|\| attempt\.status === 503/);
assert.match(source, /PROVIDER_LIVENESS_HELD_NONBLOCKING/);
assert.match(source, /httpStatus === 504/);
assert.match(source, /payload\?\.diagnostic\?\.code === 'DEADLINE_EXCEEDED'/);
assert.match(source, /loom_provider_liveness_nonblocking: loomProviderLivenessHeld/);
assert.match(reobserveWorkflow, /Classify bounded live AI observation/);
assert.match(reobserveWorkflow, /marrowline_status=PASS/);
assert.match(reobserveWorkflow, /marrowline_local_admission=\$\{localAdmission\}/);
assert.match(reobserveWorkflow, /marrowline\?\.answer_nonempty !== true/);
assert.match(reobserveWorkflow, /marrowline\?\.human_surface_returned !== true/);
assert.doesNotMatch(reobserveWorkflow, /marrowline\?\.relay_admitted !== true/);
assert.match(reobserveWorkflow, /loom_status=\$\{loomStatus\}/);
assert.match(reobserveWorkflow, /production_loom_demo1_canary = \$LOOM_STATUS/);
assert.match(reobserveWorkflow, /marrowline_live_route = \$MARROWLINE_STATUS/);
assert.match(reobserveWorkflow, /marrowline_local_admission = \$MARROWLINE_LOCAL_ADMISSION/);


console.log('loom-production-canary-isolation.test.mjs passed');
