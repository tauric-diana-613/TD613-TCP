// Read-only baseline trigger: the durable rescue workflow removes staged controller material before review.
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'https://td613.com').replace(/\/$/, '');
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-aia2-production-diagnosis');
const profiles = [
  { id: 'desktop', viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
  { id: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
];

await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = {
  schema: 'td613.ash.aia2.production-diagnosis/v0.1',
  base_url: base,
  observed_at: new Date().toISOString(),
  profiles: {},
  authority: { application_mutated: false, deployment_invoked: false, observation_only: true }
};

for (const profile of profiles) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    isMobile: profile.isMobile,
    hasTouch: profile.hasTouch,
    reducedMotion: 'no-preference',
    colorScheme: 'dark'
  });
  const page = await context.newPage();
  const ledger = { console_errors: [], page_errors: [], failed_requests: [], samples: [], actions: [] };
  page.on('console', message => { if (message.type() === 'error') ledger.console_errors.push(message.text()); });
  page.on('pageerror', error => ledger.page_errors.push(error.message));
  page.on('requestfailed', request => ledger.failed_requests.push({ url: request.url(), reason: request.failure()?.errorText || 'unknown' }));

  await page.goto(`${base}/dome-world/ash-keep.html?diagnostic=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  const sample = async label => {
    const state = await page.evaluate(labelValue => {
      const visible = element => {
        if (!element) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
      };
      const rect = element => element ? (() => { const r = element.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }; })() : null;
      const selectors = {
        membrane: '#ashAiaMembrane', launch: '#launch', launch_panel: '#launch .launch-panel', main: 'body > main',
        workspace_rail: 'body > .workspace-rail', profile: '#newProfile', new_case: '#newCase', demo: '#startDemo',
        local_file: '#localTextFile', open_workspace: '[data-aia-open-workspace]', play: '[data-aia-play]', route_experiential: '[data-aia-route="EXPERIENTIAL"]'
      };
      const elements = Object.fromEntries(Object.entries(selectors).map(([key, selector]) => {
        const node = document.querySelector(selector);
        return [key, { present: Boolean(node), visible: visible(node), rect: rect(node), display: node ? getComputedStyle(node).display : null, pointer_events: node ? getComputedStyle(node).pointerEvents : null }];
      }));
      const points = [
        ['center', innerWidth / 2, innerHeight / 2], ['top-center', innerWidth / 2, 90], ['lower-center', innerWidth / 2, innerHeight * .75]
      ].map(([name, x, y]) => {
        const stack = document.elementsFromPoint(x, y).slice(0, 6).map(node => ({ tag: node.tagName, id: node.id || null, class: typeof node.className === 'string' ? node.className : null }));
        return { name, x: Math.round(x), y: Math.round(y), stack };
      });
      return {
        label: labelValue,
        url: location.href,
        body_route: document.body.dataset.ashAiaRoute || null,
        body_held: document.body.dataset.ashAiaHeld || null,
        lifecycle: document.body.dataset.ashLifecycle || null,
        document_height: document.documentElement.scrollHeight,
        document_width: document.documentElement.scrollWidth,
        viewport: { width: innerWidth, height: innerHeight },
        elements,
        points,
        focused: document.activeElement ? { tag: document.activeElement.tagName, id: document.activeElement.id || null } : null,
        live_text: document.querySelector('[data-aia-live]')?.textContent?.trim() || null,
        first_heading: document.querySelector('h1,h2')?.textContent?.trim() || null
      };
    }, label);
    ledger.samples.push(state);
  };

  await sample('domcontentloaded');
  await page.screenshot({ path: path.join(out, `${profile.id}-000ms.png`), fullPage: true });
  for (const [delay, label] of [[100, '100ms'], [300, '300ms'], [700, '700ms'], [1500, '1500ms'], [3000, '3000ms'], [5000, '5000ms']]) {
    await page.waitForTimeout(delay - (ledger.lastDelay || 0));
    ledger.lastDelay = delay;
    await sample(label);
  }
  delete ledger.lastDelay;
  await page.screenshot({ path: path.join(out, `${profile.id}-5000ms.png`), fullPage: true });

  const tryAction = async (name, selector) => {
    const locator = page.locator(selector).first();
    const count = await locator.count();
    if (!count) { ledger.actions.push({ name, selector, result: 'ABSENT' }); return; }
    const visible = await locator.isVisible().catch(() => false);
    const enabled = await locator.isEnabled().catch(() => false);
    if (!visible || !enabled) { ledger.actions.push({ name, selector, result: 'UNAVAILABLE', visible, enabled }); return; }
    try {
      await locator.click({ timeout: 5000 });
      await page.waitForTimeout(250);
      ledger.actions.push({ name, selector, result: 'CLICKED', url: page.url() });
      await sample(`after-${name}`);
    } catch (error) {
      ledger.actions.push({ name, selector, result: 'CLICK_FAILED', error: error.message });
    }
  };

  await tryAction('open-local-case-setup', '.ash-aia__launch-button');
  await tryAction('new-case', '#newCase');
  await tryAction('open-exact-workspace', '[data-aia-open-workspace]');
  await tryAction('play-explanation', '[data-aia-play]');
  await page.screenshot({ path: path.join(out, `${profile.id}-after-actions.png`), fullPage: true });

  report.profiles[profile.id] = ledger;
  await context.close();
}

await browser.close();
await fs.writeFile(path.join(out, 'diagnosis.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ status: 'OBSERVED', artifact: path.join(out, 'diagnosis.json') }, null, 2));
