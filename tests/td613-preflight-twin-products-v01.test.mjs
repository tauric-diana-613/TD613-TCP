import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openTwinProducts} from '../scripts/td613-preflight-twin-products-v01.mjs';
import {ATELIER,ENCYCLOPEDIA} from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B8/product-entry-v01.mjs';

async function fresh(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'td613-pe05-'));
 t.after(()=>fs.rmSync(root,{force:true,recursive:true}));
 const a=path.join(root,'atelier'),e=path.join(root,'encyclopedia');
 fs.mkdirSync(a,{mode:0o700});fs.mkdirSync(e,{mode:0o700});
 return {root,a,e};
}
test('PE05-A: two distinct empty instantiated product stores, role-bound fixture catalogs, zero real admission',async t=>{
 const w=await fresh(t);const twin=await openTwinProducts({atelierWorkspace:w.a,encyclopediaWorkspace:w.e,create:true});
 assert.equal(twin.atelier.product_id,ATELIER);
 assert.equal(twin.encyclopedia.product_id,ENCYCLOPEDIA);
 assert.notEqual(twin.atelier.root_receipt,twin.encyclopedia.root_receipt);
 const [a,e]=await Promise.all([twin.atelier.request({action:'status'}),twin.encyclopedia.request({action:'status'})]);
 assert.notEqual(a.instance_id,e.instance_id);
 assert.equal(a.real_sources_admitted,0);assert.equal(e.real_sources_admitted,0);
 assert.equal(a.candidate_status.engine_status,'UNEXECUTED');
 assert.equal(e.candidate_status.engine_status,'UNEXECUTED');
 const [af,ef]=await Promise.all([twin.atelier.request({action:'describeFixtures'}),twin.encyclopedia.request({action:'describeFixtures'})]);
 assert.ok(af.length>=3 && ef.length>=1);
 assert.ok(af.every(x=>x.product_id===ATELIER));
 assert.ok(ef.every(x=>x.product_id===ENCYCLOPEDIA));
 assert.deepEqual(fs.readdirSync(w.a).sort(),['PRODUCT.json','SYNTHETIC_FIXTURES','WITHDRAWN_CATALOG'].sort());
 assert.deepEqual(fs.readdirSync(w.e).sort(),['PRODUCT.json','SYNTHETIC_FIXTURES','WITHDRAWN_CATALOG'].sort());
 await assert.rejects(()=>twin.encyclopedia.request({action:'threeOriginTrace',product_id:ENCYCLOPEDIA}),/PE05_ENCYCLOPEDIA_TRACE_REFUSED/);
 await assert.rejects(()=>twin.encyclopedia.request({action:'execute',product_id:ATELIER,source_id:'FIXTURE-TD',receipt:'fake',operation:'search'}),/PE05_CROSS_PRODUCT_REQUEST_REFUSED/);
 await assert.rejects(()=>twin.atelier.request({action:'admitRealSource'}),/PE05_ACTION_DENIED/);
});
test('PE05-B: cold reopen requires both independent retained receipts; no same-store disguise',async t=>{
 const w=await fresh(t);const original=await openTwinProducts({atelierWorkspace:w.a,encyclopediaWorkspace:w.e,create:true});
 const reopened=await openTwinProducts({atelierWorkspace:w.a,encyclopediaWorkspace:w.e,rootReceipts:original.rootReceipts});
 assert.equal(reopened.atelier.root_receipt,original.atelier.root_receipt);
 await assert.rejects(()=>openTwinProducts({atelierWorkspace:w.a,encyclopediaWorkspace:w.e,rootReceipts:{atelier:original.rootReceipts.encyclopedia,encyclopedia:original.rootReceipts.atelier}}),/B8_RETAINED_ROOT_RECEIPT/);
 await assert.rejects(()=>openTwinProducts({atelierWorkspace:w.a,encyclopediaWorkspace:w.a,rootReceipts:original.rootReceipts}),/PE05_INDEPENDENT_WORKSPACES_REQUIRED/);
});
