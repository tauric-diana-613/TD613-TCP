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
