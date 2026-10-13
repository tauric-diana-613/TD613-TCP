# Ash Lifecycle Production Demonstration Receipt

Status: `EARNED`

Receipt schema: `td613.ash.lifecycle-production-demo-receipt/v0.1`

Date opened: `2026-07-15`

Date closed: `2026-07-15`

Observed runtime commit:

```text
e8cbd00673e86d9fa0969407c28ef3ed89af55f7
```

## Purpose

This receipt closes only the deployed, governed Ash lifecycle route:

```text
deployed threshold → readiness → custody root → case binding
→ current Rebuild Test → custody-bound Draft and Review
→ Release Receipt → Save Point and encrypted Capsule
→ CONTINUITY_SEALED
```

The promotion recorded here concerns lifecycle maturity only. It grants no provider authority, recipient authority, destination transport, automatic Cinder, truth status, identity status, or authenticity status.

## Implementation and repair spine

```text
PR #297 · lifecycle orchestration
af733b26f835bc5f110e251addbc49b5d75a75e0

PR #299 · browser delivery-boundary witness
901fd491ef306ff2863ada9167819ebc774b8c4b

static document delivery repair
1e2e6a90c47100ce0f96b47c1798811a3c3fe57d

declared Draft fixture and exact Draft selection
635487ab28765aaacdd19fbd73b39141345ec953
e4115763e67a42b14e10009b6cb1132baee00156

reconciled governed core and workspace delegation
249c58b58a27112d4f0b9a120a2883f9e0a2bb55
7db687062db4e4d158ee2f5f0b973dc9a0c5ac16

keepDraft-scoped Case Map binding repair
e8cbd00673e86d9fa0969407c28ef3ed89af55f7
```

## Causal closure

The final production defect came from a scope collision in the governed core transform. The transform searched the entire Keep source for:

```text
caseMapDigest: state.caseMap.case_map_digest
```

An unrelated Save Point use already contained that string, so the transform incorrectly concluded that `keepDraft()` had been bound. Commit `e8cbd00673e86d9fa0969407c28ef3ed89af55f7` scopes detection and idempotence to the `keepDraft()` body itself, inserts exactly one current Case Map digest binding, and preserves focused regressions.

## Authoritative deployed observation

```yaml
observed_commit: e8cbd00673e86d9fa0969407c28ef3ed89af55f7
upstream_deployment_workflow_run_id: 29383285733
observer_workflow_run_id: 29383294474
observer_run_url: https://github.com/tauric-diana-613/TD613-TCP/actions/runs/29383294474
evidence_artifact_id: 8330532097
evidence_artifact_sha256: sha256:93c8c3992223af4524bf16d645de394333decd62b2ab65c88a1a7d1c4c68a249
terminal_commit_status_id: 50486516511
terminal_status_receipt_sha256: sha256:8d3602d2529f59ec39974280bfbde80746797168d646925bdc435277e7b90295
lifecycle_report_sha256: sha256:bf64b8b7ef9fd392672ab311690c395ad5ad1fe612ec32cd05bbb9396a270260
evidence_manifest_sha256: sha256:b5bd7e03c2dd3630703805d125900ee249b4b15ca30ed59cf1103803e982bdb7
source_status: DEPLOYED_OBSERVATION
browser: chromium-headless
observer_result: PASS
```

The GitHub commit status and every observer workflow step completed successfully. The evidence artifact remains retained through `2026-08-14` under the workflow retention policy.

## Demonstrated lifecycle route

```text
ARRIVAL_UNPERSISTED
→ READINESS_OBSERVED
→ CUSTODY_ROOT_VERIFIED
→ CASE_BOUND
→ REBUILD_ELIGIBLE
→ RELEASE_ELIGIBLE
→ CONTINUITY_SEALED
```

### Threshold and readiness

- wrong-order threshold input reset correctly;
- Arrival → Boundary → Custody cleared in order;
- readiness remained session-scoped;
- readiness accepted and persisted no raw content;
- readiness performed no transport;
- pre-custody Test access held at `REGISTER_CUSTODY_ROOT`.

### Custody and Case Map binding

```yaml
assurance_class: L1_BROWSER_LOCAL_ARTIFACT_DIGEST
custody_receipt_id: ashc_c51727a07827e894c88f
custody_receipt_digest: sha256:fc211b3d8c5b689e4c198d54ae0ffe6ae9d2b1b87848c51727a07827e894c88f
custody_manifest_digest: sha256:b712e962969dbc875892d6e2cd4109e56d252479d91a9d6d0b5ef48e7e2e0ce0
case_map_before: sha256:deef9cdaf9a941c107093cad4d17ae4f148efb9d4e0373838fd25956eada98bd
case_map_after: sha256:502c0cb08964f5d5bb359d6e2f371d946ec6c2b52f3d8d90edfff040bdc2fb7a
custody_root_node: node_custody_1727a07827e894c88f
root_disclosure_state: LOCAL
registration_posts: 1
raw_artifact_bytes_sent: false
```

### Rebuild, Draft, Review, and Release

The following artifacts all bind the same current custody-root Case Map digest:

```text
sha256:502c0cb08964f5d5bb359d6e2f371d946ec6c2b52f3d8d90edfff040bdc2fb7a
```

```yaml
rebuild_test_id: rebuild_17b7ce2ba6f10deb85e3
rebuild_test_digest: sha256:1bd73e691af5affe9b87384969b428de41865db38eecc761dbaa74d5af9b2e1e
draft_id: draft_1a77be47f3435a39b44d
draft_body_sha256: sha256:657cb3231db1d6269622d6d038978ad1aa50f3e78b311b2366c530210d281c5a
review_id: review_54ee9f993238d11d8d14
review_status: READY_FOR_LOCAL_RELEASE_APPROVAL
release_receipt_id: release_acd258160117af383b81
release_state: RELEASE_ELIGIBLE
transmission_performed: false
recipient_transport: DEFERRED
```

### Continuity and Capsule

```yaml
save_point_id: save_53ddb3128989d85cd101
lifecycle_state: CONTINUITY_SEALED
capsule_sha256: sha256:dfacfd0c39f083c7e053e69d6516a341286789fa9ee8a790114beaf5cde7686b
wrong_passphrase_hold: true
tamper_hold: true
```

## Layout evidence

```yaml
threshold_screenshot_sha256: sha256:e11bb2b191d7f46c7220cc74c78d7b011af55cefe7984c976c8ab27843f64003
desktop_screenshot_sha256: sha256:c1219446ed79238317b0465df05dccb07370008f63194fd842c4d63ca7362ccc
mobile_portrait_screenshot_sha256: sha256:2a4318cf7bb704aad07bd9f9aa7403902333bf07edf0ec35f67002bd3469e159
mobile_landscape_screenshot_sha256: sha256:4e2cc03f37e7ff08c15d17d234a9af62c58c2f7678a425efed3845048d378a34
```

Desktop, mobile portrait, and mobile landscape each reported:

- `horizontal_overflow: 0`;
- no unreachable controls;
- `CONTINUITY_SEALED` visible;
- Custody workspace selected;
- reduced-motion operation.

## Storage and network boundaries

```yaml
raw_artifact_in_local_storage: false
raw_artifact_in_request_body: false
provider_or_transport_requests: []
disallowed_non_read_requests: []
allowed_non_read_request:
  method: POST
  route: /api/dome-world/ash-custody-register
```

Declared local storage remained limited to custody receipts, the current-case pointer, Keep preferences, and lifecycle records. Readiness remained in session storage.

## Closure fields

```yaml
status: EARNED
promotion_authorized: true
promotion_scope: ASH_LIFECYCLE_MATURITY_ONLY
observed_commit: e8cbd00673e86d9fa0969407c28ef3ed89af55f7
upstream_deployment_workflow_run_id: 29383285733
observer_workflow_run_id: 29383294474
observer_run_url: https://github.com/tauric-diana-613/TD613-TCP/actions/runs/29383294474
evidence_artifact_id: 8330532097
evidence_artifact_sha256: sha256:93c8c3992223af4524bf16d645de394333decd62b2ab65c88a1a7d1c4c68a249
terminal_commit_status_id: 50486516511
terminal_status_receipt_sha256: sha256:8d3602d2529f59ec39974280bfbde80746797168d646925bdc435277e7b90295
threshold_screenshot_sha256: sha256:e11bb2b191d7f46c7220cc74c78d7b011af55cefe7984c976c8ab27843f64003
desktop_screenshot_sha256: sha256:c1219446ed79238317b0465df05dccb07370008f63194fd842c4d63ca7362ccc
mobile_portrait_screenshot_sha256: sha256:2a4318cf7bb704aad07bd9f9aa7403902333bf07edf0ec35f67002bd3469e159
mobile_landscape_screenshot_sha256: sha256:4e2cc03f37e7ff08c15d17d234a9af62c58c2f7678a425efed3845048d378a34
lifecycle_report_sha256: sha256:bf64b8b7ef9fd392672ab311690c395ad5ad1fe612ec32cd05bbb9396a270260
evidence_manifest_sha256: sha256:b5bd7e03c2dd3630703805d125900ee249b4b15ca30ed59cf1103803e982bdb7
operator_closure: EVIDENCE_VERIFIED_AND_LIFECYCLE_MATURITY_PROMOTED
```

## Non-authorities

```text
arrival ≠ consent
readiness ≠ custody
custody ≠ authenticity
case binding ≠ truth
rebuild eligibility ≠ release authority
continuity ≠ transport
lifecycle maturity promotion ≠ transport authorization
production demonstration ≠ automatic Cinder
```

The observer itself authorized no promotion. This later evidence-only receipt verifies the preserved artifact and closes the maturity gate. Ash lifecycle orchestration may now be recorded as `IMPLEMENTED_PRODUCTION_DEMONSTRATED`; transport and automatic Cinder remain false.
