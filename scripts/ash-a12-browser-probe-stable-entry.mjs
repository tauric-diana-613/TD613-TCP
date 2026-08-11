import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = process.env.TD613_BROWSER || 'chromium';
const baseUrl = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-a12';
const entryPreflightOnly = process.env.TD613_A12_ENTRY_PREFLIGHT === 'true';
const browserType = { chromium, firefox, webkit }[browserName];
const ENTRY_ATTEMPT_CEILING = entryPreflightOnly ? 1 : 3;
const ENTRY_QUIET_MS = 500;
if (!browserType) throw new Error('Unsupported browser ' + browserName);
await fs.mkdir(artifactDir, { recursive:true });
const browser = await browserType.launch({ headless:true });

async function waitForRegistryOwner(page) {
  await page.waitForFunction(() => {
    const registry = window.__td613AshDemoRegistry?.snapshot?.() || null;
    const open = window.__td613AshPremiumUI?.open
      || window.__td613AshUiUxRescue?.open
      || window.__td613OpenAshWorkspace
      || window.__td613AshKeep?.openWorkspace;
    return window.__td613AshDemoRegistry?.version === 'td613.ash.demo-registry/v0.3-a15'
      && registry?.control_owner === 'ASH_DEMO_REGISTRY'
      && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
      && document.documentElement.dataset.ashDemoRegistry === 'td613.ash.demo-registry/v0.3-a15'
      && typeof open === 'function';
  }, null, { timeout:120_000 });
}

async function waitForInstrument(page) {
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && Boolean(window.__td613AshPremiumUI?.version)
    && Boolean(window.__td613AshA12?.version)
    && Boolean(window.__td613AshDemoRegistry?.version)
    && Boolean(window.__td613AshDemoEntryConvergence?.version)
    && document.title === 'TD613 Ash'
    && location.pathname === '/dome-world/ash-threshold.html'
    && !location.search, null, { timeout:120_000 });
}

async function entryDiagnostic(page, attempt, error = null) {
  return page.evaluate(({ attempt, error }) => {
    const current = window.__td613AshKeep?.current?.() || null;
    const convergence = window.__td613AshDemoEntryConvergence?.current?.()
      || window.__td613AshDemoEntryConvergenceState
      || null;
    const menu = document.getElementById('premiumMenuButton');
    const sheet = document.getElementById('premiumCommandSheet');
    const home = document.getElementById('workspace-home');
    const menuStyle = menu ? getComputedStyle(menu) : null;
    const menuRect = menu?.getBoundingClientRect();
    return {
      attempt,
      error,
      profile_value:document.getElementById('newProfile')?.value || null,
      start_demo_state:document.getElementById('startDemo')?.dataset.ashMethodDemoState || null,
      start_demo_disabled:document.getElementById('startDemo')?.disabled ?? null,
      current_case:current?.case_id || null,
      local_pointer:localStorage.getItem('td613.ash-keep.current-case'),
      demo_profile:document.documentElement.dataset.ashDemoProfile || null,
      registry_profile:document.documentElement.dataset.ashDemoRegistryProfile || null,
      workspace:document.documentElement.dataset.ashPremiumWorkspace || null,
      a12_audit:document.documentElement.dataset.ashA12CommandAudit || null,
      entry_ready:document.documentElement.dataset.ashDemoEntryReady || null,
      entry_case:document.documentElement.dataset.ashDemoEntryCase || null,
      entry_posture:document.documentElement.dataset.ashDemoEntryPosture || null,
      entry_phase:document.documentElement.dataset.ashDemoEntryPhase || null,
      convergence,
      menu_connected:Boolean(menu?.isConnected),
      menu_visible:Boolean(menu?.isConnected
        && menuStyle?.display !== 'none'
        && menuStyle?.visibility !== 'hidden'
        && Number(menuStyle?.opacity ?? 1) > 0
        && menuRect?.width > 0
        && menuRect?.height > 0),
      sheet_connected:Boolean(sheet?.isConnected),
      sheet_open:sheet?.open === true,
      home_active:home?.classList.contains('active') || false,
      case_closed:document.body.dataset.ashCaseClosed || null,
      launch_hidden:document.getElementById('launch')?.classList.contains('hidden') || false,
      stability:window.__td613A12EntryStability ? {
        signature:window.__td613A12EntryStability.signature,
        since:window.__td613A12EntryStability.since
      } : null,
      registry_status:document.getElementById('demoProfileStatus')?.textContent || ''
    };
  }, { attempt, error });
}

async function waitForStableInvestigationEntry(page, attempt) {
  await page.evaluate(() => { window.__td613A12EntryStability = null; });
  await page.waitForFunction(({ attempt, quietMs }) => {
    const current = window.__td613AshKeep?.current?.() || null;
    const pointer = localStorage.getItem('td613.ash-keep.current-case');
    const convergence = window.__td613AshDemoEntryConvergence?.current?.()
      || window.__td613AshDemoEntryConvergenceState
      || null;
    const menu = document.getElementById('premiumMenuButton');
    const sheet = document.getElementById('premiumCommandSheet');
    const home = document.getElementById('workspace-home');
    const menuStyle = menu ? getComputedStyle(menu) : null;
    const menuRect = menu?.getBoundingClientRect();
    const ready = Boolean(current?.case_id)
      && pointer === current.case_id
      && convergence?.case_id === current.case_id
      && convergence?.profile === 'investigation'
      && convergence?.workspace === 'home'
      && convergence?.posture === 'READY'
      && convergence?.phase === 'VISIBLE'
      && document.documentElement.dataset.ashDemoEntryReady === 'investigation:home'
      && document.documentElement.dataset.ashDemoEntryCase === current.case_id
      && document.documentElement.dataset.ashPremiumWorkspace === 'home'
      && document.documentElement.dataset.ashA12CommandAudit === 'PASS'
      && (document.documentElement.dataset.ashDemoProfile === 'investigation'
        || document.documentElement.dataset.ashDemoRegistryProfile === 'investigation')
      && home?.classList.contains('active') === true
      && menu?.isConnected
      && sheet?.isConnected
      && menuStyle?.display !== 'none'
      && menuStyle?.visibility !== 'hidden'
      && Number(menuStyle?.opacity ?? 1) > 0
      && menuRect?.width > 0
      && menuRect?.height > 0
      && document.body.dataset.ashCaseClosed !== 'true';
    if (!ready) {
      window.__td613A12EntryStability = null;
      return false;
    }
    const signature = [
      attempt,
      current.case_id,
      pointer,
      convergence.case_id,
      convergence.posture,
      convergence.phase,
      document.documentElement.dataset.ashPremiumWorkspace,
      document.documentElement.dataset.ashA12CommandAudit
    ].join(':');
    const now = performance.now();
    const prior = window.__td613A12EntryStability;
    if (!prior
      || prior.signature !== signature
      || prior.menu !== menu
      || prior.sheet !== sheet
      || prior.home !== home) {
      window.__td613A12EntryStability = { signature, menu, sheet, home, since:now };
      return false;
    }
    return now - prior.since >= quietMs;
  }, { attempt, quietMs:ENTRY_QUIET_MS }, { timeout:45_000, polling:25 });
}

async function activateInvestigationDemo(page) {
  const profile = page.locator('#newProfile');
  await profile.waitFor({ state:'attached', timeout:30_000 });
  await profile.selectOption('investigation');
  await page.evaluate(() => window.__td613AshDemoRegistry?.reconcile?.());
  await page.waitForFunction(() => {
    const select = document.getElementById('newProfile');
    const button = document.getElementById('startDemo');
    const registry = window.__td613AshDemoRegistry?.snapshot?.() || null;
    return select?.value === 'investigation'
      && registry?.control_owner === 'ASH_DEMO_REGISTRY'
      && button?.isConnected
      && button?.dataset.ashDemoRegistryOwner === 'td613.ash.demo-registry/v0.3-a15'
      && button?.dataset.ashMethodDemoState === 'READY'
      && button.disabled === false
      && !button.matches(':disabled');
  }, null, { timeout:60_000 });
  const button = page.locator('#startDemo');
  await button.waitFor({ state:'attached', timeout:15_000 });
  await button.click({ timeout:15_000 });
}

async function enterInvestigation(page) {
  let lastDiagnostic = null;
  for (let attempt = 1; attempt <= ENTRY_ATTEMPT_CEILING; attempt += 1) {
    try {
      await page.goto(baseUrl + '/dome-world/ash-keep.html', { waitUntil:'domcontentloaded', timeout:90_000 });
      await waitForInstrument(page);
      await waitForRegistryOwner(page);
      const existing = await page.evaluate(() => ({
        case_id:window.__td613AshKeep?.current?.()?.case_id || null,
        pointer:localStorage.getItem('td613.ash-keep.current-case'),
        profile:document.documentElement.dataset.ashDemoProfile
          || document.documentElement.dataset.ashDemoRegistryProfile
          || null
      }));
      if (!existing.case_id || existing.pointer !== existing.case_id || existing.profile !== 'investigation') {
        await activateInvestigationDemo(page);
      }
      await waitForStableInvestigationEntry(page, attempt);
      return attempt;
    } catch (error) {
      lastDiagnostic = await entryDiagnostic(page, attempt, String(error?.message || error)).catch(() => ({
        attempt,
        error:String(error?.message || error),
        diagnostic_unavailable:true
      }));
      if (attempt < ENTRY_ATTEMPT_CEILING) await page.waitForTimeout(100);
    }
  }
  throw new Error(`A12 Investigation entry failed after ${ENTRY_ATTEMPT_CEILING} stable-case attempts: ${JSON.stringify(lastDiagnostic)}`);
}

async function ensureCommandSheetOpen(page) {
  const sheet = page.locator('#premiumCommandSheet');
  await sheet.waitFor({ state:'attached', timeout:30_000 });
  const alreadyOpen = await sheet.evaluate(dialog => dialog.open === true).catch(() => false);
  if (!alreadyOpen) {
    const menu = page.locator('#premiumMenuButton');
    await menu.waitFor({ state:'visible', timeout:30_000 });
    await menu.click();
  }
  await page.waitForSelector('#premiumCommandSheet[open]', { timeout:60_000 });
}

async function settleWorkspace(page, workspace) {
  await waitForRegistryOwner(page);
  await page.evaluate(async name => {
    const open = window.__td613AshPremiumUI?.open
      || window.__td613AshUiUxRescue?.open
      || window.__td613OpenAshWorkspace
      || window.__td613AshKeep?.openWorkspace;
    if (typeof open !== 'function') throw new Error('A15 governed workspace owner unavailable.');
    await Promise.resolve(open(name));
  }, workspace);
  await page.waitForFunction(name => {
    const registry = window.__td613AshDemoRegistry?.snapshot?.() || null;
    const panel = document.getElementById(`workspace-${name}`);
    const style = panel ? getComputedStyle(panel) : null;
    const rect = panel?.getBoundingClientRect();
    return registry?.control_owner === 'ASH_DEMO_REGISTRY'
      && document.documentElement.dataset.ashDemoControlOwner === 'ASH_DEMO_REGISTRY'
      && document.documentElement.dataset.ashPremiumWorkspace === name
      && panel?.classList.contains('active')
      && style?.display !== 'none'
      && style?.visibility !== 'hidden'
      && Number(style?.opacity) > 0
      && style?.pointerEvents !== 'none'
      && rect?.width > 0
      && rect?.height > 0;
  }, workspace, { timeout:120_000 });
}

async function inspectEntryPreflight(page, label) {
  const entryAttempt = await enterInvestigation(page);
  await ensureCommandSheetOpen(page);
  const entry = await entryDiagnostic(page, entryAttempt);
  if (!entry.current_case
    || entry.local_pointer !== entry.current_case
    || entry.entry_posture !== 'READY'
    || entry.entry_phase !== 'VISIBLE'
    || !entry.menu_connected
    || !entry.menu_visible
    || !entry.sheet_connected
    || !entry.sheet_open) {
    throw new Error(`A12 entry preflight did not remain stable: ${JSON.stringify(entry)}`);
  }
  await page.screenshot({ path:path.join(artifactDir, browserName + '-' + label + '.png'), fullPage:true });
  return { entry_attempt:entryAttempt, entry };
}

async function inspect(page, label) {
  const entryAttempt = await enterInvestigation(page);
  await waitForRegistryOwner(page);
  await ensureCommandSheetOpen(page);
  const commandText = await page.locator('#premiumCommandGrid').innerText();
  for (const phrase of ['Custody','Rooms','Routes','Rebuild Test','Draft & Hush','Save Points','Destination Handoff','Receipts','Cases & Profiles','Safe Harbor']) {
    if (!commandText.includes(phrase)) throw new Error('A12 missing ' + phrase);
  }
  const audit = await page.evaluate(() => window.__td613AshA12?.audit?.());
  if (!audit?.ready || audit.inert_controls !== 0 || audit.empty_drawers !== 0) throw new Error('A12 command audit failed: ' + JSON.stringify(audit));

  await page.locator('[data-a12-command="test"]').click();
  await settleWorkspace(page, 'choir');
  await ensureCommandSheetOpen(page);
  await page.locator('[data-a12-command="save"]').click();
  await settleWorkspace(page, 'capsule');

  const routeDelta = await page.locator('.ash-route-delta').innerText();
  if (!routeDelta.includes('Changed in explanation') || !routeDelta.includes('Preserved exactly')) throw new Error('A12 route delta remained empty.');
  const beforeSwitch = await page.evaluate(() => ({
    width:document.documentElement.scrollWidth,
    viewport:document.documentElement.clientWidth,
    fields:document.querySelectorAll('.ash-flowcore-field:not(.ash-flowcore-field--proxy):not([hidden])').length,
    url:location.pathname + location.search,
    title:document.title,
    audit:document.documentElement.dataset.ashA12CommandAudit,
    registry_owner:window.__td613AshDemoRegistry?.snapshot?.().control_owner || null,
    active_case:window.__td613AshKeep?.current?.()?.case_id || null
  }));
  if (beforeSwitch.width > beforeSwitch.viewport + 1) throw new Error('Horizontal overflow ' + beforeSwitch.width + '/' + beforeSwitch.viewport);
  if (beforeSwitch.fields !== 1) throw new Error('Expected one canonical field, observed ' + beforeSwitch.fields);
  if (beforeSwitch.url !== '/dome-world/ash-threshold.html' || beforeSwitch.title !== 'TD613 Ash') throw new Error('Canonical first paint drift: ' + JSON.stringify(beforeSwitch));
  if (beforeSwitch.registry_owner !== 'ASH_DEMO_REGISTRY') throw new Error('A15 registry ownership drift: ' + JSON.stringify(beforeSwitch));
  if (!beforeSwitch.active_case) throw new Error('A12 case-switcher witness began without an active case.');

  await ensureCommandSheetOpen(page);
  await page.locator('[data-a12-action="profile"]').click();
  await page.waitForFunction(() => document.body.dataset.ashCaseClosed === 'true'
    && !localStorage.getItem('td613.ash-keep.current-case')
    && !document.getElementById('launch')?.classList.contains('hidden'), null, { timeout:120_000 });
  await page.waitForFunction(() => document.activeElement?.id === 'newProfile'
    && document.documentElement.dataset.ashA12ProfileSelector === 'FOCUSED', null, { timeout:120_000 });

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
  return { entry_attempt:entryAttempt, before_switch:beforeSwitch, after_switch:afterSwitch };
}

const receipts = [];
try {
  if (entryPreflightOnly) {
    const desktop = await browser.newContext({ viewport:{ width:1280, height:900 } });
    receipts.push({ mode:'desktop-entry-preflight', ...(await inspectEntryPreflight(await desktop.newPage(), 'entry-preflight')) });
    await desktop.close();
    await fs.writeFile(path.join(artifactDir, browserName + '-a12-entry-preflight.json'), JSON.stringify({
      schema:'td613.ash.a12-entry-preflight/v0.1-stable-case-command-surface',
      browser:browserName,
      receipts,
      attempt_ceiling:ENTRY_ATTEMPT_CEILING,
      quiet_window_ms:ENTRY_QUIET_MS,
      current_case_pointer_concordance_required:true,
      convergence_ready_visible_required:true,
      command_surface_connected_required:true,
      authority_changed:false,
      source_bytes_moved:false,
      case_data_preserved:true,
      profile_inferred:false,
      human_closure_required:true
    }, null, 2));
  } else {
    const desktop = await browser.newContext({ viewport:{ width:1280, height:900 } });
    receipts.push({ mode:'desktop', ...(await inspect(await desktop.newPage(), 'desktop')) });
    await desktop.close();
    const mobileOptions = { viewport:{ width:390, height:844 }, reducedMotion:'reduce' };
    if (browserName !== 'firefox') Object.assign(mobileOptions, { isMobile:true, hasTouch:true });
    const mobile = await browser.newContext(mobileOptions);
    receipts.push({ mode:'mobile-reduced-motion', ...(await inspect(await mobile.newPage(), 'mobile-reduced-motion')) });
    await mobile.close();
    await fs.writeFile(path.join(artifactDir, browserName + '-a12-receipt.json'), JSON.stringify({
      schema:'td613.ash.a12-browser-witness/v1.0-a15-stable-entry',
      browser:browserName,
      receipts,
      attempt_ceiling:ENTRY_ATTEMPT_CEILING,
      quiet_window_ms:ENTRY_QUIET_MS,
      stable_case_pointer_concordance:true,
      convergence_ready_visible_required:true,
      command_surface_connected_required:true,
      authority_changed:false,
      source_bytes_moved:false,
      case_data_preserved:true,
      profile_inferred:false,
      human_closure_required:true
    }, null, 2));
  }
} catch (error) {
  const suffix = entryPreflightOnly ? 'a12-entry-preflight-failure' : 'a12-failure';
  await fs.writeFile(path.join(artifactDir, browserName + '-' + suffix + '.json'), JSON.stringify({ error:String(error?.stack || error) }, null, 2));
  throw error;
} finally {
  await browser.close();
}
