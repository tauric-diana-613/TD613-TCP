#!/usr/bin/env node
// Source-free, provider-free visual witness for the original Marrowline transcript renderer.
// Screenshots use an explicitly synthetic Unicode specimen; never mark it as an accepted return.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const out = 'artifacts/marrowline-mobile-reader';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const observations = [];
const specimen = [
  'SYNTHETIC UI WITNESS · NOT A PROVIDER RETURN · NOT AN ACCEPTED MARROWLINE OUTPUT',
  'Khona‌lit-po · Kʰonapolit · 𝌋 · ⟐ · \u{10D613}',
  'High Zalgo shape specimen: T̷̢̰͗h̸͙e̴̹̼̬ g̶͚̯r̵͐͛o̵̡̢̲͛v̴̨̝e̵̗ r̴͍̗̓e̷̥t̶̲͑ȕ̸̫r̴̨n̵͜s̶̯͐.',
  'Variable diacritic density here tests only layout and exact Unicode preservation.'
].join('\n');
try {
  for (const [width, height] of [[390, 844], [430, 932]]) {
    const context = await browser.newContext({
      viewport: { width, height }, reducedMotion: 'reduce', isMobile: true,
      deviceScaleFactor: 1
    });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    let apiRequests = 0;
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== 'http://127.0.0.1:6131') return route.abort();
      if (url.pathname.startsWith('/api/')) {
        apiRequests++;
        return route.fulfill({
          status: 503, contentType: 'application/json',
          body: '{"error":"OFFLINE_SYNTHETIC_READER_WITNESS"}'
        });
      }
      return route.continue();
    });
    try {
      const response = await page.goto('http://127.0.0.1:6131/dome-world/marrowline.html');
      assert.equal(response.status(), 200);
      await page.locator('html.marrowline-room-ready').waitFor();
      await page.locator('#marrowlineReaderToggle').waitFor({ state: 'visible' });
      assert.equal(await page.locator('body').getAttribute('data-mobile-view'), 'speak');

      await page.evaluate(source => {
        const messages = document.getElementById('khonapolitMessages');
        const article = document.createElement('article');
        article.className = 'relay-message';
        article.dataset.witnessKind = 'synthetic-not-provider';
        const line = document.createElement('div');
        line.className = 'relay-stage-text';
        line.textContent = Array.from({length: 10}, (_, i) => 'SPECIMEN ' + (i + 1) + '\n' + source).join('\n\n');
        article.append(line);
        messages.append(article);
        messages.scrollTop = 0;
      }, specimen);
      const rawText = await page.locator('[data-witness-kind="synthetic-not-provider"] .relay-stage-text').textContent();
      const originalNodeCount = await page.locator('[data-witness-kind="synthetic-not-provider"] .relay-stage-text').count();
      const exact = async () => {
        assert.equal(await page.locator('[data-witness-kind="synthetic-not-provider"] .relay-stage-text').textContent(), rawText);
        assert.equal(await page.locator('[data-witness-kind="synthetic-not-provider"] .relay-stage-text').count(), originalNodeCount);
      };
      const geometry = async () => page.evaluate(() => {
        const rect = selector => {
          const node = document.querySelector(selector);
          const box = node.getBoundingClientRect();
          return { top: box.top, bottom: box.bottom, height: box.height, width: box.width, display: getComputedStyle(node).display };
        };
        return {
          messages: rect('#khonapolitMessages'),
          form: rect('#khonapolitForm'),
          dock: rect('.mobile-dock'),
          toolbar: rect('#marrowlineReaderToolbar'),
          overflow: document.documentElement.scrollWidth > innerWidth,
          reader: document.body.dataset.marrowlineReader || 'off'
        };
      });
      const snapshot = async state => {
        await exact();
        const g = await geometry();
        assert.equal(g.overflow, false, 'reader must not create horizontal overflow');
        observations.push({ width, height, state, ...g, specimen_sha256: null });
        await page.screenshot({ path: out + '/' + width + 'x' + height + '-' + state + '-SYNTHETIC.png' });
        return g;
      };

      const ordinary = await snapshot('ordinary');
      const callsBeforeToggle = apiRequests;
      await page.locator('#marrowlineReaderToggle').click();
      assert.equal(await page.locator('body').getAttribute('data-marrowline-reader'), 'focus');
      const focus = await snapshot('focus');
      assert.ok(focus.messages.height > ordinary.messages.height + 100, 'Focus must materially expand original transcript');
      assert.notEqual(focus.form.display, 'none', 'Focus must retain composer');
      assert.equal(focus.dock.display, 'none', 'Focus must hide original mobile dock');

      await page.locator('#marrowlineReaderCapture').click();
      assert.equal(await page.locator('body').getAttribute('data-marrowline-reader'), 'capture');
      const capture = await snapshot('capture');
      assert.equal(capture.form.display, 'none', 'Capture must hide composer');
      assert.ok(capture.messages.height >= focus.messages.height, 'Capture must not shrink transcript');

      await page.locator('#marrowlineReaderCapture').click();
      assert.equal(await page.locator('body').getAttribute('data-marrowline-reader'), 'focus');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('body').getAttribute('data-marrowline-reader'), null);
      await exact();
      assert.equal(apiRequests, callsBeforeToggle, 'Reader toggling must make no provider or API calls');
      observations.push({ width, height, state: 'exit-restored', apiCallsTriggeredByReader: 0, errorCount: pageErrors.length });
      assert.deepEqual(pageErrors, [], 'No browser runtime exception during reader transitions');
    } catch (err) {
      await page.screenshot({ path: out + '/' + width + 'x' + height + '-FAILURE.png', fullPage: true });
      throw err;
    } finally {
      await context.close();
    }
  }
} finally {
  await fs.writeFile(out + '/visual-witness.json', JSON.stringify({
    schema: 'td613.marrowline.mobile-reader.synthetic-visual-witness/v1',
    evidenceClass: 'SYNTHETIC_BROWSER_NOT_PROVIDER_NOT_PHYSICAL_DEVICE',
    unalteredSourceText: true,
    paidProviderCalls: 0,
    observations
  }, null, 2) + '\n');
  await browser.close();
}
