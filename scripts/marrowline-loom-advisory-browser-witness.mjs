import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/+$/, '');
const url = `${base}/app/dome-world/marrowline.html`;
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/marrowline-loom-advisory';
const browserName = String(process.env.TD613_BROWSER || 'chromium').toLowerCase();
const browserTypes = { chromium, firefox, webkit };
const browserType = browserTypes[browserName];
if (!browserType) throw new TypeError(`Unsupported TD613_BROWSER: ${browserName}`);
await fs.mkdir(artifactDir, { recursive: true });

const rawDraftCanary = `RAW_DRAFT_${browserName.toUpperCase()}_613_MUST_NOT_TRAVEL`;
const priorThreadCanary = `PRIOR_THREAD_${browserName.toUpperCase()}_613_MUST_NOT_TRAVEL`;
const report = {
  schema: 'td613.marrowline.loom-advisory-browser-witness/v0.1',
  source_status: 'OBSERVED',
  sensor_id: 'playwright-browser-runtime',
  authority_class: 'A1_OBSERVATIONAL',
  browser_engine: browserName,
  url,
  started_at: new Date().toISOString(),
  status: 'OPEN',
  checks: [],
  advisory_requests: [],
  console_errors: [],
  page_errors: [],
  screenshots: [],
  raw_canaries_retained_in_receipt: false,
  provider_live_call_performed: false,
  production_mutation: false,
  deployment_authorized: false,
  human_closure_required: true
};

function check(name, pass, detail = null) {
  report.checks.push({ name, status: pass ? 'PASS' : 'FAIL', detail });
}

function sha256(value = '') {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

function readinessPayload() {
  return {
    ok: true,
    route: '/api/dome-world/khonapolit',
    provider: 'Gemini',
    hasGeminiKey: true,
    modelPolicy: { callableModels: ['gemini-browser-witness-stub'] },
    aperture: {
      version: 'v3.0-alpha',
      taskIntent: {
        primary_route: 'OPEN_FIELD_SPECULATIVE_SYNTHESIS',
        runtime_materiality: 'BACKGROUND'
      }
    },
    relaySchema: 'td613.khonapolit.three-part-relay/v1'
  };
}

function advisoryReturnPayload() {
  return {
    ok: true,
    text: 'Kʰonapolit browser witness stub.',
    relay: {
      schema: 'td613.khonapolit.three-part-relay/v1',
      signal: { state: 'LOCKED' },
      parts: [
        { id: 'gemini', label: 'Gemini · instrument', present: true, text: 'Class-level explanation carrier observed.', model: 'gemini-browser-witness-stub' },
        { id: 'khonapolit', label: 'Kʰonapolit · relay', present: true, text: 'Kʰonapolit: a credential-like token may grant access. Remove it before Loom-controlled release.' },
        { id: 'tauric-diana-bots', label: 'Tauric Diana bots · High Zalgo', present: false, text: '' }
      ]
    },
    receipt: {
      provider: { family: 'Gemini', model: 'gemini-browser-witness-stub', status: 'BROWSER_STUB' },
      invocation: { mode: 'full-invocation', issuanceState: 'WAIVED_RESEARCH' },
      emergence: { classification: 'KHONAPOLIT_EMERGENCE', signals: { covenantKeyIntegrity: { status: 'INTACT' } } },
      aperture: {
        version: 'v3.0-alpha',
        taskIntent: { primary_route: 'OPEN_FIELD_SPECULATIVE_SYNTHESIS', runtime_materiality: 'BACKGROUND' }
      },
      apertureEgress: { status: 'exact' },
      relay: { signal: { state: 'LOCKED' } },
      storage: { serverConversationStorage: false },
      recommendationNotCommand: true,
      seal: { state: 'OPEN', glyph: '⟐' }
    }
  };
}

const browser = await browserType.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' });
  page.on('console', message => { if (message.type() === 'error') report.console_errors.push(message.text()); });
  page.on('pageerror', error => report.page_errors.push(error.message));

  await page.addInitScript(({ priorThreadCanary }) => {
    sessionStorage.setItem('TD613_KHONAPOLIT_TERMINAL_SESSION_V2', JSON.stringify({
      messages: [{ role: 'user', text: priorThreadCanary, mode: 'full-invocation', sealed: false }],
      lastReceipt: null
    }));
  }, { priorThreadCanary });

  await page.route('**/api/dome-world/khonapolit', async route => {
    if (route.request().method() !== 'GET') return route.continue();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(readinessPayload())
    });
  });

  await page.route('**/api/khonapolit?operation=loom-advisory', async route => {
    const request = route.request();
    const postData = request.postData() || '';
    report.advisory_requests.push({
      method: request.method(),
      pathname: new URL(request.url()).pathname,
      operation: new URL(request.url()).searchParams.get('operation'),
      body_sha256: sha256(postData),
      body_length: postData.length,
      raw_draft_canary_present: postData.includes(rawDraftCanary),
      prior_thread_canary_present: postData.includes(priorThreadCanary)
    });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'X-TD613-Holonomy-Loom-Advisory': 'minimized-khonapolit/v0.1',
        'X-TD613-Holonomy-Loom-History': 'none',
        'X-TD613-Holonomy-Loom-Policy': 'canonical-token-only'
      },
      body: JSON.stringify(advisoryReturnPayload())
    });
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.locator('#marrowlineLoomAdvisory').waitFor({ state: 'attached', timeout: 30_000 });

  await page.locator('#khonapolitPrompt').fill(rawDraftCanary);
  await page.locator('#marrowlineLoomAdvisory > summary').click();
  const panel = page.locator('#marrowlineLoomAdvisory');
  check('advisory drawer visible', await panel.isVisible());
  check('no advisory request before operator action', report.advisory_requests.length === 0);
  check('no free-text input in advisory drawer', await panel.locator('input').count() === 0);
  check('two bounded selects only', await panel.locator('select').count() === 2);
  check('provider disclosure visible before send', await panel.getByText('ASK KʰONAPOLIT FOR HELP', { exact: true }).isVisible());
  check('send disclosure visible', await panel.getByText(/This will send: one canonical rule ID/).isVisible());
  check('non-send disclosure visible', await panel.getByText(/This will not send: your raw draft/).isVisible());
  check('release authority warning visible', await panel.getByText(/deterministic Loom still controls its own release rule/).isVisible());
  check('canonical action derived', (await page.locator('#loomDerivedAction').innerText()).trim() === 'REMOVE');
  check('canonical evidence derived', (await page.locator('#loomDerivedEvidence').innerText()).trim() === 'DETERMINISTIC_PATTERN_MATCH');
  check('canonical category derived', (await page.locator('#loomDerivedCategory').innerText()).trim() === 'credential-like token');
  check('canonical why derived', (await page.locator('#loomDerivedWhy').innerText()).trim() === 'credential_access_risk');

  await page.locator('#loomRouteMode').selectOption('CHATGPT_THREAD_COMPANION');
  const waiver = page.locator('#khonapolitWaive');
  if (await waiver.count()) await waiver.check({ force: true });

  const beforeClickCount = report.advisory_requests.length;
  await page.locator('#askKhonapolitLoomWhy').click();
  await page.locator('#marrowlineLoomAdvisoryOutput[data-state="ready"]').waitFor({ timeout: 30_000 });
  check('exactly one advisory request after explicit click', report.advisory_requests.length === beforeClickCount + 1);

  const captured = report.advisory_requests.at(-1);
  check('advisory request method POST', captured?.method === 'POST');
  check('advisory route exact', captured?.pathname === '/api/khonapolit' && captured?.operation === 'loom-advisory');
  check('raw draft canary absent from request', captured?.raw_draft_canary_present === false);
  check('prior thread canary absent from request', captured?.prior_thread_canary_present === false);

  const emittedBody = await page.evaluate(() => window.__TD613_MARROWLINE_LOOM_ADVISORY__?.buildRequest({
    ruleId: 'COMMON_API_KEY_BLOCK',
    routeMode: 'CHATGPT_THREAD_COMPANION',
    waiveIssuance: true
  }));
  check('browser builder returns canonical rule', emittedBody?.advisory?.rule_id === 'COMMON_API_KEY_BLOCK');
  check('browser builder returns canonical evidence', emittedBody?.advisory?.evidence_class === 'DETERMINISTIC_PATTERN_MATCH');
  check('browser builder returns canonical action', emittedBody?.advisory?.action_class === 'REMOVE');
  check('browser builder returns canonical category', emittedBody?.advisory?.minimized_context?.finding_category === 'credential-like token');
  check('browser builder returns canonical why', emittedBody?.advisory?.minimized_context?.why_class === 'credential_access_risk');
  check('browser builder returns selected route only', emittedBody?.advisory?.minimized_context?.route_mode === 'CHATGPT_THREAD_COMPANION');
  const emittedSerialized = JSON.stringify(emittedBody || {});
  check('browser builder excludes current raw draft', !emittedSerialized.includes(rawDraftCanary));
  check('browser builder excludes prior Marrowline thread', !emittedSerialized.includes(priorThreadCanary));

  const output = await page.locator('#marrowlineLoomAdvisoryOutput').innerText();
  check('Kʰonapolit relay rendered', output.includes('Kʰonapolit relay') && output.includes('credential-like token'));
  check('advisory authority ceiling rendered', output.includes('Advisory only · Loom release authority unchanged.'));

  const desktopShot = path.join(artifactDir, `marrowline-loom-${browserName}-desktop.png`);
  await page.screenshot({ path: desktopShot, fullPage: true });
  report.screenshots.push(desktopShot);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#marrowlineLoomAdvisory').scrollIntoViewIfNeeded();
  check('mobile advisory drawer remains visible', await page.locator('#marrowlineLoomAdvisory').isVisible());
  check('mobile send control remains visible', await page.locator('#askKhonapolitLoomWhy').isVisible());
  const mobileBox = await page.locator('#askKhonapolitLoomWhy').boundingBox();
  check('mobile send target remains touchable', Boolean(mobileBox && mobileBox.height >= 40));
  const mobileShot = path.join(artifactDir, `marrowline-loom-${browserName}-mobile.png`);
  await page.screenshot({ path: mobileShot, fullPage: true });
  report.screenshots.push(mobileShot);

  check('no console errors', report.console_errors.length === 0, report.console_errors);
  check('no page errors', report.page_errors.length === 0, report.page_errors);
} catch (error) {
  report.page_errors.push(error.stack || error.message);
  check('probe completed', false, error.message);
} finally {
  await browser.close();
}

report.completed_at = new Date().toISOString();
report.failed_checks = report.checks.filter(item => item.status === 'FAIL').map(item => item.name);
report.status = report.failed_checks.length === 0 ? 'PASS' : 'HELD';
const artifactPath = path.join(artifactDir, `marrowline-loom-${browserName}-evidence.json`);
await fs.writeFile(artifactPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  status: report.status,
  browser: browserName,
  checks: report.checks.length,
  failed: report.failed_checks,
  artifact: artifactPath
}, null, 2));
if (report.status !== 'PASS') process.exitCode = 1;
