# TD613 · Pedagogue Badge Scanner

## E9-M1 · TLS Measurement Semantics Diagnostic · Execution Receipt v0.1

U+10D613

Status: **WITNESSED / DIAGNOSTIC-ONLY / E9 SEALED UNCHANGED / NO PROMOTION**

### Exact witness

```text
science_head = 1dadd516c71f3c2639df03304ae6391d10ccddfc
workflow = TD613 Consolidated Validation
run = 1930
run_id = 32553207499
static_constitutional_release_contracts = SUCCESS
browser_witnesses = SKIPPED_BY_SCOPE
full_repository_validation = SKIPPED_BY_SCOPE
self_hosted_calibration = SKIPPED_BY_SCOPE
```

### Parent E9 remains unchanged

```text
E9 verdict = LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_FALSIFIED_OR_UNAVAILABLE_IN_BOUNDED_POST_OFFICE_WINDOW
E9 defeat condition = LIVE_PREREGISTERED_HTTPS_OBSERVATION_NOT_ADMITTED
E9 rescue authority = false
```

Badge Scanner is explanatory diagnosis only. It does not rewrite Post Office Window.

## Runner observation

The exact runner emitted:

```text
diagnostic_classifications = [
  TLS_AUTHORIZED_TRUE_STABLE,
  TLS_SECURECONNECT_NOT_OBSERVED
]
request_completed = true
response_available = true
response_status = 200
explicit_reject_unauthorized_true = true
secure_connect_observed = false
request_socket_constructor = TLSSocket
response_socket_constructor = TLSSocket
request_socket_encrypted = true
response_socket_encrypted = true
request_authorized_property_present = true
secure_connect_authorized_property_present = false
response_authorized_property_present = true
secure_connect_authorized_value = null
response_authorized_value = true
secure_connect_authorization_error_present = false
response_authorization_error_present = false
request_and_response_socket_same_object = true
peer_certificate_present = true
peer_certificate_fingerprint256_present = true
tls_protocol_present = true
cipher_name_present = true
body_sha256 = 720e5cce9016212d2d28777356d2844fb0ca9e19a32636eb232f8653360dc450
body_bytes = 10499
missing_property_collapse_hypothesis_falsified = false
```

The body hash and byte count exactly match the sealed E9 live response.

## Bounded interpretation

The runner demonstrated that, for the same preregistered IANA target and same captured payload, Node can expose an encrypted `TLSSocket` whose `authorized` property is present and `true` at the response-callback aperture under explicit `rejectUnauthorized: true`.

This defeats any interpretation of the earlier E9 `tls_authorized = false` value as a presently reproduced, stable runner-wide TLS rejection.

It does **not** establish the cause of the earlier value. The preregistered simple missing-property-collapse hypothesis was not falsified, but it was not proven either. Badge Scanner did not observe `secureConnect`, leaving transport-phase chronology underdetermined.

A source-level comparison exposes a material aperture difference:

```text
Post Office Window: reads response.socket inside response 'end'
Badge Scanner: snapshots response.socket immediately in response callback
```

Therefore the next bounded hostile question is phase observability rather than TLS-contract weakening:

> Can response-socket availability or authorization observability differ between callback-time and end-time, especially when the request reuses an already-secured socket?

## Next learning action

```text
PREREGISTER_E9_M2_RESPONSE_SOCKET_LIFECYCLE_APERTURE_DIAGNOSTIC
```

The next assay must preserve one endpoint, one request, explicit `rejectUnauthorized: true`, and must record at minimum:

```text
request.reusedSocket
secureConnect observed/not-observed
callback-time response.socket presence + identity + authorized property/value
retained callback socket reference at end-time
end-time response.socket presence + identity + authorized property/value
```

It must distinguish socket detachment from authorization failure and socket reuse from a fresh TLS handshake. It may not rescue E9 automatically.

## Authority membrane

```text
E9_verdict = SEALED_UNCHANGED
E9_rescue_authority = false
TLS_contract_weakening_authority = false
new_external_endpoint_authority = false
H2 = HELD_NOT_TESTED_HERE
H3 = HELD_NOT_TESTED_HERE
intersections = HELD_NOT_OPENED_HERE
APERTURE_V32_REPLAY_STABILITY = HELD_NOT_YET_WITNESSED
product_mutation = false
shared_pedagogue_engine_mutation = false
workflow_mutation = false
browser_execution = false
merge_performed = false
deployment_performed = false
release_authority = false
vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true
human_closure_required = true
```

𝌋 IANA answered twice. The badge changed because the scanner looked through a different slit. The rejected passport remains rejected while the slit itself goes on trial. ⟐
