import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const engines = { chromium, firefox, webkit };
const browserName = process.env.TD613_BROWSER || 'chromium';
const engine = engines[browserName];
if (!engine) throw new Error(`Unsupported browser: ${browserName}`);

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-reviewability-${browserName}`);
const assert = (value, message) => { if (!value) throw new Error(message); };
const isLocalWebkitWorkerNoise = value => browserName === 'webkit'
  && /^http:\/\/127\.0\.0\.1(?::\d+)?$/.test(base)
  && /Importing a module script failed|ash-keep-worker\.js due to access control checks/i.test(String(value || ''));

await fs.mkdir(out, { recursive:true });
const browser = await engine.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:390, height:844 }, locale:'en-US', reducedMotion:'no-preference' });
const page = await context.newPage();
page.setDefaultTimeout(60_000);

const errors = [];
const httpErrors = [];
page.on('pageerror', error => {
  if (!isLocalWebkitWorkerNoise(error.message)) errors.push(error.message);
});
page.on('console', message => {
  if (message.type() === 'error' && !isLocalWebkitWorkerNoise(message.text())) errors.push(message.text());
});
page.on('response', response => {
  if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) httpErrors.push(`${response.status()} ${response.url()}`);
});

async function openKeep() {
  const target = `${base}/dome-world/ash-keep.html?presentation=aia&reviewability=${Date.now()}`;
  try {
    await page.goto(target, { waitUntil:'domcontentloaded' });
  } catch (error) {
    if (!/NS_BINDING_ABORTED|ERR_ABORTED/i.test(String(error?.message || error))) throw error;
    await page.waitForLoadState('domcontentloaded').catch(() => {});
  }
}

const report = {
  schema:'td613.ash.reviewability-browser/v0.8-a6-work-arrival-diagnostics',
  browser:browserName,
  status:'RUNNING',
  errors,
  http_errors:httpErrors,
  observations:{}
};

const a6ArrivalSnapshot = () => page.evaluate(() => {
  const panel = document.getElementById('workspace-work');
  const target = document.getElementById('ashA6LocalDocumentSurface');
  const style = panel ? getComputedStyle(panel) : null;
  const rect = target?.getBoundingClientRect();
  const receipt = window.__td613AshA6Affordances?.current?.()?.last_navigation_receipt || null;
  const panelActive = Boolean(panel?.classList.contains('active'));
  const panelVisible = Boolean(panel && style?.display !== 'none' && style?.visibility !== 'hidden' && Number(style?.opacity ?? 1) > 0);
  const targetVisible = Boolean(rect?.height > 0);
  const focusSettled = document.activeElement?.id === 'ashA6ChooseLocalDocument';
  const receiptSettled = receipt?.destination_anchor === 'ashA6LocalDocumentSurface';
  return {
    workspace:document.documentElement.dataset.ashPremiumWorkspace || null,
    panel_active:panelActive,
    panel_visible:panelVisible,
    panel_display:style?.display || null,
    panel_visibility:style?.visibility || null,
    panel_opacity:Number(style?.opacity ?? 1),
    target_height:Math.round(rect?.height || 0),
    target_visible:targetVisible,
    focused:document.activeElement?.id || null,
    focus_settled:focusSettled,
    receipt,
    receipt_settled:receiptSettled,
    settled:panelActive && panelVisible && targetVisible && focusSettled && receiptSettled
  };
});

const classifyA6ArrivalHold = snapshot => {
  if (!snapshot?.panel_active) return 'A6_WORKSPACE_NOT_ACTIVE';
  if (!snapshot?.panel_visible) return 'A6_WORKSPACE_NOT_VISIBLE';
  if (!snapshot?.target_visible) return 'A6_LOCAL_DOCUMENT_SURFACE_NOT_VISIBLE';
  if (!snapshot?.focus_settled) return 'A6_LOCAL_DOCUMENT_FOCUS_NOT_SETTLED';
  if (!snapshot?.receipt_settled) return 'A6_NAVIGATION_RECEIPT_NOT_SETTLED';
  return 'A6_WORK_ARRIVAL_TIMEOUT_UNCLASSIFIED';
};

try {
  await openKeep();
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await new Promise(resolve => {
      const request = indexedDB.deleteDatabase('td613-ash-keep');
      request.onsuccess = request.onerror = request.onblocked = () => resolve();
    });
  });
  await openKeep();

  await page.waitForFunction(() => window.__td613AshReviewability?.version
    && window.__td613AshPostIngressMotionRestoration?.version
    && document.documentElement.dataset.ashCompositionStable
    && document.querySelector('#ashAiaMembrane .ash-aia__work')
    && document.getElementById('newProfile'));

  const ingress = await page.evaluate(() => {
    window.__td613AshReviewability.refresh();
    const work = document.querySelector('#ashAiaMembrane .ash-aia__work');
    const button = work?.querySelector('[data-aia-primary-task]');
    return {
      receipt:window.__td613AshReviewability.current(),
      fallback:button?.dataset.ashReviewabilityFallback || null,
      button_disabled:Boolean(button?.disabled),
      button_aria_disabled:button?.getAttribute('aria-disabled') || null,
      launch_visible:Boolean(document.getElementById('launch') && getComputedStyle(document.getElementById('launch')).display !== 'none')
    };
  });
  assert(ingress.receipt.panel_posture === 'SETUP_READY', `Ingress setup posture held: ${JSON.stringify(ingress)}.`);
  assert(ingress.fallback === 'setup' && !ingress.button_disabled && ingress.button_aria_disabled === 'false', `Ingress setup action was not prepared: ${JSON.stringify(ingress)}.`);
  assert(ingress.launch_visible, `Ingress membrane was not visible: ${JSON.stringify(ingress)}.`);

  await page.locator('#newProfile').selectOption('investigation');
  await page.locator('#newTitle').fill(`Reviewability ${browserName}`);
  await page.locator('#newCase').click();
  await page.waitForFunction(() => Boolean(localStorage.getItem('td613.ash-keep.current-case'))
    && window.__td613AshReviewability?.current?.()?.case_open === true);
  await page.waitForFunction(() => document.getElementById('ashAiaTitle')?.textContent?.trim() === 'Your case path'
    && document.querySelector('#ashAiaMembrane .ash-aia__posture')?.textContent?.trim() === 'See what stays local, what may change, and where a human decision is still required.'
    && document.querySelector('#ashDemoPedagogyLedger h3')?.textContent?.trim() === 'Preserve before alleging.');
  await page.evaluate(async () => {
    window.__td613AshDemoRegistry?.reconcile?.();
    window.__td613AshReviewability?.refresh?.();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.waitForFunction(() => {
    const registry = window.__td613AshDemoRegistry?.snapshot?.();
    return registry?.control_owner === 'ASH_DEMO_REGISTRY'
      && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
      && document.getElementById('ashAiaTitle')?.textContent?.trim() === 'Your case path'
      && document.querySelector('#ashAiaMembrane .ash-aia__posture')?.textContent?.trim() === 'See what stays local, what may change, and where a human decision is still required.'
      && document.querySelector('#ashDemoPedagogyLedger h3')?.textContent?.trim() === 'Preserve before alleging.';
  }, null, { timeout:120_000 });

  const activeCase = await page.evaluate(() => {
    const work = document.querySelector('#ashAiaMembrane .ash-aia__work');
    const button = work?.querySelector('[data-aia-primary-task]');
    const style = work ? getComputedStyle(work) : null;
    const rect = work?.getBoundingClientRect();
    return {
      receipt:window.__td613AshReviewability.current(),
      route_subtitle:document.querySelector('#ashAiaMembrane .ash-aia__posture')?.textContent?.trim() || '',
      note_present:Boolean(work?.querySelector('.ash-reviewability-setup-note')),
      button_fallback:button?.dataset.ashReviewabilityFallback || null,
      button_label:button?.textContent?.trim() || null,
      work_visible:Boolean(work && style?.display !== 'none' && style?.visibility !== 'hidden' && Number(style?.opacity ?? 1) > 0 && rect?.width > 0 && rect?.height > 0),
      work_height:Math.round(rect?.height || 0)
    };
  });
  assert(activeCase.work_visible, `Post-ingress setup/work card was not visible: ${JSON.stringify(activeCase)}.`);
  assert(activeCase.receipt.panel_posture === 'CASE_ACTIVE', `Active case retained setup posture: ${JSON.stringify(activeCase.receipt)}.`);
  assert(!/^Set up\b/i.test(activeCase.receipt.panel_title || ''), `Active case retained stale setup title: ${JSON.stringify(activeCase.receipt)}.`);
  assert(activeCase.receipt.panel_button_actionable, `Active case action button remained dead: ${JSON.stringify(activeCase.receipt)}.`);
  assert(!activeCase.note_present, `Setup-only note leaked into active case: ${JSON.stringify(activeCase)}.`);
  assert((activeCase.receipt.panel_unused_space ?? 999) <= 90, `Active panel retained excessive negative space: ${JSON.stringify(activeCase.receipt)}.`);
  assert(activeCase.route_subtitle === 'See what stays local, what may change, and where a human decision is still required.', `A5 route subtitle drifted: ${JSON.stringify(activeCase)}.`);

  const authoredTitles = await page.evaluate(() => {
    const clearance = node => {
      if (!node) return null;
      const style = getComputedStyle(node);
      return {
        text:node.textContent.trim(),
        font_size:parseFloat(style.fontSize) || 0,
        line_height:parseFloat(style.lineHeight) || 0,
        padding_bottom:parseFloat(style.paddingBottom) || 0,
        client_height:node.clientHeight,
        scroll_height:node.scrollHeight,
        clipped:node.scrollHeight > node.clientHeight + 1
      };
    };
    return {
      aia_title:clearance(document.querySelector('#ashAiaMembrane #ashAiaTitle')),
      pedagogy_title:clearance(document.querySelector('#ashDemoPedagogyLedger h3'))
    };
  });

  for (const [name, title, expected] of [
    ['aia_title', authoredTitles.aia_title, 'Your case path'],
    ['pedagogy_title', authoredTitles.pedagogy_title, 'Preserve before alleging.']
  ]) {
    assert(title?.text === expected, `${name} did not carry its authored A5 title: ${JSON.stringify(title)}.`);
    assert(title.clipped === false, `${name} clipped its line box: ${JSON.stringify(title)}.`);
    assert(title.line_height >= title.font_size * 1.12, `${name} line box is too tight: ${JSON.stringify(title)}.`);
    assert(title.padding_bottom > 0, `${name} lacks descender clearance: ${JSON.stringify(title)}.`);
  }

  const a6ArrivalBefore = await a6ArrivalSnapshot();
  await page.locator('[data-aia-primary-task]').click();
  try {
    await page.waitForFunction(() => {
      const panel = document.getElementById('workspace-work');
      const target = document.getElementById('ashA6LocalDocumentSurface');
      const style = panel ? getComputedStyle(panel) : null;
      const rect = target?.getBoundingClientRect();
      return panel?.classList.contains('active')
        && style?.display !== 'none'
        && style?.visibility !== 'hidden'
        && Number(style?.opacity ?? 1) > 0
        && rect?.height > 0
        && document.activeElement?.id === 'ashA6ChooseLocalDocument'
        && window.__td613AshA6Affordances?.current?.()?.last_navigation_receipt?.destination_anchor === 'ashA6LocalDocumentSurface';
    });
  } catch (error) {
    const a6ArrivalHold = await a6ArrivalSnapshot().catch(() => null);
    report.observations.a6_arrival_before = a6ArrivalBefore;
    report.observations.a6_arrival_hold = a6ArrivalHold;
    report.a6_arrival_hold_classification = classifyA6ArrivalHold(a6ArrivalHold);
    throw error;
  }
  const a6WorkArrival = await page.evaluate(() => ({
    workspace:document.documentElement.dataset.ashPremiumWorkspace,
    focused:document.activeElement?.id || null,
    receipt:window.__td613AshA6Affordances?.current?.()?.last_navigation_receipt || null,
    authority_changed:window.__td613AshA6Affordances?.current?.()?.authority_changed,
    source_bytes_moved:window.__td613AshA6Affordances?.current?.()?.source_bytes_moved
  }));
  assert(a6WorkArrival.workspace === 'work', `A6 primary action missed Work: ${JSON.stringify(a6WorkArrival)}.`);
  assert(a6WorkArrival.focused === 'ashA6ChooseLocalDocument', `A6 primary action missed the local-document focus target: ${JSON.stringify(a6WorkArrival)}.`);
  assert(a6WorkArrival.receipt?.result === 'ARRIVED', `A6 primary action produced no navigation receipt: ${JSON.stringify(a6WorkArrival)}.`);
  assert(a6WorkArrival.authority_changed === false && a6WorkArrival.source_bytes_moved === false, `A6 Work arrival widened authority or transport: ${JSON.stringify(a6WorkArrival)}.`);

  await page.evaluate(() => window.__td613AshPremiumUI?.open?.('home'));
  await page.waitForFunction(() => document.getElementById('workspace-home')?.classList.contains('active'));
  await page.waitForTimeout(500);

  const deep = await page.evaluate(() => {
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const target = Math.max(0, Math.min(max - 50, Math.max(520, Math.round(max * .62))));
    window.scrollTo({ top:target, behavior:'auto' });
    return { max, target };
  });
  assert(deep.max > 650 && deep.target > 400, `Ash page was not deep enough for a reviewability witness: ${JSON.stringify(deep)}.`);
  await page.waitForTimeout(200);
  await page.evaluate(() => window.__td613AshReviewability.claimViewport('WITNESS_MANUAL_REVIEW'));
  const ownedY = await page.evaluate(() => window.scrollY);
  assert(ownedY > 350, `Witness never reached a deep review position: ${ownedY}.`);

  await page.evaluate(() => {
    window.__td613AshUiUxRescue?.scrollTo?.('home');
    window.dispatchEvent(new CustomEvent('td613:ash:case-opened', { detail:{ source:'REVIEWABILITY_WITNESS' } }));
  });
  await page.waitForTimeout(2300);

  const sustained = await page.evaluate(expected => ({
    expected,
    scroll_y:window.scrollY,
    delta:Math.abs(window.scrollY - expected),
    receipt:window.__td613AshReviewability.current(),
    posture:document.documentElement.dataset.ashScrollPosture,
    owner:document.documentElement.dataset.ashViewportOwner
  }), ownedY);
  assert(sustained.scroll_y > 300, `Background Ash refresh returned review to the masthead: ${JSON.stringify(sustained)}.`);
  assert(sustained.delta <= 90, `Background Ash refresh moved the entrant-owned viewport: ${JSON.stringify(sustained)}.`);
  assert(sustained.receipt.blocked_scrolls >= 1, `Scroll guard recorded no blocked background reset: ${JSON.stringify(sustained)}.`);
  assert(sustained.receipt.viewport_owner === 'ENTRANT' && sustained.owner === 'ENTRANT', `Entrant lost viewport ownership: ${JSON.stringify(sustained)}.`);

  await page.screenshot({ path:path.join(out, `${browserName}-deep-review-stable.png`), fullPage:false });
  await page.screenshot({ path:path.join(out, `${browserName}-reviewability-full.png`), fullPage:true });

  assert(errors.length === 0, `Browser errors: ${errors.join(' | ')}`);
  assert(httpErrors.length === 0, `HTTP errors: ${httpErrors.join(' | ')}`);
  report.status = 'PASS';
  report.observations = { ingress, active_case:activeCase, authored_titles:authoredTitles, a6_arrival_before:a6ArrivalBefore, a6_work_arrival:a6WorkArrival, deep, sustained };
} catch (error) {
  report.status = 'HOLD';
  report.hold = { message:error.message, stack:error.stack };
  try { await page.screenshot({ path:path.join(out, `${browserName}-held.png`), fullPage:true }); } catch {}
  throw error;
} finally {
  await fs.writeFile(path.join(out, 'ash-reviewability-browser.json'), `${JSON.stringify(report, null, 2)}\n`);
  await context.close();
  await browser.close();
}

console.log('ash-reviewability-browser-probe.mjs passed');
