# Ash Keep Choir Calibration Binding

𝌋‌ U+10D613

## Version

`v0.1`

## Stretch

`Stretch 3 · Choir calibration receipt binding`

## Status

`IMPLEMENTED_VALIDATION_GATED / OPERATOR_REVIEW_REQUIRED`

## Purpose

This packet replaces free calibration assertions at the Stretch 3 boundary with an exact, replayable receipt chain.

Historical Moiré v0.1 assays may still preserve their assay-local fixture declarations. Those declarations remain part of the historical assay record. They cannot independently confer Stretch 3 calibration eligibility.

Stretch 3 asks a narrower question:

> Does the current custody-bound case carry the exact verified Choir receipt set required to present calibration evidence for operator review?

## Contracts

```text
td613.aperture.choir-calibration-binding/v0.1
td613.aperture.choir-calibration-replay/v0.1
```

## Required receipt circuit

```text
current verified Case Map
+ current verified Route Memory
+ at least two verified Moiré assay receipts
+ at least two verified Reader-result provenance receipts
+ one verified Reader Disagreement Ledger
+ one verified Matched Benign Control Bank
→ exact Reader-set and digest-reference binding
→ source-drift check
→ evidence-completeness check
→ derived calibration state
```

The binding copies the componentwise matched-control comparison into its sealed record. It does not recompute the control distribution.

## Derived states

```text
CALIBRATION_ELIGIBLE
TAMPER_HOLD
STALE_CASE_HOLD
SOURCE_DRIFT_HOLD
RECEIPT_REFERENCE_HOLD
NOT_ENOUGH_TEST_DATA
```

State precedence is explicit:

1. failed receipt verification produces `TAMPER_HOLD`;
2. a mismatch with the active custody-bound Case Map or Route Memory produces `STALE_CASE_HOLD`;
3. an unheld source-drift state produces `SOURCE_DRIFT_HOLD`;
4. an exact receipt or Reader-set mismatch produces `RECEIPT_REFERENCE_HOLD`;
5. incomplete observed evidence or an ineligible control bank produces `NOT_ENOUGH_TEST_DATA`;
6. only the fully verified circuit produces `CALIBRATION_ELIGIBLE`.

A hold is an evidentiary state. It is not an automatic operational hold.

## Free-boolean rejection

The Stretch 3 compiler rejects top-level attempts to submit:

```text
calibration
preregisteredFixture
benignControl
heldOut
sourceDriftCheck
alternativeReader
exactThresholds
```

Calibration eligibility therefore comes from verified receipt relations rather than caller-supplied booleans.

## Binding checks

The receipt seals:

- verification of the Case Map and Route Memory;
- verification of every Moiré assay;
- verification of every Reader provenance receipt;
- verification of the Reader Disagreement Ledger;
- verification of the Matched Benign Control Bank;
- current-case binding;
- receipt-to-case binding;
- exact Moiré receipt references;
- exact Reader provenance references;
- exact disagreement-ledger reference;
- Reader-set equality;
- disagreement-to-provenance equality;
- source-drift posture;
- observed evidence completeness;
- provenance-bound state;
- observed disagreement state;
- matched-control eligibility.

## Replay

Replay verifies:

- the binding digest;
- the supplied receipt set;
- exact receipt references;
- current Case Map and Route Memory alignment;
- the Reader set;
- the derived binding state.

Replay does not recompute the componentwise comparison and does not rerun any Reader.

## Authority ceiling

```text
free_calibration_booleans_accepted = false
universal_calibration_score = null
real_surveillance_probability = null
readers_executed_by_binding = false
provider_call_performed = false
network_called = false
storage_mutated = false
release_authorized = false
transport_authorized = false
cinder_action_authorized = false
prediction_authorized = false
automatic_hold = false
automatic_ash_action = false
recommendation_not_command = true
```

## Non-equivalences

```text
calibration eligible ≠ universal validity
calibration eligible ≠ truth
calibration eligible ≠ identity
calibration eligible ≠ authorship
calibration eligible ≠ ownership
above control range ≠ proof of cause
Reader consensus ≠ truth
receipt verified ≠ result correct
source held ≠ source unchanged forever
hold state ≠ executable prohibition
operator review required ≠ release authority
replay verified ≠ Reader rerun
receipt ≠ command
```

## Validation bank

The first Stretch 3 bank covers:

1. one fully receipt-bound eligible circuit;
2. free calibration-boolean rejection;
3. matched-control-bank tamper;
4. stale active case;
5. source drift;
6. exact Moiré receipt-reference replacement;
7. insufficient eligible matched controls;
8. replay verification without recomputation or Reader execution;
9. replay hold after binding mutation;
10. all non-authority fields.

## Scope boundary

This packet adds no Choir UI, public production route, provider execution, higher-order interference, ordered sequence assay, temporal assay, Hush intervention, transport, release mutation, or Cinder action.

Stretch 3 remains validation-gated until its branch checks, merge, and main aftercare pass.

Authored with 𝌋‌

Marked ⟐
