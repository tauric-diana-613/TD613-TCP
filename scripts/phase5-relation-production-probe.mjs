#!/usr/bin/env node

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = (process.env.TD613_BASE_URL || process.argv[2] || 'https://td613.com').replace(/\/$/, '');
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/phase5-browser';
const labUrl = `${base}/dome-world/relation-envelope.html?phase5-production=${Date.now()}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function chromeExecutable() {
  const candidates = [
    process.env.TD613_CHROME_PATH,
    process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : null,
    process.platform === 'win32' ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' : null,
    process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : null,
    process.platform === 'linux' ? '/usr/bin/google-chrome' : null,
    process.platform === 'linux' ? '/usr/bin/chromium' : null
  ].filter(Boolean);
  return candidates.find(candidate => fs.existsSync(candidate)) || null;
}

async function outputJson(page) {
  const text = await page.locator('#output').textContent();
  try {
    return JSON.parse(text || '');
  } catch {
    throw new Error(`Phase V output did not contain JSON: ${text}`);
  }
}

async function clickForOutput(page, selector) {
  const before = await page.locator('#output').textContent();
  await page.locator(selector).click();
  await page.waitForFunction(
    previous => document.querySelector('#output')?.textContent !== previous,
    before
  );
  return outputJson(page);
}

async function runAssay(page, mode) {
  await page.locator('#scenario').selectOption(mode);
  return clickForOutput(page, '#runScenario');
}

async function layoutReceipt(page) {
  return page.evaluate(() => {
    const grid = document.querySelector('.grid');
    const interactive = [...document.querySelectorAll('button, input, select, textarea')]
      .filter(node => {
        const style = getComputedStyle(node);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
    const clipped = interactive
      .map(node => ({ id: node.id || node.tagName, rect: node.getBoundingClientRect() }))
      .filter(item => item.rect.left < -1 || item.rect.right > window.innerWidth + 1)
      .map(item => item.id);
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      document_width: document.documentElement.scrollWidth,
      horizontal_overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      grid_columns: getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length,
      clipped_controls: clipped
    };
  });
}

async function buildAndConfirm(page, assurance) {
  await page.locator('#assurance').selectOption(assurance);
  const proposalResult = await clickForOutput(page, '#propose');
  const proposal = proposalResult.proposal;
  const audit = proposalResult.audit;
  assert(proposal?.state === 'PROPOSED', `${assurance}: proposal state was not PROPOSED`);
  assert(
    ['RELATION_PROPOSAL_ADMISSIBLE', 'RELATION_ADMISSIBLE_WITH_WARNINGS'].includes(audit?.outcome),
    `${assurance}: proposal audit was not admissible`
  );
  assert(await page.locator('#confirm').isEnabled(), `${assurance}: confirmation did not become available`);
  assert(await page.locator('#save').isDisabled(), `${assurance}: save became available before confirmation`);
  assert(await page.locator('#export').isDisabled(), `${assurance}: export became available before confirmation`);
  const confirmationResult = await clickForOutput(page, '#confirm');
  assert(confirmationResult.envelope?.state === 'CONFIRMED', `${assurance}: confirmation did not produce CONFIRMED state`);
  assert(confirmationResult.confirmation?.explicit_operator_action === true, `${assurance}: confirmation lost explicit action`);
  assert(confirmationResult.phason_chain?.events?.length >= 2, `${assurance}: Phason confirmation event was not recorded`);
  return { proposalResult, confirmationResult };
}

async function settleViewport(page, width, height) {
  await page.setViewportSize({ width, height });
  await page.waitForFunction(
    expected => window.innerWidth === expected.width && window.innerHeight === expected.height,
    { width, height }
  );
  await page.waitForTimeout(200);
}

await fsp.mkdir(artifactDir, { recursive: true });
const executablePath = chromeExecutable();
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  locale: 'en-US',
  reducedMotion: 'reduce',
  acceptDownloads: true
});
const page = await context.newPage();
const consoleErrors = [];
const interactionRequests = [];
let interactionStarted = false;
page.on('console', message => {
  if (message.type() === 'error' && !message.text().includes('status of 404')) {
    consoleErrors.push(message.text());
  }
});
page.on('pageerror', error => consoleErrors.push(error.message));
page.on('request', request => {
  if (interactionStarted) interactionRequests.push({ method: request.method(), url: request.url() });
});

const report = {
  schema: 'td613.phase5.production-demonstration/v0.1',
  status: 'RUNNING',
  base_url: base,
  lab_url: labUrl,
  browser: executablePath ? 'installed-chrome-headless' : 'playwright-chromium-headless',
  reduced_motion: true,
  desktop: null,
  mobile_portrait: null,
  functional: {},
  console_errors: consoleErrors,
  interaction_requests: interactionRequests,
  production_demonstrated: false,
  error: null
};

async function persistReport() {
  await fsp.writeFile(
    path.join(artifactDir, 'phase5-production-demonstration.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
}

try {
  await page.goto(labUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.locator('h1').waitFor({ state: 'visible' });
  assert((await page.title()).includes('The Third Object'), 'Phase V production title was not observed');
  assert((await page.locator('body').innerText()).includes('relation ≠ identity'), 'Phase V non-claims were not visible');
  assert(!(await page.locator('body').innerText()).includes('\uFFFD'), 'Replacement characters were visible');
  await page.evaluate(() => localStorage.clear());

  const desktop = await layoutReceipt(page);
  assert(desktop.horizontal_overflow === 0, 'Desktop relation lab has horizontal overflow');
  assert(desktop.grid_columns === 2, 'Desktop relation lab must render two columns');
  assert(desktop.clipped_controls.length === 0, 'Desktop relation lab clips interactive controls');
  assert((await page.locator('#outcome').textContent()) === 'No relation exists.', 'A relation existed on initial load');
  assert(await page.locator('#confirm').isDisabled(), 'Confirmation was enabled on initial load');
  assert(await page.locator('#save').isDisabled(), 'Save was enabled on initial load');
  assert(await page.locator('#export').isDisabled(), 'Export was enabled on initial load');

  interactionStarted = true;
  const r0 = await buildAndConfirm(page, 'R0_RECEIPT_REFERENCES_ONLY');
  assert(r0.proposalResult.proposal?.assurance_class === 'R0_RECEIPT_REFERENCES_ONLY', 'R0 assurance class drifted');
  assert(r0.proposalResult.proposal?.ash_reference === null, 'R0 created an artifact reference');
  assert(!Object.hasOwn(r0.confirmationResult.envelope, 'artifact_digest'), 'R0 envelope exposed artifact_digest');

  const r0Replay = await runAssay(page, 'replay');
  assert(r0Replay.outcome === 'RELATION_REPLAY_VERIFIED_R0', 'R0 intact replay did not verify');
  assert(r0Replay.network_called === false, 'R0 replay called the network');
  assert(r0Replay.artifact_reloaded === false, 'R0 replay reloaded artifact content');

  const tamper = await runAssay(page, 'tamper');
  assert(tamper.outcome === 'RELATION_REPLAY_HELD_TAMPER', 'Tampered relation was not held');
  const artifactInjection = await runAssay(page, 'artifact');
  assert(artifactInjection.outcome === 'RELATION_REPLAY_REJECTED_AUTHORITY_BREACH', 'artifact_digest injection was not rejected');
  const identityInjection = await runAssay(page, 'identity');
  assert(identityInjection.outcome === 'RELATION_REPLAY_REJECTED_AUTHORITY_BREACH', 'Identity claim injection was not rejected');
  const causationInjection = await runAssay(page, 'causation');
  assert(causationInjection.outcome === 'RELATION_REPLAY_REJECTED_AUTHORITY_BREACH', 'Causation claim injection was not rejected');
  const phasonFork = await runAssay(page, 'phason');
  assert(phasonFork.outcome === 'RELATION_REPLAY_HELD_PHASON_FORK', 'Phason fork was not held');
  assert(phasonFork.fork_detected === true, 'Phason fork was not identified');
  assert(phasonFork.active_relation_unchanged === true, 'Phason fork assay mutated the active relation');
  assert(phasonFork.branch_events?.length === 3, 'Phason fork assay erased a branch event');
  const carrier = await runAssay(page, 'carrier');
  assert(carrier.outcome !== 'MARROWLINE_RELATION_CARRIER_VERIFIED', 'Mutated Marrowline carrier was accepted');
  const nonce = await runAssay(page, 'nonce');
  assert(nonce.outcome.includes('NONCE'), 'Nonce reuse did not produce a distinct hold');
  const openField = await runAssay(page, 'openfield');
  assert(openField.open_field_promotion === false, 'Open Field relation was promoted');

  await page.locator('#save').click();
  await page.waitForFunction(() => document.querySelector('#notice')?.textContent.startsWith('Explicit local save completed'));
  const savedKeys = await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('td613.phase5.relation.')));
  assert(savedKeys.length === 1, 'Explicit save did not create exactly one local relation receipt');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export').click();
  const download = await downloadPromise;
  assert((await download.suggestedFilename()).startsWith('td613-phase5-rel_'), 'Relation export filename drifted');

  await page.screenshot({ path: path.join(artifactDir, 'phase5-desktop.png'), fullPage: true });
  report.desktop = desktop;

  await page.reload({ waitUntil: 'networkidle' });
  const persistedKeys = await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('td613.phase5.relation.')));
  assert(persistedKeys.length === 1, 'Saved relation receipt did not persist across refresh');
  await page.evaluate(() => localStorage.clear());

  const r1 = await buildAndConfirm(page, 'R1_ROUTE_SCOPED_ARTIFACT_REFERENCE');
  assert(/^hmac-sha256:[0-9a-f]{64}$/.test(r1.proposalResult.proposal?.ash_reference || ''), 'R1 did not use route-scoped HMAC');
  assert(!JSON.stringify(r1.confirmationResult).includes('Phase V local demonstration artifact'), 'R1 envelope exposed artifact content');
  assert((await page.locator('#keyState').textContent()) === 'non-extractable', 'R1 key posture was not non-extractable');
  const r1Replay = await runAssay(page, 'replay');
  assert(r1Replay.outcome === 'RELATION_REPLAY_VERIFIED', 'R1 intact replay did not verify');
  const missingKey = await runAssay(page, 'key');
  assert(missingKey.outcome === 'RELATION_REPLAY_HELD_KEY_UNAVAILABLE', 'Missing R1 key was not distinguished from tamper');

  const nonGetRequests = interactionRequests.filter(request => request.method !== 'GET');
  assert(nonGetRequests.length === 0, `Phase V interactions emitted non-GET requests: ${JSON.stringify(nonGetRequests)}`);

  report.functional = {
    no_relation_on_load: true,
    r0_proposal: r0.proposalResult.audit.outcome,
    r0_confirmation: r0.confirmationResult.envelope.state,
    r0_replay: r0Replay.outcome,
    r1_proposal: r1.proposalResult.audit.outcome,
    r1_confirmation: r1.confirmationResult.envelope.state,
    r1_replay: r1Replay.outcome,
    missing_key: missingKey.outcome,
    tamper: tamper.outcome,
    artifact_injection: artifactInjection.outcome,
    identity_injection: identityInjection.outcome,
    causation_injection: causationInjection.outcome,
    phason_fork: phasonFork.outcome,
    phason_branch_events_preserved: phasonFork.branch_events.length,
    carrier_mutation: carrier.outcome,
    nonce_reuse: nonce.outcome,
    open_field_promotion: openField.open_field_promotion,
    phason_events: r1.confirmationResult.phason_chain.events.length,
    explicit_local_save: true,
    local_persistence_after_refresh: true,
    export_download: true,
    non_get_interaction_requests: nonGetRequests.length
  };

  await settleViewport(page, 390, 844);
  await page.reload({ waitUntil: 'networkidle' });
  const mobile = await layoutReceipt(page);
  assert(mobile.horizontal_overflow === 0, 'Mobile relation lab has horizontal overflow');
  assert(mobile.grid_columns === 1, 'Mobile relation lab must render one column');
  assert(mobile.clipped_controls.length === 0, 'Mobile relation lab clips interactive controls');
  const mobileR0 = await buildAndConfirm(page, 'R0_RECEIPT_REFERENCES_ONLY');
  assert(mobileR0.confirmationResult.envelope?.state === 'CONFIRMED', 'Mobile confirmation failed');
  const mobileReplay = await runAssay(page, 'replay');
  assert(mobileReplay.outcome === 'RELATION_REPLAY_VERIFIED_R0', 'Mobile replay failed');
  await page.screenshot({ path: path.join(artifactDir, 'phase5-mobile-portrait.png'), fullPage: true });
  report.mobile_portrait = mobile;

  assert(consoleErrors.length === 0, `Browser console errors observed: ${consoleErrors.join(' | ')}`);
  report.status = 'PASS';
  report.production_demonstrated = true;
  await persistReport();
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.status = 'HOLD_FOR_REPAIR';
  report.error = { message: error?.message || String(error), stack: error?.stack || null };
  try {
    await page.screenshot({ path: path.join(artifactDir, 'phase5-production-held.png'), fullPage: true });
  } catch {
    // Preserve the original failure when evidence capture also fails.
  }
  await persistReport();
  console.error(JSON.stringify(report, null, 2));
  throw error;
} finally {
  await browser.close();
}
