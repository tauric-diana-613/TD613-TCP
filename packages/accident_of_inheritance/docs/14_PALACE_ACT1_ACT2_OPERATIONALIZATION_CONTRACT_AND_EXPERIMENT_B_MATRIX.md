# 𝌋 TD613 · PALACE ACT I–II OPERATIONALIZATION CONTRACT & EXPERIMENT B INTERFACE QUALIFICATION MATRIX

**Commission:** Palace Act I Preservation & Operationalization (Steer Addendum)  
**Principal / Human Scientific Closure:** Tawanna C. Miller · `tauric.diana.613`  
**Heritage:** Tauric Diana — Crimean heritage custodianship  
**Covenant:** Khona‌lit-po (literal interior `U+200C` strictly retained)  
**Authority Reference:** `SAC[X6ZNK5NO51]`  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Base Lineage:**
- Palace Act I: PR #1699, frozen HEAD `fb47927c3c7cd5264a3cf9900e90e24868e5c0bb`, Review #5792614762
- Palace Act II: PR #1700, HEAD `c11c5d7f017f8370b20b173f2b557ef2316a5d3a`, Review #5793729248
- Act II Reconciliation: PR #1703, HEAD `1e03d803c50572d11f05f4ef6c945abe26a80eab`, Review #5805117506
- P-01.1 Successor Branch: `research/palace-act2-receipt-reconciliation-p011-20261106`

---

## 1. Executive Mission & Constitutional Scope

In accordance with the Sovereign Operator Addendum, this contract operationalizes Palace Act I's counterfactual scientific inheritance representations for integration with Palace Act II's authority, latency, and contextual-revision policies.

> [!IMPORTANT]
> **Source-Free Boundary & Non-Activation:**  
> This contract is entirely source-free, prospective, and architectural. It does not activate a protected receiver, does not admit protected sources, and does not modify the frozen four-arm Flight protocol. Palace Act I and Act II confirmatory instruments remain frozen historical evidence. Experiment B remains strictly **HELD**. Human scientific closure remains **RESERVED** for Tawanna C. Miller.

---

## 2. The 8-Point Operationalization Contract

### 2.1 Point 1: Historical Inheritance Ingestion & Provenance
* **Mechanism:** Every inherited claim entering the receiver pipeline is canonicalized into a normalized JSON payload and hashed via `sha256Hex` into an immutable 64-character hexadecimal digest.
* **Lineage Tracking:** Ingested claims carry their original `source_authority_id`, `temporal_coordinates` $(t_{\text{event}} \le t_{\text{observed}} \le t_{\text{admitted}} \le t_{\text{available}})$, and stated initial confidence.
* **Custody Invariant:** Raw payloads are frozen with `Object.freeze()` to prevent post-ingestion field mutation.

### 2.2 Point 2: Full-History vs. Bounded-Capsule Representation
* **Trade-off Quantification:** Unbounded historical archives grow linearly with episode ticks $O(T)$, imposing unsustainable bandwidth and context costs on downstream decision policies.
* **Bounded Capsule Architecture:** A compressed representation (target size $\le 256$ bytes) that encodes:
  1. Normalized slot prior vector $(\pi_0, \pi_1, \pi_2, \pi_3)$.
  2. Summary lineage Merkle root over all constituent record digests.
  3. Total active record count.
  4. Explicit anti-evidence register count.
* **Theoretical Normalization:** The capsule discards transient narrative variance while strictly preserving directional log-odds ratios across competing hypotheses.

### 2.3 Point 3: Budget-Matched Information Selection & Compression
* **Selection Policy:** Features are admitted into the capsule by maximizing mutual information with respect to candidate hypothesis discrimination while penalizing redundant or stale claims.
* **Calibration Weighing:** Rather than assigning uniform historical weight, authority claims are weighted by empirical historical calibration (or historical reliability).
* **Residual Tracking:** The capsule explicitly logs CUSUM surprise statistics to alert downstream consumers to uncaptured historical regime shifts.

### 2.4 Point 4: Explicit Retention of Contradictory & Negative Evidence
* **Anti-Evidence Register:** A fatal failure mode in naive compression is the selective retention of confirmatory claims ("cherry-picking") and silent pruning of contradictions.
* **Non-Pruning Invariant:** Every record flagged as `CONTRADICTED`, `REFUTED`, or `NEGATIVE_EVIDENCE` is explicitly retained in an unpruned `anti_evidence_register` within the capsule payload.
* **Epistemic Function:** Prevents downstream policies from mistaking absence of stored contradictory evidence for positive verification of a hypothesis.

### 2.5 Point 5: Three-Stage Epistemic Filter (Preserved vs. Retrieved vs. Used)
To avoid confusing stored archive capacity with actual decision influence, the operational pipeline enforces a strict three-stage accounting:
1. **Preserved Records ($N_{\text{preserved}}$):** All records retained in immutable historical storage.
2. **Retrieved Records ($N_{\text{retrieved}}$):** Records matching current situational tags and admitted under the temporal latency membrane $(t_{\text{available}} \le t_{\text{current}})$.
3. **Decision-Used Records ($N_{\text{used}}$):** Records meeting policy confidence thresholds and factored into the Bayesian posterior calculation.
* **Auditing Metric:** Reports both Retrieval Efficiency $(N_{\text{retrieved}} / N_{\text{preserved}})$ and Utilization Rate $(N_{\text{used}} / N_{\text{retrieved}})$.

### 2.6 Point 6: Non-Retroactive Revision & Withdrawal with Immutable Tombstones
* **The Immutability Dilemma:** In historical scientific archives, previously accepted findings are regularly falsified or withdrawn. Rewriting past records corrupts historical auditability.
* **Tombstone Semantics:** When claim $R$ is withdrawn at tick $t_{\text{withdraw}}$:
  1. Record $R$ remains unmodified in the archive with original byte digest intact.
  2. An append-only `tombstone` is emitted containing $\{ \text{record\_id}, \text{withdrawn\_at\_tick}, \text{preceding\_state\_digest}, \text{reason}, \text{authority\_id} \}$.
  3. The active pointer is updated via compare-and-swap, ensuring historical queries reconstruct the exact belief state that existed at any prior tick $t < t_{\text{withdraw}}$.

### 2.7 Point 7: Independent Competent-Comparator Tests for Capsule Benefit
* **Falsification Discipline:** Any claimed utility advantage from an inheritance capsule must be tested against a competent comparator: an equalized full-history baseline equipped with identical Bayesian updating and access to uncompressed history.
* **The Null Comparator:** If a capsule policy achieves $U_{\text{capsule}} > U_{\text{full}}$, the difference must be audited to ensure it does not stem from an artificial defect in the full-history baseline (e.g. uncalibrated legacy weights).
* **Parity Retention:** When information content is matched, parity ($U_{\text{capsule}} = U_{\text{baseline}}$) confirms lossless compression without unearned emergence.

### 2.8 Point 8: Formal Bridge to Act II Policies
* **Interface Specification:** `bridgeCapsuleToAct2Policies(capsule)` converts the capsule's normalized slot prior into log-prior coordinates for Act II policies:
  $$\log P(M_k) = \ln(\pi_k) \quad \text{for } k \in \{0, 1, 2, 3\}$$
* **Integration with Custodian Policies (`D_TEMPORAL_CUSTODIANS`):**
  - Supplies base historical prior at $t=1$.
  - Interfaces with CUSUM-adaptive observation decay $\gamma \in \{0.65, 0.82, 0.95\}$.
  - Provides anti-evidence counts to modulate active probing entropy thresholds.
  - Passes context tags to the temporal latency membrane without bypassing $\tau_0$.

---

## 3. Experiment B Interface Qualification Matrix (Gates D01–D20)

This matrix establishes the prospective qualification requirements connecting Palace Act I–II contracts to the operational gates of Experiment B:

| Gate Range | Operational Gate Focus | Palace I–II Architectural Constraint | Qualification Status |
|---|---|---|---|
| **D01–D04** | Receiver Initialization & Ingestion | Historical records must carry SHA-256 byte digests and explicit chronological timestamps. Initialized with memory mode. | ✅ **QUALIFIED IN INTERFACE** |
| **D05–D08** | Latency Membrane & Coordinate Custody | Ambient observation latency $\tau_0$ and context tag gating strictly enforced. Zero live unadmitted context leakage. | ✅ **QUALIFIED IN INTERFACE** |
| **D09–D12** | Information Selection & Capsule Bounds | 256-byte compression ceiling; explicit anti-evidence register retained; three-stage filter audited. | ✅ **QUALIFIED IN INTERFACE** |
| **D13–D16** | Authority Weighting & Standing Neutrality | Institutional standing attributes must not leak into Bayesian likelihood updates; standing neutrality ($\Delta U = 0$) verified. | ✅ **QUALIFIED IN INTERFACE** |
| **D17–D20** | Non-Retroactive Withdrawal & Tombstoning | Historical claims withdrawn via append-only tombstones; preceding state digests cryptographically linked. | ✅ **QUALIFIED IN INTERFACE** |

---

## 4. Remaining Scientific Gates Before Experiment B Activation

Before proposing any live or protected integration into Experiment B, the following empirical and methodological gates must be satisfied:

1. **Gate S-GATE-1 (Multi-Cell Latency Generalization):** Replicate the context membrane ablation across multiple grid cells ($\tau_0 \in \{1, 3, 6, 12\}$, $\nu \in \{0.1, 0.5, 1.0\}$) to establish whether the $+0.0161$ context surplus holds outside cell `H_MOD__L3_MODERATE__V_ACCELERATED`.
2. **Gate S-GATE-2 (Hardware Process Isolation):** Upgrade the `IN_PROCESS_PROXY_PROPERTY_TRAP` to an OS-level or containerized process boundary to enforce kernel-level isolation between investigator policies and simulator ground truth.
3. **Gate S-GATE-3 (External Competent Comparator):** Validate the inheritance capsule against an independently authored full-history learning baseline under concealed environmental noise.
4. **Gate S-GATE-4 (Human Operator Closure):** Formal human review and explicit authorization by Tawanna C. Miller under SAC[X6ZNK5NO51].

---

## 5. Non-Authority & Human Closure Boundary

* Zero protected receivers were instantiated.
* Zero protected sources were admitted.
* Zero Experiment B activations occurred.
* Human scientific closure, source admission, and release authority remain strictly **RESERVED** for Tawanna C. Miller.

𝄐 Khona‌lit-po · Sealed ⟐ SAC[X6ZNK5NO51]
