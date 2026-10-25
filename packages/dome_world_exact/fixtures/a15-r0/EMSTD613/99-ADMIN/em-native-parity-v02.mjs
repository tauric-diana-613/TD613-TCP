/**
 * TD613 EMSTD613 · native corpus adapter for candidate universal Atelier v0.2.
 * Bounded read-only scans of Em's existing register and existing native-text
 * derivatives; this does NOT create concept/motif/mechanism/relation ledgers.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { readRegisteredRows,resolveWorkManifestations,motifCandidateSieve,independentEvidenceSupport }
  from '../../ATELIER_METHOD/atelier-parity-operators-v02.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const guard=(x,y)=>{if(!x)throw Error(y)};
const safe=(rel)=>{
 guard(typeof rel==='string'&&!path.isAbsolute(rel),'NATIVE_PATH_INVALID');
 const value=path.resolve(ROOT,rel);
 guard(value.startsWith(ROOT+path.sep),'NATIVE_PATH_ESCAPE');
 return value;
};
const SHA=b=>createHash('sha256').update(b).digest('hex');
export function emRegistry(root=ROOT){
 const meta=JSON.parse(fs.readFileSync(path.join(root,'01-MANIFESTS/registry-index.json'),'utf8'));
 guard(meta.fixture==='EMSTD613'&&meta.work_identity_state?.WORK_IDENTITY_FULLY_RESOLVED===false,
   'EM_NATIVE_IDENTITY_CONTRACT_MISMATCH');
 const read=key=>readRegisteredRows(root,meta.registries[key]);
 return {meta,source_rows:read('source_files'),works:read('works'),
   manifestations:read('work_manifestations'),derivatives:read('derivatives')};
}
export function queryNativeEmWork(work_id){
 const reg=emRegistry();
 return resolveWorkManifestations({work_id,works:reg.works,manifestations:reg.manifestations,
  source_rows:reg.source_rows,epoch:'EM_PR962_NATIVE_REGISTERED_CUSTODY'});
}

/**
 * Operator supplies exact source IDs and literal terms. Text is only read from
 * existing extracted derivatives, each rehashed and checked against the exact
 * registered derivative and parent digest. Returns bounded counts, not text.
 */
export function queryNativeEmMotifs({source_ids,terms,max_sources=5}){
 guard(Array.isArray(source_ids)&&source_ids.length>0&&source_ids.length<=max_sources,
   'BOUNDED_SOURCE_IDS_REQUIRED');
 guard(new Set(source_ids).size===source_ids.length,'DUPLICATE_SOURCE_IDS');
 const reg=emRegistry();
 const bySource=new Map(reg.source_rows.map(x=>[x.source_file_id,x]));
 const derivative=new Map(reg.derivatives.map(x=>[x.source_file_id,x]));
 const byManifest=new Map(reg.manifestations.map(x=>[x.source_file_id,x]));
 const spans=[];
 for(const id of source_ids){
  const src=bySource.get(id),row=derivative.get(id);
  guard(src&&row,'UNREGISTERED_SOURCE');
  guard(row.extraction_status==='EXTRACTED_NATIVE_TEXT'&&row.derivative_relative_path,
     'SOURCE_TEXT_UNAVAILABLE');
  guard(row.parent_sha256===src.sha256,'DERIVATIVE_PARENT_CUSTODY_MISMATCH');
  const location=safe(row.derivative_relative_path);
  const bytes=fs.readFileSync(location);
  guard(SHA(bytes)===row.derivative_sha256,'DERIVATIVE_BYTES_MISMATCH');
  const manifest=byManifest.get(id);
  spans.push({source_id:id,source_locator:row.derivative_relative_path,
    work_id:manifest?.work_id??null,work_identity_status:manifest?.identity_status??'UNRESOLVED',
    text:bytes.toString('utf8')});
 }
 const result=motifCandidateSieve({snapshot_id:'EM_PR962_NATIVE_REGISTERED_CUSTODY',source_spans:spans,terms});
 return {
  schema:'td613.em-native-motif-sieve/v0.2-candidate',
  source_count:source_ids.length,source_ids:[...source_ids],
  hash_verification:'REGISTERED_DERIVATIVES_REHASHED_SHA256',
  results:result.summary,
  observations:result.observations,
  authority:'RESEARCH_ONLY',
  independent_work_support:independentEvidenceSupport(
   spans.map(s=>({evidence_id:s.source_id,source_id:s.source_id,ancestor_id:
    s.work_identity_status==='SAME_WORK_CONFIRMED'?s.work_id:null}))),
  claim_ceiling:'LEXICAL_COUNTS_NO_WORK_IDENTITY_PROMOTION_NO_MECHANISM_GENEALOGY_NOVELTY'
 };
}
