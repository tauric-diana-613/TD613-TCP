# Ash Lifecycle Production Demonstration Receipt

Status: `NOT_YET_EARNED`

Receipt schema: `td613.ash.lifecycle-production-demo-receipt/v0.1`

Date opened: `2026-07-15`

Date refreshed: `2026-07-15`

Implementation spine:

```text
PR #297 · lifecycle orchestration
af733b26f835bc5f110e251addbc49b5d75a75e0

PR #299 · browser delivery-boundary witness
901fd491ef306ff2863ada9167819ebc774b8c4b

PR #303 · release-gate observer idempotence
6a5ad63871d026668661d077bb4072dcd206c893
```

## Purpose

This receipt closes only after a deployed browser observation completes the full governed route:

```text
deployed threshold → readiness → custody root → case binding
→ current Rebuild Test → custody-bound Draft and Review
→ Release Receipt → Save Point and encrypted Capsule
→ CONTINUITY_SEALED
```

The receipt remains separate from implementation merge, unit tests, local closure, Ash Keep's earlier production status, and the evidence-producing workflow.

## Pre-closure observation ledger

### Observation A · historical direct-to-Keep probe

```text
workflow run: 29379767208
historical workflow head: af733b26f835bc5f110e251addbc49b5d75a75e0
ruling: PROBE_OBSOLETE_FOR_LIFECYCLE_CLOSURE
```

The historical observer entered Ash Keep directly and attempted Routes before establishing a custody root. The current product correctly redirected that action into Custody. Its later `#workspace-routes` timeout records lifecycle enforcement, not a failed custody workflow. This run cannot promote or demote the current lifecycle.

### Observation B · browser delivery boundary before repair

```text
classification: BROWSER_DOCUMENT_STALLED
HTTP: 200
content type: text/html
DOM title: unavailable
h1 count: 0
browser-rendered bytes: 0
screenshot: unavailable
```

The route returned the expected document and Ash shell headers, while Chromium's main thread remained starved after navigation.

### Observation C · causal repair

PR #303 made the release-gate disabled-state write idempotent. The prior `MutationObserver` could wake itself by unconditionally rewriting the same `disabled` attribute. The repaired gate changes the attribute only when the required state differs.

The permanent regression executes the real `enforceReleaseGate()` body under a live `MutationObserver` and proves that one required transition emits one callback while a repeated gate check emits no successor mutation.

### Observation D · browser delivery boundary after repair

```text
artifact id: 8330030234
artifact digest: sha256:777736c61ca5fd59de270a2a5102fe36bc24e2f3d759238d732524865c50ff4b
classification: DOCUMENT_READY
HTTP: 200
content type: text/html; charset=utf-8
document title: TD613 Ash Keep · Case Map
h1 count: 1
browser-rendered bytes: 40498
console errors: 0
failed requests: 0
diagnostic timeouts: 0
screenshot captured: true
```

This evidence closes the first-paint and browser-delivery hold only. It does not close the complete lifecycle route.

## Current closure posture

```text
first_paint: DEMONSTRATED
browser_delivery: DEMONSTRATED
full_lifecycle_route: PENDING_CURRENT_OBSERVER
promotion_authorized: false
```

The next authoritative run must use the current `ash-lifecycle-production-probe.mjs`. That probe begins at the threshold, proves the pre-custody workspace hold, computes an L1 browser-local artifact commitment, registers and verifies Custody, binds the Case Map root, and only then enters Test, Draft, Release, and Continuity.

A rerun of a historical job preserves its historical workflow definition. It cannot substitute for a current-workflow observation merely because it points at the current deployment.

## Required evidence

- exact deployed commit;
- upstream deployment workflow run ID;
- lifecycle observer workflow run ID and URL;
- evidence artifact ID and SHA-256;
- threshold, desktop, mobile portrait, and mobile landscape screenshot digests;
- session-only readiness receipt;
- L1 browser-local artifact commitment;
- custody manifest and receipt digest verification;
- before/after Case Map digests;
- custody-root node and reference;
- Rebuild Test bound to the current Case Map digest;
- Draft, Review, and Release Receipt bound to the same Case Map digest;
- `CONTINUITY_SEALED` lifecycle receipt;
- Capsule, wrong-passphrase, and tamper evidence;
- storage and network boundary observations;
- terminal commit-status ID and status-receipt digest.

## Closure fields

```yaml
status: NOT_YET_EARNED
promotion_authorized: false
observed_commit: null
upstream_deployment_workflow_run_id: null
observer_workflow_run_id: null
observer_run_url: null
evidence_artifact_id: null
evidence_artifact_sha256: null
terminal_commit_status_id: null
terminal_status_receipt_sha256: null
threshold_screenshot_sha256: null
desktop_screenshot_sha256: null
mobile_portrait_screenshot_sha256: null
mobile_landscape_screenshot_sha256: null
lifecycle_report_sha256: null
evidence_manifest_sha256: null
operator_closure: null
```

## Non-authorities

```text
arrival ≠ consent
readiness ≠ custody
custody ≠ authenticity
case binding ≠ truth
rebuild eligibility ≠ release authority
continuity ≠ transport
deployed first paint ≠ lifecycle closure
deployed PASS ≠ automatic promotion
historical workflow rerun ≠ current workflow observation
```

The lifecycle probe may perform the one custody-registration POST required by the assay. It may not send artifact bytes, invoke a provider, contact a recipient, authorize Cinder, enable transport, or modify release metadata.

A passing workflow does not edit this receipt automatically. Promotion requires a later evidence-only commit that names and verifies the preserved artifact, terminal status, screenshot digests, observed commit, and operator closure.
