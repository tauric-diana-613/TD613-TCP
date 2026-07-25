import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const runtimeDir = path.resolve(process.env.TD613_PROBE_RUNTIME_DIR || path.join(repoRoot, 'artifacts', 'ash-keep-probe-runtime'));
const sourcePath = path.join(here, 'ash-keep-production-probe.mjs');
const runnerPath = path.join(here, 'run-ash-keep-production-probe.mjs');
const a1SourcePath = path.join(runtimeDir, 'ash-keep-production-probe.a1-source.mjs');
const a1RunnerPath = path.join(runtimeDir, 'run-ash-keep-production-probe.a1-runtime.mjs');
const adapterManifestPath = path.join(runtimeDir, 'a1-ingress-adapter-manifest.json');

function replaceExactlyOnce(source, target, replacement, label) {
  const count = source.split(target).length - 1;
  if (count !== 1) throw new Error(`A1 closure adapter requires exactly one ${label} seam; observed ${count}.`);
  return source.replace(target, replacement);
}

const keepUrlTarget = "const keepUrl = `${base}/dome-world/ash-keep.html?presentation=legacy`;";
const keepUrlReplacement = "const keepUrl = `${base}/dome-world/ash-threshold.html`;";

const arrivalTarget = `  await page.goto(keepUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  // ASH_AIA3_LEGACY_BYPASS_STABLE: rollback loads exact legacy work without an AIA eviction reload.
  await page.waitForFunction(() => window.__td613AshAia3PreflightReceipt?.legacy_bypass === true
    && document.documentElement.dataset.ashCachePreflight === 'complete', null, { timeout: 60_000 });
  await page.locator('h1').waitFor({ state: 'visible' });
  assert((await page.title()).includes('TD613 Ash Keep'), 'Ash Keep title was not observed');
  assert(await page.locator('#launch').isVisible(), 'Clean profile did not begin at the explicit launch gate');

  const cleanDb = await databaseSnapshot(page);
  const cleanCount = Object.values(cleanDb).reduce((total, rows) => total + rows.length, 0);
  const cleanEntries = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  const cleanTransition = await page.evaluate(() => window.__td613AshCacheTransition || null);
  const cleanKeys = Object.keys(cleanEntries);
  const cleanMaintenanceEntries = {"td613.ash.cache-flush.epoch":"td613.ash.cache-flush/2026-07-18-canonical-membrane-v7"};
  const cleanMaintenanceKeys = new Set(Object.keys(cleanMaintenanceEntries));
  const initialNonGet = requests.filter(request => request.method !== 'GET' && request.method !== 'HEAD');
  assert(cleanCount === 0, 'Clean arrival created case records before operator action');
  assert(cleanKeys.every(key => cleanMaintenanceKeys.has(key)), \`Clean arrival wrote case-adjacent localStorage before operator action: \${JSON.stringify(cleanEntries)}\`);
  for (const [key, value] of Object.entries(cleanMaintenanceEntries)) {
    assert(cleanEntries[key] === value, \`Clean arrival carried an unknown maintenance epoch for \${key}: \${JSON.stringify(cleanEntries)}\`);
  }
  assert(initialNonGet.length === 0, 'Clean arrival emitted a non-read network request');
  report.clean_arrival = {
    launch_visible: true,
    indexeddb_record_count: cleanCount,
    local_storage_keys: cleanKeys,
    maintenance_entries: cleanEntries,
    permitted_maintenance_entries: cleanMaintenanceEntries,
    cache_navigation_replaced: cleanTransition?.navigation_replaced ?? null,
    mass_eviction_superseded_legacy_reset: cleanTransition?.superseded_by_mass_eviction === true,
    case_adjacent_storage_written: false,
    non_read_requests: initialNonGet
  };`;

const arrivalReplacement = `  await page.goto(keepUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForFunction(() => document.documentElement.dataset.ashModuleGraph === 'ready'
    && document.documentElement.dataset.ashCachePreflight === 'complete'
    && window.__td613AshAia3PreflightReceipt
    && window.__td613AshFirstPaintWitness, null, { timeout: 60_000 });
  await page.locator('h1').waitFor({ state: 'visible' });
  const arrival = await page.evaluate(() => ({
    title: document.title,
    url: location.pathname + location.search,
    first_paint: window.__td613AshFirstPaintWitness,
    preflight: window.__td613AshAia3PreflightReceipt,
    module_graph: document.documentElement.dataset.ashModuleGraph,
    preparing_hidden: getComputedStyle(document.getElementById('td613-ash-preparing-shell')).display === 'none'
  }));
  assert(arrival.title === 'TD613 Ash', 'Canonical Ash title was not observed');
  assert(arrival.url === '/dome-world/ash-threshold.html', 'Canonical Ash URL drifted during closure observation');
  assert(arrival.first_paint?.legacy_composition_visible === false, 'Legacy composition became visible during first paint');
  assert(arrival.first_paint?.epoch_query_visible === false, 'An epoch query became visible during first paint');
  assert(arrival.module_graph === 'ready' && arrival.preparing_hidden, 'Canonical module graph did not replace the Preparing Ash shell');
  assert(await page.locator('#launch').isVisible(), 'Clean profile did not begin at the explicit launch gate');

  const cleanDb = await databaseSnapshot(page);
  const cleanCount = Object.values(cleanDb).reduce((total, rows) => total + rows.length, 0);
  const cleanEntries = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  const cleanKeys = Object.keys(cleanEntries);
  const cleanValues = Object.values(cleanEntries).join('\\n');
  const initialNonGet = requests.filter(request => request.method !== 'GET' && request.method !== 'HEAD');
  assert(cleanCount === 0, 'Clean arrival created case records before operator action');
  assert(cleanKeys.every(key => ALLOWED_LOCAL_KEYS.has(key)), \`Clean arrival wrote an ungoverned localStorage key: \${JSON.stringify(cleanEntries)}\`);
  assert(!cleanKeys.includes('td613.ash-keep.current-case'), 'Clean arrival bound a case before operator action');
  assert(!cleanValues.includes('Harbor City Mayoral Campaign') && !cleanValues.includes('node_candidate'), 'Clean arrival stored campaign case material in delivery markers');
  assert(initialNonGet.length === 0, 'Clean arrival emitted a non-read network request');
  report.clean_arrival = {
    launch_visible: true,
    canonical_title: arrival.title,
    canonical_url: arrival.url,
    first_paint: arrival.first_paint,
    preflight_performed: Boolean(arrival.preflight?.performed),
    indexeddb_record_count: cleanCount,
    local_storage_keys: cleanKeys,
    maintenance_entries: cleanEntries,
    case_adjacent_storage_written: false,
    non_read_requests: initialNonGet
  };`;

const rebuildTarget = `  await page.locator('#loadSeed').click();
  await waitForText(page, '#testReceipt', /"test_digest"/, 45_000);`;
const rebuildReplacement = `  await page.locator('#loadSeed').click();
  const rebuildConfirmation = page.getByRole('button', { name:/Confirm this exact gesture/i });
  await rebuildConfirmation.waitFor({ state:'visible', timeout:45_000 });
  await rebuildConfirmation.click();
  await waitForText(page, '#testReceipt', /"test_digest"/, 45_000);`;

const saveTarget = `  await page.locator('#makeSave').click();
  await waitForText(page, '#saveStatus', /sealed locally/);`;
const saveReplacement = `  await page.locator('#makeSave').click();
  const saveConfirmation = page.getByRole('button', { name:/Confirm this exact gesture/i });
  await saveConfirmation.waitFor({ state:'visible', timeout:45_000 });
  await saveConfirmation.click();
  await waitForText(page, '#saveStatus', /sealed locally/);`;

const childLaunchDefinitionsTarget = `const launchTarget = \`  await page.locator('#startDemo').click();
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Glasshouse Archive inquiry/);\`;
const launchReplacement = \`  await page.waitForFunction(() => window.__td613AshDemoRegistry?.version === 'td613.ash.demo-registry/v0.1-a13'
    && window.__td613AshDemoRegistry?.snapshot?.().control_owner === 'ASH_DEMO_REGISTRY'
    && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
    && document.getElementById('newProfile')?.value === ''
    && document.getElementById('startDemo')?.dataset.ashMethodDemoState === 'HELD', null, { timeout:60000 });
  await page.evaluate(() => {
    const select = document.getElementById('newProfile');
    select.value = 'investigation';
    select.dispatchEvent(new Event('change', { bubbles:true }));
    window.__td613AshDemoRegistry.reconcile();
  });
  await page.waitForFunction(() => {
    const button = document.getElementById('startDemo');
    return document.getElementById('newProfile')?.value === 'investigation'
      && button?.dataset.ashDemoRegistryOwner === 'td613.ash.demo-registry/v0.1-a13'
      && button?.dataset.ashMethodDemoState === 'READY'
      && button.disabled === false;
  }, null, { timeout:60000 });
  await page.locator('#startDemo').click();
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Glasshouse Archive inquiry/);\`;`;

const childLaunchDefinitionsReplacement = `const launchTarget = \`  await page.waitForFunction(() => Boolean(window.__td613AshProfileDemos?.version));
  await page.locator('#newProfile').selectOption('political_campaign');
  assert(await page.locator('#startDemo').isEnabled(), 'Political Campaign demo did not become available.');
  await page.locator('#startDemo').click();
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Harbor City Mayoral Campaign/);\`;
const launchReplacement = \`  await page.waitForFunction(() => window.__td613AshDemoRegistry?.version === 'td613.ash.demo-registry/v0.1-a13'
    && window.__td613AshDemoRegistry?.snapshot?.().control_owner === 'ASH_DEMO_REGISTRY'
    && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
    && document.getElementById('newProfile')?.value === ''
    && document.getElementById('startDemo')?.dataset.ashMethodDemoState === 'HELD', null, { timeout:60000 });
  await page.evaluate(() => {
    const select = document.getElementById('newProfile');
    select.value = 'political_campaign';
    select.dispatchEvent(new Event('change', { bubbles:true }));
    window.__td613AshDemoRegistry.reconcile();
  });
  await page.waitForFunction(() => {
    const button = document.getElementById('startDemo');
    return document.getElementById('newProfile')?.value === 'political_campaign'
      && window.__td613AshDemoRegistry?.snapshot?.().control_owner === 'ASH_DEMO_REGISTRY'
      && button?.dataset.ashDemoRegistryOwner === 'td613.ash.demo-registry/v0.1-a13'
      && button?.dataset.ashMethodDemoState === 'READY'
      && button.disabled === false;
  }, null, { timeout:60000 });
  await page.locator('#startDemo').click();
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Harbor City Mayoral Campaign/);\`;`;

const childReloadDefinitionsTarget = `const reloadTarget = \`  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Glasshouse Archive inquiry/);\`;
const reloadReplacement = \`  await page.reload({ waitUntil: 'domcontentloaded', timeout:90000 });
  await page.waitForFunction(id => window.__td613AshDemoRegistry?.version === 'td613.ash.demo-registry/v0.1-a13'
    && window.__td613AshDemoRegistry?.snapshot?.().control_owner === 'ASH_DEMO_REGISTRY'
    && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
    && localStorage.getItem('td613.ash-keep.current-case') === id
    && document.getElementById('launch')?.classList.contains('hidden')
    && /Glasshouse Archive inquiry/.test(document.getElementById('caseTitle')?.textContent || ''), caseId, { timeout:60000 });
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Glasshouse Archive inquiry/);\`;`;

const childReloadDefinitionsReplacement = `const reloadTarget = \`  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Harbor City Mayoral Campaign/);\`;
const reloadReplacement = \`  await page.reload({ waitUntil: 'domcontentloaded', timeout:90000 });
  await page.waitForFunction(id => window.__td613AshDemoRegistry?.version === 'td613.ash.demo-registry/v0.1-a13'
    && window.__td613AshDemoRegistry?.snapshot?.().control_owner === 'ASH_DEMO_REGISTRY'
    && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
    && localStorage.getItem('td613.ash-keep.current-case') === id
    && document.getElementById('launch')?.classList.contains('hidden')
    && /Harbor City Mayoral Campaign/.test(document.getElementById('caseTitle')?.textContent || ''), caseId, { timeout:60000 });
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Harbor City Mayoral Campaign/);\`;`;

let probeSource = (await fs.readFile(sourcePath, 'utf8')).replace(/\r\n/g, '\n');
if (!probeSource.includes('ASH_AIA3_LEGACY_BYPASS_STABLE')
  || !probeSource.includes("selectOption('political_campaign')")
  || !probeSource.includes('entries.length === 7')) {
  throw new Error('A1 closure adapter received the probe before its governed profile, premium, and cache fixtures completed.');
}
probeSource = replaceExactlyOnce(probeSource, keepUrlTarget, keepUrlReplacement, 'canonical threshold URL');
probeSource = replaceExactlyOnce(probeSource, arrivalTarget, arrivalReplacement, 'post-fixture canonical first-paint observation');
probeSource = replaceExactlyOnce(probeSource, rebuildTarget, rebuildReplacement, 'governed Rebuild confirmation');
probeSource = replaceExactlyOnce(probeSource, saveTarget, saveReplacement, 'governed Save Point confirmation');

let runnerSource = (await fs.readFile(runnerPath, 'utf8')).replace(/\r\n/g, '\n');
runnerSource = replaceExactlyOnce(
  runnerSource,
  "const repoRoot = path.resolve(here, '..');",
  "const repoRoot = path.resolve(process.env.TD613_PROBE_REPO_ROOT || path.resolve(here, '..'));",
  'runtime repository root'
);
runnerSource = replaceExactlyOnce(
  runnerSource,
  "const sourcePath = path.join(here, 'ash-keep-production-probe.mjs');",
  "const sourcePath = path.resolve(process.env.TD613_PROBE_SOURCE_PATH || path.join(here, 'ash-keep-production-probe.mjs'));",
  'runtime source path'
);
runnerSource = replaceExactlyOnce(runnerSource, childLaunchDefinitionsTarget, childLaunchDefinitionsReplacement, 'profile-prepared campaign launch compiler');
runnerSource = replaceExactlyOnce(runnerSource, childReloadDefinitionsTarget, childReloadDefinitionsReplacement, 'profile-prepared campaign reload compiler');
runnerSource = replaceExactlyOnce(runnerSource, "select.value = 'investigation'", "select.value = 'political_campaign'", 'campaign runtime validation');
runnerSource = replaceExactlyOnce(
  runnerSource,
  'WAIT_FOR_A13_REGISTRY_AND_SELECT_INVESTIGATION_BEFORE_DEMO_LAUNCH',
  'WAIT_FOR_A13_REGISTRY_AND_SELECT_POLITICAL_CAMPAIGN_BEFORE_DEMO_LAUNCH',
  'campaign runtime manifest label'
);

await fs.mkdir(runtimeDir, { recursive:true });
await fs.writeFile(a1SourcePath, probeSource, 'utf8');
await fs.writeFile(a1RunnerPath, runnerSource, 'utf8');
await fs.writeFile(adapterManifestPath, `${JSON.stringify({
  schema:'td613.ash.a1-production-probe-adapter/v0.6-profile-prepared-registry-owner',
  source_probe:path.relative(repoRoot, sourcePath),
  adapted_probe:path.relative(repoRoot, a1SourcePath),
  adapted_runner:path.relative(repoRoot, a1RunnerPath),
  input_posture:'PROFILE_PREMIUM_CACHE_FIXTURES_COMPLETE',
  profile:'political_campaign',
  expected_route_count_after_successor:7,
  registry_owner:'ASH_DEMO_REGISTRY',
  canonical_url:'/dome-world/ash-threshold.html',
  canonical_title:'TD613 Ash',
  visible_epoch_query:false,
  network_idle_required:false,
  readiness_source:'MODULE_GRAPH_PREFLIGHT_AND_A13_REGISTRY_OWNER',
  rebuild_confirmation:'EXPLICIT_NAMED_HUMAN_GESTURE_OBSERVED',
  save_point_confirmation:'EXPLICIT_NAMED_HUMAN_GESTURE_OBSERVED',
  product_source_mutated:false,
  runtime_copy_ephemeral:true,
  promotion_authorized:false
}, null, 2)}\n`);

const child = spawn(process.execPath, [a1RunnerPath], {
  cwd: repoRoot,
  env: {
    ...process.env,
    TD613_PROBE_REPO_ROOT: repoRoot,
    TD613_PROBE_SOURCE_PATH: a1SourcePath,
    TD613_PROBE_RUNTIME_DIR: runtimeDir
  },
  stdio: 'inherit'
});

const exitCode = await new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('exit', code => resolve(code ?? 1));
});
if (exitCode !== 0) process.exit(exitCode);
