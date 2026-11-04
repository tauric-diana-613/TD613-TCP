import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {openTwinProducts} from '../scripts/td613-preflight-twin-products-v01.mjs';
import {openUniversalWendbinePort,PUBLIC_WEND_SOURCE} from '../scripts/universal-atelier-wendbine-public-port-v01.mjs';

const repo=process.cwd();
const run=(cmd,args,cwd=repo)=>spawnSync(cmd,args,{cwd,encoding:'utf8',maxBuffer:1024*1024,timeout:30000});
const fixture=async t=>{
 const home=fs.mkdtempSync(path.join(os.tmpdir(),'td613-universal-wendbine-public-'));
 const original=path.join(home,'wendbine-head');
 t.after(()=>{
  run('git',['worktree','remove','--force',original]);
  fs.rmSync(home,{recursive:true,force:true});
 });
 let r=run('git',['fetch','--no-tags','origin',PUBLIC_WEND_SOURCE.git_head]);
 assert.equal(r.status,0,r.stderr);
 r=run('git',['worktree','add','--detach',original,PUBLIC_WEND_SOURCE.git_head]);
 assert.equal(r.status,0,r.stderr);
 const a=path.join(home,'ATELIER'),e=path.join(home,'ENCYCLOPEDIA');
 fs.mkdirSync(a);fs.mkdirSync(e);
 const wendbineRoot=path.join(original,'packages/dome_world_exact/fixtures/a15-r0/WENDBINE');
 const twin=await openTwinProducts({atelierWorkspace:a,encyclopediaWorkspace:e,create:true,publicWendbineRoot:wendbineRoot});
 assert.equal(twin.real_public_wendbine_query_enabled,true);
 assert.equal(twin.private_original_source_admission,'HELD');
 return {home,twin,wendbineRoot,original};
};
test('Universal Atelier public companion operates native November 4 SEALED search, never synthetic W_PUBLIC catalog',async t=>{
 const {twin,wendbineRoot}=await fixture(t);
 const port=twin.wendbinePublicResearch;
 const s=await port.request({action:'summary'});
 assert.equal(s.research_product,'TD613_UNIVERSAL_ATELIER_B8_CANDIDATE');
 assert.equal(s.result.sources,2062);assert.equal(s.result.captures,6763);
 assert.equal(s.result.typed_edges,6703);
 const graphReceipt={schema:'td613.wendbine.nov04-public-graph-summary/v1',
  source_head:PUBLIC_WEND_SOURCE.git_head,
  snapshot_id:PUBLIC_WEND_SOURCE.snapshot,seal_id:PUBLIC_WEND_SOURCE.seal,
  sources:s.result.sources,captures:s.result.captures,
  typed_edges:s.result.typed_edges,
  graph_layers:s.result.graph_layers,
  incomplete_endpoints:s.result.incomplete_endpoints,
  public_metadata_only:true,private_bot_output_text_read:false,
  scientific_claim:'ARCHIVE_TYPED_RELATIONS_ONLY_NOT_SEMANTIC_CONTENT'};
 const artifactDir=path.join(repo,'artifacts/wendbine-public-query');
 fs.mkdirSync(artifactDir,{recursive:true});
 fs.writeFileSync(path.join(artifactDir,'graph-layer-summary.json'),JSON.stringify(graphReceipt,null,2)+'\n');
 console.log('WENDBINE_GRAPH_LAYER_COUNTS='+JSON.stringify(graphReceipt.graph_layers));

 assert.equal(s.source_head,PUBLIC_WEND_SOURCE.git_head);
 assert.equal(s.source_bytes_copied_to_universal_product,0);
 assert.equal(s.private_fulltext,'HELD_NOT_AUTHORIZED');
 const q=await port.request({action:'search',query:'reddit:t3_1wb61ip',limit:2});
 assert.equal(q.result.hits.length,1);
 assert.equal(q.result.hits[0].source.platform_account,'Upset-Ratio502');
 assert.equal(q.provider_or_model_calls,0);
 const concepts=await port.request({action:'conceptSummary'});
 assert.equal(concepts.result.source_id_join_count,33);
 assert.equal(concepts.result.inherited_concept_edges,146);
 assert.equal(concepts.result.typed_graph_layers.G_X,46);
 assert.equal(concepts.result.source_ids_without_bounded_concept_annotation,2029);
 graphReceipt.historical_concept_overlay={
  source_bound_posts:concepts.result.source_id_join_count,
  conceptual_edges:concepts.result.inherited_concept_edges,
  conceptual_graph_layers:concepts.result.typed_graph_layers,
  sources_without_historical_concept_annotation:concepts.result.source_ids_without_bounded_concept_annotation,
  original_bot_output_text_indexed:0,
  evidence_class:'PREEXISTING_BOUNDED_PUBLIC_PARAPHRASE'
 };
 fs.writeFileSync(path.join(artifactDir,'graph-layer-summary.json'),JSON.stringify(graphReceipt,null,2)+'\n');

 const publicLeads=await port.request({action:'conceptSearch',query:'provenance',limit:8});
 assert.ok(publicLeads.result.total_matching_historical_sources>0);
 assert.ok(publicLeads.result.hits.every(x=>x.match_basis==='HISTORICAL_BOUND_PUBLIC_PARAPHRASE'&&x.original_bot_text_quoted===false));
 const boundedMap=await port.request({action:'conceptMap',concept:'dependency_graph',limit:20});
 assert.ok(boundedMap.result.total_edges>0);
 assert.equal(boundedMap.result.proof_ceiling,'RELATIONSHIP_DECLARATION_NOT_EMPIRICAL_CAUSALITY');

 const read=await port.request({action:'source',sourceId:'reddit:t3_1wb61ip'});
 assert.equal(read.result.found,true);
 assert.equal(read.result.source.original_full_text_available,false);
 assert.equal((await twin.atelier.request({action:'status'})).real_sources_admitted,0);
});
test('Universal Atelier maps actual recorded typed edges without making a causality or bot-text claim',async t=>{
 const {twin,wendbineRoot}=await fixture(t);
 const native=await import(pathToFileURL(path.join(wendbineRoot,PUBLIC_WEND_SOURCE.native_relative)).href);
 const r=native.openSealedPublicResearch({root:wendbineRoot,
  snapshotId:PUBLIC_WEND_SOURCE.snapshot,sealId:PUBLIC_WEND_SOURCE.seal});
 const edge=r.edges.find(x=>x.from&&x.to);
 assert.ok(edge);
 const port=twin.wendbinePublicResearch;
 const result=await port.request({action:'map',entityId:edge.from,graph:edge.graph,depth:1});
 assert.ok(result.result.matching_edges>=1);
 assert.ok(result.result.edges.some(x=>x.from===edge.from||x.to===edge.from));
 assert.equal(result.result.graph_claim_ceiling,'ARCHIVED_TYPED_RELATIONS_NOT_RECONSTRUCTED_BOT_MEANING');
 const interpretation=await port.request({action:'readiness',query:'Experiment B privacy advice'});
 assert.equal(interpretation.result.bot_output_text_retrieved,0);
 assert.equal(interpretation.result.eligible_for_attributed_public_quotations,false);
});
test('Universal fails closed on unsupported original text requests, tampered mutable input, or wrong archive',async t=>{
 const {twin,wendbineRoot}=await fixture(t);
 const port=twin.wendbinePublicResearch;
 await assert.rejects(port.request({action:'readOriginal',sourceId:'reddit:t3_1wb61ip'}),/UAT_ORIGINALS_AND_UNSUPPORTED_ACTION_HELD/);
 await assert.rejects(port.request({action:'search',query:'raw selftext'}),/WEND_PRIVATE_CONTENT_QUERY_NOT_ON_PUBLIC_SURFACE/);
 const fake={action:'summary'};
 Object.defineProperty(fake,'query',{get(){throw Error('getter must never execute')}});
 await assert.rejects(port.request(fake),/UAT_QUERY_ACCESSOR_OR_UNKNOWN_FIELD_REFUSED/);
 const dummy=await twin.atelier.request({action:'status'});
 assert.equal(dummy.source_authorized,false);
 await assert.rejects(openUniversalWendbinePort({wendbineRoot:process.cwd(),
  universalAtelier:twin.atelier}),/UAT_WEND_NATIVE_EXACT_COMMIT_REQUIRED/);
});
