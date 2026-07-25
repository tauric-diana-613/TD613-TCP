import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, '..');
const probePath = path.join(here, 'ash-keep-production-probe.mjs');
const convergenceRunnerPath = path.join(here, 'run-ash-constitutional-convergence-probe.mjs');
const a2ProbePath = path.join(here, 'ash-a2-a5-browser-probe.mjs');
const a7ProbePath = path.join(here, 'ash-a7-a11-browser-probe.mjs');
const manifestPath = path.resolve(
  process.env.TD613_PROFILE_CLOSURE_FIXTURE_MANIFEST
    || path.join(repoRoot, 'artifacts', 'ash-keep-probe-runtime', 'profile-fixture-manifest.json')
);

const probeReplacements = [
  {
    label: 'profile-selected demo launch',
    from: `  await page.locator('#startDemo').click();
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Glasshouse Archive inquiry/);`,
    to: `  await page.waitForFunction(() => Boolean(window.__td613AshProfileDemos?.version));
  await page.locator('#newProfile').selectOption('political_campaign');
  assert(await page.locator('#startDemo').isEnabled(), 'Political Campaign demo did not become available.');
  await page.locator('#startDemo').click();
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Harbor City Mayoral Campaign/);`
  },
  {
    label: 'profile-demo localStorage privacy assertion',
    from: `  assert(!localValues.includes('Glasshouse Archive inquiry') && !localValues.includes('node_archive'), 'Private case material entered localStorage');`,
    to: `  assert(!localValues.includes('Harbor City Mayoral Campaign') && !localValues.includes('node_candidate'), 'Private campaign case material entered localStorage');`
  },
  {
    label: 'profile-demo reload title',
    from: `  await waitForText(page, '#caseTitle', /Glasshouse Archive inquiry/);`,
    to: `  await waitForText(page, '#caseTitle', /Harbor City Mayoral Campaign/);`
  },
  {
    label: 'qualified Route Memory successor count',
    from: `  assert(routeRecord?.entries.length === 1, 'Route Memory did not append exactly one successor entry');`,
    to: `  assert(routeRecord?.entries.length === 7, 'Profile Route Memory did not preserve six qualified entries and append one successor entry');`
  }
];

const convergenceReplacement = {
  label: 'constitutional convergence profile-selected demo launch',
  from: `const readinessReplacement = \`  await page.goto(keepUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && typeof window.TD613AshConvergence?.composition === 'function', null, { timeout: 60000 });
  report.observations.boot_readiness = {
    keep_core_ready: true,
    convergence_runtime_ready: true,
    demo_click_deferred_until_ready: true
  };
  await page.locator('#startDemo').click();
  await page.waitForFunction(() => /Glasshouse Archive/i.test(document.getElementById('caseTitle')?.textContent || ''), null, { timeout: 60000 });
  await page.waitForFunction(() => document.documentElement.dataset.ashConvergence?.includes('constitutional-convergence'), null, { timeout: 60000 });\`;`,
  to: `const readinessReplacement = \`  await page.goto(keepUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
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
  await page.evaluate(() => window.__td613AshDemoRegistry?.reconcile?.());
  await page.waitForFunction(() => {
    const button = document.getElementById('startDemo');
    return document.getElementById('newProfile')?.value === 'political_campaign'
      && window.__td613AshDemoRegistry?.snapshot?.().control_owner === 'ASH_DEMO_REGISTRY'
      && button?.dataset.ashDemoRegistryOwner === 'td613.ash.demo-registry/v0.1-a13'
      && button?.dataset.ashMethodDemoState === 'READY'
      && button.disabled === false
      && /Political Campaign/.test(button.textContent || '');
  }, null, { timeout: 60000 });
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
  await page.waitForFunction(() => document.documentElement.dataset.ashConvergence?.includes('constitutional-convergence'), null, { timeout: 60000 });\`;`
};

const a2RegistryReplacement = {
  label: 'A2-A6 registry-owned demo launch',
  from: `  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && document.getElementById('newProfile')
    && document.getElementById('startDemo'), null, { timeout:60000 });
  await page.locator('#newProfile').selectOption('political_campaign');
  await page.waitForFunction(() => !document.getElementById('startDemo')?.disabled, null, { timeout:60000 });
  await page.locator('#startDemo').click();`,
  to: `  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && Boolean(window.__td613AshDemoRegistry?.version)
    && document.getElementById('newProfile')
    && document.getElementById('startDemo'), null, { timeout:60000 });
  await page.locator('#newProfile').selectOption('political_campaign');
  await page.evaluate(() => window.__td613AshDemoRegistry?.reconcile?.());
  await page.waitForFunction(() => {
    const button = document.getElementById('startDemo');
    return document.getElementById('newProfile')?.value === 'political_campaign'
      && window.__td613AshDemoRegistry?.snapshot?.().control_owner === 'ASH_DEMO_REGISTRY'
      && button?.dataset.ashDemoRegistryOwner === 'td613.ash.demo-registry/v0.1-a13'
      && button?.dataset.ashMethodDemoState === 'READY'
      && button.disabled === false;
  }, null, { timeout:60000 });
  await page.locator('#startDemo').click();`
};

const a7HoldReplacements = [
  {
    label: 'A8 object named-owner hold copy',
    from: `  await page.waitForFunction(() => /Object held:.*CASE_BOUND required/i.test(document.getElementById('ashA8Status')?.textContent || ''), null, { timeout:30_000 });`,
    to: `  await page.waitForFunction(() => /Object held:.*(?:CASE_BOUND required|Existing Ash action owner addObject is held)/i.test(document.getElementById('ashA8Status')?.textContent || ''), null, { timeout:30_000 });`
  },
  {
    label: 'A8 relationship named-owner hold copy',
    from: `  await page.waitForFunction(() => /Relationship held:.*CASE_BOUND required/i.test(document.getElementById('ashA8Status')?.textContent || ''), null, { timeout:30_000 });`,
    to: `  await page.waitForFunction(() => /Relationship held:.*(?:CASE_BOUND required|Existing Ash action owner addRelationship is held)/i.test(document.getElementById('ashA8Status')?.textContent || ''), null, { timeout:30_000 });`
  }
];

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function isProbePrepared(source) {
  return source.includes("selectOption('political_campaign')")
    && source.includes('Harbor City Mayoral Campaign')
    && source.includes('entries.length === 7')
    && source.includes('six qualified entries')
    && !source.includes('Glasshouse Archive inquiry');
}

function isConvergencePrepared(source) {
  return source.includes("selectOption('political_campaign')")
    && source.includes('profile_demo_registry_deferred_until_selection: true')
    && source.includes('boot_readiness.profile_demo_registry_ready = true')
    && source.includes('demo_entry_convergence_deferred_until_case_hydration: true')
    && source.includes('demo_entry_api_ready_after_hydration: true')
    && source.includes('convergenceApi?.version')
    && source.includes('profile_selected_explicitly: true')
    && source.includes('window.__td613AshDemoRegistry?.reconcile?.()')
    && source.includes("control_owner === 'ASH_DEMO_REGISTRY'")
    && source.includes("button?.dataset.ashDemoRegistryOwner === 'td613.ash.demo-registry/v0.1-a13'")
    && source.includes('Harbor City Mayoral Campaign');
}

function isA2RegistryPrepared(source) {
  return source.includes('Boolean(window.__td613AshDemoRegistry?.version)')
    && source.includes('window.__td613AshDemoRegistry?.reconcile?.()')
    && source.includes("control_owner === 'ASH_DEMO_REGISTRY'")
    && source.includes("button?.dataset.ashDemoRegistryOwner === 'td613.ash.demo-registry/v0.1-a13'")
    && source.includes("button?.dataset.ashMethodDemoState === 'READY'");
}

function isA7HoldPrepared(source) {
  return source.includes('Existing Ash action owner addObject is held')
    && source.includes('Existing Ash action owner addRelationship is held');
}

function replaceExactlyOnce(source, replacement) {
  const count = source.split(replacement.from).length - 1;
  if (count !== 1) throw new Error(`Profile closure fixture requires exactly one ${replacement.label} seam; observed ${count}.`);
  return source.replace(replacement.from, replacement.to);
}

const originalProbe = (await fs.readFile(probePath, 'utf8')).replace(/\r\n/g, '\n');
let preparedProbe = originalProbe;
let probePosture = 'ALREADY_PREPARED';
if (!isProbePrepared(originalProbe)) {
  probePosture = 'PREPARED_NOW';
  for (const replacement of probeReplacements) preparedProbe = replaceExactlyOnce(preparedProbe, replacement);
}
if (!isProbePrepared(preparedProbe)) throw new Error('Profile closure fixture did not materialize every campaign-method seam.');
if (preparedProbe !== originalProbe) await fs.writeFile(probePath, preparedProbe, 'utf8');

const originalConvergenceRunner = (await fs.readFile(convergenceRunnerPath, 'utf8')).replace(/\r\n/g, '\n');
let preparedConvergenceRunner = originalConvergenceRunner;
let convergencePosture = 'ALREADY_PREPARED';
if (!isConvergencePrepared(originalConvergenceRunner)) {
  convergencePosture = 'PREPARED_NOW';
  preparedConvergenceRunner = replaceExactlyOnce(originalConvergenceRunner, convergenceReplacement);
}
if (!isConvergencePrepared(preparedConvergenceRunner)) throw new Error('Convergence profile fixture did not materialize its campaign-method seam.');
if (preparedConvergenceRunner !== originalConvergenceRunner) await fs.writeFile(convergenceRunnerPath, preparedConvergenceRunner, 'utf8');

const originalA2Probe = (await fs.readFile(a2ProbePath, 'utf8')).replace(/\r\n/g, '\n');
let preparedA2Probe = originalA2Probe;
let a2ProbePosture = 'ALREADY_PREPARED';
if (!isA2RegistryPrepared(originalA2Probe)) {
  a2ProbePosture = 'PREPARED_NOW';
  preparedA2Probe = replaceExactlyOnce(originalA2Probe, a2RegistryReplacement);
}
if (!isA2RegistryPrepared(preparedA2Probe)) throw new Error('A2-A6 witness did not materialize registry-owned demo readiness.');
if (preparedA2Probe !== originalA2Probe) await fs.writeFile(a2ProbePath, preparedA2Probe, 'utf8');

const originalA7Probe = (await fs.readFile(a7ProbePath, 'utf8')).replace(/\r\n/g, '\n');
let preparedA7Probe = originalA7Probe;
let a7ProbePosture = 'ALREADY_PREPARED';
if (!isA7HoldPrepared(originalA7Probe)) {
  a7ProbePosture = 'PREPARED_NOW';
  for (const replacement of a7HoldReplacements) preparedA7Probe = replaceExactlyOnce(preparedA7Probe, replacement);
}
if (!isA7HoldPrepared(preparedA7Probe)) throw new Error('A7-A11 witness did not materialize current A8 named-owner hold copy.');
if (preparedA7Probe !== originalA7Probe) await fs.writeFile(a7ProbePath, preparedA7Probe, 'utf8');

await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await fs.writeFile(manifestPath, `${JSON.stringify({
  schema: 'td613.ash-keep.profile-closure-fixture/v0.5-registry-and-owner-hold-readiness',
  profile: 'political_campaign',
  demo_id: 'demo_political_campaign_harbor_city_apeq_paia_v2',
  qualified_route_count: 6,
  expected_route_count_after_successor: 7,
  production_probe: {
    path: path.relative(repoRoot, probePath),
    posture: probePosture,
    source_sha256: sha256(originalProbe),
    prepared_sha256: sha256(preparedProbe),
    replacements: probeReplacements.map(item => item.label)
  },
  convergence_runner: {
    path: path.relative(repoRoot, convergenceRunnerPath),
    posture: convergencePosture,
    source_sha256: sha256(originalConvergenceRunner),
    prepared_sha256: sha256(preparedConvergenceRunner),
    replacements: [convergenceReplacement.label]
  },
  a2_a6_browser_probe: {
    path: path.relative(repoRoot, a2ProbePath),
    posture: a2ProbePosture,
    source_sha256: sha256(originalA2Probe),
    prepared_sha256: sha256(preparedA2Probe),
    replacements: [a2RegistryReplacement.label]
  },
  a7_a11_browser_probe: {
    path: path.relative(repoRoot, a7ProbePath),
    posture: a7ProbePosture,
    source_sha256: sha256(originalA7Probe),
    prepared_sha256: sha256(preparedA7Probe),
    replacements: a7HoldReplacements.map(item => item.label)
  },
  source_files_mutated_in_ephemeral_ci_checkout_only: true,
  production_product_mutated: false,
  maturity_promoted: false,
  transport_authorized: false,
  cinder_authorized: false
}, null, 2)}\n`);

console.log(`prepare-ash-profile-closure-fixture.mjs passed · probe ${probePosture} · convergence ${convergencePosture} · a2 ${a2ProbePosture} · a7 ${a7ProbePosture}`);
