#!/usr/bin/env node
/**
 * TD613/Wendbine public retrospective null challenge.
 * A source-frequency baseline is intentionally simpler than the named method.
 * The historical v0.1 protocol is immutable; this is a successor diagnostic.
 * No foreign Work or private capture bytes enter the Vixen subject estate.
 */
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {loadOriginalPublicFixture,runRetrospectiveSweep,validateNativeMaterials}
 from './wendbine-proscenium-assay.mjs';

const sha=x=>createHash('sha256').update(x).digest('hex');
const assert=(v,reason)=>{if(!v)throw Error(reason)};
const top=(map,n)=>[...map].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,n).map(row=>row[0]);
const sum=(rows,k)=>rows.reduce((n,r)=>n+r[k],0);

export function calculateFrequencyNullChallenge({meta,posts,relations}){
 validateNativeMaterials(meta,posts,relations);
 const sweep=runRetrospectiveSweep({meta,posts,relations});
 const targets=new Map(posts.map(p=>[p.source_id,p]));
 const rows=sweep.per_target.map(original=>{
  const t=targets.get(original.source_id);
  assert(t&&t.public_date===original.public_day,'HELD_TARGET_SOURCE_DRIFT');
  const before=posts.filter(p=>p.public_date<t.public_date);
  const sourceIDs=new Set(before.map(p=>p.source_id));
  assert(before.length===original.earlier_source_count,'HELD_EARLIER_DAY_CARDINALITY_DRIFT');
  const graphFreq=new Map(),conceptFreq=new Map();
  for(const e of relations.filter(e=>sourceIDs.has(e.source_id)))
   graphFreq.set(e.graph,(graphFreq.get(e.graph)||0)+1);
  for(const p of before)for(const c of p.declared_concepts)
   conceptFreq.set(c,(conceptFreq.get(c)||0)+1);
  const priorGraphs=top(graphFreq,3),priorConcepts=top(conceptFreq,5);
  const actualGraphs=new Set(relations.filter(e=>e.source_id===t.source_id).map(e=>e.graph));
  const actualConcepts=new Set(t.declared_concepts);
  const frequencyGraphHits=priorGraphs.filter(g=>actualGraphs.has(g)).length;
  const frequencyConceptHits=priorConcepts.filter(c=>actualConcepts.has(c)).length;
  return {source_id:t.source_id,public_day:t.public_date,
   earlier_source_count:before.length,
   baseline_graph_hits:original.baseline_graph_hits,
   permuted_graph_hits:original.label_permutation_graph_hits,
   frequency_graph_hits:frequencyGraphHits,
   baseline_concept_hits:original.baseline_neighbor_hits,
   frequency_concept_hits:frequencyConceptHits,
   baseline_graph_beats_permutation:original.baseline_graph_hits>original.label_permutation_graph_hits,
   baseline_graph_beats_frequency:original.baseline_graph_hits>frequencyGraphHits,
   baseline_concept_beats_frequency:original.baseline_neighbor_hits>frequencyConceptHits,
   controls:{
    frequency_graph_prior:priorGraphs,
    frequency_concept_prior:priorConcepts,
    aggregation_scope:'STRICTLY_EARLIER_DAY_PUBLIC_SNAPSHOT',
    graph_frequency_unit:'SOURCE_BOUND_TYPED_EDGE',
    concept_frequency_unit:'PER_POST_DECLARED_CONCEPT',
    prediction_budget:{graph_families:3,concept_labels:5}
   }};
 });
 const aggregate={
  targets:rows.length,
  baseline_graph_hits:sum(rows,'baseline_graph_hits'),
  permuted_graph_hits:sum(rows,'permuted_graph_hits'),
  frequency_graph_hits:sum(rows,'frequency_graph_hits'),
  baseline_concept_hits:sum(rows,'baseline_concept_hits'),
  frequency_concept_hits:sum(rows,'frequency_concept_hits'),
  baseline_graph_beats_permutation_targets:rows.filter(r=>r.baseline_graph_beats_permutation).length,
  baseline_graph_beats_frequency_targets:rows.filter(r=>r.baseline_graph_beats_frequency).length,
  baseline_concept_beats_frequency_targets:rows.filter(r=>r.baseline_concept_beats_frequency).length};
 const claims={
  graph_family_outperforms_frequency_in_archive:
   aggregate.baseline_graph_hits>aggregate.frequency_graph_hits,
  graph_family_outperforms_permuted_concepts_in_archive:
   aggregate.baseline_graph_hits>aggregate.permuted_graph_hits,
  concept_matching_outperforms_frequency_in_archive:
   aggregate.baseline_concept_hits>aggregate.frequency_concept_hits};
 const evidence_state=(claims.graph_family_outperforms_permuted_concepts_in_archive&&
   claims.graph_family_outperforms_frequency_in_archive&&
   claims.concept_matching_outperforms_frequency_in_archive)
    ?'HELD_EXPLORATORY_ADVANTAGE_STILL_NEEDS_INDEPENDENT_REPLICATION'
    :'HELD_NONTRIVIAL_METHOD_ADVANTAGE_NOT_DISTINGUISHED_FROM_ALL_NULLS';
 return {schema:'td613.wendbine.frequency-null-challenge/v1',
  state:evidence_state,
  experiment_class:'RETROSPECTIVE_POST_HOC_DIAGNOSTIC_NOT_PREREGISTERED',
  original_historical_protocol_modified:false,
  snapshot_id:meta.snapshot_id,
  coverage_state:meta.coverage.state,
  control_subject:'REGISTERED_PUBLIC_SOURCE_LABELS_ONLY',
  foreign_work_admitted_as_vixen_performer:false,
  partial_date_clock:'DAY_ONLY_NO_SAME_DAY_ORDER',
  historical_observation_clock_independently_attested:false,
  targets:rows,aggregate,claims,
  empty_source_absence_interpretation:'NOT_EVIDENCE_OF_ABSENCE',
  graph_ablation_caution:'REMOVING_ALL_GRAPH_EDGES_FORCES_ZERO_GRAPH_PREDICTIONS_BY_CONSTRUCTION',
  title_disclosure:'TARGET_TECHNICAL_HEADER_USED_AS_QUERY',
  parity_and_science:'NOT_ESTABLISHED',
  independent_replication_credit:0,
  scientific_credit:0,human_closure_required:true,
  next_discriminator:'BLINDED_TIME_MATCHED_TARGETS_AND_SEPARATE_CONCEPT_PLUS_TYPED_GRAPH_CONTROLS'};
}

export async function runNativeFrequencyNullChallenge(){
 const materials=await loadOriginalPublicFixture();
 const receipt=calculateFrequencyNullChallenge(materials);
 return {...receipt,
  original_compiler_receipt:materials.compiler_receipt,
  custody:{sources:materials.digests.sources,relations:materials.digests.relations,
   original_compiler:materials.digests.original_compiler},
  local_private_index_accessed:false,vixen_work_import_count:0};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  if(process.argv.length!==2)throw Error('HELD_NULL_CHALLENGE_ACCEPTS_NO_UNTRUSTED_FLAGS');
  process.stdout.write(JSON.stringify(await runNativeFrequencyNullChallenge())+'\n');
 }catch(e){process.stderr.write(JSON.stringify({state:'HELD',reason:String(e.message||e)})+'\n');process.exitCode=2;}
}
