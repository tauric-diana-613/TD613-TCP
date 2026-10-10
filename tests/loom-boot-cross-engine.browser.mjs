/**
 * TD613 Loom startup witness — local source, no live provider and no human
 * acceptance credit. Exercises both Chromium and WebKit, including a
 * deliberate module-loading failure matching the operator's blank shell.
 */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { chromium, webkit } from 'playwright';

const root = resolve('app');
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml'
};
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, 'http://127.0.0.1').pathname;
    const file = resolve(root, '.' + path);
    if (request.method !== 'GET' || !file.startsWith(root + sep)) throw new Error('inadmissible');
    const bytes = await readFile(file);
    response.statusCode = 200;
    response.setHeader('Content-Type', contentTypes[extname(file)] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-store');
    response.end(bytes);
  } catch {
    response.statusCode = 404;
    response.end('Not found');
  }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
const records = [];
let failed = false;
try {
  for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
    let browser;
    try {
      browser = await engine.launch({ headless: true });
      for (const blocked of [false, true]) {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
        const page = await context.newPage();
        const pageErrors = [];
        const externalRequests = [];
        page.on('pageerror', error => pageErrors.push(error.message));
        await page.route('**/*', route => {
          const request = route.request();
          const url = request.url();
          const valid = request.method() === 'GET' && url.startsWith(base + '/');
          if (!valid) { externalRequests.push(url); return route.abort(); }
          if (blocked && new URL(url).pathname === '/dome-world/holonomy-loom/ai-workspace.js') return route.abort();
          return route.continue();
        });
        try {
          await page.goto(`${base}/dome-world/holonomy-loom.html`, { waitUntil: 'domcontentloaded' });
          await page.waitForFunction(() =>
            ['ready', 'failed'].includes(document.documentElement.dataset.loomBoot), null, { timeout: 16000 });
          // WebKit can publish an observable DOM state before committing the
          // first layout. Never credit an unpainted or zero-rect first sample.
          await page.evaluate(() => new Promise(resolve =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))));
          await page.waitForTimeout(100);
          const evidence = await page.evaluate(() => {
            const html = document.documentElement;
            const tutorial = document.querySelector('#loomFirstCrossing');
            const failure = document.querySelector('#loomBootFailure');
            const retry = document.querySelector('#loomBootRetry');
            const stylesheet = [...document.styleSheets].some(sheet => sheet.href?.includes('loom-product-v6.css'));
            const shown = node => {
              if (!node) return false;
              const rect = node.getBoundingClientRect(), style = getComputedStyle(node);
              return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
            };
            const geometry = node => {
              if (!node) return null;
              const box = node.getBoundingClientRect(), style = getComputedStyle(node);
              return { x: box.x, y: box.y, width: box.width, height: box.height,
                display: style.display, visibility: style.visibility, opacity: style.opacity };
            };
            return { boot: html.dataset.loomBoot, reason: html.dataset.loomBootReason || null,
              tutorial_present: !!tutorial, tutorial_visible: shown(tutorial),
              failure_visible: shown(failure), retry_visible: shown(retry),
              stylesheet, placeholder_stranded: document.querySelector('#loomAiWorkspace')?.textContent.trim() === 'Opening Loom…',
              main_geometry: geometry(document.querySelector('main')),
              tutorial_geometry: geometry(tutorial), failure_geometry: geometry(failure) };
          });
          const pass = blocked
            ? evidence.boot === 'failed' && evidence.reason === 'MODULE_LOAD_FAILED' &&
              evidence.failure_visible && evidence.retry_visible && !evidence.placeholder_stranded
            : evidence.boot === 'ready' && evidence.tutorial_present &&
              evidence.tutorial_visible && evidence.stylesheet && !evidence.placeholder_stranded && pageErrors.length === 0;
          records.push({ engine: name, mode: blocked ? 'BLOCKED_MODULE' : 'HEALTHY', status: pass ? 'PASS' : 'FAIL',
            evidence, page_errors: pageErrors, external_requests: externalRequests });
          if (!pass || externalRequests.length) failed = true;
        } catch (error) {
          failed = true;
          records.push({ engine: name, mode: blocked ? 'BLOCKED_MODULE' : 'HEALTHY',
            status: 'FAIL', error: error.message, page_errors: pageErrors, external_requests: externalRequests });
        } finally {
          await context.close();
        }
      }
    } catch (error) {
      failed = true;
      records.push({ engine: name, status: 'UNAVAILABLE', error: error.message });
    } finally {
      await browser?.close();
    }
  }
} finally {
  await new Promise(done => server.close(done));
}
console.log(JSON.stringify({ schema: 'td613.loom.boot-cross-engine-witness/v0.1',
  observation_class: 'LOCAL_SOURCE_CHROMIUM_WEBKIT', production_observed: false,
  physical_safari_observed: false, provider_calls: 0, status: failed ? 'FAIL' : 'PASS', records }, null, 2));
assert.equal(failed, false, 'Local Loom startup or recovery failed on Chromium/WebKit; no physical acceptance claimed.');
