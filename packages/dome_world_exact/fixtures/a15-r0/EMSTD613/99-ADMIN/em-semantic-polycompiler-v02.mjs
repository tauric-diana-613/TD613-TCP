/**
 * Native Em Work/manifestation role compiler using SRC's exact shared
 * contextual-role assembler. Builds PROVISIONAL research views from read-only
 * primary metadata. The 8 human-gated SAME_WORK_SUPPORTED bundles stay partial.
 */
import { emRegistry } from './em-native-parity-v02.mjs';
import { assemblePolycompiler,roleAblation,traceTypedCompilations }
 from '../../ATELIER_METHOD/atelier-semantic-polycompiler-v02.mjs';
const guard=(v,msg)=>{if(!v)throw Error(msg)};
export function emContextualLineage(){
 const reg=emRegistry();
 const snapshot_id='EM_PR962_NATIVE_REGISTERED_CUSTODY',seal_id='NO_CRYPTOGRAPHIC_SEAL_EM_LOCAL_MANIFEST';
 const bySource=new Map(reg.source_rows.map(x=>[x.source_file_id,x]));
 const byWork=new Map(reg.works.map(x=>[x.work_id,x]));
 const roles=[],passes=[];
 for(const work of reg.works) {
  const rows=reg.manifestations.filter(x=>x.work_id===work.work_id);
  guard(rows.length>0,'EM_WORK_WITHOUT_REGISTERED_MANIFESTATIONS');
  const assertions=[];
  for(const row of rows){
   const src=bySource.get(row.source_file_id);
   guard(src,'EM_MANIFESTATION_SOURCE_MISSING');
   guard(row.work_id===work.work_id,'EM_WORK_FOREIGN_MANIFESTATION');
   const id='em:contextual-work-link:'+row.source_file_id;
   let state='PARTIAL',source_status='ARCHIVE_INFERRED';
   if(row.identity_status==='SAME_WORK_CONFIRMED'||row.identity_status==='SINGLETON_WORK_SURFACE'){
    state='WITNESSED';source_status='ARCHIVE_DERIVED';
   } else guard(row.identity_status==='SAME_WORK_SUPPORTED','EM_UNKNOWN_LINK_IDENTITY_STATUS');
   assertions.push(id);
   roles.push({
    contextual_role_assertion_id:id,subject_id:row.source_file_id,
    architecture_id:work.work_id,role_normalized:row.relation,
    role_raw:row.identity_status,source_status,adjudication_status:state,
    evidence_ids:['emsource-sha256:'+src.sha256],
    interpretive_limit:row.identity_status==='SAME_WORK_SUPPORTED'?
     'SUPPORTED_WORK_GROUP_HUMAN_GATE_NO_SAME_WORK_PROMOTION':
     row.identity_status==='SINGLETON_WORK_SURFACE'?
      'ONE_OBSERVED_MANIFESTATION_NO_ASSERTION_OF_OTHER_UNOBSERVED_WORKS':
      'REGISTERED_IDENTITY_GROUP_NO_INDEPENDENT_AUTHORSHIP_OR_THEOREM_PROOF',
    scope:{identity_status:row.identity_status,human_gate_required:row.human_gate_required,
      exact_source_sha256:src.sha256},
    atelier_snapshot_id:snapshot_id,seal_epoch_binding:'RESOLVE_MATCHED_CURRENT_SEAL',
    asserted_at:null,relation_provenance_mode:'RETROSPECTIVE'
   });
  }
  passes.push({
   compilation_pass_id:'em:work-pass:'+work.work_id,
   build_target_id:work.work_id,input_ids:[...work.manifestation_source_file_ids],
   input_role_assertion_ids:assertions,contextual_role_count:assertions.length,
   compiler_id:work.work_id,
   atelier_snapshot_id:snapshot_id,seal_epoch_binding:'RESOLVE_MATCHED_CURRENT_SEAL',
   source_status:'SOURCE_MANIFEST_ARCHIVE_ONLY',
   interpretive_limit:'EM Native Work grouping; no scientific or identity confidence promotion'
  });
 }
 const model=assemblePolycompiler({snapshot_id,seal_id,compilation_passes:passes,role_assertions:roles});
 return {model,claims:{
  native_work_count:reg.works.length,native_manifestation_count:roles.length,
  manifest_identity_counts:Object.fromEntries(
   [...new Set(reg.manifestations.map(x=>x.identity_status))].map(s=>
    [s,reg.manifestations.filter(x=>x.identity_status===s).length])),
  held_identity_sensitivity:[32,40],
  native_relation_register_state:reg.meta.registry_states.relations,
  relation_register_rewritten:false,
  cryptographic_seal_verified:false,
  claim_ceiling:'EM_NATIVE_WORK_CONTEXT_VIEW_NO_SCIENTIFIC_OR_AUTHOR_IDENTITY_PROMOTION'
 }};
}
export function emContextualWorkCounterfactual(work_id,source_file_id){
 const {model}=emContextualLineage();
 return {
  direct:traceTypedCompilations(model,{from:source_file_id,to:work_id,max_hops:1}),
  withdrawal:roleAblation(model,{target_id:work_id,
    withdraw_assertion_ids:['em:contextual-work-link:'+source_file_id]})
 };
}
