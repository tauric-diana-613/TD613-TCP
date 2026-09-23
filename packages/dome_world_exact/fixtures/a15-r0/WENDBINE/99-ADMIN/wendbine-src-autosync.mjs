#!/usr/bin/env node
/**
 * Wendbine / SRC-compatible public projection autosync.
 *
 * Source-of-truth: append-only portable JSONL + JSON seals, never SQLite.
 * Private source bytes: hybrid-encrypted GitHub artifact or an external vault.
 * One fresh operator gesture on gate #1308 activates one bounded run; no cron.
 * No source content is written to the public Git projection or console.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const utf8=x=>Buffer.from(x,'utf8');
const stable=(prefix,...parts)=>prefix+':'+sha(parts.join('\x1f')).slice(0,24);
const json=o=>JSON.stringify(o,null,2)+'\n';
const parseLines=p=>fs.existsSync(p)?fs.readFileSync(p,'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse):[];
const canonical=o=>JSON.stringify(o,Object.keys(o).sort());
const stamp=()=>new Date().toISOString();
export const SCHEMA='wendbine-src-autosync/v0.1';
export const AUTHOR='Upset-Ratio502',SUBREDDIT='Wendbine';
export const BASE='https://arctic-shift.photon-reddit.com/api/posts/search';
export const DATE_FLOOR='2026-09-09';
export const REL='01-MANIFESTS/phase2';
export const KEY=path.join(HERE,'20260922-one-time-rescue-public-key.pem');
export function queryUrl(after=DATE_FLOOR,limit=100){
 const u=new URL(BASE);
 u.searchParams.set('author',AUTHOR);
 u.searchParams.set('subreddit',SUBREDDIT);
 u.searchParams.set('after',after);
 u.searchParams.set('sort','asc');
 u.searchParams.set('limit',String(limit));
 return u.toString();
}
export function checkPost(o){
 const id=String(o?.id||'').replace(/^t3_/,'');
 if(!/^[a-z0-9]{5,12}$/.test(id))return {state:'SOURCE_ID_INVALID'};
 if(String(o.author||'').toLowerCase()!==AUTHOR.toLowerCase())return {state:'AUTHOR_MISMATCH',id};
 if(String(o.subreddit||'').toLowerCase()!==SUBREDDIT.toLowerCase())return {state:'SUBREDDIT_MISMATCH',id};
 if(typeof o.title!=='string'||typeof o.selftext!=='string')return {state:'SOURCE_FIELDS_MISSING',id};
 if(!Number.isFinite(Number(o.created_utc))||Number(o.created_utc)<=0)return {state:'SOURCE_TIME_INVALID',id};
 const removed=o.removed_by_category!=null||['[removed]','[deleted]'].includes(o.selftext.trim());
 const media=o.is_self===false||o.is_video===true||Boolean(o.post_hint?.includes('video'));
 const state=removed?'HELD_REMOVED_OR_DELETED':o.selftext===''?(media?'VERIFIED_EMPTY_MEDIA_OR_LINK_BODY':'HELD_EMPTY_TEXT_BODY'):'ARCHIVED_TEXT_BODY_PRESENT';
 const permalink=typeof o.permalink==='string'&&new RegExp('^/r/Wendbine/comments/'+id+'(?:/[^?#]*)?$','i').test(o.permalink)?o.permalink:null;
 const url='https://www.reddit.com'+(permalink||'/r/Wendbine/comments/'+id+'/');
 return {state,id,source_id:'reddit:t3_'+id,canonical_url:url,author:AUTHOR,subreddit:SUBREDDIT,
   source_created_utc:Number(o.created_utc),source_edited:o.edited??null,
   archive_retrieved_on:o.retrieved_on??null,body_state:state,media_or_link_post:media,
   title:o.title,selftext:o.selftext,
   title_sha256_utf8:sha(utf8(o.title)),body_sha256_utf8:sha(utf8(o.selftext)),
   title_utf8_bytes:Buffer.byteLength(o.title,'utf8'),body_utf8_bytes:Buffer.byteLength(o.selftext,'utf8')};
}
export async function discover({fetchImpl=fetch,start=DATE_FLOOR,maxPages=30,pageSize=100,timeoutMs=18000}={}){
 const seen=new Map(),batches=[],errors=[];
 let cursor=start;
 for(let page=0;page<maxPages;page++){
  const url=queryUrl(cursor,pageSize);
  const response=await fetchImpl(url,{method:'GET',headers:{Accept:'application/json',
   'User-Agent':'TD613-Wendbine-SRC-Atelier/0.1'},redirect:'error',signal:AbortSignal.timeout(timeoutMs)});
  if(!response?.ok)throw new Error('ARCHIVE_DISCOVERY_HTTP_'+(response?.status??'UNKNOWN'));
  const raw=Buffer.from(await response.arrayBuffer());
  if(raw.length>8*1024*1024)throw new Error('ARCHIVE_PAGE_EXCEEDS_8MB');
  let parsed;
  try{parsed=JSON.parse(raw.toString('utf8'))}catch{throw new Error('ARCHIVE_NON_JSON_RESPONSE')}
  const objs=Array.isArray(parsed)?parsed:parsed?.data;
  if(!Array.isArray(objs))throw new Error('ARCHIVE_UNRECOGNIZED_RESPONSE_SHAPE');
  if(page===0&&objs.length===0)throw new Error('ARCHIVE_ZERO_RESULTS_NOT_EVIDENCE_OF_AUTHOR_ABSENCE');
  const before=seen.size;
  const responseHash=sha(raw);
  for(const [sourceObjectIndex,item] of objs.entries()){
   const checked=checkPost(item);
   if(checked.source_id){checked.archive_response_sha256=responseHash;checked.archive_response_bytes=raw.length;checked.source_object_index=sourceObjectIndex;}
   if(!checked.source_id){errors.push({page,id:checked.id??null,state:checked.state});continue}
   const current=seen.get(checked.source_id);
   if(current&&(current.title_sha256_utf8!==checked.title_sha256_utf8||current.body_sha256_utf8!==checked.body_sha256_utf8))
    errors.push({page,source_id:checked.source_id,state:'CONFLICTING_COPIES_SAME_PASS'});
   else seen.set(checked.source_id,checked);
  }
  batches.push({page,url,raw_sha256:sha(raw),raw_byte_length:raw.length,raw_b64:raw.toString('base64'),
   returned:objs.length});
  if(objs.length<pageSize)return {posts:[...seen.values()],batches,errors,complete:true,
   coverage:'ARCHIVE_AUTHOR_SUBREDDIT_SEARCH_NOT_LIVE_REDDIT_CENSUS'};
  const times=objs.map(x=>Number(x?.created_utc)).filter(Number.isFinite);
  if(!times.length||seen.size===before)throw new Error('ARCHIVE_PAGINATION_STALLED');
  // Overlap the last second: posts sharing that timestamp are not silently lost.
  const last=Math.max(...times);
  const next=new Date((last-1)*1000).toISOString();
  if(next<=cursor)throw new Error('ARCHIVE_PAGINATION_CURSOR_NOT_ADVANCING');
  cursor=next;
 }
 throw new Error('ARCHIVE_PAGINATION_MAX_PAGES_REACHED');
}
function receiptBaseline(root=ROOT){
 const files=['p0-archived-source-field-receipts-20260922-v06.json',
  'p1p2-archived-source-field-receipts-20260922-v07.json'];
 const rows=[];
 for(const filename of files){
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'01-MANIFESTS',filename),'utf8'));
  for(const r of manifest.records){
   const copy=r.archive_copies?.[0]||r;
   rows.push({source_id:r.source_id,canonical_url:r.canonical_url,source_created_utc:copy.source_created_utc,
    source_edited:copy.source_edited??null,title_sha256_utf8:copy.title_sha256_utf8,
    body_sha256_utf8:copy.body_sha256_utf8,body_utf8_bytes:copy.body_utf8_bytes,
    body_state:copy.body_state??'ARCHIVED_TEXT_BODY_PRESENT',provider:'ARCTIC_SHIFT',
    archive_retrieved_on:copy.archive_retrieved_on??null,
    archive_response_sha256:manifest.raw_http_payload_sha256??null,
    archive_response_bytes:manifest.raw_http_payload_bytes??null,
    title:r.reddit_title_exact??null,bootstrap_receipt:'01-MANIFESTS/'+filename});
  }
 }
 if(rows.length!==60||new Set(rows.map(r=>r.source_id)).size!==60)throw new Error('BASELINE_60_SOURCE_RECEIPTS_REQUIRED');
 return rows;
}
const outputFiles={
 manifestations:REL+'/manifestations.jsonl',
 captures:REL+'/capture-v2.jsonl',
 blobs:REL+'/blob-v1.jsonl',
 derivatives:REL+'/derivative-v1.jsonl',
 rights:REL+'/rights-decision-v1.jsonl',
 resolver:REL+'/entity-resolver-v2.jsonl',
 versions:'05-OPERATIONS/phase2/version-observations.jsonl',
 relations:'05-OPERATIONS/relations/typed-edges.jsonl',
 seal:'04-RECEIPTS/phase2/current-seal.json'
};
function initialState(root){
 const base=receiptBaseline(root);
 const out={manifestations:[],captures:[],blobs:[],derivatives:[],rights:[],resolver:[],versions:[],relations:[]};
 for(const r of base)addVersion(out,r,'HISTORICAL_BOOTSTRAP_FROM_VERIFIED_PUBLIC_RECEIPT','2026-09-22T00:00:00Z');
 return out;
}
function addVersion(s,r,event,observedAt){
 const manifest='reddit:manifestation:'+r.source_id.slice('reddit:t3_'.length);
 // SRC capture identity is time-indexed, even when the content-addressed blob is unchanged.
 const capture=stable('wendbine:capture',r.source_id,r.title_sha256_utf8,r.body_sha256_utf8,observedAt);
 const blob='sha256:'+r.body_sha256_utf8;
 const derivative=stable('wendbine:derivative',capture,'EXACT_UTF8_TEXT');
 if(!s.manifestations.some(x=>x.manifestation_id===manifest))s.manifestations.push({
  schema:'wendbine-manifestation/v1',manifestation_id:manifest,source_id:r.source_id,
  canonical_url:r.canonical_url,platform:'reddit',platform_account:AUTHOR,subreddit:SUBREDDIT,
  platform_title:r.title??null,
  platform_title_status:r.title?'EXACT_ARCHIVE_OBSERVED_TITLE':'TITLE_HASH_ONLY_PUBLIC_RESEARCH_PROJECTION',
  published_at:new Date(r.source_created_utc*1000).toISOString(),
  work_id:null,edition_id:null,work_identity_status:'UNADJUDICATED'});
 if(!s.rights.some(x=>x.manifestation_id===manifest))s.rights.push({
  schema:'rights-decision/v1',decision_id:stable('rights',manifest),manifestation_id:manifest,
  decision:'PRIVATE_ONLY',basis:'Public Reddit accessibility does not grant republication rights.'});
 if(s.captures.some(x=>x.capture_id===capture))return {capture_id:capture,new_capture:false};
 s.captures.push({schema:'capture/v2',capture_id:capture,manifestation_id:manifest,source_id:r.source_id,
  observed_at:observedAt,source_created_utc:r.source_created_utc,source_edited:r.source_edited,
  archive_retrieved_on:r.archive_retrieved_on??null,provider:r.provider??'ARCTIC_SHIFT',
  archive_response_sha256:r.archive_response_sha256??null,archive_response_bytes:r.archive_response_bytes??null,
  source_object_index:r.source_object_index??null,bootstrap_receipt:r.bootstrap_receipt??null,
  title_sha256_utf8:r.title_sha256_utf8,body_sha256_utf8:r.body_sha256_utf8,
  body_utf8_bytes:r.body_utf8_bytes,body_state:r.body_state,
  source_version:'ARCHIVE_OBSERVED_NOT_VERIFIED_FIRST_PUBLICATION_OR_CURRENT_LIVE',
  private_locator:stable('wendbine-private-locator',capture),
  private_custody_status:event==='HISTORICAL_BOOTSTRAP_FROM_VERIFIED_PUBLIC_RECEIPT'?
   'PRIOR_PRIVATE_ARCHIVE_CUSTODY_VERIFIED_BY_V06_V07':'REQUIRES_ENCRYPTED_ARTIFACT_OR_PRIVATE_VAULT'});
 if(!s.blobs.some(x=>x.blob_id===blob))s.blobs.push({schema:'blob/v1',blob_id:blob,
  sha256:r.body_sha256_utf8,byte_length:r.body_utf8_bytes,
  custody_locator:stable('wendbine-private-locator',capture),local_path:null,rights_state:'PRIVATE_ONLY'});
 s.derivatives.push({schema:'derivative/v1',derivative_id:derivative,capture_id:capture,
  source_blob_id:blob,derivative_kind:'EXACT_UTF8_SOURCE_TEXT_PRIVATE',
  tool_version:'wendbine-src-autosync/v0.1',public_body_exposed:false});
 s.resolver.push({schema:'src-entity-resolver/v2',entity_id:capture,entity_type:'capture',
  definition_status:'DEFINED',path:outputFiles.captures,source_id:r.source_id});
 s.versions.push({schema:'wendbine-version-observation/v1',version_event_id:stable('version',capture),
  manifestation_id:manifest,capture_id:capture,observed_at:observedAt,event,
  body_sha256_utf8:r.body_sha256_utf8,title_sha256_utf8:r.title_sha256_utf8,
  first_publication_version_verified:false,current_live_reddit_state_verified:false});
 return {capture_id:capture,new_capture:true};
}
export function compileSync({observed,previous=null,root=ROOT,observedAt=stamp(),rawHashes=[]}){
 if(!Array.isArray(observed))throw new Error('OBSERVED_POSTS_REQUIRED');
 const s=previous?structuredClone(previous):initialState(root);
 const old=new Map();
 for(const r of s.captures){
  const current=old.get(r.source_id);
  if(!current||String(r.observed_at||'')>String(current.observed_at||''))old.set(r.source_id,r);
 }
 const previouslyKnown=new Set(s.manifestations.map(x=>x.source_id));
 const valid=[],held=[],seen=new Set(),newIds=[],changedIds=[],unchangedIds=[];
 for(const obj of observed){
  const r=obj?.source_id?obj:checkPost(obj);
  if(!r.source_id||seen.has(r.source_id)){held.push({source_id:r.source_id??null,state:'INVALID_OR_DUPLICATE'});continue}
  seen.add(r.source_id);
  if(r.body_state.startsWith('HELD_')){
   held.push({source_id:r.source_id,canonical_url:r.canonical_url,state:r.body_state,
    source_created_utc:r.source_created_utc,archive_response_sha256:r.archive_response_sha256??null,
    source_object_index:r.source_object_index??null,title_sha256_utf8:r.title_sha256_utf8,
    body_sha256_utf8:r.body_sha256_utf8,promoted_original:false});
   continue;
  }
  const prior=old.get(r.source_id);
  if(!prior)newIds.push(r.source_id);
  else if(prior.title_sha256_utf8!==r.title_sha256_utf8||prior.body_sha256_utf8!==r.body_sha256_utf8)changedIds.push(r.source_id);
  else unchangedIds.push(r.source_id);
  const result=addVersion(s,r,!previouslyKnown.has(r.source_id)?'NEW_SOURCE':
   !prior||prior.title_sha256_utf8!==r.title_sha256_utf8||prior.body_sha256_utf8!==r.body_sha256_utf8?'ARCHIVED_VERSION_CHANGE':'ALREADY_CURRENT',observedAt);
  // Manifestation graph edges are facts about archived source objects, never
  // hypotheses about hidden memory, lineage, or semantic identity.
  const sourceManifest='reddit:manifestation:'+r.source_id.slice('reddit:t3_'.length);
  const manifestEdge=stable('wendbine:edge',sourceManifest,'HAS_CAPTURE',result.capture_id);
  if(!s.relations.some(e=>e.edge_id===manifestEdge))s.relations.push({
   schema:'relation-assertion/v2',edge_id:manifestEdge,graph:'MANIFESTATION',
   source_entity_id:sourceManifest,target_entity_id:result.capture_id,
   relation:'HAS_CAPTURE',origin:'ARCHIVE_OBSERVED_FIELD_HASH',
   temporal_provenance:'CONTEMPORANEOUS',capture_id:result.capture_id,
   evidence_locator:{source_id:r.source_id,field_sha256_utf8:r.body_sha256_utf8},
   reviewer_status:'MACHINE_VERIFIABLE_PLATFORM_LINK',author_intent_claim:false});
  // Only exact, source-bound URLs may establish a navigational edge.
  // Mere lexical recurrence never creates an intellectual or causal relation.
  // Bind only explicit HTTPS Reddit URLs with an exact allowed host.
  // Foreign-host lookalikes and bare paths carry no navigational authority.
  const re=/https:\/\/(?:www\.|old\.)?reddit\.com\/r\/Wendbine\/comments\/([a-z0-9]{5,12})(?=\/|[?#)\]\s]|$)/ig;
  for(const m of r.selftext.matchAll(re)){
   const target='reddit:t3_'+m[1].toLowerCase();
   if(!previouslyKnown.has(target)&&!observed.some(o=>o.source_id===target))continue;
   const edgeId=stable('wendbine:edge',result.capture_id,'NAVIGATES_TO',target,String(m.index));
   if(!s.relations.some(e=>e.edge_id===edgeId))s.relations.push({
    schema:'relation-assertion/v2',edge_id:edgeId,graph:'NAVIGATIONAL',
    source_entity_id:sourceManifest,target_entity_id:'reddit:manifestation:'+m[1].toLowerCase(),
    relation:'NAVIGATES_TO',origin:'EXACT_SOURCE_URL_SPAN',temporal_provenance:'CONTEMPORANEOUS',
    capture_id:result.capture_id,evidence_locator:{field:'selftext',start_utf16:m.index,end_utf16:m.index+m[0].length,body_sha256_utf8:r.body_sha256_utf8},
    reviewer_status:'SOURCE_LITERAL_ONLY',author_intent_claim:false});
  }
  valid.push({source_id:r.source_id,capture_id:result.capture_id,new_capture:result.new_capture});
 }
 const absent=[...previouslyKnown].filter(id=>!seen.has(id)).sort();
 const audit={schema:SCHEMA,observed_at:observedAt,discovery_total:observed.length,
  accepted:valid.length,held:held.length,held_observations:held,unexplained_remainder:observed.length-valid.length-held.length,
  existing_manifestations:previouslyKnown.size,new_source_ids:newIds.sort(),changed_source_ids:changedIds.sort(),
  unchanged_source_ids:unchangedIds.sort(),not_seen_prior_source_ids:absent,
  capture_added:valid.filter(x=>x.new_capture).length,raw_provider_hashes:rawHashes,
  availability_claim:'NOT_SEEN_THIS_PASS_DOES_NOT_MEAN_DELETED',
  private_custody_claim:'ENCRYPTED_HANDOFF_REQUIRED_BEFORE_COMPLETE_SOURCE_CUSTODY',
  source_claim_ceiling:'ARCHIVE_VERSION_NOT_FIRST_PUBLICATION_OR_LIVE_REDDIT'};
 if(audit.unexplained_remainder!==0)throw new Error('FAILED_CAPTURE_RECONCILIATION');
 return {state:s,audit};
}
function sortJsonl(rows,key){return rows.slice().sort((a,b)=>String(a[key]??'').localeCompare(String(b[key]??''))).map(x=>JSON.stringify(x)).join('\n')+(rows.length?'\n':'');}
function sealPayload(payload,publicPem){
 const key=crypto.randomBytes(32),iv=crypto.randomBytes(12);
 const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
 cipher.setAAD(utf8(SCHEMA));
 const ciphertext=Buffer.concat([cipher.update(zlib.gzipSync(utf8(JSON.stringify(payload)))),cipher.final()]);
 const wrapped=crypto.publicEncrypt({key:publicPem,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},key);key.fill(0);
 return {schema:SCHEMA,crypto:'AES-256-GCM+RSA-OAEP-SHA256',compression:'gzip',
  public_key_sha256:sha(utf8(publicPem)),iv_b64:iv.toString('base64'),
  tag_b64:cipher.getAuthTag().toString('base64'),sealed_key_b64:wrapped.toString('base64'),
  ciphertext_b64:ciphertext.toString('base64')};
}
export function writeProjection({compiled,outRoot,observedAt,encryptedPayload=null,publicPem=null,artifactPath=null}){
 const s=compiled.state,a=compiled.audit;
 if(a.unexplained_remainder!==0)throw new Error('FAILED_CAPTURE_RECONCILIATION');
 if(encryptedPayload&&!publicPem)throw new Error('PUBLIC_KEY_REQUIRED_FOR_PRIVATE_HANDOFF');
 if(encryptedPayload&&!artifactPath)throw new Error('ENCRYPTED_ARTIFACT_PATH_REQUIRED');
 const created=[];
 for(const [key,rel] of Object.entries(outputFiles)){
  if(key==='seal')continue;
  const file=path.join(outRoot,rel);fs.mkdirSync(path.dirname(file),{recursive:true});
  const primary={manifestations:'manifestation_id',captures:'capture_id',blobs:'blob_id',
   derivatives:'derivative_id',rights:'decision_id',resolver:'entity_id',versions:'version_event_id',relations:'edge_id'}[key];
  const data=sortJsonl(s[key],primary);
  fs.writeFileSync(file,data,{mode:0o644});created.push({path:rel,sha256:sha(utf8(data)),count:s[key].length});
 }
 const seal=sha(utf8(JSON.stringify(created)));
 const snapshot='wendbine-'+observedAt.replace(/[^0-9]/g,'').slice(0,14)+'-'+seal.slice(0,12);
 const runPath='07-ARCHIVE-LEDGER/syncs/'+snapshot+'.json';
 const registry={schema_version:'wendbine-src-interface-registry/v1',portable_source_of_truth:'JSONL_AND_MARKDOWN',
   sqlite_role:'RESUMABLE_WORK_JOURNAL_OR_PRIVATE_DERIVATIVE_ONLY',
   src_reference:'SRC/01-MANIFESTS/phase2/interface-registry.json',
   interfaces:created.map(x=>({path:x.path,count:x.count,sha256:x.sha256})),
   epoch_path:outputFiles.seal,
   non_collapse:'work != edition != manifestation != capture != blob != derivative != authority'};
 const interfacePath=path.join(outRoot,'01-MANIFESTS/phase2/interface-registry.json');
 fs.writeFileSync(interfacePath,json(registry));
 const index={schema_version:'connector-registry-index/v1',atelier:'WENDBINE',snapshot_id:snapshot,
   current_seal:outputFiles.seal,entity_resolver:outputFiles.resolver,
   evidence_resolver:outputFiles.captures,
   registries:created.map(x=>({path:x.path,count:x.count,sha256:x.sha256}))};
 fs.writeFileSync(path.join(outRoot,'01-MANIFESTS/registry-index.json'),json(index));
 const receipt={...a,atelier_snapshot_id:snapshot,seal_id:'wendbine-seal:'+seal,
  public_projection_files:created,encrypted_handoff_created:!!encryptedPayload};
 const runFile=path.join(outRoot,runPath);fs.mkdirSync(path.dirname(runFile),{recursive:true});
 if(fs.existsSync(runFile))throw new Error('REFUSE_OVERWRITE_ARCHIVE_RUN');
 fs.writeFileSync(runFile,json(receipt));
 const sealData={schema:'wendbine-src-seal/v1',atelier_snapshot_id:snapshot,seal_id:'wendbine-seal:'+seal,
  path:runPath,created_at:observedAt,projection:'PUBLIC_METADATA_ONLY',file_hashes:created,
  interface_registry_sha256:sha(fs.readFileSync(interfacePath)),
  registry_index_sha256:sha(fs.readFileSync(path.join(outRoot,'01-MANIFESTS/registry-index.json'))),
  private_source_fields_available_to_public_connector:false,
  source_count:s.manifestations.length,capture_count:s.captures.length};
 const sealFile=path.join(outRoot,outputFiles.seal);
 fs.mkdirSync(path.dirname(sealFile),{recursive:true});fs.writeFileSync(sealFile,json(sealData));
 if(encryptedPayload){
  const envelope=sealPayload(encryptedPayload,publicPem);
  fs.mkdirSync(path.dirname(artifactPath),{recursive:true,mode:0o700});
  fs.writeFileSync(artifactPath,json(envelope),{flag:'wx',mode:0o600});
 }
 return {snapshot,seal:sealData,receipt};
}
export function loadState(root=ROOT){
 const manifestPath=path.join(root,outputFiles.manifestations);
 if(!fs.existsSync(manifestPath))return null;
 const sealPath=path.join(root,outputFiles.seal);
 if(!fs.existsSync(sealPath))throw new Error('PREVIOUS_PROJECTION_SEAL_MISSING');
 const seal=JSON.parse(fs.readFileSync(sealPath,'utf8'));
 if(seal.schema!=='wendbine-src-seal/v1'||!Array.isArray(seal.file_hashes)||
    'wendbine-seal:'+sha(utf8(JSON.stringify(seal.file_hashes)))!==seal.seal_id)
   throw new Error('PREVIOUS_PROJECTION_SEAL_INVALID');
 for(const r of seal.file_hashes){
  if(!Object.values(outputFiles).includes(r.path)||r.path===outputFiles.seal)
   throw new Error('PREVIOUS_PROJECTION_FILE_UNRECOGNIZED');
  const file=path.resolve(root,r.path);
  if(!file.startsWith(path.resolve(root)+path.sep)||!fs.existsSync(file)||
    sha(fs.readFileSync(file))!==r.sha256)
   throw new Error('PREVIOUS_PROJECTION_HASH_MISMATCH_'+r.path);
 }
 const result={};
 for(const [key,rel] of Object.entries(outputFiles))if(key!=='seal')result[key]=parseLines(path.join(root,rel));
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 const get=name=>args.includes(name)?args[args.indexOf(name)+1]:null;
 const dest=get('--output-root')||ROOT;
 const encrypted=get('--encrypted-output');
 const fixture=get('--fixture');
 const observedAt=stamp();
 const fetched=fixture?(()=>{
  const posts=JSON.parse(fs.readFileSync(fixture,'utf8'));
  return {posts,batches:[],errors:[],complete:true,coverage:'SYNTHETIC_FIXTURE_ONLY'};
 })():await discover();
 if(!fetched.complete||fetched.errors.length)throw new Error('SOURCE_DISCOVERY_INCOMPLETE_OR_INVALID');
 const previous=loadState(dest);
 const compiled=compileSync({observed:fetched.posts,previous,observedAt,
  rawHashes:fetched.batches.map(b=>({page:b.page,raw_sha256:b.raw_sha256,bytes:b.raw_byte_length}))});
 const privatePayload={schema:SCHEMA,acquired_at:observedAt,provider:'ARCTIC_SHIFT',
  posts:fetched.posts,raw_batches:fetched.batches,claim_ceiling:'ARCHIVE_OBSERVED_NOT_LIVE_REDDIT'};
 const r=writeProjection({compiled,outRoot:dest,observedAt,
  encryptedPayload:encrypted?privatePayload:null,
  publicPem:encrypted?fs.readFileSync(KEY,'utf8'):null,artifactPath:encrypted});
 // Deliberately no title, selftext, snippets or raw response bytes in logs.
 process.stdout.write(json({atelier_snapshot_id:r.snapshot,seal_id:r.seal.seal_id,
  observed:r.receipt.discovery_total,new:r.receipt.new_source_ids.length,
  changed:r.receipt.changed_source_ids.length,unchanged:r.receipt.unchanged_source_ids.length,
  not_seen_prior:r.receipt.not_seen_prior_source_ids.length,held:r.receipt.held,
  encrypted_handoff_created:r.receipt.encrypted_handoff_created}));
}
