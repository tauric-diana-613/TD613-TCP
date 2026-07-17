import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-stretch12-portable-anisotropy';
fs.mkdirSync(artifactDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const consoleErrors = [];
const externalRequests = [];
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => consoleErrors.push(error.message));
page.on('request', request => {
  const url = new URL(request.url());
  if (url.origin !== new URL(baseUrl).origin) externalRequests.push(request.url());
});
await page.goto(`${baseUrl}/dome-world/ash-portable-anisotropy.html`, { waitUntil: 'networkidle' });
await page.selectOption('#endpointState', 'PUBLIC_SECTOR_MANAGED');
await page.selectOption('#routeClass', 'PUBLIC_SECTOR_MANAGED_PROVIDER');
await page.check('#providerAction');
const managedRuling = await page.locator('#endpointResult').textContent();
if (!managedRuling.includes('HARD_HOLD')) throw new Error(`Managed endpoint did not hard-hold: ${managedRuling}`);
await page.selectOption('#endpointState', 'PERSONAL_UNMANAGED_DECLARED');
await page.selectOption('#routeClass', 'CONSUMER_CLOUD_PROVIDER');
await page.fill('#packet', 'On 07/13/2026 Director Rowan Hale emailed the source and instructed the team to request the metadata spreadsheet. This may indicate a relationship between the office and the vendor. Next step: interview the source and preserve the attachment header.');
await page.fill('#protected', 'Rowan Hale\n07/13/2026\nmetadata spreadsheet');
await page.click('#runAssay');
await page.locator('#results').waitFor({ state: 'visible' });
const recommendation = await page.locator('#recommendation').textContent();
const receiptText = await page.locator('#receiptOutput').textContent();
if (!recommendation.trim()) throw new Error('No semantic recommendation rendered.');
if (!receiptText.includes('unknown_readers_unmeasured')) throw new Error('Unknown Reader missingness was not preserved.');
if (!receiptText.includes('universal_score_emitted')) throw new Error('Componentwise non-sovereign output was not preserved.');
await page.screenshot({ path: path.join(artifactDir, 'portable-anisotropy-lab.png'), fullPage: true });
const report = {
  schema: 'td613.ash.stretch12-browser-observation/v0.1',
  source_status: 'DEPLOYED_OR_LOCAL_OBSERVATION',
  url: page.url(),
  managed_ruling: managedRuling.trim(),
  recommendation: recommendation.trim(),
  external_requests: externalRequests,
  console_errors: consoleErrors,
  capsule_is_provider_packet: false,
  flowcore_has_custody: false,
  universal_secrecy_claim: false
};
fs.writeFileSync(path.join(artifactDir, 'observation.json'), `${JSON.stringify(report, null, 2)}\n`);
await browser.close();
if (externalRequests.length) throw new Error(`Unexpected external requests: ${externalRequests.join(', ')}`);
if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(' | ')}`);
console.log('ASH_STRETCH12_BROWSER_OBSERVATION_COMPLETE');
