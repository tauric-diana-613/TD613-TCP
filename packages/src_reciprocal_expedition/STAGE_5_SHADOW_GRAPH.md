# 𝌋 TD613 · Stage 5 The Shadow Graph
## Boundary Attempt Graph: Epistemic State Machine, Invariant Bounds, and Observational Advantage

**Date:** 2026-11-05T09:16:40-05:00  
**Authority:** `SAC[X6ZNK5NO51]`  
**Covenant:** Khona‌lit-po (preserving interior U+200C)  
**Parent Checkpoint:** `ce9b6c6e053505e8f005e27ad2af4631ce2ed140` (PR #1689)  
**Successor Branch:** `research/src-order-mechanism-falsification-20261105`  
**Execution Worktree:** `C:\td613-worktrees\src-first-reciprocal-expedition`  
**Engine Implementation:** `packages/src_reciprocal_expedition/shadow_graph/shadow_graph_engine.mjs`  
**Adversarial Suite:** `packages/src_reciprocal_expedition/shadow_graph/test-shadow-graph.mjs`  
**Machine Receipt:** `packages/src_reciprocal_expedition/shadow_graph/shadow-graph-receipt.json`

---

### I. The Shadow Graph Formal Specification

The **Boundary Attempt Graph** (`BOUNDARY_ATTEMPT_GRAPH`) preserves the topology of attempted inquiry without polluting the admitted relation graph with ungrounded claims.

It partitions all research connections into 6 distinct, mutually exclusive epistemic states:
1. `ADMITTED`: Both endpoints admitted, chronological non-retroactivity verified ($t_{\text{target}} > t_{\text{source}}$), evidence span byte-verified.
2. `ATTEMPTED_REJECTED`: An explicit cue or connection was attempted by a document, but rejected by admission rules (e.g. unadmitted target, chronological inversion, duplicate body, noise).
3. `NEVER_GENERATED`: An unattempted potential relation.
4. `WITHHELD_LACK_OF_EVIDENCE`: A proposed relationship whose evidence deltas remain unverified or below the evidence claim ceiling.
5. `WITHDRAWN_SCOPE_CHANGE`: A previously admitted relationship whose warrant or endpoint was retracted following a change of scope.
6. `AWAITING_UNRESOLVED_EXTERNAL`: An expected object gap identified by an ordinal series or authority manifest, awaiting future external documentary admission.

---

### II. Core Epistemic Invariant

$$\text{Attempt}(u, v) \centernot\implies \text{Existence}(v) \lor \text{Warrant}(u \to v)$$

An author's citation of an external object witnesses that the author *attempted* a connection. It does not establish that the referenced object exists, that the text is true, or that a causal relationship exists.

The Shadow Graph enforces this invariant by strictly confining all unadmitted targets to `ATTEMPTED_REJECTED` or `AWAITING_UNRESOLVED_EXTERNAL`. At no point does registering an attempt promote an unadmitted entity into an admitted node.

---

### III. Empirical Observational Advantage vs Risk

#### 1. Positive Witness: Informational Advantage (Forward Recovery)
- In a traditional upfront-filtered architecture, attempts to reference missing documents are discarded. If that document is subsequently admitted, discovering historical references requires rescanning and re-indexing the entire historical corpus.
- In the Shadow Graph, when an expected target (`obj:expected_series_3`) is subsequently admitted, all prior historical attempts referencing it are recovered in $\mathcal{O}(1)$ time without raw text re-processing (`TEST_06_LATE_ADMISSION_RECOVERY`).

#### 2. Negative Witness: Confinement of Adversarial Noise
- **Invalid references:** A citation to `urn:isbn:9999999999999_invalid` is recorded as an attempt, but never admitted (`TEST_07`).
- **Misleading citations:** Deliberately misleading co-occurrence noise is rejected and retained in the attempt log without polluting graph topology (`TEST_08`).
- **Homonymous targets:** Distinct documents sharing identical titles (`Shared Title X`) are preserved as distinct shadow targets, preventing false topological collapse (`TEST_10`).
- **Fictional titles:** Citations to imaginary works (`doc:fictional_atlantis_treatise`) are confined to rejected attempts, preventing citation hallucination (`TEST_11`).

#### 3. Order Independence
This informational advantage is an attribute of **attempt logging**, not of execution order. When attempt logging is enabled in both Encyclopedia $\to$ Atelier and Atelier $\to$ Encyclopedia, the retained boundary attempt graph is identical.

**Exit Condition Satisfied:** Falsifiable Shadow Graph mechanism specification established with positive recovery witnesses and negative noise-confinement witnesses.
