import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import {
  runMarrowlineReturnPermutationIsolationAssay
} from './marrowline-return-permutation-isolation-assay.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/marrowline-return-permutation-isolation');
const artifactName = 'marrowline-return-permutation-isolation-v0.1.html';
const receiptPath = path.join(artifactDir, `marrowline-return-permutation-isolation-v0.1-${browserName}-receipt.json`);
const staticAssay = runMarrowlineReturnPermutationIsolationAssay();
const expectedScheduleIds = ['AB', 'BA', 'A_ONLY', 'B_ONLY', 'AAB', 'BBA', 'A_BHOLD_A', 'B_AHOLD_B'];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function escapeJsonForScript(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function renderHtml(report) {
  const embedded = escapeJsonForScript(report);
  const buttons = report.schedules.map(schedule => `<button type="button" data-schedule="${schedule.schedule_id}">${schedule.schedule_id}</button>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'">
<title>TD613 Marrowline Return Permutation Isolation</title>
<style>
:root{font-family:system-ui,sans-serif;color-scheme:light dark}body{margin:0;padding:24px;max-width:840px}main{display:grid;gap:16px}.case,.schedule{border:1px solid currentColor;border-radius:16px;padding:16px}nav{display:flex;gap:8px;flex-wrap:wrap}button{font:inherit;min-height:44px;padding:9px 12px}.steps{display:grid;gap:8px}.step{border-inline-start:3px solid currentColor;padding-inline-start:10px}.status{font-weight:700}.muted{opacity:.72}@media(max-width:520px){body{padding:14px}}
</style>
</head>
<body>
<main data-return-permutation-assay>
<header><div class="muted">Local-only scientific assay</div><h1>Same findings. Different return schedules. No sibling authority transfer.</h1></header>
<section class="case"><strong>Shared Carry Case</strong><div id="caseRules"></div><div class="muted">Repeated revalidation is not replay protection.</div></section>
<nav aria-label="Bounded return schedules">${buttons}</nav>
<section class="schedule" aria-live="polite"><strong id="scheduleId"></strong><div id="omitted" class="muted"></div><div id="steps" class="steps"></div></section>
<footer class="muted">Schedule labels and counters belong only to this assay surface.</footer>
</main>
<script>
(() => {
  'use strict';
  const report = ${embedded};
  let selected = null;
  const render = id => {
    const schedule = report.schedules.find(item => item.schedule_id === id);
    if (!schedule) throw new Error('unknown return schedule');
    selected = id;
    document.getElementById('scheduleId').textContent = id + ' · ' + schedule.sequence.join(' → ');
    document.getElementById('omitted').textContent = schedule.omitted_sibling ? ('omitted sibling: ' + schedule.omitted_sibling) : 'no omitted sibling';
    const root = document.getElementById('steps');
    root.textContent = '';
    schedule.steps.forEach((step, index) => {
      const row = document.createElement('div');
      row.className = 'step';
      row.dataset.step = String(index + 1);
      const token = document.createElement('span');
      token.textContent = step.assay_token + ' · ';
      const status = document.createElement('span');
      status.className = 'status';
      status.textContent = step.status;
      row.append(token, status);
      root.append(row);
    });
  };
  document.getElementById('caseRules').textContent = report.shared_case.finding_rule_ids.join(' · ');
  document.querySelectorAll('[data-schedule]').forEach(button => button.addEventListener('click', () => render(button.dataset.schedule)));
  render('AB');
  window.__TD613_MARROWLINE_RETURN_PERMUTATION_ISOLATION__ = Object.freeze({
    report,
    getState: () => ({
      selected,
      statuses: Array.from(document.querySelectorAll('#steps .status')).map(node => node.textContent),
      tokens: Array.from(document.querySelectorAll('#steps .step')).map(node => node.textContent.split(' · ')[0])
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

assert(staticAssay.status === 'PASS', 'static return permutation assay did not pass before browser observation');
assert(JSON.stringify(staticAssay.schedules.map(item => item.schedule_id)) === JSON.stringify(expectedScheduleIds), 'static return schedule set drifted');
assert(staticAssay.replay_protection_claimed === false, 'browser witness may not widen repeated revalidation into replay protection');
assert(staticAssay.exactly_once_semantics_claimed === false, 'browser witness may not widen repeated revalidation into exactly-once semantics');

const html = renderHtml(staticAssay);
const artifactSha256 = crypto.createHash('sha256').update(html, 'utf8').digest('hex');
const artifactBytes = Buffer.byteLength(html, 'utf8');
for (const forbidden of ['localStorage.setItem', 'sessionStorage.setItem', 'indexedDB', 'BroadcastChannel', 'serviceWorker', 'fetch(', 'XMLHttpRequest', 'WebSocket']) {
  assert(!html.includes(forbidden), `return permutation artifact contains persistence/network primitive: ${forbidden}`);
}
assert(!html.includes('<input'), 'return permutation artifact may not expose free-text input');

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
if (!address || typeof address === 'string') throw new Error('return permutation witness server did not bind');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const receipt = {
  schema: 'td613.marrowline.return-permutation-isolation-browser-witness/v0.1-local-only',
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
  schedules: [],
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
  replay_protection_claimed: false,
  exactly_once_semantics_claimed: false,
  claim_ceiling: 'bounded-two-finding-return-order-omission-repetition-browser-nontransfer-only',
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
  await page.waitForSelector('[data-return-permutation-assay]');
  const boot = await page.evaluate(() => ({
    state: window.__TD613_MARROWLINE_RETURN_PERMUTATION_ISOLATION__.getState(),
    report: window.__TD613_MARROWLINE_RETURN_PERMUTATION_ISOLATION__.report,
    storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie },
    csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null,
    free_text_inputs: document.querySelectorAll('input,textarea,[contenteditable="true"]').length
  }));
  assert(boot.state.selected === 'AB', 'return permutation artifact did not boot AB');
  assert(JSON.stringify(boot.report.schedules.map(item => item.schedule_id)) === JSON.stringify(expectedScheduleIds), 'browser report schedule set drifted');
  assert(boot.report.shared_case.finding_count === 2, 'browser report lost shared two-finding case');
  assert(JSON.stringify(boot.report.shared_case.finding_rule_ids) === JSON.stringify(['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM']), 'browser shared rule IDs drifted');
  assert(boot.storage.local === 0 && boot.storage.session === 0 && boot.storage.cookie === '', 'return permutation artifact inherited persistence');
  assert(/connect-src 'none'/.test(boot.csp || ''), 'return permutation artifact lost connection-denying CSP');
  assert(boot.free_text_inputs === 0, 'return permutation artifact exposed free-text transport input');

  for (const id of expectedScheduleIds) {
    if (id !== 'AB') await page.click(`[data-schedule="${id}"]`);
    const observed = await page.evaluate(() => ({
      state: window.__TD613_MARROWLINE_RETURN_PERMUTATION_ISOLATION__.getState(),
      storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }
    }));
    const expected = boot.report.schedules.find(item => item.schedule_id === id);
    assert(observed.state.selected === id, `browser did not select ${id}`);
    assert(JSON.stringify(observed.state.statuses) === JSON.stringify(expected.steps.map(step => step.status)), `${id} browser status trace drifted`);
    assert(JSON.stringify(observed.state.tokens) === JSON.stringify(expected.steps.map(step => step.assay_token)), `${id} browser token trace drifted`);
    assert(observed.storage.local === 0 && observed.storage.session === 0 && observed.storage.cookie === '', `${id} accumulated browser persistence`);
    receipt.schedules.push({
      schedule_id: id,
      sequence: expected.sequence,
      omitted_sibling: expected.omitted_sibling,
      statuses: observed.state.statuses,
      tokens: observed.state.tokens,
      carry_case_unchanged: expected.carry_case_unchanged,
      envelopes_unchanged: expected.envelopes_unchanged,
      portable_schedule_state_created: expected.portable_schedule_state_created
    });
  }

  await page.click('[data-schedule="AB"]');
  const returnState = await page.evaluate(() => ({
    state: window.__TD613_MARROWLINE_RETURN_PERMUTATION_ISOLATION__.getState(),
    storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }
  }));
  assert(returnState.state.selected === 'AB', 'return to AB failed');
  assert(JSON.stringify(returnState.state.statuses) === JSON.stringify(['PRESENT_TO_HUMAN', 'PRESENT_TO_HUMAN']), 'return to AB drifted after bounded schedule traversal');
  assert(returnState.storage.local === 0 && returnState.storage.session === 0 && returnState.storage.cookie === '', 'return to AB accumulated browser persistence');

  receipt.shared_case = {
    finding_count: boot.report.shared_case.finding_count,
    finding_rule_ids: boot.report.shared_case.finding_rule_ids,
    source_packet: boot.report.shared_case.source_packet,
    carry_case: boot.report.shared_case.carry_case,
    hosted_findings: boot.report.shared_case.hosted_findings,
    return_envelopes: boot.report.shared_case.return_envelopes,
    local_binding_carried: boot.report.shared_case.local_binding_carried,
    release_authority: boot.report.shared_case.release_authority,
    human_closure_required: boot.report.shared_case.human_closure_required,
    forbidden_portable_state_paths: boot.report.shared_case.forbidden_portable_state_paths
  };
  receipt.convergence = {
    schedule_count: expectedScheduleIds.length,
    all_schedules_observed: receipt.schedules.length === expectedScheduleIds.length,
    order_invariant_for_observed_matching_returns: boot.report.order_invariant_for_observed_matching_returns,
    sibling_omission_created_no_portable_closure_state: boot.report.sibling_omission_created_no_portable_closure_state,
    duplicate_return_transferred_no_sibling_authority: boot.report.duplicate_return_transferred_no_sibling_authority,
    interposed_hold_changed_no_sibling_match_result: boot.report.interposed_hold_changed_no_sibling_match_result,
    shared_carry_case_unchanged_across_schedules: boot.report.shared_carry_case_unchanged_across_schedules,
    wrong_rule_binding_rejected: boot.report.wrong_rule_binding_rejected,
    portable_return_ordinal_carried: boot.report.portable_return_ordinal_carried,
    portable_duplicate_counter_carried: boot.report.portable_duplicate_counter_carried,
    portable_completion_map_carried: boot.report.portable_completion_map_carried,
    browser_persistence_accumulated: false
  };
  receipt.storage = { empty_before_after_and_return: true };
  receipt.network.document_requests = requests.filter(requestUrl => requestUrl === url).length;
  receipt.network.unexpected_requests = requests.filter(requestUrl => requestUrl !== url);
  receipt.network.server_hits = serverHits;
  assert(receipt.network.document_requests === 1, `return permutation witness expected one assay document load, observed ${receipt.network.document_requests}`);
  assert(receipt.network.unexpected_requests.length === 0, `return permutation witness observed unexpected requests: ${receipt.network.unexpected_requests.join(', ')}`);
  assert(receipt.errors.console.length === 0 && receipt.errors.page.length === 0, 'return permutation witness observed page/runtime errors');
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
