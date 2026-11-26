/**
 * G8 operator-visible adjudication packet. The witness matrix is deliberately
 * unable to promote synthetic human events or internal source provenance.
 *
 * Source-only confirmation can close a bounded test scope, never external
 * authorship, actual human cadence, provider authority or final release.
 * OPERAHOUSE ≠ OPERA ≠ PERFORMER.
 */
export const G8_EVIDENCE_SCHEMA='td613.vixen.g8.separated-evidence-register/v1';
const SHA=/^[a-f0-9]{40}$/;
const VAULT='HUMAN_WITNESS_NOT_ACQUIRED_OR_ADJUDICATED';
const requiredWidths=[390,1440];

export function adjudicateG8({exactHead,browser=null,portable=null,
 native=null,human=null,temporal=null}={}){
 if(!SHA.test(exactHead||''))throw Error('HELD_G8_EXACT_SOURCE_SHA_REQUIRED');
 const browserVerified=browser?.schema==='td613.vixen.g8.rendered-route-witness/v1' &&
  browser?.source_sha===exactHead && browser?.status==='BROWSER_BOUNDARY_PASS'&&
  browser?.human_operator_observed===false &&
  browser?.live_original_native_return_in_browser===false &&
  Array.isArray(browser?.viewports) &&
  requiredWidths.every(w=>browser.viewports.some(x=>
   x.viewport?.width===w&&x.status==='BOUNDED_RENDERED_ROUTE_PASS'&&
   x.consent?.future_only===true&&
   x.consent?.reload_permission_restored===false&&
   x.source_excursion?.same_session_return===true&&
   x.source_excursion?.selected_work_id===x.source_excursion?.mounted_work_id&&
   x.source_excursion?.original_host_native_return_observed===false&&
   x.reload?.notes_permission_reobserved_after_start==='NOT_REQUESTED'&&
   x.privacy?.unsent_draft_bytes_exported===false&&
   x.privacy?.exit_requires_choice===true &&
   x.source_return?.original_native_method_in_browser===false&&
   x.source_return?.model_connected===false&&
   x.archive?.local_only===true&&
   x.archive?.release_authority===false&&
   x.archive?.auto_restore_notes_permission===false&&
   x.page_errors?.length===0));
 const portableVerified=portable?.schema==='td613.vixen.g5.extracted-browser-witness/v1' &&
  portable?.source_sha===exactHead&&portable?.status==='EXTRACTED_BROWSER_WITNESS_PASS'&&
  portable?.reference_corpus_admitted===false&&
  portable?.human_cadence_witness===false&&
  Array.isArray(portable?.viewports)&&
  requiredWidths.every(w=>portable.viewports.some(x=>x.viewport?.width===w&&
   x.extraction?.manifest==='ONLINE_REFERENCE_REQUIRED'&&
   x.extracted?.reference?.record?.status==='HELD'));
 // The actual native test is qualified in separate CI logs at the same HEAD.
 // Caller-declared native success has no standalone human/admission authority.
 const nativeStatus=native?.source_head===exactHead&&
  native?.evidence_type==='PINNED_HISTORICAL_LOCAL_NATIVE_TEST'&&
  native?.ci_source_test_assertions_passed===true?
  'SOURCE_SELF_ATTESTED_PENDING_INDEPENDENT_CI':'HELD_NATIVE_CI_RECEIPT_NOT_VERIFIED';
 const browserState=browserVerified&&portableVerified?
  'RENDERED_AND_EXTRACTED_BOUNDARIES_SOURCE_VERIFIED':
  'HELD_QA03_EXACT_HEAD_BROWSER_OR_PORTABLE_WITNESS_MISSING';
 const evidence=Object.freeze({
  schema:G8_EVIDENCE_SCHEMA,
  source_revision:exactHead,
  decision:'G8_FINAL_HUMAN_ADJUDICATION_HELD',
  qa03:{state:browserState,live_rendered_route:browserVerified,
   original_extracted_zip_replay:portableVerified,
   source_route:'CI_CHROMIUM_LOCAL_HTTP_VIXEN',
   operating_system_human_browser_observed:false,
   actual_browser_native_host_return_observed:false},
  qa04:{state:'HELD_QA04_ACTUAL_HUMAN_CADENCE_WITNESS_REQUIRED',
   actual_human_cadence_observed:false,
   externally_independent_human_witness_verified:false,
   human_input_admissibility:VAULT,
   caller_supplied_human_claim_ignored:Boolean(human),
   synthetic_human_evidence_counts:0},
  native:{state:nativeStatus,permitted_to_prove_authorship:false,
   historical_checkout_distinct_from_Vixen:true},
  temporal:{state:'HELD_G7_LIVE_CHRONOLOGY_AND_HUMAN_TIME_POLICY',
   caller_supplied_full_chronology_claim_ignored:Boolean(temporal)},
  evidence_class_boundary:{
   rendered_browser:'INTERNAL_LOCAL_RENDERED_OBSERVATION',
   historical_native:'LOCAL_SOURCE_TYPED_METHOD_ONLY',
   portability:'EXTRACTED_LOCAL_ZIP_CUSTODY_ONLY',
   historical_temporal:'PREDECESSOR_BOUND_RESEARCH_SOURCE',
   original_human:'INDEPENDENT_HUMAN_WITNESS_REQUIRED'},
  candidate_ready_for_human_review:browserVerified&&portableVerified,
  canonical_work_mutations:0,source_body_admission:0,
  private_provider_synchronization:false,release_authority:false,
  scientific_credit:0,experiment_b_authority:false,
  final_empirical_closure:false
 });
 return evidence;
}
