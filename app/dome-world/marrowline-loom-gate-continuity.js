export const MARROWLINE_LOOM_GATE_CONTINUITY_SCHEMA = 'td613.dome-world.marrowline-loom-gate-continuity/v0.1';

const copy = value => value == null ? value : JSON.parse(JSON.stringify(value));
const el = (doc, tag, text='', className='') => {
  const node=doc.createElement(tag); node.textContent=text; if(className)node.className=className; return node;
};
const button = (doc,label,action,className='') => {
  const node=el(doc,'button',label,className); node.type='button'; node.addEventListener('click',action); return node;
};
const digestShort = value => typeof value==='string' && value.length>18 ? `${value.slice(0,10)}…${value.slice(-6)}` : value || '—';

function ensureStylesheet(doc=document){
  const href=new URL('./marrowline-loom-gate-continuity.css',import.meta.url).href;
  let link=doc.querySelector('link[data-marrowline-loom-gate-continuity]');
  if(link)return link;
  link=doc.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.marrowlineLoomGateContinuity=MARROWLINE_LOOM_GATE_CONTINUITY_SCHEMA;doc.head.append(link);return link;
}

function phaseCopy(phase,lastAttempt,busy=false,continuations=0){
  if(busy)return {eyebrow:'PENDING · no new receiver binding yet',now:phase==='AIA_STAGED'?'The browser submitted #1 and is waiting for a receiver response that passes the route checks.':'The browser submitted the current governed continuation and is waiting for a receiver response that passes the route checks.',why:'Submission is an observed client event; it cannot be relabeled as server receipt or model completion before the bound result returns.',next:'Wait, Stop, or let the bounded request return.'};
  if(lastAttempt==='HELD')return {
    eyebrow:'HELD · stage did not advance',
    now:'The latest attempt did not become current.',
    why:'A held attempt cannot advance Loom stage, replace the bound receiver predecessor, or widen export authority.',
    next:'Repair or retry the same explicit gesture, or leave Loom mode.'
  };
  switch(phase){
    case 'ARRIVED': return {eyebrow:'ARRIVED · local handoff only',now:'Loom reached Marrowline. Nothing has been sent to the AI receiver.',why:'The browser holds the task, portable rules, selected-file bodies and commitments locally so you can inspect the route before a network gesture.',next:'Use + → Loom route → Setup · Attach Loom handoff.'};
    case 'AIA_STAGED': return {eyebrow:'STAGED · no network crossing yet',now:'The Loom handoff is attached and its prompt is prepared.',why:'Staging changes the local composer only. Explicit Send remains the consequential gesture.',next:'Review the attachment and prompt, then Send setup.'};
    case 'AIA_SENT': return {eyebrow:'RECEIVED #1 · governance acknowledgement bound',now:'A receiver response acknowledged the Loom handoff. Selected file bodies have not crossed in this stage.',why:'The local route binds this receiver acknowledgement before file-bearing continuation becomes eligible; foreign enforcement remains unobserved.',next:'Inspect this boundary here, then return to Chat to attach the selected files for continuation 1.'};
    case 'FILES_STAGED': return {eyebrow:'STAGED #2 · files prepared locally',now:'The selected Loom files are attached for the governed continuation.',why:'Their byte commitments were checked against the Loom manifest before this stage became sendable.',next:'Review the selected files and prompt, then explicitly Send continuation 1.'};
    case 'CONTINUING': return {eyebrow:'PENDING · governed continuation in flight',now:'The file-bearing continuation has been sent and is awaiting an admissible result.',why:'The previous bound receiver stage remains current while the new result is unresolved.',next:'Wait, Stop, or let the bounded request return.'};
    case 'DONE': return {eyebrow:`CONTINUATION ${continuations||1} · continuity bound locally`,now:'The selected-file receiver result is current for this Marrowline continuation.',why:'The browser route binds this result to the Loom activation and its immediate receiver predecessor; export may use that local binding without claiming foreign enforcement.',next:'Inspect continuity, export the current Loom Session, ask a follow-up, or return to Chat.'};
    case 'EXPIRED': return {eyebrow:'EXPIRED · route closed',now:'This Loom transfer can no longer accept another governed stage.',why:'Expiry prevents an old activation from silently becoming a fresh authority surface.',next:'Return to Holonomy Loom and prepare a fresh handoff.'};
    case 'LEFT': return {eyebrow:'REST · continuation ended',now:'The conversation remains in Marrowline; the Loom continuation has ended.',why:'Later ordinary replies cannot replace or export the closed governed result.',next:'Start a fresh Loom handoff only when you want to re-enter the governed route.'};
    default:return {eyebrow:'PREPARED',now:'Loom continuity is available for inspection.',why:'Gate reports only the stage evidence it has received.',next:'Continue with the next explicit operator gesture.'};
  }
}

function permissionCopy(phase,lastAttempt){
  if(lastAttempt==='HELD'&&phase==='DONE')return {state:'PRIOR EXPORT RETAINED',body:'The held follow-up earned no new authority and did not replace the current bound receiver result; export of that prior result remains available.'};
  if(lastAttempt==='HELD')return {state:'HELD',body:'No new permission was earned. The route remains at the last bound receiver stage.'};
  if(['ARRIVED','AIA_STAGED'].includes(phase))return {state:'FILES HELD',body:'#2 file-bearing continuation remains unavailable until #1 has a bound receiver-stage receipt.'};
  if(phase==='AIA_SENT')return {state:'FILES ELIGIBLE',body:'#2 may now be staged because the governance-first activation has a bound receiver predecessor.'};
  if(phase==='FILES_STAGED')return {state:'EXPORT HELD',body:'Selected files are staged, but export remains unavailable until their continuation result passes the route checks and is bound locally.'};
  if(phase==='CONTINUING')return {state:'PRIOR RESULT RETAINED',body:'The pending continuation cannot replace the previously bound receiver result until the new binding completes.'};
  if(phase==='DONE')return {state:'EXPORT ELIGIBLE',body:'The current bound receiver continuation may be exported; this does not widen foreign-host enforcement.'};
  return {state:'CLOSED',body:'No consequential Loom permission is currently available from this route.'};
}

export function deriveMarrowlineLoomGateContinuity({
  phase='ARRIVED',lastAttempt=null,busy=false,activation={},binding=null,predecessor=null,result=null,packet={},substantiveContinuationCount=0,contentPredecessorRequestId=null
}={}){
  const selected=Array.isArray(packet.documents)?packet.documents:[];
  const selectedNames=selected.map(item=>item?.name||item?.id).filter(Boolean);
  const selectedIds=selected.map(item=>item?.id).filter(Boolean);
  const withheld=activation?.governance?.withheld_document_count ?? packet?.governance?.withheld_document_count ?? null;
  const p=phaseCopy(phase,lastAttempt,busy,substantiveContinuationCount);
  const permission=permissionCopy(phase,lastAttempt);
  const networkGovernance=['AIA_SENT','FILES_STAGED','CONTINUING','DONE'].includes(phase);
  const fileBodiesCrossed=['CONTINUING','DONE'].includes(phase);
  const firstAdmitted=['AIA_SENT','FILES_STAGED','CONTINUING','DONE'].includes(phase);
  const secondAdmitted=phase==='DONE';

  const crossed=[];
  if(busy&&phase==='AIA_STAGED')crossed.push('Browser submission of #1 began; server receipt and receiver result remain unresolved.');
  else if(networkGovernance)crossed.push('Portable governance activation has a receiver response bound by this browser route.');
  else crossed.push('No Loom-demo receiver result has been bound by this route from this stage.');
  if(busy&&phase==='FILES_STAGED')crossed.push(`Browser submission of ${selected.length} selected file ${selected.length===1?'body':'bodies'} began; receiver result binding remains unresolved.`);
  else if(fileBodiesCrossed)crossed.push(`${selected.length} selected file ${selected.length===1?'body':'bodies'} crossed in the locally bound governed continuation.`);
  else crossed.push('Selected file bodies have not crossed in the current bound receiver stage.');

  const stayed=[];
  if(withheld!=null)stayed.push(`${withheld} Loom item${withheld===1?'':'s'} declared local/withheld remain outside this governed send.`);
  stayed.push('Ordinary Marrowline chat history and unrelated attachments are outside the Loom route.');

  const admitted=[];
  if(firstAdmitted)admitted.push('Stage #1 activation has a bound receiver predecessor receipt.');
  if(secondAdmitted)admitted.push('Stage #2 selected-file continuation is the current bound receiver result.');
  if(!admitted.length)admitted.push('No Loom-demo receiver result has been bound yet.');

  const unknown=[
    'The model provider’s internal reasoning and hidden state remain unobserved.',
    'Downstream retention or enforcement outside this Loom route is not established.',
    'Internal receipt consistency does not establish independent external origin.'
  ];

  const originDigest=activation?.governance?.input_digest ?? binding?.origin_input_digest ?? null;
  const currentDigest=binding?.current_input_digest ?? null;
  const predecessorRequest=predecessor?.request_id ?? null;
  const resultRequest=result?.request_id ?? null;
  const atlasSurvived=[
    originDigest ? `Origin input digest retained: ${digestShort(originDigest)}` : 'Origin input digest not yet available.',
    `Selected manifest retains ${selectedIds.length} declared file id${selectedIds.length===1?'':'s'}.`,
    predecessorRequest ? `Immediate receiver predecessor request: ${predecessorRequest}` : 'No receiver predecessor request yet.',
    resultRequest ? `Current receiver result request: ${resultRequest}` : 'No current receiver result yet.'
  ];

  return Object.freeze({
    schema:MARROWLINE_LOOM_GATE_CONTINUITY_SCHEMA,
    phase,lastAttempt,busy,
    pedagogue:Object.freeze({question:'What must the person understand now?',...p}),
    aperture:Object.freeze({
      question:'What can this stage actually witness?',
      observed:Object.freeze([...crossed,...admitted]),
      unresolved:Object.freeze(unknown)
    }),
    atlas:Object.freeze({
      question:'What relation survived the handoff?',
      finding:'Declared continuity is receiver-relative: matching Loom coordinates are preserved without claiming unseen forks or foreign-host authenticity.',
      survived:Object.freeze(atlasSurvived)
    }),
    fadt:Object.freeze({
      question:'Which permission depends on preserving this stage distinction?',
      state:permission.state,
      finding:permission.body
    }),
    crossed:Object.freeze(crossed),
    stayed:Object.freeze(stayed),
    admitted:Object.freeze(admitted),
    unknown:Object.freeze(unknown),
    technical:Object.freeze({
      activation_digest:activation?.activation_digest??null,
      origin_input_digest:originDigest,
      current_input_digest:currentDigest,
      predecessor_request_id:predecessorRequest,
      current_result_request_id:resultRequest,
      substantive_continuation_count:substantiveContinuationCount,
      content_predecessor_request_id:contentPredecessorRequestId,
      selected_ids:Object.freeze(selectedIds),
      selected_names:Object.freeze(selectedNames),
      withheld_document_count:withheld
    }),
    claimCeiling:'continuity-witness-for-the-declared-loom-to-marrowline-route; distinguishes-local-staging-network-send-receiver-binding-predecessor-and-export-eligibility; does-not-establish-provider-internals-foreign-host-enforcement-global-latest-state-or-external-origin',
    seal:'⟐'
  });
}

function list(doc,title,items,className){
  const section=el(doc,'section','',className);section.append(el(doc,'small',title));
  const ul=doc.createElement('ul');for(const item of items)ul.append(el(doc,'li',item));section.append(ul);return section;
}

export function installMarrowlineLoomGateContinuity({
  doc=document,root=window,activation={},packet={},onExport=()=>{},onLocalCheck=()=>{},onReturnToLoom=()=>{},onReturnToChat=()=>{}
}={}){
  const gate=doc.getElementById('gatePanel');
  const controls=gate?.querySelector('.gate-controls');
  if(!gate||!controls)return null;
  ensureStylesheet(doc);
  gate.dataset.loomContinuityActive='true';

  const section=el(doc,'section','','loom-gate-continuity');section.id='loomGateContinuity';section.setAttribute('aria-labelledby','loomGateContinuityTitle');
  const head=el(doc,'header','','loom-gate-continuity-head');
  head.append(el(doc,'small','Phase 2 · continuity witness'),el(doc,'h3','What crossed this Loom Gate?'));head.querySelector('h3').id='loomGateContinuityTitle';
  const state=el(doc,'p','','loom-gate-continuity-state');state.setAttribute('role','status');state.setAttribute('aria-live','polite');
  const now=el(doc,'div','','loom-gate-now');
  const nowLabel=el(doc,'small','NOW');
  const nowText=el(doc,'strong','');
  const why=el(doc,'p','');
  const next=el(doc,'p','','loom-gate-next');
  now.append(nowLabel,nowText,why,next);

  const consequenceGrid=el(doc,'div','','loom-gate-consequence-grid');
  const crossed=list(doc,'WHAT CROSSED',[],'loom-gate-consequence');
  const stayed=list(doc,'WHAT STAYED',[],'loom-gate-consequence');
  const admitted=list(doc,'WHAT THIS ROUTE BOUND LOCALLY',[],'loom-gate-consequence');
  const unknown=list(doc,'STILL UNKNOWN',[],'loom-gate-consequence');
  consequenceGrid.append(crossed,stayed,admitted,unknown);

  const roleDetails=doc.createElement('details');roleDetails.className='loom-gate-four-role';
  roleDetails.append(el(doc,'summary','Inspect the four-doll audit'));
  const roles=el(doc,'div','','loom-gate-role-grid');
  const roleNodes={};
  for(const [key,label] of [['pedagogue','Pedagogue'],['aperture','Aperture'],['atlas','Atlas'],['fadt','FADT']]){
    const card=el(doc,'article','','loom-gate-role');card.dataset.role=key;
    const title=el(doc,'strong',label);const question=el(doc,'small','');const body=el(doc,'p','');
    card.append(title,question,body);roles.append(card);roleNodes[key]={card,question,body};
  }
  roleDetails.append(roles);

  const technical=doc.createElement('details');technical.className='loom-gate-continuity-technical';
  technical.append(el(doc,'summary','Inspect continuity coordinates'),el(doc,'pre',''));
  const actions=el(doc,'div','','loom-gate-continuity-actions');
  const localCheck=button(doc,'Check selected-file binding locally',onLocalCheck,'loom-gate-secondary');localCheck.id='loomGateLocalCheck';
  const returnLoom=button(doc,'Return to original Loom tab',onReturnToLoom,'loom-gate-secondary');returnLoom.id='loomGateReturnToLoom';
  const back=button(doc,'Back to Chat',onReturnToChat,'loom-gate-secondary');back.id='loomGateBackToChat';
  const exportButton=button(doc,'Export current Loom Session',onExport,'loom-gate-primary');exportButton.id='loomGateExportCurrent';exportButton.disabled=true;
  actions.append(returnLoom,back,localCheck,exportButton);
  const actionStatus=el(doc,'p','','loom-gate-action-status');actionStatus.id='loomGateActionStatus';actionStatus.hidden=true;
  actionStatus.setAttribute('role','status');actionStatus.setAttribute('aria-live','polite');actionStatus.setAttribute('aria-atomic','true');

  const separator=el(doc,'aside','','loom-gate-adversarial-separator');
  separator.append(el(doc,'small','SEPARATE EXPERIMENT · DEFERRED'),el(doc,'strong','Adversarial boundary assay preserved for the later Gate pass'),el(doc,'p','The Local / Public / Operator armamentarium tests a different boundary. Phase 2 does not fire it. Its code remains intact for the later opsec/infosec redesign, and this continuity witness supplies it no empirical credit.'));

  section.append(head,state,now,consequenceGrid,roleDetails,technical,actions,actionStatus);
  controls.prepend(section);
  const adversarial=doc.getElementById('marrowlineGatePedagogue');
  const form=doc.getElementById('marrowlineForm');
  if(adversarial)controls.insertBefore(separator,adversarial);
  else if(form)controls.insertBefore(separator,form);
  else controls.append(separator);

  const replaceList=(host,items)=>{const ul=host.querySelector('ul');ul.replaceChildren(...items.map(item=>el(doc,'li',item)));};
  let current=null;
  const reportAction=(outcome,message)=>{
    if(!['PENDING','PASSED','HELD','DOWNLOAD_REQUESTED'].includes(outcome)||typeof message!=='string'||!message.trim())throw new TypeError('Gate action feedback requires a bounded outcome and message.');
    actionStatus.dataset.outcome=outcome;actionStatus.textContent=message;actionStatus.hidden=false;
  };
  const update=input=>{
    const previous=current;
    current=deriveMarrowlineLoomGateContinuity({...input,activation,packet});
    if(previous&&(previous.phase!==current.phase||previous.lastAttempt!==current.lastAttempt||previous.busy!==current.busy)){
      actionStatus.hidden=true;actionStatus.textContent='';delete actionStatus.dataset.outcome;
    }
    state.textContent=current.pedagogue.eyebrow;
    nowText.textContent=current.pedagogue.now;
    why.textContent=current.pedagogue.why;
    next.textContent=`NEXT · ${current.pedagogue.next}`;
    replaceList(crossed,current.crossed);replaceList(stayed,current.stayed);replaceList(admitted,current.admitted);replaceList(unknown,current.unknown);

    roleNodes.pedagogue.question.textContent=current.pedagogue.question;
    roleNodes.pedagogue.body.textContent=`${current.pedagogue.now} ${current.pedagogue.next}`;
    roleNodes.aperture.question.textContent=current.aperture.question;
    roleNodes.aperture.body.textContent=`${current.aperture.observed.join(' ')} Unresolved: ${current.aperture.unresolved.join(' ')}`;
    roleNodes.atlas.question.textContent=current.atlas.question;
    roleNodes.atlas.body.textContent=`${current.atlas.finding} ${current.atlas.survived.join(' ')}`;
    roleNodes.fadt.question.textContent=current.fadt.question;
    roleNodes.fadt.body.textContent=`${current.fadt.state} · ${current.fadt.finding}`;
    technical.querySelector('pre').textContent=JSON.stringify({schema:current.schema,phase:current.phase,technical:current.technical,claim_ceiling:current.claimCeiling},null,2);
    exportButton.disabled=current.phase!=='DONE'||current.busy;
    localCheck.disabled=!['AIA_SENT','FILES_STAGED','CONTINUING','DONE'].includes(current.phase)||current.busy;
    back.textContent=current.phase==='AIA_SENT'?'Back to Chat · do #2':current.phase==='DONE'?'Back to Chat · continue':'Back to Chat';
    gate.dataset.loomContinuityPhase=current.phase;
    gate.dataset.loomContinuityActive=String(!['LEFT','EXPIRED'].includes(current.phase));
    root.__TD613_MARROWLINE_LOOM_GATE_CONTINUITY__=copy(current);
    root.dispatchEvent?.(new root.CustomEvent('td613:marrowline:loom-gate-continuity',{detail:copy(current)}));
    return current;
  };
  const destroy=()=>{section.remove();separator.remove();delete gate.dataset.loomContinuityActive;delete gate.dataset.loomContinuityPhase;delete root.__TD613_MARROWLINE_LOOM_GATE_CONTINUITY__;};
  return Object.freeze({schema:MARROWLINE_LOOM_GATE_CONTINUITY_SCHEMA,update,reportAction,destroy,getCurrent:()=>copy(current)});
}
