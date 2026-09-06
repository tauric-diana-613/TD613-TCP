import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import {
  runMarrowlinePacketPopulationStabilityAssay
} from './marrowline-packet-population-stability-assay.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/marrowline-packet-population-stability');
const artifactName = 'marrowline-packet-population-stability-v0.1.html';
const receiptPath = path.join(artifactDir, `marrowline-packet-population-stability-v0.1-${browserName}-receipt.json`);
const staticAssay = runMarrowlinePacketPopulationStabilityAssay();

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
<title>TD613 Marrowline Packet-Population Stability</title>
<style>
:root{font-family:system-ui,sans-serif;color-scheme:light dark}body{margin:0;padding:24px;max-width:900px}main{display:grid;gap:16px}.case{border:1px solid currentColor;border-radius:16px;padding:16px}.buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}button{font:inherit;min-height:44px;padding:10px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.status{font-weight:700}.muted{opacity:.72}@media(max-width:560px){body{padding:14px}.buttons,.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<main data-packet-population-assay>
  <header><div class="muted">Local-only scientific assay</div><h1>Finding identity survives a change of company.</h1></header>
  <nav class="buttons" aria-label="Packet populations">
    <button type="button" data-population="P_A">Packet [A]</button>
    <button type="button" data-population="P_B">Packet [B]</button>
    <button type="button" data-population="P_AB">Packet [A, B]</button>
  </nav>
  <section class="case" aria-live="polite">
    <div id="populationId" class="muted"></div>
    <div><strong>Finding count</strong> <span id="findingCount"></span></div>
    <div><strong>Membership</strong> <span id="ruleMembership"></span></div>
    <div class="grid">
      <div><strong>A match</strong><div id="aMatch" class="status"></div><strong>A mismatch</strong><div id="aMismatch" class="status"></div></div>
      <div><strong>B match</strong><div id="bMatch" class="status"></div><strong>B mismatch</strong><div id="bMismatch" class="status"></div></div>
    </div>
    <div><strong>Absent sibling rejected</strong> <span id="absentRejected"></span></div>
  </section>
  <footer class="muted">Finding identity ≠ packet population. Sibling presence ≠ current-finding drift.</footer>
</main>
<script>
(() => {
  'use strict';
  const report = ${embedded};
  let selected = null;
  const render = id => {
    const item = report.populations[id];
    if (!item) throw new Error('unknown packet population');
    selected = id;
    const status = (group, label) => Object.prototype.hasOwnProperty.call(group, label) ? group[label] : 'ABSENT';
    document.getElementById('populationId').textContent = id;
    document.getElementById('findingCount').textContent = String(item.finding_count);
    document.getElementById('ruleMembership').textContent = item.finding_rule_ids.join(' + ');
    document.getElementById('aMatch').textContent = status(item.matching_statuses, 'A');
    document.getElementById('aMismatch').textContent = status(item.mismatch_statuses, 'A');
    document.getElementById('bMatch').textContent = status(item.matching_statuses, 'B');
    document.getElementById('bMismatch').textContent = status(item.mismatch_statuses, 'B');
    document.getElementById('absentRejected').textContent = item.absent_sibling_rejected === null ? 'N/A' : String(item.absent_sibling_rejected);
  };
  for (const button of document.querySelectorAll('[data-population]')) button.addEventListener('click', () => render(button.dataset.population));
  render('P_A');
  window.__TD613_MARROWLINE_PACKET_POPULATION__ = Object.freeze({
    report,
    select: render,
    getState: () => ({
      selected,
      findingCount: document.getElementById('findingCount').textContent,
      ruleMembership: document.getElementById('ruleMembership').textContent,
      aMatch: document.getElementById('aMatch').textContent,
      aMismatch: document.getElementById('aMismatch').textContent,
      bMatch: document.getElementById('bMatch').textContent,
      bMismatch: document.getElementById('bMismatch').textContent,
      absentRejected: document.getElementById('absentRejected').textContent
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
  assert(!html.includes(forbidden), `Packet-population assay artifact contains persistence/network primitive: ${forbidden}`);
}
assert(!html.includes('<input'), 'Packet-population assay artifact may not expose free-text input');
assert(staticAssay.hosted_projection_population_invariant === true, 'static population assay lost Hosted projection invariance');
assert(staticAssay.matching_decision_population_invariant === true, 'static population assay lost matching decision invariance');
assert(staticAssay.absent_sibling_rejected === true, 'static population assay lost absent-sibling rejection');
assert(staticAssay.absent_sibling_rejection_nonpoisoning === true, 'static population assay lost rejection non-poisoning');

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
if (!address || typeof address === 'string') throw new Error('Packet-population witness server did not bind');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const receipt = {
  schema: 'td613.marrowline.packet-population-stability-browser-witness/v0.1-local-only',
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
  populations: {},
  per_rule: {},
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
  claim_ceiling: 'bounded-two-rule-singleton-pair-packet-population-stability-browser-only',
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
  await page.waitForSelector('[data-packet-population-assay]');
  const boot = await page.evaluate(() => ({
    state: window.__TD613_MARROWLINE_PACKET_POPULATION__.getState(),
    report: window.__TD613_MARROWLINE_PACKET_POPULATION__.report,
    storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie },
    csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null,
    free_text_inputs: document.querySelectorAll('input,textarea,[contenteditable="true"]').length
  }));
  assert(boot.state.selected === 'P_A', 'Packet-population artifact did not boot P_A');
  assert(boot.state.findingCount === '1', 'Packet-population P_A count drifted');
  assert(boot.state.ruleMembership === 'EMAIL_IDENTIFIER', 'Packet-population P_A membership drifted');
  assert(boot.storage.local === 0 && boot.storage.session === 0 && boot.storage.cookie === '', 'Packet-population browser artifact inherited persistence');
  assert(/connect-src 'none'/.test(boot.csp || ''), 'Packet-population browser artifact lost connection-denying CSP');
  assert(boot.free_text_inputs === 0, 'Packet-population browser artifact exposed free-text transport input');

  const observe = async id => {
    await page.evaluate(populationId => window.__TD613_MARROWLINE_PACKET_POPULATION__.select(populationId), id);
    const observed = await page.evaluate(() => ({
      state: window.__TD613_MARROWLINE_PACKET_POPULATION__.getState(),
      storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }
    }));
    const expected = {
      P_A: {
        count: '1', membership: 'EMAIL_IDENTIFIER',
        aMatch: 'PRESENT_TO_HUMAN', aMismatch: 'HOLD', bMatch: 'ABSENT', bMismatch: 'ABSENT', absentRejected: 'true'
      },
      P_B: {
        count: '1', membership: 'USER_DECLARED_PROTECTED_TERM',
        aMatch: 'ABSENT', aMismatch: 'ABSENT', bMatch: 'PRESENT_TO_HUMAN', bMismatch: 'HOLD', absentRejected: 'true'
      },
      P_AB: {
        count: '2', membership: 'EMAIL_IDENTIFIER + USER_DECLARED_PROTECTED_TERM',
        aMatch: 'PRESENT_TO_HUMAN', aMismatch: 'HOLD', bMatch: 'PRESENT_TO_HUMAN', bMismatch: 'HOLD', absentRejected: 'N/A'
      }
    }[id];
    assert(expected, `unknown packet population ${id}`);
    assert(observed.state.selected === id, `Packet-population browser failed to select ${id}`);
    assert(observed.state.findingCount === expected.count, `Packet-population count drifted for ${id}`);
    assert(observed.state.ruleMembership === expected.membership, `Packet-population membership drifted for ${id}`);
    for (const field of ['aMatch', 'aMismatch', 'bMatch', 'bMismatch', 'absentRejected']) {
      assert(observed.state[field] === expected[field], `Packet-population ${field} drifted for ${id}`);
    }
    assert(observed.storage.local === 0 && observed.storage.session === 0 && observed.storage.cookie === '', `Packet-population browser accumulated persistence at ${id}`);
    return {
      population_id: id,
      finding_count: expected.count,
      membership: expected.membership,
      a_match: observed.state.aMatch,
      a_mismatch: observed.state.aMismatch,
      b_match: observed.state.bMatch,
      b_mismatch: observed.state.bMismatch,
      absent_sibling_rejected: observed.state.absentRejected
    };
  };

  for (const id of ['P_A', 'P_AB', 'P_A', 'P_B', 'P_AB', 'P_B']) {
    receipt.observations.push(await observe(id));
  }
  assert(JSON.stringify(receipt.observations[0]) === JSON.stringify(receipt.observations[2]), 'Packet-population P_A replay drifted after P_AB');
  assert(JSON.stringify(receipt.observations[3]) === JSON.stringify(receipt.observations[5]), 'Packet-population P_B replay drifted after P_AB');

  receipt.populations = boot.report.populations;
  receipt.per_rule = boot.report.per_rule;
  receipt.convergence = {
    source_packets_population_distinguishable: boot.report.source_packets_population_distinguishable,
    carry_cases_population_distinguishable: boot.report.carry_cases_population_distinguishable,
    hosted_projection_population_invariant: boot.report.hosted_projection_population_invariant,
    matching_envelope_population_invariant: boot.report.matching_envelope_population_invariant,
    mismatch_envelope_population_invariant: boot.report.mismatch_envelope_population_invariant,
    matching_decision_population_invariant: boot.report.matching_decision_population_invariant,
    mismatch_decision_population_invariant: boot.report.mismatch_decision_population_invariant,
    absent_sibling_rejected: boot.report.absent_sibling_rejected,
    absent_sibling_rejection_nonpoisoning: boot.report.absent_sibling_rejection_nonpoisoning,
    cross_bindings_rejected_pair: boot.report.cross_bindings_rejected_pair,
    hidden_population_state_carried: boot.report.hidden_population_state_carried,
    browser_replay_invariant: true,
    browser_persistence_accumulated: false
  };
  receipt.storage = { empty_through_singleton_pair_replays: true };
  receipt.network.document_requests = requests.filter(requestUrl => requestUrl === url).length;
  receipt.network.unexpected_requests = requests.filter(requestUrl => requestUrl !== url);
  receipt.network.server_hits = serverHits;
  assert(receipt.network.document_requests === 1, `Packet-population witness expected one assay document load, observed ${receipt.network.document_requests}`);
  assert(receipt.network.unexpected_requests.length === 0, `Packet-population witness observed unexpected requests: ${receipt.network.unexpected_requests.join(', ')}`);
  assert(receipt.errors.console.length === 0 && receipt.errors.page.length === 0, 'Packet-population witness observed page/runtime errors');
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
