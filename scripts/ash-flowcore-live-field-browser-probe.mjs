import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const engines = { chromium, firefox, webkit };
const browserName = process.env.TD613_BROWSER || 'chromium';
const engine = engines[browserName];
if (!engine) throw new Error(`Unsupported browser: ${browserName}`);
const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-flowcore-field-${browserName}`);
const assert = (value, message) => { if (!value) throw new Error(message); };

await fs.mkdir(out, { recursive:true });
const browser = await engine.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:1440, height:1000 }, locale:'en-US', reducedMotion:'no-preference' });
const page = await context.newPage();
page.setDefaultTimeout(60_000);
const errors = [], httpErrors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) httpErrors.push(`${response.status()} ${response.url()}`); });
await page.addInitScript(() => {
  window.__ashFlowcorePhaseTrace = [];
  addEventListener('td613:ash:flowcore-field-phase', event => {
    const item = event.detail || {};
    window.__ashFlowcorePhaseTrace.push({ phase:item.phase, phase_name:item.phase_name, source:item.source, artifact_required:item.artifact_required });
  });
});

const report = { schema:'td613.ash.flowcore-live-field-browser/v0.1', browser:browserName, status:'RUNNING', errors, http_errors:httpErrors, observations:{} };
try {
  await page.goto(`${base}/dome-world/ash-keep.html?presentation=aia&profile=investigation&nonce=${Date.now()}`, { waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => window.__td613AshFlowcoreField?.version
    && window.__td613AshSessionBoundary?.version
    && document.documentElement.dataset.ashCompositionStable
    && document.querySelector('.ash-flowcore-field'));
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await new Promise(resolve => {
      const request = indexedDB.deleteDatabase('td613-ash-keep');
      request.onsuccess = request.onerror = request.onblocked = () => resolve();
    });
  });
  await page.goto(`${base}/dome-world/ash-keep.html?presentation=aia&profile=investigation&nonce=${Date.now()}`, { waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => window.__td613AshFlowcoreField?.current?.().artifact_required === false
    && document.documentElement.dataset.ashCompositionStable
    && document.querySelector('.ash-flowcore-field')
    && document.getElementById('launch'));

  const arrival = await page.evaluate(() => {
    const field = document.querySelector('.ash-flowcore-field');
    const rail = document.querySelector('.ash-ux-motion-track');
    const style = getComputedStyle(field);
    return {
      visible:style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && field.getBoundingClientRect().height > 260,
      phase:field.dataset.flowcorePhaseName,
      artifact_required:window.__td613AshFlowcoreField.current().artifact_required,
      local_file_count:document.getElementById('localTextFile')?.files?.length || 0,
      draft_empty:!(document.getElementById('draftBody')?.value || '').trim(),
      channels:window.__td613AshFlowcoreField.current().channels,
      rail_display:rail ? getComputedStyle(rail).display : 'absent',
      labels:field.textContent,
      svg_description:field.querySelector('desc')?.textContent || ''
    };
  });
  assert(arrival.visible, 'Flow-Core field missing at zero-artifact arrival.');
  assert(arrival.phase === 'NOTICE', `Arrival phase drifted: ${arrival.phase}.`);
  assert(arrival.artifact_required === false && arrival.local_file_count === 0 && arrival.draft_empty, 'Flow-Core arrival incorrectly requires an artifact.');
  assert(['glyph','motion','shape','language','inspection'].every(channel => arrival.channels.includes(channel)), `Flow-Core channels incomplete: ${arrival.channels.join(', ')}.`);
  assert(arrival.rail_display === 'none' || arrival.rail_display === 'absent', `Placeholder dot rail remains visible: ${arrival.rail_display}.`);
  for (const label of ['RAW BYTES DO NOT CROSS','REFERENCE','≠ ARTIFACT','CASE MAP RELATION FIELD']) assert(arrival.labels.includes(label) || arrival.svg_description.includes(label), `Flow-Core field omitted ${label}.`);
  await page.screenshot({ path:path.join(out, `${browserName}-zero-artifact-arrival.png`), fullPage:true });

  await page.locator('[data-aia-play]').click();
  await page.waitForFunction(() => document.documentElement.dataset.ashFlowcorePhase === 'NAME');
  const activeMotion = await page.evaluate(() => ({
    animations:document.querySelector('.ash-flowcore-field')?.getAnimations({ subtree:true }).length || 0,
    phase:document.documentElement.dataset.ashFlowcorePhase
  }));
  assert(activeMotion.phase === 'NAME', 'Flow-Core relation phase never became visible.');
  assert(activeMotion.animations > 0, 'Flow-Core relation phase produced no visible finite animation.');
  await page.waitForFunction(() => document.documentElement.dataset.ashFlowcorePhase === 'REST', null, { timeout:15_000 });
  const trace = await page.evaluate(() => window.__ashFlowcorePhaseTrace);
  const names = new Set(trace.map(item => item.phase_name));
  for (const name of ['NOTICE','ACT','WORLD_ANSWERS','NAME','REST']) assert(names.has(name), `Flow-Core trace omitted ${name}: ${JSON.stringify(trace)}.`);
  assert(trace.every(item => item.artifact_required === false), 'A Flow-Core frame falsely required an artifact.');

  await page.setViewportSize({ width:390, height:844 });
  const mobile = await page.evaluate(() => ({
    overflow:Math.max(0, document.documentElement.scrollWidth - innerWidth),
    field_width:document.querySelector('.ash-flowcore-field')?.getBoundingClientRect().width || 0,
    static_count:document.querySelectorAll('.ash-flowcore-static li').length,
    rest_visible:getComputedStyle(document.querySelector('.ash-flowcore-rest')).opacity !== '0'
  }));
  assert(mobile.overflow <= 2, `Mobile Flow-Core overflow: ${mobile.overflow}.`);
  assert(mobile.field_width > 320 && mobile.field_width <= 390, `Mobile field width invalid: ${mobile.field_width}.`);
  assert(mobile.static_count === 5 && mobile.rest_visible, 'Mobile/static Flow-Core parity incomplete.');
  await page.screenshot({ path:path.join(out, `${browserName}-flowcore-mobile-rest.png`), fullPage:true });

  await page.locator('#newProfile').selectOption('investigation');
  await page.locator('#newTitle').fill(`Flow-Core close boundary ${browserName}`);
  await page.locator('#newCase').click();
  await page.waitForFunction(() => Boolean(localStorage.getItem('td613.ash-keep.current-case'))
    && Boolean(window.__td613AshKeep?.current?.().case_id)
    && !document.getElementById('closeCase')?.disabled);
  const caseId = await page.evaluate(() => localStorage.getItem('td613.ash-keep.current-case'));
  await page.locator('#closeCase').click();
  await page.waitForFunction(() => {
    const launch = document.getElementById('launch');
    const style = launch ? getComputedStyle(launch) : null;
    const main = document.querySelector('body > main');
    const rail = document.querySelector('body > .workspace-rail');
    return !localStorage.getItem('td613.ash-keep.current-case')
      && window.__td613AshKeep?.current?.().case_id == null
      && document.documentElement.dataset.ashSessionOpen === 'false'
      && launch && !launch.classList.contains('hidden')
      && style?.display !== 'none' && style?.visibility !== 'hidden'
      && main?.hasAttribute('inert') && rail?.hasAttribute('inert');
  });
  const close = await page.evaluate(async id => {
    const launch = document.getElementById('launch');
    const db = await new Promise((resolve,reject) => {
      const request = indexedDB.open('td613-ash-keep');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const saved = await new Promise((resolve,reject) => {
      const request = db.transaction('savedCases').objectStore('savedCases').get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return {
      case_id:window.__td613AshKeep.current().case_id,
      pointer:localStorage.getItem('td613.ash-keep.current-case'),
      launch_visible:getComputedStyle(launch).display !== 'none' && !launch.classList.contains('hidden'),
      saved:Boolean(saved),
      boundary:window.__td613AshSessionBoundary.current()
    };
  }, caseId);
  assert(close.case_id == null && close.pointer == null && close.launch_visible && close.saved, `Close boundary failed: ${JSON.stringify(close)}.`);
  await page.screenshot({ path:path.join(out, `${browserName}-close-returns-ingress.png`), fullPage:true });

  assert(errors.length === 0, `Browser errors: ${errors.join(' | ')}`);
  assert(httpErrors.length === 0, `HTTP errors: ${httpErrors.join(' | ')}`);
  report.status = 'PASS';
  report.observations = { arrival, active_motion:activeMotion, phase_trace:trace, mobile, close };
} catch (error) {
  report.status = 'HOLD';
  report.hold = { message:error.message, stack:error.stack };
  try { await page.screenshot({ path:path.join(out, `${browserName}-held.png`), fullPage:true }); } catch {}
  throw error;
} finally {
  await fs.writeFile(path.join(out, 'ash-flowcore-live-field-browser.json'), `${JSON.stringify(report, null, 2)}\n`);
  await context.close();
  await browser.close();
}
console.log('ash-flowcore-live-field-browser-probe.mjs passed');
