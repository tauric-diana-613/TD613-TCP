import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

// Offline layout witness. No provider requests or Gate execution are permitted.
const out = 'artifacts/marrowline-layout';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const [width, height] of [[1440,900], [1024,650], [900,550], [390,844]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on('pageerror', error => console.error(error.message));
    await page.route('**/api/**', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"offline layout witness"}' }));
    try {
      const response = await page.goto('http://127.0.0.1:6131/dome-world/marrowline.html');
      assert.equal(response.status(), 200, 'local application must be served');
      await page.locator('html.marrowline-room-ready').waitFor({ timeout: 30000 });
      await page.locator('#marrowlineDesktopToolTabs').waitFor({ state: 'attached' });
      if (width > 860) {
        await page.getByRole('tab', { name: 'Gate', exact: true }).waitFor();
        assert.equal(await page.getByRole('tab', { name: 'Gate', exact: true }).getAttribute('aria-selected'), 'true');
        for (const name of ['Gate', 'Keys', 'Stories', 'Receipts']) {
          await page.getByRole('tab', { name, exact: true }).click();
          await page.screenshot({ path: `${out}/${width}x${height}-${name}.png` });
          const boxes = await page.evaluate(() => {
            const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height }; };
            return {chat:rect('#speakingPanel'), tools:rect('.living-tools'), utilities:rect('#marrowlineConversationUtilities'), prompt:rect('#khonapolitPrompt'), overflow:document.documentElement.scrollWidth > innerWidth};
          });
          assert.equal(boxes.overflow, false, 'horizontal overflow');
          assert.ok(boxes.chat.right <= boxes.tools.x + 1, 'instruments must not occlude chat');
          assert.ok(boxes.utilities.bottom <= height, 'utilities remain in viewport');
          assert.ok(boxes.utilities.y >= boxes.prompt.bottom - 1, 'utilities follow composer');
          results.push({width,height,name,...boxes});
        }
        await page.getByRole('tab', {name:'Gate',exact:true}).focus();
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.getByRole('tab', {name:'Keys',exact:true}).getAttribute('aria-selected'), 'true');
      } else {
        assert.equal(await page.locator('body').getAttribute('data-mobile-view'), 'speak');
        for (const target of ['speakingPanel','invocationPanel','gatePanel','corpusPanel','receiptPanel']) {
          await page.locator(`.mobile-dock [data-mobile-target="${target}"]`).click();
          await page.screenshot({ path: `${out}/${width}x${height}-${target}.png` });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        }
        results.push({width,height,mobileDefault:'speak',navigation:'all five visited'});
      }
    } catch (error) {
      await page.screenshot({ path: `${out}/${width}x${height}-failure.png`, fullPage:true });
      throw error;
    } finally { await context.close(); }
  }
} finally {
  await fs.writeFile(`${out}/geometry.json`, JSON.stringify(results,null,2));
  await browser.close();
}
