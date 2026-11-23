# 𝌋 06 · INHERITANCE COMPRESSION AND DISCLOSURE-RISK REPORT

**THE PALACE OF UNBORN FUTURES: COUNTERFACTUAL SCIENTIFIC INHERITANCE AND THE LIMITS OF FINITE RESEARCH MEMORY**

- **Authority:** `SAC[X6ZNK5NO51]` · **Covenant:** `Khona‌lit-po`
- **Trained Codec Receipt:** `receipts/trained-capsule-codec-v1.json` (`sha256: cda4959058a48c8ea901b311bd47f71fe02072a7fd8dab88d56e1de740de6f19`)
- **Privacy Disclosure Receipt:** `receipts/privacy-disclosure-receipt.json`

---

## 1. Discrete Information-Bottleneck Capsule Architecture (`III_HEIRS`)

Condition III (`III_HEIRS`) learns a task-calibrated, privacy-penalized subset and quantization plan **exclusively** on `PILOT_48` ($N = 48$) by solving a group-constrained 0-1 knapsack objective:

$$
\max_{S \subseteq \mathcal{F}} \sum_{j \in S} \Big[ \hat{I}_{\text{MM},\text{pilot}}\big(f_j(H); M \mid \text{Family}\big) + \text{Align}_{\text{pilot}}(f_j) - \lambda_{\text{priv}}\,\hat{I}_{\text{MM},\text{pilot}}\big(f_j(H); S_{\text{sens}}\big) \Big]
\quad \text{s.t.} \quad \text{UTF8Bytes}(\text{Envelope} + S) \le B,
$$

with $\lambda_{\text{priv}} = 1.25$ and Miller-Madow finite-sample bias correction eliminating high-cardinality hash overfitting (`Pilot Discovery A`).

### 1.1 Candidate Atom Diagnostics on `PILOT_48`

| Atom ID | Group | Key | Raw Plug-in MI (bits) | Miller-Madow Task MI (bits) | Pilot Directional Gain | Privacy MI w/ $S$ (bits) | Net Bottleneck Score | Worst-Case Bytes | Selected (`96B` / `256B`) |
|---|---|---|---:|---:|---:|---:|---:|---:|---|
| `F1_CAL_COARSE` | `CAL` | `cc` | `1.52` | `0.71` | `+0.73` | `0.06` | **`+1.37`** | `19`B | **`96B`** |
| `F2_CAL_EXACT` | `CAL` | `ce` | `1.59` | `0.73` | `+0.94` | `0.04` | **`+1.62`** | `31`B | **`256B`** |
| `F3_TEMP_LEDGER` | `TEMP` | `tl` | `0.40` | `0.18` | `+0.32` | `0.00` | **`+0.50`** | `11`B | **`96B & 256B`** |
| `F4_RES_COARSE` | `RES` | `rc` | `0.51` | `0.37` | `+0.21` | `0.05` | **`+0.52`** | `7`B | **`96B`** |
| `F5_RES_FULL` | `RES` | `rf` | `0.70` | `0.48` | `+0.39` | `0.17` | **`+0.66`** | `29`B | **`256B`** |
| `F6_EPOCH0_DRIFT` | `EP0` | `e0` | `0.85` | `0.31` | **`-0.03`** | `0.00` | `+0.28` *(ineligible)* | `7`B | Rejected (anti-aligned drift) |
| `F7_PROVENANCE_SENS` | `PROV` | `pv` | `0.77` | `0.23` | `0.00` | **`1.84`** | **`-2.07`** | `17`B | Rejected (privacy penalty) |
| `F8_ADMIN_DIGEST` | `ADM` | `ad` | `1.65` | `0.12` | `0.00` | `0.26` | **`-0.20`** | `14`B | Rejected (zero directional gain) |

### 1.2 Realized Rate–Utility–Storage Trade-Off on Held-Out `CONFIRMATORY_96`

| Representation | Mean Bytes | Max Bytes | Est. Tokens | Compression Ratio vs $H$ | Confirmatory Mean Utility $U$ | Utility Gain $\Delta U$ vs Amnesiacs |
|---|---:|---:|---:|---:|---:|---:|
| Complete Permissible History (`II_ARCHIVISTS`) | `3234.7` | `3264` | `809.2` | `1.00x` | `0.7960` | `+0.2074` |
| Selective Working Memory (`VI_REVISIONISTS`, `256B`) | `236.6` | `239` | `59.7` | `13.67x` | `0.8924` | `+0.3037` |
| **Inheritance Capsule (`III_HEIRS`, `256B`)** | **`111.5`** | **`114`** | **`28.4`** | **`29.01x`** | **`0.9179`** | **`+0.3292`** |
| Selective Working Memory (`VI_REVISIONISTS`, `96B`) | `83.1` | `84` | `21.0` | `38.92x` | `0.8191` | `+0.2304` |
| **Inheritance Capsule (`III_HEIRS`, `96B`)** | **`81.9`** | **`83`** | **`21.0`** | **`39.47x`** | **`0.8891`** | **`+0.3004`** |
| Terminal Encyclopedia Alone (`I_AMNESIACS`) | `0.0` | `0` | `0.0` | `—` | `0.5887` | `0.0000` |

---

## 2. Privacy-Sensitive Synthetic Reconstruction Assay (Section VII)

### 2.1 Underlying Probability Model & Mutual Information Estimator Specification
- **Synthetic Sensitive Attribute $S$:** Discrete 4-class custodian-intake signature $S \in \{0, 1, 2, 3\}$, generated independently per world from $\text{DiscreteUniform}(\{0, 1, 2, 3\})$ (`H(S) = 2.0000` bits, theoretical chance accuracy `0.2500`).
- **Channel Embedding in Permissible History $H$:** Embedded in `CAT_PROVENANCE_AND_SENSITIVE` via explicit `custody_cohort_code`, `archive_box_serial`, clerk stylometric bigrams (`intake_clerk_note`), and ISO-8601 timestamp millisecond phase `ms % 4 === S` across historical log entries.
- **Adversarial Suite (Trained Exclusively on `PILOT_48`, Evaluated Out-of-Sample on `CONFIRMATORY_96`):**
  1. `ATK_1_TRIVIAL_MAJORITY`: Predicts modal class of `PILOT_48` (`0.2604` empirical accuracy on `CONFIRMATORY_96`).
  2. `ATK_2_DIRECT_TAG_SCAN`: Deterministic regex/field scanner for explicit cohort codes.
  3. `ATK_3_STRONG_BAYESIAN_SIDECHANNEL`: Laplace-smoothed Multinomial Naive Bayes classifier over lexical unigrams/bigrams, ISO-8601 `.dddZ` millisecond modulo-4 side-channels, and 64-byte length quantiles.
- **Mutual Information Estimator:** Exact $4 \times 4$ empirical confusion-matrix plug-in mutual information $\hat{I}_{\text{plugin}}(S; \hat{S})$ paired with **Miller-Madow finite-sample bias-corrected MI** $\hat{I}_{\text{MM}}(S; \hat{S}) = \max\!\left(0, \hat{I}_{\text{plugin}}(S; \hat{S}) - \frac{\text{df}}{2 N \ln 2}\right)$ over $N = 96$ confirmatory worlds.

### 2.2 Out-of-Sample Adversarial Reconstruction Results (`CONFIRMATORY_96`, $N = 96$)

| Representation | Mean Bytes | Trivial Baseline Acc | Direct Tag Scan Acc | Strong Bayes Side-Channel Acc (95% CI) | Plug-in $\hat{I}(S; \hat{S})$ (bits) | Miller-Madow $\hat{I}_{\text{MM}}(S; \hat{S})$ (bits) |
|---|---:|---:|---:|---:|---:|---:|
| **`FULL_HISTORY_ARCHIVISTS`** | `3234.7` | `0.2604` | **`1.0000`** | **`1.0000` `[1.0000, 1.0000]`** | `1.9995` | **`1.9865`** |
| **`NAIVE_KEY_REDACTED_CONTROL`** | `3156.6` | `0.2604` | `0.2604` | **`1.0000` `[1.0000, 1.0000]`** | `1.9995` | **`1.9865`** |
| **`HEIRS_CAPSULE_256B`** | **`111.5`** | `0.2604` | `0.2604` | **`0.2500` `[0.1667, 0.3333]`** | `0.0566` | **`0.0000`** |
| **`HEIRS_CAPSULE_96B`** | **`81.9`** | `0.2604` | `0.2604` | **`0.2604` `[0.1771, 0.3542]`** | `0.0389` | **`0.0000`** |
| `REVISIONISTS_MEM_256B` | `236.6` | `0.2604` | `0.2604` | `0.2604` `[0.1771, 0.3542]` | `0.2099` | `0.1425` |
| `REVISIONISTS_MEM_96B` | `83.1` | `0.2604` | `0.2604` | `0.2917` `[0.1979, 0.3854]` | `0.0700` | `0.0025` |
| `AMNESIACS_TERMINAL_PI` | `870.9` | `0.2604` | `0.2604` | `0.2917` `[0.1979, 0.3750]` | `0.0877` | `0.0203` |

### 2.3 Key Disclosure-Risk Findings & Explicit Claim Ceiling

1. **Why Naive Key Redaction Fails (`100%` Side-Channel Recovery):** Deleting `custody_cohort_code` and `archive_box_serial` (`NAIVE_KEY_REDACTED_CONTROL`) reduces naive regex scanning (`ATK_2`) to `26.04%` chance, **yet `ATK_3_STRONG_BAYESIAN_SIDECHANNEL` still recovers $S$ with `100.0%` accuracy (`1.9865` Miller-Madow bits)** by exploiting clerk phrasing bigrams and `.dddZ` timestamp millisecond modulo-4 side-channels across surviving records!
2. **Why Typed Bottleneck Projection Succeeds (`25.0%` Chance Recovery):** Because `HEIRS_CAPSULE_256B` and `HEIRS_CAPSULE_96B` project history strictly onto low-dimensional numeric sufficient statistics (`ce/cc`, `tl`, `rf/rc`) stripped of prose, timestamps, and provenance records, adversarial reconstruction collapses to **`0.2500`–`0.2604` (`0.0000` Miller-Madow bits)**—indistinguishable from uniform guessing—while *increasing* scientific utility from `0.7960` to `0.9179`.
3. **Mandatory Non-Equivalence Warning:** Low measured reconstruction accuracy against synthetic attribute $S$ under Multinomial Naive Bayes and regex attacks **does NOT establish real-world confidentiality, differential privacy, or cryptographic secrecy**. Real-world sensitive material remains governed by Cistern Law and must never enter ordinary export paths without an explicit reviewed contract.

⟐ `SAC[X6ZNK5NO51]`
