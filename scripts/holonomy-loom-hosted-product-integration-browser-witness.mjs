import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/+$/, '');
const browserName = String(process.env.TD613_BROWSER || 'chromium').toLowerCase();
const browserTypes = { chromium, firefox, webkit };
const browserType = browserTypes[browserName];
if (!browserType) throw new TypeError(`Unsupported TD613_BROWSER: ${browserName}`);
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/holonomy-loom-hosted-integration';
const route = '/dome-world/holonomy-loom.html';
const url = `${base}${route}`;
await fs.mkdir(artifactDir, { recursive: true });

const canary = `TD613_HOSTED_LOOM_CANARY_${browserName.toUpperCase()}_613`;
const protectedMarker = `HOSTED_PRIVATE_${browserName.toUpperCase()}_613`;
const journeyMarker = `HOSTED_JOURNEY_${browserName.toUpperCase()}_613`;
const observedRequests = [];
let interactionStarted = false;

function safeRequestDescriptor(request) {
  const requestUrl = new URL(request.url());
  const postData = request.postData() || '';
  const encodedCanary = encodeURIComponent(canary);
  return {
    method: request.method(),
    origin: requestUrl.origin,
    pathname: requestUrl.pathname,
    query_present: Boolean(requestUrl.search),
    post_data_present: Boolean(postData),
    canary_present_in_url: request.url().includes(canary) || request.url().includes(encodedCanary),
    canary_present_in_body: postData.includes(canary)
  };
}

async function detailsOpen(locator) {
  return locator.evaluate(node => Boolean(node.open)).catch(() => false);
}

const report = {
  schema: 'td613.holonomy-loom.hosted-product-integration-browser-witness/v0.1',
  status: 'OPEN',
  browser: browserName,
  route,
  interaction_scope: 'LOCAL_RULE_LABORATORY',
  source_status: 'OBSERVED',
  authority_class: 'A1_OBSERVATIONAL',
  production_release_authority: false,
  provider_call_performed: false,
  provider_release_authority: false,
  human_closure_required: true,
  exogenous_witness_credit: 0,
  golden_egg_credit: 0,
  checks: [],
  requests: [],
  page_errors: [],
  console_errors: [],
  screenshots: []
};
const check = (name, pass, detail = null) => report.checks.push({ name, status: pass ? 'PASS' : 'FAIL', detail });

const browser = await browserType.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, colorScheme: 'dark' });
  page.on('pageerror', error => report.page_errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') report.console_errors.push(message.text());
  });
  page.on('request', request => {
    if (interactionStarted) observedRequests.push(safeRequestDescriptor(request));
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  const html = page.locator('html');
  check('hosted route loaded', new URL(page.url()).pathname === route, page.url());
  check('Holonomy Loom entry label visible', await page.getByRole('heading', { name: 'Holonomy Loom', exact: true }).isVisible());
  const laboratory = page.locator('#loomLegacy');
  check('local laboratory starts optional and closed', !(await detailsOpen(laboratory)));
  await laboratory.locator(':scope > summary').click();
  check('local laboratory opens by explicit choice', await detailsOpen(laboratory));
  check('local checker instruction visible', await page.getByText('Before you send it, check what this message carries.', { exact: true }).isVisible());
  check('host boundary declared', await html.getAttribute('data-route-mode') === 'TD613_HOSTED');
  check('provider release authority closed', await html.getAttribute('data-provider-release-authority') === 'false');
  check('production release authority closed', await html.getAttribute('data-production-release') === 'false');
  check('mandatory child route visible', await page.getByText('SEE → CHECK → UNDERSTAND → REST', { exact: true }).isVisible());
  check('return to Ash Keep visible', await page.locator('#ashKeepReturn').isVisible());

  const protection = page.locator('#protectionRules');
  const providerDisclosure = page.locator('#providerDisclosure');
  const why = page.locator('#whyDetails');
  check('protection rules closed at arrival', !(await detailsOpen(protection)));
  check('provider help remains optional at arrival', !(await detailsOpen(providerDisclosure)));
  check('technical explanation closed at arrival', !(await detailsOpen(why)));

  await protection.locator('summary').click();
  check('protection rules opened by explicit human action', await detailsOpen(protection));

  interactionStarted = true;
  await page.locator('#message').fill(`ordinary ${canary} ${protectedMarker} ${journeyMarker}`);
  await page.locator('#protected').fill(protectedMarker);
  await page.locator('#journeys').fill(journeyMarker);
  await page.locator('#check').click();
  await page.locator('#result.show').waitFor({ timeout: 10_000 });

  check('deterministic REMOVE blocks as RED', (await page.locator('#statusLight').innerText()).trim() === 'RED');
  check('raw copy remains disabled on RED', await page.locator('#copyChecked').isDisabled());
  check('safer copy is offered on RED', await page.locator('#makeSafer').isEnabled());
  check('declared journey relation visible', (await page.locator('#journeyResult').innerText()).includes('another journey'));
  check('technical explanation remains optional after consequence', !(await detailsOpen(why)));

  await page.locator('#makeSafer').click();
  check('safer copy settles without raw release authority', (await page.locator('#copyStatus').innerText()).trim().length > 0);

  await providerDisclosure.locator('summary').click();
  check('provider disclosure opens only by explicit action', await detailsOpen(providerDisclosure));
  check('local checker disclosure states no model call', (await providerDisclosure.innerText()).includes('No model is called by this local checker.'));
  check('AI workspace transmission is separately disclosed', (await providerDisclosure.innerText()).includes('Its Run button sends only your task, selected documents and portable rules.'));

  await page.locator('#message').fill(`ordinary ${canary}`);
  await page.locator('#protected').fill('');
  await page.locator('#journeys').fill('');
  await page.locator('#check').click();
  check('bounded GREEN semantics observed', (await page.locator('#statusLight').innerText()).trim() === 'GREEN');
  check('GREEN enables checked-copy door only', await page.locator('#copyChecked').isEnabled());
  check('resemblance-only provenance abstains', (await page.locator('#journeyResult').innerText()).includes('will not infer provenance from resemblance alone'));
  check('GREEN promise remains bounded', (await page.locator('#promiseDisclosure').innerText()).includes('GREEN means only that no enabled Loom rule fired'));

  await page.locator('#rest').click();
  check('Rest stops demand without coercion', (await page.locator('#restStatus').innerText()).includes('Nothing else is required'));
  check('Return remains visible after Rest', await page.locator('#returnToCheck').isVisible());
  check('Exit remains visible after Rest', await page.locator('#exitLoom').isVisible());

  const canaryRequests = observedRequests.filter(item => item.canary_present_in_url || item.canary_present_in_body);
  const externalRequests = observedRequests.filter(item => item.origin !== new URL(base).origin);
  const mutationRequests = observedRequests.filter(item => !['GET', 'HEAD'].includes(item.method));
  report.requests = observedRequests;
  report.request_summary = {
    observed_after_interaction_count: observedRequests.length,
    canary_egress_count: canaryRequests.length,
    external_request_count: externalRequests.length,
    mutation_request_count: mutationRequests.length
  };
  check('raw canary absent from observed requests', canaryRequests.length === 0, report.request_summary);
  check('no external request after interaction', externalRequests.length === 0, report.request_summary);
  check('no mutation request after interaction', mutationRequests.length === 0, report.request_summary);

  const persistence = await page.evaluate(async () => ({
    localStorage: localStorage.length,
    sessionStorage: sessionStorage.length,
    cookie: document.cookie,
    indexedDB: typeof indexedDB?.databases === 'function' ? (await indexedDB.databases()).length : 0,
    cacheKeys: typeof caches?.keys === 'function' ? (await caches.keys()).length : 0,
    serviceWorkerControlled: Boolean(navigator.serviceWorker?.controller)
  }));
  report.persistence = persistence;
  check('hosted Loom adds no browser persistence in fresh context',
    persistence.localStorage === 0
      && persistence.sessionStorage === 0
      && persistence.cookie === ''
      && persistence.indexedDB === 0
      && persistence.cacheKeys === 0
      && persistence.serviceWorkerControlled === false,
    persistence);

  const desktopShot = path.join(artifactDir, `holonomy-loom-hosted-${browserName}-desktop.png`);
  await page.screenshot({ path: desktopShot, fullPage: true });
  report.screenshots.push(desktopShot);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const mobileMetrics = await page.locator('body').evaluate(node => ({ scrollWidth: node.scrollWidth, clientWidth: node.clientWidth }));
  check('390px hosted surface has no horizontal loss', mobileMetrics.scrollWidth <= mobileMetrics.clientWidth + 1, mobileMetrics);
  check('mobile check control visible', await page.locator('#check').isVisible());
  check('mobile Rest visible', await page.locator('#rest').isVisible());
  const mobileShot = path.join(artifactDir, `holonomy-loom-hosted-${browserName}-mobile.png`);
  await page.screenshot({ path: mobileShot, fullPage: true });
  report.screenshots.push(mobileShot);

  check('zero page errors', report.page_errors.length === 0, report.page_errors);
  const boundedConsole = report.console_errors.filter(text => !/favicon/i.test(text));
  check('zero page-owned console errors', boundedConsole.length === 0, report.console_errors);
} catch (error) {
  report.page_errors.push(error.stack || error.message);
  check('hosted integration browser witness completed', false, error.message);
} finally {
  await browser.close();
}

report.failed_checks = report.checks.filter(item => item.status === 'FAIL').map(item => item.name);
report.status = report.failed_checks.length === 0 ? 'PASS' : 'HELD';
const artifactPath = path.join(artifactDir, `holonomy-loom-hosted-product-integration-${browserName}.json`);
await fs.writeFile(artifactPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Holonomy Loom hosted product integration browser witness (${browserName}): ${report.status}`);
console.log(JSON.stringify({ status: report.status, browser: browserName, failed: report.failed_checks, artifact: artifactPath }, null, 2));
if (report.status !== 'PASS') process.exitCode = 1;
