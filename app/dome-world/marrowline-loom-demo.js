import { consumeLoomAiHandoff } from './holonomy-loom/ai-handoff.js';
import { createLoomDemoActivation, bindLoomDemoRequest, exportLoomDemoCurrent, loomDemoDigest, loomDemoResult, validateLoomDemoStageReceipt, LOOM_DEMO_REQUEST_SCHEMA } from './holonomy-loom/demo-contract.js';
import { renderLoomAiResult } from './holonomy-loom/ai-result-view.js';
import { readLoomAiFailure, describeLoomAiFailure } from './holonomy-loom/ai-failure.js';
import { ingestGeminiConsumption } from '../gemini-consumption-ledger.js';
import { getMarrowlineAttachments, stageMarrowlineAttachments, removeMarrowlineAttachment } from './marrowline-attachments.js';
import { installMarrowlineLoomGateContinuity } from './marrowline-loom-gate-continuity.js';

const EVENT = 'td613:marrowline:loom-demo-state';
const byId = (doc, id) => doc.getElementById(id);
const copy = value => JSON.parse(JSON.stringify(value));
function element(doc, tag, text, className='') { const node=doc.createElement(tag);node.textContent=text;node.className=className;return node; }
function button(doc, label, action) { const node=element(doc,'button',label);node.type='button';node.addEventListener('click',action);return node; }
function gateTarget(doc) {return doc.querySelector(doc.documentElement.classList.contains('marrowline-mobile-shell') ? '.mobile-dock [data-mobile-target="gatePanel"]' : '#marrowlineDesktopToolTabs [data-target="gatePanel"]');}
function chatTarget(doc) {return doc.querySelector(doc.documentElement.classList.contains('marrowline-mobile-shell') ? '.mobile-dock [data-mobile-target="speakingPanel"]' : null);}

export async function installMarrowlineLoomDemo(packet, doc=document, environment=window) {
  if (environment.__TD613_LOOM_DEMO_CONTROLLER__) return environment.__TD613_LOOM_DEMO_CONTROLLER__;
  const activation=await createLoomDemoActivation(packet,environment);
  const form=byId(doc,'khonapolitForm'), prompt=byId(doc,'khonapolitPrompt'), send=byId(doc,'khonapolitSend'), ordinary=byId(doc,'khonapolitMessages');
  if (!form || !prompt || !send || !ordinary) throw new Error('Loom demo composer unavailable.');
  let phase='ARRIVED', active=false, pending=null, staged=[], busy=false;
  let latest=packet.continuation?.prior_result ? loomDemoResult(packet.continuation.prior_result, packet.documents) : null, latestBinding=null, lastAccepted=null, predecessor=null, lastAdmittedBindingReceipt=null;
  let ordinaryDraft=null, destroyed=false, lastAttempt='NOT_SENT';
  const status=byId(doc,'khonapolitTerminalStatus');
  const setStatus=text=>{if(status)status.textContent=text;};

  // The normal composer is shared. Only one transcript and one governing
  // context is visible at a time; raw Loom bytes never enter ordinary history.
  const transcript=element(doc,'div','','messages loom-demo-transcript');
  transcript.id='loomDemoMessages';transcript.hidden=true;transcript.setAttribute('aria-label','Governed Loom demo conversation');
  ordinary.after(transcript);
  const banner=element(doc,'div','','loom-demo-composer-note');banner.hidden=true;
  const modeLabel=element(doc,'strong','Loom demo · governed continuation');
  const consequence=element(doc,'span','Send attached Loom first. Then attach your files.');
  const leave=button(doc,'Leave Loom demo',()=>leaveDemo());
  const restore=button(doc,'Restore staged Loom attachment',()=>void restoreStage());restore.hidden=true;
  banner.append(modeLabel,consequence,restore,leave);form.prepend(banner);

  const menu=element(doc,'section','','loom-demo-menu marrowline-context-submenu');menu.id='loomDemoMenu';menu.hidden=true;
  menu.setAttribute('role','menu');menu.setAttribute('aria-labelledby','loomDemoMenuTitle');
  const title=element(doc,'h3','Loom demo');title.id='loomDemoMenuTitle';
  const hint=element(doc,'p','Two sends. Rules first, matching files second. Nothing is sent when you select an option. This local transfer expires after ten minutes; reload requires a fresh handoff.');
  const step1=button(doc,'#1: Upload portable AIA',()=>void stageAia());
  const note1=element(doc,'small','Task, rules, file commitments and prior-result commitment. No selected-file contents.');
  const step2=button(doc,'#2: Upload Loom demo files',()=>void stageFiles());
  const note2=element(doc,'small','Locked until #1 has returned an admitted response.');
  const menuStatus=element(doc,'p','','loom-demo-menu-status');menuStatus.setAttribute('role','status');menuStatus.setAttribute('aria-live','polite');
  const close=button(doc,'Close',()=>closeMenu());
  menu.append(title,hint,step1,note1,step2,note2,menuStatus,close);doc.body.append(menu);

  const gateContinuity=installMarrowlineLoomGateContinuity({
    doc,root:environment,activation,packet,
    onExport:()=>exportCurrent(),
    onLocalCheck:()=>void checkBinding(),
    onReturnToChat:()=>{const target=chatTarget(doc);if(target){target.click();target.focus?.({preventScroll:true});}else prompt.focus?.({preventScroll:true});}
  });

  const snapshot=()=>({phase,active,busy,pending_steps:!['FILES_STAGED','CONTINUING','DONE','EXPIRED','LEFT'].includes(phase),aia_sent:['AIA_SENT','FILES_STAGED','CONTINUING','DONE'].includes(phase),files_staged:['FILES_STAGED','CONTINUING','DONE'].includes(phase),current_result_request_id:lastAccepted?.request_id??null,predecessor_request_id:predecessor?.request_id??null});
  function emit() {
    const state=snapshot();environment.__TD613_LOOM_DEMO_STATE__=state;
    doc.documentElement.dataset.loomTaskImport=state.pending_steps?'staged':phase.toLowerCase();
    doc.documentElement.dataset.loomDemoActive=String(active);
    send.dataset.loomAttention=String(active && Boolean(pending) && !busy);
    restore.hidden=!active||!pending||busy;
    step1.disabled=busy||!['ARRIVED','AIA_STAGED'].includes(phase);
    step2.disabled=busy||phase!=='AIA_SENT';
    step1.dataset.completed=String(state.aia_sent);step2.dataset.completed=String(state.files_staged);
    note2.textContent=state.aia_sent?'Selected Loom files only. Local-only documents never enter this route.':'Locked until #1 has returned an admitted response.';
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
    (phase==='AIA_SENT'?step2:step1).focus?.({preventScroll:true});
  }
  function enter(){
    if(active)return;
    ordinaryDraft=prompt.value;
    active=true;ordinary.hidden=true;transcript.hidden=false;banner.hidden=false;
  }
  function assertCanStage(){
    if(busy||send.dataset.transmissionState==='generating')throw new Error('Wait for or stop the current request first.');
    if(getMarrowlineAttachments().length)throw new Error('Send or remove the currently staged attachments first.');
    if(!active&&prompt.value.trim())throw new Error('Save or clear your ordinary chat draft before starting the Loom demo.');
    if(Date.now()>=activation.expires_at)throw new Error('This Loom transfer has expired. Prepare it again in Loom.');
  }
  async function stage(files){
    const state=await stageMarrowlineAttachments(files,{environment});
    staged=getMarrowlineAttachments();
    if(state.count!==files.length)throw new Error('Loom attachments could not be staged as one governed selection.');
  }
  async function stageAia(){
    try{
      if(phase!=='ARRIVED')return;
      assertCanStage();
      const file=new environment.File([JSON.stringify(activation,null,2)],'loom-portable-aia-activation.json',{type:'application/json'});
      await stage([file]);enter();pending='ACTIVATE';phase='AIA_STAGED';
      prompt.value='Receive the attached Loom Portable AIA. Acknowledge the task and rules, identify the pending selected files, and wait for my next turn.';
      consequence.textContent='Send attached Loom first. Then attach your files. The AIA carries governance and a prior-result commitment, but no selected-file contents.';
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
      consequence.textContent=`${files.length} selected Loom files staged. Send continues this governed task; local-only files remain excluded.`;
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
  function appendTurn(role,text){
    const card=element(doc,'article','',`relay-message loom-demo-message ${role}`);
    card.append(element(doc,'small',role==='user'?'YOU · LOOM DEMO':'LOOM DEMO · GOVERNED RESULT'),element(doc,'p',text));
    transcript.append(card);return card;
  }
  async function submit(){
    if(busy||destroyed)return;
    if(phase==='EXPIRED'||phase==='LEFT'){setStatus('Prepare a fresh Loom handoff before sending.');return;}
    const operation=pending||(['DONE'].includes(phase)?'CONTINUE':null);
    if(!operation){setStatus('Use + → Loom demo to select the next step.');return;}
    const operator_request=prompt.value.trim();if(!operator_request){setStatus('Enter the next Loom request before sending.');return;}
    let binding,controller;
    try{
      assertStaged();
      const request={schema:LOOM_DEMO_REQUEST_SCHEMA,request_id:environment.crypto.randomUUID(),phase:operation,activation,documents:operation==='CONTINUE'?packet.documents:[],operator_request,prior_result:operation==='CONTINUE'?latest:null,predecessor:operation==='CONTINUE'?predecessor:null};
      binding=await bindLoomDemoRequest(request,environment);
      busy=true;lastAttempt='PENDING';controller=new AbortController();pendingController=controller;
      send.type='button';send.textContent='■';send.setAttribute('aria-label','Stop Loom request');
      emit();setStatus('Loom demo · governed request pending');
      const deadline=environment.setTimeout(()=>controller.abort('deadline'),225000);
      let output;
      try{
        const response=await environment.fetch('/api/khonapolit?operation=loom-demo-task',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(request),signal:controller.signal});
        output=await response.json();ingestGeminiConsumption(output,environment);
        if(controller.signal.aborted||destroyed)throw new Error('Stopped waiting. No new result was admitted.');
        const failure=readLoomAiFailure(output,request.request_id);
        if(!response.ok||failure)throw new Error(describeLoomAiFailure(failure,response.status));
        if(JSON.stringify(output.loom_demo_binding)!==JSON.stringify(binding.receipt))throw new Error('The server binding did not match this request.');
        const returnedPredecessor=validateLoomDemoStageReceipt(output.loom_demo_stage_receipt,activation);
        const normalizedResult=loomDemoResult(output,binding.selected.documents);
        const expectedRequestDigest=await loomDemoDigest(request,environment);
        const expectedResultDigest=await loomDemoDigest(normalizedResult,environment);
        if(returnedPredecessor.phase!==operation||
          returnedPredecessor.request_id!==request.request_id||
          returnedPredecessor.request_digest!==expectedRequestDigest||
          returnedPredecessor.current_input_digest!==binding.governance.input_digest||
          returnedPredecessor.prior_result_digest!==binding.receipt.prior_result_digest||
          returnedPredecessor.result_digest!==expectedResultDigest)throw new Error('The server stage receipt did not match this request.');
        if(!binding.admit(normalizedResult).allowed)throw new Error('The returned result was held by the Loom governor.');
        predecessor=returnedPredecessor;
        lastAdmittedBindingReceipt=copy(binding.receipt);
      }finally{environment.clearTimeout(deadline);}
      if(destroyed||!active||controller.signal.aborted)return;
      lastAttempt='ADMITTED';
      appendTurn('user',operator_request);
      const card=appendTurn('assistant','');card.lastElementChild.remove();
      renderLoomAiResult(card,output,{selectedDocuments:binding.selected.documents,documentNames:new Map(packet.documents.map(document=>[document.id,document.name]))});
      const details=element(doc,'details','');details.append(element(doc,'summary','Inspect this request and result binding'),element(doc,'pre',JSON.stringify({binding:binding.receipt,response:output},null,2)));card.append(details);
      staged.forEach(item=>removeMarrowlineAttachment(item.id,environment));staged=[];pending=null;prompt.value='';
      if(operation==='ACTIVATE'){
        phase='AIA_SENT';consequence.textContent='AIA response admitted. Inspect what crossed in Loom Gate, then return to + → Loom demo → #2: Upload Loom demo files.';
        const inspectGate=button(doc,'Inspect #1 in Loom Gate',()=>{const target=gateTarget(doc);target?.click();target?.focus?.({preventScroll:true});});inspectGate.className='loom-demo-gate-next';card.append(inspectGate);
      }else{
        phase='DONE';latest=loomDemoResult(output,packet.documents);latestBinding?.governor.close();latestBinding=binding;lastAccepted=copy(latest);
        consequence.textContent='Loom rules govern this composer. Inspect continuity in Loom Gate, ask a follow-up, export the current work, or leave Loom mode.';
        const onward=button(doc,'Inspect continuity in Loom Gate',()=>{const target=gateTarget(doc);target?.click();target?.focus?.({preventScroll:true});});onward.className='loom-demo-gate-next';card.append(onward);
      }
      setStatus(operation==='ACTIVATE'?'AIA response admitted · now upload the selected Loom demo files':'Loom continuation admitted · latest result retained');
      card.scrollIntoView?.({block:'start',behavior:'auto'});
    }catch(error){
      lastAttempt='HELD';
      setStatus(`Loom demo held · ${controller?.signal.aborted?'Stopped waiting. The task and attachments remain available for an explicit retry.':error.message}`);
      // A held attempt cannot advance the two-step gate or replace the admitted
      // result/export. No automatic retry or local provider substitute.
    }finally{
      if(binding!==latestBinding)binding?.governor.close();
      busy=false;pendingController=null;send.type='submit';send.textContent='↑';send.setAttribute('aria-label','Send message');
      if(!destroyed){emit();prompt.focus?.({preventScroll:true});}
    }
  }
  let pendingController=null;
  function leaveDemo(){
    pendingController?.abort();latestBinding?.governor.close();
    staged.forEach(item=>removeMarrowlineAttachment(item.id,environment));staged=[];
    active=false;phase='LEFT';pending=null;
    ordinary.hidden=false;transcript.hidden=true;banner.hidden=true;prompt.value=ordinaryDraft??'';
    environment.history?.replaceState(null,'',environment.location.pathname+environment.location.search);
    setStatus('Ordinary Marrowline chat active. The Loom packet was not added to its history.');emit();
  }
  async function checkBinding(){
    try{
      if(!predecessor)throw new Error('Admit #1 before checking the file-bearing continuation.');
      const req={schema:LOOM_DEMO_REQUEST_SCHEMA,request_id:environment.crypto.randomUUID(),phase:'CONTINUE',activation,documents:packet.documents,operator_request:'Check the selected file binding locally.',prior_result:latest,predecessor};
      const binding=await bindLoomDemoRequest(req,environment);binding.governor.close();
      setStatus('Loom Gate local binding check passed · selected bytes and portable rules match · no provider call made');
    }catch(error){setStatus(`Loom Gate local binding held · ${error.message}`);}
  }
  function exportCurrent(){
    try{
      if(!active||Date.now()>=activation.expires_at)throw new Error('This Loom session is closed or expired. Prepare a fresh handoff before exporting.');
      const payload=exportLoomDemoCurrent(latestBinding);
      const url=environment.URL.createObjectURL(new environment.Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
      const link=element(doc,'a','');link.href=url;link.download='loom-current-portable-aia.json';doc.body.append(link);link.click();link.remove();
      environment.setTimeout(()=>environment.URL.revokeObjectURL(url),1500);
      setStatus('Current Loom Portable AIA exported. No onward execution occurred.');
    }catch(error){setStatus(`Loom export held · ${error.message}`);}
  }
  form.addEventListener('submit',event=>{if(!active)return;event.preventDefault();event.stopImmediatePropagation();void submit();},true);
  send.addEventListener('click',event=>{if(!active||!busy)return;event.preventDefault();event.stopImmediatePropagation();pendingController?.abort('operator-stop');},true);
  environment.addEventListener('td613:marrowline:loom-demo-open',openMenu);
  environment.addEventListener('td613:marrowline:loom-demo-close',()=>closeMenu({focusParent:false}));
  doc.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){event.preventDefault();closeMenu();}});
  doc.addEventListener('click',event=>{if(!menu.hidden&&!menu.contains(event.target)&&!byId(doc,'marrowlineContextLoom')?.contains(event.target))closeMenu({focusParent:false});});
  const expiry=environment.setTimeout(()=>{phase='EXPIRED';pendingController?.abort('expired');menuStatus.textContent='This transfer expired. Prepare a fresh handoff in Loom.';emit();},Math.max(0,activation.expires_at-Date.now()));
  environment.addEventListener('pagehide',()=>pendingController?.abort('pagehide'));
  const controller={openMenu,stageAia,stageFiles,submit,snapshot,exportPacket:()=>exportLoomDemoCurrent(latestBinding),getGateContinuity:()=>gateContinuity?.getCurrent?.()??null,destroy(){destroyed=true;environment.clearTimeout(expiry);leaveDemo();menu.remove();gateContinuity?.destroy?.();transcript.remove();banner.remove();}};
  environment.__TD613_LOOM_DEMO_CONTROLLER__=controller;
  environment.history?.replaceState(null,'',environment.location.pathname+environment.location.search+'#loom-demo');
  emit();setStatus(`${packet.documents.length} selected Loom files arrived · + → Loom demo · start with the Portable AIA`);
  return controller;
}

export async function bootMarrowlineLoomDemo(environment=window){
  const hash=environment.location.hash;
  const match=/^#loom=([a-f0-9]{48})$/.exec(hash);
  if(!match){
    if(hash==='#loom-demo')byId(environment.document,'khonapolitTerminalStatus').textContent='This local Loom session was interrupted or reloaded. Prepare a fresh handoff in Loom; no packet was silently restored.';
    return null;
  }
  environment.history.replaceState(null,'',environment.location.pathname+environment.location.search+'#loom-demo');
  try{return await installMarrowlineLoomDemo(await consumeLoomAiHandoff(match[1],environment),environment.document,environment);}
  catch(error){byId(environment.document,'khonapolitTerminalStatus').textContent=`Loom handoff held · ${error.message} Return to Loom to prepare it again.`;return null;}
}
