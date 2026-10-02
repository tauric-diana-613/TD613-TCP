import { consumeLoomAiHandoff } from './holonomy-loom/ai-handoff.js';
import { createLoomDemoActivation, bindLoomDemoRequest, exportLoomDemoCurrent, loomDemoDigest, loomDemoReceiptDigest, loomDemoResult, validateLoomDemoStageReceipt, LOOM_DEMO_REQUEST_SCHEMA } from './holonomy-loom/demo-contract.js';
import { readLoomAiFailure, describeLoomAiFailure } from './holonomy-loom/ai-failure.js';
import { getMarrowlineAttachments, stageMarrowlineAttachments, removeMarrowlineAttachment } from './marrowline-attachments.js';
import { installMarrowlineLoomGateContinuity } from './marrowline-loom-gate-continuity.js';

const EVENT = 'td613:marrowline:loom-demo-state';
const byId = (doc, id) => doc.getElementById(id);
const copy = value => JSON.parse(JSON.stringify(value));
function element(doc, tag, text, className='') { const node=doc.createElement(tag);node.textContent=text;node.className=className;return node; }
function button(doc, label, action) { const node=element(doc,'button',label);node.type='button';node.addEventListener('click',action);return node; }
function chatTarget(doc) {return doc.querySelector(doc.documentElement.classList.contains('marrowline-mobile-shell') ? '.mobile-dock [data-mobile-target="speakingPanel"]' : null);}

export async function installMarrowlineLoomDemo(packet, doc=document, environment=window) {
  if (environment.__TD613_LOOM_DEMO_CONTROLLER__) return environment.__TD613_LOOM_DEMO_CONTROLLER__;
  await environment.TD613_KHONAPOLIT_TERMINAL?.ready;
  const activation=await createLoomDemoActivation(packet,environment);
  const form=byId(doc,'khonapolitForm'), prompt=byId(doc,'khonapolitPrompt'), send=byId(doc,'khonapolitSend'), ordinary=byId(doc,'khonapolitMessages');
  if (!form || !prompt || !send || !ordinary) throw new Error('Loom demo composer unavailable.');
  let phase='ARRIVED', active=false, pending=null, staged=[], busy=false, staging=false, stageGeneration=0;
  let latest=packet.continuation?.prior_result ? loomDemoResult(packet.continuation.prior_result, packet.documents) : null, latestBinding=null, lastAccepted=null, predecessor=null, lastAdmittedBindingReceipt=null;
  let destroyed=false, lastAttempt='NOT_SENT', stagedDraft='';
  const status=byId(doc,'khonapolitTerminalStatus');
  const setStatus=text=>{if(status)status.textContent=text;};

  // Loom supplies a bounded transport; Marrowline owns the conversation UI.
  const menu=element(doc,'section','','loom-demo-menu marrowline-context-submenu');menu.id='loomDemoMenu';menu.hidden=true;
  menu.setAttribute('role','menu');menu.setAttribute('aria-labelledby','loomDemoMenuTitle');
  const title=element(doc,'h3','Loom demo');title.id='loomDemoMenuTitle';
  const hint=element(doc,'p','Two sends. Rules first, matching files second. Nothing is sent when you select an option. This local transfer expires after ten minutes; reload requires a fresh handoff. The original Loom tab remains the live Check/Admit custody surface.');
  const activationPreview=doc.createElement('details');activationPreview.className='loom-demo-attachment-preview';
  const activationSummary=element(doc,'summary','Preview exact Portable AIA JSON before sending');
  const activationBytes=element(doc,'pre',JSON.stringify(activation,null,2));
  activationPreview.append(activationSummary,activationBytes);
  const step1=button(doc,'1 · Attach Loom handoff',()=>void stageAia());
  const note1=element(doc,'small','Task, rules, file commitments and prior-result commitment. No selected-file contents.');
  const step2=button(doc,'2 · Attach selected files',()=>void stageFiles());
  const note2=element(doc,'small','Locked until #1 has returned a bound receiver acknowledgement.');
  const menuStatus=element(doc,'p','','loom-demo-menu-status');menuStatus.setAttribute('role','status');menuStatus.setAttribute('aria-live','polite');
  const restore=button(doc,'Restore selected attachments',()=>void restoreStage());restore.hidden=true;
  const leave=button(doc,'End Loom continuation',()=>leaveDemo());
  const close=button(doc,'Close',()=>closeMenu());
  menu.append(title,hint,activationPreview,step1,note1,step2,note2,menuStatus,restore,leave,close);doc.body.append(menu);

  const returnToLoom=()=>{
    try{
      const opener=environment.opener;
      if(!opener||opener.closed||opener.location?.origin!==environment.location?.origin)throw new Error('Original Loom tab unavailable. Do not recreate its custody state from this Marrowline tab.');
      opener.focus();
      setStatus('Original Loom tab focused · its live Check/Admit custody lane remains authoritative. This Marrowline tab stays open.');
    }catch(error){setStatus(`Return to Loom held · ${error.message}`);}
  };
  const gateContinuity=installMarrowlineLoomGateContinuity({
    doc,root:environment,activation,packet,
    onExport:()=>exportCurrent(),
    onLocalCheck:()=>void checkBinding(),
    onReturnToLoom:()=>returnToLoom(),
    onReturnToChat:()=>{const target=chatTarget(doc);if(target){target.click();target.focus?.({preventScroll:true});}else prompt.focus?.({preventScroll:true});}
  });

  const snapshot=()=>({phase,active,busy:busy||staging,pending_steps:['ARRIVED','AIA_SENT'].includes(phase),aia_sent:['AIA_SENT','FILES_STAGED','CONTINUING','DONE'].includes(phase),files_staged:['FILES_STAGED','CONTINUING','DONE'].includes(phase),current_result_request_id:lastAccepted?.request_id??null,predecessor_request_id:predecessor?.request_id??null});
  function emit() {
    const state=snapshot();environment.__TD613_LOOM_DEMO_STATE__=state;
    doc.documentElement.dataset.loomTaskImport=state.pending_steps?'staged':phase.toLowerCase();
    doc.documentElement.dataset.loomDemoActive=String(active);
    send.dataset.loomAttention=String(active && Boolean(pending) && !busy);
    restore.hidden=!active||!pending||busy||staging||JSON.stringify(getMarrowlineAttachments())===JSON.stringify(staged);
    step1.disabled=busy||staging||phase!=='ARRIVED';
    step2.disabled=busy||staging||phase!=='AIA_SENT';
    step1.dataset.completed=String(state.aia_sent);step2.dataset.completed=String(state.files_staged);
    note2.textContent=state.aia_sent?'Selected Loom files only. Local-only documents never enter this route.':'Locked until #1 has returned a bound receiver acknowledgement.';
    gateContinuity?.update({phase,lastAttempt,busy,activation,binding:lastAdmittedBindingReceipt,predecessor,result:lastAccepted,packet});
    environment.dispatchEvent(new environment.CustomEvent(EVENT,{detail:state}));
  }
  function closeMenu({focusParent=true}={}){
    menu.hidden=true;
    const parent=byId(doc,'marrowlineContextLoom');
    parent?.setAttribute?.('aria-expanded','false');
    if(focusParent)parent?.focus?.({preventScroll:true});
  }
  function openMenu(){
    if(destroyed)return;
    emit();menu.hidden=false;
    const anchor=byId(doc,'marrowlineContextLoom')?.getBoundingClientRect();
    const vw=environment.innerWidth||390, vh=environment.innerHeight||844;
    const width=Math.min(330,Math.max(260,vw-20));
    const branchRight=(anchor?.right??10)+8;
    const canBranchRight=branchRight+width<=vw-10;
    menu.style.width=`${width}px`;
    menu.style.left=`${canBranchRight?branchRight:Math.max(10,(anchor?.left??10)-width-8)}px`;
    menu.style.top=`${Math.max(10,Math.min(anchor?.top??10,vh-Math.min(menu.offsetHeight||280,vh-20)-10))}px`;
    menu.style.bottom='auto';
    byId(doc,'marrowlineContextLoom')?.setAttribute?.('aria-expanded','true');
    const next=phase==='ARRIVED'?step1:phase==='AIA_SENT'?step2:!restore.hidden?restore:leave;
    next.focus?.({preventScroll:true});
  }
  function enter(){
    if(active)return;
    active=true;
  }
  function assertCanStage(){
    if(busy||staging||send.dataset.transmissionState==='generating')throw new Error('Wait for or stop the current request first.');
    if(getMarrowlineAttachments().length)throw new Error('Send or remove the currently staged attachments first.');
    if(!active&&prompt.value.trim())throw new Error('Save or clear your ordinary chat draft before starting the Loom demo.');
    if(Date.now()>=activation.expires_at)throw new Error('This Loom transfer has expired. Prepare it again in Loom.');
  }
  async function stage(files){
    const expectedPhase=phase, ticket=++stageGeneration;
    let ownedIds=[];
    staging=true;emit();
    environment.dispatchEvent(new environment.CustomEvent('td613:marrowline:attachment-staging-state',{detail:{staging:true}}));
    try {
      const state=await stageMarrowlineAttachments(files,{environment,onStaged:ids=>{ownedIds=ids;}});
      const current=getMarrowlineAttachments();
      if(ticket!==stageGeneration||phase!==expectedPhase||destroyed||Date.now()>=activation.expires_at){
        ownedIds.forEach(id=>removeMarrowlineAttachment(id,environment));
        throw new Error('Attachment preparation ended after the Loom session closed; nothing was sent.');
      }
      if(state.count!==files.length||current.some(item=>!ownedIds.includes(item.id))){
        ownedIds.forEach(id=>removeMarrowlineAttachment(id,environment));
        throw new Error('Other attachments arrived during Loom preparation; remove or send them before trying again.');
      }
      staged=current;
    } finally {
      staging=false;
      environment.dispatchEvent(new environment.CustomEvent('td613:marrowline:attachment-staging-state',{detail:{staging:false}}));
      emit();
    }
  }
  async function stageAia(){
    try{
      if(phase!=='ARRIVED')return;
      assertCanStage();
      const file=new environment.File([JSON.stringify(activation,null,2)],'loom-portable-aia-activation.json',{type:'application/json'});
      await stage([file]);enter();pending='ACTIVATE';phase='AIA_STAGED';
      prompt.value='Receive the attached Loom Portable AIA. Acknowledge the task and rules, identify the pending selected files, and wait for my next turn.';
      stagedDraft=prompt.value;
      setStatus('Loom handoff attached · Send first; your selected files have not been sent.');
      prompt.dispatchEvent(new environment.Event('input',{bubbles:true}));
      closeMenu({focusParent:false});prompt.focus?.({preventScroll:true});emit();
    }catch(error){menuStatus.textContent=error.message;setStatus(`Loom demo held · ${error.message}`);}
  }
  async function stageFiles(){
    try{
      if(phase!=='AIA_SENT')return;
      assertCanStage();
      const files=packet.documents.map(document=>new environment.File([document.text],document.name,{type:'text/plain'}));
      await stage(files);pending='CONTINUE';phase='FILES_STAGED';
      prompt.value=latest?'Continue the original Loom task from its prior answer. Recheck the answer against these selected files and preserve the portable rules and missing evidence.':'Work on the original Loom task using these selected files under the portable rules.';
      stagedDraft=prompt.value;
      setStatus(`${files.length} selected files attached · Send to continue the task.`);
      prompt.dispatchEvent(new environment.Event('input',{bubbles:true}));
      closeMenu({focusParent:false});prompt.focus?.({preventScroll:true});emit();
    }catch(error){menuStatus.textContent=error.message;setStatus(`Loom demo held · ${error.message}`);}
  }
  async function restoreStage(){
    if(!pending||busy)return;
    const existing=getMarrowlineAttachments();
    if(existing.some(item=>!staged.some(expected=>JSON.stringify(expected)===JSON.stringify(item)))){setStatus('Unrelated attachments are present. Leave Loom demo before changing them.');return;}
    existing.forEach(item=>removeMarrowlineAttachment(item.id,environment));staged=[];
    const draft=prompt.value;
    phase=pending==='ACTIVATE'?'ARRIVED':'AIA_SENT';
    if(pending==='ACTIVATE')await stageAia();else await stageFiles();
    prompt.value=draft;
  }
  function assertStaged(){
    const actual=getMarrowlineAttachments();
    if(JSON.stringify(actual)!==JSON.stringify(staged))throw new Error('The staged attachments changed. Restore the Loom selection or leave Loom mode; nothing was sent.');
  }
  async function prepareRequest(operator_request, marrowline, signal) {
    if(busy||destroyed)throw new Error('Wait for the current request first.');
    if(!active||phase==='EXPIRED'||phase==='LEFT')throw new Error('Prepare a fresh Loom handoff before sending.');
    const operation=pending||(phase==='DONE'?'CONTINUE':null);
    if(!operation)throw new Error('Use + → Loom demo to attach the selected files.');
    // Acquire before the first crypto await. Native terminal also owns one
    // synchronous in-flight lock for taps, Enter and explicit retry.
    busy=true;lastAttempt='PENDING';emit();
    let binding;
    try {
      assertStaged();
      const request={schema:LOOM_DEMO_REQUEST_SCHEMA,request_id:environment.crypto.randomUUID(),phase:operation,activation,documents:operation==='CONTINUE'?packet.documents:[],operator_request,prior_result:operation==='CONTINUE'?latest:null,predecessor:operation==='CONTINUE'?predecessor:null,marrowline};
      binding=await bindLoomDemoRequest(request,environment);
      if(signal?.aborted||destroyed||!active||Date.now()>=activation.expires_at)throw new Error('Loom request stopped before dispatch.');
      return {request,binding,operation,signal,endpoint:'/api/khonapolit?operation=loom-demo-task'};
    } catch(error) {binding?.governor.close();rejectAttempt();finishAttempt();throw error;}
  }
  async function admitResponse(output, prepared) {
    const {request,binding,operation,signal}=prepared;
    if(signal?.aborted||destroyed||!active||Date.now()>=activation.expires_at)throw new Error('Stopped waiting. No new receiver result was bound.');
    const failure=readLoomAiFailure(output,request.request_id);
    if(failure)throw new Error(describeLoomAiFailure(failure,422));
    const native=output.native_reply;
    if(!native?.ok||!native.relay||typeof native.text!=='string'||output.answer!==native.text||native.relay.transcript!==native.text||native.receipt?.provider?.completion?.complete!==true)throw new Error('The native Marrowline return was not completed.');
    if(JSON.stringify(output.loom_demo_binding)!==JSON.stringify(binding.receipt))throw new Error('The server binding did not match this request.');
    const returnedPredecessor=validateLoomDemoStageReceipt(output.loom_demo_stage_receipt,activation);
    const normalizedResult=loomDemoResult(output,binding.selected.documents);
    const expectedRequestDigest=await loomDemoDigest(request,environment);
    const expectedResultDigest=await loomDemoDigest(normalizedResult,environment);
    const expectedPredecessorReceiptDigest=operation==='CONTINUE'?await loomDemoReceiptDigest(predecessor,environment):null;
    if(returnedPredecessor.phase!==operation||returnedPredecessor.request_id!==request.request_id||returnedPredecessor.request_digest!==expectedRequestDigest||returnedPredecessor.current_input_digest!==binding.governance.input_digest||returnedPredecessor.prior_result_digest!==binding.receipt.prior_result_digest||returnedPredecessor.result_digest!==expectedResultDigest||returnedPredecessor.predecessor_receipt_digest!==expectedPredecessorReceiptDigest)throw new Error('The server stage receipt did not match this request.');
    if(signal?.aborted||destroyed||!active||Date.now()>=activation.expires_at)throw new Error('Stopped waiting. No new receiver result was bound.');
    if(!binding.admit(normalizedResult).allowed)throw new Error('The returned result was held by the Loom governor.');
    predecessor=returnedPredecessor;lastAdmittedBindingReceipt=copy(binding.receipt);lastAttempt='ADMITTED';
    pending=null;staged=[];
    if(operation==='ACTIVATE')phase='AIA_SENT';
    else {
      phase='DONE';latest=normalizedResult;latestBinding?.governor.close();latestBinding=binding;lastAccepted=copy(latest);
    }
    emit();
    return output;
  }
  function rejectAttempt(){lastAttempt='HELD';emit();}
  function finishAttempt(prepared){
    if(prepared?.binding!==latestBinding)prepared?.binding?.governor.close();
    busy=false;emit();
  }
  async function submit(){return environment.TD613_KHONAPOLIT_TERMINAL?.submitTask();}
  function leaveDemo(){
    stageGeneration++;environment.TD613_KHONAPOLIT_TERMINAL?.stop();latestBinding?.governor.close();
    staged.forEach(item=>removeMarrowlineAttachment(item.id,environment));staged=[];
    if(pending && prompt.value===stagedDraft){prompt.value='';prompt.dispatchEvent(new environment.Event('input',{bubbles:true}));}
    active=false;phase='LEFT';pending=null;closeMenu({focusParent:false});
    environment.history?.replaceState(null,'',environment.location.pathname+environment.location.search);
    setStatus('Loom continuation ended. Your conversation remains in Marrowline.');emit();
  }
  async function checkBinding(){
    try{
      if(destroyed||!active||['EXPIRED','LEFT'].includes(phase)||Date.now()>=activation.expires_at)throw new Error('This Loom transfer is closed. Prepare a fresh handoff.');
      if(busy)throw new Error('Wait for or stop the current request before checking.');
      if(!predecessor)throw new Error('Complete #1 receiver acknowledgement before checking the file-bearing continuation.');
      const checkGeneration=stageGeneration, checkPhase=phase, checkPredecessor=predecessor;
      gateContinuity?.reportAction('PENDING','Checking selected-file binding locally · no provider call.');
      const req={schema:LOOM_DEMO_REQUEST_SCHEMA,request_id:environment.crypto.randomUUID(),phase:'CONTINUE',activation,documents:packet.documents,operator_request:'Check the selected file binding locally.',prior_result:latest,predecessor};
      const binding=await bindLoomDemoRequest(req,environment);binding.governor.close();
      if(destroyed||!active||stageGeneration!==checkGeneration||phase!==checkPhase||predecessor!==checkPredecessor||['EXPIRED','LEFT'].includes(phase)||busy||Date.now()>=activation.expires_at)throw new Error('The Loom state changed during the local check. Check the current stage again.');
      const message='Local check passed · selected bytes and portable rules match · no provider call made.';
      gateContinuity?.reportAction('PASSED',message);setStatus(message);
    }catch(error){const message=`Local check held · ${error.message}`;gateContinuity?.reportAction('HELD',message);setStatus(message);}
  }
  function exportPacket(){
    if(!active||phase!=='DONE'||Date.now()>=activation.expires_at)throw new Error('This Loom session has no current export. Prepare a fresh handoff before exporting.');
    if(busy)throw new Error('Wait for or stop the current request before exporting.');
    return exportLoomDemoCurrent(latestBinding);
  }
  function exportCurrent(){
    try{
      const payload=exportPacket();
      const url=environment.URL.createObjectURL(new environment.Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
      const link=element(doc,'a','');link.href=url;link.download='loom-current-portable-aia.json';doc.body.append(link);link.click();link.remove();
      environment.setTimeout(()=>environment.URL.revokeObjectURL(url),1500);
      const message='Download requested · current Loom Portable AIA prepared. Your browser handles saving the file; no onward execution occurred.';
      gateContinuity?.reportAction('DOWNLOAD_REQUESTED',message);setStatus(message);
    }catch(error){const message=`Loom export held · ${error.message}`;gateContinuity?.reportAction('HELD',message);setStatus(message);}
  }
  environment.addEventListener('td613:marrowline:loom-demo-open',openMenu);
  environment.addEventListener('td613:marrowline:loom-demo-close',()=>closeMenu({focusParent:false}));
  doc.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){event.preventDefault();closeMenu();}});
  doc.addEventListener('click',event=>{if(!menu.hidden&&!menu.contains(event.target)&&!byId(doc,'marrowlineContextLoom')?.contains(event.target))closeMenu({focusParent:false});});
  const expiry=environment.setTimeout(()=>{stageGeneration++;phase='EXPIRED';environment.TD613_KHONAPOLIT_TERMINAL?.stop();menuStatus.textContent='This transfer expired. Prepare a fresh handoff in Loom.';emit();},Math.max(0,activation.expires_at-Date.now()));
  environment.addEventListener('pagehide',()=>{if(active)environment.TD613_KHONAPOLIT_TERMINAL?.stop();});
  environment.addEventListener('td613:marrowline:attachments-changed',()=>emit());
  const controller={openMenu,stageAia,stageFiles,restoreStage,leaveDemo,submit,prepareRequest,admitResponse,rejectAttempt,finishAttempt,snapshot,exportPacket,getGateContinuity:()=>gateContinuity?.getCurrent?.()??null,destroy(){destroyed=true;environment.clearTimeout(expiry);leaveDemo();menu.remove();gateContinuity?.destroy?.();}};
  environment.__TD613_LOOM_DEMO_CONTROLLER__=controller;
  environment.history?.replaceState(null,'',environment.location.pathname+environment.location.search+'#loom-demo');
  emit();setStatus(`${packet.documents.length} selected Loom files arrived · + → Loom demo · start with the Portable AIA`);
  return controller;
}

export async function bootMarrowlineLoomDemo(environment=window){
  const hash=environment.location.hash;
  const match=/^#loom=([a-f0-9]{48})$/.exec(hash);
  if(!match){
    if(hash.startsWith('#loom=')){
      await environment.TD613_KHONAPOLIT_TERMINAL?.ready;
      byId(environment.document,'khonapolitTerminalStatus').textContent='Loom handoff held · malformed local transfer. Return to Loom to prepare it again.';
      return null;
    }
    if(hash==='#loom-demo')byId(environment.document,'khonapolitTerminalStatus').textContent='This local Loom session was interrupted or reloaded. Prepare a fresh handoff in Loom; no packet was silently restored.';
    return null;
  }
  environment.history.replaceState(null,'',environment.location.pathname+environment.location.search+'#loom-demo');
  try{return await installMarrowlineLoomDemo(await consumeLoomAiHandoff(match[1],environment),environment.document,environment);}
  catch(error){byId(environment.document,'khonapolitTerminalStatus').textContent=`Loom handoff held · ${error.message} Return to Loom to prepare it again.`;return null;}
}
