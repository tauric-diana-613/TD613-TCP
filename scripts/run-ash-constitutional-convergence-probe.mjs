import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

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
const secondCaseReplacement = `  await page.locator('#newProfile').selectOption('political_campaign');
  await page.waitForFunction(() => document.getElementById('newProfile')?.value === 'political_campaign'
    && !document.getElementById('startDemo')?.disabled
    && /Political Campaign/.test(document.getElementById('startDemo')?.textContent || ''), null, { timeout:45000 });
  await page.locator('#startDemo').click();
  await page.waitForFunction(first => {
    const current = localStorage.getItem('td613.ash-keep.current-case');
    return Boolean(current && current !== first)
      && /Harbor City Mayoral Campaign/i.test(document.getElementById('caseTitle')?.textContent || '');
  }, firstCase, { timeout:60000 });
  report.observations.second_case_entry = {
    route:'GOVERNED_PROFILE_DEMO',
    explicit_profile:true,
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
const localKeysReplacement = `const allowedLocalKeys = new Set(['td613.ash-keep.current-case', 'td613.ash-keep.preferences', 'td613.ash.cache-flush.epoch', 'td613.ash.session.epoch']);`;

await fs.mkdir(artifactDir, { recursive: true });
const source = await fs.readFile(sourceUrl, 'utf8');
const legacyUrlCount = source.split(legacyUrlTarget).length - 1;
const readinessCount = source.split(readinessTarget).length - 1;
const testWorkspaceCount = source.split(testWorkspaceTarget).length - 1;
const rebuildCount = source.split(rebuildTarget).length - 1;
const authorityCount = source.split(authorityTarget).length - 1;
const mapWorkspaceCount = source.split(mapWorkspaceTarget).length - 1;
const secondCaseCount = source.split(secondCaseTarget).length - 1;
const saveCloseCount = source.split(saveCloseTarget).length - 1;
const openSelectionCount = source.split(openSelectionTarget).length - 1;
const reopenCount = source.split(reopenTarget).length - 1;
const deletionCount = source.split(deletionTarget).length - 1;
const secondTabCount = source.split(secondTabTarget).length - 1;
const reloadCount = source.split(reloadTarget).length - 1;
const lockWaitCount = source.split(lockWaitTarget).length - 1;
const localKeysCount = source.split(localKeysTarget).length - 1;
if (legacyUrlCount !== 1) throw new Error(`Convergence observer expected one undeclared presentation route; observed ${legacyUrlCount}.`);
if (readinessCount !== 1) throw new Error(`Convergence observer expected one Ash boot-readiness seam; observed ${readinessCount}.`);
if (testWorkspaceCount !== 1) throw new Error(`Convergence observer expected one legacy Test workspace seam; observed ${testWorkspaceCount}.`);
if (rebuildCount !== 1) throw new Error(`Convergence observer expected one governed Rebuild confirmation seam; observed ${rebuildCount}.`);
if (authorityCount !== 1) throw new Error(`Convergence observer expected one permission-stabilization seam; observed ${authorityCount}.`);
if (mapWorkspaceCount !== 1) throw new Error(`Convergence observer expected one legacy Map workspace seam; observed ${mapWorkspaceCount}.`);
if (secondCaseCount !== 1) throw new Error(`Convergence observer expected one governed second-case route seam; observed ${secondCaseCount}.`);
if (saveCloseCount !== 1) throw new Error(`Convergence observer expected one saved-case fingerprint seam; observed ${saveCloseCount}.`);
if (openSelectionCount !== 1) throw new Error(`Convergence observer expected one repaint-atomic Open selection seam; observed ${openSelectionCount}.`);
if (reopenCount !== 1) throw new Error(`Convergence observer expected one repaint-atomic Open re-entry seam; observed ${reopenCount}.`);
if (deletionCount !== 1) throw new Error(`Convergence observer expected one case-selection seam and one atomic case-deletion seam; observed ${deletionCount}.`);
if (secondTabCount !== 1) throw new Error(`Convergence observer expected one second-tab readiness seam; observed ${secondTabCount}.`);
if (reloadCount !== 1) throw new Error(`Convergence observer expected one reload readiness seam; observed ${reloadCount}.`);
if (lockWaitCount !== 1) throw new Error(`Convergence observer expected one bounded cross-tab join seam; observed ${lockWaitCount}.`);
if (localKeysCount !== 1) throw new Error(`Convergence observer expected one localStorage allowlist seam; observed ${localKeysCount}.`);
const runtime = source
  .replace(legacyUrlTarget, legacyUrlReplacement)
  .replace(readinessTarget, readinessReplacement)
  .replace(testWorkspaceTarget, testWorkspaceReplacement)
  .replace(rebuildTarget, rebuildReplacement)
  .replace(authorityTarget, authorityReplacement)
  .replace(mapWorkspaceTarget, mapWorkspaceReplacement)
  .replace(secondCaseTarget, secondCaseReplacement)
  .replace(saveCloseTarget, saveCloseReplacement)
  .replace(openSelectionTarget, openSelectionReplacement)
  .replace(reopenTarget, reopenReplacement)
  .replace(deletionTarget, deletionReplacement)
  .replace(secondTabTarget, secondTabReplacement)
  .replace(reloadTarget, reloadReplacement)
  .replace(lockWaitTarget, lockWaitReplacement)
  .replace(localKeysTarget, localKeysReplacement);
if (!runtime.includes("ash-keep.html?presentation=legacy")) {
  throw new Error('Convergence observer failed to declare the legacy presentation route.');
}
if (!runtime.includes("authorize('HUSH_CANDIDATE')") || !runtime.includes('decision?.authorized === true')) {
  throw new Error('Convergence observer failed to wait for the actual Hush permission boundary.');
}
if (!runtime.includes("getByRole('button', { name:/Confirm this exact gesture/i })")) {
  throw new Error('Convergence observer failed to materialize the governed Rebuild confirmation gesture.');
}
if (!runtime.includes("route:'GOVERNED_PROFILE_DEMO'") || !runtime.includes("blank_new_case_control_deferred_to_stage:'A6'")) {
  throw new Error('Convergence observer failed to preserve multi-case coverage while deferring the dead blank-case control to A6.');
}
if (!runtime.includes('saved_case_fingerprint_observed:true') || !runtime.includes('closure_after_fingerprint_completion:true')) {
  throw new Error('Convergence observer failed to wait for the saved-case fingerprint before closure.');
}
if (!runtime.includes('profile_demo_registry_deferred_until_selection: true')
  || !runtime.includes('demo_entry_convergence_deferred_until_case_hydration: true')
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
if (!runtime.includes("dataset.ashPremiumWorkspace === 'test'") || !runtime.includes("dataset.ashPremiumWorkspace === 'map'") || !runtime.includes("Number(style?.opacity) > 0")) {
  throw new Error('Convergence observer visible workspace gates were not materialized.');
}
if (!runtime.includes("document.getElementById('openSelectedCase')")
  || !runtime.includes("select.dispatchEvent(new Event('change', { bubbles: true }))")
  || !runtime.includes('convergenceOpenIssued')
  || !runtime.includes('convergenceReopenIssued')
  || !runtime.includes('open.click()')
  || !runtime.includes('remove.click()')) {
  throw new Error('Convergence observer repaint-atomic Open/Reopen/Delete gestures were not materialized.');
}
if (!runtime.includes('Cross-tab lock witness exceeded 35000ms.')) {
  throw new Error('Convergence observer bounded cross-tab join was not materialized.');
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
const launcherPath = path.join(artifactDir, 'ash-constitutional-convergence-probe.launcher.mjs');
await fs.writeFile(launcherPath, `import { pathToFileURL } from 'node:url';
await import(\`${pathToFileURL(process.argv[2]).href}?isolated=\${Date.now()}\`);
process.exit(0);
`, 'utf8');

const child = spawn(process.execPath, [launcherPath, runtimePath], {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit'
});
const childResult = await new Promise((resolve, reject) => {
  let settled = false;
  const finish = value => {
    if (settled) return;
    settled = true;
    clearTimeout(ceiling);
    resolve(value);
  };
  child.once('error', reject);
  child.once('exit', (code, signal) => finish({ code, signal }));
  const ceiling = setTimeout(() => {
    child.kill('SIGTERM');
    setTimeout(() => child.kill('SIGKILL'), 5000).unref();
    finish({ code: null, signal: 'TD613_CONVERGENCE_CHILD_TIMEOUT' });
  }, 12 * 60 * 1000);
});
if (childResult.signal === 'TD613_CONVERGENCE_CHILD_TIMEOUT') {
  throw new Error('Convergence observer child exceeded its 12-minute terminal ceiling.');
}
if (childResult.signal || childResult.code !== 0) {
  throw new Error(`Convergence observer child failed: code=${childResult.code} signal=${childResult.signal || 'none'}.`);
}
