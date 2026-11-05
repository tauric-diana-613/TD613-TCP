# 𝌋 TD613 · Stage A-S2.1 Native Python Oracle Completion
## Authentic Execution of Original SRC Python Modules (PR #1683 Pins)

**Date:** 2026-11-05T09:47:00-05:00  
**Authority:** `SAC[X6ZNK5NO51]`  
**Covenant:** Khona‌lit-po (preserving interior U+200C)  
**Parent Checkpoint:** `a9d2c3bdf9ffccfd87135acf386e8ddf81fc7778` (PR #1690)  
**Successor Branch:** `research/src-as21-evidence-tribunal-20261105`  
**Governing Finding:** Emergence HQ Review #5786588723 (`A-S2-F04`)

---

### I. Summary of Stage 3 Actions

Emergence HQ Review #5786588723 identified that the Stage A-S2 Python oracle was incomplete:
> **A-S2-F04 · PARTIAL PYTHON ORACLE.** Only `projective` actually executed the pinned original Python code (`projective.py`). For `tomography`, `roles`, and `query`, `python_oracle_runner.py` called *zero* functions from `phase2.py` or `query.py`, merely constructing mock dicts.

Stage 3 has eliminated all mock dictionaries from `python_oracle_runner.py` and connected authentic function calls to the pinned Python implementations in `packages/research_carrier_v1/native/`:
- `projective.py`: `FIELD_MARKERS`, `extract_explore_tokens`, `explore_observations`
- `phase2.py`: `conservation_and_tomography`, `contextual_roles_and_compilers`, `write_rows`
- `query.py`: `epoch`, `trace`, `resolve`

---

### II. Authentic Implementation Architecture

`python_oracle_runner.py` dynamically provisions an isolated temporary kiln fixture on the host with authentic Phase 2 directory and manifest layouts:
1. **Domain 1 (Projective Routing):**
   - Calls `projective.extract_explore_tokens(doc)` and `projective.explore_observations(docs)`.
   - Executes original Python trailing-numeral stripping regex and multi-hop candidate classifiers.
2. **Domain 2 (Phase 2 Tomography):**
   - Constructs `05-OPERATIONS/relations/representation-lift-candidates.jsonl` containing the test lift cases.
   - Calls authentic `phase2.conservation_and_tomography(temp_root, snapshot)`.
   - Validates that `delta_scope` matches, `delta_evidence` is strictly `'UNKNOWN'`, and `composite_score` is strictly `None` (prohibition of scalar collapse).
3. **Domain 3 (Contextual Roles):**
   - Constructs `05-OPERATIONS/relations/recompilation-edges.jsonl`.
   - Calls authentic `phase2.contextual_roles_and_compilers(temp_root, snapshot)`.
   - Validates multi-role entity preservation across distinct compiler passes and enforcement of non-intrinsic role promotion.
4. **Domain 4 (Native Query Operations):**
   - Provisions `04-RECEIPTS/phase2/current-seal.json`, `04-RECEIPTS/phase2/seal-manifest.json`, `01-MANIFESTS/entity-index.jsonl`, `01-MANIFESTS/phase2/entity-resolver-v2.jsonl`, and `01-MANIFESTS/phase2/capture-v2.jsonl`.
   - Calls authentic `query.epoch(temp_root, requested_snapshot, requested_seal)`, capturing `SystemExit` on cross-epoch attempts.
   - Calls authentic `query.trace(temp_root, start_entity)`, capturing witnessed hops and authentic `missing_hops` declarations without speculative joins.

---

### III. Differential Execution Verification

The differential comparison suite (`run-differential-comparison.mjs`) was executed via `uv run python` and Node.js.
Output matrix recorded in `packages/src_reciprocal_expedition/fidelity/differential-coverage-matrix.json`:

- **Domain 1 (Field Markers):** `EXACT_MATCH` (9/9 hits, 13 markers evaluated).
- **Domain 1 (Cue Extraction):** `DOCUMENTED_BEHAVIORAL_DISCREPANCY` (Original Python explicitly strips roman numerals e.g. `IV.2 -> Series`; JS regex preserved raw token. Documented as authentic historical evidence).
- **Domain 1 (Candidate Links):** `EQUIVALENT_WITH_SCHEMA_TRANSLATION` (Python structured observations vs. JS flat links; 4/4 links match).
- **Domain 2 (Tomography):** `EXACT_MATCH` (3/3 cases match; strict scalar composite refusal verified).
- **Domain 3 (Contextual Roles):** `EXACT_MATCH` (3/3 role assertions match; intrinsic role promotion refused).
- **Domain 4 (Native Query):** `EXACT_MATCH` (4/4 query cases match; cross-epoch refusal and missing hops verified).

**Summary:** 4 EXACT MATCHES, 1 EQUIVALENT WITH TRANSLATIONS, 1 DOCUMENTED DISCREPANCY, 0 UNRESOLVED.
