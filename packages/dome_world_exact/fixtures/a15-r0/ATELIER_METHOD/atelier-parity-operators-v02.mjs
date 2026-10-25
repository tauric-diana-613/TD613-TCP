/**
 * TD613 universal Atelier v0.2 · bounded executable parity operators.
 * No mutation, no inference from absent corpus bytes, no publication/causal/identity promotion.
 * The operators admit typed SOURCE observations supplied by an origin-specific adapter.
 */
import fs from 'node:fs';
import path from 'node:path';

const guard=(ok,why)=>{if(!ok)throw Error(why)};
const str=x=>typeof x==='string'&&x.trim().length>0;
const jsonl=content=>content.split(/\r?\n/).filter(Boolean).map((line,i)=>{try{return JSON.parse(line)}catch{throw Error('INVALID_JSONL_LINE_'+(i+1))}});
const sorted=(xs)=>xs.slice().sort((a,b)=>a.localeCompare(b));
const canonical=(o)=>JSON.stringify(o,(_k,v)=>v instanceof Set?sorted([...v]):v);
const equal=(a,b)=>canonical(a)===canonical(b);

export function readRegisteredRows(root,registeredPath){
 guard(str(registeredPath)&&!path.isAbsolute(registeredPath),'UNSAFE_REGISTER_PATH');
 const full=path.resolve(root,registeredPath);
 guard(full.startsWith(path.resolve(root)+path.sep),'PATH_ESCAPES_CORPUS');
 guard(fs.existsSync(full),'REGISTER_MISSING');
 return registeredPath.endsWith('.jsonl')?jsonl(fs.readFileSync(full,'utf8')):JSON.parse(fs.readFileSync(full,'utf8'));
}

/** SRC-inspired fixed-epoch identity resolution: exact declared identifiers only. */
export function resolveSourceEntity({entity_id,epoch,expected_epoch,resolver_rows,captures=[],derivatives=[],root}){
 guard(str(entity_id)&&Array.isArray(resolver_rows)&&Array.isArray(captures)&&Array.isArray(derivatives),'INVALID_RESOLVER_INPUT');
 guard(epoch&&expected_epoch&&str(epoch.snapshot_id)&&str(expected_epoch.snapshot_id),'SNAPSHOT_REQUIRED');
 guard(epoch.snapshot_id===expected_epoch.snapshot_id,'SNAPSHOT_MISMATCH');
 guard((epoch.seal_id??null)===(expected_epoch.seal_id??null),'SEAL_MISMATCH');
 const found=resolver_rows.filter(r=>r.entity_id===entity_id).map(r=>{
   const out={...r};
   if(root!==undefined){
     guard(str(root),'ROOT_REQUIRED');
     if(r.path){
       const p=path.resolve(root,r.path);
       guard(p.startsWith(path.resolve(root)+path.sep),'REGISTERED_PATH_ESCAPE');
       out.path_exists=fs.existsSync(p);
     }else out.path_exists=false;
   }
   return out;
 });
 if(!found.length)return {entity_id,status:'UNRESOLVED_TARGET',matches:[],captures:[],derivatives:[],missing_hops:['EXACT_ENTITY_ID'],query_epoch:{...epoch}};
 const captureIds=new Set(found.map(x=>x.capture_id).filter(Boolean));
 for(const r of found)if(r.entity_type==='capture')captureIds.add(r.entity_id);
 const relevantCaptures=captures.filter(c=>captureIds.has(c.capture_id)||c.target_id===entity_id);
 for(const c of relevantCaptures)if(str(c.capture_id))captureIds.add(c.capture_id);
 const relevantDerivatives=derivatives.filter(d=>captureIds.has(d.capture_id));
 const missing=[];
 if(!relevantCaptures.length)missing.push('CAPTURE');
 if(!relevantDerivatives.length)missing.push('DERIVATIVE');
 return {entity_id,status:'RESOLVED',matches:found,captures:relevantCaptures,
   derivatives:relevantDerivatives,missing_hops:missing,query_epoch:{...epoch},
   authority:'QUERY_ONLY_NO_PROMOTION',join_rule:'EXACT_IDENTIFIERS_ONLY'};
}

/** Contextual role/representational conservation: requires an explicit assay encoding. */
export function polycompilationConservation({epoch,source_rows,roles,shared_claim_ids,role_claims}){
 guard(str(epoch)&&Array.isArray(source_rows)&&Array.isArray(roles)&&Array.isArray(shared_claim_ids)&&role_claims&&typeof role_claims==='object','POLYCOMPILATION_INPUTS');
 guard(roles.length>=2&&new Set(roles).size===roles.length,'ROLE_FAMILY_REQUIRED');
 const sourceIds=new Set(source_rows.map(r=>r.source_id));
 guard(source_rows.length>=2&&sourceIds.size===source_rows.length&&[...sourceIds].every(str),'SOURCE_ID_COLLISION');
 for(const role of roles){
  guard(str(role)&&Array.isArray(role_claims[role]),'MISSING_ROLE_CLAIM_LEDGER');
  for(const c of role_claims[role]){
   guard(str(c.claim_id)&&Array.isArray(c.source_ids)&&c.source_ids.length>0,'CLAIM_UNBOUND');
   guard(c.source_ids.every(id=>sourceIds.has(id)),'UNKNOWN_POLYCOMPILATION_SOURCE');
   guard(['SOURCE_DECLARATION','ARCHIVE_OBSERVATION','RESEARCH_HYPOTHESIS'].includes(c.evidence_class),'UNSUPPORTED_CLAIM_CLASS');
  }
 }
 const invariants={};
 for(const claim of shared_claim_ids){
  const roleSupport=Object.fromEntries(roles.map(role=>[role,
   role_claims[role].filter(c=>c.claim_id===claim).map(c=>({source_ids:sorted(c.source_ids),evidence_class:c.evidence_class}))]));
  invariants[claim]={role_support:roleSupport,all_roles_supported:roles.every(r=>roleSupport[r].length>0)};
 }
 return {schema:'td613.atelier-polycompilation-receipt/v0.2',epoch,roles,
  invariants,observed_role_distinctions:true,
  claim_ceiling:'DECLARED_ROLE_CLAIMS_ONLY_SEMANTIC_CONSERVATION_NOT_AUTOMATICALLY_PROVED'};
}

/**
 * Wendbine-derived deterministic concept, typed edge and non-causal cooccurrence
 * compiler. Source units are generic: identical behavior for public posts, docs,
 * and a blank Atelier's synthetic specimen.
 */
export function compileSourceBoundTopology({snapshot_id,source_rows,relation_rows,allow_empty=false}){
 guard(str(snapshot_id)&&Array.isArray(source_rows)&&Array.isArray(relation_rows),'TOPOLOGY_INPUTS_REQUIRED');
 guard(allow_empty||source_rows.length>0,'SOURCES_REQUIRED');
 const sources=new Map(),concepts=new Map(),pairs=new Map(),edges=[];
 for(const row of source_rows){
  guard(str(row.source_id)&&row.snapshot_id===snapshot_id&&!sources.has(row.source_id),'SOURCE_ID_OR_SNAPSHOT_INVALID');
  guard(Array.isArray(row.declared_concepts)&&row.declared_concepts.every(str),'SOURCE_CONCEPTS_REQUIRED');
  sources.set(row.source_id,row);
  const cs=sorted([...new Set(row.declared_concepts)]);
  for(const c of cs){if(!concepts.has(c))concepts.set(c,new Set());concepts.get(c).add(row.source_id)}
  for(let i=0;i<cs.length;i++)for(let j=i+1;j<cs.length;j++){
    const key=JSON.stringify([cs[i],cs[j]]);
    if(!pairs.has(key))pairs.set(key,{from:cs[i],to:cs[j],sources:new Set()});
    pairs.get(key).sources.add(row.source_id);
  }
 }
 for(const row of relation_rows){
  guard(str(row.source_id)&&sources.has(row.source_id),'RELATION_SOURCE_NOT_ADMITTED');
  guard(str(row.graph)&&/^G_[A-Z]+$/.test(row.graph),'GRAPH_FAMILY_INVALID');
  for(const f of ['from','to','relation','evidence_class'])guard(str(row[f]),'EDGE_FIELD_MISSING_'+f);
  edges.push({...row});
 }
 const typed_graph_counts={};
 for(const e of edges)typed_graph_counts[e.graph]=(typed_graph_counts[e.graph]||0)+1;
 const recurrent_concepts=[...concepts.entries()].filter(([,s])=>s.size>=2).map(([label,s])=>({label,source_count:s.size,source_ids:sorted([...s])})).sort((a,b)=>b.source_count-a.source_count||a.label.localeCompare(b.label));
 const cooccurrence=[...pairs.values()].filter(x=>x.sources.size>=2).map(x=>({from:x.from,to:x.to,weight:x.sources.size,source_ids:sorted([...x.sources]),classification:'NONCAUSAL_COOCCURRENCE'})).sort((a,b)=>b.weight-a.weight||a.from.localeCompare(b.from)||a.to.localeCompare(b.to));
 return {schema:'td613.atelier-source-bound-topology/v0.2',snapshot_id,
  source_count:sources.size,concept_count:concepts.size,typed_relation_count:edges.length,
  typed_graph_counts:Object.fromEntries(Object.entries(typed_graph_counts).sort(([a],[b])=>a.localeCompare(b))),
  recurrent_concepts,cooccurrence,cooccurrence_count:cooccurrence.length,
  sorted_edges:edges.sort((a,b)=>a.graph.localeCompare(b.graph)||a.from.localeCompare(b.from)||a.to.localeCompare(b.to)||a.source_id.localeCompare(b.source_id)),
  claim_ceiling:'SOURCE_INDEX_TOPOLOGY_ONLY_CO_OCCURRENCE_NONCAUSAL_PRIVATE_STATE_UNOBSERVED'};
}

/**
 * True withheld-target experiment interface. Never reads target content into the
 * predictor. Scores only after an explicit prediction and independent target are supplied.
 * This is a *protocol helper*; it does not reconstruct missing science automatically.
 */
export function makeHeldoutView({source_rows,relation_rows,target_id,snapshot_id}){
 guard(str(target_id)&&str(snapshot_id),'HELDOUT_TARGET_AND_SNAPSHOT');
 guard(Array.isArray(source_rows)&&Array.isArray(relation_rows),'HELDOUT_ARRAYS');
 guard(source_rows.some(x=>x.source_id===target_id),'HELDOUT_TARGET_NOT_FOUND');
 const sources=source_rows.filter(x=>x.source_id!==target_id);
 const relations=relation_rows.filter(x=>x.source_id!==target_id);
 const topology=compileSourceBoundTopology({snapshot_id,source_rows:sources,relation_rows:relations,allow_empty:true});
 return {target_id,remaining_sources:sources,remaining_relations:relations,topology,
  target_hidden:true,heldout_source_id_not_in_topology:!topology.sorted_edges.some(e=>e.source_id===target_id),
  terminal_state:'HELDOUT_VIEW_ONLY_NO_PREDICTION_MADE'};
}
export function scoreHeldoutPlacement({frozen_prediction,target_facts,view}){
 guard(view?.target_hidden===true&&view.heldout_source_id_not_in_topology,'TARGET_LEAKAGE');
 guard(frozen_prediction?.locked_before_target_reveal===true&&str(frozen_prediction?.target_id),'PREDICTION_NOT_FROZEN');
 guard(frozen_prediction.target_id===view.target_id&&target_facts?.source_id===view.target_id,'TARGET_MISMATCH');
 guard(Array.isArray(frozen_prediction.graph_families)&&Array.isArray(target_facts.graph_families),'MISSING_FAMILY_LIST');
 const predicted=new Set(frozen_prediction.graph_families),actual=new Set(target_facts.graph_families);
 const tp=[...predicted].filter(x=>actual.has(x)).length;
 return {target_id:view.target_id,matched_families:tp,predicted_families:predicted.size,
  actual_families:actual.size,exact_family_set_match:equal(sorted([...predicted]),sorted([...actual])),
  score:predicted.size+actual.size===0?null:2*tp/(predicted.size+actual.size),
  outcome:'FROZEN_PREDICTION_SCORED_NOT_CAUSAL_OR_PRIVATE_STATE_RECONSTRUCTION'};
}

/** Independent evidence units: multiple manifestations sharing ancestry count once. */
export function independentEvidenceSupport(rows){
 guard(Array.isArray(rows),'EVIDENCE_INPUT');
 const ancestors=new Map(),unknown=[];
 for(const r of rows){
  guard(str(r.evidence_id)&&str(r.source_id),'EVIDENCE_ID_AND_SOURCE');
  if(!str(r.ancestor_id)){unknown.push(r.evidence_id);continue}
  if(!ancestors.has(r.ancestor_id))ancestors.set(r.ancestor_id,[]);
  ancestors.get(r.ancestor_id).push(r.evidence_id);
 }
 return {evidence_rows:rows.length,distinct_known_ancestors:ancestors.size,
  independently_counted_families:[...ancestors.entries()].map(([id,ids])=>({ancestor_id:id,evidence_ids:sorted(ids)})),
  independence_unresolved_evidence_ids:sorted(unknown),
  verdict:unknown.length?'INDEPENDENCE_UNRESOLVED':'KNOWN_ANCESTRY_COLLAPSED',
  claim_ceiling:'SAME_ANCESTOR_NOT_INDEPENDENT_NO_UNOBSERVED_ANCESTRY_INFERENCE'};
}


/** Em-derived Work/manifestation resolution, without human-gated identity collapse. */
export function resolveWorkManifestations({work_id,works,manifestations,source_rows,epoch}){
 guard(str(work_id)&&str(epoch),'WORK_ID_AND_EPOCH_REQUIRED');
 guard(Array.isArray(works)&&Array.isArray(manifestations)&&Array.isArray(source_rows),'WORK_INPUTS_REQUIRED');
 const work=works.find(w=>w.work_id===work_id);
 if(!work)return {work_id,status:'UNRESOLVED_WORK',epoch,claim_ceiling:'NO_WORK_ID_MATCH'};
 guard(!works.some(w=>w!==work&&w.work_id===work_id),'DUPLICATE_WORK_ID');
 const sources=new Map(source_rows.map(s=>[s.source_file_id,s]));
 guard(sources.size===source_rows.length,'DUPLICATE_SOURCE_FILE_ID');
 const rows=manifestations.filter(x=>x.work_id===work_id).map(x=>{
  guard(sources.has(x.source_file_id),'WORK_MANIFESTATION_SOURCE_MISSING');
  return {...x,source_descriptor:{
    source_file_id:x.source_file_id,
    sha256:sources.get(x.source_file_id).sha256,
    media_type:sources.get(x.source_file_id).media_type,
    original_filename:sources.get(x.source_file_id).original_filename
  }};
 });
 const workSourceIds=work.manifestation_source_file_ids;
 guard(Array.isArray(workSourceIds),'WORK_MANIFESTATION_LIST_MISSING');
 guard(workSourceIds.every(s=>rows.some(x=>x.source_file_id===s)),'WORK_SOURCE_ID_NOT_LINKED');
 const humanGated=work.human_gate_required===true||rows.some(x=>x.human_gate_required===true);
 const uncertain=humanGated||rows.some(x=>x.identity_status==='SAME_WORK_SUPPORTED');
 return {work_id,epoch,status:'RESOLVED_OPERATIONAL_WORK',
   identity_status:work.identity_status??'UNSPECIFIED',human_gate_required:humanGated,
   manifestation_ids:rows.map(x=>x.source_file_id),manifestations:rows,
   independent_work_contribution_interval:uncertain?
    [work.minimum_independent_work_contribution??1,work.maximum_independent_work_contribution??rows.length]:[1,1],
   claim_ceiling:uncertain?'OPERATIONAL_GROUPING_SUPPORTED_IDENTITY_UNRESOLVED':'SOURCE_MANIFESTATION_GROUP_ONLY',
   authorship:work.authorship??'UNRESOLVED',
   claim_equivalence_across_manifestations:false};
}

/**
 * Source-explicit MOTIF CANDIDATES ONLY. Counts lexical occurrences in the
 * supplied source excerpts; does not read a hidden corpus, create a ledger,
 * infer a mechanism, decode a metaphor, or adjudicate authorship.
 */
export function motifCandidateSieve({snapshot_id,source_spans,terms}){
 guard(str(snapshot_id)&&Array.isArray(source_spans)&&Array.isArray(terms),'MOTIF_INPUT_INVALID');
 guard(terms.length>0&&terms.length<=150&&terms.every(str),'MOTIF_TERMS_REQUIRED');
 const norm=s=>s.normalize('NFKC').toLocaleLowerCase('en-US');
 const targets=sorted([...new Set(terms.map(norm))]);
 const rows=[],seen=new Set();
 for(const s of source_spans){
  guard(str(s.source_id)&&str(s.source_locator)&&typeof s.text==='string','MOTIF_SOURCE_LOCATOR_REQUIRED');
  guard(!seen.has(s.source_id+'::'+s.source_locator),'DUPLICATE_SPAN');
  seen.add(s.source_id+'::'+s.source_locator);
  const span=norm(s.text);
  for(const term of targets){
    let count=0,from=0,at=-1;
    while((at=span.indexOf(term,from))>=0){count++;from=at+term.length;if(count>100000)throw Error('MOTIF_COUNT_CAP')}
    if(count)rows.push({term,source_id:s.source_id,source_locator:s.source_locator,
      occurrences:count,work_id:s.work_id??null,work_identity_status:s.work_identity_status??'UNRESOLVED',
      status:'LITERAL_STRING_OBSERVATION_ONLY',evidence_class:'ARCHIVE_OBSERVATION'});
  }
 }
 return {schema:'td613.atelier-motif-candidates/v0.2',snapshot_id,terms:targets,
   observations:rows,
   summary:targets.map(t=>({term:t,source_span_count:rows.filter(r=>r.term===t).length,
     occurrences:rows.filter(r=>r.term===t).reduce((n,r)=>n+r.occurrences,0)})),
   claim_ceiling:'LEXICAL_CANDIDATES_ONLY_NO_MECHANISM_IDENTITY_GENEALOGY_OR_NOVELTY'};
}


/**
 * Wendbine C0-C4 bounded negative controls on a frozen leave-one-out view.
 * No target-post content or metadata enters the predictor. C4 never executes
 * without a separately witnessed, preregistered unrelated decoy.
 */
export function reconstructionControlBattery({view,preregistration,seed=613,decoy=null}){
 guard(view?.target_hidden===true&&view.heldout_source_id_not_in_topology,'TARGET_NOT_WITHHELD');
 guard(preregistration?.state==='PREREGISTERED_NOT_EXECUTED'&&
  Array.isArray(preregistration.target_ids)&&preregistration.target_ids.includes(view.target_id),'TARGET_NOT_PREREGISTERED');
 guard(Number.isSafeInteger(seed),'SEED_REQUIRED');
 const base=view.remaining_sources.map(x=>({...x,declared_concepts:[...(x.declared_concepts??[])]}));
 const rel=view.remaining_relations.map(x=>({...x}));
 const snapshot=view.topology.snapshot_id;
 let n=seed>>>0;
 const rnd=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};
 const shuffled=base.slice();
 for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
 const labels=sorted([...new Set(base.flatMap(x=>x.declared_concepts))]);
 const perm=labels.slice();for(let i=perm.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]]}
 // Avoid an identity permutation when there are multiple labels and the random
 // draw yields one. Preserve one-to-one labels, even for extremely small fixtures.
 if(labels.length>1&&labels.every((x,i)=>x===perm[i]))perm.push(perm.shift());
 const map=new Map(labels.map((x,i)=>[x,perm[i]]));
 const relabeled=base.map(x=>({...x,declared_concepts:x.declared_concepts.map(t=>map.get(t)??t)}));
 const relabelEdges=rel.map(e=>({...e,from:map.get(e.from)??e.from,to:map.get(e.to)??e.to}));
 const make=(sr,rr)=>compileSourceBoundTopology({snapshot_id:snapshot,source_rows:sr,relation_rows:rr,allow_empty:true});
 const precision=base.every(x=>x.time_precision==='DAY')?'DAY_ONLY':'MIXED_OR_UNKNOWN';
 const C0={state:'EXECUTED_STRUCTURAL_CONTROL',compiled:make(base,rel)};
 const C1={state:'EXECUTED_ORDER_SHUFFLE',compiled:make(shuffled,rel),
  publication_time_precision:precision,
  serial_order_credit:precision==='DAY_ONLY'?'NOT_IDENTIFIABLE_FROM_DAY_BUCKETS':'UNADJUDICATED'};
 const C2={state:'EXECUTED_LABEL_PERMUTATION',compiled:make(relabeled,relabelEdges),
  label_count:labels.length,semantic_label_credit:'WITHHELD'};
 const C3={state:'EXECUTED_TYPED_EDGE_ABLATION',compiled:make(base,[]),
  graph_family_credit:'WITHHELD'};
 let C4={state:'HELD_DECOY_NOT_PREREGISTERED',compiled:null};
 if(decoy!==null){
  guard(preregistration.controls.includes('C4')&&
   decoy.preregistered===true&&decoy.source?.snapshot_id===snapshot&&
   str(decoy.source?.source_id)&&decoy.source.source_id!==view.target_id&&
   !base.some(x=>x.source_id===decoy.source.source_id),'DECOY_NOT_BOUND');
  guard(str(decoy.independent_source_witness),'DECOY_INDEPENDENT_WITNESS_REQUIRED');
  C4={state:'EXECUTED_PREREGISTERED_UNRELATED_DECOY',
   compiled:make([...base,decoy.source],rel),independent_source_witness:decoy.independent_source_witness};
 }
 return {
  schema:'td613.atelier-heldout-controls/v0.2',target_id:view.target_id,snapshot_id:snapshot,
  C0,C1,C2,C3,C4,
  source_target_leakage:false,
  decision:'CONTROLS_COMPILED_NO_HELDOUT_RECONSTRUCTION_SCORE_OR_AUTHOR_INTENT',
  preregistration_authority:'DECLARATION_ONLY_EXTERNAL_TIME_WITNESS_NOT_VERIFIED'
 };
}


/**
 * Wendbine-style SOURCE-BOUND nomenclature/operator crosswalk.
 * Ordinary terminology and operator changes require separate witnessed bases.
 * Novelty and provenance are never returned as discoveries by this function.
 * The reviewer submits an explicit frozen source/receiver comparison.
 */
export function nomenclatureOperatorCrosswalk({source_snapshot,receiver_snapshot,rows}){
 guard(str(source_snapshot)&&str(receiver_snapshot)&&Array.isArray(rows),'CROSSWALK_INPUTS');
 const out=[],seen=new Set();
 for(const r of rows){
  guard(str(r.id)&&!seen.has(r.id),'CROSSWALK_DUPLICATE_OR_MISSING_ID');seen.add(r.id);
  guard(str(r.source_locator)&&str(r.receiver_baseline_locator),'CROSSWALK_SOURCE_BASES_MISSING');
  guard(str(r.subject)&&str(r.proposed_term),'CROSSWALK_SUBJECT_OR_TERM');
  guard(typeof r.proposes_better_name==='boolean'&&typeof r.proposes_better_operator==='boolean',
   'CROSSWALK_DIMENSIONS_UNDECLARED');
  guard(Array.isArray(r.conventional_prior_refs)&&Array.isArray(r.operator_delta_refs),
   'CROSSWALK_REFS_MISSING');
  guard(str(r.alternative_explanation)&&str(r.claim_ceiling),'CROSSWALK_ALTERNATIVES_REQUIRED');
  const name=r.proposes_better_name,operator=r.proposes_better_operator;
  if(name)guard(r.conventional_prior_refs.length>0&&r.conventional_prior_refs.every(str),
    'ORDINARY_TERM_UNGROUNDED');
  if(operator)guard(r.operator_delta_refs.length>0&&r.operator_delta_refs.every(str)&&
    str(r.operator_before)&&str(r.operator_after)&&r.operator_before!==r.operator_after,
    'OPERATOR_DELTA_UNGROUNDED');
  // Classification is conditional on the supplied evidence bindings; it is
  // not an automatic validation of external references or scholarly priority.
  let outcome=name&&operator?'BOTH':name?'BETTER_NAME':operator?'BETTER_OPERATOR':'NEITHER';
  if(r.rejection_reason){
   guard(str(r.rejection_reason),'REJECTION_REASON_INVALID');outcome='REJECTED';
  }
  out.push({id:r.id,subject:r.subject,proposed_term:r.proposed_term,outcome,
   source_locator:r.source_locator,receiver_baseline_locator:r.receiver_baseline_locator,
   prior_refs:[...r.conventional_prior_refs],operator_delta_refs:[...r.operator_delta_refs],
   alternative_explanation:r.alternative_explanation,
   claim_ceiling:r.claim_ceiling,
   status:'REVIEWER_DECLARED_SOURCE_CONDITIONED_CLASSIFICATION'});
 }
 const counts=Object.fromEntries(['BETTER_NAME','BETTER_OPERATOR','BOTH','NEITHER','REJECTED'].map(s=>[s,out.filter(x=>x.outcome===s).length]));
 return {schema:'td613.atelier-nomenclature-crosswalk/v0.2',
  source_snapshot,receiver_snapshot,rows:out,counts,
  disclaimer:'CONVENTIONAL_NAME_NOT_DONOR_ORIGIN_LOCAL_OPERATOR_REFINEMENT_NOT_GENERAL_NOVELTY',
  adjudication:'CONDITIONAL_SOURCE_BOUND_HUMAN_REVIEW_REQUIRED',
  external_prior_art_verified_by_runner:false,
  scientific_promotion:false};
}


/**
 * SRC compiler-conservation register assay. Imports only preexisting
 * source-bound observations, never silently promoting an inferred transform.
 * Dimensions remain source-specific: PRESERVED vs CHANGED/UNKNOWN remain typed.
 */
export function adjudicateConservationRegister({snapshot_id,seal_id,rows,known_evidence_ids=null}){
 guard(str(snapshot_id)&&str(seal_id)&&Array.isArray(rows),'CONSERVATION_EPOCH_OR_ROWS_MISSING');
 const seen=new Set(),byStatus={},dimensions={},receipt=[];
 const allowed=['WITNESSED','CANDIDATE','UNRESOLVED'];
 for(const row of rows){
  guard(str(row.compiler_conservation_observation_id)&&!seen.has(row.compiler_conservation_observation_id),
   'CONSERVATION_ID_COLLISION');
  seen.add(row.compiler_conservation_observation_id);
  guard(row.atelier_snapshot_id===snapshot_id&&row.seal_epoch_binding==='RESOLVE_MATCHED_CURRENT_SEAL',
   'CONSERVATION_EPOCH_MISMATCH');
  guard(allowed.includes(row.adjudication_status),'CONSERVATION_STATUS_UNKNOWN');
  guard(str(row.input_id)&&str(row.output_id)&&str(row.compiler_or_transform_id),
   'CONSERVATION_ORIGIN_DESTINATION_MISSING');
  guard(row.dimensions&&typeof row.dimensions==='object'&&
   ['semantic_core','scope','causality','falsifiers','caveats','variables','universality'].every(x=>str(row.dimensions[x])),
   'CONSERVATION_DIMENSIONS_MISSING');
  guard(Array.isArray(row.evidence_ids)&&row.evidence_ids.length>0,'CONSERVATION_EVIDENCE_MISSING');
  if(known_evidence_ids)guard(row.evidence_ids.every(x=>known_evidence_ids.has(x)),
   'CONSERVATION_UNREGISTERED_WITNESS');
  guard(str(row.interpretive_limit),'CONSERVATION_INTERPRETIVE_LIMIT_MISSING');
  const status=row.adjudication_status;
  byStatus[status]=(byStatus[status]??0)+1;
  for(const [dimension,value] of Object.entries(row.dimensions)){
    dimensions[dimension]??={};
    dimensions[dimension][value]=(dimensions[dimension][value]??0)+1;
  }
  receipt.push({
   id:row.compiler_conservation_observation_id,
   input_id:row.input_id,output_id:row.output_id,transform:row.compiler_or_transform_id,
   origin_witnesses:[...row.evidence_ids],dimensions:{...row.dimensions},
   status,interpretive_limit:row.interpretive_limit,
   resulting_claim_ceiling:status==='WITNESSED'?
    'SOURCE_WITNESSED_TRANSFORMATION_CLASSIFICATION_NOT_EXTERNAL_PROOF':
    'CANDIDATE_OR_UNRESOLVED_NO_IDENTITY_OR_LINEAGE_PROMOTION'
  });
 }
 return {schema:'td613.atelier-conservation-register/v0.2',
  epoch:{snapshot_id,seal_id},
  count:rows.length,status_counts:byStatus,dimension_counts:dimensions,
  observations:receipt,
  authority:'SOURCE_RESEARCH_RECEIPT_REPLAY_NOT_FRESH_SCIENTIFIC_REPLICATION'};
}

/**
 * Structured three-stratum pre-registration: every nonempty subset of
 * {F,N,G}; no experiment is run or synergy inferred from a plan alone.
 */
export function preregisterThreeStratum({snapshot_id,epoch_seal,targets,matched_budget,blind_seed_commitment,
 control_specification}){
 guard(str(snapshot_id)&&str(epoch_seal)&&Array.isArray(targets)&&targets.length>0,
  'THREE_STRATUM_EPOCH_TARGET_MISSING');
 guard(str(matched_budget)&&str(blind_seed_commitment)&&str(control_specification),
  'THREE_STRATUM_CONTROLS_MISSING');
 const strata=['F','N','G'];
 const subsets=[];
 for(let mask=1;mask<8;mask++)subsets.push(strata.filter((_,i)=>mask&(1<<i)).join(''));
 guard(new Set(targets).size===targets.length,'DUPLICATE_PREREG_TARGET');
 return {schema:'td613.atelier-three-stratum-plan/v0.2',
  snapshot_id,epoch_seal,targets:[...targets],matched_budget,blind_seed_commitment,
  control_specification,subsets,
  statuses:Object.fromEntries(subsets.map(s=>[s,'NOT_EXECUTED'])),
  hypothesis:'FULL_COMBINATION_RECOVERS_PREREGISTERED_RELATION_BEYOND_SINGLETONS_AND_PAIRS',
  claim_ceiling:'PROSPECTIVE_ONLY_NO_SYNERGY_OR_TOMOGRAPHY_PROVEN'};
}
