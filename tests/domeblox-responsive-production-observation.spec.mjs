import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const URL = 'https://td613.com/dome-world/domeblox/';
const OUT = path.resolve('domeblox-responsive-production-observation');
fs.mkdirSync(OUT, { recursive:true });

async function observe(browser, device) {
  const context = await browser.newContext({
    viewport:device.viewport,
    isMobile:device.isMobile,
    hasTouch:device.hasTouch,
    deviceScaleFactor:1,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('requestfailed', request => requestFailures.push(`${request.url()} :: ${request.failure()?.errorText || 'unknown'}`));

  const response = await page.goto(URL, { waitUntil:'networkidle', timeout:60_000 });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('DomeBlox · Play Dome-World');
  await page.screenshot({ path:path.join(OUT, `${device.name}-boot.png`), fullPage:true });

  const boot = await page.locator('#bootPanel').boundingBox();
  const title = await page.locator('#bootPanel h1').boundingBox();
  const bootState = await page.evaluate(async () => {
    const glyph = String.fromCodePoint(0x10D613);
    await document.fonts.ready;
    const scalar = document.querySelector('.canonical-mark .canonical-scalar');
    return {
      fontReady:document.fonts.check('48px "TD613 FlowCore"', glyph),
      scalarFont:getComputedStyle(scalar).fontFamily,
      scalarText:scalar.textContent,
      hudVisibility:getComputedStyle(document.getElementById('hud')).visibility,
      interactionVisibility:getComputedStyle(document.getElementById('interactionCard')).visibility,
      touchVisibility:getComputedStyle(document.getElementById('touchControls')).visibility,
      overflowX:document.documentElement.scrollWidth - innerWidth,
    };
  });

  expect(bootState.fontReady).toBe(true);
  expect(bootState.scalarFont).toContain('TD613 FlowCore');
  expect(bootState.scalarText).toBe(String.fromCodePoint(0x10D613));
  expect(bootState.hudVisibility).toBe('hidden');
  expect(bootState.interactionVisibility).toBe('hidden');
  expect(bootState.touchVisibility).toBe('hidden');
  expect(bootState.overflowX).toBeLessThanOrEqual(0);
  expect(title.x).toBeGreaterThanOrEqual(boot.x);
  expect(title.x + title.width).toBeLessThanOrEqual(boot.x + boot.width + 1);

  await page.locator('#enterGame').click();
  await page.waitForTimeout(900);
  await page.screenshot({ path:path.join(OUT, `${device.name}-game.png`), fullPage:true });

  const gameplay = await page.evaluate(() => {
    const rect = id => {
      const r = document.getElementById(id).getBoundingClientRect();
      return { x:r.x, y:r.y, width:r.width, height:r.height, top:r.top, right:r.right, bottom:r.bottom, left:r.left };
    };
    return {
      runtimeVersion:window.TD613_DOME_BLOX_GAME?.version || null,
      overflowX:document.documentElement.scrollWidth - innerWidth,
      hud:rect('hud'),
      hudVisibility:getComputedStyle(document.getElementById('hud')).visibility,
      hudBodyHidden:document.getElementById('hudBody').hidden,
      interaction:rect('interactionCard'),
      touch:rect('touchPad'),
      touchDisplay:getComputedStyle(document.getElementById('touchControls')).display,
    };
  });

  expect(gameplay.runtimeVersion).toBe('1.1.0');
  expect(gameplay.overflowX).toBeLessThanOrEqual(0);
  expect(gameplay.hudVisibility).toBe('visible');
  if (device.viewport.width < 600) {
    expect(gameplay.hudBodyHidden).toBe(true);
    expect(gameplay.hud.height).toBeLessThan(76);
    expect(gameplay.touchDisplay).toBe('block');
    expect(gameplay.interaction.bottom).toBeLessThanOrEqual(gameplay.touch.top - 2);
  } else {
    expect(gameplay.hudBodyHidden).toBe(false);
    expect(gameplay.hud.right).toBeLessThan(400);
    expect(gameplay.interaction.left).toBeGreaterThan(390);
  }

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(requestFailures).toEqual([]);

  await context.close();
  return { device:device.name, boot, title, bootState, gameplay, consoleErrors, pageErrors, requestFailures };
}

test('observe deployed responsive DomeBlox surface', async ({ browser }) => {
  const records = [];
  for (const device of [
    { name:'desktop-1440x900', viewport:{ width:1440, height:900 }, isMobile:false, hasTouch:false },
    { name:'mobile-390x844', viewport:{ width:390, height:844 }, isMobile:true, hasTouch:true },
  ]) records.push(await observe(browser, device));
  fs.writeFileSync(path.join(OUT, 'receipt.json'), `${JSON.stringify({
    schema:'td613.domeblox.responsive-production-observation/v1',
    url:URL,
    status:'PASS',
    records,
  }, null, 2)}\n`);
});
