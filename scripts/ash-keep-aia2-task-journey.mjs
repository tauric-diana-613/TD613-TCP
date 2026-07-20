import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const engineName = String(process.env.TD613_BROWSER || 'chromium').trim();
const engine = { chromium, firefox, webkit }[engineName];
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-aia2-${engineName}`);
const production = process.env.TD613_PRODUCTION_OBSERVATION === 'true';
const sourceCommit = String(process.env.TD613_SOURCE_PACKET_COMMIT || '').trim() || null;
const route = `${base}/dome-world/ash-keep.html?presentation=aia`;

function assert(value, message) { if (!value) throw new Error(message); }
function visible(node) {
  if (!node) return false;
  const style = getComputedStyle(node); const rect = node.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
}
async function waitForAIA(page) {
  await page.waitForFunction(() => {
    const current = window.__td613AshLiveAIA?.current?.();
    return document.documentElement.dataset.ashAiaReady === 'true'
      && document.documentElement.dataset.ashAiaIngress === 'INTEGRATED_EXACT_CONTROLS'
      && current?.task_continuity_required === true
      && current?.latest_render_receipt
      && document.body.dataset.ashAiaHeld !== 'true';
  }, null, { timeout: 60_000 });
}
function observeNetwork(page, report, profile) {
  page.on('console', message => { if (message.type() === 'error') report.console_errors.push({ profile, text: message.text() }); });
  page.on('pageerror', error => report.page_errors.push({ profile, text: error.message }));
  page.on('request', request => {
    const url = request.url(); const method = request.method();
    if (!['GET', 'HEAD'].includes(method)) report.non_read_requests.push({ profile, method, url });
    if (new URL(url).origin !== new URL(base).origin) report.external_requests.push({ profile, method, url });
  });
  page.on('response', response => {
    if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) report.http_errors.push({ profile, status: response.status(), url: response.url() });
  });
}
async function snapshot(page, label) {
  return page.evaluate(labelValue => {
    const root = document.querySelector('#ashAiaMembrane');
    const launch = document.querySelector('#launch');
    const main = document.querySelector('body > main');
    const rail = document.querySelector('body > .workspace-rail');
    const controls = [...document.querySelectorAll('#ashAiaMembrane button, #ashAiaMembrane input, #ashAiaMembrane select, body > main button, body > main input, body > main select, body > .workspace-rail button')].filter(visible);
    const clipped = controls.filter(node => {
      const rect = node.getBoundingClientRect();
      let parent = node.parentElement; let scrollLane = false;
      while (parent && parent !== document.body) {
        const style = getComputedStyle(parent);
        if (/(auto|scroll)/.test(style.overflowX) && parent.scrollWidth > parent.clientWidth + 1) { scrollLane = true; break; }
        parent = parent.parentElement;
      }
      return !scrollLane && (rect.left < -1 || rect.right > innerWidth + 1);
    }).map(node => node.id || node.textContent?.trim().slice(0, 60) || node.tagName);
    const launchStyle = launch ? getComputedStyle(launch) : null;
    const center = document.elementsFromPoint(innerWidth / 2, innerHeight / 2).slice(0, 5).map(node => ({ tag: node.tagName, id: node.id || null, class: typeof node.className === 'string' ? node.className : null }));
    return {
      label: labelValue,
      viewport: { width: innerWidth, height: innerHeight },
      document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth) },
      current: window.__td613AshLiveAIA.current(),
      root_visible: visible(root),
      ingress_visible: visible(launch),
      ingress_position: launchStyle?.position || null,
      profile_visible: visible(document.querySelector('#newProfile')),
      new_case_visible: visible(document.querySelector('#newCase')),
      demo_visible: visible(document.querySelector('#startDemo')),
      main_visible: visible(main),
      rail_visible: visible(rail),
      local_file_visible: visible(document.querySelector('#localTextFile')),
      active_workspace: document.querySelector('.workspace.active')?.id || null,
      active_route: root?.querySelector('[data-aia-route][aria-pressed="true"]')?.dataset.aiaRoute || null,
      task: root?.querySelector('[data-aia-task][aria-current="step"]')?.dataset.aiaTask || null,
      clipped_controls: clipped,
      center_stack: center,
      lifecycle: document.querySelector('#lifecycleReceipt')?.textContent || '',
      draft: document.querySelector('#draftBody')?.value || '',
      case_id: window.__td613AshKeep?.current?.().case_id || null,
      action_receipt: root?.querySelector('[data-aia-action-receipt]')?.textContent || '',
      lesson_frame: root?.querySelector('[data-aia-stage]')?.dataset.frame || null,
      body_held: document.body.dataset.ashAiaHeld || null
    };
  }, label);
}
async function assertFirstUse(page, profile, result) {
  assert(result.root_visible, `${profile}: task guide is not visible.`);
  assert(result.active_route === 'EXPERIENTIAL', `${profile}: default route is ${result.active_route}.`);
  assert(result.task === 'setup', `${profile}: first task is ${result.task}.`);
  assert(result.ingress_visible && result.profile_visible && result.new_case_visible && result.demo_visible, `${profile}: exact ingress controls are not visible.`);
  assert(result.ingress_position !== 'fixed', `${profile}: ingress still blocks the viewport as a fixed overlay.`);
  assert(result.document.overflow <= 2, `${profile}: horizontal overflow ${result.document.overflow}px.`);
  assert(result.clipped_controls.length === 0, `${profile}: clipped controls: ${result.clipped_controls.join(', ')}.`);
  assert(result.body_held !== 'true', `${profile}: presentation held.`);
  const newCase = page.locator('#newCase');
  const point = await newCase.evaluate(node => { const r = node.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { hit: hit?.id || hit?.tagName, contained: node === hit || node.contains(hit) }; });
  assert(point.contained, `${profile}: New Case is covered by ${point.hit || 'unknown element'}.`);
}
async function createCase(page, profile, report) {
  await page.locator('#newTitle').fill(`AIA2 ${profile} task-continuity case`);
  await page.locator('#newProfile').selectOption('research');
  await page.locator('#newCase').click();
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.current?.().case_id), null, { timeout: 60_000 });
  await page.waitForFunction(() => window.__td613AshLiveAIA?.current?.().task === 'document');
  const result = await snapshot(page, `${profile}-case-open`);
  assert(result.case_id, `${profile}: exact New Case control created no case.`);
  assert(result.active_route === 'EXPERIENTIAL', `${profile}: case setup ejected to ${result.active_route}.`);
  assert(result.main_visible && result.rail_visible, `${profile}: exact workspaces remained hidden after case setup.`);
  assert(!result.ingress_visible, `${profile}: ingress still blocks an open case.`);
  assert(result.task === 'document', `${profile}: task spine did not advance to local document.`);
  report.steps.push(result);
  return result;
}
async function openLocalDocument(page, profile, report) {
  await page.locator('[data-aia-task="document"]').click();
  await page.waitForFunction(() => document.querySelector('#workspace-draft')?.classList.contains('active') && document.querySelector('#localTextFile')?.getClientRects().length > 0);
  const before = await snapshot(page, `${profile}-draft-open`);
  assert(before.active_route === 'EXPERIENTIAL', `${profile}: opening Draft ejected to ${before.active_route}.`);
  assert(before.active_workspace === 'workspace-draft' && before.local_file_visible, `${profile}: local file control is unavailable.`);
  const text = `TD613 AIA2 synthetic local document for ${profile}; no recipient route.`;
  await page.locator('#localTextFile').setInputFiles({ name: 'aia2-local.txt', mimeType: 'text/plain', buffer: Buffer.from(text) });
  await page.waitForFunction(expected => document.querySelector('#draftBody')?.value?.includes(expected), text, { timeout: 60_000 });
  await page.waitForFunction(() => window.__td613AshLiveAIA?.current?.().task === 'custody');
  const after = await snapshot(page, `${profile}-document-open`);
  assert(after.draft.includes(text), `${profile}: selected local document did not enter the local draft surface.`);
  assert(after.active_route === 'EXPERIENTIAL', `${profile}: local document task changed route.`);
  assert(after.task === 'custody', `${profile}: task spine did not advance to custody.`);
  report.steps.push(before, after);
  return { text, after };
}
async function exerciseExplanationAndRoutes(page, profile, report) {
  const before = await snapshot(page, `${profile}-before-explanation`);
  await page.locator('[data-aia-play]').click();
  await page.waitForTimeout(3300);
  const explained = await snapshot(page, `${profile}-after-explanation`);
  assert(explained.case_id === before.case_id, `${profile}: explanation changed the case.`);
  assert(explained.lifecycle === before.lifecycle, `${profile}: explanation changed lifecycle truth.`);
  assert(explained.draft === before.draft, `${profile}: explanation changed the local document.`);
  assert(explained.action_receipt === before.action_receipt, `${profile}: explanation created an action receipt.`);
  for (const routeName of ['CUSTODIAL', 'AUDIT', 'IMPLEMENTATION', 'EXPERIENTIAL']) {
    await page.locator(`[data-aia-route="${routeName}"]`).click();
    await page.waitForFunction(routeValue => window.__td613AshLiveAIA?.current?.().route === routeValue, routeName);
    const routed = await snapshot(page, `${profile}-${routeName.toLowerCase()}`);
    assert(routed.main_visible && routed.rail_visible, `${profile}/${routeName}: exact work disappeared.`);
    assert(routed.case_id === before.case_id && routed.draft === before.draft, `${profile}/${routeName}: route changed governed work.`);
    report.steps.push(routed);
  }
  await page.locator('[data-aia-rest]').click();
  await page.waitForFunction(() => window.__td613AshLiveAIA?.current?.().resting === true);
  const resting = await snapshot(page, `${profile}-resting`);
  assert(resting.main_visible, `${profile}: Rest hid the exact work surface.`);
  await page.locator('[data-aia-return]').click();
  await page.waitForFunction(() => window.__td613AshLiveAIA?.current?.().resting === false);
  const returned = await snapshot(page, `${profile}-returned`);
  assert(returned.case_id === before.case_id && returned.draft === before.draft, `${profile}: recovery changed work.`);
  report.steps.push(before, explained, resting, returned);
}
async function runJourney(browser, profile, options, report) {
  const context = await browser.newContext(options);
  await context.addInitScript(() => { localStorage.clear(); sessionStorage.clear(); });
  const page = await context.newPage(); page.setDefaultTimeout(60_000);
  observeNetwork(page, report, profile);
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await waitForAIA(page);
  const initial = await snapshot(page, `${profile}-first-use`);
  await assertFirstUse(page, profile, initial);
  report.steps.push(initial);
  await page.screenshot({ path: path.join(out, `${engineName}-${profile}-first-use.png`), fullPage: true });
  await createCase(page, profile, report);
  await openLocalDocument(page, profile, report);
  await exerciseExplanationAndRoutes(page, profile, report);
  const final = await snapshot(page, `${profile}-complete`);
  assert(final.document.overflow <= 2, `${profile}: final horizontal overflow ${final.document.overflow}px.`);
  assert(final.clipped_controls.length === 0, `${profile}: final clipped controls: ${final.clipped_controls.join(', ')}.`);
  await page.screenshot({ path: path.join(out, `${engineName}-${profile}-complete.png`), fullPage: true });
  await context.close();
  return { initial, final };
}

assert(engine, `Unsupported browser: ${engineName}`);
await fs.mkdir(out, { recursive: true });
const report = {
  schema: 'td613.ash.aia2-task-continuity-browser-evidence/v0.1',
  status: 'RUNNING', browser: engineName, base_url: base, source_packet_commit: sourceCommit,
  production_observation: production, profiles: {}, steps: [], console_errors: [], page_errors: [],
  http_errors: [], external_requests: [], non_read_requests: [],
  authority: { counts_as_human_evidence: false, authorizes_child_study: false, authorizes_release: false, closes_program: false }
};
let failure = null;
try {
  const mobile = engineName === 'webkit' ? { isMobile: true, hasTouch: true } : { hasTouch: true };
  const browser = await engine.launch({ headless: true });
  try {
    report.profiles.desktop = await runJourney(browser, 'desktop', { viewport: { width: 1440, height: 900 }, colorScheme: 'dark', reducedMotion: 'no-preference' }, report);
    report.profiles.mobile = await runJourney(browser, 'mobile', { viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'no-preference', ...mobile }, report);
  } finally { await browser.close(); }
  assert(report.console_errors.length === 0, `Console errors: ${JSON.stringify(report.console_errors)}`);
  assert(report.page_errors.length === 0, `Page errors: ${JSON.stringify(report.page_errors)}`);
  assert(report.http_errors.length === 0, `HTTP errors: ${JSON.stringify(report.http_errors)}`);
  assert(report.external_requests.length === 0, `External requests: ${JSON.stringify(report.external_requests)}`);
  assert(report.non_read_requests.length === 0, `Unexpected write requests: ${JSON.stringify(report.non_read_requests)}`);
  report.status = 'PASS';
} catch (error) {
  failure = error; report.status = 'HELD'; report.hold_reason = error.message;
} finally {
  report.completed_at = new Date().toISOString();
  await fs.writeFile(path.join(out, 'ash-aia2-task-continuity.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}
if (failure) throw failure;
console.log(JSON.stringify({ status: report.status, browser: engineName, profiles: Object.keys(report.profiles), artifact: path.join(out, 'ash-aia2-task-continuity.json') }, null, 2));
