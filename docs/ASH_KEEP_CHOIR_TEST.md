# Ash Keep Choir Test

## Moiré Rebuild Assay v0.1

Status: `IMPLEMENTED_VALIDATION_GATED`

Repository state: `MERGED_ON_MAIN`

Merge commit: `1a01181cea77590ad3067ebd27da4518511dac5f`

This slice adds the first bounded computation for **emergent recoverability** across two purpose-shaped projections.

It does not create a universal privacy score. It does not estimate real surveillance probability. It does not authorize release, transport, prediction, automatic hold, or automatic Ash action.

Ash Keep v1.0 is independently `IMPLEMENTED_PRODUCTION_DEMONSTRATED`. That production status does not transfer to this Choir slice.

## Question

For a held Case Map, Route Memory, named Reader, and two declared projections:

> What becomes recoverable from the pair that was not recoverable from the baseline or either projection alone?

For Reader `R`, Route Memory `H`, and projections `P_i` and `P_j`:

```text
M_ij^R = Recover_R(H + P_i + P_j)
         minus Recover_R(H)
         minus Recover_R(H + P_i)
         minus Recover_R(H + P_j)
```

The implementation preserves the result componentwise:

- newly recovered nodes;
- newly recovered relationships;
- newly recovered cross-Room bridges;
- newly recovered hypotheses;
- newly recovered intended actions;
- chronology millipoints visible only in the pair;
- source/style-linkage millipoints visible only in the pair.

## Runtime

`app/engine/ash-keep-moire.js` exports:

- `compileMoireRebuildAssay` for imported, synthetic, local, or future Reader observations;
- `runDeterministicMoireAssay` for the current Ash Keep deterministic reference Reader;
- `verifyMoireRebuildAssay` for digest verification;
- `replayMoireRebuildAssay` and `verifyMoireRebuildReplay` for pure local replay.

The deterministic helper enumerates:

1. one Route Memory baseline;
2. every singleton projection;
3. every unordered pair of projections;
4. pairwise residue against the baseline and both singleton results.

Projection order is canonicalized before sealing.

## Calibration posture

A named fixture becomes `CALIBRATED_FOR_NAMED_FIXTURE` only when all of the following are present:

- preregistration;
- baseline observation;
- complete singleton coverage;
- complete pair coverage;
- benign control;
- held-out observation;
- source-drift check;
- alternative Reader;
- exact thresholds.

Without those conditions, the assay remains `NOT_ENOUGH_TEST_DATA` and exposes observations for human review without activating exposure bands.

## Boundaries

```text
pairwise residue ≠ intent
pairwise residue ≠ attribution
pairwise residue ≠ surveillance probability
pairwise residue ≠ release prohibition
calibration ≠ universal validity
replay ≠ reconstruction rerun
receipt ≠ command
Ash production status ≠ Choir production status
```

The assay carries:

```text
real_surveillance_probability = null
automatic_hold = false
automatic_ash_action = false
prediction_authorized = false
recommendation_not_command = true
```

## Schemas

- `td613.aperture.moire-rebuild-assay/v0.1`
- `td613.aperture.moire-rebuild-replay/v0.1`

## Validation evidence

The focused validation fixture demonstrates the minimal Moiré condition already latent in Ash Keep:

- projection A reveals one endpoint;
- projection B reveals the other endpoint;
- neither singleton reveals the relationship;
- the pair makes the relationship and its cross-Room bridge recoverable.

A second synthetic fixture demonstrates a Reader recovering a hidden hypothesis only from the pair.

The refreshed merge passed:

- Ash Keep Choir Test run `29362404203`;
- Ash Keep Production Closure run `29362404482`;
- static application run `29362404164`;
- TCP Smoke run `29362404136`;
- Dome-World Phase IV run `29362404428`.

After merge, Ash Keep’s deployed observer passed on the exact merge commit:

- observer run `29362563703`;
- evidence artifact `8322761143`;
- artifact SHA-256 `sha256:ac2bfa912bb97b6e7de6f88deaf0eda5cb31adae43da64d155cea78831c69902`.

That deployed aftercare establishes non-disturbance of Ash’s production posture with Choir present. It does not establish a deployed Choir route, public interface, Choir production receipt, or universal validity for the assay.

## Current frontier

Choir v0.1 remains engine-first. The next packet must stress the pairwise contract before adding scope:

1. `NULL`, `MISSING`, `CONTRADICTORY`, `REJECTED`, and `UNRESOLVED` observation fixtures;
2. projection-permutation property tests;
3. incomplete singleton and pair coverage;
4. residue monotonicity and canonicalization invariants;
5. cross-runtime replay and digest parity.

Higher-order combinations, ordered sequence effects, temporal spacing, register interventions, Reader disagreement, public UI, and production demonstration remain separate future contracts.

𝌋‌ U+10D613

Marked ⟐
