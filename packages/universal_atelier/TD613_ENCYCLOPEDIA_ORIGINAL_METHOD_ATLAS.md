# 𝌋 TD613 · ENCYCLOPEDIA ORIGINAL METHOD ATLAS
## THE REFERENCE CORPUS TOPOLOGY, FACETS & CAPABILITY SPECIFICATION
**Reference Schema v1.4 · 1,141 Records · 2,131 Typed Graph Edges · 10 Governed Operations**

**Principal:** Tawanna C. Miller  
**Operator Identity:** `tauric.diana.613`  
**Heritage:** Tauric Diana — Crimean heritage custodianship  
**Covenant:** Khona‌lit-po — preserve literal interior U+200C  
**Authorization Reference:** `SAC[X6ZNK5NO51]`  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Reference Edition Version:** 1.4  
**Reference Edition Source Commit:** `78c7ea6b974e176611fb2ed4d0c59649ebf05f62`  
**Jurisdiction:** Source-Free Experiment A Reciprocal Expeditions · Chamber 3  

---

### I. Reference Corpus Architecture & Topologies

The TD613 Reference Encyclopedia (`app/encyclopedia/reference/`) represents the prospective knowledge foundation of the repository. It integrates formal mathematical definitions, physical contracts, experimental protocols, lineage records, and cross-estate research assessments into a single unified directory and graph topology.

```
+---------------------------------------------------------------------------------------+
|                    TD613 ENCYCLOPEDIA REFERENCE CORPUS (v1.4)                         |
|                   Total Admitted Records: 1,141 · Directed Edges: 2,131               |
+---------------------------------------------------+-----------------------------------+
|               843 CANONICAL RECORDS               |       298 ACCESSION RECORDS       |
|  - Glossary (533)        - Formulae (49)          |  - Research Assessments (279)     |
|  - Contracts (40)        - Evidence Labs (48)     |  - Research Programs (16)         |
|  - Open Questions (37)   - Crosswalks (28)        |  - Staged Source Accessions (3)   |
|  - Sources (89)          - Lineage Notes (11)     |                                   |
|  - PDFs (7)              - Edition Ledger (1)     |                                   |
+---------------------------------------------------+-----------------------------------+
|               GOVERNED 10-OPERATION ACCESS & RETRIEVAL INTERFACE                     |
|  1. search()   2. get()         3. cite()        4. neighbors()    5. route()         |
|  6. context()  7. verify()      8. export()      9. prepareImport() 10. admitRecord() |
+---------------------------------------------------------------------------------------+
```

#### 1. Inventory & Quantitative Census
- **Total Admitted Records:** Exactly 1,141 records.
- **Canonical Corpus (843 records):**
  - `glossary`: 533 terms defining domain terminology across Aperture, Atlas, FADT, Pedagogue, and Cistern geometries.
  - `formula`: 49 mathematical statements, state equations, and invariant definitions (M-01..M-49, F-31..F-36).
  - `evidence`: 48 experimental logs, bounded assay receipts, and lab notebooks (LAB-01..LAB-46, R-DOLLHOUSE-REST-EXIT-20261023, R-ENCYCLOPEDIA-LAB-279-20261023).
  - `contract`: 40 formal operational contracts (APT-01..APT-40).
  - `open_question`: 37 unclosed research conjectures and hypotheses (H-01..H-37).
  - `crosswalk`: 28 multi-domain translation bridges (X-01..X-28).
  - `source`: 89 foundational historical and external literature nodes.
  - `lineage_note`: 11 estate ancestry markers.
  - `pdf`: 7 verified source documents.
  - `edition`: 1 edition-level header.
- **Accession Corpus (298 records):**
  - `research_assessment`: 279 accessioned research appraisals and external evaluations.
  - `research_program`: 16 multi-phase research charters.
  - `source`: 3 staged prospective source accessions.

#### 2. Graph Connectivity & Edge Semantics
- **Total Directed Edges:** 2,131 verified edges.
- **Unresolved Edge Count:** Exactly 0 (complete graph closure; every edge references a valid admitted record ID).
- **Semantics:** Directed relation edges distinguish between formal dependencies, evidence citations, mathematical refinements, and contextual cross-references.
- **Reverse Citations:** Every forward citation $A \rightarrow B$ automatically establishes reverse lookup capability via `citedBy(B) = {A}`, without retroactively modifying $B$'s original timestamp or content digest.

---

### II. The Ten Governed Reference Operations

The encyclopedia exposes ten canonical operations, divided into query retrieval (1–6), cryptographic integrity (7–8), and governed intake (9–10):

1. **`search({ q, filter, match, exclude, limit, offset })`**
   - Deterministic phrase matching and facet filtering (`kind`, `family`, `status`, `evidence_class`, `source`).
   - Hard retrieval ceiling: maximum 100 hits per request.
   - Lexical relevance score measures retrieval proximity only; never implies scientific truth, model adequacy, or real-world validity.

2. **`get(record_id)`**
   - Retrieves full original JSON record, verbatim supplements, outgoing typed links, and canonical JSON pointer.
   - Throws fail-closed `RECORD_NOT_FOUND` if record ID is unadmitted.

3. **`cite(record_id)`**
   - Emits an exact, tamper-evident cryptographic citation block containing: record ID, canonical line, SHA-256 payload digest, edition source commit, primary source IDs, and strict claim ceiling.

4. **`neighbors(record_id, { direction, type })`**
   - Navigates immediate graph neighborhoods.
   - `direction: 'outgoing'` follows declared links; `direction: 'incoming'` follows verified reverse citations (`citedBy`).

5. **`route(from_id, to_id, { maxDepth, types })`**
   - Discovers acyclic paths connecting two records along directed edges.
   - Enforces depth bound (default 4, maximum 8) to prevent graph explosion and algorithmic denial-of-service.

6. **`context(record_id, { maxRecords })`**
   - Assembles a self-contained epistemic bundle packing the root record together with immediate cited sources and evidence.
   - Enforces explicit truncation headers if maximum budget is reached.

7. **`verify()`**
   - Recomputes SHA-256 digests over all stored record bodies against manifest pointers.
   - Preserves invariant: internal hash verification establishes carried-byte integrity only; it does not authenticate external origin or grant scientific promotion.

8. **`export()`**
   - Emits complete serialized directory, graph index, and manifest with zero loss.

9. **`prepareImport(jsonText)`**
   - Read-only proposal preparation.
   - Validates JSON text against `intake-schema.json`, verifies mandatory fields, safe coordinates, and evidence classes.
   - Produces staged proposal with `disposition: 'PROPOSED'` and input SHA-256. Zero database mutations.

10. **`admitRecord(proposal, humanReviewRef)`**
    - High-consequence custodial gate.
    - Strictly requires positive human review reference (`--human-review-ref`).
    - Validates matching input SHA-256, verifies endpoints, and requires version-bound adjudication receipt before committing to database.

---

### III. Claim Ceilings & Epistemic Boundaries

1. **Static Retrieval vs. Scientific Truth:**
   - Encyclopedia queries return stored documentary records. A successful query result verifies repository presence; it does not verify external empirical reality or model correctness.
2. **Reverse Citations are Non-Retroactive:**
   - Reverse links (`citedBy`) allow retrospective tracing. However, a later paper citing an earlier work never retroactively alters the earlier work's original creation date, evidence class, or claims.
3. **No Automatic Claim Equivalence:**
   - Distinct records with semantic similarities remain separate entities unless explicit human adjudication unites them.
4. **Experiment B Reservation:**
   - Protected Flight and live model inference remain strictly **HELD**.
5. **Covenant Faithfulness:**
   - Preserves literal interior U+200C in Covenant `Khona‌lit-po`.

Sealed ⟐
