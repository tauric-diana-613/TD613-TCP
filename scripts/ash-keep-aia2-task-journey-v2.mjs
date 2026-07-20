import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const browserName = String(process.env.TD613_BROWSER || 'chromium').trim();
const browserType = { chromium, firefox, webkit }[browserName];
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-aia2-${browserName}`);
const sourceCommit = String(process.env.TD613_SOURCE_PACKET_COMMIT || '').trim() || null;
const production = process.env.TD613_PRODUCTION_OBSERVATION === 'true';
const url = `${base}/dome-world/ash-keep.html?presentation=aia`;

function assert(value, message) { if (!value) throw new Error(message); }
function attachObservers(page, report, profile) {
  page.on('console', message => { if (message.type() === 'error') report.console_errors.push({ profile, text: message.text() }); });
  page.on('pageerror', error => report.page_errors.push({ profile, text: error.message }));
  page.on('request', request => {
    const method = request.method();
    const requestUrl = request.url();
    if (!['GET', 'HEAD'].includes(method)) report.non_read_requests.push({ profile, method, url: requestUrl });
    if (new URL(requestUrl).origin !== new URL(base).origin) report.external_requests.push({ profile, method, url: requestUrl });
  });
  page.on('response', response => {
    if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) report.http_errors.push({ profile, status: response.status(), url: response.url() });
  });
}
async function waitReady(page) {
  await page.waitForFunction(() => {
    const current = window.__td613AshLiveAIA?.current?.();
    return document.documentElement.dataset.ashAiaReady === 'true'
      && document.documentElement.dataset.ashAiaIngress === 'INTEGRATED_EXACT_CONTROLS'
      && current?.task_continuity_required === true
      && current?.latest_render_receipt
      && document.body.dataset.ashAiaHeld !== 'true';
  }, null, { timeout: 60_000 });
}
async function snap(page, label) {
  return page.evaluate(labelValue => {
    const visible = node => {
      if (!node) return false;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    const inViewport = node => {
      if (!visible(node)) return false;
      const rect = node.getBoundingClientRect();
      return rect.top >= -1 && rect.left >= -1 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1;
    };
    const inHorizontalLane = node => {
      for (let parent = node.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        if (/(auto|scroll)/.test(style.overflowX) && parent.scrollWidth > parent.clientWidth + 1) return true;
      }
      return false;
    };
    let lifecycleReceipt = null;
    try { lifecycleReceipt = JSON.parse(document.querySelector('#lifecycleReceipt')?.textContent || 'null'); } catch {}
    const lifecycle = lifecycleReceipt?.lifecycle || null;
    const root = document.querySelector('#ashAiaMembrane');
    const launch = document.querySelector('#launch');
    const main = document.querySelector('body > main');
    const rail = document.querySelector('body > .workspace-rail');
    const controls = [...document.querySelectorAll('#ashAiaMembrane button,#ashAiaMembrane input,#ashAiaMembrane select,body>main button,body>main input,body>main select,body>.workspace-rail button')].filter(visible);
    const clipped = controls.filter(node => {
      const rect = node.getBoundingClientRect();
      return !inHorizontalLane(node) && (rect.left < -1 || rect.right > innerWidth + 1);
    }).map(node => node.id || node.textContent?.trim().slice(0, 60) || node.tagName);
    const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
    const newCase = document.querySelector('#newCase');
    return {
      label: labelValue,
      viewport: { width: innerWidth, height: innerHeight },
      document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth) },
      current: window.__td613AshLiveAIA.current(),
      lifecycle_semantics: lifecycle ? {
        lifecycle_digest: lifecycleReceipt.lifecycle_digest || null,
        state: lifecycle.state,
        next_action: lifecycle.next_action,
        gates: lifecycle.gates,
        holds: lifecycle.holds,
        references: lifecycle.references
      } : null,
      root_visible: visible(root),
      ingress_visible: visible(launch),
      ingress_position: launch ? getComputedStyle(launch).position : null,
      profile_visible: visible(document.querySelector('#newProfile')),
      new_case_visible: visible(newCase),
      new_case_in_viewport: inViewport(newCase),
      demo_visible: visible(document.querySelector('#startDemo')),
      main_visible: visible(main),
      rail_visible: visible(rail),
      local_file_visible: visible(document.querySelector('#localTextFile')),
      active_workspace: document.querySelector('.workspace.active')?.id || null,
      route: root?.querySelector('[data-aia-route][aria-pressed="true"]')?.dataset.aiaRoute || null,
      task: root?.querySelector('[data-aia-task][aria-current="step"]')?.dataset.aiaTask || null,
      clipped_controls: clipped,
      duplicate_ids: [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))],
      draft: document.querySelector('#draftBody')?.value || '',
      case_id: window.__td613AshKeep?.current?.().case_id || null,
      action_receipt: root?.querySelector('[data-aia-action-receipt]')?.textContent || '',
      lesson_frame: root?.querySelector('[data-aia-stage]')?.dataset.frame || null,
      body_held: document.body.dataset.ashAiaHeld || null
    };
  }, label);
}
async function assertClickable(locator, label) {
  await locator.scrollIntoViewIfNeeded();
  const result = await locator.evaluate(node => {
    const rect = node.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return { hit: hit?.id || hit?.tagName || null, contained: node === hit || node.contains(hit) };
  });
  assert(result.contained, `${label} is covered by ${result.hit || 'an unknown element'}.`);
}
async function journey(browser, profile, options, report) {
  const context = await browser.newContext(options);
  await context.addInitScript(() => { localStorage.clear(); sessionStorage.clear(); });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  attachObservers(page, report, profile);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitReady(page);

  const first = await snap(page, `${profile}-first-use`);
  assert(first.root_visible && first.route === 'EXPERIENTIAL' && first.task === 'setup', `${profile}: first-use task guide is not ready.`);
  assert(first.ingress_visible && first.profile_visible && first.new_case_visible && first.demo_visible, `${profile}: exact ingress controls are not visible.`);
  assert(first.ingress_position !== 'fixed' && first.new_case_in_viewport, `${profile}: exact ingress still blocks or falls below the initial viewport.`);
  assert(first.document.overflow <= 2 && first.clipped_controls.length === 0 && first.duplicate_ids.length === 0, `${profile}: first-use layout integrity failed.`);
  await assertClickable(page.locator('#newCase'), `${profile}: New Case`);
  report.steps.push(first);
  await page.screenshot({ path: path.join(out, `${browserName}-${profile}-first-use.png`), fullPage: true });

  await page.locator('#newTitle').fill(`AIA2 ${profile} task-continuity case`);
  await page.locator('#newProfile').selectOption('research');
  await page.locator('#newCase').click();
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.current?.().case_id));
  await page.waitForFunction(() => {
    const visible = node => node && getComputedStyle(node).display !== 'none' && node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0;
    return window.__td613AshLiveAIA?.current?.().task === 'document'
      && visible(document.querySelector('body > main'))
      && visible(document.querySelector('body > .workspace-rail'));
  });
  const opened = await snap(page, `${profile}-case-open`);
  assert(opened.case_id && opened.route === 'EXPERIENTIAL' && opened.task === 'document', `${profile}: case setup did not preserve the experiential task path.`);
  assert(opened.main_visible && opened.rail_visible && !opened.ingress_visible, `${profile}: exact work did not replace ingress after case creation.`);
  report.steps.push(opened);

  await page.locator('[data-aia-task="document"]').click();
  await page.waitForFunction(() => document.querySelector('#workspace-draft')?.classList.contains('active') && document.querySelector('#localTextFile')?.getClientRects().length > 0);
  const draftOpen = await snap(page, `${profile}-draft-open`);
  assert(draftOpen.route === 'EXPERIENTIAL' && draftOpen.active_workspace === 'workspace-draft' && draftOpen.local_file_visible, `${profile}: local document task ejected from the experiential route.`);
  const text = `TD613 AIA2 synthetic local document for ${profile}; no recipient route.`;
  await page.locator('#localTextFile').setInputFiles({ name: 'aia2-local.txt', mimeType: 'text/plain', buffer: Buffer.from(text) });
  await page.waitForFunction(expected => document.querySelector('#draftBody')?.value?.includes(expected), text);
  await page.waitForFunction(() => window.__td613AshLiveAIA?.current?.().task === 'custody');
  const documentOpen = await snap(page, `${profile}-document-open`);
  assert(documentOpen.draft.includes(text) && documentOpen.route === 'EXPERIENTIAL' && documentOpen.task === 'custody', `${profile}: local document did not advance the task path.`);
  report.steps.push(draftOpen, documentOpen);

  const beforeLesson = await snap(page, `${profile}-before-explanation`);
  await page.locator('[data-aia-play]').click();
  await page.waitForTimeout(3300);
  const afterLesson = await snap(page, `${profile}-after-explanation`);
  assert(afterLesson.case_id === beforeLesson.case_id, `${profile}: explanation changed the case.`);
  assert(JSON.stringify(afterLesson.lifecycle_semantics) === JSON.stringify(beforeLesson.lifecycle_semantics), `${profile}: explanation changed canonical lifecycle semantics.`);
  assert(afterLesson.draft === beforeLesson.draft && afterLesson.action_receipt === beforeLesson.action_receipt, `${profile}: explanation changed work or created an action receipt.`);
  report.steps.push(beforeLesson, afterLesson);

  for (const routeName of ['CUSTODIAL', 'AUDIT', 'IMPLEMENTATION', 'EXPERIENTIAL']) {
    await page.locator(`[data-aia-route="${routeName}"]`).click();
    await page.waitForFunction(expected => window.__td613AshLiveAIA?.current?.().route === expected, routeName);
    const routed = await snap(page, `${profile}-${routeName.toLowerCase()}`);
    assert(routed.main_visible && routed.rail_visible, `${profile}/${routeName}: exact work disappeared.`);
    assert(routed.case_id === beforeLesson.case_id && routed.draft === beforeLesson.draft, `${profile}/${routeName}: route changed governed work.`);
    report.steps.push(routed);
  }

  await page.locator('[data-aia-rest]').click();
  await page.waitForFunction(() => window.__td613AshLiveAIA?.current?.().resting === true);
  const resting = await snap(page, `${profile}-resting`);
  assert(resting.main_visible, `${profile}: Rest hid exact work.`);
  await page.locator('[data-aia-return]').click();
  await page.waitForFunction(() => window.__td613AshLiveAIA?.current?.().resting === false);
  const returned = await snap(page, `${profile}-returned`);
  assert(returned.case_id === beforeLesson.case_id && returned.draft === beforeLesson.draft, `${profile}: Return changed governed work.`);
  assert(returned.document.overflow <= 2 && returned.clipped_controls.length === 0, `${profile}: final layout integrity failed.`);
  report.steps.push(resting, returned);
  await page.screenshot({ path: path.join(out, `${browserName}-${profile}-complete.png`), fullPage: true });
  await context.close();
  return returned;
}

assert(browserType, `Unsupported browser: ${browserName}`);
await fs.mkdir(out, { recursive: true });
const report = {
  schema: 'td613.ash.aia2-task-continuity-browser-evidence/v0.2',
  status: 'RUNNING', browser: browserName, base_url: base, source_packet_commit: sourceCommit,
  production_observation: production, profiles: {}, steps: [], console_errors: [], page_errors: [],
  http_errors: [], external_requests: [], non_read_requests: [],
  authority: { counts_as_human_evidence: false, authorizes_child_study: false, authorizes_release: false, closes_program: false }
};
let failure = null;
try {
  const browser = await browserType.launch({ headless: true });
  try {
    report.profiles.desktop = await journey(browser, 'desktop', { viewport: { width: 1440, height: 900 }, colorScheme: 'dark', reducedMotion: 'no-preference' }, report);
    const mobile = browserName === 'webkit' ? { isMobile: true, hasTouch: true } : { hasTouch: true };
    report.profiles.mobile = await journey(browser, 'mobile', { viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'no-preference', ...mobile }, report);
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
console.log(JSON.stringify({ status: report.status, browser: browserName, profiles: Object.keys(report.profiles), artifact: path.join(out, 'ash-aia2-task-continuity.json') }, null, 2));
