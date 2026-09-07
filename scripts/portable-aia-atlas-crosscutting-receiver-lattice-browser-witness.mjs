import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import { runPortableAiaAtlasCrosscuttingReceiverLatticeAssay } from './portable-aia-atlas-crosscutting-receiver-lattice-assay.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/portable-aia-atlas-crosscutting-receiver-lattice');
const artifactName = 'portable-aia-atlas-crosscutting-receiver-lattice-v0.1.html';
const receiptPath = path.join(artifactDir, `portable-aia-atlas-crosscutting-receiver-lattice-v0.1-${browserName}-receipt.json`);
const report = runPortableAiaAtlasCrosscuttingReceiverLatticeAssay();

function assert(value, message) {
  if (!value) throw new Error(message);
}

function esc(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

const cells = report.meet.intersection_table.flat().map((cell, index) => Object.freeze({
  index,
  policy_key: cell.policy_key,
  boundary_key: cell.boundary_key,
  size: cell.size,
  member: cell.members[0] || null
}));

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><title>TD613 Portable AIA × Atlas Receiver Lattice</title><style>:root{font-family:system-ui,sans-serif;color-scheme:light dark}body{padding:24px;max-width:1100px}main{display:grid;gap:16px}.summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.summary div,.cell,.detail{border:1px solid currentColor;border-radius:12px;padding:12px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.cell{min-height:64px;text-align:left}.cell[aria-pressed="true"]{outline:3px solid currentColor}.detail{white-space:pre-wrap;overflow-wrap:anywhere}@media(max-width:720px){.summary,.grid{grid-template-columns:1fr}}</style></head><body><main data-receiver-lattice><header><h1>Two receivers, one 21-point grid.</h1><p>Policy and boundary partitions cross-cut. The browser witnesses the already-derived finite relation; it does not create it.</p></header><section class="summary"><div id="policy">POLICY 7×3</div><div id="boundary">BOUNDARY 3×7</div><div id="meet">MEET 21</div><div id="join">JOIN 1</div></section><section class="grid">${cells.map(cell => `<button type="button" class="cell" data-cell="${cell.index}" aria-pressed="false">${cell.member}</button>`).join('')}</section><section class="detail" id="detail"></section></main><script>(()=>{'use strict';const report=${esc(report)};const cells=${esc(cells)};let selected=-1;const buttons=[...document.querySelectorAll('[data-cell]')];const render=index=>{const cell=cells[index];if(!cell)throw new Error('unknown lattice cell');selected=index;buttons.forEach(button=>button.setAttribute('aria-pressed',Number(button.dataset.cell)===index?'true':'false'));document.getElementById('detail').textContent=JSON.stringify(cell,null,2)};buttons.forEach(button=>button.addEventListener('click',()=>render(Number(button.dataset.cell))));render(0);window.__TD613_RECEIVER_LATTICE__=Object.freeze({report,cells,select:render,getState:()=>({selected,detail:document.getElementById('detail').textContent,pressed:buttons.filter(button=>button.getAttribute('aria-pressed')==='true').map(button=>Number(button.dataset.cell)),localStorageLength:localStorage.length,sessionStorageLength:sessionStorage.length,cookie:document.cookie})})})();</script></body></html>`;

const artifactSha256 = crypto.createHash('sha256').update(html, 'utf8').digest('hex');
const artifactBytes = Buffer.byteLength(html, 'utf8');

for (const forbidden of ['localStorage.setItem', 'sessionStorage.setItem', 'indexedDB', 'BroadcastChannel', 'serviceWorker', 'fetch(', 'XMLHttpRequest', 'WebSocket']) {
  assert(!html.includes(forbidden), `forbidden browser primitive: ${forbidden}`);
}
assert(report.status === 'PASS', 'static receiver-lattice assay failed');
assert(report.policy_partition.class_count === 7, 'policy partition class count drifted');
assert(report.boundary_partition.class_count === 3, 'boundary partition class count drifted');
assert(report.meet.class_count === 21 && report.meet.singleton_class_count === 21, 'discrete meet failed before browser observation');
assert(report.join.class_count === 1, 'universal join failed before browser observation');
assert(report.generated_sublattice.element_count === 4 && report.generated_sublattice.order_isomorphic_to_B2 === true, 'generated B2 failed before browser observation');
assert(report.hostile_same_marginal_countercontrol.discrete_meet === false, 'hostile same-marginal control lost nondiscrete meet');

await fs.mkdir(artifactDir, { recursive:true });
await fs.writeFile(path.join(artifactDir, artifactName), html, 'utf8');

const serverHits = [];
const server = http.createServer((req, res) => {
  serverHits.push({ method:req.method, url:req.url });
  if (req.method === 'GET' && req.url === `/${artifactName}`) {
    res.writeHead(200, { 'content-type':'text/html; charset=utf-8', 'cache-control':'no-store' });
    res.end(html);
  } else {
    res.writeHead(404, { 'content-type':'text/plain' });
    res.end('not found');
  }
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const address = server.address();
if (!address || typeof address === 'string') throw new Error('receiver-lattice witness server failed to bind');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const receipt = {
  schema:'td613.portable-aia.atlas-crosscutting-receiver-lattice-browser-witness/v0.1-local-only',
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
  claim_ceiling:'exact-current-7x3-portable-aia-two-receiver-generated-partition-browser-witness-only',
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
  const context = await browser.newContext({ viewport:{ width:1280, height:800 }, reducedMotion:'no-preference' });
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
  await page.waitForSelector('[data-receiver-lattice]');
  const boot = await page.evaluate(() => ({
    count:window.__TD613_RECEIVER_LATTICE__.cells.length,
    state:window.__TD613_RECEIVER_LATTICE__.getState(),
    csp:document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null,
    freeText:document.querySelectorAll('input,textarea,[contenteditable="true"]').length,
    report:{
      policy:window.__TD613_RECEIVER_LATTICE__.report.policy_partition.class_count,
      boundary:window.__TD613_RECEIVER_LATTICE__.report.boundary_partition.class_count,
      meet:window.__TD613_RECEIVER_LATTICE__.report.meet.class_count,
      join:window.__TD613_RECEIVER_LATTICE__.report.join.class_count,
      lattice:window.__TD613_RECEIVER_LATTICE__.report.generated_sublattice.element_count
    }
  }));
  assert(boot.count === 21, `expected 21 rendered intersections, got ${boot.count}`);
  assert(boot.state.localStorageLength === 0 && boot.state.sessionStorageLength === 0 && boot.state.cookie === '', 'browser persistence inherited before lattice traversal');
  assert(/connect-src 'none'/.test(boot.csp || ''), 'receiver-lattice CSP drifted');
  assert(boot.freeText === 0, 'receiver-lattice browser witness exposed free-text input');
  assert(JSON.stringify(boot.report) === JSON.stringify({ policy:7, boundary:3, meet:21, join:1, lattice:4 }), 'browser report summary drifted');

  for (let index = 0; index < 21; index += 1) {
    await page.evaluate(i => window.__TD613_RECEIVER_LATTICE__.select(i), index);
    const state = await page.evaluate(() => window.__TD613_RECEIVER_LATTICE__.getState());
    assert(state.selected === index, `browser lattice selection drifted at ${index}`);
    assert(state.pressed.length === 1 && state.pressed[0] === index, `browser lattice pressed state drifted at ${index}`);
    assert(state.localStorageLength === 0 && state.sessionStorageLength === 0 && state.cookie === '', `browser persistence appeared at lattice cell ${index}`);
    const cell = JSON.parse(state.detail);
    assert(cell.index === index && cell.size === 1 && typeof cell.member === 'string', `browser lattice cell ${index} is not singleton`);
    receipt.observations.push({ index, member:cell.member, size:cell.size });
  }

  const inPage = await page.evaluate(() => window.__TD613_RECEIVER_LATTICE__.report);
  assert(inPage.incomparability.policy_refines_boundary === false && inPage.incomparability.boundary_refines_policy === false, 'browser report lost receiver incomparability');
  assert(inPage.meet.singleton_class_count === 21 && inPage.meet.paired_existing_receiver_keys_injective === true, 'browser report lost discrete meet');
  assert(inPage.join.class_count === 1, 'browser report lost universal join');
  assert(inPage.generated_sublattice.order_isomorphic_to_B2 === true, 'browser report lost generated B2');
  assert(inPage.hostile_same_marginal_countercontrol.nonempty_intersections === 9 && inPage.hostile_same_marginal_countercontrol.discrete_meet === false, 'browser report lost same-marginal hostile control');

  receipt.convergence = {
    canonical_projection_count:inPage.domain.canonical_projection_count,
    policy_class_count:inPage.policy_partition.class_count,
    boundary_class_count:inPage.boundary_partition.class_count,
    policy_refines_boundary:inPage.incomparability.policy_refines_boundary,
    boundary_refines_policy:inPage.incomparability.boundary_refines_policy,
    meet_class_count:inPage.meet.class_count,
    meet_singleton_class_count:inPage.meet.singleton_class_count,
    paired_existing_receiver_keys_injective:inPage.meet.paired_existing_receiver_keys_injective,
    join_class_count:inPage.join.class_count,
    generated_sublattice_element_count:inPage.generated_sublattice.element_count,
    generated_sublattice_B2:inPage.generated_sublattice.order_isomorphic_to_B2,
    hostile_same_marginal_nonempty_intersections:inPage.hostile_same_marginal_countercontrol.nonempty_intersections,
    browser_persistence_accumulated:false
  };
  receipt.storage = { empty_through_all_21_cells:true };
  receipt.network.document_requests = requests.filter(requestUrl => requestUrl === url).length;
  receipt.network.unexpected_requests = requests.filter(requestUrl => requestUrl !== url);
  receipt.network.server_hits = serverHits;
  assert(receipt.network.document_requests === 1, `expected one document request, got ${receipt.network.document_requests}`);
  assert(receipt.network.unexpected_requests.length === 0, `unexpected browser requests: ${receipt.network.unexpected_requests.join(',')}`);
  assert(receipt.errors.console.length === 0 && receipt.errors.page.length === 0, 'receiver-lattice browser witness emitted page/runtime errors');
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
console.log(`Portable AIA × Atlas cross-cutting receiver lattice browser witness (${browserName}): PASS`);
