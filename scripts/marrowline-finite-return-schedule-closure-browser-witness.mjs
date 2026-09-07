import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import {
  MARROWLINE_FINITE_RETURN_SCHEDULES,
  MARROWLINE_FINITE_RETURN_REPLAY_ORDER,
  runMarrowlineFiniteReturnScheduleClosureAssay
} from './marrowline-finite-return-schedule-closure-assay.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/marrowline-finite-return-schedule-closure');
const artifactName = 'marrowline-finite-return-schedule-closure-v0.2.html';
const receiptPath = path.join(artifactDir, `marrowline-finite-return-schedule-closure-v0.2-${browserName}-receipt.json`);
const report = runMarrowlineFiniteReturnScheduleClosureAssay();

function assert(value, message) { if (!value) throw new Error(message); }
function esc(value) { return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026'); }

const primary = report.primary_schedules.map(item => Object.freeze({ phase: 'PRIMARY', ...item }));
const replay = report.replay_schedules.map(item => Object.freeze({ phase: 'REPLAY', ...item }));
const steps = Object.freeze([...primary, ...replay].map((item, index) => Object.freeze({
  step_id: `${item.phase}_${item.schedule_id}`,
  local_observation_index: index,
  phase: item.phase,
  schedule_id: item.schedule_id,
  execution: item.execution,
  statuses: Object.freeze(item.observations.map(obs => `${obs.label}:${obs.mode}:${obs.result.status}`)),
  omitted_sibling_probe: item.omitted_sibling_probe,
  carry_case_unchanged: item.carry_case_unchanged,
  local_bindings_unchanged: item.local_bindings_unchanged,
  canonical_envelopes_unchanged: item.canonical_envelopes_unchanged,
  authority_closed: item.authority_closed
})));

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><title>TD613 Finite Return-Schedule Closure</title><style>:root{font-family:system-ui,sans-serif;color-scheme:light dark}body{padding:24px;max-width:1040px}main{display:grid;gap:14px}.case{border:1px solid currentColor;border-radius:14px;padding:14px}.buttons{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}button{min-height:44px}@media(max-width:800px){.buttons{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.buttons{grid-template-columns:1fr}}</style></head><body><main data-finite-return-schedule-assay><header><h1>Return schedule ≠ portable authority.</h1><p>Eight declared schedules and one deterministic family replay must preserve finding identity, sibling isolation, and empty portable schedule memory.</p></header><nav class="buttons">${steps.map(step => `<button type="button" data-step="${step.step_id}">${step.step_id}</button>`).join('')}</nav><section class="case"><div id="step"></div><div id="phase"></div><div id="schedule"></div><div id="execution"></div><div id="statuses"></div><div id="omission"></div><div id="carry"></div><div id="bindings"></div><div id="envelopes"></div></section></main><script>(()=>{'use strict';const report=${esc(report)};const steps=${esc(steps)};let selected=null;const byId=Object.fromEntries(steps.map(step=>[step.step_id,step]));const render=id=>{const s=byId[id];if(!s)throw new Error('unknown step');selected=id;document.getElementById('step').textContent=id;document.getElementById('phase').textContent=s.phase;document.getElementById('schedule').textContent=s.schedule_id;document.getElementById('execution').textContent=s.execution.join(' → ');document.getElementById('statuses').textContent=s.statuses.join(' | ');document.getElementById('omission').textContent=s.omitted_sibling_probe?('OMITTED '+s.omitted_sibling_probe.label+' → '+s.omitted_sibling_probe.result.status):'NO_OMISSION_CONTROL';document.getElementById('carry').textContent=s.carry_case_unchanged?'CARRY_CASE_STABLE':'CARRY_CASE_DRIFT';document.getElementById('bindings').textContent=s.local_bindings_unchanged?'BINDINGS_STABLE':'BINDING_DRIFT';document.getElementById('envelopes').textContent=s.canonical_envelopes_unchanged?'ENVELOPES_STABLE':'ENVELOPE_DRIFT'};document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>render(button.dataset.step)));render(steps[0].step_id);window.__TD613_FINITE_RETURN_SCHEDULE__=Object.freeze({report,steps,select:render,getState:()=>({selected,phase:document.getElementById('phase').textContent,schedule:document.getElementById('schedule').textContent,execution:document.getElementById('execution').textContent,statuses:document.getElementById('statuses').textContent,omission:document.getElementById('omission').textContent,carry:document.getElementById('carry').textContent,bindings:document.getElementById('bindings').textContent,envelopes:document.getElementById('envelopes').textContent})})})();</script></body></html>`;

const artifactSha256 = crypto.createHash('sha256').update(html, 'utf8').digest('hex');
const artifactBytes = Buffer.byteLength(html, 'utf8');
for (const forbidden of ['localStorage.setItem', 'sessionStorage.setItem', 'indexedDB', 'BroadcastChannel', 'serviceWorker', 'fetch(', 'XMLHttpRequest', 'WebSocket']) {
  assert(!html.includes(forbidden), `forbidden primitive: ${forbidden}`);
}
assert(report.status === 'PASS', 'static finite return-schedule assay failed');
assert(report.lawful_pair_matches_1062_parent === true, 'static #1062 parent continuity failed');
assert(report.return_order_identity_stable === true, 'static return-order identity stability failed');
assert(report.sibling_omission_no_closure_transfer === true, 'static omission closure-transfer control failed');
assert(report.repeated_return_no_sibling_authorization === true, 'static repeated-return authorization control failed');
assert(report.local_hold_no_sibling_decision_drift === true, 'static HOLD sibling-drift control failed');
assert(report.finite_schedule_no_portable_memory === true, 'static portable schedule-memory control failed');
assert(report.family_replay_invariant === true, 'static family replay invariant failed');
assert(report.wrong_rule_binding_rejected === true && report.wrong_binding_nonpoisoning === true, 'static wrong-binding control failed');

await fs.mkdir(artifactDir, { recursive: true });
await fs.writeFile(path.join(artifactDir, artifactName), html, 'utf8');

const serverHits = [];
const server = http.createServer((req, res) => {
  serverHits.push({ method: req.method, url: req.url });
  if (req.method === 'GET' && req.url === `/${artifactName}`) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(html);
  } else {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  }
});
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const address = server.address();
if (!address || typeof address === 'string') throw new Error('server did not bind');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const receipt = {
  schema: 'td613.marrowline.finite-return-schedule-closure-browser-witness/v0.2-local-only',
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
  schedule_ids: MARROWLINE_FINITE_RETURN_SCHEDULES.map(item => item.id),
  replay_order: MARROWLINE_FINITE_RETURN_REPLAY_ORDER,
  observations: [],
  convergence: {},
  network: { document_requests: 0, unexpected_requests: [], server_hits: [] },
  storage: {},
  errors: { console: [], page: [], browser_chrome: [] },
  authority: { release_authority: false, human_closure_required: true, provider_call_performed: false, production_mutation: false },
  claim_ceiling: 'bounded-two-finding-eight-schedule-return-browser-closure-only',
  seal: '⟐'
};

function firefoxFavicon(message) {
  if (browserName !== 'firefox' || message.type() !== 'error') return false;
  const text = String(message.text() || '');
  const location = String(message.location()?.url || '');
  return text.includes('Content-Security-Policy') && text.includes('/favicon.ico') &&
    (location.includes('FaviconLoader.sys.mjs') || text.includes('FaviconLoader.sys.mjs'));
}

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
    if (firefoxFavicon(message)) receipt.errors.browser_chrome.push({ text: message.text(), location: message.location()?.url || null });
    else receipt.errors.console.push({ text: message.text(), location: message.location()?.url || null });
  });
  page.on('pageerror', error => receipt.errors.page.push({ text: error.message }));

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-finite-return-schedule-assay]');
  const boot = await page.evaluate(() => ({
    state: window.__TD613_FINITE_RETURN_SCHEDULE__.getState(),
    count: window.__TD613_FINITE_RETURN_SCHEDULE__.steps.length,
    storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie },
    csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null,
    free: document.querySelectorAll('input,textarea,[contenteditable="true"]').length
  }));
  assert(boot.count === 16, `expected 16 primary/replay schedule observations, got ${boot.count}`);
  assert(boot.storage.local === 0 && boot.storage.session === 0 && boot.storage.cookie === '', 'inherited persistence');
  assert(/connect-src 'none'/.test(boot.csp || ''), 'CSP drifted');
  assert(boot.free === 0, 'free text exposed');

  for (const step of steps) {
    await page.evaluate(id => window.__TD613_FINITE_RETURN_SCHEDULE__.select(id), step.step_id);
    const observed = await page.evaluate(() => ({
      state: window.__TD613_FINITE_RETURN_SCHEDULE__.getState(),
      storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }
    }));
    assert(observed.state.selected === step.step_id, `selection drift ${step.step_id}`);
    assert(observed.state.phase === step.phase, `phase drift ${step.step_id}`);
    assert(observed.state.schedule === step.schedule_id, `schedule drift ${step.step_id}`);
    assert(observed.state.carry === 'CARRY_CASE_STABLE', `Carry Case drift surfaced at ${step.step_id}`);
    assert(observed.state.bindings === 'BINDINGS_STABLE', `local binding drift surfaced at ${step.step_id}`);
    assert(observed.state.envelopes === 'ENVELOPES_STABLE', `envelope drift surfaced at ${step.step_id}`);
    assert(observed.storage.local === 0 && observed.storage.session === 0 && observed.storage.cookie === '', `persistence at ${step.step_id}`);
    receipt.observations.push(observed.state);
  }

  for (const id of MARROWLINE_FINITE_RETURN_SCHEDULES.map(item => item.id)) {
    const first = steps.find(step => step.phase === 'PRIMARY' && step.schedule_id === id);
    const second = steps.find(step => step.phase === 'REPLAY' && step.schedule_id === id);
    assert(first && second, `missing primary/replay pair ${id}`);
    assert(JSON.stringify(first.execution) === JSON.stringify(second.execution), `${id} execution drifted`);
    assert(JSON.stringify(first.statuses) === JSON.stringify(second.statuses), `${id} statuses drifted`);
    assert(JSON.stringify(first.omitted_sibling_probe) === JSON.stringify(second.omitted_sibling_probe), `${id} omission control drifted`);
    assert(first.carry_case_unchanged === second.carry_case_unchanged, `${id} Carry Case replay drifted`);
    assert(first.local_bindings_unchanged === second.local_bindings_unchanged, `${id} binding replay drifted`);
    assert(first.canonical_envelopes_unchanged === second.canonical_envelopes_unchanged, `${id} envelope replay drifted`);
  }

  receipt.convergence = {
    lawful_pair_matches_1062_parent: report.lawful_pair_matches_1062_parent,
    return_order_identity_stable: report.return_order_identity_stable,
    sibling_omission_no_closure_transfer: report.sibling_omission_no_closure_transfer,
    repeated_return_no_sibling_authorization: report.repeated_return_no_sibling_authorization,
    local_hold_no_sibling_decision_drift: report.local_hold_no_sibling_decision_drift,
    finite_schedule_no_portable_memory: report.finite_schedule_no_portable_memory,
    shared_carry_case_unchanged_across_schedules: report.shared_carry_case_unchanged_across_schedules,
    local_bindings_unchanged_across_schedules: report.local_bindings_unchanged_across_schedules,
    canonical_envelopes_unchanged_across_schedules: report.canonical_envelopes_unchanged_across_schedules,
    wrong_rule_binding_rejected: report.wrong_rule_binding_rejected,
    wrong_binding_nonpoisoning: report.wrong_binding_nonpoisoning,
    family_replay_invariant: report.family_replay_invariant,
    portable_schedule_state_carried: report.portable_schedule_state_carried,
    browser_replay_invariant: true,
    browser_persistence_accumulated: false
  };
  receipt.storage = { empty_through_primary_and_replay_family: true };
  receipt.network.document_requests = requests.filter(requestUrl => requestUrl === url).length;
  receipt.network.unexpected_requests = requests.filter(requestUrl => requestUrl !== url);
  receipt.network.server_hits = serverHits;
  assert(receipt.network.document_requests === 1, `expected one document, got ${receipt.network.document_requests}`);
  assert(receipt.network.unexpected_requests.length === 0, `unexpected requests: ${receipt.network.unexpected_requests.join(',')}`);
  assert(receipt.errors.console.length === 0 && receipt.errors.page.length === 0, 'runtime/page errors');
  if (browserName === 'firefox') assert(receipt.errors.browser_chrome.length <= 1, 'unexpected Firefox diagnostics');
  else assert(receipt.errors.browser_chrome.length === 0, 'unexpected browser-chrome diagnostics');
  receipt.status = 'PASS';
  await context.close();
} catch (error) {
  terminalError = error;
  receipt.status = 'FAIL';
  receipt.terminal_error = { name: error.name, message: error.message, stack: error.stack };
} finally {
  if (browser) await browser.close().catch(() => {});
  await new Promise(resolve => server.close(resolve));
  await fs.writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
}

if (terminalError) throw terminalError;
console.log(`Marrowline finite return-schedule closure browser witness (${browserName}): PASS`);
