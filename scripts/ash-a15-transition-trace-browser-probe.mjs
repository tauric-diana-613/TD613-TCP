import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = String(process.env.TD613_BROWSER || 'chromium').toLowerCase();
const baseUrl = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/+$/, '');
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-a15-transition-trace';
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new TypeError(`Unsupported TD613_BROWSER: ${browserName}`);
await fs.mkdir(artifactDir, { recursive:true });

const ROUTES = Object.freeze({
  experimental:'EXPERIENTIAL',
  custodial:'CUSTODIAL',
  audit:'AUDIT',
  implementation:'IMPLEMENTATION'
});
const PROFILES = Object.freeze(['investigation', 'research']);
const OBSERVATION_HORIZON_MS = 750;
const REGISTRY_VERSION = 'td613.ash.demo-registry/v0.3-a15';
const ASSET_EPOCH = '20260726-a15-empirical-v1';
const EMPIRICAL_VERSION = 'td613.ash.a15-empirical-profile-journeys/v0.1';
const HYDRATION_EVENT = 'td613:ash:demo-registry-hydrated';

const modes = Object.freeze([
  ['desktop', { viewport:{ width:1280, height:900 } }],
  ['mobile-reduced-motion', browserName === 'firefox'
    ? { viewport:{ width:390, height:844 }, reducedMotion:'reduce' }
    : { viewport:{ width:390, height:844 }, reducedMotion:'reduce', isMobile:true, hasTouch:true }]
]);

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
      && window.__td613AshA15EmpiricalJourneys?.version === empirical
      && document.getElementById('ashA15EmpiricalJourney')?.closest('#ashAiaMembrane')
      && document.querySelectorAll('#ashAiaMembrane [data-aia-route]').length === 4
      && document.title === 'TD613 Ash'
      && location.pathname === '/dome-world/ash-threshold.html'
      && !location.search;
  }, { registry:REGISTRY_VERSION, epoch:ASSET_EPOCH, empirical:EMPIRICAL_VERSION }, { timeout:120_000 });
}

async function activateProfile(page, profile) {
  await page.evaluate(selected => {
    window.__td613A15HydrationWitness?.cleanup?.();
    const witness = { selected, observed:false, detail:null, cleanup:null };
    const handler = event => {
      if (event.detail?.profile !== selected) return;
      witness.observed = true;
      witness.detail = structuredClone(event.detail);
      window.removeEventListener('td613:ash:demo-registry-hydrated', handler);
    };
    witness.cleanup = () => window.removeEventListener('td613:ash:demo-registry-hydrated', handler);
    window.__td613A15HydrationWitness = witness;
    window.addEventListener('td613:ash:demo-registry-hydrated', handler);

    const registry = window.__td613AshDemoRegistry;
    const select = document.getElementById('newProfile');
    const button = document.getElementById('startDemo');
    if (!registry || !select || !button) throw new Error('A15 registry-owned profile gesture unavailable.');
    select.value = selected;
    select.dispatchEvent(new Event('change', { bubbles:true }));
    registry.reconcile();
    const entry = registry.snapshot().profiles.find(item => item.profile === selected);
    if (!entry?.promoted || button.dataset.ashMethodDemoState !== 'READY' || button.disabled) {
      throw new Error(`A15 ${selected} profile gesture held before activation.`);
    }
    button.click();
  }, profile);

  await page.waitForFunction(selected => {
    const witness = window.__td613A15HydrationWitness;
    return witness?.observed === true
      && witness?.detail?.profile === selected
      && witness?.detail?.status === 'HYDRATED';
  }, profile, { timeout:120_000 });

  const hydrationReceipt = await page.evaluate(() => {
    const witness = window.__td613A15HydrationWitness;
    const receipt = witness?.detail ? structuredClone(witness.detail) : null;
    witness?.cleanup?.();
    delete window.__td613A15HydrationWitness;
    return receipt;
  });

  await page.waitForFunction(selected => {
    const current = window.__td613AshKeep?.current?.() || null;
    return Boolean(current?.case_id) && document.documentElement.dataset.ashDemoProfile === selected;
  }, profile, { timeout:120_000 });
  return hydrationReceipt;
}

async function readRuntimeState(page) {
  return page.evaluate(() => ({
    route:String(window.__td613AshLiveAIA?.current?.()?.route || ''),
    workspace:document.documentElement.dataset.ashPremiumWorkspace || null,
    route_chip:document.querySelector('[data-a15-route]')?.textContent?.trim() || null,
    workspace_chip:document.querySelector('[data-a15-workspace]')?.textContent?.trim() || null,
    navigation_receipt:window.__td613AshWholeInstrument?.current?.()?.navigation_receipt || null,
    profile:document.documentElement.dataset.ashDemoProfile || null,
    lifecycle:String(window.__td613AshLiveAIA?.current?.()?.lifecycle_state || document.body?.dataset?.ashLifecycle || '')
  }));
}

async function armTrace(page, context) {
  await page.evaluate(({ context, horizon }) => {
    window.__td613A15TransitionTrace?.stop?.();
    let sequence = 0;
    const records = [];
    const read = () => ({
      route:String(window.__td613AshLiveAIA?.current?.()?.route || ''),
      workspace:document.documentElement.dataset.ashPremiumWorkspace || null,
      route_chip:document.querySelector('[data-a15-route]')?.textContent?.trim() || null,
      workspace_chip:document.querySelector('[data-a15-workspace]')?.textContent?.trim() || null
    });
    const push = (kind, detail = null) => {
      records.push(Object.freeze({
        sequence:++sequence,
        kind,
        performance_ms:Number(performance.now().toFixed(3)),
        ...read(),
        detail
      }));
    };
    const listeners = [];
    const listen = type => {
      const handler = event => push(type, event.detail ? structuredClone(event.detail) : null);
      window.addEventListener(type, handler);
      listeners.push([type, handler]);
    };
    for (const type of [
      'td613:ash:navigation-receipt',
      'td613:ash:ux-workspace-opened',
      'td613:ash:whole-instrument-refreshed',
      'td613:ash:demo-pedagogy-routebar-ready'
    ]) listen(type);

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type !== 'attributes') continue;
        push('ROOT_ATTRIBUTE_MUTATION', {
          attribute:mutation.attributeName,
          old_value:mutation.oldValue,
          new_value:document.documentElement.getAttribute(mutation.attributeName)
        });
      }
    });
    observer.observe(document.documentElement, {
      attributes:true,
      attributeOldValue:true,
      attributeFilter:[
        'data-ash-premium-workspace',
        'data-ash-aia-human-route',
        'data-ash-route-delta'
      ]
    });

    const api = {
      context:Object.freeze(structuredClone(context)),
      horizon_ms:horizon,
      mark:(kind, detail = null) => push(kind, detail),
      snapshot:() => structuredClone(records),
      stop:() => {
        observer.disconnect();
        for (const [type, handler] of listeners) window.removeEventListener(type, handler);
        push('TRACE_STOP');
        return structuredClone(records);
      }
    };
    window.__td613A15TransitionTrace = api;
    push('TRACE_ARMED');
  }, { context, horizon:OBSERVATION_HORIZON_MS });
}

function classify(records, expectedRoute) {
  const routeVisible = records.find(record =>
    ['ROUTE_VISIBLE', 'POST_ROUTE_HORIZON'].includes(record.kind)
    && [expectedRoute, expectedRoute.toUpperCase()].includes(String(record.route_chip || ''))
  ) || records.find(record => record.kind === 'ROUTE_VISIBLE');
  const beforeRoute = records.find(record => record.kind === 'BEFORE_ROUTE') || null;
  const initialWorkspace = beforeRoute?.workspace || null;
  const workspaceMutations = records.filter(record =>
    record.kind === 'ROOT_ATTRIBUTE_MUTATION'
    && record.detail?.attribute === 'data-ash-premium-workspace'
    && record.detail?.new_value !== record.detail?.old_value
  );
  const firstWorkspaceMutation = workspaceMutations[0] || null;
  const postHorizon = [...records].reverse().find(record => record.kind === 'POST_ROUTE_HORIZON') || null;
  const navigationReceipts = records.filter(record => record.kind === 'td613:ash:navigation-receipt');

  let classification = 'ROUTE_ONLY_WITHIN_BOUNDED_HORIZON';
  if (firstWorkspaceMutation) {
    classification = routeVisible && firstWorkspaceMutation.sequence > routeVisible.sequence
      ? 'LATE_WORKSPACE_SIDE_EFFECT_WITHIN_BOUNDED_HORIZON'
      : 'COUPLED_WORKSPACE_SIDE_EFFECT_WITHIN_BOUNDED_HORIZON';
  }
  if (navigationReceipts.length > 0) classification += '+NAVIGATION_RECEIPT';

  return Object.freeze({
    classification,
    initial_workspace:initialWorkspace,
    initial_route:beforeRoute?.route || null,
    route_visible_sequence:routeVisible?.sequence || null,
    first_workspace_mutation_sequence:firstWorkspaceMutation?.sequence || null,
    first_workspace_mutation:firstWorkspaceMutation?.detail || null,
    workspace_changed_from_observed_baseline:Boolean(firstWorkspaceMutation),
    navigation_receipt_count:navigationReceipts.length,
    post_horizon_workspace:postHorizon?.workspace || null,
    post_horizon_route:postHorizon?.route || null,
    observation_horizon_ms:OBSERVATION_HORIZON_MS,
    quiescence_claim:false,
    universal_settlement_claim:false
  });
}

async function inspectCell(browser, mode, options, profile, route, controlValue) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const diagnosticShot = path.join(artifactDir, `${browserName}-${mode}-${profile}-${route}-held.png`);
  try {
    await waitForInstrument(page);
    const hydrationReceipt = await activateProfile(page, profile);
    const observedBaseline = await readRuntimeState(page);
    await armTrace(page, {
      browser:browserName,
      mode,
      profile,
      route,
      control_value:controlValue,
      profile_hydration_boundary:HYDRATION_EVENT,
      hydration_receipt:hydrationReceipt,
      observed_pre_route_workspace:observedBaseline.workspace,
      workspace_normalization_applied:false
    });
    await page.evaluate(state => window.__td613A15TransitionTrace.mark('BEFORE_ROUTE', state), observedBaseline);

    const control = page.locator(`#ashAiaMembrane [data-aia-route="${controlValue}"]:visible`).first();
    if (!(await control.count())) throw new Error(`A15 visible ${route} route control unavailable.`);
    await control.click();
    await page.waitForFunction(({ route, controlValue }) => {
      const current = String(window.__td613AshLiveAIA?.current?.()?.route || '').toUpperCase();
      return (current === controlValue || current === route.toUpperCase())
        && document.querySelector('[data-a15-route]')?.textContent?.trim() === route;
    }, { route, controlValue }, { timeout:60_000 });
    await page.evaluate(() => window.__td613A15TransitionTrace.mark('ROUTE_VISIBLE'));

    // Declared observation horizon only. It is neither a synchronization barrier nor a quiescence theorem.
    await page.waitForTimeout(OBSERVATION_HORIZON_MS);
    await page.evaluate(() => window.__td613A15TransitionTrace.mark('POST_ROUTE_HORIZON'));
    const records = await page.evaluate(() => window.__td613A15TransitionTrace.stop());
    return Object.freeze({
      browser:browserName,
      mode,
      profile,
      route,
      control_value:controlValue,
      status:'OBSERVED',
      hydration_receipt:hydrationReceipt,
      observed_baseline:observedBaseline,
      classification:classify(records, route),
      records
    });
  } catch (error) {
    let traceRecords = [];
    let runtimeState = null;
    try { traceRecords = await page.evaluate(() => window.__td613A15TransitionTrace?.snapshot?.() || []); } catch {}
    try { runtimeState = await readRuntimeState(page); } catch {}
    try { await page.screenshot({ path:diagnosticShot, fullPage:true }); } catch {}
    error.td613Diagnostic = {
      runtime_state: runtimeState,
      trace_records: traceRecords,
      screenshot: diagnosticShot,
      profile_hydration_boundary:HYDRATION_EVENT,
      workspace_normalization_applied:false
    };
    throw error;
  } finally {
    await context.close();
  }
}

const browser = await browserType.launch({ headless:true });
const cells = [];
const failures = [];
try {
  for (const [mode, options] of modes) {
    for (const profile of PROFILES) {
      for (const [route, controlValue] of Object.entries(ROUTES)) {
        try {
          cells.push(await inspectCell(browser, mode, options, profile, route, controlValue));
        } catch (error) {
          failures.push({
            browser:browserName,
            mode,
            profile,
            route,
            error:String(error?.stack || error),
            diagnostic:error.td613Diagnostic || null
          });
        }
      }
    }
  }
} finally {
  await browser.close();
}

const summary = Object.fromEntries([...new Set(cells.map(cell => cell.classification.classification))]
  .sort()
  .map(name => [name, cells.filter(cell => cell.classification.classification === name).length]));
const lateCells = cells.filter(cell => cell.classification.classification.startsWith('LATE_WORKSPACE_SIDE_EFFECT'));
const coupledCells = cells.filter(cell => cell.classification.classification.startsWith('COUPLED_WORKSPACE_SIDE_EFFECT'));
const baselineSummary = Object.fromEntries([...new Set(cells.map(cell => cell.classification.initial_workspace || 'UNDECLARED'))]
  .sort()
  .map(workspace => [workspace, cells.filter(cell => (cell.classification.initial_workspace || 'UNDECLARED') === workspace).length]));
const report = {
  schema:'td613.ash.a15-transition-trace-browser-witness/v0.3-hydration-sealed-baseline',
  source_status:'OBSERVED',
  sensor_id:'playwright-browser-runtime',
  authority_class:'A1_OBSERVATIONAL',
  browser_engine:browserName,
  profile_hydration_boundary:HYDRATION_EVENT,
  profile_hydration_completion_required:true,
  observation_horizon_ms:OBSERVATION_HORIZON_MS,
  profiles:PROFILES,
  routes:Object.keys(ROUTES),
  modes:modes.map(([name]) => name),
  cells,
  failures,
  summary,
  observed_pre_route_workspace_summary:baselineSummary,
  workspace_normalization_applied:false,
  late_workspace_side_effect_cells:lateCells.map(cell => ({ mode:cell.mode, profile:cell.profile, route:cell.route, classification:cell.classification })),
  coupled_workspace_side_effect_cells:coupledCells.map(cell => ({ mode:cell.mode, profile:cell.profile, route:cell.route, classification:cell.classification })),
  route_state_settled_equals_workspace_state_settled:false,
  observation_window_is_quiescence_proof:false,
  timing_patch_authorized:false,
  production_mutation:false,
  human_interpretation_required:true
};

const artifactPath = path.join(artifactDir, `${browserName}-a15-transition-trace.json`);
await fs.writeFile(artifactPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  browser:browserName,
  cells:cells.length,
  failures:failures.length,
  summary,
  observed_pre_route_workspace_summary:baselineSummary,
  artifact:artifactPath
}, null, 2));
if (failures.length > 0) process.exitCode = 1;
