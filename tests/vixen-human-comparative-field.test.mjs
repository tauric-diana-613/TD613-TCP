import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {loadOriginalPublicFixture} from '../scripts/wendbine-proscenium-assay.mjs';
import {runNativeVixenWendbineTransfer} from '../scripts/vixen-wendbine-method-transfer.mjs';
import {loadExperimentABodyBySourceId,shardForWorkIndex}
 from '../app/encyclopedia/vixen-estate/corpus-experiment-a.mjs';
import {runLiveComparativeFieldProbes,validateFieldTrialCalibration,validateHumanComparativeJudgment}
 from '../app/encyclopedia/vixen-estate/comparative-field-probes.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const workIDs=['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'];
const digest=s=>createHash('sha256').update(s).digest('hex');
const asset=JSON.parse(readFileSync(resolve(root,'app/encyclopedia/vixen-estate/field-lens-public-calibration.json'),'utf8'));
const html=readFileSync(resolve(root,'app/encyclopedia/vix-cyb.html'),'utf8');
const corpus=JSON.parse(html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
async function docs(){
 const result=[];
 for(const work_id of workIDs){
  const idx=corpus.works.findIndex(w=>w.work_id===work_id),work=corpus.works[idx];
  let found=null;
  for(const source of work.linked_sources){
   const record=await loadExperimentABodyBySourceId(source.source_file_id,{hintShard:shardForWorkIndex(idx)});
   if(record?.body_sha256_verified===true&&record.source_file_id===source.source_file_id){
    const hash=record.derivative_sha256||record.body_sha256;
    assert.equal(digest(record.text_body),hash);
    found={work_id,source_file_id:source.source_file_id,
     verified_derivative_sha256:hash,body_sha256_verified:true,
     body:record.text_body,title:work.display_title||work.declared_title,cluster:work.cluster||'',created:work.created||null};
    break;
   }
  }
  assert(found);result.push(found);
 }
 return result;
}
const snapshot=()=>loadOriginalPublicFixture();

test('browser calibration corresponds exactly to original TD613 fixture compiler, not an authorial source import',async()=>{
 assert.equal(validateFieldTrialCalibration(asset),true);
 const {meta,posts,relations}=await snapshot();
 const compilerPath=resolve(root,'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-compile.mjs');
 const compiler=await import(pathToFileURL(compilerPath).href);
 const source=compiler.compilePublicCorpus(meta,posts,relations);
 assert.deepEqual(asset.concept_labels,source.concept_nodes.map(p=>p.label));
 assert.deepEqual(asset.public_cooccurrence_pairs,
  source.cooccurrence_overlay.map(x=>({from:x.from.slice(8),to:x.to.slice(8),weight:x.weight})));
 assert.equal(asset.source_post_count,posts.length);
 assert.equal(asset.source_registry_git_blob_sha.length,40);
 assert.equal(asset.projection_class,'TD613_DERIVED_PUBLIC_CONCEPT_TERMS_NOT_ORIGINAL_AUTHOR_METHOD');
 assert.equal(asset.not_a_vixen_work,true);
 assert.equal(asset.full_post_bodies_copied,false);
});
test('two browser methods execute on same verified Vixen Works and derived relational scores equal host implementation',async()=>{
 const documents=await docs(),query='quantum entanglement';
 const out=runLiveComparativeFieldProbes({documents,query,calibration:asset});
 const host=await runNativeVixenWendbineTransfer({repoRoot:root,work_ids:workIDs,query});
 assert.deepEqual(out.source_works.map(x=>x.work_id),workIDs);
 assert.equal(out.documentary.ranking.length,2);
 assert.equal(out.relational.ranking.length,2);
 const expected=host.counterfactuals.C0_full_body_and_public_method_profile.ranking;
 for(const [i,v]of out.relational.ranking.entries()){
  assert.equal(v.work_id,expected[i].work_id);
  assert.equal(v.score,expected[i].score);
  assert.equal(v.body_query_hits,expected[i].body_query_hits);
  assert.equal(v.title_query_hits,expected[i].title_query_hits);
  assert.equal(v.source_concept_term_hits,expected[i].source_concept_term_hits);
  assert.equal(v.public_cooccurrence_overlap_pairs,expected[i].public_cooccurrence_overlap_pairs);
 }
 assert.equal(out.method_parity,'HELD_UNPROVEN');
 assert.equal(out.private_reference_access,false);
 assert.equal(out.foreign_work_import_count,0);
 assert.equal(out.scientific_credit,0);
});
test('real observer may report source-local exact passages without granting scientific or authorial authority',async()=>{
 const documents=await docs();
 const probes=runLiveComparativeFieldProbes({documents,query:'quantum entanglement',calibration:asset});
 const report={useful_method:'DOCUMENTARY',trustworthy_method:'NEITHER',
  rationale:'The documentary route suggested a passage, but neither computation established an original authorship connection.',
  contradiction:'The public concept calibration cannot establish a causal relationship between these two original Works.',
  next_action:'Inspect two independently sourced passages and register the disconfirming comparison before another proposal.',
  source_passages:documents.map(d=>({work_id:d.work_id,source_file_id:d.source_file_id,
   excerpt:d.body.slice(0,85)}))
 };
 const rec=validateHumanComparativeJudgment({report,probes,documents});
 assert.equal(rec.source_passage_exact_match_count,2);
 assert.equal(rec.independent_external_witness,false);
 assert.equal(rec.science_credit,0);
 assert.equal(rec.human_reports_not_automatically_scientific_evidence,true);
 assert(rec.passage_provenance.every(x=>x.location_evidence==='BROWSER_MATCHED_EXACT_VERIFIED_DERIVATIVE_TEXT'));
 const forged={...report,source_passages:[{...report.source_passages[0],excerpt:'fabricated_evidence_that_is_absent'},report.source_passages[1]]};
 assert.throws(()=>validateHumanComparativeJudgment({report:forged,probes,documents}),
  /HELD_JUDGMENT_PASSAGE_NOT_IN_VERIFIED_BODY/);
 assert.throws(()=>validateHumanComparativeJudgment({report:{...report,contradiction:''},probes,documents}),
  /HELD_JUDGMENT_ADVERSE_OBSERVATION_REQUIRED/);
 assert.throws(()=>validateHumanComparativeJudgment({report:{...report,useful_method:'SCIENCE_PROVEN'},probes,documents}),
  /HELD_JUDGMENT_METHOD_CHOICE/);
 const fakeDocs=documents.map(d=>({...d,body_sha256_verified:false}));
 assert.throws(()=>runLiveComparativeFieldProbes({documents:fakeDocs,query:'quantum entanglement',calibration:asset}),
  /HELD_FIELD_TRIAL_VERIFIED_TWO_MANUSCRIPTS_REQUIRED/);
});
test('visitor-facing copy does not expose source-side names or import foreign Works',()=>{
 const code=readFileSync(resolve(root,'app/encyclopedia/vixen-estate/vixen-comparative-field-trial.mjs'),'utf8');
 const visitorLabels=code.match(/const methodLabels=\{[\s\S]*?\};/)?.[0];
 assert(visitorLabels,'Visitor-facing lens labels must be declared');
 assert.doesNotMatch(visitorLabels,/Wendbine|SignalRupture|SRC_ATELIER/i);
 assert.match(code,/original_python_host_executed:false/);
 assert.match(code,/no_network_submission:true/);
 assert.match(html,/id="vmaComparativeFieldLab"/);
 assert.match(html,/vixen-comparative-field-trial\.mjs/);
});
