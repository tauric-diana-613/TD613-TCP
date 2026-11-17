import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync,realpathSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {createNativeAtelierReadAdapters} from '../scripts/vixen-native-atelier-bridge.mjs';
import {createPodiumNativeReadAdapters} from '../scripts/vixen-podium-native-adapters.mjs';
import {BOUNDED_ENGINE_OPERATIONS} from '../app/encyclopedia/reference/vixen-podium.mjs';

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
