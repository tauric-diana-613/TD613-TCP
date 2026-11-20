#!/usr/bin/env node
/** Reconcile private Arctic Shift/PullPush raw batches to their source-ID coverage receipt.
 * Archive snapshots remain dated third-party copies; they are not live Reddit state.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {PROVIDERS,parseArchiveEnvelope,assessArchiveObject} from './wendbine-archive-provider-probe.mjs';
import {loadFoundationalTargets} from './wendbine-reddit-oauth-rescue.mjs';
const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
export function auditPrivateArchive(directory){
 const dir=fs.realpathSync(path.resolve(directory));
 const reportPath=path.join(dir,'coverage-report.json');
 if(!fs.existsSync(reportPath)||fs.lstatSync(reportPath).isSymbolicLink())throw new Error('ARCHIVE_COVERAGE_REPORT_REQUIRED');
 const report=JSON.parse(fs.readFileSync(reportPath,'utf8'));
 const targets=loadFoundationalTargets();
 if(report.schema!=='wendbine-archive-provider-coverage/v0.1'||report.target_count!==targets.length||
  !Array.isArray(report.records)||report.records.length!==targets.length)throw new Error('INVALID_ARCHIVE_COVERAGE_REPORT');
 if(!['AUTHOR_PERMISSION','APPLICABLE_LICENSE','USER_ATTESTED_AUTHORIZED_COPY'].includes(report.rights_basis))
  throw new Error('EXPLICIT_ARCHIVE_RIGHTS_BASIS_REQUIRED');
 const expected=new Map(targets.map(x=>[x.source_id,x]));
 const providerData=new Map();
 for(const provider of PROVIDERS){
  const d=report.providers?.find(x=>x.provider===provider.name);
  if(d?.state!=='RESPONSE_PARSED')continue;
  const filename='raw-'+provider.name.toLowerCase()+'.json';
  const p=path.join(dir,filename);
  if(!fs.existsSync(p)||fs.lstatSync(p).isSymbolicLink())throw new Error('MISSING_OR_SYMLINKED_ARCHIVE_RAW');
  const raw=fs.readFileSync(p);
  if(sha256(raw)!==d.raw_response_sha256||raw.byteLength!==d.raw_response_bytes)throw new Error('ARCHIVE_RAW_RESPONSE_HASH_MISMATCH');
  const objects=parseArchiveEnvelope(raw,provider);
  if(objects.length!==d.returned_records)throw new Error('ARCHIVE_RESPONSE_COUNT_MISMATCH');
  providerData.set(provider.name,{provider,objects});
 }
 const verified=[];
 const seen=new Set();
 for(const rec of report.records){
  const target=expected.get(rec.source_id);
  if(!target||seen.has(rec.source_id)||rec.canonical_url!==target.canonical_url)throw new Error('ARCHIVE_SOURCE_ID_OR_URL_MISMATCH');
  seen.add(rec.source_id);
  if(!Array.isArray(rec.provider_copies))throw new Error('MISSING_ARCHIVE_COPY_LIST');
  if(new Set(rec.provider_copies.map(c=>c.title_sha256_utf8+':'+c.selftext_sha256_utf8)).size!==rec.source_version_hash_variants)
   throw new Error('ARCHIVE_VERSION_RECONCILIATION_MISMATCH');
  for(const copy of rec.provider_copies){
   const p=providerData.get(copy.provider);
   if(!p||!Number.isInteger(copy.source_object_index))throw new Error('ARCHIVE_PROVIDER_OR_OBJECT_INDEX_MISSING');
   const obj=p.objects[copy.source_object_index];
   const verdict=assessArchiveObject(obj,target,p.provider);
   if(verdict.state!=='ARCHIVED_TEXT_FIELDS_FOUND_LIVE_STATE_UNVERIFIED'||
      verdict.title_sha256_utf8!==copy.title_sha256_utf8||verdict.selftext_sha256_utf8!==copy.selftext_sha256_utf8)
    throw new Error('ARCHIVE_COPY_FIELDS_DIVERGE_FROM_RAW');
   verified.push({source_id:rec.source_id,canonical_url:rec.canonical_url,title:obj.title,selftext:obj.selftext,
    source_capture_method:'THIRD_PARTY_ARCHIVE_SNAPSHOT',rights_basis:report.rights_basis,
    publication_timestamp:new Date(obj.created_utc*1000).toISOString(),
    archive_provider:copy.provider,archive_retrieved_on:obj.retrieved_on??null,
    title_sha256_utf8:copy.title_sha256_utf8,selftext_sha256_utf8:copy.selftext_sha256_utf8,
    original_text_state:'ARCHIVE_RAW_AND_FIELDS_HASH_VERIFIED_LIVE_STATUS_UNBOUND',
    original_publication_version_verified:false,live_deletion_state_verified:false});
  }
 }
 if(seen.size!==targets.length||verified.length!==report.providers.filter(x=>x.state==='RESPONSE_PARSED').reduce((n,x)=>n+x.matched_account_source_objects,0))
  throw new Error('ARCHIVE_REPORT_TOTAL_RECONCILIATION_FAILED');
 return {state:'PRIVATE_ARCHIVE_SNAPSHOTS_HASH_VERIFIED_NOT_LIVE_PROOF',verified_versions:verified.length,
   distinct_source_ids:new Set(verified.map(x=>x.source_id)).size,records:verified};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];if(!dir)throw new Error('Usage: node wendbine-private-archive-audit.mjs <private-archive-directory>');
 const r=auditPrivateArchive(dir);
 process.stdout.write(JSON.stringify({state:r.state,verified_versions:r.verified_versions,distinct_source_ids:r.distinct_source_ids})+'\n');
}
