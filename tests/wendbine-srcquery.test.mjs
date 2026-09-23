import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {compileSync,checkPost,writeProjection} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-src-autosync.mjs';
import {openEpoch,queryEpoch} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-srcquery.mjs';

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'wendbine-src-query-'));
try{
 const source=checkPost({id:'1zzzzzz',author:'Upset-Ratio502',subreddit:'Wendbine',
  title:'Synthetic example',selftext:'Synthetic source span ∴ only.',
  created_utc:1789007267,edited:false});
 const compiled=compileSync({observed:[source],observedAt:'2026-09-22T23:00:00Z'});
 const written=writeProjection({compiled,outRoot:tmp,observedAt:'2026-09-22T23:00:00Z'});
 assert.throws(()=>openEpoch({root:tmp,snapshotId:written.snapshot,sealId:'wrong'}),/SEAL_EPOCH_UNAVAILABLE/);
 const epoch=openEpoch({root:tmp,snapshotId:written.snapshot,sealId:written.seal.seal_id});
 const summary=queryEpoch(epoch,{route:'CUSTODIAL',action:'summary'});
 assert.equal(summary.query_epoch.atelier_snapshot_id,written.snapshot);
 assert.equal(summary.result.manifestations,61);
 assert.equal(summary.result.private_source_body_query_authorized,false);
 const resolved=queryEpoch(epoch,{route:'EXPERIENTIAL',action:'resolve',entityId:source.source_id});
 assert.equal(resolved.result.manifestations.length,1);
 const history=queryEpoch(epoch,{route:'CUSTODIAL',action:'versions',entityId:source.source_id});
 assert.equal(history.result.length,1);
 assert.throws(()=>queryEpoch(epoch,{route:'NOT_A_ROUTE',action:'summary'}),/EXPLICIT_AIA_ROUTE_REQUIRED/);
 const capture=path.join(tmp,'01-MANIFESTS/phase2/capture-v2.jsonl');
 fs.appendFileSync(capture,'\n');
 assert.throws(()=>openEpoch({root:tmp,snapshotId:written.snapshot,sealId:written.seal.seal_id}),/REGISTRY_HASH_MISMATCH/);
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log('Wendbine SRC sealed query routes and field-hash tamper gate PASS.');
