import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createVixenPodium,PODIUM_SCHEMA,BOUNDED_ENGINE_OPERATIONS} from '../app/encyclopedia/reference/vixen-podium.mjs';
import {createPodiumNativeReadAdapters} from '../scripts/vixen-podium-native-adapters.mjs';
import {runSrcPhase2ContextRoles} from '../app/encyclopedia/vixen-estate/src-atelier-engines.mjs';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const python=process.env.TD613_NATIVE_PYTHON||(process.platform==='win32'?'python':'python3');
const htmlPath=resolve(repo,'app/encyclopedia/vix-cyb.html');
const originalPath=resolve(repo,'packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/build-phase2-assays.py');
const phase2Path=resolve(repo,'scripts/vixen-src-original-phase2-host.py');
const hash=b=>createHash('sha256').update(b).digest('hex');
const ids=['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'];
function catalogue(){
 const html=readFileSync(htmlPath,'utf8');
 const marker='<script id="vixen-corpus-bundle" type="application/json">';
 const start=html.indexOf(marker),end=html.indexOf('</script>',start+marker.length);
 assert.ok(start>=0&&end>start);
 return JSON.parse(html.slice(start+marker.length,end));
}
const membrane={open:async()=>({state:'CENSUS_MATCHED'}),search:()=>[],
 getRecord:async()=>null,related:()=>[],status:()=>({state:'UNOPENED'})};
const command=(work_ids=ids,query='Explore representation changes and contextual source identity')=>({
 schema:PODIUM_SCHEMA,intent:'engine.invoke',params:{
  engine:'SRC_ATELIER',operation:'src_verified_vixen_original_phase2',
  payload:{work_ids,query}
 }
});

test('original Python Phase II compiler, evidence and tomography execute on SHA-verified original Vixen derivatives',async()=>{
 const before=hash(readFileSync(htmlPath));
 const c=catalogue();
 const adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 const owner=createVixenPodium({corpus:c,membrane,operatorAuthorized:true,engineAdapters:adapters});
 assert.ok(BOUNDED_ENGINE_OPERATIONS.SRC_ATELIER.includes('src_verified_vixen_original_phase2'));
 const execution=await owner.dispatch(command());
 assert.equal(execution.status,'HELD','Engine results require human review');
 assert.equal(execution.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 const out=execution.result.output;
 assert.ok(JSON.stringify(out).length<50000,'Must fit Podium response limit');
 assert.equal(out.native_python_executed,true);
 assert.equal(out.source_estate,'VIXEN_EXPERIMENT_A_ONLY');
 assert.equal(out.method,'ORIGINAL_SRC_PHASE2_CONTEXT_COMPILER_EVIDENCE_TOMOGRAPHY');
 const native=out.original_native_phase2;
 assert.equal(native.original_method_sha256,hash(readFileSync(originalPath)));
 assert.deepEqual(native.executed_original_functions,[
  'contextual_roles_and_compilers','conservation_and_tomography','evidence_interfaces'
 ]);
 assert.equal(native.catalogue_work_count,32);
 assert.equal(native.manifestation_count,53);
 assert.equal(native.original_src_historical_registries_used,false);
 assert.equal(native.original_source_corpus_imported,false);
 assert.equal(native.contextual_roles.length,6);
 assert.equal(native.compilation_passes.length,2);
 assert.ok(native.contextual_roles.every(x=>x.role_normalized==='CANDIDATE_INPUT'&&
   x.adjudication_status==='UNRESOLVED'&&x.evidence_ids.length===0));
 assert.ok(native.compilation_passes.every(p=>p.compiler_status==='WITNESSED_OR_CANDIDATE_AS_RECORDED_PER_INPUT'));
 assert.equal(native.conservation.length,2);
 assert.equal(native.tomography.length,2);
 assert.ok(native.tomography.every(x=>x.delta_scope==='NARROWED'&&
   x.delta_evidence==='UNKNOWN'&&x.delta_asserted_authority==='UNKNOWN'&&
   x.delta_falsifier_granularity==='UNKNOWN'&&x.composite_score===null));
 assert.equal(native.observed_evidence_units.length,2);
 assert.equal(native.identical_derivative_hash_lineage.length,0);
 assert.ok(native.observed_evidence_units.every(x=>
   Object.values(x.fingerprints).every(v=>v==='UNRESOLVED')));
 assert.deepEqual(native.source_proofs.map(p=>p.work_id),ids);
 assert.deepEqual(native.source_proofs.map(p=>p.derivative_sha256),
   out.source_proofs.map(p=>p.verified_derivative_sha256));
 assert.ok(native.selected_recorded_protocols.every(x=>
   x.registered_methods.length>0&&x.historical_compiler_role_observed===false));
 assert.equal(native.original_historical_compilation_proven,false);
 assert.equal(native.original_full_atelier_parity,'HELD_UNPROVEN');
 assert.equal(native.scientific_credit,0);
 assert.equal(out.scholarly_relation_admission,false);
 assert.equal(out.human_closure_required,true);
 assert.equal(hash(readFileSync(htmlPath)),before);
});

test('original SRC Phase II adverse controls preserve compiler context and inverse representation direction',async()=>{
 const adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 const phase2=(await adapters.SRC_ATELIER({
  operation:'src_verified_vixen_original_phase2',payload:{
   work_ids:ids,query:'Explore context withdrawal and representation inversion'
  }
 })).original_native_phase2;
 assert.equal(phase2.controls.withdraw_hypothetical_comparison_context.compiler_count,1);
 assert.equal(phase2.controls.withdraw_hypothetical_comparison_context.role_count,4);
 assert.ok(phase2.controls.withdraw_hypothetical_comparison_context.retained_roles.every(r=>
   r.architecture_id==='vixen-host:reader-source-context'&&r.adjudication_status==='UNRESOLVED'));
 assert.equal(phase2.controls.withdraw_hypothetical_comparison_context.historical_compiler_effect_proven,false);
 assert.equal(phase2.controls.inverse_representation_direction.tomography.length,2);
 assert.ok(phase2.controls.inverse_representation_direction.tomography.every(x=>
   x.delta_scope==='EXPANDED'&&x.delta_evidence==='UNKNOWN'&&
   x.delta_asserted_authority==='UNKNOWN'&&x.composite_score===null));
 assert.equal(phase2.controls.inverse_representation_direction.evidence_authority_delta_remains_unknown,true);
 const repeat=(await adapters.SRC_ATELIER({operation:'src_verified_vixen_original_phase2',
  payload:{work_ids:ids,query:'Explore a different proposed hypothesis'}
 })).original_native_phase2;
 assert.deepEqual(repeat.source_proofs,phase2.source_proofs);
 assert.deepEqual(repeat.ephemeral_registry_sha256,phase2.ephemeral_registry_sha256,
  'Untrusted query must never become an observed source');
 assert.equal(repeat.operator_query.query_used_as_source_text,false);
});

test('host authorization, foreign Work and source-hash forgery fail closed',async()=>{
 const c=catalogue(),adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 const denied=await createVixenPodium({corpus:c,membrane,
  operatorAuthorized:false,engineAdapters:adapters}).dispatch(command());
 assert.equal(denied.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 await assert.rejects(()=>adapters.SRC_ATELIER({
  operation:'src_verified_vixen_original_phase2',
  payload:{work_ids:[ids[0],'emwork_000000000000000000000000'],
   query:'Explore an unregistered work'}
 }),/HELD_FOREIGN_OR_UNREGISTERED_VIXEN_WORK/);
 const base=c.works.map(w=>({
  work_id:w.work_id,title:w.display_title||w.declared_title,
  protocols:w.protocols||[],linked_sources:w.linked_sources.map(s=>({
   source_file_id:s.source_file_id,original_sha256:s.sha256
  }))
 }));
 const selected=ids.map((id,i)=>({
  work_id:id,source_file_id:base.find(w=>w.work_id===id).linked_sources[0].source_file_id,
  original_sha256:base.find(w=>w.work_id===id).linked_sources[0].original_sha256,
  derivative_sha256:'a'.repeat(64),body:'forged body'
 }));
 const malformed=spawnSync(python,[phase2Path],{input:JSON.stringify({
  query:'Explore unearned original source',
  catalogue:base,selected
 }),encoding:'utf8',timeout:15000,
 env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1'}});
 assert.notEqual(malformed.status,0);
 assert.match(malformed.stderr,/HELD_PHASE2_SELECTED_DERIVATIVE_DIGEST/);
 const duplicate=structuredClone(base);
 duplicate[1].linked_sources[0].source_file_id=duplicate[0].linked_sources[0].source_file_id;
 const collision=spawnSync(python,[phase2Path],{input:JSON.stringify({
  query:'Explore the source identity collision',catalogue:duplicate,selected
 }),encoding:'utf8',timeout:15000,
 env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1'}});
 assert.notEqual(collision.status,0);
 assert.match(collision.stderr,/HELD_PHASE2_SOURCE_IDENTITY/);
});

test('adapted JS contextual compiler refuses missing witness status and phantom identities',()=>{
 const inputs=[
  {compiler_id:'vixen:reader:source',input_id:ids[0]},
  {compiler_id:'',input_id:ids[1]},
  {compiler_id:'vixen:reader:source',input_id:''},
  {compiler_id:'vixen:reader:compare',input_id:ids[1],role_in_context:'CANDIDATE_INPUT'}
 ];
 const result=runSrcPhase2ContextRoles(inputs,[]);
 assert.equal(result.role_count,2,'Missing compiler or subject coordinates must remain excluded');
 assert.equal(result.pass_count,2);
 assert.ok(result.roles.every(x=>x.adjudication_status==='UNRESOLVED'));
 assert.ok(result.roles.every(x=>x.contextual_role==='CANDIDATE_INPUT'));
 assert.ok(result.passes.every(x=>x.compiler_status==='WITNESSED_OR_CANDIDATE_AS_RECORDED_PER_INPUT'));
 const explicit=runSrcPhase2ContextRoles([
  {compiler_id:'vixen:reader:source',input_id:ids[0],adjudication_status:'WITNESSED',
   role_in_context:'RECORDED_TEST_FIXTURE'}
 ],[]);
 assert.equal(explicit.roles[0].adjudication_status,'WITNESSED',
  'Explicitly labeled synthetic witness data must not be erased by the candidate default');
 assert.equal(explicit.roles[0].contextual_role,'RECORDED_TEST_FIXTURE');
});
