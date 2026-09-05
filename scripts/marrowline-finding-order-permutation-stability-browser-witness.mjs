import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import {
  runMarrowlineFindingOrderPermutationStabilityAssay
} from './marrowline-finding-order-permutation-stability-assay.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/marrowline-finding-order-permutation-stability');
const artifactName = 'marrowline-finding-order-permutation-stability-v0.1.html';
const receiptPath = path.join(artifactDir, `marrowline-finding-order-permutation-stability-v0.1-${browserName}-receipt.json`);
const staticAssay = runMarrowlineFindingOrderPermutationStabilityAssay();

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
<title>TD613 Marrowline Finding-Order Permutation Stability</title>
<style>
:root{font-family:system-ui,sans-serif;color-scheme:light dark}body{margin:0;padding:24px;max-width:900px}main{display:grid;gap:16px}.case{border:1px solid currentColor;border-radius:16px;padding:16px}.buttons{display:grid;grid-template-columns:1fr 1fr;gap:8px}button{font:inherit;min-height:44px;padding:10px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.status{font-weight:700}.muted{opacity:.72}@media(max-width:560px){body{padding:14px}.buttons,.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<main data-finding-order-assay>
  <header><div class="muted">Local-only scientific assay</div><h1>Finding identity survives a change of seat.</h1></header>
  <nav class="buttons" aria-label="Packet permutations">
    <button type="button" data-permutation="P_AB">Packet [A, B]</button>
    <button type="button" data-permutation="P_BA">Packet [B, A]</button>
  </nav>
  <section class="case" aria-live="polite">
    <div id="permutationId" class="muted"></div>
    <div><strong>Slot order</strong> <span id="ruleOrder"></span></div>
    <div class="grid">
      <div><strong>A match</strong><div id="aMatch" class="status"></div><strong>A mismatch</strong><div id="aMismatch" class="status"></div></div>
      <div><strong>B match</strong><div id="bMatch" class="status"></div><strong>B mismatch</strong><div id="bMismatch" class="status"></div></div>
    </div>
    <div><strong>Slot 0 identity</strong> <span id="slotZero"></span></div>
  </section>
  <footer class="muted">Finding identity ≠ array position. Packet permutation ≠ decision drift.</footer>
</main>
<script>
(() => {
  'use strict';
  const report = ${embedded};
  let selected = null;
  const render = id => {
    const item = report.permutations[id];
    if (!item) throw new Error('unknown packet permutation');
    selected = id;
    document.getElementById('permutationId').textContent = id;
    document.getElementById('ruleOrder').textContent = item.finding_rule_ids.join(' → ');
    document.getElementById('aMatch').textContent = item.matching_statuses.A;
    document.getElementById('aMismatch').textContent = item.mismatch_statuses.A;
    document.getElementById('bMatch').textContent = item.matching_statuses.B;
    document.getElementById('bMismatch').textContent = item.mismatch_statuses.B;
    document.getElementById('slotZero').textContent = item.finding_rule_ids[0];
  };
  for (const button of document.querySelectorAll('[data-permutation]')) button.addEventListener('click', () => render(button.dataset.permutation));
  render('P_AB');
  window.__TD613_MARROWLINE_FINDING_ORDER_PERMUTATION__ = Object.freeze({
    report,
    select: render,
    getState: () => ({
      selected,
      ruleOrder: document.getElementById('ruleOrder').textContent,
      aMatch: document.getElementById('aMatch').textContent,
      aMismatch: document.getElementById('aMismatch').textContent,
      bMatch: document.getElementById('bMatch').textContent,
      bMismatch: document.getElementById('bMismatch').textContent,
      slotZero: document.getElementById('slotZero').textContent
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
  assert(!html.includes(forbidden), `Finding-order assay artifact contains persistence/network primitive: ${forbidden}`);
}
assert(!html.includes('<input'), 'Finding-order assay artifact may not expose free-text input');
assert(staticAssay.hosted_projection_rule_invariant === true, 'static finding-order assay lost Hosted rule invariance');
assert(staticAssay.matching_decision_rule_invariant === true, 'static finding-order assay lost matching decision invariance');
assert(staticAssay.slot_zero_identity_changes_with_permutation === true, 'static finding-order assay lost slot-zero control');

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
if (!address || typeof address === 'string') throw new Error('Finding-order witness server did not bind');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const receipt = {
  schema: 'td613.marrowline.finding-order-permutation-stability-browser-witness/v0.1-local-only',
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
  permutations: {},
  per_rule: {},
  slot_zero: {},
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
  claim_ceiling: 'bounded-two-finding-two-permutation-rule-bound-stability-browser-only',
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
  await page.waitForSelector('[data-finding-order-assay]');
  const boot = await page.evaluate(() => ({
    state: window.__TD613_MARROWLINE_FINDING_ORDER_PERMUTATION__.getState(),
    report: window.__TD613_MARROWLINE_FINDING_ORDER_PERMUTATION__.report,
    storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie },
    csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null,
    free_text_inputs: document.querySelectorAll('input,textarea,[contenteditable="true"]').length
  }));
  assert(boot.state.selected === 'P_AB', 'Finding-order artifact did not boot P_AB');
  assert(boot.state.ruleOrder === 'EMAIL_IDENTIFIER → USER_DECLARED_PROTECTED_TERM', 'Finding-order P_AB rule order drifted');
  assert(boot.state.slotZero === 'EMAIL_IDENTIFIER', 'Finding-order P_AB slot-zero identity drifted');
  assert(boot.storage.local === 0 && boot.storage.session === 0 && boot.storage.cookie === '', 'Finding-order browser artifact inherited persistence');
  assert(/connect-src 'none'/.test(boot.csp || ''), 'Finding-order browser artifact lost connection-denying CSP');
  assert(boot.free_text_inputs === 0, 'Finding-order browser artifact exposed free-text transport input');

  const observe = async id => {
    await page.evaluate(permutationId => window.__TD613_MARROWLINE_FINDING_ORDER_PERMUTATION__.select(permutationId), id);
    const observed = await page.evaluate(() => ({
      state: window.__TD613_MARROWLINE_FINDING_ORDER_PERMUTATION__.getState(),
      storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }
    }));
    const expectedOrder = id === 'P_AB'
      ? 'EMAIL_IDENTIFIER → USER_DECLARED_PROTECTED_TERM'
      : 'USER_DECLARED_PROTECTED_TERM → EMAIL_IDENTIFIER';
    const expectedSlotZero = id === 'P_AB' ? 'EMAIL_IDENTIFIER' : 'USER_DECLARED_PROTECTED_TERM';
    assert(observed.state.selected === id, `Finding-order browser failed to select ${id}`);
    assert(observed.state.ruleOrder === expectedOrder, `Finding-order browser silently reordered ${id}`);
    assert(observed.state.slotZero === expectedSlotZero, `Finding-order browser slot-zero identity drifted for ${id}`);
    assert(observed.state.aMatch === 'PRESENT_TO_HUMAN' && observed.state.bMatch === 'PRESENT_TO_HUMAN', `Finding-order matching decisions drifted for ${id}`);
    assert(observed.state.aMismatch === 'HOLD' && observed.state.bMismatch === 'HOLD', `Finding-order mismatch decisions drifted for ${id}`);
    assert(observed.storage.local === 0 && observed.storage.session === 0 && observed.storage.cookie === '', `Finding-order browser accumulated persistence at ${id}`);
    return {
      permutation_id: id,
      rule_order: expectedOrder,
      slot_zero_rule_id: expectedSlotZero,
      matching_statuses: { A: observed.state.aMatch, B: observed.state.bMatch },
      mismatch_statuses: { A: observed.state.aMismatch, B: observed.state.bMismatch }
    };
  };

  receipt.observations.push(await observe('P_AB'));
  receipt.observations.push(await observe('P_BA'));
  receipt.observations.push(await observe('P_AB'));
  assert(JSON.stringify(receipt.observations[0]) === JSON.stringify(receipt.observations[2]), 'Finding-order browser replay of P_AB drifted after P_BA');

  receipt.permutations = boot.report.permutations;
  receipt.per_rule = boot.report.per_rule;
  receipt.slot_zero = boot.report.slot_zero;
  receipt.convergence = {
    source_packets_order_distinguishable: boot.report.source_packets_order_distinguishable,
    carry_cases_order_distinguishable: boot.report.carry_cases_order_distinguishable,
    hosted_projection_rule_invariant: boot.report.hosted_projection_rule_invariant,
    matching_envelope_rule_invariant: boot.report.matching_envelope_rule_invariant,
    mismatch_envelope_rule_invariant: boot.report.mismatch_envelope_rule_invariant,
    matching_decision_rule_invariant: boot.report.matching_decision_rule_invariant,
    mismatch_decision_rule_invariant: boot.report.mismatch_decision_rule_invariant,
    cross_bindings_rejected_both_permutations: boot.report.cross_bindings_rejected_both_permutations,
    slot_zero_identity_changes_with_permutation: boot.report.slot_zero_identity_changes_with_permutation,
    hidden_permutation_state_carried: boot.report.hidden_permutation_state_carried,
    browser_replay_invariant: true,
    browser_persistence_accumulated: false
  };
  receipt.storage = { empty_through_both_permutations_and_replay: true };
  receipt.network.document_requests = requests.filter(requestUrl => requestUrl === url).length;
  receipt.network.unexpected_requests = requests.filter(requestUrl => requestUrl !== url);
  receipt.network.server_hits = serverHits;
  assert(receipt.network.document_requests === 1, `Finding-order witness expected one assay document load, observed ${receipt.network.document_requests}`);
  assert(receipt.network.unexpected_requests.length === 0, `Finding-order witness observed unexpected requests: ${receipt.network.unexpected_requests.join(', ')}`);
  assert(receipt.errors.console.length === 0 && receipt.errors.page.length === 0, 'Finding-order witness observed page/runtime errors');
  if (browserName === 'firefox') assert(receipt.errors.browser_chrome.length <= 1, 'Firefox emitted unexpected browser-chrome diagnostics');
  else assert(receipt.errors.browser_chrome.length === 0, `${browserName} emitted browser-chrome diagnostics`);
  receipt.status = 'PASS';
  await context.close();
} catch (error) {
  terminalError = error;
  receipt.status = 'FAIL';
  receipt.error = error instanceof Error ? error.message : String(error);
} finally {
  if (browser) await browser.close().catch(() => {});
  await new Promise(resolve => server.close(resolve));
  await fs.mkdir(artifactDir, { recursive: true });
  await fs.writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
}

if (terminalError) throw terminalError;
process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
