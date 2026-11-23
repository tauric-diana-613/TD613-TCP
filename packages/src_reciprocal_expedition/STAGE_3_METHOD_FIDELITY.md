# 𝌋 TD613 · Stage 3 Original Python vs JavaScript Method Fidelity
## Differential Interoperability Suite, Coverage Matrix, and Discrepancy Evidence

**Date:** 2026-11-05T09:13:00-05:00  
**Authority:** `SAC[X6ZNK5NO51]`  
**Covenant:** Khona‌lit-po (preserving interior U+200C)  
**Parent Checkpoint:** `ce9b6c6e053505e8f005e27ad2af4631ce2ed140` (PR #1689)  
**Successor Branch:** `research/src-order-mechanism-falsification-20261105`  
**Execution Worktree:** `C:\td613-worktrees\src-first-reciprocal-expedition`  
**Python Oracle Pin:** PR #1683 (`packages/research_carrier_v1/native/`)  
**JS Candidate Pin:** `packages/src_reciprocal_expedition/native_atlas/src-native-methods.mjs`  
**Differential Harness:** `packages/src_reciprocal_expedition/fidelity/run-differential-comparison.mjs`  
**Coverage Matrix:** `packages/src_reciprocal_expedition/fidelity/differential-coverage-matrix.json`

---

### I. Review Finding F02 Remediation

Independent review #5785888440 noted:
> `calibration/reciprocal-calibration-runner.mjs` imports the same `native_atlas/src-native-methods.mjs` JS reimplementation for both the origin and registered recipient paths. 12/12 supports same-implementation consistency, not independent equivalence to pinned original Python executables in PR #1683. Preserve the independently qualified original SRC Python bytes, run them as an independently retained oracle on matched synthetic inputs, and compare exact typed outputs with explicitly permitted normalizations.

Stage 3 established a cross-runtime differential testing harness. The pinned historical Python implementations from PR #1683 were invoked directly via managed Python 3.12 (`python_oracle_runner.py`), and the JavaScript candidate was executed in Node.js (`js_candidate_runner.mjs`) on the identical synthetic challenge deck (`synthetic_deck.json`).

---

### II. Four-Domain Coverage & Parity Findings

#### 1. Domain 1: Projective Routing Grammar
- **13 Field Markers Census: EXACT MATCH.** Both Python and JavaScript detected the exact 9 matching field markers from the synthetic corpus out of 13 defined markers (`machine_readable_field`, `dual_gradient`, `field_graph_not_sequence`, `semantic_space_anchor`, `signature_coordinates`, `signature_instructions`, `structural_simulation_narrative`, `ontological_instantiation`, `parallel_structural_transmission`).
- **Explore Cue Extraction & Trailing Numeral Normalization: DOCUMENTED DISCREPANCY.**
  - **Python Oracle Behavior:** Original `projective.py` applies a secondary normalization pass:
    ```python
    token = re.sub(r"\s+(?:[IVXLCDM]+|\d+)(?:\.\d+)*$", "", token, flags=re.I)
    ```
    This stripped the trailing Roman numeral/ordinal `IV.2` from `"Beta Exploration Series IV.2."`, returning `"Beta Exploration Series"`.
  - **JavaScript Candidate Behavior:** The JavaScript regex captured `"Beta Exploration Series IV"`, failing to strip the chapter/series ordinal.
  - **Scientific Consequence:** Preserved as a first-class behavioral mismatch. The Python behavior is authoritative for PR #1683 fidelity.
- **Lexical Candidate Resolution: EQUIVALENT WITH SCHEMA TRANSLATION.**
  - Both runtimes resolved candidate links for 1001->1002, 1001->1003, 1002->1004, and 1003->1001 with identical temporal classifications (`LATER` vs `PREEXISTING_OR_CONTEMPORANEOUS`).
  - Python structures candidates within rich `explore_observations` records (`observation_status: LATER_EXACT_RESOLUTION_CANDIDATE`), whereas JavaScript returns flat `links` records.

#### 2. Domain 2: Phase-2 Tomography
- **Scope Deltas: EXACT MATCH.** Both runtimes faithfully classified `NARROWED`, `EXPANDED`, and `UNKNOWN` scope deltas under `delta_scope`.
- **Refusal of Scalar Epistemic Score: EXACT MATCH.** Both Python and JavaScript strictly enforced `composite_score: null` / `None`, refusing scalar collapse of multi-dimensional epistemic evidence.
- **Evidence Delta Custody: EXACT MATCH.** Both runtimes enforced `delta_evidence: UNKNOWN` in the absence of verified empirical external evidence.

#### 3. Domain 3: Contextual Roles
- **Compiler Scoping: EXACT MATCH.** Entity `ent:alpha` held `COMPILER_SOURCE` under pass 1 and `TRANSFORMATION_TARGET` under pass 2. Both runtimes preserved distinct roles across passes.
- **Prohibition of Intrinsic Promotion: EXACT MATCH.** Both runtimes enforced `intrinsic_role_promotion: false`.

#### 4. Domain 4: Native Query Operations
- **Epoch Seal Binding: EXACT MATCH.** Both runtimes accepted valid epoch (`src-20260824-p2-001`, `src-seal:eaf744ce...`) and rejected mismatched epoch with typed `CROSS_EPOCH_REFUSED`.
- **Trace Operations: EXACT MATCH.** Both runtimes returned witnessed hops and explicitly declared missing intermediates (`missing_hop_declared: true`) without inventing speculative joins.

---

### III. Summary of Differential Matrix

| Evaluation Test | Domain | Status | Parity Qualification |
| :--- | :--- | :--- | :--- |
| `13_FIELD_MARKERS_CENSUS` | Projective Routing | **EXACT MATCH** | 100% matched across 13 literal markers |
| `EXPLORE_CUE_EXTRACTION` | Projective Routing | **DOCUMENTED DISCREPANCY** | Python strips ordinals (`IV.2`); JS retains |
| `CANDIDATE_LINK_RESOLUTION`| Projective Routing | **EQUIVALENT W/ TRANSLATION** | Identical links; schema translation |
| `SCOPE_DELTAS_SCALAR_REFUSAL` | Tomography | **EXACT MATCH** | Exact delta match; `composite_score: null` |
| `CONTEXTUAL_ROLES` | Contextual Roles | **EXACT MATCH** | Multi-role preserved; intrinsic promotion false |
| `EPOCH_SEAL_TRACE` | Native Query | **EXACT MATCH** | Cross-epoch refused; explicit missing hops |

**Exit Condition Satisfied:** An independently executable Python-versus-JavaScript differential suite is established with an immutable coverage matrix, source pins, and documented behavioral discrepancies.
