# TD613 Aperture

Read [SYSTEM_OVERVIEW.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SYSTEM_OVERVIEW.md) for the stack-level picture and [ENGINE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/ENGINE.md) for the live integration details. This file is the dedicated reference for Aperture itself.

## Role in the suite

`TD613 Aperture` is the suite's counter-tool for governed exposure events.

The live repo stance is:

- `PRCS-A` is the observed regime
- `TD613 Aperture` is the counter-tool
- `v2.7.0` / `td613-aperture/v2.7.0` is the current canonical instrument identity
- the instrument is anti-enforcement and warning-first

So Aperture should:

- audit
- annotate
- register
- expose warning pressure

It should not:

- quietly sort admissibility like the regime it critiques
- flatten a strong candidate back toward source because a shallower one looks safer
- silently convert a generator miss into a false success

## Current doctrine

The current repo treats Aperture as post-generation audit and registration.

That means the sequence is:

1. Generator V2 authors candidates
2. candidate selection lands or holds explicitly
3. Aperture audits hard anchors, semantics, pathology, and warning pressure
4. the registered surface is exposed to TCP / downstream tools

If the write lane misses, the correct answer is a visible hold docket. Aperture is not supposed to conceal that miss.

The v2.7.0 browser instrument adds the current ZFP certification and Moire Stratigraphy layer without changing that doctrine. Rupture is gated by action plus incomplete closure (`acted && closureScore < 1`); route posture, beacon, zone, and visualization remain visible state, but `Pi` is not a rupture gate.

## What Aperture currently tracks

The maintained repo now uses Aperture to surface:

- witness-anchor pressure
- alias persistence
- compression pressure
- counter-recognition pressure
- candidate suppression
- observability deficit
- naming sensitivity
- redundancy inflation
- capacity pressure
- policy pressure
- temporal posture and closure class
- historical crease and unfolding energy
- beacon qualification and pilot-domain context

These show up in runtime as `apertureAudit` and in packetized surfaces as `aperture_audit`.

## Current UI posture

The current Homebase / mask bench no longer lets Aperture flood the primary surface.

The main surface should answer:

- did the mask land?
- is it usable?
- is it distinct?
- what is still wrong?

The full warning and registration trace remains available in the secondary `Aperture ledger` drawer.

That split matters because a tool can be honest and still unusable if the doctrine overwhelms the result surface.

## Current repo surfaces

The main maintained Aperture surfaces are:

- [app/engine/td613-aperture.js](/C:/Users/timst/OneDrive/Desktop/tcp-repository/app/engine/td613-aperture.js)
- [app/aperture/tool.html](/C:/Users/timst/OneDrive/Desktop/tcp-repository/app/aperture/tool.html)
- [app/aperture/index.html](/C:/Users/timst/OneDrive/Desktop/tcp-repository/app/aperture/index.html)
- [tests/td613-aperture.test.mjs](/C:/Users/timst/OneDrive/Desktop/tcp-repository/tests/td613-aperture.test.mjs)
- [reports/diagnostics/aperture.latest.json](/C:/Users/timst/OneDrive/Desktop/tcp-repository/reports/diagnostics/aperture.latest.json)
- [reports/diagnostics/aperture.latest.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/reports/diagnostics/aperture.latest.md)

`app/aperture/tool.html` is the canonical instrument body. `app/aperture/index.html` remains the stable public iframe shim and points at the current body with a cache token.

## What to verify

If you are checking Aperture in the current repo, verify these:

- it preserves the `PRCS-A` regime callout
- it preserves the `counter-tool` role
- it reports `v2.7.0` and `td613-aperture/v2.7.0` on live, packet, engine, bridge, and diagnostics surfaces
- it does not enforce selective admissibility over normal landed TCP outputs
- it exposes warning signals without silently rerouting to source
- ZFP certification, corrected rupture logic, Moire Stratigraphy, and Gateway embed handoff remain present in the canonical body
- annex diagnostics inspect `app/aperture/tool.html`, not the iframe shim

## Design law

Aperture remedies selective admissibility drift by making narrowing visible, not by reenacting it.
