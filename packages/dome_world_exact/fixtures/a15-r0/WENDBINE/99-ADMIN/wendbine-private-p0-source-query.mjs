#!/usr/bin/env node
/** Exact phrase retrieval over the 33 genuine recovered P0 archived source fields.
 * Requires the private raw response, private source JSONL, and public per-ID
 * hashes/lengths. Derivative summaries never enter this query.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const DEFAULT_RECEIPT=path.join(root,'01-MANIFESTS/p0-archived-source-field-receipts-20260922-v06.json');
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
export function loadVerifiedP0({privateJsonl,rawResponse,receiptPath=DEFAULT_RECEIPT}){
 const manifest=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
 if(manifest.schema!=='wendbine-p0-archived-source-field-receipts/v0.6'||manifest.source_count!==33||manifest.records.length!==33)throw new Error('P0_VERIFIED_RECEIPT_REQUIRED');
 const raw=fs.readFileSync(rawResponse);
 if(digest(raw)!==manifest.raw_http_payload_sha256||raw.length!==manifest.raw_http_payload_bytes)throw new Error('RAW_ARCHIVE_DIGEST_MISMATCH');
 const outer=JSON.parse(raw.toString('utf8')), objects=Array.isArray(outer)?outer:outer.data;
 if(!Array.isArray(objects))throw new Error('UNRECOGNIZED_RAW_ARCHIVE');
 const rows=fs.readFileSync(privateJsonl,'utf8').trim().split('\n').map(JSON.parse);
 if(rows.length!==33||objects.length!==33)throw new Error('P0_SOURCE_COUNT_MISMATCH');
 const byID=new Map(objects.map(x=>[String(x.id||'').replace(/^t3_/,''),x]));
 if(byID.size!==33)throw new Error('AMBIGUOUS_RAW_SOURCE_IDS');
 const seen=new Set(), verified=[];
 for(const s of rows){
  const rec=manifest.records.find(x=>x.source_id===s.source_id);
  if(!rec||seen.has(s.source_id)||rec.canonical_url!==s.canonical_url)throw new Error('MISSING_OR_DUPLICATE_SOURCE');
  seen.add(s.source_id);
  const rawObj=byID.get(s.source_id.slice('reddit:t3_'.length));
  if(!rawObj||String(rawObj.author).toLowerCase()!=='upset-ratio502'||String(rawObj.subreddit).toLowerCase()!=='wendbine')
   throw new Error('RAW_AUTHOR_OR_SOURCE_MISMATCH');
  if(s.source_title_exact!==rawObj.title||s.source_body_exact!==rawObj.selftext||rec.reddit_title_exact!==s.source_title_exact)
   throw new Error('SOURCE_FIELDS_DIFFER_FROM_RAW');
  if(digest(Buffer.from(s.source_title_exact,'utf8'))!==rec.title_sha256_utf8||
     digest(Buffer.from(s.source_body_exact,'utf8'))!==rec.body_sha256_utf8||
     Buffer.byteLength(s.source_body_exact,'utf8')!==rec.body_utf8_bytes)throw new Error('SOURCE_FIELD_HASH_OR_LENGTH_MISMATCH');
  if(Number(rawObj.created_utc)!==rec.source_created_utc)throw new Error('SOURCE_TIME_MISMATCH');
  verified.push({...s,original_text_state:'PRIVATE_ARCHIVE_SOURCE_FIELDS_VERIFIED_RAW_AND_RECEIPT'});
 }
 return verified.sort((a,b)=>a.source_created_utc-b.source_created_utc);
}
export function exactSearch(rows,query,{limit=40,caseSensitive=false}={}){
 if(typeof query!=='string'||!query.trim())throw new Error('QUERY_REQUIRED');
 const hits=[];
 for(const s of rows){
  for(const [field,value] of [['reddit_title',s.source_title_exact],['selftext',s.source_body_exact]]){
   if(typeof value!=='string')continue;
   const index=caseSensitive?value.indexOf(query):value.toLocaleLowerCase('en-US').indexOf(query.toLocaleLowerCase('en-US'));
   if(index<0)continue;
   hits.push({source_id:s.source_id,canonical_url:s.canonical_url,field,offset_utf16:index,
    offset_utf8:Buffer.byteLength(value.slice(0,index),'utf8'),
    body_sha256_utf8:s.body_sha256_utf8,
    snippet:value.slice(Math.max(0,index-45),Math.min(value.length,index+query.length+75)),
    status:'EXACT_PRIVATE_SOURCE_TEXT_MATCH_ARCHIVE_VERSION'});
   if(hits.length>=limit)return hits;
  }
 }
 return hits;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [privateJsonl,rawResponse,query]=process.argv.slice(2);
 if(!privateJsonl||!rawResponse||!query)throw new Error('Usage: node wendbine-private-p0-source-query.mjs <private-p0-originals.jsonl> <private-raw-provider.json> <exact-phrase>');
 const rows=loadVerifiedP0({privateJsonl,rawResponse});
 const hits=exactSearch(rows,query);
 process.stdout.write(JSON.stringify({verified_source_count:rows.length,archive_state:'PRIVATE_ARCHIVED_VERSION_NOT_LIVE_REDDIT',query,hits},null,2)+'\n');
}
