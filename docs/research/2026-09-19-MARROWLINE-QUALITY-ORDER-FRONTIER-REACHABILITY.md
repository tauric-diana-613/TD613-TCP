# 𝌋 Marrowline quality-order frontier reachability repair

Date: 2026-09-19

## Evidence

Raw dual-packet source `e0eade657f7e7de7061a00b1ed3af2ccf2d15ac9` was deployed correctly in Operator Release #1170 / run `35416217812`. Exact-source receipt, byte parity, stale-rollback stability, A14, and Ash all passed. The live Marrowline canary held before output admission:

```text
3.8 -> 503
3.5 -> 408 at 22s
3.6 -> 408 at 8s
no admission result
```

Observation-only recheck #30 / run `35416542212` used the same deployed bytes and zero deployments:

```text
3.8 -> 503
3.5 -> 408 at 22s
3.6 -> 503
no admission result
```

These episodes do not test the raw-packet Zalgo hypothesis because no Gemini return reached local admission. They expose a separate contradiction: a declared five-seat frontier cascade cannot be called five-seat-reachable when seat two may reserve 22 seconds inside a 50.5-second wall.

## Repair

Provider selection returns to quality order:

```text
3.8 -> 3.7 -> 3.6 -> 3.5 -> 3 Flash Preview
```

The wall remains 50.5 seconds. Tail-reserved attempt caps become:

- seat 1: max 8s
- seat 2: max 18s with 6s reserved for every later selected seat
- seat 3: max 8s with 6s reserved for every later selected seat
- seat 4: max 6s with 6s reserved for the final selected seat
- final seat: lawful remaining wall time

When fewer models are credential-callable, unused tail reserve naturally flows into the final selected seat.

## Observability

Successful Marrowline receipts now preserve:

- credential-scoped `callableModels`
- actual `selectedModels`

HELD responses preserve `selectedModels` plus `modelPolicy`. The production canary preserves both lists and up to five attempt records.

This distinguishes:

```text
provider did not list model
!= model was listed but cooling/excluded
!= model was selected but never reached
!= model was called and transport failed
!= model returned and local admission held
```

## Unchanged

- Gemini 2.5 remains excluded.
- Lite models remain excluded.
- Raw two-packet provider output remains active.
- No local Zalgo generator is added.
- Hard Kʰonapolit/Tauric Diana orthographic admission remains unchanged.
- Provider success is not output-quality proof.
- A later production observation cannot rewrite an earlier HELD episode.

Sealed ⟐
