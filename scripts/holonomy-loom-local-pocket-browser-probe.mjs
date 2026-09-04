import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const browserName = process.env.TD613_BROWSER || 'chromium';
const engines = { chromium, firefox, webkit };
const engine = engines[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = process.env.TD613_ARTIFACT_DIR || `artifacts/holonomy-loom-local-pocket/${browserName}`;
fs.mkdirSync(artifactDir, { recursive:true });

const sourcePath = path.resolve('app/dome-world/previews/a16-r0/holonomy-loom-local-pocket.html');
const fileUrl = pathToFileURL(sourcePath).href;
const browser = await engine.launch({ headless:true });
const context = await browser.newContext({ serviceWorkers:'block' });
const page = await context.newPage();
const remoteRequests = [];
const consoleErrors = [];

page.on('request', request => {
  if (/^https?:/i.test(request.url())) remoteRequests.push(request.url());
});
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});

const receipt = {
  schema:'td613.holonomy-loom.local-pocket-browser/v0.1',
  browser:browserName,
  source:fileUrl,
  status:'HOLD',
  observations:[]
};

function record(name, value){ receipt.observations.push({ name, value }); }

try {
  await page.goto(fileUrl, { waitUntil:'load' });
  await page.waitForSelector('#draft');

  const runtime = await page.evaluate(() => window.__TD613_HOLONOMY_LOOM_LOCAL_POCKET__);
  assert.equal(runtime?.local_first, true);
  assert.equal(runtime?.network_required, false);
  assert.equal(runtime?.remote_model_required, false);
  assert.equal(runtime?.automatic_persistence, false);
  assert.equal(runtime?.hard_release_gate, true);
  assert.equal(runtime?.route_context_source, 'human-declared-only');
  record('runtime_contract', 'PASS');

  await page.fill('#draft', 'Hello friend. This is an ordinary message.');
  await page.click('#check');
  assert.equal((await page.locator('.traffic').innerText()).trim(), 'GREEN');
  assert.equal(await page.locator('#copy').isDisabled(), false);
  record('clean_green', 'PASS');

  await page.fill('#draft', 'Please email alice@example.com about tomorrow.');
  await page.click('#check');
  assert.equal((await page.locator('.traffic').innerText()).trim(), 'YELLOW');
  assert.equal(await page.locator('#copy').isDisabled(), false);
  assert.match(await page.locator('#result').innerText(), /can point back to a person or organization/i);
  record('email_yellow', 'PASS');

  await page.fill('#protected', 'Project Cello');
  await page.fill('#draft', 'Project Cello should stay in this room.');
  await page.click('#check');
  assert.equal((await page.locator('.traffic').innerText()).trim(), 'RED');
  assert.equal(await page.locator('#copy').isDisabled(), true);
  assert.match(await page.locator('#result').innerText(), /exact text must stay private/i);
  record('user_rule_red_blocks_copy', 'PASS');

  await page.fill('#draft', 'Project Cello changed after the check.');
  assert.equal(await page.locator('#copy').isDisabled(), true, 'Editing after a check must relock copy.');
  record('mutation_relocks_copy', 'PASS');

  await page.click('#safer');
  assert.doesNotMatch(await page.inputValue('#draft'), /Project Cello/);
  assert.equal((await page.locator('.traffic').innerText()).trim(), 'GREEN');
  assert.equal(await page.locator('#copy').isDisabled(), false);
  record('safer_copy_rechecks', 'PASS');

  await page.fill('#protected', '');
  await page.fill('#draft', 'This sentence came from the earlier note.');
  await page.check('#anotherJourney');
  await page.fill('#journeyLabel', 'earlier note');
  await page.click('#check');
  assert.equal((await page.locator('.traffic').innerText()).trim(), 'YELLOW');
  const routeText = await page.locator('#result').innerText();
  assert.match(routeText, /came from another journey/i);
  assert.match(routeText, /not claiming the connection proves truth/i);
  record('human_declared_route_context', 'PASS');

  const beforeAttempts = await page.evaluate(() => window.__TD613_HOLONOMY_LOOM_LOCAL_POCKET__.networkAudit.attempts);
  const blocked = await page.evaluate(async () => {
    try { await window.fetch('https://example.invalid/td613-local-pocket-hostile'); return false; }
    catch (error) { return String(error?.message || error).includes('HOLONOMY_LOOM_LOCAL_NETWORK_BLOCK'); }
  });
  const afterAttempts = await page.evaluate(() => window.__TD613_HOLONOMY_LOOM_LOCAL_POCKET__.networkAudit.attempts);
  assert.equal(blocked, true, 'Explicit hostile fetch must be blocked by the pocket runtime.');
  assert.equal(afterAttempts, beforeAttempts + 1, 'Blocked network attempt must be observable locally.');
  assert.deepEqual(remoteRequests, [], 'No HTTP(S) request may leave the pocket during the probe.');
  record('hostile_network_attempt_blocked', 'PASS');
  record('remote_request_count', remoteRequests.length);

  assert.deepEqual(consoleErrors, [], 'Pocket probe must not emit console errors during ordinary operation.');
  receipt.status = 'PASS';
} catch (error) {
  receipt.status = 'RED';
  receipt.error = { name:error?.name || 'Error', message:error?.message || String(error), stack:error?.stack || null };
  throw error;
} finally {
  receipt.remote_requests = remoteRequests;
  receipt.console_errors = consoleErrors;
  fs.writeFileSync(path.join(artifactDir, 'holonomy-loom-local-pocket.json'), `${JSON.stringify(receipt, null, 2)}\n`);
  await browser.close();
}

console.log(`Holonomy Loom local-pocket browser probe passed in ${browserName}.`);
