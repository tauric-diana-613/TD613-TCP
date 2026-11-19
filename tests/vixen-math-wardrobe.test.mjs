import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {VIXEN_THEORY_IDS,selectVixenTheoryFolios,computeVixenTheoryReceipt}
 from '../app/encyclopedia/vixen-estate/observatory-math-wardrobe.mjs';
import {extractOriginalMathPassages,buildOriginalWorkMathWardrobe,scoreOriginalWorkMath}
 from '../app/encyclopedia/vixen-estate/observatory-work-mathematics.mjs';

const html=readFileSync(new URL('../app/encyclopedia/vix-cyb.html',import.meta.url),'utf8');
const marker='<script id="vixen-corpus-bundle" type="application/json">';
const start=html.indexOf(marker),end=html.indexOf('</script>',start+marker.length);
assert(start>=0&&end>start);
const corpus=JSON.parse(html.slice(start+marker.length,end));

test('public mathematical wardrobe derives from source-verified original Works rather than technical formula inventory',()=>{
 assert.match(html,/THE VIXEN MATHEMATICAL WARDROBE · ORIGINAL WORK MATHEMATICS/);
 assert.match(html,/buildOriginalWorkMathWardrobe\(DATA\)/);
 assert.match(html,/data-work-math-id/);
 assert.match(html,/data-original-math-passage/);
 assert.match(html,/data-open-ref=.*entry\\.work_id/);
 assert.match(html,/source-backed Works/);
 assert.doesNotMatch(html,/data-compute-vixen-folio=/);
 assert.doesNotMatch(html,/data-foundry-folio=/);
});

test('legacy TCC register remains preserved as historical source notes without being the public original Work wardrobe',()=>{
 const x=selectVixenTheoryFolios(corpus);
 assert.deepEqual(x.theories.map(f=>f.id),VIXEN_THEORY_IDS);
 assert.equal(x.retained_technical_count,14);
 const original=computeVixenTheoryReceipt(corpus,'TCC-04');
 assert.equal(original.foundry.lab_id,'LAB_TCC-04');
 assert.equal(original.synthesis.engine_trace.native_host_executable_invoked,false);
 assert.equal(original.synthesis.engine_trace.manuscript_passages_read_by_wardrobe,false);
 const ornament=computeVixenTheoryReceipt(corpus,'TCC-08');
 assert.equal(ornament.folio_kind,'TITLE_LOCUS_ORNAMENT');
 assert.equal(ornament.source_title_locus_ornament,true);
 assert.throws(()=>computeVixenTheoryReceipt(corpus,'RC-07'),/TECHNICAL_METHOD_NOT_VIXEN_PERFORMER/);
});

test('mathematical passages are transcribed from text and never invented from metadata',()=>{
 assert.deepEqual(extractOriginalMathPassages('Only a poetic headline without mathematics.'),[]);
 const math=extractOriginalMathPassages('Here is a source relation: $$x^2+y^2=z^2$$');
 assert.equal(math.length,1);
 assert.equal(math[0].literal,'x^2+y^2=z^2');
 assert.equal(math[0].independent_proof,false);
});

test('verified Work mathematics preserves manuscript identity and digest; rejects caller-forged receipts',async()=>{
 const work=corpus.works[0],source=work.linked_sources[0];
 const body='An independently recorded equation: $$x^2+y^2=z^2$$.\n';
 const derivative=createHash('sha256').update(body).digest('hex');
 const readSource=async id=>id===source.source_file_id?{
  source_file_id:id,work_id:work.work_id,text_body:body,
  derivative_sha256:derivative,body_sha256_verified:true,readable:true
 }:null;
 const wardrobe=await buildOriginalWorkMathWardrobe(corpus,{readSource});
 assert.equal(wardrobe.examined_work_count,corpus.works.length);
 assert.equal(wardrobe.verified_work_math_count,1);
 assert.equal(wardrobe.technical_formula_promotions,0);
 const entry=wardrobe.entries[0];
 assert.equal(entry.work_id,work.work_id);
 assert.equal(entry.source_file_id,source.source_file_id);
 assert.equal(entry.declared_source_sha256,source.sha256);
 assert.equal(entry.derivative_sha256,derivative);
 assert.equal(entry.source_excerpts[0].literal,'x^2+y^2=z^2');
 const result=scoreOriginalWorkMath(corpus,entry);
 assert.equal(result.work_id,entry.work_id);
 assert.equal(result.excerpt_literal,entry.source_excerpts[0].literal);
 assert.equal(result.native_host_tools_executed,false);
 assert.equal(result.empirical_credit,0);
 assert.throws(()=>scoreOriginalWorkMath(corpus,{...entry}),/UNVERIFIED_OR_FOREIGN_MATHEMATICAL_MANUSCRIPT/);
 const corrupted=await buildOriginalWorkMathWardrobe(corpus,{readSource:async id=>
  id===source.source_file_id?{source_file_id:id,work_id:work.work_id,text_body:body,
   derivative_sha256:'0'.repeat(64),body_sha256_verified:true,readable:true}:null});
 assert.equal(corrupted.verified_work_math_count,0);
 assert(corrupted.source_refusals.some(x=>x.reason==='DERIVATIVE_BODY_SHA256_MISMATCH_OR_ABSENT'));
});
