import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildDocket3,validateDocket3,renderDocket3,chatDocket3,stageDocket3} from '../packages/rulefield/operator/docket3.mjs';
const registryURL=new URL('../packages/rulefield/data/rulefield.v1.json',import.meta.url),source=readFileSync(registryURL);
const docket=()=>buildDocket3({head:'c'.repeat(40),as_of:'2026-11-08T12:00:00Z'});
test('ROD3 01 all 559 original statements and 86 field expressions are retained',()=>{
 const d=docket();assert.ok(validateDocket3(d));assert.equal(d.rows.length,559);
 assert.equal(d.original_field_expressions.length,86);assert.equal(d.original_historical_priorities.length,70);
 assert.equal(d.total_registry_count,596);
});
test('ROD3 02 explicit human holds and zero autonomous scientific promotion',()=>{
 const d=docket();
 assert.equal(d.authority.od02,'HELD');
 assert.equal(d.authority.protected_flight,'HELD');
 assert.equal(d.authority.source_registry_mutated,false);
 assert.equal(d.authority.merge_allowed,false);
 assert.equal(d.preview.rankable,0);
 assert.equal(d.preview.priority_moves,0);
});
test('ROD3 03 Markdown contains every residual historical original statement',()=>{
 const d=docket(),s=renderDocket3(d);
 for(const row of d.rows)assert.ok(s.includes(row.original_statement.replaceAll('|','\\|').replace(/\r?\n/g,' ⏎ ')),row.id);
 for(const f of d.original_field_expressions)assert.ok(s.includes(f.original.replaceAll('|','\\|').replace(/\r?\n/g,' ⏎ ')),f.id);
 assert.ok(s.includes('RF-OD-0003'));assert.ok(s.includes('427'));
});
test('ROD3 04 chat groups exactly 559 source expressions without truncation',()=>{
 const d=docket(),c=chatDocket3(d);
 assert.equal(c.groups.reduce((sum,g)=>sum+g.items.length,0),559);
 assert.equal(new Set(c.groups.flatMap(g=>g.items.map(x=>x.id))).size,559);
 assert.ok(c.decisions.every(x=>x.draft.includes(d.digest)));
});
test('ROD3 05 revised docket digest changes with source HEAD, rejects tampering',()=>{
 const x=docket(),y=buildDocket3({head:'d'.repeat(40),as_of:'2026-11-08T12:00:00Z'});
 assert.notEqual(x.digest,y.digest);
 x.workstreams[0].status='ADOPTED';
 assert.equal(validateDocket3(x),false);
});
test('ROD3 06 stage is byte-idempotent and preserves canonical registry',()=>{
 const dir=mkdtempSync(join(tmpdir(),'rod3-'));
 try{
  const d=docket(),a=stageDocket3(d,{folder:dir}),b=stageDocket3(d,{folder:dir});
  assert.deepEqual(a,b);assert.equal(a.files.length,3);
  assert.ok(a.files.every(x=>x.bytes>0&&/^[a-f0-9]{64}$/.test(x.sha256)));
 }finally{rmSync(dir,{recursive:true,force:true})}
 assert.deepEqual(readFileSync(registryURL),source);
});
