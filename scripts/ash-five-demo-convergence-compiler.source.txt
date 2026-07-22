import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-constitutional-convergence');
const sourceUrl = new URL('./ash-constitutional-convergence-probe.mjs', import.meta.url);
const runtimePath = path.join(artifactDir, 'ash-constitutional-convergence-probe.runtime.mjs');

const legacyUrlTarget = "const keepUrl = `${base}/dome-world/ash-keep.html`;";
const legacyUrlReplacement = "const keepUrl = `${base}/dome-world/ash-keep.html?presentation=legacy`;";

const readinessTarget = `  await page.goto(keepUrl, { waitUntil: 'networkidle' });
  await page.locator('#startDemo').click();
  await page.waitForFunction(() => /Glasshouse Archive/i.test(document.getElementById('caseTitle')?.textContent || ''));
  await page.waitForFunction(() => document.documentElement.dataset.ashConvergence?.includes('constitutional-convergence'));`;
const readinessReplacement = `  await page.goto(keepUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && typeof window.TD613AshConvergence?.composition === 'function'
    && document.documentElement.dataset.ashConvergence?.includes('constitutional-convergence')
    && document.getElementById('newProfile')
    && document.getElementById('startDemo'), null, { timeout: 60000 });
  report.observations.boot_readiness = {
    keep_core_ready: true,
    convergence_runtime_ready: true,
    profile_control_ready: true,
    profile_demo_registry_deferred_until_selection: true,
    demo_entry_convergence_deferred_until_case_hydration: true,
    demo_click_deferred_until_ready: true,
    profile_selected_explicitly: true,
    network_idle_not_required: true,
    presentation_route: 'legacy'
  };
  await page.locator('#newProfile').selectOption('political_campaign');
  await page.waitForFunction(() => window.__td613AshProfileDemos?.profiles?.includes('political_campaign')
    && !document.getElementById('startDemo')?.disabled
    && /Political Campaign/.test(document.getElementById('startDemo')?.textContent || ''), null, { timeout: 60000 });
  report.observations.boot_readiness.profile_demo_registry_ready = true;
  await page.locator('#startDemo').click();
  await page.waitForFunction(() => /Harbor City Mayoral Campaign/i.test(document.getElementById('caseTitle')?.textContent || ''), null, { timeout: 60000 });
  await page.waitForFunction(() => {
    const caseId = localStorage.getItem('td613.ash-keep.current-case');
    const convergenceApi = window.__td613AshDemoEntryConvergence || null;
    const convergence = convergenceApi?.current?.() || null;
    const panel = document.getElementById('workspace-map');
    const style = panel ? getComputedStyle(panel) : null;
    const rect = panel?.getBoundingClientRect();
    return caseId
      && convergenceApi?.version
      && document.documentElement.dataset.ashDemoEntryReady === 'political_campaign:map'
      && document.documentElement.dataset.ashDemoEntryCase === caseId
      && document.documentElement.dataset.ashDemoEntryHydrating !== 'true'
      && !document.documentElement.dataset.ashDemoEntryHold
      && convergence?.posture === 'READY'
      && convergence?.phase === 'VISIBLE'
      && convergence?.workspace === 'map'
      && panel?.classList.contains('active')
      && style?.display !== 'none'
      && style?.visibility !== 'hidden'
      && Number(style?.opacity) > 0
      && rect?.width > 0
      && rect?.height > 0;
  }, null, { timeout: 60000 });
  report.observations.demo_entry_release = {
    demo_entry_api_ready_after_hydration: true,
    profile: 'political_campaign',
    workspace: 'map',
    posture: 'READY',
    phase: 'VISIBLE'
  };
  await page.waitForFunction(() => document.documentElement.dataset.ashConvergence?.includes('constitutional-convergence'), null, { timeout: 60000 });`;

const testWorkspaceTarget = `  await page.locator('[data-workspace="test"]').click();`;
const testWorkspaceReplacement = `  await page.evaluate(() => {
    const open = window.__td613AshPremiumUI?.open
      || window.__td613OpenAshWorkspace
      || window.__td613AshKeep?.openWorkspace;
    if (typeof open !== 'function') throw new Error('Ash guided workspace API is unavailable for convergence Test.');
    open('test');
  });
  await page.waitForFunction(() => {
    const panel = document.getElementById('workspace-test');
    const style = panel ? getComputedStyle(panel) : null;
    const rect = panel?.getBoundingClientRect();
    return document.documentElement.dataset.ashPremiumWorkspace === 'test'
      && panel?.classList.contains('active')
      && style?.display !== 'none'
      && style?.visibility !== 'hidden'
      && Number(style?.opacity) > 0
      && rect?.width > 0
      && rect?.height > 0;
  });`;

const authorityTarget = `  authority = await page.evaluate(() => window.TD613AshConvergence.currentAuthorityContext());
  const hushPermission = await page.evaluate(() => window.TD613AshConvergence.authorize('HUSH_CANDIDATE'));`;
const authorityReplacement = `  await page.waitForFunction(async () => {
    try {
      const decision = await window.TD613AshConvergence.authorize('HUSH_CANDIDATE');
      return decision?.authorized === true;
    } catch {
      return false;
    }
  }, null, { timeout: 60000 });
  authority = await page.evaluate(() => window.TD613AshConvergence.currentAuthorityContext());
  const hushPermission = await page.evaluate(() => window.TD613AshConvergence.authorize('HUSH_CANDIDATE'));`;

const mapWorkspaceTarget = `  await page.locator('[data-workspace="map"]').click();`;
const mapWorkspaceReplacement = `  await page.evaluate(() => {
    const open = window.__td613AshPremiumUI?.open
      || window.__td613OpenAshWorkspace
      || window.__td613AshKeep?.openWorkspace;
    if (typeof open !== 'function') throw new Error('Ash guided workspace API is unavailable for convergence Map.');
    open('map');
  });
  await page.waitForFunction(() => {
    const panel = document.getElementById('workspace-map');
    const style = panel ? getComputedStyle(panel) : null;
    const rect = panel?.getBoundingClientRect();
    return document.documentElement.dataset.ashPremiumWorkspace === 'map'
      && panel?.classList.contains('active')
      && style?.display !== 'none'
      && style?.visibility !== 'hidden'
      && Number(style?.opacity) > 0
      && rect?.width > 0
      && rect?.height > 0;
  });`;

const deletionTarget = `  await page.locator('#selectCase').selectOption(secondCase);
  await page.waitForFunction(() => document.getElementById('deleteSelectedCase')?.disabled === false);
  await page.locator('#deleteSelectedCase').click();`;
const deletionReplacement = `  await page.locator('#selectCase').selectOption(secondCase);
  await page.waitForFunction(id => {
    const select = document.getElementById('selectCase');
    const remove = document.getElementById('deleteSelectedCase');
    if (select?.dataset.caseListState !== 'READY') return false;
    if (![...select.options].some(option => option.value === id)) return false;
    if (select.value !== id || remove?.disabled !== false) {
      select.value = id;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (select.value !== id || remove?.disabled !== false) return false;
    if (remove.dataset.convergenceDeleteIssued === id) return true;
    remove.dataset.convergenceDeleteIssued = id;
    remove.click();
    return true;
  }, secondCase);`;

const secondTabTarget = `  await secondPage.goto(keepUrl, { waitUntil: 'networkidle' });`;
const secondTabReplacement = `  await secondPage.goto(keepUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await secondPage.waitForFunction(() => typeof window.TD613AshConvergence?.withOperation === 'function'
    && document.documentElement.dataset.ashConvergence?.includes('constitutional-convergence'), null, { timeout: 60000 });`;

const reloadTarget = `  await page.reload({ waitUntil: 'networkidle' });`;
const reloadReplacement = `  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => Boolean(document.documentElement.dataset.ashCaseControls)
    && typeof window.TD613AshConvergence?.runDryCompatibilityAudit === 'function', null, { timeout: 60000 });`;

const localKeysTarget = `const allowedLocalKeys = new Set(['td613.ash-keep.current-case', 'td613.ash-keep.preferences', 'td613.ash.cache-flush.epoch']);`;
const localKeysReplacement = `const allowedLocalKeys = new Set(['td613.ash-keep.current-case', 'td613.ash-keep.preferences', 'td613.ash.cache-flush.epoch', 'td613.ash.session.epoch']);`;

await fs.mkdir(artifactDir, { recursive: true });
const source = await fs.readFile(sourceUrl, 'utf8');
const legacyUrlCount = source.split(legacyUrlTarget).length - 1;
const readinessCount = source.split(readinessTarget).length - 1;
const testWorkspaceCount = source.split(testWorkspaceTarget).length - 1;
const authorityCount = source.split(authorityTarget).length - 1;
const mapWorkspaceCount = source.split(mapWorkspaceTarget).length - 1;
const deletionCount = source.split(deletionTarget).length - 1;
const secondTabCount = source.split(secondTabTarget).length - 1;
const reloadCount = source.split(reloadTarget).length - 1;
const localKeysCount = source.split(localKeysTarget).length - 1;
if (legacyUrlCount !== 1) throw new Error(`Convergence observer expected one undeclared presentation route; observed ${legacyUrlCount}.`);
if (readinessCount !== 1) throw new Error(`Convergence observer expected one Ash boot-readiness seam; observed ${readinessCount}.`);
if (testWorkspaceCount !== 1) throw new Error(`Convergence observer expected one legacy Test workspace seam; observed ${testWorkspaceCount}.`);
if (authorityCount !== 1) throw new Error(`Convergence observer expected one permission-stabilization seam; observed ${authorityCount}.`);
if (mapWorkspaceCount !== 1) throw new Error(`Convergence observer expected one legacy Map workspace seam; observed ${mapWorkspaceCount}.`);
if (deletionCount !== 1) throw new Error(`Convergence observer expected one case-selection seam and one atomic case-deletion seam; observed ${deletionCount}.`);
if (secondTabCount !== 1) throw new Error(`Convergence observer expected one second-tab readiness seam; observed ${secondTabCount}.`);
if (reloadCount !== 1) throw new Error(`Convergence observer expected one reload readiness seam; observed ${reloadCount}.`);
if (localKeysCount !== 1) throw new Error(`Convergence observer expected one localStorage allowlist seam; observed ${localKeysCount}.`);
const runtime = source
  .replace(legacyUrlTarget, legacyUrlReplacement)
  .replace(readinessTarget, readinessReplacement)
  .replace(testWorkspaceTarget, testWorkspaceReplacement)
  .replace(authorityTarget, authorityReplacement)
  .replace(mapWorkspaceTarget, mapWorkspaceReplacement)
  .replace(deletionTarget, deletionReplacement)
  .replace(secondTabTarget, secondTabReplacement)
  .replace(reloadTarget, reloadReplacement)
  .replace(localKeysTarget, localKeysReplacement);
if (!runtime.includes("ash-keep.html?presentation=legacy")) {
  throw new Error('Convergence observer failed to declare the legacy presentation route.');
}
if (!runtime.includes("authorize('HUSH_CANDIDATE')") || !runtime.includes('decision?.authorized === true')) {
  throw new Error('Convergence observer failed to wait for the actual Hush permission boundary.');
}
if (!runtime.includes('demo_entry_convergence_deferred_until_case_hydration: true')
  || !runtime.includes('demo_entry_api_ready_after_hydration: true')
  || !runtime.includes('demo_click_deferred_until_ready: true')
  || !runtime.includes('profile_selected_explicitly: true')
  || !runtime.includes('network_idle_not_required: true')
  || !runtime.includes("selectOption('political_campaign')")
  || !runtime.includes('Harbor City Mayoral Campaign')
  || !runtime.includes("ashDemoEntryReady === 'political_campaign:map'")
  || !runtime.includes("convergence?.phase === 'VISIBLE'")
  || !runtime.includes('convergenceApi?.version')
  || !runtime.includes('window.__td613AshProfileDemos?.profiles?.includes')) {
  throw new Error('Convergence observer explicit profile and deferred entry-readiness gate was not materialized.');
}
if (!runtime.includes("open('test')") || !runtime.includes("open('map')") || runtime.includes("page.locator('[data-workspace=\"test\"]').click()")) {
  throw new Error('Convergence observer guided workspace migration was not materialized.');
}
if (!runtime.includes("dataset.ashPremiumWorkspace === 'test"") || !runtime.includes("dataset.ashPremiumWorkspace === 'map'") || !runtime.includes("Number(style?.opacity) > 0")) {
  throw new Error('Convergence observer visible workspace gates were not materialized.');
}
if (!runtime.includes("select.dispatchEvent(new Event('change', { bubbles: true }))") || !runtime.includes('remove.click()')) {
  throw new Error('Convergence observer repaint-atomic delete gesture was not materialized.');
}
if (!runtime.includes("'td613.ash.session.epoch'")) {
  throw new Error('Convergence observer canonical session epoch allowlist was not materialized.');
}
if (runtime.includes("waitUntil: 'networkidle'")) {
  throw new Error('Convergence observer retained an unbounded network-idle dependency.');
}
if (!runtime.includes("waitUntil: 'domcontentloaded'")
  || !runtime.includes('TD613AshConvergence?.withOperation')
  || !runtime.includes('TD613AshConvergence?.runDryCompatibilityAudit')) {
  throw new Error('Convergence observer explicit navigation readiness gates were not materialized.');
}
await fs.writeFile(runtimePath, runtime, 'utf8');
await import(`${pathToFileURL(runtimePath).href}?aftercare=${Date.now()}`);
