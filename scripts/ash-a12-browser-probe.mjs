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

  const routeDelta = await page.locator('.ash-route-delta').innerText();
  if (!routeDelta.includes('Changed in explanation') || !routeDelta.includes('Preserved exactly')) throw new Error('A12 route delta remained empty.');
  const beforeSwitch = await page.evaluate(() => ({
    width:document.documentElement.scrollWidth,
    viewport:document.documentElement.clientWidth,
    fields:document.querySelectorAll('.ash-flowcore-field:not(.ash-flowcore-field--proxy):not([hidden])').length,
    url:location.pathname + location.search,
    title:document.title,
    audit:document.documentElement.dataset.ashA12CommandAudit,
    active_case:window.__td613AshKeep?.current?.()?.case_id || null
  }));
  if (beforeSwitch.width > beforeSwitch.viewport + 1) throw new Error('Horizontal overflow ' + beforeSwitch.width + '/' + beforeSwitch.viewport);
  if (beforeSwitch.fields !== 1) throw new Error('Expected one canonical field, observed ' + beforeSwitch.fields);
  if (beforeSwitch.url !== '/dome-world/ash-threshold.html' || beforeSwitch.title !== 'TD613 Ash') throw new Error('Canonical first paint drift: ' + JSON.stringify(beforeSwitch));
  if (!beforeSwitch.active_case) throw new Error('A12 case-switcher witness began without an active case.');

  await page.locator('#premiumMenuButton').click();
  await page.locator('[data-a12-action="profile"]').click();
  await page.waitForFunction(() => document.body.dataset.ashCaseClosed === 'true'
    && !localStorage.getItem('td613.ash-keep.current-case')
    && !document.getElementById('launch')?.classList.contains('hidden'), null, { timeout:120_000 });
  await page.waitForFunction(() => document.activeElement?.id === 'newProfile'
    && document.documentElement.dataset.ashA12ProfileSelector === 'FOCUSED', null, { timeout:60_000 });

  const afterSwitch = await page.evaluate(() => ({
    url:location.pathname + location.search,
    title:document.title,
    launch_hidden:document.getElementById('launch')?.classList.contains('hidden') ?? true,
    case_closed:document.body.dataset.ashCaseClosed || null,
    current_pointer:localStorage.getItem('td613.ash-keep.current-case'),
    profile_selector:document.documentElement.dataset.ashA12ProfileSelector,
    active_element:document.activeElement?.id || null,
    close_fingerprint_posture:document.documentElement.dataset.ashCloseFingerprintPosture || null,
    case_list_quiescent:document.documentElement.dataset.ashCloseCaseListQuiescent || null
  }));
  if (afterSwitch.url !== '/dome-world/ash-threshold.html' || afterSwitch.title !== 'TD613 Ash') throw new Error('Canonical selector return drift: ' + JSON.stringify(afterSwitch));
  if (afterSwitch.launch_hidden || afterSwitch.case_closed !== 'true' || afterSwitch.current_pointer) throw new Error('Canonical case close boundary held: ' + JSON.stringify(afterSwitch));
  if (afterSwitch.profile_selector !== 'FOCUSED' || afterSwitch.active_element !== 'newProfile') throw new Error('Profile selector focus drift: ' + JSON.stringify(afterSwitch));
  if (afterSwitch.case_list_quiescent !== 'true') throw new Error('Case list did not reach quiescence: ' + JSON.stringify(afterSwitch));

  await page.screenshot({ path:path.join(artifactDir, browserName + '-' + label + '.png'), fullPage:true });
  return { before_switch:beforeSwitch, after_switch:afterSwitch };
}

const receipts = [];
try {
  const desktop = await browser.newContext({ viewport:{ width:1280, height:900 } });
  receipts.push({ mode:'desktop', ...(await inspect(await desktop.newPage(), 'desktop')) });
  await desktop.close();
  const mobileOptions = { viewport:{ width:390, height:844 }, reducedMotion:'reduce' };
  if (browserName !== 'firefox') Object.assign(mobileOptions, { isMobile:true, hasTouch:true });
  const mobile = await browser.newContext(mobileOptions);
  receipts.push({ mode:'mobile-reduced-motion', ...(await inspect(await mobile.newPage(), 'mobile-reduced-motion')) });
  await mobile.close();
  await fs.writeFile(path.join(artifactDir, browserName + '-a12-receipt.json'), JSON.stringify({ schema:'td613.ash.a12-browser-witness/v0.2', browser:browserName, receipts, authority_changed:false, source_bytes_moved:false, case_data_preserved:true, profile_inferred:false, human_closure_required:true }, null, 2));
} catch (error) {
  await fs.writeFile(path.join(artifactDir, browserName + '-a12-failure.json'), JSON.stringify({ error:String(error?.stack || error) }, null, 2));
  throw error;
} finally {
  await browser.close();
}
