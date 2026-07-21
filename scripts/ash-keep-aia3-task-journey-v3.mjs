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
const target = `${base}/dome-world/ash-keep.html?presentation=aia&aia3_journey=${Date.now()}`;
const profiles = [
  { name:'desktop', viewport:{ width:1440, height:900 }, isMobile:false, hasTouch:false },
  { name:'mobile', viewport:{ width:390, height:844 }, isMobile:browserName === 'webkit', hasTouch:browserName === 'webkit' }
];
const assert = (value, message) => { if (!value) throw new Error(message); };
const stableJson = value => JSON.stringify(value, Object.keys(value || {}).sort());

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

async function installPaintTrace(context, clearOnce = false) {
  await context.addInitScript(({ clearOnceValue }) => {
    const initKey = '__td613_aia3_test_initialized';
    if (clearOnceValue && sessionStorage.getItem(initKey) !== 'true') {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem(initKey, 'true');
    }
    const traceKey = '__td613_aia3_paint_trace';
    if (!sessionStorage.getItem(traceKey)) sessionStorage.setItem(traceKey, '[]');
    let last = '';
    const visible = node => {
      if (!node) return false;
      const style = getComputedStyle(node), rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    const sample = () => {
      const root = document.querySelector('#ashAiaMembrane');
      const launch = document.querySelector('#launch');
      const entry = {
        href:location.pathname + location.search,
        preflight:document.documentElement.dataset.ashCachePreflight || null,
        aia3:document.documentElement.dataset.ashAia3 || null,
        session:document.documentElement.dataset.ashSessionOpen || null,
        root_visible:visible(root),
        launch_visible:visible(launch),
        stale_asset:document.documentElement.dataset.staleAia2Asset || null
      };
      const signature = JSON.stringify(entry);
      if (signature === last) return;
      last = signature;
      try {
        const list = JSON.parse(sessionStorage.getItem(traceKey) || '[]');
        list.push({ ...entry, at:Date.now() });
        sessionStorage.setItem(traceKey, JSON.stringify(list.slice(-80)));
      } catch {}
    };
    new MutationObserver(sample).observe(document, { childList:true, subtree:true, attributes:true });
    addEventListener('DOMContentLoaded', sample);
    const timer = setInterval(sample, 20);
    setTimeout(() => clearInterval(timer), 5000);
    sample();
  }, { clearOnceValue:clearOnce });
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
    const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
    const controls = [...document.querySelectorAll('button,input,select,textarea')].filter(visible);
    const clipped = controls.filter(node => { const r = node.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).map(node => node.id || node.textContent?.trim().slice(0, 40) || node.tagName);
    let receipt = null, preflight = null, trace = [];
    try { receipt = JSON.parse(document.querySelector('#lifecycleReceipt')?.textContent || 'null'); } catch {}
    try { preflight = JSON.parse(sessionStorage.getItem('td613.ash.cache-preflight.receipt') || 'null'); } catch {}
    try { trace = JSON.parse(sessionStorage.getItem('__td613_aia3_paint_trace') || '[]'); } catch {}
    const lifecycle = receipt?.lifecycle || {};
    const root = document.querySelector('#ashAiaMembrane');
    const launch = document.querySelector('#launch');
    return {
      label:labelValue,
      html:{ ...document.documentElement.dataset },
      body:{ ...document.body.dataset },
      current:window.__td613AshLiveAIA?.current?.() || null,
      aia3:window.__td613AshAia3Composition?.current?.() || null,
      cache:window.__td613AshAia3CacheTransition || null,
      preflight,
      paint_trace:trace,
      case_id:window.__td613AshKeep?.current?.().case_id || null,
      pointer:localStorage.getItem('td613.ash-keep.current-case'),
      lifecycle_semantics:{ state:lifecycle.state || null, next_action:lifecycle.next_action || null, source_status:lifecycle.source_status || null, observation_status:lifecycle.observation_status || null, gates:lifecycle.gates || null, holds:lifecycle.holds || null, references:lifecycle.references || null },
      launch:{ visible:visible(launch), parent:launch?.parentElement?.id || launch?.parentElement?.className || null, rect:rect(launch) },
      root:{ visible:visible(root), rect:rect(root), routes:root?.querySelectorAll('[data-aia-route]').length || 0, tasks:root?.querySelectorAll('[data-aia-task]').length || 0, guide:visible(root?.querySelector('.ash-aia__guide')) },
      main:{ visible:visible(document.querySelector('body > main')), rect:rect(document.querySelector('body > main')), inert:document.querySelector('body > main')?.hasAttribute('inert') || false },
      rail:{ visible:visible(document.querySelector('body > .workspace-rail')), rect:rect(document.querySelector('body > .workspace-rail')), inert:document.querySelector('body > .workspace-rail')?.hasAttribute('inert') || false },
      profile:{ value:document.querySelector('#newProfile')?.value || null, disabled:Boolean(document.querySelector('#newProfile')?.disabled) },
      new_case:{ visible:visible(document.querySelector('#newCase')), disabled:Boolean(document.querySelector('#newCase')?.disabled), rect:rect(document.querySelector('#newCase')) },
      dock_visible:visible(document.querySelector('.premium-primary-dock')),
      draft:document.querySelector('#draftBody')?.value || '',
      workspace:document.querySelector('.workspace.active')?.id || null,
      lesson_frame:root?.querySelector('[data-aia-stage]')?.dataset.frame || null,
      action_receipt:window.__td613AshLiveAIA?.current?.().latest_action_receipt || null,
      scroll_x:Math.round(scrollX), overflow:Math.max(0, document.documentElement.scrollWidth - innerWidth), clipped,
      duplicates:[...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))]
    };
  }, label);
}

async function assertClickable(locator, label) {
  await locator.scrollIntoViewIfNeeded();
  const hit = await locator.evaluate(node => {
    const r = node.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { same:top === node || node.contains(top), top:top?.id || String(top?.className || '') || top?.tagName || null };
  });
  assert(hit.same, `${label} covered by ${hit.top}.`);
}

async function waitForReady(page) {
  await page.waitForFunction(epoch => document.documentElement.dataset.ashAia3Ready === 'true' && window.__td613AshAia3Composition?.current?.().membrane_ready === true && document.querySelector('#newProfile')?.value === 'investigation' && location.search.includes(`ash_epoch=${epoch}`), EPOCH);
}

async function waitForSemanticSettle(page) {
  await page.waitForFunction(() => {
    try {
      const receipt = JSON.parse(document.querySelector('#lifecycleReceipt')?.textContent || 'null');
      return Boolean(window.__td613AshKeep?.current?.().case_id && receipt?.lifecycle?.state && window.__td613AshLiveAIA?.current?.().task === 'custody');
    } catch { return false; }
  });
  await page.waitForTimeout(250);
}

function assertNoRetiredPaint(snapshotValue, label) {
  const bad = snapshotValue.paint_trace.filter(entry => entry.root_visible && entry.session !== 'true');
  assert(bad.length === 0, `${label}: retired AIA2 membrane appeared before a case (${JSON.stringify(bad)}).`);
  assert(snapshotValue.paint_trace.every(entry => entry.stale_asset !== 'served'), `${label}: stale lifecycle asset executed.`);
}

async function runFreshProfile(browser, config, report) {
  const context = await browser.newContext({ viewport:config.viewport, isMobile:config.isMobile, hasTouch:config.hasTouch, colorScheme:'dark' });
  await installPaintTrace(context, true);
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  observe(page, report, config.name);
  await page.goto(`${target}&profile=${config.name}`, { waitUntil:'domcontentloaded' });
  await waitForReady(page);
  const first = await snapshot(page, `${config.name}-first-use`);
  report.steps.push(first);
  assert(first.launch.visible && first.launch.rect.position === 'fixed', `${config.name}: canonical fixed ingress missing.`);
  assert(!first.root.visible, `${config.name}: AIA guide obstructs first-use ingress.`);
  assert(first.profile.value === 'investigation' && !first.new_case.disabled && first.new_case.visible, `${config.name}: profile/default action unavailable.`);
  assert(!first.dock_visible, `${config.name}: fixed dock covers ingress.`);
  assert(first.main.inert && first.rail.inert && !first.rail.visible, `${config.name}: exact work exposed behind ingress.`);
  assert(first.scroll_x === 0 && first.overflow <= 2 && first.clipped.length === 0 && first.duplicates.length === 0, `${config.name}: first-use geometry failed.`);
  assert(first.preflight?.performed === true && first.preflight?.indexeddb_preserved === true && first.preflight?.case_data_preserved === true && first.preflight?.active_session_reset === false, `${config.name}: preflight receipt failed its preservation ceiling.`);
  assertNoRetiredPaint(first, config.name);
  await assertClickable(page.locator('#newCase'), `${config.name}: New Case`);
  await page.screenshot({ path:path.join(outputDir, `${browserName}-${config.name}-first-use.png`), fullPage:true });
  await page.locator('#newTitle').fill(`AIA3 ${config.name} case`);
  await page.locator('#newCase').click();
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.current?.().case_id) && document.documentElement.dataset.ashSessionOpen === 'true' && window.__td613AshLiveAIA?.current?.().task === 'document');
  const opened = await snapshot(page, `${config.name}-case-open`);
  report.steps.push(opened);
  assert(opened.case_id && !opened.launch.visible, `${config.name}: ingress did not yield to case.`);
  assert(opened.root.visible && opened.root.routes === 4 && opened.root.tasks === 4 && opened.root.guide, `${config.name}: compact pedagogue missing.`);
  assert(opened.main.visible && opened.rail.visible && !opened.main.inert && !opened.rail.inert, `${config.name}: exact work unavailable.`);
  const maxHeight = config.name === 'desktop' ? 620 : 1050;
  assert(opened.root.rect.height <= maxHeight, `${config.name}: AIA crown too tall (${opened.root.rect.height}).`);
  await page.locator('[data-aia-task="document"]').click();
  await page.waitForFunction(() => document.querySelector('#workspace-draft')?.classList.contains('active') && document.querySelector('#localTextFile')?.getClientRects().length > 0);
  const text = `AIA3 local synthetic ${config.name}; no recipient route.`;
  await page.locator('#localTextFile').setInputFiles({ name:'aia3.txt', mimeType:'text/plain', buffer:Buffer.from(text) });
  await page.waitForFunction(expected => document.querySelector('#draftBody')?.value?.includes(expected) && window.__td613AshLiveAIA?.current?.().task === 'custody', text);
  await waitForSemanticSettle(page);
  const before = await snapshot(page, `${config.name}-before-lesson`);
  report.steps.push(before);
  await assertClickable(page.locator('[data-aia-play]'), `${config.name}: Play explanation`);
  await page.locator('[data-aia-play]').click();
  await page.waitForTimeout(3300);
  const after = await snapshot(page, `${config.name}-after-lesson`);
  report.steps.push(after);
  assert(after.case_id === before.case_id && stableJson(after.lifecycle_semantics) === stableJson(before.lifecycle_semantics) && after.draft === before.draft && after.action_receipt === before.action_receipt, `${config.name}: explanation mutated governed lifecycle semantics.`);
  for (const route of ['CUSTODIAL', 'AUDIT', 'IMPLEMENTATION', 'EXPERIENTIAL']) {
    await page.locator(`[data-aia-route="${route}"]`).click();
    await page.waitForFunction(expected => window.__td613AshLiveAIA?.current?.().route === expected, route);
  }
  const returned = await snapshot(page, `${config.name}-complete`);
  report.steps.push(returned);
  assert(returned.main.visible && returned.rail.visible && returned.draft.includes(text), `${config.name}: route cycle lost exact work.`);
  assert(returned.scroll_x === 0 && returned.overflow <= 2 && returned.clipped.length === 0, `${config.name}: final geometry failed (${returned.clipped.join(', ')}).`);
  const cacheState = await page.evaluate(async () => ({ names:globalThis.caches?.keys ? await caches.keys() : [], workers:navigator.serviceWorker?.getRegistrations ? (await navigator.serviceWorker.getRegistrations()).map(item => item.scope) : [] }));
  assert(cacheState.names.length === 0 && cacheState.workers.length === 0, `${config.name}: stale browser delivery surface survived.`);
  await page.screenshot({ path:path.join(outputDir, `${browserName}-${config.name}-complete.png`), fullPage:true });
  report.profiles[config.name] = returned;
  await context.close();
}

async function runStaleClient(browser, report) {
  const profile = 'stale-client';
  const context = await browser.newContext({ viewport:{ width:1280, height:800 }, colorScheme:'dark' });
  await installPaintTrace(context, true);
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  observe(page, report, profile);
  await page.goto(`${target}&profile=${profile}&phase=create`, { waitUntil:'domcontentloaded' });
  await waitForReady(page);
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
  await page.goto(`${target}&profile=${profile}&phase=evict`, { waitUntil:'domcontentloaded' });
  await page.waitForFunction(({ expectedCase, epoch }) => window.__td613AshKeep?.current?.().case_id === expectedCase && document.documentElement.dataset.ashAia3Ready === 'true' && location.search.includes(`ash_epoch=${epoch}`), { expectedCase:caseId, epoch:EPOCH });
  const final = await snapshot(page, `${profile}-complete`);
  report.steps.push(final);
  assert(final.case_id === caseId && final.pointer === caseId, `${profile}: local case pointer was not preserved.`);
  assert(final.root.visible && !final.launch.visible && final.main.visible && final.rail.visible, `${profile}: recovered task surface is incomplete.`);
  assert(final.preflight?.performed === true && final.preflight?.local_case_pointer_preserved === true && final.preflight?.session_epoch_preserved === true, `${profile}: preflight did not preserve the active case/session.`);
  assert(final.preflight?.cache_names?.includes('td613-retired-aia2-assets'), `${profile}: retired cache was not observed in the eviction receipt.`);
  assert(final.preflight?.worker_scopes?.some(scope => scope.includes('/dome-world/')), `${profile}: retired service worker was not observed in the eviction receipt.`);
  assertNoRetiredPaint(final, profile);
  const delivery = await page.evaluate(async () => ({ names:await caches.keys(), workers:(await navigator.serviceWorker.getRegistrations()).map(item => item.scope), marker:localStorage.getItem('td613.ash.cache-preflight.epoch') }));
  assert(delivery.names.length === 0 && delivery.workers.length === 0, `${profile}: retired cache or worker survived (${JSON.stringify(delivery)}).`);
  assert(delivery.marker === CACHE_EPOCH, `${profile}: current eviction epoch was not registered.`);
  await page.screenshot({ path:path.join(outputDir, `${browserName}-${profile}-complete.png`), fullPage:true });
  report.profiles[profile] = final;
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
  for (const profile of profiles) await runFreshProfile(browser, profile, report);
  if (!productionObservation) await runStaleClient(browser, report);
  assert(report.console_errors.length === 0 && report.page_errors.length === 0 && report.http_errors.length === 0 && report.external_requests.length === 0 && report.non_read_requests.length === 0, `Browser observer recorded errors or external/write requests: ${JSON.stringify({ console:report.console_errors, page:report.page_errors, http:report.http_errors, external:report.external_requests, writes:report.non_read_requests })}`);
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
