#!/usr/bin/env node
/**
 * TD613-derived Wendbine typed-topology negative control. ORIGINAL fixture
 * is read-only; swapped endpoint targets are an explicitly synthetic test.
 * We do not conflate graph-class classification with edge-topology inference.
 */
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {loadOriginalPublicFixture,runReconstructionAssay,validateNativeMaterials}
 from './wendbine-proscenium-assay.mjs';
import {calculateFrequencyNullChallenge} from './wendbine-frequency-null-challenge.mjs';

const insist=(yes,reason)=>{if(!yes)throw Error(reason)};
const sha=x=>createHash('sha256').update(x).digest('hex');
const serial=x=>JSON.stringify(x);
const ordered=x=>[...x].sort((a,b)=>a.localeCompare(b));
const catalog=(relations,kind)=>{
 const counts=new Map();
 for(const e of relations){
  const k=kind==='labels'?[e.source_id,e.graph,e.relation,e.evidence_class]:
   kind==='out'?[e.source_id,e.from]:
   kind==='in'?[e.source_id,e.to]:[e.source_id,e.graph,e.from,e.relation,e.to,e.evidence_class];
  const key=serial(k);
  counts.set(key,(counts.get(key)||0)+1);
 }
 return serial(ordered([...counts].map(([k,n])=>k+':'+n)));
};
const twoHop=relations=>{
 const bySource=new Map();
 for(const e of relations){if(!bySource.has(e.source_id))bySource.set(e.source_id,[]);bySource.get(e.source_id).push(e)}
 const paths=new Set();
 for(const [source,edges] of bySource)for(const a of edges)for(const b of edges){
  if(a.to===b.from)paths.add(serial([source,a.graph,a.from,a.relation,a.to,b.graph,b.relation,b.to]));
 }
 return paths;
};

export function rewireTypedDestinations(original){
 insist(Array.isArray(original)&&original.length>0,'HELD_REWIRE_REQUIRES_SOURCE_RELATIONS');
 const relations=original.map(e=>({...e}));
 const byClass=new Map();
 for(let i=0;i<relations.length;i++){
  const e=relations[i],k=serial([e.source_id,e.graph,e.evidence_class]);
  if(!byClass.has(k))byClass.set(k,[]);
  byClass.get(k).push(i);
 }
 const alterations=[];
 for(const indexes of byClass.values()){
  let found=false;
  for(let i=0;i<indexes.length&&!found;i++)for(let j=i+1;j<indexes.length&&!found;j++){
   const a=relations[indexes[i]],b=relations[indexes[j]];
   if(a.from===b.from||a.to===b.to||a.from===b.to||b.from===a.to)continue;
   const oldA=a.to,oldB=b.to;
   a.to=oldB;b.to=oldA;
   alterations.push({source_id:a.source_id,graph:a.graph,evidence_class:a.evidence_class,
    affected_edges:2,alteration:'SWAP_DESTINATION_ENDPOINTS_SYNTHETIC'});
   found=true;
  }
 }
 insist(alterations.length>0,'HELD_NO_ADMISSIBLE_TOPOLOGY_REWIRE');
 for(const kind of ['labels','out','in']){
  insist(catalog(original,kind)===catalog(relations,kind),
   'HELD_REWIRE_BROKE_SOURCE_GRAPH_RELATION_OR_DEGREE_CONSTRAINT_'+kind);
 }
 insist(catalog(original,'exact')!==catalog(relations,'exact'),'HELD_REWIRE_NO_TOPOLOGICAL_CHANGE');
 return {relations,alterations,changed_edge_count:alterations.length*2};
}

export function calculateTopologyRewireChallenge({meta,posts,relations}){
 validateNativeMaterials(meta,posts,relations);
 const days=ordered(new Set(posts.map(p=>p.public_date)));
 insist(days.length===2,'HELD_TOPOLOGY_TWO_DAY_SNAPSHOT_ONLY');
 const priorIDs=new Set(posts.filter(p=>p.public_date===days[0]).map(p=>p.source_id));
 const targets=posts.filter(p=>p.public_date===days[1]);
 insist(targets.length>0&&priorIDs.size>0,'HELD_TOPOLOGY_SPLIT_EMPTY');
 const training=relations.filter(e=>priorIDs.has(e.source_id));
 const altered=rewireTypedDestinations(training);
 let j=0;
 const rewired=relations.map(e=>priorIDs.has(e.source_id)?altered.relations[j++]:e);
 insist(j===training.length,'HELD_TOPOLOGY_REWIRE_RECOMBINATION_DRIFT');
 insist(catalog(relations,'labels')===catalog(rewired,'labels')&&
  catalog(relations,'out')===catalog(rewired,'out')&&
  catalog(relations,'in')===catalog(rewired,'in'),
  'HELD_TOPOLOGY_WITNESS_INVARIANTS_FAILED');
 const A=twoHop(training),B=twoHop(altered.relations);
 const removed=[...A].filter(k=>!B.has(k)).length;
 const added=[...B].filter(k=>!A.has(k)).length;
 insist(removed>0&&added>0,'HELD_REWIRE_FAILED_TO_CHANGE_DIRECTED_TWO_HOP_IDENTITIES');
 const frequencyOriginal=calculateFrequencyNullChallenge({meta,posts,relations});
 const frequencyRewired=calculateFrequencyNullChallenge({meta,posts,relations:rewired});
 insist(serial(frequencyOriginal.aggregate)===serial(frequencyRewired.aggregate),
  'HELD_FREQUENCY_CONTROL_CHANGED_UNEXPECTEDLY');
 const perTarget=targets.map(target=>{
  const input={meta,posts,mode:'assay',target_source_id:target.source_id};
  const source=runReconstructionAssay({...input,relations});
  const synthetic=runReconstructionAssay({...input,relations:rewired});
  const p=source.controls.C0.prediction,q=synthetic.controls.C0.prediction;
  const invariant=serial(p)===serial(q);
  return {source_id:target.source_id,as_of_day:target.public_date,
   training_source_count:source.earlier_day_source_count,
   title_disclosed:true,original_graph_hits:source.controls.C0.scoring.graph_hits,
   rewired_graph_hits:synthetic.controls.C0.scoring.graph_hits,
   original_concept_hits:source.controls.C0.scoring.neighbor_hits,
   rewired_concept_hits:synthetic.controls.C0.scoring.neighbor_hits,
   prediction_invariant_under_degree_preserving_rewire:invariant,
   original_title_query_digest:source.query_sha256,
   synthetic_title_query_digest:synthetic.query_sha256};
 });
 const sum=k=>perTarget.reduce((n,r)=>n+r[k],0);
 const unchanged=perTarget.filter(r=>r.prediction_invariant_under_degree_preserving_rewire).length;
 return {schema:'td613.wendbine.topology-rewire-challenge/v1',
  state:'HELD_NO_TOPOLOGY_SPECIFIC_PREDICTIVE_CONTRIBUTION_DEMONSTRATED',
  experiment_class:'POST_HOC_REGISTERED_PUBLIC_SNAPSHOT_STRUCTURAL_NEGATIVE_CONTROL',
  original_historical_protocol_modified:false,source_body_copied:false,
  original_source_estate_mutated:false,private_capture_read:false,
  original_performer_authorship_promotion:false,
  snapshot_id:meta.snapshot_id,source_coverage_state:meta.coverage.state,
  comparison_semantics:'RETROSPECTIVE_EARLIER_PUBLIC_DAY_ONLY_NO_HISTORICAL_CAPTURE_REPLAY',
  training_day:days[0],target_day:days[1],target_count:perTarget.length,
  synthetic_control:{
   kind:'WITHIN_SOURCE_GRAPH_AND_EVIDENCE_CLASS_DEGREE_PRESERVING_DESTINATION_REWIRING',
   original_training_edge_count:training.length,
   changed_endpoint_count:altered.changed_edge_count,
   changed_source_graph_groups:altered.alterations.length,
   preserves_source_graph_relation_evidence_histogram:true,
   preserves_per_source_directed_in_and_out_degree:true,
   original_two_hop_identities:A.size,rewired_two_hop_identities:B.size,
   two_hop_identities_removed:removed,two_hop_identities_created:added,
   original_synthetic_training_equal:false,
   synthetic_relations_claimed_as_original:false,
   original_training_digest:sha(serial(training)),
   synthetic_training_digest:sha(serial(altered.relations))
  },
  controls:{
   disclosed_title_with_original_edges:{
    graph_hits:sum('original_graph_hits'),concept_hits:sum('original_concept_hits')},
   disclosed_title_with_rewired_edges:{
    graph_hits:sum('rewired_graph_hits'),concept_hits:sum('rewired_concept_hits')},
   withheld_title_frequency_prior_original:{
    graph_hits:frequencyOriginal.aggregate.frequency_graph_hits,
    concept_hits:frequencyOriginal.aggregate.frequency_concept_hits},
   withheld_title_frequency_prior_rewired:{
    graph_hits:frequencyRewired.aggregate.frequency_graph_hits,
    concept_hits:frequencyRewired.aggregate.frequency_concept_hits},
   caveat:'TITLE_DISCLOSED_CLASSIFIER_VS_QUERY_BLIND_FREQUENCY_ARE_DIFFERENT_MODELS_NOT_CAUSAL_TITLE_ABLATION',
   matching_prediction_budgets:{graph_families:3,concept_labels:5},
   title_withheld_prior_uses_only_strictly_earlier_day_records:true
  },
  model_sensitivity:{
   invariant_target_count:unchanged,changed_target_count:perTarget.length-unchanged,
   warning:'PREDICTOR_READS_GRAPH_FAMILY_LABELS_BUT_NOT_FROM_RELATION_TO_ENDPOINTS',
   proving_original_research_topology_false:false,
   demonstrating_current_derived_predictor_topology_specificity:false
  },
  original_compiler_directly_executes_in_native_entrypoint:true,
  per_target:perTarget,
  scientific_credit:0,causal_credit:0,independent_replication_credit:0,
  next_discriminating_design:{
   status:'PREREGISTRATION_REQUIRED_BEFORE_ANY_NEW_INDEPENDENT_TARGET_ACQUISITION',
   requirement:'SOURCE_BOUND_ENDPOINT_AWARE_PREDICTOR_VS_DEGREE_PRESERVING_REWIRE_ON_FUTURE_BLINDED_TARGETS',
   human_task:'ACQUIRE_INDEPENDENT_PRE_CUTOFF_CAPTURE_OR_PROSPECTIVE_POSTS_WITH_PRESERVED_TIMESTAMPS',
   independent_exogenous_evidence_currently_observed:false},
  human_closure_required:true};
}

export async function runNativeTopologyRewireChallenge(){
 const fixture=await loadOriginalPublicFixture();
 return {...calculateTopologyRewireChallenge(fixture),
  original_compiler_receipt:fixture.compiler_receipt,
  custody:fixture.digests,vixen_work_import_count:0};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  if(process.argv.length!==2)throw Error('HELD_TOPOLOGY_CHALLENGE_ACCEPTS_NO_UNTRUSTED_FLAGS');
  process.stdout.write(JSON.stringify(await runNativeTopologyRewireChallenge())+'\n');
 }catch(e){process.stderr.write(JSON.stringify({state:'HELD',reason:String(e.message||e)})+'\n');process.exitCode=2;}
}
