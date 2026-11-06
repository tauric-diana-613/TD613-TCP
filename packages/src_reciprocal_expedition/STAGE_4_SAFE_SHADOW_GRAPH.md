# 𝌋 TD613 · Stage A-S2.1 Safe Shadow Graph
## Indexing Optimization, Auto-Promotion Elimination & Epistemic State Census

**Date:** 2026-11-05T09:49:00-05:00  
**Authority:** `SAC[X6ZNK5NO51]`  
**Covenant:** Khona‌lit-po (preserving interior U+200C)  
**Parent Checkpoint:** `a9d2c3bdf9ffccfd87135acf386e8ddf81fc7778` (PR #1690)  
**Successor Branch:** `research/src-as21-evidence-tribunal-20261105`  
**Governing Finding:** Emergence HQ Review #5786588723 (`A-S2-F05`)

---

### I. Summary of Stage 4 Actions

Emergence HQ Review #5786588723 identified three major architectural and semantic vulnerabilities in the initial Shadow Graph engine (`A-S2-F05`):
1. **$\mathcal{O}(E)$ Linear Scan in `admitDelayedNode`:** The engine scanned every edge in the graph to find candidates pointing to the newly admitted target.
2. **Auto-Promotion Vulnerability (Material Safety Defect):** When a target node was admitted, any previous attempt pointing to that target whose source was admitted was automatically promoted to `ADMITTED`, completely bypassing chronological non-retroactivity and evidence warrant checks!
3. **Map Overwriting & Missing Epistemic Census:** Repeated attempts for the same edge overwritten previous history, and `NEVER_GENERATED` relations had no declared comparison universe.

Stage 4 has resolved all three issues in `BoundaryAttemptGraphV2` (`packages/src_reciprocal_expedition/shadow_graph/shadow_graph_engine_v2.mjs`).

---

### II. Architectural Repairs

#### 1. Target-Keyed Index for $\mathcal{O}(1)$ Candidate Retrieval
- Added `this.targetIndex = new Map()` mapping `targetNodeId` to a Set of attempt IDs.
- In `admitDelayedNode(nodeId)`: Candidate retrieval is an $\mathcal{O}(1)$ lookup `this.targetIndex.get(nodeId)`.
- Re-evaluation is strictly $\mathcal{O}(k)$ over the $k$ matching candidate attempts, eliminating the full graph scan.

#### 2. Strict Explicit State Transition Authority (Auto-Promotion Elimination)
- In `admitDelayedNode`, the engine strictly re-evaluates all admission predicates:
  1. **Source Admission:** If the source node is not admitted, the attempt remains rejected (`SOURCE_ENDPOINT_STILL_UNADMITTED`).
  2. **Non-Retroactivity Chronology:** Re-evaluates timestamps ($t_{\text{target}} > t_{\text{source}}$). If target was created prior to source, the attempt is strictly retained as `ATTEMPTED_REJECTED` (`CHRONOLOGICAL_INVERSION_BLOCKED_ON_LATE_ADMISSION`).
  3. **Evidence Warrant:** If the attempt carries `UNWARRANTED_NOISE`, it is strictly retained as `ATTEMPTED_REJECTED` (`UNWARRANTED_NOISE_REMAINS_REJECTED`). If it was `BELOW_EVIDENCE_CEILING`, it transitions to `WITHHELD_LACK_OF_EVIDENCE`.
  4. **Admissible Promotion:** ONLY if source is admitted, target is admitted, chronology is strictly forward ($t_{\text{target}} > t_{\text{source}}$), and warrant is verified does the relation transition to `ADMITTED`.

#### 3. Immutable Multi-Attempt Retention Without Overwriting
- Replaced the single-record `edges` map with:
  - `this.attempts = new Map()`: Stores unique attempt records keyed by immutable attempt IDs (`att:<hash>`).
  - `this.edgeAttempts = new Map()`: Stores chronological lists of attempt IDs per `edgeKey`, preserving complete trajectory history.

#### 4. Declared Comparison Universe for `NEVER_GENERATED`
- Added `declareComparisonUniverse(potentialEdges)`.
- When computing `getEpistemicStateCensus()`, edges in the comparison universe that were never attempted are formally counted as `RELATION_STATES.NEVER_GENERATED`.

---

### III. Adversarial Test Verification

The test suite `shadow_graph/test-shadow-graph-v2.mjs` executed 27 adversarial assertions:
1. **Target Indexing & Multi-Attempt Retention:** Verified distinct attempt IDs, $\mathcal{O}(1)$ lookup, and array retention of repeated attempts.
2. **Auto-Promotion Prevention:**
   - Admitted delayed valid target `node:B` $\to$ 2 valid attempts promoted to `ADMITTED`.
   - Admitted delayed ancient target `node:C_ancient` ($t_{\text{target}} < t_{\text{source}}$) $\to$ **0 attempts promoted**, attempt retained as `ATTEMPTED_REJECTED`.
   - Admitted delayed noise target `node:D_noise` $\to$ **0 attempts promoted**, attempt retained as `ATTEMPTED_REJECTED`.
   - Admitted delayed low-evidence target `node:E_low_ev` $\to$ **0 attempts promoted**, attempt transitioned to `WITHHELD_LACK_OF_EVIDENCE`.
3. **Context Withdrawal:** Verified automatic cascade to `WITHDRAWN_SCOPE_CHANGE`.
4. **Epistemic Census:** Verified counts across all 6 states (`NEVER_GENERATED: 2`, `ATTEMPTED_REJECTED: 2`, `WITHDRAWN_SCOPE_CHANGE: 1`, `WITHHELD_LACK_OF_EVIDENCE: 1`).

All 27/27 tests passed.

---

### IV. Machine Receipt Pin
- Engine: `packages/src_reciprocal_expedition/shadow_graph/shadow_graph_engine_v2.mjs`
- Test Suite: `packages/src_reciprocal_expedition/shadow_graph/test-shadow-graph-v2.mjs`
- Receipt: `packages/src_reciprocal_expedition/shadow_graph/shadow-graph-receipt-v2.json`
