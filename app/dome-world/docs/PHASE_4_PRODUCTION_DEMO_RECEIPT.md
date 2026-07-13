# Phase IV Production Demo Receipt

**Status:** RUNTIME DEMONSTRATION PASS · PRODUCTION/PREVIEW RUNTIME NOT OBSERVED

**Tester:** GitHub Actions — `Dome-World Phase 4`, run `29214493924`

**Date/time:** 2026-07-13 00:03 UTC

**Device:** GitHub-hosted Ubuntu 24.04 runner; responsive viewports `1440×1000`, `390×844`, `844×390`, then `390×844` rotation return

**Browser:** Chromium headless via Playwright 1.53.2

**Production/preview URL:** `https://td-613-tcp-git-amari-phase4-reci-056784-tauric-diana-s-projects.vercel.app`

**Runtime commit:** `12950a8f51e228679b986bdb90f266e4c0b63ec1`

**Deployment:** Vercel preview reported Ready. Unauthenticated CI received HTTP `302` with `text/plain`; no automation-bypass secret was configured. This access receipt establishes deployment protection, not Phase IV runtime failure or production success.

**Demonstration artifact:** `phase4-reciprocal-receipt-demonstration`, artifact `8266136863`, archive digest `sha256:ac455fcc92f6317fa76d7ec88967243c7ee939aacaf89875937731c104b18724`

## Evidentiary layers

1. **Contract and regression CI:** PASS.
2. **Shared-guard runtime integration:** PASS against the committed `api/dome-world-engine-guard.py` through the bounded local integration harness.
3. **Desktop/mobile browser demonstration:** PASS against that same shared-guard runtime and committed lab assets.
4. **Vercel preview deployment access:** HELD by deployment protection (`302`); runtime response unavailable to unauthenticated CI.
5. **Production runtime:** NOT OBSERVED. No promotion claim is made from the protected preview response.

The integration harness added no serverless function. It served the committed browser assets and imported the same shared guard used by the Vercel route.

## Checkpoint receipt

- **A. Identity and first paint:** PASS — integration surface rendered the Phase IV title and four receipt stations.
- **B. Bridge readiness:** PASS — `td613.flowcore.context-receipt/v0.1`; reciprocal receipts true; reciprocal authority false; artifact blindness true; artifact relation false; automatic Ash action false; prediction authority false; operator closure required; runtime default BACKGROUND; Open Field auto-promotion false.
- **C. Valid derived round trip:** PASS — API context `flowctx_8fd1545a2e69217a3297`; API round trip `aprt_023908b3e65e564954dc`; browser context `flowctx_1da1f571036ff51c5ef5`; browser round trip `aprt_00626c36d6cf5846d864`.
- **D. Missing coherence:** PASS — `ABSTAIN / ABSTAIN_INSUFFICIENT_CONTEXT`; weather null.
- **E. Invalid divergence:** PASS — divergence outside `[0,1]` remained invalid; value withheld; abstention returned; no clamping.
- **F. Returned-context audit:** PASS — `CONTEXT_RECEIPT_ADMISSIBLE_FOR_BOUNDED_REVIEW`.
- **G. Diagnostic-reference mismatch:** PASS — `HOLD_FOR_REPAIR`.
- **H. Artifact injection:** PASS — HTTP `400`; no context receipt.
- **I. Authority injection:** PASS — `REJECT_AUTHORITY_BREACH`.
- **J. Open Field route:** PASS — `context_available_not_promoted`; `open_field_promotion: false`.
- **K. Quiet runtime:** PASS — BACKGROUND remained unsurfaced.
- **L. Round-trip replay:** PASS — `ROUND_TRIP_VERIFIED`; network false; weather regeneration false; storage mutation false.
- **M. Tamper replay:** PASS — `ROUND_TRIP_HELD_TAMPER`.
- **N. Explicit persistence:** PASS — no local receipt write before operator selected Save; one local receipt after explicit Save.
- **O. Legacy vNext migration:** PASS — `LEGACY_PROVISIONAL_NORMALIZED`; `native_v01: false`; `LEGACY_PHASE_4_MIGRATION`.
- **P. Mobile portrait:** PASS — `390×844`; one grid column; zero horizontal overflow; no clipped controls.
- **Q. Mobile landscape and rotation return:** PASS — `844×390` restored two columns; return to `390×844` restored one column; zero horizontal overflow and no clipped controls in both states.
- **R. Browser console:** PASS — zero console or page errors.

## Canonical runtime probe

```json
{
  "base_url": "http://127.0.0.1:6134",
  "readiness": "phase-4-implemented-validation-gated",
  "context_schema": "td613.flowcore.context-receipt/v0.1",
  "context_receipt": "flowctx_8fd1545a2e69217a3297",
  "audit": "CONTEXT_RECEIPT_ADMISSIBLE_FOR_BOUNDED_REVIEW",
  "round_trip": "aprt_023908b3e65e564954dc",
  "replay": "ROUND_TRIP_VERIFIED",
  "tamper_replay": "ROUND_TRIP_HELD_TAMPER",
  "abstention": "ABSTAIN_INSUFFICIENT_CONTEXT",
  "invalid_range": "ABSTAIN_INSUFFICIENT_CONTEXT",
  "authority_injection": "REJECT_AUTHORITY_BREACH",
  "reference_mismatch": "HOLD_FOR_REPAIR",
  "open_field": ["context_available_not_promoted"],
  "quiet_runtime_surfaced": false,
  "artifact_rejection": 400,
  "legacy_migration": "LEGACY_PROVISIONAL_NORMALIZED",
  "reciprocal_authority": false,
  "automatic_ash_action": false,
  "prediction_authorized": false
}
```

## Browser layout receipt

```json
{
  "status": "PASS",
  "desktop": {"viewport":"1440x1000","grid_columns":2,"horizontal_overflow":0,"clipped_controls":[]},
  "mobile_portrait": {"viewport":"390x844","grid_columns":1,"horizontal_overflow":0,"clipped_controls":[]},
  "mobile_landscape": {"viewport":"844x390","grid_columns":2,"horizontal_overflow":0,"clipped_controls":[]},
  "rotation_return": {"viewport":"390x844","grid_columns":1,"horizontal_overflow":0,"clipped_controls":[]},
  "console_errors": []
}
```

## Preview access receipt

```json
{
  "schema": "td613.phase4.preview-access/v0.1",
  "state": "PROTECTED_OR_NON_JSON",
  "http_status": "302",
  "content_type": "text/plain",
  "bypass_configured": false,
  "claim": "deployment-access-receipt-not-runtime-verdict"
}
```

## Final recommendation

**IMPLEMENTATION READY FOR REVIEW · PRODUCTION PROMOTION HELD**

Phase IV is implemented and demonstrated through the shared guarded runtime on desktop and mobile. The PR must not be labeled production-demonstrated until an authenticated preview probe or a post-merge production probe observes the deployed JSON runtime directly. Deployment protection remains an access boundary, never evidence against the bridge and never a substitute for production observation.

Receipt ≠ authority. Audit ≠ verdict. Return ≠ obedience. Circle ≠ cage.

Sealed ⟐
