import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import { runPortableAiaCrossModeGuaranteeValidityAssay } from './portable-aia-cross-mode-guarantee-validity-assay.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/portable-aia-cross-mode-guarantee-validity');
const artifactName = 'portable-aia-cross-mode-guarantee-validity-v0.1.html';
const receiptPath = path.join(artifactDir, `portable-aia-cross-mode-guarantee-validity-v0.1-${browserName}-receipt.json`);
const report = runPortableAiaCrossModeGuaranteeValidityAssay();

function assert(value, message) { if (!value) throw new Error(message); }
function esc(value) { return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026'); }

const rows = report.rows.map(row => Object.freeze({
  point_id:row.point_id,
  rule_id:row.rule_id,
  route_mode:row.route_mode,
  source_ingress_position:row.source_ingress_position,
  claims:row.claims
}));

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><title>TD613 Cross-Mode Guarantee Validity</title><style>:root{font-family:system-ui,sans-serif;color-scheme:light dark}body{padding:24px;max-width:1180px}main{display:grid;gap:16px}.summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.summary div,.row,.detail{border:1px solid currentColor;border-radius:12px;padding:12px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.row{text-align:left;min-height:110px}.row[aria-pressed="true"]{outline:3px solid currentColor}.route{font-weight:700}.claims{font-size:.82rem;line-height:1.4}.detail{white-space:pre-wrap;overflow-wrap:anywhere}@media(max-width:760px){.summary,.grid{grid-template-columns:1fr}}</style></head><body><main data-cross-mode-guarantee-validity><header><h1>Same governance core. Different doors.</h1><p>Portable policy does not erase the host boundary.</p></header><section class="summary"><div>21 PROJECTIONS</div><div>4 CORE · 21/21</div><div>3 BOUNDARY · 7/21</div><div>14 WRONG-ROOM REJECTIONS</div></section><section class="grid">${rows.map((row,index) => `<button type="button" class="row" data-row="${index}" aria-pressed="false"><span class="route">${row.route_mode}</span><br>${row.rule_id}<br><span class="claims">${Object.entries(row.claims).map(([key,value]) => `${key}:${value?'1':'0'}`).join(' · ')}</span></button>`).join('')}</section><section class="detail" id="detail"></section></main><script>(()=>{'use strict';const report=${esc(report)};const rows=${esc(rows)};let selected=-1;const buttons=[...document.querySelectorAll('[data-row]')];const render=index=>{const row=rows[index];if(!row)throw new Error('unknown guarantee row');selected=index;buttons.forEach(button=>button.setAttribute('aria-pressed',Number(button.dataset.row)===index?'true':'false'));document.getElementById('detail').textContent=JSON.stringify(row,null,2)};buttons.forEach(button=>button.addEventListener('click',()=>render(Number(button.dataset.row))));render(0);window.__TD613_CROSS_MODE_GUARANTEE__=Object.freeze({report,rows,select:render,getState:()=>({selected,detail:document.getElementById('detail').textContent,pressed:buttons.filter(button=>button.getAttribute('aria-pressed')==='true').map(button=>Number(button.dataset.row)),localStorageLength:localStorage.length,sessionStorageLength:sessionStorage.length,cookie:document.cookie})})})();</script></body></html>`;

const artifactSha256 = crypto.createHash('sha256').update(html, 'utf8').digest('hex');
const artifactBytes = Buffer.byteLength(html, 'utf8');
for (const forbidden of ['localStorage.setItem','sessionStorage.setItem','indexedDB','BroadcastChannel','serviceWorker','fetch(','XMLHttpRequest','WebSocket']) {
  assert(!html.includes(forbidden), `forbidden browser primitive: ${forbidden}`);
}
assert(report.status === 'PASS', 'static cross-mode guarantee assay failed');
assert(report.domain.canonical_projection_count === 21, 'projection count drifted');
assert(report.classification.invariant_core_supports_all_21 === true, 'invariant core support drifted');
assert(report.classification.boundary_claims_support_exactly_one_route_each === true, 'boundary support drifted');
for (const claimId of report.classification.invariant_claim_ids) assert(report.support[claimId].support_count === 21, `${claimId} support drifted`);
for (const claimId of report.classification.boundary_dependent_claim_ids) {
  assert(report.support[claimId].support_count === 7, `${claimId} support drifted`);
  assert(report.hostile_universalization[claimId].false_claim_count === 14, `${claimId} hostile false-claim count drifted`);
  assert(report.hostile_universalization[claimId].unexpectedly_accepted_false_claim_count === 0, `${claimId} hostile false claim accepted`);
}

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
if (!address || typeof address === 'string') throw new Error('cross-mode guarantee witness server failed to bind');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const receipt = {
  schema:'td613.portable-aia.cross-mode-guarantee-validity-browser-witness/v0.1-local-only',
  browser:browserName,
  status:'RUNNING',
  assay_local_only:true,
  artifact:{ name:artifactName, sha256:artifactSha256, bytes:artifactBytes, generated_from_canonical_assay:true, product_source_bytes_mutated:false },
  observations:[],
  convergence:{},
  network:{ document_requests:0, unexpected_requests:[], server_hits:[] },
  storage:{},
  errors:{ console:[], page:[], browser_chrome:[] },
  authority:{ release_authority:false, human_closure_required:true, provider_call_performed:false, production_mutation:false, deployment_authority:false },
  counts_as_exogenous_witness:false,
  golden_egg_credit:0,
  claim_ceiling:'exact-current-seven-claim-by-21-projection-cross-mode-support-browser-witness-only',
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
  await page.waitForSelector('[data-cross-mode-guarantee-validity]');
  const boot = await page.evaluate(() => ({
    count:window.__TD613_CROSS_MODE_GUARANTEE__.rows.length,
    state:window.__TD613_CROSS_MODE_GUARANTEE__.getState(),
    csp:document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null,
    freeText:document.querySelectorAll('input,textarea,[contenteditable="true"]').length
  }));
  assert(boot.count === 21, `expected 21 guarantee rows, got ${boot.count}`);
  assert(boot.state.localStorageLength === 0 && boot.state.sessionStorageLength === 0 && boot.state.cookie === '', 'browser persistence inherited before guarantee traversal');
  assert(/connect-src 'none'/.test(boot.csp || ''), 'cross-mode guarantee witness CSP drifted');
  assert(boot.freeText === 0, 'cross-mode guarantee witness exposed free-text input');

  const observedSupport = Object.fromEntries(report.domain.claim_count ? Object.keys(rows[0].claims).map(key => [key,0]) : []);
  for (let index = 0; index < 21; index += 1) {
    await page.evaluate(i => window.__TD613_CROSS_MODE_GUARANTEE__.select(i), index);
    const state = await page.evaluate(() => window.__TD613_CROSS_MODE_GUARANTEE__.getState());
    assert(state.selected === index && state.pressed.length === 1 && state.pressed[0] === index, `selection drift at guarantee row ${index}`);
    assert(state.localStorageLength === 0 && state.sessionStorageLength === 0 && state.cookie === '', `persistence appeared at guarantee row ${index}`);
    const row = JSON.parse(state.detail);
    assert(typeof row.point_id === 'string' && typeof row.rule_id === 'string' && typeof row.route_mode === 'string', `guarantee row ${index} malformed`);
    for (const [claimId,value] of Object.entries(row.claims)) if (value === true) observedSupport[claimId] += 1;
    receipt.observations.push({ index, point_id:row.point_id, rule_id:row.rule_id, route_mode:row.route_mode, source_ingress_position:row.source_ingress_position, claims:row.claims });
  }

  const inPage = await page.evaluate(() => window.__TD613_CROSS_MODE_GUARANTEE__.report);
  for (const claimId of inPage.classification.invariant_claim_ids) {
    assert(observedSupport[claimId] === 21 && inPage.support[claimId].support_count === 21, `${claimId} browser support drifted`);
  }
  for (const claimId of inPage.classification.boundary_dependent_claim_ids) {
    assert(observedSupport[claimId] === 7 && inPage.support[claimId].support_count === 7, `${claimId} browser support drifted`);
    assert(inPage.hostile_universalization[claimId].false_claim_count === 14, `${claimId} browser hostile control drifted`);
    assert(inPage.hostile_universalization[claimId].unexpectedly_accepted_false_claim_count === 0, `${claimId} browser hostile acceptance drifted`);
  }
  assert(inPage.classification.common_policy_core_is_common_trust_boundary === false, 'browser report collapsed policy core into trust boundary');
  assert(inPage.classification.portable_governance_invariance_is_portable_guarantee_text === false, 'browser report promoted governance invariance into guarantee-text invariance');

  receipt.convergence = {
    canonical_projection_count:21,
    invariant_claim_supports:Object.fromEntries(inPage.classification.invariant_claim_ids.map(id => [id,inPage.support[id].support_count])),
    boundary_claim_supports:Object.fromEntries(inPage.classification.boundary_dependent_claim_ids.map(id => [id,inPage.support[id].support_count])),
    hostile_false_claim_counts:Object.fromEntries(inPage.classification.boundary_dependent_claim_ids.map(id => [id,inPage.hostile_universalization[id].false_claim_count])),
    hostile_unexpected_acceptances:Object.fromEntries(inPage.classification.boundary_dependent_claim_ids.map(id => [id,inPage.hostile_universalization[id].unexpectedly_accepted_false_claim_count])),
    invariant_core_route_independent:inPage.classification.invariant_core_route_independent,
    boundary_support_rule_independent:inPage.classification.boundary_support_rule_independent,
    browser_persistence_accumulated:false
  };
  receipt.storage = { empty_through_all_21_projection_rows:true };
  receipt.network.document_requests = requests.filter(requestUrl => requestUrl === url).length;
  receipt.network.unexpected_requests = requests.filter(requestUrl => requestUrl !== url);
  receipt.network.server_hits = serverHits;
  assert(receipt.network.document_requests === 1, `expected one document request, got ${receipt.network.document_requests}`);
  assert(receipt.network.unexpected_requests.length === 0, `unexpected browser requests: ${receipt.network.unexpected_requests.join(',')}`);
  assert(receipt.errors.console.length === 0 && receipt.errors.page.length === 0, 'cross-mode guarantee browser witness emitted page/runtime errors');
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
console.log(`Portable AIA cross-mode guarantee validity browser witness (${browserName}): PASS`);
