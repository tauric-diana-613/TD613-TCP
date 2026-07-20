import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const out = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-aia2-postcase-diagnosis');
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
await context.addInitScript(() => { localStorage.clear(); sessionStorage.clear(); });
const page = await context.newPage();
await page.goto(`${base}/dome-world/ash-keep.html?presentation=aia`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => document.documentElement.dataset.ashAiaReady === 'true'
  && document.documentElement.dataset.ashAiaIngress === 'INTEGRATED_EXACT_CONTROLS'
  && window.__td613AshLiveAIA?.current?.().task === 'setup');
await page.locator('#newTitle').fill('AIA2 post-case visibility diagnosis');
await page.locator('#newProfile').selectOption('research');
await page.locator('#newCase').click();
await page.waitForFunction(() => Boolean(window.__td613AshKeep?.current?.().case_id));
await page.waitForTimeout(500);
const report = await page.evaluate(() => {
  const inspect = selector => {
    const node = document.querySelector(selector);
    if (!node) return null;
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return {
      selector,
      class: node.className,
      hidden: node.hidden,
      inline_style: node.getAttribute('style'),
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      position: style.position,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      connected: node.isConnected
    };
  };
  const relevantRules = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = [...sheet.cssRules]; } catch { continue; }
    const walk = ruleList => {
      for (const rule of ruleList) {
        if (rule.cssRules) walk([...rule.cssRules]);
        const text = rule.cssText || '';
        if (/display\s*:\s*none/i.test(text) && /(?:\bmain\b|workspace-rail|workspace)/i.test(text)) {
          relevantRules.push({ href: sheet.href || 'inline', text });
        }
      }
    };
    walk(rules);
  }
  return {
    html: { class: document.documentElement.className, dataset: { ...document.documentElement.dataset } },
    body: { class: document.body.className, dataset: { ...document.body.dataset } },
    current_case: window.__td613AshKeep?.current?.() || null,
    current_aia: window.__td613AshLiveAIA?.current?.() || null,
    main: inspect('body > main'),
    rail: inspect('body > .workspace-rail'),
    active_workspace: inspect('.workspace.active'),
    launch: inspect('#launch'),
    relevant_rules: relevantRules,
    document_size: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }
  };
});
await page.screenshot({ path: path.join(out, 'postcase.png'), fullPage: true });
await fs.writeFile(path.join(out, 'postcase.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await context.close();
await browser.close();
console.log(JSON.stringify({ status: 'OBSERVED', artifact: path.join(out, 'postcase.json') }, null, 2));
