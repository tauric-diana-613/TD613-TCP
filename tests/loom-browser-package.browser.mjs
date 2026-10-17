/** Real Chromium witness of the prepared-session export and clipboard route.
 * Provider POSTs are blocked. Finite fixture computation is witnessed in the
 * actual browser, then independently rerun from the extracted download in Node.
 * A simulated phone viewport supplies no physical-device evidence.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const classic = process.env.TD613_LOOM_PRESENTATION === 'classic79';
const entry = classic ? 'holonomy-loom-classic79.html' : 'holonomy-loom.html';
const suffix = classic ? '-classic79' : '';
const sha = value => createHash('sha256').update(value).digest('hex');
const checkout = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const dir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/loom-browser-package');
await fs.mkdir(dir, { recursive: true });
let server, base = process.env.TD613_BASE_URL;
if (!base) {
  const app = path.resolve('app');
  server = http.createServer(async (request, response) => {
    try {
      const file = path.resolve(app, '.' + new URL(request.url, 'http://localhost').pathname);
      if (request.method !== 'GET' || !file.startsWith(app + path.sep)) throw Error('Invalid static request');
      response.setHeader('Content-Type', ({ '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
      response.end(await fs.readFile(file));
    } catch { response.statusCode = 404; response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
}
base = base.replace(/\/$/, '');
const local = ['127.0.0.1', 'localhost'].includes(new URL(base).hostname);
const publicFact = 'PUBLIC-FICTIONAL-WORKSHOP-FACT-613: the free workshop lasts forty minutes.';
const privateFact = 'PRIVATE-UNSELECTED-SENTINEL-613-DO-NOT-EXPORT';
const privateKey = 'PRIVATE-CHALLENGE-ANSWER-KEY-613-DO-NOT-EXPORT';
const privateCanary = 'PRIVATE-EXACT-CANARY-613-DO-NOT-EXPORT';
const task = 'Draft a public brief for a fictional free music workshop using only the selected public source.';
const report = {
  schema: 'td613.loom.browser-package-witness/v0.1', status: 'HELD', presentation: classic ? 'classic79' : 'current',
  context: local ? 'LOCAL_CHROMIUM_REAL_UI_AND_WORKER' : 'PRODUCTION_CHROMIUM_REAL_UI_AND_WORKER',
  source_sha: process.env.TD613_SOURCE_HEAD || checkout, checkout_sha: checkout,
  working_tree_dirty: Boolean(execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim()),
  source_hashes: {}, observed_at: new Date().toISOString(), base_url: base,
  physical_device_observed: false, human_comprehension_measured: false,
  provider_calls: 0, blocked_post_requests: [], runtime_errors: [], checks: [], failures: []
};
for (const file of [`app/dome-world/${entry}`, `app/dome-world/holonomy-loom/workspace-template${suffix}.js`, `app/dome-world/holonomy-loom/ai-workspace${suffix}.js`, 'app/engine/portable-loom-browser-package.js', 'app/engine/portable-loom-tomography-assets.js']) {
  report.source_hashes[file] = sha(await fs.readFile(file));
}

function extractZip(zip, destination) {
  // Python independently checks ZIP structure/CRCs and rejects traversal,
  // duplicate members and symlinks before writing outside the checkout.
  return JSON.parse(execFileSync('python3', ['-c', `import json, pathlib, stat, sys, zipfile
root = pathlib.Path(sys.argv[2]).resolve()
with zipfile.ZipFile(sys.argv[1]) as z:
 assert z.testzip() is None, 'ZIP CRC mismatch'
 names = z.namelist()
 assert len(names) == len(set(names)), 'duplicate ZIP member'
 for item in z.infolist():
  p = pathlib.PurePosixPath(item.filename)
  assert not p.is_absolute() and '..' not in p.parts and '\\\\' not in item.filename, 'unsafe ZIP path'
  assert not stat.S_ISLNK(item.external_attr >> 16), 'ZIP symlink rejected'
  assert root in (root / item.filename).resolve().parents, 'ZIP path escaped'
 z.extractall(root)
 print(json.dumps(names))`, zip, destination], { encoding: 'utf8' }));
}

async function verifyPackage(zip, posture) {
  const temp = await fs.mkdtemp(path.join(tmpdir(), 'td613-browser-package-witness-'));
  try {
    const names = extractZip(zip, temp);
    const artifact = JSON.parse(await fs.readFile(path.join(temp, 'loom-portable-session.json'), 'utf8'));
    const manifest = JSON.parse(await fs.readFile(path.join(temp, 'loom-session-manifest.json'), 'utf8'));
    const markdown = await fs.readFile(path.join(temp, 'loom-portable-session.md'), 'utf8');
    assert.equal(manifest.schema, 'td613.loom.browser-export-manifest/v0.1');
    assert.deepEqual([...names].sort(), [...manifest.files.map(file => file.name), 'loom-session-manifest.json'].sort());
    for (const item of manifest.files) {
      const bytes = await fs.readFile(path.join(temp, item.name));
      assert.equal(bytes.length, item.bytes, item.name + ' byte count');
      assert.equal(sha(bytes), item.sha256, item.name + ' SHA-256');
    }
    assert.equal(manifest.session_root_ref, artifact.session.root.ref);
    assert.equal(manifest.portable_packet_digest, artifact.session.root.packet_digest);
    assert.equal(manifest.selected_source_count, 1);
    assert.equal(manifest.source_authentication, 'UNRESOLVED');
    assert.equal(artifact.session.source_revision, 'browser-unpinned');
    assert.equal(artifact.portable_task.task, task);
    assert.equal(artifact.portable_task.documents.length, 1);
    assert.equal(artifact.portable_task.documents[0].name, 'public-workshop.txt');
    assert.equal(artifact.portable_task.documents[0].text, publicFact);
    assert.equal(artifact.portable_task.governance.withheld_document_count, 1);
    assert.equal(artifact.session.work_units.length, 1);
    const content = (await Promise.all(names.map(name => fs.readFile(path.join(temp, name), 'utf8')))).join('\n');
    assert.ok(content.includes(publicFact));
    for (const secret of [privateFact, privateKey, privateCanary]) assert.ok(!content.includes(secret), 'private value excluded from all package members');
    const receipt = artifact.portable_tomography.calculated_fixture_receipt;
    assert.equal(receipt.execution_origin, 'BROWSER_LOCAL_PROCESS');
    assert.equal(receipt.evidence_class, 'LOCALLY_EXECUTED_FINITE_SYNTHETIC_FIXTURE');
    assert.equal(receipt.observer_measurement, 'NOT_RUN');
    assert.equal(receipt.empirical_promotion_authority, false);
    const math = receipt.mathematical_result;
    assert.equal(math.feasible_region.formal_candidate_count, 320);
    assert.equal(math.feasible_region.feasible_candidate_count, 24);
    assert.equal(math.feasible_region.pareto_candidate_count, 18);
    assert.equal(math.empirical_acquisition, 'NOT_RUN');
    assert.equal(math.observed_real_routes, 'NOT_RUN');
    assert.equal(math.empirical_golden_egg_earned, false);
    assert.equal(artifact.research_math_contract.measured_surface_count, 0);
    assert.equal(artifact.research_math_contract.episode_evaluation_status, 'NOT_RUN');
    const recomputed = JSON.parse(execFileSync(process.execPath, [path.join(temp, 'portable-loom-tomography-audit.mjs'), '--self-check'], { cwd: temp, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }));
    assert.deepEqual(recomputed, math, 'independently extracted companion reproduces actual browser computation');
    await fs.writeFile(path.join(dir, `${posture}-independent-companion-report.json`), JSON.stringify(recomputed, null, 2) + '\n');
    return { artifact, manifest, prompt: markdown.replace(/^# Portable Loom Session\n\n/, ''), math };
  } finally { await fs.rm(temp, { recursive: true, force: true }); }
}

let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.TD613_BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.TD613_BROWSER_EXECUTABLE_PATH } : {}) });
  for (const [posture, viewport] of [['desktop', { width: 1280, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const downloads = [];
    let missingMath = false;
    const missingPath = '/dome-world/previews/a15-r0/discrete-transport-tomography-closed-loop.js';
    await context.route('**/*', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        report.blocked_post_requests.push({ posture, url: request.url() });
        return route.abort('blockedbyclient');
      }
      if (missingMath && new URL(request.url()).pathname === missingPath) return route.fulfill({ status: 404, body: 'MISSING_MATH_ASSET_NEGATIVE_CONTROL' });
      return route.continue();
    });
    page.on('pageerror', error => report.runtime_errors.push({ posture, message: error.message }));
    page.on('download', download => downloads.push(download));
    const openTool = async name => {
      if (!(await page.locator('#loomTools').evaluate(node => node.open))) await page.locator('#loomToolsOpen').click();
      await page.locator(`[data-tool="${name}"]`).click();
    };
    const closeTools = async () => { if (await page.locator('#loomTools').evaluate(node => node.open)) await page.locator('#loomToolsClose').click(); };
    const noticeVisible = fragment => page.evaluate(fragment => [...document.querySelectorAll('[role="status"],[role="alert"]')].some(node => {
      const style = getComputedStyle(node);
      return node.textContent.includes(fragment) && node.getClientRects().length > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    }), fragment);
    const sessionSnapshot = async () => {
      await openTool('session');
      const value = JSON.parse(await page.locator('#aiSessionReceipt').textContent());
      await closeTools();
      return value;
    };
    try {
      const loaded = await page.goto(base + '/dome-world/' + entry, { waitUntil: 'networkidle' });
      assert.equal(loaded.status(), 200);
      await page.waitForSelector('html[data-loom-boot="ready"]');
      await page.locator('#loomFirstCrossingLeave').waitFor({ state: 'visible' });
      await page.screenshot({ path: path.join(dir, `${posture}-before-opening.png`), fullPage: true });
      await page.locator('#loomFirstCrossingLeave').focus();
      await page.keyboard.press('Enter');
      await page.locator('#aiTask').waitFor({ state: 'visible' });
      await page.locator('#aiTask').fill(task);
      await page.locator('#aiUpload').setInputFiles([
        { name: 'public-workshop.txt', mimeType: 'text/plain', buffer: Buffer.from(publicFact) },
        { name: 'private-workshop.txt', mimeType: 'text/plain', buffer: Buffer.from(privateFact) }
      ]);
      await page.locator('#aiDocuments input[type="checkbox"]').nth(1).waitFor();
      assert.equal(await page.getByRole('checkbox', { name: 'Share public-workshop.txt with the AI', exact: true }).isChecked(), false);
      await page.getByRole('checkbox', { name: 'Share public-workshop.txt with the AI', exact: true }).check();
      assert.equal(await page.getByRole('checkbox', { name: 'Share private-workshop.txt with the AI', exact: true }).isChecked(), false);
      await openTool('rules');
      await page.locator('#aiPrivate').fill(privateCanary);
      await openTool('challenge');
      await page.locator('#aiChallengeCanary').fill(privateCanary);
      await page.locator('#aiChallengePrompt').fill('What is the exact fictional private answer?');
      await page.locator('#aiChallengeExpected').fill(privateKey);
      await closeTools();
      await page.locator('#aiPreparePortable').click();
      await page.locator('#aiResult').waitFor({ state: 'visible' });
      await page.waitForFunction(() => !document.querySelector('#aiExportSession').disabled);
      const before = await sessionSnapshot();
      assert.equal(before.session.work_units.length, 1);
      assert.equal(report.blocked_post_requests.length, 0, 'preparation must not attempt provider egress');

      // Fail the first source request before caching any successful package.
      missingMath = true;
      await page.locator('#aiExportSession').focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('#aiStatus').textContent.includes('The session package could not be prepared.'));
      assert.match(await page.locator('#aiStatus').textContent(), /Retry Export session/);
      assert.match(await page.locator('#aiStatus').textContent(), /The mathematical companion could not be verified in this browser/);
      assert.equal(await page.locator('#aiSessionPackageStatus').getAttribute('data-failure'), 'PORTABLE_MATH_SOURCE_UNAVAILABLE');
      assert.doesNotMatch(await page.locator('#aiStatus').textContent(), /app\/|PORTABLE_MATH_|golden[ -]egg/i, 'public notice excludes internal paths and research filenames');
      assert.equal(await noticeVisible('The session package could not be prepared.'), true, 'failure notice is rendered in the active route');
      await page.screenshot({ path: path.join(dir, `${posture}-missing-source-notice.png`), fullPage: true });
      assert.equal(downloads.length, 0, 'missing source cannot yield a partial download');
      assert.equal(await page.locator('#aiExportSession').isEnabled(), true, 'failed package permits retry');
      assert.deepEqual((await sessionSnapshot()).session, before.session, 'failed package preserves custody');
      missingMath = false;

      const downloaded = page.waitForEvent('download');
      await page.locator('#aiExportSession').focus();
      await page.keyboard.press('Enter');
      const download = await downloaded;
      assert.equal(download.suggestedFilename(), 'loom-portable-session.zip');
      const zip = path.join(dir, `${posture}-loom-portable-session.zip`);
      await download.saveAs(zip);
      assert.equal(await download.failure(), null);
      await page.waitForFunction(() => document.querySelector('#aiStatus').textContent.includes('Session package ready:'));
      assert.equal(await noticeVisible('Session package ready:'), true, 'download success notice is rendered in the active route');
      assert.equal(downloads.length, 1);
      const exportFocus = await page.locator('#aiExportSession').evaluate(node => ({
        retained: node === document.activeElement,
        active_id: document.activeElement?.id || null,
        active_tag: document.activeElement?.tagName || null,
        active_outer_html: document.activeElement?.outerHTML?.slice(0, 800) || null
      }));
      const packaged = await verifyPackage(zip, posture);
      assert.deepEqual(packaged.artifact.session, before.session, 'packaging preserves exact session');
      assert.deepEqual(packaged.artifact.portable_task, before.portable_task, 'packaging preserves exact root-bound task');
      const after = await sessionSnapshot();
      assert.deepEqual(after.session, before.session);
      assert.deepEqual(after.portable_task, before.portable_task);

      await page.locator('#aiCopySession').focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('#aiStatus').textContent.includes('Session copied with its local mathematical report.'));
      assert.equal(await noticeVisible('Session copied with its local mathematical report.'), true, 'clipboard success notice is rendered in the active route');
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      assert.equal(copied, packaged.prompt, 'real clipboard exactly matches packaged activation');
      assert.ok(copied.includes(before.session.root.ref));
      assert.match(copied, /BROWSER_LOCAL_PROCESS/);
      assert.match(copied, /copying this activation alone carries no executable files/);
      assert.match(copied, /Export session ZIP/);
      assert.match(copied, /--self-check/);
      for (const secret of [privateFact, privateKey, privateCanary]) assert.ok(!copied.includes(secret));
      const copyFocus = await page.locator('#aiCopySession').evaluate(node => ({
        retained: node === document.activeElement,
        active_id: document.activeElement?.id || null,
        active_tag: document.activeElement?.tagName || null,
        active_outer_html: document.activeElement?.outerHTML?.slice(0, 800) || null
      }));
      assert.equal(exportFocus.retained, true, `keyboard focus remains on export action: ${JSON.stringify(exportFocus)}`);
      assert.equal(copyFocus.retained, true, `keyboard focus remains on copy action: ${JSON.stringify(copyFocus)}`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'prepared export route has no horizontal overflow');
      await page.screenshot({ path: path.join(dir, `${posture}-after-export.png`), fullPage: true });
      assert.equal(report.blocked_post_requests.length, 0, 'export and copy never attempt provider egress');
      report.checks.push({ posture, viewport, session_root_ref: before.session.root.ref,
        selected_source_count: packaged.manifest.selected_source_count,
        artifact_sha256: sha(await fs.readFile(zip)), files_hash_checked: packaged.manifest.files.length,
        missing_source: 'VISIBLE_FAILURE_NO_DOWNLOAD_RETRY_PRESERVES_ROOT',
        browser_math: 'BROWSER_LOCAL_PROCESS', extracted_node_recomputation: 'DEEP_EQUAL',
        synthetic_counts: [320, 24, 18], empirical_acquisition: 'NOT_RUN',
        clipboard: 'EXACT_PACKAGED_ACTIVATION', keyboard_focus: 'PASS', focus_observation: { export: exportFocus, copy: copyFocus }, horizontal_overflow: false,
        private_values_excluded: true, provider_calls: 0 });
    } catch (error) {
      await page.screenshot({ path: path.join(dir, `${posture}-failure.png`), fullPage: true }).catch(() => {});
      report.failures.push({ posture, message: error.message, stack: error.stack });
      throw error;
    } finally { await context.close(); }
  }
  assert.deepEqual(report.runtime_errors, []);
  assert.deepEqual(report.blocked_post_requests, []);
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  if (!report.failures.length) report.failures.push({ message: error.message, stack: error.stack });
  process.exitCode = 1;
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  const reportBody = JSON.stringify(report, null, 2) + '\n';
  await fs.writeFile(path.join(dir, 'browser-package-witness.json'), reportBody);
  await fs.writeFile(path.join(dir, `browser-package-witness-${report.observed_at.replace(/[:.]/g, '-')}.json`), reportBody);
  console.log(JSON.stringify(report, null, 2));
}
