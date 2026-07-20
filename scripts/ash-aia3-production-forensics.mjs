import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'https://td613.com').replace(/\/$/, '');
const browserName = String(process.env.TD613_BROWSER || 'chromium');
const browserType = { chromium, firefox, webkit }[browserName];
const outputDir = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-aia3-forensics-${browserName}`);
const target = `${base}/dome-world/ash-keep.html?presentation=aia&aia3_probe=${Date.now()}`;
const profiles = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: browserName === 'webkit', hasTouch: browserName === 'webkit' }
];

function assert(value, message) { if (!value) throw new Error(message); }

async function clearClientState(page) {
  await page.goto(`${base}/dome-world/ash-keep.html?presentation=legacy&aia3_clear=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}
    try {
      if (globalThis.caches?.keys) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
    } catch {}
    try {
      if (navigator.serviceWorker?.getRegistrations) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
      }
    } catch {}
  });
}

async function sample(page, label, elapsedMs) {
  return page.evaluate(({ label, elapsedMs }) => {
    const rect = node => {
      if (!node) return null;
      const r = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height),
        display: style.display, visibility: style.visibility, opacity: style.opacity,
        position: style.position, zIndex: style.zIndex, pointerEvents: style.pointerEvents
      };
    };
    const isVisible = node => {
      if (!node) return false;
      const style = getComputedStyle(node);
      const r = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && r.width > 0 && r.height > 0;
    };
    const centerHit = node => {
      if (!node || !isVisible(node)) return null;
      const r = node.getBoundingClientRect();
      const hit = document.elementFromPoint(Math.max(0, Math.min(innerWidth - 1, r.left + r.width / 2)), Math.max(0, Math.min(innerHeight - 1, r.top + r.height / 2)));
      return hit ? { tag: hit.tagName, id: hit.id || null, className: String(hit.className || ''), text: hit.textContent?.trim().slice(0, 80) || null, same: hit === node || node.contains(hit) } : null;
    };
    const select = document.querySelector('#newProfile');
    const root = document.querySelector('#ashAiaMembrane');
    const launch = document.querySelector('#launch');
    const resources = performance.getEntriesByType('resource').map(entry => entry.name).filter(name => /ash|dome-world|service-worker|\.css|\.js/.test(name));
    const styles = [...document.querySelectorAll('link[rel="stylesheet"]')].map(link => ({ href: link.href, loaded: Boolean(link.sheet), marker: [...link.attributes].filter(attr => attr.name.startsWith('data-ash')).map(attr => `${attr.name}=${attr.value}`) }));
    const scripts = [...document.scripts].map(script => ({ src: script.src || null, type: script.type || null, id: script.id || null }));
    return {
      label, elapsed_ms: elapsedMs,
      url: location.href,
      ready_state: document.readyState,
      html_dataset: { ...document.documentElement.dataset },
      body_dataset: { ...document.body.dataset },
      scroll: { x: scrollX, y: scrollY, width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, viewport_width: innerWidth, viewport_height: innerHeight },
      current: window.__td613AshLiveAIA?.current?.() || null,
      cache_transition: window.__td613AshCacheTransition || null,
      ingress_layout: window.__td613AshIngressLayout?.measure?.() || null,
      elements: {
        root: { visible: isVisible(root), rect: rect(root) },
        header: { visible: isVisible(root?.querySelector('.ash-aia__header')), rect: rect(root?.querySelector('.ash-aia__header')) },
        routes: { visible: isVisible(root?.querySelector('.ash-aia__routes')), count: root?.querySelectorAll('[data-aia-route]').length || 0, rect: rect(root?.querySelector('.ash-aia__routes')) },
        tasks: { visible: isVisible(root?.querySelector('.ash-aia__tasks')), count: root?.querySelectorAll('[data-aia-task]').length || 0, rect: rect(root?.querySelector('.ash-aia__tasks')) },
        guide: { visible: isVisible(root?.querySelector('.ash-aia__guide')), rect: rect(root?.querySelector('.ash-aia__guide')) },
        work: { visible: isVisible(root?.querySelector('.ash-aia__work')), rect: rect(root?.querySelector('.ash-aia__work')) },
        launch: { visible: isVisible(launch), parent: launch?.parentElement?.className || launch?.parentElement?.id || null, rect: rect(launch) },
        launch_panel: { visible: isVisible(document.querySelector('#launch .launch-panel')), rect: rect(document.querySelector('#launch .launch-panel')) },
        main: { visible: isVisible(document.querySelector('body > main')), rect: rect(document.querySelector('body > main')) },
        rail: { visible: isVisible(document.querySelector('body > .workspace-rail')), rect: rect(document.querySelector('body > .workspace-rail')) },
        profile: { visible: isVisible(select), disabled: Boolean(select?.disabled), value: select?.value || null, options: select ? [...select.options].map(option => ({ value: option.value, text: option.text, disabled: option.disabled })) : [], rect: rect(select), hit: centerHit(select) },
        new_case: { visible: isVisible(document.querySelector('#newCase')), disabled: Boolean(document.querySelector('#newCase')?.disabled), rect: rect(document.querySelector('#newCase')), hit: centerHit(document.querySelector('#newCase')) },
        demo: { visible: isVisible(document.querySelector('#startDemo')), disabled: Boolean(document.querySelector('#startDemo')?.disabled), rect: rect(document.querySelector('#startDemo')), hit: centerHit(document.querySelector('#startDemo')) },
        dock: { visible: isVisible(document.querySelector('.premium-primary-dock')), rect: rect(document.querySelector('.premium-primary-dock')) }
      },
      resources,
      styles,
      scripts,
      cache_names: [],
      service_workers: []
    };
  }, { label, elapsedMs });
}

async function augmentClientState(page, record) {
  const extra = await page.evaluate(async () => {
    let cacheNames = [];
    let workers = [];
    try { cacheNames = globalThis.caches?.keys ? await caches.keys() : []; } catch {}
    try {
      workers = navigator.serviceWorker?.getRegistrations ? (await navigator.serviceWorker.getRegistrations()).map(reg => ({ scope: reg.scope, active: reg.active?.scriptURL || null, waiting: reg.waiting?.scriptURL || null, installing: reg.installing?.scriptURL || null })) : [];
    } catch {}
    return { cacheNames, workers };
  });
  record.cache_names = extra.cacheNames;
  record.service_workers = extra.workers;
  return record;
}

async function exerciseIngress(page, profile, report) {
  const result = { profile, attempted: true, selected_profile: null, clicked: false, case_opened: false, errors: [] };
  try {
    const select = page.locator('#newProfile');
    await select.waitFor({ state: 'visible', timeout: 30_000 });
    const values = await select.locator('option').evaluateAll(options => options.map(option => option.value).filter(Boolean));
    result.profile_options = values;
    assert(values.includes('research'), `${profile}: research profile missing.`);
    await select.selectOption('research');
    result.selected_profile = await select.inputValue();
    await page.locator('#newTitle').fill(`AIA3 ${profile} production diagnostic`);
    const button = page.locator('#newCase');
    await button.scrollIntoViewIfNeeded();
    const hit = await button.evaluate(node => {
      const r = node.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { same: top === node || node.contains(top), top: top?.id || String(top?.className || '') || top?.tagName || null };
    });
    result.hit = hit;
    if (!hit.same) throw new Error(`${profile}: New Case covered by ${hit.top}.`);
    await button.click();
    result.clicked = true;
    await page.waitForFunction(() => Boolean(window.__td613AshKeep?.current?.().case_id), null, { timeout: 30_000 });
    result.case_opened = true;
    result.case_id = await page.evaluate(() => window.__td613AshKeep?.current?.().case_id || null);
  } catch (error) {
    result.errors.push(error.message);
  }
  report.actions.push(result);
}

async function runProfile(browser, profileConfig, report) {
  const context = await browser.newContext({ viewport: profileConfig.viewport, isMobile: profileConfig.isMobile, hasTouch: profileConfig.hasTouch, reducedMotion: 'no-preference', colorScheme: 'dark' });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || null }));

  await clearClientState(page);
  const coldUrl = `${target}&profile=${profileConfig.name}&mode=cold`;
  await page.goto(coldUrl, { waitUntil: 'domcontentloaded' });
  const timeline = [];
  const start = Date.now();
  for (const elapsed of [0, 50, 100, 250, 500, 1000, 2000, 5000]) {
    const remaining = Math.max(0, start + elapsed - Date.now());
    if (remaining) await page.waitForTimeout(remaining);
    timeline.push(await augmentClientState(page, await sample(page, `${profileConfig.name}-cold-${elapsed}`, elapsed)));
    if ([0, 250, 1000, 5000].includes(elapsed)) await page.screenshot({ path: path.join(outputDir, `${browserName}-${profileConfig.name}-cold-${elapsed}.png`), fullPage: true });
  }
  await exerciseIngress(page, `${profileConfig.name}-cold`, report);
  await page.screenshot({ path: path.join(outputDir, `${browserName}-${profileConfig.name}-after-action.png`), fullPage: true });

  await page.goto(`${target}&profile=${profileConfig.name}&mode=warm`, { waitUntil: 'domcontentloaded' });
  const warm = [];
  const warmStart = Date.now();
  for (const elapsed of [0, 100, 500, 1500, 3000]) {
    const remaining = Math.max(0, warmStart + elapsed - Date.now());
    if (remaining) await page.waitForTimeout(remaining);
    warm.push(await augmentClientState(page, await sample(page, `${profileConfig.name}-warm-${elapsed}`, elapsed)));
  }
  await page.screenshot({ path: path.join(outputDir, `${browserName}-${profileConfig.name}-warm.png`), fullPage: true });

  report.profiles[profileConfig.name] = { timeline, warm, console_errors: consoleErrors, page_errors: pageErrors, failed_requests: failedRequests };
  await context.close();
}

assert(browserType, `Unsupported browser ${browserName}`);
await fs.mkdir(outputDir, { recursive: true });
const report = {
  schema: 'td613.ash.aia3-production-forensics/v0.1',
  status: 'RUNNING', browser: browserName, base_url: base, target,
  profiles: {}, actions: [], authority: { mutates_repository: false, deploys: false, clears_real_user_storage: false, counts_as_human_evidence: false }
};
let terminal = null;
const browser = await browserType.launch({ headless: true });
try {
  for (const profile of profiles) await runProfile(browser, profile, report);
  report.status = report.actions.every(action => action.case_opened) ? 'PASS_ACTIONABILITY' : 'HELD_ACTIONABILITY';
} catch (error) {
  terminal = error;
  report.status = 'HELD';
  report.hold_reason = error.message;
} finally {
  await browser.close();
  report.completed_at = new Date().toISOString();
  await fs.writeFile(path.join(outputDir, 'ash-aia3-production-forensics.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}
if (terminal) throw terminal;
console.log(JSON.stringify({ status: report.status, browser: browserName, actions: report.actions }, null, 2));
