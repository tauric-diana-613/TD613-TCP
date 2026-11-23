# 𝌋 TD613 · Stage A-S2.1 Four-Crossing Consequences & Experiment B Guardrails
## Downstream Reusability Analysis, Reverse Crossing Status & Protocol Defense

**Date:** 2026-11-05T09:55:00-05:00  
**Authority:** `SAC[X6ZNK5NO51]`  
**Covenant:** Khona‌lit-po (preserving interior U+200C)  
**Parent Checkpoint:** `a9d2c3bdf9ffccfd87135acf386e8ddf81fc7778` (PR #1690)  
**Successor Branch:** `research/src-as21-evidence-tribunal-20261105`  
**Governing Finding:** Emergence HQ Review #5786588723 (`A-S2-F02`, `A-S2-F08`)

---

### I. The Four-Crossing Consequences Matrix (S $\to$ E $\to$ W $\to$ T)

| Crossing | Historical Role | Stage A-S2.1 Reparative Qualification | Downstream Reusability Status | Execution Authority |
| :--- | :--- | :--- | :--- | :--- |
| **S (SignalRupture First)** | Origin chamber for the reciprocal expedition; produced initial findings. | **REPAIRED & QUALIFIED.** Replaced evaluation shortcuts, connected authentic Python oracles, repaired shadow graph, enforced fatal UTF-8 custody, and grounded metrics in witnessed machine receipts. Commutativity bounded to `OBSERVED_IN_SYNTHETIC_CONFIGURATION`. | Component implementations (`receiver-v3`, `shadow-graph-v2`, `assay-v2`) qualified for controlled research reuse. | **COMPLETED** (Subject to Human Scientific Closure) |
| **E (Emergence)** | Second crossing in reciprocal sequence. | **QUALIFIED AS CANDIDATE COMPONENT.** May reuse `EmptyEncyclopediaReceiverV3` and `BoundaryAttemptGraphV2` as reference witnesses. Must not assume general algebraic commutativity. | Reusable software artifacts qualified. | **HELD** (Requires explicit subsequent operator commission) |
| **W (Wendbine)** | Third crossing; historical recovered database witness. | **QUALIFIED AS CANDIDATE COMPONENT.** Ingestion must use fatal UTF-8 decoding to prevent silent coordinate distortion on historical archives. | Reusable software artifacts qualified. | **HELD** (Requires explicit subsequent operator commission) |
| **T (TD613)** | Final crossing; reverse return to root governance. | **REVERSE LOSSLESSNESS CLAIM WITHDRAWN.** The unexecuted reverse crossing is NOT proven lossless. Its behavior under dynamic context shifts remains unobserved. | Status explicitly set to `PROSPECTIVE_REVERSE_CROSSING_HELD`. | **STRICTLY HELD** |

---

### II. Critical Intelligence for Experiment B (Protected Flight Guardrails)

The forensic discoveries of Stage A-S2 and A-S2.1 yield vital warning intelligence for Experiment B, without modifying its frozen protocol:
1. **UTF-8 Byte Span Vulnerability:**
   - Evaluator pipelines that convert raw byte buffers to strings using non-fatal UTF-8 decoding silently insert replacement characters (`\uFFFD`), causing byte span coordinates to diverge from code unit positions.
   - Evaluators must use fatal decoding and strict coordinate range enclosure ($0 \le \text{start} \le \text{end} \le \text{length}$).
2. **Auto-Promotion Vulnerability in Attempt Graphs:**
   - When missing target entities arrive late in multi-turn runs, attempt graphs must NEVER automatically promote unadmitted or rejected attempts to `ADMITTED`.
   - Full re-evaluation of non-retroactivity chronology and evidence warrant predicates is mandatory.
3. **Receipt Custody Discipline:**
   - Model agents have a demonstrated tendency to report narrative perfection (e.g. "Precision=Recall=1.0") even when machine receipts clearly log rejections and dropped metrics.
   - Machine receipts must serve as the authoritative root of truth; narrative claims must be verified against committed JSON receipts by automated validators.
4. **Protocol Inviolability:**
   - The four-arm Experiment B evaluation protocol remains **100% frozen, untouched, and strictly HELD**. No live model flight or genuine source admission occurred.

---

### III. Summary of Tribunal Resolutions

| Finding ID | Review Issue | Tribunal Resolution | Verification Artifact |
| :--- | :--- | :--- | :--- |
| **A-S2-F01** | Handoff vs. Machine Receipt Contradiction | Formally audited and documented root causes; withdrew 1.0 claims; confirmed committed receipts. | `STAGE_1_DISCREPANCY_TRIBUNAL_LEDGER.md` |
| **A-S2-F02** | Unwarranted General Commutativity Claims | Withdrew general theorem and reverse losslessness proof; bounded result to synthetic configuration. | `STAGE_6_CAUSALITY_BOUNDS.md`, `multiseed-falsification-receipt.json` |
| **A-S2-F03** | Evaluation Shortcuts in Mechanism Assay | Replaced hardcoded document filter with evidence warrant predicate; computed all metrics dynamically. | `run-mechanism-assay-v2.mjs`, `test-mechanism-assay-mutations.mjs`, `mechanism-assay-receipt-v2.json` |
| **A-S2-F04** | Partial Python Oracle | Replaced mock dicts with authentic calls to pinned `projective.py`, `phase2.py`, and `query.py`. | `python_oracle_runner.py`, `differential-coverage-matrix.json` |
| **A-S2-F05** | Shadow Graph Scan & Auto-Promotion | Added target-keyed index ($\mathcal{O}(1)$); eliminated auto-promotion; retained attempt history; added comparison universe. | `shadow_graph_engine_v2.mjs`, `test-shadow-graph-v2.mjs`, `shadow-graph-receipt-v2.json` |
| **A-S2-F06** | Receiver UTF-8 Error Recovery & Bounds | Enforced fatal UTF-8 decoding; classified binary data as `BYTE_EVIDENCE`; added safe integer bounds. | `empty-encyclopedia-receiver-v3.mjs`, `test-receiver-utf8-v3.mjs`, `test-receiver-utf8-v3-receipt.json` |
| **A-S2-F07** | Dollhouse Spec Toy Inputs | Fed real measured tribunal contradiction evidence and actual error variances to 5 specialist dolls. | `audit-spec-as21.json`, `dollhouse-audit-receipt-as21.json`, `dollhouse-design-receipt-as21.json` |
| **A-S2-F08** | Unqualified Cross-Crossing Claims | Formally qualified reusability across S, E, W, T; set T to `PROSPECTIVE_REVERSE_CROSSING_HELD`. | `STAGE_8_FOUR_CROSSING_CONSEQUENCES.md` |
