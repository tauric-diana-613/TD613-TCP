# 07 · Confirmatory Results and Authority-Reversal Response Surfaces (`ACT2_CONFIRMATORY_192`)

**Commission:** `𝌋 TD613 · THE ACCIDENT OF INHERITANCE` (Palace of Unborn Futures, Act II)  
**Principal:** Tawanna C. Miller · **Operator:** `tauric.diana.613`  
**Covenant:** `Khona‌lit-po` (interior `U+200C` preserved) · **Authorization:** `SAC[X6ZNK5NO51]`  
**Supervision Mode:** `INTERNALLY_SEPARATED_SINGLE_SUPERVISING_MODEL` (`independent_external_blinding: false`, `external_empirical_replication: false`, `paid_api_calls: 0`)  
**Pre-Confirmatory Freeze Commit (`HEAD` at execution):** `8ea7727a5b68269bae46408bfa42d82ddafc6db7`  
**Machine Receipt:** `packages/accident_of_inheritance/receipts/confirmatory-192-receipt.json`

---

## 1. Chronological Lock, Vault Custody, and Reproducibility Audit

Prior to instantiating or scoring a single confirmatory world, Commit `8ea7727a5b68269bae46408bfa42d82ddafc6db7` sealed `preregistration/frozen-confirmatory-lock-act2.json` across all `14` executable, schema, preregistration, and runner files — explicitly including `scripts/run-confirmatory-192.mjs` itself via canonical placeholder digest verification (remediating PR `#1699` Review Finding `#2`).

| Verification Gate | Recorded Confirmatory Value | Status |
| --- | --- | --- |
| `git_head_at_execution` | `8ea7727a5b68269bae46408bfa42d82ddafc6db7` | `PASS` |
| `frozen_lock_verified` (`locked_files_verified_count`) | `true` (`14 / 14`) | `PASS` |
| `pilot_disjointness_verified` (`ACT2_PILOT_48` $\cap$ `ACT2_CONFIRMATORY_192` $= \varnothing$) | `true` | `PASS` |
| World & Evaluation Seeds | `TD613_ACT2_CONFIRMATORY_192_WORLDS_20261105_SAC_X6ZNK5NO51` / `..._EVAL_...` | `FIXED` |
| Scale (`n_base_worlds` $\times$ `n_grid_cells` $\times$ `7` conditions) | `192` worlds (`48` Iso-$\Pi$ clusters) $\times 18$ cells $= 3,456$ trajectories $= 24,192$ episodes | `VERIFIED` |
| Byte-Identical History Recomputations (`immutability_recomputations_verified`) | `41,472` pre/post SHA-256 history checks (`0` mutations) | `PASS` |
| Dynamic `Proxy` Secret-Vault Ledger (`unauthorized_investigator_reads`) | `0` (`simulator: 105,857`; `oracle: 145,152`; `post_scorer: 775,545`) | `PASS` |
| Exhaustive Dynamic Oracle Dominance (`proportion_exceeding_oracle`) | `0.0000` across all `6` non-oracle conditions (`0 / 20,736` episodes) | `PASS` |
| Deterministic Digest (`confirmatory_world_ids_sha256`) | `8dd53a1017096865c882dd01c8193e5c6bacc68202736a7fe39ece684fefc00e` | `RECORDED` |
| Deterministic Digest (`confirmatory_episode_rows_sha256`) | `6b880734cb240c6d07ceb50c195e6139b69cd4c05bdb9fbad6d3e5274528edd1` | `RECORDED` |

All inferential uncertainty Intervals and $p$-values below treat the **`K = 48` independent 4-world Iso-$\Pi$ clusters** (`8` independent clusters per world family) as the primary unit of randomization and permutation, never treating the `24,192` repeated episode rows as independent observations.

---

## 2. Aggregate Confirmatory Performance Across All Four Civilizations & Three Controls

Across all `3,456` trajectories per condition (`192` worlds $\times 18$ `(h, τ0, ν)` cells), **every primary civilization receives byte-identical terminal projection $\Pi(G)$, byte-identical ancestral claims ($C_1 \dots C_8$), identical Common-Random-Number probe readouts, and identical action schedules**. Performance diverges solely through the rules assigning epistemic authority and governing belief revision:

| Policy / Control (`N = 3,456` / cond) | Mean Utility (`O1`) | Signed Regret (`O2`) | Action Utility | Pre-Avail Err (`O3`) | Post-Avail Err (`O4`) | Censored $\tau_{\text{eval}}$ | Non-Rev Rate | Claim Acc | False Claim | Overconf False | Brier | ECE (5-bin) | Probes (`/6`) | Low-Auth Ignored | Eval Ops |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **`D_TEMPORAL_CUSTODIANS`** | **`0.7044`** | **`0.2801`** | **`0.7241`** | **`0.5708`** | **`0.3957`** | `4.2685t` | **`0.1021`** | **`0.8218`** | **`0.1782`** | `0.1427` | **`0.1419`** | `0.1318` | `4.38` | `0.1817` | `2,046.8` |
| **`C_PROVISIONALISTS`** | `0.6509` | `0.3336` | `0.7113` | `0.7701` | `0.5542` | **`3.5890t`** | `0.1664` | `0.7078` | `0.2922` | **`0.0275`** | `0.1845` | **`0.0923`** | `6.00` | `0.5463` | `2,225.9` |
| **`B_EVIDENTIALISTS`** | `0.6253` | `0.3592` | `0.6368` | `0.6899` | `0.5485` | `8.1085t` | `0.4099` | `0.7373` | `0.2627` | `0.2520` | `0.2466` | `0.2477` | `3.26` | **`0.0370`** | `1,976.9` |
| `CTRL_NO_HISTORY` *(ref)* | `0.5631` | `0.4215` | `0.5881` | `0.7999` | `0.6221` | `9.5965t` | `0.4891` | `0.6933` | `0.3067` | `0.2804` | `0.2728` | `0.2624` | `4.62` | `0.5613` | `2,120.0` |
| **`A_MONUMENTALISTS`** | `0.4991` | `0.4855` | `0.5304` | `0.5993` | `0.6308` | `10.7677t` | `0.6810` | `0.5292` | `0.4708` | `0.4676` | `0.4634` | `0.4642` | `0.16` | `0.9086` | `1,803.4` |
| `CTRL_RANDOM` *(ref)* | `0.3308` | `0.6537` | `0.3357` | `0.8029` | `0.8062` | `4.5572t` | `0.0835` | `0.2520` | `0.7480` | `0.0000` | `0.1885` | `0.0020` | `5.21` | `0.7951` | `312.0` |
| `CTRL_DYNAMIC_ORACLE` *(ref)* | `0.9845` | `0.0000` | `0.9718` | `0.0000` | `0.0000` | `1.7751t` | `0.0250` | `1.0000` | `0.0000` | `0.0000` | `0.0000` | `0.0000` | `0.00` | `0.2512` | `40.0` |

### 2.1 Global Cluster-Level Pairwise Contrasts (`K = 48` Independent Clusters; `8,192` Sign-Flip Permutations)

Using the Phipson–Smyth exact Monte Carlo bound $p = (b + 1)/(M + 1)$ (`M = 8,192`, minimum attainable $p = 1/8193 = 0.000122$):

| Preregistered Contrast | Paired Episodes | Clusters (`K`) | Mean $\Delta$ | Cluster SD | 95% Cluster CI | Cohen's $d_z$ | Exceedances (`b / 8192`) | Two-Sided $p$ |
| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: |
| **Principal (`Mon - Evi` Utility)** | `3,456` | `48` | **`-0.1262`** | `0.1252` | `[-0.1601, -0.0910]` | `-1.0080` | `0 / 8192` | **`0.000122`** |
| **`Cust - Mon` Utility** | `3,456` | `48` | **`+0.2053`** | `0.1007` | `[+0.1773, +0.2336]` | `+2.0381` | `0 / 8192` | **`0.000122`** |
| **`Cust - Evi` Utility** | `3,456` | `48` | **`+0.0791`** | `0.0976` | `[+0.0514, +0.1056]` | `+0.8108` | `0 / 8192` | **`0.000122`** |
| **`Cust - Prov` Utility** | `3,456` | `48` | **`+0.0535`** | `0.0482` | `[+0.0398, +0.0666]` | `+1.1100` | `0 / 8192` | **`0.000122`** |
| **`Evi - NoHistory` Utility** | `3,456` | `48` | **`+0.0622`** | `0.0598` | `[+0.0456, +0.0792]` | `+1.0396` | `0 / 8192` | **`0.000122`** |
| **Post-Avail Error `O4` (`Mon - Evi`)** | `1,851` | `32` | **`+0.0913`** | `0.1462` | `[+0.0405, +0.1411]` | `+0.6244` | `11 / 8192` | **`0.001465`** |
| **Post-Avail Error `O4` (`Mon - Cust`)** | `1,851` | `32` | **`+0.2505`** | `0.1541` | `[+0.1958, +0.3019]` | `+1.6261` | `0 / 8192` | **`0.000122`** |

**Immediate Structural Finding — The Revision-Latency Crossover:**
In aggregate across the 6-family benchmark, inheriting historical claims under **Evidentialist** (`0.6253`), **Provisionalist** (`0.6509`), or **Temporal Custodian** (`0.7044`) validation substantially improves scientific decisions relative to possessing zero historical archive (`CTRL_NO_HISTORY = 0.5631`). Under **Monumentalist** prestige weighting (`0.4991`), however, inheriting the *exact same byte-identical historical archive* degrades consequential decision utility **below the zero-history baseline by `-0.0640`**. Moreover, computational effort does not drive the Custodian or Evidentialist advantage: all four primary policies consult the same `8` archive records and evaluate roughly `1,803–2,226` candidate branches per episode, with `D_TEMPORAL_CUSTODIANS` (`2,046.8` evaluations, `4.38` probes) outperforming `C_PROVISIONALISTS` (`2,225.9` evaluations, `6.00` probes) and `CTRL_NO_HISTORY` (`2,120.0` evaluations, `4.62` probes) while using fewer probes and fewer candidate evaluations.

---

## 3. Stratification by Founding Canon Calibration (`144` Calibrated vs. `48` Uncalibrated Base Worlds)

Section III requires separating institutional prestige from measured reliability rather than making senior standing a proxy for truth (`75%` of base worlds carry genuinely calibrated senior founding canon; `25%` carry prestigious but poorly calibrated founding dogma alongside calibrated low-standing junior/auditor claims):

| Stratum & Policy | Mean Utility | Post-Avail Err (`O4`) | Censored $\tau_{\text{eval}}$ | Non-Rev Rate | Claim Acc | Mean Conf When Wrong | Low-Auth Truth Ignored |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **Calibrated Senior Canon (`144w`, `2,592` ep/cond)** | | | | | | | |
| `A_MONUMENTALISTS` | `0.4682` | `0.7764` | **`13.8318t`** | **`0.9016`** | `0.4950` | `0.9892` | `n/a` |
| `B_EVIDENTIALISTS` | `0.6131` | `0.5600` | `8.3186t` | `0.4362` | `0.7249` | `0.9668` | `n/a` |
| `C_PROVISIONALISTS` | `0.6445` | `0.5677` | `3.6144t` | `0.1753` | `0.6921` | `0.5155` | `n/a` |
| `D_TEMPORAL_CUSTODIANS` | **`0.6974`** | **`0.4047`** | `4.3920t` | `0.1048` | **`0.8171`** | `0.8562` | `n/a` |
| `CTRL_NO_HISTORY` | `0.5726` | `0.6072` | `9.4113t` | `0.4718` | `0.7010` | `0.9209` | `n/a` |
| **Uncalibrated Founding Dogma (`48w`, `864` ep/cond)** | | | | | | | |
| `A_MONUMENTALISTS` | `0.5917` | `0.2055`* | `1.7741t`* | `0.0335`* | `0.6319` | **`0.9948`** | **`0.9086`** |
| `B_EVIDENTIALISTS` | `0.6617` | `0.5151` | `7.4916t` | `0.3326` | `0.7743` | `0.9401` | **`0.0370`** |
| `C_PROVISIONALISTS` | `0.6702` | `0.5149` | `3.5146t` | `0.1402` | `0.7546` | `0.4915` | `0.5463` |
| `D_TEMPORAL_CUSTODIANS` | **`0.7253`** | **`0.3694`** | `3.9059t` | `0.0941` | **`0.8356`** | `0.8365` | `0.1817` |
| `CTRL_NO_HISTORY` | `0.5344` | `0.6656` | `10.1402t` | `0.5397` | `0.6701` | `0.9316` | `0.5613` |

*\*Mechanistic note on the uncalibrated-dogma stratum:* When the prestigious founding claim starts wrong ($M_{\text{dogma}} \neq M_0$) and the world subsequently transitions away from $M_0$, `A_MONUMENTALISTS` never held $M_0$ in the first place (`incorrect_action_rate = 0.4368`, `low_authority_truth_non_influence_rate = 0.9086`) — and in the subset of transitions that happen to land on $M_{\text{dogma}}$, `Mon`'s immovable dogma coincides by accident with the post-shift slot! Conversely, in the `144` worlds where the founding canon was **genuinely true at $t = 0$**, `A_MONUMENTALISTS` exhibits catastrophic institutional lock-in once the world changes: **`90.16%` non-revision rate**, **`13.83` ticks censored evaluation delay**, and **`0.7764` post-availability error rate**, with **`0.9892` posterior confidence when wrong**. This directly operationalizes Virilio's dromological thesis: *authentic early success of a founding canon is the exact mechanism that manufactures its catastrophic rigidity after regime transition.*

---

## 4. Six-Family Disaggregation and Exact $2^8 = 256$ Sign-Flip Contrasts

Each world family (`32` base worlds $= 8$ independent 4-world Iso-$\Pi$ clusters $\times 18$ cells $= 576$ episodes per policy) tests a distinct structural hypothesis. Because $K = 8 \le 16$, every within-family pairwise test enumerates **all $2^8 = 256$ exact cluster sign-flips** (`minimum exact two-sided p = 2/256 = 0.007813`):

### 4.1 Family Performance Matrix (`N = 576` Episodes per Cell)

| World Family | Metric | `A_MONUMENTALISTS` | `B_EVIDENTIALISTS` | `C_PROVISIONALISTS` | `D_TEMPORAL_CUSTODIANS` | `CTRL_NO_HISTORY` | `CTRL_DYNAMIC_ORACLE` |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **`FAM_A` Stationary Inheritance** | Utility / ActionU / ClaimAcc | `0.8228` / `0.8301` / `0.8420` | **`0.9721`** / **`0.9984`** / **`1.0000`** | `0.8699` / `0.9238` / `0.9792` | `0.9472` / `0.9834` / `0.9878` | `0.9051` / `0.9347` / `0.9948` | `1.0000` / `1.0000` / `1.0000` |
| **`FAM_B` Abrupt Transition** | Utility / `O4` Err / NonRev | `0.3579` / `0.7047` / `0.6356` | `0.5743` / `0.4656` / `0.3220` | `0.6188` / `0.4611` / `0.1610` | **`0.7073`** / **`0.2636`** / **`0.0890`** | `0.5413` / `0.5111` / `0.3347` | `1.0000` / `0.0000` / `0.0360` |
| **`FAM_C` Gradual Drift** | Utility / `O4` Err / NonRev | `0.4319` / `0.7390` / `0.6919` | `0.4929` / `0.7163` / `0.5770` | `0.5614` / `0.6601` / `0.2768` | **`0.6062`** / **`0.4404`** / **`0.1462`** | `0.4318` / `0.7712` / `0.5979` | `0.9071` / `0.0000` / `0.0313` |
| **`FAM_D` Action-Invariant Change** | Utility / ActionU / ClaimAcc | `0.5814` / `0.8404` / `0.3281` | **`0.8039`** / **`0.9805`** / `0.7205` | `0.7267` / `0.9394` / `0.5833` | `0.7895` / `0.9676` / **`0.7240`** | `0.7169` / `0.8975` / `0.6684` | `1.0000` / `1.0000` / `1.0000` |
| **`FAM_E` Recurrent Regimes** | Utility / `O4` Err / NonRev | `0.4747` / `0.4466` / `0.7504` | `0.3941` / `0.5459` / `0.4660` | `0.5569` / `0.5895` / `0.1571` | **`0.6167`** / **`0.4108`** / **`0.0611`** | `0.3976` / `0.5775` / `0.5567` | `1.0000` / `0.0000` / `0.0314` |
| **`FAM_F` Delayed Contradiction** | Utility / `O4` Err / NonRev | `0.3257` / `0.7007` / `0.6313` | `0.5144` / `0.4978` / `0.2892` | **`0.5716`** / `0.5165` / **`0.0905`** | `0.5593` / **`0.4727`** / `0.1302` | `0.3856` / `0.6678` / `0.4724` | `1.0000` / `0.0000` / `0.0000` |

### 4.2 Exact Within-Family Cluster Contrasts ($2^8 = 256$ Sign-Flips)

| Family | `Mon - Evi` ($\Delta U$, $p$) | `Cust - Mon` ($\Delta U$, $p$) | `Cust - Evi` ($\Delta U$, $p$) | `Prov - Mon` ($\Delta U$, $p$) | `Prov - Evi` ($\Delta U$, $p$) | `Evi - NoHist` ($\Delta U$, $p$) |
| --- | --- | --- | --- | --- | --- | --- |
| **`FAM_A` Stationary** | `-0.1492` (`0.007813`) | `+0.1244` (`0.023438`) | `-0.0249` (`0.007813`) | `+0.0471` (`0.156250`) | **`-0.1021` (`0.007813`)** | **`+0.0670` (`0.007813`)** |
| **`FAM_B` Abrupt** | `-0.2164` (`0.007813`) | **`+0.3494` (`0.007813`)** | `+0.1330` (`0.007813`) | `+0.2609` (`0.007813`) | `+0.0445` (`0.015625`) | `+0.0330` (`0.015625`) |
| **`FAM_C` Gradual Drift** | `-0.0610` (`0.015625`) | `+0.1743` (`0.007813`) | **`+0.1133` (`0.007813`)** | `+0.1295` (`0.007813`) | `+0.0685` (`0.007813`) | `+0.0612` (`0.015625`) |
| **`FAM_D` Action-Invariant** | `-0.2224` (`0.007813`) | `+0.2081` (`0.007813`) | `-0.0144` (`0.281250`) | `+0.1453` (`0.023438`) | `-0.0772` (`0.015625`) | `+0.0870` (`0.007813`) |
| **`FAM_E` Recurrent** | **`+0.0806` (`0.007813`)** | `+0.1421` (`0.007813`) | **`+0.2227` (`0.007813`)** | `+0.0822` (`0.007813`) | `+0.1628` (`0.007813`) | `-0.0036` (`0.859375`) |
| **`FAM_F` Delayed Contra** | `-0.1887` (`0.007813`) | `+0.2336` (`0.007813`) | `+0.0449` (`0.085938`) | **`+0.2459` (`0.007813`)** | **`+0.0572` (`0.046875`)** | `+0.1287` (`0.007813`) |

**Key Family-Specific Discoveries:**
1. **Stationary Efficiency vs. Skeptical Over-Probing (`FAM_A`):** `B_EVIDENTIALISTS` achieves near-oracle performance (`0.9721`, `100.0%` terminal claim accuracy, `0.0000` Brier score, `2.03` probes), significantly beating `C_PROVISIONALISTS` (`0.8699`, $\Delta = -0.1021$, $d_z = -7.71$, $p = 0.007813$), which wastes all `6.00/6` probes chasing noise, and `D_TEMPORAL_CUSTODIANS` (`0.9472`, $\Delta = -0.0249$, $p = 0.007813$), which pays a modest `0.0249` age-decay insurance cost.
2. **Action Utility vs. Scientific Truth Dissociation (`FAM_D`):** In `FAM_D`, the hidden mechanism shifts to a distinct slot $M_1 \neq M_0$ sharing the **same optimal intervention fiber** ($\pi_A(M_1) = \pi_A(M_0)$). `A_MONUMENTALISTS` attains high consequential action utility (`0.8404`, only `12.92%` suboptimal actions, `0.24` probes), yet suffers severe scientific-claim invalidity (`terminal_claim_accuracy = 0.3281`, `overconfident_false_claim_rate = 0.6649`) because it keeps asserting the superseded causal explanation $M_0$ at `0.9876` confidence.
3. **Recurrent Whipsaw Reversal (`FAM_E`, `Mon > Evi`):** Under cyclic regime transitions ($\text{Alpha} \to \text{Beta} \to \text{Alpha}$), `B_EVIDENTIALISTS` (`0.3941`) falls **significantly below `A_MONUMENTALISTS` (`0.4747`, $p = 0.007813$)** and matches `CTRL_NO_HISTORY` (`0.3976`, $p = 0.8594$). Because `Evi` integrates cumulative likelihoods without regime-context indexing, it updates mid-episode toward the transient Beta excursion and is caught out-of-phase when Alpha returns at $t = 12$. `D_TEMPORAL_CUSTODIANS` (`0.6167`) resolves this hysteresis ($+0.2227$ over `Evi`, $p = 0.007813$) by indexing ancestral calibration to observable regime context tags rather than discarding superseded records.
4. **Extreme-Delay Forgetting Advantage (`FAM_F`, `Prov > Cust`):** When physical sensor lag and institutional clearance lag compound (`FAM_F`), `C_PROVISIONALISTS` (`0.5716`) edges `D_TEMPORAL_CUSTODIANS` (`0.5593`) and beats `B_EVIDENTIALISTS` (`0.5144`, $p = 0.046875$): once delayed contradictions finally cross the availability gate late in the horizon, geometric recency discounting ($\gamma = 0.66$) sheds stale pre-blackout observations fastest.

---

## 5. Complete 18-Cell `(h, τ0, ν)` Authority-Reversal Response Surface

Each cell of the $3 \times 3 \times 2$ design grid aggregates `192` base worlds (`48` independent clusters; `96` episodes / `24` clusters in consequential-shift families `{B, C, F}`):

| Grid Cell (`h`, `τ0 = Δ_obs+Δ_adm`, `ν`) | $\chi_0$ | $\kappa_0$ | `U_Mon` | `U_Evi` | `U_Prov` | `U_Cust` | $\Delta U_{\text{Mon}-\text{Evi}}$ (Pooled, $p$) | $\Delta U_{\text{Mon}-\text{Evi}}$ (`{B,C,F}`, $p$) | $\Delta U_{\text{Mon}-\text{Evi}}$ (Calib `{A,D}`) | $\chi_{\text{eff}}$ (`Mon / Evi / Cust`) | $\kappa_{\text{eff}}$ (`Mon / Evi / Cust`) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- | --- |
| `H_LOW__L0_IMMEDIATE__V_DELIBERATIVE` | `0.00` | `0.00` | `0.6202` | `0.7610` | `0.7742` | **`0.8167`** | `-0.1408` (`0.000244`) | `-0.1812` (`0.000122`) | `-0.0967` | `0.10 / 0.07 / 0.05` | `0.87 / 0.61 / 0.42` |
| `H_LOW__L0_IMMEDIATE__V_ACCELERATED` | `0.00` | `0.00` | `0.6638` | `0.8087` | `0.7690` | **`0.8383`** | `-0.1449` (`0.000122`) | `-0.1951` (`0.000122`) | `-0.0592` | `0.10 / 0.05 / 0.03` | `2.57 / 1.37 / 0.72` |
| `H_LOW__L3_MODERATE__V_DELIBERATIVE` | `0.06` | `0.50` | `0.6487` | `0.6968` | `0.7554` | **`0.7659`** | `-0.0481` (`0.103625`) | `-0.0869` (`0.019773`) | **`+0.0065`** | `0.14 / 0.14 / 0.11` | `1.20 / 1.19 / 0.88` |
| `H_LOW__L3_MODERATE__V_ACCELERATED` | `0.06` | `1.50` | `0.6266` | `0.6951` | `0.7454` | **`0.7551`** | `-0.0684` (`0.018308`) | `-0.1127` (`0.006591`) | **`+0.0019`** | `0.15 / 0.15 / 0.10` | `3.78 / 3.71 / 2.43` |
| `H_LOW__L6_DELAYED__V_DELIBERATIVE` | `0.12` | `1.00` | `0.5807` | `0.6675` | `0.6456` | **`0.6798`** | `-0.0867` (`0.002319`) | `-0.0940` (`0.040034`) | **`+0.0193`** | `0.20 / 0.20 / 0.16` | `1.64 / 1.69 / 1.37` |
| `H_LOW__L6_DELAYED__V_ACCELERATED` | `0.12` | `3.00` | `0.6212` | `0.6918` | `0.6318` | `0.6785` | `-0.0706` (`0.008056`) | `-0.0776` (`0.107775`) | **`+0.0493`** | `0.19 / 0.19 / 0.16` | `4.81 / 4.80 / 3.90` |
| `H_MOD__L0_IMMEDIATE__V_DELIBERATIVE` | `0.00` | `0.00` | `0.4889` | `0.6986` | `0.7453` | **`0.7840`** | `-0.2097` (`0.000122`) | `-0.2757` (`0.000122`) | `-0.1279` | `0.69 / 0.48 / 0.33` | `1.44 / 1.00 / 0.69` |
| `H_MOD__L0_IMMEDIATE__V_ACCELERATED` | `0.00` | `0.00` | `0.5176` | `0.6886` | `0.7464` | **`0.7821`** | `-0.1710` (`0.000122`) | `-0.2166` (`0.000122`) | `-0.1106` | `0.67 / 0.44 / 0.25` | `4.16 / 2.75 / 1.57` |
| `H_MOD__L3_MODERATE__V_DELIBERATIVE` | `0.24` | `0.50` | `0.4546` | `0.5612` | `0.6486` | **`0.6641`** | `-0.1066` (`0.000854`) | `-0.1236` (`0.009398`) | `-0.0795` | `0.87 / 0.83 / 0.63` | `1.82 / 1.72 / 1.31` |
| `H_MOD__L3_MODERATE__V_ACCELERATED` | `0.24` | `1.50` | `0.4966` | `0.5165` | `0.6524` | **`0.6679`** | `-0.0198` (`0.481753`) | `+0.0003` (`0.991944`) | `-0.0537` | `0.78 / 0.78 / 0.49` | `4.86 / 4.85 / 3.09` |
| `H_MOD__L6_DELAYED__V_DELIBERATIVE` | `0.48` | `1.00` | `0.4419` | `0.4474` | **`0.5337`** | `0.5111` | `-0.0055` (`0.861223`) | `+0.0136` (`0.779690`) | `-0.0207` | `0.95 / 0.90 / 0.76` | `1.97 / 1.88 / 1.59` |
| `H_MOD__L6_DELAYED__V_ACCELERATED` | `0.48` | `3.00` | `0.4479` | `0.4303` | `0.5044` | **`0.5054`** | **`+0.0176` (`0.653729`)** | `+0.0299` (`0.522641`) | `-0.0720` | `0.95 / 0.88 / 0.74` | `5.92 / 5.47 / 4.65` |
| `H_HIGH__L0_IMMEDIATE__V_DELIBERATIVE` | `0.00` | `0.00` | `0.4482` | `0.7441` | `0.7438` | **`0.8228`** | `-0.2959` (`0.000122`) | **`-0.4269` (`0.000122`)** | `-0.1197` | `2.13 / 1.29 / 0.94` | `1.78 / 1.07 / 0.79` |
| `H_HIGH__L0_IMMEDIATE__V_ACCELERATED` | `0.00` | `0.00` | `0.4240` | `0.7280` | `0.7274` | **`0.8281`** | **`-0.3041` (`0.000122`)** | `-0.4206` (`0.000122`) | `-0.1308` | `2.01 / 1.11 / 0.59` | `5.03 / 2.76 / 1.46` |
| `H_HIGH__L3_MODERATE__V_DELIBERATIVE` | `0.60` | `0.50` | `0.4045` | `0.5689` | `0.6103` | **`0.7182`** | `-0.1644` (`0.000122`) | `-0.1647` (`0.000122`) | `-0.1072` | `2.48 / 2.36 / 1.82` | `2.07 / 1.97 / 1.52` |
| `H_HIGH__L3_MODERATE__V_ACCELERATED` | `0.60` | `1.50` | `0.3942` | `0.5759` | `0.6101` | **`0.7373`** | `-0.1817` (`0.000122`) | `-0.2054` (`0.000122`) | `-0.0802` | `2.40 / 1.92 / 1.31` | `6.00 / 4.81 / 3.27` |
| `H_HIGH__L6_DELAYED__V_DELIBERATIVE` | `1.20` | `1.00` | `0.3480` | `0.4884` | `0.4424` | **`0.5685`** | `-0.1404` (`0.000122`) | `-0.1398` (`0.021848`) | `-0.0838` | `2.92 / 2.64 / 2.33` | `2.44 / 2.20 / 1.94` |
| `H_HIGH__L6_DELAYED__V_ACCELERATED` | `1.20` | `3.00` | `0.3553` | `0.4860` | `0.4298` | **`0.5548`** | `-0.1307` (`0.000122`) | `-0.1199` (`0.008056`) | `-0.0793` | `2.78 / 2.49 / 2.13` | `6.95 / 6.24 / 5.32` |

### 5.1 Three Structural Regimes Revealed Across the Response Surface

1. **Pure Evaluation-Latency Divergence at `L0_IMMEDIATE` ($\tau_0 = 0, \chi_0 = 0, \kappa_0 = 0$):**
   Even when exogenous observation and admission latencies are identically zero ($\chi_0 = 0, \kappa_0 = 0$), **endogenous policy evaluation latency ($\tau_{\text{eval}}$)** generates massive effective exposures for `A_MONUMENTALISTS` ($\chi_{\text{eff}} = 2.01$, $\kappa_{\text{eff}} = 5.03$ at `H_HIGH__L0_IMMEDIATE__V_ACCELERATED`), driving $\Delta U_{\text{Mon}-\text{Evi}} = -0.3041$ overall and **`-0.4269` ($d_z = -2.44$, $p = 0.000122$)** in consequential shift families `{B, C, F}`. Exogenous $(\chi_0, \kappa_0) = (0, 0)$ completely misses this failure!
2. **Calibrated Stationary Crossover (`+0.0019` to `+0.0493` in Calibrated `{A, D}` under `H_LOW` + Delay):**
   In calibrated-founder action-stable regimes (`{A, D}`) at `H_LOW` under moderate or delayed admission (`L3`, `L6`), `A_MONUMENTALISTS` achieves a positive net advantage over `B_EVIDENTIALISTS` (`+0.0019` to `+0.0493`) because prestige inertia avoids expending costly diagnostic probes while noisy/delayed passive streams remain ambiguous.
3. **Institutional Blackout Compression at `H_MOD` + `L6_DELAYED`:**
   Moving from `L0` to `L6` (`Δ_obs = 2, Δ_adm = 4`) at `H_MOD` compresses $\Delta U_{\text{Mon}-\text{Evi}}$ from `-0.2097` ($p = 0.000122$) to `-0.0055` ($p = 0.8612$) / `+0.0176` ($p = 0.6537$), dragging `B_EVIDENTIALISTS` down from `0.6986` to `0.4303`! Why? Because when shifts occur mid-horizon ($t \approx 9\text{--}14$) and institutional admissionwithholds contradictory evidence for `6` ticks ($\tau_0 = 6$), **even a perfectly calibrated Evidentialist updater cannot act on evidence trapped behind the custodial gate**. Meanwhile, `C_PROVISIONALISTS` collapses under `H_HIGH__L6_DELAYED__V_ACCELERATED` (`U = 0.4298`, `O4 = 0.9244`) because early probe exhaustion (`6/6` probes spent before contradictions clear admission) leaves it blind once the delayed shock arrives.

---

## 6. Causal Interaction, Endogenous Latency Decomposition, $(\chi, \kappa)$ Sufficiency, and $\lambda$-Sensitivity

### 6.1 Randomized Hazard Interaction vs. Exploratory Latency Mediation

Per PR `#1699` Review Finding `#7`, we strictly separate **randomized design causal contrasts** from **exploratory observational mediation**:

- **Randomized Design Causal Contrast (`RANDOMIZED_DESIGN_CAUSAL_CONTRAST`):**
  $$\mathbb{E}\big[(U_{\text{Mon}} - U_{\text{Evi}} \mid h = 0.20) - (U_{\text{Mon}} - U_{\text{Evi}} \mid h = 0.02)\big] = -0.1096 \quad (95\%\text{ CI }[-0.1475, -0.0726],\; d_z = -0.8074,\; p = 0.000122)$$
  Restricted to consequential shift families `{B, C, F}` (`K = 24` clusters): **`-0.1216`** ($95\%$ CI $[-0.1899, -0.0543]$, $d_z = -0.7288$, $p = 0.002197$). Accelerating environmental hazard causally widens the Monumentalist penalty.
- **Exploratory Observational Mediation (`EXPLORATORY_OBSERVATIONAL_MEDIATION_NOT_RANDOMIZED_INDIRECT_EFFECT`):**
  Across the `1,881` paired contradiction episodes, `A_MONUMENTALISTS` incurs `+2.6592` additional ticks of censored evaluation latency relative to `B_EVIDENTIALISTS`, with an OLS slope of `-0.0351` utility per latency tick — accounting associatively for `-0.0933` of the `-0.0959` utility gap in that subset (`-0.0025` residual direct component). Because $\Delta \tau_{\text{eval}}$ is an endogenous policy realization rather than an independently randomized instrument, this decomposition is mechanistic/associative rather than a randomized natural indirect effect.

### 6.2 Candidate Dimensionless Quantities $(\chi = h\tau,\; \kappa = \nu\tau)$: Explanatory Power & Non-Sufficiency

| Family Stratum | $\text{Corr}(\chi_0, \text{Regret})$ | $\text{Corr}(\chi_{\text{eff}}, \text{Regret})$ | $\text{Corr}(\kappa_0, \text{Regret})$ | $\text{Corr}(\kappa_{\text{eff}}, \text{Regret})$ | Sufficiency Status |
| --- | ---: | ---: | ---: | ---: | --- |
| **Consequential Shift `{B, C, F}`** | `+0.3081` | **`+0.5380`** | `+0.1948` | **`+0.5984`** | Strong explanatory power once endogenous $\tau_{\text{eval}}$ is included |
| **Stationary / Invariant / Recurrent `{A, D, E}`** | `n/a` / weak | `+0.3890` | `n/a` / weak | `+0.3326` | **Insufficient** — mediated by calibration quality, $\pi_A$ fiber equivalence, and recurrence phase |

**Verdict (`NOT_UNIVERSALLY_SUFFICIENT`):** Exogenous design ratios $(\chi_0, \kappa_0)$ poorly predict regret (`r = 0.3081`, `0.1948`) because they omit policy-generated validation delay $\tau_{\text{eval}}$. Endogenous effective ratios $(\chi_{\text{eff}}, \kappa_{\text{eff}})$ nearly double explanatory correlation in `{B, C, F}` (`r = 0.5380`, `0.5984`), yet still fail as universal sufficient statistics across `{A, D, E}` because identical $(\chi_{\text{eff}}, \kappa_{\text{eff}})$ yields opposite consequential outcomes depending on (i) whether the shift crosses an action-equivalence fiber (`FAM_D`), (ii) whether an ancestral regime recurs (`FAM_E`), and (iii) whether senior claims were calibrated at $t = 0$.

### 6.3 Authority-Weight Sensitivity Sweep ($\lambda \in \{0.50, 1.00, 1.75\}$ at `H_MOD__L3_MODERATE__V_ACCELERATED`)

| Prior-Strength Multiplier $\lambda$ | `A_MONUMENTALISTS` (`U` / `O4` / Probes) | `B_EVIDENTIALISTS` (`U` / `O4` / Probes) | `C_PROVISIONALISTS` (`U` / `O4` / Probes) | `D_TEMPORAL_CUSTODIANS` (`U` / `O4` / Probes) |
| --- | --- | --- | --- | --- |
| **$\lambda = 0.50$ (Attenuated History)** | `0.5098` / `0.6657` / `0.56` | `0.4482` / `0.7691` / `4.00` | **`0.6635`** / `0.6194` / `6.00` | `0.6062` / **`0.5430`** / `5.12` |
| **$\lambda = 1.00$ (Preregistered Primary)** | `0.4966` / `0.6235` / `0.17` | `0.5165` / `0.7043` / `3.41` | `0.6524` / `0.5557` / `6.00` | **`0.6679`** / **`0.4512`** / `4.85` |
| **$\lambda = 1.75$ (Amplified History)** | `0.4737` / `0.6255` / `0.04` | `0.5575` / `0.7032` / `2.26` | `0.6133` / `0.5147` / `6.00` | **`0.7356`** / **`0.3510`** / `3.55` |

Increasing historical prior commitment $\lambda$ from `0.50` to `1.75` **monotonically degrades `A_MONUMENTALISTS`** (`0.5098 -> 0.4737`) while **monotonically improving `D_TEMPORAL_CUSTODIANS` (`0.6062 -> 0.7356`, cutting post-availability error from `0.5430` to `0.3510` and saving `1.57` probes)**. Epistemic inheritance itself is not the hazard: *unconditional prestige commitment* turns stronger historical weight into rigidity, whereas *context- and calibration-conditioned commitment* turns stronger historical weight into faster, more frugal correction.

---

**Claim Ceiling:** All findings above are bounded mathematical/computational results over the preregistered 192-world synthetic ensemble (`INTERNALLY_SEPARATED_SINGLE_SUPERVISING_MODEL`). Human scientific interpretation, source admission, merge, deployment, and closure remain `RESERVED`.
