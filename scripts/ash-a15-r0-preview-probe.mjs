import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/+$/, '');
const previewPath = process.env.TD613_A15_R0_PATH || '/app/dome-world/previews/a15-r0/index.html';
const url = `${base}${previewPath.startsWith('/') ? previewPath : `/${previewPath}`}`;
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-a15-r0';
const browserName = String(process.env.TD613_BROWSER || 'chromium').toLowerCase();
const browserTypes = { chromium, firefox, webkit };
const browserType = browserTypes[browserName];
if (!browserType) throw new TypeError(`Unsupported TD613_BROWSER: ${browserName}`);
await fs.mkdir(artifactDir, { recursive: true });

const report = {
  schema: 'td613.ash.a15-r0.browser-preview-evidence/v0.3-semantic-action-settlement',
  source_status: 'OBSERVED',
  sensor_id: 'playwright-browser-runtime',
  authority_class: 'A1_OBSERVATIONAL',
  browser_engine: browserName,
  url,
  started_at: new Date().toISOString(),
  status: 'OPEN',
  checks: [],
  console_errors: [],
  page_errors: [],
  request_failures: [],
  external_requests: [],
  mutation_requests: [],
  screenshots: [],
  production_mutation: false,
  deployment_authorized: false,
  human_selection_required: true,
  human_closure_required: true,
  arbitrary_sleep_used_for_action_settlement: false
};

function check(name, pass, detail = null) {
  report.checks.push({ name, status: pass ? 'PASS' : 'FAIL', detail });
}

async function visibleText(page, text) {
  return page.getByText(text, { exact: true }).isVisible().catch(() => false);
}

async function parsedReceipt(page) {
  return JSON.parse(await page.locator('#lastReceipt').innerText());
}

async function waitForReceiptAction(page, actionId, timeout = 60_000) {
  await page.waitForFunction(expected => {
    try {
      const text = document.getElementById('lastReceipt')?.textContent || '';
      const receipt = JSON.parse(text);
      return receipt?.action_id === expected;
    } catch {
      return false;
    }
  }, actionId, { timeout });
  return parsedReceipt(page);
}

async function waitForResetProjection(page, timeout = 60_000) {
  await page.waitForFunction(() => {
    try {
      const receipt = JSON.parse(document.getElementById('lastReceipt')?.textContent || '');
      const events = JSON.parse(document.getElementById('observableEvents')?.textContent || '[]');
      return receipt?.action_id === 'RESET'
        && receipt?.state_after?.task_state === 'ARRIVE'
        && receipt?.authority?.raw_bytes_moved === false
        && document.getElementById('taskState')?.textContent?.trim() === 'ARRIVE'
        && Array.isArray(events)
        && events.length === 1
        && events[0]?.action_id === 'RESET';
    } catch {
      return false;
    }
  }, null, { timeout });
}

async function installedChromiumExecutable() {
  const candidates = process.platform === 'win32'
    ? [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
      ]
    : [];
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {}
  }
  return null;
}

const executablePath = browserName === 'chromium'
  ? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || await installedChromiumExecutable()
  : null;
report.browser_runtime = executablePath ? 'installed-chromium' : `playwright-managed-${browserName}`;
const browser = await browserType.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 820 },
    colorScheme: 'dark',
    reducedMotion: 'no-preference'
  });

  page.on('console', message => {
    if (message.type() === 'error') report.console_errors.push(message.text());
  });
  page.on('pageerror', error => report.page_errors.push(error.message));
  page.on('requestfailed', request => report.request_failures.push({
    url: request.url(),
    failure: request.failure()?.errorText || 'unknown'
  }));
  page.on('request', request => {
    const requestUrl = new URL(request.url());
    const baseUrl = new URL(base);
    if (requestUrl.origin !== baseUrl.origin) report.external_requests.push(request.url());
    if (!['GET', 'HEAD'].includes(request.method())) report.mutation_requests.push({
      method: request.method(),
      url: request.url(),
      post_data_present: Boolean(request.postData())
    });
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.locator('html[data-a15-r0-ready="true"]').waitFor({ timeout: 30_000 });
  await page.locator('html[data-a15-r0-open-field="ready"]').waitFor({ timeout: 30_000 });

  for (const truth of [
    'Preview',
    'Synthetic',
    'Noncanonical',
    'Production unchanged',
    'No external transmission',
    'Human selection required'
  ]) check(`truth:${truth}`, await visibleText(page, truth));

  check('fixture loaded', (await page.locator('#fixtureSummary').innerText()).includes('a15r0_fixture_synthetic_research_v01'));
  check('open field ready', await page.locator('#fieldObservability .field-metric').count() === 4);
  check('bounded envelope visibly held', (await page.locator('#fieldEnvelopeStatus').innerText()).includes('HELD'));
  check('hypothesis frontier rendered', await page.locator('#fieldHypothesisRegistry .hypothesis-card').count() >= 8);
  check('P1 honest hold', (await page.locator('#projectionRegistry').innerText()).includes('Minimal Ash') && (await page.locator('#projectionRegistry').innerText()).includes('NOT IMPLEMENTED'));
  check('P2 honest hold', (await page.locator('#projectionRegistry').innerText()).includes('Proto-Loom') && (await page.locator('#projectionRegistry').innerText()).includes('NOT IMPLEMENTED'));
  check('owner rows', await page.locator('#ownerRegistry tr').count() === 7);

  const actionSequence = [
    ['bind-reference', 'BIND_REFERENCE'],
    ['form-relation', 'FORM_RELATION'],
    ['compare-route', 'COMPARE_ROUTE'],
    ['preserve-result', 'PRESERVE'],
    ['return-custody', 'RETURN']
  ];
  for (const [controlId, expectedState] of actionSequence) {
    const control = page.locator(`#${controlId}`);
    check(`${controlId}:visible`, await control.isVisible());
    check(`${controlId}:enabled`, await control.isEnabled());
    await control.click();
    await page.locator('#taskState').filter({ hasText: expectedState }).waitFor();
    const receipt = await waitForReceiptAction(page, expectedState);
    check(`${controlId}:receipt`, receipt.action_id === expectedState && receipt.status === 'OPEN', receipt.receipt_id);
    check(`${controlId}:authority`, Object.values(receipt.authority).every(value => value === false));
    check(`${controlId}:raw transport`, receipt.authority.raw_bytes_moved === false && receipt.authority.external_send === false);
  }

  const beforeRestState = await page.locator('#taskState').innerText();
  await page.locator('#rest-run').click();
  const restReceipt = await waitForReceiptAction(page, 'REST');
  await page.locator('#worldAnswer').filter({ hasText: 'Active demand has stopped.' }).waitFor({ timeout: 60_000 });
  check('Rest receipt', restReceipt.action_id === 'REST');
  check('Rest holds task state', await page.locator('#taskState').innerText() === beforeRestState);
  check('Rest world answer', (await page.locator('#worldAnswer').innerText()).includes('Active demand has stopped.'));

  await page.locator('#reset-fixture').click();
  await waitForResetProjection(page);
  const resetReceipt = await parsedReceipt(page);
  const resetEvents = JSON.parse(await page.locator('#observableEvents').innerText());
  check('Reset receipt', resetReceipt.action_id === 'RESET');
  check('Reset preview only', resetReceipt.state_after.task_state === 'ARRIVE' && resetReceipt.authority.raw_bytes_moved === false);
  check('Observable reset event', resetEvents.length === 1 && resetEvents[0]?.action_id === 'RESET');

  const desktopShot = path.join(artifactDir, `a15-r0-${browserName}-desktop.png`);
  await page.screenshot({ path: desktopShot, fullPage: true });
  report.screenshots.push(desktopShot);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('html[data-a15-r0-ready="true"]').waitFor({ timeout: 30_000 });
  await page.locator('html[data-a15-r0-open-field="ready"]').waitFor({ timeout: 30_000 });
  const bodyMetrics = await page.locator('body').evaluate(element => ({
    scroll_width: element.scrollWidth,
    client_width: element.clientWidth
  }));
  check('390px no horizontal loss', bodyMetrics.scroll_width <= bodyMetrics.client_width + 1, bodyMetrics);
  check('reduced-motion static truth', await visibleText(page, 'No external transmission') && await page.locator('#taskSequence').isVisible());
  check('required mobile action visible', await page.locator('#bind-reference').isVisible());
  check('required mobile touch target', (await page.locator('#bind-reference').boundingBox())?.height >= 44);
  check('mobile open field visible', await page.locator('#fieldEnvelopeStatus').isVisible() && await page.locator('#fieldHypothesisRegistry').isVisible());

  const mobileShot = path.join(artifactDir, `a15-r0-${browserName}-mobile-reduced.png`);
  await page.screenshot({ path: mobileShot, fullPage: true });
  report.screenshots.push(mobileShot);

  check('no console errors', report.console_errors.length === 0, report.console_errors);
  check('no page errors', report.page_errors.length === 0, report.page_errors);
  check('no request failures', report.request_failures.length === 0, report.request_failures);
  check('no external requests', report.external_requests.length === 0, report.external_requests);
  check('no mutation requests', report.mutation_requests.length === 0, report.mutation_requests);
} catch (error) {
  report.page_errors.push(error.stack || error.message);
  check('probe completed', false, error.message);
} finally {
  await browser.close();
}

report.completed_at = new Date().toISOString();
report.failed_checks = report.checks.filter(item => item.status === 'FAIL').map(item => item.name);
report.status = report.failed_checks.length === 0 ? 'PASS' : 'HELD';
const artifactPath = path.join(artifactDir, `a15-r0-${browserName}-evidence.json`);
await fs.writeFile(artifactPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  status: report.status,
  browser: browserName,
  checks: report.checks.length,
  failed: report.failed_checks,
  artifact: artifactPath
}, null, 2));
if (report.status !== 'PASS') process.exitCode = 1;
