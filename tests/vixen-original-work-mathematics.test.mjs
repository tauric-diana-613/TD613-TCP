import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 extractOriginalMathPassages,buildOriginalWorkMathWardrobe,scoreOriginalWorkMath
} from '../app/encyclopedia/vixen-estate/observatory-work-mathematics.mjs';
const html=readFileSync(new URL('../app/encyclopedia/vix-cyb.html',import.meta.url),'utf8');
const marker='<script id="vixen-corpus-bundle" type="application/json">';
const i=html.indexOf(marker),j=html.indexOf('</script>',i+marker.length);
assert.ok(i>=0&&j>i);
const corpus=JSON.parse(html.slice(i+marker.length,j));
const lookup=new Map(corpus.works.flatMap(w=>w.linked_sources.map(s=>[s.source_file_id,w])));
const admittedFixture=async source_file_id=>{
 const work=lookup.get(source_file_id);
 return {source_file_id,work_id:work.work_id,readable:true,body_sha256_verified:true,
  derivative_sha256:'SYNTHETIC_FIXTURE_ONLY',text_body:'$$a + b = c$$'};
};
test('math extraction returns exact literal source positions without proof promotion',()=>{
 const passages=extractOriginalMathPassages('Words before $$a + b = c$$ and after');
 assert.equal(passages[0].literal,'a + b = c');
 assert.equal(passages[0].offset_utf16,13);
 assert.equal(passages[0].independent_proof,false);
 assert.equal(extractOriginalMathPassages('Ordinary paragraph with no notation').length,0);
});
test('readable Work manifestations determine inventory; TCC and RC cannot supply Works',async()=>{
 const x=await buildOriginalWorkMathWardrobe({works:corpus.works.slice(0,2)},{readSource:admittedFixture});
 assert.equal(x.examined_work_count,2);
 assert.equal(x.verified_work_math_count,2);
 assert.deepEqual(x.entries.map(e=>e.work_id),corpus.works.slice(0,2).map(w=>w.work_id));
 assert.equal(x.technical_formula_promotions,0);
 assert.equal(x.empirical_credit,0);
 assert.ok(x.entries.every(e=>e.source_excerpts[0].literal==='a + b = c'));
});
test('unverified or mismatched source refuses instead of substituting host engineering',async()=>{
 const x=await buildOriginalWorkMathWardrobe({works:corpus.works.slice(0,1)},{readSource:async id=>({
  source_file_id:id,body_sha256_verified:false,readable:true,text_body:'$$a+b=c$$'
 })});
 assert.equal(x.verified_work_math_count,0);
 assert.equal(x.no_verified_math_excerpt_count,1);
 assert.ok(x.source_refusals.length>0);
 assert.equal(x.technical_formula_promotions,0);
});
test('source-conditioned candidate receipt retains evidence and native-execution holds',async()=>{
 const x=await buildOriginalWorkMathWardrobe({works:corpus.works.slice(0,1)},{readSource:admittedFixture});
 const receipt=scoreOriginalWorkMath(corpus,x.entries[0]);
 assert.equal(receipt.work_id,x.entries[0].work_id);
 assert.equal(receipt.source_file_id,x.entries[0].source_file_id);
 assert.equal(receipt.excerpt_literal,'a + b = c');
 assert.equal(receipt.native_host_tools_executed,false);
 assert.equal(receipt.empirical_credit,0);
 assert.ok(receipt.candidates.length>0);
 assert.throws(()=>scoreOriginalWorkMath(corpus,{...x.entries[0],declared_source_sha256:'0'.repeat(64)}),
  /UNVERIFIED_OR_FOREIGN_MATHEMATICAL_MANUSCRIPT/);
});
