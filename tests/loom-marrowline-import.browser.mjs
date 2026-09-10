/** Real local UI navigation, mocked provider endpoint. No live Gemini quality claim. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium, firefox, webkit } from 'playwright';
import { LOOM_AI_PROJECTS } from '../app/dome-world/holonomy-loom/ai-projects.js';

const engine = process.env.TD613_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[engine];
if (!browserType) throw new TypeError('Unknown witness browser engine');
const base = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new TypeError('Marrowline import witness requires a local server.');
const dir = process.env.TD613_ARTIFACT_DIR || `artifacts/loom-marrowline-import/${engine}`;
await fs.mkdir(dir, { recursive: true });
const report = { schema: 'td613.loom.marrowline-import-browser-witness/v0.1', engine, status: 'HELD',
  source_sha: process.env.TD613_SOURCE_HEAD || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  checkout_sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  workflow_run_id: process.env.GITHUB_RUN_ID || null, run_attempt: process.env.GITHUB_RUN_ATTEMPT || null,
  working_tree_dirty: Boolean(execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim()),
  observed_at: new Date().toISOString(), context: 'REAL_LOCAL_UI_NAVIGATION_WITH_MOCK_PROVIDER_RESPONSE',
  live_provider_calls: 0, intercepted_task_requests: 0, external_host_observed: false, human_comprehension_measured: false,
  checks: [], failures: [] };
const project = LOOM_AI_PROJECTS[0];
const shared = project.documents.filter(document => document.share).map(({ id, name, text }) => ({ id, name, text }));
const uploadCanary = 'LOCAL_UPLOAD_HANDOFF_CANARY_613';
const mockAnswer = '[MOCK PROVIDER RESPONSE — MARROWLINE UI WITNESS] Vendor comparison retained. <img src=x onerror="window.loomInjected=true">';
let browser;
try {
  browser = await browserType.launch({ headless: true, ...(engine === 'chromium' ? { executablePath: browserType.executablePath() } : {}) });
  for (const [posture, viewport, reducedMotion] of [['desktop', { width: 1280, height: 900 }, 'no-preference'], ['mobile-reduced', { width: 390, height: 844 }, 'reduce']]) {
    const page = await browser.newPage({ viewport, reducedMotion, acceptDownloads: true });
    page.setDefaultTimeout(12000);
    const calls = [], errors = [], unexpected = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      const url = new URL(request.url());
      if (!['GET', 'HEAD'].includes(request.method()) && !(url.pathname === '/api/khonapolit' && url.searchParams.get('operation') === 'loom-task')) unexpected.push({ method: request.method(), url: request.url() });
      if (url.hostname === 'generativelanguage.googleapis.com') unexpected.push({ direct_provider_request: request.url() });
    });
    await page.route(url => url.pathname === '/api/khonapolit' && url.searchParams.get('operation') === 'loom-task', async route => {
      const request = route.request();
      assert.equal(request.method(), 'POST'); assert.match(request.headers()['content-type'], /application\/json/);
      const input = request.postDataJSON(); calls.push(input); report.intercepted_task_requests++;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        schema: 'td613.loom.ai-task-result/v0.1', request_id: input.request_id, status: 'completed',
        answer: mockAnswer, missing_information: ['Signed retention amendment'], used_document_ids: input.documents.map(document => document.id),
        suggested_next_step: 'Review the supplied retention clauses before a pilot.',
        observations: { model: 'MOCK_PROVIDER_UI_WITNESS', elapsed_ms: 31, provider_calls: 1, source_claims: 'model-reported-unverified' }
      }) });
    });
    try {
      const loaded = await page.goto(`${base}/dome-world/holonomy-loom.html`, { waitUntil: 'networkidle' });
      assert.equal(loaded.status(), 200);
      await page.locator('#aiProjectChoices button').first().click();
      await page.locator('#aiUpload').setInputFiles({ name: 'handoff-local.txt', mimeType: 'text/plain', buffer: Buffer.from(uploadCanary) });
      const localChoice = page.getByRole('checkbox', { name: 'Share handoff-local.txt with Gemini', exact: true });
      await localChoice.waitFor({ state: 'visible' }); assert.equal(await localChoice.isChecked(), false);
      assert.equal(calls.length, 0);
      await page.locator('#aiPreparePortable').click();
      await page.waitForFunction(() => document.querySelector('#aiMarrowline')?.disabled === false);
      assert.equal(calls.length, 0, 'preparing portable task makes zero provider requests');
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#aiExport').click();
      const download = await downloadPromise; const stream = await download.createReadStream();
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      const exported = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      assert.equal(exported.schema, 'td613.loom.portable-task/v0.1'); assert.deepEqual(exported.documents, shared);
      assert.equal(exported.governance.verification.all_invariants_preserved, true);
      assert.equal(exported.governance.projections.length, 4);
      assert.equal(exported.governance.withheld_document_count, project.documents.filter(document => !document.share).length + 1);
      await page.locator('#aiMarrowline').click();
      await page.waitForURL(url => url.pathname === '/dome-world/marrowline.html');
      await page.locator('#loomImportedTask').waitFor({ state: 'visible' });
      assert.equal(new URL(page.url()).hash, '', 'opaque token consumed and removed from destination URL');
      assert.equal(await page.locator('#loomImportedTask').inputValue(), project.task);
      assert.equal(await page.locator('#loomImportedTask').getAttribute('readonly'), '', 'governed task stays bound at receiver');
      assert.equal(calls.length, 0, 'arrival makes zero provider requests');
      assert.equal(await page.locator('html').getAttribute('data-loom-task-import'), 'active');
      assert.equal(await page.locator('.terminal-layout').isVisible(), false, 'imported task owns its workspace without relay composer overlap');
      assert.equal(await page.locator('.mobile-dock').isVisible(), false, 'relay dock cannot cover the imported task');
      const destinationText = await page.locator('#loomImportedWorkspace').textContent();
      assert.equal(destinationText.includes(uploadCanary), false);
      for (const term of project.protectedTerms) assert.equal(destinationText.includes(term), false, 'private term omitted from destination');
      for (const document of shared) assert.equal(destinationText.includes(document.text), true, 'selected documents arrive intact');
      await page.locator('#loomImportedWorkspace').screenshot({ path: path.join(dir, `${posture}-imported-before-request.png`) });
      await page.locator('#loomImportedRun').click();
      await page.waitForFunction(expected => document.querySelector('#loomImportedAnswer')?.textContent.includes(expected), mockAnswer);
      assert.equal(calls.length, 1, 'one deliberate imported Run makes one POST');
      assert.deepEqual(Object.keys(calls[0]).sort(), ['schema', 'request_id', 'task', 'documents', 'rules'].sort());
      assert.equal(calls[0].schema, 'td613.loom.ai-task/v0.1'); assert.equal(calls[0].task, project.task);
      assert.deepEqual(calls[0].documents, shared); assert.deepEqual(calls[0].rules, project.rules);
      const wire = JSON.stringify(calls[0]);
      for (const term of project.protectedTerms) assert.equal(wire.includes(term), false);
      assert.equal(wire.includes(uploadCanary), false); assert.equal(Object.hasOwn(calls[0], 'governance'), false, 'local control stays outside strict provider input');
      assert.equal(await page.locator('#loomImportedAnswer img').count(), 0, 'model markup remains inert text');
      await page.locator('#loomImportedReceiptDetails > summary').click();
      assert.equal(await page.locator('#loomImportedReceipt').isVisible(), true, 'open the actual receipt disclosure before inspection');
      const receipt = JSON.parse(await page.locator('#loomImportedReceipt').innerText());
      assert.deepEqual(receipt.governance.control, exported.governance, 'same governed state survives destination change');
      assert.equal(receipt.governance.last_admission.fadt.all_fibres_exact, true);
      assert.equal(receipt.governance.latest.allowed, true);
      await page.locator('#loomImportedWorkspace').screenshot({ path: path.join(dir, `${posture}-mock-response-admitted.png`) });
      await page.locator('#loomImportedRest').click();
      await page.waitForFunction(() => document.querySelector('#loomImportedRest')?.textContent.includes('Resume'));
      await page.locator('#loomImportedRun').click();
      await page.waitForFunction(() => !document.querySelector('#loomImportedRun')?.disabled && /held/i.test(document.querySelector('#loomImportedWorkspace [role=status]')?.textContent || ''));
      assert.equal(calls.length, 1, 'REST prevents another provider request');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'destination fits viewport');
      assert.deepEqual(errors, [], 'no page runtime errors'); assert.deepEqual(unexpected, [], 'no unrelated mutations or direct provider calls');
      report.checks.push({ posture, status: 'PASS', actual_ui_handoff: true, document_upload_local_only: true, opaque_url_consumed: true,
        arrival_calls: 0, explicit_run_calls: 1, control_conserved: true, fadt_admission: true, response_inert: true,
        rest_prevents_request: true, source_bytes_excluded: true, reduced_motion: reducedMotion, no_horizontal_overflow: true });
    } catch (error) {
      report.failures.push({ posture, error: error.stack });
      await page.screenshot({ path: path.join(dir, `${posture}-failure.png`), fullPage: true }).catch(() => {});
    } finally { await page.close(); }
  }
  report.status = report.failures.length ? 'HELD' : 'PASS';
} catch (error) { report.failures.push({ posture: 'browser-infrastructure', error: error.stack }); }
finally { await browser?.close(); await fs.writeFile(path.join(dir, 'receipt.json'), JSON.stringify(report, null, 2) + '\n'); }
console.log(JSON.stringify(report));
if (report.status !== 'PASS') process.exitCode = 1;
