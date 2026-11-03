import test from 'node:test';
import assert from 'node:assert/strict';
import {queryLocalPage} from '../scripts/wendbine-gatee-sourcefree-v02.mjs';
import crypto from 'node:crypto';
const h=s=>crypto.createHash('sha256').update(s).digest('hex');
const rows=Array.from({length:3},(_,i)=>({source_id:'reddit:t3_'+String(i).padStart(5,'0'),capture_id:'c'+i,body_sha256_utf8:h('foo foo'),title_sha256_utf8:h('title'),selftext:'foo foo',title:'title',published_at:'2026-11-02T12:00:00Z',rights:'PRIVATE_ONLY',snapshotId:'test-snapshot',sealId:'test-seal'}));
const base={records:rows,kind:'search',term:'foo',limit:1,cursorKey:Buffer.alloc(32,3)};
test('independent GE-Q02: withdrawal invalidates issued cursor',()=>{
 const p=queryLocalPage({...base,allowSource:()=>true});
 assert.ok(p.next_cursor);
 assert.throws(()=>queryLocalPage({...base,cursor:p.next_cursor,allowSource:r=>r.source_id!==rows[0].source_id}),/STALE_OR_TAMPERED_CURSOR|STALE_OR_CROSS_QUERY_CURSOR/);
});
test('independent GE-Q02: all overlapping exact byte occurrences are enumerated',()=>{
 const one={...rows[0],selftext:'aaaa',body_sha256_utf8:h('aaaa')};
 const p=queryLocalPage({...base,records:[one],term:'aa',limit:10,allowSource:()=>true});
 assert.deepEqual(p.results.map(x=>x.start_utf8),[0,1,2]);
});
