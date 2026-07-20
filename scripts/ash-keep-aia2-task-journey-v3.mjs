import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const name = String(process.env.TD613_BROWSER || 'chromium');
const type = { chromium, firefox, webkit }[name];
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-aia2-${name}`);
const source = String(process.env.TD613_SOURCE_PACKET_COMMIT || '').trim() || null;
const production = process.env.TD613_PRODUCTION_OBSERVATION === 'true';
const target = `${base}/dome-world/ash-keep.html?presentation=aia`;
const fail = message => { throw new Error(message); };
const requireValue = (value, message) => value || fail(message);

function observe(page, report, profile) {
  page.on('console', message => { if (message.type() === 'error') report.console_errors.push({ profile, text: message.text() }); });
  page.on('pageerror', error => report.page_errors.push({ profile, text: error.message }));
  page.on('request', request => {
    const method = request.method();
    const url = request.url();
    if (!['GET', 'HEAD'].includes(method)) report.non_read_requests.push({ profile, method, url });
    if (new URL(url).origin !== new URL(base).origin) report.external_requests.push({ profile, method, url });
  });
  page.on('response', response => {
    if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) report.http_errors.push({ profile, status: response.status(), url: response.url() });
  });
}

async function state(page, label) {
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
    let receipt = null;
    try { receipt = JSON.parse(document.querySelector('#lifecycleReceipt')?.textContent || 'null'); } catch {}
    const lifecycle = receipt?.lifecycle || null;
    const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
    const controls = [...document.querySelectorAll('button,input,select,textarea')].filter(visible);
    const clipped = controls.filter(node => {
      const rect = node.getBoundingClientRect();
      let horizontalLane = false;
      for (let parent = node.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        if (/(auto|scroll)/.test(style.overflowX) && parent.scrollWidth > parent.clientWidth + 1) { horizontalLane = true; break; }
      }
      return !horizontalLane && (rect.left < -1 || rect.right > innerWidth + 1);
    }).map(node => node.id || node.textContent?.trim().slice(0, 50) || node.tagName);
    const root = document.querySelector('#ashAiaMembrane');
    const launch = document.querySelector('#launch');
    const current = window.__td613AshLiveAIA?.current?.() || null;
    return {
      label: labelValue,
      route: current?.route || null,
      task: current?.task || null,
      resting: current?.resting || false,
      current,
      lifecycle: lifecycle ? {
        digest: receipt.lifecycle_digest || null,
        state: lifecycle.state,
        next_action: lifecycle.next_action,
        gates: lifecycle.gates,
        holds: lifecycle.holds,
        references: lifecycle.references
      } : null,
      package_digest: current?.package_digest || null,
      action_receipt: current?.latest_action_receipt || null,
      render_receipt: current?.latest_render_receipt || null,
      case_id: window.__td613AshKeep?.current?.().case_id || null,
      draft: document.querySelector('#draftBody')?.value || '',
      file_count: document.querySelector('#localTextFile')?.files?.length || 0,
      workspace: document.querySelector('.workspace.active')?.id || null,
      root_visible: visible(root),
      ingress_visible: visible(launch),
      ingress_position: launch ? getComputedStyle(launch).position : null,
      profile_visible: visible(document.querySelector('#newProfile')),
      new_case_visible: visible(document.querySelector('#newCase')),
      new_case_in_viewport: inViewport(document.querySelector('#newCase')),
      demo_visible: visible(document.querySelector('#startDemo')),
      main_visible: visible(document.querySelector('body > main')),
      rail_visible: visible(document.querySelector('body > .workspace-rail')),
      file_visible: visible(document.querySelector('#localTextFile')),
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      clipped,
      duplicates: [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))],
      held: document.body.dataset.ashAiaHeld || null,
      lesson_frame: root?.querySelector('[data-aia-stage]')?.dataset.frame || null
    };
  }, label);
}

async function clickable(locator, label) {
  await locator.scrollIntoViewIfNeeded();
  const hit = await locator.evaluate(node => {
    const rect = node.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return { ok: top === node || node.contains(top), top: top?.id || top?.tagName || null };
  });
  requireValue(hit.ok, `${label} is covered by ${hit.top || 'an unknown element'}.`);
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

async function runProfile(browser, profile, options, report) {
  const context = await browser.newContext(options);
  await context.addInitScript(() => { localStorage.clear(); sessionStorage.clear(); });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  observe(page, report, profile);
  await page.goto(target, { waitUntil: 'domcontentloaded' });
  await waitReady(page);

  const first = await state(page, `${profile}-first-use`);
  report.steps.push(first);
  requireValue(first.root_visible, `${profile}: guide invisible.`);
  requireValue(first.route === 'EXPERIENTIAL', `${profile}: default route ${first.route}.`);
  requireValue(first.task === 'setup', `${profile}: default task ${first.task}.`);
  requireValue(first.ingress_visible && first.profile_visible && first.new_case_visible && first.demo_visible, `${profile}: exact ingress incomplete.`);
  requireValue(first.ingress_position !== 'fixed', `${profile}: ingress is fixed.`);
  requireValue(first.new_case_in_viewport, `${profile}: New Case below fold.`);
  requireValue(first.overflow <= 2 && first.clipped.length === 0 && first.duplicates.length === 0, `${profile}: first-use layout failed.`);
  await clickable(page.locator('#newCase'), `${profile}: New Case`);
  await page.screenshot({ path: path.join(out, `${name}-${profile}-first-use.png`), fullPage: true });

  await page.locator('#newTitle').fill(`AIA2 ${profile} case`);
  await page.locator('#newProfile').selectOption('research');
  await page.locator('#newCase').click();
  await page.waitForFunction(() => {
    const visible = node => node && getComputedStyle(node).display !== 'none' && node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0;
    return Boolean(window.__td613AshKeep?.current?.().case_id)
      && window.__td613AshLiveAIA?.current?.().task === 'document'
      && visible(document.querySelector('body > main'))
      && visible(document.querySelector('body > .workspace-rail'));
  });
  const opened = await state(page, `${profile}-case-open`);
  report.steps.push(opened);
  requireValue(opened.case_id, `${profile}: no case ID.`);
  requireValue(opened.route === 'EXPERIENTIAL', `${profile}: case route ${opened.route}.`);
  requireValue(opened.task === 'document', `${profile}: post-case task ${opened.task}.`);
  requireValue(opened.main_visible && opened.rail_visible && !opened.ingress_visible, `${profile}: exact work did not replace ingress.`);

  await page.locator('[data-aia-task="document"]').click();
  await page.waitForFunction(() => document.querySelector('#workspace-draft')?.classList.contains('active') && document.querySelector('#localTextFile')?.getClientRects().length > 0);
  const draftOpen = await state(page, `${profile}-draft-open`);
  report.steps.push(draftOpen);
  requireValue(draftOpen.route === 'EXPERIENTIAL', `${profile}: Draft changed route to ${draftOpen.route}.`);
  requireValue(draftOpen.workspace === 'workspace-draft' && draftOpen.file_visible, `${profile}: local file input unavailable.`);

  const text = `TD613 AIA2 synthetic local document for ${profile}; no recipient route.`;
  await page.locator('#localTextFile').setInputFiles({ name: 'aia2-local.txt', mimeType: 'text/plain', buffer: Buffer.from(text) });
  await page.waitForFunction(expected => {
    const current = window.__td613AshLiveAIA?.current?.();
    return document.querySelector('#draftBody')?.value?.includes(expected)
      && document.querySelector('#localTextFile')?.files?.length === 1
      && current?.route === 'EXPERIENTIAL'
      && current?.task === 'custody';
  }, text);
  const documentOpen = await state(page, `${profile}-document-open`);
  report.steps.push(documentOpen);
  requireValue(documentOpen.draft.includes(text), `${profile}: draft mismatch (${JSON.stringify(documentOpen.draft)}).`);
  requireValue(documentOpen.file_count === 1, `${profile}: file count ${documentOpen.file_count}.`);
  requireValue(documentOpen.route === 'EXPERIENTIAL', `${profile}: file route ${documentOpen.route}.`);
  requireValue(documentOpen.task === 'custody', `${profile}: file task ${documentOpen.task}.`);

  const before = await state(page, `${profile}-before-lesson`);
  await page.locator('[data-aia-play]').click();
  await page.waitForTimeout(3300);
  const after = await state(page, `${profile}-after-lesson`);
  report.steps.push(before, after);
  requireValue(after.case_id === before.case_id, `${profile}: lesson changed case.`);
  requireValue(JSON.stringify(after.lifecycle) === JSON.stringify(before.lifecycle), `${profile}: lesson changed lifecycle semantics.`);
  requireValue(after.draft === before.draft, `${profile}: lesson changed draft.`);
  requireValue(after.action_receipt === before.action_receipt, `${profile}: lesson created action receipt.`);

  for (const route of ['CUSTODIAL', 'AUDIT', 'IMPLEMENTATION', 'EXPERIENTIAL']) {
    await page.locator(`[data-aia-route="${route}"]`).click();
    await page.waitForFunction(expected => window.__td613AshLiveAIA?.current?.().route === expected, route);
    const routed = await state(page, `${profile}-${route.toLowerCase()}`);
    report.steps.push(routed);
    requireValue(routed.main_visible && routed.rail_visible, `${profile}/${route}: exact work invisible.`);
    requireValue(routed.case_id === before.case_id && routed.draft === before.draft, `${profile}/${route}: governed work changed.`);
  }

  await page.locator('[data-aia-rest]').click();
  await page.waitForFunction(() => window.__td613AshLiveAIA?.current?.().resting === true);
  const resting = await state(page, `${profile}-resting`);
  report.steps.push(resting);
  requireValue(resting.main_visible, `${profile}: Rest hid exact work.`);
  await page.locator('[data-aia-return]').click();
  await page.waitForFunction(() => window.__td613AshLiveAIA?.current?.().resting === false);
  const returned = await state(page, `${profile}-returned`);
  report.steps.push(returned);
  requireValue(returned.case_id === before.case_id && returned.draft === before.draft, `${profile}: Return changed work.`);
  requireValue(returned.overflow <= 2 && returned.clipped.length === 0, `${profile}: final layout failed.`);
  await page.screenshot({ path: path.join(out, `${name}-${profile}-complete.png`), fullPage: true });
  await context.close();
  return returned;
}

requireValue(type, `Unsupported browser: ${name}`);
await fs.mkdir(out, { recursive: true });
const report = {
  schema: 'td613.ash.aia2-task-continuity-browser-evidence/v0.3',
  status: 'RUNNING', browser: name, base_url: base, source_packet_commit: source,
  production_observation: production, profiles: {}, steps: [], console_errors: [], page_errors: [],
  http_errors: [], external_requests: [], non_read_requests: [],
  authority: { counts_as_human_evidence: false, authorizes_child_study: false, authorizes_release: false, closes_program: false }
};
let error = null;
try {
  const browser = await type.launch({ headless: true });
  try {
    report.profiles.desktop = await runProfile(browser, 'desktop', { viewport: { width: 1440, height: 900 }, colorScheme: 'dark', reducedMotion: 'no-preference' }, report);
    const mobile = name === 'webkit' ? { isMobile: true, hasTouch: true } : { hasTouch: true };
    report.profiles.mobile = await runProfile(browser, 'mobile', { viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'no-preference', ...mobile }, report);
  } finally { await browser.close(); }
  requireValue(report.console_errors.length === 0, `Console errors: ${JSON.stringify(report.console_errors)}`);
  requireValue(report.page_errors.length === 0, `Page errors: ${JSON.stringify(report.page_errors)}`);
  requireValue(report.http_errors.length === 0, `HTTP errors: ${JSON.stringify(report.http_errors)}`);
  requireValue(report.external_requests.length === 0, `External requests: ${JSON.stringify(report.external_requests)}`);
  requireValue(report.non_read_requests.length === 0, `Unexpected write requests: ${JSON.stringify(report.non_read_requests)}`);
  report.status = 'PASS';
} catch (caught) {
  error = caught; report.status = 'HELD'; report.hold_reason = caught.message;
} finally {
  report.completed_at = new Date().toISOString();
  await fs.writeFile(path.join(out, 'ash-aia2-task-continuity.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}
if (error) throw error;
console.log(JSON.stringify({ status: report.status, browser: name, profiles: Object.keys(report.profiles), artifact: path.join(out, 'ash-aia2-task-continuity.json') }, null, 2));
