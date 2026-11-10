/**
 * 𝌋 OPERAHOUSE READING ROOM · independent operator-initiated convergence assay.
 *
 * A Vixen Work and a Universal record may be inspected in one session without
 * becoming the same Opera, a shared Performer, or an admitted crosswalk.
 * No keyword-derived relation, no automatic source passage, no mutation.
 * An admissible record verifies its own bytes, never the proposed relationship.
 * OPERAHOUSE ≠ OPERA ≠ PERFORMER.
 */
import {createVixenReferenceMembrane} from './vixen-read-gateway.mjs';
import {inspectVixenCrossOperaWarrant} from '../vixen-estate/cross-opera-warrant.mjs';

import {setVixenStage} from './vixen-stage-boundary.mjs';
export const ENCOUNTER_SCHEMA='td613.operahouse.independent-witness-encounter/v1';
export const CROSS_ATELIER_WITNESS_CONTRACT='ua:contract:cross_atelier_witness';
const el=(tag,cl='',value)=>{
 const n=document.createElement(tag);
 if(cl)n.className=cl;
 if(value!==undefined)n.textContent=String(value);
 return n;
};
const add=(parent,...children)=>{for(const child of children)if(child)parent.append(child);return parent};
const label=(s)=>el('p','oh-eyebrow',s);
const note=(s)=>el('p','oh-note',s);
const button=(s,fn,disabled=false)=>{
 const b=el('button','oh-button',s);b.type='button';b.disabled=disabled;b.addEventListener('click',fn);return b;
};
const choice=(items,selected,fn,accessible)=>{
 const s=el('select','oh-select');s.setAttribute('aria-label',accessible);
 for(const item of items){const o=el('option','',item.label);o.value=String(item.value);s.append(o)}
 s.value=String(selected);s.addEventListener('change',()=>fn(s.value));return s;
};
const verified=(w)=>Boolean(w&&w.verified_at_interaction===true&&w.authorization==='READ_ONLY'&&
  /^[a-f0-9]{64}$/.test(w.record_sha256||'')&&w.id===w.record?.id);

export function classifyIndependentEncounter({work,source,witness,warrant}={}){
 if(!work?.work_id||!source?.source_file_id||!(work.linked_sources||[]).some(x=>
   x.source_file_id===source.source_file_id&&x.sha256===source.sha256))
   return Object.freeze({state:'HELD_VIXEN_SOURCE_IDENTITY',relation:'UNESTABLISHED',publication_eligible:false});
 if(!verified(witness))
   return Object.freeze({state:'HELD_INDEPENDENT_REFERENCE_WITNESS',relation:'UNESTABLISHED',publication_eligible:false});
 if(warrant?.eligible===true&&warrant?.record_id===witness.id)
   return Object.freeze({state:'WARRANT_PRESENT_NOT_SCIENTIFIC_ENTAILMENT',relation:'HUMAN_RATIFIED_SOURCE_MAPPING_ONLY',publication_eligible:false});
 return Object.freeze({state:'WITNESSED_UNLINKED_PAIR',relation:'UNESTABLISHED',
   reason:'NO_HUMAN_RATIFIED_CROSS_OPERA_WARRANT',publication_eligible:false,
   claim_ceiling:'INDEPENDENT_SOURCE_OBSERVATION_ONLY'});
}

/**
 * Typed session receipt: a dual-source observation with identity coordinates
 * intact. The warrant field remains HELD unless a source-specific external
 * ratification exists; verified bytes cannot silently become a relationship.
 */
export function constructCrossAtelierWitness({work,source,witness,warrant,humanQuestion='',history=[]}={}){
 const disposition=classifyIndependentEncounter({work,source,witness,warrant});
 return Object.freeze({
  schema:CROSS_ATELIER_WITNESS_CONTRACT,version:1,
  disposition:disposition.state,relation:disposition.relation,
  vixen:Object.freeze({
   estate:'EMSTD613',role:'SOURCE_LOCUS',work_id:work?.work_id||null,
   manifestation_id:source?.source_file_id||null,
   declared_manifestation_sha256:source?.sha256||null,
   source_body_access:'UNAVAILABLE_IN_PUBLIC_SURFACE',
   authorship_claim:'UNRESOLVED'
  }),
  universal:Object.freeze({
   estate:'UNIVERSAL_REFERENCE',role:'INDEPENDENT_REFERENCE',
   record_id:verified(witness)?witness.id:null,
   canonical_payload_sha256:verified(witness)?witness.record_sha256:null,
   served_file_sha256:verified(witness)?witness.served_file_sha256:null,
   verified_at_interaction:verified(witness)
  }),
  operator_proposal:Object.freeze({
   text:String(humanQuestion).slice(0,700),source:'HUMAN_SESSION_ONLY',
   evidence_class:'UNRATIFIED_QUESTION_NOT_SOURCE_DATA'
  }),
  admissibility:Object.freeze({
   human_ratified_crosswalk:verified(witness)&&Boolean(warrant?.eligible===true&&warrant.record_id===witness.id),
   lexical_similarity_is_warrant:false,claim_entailment:false,
   source_identity_collapsed:false,publication_eligible:false
  }),
  custody:Object.freeze({
   observer_class:'SESSION_LOCAL_BROWSER',external_trust_root:false,
   route_memory_not_durable_evidence:true,
   empirical_replication_credit:0,
   source_time_claim:'NOT_DERIVED_FROM_LOCAL_OBSERVATION'
  }),
  route_history:Object.freeze((Array.isArray(history)?history:[]).map(e=>Object.freeze({
   sequence:e.sequence,action:e.action,local_observation_time:e.local_observation_time||null
  })))
 });
}
export function mountVixenOperahouseEncounter({host=document.getElementById('operahouseEncounter'),
  corpus,membrane}={}){
 if(!host)return Object.freeze({mounted:false,reason:'NO_OPERAHOUSE_HOST'});
 if(!corpus){
  try{corpus=JSON.parse(document.getElementById('vixen-corpus-bundle')?.textContent||'null')}
  catch(_){corpus=null}
 }
 if(!Array.isArray(corpus?.works)||corpus.works.length!==32){
  host.textContent='HELD · Vixen historical source catalogue unavailable.';
  return Object.freeze({mounted:false,reason:'VIXEN_CORPUS_UNAVAILABLE'});
 }
 const reader=membrane||createVixenReferenceMembrane();
 const state={phase:'NOTICE',restReturn:'NOTICE',work:0,source:0,query:'',hits:[],witness:null,
  graph:[],disposition:null,receipt:null,question:'',service:'UNOPENED',error:null,events:[],seq:0,epoch:0,busy:false};
 const currentWork=()=>corpus.works[state.work];
 const sources=()=>(currentWork().linked_sources||[]);
 const currentSource=()=>sources()[state.source];
 const stamp=(action,extra={})=>state.events.push(Object.freeze({sequence:++state.seq,action,
   evidence_class:'SESSION_LOCAL_INTERACTION_ONLY',
   local_observation_time:new Date().toISOString(),
   original_source_event_time:'NOT_DERIVED',...extra}));
 const rejectPending=()=>{state.epoch+=1;state.busy=false};
 const resetEncounter=()=>{state.disposition=null;state.receipt=null;state.question=''};
 const selectWork=(value)=>{
  const n=Number(value);if(!Number.isInteger(n)||n<0||n>=corpus.works.length)return;
  rejectPending();state.work=n;state.source=0;state.phase='NOTICE';resetEncounter();
  stamp('VIXEN_SOURCE_SELECTED',{work_id:currentWork().work_id});render();
 };
 const selectSource=(value)=>{
  const n=Number(value);if(!Number.isInteger(n)||n<0||n>=sources().length)return;
  rejectPending();state.source=n;resetEncounter();
  stamp('VIXEN_MANIFESTATION_SELECTED',{source_file_id:currentSource()?.source_file_id});render();
 };
 const open=async()=>{
  if(state.phase==='REST'||state.busy)return;
  const token=++state.epoch;state.busy=true;state.error=null;state.phase='CHECKING';render();
  try{
   const status=await reader.open();if(token!==state.epoch)return;
   if(status.state!=='CENSUS_MATCHED')throw Error('REFERENCE_CENSUS_NOT_MATCHED');
   state.service='CENSUS_MATCHED';state.phase='READY';
   stamp('INDEPENDENT_REFERENCE_CENSUS_OBSERVED',{edition:status.edition,
     count:status.records,edges:status.edges,verification:'INDEX_CENSUS_ONLY'});
  }catch(err){
   if(token!==state.epoch)return;
   state.error=String(err.code||err.message||'REFERENCE_UNAVAILABLE');
   state.phase='HELD';stamp('REFERENCE_OPEN_HELD',{reason:state.error});
  }finally{if(token===state.epoch){state.busy=false;render()}}
 };
 const search=()=>{
  if(state.phase==='REST'||state.service!=='CENSUS_MATCHED'||state.busy)return;
  state.error=null;state.witness=null;state.graph=[];resetEncounter();
  const query=state.query.trim();
  if(!query){state.hits=[];state.error='ENTER_AN_INDEPENDENT_QUERY';render();return}
  try{
   state.hits=reader.search(query,{limit:12});
   stamp('EXPLICIT_UNIVERSAL_SEARCH',{query,results:state.hits.length,
     claim_ceiling:'LEXICAL_MATCH_ONLY'});
   state.phase='RESULTS';
  }catch(err){state.error=String(err.code||err.message);state.phase='HELD'}
  render();
 };
 const inspect=async(id)=>{
  if(state.busy||state.phase==='REST')return;
  const token=++state.epoch;state.busy=true;state.witness=null;state.graph=[];resetEncounter();state.error=null;
  state.phase='VERIFYING';render();
  try{
   const witness=await reader.getRecord(id);if(token!==state.epoch)return;
   if(!verified(witness))throw Error('REFERENCE_WITNESS_NOT_VERIFIED');
   state.witness=witness;state.graph=reader.related(id,{limit:12});
   state.phase='WITNESSED';
   stamp('INDEPENDENT_RECORD_BYTES_VERIFIED',{record_id:witness.id,
     canonical_record_payload_sha256:witness.record_sha256,
     served_file_sha256:witness.served_file_sha256,
     provenance:'UNIVERSAL_REFERENCE_ONLY'});
  }catch(err){
   if(token!==state.epoch)return;
   state.error=String(err.code||err.message);state.phase='HELD';
   stamp('RECORD_READ_HELD',{record_id:id,reason:state.error});
  }finally{if(token===state.epoch){state.busy=false;render()}}
 };
 const compare=()=>{
  if(!state.witness||state.phase==='REST')return;
  const warrant=inspectVixenCrossOperaWarrant({work:currentWork(),source:currentSource()});
  state.disposition=classifyIndependentEncounter({
   work:currentWork(),source:currentSource(),witness:state.witness,warrant
  });
  stamp('SEPARATE_ESTATES_OBSERVED',{vixen_work_id:currentWork().work_id,
   vixen_source_id:currentSource()?.source_file_id||null,
   universal_record_id:state.witness.id,
   disposition:state.disposition.state,
   relation:'UNESTABLISHED',human_ratified_crosswalk:false});
  state.receipt=constructCrossAtelierWitness({
   work:currentWork(),source:currentSource(),witness:state.witness,warrant,
   humanQuestion:state.question,history:state.events
  });
  state.phase='OBSERVED';render();
 };
 const rest=()=>{
  if(state.phase==='REST')return;rejectPending();state.restReturn=state.phase;
  state.phase='REST';stamp('OPERATOR_REST',{pending_requests_invalidated:true});render();
 };
 const resume=()=>{
  if(state.phase!=='REST')return;
  // interrupted fetching cannot be resumed as a verified observation
  state.phase=['VERIFYING','CHECKING'].includes(state.restReturn)?
    state.service==='CENSUS_MATCHED'?'READY':'NOTICE':state.restReturn;
  stamp('OPERATOR_RESUMED');render();
 };
 const events=()=>state.events.slice();
 function render(){
  host.replaceChildren();host.dataset.stageRole='OPERAHOUSE';
  add(host,label('OPERAHOUSE · INDEPENDENT WITNESS ROOM · SOURCE FIRST'),
   el('h2','oh-title','A meeting without an identity collapse'),
   note('Vixen and the Universal Encyclopedia remain separate research estates. You choose each source independently. A verified Universal record establishes its own bytes—not a Vixen connection.'),
   el('p','oh-state','STATE · '+state.phase+' · CROSS-OPERA WARRANTS: ZERO ADMITTED'));
  const grid=el('div','oh-grid');
  const left=el('section','oh-estate');
  left.dataset.estate='EMSTD613';left.dataset.stageRole='SOURCE_LOCUS';
  add(left,label('01 · VIXEN · HISTORICAL SOURCE ESTATE'),el('h3','','One Work; its documented manifestation'),
   choice(corpus.works.map((w,i)=>({value:i,label:String(i+1).padStart(2,'0')+' · '+(w.display_title||w.declared_title||w.work_id)})),
    state.work,selectWork,'Choose a Vixen historical Work'),
   note('Work ID: '+currentWork().work_id+' · Authorship: '+(currentWork().authorship||'UNRESOLVED')));
  if(sources().length){
   left.append(choice(sources().map((s,i)=>({value:i,label:s.original_filename||s.source_file_id})),
    state.source,selectSource,'Choose a Vixen manifestation'));
   add(left,note('Manifestation ID: '+(currentSource()?.source_file_id||'UNRECORDED')),
    note('Declared source SHA-256: '+(currentSource()?.sha256||'UNRECORDED')),
    note('Vixen source bodies remain withheld; declared hashes are not content verification.'));
  }else left.append(note('HELD · No documented manifestation for this Work.'));
  const right=el('section','oh-estate oh-reference');
  right.dataset.estate='UNIVERSAL_REFERENCE';right.dataset.stageRole='INDEPENDENT_REFERENCE';
  add(right,label('02 · UNIVERSAL ENCYCLOPEDIA · INDEPENDENT SOURCE ESTATE'),
   el('h3','','Operator-selected reference witness'),
   note('Edition 1.4 · 1,141 records · 2,131 indexed relations. No record is loaded or paired automatically.'));
  if(state.service!=='CENSUS_MATCHED')right.append(button(state.busy?'Checking index…':'Open independent read-only estate',open,state.busy||state.phase==='REST'));
  else{
   const q=el('input','oh-input');q.type='search';q.placeholder='Your independent Universal query…';q.value=state.query;
   q.setAttribute('aria-label','Search independent Universal index');
   q.addEventListener('input',()=>{state.query=q.value.slice(0,200)});
   q.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();search()}});
   add(right,q,button('Search Universal separately',search,state.busy||state.phase==='REST'));
  }
  if(state.hits.length){
   const results=el('div','oh-results');
   results.append(label('LEXICAL RESULTS · NOT VIXEN PERFORMERS'));
   for(const hit of state.hits)results.append(button(hit.id+' · '+hit.label,()=>inspect(hit.id),
     state.busy||state.phase==='REST'));
   right.append(results);
  }else if(state.phase==='RESULTS')right.append(note('ZERO lexical matches in the independent Universal index.'));
  if(state.witness){
   const details=el('details','oh-payload');const summary=el('summary','','Inspect bounded canonical record text');details.append(summary);
   const raw=JSON.stringify(state.witness.record,null,2);
   details.append(el('pre','',raw.slice(0,6000)));
   const relationList=el('details','oh-payload');
   relationList.append(el('summary','','Inspect recorded Universal-only graph edges'));
   const edges=el('ol','oh-edges');
   for(const edge of state.graph)edges.append(el('li','',
     edge.source+' · '+edge.type+' · '+edge.target+' · not a Vixen relation'));
   relationList.append(edges);
   add(right,label('VERIFIED INDEPENDENT REFERENCE · '+state.witness.id),
    el('h4','',state.witness.record.label||state.witness.id),
    note('Canonical JSON payload SHA-256: '+state.witness.record_sha256),
    note('Served file SHA-256: '+state.witness.served_file_sha256),
    note('Read-only graph edges: '+state.graph.length+' (recorded Universal graph edges; never cross-estate proof)'),
    details,relationList);
  }
  if(state.error)right.append(el('p','oh-error','HELD · '+state.error));
  grid.append(left,right);host.append(grid);
  if(state.witness&&state.phase!=='REST'){
    const question=el('textarea','oh-question');question.rows=3;
    question.placeholder='Optional: formulate a question the evidence cannot yet answer…';
    question.setAttribute('aria-label','Operator-authored unratified research question');
    question.value=state.question;
    question.addEventListener('input',()=>{state.question=question.value.slice(0,700)});
    host.append(label('HUMAN PROPOSAL · CANNOT PROMOTE EVIDENCE'));
    host.append(question);
    host.append(button('Observe separately — do not ratify a relationship',compare));
  }
  if(state.disposition){
   const d=el('section','oh-disposition');d.dataset.encounterState=state.disposition.state;
   add(d,label('THIRD-ORDER RECEIPT · INDEPENDENT SOURCES'),
    el('h3','',state.disposition.state),
    note('Vixen: '+currentWork().work_id+' / '+(currentSource()?.source_file_id||'UNRECORDED')),
    note('Universal: '+state.witness.id+' / '+state.witness.record_sha256),
    note('Relationship: '+state.disposition.relation+' · Publication eligibility: false'),
    note('The original Vixen source body is unavailable; an independently verified Universal record cannot supply that missing source or establish shared authorship.'));
   if(state.receipt){
     const receipt=el('details','oh-payload');
     receipt.append(el('summary','','Inspect typed cross-atêlier session witness (not an admitted crosswalk)'));
     receipt.append(el('pre','',JSON.stringify(state.receipt,null,2)));
     d.append(receipt);
   }
   host.append(d);
  }
  const footer=el('div','oh-footer');
  footer.append(button(state.phase==='REST'?'Resume without penalty':'Rest without penalty',
    state.phase==='REST'?resume:rest));
  footer.append(button('Return to Vixen Opera — independent reference leaves the stage',()=>{
    const chamber=document.getElementById('vixenReferenceChamber');
    if(!chamber)return;
    setVixenStage('VIXEN');
  }));
  const path=el('details','oh-history');path.append(el('summary','','Session-only custody route ('+state.events.length+' events)'));
  const list=el('ol','');for(const event of state.events)list.append(el('li','',event.sequence+' · '+event.action));
  path.append(list);footer.append(path);host.append(footer);
  host.append(note('CUSTODY CEILING · This session log has no durable append-only trust root. Index census, verified record bytes, source identity and substantive relationship remain separate evidentiary coordinates. No production admission, identity closure or Experiment B Flight.'));
 }
 stamp('OPERAHOUSE_NOTICE');render();
 return Object.freeze({mounted:true,phase:()=>state.phase,history:events,
  service:()=>state.service,disposition:()=>state.disposition,rest,resume});
}
if(typeof document!=='undefined')mountVixenOperahouseEncounter();
