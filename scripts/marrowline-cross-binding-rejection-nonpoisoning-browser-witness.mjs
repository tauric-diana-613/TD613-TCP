import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import {
  runMarrowlineCrossBindingRejectionNonpoisoningAssay
} from './marrowline-cross-binding-rejection-nonpoisoning-assay.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/marrowline-cross-binding-rejection-nonpoisoning');
const artifactName = 'marrowline-cross-binding-rejection-nonpoisoning-v0.1.html';
const receiptPath = path.join(artifactDir, `marrowline-cross-binding-rejection-nonpoisoning-v0.1-${browserName}-receipt.json`);
const staticAssay = runMarrowlineCrossBindingRejectionNonpoisoningAssay();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function escapeJsonForScript(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function renderHtml(report) {
  const embedded = escapeJsonForScript(report);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'">
<title>TD613 Marrowline Cross-Binding Rejection Non-Poisoning</title>
<style>
:root{font-family:system-ui,sans-serif;color-scheme:light dark}body{margin:0;padding:24px;max-width:860px}main{display:grid;gap:16px}.case,.schedule{border:1px solid currentColor;border-radius:16px;padding:16px}.buttons{display:grid;grid-template-columns:1fr 1fr;gap:8px}button{font:inherit;min-height:44px;padding:10px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.status{font-weight:700}.muted{opacity:.72}@media(max-width:560px){body{padding:14px}.buttons,.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<main data-cross-binding-assay>
  <header><div class="muted">Local-only scientific assay</div><h1>Wrong key rejected. Locks unchanged.</h1></header>
  <section class="case">
    <strong>Shared Carry Case</strong>
    <div>Findings: <span id="findingCount"></span></div>
    <div id="ruleIds"></div>
    <div class="muted">Rejected crossing must not alter either sibling's next lawful decision.</div>
  </section>
  <nav class="buttons" aria-label="Cross-binding hostile schedules">
    <button type="button" data-schedule="A_REJECT_THEN_A_B">A×B → A → B</button>
    <button type="button" data-schedule="B_REJECT_THEN_B_A">B×A → B → A</button>
    <button type="button" data-schedule="A_REJECT_THEN_B_A">A×B → B → A</button>
    <button type="button" data-schedule="B_REJECT_THEN_A_B">B×A → A → B</button>
  </nav>
  <section class="schedule" aria-live="polite">
    <div id="scheduleId" class="muted"></div>
    <div id="rejection" class="status"></div>
    <div class="grid">
      <div><strong>A recovery</strong><div id="statusA" class="status"></div></div>
      <div><strong>B recovery</strong><div id="statusB" class="status"></div></div>
    </div>
  </section>
  <footer class="muted">Rejection ≠ mutation. Failed revalidation ≠ future decision memory.</footer>
</main>
<script>
(() => {
  'use strict';
  const report = ${embedded};
  const schedules = Object.fromEntries(report.primary_schedules.map(item => [item.schedule_id, item]));
  let selected = null;
  const render = id => {
    const item = schedules[id];
    if (!item) throw new Error('unknown hostile schedule');
    selected = id;
    document.getElementById('scheduleId').textContent = id;
    document.getElementById('rejection').textContent = item.rejected ? 'CROSS-BINDING REJECTED' : 'CROSS-BINDING ACCEPTED';
    document.getElementById('statusA').textContent = item.recovery_statuses.A;
    document.getElementById('statusB').textContent = item.recovery_statuses.B;
  };
  document.getElementById('findingCount').textContent = String(report.shared_case.finding_count);
  document.getElementById('ruleIds').textContent = report.shared_case.finding_rule_ids.join(' · ');
  for (const button of document.querySelectorAll('[data-schedule]')) button.addEventListener('click', () => render(button.dataset.schedule));
  render('A_REJECT_THEN_A_B');
  window.__TD613_MARROWLINE_CROSS_BINDING_NONPOISONING__ = Object.freeze({
    report,
    select: render,
    getState: () => ({
      selected,
      rejection: document.getElementById('rejection').textContent,
      statusA: document.getElementById('statusA').textContent,
      statusB: document.getElementById('statusB').textContent
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

const html = renderHtml(staticAssay);
const artifactSha256 = crypto.createHash('sha256').update(html, 'utf8').digest('hex');
const artifactBytes = Buffer.byteLength(html, 'utf8');
for (const forbidden of ['localStorage.setItem', 'sessionStorage.setItem', 'indexedDB', 'BroadcastChannel', 'serviceWorker', 'fetch(', 'XMLHttpRequest', 'WebSocket']) {
  assert(!html.includes(forbidden), `Cross-binding assay artifact contains persistence/network primitive: ${forbidden}`);
}
assert(!html.includes('<input'), 'Cross-binding assay artifact may not expose free-text input');
assert(staticAssay.cross_bindings_rejected === true, 'static cross-binding assay lost rejection');
assert(staticAssay.attacked_findings_recover_to_baseline === true, 'static cross-binding assay lost attacked-finding recovery');
assert(staticAssay.siblings_unpoisoned === true, 'static cross-binding assay lost sibling non-poisoning');

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
if (!address || typeof address === 'string') throw new Error('Cross-binding witness server did not bind');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const receipt = {
  schema: 'td613.marrowline.cross-binding-rejection-nonpoisoning-browser-witness/v0.1-local-only',
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
  shared_case: {},
  baseline: {},
  primary_observations: [],
  replay_observations: [],
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
  claim_ceiling: 'bounded-two-finding-sequential-cross-binding-rejection-nonpoisoning-browser-only',
  seal: '⟐'
};

const primaryOrder = ['A_REJECT_THEN_A_B', 'B_REJECT_THEN_B_A', 'A_REJECT_THEN_B_A', 'B_REJECT_THEN_A_B'];
const replayOrder = ['B_REJECT_THEN_A_B', 'A_REJECT_THEN_B_A', 'B_REJECT_THEN_B_A', 'A_REJECT_THEN_A_B'];

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
  await page.waitForSelector('[data-cross-binding-assay]');
  const boot = await page.evaluate(() => ({
    state: window.__TD613_MARROWLINE_CROSS_BINDING_NONPOISONING__.getState(),
    report: window.__TD613_MARROWLINE_CROSS_BINDING_NONPOISONING__.report,
    storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie },
    csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null,
    free_text_inputs: document.querySelectorAll('input,textarea,[contenteditable="true"]').length
  }));
  assert(boot.state.selected === 'A_REJECT_THEN_A_B', 'Cross-binding artifact did not boot first hostile schedule');
  assert(boot.state.rejection === 'CROSS-BINDING REJECTED', 'Cross-binding artifact boot lost rejection');
  assert(boot.state.statusA === 'PRESENT_TO_HUMAN' && boot.state.statusB === 'PRESENT_TO_HUMAN', 'Cross-binding boot recovery statuses drifted');
  assert(boot.report.shared_case.finding_count === 2, 'Cross-binding browser artifact lost shared two-finding case');
  assert(JSON.stringify(boot.report.shared_case.finding_rule_ids) === JSON.stringify(['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM']),
    'Cross-binding browser artifact shared rule IDs drifted');
  assert(boot.storage.local === 0 && boot.storage.session === 0 && boot.storage.cookie === '', 'Cross-binding browser artifact inherited persistence');
  assert(/connect-src 'none'/.test(boot.csp || ''), 'Cross-binding browser artifact lost connection-denying CSP');
  assert(boot.free_text_inputs === 0, 'Cross-binding browser artifact exposed free-text transport input');

  const observe = async id => {
    await page.evaluate(scheduleId => window.__TD613_MARROWLINE_CROSS_BINDING_NONPOISONING__.select(scheduleId), id);
    const observed = await page.evaluate(() => ({
      state: window.__TD613_MARROWLINE_CROSS_BINDING_NONPOISONING__.getState(),
      storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }
    }));
    assert(observed.state.selected === id, `Cross-binding browser failed to select ${id}`);
    assert(observed.state.rejection === 'CROSS-BINDING REJECTED', `Cross-binding browser lost rejection for ${id}`);
    assert(observed.state.statusA === 'PRESENT_TO_HUMAN' && observed.state.statusB === 'PRESENT_TO_HUMAN',
      `Cross-binding browser recovery drifted for ${id}`);
    assert(observed.storage.local === 0 && observed.storage.session === 0 && observed.storage.cookie === '',
      `Cross-binding browser accumulated persistence at ${id}`);
    return { schedule_id: id, rejected: true, recovery_statuses: { A: observed.state.statusA, B: observed.state.statusB } };
  };

  for (const id of primaryOrder) receipt.primary_observations.push(await observe(id));
  for (const id of replayOrder) receipt.replay_observations.push(await observe(id));
  const primaryById = Object.fromEntries(receipt.primary_observations.map(item => [item.schedule_id, item]));
  const replayById = Object.fromEntries(receipt.replay_observations.map(item => [item.schedule_id, item]));
  for (const id of primaryOrder) assert(JSON.stringify(primaryById[id]) === JSON.stringify(replayById[id]), `Cross-binding replay drifted for ${id}`);

  receipt.shared_case = {
    finding_count: boot.report.shared_case.finding_count,
    finding_rule_ids: boot.report.shared_case.finding_rule_ids,
    carry_case: boot.report.shared_case.carry_case,
    local_bindings: boot.report.shared_case.local_bindings,
    canonical_envelopes: boot.report.shared_case.canonical_envelopes,
    hosted_findings: boot.report.shared_case.hosted_findings,
    local_binding_carried: boot.report.shared_case.local_binding_carried,
    release_authority: boot.report.shared_case.release_authority,
    human_closure_required: boot.report.shared_case.human_closure_required
  };
  receipt.baseline = {
    A: boot.report.baseline.A.status,
    B: boot.report.baseline.B.status
  };
  receipt.convergence = {
    cross_bindings_rejected: boot.report.cross_bindings_rejected,
    carry_case_unchanged_after_rejection: boot.report.carry_case_unchanged_after_rejection,
    local_bindings_unchanged_after_rejection: boot.report.local_bindings_unchanged_after_rejection,
    canonical_envelopes_unchanged_after_rejection: boot.report.canonical_envelopes_unchanged_after_rejection,
    attacked_findings_recover_to_baseline: boot.report.attacked_findings_recover_to_baseline,
    siblings_unpoisoned: boot.report.siblings_unpoisoned,
    replay_order_invariant: boot.report.replay_order_invariant,
    portable_failure_state_carried: boot.report.portable_failure_state_carried,
    browser_persistence_accumulated: false
  };
  receipt.storage = { empty_through_primary_and_replay: true };
  receipt.network.document_requests = requests.filter(requestUrl => requestUrl === url).length;
  receipt.network.unexpected_requests = requests.filter(requestUrl => requestUrl !== url);
  receipt.network.server_hits = serverHits;
  assert(receipt.network.document_requests === 1, `Cross-binding witness expected one assay document load, observed ${receipt.network.document_requests}`);
  assert(receipt.network.unexpected_requests.length === 0, `Cross-binding witness observed unexpected requests: ${receipt.network.unexpected_requests.join(', ')}`);
  assert(receipt.errors.console.length === 0 && receipt.errors.page.length === 0, 'Cross-binding witness observed page/runtime errors');
  if (browserName === 'firefox') assert(receipt.errors.browser_chrome.length <= 1, 'Firefox emitted unexpected browser-chrome diagnostics');
  else assert(receipt.errors.browser_chrome.length === 0, `${browserName} emitted browser-chrome diagnostics`);
  receipt.status = 'PASS';
  await context.close();
} catch (error) {
  terminalError = error;
  receipt.status = 'FAIL';
  receipt.failure = { message: error.message, stack: error.stack || null };
} finally {
  await browser?.close().catch(() => {});
  await new Promise(resolve => server.close(resolve));
  await fs.writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
}

if (terminalError) throw terminalError;
process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
