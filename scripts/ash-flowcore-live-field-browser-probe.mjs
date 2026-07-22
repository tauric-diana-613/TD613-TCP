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

const report = { schema:'td613.ash.flowcore-live-field-browser/v0.4-visible-dual-motion', browser:browserName, status:'RUNNING', errors, http_errors:httpErrors, observations:{} };
try {
  await page.goto(`${base}/dome-world/ash-keep.html?presentation=aia&profile=investigation&nonce=${Date.now()}`, { waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => window.__td613AshFlowcoreField?.version
    && window.__td613AshFlowcoreIngressPortal?.version
    && window.__td613AshPostIngressMotionRestoration?.version
    && window.__td613AshSessionBoundary?.version
    && window.__td613AshIngressCopySpacing?.version
    && document.documentElement.dataset.ashCompositionStable
    && document.getElementById('launch'));
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await new Promise(resolve => {
      const request = indexedDB.deleteDatabase('td613-ash-keep');
      request.onsuccess = request.onerror = request.onblocked = () => resolve();
    });
  });
  await page.goto(`${base}/dome-world/ash-keep.html?presentation=aia&profile=investigation&nonce=${Date.now()}`, { waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => {
    const portal = window.__td613AshFlowcoreIngressPortal?.current?.();
    const visible = document.querySelector('.ash-flowcore-field:not([hidden])');
    return window.__td613AshFlowcoreField?.current?.().artifact_required === false
      && window.__td613AshPostIngressMotionRestoration?.version
      && window.__td613AshIngressCopySpacing?.measure?.().available
      && document.documentElement.dataset.ashCompositionStable
      && document.getElementById('launch')
      && portal?.visible_host === 'INGRESS'
      && portal?.duplicate_visible_fields === 1
      && visible?.parentElement?.id === 'guidedLaunchPromise'
      && visible.getBoundingClientRect().height > 260;
  });

  const ingressDesktop = await page.evaluate(() => window.__td613AshIngressCopySpacing.measure());
  assert(ingressDesktop.available && ingressDesktop.ordered, `Ingress copy order failed: ${JSON.stringify(ingressDesktop)}.`);
  assert(ingressDesktop.overlap_px === 0 && ingressDesktop.overlap_area === 0, `Ingress recovery copy overlaps primary copy: ${JSON.stringify(ingressDesktop)}.`);
  assert(ingressDesktop.title_bottom <= ingressDesktop.recovery_top + 2, `Ash Keep title collides with recovery copy: ${JSON.stringify(ingressDesktop)}.`);

  const ingressField = await page.evaluate(() => {
    const field = document.querySelector('.ash-flowcore-field:not([hidden])');
    const portal = window.__td613AshFlowcoreIngressPortal.current();
    const style = getComputedStyle(field);
    const promise = document.getElementById('guidedLaunchPromise');
    const play = field.querySelector('[data-flowcore-ingress-play]');
    return {
      visible:style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && field.getBoundingClientRect().height > 260,
      host:portal.visible_host,
      duplicate_visible_fields:portal.duplicate_visible_fields,
      parent_id:field.parentElement?.id || null,
      phase:field.dataset.flowcorePhaseName,
      artifact_required:window.__td613AshFlowcoreField.current().artifact_required,
      local_file_count:document.getElementById('localTextFile')?.files?.length || 0,
      draft_empty:!(document.getElementById('draftBody')?.value || '').trim(),
      play_visible:Boolean(play && getComputedStyle(play).display !== 'none' && play.getBoundingClientRect().height >= 30),
      old_four_step_copy:/Four exact steps|Start here\. Ash explains/.test(promise?.textContent || ''),
      labels:field.textContent,
      svg_description:field.querySelector('desc')?.textContent || ''
    };
  });
  assert(ingressField.visible, 'Flow-Core field missing at clean zero-artifact ingress.');
  assert(ingressField.host === 'INGRESS' && ingressField.parent_id === 'guidedLaunchPromise', `Flow-Core ingress host drifted: ${JSON.stringify(ingressField)}.`);
  assert(ingressField.duplicate_visible_fields === 1, `More than one visible Flow-Core field: ${ingressField.duplicate_visible_fields}.`);
  assert(ingressField.phase === 'NOTICE', `Ingress phase drifted: ${ingressField.phase}.`);
  assert(ingressField.artifact_required === false && ingressField.local_file_count === 0 && ingressField.draft_empty, 'Clean ingress incorrectly required an artifact.');
  assert(ingressField.play_visible, 'Explicit Flow-Core Play control missing at ingress.');
  assert(!ingressField.old_four_step_copy, 'Static four-step card still occupies the visible ingress pedagogy slot.');
  for (const label of ['RAW BYTES DO NOT CROSS','REFERENCE','≠ ARTIFACT','CASE MAP RELATION FIELD']) assert(ingressField.labels.includes(label) || ingressField.svg_description.includes(label), `Ingress Flow-Core field omitted ${label}.`);
  await page.screenshot({ path:path.join(out, `${browserName}-zero-artifact-ingress.png`), fullPage:true });

  await page.setViewportSize({ width:390, height:844 });
  await page.evaluate(() => {
    window.__td613AshIngressCopySpacing.refresh();
    window.__td613AshFlowcoreIngressPortal.refresh();
  });
  const ingressMobile = await page.evaluate(() => window.__td613AshIngressCopySpacing.measure());
  const ingressMobileGeometry = await page.evaluate(() => {
    const field = document.querySelector('.ash-flowcore-field:not([hidden])');
    return {
      overflow:Math.max(0, document.documentElement.scrollWidth - innerWidth),
      field_width:field?.getBoundingClientRect().width || 0,
      title_visible:getComputedStyle(document.getElementById('ashLaunchTitle')).display !== 'none',
      recovery_visible:getComputedStyle(document.getElementById('capsuleRecoveryLaunchDescription')).display !== 'none',
      portal:window.__td613AshFlowcoreIngressPortal.current()
    };
  });
  assert(ingressMobile.available && ingressMobile.ordered && ingressMobile.overlap_px === 0 && ingressMobile.overlap_area === 0, `Mobile ingress copy overlap: ${JSON.stringify(ingressMobile)}.`);
  assert(ingressMobileGeometry.overflow <= 2, `Mobile ingress overflow: ${ingressMobileGeometry.overflow}.`);
  assert(ingressMobileGeometry.field_width > 320 && ingressMobileGeometry.field_width <= 390, `Mobile ingress field width invalid: ${ingressMobileGeometry.field_width}.`);
  assert(ingressMobileGeometry.title_visible && ingressMobileGeometry.recovery_visible, 'Mobile ingress title or recovery guidance disappeared.');
  assert(ingressMobileGeometry.portal.visible_host === 'INGRESS' && ingressMobileGeometry.portal.duplicate_visible_fields === 1, `Mobile ingress portal drifted: ${JSON.stringify(ingressMobileGeometry.portal)}.`);

  await page.setViewportSize({ width:1440, height:1000 });
  await page.locator('#newProfile').selectOption('investigation');
  await page.locator('#newTitle').fill(`Flow-Core zero-artifact ${browserName}`);
  await page.locator('#newCase').click();
  await page.waitForFunction(() => {
    const portal = window.__td613AshFlowcoreIngressPortal?.current?.();
    const visible = document.querySelector('.ash-flowcore-field:not([hidden])');
    const motion = window.__td613AshPostIngressMotionRestoration?.current?.();
    return Boolean(localStorage.getItem('td613.ash-keep.current-case'))
      && Boolean(window.__td613AshKeep?.current?.().case_id)
      && !document.getElementById('closeCase')?.disabled
      && portal?.visible_host === 'AIA'
      && portal?.duplicate_visible_fields === 1
      && visible?.closest?.('#ashAiaMembrane')
      && visible.getBoundingClientRect().height > 400
      && motion?.canvas_visible
      && motion?.rail_visible
      && !motion?.field_clipped
      && !motion?.rail_clipped
      && document.documentElement.dataset.ashFlowcorePhase === 'NOTICE';
  });
  const caseId = await page.evaluate(() => localStorage.getItem('td613.ash-keep.current-case'));

  const arrival = await page.evaluate(() => {
    const field = document.querySelector('.ash-flowcore-field:not([hidden])');
    const rail = document.querySelector('#ashAiaMembrane .ash-ux-motion-track');
    const canvas = field?.querySelector('.ash-flowcore-field__canvas');
    const style = getComputedStyle(field);
    const portal = window.__td613AshFlowcoreIngressPortal.current();
    const motion = window.__td613AshPostIngressMotionRestoration.refresh();
    return {
      visible:style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && field.getBoundingClientRect().height > 400,
      host:portal.visible_host,
      duplicate_visible_fields:portal.duplicate_visible_fields,
      phase:field.dataset.flowcorePhaseName,
      artifact_required:window.__td613AshFlowcoreField.current().artifact_required,
      local_file_count:document.getElementById('localTextFile')?.files?.length || 0,
      draft_empty:!(document.getElementById('draftBody')?.value || '').trim(),
      channels:window.__td613AshFlowcoreField.current().channels,
      rail_display:rail ? getComputedStyle(rail).display : 'absent',
      canvas_display:canvas ? getComputedStyle(canvas).display : 'absent',
      motion,
      labels:field.textContent,
      svg_description:field.querySelector('desc')?.textContent || ''
    };
  });
  assert(arrival.visible, 'Flow-Core field missing in an empty local case.');
  assert(arrival.host === 'AIA' && arrival.duplicate_visible_fields === 1, `Flow-Core exact-work host drifted: ${JSON.stringify(arrival)}.`);
  assert(arrival.phase === 'NOTICE', `Arrival phase drifted: ${arrival.phase}.`);
  assert(arrival.artifact_required === false && arrival.local_file_count === 0 && arrival.draft_empty, 'Flow-Core arrival incorrectly requires an artifact.');
  assert(['glyph','motion','shape','language','inspection'].every(channel => arrival.channels.includes(channel)), `Flow-Core channels incomplete: ${arrival.channels.join(', ')}.`);
  assert(arrival.rail_display === 'grid', `One-dimensional lesson rail is hidden: ${arrival.rail_display}.`);
  assert(arrival.canvas_display === 'block', `Flow-Core topology canvas is hidden: ${arrival.canvas_display}.`);
  assert(arrival.motion.canvas_visible && arrival.motion.rail_visible, `Post-ingress motion layers are not visible: ${JSON.stringify(arrival.motion)}.`);
  assert(arrival.motion.canvas_height >= 300 && arrival.motion.rail_height >= 40, `Post-ingress motion geometry collapsed: ${JSON.stringify(arrival.motion)}.`);
  assert(!arrival.motion.field_clipped && !arrival.motion.rail_clipped, `Post-ingress motion is clipped or covered: ${JSON.stringify(arrival.motion)}.`);
  for (const label of ['RAW BYTES DO NOT CROSS','REFERENCE','≠ ARTIFACT','CASE MAP RELATION FIELD']) assert(arrival.labels.includes(label) || arrival.svg_description.includes(label), `Flow-Core field omitted ${label}.`);
  await page.screenshot({ path:path.join(out, `${browserName}-zero-artifact-case-arrival.png`), fullPage:true });

  await page.locator('.ash-flowcore-field:not([hidden]) [data-flowcore-ingress-play]').click();
  await page.waitForFunction(() => document.documentElement.dataset.ashFlowcorePhase === 'NAME');
  const activeMotion = await page.evaluate(() => {
    const field = document.querySelector('.ash-flowcore-field:not([hidden])');
    const rail = document.querySelector('#ashAiaMembrane .ash-ux-motion-track');
    return {
      field_animations:field?.getAnimations({ subtree:true }).length || 0,
      rail_animations:rail?.getAnimations({ subtree:true }).length || 0,
      phase:document.documentElement.dataset.ashFlowcorePhase,
      motion:window.__td613AshPostIngressMotionRestoration.current()
    };
  });
  assert(activeMotion.phase === 'NAME', 'Flow-Core relation phase never became visible.');
  assert(activeMotion.field_animations > 0, 'Flow-Core relation phase produced no visible finite animation.');
  assert(activeMotion.rail_animations > 0, 'One-dimensional lesson rail produced no visible finite animation.');
  assert(activeMotion.motion.canvas_visible && activeMotion.motion.rail_visible && !activeMotion.motion.field_clipped && !activeMotion.motion.rail_clipped, `Motion layers drifted during playback: ${JSON.stringify(activeMotion.motion)}.`);
  await page.waitForFunction(() => document.documentElement.dataset.ashFlowcorePhase === 'REST', null, { timeout:15_000 });
  const trace = await page.evaluate(() => window.__ashFlowcorePhaseTrace);
  const names = new Set(trace.map(item => item.phase_name));
  for (const name of ['NOTICE','ACT','WORLD_ANSWERS','NAME','REST']) assert(names.has(name), `Flow-Core trace omitted ${name}: ${JSON.stringify(trace)}.`);
  assert(trace.every(item => item.artifact_required === false), 'A Flow-Core frame falsely required an artifact.');

  await page.setViewportSize({ width:390, height:844 });
  const mobile = await page.evaluate(() => {
    const field = document.querySelector('.ash-flowcore-field:not([hidden])');
    const motion = window.__td613AshPostIngressMotionRestoration.refresh();
    return {
      overflow:Math.max(0, document.documentElement.scrollWidth - innerWidth),
      field_width:field?.getBoundingClientRect().width || 0,
      static_count:field?.querySelectorAll('.ash-flowcore-static li').length || 0,
      rest_visible:getComputedStyle(field.querySelector('.ash-flowcore-rest')).opacity !== '0',
      motion,
      portal:window.__td613AshFlowcoreIngressPortal.current()
    };
  });
  assert(mobile.overflow <= 2, `Mobile Flow-Core overflow: ${mobile.overflow}.`);
  assert(mobile.field_width > 320 && mobile.field_width <= 390, `Mobile field width invalid: ${mobile.field_width}.`);
  assert(mobile.static_count === 5 && mobile.rest_visible, 'Mobile/static Flow-Core parity incomplete.');
  assert(mobile.motion.canvas_visible && mobile.motion.rail_visible && !mobile.motion.field_clipped && !mobile.motion.rail_clipped, `Mobile motion layers are clipped or hidden: ${JSON.stringify(mobile.motion)}.`);
  assert(mobile.portal.visible_host === 'AIA' && mobile.portal.duplicate_visible_fields === 1, `Mobile AIA portal drifted: ${JSON.stringify(mobile.portal)}.`);
  await page.screenshot({ path:path.join(out, `${browserName}-flowcore-mobile-rest.png`), fullPage:true });

  await page.setViewportSize({ width:1440, height:1000 });
  await page.locator('#closeCase').click();
  await page.waitForFunction(() => {
    const launch = document.getElementById('launch');
    const style = launch ? getComputedStyle(launch) : null;
    const main = document.querySelector('body > main');
    const rail = document.querySelector('body > .workspace-rail');
    const portal = window.__td613AshFlowcoreIngressPortal?.current?.();
    const visible = document.querySelector('.ash-flowcore-field:not([hidden])');
    return !localStorage.getItem('td613.ash-keep.current-case')
      && window.__td613AshKeep?.current?.().case_id == null
      && document.documentElement.dataset.ashSessionOpen === 'false'
      && launch && !launch.classList.contains('hidden')
      && style?.display !== 'none' && style?.visibility !== 'hidden'
      && main?.hasAttribute('inert') && rail?.hasAttribute('inert')
      && portal?.visible_host === 'INGRESS'
      && portal?.duplicate_visible_fields === 1
      && visible?.parentElement?.id === 'guidedLaunchPromise';
  });
  await page.evaluate(() => {
    window.__td613AshIngressCopySpacing.refresh();
    window.__td613AshFlowcoreIngressPortal.refresh();
  });
  const ingressAfterClose = await page.evaluate(() => window.__td613AshIngressCopySpacing.measure());
  assert(ingressAfterClose.available && ingressAfterClose.ordered && ingressAfterClose.overlap_px === 0 && ingressAfterClose.overlap_area === 0, `Close-return ingress copy overlap: ${JSON.stringify(ingressAfterClose)}.`);
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
      boundary:window.__td613AshSessionBoundary.current(),
      portal:window.__td613AshFlowcoreIngressPortal.current()
    };
  }, caseId);
  assert(close.case_id == null && close.pointer == null && close.launch_visible && close.saved, `Close boundary failed: ${JSON.stringify(close)}.`);
  assert(close.portal.visible_host === 'INGRESS' && close.portal.duplicate_visible_fields === 1, `Close-return Flow-Core portal failed: ${JSON.stringify(close.portal)}.`);
  await page.screenshot({ path:path.join(out, `${browserName}-close-returns-ingress.png`), fullPage:true });

  assert(errors.length === 0, `Browser errors: ${errors.join(' | ')}`);
  assert(httpErrors.length === 0, `HTTP errors: ${httpErrors.join(' | ')}`);
  report.status = 'PASS';
  report.observations = { ingress_desktop:ingressDesktop, ingress_field:ingressField, ingress_mobile:ingressMobile, arrival, active_motion:activeMotion, phase_trace:trace, mobile, ingress_after_close:ingressAfterClose, close };
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
