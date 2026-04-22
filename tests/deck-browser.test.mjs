import assert from 'assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');

function contentTypeFor(filePath = '') {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.js' || ext === '.mjs') return 'text/javascript; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  return 'text/plain; charset=utf-8';
}

const server = http.createServer((request, response) => {
  try {
    const requestUrl = new URL(request.url, 'http://127.0.0.1');
    const safePath = path.resolve(repoRoot, `.${decodeURIComponent(requestUrl.pathname)}`);
    if (!safePath.startsWith(repoRoot)) {
      response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('forbidden');
      return;
    }
    let targetPath = safePath;
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
      targetPath = path.join(targetPath, 'index.html');
    }
    if (!fs.existsSync(targetPath)) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': contentTypeFor(targetPath) });
    response.end(fs.readFileSync(targetPath));
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(error.message || 'server error');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const serverAddress = server.address();
const deckUrl = `http://127.0.0.1:${serverAddress.port}/app/deck.html?t=${Date.now()}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const pageErrors = [];
const consoleErrors = [];

page.on('pageerror', (error) => {
  pageErrors.push(error.message || String(error));
});

page.on('console', (message) => {
  if (message.type() === 'error') {
    consoleErrors.push(message.text());
  }
});

try {
  await page.goto(deckUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body.dataset.bootStage === 'boot-complete', { timeout: 15000 });

  assert.equal(await page.evaluate(() => document.body.dataset.bootStage || ''), 'boot-complete', 'Deck page reaches boot-complete');
  assert.equal(await page.evaluate(() => document.body.dataset.bootError || ''), '', 'Deck page does not record a boot error');
  assert.equal(await page.locator('#compareBtn').isDisabled(), false, 'Analyze Cadences starts enabled with the starter pair');
  assert.equal(await page.locator('#swapCadencesBtn').isDisabled(), false, 'Swap Cadences starts enabled with the starter pair');
  assert.equal(await page.locator('#shellDuel').getAttribute('data-state'), 'live', 'Deck boots into a live duel with the starter pair');

  const initialProbe = await page.locator('#voiceB').inputValue();
  await page.locator('#voiceB').fill('');
  await page.locator('#compareBtn').click();
  await page.waitForTimeout(250);

  assert.equal(await page.locator('#swapCadencesBtn').isDisabled(), true, 'Swap Cadences disables when the probe bay is empty');
  assert.equal(await page.locator('#similarityKey').textContent(), 'Scan mode', 'Solo analysis flips the similarity key into scan mode');
  assert.equal(await page.locator('#shellDuel').getAttribute('data-state'), 'awaiting-pair', 'Shell Duel reports the missing second bay after solo analysis');

  await page.locator('#voiceB').fill(initialProbe);
  await page.locator('#compareBtn').click();
  await page.waitForFunction(() => document.querySelector('#shellDuel')?.dataset.state === 'live', { timeout: 10000 });

  const duelSimilarityBefore = (await page.locator('#duelSimilarity').textContent()) || '';
  const duelTraceabilityBefore = (await page.locator('#duelTraceability').textContent()) || '';
  await page.locator('#swapCadencesBtn').click();
  await page.waitForTimeout(600);

  const duelSimilarityAfter = (await page.locator('#duelSimilarity').textContent()) || '';
  const duelTraceabilityAfter = (await page.locator('#duelTraceability').textContent()) || '';
  const statusAfterSwap = (await page.locator('#analysisStatusBase').textContent()) || '';
  assert.notEqual(duelSimilarityAfter, duelSimilarityBefore, 'Swap Cadences changes the duel similarity readout');
  assert.notEqual(duelTraceabilityAfter, duelTraceabilityBefore, 'Swap Cadences changes the duel traceability readout');
  assert.match(statusAfterSwap, /Cadence shells swapped/i, 'Swap Cadences publishes a live encounter status message');
  assert.deepEqual(pageErrors, [], 'Deck page emits no uncaught page errors');
  assert.deepEqual(consoleErrors, [], 'Deck page emits no console errors');

  console.log('deck-browser.test.mjs passed');
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
