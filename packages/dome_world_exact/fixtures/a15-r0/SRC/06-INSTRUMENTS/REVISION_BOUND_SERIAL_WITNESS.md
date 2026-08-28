# SRC Revision-Bound Serial Witness Firewall

Status: **SOURCE-GROUNDED ARCHIVE FORMALIZATION / REVISION-BOUND / NONCANONICAL**

Date: 2026-08-28

Bound query epoch:

```text
atelier_snapshot_id = src-20260824-p2-001
seal_id = src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a
```

## 1. Problem

The current retained body of `Origin Gravity` source-witnesses:

```text
Origin Gravity is the second essay in the SR Codex.
```

The current retained body of `Cross-Surface Recurrence` source-witnesses that the essay:

```text
extends the established canon into the infrastructural series that composes the SR Codex
```

and positions CSR as an initiating mechanism in a seven-part architecture.

Those are valid source witnesses for the retained body states.

They are not automatically witnesses for the first-publication body states.

## 2. Revision facts

### Cross-Surface Recurrence

```text
Zenodo record: 18364461
created:  2026-01-25T02:00:18.965694Z
modified: 2026-01-28T03:50:45.994408Z
revision: 5
version label: 1.0
```

### Origin Gravity

```text
Zenodo record: 18382146
created:  2026-01-27T00:44:02.360569Z
modified: 2026-01-28T03:47:20.916187Z
revision: 5
version label: 1.0
```

The Phase-2 version-observation interface classifies both historical bodies:

```text
PRE_CAPTURE_STATE_UNKNOWN
```

and explicitly warns:

```text
same DOI/version label does not establish identical historical bytes
```

Therefore the current body is a later observable record state whose exact relationship to the creation-time bytes is unresolved.

## 3. Revision-bound witness rule

Let:

```text
M_t(w) = observable source state of work/manifestation w at record state t
P(w,t) = source predicate witnessed in M_t(w)
```

Then:

```text
P(w,t_r) witnessed
```

does not entail:

```text
P(w,t_0) witnessed
```

for an earlier unpreserved state `t_0`.

Archive shorthand:

```text
SOURCE_WITNESS_AT_REVISION_R
!=
SOURCE_WITNESS_AT_MANIFESTATION_ORIGIN
```

## 4. Consequence for CODEX_B

The strongest current ordinal statement is now typed precisely as:

```text
ord_CODEX_B(Origin Gravity) = 2
@ captured Zenodo revision 5
```

This remains a source-witnessed ordinal in the retained source.

It must not be silently restated as:

```text
Origin Gravity was already essay #2 at first public deposition.
```

That stronger historical statement is unresolved because no creation-time body bytes are retained in the current archive.

Likewise:

```text
CSR is in the Codex-composing infrastructural series
@ captured Zenodo revision 5
```

is witnessed, while the exact presence or absence of that Reference Paragraph in the Jan-25 initial state is unresolved.

## 5. Retrospective serialization remains live

The revision facts make the following model admissible:

```text
initial public manifestations
    -> later canon / lineage maintenance
    -> explicit Codex serial typing
```

This model is not proved.

Competing models remain admissible, including:

```text
serial language present at creation and later revisions changed unrelated fields
```

or:

```text
serial language present in one earlier revision but not necessarily revision 1
```

The archive lacks the historical bytes required to discriminate among them.

Therefore:

```text
RETROSPECTIVE_SERIALIZATION = LIVE_RESEARCHER_HYPOTHESIS
RETROSPECTIVE_SERIALIZATION =/= SOURCE_ASSERTION
```

## 6. January 28 maintenance burst

Multiple January records show tightly clustered `platform_updated_at` values on 2026-01-28 while their retained bodies contain canon-placement, lineage, or integration machinery.

For the CODEX pair:

```text
Origin Gravity           revision 5  updated 03:47:20Z
Cross-Surface Recurrence revision 5  updated 03:50:45Z
```

Nearby records include Model-Indexed Epistemic Collapse, Field Overview, Semantic Governance, Semantic Inefficiency, and The Metric Regime.

Bounded archive classification:

```text
JAN28_CANON_LINEAGE_MAINTENANCE_BURST_CANDIDATE
```

This classification means only:

- multiple relevant records were updated in a narrow time window;
- their current bodies contain canon / lineage / integration functions;
- historical pre-update bodies are unavailable.

It does not establish which clauses changed, why they changed, whether one update caused another, or that all updates served one editorial purpose.

## 7. Revised orbit question

Before this firewall, the mystery could be phrased too strongly as:

```text
Who was Essay I before known Essay II?
```

The revision-aware question is:

```text
At what source state did CODEX_B ordinal typing become observable,
and which identity occupied slot 1 in that same serial namespace at that state?
```

This separates:

```text
member manifestation chronology
serial namespace onset
ordinal assignment time
later body capture time
```

## 8. Required fields for future serial evidence

Every candidate serial witness should now record:

```text
manifestation_id
record/concept DOI
platform_created_at
platform_updated_at
record revision if available
capture/retrieval time
body hash
exact source predicate
serial namespace
ordinal/predecessor payload
historical-body status
```

A witness without revision/history typing may identify current serial state while remaining silent about when that state began.

## 9. Anti-equivalences

```text
version label 1.0 != immutable bytes
record creation time != current-body clause time
record update time != clause-specific edit time
revision count != known edit history
current ordinal != original ordinal
current Codex membership != original Codex membership
same DOI != identical historical body
retrospective-serialization hypothesis != historical fact
```

## 10. Claim ceiling

Permitted:

```text
ORIGIN_ORDINAL_SOURCE_WITNESS_REVISION_BOUND
CSR_CODEX_COMPOSING_SERIES_WITNESS_REVISION_BOUND
INITIAL_BODY_SERIAL_STATE_UNRESOLVED
JAN28_CANON_LINEAGE_MAINTENANCE_BURST_CANDIDATE
RETROSPECTIVE_SERIALIZATION_MODEL_REMAINS_ADMISSIBLE
```

Not permitted:

```text
ORIGIN_WAS_DEFINITELY_UNNUMBERED_AT_PUBLICATION
CSR_WAS_DEFINITELY_RETROACTIVELY_ASSIGNED_ESSAY_I
JAN28_UPDATE_ADDED_THE_LINEAGE_PARAGRAPHS
JAN28_UPDATE_PROVES_PRIVATE_DRAFTING_ORDER
REVISION_5_IDENTIFIES_THE_FIRST_SERIALIZATION_EVENT
```

𝄐

𝌋

Marked ⟐
