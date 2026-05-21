# Hush Epistemicide Audit

## Purpose

This audit tracks documentation, UI, report, and export gaps that can make current Hush capabilities hard to find, test, explain, or extend.

In this repo, epistemicide means a project surface that makes working knowledge disappear from the operator or maintainer view.

## Phase 29.1 finding

The largest gap was public-memory drift. The README, phase map, and docs index still framed Hush around early phases while the engine and tests had advanced through Phase 29.

Phase 29.1 repairs that gap by updating the public route, phase posture, document map, and late-phase status surfaces.

## Active risks

### Documentation lag

Risk: code and tests advance faster than README, phase map, and operator docs.

Phase 30 action: add a docs-surface check for each new report phase.

### Report-to-UI drift

Risk: CI reports carry readiness truth that the product route cannot display.

Phase 30 action: add report import or report fixtures to the `/hush` dashboard.

### Mask registry drift

Risk: masks can exist in data files or tests without appearing in the app selection surface.

Phase 30 action: add a registry audit comparing all `hush-phase*-masks.js` exports with the mask studio list.

### Export receipt lag

Risk: export receipts can omit register contracts, custody gates, target-register audit summaries, product state, or dashboard summaries.

Phase 30 action: update export policy receipts so new custody layers are visible without including raw private text by default.

### Corpus blind spots

Risk: small fixture sets can make readiness look stronger than it is.

Phase 30 action: add a red-team corpus bench for messy notes, chat-like samples, code-switching, multilingual fragments, compressed notes, and legal-adjacent drafts.

### Product-shell split

Risk: `/hush.html` explains readiness while `/adversarial-bench.html` still controls most transform workflow state.

Phase 30 action: unify product state across route, dashboard, transform chamber, Mask Memory, release policy, export policy, and readiness ledger.

### Claim ceiling drift

Risk: a polished product shell can imply more certainty than the local engine supports.

Phase 30 action: keep no-anonymity, no-platform-guarantee, no-publication-safety limits visible at action points.

## Phase 30 candidate leap

The strongest Phase 30 candidate is a unified evidence cockpit:

- shared state across product route and legacy chamber
- live report ingestion
- per-transform readiness ledger rows
- export receipts with register and target-register summaries
- mask registry audit
- larger red-team corpus bench
- docs-surface check for public-memory drift

## Integration rule

A Hush capability should count as fully integrated only when it appears in:

1. engine code
2. tests
3. report surface
4. product route or dashboard
5. operator documentation

Anything less may still work, but it remains easy to lose from the usable system.
