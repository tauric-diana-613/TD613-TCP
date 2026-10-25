/**
 * TD613 EMSTD613 · experimental cross-Atelier capability / interchange adapter.
 * Research-only and read-only. No network, source ingestion, normalization, or authority promotion.
 * The shared method is pinned byte-for-byte from PR #1118, commit 3021cfbf...
 */
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const EM_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REQUIRED_ROUTES = Object.freeze(['EXPERIENTIAL','CUSTODIAL','AUDIT','IMPLEMENTATION']);
export const COMMON_CAPABILITIES = Object.freeze([
  'SOURCE_CUSTODY_AND_DELTA_SYNC',
  'WORK_MANIFESTATION_IDENTITY',
  'SOURCE_BOUND_RETRIEVAL',
  'CONCEPT_AND_MOTIF_SIEVE',
  'FORMAL_OPERATOR_AND_NOVELTY_SIEVE',
  'TYPED_MULTIPLEX_TOPOLOGY',
  'WITHDRAWAL_AND_HELD_OUT_RECONSTRUCTION',
  'ALTERNATIVE_MODELS_AND_NEGATIVE_CONTROLS',
  'FOUR_RECEIVER_AIA_PROJECTIONS',
  'ATELIER_INTERCHANGE_PACKET'
]);
const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const readJsonl = p => fs.readFileSync(p,'utf8').split(/\r?\n/).filter(Boolean).map((l,i)=>{
  try { return JSON.parse(l); }
  catch (e) { throw new Error('INVALID_JSONL:'+p+':'+(i+1)+':'+e.message); }
});
const assert = (v,msg) => { if (!v) throw new Error(msg); };
const own = (obj,key) => Object.prototype.hasOwnProperty.call(obj,key);
const nonempty = s => typeof s==='string' && s.trim().length>0;
const unique = xs => new Set(xs).size===xs.length;

export function inspectEmCorpus(root=EM_ROOT) {
  const registry=readJson(path.join(root,'01-MANIFESTS/registry-index.json'));
  const profile=readJson(path.join(root,'ATELIER_PROFILE.json'));
  const method=readJson(path.resolve(root,'../ATELIER_METHOD/atelier-method-v0.1.json'));
  assert(profile.atelier_id==='EMSTD613','WRONG_ATELIER');
  assert(profile.method_version===method.schema,'METHOD_SCHEMA_MISMATCH');
  assert(profile.human_closure_required===true && profile.scientific_promotion_authority===false,'AUTHORITY_BOUNDARY_BROKEN');
  for (const route of REQUIRED_ROUTES) assert(profile.aia_routes.includes(route),'MISSING_ROUTE:'+route);
  const sourceRows=readJsonl(path.join(root,registry.registries.source_files));
  const works=readJsonl(path.join(root,registry.registries.works));
  const manifestations=readJsonl(path.join(root,registry.registries.work_manifestations));
  assert(unique(sourceRows.map(x=>x.source_file_id)),'SOURCE_ID_COLLISION');
  assert(unique(works.map(x=>x.work_id)),'WORK_ID_COLLISION');
  const sources=new Map(sourceRows.map(x=>[x.source_file_id,x]));
  const workIds=new Set(works.map(x=>x.work_id));
  for(const item of sourceRows) {
    assert(/^[a-f0-9]{64}$/.test(item.sha256),'INVALID_SOURCE_DIGEST:'+item.source_file_id);
    assert(nonempty(item.provenance_basis),'SOURCE_PROVENANCE_MISSING:'+item.source_file_id);
  }
  for(const row of manifestations) {
    assert(sources.has(row.source_file_id),'ORPHAN_MANIFESTATION:'+row.source_file_id);
    if(row.work_id!==null) assert(workIds.has(row.work_id),'UNRESOLVED_WORK_REF:'+row.work_id);
  }
  const states={};
  for(const [kind,relative] of Object.entries(registry.registries)) {
    const declared=registry.registry_states[kind]??'NOT_CLASSIFIED';
    const present=fs.existsSync(path.join(root,relative));
    states[kind]={declared,present,consistent:declared==='NOT_GENERATED'?!present:present};
  }
  assert(registry.work_identity_state.WORK_IDENTITY_FULLY_RESOLVED===false,'IDENTITY_UNCERTAINTY_ERASED');
  assert(registry.work_identity_state.identity_sensitivity_required_downstream===true,'SPLIT_COLLAPSE_REQUIREMENT_ERASED');
  const capabilities=[
    {name:COMMON_CAPABILITIES[0],state:'BOUNDED_HISTORICAL_INTAKE_ONLY',explanation:'Original custody and handoff receipts exist; a repeatable independent EM delta-sync runner has not been demonstrated.'},
    {name:COMMON_CAPABILITIES[1],state:'IMPLEMENTED_WITH_OPEN_IDENTITY',explanation:'Work/manifestation index exists; supported groups remain subject to split/collapse sensitivity.'},
    {name:COMMON_CAPABILITIES[2],state:'SOURCE_RESOLUTION_BOUND',explanation:'Registries permit source-file lookup; generic cross-epoch projective querying is not demonstrated.'},
    {name:COMMON_CAPABILITIES[3],state:states.motifs?.present&&states.concepts?.present?'REGISTERED_NOT_VALIDATED':'NOT_GENERATED',explanation:'Written motif/sieve assays exist; a reusable populated concept/motif index is unverified or absent.'},
    {name:COMMON_CAPABILITIES[4],state:'DOCUMENTED_ASSAYS_NOT_GENERAL_ENGINE',explanation:'Formalism hostile controls and selected receipts exist, but do not establish a universal novelty detector.'},
    {name:COMMON_CAPABILITIES[5],state:states.relations?.present?'REGISTERED_NOT_VALIDATED':'NOT_GENERATED',explanation:'Typed graph semantics are documented; a populated relation ledger is missing or unverified.'},
    {name:COMMON_CAPABILITIES[6],state:'PROTOCOL_ONLY',explanation:'A held-out reconstruction benchmark on live EM source claims has not been demonstrated.'},
    {name:COMMON_CAPABILITIES[7],state:'SELECTED_RECEIPTS',explanation:'Existing red-team studies provide bounded examples; common adversarial battery unverified.'},
    {name:COMMON_CAPABILITIES[8],state:'BOUNDING_ADAPTER_AVAILABLE',explanation:'Four distinct projections can be generated for validated finding packets; no UI/browser claim.'},
    {name:COMMON_CAPABILITIES[9],state:'BOUNDING_VALIDATOR_AVAILABLE',explanation:'Strict typed finding validation; no automatic evidence-class or graph-edge promotion.'}
  ];
  return {
    schema:'td613.em-parity-inspection/v0.1',
    method:method.schema,
    atelier_id:profile.atelier_id,
    source_file_count:sourceRows.length,
    operational_work_count:works.length,
    manifestation_count:manifestations.length,
    independent_work_count_interval:[registry.work_identity_state.independent_work_count_lower_bound,registry.work_identity_state.independent_work_count_upper_bound],
    independent_work_count_exact:'UNRESOLVED',
    custody_scope:'MANIFEST_AND_REGISTERED_HASHES_ONLY_NO_BLOB_REHASH',
    registry_states:states,
    capabilities,
    authority:{human_closure_required:true,scientific_promotion:false,merge:false,publication:false,release:false},
    source_ids:new Set(sourceRows.map(x=>x.source_file_id))
  };
}

/**
 * Every finding packet is an asserted claim by its proposer; this validator
 * checks provenance shape and authorization ceiling, NOT the truth of the claim.
 */
export function validateInterchange(packet,{method,sourceIds}={}) {
  assert(packet && typeof packet==='object' && !Array.isArray(packet),'PACKET_REQUIRED');
  assert(method?.schema==='td613.atelier-method/v0.1','PINNED_METHOD_REQUIRED');
  for(const key of method.finding_packet_fields) assert(own(packet,key),'MISSING_PACKET_FIELD:'+key);
  assert(packet.atelier_id==='EMSTD613','ATELIER_ID_MISMATCH');
  assert(nonempty(packet.finding_id)&&nonempty(packet.proposition),'EMPTY_ID_OR_PROPOSITION');
  assert(nonempty(packet.snapshot_or_epoch),'SNAPSHOT_UNBOUND');
  assert(method.graph_separation.includes(packet.projection_or_graph_family),'UNKNOWN_GRAPH_PROJECTION');
  assert(method.evidence_ladder.includes(packet.evidence_class),'UNTRANSLATED_EVIDENCE_CLASS');
  assert(nonempty(packet.claim_ceiling),'CLAIM_CEILING_MISSING');
  assert(packet.authority_state==='RESEARCH_ONLY','AUTHORITY_TRANSFER_FORBIDDEN');
  assert(packet.human_closure_state==='PENDING_HUMAN_REVIEW','UNAUTHORIZED_HUMAN_CLOSURE');
  for(const field of ['entities','source_span_or_source_refs','evidence_chain','alternative_models','disconfirmers','negative_state_notes','external_witnesses']) {
    assert(Array.isArray(packet[field]),'FIELD_MUST_BE_ARRAY:'+field);
  }
  assert(packet.time_coordinates&&typeof packet.time_coordinates==='object','TIME_COORDINATES_MISSING');
  assert(nonempty(packet.next_highest_information_test),'NEXT_TEST_MISSING');
  assert(packet.source_span_or_source_refs.length>0,'SOURCE_LOCATOR_MISSING');
  assert(packet.evidence_chain.length>0,'EVIDENCE_CHAIN_MISSING');
  assert(packet.evidence_class!=='TD613_SCIENTIFIC_PROMOTION','SCIENTIFIC_PROMOTION_FORBIDDEN');
  if(sourceIds)for(const r of packet.source_span_or_source_refs){
    assert(r && nonempty(r.source_file_id) && sourceIds.has(r.source_file_id),'UNBOUND_SOURCE_REF');
    assert(nonempty(r.span_or_locator),'SOURCE_SPAN_UNBOUND');
  }
  if(packet.local_evidence_class!==undefined) {
    assert(nonempty(packet.local_evidence_class),'LOCAL_EVIDENCE_CLASS_EMPTY');
    assert(nonempty(packet.class_translation_basis),'CLASS_TRANSLATION_BASIS_MISSING');
  }
  return {valid:true,claim_ceiling:packet.claim_ceiling,evidence_class:packet.evidence_class,scientific_promotion:false};
}

export function compileAiaViews(packet,ctx) {
  validateInterchange(packet,ctx);
  const shared={
    atelier_id:packet.atelier_id,finding_id:packet.finding_id,
    source_span_or_source_refs:packet.source_span_or_source_refs,
    evidence_class:packet.evidence_class,claim_ceiling:packet.claim_ceiling,
    authority_state:packet.authority_state,human_closure_state:packet.human_closure_state
  };
  return Object.freeze({
    EXPERIENTIAL:Object.freeze({...shared,proposition:packet.proposition,entities:packet.entities,negative_state_notes:packet.negative_state_notes}),
    CUSTODIAL:Object.freeze({...shared,snapshot_or_epoch:packet.snapshot_or_epoch,time_coordinates:packet.time_coordinates,evidence_chain:packet.evidence_chain}),
    AUDIT:Object.freeze({...shared,alternative_models:packet.alternative_models,disconfirmers:packet.disconfirmers,external_witnesses:packet.external_witnesses,next_highest_information_test:packet.next_highest_information_test}),
    IMPLEMENTATION:Object.freeze({...shared,projection_or_graph_family:packet.projection_or_graph_family,method_version:ctx.method.schema,operation_state:'PACKET_VALIDATED_NOT_SCIENTIFICALLY_VERIFIED'})
  });
}

/** Structural graph compiler only: exact declared edges, no semantic inference. */
export function compileTypedGraph(edges,knownSourceIds) {
  assert(Array.isArray(edges),'EDGES_MUST_BE_ARRAY');
  const graphs={};const seen=new Set();
  for(const edge of edges) {
    assert(nonempty(edge.edge_id)&&!seen.has(edge.edge_id),'MISSING_OR_DUPLICATE_EDGE_ID');
    seen.add(edge.edge_id);
    for(const key of ['from','to','projection','relation','evidence_class'])assert(nonempty(edge[key]),'MISSING_EDGE_FIELD:'+key);
    assert(['SOURCE_WITNESSED','ARCHIVE_OBSERVED','RESEARCH_HYPOTHESIS'].includes(edge.evidence_class),'INVALID_EDGE_EVIDENCE_CLASS');
    assert(Array.isArray(edge.source_refs)&&edge.source_refs.length>0,'EDGE_WITHOUT_SOURCE');
    if(knownSourceIds)for(const ref of edge.source_refs)assert(knownSourceIds.has(ref),'UNKNOWN_EDGE_SOURCE');
    assert(nonempty(edge.claim_ceiling),'EDGE_CEILING_MISSING');
    assert(edge.authority_state==='RESEARCH_ONLY','EDGE_AUTHORITY_TRANSFER');
    (graphs[edge.projection]??=[]).push({...edge});
  }
  return graphs;
}

/** Pure structural ablation, not proof of a causal or theoretical relation. */
export function withdrawSource(graphs,sourceId) {
  const retained={};const removed={};
  for(const [kind,edges] of Object.entries(graphs)) {
    retained[kind]=edges.filter(x=>!x.source_refs.includes(sourceId));
    removed[kind]=edges.length-retained[kind].length;
  }
  return {retained,removed,claim:'STRUCTURAL_WITHDRAWAL_ONLY_NO_CAUSAL_INFERENCE'};
}

export function makeBlurbHypothesis({finding_id,source_file_id,span_or_locator,proposition,snapshot_or_epoch}) {
  assert(nonempty(source_file_id)&&nonempty(span_or_locator)&&nonempty(proposition),'UNBOUND_BLURB');
  return {
    finding_id,atelier_id:'EMSTD613',snapshot_or_epoch,entities:[source_file_id],
    proposition,projection_or_graph_family:'RECONSTRUCTION',
    source_span_or_source_refs:[{source_file_id,span_or_locator}],
    evidence_class:'RESEARCH_HYPOTHESIS',
    local_evidence_class:'BLURB_ONLY',
    class_translation_basis:'A source blurb supports an interpretation proposal only; full-work and mechanism claims remain unobserved.',
    evidence_chain:['LOCATED_SOURCE_BLURB_ONLY'],
    time_coordinates:{source:'UNDETERMINED',observation:'UNDETERMINED'},
    authority_state:'RESEARCH_ONLY',
    claim_ceiling:'BLURB_BOUNDED_HYPOTHESIS_ONLY_NO_MECHANISM_OR_NOVELTY_ESTABLISHED',
    alternative_models:['GENERIC_DISCIPLINARY_VOCABULARY','METAPHOR_WITHOUT_OPERATOR','CONVERGENT_FORMULATION'],
    disconfirmers:['FULL_SOURCE_CONTRADICTS_PROPOSAL','OPERATOR_NOT_SPECIFIED','PRIOR_ART_DEFEATS_NOVELTY'],
    negative_state_notes:['FULL_TEXT_NOT_EVALUATED','MATHEMATICAL_PROOF_NOT_WITNESSED','EMPIRICAL_SUPPORT_NOT_WITNESSED'],
    external_witnesses:[],
    next_highest_information_test:'Acquire exact full source and identify a specific operator, boundary condition, and falsifier.',
    human_closure_state:'PENDING_HUMAN_REVIEW'
  };
}


/**
 * Stage an operator-reviewed, local source intake proposal without accessing or
 * writing the corpus. Matches the SRC pattern of separate acquisition and
 * admission while preserving Em's rights and independent source provenance.
 */
export function stageSourceIntake({bytes,original_filename,media_type,provenance_basis,rights_state,parent_epoch}) {
  assert(bytes instanceof Uint8Array,'INTAKE_BYTES_REQUIRED');
  assert(nonempty(original_filename)&&nonempty(media_type),'INTAKE_IDENTITY_REQUIRED');
  assert(nonempty(provenance_basis)&&nonempty(parent_epoch),'INTAKE_PROVENANCE_OR_EPOCH_MISSING');
  assert(['PUBLIC','PRIVATE_RETAIN_ONLY','RESTRICTED_NO_EXPORT'].includes(rights_state),'INTAKE_RIGHTS_UNRESOLVED');
  const digest=createHash('sha256').update(bytes).digest('hex');
  return Object.freeze({
    schema:'td613.em-source-stage/v0.1',state:'STAGED_UNADMITTED',source_file_id_candidate:'emstaged_'+digest.slice(0,24),
    sha256:digest,byte_length:bytes.length,original_filename,media_type,provenance_basis,
    rights_state,parent_epoch,public_export_permitted:false,
    accession_authorized:false,scientific_support_created:false,
    required_next_step:'HUMAN_REVIEW_AND_SEPARATELY_AUTHORIZED_APPEND_ONLY_INTAKE'
  });
}

const direct=process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(direct) {
  if(process.argv.length!==2 && process.argv[2]!=='--status') throw new Error('USAGE: node em-atelier-parity.mjs --status');
  const a=inspectEmCorpus();
  delete a.source_ids;
  process.stdout.write(JSON.stringify(a,null,2)+'\n');
}
