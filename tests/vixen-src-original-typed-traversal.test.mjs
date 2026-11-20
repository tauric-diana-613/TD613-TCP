import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createVixenPodium,PODIUM_SCHEMA,BOUNDED_ENGINE_OPERATIONS} from '../app/encyclopedia/reference/vixen-podium.mjs';
import {createPodiumNativeReadAdapters} from '../scripts/vixen-podium-native-adapters.mjs';

const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const python=process.env.TD613_NATIVE_PYTHON||(process.platform==='win32'?'python':'python3');
const work_ids=['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'];
const htmlPath=resolve(repo,'app/encyclopedia/vix-cyb.html');
const sha=v=>createHash('sha256').update(v).digest('hex');
const corpus=()=>{
 const html=readFileSync(htmlPath,'utf8');
 const marker='<script id="vixen-corpus-bundle" type="application/json">';
 const first=html.indexOf(marker),last=html.indexOf('</script>',first+marker.length);
 assert.ok(first>=0&&last>first);
 return JSON.parse(html.slice(first+marker.length,last));
};
const reader={open:async()=>({state:'CENSUS_MATCHED'}),search:()=>[],
 getRecord:async()=>null,related:()=>[],status:()=>({state:'UNOPENED'})};
const request=(query='Explore quantum entanglement')=>({
 schema:PODIUM_SCHEMA,intent:'engine.invoke',params:{
  engine:'SRC_ATELIER',operation:'src_verified_vixen_original_typed_traversal',
  payload:{work_ids,query}
 }
});

test('unchanged original SRC Python traverser runs on registered Vixen Works and verified derivative bytes',async()=>{
 assert.ok(BOUNDED_ENGINE_OPERATIONS.SRC_ATELIER.includes(
  'src_verified_vixen_original_typed_traversal'));
 const initial=sha(readFileSync(htmlPath));
 const originals=corpus();
 assert.equal(originals.works.length,32);
 assert.equal(originals.works.reduce((n,w)=>n+w.linked_sources.length,0),53);
 const adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 const podium=createVixenPodium({corpus:originals,membrane:reader,
  operatorAuthorized:true,engineAdapters:adapters});
 const issued=await podium.dispatch(request());
 assert.equal(issued.status,'HELD','Native execution never performs human adjudication');
 assert.equal(issued.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 const out=issued.result.output,original=out.original_native_traversal;
 assert.equal(out.native_python_executed,true);
 assert.equal(out.method,'ORIGINAL_SRC_TYPED_EVIDENCE_TRAVERSAL');
 assert.equal(out.source_estate,'VIXEN_EXPERIMENT_A_ONLY');
 assert.equal(original.original_function,'src-evidence-rabbit-hole-v1.py:explore');
 assert.match(original.original_method_sha256,/^[a-f0-9]{64}$/);
 assert.equal(original.input_estate,'VIXEN');
 assert.equal(original.method_estate,'SRC');
 assert.equal(original.native_original_registry_used,false);
 assert.equal(original.vixen_original_corpus_imported_to_src,false);
 assert.equal(original.catalogue_work_count,32);
 assert.equal(original.recorded_manifestation_count,53);
 assert.deepEqual(original.selected_verified_derivatives.map(x=>x.work_id),work_ids);
 assert.equal(original.operator_query_evidence_class,'SYNTHETIC_QUERY_NOT_MANUSCRIPT');
 assert.equal(original.query_influenced_typed_traversal,false);
 assert.equal(original.routes.length,2);
 for(const route of original.routes){
  const native=route.original_function_result;
  assert.equal(native.schema,'td613.src.rabbithole-evidence/v1');
  assert.equal(native.query_entity,route.seed_work_id);
  assert.ok(native.witnessed_typed_routes.some(e=>
   e.relation==='RECORDED_WORK_MANIFESTATION'&&e.graph_kind==='DOCUMENTARY_MEMBERSHIP'));
  const derivative=native.witnessed_typed_routes.find(e=>
   e.relation==='REHASHED_READABLE_DERIVATIVE'&&e.graph_kind==='DIGITAL_CUSTODY');
  assert.ok(derivative,'Original Python must traverse the second custody hop');
  assert.equal(derivative.path_length,2);
  assert.equal(derivative.stratum_change_requires_new_witness,true);
  assert.equal(derivative.candidate_direct_relation_admitted,false);
  assert.equal(native.heterostratigraphic_synthesis_proven,false);
  assert.equal(native.human_adjudication_reserved,true);
  assert.deepEqual(native.contextual_roles,[],'An empty role register cannot invent compiler roles');
 }
 assert.equal(out.scientific_credit,0);
 assert.equal(out.authorship_promotion,false);
 assert.equal(out.scholarly_relation_admission,false);
 assert.equal(out.human_closure_required,true);
 assert.equal(sha(readFileSync(htmlPath)),initial,'Original Vixen corpus must remain byte-identical');
});

test('unauthorized host and forged Vixen Work requests fail closed',async()=>{
 const adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 const existing=corpus();
 const denied=await createVixenPodium({corpus:existing,membrane:reader,
  operatorAuthorized:false,engineAdapters:adapters}).dispatch({
  ...request(),params:{...request().params,operatorAuthorized:true}
 });
 assert.equal(denied.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 await assert.rejects(()=>adapters.SRC_ATELIER({
  operation:'src_verified_vixen_original_typed_traversal',
  payload:{work_ids:[work_ids[0],'emwork_000000000000000000000000'],
   query:'Explore quantum entanglement'}
 }),/HELD_FOREIGN_OR_UNREGISTERED_VIXEN_WORK/);
});

test('native packet rejects invalid count, unbound source identity and fabricated derivative digest',()=>{
 const script=resolve(repo,'scripts/vixen-src-original-typed-traversal.py');
 const base=corpus().works.map(w=>({
  work_id:w.work_id,
  linked_sources:w.linked_sources.map(s=>({
   source_file_id:s.source_file_id,original_sha256:s.sha256
  }))
 }));
 const validShape={catalogue:base,query:'Explore a witnessed manuscript',selected:[]};
 const call=packet=>spawnSync(python,[script],{
  cwd:repo,input:JSON.stringify(packet),encoding:'utf8',
  timeout:12000,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1'}
 });
 const missing=call(validShape);
 assert.notEqual(missing.status,0);
 assert.match(missing.stderr,/HELD_TYPED_VIXEN_CENSUS_OR_PAIR/);
 const forged=call({...validShape,selected:[
  {work_id:work_ids[0],source_file_id:base[0].linked_sources[0].source_file_id,
   original_sha256:base[0].linked_sources[0].original_sha256,
   derivative_sha256:'a'.repeat(64),body:'forged'},
  {work_id:work_ids[1],source_file_id:base[1].linked_sources[0].source_file_id,
   original_sha256:base[1].linked_sources[0].original_sha256,
   derivative_sha256:'b'.repeat(64),body:'forged'}
 ]});
 assert.notEqual(forged.status,0);
 assert.match(forged.stderr,/HELD_TYPED_SELECTED_DERIVATIVE_INTEGRITY/);
 const duplicate=structuredClone(base);
 duplicate[1].linked_sources[0].source_file_id=duplicate[0].linked_sources[0].source_file_id;
 const collision=call({...validShape,catalogue:duplicate,selected:[
  {work_id:work_ids[0],source_file_id:base[0].linked_sources[0].source_file_id,
   original_sha256:base[0].linked_sources[0].original_sha256,
   derivative_sha256:'a'.repeat(64),body:''},
  {work_id:work_ids[1],source_file_id:base[1].linked_sources[0].source_file_id,
   original_sha256:base[1].linked_sources[0].original_sha256,
   derivative_sha256:'b'.repeat(64),body:''}
 ]});
 assert.notEqual(collision.status,0);
 assert.match(collision.stderr,/HELD_TYPED_SOURCE_IDENTITY/);
});
