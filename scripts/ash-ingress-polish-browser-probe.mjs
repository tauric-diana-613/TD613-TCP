import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const engines = { chromium, firefox, webkit };
const browserName = process.env.TD613_BROWSER || 'chromium';
const engine = engines[browserName];
if (!engine) throw new Error(`Unsupported browser: ${browserName}`);
const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-ingress-polish-${browserName}`);
const assert = (value, message) => { if (!value) throw new Error(message); };
const canonicalPath = '/dome-world/ash-threshold.html';

await fs.mkdir(out, { recursive:true });
const browser = await engine.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:390, height:844 }, locale:'en-US', reducedMotion:'no-preference' });
const page = await context.newPage();
page.setDefaultTimeout(60_000);
const errors = [], httpErrors = [], navigations = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) httpErrors.push(`${response.status()} ${response.url()}`); });
page.on('framenavigated', frame => { if (frame === page.mainFrame()) navigations.push(frame.url()); });

async function openKeep() {
  await page.goto(`${base}${canonicalPath}`, { waitUntil:'domcontentloaded' });
}

const report = { schema:'td613.ash.first-paint-browser/v0.4', browser:browserName, status:'RUNNING', errors, http_errors:httpErrors, navigations, observations:{} };
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
  navigations.length = 0;
  await openKeep();
  await page.waitForFunction(() => window.__td613AshPostIngressMotionRestoration?.version
    && window.__td613AshFlowcoreIngressPortal?.version
    && document.documentElement.dataset.ashCompositionStable
    && document.documentElement.dataset.ashModuleGraph === 'ready'
    && document.getElementById('newProfile')
    && document.querySelector('.ash-flowcore-field:not([hidden]):not(.ash-flowcore-field--proxy)'));

  const ingress = await page.evaluate(() => {
    window.__td613AshPostIngressMotionRestoration.refresh();
    const select = document.getElementById('newProfile');
    const start = document.getElementById('startDemo');
    const field = document.querySelector('.ash-flowcore-field:not([hidden]):not(.ash-flowcore-field--proxy)');
    const svg = field?.querySelector('.ash-flowcore-field__canvas > svg');
    const caption = field?.querySelector('.ash-flowcore-field__caption');
    const svgRect = svg?.getBoundingClientRect();
    const captionRect = caption?.getBoundingClientRect();
    return {
      title:document.title,
      url:location.pathname + location.search,
      first_paint:window.__td613AshFirstPaintWitness,
      preflight:window.__td613AshAia3PreflightReceipt,
      preflight_state:document.documentElement.dataset.ashCachePreflight,
      module_graph:document.documentElement.dataset.ashModuleGraph,
      profile_value:select?.value,
      profile_prompt:select?.querySelector('option[value=""]')?.textContent,
      start_disabled:Boolean(start?.disabled),
      field_host:field?.dataset.flowcoreHost,
      svg_height:Math.round(svgRect?.height || 0),
      caption_height:Math.round(captionRect?.height || 0),
      caption_below_svg:Boolean(svgRect && captionRect && captionRect.top >= svgRect.bottom - 2),
      restoration:window.__td613AshPostIngressMotionRestoration.current(),
      preparing_shell_hidden:getComputedStyle(document.getElementById('td613-ash-preparing-shell')).display === 'none'
    };
  });
  assert(ingress.title === 'TD613 Ash', `Canonical title drifted: ${JSON.stringify(ingress)}.`);
  assert(ingress.url === canonicalPath, `Canonical URL drifted: ${JSON.stringify(ingress)}.`);
  assert(ingress.first_paint?.title === 'TD613 Ash', `First-paint title was not canonical: ${JSON.stringify(ingress.first_paint)}.`);
  assert(ingress.first_paint?.url === canonicalPath, `First-paint URL was not canonical: ${JSON.stringify(ingress.first_paint)}.`);
  assert(ingress.first_paint?.preparing_shell_present === true && ingress.first_paint?.legacy_composition_visible === false, `Preparing shell did not own first paint: ${JSON.stringify(ingress.first_paint)}.`);
  assert(ingress.preflight_state === 'complete' && ingress.module_graph === 'ready' && ingress.preparing_shell_hidden, `Canonical bootstrap did not complete: ${JSON.stringify(ingress)}.`);
  assert(navigations.length === 1, `Unexpected duplicate navigation: ${JSON.stringify(navigations)}.`);
  assert(navigations.every(url => !/ash_epoch|ash_recovered|asset_epoch|cache_nonce/.test(url)), `Visible epoch navigation occurred: ${JSON.stringify(navigations)}.`);
  assert(ingress.profile_value === '', `Ingress profile was not neutral: ${JSON.stringify(ingress)}.`);
  assert(ingress.profile_prompt === 'Select a Profile...', `Profile prompt missing: ${JSON.stringify(ingress)}.`);
  assert(ingress.start_disabled, 'Start Demo was enabled before a profile selection.');
  assert(ingress.field_host === 'ingress', `Flow-Core field was not at ingress: ${ingress.field_host}.`);
  assert(ingress.svg_height >= 260 && ingress.caption_height > 0 && ingress.caption_below_svg, `Ingress caption covers the diagram: ${JSON.stringify(ingress)}.`);
  assert(ingress.restoration.visible_proxy_count === 0 && ingress.restoration.caption_overlaps_svg === false, `Ingress restoration held: ${JSON.stringify(ingress.restoration)}.`);
  await page.screenshot({ path:path.join(out, `${browserName}-canonical-first-paint.png`), fullPage:true });

  await page.locator('#newProfile').selectOption('investigation');
  await page.evaluate(() => {
    const prior = document.getElementById('newProfile');
    const replacement = prior.cloneNode(true);
    replacement.value = '';
    replacement.removeAttribute('data-ash-canonical-profile-prompt-bound');
    replacement.removeAttribute('data-ash-profile-choice-explicit');
    prior.replaceWith(replacement);
    for (const type of ['aia-ready','aia3-ready','composition-stable']) {
      window.dispatchEvent(new CustomEvent(`td613:ash:${type}`, { detail:{ witness:'SELECTOR_REMOUNT' } }));
    }
  });
  await page.waitForFunction(() => document.getElementById('newProfile')?.value === 'investigation'
    && document.getElementById('startDemo')?.disabled === false
    && window.__td613AshProfilePromptCanonical?.current?.().explicit_choice === 'investigation');
  const selected = await page.evaluate(() => ({
    value:document.getElementById('newProfile')?.value,
    disabled:document.getElementById('startDemo')?.disabled,
    explicit_choice:window.__td613AshProfilePromptCanonical?.current?.().explicit_choice,
    remounted:true
  }));
  assert(selected.value === 'investigation' && selected.disabled === false && selected.explicit_choice === 'investigation', `Profile choice did not survive selector remount and composition refresh: ${JSON.stringify(selected)}.`);

  await page.locator('#newTitle').fill(`Ingress first paint ${browserName}`);
  await page.locator('#newCase').click();
  await page.waitForFunction(() => {
    const portal = window.__td613AshFlowcoreIngressPortal?.current?.();
    return Boolean(localStorage.getItem('td613.ash-keep.current-case'))
      && portal?.visible_host === 'AIA'
      && document.querySelector('.ash-flowcore-field:not([hidden]):not(.ash-flowcore-field--proxy)');
  });
  await page.evaluate(() => window.__td613AshPostIngressMotionRestoration.refresh());

  const workspace = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('.ash-flowcore-field')];
    const visible = nodes.filter(node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return !node.hidden && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    });
    const proxies = nodes.filter(node => node.classList.contains('ash-flowcore-field--proxy'));
    return {
      url:location.pathname+location.search,
      title:document.title,
      total_fields:nodes.length,
      visible_fields:visible.length,
      visible_proxy_fields:visible.filter(node => node.classList.contains('ash-flowcore-field--proxy')).length,
      proxy_hidden:proxies.every(node => node.hidden && getComputedStyle(node).display === 'none'),
      restoration:window.__td613AshPostIngressMotionRestoration.current(),
      portal:window.__td613AshFlowcoreIngressPortal.current(),
      overflow:Math.max(0, document.documentElement.scrollWidth - innerWidth)
    };
  });
  assert(workspace.url === canonicalPath && workspace.title === 'TD613 Ash', `Workspace lost canonical title or URL: ${JSON.stringify(workspace)}.`);
  assert(workspace.visible_fields === 1, `Expected one visible consequence field: ${JSON.stringify(workspace)}.`);
  assert(workspace.visible_proxy_fields === 0 && workspace.proxy_hidden, `Flow-Core proxy leaked into presentation: ${JSON.stringify(workspace)}.`);
  assert(workspace.restoration.visible_proxy_count === 0, `Restoration reports a visible proxy: ${JSON.stringify(workspace.restoration)}.`);
  assert(workspace.overflow <= 2, `Mobile overflow after canonical-field repair: ${workspace.overflow}.`);
  await page.screenshot({ path:path.join(out, `${browserName}-single-canonical-field.png`), fullPage:true });

  assert(errors.length === 0, `Browser errors: ${errors.join(' | ')}`);
  assert(httpErrors.length === 0, `HTTP errors: ${httpErrors.join(' | ')}`);
  report.status = 'PASS';
  report.observations = { ingress, selected, workspace };
} catch (error) {
  report.status = 'HOLD';
  report.hold = { message:error.message, stack:error.stack };
  try { await page.screenshot({ path:path.join(out, `${browserName}-held.png`), fullPage:true }); } catch {}
  throw error;
} finally {
  await fs.writeFile(path.join(out, 'ash-first-paint-browser.json'), `${JSON.stringify(report, null, 2)}\n`);
  await context.close();
  await browser.close();
}
console.log('ash-ingress-polish-browser-probe.mjs passed');
