import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = process.env.TD613_BROWSER || 'chromium';
const baseUrl = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-a13';
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new Error(`Unsupported browser ${browserName}`);
await fs.mkdir(artifactDir, { recursive:true });
const browser = await browserType.launch({ headless:true });

const promoted = ['investigation','political_campaign','fundraiser','research','legal','archive'];

async function selectRegistryProfile(page, profile) {
  await page.locator('#newProfile').selectOption(profile);
  await page.evaluate(() => window.__td613AshDemoRegistry?.reconcile?.());
}

async function activateInvestigation(page) {
  await page.evaluate(() => {
    const registry = window.__td613AshDemoRegistry;
    const select = document.getElementById('newProfile');
    const button = document.getElementById('startDemo');
    select.value = 'investigation';
    select.dispatchEvent(new Event('change', { bubbles:true }));
    registry.reconcile();
    if (button.dataset.ashMethodDemoState !== 'READY' || button.disabled || button.matches(':disabled')) {
      throw new Error('Shared registry Investigation control was not atomically actionable.');
    }
    button.click();
  });
}

async function inspect(page, label) {
  await page.goto(`${baseUrl}/dome-world/ash-keep.html`, { waitUntil:'domcontentloaded', timeout:90_000 });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && window.__td613AshDemoRegistry?.version === 'td613.ash.demo-registry/v0.3-a15'
    && window.__td613AshA15EmpiricalJourneys?.version === 'td613.ash.a15-empirical-profile-journeys/v0.1'
    && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
    && document.title === 'TD613 Ash'
    && location.pathname === '/dome-world/ash-threshold.html'
    && !location.search, null, { timeout:120_000 });

  const registry = await page.evaluate(() => window.__td613AshDemoRegistry.snapshot());
  if (registry.profiles.length !== 6) throw new Error(`Expected six registry seats: ${JSON.stringify(registry)}`);
  if (registry.profiles.filter(entry => entry.promoted).length !== 6) throw new Error(`Expected six A15 promoted seats: ${JSON.stringify(registry)}`);
  if (registry.profiles.find(entry => entry.profile === 'archive')?.status !== 'PROMOTED') throw new Error('Archive seat was not promoted in A15.');
  if (registry.profiles.find(entry => entry.profile === 'archive')?.owner !== 'ARCHIVE') throw new Error('Archive fixture owner drifted.');
  if (registry.empirical_matrix_cells !== 120) throw new Error('A15 empirical matrix metadata unavailable.');

  for (const profile of promoted) {
    await selectRegistryProfile(page, profile);
    await page.waitForFunction(expected => {
      const button = document.getElementById('startDemo');
      return document.getElementById('newProfile')?.value === expected
        && button?.dataset.ashDemoRegistryOwner === 'td613.ash.demo-registry/v0.3-a15'
        && button?.dataset.ashMethodDemoState === 'READY'
        && button.disabled === false;
    }, profile, { timeout:60_000 });
  }

  await activateInvestigation(page);
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.current?.()?.case_id)
    && document.documentElement.dataset.ashDemoRegistryProfile === 'investigation'
    && document.documentElement.dataset.ashPremiumWorkspace === 'home', null, { timeout:120_000 });

  const result = await page.evaluate(() => ({
    registry:window.__td613AshDemoRegistry.snapshot(),
    owner:document.documentElement.dataset.ashDemoControlOwner,
    selected:document.documentElement.dataset.ashDemoRegistryProfile,
    state:document.documentElement.dataset.ashDemoRegistryState,
    active_case:window.__td613AshKeep?.current?.()?.case_id || null,
    empirical_version:window.__td613AshA15EmpiricalJourneys?.version || null,
    release_disabled:document.getElementById('approveRelease')?.disabled ?? null,
    handoff_is_link:document.querySelector('a[href="/dome-world/ash-destination-handoff.html"]')?.tagName === 'A',
    url:location.pathname + location.search,
    title:document.title,
    overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  if (result.owner !== 'ASH_DEMO_REGISTRY' || result.selected !== 'investigation' || !result.active_case) throw new Error(`Registry hydration held: ${JSON.stringify(result)}`);
  if (result.empirical_version !== 'td613.ash.a15-empirical-profile-journeys/v0.1') throw new Error(`A15 empirical interpreter missing: ${JSON.stringify(result)}`);
  if (result.release_disabled !== true || result.handoff_is_link !== true) throw new Error(`Registry widened action authority: ${JSON.stringify(result)}`);
  if (result.url !== '/dome-world/ash-threshold.html' || result.title !== 'TD613 Ash' || result.overflow > 1) throw new Error(`Registry presentation drift: ${JSON.stringify(result)}`);

  await page.screenshot({ path:path.join(artifactDir, `${browserName}-${label}.png`), fullPage:true });
  return result;
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

  await fs.writeFile(path.join(artifactDir, `${browserName}-a13-registry-receipt.json`), JSON.stringify({
    schema:'td613.ash.shared-demo-registry-browser-witness/v0.3-a15',
    browser:browserName,
    receipts,
    registry_owner:'ASH_DEMO_REGISTRY',
    promoted_profiles:promoted,
    archive_status:'PROMOTED',
    archive_owner:'ARCHIVE',
    empirical_matrix_cells:120,
    custody_authority_changed:false,
    raw_content_transport:false,
    automatic_release:false,
    human_closure_required:true
  }, null, 2));
} catch (error) {
  await fs.writeFile(path.join(artifactDir, `${browserName}-a13-registry-failure.json`), JSON.stringify({ error:String(error?.stack || error) }, null, 2));
  throw error;
} finally {
  await browser.close();
}
