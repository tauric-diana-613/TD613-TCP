import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const legacyPath = path.join(scriptsDir, 'ash-a2-a5-browser-probe-a13.mjs');
const tempPath = path.join(scriptsDir, `.ash-a2-a5-browser-probe-a15-${process.pid}.mjs`);

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

let source = await fs.readFile(legacyPath, 'utf8');
source = source
  .replaceAll('td613.ash.demo-registry/v0.1-a13', 'td613.ash.demo-registry/v0.3-a15')
  .replace('td613.ash.a2-a6-browser-observation/v0.2-a13-registry-settled-play', 'td613.ash.a2-a6-browser-observation/v0.5-a15-connected-route-transition');

source = replaceExactly(
  source,
  "  await page.locator('#startDemo').click();\n\n  await page.waitForFunction(() => {",
  "  await page.locator('#startDemo').click();\n\n  await page.waitForFunction(() => {\n    const caseId = localStorage.getItem('td613.ash-keep.current-case');\n    return Boolean(caseId)\n      && document.documentElement.dataset.ashDemoProfile === 'political_campaign'\n      && /Harbor City Mayoral Campaign/.test(document.getElementById('caseTitle')?.textContent || '')\n      && document.documentElement.dataset.ashPremiumReady === 'true'\n      && Boolean(window.__td613AshWholeInstrument?.version)\n      && Boolean(window.__td613AshLiveAIA?.version)\n      && Boolean(window.__td613AshA6Affordances?.version)\n      && Boolean(window.__td613AshDemoEntryConvergence?.version)\n      && window.__td613AshA15EmpiricalJourneys?.version === 'td613.ash.a15-empirical-profile-journeys/v0.1';\n  }, null, { timeout:120000 });\n  report.observations.entry_exact_case_rebind = await page.evaluate(() => {\n    const caseId = localStorage.getItem('td613.ash-keep.current-case');\n    const convergence = window.__td613AshDemoEntryConvergence;\n    if (!caseId || typeof convergence?.begin !== 'function') throw new Error('A15 A2-A6 exact-case convergence owner unavailable.');\n    const before = convergence.current?.() || null;\n    const began = convergence.begin({ detail:{ case_id:caseId, profile:'political_campaign' } });\n    return { case_id:caseId, before, begin_invoked:Boolean(began), after:convergence.current?.() || null };\n  });\n\n  await page.waitForFunction(() => {",
  'post-hydration exact-case convergence rebind'
);

const routeLoopTarget = `  const routes = {};
  for (const [route,label] of [['EXPERIENTIAL','Learn by doing'],['CUSTODIAL','Protect the source'],['AUDIT','Check the evidence'],['IMPLEMENTATION','Inspect the machinery']]) {
    const button = page.locator(\`[data-aia-route="\${route}"]\`);
    if ((await button.textContent())?.trim() !== label) throw new Error(\`\${route} route label drifted.\`);
    await button.click();
    await page.waitForFunction(expected => document.querySelector('[data-ash-route-surface]')?.dataset.route === expected, route);
    routes[route] = (await page.locator('[data-ash-route-surface]').textContent()) || '';
    if (!/Preserved exactly/i.test(routes[route])) throw new Error(\`\${route} omitted preserved invariants.\`);
  }
  if (new Set(Object.values(routes)).size !== 4) throw new Error('Route presentations were not visibly distinct.');
  report.observations.routes = routes;`;

const routeLoopReplacement = `  const routes = {};
  const routeTransitionAttempts = {};
  for (const [route,label] of [['EXPERIENTIAL','Learn by doing'],['CUSTODIAL','Protect the source'],['AUDIT','Check the evidence'],['IMPLEMENTATION','Inspect the machinery']]) {
    let committed = false;
    let lastDiagnostic = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await page.evaluate(() => { window.__td613A2A6RouteStability = null; });
      const button = page.locator(\`[data-aia-route="\${route}"]\`);
      await button.waitFor({ state:'attached', timeout:15000 });
      const observedLabel = (await button.textContent())?.trim();
      if (observedLabel !== label) throw new Error(\`\${route} route label drifted: \${observedLabel}.\`);
      try {
        await button.click();
        await page.waitForFunction(({ route, attempt }) => {
          const button = document.querySelector(\`[data-aia-route="\${route}"]\`);
          const surface = document.querySelector('[data-ash-route-surface]');
          if (!button?.isConnected || !surface?.isConnected) {
            window.__td613A2A6RouteStability = null;
            return false;
          }
          const matches = button.getAttribute('aria-pressed') === 'true'
            && surface.dataset.route === route
            && /Preserved exactly/i.test(surface.textContent || '');
          if (!matches) {
            window.__td613A2A6RouteStability = null;
            return false;
          }
          const signature = \`\${route}:\${attempt}:\${surface.dataset.route}\`;
          const now = performance.now();
          const prior = window.__td613A2A6RouteStability;
          if (!prior || prior.signature !== signature || prior.button !== button || prior.surface !== surface) {
            window.__td613A2A6RouteStability = { signature, button, surface, since:now };
            return false;
          }
          return now - prior.since >= 220;
        }, { route, attempt }, { timeout:10000, polling:25 });
        routeTransitionAttempts[route] = attempt;
        committed = true;
        break;
      } catch (error) {
        lastDiagnostic = await page.evaluate(({ route, attempt, error }) => {
          const button = document.querySelector(\`[data-aia-route="\${route}"]\`);
          const surface = document.querySelector('[data-ash-route-surface]');
          return {
            route,
            attempt,
            error,
            button_connected:Boolean(button?.isConnected),
            button_pressed:button?.getAttribute('aria-pressed') || null,
            surface_connected:Boolean(surface?.isConnected),
            surface_route:surface?.dataset.route || null,
            live_route:window.__td613AshLiveAIA?.current?.()?.route || null,
            whole_instrument_route:window.__td613AshWholeInstrument?.current?.()?.route || null
          };
        }, { route, attempt, error:String(error?.message || error) });
        await page.waitForFunction(route => Boolean(document.querySelector(\`[data-aia-route="\${route}"]\`)?.isConnected)
          && Boolean(document.querySelector('[data-ash-route-surface]')?.isConnected), route,
        { timeout:15000, polling:50 }).catch(() => {});
      }
    }
    if (!committed) throw new Error(\`\${route} route transition failed after 3 connected-control attempts: \${JSON.stringify(lastDiagnostic)}\`);
    routes[route] = (await page.locator('[data-ash-route-surface]').textContent()) || '';
    if (!/Preserved exactly/i.test(routes[route])) throw new Error(\`\${route} omitted preserved invariants.\`);
  }
  if (new Set(Object.values(routes)).size !== 4) throw new Error('Route presentations were not visibly distinct.');
  report.observations.routes = routes;
  report.observations.route_transition_attempts = routeTransitionAttempts;`;

source = replaceExactly(
  source,
  routeLoopTarget,
  routeLoopReplacement,
  'connected AIA route transition witness'
);

if (source.includes('td613.ash.demo-registry/v0.1-a13') || source.includes('td613.ash.demo-registry/v0.2-a14')) {
  throw new Error('A15 current-registry observer adapter left a retired registry token.');
}
if (!source.includes('entry_exact_case_rebind')
  || !source.includes("convergence.begin({ detail:{ case_id:caseId, profile:'political_campaign' } })")
  || !source.includes("dataset.ashPremiumReady === 'true'")
  || !source.includes('td613.ash.a15-empirical-profile-journeys/v0.1')
  || !source.includes('route_transition_attempts')
  || !source.includes('window.__td613A2A6RouteStability')
  || !source.includes("button.getAttribute('aria-pressed') === 'true'")) {
  throw new Error('A15 A2-A6 exact-case and connected-route observer adapter failed to compile.');
}

try {
  await fs.writeFile(tempPath, source, 'utf8');
  await import(`${pathToFileURL(tempPath).href}?a15=${Date.now()}`);
} finally {
  await fs.rm(tempPath, { force:true });
}
