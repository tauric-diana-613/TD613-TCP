import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, '..');
const probePath = path.join(here, 'ash-keep-production-probe.mjs');
const convergenceRunnerPath = path.join(here, 'run-ash-constitutional-convergence-probe.mjs');
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
  to: `const readinessReplacement = \`  await page.goto(keepUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && typeof window.TD613AshConvergence?.composition === 'function'
    && window.__td613AshProfileDemos?.profiles?.includes('political_campaign'), null, { timeout: 60000 });
  report.observations.boot_readiness = {
    keep_core_ready: true,
    convergence_runtime_ready: true,
    profile_demo_registry_ready: true,
    demo_click_deferred_until_ready: true,
    profile_selected_explicitly: true
  };
  await page.locator('#newProfile').selectOption('political_campaign');
  await page.waitForFunction(() => !document.getElementById('startDemo')?.disabled
    && /Political Campaign/.test(document.getElementById('startDemo')?.textContent || ''), null, { timeout: 60000 });
  await page.locator('#startDemo').click();
  await page.waitForFunction(() => /Harbor City Mayoral Campaign/i.test(document.getElementById('caseTitle')?.textContent || ''), null, { timeout: 60000 });
  await page.waitForFunction(() => document.documentElement.dataset.ashConvergence?.includes('constitutional-convergence'), null, { timeout: 60000 });\`;`
};

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
    && source.includes('profile_demo_registry_ready: true')
    && source.includes('profile_selected_explicitly: true')
    && source.includes("window.__td613AshProfileDemos?.profiles?.includes('political_campaign')")
    && source.includes('Harbor City Mayoral Campaign');
}

function replaceExactlyOnce(source, replacement) {
  const count = source.split(replacement.from).length - 1;
  if (count !== 1) {
    throw new Error(`Profile closure fixture requires exactly one ${replacement.label} seam; observed ${count}.`);
  }
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

await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await fs.writeFile(manifestPath, `${JSON.stringify({
  schema: 'td613.ash-keep.profile-closure-fixture/v0.3-apeq-paia',
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
  source_files_mutated_in_ephemeral_ci_checkout_only: true,
  production_product_mutated: false,
  maturity_promoted: false,
  transport_authorized: false,
  cinder_authorized: false
}, null, 2)}\n`);

console.log(`prepare-ash-profile-closure-fixture.mjs passed · probe ${probePosture} · convergence ${convergencePosture}`);
