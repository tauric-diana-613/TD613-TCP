import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,realpathSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {compareVerifiedVixenDocuments,runNativeVixenWendbineTransfer}
 from '../scripts/vixen-wendbine-method-transfer.mjs';
import {loadOriginalPublicFixture} from '../scripts/wendbine-proscenium-assay.mjs';
import {createPodiumNativeReadAdapters} from '../scripts/vixen-podium-native-adapters.mjs';
import {createVixenPodium,PODIUM_SCHEMA,BOUNDED_ENGINE_OPERATIONS}
 from '../app/encyclopedia/reference/vixen-podium.mjs';
const repo=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
const sha=s=>createHash('sha256').update(s).digest('hex');
const work_ids=['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'];

test('pure transfer rejects forged source bytes, invalid identities and absent original compiler profile',async()=>{
 const native=await loadOriginalPublicFixture();
 const path=resolve(repo,'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-compile.mjs');
 const compiler=await import(pathToFileURL(path).href);
 const profile=compiler.compilePublicCorpus(native.meta,native.posts,native.relations);
 const docs=[
  {work_id:work_ids[0],title:'Synthetic dependency graph',body:'Dependency graph and observable topology.'},
  {work_id:work_ids[1],title:'Synthetic recovery model',body:'Causal reconstruction and recovery theory.'}
 ];
 const proofs=docs.map((d,i)=>({work_id:d.work_id,source_file_id:'emsrc_'+String(i+1).padStart(24,'0'),
  derivative_bytes_rehashed:true,verified_derivative_sha256:sha(d.body)}));
 const call=()=>compareVerifiedVixenDocuments({documents:docs,proofs,query:'dependency graph',
  publicProfile:profile,publicPosts:native.posts,compilerReceipt:native.compiler_receipt});
 const receipt=call();
 assert.equal(receipt.subject_work_count,2);
 assert.equal(receipt.public_source_bodies_admitted,0);
 assert.equal(receipt.private_index_accessed,false);
 assert.equal(receipt.source_admission_authority,false);
 assert.equal(receipt.native_algorithm_equivalence,'HELD_UNPROVEN');
 assert.equal(receipt.counterfactuals.C5_work_order_reversal.invariant,true);
 assert.equal(receipt.counterfactuals.C1_title_only.body_computation_removed,true);
 assert.equal(receipt.counterfactuals.C3_public_cooccurrence_ablation.ranking.length,2);
 assert.equal(receipt.counterfactuals.C4_source_bound_technical_decoy.independence_proven,false);
 assert.ok(receipt.counterfactuals.C0_full_body_and_public_method_profile.ranking[0].body_query_hits>0);
 assert.throws(()=>compareVerifiedVixenDocuments({documents:[{...docs[0],body:'tampered'},docs[1]],
  proofs,query:'dependency graph',publicProfile:profile,publicPosts:native.posts,
  compilerReceipt:native.compiler_receipt}),/HELD_VIXEN_DERIVATIVE_DIGEST_MISMATCH/);
 assert.throws(()=>compareVerifiedVixenDocuments({documents:[{...docs[0],work_id:'reddit:t3_a11111'},docs[1]],
  proofs,query:'dependency graph',publicProfile:profile,publicPosts:native.posts,
  compilerReceipt:native.compiler_receipt}),/HELD_FOREIGN_OR_UNREGISTERED_VIXEN_WORK/);
});

test('actual immutable Vixen Work derivative bytes enter the method, with original compiler as separate executable',async()=>{
 const result=await runNativeVixenWendbineTransfer({repoRoot:repo,work_ids,query:'quantum entanglement'});
 assert.equal(result.subject_estate,'VIXEN_EXPERIMENT_A_VERIFIED_WORKS_ONLY');
 assert.equal(result.subject_source_proofs.length,2);
 assert.ok(result.subject_source_proofs.every(p=>p.derivative_bytes_rehashed));
 assert.equal(result.public_snapshot_compiled,true);
 assert.match(result.source_compiler_digest,/^[0-9a-f]{64}$/);
 assert.equal(result.public_source_bodies_admitted,0);
 assert.equal(result.public_ui_identity_changes,0);
 assert.equal(result.scientific_credit,0);
 assert.equal(result.counterfactuals.C5_work_order_reversal.invariant,true);
 assert.equal(result.native_algorithm_equivalence,'HELD_UNPROVEN');
 const audio=await runNativeVixenWendbineTransfer({repoRoot:repo,work_ids,query:'ring buffer'});
 assert.deepEqual(audio.subject_source_proofs,result.subject_source_proofs,'Query must not mutate original Vixen Work');
 const scoreFor=(r,id)=>r.counterfactuals.C0_full_body_and_public_method_profile.ranking.find(x=>x.work_id===id).score;
 assert.ok(scoreFor(result,work_ids[1])>scoreFor(result,work_ids[0]),
  'Quantum Work should respond more strongly to the quantum query');
 assert.ok(scoreFor(audio,work_ids[0])>scoreFor(audio,work_ids[1]),
  'Audio Work should respond more strongly to the ring-buffer query');
 await assert.rejects(()=>runNativeVixenWendbineTransfer({repoRoot:repo,work_ids:[
  work_ids[0],'emwork_000000000000000000000000'],query:'quantum entanglement'}),
  /HELD_FOREIGN_OR_UNREGISTERED_VIXEN_WORK/);
});

test('machine Podium dispatch requires host operator authority and leaves source authorship unendorsed',async()=>{
 const adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 assert.ok(BOUNDED_ENGINE_OPERATIONS.WENDBINE_ATELIER.includes('wendbine_verified_vixen_method_transfer'));
 const html=readFileSync(resolve(repo,'app/encyclopedia/vix-cyb.html'),'utf8');
 const match=html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 const corpus=JSON.parse(match[1]);
 const reader={open:async()=>({state:'CENSUS_MATCHED'}),search:()=>[],getRecord:async()=>null,
  related:()=>[],status:()=>({state:'UNOPENED'})};
 const task={schema:PODIUM_SCHEMA,intent:'engine.invoke',params:{
  engine:'WENDBINE_ATELIER',operation:'wendbine_verified_vixen_method_transfer',
  payload:{work_ids,query:'quantum entanglement'}
 }};
 const no=await createVixenPodium({corpus,membrane:reader,operatorAuthorized:false,engineAdapters:adapters}).dispatch(task);
 assert.equal(no.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 const yes=await createVixenPodium({corpus,membrane:reader,operatorAuthorized:true,engineAdapters:adapters}).dispatch(task);
 assert.equal(yes.status,'HELD');
 assert.equal(yes.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 assert.equal(yes.result.output.subject_work_count,2);
 assert.equal(yes.result.output.source_admission_authority,false);
 assert.equal(yes.result.output.public_source_bodies_admitted,0);
 assert.equal(yes.result.output.native_algorithm_equivalence,'HELD_UNPROVEN');
 assert.equal(yes.result.scientific_credit,0);
});
