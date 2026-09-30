import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {webcrypto} from 'node:crypto';
import {JSDOM} from 'jsdom';
import {createLoomAiGovernance} from '../app/dome-world/holonomy-loom/ai-handoff.js';
import {bindLoomDemoRequest} from '../app/dome-world/holonomy-loom/demo-contract.js';
import {installMarrowlineLoomDemo} from '../app/dome-world/marrowline-loom-demo.js';
import {getMarrowlineAttachments,clearMarrowlineAttachments,removeMarrowlineAttachment,stageMarrowlineAttachments} from '../app/dome-world/marrowline-attachments.js';
const html=fs.readFileSync('app/dome-world/marrowline.html','utf8');
async function harness({held=false}={}){
 const dom=new JSDOM(html,{url:'https://td613.com/dome-world/marrowline.html'}), root=dom.window, doc=root.document;
 Object.defineProperty(root,'crypto',{value:webcrypto});root.File=File;root.Blob=Blob;
 const packet={task:'Compare fictional workstreams.',documents:[{id:'a',name:'a.md',text:'State A has three workstreams.'}],rules:['Use only selected sources.']};
 packet.governance=await createLoomAiGovernance(packet,{withheldDocumentCount:1},root);
 clearMarrowlineAttachments(root);
 const requests=[];let deny=held;
 root.fetch=async(url,options)=>{
  assert.match(url,/operation=loom-demo-task$/);const request=JSON.parse(options.body);requests.push(request);
  const bound=await bindLoomDemoRequest(request,root);bound.governor.close();
  const out=deny?{schema:'td613.loom.ai-task-result/v0.1',request_id:request.request_id,status:'held',answer:'',error:'test-held'}:{schema:'td613.loom.ai-task-result/v0.1',request_id:request.request_id,status:'completed',answer:request.phase==='ACTIVATE'?'Rules received; selected files are pending.':requests.length===2?'State B has four workstreams.':'State C has five workstreams.',missing_information:[],used_document_ids:request.phase==='ACTIVATE'?[]:['a'],suggested_next_step:'Inspect the next boundary.',loom_demo_binding:bound.receipt};
  return {ok:!deny,status:deny?422:200,json:async()=>out};
 };
 const controller=await installMarrowlineLoomDemo(packet,doc,root);
 return {dom,root,doc,packet,controller,requests,setHeld(value){deny=value;},close(){controller.destroy();clearMarrowlineAttachments(root);dom.window.close();}};
}
test('arrival has no ingress membrane, both numbered steps visible, no request until Send',async()=>{
 const h=await harness();try{
 assert.equal(h.doc.querySelector('#loomImportedWorkspace'),null);
 assert.equal(h.requests.length,0);h.controller.openMenu();
 assert.equal(h.doc.querySelector('#loomDemoMenu').hidden,false);
 const buttons=[...h.doc.querySelectorAll('#loomDemoMenu button')];
 assert.equal(buttons[0].textContent,'#1: Upload portable AIA');assert.equal(buttons[1].textContent,'#2: Upload Loom demo files');assert.equal(buttons[1].disabled,true);
 await h.controller.stageAia();
 assert.equal(h.controller.snapshot().pending_steps,true);assert.equal(h.requests.length,0);
 assert.equal(getMarrowlineAttachments().length,1);assert.equal(h.doc.querySelector('#khonapolitMessages').hidden,true);
 await h.controller.submit();
 assert.equal(h.requests[0].documents.length,0);assert.equal(h.controller.snapshot().phase,'AIA_SENT');assert.equal(h.controller.snapshot().pending_steps,true);
 assert.equal(getMarrowlineAttachments().length,0);
 await h.controller.stageFiles();assert.equal(h.controller.snapshot().pending_steps,false);
 assert.equal(getMarrowlineAttachments().length,1);await h.controller.submit();
 assert.equal(h.controller.snapshot().phase,'DONE');assert.deepEqual(h.requests[1].documents,h.packet.documents);
 assert.equal(h.doc.querySelectorAll('#loomDemoMessages .loom-demo-message').length,4);
 assert.equal(h.doc.querySelectorAll('textarea:not([hidden])').length>=1,true);
 h.doc.querySelector('#khonapolitPrompt').value='Which state is current?';await h.controller.submit();
 assert.equal(h.requests[2].prior_result.answer,'State B has four workstreams.');
 assert.equal(h.controller.exportPacket().continuation.prior_result.answer,'State C has five workstreams.');
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
test('ordinary extra attachments cannot silently enter governed request; restoring a removed AIA is explicit',async()=>{
 const h=await harness();try{
 await h.controller.stageAia();const attachment=getMarrowlineAttachments()[0];removeMarrowlineAttachment(attachment.id,h.root);
 await h.controller.submit();assert.equal(h.requests.length,0);
 const restore=[...h.doc.querySelectorAll('.loom-demo-composer-note button')].find(button=>/Restore/.test(button.textContent));restore.click();
 await new Promise(resolve=>setTimeout(resolve,20));assert.equal(getMarrowlineAttachments().length,1);
 await stageMarrowlineAttachments([new File(['PRIVATE_SENTINEL'],'private.txt',{type:'text/plain'})],{environment:h.root});
 await h.controller.submit();assert.equal(h.requests.length,0);assert.equal(h.doc.querySelector('#khonapolitTerminalStatus').textContent.includes('changed'),true);
 }finally{h.close();}
});
test('failed continuation keeps the previous admitted export and reports hold separately',async()=>{
 const h=await harness();try{
 await h.controller.stageAia();await h.controller.submit();await h.controller.stageFiles();await h.controller.submit();
 const prior=h.controller.exportPacket();h.setHeld(true);h.doc.querySelector('#khonapolitPrompt').value='New attempt';await h.controller.submit();
 assert.deepEqual(h.controller.exportPacket(),prior);assert.match(h.doc.querySelector('#loomDemoGate [role=status]').textContent,/latest attempt was held/);
 assert.equal(h.requests.at(-1).prior_result.answer,'State B has four workstreams.');
 }finally{h.close();}
});
test('direct ordinary chat and page entry do not install a demo or send protected inputs',()=>{
 assert.doesNotMatch(html,/src="\.\/marrowline-loom-import\.js"/);
 assert.match(fs.readFileSync('app/dome-world/marrowline-egress-boot.js','utf8'),/bootMarrowlineLoomDemo/);
 assert.match(fs.readFileSync('app/dome-world/marrowline-terminal.js','utf8'),/dataset\.loomDemoActive === 'true'/);
});
