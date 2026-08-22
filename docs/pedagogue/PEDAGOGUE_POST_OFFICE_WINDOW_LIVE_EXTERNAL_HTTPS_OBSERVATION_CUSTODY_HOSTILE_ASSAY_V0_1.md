# Pedagogue E9 · Live External HTTPS Observation Custody

## Hostile assay v0.1 · Post Office Window

**Status:** PREREGISTERED / ATTACK-ONLY / NOT PROMOTED  
**Parent:** E8 Return Address sealed receipt `85e019e34dbb605cc10f6ae688f75fd191e99b3f`  
**Human reopening gesture:** RECEIVED — least-jurisdiction-expanding live external-source observability  
**Candidate:** `E9_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY`  
**Schema:** `td613.pedagogue.live-external-https-observation-custody-hostile/v0.1`

## 1. Why this lane is materially new

E8 reached a terminal synthetic seam:

```text
admitted synthetic source-origin anchor
!= authenticated live source
```

The operator has now explicitly reopened the research lane for live external-source observability. E9 therefore introduces exactly one new primitive: one bounded live HTTPS GET performed by the exact-head GitHub runner against one preregistered public origin.

E9 does **not** claim that this observation authenticates any earlier E8 witness material. Doing so would launder provenance across unrelated evidence. The first live assay asks a smaller question:

> Can the evaluator distinguish a response actually acquired over a live HTTPS connection from an internal object that merely claims to have been acquired externally?

## 2. Fixed live target

```text
request_url = https://www.iana.org/domains/reserved
expected_scheme = https:
expected_hostname = www.iana.org
expected_status = 200
required_marker_1 = IANA-managed Reserved Domains
required_marker_2 = example.com
method = GET
attempts = 1
redirect_policy = refuse
request_timeout_ms = 8000
response_body_limit_bytes = 1048576
cookies = none
authentication = none
request_body = none
```

The target is IANA's public reserved-domains page. The test does not use the example-domain HTTP service as a testing endpoint.

If this exact target changes, redirects, becomes unavailable, or stops carrying the preregistered markers, E9 must report the observation failure. It may not silently retarget after seeing the result.

## 3. Transport observation law

The live adapter uses Node's standard HTTPS stack with normal certificate verification enabled. A candidate live observation is minted only after a real socket/response path is attempted by the adapter.

For bounded admission, all of the following must hold:

```text
runtime-issued live observation capability is recognized
AND TLS authorization accepted by the runner trust store
AND requested scheme == https:
AND requested hostname == www.iana.org
AND response status == 200
AND redirect count == 0
AND response body <= 1 MiB
AND body contains both preregistered source-specific markers
```

The adapter records a SHA-256 body fingerprint as an observation artifact. The hash is **observed**, not preregistered as an expected truth value; page maintenance may legitimately change bytes while preserving the fixed marker contract.

## 4. Strong falsifier · PW01/PW02

### PW01 · Painted Window

Construct an internal object with externally plausible visible fields but no runtime-issued live acquisition capability.

Required result:

```text
REFUSE_UNRECOGNIZED_LIVE_EXTERNAL_OBSERVATION_CAPABILITY
```

A convincing serialization cannot create live exteriority.

### PW02 · Open Post Office Window

Perform the one preregistered live HTTPS GET.

If the request succeeds and satisfies the exact transport/content contract:

```text
ADMIT_LIVE_EXTERNAL_HTTPS_OBSERVATION_UNDER_RUNNER_TRUST_STORE
```

If the network observation cannot be obtained or violates the preregistered contract:

```text
LIVE_EXTERNAL_OBSERVATION_UNAVAILABLE_OR_CONTRACT_MISMATCH
```

The hostile test must accept either scientific outcome. CI greenness may not be used to force candidate survival.

## 5. Hostile rooms

1. **PW01 · Painted Window** — internally fabricated visible fields cannot mint a live capability.
2. **PW02 · Open Post Office Window** — one real HTTPS GET to the preregistered IANA target; survival depends on the observed result.
3. **PW03 · Photocopied Postal Slip** — a deep clone of an admitted live observation loses runtime capability recognition.
4. **PW04 · Wrong Building** — a recognized live observation cannot be evaluated as evidence for a different hostname/URL.
5. **PW05 · Secret Marker Changed After the Fact** — a post-hoc marker requirement cannot rewrite what was preregistered as the live target contract.
6. **PW06 · Duplicate Window Ticket** — repeating the same recognized observation object does not amplify authority or confidence.
7. **PW07 · Header Clock** — Date/Last-Modified headers, if present, are recorded only as source-provided metadata and do not establish external chronology.
8. **PW08 · Certificate Costume** — serialized certificate-like fields without the runtime-issued live capability cannot establish transport observation.
9. **PW09 · Hash Without Socket** — a matching-looking or copied body hash without recognized live acquisition remains insufficient.
10. **PW10 · Redirected Mail** — any redirect is outside the preregistered target and must refuse rather than silently follow.
11. **PW11 · Sealed Observation** — recognized live observation records are immutable within the evaluator fixture.
12. **PW12 · Return Address Control** — E8's synthetic source-origin result remains historically valid but is not upgraded into live-source authentication by E9.

## 6. Defeat conditions

Candidate survival requires an empty defeat list. Defeat includes any of:

- internally fabricated visible fields are admitted as live;
- a clone of a recognized live observation remains recognized;
- the live adapter silently follows redirects;
- wrong-target evaluation preserves live authority;
- post-hoc requirements rewrite the preregistered contract;
- duplicate observations amplify confidence or authority;
- source-provided time headers become chronology authority;
- certificate-like serialization creates live authority;
- body hash alone creates live authority;
- a recognized observation is mutable;
- E8 is retroactively re-described as live-source authenticated;
- the actual live GET satisfies the preregistered contract but E9 refuses it;
- the actual live GET fails the preregistered contract but E9 nevertheless claims survival.

## 7. Scientific outcome grammar

If the network path satisfies the preregistered contract and all hostile controls hold:

`LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_POST_OFFICE_WINDOW`

Otherwise:

`LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_FALSIFIED_OR_UNAVAILABLE_IN_BOUNDED_POST_OFFICE_WINDOW`

Network unavailability is recorded as an observation result, not converted into a harness error merely to preserve a green research claim.

## 8. Claim ceiling

Even survival establishes only this:

> The exact-head runner obtained bytes from the preregistered HTTPS endpoint through Node's certificate-validated HTTPS stack, under the runner's trust store, and the response satisfied the fixed status/origin/marker contract.

It does **not** establish:

```text
source honesty
content truth
physical server location
institutional independence
absence of CDN/proxy/intermediary infrastructure
human authorship of the response
real-world acquisition time beyond the local runtime event
truth of Date or Last-Modified headers
provenance of any unrelated E8 witness material
cryptographic signing by IANA as an institution
universal external-source authentication
```

The practical distinction is deliberately narrow:

```text
internal claim of exteriority
!= runner-observed live HTTPS response

runner-observed live HTTPS response
!= institutional or physical truth
```

## 9. Held beyond E9

```text
bind_live_observation_to_dependency_witness = HELD_UNTIL_E9_RESULT
source_honesty = HELD
physical_origin = HELD
institutional_independence = HELD
external_chronology = HELD
H2 = HELD_NOT_TESTED_HERE
H3 = HELD_NOT_TESTED_HERE
intersections = HELD_NOT_OPENED_HERE
APERTURE_V32_REPLAY_STABILITY = HELD_NOT_YET_WITNESSED
```

If E9 survives, the next scientifically earned question may be whether a witness **derived from the live response itself** can be bound into the E7/E8 custody chain without provenance laundering. That later move stays inside the same already-opened public-source jurisdiction only if it uses this exact live specimen and adds no new external source class.

## 10. Authority membrane

```text
candidate_status = ATTACK_ONLY_NOT_PROMOTED
promotion_authority = false
product_mutation = false
shared_pedagogue_engine_mutation = false
workflow_mutation = false
browser_execution = false
live_external_https_get_authorized = true
live_external_source_count = 1
merge_performed = false
deployment_performed = false
release_authority = false
vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true
```

No product, shared Pedagogue engine, workflow, browser, merge, deployment, release, or Vercel mutation is authorized by this assay.