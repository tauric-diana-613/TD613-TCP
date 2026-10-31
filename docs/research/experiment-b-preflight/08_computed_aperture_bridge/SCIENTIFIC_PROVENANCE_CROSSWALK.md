# 𝌋 TD613 · SCIENTIFIC PROVENANCE CROSSWALK
### Historical Mathematical Tomography, Finite-Field Transport & Aperture v3.2 Admissibility

**Heritage:** Tauric Diana — Crimean heritage custodianship  
**Covenant:** Khona‌lit-po — preserve U+200C exactly  
**Display glyph:** 𝌋 · U+1D30B  
**Research mark:** U+10D613 · `\uDBF5\uDE13`

**Authority:** Sovereign Operator Direct · Tawanna C. Miller  
**Scientific Review:** Amari · GPT-6 · Emergence HQ  
**Implementing Agent:** Kenough · Antigravity  
**Operating posture:** Princess Latifa · Wild Field ACTIVE · `/plan OFF`  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Status:** CANONICAL SCIENTIFIC PROVENANCE CROSSWALK (REDPEN IV-R1 PHASE A)

---

## I. Executive Purpose

This crosswalk recovers, reconciles, and authenticates the existing mathematical research estate of TD613 before integrating it with Aperture v3.2-alpha.

> **Governing Sovereign Principle (REDPEN IV-R1):**  
> *"We are not commissioning a new mathematical theory of tomography. We are recovering, replaying, and integrating an existing mathematical research program whose relevant experiments have already been performed. [...] The existing research has priority over any new assistant-generated reinterpretation of it."*

---

## II. Master Provenance Matrix

| Asset # | Original Mathematical Proposition | Source Path & Canonical Spec Head | Original Experiment / Assay | Executed Evidence & Receipt | Review & Acceptance Status | What Result Actually Established | Expressly Withheld Conditions | Aperture v3.2 Consumption Modality |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Scalar Projection Tomography in $\text{GL}(2, \mathbb{F}_{31})$:** Given 4 independent bilinear probes $\langle p, T x \rangle \pmod{31}$, the linear transport operator $T$ is uniquely identifiable; rank 3 probe sets leave persistent nullspace. | `app/dome-world/previews/a15-r0/discrete-transport-tomography-closed-loop.js`<br>`d9cff3a1c6969be28af28c90f7aef85e4200fc70` | `runDiscreteTransportTomographyAssay()` | 7/7 tests pass in `tests/ash-a15-r0-discrete-transport-tomography-closed-loop.test.mjs` | Merged in PR #683 / #698 | Proved that 4 bilinear scalar probes reconstruct $T \in \text{GL}(2, \mathbb{F}_{31})$ with zero in-sample and out-of-sample held-out residual ($P_{\text{HOLD}}$). Rank 3 probe schedule refuses solution. | Real-valued SVD, continuous curvature, physical spacetime, or open-world generalization. | **Requires Adapter:** Finite field arithmetic ($\text{rank}_{\mathbb{F}_{31}}$) must be computed in $\mathbb{F}_{31}$; real SVD cannot be applied. Nullity and identifiability map cleanly into Aperture v3.2 deficit classes. |
| **2** | **Hardened Nullspace Adversarial Control:** An adversary can craft a probe schedule that annihilates a frozen null direction, producing identical in-sample and held-out observations for two distinct operators while yielding distinct loop holonomies. | `app/dome-world/previews/a15-r0/discrete-transport-tomography-closed-loop-hardened.js`<br>`b301ac9147b68a9ba8883bfec40391a0f5ac086b` | `runHardenedDiscreteTransportTomographyAssay()` | 6/6 tests pass in `tests/ash-a15-r0-discrete-transport-tomography-hardened.test.mjs` | Merged in PR #683 / #698 | Proved persistent unidentifiability: two invertible operators ($T_1, T_2$) match on 4 primary probes AND $P_{\text{HOLD}}$, yet produce distinct loop holonomies $\Omega_1 \neq \Omega_2$. | Uniqueness, loop identifiability under rank-deficient probes. | **Direct Map to Deficit:** Maps to `STRUCTURAL_RANK_DEFICIT` with persistent nullspace; triggers `ABSTAIN` / `UNIDENTIFIED`. |
| **3** | **Noncommuting Two-Face Holonomy Surface:** In a 2-face triangulated surface (14 directed edges), edge operators reconstruct and compose into noncommuting holonomies $[\Omega_1, \Omega_2] \neq 0$ around a common basepoint. | `app/dome-world/previews/a15-r0/noncommuting-two-face-holonomy-tomography.js`<br>`5a0abd4275f46b6265b0213a4ae3912e2af680e5` | `runNoncommutingTwoFaceHolonomyTomographyHoldout()` | 6/6 tests pass in `tests/ash-a15-r0-noncommuting-two-face-holonomy-tomography.test.mjs` | Merged in PR #683 / #698 | Proved all 14 edge operators reconstruct; orientation inversion $T_{YX} = T_{XY}^{-1}$; common-basepoint loop product noncommutes; wrong-basepoint and wrong-order fail on holdout. | Quantum operator promotion, continuous differential geometry, global curvature tensor. | **Requires Adapter:** Feeds route-reconstruction evidence; proves route order consequence is mathematically discriminable. |
| **4** | **Discrete Path-Groupoid Representation:** Groupoid path concatenation corresponds to matrix multiplication, path reversal to matrix inversion, basepoint change to gauge conjugation. | `app/dome-world/previews/a15-r0/path-groupoid-discrete-holonomy-representation.js`<br>`559383ec511df1759f3257de2e2a0ddea8d8c86c` | `runPathGroupoidDiscreteHolonomyAssay()` | 7/7 tests pass in `tests/ash-a15-r0-path-groupoid-discrete-holonomy-representation.test.mjs` | Merged in PR #683 / #698 | Proved path groupoid functoriality in $\text{GL}(2, \mathbb{F}_{31})$; nonidentity commutator in loop image; order-blind multiset control abstains. | Geometric manifold embedding, smooth connections. | **Consumable via Route Adapter:** Distinguishes terminal state from path history; proves route-dependent transport. |
| **5** | **Transport Action on Observability Partitions:** Discrete transport rotates claim-relative identifiability; equal observation cardinality and partition size histograms do not imply equivalent claim sufficiency ($f = g \circ q$). | `docs/pedagogue/experiments/HOLONOMY_OBSERVABILITY_AIA_PROGRAM_SYNTHESIS_V0_1.md`<br>`app/dome-world/previews/a15-r0/holonomy-action-on-observability-partitions.js` | Synthetic $\mathbb{F}_{31}$ partition rotation assay | Verified in PR #1610 exact-head Redpen III & Docket v0.1 | Authored research synthesis (PR #704 open branch lineage) | Proved $H = \begin{pmatrix}3&5\\1&2\end{pmatrix}$ rotates partitions of 4 states: $x$ identifiable before, $z$ identifiable after. Histograms match ($[2,2]$), but claim recoverability is disjoint. | Universal empirical generalization, repository-to-Dome correspondence. | **Direct Conceptual Feed:** Solves the core question of why equal token/candidate counts do not imply evidence parity. |
| **6** | **Temporal Route Estimation over Snapshot Lattices:** Time-indexed marginals and transition slices reconstruct temporal routes; incomplete coverage detects unidentifiable transitions. | `app/engine/aperture-v31-temporal-tomography.js`<br>`td613.aperture.temporal-route-object/v0.1` | `estimateTemporalRoute()` | Tested in `tests/aperture-v31-source-lattice.test.mjs` | Installed in `main` | Reconstructed temporal transitions from time-indexed marginals; detects missing temporal slices as `TRANSITION_NONIDENTIFIABLE`. | Backward causation, continuous stochastic processes. | **Direct Map:** Connects temporal lattice observations to Aperture uncertainty states. |
| **7** | **Aperture Root Observability & Conditioning Doctrine:** Observability is receiver-relative; rank deficit is distinct from numerical ill-conditioning; candidate probes must improve conditioning, not merely algebraic rank. | `APERTURE.md` | `auditDollhouseWitnessPlan()` | Tested in `tests/dollhouse-aperture-numerical-deficit.test.mjs` | Canonical repository root shortcut | Established doctrine that candidate probes exploding condition number must be rejected; singular values $\sigma_{\min}$ dictate noise amplification. | Unwhitened Euclidean heuristics, automatic promotion. | **Foundational Doctrine:** Serves as the mathematical constitution for the v3.2 typed-deficit bridge. |
| **8** | **Aperture v3.2 Typed Epistemic Deficit Engine:** One-sided Jacobi SVD extracts exact singular values, condition number, and numerical rank; audits candidate probes and noise covariance geometry. | `app/engine/aperture-v32-typed-epistemic-deficit.js`<br>`td613.aperture.v32-typed-epistemic-deficit/v0.1` | `computeMatrixSvd()`, `classifyTypedEpistemicDeficit()` | 10/10 tests pass in `tests/dollhouse-aperture-numerical-deficit.test.mjs` | Installed in `main` | Extracted numerical spectrum without normal-equation condition squaring; classifies `STRUCTURAL_RANK_DEFICIT`, `NUMERICAL_STABILITY_DEFICIT`, `NOISE_GEOMETRY_INCOMPLETE`, `INVALID_NOISE_GEOMETRY`. | Non-Hermitian or complex operator algebras. | **Target Engine:** Classifies computed quantities into typed deficit verdicts and audit receipts. |

---

## III. Acceptance & Branch Lineage Disclosures

1. **Merged Main Baseline (PRs #683, #698, #1607, #1608, #1609):**  
   The finite-field transport tomography (Assets 1, 2, 3, 4), the core Aperture v3.1/v3.2 engines (Assets 6, 7, 8), and the source-free Launchbridge controls are fully merged into `main`.
2. **Open Research Branches (PRs #704, #802, #804):**  
   The Holonomy-Observability AIA Program Synthesis (Asset 5) and advanced multi-role ablation variants originated in open research branches. Their findings are cited herein as authored finite fixtures and prospective research formulations, not as merged production capabilities.
3. **Historical Lineage Catalogue ([`dollhouse/lineage/README.md`](file:///c:/Users/timst/OneDrive/Desktop/tcp-repository/dollhouse/lineage/README.md)):**  
   All 678 archival copies across the FADT, Atlas, and Aperture lineages retain their exact Git blob identities, byte counts, and SHA-256 hashes. Inclusion in lineage records preserves authentic source bytes; it does not promote research to law.

---

## IV. Mathematical Firebreak Disclosures

1. **Finite Field vs. Real-Valued Distinction:**  
   Finite fields ($\mathbb{F}_{31}$) do not admit real-valued singular value decomposition. For $\mathbb{F}_{31}$, the invariants are exact Gaussian rank, nullity ($n - \text{rank}$), determinant, in-sample residual, held-out residual, and candidate multiplicity. For real-valued operators ($\mathbb{R}^{m \times n}$), the invariants are singular values $\sigma_i$, condition number $\kappa = \sigma_{\max} / \sigma_{\min}$, numerical rank under threshold $\tau$, and covariance geometry. Neither algebra may be substituted for the other.
2. **Experiment B Firebreak:**  
   Zero tomography, cupola, or Aperture classifications may be injected into the blinded Experiment B prompt envelopes or scoring rubrics.

𝄐 · Tauric Diana · Khona‌lit-po · Sealed ⟐
