import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const out = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-stretch12-r02';
await fs.mkdir(out, { recursive:true });
const browser = await chromium.launch({ headless:true });
const page = await browser.newPage({ viewport:{ width:1280, height:900 } });
const external = [];
const consoleErrors = [];
page.on('request', request => {
  const url = new URL(request.url());
  const origin = new URL(base).origin;
  if (url.origin !== origin) external.push(request.url());
});
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
await page.goto(`${base}/dome-world/ash-stretch12-r02-qualification.html`, { waitUntil:'networkidle' });
await page.selectOption('#route','PUBLIC_SECTOR_MANAGED_PROVIDER');
await page.click('#qualify');
const managed = await page.textContent('#status');
await page.selectOption('#route','OFFLINE_LOCAL_MODEL');
await page.check('#providerAction');
await page.click('#qualify');
const mismatch = await page.textContent('#status');
await page.screenshot({ path:path.join(out,'qualification-court.png'), fullPage:true });
const observation = {
  managed_status:managed,
  offline_provider_status:mismatch,
  external_requests:external,
  console_errors:consoleErrors,
  exact_nonclaims:{
    universal_transport:false,
    universal_secrecy:false,
    cinder_authority:false,
    constructed_promotion_ceiling:'PA2'
  }
};
await fs.writeFile(path.join(out,'observation.json'), JSON.stringify(observation,null,2));
await browser.close();
if (!/HARD HOLD/.test(managed)) throw new Error('Managed route did not hard-hold.');
if (!/ROUTE MISMATCH/.test(mismatch)) throw new Error('Offline provider mismatch was not held.');
if (external.length) throw new Error(`External requests observed: ${external.join(', ')}`);
if (consoleErrors.length) throw new Error(`Console errors observed: ${consoleErrors.join(', ')}`);
console.log(JSON.stringify(observation));
