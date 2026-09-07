import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import { runPortableAiaReceiverMarginalCouplingSeparationAssay } from './portable-aia-receiver-marginal-coupling-separation-assay.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/portable-aia-receiver-marginal-coupling-separation');
const artifactName = 'portable-aia-receiver-marginal-coupling-separation-v0.1.html';
const receiptPath = path.join(artifactDir, `portable-aia-receiver-marginal-coupling-separation-v0.1-${browserName}-receipt.json`);
const report = runPortableAiaReceiverMarginalCouplingSeparationAssay();

function assert(value, message) { if (!value) throw new Error(message); }
function esc(value) { return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026'); }

const cells = report.semantic_cells.map(cell => Object.freeze({
  ...cell,
  mu0:report.measures.mu0.matrix[cell.row][cell.column],
  mu1:report.measures.mu1.matrix[cell.row][cell.column]
}));

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><title>TD613 Receiver Coupling Separation</title><style>:root{font-family:system-ui,sans-serif;color-scheme:light dark}body{padding:24px;max-width:1100px}main{display:grid;gap:16px}.summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.summary div,.cell,.detail{border:1px solid currentColor;border-radius:12px;padding:12px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.cell{min-height:74px;text-align:left}.cell[aria-pressed="true"]{outline:3px solid currentColor}.detail{white-space:pre-wrap;overflow-wrap:anywhere}@media(max-width:720px){.summary,.grid{grid-template-columns:1fr}}</style></head><body><main data-coupling-separation><header><h1>Same marginals, different joint.</h1><p>The receiver lattice stays fixed. Only the synthetic measure changes.</p></header><section class="summary"><div>ROWS 12×7</div><div>COLS 28×3</div><div>TV 1/42</div><div>B₂ 4</div></section><section class="grid">${cells.map((cell,index) => `<button type="button" class="cell" data-cell="${index}" aria-pressed="false">${cell.point_id}<br>μ₀=${cell.mu0} · μ₁=${cell.mu1}</button>`).join('')}</section><section class="detail" id="detail"></section></main><script>(()=>{'use strict';const report=${esc(report)};const cells=${esc(cells)};let selected=-1;const buttons=[...document.querySelectorAll('[data-cell]')];const render=index=>{const cell=cells[index];if(!cell)throw new Error('unknown coupling cell');selected=index;buttons.forEach(button=>button.setAttribute('aria-pressed',Number(button.dataset.cell)===index?'true':'false'));document.getElementById('detail').textContent=JSON.stringify(cell,null,2)};buttons.forEach(button=>button.addEventListener('click',()=>render(Number(button.dataset.cell))));render(0);window.__TD613_RECEIVER_COUPLING__=Object.freeze({report,cells,select:render,getState:()=>({selected,detail:document.getElementById('detail').textContent,pressed:buttons.filter(button=>button.getAttribute('aria-pressed')==='true').map(button=>Number(button.dataset.cell)),localStorageLength:localStorage.length,sessionStorageLength:sessionStorage.length,cookie:document.cookie})})})();</script></body></html>`;

const artifactSha256 = crypto.createHash('sha256').update(html, 'utf8').digest('hex');
const artifactBytes = Buffer.byteLength(html, 'utf8');
for (const forbidden of ['localStorage.setItem','sessionStorage.setItem','indexedDB','BroadcastChannel','serviceWorker','fetch(','XMLHttpRequest','WebSocket']) {
  assert(!html.includes(forbidden), `forbidden browser primitive: ${forbidden}`);
}
assert(report.status === 'PASS', 'static coupling assay failed');
assert(report.receiver_marginals.policy_identical === true && report.receiver_marginals.boundary_identical === true, 'single-receiver marginals drifted');
assert(report.joint_coupling.mu0_independent === true && report.joint_coupling.mu1_independent === false, 'independence separation drifted');
assert(report.joint_coupling.changed_cell_count === 4, 'joint changed-cell count drifted');
assert(report.exact_separation.total_variation.numerator === 1 && report.exact_separation.total_variation.denominator === 42, 'exact TV drifted');
assert(report.exact_separation.e_plus_attains_tv_bound === true, 'E+ lost TV witness status');

await fs.mkdir(artifactDir, { recursive:true });
await fs.writeFile(path.join(artifactDir, artifactName), html, 'utf8');

const serverHits = [];
const server = http.createServer((req,res) => {
  serverHits.push({ method:req.method, url:req.url });
  if (req.method === 'GET' && req.url === `/${artifactName}`) {
    res.writeHead(200, { 'content-type':'text/html; charset=utf-8', 'cache-control':'no-store' });
    res.end(html);
  } else {
    res.writeHead(404, { 'content-type':'text/plain' });
    res.end('not found');
  }
});
await new Promise((resolve,reject) => { server.once('error',reject); server.listen(0,'127.0.0.1',resolve); });
const address = server.address();
if (!address || typeof address === 'string') throw new Error('coupling witness server failed to bind');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const receipt = {
  schema:'td613.portable-aia.receiver-marginal-coupling-separation-browser-witness/v0.1-local-only',
  browser:browserName,
  status:'RUNNING',
  assay_local_only:true,
  artifact:{ name:artifactName, sha256:artifactSha256, bytes:artifactBytes, generated_from_canonical_assay:true, product_source_bytes_mutated:false },
  observations:[],
  convergence:{},
  network:{ document_requests:0, unexpected_requests:[], server_hits:[] },
  storage:{},
  errors:{ console:[], page:[], browser_chrome:[] },
  authority:{ release_authority:false, human_closure_required:true, provider_call_performed:false, production_mutation:false },
  counts_as_exogenous_witness:false,
  golden_egg_credit:0,
  claim_ceiling:'exact-current-21-cell-synthetic-same-marginal-distinct-joint-coupling-browser-witness-only',
  seal:'⟐'
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
  browser = await engine.launch({ headless:true });
  const context = await browser.newContext({ viewport:{width:1280,height:800}, reducedMotion:'no-preference' });
  const requests = [];
  context.on('request', request => requests.push(request.url()));
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.on('console', message => {
    if (message.type() !== 'error') return;
    if (firefoxFavicon(message)) receipt.errors.browser_chrome.push({ text:message.text(), location:message.location()?.url || null });
    else receipt.errors.console.push({ text:message.text(), location:message.location()?.url || null });
  });
  page.on('pageerror', error => receipt.errors.page.push({ text:error.message }));

  await page.goto(url, { waitUntil:'domcontentloaded' });
  await page.waitForSelector('[data-coupling-separation]');
  const boot = await page.evaluate(() => ({
    count:window.__TD613_RECEIVER_COUPLING__.cells.length,
    state:window.__TD613_RECEIVER_COUPLING__.getState(),
    csp:document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null,
    freeText:document.querySelectorAll('input,textarea,[contenteditable="true"]').length
  }));
  assert(boot.count === 21, `expected 21 semantic cells, got ${boot.count}`);
  assert(boot.state.localStorageLength === 0 && boot.state.sessionStorageLength === 0 && boot.state.cookie === '', 'browser persistence inherited before coupling traversal');
  assert(/connect-src 'none'/.test(boot.csp || ''), 'coupling witness CSP drifted');
  assert(boot.freeText === 0, 'coupling witness exposed free-text input');

  let changed = 0;
  for (let index = 0; index < 21; index += 1) {
    await page.evaluate(i => window.__TD613_RECEIVER_COUPLING__.select(i), index);
    const state = await page.evaluate(() => window.__TD613_RECEIVER_COUPLING__.getState());
    assert(state.selected === index && state.pressed.length === 1 && state.pressed[0] === index, `selection drift at semantic cell ${index}`);
    assert(state.localStorageLength === 0 && state.sessionStorageLength === 0 && state.cookie === '', `persistence appeared at semantic cell ${index}`);
    const cell = JSON.parse(state.detail);
    assert(typeof cell.point_id === 'string' && Number.isInteger(cell.mu0) && Number.isInteger(cell.mu1), `semantic coupling cell ${index} malformed`);
    if (cell.mu0 !== cell.mu1) changed += 1;
    receipt.observations.push({ index, point_id:cell.point_id, mu0:cell.mu0, mu1:cell.mu1 });
  }
  assert(changed === 4, `browser joint table changed-cell count drifted: ${changed}`);

  const inPage = await page.evaluate(() => window.__TD613_RECEIVER_COUPLING__.report);
  assert(inPage.parent_structure.generated_sublattice_B2 === true && inPage.parent_structure.measure_free_structure_unchanged === true, 'browser report drifted inherited B2 structure');
  assert(inPage.receiver_marginals.policy_identical === true && inPage.receiver_marginals.boundary_identical === true, 'browser report lost equal marginals');
  assert(inPage.receiver_marginals.either_single_receiver_marginal_distinguishes_measures === false, 'single receiver unexpectedly distinguishes frozen measures');
  assert(inPage.joint_coupling.paired_receiver_joint_table_distinguishes_measures === true, 'paired receiver failed to distinguish joint tables');
  assert(inPage.joint_coupling.mu0_independent === true && inPage.joint_coupling.mu1_independent === false, 'browser report lost exact independence separation');
  assert(inPage.exact_separation.total_variation.numerator === 1 && inPage.exact_separation.total_variation.denominator === 42, 'browser report lost exact TV');
  assert(inPage.exact_separation.e_plus_attains_tv_bound === true && inPage.exact_separation.floating_point_authority === false, 'browser report lost exact E+/authority law');

  receipt.convergence = {
    canonical_projection_count:inPage.parent_structure.canonical_projection_count,
    inherited_B2:inPage.parent_structure.generated_sublattice_B2,
    policy_marginals_identical:inPage.receiver_marginals.policy_identical,
    boundary_marginals_identical:inPage.receiver_marginals.boundary_identical,
    single_receiver_marginal_distinguishes:false,
    paired_receiver_joint_distinguishes:inPage.joint_coupling.paired_receiver_joint_table_distinguishes_measures,
    changed_cell_count:inPage.joint_coupling.changed_cell_count,
    mu0_independent:inPage.joint_coupling.mu0_independent,
    mu1_independent:inPage.joint_coupling.mu1_independent,
    mu1_violation_count:inPage.joint_coupling.mu1_independence_violation_count,
    total_variation:'1/42',
    e_plus_attains_tv_bound:inPage.exact_separation.e_plus_attains_tv_bound,
    browser_persistence_accumulated:false
  };
  receipt.storage = { empty_through_all_21_semantic_cells:true };
  receipt.network.document_requests = requests.filter(requestUrl => requestUrl === url).length;
  receipt.network.unexpected_requests = requests.filter(requestUrl => requestUrl !== url);
  receipt.network.server_hits = serverHits;
  assert(receipt.network.document_requests === 1, `expected one document request, got ${receipt.network.document_requests}`);
  assert(receipt.network.unexpected_requests.length === 0, `unexpected browser requests: ${receipt.network.unexpected_requests.join(',')}`);
  assert(receipt.errors.console.length === 0 && receipt.errors.page.length === 0, 'coupling browser witness emitted page/runtime errors');
  if (browserName === 'firefox') assert(receipt.errors.browser_chrome.length <= 1, 'unexpected Firefox browser-chrome diagnostics');
  else assert(receipt.errors.browser_chrome.length === 0, 'unexpected browser-chrome diagnostics');
  receipt.status = 'PASS';
  await context.close();
} catch (error) {
  terminalError = error;
  receipt.status = 'FAIL';
  receipt.terminal_error = { name:error.name, message:error.message, stack:error.stack };
} finally {
  if (browser) await browser.close().catch(() => {});
  await new Promise(resolve => server.close(resolve));
  await fs.writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
}

if (terminalError) throw terminalError;
console.log(`Portable AIA receiver-marginal coupling separation browser witness (${browserName}): PASS`);
