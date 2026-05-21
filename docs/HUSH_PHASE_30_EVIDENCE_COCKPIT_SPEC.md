# Hush Phase 30 Evidence Cockpit Spec

## Purpose

Phase 30 promotes Hush from product spine to evidence cockpit. The cockpit binds signal bus state, narrowing losses, export receipt v2, mask registry audit, self-test, readiness dashboard, and operator actions into one route-aware surface.

## Product route

The cockpit renders on `app/hush.html` through `app/hush.js` and `app/hush-product-spine.css`. The legacy chamber at `app/adversarial-bench.html` remains available.

## Core modules

- `app/engine/hush-signal-bus.js`
- `app/engine/hush-narrowing-losses.js`
- `app/engine/hush-evidence-cockpit.js`
- `app/engine/hush-self-test-harness.js`
- `app/engine/hush-mask-registry-audit.js`
- `app/engine/hush-export-receipt-v2.js`
- `app/engine/hush-docs-memory-check.js`

## Route states

- `receipt-ready`: local evidence receipt is complete.
- `warning`: reviewable loss is present.
- `hold`: hard failure or incomplete cockpit dependency is present.

## Non-claims

The cockpit does not prove anonymity, untraceability, detector-proofing, platform safety, publication safety, or legal sufficiency. Human review remains required.
