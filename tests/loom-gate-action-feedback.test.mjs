/** Real local controller/Gate behavior with finite synthetic receipts; no live signer or browser-save claim. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { createLoomAiGovernance } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import { loomDemoDigest, loomDemoReceiptDigest, loomDemoResult, LOOM_DEMO_STAGE_RECEIPT_SCHEMA } from '../app/dome-world/holonomy-loom/demo-contract.js';
import { installMarrowlineLoomDemo } from '../app/dome-world/marrowline-loom-demo.js';
import { clearMarrowlineAttachments } from '../app/dome-world/marrowline-attachments.js';
import { INVOCATION_MODES } from '../app/dome-world/khonapolit-covenant.js';

const html=readFileSync(new URL('../app/dome-world/marrowline.html',import.meta.url),'utf8');
const flush=()=>new Promise(resolve=>setTimeout(resolve,0));
async function until(predicate){const deadline=Date.now()+2000;while(!predicate()){if(Date.now()>deadline)throw new Error('Gate feedback fixture did not settle');await flush();}}
async function harness(t){
  const dom=new JSDOM(html,{url:'https://td613.com/dome-world/marrowline.html'}),root=dom.window,doc=root.document;
  Object.defineProperty(root,'crypto',{configurable:true,value:webcrypto});root.File=File;root.Blob=Blob;
  let expiry;const originalTimeout=root.setTimeout.bind(root);
  root.setTimeout=(callback,delay,...args)=>{if(delay>500000)expiry=callback;return originalTimeout(callback,delay,...args);};
  let providerCalls=0;root.fetch=async()=>{providerCalls++;throw new Error('Local actions must not call a provider.');};
  const blobs=[],downloads=[];
  root.URL.createObjectURL=blob=>{blobs.push(blob);return 'blob:https://td613.com/finite-download';};root.URL.revokeObjectURL=()=>{};
  root.HTMLAnchorElement.prototype.click=function(){downloads.push({href:this.href,name:this.download});};
  clearMarrowlineAttachments(root);
  const packet={task:'FICTIONAL: Compare workstreams.',documents:[{id:'selected',name:'selected.md',text:'FICTIONAL SELECTED BODY'}],rules:['Preserve missing evidence.']};
  packet.governance=await createLoomAiGovernance(packet,{withheldDocumentCount:1},root);
  const controller=await installMarrowlineLoomDemo(packet,doc,root);
  t.after(()=>{controller.destroy();clearMarrowlineAttachments(root);dom.window.close();});
  const admit=async()=>{
    const prepared=await controller.prepareRequest('FICTIONAL explicit request.',{mode:INVOCATION_MODES.ISSUED_CONJUNCTION,shi:'',waiveIssuance:true},new AbortController().signal);
    const {request,binding}=prepared;
    const result={schema:'td613.loom.ai-task-result/v0.1',request_id:request.request_id,status:'completed',answer:request.phase==='ACTIVATE'?'Rules received; files pending.':'Selected workstream reviewed.',missing_information:[],used_document_ids:request.phase==='ACTIVATE'?[]:['selected'],suggested_next_step:'Inspect if desired.'};
    const normalized=loomDemoResult(result,binding.selected.documents);
    const receipt={schema:LOOM_DEMO_STAGE_RECEIPT_SCHEMA,activation_digest:request.activation.activation_digest,phase:request.phase,request_id:request.request_id,request_digest:await loomDemoDigest(request,root),current_input_digest:binding.governance.input_digest,prior_result_digest:binding.receipt.prior_result_digest,result_digest:await loomDemoDigest(normalized,root),predecessor_receipt_digest:request.phase==='CONTINUE'?await loomDemoReceiptDigest(request.predecessor,root):null,expires_at:request.activation.expires_at,admission_state:'ADMITTED',stage_policy:request.phase==='ACTIVATE'?'AIA_ONLY':'SELECTED_FILES_BOUND',authority_transferred:false,auth:{scheme:'hmac-sha256',key_id:'td613-loom-demo-stage-v1',tag:'A'.repeat(43)}};
    await controller.admitResponse({...result,native_reply:{ok:true,text:result.answer,relay:{transcript:result.answer},receipt:{provider:{completion:{complete:true}}}},loom_demo_binding:binding.receipt,loom_demo_stage_receipt:receipt},prepared);
    controller.finishAttempt(prepared);clearMarrowlineAttachments(root);
  };
  return {root,doc,controller,admit,blobs,downloads,expiry:()=>expiry(),calls:()=>providerCalls,
    status:()=>doc.getElementById('loomGateActionStatus'),check:()=>doc.getElementById('loomGateLocalCheck'),export:()=>doc.getElementById('loomGateExportCurrent')};
}

test('Gate local-check and export feedback remains visible in Gate with no composer apparatus or save-completion claim',async t=>{
  const h=await harness(t);await h.controller.stageAia();await h.admit();
  h.doc.getElementById('speakingPanel').hidden=true;
  assert.equal(h.status().hidden,true);
  h.check().click();assert.equal(h.status().dataset.outcome,'PENDING');
  await until(()=>h.status().dataset.outcome!=='PENDING');
  assert.equal(h.status().hidden,false);assert.equal(h.status().dataset.outcome,'PASSED');
  assert.match(h.status().textContent,/selected bytes and portable rules match/);assert.match(h.status().textContent,/no provider call/);
  assert.equal(h.status().closest('#gatePanel')?.id,'gatePanel');assert.equal(h.status().getAttribute('aria-live'),'polite');
  await h.controller.stageFiles();assert.equal(h.status().hidden,true,'old local check is cleared when stage changes');await h.admit();
  h.export().click();assert.equal(h.status().dataset.outcome,'DOWNLOAD_REQUESTED');assert.equal(h.status().hidden,false);
  assert.match(h.status().textContent,/Your browser handles saving/);assert.doesNotMatch(h.status().textContent,/successfully saved|exported/i);
  // OLD ASSERTION: legacy product filename. REAL CONTRACT: exact current admitted review packet downloads after an explicit gesture.
  // NEW WITNESS: Loom session filename plus payload/gesture/zero-provider checks.
  assert.equal(h.downloads.length,1);assert.equal(h.downloads[0].name,'loom-current-session.json');
  const payload=JSON.parse(await h.blobs[0].text());assert.equal(payload.continuation.prior_result.answer,'Selected workstream reviewed.');
  assert.equal(h.calls(),0);assert.equal(h.doc.querySelector('.loom-demo-composer-note'),null);
  h.expiry();assert.equal(h.status().hidden,true,'expiry clears stale successful action feedback');
  // Dispatch bypasses disabled-button UI only to exercise the existing guard.
  h.export().dispatchEvent(new h.root.Event('click'));
  assert.equal(h.status().dataset.outcome,'HELD');assert.match(h.status().textContent,/no current export/);assert.equal(h.downloads.length,1);
});

test('ending continuation during asynchronous local check cannot publish a stale pass',async t=>{
  const h=await harness(t);await h.controller.stageAia();await h.admit();
  h.check().click();assert.equal(h.status().dataset.outcome,'PENDING');h.controller.leaveDemo();
  await until(()=>h.status().dataset.outcome==='HELD');
  assert.equal(h.controller.snapshot().phase,'LEFT');assert.match(h.status().textContent,/state changed during the local check/);assert.equal(h.calls(),0);
});

test('browser download preparation failure is held visibly without changing the admitted export',async t=>{
  const h=await harness(t);await h.controller.stageAia();await h.admit();await h.controller.stageFiles();await h.admit();
  const prior=h.controller.exportPacket();h.root.URL.createObjectURL=()=>{throw new Error('SYNTHETIC URL unavailable');};
  h.export().click();assert.equal(h.status().dataset.outcome,'HELD');assert.match(h.status().textContent,/SYNTHETIC URL unavailable/);
  assert.deepEqual(h.controller.exportPacket(),prior);assert.equal(h.downloads.length,0);assert.equal(h.calls(),0);
});

test('same-phase admitted follow-up invalidates an earlier local-check result',async t=>{
  const h=await harness(t);await h.controller.stageAia();await h.admit();await h.controller.stageFiles();await h.admit();
  const previous=h.controller.snapshot().predecessor_request_id;
  let blockNext=true,blocked=false,release;const barrier=new Promise(resolve=>{release=resolve;});
  Object.defineProperty(h.root,'crypto',{configurable:true,value:{
    randomUUID:()=>webcrypto.randomUUID(),getRandomValues:value=>webcrypto.getRandomValues(value),
    subtle:{digest:async(...args)=>{if(blockNext){blockNext=false;blocked=true;await barrier;}return webcrypto.subtle.digest(...args);}}
  }});
  h.check().click();await until(()=>blocked);
  await h.admit();
  assert.equal(h.controller.snapshot().phase,'DONE');assert.notEqual(h.controller.snapshot().predecessor_request_id,previous);
  release();await until(()=>h.status().dataset.outcome==='HELD');
  assert.match(h.status().textContent,/state changed during the local check/);assert.equal(h.controller.snapshot().phase,'DONE');
  assert.equal(h.controller.exportPacket().continuation.prior_result.answer,'Selected workstream reviewed.');assert.equal(h.calls(),0);
});
