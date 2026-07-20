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
const events = [];
page.on('console', message => events.push({ type: `console:${message.type()}`, text: message.text() }));
await page.goto(`${base}/dome-world/ash-keep.html?presentation=aia`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => document.documentElement.dataset.ashAiaReady === 'true'
  && document.documentElement.dataset.ashAiaIngress === 'INTEGRATED_EXACT_CONTROLS'
  && window.__td613AshLiveAIA?.current?.().task === 'setup');
await page.locator('#newTitle').fill('AIA2 local document diagnosis');
await page.locator('#newProfile').selectOption('research');
await page.locator('#newCase').click();
await page.waitForFunction(() => Boolean(window.__td613AshKeep?.current?.().case_id)
  && window.__td613AshLiveAIA?.current?.().task === 'document');
await page.locator('[data-aia-task="document"]').click();
await page.waitForFunction(() => document.querySelector('#workspace-draft')?.classList.contains('active')
  && document.querySelector('#localTextFile')?.getClientRects().length > 0);
const text = 'TD613 AIA2 focused local document diagnosis; no recipient route.';
await page.locator('#localTextFile').setInputFiles({ name: 'aia2-diagnosis.txt', mimeType: 'text/plain', buffer: Buffer.from(text) });
const samples = [];
for (const delay of [0, 50, 150, 400, 1000, 2500]) {
  if (delay) await page.waitForTimeout(delay - samples.at(-1).delay);
  samples.push(await page.evaluate(({ delayValue, expected }) => ({
    delay: delayValue,
    route: window.__td613AshLiveAIA?.current?.().route || null,
    task: window.__td613AshLiveAIA?.current?.().task || null,
    lifecycle_state: window.__td613AshLiveAIA?.current?.().lifecycle_state || null,
    lifecycle_next_action: window.__td613AshLiveAIA?.current?.().lifecycle_next_action || null,
    active_workspace: document.querySelector('.workspace.active')?.id || null,
    file_count: document.querySelector('#localTextFile')?.files?.length || 0,
    draft: document.querySelector('#draftBody')?.value || '',
    draft_matches: document.querySelector('#draftBody')?.value?.includes(expected) || false,
    task_marker: document.querySelector('[data-aia-task][aria-current="step"]')?.dataset.aiaTask || null,
    body_held: document.body.dataset.ashAiaHeld || null,
    live_text: document.querySelector('[data-aia-live]')?.textContent?.trim() || null,
    input_connected: document.querySelector('#localTextFile')?.isConnected || false
  }), { delayValue: delay, expected: text }));
}
const report = {
  schema: 'td613.ash.aia2-local-document-diagnosis/v0.1',
  expected_text: text,
  samples,
  events
};
await page.screenshot({ path: path.join(out, 'local-document.png'), fullPage: true });
await fs.writeFile(path.join(out, 'postcase.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await context.close();
await browser.close();
console.log(JSON.stringify({ status: 'OBSERVED', artifact: path.join(out, 'postcase.json') }, null, 2));
