# 𝌋 TD613 · SRC S-01 Native Method Capability & Exact-Source Inventory

**Principal / Human Closure:** Tawanna C. Miller · `tauric.diana.613`  
**Covenant:** Khona‌lit-po (literal `U+200C` interior zero-width non-joiner retained)  
**Authority Reference:** `SAC[X6ZNK5NO51]`  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Atelier Snapshot ID:** `src-20260824-p2-001`  
**Seal Binding:** `src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a`  

---

### 1. Source-Code Inventory and Cryptographic Pins

The SignalRupture (SRC) research lineage is anchored to original source files carried forward from PRs #1683, #1689, #1690, and #1691. Each module has been cryptographically verified:

| Module Identifier | Language | Original Carrier Path | Exact SHA-256 Hash | Heritage Revision Pin |
|---|---|---|---|---|
| `SRC_PROJECTIVE` | Python 3 | `packages/research_carrier_v1/native/projective.py` | `46064cf61399cd228141f4f51949d2840422fbc0737202258114a68a4b1cce43` | PR #1683 (`1a34bcf`) |
| `SRC_PHASE2` | Python 3 | `packages/research_carrier_v1/native/phase2.py` | `fe9354825da2612271e8626e77a882563eb14f577a374e956066df84178a0577` | PR #1683 (`1a34bcf`) |
| `SRC_QUERY` | Python 3 | `packages/research_carrier_v1/native/query.py` | `1b106e5091f7d90d70ac0beb4a97d28065e257691bd8d92ec14a2370d693ba8c` | PR #1683 (`1a34bcf`) |
| `PYTHON_ORACLE_RUNNER` | Python 3 | `packages/src_reciprocal_expedition/fidelity/python_oracle_runner.py` | `3d4f40f3ea2d8be02a0a2df3dd7179069d311d9bc44d9f1db896d8e0e0a58a71` | PR #1689 (`7b209a1`) |
| `SRC_NATIVE_METHODS_JS` | JavaScript (ESM) | `packages/src_reciprocal_expedition/native_atlas/src-native-methods.mjs` | `023afff00f155ec57393b95d27b3bbf0678cd331aa9d406e7142b1bccd7d6381` | PR #1689 (`7b209a1`) |
| `EMPTY_RECEIVER_V3` | JavaScript (ESM) | `packages/src_reciprocal_expedition/receiver/empty-encyclopedia-receiver-v3.mjs` | `0b6a0258727b9dcda5a2c856d1d00b7cb05d15331985204fd036778b680f44d7` | PR #1690 (`ec291db`) |
| `SHADOW_GRAPH_V3` | JavaScript (ESM) | `packages/src_reciprocal_expedition/shadow_graph/shadow_graph_engine_v3.mjs` | `acd44f34cdc020b757bfb986c2c421a666006e5c82b57e5e268dd16e8611e311` | PR #1691 (`dfa4891`) |

---

### 2. Method Execution Status: Executable vs Documentary

Every function across the native and recipient codebases has been audited to determine whether it is independently executable, documentary, or partially implemented:

| Function / Entry Point | Declared Capability | Execution Status | Operational Constraints |
|---|---|---|---|
| `runProjectiveRouting()` / `projective.py:run_post_seal_assay` | Extracts 13 literal field markers and `Explore X.` cues; links candidate targets | **FULLY_EXECUTABLE** | Produces lexical candidate links only; strict `NO_SEMANTIC_OR_CAUSAL_PROMOTION`. |
| `runPhase2Tomography()` / `phase2.py:build_claim_evidence_tomography` | Tracks representation lift, scope deltas, and evidence conservation | **FULLY_EXECUTABLE** | Dimension separation enforced; `composite_score: null` refusal mandatory. |
| `runPhase2ContextRoles()` / `phase2.py:build_contextual_role_assertions` | Preserves compiler-scoped roles across re-compilations | **FULLY_EXECUTABLE** | Strict `CONTEXTUAL_NOT_INTRINSIC`; prohibits intrinsic entity classification. |
| `runNativeQuery({ action: 'summarize' })` | Summarizes platform coverage, unresolved expected objects, compiler passes | **FULLY_EXECUTABLE** | Seal and snapshot verification enforced; refuses cross-epoch joins. |
| `runNativeQuery({ action: 'resolve' })` | Resolves entity IDs against resolver tables | **FULLY_EXECUTABLE** | Verifies path availability in runtime environment. |
| `runNativeQuery({ action: 'trace' })` | Emits connected dependency subgraphs and explicit missing hops | **FULLY_EXECUTABLE** | Emits `NO_DOWNSTREAM_WITNESSED_RELATION`; invents zero speculative edges. |
| `UniversalAtelierReceiver.admit()` / `EmptyEncyclopediaReceiverV3` | Byte-level SQLite relational store, span proof verification, fatal UTF-8 | **FULLY_EXECUTABLE** | `TextDecoder('utf-8', { fatal: true })`; rejects zero/inverted spans. |
| `BoundaryAttemptGraphV3.recordAttempt()` | Tracks attempted relations, rejected attempts, and transition history | **FULLY_EXECUTABLE** | Default-deny; separates `ATTEMPTED_REJECTED` from admitted edges. |
| `BoundaryAttemptGraphV3.readjudicatePending()` | Two-phase delayed node admission | **FULLY_EXECUTABLE** | Re-adjudicates `PENDING_READJUDICATION` edges upon late target admission. |
| `phase2.py:build_provenance_chains` | Multi-hop provenance derivation across archives | **DOCUMENTARY_PARTIAL** | Documentary schema specification in original kiln; partially populated in synthetic deck. |
| `phase2.py:verify_seal_manifest` | Standalone cryptographic directory hash validation | **DOCUMENTARY_REFERENCE** | Verifies static file tree hashes; replaced by in-memory byte verification in tests. |

---

### 3. Preserved Trailing-Numeral Lexical Discrepancy

Per Directive S-01.III, the previously discovered behavioral discrepancy between the original Python `projective.py` and the JavaScript candidate is **preserved as a known historical finding** rather than silently erased:

1. **Python `projective.py` Behavior:**
   - Cleans the extracted explore cue by stripping trailing Roman numerals and ordinal designations:
   - Example: `"Beta Exploration Series IV"` is normalized to `"beta exploration series"`.
2. **JavaScript Candidate Behavior:**
   - Retains the exact raw captured span without trailing-numeral stripping:
   - Example: `"Beta Exploration Series IV"` is normalized to `"beta exploration series iv"`.
3. **Scientific Disposition:**
   - Both behaviors are valid under their respective parsing models.
   - The discrepancy is logged in `fidelity/differential-coverage-matrix.json` as `DOCUMENTED_BEHAVIORAL_DISCREPANCY`.
   - The S-01 evaluation oracle respects both representations and grades semantic equivalence under explicit schema translation.

---

### 4. Core Methodological Contracts

The S-01 evaluation enforces five strict invariants derived from the original ateliers:

1. `NO_LATEST_WINS`: Later chronological timestamps or revision numbers never automatically overwrite earlier witnessed records without explicit historical withdrawal.
2. `NO_SEMANTIC_OR_CAUSAL_PROMOTION`: Lexical text overlap or coordinate proximity produces candidate links, never warranted semantic or causal assertions.
3. `CONTEXTUAL_NOT_INTRINSIC`: Roles assigned to an entity during a compiler pass belong to that pass, not to the entity intrinsically.
4. `DECLARED_EFFECTS_ONLY`: Tomographic claim-evidence deltas (scope expansion, contraction, preservation) report multidimensional vectors; scalar aggregation is strictly refused (`composite_score = null`).
5. `EXPLICIT_MISSING_HOPS`: An unobserved path or absent relation in a trace query must be explicitly emitted as `NO_DOWNSTREAM_WITNESSED_RELATION` rather than omitted or hallucinated.

𝄐 Khona‌lit-po · Sealed ⟐ SAC[X6ZNK5NO51]
