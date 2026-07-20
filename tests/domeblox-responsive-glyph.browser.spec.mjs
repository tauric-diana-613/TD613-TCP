import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const OUT = path.resolve('domeblox-responsive-review');
const LIVE = 'https://td613.com/dome-world/domeblox/';
const LOCAL = 'http://127.0.0.1:4173/';
fs.mkdirSync(OUT, { recursive:true });

async function capture(page, base, prefix, strict) {
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('requestfailed', request => requestFailures.push(`${request.url()} :: ${request.failure()?.errorText || 'unknown'}`));

  const response = await page.goto(base, { waitUntil:'networkidle', timeout:60_000 });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('DomeBlox · Play Dome-World');
  await page.screenshot({ path:path.join(OUT, `${prefix}-boot.png`), fullPage:true });

  const boot = await page.locator('#bootPanel').boundingBox();
  const bootTitle = await page.locator('#bootPanel h1').boundingBox();
  const bootChrome = await page.evaluate(() => ({
    hudVisibility:getComputedStyle(document.getElementById('hud')).visibility,
    interactionVisibility:getComputedStyle(document.getElementById('interactionCard')).visibility,
    touchVisibility:getComputedStyle(document.getElementById('touchControls')).visibility,
  }));
  const scalar = page.locator('.canonical-mark .canonical-scalar');
  const fontReady = await page.evaluate(async () => {
    const glyph = String.fromCodePoint(0x10D613);
    await document.fonts.ready;
    return document.fonts.check('48px "TD613 FlowCore"', glyph);
  });
  const computedFamily = await scalar.evaluate(node => getComputedStyle(node).fontFamily);
  const viewport = page.viewportSize();

  if (strict) {
    expect(bootChrome.hudVisibility).toBe('hidden');
    expect(bootChrome.interactionVisibility).toBe('hidden');
    expect(bootChrome.touchVisibility).toBe('hidden');
    expect(bootTitle.x).toBeGreaterThanOrEqual(boot.x);
    expect(bootTitle.x + bootTitle.width).toBeLessThanOrEqual(boot.x + boot.width + 1);
    expect(fontReady).toBe(true);
    expect(computedFamily).toContain('TD613 FlowCore');
  }

  await page.locator('#enterGame').click();
  await page.waitForTimeout(900);

  if (strict) {
    await page.locator('#toggleHud').focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#hudBody')).toBeVisible();
    await page.locator('#toggleHud').click();
    await expect(page.locator('#hudBody')).toBeHidden();

    await page.locator('#gameCanvas').focus();
    await page.keyboard.press('m');
    await expect(page.locator('#mapPanel')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mapPanel')).toBeHidden();
  }

  await page.screenshot({ path:path.join(OUT, `${prefix}-game.png`), fullPage:true });

  const metrics = await page.evaluate(() => {
    const rect = id => {
      const r = document.getElementById(id).getBoundingClientRect();
      return { x:r.x, y:r.y, width:r.width, height:r.height, top:r.top, right:r.right, bottom:r.bottom, left:r.left };
    };
    return {
      viewport:{ width:innerWidth, height:innerHeight },
      overflowX:document.documentElement.scrollWidth - innerWidth,
      hud:rect('hud'),
      hudVisibility:getComputedStyle(document.getElementById('hud')).visibility,
      hudBodyHidden:document.getElementById('hudBody').hidden,
      interaction:rect('interactionCard'),
      touch:rect('touchPad'),
      touchDisplay:getComputedStyle(document.getElementById('touchControls')).display,
      runtimeVersion:window.TD613_DOME_BLOX_GAME?.version || null,
      render:window.TD613_DOME_BLOX_GAME?.renderDiagnostics?.() || null,
    };
  });

  if (strict) {
    expect(metrics.overflowX).toBeLessThanOrEqual(0);
    expect(metrics.runtimeVersion).toBe('1.2.2');
    expect(metrics.hudVisibility).toBe('visible');
    expect(metrics.hudBodyHidden).toBe(true);
    expect(metrics.render).toBeTruthy();
    expect(metrics.render.schema).toBe('td613.domeblox.render-diagnostics/v1.2.1');
    expect(metrics.render.labelSuppressionMode).toBe('explicit-render-option');
    expect(Math.abs(metrics.render.centerX - metrics.viewport.width / 2)).toBeLessThanOrEqual(1);
    expect(metrics.render.stationCount).toBeGreaterThanOrEqual(8);
    expect(metrics.render.zoom).toBeGreaterThanOrEqual(.34);
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(requestFailures).toEqual([]);
    if (viewport.width < 600) {
      expect(metrics.hud.height).toBeLessThan(76);
      expect(metrics.touchDisplay).toBe('block');
      expect(metrics.interaction.bottom).toBeLessThanOrEqual(metrics.touch.top - 2);
    } else {
      expect(metrics.hud.width).toBeLessThanOrEqual(260);
      expect(metrics.interaction.width).toBeLessThanOrEqual(365);
      expect(Math.abs((metrics.interaction.left + metrics.interaction.width / 2) - metrics.viewport.width / 2)).toBeLessThanOrEqual(4);
    }
  }
  return { base, prefix, strict, boot, bootTitle, bootChrome, fontReady, computedFamily, metrics, consoleErrors, pageErrors, requestFailures };
}

test('capture production baseline and centered branch across zoom proxies', async ({ browser }) => {
  const records = [];
  const cases = [
    { target:'production-before', base:LIVE, strict:false, name:'desktop-1440x900', viewport:{ width:1440, height:900 }, isMobile:false, hasTouch:false },
    { target:'branch-after', base:LOCAL, strict:true, name:'desktop-1440x900', viewport:{ width:1440, height:900 }, isMobile:false, hasTouch:false },
    { target:'branch-after', base:LOCAL, strict:true, name:'desktop-zoomout-proxy-1800x1125', viewport:{ width:1800, height:1125 }, isMobile:false, hasTouch:false },
    { target:'branch-after', base:LOCAL, strict:true, name:'desktop-zoomin-proxy-1152x720', viewport:{ width:1152, height:720 }, isMobile:false, hasTouch:false },
    { target:'branch-after', base:LOCAL, strict:true, name:'mobile-390x844', viewport:{ width:390, height:844 }, isMobile:true, hasTouch:true },
  ];
  for (const item of cases) {
    const context = await browser.newContext({ viewport:item.viewport, isMobile:item.isMobile, hasTouch:item.hasTouch, deviceScaleFactor:1 });
    const page = await context.newPage();
    records.push(await capture(page, item.base, `${item.target}-${item.name}`, item.strict));
    await context.close();
  }
  fs.writeFileSync(path.join(OUT, 'centered-chrome-diagnostics.json'), `${JSON.stringify(records, null, 2)}\n`);
});
