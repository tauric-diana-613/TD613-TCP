# 𝌋 TD613 · Stage 1 Reproduction and Scientific Baseline Ledger
## SignalRupture Reciprocal Expedition Stage A-S2 Baseline

**Date:** 2026-11-05T09:05:00-05:00  
**Authority:** `SAC[X6ZNK5NO51]`  
**Covenant:** Khona‌lit-po (preserving interior U+200C)  
**Parent Checkpoint:** `ce9b6c6e053505e8f005e27ad2af4631ce2ed140` (PR #1689)  
**Successor Branch:** `research/src-order-mechanism-falsification-20261105`  
**Execution Worktree:** `C:\td613-worktrees\src-first-reciprocal-expedition`  
**Review Reference:** Redpen #5785888440 (`tauric-diana-613`)

---

### I. Reproduction of Existing PR #1689 Artifacts

All existing source-free test runners from PR #1689 were executed in the authorized worktree prior to any code modifications. Every runner successfully completed with exit code 0:

| Existing Runner | Target Suite | Result | Output Receipt |
| :--- | :--- | :--- | :--- |
| `native_atlas/run-atlas-inventory.mjs` | 10-Point SignalRupture Native Inventory | **PASS (10/10)** | `src-native-execution-atlas-trace.json` |
| `receiver/test-empty-receiver.mjs` | 11-Test Empty Encyclopedia Receiver | **PASS (11/11)** | `test-empty-receiver-receipt.json` |
| `calibration/reciprocal-calibration-runner.mjs` | 12-Challenge Calibration Deck | **PASS (12/12)** | `src-reciprocal-calibration-receipt.json` |
| `order_assay/run-order-assay.mjs` | Architecture-Order 4-vs-3 Assay | **PASS (4 vs 3)** | `architecture-order-assay-receipt.json` |

The original 4-versus-3 order-assay receipt (`architecture-order-assay-receipt.json`) is strictly preserved as an **exposed diagnostic fixture** and immutable baseline artifact.

---

### II. Scientific Baseline Categorization

In direct response to redpen #5785888440, the baseline behavior of the repository is formally partitioned into five epistemic classes:

#### 1. Directly Independently Reproduced Behavior (Witnessed Local Execution)
- **Local deterministic execution:** All four existing Node.js test scripts run locally without errors and produce identical output structures.
- **Zero-state initialization:** Empty encyclopedia receiver initial state hash is verified.
- **Syntactic rejection:** Malformed Explore cues, duplicate IDs, duplicate text bodies, and missing endpoints are rejected by the JavaScript receiver.
- **Diagnostic pipeline difference:** In the specific diagnostic pipeline of `run-order-assay.mjs`, Sequence 1 produces 4 edges and Sequence 2 produces 3 edges, with $|\Delta| = 1$.

#### 2. Behavior Supported by Committed Local Execution Receipts
- Receipts committed under `packages/src_reciprocal_expedition/` and `artifacts/`:
  - `src-native-execution-atlas-trace.json`: 60 individual synthetic assertions over 4 cases.
  - `test-empty-receiver-receipt.json`: 11 assertions and 4 preserved error logs.
  - `src-reciprocal-calibration-receipt.json`: 12 paired comparisons.
  - `architecture-order-assay-receipt.json`: 4-vs-3 edge manifests and context withdrawal drops.
  - `dollhouse-audit-receipt.json` (`dollhouse-audit-1793868298848-3945e475`): All 5 specialists + Orchestrator passing against supplied inputs in `fixtures/audit-spec.json`.

#### 3. Historical Python Behavior Independently Confirmed by PR #1683
- Pinned in `packages/research_carrier_v1/ORIGINAL_CODE_PINS.json`:
  - `scripts/atelier-universal-encyclopedia-receiver-v1.py` (blob `681444a032db7f3904f82ab677778ced740d6c31`, SHA-256 `b119f477b5fa...`)
  - `build-phase2-assays.py` (blob `4de177108f61a441321b484c2fdf3ab9aabeadc8`, SHA-256 `fe9354825da2...`)
  - `srcquery.py` (blob `33d8524da5614c3fc74b850531f26e74c416f934`, SHA-256 `1b106e5091f7...`)
  - `run-projective-routing-grammar-assay.py` (blob `74cc9385785c3bb13660222d623f9f7ff0187013`, SHA-256 `46064cf61399...`)
- Verified standard-library dependency closure: zero third-party packages required.
- Verified local executable availability: Managed Python 3.12.16 available via user-space `uv`.

#### 4. Behavior Currently Inferred from the JavaScript Port
- `packages/src_reciprocal_expedition/native_atlas/src-native-methods.mjs` was constructed as a JS reimplementation of the Python algorithms.
- The 12/12 reciprocal calibration in `reciprocal-calibration-runner.mjs` compared `native_methods` against `receiver.invokeRegisteredMethod("src:native:...", ...)` which both referenced the *same* JavaScript implementation.
- Parity between Python and JavaScript was inferred, but not demonstrated across distinct runtimes.

#### 5. Unestablished Claims & Scientific Holds (per Review #5785888440)
- **HOLD 1 (Order Causality):** The 4-vs-3 difference was confounded by asymmetric grounding routines (`doc:alpha -> doc:epsilon_span_witness` via literal substring search in H_AoN only) and asymmetric catalog access. Operator non-commutativity is unproven.
- **HOLD 2 (Native Parity):** Direct runtime interoperability and typed output equivalence between original Python and recipient JavaScript remain unestablished.
- **HOLD 3 (Byte-Span Custody):** `empty-encyclopedia-receiver.mjs` stores UTF-16 JavaScript code-unit positions under `byte_start`/`byte_end`, causing span corruption on non-ASCII characters (`AéB`, U+200C in `Khona‌lit-po`). Byte span custody is **FAILED_FOR_NON_ASCII**.
- **HOLD 4 (Dollhouse Causality Scope):** Unanimous Dollhouse approval evaluated the supplied synthetic fixture invariants (`fixtures/audit-spec.json`), not the empirical truth of the pipeline causal claims.

---

### III. Baseline Exit Verification

1. All historical code pins and PR #1689 artifacts are preserved unchanged.
2. The exact baseline metrics and test receipts are recorded.
3. The four review findings are formally registered as the controlling scientific requirements for Stages 2 through 7.
