/**
 * TD613 Atelier Method v0.2 CANDIDATE · portable, offline, research-only common utilities.
 * No source fetch, no inference of theories/lineage/intent, no source writes, no promotion.
 * Presence of an interface does not prove corpus-level scientific functionality.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export const METHOD_ROOT = path.dirname(fileURLToPath(import.meta.url));
export const METHOD = JSON.parse(fs.readFileSync(path.join(METHOD_ROOT,'atelier-method-v0.2-candidate.json'),'utf8'));
const err=(why)=>{throw Error(why)};
const check=(ok,why)=>{if(!ok)err(why)};
const string=x=>typeof x==='string'&&x.trim().length>0;
const unique=x=>new Set(x).size===x.length;
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const isPlain=x=>x && typeof x==='object'&&!Array.isArray(x);
const blockDangerousPath=x=>check(string(x)&&/^[A-Z][A-Z0-9_]*$/.test(x)&&x.length<65,'ATELIER_ID_INVALID');

export function blankProfile(id,{display_name=id,source_policy='OPERATOR_APPROVED_ONLY'}={}){
  blockDangerousPath(id);
  check(string(display_name),'DISPLAY_NAME_REQUIRED');
  return {
    schema:'td613.atelier-profile/v0.2-candidate',atelier_id:id,display_name,
    method_version:METHOD.schema,provenance:'HUMAN_INSTANTIATED_EMPTY_CHAMBER',
    status:'EMPTY_NO_EVIDENCE_NO_AUTHORSHIP_CLAIMS',
    source_policy,source_count:0,work_count:0,epoch:'UNINITIALIZED',
    native_graphs:[],rights_state:'NOT_YET_ASSESSED',
    modules:Object.fromEntries(METHOD.required_capability_ids.map(id=>[id,{
      interface_available:true,implementation_state:'HELD_MISSING_IMPLEMENTATION',
      corpus_execution:'NOT_TESTED',finding_count:0
    }])),
    routes:[...METHOD.routes],
    human_closure_required:true,scientific_promotion_authority:false,
    consent_and_contact:{outbound_contact_authorized:false,public_recognition_route_enabled:false},
    current_findings:[],claim_ceiling:'NO_SOURCES_NO_RESEARCH_RESULT',
    creation_does_not_admit_source:true
  };
}

export function validateProfile(profile,method=METHOD){
  check(isPlain(profile)&&profile.schema==='td613.atelier-profile/v0.2-candidate','PROFILE_SCHEMA');
  blockDangerousPath(profile.atelier_id);
  check(profile.method_version===method.schema,'METHOD_VERSION_MISMATCH');
  check(profile.human_closure_required===true&&profile.scientific_promotion_authority===false,'PROFILE_AUTHORITY');
  check(isPlain(profile.modules),'PROFILE_MODULES');
  check(unique(method.required_capability_ids),'METHOD_MODULE_COLLISION');
  check(Object.keys(profile.modules).length===method.required_capability_ids.length,'MODULE_COUNT_MISMATCH');
  for(const key of method.required_capability_ids){
    const state=profile.modules[key];
    check(isPlain(state)&&state.interface_available===true,'MISSING_MODULE_INTERFACE:'+key);
    check(method.capability_statuses.includes(state.implementation_state),'BAD_MODULE_IMPLEMENTATION:'+key);
    check(method.capability_statuses.includes(state.corpus_execution),'BAD_MODULE_EXECUTION:'+key);
    check(Number.isInteger(state.finding_count)&&state.finding_count>=0,'BAD_FINDING_COUNT:'+key);
  }
  check(JSON.stringify(profile.routes)===JSON.stringify(method.routes),'FOUR_ROUTES_MISMATCH');
  check(profile.consent_and_contact?.outbound_contact_authorized===false,'UNAUTHORIZED_OUTBOUND_CONTACT');
  check(!profile.consent_and_contact?.public_recognition_route_enabled,'RECOGNITION_DEFAULT_MUST_BE_DORMANT');
  if(profile.source_count===0){
    check(profile.current_findings?.length===0,'FINDINGS_WITHOUT_SOURCES');
    check(profile.claim_ceiling==='NO_SOURCES_NO_RESEARCH_RESULT','EMPTY_CLAIM_INFLATION');
  }
  return {valid:true,modules:method.required_capability_ids.length,scientific_promotion:false};
}

export function stageIntake({bytes,filename,source_provenance,rights,epoch,authorization=false}){
  check(bytes instanceof Uint8Array,'SOURCE_BYTES_REQUIRED');
  check(string(filename)&&!filename.includes('/')&&!filename.includes('\\')&&filename!=='.'&&filename!=='..','SOURCE_FILENAME_INVALID');
  check(string(source_provenance)&&string(epoch),'EPOCH_OR_SOURCE_PROVENANCE_MISSING');
  check(['PUBLIC','PRIVATE','RESTRICTED'].includes(rights),'RIGHTS_UNRESOLVED');
  check(authorization===false,'INTAKE_STAGING_CANNOT_CONSUME_OPERATOR_AUTHORIZATION');
  const sha256=digest(bytes);
  return {schema:'td613.atelier-staged-source/v0.2-candidate',source_candidate_id:'src_'+sha256.slice(0,24),
    sha256,byte_length:bytes.byteLength,filename,source_provenance,rights,epoch,
    state:'STAGED_UNADMITTED',public_export_permitted:false,source_import_authorized:false};
}

export function assertEpoch(expected,observed){
  check(isPlain(expected)&&isPlain(observed),'EPOCH_REQUIRED');
  check(string(expected.snapshot_id)&&string(observed.snapshot_id),'SNAPSHOT_ID_REQUIRED');
  check(expected.snapshot_id===observed.snapshot_id,'SNAPSHOT_EPOCH_MISMATCH');
  if(expected.seal_id||observed.seal_id)check(expected.seal_id===observed.seal_id&&string(expected.seal_id),'SEAL_MISMATCH');
  return {epoch_match:true,seal_replay_cryptographically_verified:false};
}

export function compileTypedProjections({sources,edges,epoch}){
  check(Array.isArray(sources)&&Array.isArray(edges),'SOURCES_AND_EDGES_REQUIRED');
  check(isPlain(epoch)&&string(epoch.snapshot_id),'EPOCH_REQUIRED');
  const ids=sources.map(x=>x.source_id);
  check(ids.every(string)&&unique(ids),'SOURCE_ID_MISSING_OR_DUPLICATE');
  const set=new Set(ids), groups=Object.fromEntries(METHOD.graphs.map(name=>[name,[]])),edgeIds=new Set();
  for(const e of edges){
    check(isPlain(e)&&string(e.edge_id)&&!edgeIds.has(e.edge_id),'EDGE_ID_MISSING_OR_DUPLICATE');edgeIds.add(e.edge_id);
    check(METHOD.graphs.includes(e.graph),'UNKNOWN_GRAPH_FAMILY');
    check(string(e.from)&&string(e.to)&&string(e.relation),'EDGE_FIELDS_REQUIRED');
    check(Array.isArray(e.source_ids)&&e.source_ids.length>0&&e.source_ids.every(id=>set.has(id)),'UNBOUND_EDGE_SOURCE');
    check(['SOURCE_DECLARATION','ARCHIVE_OBSERVATION','ARCHIVE_INFERENCE','RESEARCH_HYPOTHESIS'].includes(e.evidence_class),'EDGE_EVIDENCE_CLASS_INVALID');
    check(string(e.claim_ceiling)&&e.authority_state==='RESEARCH_ONLY','EDGE_AUTHORITY_OR_CEILING');
    groups[e.graph].push({...e,source_ids:[...e.source_ids].sort()});
  }
  for(const es of Object.values(groups))es.sort((a,b)=>a.edge_id.localeCompare(b.edge_id));
  return {schema:'td613.atelier-multiplex/v0.2-candidate',epoch,graphs:groups,source_count:sources.length,
    edge_count:edges.length,claim_ceiling:'TYPED_SOURCE_BOUND_GRAPH_ONLY_NO_CAUSATION_OR_IDENTITY_TRANSFER'};
}
export function ablateSource(topology,id){
  const graphs={},removed={};
  for(const [k,v] of Object.entries(topology.graphs)){
    graphs[k]=v.filter(e=>!e.source_ids.includes(id));
    removed[k]=v.length-graphs[k].length;
  }
  return {graphs,removed,claim_ceiling:'STRUCTURAL_WITHDRAWAL_ONLY_NOT_RECONSTRUCTION_PROOF'};
}
/**
 * Query-conditioned support matrix. It validates decisions supplied by a source-bound
 * human/assay; it NEVER derives sufficiency by itself from document labels.
 */
export function representationSufficiency({questions,surfaces,cells,evidence_refs}){
  check(Array.isArray(questions)&&questions.length>0&&questions.every(string)&&unique(questions),'QUESTIONS_INVALID');
  check(Array.isArray(surfaces)&&surfaces.length>0&&surfaces.every(string)&&unique(surfaces),'SURFACES_INVALID');
  check(isPlain(cells)&&isPlain(evidence_refs),'CELLS_INVALID');
  for(const q of questions)for(const s of surfaces){
    const k=q+'::'+s;
    check(['SUFFICIENT','PARTIAL','INSUFFICIENT','UNRESOLVED'].includes(cells[k]),'UNCLASSIFIED_PAIR:'+k);
    check(Array.isArray(evidence_refs[k])&&evidence_refs[k].length>0,'PAIR_WITHOUT_SOURCE_OR_NULL_WITNESS:'+k);
  }
  return {questions,surfaces,cells,evidence_refs,status:'MATRIX_SUPPLIED_NOT_AUTOMATICALLY_PROVED'};
}
export function nonLiftPath({first,second,proposed_direct}){
  check(first&&second&&first.to===second.from,'NONCOMPOSABLE_PATH');
  check(first.authority_state==='RESEARCH_ONLY'&&second.authority_state==='RESEARCH_ONLY','PATH_AUTHORITY');
  return {path:[first.edge_id,second.edge_id],endpoint:[first.from,second.to],
    candidate_direct_relation:proposed_direct??null,direct_relation_admitted:false,
    requirement:'INDEPENDENT_DIRECT_RELATION_SOURCE_WITNESS'};
}
export function preregisterAssay({id,epoch,target_ids,controls,comparison_frame,heldout_before_scoring}){
  check(string(id)&&string(epoch),'ASSAY_ID_OR_EPOCH_REQUIRED');
  check(Array.isArray(target_ids)&&target_ids.length>0&&target_ids.every(string)&&unique(target_ids),'ASSAY_TARGETS');
  check(Array.isArray(controls)&&controls.length>0&&controls.every(string)&&unique(controls),'ASSAY_CONTROLS');
  check(string(comparison_frame)&&heldout_before_scoring===true,'ASSAY_NOT_PREREGISTERED');
  return {schema:'td613.atelier-assay-plan/v0.2-candidate',id,epoch,target_ids,controls,comparison_frame,
    state:'PREREGISTERED_NOT_EXECUTED',results:[],scientific_promotion:false};
}
export function findingViews(finding){
  check(isPlain(finding)&&string(finding.source_id)&&string(finding.claim_ceiling),'FINDING_UNBOUND');
  check(METHOD.evidence_classes.includes(finding.evidence_class),'FINDING_EVIDENCE_CLASS');
  check(finding.authority_state==='RESEARCH_ONLY','FINDING_AUTHORITY');
  const invariant={source_id:finding.source_id,claim_ceiling:finding.claim_ceiling,
    authority_state:finding.authority_state,evidence_class:finding.evidence_class};
  return {
    EXPERIENTIAL:{...invariant,interpretation:finding.interpretation??'UNOBSERVED'},
    CUSTODIAL:{...invariant,epoch:finding.epoch??'UNBOUND',source_locator:finding.source_locator??'NOT_SUPPLIED'},
    AUDIT:{...invariant,alternatives:finding.alternatives??[],falsifiers:finding.falsifiers??[]},
    IMPLEMENTATION:{...invariant,record_type:finding.record_type??'RESEARCH_PACKET'}
  };
}


/**
 * Wendbine-derived finite stage-order sensitivity ASSAY. The caller supplies
 * fully observable, pure state transformations and a terminal register.
 * This can detect order effects and endpoint-equivalent prefixes; it does
 * not uniquely identify hidden implementation order or novel mathematics.
 */
export function stageOrderAssay({operators,inputs,register,canonical_order}){
  check(isPlain(operators)&&typeof register==='function','STAGE_OPERATORS_REQUIRED');
  const labels=Object.keys(operators);
  check(labels.length>=2&&labels.length<=5&&unique(labels),'STAGE_COUNT_OUT_OF_BOUND');
  check(labels.every(x=>typeof operators[x]==='function'),'STAGE_OPERATOR_NOT_FUNCTION');
  check(Array.isArray(inputs)&&inputs.length>0&&inputs.length<=30,'STAGE_INPUT_BOUNDS');
  check(Array.isArray(canonical_order)&&canonical_order.length===labels.length&&unique(canonical_order)
    &&canonical_order.every(x=>labels.includes(x)),'CANONICAL_ORDER_INVALID');
  const perms=arr=>arr.length===0?[[]]:arr.flatMap((x,i)=>perms(arr.filter((_,j)=>j!==i)).map(rest=>[x,...rest]));
  const rows=perms(labels).map(order=>{
    const signatures=[],firstStages=[];
    for(const value of inputs){
      let state=structuredClone(value);
      for(let i=0;i<order.length;i++){
        state=operators[order[i]](structuredClone(state));
        check(isPlain(state),'STAGE_OUTPUT_MUST_BE_OBJECT');
        if(i===0)firstStages.push(structuredClone(state));
      }
      signatures.push(JSON.stringify(register(structuredClone(state))));
    }
    return {order,terminal_signature:JSON.stringify(signatures),first_stage_witnesses:firstStages};
  });
  const bySignature=new Map();
  for(const row of rows){
    if(!bySignature.has(row.terminal_signature))bySignature.set(row.terminal_signature,[]);
    bySignature.get(row.terminal_signature).push(row.order.join('>'));
  }
  const canon=rows.find(x=>x.order.join('>')===canonical_order.join('>'));
  const classMembers=bySignature.get(canon.terminal_signature);
  const witnessDifferent=rows.filter(x=>x.terminal_signature===canon.terminal_signature&&
    JSON.stringify(x.first_stage_witnesses)!==JSON.stringify(canon.first_stage_witnesses)).map(x=>x.order);
  return {schema:'td613.atelier-stage-order-assay/v0.2-candidate',
    prefix_permutations:rows.length,terminal_equivalence_classes:bySignature.size,
    canonical_order,canonical_terminal_equivalence_size:classMembers.length,
    terminally_equivalent_orderings:classMembers,intermediate_witness_distinguishable:witnessDifferent,
    claim_ceiling:'FINITE_SUPPLIED_OPERATOR_MODEL_ONLY_NO_HIDDEN_STAGE_IDENTIFICATION_OR_NOVELTY'};
}

/** Wendbine foreign-donor architecture×style 2×2 preregistration. */
export function factorialForeignDonorPlan({id,source_snapshot,receiver_snapshot,
  architecture_control,style_control,unrelated_decoy,matched_frame}){
  for(const x of [id,source_snapshot,receiver_snapshot,architecture_control,style_control,unrelated_decoy,matched_frame])
    check(string(x),'FOREIGN_DONOR_CONTROL_NOT_PREREGISTERED');
  return {schema:'td613.atelier-foreign-donor-factorial/v0.2-candidate',
    id,source_snapshot,receiver_snapshot,architecture_control,style_control,
    unrelated_decoy,matched_frame,
    cells:[
      {cell:'C00',architecture:'BASELINE',style:'BASELINE'},
      {cell:'C01',architecture:'BASELINE',style:'SOURCE_STYLE'},
      {cell:'C10',architecture:'SOURCE_ARCHITECTURE',style:'BASELINE'},
      {cell:'C11',architecture:'SOURCE_ARCHITECTURE',style:'SOURCE_STYLE'}
    ],state:'PREREGISTERED_NOT_EXECUTED',outcomes:[],
    prohibited:['DONOR_AUTHORITY_TRANSFER','SOURCE_AUTHORSHIP_TRANSFER','STYLE_AS_CAUSAL_ARCHITECTURE_PROOF'],
    claim_ceiling:'DESIGN_ONLY_NO_TRANSFER_NOVELTY_OR_PERSONAL_INTENT_ESTABLISHED'};
}

export function recognitionPathway({source_id,public_locator,consenting_participants=[],requested_action='OBSERVE'}={}){
  check(string(source_id)&&string(public_locator),'PUBLIC_SOURCE_WITNESS_REQUIRED');
  check(requested_action==='OBSERVE','NO_TARGETED_CONTACT_OR_DISCLOSURE_FROM_ATELIER');
  return {state:'PUBLIC_SOURCE_OBSERVATION_ONLY',source_id,public_locator,
    participants_consent_state:consenting_participants.length?'DECLARED_ONLY_NOT_VERIFIED':'UNOBSERVED',
    route:['RECOGNITION','WITNESS','BOUNDARY','OPTIONAL_VOLUNTARY_TRANSFER','INDEPENDENCE','RETURN'],
    disclosure_required:false,outbound_contact_performed:false,person_intent_inferred:false,
    right_of_resignation_preserved:true};
}
