import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {checkPost,discover,compileSync,writeProjection,loadState,queryUrl}
 from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-src-autosync.mjs';

const original=(id,body,{title='Wendbine',is_self=true}={})=>({
 id,author:'Upset-Ratio502',subreddit:'Wendbine',title,selftext:body,is_self,
 created_utc:1789007267,edited:false,retrieved_on:1789007281
});
const old=original('1wc66e4','Literal link r/Wendbine/comments/1wc7p1y/wendbine/ and ∴ text');
const fresh=original('1zzzzzz','A new source ∴');
assert.equal(checkPost(old).state,'ARCHIVED_TEXT_BODY_PRESENT');
assert.equal(checkPost({...old,author:'other'}).state,'AUTHOR_MISMATCH');
assert.equal(checkPost({...old,selftext:'[removed]'}).state,'HELD_REMOVED_OR_DELETED');
assert.equal(checkPost({...old,selftext:'',is_self:false}).state,'VERIFIED_EMPTY_MEDIA_OR_LINK_BODY');
assert.equal(checkPost({...old,permalink:'/r/Wendbine/comments/1wc66e4/wensbine/'}).canonical_url,'https://www.reddit.com/r/Wendbine/comments/1wc66e4/wensbine/');
assert.equal(checkPost({...old,permalink:'https://evil.example/other'}).canonical_url,'https://www.reddit.com/r/Wendbine/comments/1wc66e4/','Do not admit a foreign permalink as a Reddit source locator.');
assert.ok(queryUrl().includes('author=Upset-Ratio502'));
assert.ok(queryUrl().includes('subreddit=Wendbine'));
const raw=Buffer.from(JSON.stringify([old,fresh]));
let requests=0;
const scan=await discover({fetchImpl:async(url)=>{requests++;return {ok:true,status:200,arrayBuffer:async()=>raw}},pageSize:100});
assert.equal(requests,1);
assert.equal(scan.posts.length,2);
assert.equal(scan.complete,true);
assert.equal(scan.posts[0].archive_response_sha256,scan.batches[0].raw_sha256,'Every observed post must bind to its raw provider response.');
assert.equal(scan.posts[0].source_object_index,0,'Source object positions remain recoverable within preserved raw batches.');
const first=compileSync({observed:scan.posts,observedAt:'2026-09-22T22:00:00Z',
 rawHashes:scan.batches.map(b=>({raw_sha256:b.raw_sha256,bytes:b.raw_byte_length}))});
assert.equal(first.state.manifestations.length,61,'Bootstrapped P0/P1/P2 source universe is 60 + 1.');
assert.equal(first.audit.new_source_ids.length,1);
assert.equal(first.audit.changed_source_ids.length,1);
assert.equal(first.audit.not_seen_prior_source_ids.length,59);
assert.equal(first.audit.unexplained_remainder,0);
const heldSource=checkPost({...old,selftext:'[removed]'});
const heldPass=compileSync({observed:[heldSource],observedAt:'2026-09-22T22:05:00Z'});
assert.equal(heldPass.audit.held,1);
assert.equal(heldPass.audit.held_observations.length,1,'A removed body must leave a source-bound observation, not just a total.');
assert.equal(heldPass.audit.held_observations[0].source_id,heldSource.source_id);
assert.equal(heldPass.audit.held_observations[0].promoted_original,false);
assert.equal(heldPass.audit.capture_added,0,'A removal placeholder must not become an admitted original capture.');

assert.ok(first.state.relations.some(e=>e.graph==='NAVIGATIONAL'&&e.origin==='EXACT_SOURCE_URL_SPAN'));
assert.ok(first.state.relations.every(e=>e.author_intent_claim===false));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'wendbine-src-parity-'));
try{
 const written=writeProjection({compiled:first,outRoot:tmp,observedAt:'2026-09-22T22:00:00Z'});
 assert.equal(written.seal.source_count,61);
 assert.ok(fs.existsSync(path.join(tmp,'01-MANIFESTS/phase2/capture-v2.jsonl')));
 assert.ok(fs.existsSync(path.join(tmp,'01-MANIFESTS/phase2/blob-v1.jsonl')));
 assert.ok(fs.existsSync(path.join(tmp,'01-MANIFESTS/phase2/derivative-v1.jsonl')));
 assert.ok(fs.existsSync(path.join(tmp,'01-MANIFESTS/phase2/rights-decision-v1.jsonl')));
 assert.ok(fs.existsSync(path.join(tmp,'01-MANIFESTS/phase2/entity-resolver-v2.jsonl')));
 assert.ok(fs.existsSync(path.join(tmp,'01-MANIFESTS/phase2/interface-registry.json')));
 assert.ok(fs.existsSync(path.join(tmp,'01-MANIFESTS/registry-index.json')));
 assert.ok(fs.existsSync(path.join(tmp,'04-RECEIPTS/phase2/current-seal.json')));
 const files=['01-MANIFESTS/phase2/capture-v2.jsonl','01-MANIFESTS/phase2/manifestations.jsonl','05-OPERATIONS/relations/typed-edges.jsonl'];
 for(const f of files){
  const text=fs.readFileSync(path.join(tmp,f),'utf8');
  assert.ok(!text.includes('Literal link'),'Private source text may not leak through public projection.');
  assert.ok(!text.includes('A new source ∴'));
 }
 assert.throws(()=>writeProjection({compiled:first,outRoot:tmp,observedAt:'2026-09-22T22:00:00Z'}),/REFUSE_OVERWRITE_ARCHIVE_RUN/);
 const second=compileSync({observed:scan.posts,previous:loadState(tmp),observedAt:'2026-09-22T22:30:00Z'});
 assert.equal(second.audit.new_source_ids.length,0);
 assert.equal(second.audit.changed_source_ids.length,0);
 assert.equal(second.audit.capture_added,2,'Every time-indexed capture is distinct, including byte-identical reobservations.');
 assert.equal(second.state.manifestations.length,first.state.manifestations.length,'Manifestation identity remains stable.');
 assert.equal(second.state.blobs.length,first.state.blobs.length,'Identical source bytes reuse one content-addressed blob.');
 assert.equal(second.state.captures.length,first.state.captures.length+2,'SRC capture multiplicity remains separate from blob multiplicity.');
 assert.equal(second.state.versions.length,first.state.versions.length+2,'Repeated archival observations preserve their own time-indexed version receipts.');
 const reread=writeProjection({compiled:second,outRoot:tmp,observedAt:'2026-09-22T22:30:00Z'});
 assert.notEqual(reread.snapshot,written.snapshot);
 assert.ok(fs.existsSync(path.join(tmp,'07-ARCHIVE-LEDGER/syncs/'+written.snapshot+'.json')));
 assert.ok(fs.existsSync(path.join(tmp,'07-ARCHIVE-LEDGER/syncs/'+reread.snapshot+'.json')));
 const tampered=path.join(tmp,'01-MANIFESTS/phase2/capture-v2.jsonl');
 fs.appendFileSync(tampered,'\\n');
 assert.throws(()=>loadState(tmp),/PREVIOUS_PROJECTION_HASH_MISMATCH/,
  'A substituted prior epoch may never seed a later operator-invoked sync.');

} finally{fs.rmSync(tmp,{recursive:true,force:true});}
await assert.rejects(()=>discover({fetchImpl:async()=>({ok:false,status:403})}),/ARCHIVE_DISCOVERY_HTTP_403/);
await assert.rejects(()=>discover({fetchImpl:async()=>({ok:true,status:200,arrayBuffer:async()=>Buffer.from('{"data":[]}')})}),/ARCHIVE_ZERO_RESULTS_NOT_EVIDENCE_OF_AUTHOR_ABSENCE/,
 'An empty archive result must hold, not mark 60 known sources absent or imply there were no new posts.');
console.log('Wendbine SRC parity autosync: seeded 60, new/changed/unchanged, custody tuple, literal edges, seal, private/public separation and failure gates PASS.');
