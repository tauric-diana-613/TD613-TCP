import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const GAME_URL = 'https://td613.com/dome-world/domeblox/';
const BATTERY_URL = 'https://td613.com/dome-world/domeblox/forward-battery/';
const OUT = path.resolve('domeblox-playable-observation');

test('production DomeBlox is an operable playable village', async ({ page }) => {
  fs.mkdirSync(OUT, { recursive: true });
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];
  const stages = [];
  let stage = 'boot';
  let terminalError = null;

  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('requestfailed', request => {
    const url = request.url();
    if (!url.endsWith('/favicon.ico')) requestFailures.push(`${url} :: ${request.failure()?.errorText || 'unknown'}`);
  });

  const mark = value => {
    stage = value;
    stages.push({ stage: value, at: new Date().toISOString() });
  };

  try {
    mark('navigate-game');
    const response = await page.goto(GAME_URL, { waitUntil: 'networkidle', timeout: 45_000 });
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle('DomeBlox · Play Dome-World');
    await expect(page.locator('#gameCanvas')).toBeVisible();
    await expect(page.locator('.canonical-scalar').first()).toHaveText(String.fromCodePoint(0x10D613));

    mark('enter-dome');
    await page.locator('#enterGame').click();
    await expect(page.locator('#bootPanel')).toBeHidden();
    const initial = await page.evaluate(() => window.TD613_DOME_BLOX_GAME.snapshot());
    expect(initial.player.y).toBeGreaterThan(100);
    expect(initial.world.water).toBe(20);

    mark('move-avatar');
    await page.locator('#gameCanvas').click({ position: { x: 400, y: 300 } });
    await page.keyboard.down('w');
    await page.waitForTimeout(1150);
    await page.keyboard.up('w');
    const moved = await page.evaluate(() => window.TD613_DOME_BLOX_GAME.snapshot());
    expect(moved.player.y).toBeLessThan(initial.player.y - 60);

    mark('fountain-interaction');
    await page.keyboard.press('e');
    await page.waitForTimeout(150);
    const interacted = await page.evaluate(() => window.TD613_DOME_BLOX_GAME.snapshot());
    expect(interacted.world.water).toBeGreaterThan(initial.world.water);
    expect(interacted.player.objective).toBeGreaterThanOrEqual(1);
    await expect(page.locator('#messageLog')).toContainText('Play lifts water');

    mark('map');
    await page.keyboard.press('m');
    await expect(page.locator('#mapPanel')).toBeVisible();
    await expect(page.locator('#mapCanvas')).toBeVisible();
    await page.locator('#closeMap').click();
    await expect(page.locator('#mapPanel')).toBeHidden();

    mark('save-persistence');
    await page.locator('#saveButton').click();
    const stored = await page.evaluate(() => localStorage.getItem('td613.domeblox.browser-world/v1'));
    expect(stored).toBeTruthy();
    const storedState = JSON.parse(stored);
    expect(storedState.player.objective).toBeGreaterThanOrEqual(1);
    const savedY = storedState.player.y;
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#enterGame').click();
    const reloaded = await page.evaluate(() => window.TD613_DOME_BLOX_GAME.snapshot());
    expect(Math.abs(reloaded.player.y - savedY)).toBeLessThan(1);

    mark('forward-battery-subroute');
    const battery = await page.goto(BATTERY_URL, { waitUntil: 'networkidle', timeout: 45_000 });
    expect(battery?.status()).toBe(200);
    await expect(page).toHaveTitle('DomeBlox · Forward Battery');
    await expect(page.locator('#sourceNucleus')).toBeVisible();
    await page.locator('[data-panel="assay"]').click();
    await expect(page.locator('#runAssay')).toBeVisible();
    await expect(page.locator('.canonical-scalar')).toHaveText(String.fromCodePoint(0x10D613));

    mark('error-gates');
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(requestFailures).toEqual([]);
    mark('complete');
  } catch (error) {
    terminalError = String(error?.stack || error);
    throw error;
  } finally {
    await page.screenshot({ path: path.join(OUT, 'production.png'), fullPage: true }).catch(() => {});
    const receipt = {
      schema: 'td613.domeblox.playable-production-observation/v1',
      game_url: GAME_URL,
      forward_battery_url: BATTERY_URL,
      status: terminalError ? 'FAIL' : 'PASS',
      terminal_stage: stage,
      stages,
      error: terminalError,
      title: await page.title().catch(() => null),
      console_errors: consoleErrors,
      page_errors: pageErrors,
      request_failures: requestFailures,
    };
    fs.writeFileSync(path.join(OUT, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
  }
});
