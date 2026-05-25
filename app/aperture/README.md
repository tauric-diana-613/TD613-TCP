# TD613 Aperture

## What this is

Aperture shows you when a system is filtering, narrowing, or
suppressing your content — not to enforce those rules, but to make the
filtering visible so you know what happened. Modern AI-shaped pipelines
quietly compress, reroute, or drop candidate outputs all the time;
that's invisible by default. Aperture sits *after* generation and
audits what happened to a candidate as it moved through the stack,
exposing the pressures that shaped the result.

The instrument's stance is anti-enforcement and warning-first. If a
generator misses, Aperture surfaces a visible hold docket rather than
covering for it. If a stronger candidate was suppressed in favor of a
shallower one, Aperture says so. The point is to make the *governed
exposure* of a system observable to the people whose work passes
through it.

## Who it's for

- **Authors** testing whether a candidate they wrote is being narrowed
  silently as it passes through downstream gating.
- **Researchers** auditing post-generation filtering — comparing what a
  generator emitted against what survived to a public surface.
- **Operators** preserving evidence of suppression so that later
  inspection can reconstruct what was filtered, by what pressure, and
  with what cost.

## How it flows

```
Candidate (from generator, or pasted manually)
    │
    ▼
Aperture audit (13 tracked signals)
    │
    ├── witness-anchor pressure
    ├── alias persistence / naming sensitivity
    ├── compression / capacity / policy pressure
    ├── counter-recognition pressure
    ├── candidate suppression / observability deficit
    ├── temporal posture / closure class
    └── historical crease / unfolding energy / pilot domain
    │
    ▼
Aperture ledger drawer (in UI)  +  apertureAudit / aperture_audit packet field
    │
    ▼
Optional handoff into Safe Harbor — the audit travels with the sealed packet
```

The audit lives in a **secondary** drawer in the UI, not the primary
surface. The main result still answers "did this land, is it usable,
is it distinct, what's still wrong?" — Aperture's role is to make the
filtering visible without drowning the outcome.

## Approval transparency

Aperture must never collapse a blocked or held candidate into the
opaque message `No approved candidate was produced.` When an approval
gate blocks export, the packet should expose the reason rather than
quietly reenacting admissibility sorting.

The approval-transparency helper emits:

- `approvedCandidate`
- `approvalStatus`
- `approvalReason`
- `approvalDiagnostics`
- a normalized `sealStatus`

The diagnostics name the route-state blocker, hard stops, human
reclosure state, consent / claim-ceiling blockers, and candidate
availability. Blocking remains allowed; hidden blocking is not.

## How it relates to Safe Harbor

A Safe Harbor packet can carry an `aperture_audit` block that records
what filtering or narrowing happened to the staged content before it
was sealed. That means a verifier of a sealed packet can see not just
*what was attested* but *what pressures shaped the candidate on the
way to attestation*. Aperture and Safe Harbor are independently
useful; together they make the exposure surface complete.

## What's missing right now

[ROADMAP.md](../../ROADMAP.md) at the repo root names the pending
Aperture refactor (Phase D — splitting the 8200-line monolith and
collapsing the five-layer wrapper chain into an explicit composition
registry). [KNOWN_FAILURES.md](../../KNOWN_FAILURES.md) tracks
pre-existing engine-regression tests; none of the currently red ones
are Aperture-specific.

## For the formal model

[`docs/TD613_APERTURE.md`](../../docs/TD613_APERTURE.md) is the
authoritative reference: the role-in-suite framing (PRCS-A as observed
regime, Aperture as counter-tool), the post-generation audit doctrine,
the maintained source surfaces (`app/engine/td613-aperture.js`), and
the relationship to the broader TCP measurement stack.

This README is the onramp; the formal model is the substance.
