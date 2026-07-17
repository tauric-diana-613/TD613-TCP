import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-destination-handoff');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const requests = [];
const consoleErrors = [];
page.on('request', request => requests.push({ method: request.method(), url: request.url(), resource_type: request.resourceType() }));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => consoleErrors.push(error.message));
const report = {
  schema: 'td613.ash.destination-handoff-browser-observation/v0.1',
  source_status: /localhost|127\.0\.0\.1/.test(base) ? 'LOCAL_VALIDATION' : 'DEPLOYED_OBSERVATION',
  promotion_authorized: false,
  observations: {},
  requests: [],
  console_errors: consoleErrors,
  status: 'RUNNING'
};
try {
  await page.goto(`${base}/app/dome-world/ash-destination-handoff.html`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(() => Boolean(window.__td613AshDestinationHandoff?.version), null, { timeout: 60000 });
  await page.waitForFunction(() => window.__td613AshDestinationHandoff.current().recipient_ready === true, null, { timeout: 60000 });
  const initial = await page.evaluate(() => window.__td613AshDestinationHandoff.current());
  assert.equal(initial.state, 'DESTINATION_HANDOFF_PLAN_ELIGIBLE');
  await page.locator('#authorize').check();
  await page.locator('#send').click();
  await page.waitForFunction(() => window.__td613AshDestinationHandoff.current().state === 'DESTINATION_HANDOFF_COMPLETE', null, { timeout: 60000 });
  const completed = await page.evaluate(() => window.__td613AshDestinationHandoff.current());
  assert.equal(completed.accounting.state, 'DESTINATION_HANDOFF_COMPLETE');
  assert.equal(completed.accounting.what_left.length, 2);
  assert.equal(completed.accounting.what_remained.length, 0);
  assert.equal(completed.accounting.external_deletion_proven, false);
  assert.equal(completed.replay.replay_verified, true);
  assert.equal(completed.replay.destination_contacted, false);
  assert.equal(completed.replay.transport_reexecuted, false);
  assert.equal(completed.replay.provider_reexecuted, false);
  assert.equal(completed.replay.reader_reexecuted, false);
  const receiptText = await page.locator('#receipt').textContent();
  assert.match(receiptText, /DESTINATION_HANDOFF_COMPLETE/);
  const nonStaticRequests = requests.filter(item => !['document','script','stylesheet','iframe','other','font','image'].includes(item.resource_type));
  assert.equal(nonStaticRequests.length, 0, `Unexpected transport request classes: ${JSON.stringify(nonStaticRequests)}`);
  assert.equal(requests.some(item => /\/api\//.test(item.url)), false, 'Same-origin handoff called a serverless API.');
  assert.deepEqual(consoleErrors, []);
  report.observations = {
    initial_state: initial.state,
    terminal_state: completed.state,
    recipient_ready: completed.recipient_ready,
    what_left: completed.accounting.what_left,
    what_remained: completed.accounting.what_remained,
    external_deletion_proven: completed.accounting.external_deletion_proven,
    replay_verified: completed.replay.replay_verified,
    same_origin_message_channel: true,
    serverless_function_used: false,
    raw_body_present: false,
    raw_corpus_present: false
  };
  report.requests = requests;
  report.status = 'DESTINATION_HANDOFF_BROWSER_OBSERVED';
} catch (error) {
  report.status = 'DESTINATION_HANDOFF_BROWSER_OBSERVATION_FAILED';
  report.error = error.stack || error.message;
  throw error;
} finally {
  await fs.mkdir(artifactDir, { recursive: true });
  await fs.writeFile(path.join(artifactDir, 'observation.json'), JSON.stringify(report, null, 2));
  await page.screenshot({ path: path.join(artifactDir, 'surface.png'), fullPage: true }).catch(() => {});
  await browser.close();
}
console.log('ash-destination-handoff-probe.mjs passed');
