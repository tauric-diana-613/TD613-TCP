import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import {
  MARROWLINE_DUPLICATE_POSITION_PERMUTATIONS,
  runMarrowlineDuplicatePositionPermutationClosureAssay
} from './marrowline-duplicate-position-permutation-closure-assay.mjs';

const browserName=String(process.env.TD613_BROWSER||'chromium').trim().toLowerCase();
const engine={chromium,firefox,webkit}[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir=path.resolve(process.env.TD613_ARTIFACT_DIR||'artifacts/marrowline-duplicate-position-permutation-closure');
const artifactName='marrowline-duplicate-position-permutation-closure-v0.1.html';
const receiptPath=path.join(artifactDir,`marrowline-duplicate-position-permutation-closure-v0.1-${browserName}-receipt.json`);
const report=runMarrowlineDuplicatePositionPermutationClosureAssay();

function assert(value,message){if(!value)throw new Error(message)}
function esc(value){return JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026')}

const orderedIds=MARROWLINE_DUPLICATE_POSITION_PERMUTATIONS.map(item=>item.id);
const steps=[];
for (const phase of ['forward','reverse']) {
  for (const id of report[phase].order) {
    const collision=report[phase].collisions[id];
    const recovery=report[phase].recoveries[id];
    steps.push(Object.freeze({
      step_id:`${phase.toUpperCase()}_${id}`,
      phase:phase.toUpperCase(),
      collision_id:id,
      labels:collision.labels.join(' → '),
      duplicate_index:collision.duplicate_index,
      repeated_rule_id:collision.repeated_rule_id,
      error:collision.error,
      rejected:collision.rejected,
      carry_case_returned:collision.carry_case_returned,
      transport_receipt_returned:collision.transport_receipt_returned,
      hosted_findings_returned:collision.hosted_findings_returned,
      source_packet:collision.source_packet,
      recovery_source_packet:recovery.source_packet,
      recovery_carry_case:recovery.carry_case,
      matching_statuses:recovery.matching_statuses,
      mismatch_statuses:recovery.mismatch_statuses,
      release_authority:recovery.release_authority,
      human_closure_required:recovery.human_closure_required,
      local_binding_carried:recovery.local_binding_carried
    }));
  }
}

const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><title>TD613 Duplicate-Position Permutation Closure</title><style>:root{font-family:system-ui,sans-serif;color-scheme:light dark}body{padding:24px;max-width:960px}main{display:grid;gap:14px}.case{border:1px solid currentColor;border-radius:14px;padding:14px}.buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}button{min-height:44px}@media(max-width:700px){.buttons{grid-template-columns:1fr}}</style></head><body><main data-duplicate-position-assay><header><h1>Duplicate position ≠ transport permission.</h1><p>All six hostile permutations must reject without partial Carry Case and without poisoning the next lawful pair.</p></header><nav class="buttons">${steps.map(step=>`<button type="button" data-step="${step.step_id}">${step.step_id}</button>`).join('')}</nav><section class="case"><div id="step"></div><div id="phase"></div><div id="collision"></div><div id="labels"></div><div id="duplicate"></div><div id="error"></div><div id="carry"></div><div id="am"></div><div id="ax"></div><div id="bm"></div><div id="bx"></div></section></main><script>(()=>{'use strict';const report=${esc(report)};const steps=${esc(steps)};let selected=null;const byId=Object.fromEntries(steps.map(step=>[step.step_id,step]));const render=id=>{const s=byId[id];if(!s)throw new Error('unknown step');selected=id;document.getElementById('step').textContent=id;document.getElementById('phase').textContent=s.phase;document.getElementById('collision').textContent=s.collision_id;document.getElementById('labels').textContent=s.labels;document.getElementById('duplicate').textContent=String(s.duplicate_index);document.getElementById('error').textContent=s.error;document.getElementById('carry').textContent=s.carry_case_returned?'CARRY_CASE_RETURNED':'NO_CARRY_CASE';document.getElementById('am').textContent=s.matching_statuses.A;document.getElementById('ax').textContent=s.mismatch_statuses.A;document.getElementById('bm').textContent=s.matching_statuses.B;document.getElementById('bx').textContent=s.mismatch_statuses.B};document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>render(button.dataset.step)));render(steps[0].step_id);window.__TD613_DUPLICATE_POSITION__=Object.freeze({report,steps,select:render,getState:()=>({selected,phase:document.getElementById('phase').textContent,collision:document.getElementById('collision').textContent,labels:document.getElementById('labels').textContent,duplicate_index:Number(document.getElementById('duplicate').textContent),error:document.getElementById('error').textContent,carry:document.getElementById('carry').textContent,am:document.getElementById('am').textContent,ax:document.getElementById('ax').textContent,bm:document.getElementById('bm').textContent,bx:document.getElementById('bx').textContent})})})();</script></body></html>`;

const artifactSha256=crypto.createHash('sha256').update(html,'utf8').digest('hex');
const artifactBytes=Buffer.byteLength(html,'utf8');
for (const forbidden of ['localStorage.setItem','sessionStorage.setItem','indexedDB','BroadcastChannel','serviceWorker','fetch(','XMLHttpRequest','WebSocket']) {
  assert(!html.includes(forbidden),`forbidden primitive: ${forbidden}`);
}
assert(report.all_six_position_permutations_rejected===true,'static duplicate-position closure lost rejection');
assert(report.no_partial_transport_from_any_position===true,'static duplicate-position closure leaked partial transport');
assert(report.lawful_pair_matches_parent===true,'static duplicate-position lawful recovery drifted');
assert(report.forward_reverse_replay_invariant===true,'static duplicate-position replay drifted');

await fs.mkdir(artifactDir,{recursive:true});
await fs.writeFile(path.join(artifactDir,artifactName),html,'utf8');

const serverHits=[];
const server=http.createServer((req,res)=>{
  serverHits.push({method:req.method,url:req.url});
  if(req.method==='GET'&&req.url===`/${artifactName}`){
    res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
    res.end(html);
  } else {
    res.writeHead(404,{'content-type':'text/plain'});
    res.end('not found');
  }
});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
const address=server.address();
if(!address||typeof address==='string')throw new Error('server did not bind');
const url=`http://127.0.0.1:${address.port}/${artifactName}`;

const receipt={
  schema:'td613.marrowline.duplicate-position-permutation-closure-browser-witness/v0.1-local-only',
  browser:browserName,
  status:'RUNNING',
  assay_local_only:true,
  artifact:{name:artifactName,sha256:artifactSha256,bytes:artifactBytes,generated_from_canonical_assay:true,product_source_bytes_mutated:false},
  permutation_ids:orderedIds,
  observations:[],
  convergence:{},
  network:{document_requests:0,unexpected_requests:[],server_hits:[]},
  storage:{},
  errors:{console:[],page:[],browser_chrome:[]},
  authority:{release_authority:false,human_closure_required:true,provider_call_performed:false,production_mutation:false},
  claim_ceiling:'bounded-two-rule-three-finding-all-six-duplicate-position-permutation-browser-closure-only',
  seal:'⟐'
};

function firefoxFavicon(message){
  if(browserName!=='firefox'||message.type()!=='error')return false;
  const text=String(message.text()||'');
  const location=String(message.location()?.url||'');
  return text.includes('Content-Security-Policy')&&text.includes('/favicon.ico')&&(location.includes('FaviconLoader.sys.mjs')||text.includes('FaviconLoader.sys.mjs'));
}

let browser;
let terminalError=null;
try {
  browser=await engine.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'no-preference'});
  const requests=[];
  context.on('request',request=>requests.push(request.url()));
  const page=await context.newPage();
  page.setDefaultTimeout(30000);
  page.on('console',message=>{
    if(message.type()!=='error')return;
    if(firefoxFavicon(message))receipt.errors.browser_chrome.push({text:message.text(),location:message.location()?.url||null});
    else receipt.errors.console.push({text:message.text(),location:message.location()?.url||null});
  });
  page.on('pageerror',error=>receipt.errors.page.push({text:error.message}));

  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('[data-duplicate-position-assay]');
  const boot=await page.evaluate(()=>({
    state:window.__TD613_DUPLICATE_POSITION__.getState(),
    count:window.__TD613_DUPLICATE_POSITION__.steps.length,
    storage:{local:localStorage.length,session:sessionStorage.length,cookie:document.cookie},
    csp:document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content||null,
    free:document.querySelectorAll('input,textarea,[contenteditable="true"]').length
  }));
  assert(boot.count===12,`expected 12 forward/reverse observations, got ${boot.count}`);
  assert(boot.storage.local===0&&boot.storage.session===0&&boot.storage.cookie==='','inherited persistence');
  assert(/connect-src 'none'/.test(boot.csp||''),'CSP drifted');
  assert(boot.free===0,'free text exposed');

  for (const step of steps) {
    await page.evaluate(id=>window.__TD613_DUPLICATE_POSITION__.select(id),step.step_id);
    const observed=await page.evaluate(()=>({
      state:window.__TD613_DUPLICATE_POSITION__.getState(),
      storage:{local:localStorage.length,session:sessionStorage.length,cookie:document.cookie}
    }));
    assert(observed.state.selected===step.step_id,`selection drift ${step.step_id}`);
    assert(observed.state.collision===step.collision_id,`collision drift ${step.step_id}`);
    assert(observed.state.duplicate_index===step.duplicate_index,`duplicate index drift ${step.step_id}`);
    assert(observed.state.carry==='NO_CARRY_CASE',`partial Carry Case surfaced at ${step.step_id}`);
    assert(observed.state.am==='PRESENT_TO_HUMAN'&&observed.state.bm==='PRESENT_TO_HUMAN',`matching recovery drift ${step.step_id}`);
    assert(observed.state.ax==='HOLD'&&observed.state.bx==='HOLD',`mismatch recovery drift ${step.step_id}`);
    assert(observed.storage.local===0&&observed.storage.session===0&&observed.storage.cookie==='',`persistence at ${step.step_id}`);
    receipt.observations.push(observed.state);
  }

  for (const id of orderedIds) {
    const forward=steps.find(step=>step.phase==='FORWARD'&&step.collision_id===id);
    const reverse=steps.find(step=>step.phase==='REVERSE'&&step.collision_id===id);
    assert(forward&&reverse,`missing forward/reverse pair ${id}`);
    assert(forward.error===reverse.error,`${id} rejection error drifted`);
    assert(JSON.stringify(forward.source_packet)===JSON.stringify(reverse.source_packet),`${id} hostile packet drifted`);
    assert(JSON.stringify(forward.recovery_source_packet)===JSON.stringify(reverse.recovery_source_packet),`${id} lawful source recovery drifted`);
    assert(JSON.stringify(forward.recovery_carry_case)===JSON.stringify(reverse.recovery_carry_case),`${id} lawful Carry Case recovery drifted`);
  }

  receipt.convergence={
    all_six_position_permutations_rejected:report.all_six_position_permutations_rejected,
    duplicate_position_does_not_change_rejection_class:report.duplicate_position_does_not_change_rejection_class,
    no_partial_transport_from_any_position:report.no_partial_transport_from_any_position,
    lawful_pair_matches_parent:report.lawful_pair_matches_parent,
    forward_reverse_replay_invariant:report.forward_reverse_replay_invariant,
    repeated_position_collision_nonpoisoning:report.repeated_position_collision_nonpoisoning,
    hostile_source_packets_distinguishable:report.hostile_source_packets_distinguishable,
    hidden_duplicate_position_state_carried:report.hidden_duplicate_position_state_carried,
    browser_replay_invariant:true,
    browser_persistence_accumulated:false
  };
  receipt.storage={empty_through_forward_reverse_schedule:true};
  receipt.network.document_requests=requests.filter(requestUrl=>requestUrl===url).length;
  receipt.network.unexpected_requests=requests.filter(requestUrl=>requestUrl!==url);
  receipt.network.server_hits=serverHits;
  assert(receipt.network.document_requests===1,`expected one document, got ${receipt.network.document_requests}`);
  assert(receipt.network.unexpected_requests.length===0,`unexpected requests: ${receipt.network.unexpected_requests.join(',')}`);
  assert(receipt.errors.console.length===0&&receipt.errors.page.length===0,'runtime/page errors');
  if(browserName==='firefox')assert(receipt.errors.browser_chrome.length<=1,'unexpected Firefox diagnostics');
  else assert(receipt.errors.browser_chrome.length===0,'unexpected browser-chrome diagnostics');
  receipt.status='PASS';
  await context.close();
} catch (error) {
  terminalError=error;
  receipt.status='FAIL';
  receipt.terminal_error={name:error.name,message:error.message,stack:error.stack};
} finally {
  if(browser)await browser.close().catch(()=>{});
  await new Promise(resolve=>server.close(resolve));
  await fs.writeFile(receiptPath,`${JSON.stringify(receipt,null,2)}\n`,'utf8');
}

if(terminalError)throw terminalError;
console.log(`Marrowline duplicate-position permutation closure browser witness (${browserName}): PASS`);
