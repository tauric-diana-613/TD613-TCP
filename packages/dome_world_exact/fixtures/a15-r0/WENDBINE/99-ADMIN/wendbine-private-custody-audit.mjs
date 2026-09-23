#!/usr/bin/env node
/** Verify *actual* private original fields against an intake or OAuth receipt.
 * Fail closed: a JSON-shaped source file, or a summary, is not source custody.
 * This module never exports the original text in CLI output.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {loadGapLedger,validateOriginal,sha256Utf8} from './wendbine-originals-intake.mjs';
import {parseRedditPostBytes} from './wendbine-reddit-oauth-rescue.mjs';
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function safeFile(dir,name){
  if(typeof name!=='string'||path.basename(name)!==name||!name.endsWith('.json'))throw new Error('INVALID_PRIVATE_FILE_NAME');
  const p=path.join(dir,name);
  if(!fs.existsSync(p)||fs.lstatSync(p).isSymbolicLink())throw new Error('MISSING_OR_SYMLINKED_PRIVATE_FILE');
  return p;
}
function readJsonFile(dir,name){
  return JSON.parse(fs.readFileSync(safeFile(dir,name),'utf8'));
}
export function auditPrivateOriginals(destination,{root}={}){
 const dir=fs.realpathSync(path.resolve(destination));
 const oauth=fs.existsSync(path.join(dir,'capture-report.json'));
 const imported=fs.existsSync(path.join(dir,'intake-report.json'));
 if(oauth===imported)throw new Error('EXACTLY_ONE_PRIVATE_CAPTURE_REPORT_REQUIRED');
 const reportName=oauth?'capture-report.json':'intake-report.json';
 const report=readJsonFile(dir,reportName);
 const known=new Map(loadGapLedger(root).records.map(x=>[x.source_id,x]));
 if(!Array.isArray(report.records))throw new Error('MALFORMED_CAPTURE_RECEIPT');
 if(oauth&&(report.success_count!==report.records.length||report.success_count+report.failures?.length!==report.target_count||report.reconciled!==true))throw new Error('UNRECONCILED_OAUTH_CAPTURE_RECEIPT');
 if(imported&&report.imported_originals!==report.records.length)throw new Error('UNRECONCILED_PRIVATE_INTAKE_RECEIPT');
 const seen=new Set(), verified=[];
 for(const entry of report.records){
  const sourceId=entry?.source_id,id=typeof sourceId==='string'?sourceId.slice('reddit:t3_'.length):'';
  if(!/^reddit:t3_[a-z0-9]+$/.test(sourceId||'')||seen.has(sourceId))throw new Error('DUPLICATE_OR_INVALID_RECEIPT_SOURCE_ID');
  seen.add(sourceId);
  const name=oauth?'source-'+id+'.json':id+'.json';
  if(oauth&&entry.private_source_fields!==name)throw new Error('SOURCE_FILE_RECEIPT_MISMATCH');
  if(imported&&path.resolve(entry.private_original_file||'')!==path.join(dir,name))throw new Error('IMPORTED_FILE_RECEIPT_MISMATCH');
  const source=readJsonFile(dir,name);
  validateOriginal(source,known.get(sourceId));
  if(source.source_id!==sourceId||source.canonical_url!==entry.canonical_url)throw new Error('RECEIPT_ID_OR_URL_MISMATCH');
  const titleHash=oauth?entry.exact_title_sha256_utf8:entry.title_sha256_utf8;
  const bodyHash=oauth?entry.exact_selftext_sha256_utf8:entry.selftext_sha256_utf8;
  if(sha256Utf8(source.title)!==titleHash||sha256Utf8(source.selftext)!==bodyHash)throw new Error('SOURCE_TEXT_HASH_MISMATCH');
  if(oauth){
   const expectedRaw='raw-'+id+'.json';
   if(entry.private_raw_response!==expectedRaw)throw new Error('RAW_FILE_RECEIPT_MISMATCH');
   const raw=fs.readFileSync(safeFile(dir,expectedRaw));
   if(digest(raw)!==entry.raw_http_payload_sha256||raw.byteLength!==entry.raw_http_payload_bytes)throw new Error('RAW_RESPONSE_HASH_MISMATCH');
   const parsed=parseRedditPostBytes(raw,known.get(sourceId),source.rights_basis,source.source_observed_at);
   if(parsed.source.title!==source.title||parsed.source.selftext!==source.selftext||parsed.source.publication_timestamp!==source.publication_timestamp)
      throw new Error('ORIGINAL_FIELDS_DIVERGE_FROM_RAW_RESPONSE');
  }
  verified.push({source_id:sourceId,canonical_url:source.canonical_url,title:source.title,selftext:source.selftext,
   source_capture_method:source.source_capture_method,rights_basis:source.rights_basis,
   publication_timestamp:source.publication_timestamp??null,title_sha256_utf8:titleHash,selftext_sha256_utf8:bodyHash,
   original_text_state:oauth?'OAUTH_RAW_AND_FIELDS_HASH_VERIFIED':'AUTHORIZED_INTAKE_FIELDS_HASH_VERIFIED'});
 }
 return {status:'PRIVATE_ORIGINALS_HASH_VERIFIED',capture_route:oauth?'OAUTH_RAW':'AUTHORIZED_EXPORT',verified_count:verified.length,records:verified};
}
if(process.argv[1]&&path.resolve(process.argv[1])===new URL(import.meta.url).pathname){
 const dest=process.argv[2];
 if(!dest)throw new Error('Usage: node wendbine-private-custody-audit.mjs <private-originals-directory>');
 const result=auditPrivateOriginals(dest);
 process.stdout.write(JSON.stringify({status:result.status,capture_route:result.capture_route,verified_count:result.verified_count,
   source_ids:result.records.map(x=>x.source_id)})+'\n');
}
