/**
 * PEFB-20261103 PE04 source-free native METHOD execution census.
 * Invokes actual pinned B91-inherited algorithms with invented fixtures only.
 * Does not claim SRC/Em original-corpus parity or a recovered 44-method connector.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import * as src from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B4/src/src-compositional-v01.mjs';
import {normalizeKey} from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B4/src/src-native-routing-v01.mjs';
import {FAMILIES as EM_FAMILIES} from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B6/em-methods-v01.mjs';
import {compilePublicCorpus} from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B3/originals/wendbine-compile.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function nativeMethodCensus(){
 const status=Object.values(EM_FAMILIES);
 const em={count:status.length,executed:status.filter(x=>x==='EXECUTED_SYNTHETIC').length,
  partial:status.filter(x=>x==='PARTIAL').length,designed:status.filter(x=>x==='DESIGNED').length};
 const srcFamilies=src.SRC_FAMILIES;
 if(!Array.isArray(srcFamilies)||srcFamilies.length!==12)throw Error('PE04_SRC_FAMILY_REGISTRY_DRIFT');
 if(em.count!==10||em.executed!==3||em.partial!==6||em.designed!==1)throw Error('PE04_EM_STATUS_DRIFT');
 const surfaces=src.nativeSufficiencyMatrix();
 if(!surfaces||typeof surfaces!=='object')throw Error('PE04_SRC_MATRIX_UNAVAILABLE');
 const key=normalizeKey('Explore X.');
 if(typeof key!=='string'||key.length===0)throw Error('PE04_NATIVE_ROUTING_UNAVAILABLE');
 return Object.freeze({schema:'td613.pe04.native-method-sourcefree/v1',
  src:{family_count:12,original_corpus_parity:0,functions_exercised:['nativeSufficiencyMatrix','normalizeKey'],
    normalization_witness:key,surface_matrix_executes:true},
  em:{...em,original_corpus_parity:'HELD',functions_exercised:['FAMILIES_STATUS_CENSUS']},
  universal_original:{declared:44,original_initial_callable:1,real_sources_admitted:0,original_shared_connector:'HELD'},
  claim_ceiling:'ACTUAL_SOURCE_FREE_LIBRARY_CALLS_NOT_FULL_METHOD_PARITY'});
}
export function runWendbineNativeFixture(){
 const file=path.join(repo,'packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B8/fixture-catalog.json');
 const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
 const f=catalog.fixtures.find(x=>x.fixture_id==='W_PUBLIC');
 if(!f||f.family!=='WENDBINE_PUBLIC'||f.evidence_class!=='SYNTHETIC_REPLAY_ONLY')throw Error('PE04_WENDBINE_FIXTURE_UNAVAILABLE');
 const raw=Buffer.from(f.bytes_base64,'base64');
 if(sha(raw)!==f.sha256||raw.length!==f.byte_length)throw Error('PE04_FIXTURE_HASH_CONFLICT');
 const input=JSON.parse(raw.toString('utf8'));
 if(input?.meta?.schema!=='wendbine-public-corpus-snapshot/v0.1')throw Error('PE04_WRONG_PUBLIC_INPUT_SCHEMA');
 const graph=compilePublicCorpus(input.meta,input.posts,input.relations);
 if(!graph||!Array.isArray(graph.post_nodes)||!Array.isArray(graph.typed_relation_edges))throw Error('PE04_NATIVE_WENDBINE_COMPILER_UNAVAILABLE');
 return {schema:'td613.pe04.wendbine-executed-native/v1',source_id:'FIXTURE:W_PUBLIC',
  compiler:'ACTUAL_B91_PINNED_WENDBINE_PUBLIC_LIBRARY',source_sha256:f.sha256,
  post_nodes:graph.post_nodes.length,typed_edges:graph.typed_relation_edges.length,
  graph_claim_ceiling:'SYNTHETIC_PUBLIC_TOPOLOGY_ONLY',private_originals_seen:0};
}
