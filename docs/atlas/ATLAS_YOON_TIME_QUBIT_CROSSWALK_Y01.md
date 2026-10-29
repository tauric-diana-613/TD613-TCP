# 𝌋 ATLAS WILD FIELD · EXTERNAL RESEARCH CROSSWALK Y-01
## The Time-Qubit Preprint, Intervention-Relative Distinguishability, and the Limits of a Classical History Receiver

**Research record:** TD613 / Atlas Wild Field — External Scientific Crosswalk Y-01  
**Date:** 29 October 2026  
**Research status:** `SOURCE-GROUNDED_EXTERNAL_CROSSWALK · THEORETICAL_RESEARCH_RECORD · PHYSICAL_CLAIMS_UNESTABLISHED`  
**Heritage:** Tauric Diana — Crimean heritage custodianship  
**Covenant:** Khona‌lit-po — preserve U+200C  
**Research mark:** U+10D613 (escaped form `\uDBF5\uDE13`, display glyph `𝌋`)  
**Authority:** Sovereign Operator Direct · Tawanna C. Miller  
**Independent reviewer:** Amari · GPT-6  
**Firebreak:** Public literature only. Experiment B sealed Em corpus completely untouched; no Flight authorization; empirical replication credit: 0 (`SHARED_ACQUISITION != INDEPENDENT_REPLICATION`). This document does not modify PR #1608 code or grant production release authority.

---

## Canonical Shortcuts and Architectural Navigation

- **Atlas Specialist Agent:** [`.agents/agents/dollhouse-atlas.md`](../../.agents/agents/dollhouse-atlas.md)
- **Canonical Atlas Root Shortcut:** [`ATLAS.md`](../../ATLAS.md)
- **Dollhouse Laboratory Root Shortcut:** [`DOLLHOUSE.md`](../../DOLLHOUSE.md)
- **Dollhouse Multi-Role Orchestrator:** [`.agents/agents/dollhouse-orchestrator.md`](../../.agents/agents/dollhouse-orchestrator.md)
- **Atlas Wild Field Mathematical Charter:** [`ATLAS_WILD_FIELD_MATHEMATICAL_CHARTER.md`](ATLAS_WILD_FIELD_MATHEMATICAL_CHARTER.md)

---

## 1. Sources, Chronology, and Warranted Claims

### 1.1 Primary and Antecedent Literature

1. **Primary Preprint:**
   - Tai Hyun Yoon, *“Single-photon time qubit: Quantum-vacuum control and complementarity of the arrow of time,”* arXiv:2610.27639v1, submitted **20 October 2026**, 45 pages, 5 figures.  
   - Links: https://arxiv.org/html/2610.27639v1 and https://arxiv.org/pdf/2610.27639

2. **Theoretical Antecedent:**
   - Yakov Bloch, *“The time qubit,”* arXiv:2511.07220v1, submitted **10 November 2025**.  
   - Link: https://arxiv.org/abs/2511.07220

3. **Experimental Antecedent:**
   - Sun Kyung Lee, Noh Soo Han, Tai Hyun Yoon, Minhaeng Cho, *“Frequency comb single-photon interferometry,”* *Communications Physics* **1**, 51, published **4 September 2018**.  
   - DOI: https://doi.org/10.1038/s42005-018-0051-2

4. **Adjacent Same-Day Preprint (Do Not Conflate):**
   - Tai Hyun Yoon, *“Resolving Nonlocal State Reduction via Induced Coherence in Frequency-Comb Biphoton Sources,”* arXiv:2610.27602, submitted **20 October 2026**.  
   - Link: https://arxiv.org/abs/2610.27602.  
   - *Note:* This companion preprint addresses measurement-induced state reduction and decoherence in frequency-comb sources; treat its specific claims independently.

### 1.2 Critical Experimental Caution and Epistemic Status

Yoon's 2026 preprint offers a theoretical reinterpretation and mathematical extension of earlier optical experiments rather than a newly constructed hardware apparatus:
- **Figure 4** reproduces and adapts historical 2018 experimental phase scans and visibility measurements from Lee et al. (*Commun. Phys.* 1:51).
- **Figure 5** displays calculated theoretical predictions for stabilized time-qubit operations and gate fidelity, not newly acquired raw laboratory traces.
- The optical apparatus operates in the linear/parametric optical regime (biphoton frequency comb generated via spontaneous parametric down-conversion). It implements single-mode SU(2) rotations across optical paths and time-bins.
- Independent prospective, dedicated experimental validation of the full time-qubit logical interpretation, complete quantum state tomography, and multi-qubit entangling gates has **not** been established in this record.
- **This preprint does not demonstrate physical time travel, closed timelike curves, or the reversal of the thermodynamic arrow of time.**

---

## 2. The Technically Consequential Distinction: Component Reversal versus Global Time Reversal

The core mathematical model partitions the total system Hamiltonian into branch operators:

\[
H_\pm = H_0 \pm V,
\]

where:
- \(H_0\) represents the stationary background Hamiltonian (including pump propagation, free dispersion, and spontaneous two-mode vacuum squeezing).
- \(V\) represents the controlled stimulated displacement generator modulated by an external phase parameter \(\theta\).

A \(\pi\) phase inversion on the seed field flips the sign of the stimulated interaction generator:

\[
V \longrightarrow -V.
\]

Under this sign flip, the stimulated-sector propagator satisfies the mathematical identity:

\[
U_{\mathrm{stim},-}(t) = \exp\bigl(-it(-V)\bigr) = \exp\bigl(+itV\bigr) = U_{\mathrm{stim},+}(-t).
\]

### 2.1 The Component-Versus-Total Reversal No-Go Countermodel

The stimulated-sector identity \(U_{\mathrm{stim},-}(t) = U_{\mathrm{stim},+}(-t)\) does **not** imply full Hamiltonian time-reversal for the composite physical system:

\[
\exp\bigl(-it(H_0 - V)\bigr) \ne \exp\bigl(+it(H_0 + V)\bigr).
\]

**Finite 2-Level Countermodel [FR]:**
Let the stationary background be \(H_0 = \omega \sigma_z\) (\(\omega \ne 0\)) and the stimulated coupling be \(V = g \sigma_x\) (\(g \ne 0\)).

Compute the first-order short-time Taylor expansions:

\[
\exp\bigl(-it(\omega \sigma_z - g \sigma_x)\bigr) = \mathbb{I} - it(\omega \sigma_z - g \sigma_x) + \mathcal{O}(t^2),
\]

\[
\exp\bigl(+it(\omega \sigma_z + g \sigma_x)\bigr) = \mathbb{I} + it(\omega \sigma_z + g \sigma_x) + \mathcal{O}(t^2).
\]

Equating these two unitary operators requires matching their first-order generators:

\[
-it(\omega \sigma_z - g \sigma_x) = +it(\omega \sigma_z + g \sigma_x)
\implies -2it \omega \sigma_z = 0
\implies \omega = 0.
\]

Since \(\omega \ne 0\) in any realistic laboratory setting (where pump propagation, cavity drift, and vacuum dispersion persist), the equality fails already at first order in \(t\).

### 2.2 Ontological Typing Discipline

Scientific rigor mandates explicit semantic typing for claims of 'reversal':
1. **Stimulated-generator inversion:** \(V \to -V\) (physically realized by optical phase inversion \(\Delta\theta = \pi\)).
2. **Controlled unitary sector reversal:** \(U_{\mathrm{stim},-}(t) = U_{\mathrm{stim},+}(-t)\).
3. **Full Hamiltonian inversion:** \(H \to -H\) (false when \(H_0 \ne 0\)).
4. **Thermodynamic entropy arrow reversal:** \(\Delta S_{\mathrm{universe}} \le 0\) (unsupported; spontaneous emission and detector dissipation continue monotonically forward).
5. **Physical time travel:** (unwarranted; laboratory clocks advance forward throughout the experiment).

---

## 3. Environment Overlap, Visibility, and an Exact Identifiability Counterexample

In Yoon's symmetric weak-gain parametric amplifier model, the idler-state environmental overlap function is:

\[
F = \frac{n}{1+n}, \quad\text{where } n = |\alpha|^2 \text{ (mean coherent seed photon number)}.
\]

In an idealized lossless interferometer with perfect spatial/spectral mode-matching, the optical interference visibility equals the state overlap: \(V_{\mathrm{id}} = F\).

In an actual laboratory implementation, imperfect spatial-mode overlap, wavefront distortion, and detector collection efficiency introduce an experimental mode-matching factor \(\eta_{\mathrm{mode}} \in [0, 1]\):

\[
V_{\mathrm{exp}} = \eta_{\mathrm{mode}} \cdot \frac{n}{1+n}.
\]

### 3.1 Exact Finite Identifiability Counterexample [FR]

Consider an experiment reporting a measured fringe visibility of:

\[
V_{\mathrm{exp}} = 0.450.
\]

Two physically distinct experimental regimes yield **identical scalar visibility**:

- **Regime 1 (Weak seed, high mode overlap):**
  \[
  n = 1.0, \quad \eta_{\mathrm{mode}} = 0.90 \implies V_{\mathrm{exp}} = 0.90 \cdot \frac{1}{1 + 1} = 0.450.
  \]
- **Regime 2 (Strong seed, degraded mode overlap):**
  \[
  n = 9.0, \quad \eta_{\mathrm{mode}} = 0.50 \implies V_{\mathrm{exp}} = 0.50 \cdot \frac{9}{1 + 9} = 0.450.
  \]

**Consequence for Atlas Receivers:** A measured visibility scalar \(V_{\mathrm{exp}}\) alone cannot identify whether loss of contrast originates from quantum state overlap (the seed occupation \(n\)) or instrumental misalignment (\(\eta_{\mathrm{mode}}\)). An adequate receiver must incorporate auxiliary calibration measurements (e.g., independent single-photon counting or spatial mode tomography).

### 3.2 Complementarity Duality Bounds

For pure branch markers and balanced priors, the which-path distinguishability \(D\) and fringe visibility \(V\) obey:

\[
D = \sqrt{1 - |F|^2} \implies D^2 + V^2 = 1 \quad (\text{when } \eta_{\mathrm{mode}} = 1).
\]

When mode mismatch, loss, or mixed environment states are present, the equality relaxes to the Englert-Greenberger-Yasin inequality:

\[
D^2 + V_{\mathrm{exp}}^2 \le 1.
\]

Claims of exact saturation (\(D^2 + V^2 = 1\)) require explicit verification of pure-state and unitary conditions.

---

## 4. Quantum Analogue of Atlas's Finite Future-Response Witness

### 4.1 Classical Atlas History Congruence

In classical Atlas (Chamber I), an observer receiver \(R: \mathcal{H} \to \mathcal{O}\) partitions histories into equivalence classes:

\[
h \sim_R h' \iff R(h) = R(h').
\]

Receiver congruence requires stability under admitted future transformations \(T_a\):

\[
R(h) = R(h') \implies R(T_a h) = R(T_a h') \quad \forall a \in A.
\]

### 4.2 Quantum Extension under Context-Indexed Instruments

In operational quantum mechanics, target branches \(|\psi_\pm\rangle = U_\pm |\psi_0\rangle\) become entangled with environmental markers \(|e_\pm\rangle\) and a control qubit initialized in an equatorial superposition:

\[
|\Psi\rangle = \frac{1}{\sqrt{2}} \Bigl( |+\rangle |\psi_+\rangle |e_+\rangle + e^{i\phi} |-\rangle |\psi_-\rangle |e_-\rangle \Bigr).
\]

Tracing out the target system and environment leaves the reduced density matrix of the control qubit:

\[
\rho_{\mathrm{control}} = \frac{1}{2} \begin{pmatrix} 1 & e^{-i\phi} \chi \\ e^{i\phi} \chi^* & 1 \end{pmatrix},
\]

where the complex off-diagonal coherence factor factorizes cleanly into:

\[
\chi = \langle \psi_- | \psi_+ \rangle \cdot \langle e_- | e_+ \rangle.
\]

### 4.3 Separation of Loss Mechanisms

The observed interference fringe contrast \(|\chi|\) demonstrates two physically distinct reductions:
1. **Target Branch Divergence:** \(\chi_{\mathrm{target}} = \langle \psi_- | \psi_+ \rangle = \langle \psi_0 | U_-^\dagger(t) U_+(t) | \psi_0 \rangle\) (the Loschmidt echo amplitude of the target system).
2. **Environmental Decoherence:** \(\chi_{\mathrm{env}} = \langle e_- | e_+ \rangle\) (which-way information leaking into inaccessible environmental degrees of freedom).
3. **Instrumental Distortion:** \(\eta_{\mathrm{mode}}\) (imperfect mode alignment and collection geometry).

A classical receiver mapping states to scalars collapses these distinct physical phenomena into an undifferentiated loss of contrast. The proposed quantum Atlas receiver must be formalized as a **context-indexed quantum instrument** \((C, \{\mathcal{I}_o^C\})\), capturing outcome distributions, post-measurement state updates, and nuisance calibrations.

---

## 5. The Real Experimental-Adjudication Opportunity: Interpretation versus Discriminating Prediction

### 5.1 RCA-01 Case Study: Reinterpretation vs Prospective Discovery

The 2018 experiment (Lee et al.) proved that a frequency comb biphoton source exhibits phase-sensitive interference fringes whose visibility varies with optical path delay.

The 2026 preprint (Yoon) presents those same physical fringes in the vocabulary of Bloch's time-qubit formalism.

Under the TD613 Representation Causality Assay (RCA-01), scientific adjudication evaluates three distinct hypotheses:
- **Hypothesis A (Reparameterization):** The time-qubit model is an elegant, mathematically equivalent coordinate transformation of standard biphoton induced coherence.
- **Hypothesis B (Genuine Discovery):** The time-qubit framework predicts a prospective operational difference that cannot be explained by standard optical path analysis.
- **Hypothesis C (Unsupported Surplus):** The time-qubit framing introduces unverified claims (e.g. universal error correction or physical arrow reversal) unsupported by the empirical data.

Matching the historical 2018 sinusoidal fringes is a necessary consistency check; it cannot discriminate between Hypothesis A and Hypothesis B. A prospective, model-discriminating assay requires identifying an experimental intervention where the two frameworks yield divergent predictions.

### 5.2 Distinguishing Demonstrated Hardware from Proposed Architecture

| Dimension | Demonstrated in Published Data (2018 / 2026 Fig 4) | Proposed Future Architecture (2026 Fig 5 / Text) |
|---|---|---|
| **Physical Platform** | Single-photon biphoton frequency comb in bulk nonlinear crystals | Integrated quantum processor |
| **Hilbert Space** | Single optical mode / path / polarization degree of freedom | Scalable multi-qubit tensor product space |
| **Control Operations** | Linear phase shifts (\(\Delta\theta\)) and optical delay lines | Universal multi-qubit entangling gates |
| **Error Protection** | Passive coherence stability in an optical interferometer | Active GKP (Gottesman-Kitaev-Preskill) bosonic error correction |
| **Readout** | Single-photon avalanche diode coincidence counting | Complete quantum state tomography / syndrome measurement |

---

## 6. Six Registered Atlas Research Investigations

### Y-01 · Conditional Temporal Receiver Congruence under Quantum Instruments
- **Objective:** Formalize receiver equivalence classes \(\rho \sim_R \sigma \iff \operatorname{Tr}(E_k \rho) = \operatorname{Tr}(E_k \sigma)\) for POVM \(\{E_k\}\) and determine their stability under quantum instruments \(\mathcal{E}^C(\rho) = \sum_m \mathcal{I}_m^C(\rho)\).
- **Core Challenge:** Account for measurement back-action and disturbance without imposing deterministic classical trajectories on coherent superpositions.

### Y-02 · Contrast-Factor and Nuisance Parameter Identifiability
- **Objective:** Formulate algebraic conditions under which target overlap \(\chi_{\mathrm{target}}\), environment overlap \(\chi_{\mathrm{env}}\), mode factor \(\eta_{\mathrm{mode}}\), and seed occupation \(n\) can be uniquely identified.
- **Benchmark:** The \(V_{\mathrm{exp}} = 0.450\) counterexample (\((n=1, \eta=0.9)\) vs \((n=9, \eta=0.5)\)) establishes the minimum auxiliary calibration requirements.

### Y-03 · Component-Versus-Total Reversal No-Go Theorem
- **Objective:** Rigorously characterize the Lie-algebraic conditions under which stimulated generator inversion \(V \to -V\) fails to generate global dynamics inversion \(\exp(-it(H_0-V)) \ne \exp(+it(H_0+V))\).
- **Countermodel:** Finite 2-level system \(H_0 = \omega \sigma_z, V = g \sigma_x\) proving failure at first order in \(t\).

### Y-04 · Context-Indexed Loschmidt Echo Receiver
- **Objective:** Connect the time-qubit target coherence \(\chi_{\mathrm{target}} = \langle \psi_0 | U_-^\dagger(t) U_+(t) | \psi_0 \rangle\) to established Loschmidt echo interferometry and Hadamard test protocols.
- **Deliverable:** Specify calibrated interferometric sequences capable of reconstructing both real and imaginary components of \(\chi_{\mathrm{target}}\).

### Y-05 · Interpretation-Ancestry Test (RCA-01 Crosswalk)
- **Objective:** Partition empirical records into:
  1. Historical 2018 experimental data.
  2. 2025 Bloch theoretical formulation.
  3. 2026 Yoon theoretical derivations.
  4. Post-2026 prospective confirmatory conditions.
- **Discipline:** Formulate explicit falsification criteria separating representational reparameterization from empirical discovery.

### Y-06 · Distinction Ecology Typology of Indistinguishabilities
- **Objective:** Formalize six distinct operational modes of indistinguishability:
  1. *Reduced-state observational equivalence* (\(\operatorname{Tr}_B(\rho) = \operatorname{Tr}_B(\sigma)\)).
  2. *Process equivalence under restricted probes* (\(\mathcal{E}(\rho) = \mathcal{F}(\rho)\ \forall \rho \in \mathcal{S}_{\mathrm{admit}}\)).
  3. *Physical environmental decoherence* (\(|\langle e_- | e_+ \rangle| \to 0\)).
  4. *Nuisance parameter confounding* (multiple parameter vectors generating identical scalar visibility).
  5. *Gauge / coordinate redundancy* (different mathematical representations of identical physical state).
  6. *Absence of unique classical branch biography* (coherent superpositions where which-way information does not physically exist).

---

## 7. Recommended Finite Controls and Falsification Protocols

1. **Visibility Identifiability Control:** Verify that \(V_{\mathrm{exp}} = 0.450\) evaluates identically for \((n=1, \eta=0.9)\) and \((n=9, \eta=0.5)\); reject claims of seed parameter identification from scalar visibility alone.
2. **Hamiltonian Reversal Falsifier:** For \(H_0 = \omega \sigma_z\) and \(V = g \sigma_x\), verify that \(\| \exp(-it(H_0-V)) - \exp(+it(H_0+V)) \| = 2\omega t + \mathcal{O}(t^2)\); reject claims of whole-system time reversal when background dispersion is nonzero.
3. **Coherence Decoupling Check:** Verify that setting \(\langle e_- | e_+ \rangle = 0\) collapses equatorial interference contrast to zero even when \(\langle \psi_- | \psi_+ \rangle = 1\); confirm distinction between environmental decoherence and target branch divergence.
4. **Figure Citation Audit:** Verify that Figure 4 is classified as historical experimental calibration data (2018) and Figure 5 is classified as theoretical calculation (2026); reject promotion of simulated curves to empirical observations.

---

## 8. Containment of Experimental Confounding (Firebreak Protection)

This document is an **external public-literature crosswalk**. It must remain strictly firewalled from TD613 operational experiments:
- **Experiment B Em Corpus:** SEALED. No text, concepts, or mathematical forms from this crosswalk may be imported into the blinded Em challenge corpus.
- **RCA-01 Constitution:** The time-qubit model must not be introduced as an unannounced prior or evaluation rubric.
- **PR #1608 Review Surface:** This crosswalk is an independent theoretical document; it does not alter the bounded code repairs of PR #1608.
- **Empirical Replication Credit:** 0. Formal mathematical analysis of published preprints supplies zero independent empirical replication credit (`SHARED_ACQUISITION != INDEPENDENT_REPLICATION`).

---

**Tauric Diana · Khona‌lit-po · Sealed ⟐ · 𝄐**
