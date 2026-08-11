import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = process.env.TD613_BROWSER || 'chromium';
const baseUrl = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-a15';
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new Error(`Unsupported browser ${browserName}`);
await fs.mkdir(artifactDir, { recursive:true });

const PROFILES = ['investigation','political_campaign','fundraiser','research','legal','archive'];
const WORKSPACES = ['home','map','work','choir','capsule'];
const ROUTES = ['experimental','custodial','audit','implementation'];
const ROUTE_CONTROLS = Object.freeze({ experimental:'EXPERIENTIAL', custodial:'CUSTODIAL', audit:'AUDIT', implementation:'IMPLEMENTATION' });
const REGISTRY_VERSION = 'td613.ash.demo-registry/v0.3-a15';
const ASSET_EPOCH = '20260726-a15-empirical-v1';
const EMPIRICAL_VERSION = 'td613.ash.a15-empirical-profile-journeys/v0.1';
const HYDRATION_EVENT = 'td613:ash:demo-registry-hydrated';
const FORBIDDEN = ['td613.ash','case_map_digest','route_memory_digest','authority_context','lifecycle_rank','indexeddb','ash_demo_registry','source_packet_commit'];

async function waitForInstrument(page) {
  await page.goto(`${baseUrl}/dome-world/ash-keep.html`, { waitUntil:'domcontentloaded', timeout:90_000 });
  await page.waitForFunction(({ registry, epoch, empirical }) => {
    const snapshot = window.__td613AshDemoRegistry?.snapshot?.();
    return window.__td613AshKeep?.version
      && window.__td613AshPremiumUI?.version
      && window.__td613AshDemoRegistry?.version === registry
      && snapshot?.version === registry
      && snapshot?.asset_epoch === epoch
      && snapshot?.control_owner === 'ASH_DEMO_REGISTRY'
      && snapshot?.profiles?.length === 6
      && snapshot.profiles.filter(entry => entry.promoted).length === 6
      && window.__td613AshA15EmpiricalJourneys?.version === empirical
      && document.getElementById('ashA15EmpiricalJourney')?.closest('#ashAiaMembrane')
      && document.querySelectorAll('#ashAiaMembrane [data-aia-route]').length === 4
      && document.querySelectorAll('#ashAiaMembrane [data-aia-task]').length === 4
      && document.title === 'TD613 Ash'
      && location.pathname === '/dome-world/ash-threshold.html'
      && !location.search;
  }, { registry:REGISTRY_VERSION, epoch:ASSET_EPOCH, empirical:EMPIRICAL_VERSION }, { timeout:120_000 });
}

async function armHydrationReceiptCapture(page, profile) {
  await page.evaluate(({ expected, eventName }) => {
    window.__td613A15HydrationWitness?.cleanup?.();
    const state = { expected, event_name:eventName, receipt:null, observed:false, cleanup:null };
    const handler = event => {
      if (event.detail?.profile !== expected) return;
      state.receipt = structuredClone(event.detail);
      state.observed = true;
      window.removeEventListener(eventName, handler);
    };
    state.cleanup = () => window.removeEventListener(eventName, handler);
    window.__td613A15HydrationWitness = state;
    window.addEventListener(eventName, handler);
  }, { expected:profile, eventName:HYDRATION_EVENT });
}

async function readHydrationReceiptCapture(page) {
  return page.evaluate(() => {
    const state = window.__td613A15HydrationWitness || null;
    const result = state ? {
      expected:state.expected,
      event_name:state.event_name,
      observed:state.observed,
      receipt:state.receipt
    } : null;
    state?.cleanup?.();
    delete window.__td613A15HydrationWitness;
    return result;
  });
}

async function hydrationRuntimeState(page) {
  return page.evaluate(() => ({
    case_id:window.__td613AshKeep?.current?.()?.case_id || null,
    profile:document.documentElement.dataset.ashDemoProfile || null,
    workspace:document.documentElement.dataset.ashPremiumWorkspace || null,
    route:String(window.__td613AshLiveAIA?.current?.()?.route || ''),
    status:document.getElementById('demoProfileStatus')?.textContent || '',
    entries_bound:Object.keys(window.__td613AshA15EmpiricalJourneys?.entries?.() || {}).length
  }));
}

async function activateProfile(page, profile) {
  await armHydrationReceiptCapture(page, profile);
  let capture = null;
  try {
    await page.evaluate(selected => {
      const registry = window.__td613AshDemoRegistry;
      const select = document.getElementById('newProfile');
      const button = document.getElementById('startDemo');
      if (!registry || !select || !button) throw new Error('A15 registry-owned profile gesture unavailable.');
      select.value = selected;
      select.dispatchEvent(new Event('change', { bubbles:true }));
      registry.reconcile();
      const entry = registry.snapshot().profiles.find(item => item.profile === selected);
      const ready = entry?.promoted
        && button.dataset.ashDemoRegistryOwner === registry.version
        && button.dataset.ashMethodDemoState === 'READY'
        && button.disabled === false
        && !button.matches(':disabled');
      if (!ready) throw new Error(`A15 ${selected} profile gesture held before activation.`);
      button.click();
    }, profile);
    await page.waitForFunction(selected => {
      const witness = window.__td613A15HydrationWitness || null;
      const status = document.getElementById('demoProfileStatus')?.textContent || '';
      return (witness?.observed === true
          && witness.receipt?.profile === selected
          && witness.receipt?.status === 'HYDRATED')
        || /Demo registry held\./i.test(status);
    }, profile, { timeout:120_000 });
    capture = await readHydrationReceiptCapture(page);
    const state = await hydrationRuntimeState(page);
    const hydrated = capture?.observed === true
      && capture.receipt?.profile === profile
      && capture.receipt?.status === 'HYDRATED';
    if (/Demo registry held\./i.test(state.status)
        || !hydrated
        || !state.case_id
        || state.profile !== profile
        || state.entries_bound !== 6) {
      throw new Error(`A15 ${profile} hydration held: ${JSON.stringify({ state, capture })}`);
    }
    return Object.freeze({
      profile:capture.receipt.profile,
      status:capture.receipt.status,
      owner:capture.receipt.owner || null,
      automatic_ash_action:Boolean(capture.receipt.automatic_ash_action),
      event_name:HYDRATION_EVENT
    });
  } catch (error) {
    if (!capture) capture = await readHydrationReceiptCapture(page).catch(() => null);
    const state = await hydrationRuntimeState(page).catch(() => null);
    error.td613HydrationDiagnostic = {
      expected_profile:profile,
      completion_event:HYDRATION_EVENT,
      capture,
      state
    };
    throw error;
  }
}

async function armNavigationReceiptCapture(page, workspace) {
  await page.evaluate(expected => {
    window.__td613A15NavigationWitness?.cleanup?.();
    const state = { expected, receipt:null, observed:false, cleanup:null };
    const handler = event => {
      if (event.detail?.destination_workspace !== expected) return;
      state.receipt = event.detail;
      state.observed = true;
      window.removeEventListener('td613:ash:navigation-receipt', handler);
    };
    state.cleanup = () => window.removeEventListener('td613:ash:navigation-receipt', handler);
    window.__td613A15NavigationWitness = state;
    window.addEventListener('td613:ash:navigation-receipt', handler);
  }, workspace);
}

async function readNavigationReceiptCapture(page) {
  return page.evaluate(() => {
    const state = window.__td613A15NavigationWitness || null;
    const result = state ? { expected:state.expected, observed:state.observed, receipt:state.receipt } : null;
    state?.cleanup?.();
    delete window.__td613A15NavigationWitness;
    return result;
  });
}

async function workspaceDiagnostic(page, expected, witness) {
  return page.evaluate(({ expected, witness }) => {
    const active = [...document.querySelectorAll('.workspace.active')].map(section => section.id);
    const dock = [...document.querySelectorAll('#premiumPrimaryDock [data-premium-workspace]')].map(control => {
      const style = getComputedStyle(control);
      const rect = control.getBoundingClientRect();
      return {
        workspace:control.dataset.premiumWorkspace,
        pressed:control.getAttribute('aria-pressed'),
        visible:style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0,
        disabled:Boolean(control.disabled)
      };
    });
    return {
      expected,
      witness,
      dataset_workspace:document.documentElement.dataset.ashPremiumWorkspace || null,
      active,
      dock,
      command_sheet_open:document.getElementById('premiumCommandSheet')?.open === true,
      current_receipt:window.__td613AshWholeInstrument?.current?.()?.navigation_receipt || null,
      capture:window.__td613A15NavigationWitness ? {
        expected:window.__td613A15NavigationWitness.expected,
        observed:window.__td613A15NavigationWitness.observed,
        receipt:window.__td613A15NavigationWitness.receipt
      } : null
    };
  }, { expected, witness });
}

async function openWorkspace(page, workspace, witness) {
  const selector = `#premiumPrimaryDock [data-premium-workspace="${workspace}"]:visible`;
  const control = page.locator(selector).first();
  if (!(await control.count())) throw new Error(`A15 canonical dock ${workspace} control unavailable for ${JSON.stringify(witness)}.`);
  const before = await page.evaluate(() => ({ workspace:document.documentElement.dataset.ashPremiumWorkspace || null, receipt:window.__td613AshWholeInstrument?.current?.()?.navigation_receipt || null }));
  const changed = before.workspace !== workspace;
  if (changed) await armNavigationReceiptCapture(page, workspace);
  await control.scrollIntoViewIfNeeded();
  await control.click();
  try {
    await page.waitForFunction(expected => {
      const section = document.getElementById(`workspace-${expected}`);
      const style = section ? getComputedStyle(section) : null;
      const rect = section?.getBoundingClientRect();
      return document.documentElement.dataset.ashPremiumWorkspace === expected
        && section?.classList.contains('active') === true
        && style?.display !== 'none'
        && style?.visibility !== 'hidden'
        && Number(style?.opacity) > 0
        && style?.pointerEvents !== 'none'
        && rect?.width > 0
        && rect?.height > 0;
    }, workspace, { timeout:60_000 });
  } catch (error) {
    const diagnostic = await workspaceDiagnostic(page, workspace, witness);
    throw new Error(`A15 canonical dock failed to settle ${workspace}: ${JSON.stringify({ before, diagnostic })}`, { cause:error });
  }
  if (changed) {
    try {
      await page.waitForFunction(expected => window.__td613A15NavigationWitness?.receipt?.destination_workspace === expected, workspace, { timeout:60_000 });
    } catch (error) {
      const diagnostic = await workspaceDiagnostic(page, workspace, witness);
      throw new Error(`A15 canonical dock emitted no ${workspace} receipt: ${JSON.stringify({ before, diagnostic })}`, { cause:error });
    }
  }
  const captured = changed ? await readNavigationReceiptCapture(page) : null;
  const after = await page.evaluate(() => ({ workspace:document.documentElement.dataset.ashPremiumWorkspace || null, current_receipt:window.__td613AshWholeInstrument?.current?.()?.navigation_receipt || null }));
  if (after.workspace !== workspace) throw new Error(`A15 ${workspace} visible workspace did not settle: ${JSON.stringify({ witness, before, captured, after })}`);
  if (changed && (!captured?.observed || captured.receipt?.destination_workspace !== workspace || captured.receipt?.result !== 'ARRIVED')) throw new Error(`A15 ${workspace} click emitted no canonical arrival receipt: ${JSON.stringify({ witness, before, captured, after })}`);
  return Object.freeze({ changed, receipt_captured_at_click:changed ? captured.observed : false, before, captured, after });
}

async function selectRoute(page, route) {
  const controlValue = ROUTE_CONTROLS[route];
  const control = page.locator(`#ashAiaMembrane [data-aia-route="${controlValue}"]:visible`).first();
  if (!(await control.count())) throw new Error(`A15 visible ${route} route control unavailable.`);
  await control.click();
  await page.waitForFunction(({ route, controlValue }) => {
    const current = String(window.__td613AshLiveAIA?.current?.()?.route || '').toUpperCase();
    return (current === controlValue || current === route.toUpperCase()) && document.querySelector('[data-a15-route]')?.textContent?.trim() === route;
  }, { route, controlValue }, { timeout:60_000 });
}

async function waitForVisibleCombination(page, workspace, route) {
  const controlValue = ROUTE_CONTROLS[route];
  await page.waitForFunction(({ workspace, route, controlValue }) => {
    const currentRoute = String(window.__td613AshLiveAIA?.current?.()?.route || '').toUpperCase();
    return document.documentElement.dataset.ashPremiumWorkspace === workspace
      && document.getElementById(`workspace-${workspace}`)?.classList.contains('active') === true
      && (currentRoute === controlValue || currentRoute === route.toUpperCase())
      && document.querySelector('[data-a15-workspace]')?.textContent?.trim() === workspace
      && document.querySelector('[data-a15-route]')?.textContent?.trim() === route;
  }, { workspace, route, controlValue }, { timeout:60_000 });
}

async function orientVisibleAction(page, profile, workspace, route) {
  return page.evaluate(({ profile, workspace, route }) => new Promise((resolve, reject) => {
    const button = document.getElementById('ashA15OrientAction');
    if (!button?.isConnected) return reject(new Error('A15 visible orientation gesture unavailable.'));
    const timer = setTimeout(() => reject(new Error(`A15 visible world answer timed out for ${profile}/${workspace}/${route}.`)), 30_000);
    const handler = event => {
      clearTimeout(timer);
      resolve({ answer:event.detail, visible_text:document.getElementById('ashA15WorldAnswer')?.textContent || '', profile_chip:document.querySelector('[data-a15-profile]')?.textContent?.trim() || '', workspace_chip:document.querySelector('[data-a15-workspace]')?.textContent?.trim() || '', route_chip:document.querySelector('[data-a15-route]')?.textContent?.trim() || '' });
    };
    window.addEventListener('td613:ash:a15-world-answer', handler, { once:true });
    button.click();
  }), { profile, workspace, route });
}

async function inspectCommands(page) {
  const menu = page.locator('#premiumMenuButton');
  await menu.click();
  await page.waitForFunction(() => document.getElementById('premiumCommandSheet')?.open === true);
  const commands = await page.evaluate(() => ({
    semantic:[...document.querySelectorAll('#premiumCommandGrid [data-a12-command]')].map(control => ({ id:control.dataset.a12Command, workspace:control.dataset.a12Workspace })),
    profile_action:Boolean(document.querySelector('#premiumCommandGrid [data-a12-action="profile"]')),
    destination_handoff:document.querySelector('#premiumCommandGrid a[href="/dome-world/ash-destination-handoff.html"]')?.tagName === 'A',
    inert:[...document.querySelectorAll('#premiumCommandGrid button')].filter(control => !control.dataset.a12Command && !control.dataset.a12Action).length
  }));
  await page.keyboard.press('Escape');
  const mapping = new Map(commands.semantic.map(item => [item.id, item.workspace]));
  for (const [id, workspace] of [['custody','map'],['rooms','map'],['routes','map'],['draft','work'],['test','choir'],['save','capsule']]) if (mapping.get(id) !== workspace) throw new Error(`A15 command ${id} did not map to ${workspace}.`);
  if (!commands.profile_action || !commands.destination_handoff || commands.inert !== 0) throw new Error(`A15 command surface drifted: ${JSON.stringify(commands)}`);
  return commands;
}

async function inspectProfile(options, profile, mode) {
  console.log(JSON.stringify({ event:'A15_PROFILE_BEGIN', browser:browserName, mode, profile }));
  const browser = await browserType.launch({ headless:true });
  const context = await browser.newContext(options);
  const page = await context.newPage();
  let hydrationReceipt = null;
  let witness = { browser:browserName, mode, profile, workspace:null, route:null, hydration_status:null };
  try {
    await waitForInstrument(page);
    hydrationReceipt = await activateProfile(page, profile);
    witness = { ...witness, hydration_status:hydrationReceipt.status };
    const entry = await page.evaluate(async selected => {
      const item = (await window.__td613AshDemoRegistry.entries())[selected];
      return { manifest_profile:item?.pedagogy_manifest?.profile || null, manifest_claim_ceiling:item?.pedagogy_manifest?.claim_ceiling || null, deterministic_test_journey:item?.deterministic_test_journey || null };
    }, profile);
    if (entry.manifest_profile !== profile || entry.deterministic_test_journey !== `ash-a15-empirical-journey:${profile}`) throw new Error(`A15 ${profile} provider entry drifted: ${JSON.stringify(entry)}`);

    const answers = [];
    let workspaceTransitions = 0;
    let capturedNavigationReceipts = 0;
    for (const workspace of WORKSPACES) {
      for (const route of ROUTES) {
        witness = { browser:browserName, mode, profile, workspace, route, hydration_status:hydrationReceipt.status };
        await selectRoute(page, route);
        const navigation = await openWorkspace(page, workspace, witness);
        if (navigation.changed) workspaceTransitions += 1;
        if (navigation.receipt_captured_at_click) capturedNavigationReceipts += 1;
        await waitForVisibleCombination(page, workspace, route);
        const observed = await orientVisibleAction(page, profile, workspace, route);
        const answer = observed.answer;
        if (answer.status !== 'READY') throw new Error(`A15 ${profile}/${workspace}/${route} held: ${JSON.stringify(answer)}`);
        if (answer.profile !== profile || answer.workspace !== workspace || answer.route !== route) throw new Error(`A15 visible journey normalized incorrectly for expected ${profile}/${workspace}/${route}: ${JSON.stringify(observed)}`);
        if (observed.visible_text !== answer.message || observed.workspace_chip !== workspace || observed.route_chip !== route || observed.profile_chip !== profile.replaceAll('_', ' ')) throw new Error(`A15 visible chips or answer drifted for expected ${profile}/${workspace}/${route}: ${JSON.stringify(observed)}`);
        if (answer.context_imported || answer.real_world_claim || answer.ontology_exposed) throw new Error('A15 answer widened its evidence surface.');
        if (Object.entries(answer.authority).some(([key, value]) => key.startsWith('human_') ? value !== true : value !== false)) throw new Error('A15 answer widened authority.');
        if (forbiddenPublicLeak(answer)) throw new Error(`A15 public answer leaked internal ontology: ${JSON.stringify(answer)}`);
        answers.push(answer);
      }
    }

    const sensitive = await page.evaluate(selected => window.__td613AshA15EmpiricalJourneys.compile({ profile:selected, workspace:'work', route:'audit', context:{ api_key:'do-not-import', contact:'+44 20 7946 0958' } }), profile);
    if (sensitive.status !== 'HELD_SENSITIVE_CONTEXT' || sensitive.context_imported !== false) throw new Error('A15 sensitive-context quarantine drifted.');
    const commands = await inspectCommands(page);
    const snapshot = await page.evaluate(() => window.__td613AshDemoRegistry.snapshot());
    const presentation = await page.evaluate(() => ({ route_nodes:document.querySelectorAll('#ashAiaMembrane [data-aia-route]').length, task_nodes:document.querySelectorAll('#ashAiaMembrane [data-aia-task]').length, panel_in_membrane:Boolean(document.getElementById('ashA15EmpiricalJourney')?.closest('#ashAiaMembrane')), release_disabled:document.getElementById('approveRelease')?.disabled ?? null, provider_approval_checked:document.getElementById('providerApproval')?.checked ?? null, handoff_is_link:document.querySelector('a[href="/dome-world/ash-destination-handoff.html"]')?.tagName === 'A', url:location.pathname + location.search, title:document.title, overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth }));
    const result = { profile, hydration_receipt:hydrationReceipt, answers, workspace_transitions:workspaceTransitions, captured_navigation_receipts:capturedNavigationReceipts, unique_messages:new Set(answers.map(answer => answer.message)).size, sensitive_status:sensitive.status, manifest_profile:entry.manifest_profile, manifest_claim_ceiling:entry.manifest_claim_ceiling, registry_version:snapshot.version, registry_epoch:snapshot.asset_epoch, empirical_version:snapshot.empirical_journey_version, matrix_cells:snapshot.empirical_matrix_cells, commands, ...presentation };

    if (result.answers.length !== 20 || result.unique_messages !== 20) throw new Error(`A15 ${profile} matrix collapsed: ${JSON.stringify(result)}`);
    if (result.workspace_transitions < 4 || result.captured_navigation_receipts !== result.workspace_transitions) throw new Error(`A15 ${profile} state-derived transition receipts drifted: ${JSON.stringify(result)}`);
    if (result.matrix_cells !== 120 || result.route_nodes !== 4 || result.task_nodes !== 4 || !result.panel_in_membrane) throw new Error(`A15 ${profile} membrane contract drifted: ${JSON.stringify(result)}`);
    if (result.release_disabled !== true || result.provider_approval_checked !== false || !result.handoff_is_link) throw new Error(`A15 ${profile} widened consequential authority: ${JSON.stringify(result)}`);
    if (result.url !== '/dome-world/ash-threshold.html' || result.title !== 'TD613 Ash' || result.overflow > 1) throw new Error(`A15 ${profile} presentation drift: ${JSON.stringify(result)}`);
    if (profile === 'archive') await page.screenshot({ path:path.join(artifactDir, `${browserName}-${mode}-archive.png`), fullPage:true });
    console.log(JSON.stringify({ event:'A15_PROFILE_PASS', browser:browserName, mode, profile, hydration_status:hydrationReceipt.status, observations:answers.length }));
    return result;
  } catch (error) {
    const screenshot = path.join(artifactDir, `${browserName}-${mode}-${profile}-held.png`);
    try { await page.screenshot({ path:screenshot, fullPage:true }); } catch {}
    error.td613Diagnostic = {
      witness,
      hydration_receipt:hydrationReceipt,
      hydration_activation:error.td613HydrationDiagnostic || null,
      screenshot,
      browser_process_isolated_for_profile:true
    };
    error.message = `A15 witness ${JSON.stringify(witness)}: ${error.message}`;
    throw error;
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

function forbiddenPublicLeak(answer) {
  const publicPayload = { ...answer };
  delete publicPayload.schema;
  delete publicPayload.version;
  const text = JSON.stringify(publicPayload).toLowerCase();
  return FORBIDDEN.some(token => text.includes(token));
}

async function writeCheckpoint(receipts, current) {
  await fs.writeFile(path.join(artifactDir, `${browserName}-a15-empirical-checkpoint.json`), JSON.stringify({
    schema:'td613.ash.a15-empirical-profile-journey-checkpoint/v0.1',
    browser:browserName,
    completed_profile_worlds:receipts.length,
    current,
    completed:receipts.map(receipt => ({ mode:receipt.mode, profile:receipt.profile, hydration_status:receipt.hydration_receipt?.status || null, observations:receipt.answers?.length || 0 })),
    profile_hydration_completion_boundary:HYDRATION_EVENT,
    profile_hydration_receipt_required:true,
    browser_process_isolation_per_profile:true,
    promotion_authority:false,
    human_closure_required:true
  }, null, 2));
}

const receipts = [];
let currentWitness = null;
try {
  const modes = [
    ['desktop', { viewport:{ width:1280, height:900 } }],
    ['mobile-reduced-motion', browserName === 'firefox' ? { viewport:{ width:390, height:844 }, reducedMotion:'reduce' } : { viewport:{ width:390, height:844 }, reducedMotion:'reduce', isMobile:true, hasTouch:true }]
  ];
  for (const [mode, options] of modes) {
    for (const profile of PROFILES) {
      currentWitness = { browser:browserName, mode, profile };
      const receipt = { mode, ...(await inspectProfile(options, profile, mode)) };
      receipts.push(receipt);
      await writeCheckpoint(receipts, { ...currentWitness, status:'PASS' });
    }
  }
  const answerSignatures = new Map();
  for (const receipt of receipts.filter(item => item.mode === 'desktop')) receipt.answers.forEach(answer => { const key = `${answer.workspace}:${answer.route}`; const values = answerSignatures.get(key) || []; values.push(answer.message); answerSignatures.set(key, values); });
  for (const [key, values] of answerSignatures) if (new Set(values).size !== 6) throw new Error(`A15 cross-profile answer collapse at ${key}.`);
  await fs.writeFile(path.join(artifactDir, `${browserName}-a15-empirical-receipt.json`), JSON.stringify({
    schema:'td613.ash.a15-empirical-profile-journey-browser-witness/v0.7-hydration-receipted-profile-isolation',
    browser:browserName,
    modes:['desktop','mobile-reduced-motion'],
    profiles:PROFILES,
    workspaces:WORKSPACES,
    routes:ROUTES,
    receipts,
    matrix_cells:120,
    rendered_answer_observations:receipts.length * 20,
    canonical_primary_dock_navigation:true,
    exact_failure_witness_context:true,
    state_derived_transition_receipts:true,
    minimum_workspace_transitions_per_profile:4,
    route_landing_workspace:'work',
    real_profile_hydration:true,
    profile_hydration_completion_boundary:HYDRATION_EVENT,
    profile_hydration_receipt_required:true,
    browser_process_isolation_per_profile:true,
    incremental_profile_checkpoints:true,
    real_workspace_navigation:true,
    navigation_receipt_captured_at_click:true,
    idempotent_active_workspace_gesture:true,
    real_route_gestures:true,
    route_selected_before_target_workspace:true,
    real_visible_orientation_gesture:true,
    command_menu_mappings_verified:true,
    cross_profile_differentiation:true,
    sensitive_context_status:'HELD_SENSITIVE_CONTEXT',
    ontology_leakage:false,
    false_real_world_claims:false,
    graph_wide_mass_eviction_executed:false,
    custody_authority_changed:false,
    source_bytes_moved:false,
    raw_content_transport:false,
    release_authority:false,
    human_closure_required:true
  }, null, 2));
} catch (error) {
  await fs.writeFile(path.join(artifactDir, `${browserName}-a15-empirical-failure.json`), JSON.stringify({
    error:String(error?.stack || error),
    diagnostic:error.td613Diagnostic || error.td613HydrationDiagnostic || null,
    current_witness:currentWitness,
    completed_profile_worlds:receipts.length,
    profile_hydration_completion_boundary:HYDRATION_EVENT,
    profile_hydration_receipt_required:true,
    browser_process_isolation_per_profile:true
  }, null, 2));
  throw error;
}
