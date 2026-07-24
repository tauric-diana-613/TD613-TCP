import fs from 'node:fs/promises';
import path from 'node:path';
import { firefox } from 'playwright';

const baseUrl = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-a11-predeployment-firefox';
const A2_A5_EPOCH = 'td613.ash.cache-flush/2026-07-23-a2-a5-release-v1';
const A11_EPOCH = 'td613.ash.cache-flush/2026-07-24-a11-predeployment-v1';
const A11_ASSET_EPOCH = '20260724-a11-predeployment-v1';
const SESSION_EPOCH = '20260718-canonical-membrane-v6';
const POINTER_KEY = 'td613.ash-keep.current-case';
const SESSION_KEY = 'td613.ash.session.epoch';
const MODULE_MARKER_KEY = 'td613.ash.cache-flush.aia3.epoch';
const PREFLIGHT_MARKER_KEY = 'td613.ash.cache-preflight.epoch';
const STALE_CACHE = 'td613-a10-stale-firefox-boundary';
const DB_NAME = 'td613-a11-firefox-preflight-witness';
const STORE_NAME = 'records';
const RECORD_ID = 'case_firefox_preflight_boundary';
const RECORD_DIGEST = `sha256:${'f'.repeat(64)}`;

await fs.mkdir(artifactDir, { recursive:true });
const browser = await firefox.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:1280, height:920 } });
const page = await context.newPage();
const phaseTrace = [];

async function mark(phase, state, detail = null) {
  phaseTrace.push({ phase, state, detail, observed_at:new Date().toISOString() });
  await fs.writeFile(path.join(artifactDir, 'firefox-phase-trace.json'), JSON.stringify({
    schema:'td613.ash.a11-predeployment-firefox-phase-trace/v0.1',
    phases:phaseTrace
  }, null, 2));
}

async function phase(name, work, timeoutMs) {
  await mark(name, 'STARTED');
  let timer;
  try {
    const result = await Promise.race([
      Promise.resolve().then(work),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${name} exceeded ${timeoutMs}ms`)), timeoutMs); })
    ]);
    await mark(name, 'COMPLETED');
    return result;
  } catch (error) {
    await mark(name, 'FAILED', String(error?.message || error));
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function seedBoundaryFixture() {
  await page.goto(`${baseUrl}/dome-world/index.html`, { waitUntil:'domcontentloaded', timeout:60_000 });
  return page.evaluate(async ({ dbName, storeName, recordId, recordDigest, pointerKey, sessionKey, moduleKey, preflightKey, a2a5, sessionEpoch, staleCache }) => {
    const record = { id:recordId, case_id:recordId, case_map_digest:recordDigest, source_status:'SYNTHETIC_BROWSER_WITNESS' };
    await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(storeName, { keyPath:'id' });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(storeName, 'readwrite');
        transaction.objectStore(storeName).put(record);
        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => { db.close(); resolve(); };
      };
    });
    localStorage.setItem(pointerKey, recordId);
    localStorage.setItem(sessionKey, sessionEpoch);
    localStorage.setItem(moduleKey, a2a5);
    localStorage.setItem(preflightKey, a2a5);
    const cache = await caches.open(staleCache);
    await cache.put(new URL('/dome-world/a10-stale-firefox-boundary', location.href), new Response('stale-a10'));
    return { record, cache_names:await caches.keys() };
  }, {
    dbName:DB_NAME,
    storeName:STORE_NAME,
    recordId:RECORD_ID,
    recordDigest:RECORD_DIGEST,
    pointerKey:POINTER_KEY,
    sessionKey:SESSION_KEY,
    moduleKey:MODULE_MARKER_KEY,
    preflightKey:PREFLIGHT_MARKER_KEY,
    a2a5:A2_A5_EPOCH,
    sessionEpoch:SESSION_EPOCH,
    staleCache:STALE_CACHE
  });
}

async function observe(label) {
  await page.waitForFunction(expected => window.__td613AshAia3PreflightReceipt?.epoch === expected
    && location.pathname === '/dome-world/ash-threshold.html'
    && location.search === '', A11_EPOCH, { timeout:90_000 });
  const observation = await page.evaluate(async ({ dbName, storeName, recordId, pointerKey, sessionKey, moduleKey, preflightKey, staleCache }) => {
    const record = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(storeName, 'readonly');
        const get = transaction.objectStore(storeName).get(recordId);
        get.onerror = () => reject(get.error);
        get.onsuccess = () => { const value = get.result || null; db.close(); resolve(value); };
      };
    });
    const cacheNames = await caches.keys();
    return {
      receipt:window.__td613AshAia3PreflightReceipt || null,
      pointer:localStorage.getItem(pointerKey),
      session_epoch:localStorage.getItem(sessionKey),
      module_marker:localStorage.getItem(moduleKey),
      preflight_marker:localStorage.getItem(preflightKey),
      record,
      cache_names:cacheNames,
      stale_cache_present:cacheNames.includes(staleCache),
      url:location.pathname + location.search
    };
  }, {
    dbName:DB_NAME,
    storeName:STORE_NAME,
    recordId:RECORD_ID,
    pointerKey:POINTER_KEY,
    sessionKey:SESSION_KEY,
    moduleKey:MODULE_MARKER_KEY,
    preflightKey:PREFLIGHT_MARKER_KEY,
    staleCache:STALE_CACHE
  });
  await fs.writeFile(path.join(artifactDir, `firefox-${label}.json`), JSON.stringify(observation, null, 2));
  return observation;
}

try {
  const seeded = await phase('SEED_BOUNDARY_FIXTURE', seedBoundaryFixture, 60_000);
  await page.route('**/dome-world/ash-keep.js*', route => route.abort('blockedbyclient'));

  const first = await phase('FIRST_PREFLIGHT_EVICTION', async () => {
    await page.goto(`${baseUrl}/dome-world/ash-threshold.html`, { waitUntil:'domcontentloaded', timeout:60_000 });
    return observe('first-eviction');
  }, 120_000);
  if (first.receipt?.performed !== true) throw new Error(`Firefox first preflight did not perform eviction: ${JSON.stringify(first.receipt)}`);
  if (first.receipt?.indexeddb_preserved !== true || first.receipt?.case_data_preserved !== true) throw new Error('Firefox preflight did not preserve the custody substrate.');
  if (first.receipt?.local_case_pointer_preserved !== true || first.pointer !== RECORD_ID) throw new Error('Firefox preflight changed the local pointer at the boundary.');
  if (first.receipt?.session_epoch_preserved_or_migrated !== true || first.session_epoch !== SESSION_EPOCH) throw new Error('Firefox preflight changed the session epoch at the boundary.');
  if (first.record?.case_map_digest !== seeded.record.case_map_digest) throw new Error('Firefox preflight changed the IndexedDB witness record.');
  if (first.module_marker !== A11_EPOCH || first.preflight_marker !== A11_EPOCH) throw new Error('Firefox preflight markers did not converge.');
  if (first.stale_cache_present) throw new Error('Firefox stale A10 cache survived the preflight boundary.');

  const second = await phase('IDEMPOTENT_PREFLIGHT_RETURN', async () => {
    await page.reload({ waitUntil:'domcontentloaded', timeout:60_000 });
    return observe('idempotent-return');
  }, 120_000);
  if (second.receipt?.performed !== false) throw new Error(`Firefox idempotent return repeated eviction: ${JSON.stringify(second.receipt)}`);
  if (second.pointer !== RECORD_ID || second.session_epoch !== SESSION_EPOCH) throw new Error('Firefox idempotent return changed pointer or session epoch.');
  if (second.record?.case_map_digest !== RECORD_DIGEST) throw new Error('Firefox idempotent return changed the IndexedDB witness record.');
  if (second.stale_cache_present) throw new Error('Firefox stale A10 cache reappeared.');

  const report = {
    ok:true,
    schema:'td613.ash.a11-predeployment-firefox-boundary-receipt/v0.1',
    browser:'firefox',
    a11_epoch:A11_EPOCH,
    a11_asset_epoch:A11_ASSET_EPOCH,
    first,
    second,
    phase_trace:phaseTrace,
    indexeddb_preserved:true,
    case_pointer_preserved:true,
    session_epoch_preserved:true,
    stale_a10_cache_evicted:true,
    second_mass_eviction:false,
    broad_firefox_runtime_witness_separate:true,
    a11_interface_present:false,
    human_closure_required:true
  };
  await fs.writeFile(path.join(artifactDir, 'firefox-receipt.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const failure = {
    ok:false,
    schema:'td613.ash.a11-predeployment-firefox-boundary-failure/v0.1',
    error:String(error?.stack || error),
    phase_trace:phaseTrace,
    url:page.url()
  };
  await fs.writeFile(path.join(artifactDir, 'firefox-failure.json'), JSON.stringify(failure, null, 2));
  await page.screenshot({ path:path.join(artifactDir, 'firefox-failure.png'), fullPage:true }).catch(() => {});
  throw error;
} finally {
  await Promise.race([browser.close(), new Promise(resolve => setTimeout(resolve, 15_000))]);
}
