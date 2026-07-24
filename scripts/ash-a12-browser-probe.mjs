import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = process.env.TD613_BROWSER || 'chromium';
const baseUrl = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-a12';
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new Error('Unsupported browser ' + browserName);
await fs.mkdir(artifactDir, { recursive:true });
const browser = await browserType.launch({ headless:true });

async function enterInvestigation(page) {
  await page.goto(baseUrl + '/dome-world/ash-keep.html', { waitUntil:'domcontentloaded', timeout:90_000 });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && Boolean(window.__td613AshPremiumUI?.version)
    && Boolean(window.__td613AshA12?.version)
    && document.title === 'TD613 Ash'
    && location.pathname === '/dome-world/ash-threshold.html'
    && !location.search, null, { timeout:120_000 });
  await page.locator('#newProfile').selectOption('investigation');
  await page.waitForFunction(() => !document.getElementById('startDemo')?.disabled, null, { timeout:60_000 });
  await page.locator('#startDemo').click();
  await page.waitForFunction(() => document.documentElement.dataset.ashPremiumWorkspace === 'home'
    && document.documentElement.dataset.ashA12CommandAudit === 'PASS', null, { timeout:120_000 });
}

async function inspect(page, label) {
  await enterInvestigation(page);
  await page.locator('#premiumMenuButton').click();
  await page.waitForSelector('#premiumCommandSheet[open]');
  const commandText = await page.locator('#premiumCommandGrid').innerText();
  for (const phrase of ['Custody','Rooms','Routes','Rebuild Test','Draft & Hush','Save Points','Destination Handoff','Receipts','Cases & Profiles','Safe Harbor']) {
    if (!commandText.includes(phrase)) throw new Error('A12 missing ' + phrase);
  }
  const audit = await page.evaluate(() => window.__td613AshA12?.audit?.());
  if (!audit?.ready || audit.inert_controls !== 0 || audit.empty_drawers !== 0) throw new Error('A12 command audit failed: ' + JSON.stringify(audit));
  await page.locator('[data-a12-command="test"]').click();
  await page.waitForFunction(() => document.documentElement.dataset.ashPremiumWorkspace === 'choir');
  await page.locator('#premiumMenuButton').click();
  await page.locator('[data-a12-command="save"]').click();
  await page.waitForFunction(() => document.documentElement.dataset.ashPremiumWorkspace === 'capsule');
  await page.locator('#premiumMenuButton').click();
  await page.locator('[data-a12-action="profile"]').click();
  await page.waitForFunction(() => !document.getElementById('launch')?.classList.contains('hidden')
    && document.getElementById('launch')?.getAttribute('aria-hidden') === 'false');
  await page.waitForFunction(() => document.activeElement?.id === 'newProfile'
    && document.documentElement.dataset.ashA12ProfileSelector === 'FOCUSED');
  const routeDelta = await page.locator('.ash-route-delta').innerText();
  if (!routeDelta.includes('Changed in explanation') || !routeDelta.includes('Preserved exactly')) throw new Error('A12 route delta remained empty.');
  const geometry = await page.evaluate(() => ({
    width:document.documentElement.scrollWidth,
    viewport:document.documentElement.clientWidth,
    fields:document.querySelectorAll('.ash-flowcore-field:not(.ash-flowcore-field--proxy):not([hidden])').length,
    url:location.pathname + location.search,
    title:document.title,
    audit:document.documentElement.dataset.ashA12CommandAudit,
    profile_selector:document.documentElement.dataset.ashA12ProfileSelector,
    active_element:document.activeElement?.id || null
  }));
  if (geometry.width > geometry.viewport + 1) throw new Error('Horizontal overflow ' + geometry.width + '/' + geometry.viewport);
  if (geometry.fields !== 1) throw new Error('Expected one canonical field, observed ' + geometry.fields);
  if (geometry.url !== '/dome-world/ash-threshold.html' || geometry.title !== 'TD613 Ash') throw new Error('Canonical first paint drift: ' + JSON.stringify(geometry));
  if (geometry.profile_selector !== 'FOCUSED' || geometry.active_element !== 'newProfile') throw new Error('Profile selector focus drift: ' + JSON.stringify(geometry));
  await page.screenshot({ path:path.join(artifactDir, browserName + '-' + label + '.png'), fullPage:true });
  return geometry;
}

const receipts = [];
try {
  const desktop = await browser.newContext({ viewport:{ width:1280, height:900 } });
  receipts.push({ mode:'desktop', ...(await inspect(await desktop.newPage(), 'desktop')) });
  await desktop.close();
  const mobile = await browser.newContext({ viewport:{ width:390, height:844 }, reducedMotion:'reduce', isMobile:true, hasTouch:true });
  receipts.push({ mode:'mobile-reduced-motion', ...(await inspect(await mobile.newPage(), 'mobile-reduced-motion')) });
  await mobile.close();
  await fs.writeFile(path.join(artifactDir, browserName + '-a12-receipt.json'), JSON.stringify({ schema:'td613.ash.a12-browser-witness/v0.1', browser:browserName, receipts, authority_changed:false, source_bytes_moved:false, human_closure_required:true }, null, 2));
} catch (error) {
  await fs.writeFile(path.join(artifactDir, browserName + '-a12-failure.json'), JSON.stringify({ error:String(error?.stack || error) }, null, 2));
  throw error;
} finally {
  await browser.close();
}
