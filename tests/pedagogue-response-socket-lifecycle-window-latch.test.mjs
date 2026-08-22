import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_WINDOW_LATCH_SCHEMA,
  runPedagogueWindowLatchDiagnostic
} from '../app/dome-world/previews/a15-r0/pedagogue-response-socket-lifecycle-window-latch.js';

const receipt = await runPedagogueWindowLatchDiagnostic();

assert.equal(receipt.schema, PEDAGOGUE_WINDOW_LATCH_SCHEMA);
assert.equal(receipt.candidate, 'E9_M2_RESPONSE_SOCKET_LIFECYCLE_APERTURE_DIAGNOSTIC');
assert.equal(receipt.candidate_status, 'DIAGNOSTIC_ONLY_NOT_PROMOTED');
assert.equal(receipt.parent_e9_receipt, 'a91aba633a719e7d1e8a9f89b2a86098b5024a1a');
assert.equal(receipt.parent_m1_receipt, '2533c3a390b5c3b7bf2e11593881ecb596b540db');
assert.equal(
  receipt.e9_verdict_preserved,
  'LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_FALSIFIED_OR_UNAVAILABLE_IN_BOUNDED_POST_OFFICE_WINDOW'
);
assert.equal(receipt.target_url, 'https://www.iana.org/domains/reserved');
assert.equal(receipt.observation.explicit_reject_unauthorized_true, true);
assert.ok(Array.isArray(receipt.diagnostic_classifications));
assert.ok(receipt.diagnostic_classifications.length > 0);
assert.equal(typeof receipt.late_property_lookup_hypothesis_supported, 'boolean');
assert.equal(typeof receipt.late_property_lookup_hypothesis_falsified, 'boolean');
assert.equal(
  receipt.late_property_lookup_hypothesis_supported && receipt.late_property_lookup_hypothesis_falsified,
  false,
  'The same exact observation may not simultaneously support and falsify the primary M2 mechanism.'
);

const allowed = new Set([
  'REUSED_SOCKET_WITHOUT_SECURECONNECT',
  'REUSED_SOCKET_WITH_SECURECONNECT_OBSERVED',
  'FRESH_SOCKET_WITH_SECURECONNECT_OBSERVED',
  'FRESH_SOCKET_WITHOUT_SECURECONNECT_OBSERVED',
  'CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_UNAVAILABLE_RETAINED_AUTH_TRUE',
  'CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_AUTH_TRUE',
  'CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_AUTH_FALSE',
  'RETAINED_SOCKET_AUTHORIZATION_CHANGED',
  'END_RESPONSE_SOCKET_IDENTITY_CHANGED',
  'CALLBACK_AUTH_FALSE',
  'END_RESPONSE_SOCKET_PROPERTY_UNAVAILABLE',
  'LIFECYCLE_MEASUREMENT_UNDERDETERMINED'
]);
for (const classification of receipt.diagnostic_classifications) {
  assert.equal(allowed.has(classification), true, `Unexpected Window Latch classification: ${classification}`);
}

const { observation } = receipt;
for (const key of [
  'request_reused_socket',
  'request_socket_present',
  'secure_connect_observed',
  'callback_response_socket_present',
  'retained_callback_socket_same_as_request_socket',
  'end_response_socket_present',
  'end_response_socket_same_as_callback_socket',
  'request_error_observed'
]) {
  assert.equal(typeof observation[key], 'boolean', `${key} must remain an explicit boolean.`);
}

if (observation.response_available) {
  assert.equal(typeof observation.response_status, 'number');
}
if (observation.callback_response_socket_present) {
  assert.equal(typeof observation.callback_response_socket.authorized_property_present, 'boolean');
}
if (observation.end_response_socket_present) {
  assert.equal(observation.end_response_socket.present, true);
}
assert.equal(typeof observation.retained_callback_socket_at_end.present, 'boolean');

if (receipt.diagnostic_classifications.includes('REUSED_SOCKET_WITHOUT_SECURECONNECT')) {
  assert.equal(observation.request_reused_socket, true);
  assert.equal(observation.secure_connect_observed, false);
}
if (receipt.diagnostic_classifications.includes('FRESH_SOCKET_WITH_SECURECONNECT_OBSERVED')) {
  assert.equal(observation.request_reused_socket, false);
  assert.equal(observation.secure_connect_observed, true);
}
if (receipt.diagnostic_classifications.includes('CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_UNAVAILABLE_RETAINED_AUTH_TRUE')) {
  assert.equal(observation.callback_response_socket.authorized_value, true);
  assert.equal(observation.end_response_socket.present, false);
  assert.equal(observation.retained_callback_socket_at_end.authorized_value, true);
  assert.equal(receipt.late_property_lookup_hypothesis_supported, true);
}
if (receipt.diagnostic_classifications.includes('CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_AUTH_TRUE')) {
  assert.equal(observation.callback_response_socket.authorized_value, true);
  assert.equal(observation.end_response_socket.present, true);
  assert.equal(observation.end_response_socket.authorized_property_present, true);
  assert.equal(observation.end_response_socket.authorized_value, true);
  assert.equal(receipt.late_property_lookup_hypothesis_falsified, true);
}
if (receipt.diagnostic_classifications.includes('RETAINED_SOCKET_AUTHORIZATION_CHANGED')) {
  assert.notEqual(
    observation.callback_response_socket.authorized_value,
    observation.retained_callback_socket_at_end.authorized_value
  );
}

const e9Receipt = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-post-office-window-live-external-https-observation-custody-hostile-execution-receipt-v0.1.json',
  'utf8'
));
assert.equal(
  e9Receipt.verdict,
  'LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_FALSIFIED_OR_UNAVAILABLE_IN_BOUNDED_POST_OFFICE_WINDOW'
);

const m1Receipt = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-badge-scanner-e9-m1-tls-measurement-semantics-diagnostic-execution-receipt-v0.1.json',
  'utf8'
));
assert.equal(m1Receipt.next_learning_action, 'PREREGISTER_E9_M2_RESPONSE_SOCKET_LIFECYCLE_APERTURE_DIAGNOSTIC');
assert.equal(m1Receipt.e9_rescue_authority, false);

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_WINDOW_LATCH_E9_M2_RESPONSE_SOCKET_LIFECYCLE_APERTURE_DIAGNOSTIC_V0_1.md',
  'utf8'
);
assert.match(spec, /Window Latch/i);
assert.match(spec, /attempts = 1/i);
assert.match(spec, /response\.socket/i);
assert.match(spec, /request\.reusedSocket/i);
assert.match(spec, /retained callback socket/i);
assert.match(spec, /simple late-property-lookup explanation is falsified/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-window-latch-e9-m2-response-socket-lifecycle-aperture-diagnostic-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate, 'E9_M2_RESPONSE_SOCKET_LIFECYCLE_APERTURE_DIAGNOSTIC');
assert.equal(fixture.target.attempts, 1);
assert.equal(fixture.target.agent, 'NODE_DEFAULT_HTTPS_GLOBAL_AGENT_PATH');
assert.equal(fixture.e9_rescue_authority, false);
assert.equal(fixture.additional_request_authority, false);
assert.equal(fixture.release_authority, false);

assert.equal(receipt.e9_rescue_authority, false);
assert.equal(receipt.m1_rewrite_authority, false);
assert.equal(receipt.tls_contract_weakening_authority, false);
assert.equal(receipt.new_external_endpoint_authority, false);
assert.equal(receipt.additional_request_authority, false);
assert.equal(receipt.source_honesty_identified, false);
assert.equal(receipt.institutional_authority_identified, false);
assert.equal(receipt.physical_origin_identified, false);
assert.equal(receipt.proxy_or_cdn_absence_identified, false);
assert.equal(receipt.universal_node_semantics_claim, false);
assert.equal(receipt.universal_web_pki_semantics_claim, false);
assert.equal(receipt.scalar_aggregation_used, false);
assert.equal(receipt.H2, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.H3, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.intersections, 'HELD_NOT_OPENED_HERE');
assert.equal(receipt.APERTURE_V32_REPLAY_STABILITY, 'HELD_NOT_YET_WITNESSED');
assert.equal(receipt.product_mutation, false);
assert.equal(receipt.shared_pedagogue_engine_mutation, false);
assert.equal(receipt.workflow_mutation, false);
assert.equal(receipt.browser_execution, false);
assert.equal(receipt.merge_performed, false);
assert.equal(receipt.deployment_performed, false);
assert.equal(receipt.release_authority, false);
assert.equal(receipt.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  e9_verdict_preserved: receipt.e9_verdict_preserved,
  diagnostic_classifications: receipt.diagnostic_classifications,
  request_completed: observation.request_completed,
  response_status: observation.response_status,
  request_reused_socket: observation.request_reused_socket,
  secure_connect_observed: observation.secure_connect_observed,
  callback_socket_present: observation.callback_response_socket.present,
  callback_socket_constructor: observation.callback_response_socket.constructor_name,
  callback_authorized_property_present: observation.callback_response_socket.authorized_property_present,
  callback_authorized_value: observation.callback_response_socket.authorized_value,
  callback_authorization_error_present: observation.callback_response_socket.authorization_error_present,
  retained_callback_socket_same_as_request_socket: observation.retained_callback_socket_same_as_request_socket,
  end_response_socket_present: observation.end_response_socket.present,
  end_response_socket_same_as_callback_socket: observation.end_response_socket_same_as_callback_socket,
  end_response_authorized_property_present: observation.end_response_socket.authorized_property_present,
  end_response_authorized_value: observation.end_response_socket.authorized_value,
  retained_socket_present_at_end: observation.retained_callback_socket_at_end.present,
  retained_authorized_property_present_at_end: observation.retained_callback_socket_at_end.authorized_property_present,
  retained_authorized_value_at_end: observation.retained_callback_socket_at_end.authorized_value,
  retained_socket_destroyed_at_end: observation.retained_callback_socket_at_end.destroyed,
  body_sha256: observation.body_sha256,
  body_bytes: observation.body_bytes,
  late_property_lookup_hypothesis_supported: receipt.late_property_lookup_hypothesis_supported,
  late_property_lookup_hypothesis_falsified: receipt.late_property_lookup_hypothesis_falsified,
  e9_rescue_authority: receipt.e9_rescue_authority,
  release_authority: receipt.release_authority
}, null, 2));
