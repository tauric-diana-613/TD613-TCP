#!/usr/bin/env node
/**
 * Source-ID-first public archive coverage probe for Wendbine's 33 P0 posts.
 * No source bodies in stdout, GitHub, CI logs or the public results file.
 * Retrieval provenance is explicit; archive availability is not live-state proof.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadFoundationalTargets} from './wendbine-reddit-oauth-rescue.mjs';
import {assertPrivateDestination,sha256Utf8} from './wendbine-originals-intake.mjs';

const sha256 = bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const here=path.dirname(fileURLToPath(import.meta.url));
export const PROVIDERS=Object.freeze([
 {name:'ARCTIC_SHIFT',base:'https://arctic-shift.photon-reddit.com/api/posts/ids',param:'ids'},
 {name:'PULLPUSH',base:'https://api.pullpush.io/reddit/search/submission/',param:'ids'}
]);
export function providerUrl(provider,targets){
 if(!PROVIDERS.some(p=>p.name===provider.name&&p.base===provider.base))throw new Error('UNRECOGNIZED_ARCHIVE_PROVIDER');
 const u=new URL(provider.base);
 u.searchParams.set(provider.param,targets.map(t=>t.source_id.slice('reddit:t3_'.length)).join(','));
 return u.toString();
}
export function parseArchiveEnvelope(bytes,provider){
 let payload;
 try{payload=JSON.parse(Buffer.from(bytes).toString('utf8'));}catch{throw new Error(provider.name+'_NON_JSON_RESPONSE');}
 const records=Array.isArray(payload)?payload:payload?.data;
 if(!Array.isArray(records))throw new Error(provider.name+'_UNRECOGNIZED_RESPONSE_SHAPE');
 return records;
}
export function assessArchiveObject(obj,target,provider){
 const id=target.source_id.slice('reddit:t3_'.length);
 if(!obj||String(obj.id||'').replace(/^t3_/,'')!==id)return {state:'UNMATCHED_ID'};
 if(String(obj.author||'').toLowerCase()!=='upset-ratio502')return {state:'AUTHOR_MISMATCH'};
 if(String(obj.subreddit||'').toLowerCase()!=='wendbine')return {state:'SUBREDDIT_MISMATCH'};
 if(typeof obj.title!=='string'||typeof obj.selftext!=='string')return {state:'TITLE_OR_BODY_FIELD_MISSING'};
 if(obj.removed_by_category!=null||['[removed]','[deleted]'].includes(obj.selftext.trim()))
  return {state:'DELETED_OR_REMOVED_BODY_NOT_ADMITTED'};
 if(!obj.selftext.length)return {state:'EMPTY_BODY_NEEDS_POST_KIND_REVIEW'};
 const published=Number(obj.created_utc);
 if(!Number.isFinite(published)||published<=0)return {state:'PUBLICATION_TIMESTAMP_UNBOUND'};
 const date=new Date(published*1000).toISOString().slice(0,10);
 if(target.publication_day_as_catalogued&&date!==target.publication_day_as_catalogued)
  return {state:'CATALOGUED_DAY_CONFLICT',source_day:date};
 return {state:'ARCHIVED_TEXT_FIELDS_FOUND_LIVE_STATE_UNVERIFIED',
  source_day:date,title_sha256_utf8:sha256Utf8(obj.title),
  selftext_sha256_utf8:sha256Utf8(obj.selftext),
  title_utf8_bytes:Buffer.byteLength(obj.title,'utf8'),selftext_utf8_bytes:Buffer.byteLength(obj.selftext,'utf8'),
  archive_retrieved_on:obj.retrieved_on??null,source_edited_at:obj.edited??null,
  raw_provider:provider.name};
}
export async function probeP0Archives({fetchImpl=fetch,targets=loadFoundationalTargets(),providers=PROVIDERS,timeoutMs=15000,
 destination=null,saveRaw=false,rightsBasis=null}={}){
 if(!Array.isArray(targets)||!targets.length||new Set(targets.map(x=>x.source_id)).size!==targets.length)
  throw new Error('INVALID_TARGET_ROSTER');
 if(saveRaw){
  if(!destination)throw new Error('PRIVATE_DESTINATION_REQUIRED_FOR_RAW_ARCHIVE');
  if(!['AUTHOR_PERMISSION','APPLICABLE_LICENSE','USER_ATTESTED_AUTHORIZED_COPY'].includes(rightsBasis))
   throw new Error('EXPLICIT_RIGHTS_BASIS_REQUIRED_FOR_RAW_ARCHIVE');
 }
 const out=saveRaw?assertPrivateDestination(destination):null;
 if(out&&fs.existsSync(out))throw new Error('REFUSE_OVERWRITE_PRIVATE_ARCHIVE');
 const diagnostics=[],foundById=new Map();
 const requested=new Set(targets.map(x=>x.source_id));
 if(out)fs.mkdirSync(out,{recursive:true,mode:0o700});
 for(const provider of providers){
  const url=providerUrl(provider,targets);
  let status=null;
  try{
   const response=await fetchImpl(url,{method:'GET',headers:{Accept:'application/json','User-Agent':'TD613-Wendbine-public-source-audit/0.1'},redirect:'error',signal:AbortSignal.timeout(timeoutMs)});
   status=response?.status??null;
   if(!response?.ok)throw new Error('HTTP_'+status);
   const raw=Buffer.from(await response.arrayBuffer());
   if(raw.byteLength>20*1024*1024)throw new Error('RESPONSE_EXCEEDS_20MB_LIMIT');
   const objects=parseArchiveEnvelope(raw,provider);
   const records=objects.filter(x=>requested.has('reddit:t3_'+String(x?.id||'').replace(/^t3_/,'')));
   let valid=0,conflicts=0;
   for(const target of targets){
    const id=target.source_id.slice('reddit:t3_'.length);
    const candidate=records.filter(x=>String(x.id).replace(/^t3_/,'')===id);
    if(!candidate.length)continue;
    const verdicts=candidate.map(o=>assessArchiveObject(o,target,provider));
    for(let j=0;j<candidate.length;j++){
     const verdict=verdicts[j];
     if(verdict.state==='ARCHIVED_TEXT_FIELDS_FOUND_LIVE_STATE_UNVERIFIED'){
      valid++;
      const current=foundById.get(target.source_id)||[];
      current.push({...verdict,provider:provider.name,source_id:target.source_id,canonical_url:target.canonical_url,source_object_index:objects.indexOf(candidate[j])});
      foundById.set(target.source_id,current);
     }else conflicts++;
    }
   }
   if(out)fs.writeFileSync(path.join(out,'raw-'+provider.name.toLowerCase()+'.json'),raw,{flag:'wx',mode:0o600});
   diagnostics.push({provider:provider.name,state:'RESPONSE_PARSED',http_status:status,
    returned_records:objects.length,matched_account_source_objects:valid,conflicting_source_objects:conflicts,
    raw_response_sha256:sha256(raw),raw_response_bytes:raw.byteLength});
  }catch(error){
   diagnostics.push({provider:provider.name,state:'PROVIDER_UNAVAILABLE_OR_UNRECOGNIZED',http_status:status,
    reason:String(error?.message||error).slice(0,160)});
  }
 }
 const records=targets.map(target=>{
  const copies=foundById.get(target.source_id)||[];
  const signatures=new Set(copies.map(c=>c.title_sha256_utf8+':'+c.selftext_sha256_utf8));
  return {source_id:target.source_id,canonical_url:target.canonical_url,
   state:copies.length?'ARCHIVE_SOURCE_FIELDS_FOUND_NOT_LIVE_VERIFIED':'NO_USABLE_ARCHIVE_SOURCE_FIELDS_IN_THIS_PROBE',
   provider_copies:copies,source_version_hash_variants:signatures.size,
   original_publication_version_verified:false,live_deletion_state_verified:false,
   private_text_custody:!!out&&copies.length>0?'PROVIDER_RAW_BATCH_SAVED_PRIVATE_AUDIT_REQUIRED':'NOT_CUSTODIED'};
 });
 const report={schema:'wendbine-archive-provider-coverage/v0.1',target_count:targets.length,
  matched_source_ids:records.filter(r=>r.provider_copies.length).length,missing_source_ids:records.filter(r=>!r.provider_copies.length).length,
  source_versions_conflicting:records.filter(r=>r.source_version_hash_variants>1).length,
  providers:diagnostics,records,
  claim_ceiling:['ARCHIVE_FOUND != COMPLETE_LIVE_CENSUS','ARCHIVE_VERSION != UNEDITED_ORIGINAL_PUBLICATION',
   'PROVIDER_COUNT != INDEPENDENT_WITNESS_COUNT','PUBLIC_ARCHIVE_COPY != AUTHOR_PERMISSION','DELETED_OR_REMOVED_BODY != AUTOMATIC_ADMISSION']};
 if(out)fs.writeFileSync(path.join(out,'coverage-report.json'),JSON.stringify({...report,rights_basis:rightsBasis},null,2)+'\n',{flag:'wx',mode:0o600});
 return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const raw=process.argv.includes('--save-private-raw');
 const destination=raw?process.argv[process.argv.indexOf('--save-private-raw')+1]:null;
 const report=await probeP0Archives({saveRaw:raw,destination,rightsBasis:process.env.WENDBINE_SOURCE_RIGHTS_BASIS});
 process.stdout.write(JSON.stringify({target_count:report.target_count,matched_source_ids:report.matched_source_ids,
  missing_source_ids:report.missing_source_ids,source_versions_conflicting:report.source_versions_conflicting,providers:report.providers,
  records:report.records.map(r=>({source_id:r.source_id,state:r.state,providers:r.provider_copies.map(c=>c.provider)}))},null,2)+'\n');
 if(!report.matched_source_ids)process.exitCode=1;
}
