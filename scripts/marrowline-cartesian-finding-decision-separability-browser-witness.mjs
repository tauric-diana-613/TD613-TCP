import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import {
  runMarrowlineCartesianFindingDecisionSeparabilityAssay
} from './marrowline-cartesian-finding-decision-separability-assay.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/marrowline-cartesian-finding-decision-separability');
const artifactName = 'marrowline-cartesian-finding-decision-separability-v0.1.html';
const receiptPath = path.join(artifactDir, `marrowline-cartesian-finding-decision-separability-v0.1-${browserName}-receipt.json`);
const staticAssay = runMarrowlineCartesianFindingDecisionSeparabilityAssay();

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
<title>TD613 Marrowline Cartesian Finding Decision Separability</title>
<style>
:root{font-family:system-ui,sans-serif;color-scheme:light dark}body{margin:0;padding:24px;max-width:820px}main{display:grid;gap:16px}.case,.vector{border:1px solid currentColor;border-radius:16px;padding:16px}.buttons{display:grid;grid-template-columns:1fr 1fr;gap:8px}button{font:inherit;min-height:44px;padding:10px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.status{font-weight:700}.muted{opacity:.72}@media(max-width:560px){body{padding:14px}.buttons,.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<main data-cartesian-assay>
  <header><div class="muted">Local-only scientific assay</div><h1>One suitcase. Two findings. Four decision corners.</h1></header>
  <section class="case">
    <strong>Shared Carry Case</strong>
    <div>Findings: <span id="findingCount"></span></div>
    <div id="ruleIds"></div>
    <div class="muted">Current finding decisions remain local to their own rule/action/binding relation.</div>
  </section>
  <nav class="buttons" aria-label="Cartesian decision vectors">
    <button type="button" data-vector="MATCH_MATCH">Match / Match</button>
    <button type="button" data-vector="MATCH_MISMATCH">Match / Mismatch</button>
    <button type="button" data-vector="MISMATCH_MATCH">Mismatch / Match</button>
    <button type="button" data-vector="MISMATCH_MISMATCH">Mismatch / Mismatch</button>
  </nav>
  <section class="vector" aria-live="polite">
    <div id="vectorId" class="muted"></div>
    <div class="grid">
      <div><strong>A · EMAIL_IDENTIFIER</strong><div id="statusA" class="status"></div></div>
      <div><strong>B · USER_DECLARED_PROTECTED_TERM</strong><div id="statusB" class="status"></div></div>
    </div>
  </section>
  <footer class="muted">Finding vector ≠ whole-case authority.</footer>
</main>
<script>
(() => {
  'use strict';
  const report = ${embedded};
  const vectors = Object.fromEntries(report.primary_schedule.map(item => [item.vector_id, item]));
  let selected = null;
  const render = id => {
    const vector = vectors[id];
    if (!vector) throw new Error('unknown Cartesian vector');
    selected = id;
    document.getElementById('vectorId').textContent = id;
    document.getElementById('statusA').textContent = vector.statuses.A;
    document.getElementById('statusB').textContent = vector.statuses.B;
  };
  document.getElementById('findingCount').textContent = String(report.shared_case.finding_count);
  document.getElementById('ruleIds').textContent = report.shared_case.finding_rule_ids.join(' · ');
  for (const button of document.querySelectorAll('[data-vector]')) {
    button.addEventListener('click', () => render(button.dataset.vector));
  }
  render('MATCH_MATCH');
  window.__TD613_MARROWLINE_CARTESIAN_FINDING_DECISION__ = Object.freeze({
    report,
    select: render,
    getState: () => ({ selected, statusA: document.getElementById('statusA').textContent, statusB: document.getElementById('statusB').textContent })
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
  assert(!html.includes(forbidden), `Cartesian assay artifact contains persistence/network primitive: ${forbidden}`);
}
assert(!html.includes('<input'), 'Cartesian assay artifact may not expose free-text input');
assert(staticAssay.all_four_cartesian_corners_observed === true, 'static Cartesian assay lost a decision corner');
assert(staticAssay.per_finding_coordinate_separable === true, 'static Cartesian assay lost coordinate separability');
assert(staticAssay.controls.A_with_B_binding.rejected === true && staticAssay.controls.B_with_A_binding.rejected === true,
  'static Cartesian assay lost wrong-binding rejection');

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
if (!address || typeof address === 'string') throw new Error('Cartesian witness server did not bind');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const receipt = {
  schema: 'td613.marrowline.cartesian-finding-decision-separability-browser-witness/v0.1-local-only',
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
  primary_observations: [],
  replay_observations: [],
  coordinate_sensitivity: {},
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
  claim_ceiling: 'bounded-two-finding-one-carry-case-four-corner-cartesian-browser-separability-only',
  seal: '⟐'
};

const expected = {
  MATCH_MATCH: { A: 'PRESENT_TO_HUMAN', B: 'PRESENT_TO_HUMAN' },
  MATCH_MISMATCH: { A: 'PRESENT_TO_HUMAN', B: 'HOLD' },
  MISMATCH_MATCH: { A: 'HOLD', B: 'PRESENT_TO_HUMAN' },
  MISMATCH_MISMATCH: { A: 'HOLD', B: 'HOLD' }
};
const primaryOrder = ['MATCH_MATCH', 'MATCH_MISMATCH', 'MISMATCH_MATCH', 'MISMATCH_MISMATCH'];
const replayOrder = ['MISMATCH_MISMATCH', 'MISMATCH_MATCH', 'MATCH_MISMATCH', 'MATCH_MATCH'];

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
  await page.waitForSelector('[data-cartesian-assay]');
  const boot = await page.evaluate(() => ({
    state: window.__TD613_MARROWLINE_CARTESIAN_FINDING_DECISION__.getState(),
    report: window.__TD613_MARROWLINE_CARTESIAN_FINDING_DECISION__.report,
    storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie },
    csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null,
    free_text_inputs: document.querySelectorAll('input,textarea,[contenteditable="true"]').length
  }));
  assert(boot.state.selected === 'MATCH_MATCH', 'Cartesian artifact did not boot MATCH_MATCH');
  assert(boot.state.statusA === expected.MATCH_MATCH.A && boot.state.statusB === expected.MATCH_MATCH.B, 'Cartesian MATCH_MATCH boot statuses drifted');
  assert(boot.report.shared_case.finding_count === 2, 'Cartesian browser artifact lost shared two-finding case');
  assert(JSON.stringify(boot.report.shared_case.finding_rule_ids) === JSON.stringify(['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM']),
    'Cartesian browser artifact shared rule IDs drifted');
  assert(boot.storage.local === 0 && boot.storage.session === 0 && boot.storage.cookie === '', 'Cartesian browser artifact inherited persistence');
  assert(/connect-src 'none'/.test(boot.csp || ''), 'Cartesian browser artifact lost connection-denying CSP');
  assert(boot.free_text_inputs === 0, 'Cartesian browser artifact exposed free-text transport input');

  const observe = async id => {
    await page.evaluate(vectorId => window.__TD613_MARROWLINE_CARTESIAN_FINDING_DECISION__.select(vectorId), id);
    const observed = await page.evaluate(() => ({
      state: window.__TD613_MARROWLINE_CARTESIAN_FINDING_DECISION__.getState(),
      storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }
    }));
    assert(observed.state.selected === id, `Cartesian browser failed to select ${id}`);
    assert(observed.state.statusA === expected[id].A && observed.state.statusB === expected[id].B,
      `Cartesian browser status vector drifted for ${id}`);
    assert(observed.storage.local === 0 && observed.storage.session === 0 && observed.storage.cookie === '',
      `Cartesian browser accumulated persistence at ${id}`);
    return { vector_id: id, statuses: { A: observed.state.statusA, B: observed.state.statusB } };
  };

  for (const id of primaryOrder) receipt.primary_observations.push(await observe(id));
  for (const id of replayOrder) receipt.replay_observations.push(await observe(id));

  const primaryById = Object.fromEntries(receipt.primary_observations.map(item => [item.vector_id, item.statuses]));
  const replayById = Object.fromEntries(receipt.replay_observations.map(item => [item.vector_id, item.statuses]));
  for (const id of primaryOrder) assert(JSON.stringify(primaryById[id]) === JSON.stringify(replayById[id]), `Cartesian replay drifted for ${id}`);

  receipt.shared_case = {
    finding_count: boot.report.shared_case.finding_count,
    finding_rule_ids: boot.report.shared_case.finding_rule_ids,
    carry_case: boot.report.shared_case.carry_case,
    hosted_findings: boot.report.shared_case.hosted_findings,
    hosted_findings_distinguishable: boot.report.shared_case.hosted_findings_distinguishable,
    local_binding_carried: boot.report.shared_case.local_binding_carried,
    release_authority: boot.report.shared_case.release_authority,
    human_closure_required: boot.report.shared_case.human_closure_required
  };
  receipt.coordinate_sensitivity = boot.report.coordinate_sensitivity;
  receipt.convergence = {
    all_four_cartesian_corners_observed: boot.report.all_four_cartesian_corners_observed,
    per_finding_coordinate_separable: boot.report.per_finding_coordinate_separable,
    shared_carry_case_unchanged: boot.report.shared_carry_case_unchanged,
    replay_order_invariant: boot.report.replay_order_invariant,
    wrong_rule_binding_rejected: boot.report.wrong_rule_binding_rejected,
    whole_case_status_carried: boot.report.whole_case_status_carried,
    portable_vector_state_carried: boot.report.portable_vector_state_carried,
    sibling_result_carried: boot.report.sibling_result_carried,
    browser_persistence_accumulated: false
  };
  receipt.storage = { empty_through_primary_and_replay: true };
  receipt.network.document_requests = requests.filter(requestUrl => requestUrl === url).length;
  receipt.network.unexpected_requests = requests.filter(requestUrl => requestUrl !== url);
  receipt.network.server_hits = serverHits;
  assert(receipt.network.document_requests === 1, `Cartesian witness expected one assay document load, observed ${receipt.network.document_requests}`);
  assert(receipt.network.unexpected_requests.length === 0, `Cartesian witness observed unexpected requests: ${receipt.network.unexpected_requests.join(', ')}`);
  assert(receipt.errors.console.length === 0 && receipt.errors.page.length === 0, 'Cartesian witness observed page/runtime errors');
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
