# Phase 18 Status — Hush Source Residue / Cadence Body Detachment

Phase 18 responds to the app-flight audit finding that Hush now emits, but many outputs retain too much non-literal source body.

Phase 17 separated hard release gates from review warnings. That fixed the zero-output admissibility failure. Phase 18 adds a source-residue scorer so candidate ranking can prefer outputs that preserve truth without dragging the original sentence anatomy behind them.

## What changed

New module:

- `app/engine/hush-source-residue.js`

Updated modules:

- `app/engine/hush-swap.js`
- `app/engine/hush-release-policy.js`

New tests:

- `tests/hush-source-residue.test.mjs`

Updated tests:

- `tests/hush-release-policy.test.mjs`
- `tests/hush-swap.test.mjs`

## Metrics

Source residue measures:

- non-literal token retention;
- source coverage;
- longest copied non-literal run;
- source order retention;
- sentence skeleton similarity;
- function-word frame overlap;
- opening phrase retention;
- closing phrase retention;
- bigram overlap;
- cadence body risk.

Protected literals are excluded from the token-retention calculation so evidence markers do not falsely inflate source-body risk.

## Ranking

Hush now includes `sourceResidueScore` in candidate scoring. Naturalness and semantic fidelity still matter, but candidates that preserve too much non-literal source anatomy lose ranking power.

The score blend now includes:

```text
steering score
naturalness
source residue score
```

## Release policy

Source-body attachment normally creates review warnings:

- `source-body-attached`
- `source-body-severe`
- `source-opening-retained`
- `source-closing-retained`

Severe source-body retention plus weak mask movement can hard-block a candidate:

- `source-body-severe-with-weak-mask-movement`

This prevents Hush from selecting a clean, natural, semantically faithful output that still keeps the original cadence body too intact.

## Boundary

Source residue is a local review signal. It does not prove anonymity, untraceability, platform outcome, or identity status.

The Phase 18 rule:

```text
Keep the truth. Keep the protected literals. Detach the source body.
```

Sealed ⟐
