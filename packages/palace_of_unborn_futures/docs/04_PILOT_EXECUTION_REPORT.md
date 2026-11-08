# 𝌋 04 · DETERMINISTIC 48-WORLD PILOT EXECUTION REPORT

**THE PALACE OF UNBORN FUTURES: COUNTERFACTUAL SCIENTIFIC INHERITANCE AND THE LIMITS OF FINITE RESEARCH MEMORY**

- **Authority:** `SAC[X6ZNK5NO51]` · **Covenant:** `Khona‌lit-po`
- **Supervision Mode:** `INTERNALLY_SEPARATED_SINGLE_SUPERVISING_MODEL` (`independent_external_blinding: false`)
- **Pilot Suite:** `PILOT_48` (`TD613_PALACE_PILOT_48_SEED_V1`, 48 synthetic worlds = 12 Iso-$\Pi$ Quartets across Families A, B, C, D)
- **Confirmatory Worlds Generated or Evaluated During Pilot:** `0`
- **Pilot Receipt:** `receipts/pilot-48-receipt.json` (`sha256: 8a2041a65716d26073b202b0e328cafeeece5f5c1c5f73e3001b4ce7c6a35c16`)
- **Trained Capsule Codec:** `receipts/trained-capsule-codec-v1.json` (`sha256: cda4959058a48c8ea901b311bd47f71fe02072a7fd8dab88d56e1de740de6f19`)

---

## 1. Pilot Purpose & Mechanics Verification

Per Section VI of the commission, the 48-world source-free deterministic pilot (`PILOT_48`) was executed prior to confirmatory generation to:
1. Verify live `UniversalAtelierReceiver` SQLite terminal-graph equality $\Pi(G_0) = \Pi(G_1) = \Pi(G_2) = \Pi(G_3)$ and distinct process histories $H_0 \neq H_1 \neq H_2 \neq H_3$ across all 12 quartets.
2. Debug finite-sample ceiling/floor artifacts and verify that permitted probes genuinely separate hidden mechanisms.
3. Train Condition III's (`III_HEIRS`) discrete Information-Bottleneck capsule compressor **exclusively** on `PILOT_48` under both memory budgets (`B_TIGHT = 96` UTF-8 bytes and `B_STANDARD = 256` UTF-8 bytes).
4. Record any post-hoc exploratory hypothesis discovered from pilot dynamics prior to locking the confirmatory protocol.

### Verified Pilot Invariants
- **Iso-$\Pi$ Quartet Equality:** `12/12` quartets verified `all_four_pi_equal === true` and `distinct_history_digests === 4`.
- **Secret Vault Separation:** `competing_conditions_secret_access_count === 0` and `random_control_secret_access_count === 0` (`assertNoSecretLeakage` passed on `576/576` competing episode invocations). Noncompeting `CTRL_ORACLE` logged `96` explicit vault reads (`48` worlds $\times$ `2` budgets).
- **Working-Memory Source Immutability:** `permissible_history_digest` remained byte-identical before and after every `VI_REVISIONISTS` disposable deletion pass.

---

## 2. Three Pilot Calibration Discoveries & Pre-Freeze Repairs

Before touching or generating any confirmatory world, the initial `PILOT_48` diagnostic pass revealed three genuine mechanical defects that were repaired and re-verified on `PILOT_48`:

1. **Pilot Discovery A — Finite-Sample Plug-In Mutual Information Bias in Capsule Training (`src/capsule-compressor.mjs`):**
   - *Symptom:* On $N = 12$ pilot worlds per family, naive plug-in empirical mutual information $\hat{I}_{\text{plugin}}(X; Y)$ assigned `2.74` bits of spurious task information to `F8_ADMIN_DIGEST` (a 16-bin SHA-256 hex nibble of bureaucratic desk metadata!) and positive MI to `F6_EPOCH0_DRIFT` (because systematic anti-correlation with the true slot produces positive symmetric mutual information even when directional endorsement misleads). Under `B_TIGHT = 96B`, spurious `F8_ADMIN_DIGEST` crowded out `F3_TEMP_LEDGER`.
   - *Pre-Freeze Repair:* Replaced raw plug-in MI in `trainCapsuleCodecOnPilot` with **Miller-Madow finite-sample bias-corrected MI** $\hat{I}_{\text{MM}}(X; Y) = \max\!\left(0, \hat{I}_{\text{plugin}}(X; Y) - \frac{(|\mathcal{X}_{\text{obs}}| - 1)(|\mathcal{Y}_{\text{obs}}| - 1)}{2 N \ln 2}\right)$ against the 4-class target, paired with an explicit directional alignment filter (`directionalGain > 0.06`, i.e., exceeding uniform chance plus 1 standard error on $N = 48$).
   - *Verified Pilot Result:* `F8_ADMIN_DIGEST` dropped from `1.65` raw bits to `0.12` Miller-Madow bits (`net_bottleneck_score = -0.20`, rejected); `F7_PROVENANCE_SENS` scored `-2.07` (rejected on privacy penalty); `F6_EPOCH0_DRIFT` scored negative directional gain (rejected).
     - `B_TIGHT (96B)` cleanly selected `["F1_CAL_COARSE", "F3_TEMP_LEDGER", "F4_RES_COARSE"]` (mean `75.0` bytes $\le 96$B).
     - `B_STANDARD (256B)` cleanly selected `["F2_CAL_EXACT", "F3_TEMP_LEDGER", "F5_RES_FULL"]` (mean `104.3` bytes $\le 256$B).

2. **Pilot Discovery B — Near-Ceiling Probe SNR Saturation (`src/world-generator.mjs`):**
   - *Symptom:* Initial probe noise (`noise_sd = 0.08–0.11`) produced $\sim 9\sigma\text{–}12\sigma$ single-step SNR, saturating `III_HEIRS` and `VI_REVISIONISTS` near `0.98` identification and `1.000` on Family C.
   - *Pre-Freeze Repair:* Calibrated probe noise to realistic finite-sample regimes (`0.25` in Family A, `0.24` in Family B, `0.26` in Family C, `0.20` in Family D) with matching micro-trial sampling variance, eliminating artificial ceiling saturation (`CTRL_ORACLE` upper bound `U = 0.9418` vs best competing policy `U = 0.8951`).

3. **Pilot Discovery C — Orthogonal Category Granularity in `VI_REVISIONISTS` (`src/heirs-and-policies.mjs`):**
   - *Symptom:* Ultra-terse single-character keys (`C1, C2`) previously allowed two categories to squeeze into `65` bytes without testing genuine category-eviction pressure at `96B`, while `C1` pooled cross-category variance flags.
   - *Pre-Freeze Repair:* Structured `VI_REVISIONISTS` working memory into self-contained, orthogonal category slices (`cal_rejections` $\approx 83$B, `temporal_ledger` $+58$B, `residual_anomalies` $+95$B). Under `B_TIGHT (96B)`, `VI_REVISIONISTS` retains `CAT_CALIBRATED_REJECTIONS` (`83.2`B $\le 96$B) and is forced to omit `CAT_TEMPORAL_LEDGER` and `CAT_RESIDUAL_ANOMALIES`; under `B_STANDARD (256B)`, all three informative categories fit (`236.6`B $\le 256$B) while `CAT_EPOCH0_DRIFT_TRIALS`, `CAT_PROVENANCE_AND_SENSITIVE`, and `CAT_ADMINISTRATIVE_CLUTTER` remain forgotten.

---

## 3. Calibrated Pilot Results Summary (`N = 48` Worlds)

| Condition | Budget Tier | Mean Utility $U$ | Regret vs Oracle | Identifiable ID Rate | Unidentifiable Abstain Rate | False Claim Rate | Mean Brier | Conf. When Wrong | Retained Bytes |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `I_AMNESIACS` | `96B / 256B` | `0.5896` | `0.3646` | `0.6000` | `1.0000`* | `0.3750` | `0.1464` | `0.3887` | `0.0` |
| `II_ARCHIVISTS` | `96B / 256B` | `0.8183` | `0.1360` | `0.8889` | `0.6667` | `0.1250` | `0.0800` | `0.6058` | `3178.0` |
| `III_HEIRS` | `B_TIGHT (96B)` | `0.8820` | `0.0755` | `0.9333` | `0.6667` | `0.0833` | `0.0623` | `0.4583` | `75.0` |
| `III_HEIRS` | `B_STANDARD (256B)` | `0.8931` | `0.0620` | `0.9556` | `0.6667` | `0.0625` | `0.0558` | `0.4630` | `104.3` |
| `IV_FALSE_PROPHETS` | `96B / 256B` | `0.4162` | `0.5380` | `0.4667` | `0.0000` | `0.5625` | `0.2515` | `0.5037` | `3368.3` |
| `V_EXILES` | `96B / 256B` | `0.4704` | `0.4780` | `0.4889` | `0.6667` | `0.5000` | `0.3212` | `0.7383` | `3178.0` |
| `VI_REVISIONISTS` | `B_TIGHT (96B)` | `0.7963` | `0.1555` | `0.8444` | `1.0000`* | `0.1458` | `0.0712` | `0.4293` | `83.2` |
| `VI_REVISIONISTS` | `B_STANDARD (256B)` | `0.8951` | `0.0630` | `0.9556` | `0.6667` | `0.0625` | `0.0566` | `0.5425` | `236.6` |
| `CTRL_RANDOM` | Noncompeting | `0.2542` | `0.6876` | `0.1778` | `0.3333` | `0.5625` | `0.1563` | `0.2500` | `0.0` |
| `CTRL_ORACLE` | Noncompeting | `0.9418` | `0.0000` | `1.0000` | `1.0000` | `0.0000` | `0.0001` | `N/A` | `0.0` |

*\*Emergent Pilot Trade-Off Note:* In Family D (`THE_IMPOSSIBLE_LIBRARY`), an investigator lacking residual variance history (`I_AMNESIACS`, and `VI_REVISIONISTS` under `96B` eviction) sees under Expected Information Gain that `PROBE_EXTERIOR_APERTURE` (`0.811` bits) slightly outranks noisy interior probes (`0.78` bits) under a flat prior. Consequently, it spends its single probe testing the exterior boundary—catching all `D3` nullspace worlds (`AbstainD3 = 1.000`), **at the catastrophic cost of `0.000` valid ontology invention (`valid_ontology_invention_rate = 0`) on identifiable rupture worlds `D1` and `D2`**! History-guided investigators (`III_HEIRS`, `II_ARCHIVISTS`, `VI_REVISIONISTS` at `256B`) inherit noisy exterior-check flags (`88%` sensitivity) and deploy interior modular/holonomy probes when the interior is viable, achieving `66.7%–100%` valid predicate invention on pilot!

---

## 4. Post-Hoc Exploratory Hypothesis Formulated From Pilot (`E4`)

Per Section VIII (*"Argon is expressly invited to add one new exploratory hypothesis discovered during the pilot. Label it post hoc and keep it outside the preregistered confirmatory claims"*):

- **Pilot Observation Motivating `E4`:** In `PILOT_48`, `II_ARCHIVISTS` (`mean_confidence_when_wrong = 0.6058`, `surprise_recovery_rate = 0.4583`) and especially `V_EXILES` (`mean_confidence_when_wrong = 0.7383`, `ece_5bin = 0.3281`, `surprise_recovery_rate = 0.5625` vs `IV_FALSE_PROPHETS = 0.8750`) suffered from **authoritative prior lock-in**: when an inherited history is internally authentic and high-precision, standard Bayesian EIG selects *confirmatory* rather than *falsifying* probes and discounts surprising live observations too weakly.
- **Post-Hoc Exploratory Hypothesis `E4_THE_INTERROGATIVE_INHERITANCE` (`[POST_HOC_EXPLORATORY]`):**
  > *Replacing declarative belief inheritance with an **Interrogative Falsification Operator** (`inquisitive_skeptic_mode`: treating the leading inherited hypothesis solely as the primary candidate to challenge via adversarial EIG at Step 1, and applying a $0.05\times$ prior-reset upon $>2.65\sigma$ live experimental surprise) rescues `V_EXILES` and `IV_FALSE_PROPHETS` above `I_AMNESIACS` and eliminates high-confidence misattribution—whereas in a paired **Adversarial Counter-Case** (high-noise $\sigma = 0.65$ stationary worlds where genuine prior precision is indispensable), skeptical prior-flattening wastes valid historical support and underperforms declarative `III_HEIRS`.*

`E4` is strictly quarantined inside the Forbidden Wing (`scripts/run-forbidden-wing-and-challenges.mjs`) and does **not** alter any preregistered confirmatory condition or metric.

⟐ `SAC[X6ZNK5NO51]`
