/** Strict successor contract around the byte-preserved original public compiler.
 * Origin-side qualification only. This module implements no receiver admission.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const deepFreeze=value=>{if(value&&typeof value==='object'){for(const child of Object.values(value))deepFreeze(child);Object.freeze(value);}return value;};
export const CONTRACT=deepFreeze(JSON.parse(fs.readFileSync(path.join(HERE,'wendbine-native-compiler-contract-v1.json'),'utf8')));
const FIELDS=['source_id','graph','from','relation','to','evidence_class'];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');

export function validateNativeInputs(meta,posts,registry){
 if(meta?.schema!=='wendbine-public-corpus-snapshot/v0.1'||!meta.snapshot_id)throw new Error('WENDBINE_SNAPSHOT_CONTRACT');
 if(meta.rights?.full_post_bodies_copied!==false||meta.scope?.private_google_group_admitted!==false)throw new Error('WENDBINE_PUBLIC_BOUNDED_SCOPE_REQUIRED');
 if(meta.authority?.human_closure_required!==true||['td613_scientific_promotion','merge','deployment'].some(k=>meta.authority[k]!==false))throw new Error('WENDBINE_ORIGINAL_AUTHORITY_LIMITS_REQUIRED');
 if(!Array.isArray(posts)||!posts.length||!Number.isSafeInteger(meta.coverage?.admitted_source_count)||posts.length!==meta.coverage.admitted_source_count)throw new Error('WENDBINE_EXACT_SOURCE_COUNT');
 const ids=new Set();
 for(const post of posts){
  if(typeof post.source_id!=='string'||!/^reddit:t3_[a-z0-9]+$/.test(post.source_id)||ids.has(post.source_id))throw new Error('WENDBINE_UNIQUE_SOURCE_ID');
  ids.add(post.source_id);
  const match=post.canonical_url?.match(/^https:\/\/www\.reddit\.com\/r\/Wendbine\/comments\/([a-z0-9]+)(?:\/|$)/);
  if(!match||'reddit:t3_'+match[1]!==post.source_id)throw new Error('WENDBINE_SOURCE_URL_ID_MISMATCH');
  if(post.snapshot_id!==meta.snapshot_id||post.community!=='r/Wendbine'||post.source_text_stored!==false||post.real_person_identity_adjudicated!==false)throw new Error('WENDBINE_SOURCE_SCOPE_MISMATCH');
  if(['selftext','body','source_body','full_text'].some(k=>Object.hasOwn(post,k)))throw new Error('WENDBINE_FULL_BODY_FIELD_REFUSED');
  if(post.time_precision!=='DAY'||typeof post.public_date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(post.public_date))throw new Error('WENDBINE_NATIVE_DAY_PRECISION_REQUIRED');
  for(const field of ['declared_concepts','source_flags'])if(!Array.isArray(post[field])||post[field].some(v=>typeof v!=='string'||!v))throw new Error('WENDBINE_TYPED_LABEL_ARRAY_REQUIRED');
 }
 if(registry?.schema!=='wendbine-typed-relation-registry/v0.1'||registry.snapshot_id!==meta.snapshot_id||JSON.stringify(registry.fields)!==JSON.stringify(FIELDS)||!Array.isArray(registry.relations))throw new Error('WENDBINE_TYPED_REGISTRY_CONTRACT');
 const seen=new Set();
 for(const row of registry.relations){
  if(!Array.isArray(row)||row.length!==FIELDS.length||row.some(v=>typeof v!=='string'||!v))throw new Error('WENDBINE_TYPED_RELATION_ROW');
  const [sid,graph,from,relation,to,evidence]=row;
  if(!ids.has(sid))throw new Error('WENDBINE_UNADMITTED_RELATION_SOURCE');
  if(!CONTRACT.graph_relation_vocabulary[graph]?.includes(relation))throw new Error('WENDBINE_UNSUPPORTED_GRAPH_RELATION');
  if(!CONTRACT.evidence_classes.includes(evidence))throw new Error('WENDBINE_UNSUPPORTED_EVIDENCE_CLASS');
  const key=JSON.stringify(row);if(seen.has(key))throw new Error('WENDBINE_DUPLICATE_RELATION_WITNESS');seen.add(key);
 }
 return registry.relations.map(row=>Object.fromEntries(FIELDS.map((field,i)=>[field,row[i]])));
}

export async function compileQualified({meta,posts,registry,compilerPath}){
 const input=structuredClone({meta,posts,registry});
 const relations=validateNativeInputs(input.meta,input.posts,input.registry);
 if(!path.isAbsolute(compilerPath))throw new Error('WENDBINE_ABSOLUTE_ORIGINAL_EXECUTABLE_REQUIRED');
 if(sha(fs.readFileSync(compilerPath))!==CONTRACT.native_executable_sha256)throw new Error('WENDBINE_NATIVE_EXECUTABLE_DRIFT');
 const native=await import(pathToFileURL(compilerPath).href);
 const result=native.compilePublicCorpus(input.meta,input.posts,relations);
 return {schema:'td613.wendbine.native-method-result/v1',native_revision:CONTRACT.native_revision,
  native_executable_sha256:CONTRACT.native_executable_sha256,successor_contract:CONTRACT.schema,
  native_output:result,native_result_sha256:sha(JSON.stringify(result)),
  scientific_classification:'BOUNDED_PUBLIC_TOPOLOGY_ONLY',receiver_admission_executed:false,
  original_scientific_states_changed:false};
}
