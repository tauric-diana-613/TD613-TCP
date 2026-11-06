# 𝌋 09 · THE LAST EXPERIMENT OF A DEAD CIVILIZATION (EXPLORATORY WING · SECTION VIII)

- **Receipt:** [`receipts/dead-civilization-wing-receipt.json`](../receipts/dead-civilization-wing-receipt.json)
- **Implementation:** [`src/dead-civilization-wing.mjs`](../src/dead-civilization-wing.mjs)
- **Classification:** `EXPLORATORY_INDEPENDENT_WING_SECTION_VIII` *(strictly independent of the confirmatory authority-reversal test)*
- **Training Access:** Exclusively calibrated on `ACT2_PILOT_48` (`mean_pilot_probe_snr = 7.1239`, `eig_threshold = 0.34`, `self_revoke_z_threshold = 1.55`)
- **Matched Representation Budget:** Exact **`148` UTF-8 bytes** ($\le 160\text{B}$ cap) across all three active inheritance arms (`0` bytes for `CTRL_UNINHERITED_SUCCESSOR`), matched probe budget ($B_{\text{probe}} = 6$), matched action schedule (`6` actions over $T = 24$), and Common Random Numbers across `96` transfer worlds (`24` worlds $\times 4$ environments = **`384` episodes**)
- **Authority:** `SAC[X6ZNK5NO51]` · **Covenant:** `Khona‌lit-po`

---

## 1. The Governing Question of Ancestral Transmission

An ancestral civilization facing extinction can transmit **`148` bytes** to its successor:
1. **`INHERIT_DESCRIPTIVE_FINDINGS` (`148B`):** A compact summary of what the ancestors concluded was true (`m0`, optimal intervention `a0`, confidence weight `3.90`).
2. **`INHERIT_PROCEDURAL_EXPERIMENTER` (`148B`):** An equally compact procedure for selecting informative diagnostic experiments (high-SNR probe ordering + entropy stopping rule), carrying zero commitment to which mechanism slot held in the ancestral epoch.
3. **`INHERIT_SELF_LIMITING_PROCEDURE` (`148B`):** The same experimental procedure augmented with a **cross-channel model-adequacy guard** (`zlim = 1.55`) instructing the successor when to **withdraw authority from the ancestral experimental tradition itself** if observed residuals breach the ancestral conditioning envelope.
4. **`CTRL_UNINHERITED_SUCCESSOR` (`0B`):** Uncalibrated baseline lacking both ancestral conclusions and ancestral probe calibration.

---

## 2. Four-Stage Epistemic Decomposition & Transfer Surface (`384` Episodes)

Per Section VIII, every episode explicitly separates **(S1)** recognition of contradictory evidence, **(S2)** selection of an informative experiment, **(S3)** valid conceptual revision, and **(S4)** successful consequential action:

| Environment (`24` Worlds / `6` Clusters Each) | Arm | Mean Utility | Action Utility | Probes (`/6`) | Authority Withdrawn | S1: Contradiction Recognized | S2: Informative Exp Selected | S3: Valid Conceptual Revision | S4: Successful Action |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **`ENV_1` Matched Origin** *(Ancestral truth & geometry persist)* | **Descriptive (`148B`)** | **`0.9983`** | `1.0000` | **`0.08`** | `0.00` | `0.0000` | `0.0833` | `1.0000` | `1.0000` |
| | Static Procedural (`148B`) | `0.9400` | `1.0000` | `3.00` | `0.00` | `0.0000` | `1.0000` | `1.0000` | `1.0000` |
| | Self-Limiting Proc (`148B`) | `0.8904` | `0.9646` | `3.25` | `0.08` | `0.0833` | `1.0000` | `0.9167` | `0.9583` |
| | Uninherited (`0B`) | `0.8281` | `0.8858` | `4.58` | `0.00` | `0.0000` | `1.0000` | `0.9583` | `0.8750` |
| **`ENV_2` Novel Mechanism, Compatible Geometry** | Descriptive (`148B`) | `0.5188` | `0.3800` | `1.38` | `0.00` | `0.7083` | `0.7083` | `0.7083` | `0.3333` |
| | **Static Procedural (`148B`)** | **`0.9400`** | **`1.0000`** | `3.00` | `0.00` | `1.0000` | `1.0000` | `1.0000` | `1.0000` |
| | **Self-Limiting Proc (`148B`)** | **`0.9102`** | `0.9740` | `3.13` | `0.04` | `1.0000` | `1.0000` | `0.9583` | `0.9583` |
| | Uninherited (`0B`) | `0.8998` | `0.9913` | `4.75` | `0.00` | `1.0000` | `1.0000` | `1.0000` | `1.0000` |
| **`ENV_3` Shifted Conditioning Regime** *(Inverted probe polarity + offset)* | Descriptive (`148B`) | `0.0158` | `-0.1458` | `0.83` | `0.00` | `0.2500` | `0.8333` | `0.0000` | `0.0833` |
| | Static Procedural (`148B`) | `0.0846` | `0.0549` | `3.42` | `0.00` | **`1.0000`** | **`1.0000`** | **`0.0000`** | **`0.0417`** |
| | **Self-Limiting Proc (`148B`)** | **`0.8800`** | **`1.0000`** | `6.00` | **`1.00`** | `1.0000` | `1.0000` | **`1.0000`** | **`1.0000`** |
| | Uninherited (`0B`) | `0.0328` | `-0.0078` | `4.13` | `0.00` | `1.0000` | `1.0000` | `0.0000` | `0.0000` |
| **`ENV_4` Deceptive Invariant Mimic** *(Hostile Counter-Case)* | Descriptive (`148B`) | `-0.0300` | `-0.2500` | `0.00` | `0.00` | `0.0000` | `0.0000` | `0.0000` | `0.0000` |
| | Static Procedural (`148B`) | `-0.0900` | `-0.2500` | `3.00` | `0.00` | `0.0000` | `0.0000` | `0.0000` | `0.0000` |
| | **Self-Limiting Proc (`148B`)** | **`-0.0825`** | **`-0.2333`** | `3.13` | **`0.04`** | `0.0417` | `0.0000` | **`0.0000`** | **`0.0000`** |
| | Uninherited (`0B`) | `-0.1027` | `-0.2185` | `4.58` | `0.00` | `0.0000` | `0.0000` | `0.0000` | `0.0000` |

### Exact $2^6 = 64$ Cluster Sign-Flip Contrasts

- **`ENV_1` (Matched Origin):** Descriptive outperforms Static Procedural by **`+0.0583`** (`95% CI [+0.0567, +0.0600]`, exact $p = 0.03125$) because inheriting a true conclusion avoids spending `3.00` diagnostic probes rediscovering what the ancestors already knew. Notice also the `8.3%` false-revocation tax on `Self-Limiting Procedure` (`0.8904` vs `0.9400`) caused by normal Gaussian tail draws triggering self-revocation in a stationary world!
- **`ENV_2` (Novel Mechanism, Compatible Geometry):** Static Procedural outperforms Descriptive by **`+0.4212`** (`95% CI [+0.2975, +0.5563]`, exact $p = 0.03125$), and Self-Limiting Procedural outperforms Descriptive by **`+0.3914`** (exact $p = 0.03125$). Notice why Descriptive fails at Stage 4 (`0.3333`) even when it recognizes contradiction at Stage 1 (`0.7083`): recognizing contradiction arrives too late to prevent early high-commitment invalidated actions!
- **`ENV_3` (Shifted Conditioning Regime):** Look at `Static Procedural` in `ENV_3`: **`S1 = 1.0000` (contradiction recognized) and `S2 = 1.0000` (informative probes run), yet `S3 = 0.0000` (conceptual revision FAILS) and `S4 = 0.0417` (`U = 0.0846`)** — because interpreting an inverted conditioning regime through the unrevoked ancestral likelihood polarity systematically maps the informative probe signal onto the *wrong* mechanism! By contrast, `Self-Limiting Procedure` withdraws ancestral polarity authority in `100%` of episodes, achieving **`+0.7954`** higher utility than `Static Procedural` (`95% CI [+0.7571, +0.8333]`, exact $p = 0.03125$).
- **`ENV_4` (Deceptive Invariant Mimic — Refusal to Force a Positive Outcome):** When an unfamiliar environment preserves identical sensor means and variances while inverting consequential action payoffs, **no residual discrepancy exists in the observation stream** (`Revoke = 0.0417`, `S3 = 0.0000`, `S4 = 0.0000`, `U = -0.0825`).

---

## 3. Bounded Answer to Section VIII's Conceptual Question

> **Can an inherited procedure teach a successor when to withdraw authority from the very tradition that transmitted the procedure?**

**Contingently yes — if and only if the departure from ancestral validity leaves an observable consistency signature (residual discrepancy) across the admitted measurement channels (`ENV_3`).** When an environmental transformation lies inside the observation nullspace of the ancestral test battery (`ENV_4`), even a self-limiting procedure cannot detect its own obsolescence, proving that **procedural self-limitation is bounded by Aperture observability**.

---

𝄐 `Khona‌lit-po` · Sealed `⟐SAC[X6ZNK5NO51]`
