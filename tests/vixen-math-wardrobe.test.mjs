import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {VIXEN_THEORY_IDS,selectVixenTheoryFolios,computeVixenTheoryReceipt} from '../app/encyclopedia/vixen-estate/observatory-math-wardrobe.mjs';
const html=readFileSync(new URL('../app/encyclopedia/vix-cyb.html',import.meta.url),'utf8');
const marker='<script id="vixen-corpus-bundle" type="application/json">';
const start=html.indexOf(marker),end=html.indexOf('</script>',start+marker.length);
assert.ok(start>=0&&end>start);
const corpus=JSON.parse(html.slice(start+marker.length,end));
test('wardrobe distinguishes seven inquiries and one authorial title ornament, retaining 14 technical records in source',()=>{
 const x=selectVixenTheoryFolios(corpus);
 assert.deepEqual(x.theories.map(f=>f.id),VIXEN_THEORY_IDS);
 assert.equal(x.retained_technical_count,14);
 assert.match(html,/THE VIXEN MATHEMATICAL WARDROBE · SEVEN INQUIRIES \+ ONE ORNAMENT/);
 assert.doesNotMatch(html,/Refractive Couture RC-01\.\.14 \(14\)/);
});
test('exact Vixen formula invokes Foundry and unified candidate ranking with zero scientific promotion',()=>{
 const x=computeVixenTheoryReceipt(corpus,'TCC-04');
 assert.equal(x.foundry.lab_id,'LAB_TCC-04');
 assert.ok(x.foundry.metrics.length>0);
 assert.ok(x.synthesis.candidate_count>=1);
  assert.equal(x.synthesis.conditioning_folio,'TCC-04');
  assert.match(x.synthesis.question,/Five Non-Equivalent Derivative Clocks/);
 assert.equal(x.synthesis.engine,'NATIVE_UNIFIED_CANDIDATE_RANKING');
 assert.equal(x.authority.empirical_credit,0);
 assert.equal(x.authority.technical_methods_elevated,0);
});
test('archive engineering cannot cross into Vixen theory performer',()=>{
 assert.throws(()=>computeVixenTheoryReceipt(corpus,'RC-07'),/TECHNICAL_METHOD_NOT_VIXEN_PERFORMER/);
 assert.match(html,/foundry\?\.selectLab\?\.\(exactId\)/);
 assert.match(html,/const foundryBtn = f.id==='TCC-08' \? ''/);
 assert.match(html,/\^TCC-0\[1-7\]\$\/\.test\(String\(folioId\)\)/);
 assert.match(html,/Only the seven inquiry folios may stage a Foundry model/);
 const ornament=computeVixenTheoryReceipt(corpus,'TCC-08');
 assert.equal(ornament.foundry.lab_id,null,'Ornament inspection must not invoke an optical experiment');
 assert.equal(ornament.synthesis.candidate_count,0);
 assert.doesNotMatch(html,/startsWith\('TCC'\) \? 'LAB_TCC-05'/);
});
