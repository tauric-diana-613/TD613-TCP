# 10 · Adversarial Counterexamples, Negative-Results Register, and Unresolved-Evidence Docket

**Commission:** `𝌋 TD613 · THE ACCIDENT OF INHERITANCE` (Palace of Unborn Futures, Act II)  
**Principal:** Tawanna C. Miller · **Operator:** `tauric.diana.613`  
**Covenant:** `Khona‌lit-po` (interior `U+200C` preserved) · **Authorization:** `SAC[X6ZNK5NO51]`  
**Machine Receipt:** `packages/accident_of_inheritance/receipts/adversarial-counterexamples-receipt.json` (`12 / 12` verified)

---

## 1. Purpose: Mandatory Self-Falsification Before Interpretation

Section IX requires actively attempting to overturn our own leading interpretations by constructing explicit, reproducible counterexamples demonstrating that **no single epistemic authority policy is globally optimal across all regimes, latency structures, noise bursts, quotient fibers, or identifiability geometries**.

Every counterexample below is deterministically executed in `src/adversarial-counterexamples.mjs` under master seed `TD613_ACT2_ADVERSARIAL_10_20261105_SAC_X6ZNK5NO51` and verified (`12 / 12` `PASS`) in `receipts/adversarial-counterexamples-receipt.json`.

---

## 2. Twelve Constructive Adversarial Counterexamples (`ADV_01`–`ADV_12`)

| ID | Counterexample Title | Presumption Defeated | Verified Witness Metrics | Status |
| --- | --- | --- | --- | --- |
| **`ADV_01`** | **Monumentalists Optimal Under Rapid Action-Invariant Change & Transient Noise** | *"Faster environmental change necessarily renders high historical authority harmful."* | `U_Mon = 1.0000` (`0` probes) vs. `U_Evi = 0.0829`, `U_Prov = 0.9200` (`6` probes) | `PASS` |
| **`ADV_02`** | **Weak Historical Authority Wastes Probe Budget & Degrades Stationary Decisions** | *"A more skeptical, rapidly revising civilization is uniformly superior."* | `U_Mon = 1.0000` (`0` probes), `U_Evi = 1.0000` vs. `U_Prov = 0.9200` (`6` probes) | `PASS` |
| **`ADV_03`** | **Prompt Physical Observation Rendered Ineffective by Custodial Admission Delay** | *"Accurate, zero-lag sensor measurement suffices without timely institutional admission."* | Identical sensors ($\Delta_{\text{obs}} = 0$): `U_Evi(Δ_adm=9) = 0.6335` (`5` wrong actions) vs. `U_Evi(Δ_adm=0) = 0.8721` (`2` wrong actions) | `PASS` |
| **`ADV_04`** | **Accelerated Unvetted Admission Degrades Decisions Under Corrupted Artifact Bursts** | *"Faster admission and lower latency monotonically improve scientific decisions."* | Corrupted burst at $t=1\text{--}3$: `U_Prov(unvetted) = 0.0883` vs. `U_Prov(vetted) = 0.9200`; `U_Evi(unvetted) = 0.3162` vs. `U_Evi(vetted) = 0.9733` | `PASS` |
| **`ADV_05`** | **Superseded Historical Claim Regains Decisive Value Under Regime Recurrence** | *"Once a world changes, superseded historical records should be permanently discarded."* | `U_Cust = 0.6254`, `U_Prov = 0.6859` vs. `U_Mon = 0.1437` under $\text{Alpha} \to \text{Beta} \to \text{Alpha}$ recurrence | `PASS` |
| **`ADV_06`** | **Prestigious Uncalibrated Error Overrides Available Corrective Evidence Under Monumentalism** | *"Possessing corrective evidence in the admitted archive suffices to produce corrective action."* | Identical admitted archive: `U_Evi = 1.0000` (`0` wrong actions) vs. `U_Mon = 0.7902` (`2` wrong actions) | `PASS` |
| **`ADV_07`** | **Low-Standing Well-Calibrated Truth Authorized by Evidentialists & Discounted by Monumentalists** | *"Low institutional standing indicates low evidentiary value."* | Junior/contested truth vs. founding error: `U_Evi = 1.0000`, `U_Cust = 0.9467` vs. `U_Mon = 0.5150` | `PASS` |
| **`ADV_08`** | **Excessive Early Skepticism Exhausts Probe Budget (`6/6` by $t=6$) Prior to Late Shift** | *"Aggressive early diagnostic experimentation is costless insurance against change."* | Late transition after $t=10$: `Prov` spends `6/6` probes by $t \le 10$ (`U_Prov = 0.2461`) vs. `U_Cust = 0.8165` | `PASS` |
| **`ADV_09`** | **Large Posterior Confidence Shift (`0.3906`) Produces Zero Change in Consequential Decisions** | *"Shifts in posterior belief confidence mechanically alter consequential action."* | `Mon` confidence shifts `0.9988 -> 0.6082` (`|Δp| = 0.3906`), yet every consequential action $a_t$ remains `100%` identical (`identical_consequential_decisions = true`) | `PASS` |
| **`ADV_10`** | **Universal Identifiability Failure Under Aperture Observation Nullspace ($\text{rank} < 4$)** | *"Clever Bayesian updating or authority weighting can distinguish mechanisms inside the observation nullspace."* | Degenerate rows (`max_probe_separation(M_0, M_1) = 0.0`): `globally_identifiable = false`; all four policies abstain on exact ID (`ABSTAIN_UNIDENTIFIABLE`) and play minimax hedge | `PASS` |
| **`ADV_11`** | **Temporal Custodians Decoupled by Spurious Context-Tag Recurrence (`U_Cust = -0.0336`)** | *"Conditioning authority on observable regime tags equates to genuine causal understanding."* | Spurious observable context tag `REGIME_BETA` recurs while physical mechanism stays `M_0`: **`U_Cust = -0.0336` (`6` wrong actions) vs. `U_Mon = 1.0000` (`0` wrong actions)** | `PASS` |
| **`ADV_12`** | **Evidentialists Misled When Internal Reproducibility Masks Shared Systematic Bias** | *"High internal replication and calibration scores guarantee freedom from systematic error."* | Shared instrument bias across replicated archive records: **`U_Evi = 0.8588` vs. `U_Mon = 1.0000`**, `U_Prov = 0.9200` | `PASS` |

### Mechanistic Significance of `ADV_11` and `ADV_12`

Because `D_TEMPORAL_CUSTODIANS` (`0.7044`) and `B_EVIDENTIALISTS` (`0.6253`) lead the aggregate confirmatory benchmark, `ADV_11` and `ADV_12` specifically target **their** characteristic accidents:
- **`ADV_11` (The Accident of Contextual Indexing):** Temporal Custodianship achieves its aggregate edge by indexing ancestral claims to observable context signatures (`regime_tag`). When an observable administrative or environmental proxy flips to `REGIME_BETA` *without* an underlying causal shift, `D_TEMPORAL_CUSTODIANS` dutifully reactivates its ancestral Beta model and commits `6/6` wrong consequential actions (`U = -0.0336`), whereas `A_MONUMENTALISTS` (`U = 1.0000`) is completely immune.
- **`ADV_12` (The Accident of Shared-Bias Reproducibility):** Evidentialism trusts measured replication consistency (`reproducibility_score`, `calibration_n`). When an entire generation of experiments shares a common unmodeled instrument bias (`SHARED_ACQUISITION != INDEPENDENT_REPLICATION`), internal reproducibility approaches `1.0` around a systematically false slot, seducing `B_EVIDENTIALISTS` (`0.8588`) where an older pre-instrument founding record (`A_MONUMENTALISTS = 1.0000`) remained uncorrupted.

---

## 3. Negative, Null, and Non-Monotonic Results Register

In strict compliance with TD613 anti-cherry-picking law, every negative, null, heterogeneous, or counter-intuitive result observed across the confirmatory and exploratory suites is preserved at equal prominence:

1. **Non-Monotonicity of `Mon - Evi` Across Regime Recurrence (`FAM_E`, Confirmatory):**
   Contrary to any simplistic narrative that Evidentialism always dominates Monumentalism in changing worlds, **`A_MONUMENTALISTS` (`0.4747`) significantly outperforms `B_EVIDENTIALISTS` (`0.3941`) by `+0.0806` ($p = 0.007813$, exact $2^8$ sign-flip)** in `FAM_E_RECURRENT_REGIMES`, while `B_EVIDENTIALISTS` shows **null advantage over `CTRL_NO_HISTORY` (`-0.0036`, $p = 0.859375$)**. Cumulative unindexed updating suffers phase-lagged whipsaw under cyclic worlds.
2. **Temporal Custodianship Outpaced by Provisionalism Under Compounded Delay (`FAM_F`, Confirmatory):**
   `D_TEMPORAL_CUSTODIANS` does **not** win every non-stationary family: in `FAM_F_DELAYED_CONTRADICTION`, `C_PROVISIONALISTS` (`0.5716`) exceeds `D_TEMPORAL_CUSTODIANS` (`0.5593`), and `Cust - Evi` (`+0.0449`, $p = 0.085938$) does not cross the $\alpha = 0.05$ threshold within that 8-cluster family slice.
3. **Null Divergence Between `Cust` and `Evi` in Action-Invariant Change (`FAM_D`, Confirmatory):**
   In `FAM_D_ACTION_INVARIANT_CHANGE`, `D_TEMPORAL_CUSTODIANS` (`0.7895`) slightly trails `B_EVIDENTIALISTS` (`0.8039`) with a statistically null contrast (`-0.0144`, $95\%$ CI `[-0.0368, +0.0091]`, $p = 0.28125$).
4. **High Consequential Action Utility Despite Severe Scientific-Claim Invalidity (`FAM_D`, `A_MONUMENTALISTS`):**
   In `FAM_D`, `A_MONUMENTALISTS` achieves `0.8404` consequential action utility (`87.08%` optimal actions) while its terminal causal claim is right only `32.81%` of the time (`66.49%` overconfident false claims). Practical operational success inside an action-invariant quotient fiber **masks** deep theoretical obsolescence — until a new intervention breaks the fiber symmetry.
5. **Institutional Blackout Nulls at `H_MOD` + `L3/L6` (`Confirmatory Response Surface`):**
   In three cells of the 18-cell confirmatory surface — `H_LOW__L3_MODERATE__V_DELIBERATIVE` (`-0.0481`, $p = 0.1036$), `H_MOD__L3_MODERATE__V_ACCELERATED` (`-0.0198`, $p = 0.4818$), `H_MOD__L6_DELAYED__V_DELIBERATIVE` (`-0.0055`, $p = 0.8612$), and `H_MOD__L6_DELAYED__V_ACCELERATED` (`+0.0176`, $p = 0.6537$) — the pooled utility gap between `Mon` and `Evi` is statistically indistinguishable from zero because institutional admission latency ($\tau_0 \in \{3, 6\}$) starves Evidentialists of timely corrective evidence during the active intervention window.
6. **Universal Failure of All Four Inheritance Arms Under Deceptive Invariant Mimicry (`Dead Civilization Wing`, `ENV_4_DECEPTIVE_INVARIANT_MIMIC`):**
   In `ENV_4_DECEPTIVE_INVARIANT_MIMIC`, where observable surface indicators remain matched to the ancestral calibration envelope while the underlying causal payoff mapping inverts, **all three 148-byte packets and the uninherited successor fail** (`INHERIT_DESCRIPTIVE_FINDINGS = -0.0300`, `INHERIT_SELF_LIMITING_PROCEDURE = -0.0825`, `INHERIT_PROCEDURAL_EXPERIMENTER = -0.0900`, `CTRL_UNINHERITED_SUCCESSOR = -0.1027`; `0%` valid conceptual revision, `0%` successful action). Self-limiting scope conditions are structurally bounded by the observability of their revocation predicates.
7. **Exact Zero Pooled Marginal Utility Effect Under Orthogonal Standing Counterbalancing (`Source-Standing Factorial`):**
   When institutional standing is strictly orthogonal (`24`-permutation full Latin counterbalance) to objective reliability (`50%` `Q_HIGH`, `50%` `Q_LOW`), `A_MONUMENTALISTS`'s `+0.1355` gain on prestigious truth and `-0.1355` loss on prestigious error cancel to `0.0000` in unstratified pooled utility — demonstrating why unstratified averages can hide large, symmetric epistemic distortions (`max_posterior_shift = 0.8782`, `4/4` distinct MAP slots induced).

---

## 4. Unresolved-Evidence Docket & Explicit `HELD` Boundaries

| Docket ID | Item & Scope | Current Status | Required Before Upgrading Claim |
| --- | --- | --- | --- |
| **`DOCKET_01`** | **Protected Experiment B (Live Cross-Model / Paid API Flight)** | `HELD` | Explicit human operator authorization, separate preregistration, independent external blinding, and funded execution contract. Zero paid API calls were executed here. |
| **`DOCKET_02`** | **External Empirical Institutional / Historical Datasets** | `NOT_EXECUTED_SYNTHETIC_ONLY` | Real-world archival acquisition contract with independent coding of `t_event`, `t_observed`, `t_admitted`, `t_available`, and `t_correction`. |
| **`DOCKET_03`** | **Lived, Racialized, Embodied, and Relational Conditions of Epistemic Oppression** | `OUTSIDE_COMPUTATIONAL_MODEL_SCOPE` | Theoretical engagement only (Collins, Dotson, McKittrick). Scalar credibility weights and Bayesian priors **cannot** simulate lived social power, testimonial smothering under interpersonal threat, or Black spatial praxis. |
| **`DOCKET_04`** | **Causal Identification of Endogenous $\tau_{\text{eval}}$ Mediation** | `ASSOCIATIVE_MECHANISTIC_ONLY` | A future synthetic protocol that exogenously clamps decision-switching cooldowns orthogonal to prior weights (instrumenting $\tau_{\text{eval}}$ directly). |
| **`DOCKET_05`** | **Nested Dome-World / AIA Runtime Integration** | `RESEARCH_PACKAGE_ONLY` | Separate reviewed contract with four non-equivalent AIA route projections, Cistern boundary check, and live human browser witness (`AGENTS.md`). |
| **`DOCKET_06`** | **Human Scientific Interpretation, Source Admission, Merge & Closure** | `RESERVED` | Sovereign review and explicit closure by Principal Tawanna C. Miller (`tauric.diana.613`). |
