import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {runGA01IntegratedSyntheticEpisode} from '../scripts/ga01-integrated-sourcefree-products-v01.mjs';

const mk=t=>{const home=fs.mkdtempSync(path.join(os.tmpdir(),'td613-ga01-'));
 t.after(()=>fs.rmSync(home,{recursive:true,force:true}));return home};

test('GA01 actual source-free product + reciprocal + index integration: T0–T3, exact bytes, native method receipts',async t=>{
 const home=mk(t),r=await runGA01IntegratedSyntheticEpisode({workspaceRoot:home});
 assert.equal(r.schema,'td613.ga01.sourcefree-real-api-integration/v1');
 assert.notEqual(r.product_instance_ids.atelier,r.product_instance_ids.encyclopedia);
 assert.ok(Object.values(r.executed_methods).every(n=>n>0));
 assert.equal(r.source_matched_wendbine.exact_byte_cross_product_readback,true);
 assert.equal(r.source_matched_wendbine.independent_receiver_byte_readback,true);
 assert.equal(r.source_matched_wendbine.product_native_edge_sha256,
    r.source_matched_wendbine.independent_native_edge_sha256);
 assert.equal(r.offline_index.reopened_independent_receipt,true);
 assert.equal(r.t_states.T4,'UNEXECUTED');assert.equal(r.t_states.T5,'UNEXECUTED');
 assert.equal(r.original_sources_admitted,0);assert.equal(r.external_provider_calls,0);
 assert.equal(r.protected_flight,'HELD');
 assert.equal(fs.existsSync(path.join(home,'ATELIER','PRODUCT.json')),true);
 assert.equal(fs.existsSync(path.join(home,'ENCYCLOPEDIA','PRODUCT.json')),true);
});
test('GA01 adverse witness: local withdrawal leaves independently stored receiver fixture readable',async t=>{
 const r=await runGA01IntegratedSyntheticEpisode({workspaceRoot:mk(t)});
 assert.equal(r.rights.product_local_withdrawal,true);
 assert.equal(r.rights.index_local_reauth_denied,true);
 assert.equal(r.rights.reciprocal_receiver_still_readable_after_product_withdrawal,true);
 assert.equal(r.rights.global_cross_store_withdrawal,'HELD_NOT_IMPLEMENTED');
 assert.equal(r.td_route.B91_TD_REFERENCE_same_schema_as_native_TD613,false);
 assert.equal(r.td_route.independent_cross_implementation_original_identity,'HELD_SCHEMA_DIFFERENCE');
});
test('GA01 refuses nonempty and linked workspace root without reading originals',async t=>{
 const home=mk(t);fs.writeFileSync(path.join(home,'PREEXISTING'),'do not overwrite');
 await assert.rejects(runGA01IntegratedSyntheticEpisode({workspaceRoot:home}),/GA01_EMPTY_ROOT_EXCLUSIVE/);
 const linked=path.join(os.tmpdir(),'ga01-symlink-'+process.pid+'-'+Date.now());fs.symlinkSync(home,linked);
 t.after(()=>fs.rmSync(linked,{force:true}));
 await assert.rejects(runGA01IntegratedSyntheticEpisode({workspaceRoot:linked}),/GA01_ABSOLUTE_REAL_EMPTY_ROOT_REQUIRED/);
 assert.equal(fs.readFileSync(path.join(home,'PREEXISTING'),'utf8'),'do not overwrite');
});
