import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createSyntheticLocalIndex,openSyntheticLocalIndex} from '../scripts/wendbine-gatee-synthetic-local-index-v01.mjs';
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function place(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'td613-pe02-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));return root;
}
function rows(){
 return Array.from({length:3},(_,i)=>{const title='Invented '+i,text='the echo echo Δ '+i;
 return {source_id:'FIXTURE-POST-'+i,rights:'PRIVATE_ONLY',evidence_class:'SYNTHETIC_LOCAL_ONLY',title,selftext:text,
   body_sha256_utf8:sha(Buffer.from(text)),title_sha256_utf8:sha(Buffer.from(title)),
   snapshotId:'SYNTHETIC_EPOCH',sealId:'SYNTHETIC_SEAL',capture_id:'SYNTHETIC-CAPTURE-'+i,published_at:'2026-11-02T00:00:00Z'};});
}
test('PE02: synthetic exact-index creation, independently retained reopen and pagination',t=>{
 const root=place(t),records=rows(),receipt=createSyntheticLocalIndex({root,records});
 assert.equal(receipt.manifest.count,3);assert.equal(receipt.manifest.real_sources_admitted,0);
 const key=Buffer.alloc(32,7);
 const reader=openSyntheticLocalIndex({root,root_receipt:receipt.root_receipt,cursorKey:key,allowFixture:()=>true});
 const first=reader.query({term:'echo',limit:2});assert.equal(first.total_matches,6);assert.equal(first.returned_count,2);
 let total=first.returned_count,cursor=first.next_cursor;
 while(cursor){const page=reader.query({term:'echo',limit:2,cursor});total+=page.returned_count;cursor=page.next_cursor;}
 assert.equal(total,6);
 const restricted=openSyntheticLocalIndex({root,root_receipt:receipt.root_receipt,cursorKey:key,allowFixture:id=>id==='FIXTURE-POST-0'});
 assert.equal(restricted.query({term:'echo'}).rights_excluded,2);
 assert.throws(()=>restricted.query({term:'echo',cursor:first.next_cursor}),/STALE_OR_CROSS_QUERY_CURSOR/);
 assert.throws(()=>createSyntheticLocalIndex({root,records}),/PE02_EXCLUSIVE_EMPTY_ROOT_REQUIRED/);
});
test('PE02: wrong external receipt, tampering, real-source labels and extra files fail closed',t=>{
 const root=place(t),receipt=createSyntheticLocalIndex({root,records:rows()});
 const opts={root,root_receipt:receipt.root_receipt,cursorKey:Buffer.alloc(32,9),allowFixture:()=>true};
 assert.throws(()=>openSyntheticLocalIndex({...opts,root_receipt:'0'.repeat(64)}),/PE02_INDEPENDENT_RETAINED_ROOT_RECEIPT_REQUIRED/);
 const p=path.join(root,'INDEX','records.jsonl'),original=fs.readFileSync(p);
 fs.writeFileSync(p,Buffer.concat([original,Buffer.from('corrupt\n')]));
 assert.throws(()=>openSyntheticLocalIndex(opts),/INDEPENDENT_LOCAL_INDEX_ANCHOR_MISMATCH/);
 fs.writeFileSync(p,original);
 fs.writeFileSync(path.join(root,'INDEX','UNEXPECTED'),'');
 assert.throws(()=>openSyntheticLocalIndex(opts),/PE02_UNEXPECTED_OR_INTERRUPTED_STATE/);
});
test('PE02: original-style records cannot enter source-free store',t=>{
 const root=place(t),a=rows();a[0].source_id='reddit:t3_abcdefgh';
 assert.throws(()=>createSyntheticLocalIndex({root,records:a}),/PE02_REAL_OR_TAMPERED_RECORD_REFUSED/);
 assert.deepEqual(fs.readdirSync(root),[]);
});
