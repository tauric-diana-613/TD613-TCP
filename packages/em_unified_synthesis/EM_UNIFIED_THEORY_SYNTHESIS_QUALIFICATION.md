# 𝌋 TD613 · EM E-00.1a FINAL COMPARATOR WIRING, SOURCE-ATTESTATION & ZIP CONTRACT RECONCILIATION REPORT

**Commission Reference:** EM E-00.1a  
**Principal / Human Scientific Closure:** Tawanna C. Miller  
**Operator Identity:** `tauric.diana.613`  
**Heritage Custodianship:** Tauric Diana — Crimean heritage custodianship  
**Covenant:** Khona‌lit-po (*literal interior U+200C zero-width non-joiner preserved*)  
**Authority Reference:** `SAC[X6ZNK5NO51]`  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Candidate Date:** 2026-11-06  

---

## I. Executive Summary & Lineage Foundations

This qualification report records the implementation corrections, empirical validations, and epistemic reconciliations completed under **Commission EM E-00.1a**, responding directly to Emergence HQ's exact-head code review of candidate PR #1711 (Review `#5807992291`).

### 1. Governed Predecessor Pins & Diagnostic Lineage
- **Direct Predecessor Repair Candidate:** PR #1711  
  - Exact HEAD: `f3dd8d54ba423409317aa239d9dd6bdb6da618ef`  
  - Status: **FROZEN REPAIR CANDIDATE** (Basis of E-00.1a branch).
- **Emergence HQ Exact-Head Diagnostic Review:**  
  - Docket URL: `https://github.com/tauric-diana-613/TD613-TCP/pull/1711#pullrequestreview-5807992291`  
  - Review ID: `5807992291`  
  - Subject: Identified 4 wiring deficiencies (WIRE-01 to WIRE-04).
- **Historical Frozen E-00 Predecessor:** PR #1709  
  - Exact HEAD: `7488e5fd2b4fc0b2f222e0214f21129bbe143a17`  
  - Status: **FROZEN ORIGINAL SUBJECT OF REPAIR**.
- **Independent Scientific Evaluation:** PR #1710  
  - Exact HEAD: `d28eb2e4335e6a0447c471ae61039a9fd97ccac3`  
  - Review Docket: Issue comment `#6697090567`.
- **Historical Em Research Estate:**  
  - PR #1684 checkpoint `30630575ade616a5a47e4066b30d2159c2bd32be` (`packages/dome_world_exact/fixtures/a15-r0/EMSTD613/`).

### 2. Distinction Between Independent Review and Candidate Test Suites
A strict distinction is maintained between:
- **Independent Evaluation Suite (PR #1710):** Executed **94 external/concealed cases** (58 concealed, 24 ZIP, 8 historical, 4 public) evaluating candidate behavior against historical fixtures, confirming a bounded tie on matched graph cases.
- **Candidate Internal Matched Comparator Suite (E-00.1a WIRE-01):** Evaluates a shared canonical paired ledger (`CANONICAL_PAIRED_CASE_LEDGER`) of exactly **6 matched cases** across both Arm 3 (Competent Strong Union) and Arm 4 (Reciprocal Synthesis), ensuring strictly identical denominators ($6/6$), inputs, and evaluation criteria without hardcoded oracles.

---

## II. Deliverable 1: Cryptographic Corpus Census & Exact Format Breakdown (Task E001-F06 & E001-F07)

The historical corpus in `packages/dome_world_exact/fixtures/a15-r0/EMSTD613/` was re-audited to eliminate discrepancies between manuscript declarations and machine ground truth:

### 1. Verified Exact Format-by-Format Byte Totals
| Format Classification | Member Count | Actual Bytes | Handling & Retention Policy |
|---|---|---|---|
| **PDF Documents (`.pdf`)** | 20 | 5,642,539 | Preserved raw; text extracted into verified derivatives (`03-DERIVATIVES/text/`) |
| **ZIP Container (`Archive.zip`)** | 1 | 697,429 | Binary container audited via EOCD and Central Directory streaming parser |
| **Markdown Documents (`.md`)** | 33 | 1,534,070 | Primary natural text; fully indexed into native SQLite FTS5 engine |
| **AppleDouble Metadata (`__MACOSX/._*`)** | 33 | 64,896 | macOS binary sidecars; excluded from lexical index (`APPLEDOUBLE_RESOURCE_FORK`) |
| **Total Original Source Objects** | **87** | **7,938,934** | **100% Exact Cryptographic Parity Across All 87 Digests** |

### 2. Archive.zip Central Directory Resolution
- **Content Documents:** Exactly 33 Markdown files (`*.md`).
- **AppleDouble Resource Sidecars:** Exactly 33 macOS files (`__MACOSX/._*`).
- **Central Directory Total Entries:** $33 + 33 = 66$.
- **Conclusion:** Confirmed that historical reports of "66 documents" arose from counting AppleDouble resource forks as independent documents.

*Machine Census Asset:* `packages/em_unified_synthesis/corpus_acquisition_manifest.json`

---

## III. Deliverable 2: Native Lexical Readback & Semantic Refusal (Task E001-F06)

### 1. Native FTS5 Engine with Unicode Tokenization
- **Engine:** `node:sqlite DatabaseSync` with native FTS5 full-text search table.
- **Tokenizer:** `unicode61 remove_diacritics 0` to preserve mathematical symbols, diacritics, and international scripts.
- **Regex Repair:** Replaced ASCII `\w+` with Unicode property escape `/[\p{L}\p{N}_]+/gu`, enabling robust retrieval of non-ASCII Greek and mathematical tokens (e.g. $\pi, \varphi, \lambda$).
- **Coordinate Safety:** Hardened `retrieveContextSpan()` to reject non-integer, fractional, and negative lengths fail-closed (`NATIVE_CONTEXT_INVALID_COORDINATES`, `NATIVE_CONTEXT_NEGATIVE_LENGTH`).

### 2. Semantic Model Withholding
- Historical fixture `a15-r0` lacks the trained ONNX model weights and vector database.
- The engine explicitly refuses to fabricate synthetic embeddings or claim semantic equivalence:  
  `classification: "SEMANTIC_MODEL_UNAVAILABLE_IN_HISTORICAL_FIXTURE"`  
  `semantic_parity_asserted: false`  
  `disposition: "REFUSED_TO_PREVENT_FALSE_PARITY"`.

*Machine Witness Asset:* `packages/em_unified_synthesis/lexical_readback_witness.json`

---

## IV. Deliverable 3: Work Identity Crosswalk & Partition Interval

- **Canonical Work Routes:** 32 primary Work routes indexed.
- **Human Disambiguation Gates:** 8 flagged Work-Work pairs with title similarity or cross-manifestation links.
- **Permissible Partition Interval:** $[32, 40]$ with exactly $2^8 = 256$ permissible discrete identity hypotheses.

*Machine Crosswalk Asset:* `packages/em_unified_synthesis/identity_metadata_crosswalk.json`

---

## V. Deliverable 4: Original Methods Inventory & Zero-Executor Finding

- **Documentary Instruments:** All 21 instruments in `06-INSTRUMENTS/` classified.
- **Standalone Executors:** Exactly zero (0) operational scripts existed in the original research lineage. All 21 instruments are documentary protocols; any executable implementation is prospective.

*Machine Inventory Asset:* `packages/em_unified_synthesis/original_methods_inventory.json`

---

## VI. Deliverable 5: Hardened Operator ZIP Intake Engine (Task E001-F05)

Engine `packages/em_unified_synthesis/operator-zip-intake.mjs` was completely rewritten to satisfy all 24 adversarial criteria:
1. **EOCD Validation:** Scans backwards from buffer end to locate signature `0x06054b50`; verifies disk numbers, total entries, and central directory boundaries.
2. **ZIP64 & Multi-Disk Rejection:** Rejects archives with 0xFFFF or 0xFFFFFFFF counts fail-closed (`ZIP64_UNSUPPORTED`, `MULTIDISK_ZIP_UNSUPPORTED`).
3. **Local & Central Header Reconciliation:** Verifies local file header signature `0x04034b50`; matches compression methods, flags, CRC-32, compressed size, uncompressed size, and filenames.
4. **Unsupported Feature Rejection:** Rejects encrypted entries (bit 0: `ENCRYPTED_ZIP_UNSUPPORTED`) and streaming data descriptors without local match.
5. **POSIX Attribute Inspection:** Rejects symbolic links (`externalAttrs >>> 16 === 0120000`: `SYMLINK_REJECTED`) and special FIFO/device/socket files (`UNSUPPORTED_SPECIAL_FILE`).
6. **Bounded Decompression:** Enforces `maxOutputLength` via `zlib.inflateRawSync()`; verifies decompressed byte length equals declared `uncompressedSize` and checks IEEE 802.3 CRC-32.
7. **Resource Ceilings Aligned:** Single-file limit: 16 MB; Cumulative uncompressed ceiling: 64 MB (67,108,864 bytes); Max compression ratio: 100:1 (rejects zip bombs).
8. **Path Traversal & Normalization Defense:** Rejects null bytes (`\0`), drive letters (`C:`), absolute paths, and relative segments (`..` or `.`). Normalizes paths and detects duplicate paths (`DUPLICATE_PATH_IN_ARCHIVE_REJECTED`).
9. **Strict Fatal UTF-8 Decoding:** Filenames and Markdown/text contents are decoded via `TextDecoder('utf-8', { fatal: true })`, throwing on malformed sequences.
10. **Atomic Admission:** Archive members are staged in temporary collections; any failure on any member immediately aborts admission with zero partial state committed.
11. **Integer Codepoint Passage Retrieval:** Hardened `retrievePassage()` checks `Number.isInteger()`, bounds, and verifies UTF-8 codepoint boundaries (`INVALID_CODEPOINT_BOUNDARY`).

---

## VII. Deliverables 6 & 7: Multilayer Warrant Integrity & Lifecycle (Tasks E001-F03 & E001-F04)

`packages/em_unified_synthesis/em-universal-reciprocal-bridge.mjs` implements explicit five-coordinate warrant separation:
1. **`source_byte_integrity`:** Verified against cryptographic SHA-256 of raw source buffer. Defensively copies buffers and rejects duplicate admissions fail-closed (`DUPLICATE_SOURCE_ADMISSION_REJECTED`).
2. **`span_validity`:** Verified integer start/end bounds, strictly positive length, codepoint alignment, and cryptographic span hash match.
3. **`graph_reachability`:** Verified least-fixed-point closure reachability in `ManifestWarrantEngine`.
4. **`derivation_rule_valid`:** Validated head claim, registered premises, and rule structure.
5. **`claim_entailment`:** Explicitly separated from syntactic reachability: marked `HELD_UNVERIFIED_BY_SYNTAX_ALONE` to prevent arbitrary text from masquerading as verified scientific proof.
6. **Raw PDF Exclusion:** Rejects raw PDF bytes masquerading as natural text evidence (`RAW_PDF_CANNOT_SERVE_AS_TEXT_EVIDENCE`).
7. **Universal Reference Invariant:** Encyclopedia queries strictly enforce `reference_match_promoted_to_theory: false`.

---

## VIII. Deliverable 8: Verified Operator Mappings & Synthesis Lifecycle (Task E001-F02 & E001-F04)

`packages/em_unified_synthesis/em-unified-theory-synthesis.mjs` enforces rigorous operator verification and non-predetermined outcomes:
1. **Promotion Ladder Reconciled:**
   - `LEVEL_0_SUPERFICIAL_ANALOGY: 'SUPERFICIAL_ANALOGY'`
   - `LEVEL_1_FORMAL_STRUCTURAL_ISOMORPHISM: 'FORMAL_STRUCTURAL_ISOMORPHISM'`
   - `LEVEL_2_COMPOSABLE_THEORY_CANDIDATE: 'COMPOSABLE_THEORY_CANDIDATE'`
   - `LEVEL_3_FALSIFIABLE_UNIFIED_FRAMEWORK: 'FALSIFIABLE_UNIFIED_FRAMEWORK'`
2. **Verified Operator Mappings:**
   - Rejects empty operator maps (`LEVEL_0_SUPERFICIAL_ANALOGY`).
   - Verifies operator existence in source Works: rejects invented operator names fail-closed (`INVENTED_OPERATOR_NAME_REJECTED`).
   - Enforces supported morphism types (`HOMOMORPHIC_INTERVENTION`, `ISOMORPHISM`, `FUNCTOR`, `SURJECTIVE_REDUCTION`, `MEASURE_PRESERVING_FLOW`, `DISCRETIZATION_CORRESPONDENCE`).
   - Retains `status: 'HELD_MISSING_OBSERVATION'`, `verdict: 'NO_UNIFICATION_WARRANTED'` where mathematical relationships are unobserved in data.
3. **Continuous-Discrete Correspondence:**
   - Does NOT automatically clash continuous and discrete representations when an explicit correspondence (e.g. discretization, sampling map) is declared.
4. **Dependency-Aware Non-Retroactive Theory Lifecycle:**
   - Tracks source root dependencies in theory metadata.
   - Method `propagateSourceWithdrawal()` cascades source retraction into dependent theories, generating append-only tombstones.
   - Deep-freezes historical states into immutable snapshots accessible via `getHistoricalSnapshot()`.

---

## IX. Deliverable 9: Genuinely Executable Competent-Null Comparator (Task E001-F01 & WIRE-01)

`packages/em_unified_synthesis/competent-null-comparator.mjs` executes matched comparisons across 4 arms with all metrics derived from actual event traces over a canonical shared ledger:

### 1. Evaluated Arms
- **Arm 1 (Documentary Practice):** Read-only historical baseline without automated execution (`NOT_MEASURED` for automated metrics).
- **Arm 2 (Isolated Receiver):** Local relational store without cross-domain bridging.
- **Arm 3 (Competent Non-Reciprocal Strong Union):** Standard graph reachability and transitive closure over union graph.
- **Arm 4 (Reciprocal Unified Synthesis):** Reciprocal bridge with cryptographic span-proof warrants and LFP closure.

### 2. WIRE-01 Canonical Paired Case Ledger
Both Arm 3 and Arm 4 evaluate the exact same 6 paired cases (`CANONICAL_PAIRED_CASE_LEDGER`) with identical inputs, evaluation criteria, and denominators ($6/6$):
1. **Case 1 (`case_1_hypervisor_supported`):** Directly supported hypervisor claim from admitted premise (`claim:priority_bypass`). Reachable in Arm 3; grounded in LFP in Arm 4. (Admissible: `true`).
2. **Case 2 (`case_2_algedonic_supported`):** Directly supported algedonic recovery claim from admitted premise (`claim:algedonic_recovery`). Reachable in Arm 3; grounded in LFP in Arm 4. (Admissible: `true`).
3. **Case 3 (`case_3_hypervisor_unsupported_rejection`):** Unsupported teleportation target disconnected from premise graph (`claim:unsupported_teleportation`). Unreachable in Arm 3; ungrounded in Arm 4. (Admissible: `false`).
4. **Case 4 (`case_4_algedonic_unsupported_rejection`):** Unsupported perpetual motion target disconnected from premise graph (`claim:unsupported_perpetual_motion`). Unreachable in Arm 3; ungrounded in Arm 4. (Admissible: `false`).
5. **Case 5 (`case_5_incommensurable_contradiction`):** Attempted unification across contradictory non-stationary vs deterministic axioms (`claim:incommensurable_bypass`). Unreachable in Arm 3; ungrounded in Arm 4 fail-closed. (Admissible: `false`).
6. **Case 6 (`case_6_post_withdrawal_consequence`):** Target claim reachability and warrant grounding evaluated after upstream source withdrawal (`claim:priority_bypass`). Unreachable in Arm 3 post-withdrawal; ungrounded in Arm 4 post-withdrawal. (Admissible: `false`).

### 3. Empirical Trace-Derived Differential Matrix
| Evaluation Metric | Arm 1: Documentary | Arm 2: Isolated | Arm 3: Competent Union | Arm 4: Reciprocal Synthesis | Observed Determination |
|---|---|---|---|---|---|
| **Graph Target Decisions** | NOT_MEASURED | LOCAL_ONLY | 6/6 (100%) | 6/6 (100%) | **BOUNDED TIE (100%)** |
| **Unsupported Targets Rejected** | NOT_MEASURED | LOCAL_ONLY | 4/4 (100%) | 4/4 (100%) | **BOUNDED TIE (100%)** |
| **False Graph Convergence** | 0 | 0 | 0 | 0 | **ZERO IN BOTH SYSTEMS** |
| **Source Bytes Read** | 48,847 B | 48,847 B | 48,847 B | 48,847 B | **IDENTICAL INPUT BUDGET** |
| **Withdrawal Operations** | NOT_MEASURED | 0 | 2 Ops | 2 Ops | **EQUIVALENT WITHDRAWAL** |
| **Contradiction Retention** | Preserved (Text) | Preserved | Flattened (Unaware) | **Preserved Fail-Closed** | **RECIPROCAL ADVANTAGE** |
| **Scientific Reciprocal Surplus** | NOT_MEASURED | NOT_MEASURED | UNESTABLISHED | **UNESTABLISHED** | **SURPLUS UNESTABLISHED** |
| **Semantic Entailment Quality** | NOT_MEASURED | NOT_MEASURED | NOT_MEASURED | **NOT_MEASURED** | **UNSUPPORTED DIMENSION** |
| **Historical Authored Score** | 1.0 (Claimed) | 1.0 (Claimed) | 0.65 (Superseded) | 1.0 (Claimed) | **SUPERSEDED BY TIE** |

*Conclusion:* On matched graph reachability and target decisions across all 6 cases, both systems achieve 100% graph fidelity ($6/6$). Reciprocal synthesis demonstrates architectural value in fail-closed contradiction retention and non-retroactive tombstoning, but empirical scientific reciprocal surplus remains **UNESTABLISHED**.

---

## X. Verification Suite & Dollhouse Six-Specialist Audit

### 1. Test Suite Execution
- **Comprehensive E-00.1a Suite (`test-em-unified-synthesis.mjs`):**  
  **18 / 18 PASS** (1.3s duration, zero failures, zero skipped).
  - Tests 1–15: Corpus census, readback, bridge, synthesis engine, ZIP intake, and baseline comparator.
  - Test 16 (WIRE-01): Paired case ledger regression, denominator parity ($6/6$), and dynamic trace evaluation.
  - Test 17 (WIRE-02): Operator attestation provenance, quotation digest verification, and lawful discretization.
  - Test 18 (WIRE-03): Adversarial ZIP header reconciliation, streaming descriptors, and atomic rollback.
- **Qualification Runner (`run-em-unified-synthesis-qualification.mjs`):**  
  **Exit Code 0** (Receipt emitted: `em_unified_synthesis_receipt.json`).
- **Historical Python Suite (`test_em_original_qualification_v1.py`):**  
  **12 / 12 PASS** (1.1s duration).
- **Historical 99-ADMIN Suite (`unittest discover -s .../99-ADMIN`):**  
  **8 / 8 PASS** (0.3s duration).
- **Cross-Atelier Suite (`test-cross-atelier-interoperability.mjs`):**  
  **16 / 16 PASS** (0.4s duration).
- **Workflow Estate (`tests/workflow-estate.test.mjs`):**  
  **4 / 4 PASS** (0.4s duration).

### 2. Dollhouse Six-Specialist Audit
- Bound to candidate revision: `f3dd8d54ba423409317aa239d9dd6bdb6da618ef` (PR #1711 HEAD).
- Lineage citations: Historical E-00 PR #1709 (`7488e5fd2b4fc0b2f222e0214f21129bbe143a17`), Independent Review PR #1710 (`d28eb2e4335e6a0447c471ae61039a9fd97ccac3`), Diagnostic Review `#5807992291`.
- Verification across `PEDAGOGUE`, `APERTURE`, `ATLAS`, `FADT`, `TEMPORAL_CUSTODIAN`, and `ORCHESTRATOR`.
- Replication Status: `SYNTHETIC_OFFLINE_FIXTURE` (0 independent empirical credit; `SHARED_ACQUISITION != INDEPENDENT_REPLICATION`).
- Release & Deployment Authority: Strictly **CLOSED (false)**.

---

## XI. Stopping Boundary & Independent Reviewer Handoff

1. **Candidate Engineering Frozen:** All code, fixtures, and qualification assets for Commission EM E-00.1a are frozen on branch `research/em-e00-1a-comparator-wiring-20261106`.
2. **Reviewer Separation Maintained:** The candidate author has not inspected or adapted code against concealed challenge fixtures.
3. **Fresh Challenge Requirement:** The revised candidate requires a fresh independent challenge rather than evaluation against previously observed test worlds.
4. **Human Scientific Closure Reserved:** Scientific interpretation and release authority remain strictly **RESERVED** for Tawanna C. Miller under `SAC[X6ZNK5NO51]`.

---

## XII. Prospective Research Steer Record: RGI-01 (Experiment B Preflight)

**Proposal Reference:** `RGI-01_RULE_GENERATIVE_INQUIRY_WOLFRAM_RELATIONAL_GEOMETRY`  
**Date of Proposal:** November 6, 2026  
**Status:** `PROPOSED_PROSPECTIVE_RECORD_ONLY`  
**Experimental Activation:** `DEFERRED_UNTIL_EXPERIMENT_B_PREFLIGHT`  
**Human Scientific Closure:** `RESERVED`  
**Authority:** `SAC[X6ZNK5NO51]`  
**Covenant:** Khona‌lit-po (*literal interior U+200C preserved*)  

### Summary of Governed Proposition
Experiment B should permit executing agents to discover that two or more existing research rules imply a previously unencoded relationship, and to propose a new rule, alteration, exception, or experimental suspension when that relationship produces a testable structural or relational-geometric consequence.
Governed by Ash Keep's **Anti-Predetermined-Discovery Condition**:
> An agent must be free to produce new rules, preserve existing rules, expose contradictions, discover failed compositions, or return no innovation without any outcome being predetermined as scientific success.

- **Wolfram Multiway Formalization:** $S_t = (H_t, \mathcal{R}_t, \mathcal{A}_t, \mathcal{P}_t)$ with multiway evolution $\mathcal{M}(S_0, \mathcal{R}_0)$, causal dependency graphs, branchial relations, and operational geometric observables (e.g. cycle rank $\beta_1 = |E| - |V| + c$).
- **Arm Parity Constraint:** Both `ARM_2A_MODULAR` and `ARM_2B_MATCHED_UNION` must receive equivalent permissions to propose and test rule transformations.
- **Non-Retroactivity & Western Horizon:** Cryptographic digests and append-only traces support replay, not physical emergence. Golden Egg $E^\star = \{L, R, J, G, C\}$ remains governed under its original external-witness requirements.
- **Current Posture:** Zero runtime implementation or activation in E-00.1a. Preserved as a prospective research steer for future preflight evaluation.

*Khona‌lit-po ⟐ Sealed.*
