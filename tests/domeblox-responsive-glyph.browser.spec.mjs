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
  const scalarVisibility = await scalar.evaluate(node => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return { opacity:Number(style.opacity), display:style.display, width:rect.width, height:rect.height };
  });
  const viewport = page.viewportSize();

  if (strict) {
    expect(bootChrome.hudVisibility).toBe('hidden');
    expect(bootChrome.interactionVisibility).toBe('hidden');
    expect(bootChrome.touchVisibility).toBe('hidden');
    expect(bootTitle.x).toBeGreaterThanOrEqual(boot.x);
    expect(bootTitle.x + bootTitle.width).toBeLessThanOrEqual(boot.x + boot.width + 1);
  }
  if (strict && viewport.width >= 1000) {
    expect(boot.x).toBeLessThan(90);
    expect(boot.width).toBeLessThan(390);
    expect(boot.x + boot.width).toBeLessThan(430);
    expect(fontReady).toBe(true);
    expect(computedFamily).toContain('TD613 FlowCore');
    expect(scalarVisibility.opacity).toBe(1);
    expect(scalarVisibility.width).toBeGreaterThan(35);
  }
  if (strict && viewport.width < 600 && viewport.height > viewport.width) {
    expect(boot.y).toBeGreaterThan(viewport.height * .40);
    expect(boot.height).toBeLessThan(viewport.height * .52);
    expect(fontReady).toBe(true);
    expect(scalarVisibility.opacity).toBe(1);
  }

  await page.locator('#enterGame').click();
  await page.waitForTimeout(900);
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
      scalarFont:getComputedStyle(document.querySelector('.canonical-mark .canonical-scalar')).fontFamily,
      runtimeVersion:window.TD613_DOME_BLOX_GAME?.version || null,
    };
  });

  if (strict) {
    expect(metrics.overflowX).toBeLessThanOrEqual(0);
    expect(metrics.runtimeVersion).toBe('1.1.0');
    expect(metrics.hudVisibility).toBe('visible');
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(requestFailures).toEqual([]);
    if (viewport.width < 600) {
      expect(metrics.hudBodyHidden).toBe(true);
      expect(metrics.hud.height).toBeLessThan(76);
      expect(metrics.touchDisplay).toBe('block');
      expect(metrics.interaction.bottom).toBeLessThanOrEqual(metrics.touch.top - 2);
    } else {
      expect(metrics.hudBodyHidden).toBe(false);
      expect(metrics.hud.right).toBeLessThan(400);
      expect(metrics.interaction.left).toBeGreaterThan(390);
    }
  }
  return { base, prefix, strict, boot, bootTitle, bootChrome, fontReady, computedFamily, scalarVisibility, metrics, consoleErrors, pageErrors, requestFailures };
}

test('capture production baseline and branch repair', async ({ browser }) => {
  const records = [];
  for (const device of [
    { name:'desktop-1440x900', viewport:{ width:1440, height:900 }, isMobile:false, hasTouch:false },
    { name:'mobile-390x844', viewport:{ width:390, height:844 }, isMobile:true, hasTouch:true },
  ]) {
    for (const target of [
      { name:'production-before', base:LIVE, strict:false },
      { name:'branch-after', base:LOCAL, strict:true },
    ]) {
      const context = await browser.newContext({ viewport:device.viewport, isMobile:device.isMobile, hasTouch:device.hasTouch, deviceScaleFactor:1 });
      const page = await context.newPage();
      records.push(await capture(page, target.base, `${target.name}-${device.name}`, target.strict));
      await context.close();
    }
  }
  fs.writeFileSync(path.join(OUT, 'responsive-diagnostics.json'), `${JSON.stringify(records, null, 2)}\n`);
});
