/**
 * Vixen's two-role research adventure. All source analysis remains read-only.
 * An LLM may use the exported Podium handoff; the local browser guide does
 * not pretend to have a remote model attached.
 */
import {createVixenAiSession,formatVixenChatCard} from './vixen-ai-session.mjs';
const by=id=>document.getElementById(id);
const node=(tag,cls='',text='')=>{const e=document.createElement(tag);e.className=cls;e.textContent=text;return e};
const button=(label,fn,cls='vma-btn')=>{const e=node('button',cls,label);e.type='button';e.onclick=fn;return e};
function visit(room){
 if(!['overview','observatory','works','gates','protocols','holds','collection','reference'].includes(room))return;
 (document.querySelector('#vixenRoomRail [data-view="'+room+'"]')||
 document.querySelector('button[data-view="'+room+'"]'))?.click();
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
  if(d)d.hidden=!active||!by('view-collection')?.hidden;
 }
 function render(){
  const state=session.status(),item=state.status==='SUPPORTED'?state.result:null;
  const handoff=active?session.handoff().result:null;
  by('vmaStartPanel').hidden=active;by('vmaPlayPanel').hidden=!active;
  by('vmaEndSummary').hidden=!lastArchive||active;
  by('vmaChapter').textContent='CHAPTER '+String(item?.history_length||0).padStart(2,'0');
  by('vmaCurrentRole').textContent=role?role+' · ROLE LOCKED':'CHOOSE YOUR ROLE';
  resumeDock();if(!active)return;
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
   box.append(node('span','vma-micro',w.cluster||'SOURCE'),
    node('h5','',w.title),
    node('p','',w.provenance_reason?.join(' · ')||'Recorded source awaiting further examination'));
   const row=node('div','vma-inline');
   row.append(button('Read the work',()=>{
      const opened=window.VixenReference?.openWork?.(w.work_id);
      if(!opened?.opened)visit('works');
     },'vma-small'),
    button('Save to cart',()=>{
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
  const v=await session.start({role,goal:by('vmaGoal').value.slice(0,300)});
  if(v.status==='SUPPORTED'){active=true;announce('Your ontological role is locked for this session.');render();}
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
  lastNotes=session.notes().status==='SUPPORTED'?session.notes().result:null;
  const ended=session.finish();lastArchive=ended.status==='SUPPORTED'?ended.result.archive:null;
  active=false;role=null;pendingQuest=null;
  by('vmaStart').disabled=true;reportPanel.hidden=true;
  host.querySelectorAll('[data-vma-role]').forEach(x=>x.setAttribute('aria-pressed','false'));
  announce('Session ended. Begin a new session to select a different role.');render();
 });
 by('vmaSaveFinal').addEventListener('click',()=>{
   if(!lastArchive)return;
   download(JSON.stringify(lastArchive,null,2)+'\n','vixen-completed-research-journey.json');
   announce('Final research journey saved locally. No upload occurred.');
 });
 by('vmaDownloadFinalNotes').addEventListener('click',()=>{
   if(!lastNotes){announce('No Program Notes were authorized for that journey.');return}
   const content=['# Program Notes from a completed journey','',
    'Provisional editorial notes: no source relationship or empirical result is adjudicated.',
    ...lastNotes.entries.flatMap(n=>['','## '+n.title,
      n.draft||n.visitor_observation||n.highlighted_work||'Local structured outline'])].join('\n');
   download(content,'vixen-completed-program-notes.md','text/markdown;charset=utf-8');
 });
 by('vmaJourneyDock')?.addEventListener('click',()=>visit('collection'));
 // A navigation click updates hidden rooms after capture. Observe that actual
 // visibility transition, including direct source jumps and room changes.
 const collectionRoom=by('view-collection');
 if(collectionRoom){
  const navigationObserver=new MutationObserver(resumeDock);
  navigationObserver.observe(collectionRoom,{attributes:true,attributeFilter:['hidden']});
 }
 document.addEventListener('click',()=>requestAnimationFrame(resumeDock),{capture:true});
 window.addEventListener('hashchange',resumeDock);
 window.addEventListener('vixen-study-tray-change',()=>{if(active)render()});
 render();announce('Choose Maestro or Composer. Notes begin OFF.');
 const api=Object.freeze({mounted:true,roles:['MAESTRO','COMPOSER'],model_connected:false,
  read_only:true,session,
  status:()=>session.status(),handoff:()=>session.handoff(),
  resume:()=>visit('collection')});
 window.VixenAIModes=api;
 return api;
}
if(typeof document!=='undefined'){
 if(document.readyState==='loading')
  document.addEventListener('DOMContentLoaded',()=>mountVixenAiJourney(),{once:true});
 else mountVixenAiJourney();
}
