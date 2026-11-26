import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {adjudicateG8,G8_EVIDENCE_SCHEMA} from
 '../scripts/vixen-g8-evidence-adjudication.mjs';

const head='a'.repeat(40);
const viewport=width=>({
 viewport:{width,height:width===390?844:900},
 status:'BOUNDED_RENDERED_ROUTE_PASS',
 consent:{future_only:true,reload_permission_restored:false},
 source_excursion:{same_session_return:true,selected_work_id:'emwork_abc',
  mounted_work_id:'emwork_abc',original_host_native_return_observed:false},
 reload:{notes_permission_reobserved_after_start:'NOT_REQUESTED'},
 privacy:{unsent_draft_bytes_exported:false,exit_requires_choice:true},
 source_return:{original_native_method_in_browser:false,model_connected:false},
 archive:{local_only:true,release_authority:false,auto_restore_notes_permission:false},
 page_errors:[]
});
const browser={schema:'td613.vixen.g8.rendered-route-witness/v1',
 source_sha:head,status:'BROWSER_BOUNDARY_PASS',
 human_operator_observed:false,live_original_native_return_in_browser:false,
 viewports:[viewport(1440),viewport(390)]};
const portable={schema:'td613.vixen.g5.extracted-browser-witness/v1',
 source_sha:head,status:'EXTRACTED_BROWSER_WITNESS_PASS',
 reference_corpus_admitted:false,human_cadence_witness:false,
 viewports:[390,1440].map(width=>({viewport:{width},
 extraction:{manifest:'ONLINE_REFERENCE_REQUIRED'},
 extracted:{reference:{record:{status:'HELD'}}}}))};

test('G8-A: distinct exact-head rendered + extracted evidence qualifies only QA03 review',()=>{
 const r=adjudicateG8({exactHead:head,browser,portable});
 assert.equal(r.schema,G8_EVIDENCE_SCHEMA);
 assert.equal(r.qa03.live_rendered_route,true);
 assert.equal(r.qa03.original_extracted_zip_replay,true);
 assert.equal(r.candidate_ready_for_human_review,true);
 assert.equal(r.qa04.actual_human_cadence_observed,false);
 assert.equal(r.qa04.state,'HELD_QA04_ACTUAL_HUMAN_CADENCE_WITNESS_REQUIRED');
 assert.equal(r.final_empirical_closure,false);
 assert.equal(r.release_authority,false);
 assert.equal(r.scientific_credit,0);
 assert.equal(r.canonical_work_mutations,0);
});
test('G8-B: forged human, native, temporal and authority claims cannot bootstrap witnesses',()=>{
 const badHuman={identity:'asserted',human_cadence_observed:true,
  scientific_credit:1,approved_for_publication:true};
 const r=adjudicateG8({exactHead:head,browser,portable,
  human:badHuman,native:{source_head:head,
   evidence_type:'PINNED_HISTORICAL_LOCAL_NATIVE_TEST',
   ci_source_test_assertions_passed:true},
  temporal:{complete:true,strict_monotonic_clock:true}});
 assert.equal(r.qa04.caller_supplied_human_claim_ignored,true);
 assert.equal(r.qa04.actual_human_cadence_observed,false);
 assert.equal(r.native.state,'SOURCE_SELF_ATTESTED_PENDING_INDEPENDENT_CI');
 assert.equal(r.native.permitted_to_prove_authorship,false);
 assert.equal(r.temporal.caller_supplied_full_chronology_claim_ignored,true);
 assert.equal(r.temporal.state,'HELD_G7_LIVE_CHRONOLOGY_AND_HUMAN_TIME_POLICY');
 assert.equal(r.release_authority,false);
 assert.equal(r.scientific_credit,0);
 assert.equal(r.final_empirical_closure,false);
});
test('G8-C: stale HEAD, missing width and source-body promotion fail exact QA03 review',()=>{
 const wrong=adjudicateG8({exactHead:'b'.repeat(40),browser,portable});
 assert.equal(wrong.candidate_ready_for_human_review,false);
 const missing=adjudicateG8({exactHead:head,
  browser:{...browser,viewports:[viewport(1440)]},portable});
 assert.equal(missing.qa03.live_rendered_route,false);
 assert.equal(missing.candidate_ready_for_human_review,false);
 const badReturn=adjudicateG8({exactHead:head,
  browser:{...browser,viewports:[{...viewport(1440),
   source_excursion:{...viewport(1440).source_excursion,
    mounted_work_id:'emwork_different'}},viewport(390)]},portable});
 assert.equal(badReturn.qa03.live_rendered_route,false);
 const badConsent=adjudicateG8({exactHead:head,
  browser:{...browser,viewports:[viewport(1440),{...viewport(390),
   reload:{notes_permission_reobserved_after_start:'GRANTED'}}]},portable});
 assert.equal(badConsent.qa03.live_rendered_route,false);
 const leak=adjudicateG8({exactHead:head,
  browser:{...browser,viewports:[{...viewport(1440),
   privacy:{exit_requires_choice:true,unsent_draft_bytes_exported:true}},
   viewport(390)]},portable});
 assert.equal(leak.qa03.live_rendered_route,false);
 const admitted=adjudicateG8({exactHead:head,
  browser,portable:{...portable,reference_corpus_admitted:true}});
 assert.equal(admitted.qa03.original_extracted_zip_replay,false);
 assert.throws(()=>adjudicateG8({exactHead:'unknown'}),
  /HELD_G8_EXACT_SOURCE_SHA_REQUIRED/);
});
test('G8-D: exact-head browser test and evidence register remain browser-source and human-separated',()=>{
 const source=readFileSync(new URL('./vixen-g8-integrated-browser-witness.mjs',import.meta.url),'utf8');
 const cli=readFileSync(new URL('../scripts/vixen-g8-evidence-register-cli.mjs',import.meta.url),'utf8');
 assert.match(source,/chromium\.launch/);
 assert.match(source,/for\(const width of \[1440,390\]\)/);
 assert.match(source,/VixenSourceChallenge\.draftStatus/);
 assert.match(source,/dialog\.dismiss/);
 assert.match(source,/dialog\.accept/);
 assert.match(source,/vmaSaveFinal/);
 assert.match(source,/page\.reload/);
 assert.match(source,/same_session_return:true/);
 assert.match(source,/notes_permission_reobserved_after_start:'NOT_REQUESTED'/);
 assert.match(source,/model_connected/);
 assert.match(source,/human_operator_observed:false/);
 assert.match(cli,/g8-separate-evidence-adjudication\.json/);
 assert.match(cli,/final_empirical_closure!==false/);
});
