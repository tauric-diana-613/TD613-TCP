/**
 * TD613 Universal Atelier · source-role polycompilation v0.2 candidate
 * Composes source-declared *research assertions*, not a theory's truth.
 * No inference from similarity, no source writes, no authority transfer.
 * A role is contextual to architecture/epoch. WITNESSED is not transitive.
 */
const check=(v,s)=>{if(!v)throw Error(s)};
const has=x=>typeof x==="string"&&x.trim().length>0;
const unique=a=>new Set(a).size===a.length;
const order=(a,b)=>String(a).localeCompare(String(b));
const sorted=a=>a.slice().sort(order);
const WITNESS="WITNESSED", CANDIDATE="CANDIDATE";
const nativeStates=new Set(["WITNESSED","UNRESOLVED","CANDIDATE","PARTIAL",
  "MULTIPLE_TITLE_ALIGNED_CANDIDATES","WITNESSED_CONCEPT_NAMES_CANDIDATE_WORK_MAPPING",
  "TITLE_ALIGNED_CANDIDATE"]);
function evidenceCeiling(role) {
  if(role.adjudication_status==="WITNESSED" && role.source_status==="EXPLICIT_SOURCE")
    return "EXPLICIT_SOURCE_WITNESSED_CONTEXTUAL_ROLE";
  if(role.adjudication_status==="WITNESSED")
    return "ARCHIVE_CLASSIFIED_CONTEXTUAL_ROLE_WITHOUT_DIRECT_SOURCE_PROOF";
  if(role.adjudication_status==="UNRESOLVED")return "UNRESOLVED_CONTEXTUAL_ROLE";
  return "PARTIAL_OR_CANDIDATE_CONTEXTUAL_ROLE";
}
const promote=(a,b)=>a==="EXPLICIT_SOURCE_WITNESSED_CONTEXTUAL_ROLE"&&
 b==="EXPLICIT_SOURCE_WITNESSED_CONTEXTUAL_ROLE"?
 "MULTIHOP_EXPLICIT_PATH_NO_DIRECT_RELATION":"MULTIHOP_MIXED_OR_CANDIDATE_PATH_NO_DIRECT_RELATION";

/**
 * The assembler must account for EVERY assertion ID and its target and epoch,
 * reject hidden duplicate IDs, and preserve the native provenance/class ceiling.
 * A missing or extra per-pass role is a hard violation.
 */
export function assemblePolycompiler({snapshot_id,seal_id,compilation_passes,role_assertions}){
 check(has(snapshot_id)&&has(seal_id),"POLYCOMPILER_EPOCH_AND_SEAL_REQUIRED");
 check(Array.isArray(compilation_passes)&&Array.isArray(role_assertions),"POLYCOMPILER_ARRAYS_REQUIRED");
 const roles=new Map();
 for(const a of role_assertions) {
  check(has(a.contextual_role_assertion_id)&&!roles.has(a.contextual_role_assertion_id),"ROLE_DUPLICATE_OR_MISSING_ID");
  check(a.atelier_snapshot_id===snapshot_id&&a.seal_epoch_binding==="RESOLVE_MATCHED_CURRENT_SEAL",
    "ROLE_EPOCH_OR_SEAL_CONTRACT");
  check(has(a.architecture_id)&&has(a.subject_id)&&has(a.role_normalized)&&
    nativeStates.has(a.adjudication_status)&&has(a.source_status)&&has(a.interpretive_limit),
    "ROLE_FIELDS_OR_ADJUDICATION_UNRECOGNIZED");
  check(Array.isArray(a.evidence_ids),"ROLE_EVIDENCE_LIST_REQUIRED");
  roles.set(a.contextual_role_assertion_id,a);
 }
 const targetPasses=new Map(),used=new Set();
 for(const p of compilation_passes) {
  check(has(p.compilation_pass_id)&&!targetPasses.has(p.compilation_pass_id),"COMPILATION_ID_COLLISION");
  check(p.atelier_snapshot_id===snapshot_id&&p.seal_epoch_binding==="RESOLVE_MATCHED_CURRENT_SEAL",
    "COMPILATION_EPOCH_OR_SEAL_CONTRACT");
  check(has(p.build_target_id)&&Array.isArray(p.input_role_assertion_ids)&&
    Array.isArray(p.input_ids)&&
    p.contextual_role_count===p.input_role_assertion_ids.length &&
    unique(p.input_role_assertion_ids),"COMPILATION_ROLE_SET_INCONSISTENT");
  const compiled=[];
  for(const id of p.input_role_assertion_ids) {
   check(roles.has(id),"COMPILATION_UNBOUND_ROLE_ID");
   check(!used.has(id),"ROLE_REUSED_ACROSS_COMPILERS_WITHOUT_NEW_CONTEXT");
   used.add(id);
   const a=roles.get(id);
   check(a.architecture_id===p.build_target_id,"COMPILATION_ROLE_TARGET_MISMATCH");
   const ceiling=evidenceCeiling(a);
   compiled.push({
    role_assertion_id:id,subject_id:a.subject_id,architecture_id:a.architecture_id,
    relation_type:a.role_normalized,raw_role:a.role_raw,context_scope:a.scope??{},
    source_status:a.source_status,adjudication_status:a.adjudication_status,
    evidence_ids:[...a.evidence_ids],
    ceiling,interpretive_limit:a.interpretive_limit,
    assertion_time:a.asserted_at??null,relation_provenance_mode:a.relation_provenance_mode,
    direct_role_assertion:true
   });
  }
  targetPasses.set(p.compilation_pass_id,{
   compilation_pass_id:p.compilation_pass_id,build_target_id:p.build_target_id,
   input_ids:[...p.input_ids],roles:compiled.sort((x,y)=>order(x.role_assertion_id,y.role_assertion_id)),
   source_status:p.source_status,interpretive_limit:p.interpretive_limit
  });
 }
 check(used.size===roles.size,"ORPHAN_ROLE_ASSERTION");
 return {
  schema:"td613.atelier-contextual-polycompilation/v0.2",
  snapshot_id,seal_id,pass_count:targetPasses.size,role_count:roles.size,
  passes:[...targetPasses.values()].sort((a,b)=>order(a.compilation_pass_id,b.compilation_pass_id)),
  claim_ceiling:"NATIVE_CONTEXTUAL_ROLE_RECONSTRUCTION_NO_GENERAL_SEMANTIC_OR_CAUSAL_TRUTH"
 };
}

/** Source/role-specific chain search, with explicit non-lifting, no cycles. */
export function traceTypedCompilations(model,{from,to,max_hops=3,allowed_roles=null,blocked_assertions=[]}){
 check(has(from)&&has(to)&&Number.isInteger(max_hops)&&max_hops>=1&&max_hops<=6,"TRACE_QUERY_INVALID");
 check(Array.isArray(blocked_assertions)&&blocked_assertions.every(has),"TRACE_EXCLUSION_INVALID");
 const banned=new Set(blocked_assertions);
 const allowed=allowed_roles?new Set(allowed_roles):null;
 const edges=model.passes.flatMap(p=>p.roles.filter(r=>
  !banned.has(r.role_assertion_id)&&(allowed===null||allowed.has(r.relation_type)))
  .map(r=>({...r})));
 const result=[];
 const walk=(node,path,visited)=>{
  if(path.length>=max_hops)return;
  for(const edge of edges.filter(x=>x.subject_id===node)){
   if(visited.has(edge.architecture_id))continue;
   const chain=[...path,edge];
   if(edge.architecture_id===to){
    result.push({from,to,hop_count:chain.length,
      assertion_ids:chain.map(x=>x.role_assertion_id),
      roles:chain.map(x=>x.relation_type),
      evidence_ids:sorted([...new Set(chain.flatMap(x=>x.evidence_ids))]),
      path_ceiling:chain.length===1?chain[0].ceiling:
       chain.reduce((s,x,i)=>i===0?x.ceiling:promote(s,x.ceiling),""),
      direct_relation_admitted:chain.length===1&&
       chain[0].ceiling==="EXPLICIT_SOURCE_WITNESSED_CONTEXTUAL_ROLE",
      scientific_causality_admitted:false,
      independent_source_families_established:false});
   }else walk(edge.architecture_id,chain,new Set([...visited,edge.architecture_id]));
  }
 };
 walk(from,[],new Set([from]));
 return {from,to,max_hops,status:result.length?"BOUNDED_TYPED_PATHS":"NO_ADMISSIBLE_TYPED_PATH",
  routes:result.sort((a,b)=>a.hop_count-b.hop_count||order(a.assertion_ids.join("|"),b.assertion_ids.join("|"))),
  ceiling:"NO_NEW_DIRECT_EDGE_OR_INDEPENDENT_EVIDENCE_FROM_PATH_COMPOSITION"};
}

/** Withdrawal is prospective structural sensitivity, not proof of causal effect. */
export function roleAblation(model,{target_id,withdraw_assertion_ids=[]}){
 check(has(target_id)&&Array.isArray(withdraw_assertion_ids),"ROLE_ABLATION_INPUT_INVALID");
 const banned=new Set(withdraw_assertion_ids);
 const before=model.passes.filter(p=>p.build_target_id===target_id).flatMap(p=>p.roles);
 const kept=before.filter(r=>!banned.has(r.role_assertion_id));
 const withdrawn=before.filter(r=>banned.has(r.role_assertion_id));
 const statuses=rows=>Object.fromEntries([...new Set(rows.map(x=>x.ceiling))].sort().map(k=>
  [k,rows.filter(x=>x.ceiling===k).length]));
 return {target_id,original_roles:before.length,retained_roles:kept.length,
   withdrawn_roles:withdrawn.map(x=>x.role_assertion_id),before_classes:statuses(before),
   after_classes:statuses(kept),remaining_relation_types:sorted([...new Set(kept.map(x=>x.relation_type))]),
   claim_ceiling:"STRUCTURAL_DEPENDENCE_ONLY_NO_EVIDENCE_TRUTH_OR_CAUSAL_INFERENCE"};
}

/**
 * The audit detects a type confusion: if a role class occurs at both explicit
 * and candidate strength for the same subject + compiler, there is no
 * synthetic upgrade or automatic "conflict" judgment.
 */
export function inspectContextualAlternatives(model){
 const cells=new Map();
 for(const p of model.passes)for(const r of p.roles){
  const key=JSON.stringify([r.subject_id,r.architecture_id,r.relation_type]);
  if(!cells.has(key))cells.set(key,[]);
  cells.get(key).push(r);
 }
 const split=[];
 for(const [key,v] of cells){
  if(v.length<2)continue;
  const states=[...new Set(v.map(x=>x.ceiling))];
  if(states.length>1)split.push({coordinates:JSON.parse(key),
    states:sorted(states),role_assertion_ids:sorted(v.map(x=>x.role_assertion_id)),
    disposition:"PARALLEL_SOURCE_STRENGTHS_PRESERVED_NO_PROMOTION"});
 }
 return {multi_strength_cells:split,claim_ceiling:"DESCRIPTIVE_PARALLEL_CLASSIFICATION_ONLY"};
}
