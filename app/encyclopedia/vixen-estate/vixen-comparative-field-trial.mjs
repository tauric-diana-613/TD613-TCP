/**
 * Human-operated browser research comparison. This UI has no private/native
 * host privileges; both local browser probes are explicitly adapted/derived.
 * No automatic data upload, cart write, Program Notes, or Composer authority.
 */
import {loadExperimentABodyBySourceId,shardForWorkIndex,computeSha256HexAsync}
 from './corpus-experiment-a.mjs';
import {runLiveComparativeFieldProbes,validateHumanComparativeJudgment}
 from './comparative-field-probes.mjs';

const $=id=>document.getElementById(id);
const el=(tag,cls='',value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=String(value);return x};
const btn=(value,click,cls='vf-btn')=>{const x=el('button',cls,value);x.type='button';x.addEventListener('click',click);return x};
const row=(...items)=>{const x=el('div','vf-row');x.append(...items);return x};
const field=(labelText,control)=>{const l=el('label','vf-field');l.append(el('span','vf-label',labelText),control);return l};
const select=(items,aria)=>{const s=el('select','vf-input');s.setAttribute('aria-label',aria);items.forEach(([value,label])=>{const o=el('option','',label);o.value=value;s.append(o)});return s};
const textArea=(placeholder,maxLength=1200)=>{const a=el('textarea','vf-input');a.rows=3;a.maxLength=maxLength;a.placeholder=placeholder;return a};
const rawSHA=async raw=>computeSha256HexAsync(raw);
const short=x=>String(x||'').slice(0,170);
const name=w=>w.display_title||w.declared_title||w.work_id;
const safeError=e=>String(e?.message||e||'UNKNOWN').slice(0,180);
const sourceRead=(id)=>{const a=window.VixenReference?.openWork?.(id);return Boolean(a?.opened)};
const methodLabels={DOCUMENTARY:'Documentary cue route',RELATIONAL:'Relational concept route',
 TIE:'Equally useful',NEITHER:'Neither was useful'};
const download=(obj)=>{
 const content=JSON.stringify(obj,null,2)+'\n';
 const uri=URL.createObjectURL(new Blob([content],{type:'application/json'}));
 const a=document.createElement('a');a.href=uri;a.download='vixen-human-comparative-field-receipt.json';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(uri),400);
};
const activeMaestro=()=>{
 const s=window.VixenAIModes?.status?.();
 return s?.status==='SUPPORTED'&&s.result?.role==='MAESTRO'&&s.result.active===true;
};

export function mountVixenComparativeFieldTrial(host=$('vmaComparativeFieldLab')){
 if(!host)return Object.freeze({mounted:false});
 let corpus;
 try{
  corpus=JSON.parse($('vixen-corpus-bundle').textContent);
  if(corpus.works?.length!==32||corpus.works.reduce((n,w)=>n+w.linked_sources.length,0)!==53)
   throw Error('CENSUS_DRIFT');
 }catch(_){host.textContent='Research comparison held · source catalogue could not be qualified.';return {mounted:false}}
 const state={phase:'SETUP',busy:false,round:0,run:null,documents:null,
  receipt:null,calibration:null,error:null,viewOrder:[],sourceA:0,sourceB:1,query:'',epoch:0};
 const showStatus=message=>{
  const x=host.querySelector('.vf-status');if(x)x.textContent=message;
 };
 const authorized=()=>activeMaestro()&&!host.hidden;
 const start=async()=>{
  if(state.busy||!authorized())return;
  const token=++state.epoch;
  state.busy=true;state.error=null;state.phase='LOADING';render();
  try{
   const first=corpus.works[state.sourceA],second=corpus.works[state.sourceB];
   if(!first||!second||first.work_id===second.work_id)throw Error('Choose two distinct original Works.');
   if(state.query.trim().length<5||state.query.trim().length>200)throw Error('Write a documentary question with at least five characters.');
   const docs=[];
   for(const work of [first,second]){
    const index=corpus.works.indexOf(work);let selected=null;
    for(const source of work.linked_sources){
     const rec=await loadExperimentABodyBySourceId(source.source_file_id,{hintShard:shardForWorkIndex(index)});
     if(token!==state.epoch)return;
     if(rec?.body_sha256_verified!==true||rec.source_file_id!==source.source_file_id||
      (rec.work_id&&rec.work_id!==work.work_id)||typeof rec.text_body!=='string')continue;
     const digest=rec.derivative_sha256||rec.body_sha256;
     const calculated=await rawSHA(rec.text_body);
     if(token!==state.epoch)return;
     if(calculated!==digest)throw Error('Original derivative digest mismatch; comparison held.');
     selected={work_id:work.work_id,source_file_id:source.source_file_id,
      verified_derivative_sha256:digest,body_sha256_verified:true,
      body:rec.text_body,title:name(work),cluster:work.cluster||'',created:work.created||null};
     break;
    }
    if(!selected)throw Error('One original Work has no byte-verified readable source; choose another.');
    docs.push(selected);
   }
   if(!state.calibration){
    const response=await fetch('./vixen-estate/field-lens-public-calibration.json',{cache:'no-store'});
    if(!response.ok)throw Error('Public research-method calibration unavailable.');
    const data=await response.json();
    if(token!==state.epoch)return;
    state.calibration=data;
   }
   const probes=runLiveComparativeFieldProbes({documents:docs,query:state.query,calibration:state.calibration});
   if(token!==state.epoch)return;
   state.run=probes;state.documents=docs;state.receipt=null;
   state.viewOrder=state.round%2===0?['DOCUMENTARY','RELATIONAL']:['RELATIONAL','DOCUMENTARY'];
   state.round++;state.phase='REVIEW';render();
  }catch(e){
   if(token!==state.epoch)return;
   state.error=safeError(e);state.phase='SETUP';render();
  }finally{if(token===state.epoch){state.busy=false}}
 };
 const reset=()=>{
  state.epoch++;state.busy=false;state.phase='SETUP';state.run=null;
  state.documents=null;state.receipt=null;state.error=null;render();
 };
 const commit=async form=>{
  if(!authorized()||state.busy||state.phase!=='REVIEW'||!state.run||!state.documents)return;
  state.busy=true;
  try{
   const report=validateHumanComparativeJudgment({
    report:{
     useful_method:form.elements.useful.value,
     trustworthy_method:form.elements.trustworthy.value,
     rationale:form.elements.rationale.value,contradiction:form.elements.contradiction.value,
     next_action:form.elements.next_action.value,
     source_passages:state.documents.map((d,i)=>({work_id:d.work_id,
      source_file_id:d.source_file_id,excerpt:form.elements['excerpt_'+i].value}))
    },probes:state.run,documents:state.documents});
   const payload={schema:'td613.vixen.human-operator-comparative-field-session/v1',
    operator_interaction:'VISITOR_FORM_SUBMISSION_BROWSER_LOCAL_UNATTESTED',
    operator_role:'MAESTRO',session_scope:'ONE_BROWSER_RUNTIME_ONLY',
    browser_local_time:new Date().toISOString(),time_is_independent_timestamp:false,
    order_assignment:'ALTERNATING_BY_LOCAL_SESSION_COUNTER_NOT_RANDOMIZED',
    presentation_order:state.viewOrder.slice(),
    source_works:state.run.source_works,
    source_a_was_automatically_read_for_computation:true,
    original_foreign_source_imports:0,
    engine_methods:state.run,
    operator_report:report,
    original_native_python_execution_in_browser:false,
    real_public_native_wendbine_engine_execution_in_browser:false,
    independent_empirical_replication_credit:0,
    authorial_source_admission:false,composer_publication_authority:false,
    no_network_submission:true,human_closure_required:true};
   const digest=await rawSHA(JSON.stringify(payload));
   state.receipt={...payload,browser_untrusted_sha256:digest};
   state.phase='RECEIPT';render();
  }catch(e){showStatus('Please complete the evidence fields: '+safeError(e));}
  finally{state.busy=false}
 };
 function routePanel(kind){
  const result=kind==='DOCUMENTARY'?state.run.documentary:state.run.relational;
  const x=el('article','vf-method');
  x.append(el('div','vf-method-label',kind==='DOCUMENTARY'?'DOCUMENTARY CUES':'RELATIONAL CONCEPTS'),
   el('h4','',kind==='DOCUMENTARY'?'Follow a recorded cue':'Test a concept neighborhood'),
   el('p','vf-muted',kind==='DOCUMENTARY'?
    'Adapted browser method: lexical/stratigraphic relevance and source cue detection. The original Python host method did not run here.':
    'Derived browser method: a source-checked public concept prior. It does not implement the original public author’s method or import their posts as Works.'));
  const ranking=el('div','vf-rankings');
  for(const [i,r]of result.ranking.entries()){
   const w=corpus.works.find(w=>w.work_id===r.work_id);
   const txt=kind==='DOCUMENTARY'?
    'Cue terms '+(r.matched_terms.join(', ')||'none')+' · projective '+r.projective_score:
    'Concept matches '+r.source_concept_term_hits+
    ' · public co-occurrence intersections '+r.public_cooccurrence_overlap_pairs;
   ranking.append(el('p','','#'+(i+1)+' '+name(w)+' — within-route score '+r.score),
    el('p','vf-muted',txt));
  }
  x.append(ranking);
  x.append(el('p','vf-muted',kind==='DOCUMENTARY'?
   'Observed source cues: '+result.source_cue_count+
   ' · candidate links: '+result.projective_candidate_link_count+'. Lexical candidates require human scrutiny.':
   'Controls compare full text, title only, and removed public co-occurrence bonus. A nonzero bonus alone cannot establish causal or historical connection.'));
  return x;
 }
 function render(){
  host.hidden=!activeMaestro();
  if(host.hidden)return;
  host.replaceChildren(el('p','vf-kicker','A RESEARCH TRIAL · YOUR OBSERVATION MATTERS'),
   el('h3','vf-title','Two ways to follow the same clue'),
   el('p','vf-muted','Compare two live browser methods on the same pair of verified original Works. Read the manuscripts, inspect the rival rankings, challenge each method, and submit your own assessment. The comparison stays in your browser; nothing is uploaded.'));
  if(state.phase==='SETUP'){
   const a=select(corpus.works.map(w=>[w.work_id,name(w)]),'First original Work'),
    b=select(corpus.works.map(w=>[w.work_id,name(w)]),'Second original Work');
   a.value=corpus.works[state.sourceA]?.work_id;b.value=corpus.works[state.sourceB]?.work_id;
   a.onchange=()=>{state.sourceA=corpus.works.findIndex(w=>w.work_id===a.value)};
   b.onchange=()=>{state.sourceB=corpus.works.findIndex(w=>w.work_id===b.value)};
   const q=el('input','vf-input');q.type='text';q.maxLength=200;
   q.placeholder='Explore an observed tension between these Works…';
   q.value=state.query;q.oninput=()=>{state.query=q.value};
   host.append(el('p','vf-caption','Choose your two sources and one question. A method comparison begins only when you press Run.'),
    field('First manuscript',a),field('Second manuscript',b),
    field('Your research question',q),
    row(btn('Run the two research routes',()=>start(),'vf-btn vf-primary')));
   if(state.error)host.append(el('p','vf-error',state.error));
  }else if(state.phase==='LOADING'){
   host.append(el('p','vf-status','Verifying both original manuscript derivatives before computation…'));
  }else if(state.phase==='REVIEW'){
   host.append(el('p','vf-caption','Methods appear in alternating order. Raw scores use different scales: do not compare them as if they share a common metric.'));
   const sourcePanel=el('div','vf-sources');
   for(const d of state.documents){
    const item=el('article','vf-source');
    item.append(el('h4','',d.title),el('p','vf-muted','Verified source: '+d.source_file_id+
     ' · local derivative SHA-256 '+d.verified_derivative_sha256.slice(0,14)+'…'));
    item.append(btn('Read this original Work',()=>sourceRead(d.work_id)));
    sourcePanel.append(item);
   }
   host.append(sourcePanel);
   const methods=el('div','vf-methods');
   state.viewOrder.forEach(kind=>methods.append(routePanel(kind)));host.append(methods);
   const form=el('form','vf-form');form.addEventListener('submit',e=>{e.preventDefault();commit(form)});
   form.append(el('h4','','Your redpen · what survived actual reading?'),
    el('p','vf-muted','Copy one exact passage from each manuscript. Exact text must be found in its locally verified derivative. Your judgment is a real browser-submitted field report, not an independently verified scholarly finding.'));
   for(const [i,d]of state.documents.entries()){
    const input=textArea('Copy at least 12 characters of an exact passage from this Work.',400);
    input.name='excerpt_'+i;input.required=true;
    form.append(field('Source passage '+(i+1)+' · '+d.title,input));
   }
   const options=Object.entries(methodLabels).map(([k,v])=>[k,v]);
   const u=select(options,'Which route was more useful?');u.name='useful';
   const t=select(options,'Which route was more trustworthy?');t.name='trustworthy';
   form.append(field('Which route produced the more useful lead?',u),
    field('Which route made the more defensible claims?',t));
   for(const [key,labelText,placeholder,max] of [
    ['rationale','Your comparison','What did each route get right or miss, and how did the actual passages affect your judgment?',1600],
    ['contradiction','Your disconfirming observation','Name one concrete way a promising inference failed, overreached, or could be falsified.',1600],
    ['next_action','A specific next move','What should the next operator or research engine inspect to discriminate the rival explanations?',1200]
   ]){
    const area=textArea(placeholder,max);area.name=key;area.required=true;
    form.append(field(labelText,area));
   }
   form.append(row(btn('Back to source selection',reset),
    (()=>{const b=el('button','vf-btn vf-primary','Record my comparison and export receipt');b.type='submit';return b})()));
   host.append(form);
  }else if(state.phase==='RECEIPT'){
   host.append(el('p','vf-good','Your report is recorded locally. Both manuscript passage excerpts matched source-verified text. Scientific credit remains 0.'),
    el('p','vf-muted','Browser SHA-256: '+state.receipt.browser_untrusted_sha256+
     '. This integrity digest is not an external timestamp, identity witness, or permission to publish.'),
    row(btn('Save the complete research receipt ↓',()=>download(state.receipt),'vf-btn vf-primary'),
     btn('Start another paired trial',reset)));
  }
  const status=el('p','vf-status','Original source custody and all human judgments stay distinct.');
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  host.append(status);
 }
 const roleChange=()=>{if(!activeMaestro()&&state.phase!=='SETUP')reset();render()};
 window.addEventListener('vixen-maestro-session-state',roleChange);
 render();
 const api=Object.freeze({mounted:true,
  status:()=>({phase:state.phase,role_active:activeMaestro(),
   report_recorded:state.receipt!==null,
   original_python_host_executed:false,method_parity:'HELD_UNPROVEN'}),
  // Returning the submitted browser receipt is intentionally a local, untrusted assertion.
  copyLocalReceipt:()=>state.receipt?JSON.parse(JSON.stringify(state.receipt)):null});
 window.VixenComparativeFieldTrial=api;
 return api;
}
if(typeof document!=='undefined'){
 if(document.readyState==='loading')
  document.addEventListener('DOMContentLoaded',()=>mountVixenComparativeFieldTrial(),{once:true});
 else mountVixenComparativeFieldTrial();
}
