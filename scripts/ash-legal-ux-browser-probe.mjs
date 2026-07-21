import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const engines = { chromium, firefox, webkit };
const browserName = process.env.TD613_BROWSER || 'chromium';
const engine = engines[browserName];
if (!engine) throw new Error(`Unsupported browser: ${browserName}`);
const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/,'');
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-legal-ux-${browserName}`);
const assert = (value, message) => { if (!value) throw new Error(message); };

async function clearAsh(page) {
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await new Promise(resolve => {
      const request = indexedDB.deleteDatabase('td613-ash-keep');
      request.onsuccess = request.onerror = request.onblocked = () => resolve();
    });
  });
}

async function workspaceGeometry(page, name) {
  return page.evaluate(value => {
    const panel = document.getElementById(`workspace-${value}`);
    const mast = document.querySelector('.mast');
    const context = document.querySelector('.premium-context-bar');
    const rail = document.querySelector('body > .workspace-rail');
    const visibleHeight = node => {
      if (!node) return 0;
      const style = getComputedStyle(node), rect = node.getBoundingClientRect();
      return style.display === 'none' || style.visibility === 'hidden' ? 0 : rect.height;
    };
    const rect = panel?.getBoundingClientRect();
    return {
      active: Boolean(panel?.classList.contains('active')),
      top: rect?.top ?? null,
      offset: visibleHeight(mast) + visibleHeight(context) + visibleHeight(rail) + 14,
      scrollY,
      target: document.documentElement.dataset.ashUxScrollTarget || null,
      premiumWorkspace: document.documentElement.dataset.ashPremiumWorkspace || null
    };
  }, name);
}

await fs.mkdir(out, { recursive: true });
const browser = await engine.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-US', reducedMotion: 'no-preference' });
const page = await context.newPage();
page.setDefaultTimeout(60_000);
const errors = [], httpErrors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) httpErrors.push(`${response.status()} ${response.url()}`); });
await page.addInitScript(() => {
  window.__ashCompositionTrace = [];
  const sample = () => {
    const root = document.documentElement;
    const children = document.body ? [...document.body.children].slice(0, 8).map(node => ({
      tag: node.tagName,
      id: node.id,
      visible: getComputedStyle(node).visibility !== 'hidden'
    })) : [];
    window.__ashCompositionTrace.push({ time: performance.now(), hydrating: root.dataset.ashCompositionHydrating || null, stable: root.dataset.ashCompositionStable || null, children });
  };
  new MutationObserver(sample).observe(document, { subtree: true, childList: true, attributes: true });
  addEventListener('DOMContentLoaded', sample);
});

const report = { schema: 'td613.ash.legal-ux-browser/v0.1', browser: browserName, status: 'RUNNING', errors, http_errors: httpErrors, observations: {} };
try {
  await page.goto(`${base}/dome-world/ash-keep.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.ashCompositionStable?.includes('stable-navigation-motion') && window.__td613AshLegalDemo?.version && window.__td613AshUiUxRescue?.version, null, { timeout: 60_000 });
  await clearAsh(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.ashCompositionStable?.includes('stable-navigation-motion') && window.__td613AshLegalDemo?.version && window.__td613AshUiUxRescue?.version, null, { timeout: 60_000 });

  const trace = await page.evaluate(() => window.__ashCompositionTrace);
  const hydrating = trace.filter(item => item.hydrating === 'true');
  assert(hydrating.length > 0, 'Composition veil was never observed.');
  assert(hydrating.every(item => item.children.every(child => child.visible === false)), 'A prior Ash composition became visible under the hydration veil.');
  assert(await page.locator('#launch').isVisible(), 'Canonical ingress did not become visible after stable release.');

  await page.locator('#newProfile').selectOption('legal');
  await page.waitForFunction(() => {
    const button = document.getElementById('startDemo');
    return document.getElementById('newProfile')?.value === 'legal'
      && button && !button.disabled
      && button.dataset.ashMethodDemoState === 'READY'
      && /Legal matter/.test(button.textContent || '');
  });
  await page.locator('#startDemo').click();
  await page.waitForFunction(() => document.documentElement.dataset.ashDemoProfile === 'legal'
    && document.getElementById('caseTitle')?.textContent?.includes('Cedar House Housing Matter')
    && document.documentElement.dataset.ashPremiumWorkspace === 'home');
  assert(await page.locator('#apeqPaiaMethodDocket').isVisible(), 'Legal method docket missing.');
  assert((await page.locator('#apeqPaiaMethodDocket').textContent()).includes('no legal advice'), 'Legal claim ceiling missing.');

  await page.locator('[data-premium-workspace="map"]').click();
  await page.waitForFunction(() => document.documentElement.dataset.ashUxScrollTarget === 'map');
  const map = await workspaceGeometry(page, 'map');
  assert(map.active, 'Map destination did not activate.');
  assert(map.premiumWorkspace === 'map', 'Map premium workspace state drifted.');
  assert(Math.abs(map.top - map.offset) < 140, `Map scrolled to ${map.top}, expected near ${map.offset}.`);
  assert(map.scrollY > 80, 'Map destination returned to the obstructing top panel.');

  await page.locator('[data-premium-workspace="work"]').click();
  await page.waitForFunction(() => document.documentElement.dataset.ashUxScrollTarget === 'work');
  const work = await workspaceGeometry(page, 'work');
  assert(work.active, 'Work destination did not activate.');
  assert(Math.abs(work.top - work.offset) < 140, `Work scrolled to ${work.top}, expected near ${work.offset}.`);

  const play = page.locator('[data-aia-play]');
  await play.scrollIntoViewIfNeeded();
  await play.click();
  await page.waitForFunction(() => document.documentElement.dataset.ashExplanationMotion === 'PLAYING');
  const first = await page.locator('.ash-ux-motion-track').getAttribute('data-step');
  await page.waitForTimeout(900);
  const second = await page.locator('.ash-ux-motion-track').getAttribute('data-step');
  assert(first !== second, 'Explanation animation did not visibly advance.');
  await page.waitForFunction(() => document.documentElement.dataset.ashExplanationMotion === 'COMPLETE', null, { timeout: 10_000 });
  assert(await page.locator('.ash-ux-motion-track').isVisible(), 'Visible explanation track missing.');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-premium-workspace="capsule"]').click();
  await page.waitForFunction(() => document.documentElement.dataset.ashUxScrollTarget === 'capsule');
  const mobile = await page.evaluate(() => ({
    overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
    dock: [...document.querySelectorAll('#premiumPrimaryDock button')].map(button => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }),
    clipped: [...document.querySelectorAll('button,input,select,textarea,a')].filter(node => {
      const rect = node.getBoundingClientRect(), style = getComputedStyle(node);
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
    }).map(node => node.id || node.textContent?.trim().slice(0, 30))
  }));
  assert(mobile.overflow === 0, `Mobile overflow: ${mobile.overflow}`);
  assert(mobile.dock.length === 5 && mobile.dock.every(item => item.height >= 48), 'Mobile dock targets regressed.');
  assert(mobile.clipped.length === 0, `Mobile controls clipped: ${mobile.clipped.join(', ')}`);

  await page.screenshot({ path: path.join(out, `${browserName}-legal-ux.png`), fullPage: true });
  assert(errors.length === 0, `Browser errors: ${errors.join(' | ')}`);
  assert(httpErrors.length === 0, `HTTP errors: ${httpErrors.join(' | ')}`);
  report.status = 'PASS';
  report.observations = { composition_samples: trace.length, hydrating_samples: hydrating.length, map, work, mobile, animation_steps: [first, second] };
} catch (error) {
  report.status = 'HOLD';
  report.hold = { message: error.message, stack: error.stack };
  try { await page.screenshot({ path: path.join(out, `${browserName}-legal-ux-held.png`), fullPage: true }); } catch {}
  throw error;
} finally {
  await fs.writeFile(path.join(out, 'ash-legal-ux-browser.json'), `${JSON.stringify(report, null, 2)}\n`);
  await context.close();
  await browser.close();
}
console.log('ash-legal-ux-browser-probe.mjs passed');
