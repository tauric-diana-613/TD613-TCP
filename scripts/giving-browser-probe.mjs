import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium, firefox, webkit } = require('playwright');

const engines = { chromium, firefox, webkit };
const engineName = process.env.TD613_BROWSER || 'chromium';
const engine = engines[engineName];
if (!engine) throw new Error(`Unsupported Giving browser engine: ${engineName}`);

const baseUrl = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6136').replace(/\/$/, '');
const production = process.env.TD613_PRODUCTION_OBSERVATION === 'true';
const artifactDir = process.env.TD613_ARTIFACT_DIR || `artifacts/giving-${engineName}`;
await fs.mkdir(artifactDir, { recursive: true });

const executablePath = String(process.env.TD613_BROWSER_EXECUTABLE_PATH || '').trim();
const browser = await engine.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
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

try {
  const response = await page.goto(`${baseUrl}/giving/history/${production ? '' : '?surface=operator'}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  assert(response?.ok(), `Giving returned HTTP ${response?.status()}`);
  await page.waitForSelector('#exportCampaignDeputyBundleButton', { state: 'attached', timeout: 30000 });
  assert.equal(await page.title(), 'TD613 Giving');
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow,noarchive,nosnippet,noimageindex');
  assert.equal(await page.locator('#exportCampaignDeputyBundleButton').count(), 1);
  assert.equal(await page.locator('#bulkGivingHistoryButton').count(), 1);

  if (!production) {
    await page.evaluate(() => {
      document.documentElement.dataset.session = 'open';
      document.querySelector('#sessionMembrane')?.setAttribute('hidden', '');
      document.querySelector('#operatorShell')?.removeAttribute('hidden');
      document.querySelector('#view-review')?.removeAttribute('hidden');
      document.querySelector('#view-review')?.classList.add('active');
    });
    await page.waitForSelector('#reviewExportCampaignDeputyButton', { state: 'visible', timeout: 30000 });
    await page.evaluate(() => {
      document.querySelector('#view-review')?.setAttribute('hidden', '');
      document.querySelector('#view-review')?.classList.remove('active');
      document.querySelector('#view-ledger')?.removeAttribute('hidden');
      document.querySelector('#view-ledger')?.classList.add('active');
    });
    await page.waitForSelector('#exportCampaignDeputyBundleButton', { state: 'visible', timeout: 10000 });
  }

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

  await page.screenshot({ path: path.join(artifactDir, 'giving-history.png'), fullPage: true });
  const receipt = {
    schema: 'td613.giving.browser-witness/v1',
    engine: engineName,
    production,
    route: '/giving/history/',
    campaign_deputy_exports: 'PASS',
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
