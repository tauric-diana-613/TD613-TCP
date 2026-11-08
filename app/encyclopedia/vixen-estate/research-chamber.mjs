/**
 * 𝌋 Vixen Cybernetics Encyclopedia · operator-facing research encounter.
 * Preserves historical Em Work identity and the separate Universal reference estate.
 * No generated cross-estate identity claims; no scientific admission or execution authority.
 */
import {createVixenReferenceMembrane,BridgeHold,normalizeSourceQuery} from './reference-bridge.mjs';

const DEFAULT_PHASES=Object.freeze(['NOTICE','ACT','WORLD_ANSWERS','NAME','REST']);
const $=(id)=>document.getElementById(id);
const make=(name,className='',text)=>{const el=document.createElement(name);if(className)el.className=className;if(text!==undefined)el.textContent=String(text);return el};
const put=(parent,...items)=>{for(const item of items)if(item)parent.append(item);return parent};
const button=(text,fn,extra='')=>{const e=make('button','vxe-control '+extra,text);e.type='button';e.addEventListener('click',fn);return e};
const textP=(s,cl='vxe-copy')=>make('p',cl,s);
const small=(text)=>make('span','vxe-small',text);
function safeSourceName(src){return String(src?.original_filename||'Unidentified historical manifestation')}
function buildEstateCard(kind,heading,description){
 const el=make('section','vxe-estate vxe-estate-'+kind);put(el,make('p','vxe-eyebrow',kind==='vixen'?'ESTATE 01 / HISTORICAL RESEARCH':'ESTATE 02 / CANONICAL REFERENCE'),make('h2','',heading),textP(description));return el;
}
export function mountVixenResearchChamber({container=$('vixenReferenceChamber'),fetcher=globalThis.fetch?.bind(globalThis),cryptoProvider=globalThis.crypto,baseURL=undefined}={}){
 if(!container)return Object.freeze({mounted:false,reason:'CHAMBER_ROOT_MISSING'});
 const script=$('vixen-corpus-bundle');
 if(!script){container.textContent='SOURCE HOLD: Vixen historical metadata is missing.';return Object.freeze({mounted:false,reason:'VIXEN_METADATA_MISSING'})}
 let vixen;
 try{vixen=JSON.parse(script.textContent)}catch(_){container.textContent='SOURCE HOLD: Vixen historical metadata cannot be decoded.';return Object.freeze({mounted:false,reason:'VIXEN_METADATA_INVALID'})}
 if(!Array.isArray(vixen.works)||vixen.works.length!==32||!Array.isArray(vixen.human_gates)||vixen.human_gates.length!==8||!Array.isArray(vixen.instruments)||vixen.instruments.length!==21){
  container.textContent='SOURCE HOLD: The Vixen Work, identity gate or documentary census is inconsistent.';return Object.freeze({mounted:false,reason:'VIXEN_CENSUS_MISMATCH'})
 }
 const membrane=createVixenReferenceMembrane({fetcher,cryptoProvider,baseURL});
 const state={phase:'NOTICE',workIndex:0,query:'',hits:[],witness:null,selectedId:null,hypothesis:'',busy:false,error:null,info:'Choose a historical Work to examine its exact documentary identity before requesting Universal reference evidence.',status:'UNOPENED',trace:[],counter:0};
 const track=(action,details={})=>state.trace.push(Object.freeze({n:++state.counter,estate:'VIXEN_RESEARCH',action,...details}));
 const clearInquiry=()=>{state.phase='NOTICE';state.query='';state.hits=[];state.witness=null;state.selectedId=null;state.hypothesis='';state.error=null;state.status='UNOPENED';state.info='You may inspect the historical Work and then begin an inquiry.';track('HISTORICAL_WORK_SELECTED',{work_id:vixen.works[state.workIndex].work_id})};
 const begin=()=>{state.phase='ACT';state.error=null;state.info='Enter a term or phrase to search the independent reference estate. A lexical match alone cannot prove a relationship.';track('OPERATOR_INQUIRY_STARTED',{work_id:vixen.works[state.workIndex].work_id});render()};
 async function ask(){
  const query=normalizeSourceQuery(state.query);
  if(!query){state.info='Enter a research term to request an answer. The interface will not invent the question for you.';render();return}
  if(state.busy)return;
  state.busy=true;state.status='CHECKING';state.error=null;state.hits=[];state.witness=null;state.selectedId=null;state.info='Requesting separately hosted source metadata; no interpretive result has been asserted.';
  track('REQUEST_REFERENCE',{work_id:vixen.works[state.workIndex].work_id,query});render();
  try{
   await membrane.open();
   state.hits=membrane.search(query,{limit:20});
   state.status=state.hits.length?'INDEX_MATCHES_UNVERIFIED':'HELD_NO_LEXICAL_MATCH';
   state.info=state.hits.length?
     state.hits.length+' source index match(es) returned. Choose a record to verify its full source bytes before proceeding.':
     'The canonical index returned no matching label or alias. This is a bounded negative search result, not a claim that no such research exists.';
   track('REFERENCE_QUERY_RETURNED',{query,hits:state.hits.length,classification:'LEXICAL_MATCH_ONLY'});
   if(!state.hits.length)state.phase='WORLD_ANSWERS';
  }catch(e){
   const reason=e instanceof BridgeHold?e.code:'REFERENCE_NETWORK_UNAVAILABLE';
   state.phase='WORLD_ANSWERS';state.error=reason;state.status='HELD_REFERENCE_UNAVAILABLE';
   state.info='The independent reference estate did not supply an admissible answer: '+String(e?.message||e);
   track('REFERENCE_HELD',{reason});
  }finally{state.busy=false;render()}
 }
 async function inspectRecord(id){
  if(state.busy||!state.hits.some(r=>r.id===id))return;
  state.busy=true;state.status='VERIFYING_SOURCE';state.info='Fetching the exact reference record and checking its SHA-256 digest against the separately indexed source identity.';render();
  try{
   const witness=await membrane.getRecord(id);state.witness=witness;state.selectedId=id;state.phase='WORLD_ANSWERS';state.status='CANONICAL_PAYLOAD_VERIFIED';state.error=null;
   state.info='The indexed canonical JSON payload has been SHA-256 verified (separate served-file digest recorded). The proposed relation to Vixen remains unestablished.';
   track('RECORD_SOURCE_VERIFIED',{id,source_sha256:witness.record_sha256,work_id:vixen.works[state.workIndex].work_id});
  }catch(e){
   state.witness=null;state.selectedId=null;state.phase='WORLD_ANSWERS';state.status='HELD_SOURCE_WITNESS';state.error=e instanceof BridgeHold?e.code:'UNKNOWN_WITNESS_ERROR';
   state.info='The reference could not be authenticated: '+String(e?.message||e);
   track('RECORD_WITNESS_REFUSED',{id,reason:state.error});
  }finally{state.busy=false;render()}
 }
 function nameQuestion(){
  if(state.phase!=='WORLD_ANSWERS')return;
  state.phase='NAME';track('HUMAN_INTERPRETATION_OPENED',{source_record:state.selectedId||null,provenance:state.status});
  state.info='A human question may now be named, while scientific support, cross-estate authorship, and Experiment B postflight admission remain HELD.';render()
 }
 function rest(){
  if(state.busy)return;
  state.phase='REST';track('UNPENALIZED_REST',{source_record:state.selectedId||null});
  state.info='Rest preserves this session in memory while this page stays open. No backend writes, persistence promise, or automatic scientific decision.';membrane.rest();render()
 }
 function resume(){state.phase=state.witness||state.error||state.status==='HELD_NO_LEXICAL_MATCH'?'WORLD_ANSWERS':'NOTICE';track('OPERATOR_RESUMED');render()}
 function renderWitness(parent){
  const w=state.witness;
  if(!w){put(parent,make('div','vxe-absence',state.status==='INDEX_MATCHES_UNVERIFIED'?'Metadata matches await exact-byte verification.':state.info));return}
  const r=w.record;const doc=make('article','vxe-evidence');
  put(doc,make('p','vxe-eyebrow','UNIVERSAL · '+w.id+' · SHA-256 WITNESSED'),make('h3','',r.label),textP('Record class: '+r.kind+' · source status: '+(r.status||'UNCLASSIFIED'),'vxe-source-note'));
  const description=r.record?.description||r.record?.assessment||r.record?.summary||r.record?.note||'No viewable description was supplied by this record.';
  put(doc,textP(description),make('div','vxe-digest','SOURCE: '+w.source_path+'\nCANONICAL JSON SHA-256: '+w.record_sha256+'\nSERVED FILE SHA-256: '+w.served_file_sha256));
  const note=r.record?.note;if(typeof note==='string'&&note!==description)put(doc,textP(note,'vxe-source-note'));
  put(doc,small('CANONICAL PAYLOAD VERIFIED ≠ CLAIM ENTAILMENT ≠ CROSS-ESTATE AUTHORSHIP'));
  const link=make('a','vxe-link','Read record in Universal Encyclopedia ↗');
  link.href=new URL('../#record='+encodeURIComponent(w.id),new URL('../reference/',import.meta.url)).href;
  link.target='_blank';link.rel='noopener noreferrer';doc.append(link);
  parent.append(doc);
 }
 function render(){
  container.replaceChildren();
  const heading=make('div','vxe-heading');
  put(heading,make('p','vxe-eyebrow','07 · VIXEN CYBERNETICS / CROSS-ESTATE RESEARCH'),make('h1','','The Research Membrane'),textP('Two distinct research estates. One deliberately requested encounter. Neither archive has the authority to overwrite the other.','vxe-lede'));
  container.append(heading);
  const phaseTrack=make('ol','vxe-steps');
  DEFAULT_PHASES.forEach((phase,i)=>{
   const li=make('li','vxe-step'+(state.phase===phase?' vxe-step-current':''));
   li.setAttribute('aria-current',state.phase===phase?'step':'false');
   put(li,make('span','vxe-phase-num',String(i+1).padStart(2,'0')),make('span','',phase.replaceAll('_',' ')));phaseTrack.append(li)
  });
  container.append(phaseTrack);
  const status=make('p','vxe-status',state.status+' · '+state.info);status.setAttribute('role','status');container.append(status);
  const spatial=make('div','vxe-spatial');
  const left=buildEstateCard('vixen','The Historical Work','The archival object is observed in its own recorded identity before any reference operation is attempted.');
  const right=buildEstateCard('universal','The Reference Counterpart','A separate, publicly served edition. Only records actually retrieved and checked may enter the evidence window.');
  const hinge=make('div','vxe-membrane');put(hinge,make('span','','S ≠ W ≠ A'),make('strong','','THE CUSTODY MEMBRANE'),make('span','','NO AUTOMATIC IDENTITY MERGE'));
  spatial.append(left,hinge,right);
  // NOTICE: operate on actual declared Work and manifestation metadata.
  const workSel=make('select','vxe-work-select');
  workSel.setAttribute('aria-label','Choose one historical Vixen Work');
  vixen.works.forEach((work,i)=>{const opt=make('option','',String(i+1).padStart(2,'0')+' · '+(work.display_title||work.declared_title||work.work_id));opt.value=String(i);workSel.append(opt)});
  workSel.value=String(state.workIndex);
  workSel.addEventListener('change',()=>{state.workIndex=Number(workSel.value);clearInquiry();render()});
  left.append(workSel);
  const work=vixen.works[state.workIndex];
  const witness=make('article','vxe-document');
  put(witness,make('p','vxe-eyebrow','SOURCE A · ORIGINAL VIXEN ESTATE'),make('h3','',work.display_title||work.declared_title||work.work_id),textP('Work ID: '+work.work_id,'vxe-source-note'),textP('Identity disposition: '+(work.identity_status||'UNRESOLVED'),'vxe-source-note'));
  const manifestations=make('ul','vxe-manifestations');
  (work.linked_sources||[]).forEach(source=>{const li=make('li','');put(li,make('strong','',safeSourceName(source)),small(' SHA-256 declared: '+String(source.sha256||'UNRECORDED')));manifestations.append(li)});
  if(!manifestations.children.length)manifestations.append(make('li','','No linked source files available on this public metadata surface.'));
  put(witness,make('h4','','Recorded manifestations'),manifestations,small('TIER 2 CATALOGUE METADATA · ORIGINAL SOURCE BODIES WITHHELD'));
  left.append(witness);
  left.append(button('Examine the eight human identity gates ↗',()=>window.location.hash='#gates','vxe-text-control'));
  const ready=state.phase==='NOTICE';
  left.append(button('Begin an inquiry with this Work',begin,'vxe-primary'+(!ready?' vxe-muted':'')));
  // ACT: human-specified query; no suggested cross-estate equality.
  const entry=make('div','vxe-query');
  put(entry,make('label','vxe-eyebrow','HUMAN-DEFINED RESEARCH QUESTION'));
  const queryInput=make('input','vxe-query-input');
  queryInput.type='search';queryInput.value=state.query;queryInput.placeholder='A word or phrase to check against recorded Universal entries';
  queryInput.disabled=state.phase==='NOTICE'||state.phase==='REST'||state.busy;
  queryInput.setAttribute('aria-label','Reference term to investigate');
  queryInput.addEventListener('input',()=>{state.query=queryInput.value});
  queryInput.addEventListener('keydown',e=>{if(e.key==='Enter'&&state.phase==='ACT')ask()});
  entry.append(queryInput);
  const askButton=button(state.busy?'Verifying…':'Query the independent reference',ask,'vxe-primary');
  askButton.disabled=state.phase!=='ACT'||state.busy;
  entry.append(askButton);
  right.append(entry);
  const results=make('div','vxe-results');
  if(state.hits.length){
   put(results,make('p','vxe-eyebrow','INDEX HITS · MATCHES ONLY · SELECT TO VERIFY'));
   const list=make('div','vxe-hit-list');state.hits.forEach(hit=>{
    const b=button(hit.id+' · '+hit.label,()=>inspectRecord(hit.id),'vxe-hit');b.disabled=state.busy;list.append(b)
   });results.append(list)
  }
  right.append(results);
  renderWitness(right);
  container.append(spatial);
  const tail=make('section','vxe-tail');
  const actions=make('div','vxe-actions');
  const bName=button('Name the question',nameQuestion);bName.disabled=state.phase!=='WORLD_ANSWERS';
  actions.append(bName);
  const bRest=button('Rest without penalty',rest,'vxe-rest');bRest.disabled=state.phase==='REST'||state.busy;actions.append(bRest);
  if(state.phase==='REST')actions.append(button('Return to inquiry',resume,'vxe-primary'));
  const exit=make('a','vxe-control vxe-exit','Exit to Universal Encyclopedia ↗');exit.href='/encyclopedia/';actions.append(exit);
  tail.append(actions);
  if(state.phase==='NAME'){
   put(tail,make('p','vxe-eyebrow','HUMAN INTERPRETATION / NO ADMISSION AUTHORITY'));
   const textarea=make('textarea','vxe-name');textarea.rows=3;textarea.value=state.hypothesis;textarea.placeholder='Name the unresolved relation or the precise question to test next…';
   textarea.setAttribute('aria-label','Your local, unsubmitted interpretation');
   textarea.addEventListener('input',()=>{state.hypothesis=textarea.value.slice(0,1000)});
   tail.append(textarea);tail.append(textP('This annotation remains in the current browser memory only. No evidence promotion, no automated authorship closure.','vxe-source-note'))
  }
  const history=make('details','vxe-trace');history.append(make('summary','','Inspect this encounter’s route history ('+state.trace.length+' events)'));
  const list=make('ol','vxe-route-history');state.trace.forEach(x=>list.append(make('li','',String(x.n).padStart(2,'0')+' · '+x.action+(x.id?' · '+x.id:''))));history.append(list);tail.append(history);
  container.append(tail);
 }
 clearInquiry();render();
 return Object.freeze({mounted:true,phase:()=>state.phase,status:()=>state.status,membraneStatus:()=>membrane.status(),history:()=>state.trace.slice(),rest});
}
if(typeof document!=='undefined')mountVixenResearchChamber();
