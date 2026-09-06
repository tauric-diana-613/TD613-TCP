import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import {
  runMarrowlineMultiplexedFindingIsolationAssay
} from './marrowline-multiplexed-finding-isolation-assay.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/marrowline-multiplexed-finding-isolation');
const artifactName = 'marrowline-multiplexed-finding-isolation-v0.1.html';
const receiptPath = path.join(artifactDir, `marrowline-multiplexed-finding-isolation-v0.1-${browserName}-receipt.json`);
const staticAssay = runMarrowlineMultiplexedFindingIsolationAssay();

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
<title>TD613 Marrowline Multiplexed Finding Isolation</title>
<style>
:root{font-family:system-ui,sans-serif;color-scheme:light dark}body{margin:0;padding:24px;max-width:760px}main{display:grid;gap:16px}.case,.pattern{border:1px solid currentColor;border-radius:16px;padding:16px}button{font:inherit;min-height:44px;padding:10px 14px;margin-right:8px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.status{font-weight:700}.muted{opacity:.72}@media(max-width:520px){body{padding:14px}.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<main data-multiplexed-assay>
  <header><div class="muted">Local-only scientific assay</div><h1>One suitcase. Two findings. Separate decisions.</h1></header>
  <section class="case" data-shared-case>
    <strong>Shared Carry Case</strong>
    <div>Findings: <span id="findingCount"></span></div>
    <div id="ruleIds"></div>
    <div class="muted">Local bindings stay local. Human closure remains required.</div>
  </section>
  <nav aria-label="Decision patterns">
    <button id="pattern1" type="button">Pattern 1 · A passes, B holds</button>
    <button id="pattern2" type="button">Pattern 2 · A holds, B passes</button>
  </nav>
  <section class="pattern" aria-live="polite">
    <div id="patternId" class="muted"></div>
    <div class="grid">
      <div><strong>A · EMAIL_IDENTIFIER</strong><div id="statusA" class="status"></div></div>
      <div><strong>B · USER_DECLARED_PROTECTED_TERM</strong><div id="statusB" class="status"></div></div>
    </div>
  </section>
  <footer class="muted">Shared transport does not grant shared decision authority.</footer>
</main>
<script>
(() => {
  'use strict';
  const report = ${embedded};
  let selected = null;
  const render = id => {
    const pattern = report.patterns.find(item => item.pattern_id === id);
    if (!pattern) throw new Error('unknown assay pattern');
    selected = id;
    document.getElementById('patternId').textContent = id + ' · order ' + pattern.execution_order.join(' → ');
    document.getElementById('statusA').textContent = pattern.statuses.A;
    document.getElementById('statusB').textContent = pattern.statuses.B;
  };
  document.getElementById('findingCount').textContent = String(report.shared_case.finding_count);
  document.getElementById('ruleIds').textContent = report.shared_case.finding_rule_ids.join(' · ');
  document.getElementById('pattern1').addEventListener('click', () => render('PATTERN_1'));
  document.getElementById('pattern2').addEventListener('click', () => render('PATTERN_2'));
  render('PATTERN_1');
  window.__TD613_MARROWLINE_MULTIPLEXED_FINDING_ISOLATION__ = Object.freeze({
    report,
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
  assert(!html.includes(forbidden), `multiplexed assay artifact contains persistence/network primitive: ${forbidden}`);
}
assert(!html.includes('<input'), 'multiplexed assay artifact may not expose free-text input');
assert(staticAssay.shared_case.finding_count === 2, 'static multiplexed assay lost two-finding shared case');
assert(staticAssay.controls.A_with_B_binding.rejected === true && staticAssay.controls.B_with_A_binding.rejected === true,
  'static multiplexed assay lost wrong-binding rejection controls');

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
if (!address || typeof address === 'string') throw new Error('multiplexed witness server did not bind');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const receipt = {
  schema: 'td613.marrowline.multiplexed-finding-isolation-browser-witness/v0.1-local-only',
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
  patterns: [],
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
  claim_ceiling: 'bounded-two-finding-one-carry-case-opposed-pattern-browser-isolation-only',
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
  await page.waitForSelector('[data-multiplexed-assay]');
  const boot = await page.evaluate(() => ({
    state: window.__TD613_MARROWLINE_MULTIPLEXED_FINDING_ISOLATION__.getState(),
    report: window.__TD613_MARROWLINE_MULTIPLEXED_FINDING_ISOLATION__.report,
    storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie },
    csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null,
    free_text_inputs: document.querySelectorAll('input,textarea,[contenteditable="true"]').length
  }));
  assert(boot.state.selected === 'PATTERN_1', 'multiplexed artifact did not boot Pattern 1');
  assert(boot.state.statusA === 'PRESENT_TO_HUMAN' && boot.state.statusB === 'HOLD', 'Pattern 1 browser statuses collapsed');
  assert(boot.report.shared_case.finding_count === 2, 'browser artifact lost shared two-finding case');
  assert(JSON.stringify(boot.report.shared_case.finding_rule_ids) === JSON.stringify(['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM']),
    'browser artifact shared rule IDs drifted');
  assert(boot.storage.local === 0 && boot.storage.session === 0 && boot.storage.cookie === '', 'browser artifact inherited persistence');
  assert(/connect-src 'none'/.test(boot.csp || ''), 'browser artifact lost connection-denying CSP');
  assert(boot.free_text_inputs === 0, 'browser artifact exposed free-text transport input');

  receipt.patterns.push({ pattern_id: 'PATTERN_1', statuses: { A: boot.state.statusA, B: boot.state.statusB } });
  await page.click('#pattern2');
  const second = await page.evaluate(() => ({
    state: window.__TD613_MARROWLINE_MULTIPLEXED_FINDING_ISOLATION__.getState(),
    storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }
  }));
  assert(second.state.selected === 'PATTERN_2', 'multiplexed artifact did not select Pattern 2');
  assert(second.state.statusA === 'HOLD' && second.state.statusB === 'PRESENT_TO_HUMAN', 'Pattern 2 browser statuses collapsed');
  assert(second.storage.local === 0 && second.storage.session === 0 && second.storage.cookie === '', 'Pattern 2 accumulated browser persistence');
  receipt.patterns.push({ pattern_id: 'PATTERN_2', statuses: { A: second.state.statusA, B: second.state.statusB } });

  await page.click('#pattern1');
  const returnState = await page.evaluate(() => ({
    state: window.__TD613_MARROWLINE_MULTIPLEXED_FINDING_ISOLATION__.getState(),
    storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }
  }));
  assert(returnState.state.statusA === 'PRESENT_TO_HUMAN' && returnState.state.statusB === 'HOLD',
    'return to Pattern 1 drifted after opposed sibling decision');
  assert(returnState.storage.local === 0 && returnState.storage.session === 0 && returnState.storage.cookie === '',
    'return to Pattern 1 accumulated browser persistence');

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
  receipt.convergence = {
    opposed_patterns_observed: true,
    sibling_decision_isolation: true,
    shared_carry_case_unchanged_across_patterns: boot.report.shared_carry_case_unchanged_across_patterns,
    wrong_rule_binding_rejected: boot.report.wrong_rule_binding_rejected,
    all_four_status_controls_observed: boot.report.all_four_status_controls_observed,
    portable_decision_state_carried: boot.report.portable_decision_state_carried,
    prior_sibling_status_carried: boot.report.prior_sibling_status_carried,
    browser_persistence_accumulated: false
  };
  receipt.storage = { empty_before_after_and_return: true };
  receipt.network.document_requests = requests.filter(requestUrl => requestUrl === url).length;
  receipt.network.unexpected_requests = requests.filter(requestUrl => requestUrl !== url);
  receipt.network.server_hits = serverHits;
  assert(receipt.network.document_requests === 1, `multiplexed witness expected one assay document load, observed ${receipt.network.document_requests}`);
  assert(receipt.network.unexpected_requests.length === 0, `multiplexed witness observed unexpected requests: ${receipt.network.unexpected_requests.join(', ')}`);
  assert(receipt.errors.console.length === 0 && receipt.errors.page.length === 0, 'multiplexed witness observed page/runtime errors');
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
