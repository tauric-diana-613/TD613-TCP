import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const legacyPath = path.join(scriptsDir, 'ash-a2-a5-browser-probe-a13.mjs');
const tempPath = path.join(scriptsDir, `.ash-a2-a5-browser-probe-a15-${process.pid}.mjs`);
// Historical adapter label: post-hydration reconcile-only exact-case convergence.
// Historical failure label: A15 A2-A6 reconcile-only convergence owner unavailable.

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

let source = await fs.readFile(legacyPath, 'utf8');
source = source
  .replaceAll('td613.ash.demo-registry/v0.1-a13', 'td613.ash.demo-registry/v0.3-a15')
  .replace('td613.ash.a2-a6-browser-observation/v0.2-a13-registry-settled-play', 'td613.ash.a2-a6-browser-observation/v0.12-a15-replaceable-native-route-settlement');

source = replaceExactly(
  source,
  "if (!/Cases & profiles/i.test((await page.locator('[data-command-action=\"profile\"]').textContent()) || '')) throw new Error('Cases & profiles label drifted.');",
  "const profileAction = page.locator('#premiumCommandGrid [data-a12-action=\"profile\"][data-command-action=\"profile\"]');\n  if (await profileAction.count() !== 1) throw new Error('Canonical Cases & Profiles command ownership was ambiguous.');\n  if (!/Cases & profiles/i.test((await profileAction.textContent()) || '')) throw new Error('Cases & profiles label drifted.');",
  'A15 canonical A12 profile command ownership'
);

source = replaceExactly(
  source,
  "    const button = page.locator(`[data-aia-route=\"${route}\"]`);",
  "    const button = page.locator(`#ashAiaMembrane [data-aia-route=\"${route}\"]:visible`).first();",
  'canonical AIA route control ownership'
);
source = replaceExactly(
  source,
  "    await button.click();\n    await page.waitForFunction(expected => document.querySelector('[data-ash-route-surface]')?.dataset.route === expected, route);",
  `    const routeSelector = '#ashAiaMembrane [data-aia-route="' + route + '"]:visible';
    const maxRouteActivationAttempts = 4;
    const routeActivationAttempts = [];
    let activationAfterDispatch = null;
    let canonicalRouteSettled = false;
    for (let activationAttempt = 1; activationAttempt <= maxRouteActivationAttempts; activationAttempt += 1) {
      const canonicalButton = page.locator(routeSelector).first();
      await canonicalButton.waitFor({ state:'visible', timeout:20_000 });
      const handle = await canonicalButton.elementHandle();
      if (!handle) {
        routeActivationAttempts.push({ attempt:activationAttempt, handle_acquired:false, retry_reason:'NO_ELEMENT_HANDLE' });
        continue;
      }
      try {
        await handle.focus();
        await handle.evaluate((control, payload) => {
          const { expected, attempt } = payload;
          if (control?.dataset?.aiaRoute !== expected
              || !control.isConnected
              || typeof control.onclick !== 'function') {
            throw new Error('A15 A2-A6 semantic route control unavailable before keyboard activation.');
          }
          const trace = {
            expected_route:expected,
            attempt,
            before_route:document.querySelector('#ashAiaMembrane [data-ash-route-surface]')?.dataset.route || null,
            control_connected:control.isConnected,
            direct_onclick:typeof control.onclick === 'function',
            active_before:control === document.activeElement,
            events:[]
          };
          const observe = (type, phase, capture) => {
            document.addEventListener(type, event => {
              if (event.target !== control) return;
              trace.events.push({
                phase,
                type:event.type,
                key:event.key || null,
                default_prevented:event.defaultPrevented,
                route:document.querySelector('#ashAiaMembrane [data-ash-route-surface]')?.dataset.route || null,
                target_route:event.target?.dataset?.aiaRoute || null,
                direct_onclick:typeof control.onclick === 'function'
              });
            }, { capture });
          };
          observe('keydown', 'KEYDOWN_CAPTURE', true);
          observe('keydown', 'KEYDOWN_BUBBLE', false);
          observe('keyup', 'KEYUP_CAPTURE', true);
          observe('keyup', 'KEYUP_BUBBLE', false);
          observe('click', 'CLICK_CAPTURE', true);
          observe('click', 'CLICK_BUBBLE', false);
          window.__td613A2A5SemanticRouteTrace = trace;
          window.__td613A2A5SemanticRouteControl = control;
        }, { expected:route, attempt:activationAttempt });

        let pressError = null;
        try {
          await handle.press('Enter');
        } catch (error) {
          pressError = error?.message || String(error);
        }

        activationAfterDispatch = await page.evaluate(expected => {
          const trace = window.__td613A2A5SemanticRouteTrace || null;
          const tracedControl = window.__td613A2A5SemanticRouteControl || null;
          const canonicalControl = [...document.querySelectorAll('#ashAiaMembrane [data-aia-route]')]
            .find(node => node.dataset.aiaRoute === expected && node.getClientRects().length > 0) || null;
          return {
            expected_route:expected,
            attempt:trace?.attempt || null,
            before_route:trace?.before_route || null,
            control_connected:trace?.control_connected === true,
            direct_onclick:trace?.direct_onclick === true,
            active_before:trace?.active_before === true,
            events:[...(trace?.events || [])],
            after_dispatch_route:document.querySelector('#ashAiaMembrane [data-ash-route-surface]')?.dataset.route || null,
            active_after:document.activeElement?.dataset?.aiaRoute || document.activeElement?.id || null,
            traced_control_connected_after:tracedControl?.isConnected === true,
            canonical_control_same_instance_after:Boolean(tracedControl && canonicalControl && tracedControl === canonicalControl)
          };
        }, route);
        activationAfterDispatch.press_error = pressError;

        if (!pressError && activationAfterDispatch.events.length > 0) {
          try {
            await page.waitForFunction(expected => window.__td613AshLiveAIA?.current?.()?.route === expected, route, { timeout:4_000, polling:50 });
            canonicalRouteSettled = true;
          } catch (error) {
            activationAfterDispatch.settlement_error = error?.message || String(error);
          }
        }

        routeActivationAttempts.push(activationAfterDispatch);
        if (canonicalRouteSettled) break;
      } finally {
        await handle.dispose().catch(() => {});
      }
    }

    report.observations.semantic_route_activation ||= {};
    report.observations.semantic_route_activation[route] = {
      ...(activationAfterDispatch || { expected_route:route }),
      attempts:routeActivationAttempts,
      attempt_count:routeActivationAttempts.length,
      replacement_retry_observed:routeActivationAttempts.length > 1,
      native_enter_required:true,
      direct_route_api_bypass:false,
      canonical_route_settled:canonicalRouteSettled
    };
    if (!canonicalRouteSettled) {
      throw new Error('A15 A2-A6 bounded native route activation failed after replaceable-control retries: ' + JSON.stringify(routeActivationAttempts));
    }
    await page.evaluate(() => window.__td613AshWholeInstrument?.refresh?.('WITNESS_ROUTE_SETTLEMENT'));
    await page.waitForFunction(expected => document.querySelector('#ashAiaMembrane [data-ash-route-surface]')?.dataset.route === expected, route, { timeout:20_000 });
    report.observations.semantic_route_activation[route].settled_route = await page.evaluate(() => document.querySelector('#ashAiaMembrane [data-ash-route-surface]')?.dataset.route || null);`,
  'geometry-independent replaceable native route activation with canonical owner settlement'
);
source = replaceExactly(
  source,
  "    await page.locator(`[data-premium-workspace=\"${destination}\"]`).click();",
  "    await page.locator(`#premiumPrimaryDock [data-premium-workspace=\"${destination}\"]:visible`).first().click();",
  'canonical premium dock control ownership'
);
source = replaceExactly(
  source,
  "    await page.waitForFunction(expected => window.__td613AshWholeInstrument?.current?.()?.navigation_receipt?.destination_workspace === expected, destination);",
  "    await page.waitForFunction(expected => {\n      const panel = document.getElementById(`workspace-${expected}`);\n      return window.__td613AshWholeInstrument?.current?.()?.navigation_receipt?.destination_workspace === expected\n        && document.documentElement.dataset.ashPremiumWorkspace === expected\n        && panel?.classList.contains('active') === true;\n    }, destination, { timeout:20_000 });",
  'canonical premium dock settlement'
);

source = replaceExactly(
  source,
  "  await page.locator('#startDemo').click();\n\n  await page.waitForFunction(() => {",
  "  await page.evaluate(expectedOwner => {\n    const registry = window.__td613AshDemoRegistry;\n    const select = document.getElementById('newProfile');\n    const button = document.getElementById('startDemo');\n    if (!select || !button || typeof registry?.reconcile !== 'function') {\n      throw new Error('A2–A5 governed demo controls unavailable.');\n    }\n    if (select.value !== 'political_campaign') {\n      select.value = 'political_campaign';\n      select.dispatchEvent(new Event('change', { bubbles:true }));\n    }\n    registry.reconcile();\n    const entry = registry.snapshot?.().profiles?.find(item => item.profile === 'political_campaign');\n    const ready = select.value === 'political_campaign'\n      && document.documentElement.dataset.ashDemoRegistryProfile === 'political_campaign'\n      && entry?.promoted === true\n      && button.dataset.ashDemoRegistryOwner === expectedOwner\n      && button.dataset.ashMethodDemoState === 'READY'\n      && button.disabled === false\n      && !button.matches(':disabled');\n    if (!ready) throw new Error(`A2–A5 profile-atomic demo gesture held: ${JSON.stringify({\n      profile:select.value || null,\n      registry_profile:document.documentElement.dataset.ashDemoRegistryProfile || null,\n      promoted:entry?.promoted ?? null,\n      owner:button.dataset.ashDemoRegistryOwner || null,\n      state:button.dataset.ashMethodDemoState || null,\n      disabled:button.disabled,\n      aria_disabled:button.getAttribute('aria-disabled') || null\n    })}`);\n    button.click();\n  }, 'td613.ash.demo-registry/v0.3-a15');\n\n  await page.waitForFunction(() => {\n    const caseId = localStorage.getItem('td613.ash-keep.current-case');\n    const panel = document.getElementById('workspace-map');\n    const main = document.querySelector('body > main');\n    const context = document.getElementById('premiumContextBar');\n    const dock = document.getElementById('premiumPrimaryDock');\n    const structural = node => {\n      if (!node) return false;\n      const style = getComputedStyle(node);\n      const rect = node.getBoundingClientRect();\n      return style.display !== 'none'\n        && style.visibility !== 'hidden'\n        && rect.width > 0\n        && rect.height > 0;\n    };\n    return Boolean(caseId)\n      && document.documentElement.dataset.ashDemoProfile === 'political_campaign'\n      && /Harbor City Mayoral Campaign/.test(document.getElementById('caseTitle')?.textContent || '')\n      && document.documentElement.dataset.ashPremiumReady === 'true'\n      && document.documentElement.dataset.ashPremiumWorkspace === 'map'\n      && panel?.classList.contains('active')\n      && structural(panel)\n      && structural(main)\n      && structural(context)\n      && structural(dock)\n      && !main?.hasAttribute('inert')\n      && Boolean(window.__td613AshWholeInstrument?.version)\n      && Boolean(window.__td613AshLiveAIA?.version)\n      && Boolean(window.__td613AshA6Affordances?.version)\n      && Boolean(window.__td613AshDemoEntryConvergence?.version)\n      && window.__td613AshA15EmpiricalJourneys?.version === 'td613.ash.a15-empirical-profile-journeys/v0.1';\n  }, null, { timeout:120000 });\n  report.observations.entry_exact_case_reconcile = await page.evaluate(() => {\n    const caseId = localStorage.getItem('td613.ash-keep.current-case');\n    const convergence = window.__td613AshDemoEntryConvergence;\n    if (!caseId || typeof convergence?.reconcile !== 'function') throw new Error('A15 A2-A6 present-state convergence owner unavailable.');\n    const before = convergence.current?.() || null;\n    const reconciled = before?.posture === 'READY'\n      ? false\n      : convergence.reconcile({ case_id:caseId, profile:'political_campaign' });\n    return {\n      case_id:caseId,\n      before,\n      reconcile_invoked:Boolean(reconciled),\n      after:convergence.current?.() || null,\n      release_receipt:convergence.releaseReceipt?.() || null,\n      structural_graph_observed:true,\n      authority_changed:false,\n      source_bytes_moved:false,\n      human_closure_required:true\n    };\n  });\n\n  await page.waitForFunction(() => {",
  'post-hydration present-state exact-case convergence'
);

if (source.includes('td613.ash.demo-registry/v0.1-a13') || source.includes('td613.ash.demo-registry/v0.2-a14')) {
  throw new Error('A15 current-registry observer adapter left a retired registry token.');
}
if (!source.includes('entry_exact_case_reconcile')
  || !source.includes("convergence.reconcile({ case_id:caseId, profile:'political_campaign' })")
  || !source.includes("typeof convergence?.reconcile !== 'function'")
  || !source.includes("dataset.ashPremiumWorkspace === 'map'")
  || !source.includes("panel?.classList.contains('active')")
  || !source.includes('#premiumCommandGrid [data-a12-action="profile"][data-command-action="profile"]')
  || !source.includes('#ashAiaMembrane [data-aia-route="${route}"]:visible')
  || !source.includes("window.__td613AshLiveAIA?.current?.()?.route === expected")
  || !source.includes("refresh?.('WITNESS_ROUTE_SETTLEMENT')")
  || !source.includes("#ashAiaMembrane [data-ash-route-surface]")
  || !source.includes('#premiumPrimaryDock [data-premium-workspace="${destination}"]:visible')
  || !source.includes("dataset.ashPremiumWorkspace === expected")
  || !source.includes("select.dispatchEvent(new Event('change', { bubbles:true }))")
  || !source.includes('registry.reconcile();')
  || !source.includes("dataset.ashDemoRegistryProfile === 'political_campaign'")
  || !source.includes("button.dataset.ashMethodDemoState === 'READY'")
  || !source.includes('button.disabled === false')
  || !source.includes("!button.matches(':disabled')")
  || !source.includes('A2–A5 profile-atomic demo gesture held')
  || !source.includes('structural_graph_observed:true')
  || !source.includes('release_receipt:convergence.releaseReceipt?.() || null')
  || !source.includes('td613.ash.a15-empirical-profile-journeys/v0.1')) {
  throw new Error('A15 A2-A6 canonical-control convergence adapter failed to compile.');
}
if (!source.includes('const maxRouteActivationAttempts = 4')
  || !source.includes('await canonicalButton.waitFor')
  || !source.includes('const handle = await canonicalButton.elementHandle()')
  || !source.includes('await handle.focus()')
  || !source.includes("await handle.press('Enter')")
  || !source.includes('replacement_retry_observed:routeActivationAttempts.length > 1')
  || !source.includes('canonical_control_same_instance_after')
  || !source.includes("control?.dataset?.aiaRoute !== expected")
  || !source.includes("typeof control.onclick !== 'function'")) {
  throw new Error('A15 A2-A6 replaceable native route activation adapter failed to compile.');
}
if (!source.includes('__td613A2A5SemanticRouteTrace')
  || !source.includes('__td613A2A5SemanticRouteControl')
  || !source.includes("'KEYDOWN_CAPTURE'")
  || !source.includes("'KEYUP_BUBBLE'")
  || !source.includes("'CLICK_CAPTURE'")
  || !source.includes("'CLICK_BUBBLE'")
  || !source.includes('routeActivationAttempts.push(activationAfterDispatch)')) {
  throw new Error('A15 A2-A6 semantic keyboard activation diagnostic failed to compile.');
}
if (!source.includes("page.locator('#premiumCommandGrid [data-a12-action=\"profile\"][data-command-action=\"profile\"]')")
  || source.includes("page.locator('[data-command-action=\"profile\"]').textContent()")) {
  throw new Error('A15 A2-A6 profile command witness must use the canonical A12-owned control.');
}
if (source.includes('__td613AshLiveAIA.setRoute(')) {
  throw new Error('A15 A2-A6 route witness may not bypass the native route control owner.');
}

try {
  await fs.writeFile(tempPath, source, 'utf8');
  await import(`${pathToFileURL(tempPath).href}?a15=${Date.now()}`);
} finally {
  await fs.rm(tempPath, { force:true });
}
