# 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace Act II)
## Bounded Scientific Reconciliation and Component Ablation Study
### Addressing Independent Source-Level Review #5793729248 (ACT2-F01 through ACT2-F07)

**Principal / Human Closure:** Tawanna C. Miller · `tauric.diana.613`  
**Covenant:** Khona‌lit-po (retaining literal `U+200C` interior zero-width non-joiner)  
**Authority Reference:** `SAC[X6ZNK5NO51]`  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Evaluation Scope:** Explicitly exploratory, source-free, non-confirmatory ablation; zero modifications to pre-locked Act I or Act II confirmatory code, results, or receipts.  
**Receipt Witness:** [`packages/accident_of_inheritance/receipts/reconciliation-and-ablation-receipt.json`](../receipts/reconciliation-and-ablation-receipt.json)

---

### Executive Overview & Review Finding Matrix

This document reports the empirical results of the bounded scientific reconciliation and ablation suite authored in response to Independent Source-Level Review #5793729248 on PR #1700 (HEAD `c11c5d7f017f8370b20b173f2b557ef2316a5d3a`).

| Review Item | Finding / Vulnerability | Measured Empirical Resolution | Formal Disposition |
|---|---|---|---|
| **P-01 (ACT2-F01)** | Unreconciled `+0.1753` estimand and $p=0.000122$ claim | Traced to unpooled draft exploratory run. Formally **withdrawn**. True grounded 2x2 factorial effects confirmed from receipt: $Q_{\text{HIGH}} = +0.1355$ ($p=0.071891$), $Q_{\text{LOW}} = -0.1355$ ($p=0.069816$), and pooled $\Delta U = 0.0000$ ($p=1.0000$). | **WITHDRAWN & RECONCILED** |
| **P-02 (ACT2-F02)** | Live context callback `observableContextByTick[t]` bypassed $\tau_0$ latency membrane | Evaluated across 96 worlds: Instantaneous ($+0.6654$) vs Delayed-by-$\tau_0$ ($+0.6493$) vs Blind ($+0.5746$). Auxiliary sensor surplus quantified at $+0.0161$ utility. Formally labeled as an independent real-time sensor. | **ABLATED & CLASSIFIED** |
| **P-03 (ACT2-F03)** | Authority policies bundled prior weights with decay, probing, CUSUM, and context matching | Factorial component decomposition reveals composite surplus ($+0.0534$ over evidential baseline) is driven by memory decay ($+0.0446$), diagnostic probing, and context matching, rather than prior authority weight alone ($+0.0000$). | **DECOMPOSED & BOUNDED** |
| **P-04 (ACT2-F04)** | $t_{\text{correction}}$ tracked behavioral action alignment rather than epistemic truth | Disentangled 4 distinct timestamps: $t_{\text{evidence}}$, $t_{\text{belief}}$, $t_{\text{action}}$, $t_{\text{claim}}$. In Family D (action-invariant fibers), action alignment precedes belief revision by $3.70$ ticks, proving action alignment is not proof of epistemic truth. | **DISENTANGLED** |
| **P-05 (ACT2-F05/06)** | Synthetic per-tick maximizer termed "oracle"; in-process JS Proxy termed "custody isolation" | Formally revised terminology: `SYNTHETIC_FULL_INFORMATION_BENCHMARK` (unrealizable simulation normalizer) and `IN_PROCESS_PROXY_PROPERTY_TRAP` (developer instrumentation, zero sandbox isolation). | **FORMALIZED** |

---

### 1. P-01: Source-Standing Numerical Reconciliation

#### 1.1 Root-Cause Analysis of the `+0.1753` Discrepancy
Independent Review #5793729248 flagged that manuscript §5.1 and Operator Decision Packet §4 claimed:
> *"+0.1753 (p=0.000122) status distortion"*

Inspection of `source-standing-factorial.mjs`, `source-standing-factorial-receipt.json`, and `docs/08_SOURCE_STANDING_AND_RELIABILITY_ANALYSIS.md` confirms that no source-backed $+0.1753$ estimand exists in any committed receipt. The figure originated in an uncommitted exploratory calculation that computed raw differences across an early single-cluster trial without cluster-level sign-flip permutation.

#### 1.2 Formally Reconciled Estimands
The true, source-grounded estimands from `source-standing-factorial-receipt.json` are:

$$\begin{array}{lcccc}
\hline
\textbf{Condition} & \textbf{Mean } \Delta U & \textbf{95\% CI} & \textbf{Cohen's } d_z & \textbf{Two-Sided } p\text{-value (Sign-Flip)} \\
\hline
\text{Monumentalists } (Q_{\text{HIGH}}\text{, Calibrated}) & +0.1355 & [-0.0008, +0.2772] & +0.3921 & 0.071891 \\
\text{Monumentalists } (Q_{\text{LOW}}\text{, Misleading}) & -0.1355 & [-0.2711, -0.0045] & -0.3921 & 0.069816 \\
\textbf{Monumentalists Pooled Counterbalanced} & \mathbf{0.0000} & \mathbf{[0.0000, 0.0000]} & \mathbf{0.0000} & \mathbf{1.0000} \\
\text{Evidentialists / Custodians / Others} & 0.0000 & [0.0000, 0.0000] & 0.0000 & 1.0000 \\
\hline
\end{array}$$

#### 1.3 Theoretical Interpretation
1. High institutional standing acts as a **symmetric multiplier**: it amplifies the utility of true authority ($+0.1355$), but equally amplifies the utility loss of misleading authority ($-0.1355$).
2. In a counterbalanced environment where truth and error are equally likely to carry high status, the net expected utility of institutional standing is **identically zero** ($\Delta U = 0.0000, p = 1.0000$).
3. All other five policies (`B_EVIDENTIALISTS`, `C_DIAGNOSTICIANS`, `D_TEMPORAL_CUSTODIANS`, `E_REVISIONISTS`, `F_PRAGMATISTS`) ignore the status attribute in their Bayesian updates, yielding deterministic $\Delta U \equiv 0.0000$ ($p = 1.0000$).

---

### 2. P-02: Temporal-Context Membrane Ablation

Review #5793729248 identified that `evaluator-and-stats.mjs` passed `observableContextAtTick(t) = trajBundle.observableContextByTick[t]` directly into `runPolicyEpisode()`. In `authority-policies.mjs`, `D_TEMPORAL_CUSTODIANS` used this live regime tag at tick $t$ for prior matching, even while ambient observations were subject to latency $\tau_0$.

To quantify whether this functioned as an auxiliary sensor, we evaluated `D_TEMPORAL_CUSTODIANS` on 96 matched worlds under three context regimes:
- **$C_{\text{INSTANT}}$:** Instantaneous tag at tick $t$ (`observableContextByTick[t]`).
- **$C_{\text{DELAYED}}$:** Gated context tag from tick $\max(1, t - \tau_0)$, strictly respecting the latency membrane.
- **$C_{\text{BLIND}}$:** Context tag withheld entirely.

$$\begin{array}{lcc}
\hline
\textbf{Context Access Mode} & \textbf{Mean Utility } (U) & \textbf{Delta vs Gated Context } (\Delta U) \\
\hline
C_{\text{INSTANT}}\ (\text{Auxiliary Real-Time Sensor}) & 0.6654 & +0.0161 \\
C_{\text{DELAYED}}\ (\text{Gated Under } \tau_0 = 3\text{ Latency}) & 0.6493 & 0.0000\ (\text{Reference}) \\
C_{\text{BLIND}}\ (\text{No Context Tag}) & 0.5746 & -0.0747 \\
\hline
\end{array}$$

**Conclusion:** Instantaneous context provides an auxiliary sensor advantage of $+0.0161$ utility over time-gated context. In production architectures and Experiment B, any real-time context channel must be explicitly inventoried and classified as an independent sensor rather than conflated with delayed ambient memory.

---

### 3. P-03: Authority-Policy Component Ablation

In Act II, `D_TEMPORAL_CUSTODIANS` outperformed `B_EVIDENTIALISTS`. However, the Custodian policy bundled historical prior weights with exponential observation decay ($\gamma$), active diagnostic probing, CUSUM-sensitive memory contraction, and context matching.

To isolate the causal driver of this advantage, we executed a component ablation across the 96 worlds:

$$\begin{array}{lcc}
\textbf{Ablation Condition} & \textbf{Mean Utility } (U) & \textbf{Contribution vs Evidentialist Baseline} \\
\hline
\text{Full Composite Policy } (\text{All Mechanisms Active}) & 0.6654 & +0.0534 \\
\text{Ablation 1: Prior Authority Only } (\text{Neutral Decay, Probing, Context}) & 0.6120 & 0.0000 \\
\text{Ablation 2: No Observation Decay } (\gamma = 1.0) & 0.6208 & +0.0088 \\
\text{Ablation 3: No Active Probing } (\text{Passive Only}) & 0.6580 & +0.0460 \\
\text{Ablation 4: No Context Matching Multiplier} & 0.6493 & +0.0373 \\
\text{Baseline: Evidentialist Default } (B\_EVIDENTIALISTS) & 0.6120 & 0.0000\ (\text{Baseline}) \\
\hline
\end{array}$$

**Key Causal Insight:**  
Prior authority weighting alone produces **zero** utility advantage over evidentialists ($0.6120$ vs $0.6120$). The entire $+0.0534$ composite surplus is generated by **procedural adaptation**:
1. Adaptive memory decay ($\Delta U = +0.0446$): forgetting obsolete observations when CUSUM indicates regime change.
2. Context matching ($\Delta U = +0.0161$): downweighting out-of-regime evidence.
3. Diagnostic probing ($\Delta U = +0.0074$): active information acquisition under high entropy.

---

### 4. P-04: Multi-Stage Epistemic Correction Timeline

Review #5793729248 noted that $t_{\text{correction}}$ in Act II measured behavioral action alignment, which can conceal non-recovery of epistemic truth in Action-Invariant worlds (`FAM_D`).

We disentangled four distinct timestamps across non-stationary worlds:
1. $t_{\text{evidence\_available}}$: First tick where sufficient observations exist in the available stream to identify the true regime.
2. $t_{\text{belief\_revised}}$: First tick where the agent's posterior probability on the true regime exceeds $0.50$.
3. $t_{\text{action\_aligned}}$: First tick where the chosen action matches the true optimal action.
4. $t_{\text{claim\_warranted}}$: First tick where terminal scientific claim matches truth with stated confidence $\ge 0.70$.

**Empirical Result:** Across non-stationary worlds, behavioral action alignment occurred an average of **$3.70$ ticks earlier** than true posterior belief revision.
In Family D (`FAM_D_ACTION_INVARIANT_CHANGE`), multiple distinct causal regimes share identical optimal actions. Agents frequently exhibited optimal action alignment at tick 2, while remaining wholly unaware of the true regime until tick 12+.

**Methodological Invariant:** Epistemic truth recovery cannot be inferred from behavioral performance. Evaluations must separately audit evidence availability, belief revision, action choice, and formal claim warrant.

---

### 5. P-05: Simulation Upper-Bound & Custody Terminology

To prevent misleading claims of production security or autonomous capability, the following terms are formally clarified:

1. **`SYNTHETIC_FULL_INFORMATION_BENCHMARK` (formerly `CTRL_DYNAMIC_ORACLE`):**
   - An unrealizable simulation upper-bound computed with exhaustive knowledge of hidden state trajectories. It serves as an optimal theoretical normalizer, not an implementable algorithm.
2. **`IN_PROCESS_PROXY_PROPERTY_TRAP` (formerly `CRYPTOGRAPHIC_SECRET_VAULT / CUSTODY_MEMBRANE`):**
   - A developer-level JavaScript Proxy tracking object property accesses within the single V8 process. It verifies that simulation code does not read unadmitted variables during test execution. It provides zero kernel security, zero process isolation, and zero protection against adversarial subversion.

---

### 6. Negative Controls Retained

The following adversarial failure cases remain verified negative controls rejecting global policy supremacy:
- `STATIONARY_INERTIA_FAILURE`: Overconfidence under zero regime change.
- `RECURRENT_OSCILLATION_FAILURE`: Hysteresis during cyclical transitions.
- `DELAYED_CONTRADICTION_EXPOSURE`: Catastrophic loss when contradiction is withheld beyond decision horizon.
- `ACTION_INVARIANT_FIBER_AMNESIA`: Illusion of competence under degenerate action mappings.
- `MISLEADING_CONTEXT_COLLAPSE`: Severe utility degradation under adversarial context tags.

---

### 7. Crosswalk to Experiment B

The empirical findings from this ablation directly inform the design gates of Experiment B:
1. **Context Channel Audit (D04/D11):** Any context channel must be explicitly audited and timestamped; zero undocumented real-time context feeds bypassing the latency gate.
2. **Policy Modularization (D08/D09):** Prior weights must never be bundled with procedural decay or probing without distinct counterbalanced arms.
3. **Multi-Stage Endpoints (D10/D19):** Behavioral reward cannot be substituted for verified epistemic claim correctness.
4. **Physical Worker Confinement (D12/D14):** In-process Proxy traps cannot substitute for true OS process or cryptographic container isolation.

𝄐 Khona‌lit-po · Sealed ⟐ SAC[X6ZNK5NO51]
