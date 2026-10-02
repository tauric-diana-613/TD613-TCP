import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {webcrypto} from 'node:crypto';
import {JSDOM} from 'jsdom';
import {createLoomAiGovernance} from '../app/dome-world/holonomy-loom/ai-handoff.js';
import {bindLoomDemoRequest,loomDemoDigest,loomDemoReceiptDigest,loomDemoResult,LOOM_DEMO_STAGE_RECEIPT_SCHEMA} from '../app/dome-world/holonomy-loom/demo-contract.js';
import {installKhonapolitTerminal} from '../app/dome-world/marrowline-terminal.js';
import {installMarrowlineLoomDemo} from '../app/dome-world/marrowline-loom-demo.js';
import {installMarrowlineDesktopRepair} from '../app/dome-world/marrowline-desktop-repair.js';
import {getMarrowlineAttachments,clearMarrowlineAttachments,removeMarrowlineAttachment,stageMarrowlineAttachments} from '../app/dome-world/marrowline-attachments.js';
const html=fs.readFileSync('app/dome-world/marrowline.html','utf8');
async function harness({held=false,tamperStageReceipt=false}={}){
 const dom=new JSDOM(html,{url:'https://td613.com/dome-world/marrowline.html'}), root=dom.window, doc=root.document;
 root.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});root.requestAnimationFrame=callback=>root.setTimeout(callback,0);
 Object.defineProperty(root,'crypto',{value:webcrypto});root.File=File;root.Blob=Blob;
 const packet={task:'Compare fictional workstreams.',documents:[{id:'a',name:'a.md',text:'State A has three workstreams.'}],rules:['Use only selected sources.']};
 packet.governance=await createLoomAiGovernance(packet,{withheldDocumentCount:1},root);
 clearMarrowlineAttachments(root);
 installMarrowlineDesktopRepair(doc,root);
 const requests=[];let deny=held;
 root.fetch=async(url,options)=>{
  assert.match(url,/operation=loom-demo-task$/);const request=JSON.parse(options.body);requests.push(request);
  const bound=await bindLoomDemoRequest(request,root);
  if(deny){bound.governor.close();return {ok:false,status:422,json:async()=>({schema:'td613.loom.ai-task-result/v0.1',request_id:request.request_id,status:'held',answer:'',error:'test-held'})};}
  const out={schema:'td613.loom.ai-task-result/v0.1',request_id:request.request_id,status:'completed',answer:request.phase==='ACTIVATE'?'Rules received; selected files are pending.':requests.length===2?'State B has four workstreams.':'State C has five workstreams.',missing_information:[],used_document_ids:request.phase==='ACTIVATE'?[]:['a'],suggested_next_step:'Inspect the next boundary.'};
  const normalized=loomDemoResult(out,bound.selected.documents);
  const stage={schema:LOOM_DEMO_STAGE_RECEIPT_SCHEMA,activation_digest:request.activation.activation_digest,phase:request.phase,request_id:request.request_id,request_digest:await loomDemoDigest(request,root),current_input_digest:bound.governance.input_digest,prior_result_digest:bound.receipt.prior_result_digest,result_digest:await loomDemoDigest(normalized,root),predecessor_receipt_digest:request.phase==='CONTINUE'?await loomDemoReceiptDigest(request.predecessor,root):null,expires_at:request.activation.expires_at,admission_state:'ADMITTED',stage_policy:request.phase==='ACTIVATE'?'AIA_ONLY':'SELECTED_FILES_BOUND',authority_transferred:false,auth:{scheme:'hmac-sha256',key_id:'td613-loom-demo-stage-v1',tag:'A'.repeat(43)}};
  if(tamperStageReceipt)stage.request_digest='f'.repeat(64);
  bound.governor.close();
  return {ok:true,status:200,json:async()=>({...out,native_reply:{ok:true,text:out.answer,relay:{transcript:out.answer,khonapolit:{present:true,text:out.answer}},receipt:{provider:{completion:{complete:true}}}},loom_demo_binding:bound.receipt,loom_demo_stage_receipt:stage})};
 };
 installKhonapolitTerminal(doc,root);
 await root.TD613_KHONAPOLIT_TERMINAL.ready;
 const controller=await installMarrowlineLoomDemo(packet,doc,root);
 return {dom,root,doc,packet,controller,requests,setHeld(value){deny=value;},close(){controller.destroy();clearMarrowlineAttachments(root);dom.window.close();}};
}
test('Loom demo branches from + and both numbered gestures stage attachment + prompt before explicit Send',async()=>{
 const h=await harness();try{
 assert.equal(h.doc.querySelector('#loomImportedWorkspace'),null);
 const plus=h.doc.querySelector('#marrowlineComposerPlus');
 const parentMenu=h.doc.querySelector('#marrowlineContextMenu');
 const loomParent=h.doc.querySelector('#marrowlineContextLoom');
 const attachmentAccess=h.doc.querySelector('#marrowlineComposerAttachments');
 const prompt=h.doc.querySelector('#khonapolitPrompt');
 const send=h.doc.querySelector('#khonapolitSend');
 const gateContinuity=h.doc.querySelector('#loomGateContinuity');
 const gateExport=gateContinuity.querySelector('.loom-gate-primary');
 assert.ok(gateContinuity,'Phase 2 installs the Loom Gate continuity witness');
 assert.match(gateContinuity.textContent,/What crossed this Loom Gate\?/);
 let gateState=h.controller.getGateContinuity();
 assert.equal(gateState.phase,'ARRIVED');
 assert.equal(gateState.fadt.state,'FILES HELD');
 assert.match(gateState.pedagogue.now,/Nothing has been sent to the AI receiver/);
 assert.ok(gateState.aperture.unresolved.some(item=>/internal reasoning/.test(item)));
 assert.ok(gateState.atlas.survived.some(item=>/Selected manifest retains 1 declared file id/.test(item)));
 assert.equal(gateExport.disabled,true);

 assert.equal(plus.dataset.loomAttention,'true');
 assert.equal(h.requests.length,0);
 plus.click();
 assert.equal(parentMenu.hidden,false);
 assert.equal(plus.dataset.loomAttention,'true','opening + cannot consume the Loom reminder');
 loomParent.click();
 assert.equal(parentMenu.hidden,false,'Loom demo opens as a branch of the existing + menu');
 assert.equal(loomParent.getAttribute('aria-expanded'),'true');
 assert.equal(h.doc.querySelector('#loomDemoMenu').hidden,false);
 plus.click();
 assert.equal(parentMenu.hidden,true,'closing + closes the parent menu');
 assert.equal(h.doc.querySelector('#loomDemoMenu').hidden,true,'closing the parent also closes its Loom branch');
 plus.click();
 loomParent.click();
 assert.equal(h.doc.querySelector('#loomDemoMenu').hidden,false);
 const preview=h.doc.querySelector('#loomDemoMenu .loom-demo-attachment-preview');
 assert.ok(preview,'exact Portable AIA JSON preview is available before sending');
 assert.match(preview.querySelector('summary').textContent,/Preview exact Portable AIA JSON/);
 assert.match(preview.querySelector('pre').textContent,/td613\.loom/);
 const returnToLoom=[...h.doc.querySelectorAll('#loomGateContinuity button')].find(button=>button.textContent==='Return to original Loom tab');
 assert.ok(returnToLoom,'Gate exposes the supported return to the live Loom custody tab');
 const buttons=[...h.doc.querySelectorAll('#loomDemoMenu>button')];
 assert.equal(buttons[0].textContent,'1 · Attach Loom handoff');
 assert.equal(buttons[1].textContent,'2 · Attach selected files');
 assert.equal(buttons[1].disabled,true,'#2 is visible from the beginning but waits for receiver-bound #1');

 buttons[0].click();
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(h.controller.snapshot().phase,'AIA_STAGED');
 assert.equal(h.controller.snapshot().pending_steps,false);
 assert.equal(h.requests.length,0,'#1 staging sends nothing');
 assert.equal(plus.dataset.loomAttention,'false','staging #1 stops the context cue; Send is next');
 assert.equal(attachmentAccess.hidden,false,'#1 wakes the ordinary Attachments surface');
 assert.equal(getMarrowlineAttachments().length,1);
 assert.match(prompt.value,/Receive the attached Loom Portable AIA/);
 assert.match(prompt.value,/wait for my next turn/);
 assert.equal(send.dataset.loomAttention,'true','explicit Send becomes the consequential next gesture');
 assert.equal(h.doc.querySelector('#khonapolitMessages').hidden,false);
 assert.equal(h.doc.querySelector('#loomDemoMessages'),null);
 assert.equal(h.doc.querySelector('.loom-demo-composer-note'),null);

 await h.controller.submit();
 const firstGovernedCard=[...h.doc.querySelectorAll('#khonapolitMessages article.relay-message')].at(-1);
 assert.equal(firstGovernedCard?.dataset.loomReadingRequestId,h.requests[0].request_id,'#1 admitted receiver return carries its exact Loom work-unit marker');
 assert.equal(firstGovernedCard?.dataset.loomReadingPhase,'ACTIVATE');
 assert.equal(h.requests[0].documents.length,0);
 assert.equal(h.requests[0].predecessor,null);
 assert.equal(h.controller.snapshot().phase,'AIA_SENT');
 assert.equal(h.controller.snapshot().pending_steps,true);
 assert.equal(typeof h.controller.snapshot().predecessor_request_id,'string');
 assert.equal(plus.dataset.loomAttention,'true','receiver-bound #1 wakes the reminder for #2');
 assert.equal(getMarrowlineAttachments().length,0);
 gateState=h.controller.getGateContinuity();
 assert.equal(gateState.phase,'AIA_SENT');
 assert.equal(gateState.fadt.state,'FILES ELIGIBLE');
 assert.ok(gateState.crossed.some(item=>/Portable governance activation has a receiver response bound by this browser route/.test(item)));
 assert.ok(gateState.crossed.some(item=>/Selected file bodies have not crossed/.test(item)));
 assert.ok(gateState.atlas.survived.some(item=>/Immediate receiver predecessor request/.test(item)));
 assert.equal(gateExport.disabled,true,'#1 receiver acknowledgement cannot unlock export');

 plus.click();
 assert.equal(parentMenu.hidden,false);
 loomParent.click();
 assert.equal(parentMenu.hidden,false,'returning for #2 reopens the same Loom branch');
 const reopened=[...h.doc.querySelectorAll('#loomDemoMenu>button')];
 assert.equal(reopened[0].dataset.completed,'true');
 assert.equal(reopened[0].disabled,true);
 assert.equal(reopened[1].disabled,false,'#2 wakes only after #1 has a bound receiver response');
 reopened[1].click();
 await new Promise(resolve=>setTimeout(resolve,0));

 assert.equal(h.controller.snapshot().phase,'FILES_STAGED');
 assert.equal(h.controller.snapshot().pending_steps,false);
 assert.equal(plus.dataset.loomAttention,'false','selecting #2 retires the + reminder only after its files are staged');
 assert.equal(loomParent.querySelector('span:nth-child(2)').textContent,'Loom demo');
 assert.equal(attachmentAccess.hidden,false,'#2 wakes the same ordinary Attachments surface');
 assert.equal(getMarrowlineAttachments().length,h.packet.documents.length);
 assert.match(prompt.value,/original Loom task/);
 assert.match(prompt.value,/selected files/);
 assert.equal(send.dataset.loomAttention,'true','#2 also requires explicit Send before consequence');
 gateState=h.controller.getGateContinuity();
 assert.equal(gateState.phase,'FILES_STAGED');
 assert.equal(gateState.fadt.state,'EXPORT HELD');
 assert.equal(gateExport.disabled,true);

 await h.controller.submit();
 const secondGovernedCard=[...h.doc.querySelectorAll('#khonapolitMessages article.relay-message')].at(-1);
 assert.equal(secondGovernedCard?.dataset.loomReadingRequestId,h.requests[1].request_id,'#2 admitted receiver return carries the current Loom work-unit marker');
 assert.equal(secondGovernedCard?.dataset.loomReadingPhase,'CONTINUE');
 assert.equal(h.controller.snapshot().phase,'DONE');
 assert.deepEqual(h.requests[1].documents,h.packet.documents);
 assert.equal(h.requests[1].predecessor.phase,'ACTIVATE');
 gateState=h.controller.getGateContinuity();
 assert.equal(gateState.fadt.state,'EXPORT ELIGIBLE');
 assert.ok(gateState.crossed.some(item=>/1 selected file body crossed/.test(item)));
 assert.ok(gateState.admitted.some(item=>/Stage #2 selected-file continuation is the current bound receiver result/.test(item)));
 assert.ok(gateState.atlas.survived.some(item=>/Current receiver result request/.test(item)));
 assert.equal(gateExport.disabled,false);
 assert.equal(h.doc.querySelectorAll('#khonapolitMessages article[data-role]').length,4);
 assert.equal(h.doc.querySelectorAll('textarea:not([hidden])').length>=1,true);
 prompt.value='Which state is current?';await h.controller.submit();
 const followGovernedCard=[...h.doc.querySelectorAll('#khonapolitMessages article.relay-message')].at(-1);
 assert.equal(followGovernedCard?.dataset.loomReadingRequestId,h.requests[2].request_id,'later governed continuation gets a new work-unit marker rather than inheriting the old one');
 assert.equal(h.requests[2].prior_result.answer,'State B has four workstreams.');
 assert.equal(h.requests[2].predecessor.phase,'CONTINUE');
 assert.equal(h.controller.exportPacket().continuation.prior_result.answer,'State C has five workstreams.');
 h.controller.leaveDemo();assert.throws(()=>h.controller.exportPacket(),/no current export/);
 }finally{h.close();}
});
test('held AIA does not unlock files; retry retains the staged packet and edited request',async()=>{
 const h=await harness({held:true});try{
 await h.controller.stageAia();h.doc.querySelector('#khonapolitPrompt').value='My edited acknowledgment request.';
 await h.controller.submit();assert.equal(h.controller.snapshot().phase,'AIA_STAGED');assert.equal(h.controller.snapshot().aia_sent,false);
 assert.equal(h.doc.querySelector('#khonapolitPrompt').value,'My edited acknowledgment request.');assert.equal(getMarrowlineAttachments().length,1);
 await h.controller.stageFiles();assert.equal(getMarrowlineAttachments().length,1);
 assert.throws(()=>h.controller.exportPacket());h.setHeld(false);await h.controller.submit();assert.equal(h.controller.snapshot().phase,'AIA_SENT');
 }finally{h.close();}
});
test('receiver rejects a structurally valid stage receipt that does not bind the exact request',async()=>{
 const h=await harness({tamperStageReceipt:true});try{
  await h.controller.stageAia();
  await h.controller.submit();
  assert.equal(h.controller.snapshot().phase,'AIA_STAGED');
  assert.equal(h.controller.snapshot().aia_sent,false);
  assert.equal(h.controller.snapshot().predecessor_request_id,null);
  assert.equal(getMarrowlineAttachments().length,1);
  assert.equal(h.root.__TD613_KHONAPOLIT_LAST_FAILURE__.diagnostic.code.includes('stage receipt'),true);
 }finally{h.close();}
});

test('ordinary extra attachments cannot silently enter governed request; restoring a removed AIA is explicit',async()=>{
 const h=await harness();try{
 await h.controller.stageAia();const attachment=getMarrowlineAttachments()[0];removeMarrowlineAttachment(attachment.id,h.root);
 await h.controller.submit();assert.equal(h.requests.length,0);
 const restore=[...h.doc.querySelectorAll('#loomDemoMenu button')].find(button=>/Restore/.test(button.textContent));restore.click();
 await new Promise(resolve=>setTimeout(resolve,20));assert.equal(getMarrowlineAttachments().length,1);
 await stageMarrowlineAttachments([new File(['PRIVATE_SENTINEL'],'private.txt',{type:'text/plain'})],{environment:h.root});
 await h.controller.submit();assert.equal(h.requests.length,0);assert.match(h.root.__TD613_KHONAPOLIT_LAST_FAILURE__.diagnostic.code,/changed/);
 }finally{h.close();}
});
test('failed continuation keeps the previous admitted export and reports hold separately',async()=>{
 const h=await harness();try{
 await h.controller.stageAia();await h.controller.submit();await h.controller.stageFiles();await h.controller.submit();
 const prior=h.controller.exportPacket();h.setHeld(true);h.doc.querySelector('#khonapolitPrompt').value='New attempt';await h.controller.submit();
 assert.deepEqual(h.controller.exportPacket(),prior);
 assert.match(h.doc.querySelector('#loomGateContinuity [role=status]').textContent,/HELD/);
 const gate=h.controller.getGateContinuity();
 assert.equal(gate.phase,'DONE');
 assert.equal(gate.fadt.state,'PRIOR EXPORT RETAINED');
 assert.equal(h.doc.querySelector('#loomGateContinuity .loom-gate-primary').disabled,false,'held follow-up cannot confiscate prior admitted export');
 assert.equal(h.requests.at(-1).prior_result.answer,'State B has four workstreams.');
 }finally{h.close();}
});
test('direct ordinary chat and page entry do not install a demo or send protected inputs',()=>{
 assert.doesNotMatch(html,/src="\.\/marrowline-loom-import\.js"/);
 assert.match(fs.readFileSync('app/dome-world/marrowline-egress-boot.js','utf8'),/bootMarrowlineLoomDemo/);
 assert.match(fs.readFileSync('app/dome-world/marrowline-terminal.js','utf8'),/loomTransport\.prepareRequest/);
});
