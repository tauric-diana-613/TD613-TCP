/** Execute original public operations only; every output goes to caller scratch. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {compileQualified,validateNativeInputs} from './wendbine-native-method-adapter-v1.mjs';
const [original,evolved,out,topologyOut]=process.argv.slice(2).map(p=>path.resolve(p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=(r,p)=>JSON.parse(fs.readFileSync(path.join(r,p),'utf8'));
const lines=(r,p)=>fs.readFileSync(path.join(r,p),'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
const load=async(r,name)=>import(pathToFileURL(path.join(r,'99-ADMIN',name)).href);
const meta=read(original,'01-MANIFESTS/public-reddit-48h-snapshot-v01.json');
const posts=lines(original,'01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl');
const registry=read(original,'01-MANIFESTS/typed-relation-registry-v01.json');
const compiler=await load(original,'wendbine-compile.mjs');
const relations=validateNativeInputs(meta,posts,registry);
const native=compiler.compilePublicCorpus(meta,posts,relations);
fs.writeFileSync(topologyOut,JSON.stringify(native,null,2)+'\n');
const qualified=await compileQualified({meta,posts,registry,compilerPath:path.join(original,'99-ADMIN/wendbine-compile.mjs')});
assert.deepEqual(qualified.native_output,native);
assert.deepEqual(compiler.compilePublicCorpus(meta,[...posts].reverse(),[...relations].reverse()),native);
const query=await load(evolved,'wendbine-query.mjs');
const index=query.buildIndex(evolved);
const debt=index.find(e=>e.path==='04-RECEIPTS/2026-09-16-public-profile-card-loss-ledger-v01.json');
assert.ok(debt);assert.ok(query.resolveEntry(index,debt.id).some(x=>x.path===debt.path));
assert.equal(query.lexicalSearch(index,'qualabsent9dc66ef83f3b').length,0);
assert.ok(query.lexicalSearch(index,'capture debt').length>0);
assert.ok(query.semanticSearch(index,'operational digital twin').length>0);
const recent=query.recentEntries(index,{limit:20,sourceOnly:true});assert.ok(recent.length>0);assert.ok(recent.every(x=>x.date_basis));
const capture=await load(evolved,'wendbine-capture-contract.mjs');
const scar=capture.validateSept16Scar(evolved);
assert.deepEqual([scar.observed_count,scar.persisted_count,scar.explicit_failure_count],[25,0,25]);
assert.throws(()=>capture.validateCaptureReconciliation({observedCount:25,persistedCount:0,explicitFailureCount:24}),/FAILED_CAPTURE/);
const sealed=await load(evolved,'wendbine-srcquery.mjs');
const seal=read(evolved,'04-RECEIPTS/phase2/current-seal.json');
const args={root:evolved,snapshotId:seal.atelier_snapshot_id,sealId:seal.seal_id};
const epoch=sealed.openEpoch(args);const actionRuns=[];
for(const route of sealed.ROUTES)for(const action of ['summary','chronology','resolve','versions','relations']){
 const value=sealed.queryEpoch(epoch,{route,action,entityId:action==='relations'?null:'reddit:t3_1wd7mjl'});
 actionRuns.push({route,action,result_sha256:sha(JSON.stringify(value))});
}
const summary=sealed.queryEpoch(epoch,{route:'AUDIT',action:'summary'}).result;
assert.throws(()=>sealed.openEpoch({...args,sealId:'altered'}),/UNAVAILABLE/);
assert.throws(()=>sealed.queryEpoch(epoch,{route:'INVALID',action:'summary'}),/ROUTE/);
assert.throws(()=>sealed.queryEpoch(epoch,{route:'AUDIT',action:'invented'}),/UNKNOWN/);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'wendbine-public-seal-negative-'));
try{
 const deps=new Set(['04-RECEIPTS/phase2/current-seal.json','01-MANIFESTS/registry-index.json','01-MANIFESTS/phase2/interface-registry.json',...seal.file_hashes.map(f=>f.path)]);
 for(const rel of deps){const dest=path.join(temp,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(evolved,rel),dest);}
 fs.appendFileSync(path.join(temp,seal.file_hashes[0].path),' ');
 assert.throws(()=>sealed.openEpoch({...args,root:temp}),/REGISTRY_HASH_MISMATCH/);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
// Actual original compiler of captures, exercised only with fictional inputs.
const sync=await load(evolved,'wendbine-src-autosync.mjs');
const previous=Object.fromEntries(['manifestations','captures','blobs','derivatives','rights','resolver','versions','relations'].map(k=>[k,[]]));
const row={id:'abcde1',author:'Upset-Ratio502',subreddit:'Wendbine',title:'Fictional only',selftext:'invented content',created_utc:1790000000};
const a=sync.compileSync({observed:[row],previous,observedAt:'2026-11-01T00:00:00Z'});
const b=sync.compileSync({observed:[row],previous:a.state,observedAt:'2026-11-02T00:00:00Z'});
assert.equal(a.state.captures.length,1);assert.equal(b.state.captures.length,2);assert.equal(b.state.blobs.length,1);
assert.equal(a.state.manifestations[0].manifestation_id,b.state.manifestations[0].manifestation_id);
const held=sync.compileSync({observed:[{...row,selftext:'[removed]'}],previous:b.state,observedAt:'2026-11-03T00:00:00Z'});
assert.equal(held.audit.held,1);assert.equal(held.state.captures.length,2);
const result={schema:'td613.wendbine.native-public-execution/v1',runtime:process.version,
 compiler:{native_output_sha256:sha(JSON.stringify(native)),strict_successor_identical:true,row_order_invariant:true,
 source_count:native.post_nodes.length,concepts:native.concept_nodes.length,typed_relations:native.typed_relation_edges.length,
 cooccurrences:native.cooccurrence_overlay.length,graph_counts:native.typed_relation_counts,
 dependency_files:['99-ADMIN/wendbine-compile.mjs','01-MANIFESTS/public-reddit-48h-snapshot-v01.json','01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl','01-MANIFESTS/typed-relation-registry-v01.json']},
 public_query:{indexed_records:index.length,index_paths:[...new Set(index.map(e=>e.path))].sort(),
 lexical_absent_control_passed:true,concept_query_executed:true,concept_semantic_meaning:'DETERMINISTIC_WEIGHTED_TOKENS_WITH_CONCEPT_FIELDS_NO_EMBEDDINGS',
 positive_lexical_query_executed:true,recent_source_records:recent.length,recent_date_bases:[...new Set(recent.map(x=>x.date_basis))],
 held_debt_record_retrievable:true,debt_path:debt.path,claims_promoted:false},
 capture_reconciliation:{result:scar,unexplained_gap_refused:true,dependency_files:['99-ADMIN/wendbine-capture-contract.mjs','01-MANIFESTS/public-reddit-profile-delta-20260916-snapshot-v04.json','04-RECEIPTS/2026-09-16-public-profile-card-loss-ledger-v01.json']},
 sealed_query:{snapshot_id:seal.atelier_snapshot_id,seal_id:seal.seal_id,summary,route_action_cases:actionRuns,
 wrong_seal_refused:true,unsupported_route_and_action_refused:true,temporary_member_tamper_refused:true,
 dependency_files:[...new Set(['99-ADMIN/wendbine-srcquery.mjs','04-RECEIPTS/phase2/current-seal.json','01-MANIFESTS/registry-index.json','01-MANIFESTS/phase2/interface-registry.json',...seal.file_hashes.map(f=>f.path)])].sort()},
 pure_sync_control:{source_class:'SYNTHETIC',native_code_executed:true,dependency_files:['99-ADMIN/wendbine-src-autosync.mjs'],
 network_discovery_executed:false,projection_or_encrypted_write_executed:false,observations:2,captures:2,unique_body_blobs:1,
 predecessor_state_unchanged:true,removed_source_held:true},
 receiver_admission_executed:false,held_research_resumed:false,flights:'HELD'};
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({original_public_compiler:result.compiler.source_count,concepts:result.compiler.concepts,public_index_records:index.length,sealed_route_action_cases:actionRuns.length,private_body_execution:false}));
