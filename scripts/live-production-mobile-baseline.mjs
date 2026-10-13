import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const outDir = resolve('docs/receipts/1428-baseline');
await mkdir(outDir, { recursive: true });

const targetUrl = 'https://td613.com/dome-world/holonomy-loom.html';

const viewports = [
  { name: 'mobile_390x700', width: 390, height: 700, dpr: 3, isMobile: true, hasTouch: true },
  { name: 'mobile_390x844', width: 390, height: 844, dpr: 3, isMobile: true, hasTouch: true },
  { name: 'mobile_360x740', width: 360, height: 740, dpr: 2.6, isMobile: true, hasTouch: true },
  { name: 'landscape_844x390', width: 844, height: 390, dpr: 3, isMobile: true, hasTouch: true }
];

console.log(`Starting Live Production Mobile Baseline against: ${targetUrl}`);

const browser = await chromium.launch({ headless: true });
const results = {
  targetUrl,
  timestamp: new Date().toISOString(),
  viewports: {}
};

try {
  for (const vp of viewports) {
    console.log(`\n--- Inspecting ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
    });

    const page = await context.newPage();
    const consoleLogs = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));
    page.on('pageerror', err => pageErrors.push(String(err)));
    page.on('requestfailed', req => failedRequests.push({ url: req.url(), failure: req.failure()?.errorText }));

    const response = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    const status = response?.status();
    const headers = response?.headers() || {};

    // Wait for animation frame
    await page.evaluate(() => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res))));

    // Capture screenshot
    const screenshotPath = join(outDir, `${vp.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    // Evaluate live DOM metrics
    const metrics = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const dpr = window.devicePixelRatio;
      const touchPoints = navigator.maxTouchPoints;
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;

      // Horizontal spill check
      const spilledElements = [];
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('.loom-glyph-field') && !el.matches('.loom-glyph-field')) continue;
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (!rect.width || !rect.height || style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) continue;
        if (rect.left < -1 || rect.right > winW + 1) {
          spilledElements.push({
            tag: el.tagName,
            id: el.id || null,
            className: String(el.className?.baseVal ?? el.className).slice(0, 80),
            left: rect.left,
            right: rect.right,
            width: rect.width
          });
        }
      }

      // Tap targets
      const touchTargets = [...(document.querySelector('dialog:modal') || document).querySelectorAll('button, a, summary, [role="button"]')].flatMap(el => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (!rect.width || !rect.height || style.display === 'none' || style.visibility === 'hidden') return [];
        return [{
          id: el.id || null,
          text: el.textContent.trim().slice(0, 40),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          below24: rect.width < 24 || rect.height < 24,
          below44: rect.width < 44 || rect.height < 44
        }];
      });

      // 39-carrier presence
      const carrierElements = document.querySelectorAll('.loom-field-flight text');
      const carrierCount = carrierElements.length;
      const planes = {
        near: document.querySelectorAll('.loom-plane-near text, [data-plane="near"] text, .flight-near text').length,
        mid: document.querySelectorAll('.loom-plane-mid text, [data-plane="mid"] text, .flight-mid text').length,
        far: document.querySelectorAll('.loom-plane-far text, [data-plane="far"] text, .flight-far text').length
      };

      // Tutorial & Dialog elements
      const tutorialHeading = document.querySelector('h1, h2, .loom-title, .tutorial-title')?.textContent?.trim() || null;
      const demoButtons = [...document.querySelectorAll('button')].map(b => b.textContent.trim()).filter(t => t.toLowerCase().includes('demo') || t.toLowerCase().includes('practice'));

      return {
        viewport: { winW, winH, dpr, touchPoints, isCoarse, docW, hasHorizontalScroll: docW > winW },
        spilledCount: spilledElements.length,
        spilledElements: spilledElements.slice(0, 5),
        touchTargetsCount: touchTargets.length,
        sub44Targets: touchTargets.filter(t => t.below44),
        sub24Targets: touchTargets.filter(t => t.below24),
        carriers: { count: carrierCount, planes },
        uiState: { tutorialHeading, demoButtons }
      };
    });

    results.viewports[vp.name] = {
      httpStatus: status,
      screenshot: screenshotPath,
      metrics,
      consoleLogs,
      pageErrors,
      failedRequests
    };

    console.log(`  HTTP: ${status}`);
    console.log(`  Horizontal Scroll Spill: ${metrics.viewport.hasHorizontalScroll ? 'YES (DEFECT)' : 'NO (CLEAN)'}`);
    console.log(`  Spilled Elements: ${metrics.spilledCount}`);
    console.log(`  Carrier Count: ${metrics.carriers.count} (near: ${metrics.carriers.planes.near}, mid: ${metrics.carriers.planes.mid}, far: ${metrics.carriers.planes.far})`);
    console.log(`  Touch Targets below 44px: ${metrics.sub44Targets.length} / below 24px: ${metrics.sub24Targets.length}`);
    console.log(`  Page Errors: ${pageErrors.length}`);
    console.log(`  Failed Requests: ${failedRequests.length}`);

    await context.close();
  }

  const reportFile = join(outDir, 'baseline-report.json');
  await writeFile(reportFile, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nBaseline inspection complete. Report saved to: ${reportFile}`);
} finally {
  await browser.close();
}
