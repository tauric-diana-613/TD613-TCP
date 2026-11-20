#!/usr/bin/env node
/**
 * Read-only Seven-Source Reconciliation; no hydrated source or index is written.
 * Uses Git's exact historical blob identities; does not rely on filename guesses.
 */
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=fileURLToPath(import.meta.url);
export const PRE_REMOVAL='7824615fedc1ec333dc38edb692e399e2a216bf4';
export const REMOVAL='18cd2305ec069f9f672f0c8af2dbf6ea6d7ed7e4';
export const DOCKET='../artifacts/vixen-dual-estate/SEVEN_SOURCE_RECONCILIATION_HELD.json';
const file='app/encyclopedia/vix-cyb.html',index='app/encyclopedia/vixen-estate/semantic-semiotic-index.v1.json';
const sha=x=>createHash('sha256').update(x).digest('hex');
function show(rev,path){return execFileSync('git',['show',rev+':'+path],{encoding:'utf8',maxBuffer:30*1024*1024})}
export function parseBundle(html){
 const x=html.match(/<script\b[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 if(!x)throw Error('HELD_EXACT_CORPUS_BUNDLE_UNAVAILABLE');
 const j=JSON.parse(x[1]);
 if(!Array.isArray(j.works)||!Array.isArray(j.batch_b_files))throw Error('HELD_CORPUS_SCHEMA_UNAVAILABLE');
 return j;
}
const manifestations=x=>x.works.reduce((n,w)=>n+(w.linked_sources||[]).length,0);
export function compareManifestStates(pre,current,docket){
 if(!Array.isArray(docket.entries)||docket.entries.length!==7||pre.batch_b_files.length!==7||
 current.batch_b_files.length!==0)throw Error('HELD_EXPECTED_HISTORICAL_SEVEN_AND_A0_EMPTY');
 const historical=new Map(pre.batch_b_files.map(x=>[x.source_file_id,x]));
 if(historical.size!==7||pre.works.length!==32||current.works.length!==32||
 manifestations(pre)!==53||manifestations(current)!==53)throw Error('HELD_WORKS_MANIFESTATION_CENSUS_CHANGED');
 for(const {declared_historical_identity:e} of docket.entries){
  const x=historical.get(e.source_file_id);
  if(!x||e.declared_binary_sha256!==x.sha256||
   e.original_filename!==x.original_filename||e.source_clock!==x.source_clock||
   e.declared_byte_length!==x.byte_length||e.declared_pages!==x.page_count)
    throw Error('HELD_SEVEN_IDENTITY_OR_PROVENANCE_DRIFT');
 }
 return {state:'RECONCILED_HISTORICAL_METADATA_ONLY',
  seven_historical_ids:[...historical.keys()],
  baseline_delta:{works:0,works_manifestations:0,batch_b_registrations:-7},
  admissibility:'HELD_BINARY_UNVERIFIED_NO_HYDRATION',corruption_claim:'NOT_ESTABLISHED'};
}
export function reconcileSeven({currentRevision='HEAD',includeIndexAudit=true}={}){
 const docket=JSON.parse(readFileSync(new URL(DOCKET,import.meta.url),'utf8'));
 if(docket.observed_historical_revision!==PRE_REMOVAL||docket.recorded_exclusion_revision!==REMOVAL)
  throw Error('HELD_RECONCILIATION_ANCHOR_MISMATCH');
 const result=compareManifestStates(parseBundle(show(PRE_REMOVAL,file)),
  parseBundle(show(currentRevision,file)),docket);
 if(!includeIndexAudit)return {...result,docket};
 const before=show(PRE_REMOVAL,index),after=show(currentRevision,index);
 return {...result,index_comparison:{
  before_sha256:sha(before),after_sha256:sha(after),
  before_bytes:Buffer.byteLength(before),after_bytes:Buffer.byteLength(after),
  source_identity_occurrences:docket.entries.map(({declared_historical_identity:e})=>({
   source_file_id:e.source_file_id,
   pre_index_contains_id:before.includes(e.source_file_id),
   post_index_contains_id:after.includes(e.source_file_id)
  })),
  index_effects_interpretation:'TEXT_OCCURRENCE_ONLY; RANKING_AND_SEARCH_METRICS_REQUIRE_SEPARATE_ASSAY'
 },docket};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const r=reconcileSeven({currentRevision:process.argv[2]||'HEAD'});
 console.log(JSON.stringify(r,null,2));
}
