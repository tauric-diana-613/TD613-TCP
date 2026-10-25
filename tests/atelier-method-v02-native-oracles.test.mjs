/**
 * Run in read-only GitHub Actions with the PR #1116 commit fetched into local
 * Git object storage. Source copies are kept in memory/temp ONLY, not committed.
 * Compare actual native SRC and Wendbine behavior with portable operators.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync,execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolveSourceEntity,compileSourceBoundTopology,readRegisteredRows,
  makeHeldoutView } from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-parity-operators-v02.mjs';
const repo=process.cwd(),root='packages/dome_world_exact/fixtures/a15-r0';
const src=path.join(repo,root,'SRC');
const current=JSON.parse(fs.readFileSync(path.join(src,'04-RECEIPTS/phase2/current-seal.json'),'utf8'));
const fixed={snapshot_id:current.atelier_snapshot_id,seal_id:current.seal_id};
const resolver=readRegisteredRows(src,'01-MANIFESTS/phase2/entity-resolver-v2.jsonl');
const captures=readRegisteredRows(src,'01-MANIFESTS/phase2/capture-v2.jsonl');
const derivatives=readRegisteredRows(src,'01-MANIFESTS/phase2/derivative-v1.jsonl');
const exemplar=resolver.find(r=>r.entity_type==='capture'&&r.capture_id&&r.path)??resolver.find(r=>r.entity_type==='acquisition-target'&&r.path);
assert.ok(exemplar,'SRC_ORACLE_NO_ENTITY');
const native=spawnSync('python3',[
 path.join(src,'99-ADMIN/srcquery.py'),'--root',src,'--snapshot-id',fixed.snapshot_id,
 '--seal-id',fixed.seal_id,'resolve',exemplar.entity_id
],{encoding:'utf8',maxBuffer:5*1024*1024});
assert.equal(native.status,0,'SRC_ORACLE_FAILED '+native.stderr);
const baseline=JSON.parse(native.stdout);
const ours=resolveSourceEntity({entity_id:exemplar.entity_id,epoch:fixed,expected_epoch:fixed,
 resolver_rows:resolver,captures,derivatives,root:src});
assert.equal(ours.status,'RESOLVED');
assert.equal(baseline.query_epoch.atelier_snapshot_id,ours.query_epoch.snapshot_id);
assert.equal(baseline.query_epoch.seal_id,ours.query_epoch.seal_id);
assert.deepEqual(ours.matches,baseline.result.matches);
assert.equal(ours.matches.every(x=>x.entity_id===exemplar.entity_id),true);
assert.throws(()=>resolveSourceEntity({entity_id:exemplar.entity_id,epoch:fixed,
 expected_epoch:{...fixed,seal_id:'false-seal'},resolver_rows:resolver}),/SEAL_MISMATCH/);

// Resolve and compare with the ORIGINAL Wendbine compiler pinned to merged PR #1116.
const PR1116='ce1e4ea4ccffe8409f9ea9873628e0f717706385';
const show=p=>execFileSync('git',['show',PR1116+':'+root+'/WENDBINE/'+p],{cwd:repo,encoding:'utf8',maxBuffer:8*1024*1024});
const meta=JSON.parse(show('01-MANIFESTS/public-reddit-48h-snapshot-v01.json'));
const posts=show('01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl').trim().split(/\r?\n/).map(JSON.parse);
const registry=JSON.parse(show('01-MANIFESTS/typed-relation-registry-v01.json'));
const relations=registry.relations.map(row=>Object.fromEntries(registry.fields.map((f,i)=>[f,row[i]])));
const moduleSource=show('99-ADMIN/wendbine-compile.mjs');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'td613-wendbine-oracle-'));
let module;
try{
 const mp=path.join(tmp,'wendbine-compile.mjs');
 fs.writeFileSync(mp,moduleSource,'utf8');
 module=await import(pathToFileURL(mp).href);
}finally{
 // Module is imported; no runtime dynamic dependency other than Node builtins.
 fs.rmSync(tmp,{recursive:true,force:true});
}
const nativeGraph=module.compilePublicCorpus(meta,posts,relations);
const common=compileSourceBoundTopology({snapshot_id:meta.snapshot_id,source_rows:posts,relation_rows:relations});
assert.equal(common.source_count,nativeGraph.compiled_from.source_count);
assert.equal(common.source_count,33);
assert.equal(common.concept_count,nativeGraph.concept_nodes.length);
assert.equal(common.concept_count,191);
assert.equal(common.typed_relation_count,nativeGraph.typed_relation_edges.length);
assert.equal(common.typed_relation_count,146);
assert.equal(common.cooccurrence_count,nativeGraph.cooccurrence_overlay.length);
assert.equal(common.cooccurrence_count,143);
assert.equal(common.recurrent_concepts.length,nativeGraph.recurrent_public_concepts.length);
assert.equal(common.recurrent_concepts.length,43);
assert.deepEqual(common.typed_graph_counts,nativeGraph.typed_relation_counts);
for(const concept of nativeGraph.recurrent_public_concepts){
 const commonNode=common.recurrent_concepts.find(x=>x.label===concept.concept);
 assert.ok(commonNode,'RECURRENT_CONCEPT_MISSING:'+concept.concept);
 assert.equal(commonNode.source_count,concept.source_count);
 assert.deepEqual(commonNode.source_ids,concept.source_ids);
}
for(const edge of nativeGraph.cooccurrence_overlay){
 const ours=common.cooccurrence.find(x=>x.from==='concept:'+edge.from?.replace(/^concept:/,'')&&x.to==='concept:'+edge.to?.replace(/^concept:/,''));
 // Compare with normalized concept IDs safely, including original namespace.
 const a=common.cooccurrence.find(x=>
   'concept:'+x.from===edge.from&&'concept:'+x.to===edge.to);
 assert.ok(a||ours,'COOCCURRENCE_EDGE_MISSING:'+edge.from);
 assert.equal((a||ours).weight,edge.weight);
 assert.deepEqual((a||ours).source_ids,edge.source_ids);
}
// Held-out native source must disappear from both content and explicit edges.
const target='reddit:t3_1wd7mjl';
const view=makeHeldoutView({source_rows:posts,relation_rows:relations,target_id:target,snapshot_id:meta.snapshot_id});
assert.equal(view.heldout_source_id_not_in_topology,true);
assert.equal(view.remaining_sources.length,32);
assert.ok(view.remaining_relations.every(x=>x.source_id!==target));
assert.equal(view.terminal_state,'HELDOUT_VIEW_ONLY_NO_PREDICTION_MADE');
assert.equal(meta.scope.private_google_group_admitted,false);
assert.equal(meta.rights.full_post_bodies_copied,false);
console.log('NATIVE ORACLES PASS: SRC exact-seal source resolver agrees with source-native Python; Wendbine 33/191/146/143/43 topology matches original compiler; EchoCore held-out view excludes target without invented reconstruction.');
