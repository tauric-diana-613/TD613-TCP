# TD613 · Pedagogue Window Latch

## E9-M2 · Response-Socket Lifecycle Aperture Diagnostic v0.1

U+10D613

Status: **PREREGISTERED / DIAGNOSTIC-ONLY / E9 NOT RESCUED / NO PROMOTION**

### Parent evidence

```text
E9 parent receipt = a91aba633a719e7d1e8a9f89b2a86098b5024a1a
E9-M1 Badge Scanner receipt = 2533c3a390b5c3b7bf2e11593881ecb596b540db
```

E9 remains sealed falsified-or-unavailable. M1 established that the same IANA payload can arrive through an encrypted `TLSSocket` exposing `authorized=true` at response-callback time, while `secureConnect` was not observed.

Source comparison reveals a phase mismatch:

```text
Post Office Window samples response.socket in response 'end'.
Badge Scanner samples response.socket immediately in the response callback.
```

This diagnostic puts that aperture difference on trial.

## Diagnostic question

> On one exact live request through the same default Node HTTPS agent path, what happens to response-socket identity and TLS authorization observability between response callback-time and response end-time, and was the request socket reused?

## Frozen target and transport posture

```text
request_url = https://www.iana.org/domains/reserved
method = GET
attempts = 1
redirect_policy = refuse
rejectUnauthorized = true
servername = www.iana.org
agent = Node default https.globalAgent path
request_timeout_ms = 8000
response_body_limit_bytes = 1048576
```

No second endpoint and no second request are admitted.

## Frozen lifecycle measurements

The assay records bounded non-secret metadata only:

```text
request_reused_socket
request_socket_present
secure_connect_observed
callback_response_socket_present
callback_response_socket_constructor
callback_response_socket_encrypted
callback_response_socket_authorized_property_present
callback_response_socket_authorized_value
callback_response_socket_authorization_error_present
retained_callback_socket_same_as_request_socket
end_response_socket_present
end_response_socket_same_as_callback_socket
end_response_socket_authorized_property_present
end_response_socket_authorized_value
end_response_socket_authorization_error_present
retained_socket_present_at_end
retained_socket_authorized_property_present_at_end
retained_socket_authorized_value_at_end
retained_socket_authorization_error_present_at_end
retained_socket_destroyed_at_end
body_sha256
body_bytes
response_status
```

No environment values, response body, full certificate, secret, cookie, or authentication material may be persisted.

## Required controls

### WL01 · One-request control
Exactly one request to the frozen IANA target.

### WL02 · Default-agent reproduction control
Do not force a fresh agent. Preserve the same default-agent family used by E9 and record `request.reusedSocket` rather than guessing handshake freshness.

### WL03 · Callback aperture
Freeze the response socket shape immediately when the response callback begins.

### WL04 · Retained-object aperture
Retain the callback-time socket object by reference and sample that exact object again at end-time.

### WL05 · Response-property aperture
Separately sample `response.socket` again at end-time. Never substitute the retained object for the property being tested.

### WL06 · Reuse / secureConnect separation
Record both `request.reusedSocket` and whether a `secureConnect` event was observed. Missing `secureConnect` alone may not be interpreted as failed TLS.

### WL07 · E9 immutability
Require the sealed E9 verdict to remain unchanged under every M2 classification.

### WL08 · Claim ceiling
M2 may diagnose Node socket lifecycle observability in this exact runner execution. It may not establish IANA honesty, physical origin, institutional authority, universal Node behavior, universal Web PKI semantics, proxy/CDN absence, or external chronology.

## Preregistered classification space

Multiple compatible classes may coexist. Scalar confidence aggregation is forbidden.

```text
REUSED_SOCKET_WITHOUT_SECURECONNECT
REUSED_SOCKET_WITH_SECURECONNECT_OBSERVED
FRESH_SOCKET_WITH_SECURECONNECT_OBSERVED
FRESH_SOCKET_WITHOUT_SECURECONNECT_OBSERVED
CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_UNAVAILABLE_RETAINED_AUTH_TRUE
CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_AUTH_TRUE
CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_AUTH_FALSE
RETAINED_SOCKET_AUTHORIZATION_CHANGED
END_RESPONSE_SOCKET_IDENTITY_CHANGED
CALLBACK_AUTH_FALSE
END_RESPONSE_SOCKET_PROPERTY_UNAVAILABLE
LIFECYCLE_MEASUREMENT_UNDERDETERMINED
```

## Primary instrumentation hypothesis and falsifier

### H-M2-A · Late property lookup aperture

Candidate mechanism:

```text
callback response.socket = authorized TLSSocket
retained callback socket at end = same authorized TLSSocket
end-time response.socket = absent or authorization property unavailable
```

If witnessed, E9's late `response.socket?.authorized === true` expression can convert response-property unavailability into `false` even though the retained transport socket remains authorized. This would explain a measurement mechanism in the current runner; it still would not retroactively rescue E9.

### Falsifier

If the exact run instead establishes:

```text
callback response.socket authorized = true
end-time response.socket present = true
end-time response.socket authorized property present = true
end-time response.socket authorized = true
```

then the simple late-property-lookup explanation is falsified for this execution. A different cause must be sought.

If the retained socket's authorization value itself changes, classify that separately; do not call it property detachment.

## Authority membrane

```text
E9_verdict = SEALED_UNCHANGED
E9_rescue_authority = false
M1_rewrite_authority = false
TLS_contract_weakening_authority = false
new_external_endpoint_authority = false
additional_request_authority = false
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

𝌋 The window answered. Now we mark the latch at the instant it opens and again when the letter finishes sliding through. ⟐
