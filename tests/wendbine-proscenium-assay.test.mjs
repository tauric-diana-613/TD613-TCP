import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,realpathSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runReconstructionAssay,validateNativeMaterials,loadOriginalPublicFixture,runNativeWendbineAssay}
 from '../scripts/wendbine-proscenium-assay.mjs';
import {createNativeAtelierReadAdapters} from '../scripts/vixen-native-atelier-bridge.mjs';
import {createPodiumNativeReadAdapters} from '../scripts/vixen-podium-native-adapters.mjs';
import {BOUNDED_ENGINE_OPERATIONS,createVixenPodium,PODIUM_SCHEMA} from '../app/encyclopedia/reference/vixen-podium.mjs';

const repo=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
const meta={schema:'wendbine-public-corpus-snapshot/v0.1',snapshot_id:'synthetic-w',
 scope:{private_google_group_admitted:false},rights:{full_post_bodies_copied:false},
 coverage:{admitted_source_count:4,state:'NONEXHAUSTIVE_FIXTURE'},window:{end_utc:'2026-09-11T09:27:00Z'}};
const mk=(id,day,title,concepts)=>({snapshot_id:'synthetic-w',source_id:'reddit:t3_'+id,
 community:'r/Wendbine',source_text_stored:false,real_person_identity_adjudicated:false,
 public_date:day,time_precision:'DAY',technical_header:title,normalized_summary:title,
 declared_concepts:concepts,source_flags:[]});
const posts=[
 mk('a11111','2026-09-10','Dependency graph and monitoring',['dependency_graph','monitoring']),
 mk('b22222','2026-09-10','Authority and trust propagation',['authority','trust']),
 mk('c33333','2026-09-11','Dependency graph anomaly',['dependency_graph','observability']),
 mk('d44444','2026-09-11','Dependency graph unseen future',['dependency_graph','monitoring'])
];
const e=(id,graph)=>({source_id:'reddit:t3_'+id,graph,from:'x',relation:'SUPPORTS',to:'y',
 evidence_class:'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE'});
const relations=[e('a11111','G_D'),e('b22222','G_A'),e('c33333','G_D'),e('d44444','G_D')];

// Synthetic fixtures test error behavior, never source truth.
test('finite graphs, provenance class and real-person boundary hold against promotion',()=>{
 assert.equal(validateNativeMaterials(meta,posts,relations).admitted_sources,4);
 assert.throws(()=>validateNativeMaterials(meta,posts,[...relations,e('a11111','G_FAKE')]),
  /HELD_UNREGISTERED_GRAPH_FAMILY/);
 assert.throws(()=>validateNativeMaterials(meta,posts,[...relations,{...e('a11111','G_D'),evidence_class:'MODEL_INFERRED_CAUSAL'}]),
  /HELD_RELATION_EVIDENCE_PROMOTION/);
 assert.throws(()=>validateNativeMaterials(meta,[{...posts[0],real_person_identity_adjudicated:true},...posts.slice(1)],relations),
  /HELD_SOURCE_PERSON_BOUNDARY/);
 assert.throws(()=>validateNativeMaterials(meta,posts,[...relations,e('z99999','G_D')]),
  /HELD_RELATION_UNADMITTED_SOURCE/);
});

test('prior-day-only reconstruction excludes future and same-day sources',()=>{
 const receipt=runReconstructionAssay({meta,posts,relations,target_source_id:posts[2].source_id});
 assert.equal(receipt.earlier_day_source_count,2);
 assert.equal(receipt.earlier_day_relation_count,2);
 assert.ok(receipt.controls.C0.prediction.witnesses.every(x=>x.public_date==='2026-09-10'));
 assert.equal(receipt.controls.C1.identical_to_baseline,true);
 assert.equal(receipt.controls.C3.prediction.graph_families.length,0);
 assert.equal(receipt.controls.C0.scoring.graph_hits,1);
 assert.equal(receipt.historical_replay_established,false);
 assert.equal(receipt.source_id_ordering_not_chronology,true);
 assert.equal(receipt.scientific_credit,0);
 assert.equal(receipt.source_promotion,false);
 assert.ok(receipt.forbidden_promotions.includes('METHOD_PARITY'));
});

test('historical-asof, absence of a dated target and operator-supplied unknown sources hold',()=>{
 assert.throws(()=>runReconstructionAssay({meta,posts,relations,target_source_id:posts[2].source_id,
  as_of_day:'2026-09-10'}),/HELD_ASSAY_TARGET_DAY_MISMATCH/);
 assert.throws(()=>runReconstructionAssay({meta,posts,relations,target_source_id:'reddit:t3_unknown'}),
  /HELD_UNREGISTERED_TARGET/);
 assert.throws(()=>runReconstructionAssay({meta,posts,relations,target_source_id:posts[2].source_id,
  as_of_day:'2026-09-10T01:00:00Z'}),/HELD_INVALID_ASOF_DAY/);
});

test('research journey revises the query rather than granting itself publication authority',()=>{
 const receipt=runReconstructionAssay({meta,posts,relations,mode:'journey',target_source_id:posts[2].source_id});
 assert.ok(receipt.journey.alternate_hypotheses.includes('TITLE_LEAKAGE'));
 assert.equal(receipt.journey.loop_state,'WAITING_FOR_NEW_OPERATOR_OR_INDEPENDENT_EVIDENCE');
 assert.equal(receipt.journey.can_proceed_without_new_evidence,false);
 assert.ok(receipt.journey.next_steps.every(x=>x.human_action_required));
 assert.equal(receipt.journey.automated_hypothesis_promotion,false);
});

test('original public compiler executes on frozen native fixture, with its own digest and no archive writes',async()=>{
 const fixture=await loadOriginalPublicFixture();
 assert.equal(fixture.compiler_receipt.original_compiler_executed,true);
 assert.equal(fixture.compiler_receipt.source_count,fixture.posts.length);
 assert.equal(fixture.meta.coverage.admitted_source_count,fixture.posts.length);
 assert.match(fixture.digests.original_compiler.sha256,/^[a-f0-9]{64}$/);
 const w=fixture.posts.find(p=>p.public_date==='2026-09-11')||fixture.posts[fixture.posts.length-1];
 const result=await runNativeWendbineAssay({mode:'journey',target_source_id:w.source_id});
 assert.equal(result.original_compiler_receipt.original_compiler_executed,true);
 assert.equal(result.target_source_id,w.source_id);
 assert.equal(result.original_archive_modified,false);
 assert.equal(result.vixen_work_import_count,0);
 assert.equal(result.historical_replay_established,false);
 assert.equal(result.scientific_credit,0);
 assert.equal(result.earlier_day_source_count,fixture.posts.filter(p=>p.public_date<w.public_date).length);
});

test('native host and machine-only Podium expose controlled reconstruction, with operator gating',async()=>{
 const fixture=await loadOriginalPublicFixture();
 const target=fixture.posts.find(p=>p.public_date==='2026-09-11')||fixture.posts[fixture.posts.length-1];
 const native=createNativeAtelierReadAdapters({repoRoot:repo});
 const nativeOut=native.WENDBINE_ATELIER({operation:'wendbine_public_reconstruction',
  payload:{target_source_id:target.source_id}});
 assert.equal(nativeOut.kind,'ORIGINAL_COMPILER_PLUS_TD613_DERIVED_ASSAY');
 assert.equal(nativeOut.data.original_compiler_receipt.original_compiler_executed,true);
 assert.equal(nativeOut.data.source_promotion,false);
 assert.equal(nativeOut.data.historical_replay_established,false);
 assert.equal(nativeOut.read_only,true);
 assert.ok(BOUNDED_ENGINE_OPERATIONS.WENDBINE_ATELIER.includes('wendbine_public_reconstruction'));
 const adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 const html=readFileSync(resolve(repo,'app/encyclopedia/vix-cyb.html'),'utf8');
 const match=html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 assert.ok(match);
 const corpus=JSON.parse(match[1]);
 const membrane={open:async()=>({state:'CENSUS_MATCHED'}),search:()=>[],getRecord:async()=>null,
  related:()=>[],status:()=>({state:'UNOPENED'})};
 const command={schema:PODIUM_SCHEMA,intent:'engine.invoke',params:{engine:'WENDBINE_ATELIER',
  operation:'wendbine_public_reconstruction',payload:{target_source_id:target.source_id}}};
 const blocked=await createVixenPodium({corpus,membrane,operatorAuthorized:false,engineAdapters:adapters}).dispatch(command);
 assert.equal(blocked.status,'HELD');
 assert.equal(blocked.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 const executed=await createVixenPodium({corpus,membrane,operatorAuthorized:true,engineAdapters:adapters}).dispatch(command);
 assert.equal(executed.status,'HELD');
 assert.equal(executed.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 assert.equal(executed.result.output.data.original_compiler_receipt.original_compiler_executed,true);
 assert.equal(executed.result.output.scientific_credit,0);
 assert.equal(executed.result.output.data.vixen_work_import_count,0);
});
