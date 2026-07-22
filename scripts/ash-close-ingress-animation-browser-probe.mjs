import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const engines = { chromium, firefox, webkit };
const browserName = process.env.TD613_BROWSER || 'chromium';
const engine = engines[browserName];
if (!engine) throw new Error(`Unsupported browser: ${browserName}`);
const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-close-ingress-animation-${browserName}`);
const assert = (value, message) => { if (!value) throw new Error(message); };
const viewports = Object.freeze({ desktop:{ width:1440, height:1000 }, mobile:{ width:390, height:844 } });

async function visible(page, selector) {
  return page.locator(selector).evaluate(node => {
    const style = getComputedStyle(node), rect = node.getBoundingClientRect();
    return !node.hidden && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
  });
}

async function countSavedCase(page, caseId) {
  return page.evaluate(async id => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('td613-ash-keep');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const read = store => new Promise((resolve, reject) => {
        if (!db.objectStoreNames.contains(store)) return resolve(null);
        const request = db.transaction(store).objectStore(store).get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
      const [caseMap, savedCase] = await Promise.all([read('cases'), read('savedCases')]);
      return { case_present:Boolean(caseMap), saved_case_present:Boolean(savedCase), title:caseMap?.title || null };
    } finally { db.close(); }
  }, caseId);
}

async function clickDemoWithOptionalConfirmation(page) {
  await page.locator('#startDemo').click();
  const dialog = page.locator('[data-aia-confirm][open]');
  try {
    await dialog.waitFor({ state:'visible', timeout:1500 });
    await dialog.locator('button[value="confirm"]').click();
  } catch {}
}

async function runViewport(browser, label, viewport, report) {
  const context = await browser.newContext({ viewport, reducedMotion:'no-preference', locale:'en-US' });
  const page = await context.newPage();
  page.setDefaultTimeout(90_000);
  const consoleErrors = [], httpErrors = [];
  page.on('pageerror', error => consoleErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) httpErrors.push(`${response.status()} ${response.url()}`); });

  try {
    await page.goto(`${base}/dome-world/ash-keep.html?presentation=aia&close_ingress_probe=${Date.now()}`, { waitUntil:'domcontentloaded' });
    await page.waitForFunction(() => {
      const boundary = window.__td613AshCloseIngressAnimationBoundary?.current?.() || null;
      return window.__td613AshUiUxRescue?.version
        && window.__td613AshLiveAIA?.version
        && window.__td613AshProfileDemos?.version
        && boundary?.animation_artifact_required === false
        && document.documentElement.dataset.ashExplanationArtifactGate === 'NONE'
        && document.querySelector('[data-aia-play]')?.dataset.ashArtifactRequired === 'false'
        && document.getElementById('ashExplanationAvailability');
    }, null, { timeout:60_000 });

    const ingress = await page.evaluate(() => ({
      pointer:localStorage.getItem('td613.ash-keep.current-case'),
      launch_hidden:document.getElementById('launch')?.classList.contains('hidden'),
      note:document.getElementById('ashExplanationAvailability')?.textContent || '',
      artifact_gate:document.documentElement.dataset.ashExplanationArtifactGate,
      file_count:document.getElementById('localTextFile')?.files?.length || 0,
      boundary:window.__td613AshCloseIngressAnimationBoundary.current()
    }));
    assert(ingress.pointer === null, `${label}: stale active pointer at ingress.`);
    assert(ingress.artifact_gate === 'NONE' && /no artifact upload required/i.test(ingress.note), `${label}: animation still looks artifact-gated.`);
    assert(ingress.file_count === 0, `${label}: probe unexpectedly loaded an artifact.`);

    await page.locator('#newProfile').selectOption('research');
    await page.waitForFunction(() => {
      const button = document.getElementById('startDemo');
      return document.getElementById('newProfile')?.value === 'research' && button && !button.disabled && button.getAttribute('aria-busy') !== 'true';
    });
    await clickDemoWithOptionalConfirmation(page);
    await page.waitForFunction(() => {
      const id = localStorage.getItem('td613.ash-keep.current-case');
      return id
        && /Lumen Atlas Research Project/i.test(document.getElementById('caseTitle')?.textContent || '')
        && window.__td613AshCloseIngressAnimationBoundary?.current?.().session_open === true
        && document.getElementById('closeCase')?.disabled === false;
    }, null, { timeout:90_000 });

    const caseId = await page.evaluate(() => localStorage.getItem('td613.ash-keep.current-case'));
    const beforeClose = await countSavedCase(page, caseId);
    assert(beforeClose.case_present, `${label}: hydrated Research case was not persisted.`);

    const play = page.locator('[data-aia-play]');
    await play.scrollIntoViewIfNeeded();
    await play.click();
    await page.waitForFunction(() => document.documentElement.dataset.ashExplanationMotion === 'COMPLETE', null, { timeout:15_000 });
    const animation = await page.evaluate(() => ({
      trace:JSON.parse(document.documentElement.dataset.ashExplanationTrace || '[]'),
      motion:document.documentElement.dataset.ashExplanationMotion,
      file_count:document.getElementById('localTextFile')?.files?.length || 0,
      presentation:document.documentElement.dataset.ashExplanationPresentation
    }));
    assert([0,1,2,3].every(step => animation.trace.includes(step)), `${label}: four-step explanation trace incomplete ${JSON.stringify(animation.trace)}.`);
    assert(animation.file_count === 0, `${label}: explanation required or created a file selection.`);

    await page.locator('#closeCase').click();
    await page.waitForFunction(() => {
      const launch = document.getElementById('launch');
      const boundary = window.__td613AshCloseIngressAnimationBoundary?.current?.() || null;
      const main = document.querySelector('body > main');
      const rail = document.querySelector('body > .workspace-rail');
      const style = launch ? getComputedStyle(launch) : null;
      return !localStorage.getItem('td613.ash-keep.current-case')
        && window.__td613AshKeep?.current?.().case_id == null
        && document.documentElement.dataset.ashSessionOpen === 'false'
        && launch && !launch.classList.contains('hidden')
        && style?.display !== 'none' && style?.visibility !== 'hidden'
        && main?.hasAttribute('inert') && rail?.hasAttribute('inert')
        && boundary?.session_open === false
        && boundary?.launch_visible === true
        && boundary?.core_pointer_authoritative === true;
    }, null, { timeout:20_000 });

    const afterClose = await countSavedCase(page, caseId);
    assert(afterClose.case_present, `${label}: Close Case deleted the Research case.`);
    assert(afterClose.saved_case_present, `${label}: Close Case omitted the automatic close-boundary save record.`);
    assert(await visible(page, '#launch'), `${label}: ingress membrane remained hidden after Close Case.`);

    const closed = await page.evaluate(() => ({
      boundary:window.__td613AshCloseIngressAnimationBoundary.current(),
      core:window.__td613AshKeep.current(),
      launch_class:document.getElementById('launch')?.className || null,
      main_inert:document.querySelector('body > main')?.hasAttribute('inert'),
      rail_inert:document.querySelector('body > .workspace-rail')?.hasAttribute('inert'),
      note:document.getElementById('ashExplanationAvailability')?.textContent || '',
      selected_case_options:[...document.querySelectorAll('#selectCase option')].map(option => ({ value:option.value, label:option.textContent.trim() }))
    }));
    assert(closed.core.case_id == null, `${label}: stale in-memory case leaked through the public core view.`);
    assert(closed.selected_case_options.some(option => option.value === caseId), `${label}: saved case did not remain available at ingress.`);

    await page.screenshot({ path:path.join(out, `${browserName}-${label}-closed-ingress.png`), fullPage:true });
    assert(consoleErrors.length === 0, `${label}: console errors ${consoleErrors.join(' | ')}`);
    assert(httpErrors.length === 0, `${label}: HTTP errors ${httpErrors.join(' | ')}`);
    report.viewports[label] = { status:'PASS', ingress, case_id:caseId, before_close:beforeClose, animation, after_close:afterClose, closed };
  } catch (error) {
    report.viewports[label] = { status:'HOLD', message:error.message, stack:error.stack, console_errors:consoleErrors, http_errors:httpErrors };
    try { await page.screenshot({ path:path.join(out, `${browserName}-${label}-held.png`), fullPage:true }); } catch {}
    throw error;
  } finally { await context.close(); }
}

await fs.mkdir(out, { recursive:true });
const browser = await engine.launch({ headless:true });
const report = {
  schema:'td613.ash.close-ingress-animation-browser/v0.1',
  browser:browserName,
  status:'RUNNING',
  viewports:{},
  authority:{ artifact_upload_required_for_animation:false, case_deletion_authorized:false, automatic_action_authorized:false, recipient_transport:false, child_study_authorized:false }
};
let terminal = null;
try {
  for (const [label, viewport] of Object.entries(viewports)) await runViewport(browser, label, viewport, report);
  report.status = 'PASS';
} catch (error) {
  terminal = error;
  report.status = 'HOLD';
  report.hold_reason = error.message;
} finally {
  await browser.close();
  report.completed_at = new Date().toISOString();
  await fs.writeFile(path.join(out, 'ash-close-ingress-animation-browser.json'), `${JSON.stringify(report, null, 2)}\n`);
}
if (terminal) throw terminal;
console.log(JSON.stringify({ status:report.status, browser:browserName, viewports:Object.keys(report.viewports) }, null, 2));
