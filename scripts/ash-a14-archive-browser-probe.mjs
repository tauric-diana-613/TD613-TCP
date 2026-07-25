import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = process.env.TD613_BROWSER || 'chromium';
const baseUrl = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-a14';
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new Error(`Unsupported browser ${browserName}`);
await fs.mkdir(artifactDir, { recursive:true });
const browser = await browserType.launch({ headless:true });

async function waitForRegistry(page) {
  await page.waitForFunction(() => {
    const registry = window.__td613AshDemoRegistry?.snapshot?.() || null;
    return window.__td613AshDemoRegistry?.version === 'td613.ash.demo-registry/v0.2-a14'
      && registry?.asset_epoch === '20260725-a14-release-v1'
      && registry?.control_owner === 'ASH_DEMO_REGISTRY'
      && registry?.profiles?.length === 6
      && registry.profiles.filter(entry => entry.promoted).length === 6
      && registry.profiles.find(entry => entry.profile === 'archive')?.owner === 'ARCHIVE'
      && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY';
  }, null, { timeout:120_000 });
}

async function activateArchive(page) {
  await page.evaluate(() => {
    const registry = window.__td613AshDemoRegistry;
    const select = document.getElementById('newProfile');
    const button = document.getElementById('startDemo');
    if (!registry?.version || !select || !button) throw new Error('A14 Archive registry control unavailable.');
    select.value = 'archive';
    select.dispatchEvent(new Event('change', { bubbles:true }));
    registry.reconcile();
    const snapshot = registry.snapshot();
    const ready = select.value === 'archive'
      && snapshot.profiles.filter(entry => entry.promoted).length === 6
      && snapshot.profiles.find(entry => entry.profile === 'archive')?.status === 'PROMOTED'
      && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
      && button.dataset.ashDemoRegistryOwner === 'td613.ash.demo-registry/v0.2-a14'
      && button.dataset.ashMethodDemoState === 'READY'
      && button.disabled === false
      && !button.matches(':disabled');
    if (!ready) throw new Error(`A14 Archive control was not atomically actionable: ${JSON.stringify({ value:select.value, state:button.dataset.ashMethodDemoState, disabled:button.disabled })}`);
    button.click();
  });
}

async function inspect(page, label) {
  await page.goto(`${baseUrl}/dome-world/ash-keep.html`, { waitUntil:'domcontentloaded', timeout:90_000 });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && Boolean(window.__td613AshPremiumUI?.version)
    && document.title === 'TD613 Ash'
    && location.pathname === '/dome-world/ash-threshold.html'
    && !location.search, null, { timeout:120_000 });
  await waitForRegistry(page);

  const fixture = await page.evaluate(async () => {
    const built = await window.__td613AshDemoRegistry.build('archive');
    return {
      schema:built?.schema,
      demo_id:built?.demo_id,
      rooms:built?.rooms?.length,
      nodes:built?.nodes?.length,
      relationships:built?.relationships?.length,
      rules:built?.rules?.length,
      routes:built?.routes?.length,
      release_authority:built?.assay?.release_authority,
      transfer_authority:built?.assay?.transfer_authority,
      access_copy_created_automatically:built?.assay?.access_copy_created_automatically
    };
  });
  if (JSON.stringify(fixture) !== JSON.stringify({
    schema:'td613.ash.archive-accession/v0.1',
    demo_id:'demo_archive_nightjar_accession_v1',
    rooms:8,
    nodes:24,
    relationships:15,
    rules:4,
    routes:4,
    release_authority:false,
    transfer_authority:false,
    access_copy_created_automatically:false
  })) throw new Error(`A14 Archive fixture drift: ${JSON.stringify(fixture)}`);

  await activateArchive(page);
  await page.waitForFunction(() => {
    const current = window.__td613AshKeep?.current?.() || null;
    return Boolean(current?.case_id)
      && current.profile === 'archive'
      && (current.operator_notes || []).includes('demo_profile:archive')
      && document.documentElement.dataset.ashDemoProfile === 'archive'
      && document.documentElement.dataset.ashArchiveAccession === 'td613.ash.archive-demo/v0.1-a14-accession'
      && document.documentElement.dataset.ashPremiumWorkspace === 'map'
      && document.getElementById('archiveAccessionDocket')?.dataset.profile === 'archive';
  }, null, { timeout:120_000 });

  const result = await page.evaluate(() => {
    const current = window.__td613AshKeep?.current?.() || null;
    const docket = document.getElementById('archiveAccessionDocket');
    const registry = window.__td613AshDemoRegistry.snapshot();
    return {
      registry_version:registry.version,
      registry_epoch:registry.asset_epoch,
      promoted_profiles:registry.profiles.filter(entry => entry.promoted).map(entry => entry.profile),
      archive_owner:registry.profiles.find(entry => entry.profile === 'archive')?.owner,
      active_case:current.case_id || null,
      active_profile:current.profile || null,
      archive_marker:(current.operator_notes || []).includes('demo_profile:archive'),
      docket_text:docket?.innerText || '',
      release_disabled:document.getElementById('approveRelease')?.disabled ?? null,
      provider_approval_checked:document.getElementById('providerApproval')?.checked ?? null,
      handoff_is_link:document.querySelector('a[href="/dome-world/ash-destination-handoff.html"]')?.tagName === 'A',
      unexpected_text:String(document.getElementById('unexpectedText')?.value || '').trim(),
      imported_reader:String(document.getElementById('importedReaderOutput')?.value || '').trim(),
      url:location.pathname + location.search,
      title:document.title,
      overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });

  if (result.promoted_profiles.length !== 6 || result.archive_owner !== 'ARCHIVE') throw new Error(`A14 registry promotion held: ${JSON.stringify(result)}`);
  if (!result.active_case || result.active_profile !== 'archive' || !result.archive_marker) throw new Error(`A14 Archive hydration held: ${JSON.stringify(result)}`);
  for (const phrase of ['Archive Accession Review','accession scope','provenance','restrictions','access copy','delayed transfer','no access grant']) {
    if (!result.docket_text.toLowerCase().includes(phrase.toLowerCase())) throw new Error(`A14 docket omitted ${phrase}: ${JSON.stringify(result)}`);
  }
  if (result.release_disabled !== true || result.provider_approval_checked !== false || result.handoff_is_link !== true) throw new Error(`A14 widened action authority: ${JSON.stringify(result)}`);
  if (result.unexpected_text || result.imported_reader) throw new Error(`A14 fabricated provider output: ${JSON.stringify(result)}`);
  if (result.url !== '/dome-world/ash-threshold.html' || result.title !== 'TD613 Ash' || result.overflow > 1) throw new Error(`A14 presentation drift: ${JSON.stringify(result)}`);

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

  await fs.writeFile(path.join(artifactDir, `${browserName}-a14-archive-receipt.json`), JSON.stringify({
    schema:'td613.ash.a14-archive-browser-witness/v0.1',
    browser:browserName,
    receipts,
    registry_owner:'ASH_DEMO_REGISTRY',
    promoted_profiles:6,
    archive_status:'PROMOTED',
    archive_owner:'ARCHIVE',
    graph_wide_mass_eviction_executed:false,
    custody_authority_changed:false,
    access_granted:false,
    release_authority:false,
    declassification_authority:false,
    transfer_authority:false,
    raw_content_transport:false,
    automatic_release:false,
    human_closure_required:true
  }, null, 2));
} catch (error) {
  await fs.writeFile(path.join(artifactDir, `${browserName}-a14-archive-failure.json`), JSON.stringify({ error:String(error?.stack || error) }, null, 2));
  throw error;
} finally {
  await browser.close();
}
