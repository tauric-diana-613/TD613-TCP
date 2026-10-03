/** Standalone Loom Instrument Lab witness.
 * Actual local interface, synthetic inputs only. The Lab is intentionally
 * separate from the primary Loom route and grants no provider, admission,
 * release, exteriority, hardware, or human-comprehension authority.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const appRoot = path.resolve('app');
const dir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/loom-instrument-lab-browser');
await fs.mkdir(dir, { recursive: true });

const server = http.createServer(async (req, res) => {
  try {
    const file = path.resolve(appRoot, '.' + new URL(req.url, 'http://localhost').pathname);
    if (!file.startsWith(appRoot + path.sep)) throw new Error('invalid static path');
    const body = await fs.readFile(file);
    res.setHeader('Content-Type', ({
      '.js': 'text/javascript',
      '.html': 'text/html',
      '.css': 'text/css',
      '.svg': 'image/svg+xml'
    })[path.extname(file)] || 'application/octet-stream');
    res.end(body);
  } catch {
    res.statusCode = 404;
    res.end();
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const report = {
  schema: 'td613.loom.instrument-lab-browser-witness/v0.2',
  status: 'HELD',
  source_sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  working_tree_dirty: Boolean(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()),
  scope: 'REAL_LOCAL_STANDALONE_LAB_SYNTHETIC_INPUT',
  live_provider_calls: 0,
  physical_device_observed: false,
  human_comprehension_measured: false,
  primary_loom_route_measured_here: false,
  checks: [],
  failures: []
};

let browser;
try {
  browser = await chromium.launch({ headless: true });

  for (const [posture, viewport] of [
    ['desktop', { width: 1280, height: 900 }],
    ['portrait-390', { width: 390, height: 844 }]
  ]) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: 'reduce',
      acceptDownloads: true
    });
    const page = await context.newPage();
    page.setDefaultTimeout(12000);

    const errors = [];
    const apiRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    await context.route('**/api/**', async route => {
      apiRequests.push({ method: route.request().method(), url: route.request().url() });
      await route.abort();
    });

    try {
      const loaded = await page.goto(base + '/dome-world/loom-instrument-lab.html', { waitUntil: 'networkidle' });
      assert.equal(loaded.status(), 200);
      await page.locator('#loomInstrumentLab').waitFor({ state: 'visible' });

      assert.equal(await page.locator('#loomLegacy').count(), 0, 'standalone Lab contains no nested legacy disclosure');
      assert.equal(await page.locator('#aiRuntimeState').count(), 0, 'primary Loom runtime is not duplicated inside the Lab');
      assert.equal(await page.locator('a[href="/dome-world/holonomy-loom.html"]').isVisible(), true, 'Lab exposes an explicit route back to Loom');
      assert.equal(await page.locator('#loomInstrumentLab details').count(), 0, 'the Lab keeps one flat measurement selector');

      assert.equal(await page.locator('#ilBench').inputValue(), 'disclosure');
      await page.locator('#ilPractice').click();
      assert.equal(apiRequests.length, 0, 'loading a synthetic practice input performs no provider call');

      await page.locator('#ilRun').focus();
      await page.keyboard.press('Enter');
      await page.locator('#ilFinding').waitFor({ state: 'visible' });
      assert.equal(JSON.parse(await page.locator('#ilReceipt').textContent()).authority.execution, false);

      await page.locator('#ilBench').selectOption('information-gain');
      await page.locator('#ilPractice').click();
      await page.locator('#ilRun').click();
      await page.locator('#ilFinding').waitFor({ state: 'visible' });
      assert.match(await page.locator('#ilFinding').innerText(), /1\.000000 bits/);

      const quick = await page.locator('#ilReceipt').textContent();
      assert.equal(await page.locator('#ilExact').isVisible(), false);
      await page.locator('#ilDeep').click();
      assert.equal(await page.locator('#ilExact').isVisible(), true);
      assert.equal(await page.locator('#ilReceipt').textContent(), quick, 'inspection depth does not mutate the assay receipt');
      await page.locator('#ilQuick').click();
      assert.equal(await page.locator('#ilExact').isVisible(), false);

      const downloadReady = page.waitForEvent('download');
      await page.locator('#ilSave').click();
      const download = await downloadReady;
      const assayPath = path.join(dir, posture + '-assay.json');
      await download.saveAs(assayPath);
      const receipt = JSON.parse(await fs.readFile(assayPath, 'utf8'));
      assert.equal(receipt.authority.admission, false);

      await page.locator('#ilInput').fill('{broken');
      assert.equal(await page.locator('#ilResult').isVisible(), false, 'editing revokes the stale result');
      await page.locator('#ilRun').click();
      await page.waitForFunction(() => document.querySelector('#ilStatus')?.textContent.includes('Input held'));

      await page.locator('#ilBench').selectOption('custody');
      await page.locator('#ilCustody').click();
      assert.equal(JSON.parse(await page.locator('#ilCustodyReceipt').textContent()).lab_admission_authority, false);

      await page.locator('#ilBench').selectOption('receiver-substitution');
      assert.equal(await page.locator('#ilInput').inputValue(), '', 'changing instruments clears stale declared input');

      await page.locator('#loomInstrumentLab').screenshot({ path: path.join(dir, posture + '-lab.png') });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'standalone Lab has no horizontal overflow');
      assert.equal(apiRequests.length, 0, 'all Lab assays remain local');
      assert.deepEqual(errors, []);

      report.checks.push({
        posture,
        width: viewport.width,
        status: 'PASS',
        standalone_route: true,
        nested_legacy_absent: true,
        primary_runtime_not_duplicated: true,
        explicit_return_to_loom: true,
        flat_measurement_bench: true,
        practice_inert: true,
        positive_information_gain: true,
        exact_receipt_profile_invariance: true,
        custody_read_only: true,
        stale_result_revoked: true,
        no_horizontal_overflow: true,
        runtime_errors: 0,
        provider_requests: apiRequests.length
      });
    } catch (error) {
      report.failures.push({
        posture,
        error: error.stack,
        url: page.url(),
        lab_present: await page.locator('#loomInstrumentLab').count()
      });
      await page.screenshot({ path: path.join(dir, posture + '-failure.png'), fullPage: true });
    } finally {
      await context.close();
    }
  }

  report.status = report.failures.length ? 'HELD' : 'PASS';
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  await fs.writeFile(path.join(dir, 'witness.json'), JSON.stringify(report, null, 2) + '\n');
}

console.log(JSON.stringify(report));
if (report.status !== 'PASS') process.exitCode = 1;
