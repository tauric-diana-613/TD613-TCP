#!/usr/bin/env node
/**
 * TD613-derived, predeclared-in-code directed-walk comparator.
 * POST-HOC EXPLORATORY ONLY: original historical protocol unchanged.
 * The original Wendbine source texts/identities never enter Vixen Works.
 */
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {loadOriginalPublicFixture,validateNativeMaterials} from './wendbine-proscenium-assay.mjs';
import {rewireTypedDestinations,calculateTopologyRewireChallenge}
 from './wendbine-topology-rewire-challenge.mjs';

const assert=(ok,code)=>{if(!ok)throw Error(code)};
const sha=x=>createHash('sha256').update(x).digest('hex');
const serial=x=>JSON.stringify(x);
const SKIP=new Set(['and','the','with','from','into','for','across','versus','between']);
const tok=x=>new Set((String(x||'').toLowerCase().match(/[a-z][a-z0-9]{2,}/g)||[])
 .filter(word=>!SKIP.has(word)));
const scoreAdd=(map,key,amount)=>map.set(key,(map.get(key)||0)+amount);
const top=(map,n)=>[...map].filter(row=>row[1]>0)
 .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,n).map(row=>row[0]);
const sum=(rows,k)=>rows.reduce((n,r)=>n+r[k],0);
const hits=(prediction,actual)=>prediction.filter(x=>actual.has(x)).length;

/**
 * Uses title tokens as disclosed query; directed edge endpoints as sources of
 * candidate graph-family/concept scores. No target concepts/edges supplied.
 * Fixed, theory-motivated weights; NEVER choose after seeing target scores.
 */
export function predictDirectedWalk({title,trainingPosts,trainingEdges}){
 assert(typeof title==='string'&&title.length>0&&title.length<=250,'HELD_DIRECTED_TITLE_INVALID');
 assert(Array.isArray(trainingPosts)&&Array.isArray(trainingEdges),'HELD_DIRECTED_TRAINING_REQUIRED');
 const q=tok(title);
 const nodes=new Set(trainingEdges.flatMap(e=>[e.from,e.to]));
 const anchors=new Map();
 for(const node of nodes){
  const v=tok(node),common=[...q].filter(t=>v.has(t)).length;
  if(common&&q.size&&v.size)anchors.set(node,common/Math.sqrt(q.size*v.size));
 }
 const priorConcepts=new Set(trainingPosts.flatMap(p=>p.declared_concepts));
 const graphScores=new Map(),conceptScores=new Map(),witnesses=new Set();
 const bySource=new Map();
 for(const e of trainingEdges){
  if(!bySource.has(e.source_id))bySource.set(e.source_id,[]);
  bySource.get(e.source_id).push(e);
 }
 const addConcept=(name,weight)=>{
  // Only registered earlier-day concept vocabulary is admissible as a prediction.
  if(priorConcepts.has(name))scoreAdd(conceptScores,name,weight);
 };
 let twoHopWalks=0;
 for(const e of trainingEdges){
  const from=anchors.get(e.from)||0,to=anchors.get(e.to)||0;
  if(from){
   scoreAdd(graphScores,e.graph,from);
   addConcept(e.to,from);
   witnesses.add(e.source_id);
  }
  if(to){
   scoreAdd(graphScores,e.graph,to*0.35);
   addConcept(e.from,to*0.35);
   witnesses.add(e.source_id);
  }
  // Two-step traversals must be directed, source-bound, and address the
  // literal endpoints. A graph-class label alone cannot satisfy this route.
  for(const next of bySource.get(e.source_id)||[]){
   if(from&&e.to===next.from){
    scoreAdd(graphScores,next.graph,from*0.40);
    addConcept(next.to,from*0.40);
    twoHopWalks++;
   }
   if(to&&next.to===e.from){
    scoreAdd(graphScores,next.graph,to*0.14);
    addConcept(next.from,to*0.14);
    twoHopWalks++;
   }
  }
 }
 const graphFamilies=top(graphScores,3),neighborConcepts=top(conceptScores,5);
 const signature=serial({
  graphs:[...graphScores].sort((a,b)=>a[0].localeCompare(b[0]))
   .map(([k,v])=>[k,Number(v.toFixed(12))]),
  concepts:[...conceptScores].sort((a,b)=>a[0].localeCompare(b[0]))
   .map(([k,v])=>[k,Number(v.toFixed(12))])
 });
 return {state:anchors.size?'DIRECTED_TITLE_CONDITIONED_PREDICTION':'ABSTAIN_NO_EARLIER_ENDPOINT_ANCHORS',
  graph_families:graphFamilies,neighbor_concepts:neighborConcepts,
  title_token_count:q.size,matched_endpoint_count:anchors.size,
  active_two_hop_walk_count:twoHopWalks,
  source_witness_ids:[...witnesses].sort(),score_signature_sha256:sha(signature),
  graph_prediction_budget:3,concept_prediction_budget:5,
  title_leakage:'DISCLOSED_TECHNICAL_HEADER',
  direction_weights:{forward_one_hop:1,reverse_one_hop:0.35,forward_two_hop:0.40,reverse_two_hop:0.14},
  source_rights:'REGISTERED_PUBLIC_METADATA_AND_TYPED_RELATIONS_ONLY',
  native_full_method_equivalence:'UNPROVEN'};
}

export function calculateDirectedWalkFalsification({meta,posts,relations}){
 validateNativeMaterials(meta,posts,relations);
 const days=[...new Set(posts.map(p=>p.public_date))].sort();
 assert(days.length===2,'HELD_DIRECTED_ONLY_KNOWN_TWO_DAY_SNAPSHOT');
 const prior=posts.filter(p=>p.public_date===days[0]),later=posts.filter(p=>p.public_date===days[1]);
 assert(prior.length>0&&later.length>0,'HELD_DIRECTED_EMPTY_TRAIN_OR_TARGET');
 const ids=new Set(prior.map(x=>x.source_id));
 const training=relations.filter(x=>ids.has(x.source_id));
 const synthetic=rewireTypedDestinations(training);
 const topology=calculateTopologyRewireChallenge({meta,posts,relations});
 assert(topology.synthetic_control.changed_endpoint_count===synthetic.changed_edge_count,
  'HELD_DIRECTED_SYNTHETIC_CONTROL_DRIFT');
 const perTarget=later.map(t=>{
  // Their title is known to the predictor. Labels and edges used ONLY here.
  const a=predictDirectedWalk({title:t.technical_header,trainingPosts:prior,trainingEdges:training});
  const b=predictDirectedWalk({title:t.technical_header,trainingPosts:prior,trainingEdges:synthetic.relations});
  const graphTruth=new Set(relations.filter(e=>e.source_id===t.source_id).map(e=>e.graph));
  const conceptTruth=new Set(t.declared_concepts);
  const graphChanged=serial(a.graph_families)!==serial(b.graph_families);
  const conceptChanged=serial(a.neighbor_concepts)!==serial(b.neighbor_concepts);
  return {source_id:t.source_id,as_of_day:t.public_date,
   disclosed_title_sha256:sha(t.technical_header),training_source_count:prior.length,
   original:{graph_families:a.graph_families,neighbor_concepts:a.neighbor_concepts,
    graph_hits:hits(a.graph_families,graphTruth),concept_hits:hits(a.neighbor_concepts,conceptTruth),
    matched_endpoint_count:a.matched_endpoint_count,active_two_hop_walk_count:a.active_two_hop_walk_count,
    score_signature_sha256:a.score_signature_sha256,source_witness_ids:a.source_witness_ids},
   counterfactual:{graph_families:b.graph_families,neighbor_concepts:b.neighbor_concepts,
    graph_hits:hits(b.graph_families,graphTruth),concept_hits:hits(b.neighbor_concepts,conceptTruth),
    matched_endpoint_count:b.matched_endpoint_count,active_two_hop_walk_count:b.active_two_hop_walk_count,
    score_signature_sha256:b.score_signature_sha256},
   graph_topk_changed:graphChanged,concept_topk_changed:conceptChanged,
   score_vector_changed:a.score_signature_sha256!==b.score_signature_sha256,
   original_abstained:a.state.startsWith('ABSTAIN'),
   target_labels_entered_training:false};
 });
 const graphOriginal=perTarget.reduce((n,r)=>n+r.original.graph_hits,0);
 const graphRewired=perTarget.reduce((n,r)=>n+r.counterfactual.graph_hits,0);
 const conceptOriginal=perTarget.reduce((n,r)=>n+r.original.concept_hits,0);
 const conceptRewired=perTarget.reduce((n,r)=>n+r.counterfactual.concept_hits,0);
 const control=topology.controls;
 const baseline=control.disclosed_title_with_original_edges;
 const frequency=control.withheld_title_frequency_prior_original;
 const beatsGraph=graphOriginal>baseline.graph_hits&&graphOriginal>frequency.graph_hits&&
  graphOriginal>graphRewired;
 const beatsConcept=conceptOriginal>baseline.concept_hits&&conceptOriginal>frequency.concept_hits&&
  conceptOriginal>conceptRewired;
 return {schema:'td613.wendbine.directed-walk-falsification/v1',
  state:'HELD_ENDPOINT_AWARE_METHOD_NOT_ESTABLISHED_BY_RETROSPECTIVE_ARCHIVE',
  experiment_class:'POST_HOC_EXPLORATORY_AND_TARGET_DISCLOSED_NO_INDEPENDENT_TEST',
  snapshot_id:meta.snapshot_id,coverage_state:meta.coverage.state,
  training_day:days[0],evaluation_day:days[1],
  target_count:later.length,training_source_count:prior.length,
  training_relation_count:training.length,
  original_historical_protocol_modified:false,
  original_compiler_source_modified:false,
  foreign_work_admitted_as_vixen_performer:false,
  selected_title_policy:'TARGET_TECHNICAL_HEADER_DISCLOSED',
  day_level_historical_capture_replay:false,
  comparison_design:{
   predictor:'FIXED_DIRECTED_TITLE_ANCHOR_ONE_AND_TWO_HOP_WALKS',
   comparison_graph_label_baseline:'DERIVED_C0_TITLE_DISCLOSED',
   comparison_frequency_null:'QUERY_BLIND_EARLIER_DAY_SOURCE_FREQUENCY',
   synthetic_negative_control:'WITHIN_SOURCE_GRAPH_EVIDENCE_CLASS_DEGREE_PRESERVING_DESTINATION_SWAP',
   matching_topk_budgets:{graph:3,concept:5},
   objective:'TEST_INCREMENTAL_ENDPOINT_TOPOLOGY_INFORMATION_NOT_METHOD_NAME',
   statistical_significance:'NOT_TESTED_N_EQUALS_12',
   candidate_source_ids_only:true,
   titles_disclosed_not_zero_prompt_reconstruction:true
  },
  diagnostics:{
   endpoint_sensitive_score_targets:perTarget.filter(r=>r.score_vector_changed).length,
   endpoint_sensitive_graph_topk_targets:perTarget.filter(r=>r.graph_topk_changed).length,
   endpoint_sensitive_concept_topk_targets:perTarget.filter(r=>r.concept_topk_changed).length,
   abstentions:perTarget.filter(r=>r.original_abstained).length,
   graph_original_hits:graphOriginal,graph_rewired_hits:graphRewired,
   concept_original_hits:conceptOriginal,concept_rewired_hits:conceptRewired,
   prior_label_graph_hits:baseline.graph_hits,prior_label_concept_hits:baseline.concept_hits,
   blind_frequency_graph_hits:frequency.graph_hits,blind_frequency_concept_hits:frequency.concept_hits,
   graph_outperforms_all_available_controls:beatsGraph,
   concept_outperforms_all_available_controls:beatsConcept,
   rewire_improves_graph_hits:graphRewired>graphOriginal,
   rewire_improves_concept_hits:conceptRewired>conceptOriginal,
   did_not_optimize_on_evaluation_labels_after_design:true
  },
  per_target:perTarget,
  decision_rule:'ANY_NULL_TIE_OR_WIN_PREVENTS_METHOD_SPECIFIC_SUPERIORITY;_POST_HOC_ADVANTAGE_STILL_REQUIRES_INDEPENDENT_REPLICATION',
  next_evidence:'PROSPECTIVE_INDEPENDENT_CAPTURE_WITH_PREDECLARED_DESIGN_AND_EXOGENOUS_CUSTODY_WITNESS',
  scientific_credit:0,causal_credit:0,independent_replication_credit:0,
  scientific_superiority:'UNESTABLISHED',human_closure_required:true};
}

export async function runNativeDirectedWalkFalsification(){
 const materials=await loadOriginalPublicFixture();
 return {...calculateDirectedWalkFalsification(materials),
  original_compiler_receipt:materials.compiler_receipt,
  custody:materials.digests,local_private_index_accessed:false,
  original_public_source_bytes_mutated:false,vixen_work_import_count:0};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  if(process.argv.length!==2)throw Error('HELD_DIRECTED_DIAGNOSTIC_ACCEPTS_NO_UNTRUSTED_FLAGS');
  process.stdout.write(JSON.stringify(await runNativeDirectedWalkFalsification())+'\n');
 }catch(e){process.stderr.write(JSON.stringify({state:'HELD',reason:String(e.message||e)})+'\n');process.exitCode=2}
}
