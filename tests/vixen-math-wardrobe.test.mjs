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
 assert.match(html,/data-open-ref.*?esc\(entry\.work_id\)/,'Original Work reader route must use its original Work ID');
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

test('canonical mathematics preserves source identity and refuses self-consistent forged reader bytes',async()=>{
 const work=corpus.works.find(w=>w.linked_sources.some(s=>s.source_file_id==='emsrc_31ed6fb3bdc15d3c29b8ae13'));
 const wardrobe=await buildOriginalWorkMathWardrobe({works:[work]});
 assert.equal(wardrobe.entries.length,1);
 const entry=wardrobe.entries[0];
 assert.equal(entry.source_role,'PERFORMER_WORK_MANIFESTATION');
 assert.equal(entry.work_id,work.work_id);
 assert.equal(scoreOriginalWorkMath(corpus,entry).empirical_credit,0);
 assert.throws(()=>scoreOriginalWorkMath(corpus,{...entry}),/UNVERIFIED_OR_FOREIGN/);
 const body='$$x^2+y^2=z^2$$',derivative=createHash('sha256').update(body).digest('hex');
 const forged=await buildOriginalWorkMathWardrobe({works:[work]},{readSource:async id=>({
  source_file_id:id,work_id:work.work_id,text_body:body,derivative_sha256:derivative,body_sha256_verified:true,readable:true
 })});
 assert.equal(forged.entries.length,0);
 assert(forged.source_refusals.every(r=>r.reason==='CANONICAL_DERIVATIVE_BINDING_REQUIRED'));
});

test('original manuscript titles and exact mathematical passages are exempt from display-copy substitution',()=>{
 assert.match(html,/<h3 data-vixen-source-provenance="true">/);
 assert.match(html,/data-original-math-passage data-vixen-source-provenance="true"/);
 assert.match(html,/quote\.setAttribute\('data-vixen-source-provenance','true'\)/);
 assert.match(html,/renderFormulaFolios\(\);\s*drawObservatoryCanvas\(\)/);
});
