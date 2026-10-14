/** Actual local browser witness for the viewport field and recovery routes.
 * No provider request, deployment, or physical-device evidence is acquired.
 */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep, join } from 'node:path';
import { chromium } from 'playwright';

const root = resolve('app');
const server = createServer(async (request, response) => {
  try {
    const file = resolve(root, '.' + new URL(request.url, 'http://localhost').pathname);
    if (request.method !== 'GET' || !file.startsWith(root + sep)) throw Error('Invalid static request');
    response.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch { response.statusCode = 404; response.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
const artifactDir = process.env.TD613_LOOM_COUTURE_ARTIFACT_DIR;
const report = { context: 'LOCAL_CHROMIUM_VIEWPORT_AND_RECOVERY', physical_device_observed: false,
  live_provider_calls: 0, checks: [], errors: [], rejected_requests: [] };
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.TD613_BROWSER_EXECUTABLE
    ? { executablePath: process.env.TD613_BROWSER_EXECUTABLE, args: ['--no-sandbox'] } : {}) });
  for (const [name, width, height] of [['phone', 390, 844], ['desktop', 1440, 1000]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    try {
      const page = await context.newPage();
      page.on('pageerror', error => report.errors.push(error.message));
      await page.route('**/*', route => {
        if (route.request().method() === 'GET' && route.request().url().startsWith(base + '/')) return route.continue();
        report.rejected_requests.push(route.request().url()); return route.abort();
      });
      const ready = () => page.waitForSelector('html[data-loom-boot="ready"]');
      await page.goto(base + '/dome-world/holonomy-loom.html'); await ready();
      assert.match(await page.locator('#loomTutorialProgress').textContent(), /1 of 7/);
      assert.match(await page.locator('.loom-threshold-kicker').textContent(), /Tutorial/);
      assert.equal(await page.locator('.loom-builder-shell').isVisible(), false);
      await page.locator('#loomFirstCrossingLeave').focus(); await page.keyboard.press('Enter');
      await page.locator('#aiTask').waitFor({ state: 'visible' });
      const field = await page.locator('#aiRuntimeState').evaluate(node => {
        const r = node.getBoundingClientRect();
        const shell = document.querySelector('.loom-builder-shell'), s = getComputedStyle(shell);
        return { x: r.x, y: r.y, width: r.width, height: r.height,
          trapped_in_builder: !!node.closest('.loom-builder-shell'),
          background: s.backgroundColor, blur: s.backdropFilter,
          carriers: node.querySelectorAll('.loom-field-flight text').length,
          document_width: document.documentElement.scrollWidth };
      });
      assert.equal(field.trapped_in_builder, false, 'a blurred ancestor must never trap the fixed field');
      assert.equal(field.x, 0); assert.equal(field.y, 0);
      assert.equal(field.width, width); assert.equal(field.height, height);
      assert.equal(field.carriers, 39); assert.equal(field.document_width, width);
      const alpha = Number(field.background.match(/,\s*([\d.]+)\)$/)?.[1]);
      assert.ok(alpha > 0 && alpha < .5, 'the working surface remains translucent');
      assert.notEqual(field.blur, 'none');
      await page.locator('#aiTask').fill('Draft a short work email using my selected notes.');
      await page.locator('#aiPreparePortable').click();
      await page.locator('#aiResult').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#aiMarrowline').isEnabled(), true);
      await page.reload(); await ready();
      assert.match(await page.locator('#loomTutorialProgress').textContent(), /1 of 7/);
      await page.goto('about:blank');
      await page.goto(base + '/dome-world/holonomy-loom.html#return-review'); await ready();
      await page.locator('#loomReturnWorkspace').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#loomFirstCrossing').isVisible(), false);
      await page.locator('[data-return-review="upload"]').setInputFiles({ name: 'invalid-return.json',
        mimeType: 'application/json', buffer: Buffer.from('{"schema":"invalid-return"}') });
      await page.waitForFunction(() => document.querySelector('[data-return-review="status"]').textContent.includes('HELD'));
      assert.equal(await page.locator('[data-return-review="result"]').isVisible(), false);
      await page.evaluate(() => sessionStorage.setItem('td613.loom.return-review.v1', '{broken'));
      await page.reload(); await ready();
      await page.waitForFunction(() => document.querySelector('[data-return-review="status"]').textContent.includes('HELD'));
      assert.equal(await page.locator('[data-return-review="result"]').isVisible(), false);
      report.checks.push({ posture: name, field, keyboard_entry: 'PASS', local_preparation: 'PASS',
        reload: 'PASS', direct_return_entry: 'PASS', malformed_upload: 'HELD', malformed_reload: 'HELD' });
    } finally { await context.close(); }
  }
  assert.deepEqual(report.errors, []); assert.deepEqual(report.rejected_requests, []);
  report.status = 'PASS';
} catch (error) { report.status = 'FAIL'; report.failure = error.message; process.exitCode = 1; }
finally {
  await browser?.close(); await new Promise(done => server.close(done));
  if (artifactDir) { await mkdir(artifactDir, { recursive: true }); await writeFile(join(artifactDir, 'report.json'), JSON.stringify(report, null, 2) + '\n'); }
}
console.log(JSON.stringify(report));
