import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_SCHEMA,
  PEDAGOGUE_POST_OFFICE_WINDOW_TARGET,
  runPedagoguePostOfficeWindowGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-live-external-https-observation-custody-post-office-window.js';

const receipt = await runPedagoguePostOfficeWindowGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_SCHEMA);
assert.equal(
  receipt.inherited_e8_verdict,
  'DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_RETURN_ADDRESS'
);
assert.equal(receipt.inherited_e8_terminal_synthetic_seam_preserved, true);
assert.equal(receipt.candidate, 'E9_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_POST_OFFICE_WINDOW',
  'LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_FALSIFIED_OR_UNAVAILABLE_IN_BOUNDED_POST_OFFICE_WINDOW'
].includes(receipt.candidate_verdict));
assert.deepEqual(Object.keys(receipt.rooms).sort(), [
  'pw01','pw02','pw03','pw04','pw05','pw06','pw07','pw08','pw09','pw10','pw11','pw12'
]);

assert.equal(PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.request_url, 'https://www.iana.org/domains/reserved');
assert.equal(PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.expected_hostname, 'www.iana.org');
assert.equal(PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.expected_status, 200);
assert.deepEqual([...PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.required_markers], [
  'IANA-managed Reserved Domains',
  'example.com'
]);
assert.equal(PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.redirect_policy, 'refuse');
assert.equal(PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.attempts, 1);
assert.equal(PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.request_timeout_ms, 8000);
assert.equal(PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.response_body_limit_bytes, 1048576);

const { pw01, pw02, pw03, pw04, pw05, pw06, pw07, pw08, pw09, pw10, pw11, pw12 } = receipt.rooms;

assert.equal(pw01.result.status, 'REFUSE_UNRECOGNIZED_LIVE_EXTERNAL_OBSERVATION_CAPABILITY');
assert.equal(pw01.result.admitted, false);
assert.equal(pw03.result.status, 'REFUSE_UNRECOGNIZED_LIVE_EXTERNAL_OBSERVATION_CAPABILITY');
assert.equal(pw08.result.status, 'REFUSE_UNRECOGNIZED_LIVE_EXTERNAL_OBSERVATION_CAPABILITY');
assert.equal(pw09.result.status, 'REFUSE_UNRECOGNIZED_LIVE_EXTERNAL_OBSERVATION_CAPABILITY');
assert.equal(pw10.classifier_status, 'REFUSE_REDIRECTED_LIVE_EXTERNAL_OBSERVATION');
assert.equal(pw07.source_time_headers_are_chronology_authority, false);
assert.equal(pw12.e8_verdict, 'DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_RETURN_ADDRESS');
assert.equal(pw12.e8_live_external_source_adapter, false);
assert.equal(pw12.e8_retroactively_authenticated_by_e9, false);

assert.equal(receipt.live_external_source_adapter, true);
assert.equal(receipt.live_external_source_count, 1);
assert.equal(receipt.source_honesty_identified, false);
assert.equal(receipt.content_truth_identified, false);
assert.equal(receipt.physical_origin_identified, false);
assert.equal(receipt.institutional_independence_identified, false);
assert.equal(receipt.external_chronology_identified, false);
assert.equal(receipt.proxy_or_cdn_absence_identified, false);
assert.equal(receipt.unrelated_e8_witness_provenance_identified, false);
assert.equal(receipt.universal_external_source_authentication, false);
assert.equal(receipt.scalar_aggregation_used, false);
assert.equal(receipt.H2, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.H3, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.intersections, 'HELD_NOT_OPENED_HERE');
assert.equal(receipt.APERTURE_V32_REPLAY_STABILITY, 'HELD_NOT_YET_WITNESSED');
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.product_mutation, false);
assert.equal(receipt.shared_pedagogue_engine_mutation, false);
assert.equal(receipt.workflow_mutation, false);
assert.equal(receipt.browser_execution, false);
assert.equal(receipt.merge_performed, false);
assert.equal(receipt.deployment_performed, false);
assert.equal(receipt.release_authority, false);
assert.equal(receipt.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);

if (receipt.candidate_verdict === 'LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_POST_OFFICE_WINDOW') {
  assert.deepEqual(receipt.defeat_conditions, []);
  assert.equal(receipt.live_external_network_observed, true);
  assert.equal(receipt.https_transport_authorized_under_runner_trust_store, true);
  assert.equal(pw02.outcome_status, 'ADMIT_LIVE_EXTERNAL_HTTPS_OBSERVATION_UNDER_RUNNER_TRUST_STORE');
  assert.equal(pw02.result.status, 'ADMIT_LIVE_EXTERNAL_HTTPS_OBSERVATION_UNDER_RUNNER_TRUST_STORE');
  assert.equal(pw02.result.admitted, true);
  assert.equal(pw02.result.recognized_live_observation_capability, true);
  assert.equal(pw02.result.transport_snapshot.request_url, PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.request_url);
  assert.equal(pw02.result.transport_snapshot.response_status, 200);
  assert.equal(pw02.result.transport_snapshot.tls_authorized, true);
  for (const marker of PEDAGOGUE_POST_OFFICE_WINDOW_TARGET.required_markers) {
    assert.equal(pw02.result.transport_snapshot.marker_presence[marker], true);
  }
  assert.match(pw02.result.transport_snapshot.body_sha256, /^[a-f0-9]{64}$/);
  assert.ok(pw02.result.transport_snapshot.body_bytes > 0);
  assert.equal(pw04.result.status, 'REFUSE_LIVE_EXTERNAL_OBSERVATION_TARGET_MISMATCH');
  assert.equal(pw05.result.status, 'REFUSE_POST_HOC_TARGET_CONTRACT_REWRITE');
  assert.equal(pw06.status_equal, true);
  assert.equal(pw06.duplicate_observation_count_is_confidence, false);
  assert.equal(pw11.observation_frozen, true);
  assert.equal(pw11.marker_map_frozen, true);
  assert.equal(pw11.mutation.status, 'SEALED_LIVE_EXTERNAL_HTTPS_OBSERVATION_IMMUTABLE');
  assert.equal(
    receipt.bind_live_observation_to_dependency_witness,
    'NEXT_BOUNDED_QUESTION_MAY_BIND_WITNESS_MATERIAL_DERIVED_FROM_THIS_EXACT_LIVE_OBSERVATION'
  );
} else {
  assert.ok(receipt.defeat_conditions.length > 0);
  assert.equal(
    receipt.bind_live_observation_to_dependency_witness,
    'HELD_UNTIL_E9_SURVIVES'
  );
  assert.ok([
    'ADMIT_LIVE_EXTERNAL_HTTPS_OBSERVATION_UNDER_RUNNER_TRUST_STORE',
    'LIVE_EXTERNAL_OBSERVATION_UNAVAILABLE_OR_CONTRACT_MISMATCH'
  ].includes(pw02.outcome_status));
}

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_POST_OFFICE_WINDOW_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Post Office Window/i);
assert.match(spec, /E9_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY/);
assert.match(spec, /internal claim of exteriority\s*!= runner-observed live HTTPS response/i);
assert.match(spec, /runner-observed live HTTPS response\s*!= institutional or physical truth/i);
assert.match(spec, /attempts = 1/i);
assert.match(spec, /redirect_policy = refuse/i);
assert.match(spec, /provenance of any unrelated E8 witness material/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-post-office-window-live-external-https-observation-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate, 'E9_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY');
assert.equal(fixture.parent_e8_receipt, '85e019e34dbb605cc10f6ae688f75fd191e99b3f');
assert.equal(fixture.human_reopening_gesture_received, true);
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.live_target.request_url, 'https://www.iana.org/domains/reserved');
assert.equal(fixture.live_target.attempts, 1);
assert.equal(fixture.live_target.redirect_policy, 'refuse');
assert.equal(fixture.live_target.authentication, false);
assert.equal(fixture.live_target.cookies, false);
assert.equal(fixture.network_unavailability_is_scientific_result_not_harness_failure, true);
assert.equal(fixture.unrelated_e8_witness_provenance_claim, false);
assert.equal(fixture.live_external_https_get_authorized, true);
assert.equal(fixture.live_external_source_count, 1);
assert.equal(fixture.promotion_authority, false);
assert.equal(fixture.release_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_e8_verdict: receipt.inherited_e8_verdict,
  e9_verdict: receipt.candidate_verdict,
  e9_defeat_conditions: receipt.defeat_conditions,
  PW01_status: pw01.result.status,
  PW02_outcome_status: pw02.outcome_status,
  PW02_contract_status: pw02.result.status,
  PW02_network_observed: receipt.live_external_network_observed,
  PW02_tls_authorized_under_runner_trust_store: receipt.https_transport_authorized_under_runner_trust_store,
  PW02_response_status: pw02.result.transport_snapshot?.response_status ?? null,
  PW02_body_sha256: pw02.result.transport_snapshot?.body_sha256 ?? null,
  PW02_body_bytes: pw02.result.transport_snapshot?.body_bytes ?? null,
  PW03_status: pw03.result.status,
  PW04_status: pw04.result?.status ?? null,
  PW05_status: pw05.result?.status ?? null,
  PW06_duplicate_amplification: pw06.duplicate_observation_count_is_confidence,
  PW07_chronology_authority: pw07.source_time_headers_are_chronology_authority,
  PW08_status: pw08.result.status,
  PW09_status: pw09.result.status,
  PW10_status: pw10.classifier_status,
  PW11_status: pw11.mutation?.status ?? null,
  PW12_e8_retroactively_authenticated: pw12.e8_retroactively_authenticated_by_e9,
  next_learning_action: receipt.bind_live_observation_to_dependency_witness,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
