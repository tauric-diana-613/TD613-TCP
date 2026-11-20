import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,realpathSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {calculateFrequencyNullChallenge,runNativeFrequencyNullChallenge}
 from '../scripts/wendbine-frequency-null-challenge.mjs';
import {loadOriginalPublicFixture} from '../scripts/wendbine-proscenium-assay.mjs';
import {createNativeAtelierReadAdapters} from '../scripts/vixen-native-atelier-bridge.mjs';
import {createVixenPodium,PODIUM_SCHEMA,BOUNDED_ENGINE_OPERATIONS}
 from '../app/encyclopedia/reference/vixen-podium.mjs';
import {createPodiumNativeReadAdapters} from '../scripts/vixen-podium-native-adapters.mjs';

const repo=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),'..'));

test('actual 33-post public snapshot reveals null-equivalence instead of unearned methodology promotion',async()=>{
 const receipt=await runNativeFrequencyNullChallenge();
 assert.equal(receipt.aggregate.targets,12);
 assert.equal(receipt.aggregate.baseline_graph_hits,13);
 assert.equal(receipt.aggregate.permuted_graph_hits,13);
 assert.equal(receipt.aggregate.frequency_graph_hits,5);
 assert.equal(receipt.aggregate.baseline_concept_hits,15);
 assert.equal(receipt.aggregate.frequency_concept_hits,15);
 assert.equal(receipt.claims.graph_family_outperforms_frequency_in_archive,true);
 assert.equal(receipt.claims.graph_family_outperforms_permuted_concepts_in_archive,false);
 assert.equal(receipt.claims.concept_matching_outperforms_frequency_in_archive,false);
 assert.equal(receipt.state,'HELD_NONTRIVIAL_METHOD_ADVANTAGE_NOT_DISTINGUISHED_FROM_ALL_NULLS');
 assert.equal(receipt.experiment_class,'RETROSPECTIVE_POST_HOC_DIAGNOSTIC_NOT_PREREGISTERED');
 assert.equal(receipt.original_historical_protocol_modified,false);
 assert.equal(receipt.independent_replication_credit,0);
 assert.equal(receipt.scientific_credit,0);
 assert.equal(receipt.local_private_index_accessed,false);
 assert.equal(receipt.vixen_work_import_count,0);
 assert.equal(receipt.original_compiler_receipt.original_compiler_executed,true);
 assert.ok(receipt.targets.every(x=>x.earlier_source_count===21));
 assert.ok(receipt.targets.every(x=>x.controls.prediction_budget.graph_families===3));
 assert.ok(receipt.targets.every(x=>x.controls.prediction_budget.concept_labels===5));
});
test('null-control diagnostic refuses tampered or inadmissible public source registry',async()=>{
 const m=await loadOriginalPublicFixture();
 assert.throws(()=>calculateFrequencyNullChallenge({
  meta:m.meta,posts:m.posts.slice(1),relations:m.relations
 }),/HELD_COVERAGE_MISMATCH/);
 assert.throws(()=>calculateFrequencyNullChallenge({
  meta:m.meta,posts:m.posts,relations:[
   ...m.relations,{...m.relations[0],evidence_class:'SYNTHETIC_AUTHOR_INTENT_PROVEN'}
  ]
 }),/HELD_RELATION_EVIDENCE_PROMOTION/);
});
test('native host connector executes frequency null without operator UI attribution or source mutation',async()=>{
 const native=createNativeAtelierReadAdapters({repoRoot:repo});
 const r=native.WENDBINE_ATELIER({operation:'wendbine_public_frequency_null',payload:{}});
 assert.equal(r.kind,'TD613_DERIVED_PUBLIC_FREQUENCY_NULL');
 assert.equal(r.read_only,true);
 assert.equal(r.scientific_credit,0);
 assert.equal(r.data.aggregate.targets,12);
 assert.equal(r.data.state,'HELD_NONTRIVIAL_METHOD_ADVANTAGE_NOT_DISTINGUISHED_FROM_ALL_NULLS');
 assert.equal(r.data.custody.original_compiler.sha256,r.data.original_compiler_receipt.original_compiler_digest);
});
test('Podium host operator gate blocks unauthorized call and retains scientific hold',async()=>{
 assert.ok(BOUNDED_ENGINE_OPERATIONS.WENDBINE_ATELIER.includes('wendbine_public_frequency_null'));
 const html=readFileSync(resolve(repo,'app/encyclopedia/vix-cyb.html'),'utf8');
 const corpus=JSON.parse(html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
 const membrane={open:async()=>({state:'CENSUS_MATCHED'}),search:()=>[],getRecord:async()=>null,
  related:()=>[],status:()=>({state:'UNOPENED'})};
 const adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 const task={schema:PODIUM_SCHEMA,intent:'engine.invoke',params:{
  engine:'WENDBINE_ATELIER',operation:'wendbine_public_frequency_null',payload:{}}};
 const blocked=await createVixenPodium({corpus,membrane,engineAdapters:adapters}).dispatch(task);
 assert.equal(blocked.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 const allowed=await createVixenPodium({corpus,membrane,operatorAuthorized:true,
  engineAdapters:adapters}).dispatch(task);
 assert.equal(allowed.status,'HELD');
 assert.equal(allowed.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 assert.equal(allowed.result.output.data.scientific_credit,0);
 assert.equal(allowed.result.output.data.aggregate.frequency_concept_hits,15);
 assert.equal(allowed.result.output.data.claims.concept_matching_outperforms_frequency_in_archive,false);
});
