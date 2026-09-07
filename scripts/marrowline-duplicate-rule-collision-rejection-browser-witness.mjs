import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import {
  runMarrowlineDuplicateRuleCollisionRejectionAssay
} from './marrowline-duplicate-rule-collision-rejection-assay.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/marrowline-duplicate-rule-collision-rejection');
const artifactName = 'marrowline-duplicate-rule-collision-rejection-v0.1.html';
const receiptPath = path.join(artifactDir, `marrowline-duplicate-rule-collision-rejection-v0.1-${browserName}-receipt.json`);
const staticAssay = runMarrowlineDuplicateRuleCollisionRejectionAssay();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function escapeJsonForScript(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function lawfulState(stepId, recovery) {
  const status = (group, label) => Object.prototype.hasOwnProperty.call(group, label) ? group[label] : 'ABSENT';
  return Object.freeze({
    step_id: stepId,
    kind: 'LAWFUL_RECOVERY',
    finding_count: String(recovery.finding_count),
    membership: recovery.finding_rule_ids.join(' + '),
    a_match: status(recovery.matching_statuses, 'A'),
    a_mismatch: status(recovery.mismatch_statuses, 'A'),
    b_match: status(recovery.matching_statuses, 'B'),
    b_mismatch: status(recovery.mismatch_statuses, 'B'),
    collision_outcome: 'N/A',
    collision_error: ''
  });
}

function collisionState(stepId, collision) {
  return Object.freeze({
    step_id: stepId,
    kind: 'REJECTED_COLLISION',
    finding_count: '2 hostile occurrences',
    membership: `${collision.rule_id} + ${collision.rule_id}`,
    a_match: 'N/A',
    a_mismatch: 'N/A',
    b_match: 'N/A',
    b_mismatch: 'N/A',
    collision_outcome: collision.rejected && !collision.carry_case_returned ? 'REJECTED_BEFORE_CARRY_CASE' : 'INVALID',
    collision_error: collision.error
  });
}

function buildSteps(report) {
  return Object.freeze({
    AA_REJECT_1: collisionState('AA_REJECT_1', report.collisions.D_AA),
    P_A_1: lawfulState('P_A_1', report.recoveries.P_A_AFTER_D_AA_1),
    P_AB_AFTER_AA: lawfulState('P_AB_AFTER_AA', report.recoveries.P_AB_AFTER_D_AA),
    AA_REJECT_2: collisionState('AA_REJECT_2', report.collisions.D_AA),
    P_A_2: lawfulState('P_A_2', report.recoveries.P_A_AFTER_D_AA_2),
    BB_REJECT_1: collisionState('BB_REJECT_1', report.collisions.D_BB),
    P_B_1: lawfulState('P_B_1', report.recoveries.P_B_AFTER_D_BB_1),
    P_AB_AFTER_BB: lawfulState('P_AB_AFTER_BB', report.recoveries.P_AB_AFTER_D_BB),
    BB_REJECT_2: collisionState('BB_REJECT_2', report.collisions.D_BB),
    P_B_2: lawfulState('P_B_2', report.recoveries.P_B_AFTER_D_BB_2)
  });
}

function renderHtml(report) {
  const steps = buildSteps(report);
  const embeddedReport = escapeJsonForScript(report);
  const embeddedSteps = escapeJsonForScript(steps);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'">
<title>TD613 Marrowline Duplicate-Rule Collision Rejection</title>
<style>
:root{font-family:system-ui,sans-serif;color-scheme:light dark}body{margin:0;padding:24px;max-width:980px}main{display:grid;gap:16px}.case{border:1px solid currentColor;border-radius:16px;padding:16px}.buttons{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}button{font:inherit;min-height:44px;padding:10px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.status{font-weight:700}.muted{opacity:.72}@media(max-width:620px){body{padding:14px}.buttons,.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<main data-duplicate-collision-assay>
  <header><div class="muted">Local-only scientific assay</div><h1>Duplicate rule identity stops before transport.</h1></header>
  <nav class="buttons" aria-label="Collision schedules">
    <button type="button" data-step="AA_REJECT_1">AA reject · first pass</button>
    <button type="button" data-step="P_A_1">A lawful recovery</button>
    <button type="button" data-step="P_AB_AFTER_AA">AB lawful pair after AA</button>
    <button type="button" data-step="AA_REJECT_2">AA reject · replay</button>
    <button type="button" data-step="P_A_2">A lawful recovery · replay</button>
    <button type="button" data-step="BB_REJECT_1">BB reject · first pass</button>
    <button type="button" data-step="P_B_1">B lawful recovery</button>
    <button type="button" data-step="P_AB_AFTER_BB">AB lawful pair after BB</button>
    <button type="button" data-step="BB_REJECT_2">BB reject · replay</button>
    <button type="button" data-step="P_B_2">B lawful recovery · replay</button>
  </nav>
  <section class="case" aria-live="polite">
    <div id="stepId" class="muted"></div>
    <div><strong>Kind</strong> <span id="kind"></span></div>
    <div><strong>Finding count</strong> <span id="findingCount"></span></div>
    <div><strong>Membership</strong> <span id="membership"></span></div>
    <div class="grid">
      <div><strong>A match</strong><div id="aMatch" class="status"></div><strong>A mismatch</strong><div id="aMismatch" class="status"></div></div>
      <div><strong>B match</strong><div id="bMatch" class="status"></div><strong>B mismatch</strong><div id="bMismatch" class="status"></div></div>
    </div>
    <div><strong>Collision outcome</strong> <span id="collisionOutcome"></span></div>
    <div><strong>Collision error</strong> <span id="collisionError"></span></div>
  </section>
  <footer class="muted">Duplicate occurrence ≠ distinct rule identity. Rejection ≠ future-state memory.</footer>
</main>
<script>
(() => {
  'use strict';
  const report = ${embeddedReport};
  const steps = ${embeddedSteps};
  let selected = null;
  const render = id => {
    const item = steps[id];
    if (!item) throw new Error('unknown collision assay step');
    selected = id;
    document.getElementById('stepId').textContent = id;
    document.getElementById('kind').textContent = item.kind;
    document.getElementById('findingCount').textContent = item.finding_count;
    document.getElementById('membership').textContent = item.membership;
    document.getElementById('aMatch').textContent = item.a_match;
    document.getElementById('aMismatch').textContent = item.a_mismatch;
    document.getElementById('bMatch').textContent = item.b_match;
    document.getElementById('bMismatch').textContent = item.b_mismatch;
    document.getElementById('collisionOutcome').textContent = item.collision_outcome;
    document.getElementById('collisionError').textContent = item.collision_error;
  };
  for (const button of document.querySelectorAll('[data-step]')) button.addEventListener('click', () => render(button.dataset.step));
  render('AA_REJECT_1');
  window.__TD613_MARROWLINE_DUPLICATE_COLLISION__ = Object.freeze({
    report,
    steps,
    select: render,
    getState: () => ({
      selected,
      stepId: document.getElementById('stepId').textContent,
      kind: document.getElementById('kind').textContent,
      findingCount: document.getElementById('findingCount').textContent,
      membership: document.getElementById('membership').textContent,
      aMatch: document.getElementById('aMatch').textContent,
      aMismatch: document.getElementById('aMismatch').textContent,
      bMatch: document.getElementById('bMatch').textContent,
      bMismatch: document.getElementById('bMismatch').textContent,
      collisionOutcome: document.getElementById('collisionOutcome').textContent,
      collisionError: document.getElementById('collisionError').textContent
    })
  });
})();
</script>
</body>
</html>`;
}

function isFirefoxBrowserChromeFaviconCspDiagnostic(message) {
  if (browserName !== 'firefox' || message.type() !== 'error') return false;
  const text = String(message.text() || '');
  const location = String(message.location()?.url || '');
  return text.includes('Content-Security-Policy')
    && text.includes('/favicon.ico')
    && (location.includes('resource:///modules/FaviconLoader.sys.mjs') || text.includes('FaviconLoader.sys.mjs'));
}

function comparableObservation(value) {
  const { step_id: _stepId, selected: _selected, ...rest } = value;
  return JSON.stringify(rest);
}

const html = renderHtml(staticAssay);
const artifactSha256 = crypto.createHash('sha256').update(html, 'utf8').digest('hex');
const artifactBytes = Buffer.byteLength(html, 'utf8');
for (const forbidden of ['localStorage.setItem', 'sessionStorage.setItem', 'indexedDB', 'BroadcastChannel', 'serviceWorker', 'fetch(', 'XMLHttpRequest', 'WebSocket']) {
  assert(!html.includes(forbidden), `Duplicate-collision assay artifact contains persistence/network primitive: ${forbidden}`);
}
assert(!html.includes('<input'), 'Duplicate-collision assay artifact may not expose free-text input');
assert(staticAssay.duplicate_a_rejected === true, 'static collision assay lost D_AA rejection');
assert(staticAssay.duplicate_b_rejected === true, 'static collision assay lost D_BB rejection');
assert(staticAssay.repeated_collision_nonpoisoning === true, 'static collision assay lost rejection non-poisoning');
assert(staticAssay.lawful_surfaces_match_parent === true, 'static collision assay drifted from #1059 lawful baselines');

await fs.mkdir(artifactDir, { recursive: true });
await fs.writeFile(path.join(artifactDir, artifactName), html, 'utf8');

const serverHits = [];
const server = http.createServer((request, response) => {
  serverHits.push({ method: request.method, url: request.url });
  if (request.method === 'GET' && request.url === `/${artifactName}`) {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    response.end(html);
    return;
  }
  response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  response.end('not found');
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Duplicate-collision witness server did not bind');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const receipt = {
  schema: 'td613.marrowline.duplicate-rule-collision-rejection-browser-witness/v0.1-local-only',
  browser: browserName,
  status: 'RUNNING',
  assay_local_only: true,
  artifact: {
    name: artifactName,
    sha256: artifactSha256,
    bytes: artifactBytes,
    generated_from_canonical_assay: true,
    product_source_bytes_mutated: false
  },
  collisions: staticAssay.collisions,
  recoveries: staticAssay.recoveries,
  observations: [],
  convergence: {},
  network: { document_requests: 0, unexpected_requests: [], server_hits: [] },
  storage: {},
  errors: { console: [], page: [], browser_chrome: [] },
  authority: {
    release_authority: false,
    human_closure_required: true,
    provider_call_performed: false,
    production_mutation: false
  },
  claim_ceiling: 'bounded-two-rule-duplicate-collision-rejection-nonpoisoning-browser-only',
  seal: '⟐'
};

let browser;
let terminalError = null;
try {
  browser = await engine.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' });
  const requests = [];
  context.on('request', request => requests.push(request.url()));
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.on('console', message => {
    if (message.type() !== 'error') return;
    if (isFirefoxBrowserChromeFaviconCspDiagnostic(message)) {
      receipt.errors.browser_chrome.push({ text: message.text(), location: message.location()?.url || null });
      return;
    }
    receipt.errors.console.push({ text: message.text(), location: message.location()?.url || null });
  });
  page.on('pageerror', error => receipt.errors.page.push({ text: error.message }));

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-duplicate-collision-assay]');
  const boot = await page.evaluate(() => ({
    state: window.__TD613_MARROWLINE_DUPLICATE_COLLISION__.getState(),
    report: window.__TD613_MARROWLINE_DUPLICATE_COLLISION__.report,
    steps: window.__TD613_MARROWLINE_DUPLICATE_COLLISION__.steps,
    storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie },
    csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null,
    free_text_inputs: document.querySelectorAll('input,textarea,[contenteditable="true"]').length
  }));
  assert(boot.state.selected === 'AA_REJECT_1', 'Duplicate-collision artifact did not boot first AA rejection');
  assert(boot.state.collisionOutcome === 'REJECTED_BEFORE_CARRY_CASE', 'Duplicate-collision AA boot outcome drifted');
  assert(boot.storage.local === 0 && boot.storage.session === 0 && boot.storage.cookie === '', 'Duplicate-collision browser artifact inherited persistence');
  assert(/connect-src 'none'/.test(boot.csp || ''), 'Duplicate-collision browser artifact lost connection-denying CSP');
  assert(boot.free_text_inputs === 0, 'Duplicate-collision browser artifact exposed free-text input');

  const observe = async stepId => {
    await page.evaluate(id => window.__TD613_MARROWLINE_DUPLICATE_COLLISION__.select(id), stepId);
    const observed = await page.evaluate(() => ({
      state: window.__TD613_MARROWLINE_DUPLICATE_COLLISION__.getState(),
      storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }
    }));
    const expected = boot.steps[stepId];
    assert(expected, `unknown duplicate-collision step ${stepId}`);
    assert(observed.state.selected === stepId, `Duplicate-collision browser failed to select ${stepId}`);
    const map = {
      kind: 'kind',
      findingCount: 'finding_count',
      membership: 'membership',
      aMatch: 'a_match',
      aMismatch: 'a_mismatch',
      bMatch: 'b_match',
      bMismatch: 'b_mismatch',
      collisionOutcome: 'collision_outcome',
      collisionError: 'collision_error'
    };
    for (const [observedKey, expectedKey] of Object.entries(map)) {
      assert(observed.state[observedKey] === expected[expectedKey], `Duplicate-collision ${observedKey} drifted for ${stepId}`);
    }
    assert(observed.storage.local === 0 && observed.storage.session === 0 && observed.storage.cookie === '', `Duplicate-collision browser accumulated persistence at ${stepId}`);
    return {
      step_id: stepId,
      selected: observed.state.selected,
      kind: observed.state.kind,
      finding_count: observed.state.findingCount,
      membership: observed.state.membership,
      a_match: observed.state.aMatch,
      a_mismatch: observed.state.aMismatch,
      b_match: observed.state.bMatch,
      b_mismatch: observed.state.bMismatch,
      collision_outcome: observed.state.collisionOutcome,
      collision_error: observed.state.collisionError
    };
  };

  const schedule = [
    'AA_REJECT_1', 'P_A_1', 'P_AB_AFTER_AA', 'AA_REJECT_2', 'P_A_2',
    'BB_REJECT_1', 'P_B_1', 'P_AB_AFTER_BB', 'BB_REJECT_2', 'P_B_2'
  ];
  for (const stepId of schedule) receipt.observations.push(await observe(stepId));

  assert(comparableObservation(receipt.observations[0]) === comparableObservation(receipt.observations[3]), 'AA collision replay drifted');
  assert(comparableObservation(receipt.observations[1]) === comparableObservation(receipt.observations[4]), 'P_A recovery replay drifted after repeated AA collision');
  assert(comparableObservation(receipt.observations[5]) === comparableObservation(receipt.observations[8]), 'BB collision replay drifted');
  assert(comparableObservation(receipt.observations[6]) === comparableObservation(receipt.observations[9]), 'P_B recovery replay drifted after repeated BB collision');
  assert(comparableObservation(receipt.observations[2]) === comparableObservation(receipt.observations[7]), 'P_AB recovery changed with collision identity');

  receipt.convergence = {
    duplicate_a_rejected: boot.report.duplicate_a_rejected,
    duplicate_b_rejected: boot.report.duplicate_b_rejected,
    collisions_fail_before_carry_case: boot.report.collisions_fail_before_carry_case,
    lawful_surfaces_match_parent: boot.report.lawful_surfaces_match_parent,
    repeated_collision_nonpoisoning: boot.report.repeated_collision_nonpoisoning,
    collision_identity_does_not_change_pair_recovery: boot.report.collision_identity_does_not_change_pair_recovery,
    matching_decision_invariant: boot.report.matching_decision_invariant,
    mismatch_decision_invariant: boot.report.mismatch_decision_invariant,
    hidden_collision_state_carried: boot.report.hidden_collision_state_carried,
    browser_replay_invariant: true,
    browser_persistence_accumulated: false
  };
  receipt.storage = { empty_through_collision_rejection_replays: true };
  receipt.network.document_requests = requests.filter(requestUrl => requestUrl === url).length;
  receipt.network.unexpected_requests = requests.filter(requestUrl => requestUrl !== url);
  receipt.network.server_hits = serverHits;
  assert(receipt.network.document_requests === 1, `Duplicate-collision witness expected one assay document load, observed ${receipt.network.document_requests}`);
  assert(receipt.network.unexpected_requests.length === 0, `Duplicate-collision witness observed unexpected requests: ${receipt.network.unexpected_requests.join(', ')}`);
  assert(receipt.errors.console.length === 0 && receipt.errors.page.length === 0, 'Duplicate-collision witness observed page/runtime errors');

  receipt.status = 'PASS';
  await context.close();
} catch (error) {
  terminalError = error;
  receipt.status = 'FAIL';
  receipt.errors.page.push({ text: error?.stack || error?.message || String(error) });
} finally {
  if (browser) await browser.close().catch(() => {});
  await new Promise(resolve => server.close(resolve));
  await fs.writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
}

if (terminalError) throw terminalError;
console.log(`Marrowline duplicate-rule collision rejection browser witness (${browserName}): PASS`);
