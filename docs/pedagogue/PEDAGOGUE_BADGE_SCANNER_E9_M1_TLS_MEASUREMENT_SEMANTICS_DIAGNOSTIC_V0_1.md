# TD613 · Pedagogue Badge Scanner

## E9-M1 · TLS Measurement Semantics Diagnostic v0.1

U+10D613

Status: **PREREGISTERED / DIAGNOSTIC-ONLY / E9 NOT RESCUED / NO PROMOTION**

### Why this diagnostic exists

Post Office Window observed a live HTTPS response from the exact preregistered IANA target, including HTTP 200 and bounded response bytes/hash, but refused E9 admission because the recorded predicate:

```text
response.socket?.authorized === true
```

resolved false.

That expression collapses at least two materially different states:

```text
socket.authorized === false
socket.authorized is absent / unreadable / undefined
```

The E9 result remains sealed as:

```text
LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_FALSIFIED_OR_UNAVAILABLE_IN_BOUNDED_POST_OFFICE_WINDOW
```

This diagnostic may explain the measurement. It may **not** retroactively rewrite the E9 preregistration or verdict.

## Diagnostic question

> In the exact runner environment, what TLS state is actually exposed by Node during an explicit `rejectUnauthorized: true` HTTPS request to the same preregistered IANA endpoint, and is that state stable between `secureConnect` and the response callback?

## Frozen target

```text
request_url = https://www.iana.org/domains/reserved
method = GET
attempts = 1
redirect_policy = refuse
rejectUnauthorized = true
request_timeout_ms = 8000
response_body_limit_bytes = 1048576
```

No second internet endpoint is admitted by this diagnostic.

## Frozen measurements

The diagnostic records only bounded non-secret runtime metadata:

```text
request_completed
response_status
redirected
request_socket_constructor
response_socket_constructor
request_socket_encrypted
response_socket_encrypted
request_socket_has_authorized_property
response_socket_has_authorized_property
secure_connect_observed
secure_connect_authorized_value
secure_connect_authorization_error_present
response_authorized_value
response_authorization_error_present
request_and_response_socket_same_object
peer_certificate_present
peer_certificate_fingerprint256_present
tls_protocol_present
cipher_name_present
body_sha256
body_bytes
```

It must not record:

- environment-variable values;
- private keys or secrets;
- full certificate contents;
- cookies or authentication tokens;
- response body in repository artifacts.

## Diagnostic classes

The assay does not force a pass/fail theory verdict. It classifies the observed TLS measurement surface.

Candidate classes include:

```text
TLS_AUTHORIZED_TRUE_STABLE
TLS_AUTHORIZED_FALSE_WITH_AUTHORIZATION_ERROR
TLS_AUTHORIZED_FALSE_WITHOUT_AUTHORIZATION_ERROR
TLS_AUTHORIZED_PROPERTY_UNAVAILABLE
TLS_AUTHORIZATION_STATE_CHANGED_BETWEEN_SECURECONNECT_AND_RESPONSE
TLS_SECURECONNECT_NOT_OBSERVED
TLS_RESPONSE_UNAVAILABLE
TLS_SOCKET_IDENTITY_MISMATCH
TLS_MEASUREMENT_UNDERDETERMINED
```

Multiple compatible flags may be preserved in the receipt; no scalar collapse is permitted.

## Required controls

### BS01 · explicit verification control

Use the exact target with explicit `rejectUnauthorized: true`.

### BS02 · property-presence control

Distinguish:

```text
Object/`in`-level property availability
```

from the boolean value of `authorized`.

### BS03 · phase control

Record authorization posture at `secureConnect` and again in the response callback.

### BS04 · socket-identity control

Record whether the socket observed at request/secure-connect time is the same object later exposed by the response.

### BS05 · error-state control

Preserve whether `authorizationError` exists without persisting arbitrary error text as authority.

### BS06 · TLS-shape control

Record bounded posture only: encrypted flag, socket constructor name, peer-certificate presence/fingerprint-presence, protocol presence, cipher-name presence.

### BS07 · E9 immutability control

Require the sealed E9 verdict to remain falsified-or-unavailable regardless of the diagnostic classification.

### BS08 · claim-ceiling control

The diagnostic may classify the runner TLS measurement surface. It may not establish:

```text
IANA source honesty
IANA legal/institutional authority
physical server origin
proxy/CDN absence
universal Web PKI semantics
source independence
external chronology
```

## Falsifier for the instrumentation hypothesis

If the diagnostic establishes:

```text
authorized property present = true
secureConnect authorized = false
response authorized = false
authorizationError present = true
request still completed with explicit rejectUnauthorized = true
```

then the simple “missing property collapsed to false” hypothesis is falsified. The runner exposes a deeper transport/runtime discrepancy that requires a new diagnosis.

If instead:

```text
authorized property present = false
```

then the original E9 boolean recording was insufficient to distinguish unavailability from negative authorization.

Neither result rescues E9 automatically.

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

𝌋 The badge scanner is being calibrated. The rejected passport stays rejected while we inspect the scanner. ⟐
