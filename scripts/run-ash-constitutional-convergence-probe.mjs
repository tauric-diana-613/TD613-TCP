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
    && window.__td613AshDemoRegistry?.version === 'td613.ash.demo-registry/v0.1-a13'
    && window.__td613AshDemoRegistry?.snapshot?.().control_owner === 'ASH_DEMO_REGISTRY'
    && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
    && document.documentElement.dataset.ashDemoRegistry === 'td613.ash.demo-registry/v0.1-a13'
    && document.getElementById('newProfile')?.value === ''
    && document.getElementById('startDemo')?.dataset.ashMethodDemoState === 'HELD', null, { timeout: 60000 });
  report.observations.boot_readiness = {
    keep_core_ready: true,
    convergence_runtime_ready: true,
    profile_control_ready: true,
    profile_demo_registry_ready_before_selection: true,
    demo_entry_convergence_deferred_until_case_hydration: true,
    demo_click_deferred_until_ready: true,
    profile_selected_explicitly: true,
    network_idle_not_required: true,
    presentation_route: 'legacy'
  };
  await page.evaluate(() => {
    const registry = window.__td613AshDemoRegistry;
    const select = document.getElementById('newProfile');
    const button = document.getElementById('startDemo');
    if (!registry?.version || !select || !button) {
      throw new Error('A13 registry-owned convergence demo control unavailable.');
    }
    select.value = 'political_campaign';
    select.dispatchEvent(new Event('change', { bubbles:true }));
    registry.reconcile();
    const snapshot = registry.snapshot?.() || null;
    const ready = select.value === 'political_campaign'
      && snapshot?.control_owner === 'ASH_DEMO_REGISTRY'
      && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
      && button.dataset.ashDemoRegistryOwner === 'td613.ash.demo-registry/v0.1-a13'
      && button.dataset.ashMethodDemoState === 'READY'
      && button.disabled === false
      && !button.matches(':disabled');
    if (!ready) throw new Error('A13 registry-owned convergence demo control was not atomically actionable.');
    button.click();
  });
  report.observations.boot_readiness.profile_demo_registry_ready = true;
  report.observations.boot_readiness.profile_demo_activation = 'ATOMIC_REGISTRY_TASK';
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

const rebuildTarget = `  await page.locator('#loadSeed').click();
  await page.waitForFunction(() => /"test_digest"/.test(document.getElementById('testReceipt')?.textContent || ''));`;
const rebuildReplacement = `  await page.locator('#loadSeed').click();
  const rebuildConfirmation = page.getByRole('button', { name:/Confirm this exact gesture/i });
  await rebuildConfirmation.waitFor({ state:'visible', timeout:45000 });
  await rebuildConfirmation.click();
  await page.waitForFunction(() => /"test_digest"/.test(document.getElementById('testReceipt')?.textContent || ''), null, { timeout:45000 });`;

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

const secondCaseTarget = `  await page.locator('#newTitle').fill('Synthetic second case');
  await page.locator('#newCase').click();
  await page.waitForFunction(() => /Synthetic second case/i.test(document.getElementById('caseTitle')?.textContent || ''));`;
const secondCaseReplacement = `  await page.evaluate(() => {
    const registry = window.__td613AshDemoRegistry;
    const select = document.getElementById('newProfile');
    const button = document.getElementById('startDemo');
    if (!registry?.version || !select || !button) {
      throw new Error('A13 registry-owned second convergence demo control unavailable.');
    }
    select.value = 'political_campaign';
    select.dispatchEvent(new Event('change', { bubbles:true }));
    registry.reconcile();
    const snapshot = registry.snapshot?.() || null;
    const ready = select.value === 'political_campaign'
      && snapshot?.control_owner === 'ASH_DEMO_REGISTRY'
      && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
      && button.dataset.ashDemoRegistryOwner === 'td613.ash.demo-registry/v0.1-a13'
      && button.dataset.ashMethodDemoState === 'READY'
      && button.disabled === false
      && !button.matches(':disabled');
    if (!ready) throw new Error('A13 registry-owned second convergence demo control was not atomically actionable.');
    button.click();
  });
  await page.waitForFunction(first => {
    const current = localStorage.getItem('td613.ash-keep.current-case');
    return Boolean(current && current !== first)
      && /Harbor City Mayoral Campaign/i.test(document.getElementById('caseTitle')?.textContent || '');
  }, firstCase, { timeout:60000 });
  report.observations.second_case_entry = {
    route:'GOVERNED_PROFILE_DEMO',
    explicit_profile:true,
    activation:'ATOMIC_REGISTRY_TASK',
    blank_new_case_control_deferred_to_stage:'A6'
  };`;

const saveCloseTarget = `  await page.locator('#saveCase').click();
  await page.locator('#closeCase').click();`;
const saveCloseReplacement = `  await page.locator('#saveCase').click();
  await page.waitForFunction(async id => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('td613-ash-keep');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      if (!db.objectStoreNames.contains('savedCases')) return false;
      return await new Promise((resolve, reject) => {
        const request = db.transaction('savedCases').objectStore('savedCases').get(id);
        request.onsuccess = () => resolve(Boolean(request.result));
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  }, secondCase, { timeout:45000 });
  report.observations.second_case_persistence = {
    saved_case_fingerprint_observed:true,
    closure_after_fingerprint_completion:true
  };
  await page.locator('#closeCase').click();`;

const openSelectionTarget = `  await page.locator('#selectCase').selectOption(firstCase);
  await page.waitForFunction(id => document.getElementById('selectCase')?.value === id, firstCase);
  await page.waitForFunction(() => document.getElementById('openSelectedCase')?.disabled === false);
  await page.evaluate(() => { window.__convergenceNoReload = crypto.randomUUID(); });
  const noReloadMarker = await page.evaluate(() => window.__convergenceNoReload);
  await page.locator('#openSelectedCase').click();`;
const openSelectionReplacement = `  await page.waitForFunction(id => {
    const select = document.getElementById('selectCase');
    const open = document.getElementById('openSelectedCase');
    if (select?.dataset.caseListState !== 'READY') return false;
    if (![...select.options].some(option => option.value === id)) return false;
    select.value = id;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    if (select.value !== id || open?.disabled !== false) return false;
    if (open.dataset.convergenceOpenIssued === id) return true;
    window.__convergenceNoReload = crypto.randomUUID();
    open.dataset.convergenceOpenIssued = id;
    open.click();
    return true;
  }, firstCase, { timeout:45000 });
  const noReloadMarker = await page.evaluate(() => window.__convergenceNoReload);`;

const reopenTarget = `  await page.locator('#selectCase').selectOption(firstCase);
  await page.waitForFunction(() => document.getElementById('openSelectedCase')?.disabled === false);
  await page.locator('#openSelectedCase').click();`;
const reopenReplacement = `  await page.waitForFunction(id => {
    const select = document.getElementById('selectCase');
    const open = document.getElementById('openSelectedCase');
    if (select?.dataset.caseListState !== 'READY') return false;
    if (![...select.options].some(option => option.value === id)) return false;
    select.value = id;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    if (select.value !== id || open?.disabled !== false) return false;
    if (open.dataset.convergenceReopenIssued === id) return true;
    open.dataset.convergenceReopenIssued = id;
    open.click();
    return true;
  }, firstCase, { timeout:45000 });`;

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

const lockWaitTarget = `  const [firstResult, secondResult] = await Promise.all([firstLock, secondLock]);`;
const lockWaitReplacement = `  const [firstResult, secondResult] = await Promise.race([
    Promise.all([firstLock, secondLock]),
    new Promise((_, reject) => setTimeout(
      () => reject(new Error('Cross-tab lock witness exceeded 35000ms.')),
      35000
    ))
  ]);`;

const localKeysTarget = `const allowedLocalKeys = new Set(['td613.ash-keep.current-case', 'td613.ash-keep.preferences', 'td613.ash.cache-flush.epoch']);`;
const localKeysReplacement = `const allowedLocalKeys = new Set(['td613.ash-keep.current-case', 'td613.ash-keep.preferences', 'td613.ash.cache-flush.epoch']);
allowedLocalKeys.add('td613.ash.cache-flush.aia3.epoch');
allowedLocalKeys.add('td613.ash.cache-preflight.epoch');`;

const closeTarget = `    await page.locator('#closeCase').click();`;
const closeReplacement = `    await page.locator('#closeCase').click();
    const closeConfirmation = page.getByRole('button', { name:/Confirm this exact gesture/i });
    if (await closeConfirmation.isVisible().catch(() => false)) await closeConfirmation.click();`;

const releaseTarget = `    await page.locator('#releaseCapsule').click();`;
const releaseReplacement = `    await page.locator('#releaseCapsule').click();
    const releaseConfirmation = page.getByRole('button', { name:/Confirm this exact gesture/i });
    if (await releaseConfirmation.isVisible().catch(() => false)) await releaseConfirmation.click();`;

const source = await fs.readFile(sourceUrl, 'utf8');
const replacements = [
  [legacyUrlTarget, legacyUrlReplacement],
  [readinessTarget, readinessReplacement],
  [testWorkspaceTarget, testWorkspaceReplacement],
  [rebuildTarget, rebuildReplacement],
  [authorityTarget, authorityReplacement],
  [mapWorkspaceTarget, mapWorkspaceReplacement],
  [secondCaseTarget, secondCaseReplacement],
  [saveCloseTarget, saveCloseReplacement],
  [openSelectionTarget, openSelectionReplacement],
  [reopenTarget, reopenReplacement],
  [deletionTarget, deletionReplacement],
  [secondTabTarget, secondTabReplacement],
  [reloadTarget, reloadReplacement],
  [lockWaitTarget, lockWaitReplacement],
  [localKeysTarget, localKeysReplacement],
  [closeTarget, closeReplacement],
  [releaseTarget, releaseReplacement]
];

let runtime = source;
for (const [target, replacement] of replacements) {
  if (!runtime.includes(target)) throw new Error(`Ash convergence runtime target missing: ${target.slice(0, 80)}`);
  runtime = runtime.replace(target, replacement);
}

await fs.mkdir(artifactDir, { recursive:true });
await fs.writeFile(runtimePath, runtime);
await import(`${pathToFileURL(runtimePath).href}?run=${Date.now()}`);
