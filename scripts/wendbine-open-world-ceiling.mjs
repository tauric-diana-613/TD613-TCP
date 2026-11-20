#!/usr/bin/env node
/**
 * Bounded TD613-derived open-world diagnostic for the fixed Wendbine public
 * registry. Historical labels are scored post hoc; original Work remains
 * immutable. No future title is treated as an exogenous target witness.
 */
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {loadOriginalPublicFixture,validateNativeMaterials} from './wendbine-proscenium-assay.mjs';
import {predictDirectedWalk} from './wendbine-directed-walk-falsification.mjs';

const assert=(yes,code)=>{if(!yes)throw Error(code)};
const sha=x=>createHash('sha256').update(x).digest('hex');
const SKIP=new Set([
 'and','the','with','from','into','for','across','versus','between','against',
 'in','of','on','to','a','an','at','or','through','via','under','over','as',
 'versus','versus','by','without'
]);
const hits=(a,b)=>a.filter(x=>b.has(x)).length;
const sorted=xs=>[...xs].sort((a,b)=>a.localeCompare(b,'en'));

/**
 * EXPLICIT TITLE-LEAKAGE BASELINE ONLY. These surface strings are built from
 * a disclosed later-day title. They are not predictions of undisclosed content
 * and their overlap with labels is not evidence of genuine novelty discovery.
 * No later-day concept/edge label may be supplied to this function.
 */
export function titleLiteralUnseenCandidates({title,earlierConcepts,limit=5}){
 assert(typeof title==='string'&&title.length>0&&title.length<=250,'HELD_OPEN_TITLE_INVALID');
 assert(earlierConcepts instanceof Set,'HELD_OPEN_PRIOR_VOCAB_REQUIRED');
 assert(Number.isInteger(limit)&&limit>=1&&limit<=10,'HELD_OPEN_TITLE_BUDGET');
 const raw=(title.toLowerCase().match(/[a-z][a-z0-9]*/g)||[]);
 const segments=[]; let segment=[];
 for(const word of raw){
  if(SKIP.has(word)){
   if(segment.length)segments.push(segment);
   segment=[];
  }else segment.push(word);
 }
 if(segment.length)segments.push(segment);
 // Longest exact title fragments first; source-position order breaks ties.
 const choices=[];
 for(let length=3;length>=1;length--){
  for(const terms of segments){
   for(let start=0;start+length<=terms.length;start++){
    const label=terms.slice(start,start+length).join('_');
    if(!earlierConcepts.has(label)&&!choices.includes(label))choices.push(label);
   }
  }
 }
 return {state:choices.length?'TITLE_LEXICAL_NOVEL_CANDIDATES':'ABSTAIN_NO_NEW_TITLE_SURFACE',
  title_only_no_source_semantic_inference:true,
  disclosure:'LATER_DAY_TECHNICAL_TITLE_DISCLOSED_AS_QUERY',
  candidate_labels:choices.slice(0,limit),
  budget:limit,
  generation:'LITERAL_CONTIGUOUS_NGRAM_3_TO_1_STOPWORDS_SPLIT',
  evidence_credit:0};
}

/**
 * Make the class-contingency explicit. The only scientific-independent
 * classifier would require a separate acquisition with BOTH positive and
 * negative target witnesses. Self-declared provenance cannot supply them.
 */
export function measureOpenWorldCeiling({meta,posts,relations}){
 validateNativeMaterials(meta,posts,relations);
 const days=sorted(new Set(posts.map(p=>p.public_date)));
 assert(days.length===2,'HELD_OPEN_ONLY_TWO_DAY_RETROSPECTIVE_SNAPSHOT');
 const prior=posts.filter(p=>p.public_date===days[0]);
 const later=posts.filter(p=>p.public_date===days[1]);
 assert(prior.length&&later.length,'HELD_OPEN_EMPTY_PRIOR_OR_LATER');
 const priorIDs=new Set(prior.map(p=>p.source_id));
 const earlierEdges=relations.filter(e=>priorIDs.has(e.source_id));
 const priorConcepts=new Set(prior.flatMap(p=>p.declared_concepts));
 const priorNodes=new Set(earlierEdges.flatMap(e=>[e.from,e.to]));
 const perTarget=later.map((t,i)=>{
  const labels=new Set(t.declared_concepts);
  const partition={prior_declared_and_endpoint:[],prior_declared_only:[],
   prior_endpoint_only:[],neither_prior_vocabulary:[]};
  for(const label of labels){
   const v=priorConcepts.has(label),e=priorNodes.has(label);
   partition[v?(e?'prior_declared_and_endpoint':'prior_declared_only'):
    (e?'prior_endpoint_only':'neither_prior_vocabulary')].push(label);
  }
  const novel=new Set([...labels].filter(x=>!priorConcepts.has(x)));
  // This is a *known-vocabulary* directed walk, not an open-vocabulary model.
  const known=predictDirectedWalk({title:t.technical_header,trainingPosts:prior,trainingEdges:earlierEdges});
  assert(known.neighbor_concepts.every(x=>priorConcepts.has(x)&&priorNodes.has(x)),
   'HELD_OPEN_KNOWN_PREDICTOR_VOCAB_DRIFT');
  const lexical=titleLiteralUnseenCandidates({title:t.technical_header,earlierConcepts:priorConcepts});
  // Permute disclosed titles as a synthetic lexical-dependence null; not a
  // real source, training sample, or evidence of an independently timed target.
  const neighborTitle=later[(i+1)%later.length].technical_header;
  const rotated=titleLiteralUnseenCandidates({title:neighborTitle,earlierConcepts:priorConcepts});
  const knownGold=new Set([...labels].filter(x=>priorConcepts.has(x)&&priorNodes.has(x)));
  return {
   source_id:t.source_id,public_day:t.public_date,
   technical_title_digest_sha256:sha(t.technical_header),
   class_partition:Object.fromEntries(Object.entries(partition).map(([key,value])=>[key,value.length])),
   target_declared_concept_count:labels.size,
   observed_vocabulary_novelty_count:novel.size,
   // This truth observation is only available on the retired retrospective set.
   observed_any_novel_label:novel.size>0,
   known_relation:{candidate_budget:5,predicted:known.neighbor_concepts,
    eligible_gold_count:knownGold.size,
    exact_hits:hits(known.neighbor_concepts,knownGold),
    source_witness_ids:known.source_witness_ids,
    model_abstained:known.state.startsWith('ABSTAIN')},
   literal_title_leakage:{
    predicted:lexical.candidate_labels,
    exact_novel_gold_hits:hits(lexical.candidate_labels,novel),
    proposed_count:lexical.candidate_labels.length,
    synthetic_title_rotated_hits:hits(rotated.candidate_labels,novel),
    inference_class:'DISCLOSED_TITLE_STRING_BASELINE_NOT_NOVELTY_DISCOVERY',
    no_target_labels_used_to_generate_candidates:true
   },
   target_labels_entered_training:false,
   independent_prospective_target:false};
 });
 const aggregate={prior_declared_and_endpoint:0,prior_declared_only:0,
  prior_endpoint_only:0,neither_prior_vocabulary:0};
 for(const row of perTarget){
  for(const key of Object.keys(aggregate))aggregate[key]+=row.class_partition[key];
 }
 const novel=aggregate.prior_endpoint_only+aggregate.neither_prior_vocabulary;
 const unreachable=aggregate.prior_declared_only+novel;
 const total=perTarget.reduce((n,t)=>n+t.target_declared_concept_count,0);
 const positive=perTarget.filter(t=>t.observed_any_novel_label).length;
 const negative=later.length-positive;
 assert(Object.values(aggregate).reduce((n,x)=>n+x,0)===total,'HELD_OPEN_PARTITION_ACCOUNTING');
 assert(novel+aggregate.prior_declared_only+aggregate.prior_declared_and_endpoint===total,
  'HELD_OPEN_UNREACHABLE_ACCOUNTING');
 const knownHits=perTarget.reduce((n,t)=>n+t.known_relation.exact_hits,0);
 const titleHits=perTarget.reduce((n,t)=>n+t.literal_title_leakage.exact_novel_gold_hits,0);
 const rotatedHits=perTarget.reduce((n,t)=>n+t.literal_title_leakage.synthetic_title_rotated_hits,0);
 const titleProposals=perTarget.reduce((n,t)=>n+t.literal_title_leakage.proposed_count,0);
 return {
  schema:'td613.wendbine.open-world-ceiling/v1',
  state:'HELD_NOVELTY_DETECTION_NOT_EVALUABLE_ON_POSITIVE_ONLY_RETROSPECTIVE_TARGETS',
  analysis_class:'EXPLORATORY_RETIRED_TARGET_LABELS_POST_HOC_NOT_PROSPECTIVE',
  source_snapshot_id:meta.snapshot_id,
  source_coverage_state:meta.coverage.state,
  training_day:days[0],evaluation_day:days[1],
  train_source_count:prior.length,train_relation_count:earlierEdges.length,
  target_source_count:later.length,
  training_declared_concept_types:priorConcepts.size,
  training_directed_endpoint_types:priorNodes.size,
  title_policy:'DISCLOSED_LATER_DAY_TECHNICAL_HEADERS',
  candidate_universe:'REGISTERED_PRIOR_CONCEPTS_INTERSECT_PRIOR_DIRECTED_ENDPOINTS',
  four_cell_partition:aggregate,
  summary:{
   later_declared_concept_occurrences:total,
   observed_unseen_from_prior_declared_concepts:novel,
   outside_this_directed_ranker_candidate_universe:unreachable,
   maximum_eligible_gold_occurrences:aggregate.prior_declared_and_endpoint,
   observed_positive_novelty_targets:positive,
   observed_negative_novelty_targets:negative,
   novelty_specificity:'NOT_ESTIMABLE_WITHOUT_NEGATIVE_TARGETS',
   novelty_binary_auroc:'NOT_ESTIMABLE_WITHOUT_BOTH_CLASSES',
   novel_class_detection_accuracy:'NOT_REPORTED_UNIDENTIFIABLE',
   known_directed_concept_exact_hits:knownHits,
   title_only_novel_literal_exact_hits:titleHits,
   title_only_novel_literal_proposals:titleProposals,
   synthetic_rotated_title_exact_hits:rotatedHits,
   title_vs_synthetic_delta_is_not_proof_of_semantic_discovery:true,
   closed_vocabulary_ceiling_is_upper_bound_not_achieved_recall:true,
   title_overlap_is_disclosure_not_exogenous_prediction:true
  },
  per_target:perTarget,
  strict_prohibition:'DO_NOT_OPTIMIZE_THRESHOLDS_ON_RETIRED_TWELVE_OR_MINT_SYNTHETIC_NEGATIVES_AS_REAL',
  prospective_design_unset:[
   'INDEPENDENT_EXTERNAL_CUSTODY_WITNESS',
   'NEW_SOURCE_SAMPLE_AND_PRETARGET_CUTOFF',
   'BOTH_PREDEFINED_KNOWN_ONLY_AND_NOVEL_CONCEPT_CASES',
   'BLINDED_HUMAN_CONCEPT_ANNOTATION',
   'FROZEN_PRIMARY_METRIC_AND_ABSTENTION_POLICY',
   'PREDECLARED_STOPPING_RULE_AND_EXCLUSION_POLICY'
  ],
  originality_attribution:'NONE',
  original_historical_protocol_changed:false,
  public_wendbine_work_admitted_as_vixen_performer:false,
  historical_capture_replay_credit:0,independent_replication_credit:0,
  scientific_credit:0,human_closure_required:true
 };
}

export async function runNativeOpenWorldCeiling(){
 const native=await loadOriginalPublicFixture();
 return {...measureOpenWorldCeiling(native),custody:native.digests,
  original_compiler_receipt:native.compiler_receipt,
  original_public_source_bytes_mutated:false,
  local_private_index_accessed:false,vixen_work_import_count:0};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  assert(process.argv.length===2,'HELD_OPEN_WORLD_NO_UNTRUSTED_CLI_ARGS');
  process.stdout.write(JSON.stringify(await runNativeOpenWorldCeiling())+'\n');
 }catch(error){
  process.stderr.write(JSON.stringify({state:'HELD',reason:String(error?.message||error)})+'\n');
  process.exitCode=2;
 }
}
