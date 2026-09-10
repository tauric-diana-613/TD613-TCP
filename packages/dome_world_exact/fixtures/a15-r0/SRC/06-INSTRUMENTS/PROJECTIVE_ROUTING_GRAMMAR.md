# Projective Routing Grammar Assay

Status: **IMPLEMENTED / POST-SEAL / NOT YET PROMOTED**

Bound epoch:

```text
atelier_snapshot_id = src-20260824-p2-001
seal_id = src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a
```

This instrument implements the preregistered `PROJECTIVE_ROUTING_GRAMMAR` trail without modifying the sealed Phase-2 kiln. It is independent of the live A15-R0 westward research chain.

## Runner

```text
99-ADMIN/run-projective-routing-grammar-assay.py
```

The runner uses Python standard library only and performs no network calls.

Default execution is read-only:

```bash
python 99-ADMIN/run-projective-routing-grammar-assay.py --self-test
```

This runs deterministic synthetic parser checks, scans the captured Zenodo full-text derivatives, and prints a bounded summary to stdout. It does not write receipts.

Writing post-seal working receipts requires an explicit gesture:

```bash
python 99-ADMIN/run-projective-routing-grammar-assay.py --self-test --write
```

Default output when `--write` is supplied:

```text
04-RECEIPTS/assays/2026-08-24-projective-routing-grammar-working/
  explore-token-observations.jsonl
  signature-observations.jsonl
  field-marker-observations.jsonl
  summary.json
```

The runner refuses to write inside:

```text
04-RECEIPTS/assays/2026-08-24-phase2-kiln/
```

## Implemented subtrails

### A. `Explore:` routing census

Every captured `Explore X.` token is recorded separately. The machine pass compares each token against time-indexed Zenodo titles and may emit only candidate classes:

```text
LATER_EXACT_RESOLUTION_CANDIDATE
PREEXISTING_DESTINATION_CANDIDATE
LATER_LEXICAL_CANDIDATE_HUMAN_REVIEW_REQUIRED
PREEXISTING_LEXICAL_CANDIDATE_HUMAN_REVIEW_REQUIRED
UNRESOLVED_MACHINE
```

The instrument intentionally does **not** auto-emit `LATER_SEMANTIC_RESOLUTION` or `PROMISSORY_OBJECT_CONFIRMED`.

A later title match can therefore become a review target without becoming a source-declared promise.

### B. signature recurrence census

The runner extracts an opening `SR - ...` / `Author: SR - ...` signature where the preserved body supports one and groups exact normalized recurrences.

Automatic classes are limited to:

```text
SINGLETON_SIGNATURE
RECURRING_EXACT_SIGNATURE
```

No coordinate axis is inferred automatically. Structural-role coding must occur blind to the signature phrase before a coordinate claim may be tested.

### C. literal machine-field marker census

The runner searches preserved bodies for a frozen set of literal phrases relevant to the preregistered trail, including machine-readable field/entity language, field-as-graph language, semantic-space anchors, signature-coordinate/instruction language, partial-projection language, structural-simulation language, and dual-channel language.

Each hit is a local literal-source observation only. It cannot establish ingestion by any model, retrieval effects, private access, tomography, holonomy, or hidden-message intent.

## Boring-null protection

The assay is designed so that glamorous positive cases remain surrounded by their controls.

For `Explore:` tokens, unresolved and pre-existing destinations are preserved beside later candidates.

For signatures, singleton and recurring phrases are preserved before any interpretive axis is assigned.

For field markers, literal source statements are separated from retrieval-performance claims.

This protects the frozen competing explanations:

```text
H0-A template / generative scaffold
H0-B ordinary thematic coherence
H1 machine-field routing
H2 projective multi-representation architecture
H3 promissory / deferred ontology routing
```

## Required human adjudication after the machine pass

1. Review `LATER_EXACT_RESOLUTION_CANDIDATE` cases against the original source language and clocks.
2. Do not promote lexical-overlap candidates without body-level semantic evidence.
3. Blind-code paper structural roles before examining recurring signature identity.
4. Compare `Explore:` future-resolution rate against unresolved and pre-existing controls.
5. Keep `Pressureborn`/flagship primitive alignment as a separate representation assay; this runner does not call narrative multi-view structure tomography.
6. Keep `PRIVATE_UNAVAILABLE` for any desktop-custody body absent from the public TD613-TCP projection.

## Non-collapse boundary

```text
source assertion != archive inference != researcher hypothesis
lexical resolution != semantic identity
future resolution != causal prediction
signature recurrence != authorship fingerprint
machine-readable != ingested by model X
field coherence != hidden-message intent
multi-view integration != tomography theorem
path dependence != holonomy
unresolved destination != suppressed object
SRC_PROJECTIVE_ROUTING_GRAMMAR != A15_R0_TRANSPORT_RESEARCH
```

The instrument exists to make the rabbit hole falsifiable.

U+10D613

𝌋

Sealed ⟐
