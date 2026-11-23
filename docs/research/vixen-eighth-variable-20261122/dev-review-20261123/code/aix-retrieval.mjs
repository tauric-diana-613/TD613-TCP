/** Existing Podium machine routes connected to the local development overlay. */
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {loadOverlay,defaultBaseline,A0} from './seven-source-overlay.mjs';
const {createVixenPodium,PODIUM_SCHEMA}=await import(pathToFileURL(path.join(defaultBaseline,'app/encyclopedia/reference/vixen-podium.mjs')));
const overlay=await loadOverlay('vixen-seven-source-dev/seven-source-index.json');
const corpus=JSON.parse(await fs.readFile(path.resolve(defaultBaseline,'../baseline-corpus.json')));
const podium=createVixenPodium({corpus,semanticSearch:overlay,sourceRevision:A0});
const task=(intent,params={})=>({schema:PODIUM_SCHEMA,intent,params});
const query='algedonic feedback semantic drift';
const receipts={};
receipts.capabilities=await podium.dispatch(task('vixen.fusion.capabilities'));
receipts.search=await podium.dispatch(task('vixen.fusion.search',{query,limit:7}));
assert.equal(receipts.search.status,'SUPPORTED');
assert.equal(receipts.search.result.search.scope,'supplement');
assert.ok(receipts.search.result.search.hits.length>0);
assert.ok(receipts.search.result.search.hits.every(h=>!h.work_id&&h.page_number));
receipts.compare=await podium.dispatch(task('vixen.fusion.compare',{
 query,limit:7,profiles:['FULL_FUSION','LEXICAL_ONLY','SEMANTIC_ONLY','SEMIOTIC_ONLY'],
 weight_policy:'RENORMALIZE_ACTIVE'
}));
assert.equal(receipts.compare.status,'SUPPORTED');
assert.equal(receipts.compare.result.comparisons.length,4);
const hit=receipts.search.result.search.hits[0];
receipts.explain=await podium.dispatch(task('vixen.fusion.explain',{query,limit:7,hit_id:hit.id}));
assert.equal(receipts.explain.status,'SUPPORTED');
assert.equal(receipts.explain.result.source_file_id,hit.source_file_id);
assert.equal(receipts.explain.result.citation.page_number,hit.page_number);
receipts.src=await podium.dispatch(task('vixen.fusion.search',{
 query:'Explore algedonic bypass.',mode:'src_projective',profile:'SRC_ONLY',
 weight_policy:'RENORMALIZE_ACTIVE',limit:7
}));
assert.equal(receipts.src.status,'SUPPORTED');
assert.ok(receipts.src.result.search.hits.some(h=>h.s_src>0));
receipts.conductor=await podium.conduct({search:query,limit:7});
assert.equal(receipts.conductor.status,'SUPPORTED');
assert.ok(receipts.conductor.result.vixen_search.hits.length>0);
// Preserve this existing descriptive defect: conductSearch labels every attached
// result EMSTD613, even when the attached index has a noncanonical supplement.
// Fusion dispatch preserves the correct nested scope. Never call the outer label
// proof that these PDFs entered the historical EM estate.
const outerEstateDefect=receipts.conductor.result.estate;
receipts.semantic_semiotic=await podium.dispatch(task('vixen.fusion.search',{
 query,channels:{lexical:false,semantic:true,semiotic:true,src:false},
 weight_policy:'RENORMALIZE_ACTIVE',limit:7}));
assert.equal(receipts.semantic_semiotic.status,'SUPPORTED');
assert.ok(receipts.semantic_semiotic.result.search.hits.some(h=>h.fusion_contributions.semantic>0&&h.fusion_contributions.semiotic>0));
receipts.negative=await podium.dispatch(task('vixen.fusion.search',{query:'qxzvblorpf quazznorpz'}));
assert.equal(receipts.negative.result.search.hits.length,0);
for(const r of Object.values(receipts))assert.equal(r.authority.release,false);
const report={classification:'LOCAL_DEVELOPER_PODIUM_ROUTE_INTEROPERABILITY_NOT_LIVE_CONNECTED_MODEL',
 connection:'createVixenPodium({corpus:unchangedA0,semanticSearch:overlay})',
 exercised:['vixen.fusion.capabilities','vixen.fusion.search','vixen.fusion.compare','vixen.fusion.explain','aix.conductor.search','SRC_ONLY/src_projective','semantic–semiotic paired channels'],
 existing_label_defect:{outer_estate:outerEstateDefect,actual_scope:'seven prospective Vixen development sources, not the original EM estate',
  smallest_repair:'derive conductor result source scope from attached engine metadata; preserve each hit identity'},
 original_src_engine_execution:false,wendbine_private_corpus_accessed:false,
 new_models_connected:false,human_role_choice_simulated:false,compose_authorization_claimed:false,
 canonical_work_mutations:0,primary_answer_model_trials:0,receipts};
await fs.writeFile('vixen-seven-source-dev/evidence/aix-route-interoperability.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({status:'PASS',routes:report.exercised,search_hits:receipts.search.result.search.hits.length,
 src_hits:receipts.src.result.search.hits.length,label_defect:report.existing_label_defect},null,2));
