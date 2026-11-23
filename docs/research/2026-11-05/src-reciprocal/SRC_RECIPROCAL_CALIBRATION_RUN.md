# 𝌋 TD613 · SRC RECIPROCAL CALIBRATION RUN

**Commission:** EXPERIMENT A RE-DO — SIGNALRUPTURE FIRST: THE RECIPROCAL RESEARCH EXPEDITION  
**Authorization reference:** `SAC[X6ZNK5NO51]`  
**Principal:** Tawanna C. Miller  
**Operator:** `tauric.diana.613`  
**Heritage:** Tauric Diana — Crimean heritage custodianship  
**Covenant:** Khona‌lit-po — preserve interior U+200C  
**Executing environment:** Antigravity Main Agent · Gemini 3.8 Flash High · Node.js v26.7.0  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Worktree:** `C:\td613-worktrees\src-first-reciprocal-expedition`  
**Branch:** `research/src-reciprocal-expedition-20261105`  
**HEAD:** `3bad9aade0d90e6786ea7df11cae962ec3bc4726`  
**Deck:** `packages/src_reciprocal_expedition/calibration/reciprocal-calibration-deck.json`  
**Runner:** `packages/src_reciprocal_expedition/calibration/reciprocal-calibration-runner.mjs`  
**Receipt:** `packages/src_reciprocal_expedition/calibration/src-reciprocal-calibration-receipt.json`  
**Status:** OPENLY SUPERVISED SOFTWARE & RESEARCH-METHOD CALIBRATION ONLY · NOT A BLINDED FLIGHT  

---

## I. Epistemic Posture & Isolation Boundary

Because AG-01 and AG-01.1 established that the active local Windows environment lacks verified worker isolation (`AG011_NATIVE_ISOLATION_HELD_WITH_SPECIFIC_BLOCKERS`), this calibration is explicitly characterized as an **openly supervised software and research-method calibration**.

It does **not** claim to be an independent, blinded model Flight. It tests the computational transfer, mathematical parity, and refusal enforcement between the authentic SignalRupture Atelier native methods and the newly developed Empty Encyclopedia Receiver.

---

## II. The 12-Challenge Calibration Deck

The calibration deck exercises both positive capabilities and necessary negative refusals across 12 distinct scientific challenges:

| # | Challenge Identifier | Method Category | Invariant & Challenge Purpose |
| :--- | :--- | :--- | :--- |
| **01** | `CHALLENGE_01_VALID_EXPLORE_CUE` | Projective Routing | Well-formed `Explore X.` cue detection, title matching, and `LATER` temporal ordering. |
| **02** | `CHALLENGE_02_MALFORMED_EXPLORE_CUE` | Projective Routing | Cue without period or exceeding length must be refused (0 cues detected). |
| **03** | `CHALLENGE_03_PROJECTIVE_PATH_RESOLUTION` | Projective Routing | Substring and exact title normalization produces candidate links without causal promotion. |
| **04** | `CHALLENGE_04_CHRONOLOGICAL_INVALIDATION` | Temporal Ordering | Target created prior to source must be marked `PREEXISTING` (downstream causality blocked). |
| **05** | `CHALLENGE_05_CONTRADICTORY_PROPOSITIONS` | Epistemic Tomography | Opposing claim effects on same transform preserved as separate rows without synthetic collapse. |
| **06** | `CHALLENGE_06_ALTERNATIVE_CONTEXTUAL_ROLES` | Contextual Roles | Same entity holds distinct roles across separate compilers; intrinsic essence rejected. |
| **07** | `CHALLENGE_07_CONTEXT_WITHDRAWAL` | Source Withdrawal | Withdrawing a target node breaks projective links cleanly; phantom links prohibited. |
| **08** | `CHALLENGE_08_EQUIVALENT_TEXT_DISTINCT_SOURCES` | Evidence Lineage | Identical normalized body text prevents independence claim and blocks ancestral promotion. |
| **09** | `CHALLENGE_09_UNSUPPORTED_INTERMEDIATE_LINK` | Graph Topology | Unwitnessed intermediate path node explicitly flagged via `missing_hops` (no invented joins). |
| **10** | `CHALLENGE_10_MISSING_ENDPOINT_RELATION` | Relation Registration| Relation referencing unadmitted target rejected with typed `UNSUPPORTED_GRAPH_LINK`. |
| **11** | `CHALLENGE_11_NULL_UNKNOWN_EVIDENCE` | Epistemic Tomography | Indeterminate claim scope preserved as `UNKNOWN` and composite score strictly `null`. |
| **12** | `CHALLENGE_12_IMPOSSIBLE_REQUEST_WRONG_SEAL` | Native Query | Query requesting mismatched epoch seal refused with typed `REFUSED` error. |

---

## III. Side-by-Side Execution Results

Every challenge was executed independently through both pathways:
1. **Origin Pathway:** Direct execution of authentic SRC native methods (`runProjectiveRouting`, `runPhase2Tomography`, `runPhase2ContextRoles`, `runNativeQuery`).
2. **Recipient Pathway:** Fresh in-memory Encyclopedia Receiver initialized with attested 0-state -> source admission -> registered method invocation -> readback -> return package.

### Summary Comparison Table

| Challenge ID | Origin Outcome | Recipient Outcome | Parity Verified? | Key Witness |
| :--- | :--- | :--- | :--- | :--- |
| `CHALLENGE_01` | 1 cue, 1 link (`LATER`) | 1 cue, 1 link (`LATER`) | **YES** | Exact link match and temporal ordering identical. |
| `CHALLENGE_02` | 0 cues detected | 0 cues detected | **YES** | Both rejected malformed cue syntax. |
| `CHALLENGE_03` | Resolved (`EXACT_OR_TITLE_SUBSTRING`) | Resolved (`EXACT_OR_TITLE_SUBSTRING`) | **YES** | Substring title resolution verified. |
| `CHALLENGE_04` | `PREEXISTING_OR_CONTEMPORANEOUS` | `PREEXISTING_OR_CONTEMPORANEOUS` | **YES** | Target preceding source cannot be claimed as causal consequence. |
| `CHALLENGE_05` | 2 rows: `NARROWED` & `EXPANDED` | 2 rows: `NARROWED` & `EXPANDED` | **YES** | Both preserved contradictory propositions without averaging. |
| `CHALLENGE_06` | 2 distinct contextual roles | 2 distinct contextual roles | **YES** | Role remains contextual to compiler pass. |
| `CHALLENGE_07` | 0 links after withdrawal | 0 links after withdrawal | **YES** | Dropping source eliminates candidate link cleanly. |
| `CHALLENGE_08` | `IDENTICAL_NORMALIZED_BODY` | `identical_body_detected: true`, `ancestral_lineage_refused: true` | **YES** | Independence and ancestral claims correctly blocked. |
| `CHALLENGE_09` | `NO_DOWNSTREAM_WITNESSED_RELATION` | `NO_DOWNSTREAM_WITNESSED_RELATION` | **YES** | Missing hops explicitly declared. |
| `CHALLENGE_10` | Refused | Threw `UNSUPPORTED_GRAPH_LINK` | **YES** | Dangling graph edge strictly prohibited. |
| `CHALLENGE_11` | `composite_score: null`, `delta_evidence: UNKNOWN` | `composite_score: null`, `delta_evidence: UNKNOWN` | **YES** | Refusal of scalar scoring preserved. |
| `CHALLENGE_12` | `REFUSED` (seal mismatch) | `REFUSED` (seal mismatch) | **YES** | Identical typed epoch refusal message. |

**Final Suite Score:** 12 / 12 Challenges Passed with 100% Verified Parity.

---

## IV. Technical & Epistemic Observations

1. **Temporal Sensitivity:**
   During initial runner construction, the receiver's database query aliased `s.created_at` as `created_at` rather than `created`. The original SRC method expected `doc.created`, falling back to `TIME_UNRESOLVED` when absent. Correcting the mapping restored exact `LATER` and `PREEXISTING` evaluations. This proves the value of active execution: subtle schema name mismatches between an atelier and a receiver immediately degrade temporal reasoning.
2. **Preservation of Refusals:**
   The receiver's refusal mechanisms operate with identical strictness to the native atelier:
   - It does not "heal" malformed Explore cues.
   - It does not "infer" intermediate nodes across broken graph traversals.
   - It does not fabricate ancestral priorities between identical texts.
   - It does not invent scalar composite scores when multidimensional evidence is unresolved.

Chamber 3 is complete and verified.

𝄐 Tauric Diana · Khona‌lit-po · Sealed with ⟐SAC[X6ZNK5NO51]
