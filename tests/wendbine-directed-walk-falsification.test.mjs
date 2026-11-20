import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,realpathSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {predictDirectedWalk,calculateDirectedWalkFalsification,runNativeDirectedWalkFalsification}
 from '../scripts/wendbine-directed-walk-falsification.mjs';
import {loadOriginalPublicFixture} from '../scripts/wendbine-proscenium-assay.mjs';
import {createNativeAtelierReadAdapters} from '../scripts/vixen-native-atelier-bridge.mjs';
import {createPodiumNativeReadAdapters} from '../scripts/vixen-podium-native-adapters.mjs';
import {createVixenPodium,PODIUM_SCHEMA,BOUNDED_ENGINE_OPERATIONS}
 from '../app/encyclopedia/reference/vixen-podium.mjs';

const repo=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
test('actual publicly registered 33-post source trial executes original compiler and reports every target',async()=>{
 const r=await runNativeDirectedWalkFalsification();
 assert.equal(r.state,'HELD_ENDPOINT_AWARE_METHOD_NOT_ESTABLISHED_BY_RETROSPECTIVE_ARCHIVE');
 assert.equal(r.experiment_class,'POST_HOC_EXPLORATORY_AND_TARGET_DISCLOSED_NO_INDEPENDENT_TEST');
 assert.equal(r.training_day,'2026-09-10');
 assert.equal(r.evaluation_day,'2026-09-11');
 assert.equal(r.training_source_count,21);
 assert.equal(r.training_relation_count,103);
 assert.equal(r.target_count,12);
 assert.equal(r.per_target.length,12);
 assert.equal(r.diagnostics.prior_label_graph_hits,13);
 assert.equal(r.diagnostics.prior_label_concept_hits,15);
 assert.equal(r.diagnostics.blind_frequency_graph_hits,5);
 assert.equal(r.diagnostics.blind_frequency_concept_hits,15);
 assert.ok(r.diagnostics.endpoint_sensitive_score_targets>0,'directed endpoint replacement must change scores');
 assert.ok(r.per_target.every(t=>t.training_source_count===21&&t.target_labels_entered_training===false));
 assert.ok(r.per_target.every(t=>t.original.graph_families.length<=3&&t.original.neighbor_concepts.length<=5));
 assert.ok(r.per_target.every(t=>t.original.source_witness_ids.every(id=>id.startsWith('reddit:t3_'))));
 assert.equal(r.diagnostics.historical_labels_seen_during_exploratory_design,true);
 assert.equal(r.diagnostics.independent_preregistration_credit,0);
 assert.equal(r.scientific_credit,0);
 assert.equal(r.independent_replication_credit,0);
 assert.equal(r.original_compiler_receipt.original_compiler_executed,true);
 assert.equal(r.original_historical_protocol_modified,false);
 assert.equal(r.original_public_source_bytes_mutated,false);
 assert.equal(r.vixen_work_import_count,0);
 // Observable negative-control outcome is the datum, not a win-conditioned test.
 console.log('DIRECTED_WALK_RECEIPT '+JSON.stringify(r.diagnostics));
});
test('relational orientation actually changes output under a source-preserving endpoint swap',()=>{
 const posts=[{source_id:'reddit:t3_1wcotjy',declared_concepts:['seed_node','first_target','second_target']}];
 const e=[
  {source_id:posts[0].source_id,graph:'G_D',evidence_class:'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
   from:'seed_node',relation:'LINKS',to:'first_target'},
  {source_id:posts[0].source_id,graph:'G_D',evidence_class:'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
   from:'other_node',relation:'LINKS',to:'second_target'}
 ];
 const first=predictDirectedWalk({title:'Seed node',trainingPosts:posts,trainingEdges:e});
 const second=predictDirectedWalk({title:'Seed node',trainingPosts:posts,trainingEdges:[
  {...e[0],to:'second_target'},{...e[1],to:'first_target'}
 ]});
 assert.notDeepEqual(first.neighbor_concepts,second.neighbor_concepts);
 assert.equal(first.graph_families.length,1);
 assert.equal(second.graph_families.length,1);
 assert.notEqual(first.score_signature_sha256,second.score_signature_sha256);
});
test('invalid source membership and forged evidence class fail before evaluating labels',async()=>{
 const materials=await loadOriginalPublicFixture();
 assert.throws(()=>calculateDirectedWalkFalsification({
  meta:materials.meta,posts:materials.posts.slice(1),relations:materials.relations
 }),/HELD_COVERAGE_MISMATCH/);
 assert.throws(()=>calculateDirectedWalkFalsification({
  meta:materials.meta,posts:materials.posts,relations:materials.relations.concat({
   ...materials.relations[0],evidence_class:'SYNTHETIC_PROVEN_AUTHOR_INTENT'
  })
 }),/HELD_RELATION_EVIDENCE_PROMOTION/);
});
test('native operator route stays host-only and source-role protected',()=>{
 const adapters=createNativeAtelierReadAdapters({repoRoot:repo});
 const r=adapters.WENDBINE_ATELIER({operation:'wendbine_public_directed_walk',payload:{}});
 assert.equal(r.kind,'TD613_DERIVED_DIRECTED_WALK_FALSIFICATION');
 assert.equal(r.read_only,true);
 assert.equal(r.scientific_credit,0);
 assert.equal(r.data.target_count,12);
 assert.equal(r.data.foreign_work_admitted_as_vixen_performer,false);
});
test('Podium rejects external authority spoofing then holds permitted native comparator result',async()=>{
 assert(BOUNDED_ENGINE_OPERATIONS.WENDBINE_ATELIER.includes('wendbine_public_directed_walk'));
 const html=readFileSync(resolve(repo,'app/encyclopedia/vix-cyb.html'),'utf8');
 const corpus=JSON.parse(html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
 const membrane={open:async()=>({state:'CENSUS_MATCHED'}),search:()=>[],getRecord:async()=>null,
  related:()=>[],status:()=>({state:'UNOPENED'})};
 const adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 const task={schema:PODIUM_SCHEMA,intent:'engine.invoke',
  params:{engine:'WENDBINE_ATELIER',operation:'wendbine_public_directed_walk',payload:{}}};
 const rejected=await createVixenPodium({corpus,membrane,engineAdapters:adapters}).dispatch(task);
 assert.equal(rejected.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 const allowed=await createVixenPodium({corpus,membrane,operatorAuthorized:true,engineAdapters:adapters}).dispatch(task);
 assert.equal(allowed.status,'HELD');
 assert.equal(allowed.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 assert.equal(allowed.result.output.data.independent_replication_credit,0);
 assert.equal(allowed.result.output.data.scientific_superiority,'UNESTABLISHED');
});
