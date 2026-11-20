import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadExperimentABodyBySourceId,shardForWorkIndex}
 from '../app/encyclopedia/vixen-estate/corpus-experiment-a.mjs';
import {validateSourceChallengeCatalogue,validateSourceChallengeDocuments,
 runBrowserSourceChallenge,validateBrowserSourceChallengeReport}
 from '../app/encyclopedia/vixen-estate/em-source-challenge-probes.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(ROOT,'app/encyclopedia/vix-cyb.html'),'utf8');
const catalogue=JSON.parse(html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
const IDs=['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'];
const digest=x=>createHash('sha256').update(x,'utf8').digest('hex');
const clone=x=>structuredClone(x);
async function docs(){
 const out=[];
 for(const id of IDs){
  const idx=catalogue.works.findIndex(w=>w.work_id===id),w=catalogue.works[idx];
  assert(w,'Original test Work missing');
  const source=w.linked_sources[0];
  const r=await loadExperimentABodyBySourceId(source.source_file_id,
   {hintShard:shardForWorkIndex(idx)});
  assert.equal(r.body_sha256_verified,true);
  assert.equal(digest(r.text_body),r.derivative_sha256||r.body_sha256);
  out.push({work_id:id,source_file_id:source.source_file_id,
   declared_original_source_sha256:source.sha256,
   verified_derivative_sha256:digest(r.text_body),
   body_sha256_verified:true,body:r.text_body,title:w.display_title||w.declared_title||id});
 }
 return out;
}
test('exact 32/53 Work catalogue with eight human gates produces 256 bounded partitions',()=>{
 const c=validateSourceChallengeCatalogue(catalogue);
 assert.equal(c.work_count,32);
 assert.equal(c.manifestation_count,53);
 assert.equal(c.human_gated_groups,8);
 assert.equal(c.split_collapse_partitions,256);
 assert.equal(c.lower_independent_work_count,32);
 assert.equal(c.upper_independent_work_count,40);
 assert.equal(c.human_identity_resolution,'HELD_UNADJUDICATED');
 assert.throws(()=>validateSourceChallengeCatalogue({...catalogue,works:catalogue.works.slice(1)}),
  /HELD_CHALLENGE_CATALOGUE/);
});
test('browser-derived exact source challenge chooses real shared candidate, hashes UTF-8 spans and revises claim after an adverse control',async()=>{
 const documents=await docs();
 const r=await runBrowserSourceChallenge({documents,corpus:catalogue,
  question:'What relation might survive an exact source and boundary challenge?'});
 assert.equal(r.schema,'td613.vixen.public-source-hostile-challenge/v1');
 assert.equal(r.source_derived_candidate!==null,true,'Known Work pair must share one bounded term');
 assert.equal(r.exact_span_locators.length,2);
 for(const [i,loc]of r.exact_span_locators.entries()){
  const d=documents[i],raw=Buffer.from(d.body,'utf8');
  assert.equal(loc.verified_derivative_sha256,d.verified_derivative_sha256);
  const piece=raw.subarray(loc.utf8_offset,loc.utf8_offset+loc.utf8_length);
  assert.equal(piece.toString('utf8').toLowerCase(),r.source_derived_candidate);
  assert.equal(createHash('sha256').update(piece).digest('hex'),loc.exact_span_sha256);
 }
 assert.equal(r.control.source_two_occurrences_after,0);
 assert(r.control.source_two_occurrences_before>0);
 assert.equal(r.control.original_source_edited,false);
 assert.equal(r.control.physical_causal_mechanism_falsified,false);
 assert.equal(r.decision.after,'FRAGILE_LEXICAL_PAIR_MECHANISM_HELD');
 assert.equal(r.original_native_method_executed_in_browser,false);
 assert.equal(r.scientific_claim_earned,false);
 assert.equal(r.external_scientific_credit,0);
 assert.equal(r.eight_human_identity_gates_resolved,false);
 assert.deepEqual(r.source_works.map(x=>x.work_id),IDs);
 console.log('VIXEN_PUBLIC_EM_CHALLENGE '+JSON.stringify({
  source_spans:r.exact_span_locators.length,
  selected_term:r.source_derived_candidate,
  after_withdrawal:r.control.source_two_occurrences_after,
  recorded_human_reports:r.human_report_recorded,
  original_python_in_browser:r.original_native_method_executed_in_browser,
  scientific_credit:r.external_scientific_credit}));
});
test('exact-passage human report validates two actual excerpts, but human mapping remains an unverified account',async()=>{
 const documents=await docs();
 const result=await runBrowserSourceChallenge({documents,corpus:catalogue,
  question:'What source operator relation survives different conditions?'});
 const report={judgment:'STRUCTURAL_CANDIDATE_UNPROVEN',
  passages:documents.map(d=>({work_id:d.work_id,source_file_id:d.source_file_id,
   excerpt:d.body.slice(0,110)})),
  entities:'The two source Works name separate entities that need formal identification.',
  operators:'Look for a specific observable operator and its typed mapping on both sides.',
  boundary_conditions:'The domains and assumptions may differ and must be matched explicitly.',
  predicted_consequences:'Each candidate would require an independently discriminating result.',
  field_generic_rival:'Field-generic vocabulary and a common upstream source could explain overlap.',
  non_metaphorical_rule:'Express the original formal action without relying on visual analogies.',
  disconfirming_observation:'A source-level counterexample with incompatible operator behavior.',
  next_source_action:'Retrieve a specific source section and compare the original equations.'};
 const review=await validateBrowserSourceChallengeReport({result,documents,corpus:catalogue,report});
 assert.equal(review.schema,'td613.vixen.human-source-mechanism-review/v1');
 assert.equal(review.passage_provenance.length,2);
 assert.equal(review.structurally_complete_form_is_not_mechanism_proof,true);
 assert.equal(review.semantic_and_formal_interpretation_independently_verified,false);
 assert.equal(review.scientific_credit,0);
 assert.equal(review.human_identity_gates_adjudicated,0);
 assert.equal(review.original_native_python_executed_in_browser,false);
 const forged=clone(report);
 forged.passages[0].excerpt='This is a forged citation with no corresponding original Work text.';
 await assert.rejects(()=>validateBrowserSourceChallengeReport({result,documents,corpus:catalogue,report:forged}),
  /HELD_CHALLENGE_EXCERPT_NOT_IN_VERIFIED_SOURCE/);
 const simulatedJudgment=clone(report);
 simulatedJudgment.operators='one word';
 await assert.rejects(()=>validateBrowserSourceChallengeReport({result,documents,corpus:catalogue,report:simulatedJudgment}),
  /HELD_CHALLENGE_OPERATORS_REQUIRED/);
 const altered=clone(documents);
 altered[0].body+=' unauthorised editing';
 await assert.rejects(()=>validateSourceChallengeDocuments(altered,catalogue),
  /HELD_CHALLENGE_DERIVATIVE_BYTES_CHANGED/);
 await assert.rejects(()=>runBrowserSourceChallenge({documents:[documents[0],documents[0]],corpus:catalogue,
  question:'Compare the same source with itself'}),/HELD_CHALLENGE_TWO_DISTINCT_WORKS/);
});
test('public HTML surfaces a separately gated Maestro source expedition, no authorial name leakage or hidden native-browser code',()=>{
 const script=readFileSync(resolve(ROOT,'app/encyclopedia/vixen-estate/vixen-source-challenge.mjs'),'utf8');
 assert.match(html,/id="vmaSourceChallenge"/);
 assert.match(html,/vixen-source-challenge\.css/);
 assert.match(html,/vixen-source-challenge\.mjs/);
 assert.match(script,/window\.addEventListener\('vixen-maestro-session-state',roleChange\)/);
 assert.match(script,/if\(!maestro\(\)\)wipe\(\)/);
 assert.match(script,/source_original_bytes_present_in_browser:false|source_byte/i);
 assert.doesNotMatch(script,/https?:\/\/[^'"]+\/api\/|fetch\('https?:|EMSTD613.*original\s+author\s+wrote/i);
 assert.match(script,/copyForCollaboration/);
 assert.match(script,/clipboard\.writeText/);
 const css=readFileSync(resolve(ROOT,'app/encyclopedia/vixen-estate/vixen-source-challenge.css'),'utf8');
 assert.doesNotMatch(css,/#(?:[0-9a-f]{0,3}(?:[89a-f][0-9a-f]{3})){1,2}\b/,'CSS must not rely on plum-style palette classification');
});
