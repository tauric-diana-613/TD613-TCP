import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-case-close-diagnostic');
const pointerKey = 'td613.ash-keep.current-case';

await fs.mkdir(out, { recursive:true });
const browser = await chromium.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:1280, height:900 }, reducedMotion:'reduce' });
const page = await context.newPage();
page.setDefaultTimeout(60_000);
const consoleErrors = [];
page.on('pageerror', error => consoleErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });

async function openDbSnapshot() {
  return page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('td613-ash-keep');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const output = {};
    for (const name of [...db.objectStoreNames]) {
      output[name] = await new Promise((resolve, reject) => {
        const request = db.transaction(name).objectStore(name).getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    }
    db.close();
    return output;
  });
}

async function fingerprints() {
  return page.evaluate(async () => {
    const unwrap = record => record?.value ?? record;
    const canonicalize = value => {
      if (Array.isArray(value)) return value.map(canonicalize);
      if (!value || typeof value !== 'object') return value;
      return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]));
    };
    const hash = async value => {
      const bytes = new TextEncoder().encode(JSON.stringify(canonicalize(value)));
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      return `sha256:${[...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
    };
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('td613-ash-keep');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const all = name => new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(name)) return resolve([]);
      const request = db.transaction(name).objectStore(name).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    const get = (name, key) => new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(name)) return resolve(null);
      const request = db.transaction(name).objectStore(name).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    const savedRows = await all('savedCases');
    const cases = await all('cases');
    const storeNames = ['tests','drafts','reviews','releases','savePoints','unexpectedDetails'];
    const stores = Object.fromEntries(await Promise.all(storeNames.map(async name => [name, await all(name)])));
    const results = [];
    for (const caseMap of cases) {
      const caseId = caseMap?.case_id;
      if (!caseId) continue;
      const drafts = stores.drafts.map(unwrap).filter(item => item?.case_id === caseId);
      const draftIds = new Set(drafts.map(item => item.draft_id));
      const bundle = {
        caseMap,
        roomRules: unwrap(await get('roomRules', caseId)),
        routeMemory: unwrap(await get('routeMemory', caseId)),
        tests: stores.tests.map(unwrap).filter(item => item?.case_id === caseId),
        drafts,
        reviews: stores.reviews.map(unwrap).filter(item => draftIds.has(item?.draft_id)),
        releases: stores.releases.map(unwrap).filter(item => item?.case_id === caseId),
        savePoints: stores.savePoints.map(unwrap).filter(item => item?.case_id === caseId),
        unexpectedDetails: stores.unexpectedDetails.map(unwrap).filter(item => item?.case_id === caseId),
        notes: unwrap(await get('notes', caseId))
      };
      const saved = savedRows.find(row => row.id === caseId)?.value || null;
      const current = await hash(bundle);
      results.push({ case_id:caseId, title:caseMap.title, current_fingerprint:current, saved_fingerprint:saved?.fingerprint || null, matches:current === saved?.fingerprint, saved_record:saved });
    }
    db.close();
    return results;
  });
}

async function startPolitical(previous = null) {
  await page.locator('#newProfile').selectOption('political_campaign');
  await page.waitForFunction(() => document.getElementById('newProfile')?.value === 'political_campaign'
    && !document.getElementById('startDemo')?.disabled
    && /Political Campaign/.test(document.getElementById('startDemo')?.textContent || ''));
  await page.locator('#startDemo').click();
  await page.waitForFunction(prior => {
    const current = localStorage.getItem('td613.ash-keep.current-case');
    return Boolean(current && current !== prior)
      && /Harbor City Mayoral Campaign/i.test(document.getElementById('caseTitle')?.textContent || '');
  }, previous);
  return page.evaluate(key => localStorage.getItem(key), pointerKey);
}

async function saveAndClose(caseId, label) {
  await page.locator('#saveCase').click();
  await page.waitForFunction(async id => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('td613-ash-keep');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const row = await new Promise((resolve, reject) => {
        const request = db.transaction('savedCases').objectStore('savedCases').get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
      return Boolean(row?.value?.fingerprint);
    } finally { db.close(); }
  }, caseId);
  const beforeClose = await fingerprints();
  await page.locator('#closeCase').click();
  await page.locator('#launch').waitFor({ state:'visible' });
  await page.waitForTimeout(2500);
  const afterClose = await fingerprints();
  return { label, case_id:caseId, before_close:beforeClose.find(item => item.case_id === caseId), after_close:afterClose.find(item => item.case_id === caseId) };
}

const report = { schema:'td613.ash.case-close-diagnostic/v0.1', status:'RUNNING', console_errors:consoleErrors, cases:[], final:null };
try {
  await page.goto(`${base}/dome-world/ash-threshold.html`, { waitUntil:'domcontentloaded' });
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await new Promise(resolve => {
      const request = indexedDB.deleteDatabase('td613-ash-keep');
      request.onsuccess = request.onerror = request.onblocked = () => resolve();
    });
  });
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.ashModuleGraph === 'ready'
    && window.__td613AshProfileDemos?.profiles?.includes('political_campaign')
    && window.__td613AshCaseControls?.version
    && window.__td613AshCaseCloseRepair?.version);

  const first = await startPolitical();
  report.cases.push(await saveAndClose(first, 'first'));
  const second = await startPolitical(first);
  report.cases.push(await saveAndClose(second, 'second'));

  report.final = await page.evaluate(() => {
    const select = document.getElementById('selectCase');
    return {
      url:location.pathname + location.search,
      pointer:localStorage.getItem('td613.ash-keep.current-case'),
      case_controls_version:window.__td613AshCaseControls?.version || null,
      case_controls_state:window.__td613AshCaseControls?.current?.() || null,
      close_repair_version:window.__td613AshCaseCloseRepair?.version || null,
      close_fingerprint_posture:document.documentElement.dataset.ashCloseFingerprintPosture || null,
      session_open:document.documentElement.dataset.ashSessionOpen || null,
      launch_visible:!document.getElementById('launch')?.classList.contains('hidden'),
      selector:select ? {
        connected:select.isConnected,
        disabled:select.disabled,
        value:select.value,
        case_list_state:select.dataset.caseListState || null,
        options:[...select.options].map(option => ({ value:option.value, label:option.textContent, disabled:option.disabled, selected:option.selected }))
      } : null
    };
  });
  report.final.fingerprints = await fingerprints();
  report.final.indexeddb = await openDbSnapshot();
  report.status = 'OBSERVED';
  await page.screenshot({ path:path.join(out, 'ash-case-close-diagnostic.png'), fullPage:true });
} catch (error) {
  report.status = 'HOLD';
  report.error = { message:error.message, stack:error.stack };
  try { report.final = { fingerprints:await fingerprints(), indexeddb:await openDbSnapshot() }; } catch {}
  try { await page.screenshot({ path:path.join(out, 'ash-case-close-diagnostic-held.png'), fullPage:true }); } catch {}
} finally {
  await fs.writeFile(path.join(out, 'ash-case-close-diagnostic.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}

console.log(`ash-case-close-diagnostic.mjs ${report.status}`);
