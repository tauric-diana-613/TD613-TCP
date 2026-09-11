import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium, firefox, webkit } from 'playwright';

// A bounded repository browser test, separate from the operator's live browser.
const engine = process.env.TD613_BROWSER || 'chromium';
const type = { chromium, firefox, webkit }[engine];
if (!type) throw new TypeError('Unknown browser engine');
const base = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw new TypeError('This witness accepts local test servers only.');
const dir = process.env.TD613_ARTIFACT_DIR || `artifacts/loom-portable-audit/${engine}`;
await fs.mkdir(dir, { recursive: true });
const report = { schema: 'td613.loom.portable-browser-witness/v0.1', engine,
  source_sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  working_tree_dirty: execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim().length > 0,
  observed_at: new Date().toISOString(), status: 'HELD', checks: [], failures: [],
  context: 'LOCAL_SYNTHETIC_BROWSER_WITNESS', interaction_scope: 'LOCAL_RULE_LABORATORY', provider_calls: 0, external_host_observed: false,
  human_comprehension_measured: false, release_authority: false };
let instance;
try {
  instance = await type.launch({ headless: true, ...(engine === 'chromium' ? { executablePath: type.executablePath() } : {}) });
  for (const [posture, width, height, reduced] of [['desktop', 1280, 900, false], ['mobile-reduced', 390, 844, true]]) {
    const page = await instance.newPage({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    page.setDefaultTimeout(10000);
    const unexpected = [], errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      const u = new URL(request.url());
      if (u.origin !== new URL(base).origin || !['GET', 'HEAD'].includes(request.method()) || u.pathname.startsWith('/api/')) unexpected.push(request.url());
    });
    try {
      await page.goto(`${base}/dome-world/holonomy-loom.html`, { waitUntil: 'networkidle' });
      const laboratory = page.locator('#loomLegacy');
      assert.equal(await laboratory.evaluate(node => node.open), false, 'legacy laboratory starts optional and closed');
      await laboratory.locator(':scope > summary').click();
      assert.equal(await laboratory.evaluate(node => node.open), true, 'explicitly open local laboratory before its witness');
      const clientFixture = page.locator('#ltLoadClient');
      await clientFixture.waitFor({ state: 'visible' });
      assert.equal(await clientFixture.isVisible(), true, 'client fixture outside closed receipts');
      await page.locator('#message').fill('PRIVATE_CHECKER_CANARY_613');
      await page.getByRole('button', { name: 'Scene 5: A warning is not a discovery', exact: true }).click();
      await page.locator('#lpStart').click();
      await page.getByRole('button', { name: 'Inspect permitted actions', exact: true }).click();
      assert.match(await page.locator('#lpAnswer').innerText(), /teaching model/);
      const original = JSON.parse(await page.locator('#lpCandidate').inputValue());
      assert.ok(!JSON.stringify(original).includes('PRIVATE_CHECKER_CANARY_613'));
      await page.locator('#lpReturn').click();
      assert.equal(await page.locator('#ltPortableWorkbench').getAttribute('data-return-status'), 'PRESENT_TO_HUMAN');
      assert.equal(await page.locator('#loomTheater').getAttribute('data-pending-frames'), '0');
      await page.locator('#ltPortableWorkbench').screenshot({ path: path.join(dir, `${posture}-accepted.png`) });
      await page.locator('#lpReceiver').selectOption('child');
      assert.equal(await page.locator('#lpReturn').isDisabled(), true);
      assert.match(await page.locator('#lpProjection').innerText(), /pause and look closer/);
      await page.getByRole('button', { name: 'Request structural rest', exact: true }).click();
      await page.locator('#lpAlter').click();
      assert.equal(await page.locator('#ltPortableWorkbench').getAttribute('data-return-status'), 'HOLD');
      assert.match(await page.locator('#lpChecks').innerText(), /COPY_CHECKED_MESSAGE/);
      await page.locator('#ltPortableWorkbench').screenshot({ path: path.join(dir, `${posture}-held.png`) });
      await page.getByText('Inspect / carry / return', { exact: true }).click();
      const forged = { ...original, source_receiver: 'child', operation: 'DEPLOY' };
      await page.locator('#lpCandidate').fill(JSON.stringify(forged));
      await page.locator('#lpImport').click();
      assert.equal(await page.locator('#ltPortableWorkbench').getAttribute('data-return-status'), 'HOLD');
      assert.match(await page.locator('#lpVerdict').innerText(), /declared Portable AIA operation/);
      await page.getByRole('button', { name: 'Scene 3: This thread stays here', exact: true }).click();
      assert.equal(await page.locator('#lpSession').isVisible(), false);
      await page.locator('#lpStart').click();
      // Disclosure state is preserved within a scene change, but input is cleared.
      if (!(await page.locator('#lpCandidate').isVisible())) await page.getByText('Inspect / carry / return', { exact: true }).click();
      await page.locator('#lpCandidate').fill(JSON.stringify(original)); await page.locator('#lpImport').click();
      assert.equal(await page.locator('#ltPortableWorkbench').getAttribute('data-return-status'), 'HOLD');
      await page.getByRole('button', { name: 'Request structural rest', exact: true }).click();
      await page.locator('#lpApplyRest').click();
      assert.equal(await page.locator('#ltPortableWorkbench').getAttribute('data-governor-status'), 'REST');
      assert.match(await page.locator('#lpVerdict').innerText(), /Rest applied here/);
      assert.equal(await page.locator('[data-lp-operation="PROPOSE_ACTION"]').isDisabled(), true);
      await page.locator('#lpResume').click();
      assert.equal(await page.locator('#ltPortableWorkbench').getAttribute('data-governor-status'), 'ACTIVE');
      await page.locator('#lpExit').click();
      assert.equal(await page.locator('#lpSession').isVisible(), false);
      assert.equal(await page.locator('#loomTheater').getAttribute('data-pending-frames'), '0');
      const overflows = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflows, false, 'no horizontal page overflow');
      assert.deepEqual(errors, [], 'no browser runtime errors'); assert.deepEqual(unexpected, [], 'no provider/mutation/external requests');
      report.checks.push({ posture, status: 'PASS', receiver_change: true, explicit_return: true, hostile_return_held: true,
        missing_authority: true, stale_return_held: true, private_checker_text_excluded: true, rest: true,
        no_horizontal_overflow: true, reduced_motion: reduced, runtime_errors: errors.length });
    } catch (error) {
      report.failures.push({ posture, error: error.stack });
      await page.screenshot({ path: path.join(dir, `${posture}-failure.png`), fullPage: true });
    } finally { await page.close(); }
  }
  report.status = report.failures.length ? 'HELD' : 'PASS';
} catch (error) {
  report.failures.push({ posture: 'browser-infrastructure', error: error.stack });
} finally {
  await instance?.close();
  await fs.writeFile(path.join(dir, 'receipt.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report));
if (report.status !== 'PASS') process.exitCode = 1;