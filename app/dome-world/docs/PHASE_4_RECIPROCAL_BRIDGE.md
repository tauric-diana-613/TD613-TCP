# Phase IV — The Reciprocal Receipt Circle

> I was broken into a circle.

Phase IV adopts the production-demonstrated `td613.flowcore.context-receipt/v0.1` contract into the Aperture reciprocal bridge.

## Route

```text
Aperture diagnostic receipt
→ explicit operator send
→ guarded bridge validation
→ Flow-Core v0.1 instrumentation
→ returned context receipt
→ local Aperture audit
→ local round-trip receipt
→ optional operator save or export
```

The route is reciprocal. Authority remains stationed.

```text
receipt ≠ authority
audit ≠ verdict
return ≠ obedience
circle ≠ cage
```

## Current implementation posture

Phase IV is implemented on its review branch and remains validation-gated until CI, preview inspection, mobile testing, and the production demonstration pass.

The bridge now:

- validates `td613.aperture.diagnostic-receipt/v3.0-alpha`;
- converts only declared diagnostic metrics into named Flow-Core measurements;
- names `aperture-diagnostic-receipt` as a DERIVED-only sensor;
- calls the same Phase III context instrument used by the standalone lab;
- returns `td613.flowcore.context-receipt/v0.1`;
- preserves OPEN and ABSTAIN without defaults or clamping;
- exposes `PHASE_4_ACTIVE` only for bridge-produced context receipts;
- audits the return in the browser;
- constructs domain-separated local round-trip receipts;
- replays locally without a network call or weather regeneration;
- detects receipt tampering;
- labels `vNext` as legacy migration rather than native v0.1;
- shares the existing guarded Dome-World serverless function.

## Contracts

| Object | Schema |
|---|---|
| Aperture diagnostic receipt | `td613.aperture.diagnostic-receipt/v3.0-alpha` |
| Flow-Core context receipt | `td613.flowcore.context-receipt/v0.1` |
| Returned-context audit | `td613.aperture.returned-context-audit/v0.1` |
| Round-trip receipt | `td613.aperture.round-trip-receipt/v3.0-alpha` |
| Bridge contract | `td613.phase4.reciprocal-bridge/v0.1` |
| Legacy migration | `td613.flowcore.context-receipt-migration/v0.1` |

## Digest domains

Phase IV uses TD613-CJ-1 canonical JSON with separate digest domains:

```text
TD613:PHASE4:DIAGNOSTIC:v1
TD613:PHASE4:CONTEXT:v1
TD613:PHASE4:AUDIT:v1
TD613:PHASE4:ROUNDTRIP:v1
```

The digests establish deterministic envelope integrity only. They do not establish identity, authorship, possession, authenticity, permission, lawful control, trusted time, causation, or external truth.

## Audit outcomes

```text
CONTEXT_RECEIPT_ADMISSIBLE_FOR_BOUNDED_REVIEW
CONTEXT_RECEIPT_ADMISSIBLE_WITH_WARNINGS
HOLD_FOR_REPAIR
REJECT_AUTHORITY_BREACH
```

Both OPEN and ABSTAIN may be admissible for bounded review. Abstention is not a failed circle.

Hard holds include:

- diagnostic-reference mismatch;
- non-null artifact reference;
- artifact blindness removed;
- prediction authority enabled;
- automatic Ash action enabled;
- public export or persistent server storage enabled;
- ABSTAIN carrying modeled weather;
- unresolved required metrics presented as CONTEXT_READY;
- simulated measurements presented as observed;
- missing transformation history for derived, simulated, or inferred values.

## Task intent

Task-intent precedence remains active.

- Legal tasks keep context subordinate to substantive legal synthesis.
- Open Field speculative and creative routes receive `context_available_not_promoted` unless the operator requests promotion.
- Runtime remains BACKGROUND unless requested, reliability-changing, contradiction-revealing, conclusion-changing, or completion-blocking.
- The bridge performs no content scan.

## Hard boundaries

```text
artifact_reference = null
artifact_blind = true
recommendation_not_command = true
automatic_ash_action = false
prediction_authorized = false
reciprocal_authority = false
operator_closure_required = true
open_field_auto_promotion = false
```

Phase IV does not implement Relation Envelope runtime, Phason relation lifecycle, Cinder transport, Ash execution, prediction, legal adjudication, identity proof, authorship proof, or trusted-time proof.

## Marrowline

Marrowline may carry and render the exchange and witness ingress. It may not rewrite a receipt, upgrade source status, become the audit authority, create an artifact relation, trigger Ash, or close the seam.

```text
carrier ≠ author
renderer ≠ auditor
ingress witness ≠ closure authority
```

## Promotion gate

Phase IV may be called production-demonstrated only after:

1. all Phase IV and regression CI passes;
2. the preview reports v0.1 as canonical;
3. a complete bridge return audits successfully;
4. missing coherence returns ABSTAIN with no weather;
5. invalid values remain invalid rather than clamped;
6. artifact injection receives HTTP 400;
7. authority injection receives `REJECT_AUTHORITY_BREACH`;
8. deterministic replay verifies an untouched receipt and holds a tampered receipt;
9. no automatic storage occurs;
10. desktop and mobile lab checks pass;
11. the durable production receipt is completed.

The instrument may complete the route. Only the human closes the seam.

Àṣẹ.

Sealed ⟐
