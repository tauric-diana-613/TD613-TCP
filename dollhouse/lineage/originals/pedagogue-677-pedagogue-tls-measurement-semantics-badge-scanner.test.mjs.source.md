import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_BADGE_SCANNER_SCHEMA,
  runPedagogueBadgeScannerDiagnostic
} from '../app/dome-world/previews/a15-r0/pedagogue-tls-measurement-semantics-badge-scanner.js';

const receipt = await runPedagogueBadgeScannerDiagnostic();

assert.equal(receipt.schema, PEDAGOGUE_BADGE_SCANNER_SCHEMA);
assert.equal(receipt.candidate, 'E9_M1_TLS_MEASUREMENT_SEMANTICS_DIAGNOSTIC');
assert.equal(receipt.candidate_status, 'DIAGNOSTIC_ONLY_NOT_PROMOTED');
assert.equal(receipt.parent_e9_receipt, 'a91aba633a719e7d1e8a9f89b2a86098b5024a1a');
assert.equal(
  receipt.e9_verdict_preserved,
  'LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_FALSIFIED_OR_UNAVAILABLE_IN_BOUNDED_POST_OFFICE_WINDOW'
);
assert.equal(receipt.target_url, 'https://www.iana.org/domains/reserved');
assert.equal(receipt.observation.explicit_reject_unauthorized_true, true);
assert.ok(Array.isArray(receipt.diagnostic_classifications));
assert.ok(receipt.diagnostic_classifications.length > 0);
assert.equal(typeof receipt.missing_property_collapse_hypothesis_falsified, 'boolean');

const allowedClassifications = new Set([
  'TLS_AUTHORIZED_TRUE_STABLE',
  'TLS_AUTHORIZED_FALSE_WITH_AUTHORIZATION_ERROR',
  'TLS_AUTHORIZED_FALSE_WITHOUT_AUTHORIZATION_ERROR',
  'TLS_AUTHORIZED_PROPERTY_UNAVAILABLE',
  'TLS_AUTHORIZATION_STATE_CHANGED_BETWEEN_SECURECONNECT_AND_RESPONSE',
  'TLS_SECURECONNECT_NOT_OBSERVED',
  'TLS_RESPONSE_UNAVAILABLE',
  'TLS_SOCKET_IDENTITY_MISMATCH',
  'TLS_MEASUREMENT_UNDERDETERMINED'
]);
for (const classification of receipt.diagnostic_classifications) {
  assert.equal(allowedClassifications.has(classification), true, `Unexpected Badge Scanner classification: ${classification}`);
}

const { observation } = receipt;
assert.equal(typeof observation.request_socket.present, 'boolean');
assert.equal(typeof observation.request_socket.authorized_property_present, 'boolean');
assert.equal(typeof observation.response_socket.present, 'boolean');
assert.equal(typeof observation.response_socket.authorized_property_present, 'boolean');
assert.equal(typeof observation.secure_connect_observed, 'boolean');
assert.equal(typeof observation.request_and_response_socket_same_object, 'boolean');
assert.equal(typeof observation.request_error_observed, 'boolean');

if (observation.response_available) {
  assert.equal(typeof observation.response_status, 'number');
  assert.equal(observation.response_socket.present, true);
}

if (receipt.diagnostic_classifications.includes('TLS_AUTHORIZED_PROPERTY_UNAVAILABLE')) {
  assert.equal(
    observation.secure_connect_socket.authorized_property_present || observation.response_socket.authorized_property_present,
    false
  );
}

if (receipt.diagnostic_classifications.includes('TLS_AUTHORIZED_TRUE_STABLE')) {
  assert.equal(observation.response_socket.authorized_property_present, true);
  assert.equal(observation.response_socket.authorized_value, true);
}

if (receipt.diagnostic_classifications.includes('TLS_AUTHORIZED_FALSE_WITH_AUTHORIZATION_ERROR')) {
  assert.equal(
    observation.secure_connect_socket.authorization_error_present || observation.response_socket.authorization_error_present,
    true
  );
}

if (receipt.diagnostic_classifications.includes('TLS_AUTHORIZED_FALSE_WITHOUT_AUTHORIZATION_ERROR')) {
  assert.equal(
    observation.secure_connect_socket.authorized_value === false || observation.response_socket.authorized_value === false,
    true
  );
  assert.equal(
    observation.secure_connect_socket.authorization_error_present || observation.response_socket.authorization_error_present,
    false
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
assert.deepEqual(e9Receipt.defeat_conditions, ['LIVE_PREREGISTERED_HTTPS_OBSERVATION_NOT_ADMITTED']);

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_BADGE_SCANNER_E9_M1_TLS_MEASUREMENT_SEMANTICS_DIAGNOSTIC_V0_1.md',
  'utf8'
);
assert.match(spec, /Badge Scanner/i);
assert.match(spec, /E9-M1/i);
assert.match(spec, /socket\.authorized === false/i);
assert.match(spec, /authorized is absent \/ unreadable \/ undefined/i);
assert.match(spec, /rejectUnauthorized = true/i);
assert.match(spec, /Neither result rescues E9 automatically/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-badge-scanner-e9-m1-tls-measurement-semantics-diagnostic-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate, 'E9_M1_TLS_MEASUREMENT_SEMANTICS_DIAGNOSTIC');
assert.equal(fixture.parent_e9_receipt, 'a91aba633a719e7d1e8a9f89b2a86098b5024a1a');
assert.equal(fixture.target.rejectUnauthorized, true);
assert.equal(fixture.target.attempts, 1);
assert.equal(fixture.e9_rescue_authority, false);
assert.equal(fixture.tls_contract_weakening_authority, false);
assert.equal(fixture.new_external_endpoint_authority, false);
assert.equal(fixture.release_authority, false);

assert.equal(receipt.e9_rescue_authority, false);
assert.equal(receipt.tls_contract_weakening_authority, false);
assert.equal(receipt.source_honesty_identified, false);
assert.equal(receipt.institutional_authority_identified, false);
assert.equal(receipt.physical_origin_identified, false);
assert.equal(receipt.proxy_or_cdn_absence_identified, false);
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
  response_available: observation.response_available,
  response_status: observation.response_status,
  explicit_reject_unauthorized_true: observation.explicit_reject_unauthorized_true,
  secure_connect_observed: observation.secure_connect_observed,
  request_socket_constructor: observation.request_socket.constructor_name,
  response_socket_constructor: observation.response_socket.constructor_name,
  request_socket_encrypted: observation.request_socket.encrypted,
  response_socket_encrypted: observation.response_socket.encrypted,
  request_authorized_property_present: observation.request_socket.authorized_property_present,
  secure_connect_authorized_property_present: observation.secure_connect_socket.authorized_property_present,
  response_authorized_property_present: observation.response_socket.authorized_property_present,
  secure_connect_authorized_value: observation.secure_connect_socket.authorized_value,
  response_authorized_value: observation.response_socket.authorized_value,
  secure_connect_authorization_error_present: observation.secure_connect_socket.authorization_error_present,
  response_authorization_error_present: observation.response_socket.authorization_error_present,
  request_and_response_socket_same_object: observation.request_and_response_socket_same_object,
  peer_certificate_present: observation.response_socket.peer_certificate_present,
  peer_certificate_fingerprint256_present: observation.response_socket.peer_certificate_fingerprint256_present,
  tls_protocol_present: observation.response_socket.tls_protocol_present,
  cipher_name_present: observation.response_socket.cipher_name_present,
  body_sha256: observation.body_sha256,
  body_bytes: observation.body_bytes,
  missing_property_collapse_hypothesis_falsified: receipt.missing_property_collapse_hypothesis_falsified,
  e9_rescue_authority: receipt.e9_rescue_authority,
  release_authority: receipt.release_authority
}, null, 2));
