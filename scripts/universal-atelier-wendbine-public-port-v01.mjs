/**
 * Universal Atelier · companion query bridge to *real* sealed Wendbine public
 * metadata. This is neither the historical missing Universal connector nor
 * a real-source admission path into PE05/B91 synthetic stores.
 *
 * Genuine native Wendbine read-only method is loaded from an independently
 * pinned Git checkout, with exact commit and Git blob verification. No
 * private ciphertext, original bot-output body, provider or mutable store.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export const PUBLIC_WEND_SOURCE=Object.freeze({
 git_head:'2d71913fa0cb099d6835a1e86943ef440951c825',
 native_module_blob:'0a8c2e1b374e25a01d4295dab69bc3724a10a403',
 native_relative:'99-ADMIN/wendbine-sealed-public-research-v01.mjs',
 snapshot:'wendbine-20261104014208-6d200e3ff3a0',
 seal:'wendbine-seal:6d200e3ff3a0d7d79d7a135d676141fea8dfab3ae9496b525c5a93b55e31edf2',
 source_count:2062,capture_count:6763,typed_edges:6703,
 source_evidence:'PUBLIC_METADATA_ONLY',
 original_bot_output_bodies:'NOT_ADMITTED'
});
const error=code=>{throw Object.assign(Error(code),{code})};
const need=(ok,code)=>{if(!ok)error(code)};
const strict=(value,allowed)=>{
 need(value&&Object.getPrototypeOf(value)===Object.prototype,'UAT_QUERY_PLAIN_OBJECT_REQUIRED');
 const descriptors=Object.getOwnPropertyDescriptors(value);
 for(const [name,d] of Object.entries(descriptors))
  need('value' in d&&!['__proto__','constructor','prototype'].includes(name)&&allowed.includes(name),
   'UAT_QUERY_ACCESSOR_OR_UNKNOWN_FIELD_REFUSED');
 return value;
};
const gitBlob=(bytes)=>createHash('sha1')
 .update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
function realDirectory(dir){
 need(typeof dir==='string'&&path.isAbsolute(dir)&&fs.existsSync(dir)&&
   fs.lstatSync(dir).isDirectory()&&!fs.lstatSync(dir).isSymbolicLink()&&
   fs.realpathSync(dir)===dir,'UAT_WEND_READONLY_REAL_DIR_REQUIRED');
 return dir;
}
/** Connect to an *external* public research checkout, never copy source data. */
export async function openUniversalWendbinePort({wendbineRoot,universalAtelier}={}){
 const root=realDirectory(wendbineRoot);
 const sha=spawnSync('git',['-C',root,'rev-parse','HEAD'],{
  encoding:'utf8',timeout:7000,maxBuffer:2048});
 need(sha.status===0&&sha.stdout.trim()===PUBLIC_WEND_SOURCE.git_head,
   'UAT_WEND_NATIVE_EXACT_COMMIT_REQUIRED');
 const modulePath=path.join(root,PUBLIC_WEND_SOURCE.native_relative);
 need(fs.existsSync(modulePath)&&fs.lstatSync(modulePath).isFile()&&
  !fs.lstatSync(modulePath).isSymbolicLink()&&
  fs.realpathSync(modulePath)===modulePath,'UAT_WEND_NATIVE_FILE_SUBSTITUTED');
 const bytes=fs.readFileSync(modulePath);
 need(gitBlob(bytes)===PUBLIC_WEND_SOURCE.native_module_blob,
  'UAT_WEND_NATIVE_MODULE_BLOB_DRIFT');
 need(universalAtelier&&typeof universalAtelier.request==='function','UAT_ACTUAL_ATELIER_INTERFACE_REQUIRED');
 const before=await universalAtelier.request({action:'status'});
 need(before.product_id==='TD613_UNIVERSAL_ATELIER_B8_CANDIDATE'&&
  before.state==='EMPTY_OR_SYNTHETIC_ONLY'&&
  before.real_sources_admitted===0&&before.source_authorized===false,
  'UAT_PRIVATE_OR_HISTORICAL_PRODUCT_NOT_ELIGIBLE');
 const native=await import(pathToFileURL(modulePath).href);
 const r=native.openSealedPublicResearch({
  root,snapshotId:PUBLIC_WEND_SOURCE.snapshot,sealId:PUBLIC_WEND_SOURCE.seal});
 need(r.source_count===PUBLIC_WEND_SOURCE.source_count&&
  r.capture_count===PUBLIC_WEND_SOURCE.capture_count&&
  r.edge_count===PUBLIC_WEND_SOURCE.typed_edges,'UAT_WEND_PUBLIC_CARDINALITY_MISMATCH');
 const allowed=Object.freeze(['summary','search','map','source','readiness']);
 const read=async q=>{
  strict(q,['action','query','limit','entityId','graph','depth','sourceId']);
  need(allowed.includes(q.action),'UAT_ORIGINALS_AND_UNSUPPORTED_ACTION_HELD');
  const then=await universalAtelier.request({action:'status'});
  need(then.instance_id===before.instance_id&&then.real_sources_admitted===0&&
   then.source_authorized===false,'UAT_PRODUCT_DRIFT_OR_REAL_ADMISSION_REFUSED');
  const result=q.action==='summary'?native.summaryPublicTopology(r):
   q.action==='search'?native.searchPublicMetadata(r,{query:q.query,limit:q.limit??20}):
   q.action==='map'?native.neighborhood(r,{
    entityId:q.entityId,graph:q.graph??null,depth:q.depth??1}):
   q.action==='source'?native.resolvePublicSource(r,{sourceId:q.sourceId}):
   native.researchReadiness(r,{query:q.query??'Experiment B Flight'});
  return Object.freeze({
   schema:'td613.universal-atelier.wendbine-public-query-result/v1',
   research_product:'TD613_UNIVERSAL_ATELIER_B8_CANDIDATE',
   source_native:'WENDBINE_SEALED_PUBLIC',
   source_head:PUBLIC_WEND_SOURCE.git_head,
   source_seal:PUBLIC_WEND_SOURCE.seal,
   native_method_executed:q.action,
   source_bytes_copied_to_universal_product:0,
   original_source_bodies_admitted:0,
   returned_read_only_public_metadata:true,
   source_credential_or_rights_granted:false,
   provider_or_model_calls:0,
   private_fulltext:'HELD_NOT_AUTHORIZED',
   method_claim:'REAL_PUBLIC_NATIVE_METHOD_COMPANION_NOT_RESTORED_HISTORICAL_CONNECTOR',
   result
  });
 };
 return Object.freeze({
  port:'WENDBINE_PUBLIC_RESEARCH_COMPANION',
  mode:'READ_ONLY_NATIVE_METHOD_NO_SOURCE_ADMISSION',
  requested_source:PUBLIC_WEND_SOURCE,
  product_instance_id:before.instance_id,
  request:read
 });
}
