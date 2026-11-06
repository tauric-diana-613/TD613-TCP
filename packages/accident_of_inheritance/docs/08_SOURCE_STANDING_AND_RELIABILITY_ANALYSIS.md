# 𝌋 08 · AUXILIARY SOURCE-STANDING AND EVIDENTIARY-RELIABILITY FACTORIAL ANALYSIS

- **Receipt:** [`receipts/source-standing-factorial-receipt.json`](../receipts/source-standing-factorial-receipt.json)
- **Implementation:** [`src/source-standing-factorial.mjs`](../src/source-standing-factorial.mjs)
- **Classification:** `AUXILIARY_RANDOMIZED_SYNTHETIC_FACTORIAL_ANALYSIS`
- **Scale:** `96` matched base worlds (`24` independent 4-world Iso-$\Pi$ clusters across Families A–F) $\times 4$ factorial arms (`Q_HIGH` / `Q_LOW` $\times$ `S_HIGH` / `S_LOW`) $\times 4$ primary policies = **`1,536` factorial episodes** + **`96` exact $4! = 24$ standing-permutation audits**
- **Authority:** `SAC[X6ZNK5NO51]` · **Covenant:** `Khona‌lit-po`

---

## 1. Experimental Design & Byte-Identical Content Verification

To separate **source reliability ($Q$)** from **externally assigned institutional standing ($S$)** without confounding institutional rank with predictive accuracy, each of the `96` synthetic worlds was evaluated across four orthogonal historical-archive arms at `(h = 0.08, τ₀ = 3, ν = 0.5)`:

- **`Q_HIGH_CALIBRATED`:** Focal claim `fc0` endorses the true initial mechanism ($\hat{q} = 0.92$, reproducibility $r = 0.93$, $n = 36$, `independently_calibrated = true`); rival claim `fc1` endorses an erroneous mechanism ($\hat{q} = 0.22$, $r = 0.30$, `independently_calibrated = false`).
- **`Q_LOW_MISLEADING`:** Focal claim `fc0` endorses an erroneous mechanism ($\hat{q} = 0.22$, $r = 0.30$, `independently_calibrated = false`); rival claim `fc1` endorses the true initial mechanism ($\hat{q} = 0.92$, $r = 0.93$, `independently_calibrated = true`).
- **`S_HIGH` vs. `S_LOW`:** Swaps **only** the `source_standing` strings between `FOUNDING_AUTHORITY` and `JUNIOR_OR_CONTESTED` on `(fc0, fc1)` while keeping all log-likelihood vectors, calibration metrics, timestamps, and `CRN` episode observations **100% byte-identical** (`content_byte_identity_verified_worlds = 96 / 96`; `unauthorized_investigator_reads = 0`).

### Explicit Theoretical & Attribution Boundary
Per Section III & Section VI, `ΔU_status(Q) = E[U | FOUNDING_AUTHORITY, Q] − E[U | JUNIOR_OR_CONTESTED, Q]` is interpreted **strictly within this randomized synthetic assignment procedure**. Synthetic role labels (`FOUNDING_AUTHORITY`, `ESTABLISHED_COUNCIL`, `INDEPENDENT_AUDITOR`, `JUNIOR_OR_CONTESTED`) are formal computational treatments and never proxies for real-world demographic or social groups. Any connection to Kristie Dotson's analysis of testimonial quieting (*Hypatia*, 2011) or Patricia Hill Collins's critique of institutional validation (*Black Feminist Thought*, 2000) is an explicit **theoretical comparison of validation architecture**, not a simulation of lived social oppression.

---

## 2. Credibility-Attribution Contrasts (`ΔU_status`) & Mechanism Shifts

| Policy | `U(Q_HIGH, S_HIGH)` | `U(Q_HIGH, S_LOW)` | `ΔU_status \| Q_HIGH` `[95% CI]` ($p$) | `ΔU_status \| Q_LOW` `[95% CI]` ($p$) | Pooled Counterbalanced `ΔU_status` |
|---|---:|---:|---:|---:|---:|
| **`A_MONUMENTALISTS`** | `0.4415` | `0.3060` | **`+0.1355`** `[-0.0008, +0.2772]` (`0.0719`) | **`-0.1355`** `[-0.2711, -0.0045]` (`0.0698`) | `0.0000` *(exact cancellation)* |
| **`B_EVIDENTIALISTS`** | `0.4959` | `0.4959` | **`0.0000`** `[0.0000, 0.0000]` (`1.0000`) | **`0.0000`** `[0.0000, 0.0000]` (`1.0000`) | **`0.0000`** |
| **`C_PROVISIONALISTS`** | `0.5904` | `0.5904` | **`0.0000`** `[0.0000, 0.0000]` (`1.0000`) | **`0.0000`** `[0.0000, 0.0000]` (`1.0000`) | **`0.0000`** |
| **`D_TEMPORAL_CUSTODIANS`** | **`0.6036`** | **`0.6036`** | **`0.0000`** `[0.0000, 0.0000]` (`1.0000`) | **`0.0000`** `[0.0000, 0.0000]` (`1.0000`) | **`0.0000`** |

### Endogenous Mechanism Shifts Induced Purely by Swapping Source Standing (`S_HIGH − S_LOW`)

| Policy | Initial Prior Shift $\Delta P_{t=1}(\text{focal})$ | Probe Usage Shift $\Delta n_{\text{probes}}$ | Decision Trajectory Changed Rate | Censored Eval Latency Shift $\Delta \tau_{\text{eval}}$ |
|---|---:|---:|---:|---:|
| **`A_MONUMENTALISTS` (`Q_HIGH`)** | **`+0.9973`** | **`-1.0417`** | **`1.0000` (`96/96`)** | **`+2.20` ticks** |
| **`A_MONUMENTALISTS` (`Q_LOW`)** | **`+0.9970`** | **`+1.0417`** | **`1.0000` (`96/96`)** | **`-2.20` ticks** |
| **`B_EVIDENTIALISTS` (`Q_HIGH` & `Q_LOW`)** | `0.0000` | `0.0000` | `0.0000` (`0/96`) | `0.00` ticks |
| **`C_PROVISIONALISTS` (`Q_HIGH` & `Q_LOW`)** | `0.0000` | `0.0000` | `0.0000` (`0/96`) | `0.00` ticks |
| **`D_TEMPORAL_CUSTODIANS` (`Q_HIGH` & `Q_LOW`)** | `0.0000` | `0.0000` | `0.0000` (`0/96`) | `0.00` ticks |

---

## 3. Exact $4! = 24$ Source-Status Permutation Audit

Permuting all four standing labels (`FOUNDING_AUTHORITY`, `ESTABLISHED_COUNCIL`, `INDEPENDENT_AUDITOR`, `JUNIOR_OR_CONTESTED`) across four claims of identical measured calibration ($\hat{q} = 0.85$, $r = 0.88$, $n = 25$):

- **`A_MONUMENTALISTS`:** Maximum posterior swing = **`0.8782`**, inducing **`4 / 4` distinct MAP mechanism endorsements** purely from status relabeling (`exact_standing_invariance_verified = false`).
- **`B_EVIDENTIALISTS`, `C_PROVISIONALISTS`, `D_TEMPORAL_CUSTODIANS`:** Maximum posterior swing = **`0.0000`**, inducing **`1` invariant MAP endorsement** across all `24` permutations (`exact_standing_invariance_verified = true`).

### Key Finding (`H5` Confirmed with Structural Nuance)
1. When standing and reliability are **orthogonally counterbalanced (`50/50`)**, the unconditional pooled standing effect under `A_MONUMENTALISTS` cancels to **exact `0.0000`** because conferring `FOUNDING_AUTHORITY` on calibrated truth helps (`+0.1355`) by the exact symmetric margin that conferring `FOUNDING_AUTHORITY` on uncalibrated error harms (`-0.1355`)!
2. Across both regimes, however, `D_TEMPORAL_CUSTODIANS` (`0.6036`), `C_PROVISIONALISTS` (`0.5904`), and `B_EVIDENTIALISTS` (`0.4959`) outperform even the favorable `Q_HIGH__S_HIGH` Monumentalist cell (`0.4415`) at moderate hazard (`h = 0.08, ν = 0.5`), because elevating initial standing also increases post-shift **revision latency** by `+2.20` ticks when the world subsequently changes.

---

𝄐 `Khona‌lit-po` · Sealed `⟐SAC[X6ZNK5NO51]`
