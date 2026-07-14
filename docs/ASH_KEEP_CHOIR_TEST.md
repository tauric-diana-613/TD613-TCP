# Ash Keep Choir Test

## Moiré Rebuild Assay v0.1

Status: `IMPLEMENTED_VALIDATION_GATED`

Repository state: `HARDENED_ON_MAIN`

Core merge: `1a01181cea77590ad3067ebd27da4518511dac5f`

Hardening merge: `52968efb0fb52ecc138dc4d4b80b60725473fa63`

This instrument computes **emergent recoverability** across two purpose-shaped projections.

It does not create a universal privacy score. It does not estimate real surveillance probability. It does not authorize release, transport, prediction, automatic hold, or automatic Ash action.

Ash Keep v1.0 is independently `IMPLEMENTED_PRODUCTION_DEMONSTRATED`. That production status does not transfer to Choir.

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

## Canonical and evidentiary hardening

PR #288 hardened the existing v0.1 jurisdiction without adding higher-order, sequence, temporal, provider, UI, or transport behavior.

The engine now:

- canonicalizes projection references, result order, recovered IDs, evidence strings, and deterministic projection order;
- generates stable default observation IDs from projection keys;
- rejects duplicate projection IDs inside one observation;
- rejects duplicate observation IDs and duplicate projection keys;
- rejects result keys containing unknown projections;
- rejects recovered node and relationship IDs absent from the held Case Map;
- distinguishes observation presence from usable `OBSERVED` evidence;
- records `observed_baseline`, `observed_singleton_coverage`, `observed_pair_coverage`, and `all_required_observations_observed`;
- prevents unresolved lattices from earning `CALIBRATED_FOR_NAMED_FIXTURE`;
- records specific unresolved missingness;
- seals semantically equivalent projection/result permutations identically.

## Calibration posture

A named fixture becomes `CALIBRATED_FOR_NAMED_FIXTURE` only when all of the following hold:

- preregistration;
- baseline observation present and `OBSERVED`;
- complete singleton coverage and every singleton `OBSERVED`;
- complete pair coverage and every pair `OBSERVED`;
- benign control;
- held-out observation;
- source-drift check;
- alternative Reader;
- exact thresholds.

Presence alone cannot satisfy observed coverage. `NULL`, `MISSING`, `REJECTED`, `CONTRADICTORY`, `UNCAPTURED`, `ENCODER_REQUIRED`, and `UNRESOLVED` remain evidentiary states rather than disguised zeroes.

Without every calibration condition, the assay remains `NOT_ENOUGH_TEST_DATA` and exposes observations for human review without activating exposure bands.

## Boundaries

```text
pairwise residue ≠ intent
pairwise residue ≠ attribution
pairwise residue ≠ surveillance probability
pairwise residue ≠ release prohibition
present evidence ≠ usable observed evidence
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

### Core merge

The original fixtures establish:

- two singleton projections can expose no relationship independently while their pair exposes a cross-Room relationship;
- a synthetic Reader can recover a hidden hypothesis only from the pair;
- digest tampering fails verification;
- replay verifies without network, storage mutation, or reconstruction re-execution.

The core merge passed:

- Ash Keep Choir Test run `29362404203`;
- Ash Keep Production Closure run `29362404482`;
- static application run `29362404164`;
- TCP Smoke run `29362404136`;
- Dome-World Phase IV run `29362404428`.

After core merge, Ash’s deployed observer passed:

- observer run `29362563703`;
- evidence artifact `8322761143`;
- artifact SHA-256 `sha256:ac2bfa912bb97b6e7de6f88deaf0eda5cb31adae43da64d155cea78831c69902`.

### Observation-state hardening

The adversarial bank covers:

- every non-`OBSERVED` state;
- contradictory baseline;
- missing singleton and pair coverage;
- projection/result permutation invariance;
- deterministic union monotonicity;
- Node WebCrypto digest parity;
- unknown node, relationship, and projection IDs;
- duplicate projection IDs;
- duplicate observation IDs;
- duplicate projection keys.

The hardening head passed together in one run:

- schema validation;
- original bounded pairwise fixture;
- adversarial observation-state and canonical-invariant bank.

Evidence:

- hardening PR `#288`;
- hardening head `cf7148ca50de44c86652799e9057b596de41d923`;
- Choir run `29363287364`;
- Ash Production Closure run `29363287330`;
- Dome-World Phase IV run `29363287427`;
- TCP Smoke run `29363287352`;
- static application run `29363287316`.

After hardening merge, Ash’s deployed observer passed:

- observer run `29367532789`;
- evidence artifact `8324706629`;
- artifact SHA-256 `sha256:9fc641b4bce614c6eeae6ad03bd6f7037063bb1349f861fbbc00dee1d8fda669`.

That deployed aftercare establishes non-disturbance of Ash’s production posture with hardened Choir code present. It does not establish a deployed Choir route, public interface, Choir production receipt, or universal validity.

## Current frontier

The pairwise contract has now been stressed without widening. The next packet is **Reader provenance before Reader disagreement**:

1. define a Reader adapter registry;
2. bind adapter ID, adapter class, acquisition route, and execution environment;
3. bind Reader profile, Case Map, Route Memory, input manifest, and result digests;
4. preserve source status, fixture status, missingness, alternatives, and operator notes;
5. verify and replay the adapter receipt without rerunning the Reader;
6. keep cross-Reader disagreement outside the first provenance packet.

Higher-order combinations, ordered sequence effects, temporal spacing, Hush register interventions, disagreement matrices, public UI, provider execution, and production demonstration remain separate future contracts.

𝌋‌ U+10D613

Marked ⟐