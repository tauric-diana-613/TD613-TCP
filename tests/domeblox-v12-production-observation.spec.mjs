import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const URL = 'https://td613.com/dome-world/domeblox/';
const OUT = path.resolve('domeblox-v12-production-observation');
fs.mkdirSync(OUT, { recursive:true });

const cases = [
  { name:'desktop-1440x900', viewport:{ width:1440, height:900 }, isMobile:false, hasTouch:false },
  { name:'laptop-1152x720', viewport:{ width:1152, height:720 }, isMobile:false, hasTouch:false },
  { name:'zoomout-1800x1125', viewport:{ width:1800, height:1125 }, isMobile:false, hasTouch:false },
  { name:'mobile-390x844', viewport:{ width:390, height:844 }, isMobile:true, hasTouch:true },
];

test('observe deployed DomeBlox v1.2 chrome and station visibility', async ({ browser }) => {
  const receipts = [];
  for (const item of cases) {
    const context = await browser.newContext({ viewport:item.viewport, isMobile:item.isMobile, hasTouch:item.hasTouch, deviceScaleFactor:1 });
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
    await page.locator('#enterGame').click();
    await page.waitForTimeout(900);
    await page.screenshot({ path:path.join(OUT, `${item.name}.png`), fullPage:true });

    const receipt = await page.evaluate(() => {
      const rect = id => {
        const r = document.getElementById(id).getBoundingClientRect();
        return { x:r.x, y:r.y, width:r.width, height:r.height, left:r.left, right:r.right, top:r.top, bottom:r.bottom };
      };
      return {
        viewport:{ width:innerWidth, height:innerHeight },
        runtimeVersion:window.TD613_DOME_BLOX_GAME?.version || null,
        render:window.TD613_DOME_BLOX_GAME?.renderDiagnostics?.() || null,
        hud:rect('hud'),
        hudBodyHidden:document.getElementById('hudBody').hidden,
        interaction:rect('interactionCard'),
        overflowX:document.documentElement.scrollWidth - innerWidth,
      };
    });

    expect(receipt.runtimeVersion).toBe('1.2.0');
    expect(receipt.render).toBeTruthy();
    expect(Math.abs(receipt.render.centerX - receipt.viewport.width / 2)).toBeLessThanOrEqual(1);
    expect(receipt.render.stationCount).toBe(12);
    expect(receipt.render.legacyLabelsSuppressed).toBe(true);
    expect(receipt.hudBodyHidden).toBe(true);
    expect(receipt.overflowX).toBeLessThanOrEqual(0);
    if (item.viewport.width > 820) {
      expect(receipt.hud.width).toBeLessThanOrEqual(260);
      expect(receipt.interaction.width).toBeLessThanOrEqual(365);
      expect(Math.abs((receipt.interaction.left + receipt.interaction.width / 2) - receipt.viewport.width / 2)).toBeLessThanOrEqual(4);
    }
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(requestFailures).toEqual([]);
    receipts.push({ case:item.name, ...receipt, consoleErrors, pageErrors, requestFailures });
    await context.close();
  }
  fs.writeFileSync(path.join(OUT, 'receipt.json'), `${JSON.stringify({ schema:'td613.domeblox.production-observation/v1.2', status:'PASS', receipts }, null, 2)}\n`);
});
