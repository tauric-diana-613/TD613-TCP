import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync,realpathSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {createNativeAtelierReadAdapters} from '../scripts/vixen-native-atelier-bridge.mjs';
import {createPodiumNativeReadAdapters} from '../scripts/vixen-podium-native-adapters.mjs';
import {createVixenPodium,PODIUM_SCHEMA,BOUNDED_ENGINE_OPERATIONS} from '../app/encyclopedia/reference/vixen-podium.mjs';

const repo=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
const native=createNativeAtelierReadAdapters({repoRoot:repo});
const python=process.env.TD613_NATIVE_PYTHON || (process.platform==='win32'?'python':'python3');
const files={
 src:'packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/srcquery.py',
 src_search:'packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/src-native-text-search-v1.py',
 wend:'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-private-unified-query.py',
 em:'packages/dome_world_exact/fixtures/a15-r0/EMSTD613/99-ADMIN/em-native-text-search-v1.py',
 cross:'scripts/atelier-cross-estate-query-v1.py'
};

test('original native source instruments are physically present and parseable',()=>{
 for(const [name,path] of Object.entries(files)){
  assert.equal(existsSync(resolve(repo,path)),true,name+' original executable missing');
  const bytes=readFileSync(resolve(repo,path));
  assert.ok(bytes.length>100,name+' empty stub');
  const out=execFileSync(python,[resolve(repo,path),'--help'],{encoding:'utf8',timeout:10000,
    env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1'}});
  assert.match(out,/usage:/i,name+' native CLI not runnable');
 }
});

test('native four-Atelier bridge is host-only, bounded, and read-only',async()=>{
 const adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 for(const [key,operation] of [
  ['SRC_ATELIER','src_native_epoch_query'],
  ['WENDBINE_ATELIER','wendbine_private_status'],
  ['EM_ATELIER','em_native_text'],
  ['CROSS_ATELIER','cross_atelier_lexical']]){
  assert.equal(typeof native[key],'function',key+' native adapter absent');
  assert.equal(typeof adapters[key],'function',key+' Podium host adapter absent');
  assert.ok(BOUNDED_ENGINE_OPERATIONS[key].includes(operation),key+' Podium capability absent');
 }
});

test('native executables refuse private index omission or repository-local disclosure',()=>{
 assert.throws(()=>native.SRC_ATELIER({operation:'src_native_text',payload:{action:'search',query:'alpha'}}),
  /HELD_NATIVE_INPUT_REQUIRED/);
 assert.throws(()=>native.EM_ATELIER({operation:'em_native_text',payload:{index_path:resolve(repo,files.em)}}),
  /HELD_PRIVATE_INDEX_OUTSIDE_REPO_REQUIRED/);
 assert.throws(()=>native.WENDBINE_ATELIER({operation:'wendbine_private_status',payload:{index_path:resolve(repo,files.wend)}}),
  /HELD_PRIVATE_INDEX_OUTSIDE_REPO_REQUIRED/);
 assert.throws(()=>native.CROSS_ATELIER({operation:'cross_atelier_lexical',payload:{query:'alpha'}}),
  /HELD_NATIVE_INPUT_REQUIRED/);
 assert.throws(()=>native.SRC_ATELIER({operation:'src_native_epoch_query',payload:{}}),
  /HELD_NATIVE_INPUT_REQUIRED/);
});

test('Vixen browser loads new editorial system without exposing native estate toolkits as Opera labels',()=>{
 const html=readFileSync(resolve(repo,'app/encyclopedia/vix-cyb.html'),'utf8');
 const css=readFileSync(resolve(repo,'app/encyclopedia/vixen-estate/vixen-obsidian-reading-rgi26.css'),'utf8');
 assert.match(html,/href="\.\/vixen-estate\/vixen-obsidian-reading-rgi26\.css"/);
 assert.doesNotMatch(html,/href="\.\/vixen-estate\/vixen-noir-folio-rgi25\.css"/);
 assert.match(html,/ci-scoring-primer/);
 assert.match(html,/An instrument for asking better questions/);
 assert.match(html,/THE OBSIDIAN READING ROOM/);
 assert.doesNotMatch(html,/>FADT Exact \[C3\]/);
 assert.doesNotMatch(html,/>FADT &amp; XOR SYNERGY/);
 assert.match(css,/#expaCompanionBodyPre/);
 assert.match(css,/#constitutiveInquiry \.ci-candidate-card/);
 assert.doesNotMatch(css,/background:\s*(?:white|#fff(?:fff)?)[;\s!]/i);
});

test('original native host operations include source-bound research routes without write authority',async()=>{
 const adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 const expected={
   SRC_ATELIER:['src_native_epoch_query','src_native_text','src_native_semantic',
     'src_native_projective_assay','src_native_evidence_traverse','src_native_research_journey'],
   WENDBINE_ATELIER:['wendbine_private_status','wendbine_private_search','wendbine_public_query','wendbine_sealed_epoch_query'],
   EM_ATELIER:['em_native_text','em_native_semantic','em_native_work_route','em_native_research_journey'],
   CROSS_ATELIER:['cross_atelier_lexical','cross_atelier_semantic']
 };
 for(const [estate,ops] of Object.entries(expected)){
   assert.equal(typeof adapters[estate],'function');
   for(const op of ops)assert.ok(BOUNDED_ENGINE_OPERATIONS[estate].includes(op),estate+': '+op+' missing');
   assert.equal(BOUNDED_ENGINE_OPERATIONS[estate].some(op=>/^(?:build_|write_|import_|publish_|admit_|seal_|restore_|mutate_)/i.test(op)),false);
 }
 const summary=native.WENDBINE_ATELIER({operation:'wendbine_public_query',payload:{action:'summary'}});
 assert.equal(summary.kind,'ORIGINAL_NATIVE_EXECUTABLE');
 assert.equal(summary.read_only,true);
 assert.equal(summary.scientific_credit,0);
 assert.ok(summary.data?.result?.indexed_records>0);
 assert.throws(()=>native.SRC_ATELIER({operation:'src_native_research_journey',payload:{query:'test'}}),/HELD_NATIVE_INPUT_REQUIRED/);
 assert.throws(()=>native.WENDBINE_ATELIER({operation:'wendbine_sealed_epoch_query',payload:{}}),/HELD_NATIVE_INPUT_REQUIRED/);
 assert.throws(()=>native.EM_ATELIER({operation:'em_native_semantic',payload:{query:'test'}}),/HELD_NATIVE_INPUT_REQUIRED/);
 assert.throws(()=>native.CROSS_ATELIER({operation:'cross_atelier_semantic',payload:{query:'test'}}),/HELD_NATIVE_INPUT_REQUIRED/);
});


test('original SRC projective-assay executable computes on isolated synthetic input, without touching any SRC corpus',()=>{
 const scratch=mkdtempSync(resolve(tmpdir(),'vixen-src-engine-fixture-'));
 try{
  const dir=resolve(scratch,'03-DERIVATIVES/text/zenodo');
  mkdirSync(dir,{recursive:true});
  writeFileSync(resolve(dir,'zenodo-99900001-file-0.md'),
   'Synthetic engine test only. Explore Aurora. No real research subject, author, or SRC source is admitted.\n');
  const originalScript=resolve(repo,'packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/run-projective-routing-grammar-assay.py');
  const result=JSON.parse(execFileSync(python,[originalScript,'--root',scratch],{
   cwd:scratch,encoding:'utf8',timeout:12000,
   env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1'}
  }));
  assert.equal(result.schema_version,'src-projective-routing-summary/v1');
  assert.equal(result.document_count,1);
  assert.ok(result.explore_observation_count>=1);
  assert.equal(result.status,'BOUNDED_MACHINE_PASS_HUMAN_ADJUDICATION_REQUIRED');
  assert.ok(result.automatic_promotions_forbidden.includes('MACHINE_ROUTING_EFFECT_CONFIRMED'));
  assert.equal(existsSync(resolve(scratch,'04-RECEIPTS')),false,'Original assay executed read-only');
 }finally{rmSync(scratch,{recursive:true,force:true});}
});

test('authorized Podium invokes installed SRC computational method on synthetic Vixen-plane records only',async()=>{
 const html=readFileSync(resolve(repo,'app/encyclopedia/vix-cyb.html'),'utf8');
 const start=html.indexOf('<script id="vixen-corpus-bundle" type="application/json">');
 assert.ok(start>=0);
 const bodyStart=html.indexOf('>',start)+1,bodyEnd=html.indexOf('</script>',bodyStart);
 const corpus=JSON.parse(html.slice(bodyStart,bodyEnd));
 assert.equal(corpus.works.length,32,'Vixen original Work census preserved');
 assert.ok(corpus.works.every(w=>/^emwork_/.test(w.work_id)),'No foreign research Work admitted to Vixen');
 assert.ok(corpus.works.every(w=>w.linked_sources.every(s=>/^emsrc_/.test(s.source_file_id))),
  'Original Vixen source register must not become the SRC research archive');
 const adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 const reader={open:async()=>({state:'CENSUS_MATCHED'}),search:()=>[],getRecord:async()=>null,
  related:()=>[],status:()=>({state:'UNOPENED'})};
 const command={schema:PODIUM_SCHEMA,intent:'engine.invoke',params:{
  engine:'SRC_ATELIER',operation:'src_projective_routing',payload:{
   documents:[{record_id:'fixture-reader',title:'Fixture reader',body:'Explore Aurora.'}],
   catalog:[{record_id:'fixture-destination',title:'Aurora'}]
  }
 }};
 const held=await createVixenPodium({corpus,membrane:reader,operatorAuthorized:false,engineAdapters:adapters}).dispatch(command);
 assert.equal(held.status,'HELD');
 assert.equal(held.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 const executed=await createVixenPodium({corpus,membrane:reader,operatorAuthorized:true,engineAdapters:adapters}).dispatch(command);
 assert.equal(executed.status,'HELD','Computational execution cannot confer scientific approval');
 assert.equal(executed.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 assert.equal(executed.result.engine,'SRC_ATELIER');
 assert.equal(executed.result.operation,'src_projective_routing');
 assert.equal(executed.result.output.method,'SRC_PROJECTIVE_ROUTING');
 assert.equal(executed.result.output.cue_count,1);
 assert.equal(executed.result.output.candidate_link_count,1);
 assert.equal(executed.result.output.links[0].target_record_id,'fixture-destination');
 assert.equal(executed.result.output.links[0].semantic_promotion,'NO_SEMANTIC_OR_CAUSAL_PROMOTION');
 assert.equal(executed.result.scientific_credit,0);
 assert.equal(executed.result.endorsement,false);
});


test('SRC computation runs on two real, SHA-verified original Vixen Work bodies via Podium without corpus crossover',async()=>{
 const html=readFileSync(resolve(repo,'app/encyclopedia/vix-cyb.html'),'utf8');
 const marker='<script id="vixen-corpus-bundle" type="application/json">';
 const start=html.indexOf(marker);
 assert.ok(start>=0);
 const end=html.indexOf('</script>',start+marker.length);
 const corpus=JSON.parse(html.slice(start+marker.length,end));
 const workIds=['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'];
 for(const id of workIds)assert.ok(corpus.works.some(w=>w.work_id===id));
 const adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 const reader={open:async()=>({state:'CENSUS_MATCHED'}),search:()=>[],getRecord:async()=>null,
  related:()=>[],status:()=>({state:'UNOPENED'})};
 const command=query=>({schema:PODIUM_SCHEMA,intent:'engine.invoke',params:{
  engine:'SRC_ATELIER',operation:'src_verified_vixen_work_pair',
  payload:{work_ids:workIds,query}
 }});
 const denied=await createVixenPodium({corpus,membrane:reader,operatorAuthorized:false,engineAdapters:adapters})
  .dispatch(command('Explore quantum entanglement'));
 assert.equal(denied.status,'HELD');
 assert.equal(denied.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 const podium=createVixenPodium({corpus,membrane:reader,operatorAuthorized:true,engineAdapters:adapters});
 const quantum=await podium.dispatch(command('Explore quantum entanglement'));
 assert.equal(quantum.status,'HELD','Computation has no adjudication or publication power');
 assert.equal(quantum.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 const output=quantum.result.output;
 assert.equal(output.schema,'td613.vixen.src-verified-work-pair/v1');
 assert.equal(output.source_estate,'VIXEN_EXPERIMENT_A_ONLY');
 assert.equal(output.native_python_executed,false);
 assert.equal(output.projective_routing.document_count,2);
 assert.equal(output.source_proofs.length,2);
 assert.deepEqual(output.source_proofs.map(p=>p.work_id),workIds);
 assert.ok(output.source_proofs.every(p=>p.derivative_bytes_rehashed&&
  /^[a-f0-9]{64}$/.test(p.verified_derivative_sha256)&&/^emsrc_[a-f0-9]{24}$/.test(p.source_file_id)));
 assert.equal(output.scored_works[1].explore_match_type,'BODY_PROJECTIVE_TARGET',
  'A real quantum manuscript body must influence SRC scoring beyond its title');
 assert.ok(output.scored_works[1].s_src_combined>output.scored_works[0].s_src_combined);
 const audio=(await podium.dispatch(command('Explore ring buffer'))).result.output;
 assert.equal(audio.scored_works[0].explore_match_type,'BODY_PROJECTIVE_TARGET',
  'A real audio manuscript body must influence SRC scoring beyond its title');
 assert.ok(audio.scored_works[0].s_src_combined>audio.scored_works[1].s_src_combined);
 assert.deepEqual(audio.source_proofs,output.source_proofs,'Two queries must not mutate source custody');
 assert.equal(output.scientific_credit,0);
 assert.equal(output.authorship_promotion,false);
 assert.equal(output.human_closure_required,true);
 assert.equal(corpus.works.length,32);
 assert.ok(corpus.works.every(w=>w.linked_sources.every(s=>/^emsrc_/.test(s.source_file_id))));
 await assert.rejects(()=>adapters.SRC_ATELIER({operation:'src_verified_vixen_work_pair',
  payload:{work_ids:[workIds[0],'emwork_000000000000000000000000'],
   query:'Explore quantum entanglement'}}),/HELD_FOREIGN_OR_UNREGISTERED_VIXEN_WORK/);
});

test('original SRC Python projective functions execute on identical verified Vixen Work bytes and expose method differences',async()=>{
 const work_ids=['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'];
 const adapters=await createPodiumNativeReadAdapters({repoRoot:repo});
 assert.ok(BOUNDED_ENGINE_OPERATIONS.SRC_ATELIER.includes('src_verified_vixen_original_projective_differential'));
 const payload={work_ids,query:'Explore quantum entanglement'};
 const js=await adapters.SRC_ATELIER({operation:'src_verified_vixen_work_pair',payload});
 const observed=await adapters.SRC_ATELIER({operation:'src_verified_vixen_original_projective_differential',payload});
 const native=observed.original_native_differential;
 assert.equal(js.native_python_executed,false);
 assert.equal(observed.native_python_executed,true);
 assert.equal(native.original_python_replay.native_python_executed,true);
 assert.deepEqual(observed.source_proofs,js.source_proofs);
 assert.deepEqual(observed.scored_works,js.scored_works);
 assert.deepEqual(native.original_python_replay.verified_vixen_derivatives.map(x=>x.work_id),work_ids);
 assert.match(native.original_python_replay.original_method_sha256,/^[a-f0-9]{64}$/);
 assert.equal(native.original_python_replay.original_src_archive_loaded,false);
 assert.equal(native.full_method_equivalence,'HELD_UNPROVEN');
 assert.equal(native.synthetic_query_probe.evidence_class,'SYNTHETIC_OPERATOR_QUERY_NOT_MANUSCRIPT');
 assert.equal(observed.authorship_promotion,false);
 assert.equal(observed.scientific_credit,0);
 assert.equal(observed.human_closure_required,true);
 await assert.rejects(()=>adapters.SRC_ATELIER({operation:'src_verified_vixen_original_projective_differential',
  payload:{work_ids:[work_ids[0],'emwork_000000000000000000000000'],query:'Explore quantum entanglement'}}),
  /HELD_FOREIGN_OR_UNREGISTERED_VIXEN_WORK/);
});
