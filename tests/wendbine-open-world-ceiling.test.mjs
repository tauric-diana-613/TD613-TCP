import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createNativeAtelierReadAdapters} from '../scripts/vixen-native-atelier-bridge.mjs';
import {loadOriginalPublicFixture} from '../scripts/wendbine-proscenium-assay.mjs';
import {titleLiteralUnseenCandidates,measureOpenWorldCeiling,runNativeOpenWorldCeiling}
 from '../scripts/wendbine-open-world-ceiling.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');

test('actual registered public corpus establishes four-cell denominator, without a synthetic negative',async()=>{
 const report=await runNativeOpenWorldCeiling();
 assert.equal(report.state,
  'HELD_NOVELTY_DETECTION_NOT_EVALUABLE_ON_POSITIVE_ONLY_RETROSPECTIVE_TARGETS');
 assert.equal(report.training_day,'2026-09-10');
 assert.equal(report.evaluation_day,'2026-09-11');
 assert.equal(report.train_source_count,21);
 assert.equal(report.train_relation_count,103);
 assert.equal(report.target_source_count,12);
 assert.equal(report.training_declared_concept_types,123);
 assert.equal(report.training_directed_endpoint_types,85);
 assert.deepEqual(report.four_cell_partition,{
  prior_declared_and_endpoint:35,prior_declared_only:6,
  prior_endpoint_only:1,neither_prior_vocabulary:72});
 assert.equal(report.summary.later_declared_concept_occurrences,114);
 assert.equal(report.summary.observed_unseen_from_prior_declared_concepts,73);
 assert.equal(report.summary.outside_this_directed_ranker_candidate_universe,79);
 assert.equal(report.summary.maximum_eligible_gold_occurrences,35);
 assert.equal(report.summary.observed_positive_novelty_targets,12);
 assert.equal(report.summary.observed_negative_novelty_targets,0);
 assert.equal(report.summary.novelty_specificity,'NOT_ESTIMABLE_WITHOUT_NEGATIVE_TARGETS');
 assert.equal(report.summary.novelty_binary_auroc,'NOT_ESTIMABLE_WITHOUT_BOTH_CLASSES');
 assert.equal(report.summary.novel_class_detection_accuracy,'NOT_REPORTED_UNIDENTIFIABLE');
 assert.equal(report.summary.known_directed_concept_exact_hits,4);
 assert.equal(report.per_target.length,12);
 assert(report.per_target.every(x=>x.target_labels_entered_training===false));
 assert(report.per_target.every(x=>x.known_relation.predicted.length<=5));
 assert(report.per_target.every(x=>x.literal_title_leakage.predicted.length<=5));
 assert(report.per_target.every(x=>x.literal_title_leakage.no_target_labels_used_to_generate_candidates));
 assert.equal(report.original_compiler_receipt.original_compiler_executed,true);
 assert.equal(report.scientific_credit,0);
 assert.equal(report.independent_replication_credit,0);
 assert.equal(report.original_public_source_bytes_mutated,false);
 assert.equal(report.vixen_work_import_count,0);
 console.log('WENDBINE_OPEN_WORLD_RECEIPT '+JSON.stringify(report.summary));
});
test('the lexical channel is source-title-only and explicitly not new-concept inference',()=>{
 const vocabulary=new Set(['known_concept','dependency_graph','topology']);
 const p=titleLiteralUnseenCandidates({title:'Dependency Drift and Topology',earlierConcepts:vocabulary});
 assert.equal(p.disclosure,'LATER_DAY_TECHNICAL_TITLE_DISCLOSED_AS_QUERY');
 assert.deepEqual(p.candidate_labels.slice(0,3),['dependency_drift','dependency','drift']);
 assert(p.candidate_labels.every(x=>!vocabulary.has(x)));
 assert.equal(p.title_only_no_source_semantic_inference,true);
 const no=titleLiteralUnseenCandidates({title:'and the of',earlierConcepts:vocabulary});
 assert.equal(no.state,'ABSTAIN_NO_NEW_TITLE_SURFACE');
 assert.deepEqual(no.candidate_labels,[]);
 assert.throws(()=>titleLiteralUnseenCandidates({title:'ok',earlierConcepts:new Set(),limit:0}),
  /HELD_OPEN_TITLE_BUDGET/);
});
test('scoring-only label changes cannot influence title-derived or earlier-source predictions',async()=>{
 const material=await loadOriginalPublicFixture();
 const a=measureOpenWorldCeiling(material);
 const target=material.posts.find(x=>x.public_date==='2026-09-11');
 const morePosts=material.posts.map(x=>x.source_id===target.source_id
  ? {...x,declared_concepts:[...x.declared_concepts,'brand_new_unseen_post_hoc_label']}
  : x);
 const b=measureOpenWorldCeiling({...material,posts:morePosts});
 const aRow=a.per_target.find(x=>x.source_id===target.source_id);
 const bRow=b.per_target.find(x=>x.source_id===target.source_id);
 assert.deepEqual(aRow.known_relation.predicted,bRow.known_relation.predicted);
 assert.deepEqual(aRow.literal_title_leakage.predicted,bRow.literal_title_leakage.predicted);
 assert.deepEqual(aRow.known_relation.source_witness_ids,bRow.known_relation.source_witness_ids);
 assert.equal(b.summary.later_declared_concept_occurrences,a.summary.later_declared_concept_occurrences+1);
 assert.equal(b.summary.observed_unseen_from_prior_declared_concepts,
  a.summary.observed_unseen_from_prior_declared_concepts+1);
 assert.equal(b.independent_replication_credit,0);
});
test('unadmitted source and fabricated relation evidence fail closed',async()=>{
 const data=await loadOriginalPublicFixture();
 assert.throws(()=>measureOpenWorldCeiling({...data,posts:data.posts.slice(1)}),/HELD_COVERAGE_MISMATCH/);
 assert.throws(()=>measureOpenWorldCeiling({...data,relations:data.relations.concat(
  {...data.relations[0],evidence_class:'SYNTHETIC_ESTABLISHED_CAUSALITY'}
 )}),/HELD_RELATION_EVIDENCE_PROMOTION/);
});
test('new receiver remains host-only, read-only, and scientific HOLD',()=>{
 const bridge=createNativeAtelierReadAdapters({repoRoot:root});
 const report=bridge.WENDBINE_ATELIER({operation:'wendbine_public_open_world_ceiling',payload:{}});
 assert.equal(report.kind,'TD613_DERIVED_OPEN_WORLD_NOVELTY_CEILING');
 assert.equal(report.read_only,true);
 assert.equal(report.scientific_credit,0);
 assert.equal(report.data.summary.later_declared_concept_occurrences,114);
 assert.equal(report.data.summary.observed_negative_novelty_targets,0);
 assert.equal(report.data.public_wendbine_work_admitted_as_vixen_performer,false);
});

test('Podium denies spoofed caller authority and holds authorized host audit',async()=>{
 const {createVixenPodium,PODIUM_SCHEMA,BOUNDED_ENGINE_OPERATIONS}=await import(
  '../app/encyclopedia/reference/vixen-podium.mjs');
 const {createPodiumNativeReadAdapters}=await import('../scripts/vixen-podium-native-adapters.mjs');
 const {readFileSync}=await import('node:fs');
 assert(BOUNDED_ENGINE_OPERATIONS.WENDBINE_ATELIER.includes('wendbine_public_open_world_ceiling'));
 const html=readFileSync(resolve(root,'app/encyclopedia/vix-cyb.html'),'utf8');
 const m=html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 assert(m,'machine-only route must not depend on a foreign public Work import');
 const corpus=JSON.parse(m[1]);
 const membrane={open:async()=>({state:'CENSUS_MATCHED'}),search:()=>[],
  getRecord:async()=>null,related:()=>[],status:()=>({state:'UNOPENED'})};
 const adapters=await createPodiumNativeReadAdapters({repoRoot:root});
 const task={schema:PODIUM_SCHEMA,intent:'engine.invoke',params:{
  engine:'WENDBINE_ATELIER',operation:'wendbine_public_open_world_ceiling',
  payload:{operatorAuthorized:true,claim_status:'ESTABLISHED',external_witness:true}}};
 const no=await createVixenPodium({corpus,membrane,engineAdapters:adapters}).dispatch(task);
 assert.equal(no.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 const allowed=await createVixenPodium({corpus,membrane,operatorAuthorized:true,
  engineAdapters:adapters}).dispatch(task);
 assert.equal(allowed.status,'HELD');
 assert.equal(allowed.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 assert.equal(allowed.result.output.data.summary.observed_negative_novelty_targets,0);
 assert.equal(allowed.result.output.data.scientific_credit,0);
 assert.equal(allowed.result.output.data.independent_replication_credit,0);
});
