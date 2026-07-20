import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const engineName = String(process.env.TD613_BROWSER || 'chromium').trim();
const sourceCommit = String(process.env.TD613_SOURCE_PACKET_COMMIT || '').trim() || null;
const productionObservation = process.env.TD613_PRODUCTION_OBSERVATION === 'true';
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-live-aia-${engineName}`);
const engine = { chromium, firefox, webkit }[engineName];
const route = `${base}/dome-world/ash-keep.html?presentation=aia`;

function assert(value, message) {
  if (!value) throw new Error(message);
}

function observeNetwork(page, report, profile) {
  page.on('console', message => {
    if (message.type() === 'error') report.console_errors.push({ profile, text: message.text() });
  });
  page.on('pageerror', error => report.page_errors.push({ profile, text: error.message }));
  page.on('request', request => {
    const method = request.method();
    const url = request.url();
    if (!['GET', 'HEAD'].includes(method)) report.non_read_requests.push({ profile, method, url });
    if (new URL(url).origin !== new URL(base).origin) report.external_requests.push({ profile, method, url });
  });
  page.on('response', response => {
    if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) {
      report.http_errors.push({ profile, status: response.status(), url: response.url() });
    }
  });
}

async function waitForAIA(page) {
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-ash-aia]');
    const current = window.__td613AshLiveAIA?.current?.();
    return Boolean(root && current?.lifecycle_state && current?.package_digest && current?.latest_render_receipt)
      && document.body.dataset.ashAiaHeld !== 'true';
  }, null, { timeout: 60_000 });
  await page.waitForTimeout(120);
}

async function measure(page, profile) {
  return page.evaluate(profileName => {
    const root = document.querySelector('[data-ash-aia]');
    const visible = node => {
      if (!node) return false;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const scrollLaneFor = node => {
      let parent = node.parentElement;
      while (parent && parent !== document.body) {
        const style = getComputedStyle(parent);
        if (/(auto|scroll)/.test(style.overflowX) && parent.scrollWidth > parent.clientWidth + 1) return parent;
        parent = parent.parentElement;
      }
      return null;
    };
    const controls = [...root.querySelectorAll('button, a[href], input, select, textarea')].filter(visible);
    const clipped = controls.map(node => ({
      id: node.id || node.textContent?.trim().slice(0, 48) || node.tagName,
      rect: node.getBoundingClientRect(),
      scrollLane: scrollLaneFor(node)
    })).filter(item => !item.scrollLane && (item.rect.left < -1 || item.rect.right > innerWidth + 1)).map(item => item.id);
    const current = window.__td613AshLiveAIA.current();
    const routeButtons = [...root.querySelectorAll('[data-aia-route]')];
    const animations = document.getAnimations().map(animation => ({
      playState: animation.playState,
      iterations: Number(animation.effect?.getTiming?.().iterations || 0)
    }));
    const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
    return {
      profile: profileName,
      current,
      root_visible: visible(root),
      active_route: routeButtons.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.aiaRoute || null,
      route_count: routeButtons.length,
      five_card_count: root.querySelectorAll('.ash-aia__five-card').length,
      progress_count: root.querySelectorAll('.ash-aia__progress-step').length,
      exact_depth_present: Boolean(root.querySelector('[data-aia-exact]')),
      why_depth_present: Boolean(root.querySelector('[data-aia-why]')),
      rest_visible: visible(root.querySelector('[data-aia-rest]')),
      return_visible: visible(root.querySelector('[data-aia-return]')),
      main_display: getComputedStyle(document.querySelector('body > main')).display,
      launch_display: getComputedStyle(document.querySelector('body > .launch')).display,
      stage_svg_display: getComputedStyle(root.querySelector('[data-aia-stage] svg')).display,
      static_sequence_display: getComputedStyle(root.querySelector('.ash-aia__static-sequence')).display,
      horizontal_overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      clipped_controls: clipped,
      duplicate_ids: [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))],
      reduced_motion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      forced_colors: matchMedia('(forced-colors: active)').matches,
      running_infinite_animations: animations.filter(item => item.playState === 'running' && item.iterations === Infinity).length,
      telemetry_markers: [...document.scripts].some(script => /analytics|telemetry|sendBeacon/i.test(script.textContent || script.src || '')),
      lifecycle_receipt_text: document.querySelector('#lifecycleReceipt')?.textContent || '',
      action_receipt_text: root.querySelector('[data-aia-action-receipt]')?.textContent || ''
    };
  }, profile);
}

function assertExperiential(result, profile) {
  assert(result.root_visible, `${profile}: AIA membrane is not visible.`);
  assert(result.active_route === 'EXPERIENTIAL', `${profile}: default route is ${result.active_route}.`);
  assert(result.route_count === 4, `${profile}: expected four explicit AIA routes.`);
  assert(result.five_card_count === 5, `${profile}: five-part consequence contract is incomplete.`);
  assert(result.progress_count === 8, `${profile}: lifecycle progress is incomplete.`);
  assert(result.exact_depth_present && result.why_depth_present, `${profile}: disclosure depths are incomplete.`);
  assert(result.main_display === 'none', `${profile}: specialist console remained exposed in Experiential.`);
  assert(result.launch_display === 'none', `${profile}: inherited launcher obscured the membrane.`);
  assert(result.horizontal_overflow <= 2, `${profile}: horizontal overflow ${result.horizontal_overflow}px.`);
  assert(result.clipped_controls.length === 0, `${profile}: clipped controls: ${result.clipped_controls.join(', ')}.`);
  assert(result.duplicate_ids.length === 0, `${profile}: duplicate IDs: ${result.duplicate_ids.join(', ')}.`);
  assert(result.running_infinite_animations === 0, `${profile}: infinite animation detected.`);
  assert(result.telemetry_markers === false, `${profile}: telemetry marker detected.`);
  assert(result.current.child_study_authorized === false, `${profile}: child-study boundary widened.`);
  assert(result.current.telemetry_present === false, `${profile}: runtime telemetry boundary widened.`);
}

async function selectRoute(page, routeName) {
  const button = page.locator(`[data-aia-route="${routeName}"]`);
  await button.evaluate(node => node.click());
  await page.waitForTimeout(180);
  const observed = await page.evaluate(() => window.__td613AshLiveAIA?.current?.().route || null);
  assert(observed === routeName, `${routeName}: native route button produced ${observed || 'NO_ROUTE'}.`);
}

async function exerciseNonMutation(page) {
  const before = await measure(page, 'before-exercise');
  await page.locator('[data-aia-rest]').click();
  await page.waitForTimeout(40);
  const resting = await measure(page, 'resting');
  assert(resting.return_visible && !resting.rest_visible, 'Rest did not preserve an explicit Return.');
  assert(resting.lifecycle_receipt_text === before.lifecycle_receipt_text, 'Rest mutated lifecycle truth.');
  await page.locator('[data-aia-return]').click();
  await page.locator('[data-aia-play]').click();
  await waitForAIA(page);
  const replayed = await measure(page, 'replayed');
  assert(replayed.lifecycle_receipt_text === before.lifecycle_receipt_text, 'Replay mutated lifecycle truth.');
  assert(replayed.action_receipt_text === before.action_receipt_text, 'Replay created or changed an action receipt.');

  const routes = {};
  for (const routeName of ['CUSTODIAL', 'AUDIT', 'IMPLEMENTATION', 'EXPERIENTIAL']) {
    await selectRoute(page, routeName);
    routes[routeName] = await page.evaluate(() => ({
      route: window.__td613AshLiveAIA.current().route,
      main: getComputedStyle(document.querySelector('body > main')).display,
      package: window.__td613AshLiveAIA.current().package_digest,
      lifecycle: document.querySelector('#lifecycleReceipt')?.textContent || ''
    }));
    assert(routes[routeName].package === before.current.package_digest, `${routeName}: route selection changed the governed package.`);
    assert(routes[routeName].lifecycle === before.lifecycle_receipt_text, `${routeName}: route selection changed lifecycle truth.`);
  }
  assert(routes.CUSTODIAL.main === 'none', 'Custodial exposed the specialist console.');
  assert(routes.AUDIT.main !== 'none', 'Audit did not expose exact controls.');
  assert(routes.IMPLEMENTATION.main !== 'none', 'Implementation did not preserve the exact console.');
  assert(routes.EXPERIENTIAL.main === 'none', 'Experiential did not restore consequence-first presentation.');

  await page.locator('body').click({ position: { x: 2, y: 2 } });
  await page.keyboard.press('Tab');
  const keyboard = await page.evaluate(() => ({ tag: document.activeElement?.tagName, disabled: Boolean(document.activeElement?.disabled) }));
  assert(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(keyboard.tag), 'Keyboard did not reach an interactive control.');
  assert(!keyboard.disabled, 'Keyboard focused a disabled control.');
  return { before, resting, replayed, routes, keyboard };
}

async function observeProfile(browser, profile, contextOptions, report, exercise = false) {
  const context = await browser.newContext(contextOptions);
  await context.addInitScript(() => {
    window.__td613AIALongTasks = [];
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) window.__td613AIALongTasks.push(Math.round(entry.duration));
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch {}
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  observeNetwork(page, report, profile);
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await waitForAIA(page);
  const result = await measure(page, profile);
  assertExperiential(result, profile);
  if (contextOptions.reducedMotion === 'reduce') {
    assert(result.reduced_motion, `${profile}: reduced motion was not observed.`);
    assert(result.stage_svg_display === 'none', `${profile}: animated SVG survived reduced motion.`);
    assert(result.static_sequence_display !== 'none', `${profile}: static causal frames are absent.`);
  } else {
    assert(result.stage_svg_display !== 'none', `${profile}: causal SVG is absent.`);
  }
  if (contextOptions.forcedColors === 'active') assert(result.forced_colors, `${profile}: forced colors were not observed.`);
  const longTasks = await page.evaluate(() => window.__td613AIALongTasks || []);
  assert(Math.max(0, ...longTasks) < 1200, `${profile}: long task exceeded 1200ms.`);
  const interactions = exercise ? await exerciseNonMutation(page) : null;
  await page.screenshot({ path: path.join(artifactDir, `${engineName}-${profile}.png`), fullPage: true });
  await context.close();
  return { ...result, long_tasks: longTasks, interactions };
}

assert(engine, `Unsupported browser: ${engineName}`);
await fs.mkdir(artifactDir, { recursive: true });
const report = {
  schema: 'td613.ash.live-aia-browser-evidence/v0.1',
  status: 'RUNNING',
  browser: engineName,
  base_url: base,
  route,
  source_packet_commit: sourceCommit,
  production_observation: productionObservation,
  profiles: {},
  console_errors: [],
  page_errors: [],
  http_errors: [],
  external_requests: [],
  non_read_requests: [],
  authority: {
    counts_as_human_evidence: false,
    authorizes_child_study: false,
    authorizes_public_route_promotion: false,
    authorizes_release: false,
    closes_program: false
  }
};

let terminalError = null;
try {
  const mobile = engineName === 'webkit' ? { isMobile: true, hasTouch: true } : {};
  const profiles = [
    ['desktop', { viewport: { width: 1280, height: 800 }, colorScheme: 'dark', reducedMotion: 'no-preference' }, true],
    ['mobile-portrait', { viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'no-preference', ...mobile }, false],
    ['mobile-landscape', { viewport: { width: 844, height: 390 }, colorScheme: 'dark', reducedMotion: 'no-preference', ...mobile }, false],
    ['rotation-return', { viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'no-preference', ...mobile }, false],
    ['reduced-motion', { viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'reduce', ...mobile }, false],
    ['zoom-200-equivalent', { viewport: { width: 640, height: 800 }, colorScheme: 'dark', reducedMotion: 'reduce' }, false]
  ];
  if (engineName === 'chromium') profiles.push(['forced-colors', {
    viewport: { width: 1280, height: 800 }, colorScheme: 'dark', reducedMotion: 'reduce', forcedColors: 'active'
  }, false]);

  for (const [profile, options, exercise] of profiles) {
    const browser = await engine.launch({ headless: true });
    try { report.profiles[profile] = await observeProfile(browser, profile, options, report, exercise); }
    finally { await browser.close(); }
  }

  assert(report.console_errors.length === 0, `Console errors: ${JSON.stringify(report.console_errors)}`);
  assert(report.page_errors.length === 0, `Page errors: ${JSON.stringify(report.page_errors)}`);
  assert(report.http_errors.length === 0, `HTTP errors: ${JSON.stringify(report.http_errors)}`);
  assert(report.external_requests.length === 0, `External requests: ${JSON.stringify(report.external_requests)}`);
  assert(report.non_read_requests.length === 0, `Non-read requests without an Ash gesture: ${JSON.stringify(report.non_read_requests)}`);
  report.status = 'PASS';
  report.matrix = {
    desktop: 'PASS', mobile_portrait: 'PASS', mobile_landscape: 'PASS', rotation_equivalent: 'PASS',
    reduced_motion: 'PASS', zoom_200_equivalent: 'PASS', keyboard: 'PASS',
    forced_colors: engineName === 'chromium' ? 'PASS' : 'NOT_APPLICABLE'
  };
} catch (error) {
  terminalError = error;
  report.status = 'HOLD_FOR_REPAIR';
  report.error = { message: error.message, stack: error.stack };
} finally {
  await fs.writeFile(path.join(artifactDir, `${engineName}-ash-live-aia-browser-evidence.json`), `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify(report, null, 2));
if (terminalError) throw terminalError;
