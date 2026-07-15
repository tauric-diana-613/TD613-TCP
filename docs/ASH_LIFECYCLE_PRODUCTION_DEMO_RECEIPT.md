# Ash Lifecycle Production Demonstration Receipt

Status: `NOT_YET_EARNED`

Receipt schema: `td613.ash.lifecycle-production-demo-receipt/v0.1`

Date opened: `2026-07-15`

Implementation merge:

```text
PR #297
af733b26f835bc5f110e251addbc49b5d75a75e0
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
deployed PASS ≠ automatic promotion
```

The lifecycle probe may perform the one custody-registration POST required by the assay. It may not send artifact bytes, invoke a provider, contact a recipient, authorize Cinder, enable transport, or modify release metadata.

A passing workflow does not edit this receipt automatically. Promotion requires a later evidence-only commit that names and verifies the preserved artifact, terminal status, screenshot digests, observed commit, and operator closure.
