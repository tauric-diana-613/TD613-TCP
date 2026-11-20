/**
 * Optional human-led original Work source challenge inside Maestro.
 * Browser derives a bounded diagnostic; it NEVER impersonates the private
 * Python archival instruments or grants Composer / scientific authority.
 */
import {loadExperimentABodyBySourceId,shardForWorkIndex,computeSha256HexAsync}
 from './corpus-experiment-a.mjs';
import {validateSourceChallengeCatalogue,runBrowserSourceChallenge,
 validateBrowserSourceChallengeReport} from './em-source-challenge-probes.mjs';

const $=id=>document.getElementById(id);
const make=(tag,cls='',value)=>{const x=document.createElement(tag);if(cls)x.className=cls;
 if(value!==undefined)x.textContent=String(value);return x};
const button=(label,action,cls='ve-btn')=>{const x=make('button',cls,label);
 x.type='button';x.addEventListener('click',action);return x};
const actionRow=(...nodes)=>{const x=make('div','ve-actions');x.append(...nodes);return x};
const field=(label,control)=>{const x=make('label','ve-field');x.append(make('span','ve-label',label),control);return x};
const menu=(items,description)=>{const x=make('select','ve-control');x.setAttribute('aria-label',description);
 for(const [value,label]of items){const opt=make('option','',label);opt.value=value;x.append(opt)}return x};
const area=(placeholder,max=1800)=>{const x=make('textarea','ve-control');
 x.rows=3;x.placeholder=placeholder;x.maxLength=max;return x};
const safe=x=>String(x?.message||x||'HELD').slice(0,180);
const title=w=>w.display_title||w.declared_title||w.work_id;
const maestro=()=>{
 const s=window.VixenAIModes?.status?.();
 return s?.status==='SUPPORTED'&&s.result?.role==='MAESTRO'&&s.result.active===true;
};
function exportReceipt(receipt){
 const url=URL.createObjectURL(new Blob([JSON.stringify(receipt,null,2)+'\n'],
  {type:'application/json'}));
 const link=document.createElement('a');link.href=url;link.download='vixen-source-challenge-field-receipt.json';
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),400);
}
async function copyForCollaboration(receipt){
 const text=['# Source-first research challenge · read-only AI handoff',
 'A human visitor has voluntarily copied this report. It is their unverified account, not an external witness or publication permission.',
 'Investigate disputed source-local claims, source-mapped operators, boundary conditions, predictions, competing field-generic models, and falsifiers. Treat source spans as verified derivatives only. Never infer original authorship, genealogy, or mechanism from shared vocabulary or a complete-looking structural form. All eight Work-identity gates remain unresolved.',
 JSON.stringify(receipt,null,2)].join('\n\n');
 await navigator.clipboard.writeText(text);
}
export function mountVixenSourceChallenge(host=$('vmaSourceChallenge')){
 if(!host)return Object.freeze({mounted:false});
 let corpus;
 try{
  corpus=JSON.parse($('vixen-corpus-bundle').textContent);
  validateSourceChallengeCatalogue(corpus);
 }catch(_){host.textContent='Source challenge held · original source register unqualified.';return Object.freeze({mounted:false})}
 const state={phase:'SETUP',epoch:0,busy:false,sourceA:0,sourceB:1,
  question:'',focus:null,documents:null,result:null,report:null,receipt:null,error:null,
  draft:Object.create(null),draftRevision:0,receiptExportRequested:false};
 const authorized=()=>maestro()&&!host.closest('#vmaPlayPanel')?.hidden;
 const showStatus=msg=>{const x=host.querySelector('.ve-status');if(x)x.textContent=msg};
 const wipe=()=>{
  state.epoch++;state.phase='SETUP';state.busy=false;
  state.sourceA=0;state.sourceB=1;state.question='';state.focus=null;
  state.documents=null;state.result=null;state.report=null;state.receipt=null;state.error=null;state.focus=null;
  state.draft=Object.create(null);state.draftRevision++;state.receiptExportRequested=false;
 };
 const redraw=()=>{
  host.hidden=!maestro();
  if(host.hidden)return;
  host.replaceChildren(make('p','ve-eyebrow','SOURCE CHALLENGE · READ THE CONTRADICTION'),
   make('h3','ve-headline','Can this connection survive a hostile reading?'),
   make('p','ve-lede','A separate source-first adventure: choose two manuscripts, follow an exact textual clue, remove its weakest support, then investigate the operators and predictions it actually warrants. Your research remains local until you choose to export or copy it.'));
  const steps=make('ol','ve-steps');
  const order=['CHOOSE SOURCES','INSPECT THE LEAD','WITHDRAW THE LINK','MAKE YOUR CASE'];
  const current=state.phase==='SETUP'||state.phase==='LOADING'?0:state.phase==='SOURCE'?1:state.phase==='COUNTERTEST'?2:3;
  for(const [i,s]of order.entries()){
   const x=make('li',i===current?'ve-step ve-step-current':'ve-step',s);
   if(i<current)x.classList.add('ve-step-complete');
   steps.append(x);
  }
  host.append(steps);
  if(state.phase==='SETUP'){
   const a=menu(corpus.works.map(w=>[w.work_id,title(w)]),'First original Work'),
    b=menu(corpus.works.map(w=>[w.work_id,title(w)]),'Second original Work');
   a.value=corpus.works[state.sourceA]?.work_id;b.value=corpus.works[state.sourceB]?.work_id;
   a.addEventListener('change',()=>{state.sourceA=corpus.works.findIndex(w=>w.work_id===a.value)});
   b.addEventListener('change',()=>{state.sourceB=corpus.works.findIndex(w=>w.work_id===b.value)});
   const q=make('input','ve-control');q.type='text';q.maxLength=240;
   q.placeholder='What formal relation might explain a surprising resemblance?';
   q.value=state.question;q.addEventListener('input',()=>{state.question=q.value});
   host.append(make('p','ve-caption','01 · Choose a pair. Both exact derivative hashes will be checked before any inference.'),
    field('Manuscript A',a),field('Manuscript B',b),
    field('The question you want to challenge',q),
    actionRow(button('Inspect the two original sources',()=>begin(),'ve-btn ve-primary')));
   if(state.error)host.append(make('p','ve-error',state.error));
  }else if(state.phase==='LOADING'){
   host.append(make('p','ve-caption','Checking original Work registers and independently rehashing both derivative texts…'));
  }else if(state.phase==='SOURCE'){
   host.append(make('p','ve-caption','02 · These are machine-located textual clues, rather than an interpretation of causality. Each original Work is available for your own reading.'));
   for(const [i,d]of state.documents.entries()){
    const box=make('article','ve-source');
    const locator=state.result.exact_span_locators[i],context=state.result.context_windows[i];
    box.append(make('div','ve-small','ORIGINAL WORK '+(i+1)),
     make('h4','',d.title),make('p','ve-muted','Verified derivative · '+d.source_file_id+' · SHA-256 '+d.verified_derivative_sha256.slice(0,16)+'…'));
    if(context)box.append(make('blockquote','ve-passage',context.preview),
     make('p','ve-muted','Automated contextual window at UTF-8 byte '+locator.utf8_offset+' · not a claim that you have read the entire manuscript.'));
    else box.append(make('p','ve-muted','No bounded shared lexical term was located in this Work pair.'));
    box.append(button('Read the original Work',()=>window.VixenReference?.openWork?.(d.work_id)));
    host.append(box);
   }
   const protocols=make('div','ve-protocols');
   protocols.append(make('h4','','The original research instruments behind these Works'));
   const assigned=state.result.documentary_protocol_assignments;
   for(let i=0;i<2;i++){
    const names=assigned[i].map(x=>x.replace(/_V\d+_\d+$/,'').replace(/_/g,' ').toLowerCase());
    protocols.append(make('p','ve-muted','Work '+(i+1)+' · '+names.join(' · ')));
   }
   const shared=state.result.shared_original_documentary_protocols;
   protocols.append(make('p','ve-muted',shared.length?
    'Shared recorded protocol assignments: '+shared.length+'. These are documentary instructions; no original scholarly procedure has automatically executed here.':
    'These two Works have no shared recorded research-protocol assignment. That divergence is a clue, not proof of unrelated mechanisms.'));
   protocols.append(button('Examine the original research instruments',()=>{
    const nav=document.querySelector('#vixenRoomRail [data-view="protocols"]')||
     document.querySelector('button[data-view="protocols"]');
    nav?.click();
   }));
   host.append(protocols);
   const proposal=state.result.source_derived_candidate;
   host.append(make('div','ve-finding',proposal?
    'Candidate term: “‘'+proposal+'” · occurrence counts '+state.result.source_repetition_count.join(' / ')+
    '. A source occurrence is a search aperture, not proof of a distinctive motif.':
    'No bounded common term found; the experiment may still recommend another source-specific comparison.'));
   host.append(actionRow(button('Test the strongest rival explanation',()=>advance('SOURCE','COUNTERTEST'),'ve-btn ve-primary'),
    button('Choose different Works',()=>reset())));
  }else if(state.phase==='COUNTERTEST'){
   const has=Boolean(state.result.source_derived_candidate);
   host.append(make('p','ve-caption','03 · A deliberate challenge to the first impression. The texts are unchanged; only a disposable comparison is modified.'));
   const before=state.result.control.source_two_occurrences_before||0;
   const after=state.result.control.source_two_occurrences_after||0;
   const stats=make('div','ve-challenge');
   stats.append(make('div','ve-small','WHAT THE CONTROL ACTUALLY MEASURED'),
    make('h4','',has?'One lexical link, withdrawn':'No shared term qualified'),
    make('p','',has?'Second text occurrences: '+before+' before → '+after+
     ' after an ephemeral word withdrawal. That shows dependence on the selected term. It cannot rule out a common causal mechanism.':
     'No term met the registered screen. An independently sourced formal relation may still exist.'));
   host.append(stats);
   const alternatives=make('div','ve-alternatives');
   alternatives.append(make('h4','','Three rival explanations still standing'));
   for(const s of ['Common vocabulary within the field, without distinctive shared operators',
    'Independent convergence on similar language or an earlier common source',
    'A selected example, extraction artifact, or retrospective matching bias']){
    alternatives.append(make('p','ve-rival',s));
   }
   const directions=[
    ['OPERATORS','Follow the actual operators','Find each rule and the conditions where it works'],
    ['GENEALOGY','Trace the source ancestry','Check citations, chronology and possible common origins'],
    ['GENERIC_NULL','Try a field-generic rival','Seek matched sources where identical wording carries different mechanisms']
   ];
   const forks=make('div','ve-forks');
   forks.append(make('h4','','Choose what the guide investigates next'));
   for(const [key,label,description]of directions){
    const b=button(label,()=>{state.focus=key;redraw();},'ve-btn'+(state.focus===key?' ve-selected':''));
    b.setAttribute('aria-pressed',String(state.focus===key));
    forks.append(actionRow(b,make('span','ve-muted',description)));
   }
   host.append(forks);
   host.append(alternatives,make('p','ve-warning','Scientific classification: HELD. The original Python archival firewall has not run in this browser. A structural-looking form must be tied independently to actual operators, boundaries, and predictions. All eight Work identity gates remain unresolved.'),
    make('p','ve-next','Next highest-information move: '+state.result.decision.recommended_next_action));
   host.append(actionRow(button('Investigate the actual structural claim',()=>{
    if(!state.focus){showStatus('Choose an investigation route before proceeding.');return}
    advance('COUNTERTEST','FIELDWORK');
   },'ve-btn ve-primary'),
    button('Return to exact source windows',()=>advance('COUNTERTEST','SOURCE'))));
  }else if(state.phase==='FIELDWORK'){
   const focus={
    OPERATORS:'You chose the formal-operators route. Locate a defined transformation and its admissible boundary.',
    GENEALOGY:'You chose the source-ancestry route. Distinguish citations and chronology from thematic resemblance.',
    GENERIC_NULL:'You chose a generic-field rival. Identify a matching comparison that could independently reproduce the vocabulary.'
   }[state.focus]||'Your research route is not selected.';
   host.append(make('p','ve-caption','04 · Your redpen. '+focus+
    ' Supply exact passages from both manuscripts; these remain your unverified interpretations.'));
   const form=make('form','ve-form');form.addEventListener('submit',e=>{e.preventDefault();submit(form)});
   for(const [i,d]of state.documents.entries()){
    const x=area('Copy an exact passage of at least 16 characters from this original Work.',500);
    x.name='excerpt_'+i;x.required=true;x.value=state.draft[x.name]||'';
    form.append(field('Source '+(i+1)+' · '+d.title,x));
    form.append(button('Open source '+(i+1)+' for reading',()=>window.VixenReference?.openWork?.(d.work_id)));
   }
   const choices=menu([
    ['MOTIF_ONLY','Only source-local motif evidence'],
    ['STRUCTURAL_CANDIDATE_UNPROVEN','Possible structural relation, still unproven'],
    ['NO_RELATION_EARNED','No relation earned']], 'Your provisional judgment');
   choices.name='judgment';if(state.draft.judgment)choices.value=state.draft.judgment;
   form.append(field('What level of claim survived?',choices));
   const sections=[
    ['entities','What distinct entities and source objects are involved?','Specify the entities and how both texts name them.'],
    ['operators','What actual operators or transformations connect them?','Locate a specific rule or formal operation, not another metaphor.'],
    ['boundary_conditions','Where are the shared operations valid or invalid?','Identify domain conditions or incompatible assumptions.'],
    ['predicted_consequences','What distinct consequences do the two models predict?','Name contrasting outcomes that could be measured.'],
    ['field_generic_rival','What is the strongest field-generic alternative?','Explain how two unrelated works could use the same vocabulary.'],
    ['non_metaphorical_rule','Express the proposed mechanism without its metaphor.','Write an explicit causal or formal rule that does not rely on evocative terms.'],
    ['disconfirming_observation','What observation would defeat your proposed relation?','Give a real, discriminating counterexample or missing witness.'],
    ['next_source_action','What should we verify next and where?','A locatable source, original operator, matched control, or evidence acquisition.']
   ];
   for(const [key,label,placeholder]of sections){
    const control=area(placeholder,1800);control.name=key;control.required=true;control.value=state.draft[key]||'';
    form.append(field(label,control));
   }
   // Rerenders replace controls. Keep unsent values only within this local role session.
   const remember=e=>{
    const ctl=e.target;if(!ctl?.name||!form.elements.namedItem(ctl.name))return;
    state.draft[ctl.name]=String(ctl.value||'');state.draftRevision++;
   };
   form.addEventListener('input',remember);form.addEventListener('change',remember);
   const commit=make('button','ve-btn ve-primary','Record the redpen and prepare local receipt');commit.type='submit';
   form.append(actionRow(button('Back to adverse controls',()=>advance('FIELDWORK','COUNTERTEST')),commit));
   host.append(form);
  }else if(state.phase==='RECEIPT'){
   host.append(make('p','ve-success','The browser matched both of your passages to SHA-verified Vixen derivatives. Your structural interpretation remains an unverified human account; scientific credit = 0.'),
    make('p','ve-muted','Local digest: '+state.receipt.browser_untrusted_sha256+
     '. This checksum is not a trusted timestamp, identity proof, or authorization to publish.'));
   host.append(actionRow(button('Save my complete research receipt ↓',()=>{
     exportReceipt(state.receipt);state.receiptExportRequested=true;state.draftRevision++;
    },'ve-btn ve-primary'),
    button('Copy a source-bounded AI handoff',async()=>{
     try{await copyForCollaboration(state.receipt);
     state.receiptExportRequested=true;state.draftRevision++;
     showStatus('Research handoff copied by your direct choice.')}
     catch(_){showStatus('Clipboard permission was unavailable. Save the local JSON receipt instead.')}
    }),button('Begin another challenge',()=>reset())));
  }
  const status=make('p','ve-status','Machine-located passages · visitor judgments · independently observed evidence: separate classes.');
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');host.append(status);
 };
 const advance=(from,to)=>{if(!authorized()||state.phase!==from)return;
  state.phase=to;redraw()};
 const reset=()=>{
  if(state.receipt&&!state.receiptExportRequested &&
     !window.confirm('This completed local challenge receipt has not been exported. Discard it and begin another challenge?'))return;
  state.epoch++;state.phase='SETUP';state.busy=false;
  state.documents=null;state.result=null;state.report=null;state.receipt=null;state.error=null;state.focus=null;
  state.draft=Object.create(null);state.draftRevision++;state.receiptExportRequested=false;
  redraw()};
 const begin=async()=>{
  if(!authorized()||state.busy||state.phase!=='SETUP')return;
  const token=++state.epoch;state.busy=true;state.phase='LOADING';state.error=null;redraw();
  try{
   const pair=[corpus.works[state.sourceA],corpus.works[state.sourceB]];
   if(!pair[0]||!pair[1]||pair[0].work_id===pair[1].work_id)
    throw Error('Choose two different original Works.');
   if(state.question.trim().length<8||state.question.length>240)
    throw Error('Enter a source question with at least eight characters.');
   const docs=[];
   for(const w of pair){
    let doc=null;const idx=corpus.works.indexOf(w);
    for(const source of w.linked_sources){
     const rec=await loadExperimentABodyBySourceId(source.source_file_id,
      {hintShard:shardForWorkIndex(idx)});
     if(token!==state.epoch)return;
     if(rec?.body_sha256_verified!==true||rec.source_file_id!==source.source_file_id||
      (rec.work_id&&rec.work_id!==w.work_id)||typeof rec.text_body!=='string')continue;
     const actual=await computeSha256HexAsync(rec.text_body);
     if(token!==state.epoch)return;
     const expected=rec.derivative_sha256||rec.body_sha256;
     if(actual!==expected)throw Error('Source derivative byte checksum mismatch. Research held.');
     doc={work_id:w.work_id,source_file_id:source.source_file_id,
      declared_original_source_sha256:source.sha256,
      verified_derivative_sha256:actual,body_sha256_verified:true,
      title:title(w),body:rec.text_body};
     break;
    }
    if(!doc)throw Error('A selected Work has no readable SHA-verified source. Choose another.');
    docs.push(doc);
   }
   const result=await runBrowserSourceChallenge({documents:docs,corpus,question:state.question});
   if(token!==state.epoch)return;
   state.documents=docs;state.result=result;state.phase='SOURCE';redraw();
  }catch(e){if(token!==state.epoch)return;state.error=safe(e);state.phase='SETUP';redraw()}
  finally{if(token===state.epoch)state.busy=false}
 };
 const submit=async form=>{
  if(!authorized()||state.busy||state.phase!=='FIELDWORK')return;
  const token=state.epoch;state.busy=true;
  try{
   const fields=['entities','operators','boundary_conditions','predicted_consequences',
    'field_generic_rival','non_metaphorical_rule','disconfirming_observation','next_source_action'];
   const report={judgment:form.elements.judgment.value,
    passages:state.documents.map((d,i)=>({work_id:d.work_id,
     source_file_id:d.source_file_id,excerpt:form.elements['excerpt_'+i].value}))};
   for(const key of fields)report[key]=form.elements[key].value;
   const review=await validateBrowserSourceChallengeReport({
    result:state.result,documents:state.documents,corpus,report});
   if(token!==state.epoch||!authorized()||state.phase!=='FIELDWORK')return;
   const plain={
    schema:'td613.vixen.visitor-hostile-source-challenge-receipt/v1',
    session_role:'MAESTRO',visitor_choice:'DIRECT_OPTIONAL_LOCAL_FORM',
    browser_time:new Date().toISOString(),browser_time_is_independent_provenance:false,
    research_question:state.question,operator_selected_investigation_route:state.focus,
    verified_source_challenge:state.result,
    visitor_review:review,
    original_foreign_source_manuscript_count:0,
    original_native_python_executed_in_browser:false,
    independent_exogenous_witness:false,
    human_identity_gates_adjudicated:0,composer_publication_authority:false,
    scientific_credit:0,network_submission_performed:false,
    complete_source_bodies_in_export:false,
    human_closure_required:true};
   const sha=await computeSha256HexAsync(JSON.stringify(plain));
   if(token!==state.epoch||!authorized()||state.phase!=='FIELDWORK')return;
   state.report=review;state.receipt={...plain,browser_untrusted_sha256:sha};
   state.draft=Object.create(null);state.draftRevision++;state.receiptExportRequested=false;
   state.phase='RECEIPT';redraw();
  }catch(e){if(token===state.epoch&&authorized())showStatus('Source challenge held · '+safe(e));}
  finally{if(token===state.epoch)state.busy=false}
 };
 const roleChange=()=>{if(!maestro())wipe();redraw()};
 window.addEventListener('vixen-maestro-session-state',roleChange);
 redraw();
 const api=Object.freeze({mounted:true,status:()=>({
  phase:state.phase,role_active:authorized(),report_recorded:!!state.receipt,
  original_python_executed:false,source_census:32,scientific_credit:0,
  human_closure_required:true,
  motif_candidate:state.result?.source_derived_candidate||null}),
  copyLocalReceipt:()=>state.receipt?JSON.parse(JSON.stringify(state.receipt)):null,
  draftStatus:()=>Object.freeze({
   schema:'td613.vixen.unsent-draft-status/v1',role:'MAESTRO',phase:state.phase,
   revision:state.draftRevision,
   unsent_characters:Object.values(state.draft).reduce((n,v)=>n+String(v||'').length,0),
   has_unsent_draft:Object.values(state.draft).some(v=>String(v||'').trim().length>0)||
    (state.phase==='SETUP'&&state.question.trim().length>0),
   has_local_receipt:!!state.receipt,receipt_export_requested:state.receiptExportRequested,
   unexported_receipt:!!state.receipt&&!state.receiptExportRequested,
   no_automatic_persistence:true
  })});
 window.VixenSourceChallenge=api;
 return api;
}
if(typeof document!=='undefined'){
 if(document.readyState==='loading')
  document.addEventListener('DOMContentLoaded',()=>mountVixenSourceChallenge(),{once:true});
 else mountVixenSourceChallenge();
}
