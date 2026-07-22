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

await fs.mkdir(out, { recursive:true });
const browser = await engine.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:390, height:844 }, locale:'en-US', reducedMotion:'no-preference' });
const page = await context.newPage();
page.setDefaultTimeout(60_000);
const errors = [], httpErrors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) httpErrors.push(`${response.status()} ${response.url()}`); });

const report = { schema:'td613.ash.ingress-polish-browser/v0.1', browser:browserName, status:'RUNNING', errors, http_errors:httpErrors, observations:{} };
try {
  await page.goto(`${base}/dome-world/ash-keep.html?presentation=aia&nonce=${Date.now()}`, { waitUntil:'domcontentloaded' });
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await new Promise(resolve => {
      const request = indexedDB.deleteDatabase('td613-ash-keep');
      request.onsuccess = request.onerror = request.onblocked = () => resolve();
    });
  });
  await page.goto(`${base}/dome-world/ash-keep.html?presentation=aia&nonce=${Date.now()}`, { waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => window.__td613AshPostIngressMotionRestoration?.version
    && window.__td613AshFlowcoreIngressPortal?.version
    && document.documentElement.dataset.ashCompositionStable
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
      profile_value:select?.value,
      profile_prompt:select?.querySelector('option[value=""]')?.textContent,
      start_disabled:Boolean(start?.disabled),
      field_host:field?.dataset.flowcoreHost,
      svg_height:Math.round(svgRect?.height || 0),
      caption_height:Math.round(captionRect?.height || 0),
      caption_below_svg:Boolean(svgRect && captionRect && captionRect.top >= svgRect.bottom - 2),
      restoration:window.__td613AshPostIngressMotionRestoration.current(),
      url:location.pathname + location.search
    };
  });
  assert(ingress.profile_value === '', `Ingress profile was not neutral: ${JSON.stringify(ingress)}.`);
  assert(ingress.profile_prompt === 'Select a Profile...', `Profile prompt missing: ${JSON.stringify(ingress)}.`);
  assert(ingress.start_disabled, 'Start Demo was enabled before a profile selection.');
  assert(ingress.field_host === 'ingress', `Flow-Core field was not at ingress: ${ingress.field_host}.`);
  assert(ingress.svg_height >= 260 && ingress.caption_height > 0 && ingress.caption_below_svg, `Ingress caption covers the diagram: ${JSON.stringify(ingress)}.`);
  assert(ingress.restoration.visible_proxy_count === 0 && ingress.restoration.caption_overlaps_svg === false, `Ingress restoration held: ${JSON.stringify(ingress.restoration)}.`);
  await page.screenshot({ path:path.join(out, `${browserName}-ingress-caption-clear.png`), fullPage:true });

  await page.locator('#newProfile').selectOption('investigation');
  const selected = await page.evaluate(() => ({ value:document.getElementById('newProfile')?.value, disabled:document.getElementById('startDemo')?.disabled }));
  assert(selected.value === 'investigation' && selected.disabled === false, `Profile selection did not enable demo: ${JSON.stringify(selected)}.`);

  await page.locator('#newTitle').fill(`Ingress polish ${browserName}`);
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
      total_fields:nodes.length,
      visible_fields:visible.length,
      visible_proxy_fields:visible.filter(node => node.classList.contains('ash-flowcore-field--proxy')).length,
      proxy_hidden:proxies.every(node => node.hidden && getComputedStyle(node).display === 'none'),
      restoration:window.__td613AshPostIngressMotionRestoration.current(),
      portal:window.__td613AshFlowcoreIngressPortal.current(),
      overflow:Math.max(0, document.documentElement.scrollWidth - innerWidth)
    };
  });
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
  await fs.writeFile(path.join(out, 'ash-ingress-polish-browser.json'), `${JSON.stringify(report, null, 2)}\n`);
  await context.close();
  await browser.close();
}
console.log('ash-ingress-polish-browser-probe.mjs passed');
