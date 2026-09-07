import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import {
  MARROWLINE_VALIDATION_LAYER_HOSTILE_CASE_IDS,
  MARROWLINE_VALIDATION_LAYER_REPLAY_ORDER,
  runMarrowlineValidationLayerPrecedenceAssay
} from './marrowline-validation-layer-precedence-assay.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/marrowline-validation-layer-precedence');
const artifactName = 'marrowline-validation-layer-precedence-v0.1.html';
const receiptPath = path.join(artifactDir, `marrowline-validation-layer-precedence-v0.1-${browserName}-receipt.json`);
const report = runMarrowlineValidationLayerPrecedenceAssay();

function assert(value, message) {
  if (!value) throw new Error(message);
}

function esc(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

const primarySteps = report.primary_cases.map(item => Object.freeze({ phase: 'PRIMARY', ...item }));
const replaySteps = report.replay_cases.map(item => Object.freeze({ phase: 'REPLAY', ...item }));
const steps = Object.freeze([...primarySteps, ...replaySteps].map((item, index) => Object.freeze({
  step_id: `${item.phase}_${item.case_id}`,
  observation_index: index,
  phase: item.phase,
  case_id: item.case_id,
  prefix_name: item.prefix_name,
  suffix_name: item.suffix_name,
  expected_validation_layer: item.expected_validation_layer,
  rejection_error: item.rejection.error,
  rejected: item.rejection.rejected,
  partial_transport_returned: item.partial_transport_returned,
  pair_recovery_stable: item.pair_recovery_stable,
  c_recovery_stable: item.c_recovery_stable
})));

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><title>TD613 Validation-Layer Precedence</title><style>:root{font-family:system-ui,sans-serif;color-scheme:light dark}body{padding:24px;max-width:1080px}main{display:grid;gap:14px}.case{border:1px solid currentColor;border-radius:14px;padding:14px}.buttons{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}button{min-height:44px}code{overflow-wrap:anywhere}@media(max-width:860px){.buttons{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.buttons{grid-template-columns:1fr}}</style></head><body><main data-validation-layer-precedence-assay><header><h1>Lexical suffix order ≠ validation precedence.</h1><p>Packet-wide carrier audit can observe later array content before the sequential duplicate scan begins.</p></header><nav class="buttons">${steps.map(step => `<button type="button" data-step="${step.step_id}">${step.step_id}</button>`).join('')}</nav><section class="case"><div id="step"></div><div id="phase"></div><div id="case"></div><div id="layer"></div><code id="error"></code><div id="transport"></div><div id="pair"></div><div id="c"></div></section></main><script>(()=>{'use strict';const report=${esc(report)};const steps=${esc(steps)};let selected=null;const byId=Object.fromEntries(steps.map(step=>[step.step_id,step]));const render=id=>{const s=byId[id];if(!s)throw new Error('unknown step');selected=id;document.getElementById('step').textContent=id;document.getElementById('phase').textContent=s.phase;document.getElementById('case').textContent=s.case_id;document.getElementById('layer').textContent=s.expected_validation_layer;document.getElementById('error').textContent=s.rejection_error;document.getElementById('transport').textContent=s.partial_transport_returned?'PARTIAL_TRANSPORT_RED':'NO_PARTIAL_TRANSPORT';document.getElementById('pair').textContent=s.pair_recovery_stable?'P_AB_STABLE':'P_AB_DRIFT';document.getElementById('c').textContent=s.c_recovery_stable?'P_C_STABLE':'P_C_DRIFT'};document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>render(button.dataset.step)));render(steps[0].step_id);window.__TD613_VALIDATION_LAYER_PRECEDENCE__=Object.freeze({report,steps,select:render,getState:()=>({selected,phase:document.getElementById('phase').textContent,case_id:document.getElementById('case').textContent,layer:document.getElementById('layer').textContent,error:document.getElementById('error').textContent,transport:document.getElementById('transport').textContent,pair:document.getElementById('pair').textContent,c:document.getElementById('c').textContent})})})();</script></body></html>`;

const artifactSha256 = crypto.createHash('sha256').update(html, 'utf8').digest('hex');
const artifactBytes = Buffer.byteLength(html, 'utf8');
for (const forbidden of ['localStorage.setItem', 'sessionStorage.setItem', 'indexedDB', 'BroadcastChannel', 'serviceWorker', 'fetch(', 'XMLHttpRequest', 'WebSocket']) {
  assert(!html.includes(forbidden), `forbidden browser primitive: ${forbidden}`);
}
assert(report.status === 'PASS', 'static validation-layer assay failed');
assert(report.packet_wide_preaudit_preempts_lexically_earlier_duplicate === true, 'packet-wide precedence theorem failed');
assert(report.sequential_suffix_violations_masked_by_earlier_duplicate === true, 'sequential masking theorem failed');
assert(report.clean_suffix_preserves_duplicate_class === true, 'clean suffix control failed');
assert(report.reachability_controls_confirm_suffix_classes === true, 'reachability controls failed');
assert(report.no_partial_transport_from_hostile_matrix === true, 'partial transport control failed');
assert(report.lawful_pair_matches_1064_parent === true, '#1064 lawful pair continuity failed');
assert(report.lawful_c_recovery_stable === true, 'lawful C recovery failed');
assert(report.primary_replay_invariant === true, 'validation-layer family replay failed');

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
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const address = server.address();
if (!address || typeof address === 'string') throw new Error('validation-layer witness server did not bind');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const receipt = {
  schema: 'td613.marrowline.validation-layer-precedence-browser-witness/v0.1-local-only',
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
  exact_hostile_case_ids: MARROWLINE_VALIDATION_LAYER_HOSTILE_CASE_IDS,
  replay_order: MARROWLINE_VALIDATION_LAYER_REPLAY_ORDER,
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
  claim_ceiling: 'bounded-two-prefix-five-suffix-validation-layer-precedence-browser-only',
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
  await page.waitForSelector('[data-validation-layer-precedence-assay]');
  const boot = await page.evaluate(() => ({
    state: window.__TD613_VALIDATION_LAYER_PRECEDENCE__.getState(),
    count: window.__TD613_VALIDATION_LAYER_PRECEDENCE__.steps.length,
    storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie },
    csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null,
    free: document.querySelectorAll('input,textarea,[contenteditable="true"]').length
  }));
  assert(boot.count === 20, `expected 20 primary/replay hostile observations, got ${boot.count}`);
  assert(boot.storage.local === 0 && boot.storage.session === 0 && boot.storage.cookie === '', 'inherited browser persistence');
  assert(/connect-src 'none'/.test(boot.csp || ''), 'validation-layer CSP drifted');
  assert(boot.free === 0, 'validation-layer witness exposed free text');

  for (const step of steps) {
    await page.evaluate(id => window.__TD613_VALIDATION_LAYER_PRECEDENCE__.select(id), step.step_id);
    const observed = await page.evaluate(() => ({
      state: window.__TD613_VALIDATION_LAYER_PRECEDENCE__.getState(),
      storage: { local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }
    }));
    assert(observed.state.selected === step.step_id, `selection drift ${step.step_id}`);
    assert(observed.state.phase === step.phase, `phase drift ${step.step_id}`);
    assert(observed.state.case_id === step.case_id, `case drift ${step.step_id}`);
    assert(observed.state.layer === step.expected_validation_layer, `validation-layer drift ${step.step_id}`);
    assert(observed.state.error === step.rejection_error, `rejection error drift ${step.step_id}`);
    assert(observed.state.transport === 'NO_PARTIAL_TRANSPORT', `partial transport surfaced ${step.step_id}`);
    assert(observed.state.pair === 'P_AB_STABLE', `P_AB recovery drift ${step.step_id}`);
    assert(observed.state.c === 'P_C_STABLE', `P_C recovery drift ${step.step_id}`);
    assert(observed.storage.local === 0 && observed.storage.session === 0 && observed.storage.cookie === '', `persistence at ${step.step_id}`);
    receipt.observations.push(observed.state);
  }

  const primaryById = Object.fromEntries(steps.filter(step => step.phase === 'PRIMARY').map(step => [step.case_id, step]));
  const replayById = Object.fromEntries(steps.filter(step => step.phase === 'REPLAY').map(step => [step.case_id, step]));
  for (const id of MARROWLINE_VALIDATION_LAYER_HOSTILE_CASE_IDS) {
    const first = primaryById[id];
    const second = replayById[id];
    assert(first && second, `missing primary/replay pair ${id}`);
    for (const key of ['expected_validation_layer', 'rejection_error', 'rejected', 'partial_transport_returned', 'pair_recovery_stable', 'c_recovery_stable']) {
      assert(JSON.stringify(first[key]) === JSON.stringify(second[key]), `${id} browser replay drift at ${key}`);
    }
  }

  receipt.convergence = {
    packet_wide_preaudit_preempts_lexically_earlier_duplicate: report.packet_wide_preaudit_preempts_lexically_earlier_duplicate,
    sequential_suffix_violations_masked_by_earlier_duplicate: report.sequential_suffix_violations_masked_by_earlier_duplicate,
    clean_suffix_preserves_duplicate_class: report.clean_suffix_preserves_duplicate_class,
    reachability_controls_confirm_suffix_classes: report.reachability_controls_confirm_suffix_classes,
    no_partial_transport_from_hostile_matrix: report.no_partial_transport_from_hostile_matrix,
    lawful_pair_matches_1064_parent: report.lawful_pair_matches_1064_parent,
    lawful_c_recovery_stable: report.lawful_c_recovery_stable,
    primary_replay_invariant: report.primary_replay_invariant,
    portable_validation_history_carried: report.portable_validation_history_carried,
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
  if (browserName === 'firefox') assert(receipt.errors.browser_chrome.length <= 1, 'unexpected Firefox browser-chrome diagnostics');
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
console.log(`Marrowline validation-layer precedence browser witness (${browserName}): PASS`);
