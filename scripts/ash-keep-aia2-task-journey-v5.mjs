import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const browserName = String(process.env.TD613_BROWSER || 'chromium');
const browserType = { chromium, firefox, webkit }[browserName];
const outputDir = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-aia2-${browserName}`);
const sourcePacketCommit = String(process.env.TD613_SOURCE_PACKET_COMMIT || '').trim() || null;
const productionObservation = process.env.TD613_PRODUCTION_OBSERVATION === 'true';
const target = `${base}/dome-world/ash-keep.html?presentation=aia`;

function assert(value, message) {
  if (!value) throw new Error(message);
}

function governedLifecycle(lifecycle) {
  if (!lifecycle) return null;
  const { digest, ...semantics } = lifecycle;
  return semantics;
}

function observe(page, report, profile) {
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

async function snapshot(page, label) {
  return page.evaluate(labelValue => {
    const visible = node => {
      if (!node) return false;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity) > 0
        && rect.width > 0
        && rect.height > 0;
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
        if (/(auto|scroll)/.test(style.overflowX) && parent.scrollWidth > parent.clientWidth + 1) {
          horizontalLane = true;
          break;
        }
      }
      return !horizontalLane && (rect.left < -1 || rect.right > innerWidth + 1);
    }).map(node => node.id || node.textContent?.trim().slice(0, 50) || node.tagName);
    const current = window.__td613AshLiveAIA?.current?.() || null;
    const root = document.querySelector('#ashAiaMembrane');
    const launch = document.querySelector('#launch');
    return {
      label: labelValue,
      route: current?.route || null,
      task: current?.task || null,
      resting: current?.resting || false,
      package_digest: current?.package_digest || null,
      action_receipt: current?.latest_action_receipt || null,
      render_receipt: current?.latest_render_receipt || null,
      lifecycle: lifecycle ? {
        digest: receipt?.lifecycle_digest || null,
        state: lifecycle.state,
        next_action: lifecycle.next_action,
        gates: lifecycle.gates,
        holds: lifecycle.holds,
        references: lifecycle.references
      } : null,
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

async function assertClickable(locator, label) {
  await locator.scrollIntoViewIfNeeded();
  const hit = await locator.evaluate(node => {
    const rect = node.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return { ok: top === node || node.contains(top), top: top?.id || top?.className || top?.tagName || null };
  });
  assert(hit.ok, `${label} is covered by ${hit.top || 'an unknown element'}.`);
}

async function waitForAia(page) {
  await page.waitForFunction(() => {
    const current = window.__td613AshLiveAIA?.current?.();
    return document.documentElement.dataset.ashAiaReady === 'true'
      && document.documentElement.dataset.ashAiaIngress === 'INTEGRATED_EXACT_CONTROLS'
      && current?.task_continuity_required === true
      && current?.latest_render_receipt
      && document.body.dataset.ashAiaHeld !== 'true';
  }, null, { timeout: 60_000 });
}

async function waitForCaseLifecycleConvergence(page) {
  await page.waitForFunction(() => {
    const caseId = window.__td613AshKeep?.current?.().case_id;
    if (!caseId) return false;
    let receipt = null;
    try { receipt = JSON.parse(document.querySelector('#lifecycleReceipt')?.textContent || 'null'); } catch {}
    const lifecycle = receipt?.lifecycle;
    return lifecycle?.references?.case_id === caseId
      && Boolean(lifecycle?.references?.case_map_digest)
      && lifecycle?.gates?.map === true;
  }, null, { timeout: 60_000 });
}

async function runProfile(browser, profile, options, report) {
  const context = await browser.newContext(options);
  await context.addInitScript(() => { localStorage.clear(); sessionStorage.clear(); });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  observe(page, report, profile);

  await page.goto(target, { waitUntil: 'domcontentloaded' });
  await waitForAia(page);

  const first = await snapshot(page, `${profile}-first-use`);
  report.steps.push(first);
  assert(first.root_visible, `${profile}: guide invisible.`);
  assert(first.route === 'EXPERIENTIAL', `${profile}: default route ${first.route}.`);
  assert(first.task === 'setup', `${profile}: default task ${first.task}.`);
  assert(first.ingress_visible && first.profile_visible && first.new_case_visible && first.demo_visible, `${profile}: exact ingress incomplete.`);
  assert(first.ingress_position !== 'fixed', `${profile}: ingress is fixed.`);
  assert(first.new_case_in_viewport, `${profile}: New Case below fold.`);
  assert(first.overflow <= 2 && first.clipped.length === 0 && first.duplicates.length === 0, `${profile}: first-use layout failed.`);
  await assertClickable(page.locator('#newCase'), `${profile}: New Case`);
  await page.screenshot({ path: path.join(outputDir, `${browserName}-${profile}-first-use.png`), fullPage: true });

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
  await waitForCaseLifecycleConvergence(page);
  const opened = await snapshot(page, `${profile}-case-open`);
  report.steps.push(opened);
  assert(opened.case_id, `${profile}: no case ID.`);
  assert(opened.route === 'EXPERIENTIAL', `${profile}: case route ${opened.route}.`);
  assert(opened.task === 'document', `${profile}: post-case task ${opened.task}.`);
  assert(opened.main_visible && opened.rail_visible && !opened.ingress_visible, `${profile}: exact work did not replace ingress.`);

  await page.locator('[data-aia-task="document"]').click();
  await page.waitForFunction(() => document.querySelector('#workspace-draft')?.classList.contains('active')
    && document.querySelector('#localTextFile')?.getClientRects().length > 0);
  const draftOpen = await snapshot(page, `${profile}-draft-open`);
  report.steps.push(draftOpen);
  assert(draftOpen.route === 'EXPERIENTIAL', `${profile}: Draft changed route to ${draftOpen.route}.`);
  assert(draftOpen.workspace === 'workspace-draft' && draftOpen.file_visible, `${profile}: local file input unavailable.`);

  const text = `TD613 AIA2 synthetic local document for ${profile}; no recipient route.`;
  await page.locator('#localTextFile').setInputFiles({ name: 'aia2-local.txt', mimeType: 'text/plain', buffer: Buffer.from(text) });
  await page.waitForFunction(expected => {
    const current = window.__td613AshLiveAIA?.current?.();
    return document.querySelector('#draftBody')?.value?.includes(expected)
      && document.querySelector('#localTextFile')?.files?.length === 1
      && current?.route === 'EXPERIENTIAL'
      && current?.task === 'custody';
  }, text);
  await waitForCaseLifecycleConvergence(page);
  const documentOpen = await snapshot(page, `${profile}-document-open`);
  report.steps.push(documentOpen);
  assert(documentOpen.draft.includes(text), `${profile}: draft mismatch.`);
  assert(documentOpen.file_count === 1, `${profile}: file count ${documentOpen.file_count}.`);
  assert(documentOpen.route === 'EXPERIENTIAL', `${profile}: file route ${documentOpen.route}.`);
  assert(documentOpen.task === 'custody', `${profile}: file task ${documentOpen.task}.`);

  const before = await snapshot(page, `${profile}-before-lesson`);
  await page.locator('[data-aia-play]').click();
  await page.waitForTimeout(3300);
  const after = await snapshot(page, `${profile}-after-lesson`);
  report.steps.push(before, after);
  assert(after.case_id === before.case_id, `${profile}: lesson changed case.`);
  assert(JSON.stringify(governedLifecycle(after.lifecycle)) === JSON.stringify(governedLifecycle(before.lifecycle)), `${profile}: lesson changed governed lifecycle semantics.`);
  assert(after.draft === before.draft, `${profile}: lesson changed draft.`);
  assert(after.action_receipt === before.action_receipt, `${profile}: lesson created action receipt.`);

  for (const route of ['CUSTODIAL', 'AUDIT', 'IMPLEMENTATION', 'EXPERIENTIAL']) {
    await page.locator(`[data-aia-route="${route}"]`).click();
    await page.waitForFunction(expected => window.__td613AshLiveAIA?.current?.().route === expected, route);
    const routed = await snapshot(page, `${profile}-${route.toLowerCase()}`);
    report.steps.push(routed);
    assert(routed.main_visible && routed.rail_visible, `${profile}/${route}: exact work invisible.`);
    assert(routed.case_id === before.case_id && routed.draft === before.draft, `${profile}/${route}: governed work changed.`);
  }

  await page.locator('[data-aia-rest]').click();
  await page.waitForFunction(() => window.__td613AshLiveAIA?.current?.().resting === true);
  const resting = await snapshot(page, `${profile}-resting`);
  report.steps.push(resting);
  assert(resting.main_visible, `${profile}: Rest hid exact work.`);

  await page.locator('[data-aia-return]').click();
  await page.waitForFunction(() => window.__td613AshLiveAIA?.current?.().resting === false);
  const returned = await snapshot(page, `${profile}-returned`);
  report.steps.push(returned);
  assert(returned.case_id === before.case_id && returned.draft === before.draft, `${profile}: Return changed work.`);
  assert(returned.overflow <= 2 && returned.clipped.length === 0, `${profile}: final layout failed (${returned.clipped.join(', ')}).`);
  await page.screenshot({ path: path.join(outputDir, `${browserName}-${profile}-complete.png`), fullPage: true });

  await context.close();
  return returned;
}

assert(browserType, `Unsupported browser: ${browserName}`);
await fs.mkdir(outputDir, { recursive: true });
const report = {
  schema: 'td613.ash.aia2-task-continuity-browser-evidence/v0.5',
  status: 'RUNNING',
  browser: browserName,
  base_url: base,
  source_packet_commit: sourcePacketCommit,
  production_observation: productionObservation,
  profiles: {},
  steps: [],
  console_errors: [],
  page_errors: [],
  http_errors: [],
  external_requests: [],
  non_read_requests: [],
  authority: {
    counts_as_human_evidence: false,
    authorizes_child_study: false,
    authorizes_release: false,
    closes_program: false
  }
};

let terminalError = null;
try {
  const browser = await browserType.launch({ headless: true });
  try {
    report.profiles.desktop = await runProfile(browser, 'desktop', {
      viewport: { width: 1440, height: 900 }, colorScheme: 'dark', reducedMotion: 'no-preference'
    }, report);
    const mobileFlags = browserName === 'webkit' ? { isMobile: true, hasTouch: true } : { hasTouch: true };
    report.profiles.mobile = await runProfile(browser, 'mobile', {
      viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'no-preference', ...mobileFlags
    }, report);
  } finally {
    await browser.close();
  }
  assert(report.console_errors.length === 0, `Console errors: ${JSON.stringify(report.console_errors)}`);
  assert(report.page_errors.length === 0, `Page errors: ${JSON.stringify(report.page_errors)}`);
  assert(report.http_errors.length === 0, `HTTP errors: ${JSON.stringify(report.http_errors)}`);
  assert(report.external_requests.length === 0, `External requests: ${JSON.stringify(report.external_requests)}`);
  assert(report.non_read_requests.length === 0, `Unexpected write requests: ${JSON.stringify(report.non_read_requests)}`);
  report.status = 'PASS';
} catch (error) {
  terminalError = error;
  report.status = 'HELD';
  report.hold_reason = error.message;
} finally {
  report.completed_at = new Date().toISOString();
  await fs.writeFile(path.join(outputDir, 'ash-aia2-task-continuity.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

if (terminalError) throw terminalError;
console.log(JSON.stringify({
  status: report.status,
  browser: browserName,
  profiles: Object.keys(report.profiles),
  artifact: path.join(outputDir, 'ash-aia2-task-continuity.json')
}, null, 2));