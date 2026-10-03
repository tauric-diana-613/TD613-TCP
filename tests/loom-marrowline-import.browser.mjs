/** Compatibility entry point for the current native Marrowline route witness.
 * The standalone #loomImportedWorkspace receiver was retired. Reuse the canonical
 * route battery so import, provider exclusion, exact continuation history, HELD
 * returns and ordinary direct entry cannot drift between two browser fixtures.
 * TD613_BROWSER selects the installed Playwright engine; Chromium is the default.
 * All provider/custody replies remain intercepted: this is local browser evidence,
 * with no live provider, real custody, physical-device or comprehension claim.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const engine = process.env.TD613_BROWSER || 'chromium';
process.env.TD613_ARTIFACT_DIR ||= `artifacts/loom-marrowline-import/${engine}`;
const dir = path.resolve(process.env.TD613_ARTIFACT_DIR);

await import('../scripts/holonomy-loom-instrument-route-browser-witness.mjs');
const witness = JSON.parse(await fs.readFile(path.join(dir, 'witness.json'), 'utf8'));
const report = {
  ...witness,
  schema: 'td613.loom.marrowline-import-browser-witness/v0.6-native-route',
  entry_point: 'tests/loom-marrowline-import.browser.mjs',
  canonical_witness: 'scripts/holonomy-loom-instrument-route-browser-witness.mjs',
  canonical_artifact: 'witness.json',
  workflow_run_id: process.env.GITHUB_RUN_ID || null,
  run_attempt: process.env.GITHUB_RUN_ATTEMPT || null,
  checks: witness.viewports.flatMap(({ name, checks }) => checks.map(check => ({ viewport: name, check }))),
  retired_fixture: 'standalone imported receiver',
  supplemental_attachment_chrome_observed: false
};
await fs.writeFile(path.join(dir, 'receipt.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.status, engine: report.engine, checks: report.checks.length, receipt: path.join(dir, 'receipt.json') }, null, 2));
if (report.status !== 'PASS_LOCAL_BROWSER_SCOPE') process.exitCode = 1;
