# Ash Keep A15 Postclosure · Recovered Play Motion-Owner Repair v0.1

## Status

`AUTHORED / OBSERVER-GROUNDED / PRE-DEPLOYMENT / HUMAN-CLOSURE-REQUIRED`

## Exact failure witness

- PR: `#601`
- failed exact head: `4e0952eaff5fb1ace6e227a66e01c3433716875`
- workflow run: `30280622443`
- artifact digest: `sha256:e16b61fec640b21eb94a87b1b2802765a289a1e1e68418a87af35b7ebbbbf745`
- Chromium complete Ash witness: `PASS`
- Firefox complete Ash witness through A15: `PASS`
- Chromium standalone Flow-Core runtime: `PASS`
- Firefox standalone Flow-Core runtime: `HOLD`

Firefox observed one visible canonical Flow-Core field and one visible recovered `▶ Play Consequence Field` control. The click completed, but the probe observed no `td613:ash:flowcore-field-phase` trace and timed out waiting for the atomic `NAME` frame.

## Root cause

The recovered Play control delegated directly to Live AIA’s tutorial replay. Flow-Core motion remained coupled indirectly through a separate document-level click listener plus `requestAnimationFrame`. Chromium preserved that timing relation; Firefox exposed that the two established clocks were not bound by one explicit owner path.

This was not evidence of:

- missing canonical field;
- missing visible Play control;
- A12 entry failure;
- lifecycle failure;
- mass-eviction execution;
- custody, transport, or release-authority change.

## Repair

`ash-flowcore-workspace-remount.js` now owns the post-remount binding for controls marked:

```text
data-aia-play-recovery="LIVE_AIA_REPLAY_DELEGATE"
```

The existing recovered control continues to invoke Live AIA’s established `replay()` owner. The remount owner additionally invokes the already-established `__td613AshUiUxRescue.play()` motion owner from the same visible gesture.

No new timer, animation loop, field constructor, Ash action, custody mutation, transport, telemetry, or release authority was added.

The repair emits:

```text
td613:ash:flowcore-recovered-play-motion
```

and preserves a bounded receipt distinguishing:

- control owner;
- tutorial owner;
- motion owner;
- motion API availability;
- whether finite motion began;
- visible canonical-field count;
- unchanged authority and custody boundaries.

## Superseded parallel candidate

PR `#602` failed on the older A2–A6 `OPENING / STRUCTURAL` convergence deadlock and was closed without merge. Its artifact remains preserved, but it is not an admissible A15 release candidate.

## Claim ceiling

This repair supports only the claim that one recovered visible Play gesture explicitly reaches the two existing presentation owners.

It does not establish:

- truth, identity, authorship, intent, or learner comprehension;
- successful Ash action;
- content movement;
- provider behavior;
- custody, transport, release, deployment, or closure.

## Remaining gate

One exact-head Chromium / Firefox / WebKit seal must confirm:

1. early A8 + A12 risk preflight;
2. lifecycle closure preflight;
3. complete Ash journey;
4. standalone Flow-Core finite phase sequence including atomic `NAME` and `REST`;
5. constitutional convergence and Phase IV evidence.

No production deployment is authorized by this receipt.

Sealed for exact-head revalidation ⟐
