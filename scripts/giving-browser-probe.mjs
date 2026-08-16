import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { waitForGivingProductionSurface } from './giving-production-readiness.mjs';

const require = createRequire(import.meta.url);
const { chromium, firefox, webkit } = require('playwright');

const engines = { chromium, firefox, webkit };
const engineName = process.env.TD613_BROWSER || 'chromium';
const engine = engines[engineName];
if (!engine) throw new Error(`Unsupported Giving browser engine: ${engineName}`);

const baseUrl = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6136').replace(/\/$/, '');
const production = process.env.TD613_PRODUCTION_OBSERVATION === 'true';
const sourcePacketCommit = String(process.env.TD613_SOURCE_PACKET_COMMIT || '').trim();
const artifactDir = process.env.TD613_ARTIFACT_DIR || `artifacts/giving-${engineName}`;
await fs.mkdir(artifactDir, { recursive: true });

const executablePath = String(process.env.TD613_BROWSER_EXECUTABLE_PATH || '').trim();
const browser = await engine.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const consoleErrors = [];
const failedResources = [];
page.on('console', (message) => {
  if (message.type() === 'error') {
    const location = message.location()?.url;
    consoleErrors.push(`${message.text()}${location ? ` @ ${location}` : ''}`);
  }
});
page.on('pageerror', (error) => consoleErrors.push(error.message));
page.on('response', (response) => { if (response.status() >= 400) failedResources.push({ status: response.status(), url: response.url() }); });

async function exposeOperatorShell() {
  await page.evaluate(() => {
    document.documentElement.dataset.session = 'open';
    document.querySelector('#sessionMembrane')?.setAttribute('hidden', '');
    document.querySelector('#operatorShell')?.removeAttribute('hidden');
  });
}

async function witnessResilienceUi() {
  await exposeOperatorShell();
  await page.waitForSelector('.campaign-scope-block', { state: 'attached', timeout: 30000 });
  await page.waitForSelector('#vaultGuide', { state: 'attached', timeout: 10000 });
  await page.waitForSelector('.committee-ledger-toolbar', { state: 'attached', timeout: 10000 });

  const structure = await page.evaluate(() => {
    const scope = document.querySelector('#campaignDirectoryJurisdiction');
    const stateCount = document.querySelector('#campaignDirectoryStateCount');
    const stateInputs = [...document.querySelectorAll('#campaignDirectoryStateMenu input[type="checkbox"]')];
    return {
      jurisdictionTag: scope?.tagName,
      scopeClass: scope?.className || '',
      jurisdictions: [...document.querySelectorAll('[name="campaign-directory-jurisdiction"]')].map((input) => ({ value: input.value, checked: input.checked })),
      activity: [...document.querySelectorAll('[name="campaign-directory-activity"]')].map((input) => ({ value: input.value, checked: input.checked })),
      stateSummary: stateCount?.textContent?.trim() || '',
      stateSummaryHidden: Boolean(stateCount?.hidden),
      checkedStates: stateInputs.filter((input) => input.checked).map((input) => input.value),
      vaultBeats: [...document.querySelectorAll('#vaultGuide .vault-beats strong')].map((node) => node.textContent.trim()),
      matchOption: document.querySelector('#reviewFilter option[value="CANDIDATE"]')?.textContent?.trim() || '',
      candidateLegend: document.querySelector('#view-review .legend [data-state="CANDIDATE"]')?.textContent?.trim() || '',
      toolbar: Boolean(document.querySelector('.committee-ledger-toolbar')),
      toolbarLabels: [...document.querySelectorAll('.committee-ledger-toolbar .committee-toolbar-group')].map((node) => node.dataset.label),
      forensicLabel: document.querySelector('.committee-forensic-menu > summary')?.textContent?.trim() || '',
      coverageNote: document.querySelector('#dateCoverageNote')?.textContent?.trim() || ''
    };
  });

  assert.equal(structure.jurisdictionTag, 'DIV', 'legacy single-jurisdiction select must be replaced by the multi-select scope shell');
  assert.match(structure.scopeClass, /campaign-scope-block/);
  assert.deepEqual(structure.jurisdictions.map((item) => item.value), ['FEDERAL', 'STATE', 'MUNICIPAL']);
  assert.equal(structure.jurisdictions.find((item) => item.value === 'FEDERAL')?.checked, true);
  assert.deepEqual(structure.activity.map((item) => item.value), ['CONTRIBUTIONS', 'EXPENDITURES']);
  assert.equal(structure.activity.find((item) => item.value === 'CONTRIBUTIONS')?.checked, true);
  assert.equal(structure.stateSummary, 'FL');
  assert.equal(structure.stateSummaryHidden, false);
  assert.deepEqual(structure.checkedStates, ['FL']);
  assert.deepEqual(structure.vaultBeats, ['Lock here', 'Store the sealed copy', 'Unlock here']);
  assert.equal(structure.matchOption, 'Match');
  assert.equal(structure.candidateLegend.toLowerCase(), 'match');
  assert.equal(structure.toolbar, true);
  assert.deepEqual(structure.toolbarLabels, ['List', 'View', 'Export']);
  assert.equal(structure.forensicLabel, 'Forensic ▾');
  assert.match(structure.coverageNote, /Each custodian receipt/);

  await page.locator('#campaignDirectoryState > summary').click();
  await page.locator('#campaignDirectoryStateClear').click();
  const cleared = await page.evaluate(() => ({
    checked: [...document.querySelectorAll('#campaignDirectoryStateMenu input[type="checkbox"]:checked')].map((input) => input.value),
    summaryHidden: Boolean(document.querySelector('#campaignDirectoryStateCount')?.hidden),
    federalChecked: Boolean(document.querySelector('[name="campaign-directory-jurisdiction"][value="FEDERAL"]')?.checked),
    stateLaneChecked: Boolean(document.querySelector('[name="campaign-directory-jurisdiction"][value="STATE"]')?.checked)
  }));
  assert.deepEqual(cleared.checked, [], 'Clear must not silently reselect a state');
  assert.equal(cleared.summaryHidden, true, 'state summary disappears when nothing is selected');
  assert.equal(cleared.federalChecked, true, 'clearing state filters must not disable Federal lookup');
  assert.equal(cleared.stateLaneChecked, false, 'State lane remains independently opt-in');

  const fl = page.locator('#campaignDirectoryStateMenu input[type="checkbox"][value="FL"]');
  if (await fl.count()) await fl.check();

  const tooltip = page.locator('#readinessTooltip');
  const readinessButton = page.locator('#readinessButton');
  const tooltipStyle = await tooltip.evaluate((node) => {
    const style = getComputedStyle(node);
    return { width: node.getBoundingClientRect().width, transitionDelay: style.transitionDelay, opacity: style.opacity };
  });
  assert.ok(tooltipStyle.width <= 241, `readiness tooltip should remain narrow, observed ${tooltipStyle.width}px`);
  assert.match(tooltipStyle.transitionDelay, /0\.5s|500ms/, 'hover path keeps the deliberate ~500ms delay');
  await readinessButton.focus();
  await page.waitForTimeout(90);
  assert.equal(await tooltip.evaluate((node) => getComputedStyle(node).opacity), '1', 'keyboard focus reveals readiness help immediately');

  await page.evaluate(() => {
    document.querySelector('#view-review')?.setAttribute('hidden', '');
    document.querySelector('#view-review')?.classList.remove('active');
    document.querySelector('#view-ledger')?.removeAttribute('hidden');
    document.querySelector('#view-ledger')?.classList.add('active');
  });
  await page.waitForSelector('.committee-ledger-toolbar', { state: 'visible', timeout: 10000 });
  await page.waitForSelector('#exportCampaignDeputyBundleButton', { state: 'visible', timeout: 10000 });

  const desktopOverflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
    toolbarRight: document.querySelector('.committee-ledger-toolbar')?.getBoundingClientRect().right || 0
  }));
  assert.ok(desktopOverflow.document <= desktopOverflow.viewport + 1, `desktop document overflowed: ${JSON.stringify(desktopOverflow)}`);
  assert.ok(desktopOverflow.body <= desktopOverflow.viewport + 1, `desktop body overflowed: ${JSON.stringify(desktopOverflow)}`);
  assert.ok(desktopOverflow.toolbarRight <= desktopOverflow.viewport + 1, `desktop Committee toolbar overflowed: ${JSON.stringify(desktopOverflow)}`);

  await page.screenshot({ path: path.join(artifactDir, 'giving-history-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(100);
  const mobile = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
    toolbarRight: document.querySelector('.committee-ledger-toolbar')?.getBoundingClientRect().right || 0,
    scopeRight: document.querySelector('.campaign-scope-block')?.getBoundingClientRect().right || 0,
    vaultRight: document.querySelector('#vaultGuide')?.getBoundingClientRect().right || 0
  }));
  assert.ok(mobile.document <= mobile.viewport + 1, `mobile document overflowed: ${JSON.stringify(mobile)}`);
  assert.ok(mobile.body <= mobile.viewport + 1, `mobile body overflowed: ${JSON.stringify(mobile)}`);
  assert.ok(mobile.toolbarRight <= mobile.viewport + 1, `mobile Committee toolbar overflowed: ${JSON.stringify(mobile)}`);
  assert.ok(mobile.scopeRight <= mobile.viewport + 1, `mobile campaign scope overflowed: ${JSON.stringify(mobile)}`);
  assert.ok(mobile.vaultRight <= mobile.viewport + 1, `mobile Vault guide overflowed: ${JSON.stringify(mobile)}`);
  await page.screenshot({ path: path.join(artifactDir, 'giving-history-mobile.png'), fullPage: true });
  await page.setViewportSize({ width: 1600, height: 1000 });

  return { desktop: desktopOverflow, mobile, structure };
}

try {
  const readiness = production
    ? await waitForGivingProductionSurface({
        baseUrl,
        sourceCommit: sourcePacketCommit,
        attempts: process.env.TD613_GIVING_PROBE_ATTEMPTS,
        delayMs: process.env.TD613_GIVING_PROBE_DELAY_MS,
        requestTimeoutMs: process.env.TD613_GIVING_PROBE_REQUEST_TIMEOUT_MS,
        onAttempt: ({ attempt, attempts, ready, status, observation }) => {
          console.log(`[giving-production-readiness] attempt=${attempt}/${attempts} ready=${ready} status=${status ?? 'none'} observation=${observation}`);
        }
      })
    : null;
  const routeUrl = production ? readiness.url : `${baseUrl}/giving/history/?surface=operator`;
  const response = await page.goto(routeUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  assert(response?.ok(), `Giving returned HTTP ${response?.status()}`);
  await page.waitForSelector('#exportCampaignDeputyBundleButton', { state: 'attached', timeout: 30000 });
  assert.equal(await page.title(), 'TD613 Giving');
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow,noarchive,nosnippet,noimageindex');
  assert.equal(await page.locator('#exportCampaignDeputyBundleButton').count(), 1);
  assert.equal(await page.locator('#bulkGivingHistoryButton').count(), 1);

  let resilienceWitness = null;
  if (!production) resilienceWitness = await witnessResilienceUi();

  const mapper = await page.evaluate(async () => {
    const module = await import('/app/giving/history/giving-campaign-deputy-import.js');
    const record = {
      local_digest: 'browser-probe-record',
      contributor_name_raw: 'DOE, JANE',
      contributor_name_parsed: { kind: 'PERSON', given: 'JANE', family: 'DOE', display: 'DOE, JANE' },
      address: '123 Main St', city: 'Springfield', state: 'IL', zip: '62701',
      occupation: 'Attorney', employer: 'Doe & Associates', contribution_date: '2024-11-04', amount_cents: 50000,
      committee: 'Example Committee', committee_id: 'C00123456', cycle: 2024, election: 'General'
    };
    const csv = module.campaignDeputyGivingHistoryCsv([record]);
    const bundle = module.buildCampaignDeputyGivingHistoryBundle({ records: [record], title: 'Browser Probe' });
    return {
      csvHeader: csv.replace(/^\ufeff/, '').split('\r\n')[0],
      csvRow: csv.split('\r\n')[1],
      partitionCount: bundle.partitions.length,
      personIdInMapping: bundle.manifest.campaign_deputy_template.person_id_available_in_giving_history_mapping,
      oneCommitteePerImport: bundle.manifest.campaign_deputy_template.one_committee_per_import,
      zipMagic: [...bundle.bytes.slice(0, 4)]
    };
  });
  assert.equal(mapper.csvHeader, '"First Name","Last Name","Organization Name","Address Line 1","Address City","Address State","Address Zip","Occupation","Employer","Transaction Date","Transaction Amount","Transaction Type"');
  assert.match(mapper.csvRow, /"11\/04\/2024","500\.00","Contribution"$/);
  assert.equal(mapper.partitionCount, 1);
  assert.equal(mapper.personIdInMapping, false);
  assert.equal(mapper.oneCommitteePerImport, true);
  assert.deepEqual(mapper.zipMagic, [80, 75, 3, 4]);

  if (production) await page.screenshot({ path: path.join(artifactDir, 'giving-history.png'), fullPage: true });
  const receipt = {
    schema: 'td613.giving.browser-witness/v2',
    engine: engineName,
    production,
    route: '/giving/history/',
    source_packet_commit: sourcePacketCommit || null,
    production_readiness_attempt: readiness?.attempt || null,
    campaign_deputy_exports: 'PASS',
    resilience_ui: resilienceWitness ? 'PASS' : 'NOT_APPLICABLE_PRODUCTION_LOGIN_SURFACE',
    desktop_viewport: resilienceWitness ? '1600x1000' : null,
    mobile_viewport: resilienceWitness ? '390x844' : null,
    official_template_columns: 12,
    one_committee_per_import: true,
    person_id_mapping: false,
    console_errors: consoleErrors,
    failed_resources: failedResources
  };
  await fs.writeFile(path.join(artifactDir, 'receipt.json'), JSON.stringify(receipt, null, 2));
  assert.deepEqual(failedResources, [], `Giving browser failed resources: ${failedResources.map((item) => `${item.status} ${item.url}`).join(' | ')}`);
  const materialConsoleErrors = consoleErrors.filter((message) => !/\/favicon\.ico(?:\s|$)/.test(message));
  assert.deepEqual(materialConsoleErrors, [], `Giving browser console errors: ${materialConsoleErrors.join(' | ')}`);
  console.log(JSON.stringify(receipt));
} finally {
  await browser.close();
}
