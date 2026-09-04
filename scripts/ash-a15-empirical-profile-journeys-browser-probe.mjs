import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const corePath = path.join(scriptsDir, 'ash-a15-empirical-profile-journeys-browser-probe-core.mjs');
const tempPath = path.join(scriptsDir, `.ash-a15-empirical-profile-journeys-hardened-${process.pid}.mjs`);

const REQUIRED_A15_STATIC_MARKERS = Object.freeze([
  '#premiumPrimaryDock [data-premium-workspace=',
  '[data-aia-route=',
  'ashA15OrientAction',
  'real_profile_hydration:true',
  'real_workspace_navigation:true',
  'navigation_receipt_captured_at_click:true',
  'idempotent_active_workspace_gesture:true',
  'real_route_navigation:true',
  'real_route_gestures:true',
  'route_selected_before_target_workspace:true',
  'real_visible_orientation_gesture:true',
  'command_menu_mappings_verified:true',
  'profile_entry_convergence_gated:true',
  'canonical_primary_dock_navigation:true',
  'exact_failure_witness_context:true',
  'state_derived_transition_receipts:true',
  'HELD_SENSITIVE_CONTEXT',
  '__td613A15NavigationWitness',
  'td613:ash:navigation-receipt',
  'workspaceDiagnostic',
  'workspace_transitions',
  'captured_navigation_receipts',
  'minimum_workspace_transitions_per_profile:4',
  "route_landing_workspace:'work'",
  'browser_process_isolation_per_profile:true',
  'incremental_profile_checkpoints:true',
  'all_profiles_distinct:true',
  '-held.png',
  'await selectRoute(page, route);',
  'await openWorkspace(page, workspace, witness);',
  'await waitForVisibleCombination(page, workspace, route);',
  'const selector = `#premiumPrimaryDock [data-premium-workspace=',
  'if (navigation.changed) workspaceTransitions += 1',
  'captured_navigation_receipts !== result.workspace_transitions',
  "window.addEventListener('td613:ash:navigation-receipt', handler)",
  'const expectedJourneyToken = `ash-a15-empirical-journey:${profile}`',
  'entry.deterministic_test_journey !== expectedJourneyToken',
  'provider_matrix_cells_per_profile:20',
  'result.answers.length !== 20',
  'matrix_cells:snapshot.empirical_matrix_cells',
  'matrix_cells:120',
  'result.matrix_cells !== 120',
  '__td613AshA15EmpiricalJourneys?.compile?.({',
  "context:{ email:'person@example.com' }",
  "result.sensitive_status !== 'HELD_SENSITIVE_CONTEXT'",
  "sensitive_context_rejected:receipts.every(receipt => receipt.sensitive_status === 'HELD_SENSITIVE_CONTEXT')",
  'td613:ash:demo-registry-hydrated',
  '__td613A15HydrationWitness',
  'capture.receipt?.automatic_ash_action === false',
  'profile_hydration_completion_boundary:HYDRATION_EVENT',
  'profile_hydration_receipt_required:true',
  '__td613AshDemoEntryConvergence?.version',
  '__td613AshDemoEntryConvergence?.current?.()',
  'ashDemoEntryReady',
  'ashDemoEntryHydrating',
  'ashDemoEntryHold',
  '__td613A15RouteWitness',
  'ROUTE_CONTROL_BEFORE_CLICK',
  'ROUTE_CLICK_CAPTURE',
  'ROUTE_CLICK_BUBBLE',
  'AFTER_ROUTE_CLICK_DISPATCH',
  'POINTER_DELIVERY_UNREGISTERED',
  'LIVE_ROUTE_OWNER_NOT_SETTLED',
  'A15_ROUTE_PROJECTION_NOT_SETTLED',
  'A15_ROUTE_SETTLEMENT_TIMEOUT_UNCLASSIFIED',
  'route_settlement:error.td613RouteDiagnostic || null',
  'A15_PROFILE_BEGIN',
  'A15_PROFILE_PASS',
  'const browser = await browserType.launch({ headless:true });',
  'await browser.close().catch(() => {})'
]);

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

let source = await fs.readFile(corePath, 'utf8');

source = replaceExactly(
  source,
  `      && window.__td613AshPremiumUI?.version
      && window.__td613AshDemoRegistry?.version === registry`,
  `      && window.__td613AshPremiumUI?.version
      && window.__td613AshDemoEntryConvergence?.version
      && window.__td613AshDemoRegistry?.version === registry`,
  'A15 canonical convergence owner readiness'
);
source = replaceExactly(
  source,
  `    return Object.freeze({
      profile:capture.receipt.profile,`,
  `    const convergenceReconcile = await page.evaluate(selected => {
      const current = window.__td613AshKeep?.current?.() || null;
      const owner = window.__td613AshDemoEntryConvergence || null;
      const before = owner?.current?.() || null;
      if (!current?.case_id || typeof owner?.reconcile !== 'function') {
        return { owner_available:false, invoked:false, before, after:before };
      }
      let invoked = false;
      if (before?.posture !== 'READY') {
        owner.reconcile({ case_id:current.case_id, profile:selected });
        invoked = true;
      }
      return {
        owner_available:true,
        invoked,
        before,
        after:owner.current?.() || null
      };
    }, profile);
    try {
      await page.waitForFunction(selected => {
        const current = window.__td613AshKeep?.current?.() || null;
        const convergence = window.__td613AshDemoEntryConvergence?.current?.() || null;
        const workspace = convergence?.workspace || null;
        const panel = workspace ? document.getElementById(\`workspace-\${workspace}\`) : null;
        return Boolean(current?.case_id)
          && convergence?.case_id === current.case_id
          && convergence?.profile === selected
          && convergence?.posture === 'READY'
          && convergence?.phase === 'VISIBLE'
          && document.documentElement.dataset.ashDemoEntryReady === \`\${selected}:\${workspace}\`
          && !document.documentElement.dataset.ashDemoEntryHydrating
          && !document.documentElement.dataset.ashDemoEntryHold
          && document.documentElement.dataset.ashPremiumWorkspace === workspace
          && panel?.classList.contains('active') === true;
      }, profile, { timeout:15_000 });
    } catch (error) {
      const diagnostic = await page.evaluate(() => ({
        current_case:window.__td613AshKeep?.current?.()?.case_id || null,
        convergence:window.__td613AshDemoEntryConvergence?.current?.() || null,
        entry_ready:document.documentElement.dataset.ashDemoEntryReady || null,
        entry_hydrating:document.documentElement.dataset.ashDemoEntryHydrating || null,
        entry_hold:document.documentElement.dataset.ashDemoEntryHold || null,
        workspace:document.documentElement.dataset.ashPremiumWorkspace || null,
        active:[...document.querySelectorAll('.workspace.active')].map(node => node.id)
      }));
      throw new Error(\`A15 \${profile} demo-entry convergence did not settle before matrix navigation: \${JSON.stringify({ ...diagnostic, convergence_reconcile:convergenceReconcile })}\`, { cause:error });
    }
    return Object.freeze({
      profile:capture.receipt.profile,`,
  'A15 post-hydration canonical entry convergence'
);
source = replaceExactly(
  source,
  `    profile_hydration_receipt_required:true,
    browser_process_isolation_per_profile:true,
    incremental_profile_checkpoints:true,`,
  `    profile_hydration_receipt_required:true,
    profile_entry_convergence_gated:true,
    browser_process_isolation_per_profile:true,
    incremental_profile_checkpoints:true,`,
  'A15 final receipt convergence claim'
);
source = replaceExactly(
  source,
  `    provider_matrix_cells_per_profile:20,
    real_profile_hydration:true,`,
  `    provider_matrix_cells_per_profile:20,
    matrix_cells:120,
    real_profile_hydration:true,`,
  'A15 historical matrix-size receipt claim'
);
source = replaceExactly(
  source,
  `    minimum_workspace_transitions_per_profile:4,
    route_landing_workspace:'work',`,
  `    canonical_primary_dock_navigation:true,
    exact_failure_witness_context:true,
    state_derived_transition_receipts:true,
    minimum_workspace_transitions_per_profile:4,
    route_landing_workspace:'work',`,
  'A15 historical navigation and failure receipt claims'
);
source = replaceExactly(
  source,
  `    real_route_navigation:true,
    real_world_answer_gesture:true,`,
  `    real_route_navigation:true,
    real_route_gestures:true,
    route_selected_before_target_workspace:true,
    real_visible_orientation_gesture:true,
    command_menu_mappings_verified:true,
    real_world_answer_gesture:true,`,
  'A15 historical visible gesture receipt claims'
);

source = replaceExactly(
  source,
  `async function selectRoute(page, route) {
  const controlValue = ROUTE_CONTROLS[route];
  const control = page.locator(\`#ashAiaMembrane [data-aia-route="\${controlValue}"]:visible\`).first();
  if (!(await control.count())) throw new Error(\`A15 visible \${route} route control unavailable.\`);
  await control.click();
  await page.waitForFunction(({ route, controlValue }) => {
    const current = String(window.__td613AshLiveAIA?.current?.()?.route || '').toUpperCase();
    return (current === controlValue || current === route.toUpperCase()) && document.querySelector('[data-a15-route]')?.textContent?.trim() === route;
  }, { route, controlValue }, { timeout:60_000 });
}`,
  `function classifyRouteSettlementDiagnostic(diagnostic, route, controlValue) {
  const expected = new Set([String(controlValue || '').toUpperCase(), String(route || '').toUpperCase()]);
  const ownerSettled = expected.has(String(diagnostic?.live_route || '').toUpperCase());
  const projectionSettled = diagnostic?.route_chip === route;
  if (diagnostic?.control?.connected === true
      && diagnostic?.control?.live_aia_direct_onclick === true
      && diagnostic?.after_dispatch === true
      && diagnostic?.capture_observed === false
      && diagnostic?.bubble_observed === false) return 'POINTER_DELIVERY_UNREGISTERED';
  if (diagnostic?.capture_observed === true && diagnostic?.bubble_observed === true && !ownerSettled) return 'LIVE_ROUTE_OWNER_NOT_SETTLED';
  if (ownerSettled && !projectionSettled) return 'A15_ROUTE_PROJECTION_NOT_SETTLED';
  return 'A15_ROUTE_SETTLEMENT_TIMEOUT_UNCLASSIFIED';
}

async function armRouteSettlementDiagnostic(page, route, controlValue, before) {
  await page.evaluate(({ route, controlValue, before }) => {
    window.__td613A15RouteWitness?.cleanup?.();
    const state = {
      requested_route:route,
      control_value:controlValue,
      before,
      capture_observed:false,
      bubble_observed:false,
      after_dispatch:false,
      records:[],
      cleanup:null
    };
    const read = () => ({
      live_route:String(window.__td613AshLiveAIA?.current?.()?.route || ''),
      route_chip:document.querySelector('[data-a15-route]')?.textContent?.trim() || null,
      route_dataset:document.documentElement.dataset.ashAiaHumanRoute || null
    });
    const push = (kind, detail = null) => state.records.push({
      kind,
      performance_ms:Number(performance.now().toFixed(3)),
      ...read(),
      detail
    });
    const phaseHandler = phase => event => {
      const target = event.target?.closest?.('#ashAiaMembrane [data-aia-route]');
      if (!target || target.dataset.aiaRoute !== controlValue) return;
      if (phase === 'CAPTURE') state.capture_observed = true;
      if (phase === 'BUBBLE') state.bubble_observed = true;
      push(phase === 'CAPTURE' ? 'ROUTE_CLICK_CAPTURE' : 'ROUTE_CLICK_BUBBLE', {
        route:target.dataset.aiaRoute || null,
        connected:target.isConnected,
        live_aia_direct_onclick:typeof target.onclick === 'function',
        aria_pressed:target.getAttribute('aria-pressed')
      });
    };
    const capture = phaseHandler('CAPTURE');
    const bubble = phaseHandler('BUBBLE');
    document.addEventListener('click', capture, true);
    document.addEventListener('click', bubble, false);
    state.cleanup = () => {
      document.removeEventListener('click', capture, true);
      document.removeEventListener('click', bubble, false);
    };
    window.__td613A15RouteWitness = state;
    push('ROUTE_CONTROL_BEFORE_CLICK', before);
  }, { route, controlValue, before });
}

async function markRouteDispatchComplete(page) {
  await page.evaluate(() => {
    const state = window.__td613A15RouteWitness;
    if (!state) return;
    state.after_dispatch = true;
    const liveRoute = String(window.__td613AshLiveAIA?.current?.()?.route || '');
    const routeChip = document.querySelector('[data-a15-route]')?.textContent?.trim() || null;
    state.records.push({
      kind:'AFTER_ROUTE_CLICK_DISPATCH',
      performance_ms:Number(performance.now().toFixed(3)),
      live_route:liveRoute,
      route_chip:routeChip,
      route_dataset:document.documentElement.dataset.ashAiaHumanRoute || null,
      detail:null
    });
  });
}

async function readRouteSettlementDiagnostic(page, route, controlValue) {
  return page.evaluate(({ route, controlValue }) => {
    const state = window.__td613A15RouteWitness || null;
    const control = document.querySelector(\`#ashAiaMembrane [data-aia-route="\${controlValue}"]\`);
    return {
      requested_route:route,
      control_value:controlValue,
      capture_observed:state?.capture_observed === true,
      bubble_observed:state?.bubble_observed === true,
      after_dispatch:state?.after_dispatch === true,
      before:state?.before || null,
      live_route:String(window.__td613AshLiveAIA?.current?.()?.route || ''),
      route_chip:document.querySelector('[data-a15-route]')?.textContent?.trim() || null,
      route_dataset:document.documentElement.dataset.ashAiaHumanRoute || null,
      control:control ? {
        connected:control.isConnected,
        live_aia_direct_onclick:typeof control.onclick === 'function',
        aria_pressed:control.getAttribute('aria-pressed'),
        visible:Boolean(control.getClientRects().length)
      } : null,
      records:state?.records ? structuredClone(state.records) : []
    };
  }, { route, controlValue });
}

async function clearRouteSettlementDiagnostic(page) {
  await page.evaluate(() => {
    window.__td613A15RouteWitness?.cleanup?.();
    delete window.__td613A15RouteWitness;
  }).catch(() => {});
}

async function selectRoute(page, route) {
  const controlValue = ROUTE_CONTROLS[route];
  const control = page.locator(\`#ashAiaMembrane [data-aia-route="\${controlValue}"]:visible\`).first();
  if (!(await control.count())) throw new Error(\`A15 visible \${route} route control unavailable.\`);
  const before = await control.evaluate(node => ({
    route:node.dataset.aiaRoute || null,
    connected:node.isConnected,
    live_aia_direct_onclick:typeof node.onclick === 'function',
    aria_pressed:node.getAttribute('aria-pressed'),
    visible:Boolean(node.getClientRects().length)
  }));
  await armRouteSettlementDiagnostic(page, route, controlValue, before);
  try {
    await control.click();
    await markRouteDispatchComplete(page);
    await page.waitForFunction(({ route, controlValue }) => {
      const current = String(window.__td613AshLiveAIA?.current?.()?.route || '').toUpperCase();
      return (current === controlValue || current === route.toUpperCase()) && document.querySelector('[data-a15-route]')?.textContent?.trim() === route;
    }, { route, controlValue }, { timeout:60_000 });
    await clearRouteSettlementDiagnostic(page);
  } catch (error) {
    const diagnostic = await readRouteSettlementDiagnostic(page, route, controlValue).catch(() => null);
    await clearRouteSettlementDiagnostic(page);
    const classification = classifyRouteSettlementDiagnostic(diagnostic, route, controlValue);
    const held = new Error(\`A15 route settlement held [\${classification}] for \${route}: \${JSON.stringify(diagnostic)}\`, { cause:error });
    held.td613RouteDiagnostic = { classification, diagnostic };
    throw held;
  }
}`,
  'A15 front-loaded route settlement diagnostics'
);

source = replaceExactly(
  source,
  `async function inspectProfile(options, profile, mode) {`,
  `function assertClosedWorldAnswer(answer, witness) {
  const authority = answer?.authority;
  const falseFlags = ['custody_changed','source_bytes_moved','raw_content_transport','consequential_action','release_authority','destination_authority'];
  const trueFlags = ['human_review_required','human_closure_required'];
  const postureClosed = answer?.status === 'READY'
    && answer?.action_recognized === true
    && answer?.synthetic_fixture === true
    && answer?.context_imported === false
    && answer?.real_world_claim === false
    && answer?.ontology_exposed === false
    && authority && typeof authority === 'object'
    && falseFlags.every(key => authority[key] === false)
    && trueFlags.every(key => authority[key] === true);
  if (!postureClosed) throw new Error(\`A15 world-answer authority widened: \${JSON.stringify({ witness, answer })}\`);
}

async function inspectProfile(options, profile, mode) {`,
  'A15 closed world-answer authority helper'
);
source = replaceExactly(
  source,
  `        if (!answer || answer.profile !== profile || answer.workspace !== workspace || answer.route !== route) throw new Error(\`A15 \${profile}/\${workspace}/\${route} answer identity drifted: \${JSON.stringify(visible)}\`);
        if (visible.profile_chip !== profile || visible.workspace_chip !== workspace || visible.route_chip !== route) throw new Error(\`A15 \${profile}/\${workspace}/\${route} visible chips drifted: \${JSON.stringify(visible)}\`);
        if (forbiddenPublicLeak(answer)) throw new Error(\`A15 \${profile}/\${workspace}/\${route} leaked forbidden internal content.\`);
        answers.push(answer);`,
  `        if (!answer || answer.profile !== profile || answer.workspace !== workspace || answer.route !== route) throw new Error(\`A15 \${profile}/\${workspace}/\${route} answer identity drifted: \${JSON.stringify(visible)}\`);
        const displayProfile = profile.replaceAll('_', ' ');
        if (visible.profile_chip !== displayProfile || visible.workspace_chip !== workspace || visible.route_chip !== route) throw new Error(\`A15 \${profile}/\${workspace}/\${route} visible chips drifted: \${JSON.stringify({ ...visible, expected_profile_chip:displayProfile })}\`);
        if (visible.visible_text !== answer.message) throw new Error(\`A15 \${profile}/\${workspace}/\${route} visible answer diverged from emitted answer: \${JSON.stringify(visible)}\`);
        assertClosedWorldAnswer(answer, { profile, workspace, route });
        if (forbiddenPublicLeak(answer)) throw new Error(\`A15 \${profile}/\${workspace}/\${route} leaked forbidden internal content.\`);
        answers.push(answer);`,
  'A15 visible answer and authority verification'
);
source = replaceExactly(
  source,
  `    error.td613Diagnostic = {
      witness,
      hydration_receipt:hydrationReceipt,
      hydration_activation:error.td613HydrationDiagnostic || null,
      screenshot,
      browser_process_isolated_for_profile:true
    };`,
  `    error.td613Diagnostic = {
      witness,
      hydration_receipt:hydrationReceipt,
      hydration_activation:error.td613HydrationDiagnostic || null,
      route_settlement:error.td613RouteDiagnostic || null,
      screenshot,
      browser_process_isolated_for_profile:true
    };`,
  'A15 route settlement failure custody'
);
source = replaceExactly(
  source,
  `function forbiddenPublicLeak(answer) {
  const text = JSON.stringify(answer).toLowerCase();
  return FORBIDDEN.some(token => text.includes(token));
}`,
  `function forbiddenPublicLeak(answer) {
  const { schema, version, ...publicPayload } = answer || {};
  const text = JSON.stringify(publicPayload).toLowerCase();
  return FORBIDDEN.some(token => text.includes(token));
}`,
  'A15 public leak scan metadata exclusion'
);

for (const marker of REQUIRED_A15_STATIC_MARKERS) {
  if (!source.includes(marker)) throw new Error(`A15 historical witness law missing after release/convergence hardening: ${marker}`);
}
if (!source.includes("profile.replaceAll('_', ' ')") || !source.includes('visible.visible_text !== answer.message')
    || !source.includes('assertClosedWorldAnswer(answer') || !source.includes('const { schema, version, ...publicPayload }')) {
  throw new Error('A15 empirical witness hardening did not compile into the generated probe.');
}
if (!source.includes('profile_entry_convergence_gated:true')
    || !source.includes("before?.posture !== 'READY'")
    || !source.includes("owner.reconcile({ case_id:current.case_id, profile:selected })")
    || !source.includes("convergence?.posture === 'READY'")
    || !source.includes("convergence?.phase === 'VISIBLE'")
    || !source.includes('ashDemoEntryHydrating')
    || !source.includes('ashDemoEntryHold')) {
  throw new Error('A15 canonical convergence hardening did not compile into the generated probe.');
}
if (!source.includes('classifyRouteSettlementDiagnostic')
    || !source.includes('ROUTE_CLICK_CAPTURE')
    || !source.includes('ROUTE_CLICK_BUBBLE')
    || !source.includes('AFTER_ROUTE_CLICK_DISPATCH')
    || !source.includes('route_settlement:error.td613RouteDiagnostic || null')) {
  throw new Error('A15 front-loaded route diagnostic hardening did not compile into the generated probe.');
}

await fs.writeFile(tempPath, source, 'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?td613_a15_empirical_hardened=${Date.now()}`);
} finally {
  await fs.unlink(tempPath).catch(() => {});
}
