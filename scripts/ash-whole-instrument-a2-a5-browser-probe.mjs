import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = process.env.TD613_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new Error(`Unsupported browser: ${browserName}`);
const baseUrl = (process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const artifactDir = process.env.TD613_ARTIFACT_DIR || `artifacts/ash-a2-a5-${browserName}`;
await fs.mkdir(artifactDir, { recursive: true });
const browser = await browserType.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'no-preference' });
const consoleErrors = [];
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => consoleErrors.push(error.message));
const report = { schema: 'td613.ash.a2-a5-browser-observation/v0.1', browser: browserName, status: 'HOLD_FOR_REPAIR', observations: {} };
try {
  await page.goto(`${baseUrl}/dome-world/ash-threshold.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.ashA2A5Ready === 'true', null, { timeout: 30000 });
  await page.waitForSelector('.ash-flowcore-field');
  report.observations.initial = await page.evaluate(() => ({
    fieldCount: document.querySelectorAll('.ash-flowcore-field').length,
    eyebrow: document.querySelector('.ash-aia__eyebrow')?.textContent?.trim(),
    playLabels: [...document.querySelectorAll('[data-aia-play],[data-a2-a5-play]')].map(node => node.textContent.trim()),
    routeLabels: [...document.querySelectorAll('[data-aia-route]')].map(node => node.textContent.trim()),
    channelCount: document.querySelectorAll('[data-flowcore-channel]').length,
    staticParity: document.querySelector('.ash-flowcore-field')?.dataset?.a2A5StaticParity || null
  }));
  await page.evaluate(() => document.querySelector('[data-premium-workspace="home"]')?.click());
  await page.waitForFunction(() => document.documentElement.dataset.ashA2A5Workspace === 'home');
  report.observations.home = await page.evaluate(() => ({
    workspace: document.querySelector('.ash-flowcore-field')?.dataset?.a2A5Workspace,
    scene: document.querySelector('.ash-flowcore-field')?.dataset?.a2A5Scene,
    receipt: window.__td613AshWholeInstrumentA2A5?.current?.().last_navigation_receipt || null
  }));
  for (const route of ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']) {
    await page.evaluate(value => document.querySelector(`[data-aia-route="${value}"]`)?.click(), route);
    await page.waitForFunction(value => document.querySelector('[data-a2-a5-route-surface]')?.dataset?.route === value, route);
  }
  report.observations.routes = await page.evaluate(() => ({
    selected: document.querySelector('[data-a2-a5-route-surface]')?.dataset?.route,
    delta: document.querySelector('.ash-a2-a5-route-delta')?.textContent?.replace(/\s+/g, ' ').trim(),
    api: window.__td613AshWholeInstrumentA2A5?.current?.() || null
  }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  report.observations.reducedMotion = await page.evaluate(() => ({
    staticVisible: getComputedStyle(document.querySelector('.ash-flowcore-static')).display,
    parity: document.querySelector('.ash-flowcore-field')?.dataset?.a2A5StaticParity,
    menuAnimation: getComputedStyle(document.querySelector('#premiumMenuButton')).animationName
  }));
  if (report.observations.initial.fieldCount !== 1) throw new Error('Canonical field count drifted.');
  if (report.observations.initial.eyebrow !== 'Your case path') throw new Error('Human-facing title did not compile.');
  if (!report.observations.initial.playLabels.every(label => label.startsWith('▶'))) throw new Error('Canonical Play gesture lacks ▶.');
  if (report.observations.initial.channelCount !== 5) throw new Error('Five-channel legend did not compile.');
  if (report.observations.home.receipt?.result !== 'ARRIVED') throw new Error('Semantic navigation receipt absent.');
  if (report.observations.routes.selected !== 'IMPLEMENTATION') throw new Error('Explicit route selection did not visibly recompile.');
  if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(' | ')}`);
  report.status = 'PASS';
} catch (error) {
  report.error = error.stack || error.message;
} finally {
  report.console_errors = consoleErrors;
  await page.screenshot({ path: path.join(artifactDir, 'a2-a5-final.png'), fullPage: true }).catch(() => {});
  await fs.writeFile(path.join(artifactDir, 'ash-a2-a5-browser-observation.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}
if (report.status !== 'PASS') throw new Error(report.error || 'A2-A5 browser observation held.');
console.log(JSON.stringify(report, null, 2));
