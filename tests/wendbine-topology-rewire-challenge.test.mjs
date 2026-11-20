import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,realpathSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {calculateTopologyRewireChallenge,rewireTypedDestinations,runNativeTopologyRewireChallenge}
 from '../scripts/wendbine-topology-rewire-challenge.mjs';
import {loadOriginalPublicFixture} from '../scripts/wendbine-proscenium-assay.mjs';
import {createNativeAtelierReadAdapters} from '../scripts/vixen-native-atelier-bridge.mjs';
import {createPodiumNativeReadAdapters} from '../scripts/vixen-podium-native-adapters.mjs';
import {createVixenPodium,PODIUM_SCHEMA,BOUNDED_ENGINE_OPERATIONS}
 from '../app/encyclopedia/reference/vixen-podium.mjs';

const repo=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),'..'));

test('real source-bound control changes directed paths while original C0 remains invariant',async()=>{
 const r=await runNativeTopologyRewireChallenge();
 assert.equal(r.state,'HELD_NO_TOPOLOGY_SPECIFIC_PREDICTIVE_CONTRIBUTION_DEMONSTRATED');
 assert.equal(r.target_count,12);
 assert.equal(r.training_day,'2026-09-10');
 assert.equal(r.target_day,'2026-09-11');
 assert.equal(r.synthetic_control.original_training_edge_count,103);
 assert.equal(r.synthetic_control.changed_source_graph_groups,10);
 assert.equal(r.synthetic_control.changed_endpoint_count,20);
 assert.equal(r.synthetic_control.original_two_hop_identities,44);
 assert.equal(r.synthetic_control.rewired_two_hop_identities,44);
 assert.equal(r.synthetic_control.two_hop_identities_removed,12);
 assert.equal(r.synthetic_control.two_hop_identities_created,12);
 assert.notEqual(r.synthetic_control.original_training_digest,r.synthetic_control.synthetic_training_digest);
 assert.equal(r.model_sensitivity.invariant_target_count,12);
 assert.equal(r.model_sensitivity.changed_target_count,0);
 assert.deepEqual(r.controls.disclosed_title_with_original_edges,{graph_hits:13,concept_hits:15});
 assert.deepEqual(r.controls.disclosed_title_with_rewired_edges,{graph_hits:13,concept_hits:15});
 assert.deepEqual(r.controls.withheld_title_frequency_prior_original,{graph_hits:5,concept_hits:15});
 assert.deepEqual(r.controls.withheld_title_frequency_prior_rewired,{graph_hits:5,concept_hits:15});
 assert.equal(r.original_historical_protocol_modified,false);
 assert.equal(r.original_source_estate_mutated,false);
 assert.equal(r.original_compiler_receipt.original_compiler_executed,true);
 assert.equal(r.independent_replication_credit,0);
 assert.equal(r.scientific_credit,0);
 assert.equal(r.vixen_work_import_count,0);
 assert.equal(r.per_target.every(x=>x.prediction_invariant_under_degree_preserving_rewire),true);
});
test('synthetic edge operation preserves directional degree while changing topology',()=>{
 const e=[
  {source_id:'reddit:t3_1wcotjy',graph:'G_D',from:'alpha',relation:'LINKS',to:'gamma',
   evidence_class:'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE'},
  {source_id:'reddit:t3_1wcotjy',graph:'G_D',from:'beta',relation:'LINKS',to:'delta',
   evidence_class:'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE'}];
 const original=JSON.stringify(e),swapped=rewireTypedDestinations(e);
 assert.equal(swapped.changed_edge_count,2);
 assert.equal(swapped.relations[0].to,'delta');
 assert.equal(swapped.relations[1].to,'gamma');
 assert.equal(JSON.stringify(e),original);
 assert.equal(swapped.alterations[0].alteration,'SWAP_DESTINATION_ENDPOINTS_SYNTHETIC');
});
test('no topology mutations possible or corrupted source admission should fail closed',async()=>{
 assert.throws(()=>rewireTypedDestinations([
  {source_id:'source',graph:'G_D',from:'a',to:'b',relation:'LINKS',evidence_class:'CLASS'}
 ]),/HELD_NO_ADMISSIBLE_TOPOLOGY_REWIRE/);
 const m=await loadOriginalPublicFixture();
 assert.throws(()=>calculateTopologyRewireChallenge({
  meta:m.meta,posts:m.posts.slice(1),relations:m.relations
 }),/HELD_COVERAGE_MISMATCH/);
 assert.throws(()=>calculateTopologyRewireChallenge({
  meta:m.meta,posts:m.posts,relations:m.relations.concat({
   ...m.relations[0],graph:'UNADMITTED_GRAPH_FAMILY'
  })
 }),/HELD_UNREGISTERED_GRAPH_FAMILY/);
});
test('host adapter executes exact read-only source-control operation without role promotion',()=>{
 const native=createNativeAtelierReadAdapters({repoRoot:repo});
 const reply=native.WENDBINE_ATELIER({operation:'wendbine_public_topology_rewire',payload:{}});
 assert.equal(reply.kind,'TD613_DERIVED_TOPOLOGY_REWIRE_NEGATIVE_CONTROL');
 assert.equal(reply.read_only,true);
 assert.equal(reply.scientific_credit,0);
 assert.equal(reply.data.target_count,12);
 assert.equal(reply.data.model_sensitivity.changed_target_count,0);
 assert.equal(reply.data.original_compiler_receipt.original_compiler_executed,true);
});
test('Podium requires operator host authority and holds topology-specific claims',async()=>{
 assert.ok(BOUNDED_ENGINE_OPERATIONS.WENDBINE_ATELIER.includes('wendbine_public_topology_rewire'));
 const html=readFileSync(resolve(repo,'app/encyclopedia/vix-cyb.html'),'utf8');
 const corpus=JSON.parse(html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
 const membrane={open:async()=>({state:'CENSUS_MATCHED'}),search:()=>[],getRecord:async()=>null,
  related:()=>[],status:()=>({state:'UNOPENED'})};
 const adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 const task={schema:PODIUM_SCHEMA,intent:'engine.invoke',params:{
  engine:'WENDBINE_ATELIER',operation:'wendbine_public_topology_rewire',payload:{}}};
 const blocked=await createVixenPodium({corpus,membrane,engineAdapters:adapters}).dispatch(task);
 assert.equal(blocked.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 const approved=await createVixenPodium({corpus,membrane,operatorAuthorized:true,
  engineAdapters:adapters}).dispatch(task);
 assert.equal(approved.status,'HELD');
 assert.equal(approved.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 assert.equal(approved.result.output.data.scientific_credit,0);
 assert.equal(approved.result.output.data.model_sensitivity.invariant_target_count,12);
});
