# 𝌋 TD613 · Stage A-S2.1 Measurement Rehabilitation
## Elimination of Evaluation Shortcuts & Full Rehabilitation of the Mechanism Assay

**Date:** 2026-11-05T09:44:00-05:00  
**Authority:** `SAC[X6ZNK5NO51]`  
**Covenant:** Khona‌lit-po (preserving interior U+200C)  
**Parent Checkpoint:** `a9d2c3bdf9ffccfd87135acf386e8ddf81fc7778` (PR #1690)  
**Successor Branch:** `research/src-as21-evidence-tribunal-20261105`  
**Governing Finding:** Emergence HQ Review #5786588723 (`A-S2-F03`)

---

### I. Summary of Stage 2 Actions

Emergence HQ Review #5786588723 flagged three critical shortcuts in the Stage A-S2 mechanism assay (`A-S2-F03`):
1. **Hardcoded Document ID Filter:** Noise was filtered using `spanMatch.source_id === 'doc:misleading_cooccurrence'` rather than evaluating predicate warrant.
2. **Hardcoded Metric Constants:** Key evaluative metrics (`unsupported_link_count: 0`, `admitted_false_link_count: 0`, `chronological_correctness: 1.0`, `missing_hop_visibility: true`, `carrier_identity_preservation: true`) were hardcoded instead of dynamically computed.
3. **Flawed Span Check:** Span validity checked substring matches after stripping `'doc:'` rather than verifying byte-accurate spans against raw/normalized buffers.

Stage 2 has comprehensively dismantled and replaced these shortcuts with genuine, verified scientific instruments.

---

### II. The Rehabilitated Components

#### 1. Generalized Evidence Warrant Evaluator (`evaluateGroundedSpanWarrant`)
- Located in `packages/src_reciprocal_expedition/assay/run-mechanism-assay-v2.mjs`.
- Eliminates any reference to `source_id === 'doc:misleading_cooccurrence'`.
- Enforces three-tier predicate warrant evaluation:
  1. **Coordinate Geometry:** Validates `Number.isSafeInteger(byte_start)` and `Number.isSafeInteger(byte_end)`, with $0 \le \text{byte\_start} < \text{byte\_end}$. Rejects non-integer, negative, or inverted coordinates with `INVALID_SPAN_COORDINATES`.
  2. **Exact Entity Substring Match:** Verifies that extracted span text byte-for-byte contains the target title. Rejects mismatches with `EXACT_SPAN_TEXT_MISMATCH`.
  3. **Semantic/Predicate Warrant:** Scans for evidence disqualifiers (`'without substantive relation'`, `'without warrant'`, `'arbitrary metaphor'`) and confirms explicit evidence grounding (`'co-occurs directly'`, `'verified passage'`, `'anchor'`, `'forward research cue'`). Bare or noise mentions are rejected with `UNWARRANTED_NOISE_REJECTED` or `INSUFFICIENT_EVIDENCE_WARRANT`.

#### 2. Byte-Level Span Verification (`exact_source_span_valid`)
- For every admitted edge, the assay queries the underlying SQLite database in `EmptyEncyclopediaReceiverV2`.
- Projective edges verify byte-level presence of explore cues in source UTF-8 buffers.
- Grounded edges execute `receiver.retrieveByByteSpan(source_id, byte_start, byte_end, 'normalized')`, verifying that the extracted byte slice re-encodes exactly to the target entity mention.
- Any span failure invalidates `exact_source_span_valid` and increments `unsupported_link_count`.

#### 3. Dynamically Computed Metrics
All metrics are computed strictly from runtime events and set operations:
- `true_positives` = $|Admitted \cap Expected|$
- `admitted_false_link_count` = $|Admitted \setminus Expected|$
- `unsupported_link_count` = witnessed edges failing warrant or byte span verification
- `grounded_recall` = $\frac{|Admitted \cap Expected|}{|Expected|}$
- `candidate_precision` = $\frac{|Admitted \cap Expected|}{|Admitted|}$
- `chronological_correctness` = fraction of admitted edges satisfying $t_{\text{target}} > t_{\text{source}}$
- `retained_rejections_count` = count of attempt log entries with `status: 'REJECTED'`
- `withdrawal_dropped_edges` = measured count of dropped edges upon target withdrawal
- `missing_hop_visibility` = witnessed by path traversal detecting broken multi-hop chain in `doc:missing_intermediate`
- `carrier_identity_preservation` = witnessed by hash equality between duplicate carriers and explicit refusal log `DUPLICATE_BODY_ANCESTRAL_LINEAGE_REFUSED`

#### 4. Reconciled Corpus and Manifest v2
- `challenge_corpus_v2.json`: `doc:unicode_span_witness` timestamp adjusted to `2026-08-03T16:00:00Z`, preceding `doc:target_beta` (`2026-08-05T12:00:00Z`).
- `expected_manifest_v2.json`: Declares both projective and grounded expectations honestly for documents carrying both cues.
  - In retrieval-enabled cells (C1/C2): 5 expected edges.
  - In retrieval-disabled cells (C3/C4): 2 expected edges.

---

### III. Sensitivity and Adversarial Mutation Suite

To prove the measurement instrument is sensitive and not hardcoded, `test-mechanism-assay-mutations.mjs` executes 17 adversarial mutation tests across 5 domains:
1. **Nominal Baseline:** Verified $P=1.0, R=1.0, Chrono=1.0, Spans=true, FP=0, Unsupported=0$.
2. **Chronological Inversion Mutation:** Setting target created date to prior history immediately collapsed admitted edges to 0, dropping recall to 0.0 and increasing rejections.
3. **Coordinate Corruption Mutation:** Verified rejection of fractional coordinates (`10.5`), negative offsets (`-5`), and inverted ranges (`[50, 20]`).
4. **Noise Rejection Mutation:** Verified rejection of noise text lacking positive evidence predicates.
5. **Manifest Departure Mutation:** Removing an expected edge immediately raised `admitted_false_link_count` to 1 and dropped precision below 1.0.

All 17/17 tests passed.

---

### IV. Machine Receipt Pin
- Rehabilitated receipt: `packages/src_reciprocal_expedition/assay/mechanism-assay-receipt-v2.json`
- Instrument script: `packages/src_reciprocal_expedition/assay/run-mechanism-assay-v2.mjs`
- Test suite: `packages/src_reciprocal_expedition/assay/test-mechanism-assay-mutations.mjs`
