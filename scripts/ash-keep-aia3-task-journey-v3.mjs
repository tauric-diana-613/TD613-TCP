import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const browserName = String(process.env.TD613_BROWSER || 'chromium');
const browserType = { chromium, firefox, webkit }[browserName];
const outputDir = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-aia3-${browserName}`);
const sourcePacket = process.env.TD613_SOURCE_PACKET_COMMIT || null;
const productionObservation = process.env.TD613_PRODUCTION_OBSERVATION === 'true';
const EPOCH = '20260720-aia3-mass-eviction-v2';
const CACHE_EPOCH = 'td613.ash.cache-flush/2026-07-20-aia3-mass-eviction-v2';
const route = `${base}/dome-world/ash-keep.html?presentation=aia`;
const assert = (value, message) => { if (!value) throw new Error(message); };

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortValue(value[key])]));
  return value;
}
const stableJson = value => JSON.stringify(sortValue(value));

function observe(page, report, profile) {
  page.on('console', message => { if (message.type() === 'error') report.console_errors.push({ profile, text:message.text() }); });
  page.on('pageerror', error => report.page_errors.push({ profile, text:error.message }));
  page.on('response', response => { if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) report.http_errors.push({ profile, status:response.status(), url:response.url() }); });
  page.on('request', request => {
    const url = request.url();
    if (new URL(url).origin !== new URL(base).origin) report.external_requests.push({ profile, url });
    if (!['GET', 'HEAD'].includes(request.method())) report.non_read_requests.push({ profile, method:request.method(), url });
  });
}

async function installTrace(context) {
  await context.addInitScript(() => {
    const traceKey = '__td613_aia3_paint_trace';
    if (!sessionStorage.getItem(traceKey)) sessionStorage.setItem(traceKey, '[]');
    const visible = node => {
      if (!node) return false;
      const style = getComputedStyle(node), rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    let last = '';
    const sample = () => {
      const entry = {
        preflight:document.documentElement.dataset.ashCachePreflight || null,
        session:document.documentElement.dataset.ashSessionOpen || null,
        root_visible:visible(document.querySelector('#ashAiaMembrane')),
        launch_visible:visible(document.querySelector('#launch')),
        stale_asset:document.documentElement.dataset.staleAia2Asset || null
      };
      const signature = JSON.stringify(entry);
      if (signature === last) return;
      last = signature;
      try {
        const list = JSON.parse(sessionStorage.getItem(traceKey) || '[]');
        list.push({ ...entry, at:Date.now() });
        sessionStorage.setItem(traceKey, JSON.stringify(list.slice(-60)));
      } catch {}
    };
    new MutationObserver(sample).observe(document, { childList:true, subtree:true, attributes:true });
    addEventListener('DOMContentLoaded', sample);
    const timer = setInterval(sample, 25);
    setTimeout(() => clearInterval(timer), 5000);
  });
}

async function snapshot(page, label) {
  return page.evaluate(labelValue => {
    const visible = node => {
      if (!node) return false;
      const style = getComputedStyle(node), r = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && r.width > 0 && r.height > 0;
    };
    const rect = node => {
      if (!node) return null;
      const r = node.getBoundingClientRect();
      return { x:Math.round(r.x), y:Math.round(r.y), width:Math.round(r.width), height:Math.round(r.height), bottom:Math.round(r.bottom), position:getComputedStyle(node).position };
    };
    const controls = [...document.querySelectorAll('button,input,select,textarea')].filter(visible);
    const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
    let lifecycleReceipt = null, preflight = null, trace = [];
    try { lifecycleReceipt = JSON.parse(document.querySelector('#lifecycleReceipt')?.textContent || 'null'); } catch {}
    try { preflight = window.__td613AshAia3PreflightReceipt || JSON.parse(sessionStorage.getItem('td613.ash.cache-preflight.receipt') || 'null'); } catch {}
    try { trace = JSON.parse(sessionStorage.getItem('__td613_aia3_paint_trace') || '[]'); } catch {}
    const lifecycle = lifecycleReceipt?.lifecycle || {};
    const launch = document.querySelector('#launch'), root = document.querySelector('#ashAiaMembrane');
    return {
      label:labelValue,
      current:window.__td613AshLiveAIA?.current?.() || null,
      composition:window.__td613AshAia3Composition?.current?.() || null,
      preflight,
      paint_trace:trace,
      case_id:window.__td613AshKeep?.current?.().case_id || null,
      pointer:localStorage.getItem('td613.ash-keep.current-case'),
      lifecycle:{ state:lifecycle.state || null, next_action:lifecycle.next_action || null, gates:lifecycle.gates || null, holds:lifecycle.holds || null, references:lifecycle.references || null },
      launch:{ visible:visible(launch), rect:rect(launch) },
      root:{ visible:visible(root), rect:rect(root), routes:root?.querySelectorAll('[data-aia-route]').length || 0, tasks:root?.querySelectorAll('[data-aia-task]').length || 0 },
      main:{ visible:visible(document.querySelector('body > main')), inert:document.querySelector('body > main')?.hasAttribute('inert') || false },
      rail:{ visible:visible(document.querySelector('body > .workspace-rail')), inert:document.querySelector('body > .workspace-rail')?.hasAttribute('inert') || false },
      profile:{ value:document.querySelector('#newProfile')?.value || null, disabled:Boolean(document.querySelector('#newProfile')?.disabled) },
      new_case:{ visible:visible(document.querySelector('#newCase')), disabled:Boolean(document.querySelector('#newCase')?.disabled) },
      dock_visible:visible(document.querySelector('.premium-primary-dock')),
      draft:document.querySelector('#draftBody')?.value || '',
      workspace:document.querySelector('.workspace.active')?.id || null,
      action_receipt:window.__td613AshLiveAIA?.current?.().latest_action_receipt || null,
      overflow:Math.max(0, document.documentElement.scrollWidth - innerWidth),
      clipped:controls.filter(node => { const r = node.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).map(node => node.id || node.tagName),
      duplicates:[...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))]
    };
  }, label);
}

async function waitReady(page) {
  await page.waitForFunction(epoch => document.documentElement.dataset.ashAia3Ready === 'true' && window.__td613AshAia3Composition?.current?.().membrane_ready === true && document.querySelector('#newProfile')?.value === 'investigation' && location.search.includes(`ash_epoch=${epoch}`), EPOCH);
}

function assertCleanPaint(value, label) {
  const retired = value.paint_trace.filter(entry => entry.root_visible && entry.session !== 'true');
  assert(retired.length === 0, `${label}: retired AIA membrane appeared before a case.`);
  assert(value.paint_trace.every(entry => entry.stale_asset !== 'served'), `${label}: stale lifecycle asset executed.`);
}

async function deliveryState(page) {
  return page.evaluate(async () => ({
    names:globalThis.caches?.keys ? await caches.keys() : [],
    workers:navigator.serviceWorker?.getRegistrations ? (await navigator.serviceWorker.getRegistrations()).map(item => item.scope) : []
  }));
}

async function runFresh(browser, config, report) {
  const context = await browser.newContext({ viewport:config.viewport, isMobile:config.mobile, hasTouch:config.mobile, colorScheme:'dark' });
  await installTrace(context);
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  observe(page, report, config.name);
  await page.goto(`${route}&profile=${config.name}&nonce=${Date.now()}`, { waitUntil:'domcontentloaded' });
  await waitReady(page);
  const first = await snapshot(page, `${config.name}-first-use`);
  report.steps.push(first);
  assert(first.launch.visible && first.launch.rect.position === 'fixed', `${config.name}: fixed ingress missing.`);
  assert(!first.root.visible, `${config.name}: AIA crown obstructs ingress.`);
  assert(first.profile.value === 'investigation' && !first.profile.disabled && first.new_case.visible && !first.new_case.disabled, `${config.name}: first lawful action unavailable.`);
  assert(!first.dock_visible && first.main.inert && first.rail.inert && !first.rail.visible, `${config.name}: ingress boundary failed.`);
  assert(first.overflow <= 2 && first.clipped.length === 0 && first.duplicates.length === 0, `${config.name}: first-use geometry failed.`);
  assert(first.preflight?.performed === true && first.preflight?.indexeddb_preserved === true && first.preflight?.case_data_preserved === true && first.preflight?.active_session_reset === false, `${config.name}: preflight preservation receipt failed.`);
  assertCleanPaint(first, config.name);
  await page.screenshot({ path:path.join(outputDir, `${browserName}-${config.name}-first-use.png`), fullPage:true });

  await page.locator('#newTitle').fill(`AIA3 ${config.name} case`);
  await page.locator('#newCase').click();
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.current?.().case_id) && window.__td613AshLiveAIA?.current?.().task === 'document');
  const opened = await snapshot(page, `${config.name}-case-open`);
  report.steps.push(opened);
  assert(opened.case_id && !opened.launch.visible && opened.root.visible && opened.root.routes === 4 && opened.root.tasks === 4, `${config.name}: case composition incomplete.`);
  assert(opened.main.visible && opened.rail.visible && !opened.main.inert && !opened.rail.inert, `${config.name}: exact work unavailable.`);
  assert(opened.root.rect.height <= (config.name === 'desktop' ? 620 : 1050), `${config.name}: AIA crown too tall.`);

  await page.locator('[data-aia-task="document"]').click();
  await page.waitForFunction(() => document.querySelector('#workspace-draft')?.classList.contains('active'));
  const text = `AIA3 local ${config.name}; no recipient route.`;
  await page.locator('#localTextFile').setInputFiles({ name:'aia3.txt', mimeType:'text/plain', buffer:Buffer.from(text) });
  await page.waitForFunction(expected => document.querySelector('#draftBody')?.value?.includes(expected) && window.__td613AshLiveAIA?.current?.().task === 'custody', text);
  await page.waitForTimeout(250);
  const before = await snapshot(page, `${config.name}-before-lesson`);
  report.steps.push(before);
  await page.locator('[data-aia-play]').click();
  await page.waitForTimeout(3300);
  const after = await snapshot(page, `${config.name}-after-lesson`);
  report.steps.push(after);
  assert(after.case_id === before.case_id && stableJson(after.lifecycle) === stableJson(before.lifecycle) && after.draft === before.draft && after.action_receipt === before.action_receipt, `${config.name}: explanation mutated governed state.`);
  for (const routeName of ['CUSTODIAL', 'AUDIT', 'IMPLEMENTATION', 'EXPERIENTIAL']) {
    await page.locator(`[data-aia-route="${routeName}"]`).click();
    await page.waitForFunction(expected => window.__td613AshLiveAIA?.current?.().route === expected, routeName);
  }
  const final = await snapshot(page, `${config.name}-complete`);
  report.steps.push(final);
  assert(final.main.visible && final.rail.visible && final.draft.includes(text), `${config.name}: route cycle lost exact work.`);
  assert(final.overflow <= 2 && final.clipped.length === 0 && final.duplicates.length === 0, `${config.name}: final geometry failed.`);
  const delivery = await deliveryState(page);
  assert(delivery.names.length === 0 && delivery.workers.length === 0, `${config.name}: stale delivery surface survived.`);
  assertCleanPaint(final, config.name);
  await page.screenshot({ path:path.join(outputDir, `${browserName}-${config.name}-complete.png`), fullPage:true });
  report.profiles[config.name] = final;
  await context.close();
}

async function runStale(browser, report) {
  const context = await browser.newContext({ viewport:{ width:1280, height:800 }, colorScheme:'dark' });
  await installTrace(context);
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  observe(page, report, 'stale-client');
  await page.goto(`${route}&profile=stale&phase=create&nonce=${Date.now()}`, { waitUntil:'domcontentloaded' });
  await waitReady(page);
  await page.locator('#newTitle').fill(`AIA3 stale ${browserName} case`);
  await page.locator('#newCase').click();
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.current?.().case_id));
  const caseId = await page.evaluate(() => window.__td613AshKeep.current().case_id);
  await page.evaluate(async () => {
    localStorage.setItem('td613.ash.cache-preflight.epoch', 'td613.ash.cache-flush/retired-aia2');
    localStorage.setItem('td613.ash.cache-flush.aia3.epoch', 'td613.ash.cache-flush/retired-aia2');
    sessionStorage.setItem('__td613_aia3_paint_trace', '[]');
    const cache = await caches.open('td613-retired-aia2-assets');
    await cache.put('/dome-world/ash-lifecycle.js?v=retired-aia2', new Response("document.documentElement.dataset.staleAia2Asset='cached';", { headers:{ 'content-type':'text/javascript' } }));
    await navigator.serviceWorker.register('/__ash_keep_closure/stale-aia2-worker.js', { scope:'/dome-world/' });
    await navigator.serviceWorker.ready;
  });
  await page.goto(`${route}&profile=stale&phase=evict&nonce=${Date.now()}`, { waitUntil:'domcontentloaded' });
  await page.waitForFunction(({ expectedCase, epoch }) => window.__td613AshKeep?.current?.().case_id === expectedCase && document.documentElement.dataset.ashAia3Ready === 'true' && location.search.includes(`ash_epoch=${epoch}`), { expectedCase:caseId, epoch:EPOCH });
  const final = await snapshot(page, 'stale-client-complete');
  report.steps.push(final);
  assert(final.case_id === caseId && final.pointer === caseId, 'Stale client lost the local case pointer.');
  assert(final.root.visible && !final.launch.visible && final.main.visible && final.rail.visible, 'Stale client did not recover exact work.');
  assert(final.preflight?.performed === true && final.preflight?.local_case_pointer_preserved === true && final.preflight?.session_epoch_preserved_or_migrated === true, 'Stale client preservation receipt failed.');
  assert(final.preflight?.cache_names?.includes('td613-retired-aia2-assets'), 'Retired cache missing from eviction receipt.');
  assert(final.preflight?.worker_scopes?.some(scope => scope.includes('/dome-world/')), 'Retired worker missing from eviction receipt.');
  assertCleanPaint(final, 'stale-client');
  const delivery = await deliveryState(page);
  assert(delivery.names.length === 0 && delivery.workers.length === 0, `Stale delivery survived: ${JSON.stringify(delivery)}.`);
  assert(await page.evaluate(expected => localStorage.getItem('td613.ash.cache-preflight.epoch') === expected, CACHE_EPOCH), 'Current cache epoch missing.');
  await page.screenshot({ path:path.join(outputDir, `${browserName}-stale-client-complete.png`), fullPage:true });
  report.profiles.stale_client = final;
  await context.close();
}

assert(browserType, `Unsupported browser ${browserName}`);
await fs.mkdir(outputDir, { recursive:true });
const report = {
  schema:'td613.ash.aia3-task-continuity-browser-evidence/v0.3-mass-eviction',
  status:'RUNNING', browser:browserName, base_url:base, source_packet_commit:sourcePacket,
  production_observation:productionObservation, profiles:{}, steps:[], console_errors:[], page_errors:[], http_errors:[], external_requests:[], non_read_requests:[],
  authority:{ counts_as_human_evidence:false, authorizes_child_study:false, authorizes_release:false, closes_program:false }
};
let terminal = null;
const browser = await browserType.launch({ headless:true });
try {
  await runFresh(browser, { name:'desktop', viewport:{ width:1440, height:900 }, mobile:false }, report);
  await runFresh(browser, { name:'mobile', viewport:{ width:390, height:844 }, mobile:browserName === 'webkit' }, report);
  if (!productionObservation) await runStale(browser, report);
  assert(report.console_errors.length === 0 && report.page_errors.length === 0 && report.http_errors.length === 0 && report.external_requests.length === 0 && report.non_read_requests.length === 0, `Observer recorded errors: ${JSON.stringify(report)}`);
  report.status = 'PASS';
} catch (error) {
  terminal = error;
  report.status = 'HELD';
  report.hold_reason = error.message;
} finally {
  await browser.close();
  report.completed_at = new Date().toISOString();
  await fs.writeFile(path.join(outputDir, 'ash-aia3-task-continuity.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}
if (terminal) throw terminal;
console.log(JSON.stringify({ status:report.status, browser:browserName, profiles:Object.keys(report.profiles) }, null, 2));
