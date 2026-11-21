import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {join,sep} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {buildSyntheticWorkMathWardrobe,WORK_MATH_READ_PARALLELISM}
 from '../app/encyclopedia/vixen-estate/observatory-work-mathematics.mjs';
import {computeSha256HexAsync,loadJsonSibling}
 from '../app/encyclopedia/vixen-estate/corpus-experiment-a.mjs';

test('four-way bounded source verification overlaps reads and keeps original Work ordering',async()=>{
 const body='x = y + z\n';
 const hash=await computeSha256HexAsync(body);
 const works=Array.from({length:8},(_,i)=>({
  work_id:'emwork_'+(i+1).toString(16).padStart(24,'0'),
  display_title:'Synthetic Work '+i,
  linked_sources:[{
   source_file_id:'synthetic_source_'+i,
   original_filename:'synthetic.md',media_type:'text/markdown',
   sha256:'a'.repeat(64)
  }]
 }));
 const byId=new Map(works.map((w,i)=>[w.linked_sources[0].source_file_id,w.work_id]));
 let active=0,maximum=0;
 const readSource=async id=>{
  active++;maximum=Math.max(maximum,active);
  try{
   await Promise.resolve();
   return {source_file_id:id,work_id:byId.get(id),body_sha256_verified:true,
    derivative_sha256:hash,readable:true,text_body:body};
  }finally{active--}
 };
 const r=await buildSyntheticWorkMathWardrobe({works},{readSource});
 assert.equal(WORK_MATH_READ_PARALLELISM,4);
 assert.equal(maximum,4);
 assert.equal(r.examined_work_count,8);
 assert.equal(r.entries.length,8);
 assert.equal(r.source_register,'SYNTHETIC_TEST_MATERIAL');
 assert(r.entries.every(e=>e.source_role==='SYNTHETIC_TEST_MATERIAL'));
 assert.deepEqual(r.entries.map(x=>x.work_id),works.map(w=>w.work_id));
 assert.equal(r.technical_formula_promotions,0);
 assert.equal(r.source_refusals.length,0);
 assert.equal(r.entries.every(x=>x.source_body_sha256_verified&&x.source_excerpts.length>0),true);
});

test('parallel reads preserve fail-closed source SHA checks and stable refusal order',async()=>{
 const works=Array.from({length:4},(_,i)=>({
  work_id:'emwork_'+(i+10).toString(16).padStart(24,'0'),
  linked_sources:[{source_file_id:'wrong_'+i,sha256:'b'.repeat(64),original_filename:'synthetic.md'}]
 }));
 const readSource=async id=>({
  source_file_id:id,work_id:works.find(w=>w.linked_sources[0].source_file_id===id).work_id,
  body_sha256_verified:true,derivative_sha256:'0'.repeat(64),
  readable:true,text_body:'x = y + z\n'});
 const result=await buildSyntheticWorkMathWardrobe({works},{readSource});
 assert.equal(result.entries.length,0);
 assert.deepEqual(result.no_verified_math_excerpt_count,4);
 assert.deepEqual(result.source_refusals.map(x=>x.source_file_id),works.map(w=>w.linked_sources[0].source_file_id));
 assert.equal(result.source_refusals.every(x=>x.reason==='DERIVATIVE_BODY_SHA256_MISMATCH_OR_ABSENT'),true);
});

test('same sealed shard requests coalesce while a different incorrect seal remains rejected',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'vixen-sealed-shard-regression-'));
 try{
  const payload=JSON.stringify({schema:'synthetic.source-load-test/v1',sources:{}});
  await writeFile(join(dir,'test.json'),payload);
  const digest=await computeSha256HexAsync(new TextEncoder().encode(payload));
  const baseUrl=pathToFileURL(dir+sep).href;
  const opts={baseUrl,expectedSha256:digest,expectedBytes:Buffer.byteLength(payload),
   expectedSchema:'synthetic.source-load-test/v1'};
  const results=await Promise.all(Array.from({length:4},()=>loadJsonSibling('test.json',opts)));
  assert.equal(results.every(x=>x===results[0]),true,'sealed concurrent requests share one validated object');
  assert.equal(results[0].schema,opts.expectedSchema);
  await assert.rejects(loadJsonSibling('test.json',{...opts,expectedSha256:'0'.repeat(64)}),
   /EXPERIMENT_A_SHA256_MISMATCH/);
 }finally{await rm(dir,{recursive:true,force:true})}
});
