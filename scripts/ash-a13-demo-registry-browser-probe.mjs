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

async function captureConvergenceState(page, checkpoint) {
  return page.evaluate(label => {
    const root = document.documentElement;
    const button = document.getElementById('startDemo');
    const select = document.getElementById('newProfile');
    const current = window.__td613AshKeep?.current?.() || null;
    let registry = null;
    try { registry = window.__td613AshDemoRegistry?.snapshot?.() || null; } catch {}
    let canonical = null;
    try {
      const state = window.__td613AshProfilePromptCanonical?.current?.();
      if (state) canonical = {
        explicit_choice:state.explicit_choice,
        adopted_precanonical_revision:state.adopted_precanonical_revision,
        observed_selector_bound:state.observed_selector_bound,
        observed_start_bound:state.observed_start_bound,
        observer_scope:state.observer_scope
      };
    } catch {}
    return {
      checkpoint:label,
      observed_at:new Date().toISOString(),
      url:location.pathname + location.search,
      title:document.title,
      active_case:current?.case_id || null,
      selected_profile:root.dataset.ashDemoRegistryProfile || null,
      premium_workspace:root.dataset.ashPremiumWorkspace || null,
      registry_state:root.dataset.ashDemoRegistryState || null,
      registry_owner:root.dataset.ashDemoControlOwner || null,
      select_value:select?.value || null,
      select_present:Boolean(select),
      start_demo_present:Boolean(button),
      start_demo_owner:button?.dataset.ashDemoRegistryOwner || null,
      start_demo_state:button?.dataset.ashMethodDemoState || null,
      start_demo_disabled:button?.disabled ?? null,
      start_demo_effectively_disabled:button?.matches(':disabled') ?? null,
      viewport:{width:innerWidth, height:innerHeight},
      reduced_motion:matchMedia('(prefers-reduced-motion: reduce)').matches,
      canonical,
      registry
    };
  }, checkpoint);
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

  const readiness = {
    schema:'td613.ash.a13-profile-readiness-diagnostic/v0.1',
    mode:label,
    completed_profiles:[],
    expected:null,
    checkpoints:[]
  };
  for (const profile of promoted) {
    readiness.expected = {
      select_value:profile,
      start_demo_owner:'td613.ash.demo-registry/v0.3-a15',
      start_demo_state:'READY',
      start_demo_disabled:false
    };
    readiness.checkpoints = [];
    try {
      await selectRegistryProfile(page, profile);
      readiness.checkpoints.push(await captureConvergenceState(page, 'AFTER_PROFILE_SELECTION'));
      await page.waitForFunction(expected => {
        const button = document.getElementById('startDemo');
        return document.getElementById('newProfile')?.value === expected
          && button?.dataset.ashDemoRegistryOwner === 'td613.ash.demo-registry/v0.3-a15'
          && button?.dataset.ashMethodDemoState === 'READY'
          && button.disabled === false;
      }, profile, { timeout:60_000 });
      readiness.completed_profiles.push(profile);
    } catch (error) {
      try {
        readiness.checkpoints.push(await captureConvergenceState(page, 'PROFILE_READINESS_FAILED'));
      } catch { readiness.snapshot_unavailable = true; }
      await fs.writeFile(path.join(artifactDir, `${browserName}-${label}-a13-readiness-diagnostic.json`), JSON.stringify(readiness, null, 2));
      try { await page.screenshot({ path:path.join(artifactDir, `${browserName}-${label}-a13-readiness-failure.png`), fullPage:true }); } catch {}
      error.td613A13Readiness = readiness;
      throw error;
    }
  }

  const convergence = {
    schema:'td613.ash.a13-post-click-convergence-diagnostic/v0.1',
    expected:{
      active_case:true,
      selected_profile:'investigation',
      premium_workspace:'home'
    },
    checkpoints:[]
  };
  convergence.checkpoints.push(await captureConvergenceState(page, 'BEFORE_INVESTIGATION_ACTIVATION'));
  await activateInvestigation(page);
  convergence.checkpoints.push(await captureConvergenceState(page, 'IMMEDIATELY_AFTER_INVESTIGATION_ACTIVATION'));
  try {
    await page.waitForFunction(() => Boolean(window.__td613AshKeep?.current?.()?.case_id)
      && document.documentElement.dataset.ashDemoRegistryProfile === 'investigation'
      && document.documentElement.dataset.ashPremiumWorkspace === 'home', null, { timeout:120_000 });
  } catch (error) {
    try {
      convergence.checkpoints.push(await captureConvergenceState(page, 'POST_CLICK_CONVERGENCE_TIMEOUT'));
    } catch (snapshotError) {
      convergence.snapshot_error = String(snapshotError?.stack || snapshotError);
    }
    const diagnosticPath = path.join(artifactDir, `${browserName}-${label}-a13-convergence-diagnostic.json`);
    await fs.writeFile(diagnosticPath, JSON.stringify(convergence, null, 2));
    try { await page.screenshot({ path:path.join(artifactDir, `${browserName}-${label}-a13-convergence-timeout.png`), fullPage:true }); } catch {}
    error.td613A13Convergence = convergence;
    throw error;
  }
  convergence.checkpoints.push(await captureConvergenceState(page, 'POST_CLICK_CONVERGENCE_PASS'));

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
  return { ...result, convergence };
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
  await fs.writeFile(path.join(artifactDir, `${browserName}-a13-registry-failure.json`), JSON.stringify({
    error:String(error?.stack || error),
    completed_receipts:receipts,
    readiness:error?.td613A13Readiness || null,
    convergence:error?.td613A13Convergence || null
  }, null, 2));
  throw error;
} finally {
  await browser.close();
}
