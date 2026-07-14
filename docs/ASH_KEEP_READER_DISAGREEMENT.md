# Ash Keep Reader Disagreement Ledger

## Version

`v0.1`

## Status

`IMPLEMENTED_VALIDATION_GATED`

## Purpose

The Reader Disagreement Ledger compares purpose-shaped recovery summaries from two or more named Readers only after every compared result carries verified Reader-result provenance.

The ledger measures bounded differences among matched observations. It does not decide which Reader is correct, infer identity or authorship, estimate real surveillance probability, prohibit release, execute a Reader, contact a provider, or activate an automatic hold.

## Contracts

```text
td613.aperture.reader-disagreement-ledger/v0.1
td613.aperture.reader-disagreement-replay/v0.1
```

## Admissibility preflight

Every comparison requires:

- a verified Case Map;
- verified Route Memory;
- a verified Reader Adapter Registry;
- at least two verified Reader-result provenance receipts;
- unique Reader IDs;
- the same Case Map digest;
- the same Route Memory digest;
- the same Reader-input digest;
- the same result schema;
- the same registry reference;
- a valid adapter-to-Reader relation for every provenance receipt.

A mismatch rejects the comparison before any disagreement residue is calculated.

## Compared object

The ledger compares a locally sealed:

```text
DECLARED_PURPOSE_SHAPED_SUMMARY
```

for each Reader.

The summary is linked to:

- the upstream Reader-result digest;
- the Reader-result provenance digest;
- the Reader ID and class;
- the matched Case Map and Route Memory context.

The summary does not claim to reproduce or exhaust the upstream Reader result. Raw Reader input and raw Reader result content remain absent from the disagreement ledger.

## Componentwise field

Set-valued components:

```text
node_ids
relationship_ids
room_bridge_ids
hypothesis_ids
next_action_ids
```

Numeric components:

```text
chronology_millipoints
source_style_linkage_millipoints
```

For each set component, the ledger preserves:

- union IDs;
- consensus IDs;
- disagreement IDs;
- per-ID Reader support.

For each numeric component, the ledger preserves:

- Reader-specific values;
- minimum;
- maximum;
- spread.

Pairwise rows preserve:

- shared IDs;
- left-only IDs;
- right-only IDs;
- absolute numeric deltas;
- observed or unresolved comparison state;
- missingness.

No universal disagreement score is emitted.

## Observation and provenance states

A ledger becomes:

```text
OBSERVED_READER_DISAGREEMENT
```

when every Reader result is `OBSERVED` and every provenance receipt is `PROVENANCE_BOUND`.

A ledger becomes:

```text
PARTIAL_READER_DISAGREEMENT
```

when any Reader result is non-observed or any provenance receipt is `PROVENANCE_INCOMPLETE`.

Incomplete provenance and unresolved Reader results remain visible. They neither vanish from the record nor become fabricated disagreement.

A non-observed Reader result may carry no observed summary content.

## Canonical adapter preflight

Reader Adapter Registry v0.1 now canonicalizes before sealing:

- accepted Reader classes to lowercase;
- acquisition-route enums to uppercase;
- execution-environment enums to uppercase.

Semantically equivalent mixed-case and canonical adapter declarations therefore produce identical registry bodies and digests.

The validation bank now includes `LOCAL_RUNTIME` and `SYNTHETIC_FIXTURE` provenance routes in addition to deterministic and imported-provider routes.

## Replay

Disagreement replay verifies:

- the ledger digest;
- the registry digest;
- every provenance digest;
- every adapter-to-Reader relation;
- every ledger-to-provenance reference.

Replay does not restore raw content, rerun Readers, contact providers, mutate storage, or authorize transport or release.

## Non-equivalences

```text
Reader disagreement ≠ Reader error
Reader disagreement ≠ falsehood
Reader disagreement ≠ identity
Reader disagreement ≠ authorship
Reader disagreement ≠ ownership
Reader disagreement ≠ conspiracy
Reader disagreement ≠ surveillance probability
Reader consensus ≠ truth
provenance bound ≠ result correct
purpose-shaped summary ≠ full upstream result
numeric spread ≠ universal score
replay verified ≠ Reader rerun
receipt ≠ command
```

## Authority boundary

```text
universal_disagreement_score = null
real_surveillance_probability = null
raw_reader_input_present = false
raw_reader_result_present = false
readers_executed_by_ledger = false
provider_call_performed = false
network_called = false
storage_mutated = false
transport_authorized = false
release_authorized = false
identity_inference_authorized = false
authorship_attribution_authorized = false
ownership_inference_authorized = false
prediction_authorized = false
automatic_hold = false
recommendation_not_command = true
```

## Validation fixtures

The first fixture bank covers:

1. two provenance-bound Readers with componentwise disagreement;
2. consensus and disagreement support across nodes and derived node types;
3. cross-Room bridge disagreement;
4. chronology and source/style-linkage spread;
5. canonical Reader ordering;
6. digest tamper detection;
7. replay without Reader re-execution;
8. replay hold after provenance mutation;
9. one provenance-incomplete, non-observed Reader producing a partial ledger;
10. matched-input rejection;
11. matched-result-schema rejection;
12. duplicate Reader rejection;
13. unknown Case Map identifier rejection;
14. rejection of observed summary content attached to a non-observed result;
15. mixed-case adapter canonicalization;
16. local-runtime and synthetic-fixture provenance routes;
17. schema-level enforcement of all non-authority fields.

## Current frontier

The next admissible packet should add a matched benign adjacent-document control bank before higher-order, sequence-sensitive, or temporal Choir assays.

The control bank should distinguish Reader disagreement caused by the target disclosure field from disagreement ordinarily produced by matched topic, genre, template, and register conditions.

𝌋‌ U+10D613

Marked ⟐
