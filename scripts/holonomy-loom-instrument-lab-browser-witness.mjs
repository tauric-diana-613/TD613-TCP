/** Actual local interface; provider replies are intercepted fixtures. No human
 * comprehension, foreign origin, hardware or empirical acquisition claim. */
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
    res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
    res.end(body);
  } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const report = {
  schema: 'td613.loom.instrument-lab-browser-witness/v0.1', status: 'HELD',
  source_sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  working_tree_dirty: Boolean(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()),
  scope: 'REAL_LOCAL_UI_MOCK_PROVIDER', live_provider_calls: 0,
  physical_device_observed: false, human_comprehension_measured: false, checks: [], failures: []
};
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const [posture, viewport] of [['desktop', { width: 1280, height: 900 }], ['portrait-390', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', acceptDownloads: true });
    const page = await context.newPage(); page.setDefaultTimeout(12000);
    const errors = [], posts = []; let releaseReply;
    page.on('pageerror', error => errors.push(error.message));
    await context.route('**/api/**', async route => {
      const req = route.request();
      if (req.method() === 'GET') return route.fulfill({ json: { ok: true, hasProviderKey: true } });
      assert.ok(req.url().includes('operation=loom-task'), 'only the explicit mocked model route may be called');
      const input = req.postDataJSON(); posts.push({ url: req.url(), body: input });
      await new Promise(resolve => { releaseReply = resolve; });
      await route.fulfill({ json: {
        schema: 'td613.loom.ai-task-result/v0.1', request_id: input.request_id, status: 'completed',
        answer: 'Bounded fixture answer. Independent evidence remains missing.', used_document_ids: [],
        missing_information: ['Independent observation missing.'], suggested_next_step: 'Review the packet.'
      } });
    });
    try {
      await page.goto(base + '/dome-world/holonomy-loom.html', { waitUntil: 'networkidle' });
      assert.equal(await page.locator('#loomLegacy').evaluate(node => node.open), false);
      assert.equal(await page.locator('#aiRuntimeState').count(), 1);
      assert.equal(await page.locator('.lr-world, .lr-courier, #ilState, #loomObserverChamber, #loomTheater, #loomPracticeFixtures').count(), 0);
      assert.equal(await page.locator('#aiLivingRoom').evaluate(node => node.hidden && node.childElementCount === 0), true);
      await page.waitForFunction(() => document.querySelector('#aiRuntimeState')?.dataset.clientPhase === 'prepared');
      await page.locator('#loomLegacy > summary').focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('#loomInstrumentLab details').count(), 0, 'the Lab has one flat measurement selector');
      assert.equal(await page.locator('#ilBench').inputValue(), 'disclosure');
      await page.locator('#ilPractice').click(); assert.equal(posts.length, 0);
      await page.locator('#ilRun').focus(); await page.keyboard.press('Enter');
      await page.locator('#ilFinding').waitFor({ state: 'visible' });
      assert.equal(JSON.parse(await page.locator('#ilReceipt').textContent()).authority.execution, false);
      await page.locator('#ilBench').selectOption('information-gain'); await page.locator('#ilPractice').click(); await page.locator('#ilRun').click();
      await page.locator('#ilFinding').waitFor({ state: 'visible' });
      assert.match(await page.locator('#ilFinding').innerText(), /1\.000000 bits/);
      const quick = await page.locator('#ilReceipt').textContent();
      assert.equal(await page.locator('#ilExact').isVisible(), false);
      await page.locator('#ilDeep').click(); assert.equal(await page.locator('#ilExact').isVisible(), true);
      assert.equal(await page.locator('#ilReceipt').textContent(), quick);
      await page.locator('#ilQuick').click(); assert.equal(await page.locator('#ilExact').isVisible(), false);
      const downloadReady = page.waitForEvent('download'); await page.locator('#ilSave').click();
      await (await downloadReady).saveAs(path.join(dir, posture + '-assay.json'));
      const receipt = JSON.parse(await fs.readFile(path.join(dir, posture + '-assay.json'), 'utf8'));
      assert.equal(receipt.authority.admission, false);
      await page.locator('#ilInput').fill('{broken'); assert.equal(await page.locator('#ilResult').isVisible(), false);
      await page.locator('#ilRun').click(); await page.waitForFunction(() => document.querySelector('#ilStatus').textContent.includes('Input held'));
      await page.locator('#ilBench').selectOption('custody'); await page.locator('#ilCustody').click();
      assert.equal(JSON.parse(await page.locator('#ilCustodyReceipt').textContent()).lab_admission_authority, false);
      await page.locator('#ilBench').selectOption('receiver-substitution'); assert.equal(await page.locator('#ilInput').inputValue(), '');
      await page.locator('#loomInstrumentLab').screenshot({ path: path.join(dir, posture + '-lab.png') });
      await page.locator('#loomLegacy > summary').click();
      await page.locator('#aiTask').fill('Prepare one bounded test.'); await page.locator('#aiRuntimeProfile').selectOption('quick'); await page.locator('#aiRun').click();
      await page.waitForFunction(() => document.querySelector('#aiRuntimeState')?.dataset.clientPhase === 'pending');
      assert.equal(posts.length, 1); assert.ok(posts[0].url.endsWith('profile=quick'));
      assert.deepEqual(Object.keys(posts[0].body).sort(), ['documents', 'request_id', 'rules', 'schema', 'task']);
      await page.locator('#aiStillField').click(); assert.equal(await page.locator('#aiStillField').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('#aiRuntimeState').getAttribute('data-client-phase'), 'pending');
      await page.locator('#aiInspector > summary').focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('#aiInspector').evaluate(node => node.open), true);
      releaseReply(); await page.waitForFunction(() => document.querySelector('#aiRuntimeState')?.dataset.clientPhase === 'completed');
      assert.equal(await page.locator('#aiInspector > summary').evaluate(node => document.activeElement === node), true, 'an asynchronous phase transition preserves the operator’s inspection focus');
      assert.equal(await page.locator('#aiInspector').evaluate(node => node.open), true);
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#aiRuntimeState').getAttribute('data-reduced-motion'), 'true');
      assert.equal(await page.locator('#aiRuntimeState [data-instrument-active-glyph]').textContent(), 'hõt');
      await page.locator('#aiRuntimeState').screenshot({ path: path.join(dir, posture + '-runtime-completed.png') });
      await page.locator('#aiRoomReplay').click();
      await page.waitForFunction(() => document.querySelector('#aiRuntimeState')?.dataset.clientPhase === 'checking');
      assert.equal(await page.locator('#aiRuntimeState [data-instrument-active-glyph]').textContent() === 'hõt', false, 'replay cannot borrow a later answer');
      await page.locator('#aiRoomLive').click();
      await page.waitForFunction(() => document.querySelector('#aiRuntimeState')?.dataset.clientPhase === 'completed');
      await page.locator('#aiStillField').click(); assert.equal(posts.length, 1, 'rest, replay and resume dispatch no provider calls');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('#loomLegacy').evaluate(node => node.open), false);
      assert.equal(await page.locator('#aiPortableMode').getAttribute('aria-selected'), 'true');
      await page.locator('#aiDemoMode').click(); assert.equal(await page.locator('#aiRuntimeState').count(), 1);
      await page.locator('#aiPortableMode').click(); assert.equal(await page.locator('#aiRuntimeState').count(), 1);
      assert.deepEqual(errors, []);
      report.checks.push({ posture, width: viewport.width, status: 'PASS', explicit_keyboard_entrance: true,
        closed_default: true, single_primary_state: true, legacy_scene_absent: true, flat_measurement_bench: true,
        practice_inert: true, positive_information_gain: true, exact_receipt_profile_invariance: true,
        pending_completion_survives_rest: true, incoming_phase_preserves_inspection_focus: true, replay_does_not_borrow_answer: true, custody_read_only: true,
        stale_result_revoked: true, route_switching: true, reload: true, no_horizontal_overflow: true,
        runtime_errors: 0, intercepted_model_requests: posts.length });
    } catch (error) {
      report.failures.push({ posture, error: error.stack, workspace: await page.locator('#aiStatus').textContent(),
        projection: await page.locator('#aiRuntimeState').getAttribute('data-projection-state'),
        phase: await page.locator('#aiRuntimeState').getAttribute('data-client-phase') });
      await page.screenshot({ path: path.join(dir, posture + '-failure.png'), fullPage: true });
    } finally { releaseReply?.(); await context.close(); }
  }
  report.status = report.failures.length ? 'HELD' : 'PASS';
} finally {
  await browser?.close(); await new Promise(resolve => server.close(resolve));
  await fs.writeFile(path.join(dir, 'witness.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report)); if (report.status !== 'PASS') process.exitCode = 1;
