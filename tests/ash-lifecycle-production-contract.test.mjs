import './contract-failure-receipt.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = path => fs.readFileSync(path, 'utf8');
const releaseWorkflow = read('.github/workflows/vercel-operator-release.yml');
const consolidatedWorkflow = read('.github/workflows/td613-ci.yml');
const lifecycleCompiler = read('scripts/ash-lifecycle-production-probe.mjs');
const lifecycleBase = read('scripts/ash-lifecycle-production-probe-base.mjs');
const probe = `${lifecycleCompiler}\n${lifecycleBase}`;
const compatibilityRunner = read('scripts/run-ash-keep-a1-production-probe.mjs');
const convergenceRunner = read('scripts/run-ash-constitutional-convergence-probe.mjs');
const shell = read('api/dome-world-shell.js');
const core = read('app/dome-world/ash-keep.js');
const controls = read('app/dome-world/ash-case-controls.js');
const keep = read('app/dome-world/ash-keep.html');
const delivery = read('app/dome-world/ash-keep-source.html');
const receipt = read('docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');
const stretch11 = read('docs/ASH_KEEP_STRETCH11_CLOSURE_RECEIPT.md');

for (const marker of ['Observe deployed Ash lifecycle without promotion','ash-lifecycle-production-probe.mjs','production_chromium_desktop_mobile = PASS','ash_lifecycle_deployed_observation = PASS']) assert.ok(releaseWorkflow.includes(marker), `Bounded release omitted ${marker}`);
assert.match(consolidatedWorkflow, /Run bounded closure and constitutional convergence once/);
assert.match(compatibilityRunner, /await import\('\.\/ash-lifecycle-production-probe\.mjs'\)/);
assert.doesNotMatch(compatibilityRunner, /run-ash-keep-a1-production-probe-base\.mjs/);
assert.match(compatibilityRunner, /retired pre-lifecycle A1 closure journey/);
for (const token of ['ARRIVAL_UNPERSISTED','CASE_BOUND','REBUILD_ELIGIBLE','RELEASE_ELIGIBLE','CONTINUITY_SEALED','promotion_authorized: false','continuity is not transport']) assert.ok(probe.includes(token));
for (const token of [
  'legacy_bypass === true',
  "location.pathname === '/dome-world/ash-threshold.html'",
  "location.search === ''",
  "visible_url === '/dome-world/ash-threshold.html'",
  "dataset.ashCachePreflight === 'complete'",
  "dataset.ashModuleGraph === 'ready'",
  "specialist_presentation_route = 'legacy-request-canonicalized'",
  "specialist_visible_url = '/dome-world/ash-threshold.html'",
  'aia3_route_required: false',
  'reload_required: false',
  "url.searchParams.get('arrival') === 'cleared'",
  'td613.ash.cache-flush.aia3.epoch',
  'td613.ash.cache-preflight.epoch'
]) assert.ok(lifecycleCompiler.includes(token), `Lifecycle observer omitted ${token}`);
assert.ok(lifecycleCompiler.includes('runtime.includes("searchParams.get(\'presentation\') === \'legacy\'")'), 'Lifecycle compiler must reject the retired visible-query predicate');
assert.ok(lifecycleCompiler.includes('runtime.includes("current?.().route === \'IMPLEMENTATION\'")'));
assert.match(shell, /const legacyPresentation=incoming\.searchParams\.get\('presentation'\)==='legacy'/);
assert.match(shell, /if\(location\.pathname!==canonicalPath\|\|location\.search\)\{history\.replaceState\(null,''?,canonicalPath\+location\.hash\)\}/);
assert.match(shell, /legacy_bypass:true/);
for (const token of ['window.__td613AshKeep?.version','demo_click_deferred_until_ready: true','timeout: 60000']) assert.ok(convergenceRunner.includes(token));
assert.doesNotMatch(core, /location\.reload\(\)/);
assert.equal(delivery, keep);
assert.match(controls, /DELETE_PARTIAL_HOLD/);
assert.match(receipt, /Status: `EARNED`/);
assert.match(receipt, /lifecycle maturity promotion ≠ transport authorization/);
assert.match(ledger, /component maturity after Stretch 11 local closure = 358 \/ 375/);
assert.match(ledger, /Stretch 11 — CLOSED LOCALLY/);
assert.match(roadmap, /Stretch 11 · Destination-Bound Handoff — CLOSED LOCALLY/);
assert.match(stretch11, /new serverless function = false/);
assert.match(stretch11, /active serverless functions = 11/);
assert.match(stretch11, /transport capability = NAMED_SAME_ORIGIN_BROWSER_RECIPIENT_ONLY/);
assert.equal(fs.existsSync('.github/workflows/ash-keep-production-closure.yml'), false);
assert.equal(fs.existsSync('.github/workflows/ash-keep-aia3-production-observation.yml'), false);
console.log('ash-lifecycle-production-contract.test.mjs passed under canonicalized legacy-bypass lifecycle routing');
