/**
 * 𝌋 THE PODIUM · machine-legible research route, not a human UI or autonomous
 * agent. OPERAHOUSE ≠ OPERA ≠ PERFORMER. Explicit task intent is required.
 *
 * No ambient credentials, external agents, import/admission, release, merge,
 * personal data access, or privileged execution. A supplied native adapter
 * runs only via an independent host-provided authorization boolean.
 */
import {createVixenReferenceMembrane} from './vixen-read-gateway.mjs';
import {constructCrossAtelierWitness} from './vixen-operator-encounter.mjs';
import {composeSalonPlan,refractSalonPlan} from '../vixen-estate/synthesis-salon-engine.mjs';
import {inspectVixenCrossOperaWarrant} from '../vixen-estate/cross-opera-warrant.mjs';

export const PODIUM_SCHEMA='td613.vixen.podium.task/v1';
export const PODIUM_RECEIPT='td613.vixen.podium.receipt/v1';
export const PODIUM_ROUTES=Object.freeze([
 'podium.describe','vixen.work.inspect','vixen.gates.inspect',
 'universal.open','universal.search','universal.get','universal.related',
 'synthesis.propose','vixen.salon.compose','experiment_b.preregister',
 'engine.capabilities','engine.invoke'
]);
export const BOUNDED_ENGINE_OPERATIONS=Object.freeze({
 ATLAS:Object.freeze(['compare_routes','trace_relations']),
 RULEFIELD:Object.freeze(['assess_roles','propose_rulefield']),
 APERTURE:Object.freeze(['audit_epistemic_deficit']),
 DOLLHOUSE:Object.freeze(['audit']),
 UNIVERSAL_ATELIER:Object.freeze(['search','get','cite','neighbors','route','context','verify'])
});
const RX_SHA=/^[a-f0-9]{64}$/;
const text=(x,max=500)=>typeof x==='string'?x.slice(0,max):'';
const recordId=id=>typeof id==='string'&&/^[A-Z][A-Z0-9]*-[A-Z0-9][A-Z0-9_-]{0,95}$/.test(id);
const rejection=(state,reason)=>({state,reason,scientific_claim:'UNESTABLISHED'});
const census=corpus=>({
 works:corpus.works.length,manifestations:corpus.works.reduce((n,w)=>n+(w.linked_sources||[]).length,0),
 gates:corpus.human_gates.length,protocols:corpus.instruments.length
});
const safeRecord=w=>({
 estate:'EMSTD613',role:'PERFORMER',work_id:w.work_id,
 title:w.display_title||w.declared_title||w.work_id,
 identity_status:w.identity_status||'UNRESOLVED',authorship:w.authorship||'UNRESOLVED',
 linked_sources:(w.linked_sources||[]).map(s=>({
  source_file_id:s.source_file_id,original_filename:s.original_filename,
  sha256:s.sha256||null,media_type:s.media_type||null,
  source_body_access:'UNAVAILABLE_IN_PUBLIC_SURFACE'
 }))
});
export function createVixenPodium({corpus,membrane=null,engineAdapters={},
  operatorAuthorized=false,sourceRevision='UNVERIFIED_EXTERNAL_INPUT'}={}){
 const counts=corpus&&Array.isArray(corpus.works)&&Array.isArray(corpus.human_gates)&&
  Array.isArray(corpus.instruments)?census(corpus):null;
 if(!counts||counts.works!==32||counts.manifestations!==53||counts.gates!==8||counts.protocols!==21)
   throw new TypeError('VIXEN_PODIUM_CENSUS_MISMATCH_FAIL_CLOSED');
 if(!corpus.works.every(w=>typeof w.work_id==='string'&&w.work_id.length>0&&
   Array.isArray(w.linked_sources)) ||new Set(corpus.works.map(w=>w.work_id)).size!==32)
   throw new TypeError('VIXEN_PODIUM_IDENTITY_BOUNDARY_FAILED');
 const reader=membrane||createVixenReferenceMembrane();
 if(!reader||!['open','search','getRecord','related','status'].every(k=>typeof reader[k]==='function'))
   throw new TypeError('PODIUM_REFERENCE_READER_CONTRACT_MISSING');
 const state={opened:false,seen:new Map(),events:[],seq:0,epoch:0};
 const event=(action,extra={})=>{
  const e=Object.freeze({sequence:++state.seq,action,observation_time:new Date().toISOString(),
    recording_class:'VOLATILE_SESSION_NOT_APPEND_ONLY_PROOF',...extra});
  state.events.push(e);return e;
 };
 const receipt=(intent,status,result)=>{
  const value=Object.freeze({
   schema:PODIUM_RECEIPT,task_schema:PODIUM_SCHEMA,intent,
   status,result,
   evidence_class:'SOURCE_FREE_READ_ONLY_BOUNDED',
   source_revision_declared:sourceRevision,
   source_revision_externally_verified:false,
   current_sequence:state.seq,
   authority:Object.freeze({
    operator_closure:'RESERVED',merge:false,release:false,deployment:false,
    experiment_b_flight:'HELD',identity_adjudication:false,
    automatic_cross_opera_mapping:false,empirical_replication_credit:0
   })
  });
  return value;
 };
 const run=async task=>{
  if(!task||typeof task!=='object'||Array.isArray(task)||task.schema!==PODIUM_SCHEMA ||
    !PODIUM_ROUTES.includes(task.intent))
   return receipt(text(task?.intent,100)||'UNKNOWN','HELD',rejection('HELD_TASK_CONTRACT','Exact declared intent and schema required'));
  const intent=task.intent,params=task.params||{};
  if(!params||typeof params!=='object'||Array.isArray(params))
   return receipt(intent,'HELD',rejection('HELD_INVALID_PARAMETERS','Parameters must be a typed object'));
  try{
   if(intent==='podium.describe'){
    event('MACHINE_ROUTE_INSPECTED');
    return receipt(intent,'SUPPORTED',{
     podium:'MACHINE_FACING_RESEARCH_CONDUCTOR',roles:['OPERAHOUSE','OPERA','PERFORMER'],
     counts,available_routes:PODIUM_ROUTES,reader_state:reader.status().state,
     source_revision:sourceRevision,external_engine_connection:'EXPLICIT_ADAPTER_ONLY',
     route_memory:'SESSION_LOCAL_ONLY'
    });
   }
   if(intent==='vixen.work.inspect'){
    const id=text(params.work_id,160);
    const w=corpus.works.find(x=>x.work_id===id);
    event('VIXEN_WORK_LOOKUP',{work_id:id,found:Boolean(w)});
    return receipt(intent,w?'SUPPORTED':'HELD',w? safeRecord(w):
      rejection('HELD_WORK_NOT_FOUND','No such historical Vixen Work'));
   }
   if(intent==='vixen.gates.inspect'){
    event('VIXEN_GATE_CENSUS_INSPECTED');
    return receipt(intent,'SUPPORTED',{
     gates:corpus.human_gates.map(g=>({
      gate_num:g.gate_num,
      status:'UNADJUDICATED_PAIR',
      source_identity:'SEPARATE_MD_AND_PDF_MANIFESTATIONS',
      substantive_equivalence:'HUMAN_EDITORIAL_REVIEW_REQUIRED'
     })),automated_adjudication:false
    });
   }
   if(intent==='universal.open'){
    event('UNIVERSAL_CENSUS_REQUESTED');
    const x=await reader.open();
    if(x.state==='CENSUS_MATCHED'){
     state.opened=true;event('UNIVERSAL_CENSUS_MATCHED',{records:x.records,edges:x.edges});
     return receipt(intent,'SUPPORTED',{state:x.state,edition:x.edition,records:x.records,edges:x.edges,
       provenance:'INDEX_SELF_CONSISTENCY_NOT_EXTERNAL_ORIGIN'});
    }
    return receipt(intent,'HELD',rejection('HELD_REFERENCE_CENSUS','Reference not independently opened'));
   }
   if(intent==='universal.search'){
    if(!state.opened)return receipt(intent,'HELD',rejection('HELD_INDEX_NOT_OPEN','Call universal.open first'));
    const q=text(params.query,200).trim();if(!q)return receipt(intent,'HELD',rejection('HELD_EMPTY_QUERY','Operator must supply query'));
    const hits=reader.search(q,{limit:Math.min(24,Math.max(1,Number(params.limit)||12))});
    event('UNIVERSAL_LEXICAL_SEARCH',{query:q,count:hits.length,classification:'LEXICAL_MATCH_NOT_RELATION'});
    return receipt(intent,'SUPPORTED',{query:q,hits,claim_ceiling:'SEARCH_MATCH_ONLY_NOT_ENTAILMENT'});
   }
   if(intent==='universal.get'){
    if(!state.opened)return receipt(intent,'HELD',rejection('HELD_INDEX_NOT_OPEN','Call universal.open first'));
    const id=text(params.record_id,100);
    if(!recordId(id))return receipt(intent,'HELD',rejection('HELD_REFERENCE_ID','Invalid canonical record ID'));
    const witness=await reader.getRecord(id);
    if(!witness?.verified_at_interaction||!RX_SHA.test(witness.record_sha256||'')||witness.id!==id)
      return receipt(intent,'HELD',rejection('HELD_RECORD_NOT_VERIFIED','Canonical byte witness unavailable'));
    state.seen.set(id,witness);
    event('UNIVERSAL_RECORD_BYTES_VERIFIED',{record_id:id,sha256:witness.record_sha256});
    return receipt(intent,'SUPPORTED',{
     estate:'UNIVERSAL_REFERENCE',record_id:id,record:witness.record,
     canonical_sha256:witness.record_sha256,served_file_sha256:witness.served_file_sha256,
     source_path:witness.source_path,
     claim_ceiling:'CANONICAL_PAYLOAD_SHA256_VERIFIED_NOT_CLAIM_ENTAILMENT'
    });
   }
   if(intent==='universal.related'){
    if(!state.opened)return receipt(intent,'HELD',rejection('HELD_INDEX_NOT_OPEN','Call universal.open first'));
    const id=text(params.record_id,100);
    if(!recordId(id)||!state.seen.has(id))
      return receipt(intent,'HELD',rejection('HELD_SOURCE_NOT_VERIFIED','First verify the exact reference record'));
    const edges=reader.related(id,{limit:Math.min(24,Math.max(1,Number(params.limit)||12))});
    event('UNIVERSAL_GRAPH_RELATIONS_READ',{record_id:id,count:edges.length});
    return receipt(intent,'SUPPORTED',{record_id:id,edges,
     claim_ceiling:'UNIVERSAL_GRAPH_EDGE_NOT_CROSS_ESTATE_CAUSAL_PROOF'});
   }
   if(intent==='synthesis.propose'){
    const work=corpus.works.find(w=>w.work_id===text(params.work_id,160));
    const source=work?.linked_sources.find(s=>s.source_file_id===text(params.source_id,160));
    const id=text(params.record_id,100),witness=state.seen.get(id);
    if(!work||!source)return receipt(intent,'HELD',rejection('HELD_VIXEN_SOURCE_IDENTITY','Historical Work/manifestation pair absent'));
    if(!witness)return receipt(intent,'HELD',rejection('HELD_REFERENCE_NOT_VERIFIED','Verify explicit Universal record first'));
    const warrant=inspectVixenCrossOperaWarrant({work,source});
    const proposal=constructCrossAtelierWitness({
     work,source,witness,warrant,humanQuestion:text(params.question,700),history:state.events
    });
    event('CROSS_ATELIER_UNRATIFIED_PROPOSAL',{
     vixen_work_id:work.work_id,source_id:source.source_file_id,record_id:id,
     state:proposal.disposition,claim:'UNESTABLISHED'
    });
    return receipt(intent,'HELD',{
     ...proposal,state:'WITNESSED_UNLINKED_PAIR',
     question_need:'INDEPENDENT_EVIDENCE_AND_HUMAN_WARRANT_REQUIRED',
     no_automatic_promotion:true,
     scientific_surplus:'UNESTABLISHED'
    });
   }
   if(intent==='vixen.salon.compose'){
    const plan=composeSalonPlan(corpus,params);
    event('VIXEN_SOURCE_BOUND_THEORY_PROPOSED',{
     source_work_ids:plan.source_coordinates.map(x=>x.work_id),
     status:'OPEN_FIELD_UNRATIFIED_QUESTION',
     independent_source_body_observed:false
    });
    return receipt(intent,'HELD',{
     state:'CREATIVE_PROPOSAL_AWAITING_HUMAN_REVIEW',plan,
     claim_ceiling:'SOURCE_METADATA_PLUS_OPERATOR_QUESTION_NOT_SCIENCE'
    });
   }
   if(intent==='experiment_b.preregister'){
    const plan=composeSalonPlan(corpus,params);
    const counterfactual=refractSalonPlan(corpus,params);
    event('EXPERIMENT_B_PROSPECTIVE_PREREG_ONLY',{
     experiment_b_flight:'HELD',
     human_closure:'RESERVED',
     same_terminal_sources:true,
     distinct_route_history:true
    });
    return receipt(intent,'HELD',{
     state:'PREREGISTRATION_CANDIDATE_ONLY',
     baseline:'COMPETENT_UNION_MATCHED_CONTROL',
     plan:plan.experiment_b,counterfactual,
     source_coordinates:plan.source_coordinates,
     experiment_b_flight:'HELD',release_authority:false,
     manifest_succession:'UNKNOWN',empirical_replication_credit:0
    });
   }
   if(intent==='engine.capabilities'){
    event('ENGINE_CAPABILITIES_INSPECTED');
    return receipt(intent,'SUPPORTED',{
     adapters:Object.fromEntries(Object.entries(BOUNDED_ENGINE_OPERATIONS).map(([k,ops])=>
      [k,{connected:typeof engineAdapters[k]==='function',allowed_operations:ops}])),
     native_receiver_status:'SEPARATE_LINEAGE_NOT_AUTO_CONNECTED',
     no_execution_without_host_explicit_authority:true
    });
   }
   if(intent==='engine.invoke'){
    const engine=text(params.engine,64),operation=text(params.operation,80);
    const allowed=BOUNDED_ENGINE_OPERATIONS[engine];
    if(!allowed||!allowed.includes(operation))
      return receipt(intent,'HELD',rejection('HELD_ENGINE_OPERATION_NOT_ALLOWED','No write/admission/elevation routes'));
    if(operatorAuthorized!==true)
      return receipt(intent,'HELD',rejection('HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED','Task JSON cannot grant execution authority'));
    const adapter=engineAdapters[engine];
    if(typeof adapter!=='function')
      return receipt(intent,'HELD',rejection('HELD_ENGINE_NOT_CONNECTED','No native tool adapter installed for this host'));
    const payload=params.payload??{};
    if(!payload||typeof payload!=='object'||Array.isArray(payload))
      return receipt(intent,'HELD',rejection('HELD_INVALID_ENGINE_PAYLOAD','Expected typed object'));
    event('EXPLICIT_ENGINE_ADAPTER_INVOKED',{engine,operation,authority:'HOST_PASSED_ONLY'});
    const output=await adapter({operation,payload,claim_ceiling:'ADAPTER_RESULT_NOT_SCIENTIFIC_PROMOTION'});
    const serialized=JSON.stringify(output);
    if(typeof serialized!=='string'||serialized.length>50000)
      return receipt(intent,'HELD',rejection('HELD_ADAPTER_OUTPUT_TOO_LARGE','Bounded result exceeded 50k characters'));
    return receipt(intent,'HELD',{
     state:'UNVERIFIED_ENGINE_ADAPTER_RETURN',engine,operation,output,
     native_engine_execution_claim:'EXTERNAL_HOST_RESPONSIBLE_FOR_PROVENANCE',
     endorsement:false,adjudication:false,scientific_credit:0
    });
   }
  }catch(error){
   event('TASK_REFUSED',{intent,error_code:String(error?.code||'INTERNAL_FAILURE').slice(0,80)});
   return receipt(intent,'HELD',rejection(
    text(error?.code,100)||'HELD_EXECUTION_FAILURE',text(error?.message,300)||'Execution failed closed'
   ));
  }
 };
 return Object.freeze({
  schema:PODIUM_SCHEMA,routes:()=>[...PODIUM_ROUTES],
  dispatch:run,history:()=>state.events.slice(),
  state:()=>Object.freeze({opened:state.opened,verified_record_ids:[...state.seen.keys()],
   engine_adapter_count:Object.keys(engineAdapters).filter(k=>typeof engineAdapters[k]==='function').length,
   evidence:'VOLATILE_SESSION_ONLY'})
 });
}
