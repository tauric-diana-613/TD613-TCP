import './contract-failure-receipt.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = path => fs.readFileSync(path, 'utf8');
const releaseWorkflow = read('.github/workflows/vercel-operator-release.yml');
const consolidatedWorkflow = read('.github/workflows/td613-ci.yml');
const lifecycleCompiler = read('scripts/ash-lifecycle-production-probe.mjs');
const lifecycleBase = read('scripts/ash-lifecycle-production-probe-base.mjs');
const lifecycleLoader = read('app/dome-world/ash-lifecycle.js');
const constitutionalConvergence = read('app/dome-world/ash-convergence.js');
const localClosureServer = read('scripts/ash-keep-local-closure-server.mjs');
const domeGuard = read('api/dome-world-engine-guard.py');
const vercelConfig = read('vercel.json');
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

for (const marker of ['Observe deployed Ash lifecycle without promotion','ash-lifecycle-production-probe.mjs',"production_chromium_desktop_mobile = ${{ steps.scope.outputs.validation_scope == 'full' && 'PASS' || 'NOT_APPLICABLE' }}","ash_lifecycle_deployed_observation = ${{ steps.scope.outputs.validation_scope == 'full' && 'PASS' || 'NOT_APPLICABLE' }}"]) assert.ok(releaseWorkflow.includes(marker), `Bounded release omitted ${marker}`);
assert.match(consolidatedWorkflow, /Run bounded closure and constitutional convergence once/);
for (const token of [
  "const browserName = process.env.TD613_BROWSER || 'chromium'",
  "if (!['chromium', 'firefox', 'webkit'].includes(browserName))",
  "const adaptedGenerator = pathToFileURL(path.join(tempDir, 'ash-lifecycle-production-probe.mjs')).href",
  'await import(`${adaptedGenerator}?engine=${browserName}&fixture=${Date.now()}`)',
  'await fs.rm(tempDir, { recursive:true, force:true })'
]) assert.ok(compatibilityRunner.includes(token), `Compatibility closure runner omitted bounded browser adapter contract ${token}`);
assert.doesNotMatch(compatibilityRunner, /run-ash-keep-a1-production-probe-base\.mjs/);
assert.match(compatibilityRunner, /retired pre-lifecycle A1 closure journey/);
for (const token of [
  "await fs.rm(path.join(repoRoot, 'artifacts', staleDirectory), { recursive:true, force:true })",
  "'ash-keep-production-closure'",
  "'ash-keep-probe-runtime'"
]) assert.ok(compatibilityRunner.includes(token), `Compatibility closure runner omitted stale-artifact quarantine ${token}`);
for (const token of ['ARRIVAL_UNPERSISTED','CASE_BOUND','REBUILD_ELIGIBLE','RELEASE_ELIGIBLE','CONTINUITY_SEALED','promotion_authorized: false','continuity is not transport']) assert.ok(probe.includes(token));
for (const token of [
  'legacy_bypass === true',
  "location.pathname === '/dome-world/ash-threshold.html'",
  "location.search === ''",
  "visible_url === '/dome-world/ash-threshold.html'",
  "dataset.ashCachePreflight === 'complete'",
  "dataset.ashModuleGraph === 'ready'",
  "dataset.ashAiaReady === 'true'",
  '__td613AshLiveAIA?.version',
  "__td613AshAia3Composition?.version === 'td613.ash.aia3-composition/v0.5-human-profile-choice'",
  '__td613AshAia3Composition?.current?.()',
  "aia3?.session_open === false",
  "aia3?.membrane_ready === false",
  "aia3?.hold === 'WAITING_INGRESS_PROFILE'",
  "aia3?.route_count === 0",
  "aia3?.task_count === 0",
  "querySelectorAll('[data-aia-route]').length === 4",
  "querySelectorAll('[data-aia-task]').length === 4",
  '__td613AshFlowcoreIngressPortalLoader',
  '__td613AshFlowcoreIngressPortal?.current?.()',
  'cleared_arrival_module_settlement',
  'neutral_ingress_preserved:true',
  'aia3_installation_ready:true',
  'human_profile_choice_required:true',
  'human_profile_choice_completed:false',
  'dependency_imports_settled:true',
  'specialist_navigation_admitted:true',
  "specialist_presentation_route = 'legacy-request-canonicalized'",
  "specialist_visible_url = '/dome-world/ash-threshold.html'",
  'aia3_route_required: false',
  'reload_required: false',
  "url.searchParams.get('arrival') === 'cleared'",
  'td613.ash.cache-flush.aia3.epoch',
  'td613.ash.cache-preflight.epoch',
  "page.on('response'",
  'http_errors:httpErrors',
  'request_failures:requestFailures',
  'expected_transition_aborts',
  'unexpected_request_failures',
  "item?.failure !== 'net::ERR_ABORTED'",
  "url.pathname === '/api/dome-world-shell'",
  "url.searchParams.get('surface') === 'cache-evict'",
  "url.pathname === '/dome-world/ash-aia3-composition.js'",
  'Unexpected request failures observed:',
  'message.location()'
]) assert.ok(lifecycleCompiler.includes(token), `Lifecycle observer omitted ${token}`);
const settlementBlock = lifecycleCompiler.match(/report\.readiness = readiness;[\s\S]*?cleared-arrival neutral-ingress module settlement before specialist navigation/)?.[0] || '';
assert.match(lifecycleCompiler, /report\.threshold\.cleared_arrival_module_settlement[\s\S]{0,4200}await page\.goto\(keepUrl/, 'Cleared-arrival public owners must settle before specialist navigation.');
assert.equal((lifecycleCompiler.match(/cleared-arrival neutral-ingress module settlement before specialist navigation/g) || []).length, 1);
assert.match(settlementBlock, /WAITING_INGRESS_PROFILE/, 'Cleared-arrival settlement must preserve the explicit human profile-choice hold.');
assert.match(settlementBlock, /aia3\?\.membrane_ready === false/, 'No-case AIA3 installation readiness must remain distinct from open-case membrane readiness.');
assert.doesNotMatch(settlementBlock, /aia3\?\.membrane_ready === true|aia3\?\.route_count === 4|aia3\?\.task_count === 4/, 'Module settlement must not require human profile completion or an open-case route graph.');
assert.doesNotMatch(lifecycleCompiler, /url\.pathname === '\/engine\/ash-live-aia\.js'|url\.pathname === '\/engine\/ash-pedagogue-adapter\.js'/, 'Live AIA and pedagogue dependencies must complete rather than enter the expected-abort classifier.');
assert.ok(lifecycleCompiler.includes('runtime.includes("searchParams.get(\'presentation\') === \'legacy\'")'), 'Lifecycle compiler must reject the retired visible-query predicate');
assert.ok(lifecycleCompiler.includes('runtime.includes("current?.().route === \'IMPLEMENTATION\'")'));
assert.match(shell, /const legacyPresentation=incoming\.searchParams\.get\('presentation'\)==='legacy'/);
assert.match(shell, /if\(location\.pathname!==canonicalPath\|\|location\.search\)\{history\.replaceState\(null,''?,canonicalPath\+location\.hash\)\}/);
assert.match(shell, /legacy_bypass:true/);
assert.match(lifecycleLoader, /await preflight/);
assert.match(lifecycleLoader, /__td613AshAia3PreflightReceipt\?\.legacy_bypass === true/);
assert.match(lifecycleLoader, /if \(legacyPresentation\)[\s\S]*dataset\.ashAiaLegacy = 'true'/);
assert.doesNotMatch(lifecycleLoader.match(/if \(legacyPresentation\)[\s\S]*?\} else \{/s)?.[0] || '', /ash-keep-aia\.js|ash-aia3-composition\.js|ash-keep-aia-workspace-bridge\.js/);
for (const token of ['window.__td613AshKeep?.version','demo_click_deferred_until_ready: true','timeout: 60000']) assert.ok(convergenceRunner.includes(token));
for (const token of [
  "const CURRENT_REGISTRY_VERSION = 'td613.ash.demo-registry/v0.3-a15'",
  "const RETIRED_REGISTRY_VERSION = 'td613.ash.demo-registry/v0.1-a13'",
  "window.__td613AshDemoRegistry?.version === '${CURRENT_REGISTRY_VERSION}'",
  "document.documentElement.dataset.ashDemoRegistry === '${CURRENT_REGISTRY_VERSION}'",
  "button.dataset.ashDemoRegistryOwner === '${CURRENT_REGISTRY_VERSION}'",
  'current_registry_version:',
  'retired_registry_alias_added: false',
  "if (!runtime.includes(CURRENT_REGISTRY_VERSION)) throw new Error('Current A15 registry identity omitted from convergence runtime.')",
  "if (runtime.includes(RETIRED_REGISTRY_VERSION)) throw new Error('Retired A13 registry identity survived convergence compilation.')"
]) assert.ok(convergenceRunner.includes(token), `Convergence observer omitted A15 registry identity law ${token}`);
assert.equal((convergenceRunner.match(/td613\.ash\.demo-registry\/v0\.1-a13/g) || []).length, 1, 'Retired A13 registry identity may survive only as the rejection constant.');
assert.equal((convergenceRunner.match(/td613\.ash\.demo-registry\/v0\.3-a15/g) || []).length, 1, 'A15 registry identity must have one canonical materializer constant.');
for (const token of [
  'function currentLifecycleRank(current)',
  'const lifecycleRank = currentLifecycleRank(current)',
  'context?.lifecycle_rank !== lifecycleRank',
  'await reconcileAuthority(`runtime-permission:${action}`)'
]) assert.ok(constitutionalConvergence.includes(token), `Constitutional convergence omitted ${token}`);
const authorityFreshnessIndex = constitutionalConvergence.indexOf('context?.lifecycle_rank !== lifecycleRank');
const authorityVerificationIndex = constitutionalConvergence.indexOf('return await verifyAuthorityContext(context');
assert.ok(authorityFreshnessIndex >= 0 && authorityFreshnessIndex < authorityVerificationIndex, 'Lifecycle rank freshness must be checked before a bound Authority Context is accepted');
for (const token of [
  "const ASH_CUSTODY_REGISTER_ROUTE = '/api/dome-world/ash-custody-register'",
  "req.method === 'POST' && url.pathname === ASH_CUSTODY_REGISTER_ROUTE",
  'validate_l1_boundary_flags',
  'commitment.dispatch_post(envelope)',
  "'x-td613-ash-commitment': 'v0.8-guarded-local-closure'",
  'MAX_POST_BODY_BYTES = 131_072',
  "const DOME_READINESS_ROUTE = '/api/dome-world/readiness'",
  'dome-world-engine-guard.py',
  'guard.guarded_readiness_receipt("readiness")',
  'function sendGuardedDomeReadiness(res)',
  "'x-td613-dome-world-local-closure': 'production-guard-parity'",
  "'x-td613-custody-route': 'isolated'",
  'url.pathname === DOME_READINESS_ROUTE'
]) assert.ok(localClosureServer.includes(token), `Local closure server omitted ${token}`);
assert.match(domeGuard, /def guarded_readiness_receipt\(operation="readiness"\)/);
assert.match(vercelConfig, /"source": "\/api\/dome-world\/readiness"[\s\S]{0,160}"destination": "\/api\/dome-world-engine-guard\?operation=readiness"/);
const exactGuardedRoute = localClosureServer.indexOf("req.method === 'POST' && url.pathname === ASH_CUSTODY_REGISTER_ROUTE");
const exactReadinessRoute = localClosureServer.indexOf('url.pathname === DOME_READINESS_ROUTE');
const genericMethodHold = localClosureServer.indexOf("req.method !== 'GET' && req.method !== 'HEAD'");
const staticFallback = localClosureServer.indexOf('const relative = decodeURIComponent(resolvePublicPath(url.pathname));');
assert.ok(exactGuardedRoute >= 0 && exactGuardedRoute < genericMethodHold, 'Exact guarded custody POST must be admitted before the generic method hold');
assert.ok(exactReadinessRoute >= 0 && exactReadinessRoute < genericMethodHold && exactReadinessRoute < staticFallback, 'Production-parity Dome readiness GET must be admitted before generic method and static-file fallback');
assert.doesNotMatch(localClosureServer, /req\.method === 'POST'\s*&&\s*url\.pathname\.startsWith|\/api\/dome-world\/\(\.\*\)/);
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
console.log('ash-lifecycle-production-contract.test.mjs passed under canonicalized legacy bypass, installation-versus-human-choice settlement, stale-artifact quarantine, production-guard readiness parity, exact transition-abort classification, guarded local custody, lifecycle-rank authority freshness, direct A15 convergence registry identity, bounded multi-engine lifecycle adapter, and URL-specific failure diagnostics');