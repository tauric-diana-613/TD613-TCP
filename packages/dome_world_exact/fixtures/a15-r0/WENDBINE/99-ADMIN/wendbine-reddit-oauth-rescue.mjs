#!/usr/bin/env node
/**
 * Authorized, bounded, source-first rescue of the September 10–11 Wendbine P0 cohort.
 * Fetches one immutable Reddit post object at a time via the official OAuth endpoint.
 * Writes original response bytes and decoded source fields ONLY outside the public repo.
 * No authentication bypass, no cache/HTML paraphrase promotion, no full-text stdout.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateOriginal, sha256Utf8, assertPrivateDestination } from './wendbine-originals-intake.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');
const P0='01-MANIFESTS/foundational-sept10-11-originals-rescue-v01.json';
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export const sourceEndpoint = id => 'https://oauth.reddit.com/comments/'+encodeURIComponent(id)+'.json?limit=0&raw_json=1';

export function loadFoundationalTargets(root=ROOT){
  const obj=JSON.parse(fs.readFileSync(path.join(root,P0),'utf8'));
  if(obj.priority!=='P0_FOUNDATIONAL_ORIGINALS_BEFORE_TOPOLOGY_OR_TAXONOMY'||obj.records.length!==33)
    throw new Error('P0_ROSTER_IDENTITY_OR_CARDINALITY_CHANGED');
  const ids=new Set();
  for(const r of obj.records){
    if(!/^reddit:t3_[a-z0-9]+$/.test(r.source_id)||ids.has(r.source_id))throw new Error('P0_INVALID_OR_DUPLICATE_ID');
    const id=r.source_id.slice('reddit:t3_'.length);
    if(new URL(r.canonical_url).pathname.split('/')[3]!==id)throw new Error('P0_URL_ID_MISMATCH');
    ids.add(r.source_id);
  }
  return obj.records.map(r=>({source_id:r.source_id,canonical_url:r.canonical_url,publication_day_as_catalogued:r.publication_day_as_catalogued}));
}

export function parseRedditPostBytes(bytes,target,rightsBasis,observedAt){
  const raw=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);
  let data;
  try{ data=JSON.parse(raw.toString('utf8')); }catch{throw new Error('NON_JSON_RESPONSE');}
  const post=data?.[0]?.data?.children?.[0]?.data;
  if(!post||typeof post!=='object')throw new Error('POST_OBJECT_MISSING');
  const id=target.source_id.slice('reddit:t3_'.length);
  if(post.id!==id||post.name!=='t3_'+id)throw new Error('POST_ID_MISMATCH');
  if(String(post.author||'').toLowerCase()!=='upset-ratio502')throw new Error('POST_AUTHOR_MISMATCH');
  if(String(post.subreddit||'').toLowerCase()!=='wendbine')throw new Error('POST_SUBREDDIT_MISMATCH');
  if(typeof post.title!=='string'||typeof post.selftext!=='string')throw new Error('SOURCE_TITLE_OR_SELFTEXT_ABSENT');
  const permalink='/r/Wendbine/comments/'+id+'/';
  if(typeof post.permalink!=='string'||!post.permalink.toLowerCase().includes(permalink.toLowerCase()))
    throw new Error('POST_PERMALINK_MISMATCH');
  const contentUnavailable=post.removed_by_category!=null||post.selftext==='[removed]'||post.selftext==='[deleted]';
  if(contentUnavailable)throw new Error('POST_REMOVED_OR_DELETED_NOT_COMPLETE_TEXT');
  const postKind=post.is_self?'self':post.is_video||post.post_hint?.includes('video')?'media':'link';
  if(postKind==='self'&&!post.selftext.length)throw new Error('EMPTY_SELF_POST_NOT_COMPLETE');
  const source={
    source_id:target.source_id, canonical_url:target.canonical_url,
    author:post.author, subreddit:post.subreddit,
    source_capture_method:'REDDIT_API_OBJECT_WITH_PERMISSION',
    rights_basis:rightsBasis, post_kind:postKind,
    title:post.title, selftext:post.selftext,
    reddit_object_id:post.name, source_observed_at:observedAt,
    publication_timestamp:Number.isFinite(post.created_utc)?new Date(post.created_utc*1000).toISOString():null
  };
  validateOriginal(source,target);
  return {source,raw_sha256:sha256(raw),raw_byte_length:raw.length,source_title_sha256:sha256Utf8(post.title),source_body_sha256:sha256Utf8(post.selftext),source_title_utf8_bytes:Buffer.byteLength(post.title,'utf8'),source_body_utf8_bytes:Buffer.byteLength(post.selftext,'utf8'),source_edited_at:typeof post.edited==='number'?new Date(post.edited*1000).toISOString():post.edited===false?false:null,post_kind:postKind};
}

export async function acquireP0({ token,rightsBasis,destination,root=ROOT,fetchImpl=fetch,waitImpl=wait,delayMs=1100,targets=loadFoundationalTargets(root) }){
  if(typeof token!=='string'||!token.trim())throw new Error('REDDIT_OAUTH_TOKEN_REQUIRED');
  if(!['AUTHOR_PERMISSION','APPLICABLE_LICENSE','USER_ATTESTED_AUTHORIZED_COPY'].includes(rightsBasis))
    throw new Error('EXPLICIT_RIGHTS_BASIS_REQUIRED');
  if(!Number.isSafeInteger(delayMs)||delayMs<1000)throw new Error('THROTTLE_MUST_BE_AT_LEAST_1000_MS');
  const out=assertPrivateDestination(destination);
  if(fs.existsSync(out))throw new Error('REFUSE_OVERWRITE_EXISTING_CAPTURE_DIR');
  fs.mkdirSync(out,{recursive:true,mode:0o700});
  const success=[],failure=[];
  const writePrivate=(filename,value)=>fs.writeFileSync(path.join(out,filename),value,{flag:'wx',mode:0o600});
  for(let i=0;i<targets.length;i++){
    const target=targets[i],id=target.source_id.slice('reddit:t3_'.length);
    let status=null;
    try{
      const response=await fetchImpl(sourceEndpoint(id),{
        method:'GET',
        headers:{Authorization:'Bearer '+token, 'User-Agent':'TD613-Wendbine-P0-Research/0.1 (authorized source preservation)',Accept:'application/json'},
        redirect:'error'
      });
      status=response?.status??null;
      if(!response?.ok)throw new Error('HTTP_'+status);
      const bytes=Buffer.from(await response.arrayBuffer());
      const observedAt=new Date().toISOString();
      const result=parseRedditPostBytes(bytes,target,rightsBasis,observedAt);
      writePrivate('raw-'+id+'.json',bytes);
      writePrivate('source-'+id+'.json',JSON.stringify(result.source,null,2)+'\n');
      success.push({
        source_id:target.source_id,canonical_url:target.canonical_url,
        state:'AUTHORIZED_SOURCE_FIELDS_AND_RAW_RESPONSE_CUSTODIED',
        private_raw_response:'raw-'+id+'.json',private_source_fields:'source-'+id+'.json',
        http_status:status,observed_at:observedAt,
        raw_http_payload_sha256:result.raw_sha256,raw_http_payload_bytes:result.raw_byte_length,
        exact_title_sha256_utf8:result.source_title_sha256,exact_selftext_sha256_utf8:result.source_body_sha256,
        exact_title_utf8_bytes:result.source_title_utf8_bytes,exact_selftext_utf8_bytes:result.source_body_utf8_bytes,
        original_post_kind:result.post_kind,source_created_at:result.source.publication_timestamp,
        source_edited_at:result.source_edited_at,
        caveat:'SOURCE_FIELDS_CUSTODIED_FROM_OAUTH_RESPONSE_NOT_PROOF_OF_UNEDITED_FIRST_PUBLICATION'
      });
    }catch(error){
      failure.push({source_id:target.source_id,canonical_url:target.canonical_url,http_status:status,state:'FULL_TEXT_NOT_CUSTODIED',reason:String(error?.message||error).slice(0,240)});
    }
    // Preserve rate-limit safety. A 429/403 represents a stop condition, never retry/bypass.
    if(status===429||status===403){
      for(const rest of targets.slice(i+1))failure.push({source_id:rest.source_id,canonical_url:rest.canonical_url,http_status:null,state:'NOT_ATTEMPTED_AFTER_AUTH_OR_RATE_LIMIT_HOLD',reason:status===429?'UPSTREAM_RATE_LIMIT':'UPSTREAM_PERMISSION_DENIAL'});
      break;
    }
    if(i<targets.length-1)await waitImpl(delayMs);
  }
  const report={
    schema:'wendbine-p0-authorized-acquisition/v0.1',target_count:targets.length,
    success_count:success.length,failed_or_held_count:failure.length,
    reconciled:success.length+failure.length===targets.length,
    complete:success.length===targets.length,rights_basis: rightsBasis,
    source_method:'REDDIT_OAUTH_PER_POST_JSON',records:success,failures:failure,
    rule:'HTTP_200_PLUS_MATCHED_ID_AUTHOR_SUBREDDIT_AND_RAW_CAPTURE_REQUIRED_FOR_SUCCESS'
  };
  writePrivate('capture-report.json',JSON.stringify(report,null,2)+'\n');
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const destination=process.argv[2],rightsBasis=process.env.WENDBINE_SOURCE_RIGHTS_BASIS,token=process.env.REDDIT_ACCESS_TOKEN;
  if(!destination)throw new Error('Usage: REDDIT_ACCESS_TOKEN=<approved token> WENDBINE_SOURCE_RIGHTS_BASIS=<documented basis> node wendbine-reddit-oauth-rescue.mjs <private-dir-outside-repo>');
  const result=await acquireP0({token,rightsBasis,destination});
  process.stdout.write(JSON.stringify({targets:result.target_count,custodied:result.success_count,held:result.failed_or_held_count,reconciled:result.reconciled,complete:result.complete})+'\n');
  if(!result.complete)process.exitCode=1;
}
