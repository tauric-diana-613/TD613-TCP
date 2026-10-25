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
