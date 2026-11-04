/**
 * GA02 independent adversarial probes for GA01 exact-head integration.
 * Code lives on review branch; candidate cannot write/modify these assertions.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const candidate=process.argv[2];
assert.ok(path.isAbsolute(candidate),'GA02_EXACT_CANDIDATE_CHECKOUT_REQUIRED');
const importAt=p=>import(pathToFileURL(path.join(candidate,p)).href);
const sha=b=>createHash('sha256').update(b).digest('hex');
const {runGA01IntegratedSyntheticEpisode}=await importAt('scripts/ga01-integrated-sourcefree-products-v01.mjs');
const {nativeProbe}=await importAt('scripts/reciprocal-receiver-sourcefree-v01.mjs');
const catalog=JSON.parse(fs.readFileSync(path.join(candidate,
 'packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B8/fixture-catalog.json'),'utf8'));
const w=Buffer.from(catalog.fixtures.find(f=>f.fixture_id==='W_PUBLIC').bytes_base64,'base64');
const td=Buffer.from(catalog.fixtures.find(f=>f.fixture_id==='TD_REFERENCE').bytes_base64,'base64');
const create=t=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'td613-ga02-challenge-'));
 t.after(()=>fs.rmSync(root,{force:true,recursive:true}));return root};

test('GA02 independent byte witness: exact W original survives product, local index and receiver',async t=>{
 const root=create(t),r=await runGA01IntegratedSyntheticEpisode({workspaceRoot:root});
 assert.equal(r.exact_fixture_digest,sha(w));
 assert.equal(r.source_matched_wendbine.byte_sha256,sha(w));
 const txt=fs.readFileSync(path.join(root,'INDEX','INDEX','records.jsonl'),'utf8');
 const parsed=JSON.parse(txt.trim());
 assert.equal(parsed.selftext,w.toString('utf8'));
 assert.equal(parsed.body_sha256_utf8,sha(w));
 const receiver=path.join(root,'RECEIVER',sha('WENDBINE_ATELIER_TO_UNIVERSAL_ENCYCLOPEDIA'));
 const names=fs.readdirSync(receiver).filter(x=>x.endsWith('.json'));
 assert.equal(names.length,1);
 const retained=JSON.parse(fs.readFileSync(path.join(receiver,names[0]),'utf8'));
 assert.equal(retained.original,w.toString('utf8'));
 assert.equal(retained.original_sha256,sha(w));
 assert.equal(r.source_matched_wendbine.native_library_shared_not_independent_replication,true);
 assert.equal(r.original_sources_admitted,0);
});
test('GA02 independent adverse witness: TD catalog and native intake lack exact schema parity',async()=>{
 await assert.rejects(
  nativeProbe(candidate,'TD613_ENCYCLOPEDIA_TO_UNIVERSAL_ATELIER',td.toString('utf8')),
  /NATIVE_TD613_REFUSAL/
 );
});
test('GA02 independent adverse witness: product withdrawal cannot erase separate synthetic receiver',async t=>{
 const root=create(t),r=await runGA01IntegratedSyntheticEpisode({workspaceRoot:root});
 assert.equal(r.rights.product_local_withdrawal,true);
 assert.equal(r.rights.index_local_reauth_denied,true);
 assert.equal(r.rights.reciprocal_receiver_still_readable_after_product_withdrawal,true);
 assert.equal(r.rights.global_cross_store_withdrawal,'HELD_NOT_IMPLEMENTED');
 assert.equal(r.t_states.T4,'UNEXECUTED');
 assert.equal(r.t_states.T5,'UNEXECUTED');
 assert.equal(r.protected_flight,'HELD');
});
