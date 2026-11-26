/**
 * Vixen's two-role research adventure. All source analysis remains read-only.
 * An LLM may use the exported Podium handoff; the local browser guide does
 * not pretend to have a remote model attached.
 */
import {createVixenAiSession,formatVixenChatCard} from './vixen-ai-session.mjs';
import {collectVixenLocalExitBoundary,attachVixenLocalExitToArchive} from './vixen-local-exit.mjs';
import {
 readPodiumExcursionSnapshot,savePodiumExcursionSnapshot,clearPodiumExcursionSnapshot,
 readSalonManifestoDraft,saveSalonManifestoDraft
} from './vixen-shared-session-bridge.mjs';
const by=id=>document.getElementById(id);
const node=(tag,cls='',text='')=>{const e=document.createElement(tag);e.className=cls;e.textContent=text;return e};
const button=(label,fn,cls='vma-btn')=>{const e=node('button',cls,label);e.type='button';e.onclick=fn;return e};
function visit(room){
 if(room==='podium'||room==='podium-entrance'){
  const rel=room==='podium'?'./human-podium.html':'./podium.html';
  const cur=typeof location!=='undefined'?location.pathname:'';
  if(cur.includes('/vix-cyb/'))location.href=rel;
  else location.href='./vix-cyb/'+rel.slice(2);
  return;
 }
 if(!['overview','observatory','works','gates','protocols','holds','collection','reference','operator'].includes(room))return;
 const railBtn=document.querySelector('#vixenRoomRail [data-view="'+room+'"]')||
  document.querySelector('button[data-view="'+room+'"]');
 if(railBtn){railBtn.click();return}
 if(typeof location!=='undefined'){
  location.href=(location.pathname.includes('/vix-cyb/')?'../vix-cyb.html#':'#')+room;
 }
}
function download(content,name,type='application/json'){
 const u=URL.createObjectURL(new Blob([content],{type}));
 const a=document.createElement('a');a.href=u;a.download=name;
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),300);
}
export function mountVixenAiJourney(host=by('vixenAiJourney')){
 if(!host)return Object.freeze({mounted:false});
 let corpus;
 try{
  corpus=JSON.parse(by('vixen-corpus-bundle').textContent);
  if(corpus.works.length!==32)throw Error('CENSUS_UNVERIFIED');
 }catch(_){host.replaceChildren(node('p','vma-failure','The local catalogue is unavailable; research guidance is held.'));return {mounted:false}}
 const directConsent=Symbol('DIRECT_VISITOR_NOTES_OPT_IN');
 let podiumPromise=null,role=null,active=false,busy=false,pendingQuest=null,lastArchive=null,lastNotes=null;
 let finalExportRequested=false;
 const read=async({intent,params})=>{
  if(!window.VixenReference?.podium)return {status:'HELD',result:{state:'READER_NOT_ATTACHED'}};
  try{
   podiumPromise ||= window.VixenReference.podium({operatorAuthorized:false});
   const podium=await podiumPromise;
   return await podium.dispatch({schema:'td613.vixen.podium.task/v1',intent,params});
  }catch(_){return {status:'HELD',result:{state:'READ_ONLY_HOST_FAILED_CLOSED'}}}
 };
 const session=createVixenAiSession({
  corpus,readCart:()=>window.VIXEN_STUDY_TRAY?.list?.()||[],
  verifyProgramNotesConsent:({proof})=>proof===directConsent,hostRead:read
 });
 const announce=msg=>{by('vmaStatus').textContent=msg};
 const lock=async fn=>{
  if(busy)return;busy=true;host.setAttribute('aria-busy','true');
  try{await fn()}finally{busy=false;host.removeAttribute('aria-busy')}
 };
 const reportPanel=by('vmaReportPanel');
 function resumeDock(){
  const d=by('vmaJourneyDock');
  const podiumHidden=by('view-podium')?by('view-podium').hidden:true;
  if(d)d.hidden=!active||!podiumHidden;
 }
 function ensureComposerWorkbench(){
  let wb=by('vmaComposerWorkbench');
  if(wb)return wb;
  const play=by('vmaPlayPanel');
  if(!play)return null;
  wb=node('section','vma-panel vma-composer-workbench');
  wb.id='vmaComposerWorkbench';
  wb.hidden=true;
  wb.setAttribute('aria-label','Composer bilateral and Podium Score workbench');
  const title=node('h4','vma-section-title','Composer Workbench · Cross-Work Hypothesis & Podium Score');
  const sub=node('p','vma-muted','Stage any pair (or Cart Works), compare forward vs refracted readings, and compute a read-only Podium Score (empirical credit: 0 · human closure reserved).');
  const grid=node('div','vma-comp-grid');
  const mkSel=(labelText,id,defIdx)=>{
   const wrap=node('div');
   const lbl=node('label','',labelText);lbl.htmlFor=id;
   const sel=node('select');sel.id=id;sel.className='vma-comp-select';
   corpus.works.forEach((w,i)=>{
    const opt=node('option','',String(i+1).padStart(2,'0')+' · '+(w.display_title||w.declared_title)+' ['+(w.linked_sources?.[0]?.original_filename||w.work_id)+']');
    opt.value=w.work_id;if(i===defIdx)opt.selected=true;sel.append(opt);
   });
   wrap.append(lbl,sel);return wrap;
  };
  grid.append(mkSel('Work I','vmaCompWorkA',1),mkSel('Work II','vmaCompWorkB',Math.min(2,corpus.works.length-1)));
  const qLbl=node('label','','Falsifiable question & counterworld');qLbl.htmlFor='vmaCompQuestion';
  const qIn=node('textarea');qIn.id='vmaCompQuestion';qIn.rows=2;qIn.maxLength=600;
  qIn.placeholder='Enter a hypothesis linking selected Works or Cart items…';
  const cIn=node('input');cIn.id='vmaCompCounterworld';cIn.type='text';cIn.maxLength=400;
  cIn.placeholder='Optional counterfactual / rival explanation…';
  const lagWrap=node('div','vma-inline');
  const lagLbl=node('span','vma-muted','Vernier lag ticks: 36');
  const lagRange=node('input');lagRange.id='vmaCompLag';lagRange.type='range';lagRange.min='4';lagRange.max='72';lagRange.step='2';lagRange.value='36';
  lagRange.style.width='160px';
  lagRange.addEventListener('input',()=>{lagLbl.textContent='Vernier lag ticks: '+lagRange.value});
  lagWrap.append(lagLbl,lagRange);
  const row=node('div','vma-inline');
  const composeBtn=button('Compose & Refract Hypothesis',async()=>{
   const wA=by('vmaCompWorkA')?.value,wB=by('vmaCompWorkB')?.value;
   if(!wA||!wB||wA===wB){announce('Choose two distinct Works in Composer Workbench.');return}
   try{
    const eng=await import('./synthesis-salon-engine.mjs');
    const plan=eng.composeSalonPlan(corpus,{work_ids:[wA,wB],question:qIn.value,counterworld:cIn.value,lag_ticks:Number(lagRange.value||36)});
    const ref=eng.refractSalonPlan(corpus,{work_ids:[wA,wB],question:qIn.value,counterworld:cIn.value,lag_ticks:Number(lagRange.value||36)});
    wb._lastPlan={plan,refraction:ref};
    out.textContent=[
     'FORWARD PROPOSAL: '+plan.question,
     'EXPRESSION: '+plan.suggested_theoretical_relation,
     'FALSIFIER: '+plan.counterfactual,
     'REFRACTION DELTA: '+ref.notice,
     'MISSING EVIDENCE: '+plan.missing_evidence.slice(0,2).join(' | ')
    ].join('\n\n');
    announce('Composer bilateral + refracted plan computed.');
   }catch(e){out.textContent='Composer plan held: '+(e?.message||String(e));}
  },'vma-small vma-primary');
  const scoreBtn=button('Compute Podium Score & Gate',async()=>{
   try{
    const pcs=await import('./podium-composition-score.mjs');
    const gate=await pcs.reachPodiumComposeGate(corpus,{research_question:qIn.value||by('vmaGoal')?.value||'',lag_ticks:Number(lagRange.value||36)});
    wb._lastScore=gate;
    const sc=gate.score;
    out.textContent=[
     'COMPOSE GATE: '+gate.status+' (stop: '+gate.stop+')',
     'SCORE SHA-256: '+gate.score_sha256,
     'LEADING SYNTHESIS: '+sc.synthesis.selected.id+' ('+sc.synthesis.selected.score+') — '+sc.synthesis.selected.title,
     'PROPOSED VISUAL ARCHITECTURE: '+sc.visuals.selected.id+' (fitness '+sc.visuals.selected.fitness+')',
     'HUMAN CLOSURE REQUIRED: '+sc.composer_closure+' · empirical_credit: '+sc.empirical_replication_credit
    ].join('\n');
    announce('Podium Score computed cleanly; Compose remains held for human authorization.');
   }catch(e){out.textContent='Podium Score held: '+(e?.message||String(e));}
  },'vma-small');
  const projectBtn=button('Project to Salon Manifesto',()=>{
   const wA=by('vmaCompWorkA')?.value,wB=by('vmaCompWorkB')?.value;
   const qText=qIn.value||by('vmaGoal')?.value||'';
   const lagVal=Number(lagRange.value||36);
   saveSalonManifestoDraft({
    question:qText,
    works:[wA,wB].filter(Boolean),
    lagTicks:lagVal,
    activePlan:wb._lastPlan?.plan||null,
    refraction:wb._lastPlan?.refraction||null,
    origin:'HUMAN_PODIUM_COMPOSER'
   });
   window.dispatchEvent(new CustomEvent('vixen:synthesis-updated',{detail:{
    works:[wA,wB].filter(Boolean),lag:lagVal,
    question:qText,activePlan:wb._lastPlan?.plan||null
   }}));
   announce('Projected Composer thesis to Salon Manifesto (saved in browser session).');
  },'vma-small vma-quiet');
  const out=node('div','vma-comp-output','Composer idle · draft a hypothesis or compute a read-only Podium Score.');
  row.append(composeBtn,scoreBtn,projectBtn);
  wb.append(title,sub,grid,qLbl,qIn,cIn,lagWrap,row,out);
  const insertBefore=by('vmaComparativeFieldLab')||play.querySelector('.vma-exit');
  if(insertBefore)play.insertBefore(wb,insertBefore);else play.append(wb);
  return wb;
 }
 function render(){
  const state=session.status(),item=state.status==='SUPPORTED'?state.result:null;
  const handoff=active?session.handoff().result:null;
  by('vmaStartPanel').hidden=active;by('vmaPlayPanel').hidden=!active;
  by('vmaEndSummary').hidden=!lastArchive||active;
  by('vmaChapter').textContent='CHAPTER '+String(item?.history_length||0).padStart(2,'0');
  by('vmaCurrentRole').textContent=role?role+' · ROLE LOCKED':'CHOOSE YOUR ROLE';
  const wb=ensureComposerWorkbench();
  if(wb)wb.hidden=!active||role!=='COMPOSER';
  resumeDock();window.dispatchEvent(new CustomEvent('vixen-maestro-session-state',
   {detail:{active,role}}));if(!active)return;
  const story=by('vmaStory');
  story.replaceChildren(node('span','vma-kicker',role==='MAESTRO'?'THE RESEARCH ADVENTURE':'THE INTERPRETIVE STUDIO'));
  story.append(node('h3','vma-story',handoff?.narrative?.opening||
   'The collection is open. Choose a trail and the guide will prepare its documentary leads.'));
  story.append(node('p','vma-hook',handoff?.narrative?.cliffhanger||
   'There are multiple promising directions. Which should we explore first?'));
  story.append(node('p','vma-limit','Local guided preview; use the AI handoff for live-model narration. Recorded source links are distinct from proven relationships.'));
  const moves=by('vmaMoves');moves.replaceChildren(node('h4','vma-section-title','Choose the next scene'));
  const choices=handoff?.next_choices?.length?handoff.next_choices:
   (item.chat_card?.choices||[]).map(x=>({choice_id:x.id,title:x.title,why:x.description,
   suggested_work_id:x.suggested_work_id,question:x.question}));
  for(const [i,x] of choices.slice(0,5).entries()){
   moves.append(button(String(i+1).padStart(2,'0')+'  '+x.title+' · '+x.why,()=>lock(async()=>{
    const z=await session.choose({choice_id:x.choice_id,
     source_work_id:x.suggested_work_id||null,question:x.question||''});
    announce(z.status==='SUPPORTED'?'A fresh source-grounded research chapter is ready.':
     'Held · '+(z.result?.reason||'no qualified route'));render();
   }),'vma-choice'));
  }
  const sources=by('vmaSources');sources.replaceChildren(node('h4','vma-section-title','The source trail'));
  const list=handoff?.source_candidates||[];
  if(!list.length)sources.append(node('p','vma-muted','A source trail appears when the journey opens.'));
  for(const w of list.slice(0,4)){
   const box=node('article','vma-source');
   const filesLine=(w.manifestations||[]).map(m=>m.filename).filter(Boolean).join(' · ');
   const firstSourceId=w.manifestations?.[0]?.source_file_id||null;
   box.append(node('span','vma-micro',w.cluster||'SOURCE'),
    node('h5','',w.title));
   if(filesLine)box.append(node('p','vma-source-files','Received: '+filesLine));
   box.append(node('p','',w.provenance_reason?.join(' · ')||'Recorded source awaiting further examination'));
   const row=node('div','vma-inline');
   row.append(button('Read the work',()=>{
      const opened=window.VixenReference?.openWork?.(w.work_id);
      if(!opened?.opened)visit('works');
     },'vma-small'));
   if(firstSourceId){
    row.append(button('Peek passage',async(ev)=>{
     const btnEl=ev.currentTarget;
     let peek=box.querySelector('.vma-passage-peek');
     if(peek){peek.hidden=!peek.hidden;btnEl.textContent=peek.hidden?'Peek passage':'Hide passage';return}
     btnEl.textContent='Loading…';
     try{
      const mod=await import('./corpus-experiment-a.mjs');
      const rec=await mod.loadExperimentABodyBySourceId(firstSourceId);
      const body=typeof rec?.text_body==='string'?rec.text_body:'';
      peek=node('pre','vma-passage-peek',body?body.slice(0,950)+(body.length>950?'\n… [open Works reader for full text]':''):'Original text unavailable: '+(rec?.custody_status||'NO_RECORDED_BODY'));
      box.append(peek);btnEl.textContent='Hide passage';
     }catch(_){btnEl.textContent='Passage held';}
    },'vma-small vma-quiet'));
   }
   row.append(button('Save to cart',()=>{
     const tray=window.VIXEN_STUDY_TRAY;
     const added=tray?.add?.(w.work_id);
     announce(added?'Saved to the local research cart.':'Already saved or not available.');
     render();
    },'vma-small vma-quiet'));
   box.append(row);sources.append(box);
  }
  const readResults=handoff?.observed_reads||[];
  sources.append(node('p','vma-muted','Read checks: '+
   readResults.filter(x=>x.status==='OBSERVED_READ_ONLY').length+' supported; '+
   readResults.filter(x=>x.status!=='OBSERVED_READ_ONLY').length+
   ' held or unconnected. Neither establishes influence or authorship.'));
  const boundary=handoff?.selection_execution_boundary;
  if(boundary?.selected_work_id){
   const title=id=>{
    const w=corpus.works.find(w=>w.work_id===id);
    return w?.display_title||w?.declared_title||'Unresolved record';
   };
   const actuallyChecked=boundary.observed_work_ids||[];
   const followedRival=boundary.inspection_status==='SELECTED_SOURCE_NOT_INSPECTED_RIVAL_READ';
   sources.append(node('p','vma-muted',
    'Your selected work: '+title(boundary.selected_work_id)+
    '. Catalog records actually checked: '+
    (actuallyChecked.length?actuallyChecked.map(title).join(' · '):'None qualified on this turn')+'. '+
    (followedRival?'The guide checked a different work for its countertest. ':'')+
    'A selection, a catalog check, and a full-text reading are different evidence.'));
  }
  const tasks=by('vmaMissions');tasks.replaceChildren(node('h4','vma-section-title','Field missions · all optional'));
  for(const q of handoff?.quests||[]){
   const x=node('article','vma-quest');
   x.append(node('span','vma-actor',q.actor==='AI'?'THE AI INVESTIGATES':
    q.actor==='HUMAN'?'YOUR MOVE':'TOGETHER'),
    node('h5','',q.title),node('p','',q.description));
   const row=node('div','vma-inline');
   if(q.actor==='AI')row.append(node('span','vma-muted',
    q.execution_status==='READ_ONLY_INSPECTION_RECEIPTED'?
    'A read-only source check was recorded.':'A proposed check; model or reader not connected.'));
   else{
    row.append(button('Open mission room',()=>{
      if(q.suggested_view==='works'&&q.target_work_id){
       if(window.VixenReference?.openWork?.(q.target_work_id)?.opened)return;
      }
      visit(q.suggested_view||'reference');
     },'vma-small'));
    row.append(button('Report a clue',()=>{
     pendingQuest=q.quest_id;by('vmaReportTitle').textContent=q.title;
     by('vmaReportText').value='';reportPanel.hidden=false;by('vmaReportText').focus();
    },'vma-small vma-quiet'));
    row.append(button('Skip',()=>lock(async()=>{
     await session.report({quest_id:q.quest_id,skip:true});announce('Mission skipped without penalty.');render();
    }),'vma-small vma-subtle'));
   }
   x.append(row);tasks.append(x);
  }
  const cart=by('vmaCart');
  const saved=window.VIXEN_STUDY_TRAY?.list?.()||[];
  cart.replaceChildren(node('h4','vma-section-title','Your research cart'),
    node('p','vma-muted',saved.length+' selections · added only by your actions'));
  for(const id of saved.slice(0,9)){
   const w=corpus.works.find(x=>x.work_id===id),p=corpus.instruments.find(x=>x.instrument_id===id);
   cart.append(node('div','vma-saved',w?.display_title||w?.declared_title||p?.title||p?.name||id));
  }
  const permission=item.program_notes_permission;
  by('vmaNotesRequest').hidden=permission==='GRANTED';
  by('vmaNotesApprove').hidden=permission!=='AWAITING_HUMAN_PERMISSION';
  by('vmaNotesRevoke').hidden=permission!=='GRANTED';
  by('vmaNotesState').textContent=permission==='GRANTED'?
   'Notes ON · future turns only':'Notes OFF · separate permission required before authoring';
  const notes=by('vmaNotesView');notes.replaceChildren();
  const n=session.notes();
  for(const e of n.status==='SUPPORTED'?n.result.entries:[]){
   notes.append(node('p','vma-note',(e.title||'Research route')+' · '+
    (e.draft||e.visitor_observation||e.highlighted_work||'Structured local outline')));
  }
 }
 host.querySelectorAll('[data-vma-role]').forEach(x=>x.addEventListener('click',()=>{
  if(active)return;role=x.dataset.vmaRole;
  host.querySelectorAll('[data-vma-role]').forEach(z=>z.setAttribute('aria-pressed',String(z===x)));
  by('vmaStart').disabled=false;announce('Role selected: '+role+'.');
 }));
 by('vmaStart').addEventListener('click',()=>lock(async()=>{
  if(!role)return;
  if(lastArchive&&!finalExportRequested&&
    lastArchive.operator_side_receipts?.has_completed_receipts&&
    !window.confirm('The last session archive contains completed local field receipts and has not been exported. Discard it and begin a new role session?'))return;
   const v=await session.start({role,goal:by('vmaGoal').value.slice(0,300)});
  if(v.status==='SUPPORTED'){
   lastArchive=null;lastNotes=null;finalExportRequested=false;
   active=true;announce('Your ontological role is locked for this session.');render();
   persistExcursion({excursionInFlight:false});
   by('vmaRestoreBanner')&&(by('vmaRestoreBanner').hidden=true);
  }
  else announce('Held · '+(v.result?.reason||'session unavailable'));
 }));
 by('vmaReportSubmit').addEventListener('click',()=>lock(async()=>{
  const v=await session.report({quest_id:pendingQuest,observation:by('vmaReportText').value.slice(0,1200)});
  if(v.status!=='SUPPORTED'){announce('Held · '+(v.result?.reason||'observation missing'));return}
  pendingQuest=null;reportPanel.hidden=true;
  announce('Your reported clue triggered a new rival-reading research branch. The report remains unverified.');render();
 }));
 by('vmaReportCancel').addEventListener('click',()=>{pendingQuest=null;reportPanel.hidden=true});
 by('vmaNotesRequest').addEventListener('click',()=>lock(async()=>{
  const v=await session.permission({phase:'request'});
  announce(v.result?.request||'Approve future notes only if you wish.');render();
 }));
 by('vmaNotesApprove').addEventListener('click',()=>lock(async()=>{
  const v=await session.permission({phase:'grant',proof:directConsent});
  announce(v.status==='SUPPORTED'?'Future Program Notes are enabled.':'Permission held.');render();
 }));
 by('vmaNotesRevoke').addEventListener('click',()=>lock(async()=>{
  await session.permission({phase:'revoke'});announce('Future note authoring stopped.');render();
 }));
 by('vmaCopyAi').addEventListener('click',()=>lock(async()=>{
  const h=session.handoff(),s=session.status();
  if(h.status!=='SUPPORTED')return;
  const prompt=['# Vixen guided research handoff',
   'The visitor selected an exclusive session role. Actively investigate source-backed leads, generate competing interpretations, and send optional human quests. Treat visitor reports as unverified. Source relations, authorship and independent scientific corroboration cannot be inferred from retrieval. Program Notes require separately verified permission; do not infer consent from this handoff.',
   formatVixenChatCard(s.result.chat_card),'Machine-readable research context:',
   JSON.stringify(h.result,null,2)].join('\n\n');
  let okay=false;
  try{await navigator.clipboard.writeText(prompt);okay=true}catch(_){}
  if(okay)announce('Briefing copied. Paste it into an AI chat for live-model collaboration.');
  else{const p=by('vmaCopyFallback');p.value=prompt;p.hidden=false;p.focus();p.select();
   announce('Copy the briefing from the selected text field.');}
 }));
 by('vmaSave').addEventListener('click',()=>{
  const v=session.archive();if(v.status!=='SUPPORTED')return;
  download(JSON.stringify(v.result,null,2)+'\n','vixen-research-journey.json');
  announce('Local research archive exported; no external upload or corpus write.');
 });
 by('vmaDownloadNotes').addEventListener('click',()=>{
  const v=session.notes();if(v.status!=='SUPPORTED'){announce('Program Notes have not been authorized.');return}
  const text=['# Vixen Program Notes · '+role,'',
   'Provisional editorial notes; source connections are not adjudicated.',
   ...v.result.entries.flatMap(x=>['','## '+x.title,x.draft||x.visitor_observation||
    x.highlighted_work||'Local structured research outline','Evidence limit: '+x.claim_ceiling])].join('\n');
  download(text,'vixen-program-notes.md','text/markdown;charset=utf-8');
 });
 by('vmaEnd').addEventListener('click',()=>{
  // Capture completed optional reports BEFORE the role-change event erases
  // their local state. Unsent draft bytes never join any exported archive.
  const boundary=collectVixenLocalExitBoundary({
   source_challenge:window.VixenSourceChallenge,
   comparative_field:window.VixenComparativeFieldTrial
  });
  if(boundary.has_unsent_drafts &&
      !window.confirm('Unsubmitted research fields remain in this Maestro session. End the session and discard those unsent drafts?')) {
   announce('Role exit canceled. Your unsent browser fields remain available.');return;
  }
  if(Object.values(boundary.observations).some(x=>x==='HELD_SIDE_RECEIPT_OR_DRAFT_STATUS_INVALID')){
   announce('Role exit held: a local source-receipt interface could not be verified.');return;
  }
  lastNotes=session.notes().status==='SUPPORTED'?session.notes().result:null;
  const ended=session.finish();
  if(ended.status!=='SUPPORTED'){
   announce('Role exit held · '+(ended.result?.reason||'archive unavailable'));return;
  }
  lastArchive=attachVixenLocalExitToArchive(ended.result.archive,boundary);
  finalExportRequested=false;
  active=false;role=null;pendingQuest=null;
  by('vmaStart').disabled=true;reportPanel.hidden=true;
  host.querySelectorAll('[data-vma-role]').forEach(x=>x.setAttribute('aria-pressed','false'));
  announce(boundary.has_completed_receipts?
   'Session ended. Completed browser field receipts are included in the final local archive. Download it before starting another session.':
   'Session ended. Your final archive is available for local download; no role or notes consent will auto-restore.');
  render();
 });
 by('vmaSaveFinal').addEventListener('click',()=>{
   if(!lastArchive)return;
   download(JSON.stringify(lastArchive,null,2)+'\n','vixen-completed-research-journey.json');
   finalExportRequested=true;
   announce('Final archive download requested; local side receipts, if any, remain marked browser-untrusted. No upload or restoration occurred.');
 });
 by('vmaDownloadFinalNotes').addEventListener('click',()=>{
   if(!lastNotes){announce('No Program Notes were authorized for that journey.');return}
   const content=['# Program Notes from a completed journey','',
    'Provisional editorial notes: no source relationship or empirical result is adjudicated.',
    ...lastNotes.entries.flatMap(n=>['','## '+n.title,
      n.draft||n.visitor_observation||n.highlighted_work||'Local structured outline'])].join('\n');
   download(content,'vixen-completed-program-notes.md','text/markdown;charset=utf-8');
 });
 const buildExcursionSnapshot=({excursionInFlight=false,sourceWorkId=null}={})=>{
  if(!active)return null;
  const wb=by('vmaComposerWorkbench');
  return {
   active:true,role,goal:by('vmaGoal')?.value||'',
   tab:role==='COMPOSER'?'composer':'maestro',
   excursion_in_flight:Boolean(excursionInFlight),
   source_work_id:sourceWorkId||null,
   ai_session:session.exportSnapshot(),
   composer_draft:wb?{
    workA:by('vmaCompWorkA')?.value||'',
    workB:by('vmaCompWorkB')?.value||'',
    question:by('vmaCompQuestion')?.value||'',
    counterworld:by('vmaCompCounterworld')?.value||'',
    lag:by('vmaCompLag')?.value||'36',
    output:wb.querySelector('.vma-comp-output')?.textContent||''
   }:null,
   comparative_field:window.VixenComparativeFieldTrial?.exportSnapshot?.()||null,
   source_challenge:window.VixenSourceChallenge?.exportSnapshot?.()||null
  };
 };
 let excursionFlag=false,excursionWorkId=null;
 const persistExcursion=(opts={})=>{
  const snap=buildExcursionSnapshot({
   excursionInFlight:opts.excursionInFlight!==undefined?opts.excursionInFlight:excursionFlag,
   sourceWorkId:opts.sourceWorkId!==undefined?opts.sourceWorkId:excursionWorkId
  });
  if(snap)savePodiumExcursionSnapshot(snap);
  return snap;
 };
 const restoreFromSnapshot=(snap)=>{
  if(!snap?.active||!snap?.ai_session)return false;
  excursionFlag=false;excursionWorkId=null;
  const restored=session.restoreSnapshot(snap.ai_session);
  if(restored.status!=='SUPPORTED')return false;
  role=restored.result.role;
  active=Boolean(restored.result.active);
  lastArchive=null;lastNotes=null;finalExportRequested=false;
  if(typeof snap.goal==='string'&&by('vmaGoal'))by('vmaGoal').value=snap.goal;
  host.querySelectorAll('[data-vma-role]').forEach(z=>z.setAttribute('aria-pressed',String(z.dataset.vmaRole===role)));
  by('vmaStart').disabled=!role;
  render();
  const cd=snap.composer_draft;
  if(cd){
   if(cd.workA&&by('vmaCompWorkA'))by('vmaCompWorkA').value=cd.workA;
   if(cd.workB&&by('vmaCompWorkB'))by('vmaCompWorkB').value=cd.workB;
   if(typeof cd.question==='string'&&by('vmaCompQuestion'))by('vmaCompQuestion').value=cd.question;
   if(typeof cd.counterworld==='string'&&by('vmaCompCounterworld'))by('vmaCompCounterworld').value=cd.counterworld;
   if(cd.lag&&by('vmaCompLag'))by('vmaCompLag').value=cd.lag;
   const outEl=by('vmaComposerWorkbench')?.querySelector('.vma-comp-output');
   if(outEl&&cd.output)outEl.textContent=cd.output;
  }
  if(snap.comparative_field)window.VixenComparativeFieldTrial?.restoreSnapshot?.(snap.comparative_field);
  if(snap.source_challenge)window.VixenSourceChallenge?.restoreSnapshot?.(snap.source_challenge);
  if(by('vmaRestoreBanner'))by('vmaRestoreBanner').hidden=true;
  window.VixenSetPodiumTab?.(role==='COMPOSER'?'composer':'maestro');
  announce('Restored paused '+role+' session.');
  return true;
 };
 const applySalonDraft=()=>{
  const draft=readSalonManifestoDraft();
  if(!draft)return;
  if(draft.question&&by('vmaGoal')&&!by('vmaGoal').value)by('vmaGoal').value=String(draft.question).slice(0,300);
  const wb=ensureComposerWorkbench();
  if(wb){
   if(Array.isArray(draft.works)){
    if(draft.works[0]&&by('vmaCompWorkA'))by('vmaCompWorkA').value=draft.works[0];
    if(draft.works[1]&&by('vmaCompWorkB'))by('vmaCompWorkB').value=draft.works[1];
   }
   if(draft.question&&by('vmaCompQuestion')&&!by('vmaCompQuestion').value)by('vmaCompQuestion').value=String(draft.question).slice(0,600);
   if(draft.lagTicks&&by('vmaCompLag'))by('vmaCompLag').value=String(draft.lagTicks);
  }
  const carriedBanner=by('vmaCarriedSalonDraft');
  if(carriedBanner&&draft.question){
   carriedBanner.hidden=false;
   carriedBanner.textContent='Carried draft from Synthesis Salon: '+String(draft.question).slice(0,160);
  }
 };
 by('vmaEnd')?.addEventListener('click',()=>clearPodiumExcursionSnapshot());
 by('vmaJourneyDock')?.addEventListener('click',()=>visit('podium'));
 const podiumRoom=by('view-podium');
 if(podiumRoom){
  const navigationObserver=new MutationObserver(resumeDock);
  navigationObserver.observe(podiumRoom,{attributes:true,attributeFilter:['hidden']});
 }
 window.addEventListener('vixen:podium-select-role',(ev)=>{
  const nextRole=ev?.detail?.role;
  if(active||!['MAESTRO','COMPOSER'].includes(nextRole))return;
  role=nextRole;
  host.querySelectorAll('[data-vma-role]').forEach(z=>z.setAttribute('aria-pressed',String(z.dataset.vmaRole===role)));
  by('vmaStart').disabled=false;
  announce('Role selected: '+role+'.');
 });
 window.addEventListener('vixen:project-manifesto-to-podium',(ev)=>{
  const d=ev?.detail||{};
  if(d.question&&by('vmaGoal'))by('vmaGoal').value=String(d.question).slice(0,300);
  if(d.question&&by('vmaCompQuestion'))by('vmaCompQuestion').value=String(d.question).slice(0,600);
  if(Array.isArray(d.works)){
   if(d.works[0]&&by('vmaCompWorkA'))by('vmaCompWorkA').value=d.works[0];
   if(d.works[1]&&by('vmaCompWorkB'))by('vmaCompWorkB').value=d.works[1];
  }
  if(!active){
   role='COMPOSER';
   host.querySelectorAll('[data-vma-role]').forEach(z=>z.setAttribute('aria-pressed',String(z.dataset.vmaRole==='COMPOSER')));
   by('vmaStart').disabled=false;
  }
 });
 document.addEventListener('click',()=>requestAnimationFrame(()=>{resumeDock();if(active&&!excursionFlag)persistExcursion({excursionInFlight:false});}),{capture:true});
 window.addEventListener('pagehide',()=>{if(active)persistExcursion();});
 window.addEventListener('hashchange',resumeDock);
 window.addEventListener('vixen-study-tray-change',()=>{if(active)render()});
 applySalonDraft();
 render();announce('Choose Maestro or Composer. Notes begin OFF.');
 const existingExcursion=readPodiumExcursionSnapshot();
 const urlParams=typeof location!=='undefined'?new URLSearchParams(location.search):null;
 const isExcursionResume=urlParams?.get('resume')==='1';
 const isFromSalon=urlParams?.get('from')==='salon';
 if(isFromSalon&&!isExcursionResume&&!active){
  role='COMPOSER';
  host.querySelectorAll('[data-vma-role]').forEach(z=>z.setAttribute('aria-pressed',String(z.dataset.vmaRole==='COMPOSER')));
  by('vmaStart').disabled=false;
  announce('Composer preselected with Salon Manifesto draft. Press Begin to lock session.');
 }
 const api=Object.freeze({mounted:true,roles:['MAESTRO','COMPOSER'],model_connected:false,
  read_only:true,session,
  persistForExcursion:(workId)=>{excursionFlag=true;excursionWorkId=workId||null;return persistExcursion({excursionInFlight:true,sourceWorkId:excursionWorkId});},
  restoreFromSnapshot,
  status:()=>session.status(),handoff:()=>session.handoff(),
  resume:()=>visit('podium')});
 window.VixenAIModes=api;
 const restoreBanner=by('vmaRestoreBanner');
 if(isExcursionResume&&existingExcursion?.active){
  restoreFromSnapshot(existingExcursion);
  savePodiumExcursionSnapshot({...existingExcursion,excursion_in_flight:false});
  if(typeof history!=='undefined'&&location.search.includes('resume=1')){
   const cleanUrl=location.pathname+(existingExcursion.role==='COMPOSER'?'#composer':location.hash||'#maestro');
   try{history.replaceState(history.state,'',cleanUrl);}catch(_){}
  }
 }else if(restoreBanner&&existingExcursion?.active){
  restoreBanner.hidden=false;
  by('vmaRestoreSessionBtn')?.addEventListener('click',()=>{
   const snap=readPodiumExcursionSnapshot();
   if(snap)restoreFromSnapshot(snap);
  });
  by('vmaDiscardSessionBtn')?.addEventListener('click',()=>{
   clearPodiumExcursionSnapshot();
   restoreBanner.hidden=true;
   announce('Paused Podium session discarded. Notes remain OFF.');
  });
 }
 return api;
}
if(typeof document!=='undefined'){
 if(document.readyState==='loading')
  document.addEventListener('DOMContentLoaded',()=>mountVixenAiJourney(),{once:true});
 else mountVixenAiJourney();
}
