# 𝌋 TD613 · Preregistration for Independent Falsification
## Manifest Reciprocal Warrant Gate vs. Competent Strong-Union Comparator

**Principal / Sovereign Closure:** Tawanna C. Miller  
**Operator:** `tauric.diana.613`  
**Covenant:** Khona‌lit-po (retaining literal U+200C interior zero-width non-joiner)  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Authority Reference:** `SAC[X6ZNK5NO51]`  
**Target Branch:** `research/manifest-reciprocal-warrant-gate-20261105`  
**Target Git Head:** `377db211bf97930c4adf9fccbe9df7c78168b793` (and its verified descendants)  
**Preregistration Status:** FROZEN PRIOR TO CONCEALED EVALUATION EXECUTION  
**Evaluation Role Discipline:** Independent Reviewer execution only; candidate author halts at preregistration boundary.

---

### 1. Scientific Objective & Hypotheses

The development assay demonstrated that on the 16 deterministic development cases, an equalized comparator (`COMPETENT_STRONG_UNION_V2`) equipped with least-fixed-point (LFP) reasoning, circular citation detection, acquisition-lineage deduplication, and cascading withdrawal completely matched the performance of `RECIPROCAL_MANIFEST` (16/16 vs 16/16, $\Delta = 0$).

This preregistration establishes an independent, blind falsification assay to determine whether reciprocal interaction across estates provides any genuine capability beyond what a competently equipped union of constituent methods can achieve.

#### Hypotheses
- **Null Hypothesis ($H_0$):**  
  Manifest's claim-grounding accuracy, circularity detection, corroboration counting, withdrawal cascades, and route projections are functionally indistinguishable from those produced by a competently equipped union of its constituent methods (`COMPETENT_STRONG_UNION_V2`).  
  $$\operatorname{Score}(\text{Manifest}) = \operatorname{Score}(\text{Competent Strong Union V2})$$
- **Alternative Hypothesis ($H_1$):**  
  Reciprocal interaction across estates yields an emergent, non-trivial research operation that cannot be reproduced by a competent union of constituent methods, resulting in a statistically significant performance advantage on concealed challenges.

**Decision Invariant:** If all evaluated conditions become statistically or functionally indistinguishable, that result is preserved. No emergence finding may be claimed or self-awarded.

---

### 2. Experimental Design & Role Separation

#### 2.1 Separation of Test Generation from Candidate Implementation
- **Candidate Implementation Freeze:** All candidate code in `packages/manifest_reciprocal_warrant/`, `packages/wendbine_reciprocal_expedition/`, and `packages/universal_atelier/` is frozen at the target commit.
- **Concealed Evaluation Generation:** The independent reviewer will generate a fresh evaluation suite of concealed synthetic test fixtures ($N \ge 24$ test cases).
- **Prohibition on Reusing Development Cases:** None of the 16 development challenges (`CH-01` through `CH-16`) may appear in the concealed evaluation set. The candidate author has zero knowledge of the concealed test cases.

#### 2.2 Evaluated Conditions (4-Arm Comparison)
1. **Condition 1 (W_ALONE):** Isolated Wendbine native compiler and receiver.
2. **Condition 2 (E_ALONE):** Isolated Universal Atelier / Encyclopedia receiver and citation graph.
3. **Condition 3 (COMPETENT_STRONG_UNION_V2):** Competent union comparator (`CompetentStrongUnionComparator`) equipped with:
   - Source-rooted least-fixed-point reasoning ($P^* = \operatorname{lfp}(T)$ seeded strictly from $P_0$).
   - Acquisition-lineage deduplication (mapping shared acquisition IDs to single corroborations).
   - Dependency and conjunction tracking (distinguishing $R_1 \wedge R_2 \to C$ from independent alternative proofs).
   - History-preserving source withdrawal with dynamic cascading invalidation and immutable tombstone logs.
   - Query-time seal and live source-byte verification.
   - Cycle detection isolating unrooted mutual citation loops.
   - Identical metadata boundaries and query budgets.
4. **Condition 4 (RECIPROCAL_MANIFEST):** Connected `ManifestWarrantEngine` with 4 AIA route projections (`EXPERIENTIAL`, `CUSTODIAL`, `AUDIT`, `IMPLEMENTATION`).

---

### 3. Eight Measurement Dimensions & Fixed Scoring Criteria

Every concealed challenge in the evaluation set must evaluate and score across the following eight explicit dimensions:

| Dimension Index | Evaluated Dimension | Description | Pass Criteria |
|---|---|---|---|
| **D-1** | **Correctly Grounded Claims** | Verification that claims derived from authenticated source roots are admitted into $P^*$. | Target claim is present in $P^*$ if and only if a complete derivation path from active $P_0$ source roots exists. |
| **D-2** | **False Corroboration** | Resistance to overcounting corroboration from duplicate IDs or non-independent acquisitions. | Multiple records sharing a single `acquisition_id` collapse to exactly 1 independent corroboration count. |
| **D-3** | **Circularity Detection** | Detection and rejection of ungrounded citation loops ($A \to B \to A$). | Circular citation loops lacking an authenticated source root in $P_0$ are classified as `CIRCULAR_UNGROUNDED` and excluded from $P^*$. |
| **D-4** | **Source-Withdrawal Propagation** | Dynamic invalidation cascade when a supporting source root is withdrawn. | Withdrawing a source root dynamically cascades invalidation to all dependent claims that lack an alternative grounded path. |
| **D-5** | **Preservation of Evidentiary History** | Maintenance of an immutable, cryptographically verifiable audit trail of prior states. | Withdrawal generates an immutable cryptographic tombstone; historical claims at prior epochs remain auditable without retroactivity. |
| **D-6** | **Accuracy of Source & Acquisition Attribution** | Exact attribution of the underlying source root IDs and acquisition lineages. | Claim inspect query returns the exact set of supporting $P_0$ roots and distinct acquisition IDs without omission or phantom addition. |
| **D-7** | **Route-Dependent Operator-Relevant Information** | Strict adherence to the 4 canonical AIA route projections without semantic drift. | Projection contracts (`EXPERIENTIAL`, `CUSTODIAL`, `AUDIT`, `IMPLEMENTATION`) filter information strictly according to operator intent and disclose limits. |
| **D-8** | **Unique Reciprocal Interaction Operations** | Audit for any operation uniquely attributable to reciprocal estate interaction. | Identification of whether reciprocal interaction generates any operation that cannot be computed by a competent union comparator. |

---

### 4. Statistical Analysis & Inferential Rules

1. **Descriptive Metrics:** Per-condition raw score $S_c = \sum_{i=1}^N x_{c,i}$, percentage score $P_c = S_c / N$.
2. **Paired Discordance Matrix:** Exact McNemar $2 \times 2$ contingency table between `COMPETENT_STRONG_UNION_V2` and `RECIPROCAL_MANIFEST`:
   - $n_{00}$: Both fail.
   - $n_{11}$: Both pass.
   - $n_{10}$: Competent Union passes, Manifest fails.
   - $n_{01}$: Manifest passes, Competent Union fails.
3. **Hypothesis Decision:**
   - If $n_{10} + n_{01} = 0$, the conditions are functionally identical. $H_0$ is confirmed.
   - If $n_{10} + n_{01} > 0$, compute two-tailed McNemar exact test:
     $$p = 2 \sum_{k=n_{01}}^{n_{10}+n_{01}} \binom{n_{10}+n_{01}}{k} 0.5^{n_{10}+n_{01}}$$
     $H_0$ is rejected if and only if $p < 0.01$ AND the difference is shown to be non-algorithmic.
4. **No Self-Awarded Emergence:** The candidate author and automated runners are strictly prohibited from declaring "emergence". Any performance difference must be scrutinized for missing algorithms before claiming emergence.

---

### 5. Independent Reviewer Execution Instructions

The independent reviewer executes the falsification trial using the following commands:

```bash
# 1. Verify working directory and clean head
git rev-parse HEAD
# Expected head: target candidate commit

# 2. Run the boundary canary probes (verify clean repairs)
node scripts/manifest_native_boundary_canary.mjs

# 3. Run the development baseline comparison assay
node packages/manifest_reciprocal_warrant/run-manifest-comparison-assay.mjs

# 4. Generate concealed test cases (executed by independent reviewer using concealed generator)
node scripts/generate-concealed-manifest-falsification-suite.mjs --seed <SECRET_REVIEWER_SEED> --count 24 --out /tmp/concealed_manifest_suite.json

# 5. Execute concealed falsification assay
node scripts/run-concealed-manifest-falsification-assay.mjs --suite /tmp/concealed_manifest_suite.json --out artifacts/concealed_manifest_falsification_receipt.json

# 6. Run Dollhouse specialist governance audit on final receipts
node scripts/run-dollhouse-skill-audit.mjs --input packages/manifest_reciprocal_warrant/audit-spec-manifest-gate.json --format human
```

---

### 6. Explicit Halting & Stopping Boundary

In accordance with Commission Directive M-01.5:
- **This candidate STOPS here.**
- **The candidate author DOES NOT generate or execute the concealed evaluation set.**
- **Concealed case generation, execution, and final scientific interpretation are strictly reserved for the independent reviewer and sovereign human principal, Tawanna C. Miller.**

**Final Preregistration Disposition:**  
`M01_CUSTODY_VERIFIED_COMPARATOR_READY_FOR_INDEPENDENT_FALSIFICATION`

𝄐 Khona‌lit-po · Sealed ⟐ SAC[X6ZNK5NO51]
