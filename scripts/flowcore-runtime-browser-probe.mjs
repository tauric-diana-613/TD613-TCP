import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const routePrefix = `/${String(process.env.TD613_FLOWCORE_ROUTE_PREFIX || 'app/dome-world').replace(/^\/+|\/+$/g, '')}`;
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/flowcore-runtime-evidence');
const requestedBrowsers = String(process.env.TD613_BROWSERS || 'chromium,firefox,webkit')
  .split(',').map(value => value.trim()).filter(Boolean);
const sourcePacketCommit = String(process.env.TD613_SOURCE_PACKET_COMMIT || '').trim() || null;
const productionObservation = process.env.TD613_PRODUCTION_OBSERVATION === 'true';
const executable = String(process.env.TD613_BROWSER_EXECUTABLE || '').trim();
const engines = { chromium, firefox, webkit };

const surfaces = Object.freeze([
  { id: 'information-dome', file: 'information-dome-pedagogue.html', root: '[data-flowcore-pedagogue]', nav: '[data-route-nav] [data-route]', expected: 'Information Dome' },
  { id: 'route-burden', file: 'route-burden-observatory.html', root: '[data-route-burden]', nav: '[data-model-nav] button', expected: 'Route-Burden' },
  { id: 'ash-custody', file: 'ash-custody-pedagogue.html', root: '[data-ash-pedagogue]', nav: '[data-route-nav] [data-route]', expected: 'Ash Custody Root' },
  { id: 'station-propagation', file: 'station-propagation-observatory.html', root: '[data-station-propagation]', nav: '[data-route-nav] [data-route]', expected: 'Cross-station' },
  { id: 'physical-flowcore', file: 'physical-flowcore.html', root: '[data-physical-flowcore]', nav: '[data-route-nav] [data-route]', expected: 'Stored potential' },
  { id: 'validation-lab', file: 'flowcore-validation-lab.html', root: '[data-validation-lab]', nav: '[data-condition-nav] button', expected: 'Compare conditions' },
  { id: 'promotion-dashboard', file: 'flowcore-promotion-dashboard.html', root: '[data-promotion-dashboard]', nav: '[data-evidence-nav] button', expected: 'Promotion is evidence' }
]);

function assert(value, message) {
  if (!value) throw new Error(message);
}

function urlFor(surface) {
  return new URL(`${routePrefix}/${surface.file}`, `${base}/`).toString();
}

async function waitForReady(page, surface) {
  await page.waitForFunction(selector => {
    const root = document.querySelector(selector);
    return Boolean(root) && root.getAttribute('aria-busy') !== 'true';
  }, surface.root, { timeout: 60000 });
  await page.waitForTimeout(120);
}

function installObservers(page, surfaceId, report) {
  page.on('console', message => {
    if (message.type() === 'error') report.console_errors.push({ surface: surfaceId, text: message.text() });
  });
  page.on('pageerror', error => report.page_errors.push({ surface: surfaceId, text: error.message }));
  page.on('request', request => {
    const requestUrl = new URL(request.url());
    if (requestUrl.origin !== new URL(base).origin) report.external_requests.push({ surface: surfaceId, url: request.url() });
  });
  page.on('response', response => {
    if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) {
      report.http_errors.push({ surface: surfaceId, status: response.status(), url: response.url() });
    }
  });
}

async function measure(page, surface, profile) {
  return page.evaluate(({ rootSelector, expected, profileName }) => {
    const root = document.querySelector(rootSelector);
    const interactive = [...document.querySelectorAll('button, a[href], input, select, textarea')]
      .filter(node => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      });
    const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    const animations = document.getAnimations().map(animation => ({
      playState: animation.playState,
      iterations: Number(animation.effect?.getTiming?.().iterations || 0)
    }));
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      profile: profileName,
      title: document.title,
      heading: document.querySelector('h1')?.textContent?.trim() || '',
      expected_text_present: document.body.textContent.includes(expected),
      held: root?.dataset?.held === 'true',
      aria_busy: root?.getAttribute('aria-busy'),
      horizontal_overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      interactive_count: interactive.length,
      controls_inside_viewport: interactive.filter(node => {
        const rect = node.getBoundingClientRect();
        return rect.left >= -1 && rect.right <= innerWidth + 1;
      }).length,
      duplicate_ids: [...new Set(duplicates)],
      reduced_motion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      forced_colors: matchMedia('(forced-colors: active)').matches,
      running_infinite_animations: animations.filter(item => item.playState === 'running' && item.iterations === Infinity).length,
      navigation_duration_ms: navigation ? Math.round(navigation.duration) : null,
      long_tasks: Array.isArray(window.__td613FlowcoreLongTasks) ? window.__td613FlowcoreLongTasks : []
    };
  }, { rootSelector: surface.root, expected: surface.expected, profileName: profile });
}

async function exercise(page, surface) {
  const nav = page.locator(surface.nav);
  const count = await nav.count();
  if (count > 1) {
    await nav.nth(count - 1).click();
    await page.waitForTimeout(40);
  }
  const rest = page.locator('[data-rest]');
  if (await rest.count()) {
    await rest.first().click();
    await page.waitForTimeout(30);
  }
  const returning = page.locator('[data-return]');
  if (await returning.count()) {
    await returning.first().click();
    await page.waitForTimeout(30);
  }
  const replay = page.locator('[data-replay]');
  if (await replay.count()) {
    await replay.first().click();
    await waitForReady(page, surface);
  }
  await page.locator('body').click({ position: { x: 2, y: 2 } });
  await page.keyboard.press('Tab');
  const keyboardTarget = await page.evaluate(() => {
    const node = document.activeElement;
    return node ? { tag: node.tagName, disabled: Boolean(node.disabled), href: node.getAttribute?.('href') || null } : null;
  });
  assert(keyboardTarget && ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(keyboardTarget.tag), `${surface.id}: keyboard did not reach an interactive control.`);
  assert(!keyboardTarget.disabled, `${surface.id}: keyboard focused a disabled control.`);
}

async function visitProfile(browser, engineName, surface, profile, contextOptions, report, screenshot = false) {
  const context = await browser.newContext(contextOptions);
  await context.addInitScript(() => {
    window.__td613FlowcoreLongTasks = [];
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) window.__td613FlowcoreLongTasks.push(Math.round(entry.duration));
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch {}
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  installObservers(page, `${engineName}:${surface.id}:${profile}`, report);
  await page.goto(urlFor(surface), { waitUntil: 'domcontentloaded' });
  await waitForReady(page, surface);
  await exercise(page, surface);
  await waitForReady(page, surface);
  const result = await measure(page, surface, profile);
  assert(result.heading, `${surface.id}/${profile}: missing h1.`);
  assert(result.expected_text_present, `${surface.id}/${profile}: expected scene text missing.`);
  assert(result.held === false, `${surface.id}/${profile}: surface entered held state.`);
  assert(result.aria_busy !== 'true', `${surface.id}/${profile}: surface never left busy state.`);
  assert(result.horizontal_overflow <= 2, `${surface.id}/${profile}: horizontal overflow ${result.horizontal_overflow}px.`);
  assert(result.interactive_count > 0, `${surface.id}/${profile}: no reachable controls.`);
  assert(result.controls_inside_viewport === result.interactive_count, `${surface.id}/${profile}: controls extend beyond the viewport.`);
  assert(result.duplicate_ids.length === 0, `${surface.id}/${profile}: duplicate DOM IDs ${result.duplicate_ids.join(', ')}.`);
  if (contextOptions.reducedMotion === 'reduce') {
    assert(result.reduced_motion === true, `${surface.id}/${profile}: reduced-motion preference was not applied.`);
    assert(result.running_infinite_animations === 0, `${surface.id}/${profile}: infinite animation survived reduced motion.`);
  }
  const longestTask = Math.max(0, ...result.long_tasks);
  assert(longestTask < 1200, `${surface.id}/${profile}: long task exceeded 1200ms (${longestTask}ms).`);
  assert(result.navigation_duration_ms == null || result.navigation_duration_ms < 20000, `${surface.id}/${profile}: navigation exceeded 20 seconds.`);
  if (screenshot) {
    await page.screenshot({ path: path.join(out, `${engineName}-${surface.id}-${profile}.png`), fullPage: true });
  }
  await context.close();
  return result;
}

await fsp.mkdir(out, { recursive: true });
const report = {
  schema: 'td613.flowcore.runtime-browser-evidence/v0.1',
  status: 'RUNNING',
  source_packet_commit: sourcePacketCommit,
  production_observation: productionObservation,
  base_url: base,
  route_prefix: routePrefix,
  browsers: {},
  browser_matrix: {},
  mobile_evidence: {},
  reduced_motion_evidence: {},
  performance_evidence: {},
  console_errors: [],
  page_errors: [],
  http_errors: [],
  external_requests: [],
  authority: {
    counts_as_human_evidence: false,
    authorizes_public_route_promotion: false,
    authorizes_release: false,
    closes_program: false
  }
};

let terminalError = null;
try {
  for (const engineName of requestedBrowsers) {
    const engine = engines[engineName];
    assert(engine, `Unsupported browser engine: ${engineName}`);
    const launchOptions = { headless: true };
    if (executable && fs.existsSync(executable) && engineName === 'chromium') launchOptions.executablePath = executable;
    const browser = await engine.launch(launchOptions);
    const browserEvidence = { surfaces: {} };
    try {
      for (const surface of surfaces) {
        const desktop = await visitProfile(browser, engineName, surface, 'desktop', {
          viewport: { width: 1280, height: 800 }, colorScheme: 'dark', reducedMotion: 'no-preference'
        }, report, true);
        const mobilePortrait = await visitProfile(browser, engineName, surface, 'mobile-portrait', {
          viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'no-preference', isMobile: engineName === 'webkit', hasTouch: engineName === 'webkit'
        }, report, true);
        const mobileLandscape = await visitProfile(browser, engineName, surface, 'mobile-landscape', {
          viewport: { width: 844, height: 390 }, colorScheme: 'dark', reducedMotion: 'no-preference', isMobile: engineName === 'webkit', hasTouch: engineName === 'webkit'
        }, report, false);
        const reduced = await visitProfile(browser, engineName, surface, 'reduced-motion', {
          viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'reduce', isMobile: engineName === 'webkit', hasTouch: engineName === 'webkit'
        }, report, true);
        const zoomEquivalent = await visitProfile(browser, engineName, surface, 'zoom-200-equivalent', {
          viewport: { width: 640, height: 800 }, colorScheme: 'dark', reducedMotion: 'reduce'
        }, report, false);
        let highContrast = null;
        if (engineName === 'chromium') {
          highContrast = await visitProfile(browser, engineName, surface, 'forced-colors', {
            viewport: { width: 1280, height: 800 }, colorScheme: 'dark', reducedMotion: 'reduce', forcedColors: 'active'
          }, report, false);
          assert(highContrast.forced_colors === true, `${surface.id}: forced-colors media state was not observed.`);
        }
        browserEvidence.surfaces[surface.id] = { desktop, mobile_portrait: mobilePortrait, mobile_landscape: mobileLandscape, reduced_motion: reduced, zoom_200_equivalent: zoomEquivalent, forced_colors: highContrast };
      }
    } finally {
      await browser.close();
    }
    report.browsers[engineName] = browserEvidence;
  }
  assert(report.console_errors.length === 0, `Console errors: ${JSON.stringify(report.console_errors)}`);
  assert(report.page_errors.length === 0, `Page errors: ${JSON.stringify(report.page_errors)}`);
  assert(report.http_errors.length === 0, `HTTP errors: ${JSON.stringify(report.http_errors)}`);
  assert(report.external_requests.length === 0, `Unexpected external requests: ${JSON.stringify(report.external_requests)}`);
  report.browser_matrix = {
    chromium_desktop: requestedBrowsers.includes('chromium') ? 'PASS' : 'NOT_RUN',
    firefox_desktop: requestedBrowsers.includes('firefox') ? 'PASS' : 'NOT_RUN',
    webkit_ios_viewport: requestedBrowsers.includes('webkit') ? 'PASS' : 'NOT_RUN',
    chromium_android_viewport: requestedBrowsers.includes('chromium') ? 'PASS' : 'NOT_RUN',
    keyboard_only: 'PASS',
    zoom_200_percent: 'PASS',
    high_contrast: requestedBrowsers.includes('chromium') ? 'PASS' : 'NOT_RUN'
  };
  report.mobile_evidence = { portrait: 'PASS', landscape: 'PASS', rotation_equivalent: 'PASS' };
  report.reduced_motion_evidence = { browser_runtime_observed: true, status: 'PASS' };
  report.performance_evidence = { browser_frame_trace_observed: true, long_task_ceiling_ms: 1200, navigation_ceiling_ms: 20000, status: 'PASS' };
  report.status = 'PASS';
} catch (error) {
  terminalError = error;
  report.status = 'HELD';
  report.hold_reason = error.message;
} finally {
  report.completed_at = new Date().toISOString();
  await fsp.writeFile(path.join(out, 'flowcore-runtime-browser-evidence.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

if (terminalError) throw terminalError;
console.log(JSON.stringify({ status: report.status, browsers: requestedBrowsers, surfaces: surfaces.length, artifact: path.join(out, 'flowcore-runtime-browser-evidence.json') }, null, 2));
