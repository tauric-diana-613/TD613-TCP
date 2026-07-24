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

async function inspect(page, label) {
  await page.goto(`${baseUrl}/dome-world/ash-keep.html`, { waitUntil:'domcontentloaded', timeout:90_000 });
  await page.waitForFunction(() => Boolean(window.__td613AshDemoRegistry?.version)
    && Boolean(window.__td613AshDemoRegistryPreflight?.version)
    && document.documentElement.dataset.ashDemoControlOwner === 'UNIFIED_REGISTRY'
    && document.title === 'TD613 Ash'
    && location.pathname === '/dome-world/ash-threshold.html'
    && !location.search, null, { timeout:120_000 });

  const initial = await page.evaluate(() => ({
    version:window.__td613AshDemoRegistry.version,
    canonical_order:[...window.__td613AshDemoRegistry.canonical_order],
    adapter_count:Number(document.documentElement.dataset.ashDemoRegistryAdapterCount || 0),
    control_owner:document.documentElement.dataset.ashDemoControlOwner,
    listener_count:window.__td613AshDemoRegistryPreflight.start_demo_listener_count,
    automatic_action:window.__td613AshDemoRegistry.automatic_consequential_ash_action,
    authority_changed:window.__td613AshDemoRegistry.custody_authority_changed || window.__td613AshDemoRegistry.release_authority_changed
  }));
  if (initial.version !== 'td613.ash.unified-six-demo-registry/v0.1') throw new Error(`A13 registry version drift: ${JSON.stringify(initial)}`);
  if (initial.canonical_order.join(',') !== 'investigation,political_campaign,fundraiser,research,legal,archive') throw new Error(`A13 canonical order drift: ${JSON.stringify(initial)}`);
  if (initial.adapter_count !== 5 || initial.control_owner !== 'UNIFIED_REGISTRY' || initial.listener_count !== 1) throw new Error(`A13 ownership drift: ${JSON.stringify(initial)}`);
  if (initial.automatic_action !== false || initial.authority_changed) throw new Error(`A13 authority drift: ${JSON.stringify(initial)}`);

  const readiness = {};
  for (const profile of ['investigation','political_campaign','fundraiser','research','legal']) {
    await page.locator('#newProfile').selectOption(profile);
    await page.waitForFunction(expected => {
      const button = document.getElementById('startDemo');
      return document.documentElement.dataset.ashDemoRegistrySelection === expected
        && button?.dataset.ashDemoRegistryState === 'READY'
        && button.disabled === false;
    }, profile, { timeout:30_000 });
    readiness[profile] = await page.locator('#startDemo').innerText();
  }

  await page.locator('#newProfile').selectOption('archive');
  await page.waitForFunction(() => {
    const button = document.getElementById('startDemo');
    return button?.dataset.ashDemoRegistryState === 'HELD_FOR_A14'
      && button.disabled
      && /A14/.test(button.textContent || '');
  }, null, { timeout:30_000 });
  const archiveHold = await page.evaluate(() => ({
    button:document.getElementById('startDemo')?.textContent || '',
    status:document.getElementById('demoProfileStatus')?.textContent || '',
    pointer:localStorage.getItem('td613.ash-keep.current-case')
  }));
  if (archiveHold.pointer || !/reserved|A14/i.test(`${archiveHold.button} ${archiveHold.status}`)) throw new Error(`Archive was not visibly held: ${JSON.stringify(archiveHold)}`);

  await page.locator('#newProfile').selectOption('organizing');
  await page.waitForFunction(() => {
    const button = document.getElementById('startDemo');
    const blank = document.getElementById('newCase');
    return button?.dataset.ashDemoRegistryState === 'NON_PROMOTED_PROFILE'
      && button.disabled
      && blank?.disabled === false;
  }, null, { timeout:30_000 });

  await page.locator('#newProfile').selectOption('investigation');
  await page.waitForFunction(() => document.getElementById('startDemo')?.dataset.ashDemoRegistryState === 'READY');
  await page.locator('#startDemo').click();
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.current?.()?.case_id)
    && document.documentElement.dataset.ashDemoProfile === 'investigation'
    && document.documentElement.dataset.ashDemoRegistrySelection === 'investigation'
    && document.getElementById('startDemo')?.dataset.ashDemoControlOwner === 'UNIFIED_REGISTRY', null, { timeout:120_000 });

  const hydrated = await page.evaluate(() => ({
    case_id:window.__td613AshKeep?.current?.()?.case_id || null,
    profile:document.documentElement.dataset.ashDemoProfile || null,
    registry_selection:document.documentElement.dataset.ashDemoRegistrySelection || null,
    owner:document.getElementById('startDemo')?.dataset.ashDemoControlOwner || null,
    field_count:document.querySelectorAll('.ash-flowcore-field:not(.ash-flowcore-field--proxy):not([hidden])').length,
    width:document.documentElement.scrollWidth,
    viewport:document.documentElement.clientWidth,
    url:location.pathname + location.search,
    title:document.title,
    profile_inferred:false,
    mass_epoch:window.__td613AshAia3CacheTransition?.epoch || null
  }));
  if (!hydrated.case_id || hydrated.profile !== 'investigation' || hydrated.registry_selection !== 'investigation') throw new Error(`A13 hydration dispatch held: ${JSON.stringify(hydrated)}`);
  if (hydrated.owner !== 'UNIFIED_REGISTRY' || hydrated.field_count !== 1) throw new Error(`A13 visible ownership drift: ${JSON.stringify(hydrated)}`);
  if (hydrated.width > hydrated.viewport + 1) throw new Error(`A13 horizontal overflow: ${JSON.stringify(hydrated)}`);
  if (hydrated.url !== '/dome-world/ash-threshold.html' || hydrated.title !== 'TD613 Ash') throw new Error(`A13 canonical route drift: ${JSON.stringify(hydrated)}`);
  if (hydrated.mass_epoch !== 'td613.ash.cache-flush/2026-07-24-a11-postclosure-v1') throw new Error(`A13 changed the reserved mass epoch: ${JSON.stringify(hydrated)}`);

  await page.screenshot({ path:path.join(artifactDir, `${browserName}-${label}.png`), fullPage:true });
  return { initial, readiness, archive_hold:archiveHold, hydrated };
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

  await fs.writeFile(path.join(artifactDir, `${browserName}-a13-receipt.json`), JSON.stringify({
    schema:'td613.ash.a13-browser-witness/v0.1',
    browser:browserName,
    receipts,
    canonical_demo_count:6,
    admitted_adapter_count:5,
    archive_reserved_for_a14:true,
    start_demo_control_owner:'UNIFIED_REGISTRY',
    automatic_consequential_ash_action:false,
    custody_authority_changed:false,
    release_authority_changed:false,
    raw_content_transport_added:false,
    mass_eviction_performed:false,
    human_closure_required:true
  }, null, 2));
} catch (error) {
  await fs.writeFile(path.join(artifactDir, `${browserName}-a13-failure.json`), JSON.stringify({ error:String(error?.stack || error) }, null, 2));
  throw error;
} finally {
  await browser.close();
}
