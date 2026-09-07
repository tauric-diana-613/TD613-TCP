import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const legacyWitnessPath = path.join(scriptsDir, 'holonomy-loom-hosted-product-integration-browser-witness.mjs');
const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/+$/, '');
const browserName = String(process.env.TD613_BROWSER || 'chromium').toLowerCase();
const browserTypes = { chromium, firefox, webkit };
const browserType = browserTypes[browserName];
if (!browserType) throw new TypeError(`Unsupported TD613_BROWSER: ${browserName}`);
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/holonomy-loom-hosted-integration';
const route = '/dome-world/holonomy-loom.html';
const url = `${base}${route}`;
await fs.mkdir(artifactDir, { recursive: true });

const legacyArtifactPath = path.join(artifactDir, `holonomy-loom-hosted-product-integration-${browserName}.json`);
const priorExitCode = process.exitCode;
process.exitCode = 0;
await import(`${pathToFileURL(legacyWitnessPath).href}?td613_holonomy_loom_hosted_legacy_observer=${Date.now()}`);
const legacyExitCode = process.exitCode || 0;
process.exitCode = priorExitCode;

const legacy = JSON.parse(await fs.readFile(legacyArtifactPath, 'utf8'));
const expectedLegacyFailure = ['GREEN promise remains bounded'];
const legacyFailureShapeHolds = legacy.status === 'HELD'
  && legacyExitCode === 1
  && JSON.stringify(legacy.failed_checks) === JSON.stringify(expectedLegacyFailure);
const unexpectedLegacyFailures = (legacy.checks || []).filter(item => item.name !== 'GREEN promise remains bounded' && item.status !== 'PASS');

const report = {
  schema: 'td613.holonomy-loom.hosted-product-integration-browser-witness/v0.2-observer-geometry',
  status: 'OPEN',
  browser: browserName,
  route,
  source_status: 'OBSERVED',
  authority_class: 'A1_OBSERVATIONAL',
  observer_repair_scope: 'WITNESS_ONLY',
  product_bytes_mutated_by_repair: false,
  legacy_witness_preserved: true,
  legacy_observer_status: legacy.status,
  legacy_observer_failed_checks: legacy.failed_checks,
  pedagogue_relation: {
    consequence_before_ontology: true,
    visible_child_consequence_separate_from_optional_technical_projection: true,
    same_claim_family_not_same_encounter_route: true,
    authority_transferred: false
  },
  aperture_counterpoint: {
    visibility_not_identifiability: true,
    observation_surface_correction: 'DECLARED_UNRENDERED_RESULT_THEN_VISIBLE_SUMMARY_PLUS_DECLARED_CLOSED_DISCLOSURE_STATE',
    widening_or_release_authority: false
  },
  production_release_authority: false,
  provider_release_authority: false,
  human_closure_required: true,
  exogenous_witness_credit: 0,
  golden_egg_credit: 0,
  checks: [],
  page_errors: [],
  console_errors: []
};
const check = (name, pass, detail = null) => report.checks.push({ name, status: pass ? 'PASS' : 'FAIL', detail });

check('legacy observer reproduces only the preserved closed-details false negative', legacyFailureShapeHolds, {
  status: legacy.status,
  exit_code: legacyExitCode,
  failed_checks: legacy.failed_checks
});
check('all non-target legacy hostilities remain green', unexpectedLegacyFailures.length === 0, unexpectedLegacyFailures);
check('legacy witness still proves zero canary egress', legacy.request_summary?.canary_egress_count === 0, legacy.request_summary || null);
check('legacy witness still proves zero external request after interaction', legacy.request_summary?.external_request_count === 0, legacy.request_summary || null);
check('legacy witness still proves zero mutation request after interaction', legacy.request_summary?.mutation_request_count === 0, legacy.request_summary || null);

function detailsOpen(locator) {
  return locator.evaluate(node => Boolean(node.open)).catch(() => false);
}

const browser = await browserType.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, colorScheme: 'dark' });
  page.on('pageerror', error => report.page_errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') report.console_errors.push(message.text());
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  const result = page.locator('#result');
  const promise = page.locator('#promiseDisclosure');
  const promiseSummary = promise.locator('summary');
  const technicalCeiling = promise.locator('p.ceiling');

  check('hosted route loaded for observer repair', new URL(page.url()).pathname === route, page.url());
  check('technical promise remains closed before explicit action', !(await detailsOpen(promise)));
  check('result projection is intentionally unrendered before CHECK', !(await result.isVisible()));
  check('technical promise summary is not falsely treated as rendered before CHECK', !(await promiseSummary.isVisible()));
  check('technical promise body is not rendered before CHECK', !(await technicalCeiling.isVisible()));
  const declaredTechnicalText = (await technicalCeiling.textContent() || '').trim();
  check('bounded technical ceiling remains declared in DOM while result is unrendered', declaredTechnicalText.includes('GREEN means only that no enabled Loom rule fired'), declaredTechnicalText);

  await page.locator('#message').fill('ordinary bounded message');
  await page.locator('#check').click();
  await page.locator('#result.show').waitFor({ timeout: 10_000 });

  const visibleSummary = page.locator('#summary');
  check('GREEN result observed on repaired projection', (await page.locator('#statusLight').innerText()).trim() === 'GREEN');
  check('bounded child GREEN consequence is visibly rendered', await visibleSummary.isVisible());
  check('visible GREEN consequence is exact and bounded', (await visibleSummary.innerText()).trim() === 'Nothing matched the protection rules you turned on.', (await visibleSummary.innerText()).trim());
  check('technical promise summary becomes visible with the result while drawer remains closed', await promiseSummary.isVisible());
  check('technical promise body remains hidden after CHECK while drawer is closed', !(await technicalCeiling.isVisible()));
  check('checked-copy door opens only after GREEN', await page.locator('#copyChecked').isEnabled());
  check('technical promise remains optional after visible consequence', !(await detailsOpen(promise)));
  check('Rest remains visible without opening technical promise', await page.locator('#rest').isVisible());
  check('Exit remains visible without opening technical promise', await page.locator('#exitLoom').isVisible());

  await promiseSummary.click();
  check('technical promise opens only after explicit operator action', await detailsOpen(promise));
  check('technical ceiling becomes visibly rendered after explicit opening', await technicalCeiling.isVisible());
  check('opened technical promise exposes the stronger bounded sentence', (await promise.innerText()).includes('GREEN means only that no enabled Loom rule fired'));
  check('opening technical promise does not rewrite visible GREEN consequence', (await visibleSummary.innerText()).trim() === 'Nothing matched the protection rules you turned on.');

  await promiseSummary.click();
  check('technical promise can return to closed optional state', !(await detailsOpen(promise)));
  check('zero page errors in repaired observer', report.page_errors.length === 0, report.page_errors);
  const boundedConsole = report.console_errors.filter(text => !/favicon/i.test(text));
  check('zero page-owned console errors in repaired observer', boundedConsole.length === 0, report.console_errors);
} catch (error) {
  report.page_errors.push(error.stack || error.message);
  check('observer-geometry repair witness completed', false, error.message);
} finally {
  await browser.close();
}

report.failed_checks = report.checks.filter(item => item.status === 'FAIL').map(item => item.name);
report.status = report.failed_checks.length === 0 ? 'PASS' : 'HELD';
const artifactPath = path.join(artifactDir, `holonomy-loom-hosted-product-integration-v02-${browserName}.json`);
await fs.writeFile(artifactPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Holonomy Loom hosted product integration browser witness v0.2 (${browserName}): ${report.status}`);
console.log(JSON.stringify({ status: report.status, browser: browserName, failed: report.failed_checks, artifact: artifactPath }, null, 2));
if (report.status !== 'PASS') process.exitCode = 1;
