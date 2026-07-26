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
    const installed = window.__td613AshDemoRegistry?.version || null;
    return installed === 'td613.ash.demo-registry/v0.2-a14'
      && registry?.version === installed
      && registry?.asset_epoch === '20260725-a14-release-v1'
      && registry?.control_owner === 'ASH_DEMO_REGISTRY'
      && registry?.profiles?.length === 6
      && registry.profiles.filter(entry => entry.promoted).length === 6
      && registry.profiles.find(entry => entry.profile === 'archive')?.owner === 'ARCHIVE'
      && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
      && document.documentElement.dataset.ashDemoRegistry === installed;
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
      && button.dataset.ashDemoRegistryOwner === registry.version
      && button.dataset.ashMethodDemoState === 'READY'
      && button.disabled === false
      && !button.matches(':disabled');
    if (!ready) throw new Error(`A14 Archive control was not atomically actionable: ${JSON.stringify({ value:select.value, state:button.dataset.ashMethodDemoState, disabled:button.disabled, registry:registry.version })}`);
    button.click();
  });
}

async function readArchiveCase(page) {
  return page.evaluate(async () => {
    const caseId = localStorage.getItem('td613.ash-keep.current-case');
    if (!caseId) return { case_id:null, profile:null, operator_notes:[], title:null };
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('td613-ash-keep');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const record = await new Promise((resolve, reject) => {
        const request = db.transaction('cases').objectStore('cases').get(caseId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
      return {
        case_id:record?.case_id || null,
        profile:record?.profile || null,
        operator_notes:record?.operator_notes || [],
        title:record?.title || null,
        case_map_digest:record?.case_map_digest || null
      };
    } finally {
      db.close();
    }
  });
}

async function settleMap(page) {
  await page.evaluate(async () => {
    const open = window.__td613AshPremiumUI?.open
      || window.__td613AshUiUxRescue?.open
      || window.__td613OpenAshWorkspace
      || window.__td613AshKeep?.openWorkspace;
    if (typeof open !== 'function') throw new Error('A14 governed Map workspace owner unavailable.');
    await Promise.resolve(open('map'));
  });
  await page.waitForFunction(() => {
    const panel = document.getElementById('workspace-map');
    const style = panel ? getComputedStyle(panel) : null;
    const rect = panel?.getBoundingClientRect();
    return document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
      && document.documentElement.dataset.ashPremiumWorkspace === 'map'
      && panel?.classList.contains('active')
      && style?.display !== 'none'
      && style?.visibility !== 'hidden'
      && Number(style?.opacity) > 0
      && style?.pointerEvents !== 'none'
      && rect?.width > 0
      && rect?.height > 0;
  }, null, { timeout:120_000 });
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
      route_digests_valid:(built?.routes || []).every(route => /^sha256:[0-9a-f]{64}$/.test(String(route?.draft_digest || ''))),
      default_route_digest_valid:/^sha256:[0-9a-f]{64}$/.test(String(built?.defaults?.route?.digest || '')),
      mixed_media_fixture_complete:built?.assay?.mixed_media_fixture_complete,
      original_derivative_lineage_visible:built?.assay?.original_derivative_lineage_visible,
      release_authority:built?.assay?.release_authority,
      transfer_authority:built?.assay?.transfer_authority,
      access_copy_created_automatically:built?.assay?.access_copy_created_automatically
    };
  });
  const expectedFixture = {
    schema:'td613.ash.archive-accession/v0.2-harbor-memory',
    demo_id:'demo_archive_harbor_memory_v1',
    rooms:8,
    nodes:29,
    relationships:23,
    rules:4,
    routes:4,
    route_digests_valid:true,
    default_route_digest_valid:true,
    mixed_media_fixture_complete:true,
    original_derivative_lineage_visible:true,
    release_authority:false,
    transfer_authority:false,
    access_copy_created_automatically:false
  };
  if (JSON.stringify(fixture) !== JSON.stringify(expectedFixture)) throw new Error(`A14 Harbor Memory fixture drift: ${JSON.stringify(fixture)}`);

  await activateArchive(page);
  await page.waitForFunction(() => {
    const status = document.getElementById('demoProfileStatus')?.textContent || '';
    const pointer = localStorage.getItem('td613.ash-keep.current-case');
    const hydratedSurface = Boolean(pointer)
      && document.documentElement.dataset.ashDemoProfile === 'archive'
      && document.documentElement.dataset.ashArchiveAccession === 'td613.ash.archive-demo/v0.2-a14-harbor-memory'
      && document.getElementById('archiveAccessionDocket')?.dataset.profile === 'archive';
    return hydratedSurface || /Demo registry held\./i.test(status);
  }, null, { timeout:120_000 });

  const archiveCase = await readArchiveCase(page);
  const hydration = await page.evaluate(() => ({
    archive_version:document.documentElement.dataset.ashArchiveAccession || null,
    docket_present:document.getElementById('archiveAccessionDocket')?.dataset.profile === 'archive',
    registry_status:document.getElementById('demoProfileStatus')?.textContent || '',
    workspace:document.documentElement.dataset.ashPremiumWorkspace || null,
    public_core:window.__td613AshKeep?.current?.() || null
  }));
  if (/Demo registry held\./i.test(hydration.registry_status)) throw new Error(`A14 registry reported hydration hold: ${JSON.stringify({ ...hydration, archiveCase })}`);
  if (!archiveCase.case_id || archiveCase.profile !== 'archive' || !archiveCase.operator_notes.includes('demo_profile:archive') || archiveCase.title !== 'Harbor Memory Archive · mixed-media accession and access review' || hydration.archive_version !== 'td613.ash.archive-demo/v0.2-a14-harbor-memory' || !hydration.docket_present) {
    throw new Error(`A14 Harbor Memory custody hydration held: ${JSON.stringify({ ...hydration, archiveCase })}`);
  }
  if (hydration.public_core?.case_id !== archiveCase.case_id || hydration.public_core?.case_map_digest !== archiveCase.case_map_digest) {
    throw new Error(`A14 public core and persisted case diverged: ${JSON.stringify({ public_core:hydration.public_core, archiveCase })}`);
  }

  await settleMap(page);

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
      case_map_digest:current.case_map_digest || null,
      route_memory_digest:current.route_memory_digest || null,
      archive_version:document.documentElement.dataset.ashArchiveAccession || null,
      workspace:document.documentElement.dataset.ashPremiumWorkspace || null,
      registry_status:document.getElementById('demoProfileStatus')?.textContent || '',
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
  if (!result.active_case || result.active_case !== archiveCase.case_id || result.archive_version !== 'td613.ash.archive-demo/v0.2-a14-harbor-memory' || result.workspace !== 'map') throw new Error(`A14 Harbor Memory presentation held: ${JSON.stringify({ result, archiveCase })}`);
  for (const phrase of ['Harbor Memory Archive','original audio','transcript','uncertain date','duplicate scan','donor restriction','missing release','embargo','public access copy','Nothing has been published','no ownership','no access grant']) {
    if (!result.docket_text.toLowerCase().includes(phrase.toLowerCase())) throw new Error(`A14 docket omitted ${phrase}: ${JSON.stringify(result)}`);
  }
  if (result.release_disabled !== true || result.provider_approval_checked !== false || result.handoff_is_link !== true) throw new Error(`A14 widened action authority: ${JSON.stringify(result)}`);
  if (result.unexpected_text || result.imported_reader) throw new Error(`A14 fabricated provider output: ${JSON.stringify(result)}`);
  if (result.url !== '/dome-world/ash-threshold.html' || result.title !== 'TD613 Ash' || result.overflow > 1) throw new Error(`A14 presentation drift: ${JSON.stringify(result)}`);

  await page.screenshot({ path:path.join(artifactDir, `${browserName}-${label}.png`), fullPage:true });
  return { ...result, persisted_profile:archiveCase.profile, persisted_archive_marker:true };
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
    schema:'td613.ash.a14-harbor-memory-browser-witness/v0.4-persisted-custody-record',
    browser:browserName,
    receipts,
    registry_owner:'ASH_DEMO_REGISTRY',
    promoted_profiles:6,
    archive_status:'PROMOTED',
    archive_owner:'ARCHIVE',
    persisted_case_profile_verified:true,
    persisted_operator_marker_verified:true,
    mixed_media_fixture_complete:true,
    original_derivative_lineage_visible:true,
    route_digests_valid:true,
    graph_wide_mass_eviction_executed:false,
    custody_authority_changed:false,
    ownership_authority:false,
    authenticity_authority:false,
    access_granted:false,
    release_authority:false,
    declassification_authority:false,
    publication_authority:false,
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
