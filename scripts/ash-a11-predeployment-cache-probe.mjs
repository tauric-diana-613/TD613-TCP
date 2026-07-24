import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = process.env.TD613_BROWSER || 'chromium';
const baseUrl = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-a11-predeployment-cache';
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new Error(`Unsupported browser ${browserName}`);

const A2_A5_EPOCH = 'td613.ash.cache-flush/2026-07-23-a2-a5-release-v1';
const A11_EPOCH = 'td613.ash.cache-flush/2026-07-24-a11-predeployment-v1';
const A11_ASSET_EPOCH = '20260724-a11-predeployment-v1';
const POINTER_KEY = 'td613.ash-keep.current-case';
const SESSION_KEY = 'td613.ash.session.epoch';
const MODULE_MARKER_KEY = 'td613.ash.cache-flush.aia3.epoch';
const PREFLIGHT_MARKER_KEY = 'td613.ash.cache-preflight.epoch';
const STALE_CACHE = `td613-a10-stale-${browserName}`;

await fs.mkdir(artifactDir, { recursive:true });
const browser = await browserType.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:1280, height:920 } });
const page = await context.newPage();
const consoleErrors = [];
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => consoleErrors.push(String(error?.stack || error)));

async function createNativeBlankCase() {
  await page.goto(`${baseUrl}/dome-world/ash-threshold.html?presentation=legacy`, { waitUntil:'domcontentloaded', timeout:90_000 });
  await page.waitForFunction(() => document.title === 'TD613 Ash'
    && location.pathname === '/dome-world/ash-threshold.html'
    && location.search === ''
    && document.documentElement.dataset.ashModuleGraph === 'ready'
    && document.getElementById('newProfile')
    && document.getElementById('newTitle')
    && document.getElementById('newCase'), null, { timeout:120_000 });
  await page.locator('#newProfile').selectOption('investigation');
  await page.locator('#newTitle').fill(`A11 predeployment custody witness ${browserName}`);
  await page.locator('#newCase').click();
  await page.waitForFunction(pointerKey => {
    const pointer = localStorage.getItem(pointerKey);
    const current = window.__td613AshKeep?.current?.();
    return Boolean(pointer && current?.case_id === pointer);
  }, POINTER_KEY, { timeout:120_000 });
  const seeded = await page.evaluate(({ pointerKey, sessionKey }) => ({
    pointer:localStorage.getItem(pointerKey),
    session_epoch:localStorage.getItem(sessionKey),
    current:window.__td613AshKeep?.current?.() || null
  }), { pointerKey:POINTER_KEY, sessionKey:SESSION_KEY });
  if (!seeded.current?.case_map_digest) throw new Error('Native blank case did not expose a persisted Case Map digest.');
  if (!seeded.session_epoch) throw new Error('Native blank case did not establish a session epoch.');
  return seeded;
}

async function seedStaleDelivery() {
  return page.evaluate(async ({ a2a5, moduleKey, preflightKey, staleCache }) => {
    localStorage.setItem(moduleKey, a2a5);
    localStorage.setItem(preflightKey, a2a5);
    const cache = await caches.open(staleCache);
    await cache.put('/dome-world/a10-stale-witness', new Response('stale-a10'));
    return { cache_names:await caches.keys() };
  }, { a2a5:A2_A5_EPOCH, moduleKey:MODULE_MARKER_KEY, preflightKey:PREFLIGHT_MARKER_KEY, staleCache:STALE_CACHE });
}

async function observe(label) {
  await page.waitForFunction(expected => {
    const receipt = window.__td613AshAia3PreflightReceipt;
    return receipt?.epoch === expected
      && receipt?.asset_epoch === '20260724-a11-predeployment-v1'
      && document.documentElement.dataset.ashModuleGraph === 'ready'
      && location.pathname === '/dome-world/ash-threshold.html'
      && location.search === '';
  }, A11_EPOCH, { timeout:150_000 });
  const observation = await page.evaluate(async ({ pointerKey, sessionKey, moduleKey, preflightKey, staleCache }) => {
    const cacheNames = globalThis.caches?.keys ? await caches.keys() : [];
    return {
      title:document.title,
      url:location.pathname + location.search,
      preflight:window.__td613AshAia3PreflightReceipt || null,
      module:window.__td613AshAia3CacheTransition || null,
      pointer:localStorage.getItem(pointerKey),
      session_epoch:localStorage.getItem(sessionKey),
      current:window.__td613AshKeep?.current?.() || null,
      module_marker:localStorage.getItem(moduleKey),
      preflight_marker:localStorage.getItem(preflightKey),
      cache_names:cacheNames,
      stale_cache_present:cacheNames.includes(staleCache),
      module_graph:document.documentElement.dataset.ashModuleGraph || null,
      cache_preflight:document.documentElement.dataset.ashCachePreflight || null,
      session_open:document.documentElement.dataset.ashSessionOpen || null
    };
  }, { pointerKey:POINTER_KEY, sessionKey:SESSION_KEY, moduleKey:MODULE_MARKER_KEY, preflightKey:PREFLIGHT_MARKER_KEY, staleCache:STALE_CACHE });
  await fs.writeFile(path.join(artifactDir, `${browserName}-${label}.json`), JSON.stringify(observation, null, 2));
  return observation;
}

let report;
try {
  const seeded = await createNativeBlankCase();
  consoleErrors.length = 0;
  await seedStaleDelivery();

  await page.goto(`${baseUrl}/dome-world/ash-threshold.html`, { waitUntil:'domcontentloaded', timeout:120_000 });
  const first = await observe('first-eviction');
  if (first.preflight?.performed !== true) throw new Error(`First A11 preflight did not perform eviction: ${JSON.stringify(first.preflight)}`);
  if (first.preflight?.indexeddb_preserved !== true || first.preflight?.case_data_preserved !== true) throw new Error('First A11 preflight did not preserve custody substrate.');
  if (first.preflight?.local_case_pointer_preserved !== true || first.pointer !== seeded.pointer) throw new Error('A11 preflight changed the active case pointer.');
  if (first.preflight?.session_epoch_preserved_or_migrated !== true || first.session_epoch !== seeded.session_epoch) throw new Error('A11 preflight did not preserve the session epoch.');
  if (first.current?.case_id !== seeded.pointer) throw new Error('Ash did not reopen the native blank case after A11 preflight.');
  if (first.current?.case_map_digest !== seeded.current.case_map_digest) throw new Error('A11 preflight did not rehydrate the same persisted Case Map digest.');
  if (first.module_marker !== A11_EPOCH || first.preflight_marker !== A11_EPOCH) throw new Error('A11 preflight markers did not converge.');
  if (first.stale_cache_present) throw new Error('Stale A10 Cache Storage survived A11 preflight.');
  if (first.url !== '/dome-world/ash-threshold.html') throw new Error(`A11 preflight exposed a transition URL: ${first.url}`);

  await page.reload({ waitUntil:'domcontentloaded', timeout:120_000 });
  const second = await observe('idempotent-return');
  if (second.pointer !== seeded.pointer || second.current?.case_id !== seeded.pointer) throw new Error('Idempotent A11 return changed the active case.');
  if (second.session_epoch !== seeded.session_epoch) throw new Error('Idempotent A11 return changed the session epoch.');
  if (second.current?.case_map_digest !== seeded.current.case_map_digest) throw new Error('Idempotent A11 return did not rehydrate the same persisted Case Map digest.');
  if (second.module?.performed !== false || second.module?.a11_predeployment_preflight_current !== true) throw new Error(`A11 module did not recognize the current preflight epoch: ${JSON.stringify(second.module)}`);
  if (second.stale_cache_present) throw new Error('Stale A10 cache reappeared after idempotent return.');
  if (consoleErrors.length) throw new Error(`Cache-assay console errors observed: ${consoleErrors.join(' | ')}`);

  report = {
    ok:true,
    schema:'td613.ash.a11-predeployment-cache-browser-receipt/v0.4-native-rehydration',
    browser:browserName,
    a11_epoch:A11_EPOCH,
    a11_asset_epoch:A11_ASSET_EPOCH,
    seeded,
    first,
    second,
    console_errors:consoleErrors,
    indexeddb_preserved:true,
    case_pointer_preserved:true,
    session_epoch_preserved:true,
    stale_a10_cache_evicted:true,
    second_mass_eviction:false,
    a11_interface_present:false,
    human_closure_required:true
  };
  await fs.writeFile(path.join(artifactDir, `${browserName}-receipt.json`), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const failure = {
    ok:false,
    schema:'td613.ash.a11-predeployment-cache-browser-failure/v0.4-native-rehydration',
    browser:browserName,
    error:String(error?.stack || error),
    console_errors:consoleErrors,
    url:page.url()
  };
  await fs.writeFile(path.join(artifactDir, `${browserName}-failure.json`), JSON.stringify(failure, null, 2));
  await page.screenshot({ path:path.join(artifactDir, `${browserName}-failure.png`), fullPage:true }).catch(() => {});
  throw error;
} finally {
  await Promise.race([browser.close(), new Promise(resolve => setTimeout(resolve, 15_000))]);
}
