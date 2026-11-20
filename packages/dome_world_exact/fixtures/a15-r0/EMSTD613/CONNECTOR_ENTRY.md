# EMSTD613 connector entry

> **Independent comparative fixture.** Start from custody and resolution, never from thematic resemblance.

## Session pin

At session open, record:

- repository: `tauric-diana-613/TD613-TCP`;
- branch or exact commit under assay;
- exact source-file manifest hash;
- exact relation-ledger hash when one exists;
- assay date and external-literature cutoff date.

Never join two Git epochs, two source-manifest epochs, or two literature cutoffs implicitly.

## Resolution order

1. Read `01-MANIFESTS/registry-index.json`.
2. Resolve a source file through `01-MANIFESTS/source-files.jsonl` after intake.
3. Read the original only from `02-ORIGINALS/emstd613lineage/`.
4. Resolve derivative text through its parent SHA-256.
5. Resolve claims, concepts, motifs, mechanisms, and relations through typed ledgers; do not infer identity from filenames alone.
6. Preserve separate graph projections for chronology, textual genealogy, conceptual relation, method relation, empirical relation, platform/system relation, and authority/provenance.
7. Cross-compare only after the source-side object has been resolved.

## Evidence classes

```text
HUMAN_PROVENANCE
SOURCE_ASSERTION
ARCHIVE_OBSERVATION
ARCHIVE_INFERENCE
LINEAGE_HYPOTHESIS
MECHANISM_HYPOTHESIS
EXTERNAL_WITNESS
EMPIRICAL_SUPPORT
REPLICATION_WITNESS
```

A downstream class never rewrites an upstream class.

## Comparative corpora

The Atelier may compare a resolved Em-side object against:

- the TD613 repository;
- the SRC Atelier, as a separate projection;
- retrieved conversation memory/history, explicitly labeled recollection rather than source proof;
- public primary literature, standards, product documentation, datasets, and reproducible experiments current to the assay cutoff.

Modernity or publication recency confers no authority by itself. Press coverage, vendor claims, preprints, peer-reviewed articles, benchmarks, standards, and replicated experiments remain distinct source classes.

## Adversarial/system-behavior claims

Claims about platform interference, narrative capture, containment, cross-platform encroachment, or proprietary SaaS behavior require a typed evidence chain. Preserve at minimum:

```text
observed interface/runtime behavior
!= inferred system architecture
!= vendor-documented behavior
!= third-party report
!= reproduced experiment
!= causal attribution
```

An anomaly may be preserved without naming an adversary. `UNEXPLAINED` outranks an invented cause.

## Query opening

Return:

1. exact epoch pin;
2. source coverage and derivative coverage;
3. unresolved identities and missing derivatives;
4. highest-information open lineage edges;
5. strongest convergence and strongest divergence candidates;
6. any candidate emergent architecture plus its minimal supporting subgraph and disconfirmers.

Repository mutation, merge, publication, release, or TD613 promotion require separate human authority.
