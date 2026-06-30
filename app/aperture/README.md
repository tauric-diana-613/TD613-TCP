# TD613 Aperture

## Promotion Lane

Use the Aperture sync lane when moving standalone HTML candidates between
Downloads and the repo. Staging is deliberately non-destructive; promotion is
the only step that updates the public repo body.

```powershell
npm run aperture:compare -- "C:\Users\timst\Downloads\Aperture_v2_9_3.html"
npm run aperture:stage -- "C:\Users\timst\Downloads\Aperture_v2_9_3.html"
npm run aperture:promote-staged
npm run aperture:check-sync
npm run aperture:export-downloads
```

`aperture:stage` writes only to `.aperture-staging/`, which is gitignored.
`aperture:promote-staged` updates `app/aperture/tool.html`, the iframe cache
token in `app/aperture/index.html`, `app/asset-versions.js`, and Aperture
engine version constants. `aperture:export-downloads` writes the repo-approved
tool body back to `Aperture.html` and a versioned `Aperture_vX_Y_Z.html` copy
in Downloads.

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

The canonical browser body is now [`tool.html`](tool.html) at
`v2.9.4` / `td613-aperture/v2.9.4`; [`index.html`](index.html) is the
stable public iframe shim. v2.9.4 carries the doctrine kernel, geometric addendum, ZFP certification layer,
the corrected rupture predicate, Moire Stratigraphy diagnostics, Phason and
Sigma dynamical surfaces, and the Gateway/Dome-World one-way bridge compiler.
The bridge exports modeled route weather only when explicitly invoked; it
does not execute Aperture or transmit automatically.

[ROADMAP.md](../../ROADMAP.md) at the repo root still names the pending
Aperture refactor: splitting the monolithic standalone body and
collapsing wrapper-era compatibility into explicit composition. That is
a maintainability cleanup, not a separate live Aperture version.

## For the formal model

[`docs/TD613_APERTURE.md`](../../docs/TD613_APERTURE.md) is the
authoritative reference: the role-in-suite framing (PRCS-A as observed
regime, Aperture as counter-tool), the post-generation audit doctrine,
the maintained source surfaces (`app/aperture/tool.html` and
`app/engine/td613-aperture.js`), and the relationship to the broader
TCP measurement stack.

This README is the onramp; the formal model is the substance.
