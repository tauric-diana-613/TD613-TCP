# Ash Keep Matched Benign Adjacent-Document Controls

## Version

`v0.1`

## Status

`IMPLEMENTED_VALIDATION_GATED`

Repository state: `IMPLEMENTATION_BRANCH / MERGE_PENDING`

## Purpose

The Matched Benign Control Bank calibrates componentwise Reader disagreement against ordinary variation among declared benign adjacent documents before Choir widens into higher-order, ordered-sequence, temporal, or Hush intervention experiments.

The instrument asks where a target's componentwise disagreement sits relative to controls matched on declared surface and source conditions. It does not decide truth, identity, authorship, ownership, release, or transport.

## Contracts

```text
td613.aperture.matched-benign-control-bank/v0.1
td613.aperture.matched-benign-control-bank-replay/v0.1
```

## Admissibility spine

Every target and control fixture must arrive through:

```text
verified Moiré assay receipts
  → verified Reader-result provenance receipts
  → verified Reader Disagreement Ledger
```

The bank verifies receipt digests, exact receipt references, Reader-set equality, fixture-local Case Map and Route Memory alignment, registry alignment, result-schema alignment, and a shared input-contract digest.

The bank performs no Reader execution and no provider call.

## Fixture boundary

Each fixture carries only references and declared matching metadata:

- fixture ID and class;
- document digest;
- source-provenance digest;
- source status;
- input-contract digest;
- match profile;
- Reader IDs;
- registry and result-schema references;
- Case Map, Route Memory, and Reader-input digests;
- Moiré, provenance, and disagreement receipt digests;
- residual confounds and operator notes.

Raw document bodies, raw Reader inputs, and raw Reader results are rejected.

## Matching dimensions

Controls are matched on:

```text
topic
genre
template
register
approximate_length_band
source_conditions
```

Eligibility also requires the same input contract, Reader set, registry reference, and result schema; provenance-bound Reader results; observed disagreement results; and fully observed Moiré evidence.

## Exclusion discipline

A valid but mismatched control remains sealed with:

- `control_eligible = false`;
- exact matching failures;
- residual confounds;
- receipt references intact.

Only eligible controls enter the distribution.

## Bank states

- `CALIBRATED_MATCHED_CONTROL_BANK`: at least three eligible controls and no exclusions.
- `PARTIAL_MATCHED_CONTROL_BANK`: at least three eligible controls plus documented exclusions.
- `CONTROL_BANK_HELD`: fewer than three eligible controls.

## Componentwise comparison

Set-valued dimensions:

- nodes;
- relationships;
- cross-Room bridges;
- hypotheses;
- intended actions.

Numeric dimensions:

- chronology spread;
- source/style-linkage spread.

Each dimension preserves target value, per-control values, eligible-control count, minimum, maximum, median, target position, controls below target, and controls at or above target.

The bank also compares the count of observed Reader pairs carrying disagreement.

## No universal score

```text
universal_control_score = null
real_surveillance_probability = null
```

The bank emits no universal anomaly, privacy, suspicion, truth, identity, authorship, ownership, release, or transport score.

## Replay

Replay verifies the sealed bank, complete receipt set, fixture receipt-bundle digests, and exact receipt references.

Replay does not recompute the distribution, restore raw content, reexecute Readers, call providers, call the network, mutate storage, authorize release, or authorize transport.

## Validation bank

The first fixture bank covers:

1. one target and three matched controls;
2. target values above selected control ranges;
3. canonical control ordering;
4. calibrated, partial, and held states;
5. register mismatch retained as excluded evidence;
6. input-contract mismatch retained as excluded evidence;
7. residual-confound aggregation;
8. raw-content rejection;
9. minimum-control enforcement;
10. digest tampering;
11. replay without Reader reexecution;
12. replay hold after receipt mutation;
13. schema-level non-authority enforcement.

## Non-equivalences

```text
matched control ≠ identical document
control distribution ≠ population distribution
above control range ≠ proof of cause
below control range ≠ proof of absence
Reader agreement ≠ truth
Reader disagreement ≠ error
provenance bound ≠ result correct
calibration eligible ≠ production demonstrated
calibration eligible ≠ release authority
receipt ≠ command
```

## Authority boundary

Every bank and replay receipt preserves:

```text
raw_document_present = false
raw_reader_input_present = false
raw_reader_result_present = false
readers_executed_by_bank = false
provider_call_performed = false
network_called = false
storage_mutated = false
transport_authorized = false
release_authorized = false
identity_inference_authorized = false
authorship_attribution_authorized = false
ownership_inference_authorized = false
truth_adjudication_authorized = false
prediction_authorized = false
automatic_hold = false
recommendation_not_command = true
```

## Current frontier

After merge and post-merge Ash aftercare, the next bounded step is to replace free calibration booleans with explicit control-bank receipt references.

Higher-order interference, ordered route sequences, and temporal disclosure remain separate later contracts.

No public UI, provider execution, transport, Cinder, release mutation, or production promotion is added here.

𝌋‌ U+10D613

Marked ⟐
