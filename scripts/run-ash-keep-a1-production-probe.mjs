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

function replaceExactlyOnce(source, target, replacement, label) {
  const count = source.split(target).length - 1;
  if (count !== 1) throw new Error(`A1 closure adapter requires exactly one ${label} seam; observed ${count}.`);
  return source.replace(target, replacement);
}

const keepUrlTarget = "const keepUrl = `${base}/dome-world/ash-keep.html?presentation=legacy`;";
const keepUrlReplacement = "const keepUrl = `${base}/dome-world/ash-threshold.html`;";

const localKeysTarget = `const ALLOWED_LOCAL_KEYS = new Set([
  'td613.ash-keep.current-case',
  'td613.ash-keep.preferences',
  'td613.ash.cache-flush.epoch'
]);`;
const localKeysReplacement = `const ALLOWED_LOCAL_KEYS = new Set([
  'td613.ash-keep.current-case',
  'td613.ash-keep.preferences',
  'td613.ash.cache-flush.epoch',
  'td613.ash.cache-flush.aia3.epoch',
  'td613.ash.cache-preflight.epoch',
  'td613.ash.session.epoch'
]);`;

const arrivalTarget = `  await page.goto(keepUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  // ASH_CACHE_EPOCH_STABLE: the one-time eviction may navigate after first paint.
  await page.waitForURL(url => url.searchParams.has('ash_flush'), { timeout: 60_000 });
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => {
    const epoch = localStorage.getItem('td613.ash.cache-flush.epoch');
    const url = new URL(location.href);
    return Boolean(epoch)
      && url.searchParams.get('ash_flush') === epoch
      && window.__td613AshCacheTransition?.epoch === epoch;
  }, { timeout: 60_000 });
  await page.locator('h1').waitFor({ state: 'visible' });
  assert((await page.title()).includes('TD613 Ash Keep'), 'Ash Keep title was not observed');
  assert(await page.locator('#launch').isVisible(), 'Clean profile did not begin at the explicit launch gate');

  const cleanDb = await databaseSnapshot(page);
  const cleanCount = Object.values(cleanDb).reduce((total, rows) => total + rows.length, 0);
  const cleanKeys = await page.evaluate(() => Object.keys(localStorage));
  const initialNonGet = requests.filter(request => request.method !== 'GET' && request.method !== 'HEAD');
  assert(cleanCount === 0, 'Clean arrival created case records before operator action');
  assert(cleanKeys.length === 0, 'Clean arrival wrote localStorage before operator action');
  assert(initialNonGet.length === 0, 'Clean arrival emitted a non-read network request');
  report.clean_arrival = {
    launch_visible: true,
    indexeddb_record_count: cleanCount,
    local_storage_keys: cleanKeys,
    non_read_requests: initialNonGet
  };`;

const arrivalReplacement = `  await page.goto(keepUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForFunction(() => document.documentElement.dataset.ashModuleGraph === 'ready'
    && document.documentElement.dataset.ashCachePreflight === 'complete'
    && window.__td613AshAia3PreflightReceipt
    && window.__td613AshFirstPaintWitness, { timeout: 60_000 });
  await page.waitForLoadState('networkidle');
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
  const cleanKeys = await page.evaluate(() => Object.keys(localStorage));
  const cleanValues = await page.evaluate(() => Object.values(localStorage).join('\\n'));
  const initialNonGet = requests.filter(request => request.method !== 'GET' && request.method !== 'HEAD');
  assert(cleanCount === 0, 'Clean arrival created case records before operator action');
  assert(cleanKeys.every(key => ALLOWED_LOCAL_KEYS.has(key)), 'Clean arrival wrote an ungoverned localStorage key');
  assert(!cleanKeys.includes('td613.ash-keep.current-case'), 'Clean arrival bound a case before operator action');
  assert(!cleanValues.includes('Glasshouse Archive inquiry') && !cleanValues.includes('node_archive'), 'Clean arrival stored case material in delivery markers');
  assert(initialNonGet.length === 0, 'Clean arrival emitted a non-read network request');
  report.clean_arrival = {
    launch_visible: true,
    canonical_title: arrival.title,
    canonical_url: arrival.url,
    first_paint: arrival.first_paint,
    preflight_performed: Boolean(arrival.preflight?.performed),
    indexeddb_record_count: cleanCount,
    local_storage_keys: cleanKeys,
    non_read_requests: initialNonGet
  };`;

const profileTarget = "  await page.locator('#startDemo').click();";
const profileReplacement = `  await page.locator('#newProfile').selectOption('investigation');
  assert(!(await page.locator('#startDemo').isDisabled()), 'Explicit Investigation profile choice did not enable Start Demo');
  await page.locator('#startDemo').click();`;

let probeSource = (await fs.readFile(sourcePath, 'utf8')).replace(/\r\n/g, '\n');
probeSource = replaceExactlyOnce(probeSource, keepUrlTarget, keepUrlReplacement, 'canonical threshold URL');
probeSource = replaceExactlyOnce(probeSource, localKeysTarget, localKeysReplacement, 'delivery-marker allowlist');
probeSource = replaceExactlyOnce(probeSource, arrivalTarget, arrivalReplacement, 'canonical first-paint observation');
probeSource = replaceExactlyOnce(probeSource, profileTarget, profileReplacement, 'explicit profile selection');

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

await fs.mkdir(runtimeDir, { recursive:true });
await fs.writeFile(a1SourcePath, probeSource, 'utf8');
await fs.writeFile(a1RunnerPath, runnerSource, 'utf8');

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
