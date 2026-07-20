import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const URL = 'https://td613.com/dome-world/domeblox/';
const SAVE_KEY = 'td613.domeblox.browser-world/v1';
const OUT = path.resolve('domeblox-v121-production-observation');
fs.mkdirSync(OUT, { recursive: true });

function bindErrorLedger(page) {
  const ledger = { consoleErrors: [], pageErrors: [], requestFailures: [] };
  page.on('console', message => {
    if (message.type() === 'error') ledger.consoleErrors.push(message.text());
  });
  page.on('pageerror', error => ledger.pageErrors.push(String(error)));
  page.on('requestfailed', request => {
    const url = request.url();
    if (!url.endsWith('/favicon.ico')) ledger.requestFailures.push(`${url} :: ${request.failure()?.errorText || 'unknown'}`);
  });
  return ledger;
}

async function openGame(context, screenshotName) {
  const page = await context.newPage();
  const errors = bindErrorLedger(page);
  const response = await page.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('DomeBlox · Play Dome-World');
  await page.locator('#enterGame').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, screenshotName), fullPage: true });
  return { page, errors };
}

test('observe deployed DomeBlox v1.2.1 resilience packet', async ({ browser }) => {
  const receipt = {
    schema: 'td613.domeblox.production-resilience-observation/v1',
    url: URL,
    status: 'FAIL',
    runtime: null,
    canonical_u10d613: false,
    explicit_label_control: false,
    partial_save_hydration: false,
    denied_storage_abstention: false,
    export_fallback: false,
    normal_errors: null,
    partial_errors: null,
    denied_errors: null,
    error: null,
  };

  try {
    const normalContext = await browser.newContext({ viewport: { width: 1152, height: 720 } });
    const normal = await openGame(normalContext, 'normal-1152x720.png');
    const normalObservation = await normal.page.evaluate(() => ({
      version: window.TD613_DOME_BLOX_GAME?.version,
      canonical: window.TD613_DOME_BLOX_GAME?.canonical,
      render: window.TD613_DOME_BLOX_GAME?.renderDiagnostics?.(),
      fontReady: document.fonts.check('48px "TD613 FlowCore"', String.fromCodePoint(0x10D613)),
    }));
    expect(normalObservation.version).toBe('1.2.1');
    expect(normalObservation.canonical).toBe(String.fromCodePoint(0x10D613));
    expect(normalObservation.fontReady).toBe(true);
    expect(normalObservation.render?.schema).toBe('td613.domeblox.render-diagnostics/v1.2.1');
    expect(normalObservation.render?.labelSuppressionMode).toBe('explicit-render-option');
    expect(normal.errors.consoleErrors).toEqual([]);
    expect(normal.errors.pageErrors).toEqual([]);
    expect(normal.errors.requestFailures).toEqual([]);
    receipt.runtime = normalObservation.version;
    receipt.canonical_u10d613 = true;
    receipt.explicit_label_control = true;
    receipt.normal_errors = normal.errors;
    await normalContext.close();

    const partialSave = {
      schema: 1,
      savedAt: '2026-01-01T00:00:00.000Z',
      world: { day: '9', springald: null, unknownField: 'discard-me' },
      player: { x: '17', inventory: { food: '4' }, stats: null },
      ledger: [{ type: 'legacy', message: 'preserve me' }],
    };
    const partialContext = await browser.newContext({ viewport: { width: 1152, height: 720 } });
    await partialContext.addInitScript(({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    }, { key: SAVE_KEY, value: partialSave });
    const partial = await openGame(partialContext, 'partial-save-hydrated.png');
    const hydrated = await partial.page.evaluate(() => window.TD613_DOME_BLOX_GAME.snapshot());
    expect(hydrated.world.day).toBe(9);
    expect(hydrated.player.x).toBe(17);
    expect(hydrated.player.inventory.food).toBe(4);
    expect(hydrated.player.inventory.cloth).toBe(0);
    expect(hydrated.player.stats.woven).toBe(0);
    expect(hydrated.world.springald.candidate).toBe(false);
    expect(hydrated.world.tendencies.attention).toBeCloseTo(.12);
    expect('unknownField' in hydrated.world).toBe(false);
    expect(hydrated.ledger[0].type).toBe('legacy');
    expect(partial.errors.consoleErrors).toEqual([]);
    expect(partial.errors.pageErrors).toEqual([]);
    expect(partial.errors.requestFailures).toEqual([]);
    receipt.partial_save_hydration = true;
    receipt.partial_errors = partial.errors;
    await partialContext.close();

    const deniedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await deniedContext.addInitScript(() => {
      for (const method of ['getItem', 'setItem', 'removeItem']) {
        Object.defineProperty(Storage.prototype, method, {
          configurable: true,
          value() { throw new DOMException('storage denied by observation fixture', 'SecurityError'); },
        });
      }
    });
    const denied = await openGame(deniedContext, 'storage-denied-390x844.png');
    const saveResult = await denied.page.evaluate(() => window.TD613_DOME_BLOX_GAME.save());
    expect(saveResult).toBe(false);
    await denied.page.locator('#toggleHud').click();
    await expect(denied.page.locator('#messageLog')).toContainText('Local storage is unavailable');
    const downloadPromise = denied.page.waitForEvent('download');
    await denied.page.locator('#exportButton').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^domeblox-save-day-\d+\.json$/);
    expect(denied.errors.consoleErrors).toEqual([]);
    expect(denied.errors.pageErrors).toEqual([]);
    expect(denied.errors.requestFailures).toEqual([]);
    receipt.denied_storage_abstention = true;
    receipt.export_fallback = true;
    receipt.denied_errors = denied.errors;
    await deniedContext.close();

    receipt.status = 'PASS';
  } catch (error) {
    receipt.error = String(error?.stack || error);
    throw error;
  } finally {
    fs.writeFileSync(path.join(OUT, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
  }
});
