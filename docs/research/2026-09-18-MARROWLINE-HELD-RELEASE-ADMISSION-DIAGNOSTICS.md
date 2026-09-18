# 𝌋 Marrowline held-release admission diagnostics

Date: 2026-09-18  
Held release run: `35312723254`  
Held source packet: `f91005f0295c3cfab69e46ebff37e4293dacd4d4`

## Preserved facts

The emergency custody repair deployed with exact-source and byte-parity success, survived the stale-rollback window, passed A14/Archive and Ash lifecycle production witnesses, then HELD at the live Marrowline canary.

Observed route:

```text
gemini-3.8-flash -> HTTP 503
gemini-3.5-flash -> HTTP 200 -> local admission HELD
gemini-2.5-flash -> HTTP 503
terminal diagnostic -> ATTRACTOR_STRUCTURE_NOT_ADMITTED
```

The independent Loom live route completed successfully through Gemini 3.5.

## Diagnostic blind spot

`server/khonapolit-quality.js` already returned bounded structural rejection telemetry:

```text
diagnostic.rejectedAttempts[].model
diagnostic.rejectedAttempts[].reasons[]
```

The release canary discarded those reason codes and retained only the generic terminal diagnostic. Rejected provider prose remained intentionally unavailable.

## Repair

`scripts/loom-production-canary.mjs` now preserves only bounded lowercase/hyphen admission reason codes, both:

- per provider attempt as `admission_reasons`; and
- from the terminal diagnostic as `rejected_attempts`.

The held error line also prints those bounded codes.

No rejected provider prose is persisted. No admission rule is weakened. No provider-selection rule changes.

The purpose is to distinguish, on the next live witness, between structural causes such as voice-order loss, nominative loss, duplicate transmission, or canonical recitation before making any product repair.

```text
diagnostic observability != admission relaxation
reason-code preservation != rejected-prose preservation
```

Sealed ⟐
